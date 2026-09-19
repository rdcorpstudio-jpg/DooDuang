"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MaeLanding } from "@/components/home/mae-landing";
import { clearPremiumUnlocked } from "@/lib/fortune/premium-unlock";
import {
  hasFreeReadingBasics,
  hydrateFortuneProfileFromWizard,
  readFortuneProfile,
} from "@/lib/fortune/profile-storage";

/**
 * `/` — first-run app home for new users.
 * After birth/name basics are saved, skip home → daily fortune tab.
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
      router.replace("/premium");
      return;
    }
    setShowLanding(true);
  }, [router]);

  if (!showLanding) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-[14px] text-[#9AB8DC]">
        กำลังเปิด…
      </div>
    );
  }

  return <MaeLanding />;
}
