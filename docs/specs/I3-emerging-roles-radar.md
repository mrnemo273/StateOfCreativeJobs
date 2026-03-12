# I3 — Emerging Roles Radar

**Status:** Queued
**Scope:** Large
**Approved:** 2026-03-12 (Batch 2)

---

## What This Is

A system to detect and track job titles that don't exist in the current 20-role index but are appearing with increasing frequency in job postings and industry discussions. Titles like "AI Design Lead," "Design Technologist," "Content Engineer," and "Creative AI Strategist" — surfaced as emerging signals before they become established enough to add to the index.

## Why It Matters

The index tracks 20 existing roles. But the most important story might be the roles being born. The creative job market isn't just losing titles to AI — it's creating new ones. Detecting emerging titles early is the ultimate forward-looking signal, and it's something no other data source currently provides.

## Where It Lives

- **Route:** `/emerging` — dedicated page
- **Landing page integration:** Small "Emerging Roles" callout below the leaderboard (top 3 signals)
- **Components:**
  - `src/app/emerging/page.tsx` — main page (server component)
  - `src/components/EmergingRolesRadar.tsx` — display component
  - `src/components/landing/EmergingCallout.tsx` — landing page excerpt

## Data Pipeline

### 1. Title Mining (Adzuna)

Extend `src/lib/apis/adzuna.ts` with a new function that searches for creative/design job postings broadly and extracts unique title strings:

```typescript
async function mineEmergingTitles(): Promise<TitleSignal[]>
```

**Approach:**
- Search Adzuna for broad creative terms ("design", "creative", "UX", "content")
- Extract the `title` field from results
- Normalize titles (lowercase, trim company-specific prefixes)
- Filter OUT titles matching existing 20 tracked roles
- Count frequency of remaining unique titles
- Return titles appearing 20+ times with their counts

### 2. Discussion Signals (Hacker News)

Extend `src/lib/apis/hackernews.ts` to search for emerging title strings:

```typescript
async function searchEmergingDiscussion(title: string): Promise<number>
// Returns HN mention count for a title in the last 90 days
```

### 3. Emerging Role Scoring

```typescript
// src/lib/emergingRoles.ts

export interface EmergingRole {
  title: string;
  slug: string;
  firstSeen: string;           // ISO date when first detected
  postingCount: number;        // Current Adzuna count
  postingTrend: number;        // QoQ % change
  estimatedSalary: number;     // Median from Adzuna salary data
  hnMentions: number;          // HN discussion volume
  closestExistingRole: string; // Slug of most similar tracked role
  similarityScore: number;     // 0-100 how similar to existing role
  signalStrength: 'emerging' | 'growing' | 'establishing';
}
```

**Signal strength tiers:**

| Tier | Criteria |
|---|---|
| **Emerging** | 20-50 postings, first seen within 6 months |
| **Growing** | 50-150 postings, or >200% QoQ growth |
| **Establishing** | 150+ postings, stable growth — candidate for index inclusion |

### 4. Closest Existing Role Mapping

Compare each emerging title's top skills (from Adzuna posting descriptions) against tracked roles' posting analysis skills. The role with highest skill overlap is the "closest existing role."

This helps practitioners understand: "This emerging role is closest to what you do as a [existing role]."

## Data Storage

### Seed File (Curated Starter List)

```typescript
// src/data/emergingRolesSeed.ts

export const EMERGING_ROLE_SEEDS: Partial<EmergingRole>[] = [
  { title: 'AI Design Lead', slug: 'ai-design-lead', closestExistingRole: 'creative-director' },
  { title: 'Design Technologist', slug: 'design-technologist', closestExistingRole: 'design-systems-designer' },
  { title: 'Content Engineer', slug: 'content-engineer', closestExistingRole: 'content-strategist' },
  { title: 'Creative AI Strategist', slug: 'creative-ai-strategist', closestExistingRole: 'creative-director' },
  { title: 'Prompt Designer', slug: 'prompt-designer', closestExistingRole: 'ux-writer' },
  { title: 'AI Product Designer', slug: 'ai-product-designer', closestExistingRole: 'product-designer' },
];
```

