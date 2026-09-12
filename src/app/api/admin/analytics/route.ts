import { NextResponse } from "next/server";
import { and, gte, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import {
  ANALYTICS_FEATURES,
  ANALYTICS_FEATURE_LABELS,
  FUNNEL_STEPS,
  type AnalyticsFeature,
} from "@/lib/analytics/events";
import { requireDb } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function rangeDays(range: string | null): number {
  if (range === "90d") return 90;
  if (range === "30d") return 30;
  return 7;
}

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const db = requireDb();
    const url = new URL(request.url);
    const days = rangeDays(url.searchParams.get("range"));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const funnelRows = await db
      .select({
        name: analyticsEvents.name,
        events: sql<number>`count(*)::int`,
        uniqueUsers: sql<number>`count(distinct ${analyticsEvents.userId})::int`,
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, since))
      .groupBy(analyticsEvents.name);

    const byName = new Map(
      funnelRows.map((r) => [
        r.name,
        { events: Number(r.events) || 0, uniqueUsers: Number(r.uniqueUsers) || 0 },
      ])
    );

    const funnel = FUNNEL_STEPS.map((step, index) => {
      const current = byName.get(step.name) || { events: 0, uniqueUsers: 0 };
      const prev =
        index > 0
          ? byName.get(FUNNEL_STEPS[index - 1].name) || {
              events: 0,
              uniqueUsers: 0,
            }
          : null;
      const fromUsers = prev?.uniqueUsers ?? null;
      const conversionPct =
        fromUsers && fromUsers > 0
          ? Math.round((current.uniqueUsers / fromUsers) * 1000) / 10
          : null;
      return {
        name: step.name,
        label: step.label,
        events: current.events,
        uniqueUsers: current.uniqueUsers,
        conversionPct,
      };
    });

    const featureRows = await db
      .select({
        feature: analyticsEvents.feature,
        name: analyticsEvents.name,
        events: sql<number>`count(*)::int`,
        uniqueUsers: sql<number>`count(distinct ${analyticsEvents.userId})::int`,
      })
      .from(analyticsEvents)
      .where(
        and(
          gte(analyticsEvents.createdAt, since),
          sql`${analyticsEvents.feature} is not null`
        )
      )
      .groupBy(analyticsEvents.feature, analyticsEvents.name);

    const featureMap = new Map<
      string,
      { opens: number; completes: number; uniqueUsers: number }
    >();

    for (const id of ANALYTICS_FEATURES) {
      featureMap.set(id, { opens: 0, completes: 0, uniqueUsers: 0 });
    }

    for (const row of featureRows) {
      if (!row.feature) continue;
      const entry = featureMap.get(row.feature) || {
        opens: 0,
        completes: 0,
        uniqueUsers: 0,
      };
      const events = Number(row.events) || 0;
      const uniques = Number(row.uniqueUsers) || 0;
      if (row.name === "feature_open") {
        entry.opens += events;
        entry.uniqueUsers = Math.max(entry.uniqueUsers, uniques);
      }
      if (row.name === "feature_complete") {
        entry.completes += events;
        entry.uniqueUsers = Math.max(entry.uniqueUsers, uniques);
      }
      featureMap.set(row.feature, entry);
    }

    const features = ANALYTICS_FEATURES.map((id) => {
      const stats = featureMap.get(id)!;
      return {
        id,
        label: ANALYTICS_FEATURE_LABELS[id as AnalyticsFeature],
        opens: stats.opens,
        completes: stats.completes,
        uniqueUsers: stats.uniqueUsers,
      };
    }).sort((a, b) => b.opens + b.completes - (a.opens + a.completes));

    const dailyRows = await db
      .select({
        day: sql<string>`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`,
        name: analyticsEvents.name,
        events: sql<number>`count(*)::int`,
      })
      .from(analyticsEvents)
      .where(
        and(
          gte(analyticsEvents.createdAt, since),
          sql`${analyticsEvents.name} in ('signup', 'payment_succeeded')`
        )
      )
      .groupBy(
        sql`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`,
        analyticsEvents.name
      )
      .orderBy(sql`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`);

    const dailyMap = new Map<
      string,
      { day: string; signups: number; payments: number }
    >();
    for (const row of dailyRows) {
      const day = row.day;
      const entry = dailyMap.get(day) || { day, signups: 0, payments: 0 };
      const n = Number(row.events) || 0;
      if (row.name === "signup") entry.signups = n;
      if (row.name === "payment_succeeded") entry.payments = n;
      dailyMap.set(day, entry);
    }

    return NextResponse.json({
      ok: true,
      rangeDays: days,
      since: since.toISOString(),
      funnel,
      features,
      daily: Array.from(dailyMap.values()),
    });
  } catch (err) {
    console.error("admin analytics failed:", err);
    return NextResponse.json(
      { error: "โหลด analytics ไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
