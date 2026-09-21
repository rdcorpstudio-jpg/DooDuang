import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { phoneAsks } from "@/lib/db/schema";
import {
  bangkokDayKey,
  generatePhoneReading,
  isValidThaiMobile,
  normalizePhoneInput,
  parsePhoneReading,
  type PhoneReading,
} from "@/lib/fortune/phone-reading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

function payload(phone: string, reading: PhoneReading, alreadyAsked: boolean) {
  return {
    asked: true,
    alreadyAsked,
    phone,
    reading,
    resets: "00:00 น.",
  };
}

async function todayRow(userId: string) {
  const db = requireDb();
  const dayKey = bangkokDayKey();
  const rows = await db
    .select()
    .from(phoneAsks)
    .where(and(eq(phoneAsks.userId, userId), eq(phoneAsks.dayKey, dayKey)))
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
    const reading = parsePhoneReading(row.result);
    if (!reading) {
      return NextResponse.json({ user: true, asked: false });
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

  let raw = "";
  try {
    const body = (await request.json()) as { phone?: string };
    raw = body.phone?.trim() ?? "";
  } catch {
    raw = "";
  }

  const phone = normalizePhoneInput(raw);
  if (!isValidThaiMobile(phone)) {
    return NextResponse.json(
      { error: "ใส่เบอร์มือถือไทย 10 หลัก เช่น 08x-xxx-xxxx" },
      { status: 400 },
    );
  }

  try {
    const { db, dayKey, row } = await todayRow(session.user.id);
    if (row) {
      const reading = parsePhoneReading(row.result);
      if (reading) {
        return NextResponse.json(payload(row.phone, reading, true));
      }
    }

    const reading = await generatePhoneReading(phone);
    if (!reading) {
      return NextResponse.json(
        { error: "แม่เปิดตำราไม่สำเร็จ ลองอีกครั้ง" },
        { status: 502 },
      );
    }

    const inserted = await db
      .insert(phoneAsks)
      .values({
        userId: session.user.id,
        dayKey,
        phone,
        result: JSON.stringify(reading),
      })
      .onConflictDoNothing({
        target: [phoneAsks.userId, phoneAsks.dayKey],
      })
      .returning();

    if (inserted.length === 0) {
      const again = await todayRow(session.user.id);
      const saved = again.row ? parsePhoneReading(again.row.result) : null;
      if (again.row && saved) {
        return NextResponse.json(payload(again.row.phone, saved, true));
      }
    }

    return NextResponse.json(payload(phone, reading, false));
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
