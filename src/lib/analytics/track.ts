import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schema";
import {
  isAnalyticsEventName,
  isAnalyticsFeature,
  type AnalyticsEventName,
  type AnalyticsFeature,
} from "@/lib/analytics/events";

export type TrackEventInput = {
  name: AnalyticsEventName;
  userId?: string | null;
  feature?: AnalyticsFeature | string | null;
  path?: string | null;
  props?: Record<string, unknown> | null;
};

/**
 * Persist a product analytics event. Fail-open — never throws to callers.
 */
export async function trackEvent(input: TrackEventInput): Promise<void> {
  try {
    if (!db) return;
    if (!isAnalyticsEventName(input.name)) return;

    const feature =
      typeof input.feature === "string" && isAnalyticsFeature(input.feature)
        ? input.feature
        : null;

    await db.insert(analyticsEvents).values({
      userId: input.userId || null,
      name: input.name,
      feature,
      path: input.path?.slice(0, 500) || null,
      props: input.props ? JSON.stringify(input.props) : null,
    });
  } catch (err) {
    console.error("analytics trackEvent failed:", err);
  }
}

/**
 * Track payment_succeeded once per Stripe Checkout session id.
 */
export async function trackPaymentSucceededOnce(opts: {
  userId: string;
  stripeSessionId: string;
  amount?: number;
  days?: number;
}): Promise<void> {
  try {
    if (!db) return;

    const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    const needle = `"stripeSessionId":"${opts.stripeSessionId}"`;
    const [existing] = await db
      .select({ id: analyticsEvents.id })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.name, "payment_succeeded"),
          gte(analyticsEvents.createdAt, since),
          sql`${analyticsEvents.props} like ${`%${needle}%`}`
        )
      )
      .limit(1);

    if (existing) return;

    await trackEvent({
      name: "payment_succeeded",
      userId: opts.userId,
      props: {
        stripeSessionId: opts.stripeSessionId,
        amount: opts.amount,
        days: opts.days,
      },
    });
  } catch (err) {
    console.error("analytics trackPaymentSucceededOnce failed:", err);
  }
}
