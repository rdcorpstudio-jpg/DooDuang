import { redirect } from "next/navigation";

/**
 * เดิมใช้ /premium เป็นบ้านหลังกรอกโปรไฟล์
 * ตอนนี้บ้านหลักอยู่ที่ /home — คง redirect กันลิงก์เก่า
 */
export default function PremiumIndexRedirect() {
  redirect("/home");
}
