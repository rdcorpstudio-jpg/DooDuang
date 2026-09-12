import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { accountLinksFromUser } from "@/lib/account-links";
import { isLineLoginConfigured } from "@/lib/line-auth";
import { getFirebaseProjectId } from "@/lib/firebase/verify-id-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "ต้องเข้าสู่ระบบก่อน", code: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    links: accountLinksFromUser(session.user),
    providers: {
      google: Boolean(getFirebaseProjectId()),
      line: isLineLoginConfigured(),
      phone: true,
    },
  });
}
