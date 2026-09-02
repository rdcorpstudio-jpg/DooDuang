import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    })
  : null;

export const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "เริ่มต้น",
    credits: 3,
    price: 49,
    priceId: process.env.STRIPE_PRICE_STARTER,
    description: "3 ครั้งดูดวงพิเศษ",
  },
  {
    id: "popular",
    name: "ยอดนิยม",
    credits: 10,
    price: 129,
    priceId: process.env.STRIPE_PRICE_POPULAR,
    description: "10 ครั้ง คุ้มที่สุด",
    popular: true,
  },
  {
    id: "premium",
    name: "พรีเมียม",
    credits: 30,
    price: 299,
    priceId: process.env.STRIPE_PRICE_PREMIUM,
    description: "30 ครั้ง สำหรับสายมู",
  },
] as const;

export type CreditPackageId = (typeof CREDIT_PACKAGES)[number]["id"];
