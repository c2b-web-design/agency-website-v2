# Design System

> ## ⚠⚠ OUTDATED — Carl, 11 August 2026. DO NOT REASON FROM THE COLOUR SECTION.
>
> **This file describes the greyscale scaffold the site began as.** The build has moved a long way
> past it and the file was never re-tracked.
>
> **What is stale:** the **Colour** section below is near-black, greys and white, with no blue and
> no gold. **The `/start` corridor is built almost entirely from blues and a gold, and the brand
> colours were chosen BEFORE the site — the logos were designed around them.** Carl: *"these logos
> were not created randomly but had in mind what brand colours I was going to use on the site."*
>
> **⚠ THE PALETTE *IS* RECORDED — IN `decisions.md` D-025, NOT HERE.** *"Near-black base,
> gold/amber as premium accent light, teal/duck-egg/deep blue as modern intelligence accent"*,
> 14 June 2026, APPROVED as direction. **This file's Colour section contradicts it and is the one
> that is wrong.** D-025 even anticipated this: it was written *"so future agents do not treat the
> current neutral-only palette as the permanent final state"* — and an agent did exactly that on
> 11 August, because it read this file and not that entry.
>
> **The measured values live in component files**, each derived with its own local reasoning:
> `#f2bf61` (the field's champagne, **sampled from the logo's own gold**, 149,431 pixels, 75th
> percentile) in `contact-field-mesh.tsx`; the glass, opal and environment constants in
> `answer-card-glass.ts`. **D-025 gives the direction; those give the numbers; nothing joins them.**
>
> ⚠ **AND THIS FILE MISLED THE BUILDER THE SAME DAY IT WAS FLAGGED.** Reading a greyscale palette
> as current, it treated the corridor's colour as local implementation choices and the logos as
> candidates being tested against a settled site — **exactly backwards.** The palette came first.
> A file that describes an earlier phase with full authority is an instrument, and it lies like one.
>
> **What is still good:** the Principles above, typography, spacing and motion sections have not
> been contradicted by the build. **The Colour section is the part that has been overtaken.**
>
> **What it needs:** this file's Colour section reconciled with D-025, and the measured values
> joined to the direction they came from — so a reader finds one answer rather than two that
> disagree. ⚠ **The Builder must not invent the join**: D-025 gives words, the components give
> numbers, and deciding which number expresses which word is Carl's, not an inference from renders.
>
> ⚠ **AND IT MATTERS BEYOND THIS SITE.** `current-sprint.md` records that this repo becomes the
> workshop template and every client build clones it. **An unrecorded palette does not survive
> that** — the greyscale table would go forward as though it were the whole story.
>
> See `ai-system/working-with-carl.md` → *How Carl builds — the DAW model* (track, re-track,
> master) and `context-rules.md` → *Approved work is amendable*.

The visual identity for C2B Web Design. These principles govern every decision — colour, typography, spacing, and motion. All implementation must align with this document.

---

## Principles

**Luxury through restraint.** Empty space is not wasted space. It is the signal.  
**Nothing decorative.** Every element must earn its position on the page.  
**Built for longevity.** Choices are made for five years out, not for current trends.  

When in doubt: remove, do not add.

---

## Colour

> ⚠⚠ **THIS SECTION IS OUTDATED — see the banner at the top of the file.** It describes the
> greyscale scaffold, not the brand. **The brand colours came first and the logos were designed
> around them**; the corridor is blue with gold from the logo's own sampled `#f2bf61`. The table
> below is still accurate for the **homepage's structural greys**, and wrong as a statement about
> the palette.

The palette is near-black with neutral grey tones and white as the primary contrast.

| Role | Tailwind Class | Notes |
|---|---|---|
| Page background | `bg-neutral-950` | Forced dark — see D-007 |
| Primary text | `text-white` | All headlines and labels |
| Secondary text | `text-neutral-400` | Supporting copy, nav links |
| Muted / placeholder | `text-neutral-500` | Coming soon, captions |
| Section dividers | `border-neutral-800` | Hairline separators between sections |
| CTA (primary) | `bg-white text-black` | White pill button |
| CTA hover | `hover:bg-neutral-100` | Subtle pull-back on hover |

shadcn/ui design tokens (oklch-based) are available in `globals.css` for future component use. The forced-dark colour layer above takes precedence on the page level.

**Homepage:** No gradients. No colour accents.

**Enquiry experience exception:** Amber/gold warmth and a faint teal countertone are approved for the `/start` guided enquiry card selected state — see D-016. These are scoped to `components/enquiry/enquiry-opening.tsx` and the enquiry CSS classes in `globals.css`. They do not apply to the homepage or any other surface.