### Cached Results

`src/data/emerging-roles.json` — refreshed weekly alongside snapshots. Written by a new script:

```bash
scripts/refresh-emerging.mjs
```

### API Route

`GET /api/emerging` — returns current emerging roles data.

## Page Design (`/emerging`)

### Hero Section
- Title: "Emerging Roles Radar"
- Subtitle: "Job titles appearing in the market that don't exist in our index yet."
- Context: "These roles are being born in real time — surfacing in postings, discussed in communities, and beginning to establish salary ranges."

### Radar Grid
Each emerging role as a card:

```
┌──────────────────────────────────────┐
│ AI DESIGN LEAD            GROWING    │
│                                      │
│ 142 postings          ↑ 340% QoQ    │
│ Est. salary: $165k                   │
│ Closest to: Creative Director        │
│                                      │
│ HN mentions: 47 (last 90 days)      │
│ First detected: Nov 2025             │
└──────────────────────────────────────┘
```

- Cards sorted by signal strength (Establishing → Growing → Emerging)
- Signal strength badge: color-coded pill (green/amber/orange)
- "Closest to" links to the existing role's deep-dive page

### Methodology Note
Bottom of page: Brief explanation of how emerging roles are detected, with link to `/methodology`.

## Refresh Pipeline

Add to `scripts/refresh-emerging.mjs`:

1. Run Adzuna title mining (broad creative searches)
2. Score each title against seed list + newly discovered titles
3. Check HN discussion volume for each
4. Compute signal strength
5. Write to `src/data/emerging-roles.json`

Add step to GitHub Actions workflow after snapshot refresh.

## Landing Page Integration

Small section below the leaderboard:

```
EMERGING ROLES RADAR
3 titles gaining traction this month

● AI Design Lead (142 postings, ↑340%)
● Design Technologist (89 postings, ↑180%)
● Content Engineer (67 postings, new)

View all emerging roles →
```

## Dependencies

No new dependencies. Uses existing Adzuna and HN API integrations.

## Files to Create/Modify

| File | Action |
|---|---|
| `src/app/emerging/page.tsx` | **Create** — emerging roles page |
| `src/components/EmergingRolesRadar.tsx` | **Create** — display component |
| `src/components/landing/EmergingCallout.tsx` | **Create** — landing page excerpt |
| `src/lib/emergingRoles.ts` | **Create** — types + scoring logic |
| `src/data/emergingRolesSeed.ts` | **Create** — seed list of known emerging titles |
| `src/data/emerging-roles.json` | **Create** — cached results (auto-generated) |
| `src/app/api/emerging/route.ts` | **Create** — API route |
| `scripts/refresh-emerging.mjs` | **Create** — weekly refresh script |
| `src/lib/apis/adzuna.ts` | **Modify** — add `mineEmergingTitles()` |
| `src/lib/apis/hackernews.ts` | **Modify** — add `searchEmergingDiscussion()` |
| `src/app/page.tsx` | **Modify** — add emerging callout to landing |
| `src/components/Header.tsx` | **Modify** — add "Emerging" nav link |
| `.github/workflows/refresh-snapshots.yml` | **Modify** — add emerging refresh step |

## What NOT to Touch

- Existing 20-role snapshot pipeline — emerging roles are separate data
- Role deep-dive pages — emerging roles get their own page, not mixed in
- AI scoring system — emerging roles don't have AI risk scores (yet)
- Leaderboard — emerging roles appear in a separate callout, not in the main table

## Graduation Path

When an emerging role reaches "Establishing" tier (150+ sustained postings), it becomes a candidate for promotion to the main 20-role index. The process:

1. Create a SOC code mapping
2. Add to `jobTitles.ts`
3. Add TDI score to `aiScoring.ts`
4. Run first snapshot
5. Move from emerging radar to the leaderboard
