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

function LoadingMoonArc() {
  return (
    <svg
      viewBox="0 0 160 72"
      className="mae-load-moon mx-auto h-12 w-[9.5rem]"
      aria-hidden
    >
      <defs>
        <linearGradient id="maeLoadMoon" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8f6e38" stopOpacity="0.12" />
          <stop offset="40%" stopColor="#e8d19a" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#fff8e4" stopOpacity="1" />
          <stop offset="100%" stopColor="#8f6e38" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <path
        d="M12 58 C 42 8, 118 8, 148 58"
        fill="none"
        stroke="url(#maeLoadMoon)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="80" cy="22" r="2.8" fill="#e8d19a" opacity="0.95" />
    </svg>
  );
}

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
        className="mae-load-card relative z-[2] w-full max-w-[20rem] overflow-hidden rounded-[26px] px-5 pb-7 pt-7 text-center"
        style={{
          background: MAE_GLASS.bg,
          border: MAE_GLASS.border,
          boxShadow: `${MAE_GLASS.shadow}, ${MAE_GLASS.highlight}`,
          backdropFilter: MAE_GLASS.blur,
          WebkitBackdropFilter: MAE_GLASS.blur,
        }}
      >
        <span className="mae-load-glow pointer-events-none absolute inset-x-10 top-0 h-20 rounded-full" />

        <LoadingMoonArc />

        <div className="relative mt-5 flex items-end justify-center gap-2">
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
          className="relative mt-5 text-[clamp(1.05rem,4.2vw,1.2rem)] font-bold leading-snug tracking-wide"
          style={TITLE_GOLD}
        >
          {label}
        </p>
        {hint ? (
          <p
            className="relative mx-auto mt-2 max-w-[15rem] text-[13.5px] font-medium leading-snug"
            style={{ color: "rgba(186,204,230,0.78)" }}
          >
            {hint}
          </p>
        ) : null}

        <div
          className="relative mx-auto mt-5 h-1 w-40 overflow-hidden rounded-full"
          style={{ background: "rgba(213,177,111,0.16)" }}
          aria-hidden
        >
          <div className="mae-load-bar h-full rounded-full" />
        </div>

        <p
          className="relative mt-4 text-[11.5px] font-semibold tracking-[0.16em]"
          style={{ color: GOLD }}
        >
          แม่มั่งมี พามู
        </p>
      </div>
    </div>
  );
}
