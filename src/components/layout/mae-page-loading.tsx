"use client";

import { MaePageBackground } from "@/components/layout/mae-page-background";
import { MAE_GLASS } from "@/lib/mae-glass";
import { cn } from "@/lib/utils";

const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

const GOLD = "#e8d19a";

export function MaePageLoading({
  label = "กำลังเตรียมหน้า…",
  hint = "รอสักครู่ แม่กำลังจัดหน้าให้",
  className,
  fill = true,
}: {
  label?: string;
  hint?: string;
  className?: string;
  /** Fill parent / screen (default). Set false for inline Suspense fallbacks. */
  fill?: boolean;
}) {
  return (
    <div
      className={cn(
        "mae-page-loading relative flex flex-col items-center justify-center overflow-hidden px-6",
        fill ? "h-full min-h-full w-full" : "min-h-[14rem] w-full py-10",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <MaePageBackground mode="fill" priority scrollBlur={false} />

      <div
        className="mae-load-card relative z-[2] w-full max-w-[20rem] rounded-[26px] px-6 py-8 text-center"
        style={{
          background: MAE_GLASS.bg,
          border: MAE_GLASS.border,
          boxShadow: MAE_GLASS.shadow,
          backdropFilter: MAE_GLASS.blur,
          WebkitBackdropFilter: MAE_GLASS.blur,
        }}
      >
        <div className="relative flex items-end justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="mae-load-beam rounded-full"
              style={{
                width: i === 1 ? 9 : 6,
                height: i === 1 ? 40 : 28,
                animationDelay: `${i * 0.22}s`,
              }}
              aria-hidden
            />
          ))}
        </div>

        <p
          className="relative mt-6 text-[18px] font-bold leading-snug tracking-wide"
          style={TITLE_GOLD}
        >
          {label}
        </p>
        {hint ? (
          <p
            className="relative mx-auto mt-2.5 max-w-[16rem] text-[15px] font-medium leading-[1.5]"
            style={{ color: "rgba(186,204,230,0.88)" }}
          >
            {hint}
          </p>
        ) : null}

        <p
          className="relative mt-6 text-[15px] font-semibold tracking-[0.12em]"
          style={{ color: GOLD }}
        >
          แม่มั่งมี พามู
        </p>
      </div>
    </div>
  );
}
