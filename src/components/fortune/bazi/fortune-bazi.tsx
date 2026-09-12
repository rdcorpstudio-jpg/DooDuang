"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { BaziResultView } from "@/components/fortune/bazi/bazi-result-view";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import { PageBackButton } from "@/components/ui/page-back-button";
import { buildBaziChart } from "@/lib/fortune/bazi";
import type { BaziInput } from "@/lib/fortune/bazi";
import {
  requirePremiumFromServer,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

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
      if (
        profile?.birthDate &&
        profile.gender &&
        /^\d{4}-\d{2}-\d{2}$/.test(profile.birthDate)
      ) {
        const gender =
          profile.gender === "female" || profile.gender === "male"
            ? profile.gender
            : "other";
        setInput({
          birthDate: profile.birthDate,
          birthTime: profile.birthTime?.trim() || undefined,
          gender,
          timezone: "Asia/Bangkok",
          birthPlace: profile.birthPlace,
        });
        setNickname(profile.nickname);
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
          "flex h-full items-center justify-center text-[#d5b16f]/80",
          className
        )}
      >
        <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.2} />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div
        className={cn(
          "relative flex h-full flex-col overflow-y-auto px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-3",
          className
        )}
      >
        <PageBackButton onClick={() => router.back()} />

        <div className="mae-aspect-card mx-auto mt-14 w-full max-w-[320px] px-4 py-7 text-center">
          <span
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background: "rgba(213,177,111,0.12)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.4)",
            }}
          >
            <Lock className="h-5 w-5 text-[#d5b16f]" strokeWidth={2} />
          </span>
          <p className="mt-3 text-[11px] font-semibold tracking-[0.2em] text-[#d5b16f]/85">
            PREMIUM
          </p>
          <h1 className="mae-gold-text mt-1.5 text-[1.25rem] font-bold">
            ปาจื้อ 八字
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[#c5cdd9]/80">
            ดูสี่เสา ธาตุ สิบเทพ วัยจร และปีจรจากวันเกิดของคุณ
            — ปลดล็อกพรีเมียมเพื่ออ่านฉบับเต็ม
          </p>
          <button
            type="button"
            onClick={() => setPayOpen(true)}
            className="mae-gold-cta mt-5 inline-flex h-11 w-full items-center justify-center rounded-full text-[14px] font-bold outline-none transition active:scale-[0.99]"
          >
            ปลดล็อก · {FORTUNE_UNLOCK_PRICE} บาท
          </button>
        </div>

        <FortunePaymentSheet
          open={payOpen}
          onClose={() => setPayOpen(false)}
          onPaid={handlePaid}
          returnPath="/reading/bazi"
        />
      </div>
    );
  }

  if (missing) {
    return (
      <div
        className={cn(
          "relative flex h-full flex-col overflow-y-auto px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-3",
          className
        )}
      >
        <PageBackButton onClick={() => router.back()} />

        <div className="mae-aspect-card mx-auto mt-16 w-full max-w-[320px] px-4 py-6 text-center">
          <p className="mae-gold-text text-[1.15rem] font-bold">ปาจื้อ 八字</p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#c5cdd9]/80">
            ยังไม่มีข้อมูลวันเกิดในโปรไฟล์
            <br />
            กรอกครั้งเดียวตอนดูดวงพรีเมียม แล้วกลับมาที่นี่ได้เลย
          </p>
          <button
            type="button"
            onClick={() => router.push("/reading")}
            className="mae-gold-cta mt-5 inline-flex h-11 w-full items-center justify-center rounded-full text-[14px] font-bold outline-none transition active:scale-[0.99]"
          >
            ไปกรอกข้อมูลดูดวง
          </button>
        </div>
      </div>
    );
  }

  if (computeError || !chart) {
    return (
      <div
        className={cn(
          "relative flex h-full flex-col overflow-y-auto px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-3",
          className
        )}
      >
        <PageBackButton onClick={() => router.back()} />
        <div className="mae-aspect-card mx-auto mt-16 w-full max-w-[320px] px-4 py-6 text-center">
          <p className="text-[14px] font-semibold text-[#ff8fa3]">
            คำนวณปาจื้อไม่สำเร็จ
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-[#c5cdd9]/75">
            {computeError || "ข้อมูลวันเกิดไม่ถูกต้อง"}
          </p>
        </div>
      </div>
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
