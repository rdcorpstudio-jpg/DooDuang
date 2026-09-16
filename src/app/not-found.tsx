import { redirect } from "next/navigation";

/** Unknown paths → Mae home (avoid dead-end 404 for typos / random links). */
export default function NotFound() {
  redirect("/");
}
