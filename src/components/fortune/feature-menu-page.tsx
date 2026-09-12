"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import { PageBackButton } from "@/components/ui/page-back-button";
import {
  requirePremiumFromServer,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import {
  hasFreeReadingBasics,
  hydrateFortuneProfileFromWizard,
  readFortuneProfile,
  WIZARD_CACHE_KEY,
} from "@/lib/fortune/profile-storage";
import { cn } from "@/lib/utils";

type MenuApp = {
  id: string;
  title: string;
  blurb: string;
  href: string;
  iconSrc?: string;
  badge: "ฟรี" | "พรีเมียม";
};

type MenuGroup = {
  id: string;
  title: string;
  apps: MenuApp[];
};

const MENU_GROUPS: MenuGroup[] = [
  {
    id: "today",
    title: "วันนี้",
    apps: [
      {
        id: "daily",
        title: "ดวงรายวัน",
        blurb: "จังหวะวัน",
        href: "/premium",
        iconSrc: "/images/icons/calendar-gold.webp?v=1",
        badge: "ฟรี",
      },
      {
        id: "tarot",
        title: "ไพ่รายวัน",
        blurb: "เปิดไพ่",
        href: "/reading/tarot",
        iconSrc: "/images/extra/tarot.webp?v=mae6",
        badge: "ฟรี",
      },
      {
        id: "shirt",
        title: "สีเสื้อมงคล",
        blurb: "สีประจำวัน",
        href: "/reading/shirt",
        iconSrc: "/images/icons/shirt-gold.webp?v=2",
        badge: "ฟรี",
      },
      {
        id: "reading",
        title: "ดูดวงเบื้องต้น",
        blurb: "รู้จักตัวเอง",
        href: "/premium#self-intro",
        iconSrc: "/images/icons/crystal-ball.webp",
        badge: "ฟรี",
      },
      {
        id: "work",
        title: "การงาน",
        blurb: "ดวงงานวันนี้",
        href: "/reading/aspect?id=career&from=menu",
        iconSrc: "/images/icons/career-gold.webp?v=3",
        badge: "ฟรี",
      },
      {
        id: "money",
        title: "การเงิน",
        blurb: "จังหวะเงิน",
        href: "/reading/aspect?id=money&from=menu",
        iconSrc: "/images/icons/finance-gold.webp?v=3",
        badge: "ฟรี",
      },
      {
        id: "love",
        title: "ความรัก",
        blurb: "หัวใจวันนี้",
        href: "/reading/aspect?id=love&from=menu",
        iconSrc: "/images/icons/love-gold.webp?v=3",
        badge: "ฟรี",
      },
      {
        id: "health",
        title: "สุขภาพ",
        blurb: "พลังกายใจ",
        href: "/reading/aspect?id=health&from=menu",
        iconSrc: "/images/icons/health-gold.webp?v=3",
        badge: "ฟรี",
      },
    ],
  },
  {
    id: "deep",
    title: "เจาะลึก",
    apps: [
      {
        id: "bazi",
        title: "ปาจื้อ",
        blurb: "สี่เสา",
        href: "/reading/bazi",
        iconSrc: "/images/extra/bazi.webp?v=mae6",
        badge: "พรีเมียม",
      },
      {
        id: "face",
        title: "โหงวเฮ้ง",
        blurb: "สแกนหน้า",
        href: "/reading/face",
        iconSrc: "/images/extra/face.webp?v=mae6",
        badge: "พรีเมียม",
      },
      {
        id: "palm",
        title: "ลายมือ",
        blurb: "สแกนมือ",
        href: "/reading/palm",
        iconSrc: "/images/extra/palm.webp?v=mae6",
        badge: "พรีเมียม",
      },
      {
        id: "couple",
        title: "ดวงคู่",
        blurb: "ความสัมพันธ์",
        href: "/premium/couple",
        iconSrc: "/images/extra/couple.webp?v=mae6",
        badge: "พรีเมียม",
      },
      {
        id: "self-map",
        title: "แผนที่ตัวตน",
        blurb: "ภาพรวมลึก",
        href: "/premium/self-map",
        iconSrc: "/images/icons/compass-gold.webp?v=1",
        badge: "พรีเมียม",
      },
      {
        id: "year",
        title: "ดวงรายปี",
        blurb: "ทั้งปี",
        href: "/premium/year",
        iconSrc: "/images/icons/year-gold.webp?v=1",
        badge: "พรีเมียม",
      },
      {
        id: "report",
        title: "รายงานดวง",
        blurb: "สรุปดวง",
        href: "/premium/report",
        iconSrc: "/images/icons/article-gold.webp?v=1",
        badge: "พรีเมียม",
      },
      {
        id: "wallpaper",
        title: "วอลเปเปอร์",
        blurb: "พื้นหลังมงคล",
        href: "/reading/wallpaper",
        iconSrc: "/images/extra/wallpaper.webp?v=mae6",
        badge: "พรีเมียม",
      },
    ],
  },
];

const ONBOARD_HREF = "/reading";

function readWizardBasics(): boolean {
  try {
    const raw = sessionStorage.getItem(WIZARD_CACHE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as {
      profile?: { nickname?: string; birthDate?: string; gender?: string };
    };
    const p = parsed?.profile;
    return Boolean(
      p?.nickname?.trim() &&
        /^\d{4}-\d{2}-\d{2}$/.test(p.birthDate || "") &&
        p.gender
    );
  } catch {
    return false;
  }
}

function IconSlot({
  title,
  iconSrc,
  locked,
}: {
  title: string;
  iconSrc?: string;
  locked?: boolean;
}) {
  return (
    <span
      className="relative flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-[16px]"
      style={{
        background:
          "linear-gradient(160deg, rgba(213,177,111,0.14), rgba(16,24,39,0.9))",
        boxShadow:
          "inset 0 0 0 1.5px rgba(213,177,111,0.4), 0 8px 18px rgba(0,0,0,0.22)",
      }}
      aria-hidden
    >
      {iconSrc ? (
        <Image
          src={iconSrc}
          alt=""
          width={44}
          height={44}
          unoptimized
          className={cn(
            "relative z-[1] h-[42px] w-[42px] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]",
            locked && "opacity-55"
          )}
        />
      ) : (
        <>
          <span
            className="absolute inset-[6px] rounded-[12px]"
            style={{ border: "1px dashed rgba(213,177,111,0.35)" }}
          />
          <span className="relative text-[11px] font-semibold tracking-wide text-[#d5b16f]/55">
            {title.slice(0, 1)}
          </span>
        </>
      )}
      {locked ? (
        <span className="absolute bottom-0.5 right-0.5 z-[2] flex h-4 w-4 items-center justify-center rounded-full bg-[#101827] text-[#d5b16f] shadow-[0_0_0_1px_rgba(213,177,111,0.45)]">
          <Lock className="h-2.5 w-2.5" strokeWidth={2.4} />
        </span>
      ) : null}
    </span>
  );
}

function AppTile({
  app,
  locked,
  onOpen,
}: {
  app: MenuApp;
  locked: boolean;
  onOpen: (app: MenuApp) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(app)}
      className={cn(
        "group relative flex w-full flex-col items-center rounded-[18px] px-2 py-3 text-center outline-none transition",
        "active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
      )}
      style={{
        background: "rgba(16,24,39,0.55)",
        boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.18)",
      }}
      aria-label={locked ? `${app.title} · ต้องเป็นพรีเมียม` : app.title}
    >
      <IconSlot title={app.title} iconSrc={app.iconSrc} locked={locked} />
      <span className="mt-2 line-clamp-1 w-full text-[12.5px] font-semibold leading-tight text-[#f7f4ec]">
        {app.title}
      </span>
      <span className="mt-0.5 line-clamp-1 w-full text-[10.5px] leading-tight text-[#9aa3b2]">
        {app.blurb}
      </span>
      <span
        className="mt-1.5 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-[#e8d19a]"
        style={{
          background: "rgba(213,177,111,0.12)",
          boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
        }}
      >
        {app.badge}
      </span>
    </button>
  );
}

