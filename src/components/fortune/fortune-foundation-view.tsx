"use client";

import { useState } from "react";
import {
  Briefcase,
  ChevronRight,
  Compass,
  Heart,
  Moon,
  Users,
  Wallet,
} from "lucide-react";
import { MysticFrame } from "@/components/ui/mystic-frame";
import {
  foundationAccent,
  type FortuneFoundation,
} from "@/lib/fortune/foundation";
import { cn } from "@/lib/utils";

const TOPIC_ICONS = {
  work: Briefcase,
  money: Wallet,
  love: Heart,
  people: Users,
  energy: Moon,
} as const;

/** Lean พื้นฐานดวง — one frame, click topic to reveal detail */
export function FortuneFoundationView({
  data,
  className,
}: {
  data: FortuneFoundation;
  className?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { identity, headline, topics, actions } = data;

  return (
    <section className={cn("space-y-3.5", className)}>
      <h2 className="px-0.5 text-[1.1rem] font-semibold tracking-wide text-white">
        {data.sectionTitle}
      </h2>

      <MysticFrame radius={20} contentClassName="overflow-hidden">
        <div className="px-4 pb-4 pt-4">
          <p className="text-[11px] tracking-wide text-amber-200/70">{headline.tag}</p>
          <p className="mt-1.5 text-[1.05rem] font-medium leading-snug text-white">
            {headline.title}
          </p>
          <p className="mt-2.5 text-[13px] leading-relaxed text-white/58">
            {identity.summary}
          </p>
          <p className="mt-3 text-[12px] text-white/38">
            {identity.archetype}
            <span className="text-white/18"> · </span>
            ราศี{identity.zodiacNameTh}
            <span className="text-white/18"> · </span>
            เลข {identity.lifePathNumber}
          </p>
        </div>

        <div className="border-t border-white/[0.08]">
          {topics.map((topic, i) => {
            const Icon = TOPIC_ICONS[topic.id as keyof typeof TOPIC_ICONS] ?? Compass;
            const colors = foundationAccent(topic.accent);
            const open = openId === topic.id;

            return (
              <div
                key={topic.id}
                className={cn(i > 0 && "border-t border-white/[0.06]")}
              >
                <button
                  type="button"
                  onClick={() => setOpenId((cur) => (cur === topic.id ? null : topic.id))}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-white/[0.03]"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300"
                    style={{
                      background: colors.wash,
                      color: colors.accent,
                      transform: open ? "scale(1.06)" : "scale(1)",
                    }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] text-white">{topic.name}</span>
                    {!open ? (
                      <span className="mt-0.5 block truncate text-[11.5px] text-white/38">
                        {topic.subtitle}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 text-white/30 transition-transform duration-300",
                      open && "rotate-90"
                    )}
                    strokeWidth={1.8}
                  />
                </button>

                <div className={cn("panel-expand", open && "is-open")}>
                  <div>
                    <div className="space-y-2.5 px-4 pb-4 pl-[3.75rem]">
                      <p className="text-[13px] leading-relaxed text-white/70">
                        {topic.present.body}
                      </p>
                      <p className="text-[12.5px]" style={{ color: colors.accent }}>
                        {topic.tip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/[0.08] px-4 py-3.5">
          <p className="mb-2.5 text-[11px] tracking-wide text-white/35">พกไปวันนี้</p>
          <ul className="space-y-2">
            {actions.map((item) => (
              <li key={item.n} className="flex gap-2.5 text-[13px] leading-snug">
                <span className="shrink-0 tabular-nums text-amber-200/65">{item.n}</span>
                <span className="text-white/70">
                  <span className="text-white/90">{item.title}</span>
                  <span className="text-white/35"> — </span>
                  {item.body}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </MysticFrame>
    </section>
  );
}
