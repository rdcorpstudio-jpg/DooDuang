import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { auth, type Session } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { payments, users } from "@/lib/db/schema";

const ACCESS_STATUSES = new Set(["active", "trialing", "past_due"]);

export function subscriptionPeriodEnd(sub: Stripe.Subscription): Date | null {
  const unix =
    typeof sub.current_period_end === "number" ? sub.current_period_end : null;
  if (!unix) return null;
  return new Date(unix * 1000);
}

export function hasPremiumAccess(opts: {
  status?: string | null;
  until?: Date | null;
}) {
  if (!opts.until || opts.until.getTime() <= Date.now()) return false;
  if (!opts.status) return true;
  return ACCESS_STATUSES.has(opts.status);
}

/** Logged-in user with active premium, or null. */
export async function requirePremiumSession(): Promise<{
  session: Session;
  premiumUntil: Date | null;
  status: string | null;
} | null> {
  const session = await auth();
  if (!session?.user) return null;
  const until = session.user.premiumUntil ?? null;
  const status = session.user.subscriptionStatus ?? null;
  if (!hasPremiumAccess({ status, until })) return null;
  return { session, premiumUntil: until, status };
}

export async function findUserIdForStripe(opts: {
  userId?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
}) {
  if (opts.userId) return opts.userId;
  const db = requireDb();

  if (opts.customerId) {
    const [byCustomer] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.stripeCustomerId, opts.customerId))
      .limit(1);
    if (byCustomer) return byCustomer.id;
  }

  if (opts.subscriptionId) {
    const [bySub] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.stripeSubscriptionId, opts.subscriptionId))
      .limit(1);
    if (bySub) return bySub.id;
  }

  return null;
}

function stripeId(
  value:
    | string
    | Stripe.Customer
    | Stripe.DeletedCustomer
    | Stripe.Subscription
    | null
    | undefined
) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export async function applyStripeSubscription(opts: {
  userId?: string | null;
  subscription: Stripe.Subscription;
}) {
  const customerId = stripeId(opts.subscription.customer);
  const userId = await findUserIdForStripe({
    userId: opts.userId || opts.subscription.metadata?.userId || null,
    customerId,
    subscriptionId: opts.subscription.id,
  });
  if (!userId) return null;

  const status = opts.subscription.status;
  const periodEnd = subscriptionPeriodEnd(opts.subscription);
  const until =
    status === "canceled" ||
    status === "unpaid" ||
    status === "incomplete_expired"
      ? new Date()
      : periodEnd;

  const db = requireDb();
  await db
    .update(users)
    .set({
      stripeCustomerId: customerId,
      stripeSubscriptionId: opts.subscription.id,
      subscriptionStatus: status,
      premiumUntil: until,
    })
    .where(eq(users.id, userId));

  return {
    userId,
    status,
    premiumUntil: until,
    premium: hasPremiumAccess({ status, until }),
  };
}

export async function recordPayment(opts: {
  userId: string;
  stripeRef: string;
  amount: number;
  credits?: number;
}) {
  const db = requireDb();
  const [existing] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.stripeSessionId, opts.stripeRef))
    .limit(1);
  if (existing) return;

  await db.insert(payments).values({
    userId: opts.userId,
    stripeSessionId: opts.stripeRef,
    amount: opts.amount,
    credits: opts.credits ?? 0,
    status: "completed",
  });
}

export async function getUserSubscription(userId: string) {
  const db = requireDb();
  const [user] = await db
    .select({
      stripeCustomerId: users.stripeCustomerId,
      stripeSubscriptionId: users.stripeSubscriptionId,
      subscriptionStatus: users.subscriptionStatus,
      premiumUntil: users.premiumUntil,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user ?? null;
}

/** Extend premium_until by calendar months from now or current until. */
export async function extendPremiumUntil(
  userId: string,
  months: number,
  opts?: { status?: string }
) {
  const db = requireDb();
  const existing = await getUserSubscription(userId);
  const now = Date.now();
  const current = existing?.premiumUntil?.getTime() ?? 0;
  const base = current > now ? new Date(current) : new Date(now);
  const until = new Date(base.getTime());
  until.setMonth(until.getMonth() + months);

  await db
    .update(users)
    .set({
      premiumUntil: until,
      subscriptionStatus:
        opts?.status ?? existing?.subscriptionStatus ?? "active",
    })
    .where(eq(users.id, userId));

  return until;
}
