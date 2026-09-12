"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { buildDailyReadingPack } from "@/lib/fortune/build-daily-pack";
import {
  hydrateFortuneProfileFromWizard,
  readFortuneProfile,
} from "@/lib/fortune/profile-storage";
import { APP_BRAND_MARK } from "@/lib/site";
import { cn } from "@/lib/utils";

const SHIRT_DETAILS = [
  { id: "green", name: "เขียว", meaning: "การงาน", src: "/images/shirts/green.webp" },
  { id: "purple", name: "ม่วง", meaning: "โชคลาภ", src: "/images/shirts/purple.webp" },
  { id: "orange", name: "ส้ม", meaning: "ความมั่นใจ", src: "/images/shirts/orange.webp" },
  { id: "red", name: "แดง", meaning: "พลังใจ", src: "/images/shirts/red.webp" },
  { id: "black", name: "ดำ", meaning: "คุ้มครอง", src: "/images/shirts/black.webp" },
] as const;

/** Free lucky shirt of the day */
export default function LuckyShirtPage() {
  const [ready, setReady] = useState(false);
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    hydrateFortuneProfileFromWizard();
    const p = readFortuneProfile();
    if (p?.birthDate) setBirthDate(p.birthDate);
    if (p?.nickname) setNickname(p.nickname);
    setReady(true);
  }, []);

  const shirt = useMemo(() => {
    return buildDailyReadingPack({
      birthDate,
      nickname: nickname || "คุณ",
    }).shirt;
  }, [birthDate, nickname]);

  return (
    <div className="relative mx-auto w-full max-w-[480px] px-4 pb-16 pt-2">
      <header className="relative flex items-center justify-between py-2">
        <Link
          href="/menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#d5b16f] outline-none transition active:scale-95"
          aria-label="กลับ"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
        </Link>
        <div className="min-w-0 flex-1 px-2 text-center">
          <p className="text-[11px] tracking-[0.18em] text-[#d5b16f]/75">
            {APP_BRAND_MARK}
          </p>
          <h1 className="text-[1.2rem] font-bold tracking-wide text-[#f7f4ec]">
            สีเสื้อมงคล
          </h1>
        </div>
        <span className="w-9" aria-hidden />
      </header>

      {!ready ? (
        <p className="mt-10 text-center text-[14px] text-[#9AB8DC]">กำลังเปิด…</p>
      ) : (
        <div className="mt-4 space-y-4">
          <section className="mae-aspect-card rounded-[22px] px-4 py-5 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center">
              <FortuneIcon name="shirt" size={28} plain />
            </div>
            <p className="mt-2 text-[12px] font-semibold tracking-wide text-[#d5b16f]">
              สีแนะนำวันนี้
            </p>
            <div className="mx-auto mt-3 flex h-28 w-28 items-center justify-center">
              <Image
                src={shirt.src}
                alt={shirt.name}
                width={160}
                height={160}
                unoptimized
                className="h-24 w-24 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
              />
            </div>
            <p className="mt-2 text-[1.35rem] font-bold text-[#f7f4ec]">
              สี{shirt.name}
            </p>
            <p className="mt-1 text-[14px] text-[#c5cdd9]/85">
              เสริมเรื่อง{shirt.meaning}
            </p>
          </section>

          <section className="mae-aspect-card rounded-[20px] px-3.5 py-3.5">
            <p className="text-[13px] font-semibold text-[#d5b16f]">
              สีอื่นที่เสริมได้
            </p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {SHIRT_DETAILS.map((s) => {
                const active = s.name === shirt.name;
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-[14px] px-1 py-2",
                      active && "bg-[rgba(213,177,111,0.12)]"
                    )}
                  >
                    <span className="relative flex h-11 w-11 items-center justify-center">
                      <Image
                        src={s.src}
                        alt={s.name}
                        width={72}
                        height={72}
                        unoptimized
                        className="h-9 w-9 object-contain"
                      />
                    </span>
                    <span className="text-center text-[10.5px] font-medium leading-tight text-[#f7f4ec]/8">
                      {s.meaning}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
