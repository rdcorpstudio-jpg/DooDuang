"use client";

import { useEffect, useState, type CSSProperties, type FocusEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { MaePageLoading } from "@/components/layout/mae-page-loading";
import { startMaeNavigation } from "@/components/layout/navigation-loading";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import { ensureFreshFunnelLocalState } from "@/lib/fortune/funnel-reset";
import { readIntake, writeIntake } from "@/lib/fortune/intake-storage";
import { cn } from "@/lib/utils";

const MAE = {
  gold: "#e8d19a",
  muted: "rgba(186, 204, 230, 0.78)",
} as const;

const GOLD_BTN =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";
const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

type IntakeStep = "name" | "focus";
type StepDir = "forward" | "back";

const FOCUS_CHOICES: {
  id: FortuneFocus;
  title: string;
  blurb: string;
}[] = [
  {
    id: "life",
    title: "ภาพรวมชีวิต",
    blurb: "จังหวะและทิศทางช่วงนี้",
  },
  {
    id: "work",
    title: "การงาน",
    blurb: "หน้าที่ โอกาส การตัดสินใจ",
  },
  {
    id: "money",
    title: "การเงิน",
    blurb: "รายรับรายจ่าย จังหวะลงทุน",
  },
  {
    id: "love",
    title: "ความรัก",
    blurb: "ความสัมพันธ์ ความเข้าใจ",
  },
];

function scrollFieldIntoView(event: FocusEvent<HTMLInputElement>) {
  const el = event.currentTarget;
  window.setTimeout(() => {
    const scroller = el.closest<HTMLElement>(".overflow-y-auto, .overflow-y-scroll");
    if (!scroller || scroller.scrollHeight <= scroller.clientHeight + 2) return;
    el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, 120);
}

function delayStyle(ms: number): CSSProperties {
  return { "--wizard-delay": `${ms}ms` } as CSSProperties;
}

/**
 * ฟอร์มสั้นหลังกดเริ่ม — 2 หน้า
 * 1) ชื่อที่อยากให้เรียก
 * 2) เรื่องที่อยากดู
 * แล้วไปหน้าโชว์ตัวอย่าง → ปุ่มทดลองฟรี → ล็อกอิน
 */
export function OnboardingIntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<IntakeStep>("name");
  const [dir, setDir] = useState<StepDir>("forward");
  const [nickname, setNickname] = useState("");
  const [focus, setFocus] = useState<FortuneFocus>("life");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureFreshFunnelLocalState();
    const saved = readIntake();
    if (saved) {
      setNickname(saved.nickname);
      const allowed = new Set(FOCUS_CHOICES.map((c) => c.id));
      setFocus(allowed.has(saved.focus) ? saved.focus : "life");
    }
    setReady(true);
  }, []);

  function goToFocus() {
    const name = nickname.trim();
    if (!name) return;
    writeIntake({ nickname: name, focus });
    setDir("forward");
    setStep("focus");
  }

  function goContinue() {
    const name = nickname.trim();
    if (!name) {
      setDir("back");
      setStep("name");
      return;
    }
    writeIntake({ nickname: name, focus });
    const raw = (searchParams.get("next") || "").trim();
    const next =
      raw.startsWith("/") && !raw.startsWith("//")
        ? raw
        : "/welcome/preview";
    startMaeNavigation();
    router.push(next);
  }

  const stepNumber = step === "name" ? 1 : 2;

  if (!ready) {
    return (
      <MaePageLoading label="กำลังเปิด…" hint="กำลังเช็กข้อมูลก่อนเริ่ม" />
    );
  }

  return (
    <div
      className="mae-wizard relative mx-auto h-full min-h-0 w-full max-w-[480px] overflow-hidden text-white"
      style={{ background: "transparent" }}
    >
      <MaePageBackground mode="fill" blur={14} scrollBlur={false} />

      <div className="relative z-[2] flex h-full min-h-0 flex-col px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        <div
          className="wizard-anim-item flex shrink-0 items-center justify-end gap-3"
          style={delayStyle(20)}
        >
          <div className="shrink-0 text-right">
            <p
              className="text-[15px] font-semibold tabular-nums"
              style={{ color: MAE.gold }}
            >
              <span key={stepNumber} className="wizard-step-num inline-block">
                {stepNumber}
              </span>
              <span className="text-white/40">/2</span>
            </p>
            <div className="mt-1.5 flex justify-end gap-1">
              {[1, 2].map((n) => (
                <span
                  key={n}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    n <= stepNumber ? "w-5 bg-[#d5b16f]" : "w-5 bg-white/18",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          key={step}
          className={cn(
            "wizard-step-panel flex min-h-0 flex-1 flex-col",
            dir === "forward" ? "wizard-step-forward" : "wizard-step-back",
          )}
        >
          {step === "name" ? (
            <>
              <div
                className="wizard-anim-item mt-6 shrink-0 text-center"
                style={delayStyle(60)}
              >
                <p
                  className="text-[15px] font-semibold tracking-[0.16em]"
                  style={{ color: MAE.gold }}
                >
                  เริ่มต้นกับแม่
                </p>
                <h1
                  className="mt-2.5 overflow-visible py-1 text-[clamp(1.85rem,6.5vw,2.05rem)] font-bold leading-[1.35]"
                  style={TITLE_GOLD}
                >
                  ให้แม่เรียกคุณว่าอะไรดี
                </h1>
                <p
                  className="mx-auto mt-3 max-w-[21rem] text-[16px] font-medium leading-relaxed"
                  style={{ color: MAE.muted }}
                >
                  บอกชื่อเล่นก่อน แล้วแม่จะถามเรื่องที่อยากรู้ต่อ
                </p>
              </div>

              <div
                className="wizard-anim-item mt-8 flex-1"
                style={delayStyle(140)}
              >
                <label className="block">
                  <span
                    className="mb-2 block text-[16px] font-semibold tracking-wide"
                    style={{ color: "rgba(236,214,168,0.92)" }}
                  >
                    ชื่อที่อยากให้แม่เรียก
                  </span>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onFocus={scrollFieldIntoView}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        goToFocus();
                      }
                    }}
                    placeholder="เช่น น้องมั่งมี"
                    className="mae-wizard-input h-[3.35rem] w-full rounded-full px-5 text-[17px] font-medium outline-none"
                    autoComplete="nickname"
                    enterKeyHint="next"
                    autoFocus
                  />
                </label>
              </div>

              <div
                className="wizard-anim-item sticky bottom-0 z-10 mt-4 shrink-0 pb-1 pt-3"
                style={delayStyle(220)}
              >
                <button
                  type="button"
                  onClick={goToFocus}
                  disabled={!nickname.trim()}
                  className="group relative flex h-[3.35rem] w-full items-center justify-center gap-2 overflow-hidden rounded-full outline-none transition active:scale-[0.98] disabled:opacity-45"
                  style={{
                    color: "#1a1408",
                    background: GOLD_BTN,
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.28), 0 6px 16px rgba(143, 110, 56, 0.28)",
                  }}
                >
                  <span className="text-[17px] font-bold tracking-wide">ไปต่อ</span>
                  <ChevronRight
                    className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.6}
                  />
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                className="wizard-anim-item mt-6 shrink-0 text-center"
                style={delayStyle(60)}
              >
                <p
                  className="text-[15px] font-semibold tracking-[0.14em]"
                  style={{ color: MAE.gold }}
                >
                  สวัสดี{nickname.trim() ? ` ${nickname.trim()}` : ""}
                </p>
                <h1
                  className="mt-2.5 overflow-visible py-1 text-[clamp(1.85rem,6.5vw,2.05rem)] font-bold leading-[1.35]"
                  style={TITLE_GOLD}
                >
                  อยากให้แม่ดูเรื่องอะไรก่อน
                </h1>
                <p
                  className="mx-auto mt-3 max-w-[20rem] text-[16px] leading-relaxed"
                  style={{ color: MAE.muted }}
                >
                  เลือก 1 เรื่อง แล้วแม่จะพาไปดูว่าจะได้อะไรบ้าง
                </p>
              </div>

              <div
                className="wizard-anim-item mt-6 flex-1 px-0.5"
                style={delayStyle(140)}
              >
                <div className="grid grid-cols-2 gap-3 pb-2">
                  {FOCUS_CHOICES.map((choice, i) => {
                    const selected = focus === choice.id;
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => setFocus(choice.id)}
                        className={cn(
                          "wizard-anim-item relative flex min-h-[7.25rem] flex-col items-center justify-center gap-1.5 rounded-[20px] px-3 py-4 text-center outline-none transition duration-200",
                          "active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#e8d19a]/45",
                          selected
                            ? "bg-[rgba(18,28,48,0.88)]"
                            : "bg-[rgba(18,28,48,0.55)] hover:bg-[rgba(18,28,48,0.72)]",
                        )}
                        style={{
                          ...delayStyle(160 + i * 55),
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                          boxShadow: selected
                            ? "inset 0 0 0 1.5px rgba(232,209,154,0.65)"
                            : "inset 0 0 0 1px rgba(213,177,111,0.28)",
                        }}
                      >
                        {selected ? (
                          <span className="absolute right-2.5 top-2.5">
                            <Check
                              className="h-4 w-4 text-[#e8d19a]"
                              strokeWidth={2.8}
                              aria-hidden
                            />
                          </span>
                        ) : null}
                        <span className="min-w-0">
                          <span className="block text-[17px] font-bold tracking-wide text-white">
                            {choice.title}
                          </span>
                          <span
                            className="mt-1.5 block text-[16px] font-medium leading-snug"
                            style={{ color: MAE.muted }}
                          >
                            {choice.blurb}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className="wizard-anim-item sticky bottom-0 z-10 mt-4 shrink-0 pb-1 pt-3"
                style={delayStyle(280)}
              >
                <button
                  type="button"
                  onClick={goContinue}
                  className="group relative flex h-[3.35rem] w-full items-center justify-center gap-2 overflow-hidden rounded-full outline-none transition active:scale-[0.98]"
                  style={{
                    color: "#1a1408",
                    background: GOLD_BTN,
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.28), 0 6px 16px rgba(143, 110, 56, 0.28)",
                  }}
                >
                  <span className="text-[17px] font-bold tracking-wide">ไปต่อ</span>
                  <ChevronRight
                    className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.6}
                  />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
