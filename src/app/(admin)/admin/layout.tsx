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

  return (
    <div className="min-h-full bg-[#0b0f14] text-[#e8edf5]">
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#0b0f14]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d8aa3]">
              Internal
            </p>
            <p className="truncate text-[14px] font-semibold text-[#f3f6fb]">
              Mae Mang Mee · Analytics
            </p>
          </div>
          <p className="truncate text-[12px] text-[#8b97ad]">
            {session.user.email}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
