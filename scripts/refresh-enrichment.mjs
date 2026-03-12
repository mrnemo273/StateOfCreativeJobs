// scripts/refresh-enrichment.mjs
//
// Fetches enrichment data from ACS, NEA, Upwork, FRED and writes
// the static cache file at src/lib/cachedEnrichmentData.ts.
//
// Usage: node scripts/refresh-enrichment.mjs
//
// Environment variables:
//   CENSUS_API_KEY   — Census Bureau API key (free, https://api.census.gov/data/key_signup.html)
//   FRED_API_KEY     — FRED API key (free, https://fred.stlouisfed.org/docs/api/api_key.html)
//
// NEA and Upwork data are not live APIs — they come from published reports.
// This script reads them from a static JSON seed file that is updated
// manually when new reports are published (typically annually).

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SEED_FILE = path.join(ROOT, "src", "data", "enrichment-seed.json");
const OUTPUT_FILE = path.join(ROOT, "src", "lib", "cachedEnrichmentData.ts");

// ─── Config ─────────────────────────────────────────────────────

const CENSUS_API_KEY = process.env.CENSUS_API_KEY || "";
const FRED_API_KEY = process.env.FRED_API_KEY || "";

const SLUGS = [
  "creative-director", "design-director", "head-of-design", "vp-of-design",
  "cco", "senior-product-designer", "ux-designer", "product-designer",
  "ux-researcher", "design-systems-designer", "brand-designer",
  "graphic-designer", "visual-designer", "art-director", "motion-designer",
  "copywriter", "content-strategist", "ux-writer", "creative-copywriter",
  "content-designer",
];

// Map role slugs to ACS occupation codes (S2401 table)
const SLUG_TO_ACS_OCC = {
  "creative-director": "27-1011",
  "design-director": "27-1011",
  "head-of-design": "27-1011",
  "vp-of-design": "27-1011",
  "cco": "27-1011",
  "senior-product-designer": "27-1029",
  "ux-designer": "27-1029",
  "product-designer": "27-1029",
  "ux-researcher": "19-3039",
  "design-systems-designer": "27-1029",
  "brand-designer": "27-1024",
  "graphic-designer": "27-1024",
  "visual-designer": "27-1024",
  "art-director": "27-1011",
  "motion-designer": "27-1014",
  "copywriter": "27-3043",
  "content-strategist": "27-3043",
  "ux-writer": "27-3043",
  "creative-copywriter": "27-3043",
  "content-designer": "27-3043",
};

// ─── ACS Fetch ──────────────────────────────────────────────────

async function fetchACS(occCode) {
  if (!CENSUS_API_KEY) {
    console.warn("  CENSUS_API_KEY not set, skipping ACS");
    return null;
  }

  try {
    const url = new URL("https://api.census.gov/data/2023/acs/acs1/subject");
    url.searchParams.set("get", "S2401_C01_001E,S2401_C03_001E");
    url.searchParams.set("for", "metropolitan statistical area/micropolitan statistical area:*");
    url.searchParams.set("key", CENSUS_API_KEY);

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = await res.json();
    // Parse and return ACSDemographics shape
    // Implementation note: actual parsing depends on ACS response format
    // and requires SOC-code filtering via PUMS microdata
    return null; // placeholder — requires PUMS implementation
  } catch (err) {
    console.error(`  ACS fetch error: ${err.message}`);
    return null;
  }
}

// ─── FRED Fetch ─────────────────────────────────────────────────

