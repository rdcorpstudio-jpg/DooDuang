import { NextResponse } from "next/server";
import { normalizeThaiMobile } from "@/lib/phone";
import {
  clientIp,
  invalidatePhoneOtp,
  issuePhoneOtp,
  shouldEchoOtp,
} from "@/lib/phone-otp";
import { otpSmsMessage, sendSms } from "@/lib/sms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const rawPhone = typeof body?.phone === "string" ? body.phone : "";
    const phone = normalizeThaiMobile(rawPhone);

    if (!phone) {
      return NextResponse.json(
        { error: "เบอร์มือถือไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const issued = await issuePhoneOtp(phone, clientIp(request));
    if (!issued.ok) {
      return NextResponse.json(
        {
          error:
            issued.error === "cooldown"
              ? "ส่งรหัสได้ใหม่ในอีกสักครู่"
              : "ส่งรหัสบ่อยเกินไป กรุณาลองใหม่ภายหลัง",
          retryAfterSec: issued.retryAfterSec,
        },
        { status: 429 }
      );
    }

    try {
      await sendSms({
        to: phone,
        message: otpSmsMessage(issued.code, issued.expiresIn),
      });
    } catch (err) {
      console.error("Phone OTP SMS failed:", err);
      await invalidatePhoneOtp(issued.id).catch(() => {});
      return NextResponse.json(
        { error: "ส่งรหัสไม่สำเร็จ กรุณาลองใหม่" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      expiresIn: issued.expiresIn,
      ...(shouldEchoOtp() ? { devCode: issued.code } : {}),
    });
  } catch (err) {
    console.error("Phone OTP send failed:", err);
    const message = err instanceof Error ? err.message : "";
    if (message.includes("AUTH_SECRET") || message.includes("DATABASE_URL")) {
      return NextResponse.json(
        { error: "เซิร์ฟเวอร์ยังตั้งค่าไม่ครบ" },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "ส่งรหัสไม่สำเร็จ" }, { status: 500 });
  }
}
