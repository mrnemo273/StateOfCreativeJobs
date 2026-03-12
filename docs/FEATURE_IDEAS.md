# Feature Ideas — State of Creative Jobs

> Working document. Features move to `BACKLOG.md` when approved.

---

## A. Career Planning & Navigation

### A1. Career Path Navigator
**Concept:** Interactive visualization showing lateral and upward career moves from any role. "You're a Graphic Designer — here's where people like you go next." Combines AI risk scores, salary deltas, and demand data to show which paths are gaining vs. losing altitude.

**Why it matters:** The current app tells you how your role is doing. It doesn't tell you what to do about it. This turns passive research into active career planning.

**Scope:** New page (`/paths`). Medium-large build. Needs a role adjacency map (which roles feed into which), plus a visualization layer.

---

### A2. "What If I Pivot?" Comparison Tool
**Concept:** Select your current role and a target role. See a side-by-side breakdown: salary change, AI risk change, demand trajectory, skills you already have vs. skills you'd need to build. Essentially a cost-benefit analysis for career moves.

**Why it matters:** This was partially scoped in Phase 3 as "Compare Mode" and deferred. But framing it as a pivot analysis (not just a comparison) makes it actionable. It answers "should I make this move?" not just "how do these two differ?"

**Scope:** New page (`/compare`). Medium build. Most data already exists — this is primarily a UI and narrative layer on top of existing snapshots.

---

### A3. Skills Gap Analyzer
**Concept:** For any role, show the top 10 skills employers are asking for (from posting analysis), cross-referenced against the skills that are rising vs. declining. Highlight the "high-demand, low-supply" skills — the ones worth investing in right now.

**Why it matters:** Posting Analysis and Skills Signal sections already exist but they're separate. Merging them into a single "here's what to learn" view makes the data prescriptive.

**Scope:** New component within existing role deep-dive. Small-medium build. Data already exists.

---

## B. Deeper Data & Analysis

### B4. Historical Trend Database
**Concept:** Store weekly snapshots over time instead of overwriting them. Build a time-series view: "How has demand for UX Designer changed over the past 6 months?" Show rolling averages, inflection points, and seasonal patterns.

**Why it matters:** Right now the app is a point-in-time photograph. With history, it becomes a movie. Trends become visible. You can see whether a role's decline is accelerating or stabilizing.

**Scope:** Large build. Needs a lightweight database (SQLite, Turso, or even just timestamped JSON files). New chart components for long-range trends. Changes to the refresh pipeline.

---

### B5. Geographic Heat Map
**Concept:** For any role, show a US map (or metro-area breakdown) of where demand is concentrated, where salaries are highest, and where the role is growing fastest. Adzuna already returns location data. ACS has metro-level wages.

**Why it matters:** "UX Designer demand is down 12%" hits differently when you can see that it's down 30% in SF but up 15% in Austin. Geography matters enormously for career decisions.

**Scope:** Medium-large build. New page or section. Needs a map visualization (D3 choropleth or Mapbox). Location data partially exists from Adzuna.

---

### B6. Salary Calculator / Benchmarking Tool
**Concept:** "What should I be making?" Enter your role, years of experience, and metro area. Get a personalized salary range based on BLS percentiles, ACS metro data, and Adzuna posting data. Show where you fall relative to market.

**Why it matters:** The median salary stat is useful but impersonal. A calculator makes it about *you*. This is also the kind of tool people share and come back to.

**Scope:** Medium build. New interactive component. Needs experience-level salary curves (may need additional BLS data series).

---

### B7. AI Tool Tracker
**Concept:** Dedicated section or page tracking the specific AI tools that are displacing creative roles. For each tool (Midjourney, Runway, Claude, Figma AI, etc.), show: which roles it affects, how adoption is trending, when it launched major features, and what practitioners are saying about it.

**Why it matters:** The current AI Impact section names tools but doesn't track them over time. Practitioners want to know "is Midjourney actually taking work from illustrators, or is it hype?" This answers that with data.

**Scope:** Medium-large build. New page (`/tools`). Would need a tool registry data model and potentially new data sources (Google Trends for tool names, HN discussion volume).

---

## C. Sharing, Reach & Distribution

### C8. Monthly State of Creative Jobs Report (Auto-Generated PDF)
**Concept:** Every month, auto-generate a beautiful PDF report summarizing the biggest moves across all 20 roles. "This month: Copywriter demand fell 8%, Motion Designer salaries hit an all-time high, and AI risk scores jumped for 4 roles." Designed in the Swiss editorial style. Shareable, downloadable, embeddable.

