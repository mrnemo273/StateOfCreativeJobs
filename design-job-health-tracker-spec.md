# Design Job Health Tracker — Product Spec

## Overview

A single-page web application that tracks the "health" of design job titles over time — monitoring demand, compensation trends, AI impact risk, and industry sentiment. Built for design practitioners and leaders who want an objective, data-informed view of where their role (and adjacent roles) are headed.

**Primary use case:** A Creative Director, Head of Design, or CCO opens the app to get a current read on their job category — is demand up or down? Are salaries compressing? What's the AI risk signal? How does their title compare to adjacent roles?

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components enable clean API-key-safe data fetching; easy Vercel deploy |
| Language | TypeScript | Type safety for data models |
| Styling | Tailwind CSS | Utility-first, fast to build |
| Charts | Recharts | React-native, well-maintained |
| Data (Phase 1) | Static mock JSON | Structured for easy API swap |
| Data (Phase 2) | API routes + external sources | See API Roadmap below |
| Deployment | Vercel | Free tier, works natively with Next.js |

---

## Job Titles (Default Set)

Configurable via a dropdown/toggle. Start with:

- Creative Director
- Chief Creative Officer (CCO)
- Head of Design
- VP of Design
- UX Director
- Design Director
- Brand Director

User can switch between titles at any time. Comparison mode shows two titles side by side.

---

## Data Model

Each job title has a `JobHealthSnapshot` that is refreshed (or in Phase 1, statically loaded):

```typescript
type JobHealthSnapshot = {
  title: string;
  lastUpdated: string; // ISO date

  demand: {
    openingsCount: number;           // Current estimated open roles
    openingsTrend: TrendPoint[];     // Monthly data for last 12 months
    yoyChange: number;               // % change vs. same time last year
    topHiringLocations: string[];    // Top 3–5 cities/regions
  };

  salary: {
    medianUSD: number;
    rangeMin: number;
    rangeMax: number;
    trend: TrendPoint[];             // Quarterly data for last 2 years
    yoyChange: number;               // % change YoY
    topPayingIndustries: string[];
  };

  aiImpact: {
    score: number;                   // 0–100 (0 = low risk, 100 = high risk)
    scoreLabel: string;              // "Low" | "Moderate" | "Elevated" | "High"
    riskFactors: string[];           // Top 3 reasons driving the score
    protectiveFactors: string[];     // Top 3 reasons buffering the risk
    trend: TrendPoint[];             // How score has changed over time
    scoreExplainer: string;          // Plain-language 2–3 sentence summary
  };

  skills: {
    rising: SkillSignal[];           // Skills appearing more in postings
    declining: SkillSignal[];        // Skills appearing less in postings
  };

  sentiment: {
    score: number;                   // -100 to +100
    label: string;                   // "Negative" | "Mixed" | "Neutral" | "Positive"
    recentHeadlines: NewsItem[];     // 4–6 recent relevant headlines
    sources: string[];               // Where sentiment was pulled from
  };
};

type TrendPoint = { date: string; value: number };
type SkillSignal = { skill: string; changePercent: number };
type NewsItem = { headline: string; source: string; url: string; date: string; sentiment: "positive" | "neutral" | "negative" };
```

---

## UI Layout

### Global Header
- App name + tagline: *"Real-time health signals for design roles"*
- Job title selector (dropdown, defaults to "Creative Director")
- Compare toggle — enables side-by-side view of a second title
- Last updated timestamp

---

### Section 1 — Health Score Summary (Hero)

A top-of-page summary row with 4 stat cards:

| Card | Metric | Visual |
|---|---|---|
| **Demand** | # open roles + YoY change arrow | Trend sparkline |
| **Salary** | Median salary + YoY change | Trend sparkline |
| **AI Risk** | Score 0–100 + label | Color-coded pill (green/yellow/orange/red) |
| **Sentiment** | Score + label | Color-coded pill |

Each card is clickable and anchors to the detailed section below.

---

### Section 2 — Demand

- Line chart: monthly open role count, last 12 months
- Key stats: current count, YoY %, top hiring locations (tag chips)
- Callout: Notable demand shift (e.g., "CD roles up 14% since Q3 — driven primarily by tech and fintech sectors")

---

### Section 3 — Salary Trends

- Line chart: median salary, quarterly, last 2 years
- Range bar showing min/median/max for current period
- Key stats: YoY change, top-paying industries
- Callout: Notable salary signal (e.g., "Salary compression detected in mid-market companies; enterprise ranges holding steady")

---

### Section 4 — AI Impact

This is the signature section. It should feel analytical and objective — not alarmist.

