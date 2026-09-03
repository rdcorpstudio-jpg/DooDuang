"use client";

import Link from "next/link";
import {
  Briefcase,
  Gem,
  Heart,
  Moon,
  type LucideIcon,
} from "lucide-react";
import { SacredMark } from "@/components/ui/sacred-mark";
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
    accent: string;
    iconColor: string;
    iconRing: string;
    iconGlow: string;
    surface: string;
    bloom: string;
    border: string;
    shadow: string;
  }
> = {
  love: {
    Icon: Heart,
    roman: "I",
    accent: "text-rose-200/90",
    iconColor: "text-rose-100",
    iconRing: "border-rose-300/40",
    iconGlow: "bg-[radial-gradient(circle,rgba(251,113,133,0.3),transparent_70%)]",
    surface: "bg-[#4a1c46]/70",
    bloom: "bg-[radial-gradient(circle_at_50%_38%,rgba(244,63,94,0.42),transparent_62%)]",
    border: "border-rose-300/35 group-hover:border-rose-200/55",
    shadow:
      "shadow-[0_0_36px_rgba(136,19,55,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] group-hover:shadow-[0_0_44px_rgba(244,63,94,0.34),inset_0_1px_0_rgba(255,255,255,0.14)]",
  },
  career: {
    Icon: Briefcase,
    roman: "II",
    accent: "text-indigo-200/90",
    iconColor: "text-indigo-100",
    iconRing: "border-indigo-300/40",
    iconGlow: "bg-[radial-gradient(circle,rgba(129,140,248,0.3),transparent_70%)]",
    surface: "bg-[#242060]/70",
    bloom: "bg-[radial-gradient(circle_at_50%_38%,rgba(99,102,241,0.42),transparent_62%)]",
    border: "border-indigo-300/35 group-hover:border-indigo-200/55",
    shadow:
      "shadow-[0_0_36px_rgba(49,46,129,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] group-hover:shadow-[0_0_44px_rgba(129,140,248,0.34),inset_0_1px_0_rgba(255,255,255,0.14)]",
  },
  money: {
    Icon: Gem,
    roman: "III",
    accent: "text-amber-200/90",
    iconColor: "text-amber-100",
    iconRing: "border-amber-300/40",
    iconGlow: "bg-[radial-gradient(circle,rgba(252,211,77,0.28),transparent_70%)]",
    surface: "bg-[#2a3a24]/70",
    bloom: "bg-[radial-gradient(circle_at_50%_38%,rgba(234,179,8,0.36),transparent_62%)]",
    border: "border-amber-300/35 group-hover:border-amber-200/55",
    shadow:
      "shadow-[0_0_36px_rgba(69,55,10,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] group-hover:shadow-[0_0_44px_rgba(234,179,8,0.3),inset_0_1px_0_rgba(255,255,255,0.14)]",
  },
  overall: {
    Icon: Moon,
    roman: "IV",
    accent: "text-purple-200/95",
    iconColor: "text-amber-100",
    iconRing: "border-brand-purple-light/40",
    iconGlow: "bg-[radial-gradient(circle,rgba(251,191,36,0.22),transparent_70%)]",
    surface: "bg-brand-purple-dark/70",
    bloom: "bg-[radial-gradient(circle_at_50%_38%,rgba(168,85,247,0.44),transparent_62%)]",
    border: "border-brand-purple-light/35 group-hover:border-brand-purple-light/55",
    shadow:
      "shadow-[0_0_36px_rgba(88,28,135,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] group-hover:shadow-[0_0_44px_rgba(168,85,247,0.36),inset_0_1px_0_rgba(255,255,255,0.14)]",
  },
};

function CardFrame() {
  return (
    <>
      <div className="pointer-events-none absolute inset-2.5 rounded-[14px] border border-white/10" />
      <SacredMark size="xs" className="pointer-events-none absolute left-3.5 top-3.5 text-amber-200/40" />
      <SacredMark size="xs" className="pointer-events-none absolute right-3.5 top-3.5 text-amber-200/40" />
      <SacredMark size="xs" className="pointer-events-none absolute bottom-3.5 left-3.5 text-amber-200/40" />
      <SacredMark size="xs" className="pointer-events-none absolute bottom-3.5 right-3.5 text-amber-200/40" />
    </>
  );
}

export function FortuneCategoryCard({ option, index, visible }: FortuneCategoryCardProps) {
  const style = CATEGORY_STYLE[option.id as HomeCategoryId];
  const { Icon, roman, accent, iconColor, iconRing, iconGlow, surface, bloom, border, shadow } =
    style;
  const { triggerBurst, BurstLayer } = useSacredBurst();

  return (
    <Link
      href={`/reading/${option.id}`}
      onClick={triggerBurst}
      className={cn(
        "reveal-scale group relative block h-full min-h-0",
        visible && "is-visible"
      )}
      style={{ "--reveal-delay": `${180 + index * 100}ms` } as React.CSSProperties}
    >
      <BurstLayer size="lg" className="rounded-[20px]" />

      <div className="pointer-events-none absolute inset-x-1 bottom-0 top-2 rounded-[20px] bg-black/40 blur-md" />

      <div
        className={cn(
          "sacred-card relative flex h-full flex-col overflow-hidden rounded-[20px] border backdrop-blur-sm",
          surface,
          border,
          shadow,
          "transition-all duration-500",
          "group-hover:-translate-y-1 group-active:scale-[0.98]"
        )}
      >
        <CardFrame />

        <div className={cn("pointer-events-none absolute inset-0", bloom)} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_0%,rgba(255,255,255,0.1),transparent_55%)]" />

        <div className="relative flex h-full min-h-0 flex-col items-center px-2.5 pb-2.5 pt-3 text-center">
          <div className="flex w-full shrink-0 items-center justify-between px-1">
            <span className={cn("text-[8px] font-medium uppercase tracking-[0.2em]", accent)}>
              {option.subtitle}
            </span>
            <span className="text-[11px] font-medium tracking-[0.14em] text-amber-200/55">
              {roman}
            </span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2">
            <div className="relative mx-auto flex h-12 w-12 items-center justify-center">
              <div className={cn("absolute inset-0 rounded-full", iconGlow)} />
              <div className={cn("absolute inset-0 rounded-full border", iconRing)} />
              <Icon
                className={cn(
                  "relative h-5 w-5 animate-float stroke-[1.4] transition-transform duration-500 group-hover:scale-105",
                  iconColor
                )}
              />
            </div>

            <div>
              <h3 className="font-sacred text-[15px] font-semibold leading-tight tracking-wide text-white/95">
                {option.title}
              </h3>
              <div className="mx-auto mt-1.5 flex max-w-[4.5rem] items-center gap-1.5" aria-hidden>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-200/30" />
                <SacredMark size="xs" className="text-amber-200/45" />
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-200/30" />
              </div>
            </div>
          </div>

          <p className="line-clamp-2 w-full shrink-0 px-0.5 text-[9px] leading-snug text-purple-100/60">
            {option.description}
          </p>
        </div>

        <div className="tarot-shimmer pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
      </div>
    </Link>
  );
}
