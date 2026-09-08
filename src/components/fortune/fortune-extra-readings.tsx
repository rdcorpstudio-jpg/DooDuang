"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { cn } from "@/lib/utils";

type ReadingItem = {
  id: "tarot" | "face" | "palm" | "wallpaper";
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
    icon: "/images/extra/wallpaper.jpg",
  },
];

/** Popular features — glass cards with large 3D icons */
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

  return (
    <section className={cn("space-y-3.5", className)}>
      <div className="px-0.5">
        <div className="mb-2.5 flex items-center gap-2">
          <FortuneIcon name="moon" size={28} />
          <p className="font-sacred text-[13px] tracking-[0.22em] text-[#C9A227]">
            DOODUANG
          </p>
        </div>
        <h2 className="text-[1.5rem] font-bold tracking-tight text-[#2C2458]">
          ฟีเจอร์ยอดนิยม
        </h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-[#5E5688]">
          เลือกวิธีดูดวงที่เหมาะกับคุณ
        </p>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {READINGS.map((item) => {
          const isLocked = item.locked && !unlocked;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "tarot") {
                  router.push(
                    `/reading/tarot?seed=${encodeURIComponent(seed)}`
                  );
                  return;
                }
                if (item.id === "wallpaper") {
                  router.push("/reading/wallpaper");
                  return;
                }
                if (item.id === "face" || item.id === "palm") {
                  if (isLocked) {
                    onUnlock?.();
                    return;
                  }
                  router.push(
                    `/reading/${item.id}?seed=${encodeURIComponent(seed)}`
                  );
                }
              }}
              className={cn(
                "fortune-glass relative flex flex-col items-center rounded-[18px] px-1 pb-2.5 pt-2.5 text-center outline-none transition",
                "active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/4"
              )}
              aria-label={
                isLocked ? `${item.title} · ต้องเป็นพรีเมียม` : item.title
              }
            >
              <span className="relative flex h-[5.5rem] w-full items-center justify-center">
                <Image
                  src={item.icon}
                  alt=""
                  width={110}
                  height={110}
                  unoptimized
                  className={cn(
                    "object-contain",
                    item.id === "wallpaper"
                      ? "h-[5rem] w-[3.8rem] rounded-[10px] object-cover shadow-[0_6px_14px_rgba(80,60,140,0.16)]"
                      : "h-[5.25rem] w-[5.25rem]"
                  )}
                />
                {isLocked ? (
                  <span className="absolute right-0 top-0 z-[1]">
                    <FortuneIcon name="lock" size={24} />
                  </span>
                ) : null}
              </span>

              <p className="mt-0.5 px-0.5 text-[11px] font-semibold leading-snug text-[#2C2458]">
                {item.title}
              </p>
              <span
                className={cn(
                  "mt-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                  isLocked
                    ? "bg-[#F4BC52]/22 text-[#8A6A12]"
                    : "bg-[#B9A4F0]/28 text-[#5B45B8]"
                )}
              >
                {isLocked ? "พรีเมียม" : item.badge}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
