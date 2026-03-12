# E16 — Industry Benchmarks Page

**Status:** Queued
**Scope:** Small
**Approved:** 2026-03-12

---

## What This Is

A dedicated `/benchmarks` page showing cross-cutting aggregate views that aren't tied to any single role. Cluster-level comparisons, market-wide rankings, and pattern detection across all 20 tracked roles.

## Why It Matters

The landing page leaderboard ranks individual roles. But design leaders managing multi-role teams need cluster-level and market-level views: "Which cluster is most at risk?", "Where are salaries compressing?", "Which roles are diverging from their cluster?" This page surfaces those patterns.

## Where It Lives

- **Route:** `/benchmarks`
- **File:** `src/app/benchmarks/page.tsx` (server component, reads cached data)
- **Nav:** Add to Header alongside Methodology

## Data Source

All data comes from existing cached snapshot data (`cachedLandingData.ts` or reading all snapshot JSON files server-side). No new API calls.

## Page Sections

### Section 1 — Cluster Scorecards
Four cards (one per cluster), each showing:
- Cluster name + role count
- Average AI risk score for the cluster
- Average YoY demand change
- Average median salary
- Highest/lowest role within the cluster for each metric

```
┌─────────────────────────────┐
│ DESIGN LEADERSHIP (5 roles) │
│ Avg AI Risk: 34 (Moderate)  │
│ Avg Demand: -2.4% YoY       │
│ Avg Salary: $142k            │
│ Highest risk: Creative Dir.  │
│ Most growth: Head of Design  │
└─────────────────────────────┘
```

### Section 2 — Cross-Cluster Rankings
Three ranked lists (horizontal bar charts):

**AI Risk — Cluster Average**
- Content & Copy ████████░ 64
- Brand & Visual ██████░░░ 51
- Product & UX   ████░░░░░ 38
- Design Leadership ███░░░░░░ 34

**Demand Growth — Cluster Average**
Sorted best to worst.

**Salary — Cluster Average**
Sorted highest to lowest.

### Section 3 — Outliers & Divergences
Automatically detect and surface interesting patterns:

- **Roles outperforming their cluster:** Roles where demand or salary is significantly above cluster average (>1 std dev)
- **Roles underperforming their cluster:** Opposite
- **Risk-salary mismatch:** High-risk roles that still command high salaries (or vice versa)
- **Demand-risk convergence:** Roles where both demand AND AI risk are rising simultaneously

Each outlier gets a one-line callout with the relevant numbers.

### Section 4 — Salary Spread
Table showing P10–P90 salary range for each role, sorted by spread width. Highlights roles with the widest and narrowest ranges.

### Section 5 — Market Summary Stats
Repeat of the 5 Market Conditions stats from the landing page, but with additional context:
- Total open positions (with 4-week trend)
- Average AI risk (with cluster breakdown)
- Roles in YoY decline (listed)
- Highest/lowest risk roles

## Computation Logic

All aggregations run server-side at build/request time. Functions to create:

```typescript
// src/lib/benchmarks.ts

computeClusterAverages(snapshots: JobHealthSnapshot[]): ClusterScorecard[]
computeOutliers(snapshots: JobHealthSnapshot[]): Outlier[]
computeSalarySpread(snapshots: JobHealthSnapshot[]): SalarySpreadRow[]
```

Types:
```typescript
interface ClusterScorecard {
  cluster: JobCluster;
  roleCount: number;
  avgAIRisk: number;
  avgDemandYoY: number;
  avgSalary: number;
  highestRiskRole: string;
  mostGrowthRole: string;
}

interface Outlier {
  role: string;
  type: 'outperforming' | 'underperforming' | 'risk-salary-mismatch' | 'demand-risk-convergence';
  description: string;
  values: Record<string, number>;
}
```

## Design Rules

- Server component (static data, no client interactivity needed)
- 12-column grid layout matching rest of site
- Cluster scorecards: 4-up grid (3 cols each on desktop, stack on mobile)
- Bar charts: horizontal, using existing `<SkillBar>` pattern (repurpose or extend)
- Signal colors for directional data (green up, red down, brown neutral)
- Monospace for all numeric values
- No rounded corners, no shadows — `DESIGN_SYSTEM.md` rules apply

## Files to Create/Modify

| File | Action |
|---|---|
| `src/app/benchmarks/page.tsx` | **Create** — new server component page |
| `src/lib/benchmarks.ts` | **Create** — aggregation logic |
| `src/components/Header.tsx` | **Modify** — add "Benchmarks" nav link |

## What NOT to Touch

- Landing page leaderboard — benchmarks is additive, not a replacement
- Snapshot data pipeline — read-only consumption of existing data
- Role deep-dive pages — no changes
