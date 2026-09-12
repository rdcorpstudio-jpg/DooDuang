import type { FortuneTone } from "@/lib/fortune/analyze";
import { analyzeFortune, type FortuneAnalyzeInput } from "@/lib/fortune/analyze";

export type LuckyShirtId =
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "black";

export type LuckyShirtInfo = {
  id: LuckyShirtId;
  name: string;
  meaning: string;
  src: string;
  /** ใช้เมื่อไหร่ — ผูกโทนพลังวัน */
  bestForTone: FortuneTone[];
  /** สรุปสั้นใต้ไอคอน */
  label: string;
  /** รายละเอียดเต็ม */
  summary: string;
  howTo: string;
  tip: string;
  avoid: string;
};

/** คลังสีเสื้อมงคล — ข้อความคงที่ตามสี ไม่สุ่มรายคน */
export const LUCKY_SHIRT_CATALOG: LuckyShirtInfo[] = [
  {
    id: "green",
    name: "เขียว",
    meaning: "การงาน",
    label: "การงาน",
    src: "/images/shirts/green.webp",
    bestForTone: ["mid"],
    summary:
      "สีเขียวช่วยให้โฟกัสงานและเดินเรื่องต่อเนื่องได้ดี เหมาะวันที่พลังปานกลาง อยากปิดงานค้างหรือจัดลำดับให้ชัด",
    howTo: "ใส่เสื้อเขียวชั้นนอก หรือผ้า/เครื่องประดับโทนเขียวใกล้ลำตัว",
    tip: "เลือกงาน 1–2 เรื่องที่ใกล้จบ แล้วทำให้เห็นรูปก่อนค่ำ",
    avoid: "อย่าเปิดงานใหม่หลายทางพร้อมกัน จนแรงกระจาย",
  },
  {
    id: "purple",
    name: "ม่วง",
    meaning: "โชคลาภ",
    label: "โชคลาภ",
    src: "/images/shirts/purple.webp",
    bestForTone: ["high"],
    summary:
      "สีม่วงเสริมจังหวะโอกาสและการเจรจา เหมาะวันพลังสูง ที่อยากเสนอไอเดีย คุยดีล หรือเปิดประตูเรื่องใหม่",
    howTo: "ใส่โทนม่วงชัด หรือมีจุดม่วงบนเสื้อ/ผ้าพันคอ/เข็มกลัด",
    tip: "เปิดประเด็นสำคัญแบบสั้นชัด อย่าเก็บไว้ในหัวอย่างเดียว",
    avoid: "อย่ารีบตกลงทุกอย่างในวันเดียว โดยไม่เช็คเงื่อนไข",
  },
  {
    id: "orange",
    name: "ส้ม",
    meaning: "ความมั่นใจ",
    label: "มั่นใจ",
    src: "/images/shirts/orange.webp",
    bestForTone: ["high", "mid"],
    summary:
      "สีส้มดันความกล้าและความมั่นใจในการแสดงออก เหมาะวันที่ต้องพรีเซนต์ คุยงาน หรือตัดสินใจให้คนอื่นเห็นทิศทาง",
    howTo: "ใส่ส้มเป็นสีหลัก หรือจุดส้มบนเสื้อชั้นนอก",
    tip: "พูดประโยคสำคัญให้จบในหนึ่งประโยค แล้วค่อยอธิบาย",
    avoid: "อย่าใช้ความมั่นใจกดคนอื่นจนบรรยากาศตึง",
  },
  {
    id: "red",
    name: "แดง",
    meaning: "พลังใจ",
    label: "พลังใจ",
    src: "/images/shirts/red.webp",
    bestForTone: ["mid", "low"],
    summary:
      "สีแดงเติมไฟและกำลังใจ เหมาะวันที่รู้สึกเฉื่อย หรือต้องสู้เรื่องที่ต้องใช้แรงใจ ไม่ใช่แค่วิเคราะห์",
    howTo: "ใส่แดงพอประมาณ หรือจุดแดงเล็ก ๆ ให้เห็นชัด",
    tip: "ลงมือขั้นแรกของเรื่องที่เลื่อนมา แม้ยังไม่พร้อมครบ",
    avoid: "อย่าโมโหตัดสินใจใหญ่ตอนอารมณ์ร้อน",
  },
  {
    id: "black",
    name: "ดำ",
    meaning: "คุ้มครอง",
    label: "คุ้มครอง",
    src: "/images/shirts/black.webp",
    bestForTone: ["low"],
    summary:
      "สีดำช่วยเก็บพลังและตั้งขอบเขต เหมาะวันพลังต่ำ ที่ควรชะลอ จัดระบบ และไม่เปิดแนวรบใหม่",
    howTo: "ใส่ดำเรียบ ๆ ทั้งชุด หรือชั้นนอกสีเข้ม",
    tip: "พักให้พอ เคลียร์ของค้าง แล้วค่อยตัดสินใจใหญ่ในวันถัดไป",
    avoid: "อย่าบังคับตัวเองให้เร่งผลลัพธ์ในวันที่แรงไม่พอ",
  },
];

export function getLuckyShirtById(id: string): LuckyShirtInfo {
  return (
    LUCKY_SHIRT_CATALOG.find((s) => s.id === id) ?? LUCKY_SHIRT_CATALOG[0]!
  );
}

export function getLuckyShirtByName(name: string): LuckyShirtInfo {
  return (
    LUCKY_SHIRT_CATALOG.find((s) => s.name === name) ?? LUCKY_SHIRT_CATALOG[0]!
  );
}

/**
 * สีแนะนำของวัน — จาก dayTone + dayScore ของ analyzeFortune
 * (ไม่สุ่ม: คนวันเกิดเดียวกัน ในวันเดียวกัน ได้สีเดียวกัน)
 */
export function pickLuckyShirtForDay(input: FortuneAnalyzeInput): LuckyShirtInfo {
  const analysis = analyzeFortune(input);
  const { dayTone, dayScore } = analysis;
  const id =
    dayTone === "high"
      ? dayScore >= 10
        ? "purple"
        : "orange"
      : dayTone === "mid"
        ? dayScore >= 7
          ? "green"
          : "red"
        : "black";
  return getLuckyShirtById(id);
}

/** สีแนะนำรายวันถัดไป n วัน (พรีเมียม) */
export function pickLuckyShirtsForRange(
  input: FortuneAnalyzeInput,
  days: number
): Array<{ iso: string; label: string; shirt: LuckyShirtInfo }> {
  const base = input.asOf ?? new Date();
  const out: Array<{ iso: string; label: string; shirt: LuckyShirtInfo }> = [];
  const labels = ["วันนี้", "พรุ่งนี้", "มะรืน"];

  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const weekday = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"][d.getDay()]!;
    out.push({
      iso,
      label: labels[i] ?? `${weekday} ${d.getDate()}/${d.getMonth() + 1}`,
      shirt: pickLuckyShirtForDay({ ...input, asOf: d }),
    });
  }
  return out;
}