/**
 * Feature menu — always visible. Free apps need profile; premium apps paywall.
 */
export function FeatureMenuPage({
  className,
  backHref,
}: {
  className?: string;
  backHref?: string;
}) {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-10 text-center text-[14px] text-[#f7f4ec]/55">
          กำลังเปิดเมนู…
        </div>
      }
    >
      <FeatureMenuPageInner className={className} backHref={backHref} />
    </Suspense>
  );
}

function FeatureMenuPageInner({
  className,
  backHref,
}: {
  className?: string;
  backHref?: string;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasBasics, setHasBasics] = useState(false);
  const [premium, setPremium] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  function syncLocalBasics() {
    hydrateFortuneProfileFromWizard();
    const profile = readFortuneProfile();
    setHasBasics(hasFreeReadingBasics(profile) || readWizardBasics());
  }

  async function syncPremium() {
    syncLocalBasics();
    const profile = readFortuneProfile();
    const access = await requirePremiumFromServer(
      profile
        ? { birthDate: profile.birthDate, nickname: profile.nickname }
        : null
    );
    setPremium(access.ok);
    setReady(true);
  }

  useEffect(() => {
    void syncPremium();
    const onChange = () => {
      void syncPremium();
    };
    window.addEventListener("dooduang-premium-changed", onChange);
    window.addEventListener("focus", onChange);
    return () => {
      window.removeEventListener("dooduang-premium-changed", onChange);
      window.removeEventListener("focus", onChange);
    };
  }, []);

  useStripePaymentReturn(() => {
    const profile = readFortuneProfile();
    setPremiumUnlocked(
      profile
        ? { birthDate: profile.birthDate, nickname: profile.nickname }
        : null
    );
    setPremium(true);
    setPayOpen(false);
    const next = pendingHref;
    setPendingHref(null);
    if (next) router.push(next);
    else void syncPremium();
  });

  function applyUnlock() {
    const profile = readFortuneProfile();
    setPremiumUnlocked(
      profile
        ? { birthDate: profile.birthDate, nickname: profile.nickname }
        : null
    );
    setPremium(true);
    setPayOpen(false);
    const next = pendingHref;
    setPendingHref(null);
    if (next) router.push(next);
  }

  function openApp(app: MenuApp) {
    const locked = app.badge === "พรีเมียม" && !premium;
    if (locked) {
      setPendingHref(app.href);
      setPayOpen(true);
      return;
    }

    // ยังไม่กรอกข้อมูล → ไปหน้ากรอก แล้วกลับมาฟีเจอร์นั้น
    if (!hasBasics) {
      router.push(
        `${ONBOARD_HREF}?next=${encodeURIComponent(app.href)}`
      );
      return;
    }

    router.push(app.href);
  }

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[480px] px-4 pb-16 pt-2",
        className
      )}
    >
      <header className="relative flex min-h-12 items-center justify-center py-3">
        {backHref ? <PageBackButton href={backHref} absolute /> : null}
        <div className={cn("min-w-0 text-center", backHref && "px-20")}>
          <h1 className="mae-gold-text text-[1.45rem] font-bold leading-snug tracking-wide">
            เลือกเรื่องที่อยากรู้
          </h1>
          <p className="mt-1.5 text-[14px] font-medium leading-snug text-[#f7f4ec]/90">
            ค้นหาคำแนะนำในแบบของคุณ
          </p>
        </div>
      </header>

      {!ready ? null : !hasBasics ? (
        <button
          type="button"
          onClick={() => router.push(ONBOARD_HREF)}
          className="mae-aspect-card relative z-[1] mt-4 w-full rounded-[16px] px-3.5 py-3 text-left outline-none transition active:scale-[0.99]"
        >
          <p className="text-[13px] font-semibold text-[#d5b16f]">
            กรอกข้อมูลก่อนเริ่มดูดวง
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-[#f7f4ec]/65">
            ยังไม่มีวันเกิด/ชื่อเล่น — แตะเพื่อไปกรอก แล้วกลับมาเลือกเมนูได้
          </p>
        </button>
      ) : null}

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 h-40 w-40 -translate-x-1/2 rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(213,177,111,0.28), transparent 70%)",
        }}
      />

      <div className="relative mt-5 space-y-6">
        {MENU_GROUPS.map((group) => (
          <section key={group.id}>
            <div className="mb-2.5 flex items-center gap-2 px-0.5">
              <h2 className="text-[13px] font-semibold tracking-wide text-[#d5b16f]">
                {group.title}
              </h2>
              <span
                className="h-px flex-1 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(213,177,111,0.45), transparent)",
                }}
                aria-hidden
              />
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {group.apps.map((app) => {
                const displayApp =
                  app.id === "reading" && premium
                    ? {
                        ...app,
                        title: "ดูดวงเชิงลึก",
                        blurb: "รู้จักตัวเอง",
                        badge: "พรีเมียม" as const,
                      }
                    : app;
                return (
                  <AppTile
                    key={app.id}
                    app={displayApp}
                    locked={displayApp.badge === "พรีเมียม" && !premium}
                    onOpen={openApp}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <Suspense fallback={null}>
        <FortunePaymentSheet
          open={payOpen}
          onClose={() => {
            setPayOpen(false);
            setPendingHref(null);
          }}
          onPaid={applyUnlock}
          returnPath="/menu"
        />
      </Suspense>
    </div>
  );
}
