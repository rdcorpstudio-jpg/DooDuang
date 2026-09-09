import type { Gender } from "@/components/ui/sacred-form";
import type { FortuneFocus } from "@/lib/fortune/analyze";

export const FORTUNE_PROFILE_KEY = "dooduang-fortune-profile";
export const WIZARD_CACHE_KEY = "dooduang-wizard-session";

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

export function writeFortuneProfile(
  input: Omit<FortuneUserProfile, "updatedAt"> & { updatedAt?: string }
): FortuneUserProfile {
  const profile: FortuneUserProfile = {
    realName: input.realName.trim(),
    nickname: input.nickname.trim(),
    birthDate: input.birthDate.trim(),
    gender: input.gender || "",
    birthTime: input.birthTime?.trim() || undefined,
    birthPlace: input.birthPlace?.trim() || undefined,
    focus: input.focus,
    deepenSkipped: input.deepenSkipped,
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
  try {
    localStorage.setItem(FORTUNE_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
  return profile;
}

/** Free tier = day of birth only. Premium deepen unlocks time/place/focus. */
export function isPremiumDeepenComplete(
  profile: FortuneUserProfile | null | undefined
): boolean {
  if (!profile) return false;
  const timeOk = Boolean(profile.birthTime && /^\d{1,2}:\d{2}$/.test(profile.birthTime));
  const placeOk = Boolean(profile.birthPlace && profile.birthPlace.trim().length >= 2);
  return timeOk && placeOk;
}

export function needsPremiumDeepen(
  profile: FortuneUserProfile | null | undefined
): boolean {
  if (!profile) return false;
  if (profile.deepenSkipped) return false;
  return !isPremiumDeepenComplete(profile);
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
