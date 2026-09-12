import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  isClientAnalyticsEventName,
  isAnalyticsFeature,
} from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/track";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      name?: string;
      feature?: string | null;
      path?: string | null;
      props?: Record<string, unknown> | null;
    } | null;

    const name = typeof body?.name === "string" ? body.name : "";
    if (!isClientAnalyticsEventName(name)) {
      return NextResponse.json({ error: "event ไม่ถูกต้อง" }, { status: 400 });
    }

    const feature =
      typeof body?.feature === "string" && isAnalyticsFeature(body.feature)
        ? body.feature
        : null;

    if (name === "feature_open" && !feature) {
      return NextResponse.json({ error: "ต้องระบุ feature" }, { status: 400 });
    }

    const session = await auth();
    await trackEvent({
      name,
      userId: session?.user?.id,
      feature,
      path: typeof body?.path === "string" ? body.path : null,
      props: body?.props && typeof body.props === "object" ? body.props : null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("analytics event route failed:", err);
    return NextResponse.json({ ok: true });
  }
}
