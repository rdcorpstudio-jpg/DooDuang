import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
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

/** Verify Stripe Checkout session after redirect and unlock premium. */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "ต้องเข้าสู่ระบบก่อน", code: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

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
      checkout.payment_status === "paid" || checkout.status === "complete";
    if (!paid) {
      return NextResponse.json({ error: "ยังไม่ได้ชำระเงิน" }, { status: 402 });
    }

    const metaUser = checkout.metadata?.userId || checkout.client_reference_id;
    if (metaUser && metaUser !== session.user.id) {
      return NextResponse.json({ error: "บัญชีไม่ตรงกับการชำระ" }, { status: 403 });
    }

    const purpose = checkout.metadata?.purpose || "premium-unlock";
    const packageId = checkout.metadata?.packageId || "premium-unlock";
    const credits = parseInt(checkout.metadata?.credits ?? "0", 10);
    const amount =
      typeof checkout.amount_total === "number"
        ? Math.round(checkout.amount_total / 100)
        : FORTUNE_UNLOCK_PRICE;

    const rawSub = checkout.subscription;
    const subscription =
      rawSub && typeof rawSub !== "string"
        ? rawSub
        : stripeId(rawSub)
          ? await stripe.subscriptions.retrieve(stripeId(rawSub)!)
          : null;

    const applied = subscription
      ? await applyStripeSubscription({
          userId: session.user.id,
          subscription,
        })
      : null;

    try {
      await recordPayment({
        userId: session.user.id,
        stripeRef: checkout.id,
        amount,
        credits,
      });
    } catch (err) {
      console.error("Confirm payment DB write failed:", err);
    }

    const premiumUnlocked = applied
      ? applied.premium
      : purpose === "premium-unlock" || packageId === "premium-unlock";

    return NextResponse.json({
      ok: true,
      purpose,
      packageId,
      premiumUnlocked,
      premiumUntil: applied?.premiumUntil?.toISOString() ?? null,
      subscriptionStatus: applied?.status ?? null,
    });
  } catch (err) {
    console.error("Stripe confirm failed:", err);
    return NextResponse.json({ error: "ยืนยันการชำระไม่สำเร็จ" }, { status: 500 });
  }
}
