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

| Severity | ID | Finding |
|---|---|---|
| High | F-001 | Geist font variables declared in `layout.tsx` but not applied to `<body>` className — Geist is not rendering |
| High | F-002 | `--font-sans` in `globals.css` references `var(--font-sans)` — circular, no effect. Should reference `var(--font-geist-sans)` |
| Medium | F-003 | Navbar has no mobile responsive state — links will overflow or collapse on small screens |
| Low | F-004 | Nav and CTA use plain `<a>` tags — should use Next.js `<Link>` for client-side routing |

**Recommendations:**
- Apply `${geistSans.variable} ${geistMono.variable}` to `<body>` className in `layout.tsx`
- Correct `--font-sans` token in `globals.css` to `var(--font-geist-sans)`
- Add mobile nav before launch — pattern TBD (hamburger menu, collapsed links, or slide drawer)
- Replace `<a>` with `<Link>` from `next/link`

**Status:** Open — routed to `current-sprint.md` Up Next

---

*Last updated: 2026-05-23*
