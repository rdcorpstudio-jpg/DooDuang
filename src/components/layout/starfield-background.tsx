"use client";

import { ZodiacWheelBg } from "@/components/layout/zodiac-wheel-bg";

/** Deep space + large rose-gold natal chart */
const STAR_DUST = Array.from({ length: 160 }, (_, i) => ({
  id: i,
  top: (i * 7.1 + 2.3) % 100,
  left: (i * 13.7 + 5.1) % 100,
  size: i % 11 === 0 ? 2.2 : i % 5 === 0 ? 1.5 : 1,
  opacity: 0.25 + (i % 7) * 0.08,
}));

const BRIGHT_STARS = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  top: (i * 17.3 + 6) % 96,
  left: (i * 23.9 + 8) % 96,
  duration: 2.1 + (i % 5) * 0.5,
  delay: (i * 0.31) % 4,
  size: i % 4 === 0 ? 2.6 : 1.7,
}));

export function StarfieldBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#060212]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e061c] via-[#160a28] to-[#1f0a30]" />

      {STAR_DUST.map((s) => (
        <span
          key={`d-${s.id}`}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
        />
      ))}

      {BRIGHT_STARS.map((star) => (
        <span
          key={`b-${star.id}`}
          className="absolute rounded-full bg-white animate-twinkle"
          style={
            {
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: star.size,
              height: star.size,
              boxShadow: "0 0 6px rgba(255,255,255,0.65)",
              "--twinkle-duration": `${star.duration}s`,
              "--twinkle-delay": `${star.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Soft rose glow */}
      <div className="absolute left-1/2 top-[44%] h-[55%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,160,144,0.16)_0%,transparent_65%)]" />

      {/* Zodiac — centered, inset from corners so the full ring reads clearly */}
      <div className="absolute left-1/2 top-[44%] z-[1] w-[118%] -translate-x-1/2 -translate-y-1/2 opacity-95">
        <div className="astro-zodiac-wheel origin-center drop-shadow-[0_0_32px_rgba(212,160,144,0.3)]">
          <ZodiacWheelBg className="h-auto w-full" />
        </div>
      </div>

      <div className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_52%,rgba(6,2,18,0.5)_100%)]" />
    </div>
  );
}
