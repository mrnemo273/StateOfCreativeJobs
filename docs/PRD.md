# Product Requirements Document (PRD)

## State of Creative Jobs — v1.0

**Last updated:** 2026-03-12
**Related docs:** `GOALS.md` | `TRD.md` | `DESIGN_SYSTEM.md`

---

## 1. Product Overview

State of Creative Jobs is a web-based labor market research tool that tracks the health of 20 creative and design job titles. It monitors demand volume, compensation trends, AI displacement risk, and practitioner sentiment, presenting findings as a weekly-updated research index.

The product has two views: a landing page (the Index) and individual role deep-dive dashboards.

---

## 2. Users & Use Cases

**Primary users:** Creative practitioners and design leaders who want data-informed visibility into how their role is evolving.

**Core use cases:**

- A Creative Director checks whether demand for their title is growing or contracting relative to adjacent roles
- A Product Designer compares AI risk scores across the Product & UX cluster to inform career planning
- A Head of Design uses salary and demand data to benchmark compensation for their team
- A Copywriter reads the Role Intelligence synthesis to understand which skills to invest in
- A journalist or researcher uses the Index as a data source for reporting on AI's impact on creative work

---

## 3. Tracked Roles

20 titles organized into 4 clusters:

**Cluster A — Design Leadership** (5 roles): Creative Director, Design Director, Head of Design, VP of Design, Chief Creative Officer

**Cluster B — Product & UX Design** (5 roles): Senior Product Designer, UX Designer, Product Designer, UX Researcher, Design Systems Designer

**Cluster C — Brand & Visual Design** (5 roles): Brand Designer, Graphic Designer, Visual Designer, Art Director, Motion Designer

**Cluster D — Content & Copy** (5 roles): Copywriter, Content Strategist, UX Writer, Creative Copywriter, Content Designer

Each role has a unique slug (e.g., `creative-director`, `senior-product-designer`) used throughout the data layer and URL routing.

---

## 4. Information Architecture

### 4.1 Landing Page (`/`)

The entry point. Frames the project as a research index, not a tool. Server-rendered using pre-cached data (no runtime API calls on page load).

**Sections in order:**

1. **Masthead** — Title ("State of Creative Jobs"), subtitle, no hero image
2. **Opening Copy** — Editorial introduction in two-column layout explaining what the index tracks and why
3. **Market Conditions Bar** — 5 aggregate stats in a horizontal strip: Roles Tracked (20), Total Open Positions, Avg AI Risk Score, Roles in YoY Decline, Highest Risk Role
4. **The Index (Leaderboard)** — Sortable table of all 20 roles with columns: Role (linked to deep-dive), Cluster badge, Open Roles, YoY Change, Sparkline trend, Median Salary, AI Risk pill. Default sort: YoY Change ascending (most distressed roles first)

### 4.2 Role Deep-Dive (`/role/[slug]`)

The analytical view. Client-side rendered. Fetches live snapshot data on load, falls back to cached data on failure.

**Sections in order:**

1. **Role Selector** — Dropdown to switch between all 20 titles
2. **Hero** — Role title (large monospaced type), cluster label, description
3. **Role Verdict** — Summary banner: demand direction, salary, AI risk at a glance, with macro context from FRED data
4. **Demand** — Trend chart (Google Trends interest over time), open postings count (Adzuna), YoY change, top hiring locations. Includes FRED macro overlay when available.
5. **Salary** — Median salary (BLS), P10-P90 range, YoY change, top-paying industries. Includes ACS Census metro breakdown when available.
6. **Market View (Beyond the Job Posting)** — Phase 4 enrichment: FRED macro context (knowledge-work employment index, recession bands), NEA supply data (moonlighting ratio, total creative workforce), Upwork freelance structure data (staff vs. freelance split, wage gap)
7. **AI Impact** — Composite AI risk score (0-100), gauge visualization, risk label (Low/Moderate/Elevated/High), risk factors vs. protective factors in two columns, displacing AI tools list, score explainer
8. **Skills Signal** — Rising vs. declining skills in two-column layout with percentage change bars
9. **Posting Analysis** — Top skills by frequency, common responsibilities, role definition narrative
10. **Role Intelligence** — AI-synthesized editorial section powered by Anthropic API: Role Outlook paragraph, 3 Skill Pivot recommendations, Comparable Roles table. Cached 24 hours per role.
11. **Sentiment & Community** — Overall sentiment score, news headlines (GNews), Hacker News community posts with quotes and keyword analysis, AI/layoff/hiring mention counts

---

## 5. Data Sources

