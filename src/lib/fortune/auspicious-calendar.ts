/** Deterministic auspicious-day calendar helpers (entertainment / lifestyle copy). */

export type DayEnergy =
  | "strong"
  | "smooth"
  | "relax"
  | "slow"
  | "rest";

export type DayMarker = "holy" | "victory" | "fortune" | "chaos";

export interface DayProfile {
  iso: string;
  energy: DayEnergy;
  markers: DayMarker[];
}

export const ENERGY_META: Record<
  DayEnergy,
  { label: string; color: string; soft: string }
> = {
  /** Mae-harmonized energy hues — still distinct, sit on navy/gold */
  strong: { label: "วันพลังงานดี", color: "#4A8F5C", soft: "#6BAB7A" },
  smooth: { label: "วันราบรื่น", color: "#6A9E78", soft: "#8BB898" },
  relax: { label: "วันผ่อนคลาย", color: "#C9A05A", soft: "#D5B16F" },
  slow: { label: "วันชะลอตัว", color: "#B8925A", soft: "#C9A878" },
  rest: { label: "วันพักใจ", color: "#A89068", soft: "#C5B28A" },
};

export const MARKER_META: Record<
  DayMarker,
  { label: string; hint: string }
> = {
  holy: {
    label: "วันพระ",
    hint: "เหมาะกับการทำบุญ ทำความดี และตั้งจิตให้สงบ",
  },
  victory: {
    label: "วันธงชัย",
    hint: "ส่งเสริมความสำเร็จและโชคลาภ เหมาะเริ่มงานสำคัญและกิจกรรมมงคล",
  },
  fortune: {
    label: "วันโชคลาภ",
    hint: "จังหวะดีเรื่องการเงิน โอกาส และการเจรจาที่เกี่ยวกับผลประโยชน์",
  },
  chaos: {
    label: "วันโลกาวินาศ",
    hint: "ควรเลี่ยงเริ่มต้นเรื่องใหญ่หรือตัดสินใจเร่งด่วน อาจเจออุปสรรคได้ง่าย",
  },
};

const ENERGY_ORDER: DayEnergy[] = [
  "strong",
  "smooth",
  "relax",
  "slow",
  "rest",
];

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

export function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

export function startOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1);
}

export function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Sunday-first week index 0–6 */
export function sundayWeekIndex(date: Date) {
  return date.getDay();
}

export function getDayProfile(seed: string, date: Date): DayProfile {
  const iso = toIsoDate(date);
  const h = hashSeed(`${seed}::auspicious::${iso}`);
  const energy = ENERGY_ORDER[h % ENERGY_ORDER.length]!;
  const markers: DayMarker[] = [];

  // Spread markers across the month in a stable, readable pattern
  if (h % 15 === 0 || h % 15 === 7) markers.push("holy");
  if (h % 7 === 1) markers.push("victory");
  if (h % 11 === 3) markers.push("fortune");
  if (h % 13 === 5) markers.push("chaos");

  return { iso, energy, markers };
}

export function getMonthGrid(seed: string, year: number, monthIndex: number) {
  const total = daysInMonth(year, monthIndex);
  const first = startOfMonth(year, monthIndex);
  const lead = sundayWeekIndex(first);
  const cells: Array<DayProfile | null> = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= total; day++) {
    cells.push(getDayProfile(seed, new Date(year, monthIndex, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** 12-year window centered near “now” (matches life-path span feel) */
export function getCalendarYearRange(nowCe = new Date().getFullYear()) {
  const start = nowCe - 2;
  const end = nowCe + 9;
  return { start, end, years: Array.from({ length: 12 }, (_, i) => start + i) };
}

export function formatThaiMonthYear(year: number, monthIndex: number) {
  return new Intl.DateTimeFormat("th-TH", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(new Date(year, monthIndex, 1));
}

export function formatThaiDayShort(date: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

export function adviceForDay(profile: DayProfile): string {
  if (profile.markers.includes("chaos") && profile.markers.includes("victory")) {
    return "วันนี้มีทั้งพลังส่งเสริมและจุดที่ควรระวัง — ถ้าเรื่องต้องนิ่งระยะยาว เลือกชั่วโมงมงคลหรือเลื่อนวันเริ่มจะปลอดภัยกว่า";
  }
  if (profile.markers.includes("chaos")) {
    return "วันนี้เหมาะพักตัดสินใจใหญ่ โฟกัสงานเดิมให้เรียบร้อยก่อนเปิดหน้าใหม่";
  }
  if (profile.markers.includes("victory")) {
    return "เหมาะเริ่มต้นงานสำคัญ ลงนาม หรือกิจกรรมมงคล — ลงมือให้ชัดและจบเป็นขั้นตอน";
  }
  if (profile.markers.includes("fortune")) {
    return "จังหวะดีเรื่องเงินและการเจรจา เตรียมข้อมูลให้พร้อมก่อนคุยผลประโยชน์";
  }
  if (profile.markers.includes("holy")) {
    return "เหมาะทำบุญ ตั้งจิตให้สงบ และลดเรื่องที่ก่อความขัดแย้ง";
  }
  switch (profile.energy) {
    case "strong":
      return "พลังดี เหมาะโฟกัสงานหลักและปิดเป้าหมายที่ค้างอยู่";
    case "smooth":
      return "วันราบรื่น ใช้จัดระบบ สื่อสาร และเดินเรื่องต่อเนื่อง";
    case "relax":
      return "จังหวะผ่อน เหมาะดูแลตัวเองและความสัมพันธ์มากกว่าเร่งผล";
    case "slow":
      return "ชะลอความเร็ว ตรวจรายละเอียดก่อนตัดสินใจ";
    default:
      return "พักใจให้พอ แล้วค่อยกลับมาเลือกเรื่องสำคัญทีละอย่าง";
  }
}
