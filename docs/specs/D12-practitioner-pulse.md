# D12 — Practitioner Pulse (Survey Layer)

**Status:** Queued
**Scope:** Large
**Approved:** 2026-03-12

---

## What This Is

A lightweight, anonymous survey embedded on each role page that captures practitioners' lived experience of the job market. Responses aggregate into a "Practitioner Pulse" score displayed alongside the data-driven metrics — bridging the gap between what APIs say and what people feel.

## Why It Matters

The app currently measures the market from the outside (job boards, BLS, news). This measures it from the inside. The gap between data and lived experience is often the most interesting story: "BLS says salaries are up 3%, but 70% of practitioners report feeling salary pressure." That tension is where the real insight lives.

## Where It Lives

### Survey UI
- **Location:** Role deep-dive page, new section after Sentiment & Community
- **Component:** `src/components/PractitionerPulse.tsx`
- **Always visible**, even before answering (shows aggregate results with a prompt to contribute)

### API Routes
- `POST /api/pulse/submit` — submit survey response
- `GET /api/pulse/[slug]` — get aggregate results for a role
- `GET /api/pulse/summary` — get all-role summary for landing page

### Data Storage
- **Recommended:** Vercel KV (Redis) for fast writes + reads
- **Alternative:** Turso (SQLite edge) for more complex queries
- **Fallback:** JSON files (acceptable for MVP with low traffic)

## Survey Design

### Questions (3 questions, anonymous, <30 seconds)

**Q1 — Market Temperature**
"How would you describe the job market for [Role] right now?"
- Hot (lots of opportunities, easy to find work)
- Warm (decent market, some good options)
- Cool (slowing down, fewer opportunities)
- Cold (very difficult, extended searches)
- Frozen (almost nothing available)

Maps to score: Hot=100, Warm=75, Cool=50, Cold=25, Frozen=0

**Q2 — What Are You Experiencing? (multi-select)**
"Select any that apply to your experience this month:"
- ☐ Fewer job openings than usual
- ☐ AI replacing tasks I used to do
- ☐ Salary pressure / lower offers
- ☐ More contract/freelance roles than FTE
- ☐ Longer hiring processes
- ☐ More competition for roles
- ☐ Skills requirements changing
- ☐ None of the above — things feel normal

**Q3 — Your Situation**
"What best describes you right now?"
- Employed and not looking
- Employed but exploring
- Actively job searching
- Freelancing / independent
- Between roles
- Career changing into this field
- Career changing out of this field

### Anti-Gaming
- One response per role per browser session (cookie-based, not account-based)
- Rate limiting on submit endpoint (IP-based, 10 submissions/hour)
- Responses older than 90 days are excluded from aggregations
- Minimum 5 responses before showing results (prevent identifiability)

## Data Model

```typescript
interface PulseResponse {
  id: string;               // UUID
  slug: string;             // Role slug
  temperature: 0 | 25 | 50 | 75 | 100;
  experiences: string[];    // Selected experience codes
  situation: string;        // Situation code
  submittedAt: string;      // ISO timestamp
  // No email, no name, no IP stored — fully anonymous
}

interface PulseAggregate {
  slug: string;
  responseCount: number;
  period: string;            // "2026-03" (current month)
  temperature: {
    average: number;         // 0-100
    label: string;           // "Cool" etc.
    distribution: Record<string, number>;  // percentage per tier
    previousMonth: number;   // for trend arrow
  };
  topExperiences: {
    code: string;
    label: string;
    percentage: number;      // % of respondents selecting this
  }[];
  situations: {
    code: string;
    label: string;
    percentage: number;
  }[];
}
```

## Display Component

### Before Responding (Survey Mode)

```
┌────────────────────────────────────────┐
│ PRACTITIONER PULSE                     │
│ How's the market actually feeling?     │
│                                        │
│ 47 practitioners responded this month  │
│                                        │
│ ○ Hot  ○ Warm  ○ Cool  ○ Cold  ○ Frozen│
│                                        │
│ What are you experiencing?             │
│ ☐ Fewer openings  ☐ AI replacing tasks │
│ ☐ Salary pressure ☐ More contract roles│
│ ☐ Longer hiring   ☐ More competition   │
│ ☐ Skills changing  ☐ None / normal     │
│                                        │
│ Your situation?                        │
│ [Employed, not looking           ▼]    │
│                                        │
│ [Submit Anonymously]                   │
└────────────────────────────────────────┘
```

### After Responding (Results Mode)

```
┌────────────────────────────────────────┐
│ PRACTITIONER PULSE · 48 responses      │
│                                        │
│ Market Temperature: COOL (50/100)      │
│ ████████████████████░░░░░░░░░░░░ ↓     │
│ Was: Warm (68) last month              │
│                                        │
│ TOP EXPERIENCES                        │
│ 72% — Fewer job openings               │
│ 58% — AI replacing tasks               │
│ 41% — Skills requirements changing     │
│ 38% — More competition for roles       │
│                                        │
│ RESPONDENT MIX                         │
│ 34% Employed, exploring                │
│ 28% Actively searching                 │
│ 19% Freelancing                        │
│ 12% Employed, not looking              │
│  7% Between roles                      │
│                                        │
│ ✓ You responded this month             │
└────────────────────────────────────────┘
```

## Landing Page Integration

Optional: Add a small "Pulse" indicator to the leaderboard table — a single-character temperature icon (🔥 ❄️) or a colored dot next to each role showing practitioner sentiment. Only show if ≥5 responses exist for that role.

## Aggregation Logic

```typescript
// src/lib/pulse.ts

async function getAggregate(slug: string): Promise<PulseAggregate>
// 1. Fetch all responses for slug from last 90 days
// 2. Compute average temperature
// 3. Compute experience percentages
// 4. Compute situation breakdown
// 5. Compare to previous month for trend

async function submitResponse(response: PulseResponse): Promise<void>
// 1. Validate fields
// 2. Check rate limit
// 3. Store response
// 4. Invalidate aggregate cache for this slug
```

## Dependencies to Add

```bash
npm install @vercel/kv       # Redis storage (or alternative)
npm install uuid             # Response IDs
```

## Files to Create/Modify

| File | Action |
|---|---|
| `src/components/PractitionerPulse.tsx` | **Create** — survey + results component |
| `src/lib/pulse.ts` | **Create** — aggregation logic |
| `src/app/api/pulse/submit/route.ts` | **Create** — submit endpoint |
| `src/app/api/pulse/[slug]/route.ts` | **Create** — aggregate endpoint |
| `src/app/api/pulse/summary/route.ts` | **Create** — all-role summary |
| `src/app/role/[slug]/page.tsx` | **Modify** — add Pulse section |

## What NOT to Touch

- Sentiment section — Pulse is additive, not a replacement for API-driven sentiment
- Snapshot pipeline — Pulse data is separate from snapshot data
- Landing page leaderboard — Pulse indicator is optional enhancement
- User accounts — this is anonymous, no auth needed

## Privacy Considerations

- **No PII collected.** No email, no name, no account.
- **No IP storage.** Rate limiting uses IP but doesn't persist it.
- **Cookie for dedup only.** Session cookie prevents double-voting, not tracking.
- **90-day rolling window.** Old responses automatically excluded.
- **Minimum threshold.** Results hidden until ≥5 responses to prevent identifiability.
