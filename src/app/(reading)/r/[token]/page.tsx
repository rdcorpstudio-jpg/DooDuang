import { redirect } from "next/navigation";

/**
 * ลิงก์แชร์ผลดวงเก่าเลิกใช้ — บ้านหลักอยู่ที่ /home
 * (คง route ไว้กันลิงก์เก่าพัง)
 */
export default function SavedReadingPage() {
  redirect("/home");
}
