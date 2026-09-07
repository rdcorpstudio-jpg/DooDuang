"use client";

import { ChartNoAxesColumn, Lightbulb } from "lucide-react";
import { LifeCycleGraph } from "@/components/fortune/life-cycle-graph";
import { cn } from "@/lib/utils";

/** Life rhythm graph card for daily dashboard */
export function FortuneLifeTrendCompare({
  scores,
  labels,
  fullLabels,
  highlightIndex,
  highlightLabel,
  unlocked = false,
  onUnlock,
  uid = "life-trend",
  className,
}: {
  scores: number[];
  labels: string[];
  fullLabels: string[];
  highlightIndex: number;
  highlightLabel?: string;
  unlocked?: boolean;
  onUnlock?: () => void;
  uid?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start justify-between gap-3 px-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <ChartNoAxesColumn
            className="h-4 w-4 shrink-0 text-[#67e8f9]"
            strokeWidth={1.7}
          />
          <h2 className="text-[15px] font-semibold tracking-wide text-white">
            จังหวะชีวิต
            <span className="text-[#e8c547]/90">ของคุณ</span>
          </h2>
        </div>
        <p className="max-w-[9.5rem] pt-0.5 text-right text-[10.5px] leading-snug text-white/38">
          เดือนที่แล้ว → เดือนนี้
        </p>
      </div>

      <LifeCycleGraph
        key="life-free"
        title="กราฟจังหวะชีวิต"
        subtitle="เริ่มเห็นทิศทางชัดขึ้น ค่อย ๆ จัดลำดับสิ่งสำคัญ"
        scores={scores}
        labels={labels}
        fullLabels={fullLabels}
        highlightIndex={highlightIndex}
        highlightLabel={highlightLabel}
        uid={uid}
        blurFuture={!unlocked}
        onUnlock={onUnlock}
        rangeNote="ดูย้อนหลัง 3 เดือน"
        className="!rounded-[22px] fortune-frame-cyan fortune-frame-breathe"
      />

      <div className="fortune-dash-inset fortune-frame-cyan flex items-start gap-2.5 rounded-[14px] px-3 py-2.5">
        <Lightbulb
          className="mt-0.5 h-4 w-4 shrink-0 text-[#67e8f9]"
          strokeWidth={1.8}
        />
        <p className="text-[12px] leading-snug text-white/55">
          เริ่มเห็นทิศทางชัดขึ้น — ค่อย ๆ จัดลำดับสิ่งสำคัญ
        </p>
      </div>
    </div>
  );
}
