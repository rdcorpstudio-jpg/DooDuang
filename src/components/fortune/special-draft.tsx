"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Ban,
  ChevronRight,
  Crown,
  MessageCircle,
  Moon,
  Sparkles,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FixedAppBottomNav } from "@/components/layout/bottom-nav";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { AnimatedPage } from "@/components/ui/reveal";
import { requirePremiumFromServer } from "@/lib/fortune/premium-unlock";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const TEXT_MUTED = "rgba(230, 236, 248, 0.88)";
const GOLD_RING =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";

const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

type ComingSoonItem = {
  id: string;
  title: string;
  blurb: string;
  art: string;
  Icon: LucideIcon;
  href?: string;
  status?: string;
};

const NEW_ITEMS: ComingSoonItem[] = [
  {
    id: "dream",
    title: "ทำนายฝัน",
    blurb: "พิมพ์ความฝัน แม่ตีความให้วันละครั้ง",
    art: "/images/special/coming-soon/03-dream-reading.webp?v=2",
    Icon: Moon,
    href: "/special/dream",
  },
];

const COMING_SOON_ITEMS: ComingSoonItem[] = [
  {
    id: "lucky-numbers",
    title: "เลขมงคล",
    blurb: "กำลังเตรียมเปิดใช้งาน",
    art: "/images/special/coming-soon/01-lucky-numbers.webp?v=2",
    Icon: Sparkles,
  },
  {
    id: "consult-mae",
    title: "ปรึกษาแม่",
    blurb: "คุยกับแม่เรื่องที่อยู่ในใจ",
    art: "/images/special/coming-soon/02-consult-mae.webp",
    Icon: MessageCircle,
  },
  {
    id: "civil-exam",
    title: "ดวงสอบราชการ",
    blurb: "กำลังเตรียมเปิดใช้งาน",
    art: "/images/special/coming-soon/04-civil-service-exam.webp",
    Icon: Star,
  },
];

