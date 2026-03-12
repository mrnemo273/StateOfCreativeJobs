# A3 — Skills Gap Analyzer

**Status:** Queued
**Scope:** Small
**Approved:** 2026-03-12

---

## What This Is

A new component within the existing role deep-dive page that cross-references employer demand (from Posting Analysis) with skill trajectory (from Skills Signal) to produce a single, prescriptive "here's what to invest in" view for each role.

## Why It Matters

The Posting Analysis and Skills Signal sections already exist on the role deep-dive, but they're separate. A practitioner has to mentally combine "employers are asking for X" with "X is rising/declining" to figure out what to learn. This component does that synthesis for them.

## Where It Lives

- **Route:** No new route — embedded in `/role/[slug]` between Skills Signal and Posting Analysis sections
- **Component:** `src/components/SkillsGapSection.tsx`

## Data Sources

All data already exists in the `JobHealthSnapshot`:

- `snapshot.postingAnalysis.topSkills` — skills employers mention most in postings (with frequency)
- `snapshot.skills.rising` — skills gaining traction (with % change)
- `snapshot.skills.declining` — skills losing traction (with % change)

No new API calls needed. This is purely a UI/analysis layer on existing data.

## Logic

### Skill Classification Matrix

Cross-reference each skill against two axes:

| | Rising Trend | Flat/Unknown | Declining Trend |
|---|---|---|---|
| **High Employer Demand** | **Invest** (green) | **Core** (neutral) | **Watch** (amber) |
| **Low Employer Demand** | Emerging (faint green) | Ignore (gray) | **Shed** (faint red) |

### Matching Algorithm

1. Normalize skill names from both sources (lowercase, trim, alias common variants like "UX" = "user experience")
2. For each `topSkills` entry, look for a match in `rising` or `declining`
3. Classify based on the matrix above
4. Sort: Invest → Watch → Emerging → Core → Shed

### Fallback

If fewer than 3 skills can be cross-referenced (data too sparse), don't render this section. Fail silently — same pattern as other conditional sections.

## Component Structure

```
<SkillsGapSection>
  <SectionLabel>  "Skills Gap Analysis"
  <p>             One-line explainer: "Skills employers want most, filtered by market direction."

  <div grid 2-col>
    <div "Invest">
      <SkillGapBar skill="AI prompting" demand={85} trend={+32%} />
      <SkillGapBar skill="Systems thinking" demand={72} trend={+18%} />
      ...

    <div "Watch">
      <SkillGapBar skill="Wireframing" demand={68} trend={-12%} />
      ...
  </div>

  <div "Emerging" (collapsible)>
    Lower-demand skills that are rising fast — may be worth early investment
  </div>
</SkillsGapSection>
```

## New UI Sub-Component

### `<SkillGapBar>`
- Skill name (left-aligned, mono)
- Horizontal bar showing employer demand frequency
- Trend arrow with % change (right-aligned)
- Background tint based on classification (Invest = green-bg, Watch = amber-bg, etc.)
- Follows existing `<SkillBar>` patterns from `src/components/ui/SkillBar.tsx`

## Design Rules

- Follow `DESIGN_SYSTEM.md` strictly — no rounded corners, no shadows
- Use existing signal colors: `--color-up` for Invest, `--color-neutral` for Watch, `--color-down` for Shed
- Monospace for all numeric values
- Section label: uppercase, tracked, `text-mid`

## Files to Create/Modify

| File | Action |
|---|---|
| `src/components/SkillsGapSection.tsx` | **Create** — new component |
| `src/components/ui/SkillGapBar.tsx` | **Create** — new sub-component |
| `src/app/role/[slug]/page.tsx` | **Modify** — add section between Skills Signal and Posting Analysis |

## What NOT to Touch

- `buildSnapshot.ts` — no changes to data pipeline
- `src/types/index.ts` — no new types needed
- Existing `SkillsSignalSection.tsx` and `PostingAnalysisSection.tsx` — leave as-is
- `globals.css` / `tailwind.config.ts` — no new tokens needed
