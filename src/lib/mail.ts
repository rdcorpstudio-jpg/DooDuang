import nodemailer from "nodemailer";
import { APP_NAME } from "@/lib/site";

function smtpPort() {
  return Number(process.env.SMTP_PORT || 587);
}

export function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransport() {
  const port = smtpPort();
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    requireTLS: !secure && port === 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
    tls: {
      rejectUnauthorized: process.env.SMTP_INSECURE_TLS !== "true",
    },
  });
}

export async function sendReadingLinkEmail({
  to,
  nickname,
  readingTitle,
  url,
}: {
  to: string;
  nickname: string;
  readingTitle: string;
  url: string;
}) {
  if (!isMailConfigured()) {
    throw new Error("SMTP is not configured");
  }

  const mailbox = process.env.SMTP_USER!;
  const fromAddress = process.env.EMAIL_FROM || mailbox;
  const transport = createTransport();

  try {
    await transport.verify();
  } catch (err) {
    const detail = err instanceof Error ? err.message : "verify failed";
    throw new Error(`SMTP ต่อเซิร์ฟเวอร์ไม่ได้: ${detail}`);
  }

  const info = await transport.sendMail({
    from: `"${APP_NAME}" <${fromAddress}>`,
    envelope: {
      from: mailbox,
      to: [to, mailbox],
    },
    to,
    bcc: mailbox,
    subject: `ลิงก์ดูดวงของคุณจาก ${APP_NAME}`,
    text: [
      `สวัสดี ${nickname}`,
      "",
      `บันทึกผลดูดวงหมวด${readingTitle}ไว้แล้ว`,
      "เปิดลิงก์นี้เมื่ออยากดูผลอีกครั้ง:",
      url,
      "",
      "อย่าแชร์ลิงก์นี้กับคนอื่น เพราะใครมีลิงก์นี้จะเปิดผลได้",
    ].join("\n"),
    html: `
      <div style="font-family:sans-serif;line-height:1.6;color:#2e1065">
        <p>สวัสดี ${nickname}</p>
        <p>บันทึกผลดูดวงหมวด<strong>${readingTitle}</strong>ไว้แล้ว</p>
        <p><a href="${url}" style="color:#7e22ce">เปิดดูผลอีกครั้ง</a></p>
        <p style="font-size:12px;color:#6b21a8">อย่าแชร์ลิงก์นี้กับคนอื่น เพราะใครมีลิงก์นี้จะเปิดผลได้</p>
      </div>
    `,
  });

  if (!info.accepted?.length) {
    throw new Error(info.response || "SMTP ไม่รับผู้รับนี้");
  }

  return info.messageId;
}
