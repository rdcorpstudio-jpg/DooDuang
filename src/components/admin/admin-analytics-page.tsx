"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type FunnelStep = {
  name: string;
  label: string;
  events: number;
  uniqueUsers: number;
  conversionPct: number | null;
};

type FeatureRow = {
  id: string;
  label: string;
  opens: number;
  completes: number;
  uniqueUsers: number;
};

type ChannelCount = {
  id: string;
  label: string;
  count: number;
};

type ChannelRevenue = {
  id: string;
  label: string;
  count: number;
  revenue: number;
};

type DailyRow = {
  day: string;
  signups: number;
  signupsGoogle: number;
  signupsLine: number;
  signupsPhone: number;
  signupsOther: number;
  payments: number;
  revenue: number;
};

type AnalyticsPayload = {
  ok: true;
  rangeDays: number;
  since: string;
  summary: {
    signups: number;
    payments: number;
    revenue: number;
    featureOpens: number;
  };
  funnel: FunnelStep[];
  features: FeatureRow[];
  signupsByChannel: ChannelCount[];
  revenueByAccountChannel: ChannelRevenue[];
  revenueByPaymentMethod: ChannelRevenue[];
  daily: DailyRow[];
};

type RangeKey = "7d" | "30d" | "90d";

function formatBaht(n: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDay(day: string) {
  const d = new Date(`${day}T12:00:00`);
  if (Number.isNaN(d.getTime())) return day;
  return new Intl.DateTimeFormat("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

function KpiCard({
  label,
  value,
  hint,
  accent = "teal",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "teal" | "amber" | "sky" | "violet";
}) {
  const bar =
    accent === "amber"
      ? "bg-[#d5b16f]"
      : accent === "sky"
        ? "bg-[#5b9fd4]"
        : accent === "violet"
          ? "bg-[#8b7ec8]"
          : "bg-[#2dd4bf]";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121821] px-4 py-4">
      <div className={cn("absolute inset-x-0 top-0 h-[2px]", bar)} />
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#8b97ad]">
        {label}
      </p>
      <p className="mt-2 text-[1.65rem] font-semibold tabular-nums tracking-tight text-[#f3f6fb]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[12px] text-[#7d8aa3]">{hint}</p>
      ) : null}
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-[#121821] p-4 sm:p-5",
        className
      )}
    >
      <div className="mb-4">
        <h2 className="text-[14px] font-semibold text-[#f3f6fb]">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-[12px] text-[#7d8aa3]">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ChannelBars({
  items,
  mode,
}: {
  items: Array<{ id: string; label: string; count: number; revenue?: number }>;
  mode: "count" | "revenue";
}) {
  const max = Math.max(
    1,
    ...items.map((i) => (mode === "revenue" ? i.revenue || 0 : i.count))
  );
  if (items.length === 0) {
    return <p className="text-[13px] text-[#7d8aa3]">ยังไม่มีข้อมูล</p>;
  }
  return (
    <ul className="space-y-3.5">
      {items.map((item) => {
        const value = mode === "revenue" ? item.revenue || 0 : item.count;
        return (
          <li key={item.id}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2 text-[12px]">
              <span className="font-medium text-[#e8edf5]">{item.label}</span>
              <span className="tabular-nums text-[#8b97ad]">
                {mode === "revenue"
                  ? `${formatBaht(value)} · ${item.count} รายการ`
                  : `${value} คน`}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={cn(
                  "h-full rounded-full",
                  mode === "revenue" ? "bg-[#d5b16f]" : "bg-[#2dd4bf]"
                )}
                style={{
                  width: `${Math.max(value > 0 ? 4 : 0, (value / max) * 100)}%`,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminAnalyticsPage() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (nextRange: RangeKey) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics?range=${nextRange}`, {
        cache: "no-store",
      });
      if (res.status === 403) {
        setError("ไม่มีสิทธิ์ดูหน้านี้ (ตั้ง ADMIN_EMAILS)");
        setData(null);
        return;
      }
      if (!res.ok) {
        setError("โหลดข้อมูลไม่สำเร็จ");
        setData(null);
        return;
      }
      const json = (await res.json()) as AnalyticsPayload;
      setData(json);
    } catch {
      setError("โหลดข้อมูลไม่สำเร็จ");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(range);
  }, [range, load]);

  const maxFunnelUsers = Math.max(
    1,
    ...(data?.funnel.map((s) => s.uniqueUsers) || [1])
  );
  const maxFeatureOpens = Math.max(
    1,
    ...(data?.features.map((f) => f.opens) || [1])
  );
  const maxDailySignups = Math.max(
    1,
    ...(data?.daily.map((d) => d.signups) || [1])
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.7rem] font-semibold tracking-tight text-[#f3f6fb]">
            Dashboard
          </h1>
          <p className="mt-1 text-[13px] text-[#8b97ad]">
            สมัคร · ชำระเงิน · การใช้ฟีเจอร์
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-white/[0.08] bg-[#121821] p-1">
          {(["7d", "30d", "90d"] as RangeKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-[12px] font-semibold outline-none transition",
                range === key
                  ? "bg-[#e8edf5] text-[#0b0f14]"
                  : "text-[#8b97ad] hover:bg-white/[0.04] hover:text-[#e8edf5]"
              )}
            >
              {key === "7d" ? "7 วัน" : key === "30d" ? "30 วัน" : "90 วัน"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-[14px] text-[#8b97ad]">กำลังโหลด…</p>
      ) : error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[14px] text-rose-200">
          {error}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="สมัครใหม่"
              value={data.summary.signups}
              hint={`ช่วง ${data.rangeDays} วัน`}
              accent="teal"
            />
            <KpiCard
              label="รายได้"
              value={formatBaht(data.summary.revenue)}
              hint={`${data.summary.payments} รายการชำระ`}
              accent="amber"
            />
            <KpiCard
              label="ชำระสำเร็จ"
              value={data.summary.payments}
              hint="payments.completed"
              accent="sky"
            />
            <KpiCard
              label="เปิดฟีเจอร์"
              value={data.summary.featureOpens}
              hint="ครั้งทั้งหมด"
              accent="violet"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel
              title="สมัครตามช่องทาง"
              subtitle="Google · LINE · เบอร์ จาก event สมัคร"
            >
              <ChannelBars items={data.signupsByChannel} mode="count" />
            </Panel>

            <Panel
              title="รายได้ตามช่องทางบัญชี"
              subtitle="จัดกลุ่มจากบัญชีที่จ่าย (LINE / Google / เบอร์)"
            >
              <ChannelBars
                items={data.revenueByAccountChannel}
                mode="revenue"
              />
            </Panel>
          </div>

          <Panel
            title="ช่องทางชำระ (Stripe)"
            subtitle="PromptPay / บัตร — จาก payment ที่ track หลังชำระ (ข้อมูลใหม่หลังอัปเดตนี้)"
          >
            <ChannelBars
              items={data.revenueByPaymentMethod}
              mode="revenue"
            />
          </Panel>

          <Panel
            title="รายวัน"
            subtitle="จำนวนสมัครแยกช่องทาง · จำนวนชำระ · ยอดเงิน"
          >
            {data.daily.length === 0 ? (
              <p className="text-[13px] text-[#7d8aa3]">ยังไม่มีข้อมูลในช่วงนี้</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[#8b97ad]">
                      <th className="pb-2.5 pr-3 font-medium">วัน</th>
                      <th className="pb-2.5 pr-3 font-medium">สมัคร</th>
                      <th className="pb-2.5 pr-3 font-medium">Google</th>
                      <th className="pb-2.5 pr-3 font-medium">LINE</th>
                      <th className="pb-2.5 pr-3 font-medium">เบอร์</th>
                      <th className="pb-2.5 pr-3 font-medium">ชำระ</th>
                      <th className="pb-2.5 font-medium">รายได้</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.daily].reverse().map((d) => (
                      <tr
                        key={d.day}
                        className="border-b border-white/[0.04] last:border-0"
                      >
                        <td className="py-3 pr-3">
                          <div className="font-medium tabular-nums text-[#e8edf5]">
                            {formatDay(d.day)}
                          </div>
                          <div className="mt-1.5 h-1 max-w-[88px] overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-[#2dd4bf]"
                              style={{
                                width: `${Math.max(
                                  d.signups > 0 ? 6 : 0,
                                  (d.signups / maxDailySignups) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-3 pr-3 tabular-nums text-[#e8edf5]">
                          {d.signups}
                        </td>
                        <td className="py-3 pr-3 tabular-nums text-[#8b97ad]">
                          {d.signupsGoogle}
                        </td>
                        <td className="py-3 pr-3 tabular-nums text-[#8b97ad]">
                          {d.signupsLine}
                        </td>
                        <td className="py-3 pr-3 tabular-nums text-[#8b97ad]">
                          {d.signupsPhone}
                        </td>
                        <td className="py-3 pr-3 tabular-nums text-[#e8edf5]">
                          {d.payments}
                        </td>
                        <td className="py-3 tabular-nums font-medium text-[#e8d19a]">
                          {d.revenue > 0 ? formatBaht(d.revenue) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Funnel" subtitle="unique users · % จากขั้นก่อน">
              <ul className="space-y-3.5">
                {data.funnel.map((step) => (
                  <li key={step.name}>
                    <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2 text-[12px]">
                      <span className="font-medium text-[#e8edf5]">
                        {step.label}
                      </span>
                      <span className="tabular-nums text-[#8b97ad]">
                        {step.uniqueUsers} คน · {step.events} ครั้ง
                        {step.conversionPct != null
                          ? ` · ${step.conversionPct}%`
                          : ""}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-[#5b9fd4]"
                        style={{
                          width: `${Math.max(
                            step.uniqueUsers > 0 ? 3 : 0,
                            (step.uniqueUsers / maxFunnelUsers) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="การใช้ฟีเจอร์" subtitle="เปิด / สำเร็จ / ผู้ใช้">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[360px] border-collapse text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[#8b97ad]">
                      <th className="pb-2 pr-3 font-medium">ฟีเจอร์</th>
                      <th className="pb-2 pr-3 font-medium">เปิด</th>
                      <th className="pb-2 pr-3 font-medium">สำเร็จ</th>
                      <th className="pb-2 font-medium">ผู้ใช้</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.features.map((f) => (
                      <tr
                        key={f.id}
                        className="border-b border-white/[0.04] last:border-0"
                      >
                        <td className="py-2.5 pr-3">
                          <div className="font-medium text-[#e8edf5]">
                            {f.label}
                          </div>
                          <div className="mt-1 h-1 max-w-[120px] overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-[#8b7ec8]"
                              style={{
                                width: `${Math.max(
                                  f.opens > 0 ? 4 : 0,
                                  (f.opens / maxFeatureOpens) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 tabular-nums text-[#c5cdd9]">
                          {f.opens}
                        </td>
                        <td className="py-2.5 pr-3 tabular-nums text-[#c5cdd9]">
                          {f.completes}
                        </td>
                        <td className="py-2.5 tabular-nums text-[#c5cdd9]">
                          {f.uniqueUsers}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
}
