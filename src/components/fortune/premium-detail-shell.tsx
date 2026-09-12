"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { PageBackButton } from "@/components/ui/page-back-button";
import { isPremiumUnlocked } from "@/lib/fortune/premium-unlock";
import {
  hydrateFortuneProfileFromWizard,
  readFortuneProfile,
  type FortuneUserProfile,
} from "@/lib/fortune/profile-storage";
import { cn } from "@/lib/utils";

export function usePremiumProfileGate() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<FortuneUserProfile | null>(null);

  useEffect(() => {
    hydrateFortuneProfileFromWizard();
    const next = readFortuneProfile();
    setProfile(next);
    const unlocked = isPremiumUnlocked(
      next ? { birthDate: next.birthDate, nickname: next.nickname } : null
    );
    if (!unlocked) {
      router.replace("/menu");
      return;
    }
    if (!next?.birthDate) {
      router.replace(`/reading?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setReady(true);
  }, [router]);

  return { ready, profile };
}

export function PremiumDetailShell({
  title,
  children,
  className,
  backHref = "/menu",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  backHref?: string;
}) {
  return (
    <div
      className={cn(
        "sky-copy dd-page-live relative h-full overflow-y-auto",
        className
      )}
    >
      <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-12 pt-3">
        <div
          className="fortune-reveal flex items-center"
          style={{ "--fortune-delay": "30ms" } as CSSProperties}
        >
          <PageBackButton href={backHref} />
        </div>
        {title ? (
          <h1
            className="mae-gold-text fortune-reveal mt-5 text-[1.45rem] font-bold tracking-tight"
            style={{ "--fortune-delay": "90ms" } as CSSProperties}
          >
            {title}
          </h1>
        ) : null}
        <div className="dd-detail-stagger flex flex-col">{children}</div>
      </div>
    </div>
  );
}

export function DetailSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mae-aspect-card mt-3 rounded-[20px] px-4 py-4">
      {eyebrow ? (
        <p className="mae-gold-text text-[11px] font-semibold tracking-[0.14em]">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "text-[15px] font-semibold text-[#f7f4ec]",
          eyebrow ? "mt-1" : undefined
        )}
      >
        {title}
      </h2>
      <div className="mt-2 text-[13px] leading-[1.75] text-[#f7f4ec]/75">
        {children}
      </div>
    </section>
  );
}

export function useAnalyzeInputFromProfile(profile: FortuneUserProfile | null) {
  return useMemo(() => {
    if (!profile) return null;
    return {
      birthDate: profile.birthDate,
      nickname: profile.nickname,
      birthTime: profile.birthTime,
      birthPlace: profile.birthPlace,
      focus: profile.focus,
      gender: profile.gender,
    };
  }, [profile]);
}
