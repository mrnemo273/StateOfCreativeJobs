# Design System — State of Creative Jobs

**Related docs:** `GOALS.md` | `PRD.md` | `TRD.md`

> This is the authoritative visual specification for the entire application. Every component, chart, and layout must conform to these rules. When in doubt, refer back to this document. If something on screen looks like a SaaS dashboard, it violates this spec.

---

## Concept Direction

**"Labor Intelligence, Typeset Well."**

The visual language draws from Swiss International Style print design, post-war European labor statistics publications, and contemporary editorial outlets like *Works That Work*, *Offscreen*, and the *Neue Grafik* journal. Data is treated as content, not decoration. Every number earns its space.

Think: a well-designed annual report from a Zurich consulting firm, published in 1971, but running in a browser in 2026.

**The one thing someone will remember:** The grid. Everything snaps. Nothing floats. Information has address.

---

## Typography

### Typefaces

```css
/* Display / Headlines */
--font-display: 'Editorial New', 'Canela', 'Freight Display Pro', Georgia, serif;
/* → Used for section titles, report headers, hero numbers */

/* Data / Monospaced */
--font-mono: 'IBM Plex Mono', 'Söhne Mono', 'Courier New', monospace;
/* → Used for all numeric values, percentages, dates, codes */

/* Body / UI */
--font-sans: 'Neue Haas Grotesk', 'Aktiv Grotesk', 'Helvetica Neue', Helvetica, sans-serif;
/* → Used for labels, body copy, navigation, metadata */
```

**Fallback stack note:** If custom fonts unavailable, use `'DM Serif Display'` (Google Fonts) for display and `'IBM Plex Mono'` + `'DM Sans'` for sans. Avoid Inter, Roboto, and system-ui at all costs.

### Type Scale

```css
--text-display-xl: clamp(3rem, 6vw, 6rem);     /* Hero job title */
--text-display-lg: clamp(2rem, 4vw, 3.5rem);   /* Section headlines */
--text-display-md: clamp(1.5rem, 2.5vw, 2rem); /* Card headers */

--text-data-xl: clamp(2.5rem, 5vw, 5rem);      /* Big metric numbers */
--text-data-lg: clamp(1.5rem, 3vw, 2.5rem);    /* Sub-metrics */
--text-data-md: 1.125rem;                       /* Inline data values */
--text-data-sm: 0.875rem;                       /* Table values */

--text-label-lg: 0.875rem;                      /* Section labels, uppercase tracked */
--text-label-md: 0.75rem;                       /* Card labels */
--text-label-sm: 0.625rem;                      /* Footnotes, metadata */

--text-body: 1rem;                              /* Body copy */
--text-body-sm: 0.875rem;                       /* Secondary body */
```

### Typographic Rules

- **Section labels** always uppercase, tracked at `0.12em`, `font-weight: 500`, color `--color-mid`
- **Big numbers** always `font-family: var(--font-mono)`, tabular figures (`font-variant-numeric: tabular-nums`)
- **Headlines** set in display serif, weight 400 (not bold — Swiss style favors weight contrast through size, not weight)
- **No decorative underlines.** Use hairline rules (1px) for separation instead
- **Line height:** Display = 0.95–1.0. Body = 1.5–1.6. Data labels = 1.2
- **Measure:** Body text max 65 characters per line

---

## Color

### Palette

```css
:root {
  /* Base */
  --color-ink:       #0A0A0A;   /* Near-black. Primary text, borders */
  --color-paper:     #F5F3EE;   /* Warm off-white. Page background */
  --color-white:     #FFFFFF;   /* Card backgrounds */

  /* Tones */
  --color-dark:      #1A1A1A;   /* Secondary text, strong labels */
  --color-mid:       #6B6B6B;   /* Labels, metadata, secondary info */
  --color-light:     #C8C4BC;   /* Hairlines, dividers, disabled states */
  --color-faint:     #ECEAE4;   /* Subtle backgrounds, hover states */

  /* Signal Colors — used ONLY for data meaning, never decoration */
  --color-up:        #1A6B3A;   /* Positive trend (dark green) */
  --color-up-bg:     #EAF4EE;   /* Positive trend background */
  --color-down:      #8B1A1A;   /* Negative trend (dark red) */
  --color-down-bg:   #F7EAEA;   /* Negative trend background */
  --color-neutral:   #5A4E2A;   /* Flat / inconclusive (warm brown) */
  --color-neutral-bg:#F5F0E4;   /* Neutral background */

  /* Accent — used sparingly, one per page max */
  --color-accent:    #1A1A6B;   /* Deep navy. Highlight, active states */
  --color-accent-bg: #EAEAF7;   /* Accent background tint */
}
```

### Dark Mode (Report / Night Reading)

```css
[data-theme="dark"] {
  --color-ink:    #F0EDE6;
  --color-paper:  #0F0F0D;
  --color-white:  #1A1A18;
  --color-dark:   #D4D0C8;
  --color-mid:    #8A8680;
  --color-light:  #3A3832;
  --color-faint:  #242420;
}
```

**Color rules:**
- Background is always `--color-paper`, never pure white
- Charts use signal colors only — no rainbow palettes, no brand colors in data
- Accent appears once per view (active nav item, selected job title, primary CTA)
- Never use opacity variants for signal colors — use the explicit `--color-*-bg` tokens

---

## Grid System

### Philosophy
Swiss grid. Everything has an address. Nothing floats free.

### Base Grid

