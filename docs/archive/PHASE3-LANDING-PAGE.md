# Phase 3 — Landing Page: The Creative Jobs Index

## What to Build

The current homepage is the role deep-dive tool. This phase adds a new entry-point landing page at `/` that reframes the site from a role lookup tool into a living research index of creative labor displacement. The existing role deep-dive moves to `/role/[slug]`. The landing page links into it.

The page has five sections: a masthead, an editorial essay, a market conditions bar, a sortable role index (the leaderboard), and a methodology note.

---

## Step 1 — Reroute the Existing Homepage

Move the current homepage component from `app/page.tsx` to `app/role/[slug]/page.tsx` (or wherever role deep-dive pages currently live — follow the existing routing pattern).

The new `app/page.tsx` will be the landing page built in Step 4.

Update any internal links that pointed to `/?role=...` or similar to use the new `/role/[slug]` path.

---

## Step 2 — Create `src/lib/landingData.ts`

This utility fetches all 20 role snapshots in parallel and returns the summary data needed for the landing page. Create this file:

```typescript
export type RoleSummary = {
  title: string;
  slug: string;
  cluster: 'design-leadership' | 'product-ux' | 'brand-visual' | 'content-copy';
  openingsCount: number;
  yoyChange: number;
  medianSalary: number;
  aiScore: number;
  aiLabel: 'Low' | 'Moderate' | 'Elevated' | 'High';
  sparkline: number[]; // last 6 values of demand.openingsTrend
  lastUpdated: string;
};

export const ALL_SLUGS = [
  'creative-director', 'design-director', 'head-of-design', 'vp-of-design', 'cco',
  'senior-product-designer', 'ux-designer', 'product-designer', 'ux-researcher',
  'design-systems-designer', 'brand-designer', 'graphic-designer', 'visual-designer',
  'art-director', 'motion-designer', 'copywriter', 'content-strategist', 'ux-writer',
  'creative-copywriter', 'content-designer',
];

export async function fetchAllRoleSummaries(): Promise<RoleSummary[]> {
  const results = await Promise.all(
    ALL_SLUGS.map(slug =>
      fetch(`/api/snapshot/${slug}`)
        .then(r => r.json())
        .then(d => ({
          title: d.title,
          slug: d.slug,
          cluster: d.cluster,
          openingsCount: d.demand.openingsCount,
          yoyChange: d.demand.yoyChange,
          medianSalary: d.salary.medianUSD,
          aiScore: d.aiImpact.score,
          aiLabel: d.aiImpact.scoreLabel,
          sparkline: d.demand.openingsTrend.slice(-6).map((p: { value: number }) => p.value),
          lastUpdated: d.lastUpdated,
        }))
    )
  );
  return results;
}

export function computeMarketConditions(roles: RoleSummary[]) {
  const totalOpenings = roles.reduce((sum, r) => sum + r.openingsCount, 0);
  const avgAiScore = Math.round(roles.reduce((sum, r) => sum + r.aiScore, 0) / roles.length);
  const inDecline = roles.filter(r => r.yoyChange < 0).length;
  const highestRisk = roles.reduce((max, r) => r.aiScore > max.aiScore ? r : max, roles[0]);
  const fastestGrowing = roles.filter(r => r.yoyChange > 0).reduce((max, r) => r.yoyChange > max.yoyChange ? r : max, roles.filter(r => r.yoyChange > 0)[0]);
  const mostRecent = roles.map(r => r.lastUpdated).sort().reverse()[0];

  return { totalOpenings, avgAiScore, inDecline, highestRisk, fastestGrowing, mostRecent };
}
```

---

## Step 3 — Build the Landing Page Component

Create `app/page.tsx`. The page is server-side rendered (or statically generated — see Step 5 on caching). It fetches all role summaries on load and passes them to the client component for sort interactions.

### Section 1 — Masthead

```
State of Creative Jobs
An ongoing study of AI displacement in the creative workforce.
Last updated: [mostRecent date from data]
```

No hero image. No marketing language. The last-updated date should be pulled dynamically from the API data (most recent `lastUpdated` value across all roles).

---

### Section 2 — Opening Essay

Use this copy verbatim. The specific sentence structure is intentional — it is doing rhetorical work.

