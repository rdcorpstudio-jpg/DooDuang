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

/** Shared Stripe Checkout URL for premium unlock */
export async function createPremiumCheckoutUrl(opts: {
  userId: string;
  email?: string | null;
  origin: string;
  returnPath?: string;
  packageId?: string;
}): Promise<string> {
  if (!stripe) {
    throw new Error("Stripe ยังไม่ได้ตั้งค่า");
  }

  const pkg = resolveCheckoutPackage(opts.packageId || PREMIUM_UNLOCK.id);
  if (!pkg?.priceId) {
    throw new Error("แพ็กเกจไม่ถูกต้อง");
  }

  const priceId = await resolveStripePriceId(pkg.priceId);
  const safeReturn =
    opts.returnPath &&
    opts.returnPath.startsWith("/") &&
    !opts.returnPath.startsWith("//")
      ? opts.returnPath
      : "/premium";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: opts.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${opts.origin}${safeReturn}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${opts.origin}${safeReturn}?payment=cancelled`,
    metadata: {
      userId: opts.userId,
      packageId: pkg.id,
      credits: String(pkg.credits),
      purpose: pkg.purpose,
    },
  });

  if (!checkoutSession.url) {
    throw new Error("ไม่สามารถสร้าง checkout ได้");
  }
  return checkoutSession.url;
}
