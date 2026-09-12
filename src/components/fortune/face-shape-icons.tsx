import type { FaceShapeId } from "@/lib/fortune/scan/types";
import { cn } from "@/lib/utils";

const GOLD = "#d5b16f";
const GOLD_SOFT = "rgba(213,177,111,0.22)";

/** Front-face silhouette by classified shape */
export function FaceShapeGlyph({
  shape,
  className,
}: {
  shape: FaceShapeId;
  className?: string;
}) {
  const path =
    shape === "long"
      ? "M50 10c-14 0-24 12-24 32 0 22 8 40 24 46 16-6 24-24 24-46 0-20-10-32-24-32z"
      : shape === "heart"
        ? "M50 12c-16 0-26 10-28 24-1 8 2 16 8 22 6 6 14 14 20 30 6-16 14-24 20-30 6-6 9-14 8-22-2-14-12-24-28-24z"
        : shape === "square"
          ? "M28 18h44c4 0 6 2 6 6v52c0 4-2 6-6 6H28c-4 0-6-2-6-6V24c0-4 2-6 6-6z"
          : "M50 12c-15 0-26 13-26 34 0 20 9 36 26 40 17-4 26-20 26-40 0-21-11-34-26-34z";

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      <ellipse cx="50" cy="50" rx="42" ry="42" fill={GOLD_SOFT} />
      <path d={path} fill={GOLD} opacity="0.92" />
      <circle cx="38" cy="42" r="3.2" fill="#101827" opacity="0.55" />
      <circle cx="62" cy="42" r="3.2" fill="#101827" opacity="0.55" />
      <path
        d="M40 58c4 5 10 7 10 7s6-2 10-7"
        fill="none"
        stroke="#101827"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

/** Side-profile silhouette (generic; pairs with front shape tile) */
export function FaceSideGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      <ellipse cx="50" cy="50" rx="42" ry="42" fill={GOLD_SOFT} />
      <path
        d="M58 14c-10 1-18 10-20 22-1 6 0 12 3 17l-6 6c-2 2-2 5 0 7l5 4c1 8 6 16 14 20 8 2 14-2 18-8 3-5 4-12 3-18-1-8-4-14-8-20-3-5-4-11-3-16 1-7-1-14-6-14z"
        fill={GOLD}
        opacity="0.92"
      />
      <circle cx="72" cy="44" r="2.6" fill="#101827" opacity="0.5" />
      <path
        d="M68 58c3 3 6 4 9 3"
        fill="none"
        stroke="#101827"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

export function FaceResultIconTiles({
  shape,
  className,
}: {
  shape: FaceShapeId;
  className?: string;
}) {
  return (
    <div className={cn("flex shrink-0 gap-1.5", className)}>
      <div className="relative flex h-24 w-[4.5rem] flex-col items-center justify-center overflow-hidden rounded-[14px] bg-[rgba(213,177,111,0.1)] ring-1 ring-[rgba(213,177,111,0.28)]">
        <div className="h-14 w-14">
          <FaceShapeGlyph shape={shape} />
        </div>
        <span className="mt-0.5 text-[9px] font-medium tracking-wide text-[#d5b16f]/85">
          หน้า
        </span>
      </div>
      <div className="relative flex h-24 w-[4.5rem] flex-col items-center justify-center overflow-hidden rounded-[14px] bg-[rgba(213,177,111,0.1)] ring-1 ring-[rgba(213,177,111,0.28)]">
        <div className="h-14 w-14">
          <FaceSideGlyph />
        </div>
        <span className="mt-0.5 text-[9px] font-medium tracking-wide text-[#d5b16f]/85">
          ข้าง
        </span>
      </div>
    </div>
  );
}
