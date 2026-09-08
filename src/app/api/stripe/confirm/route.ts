import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { requireDb } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    if (checkout.payment_status !== "paid") {
      return NextResponse.json({ error: "ยังไม่ได้ชำระเงิน" }, { status: 402 });
    }

    const metaUser = checkout.metadata?.userId;
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

    try {
      const db = requireDb();
      const existing = await db
        .select({ id: payments.id })
        .from(payments)
        .where(eq(payments.stripeSessionId, checkout.id))
        .limit(1);

      if (!existing[0]) {
        await db.insert(payments).values({
          userId: session.user.id,
          stripeSessionId: checkout.id,
          amount,
          credits,
          status: "completed",
        });
      }
    } catch (err) {
      console.error("Confirm payment DB write failed:", err);
    }

    return NextResponse.json({
      ok: true,
      purpose,
      packageId,
      premiumUnlocked:
        purpose === "premium-unlock" || packageId === "premium-unlock",
    });
  } catch (err) {
    console.error("Stripe confirm failed:", err);
    return NextResponse.json({ error: "ยืนยันการชำระไม่สำเร็จ" }, { status: 500 });
  }
}
