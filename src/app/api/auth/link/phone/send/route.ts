import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  clientIp,
  invalidatePhoneOtp,
  issuePhoneOtp,
  shouldEchoOtp,
} from "@/lib/phone-otp";
import { normalizeThaiMobile } from "@/lib/phone";
import { otpSmsMessage, sendSms } from "@/lib/sms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "ต้องเข้าสู่ระบบก่อน", code: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => null)) as {
      phone?: string;
    } | null;
    const phone = normalizeThaiMobile(
      typeof body?.phone === "string" ? body.phone : ""
    );
    if (!phone) {
      return NextResponse.json(
        { error: "กรอกเบอร์มือถือไทยให้ถูกต้อง" },
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
          code: issued.error,
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
      console.error("Link phone SMS failed:", err);
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
    console.error("Link phone send failed:", err);
    return NextResponse.json({ error: "ส่งรหัสไม่สำเร็จ" }, { status: 500 });
  }
}
