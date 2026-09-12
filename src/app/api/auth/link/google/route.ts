import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { linkGoogleToUser } from "@/lib/account-links";
import {
  getFirebaseProjectId,
  verifyFirebaseIdToken,
} from "@/lib/firebase/verify-id-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "ต้องเข้าสู่ระบบก่อน", code: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    if (!getFirebaseProjectId()) {
      return NextResponse.json(
        { error: "ยังไม่ได้ตั้งค่า Firebase" },
        { status: 503 }
      );
    }

    const body = (await request.json().catch(() => null)) as {
      idToken?: string;
    } | null;
    const idToken = typeof body?.idToken === "string" ? body.idToken : "";
    if (!idToken) {
      return NextResponse.json({ error: "ไม่พบ token" }, { status: 400 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    const result = await linkGoogleToUser(session.user.id, {
      firebaseUid: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
      image: decoded.picture ?? null,
    });

    if (!result.ok) {
      if (result.error === "taken") {
        return NextResponse.json(
          {
            error: "บัญชี Google นี้ถูกใช้กับบัญชีอื่นแล้ว",
            code: "TAKEN",
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "เชื่อมไม่สำเร็จ" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, already: result.already ?? false });
  } catch (err) {
    console.error("Link Google failed:", err);
    return NextResponse.json({ error: "เชื่อม Google ไม่สำเร็จ" }, { status: 500 });
  }
}
