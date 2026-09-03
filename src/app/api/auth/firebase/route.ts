import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getFirebaseAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

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

    const decoded = await getFirebaseAdminAuth().verifyIdToken(idToken);
    const db = requireDb();

    const profile = {
      id: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
      image: decoded.picture ?? null,
    };

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, profile.id))
      .limit(1);

    if (existing) {
      await db
        .update(users)
        .set({
          email: profile.email,
          name: profile.name,
          image: profile.image,
        })
        .where(eq(users.id, profile.id));
    } else {
      await db.insert(users).values({
        ...profile,
        credits: 0,
      });
    }

    const token = await createSessionToken(profile.id);
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
    return NextResponse.json({ error: "เข้าสู่ระบบไม่สำเร็จ" }, { status: 401 });
  }
}
