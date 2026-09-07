"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Shirt, Target } from "lucide-react";
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

const SHIRTS = [
  { id: "green", name: "เขียว", meaning: "งาน", src: "/images/shirts/green.png" },
  { id: "purple", name: "ม่วง", meaning: "เสน่ห์", src: "/images/shirts/purple.png" },
  { id: "orange", name: "ส้ม", meaning: "มั่นใจ", src: "/images/shirts/orange.png" },
] as const;

function numberSrc(n: number) {
  return `/images/numbers/${n}.png`;
}

/** Compact lucky numbers + shirt colors */
export function FortuneLuckyExtras({
  seed = "dooduang",
  className,
}: {
  seed?: string;
  className?: string;
}) {
  const [openNumbers, setOpenNumbers] = useState(false);
  const [openShirts, setOpenShirts] = useState(false);

  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const numbers: number[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = hashSeed(`${seed}-n${i}`) % pool.length;
    numbers.push(pool.splice(idx, 1)[0]!);
  }
  const pairA = `${numbers[0]}${numbers[1]}`;
  const pairB = `${numbers[1]}${numbers[2]}`;

  return (
    <div className={cn("grid grid-cols-2 items-start gap-2.5", className)}>
      <section className="overflow-hidden rounded-[16px] border border-[#F16DB5]/30 bg-[#121D36]">
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

      <section className="overflow-hidden rounded-[16px] border border-[#46DDED]/30 bg-[#121D36]">
        <div className="px-3 pt-3">
          <div className="flex items-center gap-1.5">
            <Shirt className="h-3.5 w-3.5 shrink-0 text-[#46DDED]" strokeWidth={1.8} />
            <h3 className="text-[13px] font-semibold text-[#F7F8FF]">สีเสื้อมงคล</h3>
          </div>

          <div className="mt-2.5 flex items-end justify-center gap-2 pb-2.5">
            {SHIRTS.map((s) => (
              <div key={s.id} className="flex w-[2.35rem] flex-col items-center gap-1">
                <span
                  className="relative block h-8 w-8"
                  data-slot={`shirt-${s.id}`}
                >
                  <Image
                    src={s.src}
                    alt={`${s.name} (${s.meaning})`}
                    width={64}
                    height={58}
                    unoptimized
                    className="h-full w-full object-contain"
                  />
                </span>
                <span className="text-[11px] font-medium text-[#9AB8DC]">
                  {s.meaning}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpenShirts((v) => !v)}
          aria-expanded={openShirts}
          className="flex w-full items-center justify-center gap-1 border-t border-white/[0.08] py-2 text-[13px] font-medium text-[#46DDED] outline-none focus-visible:ring-2 focus-visible:ring-[#46DDED]/40"
        >
          ดูรายละเอียด
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              openShirts && "rotate-180"
            )}
            strokeWidth={2}
          />
        </button>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out",
            openShirts ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <ul className="space-y-1 px-3 pb-3 text-[13px] leading-[1.6] text-[#9AB8DC]">
              {SHIRTS.map((s) => (
                <li key={s.id}>
                  {s.name} — เหมาะกับเรื่อง{s.meaning}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
