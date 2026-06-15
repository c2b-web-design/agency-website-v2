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
- Stage 2: First guided enquiry question (revealed after Begin is pressed). — **Approved, see D-016.**
- Stage 3: Second guided enquiry question.
- Stage 4: Full remaining enquiry panel.
- Stage 5: Submit dissolve and completion state.

---

## D-016 — Enquiry Experience: Stage 2 — Q5 Guided Question

**Date:** 2026-05-26  
**Decision:** After the user presses Begin, the `/start` experience transitions into the first active enquiry step. This is visually presented as Q5, the fifth question in a five-question countdown sequence. Q4 is not shown yet; the user will understand the countdown structure when Q4 appears in a later stage.  
**Rationale:** The enquiry should not behave like a standard form or mechanical stepper. Each stage should feel like a calm guided process where interaction flows into the next. Presenting the first built question as Q5 orientates the user in the sequence without front-loading the full structure. The Begin button's exit, the context settling, and the question entry should form one unbroken legato phrase — not a form appearing.  
**Authority:** Human Founder  
**Status:** APPROVED — Stage 2 Q5 is a working creative/interaction milestone.

---

**Transition from Stage 1 to Stage 2 (approved):**
- Begin button fades over ~400ms then unmounts.
- Opening heading and subtext remain visible as quiet contextual memory — they do not disappear.
- The opening context dims (opacity 0.38, scale 0.93) and moves smoothly to its contextual position over ~1600–1800ms linear. No snap, no layout reflow jump.
- The content wrapper moves via CSS `translateY` transition — not layout property changes — so no instant repositioning occurs when content height changes.
- Q5 question text reveals left-to-right, linear, from mount.
- Cards enter sequentially top-to-bottom with staggered delays (800ms base + 150ms per card).

**Q5 question (approved):**  
"What brought you here today?"

**Q5 options (approved, multi-select):**
- I need a premium website
- My current site feels dated
- I want better enquiries
- I want to reduce admin
- I'm not sure yet

Multi-select is intentional — more than one answer may be true. The user is not forced to pick one.

**Q5 orientation cue:**
- A small, muted "Q5" label appears above the question text.
- It is atmospheric and secondary — it orients without dominating.
- It drifts into presence via opacity + subtle scale (no directional movement).
- `aria-hidden="true"` — not announced to screen readers.
- Its meaning as a countdown cue will become clear when Q4 appears in a later stage.

**Next step trigger:**
- "Next step" appears only after at least one Q5 option is selected.
- It appears calmly (upward drift + opacity, 1200ms linear).
- It is a ghost-pill button — visually secondary to the Begin button, reads as continuation not initiation.
- It does not auto-progress. The user can select further answers before confirming.
- This preserves user control and avoids any sense of pressure or countdown.

**Card interaction (approved):**
- Cards use a dark smoked/frosted glass aesthetic: top-to-bottom gradient, inset top-edge hairline simulating ambient light on glass.
- Hover: gradient brightens, hairline strengthens.
- Selected: top-edge hairline shifts white → amber, gradient warms to gold, faint outer halo. No ticks, checkboxes, radio circles, or coloured circles.
- Selection is expressed through material activation — the glass warms and clarifies. Colour supports the feel but is not the sole indicator (border + glow + colour together).

**Motion principles:**
- The active question owns attention at all times.
- Contextual/background elements (opening heading, Q5 cue) are slow, bounded, atmospheric, and supportive.
- Motion must never create urgency or feel like a countdown timer.
- Mechanical, incremental transitions are prohibited — they feel like admin.

**Accessibility:**
- Multi-select cards: `role="checkbox"`, `aria-checked`, `role="group"` + `aria-labelledby` on the group.
- Next step button: in normal tab order, keyboard accessible, `focus-visible` ring.
- `prefers-reduced-motion: reduce`: Q5 cue, card reveals, and Next step all appear immediately with no staged animation. Card selection transitions are instant. Opening context dims and repositions instantly.
- All text is real DOM text.

**Future work:**
- Q5 → Q4 transition model approved — see D-017.
- Do not implement Q4 until a full implementation brief is issued.

---

## D-017 — Enquiry Experience: Q5 → Q4 Transition Model

