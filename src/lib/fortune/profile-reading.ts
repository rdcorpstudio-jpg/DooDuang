import type { FortuneAnalyzeInput, FortuneFocus } from "@/lib/fortune/analyze";
import type { BaziInput } from "@/lib/fortune/bazi";
import { resolveBirthPlace, timezoneFromBirthPlace } from "@/lib/fortune/birth-place";
import type { FortuneUserProfile } from "@/lib/fortune/profile-storage";

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
  profile: Pick<
    FortuneUserProfile,
    | "birthDate"
    | "nickname"
    | "gender"
    | "genderNote"
    | "birthTime"
    | "birthPlace"
    | "focus"
  >,
  asOf?: Date,
): FortuneAnalyzeInput {
  return {
    birthDate: profile.birthDate,
    nickname: profile.nickname,
    gender: profile.gender || undefined,
    genderNote:
      profile.gender === "other" ? profile.genderNote?.trim() || undefined : undefined,
    birthTime: profile.birthTime?.trim() || undefined,
    birthPlace: profile.birthPlace?.trim() || undefined,
    focus: (profile.focus as FortuneFocus | undefined) ?? "life",
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
