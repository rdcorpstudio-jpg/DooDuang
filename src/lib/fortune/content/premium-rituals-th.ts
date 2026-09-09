import type { FortuneTone } from "@/lib/fortune/analyze";

export type AuspiciousActivityId =
  | "talk"
  | "money"
  | "start"
  | "travel"
  | "forgive"
  | "rest";

export type AuspiciousActivity = {
  id: AuspiciousActivityId;
  label: string;
  emoji: string;
};

export const AUSPICIOUS_ACTIVITIES: AuspiciousActivity[] = [
  { id: "talk", label: "คุยเรื่องสำคัญ", emoji: "💬" },
  { id: "money", label: "เรื่องเงิน", emoji: "🪙" },
  { id: "start", label: "เริ่มของใหม่", emoji: "✨" },
  { id: "travel", label: "เดินทาง", emoji: "🌿" },
  { id: "forgive", label: "ขอโทษ / สานสัมพันธ์", emoji: "🕊️" },
  { id: "rest", label: "พักใจ", emoji: "🌙" },
];

/** Short answers only — ask user for richer bank later */
export const AUSPICIOUS_ANSWER: Record<
  AuspiciousActivityId,
  Record<FortuneTone, { verdict: string; tip: string }>
> = {
  talk: {
    high: { verdict: "เหมาะคุย", tip: "เปิดประโยคหลักก่อน แล้วฟังต่อ" },
    mid: { verdict: "คุยได้ถ้าไม่เร่ง", tip: "นัดสั้น ๆ ชัด ๆ พอ" },
    low: { verdict: "ชะลอไว้ก่อน", tip: "เขียนสิ่งที่อยากพูดไว้ก่อน" },
  },
  money: {
    high: { verdict: "จังหวะดี", tip: "คุยตัวเลขให้จบหนึ่งเรื่อง" },
    mid: { verdict: "เดินระวัง", tip: "ตรวจรายละเอียดก่อนโอน/จ่าย" },
    low: { verdict: "ไม่เร่งตัดสินใจ", tip: "เก็บแผนไว้ดูอีกวัน" },
  },
  start: {
    high: { verdict: "เริ่มได้", tip: "ลงมือชิ้นเล็กให้เห็นรูปวันนี้" },
    mid: { verdict: "เริ่มแบบเบา", tip: "เตรียมของให้ครบก่อนพุ่ง" },
    low: { verdict: "ซ้อมก่อนเปิดจริง", tip: "จัดระบบ ยังไม่ประกาศใหญ่" },
  },
  travel: {
    high: { verdict: "ไปได้สบาย", tip: "ออกแต่เช้า เผื่อเวลานิด" },
    mid: { verdict: "ไปได้ถ้าวางแผน", tip: "เช็กเส้นทางและของจำเป็น" },
    low: { verdict: "เลื่อนถ้าได้", tip: "พักใกล้ ๆ ดีกว่าฝืนไกล" },
  },
  forgive: {
    high: { verdict: "ใจเปิด", tip: "พูดสั้น จริงใจ ไม่ยกอดีตยาว" },
    mid: { verdict: "ค่อย ๆ สาน", tip: "เริ่มจากข้อความสั้นก่อนพบ" },
    low: { verdict: "ยังไม่พร้อมลึก", tip: "จัดใจตัวเองให้นิ่งก่อน" },
  },
  rest: {
    high: { verdict: "พักแล้วสด", tip: "พักสั้น ๆ แล้วกลับมาชัด" },
    mid: { verdict: "ควรพักบ้าง", tip: "ลดนัดเย็น เก็บแรง" },
    low: { verdict: "ต้องพักจริง", tip: "นอนให้พอ ปิดจอเร็วขึ้น" },
  },
};

export const YEAR_THEME: Record<
  FortuneTone,
  { title: string; blurb: string; focus: string }
> = {
  high: {
    title: "ปีแห่งการเปิดทาง",
    blurb: "จังหวะกล้าเริ่ม และให้คนเห็นฝีมือ",
    focus: "โฟกัสสิ่งที่ทำให้จบได้จริง",
  },
  mid: {
    title: "ปีแห่งการวางราก",
    blurb: "โตแบบนิ่ง สม่ำเสมอ มีของจริง",
    focus: "รักษาวินัยเล็ก ๆ ให้ต่อเนื่อง",
  },
  low: {
    title: "ปีแห่งการจัดใจ",
    blurb: "ปล่อยของเก่า เพื่อรับจังหวะใหม่",
    focus: "ลดภาระที่ไม่ใช่ของจริง",
  },
};

export const DAILY_BLESSINGS = [
  "วันนี้ขอให้ใจคุณเบา และทางข้างหน้าชัดขึ้นทีละก้าว",
  "ขอให้คำพูดของคุณถึงคนที่ควรได้ยิน ในจังหวะที่พอดี",
  "ขอให้คุณกล้าพักเมื่อเหนื่อย และกล้าเริ่มเมื่อพร้อม",
  "ขอให้สิ่งที่คุณตั้งใจ ถูกเห็นโดยไม่ต้องตะโกน",
  "ขอให้คืนนี้คุณวางเรื่องหนักลงได้ โดยไม่โทษตัวเอง",
  "ขอให้มีคนดีโผล่มาในวันที่คุณต้องการกำลังใจ",
] as const;

export const NIGHT_MODE: Record<
  FortuneTone,
  { release: string; tomorrow: string; close: string }
> = {
  high: {
    release: "วางความฮึกเหิมที่ยังไม่จำเป็นคืนนี้",
    tomorrow: "พรุ่งนี้เริ่มจากสิ่งที่ทำให้จบเร็วที่สุด",
    close: "หลับตาได้ — พรุ่งนี้ยังมีแสงรอ",
  },
  mid: {
    release: "วางเรื่องที่ยังแก้ไม่จบไว้ข้างหมอน",
    tomorrow: "พรุ่งนี้ทำต่อแค่หนึ่งชิ้นก็พอ",
    close: "หายใจช้า ๆ แล้วค่อยหลับ",
  },
  low: {
    release: "ไม่ต้องสรุปชีวิตทั้งวันในคืนเดียว",
    tomorrow: "พรุ่งนี้เริ่มช้าได้ ไม่ผิด",
    close: "คุณพักได้ — พรุ่งนี้ค่อยเผชิญใหม่",
  },
};
