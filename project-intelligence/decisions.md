# Decision Log

Architectural, design, and operational decisions that govern the project. One entry per decision. No rationale debates — only the decision and its reasoning, compressed.

---

## Schema

```
ID:         D-###
Date:       YYYY-MM-DD
Title:      Short descriptive title
Decision:   What was decided
Rationale:  Why — one to three sentences
Authority:  Who decided
Status:     APPROVED | DEPRECATED | REJECTED
```

---

## D-001 — Framework: Next.js App Router

**Date:** 2026-05-23  
**Decision:** Use Next.js App Router exclusively. Pages Router is not used.  
**Rationale:** App Router is the current Next.js standard. Server components, nested layouts, and streaming are native. Future-proof for the project's lifespan.  
**Authority:** Human Founder  
**Status:** APPROVED  

---

## D-002 — Styling: Tailwind CSS v4

**Date:** 2026-05-23  
**Decision:** Use Tailwind v4 with CSS-based config via `@import "tailwindcss"`. No `tailwind.config.js` file.  
**Rationale:** Project is greenfield. v4 is current. The zero-config approach eliminates a maintenance layer.  
**Authority:** Human Founder  
**Status:** APPROVED  

---

## D-003 — Component System: shadcn/ui

**Date:** 2026-05-23  
**Decision:** Use shadcn/ui v4.7 as the component foundation.  
**Rationale:** Full source ownership — no npm lock-in. Components are copied into the project and are fully editable. Accessible by default via Base UI primitives. Native Tailwind v4 support.  
**Authority:** Human Founder  
**Status:** APPROVED  

---

## D-004 — Layout: Reusable Container Component *(superseded)*

**Date:** 2026-05-23  
**Decision:** All page sections must wrap content in the shared `Container` component (`components/layout/container.tsx`).  
**Rationale:** Single source of layout truth. Prevents section misalignment across pages. `max-w-7xl` with responsive padding is the site-wide standard.  
**Authority:** Claude Code *(incorrect attribution — see D-010)*  
**Status:** DEPRECATED — superseded by D-010. Decision content is unchanged; authority re-attributed to Human Founder. History preserved per `context-rules.md`.  

---

## D-005 — AI Workflow: Multi-Agent Structure

**Date:** 2026-05-23  
**Decision:** Adopt a defined multi-agent AI workflow with separated concerns and a documented authority hierarchy.  
**Rationale:** AI output quality degrades without structure. Role separation prevents conflicting authority and ensures decisions are traceable.  
**Authority:** Human Founder  
**Status:** APPROVED  

---

## D-006 — Documentation: Project Intelligence as Source of Truth

**Date:** 2026-05-23  
**Decision:** `/project-intelligence/` files are the canonical source of project truth. Chat history is not.  
**Rationale:** Chat history is lossy, non-searchable, and ephemeral. Structured files are durable, agent-readable, and consistent across sessions.  
**Authority:** Human Founder  
**Status:** APPROVED  

---

## D-007 — Aesthetic: Forced Dark Mode

**Date:** 2026-05-23  
**Decision:** The site uses forced dark mode via Tailwind classes (`bg-neutral-950`), not the system `prefers-color-scheme` preference. No light/dark toggle at this stage.  
**Rationale:** The luxury/futuristic aesthetic is dark-first. A consistent forced dark experience is intentional, not a limitation.  
**Authority:** Human Founder  
**Status:** APPROVED  

---

## D-008 — Governance: Handoff Protocol Adopted

**Date:** 2026-05-23  
**Decision:** All ChatGPT → Claude Code briefs must follow the structure defined in `handoff-protocol.md`. Briefs missing Mandatory fields are rejected before implementation begins.  
**Rationale:** Unstructured prompts produce context drift and ambiguous scope. A mandatory brief format locks intent at transmission and prevents post-implementation interpretation conflicts.  
**Authority:** Human Founder  
**Status:** APPROVED  

---

## D-009 — Governance: Component Documentation Schema Adopted

**Date:** 2026-05-23  
**Decision:** All components must be documented using the schema defined in `components/_component-template.md`. A component without a documentation file is not considered complete.  
**Rationale:** Component documentation captures purpose, UX intent, and design rationale — not just technical spec. This ensures future agents understand why a component exists, not only what it does.  
**Authority:** Human Founder  
**Status:** APPROVED

---

## D-010 — Layout: Reusable Container Component (Corrected)

**Date:** 2026-05-23  
**Decision:** All page sections must wrap content in the shared `Container` component (`components/layout/container.tsx`). `max-w-7xl` with responsive padding is the site-wide layout standard.  
**Rationale:** Supersedes D-004. Decision content is unchanged. Authority re-attributed: architectural decisions require Human Founder or ChatGPT authority — Claude Code cannot self-authorise. See `ai-roles.md` Rule 5.  
**Authority:** Human Founder  
**Status:** APPROVED

---

## D-011 — Typography: Geist Font Loading Pattern

**Date:** 2026-05-23  
**Decision:** Geist font CSS variables (`--font-geist-sans`, `--font-geist-mono`) are applied to the `<html>` element via Next.js `font.variable` className in `app/layout.tsx`. Applied to `<html>`, not `<body>`.  
**Rationale:** `globals.css` sets `font-family` on the `html` element via `@layer base { html { @apply font-sans } }`. CSS custom properties cascade downward only — variables must be defined on the consuming element or an ancestor. `html` has no document ancestors; therefore font variables must be on `<html>` itself. Applying to `<body>` leaves `html`'s `font-family` unresolvable.  
**Authority:** Claude Code  
**Status:** APPROVED  

---

## D-012 — Positioning: C2B as a Premium Modern Web Agency

**Date:** 2026-05-25  
**Decision:** C2B Web Design is positioned as a premium modern web agency — not a traditional brochure-site designer. The service model covers four areas: Premium Website Design, Website Transformation, Intelligent Enquiry Systems, and Ongoing Growth & Improvement.  
**Rationale:** Technology has expanded what a website can do. Limiting the pitch to visual design undersells the value C2B can deliver. Client-facing language must always describe business outcomes (stronger perception, faster response, reduced admin, better-qualified enquiries, fewer missed opportunities) — never implementation details, tools, or technical frameworks.  
**Authority:** Human Founder  
**Status:** APPROVED  
