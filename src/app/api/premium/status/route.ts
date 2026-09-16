import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth, SESSION_COOKIE } from "@/lib/auth";
import { hasPremiumAccess } from "@/lib/premium-entitlement";

export const runtime = "nodejs";

const GUEST_BODY = {
  authenticated: false,
  premium: false,
  untilMs: null,
  status: null,
} as const;

export async function GET() {
  const store = await cookies();
  const hasSession = Boolean(store.get(SESSION_COOKIE)?.value);

  // Guests always get the same payload — allow short edge/browser cache
  if (!hasSession) {
    return NextResponse.json(GUEST_BODY, {
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
        Vary: "Cookie",
      },
    });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(GUEST_BODY, {
      headers: {
        "Cache-Control": "private, max-age=15",
        Vary: "Cookie",
      },
    });
  }

  const until = session.user.premiumUntil ?? null;
  const status = session.user.subscriptionStatus ?? null;
  const premium = hasPremiumAccess({ status, until });

  return NextResponse.json(
    {
      authenticated: true,
      premium,
      untilMs: premium && until ? until.getTime() : null,
      until: premium && until ? until.toISOString() : null,
      status,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=20",
        Vary: "Cookie",
      },
    }
  );
}
