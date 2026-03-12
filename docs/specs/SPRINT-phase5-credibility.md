# Phase 5 — The Credibility Sprint

**Status:** Planned
**Created:** 2026-03-12
**Scope:** 4 Small + 1 Medium (5 features)
**New Infrastructure:** None
**New Routes:** `/methodology`, `/benchmarks`

---

## Sprint Thesis: Credibility Before Distribution

The backlog splits into two natural clusters: features that make the index **more trustworthy** (methodology, confidence, footnotes, benchmarks, skills analysis) and features that **distribute it further** (PDF reports, email digests, surveys, emerging roles).

Building distribution before credibility is a mistake. If someone receives your PDF report and the first thing they notice is unsourced data, no methodology link, and no confidence indicators — the report hurts more than it helps.

**Phase 5 ships the entire credibility cluster.** Phase 6 ships distribution on top of a research-grade foundation. Phase 7 tackles community features that benefit from the traffic distribution creates.

---

## Sprint Bundle

| Order | ID | Feature | Scope | Spec |
|---|---|---|---|---|
| 1 | E14 | Methodology Page | Small | [E14-methodology-page.md](E14-methodology-page.md) |
| 2 | G1 | Data Confidence Indicators | Small | [G1-data-confidence.md](G1-data-confidence.md) |
| 3 | F3 | Data Footnotes & Annotations | Small | [F3-data-footnotes.md](F3-data-footnotes.md) |
| 4 | A3 | Skills Gap Analyzer | Small | [A3-skills-gap-analyzer.md](A3-skills-gap-analyzer.md) |
| 5 | E16 | Industry Benchmarks Page | Small | [E16-industry-benchmarks.md](E16-industry-benchmarks.md) |

---

## Why These Five

**E14 — Methodology Page** is the foundation. Every other credibility feature references it. G1 confidence tooltips say "See Methodology." F3 footnotes cite it. E16 benchmarks link to it in the footer. It has to exist first.

**G1 — Data Confidence Indicators** is the widest-touching change: badges on 8 section headers across every role deep-dive. Getting it in early stabilizes the section header pattern that F3 also modifies.

**F3 — Data Footnotes & Annotations** layers on top of the same sections that now have confidence badges. Automatic freshness notes, curated event markers on charts (via Recharts ReferenceLine), and source references. Builds on the header pattern G1 establishes.

**A3 — Skills Gap Analyzer** is self-contained. New section on the role deep-dive that cross-references posting analysis with skills signal into an Invest / Watch / Core / Shed matrix. No new API calls — purely UI synthesis of existing snapshot data.

**E16 — Industry Benchmarks Page** is the most independent feature. New `/benchmarks` route with cluster scorecards, cross-cluster rankings, outlier detection, and salary spread analysis. Links to /methodology in the footer.

---

## Dependency Map

```
E14 Methodology  ←── foundation (build first)
  │
  ├── referenced by G1 Confidence tooltips ("See Methodology")
  │     │
  │     └── confidence levels inform F3 Footnotes source badges
  │           │
  │           └── footnotes annotate sections that also contain A3 Skills Gap
  │
  └── linked from E16 Benchmarks ("How we calculate" footer)

No circular dependencies. No shared infrastructure to build first.
Each feature adds value independently — the order is optimization, not requirement.
```

---

## Build Order

### Step 1 — E14: Methodology Page
Create `/methodology` route as a server component with static content. 8 sections covering data sources, AI risk scoring, sentiment scoring, enrichment layers, refresh pipeline, known limitations, and data freshness. Add quiet link in Header component.

**Files:** `src/app/methodology/page.tsx`, modify `src/components/Header.tsx`

### Step 2 — G1: Data Confidence Indicators
Create `ConfidenceBadge.tsx` component and `confidenceMap.ts` mapping. Modify 8 section components (Demand, Salary, Skills Signal, Posting Analysis, Sentiment, AI Impact, Role Intelligence, Health Score) to add confidence badges to section headers. Tooltips link to `/methodology`.

**Files:** `src/components/ui/ConfidenceBadge.tsx`, `src/lib/confidenceMap.ts`, 8 section component modifications

### Step 3 — F3: Data Footnotes & Annotations
Create `DataFootnote.tsx` and `ChartAnnotation.tsx` components. Create `src/data/annotations.ts` for curated event annotations. Add automatic freshness notes based on snapshot timestamps. Integrate chart annotations via Recharts `ReferenceLine`.

**Files:** `src/components/ui/DataFootnote.tsx`, `src/components/ui/ChartAnnotation.tsx`, `src/data/annotations.ts`, section component modifications

### Step 4 — A3: Skills Gap Analyzer
Create `SkillsGapSection.tsx` and `SkillGapBar.tsx` components. Embed in role deep-dive between Skills Signal and Posting Analysis sections. Cross-reference `snapshot.postingAnalysis.topSkills` with `snapshot.skills.rising` / `snapshot.skills.declining` using the classification matrix.

**Files:** `src/components/SkillsGapSection.tsx`, `src/components/ui/SkillGapBar.tsx`, modify `src/app/role/[slug]/page.tsx`

### Step 5 — E16: Industry Benchmarks
Create `/benchmarks` route and `src/lib/benchmarks.ts` with `computeClusterAverages()`, `computeOutliers()`, `computeSalarySpread()`. Build cluster scorecards, cross-cluster ranking table, and outlier detection. Link to /methodology in page footer.

**Files:** `src/app/benchmarks/page.tsx`, `src/lib/benchmarks.ts`, modify `src/components/Header.tsx`

---

## What's Deferred

### Phase 6 — Distribution (after credibility layer is in place)

| ID | Feature | Scope | Why Deferred |
|---|---|---|---|
| E15 | State of the Market Editorial | Medium | Better when it can reference methodology and link to benchmarks |
| C8 | Monthly PDF Report | Medium | Should include confidence indicators, footnotes, and methodology links |
| I2 | AI Displacement Timeline | Medium | Pairs with editorial — both add narrative depth to the AI risk story |
| C11 | Email Digest / Role Alerts | Large | Emails should showcase the full credibility layer |

### Phase 7 — Community (after distribution drives traffic)

| ID | Feature | Scope | Why Deferred |
|---|---|---|---|
| D12 | Practitioner Pulse Survey | Large | Needs traffic from distribution to generate respondent volume |
| I3 | Emerging Roles Radar | Large | Independent but large scope — ships when capacity allows |

---

## Success Criteria

After Phase 5, the index should feel like a **citable research tool**, not a dashboard. Specifically:

1. Every data section shows its confidence level at a glance
2. Stale or proxy data is transparently annotated
3. A journalist or researcher can link to `/methodology` to verify any claim
4. Skills guidance is prescriptive, not just descriptive
5. Cross-role comparison exists at `/benchmarks` for market-level analysis
6. Zero new external dependencies or infrastructure — everything runs on existing data and Vercel deployment
