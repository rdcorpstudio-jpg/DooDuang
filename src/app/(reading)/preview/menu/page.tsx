"use client";

import { FeatureMenuPage } from "@/components/fortune/feature-menu-page";

/**
 * Design preview: app-style feature menu (future Premium tab replacement).
 * Open /preview/menu — not wired into bottom-nav yet.
 */
export default function PreviewMenuPage() {
  return (
    <div className="relative h-full overflow-y-auto">
      <FeatureMenuPage backHref="/preview/result" />
    </div>
  );
}
