"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, X } from "lucide-react";
import {
  FortuneIcon,
  type FortuneIconName,
} from "@/components/fortune/fortune-icon";
import { generateFortune } from "@/lib/fortune/engine";
import { cn } from "@/lib/utils";

const DOMAINS = [
  {
    id: "career" as const,
    name: "การงาน",
    blurb: "โฟกัสงานที่สร้างผลจริง",
    icon: "career" as FortuneIconName,
  },
  {
    id: "money" as const,
    name: "การเงิน",
    blurb: "คุมรายจ่ายก่อนขยายแผน",
    icon: "finance" as FortuneIconName,
  },
  {
    id: "love" as const,
    name: "ความรัก",
    blurb: "พูดสั้น ๆ แต่จริงใจ",
    icon: "love" as FortuneIconName,
  },
  {
    id: "health" as const,
    name: "สุขภาพ",
    blurb: "เว้นที่ว่างให้กายใจพัก",
    icon: "health" as FortuneIconName,
  },
] as const;

type DomainId = (typeof DOMAINS)[number]["id"];

/** 2×2 daily aspect cards — tap to read full daily insight */
export function FortuneTopicGrid({
  seed = "dooduang",
  nickname = "",
  realName = "",
  birthDate = "2000-01-01",
  className,
}: {
  seed?: string;
  nickname?: string;
  realName?: string;
  birthDate?: string;
  className?: string;
}) {
  const [openId, setOpenId] = useState<DomainId | null>(null);

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3 px-0.5">
        <h2 className="text-[17px] font-semibold tracking-wide text-[#2C2458]">
          ดวงรายวัน 4 ด้าน
        </h2>
        <button
          type="button"
          onClick={() => setOpenId("career")}
          className="inline-flex items-center gap-0.5 text-[13px] text-[#6B6490] outline-none transition active:opacity-70 focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/35"
        >
          ดูทั้งหมด
          <FortuneIcon name="arrow-right" size={22} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {DOMAINS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setOpenId(d.id)}
            className="fortune-glass flex min-h-[100px] items-center gap-2.5 rounded-[18px] px-3 py-3.5 text-left outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/4"
            aria-label={`อ่านดวง${d.name}`}
          >
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
              <FortuneIcon name={d.icon} size={52} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-[#2C2458]">{d.name}</p>
              <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-[#5E5688]">
                {d.blurb}
              </p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70 ring-1 ring-[#7B6BB0]/18">
              <ChevronRight className="h-5 w-5 text-[#7B5FD4]" strokeWidth={2.4} />
            </span>
          </button>
        ))}
      </div>

      <TopicDetailSheet
        openId={openId}
        onClose={() => setOpenId(null)}
        onSelect={setOpenId}
        seed={seed}
        nickname={nickname}
        realName={realName}
        birthDate={birthDate}
      />
    </section>
  );
}

function TopicDetailSheet({
  openId,
  onClose,
  onSelect,
  seed,
  nickname,
  realName,
  birthDate,
}: {
  openId: DomainId | null;
  onClose: () => void;
  onSelect: (id: DomainId) => void;
  seed: string;
  nickname: string;
  realName: string;
  birthDate: string;
}) {
  const titleId = useId();
  const open = openId != null;
  const active = DOMAINS.find((d) => d.id === openId) ?? DOMAINS[0]!;
  const [host, setHost] = useState<HTMLElement | null>(null);

  const reading = useMemo(() => {
    if (!openId) return null;
    return generateFortune(openId, {
      realName: realName || nickname || seed,
      nickname: nickname || "คุณ",
      birthDate: birthDate || "2000-01-01",
      gender: "unspecified",
    });
  }, [openId, realName, nickname, birthDate, seed]);

  useEffect(() => {
    setHost(document.querySelector(".phone-frame") as HTMLElement | null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !reading || !host) return null;

  const displayTitle = reading.title.replace(/ของคุณ(?=\S)/, "ของคุณ ");

  return createPortal(
    <div
      className="no-sky-lift absolute inset-0 z-[80] flex items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label="ปิด"
        className="absolute inset-0 bg-[#2C2458]/40"
        onClick={onClose}
      />

      <div className="relative z-[1] flex max-h-[min(88%,640px)] w-full max-w-[400px] flex-col overflow-hidden rounded-[24px] bg-[#FBF8FF] ring-1 ring-[#7B6BB0]/14">
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-3 pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <FortuneIcon name={active.icon} size={40} plain />
            <div className="min-w-0">
              <p
                id={titleId}
                className="truncate text-[17px] font-semibold text-[#2C2458]"
              >
                {displayTitle}
              </p>
              <p className="mt-0.5 text-[12px] text-[#6B6490]">{active.blurb}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3EEFF] outline-none transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/45"
            aria-label="ปิด"
          >
            <X className="h-4 w-4 text-[#5E5688]" strokeWidth={2.2} />
          </button>
        </div>

        <div className="flex shrink-0 justify-center gap-1.5 px-3 pb-1">
          {DOMAINS.map((d) => {
            const selected = d.id === openId;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelect(d.id)}
                className={cn(
                  "inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[12px] font-medium outline-none transition sm:text-[13px]",
                  selected
                    ? "bg-[#9B7FE8] text-white"
                    : "bg-white text-[#5E5688] ring-1 ring-[#7B6BB0]/18"
                )}
              >
                <FortuneIcon name={d.icon} size={16} plain />
                <span className="truncate">{d.name}</span>
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <p className="text-[15px] leading-[1.75] text-[#3A3270]">
            {reading.content}
          </p>

          {reading.extras ? (
            <div className="mt-4 space-y-2.5">
              {Object.entries(reading.extras).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-[16px] bg-white px-3.5 py-3 ring-1 ring-[#7B6BB0]/12"
                >
                  <p className="text-[12px] font-medium text-[#6B6490]">{key}</p>
                  <p className="mt-1 text-[14px] font-semibold text-[#2C2458]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 bg-[#FBF8FF] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-[#7B5FD4] py-3 text-[14px] font-semibold text-white outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/45"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>,
    host
  );
}
