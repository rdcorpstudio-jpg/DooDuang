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
    return q.range === "7d" ? "7 วันล่าสุด" : q.range === "30d" ? "30 วันล่าสุด" : "90 วันล่าสุด";
  }
  if (q.from === q.to) return formatYmdThai(q.from);
  return `${formatYmdThai(q.from)} – ${formatYmdThai(q.to)}`;
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

const PRESETS: { key: RangeKey; title: string; hint: string }[] = [
  { key: "7d", title: "7 วัน", hint: "สัปดาห์ล่าสุด" },
  { key: "30d", title: "30 วัน", hint: "เดือนล่าสุด" },
  { key: "90d", title: "90 วัน", hint: "ไตรมาสล่าสุด" },
];

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
          "error" in json && json.error
            ? json.error
            : "โหลดข้อมูลไม่สำเร็จ"
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

  const maxFunnelUsers = Math.max(
    1,
    ...(data?.funnel.map((s) => s.uniqueUsers) || [1])
  );
  const maxFeatureOpens = Math.max(
    1,
    ...(data?.features.map((f) => f.opens) || [1])
  );

  if (phase === "pick") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center">
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-[1.7rem] font-semibold tracking-tight text-[#f3f6fb]">
            Analytics
          </h1>
          <p className="mt-1 text-[13px] text-[#8b97ad]">
            เลือกวันหรือช่วงก่อน — จะดึงข้อมูลเมื่อกดดูรายงานเท่านั้น
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#121821] p-5 sm:p-6">
          <div className="inline-flex rounded-xl border border-white/[0.08] bg-[#0b0f14] p-1">
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
                  "rounded-lg px-3.5 py-1.5 text-[12px] font-semibold outline-none transition",
                  pickMode === tab.id
                    ? "bg-[#e8edf5] text-[#0b0f14]"
                    : "text-[#8b97ad] hover:bg-white/[0.04] hover:text-[#e8edf5]"
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
                      "flex items-center justify-between rounded-xl px-4 py-3.5 text-left outline-none transition",
                      selected
                        ? "bg-white/[0.08]"
                        : "bg-white/[0.03] hover:bg-white/[0.05]"
                    )}
                    style={{
                      boxShadow: selected
                        ? "inset 0 0 0 1.5px rgba(45,212,191,0.55)"
                        : "inset 0 0 0 1px rgba(255,255,255,0.06)",
                    }}
                  >
                    <span>
                      <span className="block text-[15px] font-semibold text-[#f3f6fb]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-[#8b97ad]">
                        {item.hint}
                      </span>
                    </span>
                    <span
                      className="h-[18px] w-[18px] rounded-full"
                      style={{
                        boxShadow: selected
                          ? "inset 0 0 0 5px #2dd4bf"
                          : "inset 0 0 0 1.5px rgba(139,151,173,0.55)",
                      }}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <p className="text-[12px] leading-relaxed text-[#8b97ad]">
                เลือกวันเดียว (เริ่ม = สิ้นสุด) หรือช่วงวันที่ · เวลาตาม Asia/Bangkok
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#8b97ad]">
                    วันเริ่ม
                  </span>
                  <input
                    type="date"
                    value={from}
                    max={to || today}
                    onChange={(e) => setFrom(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#0b0f14] px-3 py-2.5 text-[14px] text-[#f3f6fb] outline-none focus:border-[#2dd4bf]/50"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#8b97ad]">
                    วันสิ้นสุด
                  </span>
                  <input
                    type="date"
                    value={to}
                    min={from}
                    max={today}
                    onChange={(e) => setTo(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#0b0f14] px-3 py-2.5 text-[14px] text-[#f3f6fb] outline-none focus:border-[#2dd4bf]/50"
                  />
                </label>
              </div>
            </div>
          )}

          {error ? (
            <p className="mt-4 text-[13px] text-rose-300">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={submitPick}
            className="mt-6 w-full rounded-xl bg-[#e8edf5] px-4 py-3 text-[14px] font-semibold text-[#0b0f14] outline-none transition hover:bg-white active:scale-[0.99]"
          >
            ดูรายงาน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.7rem] font-semibold tracking-tight text-[#f3f6fb]">
            Dashboard
          </h1>
          <p className="mt-1 text-[13px] text-[#8b97ad]">
            {activeQuery ? queryLabel(activeQuery) : "—"}
            <span className="text-[#8b97ad]/70"> · สมัคร · ชำระเงิน · ฟีเจอร์</span>
          </p>
        </div>
        <button
          type="button"
          onClick={backToPick}
          className="inline-flex self-start rounded-xl border border-white/[0.1] bg-[#121821] px-3.5 py-2 text-[12px] font-semibold text-[#e8edf5] outline-none transition hover:bg-white/[0.04]"
        >
          เปลี่ยนช่วง
        </button>
      </div>

      {loading ? (
        <p className="text-[14px] text-[#8b97ad]">กำลังโหลด…</p>
      ) : error ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[14px] text-rose-200">
            {error}
          </div>
          <button
            type="button"
            onClick={backToPick}
            className="text-[13px] font-medium text-[#8b97ad] underline-offset-2 hover:text-[#e8edf5] hover:underline"
          >
            กลับไปเลือกช่วงใหม่
          </button>
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
              subtitle="จัดกลุ่มจากช่องทาง login ของบัญชี"
            >
              <ChannelBars
                items={data.revenueByAccountChannel}
                mode="revenue"
              />
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel
              title="ช่องทางชำระ (Stripe)"
              subtitle="จาก payment_succeeded · อาจไม่ครบทุกรายการเก่า"
            >
              <ChannelBars
                items={data.revenueByPaymentMethod}
                mode="revenue"
              />
            </Panel>

            <Panel title="รายวัน" subtitle="สมัคร · ชำระ · รายได้">
              {data.daily.length === 0 ? (
                <p className="text-[13px] text-[#7d8aa3]">ยังไม่มีข้อมูล</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-[#8b97ad]">
                        <th className="pb-2 pr-3 font-medium">วัน</th>
                        <th className="pb-2 pr-3 font-medium">สมัคร</th>
                        <th className="pb-2 pr-3 font-medium">Google</th>
                        <th className="pb-2 pr-3 font-medium">LINE</th>
                        <th className="pb-2 pr-3 font-medium">เบอร์</th>
                        <th className="pb-2 pr-3 font-medium">ชำระ</th>
                        <th className="pb-2 font-medium">รายได้</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...data.daily].reverse().map((row) => (
                        <tr
                          key={row.day}
                          className="border-b border-white/[0.04] last:border-0"
                        >
                          <td className="py-2 pr-3 text-[#e8edf5]">
                            {formatDay(row.day)}
                          </td>
                          <td className="py-2 pr-3 tabular-nums text-[#c5cdd9]">
                            {row.signups}
                          </td>
                          <td className="py-2 pr-3 tabular-nums text-[#c5cdd9]">
                            {row.signupsGoogle}
                          </td>
                          <td className="py-2 pr-3 tabular-nums text-[#c5cdd9]">
                            {row.signupsLine}
                          </td>
                          <td className="py-2 pr-3 tabular-nums text-[#c5cdd9]">
                            {row.signupsPhone}
                          </td>
                          <td className="py-2 pr-3 tabular-nums text-[#c5cdd9]">
                            {row.payments}
                          </td>
                          <td className="py-2 tabular-nums text-[#c5cdd9]">
                            {formatBaht(row.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
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
