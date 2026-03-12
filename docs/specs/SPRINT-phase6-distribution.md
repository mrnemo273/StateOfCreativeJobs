# Phase 6 — The Distribution Sprint

**Status:** Planned
**Created:** 2026-03-12
**Scope:** 3 Medium + 1 Large (4 features)
**Prerequisite:** Phase 5 (Credibility) complete
**New Infrastructure:** Resend (email), Puppeteer (PDF), Vercel KV (subscribers)
**New Routes:** `/editorial`, `/editorial/[month]`
**New Dependencies:** `resend`, `uuid`, `@vercel/kv`, `puppeteer-core`

---

## Sprint Thesis: Send the Research Where People Already Are

Phase 5 built trust. Phase 6 builds reach. The credibility layer — methodology page, confidence badges, footnotes — now exists. Everything Phase 6 ships carries that credibility with it: PDF reports include confidence indicators and methodology links, email digests reference annotated data, and the editorial links to benchmarks for every comparative claim.

The strategic sequence: **narrative first (editorial + timeline), then packaging (PDF), then subscription (email)**. The editorial creates shareable insight. The PDF packages it for offline distribution. The email system turns one-time visitors into recurring readers.

---

## Sprint Bundle

| Order | ID | Feature | Scope | Spec |
|---|---|---|---|---|
| 1 | E15 | State of the Market Editorial | Medium | [E15-state-of-market-editorial.md](E15-state-of-market-editorial.md) |
| 2 | I2 | AI Displacement Timeline | Medium | [I2-ai-displacement-timeline.md](I2-ai-displacement-timeline.md) |
| 3 | C8 | Monthly PDF Report | Medium | [C8-monthly-pdf-report.md](C8-monthly-pdf-report.md) |
| 4 | C11 | Email Digest / Role Alerts | Large | [C11-email-digest.md](C11-email-digest.md) |

---

## Why These Four

**E15 — State of the Market Editorial** creates the narrative engine. A monthly AI-synthesized essay that identifies macro patterns across all 20 roles, connects dots between clusters, and names emerging trends. Generated via Anthropic API, cached as JSON, served at `/editorial`. The editorial text feeds directly into the PDF report (Page 2) — so it has to be built first. Landing page gets an excerpt below the Market Conditions bar. Now that the methodology page exists (Phase 5), the editorial footer can link to `/methodology` for verification.

**I2 — AI Displacement Timeline** adds a temporal dimension to the existing AI risk score. For each role: projected displacement milestones, velocity labels (slow / moderate / fast / accelerating), protective factors, and a projected ceiling. This is curated editorial data in `src/lib/aiTimeline.ts` — same pattern as the TDI scores in `aiScoring.ts`. Pairs with the editorial because both deepen the AI risk narrative. The timeline gives the editorial specific dates and velocities to cite. Builds into the existing `AIImpactSection.tsx` — minimal page-level changes.

**C8 — Monthly PDF Report** packages the index into a shareable 4-6 page document. Swiss editorial design, auto-generated via HTML-to-PDF (Puppeteer). Pulls from snapshot data, the editorial essay (E15), and benefits from all Phase 5 additions — confidence badges, footnotes, methodology reference on the back page. This is the distribution artifact that goes where practitioners already are: email attachments, Slack channels, LinkedIn posts.

**C11 — Email Digest / Role Alerts** is the subscription layer. Users follow 1-3 roles, receive weekly or monthly digests via Resend. This is the largest feature in the sprint — new API routes (subscribe, unsubscribe, confirm), Vercel KV for subscriber storage, double opt-in flow, and a generation script integrated into the GitHub Actions workflow. It's last because the emails should showcase all the Phase 5 credibility features and can optionally link to the PDF report and editorial.

---

## Dependency Map

```
E15 Editorial ←── generates narrative content
  │
  ├── editorial text embedded in C8 PDF Report (Page 2: Market Overview)
  │     │
  │     └── PDF links to /editorial and /methodology (Phase 5)
  │
  └── editorial excerpt on landing page (same section where C11 subscribe CTA lives)

I2 AI Timeline ←── enriches AI risk narrative
  │
  └── editorial (E15) can reference displacement velocities and milestones
      timeline data deepens the AI Risk Landscape page in C8 PDF (Page 5)

C11 Email Digest ←── consumes everything above
  │
  ├── emails can link to latest editorial
  ├── monthly digest can attach or link PDF report
  └── email template benefits from Phase 5 confidence + footnote patterns

Phase 5 (complete) ←── everything references this foundation
  ├── /methodology linked from editorial footer, PDF back page, email footer
  ├── confidence badges visible in any screenshot or PDF rendering
  └── footnotes provide context in all data displays
```

---

## Build Order

### Step 1 — E15: State of the Market Editorial
Create the editorial generation pipeline. This goes first because the PDF report embeds the editorial text on Page 2, and the email digest can link to it.

**What to build:**
- `scripts/generate-editorial.mjs` — reads all 20 snapshots, computes cluster aggregations, calls Anthropic API with structured editorial prompt, saves to JSON cache
- `src/data/editorials/` — directory for cached editorial JSON (one per month)
- `src/app/editorial/page.tsx` — archive page listing all editorials
- `src/app/editorial/[month]/page.tsx` — individual editorial page with magazine-style reading layout (serif headlines, comfortable measure, no charts)
- `src/app/api/editorial/[month]/route.ts` — API route serving editorial data
- Modify `src/app/page.tsx` — add editorial excerpt below Market Conditions bar
- Modify `src/components/Header.tsx` — add "Editorial" nav link

