"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

const DOMAINS = [
  {
    id: "work",
    name: "การงาน",
    tip: "จัดลำดับ",
    image: "/images/daily/work.png",
    glow: "rgba(70,221,237,0.55)",
    ring: "rgba(70,221,237,0.75)",
    ctaFrom: "#5EEAD4",
    ctaTo: "#38BDF8",
    titles: [
      "จัดลำดับให้ชัด งานจะไหลง่ายขึ้น",
      "โฟกัสทีละเรื่อง แล้วค่อยขยับต่อ",
      "ปิดงานค้างก่อนเปิดแนวใหม่",
    ],
    bodies: [
      "วันนี้เหมาะกับการเลือกงานสำคัญก่อน แล้วเคลียร์ทีละเรื่อง จะรู้สึกควบคุมสถานการณ์ได้ดีขึ้น",
      "หลายอย่างอาจเข้ามาพร้อมกัน ลองจัดลำดับก่อนเริ่ม แล้วโฟกัสวันละหนึ่งเรื่อง",
      "จังหวะเหมาะกับการปิดงานค้าง อย่าเปิดแนวรบใหม่จนกว่าของเดิมจะนิ่ง",
    ],
    actions: [
      "ลองทำวันนี้: เลือกงานหลัก 1 เรื่อง",
      "ลองทำวันนี้: เขียนลำดับงานสั้น ๆ",
      "ลองทำวันนี้: ปิดงานค้างอย่างน้อย 1 รายการ",
    ],
  },
  {
    id: "money",
    name: "การเงิน",
    tip: "รู้รายจ่าย",
    image: "/images/daily/money.png",
    glow: "rgba(244,188,82,0.5)",
    ring: "rgba(244,188,82,0.75)",
    ctaFrom: "#FDE68A",
    ctaTo: "#F4BC52",
    titles: [
      "รู้รายจ่ายชัด แล้วเงินจะนิ่งขึ้น",
      "เช็กตัวเลขก่อนตัดสินใจใหญ่",
      "เก็บก่อน ใช้ทีหลังอย่างมีแผน",
    ],
    bodies: [
      "ใส่ใจรายจ่ายเล็ก ๆ ที่เกิดซ้ำ และเผื่อเงินสำหรับสิ่งจำเป็นไว้ก่อน",
      "โอกาสเรื่องเงินมี แต่ควรเช็กตัวเลขให้ชัดก่อนตัดสินใจใหญ่",
      "เหมาะกับการเก็บและจัดระเบียบบัญชี มากกว่าการลงทุนเสี่ยง",
    ],
    actions: [
      "ลองทำวันนี้: จดรายจ่ายเล็ก ๆ 1 รอบ",
      "ลองทำวันนี้: ตั้งงบสั้น ๆ สำหรับสิ่งจำเป็น",
      "ลองทำวันนี้: ตรวจยอดก่อนจ่ายใหญ่",
    ],
  },
  {
    id: "love",
    name: "ความรัก",
    tip: "คุยให้ชัด",
    image: "/images/daily/love.png",
    glow: "rgba(241,109,181,0.5)",
    ring: "rgba(241,109,181,0.75)",
    ctaFrom: "#F9A8D4",
    ctaTo: "#F16DB5",
    titles: [
      "คุยให้ชัด ความเข้าใจจะตามมา",
      "เปิดใจฟังก่อนสรุป",
      "ใช้เวลาร่วมกันแบบเรียบง่ายก็พอ",
    ],
    bodies: [
      "การบอกความต้องการอย่างตรงไปตรงมา ช่วยให้เข้าใจกันมากขึ้น",
      "บรรยากาศอบอุ่นถ้าเปิดใจฟังก่อนตัดสิน อย่ารีบสรุปจากความรู้สึกชั่วขณะ",
      "เหมาะกับการใช้เวลาร่วมกันแบบเรียบง่าย มากกว่าการคาดหวังใหญ่",
    ],
    actions: [
      "ลองทำวันนี้: บอกความต้องการ 1 ประโยค",
      "ลองทำวันนี้: ฟังอีกฝ่ายให้จบก่อนตอบ",
      "ลองทำวันนี้: นัดเวลาสั้น ๆ ที่อยู่ด้วยกัน",
    ],
  },
  {
    id: "health",
    name: "สุขภาพ",
    tip: "พักให้พอ",
    image: "/images/daily/health.png",
    glow: "rgba(52,211,153,0.5)",
    ring: "rgba(52,211,153,0.75)",
    ctaFrom: "#6EE7B7",
    ctaTo: "#34D399",
    titles: [
      "เว้นที่ว่าง ให้ร่างกายและใจได้พัก",
      "พักให้พอ พลังจะกลับมาเอง",
      "ลดหักโหม แล้วจังหวะชีวิตจะนิ่มขึ้น",
    ],
    bodies: [
      "โฟกัสเรื่องการพัก จังหวะชีวิต และการดูแลตัวเองทั่วไป ไม่ใช่การวินิจฉัยโรคหรือทำนายการเจ็บป่วย",
      "ร่างกายฟื้นตัวได้ดีถ้าพักให้พอ ลดงานดึก และเติมน้ำให้สม่ำเสมอ",
      "เหมาะกับการเคลื่อนไหวเบา ๆ และนอนให้ครบ มากกว่าหักโหม",
    ],
    actions: [
      "ลองทำวันนี้: จัดช่วงพักสั้น ๆ 1 รอบ",
      "ลองทำวันนี้: นอนให้ครบกว่าปกติเล็กน้อย",
      "ลองทำวันนี้: ยืดไหล่และคอระหว่างวัน",
    ],
  },
] as const;

