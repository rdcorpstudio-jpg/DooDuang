"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Target } from "lucide-react";
import { cn } from "@/lib/utils";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

const NUMBER_MEANINGS = [
  "ชวนทบทวน",
  "ชวนจัดระบบ",
  "ชวนเริ่มใหม่",
  "ชวนโฟกัส",
  "ชวนอดทน",
  "ชวนเชื่อมโยง",
  "ชวนกล้าตัดสิน",
  "ชวนเก็บเกี่ยว",
  "ชวนปล่อยวาง",
] as const;

function numberSrc(n: number) {
  return `/images/numbers/${n}.png`;
}

/** Compact lucky numbers only (shirts moved to calendar preview row) */
export function FortuneLuckyExtras({
  seed = "dooduang",
  className,
}: {
  seed?: string;
  className?: string;
}) {
  const [openNumbers, setOpenNumbers] = useState(false);

  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const numbers: number[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = hashSeed(`${seed}-n${i}`) % pool.length;
    numbers.push(pool.splice(idx, 1)[0]!);
  }
  const pairA = `${numbers[0]}${numbers[1]}`;
  const pairB = `${numbers[1]}${numbers[2]}`;

  return (
    <section className={cn("fortune-glass overflow-hidden rounded-[16px]", className)}>
      <div className="px-3 pt-3">
        <div className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 shrink-0 text-[#F16DB5]" strokeWidth={1.8} />
          <h3 className="text-[13px] font-semibold text-[#F7F8FF]">เลขนำโชค</h3>
        </div>

        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          {numbers.map((n, i) => (
            <span
              key={`${n}-${i}`}
              className="relative block h-9 w-9"
              data-slot="lucky-ball"
            >
              <Image
                src={numberSrc(n)}
                alt={String(n)}
                width={72}
                height={72}
                unoptimized
                className="h-full w-full object-contain"
              />
            </span>
          ))}
        </div>

        <p className="mt-2 pb-2.5 text-center text-[12px] text-[#9AB8DC]">
          เลขคู่ {pairA} · {pairB}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setOpenNumbers((v) => !v)}
        aria-expanded={openNumbers}
        className="flex w-full items-center justify-center gap-1 border-t border-white/[0.08] py-2 text-[13px] font-medium text-[#F16DB5] outline-none focus-visible:ring-2 focus-visible:ring-[#F16DB5]/40"
      >
        ดูความหมาย
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            openNumbers && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          openNumbers ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <ul className="space-y-1 px-3 pb-3 text-[13px] leading-[1.6] text-[#9AB8DC]">
            {numbers.map((n) => (
              <li key={`m-${n}`}>
                {n} — {NUMBER_MEANINGS[n - 1]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
