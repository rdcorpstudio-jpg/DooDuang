"use client";

import { PremiumHomePage } from "@/components/fortune/premium-home-page";

/**
 * Dev preview: unlocked premium tab (same UI as free, fully unlocked)
 */
export default function PreviewPremiumPage() {
  return (
    <div className="relative h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-[480px] pb-16">
        <p className="mb-1 px-4 pt-4 text-center text-[11px] tracking-wide text-white/35">
          หน้าพรีวิว · /preview/premium (โหมดปลดล็อก)
        </p>
        <PremiumHomePage
          forceUnlocked
          previewSeed="preview-overall-nat-1995-09-07-female"
        />
      </div>
    </div>
  );
}
