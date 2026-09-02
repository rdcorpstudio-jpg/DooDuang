"use client";

import Link from "next/link";
import { ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";
import { useSacredBurst } from "@/components/ui/sacred-burst";

interface SacredCtaLinkProps extends ComponentProps<typeof Link> {
  glow?: boolean;
}

export function SacredCtaLink({
  className,
  children,
  glow: _glow,
  onClick,
  ...props
}: SacredCtaLinkProps) {
  const { triggerBurst, BurstLayer } = useSacredBurst();
  const [pressing, setPressing] = useState(false);

  return (
    <Link
      {...props}
      onClick={(e) => {
        triggerBurst(e as unknown as React.MouseEvent<HTMLElement>);
        setPressing(true);
        window.setTimeout(() => setPressing(false), 450);
        onClick?.(e);
      }}
      className={cn(
        "group relative inline-flex w-full items-center justify-center overflow-hidden rounded-full",
        "bg-gradient-to-r from-[#9333ea] via-[#b57cff] to-[#9333ea] bg-[length:200%_100%]",
        "px-7 py-[1.05rem]",
        "text-[14px] font-semibold tracking-[0.06em] text-white",
        "shadow-[0_8px_32px_rgba(147,51,234,0.42),inset_0_1px_0_rgba(255,255,255,0.28)]",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.02] hover:bg-[position:100%_0] hover:shadow-[0_10px_40px_rgba(168,85,247,0.52)]",
        "active:scale-[0.98]",
        pressing && "sacred-burst-press",
        className
      )}
    >
      <BurstLayer size="lg" />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-full top-0 h-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100"
      />
      <span className="relative z-[1]">{children}</span>
    </Link>
  );
}
