# Current Sprint — Sprint 2

---

## Sprint Goal

Build the homepage to a complete, production-quality state and begin the `/start` guided enquiry experience. Establish the visual and interaction foundation that the rest of the site will extend.

## Sprint Period

2026-05-23 → Open

---

## Completed

| Task | Output | Notes |
|---|---|---|
| Governance normalization | `context-rules.md`, `decisions.md`, `handoff-protocol.md` | Status vocabulary unified — `Active` replaced by `APPROVED` throughout |
| D-004 authority corrected | `decisions.md` D-004 DEPRECATED, D-010 added | Human Founder re-attributed as authority; history preserved |
| D-011 logged | `decisions.md` | Geist font loading pattern — `<html>` not `<body>` |
| Sprint 1 archived | `active-sprints/archive/sprint-1.md` | Archive structure created |
| Font variables applied to `<html>` | `app/layout.tsx` | Resolves R-001 F-001 — see D-011 |
| `--font-sans` circular reference fixed | `app/globals.css` | Resolves R-001 F-002 — `--font-heading` also corrected |
| Services section | `app/page.tsx` | D-012 service model: Premium Website Design, Website Transformation, Intelligent Enquiry Systems, Ongoing Growth & Improvement — 2-col card grid |
| Work/Proof section | `app/page.tsx` | D-013: agency website as first proof piece — 3-col card grid: Design Standard, Business Thinking, Modern Capability |
| Final CTA section | `app/page.tsx` | D-014: consultative closing invitation; links to `/start` |
| `/start` Stage 1 opening reveal | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-015: legato clip-path mask sequence; Begin button; ~11.5s phrase; full reduced-motion support |
| `/start` Stage 2 — Q5 guided question | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-016: multi-select cards, Q5 orientation cue, frosted glass card surface, "Next step" trigger |
| Q5 → Q4 transition design | `project-intelligence/decisions.md` | D-017: layered attention model, Q4 question and options, motion principles, open items documented |

---

## In Progress

*Nothing currently active.*

---

## Up Next

| Task | Priority | Notes |
|---|---|---|
| Wire "Next step" to Q4 | High | Currently logs to console. Q4 transition model approved (D-017) — ready for implementation brief. |
| Mobile navbar (responsive collapse) | Medium | R-001 F-003 — pattern TBD (hamburger, collapsed links, slide drawer) |
| Real contact flow | Medium | `/start` CTA on homepage links to `/start`. Submit path not implemented. |
| Metadata, SEO, Open Graph | Low | Page titles, descriptions, and social sharing not yet set. |
| Replace `<a>` tags with `<Link>` | Low | R-001 F-004 — nav and CTA use plain `<a>`. Next.js `<Link>` for client-side routing. |
| Deployment target decision | Low | Vercel or other — not yet decided. |

---

## Open Questions

- Deployment target? (Vercel, other)
- Q4 select behaviour: single-select or multi-select? (see D-017)
- Q5 memory format: comma-separated label text or condensed prose summary? (see D-017)
- Q4 timing: exact duration of Q5 de-emphasis vs Q4 entry overlap? (see D-017)
- Portfolio case studies — any existing client work to reference?
- Agency tagline / positioning statement?
- Mobile nav pattern — hamburger, collapsed links, or slide drawer?

---

## Blockers

*None.*

---

## Sprint Success Criteria

Sprint 2 is complete when:

1. Homepage is production-quality at all breakpoints (complete)
2. `/start` Stage 1 opening reveal is approved (complete)
3. `/start` Stage 2 Q5 guided question is approved (complete)
4. Q4 transition is designed, approved, and implemented
5. Mobile navbar resolved
6. Real contact flow wired through `/start`

---

*Last updated: 2026-05-31 — homepage complete; Stage 1 and Stage 2 Q5 approved; Q5 → Q4 transition model approved (D-017); Q4 implementation and contact flow pending*
