"use client";

import { Suspense } from "react";
import { FortuneBazi } from "@/components/fortune/bazi/fortune-bazi";

export default function BaziPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-[13px] text-white/40">
          กำลังเปิดปาจื้อ…
        </div>
      }
    >
      <FortuneBazi />
    </Suspense>
  );
}
