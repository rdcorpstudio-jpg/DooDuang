"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface BurstPoint {
  id: number;
  x: number;
  y: number;
}

export function useSacredBurst() {
  const [bursts, setBursts] = useState<BurstPoint[]>([]);

  const triggerBurst = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();

    setBursts((prev) => [...prev, { id, x, y }]);

    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 1000);
  }, []);

  function BurstLayer({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
    const sparkCount = size === "sm" ? 8 : size === "lg" ? 16 : 12;

    return (
      <span
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
          className
        )}
        aria-hidden
      >
        {bursts.map((burst) => (
          <span key={burst.id} className="absolute inset-0">
            <span
              className="sacred-burst-flash absolute inset-0 rounded-[inherit]"
              style={{ left: burst.x, top: burst.y }}
            />
            <span
              className="sacred-burst-core absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: burst.x, top: burst.y }}
            />
            <span
              className="sacred-burst-ring absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-200/90"
              style={{ left: burst.x, top: burst.y }}
            />
            <span
              className="sacred-burst-ring sacred-burst-ring-delay absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-purple-light/70"
              style={{ left: burst.x, top: burst.y }}
            />
            <span
              className="sacred-burst-ring sacred-burst-ring-delay-2 absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40"
              style={{ left: burst.x, top: burst.y }}
            />
            {Array.from({ length: sparkCount }).map((_, i) => (
              <span
                key={i}
                className="sacred-burst-spark absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={
                  {
                    left: burst.x,
                    top: burst.y,
                    "--burst-angle": `${i * (360 / sparkCount)}deg`,
                  } as React.CSSProperties
                }
              />
            ))}
          </span>
        ))}
      </span>
    );
  }

  return { triggerBurst, BurstLayer };
}
