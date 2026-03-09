import { NextResponse } from "next/server";
import { buildSnapshot } from "@/lib/buildSnapshot";
import { TRACKED_JOB_TITLES } from "@/data/jobTitles";
import fs from "fs";
import path from "path";

export const revalidate = 86400; // ISR: revalidate every 24 hours

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const validSlugs = TRACKED_JOB_TITLES.map((t) => t.slug);
  if (!validSlugs.includes(slug)) {
    return NextResponse.json(
      { error: `Unknown job slug: "${slug}"` },
      { status: 404 },
    );
  }

  // Check if caller wants live API data (used by the refresh script)
  const url = new URL(request.url);
  const wantsLive = url.searchParams.get("live") === "true";
  const refreshToken = request.headers.get("x-refresh-token");
  const forceLive =
    wantsLive && refreshToken === process.env.REFRESH_SECRET;

  // Serve from pre-built snapshot cache unless forcing live
  if (!forceLive) {
    const cached = readCachedSnapshot(slug);
    if (cached) {
      return NextResponse.json(cached);
    }
  }

  // Live fetch: call all APIs via buildSnapshot
  const snapshot = await buildSnapshot(slug);

  if (!snapshot) {
    return NextResponse.json(
      { error: `No data available for "${slug}"` },
      { status: 404 },
    );
  }

  return NextResponse.json(snapshot);
}

/**
 * Read a pre-cached snapshot JSON file from src/data/snapshots/.
 * Returns the parsed object or null if the file doesn't exist or is invalid.
 */
function readCachedSnapshot(slug: string): Record<string, unknown> | null {
  try {
    const snapshotPath = path.join(
      process.cwd(),
      "src",
      "data",
      "snapshots",
      `${slug}.json`,
    );
    if (!fs.existsSync(snapshotPath)) {
      return null;
    }
    const raw = fs.readFileSync(snapshotPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
