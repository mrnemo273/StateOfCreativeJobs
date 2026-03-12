import { NextResponse } from "next/server";
import { getMarketEnrichment } from "@/lib/enrichmentData.server";

export const revalidate = 86400;

export async function GET() {
  const data = getMarketEnrichment();
  if (!data) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(data);
}
