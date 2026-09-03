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
          "inline-flex w-full items-center justify-center rounded-xl",
          "bg-[#a855f7] px-6 py-4 text-[18px] font-semibold text-white",
          "shadow-[0_8px_24px_rgba(168,85,247,0.35)]",
          "transition-all duration-150",
          "hover:bg-[#b66bff] active:scale-[0.98]",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:scale-100",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

SacredButton.displayName = "SacredButton";
