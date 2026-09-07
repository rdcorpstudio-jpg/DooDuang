/** Global entitlement — premium tab, face, palm, report */
export const PREMIUM_UNLOCK_KEY = "dooduang-premium-unlocked";

function legacyUnlockKey(birthDate: string, nickname: string) {
  return `lukkana-unlock-overall-${birthDate}-${nickname}`;
}

export function isPremiumUnlocked(profile?: {
  birthDate: string;
  nickname: string;
} | null): boolean {
  try {
    if (sessionStorage.getItem(PREMIUM_UNLOCK_KEY) === "1") return true;
    if (profile?.birthDate && profile?.nickname) {
      if (sessionStorage.getItem(legacyUnlockKey(profile.birthDate, profile.nickname)) === "1") {
        sessionStorage.setItem(PREMIUM_UNLOCK_KEY, "1");
        return true;
      }
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function setPremiumUnlocked(profile?: {
  birthDate: string;
  nickname: string;
} | null): void {
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
}
