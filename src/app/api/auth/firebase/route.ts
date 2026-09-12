import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import {
  getFirebaseProjectId,
  verifyFirebaseIdToken,
} from "@/lib/firebase/verify-id-token";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";
import { db, requireDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createPremiumCheckoutUrl } from "@/lib/stripe";
import { PREMIUM_UNLOCK } from "@/lib/stripe-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function loginErrorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes("not configured") || lower.includes("auth_secret")) {
    return NextResponse.json(
      { error: "เซิร์ฟเวอร์ยังตั้งค่าไม่ครบ" },
      { status: 500 }
    );
  }

  if (
    lower.includes("connect") ||
    lower.includes("enotfound") ||
    lower.includes("timeout") ||
    lower.includes("econn") ||
    lower.includes("postgres") ||
    lower.includes("database_url")
  ) {
    return NextResponse.json(
      { error: "ต่อฐานข้อมูลไม่ได้" },
      { status: 500 }
    );
  }

  if (
    lower.includes("audience") ||
    lower.includes("issuer") ||
    lower.includes("jwt") ||
    lower.includes("token")
  ) {
    return NextResponse.json({ error: "เข้าสู่ระบบไม่สำเร็จ" }, { status: 401 });
  }

  if (lower.includes("stripe") || lower.includes("price")) {
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ error: "เข้าสู่ระบบไม่สำเร็จ" }, { status: 401 });
}

export async function GET() {
  let dbReady = false;

  if (db) {
    try {
      await db.select({ id: users.id }).from(users).limit(1);
      dbReady = true;
    } catch {
      dbReady = false;
    }
  }

  return NextResponse.json({
    ok: true,
    projectId: getFirebaseProjectId(),
    dbReady,
    authSecret: Boolean(process.env.AUTH_SECRET),
  });
}

export async function POST(request: Request) {
  try {
    if (!getFirebaseProjectId()) {
      return NextResponse.json(
        { error: "ยังไม่ได้ตั้งค่า Firebase" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const idToken = typeof body.idToken === "string" ? body.idToken : "";
    const wantCheckout = body.checkout === true;
    const returnPath =
      typeof body.returnPath === "string" ? body.returnPath : "/premium";
    if (!idToken) {
      return NextResponse.json({ error: "ไม่พบ token" }, { status: 400 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    const database = requireDb();

    const profile = {
      id: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      image: decoded.picture,
    };

    const [byId] = await database
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, profile.id))
      .limit(1);

    let userId = profile.id;
    let isNewUser = false;

    if (byId) {
      await database
        .update(users)
        .set({
          email: profile.email,
          name: profile.name,
          image: profile.image,
          firebaseUid: profile.id,
        })
        .where(eq(users.id, profile.id));
    } else if (profile.email) {
      const [byEmail] = await database
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, profile.email))
        .limit(1);

      if (byEmail) {
        userId = byEmail.id;
        await database
          .update(users)
          .set({
            name: profile.name,
            image: profile.image,
            firebaseUid: profile.id,
          })
          .where(eq(users.id, byEmail.id));
      } else {
        await database.insert(users).values({
          ...profile,
          firebaseUid: profile.id,
          credits: 0,
        });
        isNewUser = true;
      }
    } else {
      await database.insert(users).values({
        ...profile,
        firebaseUid: profile.id,
        credits: 0,
      });
      isNewUser = true;
    }

    if (isNewUser) {
      const { notifyNewRegistration } = await import("@/lib/line-group-notify");
      notifyNewRegistration({
        channel: "google",
        userId,
        name: profile.name,
        email: profile.email,
      });
    }

    let checkoutUrl: string | undefined;
    if (wantCheckout) {
      checkoutUrl = await createPremiumCheckoutUrl({
        userId,
        email: profile.email,
        origin: new URL(request.url).origin,
        returnPath,
        packageId: PREMIUM_UNLOCK.id,
      });
    }

    const token = await createSessionToken(userId);
    const response = NextResponse.json(
      checkoutUrl ? { ok: true, checkoutUrl } : { ok: true }
    );
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (err) {
    console.error("Firebase login failed:", err);
    return loginErrorResponse(err);
  }
}
