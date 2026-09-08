"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarRange,
  ChartNoAxesColumn,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Heart,
} from "lucide-react";
import { AnimatedPage } from "@/components/ui/reveal";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import { setPremiumUnlocked } from "@/lib/fortune/premium-unlock";
import {
  hydrateFortuneProfileFromWizard,
  readFortuneProfile,
  WIZARD_CACHE_KEY,
} from "@/lib/fortune/profile-storage";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";

const LIST_PRICE = 699;

const FEATURES = [
  {
    title: "ปฏิทินฤกษ์ 12 ปี",
    detail: "เลือกวันมงคล พลังงาน และช่วงที่ควรระวัง",
    Icon: CalendarRange,
  },
  {
    title: "เจาะลึกดวงราศีของคุณ",
    detail: "บุคลิก จุดแข็ง จุดเปลี่ยน และคำแนะนำเฉพาะคุณ",
    Icon: Compass,
  },
  {
    title: "เส้นทางชีวิต 12 ปี",
    detail: "จุดเปลี่ยนรายปี พร้อมแนวทางรับมือ",
    Icon: ChartNoAxesColumn,
  },
  {
    title: "งาน · เงิน · ความรัก",
    detail: "อ่านเชิงลึกในเรื่องที่กระทบชีวิตจริง",
    Icon: Heart,
  },
] as const;

const BEFORE_READ = [
  "ตั้งจิตให้สงบก่อนอ่าน",
  "ใช้เป็นแนวทาง ไม่ใช่คำตัดสิน",
  "เลือกวันมงคลก่อนเริ่มเรื่องสำคัญ",
] as const;

