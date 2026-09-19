import { assignPremiumWallpaperIfNeeded } from "@/lib/fortune/premium-wallpaper";
import { FORTUNE_PACKAGE_DAYS } from "@/lib/site";

/** Global entitlement — premium tab, face, palm, report */
export const PREMIUM_UNLOCK_KEY = "dooduang-premium-unlocked";
/** ISO ms timestamp — premium valid until (localStorage, survives refresh) */
export const PREMIUM_UNLOCK_UNTIL_KEY = "dooduang-premium-until";

/** Min gap between /api/premium/status network calls (stops event loops / bots). */
const STATUS_FETCH_MIN_MS = 30_000;

type PremiumStatusPayload = {
  authenticated?: boolean;
  premium?: boolean;
  untilMs?: number | null;
};

let statusInflight: Promise<PremiumStatusPayload | null> | null = null;
let statusFetchedAt = 0;
let statusCache: PremiumStatusPayload | null = null;

/**
 * QA only — unlock premium UI without payment.
 * - Explicit: NEXT_PUBLIC_ALLOW_PREMIUM_SIM=1
 * - Auto-on during `next dev` / localhost (never on production builds)
 * Do NOT set the env flag on Railway/production.
 */
export function isLocalPremiumBypass(): boolean {
  if (process.env.NEXT_PUBLIC_ALLOW_PREMIUM_SIM === "1") return true;
  if (process.env.NODE_ENV === "development") return true;
  return false;
}

function legacyUnlockKey(birthDate: string, nickname: string) {
  return `lukkana-unlock-overall-${birthDate}-${nickname}`;
}

function addDays(from: Date, days: number) {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
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

function emitPremiumChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("dooduang-premium-changed"));
  }
}

function hasLocalPremiumFlags(): boolean {
  try {
    return (
      localStorage.getItem(PREMIUM_UNLOCK_UNTIL_KEY) !== null ||
      sessionStorage.getItem(PREMIUM_UNLOCK_KEY) !== null
    );
  } catch {
    return false;
  }
}

/** Grant / extend premium for FORTUNE_PACKAGE_DAYS from now (or from current until if still active). */
export function setPremiumUnlocked(profile?: {
  birthDate: string;
  nickname: string;
} | null): void {
  const now = Date.now();
  const existing = readUntilMs();
  const base =
    existing !== null && existing > now ? new Date(existing) : new Date(now);
  const until = addDays(base, FORTUNE_PACKAGE_DAYS).getTime();
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
  assignPremiumWallpaperIfNeeded();
  invalidatePremiumStatusCache();
  emitPremiumChanged();
}

export function isPremiumUnlocked(profile?: {
  birthDate: string;
  nickname: string;
} | null): boolean {
  if (isLocalPremiumBypass()) return true;

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

export function clearPremiumUnlocked(): void {
  const hadFlags = hasLocalPremiumFlags();
  try {
    localStorage.removeItem(PREMIUM_UNLOCK_UNTIL_KEY);
    sessionStorage.removeItem(PREMIUM_UNLOCK_KEY);
  } catch {
    /* ignore */
  }
  // Only notify when something actually changed — avoids refetch loops
  if (hadFlags) emitPremiumChanged();
}

export function applyPremiumUntil(
  untilMs: number | null,
  profile?: {
    birthDate: string;
    nickname: string;
  } | null
): boolean {
  if (untilMs === null || untilMs <= Date.now()) {
    clearPremiumUnlocked();
    return false;
  }

  const prev = readUntilMs();
  const sameUntil = prev === untilMs;
  writeUntilMs(untilMs);
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
  assignPremiumWallpaperIfNeeded();
  if (!sameUntil) emitPremiumChanged();
  return true;
}

async function fetchPremiumStatus(): Promise<PremiumStatusPayload | null> {
  const now = Date.now();
  if (statusCache && now - statusFetchedAt < STATUS_FETCH_MIN_MS) {
    return statusCache;
  }
  if (statusInflight) return statusInflight;

  statusInflight = (async () => {
    try {
      const res = await fetch("/api/premium/status", {
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return statusCache;
      const data = (await res.json()) as PremiumStatusPayload;
      statusCache = data;
      statusFetchedAt = Date.now();
      return data;
    } catch {
      return statusCache;
    } finally {
      statusInflight = null;
    }
  })();

  return statusInflight;
}

/** Drop client status cache after pay / login so the next sync is fresh. */
export function invalidatePremiumStatusCache(): void {
  statusCache = null;
  statusFetchedAt = 0;
}

/** Require logged-in premium from server. Does not fall back to local unlock. */
export async function requirePremiumFromServer(profile?: {
  birthDate: string;
  nickname: string;
} | null): Promise<{
  ok: boolean;
  authenticated: boolean;
}> {
  if (isLocalPremiumBypass()) {
    return { ok: true, authenticated: true };
  }

  const data = await fetchPremiumStatus();
  if (!data) {
    return { ok: false, authenticated: false };
  }
  if (!data.authenticated) {
    clearPremiumUnlocked();
    return { ok: false, authenticated: false };
  }
  const ok = applyPremiumUntil(
    data.premium ? data.untilMs ?? null : null,
    profile
  );
  return { ok, authenticated: true };
}

/** Pull entitlement from the logged-in account. Falls back to local when logged out. */
export async function syncPremiumFromServer(profile?: {
  birthDate: string;
  nickname: string;
} | null): Promise<boolean> {
  if (isLocalPremiumBypass()) return true;

  const data = await fetchPremiumStatus();
  if (!data) return isPremiumUnlocked(profile);
  if (!data.authenticated) {
    clearPremiumUnlocked();
    return false;
  }
  return applyPremiumUntil(data.premium ? data.untilMs ?? null : null, profile);
}

export function getPremiumUnlockedUntil(): Date | null {
  const until = readUntilMs();
  if (until === null || until <= Date.now()) return null;
  return new Date(until);
}
