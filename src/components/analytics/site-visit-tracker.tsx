"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackClientEvent } from "@/lib/analytics/client";
import { getOrCreateVisitorId } from "@/lib/analytics/visitor-id";

const SESSION_KEY = "dd-visit-session";

/**
 * Counts unique site visitors once per browser session (not every route change).
 */
export function SiteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      if (!pathname || pathname.startsWith("/admin")) return;
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
      const visitorId = getOrCreateVisitorId();
      trackClientEvent({
        name: "page_view",
        path: pathname,
        props: { visitorId },
      });
    } catch {
      // fail-open
    }
  }, [pathname]);

  return null;
}
