# Current Sprint

---

## Sprint Goal

Establish the foundational technical and operational infrastructure for the C2B Web Design agency site. Ship a clean homepage skeleton, install the project intelligence layer, and define the AI governance and workflow system.

## Sprint Period

2026-05-23 → TBD

---

## Completed

| Task | Output | Notes |
|---|---|---|
| Reusable `Container` component | `components/layout/container.tsx` | Max-width wrapper used on every section |
| Homepage skeleton | `app/page.tsx` | Navbar, Hero, Services, Work, Footer — forced dark |
| shadcn/ui installed | `lib/utils.ts`, `components.json`, `globals.css` updated | v4.7.0, base-nova style, neutral base colour |
| Project intelligence structure | `/project-intelligence/` | All foundational files created |
| AI governance layer — Phase 1 | `ai-roles.md`, `context-rules.md` refined | Veto structure, status system, conflict resolution, file integrity rules added |
| AI governance layer — Phase 2 | `prompt-protocol.md` created | Prompt lifecycle, standard prompt structure, escalation rules, QA routing, documentation update triggers |

---

## In Progress

*Nothing currently active.*

---

## Up Next

| Task | Priority | Notes |
|---|---|---|
| Fix font application in `layout.tsx` | High | Geist fonts declared but not applied to `<body>` — see R-001 |
| Fix `--font-sans` circular reference in `globals.css` | High | Self-references itself — fonts not rendering correctly |
| Services section — real content and layout | Medium | Awaiting content brief from ChatGPT / Human Founder |
| Work/portfolio section — grid layout | Medium | Awaiting case study content |
| Mobile navbar (responsive collapse) | Medium | Current nav overflows on small screens — see R-001 |
| Replace `<a>` tags with Next.js `<Link>` | Low | Performance optimisation |
| Component documentation: `Container` | Low | `/project-intelligence/components/container.md` |

---

## Open Questions

- Deployment target? (Vercel, other)
- Services offered — what are the three to five core agency services?
- Portfolio case studies — any existing work to reference?
- Agency tagline / positioning statement?
- Will a contact form be required, or contact via email only?

---

## Blockers

*None.*

---

*Last updated: 2026-05-23 — governance layer complete*
