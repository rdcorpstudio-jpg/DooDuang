"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { useSacredBurst } from "@/components/ui/sacred-burst";
import { SacredCtaLink } from "@/components/ui/sacred-cta-link";
import { SacredMark } from "@/components/ui/sacred-mark";
import {
  APP_NAME_ACCENT,
  APP_NAME_PRIMARY,
  APP_PURPOSE,
  APP_TAGLINE,
} from "@/lib/site";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface IntroScreenProps {
  onScrollDown: () => void;
  scrollProgress?: number;
}

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
  variant?: "up" | "glow";
}) {
  const animClass = variant === "glow" ? "reveal-glow" : "reveal-up";

  return (
    <div
      className={cn(animClass, visible && "is-visible", className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export function IntroScreen({ onScrollDown, scrollProgress = 0 }: IntroScreenProps) {
  const [mounted, setMounted] = useState(false);
  const { triggerBurst, BurstLayer } = useSacredBurst();
  const fadeOut = 1 - scrollProgress * 0.35;
  const liftUp = scrollProgress * -28;

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section
      className="relative flex h-full min-h-full shrink-0 snap-start snap-always flex-col items-center justify-center overflow-hidden transition-[transform,opacity] duration-300 ease-out"
      style={{
        opacity: fadeOut,
        transform: `translateY(${liftUp}px) scale(${1 - scrollProgress * 0.03})`,
      }}
    >
      {/* Soft readable scrim under copy only — keeps zodiac visible */}
      <div
        className="pointer-events-none absolute left-1/2 top-[38%] h-[42%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(10,4,24,0.55)_0%,transparent_72%)]"
        aria-hidden
      />

      <div className="relative z-10 px-8 text-center">
        <Reveal visible={mounted} delay={0}>
          <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-[#d4a090]/35" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black/25 shadow-[0_0_24px_rgba(212,160,144,0.35)] backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-[#e8c4b0] drop-shadow-[0_0_8px_rgba(232,196,176,0.7)]" />
            </div>
          </div>
        </Reveal>

        <Reveal visible={mounted} delay={150}>
          <p className="mb-7 text-[15px] font-normal tracking-[0.18em] text-white/80">
            ยินดีต้อนรับ
          </p>
        </Reveal>

        <Reveal visible={mounted} delay={300} variant="glow">
          <h1 className="intro-title-glow font-sacred mb-5 leading-none">
            <span className="text-[2.85rem] text-white sm:text-[3.1rem]">{APP_NAME_PRIMARY}</span>
            <span className="intro-title-accent text-[2.85rem] sm:text-[3.1rem]">{APP_NAME_ACCENT}</span>
          </h1>
        </Reveal>

        <Reveal visible={mounted} delay={450}>
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-14 bg-gradient-to-r from-transparent via-[#d4a090]/50 to-transparent" />
            <SacredMark size="xs" className="text-[#e8c4b0]/70" />
            <span className="h-px w-14 bg-gradient-to-l from-transparent via-[#d4a090]/50 to-transparent" />
          </div>
          <p className="mb-3 text-[16px] font-normal leading-[1.9] text-white/70">{APP_TAGLINE}</p>
          <p className="mx-auto mb-5 max-w-[280px] text-[13px] font-light leading-relaxed text-white/55">
            {APP_PURPOSE}
          </p>
          <div className="mx-auto mb-4 max-w-[240px]">
            <SacredCtaLink href="/reading">เริ่มดูดวง ไม่ต้องล็อกอิน</SacredCtaLink>
          </div>
          <p className="text-[11px] text-white/40">
            <Link href="/privacy" className="underline-offset-2 hover:text-white/70 hover:underline">
              นโยบายความเป็นส่วนตัว
            </Link>
            <span className="mx-2">·</span>
            <Link href="/terms" className="underline-offset-2 hover:text-white/70 hover:underline">
              ข้อกำหนด
            </Link>
          </p>
        </Reveal>
      </div>

      <Reveal
        visible={mounted}
        delay={650}
        className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2"
      >
        <button
          type="button"
          onClick={(e) => {
            triggerBurst(e);
            onScrollDown();
          }}
          className="group flex cursor-pointer flex-col items-center gap-2.5"
          aria-label="เลื่อนลง"
        >
          <span className="text-[12px] font-light tracking-[0.28em] text-white/45 transition-colors group-hover:text-[#e8c4b0]">
            เลื่อนลง
          </span>
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full">
            <BurstLayer size="sm" className="rounded-full" />
            <span className="absolute inset-0 rounded-full border border-[#d4a090]/35" />
            <span className="relative z-[1] flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/20 backdrop-blur-sm">
              <ChevronDown className="h-4 w-4 animate-bounce-soft text-[#e8c4b0]/90" />
            </span>
          </span>
        </button>
      </Reveal>
    </section>
  );
}
