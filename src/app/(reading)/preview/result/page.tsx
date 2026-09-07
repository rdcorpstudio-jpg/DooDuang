"use client";

import { LifeInsightMockup } from "@/components/fortune/life-insight-mockup";

/**
 * Dev preview: open /preview/result to edit the free result UI
 * without walking through the reading wizard every refresh.
 */
export default function PreviewResultPage() {
  return (
    <div className="relative h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-[480px] px-4 pb-16 pt-4">
        <p className="mb-3 text-center text-[11px] tracking-wide text-white/35">
          หน้าพรีวิว · /preview/result
        </p>
        <LifeInsightMockup
          seed="preview-overall-nat-1995-09-07-female"
          birthDate="1995-09-07"
          nickname="นัท"
          realName="นัท"
          readingTitle="ภาพรวมชีวิต"
          unlocked={false}
        />
      </div>
    </div>
  );
}
