import { FORTUNE_PACKAGE_MONTHS, FORTUNE_UNLOCK_PRICE } from "@/lib/site";

/** Client-safe catalog (no Stripe SDK import). */
export const PREMIUM_UNLOCK = {
  id: "premium-unlock",
  name: `แพ็กเกจ ${FORTUNE_PACKAGE_MONTHS} เดือน`,
  price: FORTUNE_UNLOCK_PRICE,
  months: FORTUNE_PACKAGE_MONTHS,
  description: `ปลดล็อกเนื้อหาพรีเมียมครบ ${FORTUNE_PACKAGE_MONTHS} เดือน`,
} as const;

/** Single paid product — 1-month premium package via STRIPE_PRICE_STARTER */
export const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: PREMIUM_UNLOCK.name,
    credits: 0,
    price: FORTUNE_UNLOCK_PRICE,
    months: FORTUNE_PACKAGE_MONTHS,
    description: PREMIUM_UNLOCK.description,
    popular: true,
  },
] as const;

export type CreditPackageId = (typeof CREDIT_PACKAGES)[number]["id"];
