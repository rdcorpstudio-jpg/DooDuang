"use client";

import { useEffect, useRef } from "react";

/**
 * Mouse drag-to-scroll + wheel/trackpad for horizontal carousels.
 * Touch / pen keep native overflow pan; clicks still work unless the user dragged.
 */
export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({
    active: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
    pointerId: -1,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (e.button !== 0) return;
      state.current = {
        active: true,
        moved: false,
        startX: e.clientX,
        scrollLeft: el.scrollLeft,
        pointerId: e.pointerId,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!state.current.active) return;
      if (e.pointerId !== state.current.pointerId) return;
      const dx = e.clientX - state.current.startX;
      if (Math.abs(dx) <= 8) return;
      if (!state.current.moved) {
        state.current.moved = true;
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
      el.scrollLeft = state.current.scrollLeft - dx;
      e.preventDefault();
    };

    const end = (e: PointerEvent) => {
      if (!state.current.active) return;
      if (e.pointerId !== state.current.pointerId) return;
      const wasMoved = state.current.moved;
      try {
        if (el.hasPointerCapture(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* ignore */
      }
      state.current.active = false;
      state.current.pointerId = -1;
      if (wasMoved) {
        const suppress = (ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
          el.removeEventListener("click", suppress, true);
        };
        el.addEventListener("click", suppress, true);
        window.setTimeout(() => {
          el.removeEventListener("click", suppress, true);
          state.current.moved = false;
        }, 0);
      } else {
        state.current.moved = false;
      }
    };

    /** Trackpad / mouse wheel → เลื่อนแนวนอนบนคอม */
    const onWheel = (e: WheelEvent) => {
      const dx = e.deltaX !== 0 ? e.deltaX : e.deltaY;
      if (dx === 0) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const next = Math.min(max, Math.max(0, el.scrollLeft + dx));
      if (next === el.scrollLeft) return;
      el.scrollLeft = next;
      e.preventDefault();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("lostpointercapture", end);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
      el.removeEventListener("lostpointercapture", end);
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  return {
    ref,
    didDrag: () => state.current.moved,
  };
}
