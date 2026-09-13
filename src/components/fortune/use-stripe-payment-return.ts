"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { trackLinePurchaseConversions } from "@/components/analytics/line-tag";
import { trackMetaPurchase } from "@/components/analytics/meta-pixel";
import { confirmStripePremiumUnlock } from "@/components/fortune/fortune-payment-sheet";
import { applyPremiumUntil, setPremiumUnlocked } from "@/lib/fortune/premium-unlock";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";

const THANKS_PATH = "/premium/thanks";

/** Survive React Strict Mode remounts (per tab). */
const processingSessions = new Set<string>();
const trackedSessions = new Set<string>();

/** Fire all post-purchase ad conversions (Meta + LINE). Deduped per session. */
export function firePostPurchasePixels(sessionId: string) {
  if (trackedSessions.has(sessionId)) {
    // Still call track helpers — they also dedupe in sessionStorage
  }
  trackedSessions.add(sessionId);
  trackMetaPurchase(sessionId);
  trackLinePurchaseConversions(sessionId);
}

/** After Stripe redirect (?payment=success&session_id=...), confirm + unlock. */
export function useStripePaymentReturn(onUnlocked?: () => void) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const onUnlockedRef = useRef(onUnlocked);
  onUnlockedRef.current = onUnlocked;

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (payment !== "success" || !sessionId) return;
    if (processingSessions.has(sessionId)) return;
    if (trackedSessions.has(sessionId)) {
      router.replace(THANKS_PATH);
      return;
    }

    processingSessions.add(sessionId);
    let cancelled = false;

    void (async () => {
      let unlockedOk = false;
      let paidOk = false;
      try {
        const result = await confirmStripePremiumUnlock(sessionId);
        paidOk = Boolean(result.ok || result.paid || result.premiumUnlocked);

        // Ads pixels: fire whenever Stripe confirms paid (even if cookie/login glitched)
        if (paidOk) {
          firePostPurchasePixels(sessionId);
        }

        if (result.premiumUnlocked) {
          unlockedOk = true;
          const profile = readFortuneProfile();
          const untilMs = result.premiumUntil
            ? Date.parse(result.premiumUntil)
            : NaN;
          if (Number.isFinite(untilMs)) {
            applyPremiumUntil(
              untilMs,
              profile
                ? { birthDate: profile.birthDate, nickname: profile.nickname }
                : null
            );
          } else {
            setPremiumUnlocked(
              profile
                ? { birthDate: profile.birthDate, nickname: profile.nickname }
                : null
            );
          }
          onUnlockedRef.current?.();
        }
      } catch (err) {
        console.error("Stripe return unlock failed:", err);
        processingSessions.delete(sessionId);
      } finally {
        processingSessions.delete(sessionId);
        if (cancelled) return;
        // Stay on thank-you; strip query after pixels have a moment to queue
        await new Promise((r) => window.setTimeout(r, 600));
        if (cancelled) return;
        if (unlockedOk || paidOk || pathname === THANKS_PATH) {
          router.replace(THANKS_PATH);
        } else {
          router.replace(pathname || "/premium");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router, pathname]);
}
