"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { OnboardTopBar } from "@/components/onboard/onboard-top-bar";
import {
  HOME_TOPICS,
  ONBOARD_FUNNEL_TOTAL,
  homeTopicWizardHref,
  type HomeTopicId,
} from "@/lib/home-topics";
import { cn } from "@/lib/utils";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** First-run: pick a topic before login + wizard */
export function TopicChoosePage() {
  const router = useRouter();
  const [picked, setPicked] = useState<HomeTopicId | null>(null);

  function onPick(
    event: MouseEvent<HTMLAnchorElement>,
    id: HomeTopicId,
    href: string
  ) {
    if (picked) {
      event.preventDefault();
      return;
    }
    if (prefersReducedMotion()) return;
    event.preventDefault();
    setPicked(id);
    window.setTimeout(() => router.push(href), 150);
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-x-hidden overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 text-white">
      <OnboardTopBar current={1} total={ONBOARD_FUNNEL_TOTAL} backHref="/" />

      <div className="mx-auto flex w-full max-w-[22rem] flex-1 flex-col justify-center py-4">
        <h1 className="max-w-[16rem] text-[1.55rem] font-semibold leading-[1.45] tracking-wide text-[#f7f4ec]">
          วันนี้อยากให้แม่
          <br />
          ดูเรื่องไหน?
        </h1>
        <p className="mt-3 text-[15px] leading-[1.7] text-[#9aa3b2]">
          เลือกเรื่องที่อยู่ในใจตอนนี้
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {HOME_TOPICS.map((topic) => {
            const href = homeTopicWizardHref(topic.id);
            const selected = picked === topic.id;
            return (
              <Link
                key={topic.id}
                href={href}
                onClick={(event) => onPick(event, topic.id, href)}
                className={cn(
                  "flex h-[11.35rem] flex-col overflow-hidden rounded-[18px] text-left outline-none",
                  "transition-[border-color,box-shadow,transform] duration-150 ease-out",
                  "active:scale-[0.985] motion-reduce:transition-none motion-reduce:transform-none",
                  "focus-visible:ring-2 focus-visible:ring-[#d5b16f]/40"
                )}
                style={{
                  background: selected
                    ? "linear-gradient(180deg, #1a2234 0%, #121826 100%)"
                    : "linear-gradient(180deg, #161d2c 0%, #121826 100%)",
                  border: selected
                    ? "1px solid rgba(213, 177, 111, 0.82)"
                    : "1px solid rgba(213, 177, 111, 0.45)",
                  boxShadow: selected
                    ? "0 10px 28px rgba(0,0,0,0.35), 0 0 0 1px rgba(213,177,111,0.22)"
                    : "0 10px 28px rgba(0,0,0,0.35)",
                }}
              >
                <div className="relative h-[6.55rem] shrink-0 overflow-hidden">
                  <Image
                    src={topic.artwork}
                    alt=""
                    fill
                    sizes="170px"
                    className="object-cover"
                    style={{ objectPosition: topic.artworkPosition }}
                    priority
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    aria-hidden
                    style={{
                      background: `
                        linear-gradient(180deg,
                          rgba(18,24,38,0) 0%,
                          rgba(18,24,38,0.08) 38%,
                          rgba(18,24,38,0.55) 72%,
                          rgba(18,24,38,0.96) 100%)
                      `,
                    }}
                  />
                </div>

                <div className="relative z-10 -mt-5 flex min-h-[3.55rem] items-start justify-between gap-1 px-3.5 pb-2.5 pt-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold leading-none text-white">
                      {topic.title}
                    </p>
                    <p className="mt-1 line-clamp-2 min-h-[2.1rem] text-[12px] leading-[1.4] text-white/70">
                      {topic.blurb}
                    </p>
                  </div>
                  <ChevronRight
                    className="mt-px h-4 w-4 shrink-0 text-[#e8d19a]"
                    strokeWidth={2.2}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
