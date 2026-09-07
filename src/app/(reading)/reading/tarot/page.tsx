"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FortuneDailyTarot } from "@/components/fortune/fortune-daily-tarot";

function TarotPageInner() {
  const params = useSearchParams();
  const seed = useMemo(() => {
    const fromQuery = params.get("seed");
    if (fromQuery && fromQuery.trim()) return fromQuery.trim();
    return `tarot-daily-${new Date().toISOString().slice(0, 10)}`;
  }, [params]);

  return <FortuneDailyTarot seed={seed} />;
}

export default function TarotPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-[13px] text-white/40">
          กำลังเปิดไพ่รายวัน…
        </div>
      }
    >
      <TarotPageInner />
    </Suspense>
  );
}
