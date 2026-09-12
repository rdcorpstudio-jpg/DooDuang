import type { Gender } from "@/components/ui/sacred-form";
import type { FortuneFocus } from "@/lib/fortune/analyze";

export const FORTUNE_PROFILE_KEY = "dooduang-fortune-profile";
export const WIZARD_CACHE_KEY = "dooduang-wizard-session";

/** After each successful profile save, next edit unlocks in 3 weeks. */
export const PROFILE_EDIT_COOLDOWN_MS = 21 * 24 * 60 * 60 * 1000;

export type FortuneUserProfile = {
  realName: string;
  nickname: string;
  birthDate: string;
  gender: Gender | "";
  /** Premium deepen — HH:mm */
  birthTime?: string;
  /** Premium deepen — จังหวัด/เมืองเกิด */
  birthPlace?: string;
  /** Premium deepen — โฟกัสช่วงนี้ */
  focus?: FortuneFocus;
  /** User skipped deepen form after unlock */
  deepenSkipped?: boolean;
  /** ISO — cannot edit again until this time */
  profileLockedUntil?: string;
  updatedAt: string;
};

function isValidProfile(value: unknown): value is FortuneUserProfile {
  if (!value || typeof value !== "object") return false;
  const p = value as FortuneUserProfile;
  return (
    typeof p.nickname === "string" &&
    typeof p.birthDate === "string" &&
    p.nickname.trim().length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(p.birthDate)
  );
}

export function readFortuneProfile(): FortuneUserProfile | null {
  try {
    const raw = localStorage.getItem(FORTUNE_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isValidProfile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function canEditFortuneProfile(
  profile: FortuneUserProfile | null | undefined
): boolean {
  if (!profile?.profileLockedUntil) return true;
  const until = Date.parse(profile.profileLockedUntil);
  if (Number.isNaN(until)) return true;
  return Date.now() >= until;
}

export function profileEditCooldownDaysLeft(
  profile: FortuneUserProfile | null | undefined
): number {
  if (!profile?.profileLockedUntil) return 0;
  const until = Date.parse(profile.profileLockedUntil);
  if (Number.isNaN(until)) return 0;
  const ms = until - Date.now();
  if (ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function writeFortuneProfile(
  input: Omit<FortuneUserProfile, "updatedAt"> & { updatedAt?: string },
  opts?: { syncServer?: boolean }
): FortuneUserProfile {
  const existing = readFortuneProfile();
  const profile: FortuneUserProfile = {
    realName: input.realName.trim(),
    nickname: input.nickname.trim(),
    birthDate: input.birthDate.trim(),
    gender: input.gender || "",
    birthTime: input.birthTime?.trim() || undefined,
    birthPlace: input.birthPlace?.trim() || undefined,
    focus: input.focus,
    deepenSkipped: input.deepenSkipped,
    profileLockedUntil:
      input.profileLockedUntil !== undefined
        ? input.profileLockedUntil
        : existing?.profileLockedUntil,
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
  try {
    localStorage.setItem(FORTUNE_PROFILE_KEY, JSON.stringify(profile));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("dooduang-profile-changed"));
    }
    // Keep wizard session in sync so old cache cannot overwrite a saved profile
    const raw = sessionStorage.getItem(WIZARD_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        step?: string;
        profile?: Record<string, unknown>;
        result?: unknown;
      };
      if (parsed?.step === "result" && parsed.profile) {
        sessionStorage.setItem(
          WIZARD_CACHE_KEY,
          JSON.stringify({
            ...parsed,
            profile: {
              ...parsed.profile,
              realName: profile.realName,
              nickname: profile.nickname,
              birthDate: profile.birthDate,
              gender: profile.gender,
            },
          })
        );
      }
    }
  } catch {
    /* ignore storage failures */
  }

  if (opts?.syncServer !== false) {
    void pushFortuneProfileToServer(profile);
  }
  return profile;
}

/** Push local profile to DB when logged in. Silent if guest / offline. */
export async function pushFortuneProfileToServer(
  profile?: FortuneUserProfile | null
): Promise<boolean> {
  const next = profile ?? readFortuneProfile();
  if (!next || typeof window === "undefined") return false;
  try {
    const res = await fetch("/api/fortune/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        realName: next.realName,
        nickname: next.nickname,
        birthDate: next.birthDate,
        gender: next.gender,
        birthTime: next.birthTime ?? null,
        birthPlace: next.birthPlace ?? null,
        focus: next.focus ?? null,
        deepenSkipped: Boolean(next.deepenSkipped),
        profileLockedUntil: next.profileLockedUntil ?? null,
        updatedAt: next.updatedAt,
      }),
    });
    if (res.status === 401) return false;
    return res.ok;
  } catch {
    return false;
  }
}

