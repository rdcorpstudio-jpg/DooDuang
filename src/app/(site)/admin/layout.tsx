import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/analytics");
  }
  if (!isAdminEmail(session.user.email)) {
    redirect("/");
  }
  return <>{children}</>;
}
