import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const WINDOW_MS = 60_000;
const MAX_HITS = 30;

type Bucket = { count: number; resetAt: number };
const hits = new Map<string, Bucket>();

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isSuspiciousUa(ua: string | null) {
  if (!ua || ua.length < 12) return true;
  const lower = ua.toLowerCase();
  return (
    lower.includes("bot") ||
    lower.includes("crawl") ||
    lower.includes("spider") ||
    lower.includes("scrapy") ||
    lower.includes("python-requests") ||
    lower.includes("curl/") ||
    lower.includes("wget/") ||
    lower.includes("httpclient") ||
    lower.includes("go-http-client") ||
    lower.includes("libwww")
  );
}

function allow(ip: string) {
  const now = Date.now();
  const bucket = hits.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= MAX_HITS;
}

/** Trim map occasionally so serverless instances don't grow forever. */
function maybePrune() {
  if (hits.size < 2_000) return;
  const now = Date.now();
  for (const [key, bucket] of hits) {
    if (now >= bucket.resetAt) hits.delete(key);
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname !== "/api/premium/status") {
    return NextResponse.next();
  }

  const ua = req.headers.get("user-agent");
  if (isSuspiciousUa(ua)) {
    return NextResponse.json(
      { error: "blocked", authenticated: false, premium: false },
      { status: 403 }
    );
  }

  const ip = clientIp(req);
  maybePrune();
  if (!allow(ip)) {
    return NextResponse.json(
      { error: "rate_limited", authenticated: false, premium: false },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/premium/status"],
};
