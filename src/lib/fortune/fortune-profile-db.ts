import { eq } from "drizzle-orm";
import { requireDb } from "@/lib/db";
import { fortuneProfiles } from "@/lib/db/schema";

const GENDERS = new Set(["female", "male", "other", ""]);
const FOCUSES = new Set(["life", "work", "money", "love", "health"]);

export type FortuneProfilePayload = {
  realName: string;
  nickname: string;
  birthDate: string;
  gender: string;
  birthTime?: string | null;
  birthPlace?: string | null;
  focus?: string | null;
  deepenSkipped?: boolean;
  profileLockedUntil?: string | null;
  updatedAt?: string;
};

export function normalizeFortuneProfileInput(
  raw: Partial<FortuneProfilePayload> | null | undefined
): FortuneProfilePayload | null {
  if (!raw) return null;
  const nickname = typeof raw.nickname === "string" ? raw.nickname.trim() : "";
  const birthDate =
    typeof raw.birthDate === "string" ? raw.birthDate.trim() : "";
  if (!nickname || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;

  const genderRaw = typeof raw.gender === "string" ? raw.gender.trim() : "";
  const gender = GENDERS.has(genderRaw) ? genderRaw : "";

  const birthTime =
    typeof raw.birthTime === "string" && /^\d{1,2}:\d{2}$/.test(raw.birthTime.trim())
      ? raw.birthTime.trim()
      : null;
  const birthPlace =
    typeof raw.birthPlace === "string" && raw.birthPlace.trim().length >= 2
      ? raw.birthPlace.trim()
      : null;
  const focusRaw = typeof raw.focus === "string" ? raw.focus.trim() : "";
  const focus = FOCUSES.has(focusRaw) ? focusRaw : null;

  let profileLockedUntil: string | null = null;
  if (
    typeof raw.profileLockedUntil === "string" &&
    raw.profileLockedUntil.trim()
  ) {
    const t = Date.parse(raw.profileLockedUntil);
    if (!Number.isNaN(t)) profileLockedUntil = new Date(t).toISOString();
  }

  let updatedAt: string | undefined;
  if (typeof raw.updatedAt === "string" && raw.updatedAt.trim()) {
    const t = Date.parse(raw.updatedAt);
    if (!Number.isNaN(t)) updatedAt = new Date(t).toISOString();
  }

  return {
    realName: typeof raw.realName === "string" ? raw.realName.trim() : "",
    nickname,
    birthDate,
    gender,
    birthTime,
    birthPlace,
    focus,
    deepenSkipped: Boolean(raw.deepenSkipped),
    profileLockedUntil,
    updatedAt,
  };
}

export function rowToFortuneProfilePayload(row: typeof fortuneProfiles.$inferSelect) {
  return {
    realName: row.realName ?? "",
    nickname: row.nickname,
    birthDate: row.birthDate,
    gender: row.gender ?? "",
    birthTime: row.birthTime ?? undefined,
    birthPlace: row.birthPlace ?? undefined,
    focus: row.focus ?? undefined,
    deepenSkipped: row.deepenSkipped,
    profileLockedUntil: row.profileLockedUntil
      ? row.profileLockedUntil.toISOString()
      : undefined,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getFortuneProfileForUser(userId: string) {
  const db = requireDb();
  const [row] = await db
    .select()
    .from(fortuneProfiles)
    .where(eq(fortuneProfiles.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function upsertFortuneProfileForUser(
  userId: string,
  input: FortuneProfilePayload
) {
  const db = requireDb();
  const now = new Date();
  const clientUpdated = input.updatedAt ? new Date(input.updatedAt) : now;
  const updatedAt =
    Number.isNaN(clientUpdated.getTime()) || clientUpdated.getTime() > now.getTime()
      ? now
      : clientUpdated;

  const lockedUntil = input.profileLockedUntil
    ? new Date(input.profileLockedUntil)
    : null;

  const values = {
    userId,
    realName: input.realName || null,
    nickname: input.nickname,
    birthDate: input.birthDate,
    gender: input.gender || null,
    birthTime: input.birthTime || null,
    birthPlace: input.birthPlace || null,
    focus: input.focus || null,
    deepenSkipped: Boolean(input.deepenSkipped),
    profileLockedUntil:
      lockedUntil && !Number.isNaN(lockedUntil.getTime()) ? lockedUntil : null,
    updatedAt,
  };

  const existing = await getFortuneProfileForUser(userId);
  if (existing) {
    await db
      .update(fortuneProfiles)
      .set(values)
      .where(eq(fortuneProfiles.userId, userId));
  } else {
    await db.insert(fortuneProfiles).values({
      ...values,
      createdAt: now,
    });
  }

  const row = await getFortuneProfileForUser(userId);
  return row!;
}
