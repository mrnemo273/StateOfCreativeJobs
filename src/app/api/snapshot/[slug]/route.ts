import { NextResponse } from "next/server";
import { buildSnapshot } from "@/lib/buildSnapshot";
import { TRACKED_JOB_TITLES } from "@/data/jobTitles";

export const revalidate = 0; // temporarily disable cache to pick up new env vars

export async function GET(
  _request: Request,
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

  const snapshot = await buildSnapshot(slug);

  if (!snapshot) {
    return NextResponse.json(
      { error: `No data available for "${slug}"` },
      { status: 404 },
    );
  }

  return NextResponse.json(snapshot);
}
