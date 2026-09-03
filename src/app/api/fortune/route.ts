import { NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { readings } from "@/lib/db/schema";
import { generateExtendedFortune } from "@/lib/fortune/extended";
import { READING_OPTIONS, type ReadingType } from "@/lib/fortune/zodiac";
import { createShareToken } from "@/lib/site";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, realName, nickname, birthDate, gender } = body as {
      type: ReadingType;
      realName?: string;
      nickname?: string;
      birthDate?: string;
      gender?: string;
    };

    const readingOption = READING_OPTIONS.find((o) => o.id === type);
    if (!readingOption) {
      return NextResponse.json({ error: "ประเภทดูดวงไม่ถูกต้อง" }, { status: 400 });
    }

    const trimmedName = realName?.trim();
    const trimmedNickname = nickname?.trim();

    if (!trimmedName) {
      return NextResponse.json({ error: "กรุณากรอกชื่อจริง" }, { status: 400 });
    }
    if (!trimmedNickname) {
      return NextResponse.json({ error: "กรุณากรอกชื่อเล่น" }, { status: 400 });
    }
    if (!birthDate) {
      return NextResponse.json({ error: "กรุณาเลือกวันเดือนปีเกิด" }, { status: 400 });
    }
    if (!gender || !["female", "male", "other"].includes(gender)) {
      return NextResponse.json({ error: "กรุณาเลือกเพศ" }, { status: 400 });
    }

    const profile = {
      realName: trimmedName,
      nickname: trimmedNickname,
      birthDate,
      gender,
    };

    const fortune = generateExtendedFortune(type, profile);
    const shareToken = createShareToken();

    try {
      const db = requireDb();
      await db.insert(readings).values({
        type,
        input: JSON.stringify(profile),
        result: JSON.stringify(fortune),
        shareToken,
        isPaid: false,
      });
    } catch (err) {
      console.error("Failed to save reading:", err);
      return NextResponse.json({
        title: fortune.title,
        preview: fortune.preview,
        tabs: fortune.tabs,
        highlights: fortune.highlights,
        premium: fortune.premium,
        shareToken: null,
      });
    }

    return NextResponse.json({
      title: fortune.title,
      preview: fortune.preview,
      tabs: fortune.tabs,
      highlights: fortune.highlights,
      premium: fortune.premium,
      shareToken,
    });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
