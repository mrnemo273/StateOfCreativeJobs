# C8 — Monthly PDF Report

**Status:** Queued
**Scope:** Medium
**Approved:** 2026-03-12

---

## What This Is

An auto-generated monthly PDF report summarizing the biggest moves across all 20 roles. Swiss editorial design, shareable, downloadable. Designed to be the distribution arm of the index — the artifact that goes where practitioners already are (email, Slack, LinkedIn).

## Why It Matters

Not everyone visits a website weekly. A monthly report is a distribution mechanism that positions the project as a research publication. PDFs get attached to emails, dropped in Slack channels, and linked on LinkedIn — each one carrying the index's credibility with it.

## Where It Lives

- **Generated to:** `public/reports/state-of-creative-jobs-YYYY-MM.pdf`
- **Download link on:** Landing page (latest report), `/editorial` page, and individual role pages
- **Script:** `scripts/generate-monthly-report.mjs`

## Report Structure (Target: 4-6 pages)

### Page 1 — Cover
- Title: "State of Creative Jobs"
- Subtitle: "Monthly Market Report"
- Month/year: "March 2026"
- 5 market condition stats in a horizontal strip (same as landing page)
- Minimal design — heavy whitespace, mono typography

### Page 2 — Market Overview
- The editorial essay (from E15 — State of the Market Editorial) or a condensed version
- If E15 hasn't been implemented yet, generate a shorter 200-word summary using the same Anthropic API approach
- Key callout boxes: Biggest Gainer, Biggest Decliner, Highest Risk

### Page 3 — The Index (Leaderboard)
- Full 20-role table: Role, Cluster, Open Positions, YoY Change, Median Salary, AI Risk Score
- Sorted by YoY change (most distressed first), matching landing page
- Color-coded YoY and AI risk cells using signal colors

### Page 4 — Cluster Deep-Dives
- Four quadrant layout, one per cluster
- Each quadrant: cluster name, average AI risk, average demand YoY, top mover callout
- Small sparkline or bar for each role in the cluster

### Page 5 — AI Risk Landscape
- All 20 roles plotted on a simple 2D chart: X = AI Risk Score, Y = Demand YoY Change
- Quadrant labels: "Thriving & Safe", "Growing but Exposed", "Declining & Safe", "Declining & Exposed"
- Each role as a labeled dot

### Page 6 — About & Methodology (Back Page)
- Brief methodology summary (3-4 sentences)
- Data freshness date
- URL: stateofcreativejobs.com
- "Methodology → stateofcreativejobs.com/methodology"

## PDF Generation Approach

Use a headless HTML-to-PDF pipeline:

1. **Build HTML report** — a standalone HTML file using the design system's CSS tokens, optimized for print (A4/Letter, proper margins, page breaks)
2. **Convert to PDF** — using Puppeteer (`puppeteer-core`) or `playwright` in headless mode
3. **Save to** `public/reports/`

Alternative: Use `@react-pdf/renderer` for programmatic PDF generation (no browser needed, better for CI). Trade-off: less design control vs. simpler infrastructure.

**Recommended approach:** HTML-to-PDF via Puppeteer for maximum design fidelity with the existing design system.

### Report HTML Template

`scripts/templates/monthly-report.html` — standalone HTML file with:
- Inline CSS (design system tokens)
- Template variables for dynamic data (`{{month}}`, `{{totalOpenings}}`, etc.)
- Print-specific CSS (`@media print`, `page-break-before`, proper margins)
- Embedded fonts (IBM Plex Mono, DM Serif Display)

## Generation Script

`scripts/generate-monthly-report.mjs`:

```
1. Read all 20 snapshot JSON files
2. Compute aggregations (cluster averages, top movers, market conditions)
3. Generate or read editorial text (from E15 cache or fresh Anthropic call)
4. Populate HTML template with data
5. Launch headless browser
6. Render HTML → PDF
7. Save to public/reports/state-of-creative-jobs-YYYY-MM.pdf
8. Update landing page cache with latest report URL
```

**Schedule:** Run after monthly editorial generation (first week of month). Can be added to GH Actions workflow or run manually.

## Landing Page Integration

Add a small "Latest Report" link in the masthead or below the Market Conditions bar:

```
📄 March 2026 Report [Download PDF]
```

Simple, unobtrusive. One line, one link.

## Design Rules

- Follow `DESIGN_SYSTEM.md` — Swiss editorial style carries over to print
- Monospace for all data, serif for headlines, sans for body
- Signal colors for directional data
- No rounded corners, no shadows, no gradients
- Page margins: 1 inch (2.54cm) all sides
- Headers: uppercase, tracked, mono — same as web
- Page numbers: bottom center, mono

## Dependencies to Add

```bash
npm install puppeteer-core  # or playwright
```

For CI (GitHub Actions), use `puppeteer` with bundled Chromium, or use the `@react-pdf/renderer` alternative to avoid browser dependency.

## Files to Create/Modify

| File | Action |
|---|---|
| `scripts/generate-monthly-report.mjs` | **Create** — generation script |
| `scripts/templates/monthly-report.html` | **Create** — HTML template for PDF |
| `public/reports/` | **Create** — directory for generated PDFs |
| `src/app/page.tsx` | **Modify** — add latest report download link |
| `.github/workflows/refresh-snapshots.yml` | **Modify** — optionally add monthly report step |

## What NOT to Touch

- Existing snapshot pipeline — read-only consumption
- Role deep-dive pages — report is separate from interactive dashboard
- Design system files — follow existing tokens, don't add new ones
