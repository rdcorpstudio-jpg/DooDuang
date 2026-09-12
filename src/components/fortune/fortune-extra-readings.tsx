"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type CSSProperties } from "react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { cn } from "@/lib/utils";

type ReadingItem = {
  id: "tarot" | "face" | "palm" | "wallpaper" | "couple" | "bazi";
  title: string;
  badge: string;
  locked: boolean;
  icon: string;
};

const READINGS: ReadingItem[] = [
  {
    id: "tarot",
    title: "ไพ่รายวัน",
    badge: "ดูฟรี",
    locked: false,
    icon: "/images/extra/tarot.webp?v=mae6",
  },
  {
    id: "bazi",
    title: "ปาจื้อ",
    badge: "พรีเมียม",
    locked: true,
    icon: "/images/extra/bazi.webp?v=mae6",
  },
  {
    id: "face",
    title: "ดูโหงวเฮ้ง",
    badge: "พรีเมียม",
    locked: true,
    icon: "/images/extra/face.webp?v=mae6",
  },
  {
    id: "palm",
    title: "ดูลายมือ",
    badge: "พรีเมียม",
    locked: true,
    icon: "/images/extra/palm.webp?v=mae6",
  },
  {
    id: "wallpaper",
    title: "วอลเปเปอร์มงคล",
    badge: "พรีเมียม",
    locked: true,
    icon: "/images/extra/wallpaper.webp?v=mae6",
  },
  {
    id: "couple",
    title: "ดวงคู่",
    badge: "พรีเมียม",
    locked: true,
    icon: "/images/extra/couple.webp?v=mae6",
  },
];

/** Mouse drag-to-scroll — touch uses native overflow; never steal taps */
function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({
    active: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
    pointerId: -1,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      // Touch / pen: native pan-x handles scroll; buttons keep their clicks
      if (e.pointerType !== "mouse") return;
      if (e.button !== 0) return;
      state.current = {
        active: true,
        moved: false,
        startX: e.clientX,
        scrollLeft: el.scrollLeft,
        pointerId: e.pointerId,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!state.current.active) return;
      if (e.pointerId !== state.current.pointerId) return;
      const dx = e.clientX - state.current.startX;
      if (Math.abs(dx) <= 8) return;
      if (!state.current.moved) {
        state.current.moved = true;
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
      el.scrollLeft = state.current.scrollLeft - dx;
      e.preventDefault();
    };

    const end = (e: PointerEvent) => {
      if (!state.current.active) return;
      if (e.pointerId !== state.current.pointerId) return;
      const wasMoved = state.current.moved;
      try {
        if (el.hasPointerCapture(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* ignore */
      }
      state.current.active = false;
      state.current.pointerId = -1;
      // Block the click that browsers fire after a drag
      if (wasMoved) {
        const suppress = (ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
          el.removeEventListener("click", suppress, true);
        };
        el.addEventListener("click", suppress, true);
        window.setTimeout(() => {
          el.removeEventListener("click", suppress, true);
          state.current.moved = false;
        }, 0);
      } else {
        state.current.moved = false;
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("lostpointercapture", end);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
      el.removeEventListener("lostpointercapture", end);
    };
  }, []);

  return {
    ref,
    didDrag: () => state.current.moved,
  };
}

/** Popular features — horizontal scroll cards */
export function FortuneExtraReadings({
  seed,
  unlocked = false,
  onUnlock,
  className,
}: {
  seed: string;
  unlocked?: boolean;
  onUnlock?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const { ref, didDrag } = useDragScroll();

  function openItem(item: ReadingItem, isLocked: boolean) {
    if (didDrag()) return;
    if (item.id === "tarot") {
      router.push(`/reading/tarot?seed=${encodeURIComponent(seed)}`);
      return;
    }
    if (isLocked) {
      if (onUnlock) {
        onUnlock();
        return;
      }
      router.push("/menu");
      return;
    }
    if (item.id === "bazi") {
      router.push("/reading/bazi");
      return;
    }
    if (item.id === "wallpaper") {
      router.push("/reading/wallpaper");
      return;
    }
    if (item.id === "couple") {
      router.push("/premium/couple");
      return;
    }
    if (item.id === "face" || item.id === "palm") {
      router.push(`/reading/${item.id}?seed=${encodeURIComponent(seed)}`);
    }
  }

  return (
    <section className={cn("min-w-0 space-y-3.5", className)}>
      <div className="px-3">
        <h2 className="text-[15px] font-semibold tracking-wide text-[#d5b16f]">
          ฟีเจอร์ยอดนิยม
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-[#f7f4ec]/65">
          เลือกวิธีดูดวงที่เหมาะกับคุณ
        </p>
      </div>

      <div
        ref={ref}
        className="extra-readings-scroll no-tap w-full min-w-0 cursor-grab overflow-x-auto overscroll-x-contain active:cursor-grabbing"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex w-max items-stretch gap-2 px-3 pb-0.5">
          {READINGS.map((item, index) => {
            const isLocked = item.locked && !unlocked;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openItem(item, isLocked)}
                className={cn(
                  "mae-aspect-card dd-feature-pop relative box-border flex h-[10.5rem] w-[7.25rem] shrink-0 flex-col items-center overflow-hidden px-2 pb-2.5 pt-2.5 text-center outline-none transition",
                  "no-tap select-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#e0cc9f]/35"
                )}
                style={
                  {
                    touchAction: "manipulation",
                    "--dd-pop-delay": `${80 + index * 70}ms`,
                  } as CSSProperties
                }
                aria-label={
                  isLocked ? `${item.title} · ต้องเป็นพรีเมียม` : item.title
                }
              >
                <span
                  className="dd-icon-float relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center"
                  style={
                    {
                      "--dd-float-delay": `${index * 0.35}s`,
                    } as CSSProperties
                  }
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={104}
                    height={104}
                    unoptimized
                    draggable={false}
                    className="pointer-events-none h-full w-full object-contain"
                  />
                  {isLocked ? (
                    <span className="pointer-events-none absolute -right-0.5 top-0.5 z-[1]">
                      <FortuneIcon name="lock-gold" size={18} plain />
                    </span>
                  ) : null}
                </span>

                <p className="mae-aspect-title mt-2 flex min-h-[2.2rem] w-full shrink-0 items-center justify-center px-0.5 text-[11.5px] font-semibold leading-snug text-[#e8d19a]">
                  <span className="line-clamp-2">{item.title}</span>
                </p>
                <span
                  className="mt-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none text-[#e8d19a]"
                  style={{
                    background: "rgba(213,177,111,0.14)",
                    boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
                  }}
                >
                  {isLocked ? "พรีเมียม" : item.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
