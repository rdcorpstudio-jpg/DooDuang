"use client";

import { FreeDailyReading } from "@/components/fortune/free-daily-reading";

/**
 * Design preview only — not wired into the main menu yet.
 * Open /preview/daily-free
 */
export default function PreviewDailyFreePage() {
  return (
    <div className="relative h-full overflow-y-auto">
      <p className="px-4 pt-3 text-center text-[11px] tracking-wide text-white/35">
        หน้าพรีวิว · /preview/daily-free · ยังไม่ใช้ในเมนู
      </p>
      <FreeDailyReading backHref="/menu" />
    </div>
  );
}
