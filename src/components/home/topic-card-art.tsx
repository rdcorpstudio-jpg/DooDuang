import type { HomeTopicId } from "@/lib/home-topics";

/** Gold line art — not generic emoji icons */
export function TopicCardArt({ id }: { id: HomeTopicId }) {
  const line = {
    fill: "none",
    stroke: "#d5b16f",
    strokeWidth: 1.45,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      viewBox="0 0 96 72"
      aria-hidden
      className="h-[3.85rem] w-full max-w-[7.25rem]"
    >
      {id === "career" ? (
        <>
          <path {...line} d="M10 62h28M18 62V52h16V62M26 52V42h16V52M34 42V32h16V42" />
          <path {...line} d="M50 62V28h22v34" />
          <path {...line} d="M54 28c0-10 7-16 11-16s11 6 11 16" />
          <path {...line} d="M61 28v18h8V28" opacity={0.85} />
          <circle cx="72" cy="12" r="3.2" fill="#e8d19a" stroke="none" />
        </>
      ) : null}
      {id === "money" ? (
        <>
          <circle cx="38" cy="38" r="17" {...line} />
          <circle cx="58" cy="34" r="17" {...line} />
          <path
            {...line}
            d="M58 24l2.2 5.4h5.6l-4.5 3.4 1.7 5.4L58 35.2 53 38.2l1.7-5.4-4.5-3.4h5.6z"
          />
        </>
      ) : null}
      {id === "love" ? (
        <>
          <path
            {...line}
            d="M30 22l3.5 8.5H43l-7.5 5.4 2.8 8.6L30 39.2 22.7 44.5l2.8-8.6L18 30.5h9.5z"
          />
          <path
            {...line}
            d="M66 22l3.5 8.5H79l-7.5 5.4 2.8 8.6L66 39.2 58.7 44.5l2.8-8.6L54 30.5h9.5z"
          />
          <path {...line} d="M42 48c6 7 14 7 20 0" opacity={0.8} />
        </>
      ) : null}
      {id === "overview" ? (
        <>
          <circle cx="48" cy="36" r="24" {...line} opacity={0.42} />
          <circle cx="48" cy="36" r="16.5" {...line} opacity={0.28} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6 - Math.PI / 2;
            return (
              <line
                key={i}
                x1={48 + Math.cos(a) * 21.6}
                y1={36 + Math.sin(a) * 21.6}
                x2={48 + Math.cos(a) * 24.6}
                y2={36 + Math.sin(a) * 24.6}
                {...line}
                strokeWidth={1.05}
                opacity={0.4}
              />
            );
          })}
          <path
            {...line}
            strokeWidth={1.15}
            opacity={0.85}
            d="M48 18.5 62.5 28.5 57 46.5 39 46.5 33.5 28.5Z"
          />
          <circle cx="48" cy="18.5" r="2.15" fill="#e8d19a" stroke="none" />
          <circle cx="62.5" cy="28.5" r="1.85" fill="#e8d19a" stroke="none" />
          <circle cx="57" cy="46.5" r="2.05" fill="#e8d19a" stroke="none" />
          <circle cx="39" cy="46.5" r="1.75" fill="#e8d19a" stroke="none" />
          <circle cx="33.5" cy="28.5" r="1.9" fill="#e8d19a" stroke="none" />
          <circle cx="48" cy="36" r="1.35" fill="#e8d19a" stroke="none" />
        </>
      ) : null}
    </svg>
  );
}
