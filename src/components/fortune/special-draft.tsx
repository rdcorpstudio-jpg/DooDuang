"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ban,
  ChevronRight,
  Crown,
  Lock,
  MessageCircle,
  Moon,
  Smartphone,
  Sparkles,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { FixedAppBottomNav } from "@/components/layout/bottom-nav";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { AnimatedPage } from "@/components/ui/reveal";
import {
  requirePremiumFromServer,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";
import { startMaeNavigation } from "@/components/layout/navigation-loading";

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const TEXT_MUTED = "rgba(230, 236, 248, 0.88)";

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
  cta?: string;
  /** Pill on card; omit to hide */
  badge?: string;
  /** object-position when art has baked-in copy on the left */
  artFocus?: string;
  /** AI features — require paid premium */
  premium?: boolean;
};

const NEW_ITEMS: ComingSoonItem[] = [
  {
    id: "lucky-numbers",
    title: "เลขมงคล",
    blurb: "เลข 3 ตัวประจำวัน พร้อมความหมายและคู่เลขนำโชค",
    art: "/images/special/coming-soon/01-lucky-numbers.webp?v=2",
    Icon: Sparkles,
    href: "/special/lucky-numbers",
    cta: "เปิดตำราเลข",
    badge: "อัปเดตรายวัน",
  },
  {
    id: "consult-mae",
    title: "ปรึกษาแม่",
    blurb: "คุยกับแม่เรื่องที่อยู่ในใจ",
    art: "/images/special/coming-soon/02-consult-mae-card.webp?v=4",
    Icon: MessageCircle,
    href: "/special/consult",
    cta: "เปิดห้องคุย",
    badge: "3 คำถามต่อวัน",
    artFocus: "72% center",
    premium: true,
  },
  {
    id: "dream",
    title: "ทำนายฝัน",
    blurb: "พิมพ์ความฝัน แม่ตีความให้วันละครั้ง",
    art: "/images/special/coming-soon/03-dream-reading.webp?v=2",
    Icon: Moon,
    href: "/special/dream",
    cta: "เปิดตำราฝัน",
    badge: "วันละ 1 ครั้ง",
    premium: true,
  },
  {
    id: "phone",
    title: "วิเคราะห์เบอร์",
    blurb: "ใส่เบอร์มือถือ แม่วิเคราะห์พลังเลขให้",
    art: "/images/special/coming-soon/05-phone-reading.webp",
    Icon: Smartphone,
    href: "/special/phone",
    cta: "เปิดตำราเบอร์",
    premium: true,
  },
];