/** Daily 4 domains — glass tabs + detail card (art swap via data-slot) */
export function FortuneTopicGrid({
  seed = "dooduang",
  className,
}: {
  seed?: string;
  className?: string;
}) {
  const domains = useMemo(
    () =>
      DOMAINS.map((d) => {
        const i = hashSeed(`${seed}-daily-${d.id}`) % d.bodies.length;
        return {
          ...d,
          title: d.titles[i] ?? d.titles[0],
          body: d.bodies[i] ?? d.bodies[0],
          action: d.actions[i] ?? d.actions[0],
        };
      }),
    [seed]
  );

  const [activeId, setActiveId] = useState(domains[0]?.id ?? "work");
  const active = domains.find((d) => d.id === activeId) ?? domains[0];

  return (
    <section
      className={cn("overflow-hidden rounded-[22px] px-3.5 py-3.5", className)}
      style={{
        border: "1px solid transparent",
        backgroundImage: [
          "linear-gradient(165deg, rgba(18,29,54,0.72) 0%, rgba(22,28,58,0.62) 100%)",
          "linear-gradient(135deg, rgba(154,184,220,0.28), rgba(187,108,240,0.22))",
        ].join(", "),
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        backdropFilter: "blur(16px) saturate(1.15)",
        WebkitBackdropFilter: "blur(16px) saturate(1.15)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 28px rgba(8,4,24,0.22)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[17px] font-semibold text-[#F7F8FF]">
          ดวงรายวัน 4 ด้าน
        </h2>
        <span className="rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[11px] text-[#9AB8DC]">
          สำหรับวันนี้
        </span>
      </div>

      <div
        className="mt-3 grid grid-cols-4 gap-2"
        role="tablist"
        aria-label="ดวงรายวัน 4 ด้าน"
      >
        {domains.map((d) => {
          const selected = d.id === activeId;
          return (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(d.id)}
              className={cn(
                "flex flex-col items-center rounded-[16px] px-1 py-2.5 text-center outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#46DDED]/45",
                selected ? "bg-[#0C1427]/55" : "bg-white/[0.04]"
              )}
              style={
                selected
                  ? {
                      border: `1px solid ${d.ring}`,
                      boxShadow: `0 0 0 1px ${d.glow}, 0 0 18px ${d.glow}`,
                    }
                  : {
                      border: "1px solid rgba(255,255,255,0.08)",
                    }
              }
            >
              <span
                className="relative mb-1 block h-9 w-9"
                data-slot={`daily-tab-icon-${d.id}`}
              >
                <Image
                  src={d.image}
                  alt=""
                  width={72}
                  height={72}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              </span>
              <p className="text-[11px] font-semibold text-[#F7F8FF]">{d.name}</p>
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          role="tabpanel"
          className="mt-3 overflow-hidden rounded-[18px] px-3.5 py-3.5"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            background:
              "linear-gradient(160deg, rgba(12,20,39,0.72), rgba(24,32,68,0.55))",
          }}
        >
          <div className="flex items-center gap-3.5">
            <span
              className="relative flex h-[4.75rem] w-[4.75rem] shrink-0 items-center justify-center"
              data-slot={`daily-hero-art-${active.id}`}
            >
              {/* Swap later: /images/daily/{id}-hero.png */}
              <span
                className="pointer-events-none absolute inset-x-2 bottom-0 h-3 rounded-full blur-md"
                style={{ background: active.glow }}
                aria-hidden
              />
              <Image
                src={active.image}
                alt=""
                width={120}
                height={120}
                unoptimized
                className="relative h-[4.5rem] w-[4.5rem] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
              />
            </span>

            <span className="h-14 w-px shrink-0 bg-white/10" aria-hidden />

            <div className="min-w-0 flex-1">
              <h3 className="text-[16px] font-semibold leading-snug text-[#F7F8FF]">
                {active.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-[1.65] text-[#9AB8DC]">
                {active.body}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="mt-3.5 flex w-full items-center gap-2 rounded-full px-3.5 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            style={{
              background: `linear-gradient(90deg, ${active.ctaFrom}, ${active.ctaTo})`,
              boxShadow: `0 6px 18px ${active.glow}`,
            }}
          >
            <Lightbulb
              className="h-4 w-4 shrink-0 text-[#0C1427]"
              strokeWidth={2}
            />
            <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-[#0C1427]">
              {active.action}
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-[#0C1427]/70"
              strokeWidth={2.2}
            />
          </button>
        </div>
      ) : null}
    </section>
  );
}
