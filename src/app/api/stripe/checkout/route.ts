import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  AlreadySubscribedError,
  createPremiumCheckoutUrl,
  resolveCheckoutPackage,
} from "@/lib/stripe";
import { PREMIUM_UNLOCK } from "@/lib/stripe-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** After login: browser hits this and 303s straight to Stripe (no React spinner wait). */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      const login = new URL("/login", request.url);
      login.searchParams.set("callbackUrl", "/premium?checkout=1");
      return NextResponse.redirect(login);
    }

    const url = await createPremiumCheckoutUrl({
      userId: session.user.id,
      email: session.user.email,
      origin: new URL(request.url).origin,
      returnPath: "/premium",
      packageId: PREMIUM_UNLOCK.id,
    });
    return NextResponse.redirect(url, 303);
  } catch (err) {
    if (err instanceof AlreadySubscribedError) {
      return NextResponse.redirect(new URL("/premium", request.url));
    }
    console.error("Stripe go failed:", err);
    const premium = new URL("/premium?checkout=1", request.url);
    premium.searchParams.set("payError", "1");
    return NextResponse.redirect(premium);
  }
}

async function readPackageId(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as {
      packageId?: string;
      returnPath?: string;
    } | null;
    return {
      packageId: typeof body?.packageId === "string" ? body.packageId : "",
      returnPath:
        typeof body?.returnPath === "string" ? body.returnPath : "/premium",
      wantsJson: true,
    };
  }

  const formData = await request.formData();
  return {
    packageId: String(formData.get("packageId") || ""),
    returnPath: String(formData.get("returnPath") || "/premium"),
    wantsJson: false,
  };
}

export async function POST(request: Request) {
  let wantsJson = true;
  try {
    const session = await auth();
    const parsed = await readPackageId(request);
    const { packageId, returnPath } = parsed;
    wantsJson = parsed.wantsJson;

    if (!session?.user) {
      if (wantsJson) {
        return NextResponse.json(
          { error: "ต้องเข้าสู่ระบบก่อน", code: "UNAUTHENTICATED" },
          { status: 401 }
        );
      }
      const login = new URL("/login", request.url);
      login.searchParams.set("callbackUrl", returnPath || "/premium?checkout=1");
      return NextResponse.redirect(login);
    }

    const pkg = resolveCheckoutPackage(packageId || PREMIUM_UNLOCK.id);
    if (!pkg || !pkg.priceId) {
      return NextResponse.json({ error: "แพ็กเกจไม่ถูกต้อง" }, { status: 400 });
    }

    const url = await createPremiumCheckoutUrl({
      userId: session.user.id,
      email: session.user.email,
      origin: new URL(request.url).origin,
      returnPath,
      packageId: pkg.id,
    });

    if (wantsJson) {
      return NextResponse.json({ url });
    }

    return NextResponse.redirect(url, 303);
  } catch (err) {
    if (err instanceof AlreadySubscribedError) {
      if (wantsJson) {
        return NextResponse.json({ error: err.message, code: "ALREADY_SUBSCRIBED" }, { status: 409 });
      }
      return NextResponse.redirect(new URL("/premium", request.url), 303);
    }
    console.error("Stripe checkout failed:", err);
    const message = err instanceof Error ? err.message : "";
    if (
      message.includes("No such price") ||
      message.includes("No such product")
    ) {
      return NextResponse.json(
        {
          error:
            "รหัสสินค้าใน Vercel ไม่เจอใน Stripe — ตรวจ STRIPE_PRICE_STARTER / STRIPE_PRICE_ONETIME ให้เป็น price_ one-time จากโหมดเดียวกับ Secret Key",
        },
        { status: 400 }
      );
    }
    if (
      message.includes("default") ||
      message.includes("price_") ||
      message.includes("Stripe")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
