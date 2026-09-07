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

/** Free self snapshot — short only */
export function FortuneFreeSelfIntro({
  seed = "dooduang",
  nickname,
  className,
}: {
  seed?: string;
  nickname: string;
  className?: string;
}) {
  const profile = useMemo(
    () => PROFILES[hashSeed(`${seed}-self`) % PROFILES.length]!,
    [seed]
  );

  return (
    <section
      className={cn(
        "rounded-[18px] border border-[#9AB8DC]/16 bg-[#121D36] px-3.5 py-3.5",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#BB6CF0]" strokeWidth={1.8} />
        <h2 className="text-[17px] font-semibold text-[#F7F8FF]">
          รู้จักตัวเองเบื้องต้น
        </h2>
      </div>
      <p className="mt-2.5 text-[15px] leading-[1.7] text-[#9AB8DC]">
        {nickname ? `${nickname} — ` : null}
        {profile.habit}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {profile.strengths.map((s) => (
          <span
            key={s}
            className="rounded-full border border-[#F4BC52]/30 bg-[#F4BC52]/10 px-2.5 py-1 text-[13px] font-medium text-[#F4BC52]"
          >
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}
