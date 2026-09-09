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
import { AstroHeroOrb } from "@/components/home/astro-hero-orb";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { APP_NAME_ACCENT, APP_NAME_PRIMARY } from "@/lib/site";
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
    <section className="sky-copy relative flex h-full min-h-full flex-col overflow-hidden px-5 pb-3 pt-4">
      <Reveal visible={mounted} delay={0} className="relative z-20 shrink-0">
        <div className="flex flex-col items-center">
          <FortuneIcon name="sparkle" size={18} className="mb-0.5" />
          <p className="font-sacred text-[13px] tracking-[0.28em] text-[#C9A227]">
            DOODUANG
          </p>
        </div>
      </Reveal>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-2">
        <Reveal
          visible={mounted}
          delay={40}
          variant="scale"
          className="w-full"
        >
          <div className="intro-orb-halo mx-auto w-full max-w-[280px] sm:max-w-[300px]">
            <AstroHeroOrb />
          </div>
        </Reveal>

        <Reveal
          visible={mounted}
          delay={120}
          variant="glow"
          className="-mt-1 w-full max-w-[320px] text-center"
        >
          <h1 className="font-sacred text-[2.15rem] font-bold leading-[1.15] tracking-wide text-[#2C2458] sm:text-[2.35rem]">
            <span>{APP_NAME_PRIMARY}</span>
            <span className="text-[#5B45B8]">{APP_NAME_ACCENT}</span>
          </h1>
          <p className="mt-2.5 text-[14px] font-medium leading-snug text-[#3A3270]">
            อ่านจังหวะชีวิตในแบบของคุณ
          </p>
          <p className="mt-1.5 text-[13px] leading-snug text-[#6B6490]">
            ค้นพบแนวทางเรื่องงาน เงิน และความรัก
          </p>
        </Reveal>

        <Reveal
          visible={mounted}
          delay={240}
          className="mt-5 w-full max-w-[320px]"
        >
          <Link
            href="/reading"
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-full px-6 py-3.5 outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/45"
            style={{
              background:
                "linear-gradient(90deg, #7B5FD4 0%, #9B7FE8 48%, #C4B0F5 100%)",
              boxShadow: "0 10px 28px rgba(123,95,212,0.32)",
            }}
          >
            <span className="text-[16px] font-bold tracking-wide text-white">
              เริ่มดูดวง
            </span>
            <ArrowRight
              className="h-[18px] w-[18px] text-white transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2.4}
            />
          </Link>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-[#6B6490]">
            <FortuneIcon name="lock" size={16} />
            ข้อมูลของคุณจะถูกเก็บเป็นส่วนตัว
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
                  i > 0 && "border-l border-[#7B6BB0]/22"
                )}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#B9A4F0]/28 ring-1 ring-[#9B7FE8]/25">
                  <Icon className="h-5 w-5 text-[#5B45B8]" strokeWidth={1.9} />
                </span>
                <p className="text-[12px] font-medium leading-snug text-[#3A3270]">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <p
            className="no-sky-lift mt-3.5 flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-wide text-[#6B6490]"
            aria-label={`คะแนน ${HOME_RATING.toFixed(1)} จำนวนรีวิวสะสม ${HOME_REVIEW_COUNT.toLocaleString("th-TH")} รายการ`}
          >
            <span className="tracking-[0.08em] text-[#C9A227]" aria-hidden>
              ★★★★★
            </span>
            <span className="font-semibold tabular-nums text-[#5B45B8]">
              {HOME_RATING.toFixed(1)}
            </span>
            <span className="text-[#B0A8C8]" aria-hidden>
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
