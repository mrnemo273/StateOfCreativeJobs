# Project Goals & Vision

## What This Is

**State of Creative Jobs** is a labor market research tool that tracks how AI is reshaping the creative workforce. It monitors 20 creative and design job titles across four clusters, measuring demand, compensation, AI displacement risk, and practitioner sentiment — then presents the findings as a living, weekly-updated research index.

This is not a job board. It is not a dashboard for recruiters. It is a research instrument built for the people whose careers are being repriced by generative AI — creative directors, product designers, copywriters, motion designers — who deserve clear, data-informed visibility into what is happening to their professions.

## Why This Exists

There is no single authoritative source that captures how AI is changing creative work. BLS data lags by years. Job boards show volume but not context. Industry press runs on anecdote. Practitioners feel the shift — in thinning job boards, in changing briefs, in the quiet realization that tools they once delegated to are now doing the work themselves — but they cannot see it quantified.

This project exists to make that invisible shift visible.

The core thesis: the creative job market is being repriced in real time, and the change is not evenly distributed. Some roles are accelerating. Others are in freefall. The index tracks both.

## Who This Is For

- **Creative practitioners** who want to understand how their role is evolving and what skills to invest in
- **Design leaders** (VPs, Heads of Design, Creative Directors) making hiring and team structure decisions
- **Career changers** evaluating which creative roles offer durable demand vs. high displacement risk
- **Researchers and journalists** covering AI's impact on knowledge work

## Guiding Principles

### 1. Data as Content, Not Decoration
Every number earns its space. No vanity metrics. No charts that exist to fill a layout. If a data point doesn't help someone make a decision about their career, it doesn't belong.

### 2. Objective, Not Alarmist
The AI displacement story is sensational enough without us adding to the noise. Present the data clearly. Let practitioners draw their own conclusions. The tone is analytical and direct — like a well-written annual report, not a clickbait headline.

### 3. Practitioner Voice
The audience is people who do this work. Write for a Creative Director, not a recruiter. Use the language of the industry. Reference specific tools (Figma AI, Runway, Claude) not abstract concepts.

### 4. Swiss Design Rigor
The visual language is intentional: Swiss International Style typography, editorial restraint, monospaced data. This isn't an aesthetic choice — it's a credibility signal. The design says "this is research" not "this is a startup product." See `DESIGN_SYSTEM.md` for the full specification.

### 5. Weekly Cadence, Durable Architecture
Data refreshes weekly via automated GitHub Actions. The architecture is designed so that adding new data sources or new roles requires minimal code changes — extend, don't rewrite.

### 6. AI as Infrastructure, Not Feature
The project uses Claude (Anthropic API) for role intelligence synthesis and sentiment analysis. AI is infrastructure here — it processes data behind the scenes. It is never surfaced as a marketing feature.

## What Success Looks Like

A design leader opens the site and in under 60 seconds can answer:

1. Is demand for my title growing or shrinking?
2. Are salaries keeping up?
3. How exposed is my role to AI displacement — and why?
4. What skills should I be building or shedding?
5. What's the practitioner conversation around my role?

If the answer to all five is clear from the data, the project is working.

## What This Is NOT

- Not a job board or recruiting tool
- Not a startup product with growth metrics
- Not a general-purpose analytics dashboard
- Not a mobile-first consumer app
- Not an AI demo or showcase

## Build Philosophy for AI Collaborators

When continuing development on this project, keep these principles in mind:

- **Extend, don't rewrite.** The architecture is modular by design. New data sources plug into `buildSnapshot.ts`. New UI sections follow existing component patterns. Don't rebuild what works.
- **Respect the design system.** Zero rounded corners. Zero drop shadows. Monospaced numbers. Warm off-white background. Signal colors only for data meaning. If it looks like a SaaS dashboard, it's wrong. See `DESIGN_SYSTEM.md`.
- **Mock data is the safety net.** Every API call falls back to mock/cached data on failure. The site should always render, even if every external API is down.
- **Phase documents are historical.** The `/docs/archive` folder contains the original phase specs that guided development. They capture intent and implementation details for phases 1-4. Consult them for context, but the PRD and TRD are the current source of truth.
- **Don't touch what works.** Each phase spec includes a "What NOT to Touch" section. Respect those boundaries. When in doubt, check the TRD for the current file inventory and ownership.
