# Phase 4 — Enrichment Layers

> ACS · NEA · Upwork · FRED overlaid on the existing BLS spine

---

## Design Principle

**Don't add data modules — answer "so what?"**

Every enrichment layer plugs into an existing section to explain something the current data raises but doesn't resolve. The current site tells you *what happened*; Phase 4 tells you *why it matters*.

Four sources, four questions answered:

| Source | Question it answers |
|---|---|
| **ACS** (Census S2401) | *Who holds these jobs?* Metro-level wage breakdown, income distribution P25–P90, self-employment rates |
| **NEA** (Artists in the Workforce) | *How big is the real supply?* Moonlighting creatives whose primary job isn't classified as creative — true supply is ~2.7× larger than BLS shows |
| **Upwork** (Freelance Forward) | *Staff or freelance?* Employment structure split over time, wage gap between W-2 and contract roles by discipline |
| **FRED** (Federal Reserve Economic Data) | *Is this role-specific or economy-wide?* Recession bands, knowledge-work employment index, macro context |

**Styling note:** This spec excludes all CSS/styling decisions. The existing design system (`DESIGN_SYSTEM.md`) handles visual treatment. Components described here use the same tokens, grid, and typographic rules as the rest of the site.

---

## Step 1 — Type Definitions

**File:** `src/lib/enrichmentData.ts`

This file defines the shape of all enrichment data. No fetch logic — just types and helpers.

```typescript
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

/** Market-level enrichment: powers the Market View tab. */
export interface MarketEnrichment {
  fred: FREDMacroContext;
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
```

---

## Step 2 — Static Cache File

**File:** `src/lib/cachedEnrichmentData.ts`

Same pattern as `cachedLandingData.ts` — a TypeScript file that the refresh script overwrites weekly with pre-built data. Components import from here at build time.

```typescript
// src/lib/cachedEnrichmentData.ts
//
// AUTO-GENERATED by scripts/refresh-snapshots.sh
// Do not edit manually. Re-run the refresh script to update.

import type { RoleEnrichment, MarketEnrichment } from "./enrichmentData";

export const ENRICHMENT_CACHE_TIMESTAMP = "";

/** Per-role enrichment data, keyed by slug. */
export const CACHED_ROLE_ENRICHMENTS: Record<string, RoleEnrichment> = {};

/** Market-level enrichment data (FRED, aggregate NEA, aggregate Upwork). */
export const CACHED_MARKET_ENRICHMENT: MarketEnrichment | null = null;
```

**Data access pattern:**

```typescript
// src/lib/enrichmentData.server.ts

import {
  CACHED_ROLE_ENRICHMENTS,
  CACHED_MARKET_ENRICHMENT,
} from "./cachedEnrichmentData";
import type { RoleEnrichment, MarketEnrichment } from "./enrichmentData";

export function getRoleEnrichment(slug: string): RoleEnrichment | null {
  return CACHED_ROLE_ENRICHMENTS[slug] ?? null;
}

export function getMarketEnrichment(): MarketEnrichment | null {
  return CACHED_MARKET_ENRICHMENT;
}
```

---

## Step 3 — Role Page Section Updates

These are surgical additions to existing sections, not new sections. Each enrichment plugs into the place where the current data already raises the question it answers.

### 3a. Role Header — 3-Signal Verdict

**What changes:** Replace the current 4-up stat cards (`HealthScoreSummary`) with a verdict-first header.

**Current state:** `HealthScoreSummary.tsx` renders 4 `StatCard` components (Demand, Salary, AI Risk, Sentiment).

**New state:** Keep the 4 stat cards but prepend a verdict banner above them.

**Component:** `src/components/RoleVerdict.tsx`

```typescript
// src/components/RoleVerdict.tsx
"use client";

import type { RoleEnrichment, MarketEnrichment } from "@/lib/enrichmentData";
import { deriveVerdict } from "@/lib/enrichmentData";

interface Props {
  yoyChange: number;
  fredIndexChangeYoY?: number;
}

export default function RoleVerdict({ yoyChange, fredIndexChangeYoY }: Props) {
  const { verdict, isMarketWide } = deriveVerdict(yoyChange, fredIndexChangeYoY);

  // Signal color mapping (uses existing design system tokens)
  const colorMap = {
    Contracting: "var(--color-down)",
    Holding: "var(--color-neutral)",
    Rising: "var(--color-up)",
  };

  const bgMap = {
    Contracting: "var(--color-down-bg)",
    Holding: "var(--color-neutral-bg)",
    Rising: "var(--color-up-bg)",
  };

  return (
    <div
      className="py-4 px-6 mb-6 flex items-baseline gap-4 flex-wrap"
      style={{ backgroundColor: bgMap[verdict] }}
    >
      <span
        className="font-mono text-data-lg uppercase tracking-widest"
        style={{ color: colorMap[verdict] }}
      >
        {verdict}
      </span>

      {isMarketWide !== null && verdict === "Contracting" && (
        <span className="text-body-sm text-mid">
          {isMarketWide
            ? "Tracks broader knowledge-work contraction (FRED)"
            : "Role-specific — broader market is stable"}
        </span>
      )}
    </div>
  );
}
```

