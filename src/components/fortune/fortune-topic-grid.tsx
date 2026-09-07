"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type DomainTone = {
  soft: string;
  accent: string;
  ctaFrom: string;
  ctaTo: string;
};

const DOMAIN_TONES: DomainTone[] = [
  {
    soft: "rgba(255, 184, 77, 0.22)",
    accent: "#FFB84D",
    ctaFrom: "#FFC857",
    ctaTo: "#F5A623",
  },
  {
    soft: "rgba(255, 107, 157, 0.2)",
    accent: "#FF6B9D",
    ctaFrom: "#FF8FB3",
    ctaTo: "#E85A8A",
  },
  {
    soft: "rgba(110, 168, 255, 0.2)",
    accent: "#6EA8FF",
    ctaFrom: "#8BBCFF",
    ctaTo: "#4F8FE8",
  },
  {
    soft: "rgba(122, 230, 176, 0.2)",
    accent: "#7AE6B0",
    ctaFrom: "#8FF0C0",
    ctaTo: "#4FCB93",
  },
];

const DOMAIN_META = [
  {
    id: "career",
    name: "การงาน",
    title: "โฟกัสงานที่สร้างผลจริง",
    body: "วันนี้เหมาะกับงานที่วัดผลได้ชัด ตัดงานฟุ้งออกก่อน แล้วลงมือกับชิ้นที่ขยับตัวเลขหรือความคืบหน้าได้ในวันเดียว",
    action: "ลองทำวันนี้: ปิดงานค้าง 1 ชิ้นให้จบ",
    image: "/images/daily/work.png",
  },
  {
    id: "love",
    name: "ความรัก",
    title: "พูดสั้น ๆ แต่จริงใจ",
    body: "ความสัมพันธ์ดีขึ้นเมื่อสื่อสารตรงจุด ไม่ต้องยาว แค่บอกความรู้สึกหรือความต้องการอย่างนุ่มนวลก็พอ",
    action: "ลองทำวันนี้: ส่งข้อความดี ๆ 1 ข้อความ",
    image: "/images/daily/love.png",
  },
  {
    id: "money",
    name: "การเงิน",
    title: "คุมรายจ่ายก่อนขยายแผน",
    body: "จังหวะเงินวันนี้ดีกับการจัดระเบียบ ไม่ใช่การเสี่ยงใหญ่ ดูรายจ่ายซ้ำซ้อนก่อน แล้วค่อยวางแผนรอบถัดไป",
    action: "ลองทำวันนี้: เช็ครายจ่ายที่ไม่จำเป็น 1 รายการ",
    image: "/images/daily/money.png",
  },
  {
    id: "health",
    name: "สุขภาพ",
    title: "เว้นที่ว่าง ให้ร่างกายและใจได้พัก",
    body: "โฟกัสการพักและจังหวะชีวิต อย่าเร่งทุกอย่างในวันเดียว เว้นช่องว่างให้ร่างกายฟื้นตัว",
    action: "ลองทำวันนี้: จัดช่วงพักสั้น ๆ 1 รอบ",
    image: "/images/daily/health.png",
  },
] as const;

const SWIPE_THRESHOLD = 48;
const AUTO_MS = 7000;

