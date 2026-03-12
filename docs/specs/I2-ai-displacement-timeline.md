# I2 — AI Displacement Timeline

**Status:** Queued
**Scope:** Medium
**Approved:** 2026-03-12 (Batch 2)

---

## What This Is

For each role, project a rough displacement timeline: "At current trajectory, AI tools will cover 50% of this role's core tasks by [date]." Adds a temporal dimension to the existing AI risk score — it tells practitioners not just *how exposed* but *how soon*.

## Why It Matters

A Creative Director with an AI risk score of 38 and a timeline of "5+ years" makes very different career decisions than one at 38 with "18 months." The current AI Impact section quantifies exposure but doesn't model velocity. This feature closes that gap.

## Where It Lives

- **Location:** New sub-section within `AIImpactSection.tsx` on the role deep-dive, below the risk score gauge
- **Component:** `src/components/AITimeline.tsx`
- **Data source:** New curated data file + computation logic

## Data Model

### Per-Role Timeline Data (Curated)

```typescript
// src/lib/aiTimeline.ts

export interface TimelineMilestone {
  date: string;           // "2026-Q3" format
  coveragePercent: number; // Projected % of tasks automatable
  catalyst: string;       // What drives this milestone
}

export interface RoleTimeline {
  currentCoverage: number;         // % automatable today (from AI risk)
  projectedCeiling: number;        // Max % automatable (protective factors cap)
  milestones: TimelineMilestone[];
  protectiveFactors: string[];     // What keeps the ceiling below 100%
  velocityLabel: 'slow' | 'moderate' | 'fast' | 'accelerating';
}

export const ROLE_TIMELINES: Record<string, RoleTimeline> = {
  'graphic-designer': {
    currentCoverage: 43,
    projectedCeiling: 75,
    milestones: [
      { date: '2026-Q3', coveragePercent: 50, catalyst: 'Midjourney v7 + Figma AI handle layout + asset generation' },
      { date: '2027-Q2', coveragePercent: 65, catalyst: 'End-to-end brand asset generation tools mature' },
    ],
    protectiveFactors: ['Client relationships', 'Brand strategy', 'Taste & curation', 'Cross-channel consistency'],
    velocityLabel: 'fast'
  },
  'creative-director': {
    currentCoverage: 22,
    projectedCeiling: 45,
    milestones: [
      { date: '2027-Q4', coveragePercent: 35, catalyst: 'AI handles mood boards, reference gathering, initial concepting' },
      { date: '2029-Q1', coveragePercent: 45, catalyst: 'Multi-modal AI covers presentation and pitch deck generation' },
    ],
    protectiveFactors: ['Leadership & team management', 'Client relationship ownership', 'Strategic vision', 'Taste arbitration'],
    velocityLabel: 'slow'
  },
  // ... entries for all 20 roles
};
```

### Velocity Classification

| Label | Meaning | Criteria |
|---|---|---|
| **Slow** | 5+ years to next major threshold | <5% coverage increase projected per year |
| **Moderate** | 2-4 years to next threshold | 5-10% per year |
| **Fast** | 1-2 years to next threshold | 10-20% per year |
| **Accelerating** | <1 year, pace increasing | >20% per year or multiple tools converging |

## Component: `<AITimeline>`

```tsx
<AITimeline
  slug={slug}
  currentScore={snapshot.aiImpact.score}
/>
```

### Visual Layout

```
AI DISPLACEMENT TIMELINE
Graphic Designer · Velocity: FAST

NOW              50%            100%
├────────────────┼──────────────┤
████████████████▓░░░░░░░░░░░░░░░
43% automatable today     Ceiling: 75%

PROJECTED MILESTONES

2026 Q3 — 50% task coverage
  Midjourney v7 + Figma AI handle
  layout + asset generation

2027 Q2 — 65% task coverage
  End-to-end brand asset generation
  tools mature

PROTECTIVE FACTORS
Client relationships, brand strategy,
taste & curation keep ceiling at ~75%
```

### Design Specifications

**Progress bar:**
- Full width, 8px height
- Filled portion: gradient from `--color-neutral` (current) to `--color-down` (projected)
- Ceiling marker: dashed vertical line at projected ceiling percentage
- Labels: monospace, positioned above bar at 0%, current, 50%, ceiling, 100%

**Milestones:**
- Vertical timeline layout (left-aligned dots + content)
- Date: monospace, bold, `text-data-md`
- Coverage %: mono, inline with date
- Catalyst: body text, `text-body-sm`, max-width 45ch

**Velocity badge:**
- Pill next to section label
- Color-coded: slow (green), moderate (neutral), fast (amber), accelerating (red)

**Protective factors:**
- Listed as comma-separated inline text (not bullets)
- Prefixed with ceiling percentage
- Font: `text-body-sm`, color `text-mid`

## Computation Notes

`currentCoverage` should be derived from `snapshot.aiImpact.score` where possible, but the timeline milestones and ceiling are editorially curated — there's no reliable way to algorithmically project AI capability timelines. This is acknowledged in the methodology page.

When updating timelines: edit `src/lib/aiTimeline.ts` directly. Same pattern as `aiScoring.ts` TDI scores.

## Files to Create/Modify

| File | Action |
|---|---|
| `src/components/AITimeline.tsx` | **Create** — timeline visualization component |
| `src/lib/aiTimeline.ts` | **Create** — curated timeline data + types |
| `src/components/AIImpactSection.tsx` | **Modify** — embed `<AITimeline>` below risk gauge |

## What NOT to Touch

- `aiScoring.ts` — timeline is additive, doesn't change existing scoring
- `buildSnapshot.ts` — timeline data is separate from snapshot pipeline
- `src/types/index.ts` — timeline types live in their own file
- Risk labels/tiers — the timeline complements, doesn't replace, the existing risk system
