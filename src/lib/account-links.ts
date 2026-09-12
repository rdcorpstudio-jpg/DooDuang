import { eq } from "drizzle-orm";
import { requireDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type AccountLinkStatus = {
  google: boolean;
  line: boolean;
  phone: boolean;
  email: string | null;
  phoneMasked: string | null;
};

/** Firebase UIDs are opaque alphanumerics; our phone/LINE users use UUID. */
export function looksLikeFirebaseUid(id: string) {
  return /^[A-Za-z0-9]{20,128}$/.test(id) && !id.includes("-");
}

export function maskThaiPhone(e164: string | null | undefined) {
  if (!e164) return null;
  const national = e164.startsWith("+66") ? `0${e164.slice(3)}` : e164;
  if (national.length < 9) return national;
  return `${national.slice(0, 3)}-***-${national.slice(-4)}`;
}

export function accountLinksFromUser(user: {
  id: string;
  email?: string | null;
  phone?: string | null;
  lineUserId?: string | null;
  firebaseUid?: string | null;
}): AccountLinkStatus {
  const google = Boolean(
    user.firebaseUid ||
      (user.email && looksLikeFirebaseUid(user.id))
  );
  return {
    google,
    line: Boolean(user.lineUserId),
    phone: Boolean(user.phone),
    email: user.email ?? null,
    phoneMasked: maskThaiPhone(user.phone),
  };
}

export async function getUserLinkRow(userId: string) {
  const db = requireDb();
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      phone: users.phone,
      lineUserId: users.lineUserId,
      firebaseUid: users.firebaseUid,
      name: users.name,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row ?? null;
}

export type LinkResult =
  | { ok: true; already?: boolean }
  | { ok: false; error: "taken" | "missing" | "same" };

export async function linkGoogleToUser(
  userId: string,
  profile: {
    firebaseUid: string;
    email: string | null;
    name: string | null;
    image: string | null;
  }
): Promise<LinkResult> {
  const db = requireDb();
  const me = await getUserLinkRow(userId);
  if (!me) return { ok: false, error: "missing" };

  if (
    me.firebaseUid === profile.firebaseUid ||
    (looksLikeFirebaseUid(me.id) && me.id === profile.firebaseUid)
  ) {
    return { ok: true, already: true };
  }

  const [byUid] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.firebaseUid, profile.firebaseUid))
    .limit(1);
  if (byUid && byUid.id !== userId) return { ok: false, error: "taken" };

  if (looksLikeFirebaseUid(profile.firebaseUid)) {
    const [byId] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, profile.firebaseUid))
      .limit(1);
    if (byId && byId.id !== userId) return { ok: false, error: "taken" };
  }

  if (profile.email) {
    const [byEmail] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, profile.email))
      .limit(1);
    if (byEmail && byEmail.id !== userId) return { ok: false, error: "taken" };
  }

  await db
    .update(users)
    .set({
      firebaseUid: profile.firebaseUid,
      email: profile.email ?? me.email,
      name: profile.name ?? me.name,
      image: profile.image ?? me.image,
    })
    .where(eq(users.id, userId));

  return { ok: true };
}

export async function linkLineToUser(
  userId: string,
  profile: {
    lineUserId: string;
    name: string | null;
    image: string | null;
  }
): Promise<LinkResult> {
  const db = requireDb();
  const me = await getUserLinkRow(userId);
  if (!me) return { ok: false, error: "missing" };

  if (me.lineUserId === profile.lineUserId) {
    return { ok: true, already: true };
  }

  const [owner] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.lineUserId, profile.lineUserId))
    .limit(1);
  if (owner && owner.id !== userId) return { ok: false, error: "taken" };

  await db
    .update(users)
    .set({
      lineUserId: profile.lineUserId,
      name: me.name || profile.name,
      image: me.image || profile.image,
    })
    .where(eq(users.id, userId));

  return { ok: true };
}

export async function linkPhoneToUser(
  userId: string,
  phone: string
): Promise<LinkResult> {
  const db = requireDb();
  const me = await getUserLinkRow(userId);
  if (!me) return { ok: false, error: "missing" };

  if (me.phone === phone) return { ok: true, already: true };

  const [owner] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);
  if (owner && owner.id !== userId) return { ok: false, error: "taken" };

  await db.update(users).set({ phone }).where(eq(users.id, userId));
  return { ok: true };
}
