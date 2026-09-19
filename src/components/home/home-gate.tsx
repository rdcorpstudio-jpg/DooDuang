"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MaeLanding } from "@/components/home/mae-landing";
import { MaePageLoading } from "@/components/layout/mae-page-loading";
import { startMaeNavigation } from "@/components/layout/navigation-loading";
import { clearPremiumUnlocked } from "@/lib/fortune/premium-unlock";
import {
  hasFreeReadingBasics,
  hydrateFortuneProfileFromWizard,
  readFortuneProfile,
} from "@/lib/fortune/profile-storage";

/**
 * `/` — marketing landing for new users.
 * CTA → /welcome (ฟอร์มสั้น) → preview → pay.
 * After birth/name basics are saved, skip landing → daily fortune home.
 */
export function HomeGate() {
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    hydrateFortuneProfileFromWizard();
    const fromLogout =
      new URLSearchParams(window.location.search).get("from") === "logout";
    if (fromLogout) clearPremiumUnlocked();
    if (!fromLogout && hasFreeReadingBasics(readFortuneProfile())) {
      startMaeNavigation();
      router.replace("/home");
      return;
    }
    setShowLanding(true);
  }, [router]);

  if (!showLanding) {
    return <MaePageLoading label="กำลังเปิด…" hint="กำลังเช็กโปรไฟล์ของคุณ" />;
  }

  return <MaeLanding />;
}
