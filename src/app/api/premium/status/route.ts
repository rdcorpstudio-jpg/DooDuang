import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth, SESSION_COOKIE } from "@/lib/auth";
import {
  hasAppAccess,
  hasPremiumAccess,
  hasTrialAccess,
} from "@/lib/premium-entitlement";

export const runtime = "nodejs";

const GUEST_BODY = {
  authenticated: false,
  premium: false,
  untilMs: null,
  status: null,
  trialActive: false,
  trialEndsAtMs: null,
  canUseApp: false,
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
  const trialEndsAt = session.user.trialEndsAt ?? null;
  const premium = hasPremiumAccess({ status, until });
  const trialActive = hasTrialAccess(trialEndsAt);
  const canUseApp = hasAppAccess({ status, until, trialEndsAt });

  return NextResponse.json(
    {
      authenticated: true,
      premium,
      untilMs: premium && until ? until.getTime() : null,
      until: premium && until ? until.toISOString() : null,
      status,
      trialActive,
      trialEndsAtMs: trialEndsAt ? trialEndsAt.getTime() : null,
      trialEndsAt: trialEndsAt ? trialEndsAt.toISOString() : null,
      canUseApp,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=20",
        Vary: "Cookie",
      },
    }
  );
}
