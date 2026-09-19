import { redirect } from "next/navigation";

/** เดิมเป็นแบบร่าง / เคยชี้ /premium — บ้านหลักอยู่ที่ /home */
export default function PreviewHomePage() {
  redirect("/home");
}
