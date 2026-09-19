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
            "mae-gold-cta text-[#101827]": variant === "primary",
            "border border-[rgba(232,209,154,0.35)] bg-[rgba(16,24,39,0.72)] text-[#e8d19a] hover:bg-[rgba(16,24,39,0.88)] hover:border-[rgba(232,209,154,0.5)]":
              variant === "secondary",
            "text-[#e8d19a]/85 hover:bg-[rgba(213,177,111,0.1)] hover:text-[#e8d19a]":
              variant === "ghost",
            "border border-[rgba(232,209,154,0.4)] text-[#e8d19a] hover:bg-[rgba(213,177,111,0.12)]":
              variant === "outline",
            "px-3 py-1.5 text-[15.5px]": size === "sm",
            "px-5 py-2.5 text-[15.5px]": size === "md",
            "w-full px-6 py-3.5 text-[15.5px]": size === "lg",
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