**Date:** 2026-05-31  
**Decision:** When the user confirms Q5 via "Next step", Q5 does not disappear or behave like a completed form step. The selected Q5 answers compress into a compact muted memory summary positioned above the Q4 question. Q4 becomes the sole active interactive stage. No progress bar, checklist, percentage, or mechanical stepper is introduced at any point in the enquiry experience.  
**Rationale:** Answered questions must not vanish (erasure creates doubt about what was retained) nor remain at full prominence (dominating attention steals it from the active question). A quiet memory surface — present but subordinate — communicates retention without pressure, judgement, or countdown feel. This preserves the calm, guided character established in D-015 and D-016.  
**Authority:** Human Founder  
**Status:** APPROVED — transition model defined. Q4 implementation pending a separate brief.

---

**Layered attention model:**

| Layer | Element | Visual state |
|---|---|---|
| Faintest | Opening context (heading + subtext) | Dimmed per D-016 — persists unchanged |
| Memory | Q5 cue + memory summary | Further subdued — muted, non-interactive |
| Active | Q4 cue + question + cards | Full prominence — the only interactive stage |

**Q5 memory surface:**  
The selected Q5 answers compress into a small muted text summary directly above the Q4 block. It communicates that the system retained the user's answer without pressure, judgement, or countdown feel. The Q5 cue label remains visible above the summary at reduced opacity. Format (comma-separated selections or compact prose summary) is an implementation detail — to be resolved at brief time.

**Q4 question (approved):**  
"What would you most like your website to improve?"

**Q4 options (approved):**
- How people see the business
- The quality of enquiries
- Speed of response
- Trust before a conversation
- Clarity around what we offer
- I'm still working that out

Select behaviour (single-select or multi-select) is unresolved — to be determined at implementation brief.

**Motion (legato):**
- Q5 active cards and "Next step" de-emphasise via opacity/scale/position changes, not abrupt removal.
- Q5 selections condense into the memory summary with a calm dissolve.
- Q4 begins entering slightly before Q5 de-emphasis fully resolves — overlapping phrase, not a sequential handoff.
- Q4 cue ("Q4") drifts in using the same presence animation as the Q5 cue.
- Q4 question text reveals left-to-right via `enquiry-mask-reveal-horizontal` (matching Q5).
- Q4 options enter top-to-bottom with staggered delays (matching Q5 card pattern).
- `prefers-reduced-motion: reduce`: Q5 memory summary and Q4 appear immediately; no staged reveals.

**Constraints:**
- No full progress bar, checklist, percentage indicator, or mechanical stepper at any stage.
- Q4/Q5 labels are atmospheric orientation cues only — not a numbered form header.
- The active question always owns attention. Background layers are present but subordinate.
- Motion must never create urgency or feel like a countdown timer.

**Open at time of logging (resolve at implementation brief):**
- Q4 select behaviour: single-select or multi-select?
- Q5 memory format: comma-separated label text or condensed prose summary?
- Exact duration/timing of Q5 de-emphasis relative to Q4 entry overlap.

---

## D-018 — Enquiry Experience: Q5 → Q4 Implementation Choices

**Date:** 2026-06-01  
**Decision:** Q4 is single-select (`role="radiogroup"` / `role="radio"`). Q5 memory uses a compact label summary format: "You mentioned: [comma-separated short labels]". Q5 → Q4 timing uses a calm overlap: Q5 begins settling at click, stage switches at 500ms so Q4 enters before Q5 fully de-emphasises.  
**Rationale:** Resolves the three open items from D-017. Single-select reflects Q4 as a prioritisation question. Short labels keep the memory surface muted and non-judgemental. 500ms overlap produces the legato phrase handoff specified in D-017 without introducing a new motion model.  
**Authority:** ChatGPT / PM, based on Human Founder direction  
**Status:** APPROVED — memory format superseded by D-019.

---

## D-019 — Enquiry Experience: Q5 Memory Field Correction

