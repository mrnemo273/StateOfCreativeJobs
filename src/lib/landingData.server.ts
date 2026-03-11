import { getAllSnapshots } from "./dataService.server";
import { CACHED_ROLE_SUMMARIES } from "./cachedLandingData";
import type { RoleSummary } from "./landingData";
import type { JobHealthSnapshot } from "@/types";

function snapshotToSummary(s: JobHealthSnapshot): RoleSummary {
  return {
    title: s.title,
    slug: s.slug,
    cluster: s.cluster,
    openingsCount: s.demand.openingsCount,
    yoyChange: s.demand.yoyChange,
    medianSalary: s.salary.medianUSD,
    aiScore: s.aiImpact.score,
    aiLabel: s.aiImpact.scoreLabel,
    sparkline: s.demand.openingsTrend.slice(-6).map((p) => p.value),
    lastUpdated: s.lastUpdated,
  };
}

/** Returns cached summaries if available, otherwise builds from snapshot JSON files. */
export function getRoleSummaries(): RoleSummary[] {
  if (CACHED_ROLE_SUMMARIES.length > 0) {
    return CACHED_ROLE_SUMMARIES;
  }
  return getAllSnapshots().map(snapshotToSummary);
}
