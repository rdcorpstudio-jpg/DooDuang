import { BadgeCheck } from "lucide-react";
import type { MaeReview } from "@/lib/reviews";
import { cn } from "@/lib/utils";

function Stars({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex gap-px leading-none text-[#d5b16f]",
        size === "md" ? "text-[14px]" : "text-[12px]"
      )}
      aria-label="5 จาก 5 ดาว"
    >
      ★★★★★
    </span>
  );
}

export function ReviewCard({
  review,
  light = false,
  variant = "list",
}: {
  review: MaeReview;
  light?: boolean;
  /** Card layout for home reviews section */
  variant?: "list" | "card";
}) {
  if (variant === "card") {
    return (
      <article className="mae-review-card rounded-[16px] px-3.5 py-3.5">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold text-white"
            style={{ background: review.tone }}
            aria-hidden
          >
            {review.initial}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <span className="mae-gold-text text-[14.5px] font-semibold">
                    {review.name}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[11.5px] text-[#8eb4e0]">
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                    ผู้ใช้งานจริง
                  </span>
                </div>
                <div className="mt-1.5">
                  <Stars />
                </div>
              </div>
              <p className="shrink-0 pt-0.5 text-[12px] text-[#8a94a3]">
                {review.time}
              </p>
            </div>
            <p className="mt-2.5 text-[14.5px] leading-[1.75] text-[#f0ece3]">
              {review.quote}
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex gap-3 py-1">
      <span
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
        style={{ background: review.tone }}
        aria-hidden
      >
        {review.initial}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={
              light
                ? "text-[14.5px] font-semibold text-[#192438]"
                : "text-[14.5px] font-semibold"
            }
          >
            {light ? (
              review.name
            ) : (
              <span className="mae-gold-text">{review.name}</span>
            )}
          </p>
          <p className="shrink-0 text-[12px] text-[#8a94a3]">{review.time}</p>
        </div>
        <div className="mt-1">
          <Stars />
        </div>
        <p
          className="mt-2 text-[14.5px] leading-[1.75]"
          style={{ color: light ? "#4a5564" : "#f0ece3" }}
        >
          {review.quote}
        </p>
      </div>
    </article>
  );
}
