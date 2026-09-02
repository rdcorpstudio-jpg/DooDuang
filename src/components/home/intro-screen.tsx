"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { AstroBackground } from "@/components/home/astro-background";
import { useSacredBurst } from "@/components/ui/sacred-burst";
import { SacredMark } from "@/components/ui/sacred-mark";
import { APP_NAME_ACCENT, APP_NAME_PRIMARY, APP_TAGLINE } from "@/lib/site";
import { cn } from "@/lib/utils";

interface IntroScreenProps {
  onScrollDown: () => void;
  scrollProgress?: number;
}

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: 8 + (i * 7.5) % 84,
  delay: i * 0.55,
  duration: 4 + (i % 3),
}));

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
  variant?: "up" | "scale" | "glow";
}) {
  const animClass =
    variant === "scale" ? "reveal-scale" : variant === "glow" ? "reveal-glow" : "reveal-up";

  return (
    <div
      className={cn(animClass, visible && "is-visible", className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

function MysticPortal() {
  return (
    <div className="pointer-events-none absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="intro-aurora h-72 w-72 rounded-full blur-3xl opacity-60" />
      </div>
      <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-purple/30 blur-[60px] animate-float" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="intro-aurora-gold h-40 w-40 rounded-full bg-amber-300/10 blur-[40px]" />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="intro-rays h-[320px] w-[320px] rounded-full opacity-30" />
      </div>

      <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-purple-light/25 intro-portal-spin" />
      <div className="absolute top-1/2 left-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/15 intro-portal-spin-reverse" />
      <div className="absolute top-1/2 left-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-purple/30 intro-portal-spin" style={{ animationDuration: "14s" }} />
      <div className="absolute top-1/2 left-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 animate-ring-pulse" />

      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <span
          key={deg}
          className="absolute top-1/2 left-1/2 h-[150px] w-px origin-bottom bg-gradient-to-t from-transparent via-brand-purple-light/25 to-transparent"
          style={{ transform: `translate(-50%, -100%) rotate(${deg}deg)` }}
        />
      ))}
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
      className="relative h-full min-h-full flex flex-col items-center justify-center overflow-hidden snap-start snap-always shrink-0 sacred-page-bg transition-[transform,opacity] duration-300 ease-out"
      style={{
        opacity: fadeOut,
        transform: `translateY(${liftUp}px) scale(${1 - scrollProgress * 0.03})`,
      }}
    >
      <AstroBackground />

      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="intro-particle-rise absolute bottom-0 h-1 w-1 rounded-full bg-purple-300/60"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      <MysticPortal />

      <div className="relative z-10 text-center px-8">
        <Reveal visible={mounted} delay={0}>
          <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-brand-purple-light/35 intro-icon-ring" />
            <span className="absolute inset-1 rounded-full border border-amber-200/20 intro-icon-ring-reverse" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-purple-dark/40 shadow-[0_0_30px_rgba(168,85,247,0.55)]">
              <Sparkles className="h-6 w-6 text-brand-purple-light animate-float drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
            </div>
          </div>
        </Reveal>

        <Reveal visible={mounted} delay={150}>
          <p className="intro-welcome-shimmer mb-8 text-[13px] font-normal tracking-[0.18em] text-amber-100/80">
            ยินดีต้อนรับ
          </p>
        </Reveal>

        <Reveal visible={mounted} delay={300} variant="glow">
          <h1 className="intro-title-glow font-sacred mb-7 leading-none">
            <span className="block text-[3.1rem] text-white/95">{APP_NAME_PRIMARY}</span>
            <span className="intro-title-accent mt-1 block text-[3.4rem]">{APP_NAME_ACCENT}</span>
          </h1>
        </Reveal>

        <Reveal visible={mounted} delay={480}>
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-14 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent intro-line-grow" />
            <SacredMark size="xs" className="text-amber-200/60 animate-twinkle" style={{ "--twinkle-duration": "2s" } as React.CSSProperties} />
            <span className="h-px w-14 bg-gradient-to-l from-transparent via-amber-300/40 to-transparent intro-line-grow" />
          </div>
          <p className="text-[15px] font-normal leading-[1.9] text-purple-100/70">
            {APP_TAGLINE}
          </p>
        </Reveal>
      </div>

      <Reveal visible={mounted} delay={650} className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2">
        <button
          onClick={(e) => {
            triggerBurst(e);
            onScrollDown();
          }}
          className="group flex flex-col items-center gap-2.5 cursor-pointer"
          aria-label="เลื่อนลง"
        >
          <span className="text-[10px] font-light tracking-[0.32em] text-purple-300/50 transition-colors group-hover:text-amber-100/80">
            เลื่อนลง
          </span>
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full">
            <BurstLayer size="sm" className="rounded-full" />
            <span className="absolute inset-0 rounded-full border border-brand-purple-light/30 intro-scroll-ring" />
            <span className="relative z-[1] flex h-9 w-9 items-center justify-center rounded-full border border-brand-purple-light/25 bg-brand-purple-light/10 shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all group-hover:border-amber-200/30 group-hover:shadow-[0_0_28px_rgba(168,85,247,0.4)]">
              <ChevronDown className="h-4 w-4 animate-bounce-soft text-purple-200/80" />
            </span>
          </span>
        </button>
      </Reveal>
    </section>
  );
}
