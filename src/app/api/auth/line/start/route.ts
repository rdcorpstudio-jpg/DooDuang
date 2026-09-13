import { NextResponse } from "next/server";
import {
  createLineOAuthState,
  isLineLoginConfigured,
  lineAuthorizeUrl,
  lineCallbackUrl,
  LINE_LINK_COOKIE,
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
  const linkMode = url.searchParams.get("link") === "1";
  const returnPath = safeReturnPath(
    url.searchParams.get("callbackUrl") ||
      (linkMode ? "/dashboard" : null)
  );
  const state = createLineOAuthState({ returnPath, linkMode });
  const callbackUrl = lineCallbackUrl(request);
  const authorize = lineAuthorizeUrl({
    channelId: process.env.LINE_CHANNEL_ID || "",
    callbackUrl,
    state,
  });

  const response = NextResponse.redirect(authorize);
  const cookies = oauthCookieOptions();
  // Best-effort cookies (may be dropped by LINE in-app browser)
  response.cookies.set(LINE_STATE_COOKIE, state, cookies);
  response.cookies.set(LINE_RETURN_COOKIE, returnPath, cookies);
  if (linkMode) {
    response.cookies.set(LINE_LINK_COOKIE, "1", cookies);
  } else {
    response.cookies.delete(LINE_LINK_COOKIE);
  }
  return response;
}