**Integration in `page.tsx`:** Insert `<RoleVerdict>` between the hero title `<div>` and the `<HealthScoreSummary>` component:

```tsx
{/* Verdict banner — Phase 4 */}
<div className="col-span-12">
  <RoleVerdict
    yoyChange={snapshot.demand.yoyChange}
    fredIndexChangeYoY={marketEnrichment?.fred.indexChangeYoY}
  />
</div>

{/* Health Score Summary — 4-up stat cards (unchanged) */}
<div className="col-span-12 mb-2">
  <HealthScoreSummary snapshot={snapshot} />
</div>
```

---

### 3b. Demand Section — FRED Economy Overlay

**What changes:** Add a second, muted line to the existing demand trend chart showing the FRED knowledge-work employment index. Add a callout below the chart explaining whether the contraction is role-specific or economy-wide.

**Component update:** `src/components/DemandSection.tsx`

Add a new prop:

```typescript
type Props = {
  snapshot: JobHealthSnapshot;
  fredMacro?: FREDMacroContext | null;  // Phase 4 addition
};
```

**Chart overlay logic:**

The existing `<TrendChart>` renders the role's demand trend. To overlay the FRED line, `TrendChart` needs a new optional `overlayData` prop — an array of `TrendPoint[]` rendered as a second line with a dashed stroke and `--color-mid` color.

If this is too invasive for `TrendChart`, an alternative: render a `<FREDOverlayCallout>` below the chart instead of modifying the chart itself. The callout would be a small inline block:

