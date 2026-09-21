import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { dreamAsks } from "@/lib/db/schema";
import {
  bangkokDayKey,
  generateDreamReading,
  parseDreamReading,
  type DreamReading,
} from "@/lib/fortune/dream-reading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

const MAX_DREAM = 400;

function payload(dream: string, reading: DreamReading, alreadyAsked: boolean) {
  return {
    asked: true,
    alreadyAsked,
    dream,
    reading,
    resets: "00:00 น.",
  };
}

async function todayRow(userId: string) {
  const db = requireDb();
  const dayKey = bangkokDayKey();
  const rows = await db
    .select()
    .from(dreamAsks)
    .where(and(eq(dreamAsks.userId, userId), eq(dreamAsks.dayKey, dayKey)))
    .limit(1);
  return { db, dayKey, row: rows[0] ?? null };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ user: null, asked: false });
  }

  try {
    const { row } = await todayRow(session.user.id);
    if (!row) {
      return NextResponse.json({ user: true, asked: false });
    }
    const reading = parseDreamReading(row.result);
    if (!reading) {
      return NextResponse.json({ user: true, asked: false });
    }
    return NextResponse.json({
      user: true,
      ...payload(row.dream, reading, true),
    });
  } catch (err) {
    console.error("dream GET failed:", err);
    return NextResponse.json({
      user: true,
      asked: false,
      error: "เปิดตำราไม่สำเร็จ ลองรีเฟรชอีกครั้ง",
    });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "ต้องเข้าสู่ระบบก่อน", code: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "ยังเปิดทำนายฝันไม่ได้", code: "NO_API_KEY" },
      { status: 503 },
    );
  }

  let dream = "";
  try {
    const body = (await request.json()) as { dream?: string };
    dream = body.dream?.trim() ?? "";
  } catch {
    dream = "";
  }

  if (dream.length < 4) {
    return NextResponse.json(
      { error: "เล่าความฝันอีกนิด ให้แม่จับสัญลักษณ์ได้" },
      { status: 400 },
    );
  }
  if (dream.length > MAX_DREAM) {
    return NextResponse.json(
      { error: "สั้นลงนิด เล่าแค่ภาพที่จำได้ชัด" },
      { status: 400 },
    );
  }

  try {
    const { db, dayKey, row } = await todayRow(session.user.id);
    if (row) {
      const reading = parseDreamReading(row.result);
      if (reading) {
        return NextResponse.json(payload(row.dream, reading, true));
      }
    }

    const reading = await generateDreamReading(dream);
    if (!reading) {
      return NextResponse.json(
        { error: "แม่เปิดตำราไม่สำเร็จ ลองอีกครั้ง" },
        { status: 502 },
      );
    }

    const inserted = await db
      .insert(dreamAsks)
      .values({
        userId: session.user.id,
        dayKey,
        dream,
        result: JSON.stringify(reading),
      })
      .onConflictDoNothing({
        target: [dreamAsks.userId, dreamAsks.dayKey],
      })
      .returning();

    if (inserted.length === 0) {
      const again = await todayRow(session.user.id);
      const saved = again.row ? parseDreamReading(again.row.result) : null;
      if (again.row && saved) {
        return NextResponse.json(payload(again.row.dream, saved, true));
      }
    }

    return NextResponse.json(payload(dream, reading, false));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
