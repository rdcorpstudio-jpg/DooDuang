"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CalendarRange,
  ChartNoAxesColumnIncreasing,
  Check,
  Compass,
  Crown,
  Sparkles,
} from "lucide-react";
import { AnimatedPage } from "@/components/ui/reveal";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { setPremiumUnlocked } from "@/lib/fortune/premium-unlock";
import {
  hydrateFortuneProfileFromWizard,
  readFortuneProfile,
  WIZARD_CACHE_KEY,
} from "@/lib/fortune/profile-storage";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";

const FEATURES = [
  {
    title: "ปฏิทินฤกษ์ 12 ปี",
    sub: "เลือกวันมงคล พลังงาน และจุดที่ควรระวัง",
    Icon: CalendarRange,
  },
  {
    title: "เจาะลึกราศีของคุณ",
    sub: "บุคลิก จุดแข็ง จุดเปลี่ยน และคำแนะนำเฉพาะราศี",
    Icon: Compass,
  },
  {
    title: "เส้นทางชีวิต 12 ปี",
    sub: "จุดเปลี่ยนรายปีพร้อมแนวทางพิจารณา",
    Icon: ChartNoAxesColumnIncreasing,
  },
  {
    title: "งาน · เงิน · ความรัก",
    sub: "อ่านเชิงลึกในเรื่องที่กระทบชีวิตจริง",
    Icon: Sparkles,
  },
] as const;

const RITES = [
  "ตั้งจิตให้สงบก่อนอ่าน",
  "ใช้เป็นแสงนำทาง ไม่ใช่คำตัดสิน",
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

/** Sales / unlock only — unlocked content lives on PremiumHomePage */
export function PremiumSalesPage({
  onUnlocked,
}: {
  onUnlocked?: () => void;
} = {}) {
  const [hasReading, setHasReading] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

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

  return (
    <AnimatedPage className="mx-auto flex w-full max-w-[480px] flex-col gap-4 px-4 pb-6 pt-5">
      <section className="fortune-glass relative overflow-hidden rounded-[22px] px-4 pb-5 pt-6 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden
          style={{
            background: [
              "radial-gradient(ellipse 80% 55% at 50% -10%, rgba(244,188,82,0.22), transparent 55%)",
              "radial-gradient(circle at 12% 88%, rgba(187,108,240,0.12), transparent 40%)",
            ].join(", "),
          }}
        />
        <div className="relative z-[1]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center">
            <Image
              src="/images/icons/star-gold.png"
              alt=""
              width={56}
              height={56}
              className="object-contain"
              style={{ mixBlendMode: "screen" }}
              unoptimized
            />
          </div>
          <p className="mt-2 text-[11px] font-semibold tracking-[0.28em] text-[#F4BC52]/90">
            DOODUANG · SACRED READING
          </p>
          <h1 className="font-sacred mt-2 text-[2rem] leading-tight tracking-wide text-[#F7F8FF] drop-shadow-[0_0_24px_rgba(244,188,82,0.28)]">
            ดวง<span className="intro-title-accent">พรีเมียม</span>
          </h1>
          <p className="mx-auto mt-2 max-w-[20rem] text-[14px] leading-relaxed text-[#9AB8DC]">
            ปลดล็อกแล้วจะเปิดหน้าดวงเต็มบนแท็บนี้ — ปฏิทินครบ จังหวะเดือน
            และเนื้อหาเชิงลึก
          </p>

          <div className="mt-4 flex items-end justify-center gap-2">
            <span className="pb-1 text-[14px] text-[#9AB8DC]/55 line-through">
              699
            </span>
            <span
              className="text-[40px] font-bold leading-none tracking-tight"
              style={{
                background:
                  "linear-gradient(180deg, #FFF8E4 8%, #F4BC52 48%, #C9922E 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {FORTUNE_UNLOCK_PRICE}.-
            </span>
            <span className="pb-1.5 text-[13px] text-[#9AB8DC]">บาท</span>
          </div>
        </div>
      </section>

      <section className="fortune-glass rounded-[20px] px-3.5 py-4">
        <div className="mb-3 flex items-center gap-2">
          <Crown className="h-4 w-4 text-[#F4BC52]" strokeWidth={1.9} />
          <h2 className="font-sacred text-[1.25rem] text-[#F7F8FF]">
            สิ่งที่คุณจะได้รับ
          </h2>
        </div>
        <ul className="space-y-3">
          {FEATURES.map(({ title, sub, Icon }) => (
            <li key={title} className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(244,188,82,0.22), rgba(244,188,82,0.06))",
                  boxShadow: "inset 0 0 0 1px rgba(244,188,82,0.4)",
                }}
              >
                <Icon className="h-4 w-4 text-[#F4BC52]" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[15px] font-semibold text-[#F7F8FF]">
                  {title}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-[#9AB8DC]">
                  {sub}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="fortune-glass rounded-[20px] px-3.5 py-4">
        <h2 className="font-sacred text-[1.2rem] text-[#F7F8FF]">ก่อนเปิดอ่าน</h2>
        <ul className="mt-3 space-y-2.5">
          {RITES.map((line) => (
            <li key={line} className="flex items-start gap-2.5">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-[#F4BC52]"
                strokeWidth={2.2}
              />
              <span className="text-[14px] leading-relaxed text-[#9AB8DC]">
                {line}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="space-y-2.5">
        {hasReading ? (
          <button
            type="button"
            onClick={() => setPayOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[15px] font-semibold text-[#1A1208] outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/55"
            style={{
              background:
                "linear-gradient(135deg, #FFF0C4 0%, #F4BC52 40%, #C9922E 100%)",
              boxShadow:
                "0 12px 32px rgba(244,188,82,0.38), inset 0 1px 0 rgba(255,255,255,0.45)",
            }}
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
            ปลดล็อกหน้าพรีเมียม
          </button>
        ) : (
          <Link
            href="/reading"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[15px] font-semibold text-[#1A1208] outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/55"
            style={{
              background:
                "linear-gradient(135deg, #FFF0C4 0%, #F4BC52 40%, #C9922E 100%)",
              boxShadow:
                "0 12px 32px rgba(244,188,82,0.38), inset 0 1px 0 rgba(255,255,255,0.45)",
            }}
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
            เริ่มดูดวงแล้วปลดล็อกพรีเมียม
          </Link>
        )}
        <p className="text-center text-[12px] leading-relaxed text-[#9AB8DC]/75">
          หลังชำระเงิน แท็บพรีเมียมจะกลายเป็นหน้าดวงแบบปลดล็อกเต็ม
        </p>
        <Link
          href="/pricing"
          className="block text-center text-[13px] text-[#F4BC52]/85 underline-offset-2 hover:underline"
        >
          หรือดูแพ็กเครดิตอื่น
        </Link>
      </div>

      <FortunePaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onPaid={handlePaid}
      />
    </AnimatedPage>
  );
}
