"use client";

import {
  isClientAnalyticsEventName,
  isAnalyticsFeature,
  type ClientAnalyticsEventName,
  type AnalyticsFeature,
} from "@/lib/analytics/events";

export function trackClientEvent(opts: {
  name: ClientAnalyticsEventName;
  feature?: AnalyticsFeature | string | null;
  path?: string | null;
  props?: Record<string, unknown> | null;
}): void {
  try {
    if (!isClientAnalyticsEventName(opts.name)) return;
    const feature =
      typeof opts.feature === "string" && isAnalyticsFeature(opts.feature)
        ? opts.feature
        : undefined;

    const body = JSON.stringify({
      name: opts.name,
      feature: feature ?? null,
      path: opts.path ?? (typeof window !== "undefined" ? window.location.pathname : null),
      props: opts.props ?? null,
    });

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/event", blob);
      return;
    }

    void fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // fail-open
  }
}