**Files:** 5 new, 2 modified

### Step 2 — I2: AI Displacement Timeline
Add displacement timelines to every role's AI Impact section. This is self-contained — a new component embedded in an existing section.

**What to build:**
- `src/lib/aiTimeline.ts` — curated timeline data for all 20 roles (milestones, velocity labels, protective factors, projected ceilings)
- `src/components/AITimeline.tsx` — progress bar with ceiling marker, vertical milestone list, velocity badge, protective factors
- Modify `src/components/AIImpactSection.tsx` — embed `<AITimeline>` below the risk score gauge

**Files:** 2 new, 1 modified

### Step 3 — C8: Monthly PDF Report
Build the HTML-to-PDF pipeline. This goes after E15 because the report embeds the editorial essay.

**What to build:**
- `scripts/generate-monthly-report.mjs` — reads snapshots + editorial, populates HTML template, launches headless Puppeteer, renders PDF
- `scripts/templates/monthly-report.html` — standalone HTML with inline CSS (design system tokens), print-optimized layout, 6-page structure (cover, overview, leaderboard, cluster deep-dives, AI risk landscape, methodology)
- `public/reports/` — directory for generated PDFs
- Modify `src/app/page.tsx` — add "Latest Report" download link
- Optionally modify `.github/workflows/refresh-snapshots.yml` — add monthly report generation step

**New dependency:** `puppeteer-core`
**Files:** 3 new, 1-2 modified

### Step 4 — C11: Email Digest / Role Alerts
Build the subscription system. This goes last because it benefits from everything above — emails can link to the editorial, reference the PDF, and carry all Phase 5 credibility features.

**What to build:**
- `src/components/DigestSubscribe.tsx` — subscribe form (email input, role selector, cadence toggle)
- `src/app/api/digest/subscribe/route.ts` — subscribe endpoint with validation
- `src/app/api/digest/unsubscribe/route.ts` — unsubscribe endpoint
- `src/app/api/digest/confirm/[token]/route.ts` — double opt-in confirmation
- `scripts/generate-digest.mjs` — reads subscribers from KV, builds per-subscriber email with tracked roles' data, sends via Resend
- `scripts/templates/digest-email.html` — email HTML template (text-forward, monospace numbers, mobile-responsive)
- Modify `src/app/page.tsx` — add "Get the Weekly Digest" section below leaderboard
- Modify `src/app/role/[slug]/page.tsx` — add "Follow [Role Name]" CTA
- Modify `.github/workflows/refresh-snapshots.yml` — add digest sending step

**New dependencies:** `resend`, `uuid`, `@vercel/kv`
**New env vars:** `RESEND_API_KEY`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`
**Files:** 6 new, 3 modified

---

## Infrastructure Changes

Phase 5 required zero new infrastructure. Phase 6 introduces three external services:

| Service | Purpose | Free Tier | Env Var |
|---|---|---|---|
| **Resend** | Transactional email (digests, confirmations) | 3,000 emails/month | `RESEND_API_KEY` |
| **Vercel KV** | Subscriber storage (Redis) | 3,000 requests/day, 256MB | `KV_REST_API_URL`, `KV_REST_API_TOKEN` |
| **Puppeteer** | PDF generation (headless Chrome) | Bundled in CI | None (dev dependency) |

All three services have generous free tiers suitable for early audience building. No cost until subscriber volume scales significantly.

---

## Shared File Modifications

Several files are modified by multiple features in this sprint. Build order prevents conflicts:

| File | Modified By | Notes |
|---|---|---|
| `src/app/page.tsx` | E15 (excerpt), C8 (report link), C11 (subscribe CTA) | Three additions to landing page — each in a different section |
| `src/components/Header.tsx` | E15 (nav link) | Only one feature touches nav |
| `.github/workflows/refresh-snapshots.yml` | C8 (report step), C11 (digest step) | Both add new workflow steps |
| `src/app/role/[slug]/page.tsx` | I2 (via AIImpactSection), C11 (subscribe CTA) | I2 modifies a child component, C11 adds a new element |

---

## What's Deferred to Phase 7

### Phase 7 — Community

| ID | Feature | Scope | Why Phase 7 |
|---|---|---|---|
| D12 | Practitioner Pulse Survey | Large | Needs traffic from Phase 6 distribution channels to generate respondent volume. The email digest drives people back to the site; the survey captures their signal while they're there. |
| I3 | Emerging Roles Radar | Large | Independent data pipeline (Adzuna title mining + HN signals). Large scope. No dependency on distribution, but benefits from the audience Phase 6 builds — emerging role signals are more interesting when shared via editorial and digest. |

---

## Success Criteria

After Phase 6, the index should feel like a **research publication with a distribution engine**, not just a website. Specifically:

1. A monthly editorial essay synthesizes all 20 roles into shareable insight at `/editorial`
2. Every role's AI Impact section shows displacement velocity, not just a risk score
3. A professional 4-6 page PDF report is auto-generated monthly and downloadable
4. Users can subscribe to 1-3 roles and receive email digests (weekly or monthly)
5. The landing page has three new content sections: editorial excerpt, report download, and subscribe CTA
6. All distribution outputs (PDF, email) carry Phase 5 credibility features: methodology links, confidence indicators, data freshness context
7. The GitHub Actions workflow handles: snapshot refresh → editorial generation → PDF report → email digest as a complete monthly pipeline
