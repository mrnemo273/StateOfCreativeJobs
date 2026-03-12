# E14 — Methodology Page

**Status:** Queued
**Scope:** Small
**Approved:** 2026-03-12

---

## What This Is

A dedicated `/methodology` page that explains exactly how every number on the site is calculated. Data sources, refresh cadence, scoring formulas, known limitations, and data freshness indicators. Written for a smart skeptic — a journalist or researcher who needs to verify before citing.

## Why It Matters

Any serious research index needs transparent methodology. Without it, the data is just claims. With it, the data becomes citable. This is table stakes for credibility.

## Where It Lives

- **Route:** `/methodology` — new page
- **File:** `src/app/methodology/page.tsx` (server component, static content)
- **Nav:** Add to Header component as a text link (not a primary nav item — secondary, quiet)

## Page Structure

### Section 1 — Overview
One paragraph explaining what the index tracks, how often it refreshes, and the general approach (automated API aggregation + AI synthesis).

### Section 2 — Data Sources
For each source, document:

| Source | What We Pull | Endpoint / Method | Refresh Cadence | Known Limitations |
|---|---|---|---|---|
| **Adzuna** | Job posting counts, top hiring locations | REST API search | Weekly | Covers ~60% of US postings; skews toward posted roles (excludes internal hiring) |
| **BLS (OES)** | Median salary, P10/P90 range, YoY change | Public API v2 timeseries | Weekly (annual underlying data) | Data lags 12-18 months; based on employer surveys, not actual comp |
| **Google Trends** | Interest-over-time index (0-100), YoY change | SerpAPI proxy | Weekly | Relative index, not absolute; search interest ≠ job demand |
| **GNews** | News headlines, publication source, date | REST API search | Weekly | English-language only; headline selection varies by news cycle |
| **O*NET** | Task descriptions, skill requirements, technology skills | REST API v2 | Weekly | SOC code mapping is imperfect; one SOC may cover multiple distinct roles |
| **Hacker News** | Community posts, quotes, keyword frequency | Algolia Search API | Weekly | Tech-skewed audience; not representative of all creative practitioners |
| **Anthropic (Claude)** | Role Intelligence synthesis (outlook, skill pivot) | SDK, claude-sonnet model | 24-hour cache | AI-generated analysis; reflects model's interpretation of data, not independent research |

### Section 3 — AI Risk Scoring
Document the two-axis model clearly:

**Axis 1 — O*NET Task Automability (40% weight)**
- How tasks are classified as automatable vs. human-centric
- Which O*NET fields are used
- Normalization method (0-100 scale)

**Axis 2 — Tool Displacement Index (60% weight)**
- Manually curated score per role
- Based on how directly named AI tools target the role's primary output
- List the criteria used to assign scores
- Acknowledge this is editorial judgment, not algorithmic

**Composite Formula:** `round((onetScore × 0.4) + (tdiScore × 0.6))`

**Risk Tiers:** 0-24 Low | 25-49 Moderate | 50-69 Elevated | 70-100 High

### Section 4 — Sentiment Scoring
- Keyword-based scoring across GNews headlines and HN posts
- Score range: -100 to +100
- Keyword categories: positive (hiring, growth, demand) vs. negative (layoff, cut, decline, replaced)
- Label mapping: <-25 Negative | -25 to 0 Mixed | 0 to 25 Neutral | >25 Positive

### Section 5 — Enrichment Data (Phase 4)
Brief explanation of ACS, NEA, Upwork, and FRED data layers — what they add and how they're sourced. Note that enrichment data is seeded/annual, not weekly.

### Section 6 — Refresh Pipeline
- Weekly cron: Monday 6am UTC via GitHub Actions
- What happens: all 20 roles refreshed → snapshot JSON written → auto-deployed via Vercel
- Landing page uses pre-cached data; role pages fetch live on load with cached fallback

### Section 7 — Known Limitations
Honest list:
- BLS salary data lags 12-18 months
- Adzuna covers subset of total postings
- Google Trends measures search interest, not direct job demand
- AI risk TDI scores are editorial, not algorithmic
- Sentiment scoring is keyword-based (no NLP/ML)
- HN community skews tech; not representative of all creatives
- Role Intelligence is AI-generated synthesis, not independent analysis
- Single-country (US) focus

### Section 8 — Data Freshness
A small table or indicator showing when each data source was last refreshed. Could pull from snapshot `lastUpdated` field.

## Design Rules

- Server component (no client-side JS needed)
- Long-form prose layout — single column, max-width 65ch for readability
- Section headings: `<SectionLabel>` component (uppercase, tracked, mono)
- Tables for structured data, prose for explanations
- No charts or visualizations — this is a text page
- Follow `DESIGN_SYSTEM.md` typography: body in sans-serif, data in mono
- Background: `bg-paper`, same as rest of site

## Files to Create/Modify

| File | Action |
|---|---|
| `src/app/methodology/page.tsx` | **Create** — new server component page |
| `src/components/Header.tsx` | **Modify** — add secondary "Methodology" nav link |

## What NOT to Touch

- No changes to data pipeline, APIs, types, or other components
- Don't add methodology info to the role deep-dive — keep it on its own page
- Don't expose actual API keys or secrets on this page
