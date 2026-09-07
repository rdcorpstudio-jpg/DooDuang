"use client";

import Image from "next/image";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

const SETS = [
  {
    highlight: "จัดลำดับให้ชัด",
    opportunity: "ปิดงานค้างได้ดี",
    caution: "อย่ารับเกินตัว",
  },
  {
    highlight: "โฟกัสทีละเรื่อง",
    opportunity: "คุยเรื่องสำคัญได้",
    caution: "ระวังตัดสินใจเร็ว",
  },
  {
    highlight: "พักให้พอ",
    opportunity: "เริ่มนิสัยเล็ก ๆ",
    caution: "ลดงานดึก",
  },
] as const;

/** Three insight chips — free daily overview */
export function FortuneDailyInsights({
  seed = "dooduang",
  className,
}: {
  seed?: string;
  className?: string;
}) {
  const copy = useMemo(
    () => SETS[hashSeed(`${seed}-insights`) % SETS.length]!,
    [seed]
  );

  const items = [
    {
      id: "highlight",
      title: "เรื่องเด่น",
      body: copy.highlight,
      iconSrc: "/images/insights/star.png",
      titleClass: "text-[#F16DB5]",
      border: "border-[#F16DB5]/35",
    },
    {
      id: "opportunity",
      title: "โอกาส",
      body: copy.opportunity,
      iconSrc: "/images/insights/sprout.png",
      titleClass: "text-[#46DDED]",
      border: "border-[#46DDED]/35",
    },
    {
      id: "caution",
      title: "ควรระวัง",
      body: copy.caution,
      iconSrc: "/images/insights/caution.png",
      titleClass: "text-[#F4BC52]",
      border: "border-[#F4BC52]/35",
    },
  ] as const;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-2 min-[380px]:grid-cols-3",
        className
      )}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "flex min-w-0 items-center gap-2.5 rounded-[16px] border bg-[#121D36] px-3 py-2.5",
            item.border
          )}
        >
          <span
            className="relative block h-9 w-9 shrink-0"
            data-slot={`insight-icon-${item.id}`}
          >
            <Image
              src={item.iconSrc}
              alt=""
              width={72}
              height={72}
              unoptimized
              className="h-full w-full object-contain"
            />
          </span>
          <div className="min-w-0 leading-snug">
            <p className={cn("text-[13px] font-semibold", item.titleClass)}>
              {item.title}
            </p>
            <p className="mt-0.5 text-[14px] leading-[1.45] text-[#F7F8FF]">
              {item.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
