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
│   ├── globals.css                 # Global styles + shadcn design tokens
│   ├── layout.tsx                  # Root layout: fonts, metadata, body
│   └── page.tsx                    # Homepage
│
├── components/
│   ├── layout/
│   │   └── container.tsx           # Max-width wrapper — used on every section
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
│   │   └── current-sprint.md
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
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

Configured in `tsconfig.json`: `"paths": { "@/*": ["./*"] }`

---

## Key Patterns

### Container Pattern
Every page section wraps its content in `<Container>`. Width capping and horizontal padding are never defined inline on sections. This is enforced by D-004.

### CSS Variable Token System
Design tokens (`--background`, `--foreground`, `--primary`, `--border`, `--radius`, etc.) are defined in `app/globals.css` using `oklch` colour values. They are consumed via Tailwind utility classes (`bg-background`, `text-foreground`, etc.). Changing a token updates all consumers.

### Server Components by Default
All components are React Server Components unless explicitly marked `"use client"`. Interactive components must isolate their client boundary to the smallest possible scope.

### Component Variants via CVA
shadcn/ui components use `class-variance-authority` (CVA) for variant management. New components should follow this pattern.

---

## Constraints

| Constraint | Reason |
|---|---|
| No `tailwind.config.js` | Tailwind v4 uses CSS-only config |
| No Pages Router | App Router only — see D-001 |
| No inline layout width | Container component is the sole layout authority |
| No gradients at this stage | Design principle — see design.md |
| No animations at this stage | Design principle — see design.md |

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
```

---

## Deployment

*Not yet decided.*

---

*Last updated: 2026-05-23*
