"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { APP_PAGE_BG } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils";

/** Shared Mae night plate — keep source bytes intact (`unoptimized`). */
export const MAE_PAGE_BG_SRC = "/images/home/main-bg.webp?v=main2";

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let cur = el?.parentElement ?? null;
  while (cur) {
    if (cur.classList.contains("preview-page-scroll")) return cur;
    const oy = getComputedStyle(cur).overflowY;
    if (oy === "auto" || oy === "scroll" || oy === "overlay") return cur;
    cur = cur.parentElement;
  }
  return null;
}

/**
 * `sticky` — stays put while page content scrolls (draft pages).
 * `fill` — absolute cover of parent (loading / phone-frame); image object-cover.
 * Sticky keeps natural width scale (no object-cover zoom).
 * Sticky mode can blur on scroll; `blur` sets a constant plate blur.
 */
export function MaePageBackground({
  priority = false,
  mode = "sticky",
  scrollBlur = mode === "sticky",
  blur = 0,
}: {
  priority?: boolean;
  mode?: "sticky" | "fill";
  /** Animate blur on scroll (sticky pages). */
  scrollBlur?: boolean;
  /** Constant background blur in px (e.g. preview pages). */
  blur?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [blurPx, setBlurPx] = useState(blur);
  const [dim, setDim] = useState(
    blur > 0 ? Math.min(0.32, 0.1 + blur * 0.012) : 0,
  );

  useEffect(() => {
    if (!scrollBlur) {
      setBlurPx(blur);
      // Constant blur pages (forms) need a stronger veil so UI doesn't sink into the art.
      setDim(blur > 0 ? Math.min(0.32, 0.1 + blur * 0.012) : 0);
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    const scroller = findScrollParent(root);
    if (!scroller) {
      setBlurPx(blur);
      setDim(blur > 0 ? 0.1 : 0);
      return;
    }

    let raf = 0;
    const MAX_BLUR = 6;
    const RANGE = 320;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const t = Math.min(1, Math.max(0, scroller.scrollTop / RANGE));
        const eased = 1 - (1 - t) ** 1.35;
        setBlurPx(Number((blur + eased * MAX_BLUR).toFixed(2)));
        setDim(Number((Math.min(0.22, (blur > 0 ? 0.1 : 0) + eased * 0.14)).toFixed(3)));
      });
    };

    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [scrollBlur, blur]);

  const plate = (
    <div
      className={cn(
        "mae-page-bg-enter overflow-hidden",
        mode === "fill" ? "absolute inset-0" : "absolute inset-x-0 top-0 w-full",
      )}
      style={{
        ...(mode === "sticky"
          ? { height: "var(--vv-height, 100dvh)", background: APP_PAGE_BG }
          : { background: APP_PAGE_BG }),
      }}
    >
      <div
        className={cn(
          "origin-top will-change-[filter,transform]",
          mode === "fill"
            ? "absolute inset-0"
            : "absolute inset-x-0 top-0 w-full",
        )}
        style={{
          filter: blurPx > 0.05 ? `blur(${blurPx}px)` : undefined,
          transform:
            blurPx > 0.05
              ? `scale(${1 + blurPx * 0.012})`
              : undefined,
          transition: "filter 60ms linear, transform 60ms linear",
        }}
      >
        {mode === "fill" ? (
          <Image
            src={MAE_PAGE_BG_SRC}
            alt=""
            fill
            priority={priority}
            unoptimized
            sizes="(max-width: 480px) 100vw, 480px"
            className="select-none object-cover object-[center_18%]"
            draggable={false}
          />
        ) : (
          <Image
            src={MAE_PAGE_BG_SRC}
            alt=""
            width={941}
            height={1672}
            priority={priority}
            unoptimized
            sizes="(max-width: 480px) 100vw, 480px"
            className="h-auto w-full max-w-none select-none"
            draggable={false}
          />
        )}
      </div>
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg, rgba(8,28,58,0.52) 0%, rgba(8,28,58,0.22) 36%, rgba(8,28,58,0.06) 58%, transparent 74%),
            linear-gradient(180deg, rgba(8,28,58,0.1) 0%, rgba(8,28,58,0.04) 40%, rgba(6,20,42,0.42) 80%, #06142a 100%)
          `,
        }}
      />
      {dim > 0.01 ? (
        <div
          className="absolute inset-0 will-change-[opacity]"
          style={{
            background: "rgba(6, 20, 42, 1)",
            opacity: dim,
            transition: "opacity 60ms linear",
          }}
        />
      ) : null}
    </div>
  );

  if (mode === "fill") {
    return (
      <div
        ref={rootRef}
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden
      >
        {plate}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="pointer-events-none sticky top-0 z-0 h-0 w-full overflow-visible"
      aria-hidden
    >
      {plate}
    </div>
  );
}
