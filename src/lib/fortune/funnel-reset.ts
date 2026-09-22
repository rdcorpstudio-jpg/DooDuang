import { clearIntake } from "@/lib/fortune/intake-storage";
import {
  clearFortuneProfile,
  WIZARD_CACHE_KEY,
} from "@/lib/fortune/profile-storage";
import { clearPremiumUnlocked } from "@/lib/fortune/premium-unlock";

/** Bump to force every browser to clear old guest/local profile once. */
export const FUNNEL_RESET_KEY = "dd-funnel-reset-v1";

/** Wipe local onboarding / guest profile so the funnel starts clean. */
export function resetLocalFunnelState() {
  clearFortuneProfile();
  clearIntake();
  clearPremiumUnlocked();
  try {
    sessionStorage.removeItem(WIZARD_CACHE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * One-time per browser: clear leftover guest state from before the trial funnel.
 * Returns true if a reset ran.
 */
export function ensureFreshFunnelLocalState() {
  try {
    if (typeof localStorage === "undefined") return false;
    if (localStorage.getItem(FUNNEL_RESET_KEY) === "1") return false;
    resetLocalFunnelState();
    localStorage.setItem(FUNNEL_RESET_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

/** Sign out + clear local so the user looks brand-new. */
export async function signOutForFreshStart() {
  resetLocalFunnelState();
  try {
    await fetch("/api/auth/signout", { method: "POST", cache: "no-store" });
  } catch {
    /* ignore */
  }
}
