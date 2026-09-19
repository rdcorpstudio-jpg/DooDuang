/** Daily tarot open state — local, resets 00:00 Asia/Bangkok */

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

export function readTarotDayOpened(seed = defaultTarotDailySeed()): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(tarotDayStorageKey(seed));
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { opened?: boolean };
    return Boolean(parsed.opened);
  } catch {
    return false;
  }
}
