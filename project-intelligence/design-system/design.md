# Design System

The visual identity for C2B Web Design. These principles govern every decision — colour, typography, spacing, and motion. All implementation must align with this document.

---

## Principles

**Luxury through restraint.** Empty space is not wasted space. It is the signal.  
**Nothing decorative.** Every element must earn its position on the page.  
**Built for longevity.** Choices are made for five years out, not for current trends.  

When in doubt: remove, do not add.

---

## Colour

The palette is near-black with neutral grey tones and white as the primary contrast.

| Role | Tailwind Class | Notes |
|---|---|---|
| Page background | `bg-neutral-950` | Forced dark — see D-007 |
| Primary text | `text-white` | All headlines and labels |
| Secondary text | `text-neutral-400` | Supporting copy, nav links |
| Muted / placeholder | `text-neutral-500` | Coming soon, captions |
| Section dividers | `border-neutral-800` | Hairline separators between sections |
| CTA (primary) | `bg-white text-black` | White pill button |
| CTA hover | `hover:bg-neutral-200` | Subtle pull-back on hover |

shadcn/ui design tokens (oklch-based) are available in `globals.css` for future component use. The forced-dark colour layer above takes precedence on the page level.

No gradients. No colour accents at this stage.

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

All page content is wrapped in the `Container` component — see D-004.

```tsx
// components/layout/container.tsx
// mx-auto max-w-7xl px-4 sm:px-6 lg:px-8
```

- Max width: `1280px`  
- Padding: `16px` mobile → `24px` tablet → `32px` desktop  
- Never define layout width or horizontal padding inline on sections  

---

## Motion

**No animations at this stage.**

When introduced, the rules are:
- Subtle only. No bounces, no spins, no parallax.
- Duration: 150–300ms.
- Easing: ease-out.
- `tw-animate-css` is installed and available — use it conservatively.
- All motion decisions require a decision log entry (D-###).

---

## Component Philosophy

Components built on shadcn/ui must:

1. Accept a `className` prop for external override
2. Use the `cn()` utility from `lib/utils.ts` for class composition
3. Use CSS variable tokens (`bg-background`, `text-foreground`, etc.) for themed surfaces
4. Receive a documentation file in `/project-intelligence/components/` upon completion

---

*Last updated: 2026-05-23*
