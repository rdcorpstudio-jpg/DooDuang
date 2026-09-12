import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth, createSessionToken, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";
import { linkLineToUser } from "@/lib/account-links";
import {
  exchangeLineCode,
  fetchLineProfile,
  lineCallbackUrl,
  LINE_LINK_COOKIE,
  LINE_RETURN_COOKIE,
  LINE_STATE_COOKIE,
  safeReturnPath,
  upsertUserByLineId,
} from "@/lib/line-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function clearLineCookies(response: NextResponse) {
  response.cookies.delete(LINE_STATE_COOKIE);
  response.cookies.delete(LINE_RETURN_COOKIE);
  response.cookies.delete(LINE_LINK_COOKIE);
}

function loginRedirect(request: Request, error: string) {
  const to = new URL("/login", request.url);
  to.searchParams.set("lineError", error);
  const response = NextResponse.redirect(to);
  clearLineCookies(response);
  return response;
}

function dashboardRedirect(request: Request, returnPath: string, error?: string) {
  const to = new URL(returnPath, request.url);
  if (error) to.searchParams.set("linkError", error);
  else to.searchParams.set("linked", "line");
  const response = NextResponse.redirect(to);
  clearLineCookies(response);
  return response;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const lineError = url.searchParams.get("error");

    const store = await cookies();
    const expectedState = store.get(LINE_STATE_COOKIE)?.value || null;
    const returnPath = safeReturnPath(store.get(LINE_RETURN_COOKIE)?.value);
    const linkMode = store.get(LINE_LINK_COOKIE)?.value === "1";

    if (lineError) {
      console.error("LINE authorize denied:", lineError);
      return linkMode
        ? dashboardRedirect(request, returnPath, "denied")
        : loginRedirect(request, "denied");
    }
    if (!code || !state) {
      return linkMode
        ? dashboardRedirect(request, returnPath, "missing")
        : loginRedirect(request, "missing");
    }

    if (!expectedState || expectedState !== state) {
      return linkMode
        ? dashboardRedirect(request, returnPath, "state")
        : loginRedirect(request, "state");
    }

    const accessToken = await exchangeLineCode({
      code,
      callbackUrl: lineCallbackUrl(request),
    });
    const profile = await fetchLineProfile(accessToken);

    if (linkMode) {
      const session = await auth();
      if (!session?.user) {
        return dashboardRedirect(request, returnPath, "auth");
      }
      const linked = await linkLineToUser(session.user.id, profile);
      if (!linked.ok) {
        return dashboardRedirect(
          request,
          returnPath,
          linked.error === "taken" ? "taken" : "failed"
        );
      }
      return dashboardRedirect(request, returnPath);
    }

    const { userId } = await upsertUserByLineId(profile);
    const token = await createSessionToken(userId);

    const response = NextResponse.redirect(new URL(returnPath, request.url));
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    clearLineCookies(response);
    return response;
  } catch (err) {
    console.error("LINE login failed:", err);
    const store = await cookies();
    const linkMode = store.get(LINE_LINK_COOKIE)?.value === "1";
    const returnPath = safeReturnPath(store.get(LINE_RETURN_COOKIE)?.value);
    return linkMode
      ? dashboardRedirect(request, returnPath, "failed")
      : loginRedirect(request, "failed");
  }
}
