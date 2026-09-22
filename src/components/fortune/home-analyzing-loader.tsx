"use client";

import { useEffect, useMemo, useState } from "react";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { APP_PAGE_BG } from "@/components/layout/bottom-nav";
import { MAE_GLASS } from "@/lib/mae-glass";
import { getZodiacByBirthDate } from "@/lib/fortune/zodiac";
import { cn } from "@/lib/utils";

const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

const GOLD = "#e8d19a";
const SESSION_KEY = "dd-home-analyze-shown";

/** ~4s staged home analysis — once per browser session. */
export const HOME_ANALYZE_MS = 4200;

export type HomeAnalyzeProfile = {
  birthDate: string;
  nickname?: string;
  birthTime?: string;
  birthPlace?: string;
  focus?: string;
};

function focusLabel(focus?: string) {
  switch (focus) {
    case "work":
      return "การงาน";
    case "money":
      return "การเงิน";
    case "love":
      return "ความรัก";
    case "health":
      return "สุขภาพ";
    default:
      return "ภาพรวมชีวิต";
  }
}

function buildSteps(profile: HomeAnalyzeProfile) {
  const zodiac = getZodiacByBirthDate(profile.birthDate);
  const name = profile.nickname?.trim();
  const steps: string[] = [
    name
      ? `อ่านโปรไฟล์ของ${name}`
      : "อ่านวันเกิดและโปรไฟล์",
    `เทียบราศี${zodiac.thaiName} · ธาตุ${zodiac.element}`,
    `วิเคราะห์คะแนนดวงวันนี้ · โฟกัส${focusLabel(profile.focus)}`,
  ];
  if (profile.birthTime) {
    steps.push(`ปรับความลึกจากเวลาเกิด ${profile.birthTime}`);
  }
  if (profile.birthPlace) {
    steps.push(`อ้างอิงที่เกิด · ${profile.birthPlace}`);
  }
  steps.push(
    "จัดข้อความดวงวันนี้และข้อควรระวัง",
    "คำนวณสีเสื้อมงคล",
    "ดูฤกษ์และช่วงเวลาวันนี้",
  );
  return steps;
}

export function shouldShowHomeAnalyze(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markHomeAnalyzeShown() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Staged loader mirroring real home analysis steps. */
export function HomeAnalyzingLoader({
  profile,
  durationMs = HOME_ANALYZE_MS,
  onDone,
  className,
}: {
  profile: HomeAnalyzeProfile;
  durationMs?: number;
  onDone?: () => void;
  className?: string;
}) {
  const steps = useMemo(() => buildSteps(profile), [profile]);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(6);

  useEffect(() => {
    const started = Date.now();
    let finished = false;
    const tick = window.setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / durationMs);
      const eased = 1 - Math.pow(1 - t, 1.45);
      setProgress(Math.min(100, Math.round(6 + eased * 94)));
      setStepIndex(Math.min(steps.length - 1, Math.floor(t * steps.length)));
      if (t >= 1 && !finished) {
        finished = true;
        window.clearInterval(tick);
        markHomeAnalyzeShown();
        onDone?.();
      }
    }, 70);
    return () => window.clearInterval(tick);
    // Intentionally omit onDone — parent may pass inline setter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs, steps.length]);

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-6",
        className,
      )}
      style={{ background: APP_PAGE_BG }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <MaePageBackground mode="fill" priority scrollBlur={false} />

      <div
        className="relative z-[2] w-full max-w-[20.5rem] rounded-[26px] px-5 py-7 text-center"
        style={{
          background: MAE_GLASS.bg,
          border: MAE_GLASS.border,
          boxShadow: MAE_GLASS.shadow,
          backdropFilter: MAE_GLASS.blur,
          WebkitBackdropFilter: MAE_GLASS.blur,
        }}
      >
        <div className="relative flex items-end justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="mae-load-beam rounded-full"
              style={{
                width: i === 1 ? 9 : 6,
                height: i === 1 ? 40 : 28,
                animationDelay: `${i * 0.22}s`,
              }}
              aria-hidden
            />
          ))}
        </div>

        <p
          className="relative mt-6 text-[18px] font-bold leading-snug tracking-wide"
          style={TITLE_GOLD}
        >
          กำลังวิเคราะห์ดวง
        </p>
        <p
          className="relative mx-auto mt-2.5 min-h-[3rem] max-w-[17rem] text-[15px] font-medium leading-[1.5]"
          style={{ color: "rgba(186,204,230,0.92)" }}
        >
          {steps[stepIndex]}
        </p>

        <div
          className="relative mx-auto mt-5 h-1.5 w-full max-w-[14rem] overflow-hidden rounded-full"
          style={{ background: "rgba(232,209,154,0.14)" }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-100 ease-out"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, #b8924f 0%, #e8d19a 55%, #fff8e4 100%)",
            }}
          />
        </div>

        <ul className="relative mx-auto mt-5 max-w-[17rem] space-y-1.5 text-left">
          {steps.map((step, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <li
                key={step}
                className="flex items-start gap-2 text-[12.5px] leading-snug"
                style={{
                  color: active
                    ? GOLD
                    : done
                      ? "rgba(186,204,230,0.55)"
                      : "rgba(186,204,230,0.28)",
                }}
              >
                <span
                  className="mt-[0.35em] h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    background: active || done ? GOLD : "rgba(186,204,230,0.25)",
                    boxShadow: active
                      ? "0 0 8px rgba(232,209,154,0.55)"
                      : undefined,
                  }}
                  aria-hidden
                />
                <span className={active ? "font-semibold" : undefined}>{step}</span>
              </li>
            );
          })}
        </ul>

        <p
          className="relative mt-6 text-[15px] font-semibold tracking-[0.12em]"
          style={{ color: GOLD }}
        >
          แม่มั่งมี พามู
        </p>
      </div>
    </div>
  );
}
