"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  threshold?: number;
  root?: Element | null;
  once?: boolean;
}

export function useInView<T extends HTMLElement = HTMLElement>({
  threshold = 0.45,
  root = null,
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, root }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, root, once]);

  return { ref, inView };
}