**Date:** 2026-06-01  
**Decision:** (1) Q5 memory renders as a bounded quiet memory field — Q5 cue label, Q5 question text at low opacity, and selected answer card echoes as non-interactive muted fragments. Replaces the "You mentioned: [compact labels]" summary text from D-018. (2) Q4 reduced to five options (symmetry with Q5): "Speed of response" removed. (3) Opening context recedes further in Stage 3 via `.enquiry-context-faintest` (opacity 0.10, scale 0.91) so the visual hierarchy is: opening context = faintest; Q5 memory = subdued; Q4 = active foreground.  
**Rationale:** The compact text summary erased the visual presence of the user's selected answers. A quiet memory field communicates retention without pressure — the user can glance at what they answered without it competing with Q4. Five options for Q4 matches Q5 and avoids an asymmetric list length. Receding the opening context further in Stage 3 enforces the correct three-layer hierarchy once Q4 is active.  
**Authority:** Human Founder (direct correction)  
**Status:** APPROVED — handoff motion superseded by D-020.

---

## D-020 — Enquiry Experience: Q5 → Q4 Handoff Motion Correction

**Date:** 2026-06-01  
**Decision:** Replace wrapper-level settling dim (D-018/D-019) with per-element CSS transitions that morph Q5 toward its memory visual state in place, while the Q5 block spatially recedes (`translateY(-24px) scale(0.95)` over 1100ms). Stage switch delayed to 1200ms so settling is fully complete at the swap point. Stage 3 memory field mounts at the same final transform (static `.enquiry-q5-memory-block-settled`) with no fade-in — making the swap invisible. All five `Q1_OPTIONS` rendered in the memory field; unselected as `invisible` layout placeholders to prevent reflow. Q4 enters after Q5 has fully settled. Reduced-motion users see settled memory + Q4 immediately with no transforms.  
**Rationale:** The previous transition felt like a cut/replacement — Q5 dimmed as a unit then was replaced by a new block. The intended behaviour is Q5 visibly becoming the memory layer. Per-element morphing preserves visual continuity of the selected answers; spatial receding communicates that the layer has settled back. Seamless swap requires the outgoing settling end state and incoming memory start state to be identical in both opacity/colour and transform.  
**Authority:** Human Founder (direct correction)  
**Status:** APPROVED — choreography superseded by D-021.

---

## D-021 — Enquiry Experience: Four-Point Choreography Correction

**Date:** 2026-06-01  
**Decision:** Four targeted corrections to the Q5 → Q4 choreography: (1) Scroll Q5 Next step into view when it appears — `scrollIntoView({ behavior: 'smooth'/'auto', block: 'nearest' })`, respecting `prefers-reduced-motion`. (2) Add `transform-origin: top center` to `.enquiry-q5-settling-block` and `.enquiry-q5-memory-block-settled` — anchors the scale transform to the top edge, eliminating a 5px visual jump at the DOM swap caused by height-dependent transform-origin mismatch. (3) Remove invisible placeholder slots from the Q5 memory field — render only selected answers via `q5Selections.map()`, making the memory field compact and proportional to the user's selections. (4) Q4 framing resolved structurally by (1) and (3): compact memory places Q4 higher, and the prior scroll positions the viewport appropriately.  
**Rationale:** D-020's memory field used invisible placeholders to prevent layout reflow at the DOM swap, but this produced a tall, empty-feeling memory block that pushed Q4 too far down. The transform-origin root cause: `scale(0.95)` with default `50% 50%` origin shifts the top edge by `height × 0.025`, so a shorter memory block starts 5px higher than the settling block ended — a visible jump. Top-center origin anchors the top edge regardless of block height, making the swap seamless with compact content.  
**Authority:** Human Founder (direct correction)  
**Status:** APPROVED — choreography superseded by D-022

---

## D-022 — Enquiry Experience: Persistent Q5 Element + Compact Memory Rail

