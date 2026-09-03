export const APP_NAME = "DooDuang";
export const APP_NAME_PRIMARY = "Doo";
export const APP_NAME_ACCENT = "Duang";
export const APP_TAGLINE = "เปิดประตูสู่โลกแห่งการทำนาย";
export const APP_PURPOSE =
  "DooDuang เป็นเว็บดูดวงออนไลน์ เปิดไพ่ทาโรต์ ดูดวงความรัก การงาน การเงิน และสุขภาพได้ทันที โดยไม่ต้องเข้าสู่ระบบ กรอกอีเมลหลังดูดวงเพื่อรับลิงก์ดูผลซ้ำ";
export const FORTUNE_UNLOCK_PRICE = 69;
export const FORTUNE_DISCLAIMER = "จักรวาลชี้ทาง — คุณเลือกก้าวต่อ";
export const SITE_URL = "https://dooduang-bay.vercel.app";
export const LEGAL_UPDATED_AT = "3 กันยายน 2569";

export function getSiteUrl() {
  const fromEnv = process.env.AUTH_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return SITE_URL;
}

export function createShareToken() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}
