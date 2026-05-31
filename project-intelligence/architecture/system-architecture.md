# System Architecture

The technical structure and conventions of the C2B Web Design project.

---

## Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.5 |
| Runtime | React | 19.2.4 |
| Language | TypeScript | 5 (strict) |
| Styling | Tailwind CSS | 4 |
| Component system | shadcn/ui | 4.7.0 |
| Fonts | Geist Sans / Geist Mono (Next.js) | — |
| Icons | Lucide React | latest |
| Class utility | clsx + tailwind-merge via `cn()` | — |
| Package manager | npm | — |

---

## Directory Structure

```
agency-website-v2/
│
├── app/                            # Next.js App Router
│   ├── globals.css                 # Global styles + shadcn design tokens + enquiry animations
│   ├── layout.tsx                  # Root layout: fonts, metadata, body
│   ├── page.tsx                    # Homepage
│   └── start/
│       └── page.tsx                # /start route — thin wrapper for EnquiryOpening
│
├── components/
│   ├── enquiry/
│   │   └── enquiry-opening.tsx     # /start guided enquiry experience (client component)
│   ├── layout/
│   │   └── container.tsx           # Max-width wrapper — used on every homepage section
│   └── ui/
│       └── button.tsx              # shadcn Button (Base UI primitive)
│
├── lib/
│   └── utils.ts                    # cn() — safe Tailwind class merge
│
├── project-intelligence/           # AI operational memory and governance
│   ├── mission-overview.md
│   ├── decisions.md
│   ├── components/                 # Per-component documentation
│   ├── architecture/
│   │   └── system-architecture.md
│   ├── design-system/
│   │   └── design.md
│   ├── ai-system/
│   │   ├── ai-roles.md
│   │   └── context-rules.md
│   ├── active-sprints/
│   │   ├── current-sprint.md
│   │   └── archive/
│   │       └── sprint-1.md
│   ├── research/                   # Discovery, competitor analysis, references
│   └── reviews/
│       └── review-log.md
│
├── public/                         # Static assets
├── components.json                 # shadcn/ui configuration
├── tsconfig.json                   # TypeScript configuration
├── postcss.config.mjs              # PostCSS (Tailwind v4 plugin)
└── package.json
```

---

## Import Alias

All internal imports use the `@/` alias, which resolves to the project root.

```ts
import Container from "@/components/layout/container"
import EnquiryOpening from "@/components/enquiry/enquiry-opening"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

Configured in `tsconfig.json`: `"paths": { "@/*": ["./*"] }`

---

## Key Patterns

### Container Pattern
Every homepage section wraps its content in `<Container>`. Width capping and horizontal padding are never defined inline on sections. This is enforced by D-004/D-010.

The `/start` enquiry route does **not** use `Container` — `EnquiryOpening` is a full-viewport experience with its own layout. See D-015.

### CSS Variable Token System
Design tokens (`--background`, `--foreground`, `--primary`, `--border`, `--radius`, etc.) are defined in `app/globals.css` using `oklch` colour values. They are consumed via Tailwind utility classes (`bg-background`, `text-foreground`, etc.). Changing a token updates all consumers.

### Server Components by Default
All components are React Server Components unless explicitly marked `"use client"`. Interactive components must isolate their client boundary to the smallest possible scope.

`EnquiryOpening` is a client component — it uses `useState`, `useEffect`, and `setTimeout` for animation state and the `matchMedia` API.

### Component Variants via CVA
shadcn/ui components use `class-variance-authority` (CVA) for variant management. New components should follow this pattern.

### Font Loading Pattern
Geist font CSS variables are applied to `<html>` in `app/layout.tsx` via `className={`${geistSans.variable} ${geistMono.variable}`}`. This makes `--font-geist-sans` and `--font-geist-mono` available at the CSS root, enabling correct resolution of `--font-sans` and `--font-heading` in the `@theme inline` block of `globals.css`. Variables are applied to `<html>`, not `<body>`, because `globals.css` sets `font-family` on the `html` element — see D-011.

---

## Constraints

| Constraint | Reason |
|---|---|
| No `tailwind.config.js` | Tailwind v4 uses CSS-only config |
| No Pages Router | App Router only — see D-001 |
| No inline layout width on homepage sections | Container component is the sole layout authority — D-010 |
| No gradients on homepage | Design principle — see design.md. Exception: enquiry experience — see D-015, D-016. |
| No animations on homepage | Design principle — see design.md. Exception: enquiry experience — see D-015, D-016. |

---

## CSS Architecture

`app/globals.css` layers, in order:

```css
@import "tailwindcss";          /* Tailwind v4 core */
@import "tw-animate-css";       /* Animation utilities (unused — available) */
@import "shadcn/tailwind.css";  /* shadcn Tailwind v4 integration */

@custom-variant dark (...);     /* .dark class triggers dark mode tokens */
@theme inline { ... }           /* Maps CSS vars → Tailwind colour utilities */
:root { ... }                   /* Light mode token values (oklch) */
.dark { ... }                   /* Dark mode token values (oklch) */
@layer base { ... }             /* Global element resets */

/* Enquiry animation keyframes and classes — approved by D-015, D-016 */
@keyframes enquiry-mask-reveal-horizontal { ... }
@keyframes enquiry-mask-reveal-downward   { ... }
@keyframes enquiry-q5-presence            { ... }
@keyframes enquiry-nextstep-appear        { ... }

/* Enquiry classes: .enquiry-heading-line1-mask, .enquiry-heading-line2-mask,  */
/* .enquiry-subtext-mask, .enquiry-button-mask, .enquiry-content-centered,     */
/* .enquiry-content-settling, .enquiry-context-dimmed, .enquiry-q1-question,   */
/* .enquiry-card-reveal, .enquiry-q5-cue, .enquiry-card, .enquiry-card-selected, */
/* .enquiry-nextstep-reveal, .enquiry-nextstep-btn                             */
/* All enquiry classes are scoped to the /start experience only.               */
```

All enquiry animation classes carry `prefers-reduced-motion: reduce` overrides.

---

## Deployment

*Not yet decided.*

---

*Last updated: 2026-05-31*
