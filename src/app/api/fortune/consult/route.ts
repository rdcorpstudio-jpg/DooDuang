import { and, desc, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { consultSessions } from "@/lib/db/schema";
import {
  getFortuneProfileForUser,
  normalizeFortuneProfileInput,
  rowToFortuneProfilePayload,
  type FortuneProfilePayload,
} from "@/lib/fortune/fortune-profile-db";
import {
  bangkokDayKey,
  CONSULT_DAILY_SESSIONS,
  CONSULT_MAX_INPUT,
  generateConsultReply,
  parseConsultMessages,
  type ConsultMessage,
} from "@/lib/fortune/consult-reading";
import { hasPremiumAccess } from "@/lib/premium-entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

async function resolveProfile(
  userId: string,
  rawProfile: unknown,
): Promise<FortuneProfilePayload | null> {
  try {
    const row = await getFortuneProfileForUser(userId);
    if (row) return rowToFortuneProfilePayload(row);
  } catch (err) {
    console.error("consult profile lookup failed:", err);
  }
  return normalizeFortuneProfileInput(
    rawProfile as Partial<FortuneProfilePayload> | null,
  );
}

function dailyLimit() {
  return CONSULT_DAILY_SESSIONS;
}

function dayUsedTurns(rows: { userTurns: number }[]) {
  return rows.reduce((sum, row) => sum + Math.max(0, row.userTurns), 0);
}

function dbErrorPayload(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  if (/consult_sessions/i.test(msg) && /does not exist|undefined_table/i.test(msg)) {
    return {
      error: "ยังไม่ได้สร้างตาราง consult_sessions ในฐานข้อมูล",
      code: "NO_TABLE" as const,
    };
  }
  if (/getaddrinfo|ENOTFOUND|ECONNREFUSED|connect/i.test(msg)) {
    return {
      error: "เชื่อมต่อฐานข้อมูลไม่ได้",
      code: "DB_CONNECT" as const,
    };
  }
  return { error: "เกิดข้อผิดพลาด", code: "SERVER" as const };
}

async function daySessions(userId: string, dayKey: string) {
  const db = requireDb();
  return db
    .select()
    .from(consultSessions)
    .where(
      and(eq(consultSessions.userId, userId), eq(consultSessions.dayKey, dayKey)),
    )
    .orderBy(desc(consultSessions.createdAt));
}

function sessionPayload(
  row: typeof consultSessions.$inferSelect,
  dailyUsed: number,
  limit: number,
) {
  const messages = parseConsultMessages(row.messages);
  const remaining = Math.max(0, limit - dailyUsed);
  return {
    id: row.id,
    messages,
    userTurns: dailyUsed,
    maxTurns: limit,
    remainingTurns: remaining,
    closed: remaining <= 0,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ user: null });
  }

  try {
    const premium = hasPremiumAccess({
      status: session.user.subscriptionStatus,
      until: session.user.premiumUntil,
    });
    const dayKey = bangkokDayKey();
    const rows = await daySessions(session.user.id, dayKey);
    const limit = dailyLimit();
    const used = dayUsedTurns(rows);
    // One continuous thread per day — keep chatting on the latest session
    const thread = rows[0] ?? null;

    return NextResponse.json({
      user: true,
      premium,
      dayKey,
      limit,
      used,
      remainingSessions: Math.max(0, limit - used),
      resets: "00:00 น.",
      activeSession: thread ? sessionPayload(thread, used, limit) : null,
    });
  } catch (err) {
    console.error("consult GET failed:", err);
    const detail = dbErrorPayload(err);
    return NextResponse.json({
      user: true,
      limit: dailyLimit(),
      used: 0,
      remainingSessions: 0,
      activeSession: null,
      ...detail,
      error: detail.error || "เปิดห้องคุยไม่สำเร็จ ลองรีเฟรชอีกครั้ง",
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

  let action = "";
  let text = "";
  let sessionId = "";
  let rawProfile: unknown = null;
  try {
    const body = (await request.json()) as {
      action?: string;
      text?: string;
      sessionId?: string;
      profile?: unknown;
    };
    action = body.action?.trim() ?? "";
    text = body.text?.trim() ?? "";
    sessionId = body.sessionId?.trim() ?? "";
    rawProfile = body.profile ?? null;
  } catch {
    return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 400 });
  }

  // Greeting-only start does not need OpenAI; messages do.
  if (action === "message" && !process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "ยังเปิดปรึกษาแม่ไม่ได้", code: "NO_API_KEY" },
      { status: 503 },
    );
  }

  const premium = hasPremiumAccess({
    status: session.user.subscriptionStatus,
    until: session.user.premiumUntil,
  });
  const limit = dailyLimit();
  const dayKey = bangkokDayKey();

  try {
    const db = requireDb();

    if (action === "start") {
      // Drop older days — consult quota resets every Bangkok day
      await db
        .delete(consultSessions)
        .where(
          and(
            eq(consultSessions.userId, session.user.id),
            ne(consultSessions.dayKey, dayKey),
          ),
        );

      const rows = await daySessions(session.user.id, dayKey);
      const used = dayUsedTurns(rows);
      const latest = rows[0] ?? null;

      // Continue today's thread — never force a new "round" mid-day
      if (latest && used < limit) {
        return NextResponse.json({
          premium,
          limit,
          used,
          remainingSessions: Math.max(0, limit - used),
          session: sessionPayload(latest, used, limit),
        });
      }
      if (used >= limit || latest) {
        return NextResponse.json(
          {
            error: "วันนี้ถามครบ 3 คำถามแล้ว กลับมาใหม่หลัง 00:00 น.",
            code: "QUOTA",
            limit,
            used,
            remainingSessions: 0,
            session: latest ? sessionPayload(latest, used, limit) : null,
          },
          { status: 429 },
        );
      }

      const greeting =
        "แม่อยู่นี่แล้ว เล่าได้เลยว่าตอนนี้อยู่ในใจเรื่องอะไร เป็นความรัก งาน เงิน หรืออะไรก็ได้ แม่ฟังก่อนนะ";
      const messages: ConsultMessage[] = [
        { role: "assistant", content: greeting },
      ];
      const [created] = await db
        .insert(consultSessions)
        .values({
          userId: session.user.id,
          dayKey,
          messages: JSON.stringify(messages),
          userTurns: 0,
        })
        .returning();

      if (!created) {
        return NextResponse.json(
          { error: "เปิดห้องคุยไม่สำเร็จ", code: "INSERT_FAILED" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        premium,
        limit,
        used: 0,
        remainingSessions: limit,
        session: sessionPayload(created, 0, limit),
      });
    }

    if (action === "message") {
      if (!sessionId) {
        return NextResponse.json({ error: "ไม่พบห้องคุย" }, { status: 400 });
      }
      if (text.length < 2) {
        return NextResponse.json(
          { error: "พิมพ์อีกนิด ให้แม่จับเรื่องได้" },
          { status: 400 },
        );
      }
      if (text.length > CONSULT_MAX_INPUT) {
        return NextResponse.json(
          { error: "สั้นลงนิด เล่าใจความสำคัญพอ" },
          { status: 400 },
        );
      }

      const profile = await resolveProfile(session.user.id, rawProfile);
      const rows = await daySessions(session.user.id, dayKey);
      const used = dayUsedTurns(rows);

      const [row] = await db
        .select()
        .from(consultSessions)
        .where(
          and(
            eq(consultSessions.id, sessionId),
            eq(consultSessions.userId, session.user.id),
          ),
        )
        .limit(1);

      if (!row || row.dayKey !== dayKey) {
        return NextResponse.json(
          { error: "ห้องคุยนี้หมดอายุแล้ว เปิดรอบใหม่ได้หลัง 00:00 น." },
          { status: 404 },
        );
      }
      if (used >= limit) {
        return NextResponse.json(
          {
            error: "วันนี้ถามครบ 3 คำถามแล้ว กลับมาใหม่หลัง 00:00 น.",
            code: "QUOTA",
            session: sessionPayload(row, used, limit),
          },
          { status: 429 },
        );
      }

      const messages = parseConsultMessages(row.messages);
      messages.push({ role: "user", content: text });
      const reply = await generateConsultReply({ messages, profile });
      if (!reply) {
        return NextResponse.json(
          { error: "แม่ตอบไม่ทัน ลองอีกครั้ง" },
          { status: 502 },
        );
      }
      messages.push({ role: "assistant", content: reply });
      const nextTurns = row.userTurns + 1;

      const [updated] = await db
        .update(consultSessions)
        .set({
          messages: JSON.stringify(messages),
          userTurns: nextTurns,
          updatedAt: new Date(),
        })
        .where(eq(consultSessions.id, row.id))
        .returning();

      const nextUsed = used + 1;
      return NextResponse.json({
        premium,
        limit,
        used: nextUsed,
        remainingSessions: Math.max(0, limit - nextUsed),
        session: updated
          ? sessionPayload(updated, nextUsed, limit)
          : null,
      });
    }

    return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 400 });
  } catch (err) {
    console.error("consult POST failed:", err);
    const detail = dbErrorPayload(err);
    return NextResponse.json(detail, { status: 500 });
  }
}
