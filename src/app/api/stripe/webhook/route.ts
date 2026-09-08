import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { stripe, CREDIT_PACKAGES } from "@/lib/stripe";
import { requireDb } from "@/lib/db";
import { users, payments } from "@/lib/db/schema";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const packageId = session.metadata?.packageId;
    const purpose = session.metadata?.purpose;
    const credits = parseInt(session.metadata?.credits ?? "0", 10);

    if (!userId) {
      return NextResponse.json({ received: true });
    }

    try {
      const db = requireDb();
      const existing = await db
        .select({ id: payments.id })
        .from(payments)
        .where(eq(payments.stripeSessionId, session.id))
        .limit(1);

      if (!existing[0]) {
        const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
        const amount =
          purpose === "premium-unlock"
            ? FORTUNE_UNLOCK_PRICE
            : (pkg?.price ??
              (typeof session.amount_total === "number"
                ? Math.round(session.amount_total / 100)
                : 0));

        await db.insert(payments).values({
          userId,
          stripeSessionId: session.id,
          amount,
          credits,
          status: "completed",
        });
      }

      if (credits > 0) {
        await db
          .update(users)
          .set({ credits: sql`${users.credits} + ${credits}` })
          .where(eq(users.id, userId));
      }
    } catch (err) {
      console.error("Webhook DB error:", err);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
