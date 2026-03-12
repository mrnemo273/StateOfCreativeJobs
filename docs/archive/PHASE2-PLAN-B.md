# Phase 2 — Plan B: Role Intelligence Section

> **Prerequisite:** Complete PHASE2-PLAN-A.md first. This plan references `aiScoring.ts` and the `tools` field that Plan A creates.

## What to Build

Replace the current "Industry Signals" section with a new "Role Intelligence" section powered by the Anthropic API. Instead of showing raw news clips and unfiltered Hacker News posts, Claude synthesizes all available role data into three actionable components.

---

## The Three Components

| Component | Source | API Call? |
|---|---|---|
| A — Role Outlook | All snapshot data → Claude | Yes |
| B — Skill Pivot | Skills + AI risk + tools → Claude | Yes |
| C — Comparable Roles | Computed from snapshot data | No |

---

## Step 1 — Create `src/lib/apis/roleIntelligence.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // uses ANTHROPIC_API_KEY from env

export interface ComparableRole {
  slug: string;
  title: string;
  aiRiskScore: number;
  aiRiskLabel: string;
  demandYoY: string;
  salary: string;
}

export interface RoleIntelligence {
  outlook: string;
  skillPivot: string;
  comparableRoles: ComparableRole[];
}

export async function getRoleIntelligence(
  snapshot: any,
  allSnapshots: any[]
): Promise<RoleIntelligence> {
  
  const risingSkills = snapshot.skills?.rising?.slice(0, 3).map((s: any) => s.name).join(', ') ?? 'N/A';
  const decliningSkills = snapshot.skills?.declining?.slice(0, 3).map((s: any) => s.name).join(', ') ?? 'N/A';
  const aiTools = snapshot.aiRisk?.tools?.join(', ') ?? 'N/A';
  const aiMentions = snapshot.reddit?.aiMentions ?? snapshot.community?.aiMentions ?? 0;
  const layoffMentions = snapshot.reddit?.layoffMentions ?? snapshot.community?.layoffMentions ?? 0;
  const hiringMentions = snapshot.reddit?.hiringMentions ?? snapshot.community?.hiringMentions ?? 0;

  const trendDescription = snapshot.demand?.trend === 'rising'
    ? 'growing demand over past 12 months'
    : snapshot.demand?.trend === 'falling'
    ? 'declining demand over past 12 months'
    : 'flat demand over past 12 months';

  // Call 1 — Role Outlook
  const outlookResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: `You are a labor market analyst writing for a report called "State of Creative Jobs". 
Your audience is creative and design professionals who want to understand how their role is evolving. 
Write in a clear, direct, practitioner voice. No fluff. No hedging. 
Use specific numbers from the data provided. Do not use bullet points.
Write 3–5 sentences. Do not start with "The data shows" or "According to".`,
    messages: [{
      role: 'user',
      content: `Write a role outlook paragraph for: ${snapshot.title}

Data:
- Open roles: ${snapshot.demand?.openRoles ?? 'N/A'} (${snapshot.demand?.yoyChange ?? '0%'} vs last year)
- Median salary: ${snapshot.salary?.median ?? 'N/A'}
- AI risk score: ${snapshot.aiRisk?.score ?? 'N/A'}/100 (${snapshot.aiRisk?.label ?? 'N/A'})
- Community signals: ${aiMentions} AI mentions, ${layoffMentions} layoff mentions, ${hiringMentions} hiring mentions
- Demand trend: ${trendDescription}
- Top rising skills: ${risingSkills}
- Top declining skills: ${decliningSkills}
- Primary AI tools displacing this role: ${aiTools}

Write one paragraph only. Be specific to this role's data.`
    }]
  });

  const outlook = outlookResponse.content[0].type === 'text'
    ? outlookResponse.content[0].text
    : 'Analysis unavailable.';

  // Call 2 — Skill Pivot
  const pivotResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: `You are a career advisor for creative and design professionals.
Give exactly three specific, actionable recommendations based on the data.
Number them 1, 2, 3. Each recommendation should be 1–2 sentences.
Be concrete — reference the specific skills and tools in the data.
Do not give generic advice like "learn AI" or "stay curious".
Do not add any introduction or closing — just the three numbered items.`,
    messages: [{
      role: 'user',
      content: `Give 3 skill pivot recommendations for a ${snapshot.title} based on:

- Rising skills in job postings: ${risingSkills}
- Declining skills in job postings: ${decliningSkills}
- AI risk score: ${snapshot.aiRisk?.score ?? 'N/A'}/100
- Primary displacing tools: ${aiTools}
- Demand trend: ${trendDescription}
- Role cluster: ${snapshot.cluster ?? 'N/A'}`
    }]
  });

  const skillPivot = pivotResponse.content[0].type === 'text'
    ? pivotResponse.content[0].text
    : 'Recommendations unavailable.';

  // Comparable Roles — computed, no API call
  const currentScore = snapshot.aiRisk?.score ?? 100;
  const currentSalary = snapshot.salary?.medianRaw ?? 0;

  const comparableRoles: ComparableRole[] = allSnapshots
    .filter(s =>
      s.slug !== snapshot.slug &&
      s.aiRisk?.score != null &&
      s.aiRisk.score < currentScore &&
      (s.demand?.openRoles > 0 || (s.salary?.medianRaw ?? 0) > currentSalary)
    )
    .sort((a, b) => (b.salary?.medianRaw ?? 0) - (a.salary?.medianRaw ?? 0))
    .slice(0, 3)
    .map(s => ({
      slug: s.slug,
      title: s.title,
      aiRiskScore: s.aiRisk.score,
      aiRiskLabel: s.aiRisk.label,
      demandYoY: s.demand?.yoyChange ?? '0%',
      salary: s.salary?.median ?? 'N/A',
    }));

  return { outlook, skillPivot, comparableRoles };
}
```

---

## Step 2 — Create a Next.js API Route for Role Intelligence

Create `src/app/api/role-intelligence/[slug]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getRoleIntelligence } from '@/lib/apis/roleIntelligence';
import { unstable_cache } from 'next/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const getCachedIntelligence = unstable_cache(
      async () => {
        // Import your existing data service to get snapshots
        const { getSnapshot, getAllSnapshots } = await import('@/lib/dataService');
        const snapshot = await getSnapshot(slug);
        const allSnapshots = await getAllSnapshots();
        return getRoleIntelligence(snapshot, allSnapshots);
      },
      [`role-intelligence-${slug}`],
      { revalidate: 86400 } // 24-hour cache
    );

    const intelligence = await getCachedIntelligence();
    return NextResponse.json(intelligence);
  } catch (error) {
    console.error('Role intelligence error:', error);
    return NextResponse.json(
      { outlook: null, skillPivot: null, comparableRoles: [] },
      { status: 500 }
    );
  }
}
```

---

## Step 3 — Create `src/components/RoleIntelligence.tsx`

This component fetches from the API route and renders the three sub-sections.

```typescript
'use client';

