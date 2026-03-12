// src/lib/enrichmentData.ts

import type { TrendPoint } from "@/types";

// ─── ACS (Census) ───────────────────────────────────────────────

export interface ACSMetroWage {
  metro: string;           // e.g. "San Francisco-Oakland-Berkeley, CA"
  medianUSD: number;
  sampleSize: number;
}

export interface ACSIncomeDistribution {
  p25: number;
  p50: number;             // should match or closely track BLS median
  p75: number;
  p90: number;
}

export interface ACSDemographics {
  totalEmployed: number;
  selfEmployedPct: number; // 0–100
  incomeDistribution: ACSIncomeDistribution;
  topMetros: ACSMetroWage[];  // top 5 by median wage
}

// ─── NEA (Artists in the Workforce) ─────────────────────────────

export interface NEASupplyContext {
  blsCount: number;               // visible workforce (primary-job classified)
  moonlightingCount: number;      // creatives whose primary job is elsewhere
  trueSupplyCount: number;        // blsCount + moonlightingCount
  supplyMultiplier: number;       // trueSupplyCount / blsCount (expect ~2.7)
  moonlightingSharePct: number;   // moonlightingCount / trueSupplyCount * 100
  reportYear: number;             // year the NEA data was published
}

// ─── Upwork (Freelance Forward) ─────────────────────────────────

export interface UpworkSplitPoint {
  year: number;                   // e.g. 2018
  staffPct: number;               // W-2 share, 0–100
  freelancePct: number;           // contract share, 0–100 (staffPct + freelancePct = 100)
}

export interface UpworkWageGap {
  staffMedianUSD: number;
  freelanceMedianUSD: number;
  gapPct: number;                 // (staff - freelance) / staff * 100, positive = staff pays more
}

export interface UpworkEmploymentStructure {
  splitTrend: UpworkSplitPoint[]; // annual snapshots, 2018–2024
  currentSplit: UpworkSplitPoint; // most recent year
  wageGap: UpworkWageGap;
  reportYear: number;
}

// ─── FRED (Federal Reserve) ─────────────────────────────────────

export interface FREDRecessionBand {
  start: string;                  // ISO date, e.g. "2020-02"
  end: string;                    // ISO date, e.g. "2020-04"
  label: string;                  // e.g. "COVID-19 Recession"
}

export interface FREDMacroContext {
  knowledgeWorkIndex: TrendPoint[];     // monthly, rebased to 100 at start
  recessionBands: FREDRecessionBand[];  // NBER recession dates
  currentIndexValue: number;            // latest value
  indexChangeYoY: number;               // YoY % change of the index
  seriesId: string;                     // FRED series used, e.g. "CES5000000001"
}

// ─── Composite Types ────────────────────────────────────────────

/** Per-role enrichment: plugs into existing role page sections. */
export interface RoleEnrichment {
  slug: string;
  acs: ACSDemographics | null;
  nea: NEASupplyContext | null;
  upwork: UpworkEmploymentStructure | null;
  // FRED is market-level, not role-level — lives in MarketEnrichment
}

/** Market-level enrichment data (FRED, aggregate NEA, aggregate Upwork). */
export interface MarketEnrichment {
  fred: FREDMacroContext | null;
  aggregateNEA: {
    totalBLSCount: number;
    totalTrueSupply: number;
    overallMultiplier: number;
  };
  aggregateUpwork: {
    avgFreelancePct: number;
    splitTrend: UpworkSplitPoint[];  // market-wide average across all 20 roles
  };
  generatedAt: string;              // ISO timestamp
}

// ─── Verdict Logic ──────────────────────────────────────────────

export type RoleVerdict = "Contracting" | "Holding" | "Rising";

/**
 * Derive a 3-signal verdict from the existing snapshot + enrichment.
 * Rules:
 *   - demand.yoyChange < -10  → Contracting
 *   - demand.yoyChange > +10  → Rising
 *   - else                    → Holding
 *
 * The verdict also considers FRED macro context when available:
 *   - If role is contracting AND FRED index is also down → "Market-wide contraction"
 *   - If role is contracting BUT FRED index is flat/up → "Role-specific contraction"
 */
export function deriveVerdict(
  yoyChange: number,
  fredIndexChangeYoY?: number,
): { verdict: RoleVerdict; isMarketWide: boolean | null } {
  let verdict: RoleVerdict;
  if (yoyChange < -10) verdict = "Contracting";
  else if (yoyChange > 10) verdict = "Rising";
  else verdict = "Holding";

  let isMarketWide: boolean | null = null;
  if (fredIndexChangeYoY != null && verdict === "Contracting") {
    isMarketWide = fredIndexChangeYoY < -5;
  }

  return { verdict, isMarketWide };
}

// ─── Salary Verdict ────────────────────────────────────────────

export type SalaryVerdict = "Declining" | "Flat" | "Growing";

export function deriveSalaryVerdict(yoyChange: number): SalaryVerdict {
  if (yoyChange < -3) return "Declining";
  if (yoyChange > 3) return "Growing";
  return "Flat";
}

// ─── AI Verdict ────────────────────────────────────────────────

export type AIVerdict = "Low Risk" | "Moderate" | "Elevated" | "High Risk";

export function deriveAIVerdict(score: number): AIVerdict {
  if (score <= 25) return "Low Risk";
  if (score <= 50) return "Moderate";
  if (score <= 75) return "Elevated";
  return "High Risk";
}