function profileUpdatedMs(profile: { updatedAt?: string } | null | undefined) {
  if (!profile?.updatedAt) return 0;
  const t = Date.parse(profile.updatedAt);
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Merge localStorage ↔ server for logged-in users.
 * Newer updatedAt wins; if only one side has data, copy that way.
 */
export async function syncFortuneProfileWithServer(): Promise<FortuneUserProfile | null> {
  if (typeof window === "undefined") return readFortuneProfile();

  hydrateFortuneProfileFromWizard();
  const local = readFortuneProfile();

  try {
    const res = await fetch("/api/fortune/profile", { cache: "no-store" });
    if (res.status === 401) return local;
    if (!res.ok) return local;

    const data = (await res.json()) as {
      profile?: (Omit<FortuneUserProfile, "gender" | "focus"> & {
        gender?: string;
        focus?: string;
      }) | null;
    };
    const server = data.profile;
    if (!server?.nickname || !server.birthDate) {
      if (local) await pushFortuneProfileToServer(local);
      return local;
    }

    const serverProfile: FortuneUserProfile = {
      realName: server.realName ?? "",
      nickname: server.nickname,
      birthDate: server.birthDate,
      gender: (server.gender as FortuneUserProfile["gender"]) || "",
      birthTime: server.birthTime,
      birthPlace: server.birthPlace,
      focus: server.focus as FortuneUserProfile["focus"],
      deepenSkipped: Boolean(server.deepenSkipped),
      profileLockedUntil: server.profileLockedUntil,
      updatedAt: server.updatedAt,
    };

    const localMs = profileUpdatedMs(local);
    const serverMs = profileUpdatedMs(serverProfile);

    if (!local || serverMs >= localMs) {
      return writeFortuneProfile(serverProfile, { syncServer: false });
    }

    await pushFortuneProfileToServer(local);
    return local;
  } catch {
    return local;
  }
}

/** Free tier = day of birth only. Premium deepen unlocks time/place/focus. */
export function isPremiumDeepenComplete(
  profile: FortuneUserProfile | null | undefined
): boolean {
  if (!profile) return false;
  const timeOk = Boolean(
    profile.birthTime && /^\d{1,2}:\d{2}$/.test(profile.birthTime)
  );
  const placeOk = Boolean(
    profile.birthPlace && profile.birthPlace.trim().length >= 2
  );
  return timeOk && placeOk;
}

export function needsPremiumDeepen(
  profile: FortuneUserProfile | null | undefined
): boolean {
  if (!profile) return false;
  if (profile.deepenSkipped) return false;
  return !isPremiumDeepenComplete(profile);
}

/** Basic wizard fields required before premium deepen (gender → birth → name) */
export function hasBasicFortuneProfile(
  profile: FortuneUserProfile | null | undefined
): boolean {
  if (!profile) return false;
  return (
    profile.realName.trim().length > 0 &&
    profile.nickname.trim().length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(profile.birthDate) &&
    Boolean(profile.gender)
  );
}

/**
 * Enough to open free daily reading without re-entering the wizard.
 * realName is optional (account profile allows empty).
 */
export function hasFreeReadingBasics(
  profile: FortuneUserProfile | null | undefined
): boolean {
  if (!profile) return false;
  return (
    profile.nickname.trim().length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(profile.birthDate) &&
    Boolean(profile.gender)
  );
}

/**
 * After unlock:
 * - basic complete → /premium (deepen time/place only, then loading)
 * - otherwise → reading wizard for missing gender/birth/name (no loading yet)
 */
export function getPremiumOnboardPath(
  profile: FortuneUserProfile | null | undefined = null
): string {
  if (hasBasicFortuneProfile(profile)) {
    return "/premium";
  }
  return "/reading?afterPremium=1";
}

/** Pull profile from wizard session cache if local profile is empty */
export function hydrateFortuneProfileFromWizard(): FortuneUserProfile | null {
  const existing = readFortuneProfile();
  if (existing) return existing;

  try {
    const raw = sessionStorage.getItem(WIZARD_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      profile?: {
        realName?: string;
        nickname?: string;
        birthDate?: string;
        gender?: Gender | "";
        birthTime?: string;
        birthPlace?: string;
        focus?: FortuneFocus;
        deepenSkipped?: boolean;
      };
    };
    const p = parsed?.profile;
    if (!p?.nickname || !p?.birthDate) return null;
    return writeFortuneProfile({
      realName: p.realName ?? "",
      nickname: p.nickname,
      birthDate: p.birthDate,
      gender: p.gender ?? "",
      birthTime: p.birthTime,
      birthPlace: p.birthPlace,
      focus: p.focus,
      deepenSkipped: p.deepenSkipped,
    });
  } catch {
    return null;
  }
}

export function clearFortuneProfile() {
  try {
    localStorage.removeItem(FORTUNE_PROFILE_KEY);
  } catch {
    /* ignore */
  }
}
