"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { requirePremiumFromServer } from "@/lib/fortune/premium-unlock";
import {
  hydrateFortuneProfileFromWizard,
  readFortuneProfile,
  type FortuneUserProfile,
} from "@/lib/fortune/profile-storage";
import { profileToAnalyzeInput } from "@/lib/fortune/profile-reading";
import { cn } from "@/lib/utils";

export function usePremiumProfileGate() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<FortuneUserProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      hydrateFortuneProfileFromWizard();
      const next = readFortuneProfile();
      if (cancelled) return;
      setProfile(next);
      const access = await requirePremiumFromServer(
        next ? { birthDate: next.birthDate, nickname: next.nickname } : null
      );
      if (cancelled) return;
      if (!access.authenticated) {
        const callback = `${window.location.pathname}${window.location.search}`;
        router.replace(`/login?callbackUrl=${encodeURIComponent(callback)}`);
        return;
      }
      if (!access.ok) {
        router.replace("/home");
        return;
      }
      if (!next?.birthDate) {
        router.replace(
          `/reading?next=${encodeURIComponent(window.location.pathname)}`
        );
        return;
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return { ready, profile };
}

export function PremiumDetailShell({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  /** @deprecated ปุ่มกลับเลิกใช้แล้ว */
  backHref?: string;
}) {
  return (
    <div
      className={cn(
        "sky-copy dd-page-live relative h-full overflow-y-auto text-white",
        className
      )}
    >
      <MaePageBackground />
      <div className="relative z-[1] mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-12 pt-3 sm:px-5">
        <div
          className="fortune-reveal"
          style={{ "--fortune-delay": "30ms" } as CSSProperties}
        >
          <MaeBrandLink />
        </div>
        {title ? (
          <h1
            className="fortune-reveal mae-gold-text mt-5 text-center text-[1.75rem] font-bold tracking-tight"
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
  children: ReactNode;
}) {
  return (
    <section className="mae-aspect-card mt-3 rounded-[22px] px-4 py-5">
      {eyebrow ? (
        <p className="mae-gold-text text-[15.5px] font-semibold tracking-wide">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mae-gold-text mt-1 text-[21px] font-bold tracking-tight">
        {title}
      </h2>
      <div className="mt-3 space-y-2 text-[17.5px] font-medium leading-[1.55] text-[#f5f7ff]">
        {children}
      </div>
    </section>
  );
}

export function useAnalyzeInputFromProfile(profile: FortuneUserProfile | null) {
  return useMemo(() => {
    if (!profile) return null;
    return profileToAnalyzeInput(profile);
  }, [profile]);
}
