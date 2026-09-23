"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChartNoAxesColumn,
  Lightbulb,
  Lock,
  UserRound,
} from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import {
  APP_NAME_ACCENT,
  APP_NAME_PRIMARY,
  APP_TAGLINE,
} from "@/lib/site";
import { cn } from "@/lib/utils";

const FEATURES = [
  { label: "ความเป็นตัวคุณ", Icon: UserRound },
  { label: "จังหวะชีวิต", Icon: ChartNoAxesColumn },
  { label: "คำแนะนำ", Icon: Lightbulb },
] as const;

const HOME_REVIEW_COUNT = 75174;
const HOME_RATING = 5.0;

function Reveal({
  visible,
  delay,
  children,
  className,
  variant = "up",
}: {
  visible: boolean;
  delay: number;
  children: React.ReactNode;
  className?: string;
  variant?: "up" | "glow" | "scale";
}) {
  const animClass =
    variant === "glow"
      ? "reveal-glow"
      : variant === "scale"
        ? "reveal-scale"
        : "reveal-up";

  return (
    <div
      className={cn(animClass, visible && "is-visible", className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/** Home landing — lilac Guanyin mockup */
export function IntroScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 60);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="sky-copy relative flex min-h-full w-full max-w-full flex-col overflow-x-hidden px-5 pb-3 pt-4">
      <Reveal visible={mounted} delay={0} className="relative z-20 shrink-0">
        <div className="flex flex-col items-center">
          <FortuneIcon name="sparkle" size={18} className="mb-0.5" />
        </div>
      </Reveal>

      <div className="relative z-10 flex w-full max-w-full flex-1 flex-col items-center justify-center overflow-x-hidden py-2">
        <Reveal
          visible={mounted}
          delay={120}
          variant="glow"
          className="w-full max-w-[320px] text-center"
        >
          <h1 className="font-sacred text-[2.15rem] font-bold leading-[1.4] tracking-wide text-[#f7f4ec] sm:text-[2.35rem]">
            <span>{APP_NAME_PRIMARY}</span>{" "}
            <span className="mae-gold-text">{APP_NAME_ACCENT}</span>
          </h1>
          <p className="mt-2.5 text-[14px] font-medium leading-snug text-[#e8d19a]/90">
            {APP_TAGLINE}
          </p>
          <p className="mt-1.5 text-[13px] leading-snug text-[#bacce6]/75">
            ค้นพบแนวทางเรื่องงาน เงิน และความรัก
          </p>
        </Reveal>

        <Reveal
          visible={mounted}
          delay={240}
          className="mt-5 w-full max-w-[320px]"
        >
          <Link
            href="/welcome/preview"
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-full px-6 py-3.5 outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
            style={{
              background:
                "linear-gradient(100deg, #ffe999 0%, #e5b84d 50%, #cda451 100%)",
              boxShadow: "0 10px 28px rgba(143,110,56,0.32)",
            }}
          >
            <span className="text-[16px] font-bold tracking-wide text-[#1a1408]">
              เริ่มดูดวง
            </span>
            <ArrowRight
              className="h-[18px] w-[18px] text-[#1a1408] transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2.4}
            />
          </Link>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-[#bacce6]/70">
            <FortuneIcon name="lock" size={16} />
            ข้อมูลของคุณจะถูกเก็บเป็นความลับ เพื่อการทำนายเท่านั้น
          </p>
        </Reveal>

        <Reveal
          visible={mounted}
          delay={340}
          className="mt-6 w-full max-w-[340px]"
        >
          <div className="grid grid-cols-3 items-start">
            {FEATURES.map(({ label, Icon }, i) => (
              <div
                key={label}
                className={cn(
                  "flex flex-col items-center gap-2 px-1 text-center",
                  i > 0 && "border-l border-[#d5b16f]/22"
                )}
              >
                <Icon className="h-6 w-6 text-[#d5b16f]" strokeWidth={1.9} />
                <p className="text-[12px] font-medium leading-snug text-[#e8d19a]/90">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <p
            className="no-sky-lift mt-3.5 flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-wide text-[#bacce6]/70"
            aria-label={`คะแนน ${HOME_RATING.toFixed(1)} จำนวนรีวิวสะสม ${HOME_REVIEW_COUNT.toLocaleString("th-TH")} รายการ`}
          >
            <span className="tracking-[0.08em] text-[#C9A227]" aria-hidden>
              ★★★★★
            </span>
            <span className="font-semibold tabular-nums text-[#e8d19a]">
              {HOME_RATING.toFixed(1)}
            </span>
            <span className="text-[#bacce6]/50" aria-hidden>
              ·
            </span>
            <span>
              จำนวนรีวิวสะสม {HOME_REVIEW_COUNT.toLocaleString("th-TH")} รายการ
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
