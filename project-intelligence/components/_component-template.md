# Component Documentation — [Component Name]

**Status:** IMPLEMENTED | REVIEW REQUIRED | DEPRECATED  
**Component file:** `components/{path}/{name}.tsx`  
**Review entry:** R-###  
**Related decisions:** D-###  

---

## Purpose

What the component does, functionally. One to three sentences. What it renders and where it is used.

---

## UX Goal

What the component achieves for the user. Not what it renders — what it does for the experience. How it serves the visitor navigating the site.

---

## Emotional Role

What impression the component is intended to produce. Tied directly to the luxury / minimal / futuristic direction from `design.md`.

Examples: *authority*, *calm*, *precision*, *restraint*, *confidence*.

The component either reinforces the agency's visual identity or it does not. State which, and how.

---

## Design Principles Applied

Which specific principles from `design.md` govern this component. Reference by section, not by paraphrase.

- Spacing: ...
- Typography: ...
- Colour: ...
- Layout: ...
- Motion: None at this stage / [description]

---

## Layout Behaviour

How the component positions, sizes, and behaves in the layout. Describe expected visual behaviour in context.

---

## Animation Behaviour

**None at this stage.** — or —

Trigger: [what triggers it]  
Duration: [ms]  
Easing: [ease-out / etc.]  
Decision reference: D-###  

If no animation: state *None. No motion applied.* explicitly. Do not leave this section blank.

---

## Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| Mobile (`< 640px`) | |
| Small (`sm`, ≥ 640px) | |
| Medium (`md`, ≥ 768px) | |
| Large (`lg`, ≥ 1024px) | |

---

## Accessibility Considerations

ARIA roles, keyboard behaviour, focus management, contrast requirements.

If purely presentational with no interactive elements: state *Presentational only. No ARIA roles required. No keyboard interaction.*

Do not leave blank.

---

## Dependencies

| Dependency | Type | Purpose |
|---|---|---|
| | npm / internal component / utility | |

If none: `None beyond React and Tailwind CSS.`

---

## Related Decisions

| ID | Title |
|---|---|
| D-### | [Short decision title] |

---

## Known Issues

None. — or —

| ID | Description | Severity | Review Reference |
|---|---|---|---|
| | | Low / Medium / High | R-### |

---

## Review History

| ID | Date | Reviewer | Status |
|---|---|---|---|
| R-### | YYYY-MM-DD | [Agent / Human] | Open / Actioned / Dismissed |

---

## Future Improvements

*None identified.* — or —

- [Specific improvement with rationale. Not wishlist items — only improvements with a clear trigger or threshold.]

---

*Last updated: YYYY-MM-DD*