function hasWizardReading() {
  try {
    const raw = sessionStorage.getItem(WIZARD_CACHE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as {
      step?: string;
      profile?: { nickname?: string };
    };
    return parsed?.step === "result" && Boolean(parsed.profile?.nickname);
  } catch {
    return false;
  }
}

/** Premium sales — open Guanyin hero + glass cards + clear buy CTA */
export function PremiumSalesPage({
  onUnlocked,
}: {
  onUnlocked?: () => void;
} = {}) {
  const [hasReading, setHasReading] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  useStripePaymentReturn(() => {
    onUnlocked?.();
  });

  useEffect(() => {
    hydrateFortuneProfileFromWizard();
    const profile = readFortuneProfile();
    setHasReading(hasWizardReading() || Boolean(profile?.nickname));
  }, []);

  function handlePaid() {
    const profile = readFortuneProfile();
    setPremiumUnlocked(
      profile
        ? { birthDate: profile.birthDate, nickname: profile.nickname }
        : null
    );
    setPayOpen(false);
    onUnlocked?.();
  }

  function openPay() {
    if (hasReading) setPayOpen(true);
  }

  const ctaClass =
    "no-sky-lift flex w-full items-center justify-between rounded-full px-5 py-3.5 outline-none transition active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/45";
  const ctaStyle = {
    background: "linear-gradient(90deg, #6A48C8 0%, #8B6AD8 52%, #B29AEF 100%)",
  } as const;

  return (
    <AnimatedPage className="sky-copy mx-auto flex w-full max-w-[480px] flex-col px-3 pb-4 pt-2">
      {/* Header */}
      <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center px-0.5">
        <Link
          href="/"
          className="inline-flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-[#3A2F6B] outline-none transition active:opacity-60"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
          กลับ
        </Link>
        <span className="justify-self-center" aria-hidden />
        <span className="justify-self-end" aria-hidden />
      </div>

      {/* Compact Guanyin breathe — keep face visible, less empty scroll */}
      <div className="relative h-[72px] shrink-0" aria-hidden />

      {/* Title + price — padding so white text-shadow isn't clipped */}
      <div className="relative z-10 -mt-1 overflow-visible px-1 py-3 text-center">
        <div
          className="pointer-events-none absolute inset-x-[-8%] -top-2 -bottom-2 -z-10 rounded-[36px]"
          style={{
            background:
              "radial-gradient(ellipse 75% 70% at 50% 45%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.35) 55%, transparent 78%)",
          }}
          aria-hidden
        />

        <h1 className="text-[1.85rem] font-bold leading-tight tracking-tight text-[#241C4F]">
          ดวงพรีเมียม
        </h1>
        <p className="mx-auto mt-1.5 max-w-[19rem] text-[12.5px] leading-snug text-[#4A4278]">
          เปิดคำทำนายฉบับเต็ม จังหวะชีวิตและคำแนะนำเฉพาะคุณ
        </p>

        <div className="mt-2.5 flex items-center justify-center gap-2">
          <span className="text-[14px] text-[#9A90C0] line-through">
            {LIST_PRICE} บาท
          </span>
          <span className="text-[1.65rem] font-bold tabular-nums leading-tight text-[#241C4F]">
            {FORTUNE_UNLOCK_PRICE}
            <span className="ml-1 text-[1rem] font-semibold">บาท</span>
          </span>
        </div>
      </div>

      {/* Benefits — tighter */}
      <section className="fortune-glass relative z-10 mt-3 rounded-[18px] px-3.5 py-3">
        <div className="mb-2 flex items-center gap-1.5">
          <FortuneIcon name="sparkle" size={15} />
          <h2 className="text-[14px] font-semibold text-[#241C4F]">
            สิ่งที่คุณจะได้รับ
          </h2>
        </div>
        <ul className="space-y-2">
          {FEATURES.map(({ title, detail, Icon }) => (
            <li key={title} className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8DFFC] ring-1 ring-[#9B7FE8]/28">
                <Icon className="h-4 w-4 text-[#5B45B8]" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold leading-snug text-[#241C4F]">
                  {title}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#5E5688]">
                  {detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Before read — compact one block */}
      <section className="fortune-glass relative z-10 mt-2 rounded-[18px] px-3.5 py-2.5">
        <div className="mb-1.5 flex items-center gap-1.5">
          <FortuneIcon name="sparkle" size={15} />
          <h2 className="text-[14px] font-semibold text-[#241C4F]">
            ก่อนเปิดอ่าน
          </h2>
        </div>
        <ul className="space-y-1.5">
          {BEFORE_READ.map((line) => (
            <li key={line} className="flex items-center gap-2">
              <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#F6E2A6]">
                <Check className="h-2.5 w-2.5 text-[#A07E1A]" strokeWidth={2.8} />
              </span>
              <span className="text-[12px] leading-snug text-[#3A3270]">
                {line}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Buy CTA */}
      <div className="relative z-10 mt-3 space-y-2">
        {hasReading ? (
          <button
            type="button"
            onClick={openPay}
            className={ctaClass}
            style={ctaStyle}
          >
            <span className="inline-flex min-w-0 items-center gap-2 text-[15px] font-bold text-white">
              <FortuneIcon name="sparkle" size={18} />
              <span className="truncate">
                ปลดล็อกดวงพรีเมียม · {FORTUNE_UNLOCK_PRICE} บาท
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-white" strokeWidth={2.4} />
          </button>
        ) : (
          <Link href="/reading" className={ctaClass} style={ctaStyle}>
            <span className="inline-flex min-w-0 items-center gap-2 text-[15px] font-bold text-white">
              <FortuneIcon name="sparkle" size={18} />
              <span className="truncate">เริ่มดูดวงแล้วปลดล็อกพรีเมียม</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-white" strokeWidth={2.4} />
          </Link>
        )}
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#6B6490]">
          <FortuneIcon name="lock" size={14} />
          ข้อมูลของคุณจะถูกเก็บเป็นส่วนตัว
        </p>
      </div>

      <FortunePaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onPaid={handlePaid}
        returnPath="/premium"
      />
    </AnimatedPage>
  );
}
