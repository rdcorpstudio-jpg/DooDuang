import { NextResponse } from "next/server";
import {
  isLineLoginConfigured,
  lineAuthorizeUrl,
  lineCallbackUrl,
  LINE_RETURN_COOKIE,
  LINE_STATE_COOKIE,
  oauthCookieOptions,
  safeReturnPath,
} from "@/lib/line-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isLineLoginConfigured()) {
    return NextResponse.json(
      { error: "ยังไม่ได้ตั้งค่า LINE Login" },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const state = crypto.randomUUID();
  const returnPath = safeReturnPath(url.searchParams.get("callbackUrl"));
  const callbackUrl = lineCallbackUrl(request);
  const authorize = lineAuthorizeUrl({
    channelId: process.env.LINE_CHANNEL_ID || "",
    callbackUrl,
    state,
  });

  const response = NextResponse.redirect(authorize);
  const cookies = oauthCookieOptions();
  response.cookies.set(LINE_STATE_COOKIE, state, cookies);
  response.cookies.set(LINE_RETURN_COOKIE, returnPath, cookies);
  return response;
}
