"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type CSSProperties } from "react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { cn } from "@/lib/utils";

type ReadingItem = {
  id: "tarot" | "face" | "palm" | "wallpaper" | "couple";
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
    icon: "/images/extra/tarot.png",
  },
  {
    id: "face",
    title: "ดูโหงวเฮ้ง",
    badge: "พรีเมียม",
    locked: true,
    icon: "/images/extra/face.png",
  },
  {
    id: "palm",
    title: "ดูลายมือ",
    badge: "พรีเมียม",
    locked: true,
    icon: "/images/extra/palm.png",
  },
  {
    id: "wallpaper",
    title: "วอลเปเปอร์มงคล",
    badge: "พรีเมียม",
    locked: true,
    icon: "/images/extra/wallpaper.png",
  },
  {
    id: "couple",
    title: "ดวงคู่",
    badge: "พรีเมียม",
    locked: true,
    icon: "/images/extra/couple.png",
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
      router.push("/premium");
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
        <h2 className="dd-section-title text-[1.5rem] font-bold tracking-tight">
          ฟีเจอร์ยอดนิยม
        </h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-[#5E5688]">
          เลือกวิธีดูดวงที่เหมาะกับคุณ
        </p>
      </div>

      <div
        ref={ref}
        className="extra-readings-scroll w-full min-w-0 cursor-grab overflow-x-auto overscroll-x-contain active:cursor-grabbing"
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x",
        }}
      >
        <div className="flex w-max items-stretch gap-1.5 px-3 pb-0.5">
          {READINGS.map((item, index) => {
            const isLocked = item.locked && !unlocked;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openItem(item, isLocked)}
                className={cn(
                  "fortune-glass dd-feature-pop relative box-border flex h-[10.5rem] w-[7.25rem] shrink-0 flex-col items-center overflow-hidden rounded-[16px] px-2 pb-2.5 pt-2.5 text-center outline-none transition",
                  "select-none touch-manipulation active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/4"
                )}
                style={
                  {
                    "--dd-pop-delay": `${80 + index * 70}ms`,
                  } as CSSProperties
                }
                aria-label={
                  isLocked ? `${item.title} · ต้องเป็นพรีเมียม` : item.title
                }
              >
                <span
                  className="dd-icon-float relative flex h-[4.75rem] w-[4.75rem] shrink-0 items-center justify-center"
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
                    className="pointer-events-none h-full w-full object-contain drop-shadow-[0_5px_10px_rgba(80,60,140,0.16)]"
                  />
                  {isLocked ? (
                    <span className="pointer-events-none absolute -right-0.5 top-0.5 z-[1]">
                      <FortuneIcon name="lock" size={18} />
                    </span>
                  ) : null}
                </span>

                <p className="mt-1 flex h-[2.6rem] w-full shrink-0 items-center justify-center px-0.5 text-[11.5px] font-semibold leading-tight text-[#2C2458]">
                  <span className="line-clamp-2">{item.title}</span>
                </p>
                <span className="mt-auto shrink-0 rounded-full bg-[#B9A4F0]/28 px-2 py-0.5 text-[10px] font-semibold leading-none text-[#5B45B8]">
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
