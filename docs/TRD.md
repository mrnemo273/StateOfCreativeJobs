# Technical Requirements Document (TRD)

## State of Creative Jobs — v1.0

**Last updated:** 2026-03-12
**Related docs:** `GOALS.md` | `PRD.md` | `DESIGN_SYSTEM.md`

---

## 1. Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js (App Router) | 14.2.x | Server components + client components |
| Language | TypeScript | 5.x | Strict mode |
| Styling | Tailwind CSS | 3.4.x | Extended with design system tokens |
| Charts | Recharts | 3.8.x | React-native charting |
| AI SDK | @anthropic-ai/sdk | 0.78.x | Role Intelligence synthesis |
| Utilities | clsx | 2.1.x | Conditional classnames |
| Deployment | Vercel | — | Auto-deploy from GitHub `main` |
| CI/CD | GitHub Actions | — | Weekly data refresh workflow |

---

## 2. Project Structure

```
StateOfCreativeJobs/
├── docs/                          # Project documentation (you are here)
│   ├── GOALS.md                   # Vision, mission, guiding principles
│   ├── PRD.md                     # Product Requirements Document
│   ├── TRD.md                     # Technical Requirements Document
│   ├── DESIGN_SYSTEM.md           # Visual design specification
│   └── archive/                   # Historical phase specs (reference only)
│       ├── PHASE2-PLAN-A.md
│       ├── PHASE2-PLAN-B.md
│       ├── PHASE3-LANDING-PAGE.md
│       ├── PHASE4-ENRICHMENT-LAYERS.md
│       ├── claude-code-kickoff-prompt.md
│       ├── design-job-health-tracker-spec.md
│       └── JOB_TITLES.md
│
├── scripts/
│   ├── refresh-snapshots.sh       # Weekly snapshot refresh (called by GH Actions)
│   ├── refresh-enrichment.mjs     # Enrichment data refresh
│   └── generate-landing-cache.js  # Builds static landing page cache
│
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (fonts, global styles)
│   │   ├── page.tsx               # Landing page (server component)
│   │   ├── globals.css            # CSS custom properties (design tokens)
│   │   ├── role/
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # Role deep-dive (client component)
│   │   └── api/
│   │       ├── snapshot/
│   │       │   └── [slug]/
│   │       │       └── route.ts   # Live snapshot builder endpoint
│   │       ├── role-intelligence/
│   │       │   └── [slug]/
│   │       │       └── route.ts   # Anthropic-powered role analysis
│   │       └── enrichment/
│   │           ├── [slug]/
│   │           │   └── route.ts   # Per-role enrichment data
│   │           └── market/
│   │               └── route.ts   # Market-wide enrichment data
│   │
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── HealthScoreSummary.tsx
│   │   ├── DemandSection.tsx
│   │   ├── SalarySection.tsx
│   │   ├── AIImpactSection.tsx
│   │   ├── SkillsSignalSection.tsx
│   │   ├── PostingAnalysisSection.tsx
│   │   ├── RoleIntelligence.tsx
│   │   ├── SentimentSection.tsx
│   │   ├── MarketView.tsx         # Phase 4 enrichment display
│   │   ├── RoleVerdict.tsx        # Phase 4 summary verdict banner
│   │   ├── ui/
│   │   │   ├── DataValue.tsx      # Monospace number wrapper
│   │   │   ├── SectionLabel.tsx   # Uppercase tracked label wrapper
│   │   │   ├── TrendBadge.tsx     # ↑/↓/→ directional indicator
│   │   │   ├── StatCard.tsx       # Metric card with sparkline slot
│   │   │   ├── TrendChart.tsx     # Full Recharts line chart
│   │   │   ├── Sparkline.tsx      # Minimal inline chart
│   │   │   ├── ScoreGauge.tsx     # Horizontal 0-100 meter
│   │   │   ├── SkillBar.tsx       # Horizontal skill frequency bar
│   │   │   ├── NewsCard.tsx       # Headline card with sentiment tag
│   │   │   ├── HairlineRule.tsx   # 1px section divider
│   │   │   ├── SourceBadge.tsx    # Data source attribution badge
│   │   │   ├── FREDChart.tsx      # FRED macro overlay chart
│   │   │   └── StackedAreaChart.tsx # Stacked area for enrichment data
│   │   └── landing/
│   │       ├── RoleLeaderboard.tsx # Sortable 20-role table
│   │       ├── InlineSparkline.tsx # SVG sparkline for leaderboard rows
│   │       ├── MarketConditionsBar.tsx # 5-stat aggregate strip
│   │       └── AuthorBio.tsx      # Author attribution component
│   │
│   ├── lib/
│   │   ├── dataService.ts         # Client-side data access (mock fallback)
│   │   ├── dataService.server.ts  # Server-side data access
│   │   ├── buildSnapshot.ts       # Orchestrates all API calls into JobHealthSnapshot
│   │   ├── aiScoring.ts           # AI risk: TDI scores + composite calculation
│   │   ├── chartTheme.ts          # Shared Recharts theme tokens
│   │   ├── landingData.ts         # Landing page types + computeMarketConditions()
│   │   ├── landingData.server.ts  # Server-side landing data reader
│   │   ├── cachedLandingData.ts   # Auto-generated static cache for landing page
│   │   ├── enrichmentData.ts      # Enrichment type definitions
│   │   ├── enrichmentData.server.ts # Server-side enrichment data reader
│   │   ├── cachedEnrichmentData.ts  # Auto-generated enrichment cache
│   │   └── apis/
│   │       ├── adzuna.ts          # Job postings volume
│   │       ├── bls.ts             # BLS salary data
│   │       ├── gnews.ts           # News headlines
│   │       ├── onet.ts            # O*NET tasks/skills + base AI score
│   │       ├── googletrends.ts    # Google Trends via SerpAPI
│   │       ├── hackernews.ts      # HN community signals
│   │       ├── sentiment.ts       # Keyword-based sentiment scoring
│   │       └── roleIntelligence.ts # Anthropic API for Role Intelligence
│   │
│   ├── data/
│   │   ├── jobTitles.ts           # TRACKED_JOB_TITLES constant (20 roles)
│   │   ├── mockSnapshots.ts       # Mock data fallback for all roles
│   │   ├── enrichment-seed.json   # Seeded enrichment data
│   │   ├── snapshots/             # Live snapshot JSON files (20 files)
│   │   │   ├── creative-director.json
│   │   │   ├── copywriter.json
│   │   │   └── ... (one per role)
│   │   └── intelligence/          # Cached role intelligence JSON (20 files)
│   │       ├── creative-director.json
│   │       ├── copywriter.json
│   │       └── ... (one per role)
│   │
│   └── types/
│       └── index.ts               # All TypeScript type definitions
│
├── .github/
│   └── workflows/
│       └── refresh-snapshots.yml  # Weekly GH Actions cron job
│
├── .env.local                     # Local environment variables (not committed)
├── .env.local.example             # Template showing required env vars
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
├── vercel.json
└── README.md
```

