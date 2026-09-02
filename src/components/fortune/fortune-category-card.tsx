"use client";

import Link from "next/link";
import {
  Briefcase,
  Gem,
  Heart,
  Moon,
  type LucideIcon,
} from "lucide-react";
import { SacredCorners, SacredDivider } from "@/components/ui/sacred-mark";
import { useSacredBurst } from "@/components/ui/sacred-burst";
import { cn } from "@/lib/utils";
import type { HomeCategoryId, ReadingOption } from "@/lib/fortune/zodiac";

interface FortuneCategoryCardProps {
  option: ReadingOption;
  index: number;
  visible: boolean;
}

const CATEGORY_STYLE: Record<
  HomeCategoryId,
  {
    Icon: LucideIcon;
    roman: string;
    tint: string;
    glow: string;
    iconRing: string;
    border: string;
  }
> = {
  love: {
    Icon: Heart,
    roman: "I",
    tint: "from-[#5a1a52]/95 via-brand-purple-deep/85 to-brand-purple-dark/75",
    glow: "from-rose-400/20 via-transparent to-transparent",
    iconRing: "border-rose-300/35 text-rose-100 bg-rose-400/10",
    border: "border-rose-300/25 group-hover:border-rose-200/45",
  },
  career: {
    Icon: Briefcase,
    roman: "II",
    tint: "from-[#3a1a6a]/95 via-brand-purple-deep/85 to-brand-purple-dark/75",
    glow: "from-indigo-300/18 via-transparent to-transparent",
    iconRing: "border-indigo-200/35 text-indigo-100 bg-indigo-400/10",
    border: "border-indigo-200/25 group-hover:border-indigo-100/45",
  },
  money: {
    Icon: Gem,
    roman: "III",
    tint: "from-[#2a4a38]/90 via-brand-purple-deep/85 to-brand-purple-dark/75",
    glow: "from-amber-300/16 via-transparent to-transparent",
    iconRing: "border-amber-200/35 text-amber-100 bg-amber-400/10",
    border: "border-amber-200/25 group-hover:border-amber-100/45",
  },
  overall: {
    Icon: Moon,
    roman: "IV",
    tint: "from-brand-purple-deep/95 via-[#4c1689]/85 to-brand-purple-dark/75",
    glow: "from-brand-purple-light/20 via-transparent to-transparent",
    iconRing: "border-brand-purple-light/35 text-purple-100 bg-brand-purple-light/10",
    border: "border-brand-purple-light/25 group-hover:border-brand-purple-light/45",
  },
};

function SacredFrame() {
  return (
    <>
      <div className="absolute inset-3 rounded-xl border border-amber-200/16 pointer-events-none" />
      <div className="absolute inset-[18px] rounded-lg border border-purple-200/14 pointer-events-none" />

      <SacredCorners className="text-amber-200/45" />

      <div className="absolute inset-x-6 top-[52px] h-px bg-gradient-to-r from-transparent via-amber-200/28 to-transparent pointer-events-none" />
      <div className="absolute inset-x-8 bottom-[72px] h-px bg-gradient-to-r from-transparent via-purple-200/22 to-transparent pointer-events-none" />
    </>
  );
}

export function FortuneCategoryCard({ option, index, visible }: FortuneCategoryCardProps) {
  const style = CATEGORY_STYLE[option.id as HomeCategoryId];
  const { Icon, roman, tint, glow, iconRing, border } = style;
  const { triggerBurst, BurstLayer } = useSacredBurst();

  return (
    <Link
      href={`/reading/${option.id}`}
      onClick={triggerBurst}
      className={cn("reveal-scale relative block overflow-hidden rounded-[18px] group", visible && "is-visible")}
      style={{ "--reveal-delay": `${180 + index * 100}ms` } as React.CSSProperties}
    >
      <BurstLayer size="lg" className="rounded-[18px]" />
      <div className="relative aspect-[3/4] w-full">
        <div className="absolute inset-0 rounded-[18px] bg-brand-purple/35 blur-lg translate-y-2 group-hover:translate-y-3 transition-transform duration-500" />

        <div
          className={cn(
            "sacred-card relative h-full rounded-[18px] border overflow-hidden transition-all duration-500",
            "bg-gradient-to-b shadow-[inset_0_1px_0_rgba(192,132,252,0.12)]",
            tint,
            border,
            "group-hover:-translate-y-1 group-active:scale-[0.98]",
            "group-hover:shadow-[0_0_28px_rgba(168,85,247,0.32),0_12px_32px_rgba(59,7,100,0.35)]"
          )}
        >
          <SacredFrame />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(168,85,247,0.28),transparent_62%)] pointer-events-none" />
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-b pointer-events-none opacity-80",
              glow
            )}
          />

          <div className="relative h-full flex flex-col items-center px-4 pt-5 pb-4 text-center">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[8px] tracking-[0.25em] text-purple-200/55 uppercase">
                {option.subtitle}
              </span>
              <span className="text-[10px] tracking-[0.2em] text-amber-200/60 font-medium">
                {roman}
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-0 py-2">
              <div
                className={cn(
                  "relative flex items-center justify-center w-14 h-14 rounded-full border",
                  "group-hover:scale-105 transition-transform duration-500",
                  iconRing
                )}
              >
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.14),transparent_70%)]" />
                <Icon className="relative h-6 w-6 stroke-[1.5]" />
              </div>

              <h3 className="text-[15px] font-semibold text-white tracking-wide leading-tight">
                {option.title}
              </h3>
            </div>

            <div className="w-full">
              <SacredDivider className="mb-2.5" />
              <p className="text-[10px] leading-relaxed text-purple-100/70 line-clamp-2">
                {option.description}
              </p>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-100/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 tarot-shimmer pointer-events-none" />
        </div>
      </div>
    </Link>
  );
}
