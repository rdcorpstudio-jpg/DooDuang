"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MaeLanding } from "@/components/home/mae-landing";
import {
  hasFreeReadingBasics,
  hydrateFortuneProfileFromWizard,
  readFortuneProfile,
} from "@/lib/fortune/profile-storage";

/**
 * `/` — marketing landing for new users.
 * After birth/name basics are saved, skip landing → daily fortune home.
 */
export function HomeGate() {
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    hydrateFortuneProfileFromWizard();
    if (hasFreeReadingBasics(readFortuneProfile())) {
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
