"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT = {
  gold: {
    ring: "ring-[#e8c547]/45",
    bg: "bg-[#e8c547]/15",
    icon: "text-[#e8c547]",
    btn: "bg-gradient-to-r from-[#a855f7] to-[#7c3aed]",
  },
  cyan: {
    ring: "ring-cyan-300/45",
    bg: "bg-cyan-400/15",
    icon: "text-cyan-300",
    btn: "bg-gradient-to-r from-[#22d3ee] to-[#6366f1]",
  },
  pink: {
    ring: "ring-pink-300/45",
    bg: "bg-pink-400/15",
    icon: "text-pink-300",
    btn: "bg-gradient-to-r from-[#ec4899] to-[#a855f7]",
  },
  sky: {
    ring: "ring-sky-300/45",
    bg: "bg-sky-400/15",
    icon: "text-sky-300",
    btn: "bg-gradient-to-r from-[#38bdf8] to-[#6366f1]",
  },
} as const;

/** Shared blur lock for paid fortune blocks */
export function FortunePaidLock({
  title,
  subtitle,
  onUnlock,
  accent = "gold",
}: {
  title: string;
  subtitle: string;
  onUnlock?: () => void;
  accent?: keyof typeof ACCENT;
}) {
  const a = ACCENT[accent];
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#07061a]/72 px-4 backdrop-blur-[6px]">
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full ring-1",
          a.bg,
          a.ring
        )}
      >
        <Lock className={cn("h-5 w-5", a.icon)} strokeWidth={1.9} />
      </span>
      <p className="mt-2.5 text-[13px] font-semibold text-white">{title}</p>
      <p className="mt-1 text-center text-[11px] text-white/50">{subtitle}</p>
      {onUnlock ? (
        <button
          type="button"
          onClick={onUnlock}
          className={cn(
            "mt-3 rounded-full px-4 py-2 text-[12px] font-semibold text-white",
            a.btn
          )}
        >
          ปลดล็อก
        </button>
      ) : null}
    </div>
  );
}

export function FortunePaidHeader({
  num,
  numClassName,
  title,
  en,
  aside,
}: {
  num: string;
  numClassName?: string;
  title: string;
  en: string;
  aside?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-3.5 pt-3.5">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-wide text-white">
          <span className={cn("tabular-nums", numClassName)}>{num}</span> {title}
        </p>
        <p className="mt-0.5 text-[9.5px] tracking-[0.16em] text-white/35">{en}</p>
      </div>
      {aside ? (
        <p className="max-w-[9.5rem] text-right text-[10px] leading-snug text-white/38">
          {aside}
        </p>
      ) : null}
    </div>
  );
}
