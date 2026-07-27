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
Status:     APPROVED | PROVISIONAL | DEPRECATED | REJECTED
```

**On `PROVISIONAL`** — added 25 July 2026, see **D-035**. Means *in place, deliberately
untuned, awaiting the mastering pass*. It is **not** "undecided", "unapproved" or
"drifted". Reviewers: absence of an approval entry for a provisional layer is **expected
and correct**, not a governance gap. Read D-035 before flagging one.

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

---

## D-029 — Enquiry Experience: Selected-Card Filament Border

**Date:** 2026-06-15  
**Decision:** Enquiry answer cards (Q5–Q1) use an animated filament border on selection. On select, a single SVG rect stroke draws around the full card perimeter (~2400ms linear). After drawing, the completed border remains visible while the card is selected. On deselect, the completed border fades out over 600ms. Colour matches the Q-label gold family (muted bronze-gold, `rgba(190, 145, 58, 0.80)`), with a four-layer warm filament glow. No multi-path SVG, no bead/head, no segmented paths, no conic mask, no viewBox, no rotation.  
**Rationale:** Replaces the previously approved static amber top-edge hairline selected state with a full-perimeter animated selected indicator. The draw animation confirms selection with intention and warmth without being mechanical or loud. The single-rect SVG with `pathLength="1"` avoids perimeter measurement and is geometrically correct at all card sizes. Colour alignment to Q-label gold ensures visual coherence across the corridor.  
**Authority:** Human Founder  
**Status:** APPROVED — 2026-06-15.

---

**Implementation pattern (approved):**
- One `<svg>` per card, always in DOM, `opacity: 0` at rest.
- One `<rect>` with `pathLength="1"`, `stroke-dasharray: 1`, `stroke-dashoffset: 0` (base = fully drawn).
- On select: `opacity: 1` instantly; animation runs `stroke-dashoffset: 1.04 → 0` (slight phase shift to include top-left corner arc from frame 1).
- On deselect: class removed; SVG fades via `opacity: 600ms linear`; rect returns to base fully-drawn state.
- CSS geometry on rect (`x`, `y`, `width`, `height`, `rx`, `ry`) — accepts `calc()`, no viewBox distortion.
- Glow: four `drop-shadow` layers in `rgba(190,145,58)` / `rgba(140,90,10)` family. No yellow, no near-white.
- `prefers-reduced-motion`: animation skipped; full border appears immediately; opacity fade on deselect retained.
- Text remains above SVG via `z-index: 4` on sibling content.

**Failed methods (do not revive):**
- Multi-path SVG with separate top/side segments — geometry gaps at corners, abandoned.
- Bead/head animation — prototype became unstable, abandoned.
- SVG stroke-dashoffset with guessed perimeter (e.g. 1000) — values were viewport-dependent, unreliable.
- Conic-gradient CSS mask reveal on a div border — mask animated but produced no visible movement, only opacity fade.
- Segmented clip-path reveal on SVG `<g>` groups — invisible result, reverted.

---

## D-030 — Enquiry Experience: Next Step Button — Approved Blue-Platinum Foundation

**Date:** 2026-06-16  
**Decision:** The shared `.enquiry-nextstep-btn` uses a smoked blue-steel colour foundation built up through five approved sequential passes toward a blue-platinum material read. The button reads as a shaped blue-platinum object — lit face, bevelled depth, perceptible rim, clear face-to-body separation. Quieter than Begin. Both buttons inherit through the shared class; no JSX changed.  
**Rationale:** Built in five approved layers: (1) colour — smoked blue-steel gradient; (2) material/depth — face radial + shadow stack; (3) rim/specular polish — rim precision; (4) blue-chrome face pass — two-layer specular + environmental fill; (5) face/body separation — top stop lifted, specular peak raised, gradient delta widened from ~15 to ~20 lightness points. Each layer isolated and reviewed before the next.  
**Authority:** Human Founder  
**Status:** APPROVED — a77c3bc → b1fff80 → cc27886 → (blue-chrome face) → 47f8124. Next: Sub-pass B rim recalibration and/or extrusion (future briefs).

---

**Approved CSS baseline (all five passes):**
```css
/* idle */
background:
  radial-gradient(
    ellipse 55% 22% at 50% 6%,
    rgba(200, 225, 255, 0.38) 0%,
    rgba(200, 225, 255, 0.08) 60%,
    transparent 100%
  ),
  radial-gradient(
    ellipse 90% 40% at 50% 15%,
    rgba(100, 155, 220, 0.12) 0%,
    transparent 100%
  ),
  linear-gradient(180deg, #365d86 0%, #1b3050 40%, #142540 100%);
box-shadow:
  inset 0  1px 0    rgba(205, 230, 255, 0.76),
  inset 0  2px 3px  rgba( 15,  50, 110, 0.30),
  inset 0 -2px 3px  rgba(  5,  15,  40, 0.50),
  inset 0 -1px 0    rgba( 80, 120, 180, 0.14),
        0  2px 8px  rgba(  0,   0,   0, 0.35);
color: #e8edf5;
transition: box-shadow 200ms linear;

/* hover */
background:
  radial-gradient(
    ellipse 55% 22% at 50% 6%,
    rgba(210, 230, 255, 0.44) 0%,
    rgba(210, 230, 255, 0.10) 60%,
    transparent 100%
  ),
  radial-gradient(
    ellipse 90% 40% at 50% 15%,
    rgba(110, 165, 230, 0.15) 0%,
    transparent 100%
  ),
  linear-gradient(180deg, #2f5378 0%, #172948 40%, #101f36 100%);
box-shadow:
  inset 0  1px 0    rgba(210, 235, 255, 0.84),
  inset 0  2px 3px  rgba( 15,  50, 110, 0.35),
  inset 0 -2px 3px  rgba(  5,  15,  40, 0.62),
  inset 0 -1px 0    rgba( 90, 130, 190, 0.18),
        0  3px 10px rgba(  0,   0,   0, 0.44);

/* disabled */
background: single-stop radial + smoked base gradient (pre-chrome); color: rgba(232,237,245,0.4); no box-shadow
```

**Layer rationale:**
- **Key specular** 55% × 22% ellipse, peak 0.38 → fades via 0.08 → transparent — tight directional catch from above; reads as polish, not atmospheric lift
- **Environmental fill** 90% × 40% wash at 0.12 — blue card environment reflected diffusely into the face; "platinum in a blue room"
- **Face gradient** `#365d86 → #1b3050 → #142540` — ~20-point lightness delta; top clearly lit, base falls away dark
- **Top rim** `rgba(205,230,255,0.76)` — precision edge catch; cool blue-white; quieter than Begin (1.00 warm white)
- **Sub-rim** cooled to `rgba(15,50,110,0.30)` — matches the platinum face tone
- **Lower bevel** `rgba(5,15,40,0.50)` — underside falls away; confirms thickness
- **Lower bounce** `rgba(80,120,180,0.14)` — faint metallic reflection on lower edge; almost imperceptible individually
- **Drop shadow** `rgba(0,0,0,0.35)` — lifts from dark page; no colour, no glow

**What is NOT included (reserved for future brief):**
- Full 3D extrusion / ledge logic
- Sub-pass B rim recalibration (assess after current face read settles)
- Full metallic chrome behaviour
- Any shape, spacing, timing, or JSX changes

---

## D-031 — Enquiry Experience: Next Step Button — Q5 Position-Aware Warm Environmental Reflection

**Date:** 2026-06-16
**Decision:** On Q5 only, the `.enquiry-nextstep-btn` treats selected answer cards as warm environmental light sources. The blue-platinum button catches a faint, directional amber reflection driven by which cards are selected — position-aware (left cap, right cap, upper/lower curved quadrants, faint upper-centre) and scaling in strength by card position and count. Geometry is identical between idle and hover; only reflected-light colour and intensity change.
**Lighting rule (load-bearing):** Hover must NOT introduce a new clean white light source. White remains present as a small platinum component; selected-card amber increasingly filters/tints it as more cards activate. Amber is the only channel that intensifies on hover (×1.35). Central lower belly stays shadowed — no broad amber wash under the text.
**Implementation architecture:** React computes complete `rgba(...)` colour strings for named crown/rim/environment variables and sets them on the button wrapper `style` (cascade into the button). CSS consumes them directly as `var(--x, <white-fallback>)`. This deliberately avoids `rgba(calc(...))` per-channel arithmetic, which proved unreliable in legacy comma-form `rgba()` and was the root cause of a persistent white hover streak (it silently fell back to white). Key variables: `--refl-active`, `--refl-left/right`, `--refl-upper-left/right/centre`, `--refl-lower-left/right`, `--crown-left`, `--crown-left-mid`, `--crown-right`, `--crown-right-mid`, `--crown-centre`, `--crown-rim`, `--crown-env`, `--bounce-edge`. Champagne base `rgb(255,226,165)`; per-zone opacity frozen at idle level, dropped below idle where that zone's amber light filters it. No-selected-card hover keeps normal blue-platinum behaviour (variables unset → white fallbacks).
**Scope:** Q5 only. Per-card contribution table lives in `components/enquiry/enquiry-opening.tsx` (Q5R lookup, keyed on answer label). Rollout to Q4–Q1 is NOT included — reserved for a future brief. No card styling, layout, timing, or JSX-structure changes beyond the wrapper `style` variables.
**Authority:** Human Founder
**Status:** APPROVED — Q5 reflection prototype baseline. See R-016.

**What is NOT included (reserved for future brief):**
- Rollout to Q4–Q1 (the per-card position model must be authored per question set) — DONE, see D-032
- Any change to the approved blue-platinum foundation (D-030) — this layer sits on top of it
- Crown/specular geometry changes

---

## D-032 — Enquiry Experience: Reflected Amber CTA Lighting — Rollout to Q1–Q5

**Date:** 2026-06-16
**Decision:** The approved Q5 reflected-amber lighting (D-031) is rolled out to all five enquiry questions. The Next step / Send CTA reflects selected-card amber filament light across Q1–Q5. The generalisation works because all five questions render through the same shared 3+2 answer grid (`enquiry-answer-grid`, fixed `nth-child` slots), so the contribution model is purely positional. The per-card table is keyed on **card index in the grid** (0 top-left, 1 top-middle, 2 top-right, 3 bottom-left, 4 bottom-right), not on answer text.
**Approved lighting rule (load-bearing, unchanged from D-031, restated for the system):**
- Reflection geometry stays stable — selected-card state changes the colour/intensity of reflected light, not the architecture of the object.
- No selected cards: normal blue-platinum hover remains.
- Selected cards: amber/champagne environmental reflection influences the CTA.
- Hover must NOT introduce a new clean white light source. White/platinum may remain subtly present, but amber increasingly filters/tints it as more cards are selected.
- Amber reflection scales by selected-card position and count; bottom-row (closest) cards influence most, the distant top-middle card least.
- Strongest amber state occurs when all visible answer cards are selected.
- The CTA must remain blue-platinum at its core — never a flat amber button.
**Implementation:** Module-level `GRID_REFL` table (index-keyed) + `reflectionVars(options, selected)` helper in `components/enquiry/enquiry-opening.tsx`. The button wrapper calls `reflectionVars()` unconditionally; it returns `{}` when nothing is selected and recomputes each render, so reflection direction updates live and no stale variables persist between questions. Q5 behaviour is byte-identical to the D-031 baseline (same vectors in index order, same champagne math, same variables). CSS unchanged.
**⚠ CORRECTION (24 July 2026) — the byte-identical claim above is NO LONGER TRUE of the current code.** A later, separate "Q5 PROTOTYPE reflection (Stage 2 — spatial light-FILTERING model)" layer is live in `components/enquiry/enquiry-opening.tsx` (`Q5_ZONE_INFLUENCE`, `q5ZoneColour()`, `q5ReflectionVars()`, `--q5zone-*` variables, routed by `qNum === 5` onto `.enquiry-nextstep-btn--q5proto`). Q5 therefore now uses a **different model, different variables and a different class** from the D-031 baseline. Introduced by commit `b08815b` ("Install advanced visual toolkit") — verified by git: zero occurrences in the working diff, 29 in HEAD. **This layer has no approval entry of its own** and is recorded here per the no-retroactive-rewriting rule: the original claim is preserved above, not deleted. Raised by the architect review, 24 July 2026 (`live-work/architect-review-findings.md`, F-1). ~~**A decision entry for the q5proto layer remains outstanding.**~~

**⇒ RESOLVED 25 July 2026 — see D-035.** The q5proto layer is **`PROVISIONAL`**: in place, deliberately untuned, awaiting the mastering pass Carl and the builder do together once the whole skeleton is complete. It is **not** drift and **not** a missing approval — the record simply had no way to say "deliberately untuned", which is why two separate reviewers (the 24 July architect as F-1, and CP's 25 July repo pass) both flagged the same non-problem. **The correction above remains accurate about the code**: Q5 genuinely no longer matches the D-031 baseline. What changes is the reading — that divergence is an unmastered take, not an unapproved change.
**Implementation lesson (carry forward):** Do NOT use `rgba(calc(...))` colour-channel arithmetic for this lighting system — it proved fragile and allowed white hover behaviour to leak through (silent fallback to white). Use React-computed complete `rgba(...)` strings for the named crown/rim/environment CSS custom properties.
**Authority:** Human Founder
**Status:** APPROVED — rollout across Q1–Q5. Branch `feat/q5-reflected-amber-lighting`: `ac3a112` (Q5 baseline) → `7fbb005` (Q1–Q5 rollout). See R-017.

---

## D-033 — Enquiry Experience: Send Button — Approved Deep Blue-Opal Cabochon Material

**Date:** 2026-06-22
**Context:** The Send trigger on the final details form was previously separated from the question-flow CTA (`.enquiry-nextstep-btn`) into its own class, `.enquiry-send-btn`, and given a deep blue-opal cabochon **colour foundation** with the internal opal character (mottling/refraction/violet) explicitly deferred to a later brief. This decision records the approved outcome of that later brief: the internal opal-character material pass.
**Decision:** `.enquiry-send-btn` is approved as a stylised deep blue-opal cabochon. Its painted face (CSS `background-image` stack only) carries:
- a smooth, dominant deep sapphire/ultramarine body with a dark navy edge/base;
- a contained internal cyan/teal light pooling in the lower-middle (below/around the word, never reaching the rim);
- internal structure composed around TWO focal formations — a PRIMARY irregular cyan/teal opal bloom (core + offset lobe, broken silhouette via tight multi-stop falloff) in the lower-left/lower-middle, and a restrained SECONDARY cobalt/violet-blue formation upper-right (registered at real size by a faint navy under-darkening behind a tight violet core; blue-leaning, partially obscured, no stripe/pink/magenta);
- ONE small/deep navy/cobalt shaping mottle intersecting the upper-left edge of the primary bloom to carve an internal shadow notch (light-and-shadow depth, not a dark spot on the surface);
- one small controlled specular dome catch high-left.
Hover remains the same stone — the two focal formations gain local contrast/clarity only (shaping mottle deepens, focal cores tighten); the broad cyan pool is held near idle so central glow does not climb. No new white light source, no hue jump.
**Design rule (load-bearing):** Internal visibility is carried by LOCAL CONTRAST and FALLOFF SHAPE, not by broad opacity increases or overall brightening. Overall luminance and saturation are held approximately constant between this pass and the prior one, and between idle and hover. The result is intentionally a stylised blue-opal interpretation suited to an ~84×41px text-bearing button — NOT a photographic gemstone reproduction. Reference images were optical inspiration only and were not copied (markings, texture placement, highlights and composition are original). Guiding direction: "Macro lighting from reference 5; micro-character from reference 4 — translated originally, never copied."
**Scope:** Confined to `.enquiry-send-btn`, `.enquiry-send-btn:hover`, and their adjacent material comment in `app/globals.css`. No React/JSX, no CSS variables, no pseudo-elements, no image assets, no dependency changes. Geometry, dimensions, text styling/colour, the bevel/elevation box-shadow stack, the specular catch, the disabled state, timing, and the completion-state fade are all unchanged. Send remains UNWIRED to a backend (target service/storage still undecided).
**Relationship to prior decisions:** D-032 / R-017 were correct at the time — Send inherited the shared `.enquiry-nextstep-btn` reflected-amber lighting before its own material was designed. D-033 is the subsequent source of truth for the Send button: Send is now a distinct material on `.enquiry-send-btn` and no longer derives its surface from the Next step CTA. The blue-platinum reflected-amber system (D-030/D-031/D-032) is unchanged and continues to govern `.enquiry-nextstep-btn`.
**What is NOT included (reserved for future brief):**
- Rim/glint surface-polish refinement on the Send button.
- Contact / details-field design (unresolved, out of scope).
- Send backend wiring.
**Authority:** Human Founder
**Status:** APPROVED — Send opal cabochon internal-character pass. Branch `feat/q5-reflected-amber-lighting`. See R-018.

---

## D-034 - Advanced Visual Toolkit Available

**Date:** 2026-07-20
**Decision:** The project has a curated advanced visual toolkit available: Three.js, React Three Fiber, Drei, Motion, GSAP, @gsap/react, Lenis, Leva, postprocessing, and @react-three/postprocessing. Tool usage is opt-in by task and governed by visual requirement; no package becomes a default implementation choice because it is installed.
**Rationale:** C2B needs a premium visual toolkit available for modern website techniques without tool-driven chaos. The amber selected-light work showed that material, light, reflection, refraction, camera, and depth behaviour should be considered Three.js/R3F territory rather than CSS-only styling once the requirement moves beyond a flat surface or border animation.
**Authority:** Human Founder
**Status:** APPROVED

---

## D-035 — Methodology: Production Then Mastering, and the PROVISIONAL Status

**Date:** 2026-07-25
**Decision:** The site is built **production-first, mastered second**, on the music-production model Carl works to: get the skeleton and every feature in place, then go through the whole site and fine-tune it **as a whole**. The final pass is done by **Carl and the builder together**, not by the builder alone.

A fourth status, **`PROVISIONAL`**, is added to the schema for work that is **in place, deliberately untuned, and awaiting that pass.**

**Rationale:** You cannot master a track while still tracking. Tuning one element in isolation means balancing it against a mix that does not exist yet — Q5's lighting cannot be judged finished while its neighbours are unbuilt. Provisional values are therefore **correct at this stage**, not unfinished business.

**The governance problem this fixes.** The record previously had no way to say "deliberately untuned", so provisional work read as a **missing approval**. This produced two false positives from two different reviewers in eight days: the 24 July architect review raised the undocumented q5proto Q5 lighting layer as finding **F-1**, and the 25 July CP repo pass raised the same layer again. Both were reading the record correctly; **the record was wrong**. A reviewer that cannot distinguish *undecided* from *deliberately deferred* generates noise on every pass, and noise is what makes a review layer easy to ignore.

**Instruction to reviewers (architect, CP, or any future layer):** the **absence** of an approval entry for a `PROVISIONAL` layer is **expected and correct**. Do not raise it as a governance gap. Raise it only if the work has **left** its provisional scope — grown beyond what was placed, or contradicted an `APPROVED` decision.

**Currently PROVISIONAL** (in place, untuned, awaiting the pass — not exhaustive; the whole visual skeleton is in this state unless a `D-` entry says otherwise):
- The **q5proto** Q5 spatial light-filtering layer (`Q5_ZONE_INFLUENCE`, `q5ZoneColour()`, `q5ReflectionVars()`, `--q5zone-*`, `.enquiry-nextstep-btn--q5proto`). This is what F-1 and the CP pass both flagged. **It is not drift.** See the correction inside D-032, which remains accurate about the *code*: Q5 no longer matches the D-031 baseline.
- **Contact-field geometry and material constants** — crown height, plateau, seam sink, aperture margin, insets, depth stack, `#c08f42`, roughness 0.34, metalness. Already recorded in `live-work/` as "starting values, not a calibration."
- Any visual value the record describes as provisional, diagnostic, untuned, or a starting point.

**What mastering will involve:** balance, tempo, brightness, contrast, emphasis, breathing room and emotional flow across the whole site — the same list the ethos files already give. **Files will be written to during the pass**, so the record must be clean going in. Values settled in the pass graduate from `PROVISIONAL` to `APPROVED` with an entry.

**Downstream constraint — this is why "clean" matters.** When the C2B site is finished, the repo becomes the origin of a **three-tier lineage**, and the stripping happens **exactly once**:

1. **C2B site repo** — this one. The finished agency site, and the proving ground for every pattern.
2. **The clean template** — a clone with all C2B-specific content stripped out **once**. This is the pristine, client-empty workshop. It is **never** used for client work directly and never accumulates client detail.
3. **Per-client repos** — each one a clone *of the template*, not of the previous client.

**Why the middle tier exists, in Carl's words: "we clone the clone."** Cloning client-from-client would mean stripping personal details out again on every new engagement — a recurring manual chore, done under time pressure, that eventually leaks one client's details into another's build. Keeping a pristine template means the strip is a **one-time setup cost**, and every client starts from a known-clean state rather than a scrubbed one.

**The consequence for this pass:** anything left half-decided here is inherited by the template, and therefore by **every client build after it**. A provisional value that never got mastered does not cost one website — it costs all of them, and it is far more expensive to correct once the lineage has branched. The mastering pass is therefore not only a quality gate for this site; **it is what makes the template fit to be the origin of everything that follows.**

**Authority:** Human Founder
**Status:** APPROVED *(the methodology is approved; the work it governs is `PROVISIONAL`)*

---

## D-036 — Governance: Authority Hierarchy Rewritten for Architect/Builder Model

**Date:** 2026-07-25
**Decision:** `ai-roles.md` is rewritten to describe the two-instance Architect/Builder hierarchy, superseding the pre-pivot structure (ChatGPT as PM/Creative Director with pre-ship veto, Codex as MCP review bridge) approved under D-005. The new hierarchy: Carl holds sole decision and approval authority; the Architect designs, chunks, and reviews as a structurally read-only layer producing findings only; the Builder is the sole code-writing agent. The Architect holds no independent veto and no approval authority — it recommends, Carl decides. Drift detection during a build is defined as a mechanism to be built, not a role; until it exists, `STOP CLAUDE` is Carl-triggered.
**Work reaches the Builder as a chunk, not a brief.** The chunk's scope — objective, what is in, what must not be touched — is stated without specifying implementation. The Builder writes the detailed plan in Plan Mode; the Architect reviews *that plan* and amends; Carl approves; the Builder executes that chunk only. The plan-review gate is load-bearing: the Architect's amendments carry weight precisely because it did not author the plan it reviews, so the review assesses the executor's own thinking rather than grading its own homework.
**Carl leads; the Architect records and drafts.** Work does not originate with the Architect. Carl looks at the section, states what is approved and untouchable, and describes what he wants — the design *and* the why: ethos, timing, flow, choreography, and how it connects in spirit to the rest of the site. **The chunking is led by Carl.** The Architect writes the prompt; **Carl approves it before it reaches the Builder**, checking specifically that his design, ethos and intent survived the translation. That is the one hop in the chain Carl can inspect directly, and the last point at which a translation error is still cheap.
**The information asymmetry is deliberate.** Carl gives the Architect only what it needs to know, the same focus discipline he applies to the Builder. This is a control, not an oversight, and must not be "fixed" by routing everything to the Architect.
**Why `project-intelligence/` is elaborate — recorded because it is the reason the whole file system exists.** The chain runs: Carl's intent → his brief to the Architect → the Architect's interpretation → the prompt → the Builder's interpretation → code. Five hops, four translations, and the losses are not symmetric — technical detail survives well, while the *why* degrades first. The why is exactly what tells the Builder what to protect when a constraint bites mid-build, so the most fragile part of the message is the most load-bearing. The file system is therefore a **fixed reference signal that did not travel down the chain**: at every hop an interpretation can be checked against the ethos files, `decisions.md` and worked examples rather than against the previous participant's paraphrase. It is what stops the whole chain drifting together, where nobody notices because everyone drifted at once.
**Rationale:** D-005 approved that a documented hierarchy exists; it did not fix the occupants. The ChatGPT/Codex layer is retired (`workflow-redesign/`, DL-5), so the hierarchy artefact D-005 requires must be re-authored to match the operating structure. Peer-veto and shared approval authority were artefacts of a different vendor sitting as a creative-director peer; two same-vendor instances in a reporting line do not carry that relationship, so both powers consolidate to Carl, tightening founder-final-authority rather than loosening it.
**Consequence, recorded as seen rather than discovered:** `REVIEW REQUIRED → APPROVED` is now Carl-only. Routine visual sign-offs previously cleared by ChatGPT now require Carl personally. Accepted deliberately — softening it would reintroduce a second approver by the side door. D-035 substantially absorbs the volume: under production-then-mastering most visual work sits at PROVISIONAL until one mastering pass Carl runs anyway, so the high-frequency routine sign-off the old table assumed largely does not exist. If a fast lane is ever wanted, it is defined deliberately as its own decision.
**Scope:** six governance files rewritten together (`ai-roles.md`, `context-rules.md`, `checkpoint-review-protocol.md`, `handoff-protocol.md`, `prompt-protocol.md`, `live-work-protocol.md`), plus `live-work/README.md`, the drift-sentinel status, two template renames, and `CLAUDE.md` step 5. Committed as one batch: a partial rewrite would leave governance files contradicting each other on approval authority, which reads as authoritative and is worse than uniform staleness.
**Authority:** Human Founder
**Status:** APPROVED — supersedes D-005's hierarchy. D-005's principle (a documented multi-agent structure exists) is retained and re-satisfied by the rewritten `ai-roles.md`.

---

## D-037 — Governance: The GSD Toolkit Removed from the System

**Date:** 2026-07-27
**Decision:** The third-party **GSD toolkit** (`get-shit-done`, v1.40.0, installed 3 May 2026) is removed from the user-level Claude Code installation in full — files, hook registrations, skills and cache. Carl's instruction: *"i dont use gsd anymore and have no plans to do so in the future. wipe it and its effects from the system without compromising our new setup."*

**Rationale — it was not dormant, it was running.** Carl had stopped using GSD months earlier, and the assumption was that an unused toolkit is inert. It was not. Discovered while auditing `.claude` configurations for F-3, GSD held **nine hook registrations** in `~/.claude/settings.json`, all firing in the **Builder** seat — the seat that writes code. Its self-updater, `gsd-check-update.js`, ran **at 14:38:51 BST on 27 July 2026, during the session that found it** — a process pulling from a GitHub repository Carl was not following, executing in the seat with write access.

**What was removed** (counts verified against the backup, not recalled):

| Item | Count |
|---|---|
| `~/.claude/get-shit-done/` | 246 files |
| `gsd-*` hook scripts in `~/.claude/hooks/` | 12 (9 `.js`, 3 `.sh`) |
| `gsd-*` skills in `~/.claude/skills/` | 6 |
| Hook registrations in `~/.claude/settings.json` | 9 |
| `~/.cache/gsd/`, `gsd-file-manifest.json` | both |

**The nine registrations, as they actually were** — recorded precisely because the first written account of them was wrong in two places, and a governance file that misdescribes a removed control teaches the wrong lesson about what to look for next time:

| Event | Matcher | Script |
|---|---|---|
| `SessionStart` | — | `gsd-check-update.js` |
| `SessionStart` | — | `gsd-session-state.sh` |
| `PreToolUse` | `Write\|Edit` | `gsd-prompt-guard.js` |
| `PreToolUse` | `Write\|Edit` | `gsd-read-guard.js` |
| `PreToolUse` | `Write\|Edit` | `gsd-workflow-guard.js` |
| `PreToolUse` | `Bash` | `gsd-validate-commit.sh` |
| `PostToolUse` | `Bash\|Edit\|Write\|MultiEdit\|Agent\|Task` | `gsd-context-monitor.js` |
| `PostToolUse` | `Read` | `gsd-read-injection-scanner.js` |
| `PostToolUse` | `Write\|Edit` | `gsd-phase-boundary.sh` |

**Preserved deliberately:** Carl's own `c2b-context-statusline.js` (23 July, his naming, not GSD's) and its `statusLine` entry; the `npm install` / `npx tsc` permissions; and the repository's own `chunk-scope-guard.js`, untouched. **Also dropped:** one dead `permissions.allow` rule — a `Rename-Item` for `Logo=Morph.png` under `agency-website`, a path that no longer exists. Flagged to Carl at the time.

**Why this is a governance decision and not housekeeping.** GSD is a **competing governance system**. Its phase/plan/execute model ran alongside the chunk → plan-review gate → checkpoint chain (D-036), holding its own opinions about when a write was permitted — three `PreToolUse` guards on every `Write`/`Edit`. Two governance systems with different models of "may this write proceed" were arbitrating the same actions, and only one of them was written down here. Some unexplained friction in earlier Builder sessions may have been its guards; that is offered as a hypothesis, not a finding, since nothing was measured at the time.

**The lesson worth carrying, because it generalises past GSD:** **an unused tool is not an inactive tool.** Hooks run outside the permissions system — the deny list never governed them — so a hook registration is a standing grant of execution that no permission audit would surface. The audit that found this was looking for something else. **Configuration installed and forgotten is the failure mode with the longest half-life**, because nothing about it ever surfaces until it is looked for directly.

**Backup:** `C:\Users\Carl Buckley\gsd-removal-backup-2026-07-27` — 267 files, including the original `settings.json` as `settings.json.before-gsd-removal`. Retained until ~3 August 2026, then Carl's to delete.

**Consequence for the record:** the six `/gsd-*` entries in `live-work/references/slash-commands.md` describe commands that no longer exist; that section is corrected in the same change as this entry.

**Authority:** Human Founder
**Status:** APPROVED — executed 27 July 2026, recorded 27 July 2026. Removal verified from disk before this entry was written: the directory, hooks, skills, cache and manifest are absent, and `~/.claude/settings.json` contains no `hooks` block and zero `gsd` matches.
