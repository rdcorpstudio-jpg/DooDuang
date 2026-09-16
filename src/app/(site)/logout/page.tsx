import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /logout — clear session and open Mae landing. */
export default async function LogoutPage() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/?from=logout");
}