```
In early 2024, a mid-sized agency quietly stopped posting for copywriters. Not 
in a round of layoffs. Not a restructuring announcement. The roles simply weren't 
refilled. One by one, over six months, they disappeared — not with a bang, 
but with silence.

There is a particular kind of job loss that doesn't appear in Bureau of Labor 
Statistics reports. It doesn't generate headlines. It doesn't produce a press 
release. It looks, from the outside, like nothing at all. But inside the creative 
industry, practitioners are feeling it — in the thinning of job boards, in the 
shifting of briefs, in the quiet realization that the tools they used to hand off 
work to are now doing the work themselves.

What follows is an attempt to make that invisible shift visible. Twenty roles. 
Thirteen months of posting data. Community signals from practitioners in the 
field. One clear pattern: the creative job market is being repriced in real time, 
and the change is not evenly distributed. Some roles are accelerating. Others are 
in freefall. The index below tracks both.
```

---

### Section 3 — Market Conditions Bar

A single horizontal strip of 5 stats. Use the `computeMarketConditions()` function from `landingData.ts`. All values are dynamic.

| Label | Source |
|---|---|
| Roles Tracked | Static — always 20 |
| Total Open Positions | Sum of all `openingsCount` |
| Avg AI Risk Score | Mean of all `aiScore` values |
| Roles in YoY Decline | Count where `yoyChange < 0` |
| Highest Risk Role | Max `aiScore` — show as "Copywriter — 76" |

Style: monospace font for numbers, subtle top/bottom border rule to frame the strip. This should read like a research brief header, not a marketing KPI dashboard.

---

### Section 4 — The Index (Leaderboard)

All 20 roles as a sortable table. Default sort: `yoyChange` ascending (most negative at top — the distress signal leads the story).

**Columns:**

| Column | Field | Notes |
|---|---|---|
| Role | `title` | Linked to `/role/[slug]` |
| Cluster | `cluster` | Small badge |
| Open Roles | `openingsCount` | Right-aligned, comma-formatted |
| YoY Change | `yoyChange` | Bold, red if negative / green if positive, arrow indicator |
| Trend | `sparkline` | Inline SVG, 80×24px, stroke only, no axes, color matches YoY direction |
| Median Salary | `medianSalary` | Show `—` if 0 |
| AI Risk | `aiScore` + `aiLabel` | Color-coded pill |

**Sort:** All column headers clickable, asc/desc toggle on click. Active sort column visually indicated.

**Row interaction:** Clicking any row navigates to `/role/[slug]`.

**Sparkline implementation:** Build as a small inline SVG component. Input is an array of 6 numbers. Normalize to fit the 24px height. No axes, no labels, stroke-only path. Stroke color: muted green if `yoyChange >= 0`, muted red if `yoyChange < 0`.

```typescript
// Sparkline SVG component (simplified)
function Sparkline({ values, positive }: { values: number[]; positive: boolean }) {
  const max = Math.max(...values, 1);
  const w = 80, h = 24;
  const points = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - (v / max) * h
  ]);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke={positive ? '#4a7c59' : '#9b2335'} strokeWidth="1.5" />
    </svg>
  );
}
```

**AI Risk pill colors:**

| Label | Color |
|---|---|
| Low | Gray |
| Moderate | Amber |
| Elevated | Orange |
| High | Red / deep crimson |

**Cluster badge labels:**

| Value | Display Label |
|---|---|
| design-leadership | Design Leadership |
| product-ux | Product & UX |
| brand-visual | Brand & Visual |
| content-copy | Content & Copy |

---

### Section 5 — Methodology Note

Small text, bottom of page. Use this copy verbatim:

```
Role data is derived from active job postings aggregated monthly across major 
employment platforms. AI risk scores are calculated using a weighted composite 
of O*NET task-level displacement analysis (40%) and a tool-specific displacement 
index (60%) based on documented AI tool capabilities. Community sentiment signals 
are drawn from practitioner discussions across Hacker News and industry 
publications. This index is updated monthly.
```

---

## Step 4 — Visual Direction

**Aesthetic:** Academic-editorial. Research report meets financial terminal. Not a SaaS dashboard.

**Typography:**
- Headlines and essay body: a serif with editorial character — `DM Serif Display`, `Playfair Display`, or `Lora` (pick one, import from Google Fonts)
- Numbers, data, labels, table content: monospace — `JetBrains Mono`, `IBM Plex Mono`, or `Fira Code`
- UI chrome (nav, badges, small labels): existing site body font

