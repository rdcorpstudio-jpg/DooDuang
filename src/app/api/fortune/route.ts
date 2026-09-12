import { NextResponse } from "next/server";
import { generateReading } from "@/lib/fortune/generate";
import { READING_OPTIONS, type ReadingType } from "@/lib/fortune/zodiac";

export const runtime = "nodejs";
export const maxDuration = 15;

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

    const fortune = await generateReading(type, profile);

    const { auth } = await import("@/lib/auth");
    const { readingTypeToFeature } = await import("@/lib/analytics/events");
    const { trackEvent } = await import("@/lib/analytics/track");
    const session = await auth();
    void trackEvent({
      name: "feature_complete",
      userId: session?.user?.id,
      feature: readingTypeToFeature(type),
      props: { readingType: type },
    });

    // Do not persist readings to DB (avoids history bloat). Share links disabled.
    return NextResponse.json({
      title: fortune.title,
      preview: fortune.preview,
      tabs: fortune.tabs,
      highlights: fortune.highlights,
      premium: fortune.premium,
      shareToken: null,
    });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
