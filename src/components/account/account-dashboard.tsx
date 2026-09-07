"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  Coins,
  Crown,
  Hand,
  LogOut,
  Pencil,
  ScanFace,
  ScrollText,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  GENDER_OPTIONS,
  SacredField,
  SacredGenderPicker,
  sacredInputClassName,
  type Gender,
} from "@/components/ui/sacred-form";
import { BirthDatePicker } from "@/components/fortune/birth-date-picker";
import { AnimatedPage } from "@/components/ui/reveal";
import { getZodiacByBirthDate } from "@/lib/fortune/zodiac";
import {
  hydrateFortuneProfileFromWizard,
  readFortuneProfile,
  writeFortuneProfile,
  type FortuneUserProfile,
} from "@/lib/fortune/profile-storage";
import { isPremiumUnlocked } from "@/lib/fortune/premium-unlock";
import { cn } from "@/lib/utils";

export type AccountHistoryItem = {
  id: string;
  type: string;
  preview: string;
  createdAt: string;
};

type AccountUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  credits: number;
};

const TYPE_LABELS: Record<string, string> = {
  daily: "ดวงรายวัน",
  love: "ความรัก",
  career: "การงาน",
  money: "การเงิน",
  health: "สุขภาพ",
  overall: "ภาพรวมชีวิต",
  tarot: "ไพ่ทาโรต์",
};