export function FortuneTopicGrid({ className }: { className?: string }) {
  const domains = DOMAIN_META.map((d, i) => ({ ...d, ...DOMAIN_TONES[i]! }));
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [slideDir, setSlideDir] = useState<"next" | "prev">("next");
  const [autoPlay, setAutoPlay] = useState(true);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const stopAuto = useCallback(() => {
    setAutoPlay(false);
  }, []);

  const goTo = useCallback(
    (next: number, dir?: "next" | "prev", fromUser = false) => {
      if (fromUser) stopAuto();
      const clamped = Math.max(0, Math.min(domains.length - 1, next));
      if (clamped === activeIndexRef.current) return;
      setSlideDir(
        dir ?? (clamped > activeIndexRef.current ? "next" : "prev")
      );
      setActiveIndex(clamped);
      setDragX(0);
      setIsDragging(false);
    },
    [domains.length, stopAuto]
  );

  useEffect(() => {
    if (!autoPlay || isDragging) return;
    const id = window.setInterval(() => {
      const cur = activeIndexRef.current;
      const next = (cur + 1) % domains.length;
      setSlideDir("next");
      setActiveIndex(next);
      setDragX(0);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [autoPlay, isDragging, domains.length]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    stopAuto();
    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    movedRef.current = false;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 6) movedRef.current = true;
    setDragX(dx);
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    const dx = e.clientX - startXRef.current;
    pointerIdRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    setIsDragging(false);
    setDragX(0);

    const cur = activeIndexRef.current;
    if (!movedRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < rect.width * 0.35) goTo(cur - 1, "prev", true);
      else if (x > rect.width * 0.65) goTo(cur + 1, "next", true);
      return;
    }

    if (dx <= -SWIPE_THRESHOLD) goTo(cur + 1, "next", true);
    else if (dx >= SWIPE_THRESHOLD) goTo(cur - 1, "prev", true);
  };

  const d = domains[activeIndex]!;

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold tracking-wide text-[#F7F8FF]">
            ดวงรายวัน 4 ด้าน
          </h2>
          <p className="mt-0.5 text-[12px] text-[#9AB8DC]">
            ปัดหรือลากดูทีละด้าน · สำหรับวันนี้
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
          {domains.map((item, i) => {
            const active = i === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.name}
                aria-current={active}
                onClick={() => goTo(i, undefined, true)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border outline-none transition active:scale-95",
                  active
                    ? "border-[#E4C56A]/55 bg-[#F4BC52]/16"
                    : "border-[#E4C56A]/22 bg-white/[0.05] opacity-55 hover:opacity-90"
                )}
                style={
                  active
                    ? {
                        boxShadow:
                          "0 0 0 1px rgba(228,197,106,0.35), 0 4px 12px rgba(212,175,85,0.18)",
                      }
                    : undefined
                }
              >
                <Image
                  src={item.image}
                  alt=""
                  width={28}
                  height={28}
                  unoptimized
                  className="pointer-events-none h-3.5 w-3.5 object-contain"
                />
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="cursor-grab touch-pan-y overflow-hidden rounded-[22px] active:cursor-grabbing"
        style={{
          border: "1px solid rgba(228, 197, 106, 0.42)",
          background: `linear-gradient(165deg, rgba(90,60,160,0.38) 0%, rgba(10,14,32,0.72) 45%, rgba(24,18,48,0.66) 100%)`,
          boxShadow:
            "0 14px 34px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,236,190,0.1)",
          transform: `translate3d(${isDragging ? dragX * 0.4 : 0}px, 0, 0)`,
          transition: isDragging
            ? "none"
            : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        role="region"
        aria-roledescription="carousel"
        aria-label="ดวงรายวัน 4 ด้าน"
      >
        <article
          key={`${d.id}-${slideDir}-${activeIndex}`}
          className={cn(
            "px-4 py-4 will-change-transform",
            slideDir === "next" ? "daily-card-slide-next" : "daily-card-slide-prev"
          )}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ background: d.soft }}
            >
              <Image
                src={d.image}
                alt=""
                width={56}
                height={56}
                unoptimized
                className="pointer-events-none h-7 w-7 object-contain"
              />
            </span>
            <div className="min-w-0">
              <p
                className="text-[12px] font-semibold tracking-wide"
                style={{ color: d.accent }}
              >
                {d.name}
              </p>
              <h3 className="mt-0.5 text-[16px] font-semibold leading-snug text-[#F7F8FF]">
                {d.title}
              </h3>
            </div>
          </div>

          <div className="mt-3.5 flex items-start gap-3.5">
            <span className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center">
              <span
                className="pointer-events-none absolute inset-1 rounded-full opacity-70 blur-md"
                style={{ background: d.soft }}
                aria-hidden
              />
              <Image
                src={d.image}
                alt=""
                width={112}
                height={112}
                unoptimized
                className="pointer-events-none relative h-[4.25rem] w-[4.25rem] object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]"
              />
            </span>
            <p className="min-w-0 flex-1 pt-0.5 text-[13.5px] leading-[1.65] text-[#C8D6EC]/90">
              {d.body}
            </p>
          </div>

          <div
            className="pointer-events-none mt-4 flex w-full items-center gap-2 rounded-full px-3.5 py-2.5"
            style={{
              background: `linear-gradient(90deg, ${d.ctaFrom}, ${d.ctaTo})`,
              boxShadow: `0 8px 20px ${d.accent}33`,
            }}
          >
            <Lightbulb
              className="h-4 w-4 shrink-0 text-[#0C1427]"
              strokeWidth={2}
            />
            <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-[#0C1427]">
              {d.action}
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-[#0C1427]/70"
              strokeWidth={2.2}
            />
          </div>
        </article>
      </div>
    </section>
  );
}
