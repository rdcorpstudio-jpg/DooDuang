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

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-6 text-[#f7f4ec]">
      <header className="mb-6">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-[#d5b16f]/85">
          ADMIN
        </p>
        <h1 className="mt-1 text-[1.6rem] font-bold tracking-wide text-[#f7f4ec]">
          Product analytics
        </h1>
        <p className="mt-1 text-[13px] text-[#9aa3b2]">
          Funnel การแปลง + การใช้งานต่อฟีเจอร์
        </p>
      </header>

      <div className="mb-6 flex gap-2">
        {(["7d", "30d", "90d"] as RangeKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setRange(key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[12px] font-semibold outline-none transition",
              range === key
                ? "bg-[#d5b16f] text-[#101827]"
                : "text-[#e8d19a] shadow-[inset_0_0_0_1px_rgba(213,177,111,0.35)]"
            )}
          >
            {key === "7d" ? "7 วัน" : key === "30d" ? "30 วัน" : "90 วัน"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[14px] text-[#9aa3b2]">กำลังโหลด…</p>
      ) : error ? (
        <p className="text-[14px] text-rose-300">{error}</p>
      ) : data ? (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-[15px] font-semibold text-[#e8d19a]">
              Funnel
            </h2>
            <ul className="space-y-3">
              {data.funnel.map((step) => (
                <li key={step.name}>
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-[12px]">
                    <span className="font-medium text-[#f7f4ec]">
                      {step.label}
                    </span>
                    <span className="shrink-0 text-[#9aa3b2]">
                      {step.uniqueUsers} คน · {step.events} ครั้ง
                      {step.conversionPct != null
                        ? ` · ${step.conversionPct}%`
                        : ""}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-[#d5b16f]"
                      style={{
                        width: `${Math.max(
                          2,
                          (step.uniqueUsers / maxFunnelUsers) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[15px] font-semibold text-[#e8d19a]">
              ฟีเจอร์
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left text-[12px]">
                <thead>
                  <tr className="border-b border-white/10 text-[#9aa3b2]">
                    <th className="py-2 pr-3 font-medium">ฟีเจอร์</th>
                    <th className="py-2 pr-3 font-medium">เปิด</th>
                    <th className="py-2 pr-3 font-medium">สำเร็จ</th>
                    <th className="py-2 font-medium">ผู้ใช้</th>
                  </tr>
                </thead>
                <tbody>
                  {data.features.map((f) => (
                    <tr
                      key={f.id}
                      className="border-b border-white/5 align-middle"
                    >
                      <td className="py-2.5 pr-3">
                        <div className="font-medium text-[#f7f4ec]">
                          {f.label}
                        </div>
                        <div className="mt-1 h-1.5 max-w-[160px] overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-[#9AB8DC]"
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
          </section>

          <section>
            <h2 className="mb-3 text-[15px] font-semibold text-[#e8d19a]">
              รายวัน · สมัคร / ชำระ
            </h2>
            {data.daily.length === 0 ? (
              <p className="text-[13px] text-[#9aa3b2]">ยังไม่มีข้อมูลในช่วงนี้</p>
            ) : (
              <ul className="space-y-2 text-[12px]">
                {data.daily.map((d) => (
                  <li
                    key={d.day}
                    className="flex items-center justify-between gap-3 border-b border-white/5 py-2"
                  >
                    <span className="tabular-nums text-[#c5cdd9]">{d.day}</span>
                    <span className="text-[#9aa3b2]">
                      สมัคร {d.signups} · ชำระ {d.payments}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
