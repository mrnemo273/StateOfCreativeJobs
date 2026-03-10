"use client";

import type { JobHealthSnapshot } from "@/types";
import SectionLabel from "./ui/SectionLabel";
import ScoreGauge from "./ui/ScoreGauge";
import TrendChart from "./ui/TrendChart";

type Props = {
  snapshot: JobHealthSnapshot;
};

export default function AIImpactSection({ snapshot }: Props) {
  const { aiImpact } = snapshot;

  // Deduplicate: remove any protective factors that also appear in risk factors
  const riskSet = new Set(aiImpact.riskFactors);
  const protectiveFactors = aiImpact.protectiveFactors.filter(
    (f) => !riskSet.has(f),
  );

  return (
    <section>
      <SectionLabel className="mb-6">AI Impact Assessment</SectionLabel>
      <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
        <div className="col-span-12 md:col-span-8">
          <ScoreGauge score={aiImpact.score} label={aiImpact.scoreLabel} />
          <div className="mt-6">
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
              Score Trend
            </span>
            <TrendChart
              data={aiImpact.trend}
              height={200}
              color={
                aiImpact.score > 75
                  ? "var(--color-down)"
                  : aiImpact.score > 50
                    ? "#C85A1A"
                    : aiImpact.score > 25
                      ? "#B8860B"
                      : "var(--color-up)"
              }
              yAxisFormatter={(v) => `${v}`}
              tooltipFormatter={(v) => `Score: ${v}`}
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
          <div>
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-3">
              Risk Factors
            </span>
            {aiImpact.riskFactors.length > 0 ? (
              <ul className="space-y-2">
                {aiImpact.riskFactors.map((f, i) => (
                  <li key={i} className="text-body-sm text-dark flex gap-2">
                    <span className="text-down font-mono text-label-md mt-0.5 shrink-0">
                      ↑
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-label-sm text-mid font-mono">N/A</span>
            )}
          </div>
          <div>
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-3">
              Protective Factors
            </span>
            {protectiveFactors.length > 0 ? (
              <ul className="space-y-2">
                {protectiveFactors.map((f, i) => (
                  <li key={i} className="text-body-sm text-dark flex gap-2">
                    <span className="text-up font-mono text-label-md mt-0.5 shrink-0">
                      ↓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-label-sm text-mid font-mono">N/A</span>
            )}
          </div>
        </div>
      </div>
      <p className="mt-6 text-body-sm text-mid max-w-[65ch] leading-relaxed">
        {aiImpact.scoreExplainer}
      </p>
    </section>
  );
}
