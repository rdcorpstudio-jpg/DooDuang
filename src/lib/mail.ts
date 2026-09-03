import nodemailer from "nodemailer";
import { APP_NAME } from "@/lib/site";

function smtpPort() {
  return Number(process.env.SMTP_PORT || 587);
}

export function isMailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      (process.env.EMAIL_FROM || process.env.SMTP_USER)
  );
}

function createTransport() {
  const port = smtpPort();
  const secure =
    process.env.SMTP_SECURE === "true" || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls:
      process.env.SMTP_INSECURE_TLS === "true"
        ? { rejectUnauthorized: false }
        : undefined,
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

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER!;
  const transport = createTransport();

  await transport.sendMail({
    from: `"${APP_NAME}" <${from}>`,
    to,
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
}