**Layout:**
- Large AI Risk Score gauge or meter (0–100)
- Color: green (0–25), yellow (26–50), orange (51–75), red (76–100)
- Score trend over time (line chart showing last 4 quarters)
- Two columns below the score:
  - **Risk Factors** (what's driving the score up)
  - **Protective Factors** (what's buffering the role from AI displacement)
- Plain-language explainer paragraph beneath

**Example risk factors for Creative Director:**
- AI-generated visual content is replacing junior production tasks
- Prompt-based ideation tools reducing dependency on concept iteration
- Ad platforms automating asset resizing and copy variants

**Example protective factors:**
- Strategic brand decision-making requires organizational context AI lacks
- Cross-functional leadership and stakeholder management remain human
- Cultural and taste arbitration still commands premium

---

### Section 5 — Skills Signal

Two-column layout:

| Rising Skills | Declining Skills |
|---|---|
| AI creative direction | Print production |
| Prompt engineering for design | Static asset creation |
| Systems thinking / design ops | Manual retouching |
| Motion + video direction | Layout execution |

Visual: horizontal bar with % change indicator (green for rising, red for declining).

---

### Section 6 — Sentiment & News

- Sentiment score bar (−100 to +100)
- Source attribution (e.g., "Based on LinkedIn, Reddit r/design, industry press")
- News feed: 4–6 cards with headline, source, date, and sentiment color tag
- Refresh button (for Phase 2 live data)

---

### Footer — Compare Mode

When comparison mode is active, the full layout renders two columns (one per title) so all sections can be read side by side. On mobile, this collapses to tabbed view.

---

## Phase 1 — Mock Data Implementation

All data lives in `/data/mockSnapshots.ts` as static JSON matching the `JobHealthSnapshot` type. One snapshot per default job title.

**Goal:** Build the full UI, charts, and layout against realistic static data so that swapping in live APIs in Phase 2 requires only replacing data-fetching logic — not rebuilding components.

### File Structure

```
/app
  /page.tsx                  ← Main SPA page
  /layout.tsx                ← Root layout
/components
  /Header.tsx
  /HealthScoreSummary.tsx
  /DemandSection.tsx
  /SalarySection.tsx
  /AIImpactSection.tsx
  /SkillsSignalSection.tsx
  /SentimentSection.tsx
  /CompareLayout.tsx
  /ui/
    StatCard.tsx
    TrendChart.tsx
    Sparkline.tsx
    ScoreGauge.tsx
    NewsCard.tsx
    SkillBar.tsx
/data
  /mockSnapshots.ts          ← All mock data
/types
  /index.ts                  ← JobHealthSnapshot and related types
/lib
  /dataService.ts            ← Abstraction layer; returns mock data now, real APIs later
```

---

## Phase 2 — API Roadmap

When ready to go live, swap the data layer (`/lib/dataService.ts`) with these sources:

| Data Type | Recommended Source |
|---|---|
| Job openings | LinkedIn Jobs API, Indeed Publisher API, or Greenhouse/Lever aggregators |
| Salary data | Levels.fyi (scrape), Glassdoor API, Bureau of Labor Statistics OES |
| AI impact score | Custom — synthesize from: arxiv AI automation research, task-automation taxonomies (e.g. O*NET), news sentiment |
| Skills in postings | Lightcast (formerly EMSI) — has a dedicated skills-from-JD API |
| News & sentiment | NewsAPI.org + Claude API for sentiment scoring |
| Trending discussion | Reddit API (r/design, r/graphic_design), optionally LinkedIn |

All API calls should be handled server-side via Next.js API routes (`/app/api/`) to keep keys out of the client.

---

## Design Direction

- **Dark mode default** — data-dense dashboards read better on dark backgrounds
- **Monochromatic with signal color** — use color purposefully: green/yellow/orange/red only for health signals, not decoration
- **Dense but breathable** — this is a professional tool, not a consumer app; information density is a feature
- **Typography:** Inter or IBM Plex Sans — clean, technical, readable at small sizes
- **No stock illustrations** — data visualizations and numbers do the work

---

## Out of Scope (Phase 1)

- User accounts / saved preferences
- Historical snapshot storage (no database)
- Mobile-first layout (desktop-first, responsive later)
- Real-time data refresh
- Email alerts or notifications

---

## Success Criteria

The app is successful when a design leader can open it and in under 60 seconds answer:

1. Is demand for my title growing or shrinking?
2. Are salaries for my title keeping up with inflation?
3. How exposed is my role to AI displacement — and why?
4. What skills should I be building or shedding?
5. What's the current industry conversation about my role?
