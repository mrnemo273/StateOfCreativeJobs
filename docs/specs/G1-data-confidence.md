# G1 — Data Confidence Indicators

**Status:** Queued
**Scope:** Small
**Approved:** 2026-03-12 (Batch 2)

---

## What This Is

A confidence badge on each data section of the role deep-dive: High (multiple corroborating sources), Medium (single reliable source), or Low (sparse data or stale). Makes the index honest about its own limitations per data point.

## Why It Matters

Not all data points are equally reliable. BLS salary data is rock-solid survey data. Google Trends "demand" is a proxy at best. The AI risk TDI score is editorial judgment. Showing confidence levels is what separates serious research from dashboard theater — and it pairs naturally with E14 (Methodology) and F3 (Footnotes).

## Where It Lives

- **In-place on each role deep-dive section header** — small badge next to the section label
- **No new page or route**
- **Component:** `src/components/ui/ConfidenceBadge.tsx`

## Confidence Tiers

| Level | Dots | Criteria | Color |
|---|---|---|---|
| **High** | ●●●○ | 2+ corroborating sources, data < 7 days old | Signal green (muted) |
| **Medium** | ●●○○ | Single reliable source, or data 7-30 days old | Signal neutral/brown |
| **Low** | ●○○○ | Sparse data, stale (>30 days), or proxy measurement | Signal amber |

## Section Confidence Map

Static mapping — confidence levels are inherent to the data source, not computed dynamically:

```typescript
// src/lib/confidenceMap.ts

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface SectionConfidence {
  level: ConfidenceLevel;
  sources: string[];
  note?: string;
}

export const SECTION_CONFIDENCE: Record<string, SectionConfidence> = {
  demand: {
    level: 'high',
    sources: ['Adzuna', 'Google Trends', 'Hacker News'],
    note: 'Adzuna covers ~60% of US postings'
  },
  salary: {
    level: 'medium',
    sources: ['BLS OES'],
    note: 'Annual survey data; 12-18 month lag'
  },
  aiImpact: {
    level: 'high',
    sources: ['O*NET tasks', 'Editorial TDI'],
    note: 'TDI scoring is editorial, not algorithmic'
  },
  skills: {
    level: 'medium',
    sources: ['O*NET', 'Adzuna postings'],
  },
  postingAnalysis: {
    level: 'high',
    sources: ['Adzuna', 'O*NET'],
  },
  sentiment: {
    level: 'medium',
    sources: ['GNews', 'Hacker News'],
    note: 'Keyword-based scoring; HN skews tech audience'
  },
  roleIntelligence: {
    level: 'medium',
    sources: ['Claude (Anthropic)'],
    note: 'AI-generated synthesis of snapshot data'
  },
  enrichment: {
    level: 'medium',
    sources: ['ACS Census', 'NEA', 'FRED'],
    note: 'Annual data; seeded, not weekly-refreshed'
  }
};
```

**Dynamic adjustment:** If `snapshot.lastUpdated` is > 7 days old, downgrade all sections by one tier. This handles stale data gracefully.

## Component: `<ConfidenceBadge>`

```tsx
<ConfidenceBadge
  section="salary"
  lastUpdated={snapshot.lastUpdated}
/>
```

**Renders:**
```
●●○○ MEDIUM · BLS OES · 18-month lag
```

**Design rules:**
- Font: IBM Plex Sans (label family), 0.65rem, uppercase, letter-spacing 0.12em
- Dots: filled/empty circles in the section's signal color
- Source list: comma-separated after dots, in `text-mid`
- Note: only shown on hover or tap (tooltip), not inline — keeps it compact
- Position: inline with `<SectionLabel>`, right-aligned or just below it
- Subtle — this should never compete with the data itself

## Tooltip on Hover

When user hovers the confidence badge, show a small tooltip:

```
CONFIDENCE: MEDIUM
Sources: BLS OES
Note: Annual survey data; 12-18 month lag
Last refreshed: 3 days ago
Learn more → /methodology
```

Tooltip follows existing design system: no rounded corners, `bg-ink` background, `text-paper` text, monospace for dates.

## Integration

Add `<ConfidenceBadge>` to each section component's header area:

| Component | Section Key |
|---|---|
| `DemandSection.tsx` | `demand` |
| `SalarySection.tsx` | `salary` |
| `AIImpactSection.tsx` | `aiImpact` |
| `SkillsSignalSection.tsx` | `skills` |
| `PostingAnalysisSection.tsx` | `postingAnalysis` |
| `SentimentSection.tsx` | `sentiment` |
| `RoleIntelligence.tsx` | `roleIntelligence` |
| `MarketView.tsx` | `enrichment` |

Each section component receives `lastUpdated` as a prop (already available from snapshot).

## Files to Create/Modify

| File | Action |
|---|---|
| `src/components/ui/ConfidenceBadge.tsx` | **Create** — badge + tooltip component |
| `src/lib/confidenceMap.ts` | **Create** — static confidence mappings |
| `src/components/DemandSection.tsx` | **Modify** — add badge to header |
| `src/components/SalarySection.tsx` | **Modify** — add badge to header |
| `src/components/AIImpactSection.tsx` | **Modify** — add badge to header |
| `src/components/SkillsSignalSection.tsx` | **Modify** — add badge to header |
| `src/components/PostingAnalysisSection.tsx` | **Modify** — add badge to header |
| `src/components/SentimentSection.tsx` | **Modify** — add badge to header |
| `src/components/RoleIntelligence.tsx` | **Modify** — add badge to header |
| `src/components/MarketView.tsx` | **Modify** — add badge to header |

## What NOT to Touch

- Data pipeline (`buildSnapshot.ts`) — confidence is metadata about sources, not data itself
- Types (`src/types/index.ts`) — confidence types live in their own file
- Landing page — confidence badges are role deep-dive only
- Design system tokens — use existing signal colors
