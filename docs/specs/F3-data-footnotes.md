# F3 — Data Footnotes & Annotations

**Status:** Queued
**Scope:** Small
**Approved:** 2026-03-12 (Batch 2)

---

## What This Is

Contextual footnotes and annotations layered onto data sections that need explanation. When BLS data is 18 months old, note it inline. When a demand spike correlates with a known event (major layoffs, AI tool launch), annotate the chart. Small editorial touches that build trust and prevent misinterpretation.

## Why It Matters

Raw numbers without context can mislead. A 15% demand drop means something different during a recession vs. a normal market. A salary figure from May 2024 doesn't reflect March 2026 reality. Annotations prevent misinterpretation and signal the kind of editorial rigor that separates this index from generic dashboards.

## Where It Lives

- **In-place on role deep-dive sections** — footnotes appear directly beneath the data they annotate
- **No new route or page** — this is a component-level enhancement across existing sections
- **New components:** `src/components/ui/DataFootnote.tsx`, `src/components/ui/ChartAnnotation.tsx`

## Types of Annotations

### 1. Data Freshness Notes (Automatic)
Generated automatically based on data timestamps. Appear beneath section headers.

| Condition | Note |
|---|---|
| BLS salary data | "Based on BLS OES survey data from [month/year]. Current market may differ." |
| Snapshot > 7 days old | "Last refreshed [N] days ago." |
| Google Trends proxy | "Interest-over-time index; search volume ≠ direct job demand." |
| O*NET AI scoring | "AI risk includes editorial assessment (TDI). See Methodology." |

### 2. Event Annotations (Curated)
Manually maintained annotations tied to specific dates on trend charts. Stored in a config file.

```typescript
// src/data/annotations.ts

export interface ChartAnnotation {
  date: string;        // ISO date — where on the X axis
  label: string;       // Short label ("GPT-5 launch")
  detail: string;      // Tooltip/expanded text
  scope: 'market' | 'cluster' | string[];  // Which roles it applies to
}

export const ANNOTATIONS: ChartAnnotation[] = [
  {
    date: "2025-12-12",
    label: "GPT-5 launch",
    detail: "Industry-wide demand dip correlated with GPT-5 release. Not role-specific.",
    scope: "market"
  },
  {
    date: "2026-01-15",
    label: "Figma AI v2",
    detail: "Figma ships AI auto-layout. Demand shift visible in Product & UX cluster.",
    scope: ["product-designer", "ux-designer", "design-systems-designer"]
  }
];
```

### 3. Confidence Indicators (Complements G1)
If G1 (Data Confidence Indicators) is implemented first, footnotes reference the confidence level. If G1 hasn't shipped yet, footnotes still work standalone with simpler text.

## Component: `<DataFootnote>`

```tsx
// Renders a small footnote beneath a data section
<DataFootnote
  icon="info"           // 'info' | 'warning' | 'clock'
  text="BLS salary data reflects May 2024 survey."
/>
```

**Design:**
- Font: `Inter`, 0.75rem (caption), color `--cc-mid-gray` (or site equivalent `text-mid`)
- Left-aligned, inline with section content
- Icon: small (12px) info/clock/warning glyph in `text-mid`
- No background, no border — just quiet inline text
- Sits directly below the data it annotates, separated by 8px

## Component: `<ChartAnnotation>`

For trend charts (Recharts), render a small marker on the X axis at annotated dates:

- **Marker:** Vertical dashed line (1px, `--color-light`) at the annotated date
- **Label:** Small text label above the line (0.65rem, mono, rotated if needed)
- **Tooltip:** On hover, show the full `detail` text in the standard chart tooltip style
- **Max annotations per chart:** 3 (to avoid clutter)

Implementation: Use Recharts `ReferenceLine` with custom label component.

## Integration Points

| Section | Footnote Type | Example |
|---|---|---|
| Demand (trend chart) | Event annotation | "GPT-5 launch" marker on Dec 2025 |
| Demand (openings count) | Freshness | "Source: Adzuna. Covers ~60% of US postings." |
| Salary | Staleness | "BLS OES data from May 2024." |
| AI Impact | Methodology | "Score includes editorial TDI assessment. See Methodology →" |
| Google Trends chart | Proxy warning | "Interest index, not direct demand measurement." |

## Files to Create/Modify

| File | Action |
|---|---|
| `src/components/ui/DataFootnote.tsx` | **Create** — inline footnote component |
| `src/components/ui/ChartAnnotation.tsx` | **Create** — Recharts reference line wrapper |
| `src/data/annotations.ts` | **Create** — curated event annotations |
| `src/components/DemandSection.tsx` | **Modify** — add footnotes + chart annotations |
| `src/components/SalarySection.tsx` | **Modify** — add BLS staleness footnote |
| `src/components/AIImpactSection.tsx` | **Modify** — add methodology footnote |

## What NOT to Touch

- `buildSnapshot.ts` — no data pipeline changes
- Chart theme (`chartTheme.ts`) — annotations use existing styling tokens
- Types (`src/types/index.ts`) — annotation types live in their own file
- Landing page — footnotes are role deep-dive only
