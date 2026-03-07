"use client";

import type { JobHealthSnapshot } from "@/types";
import SectionLabel from "./ui/SectionLabel";
import DataValue from "./ui/DataValue";
import TrendBadge from "./ui/TrendBadge";
import TrendChart from "./ui/TrendChart";

type Props = {
  snapshot: JobHealthSnapshot;
};

export default function DemandSection({ snapshot }: Props) {
  const { demand } = snapshot;

  return (
    <section>
      <SectionLabel className="mb-6">Demand</SectionLabel>
      <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
        <div className="col-span-8">
          <TrendChart
            data={demand.openingsTrend}
            height={280}
            yAxisFormatter={(v) => v.toLocaleString()}
            tooltipFormatter={(v) => `${v.toLocaleString()} openings`}
          />
        </div>
        <div className="col-span-4 flex flex-col gap-6">
          <div>
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-1">
              Open Roles
            </span>
            <DataValue
              value={demand.openingsCount.toLocaleString()}
              className="text-data-lg font-display block"
            />
            <TrendBadge value={demand.yoyChange} format="percent" />
            <span className="text-label-sm text-mid ml-2">vs last year</span>
          </div>
          <div>
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
              Top Hiring Locations
            </span>
            <div className="flex flex-wrap gap-2">
              {demand.topHiringLocations.map((loc) => (
                <span
                  key={loc}
                  className="border border-light px-2 py-1 text-label-md font-mono text-dark"
                >
                  {loc}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
