"use client";

import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { cn } from "@/lib/utils";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

const COLOR_POOL = [
  { name: "ม่วง", hex: "#B9A4F0" },
  { name: "ครีม", hex: "#F3E6C8" },
  { name: "เขียว", hex: "#7ED9A8" },
  { name: "ฟ้า", hex: "#8EC5F5" },
  { name: "ชมพู", hex: "#F2A8C8" },
  { name: "ทอง", hex: "#E4C56A" },
] as const;

/** Lucky colors + numbers strip */
export function FortuneLuckyStrip({
  seed = "dooduang",
  className,
}: {
  seed?: string;
  className?: string;
}) {
  const c0 = COLOR_POOL[hashSeed(`${seed}-c0`) % COLOR_POOL.length]!;
  let c1 = COLOR_POOL[hashSeed(`${seed}-c1`) % COLOR_POOL.length]!;
  if (c1.name === c0.name) {
    c1 = COLOR_POOL[(hashSeed(`${seed}-c1`) + 1) % COLOR_POOL.length]!;
  }

  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const numbers: number[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = hashSeed(`${seed}-n${i}`) % pool.length;
    numbers.push(pool.splice(idx, 1)[0]!);
  }

  return (
    <section
      className={cn(
        "fortune-glass flex items-center gap-3 rounded-[18px] px-3 py-3.5",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[#6B6490]">สีมงคลวันนี้</p>
        <div className="mt-2 flex items-center gap-2.5">
          {[c0, c1].map((c) => (
            <span key={c.name} className="inline-flex items-center gap-1.5">
              <span
                className="h-5 w-5 rounded-full ring-1 ring-[#7B6BB0]/25"
                style={{ background: c.hex }}
                aria-hidden
              />
              <span className="text-[14px] font-medium text-[#2C2458]">
                {c.name}
              </span>
            </span>
          ))}
        </div>
      </div>

      <span className="h-10 w-px shrink-0 bg-[#7B6BB0]/20" aria-hidden />

      <div className="shrink-0 text-right">
        <p className="inline-flex items-center justify-end gap-1 text-[13px] font-medium text-[#6B6490]">
          <FortuneIcon name="clover" size={22} />
          เลขนำโชค
        </p>
        <p className="mt-1.5 text-[1.35rem] font-semibold tracking-wide text-[#2C2458]">
          {numbers.join(" · ")}
        </p>
      </div>
    </section>
  );
}
