"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { HOME_CHOOSE_HREF } from "@/lib/site";
import { cn } from "@/lib/utils";

const C = {
  navy: "#101827",
} as const;

function Reveal({
  visible,
  delay,
  children,
  className,
  style,
  variant = "up",
}: {
  visible: boolean;
  delay: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: "up" | "scale" | "glow";
}) {
  return (
    <div
      className={cn(
        "mae-reveal",
        variant === "scale" && "mae-reveal--scale",
        variant === "glow" && "mae-reveal--glow",
        visible && "is-visible",
        className
      )}
      style={{ ["--mae-delay" as string]: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/** First-run `/` — one-screen app home (not a long marketing page). */
export function MaeLanding() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className="mae-home-screen mae-landing relative flex h-full min-h-0 max-w-full flex-col overflow-hidden text-white"
      style={{ background: C.navy }}
    >
      <section className="mae-hero-plate relative flex min-h-0 flex-1 flex-col overflow-hidden px-5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <video
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 40%" }}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/bg/mae-bg-poster.webp?v=new1"
          >
            <source src="/videos/mae-bg.mp4?v=new1" type="video/mp4" />
          </video>
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(180deg, rgba(16,24,39,0.08) 0%, transparent 22%, transparent 62%, rgba(16,24,39,0.55) 86%, rgba(16,24,39,0.88) 100%)
              `,
            }}
          />
        </div>

        <div className="mae-hero-wordmark pointer-events-none absolute left-1/2 z-10 w-[min(76%,15.25rem)] -translate-x-1/2 -translate-y-1/2">
          <Reveal visible={mounted} delay={60} variant="glow">
            <Image
              src="/images/brand/mae-wordmark-sm.webp?v=clear1"
              alt="แม่มั่งมี พามู"
              width={400}
              height={200}
              priority
              unoptimized
              className="mae-logo-breathe h-auto w-full object-contain"
            />
          </Reveal>
        </div>

        <div className="mae-hero-spacer relative z-0 w-full shrink-0" aria-hidden />

        <div
          className={cn(
            "mae-hero-copy mae-hero-stagger relative z-10 mx-auto mt-auto flex w-full max-w-[22rem] flex-col items-center text-center md:max-w-[24rem]",
            mounted && "is-visible"
          )}
        >
          <p className="mae-hero-lede">
            งาน เงิน ความรัก ช่วงนี้เป็นยังไงบ้าง
            <br />
            มาคุยกับแม่ เดี๋ยวแม่ช่วยดูให้
          </p>
          <Link
            href={HOME_CHOOSE_HREF}
            className="mae-home-cta group relative mx-auto flex min-h-12 w-full items-center justify-center rounded-full px-6 outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
          >
            <span className="text-[16px] font-bold tracking-wide">
              ดูคำทำนาย
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
