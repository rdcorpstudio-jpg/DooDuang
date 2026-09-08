import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";

/** Client-safe catalog (no Stripe SDK import). */
export const PREMIUM_UNLOCK = {
  id: "premium-unlock",
  name: "ดวงพรีเมียม",
  price: FORTUNE_UNLOCK_PRICE,
  description: "ปลดล็อกเนื้อหาพรีเมียมทั้งหมด",
} as const;

export const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "พรีเมียม",
    credits: 0,
    price: FORTUNE_UNLOCK_PRICE,
    description: "ปลดล็อกดวงพรีเมียม",
  },
  {
    id: "popular",
    name: "ยอดนิยม",
    credits: 10,
    price: 129,
    description: "10 ครั้ง คุ้มที่สุด",
    popular: true,
  },
  {
    id: "premium",
    name: "พรีเมียมเครดิต",
    credits: 30,
    price: 299,
    description: "30 ครั้ง สำหรับสายมู",
  },
] as const;

export type CreditPackageId = (typeof CREDIT_PACKAGES)[number]["id"];
