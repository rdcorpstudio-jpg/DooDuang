"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  featureFromPath,
  type AnalyticsFeature,
} from "@/lib/analytics/events";
import { trackClientEvent, trackFeatureOpen } from "@/lib/analytics/client";
import { getOrCreateVisitorId } from "@/lib/analytics/visitor-id";

/**
 * Tracks every screen (screen_view) + mapped product features (feature_open).
 * Dedupes consecutive identical path/search/hash keys.
 */
export function FeatureOpenTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastScreenKey = useRef<string | null>(null);
  const lastFeatureKey = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const search = searchParams?.toString()
      ? `?${searchParams.toString()}`
      : "";
    const hash =
      typeof window !== "undefined" ? window.location.hash || "" : "";
    const fullPath = `${pathname}${search}${hash}`;
    const visitorId = getOrCreateVisitorId();

    if (lastScreenKey.current !== fullPath) {
      lastScreenKey.current = fullPath;
      trackClientEvent({
        name: "screen_view",
        path: pathname,
        props: {
          visitorId,
          search: search || null,
          hash: hash || null,
        },
      });
    }

    const feature: AnalyticsFeature | undefined = featureFromPath(
      pathname,
      search,
      hash
    );
    if (!feature) return;

    const featureKey = `${fullPath}::${feature}`;
    if (lastFeatureKey.current === featureKey) return;
    lastFeatureKey.current = featureKey;

    trackFeatureOpen(feature, {
      path: fullPath,
      source: "route",
      props: { visitorId },
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    function onHashChange() {
      if (!pathname || pathname.startsWith("/admin")) return;
      const search = searchParams?.toString()
        ? `?${searchParams.toString()}`
        : "";
      const hash = window.location.hash || "";
      const feature = featureFromPath(pathname, search, hash);
      if (!feature) return;
      const fullPath = `${pathname}${search}${hash}`;
      const featureKey = `${fullPath}::${feature}`;
      if (lastFeatureKey.current === featureKey) return;
      lastFeatureKey.current = featureKey;
      trackFeatureOpen(feature, {
        path: fullPath,
        source: "hash",
        props: { visitorId: getOrCreateVisitorId() },
      });
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname, searchParams]);

  return null;
}
