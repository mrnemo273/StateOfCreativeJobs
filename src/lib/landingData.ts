import type { JobCluster } from "@/types";

export type RoleSummary = {
  title: string;
  slug: string;
  cluster: JobCluster;
  openingsCount: number;
  yoyChange: number;
  medianSalary: number;
  aiScore: number;
  aiLabel: "Low" | "Moderate" | "Elevated" | "High";
  sparkline: number[];
  lastUpdated: string;
};

export const ALL_SLUGS = [
  "creative-director",
  "design-director",
  "head-of-design",
  "vp-of-design",
  "cco",
  "senior-product-designer",
  "ux-designer",
  "product-designer",
  "ux-researcher",
  "design-systems-designer",
  "brand-designer",
  "graphic-designer",
  "visual-designer",
  "art-director",
  "motion-designer",
  "copywriter",
  "content-strategist",
  "ux-writer",
  "creative-copywriter",
  "content-designer",
];

export async function fetchAllRoleSummaries(): Promise<RoleSummary[]> {
  const results = await Promise.all(
    ALL_SLUGS.map((slug) =>
      fetch(`/api/snapshot/${slug}`)
        .then((r) => r.json())
        .then((d) => ({
          title: d.title,
          slug: d.slug,
          cluster: d.cluster,
          openingsCount: d.demand.openingsCount,
          yoyChange: d.demand.yoyChange,
          medianSalary: d.salary.medianUSD,
          aiScore: d.aiImpact.score,
          aiLabel: d.aiImpact.scoreLabel,
          sparkline: d.demand.openingsTrend
            .slice(-6)
            .map((p: { value: number }) => p.value),
          lastUpdated: d.lastUpdated,
        })),
    ),
  );
  return results;
}

export function computeMarketConditions(roles: RoleSummary[]) {
  const totalOpenings = roles.reduce((sum, r) => sum + r.openingsCount, 0);
  const avgAiScore = Math.round(
    roles.reduce((sum, r) => sum + r.aiScore, 0) / roles.length,
  );
  const inDecline = roles.filter((r) => r.yoyChange < 0).length;
  const highestRisk = roles.reduce(
    (max, r) => (r.aiScore > max.aiScore ? r : max),
    roles[0],
  );
  const growingRoles = roles.filter((r) => r.yoyChange > 0);
  const fastestGrowing = growingRoles.length > 0
    ? growingRoles.reduce(
        (max, r) => (r.yoyChange > max.yoyChange ? r : max),
        growingRoles[0],
      )
    : null;
  const mostRecent = roles
    .map((r) => r.lastUpdated)
    .sort()
    .reverse()[0];

  return {
    totalOpenings,
    avgAiScore,
    inDecline,
    highestRisk,
    fastestGrowing,
    mostRecent,
  };
}
