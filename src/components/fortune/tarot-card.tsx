"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReadingOption } from "@/lib/fortune/zodiac";

interface TarotCardProps {
  option: ReadingOption;
  className?: string;
}

function CardPattern({ pattern }: { pattern: ReadingOption["pattern"] }) {
  if (pattern === "stars") {
    return (
      <div className="absolute inset-0 opacity-20">
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${10 + (i * 20) % 80}%`,
              left: `${8 + (i * 25) % 85}%`,
              width: i % 2 === 0 ? 3 : 2,
              height: i % 2 === 0 ? 3 : 2,
            }}
          />
        ))}
      </div>
    );
  }
  if (pattern === "moon") {
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-15">
        <span className="h-14 w-14 rounded-full border-2 border-white/70" />
        <span className="absolute h-14 w-14 translate-x-3 rounded-full bg-white/10" />
      </div>
    );
  }
  if (pattern === "sun") {
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <span className="h-12 w-12 rounded-full border border-white/60" />
        {[0, 45, 90, 135].map((deg) => (
          <span
            key={deg}
            className="absolute h-16 w-px bg-white/40"
            style={{ transform: `rotate(${deg}deg)` }}
          />
        ))}
      </div>
    );
  }
  if (pattern === "floral") {
    return (
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-3 left-3 h-3 w-3 rotate-45 rounded-[1px] border border-white/50" />
        <div className="absolute bottom-3 right-3 h-3 w-3 rotate-45 rounded-[1px] border border-white/50" />
      </div>
    );
  }
  return (
    <div className="absolute inset-2 border border-white/20 rounded-lg opacity-30">
      <div className="absolute inset-1.5 border border-white/10 rounded-md" />
    </div>
  );
}

export function TarotCard({ option, className }: TarotCardProps) {
  return (
    <Link href={`/reading/${option.id}`} className={cn("group block", className)}>
      <div className="relative aspect-[2/3] w-full">
        <div className="absolute inset-0 rounded-2xl bg-brand-purple-deep/40 blur-lg translate-y-2 group-hover:translate-y-3 transition-transform" />

        <div
          className={cn(
            "relative h-full rounded-2xl border-2 overflow-hidden transition-all duration-300",
            "group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-brand-purple-dark/50",
            option.accent,
            `bg-gradient-to-br ${option.gradient}`
          )}
        >
          <CardPattern pattern={option.pattern} />
          <div className="absolute inset-2 border border-white/25 rounded-xl" />

          <div className="relative h-full flex flex-col items-center justify-between p-3 text-white">
            <span className="text-[8px] uppercase tracking-[0.15em] opacity-70 font-medium">
              {option.subtitle}
            </span>

            <div className="text-center flex-1 flex flex-col items-center justify-center gap-1">
              <span className="text-xs font-semibold tracking-[0.35em] opacity-80">
                {option.symbol}
              </span>
              <h3 className="text-sm font-bold leading-tight drop-shadow">
                {option.title}
              </h3>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity tarot-shimmer" />
        </div>
      </div>

      <p className="text-center text-[11px] text-purple-400/50 mt-2 px-1 leading-snug group-hover:text-purple-300/70 transition-colors">
        {option.description}
      </p>
    </Link>
  );
}
