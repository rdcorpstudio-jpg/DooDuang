import { analyzeFortune } from "@/lib/fortune/analyze";
import { buildDailyReadingPack } from "@/lib/fortune/build-daily-pack";
import { buildPremiumRitualsPack } from "@/lib/fortune/build-premium-rituals";
import { buildPremiumValuePack } from "@/lib/fortune/build-premium-value-pack";
import {
  WIZARD_CACHE_KEY,
  writeFortuneProfile,
  type FortuneUserProfile,
} from "@/lib/fortune/profile-storage";

export const PREMIUM_READING_REBUILT_KEY = "dooduang-premium-reading-rebuilt";

/**
 * After premium deepen (or full onboard): drop free caches and recompute
 * all premium packs with complete birth time / place / focus.
 */
export function rebuildPremiumReading(
  profile: FortuneUserProfile
): FortuneUserProfile {
  try {
    sessionStorage.removeItem(WIZARD_CACHE_KEY);
  } catch {
    /* ignore */
  }

  const input = {
    birthDate: profile.birthDate,
    nickname: profile.nickname,
    gender: profile.gender || undefined,
    birthTime: profile.birthTime,
    birthPlace: profile.birthPlace,
    focus: profile.focus,
  };

  // Warm deterministic packs so the loading screen does real work
  const daily = buildDailyReadingPack(input);
  analyzeFortune(input);
  buildPremiumValuePack(input);
  buildPremiumRitualsPack(input);

  const next = writeFortuneProfile({
    ...profile,
    updatedAt: new Date().toISOString(),
  });

  try {
    sessionStorage.setItem(
      PREMIUM_READING_REBUILT_KEY,
      JSON.stringify({
        at: next.updatedAt,
        seed: daily.analysis.seed,
        nickname: next.nickname,
        birthDate: next.birthDate,
        birthTime: next.birthTime ?? "",
        birthPlace: next.birthPlace ?? "",
      })
    );
  } catch {
    /* ignore */
  }

  return next;
}
