import { redirect } from "next/navigation";

/** Old TOC report route — folded into /premium unlocked dashboard */
export default function PremiumReportRedirect() {
  redirect("/premium");
}
