"use client";

import type { JobHealthSnapshot } from "@/types";
import type { FREDMacroContext } from "@/lib/enrichmentData";
import SectionLabel from "./ui/SectionLabel";
import SourceBadge from "./ui/SourceBadge";
import DataValue from "./ui/DataValue";
import TrendBadge from "./ui/TrendBadge";
import TrendChart from "./ui/TrendChart";
import ConfidenceBadge from "./ui/ConfidenceBadge";
import DataFootnote from "./ui/DataFootnote";
import { getAnnotationsForRole, freshnessNote } from "@/data/annotations";

type Props = {
  snapshot: JobHealthSnapshot;
  fredMacro?: FREDMacroContext | null;
};

export default function DemandSection({ snapshot, fredMacro }: Props) {
  const { demand } = snapshot;
  const hasData = demand.openingsCount > 0;
  const chartAnnotations = getAnnotationsForRole(snapshot.slug).map((a) => ({
    date: a.date,
    label: a.label,
  }));
  const staleNote = freshnessNote(snapshot.lastUpdated);

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <SectionLabel>Demand</SectionLabel>
        <ConfidenceBadge sectionKey="demand" lastUpdated={snapshot.lastUpdated} />
        {fredMacro && <SourceBadge sources="BLS + FRED" isNew />}
      </div>
      <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
        <div className="col-span-12 md:col-span-8">
          {hasData && demand.openingsTrend.length > 0 ? (
            <TrendChart
              data={demand.openingsTrend}
              height={280}
              yAxisFormatter={(v) => v.toLocaleString()}
              tooltipFormatter={(v) => `${v.toLocaleString()} openings`}
              annotations={chartAnnotations}
            />
          ) : (
            <div className="h-[280px] bg-faint flex items-center justify-center">
              <span className="text-label-md text-mid font-mono uppercase tracking-widest">
                Not Available
              </span>
            </div>
          )}
        </div>
        <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
          <div>
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-1">
              Open Roles
            </span>
            {hasData ? (
              <>
                <DataValue
                  value={demand.openingsCount.toLocaleString()}
                  className="text-data-lg font-display block"
                />
                <TrendBadge value={demand.yoyChange} format="percent" />
                <span className="text-label-sm text-mid ml-2">vs last year</span>
              </>
            ) : (
              <span className="text-label-md text-mid font-mono">N/A</span>
            )}
          </div>
          <div>
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
              Top Hiring Locations
            </span>
            {demand.topHiringLocations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {demand.topHiringLocations.map((loc) => (
                  <span
                    key={loc}
                    className="bg-black/10 px-3 py-1 text-label-sm font-mono"
                  >
                    {loc}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-label-sm text-mid font-mono">N/A</span>
            )}
          </div>

          {/* FRED macro context — bordered card */}
          {fredMacro && (
            <div className="border border-light p-4">
              <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
                Economy Context
              </span>
              <p className="text-body-sm text-dark">
                {fredMacro.indexChangeYoY < -5
                  ? `Knowledge-work employment is also down ${Math.abs(fredMacro.indexChangeYoY).toFixed(1)}% YoY — this role's decline tracks broader market contraction.`
                  : fredMacro.indexChangeYoY > 5
                    ? `Knowledge-work employment is up ${fredMacro.indexChangeYoY.toFixed(1)}% YoY, but this role is contracting — suggesting role-specific displacement.`
                    : `Knowledge-work employment is flat (${fredMacro.indexChangeYoY > 0 ? "+" : ""}${fredMacro.indexChangeYoY.toFixed(1)}% YoY). This role's trend appears role-specific.`
                }
              </p>
              <span className="text-label-sm text-mid block mt-2">
                FRED {fredMacro.seriesId}
              </span>
            </div>
          )}
        </div>
      </div>
      <DataFootnote>
        Source: Adzuna job postings. Covers approximately 60% of US listings.
        {staleNote && ` ${staleNote}`}
      </DataFootnote>
    </section>
  );
}