**Date:** 2026-06-01  
**Decision:** Three corrections to eliminate the remaining snap and establish the receding memory rail model. (1) Persistent Q5 DOM element: replaced `q5Settling: boolean` with `q5Phase: "active" | "settling" | "memory"`. Q5 block mounts when stage leaves "opening" and stays in the DOM through Stage 3 — no unmount/remount. Class changes drive visual state; no new DOM node is inserted at the 1200ms swap point, eliminating the repaint that caused the snap. (2) Compact memory rail — generic chip echoes: completed Q5 answers render as pill chips (`.enquiry-memory-chip`) in a flex-wrap row (`.enquiry-memory-chips`), not full-height card divs. Classes are generic (`enquiry-memory-*`) and designed for reuse as Q4, Q3, Q2, and Q1 complete in future stages. Opening context recedes further (`.enquiry-context-faintest`) when Q5 becomes memory — chain reaction is perceptible via the existing `opacity 0.38 → 0.10` transition. (3) Q4 framing via layout + gentle fallback: compact chips make Q4 naturally visible on 768px+ viewports without scroll. `scrollIntoView({ block: 'nearest' })` is a no-op safety net that fires on Q4 mount and Q4 Next step appearance, preserving the memory rail in view. `.enquiry-q5-settling-question` now also transitions `font-size` (0.875rem over 900ms) so no size jump occurs at the 1200ms class switch.  
**Rationale:** D-021's DOM swap approach could not eliminate the repaint event that caused the snap, regardless of CSS value matching. Persistent element removes the event source. Chip echoes compress the memory rail enough for Q4 to fit naturally, making scroll an exception rather than the primary layout model. The memory rail model establishes a design pattern: each completed stage compresses into a compact depth slot above the active question, remaining visibly present without consuming the active stage's space.  
**Authority:** Human Founder  
**Status:** APPROVED

---

## D-023 - Enquiry Experience: Shared Memory Corridor Architecture

**Date:** 2026-06-08  
**Decision:** The enquiry flow is treated as one ordered visual system, not a sequence of isolated screens. The opening heading and five enquiry questions form a single corridor:

Opening heading -> Q5 -> Q4 -> Q3 -> Q2 -> Q1

Each completed item recedes one shared depth slot deeper into the corridor. Depth is proportional and cumulative: after Q5 completes, the opening heading is at depth 2, Q5 memory at depth 1, Q4 active. After Q4 completes, the opening heading is at depth 3, Q5 memory at depth 2, Q4 memory at depth 1, Q3 active. Depth values are driven by shared global CSS variables, not per-question ad hoc transforms.  
**Rationale:** D-018 through D-022 resolved specific snap and choreography defects but left the transition model as one-off per-question choreography. The result is that each question has its own settling mechanism, making the corridor effect accidental rather than architectural. D-023 establishes the corridor as a deliberate system: one depth model, one set of CSS variables, one memory capsule format - so Q3, Q2, and Q1 inherit the pattern without new choreography decisions. The visual effect the user experiences is that their conversation is building a coherent, visible history, not disappearing into a form.  
**Authority:** Human Founder  
**Status:** APPROVED - implementation brief required before code changes begin.

---

**Corridor depth model (approved):**

Each completed item occupies one depth slot. The active question is always at depth 0 (full prominence). Completed items count upward from 1.

| Stage | Opening heading | Q5 | Q4 | Q3 | Q2 | Q1 |
|---|---|---|---|---|---|---|
| After Begin | depth 1 | active | - | - | - | - |
| After Q5 | depth 2 | depth 1 | active | - | - | - |
| After Q4 | depth 3 | depth 2 | depth 1 | active | - | - |
| After Q3 | depth 4 | depth 3 | depth 2 | depth 1 | active | - |
| After Q2 | depth 5 | depth 4 | depth 3 | depth 2 | depth 1 | active |

Depth values are applied via CSS data attributes or class variants (e.g. `data-depth="1"`, `data-depth="2"`) that resolve to shared CSS custom properties (`--corridor-scale-1`, `--corridor-opacity-1`, etc.). Corridor properties are defined once and cascade to all depth slots automatically.

**Visual rules (approved):**

- Completed items remain broadly face-on. Do not use `rotateX`, floor-tilted cards, or perspective-based 3D transforms.
- Depth is communicated through vertical position offset, scale, opacity, and quieter material treatment - not rotation.
- Blur is excluded from the first implementation. If corridor CSS variables are defined, blur defaults to 0px. Blur may be revisited after corridor spacing, scale, and opacity are reviewed.
- Corridor angle and spacing are controlled globally - by CSS variables - not by per-question adjustments.
- Corridor geometry must be calibrated from the eventual Q1 composition backwards, so the opening heading and completed Q5/Q4/Q3/Q2 memory items can remain visually present within the viewport when Q1 is active.
- Older items may become faint translucent traces at greater depth, but must remain visibly present enough to communicate that the user's answers have been absorbed into a guided process. Memory items are not required to remain fully legible at older depths - their purpose is to show continuity, not to provide readable review content.
- Items at high depth (3+) may approach near-invisible opacity floors. The floor value is a design decision to be resolved during review, not specified here.

