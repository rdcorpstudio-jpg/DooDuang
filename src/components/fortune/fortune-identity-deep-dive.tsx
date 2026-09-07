"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Gem, Settings2, Users, UserRound } from "lucide-react";
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
    detailTitle: "การงานวันนี้",
    image: "/images/daily/work.png?v=2",
    bodies: [
      "พลังงานงานอาจไม่เต็มร้อย งานบางอย่างอาจล่าช้ากว่าที่คิด แนะนำให้ใจเย็นและค่อย ๆ เคลียร์ทีละเรื่อง",
      "หลายอย่างอาจเข้ามาพร้อมกัน ลองจัดลำดับก่อนเริ่ม แล้วโฟกัสงานสำคัญวันละหนึ่งเรื่อง",
      "จังหวะเหมาะกับการปิดงานค้าง อย่าเปิดแนวรบใหม่จนกว่าของเดิมจะนิ่ง",
    ],
  },
  {
    id: "money",
    name: "การเงิน",
    detailTitle: "การเงินวันนี้",
    image: "/images/daily/money.png?v=2",
    bodies: [
      "ใส่ใจรายจ่ายเล็ก ๆ ที่เกิดซ้ำ และเผื่อเงินสำหรับสิ่งจำเป็นไว้ก่อน",
      "โอกาสเรื่องเงินมี แต่ควรเช็กตัวเลขให้ชัดก่อนตัดสินใจใหญ่",
      "เหมาะกับการเก็บและจัดระเบียบบัญชี มากกว่าการลงทุนเสี่ยง",
    ],
  },
  {
    id: "love",
    name: "ความรัก",
    detailTitle: "ความรักวันนี้",
    image: "/images/daily/love.png?v=2",
    bodies: [
      "การบอกความต้องการอย่างตรงไปตรงมา ช่วยให้เข้าใจกันมากขึ้น",
      "บรรยากาศอบอุ่นถ้าเปิดใจฟังก่อนตัดสิน อย่ารีบสรุปจากความรู้สึกชั่วขณะ",
      "เหมาะกับการใช้เวลาร่วมกันแบบเรียบง่าย มากกว่าการคาดหวังใหญ่",
    ],
  },
  {
    id: "health",
    name: "สุขภาพ",
    detailTitle: "สุขภาพวันนี้",
    image: "/images/daily/health.png?v=2",
    bodies: [
      "ร่างกายฟื้นตัวได้ดีถ้าพักให้พอ ลดงานดึกและเติมน้ำให้สม่ำเสมอ",
      "พลังกายยังใช้ได้ แต่ระวังสะสมความเครียดที่คอและไหล่",
      "เหมาะกับการเคลื่อนไหวเบา ๆ และนอนให้ครบมากกว่าหักโหม",
    ],
  },
] as const;

/** Soft daily board — Mu-style layout with 3D orb icons */
export function FortuneIdentityDeepDive({
  seed = "dooduang",
  className,
}: {
  seed?: string;
  className?: string;
}) {
  const domains = useMemo(
    () =>
      DOMAINS.map((d) => {
        const pct = 35 + (hashSeed(`${seed}-${d.id}`) % 66);
        const body =
          d.bodies[hashSeed(`${seed}-body-${d.id}`) % d.bodies.length] ??
          d.bodies[0];
        return { ...d, pct: Math.min(100, pct), body };
      }),
    [seed]
  );

  const [activeId, setActiveId] = useState<string>(domains[0]?.id ?? "work");
  const active = domains.find((d) => d.id === activeId) ?? domains[0];

  return (
    <div className={cn("space-y-3.5", className)}>
      <section className="fortune-dash-card rounded-[22px] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <UserRound className="h-4 w-4 shrink-0 text-[#e8c547]" strokeWidth={1.7} />
            <h2 className="text-[15px] font-semibold tracking-wide text-white">
              ตัวตนพื้นฐาน
              <span className="text-[#e8c547]/90">ของคุณ</span>
            </h2>
          </div>
          <p className="max-w-[9.5rem] pt-0.5 text-right text-[10.5px] leading-snug text-white/38">
            สิ่งดี ๆ ในตัวคุณ คือพลังที่พาไปได้ไกล
          </p>
        </div>

        <p className="mt-3 text-[13.5px] font-light leading-relaxed text-white/55">
          ใส่ใจรายละเอียด รับผิดชอบ และให้ความสำคัญกับความรู้สึกของคนรอบข้าง
        </p>

        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          <div className="fortune-dash-inset rounded-[14px] px-3 py-3">
            <div className="flex items-center gap-1.5">
              <Gem className="h-3.5 w-3.5 text-[#e8c547]" strokeWidth={1.7} />
              <p className="text-[12.5px] font-semibold text-white">จุดแข็ง</p>
            </div>
            <ul className="mt-2.5 space-y-1.5 text-[12.5px] text-white/65">
              {["รอบคอบ", "อดทน", "รับฟัง"].map((t) => (
                <li key={t} className="flex gap-1.5">
                  <span className="text-[#e8c547]/65">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="fortune-dash-inset rounded-[14px] px-3 py-3">
            <div className="flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5 text-[#c4a8ff]" strokeWidth={1.7} />
              <p className="text-[12.5px] font-semibold text-white">สิ่งที่ควรปรับ</p>
            </div>
            <ul className="mt-2.5 space-y-1.5 text-[12.5px] text-white/65">
              {["คิดมาก", "เกรงใจ", "แบกภาระ"].map((t) => (
                <li key={t} className="flex gap-1.5">
                  <span className="text-[#c4a8ff]/70">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="fortune-dash-inset mt-2.5 flex items-start gap-2 rounded-[14px] px-3 py-3">
          <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#67e8f9]/85" strokeWidth={1.7} />
          <p className="text-[12.5px] leading-snug text-white/65">
            <span className="font-medium text-white/85">คนอื่นมองคุณ:</span>{" "}
            ไว้ใจได้ แต่ไม่ค่อยบอกว่าเหนื่อย
          </p>
        </div>
      </section>

      <section className="fortune-soft-board rounded-[24px] px-3.5 pb-4 pt-3.5">
        <h2 className="font-sacred text-[1.15rem] leading-none tracking-wide text-[#3d1f72]">
          ดวงรายวัน
        </h2>

        <div className="mt-3.5 grid grid-cols-4 gap-1">
          {domains.map((d) => {
            const selected = d.id === active.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveId(d.id)}
                className={cn(
                  "flex flex-col items-center rounded-[14px] px-0.5 pb-1 pt-1 transition-all active:scale-[0.98]",
                  selected && "fortune-soft-selected"
                )}
              >
                <span className="fortune-soft-orb-img">
                  <Image
                    src={d.image}
                    alt=""
                    width={64}
                    height={64}
                    className="h-[2.85rem] w-[2.85rem] object-contain"
                    priority
                  />
                </span>
                <p className="mt-1.5 text-[10.5px] font-semibold text-[#3d1f72]">
                  {d.name}
                </p>
                <div className="fortune-soft-bar mt-1.5 w-full max-w-[3.6rem]">
                  <div
                    className="fortune-soft-bar-fill"
                    style={{ width: `${Math.max(d.pct, 28)}%` }}
                  >
                    <span>{d.pct}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3.5">
          <h3 className="font-sacred text-[1.02rem] leading-none text-[#3d1f72]">
            {active.detailTitle}
          </h3>
          <p className="mt-2 text-[13px] leading-[1.55] text-[#4c2d7a]/92">
            {active.body}
          </p>
        </div>
      </section>
    </div>
  );
}
