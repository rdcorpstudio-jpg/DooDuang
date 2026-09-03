import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import {
  getFirebaseAdminAuth,
  getFirebaseAdminProjectId,
  isFirebaseAdminConfigured,
} from "@/lib/firebase/admin";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { db, requireDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function loginErrorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code?: string }).code)
      : "";

  if (
    lower.includes("private key") ||
    lower.includes("pem") ||
    lower.includes("failed to parse") ||
    lower.includes("invalid jwt signature") ||
    lower.includes("credential")
  ) {
    return NextResponse.json(
      { error: "กุญแจ Firebase Admin ไม่ถูกต้อง" },
      { status: 500 }
    );
  }

  if (
    lower.includes("audience") ||
    lower.includes('"aud"') ||
    lower.includes("incorrect") ||
    code.includes("id-token-revoked")
  ) {
    return NextResponse.json(
      { error: "โปรเจกต์ Firebase ไม่ตรงกัน" },
      { status: 401 }
    );
  }

  if (
    lower.includes("not configured") ||
    lower.includes("auth_secret") ||
    lower.includes("database_url")
  ) {
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
    lower.includes("postgres")
  ) {
    return NextResponse.json(
      { error: "ต่อฐานข้อมูลไม่ได้" },
      { status: 500 }
    );
  }

  return NextResponse.json({ error: "เข้าสู่ระบบไม่สำเร็จ" }, { status: 401 });
}

export async function GET() {
  let adminReady = false;
  let dbReady = false;

  if (isFirebaseAdminConfigured()) {
    try {
      await getFirebaseAdminAuth();
      adminReady = true;
    } catch {
      adminReady = false;
    }
  }

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
    adminConfigured: isFirebaseAdminConfigured(),
    adminProjectId: getFirebaseAdminProjectId(),
    adminReady,
    dbReady,
    authSecret: Boolean(process.env.AUTH_SECRET),
  });
}

export async function POST(request: Request) {
  try {
    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json(
        { error: "ยังไม่ได้ตั้งค่า Firebase" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const idToken = typeof body.idToken === "string" ? body.idToken : "";
    if (!idToken) {
      return NextResponse.json({ error: "ไม่พบ token" }, { status: 400 });
    }

    const adminAuth = await getFirebaseAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const database = requireDb();

    const profile = {
      id: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
      image: decoded.picture ?? null,
    };

    const [byId] = await database
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, profile.id))
      .limit(1);

    let userId = profile.id;

    if (byId) {
      await database
        .update(users)
        .set({
          email: profile.email,
          name: profile.name,
          image: profile.image,
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
          })
          .where(eq(users.id, byEmail.id));
      } else {
        await database.insert(users).values({
          ...profile,
          credits: 0,
        });
      }
    } else {
      await database.insert(users).values({
        ...profile,
        credits: 0,
      });
    }

    const token = await createSessionToken(userId);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (err) {
    console.error("Firebase login failed:", err);
    return loginErrorResponse(err);
  }
}