```tsx
{/* FRED macro context callout — Phase 4 */}
{fredMacro && (
  <div className="mt-4 border-l-2 pl-4" style={{ borderColor: "var(--color-mid)" }}>
    <span className="text-label-sm text-mid uppercase tracking-widest block mb-1">
      Economy Context
    </span>
    <p className="text-body-sm text-dark max-w-[65ch]">
      {fredMacro.indexChangeYoY < -5
        ? `Knowledge-work employment is also down ${Math.abs(fredMacro.indexChangeYoY).toFixed(1)}% YoY (FRED ${fredMacro.seriesId}). This role's decline tracks broader market contraction.`
        : fredMacro.indexChangeYoY > 5
          ? `Knowledge-work employment is up ${fredMacro.indexChangeYoY.toFixed(1)}% YoY, but this role is contracting — suggesting role-specific displacement, not an economic downturn.`
          : `Knowledge-work employment is flat (${fredMacro.indexChangeYoY > 0 ? "+" : ""}${fredMacro.indexChangeYoY.toFixed(1)}% YoY). This role's trend appears role-specific.`
      }
    </p>
  </div>
)}
```

**Recommendation:** Start with the callout approach. The chart overlay can be added later as a `TrendChart` enhancement without blocking the enrichment release.

---

### 3c. Salary Section — ACS Metro Breakdown + Upwork Staff vs. Freelance

**What changes:** Two additions below the existing salary range bar:

1. **ACS metro breakdown** — top 5 metros by median wage, rendered as a simple horizontal bar list
2. **Upwork wage gap** — a single comparison showing staff median vs. freelance median

**Component update:** `src/components/SalarySection.tsx`

Add new props:

```typescript
type Props = {
  snapshot: JobHealthSnapshot;
  acsDemographics?: ACSDemographics | null;  // Phase 4
  upworkStructure?: UpworkEmploymentStructure | null;  // Phase 4
};
```

**ACS metro breakdown** (appended inside the right column `<div>`, after Top Paying Industries):

```tsx
{/* ACS Metro Wages — Phase 4 */}
{acsDemographics && acsDemographics.topMetros.length > 0 && (
  <div>
    <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
      Top Metros by Median Wage
    </span>
    <span className="text-label-sm text-mid block mb-3">
      Source: Census ACS S2401
    </span>
    <div className="space-y-2">
      {acsDemographics.topMetros.map((metro) => (
        <div key={metro.metro} className="flex items-center gap-3">
          <span className="text-body-sm text-dark w-48 shrink-0 truncate">
            {metro.metro}
          </span>
          <div className="flex-1 h-2 bg-faint relative">
            <div
              className="absolute top-0 left-0 h-full bg-ink"
              style={{
                width: `${(metro.medianUSD / acsDemographics.topMetros[0].medianUSD) * 100}%`,
              }}
            />
          </div>
          <span className="font-mono text-label-sm text-ink w-16 text-right">
            ${(metro.medianUSD / 1000).toFixed(0)}k
          </span>
        </div>
      ))}
    </div>
  </div>
)}
```

**Upwork staff vs. freelance wage gap** (appended after the ACS block):

```tsx
{/* Upwork Wage Gap — Phase 4 */}
{upworkStructure && (
  <div>
    <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
      Staff vs. Freelance Pay
    </span>
    <span className="text-label-sm text-mid block mb-3">
      Source: Upwork Freelance Forward {upworkStructure.reportYear}
    </span>
    <div className="flex gap-6">
      <div>
        <span className="text-label-sm text-mid block">W-2 Staff</span>
        <span className="font-mono text-data-md text-ink">
          ${(upworkStructure.wageGap.staffMedianUSD / 1000).toFixed(0)}k
        </span>
      </div>
      <div>
        <span className="text-label-sm text-mid block">Freelance</span>
        <span className="font-mono text-data-md text-ink">
          ${(upworkStructure.wageGap.freelanceMedianUSD / 1000).toFixed(0)}k
        </span>
      </div>
      <div>
        <span className="text-label-sm text-mid block">Gap</span>
        <span
          className="font-mono text-data-md"
          style={{
            color: upworkStructure.wageGap.gapPct > 0
              ? "var(--color-down)"
              : "var(--color-up)",
          }}
        >
          {upworkStructure.wageGap.gapPct > 0 ? "-" : "+"}
          {Math.abs(upworkStructure.wageGap.gapPct).toFixed(0)}%
        </span>
      </div>
    </div>
  </div>
)}
```

**ACS income distribution** (P25–P90) — add to the left column below the chart, as a compact range annotation:

```tsx
{/* ACS Income Distribution — Phase 4 */}
{acsDemographics && (
  <div className="mt-4 flex gap-6 items-baseline">
    <span className="text-label-sm text-mid uppercase tracking-widest">
      Income Range (ACS)
    </span>
    {["p25", "p50", "p75", "p90"].map((pct) => (
      <div key={pct} className="text-center">
        <span className="text-label-sm text-mid block">{pct.toUpperCase()}</span>
        <span className="font-mono text-data-sm text-ink">
          ${((acsDemographics.incomeDistribution as any)[pct] / 1000).toFixed(0)}k
        </span>
      </div>
    ))}
  </div>
)}
```

---

### 3d. AI Impact Section — NEA Supply Context Callout

**What changes:** Add a callout below the AI score explainer that reframes the risk score in context of true workforce supply.

**Why:** An AI risk score of 65 means something very different if the true supply of people doing this work is 2.7× larger than BLS says. More people exposed = bigger aggregate impact, even if the per-person risk seems moderate.

**Component update:** `src/components/AIImpactSection.tsx`

Add a new prop:

```typescript
type Props = {
  snapshot: JobHealthSnapshot;
  neaSupply?: NEASupplyContext | null;  // Phase 4
};
```

**Callout** (appended after the existing `scoreExplainer` paragraph):

```tsx
{/* NEA Supply Context — Phase 4 */}
{neaSupply && (
  <div
    className="mt-4 p-4"
    style={{ backgroundColor: "var(--color-faint)" }}
  >
    <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
      Hidden Workforce
    </span>
    <p className="text-body-sm text-dark max-w-[65ch]">
      BLS classifies{" "}
      <span className="font-mono">{neaSupply.blsCount.toLocaleString()}</span>{" "}
      workers as {snapshot.title}s. But NEA estimates an additional{" "}
      <span className="font-mono">{neaSupply.moonlightingCount.toLocaleString()}</span>{" "}
      perform this work as a secondary activity — making the true supply{" "}
      <span className="font-mono">{neaSupply.supplyMultiplier.toFixed(1)}×</span>{" "}
      larger than official counts. An AI risk score of{" "}
      <span className="font-mono">{snapshot.aiImpact.score}</span> affects{" "}
      <span className="font-mono">{neaSupply.trueSupplyCount.toLocaleString()}</span>{" "}
      people, not {neaSupply.blsCount.toLocaleString()}.
    </p>
    <span className="text-label-sm text-mid block mt-2">
      Source: NEA Artists in the Workforce ({neaSupply.reportYear})
    </span>
  </div>
)}
```

---

### 3e. Role Intelligence Section — Synthesized "So What?" Block

**What changes:** Replace the current three-part layout (Outlook + Skill Pivot + Comparable Roles) with a synthesized insight block that cites enrichment sources. The existing Claude-generated outlook and skill pivots remain but are reorganized.

**New structure:**

1. **Three named insight cards** (full-width, stacked):
   - **The Contraction** — demand narrative citing BLS trend + FRED macro context
   - **The Salary Reality** — compensation narrative citing BLS median + ACS distribution + Upwork staff/freelance gap
   - **The Supply Picture** — who's really competing, citing NEA supply multiplier + Upwork freelance share

2. **Enriched strategic recommendations** — the existing 3 skill pivots, but the Claude prompt now includes enrichment data so recommendations can reference metro premiums, freelance transitions, hidden workforce dynamics, etc.

3. **Comparable Roles sidebar** — unchanged, remains in the right column.

**Component:** Update `src/components/RoleIntelligence.tsx`

The component already fetches from `/api/role-intelligence/[slug]`. Extend the API response to include enrichment-derived insights.

**Updated API response shape:**

```typescript
// Extended RoleIntelligenceData (in the component)
interface InsightCard {
  id: "contraction" | "salary-reality" | "supply-picture";
  title: string;       // e.g. "The Contraction"
  body: string;        // 2–4 sentences, cites sources inline
  source: string;      // e.g. "BLS + FRED CES5000000001"
}

