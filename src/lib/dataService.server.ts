import type { JobHealthSnapshot } from "@/types";
import { TRACKED_JOB_TITLES } from "@/data/jobTitles";
import { mockSnapshots } from "@/data/mockSnapshots";
import fs from "fs";
import path from "path";

/** Read a cached JSON snapshot from src/data/snapshots/. Falls back to mock. */
export function getCachedSnapshot(slug: string): JobHealthSnapshot | null {
  try {
    const snapshotPath = path.join(
      process.cwd(),
      "src",
      "data",
      "snapshots",
      `${slug}.json`,
    );
    if (fs.existsSync(snapshotPath)) {
      const raw = fs.readFileSync(snapshotPath, "utf-8");
      return JSON.parse(raw) as JobHealthSnapshot;
    }
  } catch {
    // fall through to mock
  }
  return mockSnapshots[slug] ?? null;
}

/** Load all snapshots (cached JSON preferred, mock fallback). */
export function getAllSnapshots(): JobHealthSnapshot[] {
  return TRACKED_JOB_TITLES.map((t) => getCachedSnapshot(t.slug)).filter(
    Boolean,
  ) as JobHealthSnapshot[];
}
