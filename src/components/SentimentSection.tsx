import type { JobHealthSnapshot } from "@/types";
import SectionLabel from "./ui/SectionLabel";
import DataValue from "./ui/DataValue";
import NewsCard from "./ui/NewsCard";
type Props = {
  snapshot: JobHealthSnapshot;
};

export default function SentimentSection({ snapshot }: Props) {
  const { sentiment } = snapshot;

  const hasHeadlines = sentiment.recentHeadlines.length > 0;
  const hasCommunity = sentiment.communityPosts.length > 0;

  if (!hasHeadlines && !hasCommunity && sentiment.score === 0) {
    return null;
  }

  const normalized = (sentiment.score + 100) / 2; // -100..+100 → 0..100

  return (
    <section>
      <SectionLabel className="mb-6">Industry Signals</SectionLabel>
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
          {sentiment.sources.length > 0 && (
            <p className="text-label-sm text-mid mt-1">
              Based on {sentiment.sources.join(", ")}
            </p>
          )}
        </div>

        {/* News cards */}
        {hasHeadlines && (
          <div className="col-span-12 mt-6">
            <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
              {sentiment.recentHeadlines.map((item, i) => (
                <div key={i} className="col-span-12 md:col-span-4">
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
        )}

        {/* Community data — Hacker News */}
        {hasCommunity && (
          <div className="col-span-12 mt-8">
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-4 font-medium">
              What Practitioners Are Saying
            </span>

            {/* Signal pills */}
            <div className="flex flex-wrap gap-3 mb-6">
              {sentiment.layoffMentions > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-label-sm font-mono uppercase bg-black/10">
                  <span>Layoffs</span>
                  <span className="tabular-nums">{sentiment.layoffMentions}</span>
                </span>
              )}
              {sentiment.hiringMentions > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-label-sm font-mono uppercase bg-black/10">
                  <span>Hiring</span>
                  <span className="tabular-nums">{sentiment.hiringMentions}</span>
                </span>
              )}
              {sentiment.aiMentions > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-label-sm font-mono uppercase bg-black/10">
                  <span>AI</span>
                  <span className="tabular-nums">{sentiment.aiMentions}</span>
                </span>
              )}
            </div>

            {/* Quote cards */}
            {sentiment.communityQuotes.length > 0 && (
              <div className="grid grid-cols-12 gap-[var(--grid-gutter)] mb-6">
                {sentiment.communityQuotes.map((q, i) => (
                  <div key={i} className="col-span-12 md:col-span-6">
                    <div className="border border-light p-4 h-full flex flex-col">
                      <p className="text-body-sm font-sans italic flex-1">{q.text}</p>
                      <div className="mt-2">
                        <span className="text-label-sm text-mid font-mono">
                          {q.source}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Keyword pills */}
            {sentiment.communityKeywords.length > 0 && (
              <div>
                <span className="text-label-sm text-mid uppercase tracking-widest block mb-4 font-medium">
                  Tools &amp; Trends Detected
                </span>
                <div className="flex flex-wrap gap-2">
                  {sentiment.communityKeywords.map((kw) => (
                    <span
                      key={kw.word}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-label-sm font-mono bg-black/10"
                    >
                      <span>{kw.word}</span>
                      <span className="text-mid tabular-nums">{kw.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
