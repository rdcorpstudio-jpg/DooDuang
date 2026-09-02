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
          "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-brand-purple text-white hover:bg-brand-purple-light shadow-md shadow-brand-purple-dark/40":
              variant === "primary",
            "bg-brand-purple-deep/60 text-purple-200 hover:bg-brand-purple-dark/60 border border-brand-purple-dark/50":
              variant === "secondary",
            "text-brand-purple-light hover:text-purple-200 hover:bg-brand-purple-dark/30":
              variant === "ghost",
            "border border-brand-purple/50 text-purple-300 hover:bg-brand-purple-dark/30":
              variant === "outline",
            "px-3 py-1.5 text-xs": size === "sm",
            "px-5 py-2.5 text-sm": size === "md",
            "px-6 py-3 text-base w-full": size === "lg",
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
