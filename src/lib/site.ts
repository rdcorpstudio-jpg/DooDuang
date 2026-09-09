export const APP_NAME = "แม่มั่งมี พามู";
export const APP_NAME_PRIMARY = "แม่มั่งมี";
export const APP_NAME_ACCENT = "พามู";
/** Short mark for eyebrows / watermarks */
export const APP_BRAND_MARK = "แม่มั่งมี";
export const APP_TAGLINE = "พามู พาดูดวง พามั่งมี";
export const APP_PURPOSE =
  "แม่มั่งมี พามู เป็นเว็บดูดวงออนไลน์ เปิดไพ่ทาโรต์ ดูดวงความรัก การงาน การเงิน และสุขภาพได้ทันที โดยไม่ต้องเข้าสู่ระบบ กรอกอีเมลหลังดูดวงเพื่อรับลิงก์ดูผลซ้ำ";
export const FORTUNE_UNLOCK_PRICE = 399;
/** Premium access duration after purchase (months) */
export const FORTUNE_PACKAGE_MONTHS = 1;
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