interface RoleIntelligenceData {
  outlook: string | null;
  insightCards: InsightCard[];          // Phase 4 addition (3 cards)
  skillPivots: SkillPivotItem[];
  comparableRoles: ComparableRole[];
}
```

**Insight card generation:** In `src/lib/apis/roleIntelligence.ts`, add a third Claude call (or extend the outlook call) that receives the enrichment data and produces the 3 insight cards as structured JSON.

**Prompt for insight cards:**

```
You are a labor market analyst writing for "State of Creative Jobs".
Given the following data about {title}, produce exactly 3 insight cards.

Each card has:
- "id": one of "contraction", "salary-reality", "supply-picture"
- "title": "The Contraction", "The Salary Reality", or "The Supply Picture"
- "body": 2–4 sentences synthesizing the data below. Cite sources inline (e.g. "per ACS S2401", "FRED shows...", "Upwork Freelance Forward reports..."). Be specific with numbers. No hedging.
- "source": short source citation string

Data:
- BLS demand: {openingsCount} openings, {yoyChange}% YoY
- FRED knowledge-work index: {indexChangeYoY}% YoY (series {seriesId})
- BLS median salary: ${medianUSD}
- ACS income distribution: P25=${p25}, P50=${p50}, P75=${p75}, P90=${p90}
- ACS self-employment rate: {selfEmployedPct}%
- Upwork staff median: ${staffMedianUSD}, freelance median: ${freelanceMedianUSD} (gap: {gapPct}%)
- Upwork freelance share: {freelancePct}% (was {historicalFreelancePct}% in 2018)
- NEA visible workforce: {blsCount}, moonlighting: {moonlightingCount}, true supply: {trueSupplyCount} ({supplyMultiplier}× BLS)
- AI risk score: {score}/100 ({scoreLabel})

Return ONLY a JSON array. No markdown, no code fences.
```

**Layout change in `RoleIntelligence.tsx`:**

```tsx
{/* Insight Cards — Phase 4 (replaces plain outlook) */}
{data.insightCards?.length > 0 && (
  <div className="space-y-6">
    {data.insightCards.map((card) => (
      <div key={card.id}>
        <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
          {card.title}
        </span>
        <p className="text-body text-dark leading-relaxed max-w-[65ch]">
          {card.body}
        </p>
        <span className="text-label-sm text-mid block mt-1">
          {card.source}
        </span>
      </div>
    ))}
  </div>
)}

{/* Fall back to plain outlook if no insight cards (backwards compat) */}
{(!data.insightCards || data.insightCards.length === 0) && data.outlook && (
  <div>
    <span className="text-label-sm text-mid uppercase tracking-widest block mb-3">
      Role Outlook
    </span>
    <p className="font-mono text-ink leading-tight max-w-[65ch]"
       style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}>
      {outlookHeadline}
    </p>
    {outlookBody && (
      <p className="text-body text-dark leading-relaxed max-w-[65ch] mt-6">
        {outlookBody}
      </p>
    )}
  </div>
)}
```

---

## Step 4 — Market View Tab

**File:** `src/components/MarketView.tsx`

A new component rendering system-level data. This is the second "tab" on each role page — the first tab is the existing role-specific data, the second is market context.

**Tab switching:** Add a simple two-tab bar at the top of the dashboard content area:

```tsx
// In the role page
const [activeTab, setActiveTab] = useState<"role" | "market">("role");

{/* Tab bar */}
<div className="col-span-12 flex gap-0 border-b border-ink mb-6">
  <button
    onClick={() => setActiveTab("role")}
    className={`font-mono text-label-lg uppercase tracking-widest px-6 py-3 border-b-2 transition-colors duration-75 ${
      activeTab === "role"
        ? "border-accent text-ink"
        : "border-transparent text-mid hover:text-dark"
    }`}
  >
    Role Data
  </button>
  <button
    onClick={() => setActiveTab("market")}
    className={`font-mono text-label-lg uppercase tracking-widest px-6 py-3 border-b-2 transition-colors duration-75 ${
      activeTab === "market"
        ? "border-accent text-ink"
        : "border-transparent text-mid hover:text-dark"
    }`}
  >
    Market View
  </button>
