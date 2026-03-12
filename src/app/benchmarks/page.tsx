import type { Metadata } from "next";
import Link from "next/link";
import { getAllSnapshots } from "@/lib/dataService.server";
import {
  computeClusterAverages,
  computeClusterRankings,
  computeOutliers,
  computeSalarySpread,
  clusterLabel,
} from "@/lib/benchmarks";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionLabel from "@/components/ui/SectionLabel";
import HairlineRule from "@/components/ui/HairlineRule";
import DataValue from "@/components/ui/DataValue";
import TrendBadge from "@/components/ui/TrendBadge";
import RankingChart from "@/components/benchmarks/RankingChart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Industry Benchmarks | State of Creative Jobs",
  description:
    "Cross-cluster comparisons, outlier detection, and salary spread analysis across 20 creative and design roles.",
};

function formatK(v: number): string {
  return `$${(v / 1000).toFixed(0)}k`;
}

function getRiskLabel(score: number): string {
  if (score < 25) return "Low";
  if (score < 50) return "Moderate";
  if (score < 70) return "Elevated";
  return "High";
}

const OUTLIER_LABELS: Record<string, string> = {
  outperforming: "Outperforming",
  underperforming: "Underperforming",
  "risk-salary-mismatch": "Risk-Salary Mismatch",
  "demand-risk-convergence": "Demand-Risk Convergence",
};

