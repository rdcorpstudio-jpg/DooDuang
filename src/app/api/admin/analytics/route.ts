import { NextResponse } from "next/server";
import { and, desc, eq, gte, lt, sql, type SQL } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import {
  ANALYTICS_FEATURES,
  ANALYTICS_FEATURE_LABELS,
  FUNNEL_STEPS,
  screenLabelFromPath,
  type AnalyticsFeature,
} from "@/lib/analytics/events";
import { requireDb } from "@/lib/db";
import {
  analyticsEvents,
  fortuneProfiles,
  payments,
  users,
} from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;
const MAX_CUSTOM_DAYS = 366;

function rangeDays(range: string | null): number {
  if (range === "90d") return 90;
  if (range === "30d") return 30;
  if (range === "7d") return 7;
  return 0;
}

function bangkokDayStart(ymd: string): Date | null {
  if (!YMD.test(ymd)) return null;
  const d = new Date(`${ymd}T00:00:00+07:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseWindow(url: URL): {
  since: Date;
  until: Date;
  rangeDays: number;
  from: string | null;
  to: string | null;
  range: string | null;
} | { error: string } {
  const fromRaw = url.searchParams.get("from");
  const toRaw = url.searchParams.get("to");
  if (fromRaw || toRaw) {
    if (!fromRaw || !toRaw) {
      return { error: "ต้องระบุทั้ง from และ to (YYYY-MM-DD)" };
    }
    const since = bangkokDayStart(fromRaw);
    const toStart = bangkokDayStart(toRaw);
    if (!since || !toStart) {
      return { error: "รูปแบบวันที่ไม่ถูกต้อง (ใช้ YYYY-MM-DD)" };
    }
    if (toStart.getTime() < since.getTime()) {
      return { error: "วันสิ้นสุดต้องไม่ก่อนวันเริ่ม" };
    }
    const until = new Date(toStart.getTime() + 24 * 60 * 60 * 1000);
    const days =
      Math.round((until.getTime() - since.getTime()) / (24 * 60 * 60 * 1000));
    if (days > MAX_CUSTOM_DAYS) {
      return { error: `ช่วงวันที่ยาวเกิน ${MAX_CUSTOM_DAYS} วัน` };
    }
    return {
      since,
      until,
      rangeDays: days,
      from: fromRaw,
      to: toRaw,
      range: null,
    };
  }

  const range = url.searchParams.get("range");
  const days = rangeDays(range);
  if (!days) {
    return { error: "ระบุ range=7d|30d|90d หรือ from+to" };
  }
  const until = new Date();
  const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    since,
    until,
    rangeDays: days,
    from: null,
    to: null,
    range: range === "90d" || range === "30d" || range === "7d" ? range : "7d",
  };
}

function channelLabel(raw: string) {
  switch (raw) {
    case "google":
      return "Google";
    case "line":
      return "LINE";
    case "phone":
      return "เบอร์";
    case "promptpay":
      return "PromptPay";
    case "card":
      return "บัตร";
    case "other":
      return "อื่น ๆ";
    default:
      return "ไม่ระบุ";
  }
}

function paymentMethodLabel(raw: string) {
  const key = raw.toLowerCase();
  if (key.includes("promptpay")) return "PromptPay";
  if (key === "card" || key.includes("card")) return "บัตร";
  if (!raw || raw === "unknown" || raw === "null") return "ไม่ระบุ";
  return raw;
}

function inWindow(
  column: typeof analyticsEvents.createdAt | typeof payments.createdAt,
  since: Date,
  until: Date
): SQL {
  return and(gte(column, since), lt(column, until))!;
}

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const db = requireDb();
    const url = new URL(request.url);
    const window = parseWindow(url);
    if ("error" in window) {
      return NextResponse.json({ error: window.error }, { status: 400 });
    }
    const { since, until, rangeDays: days, from, to, range } = window;

    const funnelRows = await db
      .select({
        name: analyticsEvents.name,
        events: sql<number>`count(*)::int`,
        uniqueUsers: sql<number>`count(distinct ${analyticsEvents.userId})::int`,
      })
      .from(analyticsEvents)
      .where(inWindow(analyticsEvents.createdAt, since, until))
      .groupBy(analyticsEvents.name);

    const byName = new Map(
      funnelRows.map((r) => [
        r.name,
        { events: Number(r.events) || 0, uniqueUsers: Number(r.uniqueUsers) || 0 },
      ])
    );

    /** Unique site visitors (page_view.visitorId) → signups → paying users */
    const [visitAgg] = await db
      .select({
        visitors: sql<number>`count(distinct coalesce((${analyticsEvents.props})::jsonb->>'visitorId', ${analyticsEvents.id}))::int`,
        sessions: sql<number>`count(*)::int`,
      })
      .from(analyticsEvents)
      .where(
        and(
          inWindow(analyticsEvents.createdAt, since, until),
          eq(analyticsEvents.name, "page_view")
        )
      );

    const [buyerAgg] = await db
      .select({
        buyers: sql<number>`count(distinct ${payments.userId})::int`,
      })
      .from(payments)
      .where(
        and(
          inWindow(payments.createdAt, since, until),
          eq(payments.status, "completed")
        )
      );

    const visitors = Number(visitAgg?.visitors) || 0;
    const visitSessions = Number(visitAgg?.sessions) || 0;
    const buyers = Number(buyerAgg?.buyers) || 0;

    const [payViewAgg] = await db
      .select({
        people: sql<number>`count(distinct coalesce(
          (${analyticsEvents.props})::jsonb->>'visitorId',
          ${analyticsEvents.userId},
          ${analyticsEvents.id}
        ))::int`,
        events: sql<number>`count(*)::int`,
      })
      .from(analyticsEvents)
      .where(
        and(
          inWindow(analyticsEvents.createdAt, since, until),
          eq(analyticsEvents.name, "pay_view")
        )
      );

    const payViews = Number(payViewAgg?.people) || 0;

    const paySourceRows = await db
      .select({
        feature: analyticsEvents.feature,
        count: sql<number>`count(distinct coalesce(
          (${analyticsEvents.props})::jsonb->>'visitorId',
          ${analyticsEvents.userId},
          ${analyticsEvents.id}
        ))::int`,
      })
      .from(analyticsEvents)
      .where(
        and(
          inWindow(analyticsEvents.createdAt, since, until),
          eq(analyticsEvents.name, "pay_view")
        )
      )
      .groupBy(analyticsEvents.feature);

    const payViewsByFeature = paySourceRows
      .map((r) => {
        const id = r.feature || "unknown";
        return {
          id,
          label:
            id !== "unknown" && id in ANALYTICS_FEATURE_LABELS
              ? ANALYTICS_FEATURE_LABELS[id as AnalyticsFeature]
              : id === "unknown" || !r.feature
                ? "ไม่ระบุ / ตรงจากเมนูอื่น"
                : id,
          count: Number(r.count) || 0,
        };
      })
      .sort((a, b) => b.count - a.count);

    const screenRows = await db
      .select({
        path: analyticsEvents.path,
        count: sql<number>`count(distinct coalesce(
          (${analyticsEvents.props})::jsonb->>'visitorId',
          ${analyticsEvents.userId},
          ${analyticsEvents.id}
        ))::int`,
      })
      .from(analyticsEvents)
      .where(
        and(
          inWindow(analyticsEvents.createdAt, since, until),
          eq(analyticsEvents.name, "screen_view")
        )
      )
      .groupBy(analyticsEvents.path);

    const topScreens = screenRows
      .map((r) => {
        const path = r.path || "/";
        return {
          id: path,
          label: screenLabelFromPath(path),
          count: Number(r.count) || 0,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

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
        uniqueUsers: sql<number>`count(distinct coalesce(
          (${analyticsEvents.props})::jsonb->>'visitorId',
          ${analyticsEvents.userId},
          ${analyticsEvents.id}
        ))::int`,
      })
      .from(analyticsEvents)
      .where(
        and(
          inWindow(analyticsEvents.createdAt, since, until),
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
    }).sort((a, b) => b.uniqueUsers - a.uniqueUsers || b.opens - a.opens);

    /** Signups by auth channel (from event props.channel) */
    const signupChannelRows = await db
      .select({
        channel: sql<string>`coalesce((${analyticsEvents.props})::jsonb->>'channel', 'unknown')`,
        count: sql<number>`count(*)::int`,
      })
      .from(analyticsEvents)
      .where(
        and(
          inWindow(analyticsEvents.createdAt, since, until),
          eq(analyticsEvents.name, "signup")
        )
      )
      .groupBy(sql`coalesce((${analyticsEvents.props})::jsonb->>'channel', 'unknown')`);

    const signupsByChannel = signupChannelRows
      .map((r) => ({
        id: r.channel || "unknown",
        label: channelLabel(r.channel || "unknown"),
        count: Number(r.count) || 0,
      }))
      .sort((a, b) => b.count - a.count);

    /** Payments from payments table — money source of truth */
    const paymentAgg = await db
      .select({
        count: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(${payments.amount}), 0)::int`,
      })
      .from(payments)
      .where(
        and(
          inWindow(payments.createdAt, since, until),
          eq(payments.status, "completed")
        )
      );

    const paymentCount = Number(paymentAgg[0]?.count) || 0;
    const revenueTotal = Number(paymentAgg[0]?.revenue) || 0;

    /** Revenue by account identity channel */
    const payByAccountRows = await db
      .select({
        channel: sql<string>`case
          when ${users.lineUserId} is not null then 'line'
          when ${users.firebaseUid} is not null then 'google'
          when ${users.phone} is not null then 'phone'
          else 'other'
        end`,
        count: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(${payments.amount}), 0)::int`,
      })
      .from(payments)
      .innerJoin(users, eq(payments.userId, users.id))
      .where(
        and(
          inWindow(payments.createdAt, since, until),
          eq(payments.status, "completed")
        )
      )
      .groupBy(sql`case
          when ${users.lineUserId} is not null then 'line'
          when ${users.firebaseUid} is not null then 'google'
          when ${users.phone} is not null then 'phone'
          else 'other'
        end`);

    const revenueByAccountChannel = payByAccountRows
      .map((r) => ({
        id: r.channel,
        label: channelLabel(r.channel),
        count: Number(r.count) || 0,
        revenue: Number(r.revenue) || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    /** Payment method from analytics props (PromptPay / card) when tracked */
    const payMethodRows = await db
      .select({
        method: sql<string>`coalesce((${analyticsEvents.props})::jsonb->>'paymentMethod', 'unknown')`,
        count: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(nullif((${analyticsEvents.props})::jsonb->>'amount', '')::int), 0)::int`,
      })
      .from(analyticsEvents)
      .where(
        and(
          inWindow(analyticsEvents.createdAt, since, until),
          eq(analyticsEvents.name, "payment_succeeded")
        )
      )
      .groupBy(
        sql`coalesce((${analyticsEvents.props})::jsonb->>'paymentMethod', 'unknown')`
      );

    const revenueByPaymentMethod = payMethodRows
      .map((r) => ({
        id: r.method || "unknown",
        label: paymentMethodLabel(r.method || "unknown"),
        count: Number(r.count) || 0,
        revenue: Number(r.revenue) || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    /** Daily signups + payments + revenue */
    const dailySignupRows = await db
      .select({
        day: sql<string>`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`,
        channel: sql<string>`coalesce((${analyticsEvents.props})::jsonb->>'channel', 'unknown')`,
        count: sql<number>`count(*)::int`,
      })
      .from(analyticsEvents)
      .where(
        and(
          inWindow(analyticsEvents.createdAt, since, until),
          eq(analyticsEvents.name, "signup")
        )
      )
      .groupBy(
        sql`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`,
        sql`coalesce((${analyticsEvents.props})::jsonb->>'channel', 'unknown')`
      )
      .orderBy(sql`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`);

    const dailyPayRows = await db
      .select({
        day: sql<string>`to_char(${payments.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(${payments.amount}), 0)::int`,
      })
      .from(payments)
      .where(
        and(
          inWindow(payments.createdAt, since, until),
          eq(payments.status, "completed")
        )
      )
      .groupBy(sql`to_char(${payments.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${payments.createdAt}, 'YYYY-MM-DD')`);

    const dailyMap = new Map<
      string,
      {
        day: string;
        signups: number;
        signupsGoogle: number;
        signupsLine: number;
        signupsPhone: number;
        signupsOther: number;
        payments: number;
        revenue: number;
      }
    >();

    for (const row of dailySignupRows) {
      const day = row.day;
      const entry = dailyMap.get(day) || {
        day,
        signups: 0,
        signupsGoogle: 0,
        signupsLine: 0,
        signupsPhone: 0,
        signupsOther: 0,
        payments: 0,
        revenue: 0,
      };
      const n = Number(row.count) || 0;
      entry.signups += n;
      if (row.channel === "google") entry.signupsGoogle += n;
      else if (row.channel === "line") entry.signupsLine += n;
      else if (row.channel === "phone") entry.signupsPhone += n;
      else entry.signupsOther += n;
      dailyMap.set(day, entry);
    }

    for (const row of dailyPayRows) {
      const day = row.day;
      const entry = dailyMap.get(day) || {
        day,
        signups: 0,
        signupsGoogle: 0,
        signupsLine: 0,
        signupsPhone: 0,
        signupsOther: 0,
        payments: 0,
        revenue: 0,
      };
      entry.payments = Number(row.count) || 0;
      entry.revenue = Number(row.revenue) || 0;
      dailyMap.set(day, entry);
    }

    const daily = Array.from(dailyMap.values()).sort((a, b) =>
      a.day.localeCompare(b.day)
    );

    const signupTotal = signupsByChannel.reduce((s, c) => s + c.count, 0);

    /** Individual completed purchases with buyer identity */
    const purchaseRows = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        createdAt: payments.createdAt,
        userId: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        nickname: fortuneProfiles.nickname,
        lineUserId: users.lineUserId,
        firebaseUid: users.firebaseUid,
      })
      .from(payments)
      .innerJoin(users, eq(payments.userId, users.id))
      .leftJoin(fortuneProfiles, eq(fortuneProfiles.userId, users.id))
      .where(
        and(
          inWindow(payments.createdAt, since, until),
          eq(payments.status, "completed")
        )
      )
      .orderBy(desc(payments.createdAt))
      .limit(200);

    const purchases = purchaseRows.map((r) => {
      const channel = r.lineUserId
        ? "line"
        : r.firebaseUid
          ? "google"
          : r.phone
            ? "phone"
            : "other";
      const displayName =
        (r.name && r.name.trim()) ||
        (r.nickname && r.nickname.trim()) ||
        null;
      return {
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        amount: Number(r.amount) || 0,
        userId: r.userId,
        name: displayName,
        email: r.email,
        phone: r.phone,
        channel,
        channelLabel: channelLabel(channel),
      };
    });

    return NextResponse.json({
      ok: true,
      rangeDays: days,
      range,
      from,
      to,
      since: since.toISOString(),
      until: until.toISOString(),
      summary: {
        signups: signupTotal,
        payments: paymentCount,
        revenue: revenueTotal,
        featureOpens: byName.get("feature_open")?.events ?? 0,
        visitors,
        buyers,
      },
      growthFunnel: {
        visitors,
        visitSessions,
        signups: signupTotal,
        buyers,
        payments: paymentCount,
      },
      payFunnel: {
        visitors,
        payViews,
        signups: signupTotal,
        buyers,
      },
      payViewsByFeature,
      topScreens,
      funnel,
      features,
      signupsByChannel,
      revenueByAccountChannel,
      revenueByPaymentMethod,
      daily,
      purchases,
    });
  } catch (err) {
    console.error("admin analytics failed:", err);
    return NextResponse.json(
      { error: "โหลด analytics ไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