**Opening memory item (approved):**

The opening context (heading + subtext + Begin button) behaves as follows after Begin is pressed:
- Supporting subtext ("A few focused questions...") and the Begin button fade out permanently. They do not become memory items.
- Only the main opening heading ("Let's understand what your business needs to become.") is retained as the first memory item at depth 1.
- The heading does not compress into chip format - it has no selected answers. It renders as the full heading text, compressed/scaled/faded as a memory item, with centred layout at the scale and opacity of its depth slot. Do not replace it with the agency name or a shortened label.

**Active question behaviour (approved):**

- Active question renders at full prominence: full question text, full answer cards.
- Cards remain fully interactive while the question is active.
- Space for the Next Step button is reserved in layout from mount - the button appearing must not cause a layout shift. The current approach (`opacity: 0; pointer-events: none` until a selection is made) satisfies this requirement and should be retained.

**Completed memory item format (approved):**

Each completed question compresses into a compact memory capsule. The capsule format is consistent across all completed questions:

- No full card stack.
- Question text centred.
- Selected answers centred beneath as inline chips.
- Chips expand evenly left and right from centre - centred flex-wrap row. This supersedes D-022 left-aligned chips for Q5 and establishes centring as the pattern for all future questions.
- Maximum two visual lines of chips where possible. 1 to 5 selected answers should remain side-by-side on desktop where space allows.
- Capsule inherits subtle material/glass continuity from answer cards but appears significantly quieter - reduced opacity, reduced border weight, no interactive states.
- The generic `.enquiry-memory-*` classes established in D-022 provide the foundation. Chip centring is achieved by adding `justify-content: center` to `.enquiry-memory-chips`.

**Scope of first implementation (approved):**

The first implementation proves the reusable corridor architecture across three slots only:

Opening heading (depth 2) -> Q5 memory (depth 1) -> Q4 active

Q3, Q2, and Q1 are not implemented until the three-slot corridor model is reviewed and approved as a stable pattern. No post-Q1 destination (submit, confirmation, routing) is approved yet.

The implementation task is:
1. Define shared corridor CSS variables (`--corridor-scale-N`, `--corridor-opacity-N`, `--corridor-offset-y-N`) for depth 1 through 5.
2. Apply depth-1 variables to the Q5 memory capsule (currently driven by `.enquiry-q5-memory-block-settled`).
3. Apply depth-2 variables to the opening heading memory item when the corridor reaches Q4 active.
4. Apply chip centring to `.enquiry-memory-chips`.
5. Validate visually that depth 1 and depth 2 slots feel proportionally receded and that Q4 active owns attention.
6. Confirm no regressions against D-022 approved behaviour.

**Relationship to D-022 (approved):**

D-022 remains the committed, deployed, approved baseline. D-023 does not patch or revert D-022. D-023 is an architectural evolution that replaces the direction of one-off per-question choreography with a shared corridor model. The first implementation of D-023 should produce a revised state of `enquiry-opening.tsx` and `globals.css` that is complete and clean, not an incremental patch on top of D-022's one-off classes.

**Constraints:**
- No post-Q4 questions until corridor model is reviewed and approved.
- No post-Q1 destination designed or implemented.
- No mechanical stepper, progress bar, percentage indicator, or checklist at any stage.
- Depth values must come from shared CSS variables - not hard-coded per question.
- Motion must never create urgency or feel like a countdown timer.

**Open at time of logging (resolve before implementation brief):**
- Exact numeric values for corridor CSS variables (scale, opacity, offset-y per depth slot) - design decision, not locked here. Calibrate from the Q1-active composition backwards.
- Blur: excluded from first implementation. Revisit after corridor geometry is reviewed.

---

## D-024 — Enquiry Experience: Full Q5→Q1 Corridor + Completion State

**Date:** 2026-06-14  
**Decision:** The full corridor from Q5 through Q1 is built and approved, including completion state. All five questions follow the shared corridor architecture established in D-023. The Send button is positioned at the completion stage. Begin / Next step / Send button visibility is consistent across all stages.  
**Rationale:** Milestone commit 2152e6e closes the structural and mechanical phase of the enquiry flow. The corridor model proved stable across all five questions without per-question choreography decisions. Completion state ("Understood" handoff) is approved as the close of the guided process.  
**Authority:** Human Founder  
**Status:** APPROVED — commit 2152e6e. No further structural changes without a new brief.

