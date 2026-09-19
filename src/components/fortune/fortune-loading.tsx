"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { MAE_GLASS } from "@/lib/mae-glass";
import { cn } from "@/lib/utils";

/** Keep parent wait timers in sync with the loading animation. */
export const FORTUNE_LOADING_DURATION_MS = 11_000;

const STEPS = [
  { id: "profile", label: "ตรวจสอบชื่อและวันเกิด" },
  { id: "chart", label: "จัดวางแผนภูมิพื้นดวง" },
  { id: "rhythm", label: "วิเคราะห์จังหวะชีวิตช่วงนี้" },
  { id: "aspects", label: "เชื่อมโยงงาน เงิน ความรัก" },
  { id: "summary", label: "สรุปคำทำนายเฉพาะคุณ" },
] as const;

/** Progress % when each step becomes done */
const DONE_AT = [18, 36, 55, 74, 92] as const;

const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

const GOLD = "#e8d19a";

interface FortuneLoadingProps {
  nickname?: string;
  categoryTitle?: string;
  /** External 0–100 progress; if omitted, animates internally */
  progress?: number;
}

function stepState(
  progress: number,
  index: number,
): "done" | "active" | "pending" {
  if (progress >= DONE_AT[index]) return "done";
  const prev = index === 0 ? 0 : DONE_AT[index - 1];
  if (progress >= prev) return "active";
  return "pending";
}

function activeLabel(progress: number) {
  for (let i = STEPS.length - 1; i >= 0; i--) {
    if (stepState(progress, i) === "active") return STEPS[i].label;
    if (stepState(progress, i) === "done" && i === STEPS.length - 1) {
      return "พร้อมสรุปผลแล้ว";
    }
  }
  return STEPS[0].label;
}

export function FortuneLoading({
  nickname,
  categoryTitle,
  progress: progressProp,
}: FortuneLoadingProps) {
  const [internalProgress, setInternalProgress] = useState(2);
  const [mounted, setMounted] = useState(false);
  const progress = progressProp ?? internalProgress;
  const pct = Math.round(Math.max(0, Math.min(100, progress)));
  const nowLabel = activeLabel(progress);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (progressProp != null) return;
    const started = Date.now();
    const duration = FORTUNE_LOADING_DURATION_MS;
    const timer = window.setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / duration);
      const eased = 1 - Math.pow(1 - t, 1.35);
      setInternalProgress(Math.min(97, 2 + eased * 95));
    }, 60);
    return () => window.clearInterval(timer);
  }, [progressProp]);

  return (
    <div
      className="fortune-loading relative z-50 flex h-full min-h-full w-full flex-col overflow-x-hidden overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.85rem,env(safe-area-inset-top))]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <MaePageBackground priority mode="fill" scrollBlur={false} />

      <div
        className={cn(
          "relative z-10 mx-auto flex min-h-full w-full max-w-[400px] flex-col transition duration-500",
          mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 pt-1">
          <p
            className="text-[13px] font-semibold tracking-[0.16em]"
            style={{ color: GOLD }}
          >
            แม่มั่งมี พามู
          </p>
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
            style={{
              color: GOLD,
              background: "rgba(8, 16, 32, 0.55)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
            }}
          >
            <span className="mae-load-pulse-dot" aria-hidden />
            {pct}%
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-6">
          <div
            className="relative w-full overflow-hidden rounded-[26px] px-4 pb-5 pt-6"
            style={{
              background: MAE_GLASS.bg,
              border: MAE_GLASS.border,
              boxShadow: `${MAE_GLASS.shadow}, ${MAE_GLASS.highlight}`,
              backdropFilter: MAE_GLASS.blur,
              WebkitBackdropFilter: MAE_GLASS.blur,
            }}
          >
            <span className="mae-load-glow pointer-events-none absolute inset-x-12 top-0 h-20 rounded-full opacity-80" />

            <div className="relative mx-auto flex h-[5.5rem] w-[5.5rem] items-center justify-center">
              <svg
                className="absolute inset-0 -rotate-90"
                viewBox="0 0 120 120"
                aria-hidden
              >
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="rgba(232,209,154,0.14)"
                  strokeWidth="5"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="url(#fortuneLoadGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
                  style={{ transition: "stroke-dashoffset 180ms linear" }}
                />
                <defs>
                  <linearGradient
                    id="fortuneLoadGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#b8924f" />
                    <stop offset="55%" stopColor="#e8d19a" />
                    <stop offset="100%" stopColor="#fff8e4" />
                  </linearGradient>
                </defs>
              </svg>
              <span
                className="text-[1.45rem] font-bold tabular-nums"
                style={{ color: GOLD }}
              >
                {pct}
              </span>
            </div>

            <h2
              className="relative mt-5 text-center text-[clamp(1.35rem,5vw,1.6rem)] font-bold leading-[1.35]"
              style={TITLE_GOLD}
            >
              กำลังอ่านดวงชะตา
            </h2>
            <p className="relative mt-2 text-center text-[14.5px] font-medium leading-snug text-[rgba(186,204,230,0.85)]">
              {nowLabel}
            </p>
            {nickname || categoryTitle ? (
              <p
                className="relative mt-1.5 text-center text-[13px] font-semibold"
                style={{ color: "rgba(232,209,154,0.88)" }}
              >
                {[categoryTitle, nickname].filter(Boolean).join(" · ")}
              </p>
            ) : null}

            <ul className="relative mt-5 space-y-1.5">
              {STEPS.map((step, i) => {
                const state = stepState(progress, i);
                return (
                  <li
                    key={step.id}
                    className={cn(
                      "flex items-center gap-3 rounded-[14px] px-3 py-2.5 transition duration-300",
                      state === "active" && "bg-[rgba(232,209,154,0.1)]",
                    )}
                    style={
                      state !== "active"
                        ? {
                            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                          }
                        : {
                            boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.28)",
                          }
                    }
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums transition",
                        state === "done" && "text-[#1a1408]",
                        state === "active" && "text-[#1a1408]",
                        state === "pending" && "text-white/35",
                      )}
                      style={
                        state === "done" || state === "active"
                          ? {
                              background:
                                "linear-gradient(155deg, #fff8e4 0%, #e8d19a 50%, #d5b16f 100%)",
                            }
                          : { background: "rgba(255,255,255,0.06)" }
                      }
                      aria-hidden
                    >
                      {state === "done" ? (
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 flex-1 text-[13.5px] font-medium leading-snug",
                        state === "done" && "text-white",
                        state === "active" && "text-[#e8d19a]",
                        state === "pending" && "text-white/40",
                      )}
                    >
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div
              className="relative mt-4 h-1.5 overflow-hidden rounded-full"
              style={{ background: "rgba(232,209,154,0.12)" }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${Math.max(4, pct)}%`,
                  background:
                    "linear-gradient(90deg, #b8924f 0%, #e8d19a 55%, #fff8e4 100%)",
                  transition: "width 180ms linear",
                }}
              />
            </div>
          </div>

          <p
            className="mt-5 text-center text-[13px] font-medium tracking-wide"
            style={{ color: "rgba(232,209,154,0.75)" }}
          >
            รอสักครู่ แม่กำลังจัดคำทำนายให้
          </p>
        </div>
      </div>
    </div>
  );
}
