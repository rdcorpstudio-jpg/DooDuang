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

  const email = session.user.email || "";
  const name = session.user.name || email.split("@")[0] || "Admin";

  return (
    <div className="min-h-full bg-[#eef1f4] text-[#1a1d21]">
      <div className="mx-auto flex min-h-full max-w-[1280px] gap-0 lg:gap-5 lg:px-5 lg:py-5">
        <aside className="hidden w-[220px] shrink-0 flex-col rounded-[28px] bg-white p-5 shadow-[0_10px_40px_rgba(26,29,33,0.06)] lg:flex">
          <div className="flex items-center gap-2.5 px-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1a1d21] text-[13px] font-bold text-[#9ff5c8]">
              ม
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold tracking-tight">
                Mae Mang Mee
              </p>
              <p className="text-[11px] text-[#8b93a1]">Internal</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-[#f4f6f8] px-3.5 py-3">
            <p className="text-[11px] text-[#8b93a1]">ยินดีต้อนรับ</p>
            <p className="mt-0.5 truncate text-[13px] font-semibold">{name}</p>
          </div>

          <nav className="mt-6 space-y-1 text-[13px]">
            <div className="flex items-center gap-2.5 rounded-2xl bg-[#1a1d21] px-3.5 py-2.5 font-medium text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9ff5c8]" />
              Analytics
            </div>
            <p className="px-3.5 py-2 text-[#9aa3b0]">Dashboard · ช่วงที่เลือก</p>
          </nav>

          <p className="mt-auto truncate px-1 pt-8 text-[11px] text-[#9aa3b0]">
            {email}
          </p>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-black/[0.05] bg-[#eef1f4]/90 px-4 py-3.5 backdrop-blur-md lg:rounded-[28px] lg:border-0 lg:bg-transparent lg:px-1 lg:py-0 lg:backdrop-blur-0">
            <div className="flex items-center justify-between gap-3 lg:mb-4 lg:rounded-[24px] lg:bg-white lg:px-5 lg:py-3.5 lg:shadow-[0_10px_40px_rgba(26,29,33,0.06)]">
              <div className="min-w-0 lg:hidden">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b93a1]">
                  Internal
                </p>
                <p className="truncate text-[14px] font-semibold">Analytics</p>
              </div>
              <div className="hidden min-w-0 lg:block">
                <p className="text-[15px] font-semibold tracking-tight">
                  Analytics Dashboard
                </p>
                <p className="text-[12px] text-[#8b93a1]">
                  สมัคร · ชำระเงิน · การใช้ฟีเจอร์
                </p>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <span className="hidden truncate rounded-full bg-[#f4f6f8] px-3 py-1.5 text-[12px] text-[#5c6573] sm:inline">
                  {email}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a1d21] text-[12px] font-semibold text-white">
                  {(name[0] || "A").toUpperCase()}
                </span>
              </div>
            </div>
          </header>
          <div className="px-4 pb-8 pt-4 sm:px-5 lg:px-1 lg:pb-2 lg:pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
