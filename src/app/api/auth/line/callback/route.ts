import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth";
import {
  exchangeLineCode,
  fetchLineProfile,
  lineCallbackUrl,
  LINE_RETURN_COOKIE,
  LINE_STATE_COOKIE,
  safeReturnPath,
  upsertUserByLineId,
} from "@/lib/line-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function loginRedirect(request: Request, error: string) {
  const to = new URL("/login", request.url);
  to.searchParams.set("lineError", error);
  const response = NextResponse.redirect(to);
  response.cookies.delete(LINE_STATE_COOKIE);
  response.cookies.delete(LINE_RETURN_COOKIE);
  return response;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const lineError = url.searchParams.get("error");

    if (lineError) {
      console.error("LINE authorize denied:", lineError);
      return loginRedirect(request, "denied");
    }
    if (!code || !state) {
      return loginRedirect(request, "missing");
    }

    const store = await cookies();
    const expectedState = store.get(LINE_STATE_COOKIE)?.value || null;
    const returnPath = safeReturnPath(store.get(LINE_RETURN_COOKIE)?.value);

    if (!expectedState || expectedState !== state) {
      return loginRedirect(request, "state");
    }

    const accessToken = await exchangeLineCode({
      code,
      callbackUrl: lineCallbackUrl(request),
    });
    const profile = await fetchLineProfile(accessToken);
    const { userId } = await upsertUserByLineId(profile);
    const token = await createSessionToken(userId);

    const response = NextResponse.redirect(new URL(returnPath, request.url));
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    response.cookies.delete(LINE_STATE_COOKIE);
    response.cookies.delete(LINE_RETURN_COOKIE);
    return response;
  } catch (err) {
    console.error("LINE login failed:", err);
    return loginRedirect(request, "failed");
  }
}
