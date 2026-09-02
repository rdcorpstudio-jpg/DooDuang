"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef, useState } from "react";
import { useSacredBurst } from "@/components/ui/sacred-burst";

interface SacredButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  glow?: boolean;
  burstSize?: "sm" | "md" | "lg";
}

export const SacredButton = forwardRef<HTMLButtonElement, SacredButtonProps>(
  ({ className, glow = true, burstSize = "md", children, onClick, ...props }, ref) => {
    const { triggerBurst, BurstLayer } = useSacredBurst();
    const [pressing, setPressing] = useState(false);

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      triggerBurst(e);
      setPressing(true);
      window.setTimeout(() => setPressing(false), 450);
      onClick?.(e);
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          "group relative w-full overflow-hidden rounded-full border border-amber-200/30",
          "bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-purple bg-[length:200%_auto]",
          "px-8 py-3.5 text-sm font-medium tracking-[0.08em] text-white",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
          "transition-all duration-300",
          "hover:scale-[1.02] hover:border-amber-200/50 active:scale-[0.98]",
          "disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none disabled:hover:scale-100",
          glow && "animate-glow-pulse",
          pressing && "sacred-burst-press",
          className
        )}
        {...props}
      >
        <BurstLayer size={burstSize} />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <span className="relative z-[1]">{children}</span>
      </button>
    );
  }
);

SacredButton.displayName = "SacredButton";
