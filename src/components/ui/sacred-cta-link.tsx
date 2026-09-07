"use client";

import Link from "next/link";
import { ComponentProps, useState } from "react";
import { Sparkles } from "lucide-react";
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
        "sacred-pill-cta group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full",
        "px-8 py-[1.1rem]",
        "text-[16px] font-semibold tracking-[0.04em] text-white",
        "transition-transform duration-300 ease-out",
        "hover:scale-[1.025] active:scale-[0.98]",
        pressing && "sacred-burst-press",
        className
      )}
    >
      <BurstLayer size="lg" />
      <span className="sacred-pill-cta-shine" aria-hidden />
      <span className="sacred-pill-cta-sheen" aria-hidden />
      <Sparkles
        className="relative z-[1] h-4 w-4 text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]"
        strokeWidth={2}
      />
      <span className="relative z-[1]">{children}</span>
    </Link>
  );
}
