# Component Documentation — Container

**Status:** IMPLEMENTED  
**Component file:** `components/layout/container.tsx`  
**Review entry:** R-001 (homepage skeleton review — partial; component-specific review pending)  
**Related decisions:** D-004  

---

## Purpose

A layout wrapper that applies a consistent maximum width and responsive horizontal padding to all page content. Used in every section of every page. It does not render visible UI — it enforces layout rules.

---

## UX Goal

Prevents content from stretching to the full viewport width on large screens, which degrades readability and visual hierarchy. Ensures that as screen size increases, content remains centred and proportional — not edge-to-edge.

---

## Emotional Role

**Precision and restraint.**

The Container is invisible to the visitor but its absence is immediately felt — content without a container feels uncontrolled. The Container imposes the same quiet discipline that governs premium editorial and luxury brand layouts: nothing bleeds to the edge without intention.

---

## Design Principles Applied

- **Spacing:** Responsive horizontal padding (`px-4 sm:px-6 lg:px-8`) follows the premium spacing philosophy — tighter on mobile (content is primary), more breathable at desktop.
- **Layout:** `max-w-7xl` (1280px) is the site-wide content boundary. All sections share this boundary, producing a visually unified column. See `design.md` — Layout section.
- **Colour:** None — the component is structurally transparent.
- **Motion:** None. No motion applied.

---

## Layout Behaviour

The Container renders a `<div>` that:
- Centers itself horizontally via `mx-auto`
- Caps its width at 1280px (`max-w-7xl`)
- Applies responsive horizontal padding to prevent content touching screen edges

All page sections wrap their content in `<Container>`. No section defines its own width or horizontal padding independently. The Container is the single source of layout authority — see D-004.

---

## Animation Behaviour

None. No motion applied. The Container is a structural primitive.

---

## Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| Mobile (`< 640px`) | `px-4` — 16px horizontal padding. Content fills remaining width. |
| Small (`sm`, ≥ 640px) | `px-6` — 24px padding. Slight increase as viewport grows. |
| Large (`lg`, ≥ 1024px) | `px-8` — 32px padding. Maximum breathing room at desktop widths. |

The `max-w-7xl` cap activates only once the viewport exceeds 1280px. Below that, the component is full-width minus padding.

---

## Accessibility Considerations

Presentational only. No ARIA roles required. No keyboard interaction. The component does not affect document semantics — it wraps content inside existing semantic elements (`<section>`, `<nav>`, `<footer>`).

---

## Dependencies

| Dependency | Type | Purpose |
|---|---|---|
| React | npm | `React.ReactNode` type for `children` prop |
| Tailwind CSS | npm | All layout classes |

No `cn()` utility — class string is static and requires no conditional merging.

---

## Related Decisions

| ID | Title |
|---|---|
| D-004 | Layout: Reusable Container Component |

---

## Known Issues

None.

---

## Review History

| ID | Date | Reviewer | Status | Notes |
|---|---|---|---|---|
| R-001 | 2026-05-23 | Claude Code | Open | Partial — homepage skeleton reviewed. Container not reviewed in isolation. Dedicated review pending. |

---

## Future Improvements

- Consider adding an optional `as` prop to allow rendering as semantic elements other than `<div>` (e.g. `<section>`, `<main>`) — only if a concrete use case emerges. Do not add preemptively.
- Consider adding a `narrow` variant (`max-w-3xl`) for content-heavy pages (articles, case studies) — pending content strategy decision from ChatGPT.

---

*Last updated: 2026-05-23*
