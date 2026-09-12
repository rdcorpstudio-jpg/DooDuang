"use client";

import { Suspense } from "react";
import { FeatureMenuPage } from "@/components/fortune/feature-menu-page";

/**
 * Design preview: app-style feature menu.
 * Open /preview/menu
 */
export default function PreviewMenuPage() {
  return (
    <div className="relative h-full overflow-y-auto">
      <Suspense
        fallback={
          <div className="px-4 py-10 text-center text-[14px] text-[#f7f4ec]/55">
            กำลังเปิดเมนู…
          </div>
        }
      >
        <FeatureMenuPage backHref="/preview/result" />
      </Suspense>
    </div>
  );
}
