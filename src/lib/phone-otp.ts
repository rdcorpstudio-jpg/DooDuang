import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { and, count, desc, eq, gte, isNull } from "drizzle-orm";
import { requireDb } from "@/lib/db";
import { phoneOtps, users } from "@/lib/db/schema";

export const OTP_EXPIRES_SEC = 5 * 60;
export const OTP_RESEND_COOLDOWN_SEC = 60;
export const OTP_MAX_SENDS_PER_PHONE_PER_HOUR = 5;
export const OTP_MAX_SENDS_PER_IP_PER_HOUR = 10;
export const OTP_MAX_ATTEMPTS = 5;

function pepper() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return secret;
}

function hashOtp(phone: string, code: string) {
  return createHmac("sha256", pepper()).update(`${phone}:${code}`).digest("hex");
}

function hashesEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function expiresInSec() {
  const raw = Number(process.env.PHONE_OTP_EXPIRES_SEC);
  return Number.isFinite(raw) && raw > 0 ? raw : OTP_EXPIRES_SEC;
}

export function shouldEchoOtp() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.PHONE_OTP_ECHO === "true"
  );
}

export type PhoneOtpIssue =
  | { ok: true; id: string; code: string; expiresIn: number }
  | { ok: false; error: "cooldown" | "rate_limited"; retryAfterSec?: number };

export async function issuePhoneOtp(phone: string, ip: string | null): Promise<PhoneOtpIssue> {
  const db = requireDb();
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [[phoneSends], [ipSends], [latest]] = await Promise.all([
    db
      .select({ n: count() })
      .from(phoneOtps)
      .where(and(eq(phoneOtps.phone, phone), gte(phoneOtps.createdAt, hourAgo))),
    ip
      ? db
          .select({ n: count() })
          .from(phoneOtps)
          .where(and(eq(phoneOtps.ip, ip), gte(phoneOtps.createdAt, hourAgo)))
      : Promise.resolve([{ n: 0 }]),
    db
      .select({ createdAt: phoneOtps.createdAt })
      .from(phoneOtps)
      .where(eq(phoneOtps.phone, phone))
      .orderBy(desc(phoneOtps.createdAt))
      .limit(1),
  ]);

  if (Number(phoneSends.n) >= OTP_MAX_SENDS_PER_PHONE_PER_HOUR) {
    return { ok: false, error: "rate_limited" };
  }
  if (ip && Number(ipSends.n) >= OTP_MAX_SENDS_PER_IP_PER_HOUR) {
    return { ok: false, error: "rate_limited" };
  }

  if (latest?.createdAt) {
    const elapsedMs = now.getTime() - latest.createdAt.getTime();
    const cooldownMs = OTP_RESEND_COOLDOWN_SEC * 1000;
    if (elapsedMs < cooldownMs) {
      return {
        ok: false,
        error: "cooldown",
        retryAfterSec: Math.ceil((cooldownMs - elapsedMs) / 1000),
      };
    }
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const ttl = expiresInSec();
  const id = crypto.randomUUID();

  await db
    .update(phoneOtps)
    .set({ consumedAt: now })
    .where(and(eq(phoneOtps.phone, phone), isNull(phoneOtps.consumedAt)));

  await db.insert(phoneOtps).values({
    id,
    phone,
    codeHash: hashOtp(phone, code),
    expiresAt: new Date(now.getTime() + ttl * 1000),
    ip,
  });

  return { ok: true, id, code, expiresIn: ttl };
}

export async function invalidatePhoneOtp(id: string) {
  const db = requireDb();
  await db
    .update(phoneOtps)
    .set({ consumedAt: new Date() })
    .where(eq(phoneOtps.id, id));
}

export type PhoneOtpCheck =
  | { ok: true }
  | { ok: false; error: "invalid" | "locked" };

export async function consumePhoneOtp(
  phone: string,
  code: string
): Promise<PhoneOtpCheck> {
  const db = requireDb();
  const now = new Date();
  const normalizedCode = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalizedCode)) {
    return { ok: false, error: "invalid" };
  }

  const [row] = await db
    .select()
    .from(phoneOtps)
    .where(
      and(
        eq(phoneOtps.phone, phone),
        isNull(phoneOtps.consumedAt),
        gte(phoneOtps.expiresAt, now)
      )
    )
    .orderBy(desc(phoneOtps.createdAt))
    .limit(1);

  if (!row) {
    return { ok: false, error: "invalid" };
  }

  const nextAttempts = row.attemptCount + 1;
  const match = hashesEqual(row.codeHash, hashOtp(phone, normalizedCode));

  if (match) {
    await db
      .update(phoneOtps)
      .set({ attemptCount: nextAttempts, consumedAt: now })
      .where(eq(phoneOtps.id, row.id));
    return { ok: true };
  }

  const locked = nextAttempts >= OTP_MAX_ATTEMPTS;
  await db
    .update(phoneOtps)
    .set({
      attemptCount: nextAttempts,
      consumedAt: locked ? now : null,
    })
    .where(eq(phoneOtps.id, row.id));

  return { ok: false, error: locked ? "locked" : "invalid" };
}

export async function upsertUserByPhone(phone: string) {
  const db = requireDb();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);

  if (existing) {
    return { userId: existing.id, isNewUser: false };
  }

  const userId = crypto.randomUUID();
  try {
    await db.insert(users).values({
      id: userId,
      phone,
      credits: 0,
    });
    return { userId, isNewUser: true };
  } catch (err) {
    const [race] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);
    if (race) {
      return { userId: race.id, isNewUser: false };
    }
    throw err;
  }
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip");
}
