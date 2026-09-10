import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AccountDashboard } from "@/components/account/account-dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  return (
    <AccountDashboard
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        credits: session.user.credits,
      }}
    />
  );
}
