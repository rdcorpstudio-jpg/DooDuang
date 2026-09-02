"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { IntroScreen } from "@/components/home/intro-screen";
import { FortuneSection } from "@/components/home/fortune-section";

export function HomeScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fortuneProgress, setFortuneProgress] = useState(0);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updateProgress = () => {
      const height = container.clientHeight || 1;
      const progress = Math.min(1, Math.max(0, container.scrollTop / height));
      setFortuneProgress(progress);
    };

    updateProgress();
    container.addEventListener("scroll", updateProgress, { passive: true });
    return () => container.removeEventListener("scroll", updateProgress);
  }, []);

  const scrollToFortune = useCallback(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.clientHeight,
      behavior: "smooth",
    });
  }, []);

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div
      ref={scrollRef}
      className="home-scroll h-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
    >
      <IntroScreen onScrollDown={scrollToFortune} scrollProgress={fortuneProgress} />
      <FortuneSection onScrollUp={scrollToTop} scrollProgress={fortuneProgress} />
    </div>
  );
}
