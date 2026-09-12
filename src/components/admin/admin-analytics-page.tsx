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

type DailyRow = {
  day: string;
  signups: number;
  payments: number;
};

type AnalyticsPayload = {
  ok: true;
  rangeDays: number;
  since: string;
  funnel: FunnelStep[];
  features: FeatureRow[];
  daily: DailyRow[];
};

type RangeKey = "7d" | "30d" | "90d";

function StatChip({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[#e2e5ea] bg-white px-4 py-3 shadow-[0_1px_0_rgba(16,24,40,0.03)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#6b7280]">
        {label}
      </p>
      <p className="mt-1 text-[1.55rem] font-semibold tabular-nums tracking-tight text-[#111827]">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[12px] text-[#6b7280]">{hint}</p>
      ) : null}
    </div>
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

  const signupStep = data?.funnel.find((s) => s.name === "signup");
  const payStep = data?.funnel.find((s) => s.name === "payment_succeeded");
  const openStep = data?.funnel.find((s) => s.name === "feature_open");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.65rem] font-semibold tracking-tight text-[#111827]">
            Product analytics
          </h1>
          <p className="mt-1 text-[13px] text-[#6b7280]">
            Funnel การแปลงและสถิติการใช้ฟีเจอร์ · ข้อมูลจาก Postgres
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-[#e2e5ea] bg-white p-1 shadow-[0_1px_0_rgba(16,24,40,0.03)]">
          {(["7d", "30d", "90d"] as RangeKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12px] font-semibold outline-none transition",
                range === key
                  ? "bg-[#111827] text-white"
                  : "text-[#4b5563] hover:bg-[#f3f4f6]"
              )}
            >
              {key === "7d" ? "7 วัน" : key === "30d" ? "30 วัน" : "90 วัน"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-[14px] text-[#6b7280]">กำลังโหลด…</p>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[14px] text-rose-700">
          {error}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatChip
              label="สมัครใหม่"
              value={signupStep?.uniqueUsers ?? 0}
              hint={`${signupStep?.events ?? 0} events`}
            />
            <StatChip
              label="เปิดฟีเจอร์"
              value={openStep?.events ?? 0}
              hint={`${openStep?.uniqueUsers ?? 0} ผู้ใช้`}
            />
            <StatChip
              label="ชำระสำเร็จ"
              value={payStep?.uniqueUsers ?? 0}
              hint={`${payStep?.events ?? 0} payments`}
            />
          </div>

          <section className="rounded-2xl border border-[#e2e5ea] bg-white p-4 shadow-[0_1px_0_rgba(16,24,40,0.03)] sm:p-5">
            <h2 className="text-[14px] font-semibold text-[#111827]">Funnel</h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              unique users ต่อขั้น · % จากขั้นก่อนหน้า
            </p>
            <ul className="mt-4 space-y-3.5">
              {data.funnel.map((step) => (
                <li key={step.name}>
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2 text-[12px]">
                    <span className="font-medium text-[#1f2937]">
                      {step.label}
                    </span>
                    <span className="tabular-nums text-[#6b7280]">
                      {step.uniqueUsers} คน · {step.events} ครั้ง
                      {step.conversionPct != null
                        ? ` · ${step.conversionPct}%`
                        : ""}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#eef0f3]">
                    <div
                      className="h-full rounded-full bg-[#0f766e]"
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
          </section>

          <section className="rounded-2xl border border-[#e2e5ea] bg-white p-4 shadow-[0_1px_0_rgba(16,24,40,0.03)] sm:p-5">
            <h2 className="text-[14px] font-semibold text-[#111827]">
              การใช้ฟีเจอร์
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left text-[12px]">
                <thead>
                  <tr className="border-b border-[#e5e7eb] text-[#6b7280]">
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
                      className="border-b border-[#f1f3f5] align-middle last:border-0"
                    >
                      <td className="py-3 pr-3">
                        <div className="font-medium text-[#111827]">
                          {f.label}
                        </div>
                        <div className="mt-1.5 h-1.5 max-w-[180px] overflow-hidden rounded-full bg-[#eef0f3]">
                          <div
                            className="h-full rounded-full bg-[#2563eb]"
                            style={{
                              width: `${Math.max(
                                f.opens > 0 ? 4 : 0,
                                (f.opens / maxFeatureOpens) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3 pr-3 tabular-nums text-[#374151]">
                        {f.opens}
                      </td>
                      <td className="py-3 pr-3 tabular-nums text-[#374151]">
                        {f.completes}
                      </td>
                      <td className="py-3 tabular-nums text-[#374151]">
                        {f.uniqueUsers}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e2e5ea] bg-white p-4 shadow-[0_1px_0_rgba(16,24,40,0.03)] sm:p-5">
            <h2 className="text-[14px] font-semibold text-[#111827]">
              รายวัน · สมัคร / ชำระ
            </h2>
            {data.daily.length === 0 ? (
              <p className="mt-3 text-[13px] text-[#6b7280]">
                ยังไม่มีข้อมูลในช่วงนี้
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-[#f1f3f5]">
                {data.daily.map((d) => (
                  <li
                    key={d.day}
                    className="flex items-center justify-between gap-3 py-2.5 text-[12px]"
                  >
                    <span className="tabular-nums font-medium text-[#1f2937]">
                      {d.day}
                    </span>
                    <span className="text-[#6b7280]">
                      สมัคร {d.signups} · ชำระ {d.payments}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
