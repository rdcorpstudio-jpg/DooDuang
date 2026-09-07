"use client";

import { cn } from "@/lib/utils";

/** Animated mystic orb for loading / creating states */
export function MysticOrb({
  className,
  size = 180,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={cn("mystic-orb relative", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div className="mystic-orb-glow" />
      <div className="mystic-orb-core">
        <div className="mystic-orb-ridge" />
        <div className="mystic-orb-shine" />
      </div>
    </div>
  );
}
