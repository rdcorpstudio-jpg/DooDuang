import type { AnalyticsFeature } from "@/lib/analytics/events";
import { isAnalyticsFeature } from "@/lib/analytics/events";

const LAST_FEATURE_KEY = "dd-last-feature";

/** Remember last opened product feature (for pay_view attribution). */
export function rememberLastFeature(feature: AnalyticsFeature | string | null | undefined) {
  try {
    if (typeof window === "undefined") return;
    if (!feature || !isAnalyticsFeature(feature)) return;
    sessionStorage.setItem(LAST_FEATURE_KEY, feature);
  } catch {
    // fail-open
  }
}

export function readLastFeature(): AnalyticsFeature | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(LAST_FEATURE_KEY);
    if (!raw || !isAnalyticsFeature(raw)) return null;
    return raw;
  } catch {
    return null;
  }
}