import { useEffect, useState } from 'react';

interface ComparableRole {
  slug: string;
  title: string;
  aiRiskScore: number;
  aiRiskLabel: string;
  demandYoY: string;
  salary: string;
}

interface RoleIntelligenceData {
  outlook: string | null;
  skillPivot: string | null;
  comparableRoles: ComparableRole[];
}

interface Props {
  slug: string;
}

export default function RoleIntelligence({ slug }: Props) {
  const [data, setData] = useState<RoleIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/role-intelligence/${slug}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <section>
        <h2>Role Intelligence</h2>
        {/* Three skeleton placeholder blocks — match existing skeleton style in app */}
        <div className="skeleton-block" style={{ height: 80, marginBottom: 16 }} />
        <div className="skeleton-block" style={{ height: 80, marginBottom: 16 }} />
        <div className="skeleton-block" style={{ height: 60 }} />
      </section>
    );
  }

  if (error || !data) {
    return (
      <section>
        <h2>Role Intelligence</h2>
        <p>Analysis unavailable for this role.</p>
      </section>
    );
  }

  // Parse skill pivot into numbered items (split on "1.", "2.", "3.")
  const pivotItems = data.skillPivot
    ? data.skillPivot.split(/(?=\d\.\s)/).map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <section>
      <h2>Role Intelligence</h2>

      {/* Sub-section A: Role Outlook */}
      {data.outlook && (
        <div>
          <p className="section-label">Role Outlook</p>
          <p>{data.outlook}</p>
        </div>
      )}

      {/* Sub-section B: Skill Pivot */}
      {pivotItems.length > 0 && (
        <div>
          <p className="section-label">Skill Pivot</p>
          {pivotItems.map((item, i) => (
            <div key={i} className="skill-pivot-item">
              {item}
            </div>
          ))}
        </div>
      )}

      {/* Sub-section C: Comparable Roles */}
      {data.comparableRoles.length > 0 && (
        <div>
          <p className="section-label">Comparable Roles</p>
          <table>
            <tbody>
              {data.comparableRoles.map(role => (
                <tr key={role.slug}>
                  <td>{role.title}</td>
                  <td>
                    {/* Use existing risk badge component */}
                    <span className={`risk-badge risk-${role.aiRiskLabel.toLowerCase()}`}>
                      {role.aiRiskLabel} {role.aiRiskScore}
                    </span>
                  </td>
                  <td>{role.demandYoY}</td>
                  <td>{role.salary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
```

**Styling note:** Do not add new styles. Use the existing class names and patterns already in the app. Match the visual style of existing sections — labels, data rows, badges.

---

## Step 4 — Wire Into the Main Role Page

In the main role page component:

1. Import `RoleIntelligence` and render it where "Industry Signals" currently sits, passing the current `slug` as a prop.

2. Move the existing GNews news clips into a collapsible "Source Data" accordion below the "What Practitioners Are Saying" section. The accordion should be collapsed by default. Label it "News Sources". Keep all the existing GNews data — just move it out of the primary view.

3. Keep "What Practitioners Are Saying" (HN quotes, tool detection) exactly where it is. Do not change it.

---

## Step 5 — Environment & Caching

- `ANTHROPIC_API_KEY` is already set in `.env.local` and Vercel. No changes needed.
- The API route uses `unstable_cache` with `revalidate: 86400` (24 hours). This means Claude only runs once per role per day — not on every page load.
- If the API call fails for any reason, the component shows "Analysis unavailable" — it never breaks the page.

---

## What NOT to Touch

Do not modify: `bls.ts`, `gnews.ts`, `adzuna.ts`, `reddit.ts`, `googletrends.ts`, `onet.ts`, `sentiment.ts`, `buildSnapshot.ts`, or any existing UI components other than wiring in the new component and moving GNews to the accordion.
