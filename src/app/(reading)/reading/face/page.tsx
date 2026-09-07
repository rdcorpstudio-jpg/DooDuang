"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FortuneFaceReading } from "@/components/fortune/fortune-face-reading";

function FacePageInner() {
  const params = useSearchParams();
  const seed = useMemo(() => {
    const fromQuery = params.get("seed");
    if (fromQuery?.trim()) return fromQuery.trim();
    return `face-${new Date().toISOString().slice(0, 10)}`;
  }, [params]);

  return <FortuneFaceReading seed={seed} />;
}

export default function FaceReadingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-[13px] text-white/40">
          กำลังเปิดโหงวเฮ้ง…
        </div>
      }
    >
      <FacePageInner />
    </Suspense>
  );
}
