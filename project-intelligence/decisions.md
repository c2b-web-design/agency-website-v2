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
Status:     Active | Superseded | Reversed
```

---

## D-001 — Framework: Next.js App Router

**Date:** 2026-05-23  
**Decision:** Use Next.js App Router exclusively. Pages Router is not used.  
**Rationale:** App Router is the current Next.js standard. Server components, nested layouts, and streaming are native. Future-proof for the project's lifespan.  
**Authority:** Human Founder  
**Status:** Active  

---

## D-002 — Styling: Tailwind CSS v4

**Date:** 2026-05-23  
**Decision:** Use Tailwind v4 with CSS-based config via `@import "tailwindcss"`. No `tailwind.config.js` file.  
**Rationale:** Project is greenfield. v4 is current. The zero-config approach eliminates a maintenance layer.  
**Authority:** Human Founder  
**Status:** Active  

---

## D-003 — Component System: shadcn/ui

**Date:** 2026-05-23  
**Decision:** Use shadcn/ui v4.7 as the component foundation.  
**Rationale:** Full source ownership — no npm lock-in. Components are copied into the project and are fully editable. Accessible by default via Base UI primitives. Native Tailwind v4 support.  
**Authority:** Human Founder  
**Status:** Active  

---

## D-004 — Layout: Reusable Container Component

**Date:** 2026-05-23  
**Decision:** All page sections must wrap content in the shared `Container` component (`components/layout/container.tsx`).  
**Rationale:** Single source of layout truth. Prevents section misalignment across pages. `max-w-7xl` with responsive padding is the site-wide standard.  
**Authority:** Claude Code  
**Status:** Active  

---

## D-005 — AI Workflow: Multi-Agent Structure

**Date:** 2026-05-23  
**Decision:** Adopt a defined multi-agent AI workflow with separated concerns and a documented authority hierarchy.  
**Rationale:** AI output quality degrades without structure. Role separation prevents conflicting authority and ensures decisions are traceable.  
**Authority:** Human Founder  
**Status:** Active  

---

## D-006 — Documentation: Project Intelligence as Source of Truth

**Date:** 2026-05-23  
**Decision:** `/project-intelligence/` files are the canonical source of project truth. Chat history is not.  
**Rationale:** Chat history is lossy, non-searchable, and ephemeral. Structured files are durable, agent-readable, and consistent across sessions.  
**Authority:** Human Founder  
**Status:** Active  

---

## D-007 — Aesthetic: Forced Dark Mode

**Date:** 2026-05-23  
**Decision:** The site uses forced dark mode via Tailwind classes (`bg-neutral-950`), not the system `prefers-color-scheme` preference. No light/dark toggle at this stage.  
**Rationale:** The luxury/futuristic aesthetic is dark-first. A consistent forced dark experience is intentional, not a limitation.  
**Authority:** Human Founder  
**Status:** Active  
