"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import {
  requirePremiumFromServer,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";
import { APP_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

type PromoSlide = {
  id: string;
  title: string;
  titleLine2: string;
  sub: string;
  ctaOpen: string;
  ctaLocked: string;
  href: string;
  art: string;
  artAlt: string;
  /** needs premium to open */
  premium: boolean;
  artMode: "cover" | "contain";
};

const SLIDES: PromoSlide[] = [
  {
    id: "bazi",
    title: "ปาจื้อ",
    titleLine2: "เข้าใจเส้นทางชีวิต",
    sub: "ค้นหาตัวตน ผ่านวันและเวลาเกิด",
    ctaOpen: "ดูปาจื้อ",
    ctaLocked: "ปาจื้อ · ล็อก",
    href: "/reading/bazi",
    art: "/images/promo/bazi-pillars-art.webp",
    artAlt: "ปาจื้อ สี่เสา",
    premium: true,
    artMode: "cover",
  },
  {
    id: "palm",
    title: "ลายมือ",
    titleLine2: "เส้นมือบอกจังหวะชีวิต",
    sub: "สแกนฝ่ามือ อ่านเส้นหลักของคุณ",
    ctaOpen: "ดูลายมือ",
    ctaLocked: "ลายมือ · ล็อก",
    href: "/reading/palm",
    art: "/images/promo/palm-hand-art.webp",
    artAlt: "ลายมือ",
    premium: true,
    artMode: "cover",
  },
  {
    id: "tarot",
    title: "ไพ่ทาโรต์",
    titleLine2: "เปิดไพ่อ่านดวงวันนี้",
    sub: "จับความรู้สึกและจังหวะที่กำลังมา",
    ctaOpen: "ดูไพ่ประจำวัน",
    ctaLocked: "ดูไพ่ประจำวัน",
    href: "/reading/tarot",
    art: "/images/promo/tarot-cards-art.webp",
    artAlt: "ไพ่ทาโรต์",
    premium: false,
    artMode: "cover",
  },
];

/** Full-bleed promo banner — CTA swaps lock ↔ open by premium */
export function FortunePromoSplitBanner({
  unlocked: unlockedProp,
  className,
}: {
  /** Parent premium flag (page / paid unlock) */
  unlocked?: boolean;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const pauseUntilRef = useRef(0);
  const [active, setActive] = useState(0);
  const [premium, setPremium] = useState(Boolean(unlockedProp));
  const [payOpen, setPayOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPremium(Boolean(unlockedProp));
  }, [unlockedProp]);

  useEffect(() => {
    let cancelled = false;
    async function sync() {
      const profile = readFortuneProfile();
      const access = await requirePremiumFromServer(
        profile
          ? { birthDate: profile.birthDate, nickname: profile.nickname }
          : null
      );
      if (!cancelled) setPremium(Boolean(unlockedProp) || access.ok);
    }
    void sync();
    const onChange = () => {
      void sync();
    };
    window.addEventListener("dooduang-premium-changed", onChange);
    return () => {
      cancelled = true;
      window.removeEventListener("dooduang-premium-changed", onChange);
    };
  }, [unlockedProp]);

  function scrollToIndex(i: number, behavior: ScrollBehavior = "smooth") {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.children[i] as HTMLElement | undefined;
    if (!card) return;
    const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    el.scrollTo({ left: Math.max(0, left), behavior });
  }

  function pauseAutoplay(ms = 8000) {
    pauseUntilRef.current = Date.now() + ms;
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const sync = () => {
      const cards = Array.from(el.children) as HTMLElement[];
      if (!cards.length) return;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      cards.forEach((card, i) => {
        const center = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      activeRef.current = best;
      setActive((prev) => (prev === best ? prev : best));
    };

    const onInteract = () => pauseAutoplay();

    sync();
    el.addEventListener("scroll", sync, { passive: true });
    el.addEventListener("pointerdown", onInteract, { passive: true });
    el.addEventListener("touchstart", onInteract, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      el.removeEventListener("pointerdown", onInteract);
      el.removeEventListener("touchstart", onInteract);
      window.removeEventListener("resize", sync);
    };
  }, []);

  /* Auto-advance every 5s — pause while user swipes or pay sheet open */
  useEffect(() => {
    if (payOpen) return;
    if (SLIDES.length < 2) return;

    const tick = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (Date.now() < pauseUntilRef.current) return;
      const next = (activeRef.current + 1) % SLIDES.length;
      scrollToIndex(next, "smooth");
    };

    const id = window.setInterval(tick, 5000);
    return () => window.clearInterval(id);
  }, [payOpen]);

  function handlePaid() {
    setPremiumUnlocked();
    setPremium(true);
    setPayOpen(false);
    const next = pendingHref;
    setPendingHref(null);
    if (next && typeof window !== "undefined") {
      window.location.assign(next);
    }
  }

  useStripePaymentReturn(handlePaid);

  function onLockedClick(href: string) {
    pauseAutoplay(12000);
    setPendingHref(href);
    setPayOpen(true);
  }

  return (
    <section className={cn("relative mx-3 mt-3", className)}>
      <div
        ref={scrollerRef}
        className="promo-split-scroll no-tap flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-px py-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          touchAction: "pan-x pan-y",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {SLIDES.map((slide) => {
          const locked = slide.premium && !premium;
          const cta = locked ? slide.ctaLocked : slide.ctaOpen;

          const ctaClass =
            "mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold text-[#1a1420] outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/50";
          const ctaStyle = {
            background:
              "linear-gradient(145deg, #fff4d6 0%, #e8d19a 45%, #d5b16f 100%)",
            boxShadow:
              "0 6px 16px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.45)",
          } as const;

          return (
            <article
              key={slide.id}
              className="relative aspect-[2/1] w-full min-w-full shrink-0 snap-center overflow-hidden rounded-[20px]"
              style={{
                background: "#0a101c",
                boxShadow: "0 14px 36px rgba(0,0,0,0.35)",
              }}
            >
              <Image
                src={slide.art}
                alt={slide.artAlt}
                fill
                unoptimized
                sizes="1024px"
                quality={100}
                className={cn(
                  "select-none",
                  slide.artMode === "cover"
                    ? "object-cover object-center"
                    : "object-contain object-[78%_center] p-4"
                )}
                style={{ imageRendering: "auto" }}
                priority={slide.id === "bazi" || slide.id === "palm"}
              />

              <div
                className="pointer-events-none absolute inset-0 z-[1]"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(6,10,18,0.88) 0%, rgba(6,10,18,0.55) 32%, rgba(6,10,18,0.12) 52%, transparent 68%)",
                }}
                aria-hidden
              />

              <div
                className="pointer-events-none absolute inset-0 z-[25] rounded-[20px]"
                style={{
                  boxShadow:
                    "inset 0 0 0 1.5px rgba(213,177,111,0.88), inset 0 0 0 2.5px rgba(255,248,228,0.12)",
                }}
                aria-hidden
              />

              <div className="absolute inset-0 z-10 flex flex-col justify-center py-3 pl-3.5 pr-[42%] sm:pl-4 sm:pr-[40%]">
                <p className="flex items-center gap-1 text-[9.5px] font-semibold tracking-[0.12em] text-[#e8d19a]/92">
                  <span aria-hidden className="text-[8px] text-[#d5b16f]">
                    ✦
                  </span>
                  <span className="truncate">{APP_NAME}</span>
                  <span aria-hidden className="text-[8px] text-[#d5b16f]">
                    ✦
                  </span>
                </p>

                <h2 className="mt-1 text-[1.2rem] font-bold leading-[1.15] tracking-tight text-white sm:text-[1.35rem]">
                  {slide.title}
                  <br />
                  <span className="text-[0.95rem] font-semibold text-white/95 sm:text-[1.05rem]">
                    {slide.titleLine2}
                  </span>
                </h2>

                <p className="mt-1 text-[11px] leading-snug text-white/75 sm:text-[11.5px]">
                  {slide.sub}
                </p>

                {locked ? (
                  <button
                    type="button"
                    onClick={() => onLockedClick(slide.href)}
                    className={ctaClass}
                    style={ctaStyle}
                  >
                    <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
                    {cta}
                  </button>
                ) : (
                  <Link
                    href={slide.href}
                    className={ctaClass}
                    style={ctaStyle}
                  >
                    {cta}
                    <span aria-hidden className="text-[12px] leading-none">
                      →
                    </span>
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div
        className="mt-2 flex items-center justify-center gap-1.5"
        aria-hidden
      >
        {SLIDES.map((s, i) => (
          <span
            key={s.id}
            className={cn(
              "h-[5px] rounded-full transition-all duration-200",
              i === active ? "w-4 bg-[#e8d19a]" : "w-[5px] bg-white/25"
            )}
          />
        ))}
      </div>

      <FortunePaymentSheet
        open={payOpen}
        onClose={() => {
          setPayOpen(false);
          setPendingHref(null);
        }}
        onPaid={handlePaid}
        returnPath={pendingHref || "/reading"}
      />
    </section>
  );
}
