"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { trackLinePurchaseConversions } from "@/components/analytics/line-tag";
import { trackMetaPurchase } from "@/components/analytics/meta-pixel";
import { confirmStripePremiumUnlock } from "@/components/fortune/fortune-payment-sheet";
import { applyPremiumUntil, setPremiumUnlocked } from "@/lib/fortune/premium-unlock";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";

const THANKS_PATH = "/premium/thanks";

/** Fire all post-purchase ad conversions (Meta + LINE). Deduped per session. */
export function firePostPurchasePixels(sessionId: string) {
  trackMetaPurchase(sessionId);
  trackLinePurchaseConversions(sessionId);
}

/** After Stripe redirect (?payment=success&session_id=...), confirm + unlock. */
export function useStripePaymentReturn(onUnlocked?: () => void) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const handled = useRef<string | null>(null);
  const onUnlockedRef = useRef(onUnlocked);
  onUnlockedRef.current = onUnlocked;

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (payment !== "success" || !sessionId) return;
    if (handled.current === sessionId) return;
    handled.current = sessionId;

    let cancelled = false;
    let finished = false;

    void (async () => {
      let unlockedOk = false;
      try {
        const result = await confirmStripePremiumUnlock(sessionId);
        if (cancelled) {
          // Strict Mode remount — allow the next effect to run
          handled.current = null;
          return;
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
          // Thank-you page conversions (retry until pixel scripts ready)
          firePostPurchasePixels(sessionId);
          onUnlockedRef.current?.();
        }
        finished = true;
      } catch (err) {
        console.error("Stripe return unlock failed:", err);
        handled.current = null;
      } finally {
        if (cancelled) {
          if (!finished) handled.current = null;
          return;
        }
        if (unlockedOk) {
          // Let pixels queue before stripping success query
          await new Promise((r) => window.setTimeout(r, 400));
          if (cancelled) return;
          router.replace(THANKS_PATH);
        } else {
          router.replace(
            pathname === THANKS_PATH ? THANKS_PATH : pathname || "/premium"
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router, pathname]);
}
