"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** Gold semicircle life-energy gauge (not a zodiac wheel) */
export function LifePowerGauge({
  score,
  max = 12,
  className,
}: {
  score: number;
  max?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const clamped = Math.max(0, Math.min(max, score));
  const ratio = clamped / max;

  const W = 280;
  const H = 168;
  const cx = 140;
  const cy = 148;
  const r = 112;
  const stroke = 14;

  // Semicircle from left (−180°) to right (0°), SVG y-down
  const start = { x: cx - r, y: cy };
  const end = { x: cx + r, y: cy };
  const trackPath = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;

  const angle = Math.PI * (1 - ratio); // π → 0 as score fills
  const tip = {
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  };
  const largeArc = ratio > 0.5 ? 1 : 0;
  const valuePath =
    ratio <= 0.001
      ? ""
      : `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${tip.x} ${tip.y}`;

  const ticks = Array.from({ length: 13 }, (_, i) => {
    const t = i / 12;
    const a = Math.PI * (1 - t);
    const inner = r - stroke / 2 - 4;
    const outer = r + stroke / 2 + (i % 3 === 0 ? 8 : 4);
    return {
      id: i,
      major: i % 3 === 0,
      x1: cx + inner * Math.cos(a),
      y1: cy - inner * Math.sin(a),
      x2: cx + outer * Math.cos(a),
      y2: cy - outer * Math.sin(a),
    };
  });

  const gradId = `lpg-gold-${uid}`;
  const glowId = `lpg-glow-${uid}`;

  return (
    <div className={cn("life-power-gauge relative mx-auto w-full max-w-[17.5rem]", className)}>
      <div className="life-power-gauge-halo" aria-hidden />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="relative z-[1] h-auto w-full"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a67c00" />
            <stop offset="35%" stopColor="#e8c547" />
            <stop offset="70%" stopColor="#f0d78c" />
            <stop offset="100%" stopColor="#fff8e0" />
          </linearGradient>
          <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <path
          d={trackPath}
          stroke="rgba(232,197,71,0.18)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={trackPath}
          stroke="rgba(232,197,71,0.08)"
          strokeWidth={stroke + 10}
          strokeLinecap="round"
        />

        {/* Value arc */}
        {valuePath ? (
          <path
            d={valuePath}
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            filter={`url(#${glowId})`}
          />
        ) : null}

        {/* Ticks */}
        {ticks.map((t) => (
          <line
            key={t.id}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.major ? "rgba(240,215,140,0.55)" : "rgba(232,197,71,0.22)"}
            strokeWidth={t.major ? 1.6 : 1}
            strokeLinecap="round"
          />
        ))}

        {/* Tip jewel */}
        {ratio > 0.02 ? (
          <>
            <circle cx={tip.x} cy={tip.y} r="7" fill={`url(#${gradId})`} />
            <circle cx={tip.x} cy={tip.y} r="3.2" fill="#fffef8" />
          </>
        ) : null}
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-[0.35rem] z-[2] flex flex-col items-center text-center">
        <p className="text-[10px] font-medium tracking-[0.28em] text-[#e8c547]/75">
          พลังชีวิต
        </p>
        <p className="mt-0.5 font-sacred text-[2.15rem] leading-none tracking-wide text-white">
          {clamped}
          <span className="ml-0.5 text-[1rem] text-white/35">/{max}</span>
        </p>
      </div>
    </div>
  );
}
