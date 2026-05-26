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
**Implementation note:** Services section visual implementation approved and committed. Final card paragraph reading width: `max-w-sm` (384px). Section is complete.  

---

## D-013 — Content: Work Section as Strategic Proof Piece

**Date:** 2026-05-25  
**Decision:** Until client case studies exist, the Work section positions the C2B website itself as the first demonstration of the agency's design standard, business thinking, and modern capability. It does not show client work or imply portfolio depth that doesn't exist.  
**Rationale:** Faking portfolio depth before client work exists would undermine the premium, honest positioning. The agency's own website — its positioning, design, enquiry thinking, and ongoing refinement — is the most credible proof available at this stage. Language stays honest, confident, and outcome-focused; no overclaiming.  
**Authority:** Human Founder  
**Status:** APPROVED  
**Notes:** When client case studies are ready, evolve this section into a conventional portfolio. Until then the proof-piece framing is the honest, premium alternative.  

---

## D-014 — Conversion: Homepage Final CTA Section

**Date:** 2026-05-25  
**Decision:** The homepage closes with a calm, premium invitation to start a conversation. The CTA is positioned as discovery — understanding what the business needs — not a hard sell.  
**Rationale:** Visitors at the bottom of the page have already processed the offer and credibility. The closing CTA must match the premium tone: consultative, human, and confident. A complex form at this stage would introduce friction before trust is established.  
**Authority:** Human Founder  
**Status:** APPROVED  
**Notes:** The current CTA uses a placeholder `href="#"`. Connect to a real contact flow when the enquiry system is built. The intelligent enquiry system (D-012) can grow directly from this section when ready.

---

## D-015 — Enquiry Experience: Stage 1 Opening Direction

**Date:** 2026-05-25  
**Last refined:** 2026-05-26  
**Decision:** The `/start` route does not open with a contact form. It opens with a dark premium background, a legato mask-based reveal sequence, and a Begin button that emerges from the close of the supporting text. No form fields are shown until the user actively presses Begin.  
**Rationale:** Dropping a user into an admin-style form immediately after the homepage destroys the premium, considered positioning the site establishes. The opening sequence guides attention through deliberate motion, then converts it into intention through the Begin button. The user should feel they are entering a considered process, not filling out a ticket. Motion is not decorative — it is part of the conversion architecture. Elements exist in layout from first render and are revealed by clip-path masks on a timed sequence; no layout jumps, no conditional rendering of content blocks.  
**Authority:** Human Founder  
**Status:** APPROVED — Stage 1 creative milestone complete. Minor microtiming adjustments may occur during a later mastering phase.

---

**Design principles:**
- Premium, dark, cinematic, restrained.
- Layout populated at first render; masks reveal content at scheduled times.
- No chatbot feeling. No white admin-style form surface.
- Motion style: legato — phrasing, space, and intention over speed or spectacle. "Gilmour, not Malmsteen." Also avoid "Oppenheimer" energy: no grandiose theatrical motion, no dramatic overstatement.
- Each element enters slightly before the previous fully resolves — pulled forward like a musical phrase, not sequenced with gaps.
- `prefers-reduced-motion: reduce` must show all content immediately with no staged reveal.
- Text must remain real readable text. Begin button must be keyboard-accessible with visible focus styling once visually available.

**Motion language (approved):**
- All reveals use CSS `clip-path: inset()` masks. No JS animation libraries.
- Heading and subtext use a left-to-right horizontal reveal (`inset(0 100% 0 0)` → `inset(0 0 0 0)`).
- Button uses a top-to-bottom reveal (`inset(0 0 100% 0)` → `inset(0 0 0 0)`), reinforcing subtle downward guidance into the process.
- Heading easing: `linear` — deliberate, readable pace. Earlier easeOutExpo front-loaded the sweep and made text feel flashed; linear gives a constant sweep the eye can follow.
- Subtext easing: `linear` — same steady reading pace, like following subtitles as a narrator speaks.
- Button easing: `linear` — consistent with the phrase feel.
- Handoffs between elements overlap slightly so the sequence flows as one connected phrase, not a series of discrete events.
- The Begin button begins its reveal during the final words of the supporting text, so the invitation emerges from the meaning of the sentence rather than appearing after a gap.

**Key technical insight:**
Perceived motion depends on duration, delay, easing curve, reveal direction, and semantic timing — not duration alone. An easeOutExpo curve front-loads 80%+ of the sweep into the first third of its duration, making text feel flashed even at long durations. For text the user is meant to read, linear motion is more appropriate: the sweep pace matches the reading pace.

**Stage 1 behaviour (approved):**
1. User clicks "Start a conversation" on the homepage.
2. User lands on `/start`. Dark background is present immediately.
3. Heading line 1 ("Let's understand what your") reveals left-to-right, linear, from ~0.6s.
4. Heading line 2 ("business needs to become.") reveals left-to-right, linear, beginning just before line 1 finishes (~2.9s).
5. Supporting text ("A few focused questions to help us see the right next step.") reveals left-to-right, linear, beginning just before line 2 finishes (~5.1s).
6. Begin button reveals top-to-bottom, linear, beginning during the final words of the supporting text (~9.0s).
7. Full phrase settles at ~11.5s.

**Accessibility:**
- `prefers-reduced-motion: reduce` disables all staged reveals. All content is immediately visible.
- Begin button has `tabIndex=-1` and `pointer-events: none` until its animation completes; becomes keyboard-accessible at that point.
- All text is real DOM text — no canvas, SVG, or image-based rendering.

**Planned future stages:**
- Stage 2: First guided enquiry question (revealed after Begin is pressed).
- Stage 3: Second guided enquiry question.
- Stage 4: Full remaining enquiry panel.
- Stage 5: Submit dissolve and completion state.
