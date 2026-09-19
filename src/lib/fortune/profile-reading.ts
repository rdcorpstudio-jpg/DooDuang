import type { FortuneAnalyzeInput, FortuneFocus } from "@/lib/fortune/analyze";
import type { BaziInput } from "@/lib/fortune/bazi";
import { resolveBirthPlace, timezoneFromBirthPlace } from "@/lib/fortune/birth-place";
import type { FortuneUserProfile } from "@/lib/fortune/profile-storage";

/** Loose profile shape from UI state / localStorage slices. */
type ProfileAnalyzeSource = {
  birthDate: string;
  nickname: string;
  gender?: FortuneUserProfile["gender"] | string | null;
  genderNote?: string | null;
  birthTime?: string | null;
  birthPlace?: string | null;
  focus?: FortuneFocus | string | null;
};

function normalizeGender(
  value: ProfileAnalyzeSource["gender"],
): FortuneUserProfile["gender"] | undefined {
  const raw = typeof value === "string" ? value.trim() : "";
  if (
    raw === "female" ||
    raw === "male" ||
    raw === "other" ||
    raw === "unspecified"
  ) {
    return raw;
  }
  return undefined;
}

/** Stable deep seed for calendar / auspicious grids (profile + local day). */
export function profileDeepSeed(
  profile: Pick<
    FortuneUserProfile,
    "birthDate" | "birthTime" | "birthPlace" | "nickname" | "gender" | "focus"
  >,
  suffix = "deep",
): string {
  const place = resolveBirthPlace(profile.birthPlace);
  return [
    profile.birthDate,
    profile.birthTime?.trim() || "unknown-time",
    place.normalized || "no-place",
    place.timezone,
    profile.nickname?.trim() || "",
    profile.gender || "",
    profile.focus || "life",
    suffix,
  ].join("::");
}

export function profileToAnalyzeInput(
  profile: ProfileAnalyzeSource,
  asOf?: Date,
): FortuneAnalyzeInput {
  const gender = normalizeGender(profile.gender);
  const focusRaw = typeof profile.focus === "string" ? profile.focus.trim() : "";
  const focus: FortuneFocus =
    focusRaw === "work" ||
    focusRaw === "money" ||
    focusRaw === "love" ||
    focusRaw === "health" ||
    focusRaw === "life"
      ? focusRaw
      : "life";

  return {
    birthDate: profile.birthDate,
    nickname: profile.nickname,
    gender,
    genderNote:
      gender === "other" ? profile.genderNote?.trim() || undefined : undefined,
    birthTime: profile.birthTime?.trim() || undefined,
    birthPlace: profile.birthPlace?.trim() || undefined,
    focus,
    asOf,
  };
}

export function profileToBaziInput(
  profile: Pick<
    FortuneUserProfile,
    "birthDate" | "birthTime" | "birthPlace" | "gender"
  >,
): BaziInput | null {
  if (!profile.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(profile.birthDate)) {
    return null;
  }
  if (!profile.gender) return null;
  const gender =
    profile.gender === "female" || profile.gender === "male"
      ? profile.gender
      : "other";
  const place = profile.birthPlace?.trim();
  return {
    birthDate: profile.birthDate,
    birthTime: profile.birthTime?.trim() || undefined,
    gender,
    timezone: timezoneFromBirthPlace(place),
    birthPlace: place || undefined,
  };
}

export { timezoneFromBirthPlace, resolveBirthPlace };