const QUICK_LINKS = [
  {
    href: "/reading",
    title: "ดูดวงวันนี้",
    sub: "ภาพรวมรายวัน",
    accent: "#F4BC52",
    Icon: ScrollText,
  },
  {
    href: "/reading/tarot",
    title: "ไพ่ทาโร่",
    sub: "เปิดฟรีวันละใบ",
    accent: "#BB6CF0",
    Icon: Sparkles,
  },
  {
    href: "/premium",
    title: "หน้าพรีเมียม",
    sub: "ดวงแบบปลดล็อกเต็ม",
    accent: "#46DDED",
    Icon: Crown,
  },
  {
    href: "/reading/face",
    title: "โหงวเฮ้ง",
    sub: "อ่านจากใบหน้า",
    accent: "#F16DB5",
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

export function AccountDashboard({
  user,
  history,
}: {
  user: AccountUser;
  history: AccountHistoryItem[];
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<FortuneUserProfile | null>(null);
  const [premium, setPremium] = useState(false);
  const [editing, setEditing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [draft, setDraft] = useState({
    realName: "",
    nickname: "",
    birthDate: "",
    gender: "" as Gender | "",
  });

  useEffect(() => {
    const loaded =
      hydrateFortuneProfileFromWizard() ?? readFortuneProfile();
    setProfile(loaded);
    setPremium(
      isPremiumUnlocked(
        loaded
          ? { birthDate: loaded.birthDate, nickname: loaded.nickname }
          : null
      )
    );
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
  }, []);

  const zodiac = useMemo(
    () => (profile?.birthDate ? getZodiacByBirthDate(profile.birthDate) : null),
    [profile?.birthDate]
  );

  const displayName =
    profile?.nickname?.trim() ||
    profile?.realName?.trim() ||
    user.name?.trim() ||
    "สมาชิก";

  function openEdit() {
    setDraft({
      realName: profile?.realName ?? "",
      nickname: profile?.nickname ?? "",
      birthDate: profile?.birthDate ?? "",
      gender: profile?.gender ?? "",
    });
    setEditing(true);
  }

  function saveProfile() {
    if (!draft.nickname.trim() || !draft.birthDate) return;
    const next = writeFortuneProfile({
      realName: draft.realName,
      nickname: draft.nickname,
      birthDate: draft.birthDate,
      gender: draft.gender,
    });
    setProfile(next);
    setEditing(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.replace("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <AnimatedPage className="mx-auto w-full max-w-[480px] space-y-3.5 px-4 pb-10 pt-5">
      {/* Header / identity */}
      <section className="fortune-glass relative overflow-hidden rounded-[22px] px-4 pb-5 pt-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden
          style={{
            background: [
              "radial-gradient(ellipse 90% 60% at 18% -20%, rgba(244,188,82,0.22), transparent 55%)",
              "radial-gradient(circle at 92% 80%, rgba(70,221,237,0.12), transparent 42%)",
            ].join(", "),
          }}
        />
        <div className="relative z-[1] flex items-start gap-3.5">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-[#F4BC52]/35">
            {user.image ? (
              <Image
                src={user.image}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-[#121D36]">
                <UserRound className="h-6 w-6 text-[#F4BC52]" strokeWidth={1.7} />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-[#F4BC52]/85">
              บัญชี DOODUANG
            </p>
            <h1 className="font-sacred mt-1 text-[1.65rem] leading-tight tracking-wide text-[#F7F8FF]">
              สวัสดี{" "}
              <span className="intro-title-accent">คุณ{displayName}</span>
            </h1>
            <p className="mt-1 truncate text-[13px] text-[#9AB8DC]">
              {user.email ?? "เข้าสู่ระบบแล้ว"}
            </p>
          </div>
        </div>

        <div className="relative z-[1] mt-4 grid grid-cols-2 gap-2">
          <div className="fortune-glass-inset rounded-[14px] px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[11px] text-[#9AB8DC]">
              <Coins className="h-3.5 w-3.5 text-[#F4BC52]" strokeWidth={1.9} />
              เครดิต
            </p>
            <p className="mt-1 text-[22px] font-semibold tabular-nums text-[#F7F8FF]">
              {user.credits}
            </p>
          </div>
          <Link
            href="/premium"
            className="fortune-glass-inset rounded-[14px] px-3 py-2.5 outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/45"
          >
            <p className="flex items-center gap-1.5 text-[11px] text-[#9AB8DC]">
              <Crown className="h-3.5 w-3.5 text-[#F4BC52]" strokeWidth={1.9} />
              พรีเมียม
            </p>
            <p className="mt-1 text-[15px] font-semibold text-[#F7F8FF]">
              {premium ? "ปลดล็อกแล้ว" : "ยังไม่ปลดล็อก"}
            </p>
          </Link>
        </div>
      </section>

      {/* Fortune profile from wizard */}
      <section className="fortune-glass rounded-[20px] px-3.5 py-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-sacred text-[1.25rem] text-[#F7F8FF]">
              โปรไฟล์ดวง
            </h2>
            <p className="text-[12px] text-[#9AB8DC]">
              ข้อมูลจากตอนเริ่มดูดวง — เก็บไว้ใช้ทุกหน้า
            </p>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={openEdit}
              className="inline-flex items-center gap-1 rounded-full border border-[#F4BC52]/3 bg-[#F4BC52]/1 px-2.5 py-1.5 text-[12px] font-medium text-[#F4BC52] outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/45"
            >
              <Pencil className="h-3 w-3" strokeWidth={2} />
              แก้ไข
            </button>
          ) : null}
        </div>

        {editing ? (
          <div className="space-y-3">
            <SacredField label="ชื่อจริง (ไม่บังคับ)">
              <input
                className={sacredInputClassName}
                value={draft.realName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, realName: e.target.value }))
                }
                placeholder="ชื่อจริง"
              />
            </SacredField>
            <SacredField label="ชื่อเล่น / ชื่อที่เรียก">
              <input
                className={sacredInputClassName}
                value={draft.nickname}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, nickname: e.target.value }))
                }
                placeholder="เช่น นัท"
              />
            </SacredField>
            <SacredField label="วันเกิด">
              <BirthDatePicker
                value={draft.birthDate}
                onChange={(birthDate) =>
                  setDraft((d) => ({ ...d, birthDate }))
                }
              />
            </SacredField>
            <SacredField label="เพศ">
              <SacredGenderPicker
                value={draft.gender}
                onChange={(gender) => setDraft((d) => ({ ...d, gender }))}
              />
            </SacredField>
            <div className="flex gap-2 pt-1">
              {profile ? (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 rounded-full border border-white/15 py-3 text-[14px] font-medium text-[#9AB8DC]"
                >
                  ยกเลิก
                </button>
              ) : null}
              <button
                type="button"
                onClick={saveProfile}
                disabled={!draft.nickname.trim() || !draft.birthDate}
                className="flex-1 rounded-full py-3 text-[14px] font-semibold text-[#1A1208] disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, #FFF0C4 0%, #F4BC52 40%, #C9922E 100%)",
                }}
              >
                บันทึกโปรไฟล์
              </button>
            </div>
          </div>
        ) : profile ? (
          <div className="space-y-2.5">
            <div className="fortune-glass-inset flex items-center gap-3 rounded-[16px] px-3 py-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F4BC52]/12 text-[1.35rem] ring-1 ring-[#F4BC52]/35">
                {zodiac?.symbol ?? "✦"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#F7F8FF]">
                  ราศี{zodiac?.thaiName ?? "—"}
                  {zodiac ? (
                    <span className="ml-1.5 text-[12px] font-normal text-[#9AB8DC]">
                      · ธาตุ{zodiac.element}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-[12px] text-[#9AB8DC]">
                  {zodiac?.dateRange}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-2">
              <div className="fortune-glass-inset rounded-[14px] px-3 py-2.5">
                <dt className="text-[11px] text-[#9AB8DC]">ชื่อเล่น</dt>
                <dd className="mt-0.5 truncate text-[14px] font-medium text-[#F7F8FF]">
                  {profile.nickname}
                </dd>
              </div>
              <div className="fortune-glass-inset rounded-[14px] px-3 py-2.5">
                <dt className="text-[11px] text-[#9AB8DC]">เพศ</dt>
                <dd className="mt-0.5 text-[14px] font-medium text-[#F7F8FF]">
                  {genderLabel(profile.gender)}
                </dd>
              </div>
              <div className="fortune-glass-inset col-span-2 rounded-[14px] px-3 py-2.5">
                <dt className="flex items-center gap-1 text-[11px] text-[#9AB8DC]">
                  <CalendarDays className="h-3 w-3" strokeWidth={1.9} />
                  วันเกิด
                </dt>
                <dd className="mt-0.5 text-[14px] font-medium text-[#F7F8FF]">
                  {formatBirthThai(profile.birthDate)}
                </dd>
              </div>
              {profile.realName ? (
                <div className="fortune-glass-inset col-span-2 rounded-[14px] px-3 py-2.5">
                  <dt className="text-[11px] text-[#9AB8DC]">ชื่อจริง</dt>
                  <dd className="mt-0.5 text-[14px] font-medium text-[#F7F8FF]">
                    {profile.realName}
                  </dd>
                </div>
              ) : null}
            </dl>

            <Link
              href="/reading"
              className="mt-1 flex w-full items-center justify-between rounded-[14px] border border-[#F4BC52]/25 bg-[#F4BC52]/1 px-3 py-2.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/45"
            >
              <span>
                <span className="block text-[13px] font-semibold text-[#F7F8FF]">
                  เปิดดวงวันนี้ด้วยโปรไฟล์นี้
                </span>
                <span className="text-[11px] text-[#9AB8DC]">
                  ไปที่หน้าดูดวง
                </span>
              </span>
              <ChevronRight className="h-4 w-4 text-[#F4BC52]" strokeWidth={2.2} />
            </Link>
          </div>
        ) : null}
      </section>

      {/* Quick links */}
      <section className="space-y-2.5">
        <h2 className="px-0.5 font-sacred text-[1.2rem] text-[#F7F8FF]">
          ทางลัด
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_LINKS.map(({ href, title, sub, accent, Icon }) => (
            <Link
              key={href}
              href={href}
              className="fortune-glass flex flex-col gap-2 rounded-[18px] px-3 py-3 outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/30"
              style={{ boxShadow: `inset 0 0 0 1px ${accent}30` }}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(160deg, ${accent}33, ${accent}10)`,
                  boxShadow: `inset 0 0 0 1px ${accent}55`,
                }}
              >
                <Icon className="h-4 w-4" style={{ color: accent }} strokeWidth={1.8} />
              </span>
              <span>
                <span className="block text-[14px] font-semibold text-[#F7F8FF]">
                  {title}
                </span>
                <span className="text-[11px] text-[#9AB8DC]">{sub}</span>
              </span>
            </Link>
          ))}
        </div>
        <Link
          href="/reading/palm"
          className="fortune-glass flex items-center gap-3 rounded-[16px] px-3.5 py-3 outline-none transition active:scale-[0.99]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(70,221,237,0.28)" }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#46DDED]/15 ring-1 ring-[#46DDED]/4">
            <Hand className="h-4 w-4 text-[#46DDED]" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-[#F7F8FF]">
              ดูลายมือ
            </span>
            <span className="text-[11px] text-[#9AB8DC]">อ่านเส้นมือจากภาพ</span>
          </span>
          <ChevronRight className="h-4 w-4 text-[#46DDED]" strokeWidth={2.2} />
        </Link>
        <Link
          href="/pricing"
          className="fortune-glass flex items-center gap-3 rounded-[16px] px-3.5 py-3 outline-none transition active:scale-[0.99]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(244,188,82,0.28)" }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4BC52]/15 ring-1 ring-[#F4BC52]/4">
            <Coins className="h-4 w-4 text-[#F4BC52]" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-[#F7F8FF]">
              เติมเครดิต
            </span>
            <span className="text-[11px] text-[#9AB8DC]">
              เหลือ {user.credits} เครดิต
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-[#F4BC52]" strokeWidth={2.2} />
        </Link>
      </section>

      {/* History */}
      <section className="fortune-glass rounded-[20px] px-3.5 py-4">
        <h2 className="font-sacred text-[1.2rem] text-[#F7F8FF]">
          ประวัติดูดวง
        </h2>
        <p className="mt-0.5 text-[12px] text-[#9AB8DC]">
          บันทึกบนบัญชีที่ล็อกอิน
        </p>
        {history.length === 0 ? (
          <p className="mt-4 py-6 text-center text-[13px] text-[#9AB8DC]/70">
            ยังไม่มีประวัติ — ลองดูดวงแล้วบันทึกไว้
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {history.map((item) => (
              <li
                key={item.id}
                className="rounded-[14px] bg-white/[0.03] px-3 py-2.5 ring-1 ring-white/[0.06]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-[#F7F8FF]">
                    {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                  <span className="text-[11px] text-[#9AB8DC]/75">
                    {new Date(item.createdAt).toLocaleDateString("th-TH")}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-[#9AB8DC]">
                  {item.preview}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-full border border-white/12 py-3.5 text-[14px] font-medium text-[#9AB8DC] outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-60"
        )}
      >
        <LogOut className="h-4 w-4" strokeWidth={1.9} />
        {signingOut ? "กำลังออก…" : "ออกจากระบบ"}
      </button>
    </AnimatedPage>
  );
}
