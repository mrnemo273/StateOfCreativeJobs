# Claude Code Kickoff Prompt — Design Job Health Tracker

Copy and paste the following into Claude Code to begin the build. Attach or paste the contents of `DESIGN_SYSTEM.md`, `JOB_TITLES.md`, and `design-job-health-tracker-spec.md` alongside it.

---

## Prompt

You are building a Next.js application called **Design Job Health Tracker** — a labor market research tool that tracks the health of creative and design job titles over time. I have three reference documents to guide you:

1. **DESIGN_SYSTEM.md** — Visual direction, typography, color tokens, grid, and component rules. Follow this precisely.
2. **JOB_TITLES.md** — The 20 tracked job titles organized into 4 clusters, including a TypeScript seed array.
3. **design-job-health-tracker-spec.md** — Full product spec covering data models, UI sections, file structure, and phased roadmap.

---

### What to build in this session (Phase 1 only)

**Goal:** A fully working Next.js app with realistic mock data and a complete dashboard UI. No real APIs yet — that's Phase 2. The focus is building the full UI shell so that swapping in live data later requires only updating the data layer, not rebuilding components.

**Deliver the following in order:**

#### Step 1 — Project Setup
- Initialize Next.js 14 with App Router, TypeScript, and Tailwind CSS
- Install dependencies: `recharts`, `clsx`, `next/font`
- Configure `tailwind.config.ts` to extend with all design tokens from `DESIGN_SYSTEM.md`:
  - Font families: `font-display`, `font-sans`, `font-mono`
  - Colors: all `--color-*` tokens mapped as Tailwind utilities (e.g. `text-ink`, `bg-paper`, `text-mid`, `border-light`)
  - Spacing: the 4px base unit scale
- Set up `app/globals.css` with all CSS custom properties from the design system
- Add Google Fonts import for `DM Serif Display` and `IBM Plex Mono` via `next/font/google`

#### Step 2 — Types
Create `/types/index.ts` with the full TypeScript type definitions:
- `JobHealthSnapshot` (full type per the spec, extended with `PostingAnalysis` fields)
- `TrendPoint`, `SkillSignal`, `NewsItem`
- `JobCluster` enum: `'design-leadership' | 'product-ux' | 'brand-visual' | 'content-copy'`
- `JobTitle` type from the seed array in `JOB_TITLES.md`

#### Step 3 — Mock Data
Create `/data/mockSnapshots.ts` with realistic mock data for **3 job titles** to start:
- `creative-director`
- `senior-product-designer`
- `copywriter`

Each snapshot should include:
- 12 months of demand trend data (realistic curve — not flat)
- 8 quarters of salary trend data
- AI impact score with risk/protective factors (make the copywriter score high ~72, creative director moderate ~48, senior product designer moderate-low ~38)
- 10 skills each (rising and declining, with realistic % changes)
- 5 news headlines each with sentiment tags
- Posting analysis: top 8 skills with frequency %, 5 common responsibilities, role definition summary paragraph

Make the data feel **researched and real**, not placeholder Lorem Ipsum numbers. Use plausible salary ranges (Creative Director: $140k–$220k median $175k, Senior Product Designer: $130k–$185k median $155k, Copywriter: $65k–$120k median $88k).

#### Step 4 — Data Service
Create `/lib/dataService.ts`:
- `getSnapshot(slug: string): JobHealthSnapshot` — returns mock data now, real API call later
- `getAllTitles(): JobTitle[]` — returns the full 20-title list from `JOB_TITLES.md`
- `getClusterTitles(cluster: JobCluster): JobTitle[]`
- Abstract cleanly so Phase 2 only touches this file

#### Step 5 — UI Components
Build all components following `DESIGN_SYSTEM.md` strictly:

