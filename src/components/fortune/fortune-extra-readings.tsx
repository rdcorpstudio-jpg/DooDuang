"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type ReadingItem = {
  id: "tarot" | "face" | "palm";
  title: string;
  sub: string;
  locked: boolean;
  tone: "violet" | "gold" | "cyan";
  icon: string;
};

const READINGS: ReadingItem[] = [
  {
    id: "tarot",
    title: "ดูไพ่รายวัน",
    sub: "เปิดฟรี",
    locked: false,
    tone: "violet",
    icon: "/images/extra/tarot.png",
  },
  {
    id: "face",
    title: "ดูโหงวเฮ้ง",
    sub: "พรีเมียม",
    locked: true,
    tone: "gold",
    icon: "/images/extra/face.png",
  },
  {
    id: "palm",
    title: "ดูลายมือ",
    sub: "พรีเมียม",
    locked: true,
    tone: "cyan",
    icon: "/images/extra/palm.png",
  },
];

const TONE = {
  violet: { text: "#D2A8F5" },
  gold: { text: "#E4C56A" },
  cyan: { text: "#7EDFEA" },
} as const;

/** Extra reading entry points — tarot free; face & palm premium-locked */
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
    <section className={cn("space-y-3", className)}>
      <div className="px-0.5">
        <p className="fortune-section-kicker">Explore</p>
        <h2 className="fortune-section-title mt-1">ฟีเจอร์ยอดนิยม</h2>
        <p className="mt-1 text-[12px] leading-relaxed text-[#C2C9DB]/88">
          เลือกวิธีดู · บางอันปลดล็อกด้วยพรีเมียม
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {READINGS.map((item) => {
          const isLocked = item.locked && !unlocked;
          const tone = TONE[item.tone];

          return (
            <button
              key={item.id}
              type="button"
              data-slot={`reading-card-${item.id}`}
              onClick={() => {
                if (item.id === "tarot") {
                  router.push(
                    `/reading/tarot?seed=${encodeURIComponent(seed)}`
                  );
                  return;
                }
                if (item.id === "face" || item.id === "palm") {
                  if (isLocked) {
                    onUnlock?.();
                    return;
                  }
                  try {
                    sessionStorage.setItem(
                      "dooduang-premium-unlocked",
                      "1"
                    );
                  } catch {
                    /* ignore */
                  }
                  router.push(
                    `/reading/${item.id}?seed=${encodeURIComponent(seed)}`
                  );
                }
              }}
              className={cn(
                "fortune-tap fortune-glass relative flex flex-col items-center gap-2 rounded-[20px] px-2 py-3 text-center outline-none transition",
                "focus-visible:ring-2 focus-visible:ring-white/25"
              )}
              aria-label={
                isLocked ? `${item.title} · ต้องเป็นพรีเมียม` : item.title
              }
            >
              {isLocked ? (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/35">
                  <Lock
                    className="h-2.5 w-2.5 text-[#E4C56A]"
                    strokeWidth={2.4}
                  />
                </span>
              ) : null}

              <span className="relative flex h-[4.1rem] w-[4.1rem] items-center justify-center">
                <Image
                  src={item.icon}
                  alt=""
                  width={72}
                  height={72}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              </span>

              <div className="min-w-0 px-0.5">
                <p className="text-[12px] font-semibold leading-snug text-[#F5F2EA]">
                  {item.title}
                </p>
                <p
                  className="mt-0.5 text-[10px] font-medium"
                  style={{ color: isLocked ? "#E4C56A" : tone.text }}
                >
                  {isLocked ? "ล็อก · พรีเมียม" : item.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
