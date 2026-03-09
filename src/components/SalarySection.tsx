"use client";

import type { JobHealthSnapshot } from "@/types";
import SectionLabel from "./ui/SectionLabel";
import DataValue from "./ui/DataValue";
import TrendBadge from "./ui/TrendBadge";
import TrendChart from "./ui/TrendChart";

type Props = {
  snapshot: JobHealthSnapshot;
};

function formatK(v: number): string {
  return `$${(v / 1000).toFixed(0)}k`;
}

export default function SalarySection({ snapshot }: Props) {
  const { salary } = snapshot;
  const hasData = salary.medianUSD > 0;
  const hasRange = salary.rangeMax > salary.rangeMin;
  const rangeWidth = hasRange
    ? ((salary.medianUSD - salary.rangeMin) / (salary.rangeMax - salary.rangeMin)) * 100
    : 50;

  return (
    <section>
      <SectionLabel className="mb-6">Salary Trends</SectionLabel>
      <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
        <div className="col-span-12 md:col-span-8">
          {hasData && salary.trend.length > 0 ? (
            <TrendChart
              data={salary.trend}
              height={280}
              yAxisFormatter={(v) => formatK(v)}
              tooltipFormatter={(v) => `$${v.toLocaleString()}`}
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
              Median Salary
            </span>
            {hasData ? (
              <>
                <DataValue
                  value={`$${salary.medianUSD.toLocaleString()}`}
                  className="text-data-lg font-display block"
                />
                <TrendBadge value={salary.yoyChange} format="percent" />
                <span className="text-label-sm text-mid ml-2">YoY</span>
              </>
            ) : (
              <span className="text-label-md text-mid font-mono">N/A</span>
            )}
          </div>

          {/* Range bar */}
          <div>
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
              Salary Range
            </span>
            {hasData && hasRange ? (
              <>
                <div className="relative h-2 bg-faint w-full">
                  <div
                    className="absolute top-0 h-full bg-ink"
                    style={{ left: 0, width: "100%" }}
                  />
                  <div
                    className="absolute top-[-4px] h-4 w-px bg-accent"
                    style={{ left: `${rangeWidth}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <DataValue value={formatK(salary.rangeMin)} className="text-label-sm text-mid" />
                  <DataValue
                    value={formatK(salary.medianUSD)}
                    className="text-label-sm text-accent font-medium"
                  />
                  <DataValue value={formatK(salary.rangeMax)} className="text-label-sm text-mid" />
                </div>
              </>
            ) : (
              <span className="text-label-sm text-mid font-mono">N/A</span>
            )}
          </div>

          <div>
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
              Top Paying Industries
            </span>
            {salary.topPayingIndustries.length > 0 ? (
              <ul className="space-y-1">
                {salary.topPayingIndustries.map((ind) => (
                  <li
                    key={ind}
                    className="text-body-sm text-dark"
                  >
                    {ind}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-label-sm text-mid font-mono">N/A</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
