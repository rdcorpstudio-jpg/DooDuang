"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FortuneIcon,
  type FortuneIconName,
} from "@/components/fortune/fortune-icon";
import {
  PremiumDetailShell,
  DetailSection,
} from "@/components/fortune/premium-detail-shell";
import {
  LockedPreviewTile,
  UnlockDetailBanner,
} from "@/components/fortune/locked-reading-teaser";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import { buildDailyReadingPack } from "@/lib/fortune/build-daily-pack";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import {
  hydrateFortuneProfileFromWizard,
  readFortuneProfile,
} from "@/lib/fortune/profile-storage";
import {
  isPremiumUnlocked,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

const DOMAIN_META = [
  {
    aspectId: "work" as const,
    domainId: "career" as const,
    icon: "career" as FortuneIconName,
  },
  {
    aspectId: "money" as const,
    domainId: "money" as const,
    icon: "finance" as FortuneIconName,
  },
  {
    aspectId: "love" as const,
    domainId: "love" as const,
    icon: "love" as FortuneIconName,
  },
  {
    aspectId: "health" as const,
    domainId: "health" as const,
    icon: "health" as FortuneIconName,
  },
] as const;

type DomainId = (typeof DOMAIN_META)[number]["domainId"];

function parseDomain(raw: string | null): DomainId {
  if (raw === "money" || raw === "love" || raw === "health" || raw === "career") {
    return raw;
  }
  return "career";
}

/** Full-page daily aspect — free teaser + soft-lock detail like tarot */
export function AspectDetailPage({
  backHref: backHrefProp = "/reading",
}: {
  backHref?: string;
}) {
  const search = useSearchParams();
  const router = useRouter();
  const domainId = parseDomain(search.get("id"));
  const fromPremium = search.get("from") === "premium";
  const backHref = fromPremium ? "/premium" : backHrefProp;
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [profile, setProfile] = useState<{
    birthDate: string;
    nickname: string;
    birthTime?: string;
    focus?: FortuneFocus;
    gender?: string;
  }>({
    birthDate: "2000-01-01",
    nickname: "",
  });

  useEffect(() => {
    hydrateFortuneProfileFromWizard();
    const next = readFortuneProfile();
    if (!next?.birthDate) {
      router.replace("/reading");
      return;
    }
    setProfile({
      birthDate: next.birthDate,
      nickname: next.nickname,
      birthTime: next.birthTime,
      focus: next.focus,
      gender: next.gender,
    });
    setUnlocked(
      fromPremium ||
        isPremiumUnlocked({
          birthDate: next.birthDate,
          nickname: next.nickname,
        })
    );
    setReady(true);
  }, [router, fromPremium]);

  function handlePaid() {
    setPremiumUnlocked({
      birthDate: profile.birthDate,
      nickname: profile.nickname,
    });
    setUnlocked(true);
    setPayOpen(false);
  }

  useStripePaymentReturn(handlePaid);

  const pack = useMemo(
    () =>
      buildDailyReadingPack({
        birthDate: profile.birthDate,
        nickname: profile.nickname,
        birthTime: profile.birthTime,
        focus: profile.focus,
        gender: profile.gender,
      }),
    [profile]
  );

  const domains = DOMAIN_META.map((m) => {
    const row = pack.aspects.find((a) => a.id === m.aspectId)!;
    return { ...m, ...row };
  });

  const active = domains.find((d) => d.domainId === domainId) ?? domains[0]!;
  const name = profile.nickname.replace(/^คุณ\s*/, "").trim();
  const address = name ? `คุณ${name}` : "คุณ";

  if (!ready) {
    return (
      <div className="px-4 py-10 text-center text-[14px] text-[#8A82B0]">
        กำลังเปิด…
      </div>
    );
  }

  return (
    <PremiumDetailShell backHref={backHref}>
      <div key={active.domainId} className="dd-aspect-block flex flex-col">
        <header className="mt-4 flex items-center gap-3">
          <FortuneIcon name={active.icon} size={48} plain className="dd-icon-float" />
          <div className="min-w-0">
            <h1 className="text-[1.35rem] font-bold tracking-tight text-[#241C4F]">
              {active.name}ของ{address}
            </h1>
            <p className="mt-0.5 text-[13px] text-[#6B6490]">{active.title}</p>
            {!unlocked ? (
              <p className="mt-1 text-[11px] text-[#8A82B0]">
                ดูเบื้องต้นฟรี · รายละเอียดล็อกไว้
              </p>
            ) : null}
          </div>
        </header>

        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
          {domains.map((d) => (
            <Link
              key={d.domainId}
              href={`/reading/aspect?id=${d.domainId}&from=${
                fromPremium ? "premium" : "reading"
              }`}
              replace
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium outline-none transition",
                d.domainId === active.domainId
                  ? "bg-[#6A48C8] text-white"
                  : "bg-white/80 text-[#5E5688] ring-1 ring-[#7B6BB0]/15"
              )}
            >
              {d.name}
            </Link>
          ))}
        </div>

        <section className="fortune-glass mt-4 rounded-[20px] px-4 py-4">
          <p className="text-[15px] leading-[1.8] text-[#3A3270]">
            {active.body}
          </p>
          {unlocked ? (
            <ul className="mt-3.5 space-y-2.5">
              {active.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2 text-[14px] leading-snug text-[#4A4278]"
                >
                  <FortuneIcon name="check" size={22} className="mt-0.5 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {/* Free: open 2 blocks (preview + highlights). Premium: full detail. */}
        {!unlocked ? (
          <div className="mt-3 grid grid-cols-1 gap-2.5">
            <section className="fortune-glass rounded-[18px] px-3.5 py-3.5">
              <p className="text-[12px] font-semibold tracking-[0.04em] text-[#C9A227]">
                ★ จุดเด่นวันนี้
              </p>
              <ul className="mt-2.5 space-y-2">
                {active.highlights.slice(0, 3).map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 text-[13px] leading-snug text-[#4A4278]"
                  >
                    <FortuneIcon name="check" size={20} className="mt-0.5 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
            {active.why ? (
              <LockedPreviewTile
                title="ทำไมวันนี้เป็นแบบนี้"
                unlocked={false}
                preview={active.why}
                onUnlock={() => setPayOpen(true)}
              />
            ) : null}
            {active.move ? (
              <LockedPreviewTile
                title="ท่าทีที่ควรใช้"
                unlocked={false}
                preview={active.move}
                onUnlock={() => setPayOpen(true)}
              />
            ) : null}
          </div>
        ) : (
          <>
            {active.why ? (
              <DetailSection eyebrow="ทำไมวันนี้เป็นแบบนี้" title={active.blurb}>
                {active.why}
              </DetailSection>
            ) : null}
            {active.move ? (
              <DetailSection title="ท่าทีที่ควรใช้">{active.move}</DetailSection>
            ) : null}
          </>
        )}

        <div className="mt-3">
          <UnlockDetailBanner
            unlocked={unlocked}
            onUnlock={() => setPayOpen(true)}
            subtitle={`การงาน การเงิน ความรัก สุขภาพ · ${FORTUNE_UNLOCK_PRICE} บาท`}
          />
        </div>
      </div>

      <FortunePaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onPaid={handlePaid}
        returnPath={`/reading/aspect?id=${domainId}&from=reading`}
      />
    </PremiumDetailShell>
  );
}
