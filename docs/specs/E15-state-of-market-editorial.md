# E15 — "State of the Market" Editorial

**Status:** Queued
**Scope:** Medium
**Approved:** 2026-03-12

---

## What This Is

A monthly AI-synthesized editorial essay that identifies macro patterns across all 20 roles, connects dots between clusters, calls out surprises, and names emerging trends. It's the narrative layer the index data is missing — the "so what?" for the entire project.

## Why It Matters

Individual role data is useful. Cross-role narrative is powerful. A monthly editorial turns raw data into insight — the kind of analysis that gets quoted in articles, shared on LinkedIn, and referenced in team planning meetings.

## Where It Lives

- **Route:** `/editorial` — dedicated page listing all monthly editorials
- **Latest editorial also featured on landing page** — a condensed excerpt below the Market Conditions bar
- **File structure:**
  - `src/app/editorial/page.tsx` — editorial archive page
  - `src/app/editorial/[month]/page.tsx` — individual editorial page
  - `src/data/editorials/` — cached editorial JSON files

## Generation Pipeline

### Input
All 20 current snapshots, aggregated into a structured prompt:

```typescript
interface EditorialInput {
  month: string;                    // "March 2026"
  clusterSummaries: {
    cluster: string;
    avgDemandYoY: number;
    avgSalaryYoY: number;
    avgAIRisk: number;
    biggestMover: { role: string; metric: string; change: number };
  }[];
  topMovers: {
    role: string;
    demandYoY: number;
    salaryYoY: number;
    aiRisk: number;
    direction: 'improving' | 'declining';
  }[];
  marketConditions: {
    totalOpenings: number;
    avgAIRisk: number;
    rolesInDecline: number;
    highestRiskRole: string;
  };
}
```

### Anthropic API Call

Single API call to Claude with a carefully structured prompt:

**System prompt:**
```
You are an editorial analyst for a labor market research index covering 20 creative job titles.
Write a monthly market editorial in the voice of a sharp, senior industry analyst.
Tone: The Economist meets AIGA Eye on Design — analytical, direct, zero fluff.
Length: 600-900 words.
Structure:
1. A provocative headline (5-8 words, names the pattern)
2. Opening paragraph naming the month's defining trend
3. 2-3 body sections analyzing specific patterns with data citations
4. Closing paragraph with a forward-looking statement
Never use bullet points. Write in prose paragraphs.
Never editorialize about AI being good or bad — present the data and let readers decide.
Reference specific roles and numbers. Don't generalize.
```

**User prompt:** Structured JSON of all 20 snapshots + cluster aggregations.

### Caching & Storage

- Generated monthly (run via script or manual trigger)
- Saved to `src/data/editorials/YYYY-MM.json`:
  ```json
  {
    "month": "2026-03",
    "headline": "The Great Rebundling",
    "body": "...",
    "generatedAt": "2026-03-12T06:00:00Z",
    "dataAsOf": "2026-03-10"
  }
  ```
- Served via `/api/editorial/[month]` route
- Landing page excerpt: first 2 sentences of body text

### Generation Script

`scripts/generate-editorial.mjs`:
1. Read all 20 snapshot files
2. Compute cluster aggregations
3. Identify top movers (biggest YoY changes)
4. Call Anthropic API with structured prompt
5. Write result to `src/data/editorials/YYYY-MM.json`
6. Regenerate landing page cache if excerpt changed

**Schedule:** Run after the monthly snapshot refresh (first Monday of the month), either as part of GH Actions or manually.

## Page Design

### Editorial Archive (`/editorial`)
- List of all monthly editorials, newest first
- Each entry: month, headline, first sentence, "Read →" link
- Clean, magazine-style layout — generous whitespace, serif headlines

### Individual Editorial (`/editorial/[month]`)
- Headline: display serif, large
- Byline: "Analysis by State of Creative Jobs Index · March 2026"
- Body: serif body text, comfortable reading measure (max 65ch)
- Data callouts: inline monospace numbers within prose
- No charts — this is a text page. Let the data pages do the visualization.
- Footer: "Data sourced from the State of Creative Jobs Index. Methodology →"

### Landing Page Excerpt
- Small section below Market Conditions bar
- Headline + first 2 sentences + "Read full editorial →" link
- Subtle background tint (`--color-faint`) to differentiate from leaderboard

## Files to Create/Modify

| File | Action |
|---|---|
| `src/app/editorial/page.tsx` | **Create** — editorial archive page |
| `src/app/editorial/[month]/page.tsx` | **Create** — individual editorial page |
| `src/app/api/editorial/[month]/route.ts` | **Create** — API route for editorial data |
| `src/data/editorials/` | **Create** — directory for editorial JSON cache |
| `scripts/generate-editorial.mjs` | **Create** — generation script |
| `src/app/page.tsx` | **Modify** — add editorial excerpt to landing page |
| `src/components/Header.tsx` | **Modify** — add "Editorial" nav link |

## What NOT to Touch

- Role Intelligence (`roleIntelligence.ts`) — separate concern, different prompt, different cache
- Existing snapshot pipeline — editorial reads snapshots, never writes them
- Design system — follow existing rules, no new tokens needed
