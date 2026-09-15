import type { FortuneTone } from "@/lib/fortune/analyze";
import { scoreToTone } from "@/lib/fortune/analyze";

/**
 * Bridge copy when today's tone and this month's band pull in different directions.
 * Keeps day/month independent scores but explains them so the page doesn't feel broken.
 */
export function dayMonthBridgeCopy(
  dayTone: FortuneTone,
  monthScore: number
): string | null {
  const monthTone = scoreToTone(monthScore);

  if (dayTone === "low" && monthTone === "high") {
    return "วันนี้แม่อยากให้พักหรือทำเบา ๆ — แม้ภาพรวมเดือนนี้ยังมีแรง แยกจังหวะวันนี้กับจังหวะเดือนไว้นะ";
  }
  if (dayTone === "high" && monthTone === "low") {
    return "วันนี้พอเดินหน้าได้ แต่ภาพรวมเดือนยังไม่ถึงจุดพุ่ง อย่าเพิ่งตัดสินใจใหญ่ทั้งเดือนจากแค่วันนี้";
  }
  if (dayTone === "low" && monthTone === "mid") {
    return "เดือนนี้โดยรวมเดินต่อได้ แค่วันนี้ชะลอได้ก่อน ค่อยเก็บแรงไว้เรื่องสำคัญของเดือน";
  }
  if (dayTone === "mid" && monthTone === "high") {
    return "เดือนนี้โดยรวมไปได้ดี วันนี้โฟกัสทีละเรื่องก็พอ ไม่ต้องเร่งให้เท่าพลังเดือน";
  }
  if (dayTone === "high" && monthTone === "mid") {
    return "วันนี้พอเปิดเรื่องได้ แต่อย่าลากเป้าทั้งเดือนมาใส่ในวันเดียว";
  }
  if (dayTone === "mid" && monthTone === "low") {
    return "วันนี้ทำเรื่องเล็กให้จบได้ ภาพรวมเดือนยังขอความระวัง อย่าเพิ่งรับปากเรื่องใหญ่";
  }
  return null;
}

export function dayToneLabelTh(tone: FortuneTone) {
  if (tone === "high") return "เดินหน้าได้";
  if (tone === "mid") return "โฟกัสทีละเรื่อง";
  return "พัก/ทำเบา ๆ";
}
