import { auth, type Session } from "@/lib/auth";

function adminEmailSet() {
  const raw = process.env.ADMIN_EMAILS || "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const set = adminEmailSet();
  if (set.size === 0) return false;
  return set.has(email.trim().toLowerCase());
}

export async function requireAdmin(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user) return null;
  if (!isAdminEmail(session.user.email)) return null;
  return session;
}