```css
:root {
  --grid-columns: 12;
  --grid-gutter:  clamp(1rem, 2vw, 1.5rem);
  --grid-margin:  clamp(1.5rem, 4vw, 4rem);
  --grid-unit:    0.25rem;  /* 4px base unit — all spacing is multiples */
}
```

### Breakpoints

```css
--bp-sm:  640px;   /* Mobile landscape */
--bp-md:  768px;   /* Tablet */
--bp-lg:  1024px;  /* Small desktop */
--bp-xl:  1280px;  /* Standard desktop */
--bp-2xl: 1536px;  /* Wide */
```

### Column Layouts (Dashboard)

```
Mobile (< 768px):     1 col — full width stacked sections
Tablet (768–1024px):  2 col — paired cards
Desktop (> 1024px):   12-col grid:
  - Full-width header:          12 cols
  - Primary metric cards:       3 cols each (×4)
  - Trend chart + sidebar:      8 + 4 cols
  - Skills section:             6 + 6 cols
  - Posting analysis:           12 cols (full width table/matrix)
  - Footer / methodology note:  12 cols
```

### Spacing Scale (4px base unit)

```css
--space-1:  0.25rem;  /*  4px */
--space-2:  0.5rem;   /*  8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-5:  1.25rem;  /* 20px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

---

## Component Language

### Cards

```
Background:     --color-white
Border:         1px solid --color-light
Border-radius:  0 (no rounded corners — Swiss style is rectilinear)
Padding:        --space-6 (24px)
Shadow:         none (borders, not shadows, define space)
```

### Dividers & Rules

```
Section dividers:   1px solid --color-ink (full bleed, strong)
Card dividers:      1px solid --color-light (internal, quiet)
Data rows:          1px solid --color-faint (table rows, very quiet)
```

No `box-shadow` anywhere. Depth is created through layering and border weight, not drop shadows.

### Trend Indicators

```
Up arrow:    ↑  color: --color-up    background: --color-up-bg
Down arrow:  ↓  color: --color-down  background: --color-down-bg
Flat:        →  color: --color-neutral background: --color-neutral-bg

Always: font-family monospace, font-size --text-label-md
```

### Charts

- **Line charts:** 1.5px stroke, no fill/area, no dots except on hover
- **Bar charts:** 100% height bars, no rounded ends, 2px gap between bars
- **Axis labels:** `--font-mono`, `--text-label-sm`, `--color-mid`
- **Grid lines:** 1px `--color-faint` horizontal only, no vertical grid lines
- **No chart titles** — the section heading IS the chart title
- **Tooltips:** Plain, no rounded corners, `--color-ink` background, `--color-paper` text

### Tables (Skills Matrix, Posting Analysis)

```
Header row:     uppercase, tracked, --text-label-md, --color-mid, border-bottom 1px --color-ink
Data rows:      --text-data-sm, monospace for numbers
Row hover:      background --color-faint
No zebra stripe
Borders:        horizontal rules only, 1px --color-faint
```

### Navigation

```
Top bar height:   48px
Font:             --font-sans, --text-label-lg, uppercase, tracked
Active state:     --color-accent underline 2px
Job title pill:   border 1px --color-light, no background, hover: --color-faint
```

---

## Motion & Interaction

**Philosophy:** Motion serves information, not entertainment.

```
Page load:        Sections fade in staggered, 40ms delay between, 200ms duration, ease-out
Data updates:     Number counters animate from old → new value, 400ms
Chart draws:      Lines draw left-to-right on mount, 600ms, ease-in-out
Hover states:     80ms transition on background-color only — nothing else
No:               Parallax, scroll animations, bounce physics, spring curves
```

---

## Report Typography (Monthly PDF/Markdown)

When generating monthly reports, apply this additional typographic system:

```
Report title:     Display serif, large, centered, date in mono below
Section heads:    All caps, tracked, mono, with rule above
Body text:        Serif body, 11pt/16pt in PDF, comfortable reading measure
Data callouts:    Large mono number, small serif label below, boxed with hairline
Footnotes:        8pt mono, bottom of each section
Page numbers:     Mono, bottom center
Running header:   Title + date, light, top right
```

---

## Reference Aesthetic

**Print:**
- *Neue Grafik* magazine (1958–1965)
- Swiss Federal Statistical Office annual reports
- Karl Gerstner's *Designing Programmes*
- *Works That Work* magazine

**Digital:**
- Bloomberg Terminal data density (but beautiful)
- Are.na profile pages (restraint, editorial)
- Stripe Press (typography-first, generous white space)
- *Offscreen* magazine website

**Anti-references (what this is NOT):**
- Startup dashboard (no gradients, no purple, no "glassmorphism")
- Analytics SaaS (no rounded pill cards, no color explosions)
- Dark mode hacker terminal (no neon on black)
- Generic data viz (no D3 showcase aesthetics)

---

## Implementation Notes for Claude Code

1. Import fonts via `next/font` — use `localFont` if self-hosting, or Google Fonts for `IBM Plex Mono` + `DM Serif Display` as reliable fallbacks
2. Define all tokens in `app/globals.css` as CSS custom properties
3. Create a `tailwind.config.ts` that maps all tokens to Tailwind utilities (e.g. `font-display`, `text-ink`, `bg-paper`)
4. All numeric values rendered via a `<DataValue>` component that enforces `font-mono` + `tabular-nums`
5. All section labels rendered via a `<SectionLabel>` component that enforces uppercase + tracking
6. No `rounded-*` Tailwind classes anywhere in the codebase — add a lint rule if possible
7. Default chart theme defined once in `lib/chartTheme.ts` — never style charts inline