export default function BenchmarksPage() {
  const snapshots = getAllSnapshots();

  if (snapshots.length === 0) {
    return (
      <div className="min-h-screen bg-paper">
        <Header />
        <main
          className="max-w-[1440px] mx-auto py-16 text-center"
          style={{ padding: "var(--grid-margin)" }}
        >
          <p className="font-mono text-mid text-label-md uppercase tracking-widest">
            No snapshot data available. Run the refresh script to populate.
          </p>
        </main>
        <Footer lastUpdated={undefined} />
      </div>
    );
  }

  const clusters = computeClusterAverages(snapshots);
  const riskRankings = computeClusterRankings(snapshots, "aiScore");
  const demandRankings = computeClusterRankings(snapshots, "demandYoY");
  const salaryRankings = computeClusterRankings(snapshots, "salary");
  const outliers = computeOutliers(snapshots);
  const salarySpread = computeSalarySpread(snapshots);

  const lastUpdated = snapshots[0]?.lastUpdated;

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main
        className="max-w-[1440px] mx-auto"
        style={{ padding: "var(--grid-margin)" }}
      >
        {/* Page header */}
        <section className="pt-12 md:pt-16 mb-10 md:mb-14">
          <h1
            className="font-mono text-ink leading-none mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Industry Benchmarks
          </h1>
          <p className="font-mono text-body-sm text-mid max-w-[65ch] leading-relaxed">
            Cluster-level comparisons, cross-market rankings, and outlier
            detection across all {snapshots.length} tracked creative roles.
          </p>
        </section>

        <HairlineRule />

        {/* Section 1 — Cluster Scorecards */}
        <section className="py-10 md:py-14">
          <SectionLabel className="mb-6">Cluster Scorecards</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--grid-gutter)]">
            {clusters.map((c) => (
              <div key={c.cluster} className="border border-light p-6">
                <span className="text-label-sm text-mid uppercase tracking-widest block mb-1">
                  {c.clusterLabel}
                </span>
                <span className="font-mono text-label-sm text-mid block mb-4">
                  {c.roleCount} roles
                </span>

                <div className="space-y-3">
                  <div>
                    <span className="text-label-sm text-mid block">
                      Avg AI Risk
                    </span>
                    <div className="flex items-center gap-2">
                      <DataValue
                        value={String(c.avgAiScore)}
                        className="text-data-md"
                      />
                      <span className="text-label-sm text-mid font-mono">
                        {getRiskLabel(c.avgAiScore)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-label-sm text-mid block">
                      Avg Demand Change
                    </span>
                    <TrendBadge value={c.avgYoY} format="percent" />
                    <span className="text-label-sm text-mid ml-1">YoY</span>
                  </div>

                  <div>
                    <span className="text-label-sm text-mid block">
                      Avg Salary
                    </span>
                    <DataValue
                      value={formatK(c.avgSalary)}
                      className="text-data-md"
                    />
                  </div>

                  <HairlineRule className="border-light" />

                  <div>
                    <span className="text-label-sm text-mid block">
                      Highest risk
                    </span>
                    <span className="text-body-sm text-dark">
                      {c.highestRiskRole}
                    </span>
                  </div>
                  <div>
                    <span className="text-label-sm text-mid block">
                      Most growth
                    </span>
                    <span className="text-body-sm text-dark">
                      {c.mostGrowthRole}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <HairlineRule />

        {/* Section 2 — Cross-Cluster Rankings */}
        <section className="py-10 md:py-14">
          <SectionLabel className="mb-6">
            Cross-Cluster Rankings
          </SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--grid-gutter)]">
            <RankingChart
              data={riskRankings}
              label="AI Risk — Cluster Average"
              formatType="risk"
              colorByValue="risk"
            />
            <RankingChart
              data={demandRankings}
              label="Demand Growth — Cluster Average"
              formatType="demand"
              colorByValue="demand"
            />
            <RankingChart
              data={salaryRankings}
              label="Salary — Cluster Average"
              formatType="salary"
              colorByValue="salary"
            />
          </div>
        </section>

        <HairlineRule />

        {/* Section 3 — Outliers */}
        {outliers.length > 0 && (
          <>
            <section className="py-10 md:py-14">
              <SectionLabel className="mb-6">
                Outliers &amp; Divergences
              </SectionLabel>
              <div className="space-y-4 max-w-[65ch]">
                {outliers.map((o, i) => (
                  <div key={i} className="border-b border-faint pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/role/${o.slug}`}
                        className="font-mono text-label-md text-ink underline underline-offset-2 hover:text-mid transition-colors"
                      >
                        {o.title}
                      </Link>
                      <span className="text-label-sm text-mid font-mono uppercase bg-faint px-2 py-0.5">
                        {OUTLIER_LABELS[o.type] ?? o.type}
                      </span>
                    </div>
                    <p className="text-body-sm text-dark">{o.description}</p>
                  </div>
                ))}
              </div>
            </section>
            <HairlineRule />
          </>
        )}

        {/* Section 4 — Salary Spread */}
        {salarySpread.length > 0 && (
          <section className="py-10 md:py-14">
            <SectionLabel className="mb-6">Salary Spread</SectionLabel>
            <p className="text-body-sm text-mid mb-6 max-w-[65ch]">
              P10 to P90 salary range for each role, sorted by spread width.
              Wide spreads indicate more variation across employers, locations,
              and seniority.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm">
                <thead>
                  <tr className="border-b border-ink">
                    <th className="text-left uppercase tracking-widest text-label-md text-mid py-2 pr-4 font-medium">
                      Role
                    </th>
                    <th className="text-left uppercase tracking-widest text-label-md text-mid py-2 pr-4 font-medium">
                      Cluster
                    </th>
                    <th className="text-right uppercase tracking-widest text-label-md text-mid py-2 pr-4 font-medium">
                      P10
                    </th>
                    <th className="text-right uppercase tracking-widest text-label-md text-mid py-2 pr-4 font-medium">
                      Median
                    </th>
                    <th className="text-right uppercase tracking-widest text-label-md text-mid py-2 pr-4 font-medium">
                      P90
                    </th>
                    <th className="text-right uppercase tracking-widest text-label-md text-mid py-2 font-medium">
                      Spread
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salarySpread.map((row) => (
                    <tr
                      key={row.slug}
                      className="border-b border-faint hover:bg-faint transition-colors duration-75"
                    >
                      <td className="py-2 pr-4">
                        <Link
                          href={`/role/${row.slug}`}
                          className="text-ink underline underline-offset-2 hover:text-mid transition-colors"
                        >
                          {row.title}
                        </Link>
                      </td>
                      <td className="py-2 pr-4 text-mid text-label-sm font-mono uppercase">
                        {clusterLabel(row.cluster)}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        <DataValue value={formatK(row.rangeMin)} className="text-data-sm" />
                      </td>
                      <td className="py-2 pr-4 text-right">
                        <DataValue value={formatK(row.median)} className="text-data-sm font-medium" />
                      </td>
                      <td className="py-2 pr-4 text-right">
                        <DataValue value={formatK(row.rangeMax)} className="text-data-sm" />
                      </td>
                      <td className="py-2 text-right">
                        <DataValue value={formatK(row.spread)} className="text-data-sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <HairlineRule />

        {/* Footer link to methodology */}
        <section className="py-10 md:py-14 text-center">
          <p className="text-body-sm text-mid">
            All benchmarks computed from cached snapshot data.{" "}
            <Link
              href="/methodology"
              className="font-mono text-ink underline underline-offset-2 hover:text-mid transition-colors"
            >
              See how we calculate &rarr;
            </Link>
          </p>
        </section>
      </main>

      <Footer lastUpdated={lastUpdated} />
    </div>
  );
}
