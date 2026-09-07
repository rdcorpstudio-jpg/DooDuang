import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { readings } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { AnimatedPage } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { SacredButton } from "@/components/ui/sacred-button";
import { SacredDivider } from "@/components/ui/sacred-mark";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let history: { id: string; type: string; result: string; createdAt: Date }[] = [];

  try {
    const db = requireDb();
    history = await db
      .select({
        id: readings.id,
        type: readings.type,
        result: readings.result,
        createdAt: readings.createdAt,
      })
      .from(readings)
      .where(eq(readings.userId, session.user.id))
      .orderBy(desc(readings.createdAt))
      .limit(10);
  } catch {
    // DB not configured yet
  }

  const typeLabels: Record<string, string> = {
    daily: "ดวงรายวัน",
    love: "ความรัก",
    career: "การงาน",
    money: "การเงิน",
    health: "สุขภาพ",
    overall: "ภาพรวมชีวิต",
    tarot: "ไพ่ทาโรต์",
  };

  return (
    <AnimatedPage className="px-4 py-6 pb-10">
      <PageHero
        title="แดช"
        accent="บอร์ด"
        subtitle={session.user.name ?? session.user.email ?? undefined}
      />

      <Link href="/reading" className="mb-6 block">
        <SacredButton type="button">เลือกไพ่ดูดวง</SacredButton>
      </Link>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-[14px] font-semibold text-white">ประวัติดูดวง</h2>
        </div>
        <SacredDivider className="mb-4 opacity-60" />
        {history.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-white/35">
            ยังไม่มีประวัติ — ลองเปิดไพ่เลย
          </p>
        ) : (
          <div className="space-y-2.5">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-white/[0.03] px-3.5 py-3 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.05]"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-[#e9ddff]">
                    {typeLabels[item.type] ?? item.type}
                  </span>
                  <span className="text-[11px] text-white/35">
                    {item.createdAt.toLocaleDateString("th-TH")}
                  </span>
                </div>
                <p className="line-clamp-2 text-[12.5px] leading-relaxed text-white/45">
                  {(() => {
                    try {
                      const parsed = JSON.parse(item.result) as { preview?: string };
                      return parsed.preview || item.result;
                    } catch {
                      return item.result;
                    }
                  })()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AnimatedPage>
  );
}
