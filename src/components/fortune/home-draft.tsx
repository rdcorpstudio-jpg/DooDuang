"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type TransitionEvent as ReactTransitionEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Lock,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
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
import { profileDeepSeed, profileToAnalyzeInput } from "@/lib/fortune/profile-reading";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { buildDailyReadingPack } from "@/lib/fortune/build-daily-pack";
import type { FortuneAspectId, FortuneTone } from "@/lib/fortune/analyze";
import {
  composeMaeDay,
  type MaeAspectId,
} from "@/lib/fortune/content/compose-mae-day";
import {
  getDayProfile,
} from "@/lib/fortune/auspicious-calendar";
import { LINE_OA_ADD_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { poloShirtSrcForColorName } from "@/lib/fortune/polo-shirt-asset";
import { MAE_GLASS } from "@/lib/mae-glass";
import { HomeDailyTarotCard } from "@/components/fortune/home-daily-tarot-card";
import {
  HomeAnalyzingLoader,
  shouldShowHomeAnalyze,
} from "@/components/fortune/home-analyzing-loader";

/** สวัสดีตามช่วงเวลา — เช้า / บ่าย / เย็น */
function greetingByHour(hour: number) {
  if (hour < 12) return "สวัสดีตอนเช้า" as const;
  if (hour < 17) return "สวัสดีตอนบ่าย" as const;
  return "สวัสดีตอนเย็น" as const;
}

const HOME_WISH = "ขอให้วันนี้เป็นวันที่ดี มีพลังดี ๆ อยู่รอบตัวคุณ";

/** ทางลัด = ฟีเจอร์แอป (ไอคอนอาร์ตโทนกรม–ทอง คมชัด) */
const SHORTCUTS = [
  {
    id: "daily",
    title: "ดวงวันนี้",
    href: "/home",
    icon: "/images/home/shortcuts/daily.webp?v=2",
    premium: false,
  },
  {
    id: "tarot",
    title: "ไพ่รายวัน",
    href: "/reading/tarot",
    icon: "/images/home/shortcuts/tarot.webp?v=2",
    premium: false,
  },
  {
    id: "shirt",
    title: "สีเสื้อ",
    href: "/reading/shirt",
    icon: "/images/home/shortcuts/shirt.webp?v=2",
    premium: false,
  },
  {
    id: "bazi",
    title: "ปาจื้อ",
    href: "/reading/bazi",
    icon: "/images/home/shortcuts/bazi.webp?v=2",
    premium: true,
  },
  {
    id: "couple",
    title: "ดวงคู่",
    href: "/premium/couple",
    icon: "/images/home/shortcuts/couple.webp?v=2",
    premium: true,
  },
  {
    id: "wallpaper",
    title: "วอลเปเปอร์",
    href: "/reading/wallpaper",
    icon: "/images/home/shortcuts/wallpaper.webp?v=2",
    premium: true,
  },
  {
    id: "self-map",
    title: "แผนที่ตัวตน",
    href: "/premium/self-map",
    icon: "/images/home/shortcuts/self-map.webp?v=2",
    premium: true,
  },
  {
    id: "year",
    title: "ดวงรายปี",
    href: "/premium/year",
    icon: "/images/home/shortcuts/year.webp?v=2",
    premium: true,
  },
] as const;

const MOCK = {
  realName: "แปผแด",
  birthDate: "1995-03-15",
};

const ASPECT_SHORT: Record<FortuneAspectId | "luck", string> = {
  work: "การงาน",
  money: "การเงิน",
  love: "ความรัก",
  health: "สุขภาพ",
  luck: "โชค",
};

/** สีสถานะตามไฟล์ HTML ต้นฉบับ */
const TONE_BADGE: Record<
  FortuneTone,
  { label: string; bg: string; color: string; border: string }
> = {
  high: {
    label: "หนุนเต็มที่",
    bg: "rgba(0, 146, 119, 0.22)",
    color: "#71eccb",
    border: "rgba(66, 217, 174, 0.6)",
  },
  mid: {
    label: "ระวัง",
    bg: "rgba(180, 70, 78, 0.28)",
    color: "#ff9a9a",
    border: "rgba(255, 140, 145, 0.55)",
  },
  low: {
    label: "เปราะบาง",
    bg: "rgba(152, 88, 108, 0.34)",
    color: "#ffaaa5",
    border: "#98586c",
  },
};

/** สีจาก maemangmee-horoscope-html — เปลี่ยนเฉพาะสี ไม่แตะ layout */
const GREEN = "#1dce61";
const LINE_GREEN = "#23c765";
const TEXT_MUTED = "#f0f4fa";
/** กรอบเดียวกับแผ่นทักทาย — กระจกกรม + ขอบขาวบาง */
const GLASS = MAE_GLASS;

const GOLD_SOFT = "#efc36c";

type AspectCardRow = {
  id: FortuneAspectId | "luck";
  tone: FortuneTone;
  body: string;
  /** คะแนน 1–12 สำหรับหลอด */
  score: number;
};

function AspectScoreBar({
  score,
  tone,
}: {
  score: number;
  tone: FortuneTone;
}) {
  const badge = TONE_BADGE[tone];
  const pct = Math.max(0, Math.min(100, Math.round((score / 12) * 100)));
  const barW = Math.max(8, pct);
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div
        className="h-[6px] min-w-0 flex-1 overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.12)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-400"
          style={{
            width: `${barW}%`,
            background: `linear-gradient(90deg, ${badge.border}, ${badge.color})`,
            boxShadow: `0 0 10px ${badge.border}`,
          }}
        />
      </div>
      <span
        className="shrink-0 text-[12px] font-bold tabular-nums leading-none"
        style={{ color: badge.color }}
      >
        {pct}%
      </span>
    </div>
  );
}

