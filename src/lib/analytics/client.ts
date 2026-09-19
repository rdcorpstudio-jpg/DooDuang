"use client";

import {
  isClientAnalyticsEventName,
  isAnalyticsFeature,
  type ClientAnalyticsEventName,
  type AnalyticsFeature,
} from "@/lib/analytics/events";
import { rememberLastFeature } from "@/lib/analytics/last-feature";
import { getOrCreateVisitorId } from "@/lib/analytics/visitor-id";

const OFFER_VIEW_SESSION_KEY = "dd-offer-view";

/** Saw the premium price / offer card (once per browser session). */
export function trackOfferView(opts?: {
  path?: string | null;
  feature?: AnalyticsFeature | string | null;
}): void {
  try {
    if (typeof sessionStorage !== "undefined") {
      if (sessionStorage.getItem(OFFER_VIEW_SESSION_KEY)) return;
      sessionStorage.setItem(OFFER_VIEW_SESSION_KEY, "1");
    }
  } catch {
    // still send if storage is blocked
  }
  trackClientEvent({
    name: "offer_view",
    feature: opts?.feature,
    path: opts?.path,
    props: { visitorId: getOrCreateVisitorId() },
  });
}

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
      path:
        opts.path ??
        (typeof window !== "undefined" ? window.location.pathname : null),
      props: opts.props ?? null,
    });

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
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

/** Open / focus a product feature — also remembers last feature for pay attribution. */
export function trackFeatureOpen(
  feature: AnalyticsFeature | string,
  opts?: {
    path?: string | null;
    source?: string;
    props?: Record<string, unknown> | null;
  }
): void {
  if (!isAnalyticsFeature(feature)) return;
  rememberLastFeature(feature);
  trackClientEvent({
    name: "feature_open",
    feature,
    path: opts?.path,
    props: {
      ...(opts?.props || {}),
      ...(opts?.source ? { source: opts.source } : {}),
    },
  });
}
