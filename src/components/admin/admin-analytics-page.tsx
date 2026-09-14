"use client";

import { useCallback, useMemo, useState } from "react";
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

type PurchaseRow = {
  id: string;
  createdAt: string;
  amount: number;
  userId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  channel: string;
  channelLabel: string;
};

type AnalyticsPayload = {
  ok: true;
  rangeDays: number;
  range: string | null;
  from: string | null;
  to: string | null;
  since: string;
  until: string;
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
  purchases?: PurchaseRow[];
};

type RangeKey = "7d" | "30d" | "90d";
type PickMode = "preset" | "custom";
type Phase = "pick" | "dashboard";

type AnalyticsQuery =
  | { kind: "preset"; range: RangeKey }
  | { kind: "custom"; from: string; to: string };

function todayYmdBangkok() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

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

function formatDayShort(day: string) {
  const d = new Date(`${day}T12:00:00`);
  if (Number.isNaN(d.getTime())) return day;
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
  }).format(d);
}

function formatYmdThai(ymd: string) {
  const d = new Date(`${ymd}T12:00:00+07:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function formatDateTimeThai(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function queryToSearch(q: AnalyticsQuery) {
  if (q.kind === "preset") return `range=${q.range}`;
  return `from=${encodeURIComponent(q.from)}&to=${encodeURIComponent(q.to)}`;
}

function queryLabel(q: AnalyticsQuery) {
  if (q.kind === "preset") {
    return q.range === "7d"
      ? "7 วันล่าสุด"
      : q.range === "30d"
        ? "30 วันล่าสุด"
        : "90 วันล่าสุด";
  }
  if (q.from === q.to) return formatYmdThai(q.from);
  return `${formatYmdThai(q.from)} – ${formatYmdThai(q.to)}`;
}

const PRESETS: { key: RangeKey; title: string; hint: string }[] = [
  { key: "7d", title: "7 วัน", hint: "สัปดาห์ล่าสุด" },
  { key: "30d", title: "30 วัน", hint: "เดือนล่าสุด" },
  { key: "90d", title: "90 วัน", hint: "ไตรมาสล่าสุด" },
];

function SoftCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_12px_40px_rgba(26,29,33,0.06)] sm:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}

function TrendPill({
  value,
  positive,
}: {
  value: string;
  positive?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
        positive === false
          ? "bg-[#ffe8d6] text-[#c45d1a]"
          : "bg-[#d8fbe9] text-[#0f7a4a]"
      )}
    >
      {value}
    </span>
  );
}

function RevenueBars({ daily }: { daily: DailyRow[] }) {
  const rows = daily.length > 14 ? daily.slice(-14) : daily;
  const max = Math.max(1, ...rows.map((d) => d.revenue));
  const peakIdx = rows.reduce(
    (best, row, i) => (row.revenue > rows[best].revenue ? i : best),
    0
  );

  if (rows.length === 0) {
    return (
      <p className="flex h-44 items-center justify-center text-[13px] text-[#8b93a1]">
        ยังไม่มีรายได้ในช่วงนี้
      </p>
    );
  }

  return (
    <div className="mt-5 flex h-48 items-end gap-1.5 sm:gap-2.5">
      {rows.map((row, i) => {
        const h = Math.max(row.revenue > 0 ? 8 : 3, (row.revenue / max) * 100);
        const active = i === peakIdx && row.revenue > 0;
        return (
          <div
            key={row.day}
            className="group relative flex min-w-0 flex-1 flex-col items-center justify-end"
          >
            {row.revenue > 0 ? (
              <span className="pointer-events-none absolute -top-7 hidden rounded-full bg-[#1a1d21] px-2 py-0.5 text-[10px] font-medium text-white group-hover:block">
                {formatBaht(row.revenue)}
              </span>
            ) : null}
            <div
              className={cn(
                "w-full max-w-[36px] rounded-t-[12px] transition",
                active
                  ? "bg-[repeating-linear-gradient(-45deg,#1a1d21,#1a1d21_4px,#2a2f36_4px,#2a2f36_8px)]"
                  : "bg-[#b8f5d8]"
              )}
              style={{ height: `${h}%` }}
              title={`${formatDay(row.day)} · ${formatBaht(row.revenue)}`}
            />
            <span className="mt-2 truncate text-[10px] text-[#8b93a1]">
              {formatDayShort(row.day)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ConversionGauge({
  pct,
  payments,
  signups,
}: {
  pct: number;
  payments: number;
  signups: number;
}) {
  const clamped = Math.max(0, Math.min(100, pct));

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[120px] w-[220px]">
        <svg viewBox="0 0 220 120" className="h-full w-full">
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="#eef1f4"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="#7dffb3"
            strokeWidth="18"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${clamped} 100`}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-1 text-center">
          <p className="text-[2rem] font-bold tabular-nums tracking-tight text-[#1a1d21]">
            {clamped}
            <span className="text-[1rem]">%</span>
          </p>
          <p className="text-[12px] text-[#8b93a1]">สมัคร → ชำระ</p>
        </div>
      </div>
      <div className="mt-4 grid w-full grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#f4f6f8] px-3 py-2.5">
          <p className="text-[11px] text-[#8b93a1]">ชำระสำเร็จ</p>
          <p className="mt-0.5 text-[18px] font-semibold tabular-nums">
            {payments}
          </p>
        </div>
        <div className="rounded-2xl bg-[#f4f6f8] px-3 py-2.5">
          <p className="text-[11px] text-[#8b93a1]">สมัครใหม่</p>
          <p className="mt-0.5 text-[18px] font-semibold tabular-nums">
            {signups}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ payments }: { payments: number }) {
  if (payments > 0) {
    return (
      <span className="rounded-full bg-[#d8fbe9] px-2.5 py-1 text-[11px] font-semibold text-[#0f7a4a]">
        มีชำระ
      </span>
    );
  }
  if (payments === 0) {
    return (
      <span className="rounded-full bg-[#eef1f4] px-2.5 py-1 text-[11px] font-semibold text-[#5c6573]">
        ไม่มีชำระ
      </span>
    );
  }
  return null;
}

