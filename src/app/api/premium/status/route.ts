import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPremiumAccess } from "@/lib/premium-entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({
      authenticated: false,
      premium: false,
      untilMs: null,
      status: null,
    });
  }

  const until = session.user.premiumUntil ?? null;
  const status = session.user.subscriptionStatus ?? null;
  const premium = hasPremiumAccess({ status, until });

  return NextResponse.json({
    authenticated: true,
    premium,
    untilMs: premium && until ? until.getTime() : null,
    until: premium && until ? until.toISOString() : null,
    status,
  });
}