**Why it matters:** Not everyone visits a website weekly. A monthly report is a distribution mechanism — it goes where practitioners already are (email, Slack, LinkedIn). It also positions the project as a research publication, not just a tool.

**Scope:** Medium build. Automated report generation script. PDF creation with the existing design system. Could also be an HTML email or hosted page.

---

### C9. Social Share Cards (OG Images)
**Concept:** Auto-generate Open Graph images for every role page. When someone shares `stateofcreativejobs.com/role/copywriter` on LinkedIn or Twitter, the preview card shows: role title, AI risk score, demand change, salary — all in the Swiss design style.

**Why it matters:** This is the lowest-effort, highest-impact distribution feature. Every share becomes a mini-advertisement for the index. Creative professionals share career content constantly.

**Scope:** Small-medium build. Next.js OG image generation (`next/og` or `@vercel/og`). Template + dynamic data per role.

---

### C10. Embeddable Widgets
**Concept:** Lightweight embeddable components that other sites can drop in. A "Role Health Card" widget, a "Top 5 At-Risk Roles" leaderboard widget, a single-role sparkline widget. Portfolio sites, design blogs, and career pages would embed these.

**Why it matters:** Expands reach without requiring people to visit the site. Positions the index as infrastructure — the Bloomberg Terminal of creative career data.

**Scope:** Medium build. Iframe-based or web component widgets. Separate lightweight bundle.

---

### C11. Email Digest / Role Alerts
**Concept:** Subscribe to 1-3 roles. Get a weekly or monthly email: "Here's what changed for Product Designer this week." Demand up/down, new salary data, notable headlines, AI risk changes. Clean, text-forward email in the Swiss style.

**Why it matters:** Retention mechanism. Turns one-time visitors into ongoing readers. Email is where professionals actually consume career intel.

**Scope:** Medium-large build. Needs email infrastructure (Resend, SendGrid, or Loops). Subscriber management. Email template system.

---

## D. Community & Engagement

### D12. Practitioner Pulse (Survey Layer)
**Concept:** Add a lightweight survey to each role page: "Are you a [Role Title]? Rate your job market experience this month." 3-5 questions, anonymous, takes 30 seconds. Aggregate responses into a "Practitioner Pulse" score alongside the data-driven metrics.

**Why it matters:** The app currently measures the market from the outside (APIs, job boards, news). This measures it from the inside (practitioners' lived experience). The gap between data and sentiment is often the most interesting story.

**Scope:** Medium-large build. Needs survey UI, data storage, aggregation logic. Privacy considerations.

---

### D13. "My Watchlist" (Personalized Dashboard)
**Concept:** Let users save 3-5 roles to a personal watchlist. Landing page reorganizes around their picks — their roles at the top, with personalized change summaries. No account needed — use localStorage or a simple URL-based state.

**Why it matters:** The 20-role leaderboard is great for exploration but most practitioners care about 2-3 roles. A watchlist makes the landing page feel like *their* dashboard.

**Scope:** Small-medium build. Client-side state. Conditional rendering on landing page.

---

## E. Content & Editorial

### E14. Methodology Page
**Concept:** A dedicated `/methodology` page explaining exactly how every number is calculated. Data sources, refresh cadence, scoring formulas, known limitations. Written for a smart skeptic.

**Why it matters:** Credibility. Any serious research index needs transparent methodology. Journalists and researchers won't cite data they can't verify. This is table stakes for being taken seriously.

**Scope:** Small build. Static content page. Most of the content already exists in the TRD — just needs to be rewritten for a public audience.

---

### E15. "State of the Market" Editorial (AI-Assisted)
**Concept:** Monthly AI-generated editorial essay that synthesizes trends across all 20 roles into a narrative. "March 2026: The Great Rebundling" — identifying macro patterns, calling out surprises, connecting dots between clusters. Written in the project's analytical-but-accessible voice.

**Why it matters:** Individual role data is useful. Cross-role narrative is powerful. This is the "so what?" for the entire index — the kind of thing that gets quoted in articles and shared on LinkedIn.

**Scope:** Medium build. New page or section on landing page. Anthropic API call synthesizing all 20 snapshots. Monthly generation cadence.

---

### E16. Industry Benchmarks Page
**Concept:** A `/benchmarks` page showing cross-cutting comparisons: "Which cluster has the highest average AI risk?", "Which roles have the widest salary spread?", "Where is demand growing fastest?" Aggregate views that aren't tied to a single role.

**Why it matters:** Design leaders managing teams across multiple roles need cluster-level and market-level views. The leaderboard partially does this, but a dedicated benchmarks page can go deeper.

**Scope:** Small-medium build. New page. Data already exists — this is mostly aggregation + visualization.
