"use client";

import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Coins,
  Heart,
  Leaf,
  Sparkles,
} from "lucide-react";
import type { FortuneAspectId } from "@/lib/fortune/analyze";
import { cn } from "@/lib/utils";

type MaeAspectIconId = FortuneAspectId | "luck";

const ICONS: Record<
  MaeAspectIconId,
  { Icon: LucideIcon; filled?: boolean }
> = {
  work: { Icon: Briefcase },
  money: { Icon: Coins },
  love: { Icon: Heart, filled: true },
  health: { Icon: Leaf },
  luck: { Icon: Sparkles },
};

const GOLD_FOIL =
  "linear-gradient(165deg, #fffef8 0%, #ffe9b0 28%, #f0d078 52%, #d5b16f 78%, #b8924f 100%)";

/** Clean gold aspect icons — lucide marks in a foil disc. */
export function MaeAspectIcon({
  id,
  size = 40,
  className,
}: {
  id: MaeAspectIconId;
  size?: number;
  className?: string;
}) {
  const { Icon, filled } = ICONS[id];
  const mark = Math.round(size * 0.46);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: GOLD_FOIL,
        boxShadow:
          "0 2px 8px rgba(184,146,79,0.35), inset 0 1px 0 rgba(255,255,255,0.55)",
      }}
      aria-hidden
    >
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{
          width: size - 4,
          height: size - 4,
          background:
            "radial-gradient(circle at 35% 28%, #1a2740 0%, #101827 72%)",
          boxShadow: "inset 0 0 0 1px rgba(240,208,120,0.28)",
        }}
      >
        <Icon
          width={mark}
          height={mark}
          strokeWidth={filled ? 1.9 : 2.2}
          absoluteStrokeWidth
          fill={filled ? "currentColor" : "none"}
          style={{
            color: "#f0d078",
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.35))",
          }}
        />
      </span>
    </span>
  );
}
