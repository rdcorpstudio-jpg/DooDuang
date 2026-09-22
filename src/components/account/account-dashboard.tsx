"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  Clock,
  Crown,
  LogOut,
  MapPin,
  Pencil,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  GENDER_OPTIONS,
  type Gender,
} from "@/components/ui/sacred-form";
import { BirthDatePicker } from "@/components/fortune/birth-date-picker";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import { ZodiacSignImage } from "@/components/fortune/zodiac-sign-image";
import { AccountAuthLinks } from "@/components/account/account-auth-links";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { AnimatedPage } from "@/components/ui/reveal";
import { getZodiacByBirthDate } from "@/lib/fortune/zodiac";
import {
  canEditFortuneProfile,
  hydrateFortuneProfileFromWizard,
  profileEditCooldownDaysLeft,
  PROFILE_EDIT_COOLDOWN_MS,
  readFortuneProfile,
  syncFortuneProfileWithServer,
  writeFortuneProfile,
  type FortuneUserProfile,
} from "@/lib/fortune/profile-storage";
import {
  clearPremiumUnlocked,
  getPremiumUnlockedUntil,
  setPremiumUnlocked,
  syncPremiumFromServer,
} from "@/lib/fortune/premium-unlock";
import { MAE_GLASS, maeGlassStyle } from "@/lib/mae-glass";
import { FORTUNE_PACKAGE_LABEL, FORTUNE_UNLOCK_PRICE, LINE_OA_ADD_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { trackClientEvent } from "@/lib/analytics/client";

const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const MUTED = "rgba(186, 204, 230, 0.72)";

const TILE = {
  background: "rgba(255,255,255,0.04)",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
} as const;

type AccountUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  credits: number;
};

function LineMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("h-5 w-5", className)}
      fill="currentColor"
    >
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386a.63.63 0 0 1-.63-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94a.63.63 0 0 1-.63.629.63.63 0 0 1-.63-.629V8.108c0-.27.173-.51.43-.595.063-.022.136-.033.2-.033.211 0 .391.09.51.25l2.445 3.32V8.108c0-.345.282-.63.63-.63.348 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.63.629-.348 0-.63-.285-.63-.629V8.108c0-.345.282-.63.63-.63.348 0 .63.285.63.63v4.771zm-2.466.629H4.917c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.957 12 .957S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function formatBirthThai(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function genderLabel(gender: string, note?: string) {
  const base = GENDER_OPTIONS.find((g) => g.id === gender)?.label ?? "—";
  if (gender === "other" && note?.trim()) return `${base} · ${note.trim()}`;
  return base;
}

/** Logged-in account / profile — Mae navy-gold account panel */
export function AccountDashboard({
  user,
}: {
  user: AccountUser;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<FortuneUserProfile | null>(null);
  const [premium, setPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState<Date | null>(null);
  const [trialActive, setTrialActive] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [payOpen, setPayOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    realName: "",
    nickname: "",
    birthDate: "",
    gender: "" as Gender | "",
    genderNote: "",
  });

  useEffect(() => {
    void (async () => {
      const synced = await syncFortuneProfileWithServer();
      const loaded =
        synced ??
        hydrateFortuneProfileFromWizard() ??
        readFortuneProfile();
      setProfile(loaded);
      void (async () => {
        const premiumOn = await syncPremiumFromServer(
          loaded
            ? { birthDate: loaded.birthDate, nickname: loaded.nickname }
            : null
        );
        setPremium(premiumOn);
        setPremiumUntil(getPremiumUnlockedUntil());
        try {
          const res = await fetch("/api/premium/status", { cache: "no-store" });
          const data = (await res.json()) as {
            premium?: boolean;
            trialActive?: boolean;
            trialDaysLeft?: number;
            untilMs?: number | null;
          };
          if (typeof data.premium === "boolean") setPremium(data.premium);
          setTrialActive(Boolean(data.trialActive) && !data.premium);
          setTrialDaysLeft(
            typeof data.trialDaysLeft === "number" ? data.trialDaysLeft : 0
          );
          if (data.untilMs) setPremiumUntil(new Date(data.untilMs));
        } catch {
          /* ignore */
        }
      })();
      if (loaded) {
        setDraft({
          realName: loaded.realName,
          nickname: loaded.nickname,
          birthDate: loaded.birthDate,
          gender: loaded.gender,
          genderNote: loaded.genderNote ?? "",
        });
      } else {
        setEditing(true);
      }
    })();
  }, []);

  function applyPremiumUnlock() {
    setPremiumUnlocked(
      profile
        ? { birthDate: profile.birthDate, nickname: profile.nickname }
        : null
    );
    setPremium(true);
    setPremiumUntil(getPremiumUnlockedUntil());
    setPayOpen(false);
  }

  useStripePaymentReturn(applyPremiumUnlock);

  const zodiac = useMemo(
    () => (profile?.birthDate ? getZodiacByBirthDate(profile.birthDate) : null),
    [profile?.birthDate]
  );

  const displayName =
    profile?.nickname?.trim() ||
    profile?.realName?.trim() ||
    user.name?.trim() ||
    "สมาชิก";

  const editAllowed = canEditFortuneProfile(profile);
  const cooldownDays = profileEditCooldownDaysLeft(profile);

  function openEdit() {
    if (!editAllowed) return;
    setSaveError(null);
    setDraft({
      realName: profile?.realName ?? "",
      nickname: profile?.nickname ?? "",
      birthDate: profile?.birthDate ?? "",
      gender: profile?.gender ?? "",
      genderNote: profile?.genderNote ?? "",
    });
    setEditing(true);
  }

  function saveProfile() {
    setSaveError(null);
    if (!draft.nickname.trim()) {
      setSaveError("กรอกชื่อเล่นก่อนบันทึก");
      return;
    }
    if (!draft.birthDate) {
      setSaveError("เลือกวันเกิดก่อนบันทึก");
      return;
    }
    if (!draft.gender) {
      setSaveError("เลือกเพศก่อนบันทึก");
      return;
    }
    if (draft.gender === "other" && !draft.genderNote.trim()) {
      setSaveError("ระบุเพศเพิ่มเติมก่อนบันทึก");
      return;
    }
    if (profile && !canEditFortuneProfile(profile)) {
      setSaveError(
        `แก้ไขโปรไฟล์ได้อีกครั้งในอีก ${profileEditCooldownDaysLeft(profile)} วัน`
      );
      setEditing(false);
      return;
    }

    const existing = readFortuneProfile();
    const next = writeFortuneProfile({
      realName: draft.realName,
      nickname: draft.nickname,
      birthDate: draft.birthDate,
      gender: draft.gender,
      genderNote:
        draft.gender === "other" ? draft.genderNote.trim() : undefined,
      birthTime: existing?.birthTime,
      birthPlace: existing?.birthPlace,
      focus: existing?.focus,
      deepenSkipped: existing?.deepenSkipped,
      // One save → lock for 3 weeks
      profileLockedUntil: new Date(
        Date.now() + PROFILE_EDIT_COOLDOWN_MS
      ).toISOString(),
    });

    // Confirm persistence
    const verified = readFortuneProfile();
    if (
      !verified ||
      verified.nickname !== next.nickname ||
      verified.birthDate !== next.birthDate ||
      verified.gender !== next.gender
    ) {
      setSaveError("บันทึกไม่สำเร็จ ลองปิดโหมดไม่ระบุตัวตนแล้วเปิดใหม่");
      return;
    }

    setProfile(verified);
    setDraft({
      realName: verified.realName,
      nickname: verified.nickname,
      birthDate: verified.birthDate,
      gender: verified.gender,
      genderNote: verified.genderNote ?? "",
    });
    setEditing(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      clearPremiumUnlocked();
      router.replace("/?from=logout");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  const membershipLabel = premium
    ? "Premium"
    : trialActive
      ? `ทดลองฟรี · เหลือ ${trialDaysLeft} วัน`
      : "สมาชิกทั่วไป";

  const premiumUntilLabel =
    premiumUntil &&
    new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(premiumUntil);

  return (
    <AnimatedPage className="relative mx-auto w-full max-w-[480px]">
      <MaePageBackground />
      <div className="relative z-10 space-y-4 px-4 pb-12 pt-3">
        <header className="flex items-center justify-between gap-3 px-0.5">
          <MaeBrandLink />
          <p
            className="text-[12px] font-semibold tracking-[0.18em]"
            style={{ color: "rgba(232,209,154,0.8)" }}
          >
            โปรไฟล์
          </p>
        </header>

        {/* Identity hero */}
        <section
          className="relative overflow-hidden rounded-[26px] px-5 pb-5 pt-6 text-center"
          style={maeGlassStyle}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(232,209,154,0.18) 0%, transparent 68%)",
            }}
          />
          <div className="relative z-[1] mx-auto h-[5.25rem] w-[5.25rem]">
            <div
              className="relative h-full w-full overflow-hidden rounded-full"
              style={{
                boxShadow:
                  "0 0 0 2px rgba(232,209,154,0.55), 0 0 0 6px rgba(232,209,154,0.12), 0 12px 28px rgba(0,0,0,0.28)",
              }}
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span
                  className="flex h-full w-full items-center justify-center"
                  style={{ background: "rgba(232,209,154,0.12)" }}
                >
                  <UserRound className="h-9 w-9" style={{ color: GOLD }} strokeWidth={1.6} />
                </span>
              )}
            </div>
          </div>

          <h1
            className="relative z-[1] mt-4 text-[1.65rem] font-bold leading-tight tracking-tight"
            style={TITLE_GOLD}
          >
            คุณ{displayName}
          </h1>
          <p className="relative z-[1] mt-1 truncate text-[13.5px]" style={{ color: MUTED }}>
            {user.email ?? "เข้าสู่ระบบแล้ว"}
          </p>

          <p
            className="relative z-[1] mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
            style={{
              color: GOLD,
              background: "rgba(232,209,154,0.12)",
              boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.4)",
            }}
          >
            {premium || trialActive ? (
              <Crown className="h-3.5 w-3.5" strokeWidth={2.2} />
            ) : (
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
            )}
            {membershipLabel}
          </p>
        </section>

        {/* Membership / trial */}
        <section
          className="overflow-hidden rounded-[22px] px-4 py-4"
          style={maeGlassStyle}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p
                className="text-[12px] font-semibold tracking-[0.12em]"
                style={{ color: "rgba(232,209,154,0.78)" }}
              >
                สิทธิ์ใช้งาน
              </p>
              {premium ? (
                <>
                  <p className="mt-1.5 text-[1.15rem] font-semibold text-[#f7f4ec]">
                    Premium {FORTUNE_PACKAGE_LABEL}
                  </p>
                  <p className="mt-0.5 text-[13px]" style={{ color: MUTED }}>
                    {premiumUntilLabel ? `ใช้ได้ถึง ${premiumUntilLabel}` : "ใช้งานอยู่"}
                  </p>
                </>
              ) : trialActive ? (
                <>
                  <p className="mt-1.5 flex items-baseline gap-2 text-[#f7f4ec]">
                    <span
                      className="text-[2.35rem] font-bold tabular-nums leading-none"
                      style={TITLE_GOLD}
                    >
                      {trialDaysLeft}
                    </span>
                    <span className="text-[15px] font-semibold">วันทดลองเหลือ</span>
                  </p>
                  <p className="mt-1 text-[13px]" style={{ color: MUTED }}>
                    ใช้ฟีเจอร์ฟรีได้จนกว่าจะครบ · AI / วอลเปเปอร์ยังล็อก
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1.5 text-[1.15rem] font-semibold text-[#f7f4ec]">
                    ยังไม่เปิดทดลอง / พรีเมียม
                  </p>
                  <p className="mt-0.5 text-[13px]" style={{ color: MUTED }}>
                    ปลดล็อกครบทุกฟีเจอร์ ฿{FORTUNE_UNLOCK_PRICE}
                  </p>
                </>
              )}
            </div>
            {!premium ? (
              <button
                type="button"
                onClick={() => setPayOpen(true)}
                className="mae-gold-cta inline-flex h-10 shrink-0 items-center gap-1 rounded-full px-3.5 text-[13px] font-bold tracking-wide outline-none transition active:scale-[0.98]"
              >
                <Crown className="h-3.5 w-3.5" strokeWidth={2.3} />
                Premium
              </button>
            ) : (
              <Link
                href="/home"
                className="inline-flex h-10 shrink-0 items-center gap-0.5 rounded-full px-3.5 text-[13px] font-semibold outline-none transition active:scale-[0.98]"
                style={{
                  color: GOLD,
                  background: "rgba(232,209,154,0.1)",
                  boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.35)",
                }}
              >
                หน้าหลัก
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
              </Link>
            )}
          </div>
        </section>

        {/* Account links */}
        <section
          className="rounded-[22px] px-4 py-4"
          style={maeGlassStyle}
        >
          <p
            className="text-[13px] font-semibold tracking-[0.08em]"
            style={{ color: GOLD }}
          >
            เชื่อมบัญชี
          </p>
          <p className="mt-0.5 text-[12.5px]" style={{ color: MUTED }}>
            ล็อกอินช่องทางอื่นได้โดยไม่สร้างบัญชีใหม่
          </p>
          <div className="mt-3">
            <AccountAuthLinks />
          </div>
        </section>

        {/* Fortune profile */}
        <section
          className="rounded-[22px] px-4 py-4"
          style={maeGlassStyle}
        >
          <div className="mb-3.5 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-[17px] font-semibold" style={TITLE_GOLD}>
                โปรไฟล์ดวง
              </h2>
              <p className="mt-0.5 text-[12.5px]" style={{ color: MUTED }}>
                ใช้ดูดวงทุกหน้าในแอป
              </p>
            </div>
            {!editing ? (
              editAllowed ? (
                <button
                  type="button"
                  onClick={openEdit}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-semibold outline-none transition active:scale-[0.98]"
                  style={{
                    color: GOLD,
                    background: "rgba(232,209,154,0.1)",
                    boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.35)",
                  }}
                >
                  <Pencil className="h-3 w-3" strokeWidth={2.2} />
                  แก้ไข
                </button>
              ) : (
                <span
                  className="rounded-full px-2.5 py-1.5 text-[11px] font-medium"
                  style={{
                    color: "rgba(232,209,154,0.8)",
                    background: "rgba(232,209,154,0.08)",
                    boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.25)",
                  }}
                >
                  แก้ได้อีกใน {cooldownDays} วัน
                </span>
              )
            ) : null}
          </div>

          {saveError ? (
            <p className="mb-2 text-center text-[12px] text-[#ff9a9a]">{saveError}</p>
          ) : null}

          {editing ? (
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium" style={{ color: MUTED }}>
                  ชื่อจริง (ไม่บังคับ)
                </span>
                <input
                  className="name-step-input"
                  value={draft.realName}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, realName: e.target.value }))
                  }
                  placeholder="ชื่อจริง"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium" style={{ color: MUTED }}>
                  ชื่อเล่น
                </span>
                <input
                  className="name-step-input"
                  value={draft.nickname}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, nickname: e.target.value }))
                  }
                  placeholder="เช่น นัท"
                />
              </label>
              <div>
                <span className="mb-1.5 block text-[13px] font-medium" style={{ color: MUTED }}>
                  วันเกิด
                </span>
                <BirthDatePicker
                  tone="mae"
                  value={draft.birthDate}
                  onChange={(birthDate) =>
                    setDraft((d) => ({ ...d, birthDate }))
                  }
                />
              </div>
              <div>
                <span className="mb-1.5 block text-[13px] font-medium" style={{ color: MUTED }}>
                  เพศ
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {GENDER_OPTIONS.map((opt) => {
                    const selected = draft.gender === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            gender: opt.id,
                            genderNote:
                              opt.id === "other" ? d.genderNote : "",
                          }))
                        }
                        className={cn(
                          "rounded-full py-2.5 text-[13px] font-medium outline-none transition active:scale-[0.98]",
                          selected ? "mae-gold-cta" : "text-[#f7f4ec]/75"
                        )}
                        style={selected ? undefined : TILE}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {draft.gender === "other" ? (
                  <input
                    type="text"
                    value={draft.genderNote}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, genderNote: e.target.value }))
                    }
                    placeholder="ระบุเพิ่มเติม เช่น นอนไบนารี"
                    maxLength={80}
                    className="mt-2 h-11 w-full rounded-full px-4 text-[14px] text-[#f7f4ec] outline-none placeholder:text-[#9aa3b2]/55"
                    style={TILE}
                  />
                ) : null}
              </div>
              <p className="text-center text-[11px] text-[#f7f4ec]/55">
                บันทึกแล้วจะแก้ไขได้อีกครั้งหลัง 3 สัปดาห์
              </p>
              <div className="flex gap-2 pt-1">
                {profile ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setSaveError(null);
                    }}
                    className="flex-1 rounded-full py-3 text-[14px] font-medium text-[#f7f4ec]/70"
                    style={{
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)",
                    }}
                  >
                    ยกเลิก
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={
                    !draft.nickname.trim() ||
                    !draft.birthDate ||
                    !draft.gender ||
                    (draft.gender === "other" && !draft.genderNote.trim())
                  }
                  className="mae-gold-cta flex-1 rounded-full py-3 text-[14px] font-semibold disabled:opacity-50"
                >
                  บันทึกโปรไฟล์
                </button>
              </div>
            </div>
          ) : profile ? (
            <div className="space-y-2.5">
              <div
                className="flex items-center gap-3 rounded-[18px] px-3.5 py-3.5"
                style={TILE}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center">
                  {zodiac ? (
                    <ZodiacSignImage
                      sign={zodiac.id}
                      variant="orb"
                      size={48}
                      alt={`ราศี${zodiac.thaiName}`}
                    />
                  ) : (
                    <Sparkles className="h-5 w-5" style={{ color: GOLD_SOFT }} />
                  )}
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[15.5px] font-semibold text-[#f7f4ec]">
                    ราศี{zodiac?.thaiName ?? "—"}
                    {zodiac ? (
                      <span className="ml-1.5 text-[12.5px] font-normal" style={{ color: MUTED }}>
                        · ธาตุ{zodiac.element}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-[12.5px]" style={{ color: MUTED }}>
                    {zodiac?.dateRange}
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-2">
                <div className="rounded-[16px] px-3 py-2.5" style={TILE}>
                  <dt className="text-[11px]" style={{ color: "rgba(232,209,154,0.75)" }}>
                    ชื่อเล่น
                  </dt>
                  <dd className="mt-0.5 truncate text-[14px] font-medium text-[#f7f4ec]">
                    {profile.nickname}
                  </dd>
                </div>
                <div className="rounded-[16px] px-3 py-2.5" style={TILE}>
                  <dt className="text-[11px]" style={{ color: "rgba(232,209,154,0.75)" }}>
                    เพศ
                  </dt>
                  <dd className="mt-0.5 text-[14px] font-medium text-[#f7f4ec]">
                    {genderLabel(profile.gender, profile.genderNote)}
                  </dd>
                </div>
                <div className="col-span-2 rounded-[16px] px-3 py-2.5" style={TILE}>
                  <dt
                    className="flex items-center gap-1 text-[11px]"
                    style={{ color: "rgba(232,209,154,0.75)" }}
                  >
                    <CalendarDays className="h-3 w-3" strokeWidth={1.9} />
                    วันเกิด
                  </dt>
                  <dd className="mt-0.5 text-[14px] font-medium text-[#f7f4ec]">
                    {formatBirthThai(profile.birthDate)}
                  </dd>
                </div>
                {profile.birthTime ? (
                  <div className="rounded-[16px] px-3 py-2.5" style={TILE}>
                    <dt
                      className="flex items-center gap-1 text-[11px]"
                      style={{ color: "rgba(232,209,154,0.75)" }}
                    >
                      <Clock className="h-3 w-3" strokeWidth={1.9} />
                      เวลาเกิด
                    </dt>
                    <dd className="mt-0.5 text-[14px] font-medium text-[#f7f4ec]">
                      {profile.birthTime}
                    </dd>
                  </div>
                ) : null}
                {profile.birthPlace ? (
                  <div className="rounded-[16px] px-3 py-2.5" style={TILE}>
                    <dt
                      className="flex items-center gap-1 text-[11px]"
                      style={{ color: "rgba(232,209,154,0.75)" }}
                    >
                      <MapPin className="h-3 w-3" strokeWidth={1.9} />
                      สถานที่เกิด
                    </dt>
                    <dd className="mt-0.5 truncate text-[14px] font-medium text-[#f7f4ec]">
                      {profile.birthPlace}
                    </dd>
                  </div>
                ) : null}
                {profile.realName ? (
                  <div className="col-span-2 rounded-[16px] px-3 py-2.5" style={TILE}>
                    <dt className="text-[11px]" style={{ color: "rgba(232,209,154,0.75)" }}>
                      ชื่อจริง
                    </dt>
                    <dd className="mt-0.5 text-[14px] font-medium text-[#f7f4ec]">
                      {profile.realName}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : (
            <p className="py-4 text-center text-[13px]" style={{ color: MUTED }}>
              ยังไม่มีโปรไฟล์ดวง — กรอกข้อมูลเพื่อเริ่มต้น
            </p>
          )}
        </section>

        {/* LINE */}
        <section
          className="rounded-[22px] px-4 py-4 text-center"
          style={maeGlassStyle}
        >
          <h2 className="text-[15px] font-semibold leading-snug text-[#f7f4ec]">
            รับข่าวจากแม่ และปรึกษาได้ในไลน์
          </h2>
          <a
            href={LINE_OA_ADD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackClientEvent({
                name: "thanks_line_cta",
                path: "/dashboard",
                props: { source: "account" },
              });
            }}
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-white outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#06C755]/45"
            style={{
              background: "#06C755",
              boxShadow:
                "0 8px 20px rgba(6,199,85,0.28), 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            <LineMark className="h-4 w-4" />
            คุยกับแม่มั่งมี
          </a>
        </section>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-medium outline-none transition active:scale-[0.99] disabled:opacity-60"
          style={{
            color: "rgba(247,244,236,0.62)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
            background: MAE_GLASS.bgSoft,
          }}
        >
          <LogOut className="h-4 w-4" strokeWidth={1.9} />
          {signingOut ? "กำลังออก…" : "ออกจากระบบ"}
        </button>

        <Suspense fallback={null}>
          <FortunePaymentSheet
            open={payOpen}
            onClose={() => setPayOpen(false)}
            onPaid={applyPremiumUnlock}
            returnPath="/dashboard"
          />
        </Suspense>
      </div>
    </AnimatedPage>
  );
}
