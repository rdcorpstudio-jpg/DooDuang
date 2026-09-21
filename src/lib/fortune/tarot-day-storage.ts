/** Daily tarot open state — local, resets 00:00 Asia/Bangkok */

import { drawTarotCard } from "@/lib/fortune/tarot-deck";

/** Must match fan size in fortune-daily-tarot */
export const TAROT_FAN_COUNT = 13;

export function bangkokTodayKey(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function defaultTarotDailySeed(dayKey = bangkokTodayKey()) {
  return `tarot-daily-${dayKey}`;
}

export function tarotDayStorageKey(
  seed: string,
  dayKey = bangkokTodayKey(),
) {
  return `dooduang-tarot-day-${dayKey}-${seed.slice(0, 24)}`;
}

export type TarotDayState = {
  opened: boolean;
  slot: number;
};

export function readTarotDayState(
  seed = defaultTarotDailySeed(),
  dayKey = bangkokTodayKey(),
): TarotDayState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(tarotDayStorageKey(seed, dayKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { opened?: boolean; slot?: number };
    if (!parsed.opened) return null;
    const slot =
      typeof parsed.slot === "number"
        ? Math.min(TAROT_FAN_COUNT - 1, Math.max(0, parsed.slot))
        : Math.floor(TAROT_FAN_COUNT / 2);
    return { opened: true, slot };
  } catch {
    return null;
  }
}

export function readTarotDayOpened(seed = defaultTarotDailySeed()): boolean {
  return Boolean(readTarotDayState(seed)?.opened);
}

/** Resolve today's opened card (same seed formula as /reading/tarot). */
export function resolveOpenedDailyTarot(
  seed?: string,
  dayKey = bangkokTodayKey(),
) {
  const s = seed ?? defaultTarotDailySeed(dayKey);
  const state = readTarotDayState(s, dayKey);
  if (!state) return null;
  return drawTarotCard(`${s}-tarot-${dayKey}-slot-${state.slot}`);
}
