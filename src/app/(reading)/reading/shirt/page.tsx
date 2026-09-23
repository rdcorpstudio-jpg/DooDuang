"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Lock, Share2 } from "lucide-react";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { MaeOpenLight, useMaeOpenLight } from "@/components/fortune/mae-open-light";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { composeMaeDay } from "@/lib/fortune/content/compose-mae-day";
import {
  isPremiumUnlocked,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import {
  hydrateFortuneProfileFromWizard,
  readFortuneProfile,
} from "@/lib/fortune/profile-storage";
import { poloShirtSrcForColorName } from "@/lib/fortune/polo-shirt-asset";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

const GOLD_SOFT = "#e8d19a";
const GOLD_DEEP = "#c9a35a";
const TEXT_MUTED = "rgba(186, 204, 230, 0.78)";
const TEXT_BODY = "rgba(220, 230, 245, 0.92)";
const GOLD_BTN =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";
const GOLD_BTN_SHADOW =
  "inset 0 1px 0 rgba(255,255,255,0.28), 0 6px 16px rgba(143, 110, 56, 0.28)";

const FALLBACK_BIRTH = "1995-03-15";

/** วันเลื่อนได้สำหรับพรีเมียม: เมื่อวาน → อีก 3 วัน */
const DAY_OFFSETS = [-1, 0, 1, 2, 3] as const;

function shiftDate(base: Date, days: number) {
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

function formatThaiDayLabel(offset: number) {
  if (offset === 0) return "วันนี้";
  if (offset === -1) return "เมื่อวาน";
  if (offset === 1) return "พรุ่งนี้";
  if (offset === 2) return "2 วัน";
  if (offset === 3) return "3 วัน";
  return `${offset} วัน`;
}

function ShirtIcon({
  name,
  size,
  ring = false,
}: {
  name: string;
  size: number;
  ring?: boolean;
}) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[14px]"
      style={{
        width: size,
        height: size,
        boxShadow: ring
          ? "0 0 0 2px rgba(232,209,154,0.55), 0 8px 20px rgba(0,0,0,0.25)"
          : "0 6px 16px rgba(0,0,0,0.2)",
      }}
      title={name}
    >
      <Image
        src={poloShirtSrcForColorName(name)}
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain"
        unoptimized
      />
    </span>
  );
}

function glassCard(extra?: CSSProperties): CSSProperties {
  return {
    background:
      "linear-gradient(155deg, rgba(10,26,48,0.72) 0%, rgba(4,14,30,0.66) 100%)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 40px rgba(0,0,0,0.28)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    ...extra,
  };
}

/**
 * สีเสื้อมงคล — สีเด่นฟรี · ทุกด้าน + ดูวันอื่นเป็นพรีเมียม
 */