---

## 3. Type System

All types are defined in `src/types/index.ts`. The central type is `JobHealthSnapshot`:

```typescript
type JobHealthSnapshot = {
  title: string;
  slug: string;
  cluster: JobCluster;          // 'design-leadership' | 'product-ux' | 'brand-visual' | 'content-copy'
  description: string;
  lastUpdated: string;          // ISO date

  demand: {
    openingsCount: number;
    openingsTrend: TrendPoint[];
    yoyChange: number;
    topHiringLocations: string[];
  };

  salary: {
    medianUSD: number;
    rangeMin: number;            // P10
    rangeMax: number;            // P90
    trend: TrendPoint[];
    yoyChange: number;
    topPayingIndustries: string[];
  };

  aiImpact: {
    score: number;               // 0-100 composite
    scoreLabel: 'Low' | 'Moderate' | 'Elevated' | 'High';
    riskFactors: string[];
    protectiveFactors: string[];
    tools: string[];             // Named AI tools displacing this role
    trend: TrendPoint[];
    scoreExplainer: string;
  };

  skills: {
    rising: SkillSignal[];
    declining: SkillSignal[];
  };

  sentiment: {
    score: number;               // -100 to +100
    label: 'Negative' | 'Mixed' | 'Neutral' | 'Positive';
    recentHeadlines: NewsItem[];
    sources: string[];
    communityPosts: { title: string; source: string; url: string; score: number; created: string }[];
    communityQuotes: { text: string; source: string; score: number }[];
    communityKeywords: { word: string; count: number }[];
    layoffMentions: number;
    hiringMentions: number;
    aiMentions: number;
  };

  postingAnalysis: PostingAnalysis;
};
```

