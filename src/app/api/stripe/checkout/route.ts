import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  stripe,
  resolveStripePriceId,
  resolveCheckoutPackage,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { error: "เปิด URL นี้ตรง ๆ ไม่ได้" },
    { status: 405 }
  );
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
  try {
    const session = await auth();
    const { packageId, returnPath, wantsJson } = await readPackageId(request);

    if (!session?.user) {
      if (wantsJson) {
        return NextResponse.json(
          { error: "ต้องเข้าสู่ระบบก่อน", code: "UNAUTHENTICATED" },
          { status: 401 }
        );
      }
      const login = new URL("/login", request.url);
      login.searchParams.set("callbackUrl", returnPath || "/premium");
      return NextResponse.redirect(login);
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe ยังไม่ได้ตั้งค่า" },
        { status: 503 }
      );
    }

    const pkg = resolveCheckoutPackage(packageId);
    if (!pkg || !pkg.priceId) {
      return NextResponse.json({ error: "แพ็กเกจไม่ถูกต้อง" }, { status: 400 });
    }

    const priceId = await resolveStripePriceId(pkg.priceId);
    const origin = new URL(request.url).origin;
    const safeReturn =
      returnPath.startsWith("/") && !returnPath.startsWith("//")
        ? returnPath
        : "/premium";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}${safeReturn}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${safeReturn}?payment=cancelled`,
      metadata: {
        userId: session.user.id,
        packageId: pkg.id,
        credits: String(pkg.credits),
        purpose: pkg.purpose,
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "ไม่สามารถสร้าง checkout ได้" },
        { status: 500 }
      );
    }

    if (wantsJson) {
      return NextResponse.json({ url: checkoutSession.url });
    }

    return NextResponse.redirect(checkoutSession.url, 303);
  } catch (err) {
    console.error("Stripe checkout failed:", err);
    const message = err instanceof Error ? err.message : "";
    if (
      message.includes("No such price") ||
      message.includes("No such product")
    ) {
      return NextResponse.json(
        {
          error:
            "รหัสสินค้าใน Vercel ไม่เจอใน Stripe — ตรวจ STRIPE_PRICE_STARTER ให้เป็น price_ จากโหมดเดียวกับ Secret Key",
        },
        { status: 400 }
      );
    }
    if (message.includes("default") || message.includes("price_")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
