"use client";

import { useRouter } from "next/navigation";
import { AnimatedPage } from "@/components/ui/reveal";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import { setPremiumUnlocked } from "@/lib/fortune/premium-unlock";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";

/** Premium sales — checkout only (former page 2) */
export function PremiumSalesPage({
  onUnlocked,
}: {
  onUnlocked?: () => void;
} = {}) {
  const router = useRouter();

  useStripePaymentReturn(() => {
    onUnlocked?.();
  });

  function handlePaid() {
    const profile = readFortuneProfile();
    setPremiumUnlocked(
      profile
        ? { birthDate: profile.birthDate, nickname: profile.nickname }
        : null
    );
    onUnlocked?.();
  }

  return (
    <AnimatedPage>
      <FortunePaymentSheet
        open
        variant="page"
        onClose={() => router.push("/")}
        onPaid={handlePaid}
        returnPath="/premium"
      />
    </AnimatedPage>
  );
}