**Brand colour direction:**  
Near-black base, gold/amber as premium accent light, teal/duck-egg/deep blue as modern intelligence accent. **Directional — not applied to the homepage.** It is recorded because it explains built work: the frosted blue glass card material (D-028) derives from it. See D-025. **Do not apply to the homepage or any surface without a brief from Carl.**

**Enquiry colour/material:** approved as built. The forward-looking colour pass previously described here was removed on 28 July 2026 — **future work is not kept in this repository.** The guard stands: no colour or material change without a brief.

---

## Typography

| Role | Font | Variable |
|---|---|---|
| Sans (primary) | Geist Sans | `--font-geist-sans` |
| Mono | Geist Mono | `--font-geist-mono` |

### Scale

| Level | Classes | Usage |
|---|---|---|
| Display / H1 | `text-6xl font-bold tracking-tight leading-tight` | Hero headline |
| H2 | `text-3xl font-semibold tracking-tight` | Section headings |
| Body large | `text-lg text-neutral-400` | Hero subtext |
| Body | `text-base` | Standard copy |
| Small | `text-sm` | Captions, nav links, labels |

`tracking-tight` is the default for all headings. Headlines should never span the full container width — use `max-w-3xl` on H1, `max-w-xl` on supporting paragraphs.

---

## Spacing

Spacing communicates hierarchy. The premium feel is inseparable from generous vertical rhythm.

| Context | Class | Value |
|---|---|---|
| Hero vertical | `py-32` | 8rem — the hero earns the most air |
| Section vertical | `py-24` | 6rem — consistent between sections |
| Navbar vertical | `py-5` | 1.25rem — compact, not dominant |
| Footer vertical | `py-10` | 2.5rem — a quiet ending |
| Headline → subtext | `mt-6` | 1.5rem |
| Subtext → CTA | `mt-10` | 2.5rem |

Do not invent new spacing values. Work within Tailwind's scale.

---

## Layout

All homepage content is wrapped in the `Container` component — see D-010.

```tsx
// components/layout/container.tsx
// mx-auto max-w-7xl px-4 sm:px-6 lg:px-8
```

- Max width: `1280px`  
- Padding: `16px` mobile → `24px` tablet → `32px` desktop  
- Never define layout width or horizontal padding inline on homepage sections  

The `/start` enquiry experience (`components/enquiry/enquiry-opening.tsx`) is a full-viewport layout and does not use `Container`. It manages its own centring and padding. See D-015.

---

## Motion

### Homepage
No animations on the homepage. The homepage visual system is static and restrained. When motion is introduced to the homepage, it must be subtle (duration 150–300ms, ease-out), and requires a decision log entry.

`tw-animate-css` is installed and available — use it conservatively on the homepage.

### `/start` Enquiry Experience
Motion is approved and governs the entire `/start` route. It is not decorative — it is part of the conversion architecture. See D-015 and D-016.

**Approved motion principles:**
- Style: legato — phrasing, space, and intention over speed or spectacle. "Gilmour, not Malmsteen." No "Oppenheimer" energy: no grandiose theatrical motion, no dramatic overstatement.
- All reveals use CSS `clip-path: inset()` masks. No JS animation libraries.
- Easing: `linear` throughout — deliberate, constant sweep pace that matches reading speed.
- Each element enters slightly before the previous fully resolves — pulled forward like a musical phrase.
- Duration range: 1200ms–4600ms depending on element role and semantic weight.
- Motion must never create urgency or feel like a countdown timer.
- `prefers-reduced-motion: reduce` must disable all staged reveals — all content immediately visible.

**Approved gradient/material effects:**
Gradients and material surface effects (smoked glass, inset hairlines, ambient glow) are approved for the `/start` enquiry card surface only — see D-016. They are scoped to enquiry CSS classes in `globals.css` and must not be applied to homepage sections.

---

## Component Philosophy

Components built on shadcn/ui must:

1. Accept a `className` prop for external override
2. Use the `cn()` utility from `lib/utils.ts` for class composition
3. Use CSS variable tokens (`bg-background`, `text-foreground`, etc.) for themed surfaces
4. Receive a documentation file in `/project-intelligence/components/` upon completion

---

*Last updated: 2026-08-11 — ⚠ FLAGGED OUTDATED by Carl. The Colour section describes the greyscale scaffold and contradicts D-025, which records the real brand direction. Principles, typography, spacing and motion are unaffected. Prior footer: 2026-06-14 — Brand colour direction and enquiry future colour pass added (D-025, D-024).*
