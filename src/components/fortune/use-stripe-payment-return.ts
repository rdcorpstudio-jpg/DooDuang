"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { confirmStripePremiumUnlock } from "@/components/fortune/fortune-payment-sheet";
import { setPremiumUnlocked } from "@/lib/fortune/premium-unlock";
import {
  getPremiumOnboardPath,
  readFortuneProfile,
} from "@/lib/fortune/profile-storage";

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
          setPremiumUnlocked(
            profile
              ? { birthDate: profile.birthDate, nickname: profile.nickname }
              : null
          );
          onUnlockedRef.current?.();
        }
      } catch (err) {
        console.error("Stripe return unlock failed:", err);
        handled.current = null;
      } finally {
        if (!cancelled) {
          if (unlockedOk) {
            router.replace(getPremiumOnboardPath(readFortuneProfile()));
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