Supporting types: `TrendPoint`, `SkillSignal`, `NewsItem`, `PostingAnalysis`, `JobCluster`, `JobTitle`.

Enrichment types are defined in `src/lib/enrichmentData.ts`: `RoleEnrichment` (per-role ACS/NEA/Upwork data) and `MarketEnrichment` (FRED macro data).

---

## 4. Data Flow Architecture

### 4.1 Snapshot Build Pipeline

```
External APIs (Adzuna, BLS, GNews, O*NET, Google Trends, HN)
        │
        ▼
  buildSnapshot.ts  ← orchestrates all API calls in parallel
        │
        ├── aiScoring.ts (TDI scores + composite formula)
        ├── sentiment.ts (keyword-based scoring)
        │
        ▼
  JobHealthSnapshot object
        │
        ├── Written to src/data/snapshots/[slug].json (weekly refresh)
        └── Returned via /api/snapshot/[slug] route (on-demand)
```

### 4.2 Landing Page Data Flow

```
src/data/snapshots/*.json
        │
        ▼
  generate-landing-cache.js (script)
        │
        ▼
  src/lib/cachedLandingData.ts (static TypeScript export)
        │
        ▼
  app/page.tsx (server component, reads at build time)
```

### 4.3 Role Intelligence Flow

```
  /api/role-intelligence/[slug] route
        │
        ├── Reads snapshot data
        ├── Calls Anthropic API (Claude) for Outlook + Skill Pivot
        ├── Computes Comparable Roles locally
        │
        ▼
  RoleIntelligence JSON (cached 24h via unstable_cache)
        │
        ▼
  RoleIntelligence.tsx (client component, fetches on mount)
```

### 4.4 Enrichment Data Flow

```
  refresh-enrichment.mjs (script)
        │
        ├── Fetches FRED, ACS, NEA, Upwork data
        │
        ▼
  src/data/enrichment-seed.json + src/lib/cachedEnrichmentData.ts
        │
        ▼
  /api/enrichment/[slug] and /api/enrichment/market routes
        │
        ▼
  Role deep-dive page (DemandSection, SalarySection, MarketView, RoleVerdict)
```

---

## 5. API Routes

| Route | Method | Purpose | Cache |
|---|---|---|---|
| `/api/snapshot/[slug]` | GET | Build live snapshot from all external APIs | None (real-time) |
| `/api/role-intelligence/[slug]` | GET | Claude-powered role analysis | 24h (unstable_cache) |
| `/api/enrichment/[slug]` | GET | Per-role enrichment (ACS/NEA/Upwork) | Static (file-based) |
| `/api/enrichment/market` | GET | Market-wide enrichment (FRED) | Static (file-based) |

---

## 6. External API Integration Details

### Adzuna (`src/lib/apis/adzuna.ts`)
- Endpoint: `api.adzuna.com/v1/api/jobs/us/search`
- Returns: posting count + top hiring locations
- Env vars: `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`

### BLS (`src/lib/apis/bls.ts`)
- Endpoint: `api.bls.gov/publicAPI/v2/timeseries/data/`
- Returns: annual mean wage, P10, P90, YoY change
- Env var: `BLS_API_KEY`
- Maps roles to OES series IDs

