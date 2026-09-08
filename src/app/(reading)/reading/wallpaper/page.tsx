"use client";

import { Suspense } from "react";
import { FortuneWallpaper } from "@/components/fortune/fortune-wallpaper";

function WallpaperPageInner() {
  return <FortuneWallpaper />;
}

export default function WallpaperPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-[13px] text-[#5E5688]">
          กำลังเปิดวอลเปเปอร์มงคล…
        </div>
      }
    >
      <WallpaperPageInner />
    </Suspense>
  );
}
