"use client";

import type { JobHealthSnapshot } from "@/types";
import SectionLabel from "./ui/SectionLabel";
import DataValue from "./ui/DataValue";
import NewsCard from "./ui/NewsCard";

type Props = {
  snapshot: JobHealthSnapshot;
};

export default function SentimentSection({ snapshot }: Props) {
  const { sentiment } = snapshot;
  const normalized = (sentiment.score + 100) / 2; // -100..+100 → 0..100

  return (
    <section>
      <SectionLabel className="mb-6">Sentiment &amp; News</SectionLabel>
      <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
        <div className="col-span-12">
          {/* Sentiment bar */}
          <div className="flex items-center gap-4 mb-6">
            <DataValue
              value={sentiment.score >= 0 ? `+${sentiment.score}` : `${sentiment.score}`}
              className="text-data-lg font-display"
            />
            <span
              className={`text-label-md font-mono uppercase tracking-widest px-2 py-0.5 ${
                sentiment.score > 0
                  ? "text-up bg-up-bg"
                  : sentiment.score < 0
                    ? "text-down bg-down-bg"
                    : "text-neutral bg-neutral-bg"
              }`}
            >
              {sentiment.label}
            </span>
          </div>
          <div className="relative h-2 bg-faint w-full mb-2">
            <div
              className="absolute top-0 h-full"
              style={{
                left: 0,
                width: `${normalized}%`,
                backgroundColor:
                  sentiment.score > 0
                    ? "var(--color-up)"
                    : sentiment.score < 0
                      ? "var(--color-down)"
                      : "var(--color-neutral)",
              }}
            />
          </div>
          <div className="flex justify-between text-label-sm text-mid font-mono mb-1">
            <span>-100</span>
            <span>0</span>
            <span>+100</span>
          </div>
          <p className="text-label-sm text-mid mt-1">
            Based on {sentiment.sources.join(", ")}
          </p>
        </div>

        {/* News cards */}
        <div className="col-span-12 mt-6">
          <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
            {sentiment.recentHeadlines.map((item, i) => (
              <div key={i} className="col-span-4">
                <NewsCard
                  headline={item.headline}
                  source={item.source}
                  date={item.date}
                  sentiment={item.sentiment}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
