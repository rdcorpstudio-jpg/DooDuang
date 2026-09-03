"use client";

import { cn } from "@/lib/utils";

const STARS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  top: (i * 19) % 92,
  left: (i * 27 + 8) % 92,
  duration: 2.4 + (i % 4) * 0.7,
  delay: (i * 0.41) % 3.5,
}));

interface MysticBackgroundProps {
  className?: string;
  intensity?: "soft" | "normal";
}

export function MysticBackground({ className, intensity = "normal" }: MysticBackgroundProps) {
  const glow = intensity === "soft" ? 0.25 : 0.4;

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)} aria-hidden>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(240,215,140,0.12),transparent_55%)]"
        style={{ opacity: glow + 0.15 }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_88%,rgba(201,162,39,0.08),transparent_42%)]" />

      {STARS.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-amber-100/70 animate-twinkle"
          style={
            {
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: 2,
              height: 2,
              "--twinkle-duration": `${star.duration}s`,
              "--twinkle-delay": `${star.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      <div className="absolute top-[18%] left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#F0D78C]/10 blur-3xl animate-float" />
    </div>
  );
}
