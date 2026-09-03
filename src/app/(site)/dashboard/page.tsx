import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { readings } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/ui/reveal";
import { History } from "lucide-react";

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
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-white">
          แดช<span className="text-gradient">บอร์ด</span>
        </h1>
        <p className="text-sm text-purple-300/50">
          {session.user.name ?? session.user.email}
        </p>
      </div>

      <Link href="/#fortune" className="mb-6 block">
        <Button className="w-full">เลือกไพ่</Button>
      </Link>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <History className="h-4 w-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-purple-100">ประวัติดูดวง</h2>
        </div>
        {history.length === 0 ? (
          <p className="py-6 text-center text-xs text-purple-400/40">
            ยังไม่มีประวัติ — ลองเปิดไพ่เลย!
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="rounded-xl p-3 sacred-surface">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-purple-200">
                    {typeLabels[item.type] ?? item.type}
                  </span>
                  <span className="text-[10px] text-purple-400/50">
                    {item.createdAt.toLocaleDateString("th-TH")}
                  </span>
                </div>
                <p className="line-clamp-2 text-xs text-purple-300/60">
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
