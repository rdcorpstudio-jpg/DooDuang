/**
 * Push text alerts to an internal LINE group via Messaging API.
 * Requires the bot to already be a member of the group.
 */

function messagingToken() {
  return (
    process.env.LINE_MESSAGING_ACCESS_TOKEN ||
    process.env.LINE_CHANNEL_ACCESS_TOKEN ||
    ""
  ).trim();
}

function notifyGroupId() {
  return (process.env.LINE_NOTIFY_GROUP_ID || "").trim();
}

export function isLineGroupNotifyConfigured() {
  return Boolean(messagingToken() && notifyGroupId());
}

export async function pushLineGroupText(text: string): Promise<boolean> {
  const token = messagingToken();
  const groupId = notifyGroupId();
  if (!token || !groupId) return false;

  const body = text.trim().slice(0, 4500);
  if (!body) return false;

  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: groupId,
        messages: [{ type: "text", text: body }],
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("LINE group push failed:", res.status, errText);
      return false;
    }
    return true;
  } catch (err) {
    console.error("LINE group push error:", err);
    return false;
  }
}

/** Fire-and-forget — never throw to callers. */
export function notifyLineGroup(text: string) {
  void pushLineGroupText(text);
}

function maskPhone(phone?: string | null) {
  if (!phone) return null;
  let national = phone.trim();
  if (national.startsWith("+66") && national.length >= 10) {
    national = `0${national.slice(3)}`;
  }
  const digits = national.replace(/\D/g, "");
  if (digits.length < 8) return "****";
  // 081****678 style
  return `${digits.slice(0, 3)}****${digits.slice(-3)}`;
}

function maskEmail(email?: string | null) {
  if (!email) return null;
  const raw = email.trim();
  const at = raw.indexOf("@");
  if (at <= 0) return "***";
  const local = raw.slice(0, at);
  const domain = raw.slice(at + 1);
  if (!domain) return "***";
  // a***@gmail.com / ab**@… / a*@…
  let maskedLocal: string;
  if (local.length <= 1) maskedLocal = "*";
  else if (local.length === 2) maskedLocal = `${local[0]}*`;
  else if (local.length <= 4) maskedLocal = `${local[0]}**${local[local.length - 1]}`;
  else maskedLocal = `${local.slice(0, 2)}***${local.slice(-1)}`;
  return `${maskedLocal}@${domain}`;
}

export function notifyNewRegistration(opts: {
  channel: "google" | "phone" | "line";
  userId: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}) {
  const channelLabel =
    opts.channel === "google"
      ? "Google"
      : opts.channel === "phone"
        ? "เบอร์โทร"
        : "LINE Login";
  const email = maskEmail(opts.email);
  const phone = maskPhone(opts.phone);
  const lines = [
    "🆕 สมัครใหม่",
    `ช่องทาง: ${channelLabel}`,
    opts.name ? `ชื่อ: ${opts.name}` : null,
    email ? `อีเมล: ${email}` : null,
    phone ? `เบอร์: ${phone}` : null,
    `id: ${opts.userId.slice(0, 8)}…`,
  ].filter(Boolean);
  notifyLineGroup(lines.join("\n"));
}

export function notifyPremiumPayment(opts: {
  userId: string;
  amount: number;
  days: number;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  lineLinked?: boolean;
  nickname?: string | null;
  birthDate?: string | null;
  alreadyFulfilled?: boolean;
}) {
  if (opts.alreadyFulfilled) return;
  const email = maskEmail(opts.email);
  const phone = maskPhone(opts.phone);
  const nickname = opts.nickname?.trim() || null;
  const birthDate = opts.birthDate?.trim() || null;
  const lines = [
    "💰 ชำระพรีเมียมสำเร็จ",
    `จำนวน: ${opts.amount.toLocaleString("th-TH")} บาท`,
    `สิทธิ์: +${opts.days} วัน`,
    opts.name?.trim() ? `ชื่อ: ${opts.name.trim()}` : null,
    `อีเมล: ${email || "ไม่ระบุ"}`,
    phone ? `เบอร์: ${phone}` : null,
    opts.lineLinked ? "LINE: เชื่อมแล้ว" : null,
    nickname ? `ชื่อเล่นดวง: ${nickname}` : null,
    birthDate ? `วันเกิด: ${birthDate}` : null,
    `id: ${opts.userId.slice(0, 8)}…`,
  ].filter(Boolean);
  notifyLineGroup(lines.join("\n"));
}
