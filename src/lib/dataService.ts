import type { JobHealthSnapshot, JobTitle, JobCluster } from "@/types";
import { TRACKED_JOB_TITLES } from "@/data/jobTitles";
import { mockSnapshots } from "@/data/mockSnapshots";

export function getSnapshot(slug: string): JobHealthSnapshot | null {
  return mockSnapshots[slug] ?? null;
}

export function getAllTitles(): JobTitle[] {
  return TRACKED_JOB_TITLES;
}

export function getClusterTitles(cluster: JobCluster): JobTitle[] {
  return TRACKED_JOB_TITLES.filter((t) => t.cluster === cluster);
}

export function getAvailableSlugs(): string[] {
  return Object.keys(mockSnapshots);
}
