"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { trackLinePurchaseConversions } from "@/components/analytics/line-tag";
import { trackMetaPurchase } from "@/components/analytics/meta-pixel";
import { confirmStripePremiumUnlock } from "@/components/fortune/fortune-payment-sheet";
import { applyPremiumUntil, setPremiumUnlocked } from "@/lib/fortune/premium-unlock";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";

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
    void (async () => {
      let unlockedOk = false;
      try {
        const result = await confirmStripePremiumUnlock(sessionId);
        if (cancelled) return;
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
          trackMetaPurchase(sessionId);
          trackLinePurchaseConversions(sessionId);
          onUnlockedRef.current?.();
        }
      } catch (err) {
        console.error("Stripe return unlock failed:", err);
        handled.current = null;
      } finally {
        if (!cancelled) {
          if (unlockedOk) {
            // CRM funnel: celebrate + add LINE OA (don't bounce to onboard yet)
            router.replace("/premium/thanks");
          } else {
            router.replace(pathname || "/premium");
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router, pathname]);
}
