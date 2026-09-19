"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { BaziResultView } from "@/components/fortune/bazi/bazi-result-view";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { buildBaziChart } from "@/lib/fortune/bazi";
import type { BaziInput } from "@/lib/fortune/bazi";
import {
  requirePremiumFromServer,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";
import { profileToBaziInput } from "@/lib/fortune/profile-reading";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { MAE_GLASS } from "@/lib/mae-glass";
import { cn } from "@/lib/utils";

const GOLD = "#e8d19a";
const TEXT_MUTED = "rgba(186, 204, 230, 0.78)";
const GOLD_BTN =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";
const GLASS = MAE_GLASS;

function GateShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-y-auto text-white",
        className
      )}
    >
      <MaePageBackground />
      <div className="relative z-[1] mx-auto flex w-full max-w-[430px] flex-1 flex-col px-5 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-5 sm:px-6">
        <header className="flex items-center justify-between gap-3">
          <MaeBrandLink />
        </header>
        {children}
      </div>
    </div>
  );
}

function GlassCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="mx-auto mt-14 w-full max-w-[320px] rounded-[22px] px-4 py-7 text-center"
      style={{
        background: GLASS.bg,
        border: GLASS.border,
        boxShadow: `${GLASS.shadow}, ${GLASS.highlight}`,
        backdropFilter: GLASS.blur,
        WebkitBackdropFilter: GLASS.blur,
      }}
    >
      {children}
    </div>
  );
}

/** ปาจื้อ — พรีเมียม · ใช้ข้อมูลโปรไฟล์ที่มีอยู่แล้ว */
export function FortuneBazi({ className }: { className?: string }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [missing, setMissing] = useState(false);
  const [input, setInput] = useState<BaziInput | null>(null);
  const [nickname, setNickname] = useState<string | undefined>();

  function handlePaid() {
    setPremiumUnlocked();
    setUnlocked(true);
    setPayOpen(false);
  }

  useStripePaymentReturn(handlePaid);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const profile = readFortuneProfile();
      const access = await requirePremiumFromServer(
        profile
          ? { birthDate: profile.birthDate, nickname: profile.nickname }
          : null
      );
      if (cancelled) return;
      setUnlocked(access.ok);
      const baziInput = profile ? profileToBaziInput(profile) : null;
      if (baziInput) {
        setInput(baziInput);
        setNickname(profile?.nickname);
        setMissing(false);
      } else {
        setMissing(true);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { chart, computeError } = useMemo(() => {
    if (!input || !unlocked) {
      return { chart: null, computeError: null as string | null };
    }
    try {
      return { chart: buildBaziChart(input), computeError: null };
    } catch (err) {
      return {
        chart: null,
        computeError:
          err instanceof Error ? err.message : "คำนวณปาจื้อไม่สำเร็จ",
      };
    }
  }, [input, unlocked]);

  if (!ready) {
    return (
      <div
        className={cn(
          "relative flex h-full items-center justify-center",
          className
        )}
      >
        <MaePageBackground />
        <Loader2
          className="relative z-[1] h-5 w-5 animate-spin"
          style={{ color: GOLD }}
          strokeWidth={2.2}
        />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <GateShell className={className}>
        <GlassCard>
          <span
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background: "rgba(213,177,111,0.14)",
              boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.45)",
            }}
          >
            <Lock className="h-5 w-5" style={{ color: GOLD }} strokeWidth={2} />
          </span>
          <p
            className="mt-3 text-[12px] font-semibold tracking-[0.2em]"
            style={{ color: GOLD }}
          >
            PREMIUM
          </p>
          <h1 className="mae-gold-text mt-1.5 text-[1.45rem] font-bold">
            ปาจื้อ 八字
          </h1>
          <p
            className="mt-2 text-[17.5px] leading-[1.45]"
            style={{ color: TEXT_MUTED }}
          >
            ดูสี่เสา ธาตุ สิบเทพ วัยจร และปีจรจากวันเกิดของคุณ
            — ปลดล็อกพรีเมียมเพื่ออ่านฉบับเต็ม
          </p>
          <button
            type="button"
            onClick={() => setPayOpen(true)}
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full text-[17.5px] font-bold outline-none transition active:scale-[0.99]"
            style={{
              color: "#1a1408",
              background: GOLD_BTN,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
            }}
          >
            ปลดล็อก · {FORTUNE_UNLOCK_PRICE} บาท
          </button>
        </GlassCard>

        <FortunePaymentSheet
          open={payOpen}
          onClose={() => setPayOpen(false)}
          onPaid={handlePaid}
          returnPath="/reading/bazi"
        />
      </GateShell>
    );
  }

  if (missing) {
    return (
      <GateShell className={className}>
        <GlassCard>
          <h1 className="mae-gold-text text-[1.45rem] font-bold">ปาจื้อ 八字</h1>
          <p
            className="mt-2 text-[17.5px] leading-[1.45]"
            style={{ color: TEXT_MUTED }}
          >
            ยังไม่มีข้อมูลวันเกิดในโปรไฟล์
            <br />
            กรอกครั้งเดียวตอนดูดวงพรีเมียม แล้วกลับมาที่นี่ได้เลย
          </p>
          <button
            type="button"
            onClick={() => router.push("/reading")}
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full text-[17.5px] font-bold outline-none transition active:scale-[0.99]"
            style={{
              color: "#1a1408",
              background: GOLD_BTN,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
            }}
          >
            ไปกรอกข้อมูลดูดวง
          </button>
        </GlassCard>
      </GateShell>
    );
  }

  if (computeError || !chart) {
    return (
      <GateShell className={className}>
        <GlassCard>
          <p className="text-[17.5px] font-semibold text-[#f0a8b0]">
            คำนวณปาจื้อไม่สำเร็จ
          </p>
          <p
            className="mt-2 text-[17.5px] leading-[1.45]"
            style={{ color: TEXT_MUTED }}
          >
            {computeError || "ข้อมูลวันเกิดไม่ถูกต้อง"}
          </p>
        </GlassCard>
      </GateShell>
    );
  }

  return (
    <BaziResultView
      chart={chart}
      nickname={nickname}
      className={className}
      onBack={() => router.back()}
    />
  );
}
