import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getFortuneProfileForUser,
  normalizeFortuneProfileInput,
  rowToFortuneProfilePayload,
  upsertFortuneProfileForUser,
} from "@/lib/fortune/fortune-profile-db";

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

  const row = await getFortuneProfileForUser(session.user.id);
  return NextResponse.json({
    ok: true,
    profile: row ? rowToFortuneProfilePayload(row) : null,
  });
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "ต้องเข้าสู่ระบบก่อน", code: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => null)) as
      | Record<string, unknown>
      | null;
    const input = normalizeFortuneProfileInput(
      body as Parameters<typeof normalizeFortuneProfileInput>[0]
    );
    if (!input) {
      return NextResponse.json(
        { error: "ข้อมูลโปรไฟล์ไม่ครบ (ต้องมีชื่อเล่นและวันเกิด)" },
        { status: 400 }
      );
    }

    const row = await upsertFortuneProfileForUser(session.user.id, input);

    const { trackEvent } = await import("@/lib/analytics/track");
    void trackEvent({
      name: "profile_saved",
      userId: session.user.id,
    });

    return NextResponse.json({
      ok: true,
      profile: rowToFortuneProfilePayload(row),
    });
  } catch (err) {
    console.error("fortune profile upsert failed:", err);
    return NextResponse.json({ error: "บันทึกโปรไฟล์ไม่สำเร็จ" }, { status: 500 });
  }
}
