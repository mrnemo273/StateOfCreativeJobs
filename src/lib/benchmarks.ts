import type { JobHealthSnapshot, JobCluster } from "@/types";

/* --- Types --- */

export interface ClusterScorecard {
  cluster: JobCluster;
  clusterLabel: string;
  roleCount: number;
  avgOpenings: number;
  avgYoY: number;
  avgSalary: number;
  avgAiScore: number;
  highestRiskRole: string;
  mostGrowthRole: string;
}

export interface RankedItem {
  title: string;
  slug: string;
  cluster: JobCluster;
  value: number;
}

export interface Outlier {
  title: string;
  slug: string;
  type:
    | "outperforming"
    | "underperforming"
    | "risk-salary-mismatch"
    | "demand-risk-convergence";
  description: string;
}

export interface SalarySpreadRow {
  title: string;
  slug: string;
  cluster: JobCluster;
  rangeMin: number;
  median: number;
  rangeMax: number;
  spread: number;
}

/* --- Cluster labels --- */

const CLUSTER_LABELS: Record<JobCluster, string> = {
  "design-leadership": "Design Leadership",
  "product-ux": "Product & UX",
  "brand-visual": "Brand & Visual",
  "content-copy": "Content & Copy",
};

export function clusterLabel(c: JobCluster): string {
  return CLUSTER_LABELS[c] ?? c;
}

/* --- Computations --- */

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function stdDev(nums: number[]): number {
  if (nums.length === 0) return 0;
  const mean = avg(nums);
  const variance = avg(nums.map((n) => (n - mean) ** 2));
  return Math.sqrt(variance);
}

export function computeClusterAverages(
  snapshots: JobHealthSnapshot[],
): ClusterScorecard[] {
  const clusters = Object.keys(CLUSTER_LABELS) as JobCluster[];

  return clusters.map((cluster) => {
    const roles = snapshots.filter((s) => s.cluster === cluster);
    if (roles.length === 0) {
      return {
        cluster,
        clusterLabel: CLUSTER_LABELS[cluster],
        roleCount: 0,
        avgOpenings: 0,
        avgYoY: 0,
        avgSalary: 0,
        avgAiScore: 0,
        highestRiskRole: "N/A",
        mostGrowthRole: "N/A",
      };
    }

    const highestRisk = roles.reduce((a, b) =>
      a.aiImpact.score > b.aiImpact.score ? a : b,
    );
    const mostGrowth = roles.reduce((a, b) =>
      a.demand.yoyChange > b.demand.yoyChange ? a : b,
    );

    return {
      cluster,
      clusterLabel: CLUSTER_LABELS[cluster],
      roleCount: roles.length,
      avgOpenings: Math.round(avg(roles.map((r) => r.demand.openingsCount))),
      avgYoY: Number(avg(roles.map((r) => r.demand.yoyChange)).toFixed(1)),
      avgSalary: Math.round(avg(roles.map((r) => r.salary.medianUSD))),
      avgAiScore: Math.round(avg(roles.map((r) => r.aiImpact.score))),
      highestRiskRole: highestRisk.title,
      mostGrowthRole: mostGrowth.title,
    };
  });
}

export function computeClusterRankings(
  snapshots: JobHealthSnapshot[],
  metric: "aiScore" | "demandYoY" | "salary",
): RankedItem[] {
  const clusters = computeClusterAverages(snapshots);
  return clusters
    .map((c) => ({
      title: c.clusterLabel,
      slug: c.cluster,
      cluster: c.cluster,
      value:
        metric === "aiScore"
          ? c.avgAiScore
          : metric === "demandYoY"
            ? c.avgYoY
            : c.avgSalary,
    }))
    .sort((a, b) => b.value - a.value);
}

export function computeOutliers(
  snapshots: JobHealthSnapshot[],
): Outlier[] {
  const outliers: Outlier[] = [];
  if (snapshots.length < 4) return outliers;

  // Compute market-wide stats
  const allYoY = snapshots.map((s) => s.demand.yoyChange);
  const allSalary = snapshots.map((s) => s.salary.medianUSD);
  const allRisk = snapshots.map((s) => s.aiImpact.score);

  const yoyMean = avg(allYoY);
  const yoyStd = stdDev(allYoY);
  const salaryMean = avg(allSalary);
  const riskMean = avg(allRisk);

  for (const s of snapshots) {
    // Outperforming: demand > 1 std dev above mean
    if (yoyStd > 0 && s.demand.yoyChange > yoyMean + yoyStd) {
      outliers.push({
        title: s.title,
        slug: s.slug,
        type: "outperforming",
        description: `Demand ${s.demand.yoyChange > 0 ? "+" : ""}${s.demand.yoyChange.toFixed(1)}% YoY, well above market average of ${yoyMean.toFixed(1)}%.`,
      });
    }

    // Underperforming: demand > 1 std dev below mean
    if (yoyStd > 0 && s.demand.yoyChange < yoyMean - yoyStd) {
      outliers.push({
        title: s.title,
        slug: s.slug,
        type: "underperforming",
        description: `Demand ${s.demand.yoyChange.toFixed(1)}% YoY, significantly below market average of ${yoyMean.toFixed(1)}%.`,
      });
    }

    // Risk-salary mismatch: high risk but high salary
    if (s.aiImpact.score > riskMean + 10 && s.salary.medianUSD > salaryMean) {
      outliers.push({
        title: s.title,
        slug: s.slug,
        type: "risk-salary-mismatch",
        description: `AI risk score ${s.aiImpact.score} (above avg ${Math.round(riskMean)}) but median salary $${(s.salary.medianUSD / 1000).toFixed(0)}k (above avg $${(salaryMean / 1000).toFixed(0)}k).`,
      });
    }

    // Demand-risk convergence: both demand and AI risk rising
    if (s.demand.yoyChange > 5 && s.aiImpact.score > 50) {
      outliers.push({
        title: s.title,
        slug: s.slug,
        type: "demand-risk-convergence",
        description: `Demand growing (${s.demand.yoyChange > 0 ? "+" : ""}${s.demand.yoyChange.toFixed(1)}% YoY) despite elevated AI risk score of ${s.aiImpact.score}.`,
      });
    }
  }

  return outliers;
}

export function computeSalarySpread(
  snapshots: JobHealthSnapshot[],
): SalarySpreadRow[] {
  return snapshots
    .filter((s) => s.salary.rangeMax > s.salary.rangeMin)
    .map((s) => ({
      title: s.title,
      slug: s.slug,
      cluster: s.cluster,
      rangeMin: s.salary.rangeMin,
      median: s.salary.medianUSD,
      rangeMax: s.salary.rangeMax,
      spread: s.salary.rangeMax - s.salary.rangeMin,
    }))
    .sort((a, b) => b.spread - a.spread);
}
