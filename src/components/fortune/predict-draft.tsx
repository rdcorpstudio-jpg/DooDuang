"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, Lock, Sparkles } from "lucide-react";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { FixedAppBottomNav } from "@/components/layout/bottom-nav";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { AnimatedPage } from "@/components/ui/reveal";
import { startMaeNavigation } from "@/components/layout/navigation-loading";
import {
  requirePremiumFromServer,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const TEXT_MUTED = "rgba(240, 244, 250, 0.82)";
const GOLD_BTN =
  "linear-gradient(100deg, #ffe999 0%, #e5b84d 50%, #cda451 100%)";

const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

type ArtInk = "onLight" | "onDark";

type PredictItem = {
  id: string;
  title: string;
  blurb: string;
  href: string;
  art: string;
  ink: ArtInk;
  badge?: string;
  premium?: boolean;
  /** object-position ของอาร์ตการ์ด */
  artFocus?: string;
};

const FREE_ITEMS: PredictItem[] = [
  {
    id: "seamsee",
    title: "เซียมซี",
    blurb: "ตั้งจิต เขย่ากระบอก แล้วเปิดคำทำนายวันละหนึ่งใบ",
    href: "/reading/seamsee",
    art: "/images/home/predict/seamsee.webp",
    ink: "onDark",
    badge: "วันละ 1 ใบ",
    artFocus: "center",
    premium: false,
  },
  {
    id: "tarot",
    title: "ไพ่รายวัน",
    blurb: "เปิดไพ่หนึ่งใบ อ่านจังหวะใจและทิศทางของวันนี้",
    href: "/reading/tarot",
    art: "/images/home/predict/tarot-v7.webp?v=8",
    ink: "onDark",
    badge: "ยอดนิยม",
    premium: false,
  },
  {
    id: "shirt",
    title: "สีเสื้อมงคล",
    blurb: "สีที่หนุนวันนี้ และสีที่แม่อยากให้เลี่ยงไว้ก่อน",
    href: "/reading/shirt",
    art: "/images/home/predict/shirt-v7.webp?v=8",
    ink: "onDark",
    premium: false,
  },
];

const PREMIUM_ITEMS: PredictItem[] = [
  {
    id: "wallpaper",
    title: "วอลเปเปอร์นำโชค",
    blurb: "ภาพพื้นหลังประจำวัน เสริมพลังเงียบ ๆ ทุกครั้งที่เปิดมือถือ",
    href: "/reading/wallpaper",
    art: "/images/home/predict/wallpaper-v7.webp?v=8",
    ink: "onDark",
    premium: true,
  },
  {
    id: "bazi",
    title: "ปาจื้อ",
    blurb: "อ่านฐานดวงจากวันเกิดแบบจีน เห็นจุดแข็งและจังหวะชีวิต",
    href: "/reading/bazi",
    art: "/images/home/predict/bazi-v7.webp?v=8",
    ink: "onLight",
    premium: true,
  },
  {
    id: "face",
    title: "โหงวเฮ้ง",
    blurb: "สแกนใบหน้า อ่านนิสัย จุดเด่น และเรื่องที่ควรระวัง",
    href: "/reading/face",
    art: "/images/home/predict/face-v7.webp?v=8",
    ink: "onLight",
    premium: true,
  },
  {
    id: "palm",
    title: "ลายมือ",
    blurb: "อ่านเส้นมือ นิสัย และจังหวะที่ชีวิตกำลังพาไป",
    href: "/reading/palm",
    art: "/images/home/predict/palm-v7.webp?v=8",
    ink: "onLight",
    premium: true,
  },
  {
    id: "love",
    title: "ดวงรักคู่",
    blurb: "ดูจังหวะสัมพันธ์ ความเข้าใจกัน และจุดที่ควรคุยกัน",
    href: "/premium/couple",
    art: "/images/home/predict/couple-v7.webp?v=8",
    ink: "onLight",
    premium: true,
  },
  {
    id: "self-map",
    title: "แผนที่ตัวตน",
    blurb: "แผนที่ชีวิต จุดแข็ง และทิศทางที่เหมาะกับคุณ",
    href: "/premium/self-map",
    art: "/images/home/predict/self-map-v7.webp?v=8",
    ink: "onDark",
    premium: true,
  },
  {
    id: "year",
    title: "ดวงปี",
    blurb: "ภาพรวมทั้งปีตามศาสตร์แม่ อ่านยาวได้ทีละเรื่อง",
    href: "/premium/year",
    art: "/images/home/predict/year-v7.webp?v=8",
    ink: "onDark",
    premium: true,
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
    <div className="mb-2.5 mt-6">
      <div className="flex items-center gap-2.5">
        <Sparkles
          className="h-4 w-4 shrink-0"
          style={{ color: GOLD }}
          strokeWidth={2.2}
        />
        <h2 className="text-[1.05rem] font-bold tracking-wide text-white">
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
          className="mt-1 pl-[1.75rem] text-[14px] font-medium leading-snug"
          style={{ color: "rgba(210,222,240,0.78)" }}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function PredictCard({
  item,
  locked,
  onOpen,
  priority,
}: {
  item: PredictItem;
  locked: boolean;
  onOpen: () => void;
  priority?: boolean;
}) {
  const light = item.ink === "onLight";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block w-full overflow-hidden rounded-[16px] text-left outline-none transition duration-200 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/4"
      style={{
        aspectRatio: "3.15 / 1",
        minHeight: "5.35rem",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.14), 0 8px 18px rgba(0,0,0,0.24)",
      }}
      aria-label={locked ? `${item.title} · ต้องเป็นพรีเมียม` : item.title}
    >
      <Image
        src={item.art}
        alt=""
        fill
        unoptimized
        priority={priority}
        className="object-cover transition duration-500 group-hover:scale-[1.03]"
        style={{ objectPosition: item.artFocus ?? "center" }}
        sizes="(max-width: 480px) 100vw, 960px"
      />

      {/* Keep art clear on the right; soft plate only under copy */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: light
            ? "linear-gradient(105deg, rgba(250,246,238,0.94) 0%, rgba(250,246,238,0.72) 42%, rgba(250,246,238,0.18) 66%, transparent 82%)"
            : "linear-gradient(105deg, rgba(8,14,28,0.94) 0%, rgba(8,14,28,0.72) 42%, rgba(8,14,28,0.18) 66%, transparent 82%)",
        }}
      />

      {locked ? (
        <span
          className="absolute right-2.5 top-2.5 z-[2] inline-flex items-center gap-1 rounded-full px-2 py-[0.28em] text-[11.5px] font-semibold leading-[1.4]"
          style={{
            color: light ? "#1f1a14" : GOLD_SOFT,
            background: light
              ? "rgba(255,255,255,0.86)"
              : "rgba(8,12,24,0.76)",
            boxShadow: light
              ? "inset 0 0 0 1px rgba(31,26,20,0.1)"
              : "inset 0 0 0 1px rgba(255,255,255,0.14)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <Lock className="h-3 w-3" strokeWidth={2.4} />
          พรีเมียม
        </span>
      ) : item.badge ? (
        <span
          className="absolute right-2.5 top-2.5 z-[2] inline-flex items-center rounded-full px-2 text-[11.5px] font-bold leading-[1.4] tracking-wide"
          style={{
            color: "#1a1408",
            background: GOLD_BTN,
            paddingTop: "0.28em",
            paddingBottom: "0.22em",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {item.badge}
        </span>
      ) : (
        <span
          className="absolute right-2.5 top-2.5 z-[2] inline-flex items-center rounded-full px-2 text-[11.5px] font-semibold leading-[1.4]"
          style={{
            color: light ? "#1f1a14" : "rgba(245,247,255,0.92)",
            background: light
              ? "rgba(255,255,255,0.82)"
              : "rgba(8,12,24,0.72)",
            boxShadow: light
              ? "inset 0 0 0 1px rgba(31,26,20,0.1)"
              : "inset 0 0 0 1px rgba(255,255,255,0.14)",
            paddingTop: "0.28em",
            paddingBottom: "0.22em",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          เปิดได้เลย
        </span>
      )}

      <div className="relative z-[1] flex h-full flex-col justify-center gap-0.5 px-3.5 py-2.5 pr-[4.25rem]">
        <p
          className="max-w-[15rem] text-[1.12rem] font-bold leading-[1.25]"
          style={
            light
              ? {
                  color: "#1a1408",
                  textShadow: "0 1px 0 rgba(255,255,255,0.4)",
                  paddingTop: "0.06em",
                  paddingBottom: "0.03em",
                }
              : {
                  ...TITLE_GOLD,
                  paddingTop: "0.06em",
                  paddingBottom: "0.03em",
                }
          }
        >
          {item.title}
        </p>
        <p
          className="max-w-[15rem] text-[13.5px] font-medium leading-[1.4] line-clamp-2"
          style={{
            color: light ? "rgba(32,28,22,0.88)" : "rgba(245,247,255,0.9)",
          }}
        >
          {item.blurb}
        </p>
        <div className="mt-0.5">
          <span
            className="inline-flex items-center gap-0.5 text-[12.5px] font-semibold leading-[1.35] tracking-wide"
            style={{ color: light ? "#6b4f1f" : GOLD_SOFT }}
          >
            {locked ? "ปลดล็อกเพื่ออ่าน" : "แตะเพื่อเปิด"}
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.6} />
          </span>
        </div>
      </div>
    </button>
  );
}

/**
 * หน้าทำนาย — /predict
 * จัดกลุ่มฟรี / พรีเมียม · การ์ดอาร์ตชัด · คำชวนอ่าน
 */
export function PredictDraft() {
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

  function openItem(item: PredictItem) {
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
          <header className="text-left">
            <p
              className="text-[14px] font-semibold tracking-[0.14em]"
              style={{ color: GOLD }}
            >
              แม่พาอ่านทีละเรื่อง
            </p>
            <h1
              className="mt-2 text-[2.05rem] font-bold leading-[1.4] tracking-tight"
              style={{
                ...TITLE_GOLD,
                paddingTop: "0.16em",
                paddingBottom: "0.08em",
              }}
            >
              ทำนาย
            </h1>
            <p
              className="mt-2.5 max-w-[19rem] text-[16px] font-medium leading-[1.55]"
              style={{ color: TEXT_MUTED }}
            >
              เลือกศาสตร์ที่อยู่ในใจ
              <br />
              เห็นทั้งทางไปต่อ และจุดที่ควรชะลอ
            </p>
          </header>

          <SectionLabel
            label="เปิดได้เลยวันนี้"
            hint="เปิดดูได้ทันที ไม่ต้องรอ"
          />
          <ul className="space-y-2.5">
            {FREE_ITEMS.map((item, i) => (
              <li key={item.id}>
                <PredictCard
                  item={item}
                  locked={false}
                  priority={i === 0}
                  onOpen={() => openItem(item)}
                />
              </li>
            ))}
          </ul>

          <SectionLabel
            label="อ่านลึกแบบพรีเมียม"
            hint="จ่ายครั้งเดียว เปิดได้ทั้งปี"
          />
          <ul className="space-y-2.5">
            {PREMIUM_ITEMS.map((item) => (
              <li key={item.id}>
                <PredictCard
                  item={item}
                  locked={Boolean(item.premium) && !premium}
                  onOpen={() => openItem(item)}
                />
              </li>
            ))}
          </ul>

          <p
            className="mx-auto mt-9 max-w-[19rem] text-center text-[14.5px] font-medium leading-snug"
            style={{ color: "rgba(186,204,230,0.62)" }}
          >
            ดวงเป็นมุมมองประกอบชีวิต
            <br />
            เรื่องสำคัญให้ดูข้อมูลรอบตัวให้ครบด้วยนะ
          </p>
        </AnimatedPage>

        <FixedAppBottomNav activeId="predict" />
      </div>

      <FortunePaymentSheet
        open={payOpen}
        onClose={() => {
          setPayOpen(false);
          setPendingHref(null);
        }}
        onPaid={applyUnlock}
        returnPath={pendingHref ?? "/predict"}
      />
    </div>
  );
}
