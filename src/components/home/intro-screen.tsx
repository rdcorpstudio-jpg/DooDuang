"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { AstroHeroOrb } from "@/components/home/astro-hero-orb";
import { APP_NAME_ACCENT, APP_NAME_PRIMARY } from "@/lib/site";
import { cn } from "@/lib/utils";

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
    variant === "glow" ? "reveal-glow" : variant === "scale" ? "reveal-scale" : "reveal-up";

  return (
    <div
      className={cn(animClass, visible && "is-visible", className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

function SacredOrnament() {
  return (
    <div className="intro-sacred-ornament mx-auto mt-4 flex items-center justify-center gap-1.5" aria-hidden>
      <span className="intro-sacred-line intro-sacred-line-lg" />
      <span className="intro-sacred-diamond intro-sacred-diamond-sm" />
      <span className="intro-sacred-diamond" />
      <span className="intro-sacred-diamond intro-sacred-diamond-sm" />
      <span className="intro-sacred-line intro-sacred-line-lg" />
    </div>
  );
}

export function IntroScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 60);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="intro-sacred relative flex h-full min-h-full flex-col overflow-hidden px-5">
      <div className="absolute inset-x-5 top-5 z-20">
        <Reveal visible={mounted} delay={0}>
          <p className="text-[11px] font-medium tracking-[0.42em] text-[#e8c547]/80">
            DOODUANG
          </p>
        </Reveal>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-10">
        <Reveal visible={mounted} delay={40} variant="scale" className="w-full">
          <div className="intro-orb-halo mx-auto">
            <AstroHeroOrb />
          </div>
        </Reveal>

        <Reveal visible={mounted} delay={130} variant="glow" className="mt-2 w-full max-w-[310px] text-center">
          <h1 className="font-sacred text-[2.25rem] leading-[1.12] tracking-wide drop-shadow-[0_0_28px_rgba(232,197,71,0.35)] sm:text-[2.45rem]">
            <span className="intro-title-primary">{APP_NAME_PRIMARY}</span>
            <span className="intro-title-accent">{APP_NAME_ACCENT}</span>
          </h1>
          <p className="mt-3 text-[13px] font-light leading-relaxed tracking-wide text-white/60">
            อ่านจังหวะชีวิตในแบบของคุณ
          </p>
          <SacredOrnament />
        </Reveal>

        <Reveal visible={mounted} delay={280} variant="up" className="mt-7 w-full max-w-[310px]">
          <Link href="/reading" className="intro-cta group relative block w-full">
            <span className="intro-cta-glow" aria-hidden />
            <span className="intro-cta-surface">
              <span className="intro-cta-shine" aria-hidden />
              <span className="intro-cta-label relative z-[1]">เริ่มดูดวง</span>
              <ArrowRight
                className="relative z-[1] h-[17px] w-[17px] text-[#1a1440] transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2.3}
              />
            </span>
          </Link>
        </Reveal>

        <Reveal visible={mounted} delay={380} className="mt-5 w-full max-w-[310px]">
          <p className="flex items-center justify-center gap-1.5 text-[11px] tracking-wide text-white/35">
            <Lock className="h-3 w-3 text-[#e8c547]/75" strokeWidth={1.8} />
            ข้อมูลของคุณจะถูกเก็บเป็นส่วนตัว
          </p>
          <p className="mt-3 flex items-center justify-center gap-3 text-[11px] text-white/30">
            <Link href="/privacy" className="hover:text-[#F4BC52]/80">
              ความเป็นส่วนตัว
            </Link>
            <span aria-hidden>·</span>
            <Link href="/terms" className="hover:text-[#F4BC52]/80">
              ข้อกำหนด
            </Link>
            <span aria-hidden>·</span>
            <Link href="/premium" className="hover:text-[#F4BC52]/80">
              พรีเมียม
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