**Color:**
- Background: near-white `#FAFAF8` or near-black — commit to one, do not use pure white or pure black
- YoY positive values: muted green `#4a7c59`
- YoY negative values: muted crimson `#9b2335`
- Risk pill colors: gray / amber `#b45309` / orange `#c2410c` / red `#991b1b`
- Everything else: grayscale — no accent colors outside of the data columns

**Leaderboard density:**
- Row height: ~48px
- Numbers right-aligned, text left-aligned
- Subtle row separator (bottom border only, no alternating fills)
- The table should feel like a terminal index, not a card grid

---

## Step 5 — Weekly Cache and Update Workflow

The landing page market conditions and leaderboard data should be rebuilt on the same weekly cadence as the existing role snapshots. Integrate as follows:

**Add a cached data layer:**

Create `src/lib/cachedLandingData.ts`:

```typescript
// This file is regenerated by the weekly build script alongside role snapshots.
// Do not edit manually.

import { RoleSummary } from './landingData';

export const CACHED_ROLE_SUMMARIES: RoleSummary[] = [
  // populated by scripts/refreshData.ts
];

export const CACHE_TIMESTAMP = ''; // ISO date string, set by refresh script
```

**Update the weekly refresh script** — before writing any code, locate the existing script that fetches and persists role snapshot data. It may live in `scripts/`, as a Vercel cron route, a GitHub Actions workflow, or elsewhere — find it first and understand how it currently stores role data (JSON files, a database, KV store, or another mechanism) before proceeding.

Once located, append a step at the end of the existing refresh loop that does the following:

1. After all role snapshots have been written/updated through the existing mechanism, read each role's snapshot data back using whatever method is already in use (if JSON files, read from disk; if a database, query it; adapt to the existing pattern — do not introduce a new storage mechanism)
2. Map each snapshot to the `RoleSummary` shape defined in `landingData.ts`
3. Write the full array to `src/lib/cachedLandingData.ts` as a static TypeScript export
4. Set `CACHE_TIMESTAMP` to `new Date().toISOString()`

The output file should follow this shape:

```typescript
// Auto-generated — do not edit manually.
// Regenerated by the weekly refresh script alongside role snapshots.

import { RoleSummary } from './landingData';

export const CACHED_ROLE_SUMMARIES: RoleSummary[] = [ /* ... */ ];

export const CACHE_TIMESTAMP = '2026-03-10T00:00:00.000Z';
```

**Update `app/page.tsx` to use the cached data:**

```typescript
// Import pre-built cache — no runtime API calls needed on the landing page.
// This file is regenerated weekly by the refresh script.

import { CACHED_ROLE_SUMMARIES, CACHE_TIMESTAMP } from '@/lib/cachedLandingData';
```

This means the landing page is statically generated at build time using pre-fetched data — fast to load and not dependent on 20 simultaneous API calls on every page visit. The data stays current because it refreshes on the same cadence as the existing role snapshots, with no separate cron job required.

**Before closing this step, verify:**
- The cache write runs *after* all individual role snapshots have been updated, not before
- The Vercel build (or equivalent) is triggered after the refresh completes, so the new static output is picked up
- `cachedLandingData.ts` is listed in `.gitignore` if the refresh script commits directly, or is committed as part of the deploy step — whichever matches the existing pattern

---

## What NOT to Touch

Do not modify: any existing API routes, `buildSnapshot.ts`, `aiScoring.ts`, role deep-dive components, or any data fetching logic for individual roles.

Only create/modify:
- `app/page.tsx` (new landing page)
- `app/role/[slug]/page.tsx` (existing homepage, rerouted)
- `src/lib/landingData.ts` (new)
- `src/lib/cachedLandingData.ts` (new, auto-generated)
- `scripts/refreshData.ts` (append cache write step only)
- Any internal links pointing to the old homepage route

---

## Expected Outcome

| Before | After |
|---|---|
| Homepage = role selector dropdown | Homepage = research index with editorial essay |
| No macro market view | Market conditions bar showing 5 aggregate stats |
| No role comparison at a glance | 20-role leaderboard sortable by demand, salary, AI risk |
| Landing page not cached | Landing page rebuilt weekly with role snapshot data |
| No shareable overview | Leaderboard is a natural screenshot/share unit |
