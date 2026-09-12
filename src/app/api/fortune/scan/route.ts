import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  analyzeFaceWithOpenAI,
  analyzePalmWithOpenAI,
  isOpenAIScanConfigured,
} from "@/lib/fortune/scan/openai-scan";
import { requirePremiumSession } from "@/lib/premium-entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type ScanMode = "face" | "palm";

function collectImages(body: {
  imageDataUrl?: string;
  imageDataUrls?: string[];
}): string[] {
  if (Array.isArray(body.imageDataUrls) && body.imageDataUrls.length > 0) {
    return body.imageDataUrls.map((s) => s.trim()).filter(Boolean);
  }
  if (body.imageDataUrl?.trim()) return [body.imageDataUrl.trim()];
  return [];
}

export async function POST(request: Request) {
  try {
    const premium = await requirePremiumSession();
    if (!premium) {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json(
          { error: "ต้องเข้าสู่ระบบก่อน", code: "UNAUTHENTICATED" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: "ต้องเป็นสมาชิกพรีเมียม", code: "PREMIUM_REQUIRED" },
        { status: 403 }
      );
    }

    if (!isOpenAIScanConfigured()) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY ยังไม่ได้ตั้ง", code: "NO_API_KEY" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      mode?: ScanMode;
      imageDataUrl?: string;
      imageDataUrls?: string[];
    };

    const mode = body.mode;
    const images = collectImages(body);

    if (mode !== "face" && mode !== "palm") {
      return NextResponse.json({ error: "mode ไม่ถูกต้อง" }, { status: 400 });
    }
    if (images.length === 0) {
      return NextResponse.json({ error: "รูปไม่ถูกต้อง" }, { status: 400 });
    }
    if (mode === "face" && images.length < 2) {
      return NextResponse.json(
        { error: "โหงวเฮ้งต้องมีรูปด้านหน้าและด้านข้าง" },
        { status: 400 }
      );
    }
    for (const image of images) {
      if (!image.startsWith("data:image/")) {
        return NextResponse.json({ error: "รูปไม่ถูกต้อง" }, { status: 400 });
      }
      if (image.length > 2_500_000) {
        return NextResponse.json(
          { error: "รูปใหญ่เกินไป ลองถ่ายใหม่" },
          { status: 413 }
        );
      }
    }

    const pack =
      mode === "face"
        ? await analyzeFaceWithOpenAI(images)
        : await analyzePalmWithOpenAI(images[0]);

    if (!pack) {
      return NextResponse.json(
        { error: "วิเคราะห์ด้วย AI ไม่สำเร็จ", code: "AI_FAILED" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, mode, pack });
  } catch (err) {
    console.error("fortune scan route error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    );
  }
}
