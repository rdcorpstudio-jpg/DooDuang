import { cn } from "@/lib/utils";

interface SacredMarkProps {
  className?: string;
  size?: "xs" | "sm" | "md";
  style?: React.CSSProperties;
}

const sizeMap = {
  xs: "h-1 w-1",
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
};

export function SacredMark({ className, size = "sm", style }: SacredMarkProps) {
  return (
    <span
      className={cn("inline-block rotate-45 rounded-[1px] bg-current", sizeMap[size], className)}
      style={style}
      aria-hidden
    />
  );
}

export function SacredCorners({ className }: { className?: string }) {
  return (
    <>
      <SacredMark size="xs" className={cn("pointer-events-none absolute left-4 top-4 text-amber-200/40", className)} />
      <SacredMark size="xs" className={cn("pointer-events-none absolute right-4 top-4 text-amber-200/40", className)} />
      <SacredMark size="xs" className={cn("pointer-events-none absolute bottom-4 left-4 text-amber-200/40", className)} />
      <SacredMark size="xs" className={cn("pointer-events-none absolute bottom-4 right-4 text-amber-200/40", className)} />
    </>
  );
}

export function SacredDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-amber-200/25" />
      <SacredMark size="xs" className="text-amber-200/45" />
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-amber-200/25" />
    </div>
  );
}
