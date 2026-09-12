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
  Hand,
  LogOut,
  MapPin,
  Pencil,
  ScanFace,
  ScrollText,
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
  getPremiumUnlockedUntil,
  setPremiumUnlocked,
  syncPremiumFromServer,
} from "@/lib/fortune/premium-unlock";
import { FORTUNE_PACKAGE_LABEL, FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

type AccountUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  credits: number;
};

const QUICK_LINKS = [
  {
    href: "/reading",
    title: "ดูดวงวันนี้",
    sub: "ภาพรวมรายวัน",
    Icon: ScrollText,
  },
  {
    href: "/reading/tarot",
    title: "ไพ่รายวัน",
    sub: "เปิดฟรีวันละใบ",
    Icon: Sparkles,
  },
  {
    href: "/premium",
    title: "หน้าดวง",
    sub: "ดวงแบบปลดล็อกเต็ม",
    Icon: Crown,
  },
  {
    href: "/reading/face",
    title: "โหงวเฮ้ง",
    sub: "อ่านจากใบหน้า",
    Icon: ScanFace,
  },
] as const;

function formatBirthThai(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function genderLabel(gender: string) {
  return GENDER_OPTIONS.find((g) => g.id === gender)?.label ?? "—";
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
  const [payOpen, setPayOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    realName: "",
    nickname: "",
    birthDate: "",
    gender: "" as Gender | "",
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
      })();
      if (loaded) {
        setDraft({
          realName: loaded.realName,
          nickname: loaded.nickname,
          birthDate: loaded.birthDate,
          gender: loaded.gender,
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
    });
    setEditing(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <AnimatedPage className="no-sky-lift mx-auto w-full max-w-[480px] space-y-3.5 px-4 pb-10 pt-4">
      <header className="px-0.5 text-center">
        <p className="mae-gold-text text-[12px] font-semibold tracking-[0.2em]">
          โปรไฟล์
        </p>
        <h1 className="mae-gold-text mt-1 text-[1.45rem] font-bold tracking-tight">
          บัญชีของคุณ
        </h1>
      </header>

      {/* Identity */}
      <section className="mae-aspect-card relative overflow-hidden rounded-[22px] px-4 py-5">
        <div className="relative z-[1] flex items-start gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full shadow-[0_0_0_2px_rgba(213,177,111,0.45)]">
            {user.image ? (
              <Image
                src={user.image}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-[rgba(213,177,111,0.12)]">
                <UserRound className="h-7 w-7 text-[#d5b16f]" strokeWidth={1.7} />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[1.25rem] font-semibold text-[#f7f4ec]">
              คุณ{displayName}
            </h2>
            <p className="mt-0.5 truncate text-[13px] text-[#f7f4ec]/65">
              {user.email ?? "เข้าสู่ระบบแล้ว"}
            </p>
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                premium
                  ? "bg-[rgba(213,177,111,0.18)] text-[#e8d19a]"
                  : "bg-[rgba(213,177,111,0.1)] text-[#d5b16f]"
              )}
              style={{
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
              }}
            >
              <Crown className="h-3 w-3" strokeWidth={2} />
              {premium ? "พรีเมียมใช้งานอยู่" : "สมาชิกทั่วไป"}
            </p>
          </div>
          <AccountAuthLinks />
        </div>

        <div className="relative z-[1] mt-4 grid grid-cols-2 gap-2">
          <div
            className="rounded-[14px] px-3 py-2.5"
            style={{
              background: "rgba(213,177,111,0.08)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
            }}
          >
            <p className="text-[11px] text-[#e8d19a]/75">แพ็กเกจ</p>
            <p className="mt-0.5 text-[15px] font-semibold text-[#f7f4ec]">
              {premium ? `พรีเมียม ${FORTUNE_PACKAGE_LABEL}` : "ยังไม่มี"}
            </p>
            <p className="text-[11px] text-[#f7f4ec]/55">
              {premium && premiumUntil
                ? `ถึง ${new Intl.DateTimeFormat("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(premiumUntil)}`
                : `ปลดล็อก ${FORTUNE_UNLOCK_PRICE} บาท`}
            </p>
          </div>
          {premium ? (
            <Link
              href="/premium"
              className="rounded-[14px] px-3 py-2.5 outline-none transition active:scale-[0.99]"
              style={{
                background: "rgba(213,177,111,0.08)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
              }}
            >
              <p className="text-[11px] text-[#e8d19a]/75">สถานะ</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#f7f4ec]">
                ใช้งานอยู่
              </p>
              <p className="text-[11px] text-[#d5b16f]">จัดการพรีเมียม →</p>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setPayOpen(true)}
              className="rounded-[14px] px-3 py-2.5 text-left outline-none transition active:scale-[0.99]"
              style={{
                background: "rgba(213,177,111,0.08)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
              }}
            >
              <p className="text-[11px] text-[#e8d19a]/75">สถานะ</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#f7f4ec]">
                สมาชิกทั่วไป
              </p>
              <p className="text-[11px] text-[#d5b16f]">ดูพรีเมียม →</p>
            </button>
          )}
        </div>
      </section>

      {/* Fortune profile */}
      <section className="mae-aspect-card rounded-[20px] px-3.5 py-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="mae-gold-text text-[17px] font-semibold">
              โปรไฟล์ดวง
            </h2>
            <p className="text-[12px] text-[#f7f4ec]/65">
              ใช้ดูดวงทุกหน้าในแอป
            </p>
          </div>
          {!editing ? (
            editAllowed ? (
              <button
                type="button"
                onClick={openEdit}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-medium text-[#e8d19a] outline-none transition active:scale-[0.98]"
                style={{
                  background: "rgba(213,177,111,0.12)",
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
                }}
              >
                <Pencil className="h-3 w-3" strokeWidth={2} />
                แก้ไข
              </button>
            ) : (
              <span
                className="rounded-full px-2.5 py-1.5 text-[11px] font-medium text-[#e8d19a]/80"
                style={{
                  background: "rgba(213,177,111,0.1)",
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
                }}
              >
                แก้ได้อีกใน {cooldownDays} วัน
              </span>
            )
          ) : null}
        </div>

        {saveError ? (
          <p className="mb-2 text-center text-[12px] text-red-500/90">{saveError}</p>
        ) : null}

        {editing ? (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-[#9aa3b2]">
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
              <span className="mb-1.5 block text-[13px] font-medium text-[#9aa3b2]">
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
              <span className="mb-1.5 block text-[13px] font-medium text-[#9aa3b2]">
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
              <span className="mb-1.5 block text-[13px] font-medium text-[#9aa3b2]">
                เพศ
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {GENDER_OPTIONS.map((opt) => {
                  const selected = draft.gender === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setDraft((d) => ({ ...d, gender: opt.id }))
                      }
                      className={cn(
                        "rounded-full py-2.5 text-[13px] font-medium outline-none transition active:scale-[0.98]",
                        selected
                          ? "mae-gold-cta"
                          : "text-[#f7f4ec]/75"
                      )}
                      style={
                        selected
                          ? undefined
                          : {
                              background: "rgba(213,177,111,0.08)",
                              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
                            }
                      }
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
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
                    boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
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
                  !draft.gender
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
              className="flex items-center gap-3 rounded-[16px] px-3 py-3"
              style={{
                background: "rgba(213,177,111,0.08)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
              }}
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
                  <Sparkles className="h-5 w-5 text-[#d5b16f]" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#f7f4ec]">
                  ราศี{zodiac?.thaiName ?? "—"}
                  {zodiac ? (
                    <span className="ml-1.5 text-[12px] font-normal text-[#f7f4ec]/65">
                      · ธาตุ{zodiac.element}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-[12px] text-[#f7f4ec]/55">
                  {zodiac?.dateRange}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-2">
              <div
                className="rounded-[14px] px-3 py-2.5"
                style={{
                  background: "rgba(213,177,111,0.08)",
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
                }}
              >
                <dt className="text-[11px] text-[#e8d19a]/75">ชื่อเล่น</dt>
                <dd className="mt-0.5 truncate text-[14px] font-medium text-[#f7f4ec]">
                  {profile.nickname}
                </dd>
              </div>
              <div
                className="rounded-[14px] px-3 py-2.5"
                style={{
                  background: "rgba(213,177,111,0.08)",
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
                }}
              >
                <dt className="text-[11px] text-[#e8d19a]/75">เพศ</dt>
                <dd className="mt-0.5 text-[14px] font-medium text-[#f7f4ec]">
                  {genderLabel(profile.gender)}
                </dd>
              </div>
              <div
                className="col-span-2 rounded-[14px] px-3 py-2.5"
                style={{
                  background: "rgba(213,177,111,0.08)",
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
                }}
              >
                <dt className="flex items-center gap-1 text-[11px] text-[#e8d19a]/75">
                  <CalendarDays className="h-3 w-3" strokeWidth={1.9} />
                  วันเกิด
                </dt>
                <dd className="mt-0.5 text-[14px] font-medium text-[#f7f4ec]">
                  {formatBirthThai(profile.birthDate)}
                </dd>
              </div>
              {profile.birthTime ? (
                <div
                  className="rounded-[14px] px-3 py-2.5"
                  style={{
                    background: "rgba(213,177,111,0.08)",
                    boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
                  }}
                >
                  <dt className="flex items-center gap-1 text-[11px] text-[#e8d19a]/75">
                    <Clock className="h-3 w-3" strokeWidth={1.9} />
                    เวลาเกิด
                  </dt>
                  <dd className="mt-0.5 text-[14px] font-medium text-[#f7f4ec]">
                    {profile.birthTime}
                  </dd>
                </div>
              ) : null}
              {profile.birthPlace ? (
                <div
                  className="rounded-[14px] px-3 py-2.5"
                  style={{
                    background: "rgba(213,177,111,0.08)",
                    boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
                  }}
                >
                  <dt className="flex items-center gap-1 text-[11px] text-[#e8d19a]/75">
                    <MapPin className="h-3 w-3" strokeWidth={1.9} />
                    สถานที่เกิด
                  </dt>
                  <dd className="mt-0.5 truncate text-[14px] font-medium text-[#f7f4ec]">
                    {profile.birthPlace}
                  </dd>
                </div>
              ) : null}
              {profile.realName ? (
                <div
                  className="col-span-2 rounded-[14px] px-3 py-2.5"
                  style={{
                    background: "rgba(213,177,111,0.08)",
                    boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
                  }}
                >
                  <dt className="text-[11px] text-[#e8d19a]/75">ชื่อจริง</dt>
                  <dd className="mt-0.5 text-[14px] font-medium text-[#f7f4ec]">
                    {profile.realName}
                  </dd>
                </div>
              ) : null}
            </dl>

            <Link
              href="/reading"
              className="mae-gold-cta mt-1 flex w-full items-center justify-between rounded-[14px] px-3.5 py-3 text-left outline-none transition active:scale-[0.99]"
            >
              <span>
                <span className="block text-[14px] font-semibold">
                  เปิดดวงวันนี้
                </span>
                <span className="text-[11px] opacity-75">
                  ใช้โปรไฟล์นี้ดูต่อ
                </span>
              </span>
              <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
            </Link>
          </div>
        ) : (
          <p className="py-4 text-center text-[13px] text-[#f7f4ec]/65">
            ยังไม่มีโปรไฟล์ดวง — กรอกข้อมูลด้านบนเพื่อเริ่มต้น
          </p>
        )}
      </section>

      {/* Quick links */}
      <section className="space-y-2.5">
        <h2 className="mae-gold-text px-0.5 text-[17px] font-semibold">
          ทางลัด
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_LINKS.map(({ href, title, sub, Icon }) => (
            <Link
              key={href}
              href={href}
              className="mae-aspect-card flex flex-col gap-2 rounded-[18px] px-3 py-3 outline-none transition active:scale-[0.98]"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: "rgba(213,177,111,0.12)" }}
              >
                <Icon className="h-4 w-4 text-[#d5b16f]" strokeWidth={1.8} />
              </span>
              <span>
                <span className="block text-[14px] font-semibold text-[#f7f4ec]">
                  {title}
                </span>
                <span className="text-[11px] text-[#f7f4ec]/55">{sub}</span>
              </span>
            </Link>
          ))}
        </div>
        <Link
          href="/reading/palm"
          className="mae-aspect-card flex items-center gap-3 rounded-[16px] px-3.5 py-3 outline-none transition active:scale-[0.99]"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "rgba(213,177,111,0.12)" }}
          >
            <Hand className="h-4 w-4 text-[#d5b16f]" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-[#f7f4ec]">
              ดูลายมือ
            </span>
            <span className="text-[11px] text-[#f7f4ec]/55">อ่านเส้นมือจากภาพ</span>
          </span>
          <ChevronRight className="h-4 w-4 text-[#d5b16f]" strokeWidth={2.2} />
        </Link>
      </section>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-medium text-[#f7f4ec]/65 outline-none transition active:scale-[0.99] disabled:opacity-60"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
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
    </AnimatedPage>
  );
}
