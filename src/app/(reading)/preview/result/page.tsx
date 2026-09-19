import { redirect } from "next/navigation";

/** หน้าผลดวงเก่าเลิกใช้ — บ้านหลักอยู่ที่ /home */
export default function PreviewResultPage() {
  redirect("/home");
}
