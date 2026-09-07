"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Gem,
  Heart,
  Leaf,
  type LucideIcon,
} from "lucide-react";
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
  { Icon: LucideIcon }
> = {
  love: { Icon: Heart },
  career: { Icon: Briefcase },
  money: { Icon: Gem },
  health: { Icon: Leaf },
};

/** Horizontal soft list card — modern purple UI */
export function FortuneCategoryCard({ option, index, visible }: FortuneCategoryCardProps) {
  const style = CATEGORY_STYLE[option.id as HomeCategoryId];
  const { Icon } = style;
  const { triggerBurst, BurstLayer } = useSacredBurst();

  return (
    <Link
      href={`/reading/${option.id}`}
      onClick={triggerBurst}
      className={cn(
        "reveal-up group relative block",
        visible && "is-visible"
      )}
      style={{ "--reveal-delay": `${120 + index * 80}ms` } as React.CSSProperties}
    >
      <BurstLayer size="md" className="rounded-[22px]" />

      <div className="soft-select-card relative flex items-center gap-3.5 overflow-hidden rounded-[22px] px-4 py-4">
        <span className="soft-select-orb relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
          <Icon className="relative z-[1] h-5 w-5 text-white/90" strokeWidth={1.6} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[11px] text-white/40">หมวดดวง</span>
          <span className="mt-0.5 block text-[17px] font-semibold tracking-tight text-white">
            {option.title}
          </span>
          <span className="mt-0.5 block truncate text-[12px] text-white/45">
            {option.description}
          </span>
        </span>

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#2a1a4a] transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
          <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </div>
    </Link>
  );
}
