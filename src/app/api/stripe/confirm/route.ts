import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type Stripe from "stripe";
import { stripe, PREMIUM_UNLOCK } from "@/lib/stripe";
import { FORTUNE_PACKAGE_DAYS, FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import {
  applyOneTimePremiumCheckout,
  applyStripeSubscription,
  recordPayment,
} from "@/lib/premium-entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function stripeId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function daysFromCheckout(checkout: {
  metadata?: Stripe.Metadata | null;
}) {
  const raw = checkout.metadata?.days ?? checkout.metadata?.months;
  const n = raw ? Number(raw) : NaN;
  // Legacy: months metadata → approximate days
  if (
    Number.isFinite(n) &&
    n > 0 &&
    checkout.metadata?.days == null &&
    checkout.metadata?.months != null
  ) {
    return Math.floor(n) * 30;
  }
  if (Number.isFinite(n) && n > 0) return Math.floor(n);
  return FORTUNE_PACKAGE_DAYS;
}

/** Verify Stripe Checkout session after redirect and unlock premium. */
export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe ยังไม่ได้ตั้งค่า" },
        { status: 503 }
      );
    }

    const body = (await request.json().catch(() => null)) as {
      sessionId?: string;
    } | null;
    const sessionId =
      typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
    if (!sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "session ไม่ถูกต้อง" }, { status: 400 });
    }

    const checkout = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });
    const paid =
      checkout.payment_status === "paid" ||
      checkout.payment_status === "no_payment_required";
    if (!paid) {
      return NextResponse.json(
        {
          error: "ยังไม่ได้ชำระเงิน หรือรอ Confirm จาก PromptPay",
          code: "PAYMENT_PENDING",
          paid: false,
        },
        { status: 402 }
      );
    }

    const amount =
      typeof checkout.amount_total === "number"
        ? Math.round(checkout.amount_total / 100)
        : FORTUNE_UNLOCK_PRICE;

    const authSession = await auth();
    // Cookie often drops after Stripe redirect (Safari / in-app). Still tell the
    // client the charge is paid so thank-you page can fire Purchase pixels.
    if (!authSession?.user) {
      return NextResponse.json(
        {
          ok: true,
          paid: true,
          premiumUnlocked: false,
          code: "UNAUTHENTICATED",
          amount,
          error: "ต้องเข้าสู่ระบบก่อน",
        },
        { status: 401 }
      );
    }

    const metaUser = checkout.metadata?.userId || checkout.client_reference_id;
    if (metaUser && metaUser !== authSession.user.id) {
      return NextResponse.json({ error: "บัญชีไม่ตรงกับการชำระ" }, { status: 403 });
    }

    const purpose = checkout.metadata?.purpose || "premium-unlock";
    const packageId = checkout.metadata?.packageId || PREMIUM_UNLOCK.id;
    const credits = parseInt(checkout.metadata?.credits ?? "0", 10);

    // Legacy subscription checkouts (if any still open)
    if (checkout.mode === "subscription") {
      const rawSub = checkout.subscription;
      const subscription =
        rawSub && typeof rawSub !== "string"
          ? rawSub
          : stripeId(rawSub)
            ? await stripe.subscriptions.retrieve(stripeId(rawSub)!)
            : null;

      const applied = subscription
        ? await applyStripeSubscription({
            userId: authSession.user.id,
            subscription,
          })
        : null;

      try {
        await recordPayment({
          userId: authSession.user.id,
          stripeRef: checkout.id,
          amount,
          credits,
        });
      } catch (err) {
        console.error("Confirm payment DB write failed:", err);
      }

      return NextResponse.json({
        ok: true,
        paid: true,
        purpose,
        packageId,
        premiumUnlocked: applied?.premium ?? false,
        premiumUntil: applied?.premiumUntil?.toISOString() ?? null,
        subscriptionStatus: applied?.status ?? null,
      });
    }

    const applied = await applyOneTimePremiumCheckout({
      userId: authSession.user.id,
      checkoutSession: checkout,
      days: daysFromCheckout(checkout),
      amount,
      credits,
    });

    return NextResponse.json({
      ok: true,
      paid: true,
      purpose,
      packageId,
      premiumUnlocked: Boolean(applied?.premium),
      premiumUntil: applied?.premiumUntil?.toISOString() ?? null,
      subscriptionStatus: applied?.status ?? "active",
    });
  } catch (err) {
    console.error("Stripe confirm failed:", err);
    return NextResponse.json({ error: "ยืนยันการชำระไม่สำเร็จ" }, { status: 500 });
  }
}
