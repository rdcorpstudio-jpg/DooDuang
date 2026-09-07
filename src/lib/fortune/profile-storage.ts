import type { Gender } from "@/components/ui/sacred-form";

export const FORTUNE_PROFILE_KEY = "dooduang-fortune-profile";
export const WIZARD_CACHE_KEY = "dooduang-wizard-session";

export type FortuneUserProfile = {
  realName: string;
  nickname: string;
  birthDate: string;
  gender: Gender | "";
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
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
  try {
    localStorage.setItem(FORTUNE_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
  return profile;
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
      };
    };
    const p = parsed?.profile;
    if (!p?.nickname || !p?.birthDate) return null;
    return writeFortuneProfile({
      realName: p.realName ?? "",
      nickname: p.nickname,
      birthDate: p.birthDate,
      gender: p.gender ?? "",
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
