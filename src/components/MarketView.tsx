"use client";

import type { MarketEnrichment, NEASupplyContext, UpworkEmploymentStructure } from "@/lib/enrichmentData";
import SectionLabel from "./ui/SectionLabel";

interface Props {
  market: MarketEnrichment;
  roleNEA?: NEASupplyContext | null;
  roleUpwork?: UpworkEmploymentStructure | null;
  roleTitle: string;
}

export default function MarketView({ market, roleNEA, roleUpwork, roleTitle }: Props) {
  const freelancePct = roleUpwork?.currentSplit.freelancePct ?? market.aggregateUpwork.avgFreelancePct;
  const staffPct = roleUpwork?.currentSplit.staffPct ?? (freelancePct != null ? 100 - freelancePct : null);

  // "Bridge tax" = wage gap between staff & freelance (market aggregate or role-specific)
  const bridgeTax = roleUpwork?.wageGap.gapPct ?? null;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="mb-4">
        <h2
          className="font-mono text-ink leading-tight"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
        >
          Beyond the Job Posting
        </h2>
        <p className="text-body text-mid mt-3 max-w-[65ch] leading-relaxed">
          How many {roleTitle}s actually exist, how many are freelance vs. staff,
          and what the broader economy means for this role&apos;s future.
        </p>
      </div>

      {/* 4-up stat cards: Who's in the Market */}
      <section>
        <SectionLabel className="mb-6">Who&apos;s in the Market</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--grid-gutter)]">
          <div className="border border-light p-5">
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
              Full-Time {roleTitle}s
            </span>
            <span className="font-mono text-data-lg text-ink block">
              {roleNEA?.blsCount.toLocaleString() ?? market.aggregateNEA.totalBLSCount.toLocaleString()}
            </span>
            <span className="text-label-sm text-mid block mt-1">BLS official count</span>
          </div>
          <div className="border border-light p-5">
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
              All {roleTitle}s
            </span>
            <span className="font-mono text-data-lg text-ink block">
              {roleNEA?.trueSupplyCount.toLocaleString() ?? market.aggregateNEA.totalTrueSupply.toLocaleString()}
            </span>
            <span className="text-label-sm text-mid block mt-1">
              {(roleNEA?.supplyMultiplier ?? market.aggregateNEA.overallMultiplier).toFixed(1)}{"\u00d7"} more than BLS reports
            </span>
          </div>
          <div className="border border-light p-5">
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
              Freelance {roleTitle}s
            </span>
            <span className="font-mono text-data-lg text-ink block">
              {freelancePct != null ? `${freelancePct}%` : "\u2014"}
            </span>
            <span className="text-label-sm text-mid block mt-1">of total workforce</span>
          </div>
          <div className="border border-light p-5">
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
              Freelance Pay Gap
            </span>
            <span className="font-mono text-data-lg block" style={{ color: bridgeTax != null && bridgeTax > 0 ? "var(--color-down)" : "var(--color-up)" }}>
              {bridgeTax != null ? `${bridgeTax > 0 ? "-" : "+"}${Math.abs(bridgeTax).toFixed(0)}%` : "\u2014"}
            </span>
            <span className="text-label-sm text-mid block mt-1">vs. full-time salary</span>
          </div>
        </div>
        <p className="mt-4 text-body-sm text-mid max-w-[65ch]">
          Source: NEA Artists in the Workforce, Upwork Freelance Forward.
        </p>
      </section>

    </div>
  );
}