function SectionLabel({
  label,
  hint,
}: {
  label: string;
  hint?: string;
}) {
  return (
    <div className="mb-3.5 mt-8">
      <div className="flex items-center gap-2.5">
        <Sparkles
          className="h-4 w-4 shrink-0"
          style={{ color: GOLD }}
          strokeWidth={2.2}
        />
        <h2 className="text-[17px] font-bold tracking-wide text-white">
          {label}
        </h2>
        <span
          className="h-px flex-1"
          style={{
            background:
              "linear-gradient(90deg, rgba(232,209,154,0.45), transparent)",
          }}
        />
      </div>
      {hint ? (
        <p
          className="mt-1.5 pl-[1.6rem] text-[15px] font-medium leading-snug"
          style={{ color: "rgba(210,222,240,0.82)" }}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ComingSoonCard({ item }: { item: ComingSoonItem }) {
  const Icon = item.Icon;

  return (
    <div
      className="relative w-full overflow-hidden rounded-[22px]"
      style={{
        aspectRatio: "2.2 / 1",
        background:
          "linear-gradient(118deg, #152038 0%, #0c1528 48%, #08101e 100%)",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.1), 0 12px 28px rgba(0,0,0,0.28)",
      }}
      aria-label={`${item.title} · เร็วๆ นี้`}
    >
      <Image
        src={item.art}
        alt=""
        fill
        unoptimized
        className="object-cover object-[78%_50%] opacity-90"
        sizes="(max-width: 480px) 100vw, 960px"
      />

      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(105deg, rgba(8,14,28,0.96) 0%, rgba(8,14,28,0.8) 40%, rgba(8,14,28,0.35) 62%, transparent 80%)",
        }}
      />

      <div className="relative z-[1] flex h-full flex-col justify-between px-4 py-4">
        <div className="max-w-[64%]">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full"
            style={{
              color: GOLD,
              boxShadow: "inset 0 0 0 1.5px rgba(232,209,154,0.5)",
              background: "rgba(8,12,24,0.45)",
            }}
            aria-hidden
          >
            <Icon className="h-4 w-4" strokeWidth={2.1} />
          </span>
          <p className="mt-2.5 text-[1.2rem] font-bold leading-[1.3] text-white">
            {item.title}
          </p>
          <p
            className="mt-1 text-[15px] font-medium leading-[1.45]"
            style={{ color: "rgba(220,230,245,0.88)" }}
          >
            {item.blurb}
          </p>
        </div>

        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-[0.4em] text-[15px] font-semibold leading-[1.4]"
          style={{
            color: "rgba(245,247,255,0.92)",
            background: "rgba(6,10,20,0.78)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)",
          }}
        >
          <Ban className="h-3.5 w-3.5 shrink-0 opacity-80" strokeWidth={2.3} />
          เร็วๆ นี้
        </span>
      </div>
    </div>
  );
}

function OpenFeatureCard({ item }: { item: ComingSoonItem }) {
  if (!item.href) return null;

  return (
    <Link
      href={item.href}
      className="group relative block w-full overflow-hidden rounded-[24px] outline-none transition duration-200 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
      style={{
        boxShadow:
          "0 18px 40px rgba(0,0,0,0.38), 0 0 0 1px rgba(232,209,154,0.28)",
      }}
      aria-label={item.title}
    >
      <div
        className="relative overflow-hidden rounded-[24px]"
        style={{ minHeight: 220 }}
      >
        <Image
          src={item.art}
          alt=""
          fill
          unoptimized
          className="object-cover object-[82%_center] transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 480px) 100vw, 960px"
        />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "linear-gradient(160deg, rgba(4,8,18,0.55) 0%, rgba(4,8,18,0.72) 42%, rgba(4,8,18,0.94) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-[1.5px] rounded-[22.5px]"
          aria-hidden
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(232,209,154,0.35), inset 0 1px 0 rgba(255,248,228,0.2)",
          }}
        />

        <span
          className="absolute right-3.5 top-3.5 z-[2] rounded-full px-3 py-[0.4em] text-[15px] font-semibold leading-none"
          style={{
            color: GOLD,
            background: "rgba(8,12,24,0.72)",
            boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          วันละ 1 ครั้ง
        </span>

        <div className="relative z-[1] flex min-h-[220px] flex-col justify-end px-4 pb-4 pt-14 sm:px-5">
          <p
            className="text-[15px] font-semibold tracking-[0.14em]"
            style={{ color: GOLD }}
          >
            ตำราแม่มั่งมี
          </p>
          <p
            className="mt-1.5 text-[1.55rem] font-bold leading-[1.25]"
            style={{
              ...TITLE_GOLD,
              paddingTop: "0.08em",
              paddingBottom: "0.04em",
            }}
          >
            {item.title}
          </p>
          <p
            className="mt-2 max-w-[18rem] text-[15px] font-medium leading-[1.5]"
            style={{ color: "rgba(240,244,250,0.9)" }}
          >
            {item.blurb}
          </p>

          <span className="wallpaper-dl-btn group/btn relative mt-4 flex h-[3.35rem] w-full items-center gap-3 overflow-hidden rounded-[16px] px-2.5 text-left">
            <span className="wallpaper-dl-btn__icon relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]">
              <Moon className="h-[17px] w-[17px]" strokeWidth={2.2} />
            </span>
            <span className="relative z-[1] min-w-0 flex-1">
              <span className="dd-btn-label block text-[15.5px] font-bold leading-tight tracking-wide">
                เปิดตำราฝัน
              </span>
              <span className="mt-0.5 block text-[15px] font-medium leading-tight opacity-70">
                ตีความฝัน · ได้เลขเด็ด
              </span>
            </span>
            <ChevronRight
              className="relative z-[1] mr-1 h-5 w-5 shrink-0 opacity-80"
              strokeWidth={2.4}
            />
            <span
              className="wallpaper-dl-btn__shine pointer-events-none absolute inset-0"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * หน้าดวงพิเศษ — /special
 * โชว์ฟีเจอร์ที่กำลังจะเข้า (รายการเปิดใช้ไปอยู่หน้าทำนายแล้ว)
 */
export function SpecialDraft() {
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    let alive = true;
    async function syncPremium() {
      const profile = readFortuneProfile();
      const access = await requirePremiumFromServer(
        profile
          ? { birthDate: profile.birthDate, nickname: profile.nickname }
          : null,
      );
      if (alive) setPremium(access.ok);
    }
    void syncPremium();
    const onChange = () => {
      void syncPremium();
    };
    window.addEventListener("dooduang-premium-changed", onChange);
    return () => {
      alive = false;
      window.removeEventListener("dooduang-premium-changed", onChange);
    };
  }, []);

  return (
    <div
      className="relative mx-auto min-h-full w-full max-w-[480px] text-white"
      style={{ background: "transparent" }}
    >
      <MaePageBackground blur={14} scrollBlur={false} />

      <div className="relative z-[2] overflow-x-hidden pb-[7.25rem] pt-4">
        <AnimatedPage className="px-4 sm:px-5">
          <header className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 text-left">
              <p
                className="text-[15px] font-semibold tracking-[0.14em]"
                style={{ color: GOLD }}
              >
                เร็วๆ นี้
              </p>
              <h1
                className="mt-1.5 text-[1.85rem] font-bold leading-[1.4] tracking-tight"
                style={{
                  ...TITLE_GOLD,
                  paddingTop: "0.16em",
                  paddingBottom: "0.08em",
                }}
              >
                ดวงพิเศษ
              </h1>
              <p
                className="mt-2 max-w-[18rem] text-[15px] font-medium leading-[1.55]"
                style={{ color: TEXT_MUTED }}
              >
                ฟีเจอร์ใหม่ที่แม่กำลังเตรียม
                <br />
                เรื่องเจาะลึกเปิดได้ที่หน้าทำนาย
              </p>
            </div>
            {premium ? (
              <span
                className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-[0.45em] text-[15px] font-semibold leading-[1.4]"
                style={{
                  color: GOLD_SOFT,
                  background: "rgba(201,163,90,0.16)",
                  boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.35)",
                }}
              >
                <Crown className="h-3.5 w-3.5" strokeWidth={2.2} />
                พรีเมียม
              </span>
            ) : (
              <Link
                href="/premium/pay?return=/special"
                className="mae-gold-cta mt-1 inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-[15px] font-bold tracking-wide outline-none transition active:scale-[0.98]"
              >
                <Crown className="h-3.5 w-3.5" strokeWidth={2.3} />
                <span className="dd-btn-label">สมัครพรีเมียม</span>
              </Link>
            )}
          </header>

          <SectionLabel label="ดูดวงมาใหม่" hint="เปิดใช้ได้แล้ววันนี้" />
          <ul className="space-y-3.5">
            {NEW_ITEMS.map((item) => (
              <li key={item.id}>
                <OpenFeatureCard item={item} />
              </li>
            ))}
          </ul>

          <SectionLabel
            label="กำลังจะเข้า"
            hint="ฟีเจอร์ใหม่ที่แม่กำลังเตรียมให้"
          />
          <ul className="space-y-3.5">
            {COMING_SOON_ITEMS.map((item) => (
              <li key={item.id}>
                <ComingSoonCard item={item} />
              </li>
            ))}
          </ul>

          <p
            className="mx-auto mt-9 max-w-[19rem] text-center text-[15px] font-medium leading-snug"
            style={{ color: "rgba(186,204,230,0.7)" }}
          >
            อยากให้มีดวงเรื่องไหนเพิ่ม
            <br />
            บอกเราได้เลย
          </p>
        </AnimatedPage>

        <FixedAppBottomNav activeId="special" />
      </div>
    </div>
  );
}
