import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { phoneAsks } from "@/lib/db/schema";
import {
  getFortuneProfileForUser,
  normalizeFortuneProfileInput,
  rowToFortuneProfilePayload,
  type FortuneProfilePayload,
} from "@/lib/fortune/fortune-profile-db";
import {
  bangkokWeekKey,
  generatePhoneReading,
  isValidThaiMobile,
  normalizePhoneInput,
  parsePhoneReading,
  type PhoneReading,
} from "@/lib/fortune/phone-reading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function payload(phone: string, reading: PhoneReading, alreadyAsked: boolean) {
  return {
    asked: true,
    alreadyAsked,
    phone,
    reading,
    resets: "วันจันทร์ 00:00 น.",
  };
}

async function weekRow(userId: string) {
  const db = requireDb();
  const dayKey = bangkokWeekKey();
  const rows = await db
    .select()
    .from(phoneAsks)
    .where(and(eq(phoneAsks.userId, userId), eq(phoneAsks.dayKey, dayKey)))
    .limit(1);
  return { db, dayKey, row: rows[0] ?? null };
}

async function resolveProfile(
  userId: string,
  rawProfile: unknown,
): Promise<FortuneProfilePayload | null> {
  const row = await getFortuneProfileForUser(userId);
  if (row) return rowToFortuneProfilePayload(row);
  return normalizeFortuneProfileInput(
    rawProfile as Partial<FortuneProfilePayload> | null,
  );
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ user: null, asked: false });
  }

  try {
    const { row } = await weekRow(session.user.id);
    if (!row) {
      return NextResponse.json({ user: true, asked: false });
    }
    const reading = parsePhoneReading(row.result);
    if (!reading) {
      return NextResponse.json({ user: true, asked: false, stale: true });
    }
    return NextResponse.json({
      user: true,
      ...payload(row.phone, reading, true),
    });
  } catch (err) {
    console.error("phone GET failed:", err);
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
      { error: "ยังเปิดวิเคราะห์เบอร์ไม่ได้", code: "NO_API_KEY" },
      { status: 503 },
    );
  }

  let rawPhone = "";
  let rawProfile: unknown = null;
  try {
    const body = (await request.json()) as {
      phone?: string;
      profile?: unknown;
    };
    rawPhone = body.phone?.trim() ?? "";
    rawProfile = body.profile ?? null;
  } catch {
    rawPhone = "";
  }

  const phone = normalizePhoneInput(rawPhone);
  if (!isValidThaiMobile(phone)) {
    return NextResponse.json(
      { error: "ใส่เบอร์มือถือไทย 10 หลัก เช่น 08x-xxx-xxxx" },
      { status: 400 },
    );
  }

  const profile = await resolveProfile(session.user.id, rawProfile);
  if (!profile) {
    return NextResponse.json(
      {
        error: "กรอกโปรไฟล์ชื่อและวันเกิดก่อน แม่จะเทียบกับพื้นดวงได้",
        code: "NO_PROFILE",
      },
      { status: 400 },
    );
  }

  try {
    const { db, dayKey, row } = await weekRow(session.user.id);
    if (row) {
      const existing = parsePhoneReading(row.result);
      if (existing) {
        return NextResponse.json(payload(row.phone, existing, true));
      }
    }

    const reading = await generatePhoneReading(phone, profile);
    if (!reading) {
      return NextResponse.json(
        { error: "แม่เปิดตำราไม่สำเร็จ ลองอีกครั้ง" },
        { status: 502 },
      );
    }

    // Keep only the latest ask — drop older weeks when a new one is created
    await db.delete(phoneAsks).where(eq(phoneAsks.userId, session.user.id));

    const inserted = await db
      .insert(phoneAsks)
      .values({
        userId: session.user.id,
        dayKey,
        phone,
        result: JSON.stringify(reading),
      })
      .returning();

    if (inserted.length === 0) {
      return NextResponse.json(
        { error: "บันทึกไม่สำเร็จ ลองอีกครั้ง" },
        { status: 500 },
      );
    }

    return NextResponse.json(payload(phone, reading, false));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
