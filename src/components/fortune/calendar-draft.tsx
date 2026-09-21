"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Lock,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { FixedAppBottomNav } from "@/components/layout/bottom-nav";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { AnimatedPage } from "@/components/ui/reveal";
import { PageBackButton } from "@/components/ui/page-back-button";
import {
  requirePremiumFromServer,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";
import { profileDeepSeed } from "@/lib/fortune/profile-reading";
import {
  MARKER_META,
  adviceForDay,
  formatThaiDayShort,
  formatThaiMonthYear,
  getDayProfile,
  getMonthGrid,
  parseIsoDate,
  type DayEnergy,
} from "@/lib/fortune/auspicious-calendar";
import { composeMaeDay } from "@/lib/fortune/content/compose-mae-day";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] as const;

/** จุดสีโทนแม่ · แมปจากพลังวัน (เดโม) */
const DOT: Record<DayEnergy, { color: string; label: string }> = {
  strong: { color: "#7dcea0", label: "หนุน" },
  smooth: { color: "#d5b16f", label: "ปกติ" },
  relax: { color: "#f0a86a", label: "ระวัง" },
  slow: { color: "#e87878", label: "เฝ้าระวัง" },
  rest: { color: "#e87878", label: "เฝ้าระวัง" },
};

const LEGEND = [
  { color: "#7dcea0", label: "หนุน" },
  { color: "#d5b16f", label: "ปกติ" },
  { color: "#f0a86a", label: "ระวัง" },
  { color: "#e87878", label: "เฝ้าระวัง" },
] as const;

const GOLD = "#e8d19a";
const GOLD_SOFT = "#e8d19a";
const TEXT_MUTED = "#f0f4fa";

/** ดาวกระพริบ — ชุดเดียวกับหน้าหลัก */
const CAL_STARS = [
  { top: "12%", left: "4%", size: 3, tone: "ice" as const, dur: "3.2s", delay: "0s" },
  { top: "18%", left: "94%", size: 4, tone: "warm" as const, dur: "4s", delay: "0.4s" },
  { top: "28%", left: "6%", size: 2.5, tone: "amber" as const, dur: "3.6s", delay: "1s" },
  { top: "34%", left: "92%", size: 3.5, tone: "ice" as const, dur: "4.4s", delay: "0.2s" },
  { top: "42%", left: "3%", size: 3, tone: "warm" as const, dur: "3.8s", delay: "1.4s" },
  { top: "48%", left: "96%", size: 4, tone: "ice" as const, dur: "5s", delay: "0.7s" },
  { top: "55%", left: "5%", size: 3.5, tone: "amber" as const, dur: "3.4s", delay: "1.8s" },
  { top: "58%", left: "50%", size: 2.5, tone: "warm" as const, dur: "4.2s", delay: "0.5s" },
  { top: "62%", left: "93%", size: 3, tone: "ice" as const, dur: "3.9s", delay: "1.1s" },
  { top: "68%", left: "4%", size: 4, tone: "warm" as const, dur: "4.6s", delay: "0.3s" },
  { top: "72%", left: "88%", size: 3, tone: "amber" as const, dur: "3.5s", delay: "2s" },
  { top: "76%", left: "8%", size: 2.5, tone: "ice" as const, dur: "4.1s", delay: "0.9s" },
  { top: "80%", left: "95%", size: 3.5, tone: "warm" as const, dur: "5.2s", delay: "1.5s" },
  { top: "84%", left: "46%", size: 3, tone: "ice" as const, dur: "3.7s", delay: "0.6s" },
  { top: "88%", left: "6%", size: 4, tone: "amber" as const, dur: "4.3s", delay: "1.2s" },
  { top: "91%", left: "90%", size: 3, tone: "warm" as const, dur: "3.3s", delay: "2.2s" },
  { top: "22%", left: "48%", size: 2.5, tone: "ice" as const, dur: "4.8s", delay: "0.1s" },
  { top: "38%", left: "52%", size: 3, tone: "warm" as const, dur: "3.6s", delay: "1.6s" },
  { top: "65%", left: "28%", size: 2.5, tone: "ice" as const, dur: "4.5s", delay: "0.8s" },
  { top: "70%", left: "72%", size: 3.5, tone: "amber" as const, dur: "3.9s", delay: "1.9s" },
];

