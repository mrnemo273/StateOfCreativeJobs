# Tracked Job Titles — Design Job Health Tracker

## Selection Criteria

Titles were selected to:
1. **Span disciplines** — not just design leadership, but the full creative/content org
2. **Enable peer comparison** — organized into clusters so like-for-like analysis is meaningful
3. **Include at-risk and protected roles** — maximum AI signal diversity
4. **Reflect real hiring volume** — titles must appear frequently enough to generate statistically useful data (minimum ~50 postings/month estimated)

---

## The 20 Tracked Titles

### Cluster A: Design Leadership
Senior strategic / organizational roles. Fewer postings, higher signal per posting.

| # | Title | Slug | Notes |
|---|-------|------|-------|
| 1 | Creative Director | creative-director | Highest volume in cluster |
| 2 | Design Director | design-director | Product + brand overlap |
| 3 | Head of Design | head-of-design | Often IC→manager transition title |
| 4 | VP of Design | vp-of-design | Enterprise / late-stage startup |
| 5 | Chief Creative Officer | cco | Low volume, high signal — C-suite AI exposure |

### Cluster B: Product & UX Design
The largest hiring cluster. Highest AI mention rate expected.

| # | Title | Slug | Notes |
|---|-------|------|-------|
| 6 | Senior Product Designer | senior-product-designer | Highest raw posting volume |
| 7 | UX Designer | ux-designer | Broad; catch-all for interaction/research hybrid |
| 8 | Product Designer | product-designer | Mid-level benchmark |
| 9 | UX Researcher | ux-researcher | Research-specific; distinct AI risk profile |
| 10 | Design Systems Designer | design-systems-designer | Emerging title; high AI tool mention rate |

### Cluster C: Brand & Visual Design
Execution-focused visual roles. High AI disruption signal expected.

| # | Title | Slug | Notes |
|---|-------|------|-------|
| 11 | Brand Designer | brand-designer | Visual identity work |
| 12 | Graphic Designer | graphic-designer | Broadest title; highest volume in cluster |
| 13 | Visual Designer | visual-designer | Often UI-adjacent |
| 14 | Art Director | art-director | Agency + in-house split; interesting contrast |
| 15 | Motion Designer | motion-designer | Video/animation; distinct AI toolset (Sora, Runway) |

### Cluster D: Content & Copy
Writing and content strategy roles. AI disruption already measurable.

| # | Title | Slug | Notes |
|---|-------|------|-------|
| 16 | Copywriter | copywriter | Highest AI mention rate predicted |
| 17 | Content Strategist | content-strategist | Strategy layer; lower AI execution risk |
| 18 | UX Writer | ux-writer | Product-embedded; distinct from marketing copy |
| 19 | Creative Copywriter | creative-copywriter | Brand/campaign; more protected than direct-response copy |
| 20 | Content Designer | content-designer | Emerging hybrid (UX Writer + IA); growing fast |

---

## Why These 20

**Intentional inclusions:**
- `Design Systems Designer` — fastest-growing design title; high AI tool adoption
- `Motion Designer` — distinct AI disruption vector (generative video) vs other visual roles
- `UX Researcher` — often discussed as "protected" from AI; worth testing that assumption
- `Content Designer` — relatively new title; track whether it's absorbing `UX Writer` postings
- `CCO` — low volume but maximum strategic signal; C-suite exposure to AI framing

**Intentional exclusions:**
- *Illustrator* — too fragmented (editorial vs. game vs. fashion)
- *UI Designer* — largely absorbed into Product Designer title
- *Photographer / Videographer* — production roles, different job boards
- *Design Engineer* — emerging but insufficient posting volume for meaningful stats
- *Creative Technologist* — too niche; inconsistent title usage

---

## Cluster Comparison Feature (Phase 3)

The cluster structure enables three comparison modes:

1. **Within cluster** — e.g. "How does Creative Director vs Design Director differ on AI mention rate?"
2. **Cross-cluster same level** — e.g. "Senior Product Designer vs Creative Copywriter — who's seeing more AI requirements?"
3. **Title trajectory** — e.g. "Is Content Designer growing as UX Writer declines?"

---

## Seed Data Priority

For Month 1 historical seeding, prioritize in this order:
1. `senior-product-designer` — highest volume, fastest to get statistically significant data
2. `copywriter` — highest expected AI signal, strongest research narrative
3. `creative-director` — original tracked title, continuity
4. `graphic-designer` — volume benchmark
5. Remaining 16 titles

---

## Database Seed

```typescript
export const TRACKED_JOB_TITLES = [
  // Cluster A: Design Leadership
  { title: 'Creative Director',        slug: 'creative-director',        cluster: 'design-leadership' },
  { title: 'Design Director',          slug: 'design-director',          cluster: 'design-leadership' },
  { title: 'Head of Design',           slug: 'head-of-design',           cluster: 'design-leadership' },
  { title: 'VP of Design',             slug: 'vp-of-design',             cluster: 'design-leadership' },
  { title: 'Chief Creative Officer',   slug: 'cco',                      cluster: 'design-leadership' },
  
  // Cluster B: Product & UX Design
  { title: 'Senior Product Designer',  slug: 'senior-product-designer',  cluster: 'product-ux' },
  { title: 'UX Designer',              slug: 'ux-designer',              cluster: 'product-ux' },
  { title: 'Product Designer',         slug: 'product-designer',         cluster: 'product-ux' },
  { title: 'UX Researcher',            slug: 'ux-researcher',            cluster: 'product-ux' },
  { title: 'Design Systems Designer',  slug: 'design-systems-designer',  cluster: 'product-ux' },
  
  // Cluster C: Brand & Visual Design
  { title: 'Brand Designer',           slug: 'brand-designer',           cluster: 'brand-visual' },
  { title: 'Graphic Designer',         slug: 'graphic-designer',         cluster: 'brand-visual' },
  { title: 'Visual Designer',          slug: 'visual-designer',          cluster: 'brand-visual' },
  { title: 'Art Director',             slug: 'art-director',             cluster: 'brand-visual' },
  { title: 'Motion Designer',          slug: 'motion-designer',          cluster: 'brand-visual' },
  
  // Cluster D: Content & Copy
  { title: 'Copywriter',               slug: 'copywriter',               cluster: 'content-copy' },
  { title: 'Content Strategist',       slug: 'content-strategist',       cluster: 'content-copy' },
  { title: 'UX Writer',                slug: 'ux-writer',                cluster: 'content-copy' },
  { title: 'Creative Copywriter',      slug: 'creative-copywriter',      cluster: 'content-copy' },
  { title: 'Content Designer',         slug: 'content-designer',         cluster: 'content-copy' },
] as const;
```
