"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  PremiumDetailShell,
  DetailSection,
  usePremiumProfileGate,
} from "@/components/fortune/premium-detail-shell";
import { BirthDatePicker } from "@/components/fortune/birth-date-picker";
import {
  ShareReadingButton,
  buildCoupleShareText,
} from "@/components/fortune/share-reading-button";
import {
  buildCouplePack,
  readPartnerState,
  writePartnerState,
} from "@/lib/fortune/build-premium-value-pack";
import {
  COUPLE_ROLES,
  type CoupleRoleId,
} from "@/lib/fortune/content/couple-th";
import { APP_NAME } from "@/lib/site";
import { MAE_GLASS } from "@/lib/mae-glass";
import { cn } from "@/lib/utils";

const GOLD_SOFT = "#e8d19a";
const GOLD_BTN =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";
const TEXT_MUTED = "rgba(186, 204, 230, 0.78)";

function DimensionBars({
  items,
}: {
  items: { id: string; label: string; score: number }[];
}) {
  return (
    <div className="mt-4 space-y-3">
      {items.map((d) => {
        const pct = Math.round((d.score / 12) * 100);
        return (
          <div key={d.id}>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[13px] font-semibold text-white/90">{d.label}</p>
              <p className="text-[12px] font-semibold" style={{ color: GOLD_SOFT }}>
                {d.score}/12
              </p>
            </div>
            <div
              className="mt-1.5 h-2 overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${pct}%`,
                  background: GOLD_BTN,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PremiumCouplePage() {
  const { ready, profile } = usePremiumProfileGate();
  const [partnerBirth, setPartnerBirth] = useState("");
  const [role, setRole] = useState<CoupleRoleId>("lover");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = readPartnerState();
    if (existing) {
      setPartnerBirth(existing.birth);
      setRole(existing.role);
      setSaved(true);
    }
  }, []);

  const couple = useMemo(() => {
    if (!profile?.birthDate || !partnerBirth) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(partnerBirth)) return null;
    if (!saved) return null;
    return buildCouplePack(profile.birthDate, partnerBirth, role);
  }, [profile, partnerBirth, role, saved]);

  const shareText = useMemo(() => {
    if (!couple) return "";
    return buildCoupleShareText({
      roleLabel: couple.roleLabel,
      youSign: couple.youSign,
      partnerSign: couple.partnerSign,
      score: couple.score,
      vibeTitle: couple.copy.vibeTitle,
      blurb: couple.copy.blurb,
      tip: couple.copy.tip,
      weekTip: couple.weekTip,
    });
  }, [couple]);

  if (!ready || !profile) {
    return (
      <div className="px-4 py-10 text-center text-[14px] text-[#f7f4ec]/55">
        กำลังเปิด…
      </div>
    );
  }

  function handleSave() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(partnerBirth)) return;
    writePartnerState({ birth: partnerBirth, role });
    setSaved(true);
  }

  return (
    <PremiumDetailShell title="ดวงคู่">
      <div className="relative mt-4 overflow-hidden rounded-[20px]" style={{ aspectRatio: "3.2 / 1" }}>
        <Image
          src="/images/home/predict/couple-v7.webp?v=8"
          alt=""
          fill
          unoptimized
          className="object-cover object-center"
          sizes="(max-width: 480px) 100vw, 480px"
          priority
        />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "linear-gradient(105deg, rgba(8,14,28,0.82) 0%, rgba(8,14,28,0.45) 45%, rgba(8,14,28,0.18) 70%, transparent 88%)",
          }}
        />
        <div className="relative z-[1] flex h-full flex-col justify-center px-4 py-3">
          <p className="text-[12px] font-semibold tracking-[0.14em]" style={{ color: GOLD_SOFT }}>
            คนรอบตัว
          </p>
          <p className="mt-1 max-w-[14rem] text-[14px] font-medium leading-[1.45] text-white/90">
            เลือกว่าเป็นใคร ใส่วันเกิด แล้วดูจังหวะเข้ากันแบบเจาะจง
          </p>
        </div>
      </div>

      <div
        className="mt-4 rounded-[20px] px-3.5 py-4"
        style={{
          background: MAE_GLASS.bg,
          border: MAE_GLASS.border,
          boxShadow: MAE_GLASS.highlight,
        }}
      >
        <p className="text-[12px] font-semibold" style={{ color: GOLD_SOFT }}>
          ความสัมพันธ์นี้คือ
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {COUPLE_ROLES.map((r) => {
            const active = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRole(r.id);
                  if (saved && partnerBirth) {
                    writePartnerState({ birth: partnerBirth, role: r.id });
                  }
                }}
                className={cn(
                  "rounded-full px-3 py-[0.55em] text-[13px] font-semibold leading-[1.45] outline-none transition active:scale-[0.99]",
                  active ? "text-[#1a1408]" : "text-white/85"
                )}
                style={
                  active
                    ? { background: GOLD_BTN }
                    : {
                        background: "rgba(255,255,255,0.06)",
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
                      }
                }
              >
                {r.label}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-[12px] font-semibold" style={{ color: GOLD_SOFT }}>
          วันเกิดอีกฝ่าย
        </p>
        <div className="mt-2">
          <BirthDatePicker
            value={partnerBirth}
            onChange={(v) => {
              setPartnerBirth(v);
              setSaved(false);
            }}
            tone="mae"
          />
        </div>
        <button
          type="button"
          disabled={!partnerBirth}
          onClick={handleSave}
          className="mt-3 w-full rounded-full py-3 text-[14px] font-semibold text-[#101827] outline-none transition enabled:active:scale-[0.99] disabled:opacity-35"
          style={{ background: GOLD_BTN }}
        >
          {saved && couple ? "อัปเดตผล" : "ดูความเข้ากัน"}
        </button>
      </div>

      {couple ? (
        <>
          <div
            className="mt-3 rounded-[20px] px-4 py-4 text-center"
            style={{
              background: MAE_GLASS.bg,
              border: MAE_GLASS.border,
              boxShadow: MAE_GLASS.highlight,
            }}
          >
            <p className="text-[12px] font-semibold tracking-wide" style={{ color: GOLD_SOFT }}>
              {couple.roleLabel}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
              <span
                className="rounded-full px-3 py-1.5 text-[12px] font-semibold"
                style={{
                  color: GOLD_SOFT,
                  background: "rgba(213,177,111,0.12)",
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
                }}
              >
                คุณ · {couple.youSign} · {couple.youElement}
              </span>
              <span style={{ color: GOLD_SOFT }}>×</span>
              <span
                className="rounded-full px-3 py-1.5 text-[12px] font-semibold"
                style={{
                  color: GOLD_SOFT,
                  background: "rgba(213,177,111,0.12)",
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
                }}
              >
                อีกฝ่าย · {couple.partnerSign} · {couple.partnerElement}
              </span>
            </div>
            <p
              className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-full text-[1.25rem] font-bold text-[#101827]"
              style={{ background: GOLD_BTN }}
            >
              {couple.score}
            </p>
            <p className="mt-2 text-[15px] font-semibold text-[#f7f4ec]">
              {couple.copy.vibeTitle}
            </p>
            <p className="mt-1 text-[13px] leading-[1.5]" style={{ color: TEXT_MUTED }}>
              {couple.copy.blurb}
            </p>

            <DimensionBars items={couple.dimensions} />
          </div>

          <div
            className="mt-3 rounded-[20px] px-4 py-3.5"
            style={{
              background: MAE_GLASS.bg,
              border: MAE_GLASS.border,
              boxShadow: MAE_GLASS.highlight,
            }}
          >
            <p className="text-[12px] font-semibold tracking-wide" style={{ color: GOLD_SOFT }}>
              จังหวะสัปดาห์นี้
            </p>
            <p className="mt-1.5 text-[14.5px] font-medium leading-[1.55] text-white">
              {couple.weekTip}
            </p>
          </div>

          <DetailSection title="จุดที่ไปด้วยกันได้">
            <p>{couple.copy.together}</p>
          </DetailSection>
          <DetailSection title="จุดเสียดสีที่พบบ่อย">
            <p>{couple.copy.friction}</p>
          </DetailSection>
          <DetailSection title="วิธีคุยให้ดีขึ้น">
            <p>{couple.copy.tip}</p>
          </DetailSection>

          <DetailSection title="คำถามชวนคุย">
            <ul className="space-y-2.5">
              {couple.prompts.map((q) => (
                <li
                  key={q}
                  className="rounded-[14px] px-3 py-2.5 text-[15px] font-medium leading-[1.5]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                  }}
                >
                  {q}
                </li>
              ))}
            </ul>
          </DetailSection>

          <div className="mt-4">
            <ShareReadingButton
              title={`ดวงคู่ · ${APP_NAME}`}
              text={shareText}
              variant="secondary"
            />
          </div>
        </>
      ) : null}
    </PremiumDetailShell>
  );
}
