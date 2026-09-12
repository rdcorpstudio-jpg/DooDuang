"use client";

import { Suspense } from "react";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";

/**
 * Site-wide: after Stripe ?payment=success&session_id=…
 * confirm unlock + fire Meta Purchase + LINE Purchase/Conversion.
 * Deduped per session_id inside track helpers.
 */
function StripePurchaseReturnInner() {
  useStripePaymentReturn();
  return null;
}

export function StripePurchaseReturnListener() {
  return (
    <Suspense fallback={null}>
      <StripePurchaseReturnInner />
    </Suspense>
  );
}
