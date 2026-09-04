import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, CREDIT_PACKAGES, resolveStripePriceId } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { error: "เปิด URL นี้ตรง ๆ ไม่ได้ ให้กดซื้อจากหน้า /pricing" },
    { status: 405 }
  );
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe ยังไม่ได้ตั้งค่า" },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const packageId = formData.get("packageId") as string;
    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);

    if (!pkg || !pkg.priceId) {
      return NextResponse.json({ error: "แพ็กเกจไม่ถูกต้อง" }, { status: 400 });
    }

    const priceId = await resolveStripePriceId(pkg.priceId);
    const origin = new URL(request.url).origin;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/pricing?payment=cancelled`,
      metadata: {
        userId: session.user.id,
        packageId: pkg.id,
        credits: String(pkg.credits),
      },
    });

    if (checkoutSession.url) {
      return NextResponse.redirect(checkoutSession.url, 303);
    }

    return NextResponse.json({ error: "ไม่สามารถสร้าง checkout ได้" }, { status: 500 });
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
            "รหัสสินค้าใน Vercel ไม่เจอใน Stripe Test mode — ต้อง copy จากโหมด Test และใช้ price_ หรือสินค้าที่มีราคา default",
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
