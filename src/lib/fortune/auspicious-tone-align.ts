import type { DayEnergy, DayProfile } from "@/lib/fortune/auspicious-calendar";
import type { FortuneTone } from "@/lib/fortune/analyze";

/** Map analysis day tone → calendar energy so the same day doesn't fight itself */
export function dayEnergyFromTone(tone: FortuneTone): DayEnergy {
  if (tone === "high") return "strong";
  if (tone === "mid") return "smooth";
  return "rest";
}

export function withToneEnergy(
  profile: DayProfile,
  tone: FortuneTone
): DayProfile {
  return { ...profile, energy: dayEnergyFromTone(tone) };
}