function LuckyShirtPageInner() {
  const { token, flash } = useMaeOpenLight();
  const [ready, setReady] = useState(false);
  const [premium, setPremium] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [birthDate, setBirthDate] = useState(FALLBACK_BIRTH);
  const [birthTime, setBirthTime] = useState<string | undefined>();
  const [birthPlace, setBirthPlace] = useState<string | undefined>();
  const [gender, setGender] = useState<string | undefined>();
  const [focus, setFocus] = useState<string | undefined>("life");
  const [hasBirthProfile, setHasBirthProfile] = useState(false);
  const [nickname, setNickname] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [dayOffset, setDayOffset] = useState(0);
  const [now] = useState(() => new Date());

  function syncProfile() {
    hydrateFortuneProfileFromWizard();
    const p = readFortuneProfile();
    if (p?.birthDate) {
      setBirthDate(p.birthDate);
      setHasBirthProfile(true);
    } else {
      setBirthDate(FALLBACK_BIRTH);
      setHasBirthProfile(false);
    }
    setBirthTime(p?.birthTime?.trim() || undefined);
    setBirthPlace(p?.birthPlace?.trim() || undefined);
    setGender(p?.gender || undefined);
    setFocus(p?.focus || "life");
    if (p?.nickname) setNickname(p.nickname);
    setPremium(
      isPremiumUnlocked(
        p ? { birthDate: p.birthDate, nickname: p.nickname } : null,
      ),
    );
    setReady(true);
  }

  useEffect(() => {
    syncProfile();
    flash();
  }, [flash]);

  useStripePaymentReturn(() => {
    const p = readFortuneProfile();
    setPremiumUnlocked(
      p ? { birthDate: p.birthDate, nickname: p.nickname } : null,
    );
    setPremium(true);
    setPayOpen(false);
  });

  const asOf = useMemo(() => shiftDate(now, dayOffset), [now, dayOffset]);

  const maeDay = useMemo(
    () =>
      composeMaeDay({
        birthDate,
        birthTime,
        birthPlace,
        nickname,
        gender,
        focus,
        asOf,
        premium,
      }),
    [birthDate, birthTime, birthPlace, nickname, gender, focus, asOf, premium],
  );

  const shirt = maeDay.luckyShirt;
  const isToday = dayOffset === 0;
  const dayLabel = isToday
    ? "วันนี้"
    : `${formatThaiDayLabel(dayOffset)} · ${asOf.getDate()}/${asOf.getMonth() + 1}`;
  const showingToday = selectedGroupId == null;
  /** ฟรีอ่านคำแนะนำสีเด่นได้ · ด้านอื่นต้องพรีเมียม */
  const showFullNote = premium || showingToday;

  const activeGroup =
    selectedGroupId == null
      ? null
      : (shirt.groups.find((g) => g.id === selectedGroupId) ?? null);

  const heroTitle = showingToday
    ? shirt.todaySupportLabel
    : (activeGroup?.label ?? shirt.todaySupportLabel);
  const heroColors = showingToday
    ? [{ name: shirt.todayColorName, hex: shirt.todayColorHex }]
    : (activeGroup?.colors ?? []);
  const heroColorText = showingToday
    ? shirt.todayColorName
    : (activeGroup?.colorsText ?? shirt.todayColorName);
  const heroNote = showingToday
    ? shirt.todayNote
    : (activeGroup?.note ?? shirt.todayNote);
  const heroForbidden = Boolean(activeGroup?.forbidden);
  const wash = heroColors[0]?.hex ?? shirt.todayColorHex;

  function selectDay(offset: number) {
    if (offset !== 0 && !premium) {
      setPayOpen(true);
      return;
    }
    setDayOffset(offset);
    setSelectedGroupId(null);
  }

  function selectGroup(id: string) {
    setSelectedGroupId((cur) => (cur === id ? null : id));
  }

  async function shareToday() {
    const text = `สีเสื้อมงคล${isToday ? "วันนี้" : ` · ${dayLabel}`} · ${shirt.todayColorName}\n${shirt.todayNote}\n— แม่มังมี`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "สีเสื้อมงคล", text });
        return;
      }
    } catch {
      /* cancelled */
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative h-full overflow-y-auto overscroll-contain text-white">
      <MaePageBackground />
      {token > 0 ? <MaeOpenLight key={token} /> : null}

      <div className="relative z-[1] mx-auto w-full max-w-[480px] px-4 pb-20 pt-1.5 sm:px-5">
        <header className="relative flex min-h-[3.5rem] items-start justify-between gap-3 pt-1">
          <div className="relative z-[1] shrink-0">
            <MaeBrandLink />
          </div>
          <div className="pointer-events-none absolute inset-x-11 top-0 text-center">
            <h1
              className="mae-gold-text text-[1.45rem] font-bold tracking-wide"
              style={{
                lineHeight: 1.55,
                paddingTop: "0.18em",
                paddingBottom: "0.06em",
                overflow: "visible",
              }}
            >
              สีเสื้อมงคล
            </h1>
            <p
              className="-mt-0.5 text-[13px] font-medium leading-snug"
              style={{ color: TEXT_MUTED }}
            >
              {isToday ? "เลือกสีให้เข้ากับจังหวะวันนี้" : `กำลังดู · ${dayLabel}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void shareToday()}
            className="relative z-[1] inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full outline-none transition active:scale-95"
            style={{
              background: "rgba(255,255,255,0.06)",
              boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.22)",
            }}
            aria-label="แชร์สีวันนี้"
          >
            <Share2 className="h-4 w-4" style={{ color: GOLD_SOFT }} strokeWidth={2} />
          </button>
        </header>

        {!ready ? (
          <p className="mt-10 text-center text-[15px]" style={{ color: TEXT_MUTED }}>
            กำลังเปิด…
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {!hasBirthProfile ? (
              <Link
                href="/reading"
                className="flex items-start gap-3 rounded-[18px] px-3.5 py-3 outline-none transition active:scale-[0.99]"
                style={glassCard({
                  boxShadow:
                    "inset 0 0 0 1px rgba(232,209,154,0.28), 0 12px 28px rgba(0,0,0,0.22)",
                })}
              >
                <CalendarDays
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: GOLD_SOFT }}
                  strokeWidth={2.1}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold text-white">
                    ยังไม่ได้ใส่วันเกิด
                  </span>
                  <span
                    className="mt-0.5 block text-[13px] leading-snug"
                    style={{ color: TEXT_MUTED }}
                  >
                    แตะเพื่อกรอก — จะได้สีที่ตรงกับคุณ ไม่ใช่ตัวอย่างทั่วไป
                  </span>
                </span>
                <ChevronRight
                  className="mt-1 h-4 w-4 shrink-0"
                  style={{ color: GOLD_DEEP }}
                  strokeWidth={2.2}
                />
              </Link>
            ) : null}

            <div className="rounded-[20px] px-2.5 py-2.5" style={glassCard()}>
              <div className="mb-2 flex items-center justify-between px-1">
                <p
                  className="text-[12.5px] font-semibold tracking-wide"
                  style={{ color: GOLD_SOFT }}
                >
                  เลือกวัน
                </p>
                {!isToday ? (
                  <button
                    type="button"
                    onClick={() => selectDay(0)}
                    className="text-[12.5px] font-semibold outline-none"
                    style={{ color: GOLD_DEEP }}
                  >
                    กลับวันนี้
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-5 gap-1">
                {DAY_OFFSETS.map((offset) => {
                  const d = shiftDate(now, offset);
                  const active = dayOffset === offset;
                  const locked = offset !== 0 && !premium;
                  return (
                    <button
                      key={offset}
                      type="button"
                      onClick={() => selectDay(offset)}
                      className={cn(
                        "relative flex w-full flex-col items-center justify-center rounded-[12px] px-0.5 pb-1.5 pt-2 outline-none transition active:scale-[0.98]",
                        active
                          ? "bg-[rgba(232,209,154,0.16)]"
                          : "bg-[rgba(255,255,255,0.04)]",
                      )}
                    >
                      {locked ? (
                        <Lock
                          className="absolute right-0.5 top-0.5 h-2.5 w-2.5"
                          style={{ color: "rgba(232,209,154,0.65)" }}
                          strokeWidth={2.4}
                        />
                      ) : null}
                      <span
                        className="text-center text-[11px] font-semibold leading-[1.45]"
                        style={{
                          color: active ? GOLD_SOFT : TEXT_MUTED,
                          paddingTop: "0.06em",
                        }}
                      >
                        {formatThaiDayLabel(offset)}
                      </span>
                      <span
                        className="mt-0.5 text-[10.5px] tabular-nums leading-none"
                        style={{
                          color: active ? "#f0f4fa" : "rgba(186,204,230,0.55)",
                        }}
                      >
                        {d.getDate()}/{d.getMonth() + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <section
              className="relative overflow-hidden rounded-[24px] px-4 pb-4 pt-4 text-center"
              style={glassCard()}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.22]"
                style={{
                  background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${wash} 0%, transparent 70%)`,
                }}
                aria-hidden
              />
              <div className="relative z-[1]">
                {!showingToday ? (
                  <button
                    type="button"
                    onClick={() => setSelectedGroupId(null)}
                    className="mb-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold outline-none"
                    style={{
                      color: GOLD_SOFT,
                      background: "rgba(232,209,154,0.12)",
                    }}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
                    กลับสีเด่น{isToday ? "วันนี้" : ` · ${dayLabel}`}
                  </button>
                ) : null}

                <p
                  className="text-[13.5px] font-semibold tracking-wide"
                  style={{ color: GOLD_SOFT }}
                >
                  {heroTitle}
                </p>

                <div className="mx-auto mt-3.5 flex items-center justify-center gap-2.5">
                  {heroColors.map((c) => (
                    <ShirtIcon
                      key={c.name}
                      name={c.name}
                      size={heroColors.length > 1 ? 76 : 118}
                      ring={c.name === heroColors[0]?.name}
                    />
                  ))}
                </div>

                <p className="mt-3.5 text-[1.55rem] font-bold leading-tight text-white">
                  {heroColorText}
                </p>
                <p
                  className="mt-1 text-[14.5px] font-semibold"
                  style={{
                    color: heroForbidden ? "#f0a8b0" : GOLD_DEEP,
                  }}
                >
                  {heroForbidden
                    ? "วันนี้ยังไม่เหมาะ"
                    : showingToday
                      ? `สีเด่น · ${shirt.todayColorName}`
                      : activeGroup?.label}
                </p>

                {showFullNote ? (
                  <div className="mt-4 space-y-2.5 text-left">
                    <div
                      className="rounded-[16px] px-3.5 py-3"
                      style={{
                        background: "rgba(6,14,28,0.55)",
                        boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.16)",
                      }}
                    >
                      <p
                        className="text-[12.5px] font-semibold tracking-wide"
                        style={{ color: GOLD_SOFT }}
                      >
                        {heroForbidden ? "ที่แม่ไม่แนะนำ" : "แม่แนะนำไว้"}
                      </p>
                      <p
                        className="mt-1.5 text-[15px] leading-[1.55]"
                        style={{ color: TEXT_BODY }}
                      >
                        {heroNote}
                      </p>
                    </div>
                    {!heroForbidden ? (
                      <p
                        className="px-0.5 text-[13.5px] leading-snug"
                        style={{ color: TEXT_MUTED }}
                      >
                        ใส่โทน{heroColors[0]?.name ?? shirt.todayColorName}
                        เป็นชั้นนอก เนคไท กระเป๋า หรือจุดสีที่เห็นชัด
                        {showingToday
                          ? " ให้สอดคล้องกับพลังวันนี้"
                          : ` ให้สอดคล้องกับ${(activeGroup?.label ?? "").replace(/^หนุน/, "")}`}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-4 space-y-2.5 text-left">
                    <div
                      className="rounded-[16px] px-3.5 py-3"
                      style={{
                        background: "rgba(6,14,28,0.45)",
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                      }}
                    >
                      <p
                        className="text-[13.5px] leading-snug"
                        style={{ color: TEXT_MUTED }}
                      >
                        เห็นสีแล้ว · ปลดล็อกเพื่ออ่านเหตุผลของ「{heroColorText}」
                        และดูสีวันอื่นล่วงหน้า
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPayOpen(true)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-[15px] font-bold outline-none transition active:scale-[0.99]"
                      style={{
                        color: "#1a1408",
                        background: GOLD_BTN,
                        boxShadow: GOLD_BTN_SHADOW,
                      }}
                    >
                      <Lock className="h-4 w-4" strokeWidth={2.2} />
                      เปิดทั้งหมด · {FORTUNE_UNLOCK_PRICE} บาท
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[22px] px-3 py-3.5" style={glassCard()}>
              <div className="mb-1 flex items-center justify-between px-1">
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: GOLD_SOFT }}
                >
                  สีแต่ละด้าน
                </p>
                {!premium ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{
                      color: GOLD_SOFT,
                      background: "rgba(232,209,154,0.1)",
                    }}
                  >
                    <Lock className="h-2.5 w-2.5" strokeWidth={2.4} />
                    พรีเมียม
                  </span>
                ) : null}
              </div>
              <ul className="mt-1">
                {shirt.groups.map((group, i) => {
                  const active = selectedGroupId === group.id;
                  return (
                    <li key={group.id}>
                      <button
                        type="button"
                        onClick={() => selectGroup(group.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-[14px] px-1.5 py-2.5 text-left outline-none transition",
                          i > 0 && "border-t border-dashed border-white/[0.08]",
                          active && "bg-[rgba(232,209,154,0.1)]",
                        )}
                        aria-pressed={active}
                      >
                        <div className="flex items-end gap-0.5">
                          {group.colors.map((c) => (
                            <ShirtIcon key={c.name} name={c.name} size={34} />
                          ))}
                        </div>
                        <span
                          className={cn(
                            "min-w-0 flex-1 text-[15px] font-semibold",
                            group.forbidden ? "text-[#f0a8b0]" : "text-white/92",
                          )}
                        >
                          {group.label}
                        </span>
                        <span
                          className="max-w-[40%] truncate text-right text-[13.5px] font-medium"
                          style={{ color: TEXT_MUTED }}
                        >
                          {group.colorsText}
                        </span>
                        {!premium ? (
                          <Lock
                            className="h-3 w-3 shrink-0"
                            style={{ color: "rgba(232,209,154,0.45)" }}
                            strokeWidth={2.3}
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {!premium ? (
                <p
                  className="mt-2 px-1 text-[12.5px] leading-snug"
                  style={{ color: "rgba(186,204,230,0.5)" }}
                >
                  ฟรีดูสีเด่นวันนี้ · พรีเมียมอ่านทุกด้าน + ดูสีวันอื่น
                </p>
              ) : null}
            </section>

            {nickname && hasBirthProfile ? (
              <p
                className="text-center text-[12px]"
                style={{ color: "rgba(186,204,230,0.4)" }}
              >
                คำนวณจากโปรไฟล์ · {nickname}
              </p>
            ) : null}
          </div>
        )}

        <FortunePaymentSheet
          open={payOpen}
          onClose={() => setPayOpen(false)}
          onPaid={() => {
            const p = readFortuneProfile();
            setPremiumUnlocked(
              p ? { birthDate: p.birthDate, nickname: p.nickname } : null,
            );
            setPremium(true);
            setPayOpen(false);
          }}
          returnPath="/reading/shirt"
        />
      </div>
    </div>
  );
}

export default function LuckyShirtPage() {
  return (
    <Suspense
      fallback={
        <div
          className="px-4 py-10 text-center text-[15px]"
          style={{ color: TEXT_MUTED }}
        >
          กำลังเปิด…
        </div>
      }
    >
      <LuckyShirtPageInner />
    </Suspense>
  );
}
