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

/** Horizontal soft list card — Mae gold–navy */
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
        <span className="relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center">
          <Icon className="h-5 w-5 text-[#e8d19a]" strokeWidth={1.6} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[11px] text-[#bacce6]/55">หมวดดวง</span>
          <span className="mt-0.5 block text-[17px] font-semibold tracking-tight text-[#f7f4ec]">
            {option.title}
          </span>
          <span className="mt-0.5 block truncate text-[12px] text-[#bacce6]/65">
            {option.description}
          </span>
        </span>

        <ArrowRight
          className="h-5 w-5 shrink-0 text-[#e8d19a] transition-transform duration-300 group-hover:translate-x-0.5"
          strokeWidth={2.2}
        />
      </div>
    </Link>
  );
}
