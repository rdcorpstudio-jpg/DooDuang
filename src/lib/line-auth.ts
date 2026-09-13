import { createHmac, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { requireDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSiteUrl } from "@/lib/site";

export const LINE_STATE_COOKIE = "dd_line_state";
export const LINE_RETURN_COOKIE = "dd_line_return";
export const LINE_LINK_COOKIE = "dd_line_link";
const DEFAULT_RETURN = "/dashboard";
const STATE_TTL_MS = 15 * 60 * 1000;

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
  url.searchParams.set("nonce", crypto.randomUUID());
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

export type LineOAuthStatePayload = {
  /** return path */
  r: string;
  /** link mode */
  l?: 1;
  /** expiry epoch ms */
  exp: number;
};

function stateSecret() {
  const secret =
    process.env.AUTH_SECRET || process.env.LINE_CHANNEL_SECRET || "";
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return secret;
}

function signPayload(body: string) {
  return createHmac("sha256", stateSecret()).update(body).digest("base64url");
}

/**
 * Self-contained OAuth state — survives LINE in-app browser where
 * SameSite cookies set on redirect-out are often dropped.
 */
export function createLineOAuthState(opts: {
  returnPath: string;
  linkMode?: boolean;
}) {
  const payload: LineOAuthStatePayload = {
    r: safeReturnPath(opts.returnPath),
    exp: Date.now() + STATE_TTL_MS,
    ...(opts.linkMode ? { l: 1 as const } : {}),
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  return `${body}.${signPayload(body)}`;
}

export function parseLineOAuthState(
  state: string | null | undefined
): LineOAuthStatePayload | null {
  if (!state) return null;
  const dot = state.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  if (!body || !sig) return null;

  try {
    const expected = signPayload(body);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as LineOAuthStatePayload;
    if (!payload || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    if (typeof payload.r !== "string") return null;
    return {
      r: safeReturnPath(payload.r),
      exp: payload.exp,
      ...(payload.l === 1 ? { l: 1 as const } : {}),
    };
  } catch {
    return null;
  }
}

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
    // Prefer None in production so LINE in-app / cross-site return keeps cookies
    sameSite: (secure ? "none" : "lax") as "none" | "lax",
    path: "/",
    maxAge: 15 * 60,
  };
}
