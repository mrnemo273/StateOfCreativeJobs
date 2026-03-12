"use client";

import { deriveVerdict, deriveSalaryVerdict, deriveAIVerdict } from "@/lib/enrichmentData";
import type { RoleVerdict as RoleVerdictType, SalaryVerdict, AIVerdict } from "@/lib/enrichmentData";
import TrendBadge from "./ui/TrendBadge";

interface Props {
  yoyChange: number;
  fredIndexChangeYoY?: number;
  openingsCount?: number;
  medianSalaryUSD?: number;
  salaryYoYChange?: number;
  aiScore?: number;
  aiScoreLabel?: string;
}

const demandColor: Record<RoleVerdictType, string> = {
  Contracting: "var(--color-down)",
  Holding: "var(--color-neutral)",
  Rising: "var(--color-up)",
};

const salaryColor: Record<SalaryVerdict, string> = {
  Declining: "var(--color-down)",
  Flat: "var(--color-neutral)",
  Growing: "var(--color-up)",
};

const aiColor: Record<AIVerdict, string> = {
  "Low Risk": "var(--color-up)",
  Moderate: "#B8860B",
  Elevated: "#C85A1A",
  "High Risk": "var(--color-down)",
};

export default function RoleVerdict({
  yoyChange,
  fredIndexChangeYoY,
  openingsCount,
  medianSalaryUSD,
  salaryYoYChange,
  aiScore,
  aiScoreLabel,
}: Props) {
  const { verdict, isMarketWide } = deriveVerdict(yoyChange, fredIndexChangeYoY);
  const salaryVerdict = salaryYoYChange != null ? deriveSalaryVerdict(salaryYoYChange) : null;
  const aiVerdict = aiScore != null ? deriveAIVerdict(aiScore) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--grid-gutter)] mb-6">
      {/* Demand Signal */}
      <div className="border border-light border-l-[3px] pl-5 py-4 pr-4" style={{ borderLeftColor: demandColor[verdict] }}>
        <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
          Demand Signal
        </span>
        <span
          className="font-mono text-data-lg uppercase tracking-widest block"
          style={{ color: demandColor[verdict] }}
        >
          {verdict}
        </span>
        {openingsCount != null && (
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-label-md text-ink">
              {openingsCount.toLocaleString()} openings
            </span>
            <TrendBadge value={yoyChange} format="percent" />
          </div>
        )}
        {isMarketWide !== null && verdict === "Contracting" && (
          <span className="text-body-sm text-mid block mt-1">
            {isMarketWide
              ? "Tracks broader market contraction"
              : "Role-specific — broader market stable"}
          </span>
        )}
      </div>

      {/* Salary Signal */}
      <div
        className="border border-light border-l-[3px] pl-5 py-4 pr-4"
        style={{ borderLeftColor: salaryVerdict ? salaryColor[salaryVerdict] : "var(--color-light)" }}
      >
        <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
          Salary Signal
        </span>
        <span
          className="font-mono text-data-lg uppercase tracking-widest block"
          style={{ color: salaryVerdict ? salaryColor[salaryVerdict] : "var(--color-mid)" }}
        >
          {salaryVerdict ?? "\u2014"}
        </span>
        {medianSalaryUSD != null && (
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-label-md text-ink">
              ${medianSalaryUSD.toLocaleString()}
            </span>
            {salaryYoYChange != null && <TrendBadge value={salaryYoYChange} format="percent" />}
          </div>
        )}
      </div>

      {/* AI Signal */}
      <div
        className="border border-light border-l-[3px] pl-5 py-4 pr-4"
        style={{ borderLeftColor: aiVerdict ? aiColor[aiVerdict] : "var(--color-light)" }}
      >
        <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
          AI Exposure
        </span>
        <span
          className="font-mono text-data-lg uppercase tracking-widest block"
          style={{ color: aiVerdict ? aiColor[aiVerdict] : "var(--color-mid)" }}
        >
          {aiVerdict ?? "\u2014"}
        </span>
        {aiScore != null && (
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-label-md text-ink">
              Score {aiScore}
            </span>
            {aiScoreLabel && (
              <span className="text-label-sm text-mid">{aiScoreLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
