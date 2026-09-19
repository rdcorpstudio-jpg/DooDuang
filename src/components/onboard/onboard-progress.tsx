import { cn } from "@/lib/utils";

/** Quiet gold dots — no “step 1 of 4” copy */
export function OnboardProgress({
  current,
  total,
  className,
}: {
  current: number;
  total: number;
  className?: string;
}) {
  const safeTotal = Math.max(1, total);
  const index = Math.min(Math.max(1, current), safeTotal);

  return (
    <div
      className={cn("flex items-center justify-center gap-1.5", className)}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={safeTotal}
      aria-valuenow={index}
      aria-label="ความคืบหน้า"
    >
      {Array.from({ length: safeTotal }, (_, i) => {
        const n = i + 1;
        const done = n <= index;
        return (
          <span key={n} className="flex items-center gap-1.5">
            {i > 0 ? (
              <span
                className={cn(
                  "h-px w-3.5 sm:w-4",
                  n <= index ? "bg-[#d5b16f]" : "bg-white/22"
                )}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "block rounded-full transition-colors",
                done ? "h-[7px] w-[7px] bg-[#d5b16f]" : "h-[6px] w-[6px] bg-white/28"
              )}
              aria-hidden
            />
          </span>
        );
      })}
    </div>
  );
}