async function fetchFRED() {
  if (!FRED_API_KEY) {
    console.warn("  FRED_API_KEY not set, skipping FRED");
    return null;
  }

  try {
    const seriesId = "USINFO";
    const url = new URL("https://api.stlouisfed.org/fred/series/observations");
    url.searchParams.set("series_id", seriesId);
    url.searchParams.set("api_key", FRED_API_KEY);
    url.searchParams.set("file_type", "json");
    url.searchParams.set("observation_start", "2020-01-01");
    url.searchParams.set("frequency", "m");

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const { observations } = await res.json();

    const knowledgeWorkIndex = observations
      .filter((o) => o.value !== ".")
      .map((o) => ({
        date: o.date.slice(0, 7),
        value: parseFloat(o.value),
      }));

    // Rebase to 100 at first observation
    const base = knowledgeWorkIndex[0]?.value || 1;
    const rebased = knowledgeWorkIndex.map((p) => ({
      ...p,
      value: Math.round((p.value / base) * 1000) / 10,
    }));

    const latest = rebased[rebased.length - 1]?.value ?? 100;
    const yearAgo = rebased[rebased.length - 13]?.value ?? 100;
    const indexChangeYoY = ((latest - yearAgo) / yearAgo) * 100;

    // NBER recession dates (hardcoded — these change rarely)
    const recessionBands = [
      { start: "2020-02", end: "2020-04", label: "COVID-19 Recession" },
    ];

    return {
      knowledgeWorkIndex: rebased,
      recessionBands,
      currentIndexValue: latest,
      indexChangeYoY: Math.round(indexChangeYoY * 10) / 10,
      seriesId,
    };
  } catch (err) {
    console.error(`  FRED fetch error: ${err.message}`);
    return null;
  }
}

// ─── NEA + Upwork (from seed file) ─────────────────────────────

function loadSeedData() {
  try {
    const raw = fs.readFileSync(SEED_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    console.warn("  No enrichment-seed.json found, skipping NEA/Upwork");
    return { nea: {}, upwork: {} };
  }
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  console.log("=== Phase 4: Enrichment Data Refresh ===\n");

  const seed = loadSeedData();
  const fredData = await fetchFRED();

  const roleEnrichments = {};
  let totalBLS = 0;
  let totalTrue = 0;
  let totalFreelancePct = 0;
  let roleCount = 0;

  for (const slug of SLUGS) {
    console.log(`Enrichment: ${slug}...`);

    const neaForRole = seed.nea?.[slug] ?? null;
    const upworkForRole = seed.upwork?.[slug] ?? null;
    const acsForRole = await fetchACS(SLUG_TO_ACS_OCC[slug]);

    roleEnrichments[slug] = {
      slug,
      acs: acsForRole,
      nea: neaForRole,
      upwork: upworkForRole,
    };

    if (neaForRole) {
      totalBLS += neaForRole.blsCount;
      totalTrue += neaForRole.trueSupplyCount;
    }
    if (upworkForRole) {
      totalFreelancePct += upworkForRole.currentSplit.freelancePct;
      roleCount++;
    }
  }

  // Build market enrichment
  const marketEnrichment = {
    fred: fredData,
    aggregateNEA: {
      totalBLSCount: totalBLS,
      totalTrueSupply: totalTrue,
      overallMultiplier: totalBLS > 0 ? Math.round((totalTrue / totalBLS) * 10) / 10 : 1,
    },
    aggregateUpwork: {
      avgFreelancePct: roleCount > 0 ? Math.round((totalFreelancePct / roleCount) * 10) / 10 : 0,
      splitTrend: seed.upwork?._marketTrend ?? [],
    },
    generatedAt: new Date().toISOString(),
  };

  // Write cache file
  const ts = `// src/lib/cachedEnrichmentData.ts
//
// AUTO-GENERATED by scripts/refresh-enrichment.mjs
// Last generated: ${new Date().toISOString()}
// Do not edit manually.

import type { RoleEnrichment, MarketEnrichment } from "./enrichmentData";

export const ENRICHMENT_CACHE_TIMESTAMP = "${new Date().toISOString()}";

export const CACHED_ROLE_ENRICHMENTS: Record<string, RoleEnrichment> = ${JSON.stringify(roleEnrichments, null, 2)};

export const CACHED_MARKET_ENRICHMENT: MarketEnrichment | null = ${JSON.stringify(marketEnrichment, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, ts, "utf-8");
  console.log(`\nEnrichment cache written to ${OUTPUT_FILE}`);
  console.log(`Roles: ${Object.keys(roleEnrichments).length}`);
  console.log(`FRED: ${fredData ? "OK" : "SKIPPED"}`);
  console.log(`Aggregate NEA: ${totalBLS > 0 ? "OK" : "NO DATA"}`);
}

main().catch((err) => {
  console.error("Enrichment refresh failed:", err);
  process.exit(1);
});
