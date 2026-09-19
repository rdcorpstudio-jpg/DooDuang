"use client";

import { PageBackButton } from "@/components/ui/page-back-button";
import { OnboardProgress } from "@/components/onboard/onboard-progress";

/** Same top row on choose / wizard / login: back left, dots center */
export function OnboardTopBar({
  backHref,
  onBack,
  current,
  total,
}: {
  backHref?: string;
  onBack?: () => void;
  current: number;
  total: number;
}) {
  const showBack = Boolean(backHref || onBack);

  return (
    <div className="relative z-20 mb-2 grid shrink-0 grid-cols-[minmax(4.5rem,1fr)_auto_minmax(4.5rem,1fr)] items-center gap-2">
      {showBack ? (
        <PageBackButton
          href={backHref}
          onClick={onBack}
          compact
          className="justify-self-start"
        />
      ) : (
        <span aria-hidden className="min-h-10 justify-self-start" />
      )}
      <OnboardProgress current={current} total={total} />
      <span aria-hidden className="justify-self-end" />
    </div>
  );
}
