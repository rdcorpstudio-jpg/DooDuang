"use client";

import { useState } from "react";
import { LifeInsightMockup } from "@/components/fortune/life-insight-mockup";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";

/**
 * Dev preview: open /preview/result to edit the free result UI
 * without walking through the reading wizard every refresh.
 */
export default function PreviewResultPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

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
          gender="female"
          readingTitle="ภาพรวมชีวิต"
          unlocked={unlocked}
          onUnlock={() => setPayOpen(true)}
        />

        {!unlocked ? (
          <div className="mt-4 px-0">
            <FortunePaymentSheet
              open
              variant="inline"
              onClose={() => {}}
              onPaid={() => setUnlocked(true)}
              returnPath="/preview/result"
            />
          </div>
        ) : null}

        <FortunePaymentSheet
          open={payOpen}
          onClose={() => setPayOpen(false)}
          onPaid={() => {
            setUnlocked(true);
            setPayOpen(false);
          }}
          returnPath="/preview/result"
        />
      </div>
    </div>
  );
}