### GNews (`src/lib/apis/gnews.ts`)
- Endpoint: `gnews.io/api/v4/search`
- Returns: news headlines with source and date
- Env var: `GNEWS_API_KEY`

### O*NET (`src/lib/apis/onet.ts`)
- Endpoint: `api-v2.onetcenter.org/online/occupations/`
- Returns: tasks, skills, technology skills for SOC codes
- Env var: `ONET_API_KEY`
- Also computes base AI impact score from task automability

### Google Trends (`src/lib/apis/googletrends.ts`)
- Via SerpAPI proxy
- Returns: interest-over-time data points, YoY change
- Env var: `SERPAPI_KEY`

### Hacker News (`src/lib/apis/hackernews.ts`)
- Direct HN Algolia API (no key needed)
- Returns: relevant posts, quotes, keyword frequency, AI/layoff/hiring mention counts

### Anthropic (`src/lib/apis/roleIntelligence.ts`)
- SDK: `@anthropic-ai/sdk`
- Model: `claude-sonnet-4-20250514`
- Makes 2 API calls per role: outlook paragraph + skill pivot recommendations
- Env var: `ANTHROPIC_API_KEY`

### Sentiment (`src/lib/apis/sentiment.ts`)
- Local keyword-based scoring (no external API)
- Blends GNews headlines + HN story titles
- Returns: score (-100 to +100) + label

---

## 7. Environment Variables

Required in `.env.local` (and as Vercel/GitHub secrets):

```
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
GNEWS_API_KEY=
BLS_API_KEY=
SERPAPI_KEY=
ONET_API_KEY=            # Used by src/lib/apis/onet.ts (X-API-Key header)
ANTHROPIC_API_KEY=       # Used by @anthropic-ai/sdk for Role Intelligence
REFRESH_SECRET=          # Used by refresh scripts for auth
```

See `.env.local.example` for the template with signup links for each service.

---

## 8. Build & Deployment

**Local development:**
```bash
npm install
npm run dev          # Starts Next.js dev server
```

**Production build:**
```bash
npm run build        # Next.js production build
npm start            # Serve production build locally
```

**Deployment:** Vercel auto-deploys from `main` branch pushes. Config in `vercel.json` (framework: nextjs).

**Weekly data refresh:** GitHub Actions workflow (`.github/workflows/refresh-snapshots.yml`):
- Cron: `0 6 * * 1` (Mondays 6am UTC)
- Runs: `npm ci` → `npm run build` → `bash scripts/refresh-snapshots.sh`
- Commits updated `src/data/snapshots/` and `src/data/intelligence/` files
- Push triggers Vercel auto-deploy

---

## 9. Fallback & Error Handling Strategy

The application is designed to always render, even when external APIs fail:

1. **Per-API fallback:** In `buildSnapshot.ts`, each API call (Adzuna, BLS, GNews, O*NET, Google Trends, HN) is wrapped individually. If any single API fails, mock data from `mockSnapshots.ts` is used for that section. Other sections still use live data.
2. **Snapshot-level fallback:** The `/api/snapshot/[slug]` route returns cached JSON files from `src/data/snapshots/` if the live build fails entirely.
3. **Client-side fallback:** The role deep-dive page (`role/[slug]/page.tsx`) calls the API first, then falls back to `getSnapshot()` from the client-side data service which reads mock data.
4. **Role Intelligence graceful degradation:** If the Anthropic API call fails, the component shows "Analysis unavailable" — it never crashes the page.
5. **Landing page static data:** The landing page reads from `cachedLandingData.ts`, a pre-built static export. It never makes runtime API calls.
6. **Enrichment graceful loading:** Enrichment sections only render when data is available. Missing enrichment data simply means those overlay sections don't appear.

---

## 10. AI Scoring Implementation

File: `src/lib/aiScoring.ts`

**TDI_SCORES:** A manually curated `Record<string, { score: number; tools: string[] }>` mapping each role slug to its Tool Displacement Index score (0-100) and the specific AI tools targeting that role.

