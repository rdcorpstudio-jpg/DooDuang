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
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(168,85,247,0.22),transparent_62%)]"
        style={{ opacity: glow + 0.1 }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_85%,rgba(192,132,252,0.08),transparent_42%)]" />

      {STARS.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-purple-300/60 animate-twinkle"
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

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-purple/25 rounded-full blur-3xl animate-float" />
    </div>
  );
}
