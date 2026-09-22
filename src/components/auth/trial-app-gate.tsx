"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { startMaeNavigation } from "@/components/layout/navigation-loading";
import {
  ensureFreshFunnelLocalState,
  signOutForFreshStart,
} from "@/lib/fortune/funnel-reset";

/** Paths reachable without an active trial (marketing / auth / paywall / legal). */
function isTrialExemptPath(pathname: string) {
  if (pathname === "/") return true;
  if (pathname.startsWith("/login")) return true;
  if (pathname.startsWith("/auth")) return true;
  if (pathname.startsWith("/welcome")) return true;
  if (pathname.startsWith("/premium/pay")) return true;
  if (pathname.startsWith("/premium/thanks")) return true;
  if (pathname.startsWith("/pricing")) return true;
  if (pathname.startsWith("/terms")) return true;
  if (pathname.startsWith("/privacy")) return true;
  if (pathname.startsWith("/reviews")) return true;
  if (pathname.startsWith("/admin")) return true;
  return false;
}

/**
 * App routes need login + active trial (or premium).
 * - Guest / never-started trial → clear + landing (เริ่มเหมือนคนใหม่)
 * - Trial used and expired → `/premium/pay`
 */
export function TrialAppGate() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const checking = useRef(false);

  useEffect(() => {
    ensureFreshFunnelLocalState();
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
          trialEndsAtMs?: number | null;
        };
        if (!alive) return;

        if (!data.authenticated) {
          startMaeNavigation();
          router.replace("/");
          return;
        }

        if (data.canUseApp || data.premium) return;

        // Logged in but no access
        if (data.trialEndsAtMs == null) {
          await signOutForFreshStart();
          if (!alive) return;
          startMaeNavigation();
          router.replace("/");
          return;
        }

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
