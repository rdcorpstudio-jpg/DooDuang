import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Soft glass frame — translucent lilac rim, starfield shows through */
export function MysticFrame({
  children,
  className,
  contentClassName,
  radius = 20,
  dimmed = false,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  radius?: number;
  dimmed?: boolean;
}) {
  const radiusStyle = { borderRadius: radius } satisfies CSSProperties;

  return (
    <div
        className={cn(
          "fortune-glass relative overflow-hidden",
          dimmed && "opacity-50",
          className
        )}
      style={radiusStyle}
    >
      <div className={cn("relative z-[1]", contentClassName)}>{children}</div>
    </div>
  );
}
