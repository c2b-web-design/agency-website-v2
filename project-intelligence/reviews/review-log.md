# Review Log

All visual QA, component, and sprint reviews are logged here in reverse-chronological order.

Reviews are observational. They surface findings and recommendations. They do not override architecture or design-system decisions. See `context-rules.md` Rule 6.

---

## Schema

```
ID:               R-###
Date:             YYYY-MM-DD
Reviewer:         Agent name or Human
Subject:          What was reviewed
Findings:         Observations — factual, not editorial
Flags:            Issues requiring attention (severity: Low / Medium / High / Critical)
Recommendations:  Optional — must route through ChatGPT before actioning
Status:           Open | Actioned | Dismissed
```

---

## R-001 — Homepage Skeleton

**Date:** 2026-05-23  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `app/page.tsx` — initial homepage structure  

**Findings:**
- Navbar, Hero, Services, Work, and Footer sections render in correct order
- Forced dark background (`bg-neutral-950`) applied consistently across all sections
- `Container` component used in every section — layout is consistent
- Typography hierarchy is clear: H1 (6xl bold) → H2 (3xl semibold) → body (lg, neutral-400) → muted (sm, neutral-500)
- CTA button (white pill, `rounded-full`) is visually distinct against the dark background
- Section dividers (`border-t border-neutral-800`) create rhythm without visual noise

**Flags:**

| Severity | ID | Finding | Status |
|---|---|---|---|
| High | F-001 | Geist font variables declared in `layout.tsx` but not applied to `<html>` className — Geist not rendering | Actioned — Sprint 2. Variables applied to `<html>`. See D-011. |
| High | F-002 | `--font-sans` in `globals.css` references `var(--font-sans)` — circular, no effect | Actioned — Sprint 2. Corrected to `var(--font-geist-sans)`. `--font-heading` also fixed. See D-011. |
| Medium | F-003 | Navbar has no mobile responsive state — links will overflow or collapse on small screens | Open — Sprint 2 Up Next |
| Low | F-004 | Nav and CTA use plain `<a>` tags — should use Next.js `<Link>` for client-side routing | Open — Sprint 2 Up Next |

**Recommendations:**
- Apply `${geistSans.variable} ${geistMono.variable}` to `<html>` className in `layout.tsx` (not `<body>` — see D-011 for rationale)
- Correct `--font-sans` and `--font-heading` tokens in `globals.css` to `var(--font-geist-sans)`
- Add mobile nav before launch — pattern TBD (hamburger menu, collapsed links, or slide drawer)
- Replace `<a>` with `<Link>` from `next/link`

**Status:** Partially actioned — F-001 and F-002 resolved in Sprint 2. F-003 and F-004 remain open.

---

*Last updated: 2026-05-23*