/** คารูเซลคำทำนาย — กลางชัด ข้างโผล่ วนลูป ไม่ทับกัน */
function AspectLoopCarousel({
  aspects,
}: {
  aspects: AspectCardRow[];
}) {
  const n = aspects.length;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(1);
  const [dragX, setDragX] = useState(0);
  const [anim, setAnim] = useState(false);
  const [metrics, setMetrics] = useState({ vw: 360, cardW: 320, step: 268 });
  const phaseRef = useRef<"idle" | "drag" | "snap">("idle");
  const startX = useRef(0);
  const lastX = useRef(0);
  const snapTimer = useRef(0);
  const pendingPos = useRef(1);
  const settling = useRef(false);
  const posRef = useRef(pos);
  posRef.current = pos;

  const slides = useMemo(() => {
    if (n === 0) return [] as AspectCardRow[];
    if (n === 1) return [aspects[0]!];
    return [aspects[n - 1]!, ...aspects, aspects[0]!];
  }, [aspects, n]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const vw = el.clientWidth || 360;
      // กว้างขึ้น · เตี้ยลง — ยังโผล่ใบข้าง
      const cardW = Math.round(Math.min(vw * 0.9, 368));
      const step = Math.round(cardW * 0.84);
      setMetrics({ vw, cardW, step });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
      window.clearTimeout(snapTimer.current);
    };
  }, []);

  if (n === 0) return null;

  const { cardW, step } = metrics;
  const pad = (metrics.vw - cardW) / 2;
  const translateX = pad - pos * step + dragX;

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current === "snap") return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    startX.current = e.clientX;
    lastX.current = e.clientX;
    settling.current = false;
    phaseRef.current = "drag";
    setAnim(false);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== "drag") return;
    lastX.current = e.clientX;
    const dx = e.clientX - startX.current;
    const max = step * 1.2;
    setDragX(Math.max(-max, Math.min(max, dx)));
  }

  function settle(at: number) {
    if (settling.current) return;
    if (phaseRef.current !== "snap") return;
    settling.current = true;
    window.clearTimeout(snapTimer.current);

    setAnim(false);
    setDragX(0);
    if (at <= 0) setPos(n);
    else if (at >= n + 1) setPos(1);
    else setPos(at);

    phaseRef.current = "idle";
    window.setTimeout(() => {
      settling.current = false;
    }, 40);
  }

  function goTo(next: number) {
    const cur = posRef.current;
    phaseRef.current = "snap";
    pendingPos.current = next;
    // เลื่อนแค่ dragX ให้ถึงตำแหน่ง next โดยยังไม่สลับ pos — กันวูบ
    setAnim(true);
    setDragX(-(next - cur) * step);
    window.clearTimeout(snapTimer.current);
    snapTimer.current = window.setTimeout(() => settle(next), 450);
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== "drag") return;
    const dx = lastX.current - startX.current;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      /* ignore */
    }

    const threshold = Math.min(48, step * 0.16);
    const cur = posRef.current;
    if (dx <= -threshold) goTo(cur + 1);
    else if (dx >= threshold) goTo(cur - 1);
    else goTo(cur);
  }

  function onTrackTransitionEnd(e: ReactTransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== "transform") return;
    settle(pendingPos.current);
  }

  if (n === 1) {
    const row = aspects[0]!;
    const badge = TONE_BADGE[row.tone];
    return (
      <div className="relative mt-3 flex justify-center px-5 sm:px-6">
        <article
          className="flex w-full max-w-[368px] flex-col overflow-hidden rounded-[18px] px-3.5 py-2.5"
          style={{
            background: GLASS.bg,
            border: GLASS.border,
            boxShadow: `${GLASS.shadow}, ${GLASS.highlight}`,
            backdropFilter: GLASS.blur,
            WebkitBackdropFilter: GLASS.blur,
          }}
        >
          <div className="flex shrink-0 items-center gap-2">
            <span
              className="shrink-0 text-[18px] font-bold leading-[1.35]"
              style={{ color: "#f2f5fb" }}
            >
              {ASPECT_SHORT[row.id]}
            </span>
            <span
              className="inline-flex shrink-0 rounded-full px-2 py-0.5 text-[13px] font-bold leading-none"
              style={{
                background: badge.bg,
                color: badge.color,
                boxShadow: `inset 0 0 0 1px ${badge.border}`,
              }}
            >
              {badge.label}
            </span>
          </div>
          <AspectScoreBar score={row.score} tone={row.tone} />
          <p
            className="mt-1.5 overflow-hidden text-[15px] font-medium leading-[1.5]"
            style={{
              color: "#f5f7ff",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {row.body}
          </p>
        </article>
      </div>
    );
  }

  return (
    <div className="relative mt-3 overflow-x-hidden">
      <div
        ref={viewportRef}
        className="relative mx-auto h-[8.75rem] w-full max-w-[480px] cursor-grab select-none overflow-visible active:cursor-grabbing"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="absolute top-0 left-0 h-full"
          onTransitionEnd={onTrackTransitionEnd}
          style={{
            width: slides.length * step,
            transform: `translate3d(${translateX}px, 0, 0)`,
            transition: anim
              ? "transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1)"
              : "none",
          }}
        >
          {slides.map((row, i) => {
            const dist = Math.abs(i * step - pos * step + dragX);
            const progress = Math.min(1, dist / Math.max(1, step));
            const scale = 1 - progress * 0.08;
            const opacity = Math.max(0.7, 1 - progress * 0.22);
            const active = progress < 0.4;
            // เบลอเฉพาะใบข้าง — ตามระยะ ไม่สลับ on/off
            const blurPx = Number((progress * 2.4).toFixed(2));
            const badge = TONE_BADGE[row.tone];
            return (
              <article
                key={`${row.id}-${i}`}
                className="absolute top-0 box-border flex h-[8.25rem] flex-col overflow-hidden rounded-[18px] px-3.5 py-2.5"
                style={{
                  left: i * step,
                  width: cardW,
                  transform: `scale(${scale})`,
                  transformOrigin: "center center",
                  opacity,
                  filter: `blur(${blurPx}px)`,
                  zIndex: active ? 5 : 1,
                  background: GLASS.bg,
                  border: GLASS.border,
                  boxShadow: active
                    ? `${GLASS.shadow}, ${GLASS.highlight}`
                    : "0 8px 18px rgba(0,0,0,0.14)",
                  backdropFilter: GLASS.blur,
                  WebkitBackdropFilter: GLASS.blur,
                  pointerEvents: active ? "auto" : "none",
                }}
              >
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className="shrink-0 text-[18px] font-bold leading-[1.35]"
                    style={{ color: "#f2f5fb" }}
                  >
                    {ASPECT_SHORT[row.id]}
                  </span>
                  <span
                    className="inline-flex shrink-0 rounded-full px-2 py-0.5 text-[13px] font-bold leading-none"
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      boxShadow: `inset 0 0 0 1px ${badge.border}`,
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
                <AspectScoreBar score={row.score} tone={row.tone} />
                <p
                  className="mt-1.5 min-h-0 flex-1 overflow-hidden text-[15px] font-medium leading-[1.5]"
                  style={{
                    color: "#f5f7ff",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {row.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * หน้าหลักแอป — ดวงวันนี้ · ทางลัด · สีเสื้อ · ฤกษ์
 * เส้นทางจริง: /home
 */
export function HomeDraft() {
  const router = useRouter();
  const { ref: shortcutsRef, didDrag } = useDragScroll();
  const [lineOpen, setLineOpen] = useState(true);
  const [premium, setPremium] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [trialActive, setTrialActive] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(MOCK.realName);
  const [birthDate, setBirthDate] = useState(MOCK.birthDate);
  const [birthTime, setBirthTime] = useState<string | undefined>();
  const [birthPlace, setBirthPlace] = useState<string | undefined>();
  const [gender, setGender] = useState<"" | "female" | "male" | "other" | "unspecified">("");
  const [genderNote, setGenderNote] = useState<string | undefined>();
  const [focus, setFocus] = useState<"life" | "work" | "money" | "love" | "health">("life");
  /** Session-once analyze screen; default true on SSR to avoid home flash. */
  const [analyzing, setAnalyzing] = useState(() => {
    if (typeof window === "undefined") return true;
    return shouldShowHomeAnalyze();
  });
  const greeting = useMemo(() => greetingByHour(new Date().getHours()), []);

  useEffect(() => {
    function syncProfile() {
      const profile = readFortuneProfile();
      if (profile?.realName?.trim()) setDisplayName(profile.realName.trim());
      else if (profile?.nickname?.trim()) setDisplayName(profile.nickname.trim());
      if (profile?.birthDate && /^\d{4}-\d{2}-\d{2}$/.test(profile.birthDate)) {
        setBirthDate(profile.birthDate);
      }
      setBirthTime(profile?.birthTime?.trim() || undefined);
      setBirthPlace(profile?.birthPlace?.trim() || undefined);
      setGender(profile?.gender || "");
      setGenderNote(profile?.genderNote?.trim() || undefined);
      setFocus(profile?.focus || "life");
    }
    syncProfile();
    if (!shouldShowHomeAnalyze()) setAnalyzing(false);
    window.addEventListener("dooduang-profile-changed", syncProfile);
    window.addEventListener("storage", syncProfile);
    window.addEventListener("focus", syncProfile);
    return () => {
      window.removeEventListener("dooduang-profile-changed", syncProfile);
      window.removeEventListener("storage", syncProfile);
      window.removeEventListener("focus", syncProfile);
    };
  }, []);

  const profileSlice = useMemo(
    () => ({
      birthDate,
      birthTime,
      birthPlace,
      nickname: displayName,
      gender,
      genderNote,
      focus,
    }),
    [birthDate, birthTime, birthPlace, displayName, gender, genderNote, focus],
  );

  const dailyPack = useMemo(
    () => buildDailyReadingPack(profileToAnalyzeInput(profileSlice)),
    [profileSlice],
  );
  const dayProfile = useMemo(
    () => getDayProfile(profileDeepSeed(profileSlice, "home-auspicious"), new Date()),
    [profileSlice],
  );
  const maeDay = useMemo(() => {
    const aspectTones: Partial<Record<MaeAspectId, FortuneTone>> = {
      luck: dailyPack.analysis.dayTone,
    };
    for (const a of dailyPack.aspects) {
      aspectTones[a.id] = a.tone;
    }
    return composeMaeDay({
      birthDate,
      birthTime,
      birthPlace,
      nickname: displayName,
      gender,
      focus,
      premium,
      aspectTones,
      markers: dayProfile.markers,
    });
  }, [
    dailyPack,
    premium,
    dayProfile.markers,
    birthDate,
    birthTime,
    birthPlace,
    displayName,
    gender,
    focus,
  ]);

  const homeAspectCards = useMemo(() => {
    const scoreById = new Map(
      dailyPack.aspects.map((a) => [a.id, a.score] as const),
    );
    return maeDay.dailyAspects.map((row) => ({
      id: row.id,
      tone: row.tone,
      body: row.body,
      score:
        row.id === "luck"
          ? dailyPack.analysis.dayScore
          : (scoreById.get(row.id) ??
            (row.tone === "high" ? 10 : row.tone === "mid" ? 6 : 3)),
    }));
  }, [maeDay.dailyAspects, dailyPack.aspects, dailyPack.analysis.dayScore]);
  const dateLabel = useMemo(() => {
    const now = new Date();
    const tz = { timeZone: "Asia/Bangkok" as const };
    return {
      day: now.toLocaleDateString("th-TH", { day: "numeric", ...tz }),
      month: now.toLocaleDateString("th-TH", { month: "short", ...tz }),
    };
  }, []);
  const parseWindow = (time: string) => {
    const [start = "09:00", end = "11:00"] = time.split("-");
    return { start: start.slice(0, 5), end: end.slice(0, 5) };
  };
  const goodWin = parseWindow(maeDay.auspiciousToday.goodWindow.time);
  const avoidWin = parseWindow(maeDay.auspiciousToday.avoidWindow.time);

  useEffect(() => {
    let alive = true;
    async function syncPremium() {
      const profile = readFortuneProfile();
      const access = await requirePremiumFromServer(
        profile
          ? { birthDate: profile.birthDate, nickname: profile.nickname }
          : null,
      );
      if (!alive) return;
      setPremium(access.ok);
      try {
        const res = await fetch("/api/premium/status", { cache: "no-store" });
        const data = (await res.json()) as {
          premium?: boolean;
          trialActive?: boolean;
          trialDaysLeft?: number;
        };
        if (!alive) return;
        if (typeof data.premium === "boolean") setPremium(data.premium);
        const onTrial = Boolean(data.trialActive) && !data.premium;
        setTrialActive(onTrial);
        setTrialDaysLeft(
          typeof data.trialDaysLeft === "number" ? data.trialDaysLeft : 0
        );
      } catch {
        /* ignore */
      }
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

  function openShortcut(href: string, needsPremium: boolean) {
    if (needsPremium && !premium) {
      setPendingHref(href);
      setPayOpen(true);
      return;
    }
    startMaeNavigation();
    router.push(href);
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

  if (analyzing) {
    return (
      <HomeAnalyzingLoader
        profile={{
          birthDate,
          nickname: displayName,
          birthTime,
          birthPlace,
          focus,
        }}
        onDone={() => setAnalyzing(false)}
      />
    );
  }

  return (
    <div
      className="horoscope-html-palette relative mx-auto min-h-full w-full max-w-[480px] text-[#f5f7ff]"
      style={{ background: "transparent", color: "#f5f7ff" }}
    >
      <MaePageBackground priority />

      <AnimatedPage className="relative z-[2] pb-[8.5rem] pt-3">
        {/* หัว — โล่ง อ่านชัด มือถือคอลัมน์เดียว */}
        <header className="mae-home-hero px-5 sm:px-6">
          <div className="flex items-center justify-end gap-2.5">
            <button type="button" className="mae-top-action" aria-label="การแจ้งเตือน">
              <Bell className="h-[19px] w-[19px]" strokeWidth={1.8} />
              <span className="mae-notification-dot" aria-hidden />
            </button>
            <Link href="/dashboard" className="mae-profile-action" aria-label="โปรไฟล์">
              <UserRound className="h-[20px] w-[20px]" strokeWidth={1.8} />
            </Link>
        </div>

          <div className="mae-home-greeting mt-5 max-w-[22rem]">
            <p className="text-[16.5px] font-medium text-white/90">{greeting}</p>
            <h1
              className="mt-1 text-[2rem] font-medium leading-[1.28] tracking-tight text-white"
          style={{
                textShadow:
                  "0 1px 0 rgba(8,28,58,0.8), 0 2px 8px rgba(8,28,58,0.4)",
              }}
            >
              คุณ{displayName}
            </h1>
            <p className="mae-home-greeting-tip-body mt-2.5 text-[16.5px] font-medium leading-[1.55]">
              {HOME_WISH}
            </p>
            {trialActive && trialDaysLeft > 0 ? (
              <p
                className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold"
                style={{
                  color: GOLD_SOFT,
                  background: "rgba(232,209,154,0.12)",
                  boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.35)",
                }}
              >
                <Sparkles className="h-3 w-3" strokeWidth={2.2} />
                ทดลองฟรี · เหลือ {trialDaysLeft} วัน
              </p>
            ) : null}
          </div>
        </header>

        <section
          className="mae-daily-card relative mx-5 mt-5 overflow-hidden rounded-[28px] sm:mx-6"
          style={{
            background:
              "linear-gradient(165deg, rgba(18,36,62,0.82) 0%, rgba(8,18,36,0.78) 55%, rgba(6,14,28,0.8) 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.07), 0 22px 48px rgba(0,0,0,0.32)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(232,209,154,0.2) 0%, transparent 68%)",
            }}
          />
              <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(232,209,154,0.45), transparent)",
            }}
          />

          <div className="relative z-[1] px-5 pb-5 pt-5">
            <div className="flex items-center justify-between gap-3">
              <p
                className="text-[13px] font-semibold tracking-[0.16em]"
                style={{ color: GOLD_SOFT }}
              >
                ดวงวันนี้
              </p>
              <p
                className="text-[13px] font-medium tabular-nums"
                style={{ color: "rgba(186,204,230,0.65)" }}
              >
                {dateLabel.day} {dateLabel.month}
          </p>
        </div>

            <div className="mt-4 flex items-start gap-4">
              <div
                className="mae-daily-date relative flex h-[4.25rem] w-[4.25rem] shrink-0 flex-col items-center justify-center rounded-[20px] text-center"
          style={{
                  background:
                    "radial-gradient(ellipse 80% 70% at 50% 35%, rgba(232,209,154,0.22) 0%, rgba(12,28,52,0.55) 70%)",
                  boxShadow:
                    "inset 0 0 0 1px rgba(232,209,154,0.5), 0 8px 20px rgba(0,0,0,0.2)",
                }}
              >
                <span
                  className="w-full text-center text-[1.65rem] font-bold leading-none tabular-nums"
              style={{
                    background:
                      "linear-gradient(180deg, #fff8e4 0%, #e8d19a 55%, #b8924f 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {dateLabel.day}
              </span>
                <span
                  className="mt-1 w-full text-center text-[11.5px] font-semibold tracking-wide"
                  style={{ color: "rgba(232,209,154,0.88)" }}
                >
                  {dateLabel.month}
              </span>
            </div>

              <p
                className="min-w-0 flex-1 pt-1 text-[17px] font-medium leading-[1.55]"
                style={{
                  color: "#f5f7ff",
                  paddingTop: "0.1em",
                  paddingBottom: "0.06em",
                }}
              >
                {maeDay.dayCard.summary}
              </p>
          </div>

            {maeDay.dayCard.cautions.length > 0 ? (
              <div
                className="mt-5 rounded-[18px] px-3.5 py-3.5"
                style={{
                  background: "rgba(80,28,36,0.28)",
                  boxShadow: "inset 0 0 0 1px rgba(255,154,154,0.28)",
                }}
              >
                <p
                  className="text-[13.5px] font-semibold tracking-[0.06em]"
                  style={{ color: "#ffb4b0" }}
            >
              ข้อควรระวังวันนี้
            </p>
            <ul className="mt-2.5 space-y-2">
                  {maeDay.dayCard.cautions.map((c) => (
                <li
                  key={c}
                      className="flex items-start gap-2.5 text-[15.5px] leading-[1.5]"
                      style={{ color: "rgba(255,245,245,0.92)" }}
                >
                  <span
                        className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          background: "#ff9a9a",
                          boxShadow: "0 0 8px rgba(255,154,154,0.45)",
                        }}
                    aria-hidden
                  />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
            ) : null}

          <Link
              href="/calendar"
              className="wallpaper-dl-btn group relative mt-5 flex h-[3.6rem] w-full items-center gap-3 overflow-hidden rounded-[18px] px-2.5 text-left outline-none transition active:scale-[0.99]"
            >
              <span className="wallpaper-dl-btn__icon relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
                <CalendarDays className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </span>
              <span className="relative z-[1] min-w-0 flex-1">
                <span className="dd-btn-label block text-[16px] font-bold leading-tight tracking-wide">
                  {premium ? "เปิดปฏิทินฤกษ์เต็ม" : "ดูฤกษ์วันนี้"}
                </span>
                <span className="mt-0.5 block text-[12.5px] font-medium leading-tight opacity-70">
                  {premium ? "ดูฤกษ์ดี · วันมงคลทั้งปี" : "เช็กฤกษ์วันนี้แบบย่อ"}
                </span>
              </span>
              <ChevronRight
                className="relative z-[1] mr-1.5 h-5 w-5 shrink-0 opacity-80 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2.4}
              />
              <span
                className="wallpaper-dl-btn__shine pointer-events-none absolute inset-0"
                aria-hidden
              />
          </Link>
          </div>
        </section>

        {/* LINE */}
        {lineOpen ? (
          <div
            className="relative mx-5 mt-5 flex items-center gap-3 overflow-hidden rounded-[22px] px-4 py-3.5 pr-9 sm:mx-6"
            style={{
              background: GLASS.bgSoft,
              border: GLASS.border,
              boxShadow: GLASS.highlight,
              backdropFilter: GLASS.blur,
              WebkitBackdropFilter: GLASS.blur,
            }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-[12px] font-black text-[#f5f7ff]"
              style={{
                background: LINE_GREEN,
                border: "1px solid rgba(255,255,255,0.18)",
              }}
              aria-hidden
            >
              LINE
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15.5px] font-bold text-[#f5f7ff]">
                ดูดวงทุกวันใน LINE
              </p>
              <p className="truncate text-[15.5px]" style={{ color: TEXT_MUTED }}>
                คำแนะนำดี ๆ สำหรับทุกวัน
              </p>
            </div>
            <a
              href={LINE_OA_ADD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full px-3.5 py-1.5 text-[15.5px] font-bold text-[#f5f7ff]"
              style={{ background: GREEN }}
            >
              เพิ่มเพื่อน
            </a>
            <button
              type="button"
              onClick={() => setLineOpen(false)}
              className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full"
              style={{ color: TEXT_MUTED }}
              aria-label="ปิดแบนเนอร์ LINE"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          </div>
        ) : null}

        {/* ทางลัด */}
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3 px-5 sm:px-6">
            <h2 className="mae-gold-text text-[1.45rem] font-bold leading-tight">
              ทางลัด
            </h2>
            <Link
              href="/predict"
              className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-3.5 py-2 text-[14.5px] font-semibold outline-none transition active:scale-[0.98]"
              style={{
                color: GOLD_SOFT,
                background: "rgba(8,14,28,0.45)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
              }}
            >
              ดูทั้งหมด
              <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
            </Link>
          </div>
          <div
            ref={shortcutsRef}
            className="home-shortcuts-scroll no-h-scrollbar mt-4 flex cursor-grab select-none gap-3 overflow-x-auto overscroll-x-contain px-5 pb-2 touch-pan-x active:cursor-grabbing sm:px-6"
          >
            {SHORTCUTS.map((item) => {
              const locked = item.premium && !premium;
              return (
                <button
                key={item.id}
                  type="button"
                  onClick={() => {
                    if (didDrag()) return;
                    openShortcut(item.href, item.premium);
                  }}
                  className="mae-shortcut-item flex w-[6.35rem] shrink-0 flex-col items-center gap-2.5 outline-none transition active:scale-[0.98]"
                  aria-label={
                    locked ? `${item.title} · ต้องเป็นพรีเมียม` : item.title
                  }
              >
                <span
                    className="mae-shortcut-art relative h-[6rem] w-[6rem] overflow-hidden rounded-[20px] p-[1.5px]"
                  style={{
                      background:
                        "linear-gradient(155deg, rgba(232,209,154,0.55) 0%, rgba(184,146,79,0.25) 55%, rgba(255,255,255,0.12) 100%)",
                      boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
                  }}
                >
                  <span
                      className="relative block h-full w-full overflow-hidden rounded-[18px]"
                      style={{ background: "rgba(7, 11, 20, 0.95)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.icon}
                      alt=""
                      width={384}
                      height={384}
                      decoding="async"
                      draggable={false}
                        className={cn(
                          "pointer-events-none h-full w-full scale-[1.04] object-cover object-center transition-transform duration-300",
                          locked && "opacity-55",
                        )}
                    />
                      {locked ? (
                        <span className="pointer-events-none absolute bottom-2.5 right-2.5 z-[2] flex h-6 w-6 items-center justify-center rounded-full bg-[#051126]/92 text-[#efc36c] shadow-[0_0_0_1px_rgba(239,195,108,0.55)]">
                          <Lock className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </span>
                      ) : null}
                  </span>
                </span>
                <span
                    className="line-clamp-2 w-full text-center text-[15px] font-semibold leading-[1.3]"
                    style={{
                      color: locked ? "rgba(239,195,108,0.85)" : "#f5f7ff",
                    }}
                >
                  {item.title}
                </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* คำทำนายวันนี้ — กลางชัด ข้างเบลอ ปัดวนลูป */}
        <section className="relative mt-7 overflow-visible">
          <div className="flex items-center gap-2 px-5 sm:px-6">
            <Sparkles
              className="h-4.5 w-4.5"
              style={{ color: GOLD_SOFT }}
              strokeWidth={2.2}
              aria-hidden
            />
            <h2 className="mae-gold-text text-[21px] font-bold">คำทำนายวันนี้</h2>
          </div>

          <AspectLoopCarousel aspects={homeAspectCards} />
        </section>

        {/* สีเสื้อมงคล */}
        <section
          className="relative mx-5 mt-7 overflow-hidden rounded-[22px] px-4 py-5 sm:mx-6"
          style={{
            background: GLASS.bg,
            border: GLASS.border,
            boxShadow: `${GLASS.shadow}, ${GLASS.highlight}`,
            backdropFilter: GLASS.blur,
            WebkitBackdropFilter: GLASS.blur,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className="text-[13.5px] font-semibold tracking-[0.14em]"
                  style={{ color: GOLD_SOFT }}
              >
                วันนี้ใส่สีไหนดี
              </p>
              <h2 className="mae-gold-text mt-1 text-[1.55rem] font-bold leading-tight">
                สีเสื้อมงคล
              </h2>
            </div>
            <Link
              href="/reading/shirt"
              className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-3.5 py-2 text-[14.5px] font-semibold outline-none transition active:scale-[0.98]"
              style={{
                color: GOLD_SOFT,
                background: "rgba(8,14,28,0.45)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
              }}
            >
              ดูทั้งหมด
              <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
            </Link>
          </div>

          <div
            className="mt-4 flex items-center gap-3.5 rounded-[18px] px-3.5 py-3.5"
            style={{
              background:
                "linear-gradient(135deg, rgba(232,209,154,0.14) 0%, rgba(8,14,28,0.35) 100%)",
              boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.22)",
            }}
          >
            <Image
              src={poloShirtSrcForColorName(maeDay.luckyShirt.todayColorName)}
              alt=""
              width={72}
              height={72}
              className="h-16 w-16 shrink-0 object-contain"
              unoptimized
            />
            <div className="min-w-0 flex-1">
              <p
                className="text-[14.5px] font-semibold tracking-wide"
                style={{ color: GOLD_SOFT }}
              >
                {maeDay.luckyShirt.todaySupportLabel}
              </p>
              <p className="mt-1 text-[1.55rem] font-bold leading-tight text-white">
                {maeDay.luckyShirt.todayColorName}
              </p>
              <p
                className="mt-1 text-[14px] font-medium"
                style={{ color: TEXT_MUTED }}
              >
                สีเด่นวันนี้ · ใส่แล้วหนุนจังหวะ
              </p>
            </div>
          </div>

          {(() => {
            const forbidden = maeDay.luckyShirt.groups.find((g) => g.forbidden);
            const supports = maeDay.luckyShirt.groups.filter((g) => !g.forbidden);
            return (
              <>
                <div className="mt-3.5 grid grid-cols-2 gap-2">
                  {supports.map((group) => (
                    <div
                key={group.id}
                      className="flex items-center gap-2.5 rounded-[14px] px-2.5 py-2.5"
                      style={{
                        background: "rgba(8,14,28,0.4)",
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                      }}
                    >
                      <Image
                        src={poloShirtSrcForColorName(
                          group.colors[0]?.name ?? group.colorsText,
                        )}
                        alt={group.colors[0]?.name ?? ""}
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 object-contain"
                        unoptimized
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[13.5px] font-semibold tracking-wide"
                          style={{ color: GOLD_SOFT }}
                        >
                          {group.label.replace(/^หนุน/, "")}
                        </p>
                        <p className="mt-0.5 truncate text-[15.5px] font-semibold text-white">
                          {group.colors[0]?.name ?? group.colorsText}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {forbidden ? (
                  <div
                    className="mt-3 flex items-center gap-3 rounded-[14px] px-3 py-2.5"
                    style={{
                      background: "rgba(120,40,55,0.18)",
                      boxShadow: "inset 0 0 0 1px rgba(240,168,176,0.22)",
                    }}
                  >
                    <div className="flex shrink-0 -space-x-2">
                      {forbidden.colors.map((c) => (
                        <Image
                      key={c.name}
                          src={poloShirtSrcForColorName(c.name)}
                          alt={c.name}
                      title={c.name}
                          width={28}
                          height={28}
                          className="h-7 w-7 rounded-full object-contain ring-1 ring-[rgba(8,14,28,0.8)]"
                          unoptimized
                    />
                  ))}
                </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-semibold tracking-wide text-[#f0a8b0]">
                        พักไว้ก่อน
                      </p>
                      <p className="mt-0.5 truncate text-[15px] font-medium text-[#f0c4ca]">
                        {forbidden.colorsText}
                      </p>
                    </div>
                  </div>
                ) : null}
              </>
            );
          })()}
        </section>

        {/* ทำเลย / เลี่ยง — ใต้สีเสื้อมงคล */}
        <div className="mx-5 mt-3.5 grid grid-cols-2 gap-3 sm:mx-6">
          <div
            className="rounded-[22px] px-3.5 py-3.5"
            style={{
              background: GLASS.bg,
              border: "1px solid rgba(72, 200, 140, 0.55)",
              boxShadow: `${GLASS.shadow}, ${GLASS.highlight}`,
              backdropFilter: GLASS.blur,
              WebkitBackdropFilter: GLASS.blur,
            }}
          >
            <p
              className="text-[15.5px] font-bold tracking-wide"
              style={{ color: "#b9ebdc" }}
            >
              วันนี้ลอง
            </p>
            <p className="mt-1.5 text-[15.5px] font-medium leading-[1.45] text-[#f5f7ff]">
              {maeDay.dayCard.doNow}
            </p>
          </div>
          <div
            className="rounded-[22px] px-3.5 py-3.5"
            style={{
              background: GLASS.bg,
              border: "1px solid rgba(230, 90, 90, 0.55)",
              boxShadow: `${GLASS.shadow}, ${GLASS.highlight}`,
              backdropFilter: GLASS.blur,
              WebkitBackdropFilter: GLASS.blur,
            }}
          >
            <p
              className="text-[15.5px] font-bold tracking-wide"
              style={{ color: "#ffaaa5" }}
            >
              ยังไม่ต้อง
            </p>
            <p className="mt-1.5 text-[15.5px] font-medium leading-[1.45] text-[#f5f7ff]">
              {maeDay.dayCard.avoid}
            </p>
          </div>
        </div>

        {/* ฤกษ์วันนี้ — ตัวอักษรล้วน ไม่กล่องสีซ้อน */}
        <section
          className="relative mx-5 mt-6 overflow-hidden rounded-[22px] px-4 py-5 sm:mx-6"
          style={{
            background: GLASS.bg,
            border: GLASS.border,
            boxShadow: `${GLASS.shadow}, ${GLASS.highlight}`,
            backdropFilter: GLASS.blur,
            WebkitBackdropFilter: GLASS.blur,
          }}
        >
          <div className="min-w-0">
            <p
              className="text-[13.5px] font-semibold tracking-[0.14em]"
              style={{ color: GOLD_SOFT }}
            >
              ธาตุ ·{" "}
              {maeDay.auspiciousToday.elementLine.replace(
                /^ธาตุประจำตัวของคุณ · /,
                "",
              )}
            </p>
            <h2 className="mae-gold-text mt-1 text-[1.55rem] font-bold leading-tight">
              ฤกษ์วันนี้
            </h2>
          </div>

          <p className="mt-4 text-[1.2rem] font-bold leading-snug text-white">
            {maeDay.auspiciousToday.dayName}
          </p>
          <p
            className="mt-1.5 text-[16px] font-medium leading-[1.55]"
            style={{ color: TEXT_MUTED }}
          >
            {maeDay.auspiciousToday.dayHint}
          </p>

          <div
            className="mt-4 h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(232,209,154,0.35), rgba(255,255,255,0.06))",
            }}
          />

          <div className="mt-3.5">
            <p
              className="text-[14.5px] font-semibold"
              style={{ color: "#b9ebdc" }}
            >
              {maeDay.auspiciousToday.goodWindow.label}
              <span className="font-medium text-[#b9ebdc]/75">
                {" "}
                · {maeDay.auspiciousToday.goodWindow.status}
              </span>
            </p>
            <p className="mt-1 text-[1.65rem] font-bold tabular-nums leading-none tracking-tight text-white">
              {goodWin.start}
              <span className="mx-1.5 text-[1.1rem] font-medium text-white/45">
                –
              </span>
              {goodWin.end}
            </p>
          </div>

          <div className="mt-4">
            <p
              className="text-[14.5px] font-semibold"
              style={{ color: "#f0a8b0" }}
            >
              {maeDay.auspiciousToday.avoidWindow.label}
              <span className="font-medium text-[#f0a8b0]/75">
                {" "}
                · {maeDay.auspiciousToday.avoidWindow.status}
              </span>
            </p>
            <p className="mt-1 text-[1.65rem] font-bold tabular-nums leading-none tracking-tight text-white">
              {avoidWin.start}
              <span className="mx-1.5 text-[1.1rem] font-medium text-white/45">
                –
              </span>
              {avoidWin.end}
            </p>
          </div>
        </section>

        <div className="mx-5 mt-5 sm:mx-6">
          <HomeDailyTarotCard />
        </div>

      </AnimatedPage>

      <FixedAppBottomNav activeId="home" />

      <FortunePaymentSheet
        open={payOpen}
        onClose={() => {
          setPayOpen(false);
          setPendingHref(null);
        }}
        onPaid={applyUnlock}
        returnPath={pendingHref ?? "/home"}
      />
    </div>
  );
}
