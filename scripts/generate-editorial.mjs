#!/usr/bin/env node

/**
 * generate-editorial.mjs
 *
 * Reads all 20 snapshot files, computes cluster aggregations and top movers,
 * calls Anthropic API with a structured editorial prompt, and saves the result
 * to src/data/editorials/YYYY-MM.json.
 *
 * Usage:
 *   node scripts/generate-editorial.mjs            # generates for current month
 *   node scripts/generate-editorial.mjs 2026-04    # generates for a specific month
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SNAPSHOTS_DIR = path.join(ROOT, "src", "data", "snapshots");
const EDITORIALS_DIR = path.join(ROOT, "src", "data", "editorials");

const CLUSTER_NAMES = {
  "design-leadership": "Design Leadership",
  "product-ux": "Product & UX Design",
  "brand-visual": "Brand & Visual Design",
  "content-copy": "Content & Copy",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getMonthArg() {
  const arg = process.argv[2];
  if (arg && /^\d{4}-\d{2}$/.test(arg)) return arg;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function readAllSnapshots() {
  const files = fs.readdirSync(SNAPSHOTS_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(SNAPSHOTS_DIR, f), "utf-8");
    return JSON.parse(raw);
  });
}

function computeClusterSummaries(snapshots) {
  const clusters = {};
  for (const s of snapshots) {
    const c = s.cluster;
    if (!clusters[c]) clusters[c] = [];
    clusters[c].push(s);
  }

  return Object.entries(clusters).map(([cluster, roles]) => {
    const avgDemandYoY =
      roles.reduce((sum, r) => sum + (r.demand?.yoyChange ?? 0), 0) / roles.length;
    const avgSalaryYoY =
      roles.reduce((sum, r) => sum + (r.salary?.yoyChange ?? 0), 0) / roles.length;
    const avgAIRisk =
      roles.reduce((sum, r) => sum + (r.aiImpact?.score ?? 0), 0) / roles.length;

    // Find biggest mover by absolute demand YoY change
    const biggestMover = roles.reduce((best, r) => {
      const absChange = Math.abs(r.demand?.yoyChange ?? 0);
      const bestAbs = Math.abs(best.demand?.yoyChange ?? 0);
      return absChange > bestAbs ? r : best;
    }, roles[0]);

    return {
      cluster: CLUSTER_NAMES[cluster] || cluster,
      avgDemandYoY: Math.round(avgDemandYoY * 10) / 10,
      avgSalaryYoY: Math.round(avgSalaryYoY * 10) / 10,
      avgAIRisk: Math.round(avgAIRisk),
      biggestMover: {
        role: biggestMover.title,
        metric: "demand YoY",
        change: biggestMover.demand?.yoyChange ?? 0,
      },
    };
  });
}

function computeTopMovers(snapshots) {
  const sorted = [...snapshots].sort(
    (a, b) => Math.abs(b.demand?.yoyChange ?? 0) - Math.abs(a.demand?.yoyChange ?? 0)
  );
  return sorted.slice(0, 6).map((s) => ({
    role: s.title,
    demandYoY: s.demand?.yoyChange ?? 0,
    salaryYoY: s.salary?.yoyChange ?? 0,
    aiRisk: s.aiImpact?.score ?? 0,
    direction: (s.demand?.yoyChange ?? 0) >= 0 ? "improving" : "declining",
  }));
}

function computeMarketConditions(snapshots) {
  const totalOpenings = snapshots.reduce((sum, s) => sum + (s.demand?.openingsCount ?? 0), 0);
  const avgAIRisk = Math.round(
    snapshots.reduce((sum, s) => sum + (s.aiImpact?.score ?? 0), 0) / snapshots.length
  );
  const rolesInDecline = snapshots.filter((s) => (s.demand?.yoyChange ?? 0) < 0).length;
  const highestRisk = snapshots.reduce((max, s) =>
    (s.aiImpact?.score ?? 0) > (max.aiImpact?.score ?? 0) ? s : max
  , snapshots[0]);

  return {
    totalOpenings,
    avgAIRisk,
    rolesInDecline,
    highestRiskRole: highestRisk.title,
  };
}

function getApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try {
    const envFile = fs.readFileSync(path.join(ROOT, ".env.local"), "utf-8");
    const match = envFile.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    return match?.[1]?.trim();
  } catch {
    return undefined;
  }
}

async function generateEditorial(monthKey) {
  const snapshots = readAllSnapshots();
  if (snapshots.length === 0) {
    console.error("No snapshots found. Run the refresh script first.");
    process.exit(1);
  }

  const [yearStr, monthStr] = monthKey.split("-");
  const monthName = `${MONTH_NAMES[parseInt(monthStr, 10) - 1]} ${yearStr}`;

  const clusterSummaries = computeClusterSummaries(snapshots);
  const topMovers = computeTopMovers(snapshots);
  const marketConditions = computeMarketConditions(snapshots);

  const inputData = {
    month: monthName,
    clusterSummaries,
    topMovers,
    marketConditions,
  };

  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not found. Set it in .env.local or environment.");
    process.exit(1);
  }

  // Dynamic import of the Anthropic SDK
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  console.log(`Generating editorial for ${monthName}...`);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: `You are an editorial analyst for a labor market research index covering 20 creative job titles across four clusters: Design Leadership, Product & UX Design, Brand & Visual Design, and Content & Copy.

Write a monthly market editorial in the voice of a sharp, senior industry analyst.
Tone: The Economist meets AIGA Eye on Design — analytical, direct, zero fluff.
Length: 600-900 words.
Structure:
1. A provocative headline (5-8 words, names the pattern)
2. Opening paragraph naming the month's defining trend
3. 2-3 body sections analyzing specific patterns with data citations
4. Closing paragraph with a forward-looking statement

Never use bullet points. Write in prose paragraphs.
Never editorialize about AI being good or bad — present the data and let readers decide.
Reference specific roles and numbers. Don't generalize.
When citing numbers, use precise values from the data (e.g., "-26.7%" not "about 27%").
Separate the headline from the body with a newline. Do not include "Headline:" prefix.`,
    messages: [
      {
        role: "user",
        content: `Write the ${monthName} editorial based on this data:\n\n${JSON.stringify(inputData, null, 2)}`,
      },
    ],
  });

  const fullText =
    response.content[0].type === "text" ? response.content[0].text : "";

  if (!fullText) {
    console.error("No editorial text generated.");
    process.exit(1);
  }

  // Split headline from body (first line is headline)
  const lines = fullText.split("\n").filter((l) => l.trim());
  const headline = lines[0].replace(/^#+\s*/, "").replace(/[*_]/g, "").trim();
  const body = lines.slice(1).join("\n\n").trim();

  const editorial = {
    month: monthKey,
    monthLabel: monthName,
    headline,
    body,
    generatedAt: new Date().toISOString(),
    dataAsOf: snapshots[0]?.lastUpdated ?? monthKey,
  };

  // Ensure directory exists
  if (!fs.existsSync(EDITORIALS_DIR)) {
    fs.mkdirSync(EDITORIALS_DIR, { recursive: true });
  }

  const outPath = path.join(EDITORIALS_DIR, `${monthKey}.json`);
  fs.writeFileSync(outPath, JSON.stringify(editorial, null, 2));
  console.log(`Editorial saved to ${outPath}`);
  console.log(`Headline: ${headline}`);
}

const monthKey = getMonthArg();
generateEditorial(monthKey).catch((err) => {
  console.error("Editorial generation failed:", err.message);
  process.exit(1);
});
