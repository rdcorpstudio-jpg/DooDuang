"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { featureFromPath } from "@/lib/analytics/events";
import { trackClientEvent } from "@/lib/analytics/client";

/**
 * Fires feature_open once per path+search when the route maps to a known feature.
 */
export function FeatureOpenTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";
    const feature = featureFromPath(pathname || "/", search);
    if (!feature) return;

    const key = `${pathname}${search}::${feature}`;
    if (lastKey.current === key) return;
    lastKey.current = key;

    trackClientEvent({
      name: "feature_open",
      feature,
      path: `${pathname}${search}`,
    });
  }, [pathname, searchParams]);

  return null;
}