export function AdminAnalyticsPage() {
  const today = useMemo(() => todayYmdBangkok(), []);
  const [phase, setPhase] = useState<Phase>("pick");
  const [pickMode, setPickMode] = useState<PickMode>("preset");
  const [preset, setPreset] = useState<RangeKey>("7d");
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [activeQuery, setActiveQuery] = useState<AnalyticsQuery | null>(null);
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (query: AnalyticsQuery) => {
    setLoading(true);
    setError(null);
    setActiveQuery(query);
    setPhase("dashboard");
    try {
      const res = await fetch(`/api/admin/analytics?${queryToSearch(query)}`, {
        cache: "no-store",
      });
      if (res.status === 403) {
        setError("ไม่มีสิทธิ์ดูหน้านี้ (ตั้ง ADMIN_EMAILS)");
        setData(null);
        return;
      }
      const json = (await res.json().catch(() => ({}))) as
        | AnalyticsPayload
        | { error?: string };
      if (!res.ok) {
        setError(
          "error" in json && json.error ? json.error : "โหลดข้อมูลไม่สำเร็จ"
        );
        setData(null);
        return;
      }
      setData(json as AnalyticsPayload);
    } catch {
      setError("โหลดข้อมูลไม่สำเร็จ");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  function backToPick() {
    setPhase("pick");
    setData(null);
    setError(null);
    setLoading(false);
  }

  function submitPick() {
    if (pickMode === "preset") {
      void load({ kind: "preset", range: preset });
      return;
    }
    if (!from || !to) {
      setError("กรุณาเลือกวันเริ่มและวันสิ้นสุด");
      return;
    }
    if (to < from) {
      setError("วันสิ้นสุดต้องไม่ก่อนวันเริ่ม");
      return;
    }
    void load({ kind: "custom", from, to });
  }

  const conversionPct = data
    ? data.summary.signups > 0
      ? Math.round((data.summary.payments / data.summary.signups) * 100)
      : data.summary.payments > 0
        ? 100
        : 0
    : 0;

  const topFeatures = (data?.features || [])
    .slice()
    .sort((a, b) => b.opens - a.opens)
    .slice(0, 2);

  const topChannels = data?.revenueByAccountChannel?.slice(0, 4) || [];
  const dailyRecent = [...(data?.daily || [])].reverse().slice(0, 8);

  const avgPerPayment =
    data && data.summary.payments > 0
      ? Math.round(data.summary.revenue / data.summary.payments)
      : 0;

  if (phase === "pick") {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-lg flex-col justify-center">
        <SoftCard>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8b93a1]">
            เลือกช่วงก่อน
          </p>
          <h1 className="mt-2 text-[1.55rem] font-semibold tracking-tight text-[#1a1d21]">
            ดึงรายงานเมื่อพร้อม
          </h1>
          <p className="mt-1 text-[13px] text-[#8b93a1]">
            ไม่โหลดข้อมูลอัตโนมัติ — เลือกวันหรือช่วงแล้วกดดูรายงาน
          </p>

          <div className="mt-5 inline-flex rounded-2xl bg-[#f4f6f8] p-1">
            {(
              [
                { id: "preset" as const, label: "ช่วงสำเร็จรูป" },
                { id: "custom" as const, label: "เลือกวันเอง" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setPickMode(tab.id);
                  setError(null);
                }}
                className={cn(
                  "rounded-xl px-3.5 py-1.5 text-[12px] font-semibold outline-none transition",
                  pickMode === tab.id
                    ? "bg-[#1a1d21] text-white"
                    : "text-[#5c6573] hover:text-[#1a1d21]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {pickMode === "preset" ? (
            <div className="mt-5 grid gap-2.5">
              {PRESETS.map((item) => {
                const selected = preset === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPreset(item.key)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-4 py-3.5 text-left outline-none transition",
                      selected
                        ? "bg-[#eafff4] ring-1 ring-[#7dffb3]"
                        : "bg-[#f4f6f8] hover:bg-[#eef1f4]"
                    )}
                  >
                    <span>
                      <span className="block text-[15px] font-semibold">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-[#8b93a1]">
                        {item.hint}
                      </span>
                    </span>
                    <span
                      className="h-[18px] w-[18px] rounded-full"
                      style={{
                        boxShadow: selected
                          ? "inset 0 0 0 5px #1a1d21"
                          : "inset 0 0 0 1.5px #c5ccd6",
                      }}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <p className="text-[12px] leading-relaxed text-[#8b93a1]">
                วันเดียว = เริ่มกับสิ้นสุดวันเดียวกัน · เวลา Asia/Bangkok
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8b93a1]">
                    วันเริ่ม
                  </span>
                  <input
                    type="date"
                    value={from}
                    max={to || today}
                    onChange={(e) => setFrom(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-[#e5e8ee] bg-[#f4f6f8] px-3 py-2.5 text-[14px] outline-none focus:border-[#7dffb3] focus:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8b93a1]">
                    วันสิ้นสุด
                  </span>
                  <input
                    type="date"
                    value={to}
                    min={from}
                    max={today}
                    onChange={(e) => setTo(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-[#e5e8ee] bg-[#f4f6f8] px-3 py-2.5 text-[14px] outline-none focus:border-[#7dffb3] focus:bg-white"
                  />
                </label>
              </div>
            </div>
          )}

          {error ? (
            <p className="mt-4 text-[13px] text-[#c45d1a]">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={submitPick}
            className="mt-6 w-full rounded-2xl bg-[#1a1d21] px-4 py-3.5 text-[14px] font-semibold text-white outline-none transition hover:bg-black active:scale-[0.99]"
          >
            ดูรายงาน
          </button>
        </SoftCard>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] text-[#8b93a1]">ช่วงที่กำลังดู</p>
          <p className="text-[16px] font-semibold tracking-tight">
            {activeQuery ? queryLabel(activeQuery) : "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={backToPick}
          className="rounded-2xl bg-[#1a1d21] px-4 py-2.5 text-[12px] font-semibold text-white outline-none transition hover:bg-black"
        >
          เปลี่ยนช่วง
        </button>
      </div>

      {loading ? (
        <SoftCard>
          <p className="text-[14px] text-[#8b93a1]">กำลังโหลดรายงาน…</p>
        </SoftCard>
      ) : error ? (
        <SoftCard>
          <p className="text-[14px] text-[#c45d1a]">{error}</p>
          <button
            type="button"
            onClick={backToPick}
            className="mt-3 text-[13px] font-medium text-[#5c6573] underline-offset-2 hover:underline"
          >
            กลับไปเลือกช่วงใหม่
          </button>
        </SoftCard>
      ) : data ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
            <SoftCard>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] text-[#8b93a1]">รายได้รวม</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-[2rem] font-bold tabular-nums tracking-tight sm:text-[2.25rem]">
                      {formatBaht(data.summary.revenue)}
                    </p>
                    <TrendPill
                      value={`${data.summary.payments} รายการ`}
                      positive
                    />
                  </div>
                  <p className="mt-1 text-[12px] text-[#8b93a1]">
                    เฉลี่ย {formatBaht(avgPerPayment)} / ครั้งชำระ · เปิดฟีเจอร์{" "}
                    {data.summary.featureOpens} ครั้ง
                  </p>
                </div>
                <span className="rounded-full bg-[#f4f6f8] px-3 py-1.5 text-[12px] font-medium text-[#5c6573]">
                  {data.rangeDays} วัน
                </span>
              </div>
              <RevenueBars daily={data.daily} />
            </SoftCard>

            <SoftCard>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[15px] font-semibold">Conversion</p>
                  <p className="text-[12px] text-[#8b93a1]">
                    สมัครใหม่ที่กลายเป็นชำระ
                  </p>
                </div>
              </div>
              <ConversionGauge
                pct={conversionPct}
                payments={data.summary.payments}
                signups={data.summary.signups}
              />
              <div className="mt-4 rounded-2xl bg-[#1a1d21] px-3.5 py-3 text-[12px] text-[#cfd5dd]">
                {data.summary.payments > 0
                  ? `ช่วงนี้มีชำระ ${data.summary.payments} รายการ · รายได้ ${formatBaht(data.summary.revenue)}`
                  : "ช่วงนี้ยังไม่มีการชำระสำเร็จ"}
              </div>
            </SoftCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
            <SoftCard className="overflow-hidden !p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef1f4] px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[15px] font-semibold">รายวัน</p>
                  <p className="text-[12px] text-[#8b93a1]">
                    สมัคร · ชำระ · รายได้ล่าสุด
                  </p>
                </div>
                <span className="rounded-full bg-[#f4f6f8] px-3 py-1.5 text-[11px] font-medium text-[#5c6573]">
                  {dailyRecent.length} แถว
                </span>
              </div>
              {dailyRecent.length === 0 ? (
                <p className="px-5 py-8 text-[13px] text-[#8b93a1] sm:px-6">
                  ยังไม่มีข้อมูลรายวัน
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-[#eef1f4] text-[#8b93a1]">
                        <th className="px-5 py-3 font-medium sm:px-6">วัน</th>
                        <th className="px-3 py-3 font-medium">สมัคร</th>
                        <th className="px-3 py-3 font-medium">Google</th>
                        <th className="px-3 py-3 font-medium">LINE</th>
                        <th className="px-3 py-3 font-medium">ชำระ</th>
                        <th className="px-3 py-3 font-medium">รายได้</th>
                        <th className="px-5 py-3 font-medium sm:px-6">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyRecent.map((row) => (
                        <tr
                          key={row.day}
                          className="border-b border-[#f4f6f8] last:border-0"
                        >
                          <td className="px-5 py-3.5 font-medium text-[#1a1d21] sm:px-6">
                            {formatDay(row.day)}
                          </td>
                          <td className="px-3 py-3.5 tabular-nums text-[#5c6573]">
                            {row.signups}
                          </td>
                          <td className="px-3 py-3.5 tabular-nums text-[#5c6573]">
                            {row.signupsGoogle}
                          </td>
                          <td className="px-3 py-3.5 tabular-nums text-[#5c6573]">
                            {row.signupsLine}
                          </td>
                          <td className="px-3 py-3.5 tabular-nums text-[#5c6573]">
                            {row.payments}
                          </td>
                          <td className="px-3 py-3.5 font-medium tabular-nums text-[#1a1d21]">
                            {formatBaht(row.revenue)}
                          </td>
                          <td className="px-5 py-3.5 sm:px-6">
                            <StatusPill payments={row.payments} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SoftCard>

            <div className="space-y-4">
              <SoftCard>
                <p className="text-[15px] font-semibold">ช่องทางรายได้</p>
                <p className="mt-0.5 text-[12px] text-[#8b93a1]">
                  ตามช่องทางบัญชีที่ชำระ
                </p>
                <ul className="mt-4 space-y-3">
                  {topChannels.length === 0 ? (
                    <li className="text-[13px] text-[#8b93a1]">ยังไม่มีข้อมูล</li>
                  ) : (
                    topChannels.map((ch, i) => {
                      const share =
                        data.summary.revenue > 0
                          ? Math.round((ch.revenue / data.summary.revenue) * 100)
                          : 0;
                      return (
                        <li
                          key={ch.id}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                                i === 0
                                  ? "bg-[#1a1d21] text-[#9ff5c8]"
                                  : "bg-[#eafff4] text-[#0f7a4a]"
                              )}
                            >
                              {ch.label.slice(0, 1)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-semibold">
                                {ch.label}
                              </p>
                              <p className="text-[11px] text-[#8b93a1]">
                                {ch.count} รายการ
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[13px] font-semibold tabular-nums">
                              {formatBaht(ch.revenue)}
                            </p>
                            <TrendPill value={`${share}%`} positive />
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              </SoftCard>

              <SoftCard>
                <p className="text-[15px] font-semibold">ฟีเจอร์ยอดนิยม</p>
                <p className="mt-0.5 text-[12px] text-[#8b93a1]">
                  ตามจำนวนครั้งที่เปิด
                </p>
                <div className="mt-4 grid gap-3">
                  {topFeatures.length === 0 ? (
                    <p className="text-[13px] text-[#8b93a1]">ยังไม่มีข้อมูล</p>
                  ) : (
                    topFeatures.map((f, i) => (
                      <div
                        key={f.id}
                        className={cn(
                          "rounded-[22px] px-4 py-3.5",
                          i === 0
                            ? "bg-[#1a1d21] text-white"
                            : "bg-[#f4f6f8] text-[#1a1d21]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[14px] font-semibold leading-snug">
                            {f.label}
                          </p>
                          <TrendPill
                            value={`${f.opens} เปิด`}
                            positive={i === 0 ? true : undefined}
                          />
                        </div>
                        <p
                          className={cn(
                            "mt-2 text-[12px]",
                            i === 0 ? "text-[#aeb6c2]" : "text-[#8b93a1]"
                          )}
                        >
                          สำเร็จ {f.completes} · ผู้ใช้ {f.uniqueUsers}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </SoftCard>
            </div>
          </div>

          <Panel
            title="คนที่ชำระ"
            subtitle={`ชื่อ · อีเมล/เบอร์ · ช่องทาง · ล่าสุดก่อน (สูงสุด 200)`}
          >
            {(data.purchases?.length ?? 0) === 0 ? (
              <p className="text-[13px] text-[#7d8aa3]">ยังไม่มีรายการชำระในช่วงนี้</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[#8b97ad]">
                      <th className="pb-2 pr-3 font-medium">เวลา</th>
                      <th className="pb-2 pr-3 font-medium">ชื่อ</th>
                      <th className="pb-2 pr-3 font-medium">ติดต่อ</th>
                      <th className="pb-2 pr-3 font-medium">ช่องทาง</th>
                      <th className="pb-2 font-medium">ยอด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.purchases ?? []).map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-white/[0.04] last:border-0"
                      >
                        <td className="py-2.5 pr-3 whitespace-nowrap text-[#c5cdd9]">
                          {formatDateTimeThai(row.createdAt)}
                        </td>
                        <td className="py-2.5 pr-3 text-[#e8edf5]">
                          {row.name || "—"}
                        </td>
                        <td className="py-2.5 pr-3 text-[#c5cdd9]">
                          {row.email || row.phone || "—"}
                        </td>
                        <td className="py-2.5 pr-3 text-[#c5cdd9]">
                          {row.channelLabel}
                        </td>
                        <td className="py-2.5 tabular-nums text-[#e8edf5]">
                          {formatBaht(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <SoftCard>
              <p className="text-[15px] font-semibold">สมัครตามช่องทาง</p>
              <ul className="mt-4 space-y-3">
                {data.signupsByChannel.length === 0 ? (
                  <li className="text-[13px] text-[#8b93a1]">ยังไม่มีข้อมูล</li>
                ) : (
                  data.signupsByChannel.map((ch) => {
                    const max = Math.max(
                      1,
                      ...data.signupsByChannel.map((x) => x.count)
                    );
                    return (
                      <li key={ch.id}>
                        <div className="mb-1.5 flex justify-between text-[12px]">
                          <span className="font-medium">{ch.label}</span>
                          <span className="tabular-nums text-[#8b93a1]">
                            {ch.count} คน
                          </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-[#eef1f4]">
                          <div
                            className="h-full rounded-full bg-[#7dffb3]"
                            style={{
                              width: `${Math.max(
                                ch.count > 0 ? 6 : 0,
                                (ch.count / max) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </SoftCard>

            <SoftCard>
              <p className="text-[15px] font-semibold">Funnel</p>
              <ul className="mt-4 space-y-3">
                {data.funnel.map((step) => {
                  const max = Math.max(
                    1,
                    ...data.funnel.map((s) => s.uniqueUsers)
                  );
                  return (
                    <li key={step.name}>
                      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2 text-[12px]">
                        <span className="font-medium">{step.label}</span>
                        <span className="tabular-nums text-[#8b93a1]">
                          {step.uniqueUsers} คน
                          {step.conversionPct != null
                            ? ` · ${step.conversionPct}%`
                            : ""}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-[#eef1f4]">
                        <div
                          className="h-full rounded-full bg-[#1a1d21]"
                          style={{
                            width: `${Math.max(
                              step.uniqueUsers > 0 ? 4 : 0,
                              (step.uniqueUsers / max) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </SoftCard>
          </div>

          <SoftCard>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold">วิธีชำระ (Stripe)</p>
                <p className="text-[12px] text-[#8b93a1]">
                  จาก payment_succeeded — รายการเก่าอาจยังไม่ระบุวิธี
                </p>
              </div>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.revenueByPaymentMethod.length === 0 ? (
                <li className="text-[13px] text-[#8b93a1]">ยังไม่มีข้อมูล</li>
              ) : (
                data.revenueByPaymentMethod.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-2xl bg-[#f4f6f8] px-4 py-3.5"
                  >
                    <p className="text-[13px] font-semibold">{m.label}</p>
                    <p className="mt-1 text-[18px] font-bold tabular-nums">
                      {formatBaht(m.revenue)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#8b93a1]">
                      {m.count} รายการ
                    </p>
                  </li>
                ))
              )}
            </ul>
          </SoftCard>
        </>
      ) : null}
    </div>
  );
}
