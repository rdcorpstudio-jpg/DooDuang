import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { readings } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  AccountDashboard,
  type AccountHistoryItem,
} from "@/components/account/account-dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  let history: AccountHistoryItem[] = [];

  try {
    const db = requireDb();
    const rows = await db
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

    history = rows.map((item) => {
      let preview = item.result;
      try {
        const parsed = JSON.parse(item.result) as { preview?: string };
        preview = parsed.preview || item.result;
      } catch {
        /* keep raw */
      }
      return {
        id: item.id,
        type: item.type,
        preview,
        createdAt: item.createdAt.toISOString(),
      };
    });
  } catch {
    // DB not configured yet
  }

  return (
    <AccountDashboard
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        credits: session.user.credits,
      }}
      history={history}
    />
  );
}
