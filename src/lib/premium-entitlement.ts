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
  if (existing) return { inserted: false as const };
  await db.insert(payments).values({
    userId: opts.userId,
    stripeSessionId: opts.stripeRef,
    amount: opts.amount,
    credits: opts.credits ?? 0,
    status: "completed",
  });
  return { inserted: true as const };
}

export async function findPaymentByStripeRef(stripeRef: string) {
  const db = requireDb();
  const [existing] = await db
    .select({
      id: payments.id,
      userId: payments.userId,
    })
    .from(payments)
    .where(eq(payments.stripeSessionId, stripeRef))
    .limit(1);
  return existing ?? null;
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

/** Extend premium_until by calendar days from now or current until. */
export async function extendPremiumUntil(
  userId: string,
  days: number,
  opts?: { status?: string; customerId?: string | null }
) {
  const db = requireDb();
  const existing = await getUserSubscription(userId);
  const now = Date.now();
  const current = existing?.premiumUntil?.getTime() ?? 0;
  const baseMs = current > now ? current : now;
  const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 365;
  const until = new Date(baseMs + safeDays * 24 * 60 * 60 * 1000);

  await db
    .update(users)
    .set({
      premiumUntil: until,
      subscriptionStatus:
        opts?.status ?? existing?.subscriptionStatus ?? "active",
      ...(opts?.customerId
        ? { stripeCustomerId: opts.customerId }
        : {}),
    })
    .where(eq(users.id, userId));

  return until;
}

/**
 * One-time Checkout fulfillment — extend premium by days.
 * Idempotent via payments.stripe_session_id.
 */
export async function applyOneTimePremiumCheckout(opts: {
  userId?: string | null;
  checkoutSession: Stripe.Checkout.Session;
  days: number;
  amount: number;
  credits?: number;
}) {
  const session = opts.checkoutSession;
  const customerId = stripeId(session.customer);
  const userId = await findUserIdForStripe({
    userId: opts.userId || session.metadata?.userId || session.client_reference_id,
    customerId,
  });
  if (!userId) return null;

  const already = await findPaymentByStripeRef(session.id);
  if (already) {
    const existing = await getUserSubscription(userId);
    const until = existing?.premiumUntil ?? null;
    const status = existing?.subscriptionStatus ?? "active";
    return {
      userId,
      status,
      premiumUntil: until,
      premium: hasPremiumAccess({ status, until }),
      alreadyFulfilled: true as const,
    };
  }

  const until = await extendPremiumUntil(userId, opts.days, {
    status: "active",
    customerId,
  });

  await recordPayment({
    userId,
    stripeRef: session.id,
    amount: opts.amount,
    credits: opts.credits ?? 0,
  });

  return {
    userId,
    status: "active",
    premiumUntil: until,
    premium: hasPremiumAccess({ status: "active", until }),
    alreadyFulfilled: false as const,
  };
}
