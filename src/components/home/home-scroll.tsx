"use client";

import { IntroScreen } from "@/components/home/intro-screen";

export function HomeScroll() {
  return (
    <div className="h-full overflow-y-auto overscroll-y-contain">
      <IntroScreen />
    </div>
  );
}
