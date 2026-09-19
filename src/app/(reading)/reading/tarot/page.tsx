"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FortuneDailyTarot } from "@/components/fortune/fortune-daily-tarot";

function TarotPageInner() {
  const params = useSearchParams();
  const seed = useMemo(() => {
    const fromQuery = params.get("seed");
    if (fromQuery && fromQuery.trim()) return fromQuery.trim();
    const day = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    return `tarot-daily-${day}`;
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