**Design rules to enforce everywhere:**
- Zero `rounded-*` classes — all corners are sharp (rectilinear)
- Zero `shadow-*` classes — depth via borders only
- All numeric values use `font-mono` + `tabular-nums`
- All section labels: uppercase, tracked (`tracking-widest`), `text-mid`, `text-sm`
- Background: `bg-paper` (`#F5F3EE`), cards: `bg-white`, borders: `border-light`
- Signal colors (`text-up`, `text-down`, `text-neutral`) used ONLY for data meaning, never decoration

**Components to build:**

`/components/ui/`
- `DataValue.tsx` — wraps any number, enforces `font-mono tabular-nums`
- `SectionLabel.tsx` — enforces uppercase + tracking, accepts `children`
- `TrendBadge.tsx` — renders ↑ / ↓ / → with correct signal color and background pill
- `Sparkline.tsx` — minimal Recharts LineChart, no axes, no dots, 1.5px stroke
- `StatCard.tsx` — card with section label, big number, trend badge, sparkline slot
- `TrendChart.tsx` — full Recharts LineChart with minimal axes, horizontal grid lines only, no dots except hover, monospaced axis labels
- `ScoreGauge.tsx` — horizontal meter bar 0–100, signal color fill, label
- `SkillBar.tsx` — horizontal bar with skill name, frequency %, week-over-week delta
- `NewsCard.tsx` — headline, source, date, sentiment tag (no rounded corners)
- `HairlineRule.tsx` — 1px `border-t border-ink` full width, semantic section divider

`/components/`
- `Header.tsx` — 48px top bar, app name, job title selector dropdown, last updated timestamp
- `HealthScoreSummary.tsx` — 4-up stat card row (Demand, Salary, AI Risk, Sentiment)
- `DemandSection.tsx` — TrendChart + key stats + top hiring locations as tag chips
- `SalarySection.tsx` — TrendChart + range bar (min/median/max) + top paying industries
- `AIImpactSection.tsx` — ScoreGauge + score trend chart + risk/protective factors two-column
- `SkillsSignalSection.tsx` — rising/declining two-column SkillBar layout
- `SentimentSection.tsx` — sentiment score bar + NewsCard grid
- `PostingAnalysisSection.tsx` — skills frequency table + responsibilities list + role definition narrative

#### Step 6 — Main Page
Create `app/page.tsx`:
- Client component with `useState` for selected job title slug
- Renders all sections in order with `HairlineRule` between each
- Job title switcher in header updates all sections
- 12-column Swiss grid layout using CSS Grid (not just flex)
- Sections use correct column spans per the spec (full-width header, 8+4 chart+sidebar splits, etc.)

---

### Aesthetic checkpoint

Before considering the UI done, verify:
- [ ] The page background is warm off-white (`#F5F3EE`), not white or gray
- [ ] No element has rounded corners
- [ ] No element has a drop shadow
- [ ] Every number on the page is in a monospace font
- [ ] Section labels are all uppercase with letter-spacing
- [ ] Charts have no dot markers on lines (only on hover)
- [ ] Charts have horizontal grid lines only — no vertical grid lines
- [ ] Signal colors (green/red) appear only where data has directional meaning
- [ ] The accent color (deep navy `#1A1A6B`) appears at most once per view

---

### What NOT to build yet
- Database or Supabase integration (Phase 2)
- Vercel Cron jobs or batch processing (Phase 2)
- External API calls (Phase 2)
- User authentication
- Compare mode side-by-side layout (Phase 3)
- Mobile responsive layout (post-Phase 1)

---

### Definition of done for this session
1. `npm run dev` starts without errors
2. Dashboard renders with all 6 sections populated with mock data
3. Job title switcher works — switching between Creative Director, Senior Product Designer, and Copywriter updates all sections
4. Design matches the Swiss editorial direction from `DESIGN_SYSTEM.md` — sparse, typographic, no startup-dashboard aesthetics
5. All TypeScript types are correct with no `any` escapes
6. `dataService.ts` is cleanly abstracted — adding a real API in Phase 2 touches only that file

---

### Suggested first message after setup
Once the scaffold is running, share a screenshot or describe what's rendering and we'll iterate section by section.
