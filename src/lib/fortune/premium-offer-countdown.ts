"use client";

import { useEffect, useState } from "react";

export const PREMIUM_OFFER_KEY = "dooduang-premium-offer-ends";
export const PREMIUM_OFFER_MS = 15 * 60 * 1000;
export const PREMIUM_LIST_PRICE = 699;

export function pad2(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

export function readPremiumOfferEnds(): number {
  try {
    const raw = sessionStorage.getItem(PREMIUM_OFFER_KEY);
    const parsed = raw ? Number(raw) : NaN;
    if (Number.isFinite(parsed) && parsed > Date.now()) return parsed;
    const ends = Date.now() + PREMIUM_OFFER_MS;
    sessionStorage.setItem(PREMIUM_OFFER_KEY, String(ends));
    return ends;
  } catch {
    return Date.now() + PREMIUM_OFFER_MS;
  }
}

export function usePersonalOfferCountdown() {
  const [leftMs, setLeftMs] = useState(PREMIUM_OFFER_MS);

  useEffect(() => {
    const tick = () => {
      const ends = readPremiumOfferEnds();
      setLeftMs(Math.max(0, ends - Date.now()));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, []);

  const totalSec = Math.ceil(leftMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return { hours, minutes, seconds, leftMs };
}
