"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Ban, MessageCircle, Moon, Sparkles, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FixedAppBottomNav } from "@/components/layout/bottom-nav";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { AnimatedPage } from "@/components/ui/reveal";
import { requirePremiumFromServer } from "@/lib/fortune/premium-unlock";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const TEXT_MUTED = "rgba(240, 244, 250, 0.82)";

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
};

const COMING_SOON_ITEMS: ComingSoonItem[] = [
  {
    id: "lucky-numbers",
    title: "เลขมงคล",
    blurb: "กำลังเตรียมเปิดใช้งาน",
    art: "/images/special/coming-soon/01-lucky-numbers.webp",
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
    id: "dream",
    title: "ทำนายฝัน",
    blurb: "สมุดตีความฝัน กำลังพัฒนา",
    art: "/images/special/coming-soon/03-dream-reading.webp",
    Icon: Moon,
  },
  {
    id: "civil-exam",
    title: "ดวงสอบราชการ",
    blurb: "กำลังเตรียมเปิดใช้งาน",
    art: "/images/special/coming-soon/04-civil-service-exam.webp",
    Icon: Star,
  },
];

function ComingSoonCard({ item }: { item: ComingSoonItem }) {
  const Icon = item.Icon;

  return (
    <div
      className="relative w-full overflow-hidden rounded-[18px]"
      style={{
        aspectRatio: "2.35 / 1",
        background: "linear-gradient(118deg, #152038 0%, #0c1528 48%, #08101e 100%)",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.12), 0 8px 20px rgba(0,0,0,0.24)",
      }}
      aria-label={`${item.title} · เร็วๆ นี้`}
    >
      <Image
        src={item.art}
        alt=""
        fill
        unoptimized
        className="object-cover object-[78%_50%]"
        sizes="(max-width: 480px) 100vw, 960px"
      />

      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(105deg, rgba(8,14,28,0.94) 0%, rgba(8,14,28,0.72) 36%, rgba(8,14,28,0.28) 58%, transparent 76%)",
        }}
      />

      <div className="relative z-[1] flex h-full flex-col justify-between px-3.5 py-3">
        <div className="max-w-[58%]">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              color: GOLD,
              boxShadow: "inset 0 0 0 1.5px rgba(232,209,154,0.55)",
              background: "rgba(8,12,24,0.35)",
            }}
            aria-hidden
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.1} />
          </span>
          <p className="mt-2 text-[1.12rem] font-bold leading-[1.35] text-white">
            {item.title}
          </p>
          <p
            className="mt-0.5 text-[12.5px] font-medium leading-[1.45]"
            style={{ color: "rgba(186,204,230,0.78)" }}
          >
            {item.blurb}
          </p>
        </div>

        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-[0.32em] text-[11.5px] font-semibold leading-[1.45]"
          style={{
            color: "rgba(240,244,250,0.88)",
            background: "rgba(6,10,20,0.72)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
          }}
        >
          <Ban className="h-3 w-3 shrink-0 opacity-80" strokeWidth={2.3} />
          เร็วๆ นี้
        </span>
      </div>
    </div>
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
      <MaePageBackground />

      <div className="relative z-[2] overflow-x-hidden pb-[7.25rem] pt-4">
        <AnimatedPage className="px-4 sm:px-5">
          <header className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 text-left">
              <p
                className="text-[13px] font-semibold tracking-[0.16em]"
                style={{ color: GOLD }}
              >
                เร็วๆ นี้
              </p>
              <h1
                className="mt-1.5 text-[1.85rem] font-bold leading-[1.45] tracking-tight"
                style={{
                  ...TITLE_GOLD,
                  paddingTop: "0.18em",
                  paddingBottom: "0.08em",
                }}
              >
                ดวงพิเศษ
              </h1>
              <p
                className="mt-2 max-w-[17.5rem] text-[14.5px] font-medium leading-[1.55]"
                style={{ color: TEXT_MUTED }}
              >
                ฟีเจอร์ใหม่ที่แม่กำลังเตรียม
                <br />
                เรื่องเจาะลึกเปิดได้ที่หน้าทำนาย
              </p>
            </div>
            {premium ? (
              <span
                className="mt-0.5 inline-flex shrink-0 items-center rounded-full px-3 py-[0.25em] text-[13px] font-semibold leading-[1.45]"
                style={{
                  color: GOLD_SOFT,
                  background: "rgba(201,163,90,0.14)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                พรีเมียม
              </span>
            ) : (
              <Link
                href="/premium/pay?return=/special"
                className="mae-gold-cta mt-0.5 inline-flex h-9 shrink-0 items-center justify-center rounded-full px-3.5 text-[13px] font-bold tracking-wide outline-none transition active:scale-[0.98]"
              >
                <span className="dd-btn-label">สมัครพรีเมียม</span>
              </Link>
            )}
          </header>

          <div className="mb-3 mt-7">
            <div className="flex items-center gap-2.5">
              <Sparkles
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: GOLD }}
                strokeWidth={2.2}
              />
              <h2 className="text-[17px] font-bold tracking-wide text-white">
                กำลังจะเข้า
              </h2>
              <span
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(232,209,154,0.45), transparent)",
                }}
              />
            </div>
            <p
              className="mt-1.5 pl-[1.6rem] text-[13.5px] font-medium leading-snug"
              style={{ color: "rgba(186,204,230,0.72)" }}
            >
              ฟีเจอร์ใหม่ที่แม่กำลังเตรียมให้
            </p>
          </div>

          <ul className="space-y-2.5">
            {COMING_SOON_ITEMS.map((item) => (
              <li key={item.id}>
                <ComingSoonCard item={item} />
              </li>
            ))}
          </ul>

          <p
            className="mx-auto mt-8 max-w-[18rem] text-center text-[13px] font-medium leading-snug"
            style={{ color: "rgba(186,204,230,0.55)" }}
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
