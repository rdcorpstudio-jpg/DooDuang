"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Hand, Lock, ScanFace, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type ReadingItem = {
  id: "tarot" | "face" | "palm";
  title: string;
  sub: string;
  accent: string;
  image: string;
  Icon: typeof Sparkles;
  locked: boolean;
};

const READINGS: ReadingItem[] = [
  {
    id: "tarot",
    title: "ดูไพ่รายวัน",
    sub: "เปิดฟรี",
    accent: "#BB6CF0",
    image: "/images/readings/tarot.png",
    Icon: Sparkles,
    locked: false,
  },
  {
    id: "face",
    title: "ดูโหงวเฮ้ง",
    sub: "พรีเมียม",
    accent: "#F4BC52",
    image: "/images/readings/face.png",
    Icon: ScanFace,
    locked: true,
  },
  {
    id: "palm",
    title: "ดูลายมือ",
    sub: "พรีเมียม",
    accent: "#46DDED",
    image: "/images/readings/palm.png",
    Icon: Hand,
    locked: true,
  },
];

function ReadingArt({
  src,
  accent,
  Icon,
}: {
  src: string;
  accent: string;
  Icon: typeof Sparkles;
}) {
  const [missing, setMissing] = useState(false);

  return (
    <span className="relative flex h-[4.25rem] w-[4.25rem] items-center justify-center">
      {!missing ? (
        <Image
          src={src}
          alt=""
          width={128}
          height={128}
          unoptimized
          className="h-full w-full object-contain"
          style={{ mixBlendMode: "screen" }}
          onError={() => setMissing(true)}
        />
      ) : (
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: `${accent}22`,
            boxShadow: `inset 0 0 0 1px ${accent}55`,
          }}
        >
          <Icon className="h-6 w-6" style={{ color: accent }} strokeWidth={1.7} />
        </span>
      )}
    </span>
  );
}

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
    <section className={cn("space-y-2.5", className)}>
      <div className="px-0.5">
          <h2 className="text-[17px] font-semibold tracking-wide text-[#F7F8FF]">
            ฟีเจอยอดนิยม
          </h2>
        <p className="mt-0.5 text-[12px] text-[#9AB8DC]">
          เลือกวิธีดู · บางอันปลดล็อกด้วยพรีเมียม
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {READINGS.map((item) => {
          const isLocked = item.locked && !unlocked;
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
                  if (unlocked) {
                    try {
                      sessionStorage.setItem(
                        "dooduang-premium-unlocked",
                        "1"
                      );
                    } catch {
                      /* ignore */
                    }
                  }
                  router.push(
                    `/reading/${item.id}?seed=${encodeURIComponent(seed)}`
                  );
                }
              }}
              className={cn(
                "fortune-tap relative flex flex-col items-center gap-2 rounded-[18px] px-1 py-2 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-white/30",
                isLocked && "opacity-90"
              )}
              aria-label={
                isLocked ? `${item.title} · ต้องเป็นพรีเมียม` : item.title
              }
            >
              {isLocked ? (
                <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0C1427]/75 ring-1 ring-[#F4BC52]/45">
                  <Lock className="h-3 w-3 text-[#F4BC52]" strokeWidth={2.2} />
                </span>
              ) : null}

              <ReadingArt
                src={item.image}
                accent={item.accent}
                Icon={item.Icon}
              />

              <div className="min-w-0">
                <p className="text-[12px] font-semibold leading-snug text-[#F7F8FF]">
                  {item.title}
                </p>
                <p
                  className="mt-0.5 text-[10px] font-medium"
                  style={{ color: isLocked ? "#F4BC52" : item.accent }}
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
