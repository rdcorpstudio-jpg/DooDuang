"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** แสงทองสั้น ๆ ตอนเปิดผล — ใช้คลาสเดียวกับไพ่รายวัน */
export function MaeOpenLight() {
  return (
    <div
      className="tarot-open-veil pointer-events-none absolute inset-0 z-30"
      aria-hidden
    />
  );
}

export function useMaeOpenLight() {
  const [token, setToken] = useState(0);
  const timer = useRef<number | null>(null);

  const flash = useCallback(() => {
    if (timer.current != null) window.clearTimeout(timer.current);
    setToken((n) => n + 1);
    timer.current = window.setTimeout(() => {
      setToken(0);
      timer.current = null;
    }, 1500);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current != null) window.clearTimeout(timer.current);
    };
  }, []);

  return { token, flash };
}
