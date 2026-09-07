"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { AstroHeroOrb } from "@/components/home/astro-hero-orb";
import { cn } from "@/lib/utils";

const STEPS = [
  "ตรวจสอบข้อมูลพื้นดวง",
  "วิเคราะห์จังหวะชีวิต",
  "เชื่อมโยงการงาน การเงิน และความสัมพันธ์",
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

  const activeStep = STEPS.findIndex((_, i) => stepState(progress, i) === "active");
  const subtitle =
    activeStep === 0
      ? "เชื่อมโยงข้อมูลพื้นดวง"
      : activeStep === 1
        ? "วิเคราะห์จังหวะชีวิต"
        : activeStep === 2
          ? "เชื่อมโยงการงาน การเงิน และความสัมพันธ์"
          : "สรุปภาพรวมสำหรับคุณ";

  return (
    <div className="fortune-loading absolute inset-0 z-50 flex flex-col overflow-hidden px-5 pb-6 pt-5">
      <div className="relative z-10 flex items-center justify-between gap-3">
        <span className="fortune-loading-pill">DOODUANG</span>
        <span className="fortune-loading-pill fortune-loading-pill-status">
          <span className="fortune-loading-pulse-dot" />
          กำลังวิเคราะห์
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center pt-1">
        <div className="fortune-loading-chart relative mx-auto w-full max-w-[248px]">
          <AstroHeroOrb />
        </div>

        <h2 className="mt-0 max-w-[300px] text-center font-sacred text-[1.55rem] leading-[1.28] tracking-wide">
          <span className="block text-white">กำลังอ่าน</span>
          <span className="intro-title-accent">จังหวะชีวิตของคุณ</span>
        </h2>
        <p className="mt-2 text-center text-[13px] font-light tracking-wide text-[#a8b4d8]/85">
          {subtitle}
        </p>
        {(nickname || categoryTitle) && (
          <p className="mt-1 text-center text-[11px] text-white/30">
            {[categoryTitle, nickname].filter(Boolean).join(" · ")}
          </p>
        )}

        <ul className="fortune-loading-card mt-5 w-full max-w-[320px]">
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
                <span className="min-w-0 flex-1 text-[13px] leading-snug tracking-wide">
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

        <div className="mt-5 w-full max-w-[320px]">
          <div className="relative h-1.5 overflow-visible rounded-full bg-white/[0.08]">
            <div
              className="fortune-loading-fill absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${Math.max(4, progress)}%` }}
            />
            <span
              className="fortune-loading-pct"
              style={{ left: `${Math.max(4, Math.min(progress, 96))}%` }}
            >
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        <p className="mt-7 text-center text-[12px] tracking-wide text-white/35">
          อีกสักครู่ เราจะพาคุณไปดูภาพรวม
        </p>
      </div>
    </div>
  );
}
