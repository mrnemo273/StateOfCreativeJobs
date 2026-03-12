import { NextResponse } from "next/server";
import { getRoleEnrichment } from "@/lib/enrichmentData.server";

export const revalidate = 86400;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const data = getRoleEnrichment(slug);
  if (!data) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(data);
}
