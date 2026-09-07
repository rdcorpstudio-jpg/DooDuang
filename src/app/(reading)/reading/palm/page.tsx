"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FortunePalmReading } from "@/components/fortune/fortune-palm-reading";

function PalmPageInner() {
  const params = useSearchParams();
  const seed = useMemo(() => {
    const fromQuery = params.get("seed");
    if (fromQuery?.trim()) return fromQuery.trim();
    return `palm-${new Date().toISOString().slice(0, 10)}`;
  }, [params]);

  return <FortunePalmReading seed={seed} />;
}

export default function PalmReadingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-[13px] text-white/40">
          กำลังเปิดลายมือ…
        </div>
      }
    >
      <PalmPageInner />
    </Suspense>
  );
}