**computeAIRiskScore(onetScore, slug):** Returns `round((onetScore * 0.4) + (tdiScore * 0.6))`, clamped 0-100.

**getRiskLabel(score):** Maps score to tier: <25 Low, <50 Moderate, <70 Elevated, >=70 High.

**getDisplacingTools(slug):** Returns the tools array for a given role.

When updating TDI scores: only edit `aiScoring.ts`. The scores propagate automatically through `buildSnapshot.ts` into snapshots.

---

## 11. Component Design Rules

All components must follow `DESIGN_SYSTEM.md`. Key enforced rules:

- **Zero `rounded-*`** Tailwind classes — all corners are sharp (rectilinear)
- **Zero `shadow-*`** Tailwind classes — depth via 1px borders only
- **All numeric values** use `font-mono` + `tabular-nums` (enforced via `<DataValue>` component)
- **All section labels** are uppercase, tracked at `tracking-widest`, color `text-mid` (enforced via `<SectionLabel>` component)
- **Background:** `bg-paper` (#F5F3EE), cards: `bg-white`, borders: `border-light`
- **Signal colors** (`text-up` green, `text-down` red, `text-neutral` brown) used ONLY for data with directional meaning
- **Accent color** (deep navy `#1A1A6B`) appears at most once per view
- **Charts:** 1.5px stroke, no fill, no dots except on hover, horizontal grid lines only, monospaced axis labels

---

## 12. File Ownership & Modification Guidelines

When making changes, understand which files own which concerns:

| Concern | Owner File(s) | Safe to Modify? |
|---|---|---|
| Type definitions | `src/types/index.ts` | Yes — add fields, don't remove |
| AI risk scoring | `src/lib/aiScoring.ts` | Yes — update TDI scores as needed |
| Snapshot orchestration | `src/lib/buildSnapshot.ts` | Carefully — this coordinates all APIs |
| Individual API clients | `src/lib/apis/*.ts` | Yes — each is self-contained |
| Role Intelligence | `src/lib/apis/roleIntelligence.ts` | Yes — prompts can be refined |
| Design tokens (CSS) | `src/app/globals.css` | Only to add new tokens |
| Tailwind config | `tailwind.config.ts` | Only to add new token mappings |
| Mock data | `src/data/mockSnapshots.ts` | Yes — add/update mock entries |
| Job titles list | `src/data/jobTitles.ts` | To add new tracked roles |
| Cached data files | `src/lib/cached*.ts` | **Never manually** — auto-generated by scripts |
| Snapshot JSON | `src/data/snapshots/*.json` | **Never manually** — written by refresh pipeline |
| Intelligence JSON | `src/data/intelligence/*.json` | **Never manually** — written by refresh pipeline |

**Golden rule:** If a file says "auto-generated" or "do not edit manually" at the top, don't edit it. Modify the script that generates it instead.

---

## 13. Adding a New Tracked Role

To add a new role (e.g., "Design Engineer"):

1. Add entry to `src/data/jobTitles.ts` TRACKED_JOB_TITLES array with title, slug, and cluster
2. Add TDI score + tools to `src/lib/aiScoring.ts` TDI_SCORES
3. Add description to ROLE_DESCRIPTIONS in `src/lib/buildSnapshot.ts`
4. Add mock data entry in `src/data/mockSnapshots.ts`
5. Run refresh script to generate initial snapshot
6. Landing page cache will include it after next `generate-landing-cache.js` run

---

## 14. Adding a New Data Source

To integrate a new external API:

1. Create `src/lib/apis/newSource.ts` with fetch function and types
2. Import and call in `buildSnapshot.ts` (add to the parallel Promise.all)
3. Add fallback logic (use mock data if API fails)
4. Add any new fields to `JobHealthSnapshot` type in `src/types/index.ts`
5. Update relevant UI component to display new data
6. Add env var to `.env.local.example` and document in this TRD
7. Add secret to GitHub Actions workflow if needed for weekly refresh
