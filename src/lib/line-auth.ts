import { eq } from "drizzle-orm";
import { requireDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSiteUrl } from "@/lib/site";

export const LINE_STATE_COOKIE = "dd_line_state";
export const LINE_RETURN_COOKIE = "dd_line_return";
const DEFAULT_RETURN = "/premium?checkout=1";

export function isLineLoginConfigured() {
  return Boolean(
    process.env.LINE_CHANNEL_ID && process.env.LINE_CHANNEL_SECRET
  );
}

export function lineCallbackUrl(request: Request) {
  const fromEnv = process.env.LINE_CALLBACK_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const origin = getSiteUrl() || new URL(request.url).origin;
  return `${origin}/api/auth/line/callback`;
}

export function safeReturnPath(raw?: string | null) {
  const value = (raw || DEFAULT_RETURN).trim() || DEFAULT_RETURN;
  if (!value.startsWith("/") || value.startsWith("//")) return DEFAULT_RETURN;
  if (value.startsWith("/login") || value.startsWith("/auth/")) {
    return DEFAULT_RETURN;
  }
  return value;
}

export function lineAuthorizeUrl(opts: {
  channelId: string;
  callbackUrl: string;
  state: string;
}) {
  const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", opts.channelId);
  url.searchParams.set("redirect_uri", opts.callbackUrl);
  url.searchParams.set("state", opts.state);
  url.searchParams.set("scope", "profile openid");
  url.searchParams.set("nonce", opts.state);
  return url.toString();
}

type LineTokenResponse = {
  access_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

type LineProfile = {
  userId?: string;
  displayName?: string;
  pictureUrl?: string;
};

export async function exchangeLineCode(opts: {
  code: string;
  callbackUrl: string;
}) {
  const channelId = process.env.LINE_CHANNEL_ID || "";
  const channelSecret = process.env.LINE_CHANNEL_SECRET || "";
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.callbackUrl,
    client_id: channelId,
    client_secret: channelSecret,
  });

  const res = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = (await res.json()) as LineTokenResponse;
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "LINE token failed");
  }
  return data.access_token;
}

export async function fetchLineProfile(accessToken: string) {
  const res = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const data = (await res.json()) as LineProfile;
  if (!res.ok || !data.userId) {
    throw new Error("LINE profile failed");
  }
  return {
    lineUserId: data.userId,
    name: data.displayName || null,
    image: data.pictureUrl || null,
  };
}

export async function upsertUserByLineId(profile: {
  lineUserId: string;
  name: string | null;
  image: string | null;
}) {
  const db = requireDb();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.lineUserId, profile.lineUserId))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({
        name: profile.name,
        image: profile.image,
      })
      .where(eq(users.id, existing.id));
    return { userId: existing.id, isNewUser: false };
  }

  const userId = crypto.randomUUID();
  try {
    await db.insert(users).values({
      id: userId,
      lineUserId: profile.lineUserId,
      name: profile.name,
      image: profile.image,
      credits: 0,
    });
    return { userId, isNewUser: true };
  } catch (err) {
    const [race] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.lineUserId, profile.lineUserId))
      .limit(1);
    if (race) {
      return { userId: race.id, isNewUser: false };
    }
    throw err;
  }
}

export function oauthCookieOptions() {
  const secure =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60,
  };
}
