"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { startMaeNavigation } from "@/components/layout/navigation-loading";

/** Paths that stay reachable after trial expires (paywall / legal / auth / marketing). */
function isTrialExemptPath(pathname: string) {
  if (pathname === "/") return true;
  if (pathname.startsWith("/login")) return true;
  if (pathname.startsWith("/auth")) return true;
  if (pathname.startsWith("/welcome")) return true;
  if (pathname.startsWith("/premium/pay")) return true;
  if (pathname.startsWith("/premium/thanks")) return true;
  if (pathname.startsWith("/terms")) return true;
  if (pathname.startsWith("/privacy")) return true;
  if (pathname.startsWith("/reviews")) return true;
  if (pathname.startsWith("/admin")) return true;
  return false;
}

/**
 * Only when logged-in trial ends (and not premium) → bounce to `/premium/pay`.
 * Does not force login on landing / home — login sits after the first form (old pay step).
 */
export function TrialAppGate() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const checking = useRef(false);

  useEffect(() => {
    if (isTrialExemptPath(pathname)) return;
    if (checking.current) return;
    let alive = true;
    checking.current = true;

    (async () => {
      try {
        const res = await fetch("/api/premium/status", { cache: "no-store" });
        const data = (await res.json()) as {
          authenticated?: boolean;
          canUseApp?: boolean;
          premium?: boolean;
        };
        if (!alive) return;
        if (!data.authenticated) return;
        if (data.canUseApp || data.premium) return;
        startMaeNavigation();
        router.replace("/premium/pay?reason=trial");
      } catch {
        /* ignore network blips */
      } finally {
        checking.current = false;
      }
    })();

    return () => {
      alive = false;
    };
  }, [pathname, router]);

  return null;
}
