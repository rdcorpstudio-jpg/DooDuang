import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { linkPhoneToUser } from "@/lib/account-links";
import { consumePhoneOtp } from "@/lib/phone-otp";
import { normalizeThaiMobile } from "@/lib/phone";

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
      code?: string;
    } | null;
    const phone = normalizeThaiMobile(
      typeof body?.phone === "string" ? body.phone : ""
    );
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    if (!phone) {
      return NextResponse.json(
        { error: "กรอกเบอร์มือถือไทยให้ถูกต้อง" },
        { status: 400 }
      );
    }
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "รหัส OTP ไม่ถูกต้อง" }, { status: 400 });
    }

    const checked = await consumePhoneOtp(phone, code);
    if (!checked.ok) {
      const message =
        checked.error === "locked"
          ? "ใส่รหัสผิดหลายครั้ง กรุณาขอรหัสใหม่"
          : "รหัสไม่ถูกต้องหรือหมดอายุแล้ว";
      return NextResponse.json(
        { error: message, code: checked.error },
        { status: 400 }
      );
    }

    const linked = await linkPhoneToUser(session.user.id, phone);
    if (!linked.ok) {
      if (linked.error === "taken") {
        return NextResponse.json(
          {
            error: "เบอร์นี้ถูกใช้กับบัญชีอื่นแล้ว",
            code: "TAKEN",
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "เชื่อมเบอร์ไม่สำเร็จ" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, already: linked.already ?? false });
  } catch (err) {
    console.error("Link phone verify failed:", err);
    return NextResponse.json({ error: "ยืนยันเบอร์ไม่สำเร็จ" }, { status: 500 });
  }
}