---

**Approved state at milestone (2026-06-14):**
- Opening heading → Q5 → Q4 → Q3 → Q2 → Q1 corridor: complete and approved.
- Q labels match question text size at all corridor depths.
- Completion state ("Understood" handoff): approved.
- Send button position: approved.
- Begin / Next step / Send visibility: consistent and approved.
- Mobile opening reveal and corridor refinements: complete and approved.

**Future colour/material pass (not yet designed — future direction only):**
- Active question: white/off-white (unchanged).
- Memory question text: may use one teal/duck-egg family colour.
- Q labels: may use muted gold/amber.
- Depth expressed through lightness/opacity — not multiple competing hues.
- Answer selected state: move away from current brown/amber fill toward restrained glass/smoked material.
- This pass requires a new brief. Do not implement without one.

---

## D-025 — Visual Direction: Brand Colour Direction

**Date:** 2026-06-14  
**Decision:** The site's emerging brand colour direction is: near-black base, gold/amber as premium accent light, teal/duck-egg/deep blue as modern intelligence accent. These are directional only — not yet applied to the homepage or any live surface. Application requires a design pass with a new brief.  
**Rationale:** Colour direction was resolved informally across the enquiry experience iterations and is recorded here as a shared reference so future agents do not treat the current neutral-only palette as the permanent final state.  
**Authority:** Human Founder  
**Status:** APPROVED as direction. Not yet implemented on homepage. Do not apply without a brief.

---

## D-026 — Hero: Future Cinematic Direction

**Date:** 2026-06-14  
**Decision:** The current hero is a structural scaffold only. The right-side visual space is intentionally empty. The planned future hero is a cinematic dark studio world featuring the C2B logo as the central object. The logo begins in a video/film world and transitions seamlessly into a code-driven interactive object. Text and button elements may later catch subtle reflected gold/teal light only after the code-world logo becomes active.  
**Rationale:** The hero as-built holds the layout and tone. The cinematic direction is a future creative milestone requiring its own brief and production assets. Recording it now prevents future agents from treating the current scaffold as the final design or filling the empty space prematurely.  
**Authority:** Human Founder  
**Status:** APPROVED as direction. Not yet designed or implemented.

**Constraints (approved):**
- Avoid sci-fi, fantasy, landscape, and over-flashy motion.
- Rule: "more David Gilmour, less Yngwie Malmsteen."
- Text/button do not catch colour effects until the code-world logo object is active.

---

## D-027 — Future Tools Direction

**Date:** 2026-06-14  
**Decision:** Three future intelligence tools are directionally planned: (1) client discovery/intelligence tool, (2) website/brand opportunity report tool, (3) internal transformation preview tool (before any public version). These are recorded as directional intent only — no scope, brief, or implementation timeline exists yet.  
**Rationale:** Avoids scope creep into the current build while recording the founder's intent so future agents understand what the service offer may extend to.  
**Authority:** Human Founder  
**Status:** DIRECTION ONLY — not approved for design or implementation.

---

## D-028 — Enquiry Experience: Answer Card Material — Frosted Blue Glass

**Date:** 2026-06-15  
**Decision:** The enquiry answer cards (Q5–Q1) use a frosted blue glass material for idle, hover, and selected states. Five deterministic glass variants (A–E) rotate across Q5 to Q1 to avoid repeated or tiled gradient directions. The selected state retains the amber top-edge hairline and warm halo from D-016 — selection is still expressed through material activation, not colour alone.  
**Rationale:** The amber/gold smoked glass treatment from D-016 was functional but directionally neutral. The frosted blue glass aligns with the brand colour direction (D-025: near-black base, teal/blue as modern intelligence accent) and gives the cards a more distinctive, premium material identity. Five variants ensure no card shares a gradient direction with its neighbour.  
**Authority:** Human Founder  
**Status:** APPROVED — commit 3621997.

---

**Future material work — amber circuit (paused):**
- An amber travelling bead / perimeter circuit animation on the selected card was prototyped but became unstable and was removed before commit.
- This experiment is paused. When resumed, it should begin as a small isolated prototype on one card only — not a full-system implementation. Requires a new brief.
- Do not restart amber circuit work without a dedicated brief.
