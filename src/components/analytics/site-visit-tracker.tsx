"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackClientEvent } from "@/lib/analytics/client";

const VISITOR_KEY = "dd-visitor-id";
const SESSION_KEY = "dd-visit-session";

function ensureVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return `v_${Date.now()}`;
  }
}

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
      const visitorId = ensureVisitorId();
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
