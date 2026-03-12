# Phase 2 — Plan A: AI Risk Score Overhaul

## What to Build

The current AI Risk score uses only O*NET task data, which was written for the pre-generative-AI economy. It produces wrong scores for roles that are being actively disrupted right now (Motion Designer scores 7/Low — severely incorrect given Sora/Runway/Kling). This plan introduces a two-axis composite scoring model.

---

## Step 1 — Create `src/lib/aiScoring.ts`

Create this file with the following exact content:

```typescript
export const TDI_SCORES: Record<string, { score: number; tools: string[] }> = {
  'creative-director':       { score: 22, tools: ['Claude', 'Midjourney'] },
  'design-director':         { score: 20, tools: ['Figma AI', 'Claude'] },
  'head-of-design':          { score: 18, tools: [] },
  'vp-of-design':            { score: 12, tools: [] },
  'cco':                     { score: 10, tools: [] },
  'senior-product-designer': { score: 45, tools: ['Figma AI', 'Galileo AI', 'v0'] },
  'ux-designer':             { score: 50, tools: ['Figma AI', 'Galileo AI', 'Uizard'] },
  'product-designer':        { score: 52, tools: ['v0', 'Galileo AI', 'Figma AI'] },
  'ux-researcher':           { score: 30, tools: ['Synthetic Users', 'AI interview summarizers'] },
  'design-systems-designer': { score: 55, tools: ['Figma AI', 'Tokens Studio AI', 'GitHub Copilot'] },
  'brand-designer':          { score: 62, tools: ['Midjourney', 'Adobe Firefly', 'Canva AI'] },
  'graphic-designer':        { score: 75, tools: ['Midjourney', 'Firefly', 'DALL-E 3', 'Canva AI'] },
  'visual-designer':         { score: 70, tools: ['Midjourney', 'Firefly', 'Canva AI'] },
  'art-director':            { score: 40, tools: ['Midjourney', 'Claude'] },
  'motion-designer':         { score: 72, tools: ['Sora', 'Runway', 'Kling', 'Pika'] },
  'copywriter':              { score: 82, tools: ['GPT-4o', 'Claude', 'Gemini'] },
  'content-strategist':      { score: 35, tools: ['Claude', 'Perplexity'] },
  'ux-writer':               { score: 58, tools: ['GPT-4o', 'Claude'] },
  'creative-copywriter':     { score: 65, tools: ['GPT-4o', 'Claude'] },
  'content-designer':        { score: 50, tools: ['Claude', 'Notion AI'] },
};

export function computeAIRiskScore(onetScore: number, slug: string): number {
  const tdi = TDI_SCORES[slug]?.score ?? onetScore;
  return Math.min(100, Math.max(0, Math.round((onetScore * 0.4) + (tdi * 0.6))));
}

export function getRiskLabel(score: number): 'Low' | 'Moderate' | 'Elevated' | 'High' {
  if (score < 25) return 'Low';
  if (score < 50) return 'Moderate';
  if (score < 70) return 'Elevated';
  return 'High';
}

export function getDisplacingTools(slug: string): string[] {
  return TDI_SCORES[slug]?.tools ?? [];
}
```

**Scoring logic explained:**
- Axis 1 (O*NET): existing automability ratio, normalized 0–100. Weight: 40%
- Axis 2 (TDI): Tool Displacement Index — how directly do named AI tools target this role's primary output. Weight: 60%
- Composite = `Math.round((onetScore * 0.4) + (tdi * 0.6))`

---

## Step 2 — Update `src/lib/buildSnapshot.ts`

Import and use the new scoring functions:

```typescript
import { computeAIRiskScore, getRiskLabel, getDisplacingTools } from './aiScoring';
```

When building the AI risk data for a role snapshot:
- Replace the current raw O*NET ratio with `computeAIRiskScore(onetRawScore, slug)`
- Replace the current label derivation with `getRiskLabel(compositeScore)`
- Add a `tools: getDisplacingTools(slug)` field to the aiRisk object in the snapshot type

---

## Step 3 — Add 'High' Risk Tier Everywhere

The current system has 3 tiers: Low / Moderate / Elevated. Add a 4th tier: **High**.

Find everywhere in the codebase that references the risk label type or renders a risk badge and add 'High' as a valid value. The color/style for 'High' should be visually more urgent than 'Elevated' — use red or deep orange.

Update the TypeScript type wherever it currently reads:
```typescript
'Low' | 'Moderate' | 'Elevated'
```
to:
```typescript
'Low' | 'Moderate' | 'Elevated' | 'High'
```

---

## Step 4 — Fix Risk Factors / Protective Factors Bug

**Current bug:** The same O*NET task descriptions appear verbatim in BOTH the Risk Factors and Protective Factors columns. No task should appear in both lists.

**Fix logic — classify tasks as follows:**

Risk Factors (automatable) — tasks involving:
- Data entry, keying, formatting, typesetting
- Routine review, proofreading, checking
- Producing or generating standard outputs
- Following templates or specifications
- Mechanical or production tasks

Protective Factors (human-centric) — tasks involving:
- Client or stakeholder communication
- Team leadership, direction, management
- Strategic judgment, concept development
- Cross-functional collaboration
- Evaluation, critique, creative direction

If a task is ambiguous, assign it to Protective Factors.

After classifying, deduplicate: if a task appears in both lists, remove it from Risk Factors and keep it only in Protective Factors. Never render the same task string in both columns.

---

## What NOT to Touch

Do not modify: `bls.ts`, `gnews.ts`, `adzuna.ts`, `reddit.ts`, `googletrends.ts`, `onet.ts`, `sentiment.ts`, or any UI components.

Only create/modify: `aiScoring.ts` (new), `buildSnapshot.ts` (update scoring calls), risk label type definitions, risk badge component (add High tier color).

---

## Expected Score Changes

| Role | Old Score | New Score (est.) | Change |
|---|---|---|---|
| Motion Designer | 7 — Low | ~64 — Elevated | Major fix |
| Design Systems Designer | 15 — Low | ~39 — Moderate | Fix |
| VP of Design | 14 — Low | ~11 — Low | Stable (correct for different reasons) |
| Graphic Designer | 60 — Elevated | ~69 — Elevated | Slightly higher |
| Copywriter | 68 — Elevated | ~77 — **High** | Tier upgrade |
| Creative Director | 34 — Moderate | ~27 — Moderate | Slightly lower (leadership protection) |
| CCO | varies | ~10–15 — Low | Correctly protected |

Actual output depends on the raw O*NET score each role returns from the API.
