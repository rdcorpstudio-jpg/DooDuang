"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Lock, Sparkles } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import {
  LUCKY_SHIRT_CATALOG,
  getLuckyShirtById,
  pickLuckyShirtForDay,
  pickLuckyShirtsForRange,
  type LuckyShirtInfo,
} from "@/lib/fortune/content/lucky-shirts";
import {
  isPremiumUnlocked,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import {
  hydrateFortuneProfileFromWizard,
  readFortuneProfile,
} from "@/lib/fortune/profile-storage";
import { APP_BRAND_MARK, FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Free = วันนี้เท่านั้น · พรีเมียม = ดูรายละเอียดทุกสี + สีแนะนำ 7 วัน */
function LuckyShirtPageInner() {
  const [ready, setReady] = useState(false);
  const [premium, setPremium] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [nickname, setNickname] = useState("");
  const [birthTime, setBirthTime] = useState<string | undefined>();
  const [birthPlace, setBirthPlace] = useState<string | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function syncProfile() {
    hydrateFortuneProfileFromWizard();
    const p = readFortuneProfile();
    if (p?.birthDate) setBirthDate(p.birthDate);
    if (p?.nickname) setNickname(p.nickname);
    setBirthTime(p?.birthTime);
    setBirthPlace(p?.birthPlace);
    setPremium(
      isPremiumUnlocked(
        p ? { birthDate: p.birthDate, nickname: p.nickname } : null
      )
    );
    setReady(true);
  }

  useEffect(() => {
    syncProfile();
  }, []);

  useStripePaymentReturn(() => {
    const p = readFortuneProfile();
    setPremiumUnlocked(
      p ? { birthDate: p.birthDate, nickname: p.nickname } : null
    );
    setPremium(true);
    setPayOpen(false);
  });

  const input = useMemo(
    () => ({
      birthDate,
      nickname: nickname || "คุณ",
      birthTime: premium ? birthTime : undefined,
      birthPlace: premium ? birthPlace : undefined,
    }),
    [birthDate, nickname, birthTime, birthPlace, premium]
  );

  const todayShirt = useMemo(
    () => pickLuckyShirtForDay(input),
    [input]
  );

  const week = useMemo(
    () => (premium ? pickLuckyShirtsForRange(input, 7) : []),
    [input, premium]
  );

  const active: LuckyShirtInfo = selectedId
    ? getLuckyShirtById(selectedId)
    : todayShirt;

  const isTodayPick = active.id === todayShirt.id;

  function selectShirt(shirt: LuckyShirtInfo) {
    setSelectedId(shirt.id);
  }

  return (
    <div className="relative h-full overflow-y-auto overscroll-contain">
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
        <div className="mt-4 space-y-3.5">
          <section className="mae-aspect-card rounded-[22px] px-4 py-5 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center">
              <FortuneIcon name="shirt" size={28} plain />
            </div>
            <p className="mt-2 text-[12px] font-semibold tracking-wide text-[#d5b16f]">
              {isTodayPick ? "สีแนะนำวันนี้" : "รายละเอียดสีที่เลือก"}
            </p>
            <div className="mx-auto mt-3 flex h-28 w-28 items-center justify-center">
              <Image
                src={active.src}
                alt={active.name}
                width={160}
                height={160}
                unoptimized
                className="h-24 w-24 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
              />
            </div>
            <p className="mt-2 text-[1.35rem] font-bold text-[#f7f4ec]">
              สี{active.name}
            </p>
            <p className="mt-1 text-[14px] font-medium text-[#e8d19a]">
              เสริมเรื่อง{active.meaning}
            </p>

            {premium || isTodayPick ? (
              <div className="mt-4 space-y-3 text-left">
                <p className="text-[13.5px] leading-[1.7] text-[#f7f4ec]/82">
                  {active.summary}
                </p>
                <div
                  className="rounded-[14px] px-3 py-2.5"
                  style={{
                    background: "rgba(16,24,39,0.55)",
                    boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.22)",
                  }}
                >
                  <p className="text-[11px] font-semibold tracking-wide text-[#d5b16f]">
                    วิธีใส่
                  </p>
                  <p className="mt-1 text-[13px] leading-snug text-[#f7f4ec]/78">
                    {active.howTo}
                  </p>
                </div>
                <div
                  className="rounded-[14px] px-3 py-2.5"
                  style={{
                    background: "rgba(16,24,39,0.55)",
                    boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.22)",
                  }}
                >
                  <p className="text-[11px] font-semibold tracking-wide text-[#d5b16f]">
                    ลองทำวันนี้
                  </p>
                  <p className="mt-1 text-[13px] leading-snug text-[#f7f4ec]/78">
                    {active.tip}
                  </p>
                </div>
                <p className="text-[12px] leading-snug text-[#c5cdd9]/65">
                  ระวัง: {active.avoid}
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5 text-left">
                <p className="text-[13px] leading-[1.65] text-[#f7f4ec]/55">
                  ฟรีดูรายละเอียดเต็มได้เฉพาะสีแนะนำวันนี้ — ปลดล็อกเพื่ออ่านทุกสีและสีแนะนำ 7 วัน
                </p>
                <button
                  type="button"
                  onClick={() => setPayOpen(true)}
                  className="mae-gold-cta inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-semibold"
                >
                  <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
                  เปิดทั้งหมด · {FORTUNE_UNLOCK_PRICE} บาท
                </button>
              </div>
            )}
          </section>

          <section className="mae-aspect-card rounded-[20px] px-3.5 py-3.5">
            <p className="text-[13px] font-semibold text-[#d5b16f]">
              สีอื่นที่เสริมได้ · แตะเพื่อดู
            </p>
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {LUCKY_SHIRT_CATALOG.map((s) => {
                const activePick = s.id === active.id;
                const todayDot = s.id === todayShirt.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectShirt(s)}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 rounded-[14px] px-1 py-2.5 outline-none transition active:scale-[0.97]",
                      activePick
                        ? "bg-[rgba(213,177,111,0.18)] shadow-[inset_0_0_0_1px_rgba(213,177,111,0.45)]"
                        : "hover:bg-[rgba(213,177,111,0.08)]"
                    )}
                    aria-pressed={activePick}
                    aria-label={`สี${s.name} · ${s.meaning}`}
                  >
                    {todayDot ? (
                      <span
                        className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#d5b16f]"
                        aria-hidden
                      />
                    ) : null}
                    <span className="relative flex h-11 w-11 items-center justify-center">
                      <Image
                        src={s.src}
                        alt=""
                        width={72}
                        height={72}
                        unoptimized
                        className="h-9 w-9 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
                      />
                    </span>
                    <span className="text-center text-[11px] font-semibold leading-tight text-[#e8d19a]">
                      {s.label}
                    </span>
                    <span className="text-center text-[9.5px] font-medium leading-tight text-[#f7f4ec]/55">
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {premium ? (
            <section className="mae-aspect-card rounded-[20px] px-3.5 py-3.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#d5b16f]" strokeWidth={1.8} />
                <p className="text-[13px] font-semibold text-[#d5b16f]">
                  สีแนะนำ 7 วัน
                </p>
              </div>
              <ul className="mt-3 space-y-2">
                {week.map((d) => (
                  <li key={d.iso}>
                    <button
                      type="button"
                      onClick={() => selectShirt(d.shirt)}
                      className="flex w-full items-center gap-3 rounded-[14px] px-2.5 py-2 text-left outline-none transition active:scale-[0.99]"
                      style={{
                        background: "rgba(16,24,39,0.45)",
                        boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.2)",
                      }}
                    >
                      <Image
                        src={d.shirt.src}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                        className="h-9 w-9 object-contain"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-semibold text-[#f7f4ec]">
                          {d.label}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-[#e8d19a]/9">
                          สี{d.shirt.name} · {d.shirt.meaning}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section className="mae-aspect-card rounded-[20px] px-3.5 py-3.5 text-center">
              <p className="text-[13px] font-semibold text-[#d5b16f]">
                พรีเมียม · ดูสีแนะนำทั้งสัปดาห์
              </p>
              <p className="mt-1.5 text-[12px] leading-snug text-[#f7f4ec]/65">
                ฟรีดูได้เฉพาะวันนี้ · ปลดล็อกเพื่ออ่านรายละเอียดทุกสีและแผน 7 วัน
              </p>
              <button
                type="button"
                onClick={() => setPayOpen(true)}
                className="mae-gold-cta mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-semibold"
              >
                <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
                ปลดล็อกพรีเมียม
              </button>
            </section>
          )}
        </div>
      )}

      <FortunePaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onPaid={() => {
          const p = readFortuneProfile();
          setPremiumUnlocked(
            p ? { birthDate: p.birthDate, nickname: p.nickname } : null
          );
          setPremium(true);
          setPayOpen(false);
        }}
        returnPath="/reading/shirt"
      />
    </div>
    </div>
  );
}

export default function LuckyShirtPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-10 text-center text-[14px] text-[#9AB8DC]">
          กำลังเปิด…
        </div>
      }
    >
      <LuckyShirtPageInner />
    </Suspense>
  );
}