| Data Point | Source | Refresh Cadence |
|---|---|---|
| Job postings volume | Adzuna API | Weekly |
| Salary (median, P10, P90) | Bureau of Labor Statistics (OES) | Weekly (annual data) |
| Demand trend (interest over time) | Google Trends via SerpAPI | Weekly |
| News headlines + sentiment | GNews API + keyword sentiment scoring | Weekly |
| Task/skill data + AI risk base score | O*NET API | Weekly |
| Community signals | Hacker News API (search + top stories) | Weekly |
| Role Intelligence synthesis | Anthropic API (Claude) | 24-hour cache per role |
| FRED macro data | Federal Reserve FRED API | Weekly |
| ACS Census demographics | Census Bureau ACS S2401 | Seeded / annual |
| NEA creative workforce | NEA Artists in the Workforce | Seeded / annual |
| Upwork freelance data | Upwork Freelance Forward report | Seeded / annual |

---

## 6. AI Risk Scoring Model

The AI risk score is a composite of two axes:

- **Axis 1 — O*NET Task Automability (40% weight):** Normalized 0-100 score derived from analyzing O*NET task descriptions for each role's SOC code. Tasks are classified as automatable (risk) or human-centric (protective).
- **Axis 2 — Tool Displacement Index (60% weight):** Manually curated score per role reflecting how directly named AI tools target the role's primary output. Maintained in `src/lib/aiScoring.ts`.

**Formula:** `composite = round((onetScore * 0.4) + (tdiScore * 0.6))`

**Risk tiers:**

| Score Range | Label | Visual |
|---|---|---|
| 0-24 | Low | Gray |
| 25-49 | Moderate | Amber |
| 50-69 | Elevated | Orange |
| 70-100 | High | Red/crimson |

---

## 7. Role Intelligence (AI-Powered)

Three components per role, generated by Claude via Anthropic API:

1. **Role Outlook** — 3-5 sentence synthesis of all snapshot data into a practitioner-voiced market assessment
2. **Skill Pivot** — 3 numbered, specific, actionable career recommendations based on skills, AI risk, and demand data
3. **Comparable Roles** — Computed (not AI-generated): roles with lower AI risk and higher salary or demand, sorted by salary

Intelligence is cached 24 hours per role via Next.js `unstable_cache`. If the API call fails, the section shows "Analysis unavailable" and never breaks the page.

---

## 8. Enrichment Layers (Phase 4)

Four additional data sources that answer deeper questions:

| Source | Question Answered | Integration Point |
|---|---|---|
| ACS (Census S2401) | Who holds these jobs? Metro wages, income distribution, self-employment | Salary section overlay |
| NEA (Artists in Workforce) | How big is real supply? Moonlighting ratio, true workforce size | Market View section |
| Upwork (Freelance Forward) | Staff or freelance? Employment structure, wage gap | Market View section |
| FRED (Federal Reserve) | Role-specific or economy-wide? Recession bands, knowledge-work index | Demand section overlay + Verdict banner |

Enrichment data is seeded/cached and loaded via API routes (`/api/enrichment/[slug]` and `/api/enrichment/market`).

---

## 9. Data Refresh Pipeline

**Weekly automated refresh (GitHub Actions):**

1. Triggered every Monday at 6am UTC via cron, or manually via `workflow_dispatch`
2. Runs `scripts/refresh-snapshots.sh` which calls the snapshot API for all 20 roles
3. Writes updated JSON to `src/data/snapshots/[slug].json` and `src/data/intelligence/[slug].json`
4. Commits and pushes updated data files
5. Vercel auto-deploys from the push

**Landing page cache:** `scripts/generate-landing-cache.js` builds `src/lib/cachedLandingData.ts` from snapshot data for static generation.

**Enrichment cache:** `scripts/refresh-enrichment.mjs` fetches and caches enrichment data to `src/data/enrichment-seed.json` and `src/lib/cachedEnrichmentData.ts`.

---

## 10. Current Status & Completed Phases

| Phase | Status | What It Delivered |
|---|---|---|
| Phase 1 — UI Shell | Complete | Full dashboard UI with mock data, all components, design system implementation |
| Phase 2A — AI Risk Overhaul | Complete | Two-axis composite scoring (O*NET + TDI), 4-tier risk labels, aiScoring.ts |
| Phase 2B — Role Intelligence | Complete | Anthropic API integration, Role Outlook / Skill Pivot / Comparable Roles |
| Phase 3 — Landing Page | Complete | Research index landing page, leaderboard, market conditions bar, rerouted architecture |
| Phase 4 — Enrichment Layers | Complete | ACS, NEA, Upwork, FRED data overlays, Market View section, Role Verdict banner |

---

## 11. Future Considerations

These are not committed roadmap items but areas identified for potential future work:

- **Compare Mode:** Side-by-side view of two roles (originally scoped for Phase 3, deferred)
- **Mobile responsive layout:** Currently desktop-first; responsive improvements planned
- **Historical trend storage:** Database-backed longitudinal data vs. current file-based approach
- **Additional roles:** Expanding beyond 20 titles based on user interest
- **Email digest / alerts:** Periodic summary for tracked roles
- **Methodology page:** Dedicated page explaining data sources and scoring methodology in detail
