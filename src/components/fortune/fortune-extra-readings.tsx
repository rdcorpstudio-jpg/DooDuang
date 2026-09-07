"use client";

import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type ReadingItem = {
  id: "tarot" | "face" | "palm";
  title: string;
  sub: string;
  locked: boolean;
  tone: "violet" | "gold" | "cyan";
};

const READINGS: ReadingItem[] = [
  {
    id: "tarot",
    title: "ดูไพ่รายวัน",
    sub: "เปิดฟรี",
    locked: false,
    tone: "violet",
  },
  {
    id: "face",
    title: "ดูโหงวเฮ้ง",
    sub: "พรีเมียม",
    locked: true,
    tone: "gold",
  },
  {
    id: "palm",
    title: "ดูลายมือ",
    sub: "พรีเมียม",
    locked: true,
    tone: "cyan",
  },
];

const TONE = {
  violet: {
    ring: "rgba(187,108,240,0.35)",
    soft: "rgba(187,108,240,0.16)",
    text: "#D2A8F5",
  },
  gold: {
    ring: "rgba(228,197,106,0.4)",
    soft: "rgba(228,197,106,0.14)",
    text: "#E4C56A",
  },
  cyan: {
    ring: "rgba(70,221,237,0.35)",
    soft: "rgba(70,221,237,0.14)",
    text: "#7EDFEA",
  },
} as const;

function TarotGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" aria-hidden>
      <rect
        x="14"
        y="8"
        width="20"
        height="32"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M24 16.5l1.4 2.9 3.2.5-2.3 2.2.5 3.2L24 23.6l-2.8 1.7.5-3.2-2.3-2.2 3.2-.5L24 16.5z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M18 34h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

function FaceGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" aria-hidden>
      <path
        d="M16 18c0-4.4 3.6-8 8-8s8 3.6 8 8v6c0 4.4-3.6 8-8 8s-8-3.6-8-8v-6z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M19.5 22.5c.8-.9 1.8-1.4 2.8-1.4M28.5 22.5c-.8-.9-1.8-1.4-2.8-1.4"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path
        d="M22.2 28.2c1.1.9 2.5.9 3.6 0"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path
        d="M13 15l3 3M35 15l-3 3M13 33l3-3M35 33l-3-3"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

function PalmGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" aria-hidden>
      <path
        d="M18 22v-5.5a2.2 2.2 0 0 1 4.4 0V22M22.4 21.5v-7.2a2.2 2.2 0 0 1 4.4 0v7.2M26.8 22v-5.8a2.2 2.2 0 0 1 4.4 0V26c0 5-3.4 9-8.2 9h-1.4C17.2 35 14 30.8 14 26.2V24a2.2 2.2 0 0 1 4-1.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 28.5c2.2 1.4 4.8 1.6 7.2.4"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

function ReadingGlyph({ id }: { id: ReadingItem["id"] }) {
  if (id === "tarot") return <TarotGlyph />;
  if (id === "face") return <FaceGlyph />;
  return <PalmGlyph />;
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
                "fortune-tap fortune-glass relative flex flex-col items-center gap-2.5 rounded-[20px] px-2 py-3.5 text-center outline-none transition",
                "focus-visible:ring-2 focus-visible:ring-[#F4BC52]/35"
              )}
              aria-label={
                isLocked ? `${item.title} · ต้องเป็นพรีเมียม` : item.title
              }
            >
              {isLocked ? (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/35 ring-1 ring-[#F4BC52]/35">
                  <Lock
                    className="h-2.5 w-2.5 text-[#F4BC52]"
                    strokeWidth={2.4}
                  />
                </span>
              ) : null}

              <span
                className="flex h-[3.6rem] w-[3.6rem] items-center justify-center rounded-[18px]"
                style={{
                  color: tone.text,
                  background: `linear-gradient(160deg, ${tone.soft}, rgba(255,255,255,0.04))`,
                  boxShadow: `inset 0 0 0 1px ${tone.ring}`,
                }}
              >
                <ReadingGlyph id={item.id} />
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
