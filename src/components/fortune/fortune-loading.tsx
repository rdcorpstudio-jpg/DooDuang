"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { AstroHeroOrb } from "@/components/home/astro-hero-orb";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { cn } from "@/lib/utils";

const STEPS = [
  "ตรวจสอบข้อมูลพื้นดวง",
  "วิเคราะห์จังหวะชีวิต",
  "เชื่อมโยงการงาน การเงิน และความรัก",
  "สรุปภาพรวมสำหรับคุณ",
] as const;

interface FortuneLoadingProps {
  nickname?: string;
  categoryTitle?: string;
  /** External 0–100 progress; if omitted, animates internally */
  progress?: number;
}

function stepState(progress: number, index: number): "done" | "active" | "pending" {
  const thresholds = [18, 42, 68, 92];
  if (progress >= thresholds[index]) return "done";
  if (index === 0 || progress >= thresholds[index - 1]) return "active";
  return "pending";
}

export function FortuneLoading({
  nickname,
  categoryTitle,
  progress: progressProp,
}: FortuneLoadingProps) {
  const [internalProgress, setInternalProgress] = useState(4);
  const progress = progressProp ?? internalProgress;
  const pct = Math.round(Math.max(0, Math.min(100, progress)));

  useEffect(() => {
    if (progressProp != null) return;
    const started = Date.now();
    const duration = 5200;
    const timer = window.setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / duration);
      const eased = 1 - Math.pow(1 - t, 1.65);
      setInternalProgress(Math.min(96, 4 + eased * 92));
    }, 50);
    return () => window.clearInterval(timer);
  }, [progressProp]);

  return (
    <div className="fortune-loading sky-copy absolute inset-0 z-50 flex flex-col overflow-hidden px-5 pb-5 pt-4">
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="w-[6.5rem]" aria-hidden />
        <div className="flex flex-col items-center pt-0.5">
          <FortuneIcon name="sparkle" size={16} className="mb-0.5" />
          <p className="font-sacred text-[13px] tracking-[0.28em] text-[#C9A227]">
            DOODUANG
          </p>
        </div>
        <span className="fortune-loading-pill fortune-loading-pill-status mt-0.5">
          <span className="fortune-loading-pulse-dot" />
          กำลังวิเคราะห์
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center pt-1">
        <div className="fortune-loading-chart relative mx-auto w-full max-w-[220px]">
          <AstroHeroOrb />
        </div>

        <h2 className="mt-1 max-w-[20rem] text-center text-[1.45rem] font-bold leading-[1.35] tracking-tight text-[#241C4F]">
          กำลังอ่าน จังหวะชีวิตของคุณ
        </h2>
        <p className="mt-1.5 max-w-[18rem] text-center text-[12.5px] leading-snug text-[#5E5688]">
          วิเคราะห์ข้อมูลเพื่อสรุปคำทำนายเฉพาะคุณ
        </p>
        {(nickname || categoryTitle) && (
          <p className="mt-1 text-center text-[11px] text-[#8A82B0]">
            {[categoryTitle, nickname].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="fortune-loading-card fortune-glass mt-4 w-full max-w-[320px] px-3.5 py-3">
          <p className="mb-2 text-[12px] font-semibold text-[#241C4F]">
            ขั้นตอนการวิเคราะห์
          </p>
          <ul className="overflow-hidden rounded-[14px]">
            {STEPS.map((label, i) => {
              const state = stepState(progress, i);
              return (
                <li
                  key={label}
                  className={cn(
                    "fortune-loading-row",
                    state === "active" && "is-active",
                    state === "done" && "is-done",
                  )}
                >
                  <span className="min-w-0 flex-1 text-[12.5px] leading-snug tracking-wide">
                    {label}
                  </span>
                  <span className="fortune-loading-status" aria-hidden>
                    {state === "done" ? (
                      <span className="fortune-loading-check">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    ) : state === "active" ? (
                      <span className="fortune-loading-dots">
                        <i />
                        <i />
                        <i />
                      </span>
                    ) : (
                      <span className="fortune-loading-empty" />
                    )}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 px-0.5">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-[#7A7198]">
                ความคืบหน้า
              </span>
              <span className="text-[12px] font-semibold tabular-nums text-[#6B4EC8]">
                {pct}%
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-[#E8E0F8]/90">
              <div
                className="fortune-loading-fill absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${Math.max(4, pct)}%` }}
              />
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[12px] tracking-wide text-[#7A7198]">
          อีกสักครู่ คำทำนายของคุณจะพร้อมอ่าน
        </p>
      </div>
    </div>
  );
}
