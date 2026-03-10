import { NextResponse } from "next/server";
import { getRoleIntelligence } from "@/lib/apis/roleIntelligence";
import { getCachedSnapshot, getAllSnapshots } from "@/lib/dataService.server";
import { TRACKED_JOB_TITLES } from "@/data/jobTitles";
import fs from "fs";
import path from "path";

export const revalidate = 86400; // ISR: revalidate every 24 hours

const EMPTY_RESPONSE = { outlook: null, skillPivots: [], comparableRoles: [] };

function getCachedIntelligence(slug: string) {
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "intelligence",
      `${slug}.json`,
    );
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch {
    // fall through
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const validSlugs = TRACKED_JOB_TITLES.map((t) => t.slug);
  if (!validSlugs.includes(slug)) {
    return NextResponse.json(EMPTY_RESPONSE, { status: 404 });
  }

  const url = new URL(request.url);
  const isLive = url.searchParams.get("live") === "true";

  // Serve from cache unless ?live=true is passed
  if (!isLive) {
    const cached = getCachedIntelligence(slug);
    if (cached) {
      return NextResponse.json(cached);
    }
  }

  try {
    const snapshot = getCachedSnapshot(slug);
    if (!snapshot) {
      return NextResponse.json(EMPTY_RESPONSE, { status: 404 });
    }

    const allSnapshots = getAllSnapshots();
    const intelligence = await getRoleIntelligence(snapshot, allSnapshots);
    return NextResponse.json(intelligence);
  } catch (error) {
    console.error("Role intelligence error:", error);
    // If live call fails, try serving stale cache
    const cached = getCachedIntelligence(slug);
    if (cached) {
      return NextResponse.json(cached);
    }
    return NextResponse.json(EMPTY_RESPONSE, { status: 500 });
  }
}
