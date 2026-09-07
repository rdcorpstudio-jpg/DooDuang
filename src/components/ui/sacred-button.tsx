"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface SacredButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  glow?: boolean;
  burstSize?: "sm" | "md" | "lg";
}

export const SacredButton = forwardRef<HTMLButtonElement, SacredButtonProps>(
  ({ className, glow: _glow, burstSize: _burstSize, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "sacred-pill-cta relative inline-flex w-full items-center justify-center overflow-hidden rounded-full",
          "px-7 py-[1.05rem] text-[16px] font-semibold tracking-[0.03em] text-white",
          "transition-transform duration-200",
          "hover:scale-[1.02] active:scale-[0.98]",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100 disabled:active:scale-100",
          "disabled:[animation:none]",
          className
        )}
        {...props}
      >
        <span className="sacred-pill-cta-shine" aria-hidden />
        <span className="sacred-pill-cta-sheen" aria-hidden />
        <span className="relative z-[1]">{children}</span>
      </button>
    );
  }
);

SacredButton.displayName = "SacredButton";
