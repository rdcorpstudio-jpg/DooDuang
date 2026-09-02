"use client";

import { ArrowUp, Moon } from "lucide-react";
import { SacredCtaLink } from "@/components/ui/sacred-cta-link";
import { SacredCorners, SacredDivider, SacredMark } from "@/components/ui/sacred-mark";
import { FORTUNE_DISCLAIMER } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";

interface FortuneSectionProps {
  onScrollUp: () => void;
  scrollProgress?: number;
}

function Reveal({
  visible,
  delay,
  className,
  children,
  variant = "up",
}: {
  visible: boolean;
  delay: number;
  className?: string;
  children: React.ReactNode;
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

export function FortuneSection({ onScrollUp, scrollProgress = 0 }: FortuneSectionProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.42 });
  const visible = inView || scrollProgress > 0.55;

  const entryOffset = Math.max(0, 1 - scrollProgress) * 48;
  const entryOpacity = 0.3 + scrollProgress * 0.7;

  return (
    <section
      ref={ref}
      id="fortune"
      className="relative flex h-full min-h-full shrink-0 snap-start snap-always flex-col items-center justify-center overflow-hidden sacred-page-bg"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(168,85,247,0.28),transparent_55%)]"
        style={{ opacity: 0.45 + scrollProgress * 0.35 }}
      />
      <div
        className="pointer-events-none absolute top-[30%] left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-brand-purple/25 blur-3xl animate-float"
        style={{ opacity: 0.35 + scrollProgress * 0.45 }}
      />

      <div
        className="relative z-10 w-full px-6 pb-28 pt-4 transition-[transform,opacity] duration-300 ease-out"
        style={{
          transform: `translateY(${entryOffset}px)`,
          opacity: visible ? Math.max(entryOpacity, 0.88) : entryOpacity,
        }}
      >
        <div className="relative mx-auto max-w-[300px] rounded-3xl border border-brand-purple-light/15 bg-brand-purple-dark/25 px-6 py-8 text-center shadow-[0_0_40px_rgba(88,28,135,0.25),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
          <SacredCorners className="text-amber-200/35" />
          <div className="pointer-events-none absolute inset-3 rounded-2xl border border-brand-purple-light/10" />

          <Reveal visible={visible} delay={0} variant="glow">
            <div className="relative mx-auto mb-5 flex h-12 w-12 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.18),transparent_70%)]" />
              <div className="absolute inset-0 rounded-full border border-amber-200/25" />
              <Moon
                className="relative h-5 w-5 text-amber-100/85 animate-float"
                strokeWidth={1.4}
                fill="currentColor"
                fillOpacity={0.12}
              />
            </div>
          </Reveal>

          <Reveal visible={visible} delay={100}>
            <p className="mb-4 text-[10px] font-light tracking-[0.32em] text-amber-200/55 uppercase">
              พร้อมแล้ว
            </p>
          </Reveal>

          <Reveal visible={visible} delay={200}>
            <h2 className="font-sacred text-[2rem] leading-[1.15] text-white/95">
              ดวงชะตา
              <br />
              <span className="intro-title-accent">รอคุณอยู่</span>
            </h2>
          </Reveal>

          <Reveal visible={visible} delay={320}>
            <SacredDivider className="my-5" />
            <p className="text-[14px] font-light leading-relaxed text-purple-100/72">
              เปิดรับคำทำนายจากจักรวาล
            </p>
          </Reveal>

          <Reveal visible={visible} delay={440} variant="scale" className="mt-8">
            <SacredCtaLink href="/reading">กดเพื่อดูดวงชะตา</SacredCtaLink>
          </Reveal>

          <Reveal visible={visible} delay={560}>
            <div className="mt-6 flex items-center justify-center gap-2">
              <SacredMark size="xs" className="text-amber-200/30" />
              <p className="text-[10px] tracking-wide text-purple-300/45">{FORTUNE_DISCLAIMER}</p>
              <SacredMark size="xs" className="text-amber-200/30" />
            </div>
          </Reveal>
        </div>
      </div>

      <Reveal visible={visible} delay={680} className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2">
        <button
          type="button"
          onClick={onScrollUp}
          className="group flex items-center gap-2 text-[11px] text-purple-300/55 transition-colors hover:text-purple-100/80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-purple-light/20 bg-brand-purple-dark/30 transition-colors group-hover:border-amber-200/25">
            <ArrowUp className="h-3.5 w-3.5 animate-bounce-soft" />
          </span>
          กลับด้านบน
        </button>
      </Reveal>
    </section>
  );
}