const STAR_TONE: Record<
  "ice" | "warm" | "amber",
  { color: string; glow: string }
> = {
  ice: {
    color: "rgba(180, 220, 255, 1)",
    glow: "0 0 6px 2px rgba(120, 180, 255, 0.85), 0 0 14px 4px rgba(80, 140, 255, 0.35)",
  },
  warm: {
    color: "rgba(255, 230, 160, 1)",
    glow: "0 0 6px 2px rgba(255, 200, 100, 0.9), 0 0 14px 4px rgba(232, 177, 90, 0.4)",
  },
  amber: {
    color: "rgba(255, 200, 120, 1)",
    glow: "0 0 6px 2px rgba(255, 170, 80, 0.85), 0 0 12px 3px rgba(255, 150, 60, 0.35)",
  },
};

/**
 * แบบร่างปฏิทินมงคลเต็ม — /preview/calendar
 * โทนแม่กรม–ทอง · ปกจากอาร์ตที่ให้มา · ยังไม่ผูกระบบจริงทั้งหมด
 */
export function CalendarDraft() {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [premium, setPremium] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const todayIso = useMemo(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [now]);

  const [selectedIso, setSelectedIso] = useState(todayIso);
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [birthTime, setBirthTime] = useState<string | undefined>();
  const [birthPlace, setBirthPlace] = useState<string | undefined>();
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<"" | "female" | "male" | "other" | "unspecified">("");
  const [focus, setFocus] = useState<"life" | "work" | "money" | "love" | "health">("life");

  const profileSlice = useMemo(
    () => ({
      birthDate,
      birthTime,
      birthPlace,
      nickname,
      gender,
      focus,
    }),
    [birthDate, birthTime, birthPlace, nickname, gender, focus],
  );
  const calSeed = useMemo(
    () => profileDeepSeed(profileSlice, "calendar"),
    [profileSlice],
  );

  const cells = useMemo(
    () => getMonthGrid(calSeed, year, month),
    [calSeed, year, month],
  );

  const monthLabel = formatThaiMonthYear(year, month);

  const activeIso = premium ? selectedIso : todayIso;
  const selectedProfile = useMemo(
    () => getDayProfile(calSeed, parseIsoDate(activeIso)),
    [calSeed, activeIso],
  );
  const selectedLabel = formatThaiDayShort(parseIsoDate(selectedProfile.iso));
  const selectedDot = DOT[selectedProfile.energy];

  const maeDay = useMemo(
    () =>
      composeMaeDay({
        birthDate,
        birthTime,
        birthPlace,
        nickname,
        gender,
        focus,
        asOf: parseIsoDate(activeIso),
        premium,
        markers: selectedProfile.markers,
      }),
    [
      birthDate,
      birthTime,
      birthPlace,
      nickname,
      gender,
      focus,
      activeIso,
      premium,
      selectedProfile.markers,
    ],
  );

  useEffect(() => {
    let alive = true;
    async function syncPremium() {
      const profile = readFortuneProfile();
      if (alive && profile) {
        if (profile.birthDate) setBirthDate(profile.birthDate);
        setBirthTime(profile.birthTime?.trim() || undefined);
        setBirthPlace(profile.birthPlace?.trim() || undefined);
        setNickname(profile.nickname?.trim() || "");
        setGender(profile.gender || "");
        setFocus(profile.focus || "life");
      }
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

  const [yearTips, setYearTips] = useState<Record<
    string,
    string
  > | null>(null);

  useEffect(() => {
    if (!premium) {
      setYearTips(null);
      return;
    }
    let alive = true;
    void import("@/lib/fortune/content/mae-year-tips").then((mod) => {
      if (alive) setYearTips({ ...mod.MAE_YEAR_TIPS });
    });
    return () => {
      alive = false;
    };
  }, [premium]);

  // ฟรี: บังคับอยู่เดือนปัจจุบัน + เลือกวันนี้
  useEffect(() => {
    if (premium) return;
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedIso(todayIso);
  }, [premium, now, todayIso]);

  function prevMonth() {
    if (!premium) return; // อดีต — ฟรีดูไม่ได้
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (!premium) {
      setPayOpen(true); // อนาคต — ต้องพรีเมียม
      return;
    }
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  }

  function onSelectDay(iso: string) {
    if (premium) {
      setSelectedIso(iso);
      return;
    }
    if (iso < todayIso) return; // อดีต
    if (iso > todayIso) {
      setPayOpen(true); // อนาคต
      return;
    }
    setSelectedIso(iso);
  }

  const goodDays = useMemo(() => {
    const days: number[] = [];
    cells.forEach((c) => {
      if (!c) return;
      const d = Number(c.iso.slice(-2));
      if (c.energy === "strong" || c.energy === "smooth") days.push(d);
    });
    return days.slice(0, 5).join(", ") || "—";
  }, [cells]);

  const cautionDays = useMemo(() => {
    const days: number[] = [];
    cells.forEach((c) => {
      if (!c) return;
      const d = Number(c.iso.slice(-2));
      if (c.energy === "slow" || c.energy === "rest" || c.markers.includes("chaos")) {
        days.push(d);
      }
    });
    return days.slice(0, 4).join(", ") || "—";
  }, [cells]);

  return (
    <div
      className="relative mx-auto min-h-full w-full max-w-[480px] text-white"
      style={{ background: "transparent" }}
    >
      <MaePageBackground priority blur={18} scrollBlur={false} />

      <div className="relative z-[2] overflow-x-hidden pb-[7.25rem] pt-5">
        <AnimatedPage className="px-5 sm:px-6">
        <header className="flex items-center justify-between gap-3">
          <MaeBrandLink />
          <PageBackButton href="/home" />
        </header>

        <h1 className="mae-gold-text mt-5 text-[2.05rem] font-semibold tracking-tight leading-[1.35]">
          ปฏิทินมงคล
        </h1>
        <p
          className="mt-2.5 max-w-[22rem] text-[15.5px] font-medium leading-[1.45]"
          style={{ color: TEXT_MUTED }}
        >
          {premium
            ? "พรีเมียม · ดูฤกษ์ย้อนหลังและวันข้างหน้าได้เต็ม"
            : "ฟรี · ดูได้เฉพาะวันนี้ · วันข้างหน้าปลดล็อกพรีเมียม"}
        </p>

        {/* ปก — รูปเต็มการ์ด ไม่มีเส้นตัดกลาง */}
        <section
          className="relative mt-4 min-h-[8rem] overflow-hidden rounded-[22px]"
          style={{
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 14px 36px rgba(0,0,0,0.35)",
          }}
        >
          <Image
            src="/images/home/calendar-cover.webp"
            alt=""
            fill
            unoptimized
            className="object-cover object-center"
            sizes="(max-width: 480px) 100vw, 480px"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(11,18,32,0.88) 0%, rgba(11,18,32,0.55) 42%, rgba(11,18,32,0.12) 72%, transparent 100%)",
            }}
          />
          <div className="relative z-[1] max-w-[62%] px-3.5 py-3.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" style={{ color: GOLD }} strokeWidth={2.2} />
              <p className="text-[15.5px] font-semibold" style={{ color: GOLD }}>
                ปฏิทินภาพรวม
              </p>
            </div>
            <p className="mt-1.5 text-[20px] font-semibold text-white">{monthLabel}</p>
            <p
              className="mt-1.5 text-[15.5px] font-medium leading-[1.45]"
              style={{ color: TEXT_MUTED }}
            >
              ดูจังหวะทั้งเดือนแบบรวดเร็ว เลือกวันที่เหมาะกับเรื่องสำคัญ
            </p>
          </div>
        </section>

        {/* ปฏิทิน */}
        <section
          className="mt-4 rounded-[22px] px-3 py-3.5"
          style={{
            background: "rgba(16, 24, 42, 0.88)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 12px 28px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex items-center justify-between gap-2 px-0.5">
            <button
              type="button"
              onClick={prevMonth}
              disabled={!premium}
              className="flex h-9 w-9 items-center justify-center rounded-full outline-none disabled:opacity-35"
              style={{ background: "rgba(232,209,154,0.1)" }}
              aria-label="เดือนก่อน"
            >
              <ChevronLeft className="h-5 w-5" style={{ color: GOLD }} />
            </button>
            <p className="text-[20px] font-semibold" style={{ color: GOLD }}>
              {monthLabel}
            </p>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-full outline-none"
              style={{ background: "rgba(232,209,154,0.1)" }}
              aria-label="เดือนถัดไป"
            >
              <ChevronRight className="h-5 w-5" style={{ color: GOLD }} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <p
                key={d}
                className="py-1 text-center text-[15.5px] font-medium"
                style={{ color: TEXT_MUTED }}
              >
                {d}
              </p>
            ))}
            {cells.map((cell, i) => {
              if (!cell) {
                return <div key={`e-${i}`} className="aspect-square" />;
              }
              const dayNum = Number(cell.iso.slice(-2));
              const isPast = cell.iso < todayIso;
              const isFuture = cell.iso > todayIso;
              const selected = cell.iso === activeIso;
              const lockedFuture = !premium && isFuture;
              const blockedPast = !premium && isPast;
              const holy = cell.markers.includes("holy");
              const dot = DOT[cell.energy];
              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => onSelectDay(cell.iso)}
                  disabled={blockedPast}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-[12px] outline-none transition",
                    blockedPast && "cursor-not-allowed opacity-35",
                    lockedFuture && "opacity-70",
                  )}
                  style={
                    selected
                      ? ({
                          border: "1.5px solid transparent",
                          backgroundImage:
                            "linear-gradient(165deg, rgba(36,28,12,0.72), rgba(16,24,42,0.96)), linear-gradient(145deg, #fff8e4 0%, #e8d19a 32%, #c9a227 68%, #8a6a32 100%)",
                          backgroundOrigin: "border-box",
                          backgroundClip: "padding-box, border-box",
                          boxShadow:
                            "0 2px 10px rgba(201,163,90,0.28), inset 0 1px 0 rgba(255,248,228,0.35)",
                        } as CSSProperties)
                      : {
                          background: lockedFuture
                            ? "rgba(213,177,111,0.06)"
                            : "rgba(255,255,255,0.03)",
                          border: lockedFuture
                            ? "1px solid rgba(232,209,154,0.28)"
                            : "1px solid rgba(213,177,111,0.08)",
                        }
                  }
                  aria-label={
                    blockedPast
                      ? `${dayNum} · ดูอดีตไม่ได้`
                      : lockedFuture
                        ? `${dayNum} · พรีเมียม`
                        : `${dayNum}`
                  }
                  aria-pressed={selected}
                >
                  {lockedFuture ? (
                    <Lock
                      className="absolute right-0.5 top-0.5 h-2.5 w-2.5"
                      style={{ color: GOLD }}
                      strokeWidth={2.4}
                    />
                  ) : holy ? (
                    <Sparkles
                      className="absolute right-0.5 top-0.5 h-2.5 w-2.5"
                      style={{ color: GOLD }}
                      strokeWidth={2.4}
                    />
                  ) : null}
                  <span
                    className="text-[15.5px] font-semibold leading-none"
                    style={{
                      color: selected
                        ? GOLD
                        : blockedPast
                          ? "rgba(242,246,255,0.45)"
                          : "#f2f6ff",
                    }}
                  >
                    {dayNum}
                  </span>
                  <span
                    className="mt-1 h-1.5 w-1.5 rounded-full"
                    style={{
                      background: blockedPast
                        ? "rgba(255,255,255,0.2)"
                        : dot.color,
                    }}
                  />
                </button>
              );
            })}
          </div>

          <div
            className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-dashed border-white/12 pt-3"
          >
            {LEGEND.map((l) => (
              <span key={l.label} className="inline-flex items-center gap-1.5 text-[15.5px]" style={{ color: TEXT_MUTED }}>
                <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 text-[15.5px]" style={{ color: TEXT_MUTED }}>
              <Sparkles className="h-3 w-3" style={{ color: GOLD }} strokeWidth={2.4} />
              วันพระ
            </span>
          </div>
        </section>

        {/* รายละเอียดวันที่เลือก */}
        <section
          className="mt-4 rounded-[22px] px-3.5 py-3.5"
          style={{
            background: "rgba(16, 24, 42, 0.88)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 shrink-0" style={{ color: GOLD }} strokeWidth={2.2} />
                <h2 className="text-[21px] font-semibold text-white">
                  ฤกษ์ · {selectedLabel}
                </h2>
              </div>
              <p className="mt-1 text-[15.5px] font-semibold" style={{ color: GOLD }}>
                {maeDay.dayCard.title}
              </p>
            </div>
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[14px] font-bold"
              style={{
                background: `${selectedDot.color}22`,
                color: selectedDot.color,
                boxShadow: `inset 0 0 0 1px ${selectedDot.color}66`,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: selectedDot.color }}
              />
              {selectedDot.label}
            </span>
          </div>

          <p
            className="mt-2.5 text-[15.5px] font-medium leading-[1.55]"
            style={{ color: TEXT_MUTED }}
          >
            {maeDay.dayCard.summary}
          </p>

          <p className="mt-2 text-[15.5px] font-medium leading-[1.55]" style={{ color: TEXT_MUTED }}>
            {adviceForDay(selectedProfile)}
          </p>

          {selectedProfile.markers.length > 0 ? (
            <ul className="mt-3 space-y-0">
              {selectedProfile.markers.map((m, i) => (
                <li
                  key={m}
                  className={cn(
                    "py-2.5",
                    i > 0 && "border-t border-dashed border-white/10",
                  )}
                >
                  <p className="text-[15.5px] font-semibold" style={{ color: GOLD }}>
                    {MARKER_META[m].label}
                  </p>
                  <p className="mt-1 text-[15.5px] font-medium leading-[1.55]" style={{ color: TEXT_MUTED }}>
                    {MARKER_META[m].hint}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-3 space-y-0 border-t border-dashed border-white/10 pt-1">
            <div className="flex items-start gap-2.5 py-2.5">
              <Sun className="mt-0.5 h-4.5 w-4.5 shrink-0" style={{ color: GOLD }} strokeWidth={2} />
              <div className="min-w-0 flex-1">
                <p className="text-[15.5px] font-semibold text-white">วันนี้ลอง</p>
                <p className="mt-1 text-[15.5px] font-medium leading-[1.55]" style={{ color: TEXT_MUTED }}>
                  {maeDay.dayCard.doNow}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 border-t border-dashed border-white/10 py-2.5">
              <Moon className="mt-0.5 h-4.5 w-4.5 shrink-0" style={{ color: GOLD }} strokeWidth={2} />
              <div className="min-w-0 flex-1">
                <p className="text-[15.5px] font-semibold text-white">ยังไม่ต้อง</p>
                <p className="mt-1 text-[15.5px] font-medium leading-[1.55]" style={{ color: TEXT_MUTED }}>
                  {maeDay.dayCard.avoid}
                </p>
              </div>
            </div>
          </div>

          {premium ? (
            <ul className="mt-1 space-y-0 border-t border-dashed border-white/10 pt-1">
              {maeDay.dailyAspects.map((row, i) => {
                const badge =
                  row.tone === "high"
                    ? { label: row.toneLabel, bg: "#b8e0c8", color: "#1f4a32" }
                    : row.tone === "mid"
                      ? { label: row.toneLabel, bg: "#f3d9a8", color: "#6b4a16" }
                      : { label: row.toneLabel, bg: "#f0c4cc", color: "#6b2a36" };
                return (
                  <li
                    key={row.id}
                    className={cn(
                      "py-2.5",
                      i > 0 && "border-t border-dashed border-white/10",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[17px] font-semibold text-white">{row.label}</p>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[13px] font-bold leading-none"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p
                      className="mt-1.5 text-[15.5px] font-medium leading-[1.55]"
                      style={{ color: TEXT_MUTED }}
                    >
                      {row.body}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <button
              type="button"
              onClick={() => setPayOpen(true)}
              className="mt-3 flex w-full items-center gap-2 rounded-[14px] px-2.5 py-2.5 text-left outline-none transition active:scale-[0.99]"
              style={{
                background: "rgba(213, 177, 111, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              <Lock className="h-4 w-4 shrink-0" style={{ color: GOLD }} strokeWidth={2.4} />
              <span className="min-w-0 flex-1">
                <span className="block text-[15.5px] font-semibold" style={{ color: GOLD }}>
                  ดวงรายวันเต็ม · พรีเมียม
                </span>
                <span
                  className="mt-0.5 block text-[15.5px] font-medium leading-[1.45]"
                  style={{ color: "rgba(186, 204, 230, 0.45)" }}
                >
                  กดวันอื่นได้ และอ่านงาน เงิน รัก สุขภาพ โชคของวันนั้น
                </span>
              </span>
            </button>
          )}
        </section>

        {/* ภาพรวมเดือน */}
        <section
          className="mt-4 rounded-[22px] px-3.5 py-3.5"
          style={{
            background: "rgba(16, 24, 42, 0.88)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <Sparkles className="h-4 w-4 shrink-0" style={{ color: GOLD }} strokeWidth={2.2} />
              <h2 className="text-[21px] font-semibold text-white">ภาพรวมดวงเดือนนี้</h2>
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[14px] font-bold"
              style={{ background: "#b8e0c8", color: "#1f4a32" }}
            >
              พลังธาตุสนับสนุน
            </span>
          </div>
          <p
            className="mt-2.5 text-[15.5px] font-medium leading-[1.55]"
            style={{ color: TEXT_MUTED }}
          >
            เดือนนี้เหมาะจัดลำดับเรื่องสำคัญให้ชัด ใช้วันหนุนเดินหน้า และเว้นวันที่เปราะบางไว้พักหรือเคลียร์ของค้าง
          </p>
          <ul className="mt-3 space-y-0">
            {[
              { Icon: Moon, label: "ธาตุประจำเดือน", value: "ธาตุไฟ" },
              { Icon: Sun, label: "วันดีเด่น", value: goodDays },
              { Icon: CalendarDays, label: "วันที่ควรระวัง", value: cautionDays },
              { Icon: HeartPulse, label: "ดูแลสุขภาพ", value: "หัวใจ" },
            ].map((row, i) => (
              <li
                key={row.label}
                className={cn(
                  "flex items-center gap-2.5 py-2.5",
                  i > 0 && "border-t border-dashed border-white/10",
                )}
              >
                <row.Icon className="h-4.5 w-4.5 shrink-0" style={{ color: GOLD }} strokeWidth={2} />
                <span className="min-w-0 flex-1 text-[15.5px]" style={{ color: TEXT_MUTED }}>
                  {row.label}
                </span>
                <span className="max-w-[55%] text-right text-[15.5px] font-semibold text-white">
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ภาพรวมปี */}
        <section
          className="mt-3 rounded-[22px] px-3.5 py-3.5"
          style={{
            background: "rgba(16, 24, 42, 0.88)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <Sparkles className="h-4 w-4 shrink-0" style={{ color: GOLD }} strokeWidth={2.2} />
              <h2 className="text-[21px] font-semibold text-white">
                ภาพรวมปีนี้ {year + 543}
              </h2>
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[14px] font-bold"
              style={{ background: "#b8e0c8", color: "#1f4a32" }}
            >
              พลังธาตุสนับสนุน
            </span>
          </div>
          <p className="mt-2.5 text-[15.5px] font-medium leading-[1.55]" style={{ color: TEXT_MUTED }}>
            ปีนี้เน้นเดินเรื่องด้วยความตั้งใจและความรับผิดชอบ โอกาสเปิดเมื่อคุณจัดระบบได้ชัด
            ค่อย ๆ สะสมผล ไม่เร่งจนเสียจังหวะ และเว้นช่วงเปราะบางไว้พักหรือเคลียร์ของค้างก่อนเปิดเรื่องใหญ่
          </p>
          <ul className="mt-3 space-y-0">
            {[
              {
                id: "work" as const,
                title: "การงาน",
                tone: "high" as const,
                preview:
                  "มีโอกาสขยับหน้าที่หรือรับโปรเจกต์ที่มองเห็นผลเมื่อทำงานต่อเนื่องและสื่อสารชัด แต่ระวังรับหลายอย่างพร้อมกันจนคุณภาพตก",
              },
              {
                id: "money" as const,
                title: "การเงิน",
                tone: "mid" as const,
                preview:
                  "รายได้โตตามภาระที่รับได้จริง ถ้าคุมรายจ่ายเป็นระบบและไม่ใช้เงินล่วงหน้าก่อนเข้าจริง แต่ระวังช่วยเหลือคนอื่นหรือจ่ายตามอารมณ์จนเงินส่วนตัวบาง",
              },
              {
                id: "love" as const,
                title: "ความรัก",
                tone: "mid" as const,
                preview:
                  "ความสัมพันธ์นิ่งขึ้นเมื่อพูดความต้องการตรง ๆ และให้เวลาคุณภาพโดยไม่เร่งผูกมัด แต่ระวังอ่านสัญญาณเกินจริงหรือเก็บเรื่องค้างใจจนอีกฝ่ายเดาไม่ถูก",
              },
              {
                id: "health" as const,
                title: "สุขภาพ",
                tone: "low" as const,
                preview:
                  "วินัยการพัก นอน และการดูแลหัวใจสำคัญกว่าเร่งผลระยะสั้น พลังฟื้นได้ถ้าไม่ฝืนต่อเนื่อง แต่ระวังเครียดสะสมที่คอ ไหล่ และนอนไม่พอ",
              },
            ].map((row, i) => {
              const badge =
                row.tone === "high"
                  ? { label: "หนุนเต็มที่", bg: "#b8e0c8", color: "#1f4a32" }
                  : row.tone === "mid"
                    ? { label: "ระวัง", bg: "#f3d9a8", color: "#6b4a16" }
                    : { label: "เปราะบาง", bg: "#f0c4cc", color: "#6b2a36" };
              const tip = yearTips?.[row.id];
              return (
              <li
                key={row.title}
                className={cn(
                  "py-2.5",
                  i > 0 && "border-t border-dashed border-white/10",
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-nowrap items-center gap-2">
                    <p className="shrink-0 text-[20px] font-semibold text-white">{row.title}</p>
                    <span
                      className="inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[14px] font-bold leading-none"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[15.5px] font-medium leading-[1.55]" style={{ color: TEXT_MUTED }}>
                    {row.preview}
                  </p>
                  {premium && tip ? (
                    <p className="mt-1.5 text-[15.5px] font-medium leading-[1.55]" style={{ color: GOLD }}>
                      <span className="font-semibold">คำแนะนำของแม่ · </span>
                      {tip}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPayOpen(true)}
                      className="mt-1.5 flex w-full items-center gap-2 rounded-[14px] px-2.5 py-2.5 text-left outline-none transition active:scale-[0.99]"
                      style={{
                        background: "rgba(213, 177, 111, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                      }}
                      aria-label={`ปลดล็อกคำแนะนำของแม่ · ${row.title}`}
                    >
                      <Lock
                        className="h-4 w-4 shrink-0"
                        style={{ color: GOLD }}
                        strokeWidth={2.4}
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className="block text-[15.5px] font-semibold"
                          style={{ color: GOLD }}
                        >
                          คำแนะนำของแม่ · พรีเมียม
                        </span>
                        <span
                          className="mt-0.5 block text-[15.5px] font-medium leading-[1.45]"
                          style={{ color: "rgba(186, 204, 230, 0.45)" }}
                          aria-hidden
                        >
                          ปลดล็อกเพื่ออ่านคำแนะนำเฉพาะด้านนี้
                        </span>
                      </span>
                    </button>
                  )}
                </div>
              </li>
              );
            })}
          </ul>
        </section>

        <p className="mt-5 text-center text-[15.5px]" style={{ color: "rgba(186,204,230,0.45)" }}>
          แตะวันที่บนปฏิทินเพื่ออ่านฤกษ์ของวันนั้น
        </p>
        </AnimatedPage>

        <FixedAppBottomNav activeId="profile" />

        <FortunePaymentSheet
          open={payOpen}
          onClose={() => setPayOpen(false)}
          onPaid={() => {
            setPremiumUnlocked({ birthDate, nickname });
            setPremium(true);
            setPayOpen(false);
          }}
          returnPath="/calendar"
        />
      </div>
    </div>
  );
}
