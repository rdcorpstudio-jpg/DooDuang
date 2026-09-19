/** แมปชื่อสีไทย → ไอคอนเสื้อโปโลใน /images/shirts/*.webp */

export const POLO_SHIRT_IDS = [
  "black",
  "blue",
  "blush",
  "brown",
  "cream",
  "emerald",
  "gold",
  "gray",
  "green",
  "mint",
  "navy",
  "olive",
  "orange",
  "peach",
  "pink",
  "purple",
  "red",
  "silver",
  "sky-blue",
  "teal",
  "terracotta",
  "white",
  "yellow",
] as const;

export type PoloShirtId = (typeof POLO_SHIRT_IDS)[number];

const EXACT: Record<string, PoloShirtId> = {
  กรมท่า: "navy",
  ฟ้าน้ำทะเล: "teal",
  ฟ้าหม่น: "sky-blue",
  ฟ้าสด: "sky-blue",
  ฟ้า: "blue",
  น้ำเงินเข้ม: "navy",
  เขียวมะกอก: "olive",
  เขียวเข้ม: "emerald",
  เขียวหยก: "emerald",
  เขียวนีออน: "mint",
  เขียว: "green",
  แดงอิฐ: "terracotta",
  แดงไวน์: "red",
  แดงสด: "red",
  แดง: "red",
  ส้มไหม้: "orange",
  ส้มอิฐ: "terracotta",
  ส้มสด: "orange",
  ส้ม: "orange",
  ชมพูกุหลาบ: "pink",
  ชมพูหม่น: "blush",
  ชมพูสด: "pink",
  ชมพู: "pink",
  ครีมอุ่น: "cream",
  น้ำตาลอ่อน: "brown",
  น้ำตาลเข้ม: "brown",
  เหลืองมัสตาร์ด: "gold",
  เหลืองสด: "yellow",
  เหลือง: "yellow",
  ขาวนวล: "cream",
  ขาวจ้า: "white",
  ขาว: "white",
  เทาเงิน: "gray",
  เทาเข้ม: "gray",
  ทองอ่อน: "gold",
  ทองเงา: "gold",
  ม่วงพลัม: "purple",
  ม่วงเข้ม: "purple",
  ม่วง: "purple",
  ดำสนิท: "black",
  ดำ: "black",
  เบจ: "cream",
  เงินเงา: "silver",
  เงิน: "silver",
  พีช: "peach",
};

export function poloShirtIdForColorName(name: string): PoloShirtId {
  const trimmed = name.trim();
  if (EXACT[trimmed]) return EXACT[trimmed]!;
  const keys = Object.keys(EXACT).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (trimmed.includes(key)) return EXACT[key]!;
  }
  return "gray";
}

export function poloShirtSrcForColorName(name: string): string {
  const id = poloShirtIdForColorName(name);
  return `/images/shirts/${id}.webp`;
}
