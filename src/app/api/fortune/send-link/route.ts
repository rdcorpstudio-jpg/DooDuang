import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireDb } from "@/lib/db";
import { readings } from "@/lib/db/schema";
import { isMailConfigured, sendReadingLinkEmail } from "@/lib/mail";
import { getSiteUrl } from "@/lib/site";
import { READING_OPTIONS } from "@/lib/fortune/zodiac";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!token) {
      return NextResponse.json({ error: "ไม่พบผลดูดวง" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "กรุณากรอกอีเมลให้ถูกต้อง" }, { status: 400 });
    }
    if (!isMailConfigured()) {
      return NextResponse.json({ error: "ยังไม่ได้ตั้งค่า SMTP" }, { status: 503 });
    }

    const db = requireDb();
    const [reading] = await db
      .select()
      .from(readings)
      .where(eq(readings.shareToken, token))
      .limit(1);

    if (!reading) {
      return NextResponse.json({ error: "ไม่พบผลดูดวง" }, { status: 404 });
    }

    await db
      .update(readings)
      .set({ email })
      .where(eq(readings.shareToken, token));

    const nickname = (() => {
      try {
        const input = reading.input ? JSON.parse(reading.input) : {};
        return typeof input.nickname === "string" ? input.nickname : "คุณ";
      } catch {
        return "คุณ";
      }
    })();

    const readingTitle =
      READING_OPTIONS.find((option) => option.id === reading.type)?.title ?? "ดูดวง";

    await sendReadingLinkEmail({
      to: email,
      nickname,
      readingTitle,
      url: `${getSiteUrl()}/r/${token}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to send reading link:", err);
    return NextResponse.json({ error: "ส่งเมลไม่สำเร็จ ลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
