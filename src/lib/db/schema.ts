import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  /** E.164, e.g. +66812345678 */
  phone: text("phone").unique(),
  /** LINE Login userId — unique per LINE Login channel */
  lineUserId: text("line_user_id").unique(),
  /** Firebase Auth UID when Google (or other Firebase) is linked */
  firebaseUid: text("firebase_uid").unique(),
  image: text("image"),
  credits: integer("credits").default(0).notNull(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status"),
  premiumUntil: timestamp("premium_until", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

export const phoneOtps = pgTable(
  "phone_otps",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    phone: text("phone").notNull(),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    attemptCount: integer("attempt_count").default(0).notNull(),
    consumedAt: timestamp("consumed_at", { mode: "date" }),
    ip: text("ip"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("phone_otps_phone_idx").on(table.phone),
    index("phone_otps_created_at_idx").on(table.createdAt),
  ]
);

export const readings = pgTable("readings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  type: text("type").notNull(),
  input: text("input"),
  result: text("result").notNull(),
  shareToken: text("share_token").unique(),
  email: text("email"),
  isPaid: boolean("is_paid").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeSessionId: text("stripe_session_id").unique(),
  amount: integer("amount").notNull(),
  credits: integer("credits").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/** Fortune / CRM profile — 1:1 with logged-in user */
export const fortuneProfiles = pgTable("fortune_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  realName: text("real_name"),
  nickname: text("nickname").notNull(),
  birthDate: text("birth_date").notNull(),
  gender: text("gender"),
  birthTime: text("birth_time"),
  birthPlace: text("birth_place"),
  focus: text("focus"),
  deepenSkipped: boolean("deepen_skipped").default(false).notNull(),
  profileLockedUntil: timestamp("profile_locked_until", { mode: "date" }),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/** Product analytics — funnel + feature usage */
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    feature: text("feature"),
    path: text("path"),
    props: text("props"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("analytics_events_name_created_idx").on(table.name, table.createdAt),
    index("analytics_events_feature_created_idx").on(
      table.feature,
      table.createdAt
    ),
    index("analytics_events_user_created_idx").on(table.userId, table.createdAt),
  ]
);

export type User = typeof users.$inferSelect;
export type PhoneOtp = typeof phoneOtps.$inferSelect;
export type Reading = typeof readings.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type FortuneProfile = typeof fortuneProfiles.$inferSelect;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
