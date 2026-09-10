"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { isPremiumUnlocked } from "@/lib/fortune/premium-unlock";
import {
  hydrateFortuneProfileFromWizard,
  readFortuneProfile,
  type FortuneUserProfile,
} from "@/lib/fortune/profile-storage";
import { APP_BRAND_MARK } from "@/lib/site";
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
      router.replace("/premium");
      return;
    }
    if (!next?.birthDate) {
      router.replace("/reading");
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
  backHref = "/premium",
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
          className="fortune-reveal grid grid-cols-[1fr_auto_1fr] items-center gap-2"
          style={{ "--fortune-delay": "30ms" } as CSSProperties}
        >
          <Link
            href={backHref}
            className="inline-flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-[#3A2F6B] outline-none transition active:opacity-60"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
            กลับ
          </Link>
          <div className="flex flex-col items-center justify-self-center">
            <FortuneIcon name="moon" size={16} className="dd-icon-float -mb-0.5" />
            <p className="font-sacred text-[12px] tracking-[0.26em] text-[#C9A227]">{APP_BRAND_MARK}</p>
          </div>
          <span aria-hidden className="justify-self-end" />
        </div>
        {title ? (
          <h1
            className="fortune-reveal mt-5 text-[1.45rem] font-bold tracking-tight text-[#241C4F]"
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
    <section className="fortune-glass mt-3 rounded-[20px] px-4 py-4">
      {eyebrow ? (
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#7B5FD4]">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "text-[15px] font-semibold text-[#241C4F]",
          eyebrow ? "mt-1" : undefined
        )}
      >
        {title}
      </h2>
      <div className="mt-2 text-[13px] leading-[1.75] text-[#4A4278]">
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
