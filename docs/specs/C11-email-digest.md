# C11 — Email Digest / Role Alerts

**Status:** Queued
**Scope:** Large
**Approved:** 2026-03-12

---

## What This Is

A subscription system where users can follow 1-3 roles and receive weekly or monthly email digests with demand changes, salary shifts, AI risk updates, and notable headlines. Clean, text-forward email in the Swiss editorial style.

## Why It Matters

Retention mechanism. The site is valuable but requires active visits. Email meets practitioners where they are — inbox — and turns one-time visitors into an ongoing audience. This is how a research index becomes a publication with a readership.

## Core User Flow

1. User visits any role page or the landing page
2. Sees a "Follow this role" CTA (or "Get the digest" on landing)
3. Enters email address + selects 1-3 roles
4. Receives confirmation email
5. Gets weekly or monthly digest with their tracked roles' data
6. Can unsubscribe via link in any email

## Where It Lives

### Subscribe UI
- **Landing page:** "Get the Weekly Digest" section below the leaderboard
- **Role deep-dive:** Small inline "Follow [Role Name]" CTA near the top of the page
- **Component:** `src/components/DigestSubscribe.tsx`

### API Routes
- `POST /api/digest/subscribe` — add subscriber
- `POST /api/digest/unsubscribe` — remove subscriber
- `GET /api/digest/confirm/[token]` — double opt-in confirmation

### Generation
- `scripts/generate-digest.mjs` — builds and sends emails

## Subscribe Component

```
┌────────────────────────────────────────┐
│ GET THE WEEKLY DIGEST                  │
│                                        │
│ Track up to 3 roles. We'll email you   │
│ when the data moves.                   │
│                                        │
│ Email  [________________________]      │
│                                        │
│ Roles  [Product Designer      ×]      │
│        [Copywriter            ×]      │
│        [+ Add role              ]      │
│                                        │
│ Cadence  ○ Weekly  ● Monthly           │
│                                        │
│ [Subscribe]                            │
│                                        │
│ No spam. Unsubscribe anytime.          │
└────────────────────────────────────────┘
```

Design: follows site design system — no rounded inputs, monospace labels, signal colors only for data.

## Email Template

### Subject Line Format
- Weekly: "Weekly Digest: Product Designer ↓3%, Copywriter ↑2% — State of Creative Jobs"
- Monthly: "March 2026: Your Roles Report — State of Creative Jobs"

### Email Body Structure

```
STATE OF CREATIVE JOBS
Weekly Digest · Mar 10, 2026
─────────────────────────────

PRODUCT DESIGNER
Demand    4,218 openings (↓ 3% WoW)
Salary    $118,000 (→ flat)
AI Risk   52/100 Elevated (↑ +2)

Notable: "Figma ships AI auto-layout,
designers debate impact"

─────────────────────────────

COPYWRITER
Demand    2,891 openings (↓ 8% WoW)
Salary    $72,000 (→ flat)
AI Risk   71/100 High (→ flat)

Notable: 3 new AI writing tools
launched this week

─────────────────────────────

View full dashboard →
Unsubscribe
```

- Plain text-forward design (HTML email but styled minimally)
- Monospace numbers, sans-serif body
- Warm off-white background (#F5F3EE) if email clients support it
- No images except a small text logo at top
- Mobile-responsive (single column)

## Backend Infrastructure

### Option A — Lightweight (Recommended for MVP)
- **Email service:** Resend (generous free tier, great API, built for developers)
- **Subscriber storage:** Vercel KV (Redis) or a simple JSON file in the repo (for <1000 subscribers)
- **Double opt-in:** Required. Send confirmation email with token link.

### Option B — Scalable
- **Email service:** Resend or SendGrid
- **Subscriber storage:** Turso (SQLite edge DB) or PlanetScale
- **Queue:** Vercel Cron or separate worker for email sending

### Subscriber Data Model

```typescript
interface Subscriber {
  id: string;              // UUID
  email: string;
  roles: string[];         // slugs, max 3
  cadence: 'weekly' | 'monthly';
  confirmed: boolean;
  confirmToken: string;
  createdAt: string;
  lastSentAt: string | null;
}
```

### Email Generation Logic

`scripts/generate-digest.mjs`:
1. Read subscriber list
2. For each subscriber, read their tracked roles' latest snapshots
3. Compute WoW or MoM changes (requires storing previous snapshot — see note)
4. Pick most notable headline per role
5. Render email template
6. Send via Resend API
7. Update `lastSentAt`

**Note on WoW changes:** This feature benefits significantly from B4 (Historical Trend Database). Without it, WoW change requires storing the previous week's snapshot somewhere. Simplest approach: keep a `src/data/snapshots-previous/` directory that's copied before each refresh.

### Schedule
- **Weekly digest:** Monday morning after snapshot refresh (add step to GH Actions)
- **Monthly digest:** First Monday of the month

## Privacy & Compliance

- Double opt-in required (GDPR, CAN-SPAM)
- Unsubscribe link in every email (one-click)
- No tracking pixels
- Don't share subscriber emails with anyone
- Store minimal data (email, roles, cadence — nothing else)
- Confirmation email clearly states what they're subscribing to

## Dependencies to Add

```bash
npm install resend          # Email sending
npm install uuid            # Subscriber IDs
```

If using Vercel KV for storage:
```bash
npm install @vercel/kv
```

## Files to Create/Modify

| File | Action |
|---|---|
| `src/components/DigestSubscribe.tsx` | **Create** — subscribe form component |
| `src/app/api/digest/subscribe/route.ts` | **Create** — subscribe endpoint |
| `src/app/api/digest/unsubscribe/route.ts` | **Create** — unsubscribe endpoint |
| `src/app/api/digest/confirm/[token]/route.ts` | **Create** — confirmation endpoint |
| `scripts/generate-digest.mjs` | **Create** — email generation + sending |
| `scripts/templates/digest-email.html` | **Create** — email HTML template |
| `src/app/page.tsx` | **Modify** — add subscribe CTA to landing page |
| `src/app/role/[slug]/page.tsx` | **Modify** — add "Follow" CTA |
| `.github/workflows/refresh-snapshots.yml` | **Modify** — add digest sending step |

## What NOT to Touch

- Snapshot pipeline — digest reads data, never writes it
- Role Intelligence — separate concern
- Existing components — digest subscribe is additive
