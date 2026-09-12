import { NextResponse } from "next/server";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";
import { consumePhoneOtp, upsertUserByPhone } from "@/lib/phone-otp";
import { normalizeThaiMobile } from "@/lib/phone";
import { createPremiumCheckoutUrl } from "@/lib/stripe";
import { PREMIUM_UNLOCK } from "@/lib/stripe-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const rawPhone = typeof body?.phone === "string" ? body.phone : "";
    const code = typeof body?.code === "string" ? body.code : "";
    const wantCheckout = body?.checkout === true;
    const returnPath =
      typeof body?.returnPath === "string" ? body.returnPath : "/premium";

    const phone = normalizeThaiMobile(rawPhone);
    if (!phone) {
      return NextResponse.json(
        { error: "เบอร์มือถือไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const checked = await consumePhoneOtp(phone, code);
    if (!checked.ok) {
      if (checked.error === "locked") {
        return NextResponse.json(
          { error: "ใส่รหัสผิดหลายครั้ง กรุณาขอรหัสใหม่" },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "รหัสไม่ถูกต้องหรือหมดอายุ" },
        { status: 401 }
      );
    }

    const { userId, isNewUser } = await upsertUserByPhone(phone);

    if (isNewUser) {
      const { notifyNewRegistration } = await import("@/lib/line-group-notify");
      notifyNewRegistration({
        channel: "phone",
        userId,
        phone,
      });
    }

    let checkoutUrl: string | undefined;
    if (wantCheckout) {
      checkoutUrl = await createPremiumCheckoutUrl({
        userId,
        origin: new URL(request.url).origin,
        returnPath,
        packageId: PREMIUM_UNLOCK.id,
      });
    }

    const token = await createSessionToken(userId);
    const response = NextResponse.json(
      checkoutUrl
        ? { ok: true, isNewUser, checkoutUrl }
        : { ok: true, isNewUser }
    );
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (err) {
    console.error("Phone OTP verify failed:", err);
    const message = err instanceof Error ? err.message : "";
    if (message.includes("AUTH_SECRET") || message.includes("DATABASE_URL")) {
      return NextResponse.json(
        { error: "เซิร์ฟเวอร์ยังตั้งค่าไม่ครบ" },
        { status: 500 }
      );
    }
    if (message.toLowerCase().includes("stripe") || message.toLowerCase().includes("price")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: "เข้าสู่ระบบไม่สำเร็จ" }, { status: 500 });
  }
}
