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
  input: Omit<FortuneUserProfile, "updatedAt"> & { updatedAt?: string }
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
  return profile;
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
