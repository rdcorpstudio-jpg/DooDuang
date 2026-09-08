"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

const PROFILES = [
  {
    habit:
      "คุณเป็นคนรับผิดชอบและใส่ใจรายละเอียด มักวางแผนก่อนลงมือ และเป็นที่พึ่งของคนรอบตัวได้ดี",
    strengths: ["วางแผนเก่ง", "รับฟัง"],
  },
  {
    habit:
      "คุณโฟกัสได้ดีเมื่อเป้าหมายชัด และชอบทำสิ่งสำคัญให้จบทีละเรื่อง มากกว่ากระจายแรงไปหลายทาง",
    strengths: ["โฟกัสได้ดี", "จริงจัง"],
  },
  {
    habit:
      "คุณอ่อนไหวต่อความรู้สึกคนรอบข้าง และเลือกทางที่สร้างความมั่นคงในระยะยาวได้ดี",
    strengths: ["เข้าใจคน", "อดทน"],
  },
] as const;

/** Self snapshot — short on free; deeper label on premium */
export function FortuneFreeSelfIntro({
  seed = "dooduang",
  nickname,
  premium = false,
  className,
}: {
  seed?: string;
  nickname: string;
  premium?: boolean;
  className?: string;
}) {
  const profile = useMemo(
    () => PROFILES[hashSeed(`${seed}-self`) % PROFILES.length]!,
    [seed]
  );

  return (
    <section
      className={cn(
        "fortune-glass rounded-[18px] px-3.5 py-3.5",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="fortune-spark flex h-8 w-8 items-center justify-center rounded-full bg-[#F4BC52]/15 ring-1 ring-[#BB6CF0]/35">
          <Sparkles className="h-4 w-4 text-[#BB6CF0]" strokeWidth={1.8} />
        </span>
        <h2 className="text-[17px] font-semibold text-[#F7F8FF]">
          {premium ? "เข้าใจตัวเองเชิงลึก" : "รู้จักตัวเองเบื้องต้น"}
        </h2>
      </div>
      <p className="mt-2.5 text-[15px] leading-[1.75] text-[#D5E4F7]">
        {nickname
          ? `คุณ${nickname.replace(/^คุณ\s*/, "").trim()} — `
          : "คุณ — "}
        {profile.habit}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {profile.strengths.map((s) => (
          <span
            key={s}
            className="rounded-full border border-[#F4BC52]/35 bg-[#F4BC52]/14 px-2.5 py-1 text-[13px] font-medium text-[#FFE7A8]"
          >
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}