const COMING_SOON_ITEMS: ComingSoonItem[] = [
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
      className="relative w-full overflow-hidden rounded-[16px]"
      style={{
        aspectRatio: "2.75 / 1",
        background:
          "linear-gradient(118deg, #152038 0%, #0c1528 48%, #08101e 100%)",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.1), 0 8px 20px rgba(0,0,0,0.24)",
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

function OpenFeatureCard({
  item,
  locked,
  onOpen,
}: {
  item: ComingSoonItem;
  locked: boolean;
  onOpen: () => void;
}) {
  if (!item.href) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block w-full overflow-hidden rounded-[16px] text-left outline-none transition duration-200 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
      style={{
        aspectRatio: "2.75 / 1",
        background: "#0a1222",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.14), 0 8px 20px rgba(0,0,0,0.24)",
      }}
      aria-label={locked ? `${item.title} · ต้องเป็นพรีเมียม` : item.title}
    >
      <Image
        src={item.art}
        alt=""
        fill
        unoptimized
        className="object-cover transition duration-500 group-hover:scale-[1.03]"
        style={{ objectPosition: item.artFocus ?? "88% center" }}
        sizes="(max-width: 480px) 100vw, 960px"
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(105deg, rgba(8,14,28,0.88) 0%, rgba(8,14,28,0.55) 42%, rgba(8,14,28,0.12) 68%, transparent 82%)",
        }}
      />

      {locked ? (
        <span
          className="absolute right-2.5 top-2.5 z-[2] inline-flex items-center gap-1 rounded-full px-2 py-[0.28em] text-[12px] font-semibold leading-[1.35]"
          style={{
            color: GOLD_SOFT,
            background: "rgba(8,12,24,0.76)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <Lock className="h-3 w-3" strokeWidth={2.4} />
          พรีเมียม
        </span>
      ) : item.badge ? (
        <span
          className="absolute right-2.5 top-2.5 z-[2] inline-flex items-center rounded-full px-2 text-[12px] font-semibold leading-[1.35]"
          style={{
            color: GOLD,
            background: "rgba(8,12,24,0.72)",
            boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.45)",
            paddingTop: "0.22em",
            paddingBottom: "0.18em",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          {item.badge}
        </span>
      ) : null}

      <div className="relative z-[1] flex h-full flex-col justify-center gap-1 px-3.5 py-3 pr-3.5">
        <p
          className="max-w-[15.5rem] text-[1.35rem] font-bold leading-[1.25]"
          style={{
            ...TITLE_GOLD,
            paddingTop: "0.06em",
            paddingBottom: "0.03em",
          }}
        >
          {item.title}
        </p>
        <p
          className="max-w-[15.5rem] text-[15px] font-medium leading-[1.4] line-clamp-2"
          style={{ color: "rgba(245,247,255,0.92)" }}
        >
          {item.blurb}
        </p>
        <div className="mt-0.5">
          <span
            className="inline-flex w-fit items-center gap-0.5 text-[15px] font-semibold leading-none"
            style={{ color: GOLD_SOFT }}
          >
            {locked ? "ปลดล็อกเพื่อใช้" : (item.cta ?? "แตะเพื่อเปิด")}
            <ChevronRight className="h-4 w-4" strokeWidth={2.6} />
          </span>
        </div>
      </div>
    </button>
  );
}

/**
 * หน้าดวงพิเศษ — /special
 * โชว์ฟีเจอร์ที่กำลังจะเข้า (รายการเปิดใช้ไปอยู่หน้าทำนายแล้ว)
 */
export function SpecialDraft() {
  const router = useRouter();
  const [premium, setPremium] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

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

  function openItem(item: ComingSoonItem) {
    if (!item.href) return;
    if (item.premium && !premium) {
      setPendingHref(item.href);
      setPayOpen(true);
      return;
    }
    startMaeNavigation();
    router.push(item.href);
  }

  function applyUnlock() {
    const profile = readFortuneProfile();
    setPremiumUnlocked(
      profile
        ? { birthDate: profile.birthDate, nickname: profile.nickname }
        : null,
    );
    setPremium(true);
    setPayOpen(false);
    const next = pendingHref;
    setPendingHref(null);
    if (next) {
      startMaeNavigation();
      router.push(next);
    }
  }

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
              <h1
                className="text-[1.85rem] font-bold leading-[1.4] tracking-tight"
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
                className="mt-1 inline-flex shrink-0 items-center rounded-full px-3 py-[0.35em] text-[15px] font-semibold leading-none"
                style={{
                  color: GOLD_SOFT,
                  background: "rgba(201,163,90,0.16)",
                  boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.35)",
                }}
              >
                พรีเมียม
              </span>
            ) : (
              <Link
                href="/premium/pay?return=/special"
                className="mae-gold-cta mt-1 inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-3.5 outline-none transition active:scale-[0.98]"
              >
                <Crown
                  className="h-3.5 w-3.5 shrink-0 text-[#1a1408]"
                  strokeWidth={2.25}
                  aria-hidden
                />
                <span className="dd-btn-label text-[13px] font-bold tracking-[0.04em]">
                  Premium
                </span>
              </Link>
            )}
          </header>

          <SectionLabel label="ดูดวงมาใหม่" hint="เปิดใช้ได้แล้ววันนี้" />
          <ul className="space-y-3.5">
            {NEW_ITEMS.map((item) => (
              <li key={item.id}>
                <OpenFeatureCard
                  item={item}
                  locked={Boolean(item.premium) && !premium}
                  onOpen={() => openItem(item)}
                />
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
        </AnimatedPage>

        <FixedAppBottomNav activeId="special" />
      </div>

      <FortunePaymentSheet
        open={payOpen}
        onClose={() => {
          setPayOpen(false);
          setPendingHref(null);
        }}
        onPaid={applyUnlock}
        returnPath={pendingHref ?? "/special"}
      />
    </div>
  );
}