</div>
```

**MarketView component structure:**

```typescript
// src/components/MarketView.tsx
"use client";

import type { MarketEnrichment, NEASupplyContext, UpworkEmploymentStructure } from "@/lib/enrichmentData";
import SectionLabel from "./ui/SectionLabel";
import TrendChart from "./ui/TrendChart";

interface Props {
  market: MarketEnrichment;
  roleNEA?: NEASupplyContext | null;
  roleUpwork?: UpworkEmploymentStructure | null;
  roleTitle: string;
}
```

**Three sections:**

### 4a. Workforce Size — Visible vs. True

Uses aggregate NEA data + the role-specific NEA data.

```tsx
<section>
  <SectionLabel className="mb-6">Workforce Size</SectionLabel>
  <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
    <div className="col-span-12 md:col-span-6">
      <span className="text-label-sm text-mid uppercase tracking-widest block mb-3">
        {roleTitle}
      </span>
      {/* Side-by-side comparison: BLS count vs. true supply */}
      <div className="flex gap-8 items-end">
        <div>
          <span className="text-label-sm text-mid block mb-1">BLS Official</span>
          <span className="font-mono text-data-lg text-ink block">
            {roleNEA?.blsCount.toLocaleString() ?? "—"}
          </span>
        </div>
        <div>
          <span className="text-label-sm text-mid block mb-1">True Supply (NEA)</span>
          <span className="font-mono text-data-lg text-ink block">
            {roleNEA?.trueSupplyCount.toLocaleString() ?? "—"}
          </span>
        </div>
        <div>
          <span className="text-label-sm text-mid block mb-1">Multiplier</span>
          <span className="font-mono text-data-lg text-accent block">
            {roleNEA?.supplyMultiplier.toFixed(1) ?? "—"}×
          </span>
        </div>
      </div>
    </div>
    <div className="col-span-12 md:col-span-6">
      <span className="text-label-sm text-mid uppercase tracking-widest block mb-3">
        All Creative Roles
      </span>
      <div className="flex gap-8 items-end">
        <div>
          <span className="text-label-sm text-mid block mb-1">BLS Total</span>
          <span className="font-mono text-data-lg text-ink block">
            {market.aggregateNEA.totalBLSCount.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-label-sm text-mid block mb-1">True Total</span>
          <span className="font-mono text-data-lg text-ink block">
            {market.aggregateNEA.totalTrueSupply.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-label-sm text-mid block mb-1">Multiplier</span>
          <span className="font-mono text-data-lg text-accent block">
            {market.aggregateNEA.overallMultiplier.toFixed(1)}×
          </span>
        </div>
      </div>
    </div>
  </div>
  <p className="mt-4 text-body-sm text-mid max-w-[65ch]">
    Source: NEA Artists in the Workforce. "True supply" includes workers who
    perform this creative work as a secondary activity but are classified
    under a different primary occupation by BLS.
  </p>
</section>
```

### 4b. Employment Structure Shift — Stacked Area Chart

Shows staff vs. freelance share over time (2018–2024) from Upwork data.

```tsx
<section>
  <SectionLabel className="mb-6">Employment Structure</SectionLabel>
  <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
    <div className="col-span-12 md:col-span-8">
      {/* Stacked area chart: staff % (bottom, --color-ink) + freelance % (top, --color-accent) */}
      {/* Implementation: use Recharts AreaChart with stackId, or a custom SVG */}
      <StackedAreaChart
        data={roleUpwork?.splitTrend ?? market.aggregateUpwork.splitTrend}
        height={280}
      />
    </div>
    <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
      <div>
        <span className="text-label-sm text-mid uppercase tracking-widest block mb-1">
          Current Split
        </span>
        <div className="flex gap-4">
          <div>
            <span className="text-label-sm text-mid block">Staff</span>
            <span className="font-mono text-data-lg text-ink">
              {(roleUpwork?.currentSplit ?? market.aggregateUpwork).staffPct ?? "—"}%
            </span>
          </div>
          <div>
            <span className="text-label-sm text-mid block">Freelance</span>
            <span className="font-mono text-data-lg text-accent">
              {(roleUpwork?.currentSplit ?? market.aggregateUpwork).freelancePct ?? "—"}%
            </span>
          </div>
        </div>
      </div>
      <p className="text-body-sm text-mid">
        Source: Upwork Freelance Forward {roleUpwork?.reportYear ?? "2024"}
      </p>
    </div>
  </div>
</section>
```

**Note:** `StackedAreaChart` is a new component to create. Use Recharts `<AreaChart>` with two `<Area>` components sharing a `stackId`. Follow the chart rules from `DESIGN_SYSTEM.md`: no rounded corners, mono axis labels, horizontal grid lines only.

### 4c. FRED Macro Context — Knowledge-Work Index with Recession Bands

```tsx
<section>
  <SectionLabel className="mb-6">Economic Context</SectionLabel>
  <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
    <div className="col-span-12 md:col-span-8">
      {/* Line chart with recession bands rendered as semi-transparent vertical rectangles */}
      <FREDChart
        indexData={market.fred.knowledgeWorkIndex}
        recessionBands={market.fred.recessionBands}
        height={280}
      />
    </div>
    <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
      <div>
        <span className="text-label-sm text-mid uppercase tracking-widest block mb-1">
          Knowledge-Work Index
        </span>
        <span className="font-mono text-data-lg text-ink block">
          {market.fred.currentIndexValue.toFixed(1)}
        </span>
        <TrendBadge value={market.fred.indexChangeYoY} format="percent" />
        <span className="text-label-sm text-mid ml-2">YoY</span>
      </div>
      <div>
        <span className="text-label-sm text-mid uppercase tracking-widest block mb-2">
          Recession Periods
        </span>
        {market.fred.recessionBands.map((band) => (
          <div key={band.start} className="text-body-sm text-dark mb-1">
            {band.label}: {band.start} — {band.end}
          </div>
        ))}
      </div>
      <p className="text-body-sm text-mid">
        Source: FRED series {market.fred.seriesId}, NBER recession dates
      </p>
    </div>
  </div>
</section>
```

**Note:** `FREDChart` is a new component. Built on `TrendChart` but adds `<ReferenceArea>` elements from Recharts for recession bands, rendered as `--color-faint` filled vertical bands with a small label.

---

## Step 5 — Role Page Wiring

**File:** `src/app/page.tsx` (current) → will become `src/app/role/[slug]/page.tsx` after Phase 3

The role page needs to:

1. Load enrichment data alongside the existing snapshot
2. Pass enrichment slices to the updated section components
3. Handle the Role Data / Market View tab switch

**Data loading** (add to the existing `fetchLiveData` or as a parallel fetch):

```typescript
const [enrichment, setEnrichment] = useState<RoleEnrichment | null>(null);
const [marketEnrichment, setMarketEnrichment] = useState<MarketEnrichment | null>(null);

useEffect(() => {
  // Enrichment data is static (from cache), loaded once
  fetch(`/api/enrichment/${selectedSlug}`)
    .then((r) => r.ok ? r.json() : null)
    .then(setEnrichment)
    .catch(() => setEnrichment(null));

  fetch(`/api/enrichment/market`)
    .then((r) => r.ok ? r.json() : null)
    .then(setMarketEnrichment)
    .catch(() => setMarketEnrichment(null));
}, [selectedSlug]);
```

**New API routes:**

```
src/app/api/enrichment/[slug]/route.ts   → returns CACHED_ROLE_ENRICHMENTS[slug]
src/app/api/enrichment/market/route.ts   → returns CACHED_MARKET_ENRICHMENT
```

Both are simple pass-throughs from the cache, with `revalidate: 86400` (24h ISR):

```typescript
// src/app/api/enrichment/[slug]/route.ts
import { NextResponse } from "next/server";
import { getRoleEnrichment } from "@/lib/enrichmentData.server";

export const revalidate = 86400;

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const data = getRoleEnrichment(params.slug);
  if (!data) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(data);
}
```

**Updated section component props** (summary of all Phase 4 prop additions):

| Component | New Prop | Type | Source |
|---|---|---|---|
| `RoleVerdict` (new) | `yoyChange`, `fredIndexChangeYoY` | `number`, `number?` | snapshot + market enrichment |
| `DemandSection` | `fredMacro` | `FREDMacroContext?` | market enrichment |
| `SalarySection` | `acsDemographics`, `upworkStructure` | `ACSDemographics?`, `UpworkEmploymentStructure?` | role enrichment |
| `AIImpactSection` | `neaSupply` | `NEASupplyContext?` | role enrichment |
| `RoleIntelligence` | no prop change | — | API response extended server-side |
| `MarketView` (new) | `market`, `roleNEA`, `roleUpwork`, `roleTitle` | full types | both enrichments |

**Graceful degradation:** Every enrichment prop is optional (`?`). If enrichment data hasn't been populated yet (cache is empty), all components render exactly as they do today. No enrichment = no enrichment UI. No errors. This means Phase 4 code can be merged before the enrichment data pipeline is running.

---

## Step 6 — Refresh Script Update

**File:** `scripts/refresh-snapshots.sh`

Append a **Phase 4** section after the existing Phase 2 (Intelligence) block. This step:

1. Fetches enrichment data from the external sources (ACS, NEA, Upwork, FRED)
2. Maps results to `RoleEnrichment` and `MarketEnrichment` types
3. Writes the cache to `src/lib/cachedEnrichmentData.ts`

**Why a Node script, not bash curls:** The enrichment data comes from APIs with different auth patterns, pagination, and response formats. A Node script (`scripts/refresh-enrichment.mjs`) handles this more cleanly than bash. The shell script calls it.

### 6a. Enrichment Refresh Script

**File:** `scripts/refresh-enrichment.mjs`

```javascript
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
const SNAPSHOT_DIR = path.join(ROOT, "src", "data", "snapshots");
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
// These are approximate mappings — some roles share codes
const SLUG_TO_ACS_OCC = {
  "creative-director": "27-1011",      // Art Directors
  "design-director": "27-1011",
  "head-of-design": "27-1011",
  "vp-of-design": "27-1011",
  "cco": "27-1011",
  "senior-product-designer": "27-1029", // Designers, All Other
  "ux-designer": "27-1029",
  "product-designer": "27-1029",
  "ux-researcher": "19-3039",          // Psychologists, All Other (closest)
  "design-systems-designer": "27-1029",
  "brand-designer": "27-1024",         // Graphic Designers
  "graphic-designer": "27-1024",
  "visual-designer": "27-1024",
  "art-director": "27-1011",
  "motion-designer": "27-1014",        // Special Effects Artists
  "copywriter": "27-3043",             // Writers and Authors
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
    // Fetch national-level income distribution from ACS PUMS
    // Table S2401: Occupation by Sex and Median Earnings
    const url = new URL("https://api.census.gov/data/2023/acs/acs1/subject");
    url.searchParams.set("get", "S2401_C01_001E,S2401_C03_001E");
    url.searchParams.set("for", "metropolitan statistical area/micropolitan statistical area:*");
    url.searchParams.set("key", CENSUS_API_KEY);
    // Note: Actual implementation needs SOC-code filtering which
    // requires the PUMS microdata API or pre-filtered S2401 rows.
    // This is a simplified illustration.

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = await res.json();
    // Parse and return ACSDemographics shape
    // ... (implementation detail: parse rows, extract top 5 metros, etc.)
    return null; // placeholder — see implementation notes below
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
    // CES5000000001: All Employees, Information sector (proxy for knowledge work)
    const seriesId = "CES5000000001";
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
        date: o.date.slice(0, 7), // "YYYY-MM"
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
```

### 6b. Shell Script Addition

Append to `scripts/refresh-snapshots.sh` after the Phase 2 block:

```bash
# --- Phase 4: Enrichment Data (ACS, NEA, Upwork, FRED) ---
echo ""
echo "=== Refreshing Enrichment Data ==="

if node scripts/refresh-enrichment.mjs; then
  echo "Enrichment data refresh complete"
else
  echo "WARNING: Enrichment data refresh failed (non-fatal)"
  # Enrichment failure is non-fatal — the site works without it
fi
```

### 6c. Enrichment Seed File

**File:** `src/data/enrichment-seed.json`

NEA and Upwork data come from annual published reports, not live APIs. This file is the single source of truth for that data and is updated manually when new reports are released.

**Structure:**

```json
{
  "nea": {
    "creative-director": {
      "blsCount": 97600,
      "moonlightingCount": 165000,
      "trueSupplyCount": 262600,
      "supplyMultiplier": 2.69,
      "moonlightingSharePct": 62.8,
      "reportYear": 2024
    }
    // ... one entry per slug
  },
  "upwork": {
    "creative-director": {
      "splitTrend": [
        { "year": 2018, "staffPct": 78, "freelancePct": 22 },
        { "year": 2019, "staffPct": 76, "freelancePct": 24 },
        { "year": 2020, "staffPct": 71, "freelancePct": 29 },
        { "year": 2021, "staffPct": 68, "freelancePct": 32 },
        { "year": 2022, "staffPct": 66, "freelancePct": 34 },
        { "year": 2023, "staffPct": 63, "freelancePct": 37 },
        { "year": 2024, "staffPct": 61, "freelancePct": 39 }
      ],
      "currentSplit": { "year": 2024, "staffPct": 61, "freelancePct": 39 },
      "wageGap": {
        "staffMedianUSD": 135000,
        "freelanceMedianUSD": 98000,
        "gapPct": 27.4
      },
      "reportYear": 2024
    }
    // ... one entry per slug
  },
  "upwork._marketTrend": [
    { "year": 2018, "staffPct": 74, "freelancePct": 26 },
    { "year": 2019, "staffPct": 72, "freelancePct": 28 },
    { "year": 2020, "staffPct": 66, "freelancePct": 34 },
    { "year": 2021, "staffPct": 63, "freelancePct": 37 },
    { "year": 2022, "staffPct": 61, "freelancePct": 39 },
    { "year": 2023, "staffPct": 58, "freelancePct": 42 },
    { "year": 2024, "staffPct": 56, "freelancePct": 44 }
  ]
}
```

---

## Step 7 — New Components to Create

Summary of net-new components required:

| Component | File | Purpose |
|---|---|---|
| `RoleVerdict` | `src/components/RoleVerdict.tsx` | Verdict banner (Contracting / Holding / Rising) |
| `MarketView` | `src/components/MarketView.tsx` | Market View tab content |
| `StackedAreaChart` | `src/components/ui/StackedAreaChart.tsx` | Staff vs. freelance stacked area (Recharts) |
| `FREDChart` | `src/components/ui/FREDChart.tsx` | Line chart with recession band overlays (Recharts) |

Existing components modified (new optional props only):

| Component | New Props |
|---|---|
| `DemandSection` | `fredMacro?: FREDMacroContext` |
| `SalarySection` | `acsDemographics?: ACSDemographics`, `upworkStructure?: UpworkEmploymentStructure` |
| `AIImpactSection` | `neaSupply?: NEASupplyContext` |
| `RoleIntelligence` | No prop changes (API response shape extended server-side) |

---

## Step 8 — API Keys and Environment

Add to `.env.local.example`:

```
# Phase 4 — Enrichment data sources
CENSUS_API_KEY=          # Free: https://api.census.gov/data/key_signup.html
FRED_API_KEY=            # Free: https://fred.stlouisfed.org/docs/api/api_key.html
# NEA and Upwork data are read from src/data/enrichment-seed.json (no API key needed)
```

Add to GitHub Actions secrets for the refresh workflow:

```
CENSUS_API_KEY
FRED_API_KEY
```

---

## Step 9 — Implementation Order

Build in this sequence to keep the site working at every step:

1. **Types first** — create `enrichmentData.ts` with all types + `deriveVerdict()`. Zero runtime impact.
2. **Cache file** — create empty `cachedEnrichmentData.ts` + `enrichmentData.server.ts`. Zero runtime impact.
3. **Seed file** — create `enrichment-seed.json` with manually researched NEA + Upwork data for all 20 roles. This is the most labor-intensive step and can be done in parallel with code.
4. **Refresh script** — create `refresh-enrichment.mjs` and add the Phase 4 block to the shell script. Run it locally to populate the cache.
5. **RoleVerdict component** — build and wire into the role page. Small, self-contained.
6. **Section updates** — update DemandSection, SalarySection, AIImpactSection with enrichment callouts. Each is additive and independent.
7. **RoleIntelligence update** — extend the API to generate insight cards when enrichment data is present.
8. **MarketView tab** — build the tab bar, MarketView component, StackedAreaChart, FREDChart. This is the largest UI addition.
9. **API routes** — create `/api/enrichment/[slug]` and `/api/enrichment/market`.
10. **Integration test** — verify all sections render correctly with enrichment data present AND absent.

---

## Appendix A — ACS Implementation Notes

The Census ACS API is complex. Table S2401 provides occupation-by-sex-and-earnings at the national level, but metro-level breakdowns require querying the ACS 1-Year Detailed Tables (B24011 or B24012) filtered by SOC code and geography.

**Practical approach:**

1. For the initial seed, manually extract top-5 metro medians from the Census data explorer (data.census.gov) for each SOC code group
2. Add them to `enrichment-seed.json` alongside NEA/Upwork data
3. Automate via API in a later iteration once the data mapping is validated

The `fetchACS()` function in the refresh script is scaffolded for this future automation. For launch, ACS data can live in the seed file alongside NEA and Upwork.

---

## Appendix B — Data Source Refresh Cadence

| Source | Update Frequency | How We Get It |
|---|---|---|
| **ACS** | Annual (September release) | Census API or manual extract from data.census.gov |
| **NEA** | ~Every 3 years | Manual — download PDF report, extract relevant tables |
| **Upwork** | Annual (Freelance Forward report) | Manual — extract data points from published report |
| **FRED** | Monthly (employment data) | FRED API (automated in refresh script) |

FRED is the only source that justifies weekly automated fetching. The others are annual/triennial and should be updated in the seed file when new reports are published.

---

## Appendix C — Fallback Behavior Matrix

Every enrichment integration must degrade gracefully:

| Condition | Behavior |
|---|---|
| Enrichment cache empty | All sections render exactly as Phase 2 — no enrichment UI shown |
| FRED data missing | No verdict `isMarketWide` annotation, no economy context callout, no FRED chart in Market View |
| NEA data missing for a role | No hidden workforce callout in AI Impact, no NEA numbers in Market View workforce section |
| Upwork data missing for a role | No staff/freelance split in Salary section, Market View shows aggregate only |
| ACS data missing for a role | No metro breakdown in Salary section, no income distribution annotation |
| All enrichment present | Full enriched experience across all sections + Market View tab |

No `null` checks should throw. Every enrichment prop is typed as optional. Every enrichment UI block is wrapped in a conditional render.
