import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { baziCycleAsks } from "@/lib/db/schema";
import { buildBaziChart } from "@/lib/fortune/bazi";
import { buildBaziCycleFacts } from "@/lib/fortune/bazi/cycle-facts";
import {
  generateBaziCycleReading,
  parseBaziCycleReading,
  type BaziCycleReading,
} from "@/lib/fortune/bazi/cycle-ai-reading";
import {
  getFortuneProfileForUser,
  normalizeFortuneProfileInput,
  rowToFortuneProfilePayload,
  type FortuneProfilePayload,
} from "@/lib/fortune/fortune-profile-db";
import { profileToBaziInput } from "@/lib/fortune/profile-reading";
import { hasPremiumAccess } from "@/lib/premium-entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

function payload(
  reading: BaziCycleReading,
  meta: { alreadyAsked: boolean; cycleKey: string; annualYear: number },
) {
  return {
    asked: true,
    alreadyAsked: meta.alreadyAsked,
    cycleKey: meta.cycleKey,
    annualYear: meta.annualYear,
    reading,
  };
}

async function resolveProfile(
  userId: string,
  rawProfile: unknown,
): Promise<FortuneProfilePayload | null> {
  try {
    const row = await getFortuneProfileForUser(userId);
    if (row) return rowToFortuneProfilePayload(row);
  } catch (err) {
    console.error("bazi-cycle profile lookup failed:", err);
  }
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
    const db = requireDb();
    const [row] = await db
      .select()
      .from(baziCycleAsks)
      .where(eq(baziCycleAsks.userId, session.user.id))
      .limit(1);

    if (!row) {
      return NextResponse.json({ user: true, asked: false });
    }
    const reading = parseBaziCycleReading(row.result);
    if (!reading) {
      return NextResponse.json({ user: true, asked: false, stale: true });
    }
    return NextResponse.json({
      user: true,
      ...payload(reading, {
        alreadyAsked: true,
        cycleKey: row.cycleKey,
        annualYear: row.annualYear,
      }),
    });
  } catch (err) {
    console.error("bazi-cycle GET failed:", err);
    return NextResponse.json({
      user: true,
      asked: false,
      error: "เปิดดวงจรไม่สำเร็จ ลองรีเฟรชอีกครั้ง",
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

  const premium = hasPremiumAccess({
    status: session.user.subscriptionStatus,
    until: session.user.premiumUntil,
  });
  if (!premium) {
    return NextResponse.json(
      { error: "ฟีเจอร์นี้สำหรับสมาชิกพรีเมียม", code: "NO_PREMIUM" },
      { status: 403 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "ยังเปิดอ่านดวงจรด้วยแม่ไม่ได้", code: "NO_API_KEY" },
      { status: 503 },
    );
  }

  let rawProfile: unknown = null;
  try {
    const body = (await request.json()) as { profile?: unknown };
    rawProfile = body.profile ?? null;
  } catch {
    rawProfile = null;
  }

  try {
    const db = requireDb();
    const [existing] = await db
      .select()
      .from(baziCycleAsks)
      .where(eq(baziCycleAsks.userId, session.user.id))
      .limit(1);

    if (existing) {
      const reading = parseBaziCycleReading(existing.result);
      if (reading) {
        return NextResponse.json(
          payload(reading, {
            alreadyAsked: true,
            cycleKey: existing.cycleKey,
            annualYear: existing.annualYear,
          }),
        );
      }
    }

    const profile = await resolveProfile(session.user.id, rawProfile);
    if (!profile?.nickname || !profile.birthDate) {
      return NextResponse.json(
        {
          error: "กรอกโปรไฟล์ชื่อและวันเกิดก่อน",
          code: "NO_PROFILE",
        },
        { status: 400 },
      );
    }

    const baziInput = profileToBaziInput({
      birthDate: profile.birthDate,
      birthTime: profile.birthTime ?? undefined,
      birthPlace: profile.birthPlace ?? undefined,
      gender: (profile.gender || "") as
        | "female"
        | "male"
        | "other"
        | "unspecified"
        | "",
    });
    if (!baziInput) {
      return NextResponse.json(
        { error: "ข้อมูลวันเกิดไม่ครบสำหรับปาจื้อ", code: "BAD_PROFILE" },
        { status: 400 },
      );
    }

    const chart = buildBaziChart(baziInput);
    const facts = buildBaziCycleFacts(chart);
    if (!facts) {
      return NextResponse.json(
        { error: "คำนวณดวงจรไม่สำเร็จ", code: "NO_FACTS" },
        { status: 500 },
      );
    }

    const reading = await generateBaziCycleReading({ facts, profile });
    if (!reading) {
      return NextResponse.json(
        { error: "แม่เปิดตำราดวงจรไม่สำเร็จ ลองอีกครั้ง", code: "AI_FAILED" },
        { status: 502 },
      );
    }

    if (existing) {
      await db
        .update(baziCycleAsks)
        .set({
          cycleKey: facts.cycleKey,
          annualYear: facts.annualYear,
          result: JSON.stringify(reading),
        })
        .where(eq(baziCycleAsks.id, existing.id));
    } else {
      await db.insert(baziCycleAsks).values({
        userId: session.user.id,
        cycleKey: facts.cycleKey,
        annualYear: facts.annualYear,
        result: JSON.stringify(reading),
      });
    }

    return NextResponse.json(
      payload(reading, {
        alreadyAsked: false,
        cycleKey: facts.cycleKey,
        annualYear: facts.annualYear,
      }),
    );
  } catch (err) {
    console.error("bazi-cycle POST failed:", err);
    const msg = err instanceof Error ? err.message : String(err);
    if (/bazi_cycle_asks/i.test(msg) && /does not exist/i.test(msg)) {
      return NextResponse.json(
        {
          error: "ยังไม่ได้สร้างตาราง bazi_cycle_asks ในฐานข้อมูล",
          code: "NO_TABLE",
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
