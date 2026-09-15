import {
  FORTUNE_PACKAGE_DAYS,
  FORTUNE_UNLOCK_PRICE,
  PREMIUM_PRODUCT_DESC,
  PREMIUM_PRODUCT_NAME,
} from "@/lib/site";

/** Client-safe catalog (no Stripe SDK import). */
export const PREMIUM_UNLOCK = {
  id: "premium-unlock",
  name: PREMIUM_PRODUCT_NAME,
  price: FORTUNE_UNLOCK_PRICE,
  days: FORTUNE_PACKAGE_DAYS,
  /** @deprecated use days */
  months: 12,
  description: PREMIUM_PRODUCT_DESC,
} as const;

/** Single paid product — 1-year premium package (one-time Stripe Price) */
export const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: PREMIUM_UNLOCK.name,
    credits: 0,
    price: FORTUNE_UNLOCK_PRICE,
    days: FORTUNE_PACKAGE_DAYS,
    months: 12,
    description: PREMIUM_UNLOCK.description,
    popular: true,
  },
] as const;

export type CreditPackageId = (typeof CREDIT_PACKAGES)[number]["id"];

/** Stripe Checkout payment_method_types we offer in-app. */
export type CheckoutPaymentMethod = "card" | "promptpay";

export function parseCheckoutPaymentMethod(
  raw: unknown
): CheckoutPaymentMethod | null {
  if (raw === "card" || raw === "promptpay") return raw;
  return null;
}
