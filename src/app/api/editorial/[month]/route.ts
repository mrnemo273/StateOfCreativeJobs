import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _req: Request,
  { params }: { params: { month: string } },
) {
  const { month } = params;

  // Validate format YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: "Invalid month format. Use YYYY-MM." },
      { status: 400 },
    );
  }

  const editorialPath = path.join(
    process.cwd(),
    "src",
    "data",
    "editorials",
    `${month}.json`,
  );

  try {
    if (!fs.existsSync(editorialPath)) {
      return NextResponse.json(
        { error: "Editorial not found for this month." },
        { status: 404 },
      );
    }

    const raw = fs.readFileSync(editorialPath, "utf-8");
    const editorial = JSON.parse(raw);
    return NextResponse.json(editorial);
  } catch {
    return NextResponse.json(
      { error: "Failed to read editorial." },
      { status: 500 },
    );
  }
}
