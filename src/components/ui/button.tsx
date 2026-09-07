import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide",
          "transition-all duration-200 ease-out",
          "disabled:cursor-not-allowed disabled:opacity-45",
          "active:scale-[0.98]",
          {
            "bg-gradient-to-r from-[#8b3fd9] via-[#a967f5] to-[#c9a8ff] text-white shadow-[0_8px_24px_rgba(139,92,246,0.35)] hover:shadow-[0_10px_28px_rgba(169,103,245,0.45)] hover:brightness-105":
              variant === "primary",
            "border border-[#c9a8ff]/25 bg-white/[0.04] text-[#e9ddff] hover:bg-white/[0.08] hover:border-[#c9a8ff]/40":
              variant === "secondary",
            "text-[#d4b8ff]/85 hover:bg-white/[0.06] hover:text-white":
              variant === "ghost",
            "border border-[#c9a8ff]/35 text-[#d4b8ff] hover:bg-[#a967f5]/12":
              variant === "outline",
            "px-3 py-1.5 text-[12px]": size === "sm",
            "px-5 py-2.5 text-[14px]": size === "md",
            "w-full px-6 py-3.5 text-[15px]": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
