"use client";

import type { JobHealthSnapshot } from "@/types";
import StatCard from "./ui/StatCard";

type Props = {
  snapshot: JobHealthSnapshot;
};

function formatCurrency(value: number): string {
  return `$${(value / 1000).toFixed(0)}k`;
}

function formatSentimentScore(score: number): string {
  return score >= 0 ? `+${score}` : `${score}`;
}

export default function HealthScoreSummary({ snapshot }: Props) {
  const hasDemand = snapshot.demand.openingsCount > 0;
  const hasSalary = snapshot.salary.medianUSD > 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--grid-gutter)]">
      <StatCard
        label="Demand"
        value={hasDemand ? snapshot.demand.openingsCount.toLocaleString() : "N/A"}
        trend={hasDemand ? snapshot.demand.yoyChange : 0}
        trendFormat="percent"
        sparklineData={hasDemand ? snapshot.demand.openingsTrend : undefined}
      />
      <StatCard
        label="Salary"
        value={hasSalary ? formatCurrency(snapshot.salary.medianUSD) : "N/A"}
        trend={hasSalary ? snapshot.salary.yoyChange : 0}
        trendFormat="percent"
        sparklineData={hasSalary ? snapshot.salary.trend : undefined}
      />
      <StatCard
        label="AI Risk"
        value={`${snapshot.aiImpact.score}`}
        trend={0}
        sublabel={snapshot.aiImpact.scoreLabel}
        sparklineData={snapshot.aiImpact.trend}
        sparklineColor={
          snapshot.aiImpact.score > 75
            ? "var(--color-down)"
            : snapshot.aiImpact.score > 50
              ? "#C85A1A"
              : snapshot.aiImpact.score > 25
                ? "#B8860B"
                : "var(--color-up)"
        }
      />
      <StatCard
        label="Sentiment"
        value={formatSentimentScore(snapshot.sentiment.score)}
        trend={0}
        sublabel={snapshot.sentiment.label}
        sparklineColor={
          snapshot.sentiment.score > 0
            ? "var(--color-up)"
            : snapshot.sentiment.score < 0
              ? "var(--color-down)"
              : "var(--color-neutral)"
        }
      />
    </div>
  );
}
