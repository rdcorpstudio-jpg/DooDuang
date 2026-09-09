import { assignPremiumWallpaperIfNeeded } from "@/lib/fortune/premium-wallpaper";
import { FORTUNE_PACKAGE_MONTHS } from "@/lib/site";

/** Global entitlement — premium tab, face, palm, report */
export const PREMIUM_UNLOCK_KEY = "dooduang-premium-unlocked";
/** ISO ms timestamp — premium valid until (localStorage, survives refresh) */
export const PREMIUM_UNLOCK_UNTIL_KEY = "dooduang-premium-until";

function legacyUnlockKey(birthDate: string, nickname: string) {
  return `lukkana-unlock-overall-${birthDate}-${nickname}`;
}

function addCalendarMonths(from: Date, months: number) {
  const d = new Date(from.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

function readUntilMs(): number | null {
  try {
    const raw = localStorage.getItem(PREMIUM_UNLOCK_UNTIL_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeUntilMs(until: number) {
  try {
    localStorage.setItem(PREMIUM_UNLOCK_UNTIL_KEY, String(until));
  } catch {
    /* ignore */
  }
}

function clearExpiredFlags() {
  try {
    localStorage.removeItem(PREMIUM_UNLOCK_UNTIL_KEY);
    sessionStorage.removeItem(PREMIUM_UNLOCK_KEY);
  } catch {
    /* ignore */
  }
}

/** Grant / extend premium for FORTUNE_PACKAGE_MONTHS from now (or from current until if still active). */
export function setPremiumUnlocked(profile?: {
  birthDate: string;
  nickname: string;
} | null): void {
  const now = Date.now();
  const existing = readUntilMs();
  const base =
    existing !== null && existing > now ? new Date(existing) : new Date(now);
  const until = addCalendarMonths(base, FORTUNE_PACKAGE_MONTHS).getTime();
  writeUntilMs(until);

  try {
    sessionStorage.setItem(PREMIUM_UNLOCK_KEY, "1");
    if (profile?.birthDate && profile?.nickname) {
      sessionStorage.setItem(
        legacyUnlockKey(profile.birthDate, profile.nickname),
        "1"
      );
    }
  } catch {
    /* ignore */
  }
  // One random HQ wallpaper per premium unlock (kept stable after first assign)
  assignPremiumWallpaperIfNeeded();
}

export function isPremiumUnlocked(profile?: {
  birthDate: string;
  nickname: string;
} | null): boolean {
  try {
    const until = readUntilMs();
    if (until !== null) {
      if (until > Date.now()) {
        sessionStorage.setItem(PREMIUM_UNLOCK_KEY, "1");
        return true;
      }
      clearExpiredFlags();
      return false;
    }

    // Migrate legacy session-only unlock → grant one package window from now
    const legacySession = sessionStorage.getItem(PREMIUM_UNLOCK_KEY) === "1";
    const legacyProfile =
      profile?.birthDate && profile?.nickname
        ? sessionStorage.getItem(
            legacyUnlockKey(profile.birthDate, profile.nickname)
          ) === "1"
        : false;

    if (legacySession || legacyProfile) {
      setPremiumUnlocked(profile);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function getPremiumUnlockedUntil(): Date | null {
  const until = readUntilMs();
  if (until === null || until <= Date.now()) return null;
  return new Date(until);
}
