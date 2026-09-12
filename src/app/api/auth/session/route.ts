import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { accountLinksFromUser } from "@/lib/account-links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      phone: session.user.phone,
      image: session.user.image,
      credits: session.user.credits,
      premiumUntil: session.user.premiumUntil,
      subscriptionStatus: session.user.subscriptionStatus,
      links: accountLinksFromUser(session.user),
    },
  });
}
