"use client";

import { ArrowUp, Moon, Sparkles } from "lucide-react";
import { SacredCtaLink } from "@/components/ui/sacred-cta-link";
import { SacredCorners, SacredDivider, SacredMark } from "@/components/ui/sacred-mark";
import { Reveal } from "@/components/ui/reveal";
import { FORTUNE_DISCLAIMER } from "@/lib/site";
import { useInView } from "@/hooks/use-in-view";

interface FortuneSectionProps {
  onScrollUp: () => void;
  scrollProgress?: number;
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(168,85,247,0.34),transparent_55%)]"
        style={{ opacity: 0.5 + scrollProgress * 0.35 }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[30%] h-56 w-56 -translate-x-1/2 rounded-full bg-brand-purple/30 blur-3xl animate-float"
        style={{ opacity: 0.4 + scrollProgress * 0.45 }}
      />

      <div
        className="relative z-10 w-full px-6 pb-28 pt-4 transition-[transform,opacity] duration-300 ease-out"
        style={{
          transform: `translateY(${entryOffset}px)`,
          opacity: visible ? Math.max(entryOpacity, 0.88) : entryOpacity,
        }}
      >
        <Reveal visible={visible} delay={0} variant="scale" className="relative mx-auto max-w-[300px]">
          {/* Depth shadow */}
          <div className="pointer-events-none absolute inset-x-2 bottom-0 top-3 rounded-[28px] bg-black/45 blur-lg" />

          <div className="relative overflow-hidden rounded-[28px] border border-brand-purple-light/30 bg-brand-purple-dark/70 px-6 py-8 text-center shadow-[0_0_48px_rgba(88,28,135,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
            <SacredCorners className="text-amber-200/45" />
            <div className="pointer-events-none absolute inset-3 rounded-[22px] border border-brand-purple-light/18" />

            {/* Purple bloom inside card */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(168,85,247,0.42),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_0%,rgba(255,255,255,0.1),transparent_55%)]" />

            <div className="relative z-[1]">
              <Reveal visible={visible} delay={80} variant="glow">
                <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center">
                  <span className="absolute inset-[-6px] rounded-full border border-[#e8c4b0]/25" />
                  <span className="absolute inset-[-12px] rounded-full border border-dashed border-white/15 intro-portal-spin-reverse" />
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.22),transparent_70%)]" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-amber-200/30 bg-black/20 shadow-[0_0_24px_rgba(232,196,176,0.2)]">
                    <Moon
                      className="h-5 w-5 animate-float text-amber-100"
                      strokeWidth={1.4}
                      fill="currentColor"
                      fillOpacity={0.14}
                    />
                  </div>
                </div>
              </Reveal>

              <Reveal visible={visible} delay={160}>
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#e8c4b0]/30 bg-[#e8c4b0]/10 px-3 py-1">
                  <Sparkles className="h-3 w-3 text-[#e8c4b0]" strokeWidth={1.8} />
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-[#e8c4b0]">
                    พร้อมแล้ว
                  </span>
                </div>
              </Reveal>

              <Reveal visible={visible} delay={240}>
                <h2 className="font-sacred text-[2rem] leading-[1.15] text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.25)]">
                  ดวงชะตา
                  <br />
                  <span className="intro-title-accent">รอคุณอยู่</span>
                </h2>
              </Reveal>

              <Reveal visible={visible} delay={340}>
                <SacredDivider className="my-5" />
                <p className="text-[14px] font-light leading-relaxed text-purple-100/80">
                  เปิดรับคำทำนายจากจักรวาล
                </p>
              </Reveal>

              <Reveal visible={visible} delay={460} variant="scale" className="mt-8">
                <SacredCtaLink href="/reading">กดเพื่อดูดวงชะตา</SacredCtaLink>
              </Reveal>

              <Reveal visible={visible} delay={580}>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <SacredMark size="xs" className="text-amber-200/40" />
                  <p className="text-[10px] tracking-wide text-purple-200/50">{FORTUNE_DISCLAIMER}</p>
                  <SacredMark size="xs" className="text-amber-200/40" />
                </div>
              </Reveal>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal visible={visible} delay={700} className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2">
        <button
          type="button"
          onClick={onScrollUp}
          className="group flex items-center gap-2 text-[11px] text-purple-300/55 transition-colors hover:text-purple-100/80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-purple-light/25 bg-brand-purple-dark/50 transition-colors group-hover:border-amber-200/30">
            <ArrowUp className="h-3.5 w-3.5 animate-bounce-soft" />
          </span>
          กลับด้านบน
        </button>
      </Reveal>
    </section>
  );
}
