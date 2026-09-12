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
    <div className="min-h-full bg-[#f4f5f7] text-[#1c2430]">
      <header className="sticky top-0 z-20 border-b border-[#e2e5ea] bg-[#f4f5f7]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
              Internal
            </p>
            <p className="truncate text-[14px] font-semibold text-[#1c2430]">
              Mae Mang Mee · Admin
            </p>
          </div>
          <p className="truncate text-[12px] text-[#6b7280]">
            {session.user.email}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
