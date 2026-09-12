import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { stripe, CREDIT_PACKAGES } from "@/lib/stripe";
import { requireDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import {
  applyStripeSubscription,
  recordPayment,
} from "@/lib/premium-entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function stripeId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function loadSubscription(id: string | null) {
  if (!id || !stripe) return null;
  return stripe.subscriptions.retrieve(id);
}

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId || session.client_reference_id;
      const packageId = session.metadata?.packageId;
      const purpose = session.metadata?.purpose;
      const credits = parseInt(session.metadata?.credits ?? "0", 10);

      const subscription = await loadSubscription(stripeId(session.subscription));
      const applied = subscription
        ? await applyStripeSubscription({ userId, subscription })
        : null;
      const paidUserId = applied?.userId || userId;
      if (!paidUserId) {
        return NextResponse.json({ received: true });
      }

      const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
      const amount =
        purpose === "premium-unlock"
          ? FORTUNE_UNLOCK_PRICE
          : (pkg?.price ??
            (typeof session.amount_total === "number"
              ? Math.round(session.amount_total / 100)
              : 0));

      await recordPayment({
        userId: paidUserId,
        stripeRef: session.id,
        amount,
        credits,
      });

      if (credits > 0) {
        const db = requireDb();
        await db
          .update(users)
          .set({ credits: sql`${users.credits} + ${credits}` })
          .where(eq(users.id, paidUserId));
      }
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object;
      const subscription = await loadSubscription(stripeId(invoice.subscription));
      if (subscription) {
        const applied = await applyStripeSubscription({ subscription });
        if (applied?.userId) {
          await recordPayment({
            userId: applied.userId,
            stripeRef: invoice.id,
            amount:
              typeof invoice.amount_paid === "number"
                ? Math.round(invoice.amount_paid / 100)
                : 0,
          });
        }
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const subscription = await loadSubscription(stripeId(invoice.subscription));
      if (subscription) {
        await applyStripeSubscription({ subscription });
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await applyStripeSubscription({
        subscription: event.data.object,
      });
    }
  } catch (err) {
    console.error("Webhook DB error:", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
