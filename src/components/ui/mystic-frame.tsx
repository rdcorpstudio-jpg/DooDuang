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
          "relative overflow-hidden border border-[#c4a8ff]/28 bg-[rgba(36,24,72,0.4)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_32px_rgba(8,4,24,0.25)] backdrop-blur-[18px]",
          dimmed && "opacity-50",
          className
        )}
      style={radiusStyle}
    >
      <div className={cn("relative z-[1]", contentClassName)}>{children}</div>
    </div>
  );
}
