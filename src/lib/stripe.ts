import Stripe from "stripe";
import { CREDIT_PACKAGES, PREMIUM_UNLOCK } from "@/lib/stripe-catalog";

export { CREDIT_PACKAGES, PREMIUM_UNLOCK };
export type { CreditPackageId } from "@/lib/stripe-catalog";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    })
  : null;

function priceIdForPackage(packageId: string) {
  if (
    packageId === PREMIUM_UNLOCK.id ||
    packageId === "starter" ||
    packageId === "popular" ||
    packageId === "premium"
  ) {
    // All paid unlocks use the 3-month starter price for now.
    return process.env.STRIPE_PRICE_STARTER;
  }
  return undefined;
}

export async function resolveStripePriceId(priceOrProductId: string) {
  if (!stripe) {
    throw new Error("Stripe ยังไม่ได้ตั้งค่า");
  }

  if (priceOrProductId.startsWith("price_")) {
    return priceOrProductId;
  }

  if (priceOrProductId.startsWith("prod_")) {
    const product = await stripe.products.retrieve(priceOrProductId, {
      expand: ["default_price"],
    });
    const defaultPrice = product.default_price;
    const priceId =
      typeof defaultPrice === "string" ? defaultPrice : defaultPrice?.id;
    if (!priceId) {
      throw new Error("สินค้านี้ยังไม่มีราคา default ใน Stripe");
    }
    return priceId;
  }

  throw new Error("ต้องใช้ Price ID ที่ขึ้นต้นด้วย price_");
}

export function resolveCheckoutPackage(packageId: string) {
  if (
    packageId === PREMIUM_UNLOCK.id ||
    packageId === "starter" ||
    packageId === "popular" ||
    packageId === "premium"
  ) {
    return {
      id: PREMIUM_UNLOCK.id,
      name: PREMIUM_UNLOCK.name,
      credits: 0,
      months: PREMIUM_UNLOCK.months,
      price: PREMIUM_UNLOCK.price,
      priceId: priceIdForPackage(packageId),
      purpose: "premium-unlock" as const,
    };
  }

  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) return null;
  return {
    id: PREMIUM_UNLOCK.id,
    name: pkg.name,
    credits: 0,
    months: PREMIUM_UNLOCK.months,
    price: pkg.price,
    priceId: priceIdForPackage(pkg.id),
    purpose: "premium-unlock" as const,
  };
}
