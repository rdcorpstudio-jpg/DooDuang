"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MaeLanding } from "@/components/home/mae-landing";
import { MaePageLoading } from "@/components/layout/mae-page-loading";
import { startMaeNavigation } from "@/components/layout/navigation-loading";
import {
  ensureFreshFunnelLocalState,
  signOutForFreshStart,
} from "@/lib/fortune/funnel-reset";
import {
  hasFreeReadingBasics,
  hydrateFortuneProfileFromWizard,
  readFortuneProfile,
} from "@/lib/fortune/profile-storage";

/**
 * `/` — marketing landing for new users.
 * CTA → /welcome/preview → ทดลองฟรี → /login → /reading → /home.
 * After a started trial expires (and not premium) → /premium/pay.
 * Never-started / guest leftovers → clear and show landing like a first visit.
 */
export function HomeGate() {
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    let alive = true;
    ensureFreshFunnelLocalState();
    hydrateFortuneProfileFromWizard();

    const fromLogout =
      new URLSearchParams(window.location.search).get("from") === "logout";

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

        if (data.authenticated && !data.canUseApp && !data.premium) {
          if (data.trialEndsAtMs == null) {
            await signOutForFreshStart();
            if (alive) setShowLanding(true);
            return;
          }
          startMaeNavigation();
          router.replace("/premium/pay?reason=trial");
          return;
        }

        if (
          data.authenticated &&
          (data.canUseApp || data.premium) &&
          !fromLogout &&
          hasFreeReadingBasics(readFortuneProfile())
        ) {
          startMaeNavigation();
          router.replace("/home");
          return;
        }
      } catch {
        /* fall through to landing */
      }

      if (alive) setShowLanding(true);
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  if (!showLanding) {
    return <MaePageLoading label="กำลังเปิด…" hint="กำลังเช็กโปรไฟล์ของคุณ" />;
  }

  return <MaeLanding />;
}
