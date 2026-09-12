import { FORTUNE_PACKAGE_DAYS, FORTUNE_PACKAGE_LABEL, FORTUNE_UNLOCK_PRICE } from "@/lib/site";

/** Client-safe catalog (no Stripe SDK import). */
export const PREMIUM_UNLOCK = {
  id: "premium-unlock",
  name: `แพ็กเกจ ${FORTUNE_PACKAGE_LABEL}`,
  price: FORTUNE_UNLOCK_PRICE,
  days: FORTUNE_PACKAGE_DAYS,
  /** @deprecated use days */
  months: 12,
  description: `ปลดล็อกเนื้อหาพรีเมียมครบ ${FORTUNE_PACKAGE_LABEL}`,
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
