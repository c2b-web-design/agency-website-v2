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

**Colour/material pass — removed 2026-07-28.** A future colour/material direction was
recorded here. **Future work is not kept in this repository**; Carl holds that record
outside it. **The guard stands: do not change enquiry colour or material without a brief
from Carl.** The corridor's current colour and material are approved as built.

---

## D-025 — Visual Direction: Brand Colour Direction

**Date:** 2026-06-14  
**Decision:** The site's emerging brand colour direction is: near-black base, gold/amber as premium accent light, teal/duck-egg/deep blue as modern intelligence accent. These are directional only — not yet applied to the homepage or any live surface. Application requires a design pass with a new brief.  
**Rationale:** Colour direction was resolved informally across the enquiry experience iterations and is recorded here as a shared reference so future agents do not treat the current neutral-only palette as the permanent final state.  
**Authority:** Human Founder  
**Status:** APPROVED as direction. Not yet implemented on homepage. Do not apply without a brief.

---

## D-026 — Hero: Right-Side Space Is Intentionally Empty

**Date:** 2026-06-14. **Rewritten 2026-07-28** — see note below.  
**Decision:** The current hero is a structural scaffold. **The right-side visual space is intentionally empty and must not be filled.** It is not an oversight, an unfinished section, or an invitation to add a placeholder, illustration, or effect.  
**Rationale:** The hero as-built holds the layout and tone. The empty space is reserved for a future creative milestone that requires its own brief and production assets. Without this record, a session reads the gap as a defect and fills it.  
**Authority:** Human Founder  
**Status:** APPROVED and binding. **Do not fill the hero space without a brief from Carl.**

**2026-07-28 — future direction removed on Carl's instruction.** This entry previously described the planned cinematic hero in detail. **Carl keeps the future-work record outside this repository**, so a session reading these files is not distracted by work it does not yet need. **The constraint above survives; the description of what will eventually fill the space does not.** If and when it becomes current scope, Carl introduces it as a chunk with its own brief.

---

## D-027 — Future Tools Direction — REMOVED

**Removed 2026-07-28** on Carl's instruction. The entry recorded three directional future
tools with no scope, brief or timeline. **Future work is deliberately not recorded in this
repository** — Carl holds that record outside it, for the site and the wider business.

The number is retained so the decision sequence stays unbroken and older references remain
traceable. **Nothing here is pending, blocked, or awaiting action.**

---

## D-028 — Enquiry Experience: Answer Card Material — Frosted Blue Glass

**Date:** 2026-06-15  
**Decision:** The enquiry answer cards (Q5–Q1) use a frosted blue glass material for idle, hover, and selected states. Five deterministic glass variants (A–E) rotate across Q5 to Q1 to avoid repeated or tiled gradient directions. The selected state retains the amber top-edge hairline and warm halo from D-016 — selection is still expressed through material activation, not colour alone.  
**Rationale:** The amber/gold smoked glass treatment from D-016 was functional but directionally neutral. The frosted blue glass aligns with the brand colour direction (D-025: near-black base, teal/blue as modern intelligence accent) and gives the cards a more distinctive, premium material identity. Five variants ensure no card shares a gradient direction with its neighbour.  
**Authority:** Human Founder  
**Status:** APPROVED — commit 3621997.

> ### ⚠⚠ SUPERSEDED IN PART BY D-051 — THE FACE MATERIAL IS SATIN, NOT GLASS
>
> **The face material specified above was discarded on 9 August 2026, commit `1c9b8d7`, on
> Carl's decision.** The card face is now a satin `MeshPhysicalMaterial` — `transmission: 0`,
> carried by anisotropy 0.86 and a separate sheen lobe. **See D-051 for what is actually built.**
>
> ⚠ **This entry's wording is deliberately unchanged (P4 — dated entries keep their wording).** It
> remains the correct record of what was approved on 15 June 2026, when the card was a **CSS**
> element. **Its selected-state provisions are NOT superseded** — the amber top-edge hairline
> lineage and the filament border (D-029) stand.
>
> ⚠ **The record carried the stale material for ten days.** That gap, and why it matters, is the
> subject of D-051's closing section.

---

**Amber circuit — attempted and removed (record of previous work):**
- An amber travelling bead / perimeter circuit animation on the selected card was
  prototyped, became unstable, and was removed before commit. Superseded by the filament
  border, D-029.
- **Do not restart amber circuit work without a dedicated brief from Carl.**

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
**Relationship to prior decisions:** D-032 / R-017 were correct at the time — Send inherited the shared `.enquiry-nextstep-btn` reflected-amber lighting before its own material was designed. D-033 is the subsequent source of truth for the Send button: Send is now a distinct material on `.enquiry-send-btn` and no longer derives its surface from the Next step CTA. ~~The blue-platinum reflected-amber system (D-030/D-031/D-032) is unchanged and continues to govern `.enquiry-nextstep-btn`.~~ **⚠ NO LONGER TRUE — CORRECTED 10 AUGUST 2026.** The Next step button's surface is a Three.js mesh (`NextStepCanvas`), and `.enquiry-nextstep-btn--mesh` clears the painted material. The reflected-amber system it names — `GRID_REFL`, `reflectionVars`, `q5ReflectionVars`, `--refl-*`, `--q5zone-*` and `.enquiry-nextstep-btn--q5proto` — **has been deleted**, on Carl's instruction: *"amber might not return, delete."* See D-047.
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

> ⚠⚠ **AMENDED 11 AUGUST 2026 — THIS ENTRY COVERS *VALUES* BEING PROVISIONAL. IT DOES NOT COVER
> *ARCHITECTURE* BEING PROVISIONAL, AND THAT GAP HAS COST ONCE.**
>
> Carl: *"I might go back and rewrite a whole section like we are doing."* **Re-tracking is part of
> the method, not a deviation from it** — and a structural decision taken during tracking gets
> written in the register of a settled thing, then has the section rewritten beneath it.
>
> **D-046 is the worked case.** It declined the shared-canvas host on three grounds; later work
> removed two of them without ever contradicting it, so its *"it is not authorised"* still read as
> current. See **D-048**, the rule in `context-rules.md` → *Approved work is amendable*, and the
> full method in `ai-system/working-with-carl.md` → *How Carl builds — the DAW model*.
>
> ⚠ **A DECISION MADE DURING TRACKING IS A TAKE, NOT A MASTER.** It was right for the material as
> it stood. Overtaken is not wrong.

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

---

## D-038 — Governance: Future Work Is Not Recorded In This Repository

**Date:** 2026-07-28

**Decision:** **Future work is deliberately not recorded in `project-intelligence/` or anywhere else in this repository.** Carl keeps that record outside it — for the website and for the wider business. Forward-looking roadmaps, unbuilt directions, speculative tooling and "planned but not designed" items are removed from the repo and are not to be reconstructed in it.

**Rationale — Carl's, and it is the whole point:** *"I need to keep you focused on current work, or previous work and not to be distracted by things you don't have to know yet."* A session that reads a roadmap starts weighing it. It plans against work that is not authorised, treats absent future items as gaps, and quietly widens scope. Removing the material removes the pull. **The repo describes what is built and what is authorised now; nothing else.**

**What this does not remove — the distinction that matters:**

- **Guards that protect built work stay.** "Do not fill the hero's right-side space without a brief" (D-026) survives, while the description of what will eventually fill it does not. The constraint is current; the plan was future.
- **Records of previous work stay**, including failed experiments — the amber circuit under D-028 is a record of something attempted and removed, which is history, not roadmap.
- **Directions that explain built work stay.** D-025 is retained because the frosted blue glass (D-028) derives from it.
- **Dated review and QA records are never retroactively rewritten** (P4). Historical entries keep their original wording.

**Applied 28 July 2026:** ethos file §§24–29 and §31 removed (201 lines); `current-sprint.md` "Up Next" and "Open Questions" replaced with the two authorised next steps; D-027 removed and D-026 rewritten to the surviving constraint; forward-looking colour/material blocks trimmed in `decisions.md`, `design.md` and `mission-overview.md`.

**Decision numbers of removed entries are retained** so the sequence stays unbroken and older references resolve. **A retained number with a removal note is not an open item.**

**Authority:** Human Founder
**Status:** APPROVED — standing policy. Applies to every future session. If a future direction becomes current scope, Carl introduces it as a chunk with its own brief.

---

## D-039 — Governance: Drift Sentinel Parked Pending Evidence From The Three.js Chunks

**Date:** 2026-07-28
**Status:** PARKED — decide after the first few Three.js chunks. Not approved, not rejected.

**Decision:** The continuous Drift Sentinel is **not rebuilt for now**. `drift-sentinel.md` and the retained specification in `live-work-protocol.md` §6 stay in place, unowned, until the four-box Three.js work produces evidence about whether a watch is actually needed. Carl decides then.

**Why it was raised:** the Sentinel has had **no owner** since the previous governance layer retired. Nothing runs the watch. `STATUS: CONTINUE` in `drift-sentinel.md` means *"no watch is running"* — not *"watched and clear"* — which is why that file carries a warning at the top.

**Why parking is reasonable rather than negligent.** The Sentinel read status files every two minutes because the reviewing seat was blind — no eyes on the browser, no eyes on the Builder's chat panel. It was a workaround for that blindness. Two of the three jobs it proxied for now have better answers:

| Sentinel's job | Current answer |
|---|---|
| Catch visual work going wrong | `verify/` — the render is captured, not described |
| Notice drift while it happens | Carl, switching between the chat window and localhost frequently |
| Compare work against the approved prompt | **Still nothing automatic** — the open half |

**The honest limit, recorded so it is not discovered later.** The unanswered third row is the failure Carl is most exposed to: **work that renders correctly, verifies clean, and is not what was asked for.** Neither the harness nor watching localhost catches it. Carl's own conclusion from Day 3 stands as the mitigation — *"I must be doubly careful what I plan… I must be sure the Architect understands the brief entirely."*

**Note that the old Sentinel would not have caught it either.** It compared status files, which would have read as work proceeding normally. Rebuilding it would not close the gap it appears to close.

**What remains in force regardless:** the Builder's obligation (§6) to write status, checkpoint and run-log files in small steps during sensitive visual, material, animation, Three.js, layout or approved-foundation work. That is independent of anything watching them — it exists so that when Carl switches over and asks what happened, there is a written answer rather than a reconstruction from memory.

**The known failure mode:** Carl as drift detection only works if he looks. On a long session that is easy to intend and skip. If a stretch goes unwatched, the remedy is checkpoint discipline — not a resurrected Sentinel.

**If it is ever rebuilt (P-A):** prefer a **hook** over an instruction. An agent *asked* to run a watch is an intention, not a control — that is precisely how the retired Sentinel came to sit at `STATUS: STOP` while work was being submitted for review. `.claude/hooks/chunk-scope-guard.js` is the nearest existing mechanism, currently inert until `chunk-scope.json` exists.

**Authority:** Human Founder

---

## D-040 — Workflow: Reverting A Chunk — Git First, Not `/rewind`

**Date:** 2026-07-28
**Status:** APPROVED as guidance.

**Decision:** When a chunk needs undoing, reach for **git** first. `/rewind` is reserved for the narrow case git cannot cover.

| Situation | Use |
|---|---|
| Chunk committed and went wrong | `git revert` / checkout — fast, keeps the record **and** the Builder's context |
| Uncommitted mess, the whole approach should be forgotten | `/rewind` |
| Part of the work was right | **Re-prompt** — nothing else can be selective |

**Rationale.** `/rewind` and re-prompting are not two routes to the same place. Rewind **erases**; re-prompting produces a new forward change that happens to land near an earlier state.

Two consequences decide it:

1. **`/rewind` leaves no audit trail.** The conversation that produced the bad chunk is gone and `project-intelligence/` learns nothing. This contradicts the project's own discipline — *a superseded record is evidence; a deleted one is a gap*. A rewound chunk is a gap by construction.
2. **Rewinding discards what was learned.** If the Builder has just measured *why* an approach fails, that is the single thing most worth keeping. Rewinding hands the same task back to someone who has not tried it yet.

**Git gives rewind's speed while keeping both the history and the Builder's context**, which is why it is the default.

**Correction, same day.** This entry first described `/rewind` as all-or-nothing. **It is not.** The documentation states it restores **conversation only, code only, or both**, and can also summarise from a chosen message. The recommendation above is unchanged — git still keeps the history *and* the Builder's context, which is the deciding factor — but "it cannot be selective" was wrong and is withdrawn.

Two further details worth knowing before relying on it:

- **Checkpoints only track changes made through Claude's file-editing tools.** Changes made by Bash commands or external processes are **not** captured. It is not a replacement for git.
- Every prompt creates a checkpoint, and they persist with the conversation, so a session can be resumed later and still rewound.

⚠ **`/rewind` remains on the never-invoke-to-explore list** (`CLAUDE.md`, billed and destructive commands). Its behaviour above is taken from documentation; **it has not been tested here.** Verify before relying on it in anger.

**Authority:** Human Founder

---

## D-041 — Tooling: `/doctor` Diagnostic Run, And Auto Mode Made The Builder Default

**Date:** 2026-07-28
**Status:** APPROVED — applied the same day.

**What happened.** Carl ran `/doctor` from the read-only Architect seat and brought the raw report to the Builder rather than routing it as instructions. **That sequencing was deliberate and worth keeping:** a report converted into a prompt before the Builder sees it arrives with its findings already collapsed into orders, and the Builder cannot say which are wrong. Raw findings can be triaged; instructions cannot.

### The result that mattered

**`CLAUDE.md` passed the trim check.** ~1,350 estimated resident tokens, and the only derivable content was the two-line Stack section that `package.json` already states. Everything else — the working-hours directive, approved-layer locks, handoff protocol, the lint-error gotcha, the billed-command list — is non-derivable governance that belongs there.

**This settles an open question.** The working-hours directive was broken twice and escalated to a capitalised block. The documented failure mode for a broken rule is *"the file is probably too long and the rule is getting lost."* **The file is not too long.** So escalation was the right response, and no hook is needed on bloat grounds.

### Applied

| Change | Detail |
|---|---|
| **Auto mode** as Builder default | `"defaultMode": "auto"` in `~/.claude/settings.json`. Applied as a one-line edit, not the whole-file replace proposed — same result, smaller blast radius. Validated: parses, both allow rules intact, statusline and model preserved |
| 16 backup files deleted | 5 Architect settings backups, 10 `.claude.json` backups, and `.claude.json.bak-before-codex-removal` — the last removed under the standing rule that nothing from the retired seat stays |

**Backups regenerate.** Three reappeared within seconds. This is tidying, not a permanent fix.

### Not applied, deliberately

- **Duplicate `~/.claude.json` project key** (`C:/…` stub alongside `c:/…`). Cosmetic, and the report's own caveat is the reason: it may be recreated, or recreated inverted. Hand-editing live app state to remove ten default-valued keys is not worth a malformed-edit risk. If ever done, close every session first.
- **Plugin marketplace removal** — installed under `~/.claude-architect/`, so it must be run from an Architect session.
- **The Stack section.** The report recommended keeping it; the Builder mildly disagreed (`package.json` is the real statement of intent, and a copy can drift). ~25 tokens either way. Left as-is.

### What auto mode does and does not change

**Does:** routine per-action approvals go to a safety classifier instead of prompting Carl each time.

**Does not:** hooks still fire under every permission mode, so `chunk-scope-guard.js` is unaffected. The plan-review gate, checkpoint review and every governance rule stand — no commit or push without Carl asking, no touching an approved layer without asking.

**The honest framing, recorded because it is a shift not a tidy-up:** oversight moves from *per-action* to *per-chunk*. That suits this model — the real gates are chunk authorisation, the plan-review gate and checkpoint review — and the documented risk of per-action gating is that *"after the tenth approval you're not really reviewing anymore, you're just clicking through."* Carl also now watches localhost directly, which catches more than a permission dialogue.

⚠ **The consequence to act on:** `chunk-scope-guard.js` is **inert** until `chunk-scope.json` exists. Under per-action prompting that mattered less; under auto mode it is the deterministic gate that replaces those prompts. **Wire it up before sustained Three.js implementation.** Not urgent while building is paused.

**Two corrections to the report, recorded so the record is accurate rather than flattering:**
1. It stated the lowercase project key holds "real history." **Both keys hold zero history entries.** The lowercase one holds session *telemetry* — `lastCost`, lines added, `lastSessionId`. Acting on the stated reason could have deleted the wrong key.
2. It counted "~14" backup files; there were **16** including the codex snapshot.

**Authority:** Human Founder

---

## D-042 — Governance: `strategist-role.md` Approved, And The Strategist Added To The Authority File

**Date:** 2026-07-29
**Status:** APPROVED

**Two things, decided together because the second is what forced the first.**

### 1. The Strategist was missing from `ai-roles.md`

`ai-roles.md` defines the authority structure. It listed Carl, the Architect, the Builder and Claude Design — **and not the Strategist**, despite that seat having a full role file since 26 July, a folder policy, and a two-stage chain into the Architect. A session reading the authority file to learn the system would not have known the seat existed.

**Added beside the build chain, not in it.** The file now separates **the build chain** (Carl → Architect → Builder, each handing to the next) from **beside the chain** (the Strategist). The Strategist is not senior to the Architect and not junior to it; it holds no position in the chain at all and has no channel to either seat.

**Why the placement is load-bearing rather than cosmetic.** Strategy precedes building, so the Strategist reads as *upstream* — and upstream reads as seniority. `strategist-role.md` §3 states the risk directly: a Strategist that believes it is senior writes directives instead of findings. Listing it in the same column would have implied exactly the authority the role denies itself.

### 2. `strategist-role.md` is APPROVED as-is

DRAFT since 26 July. Approved without amendment, having been reviewed against the approved decisions and found consistent with D-006 (files canonical), D-035 (repo lineage) and D-036 (authority).

**The approval was forced by the first change.** Before 29 July the DRAFT was cited by nothing. Adding the Strategist to `ai-roles.md` created **eight citations** from approved governance into an unapproved file — approved governance leaning on a draft. Approving it closes that.

### Also recorded

**The shorthand.** Carl refers to the seats by initials, most often when talking to one seat about another: **PM/A** (Project Manager / Architect), **CB** (Claude Builder), **CS** (Claude Strategist), **CD** (Claude Design). Defined once in `ai-roles.md`; the governing documents keep using full names. It is a working convenience, not a rename.

**CS and CD are different surfaces.** CS is a Claude Project in the browser; CD is a separate tool reached from within that menu system. They share a product, not a seat. **CD is named and expected but not in use — its remit, position and routing are deliberately not recorded**, and a future session must not infer a role for it from the shorthand table.

**What CS may be given, as a standing list.**

⚠ **The isolation is a decision, not a limitation — and the record must say so in that
order.** CS has access to exactly what Carl decides it has, and **no direct connection, only
through him**; artefacts land on his PC because he puts them there. **That is the design.** A
limitation invites a future session to fix it; a deliberate boundary does not.

**CD is the evidence.** Claude Design launched in exactly CS's position — browser-bound,
isolated, no channel — and **has since been updated so it can connect to Claude directly.**
The isolation was never a permanent property of the tool. **So if CS gains a direct
connection, whether it *should* use one is still Carl's decision**, and the reasoning behind
today's answer — separate context is what keeps an independent read independent — does not
change because the plumbing did. **A new capability is not its own authorisation.**

*(Whether CD's direct connection is used, and on what terms, is flagged by Carl for
discussion. Undecided, and deliberately not recorded.)*

**The practical limit today** is that CS has no filesystem: anything it holds is a snapshot Carl pastes in, which then goes stale in place with nothing to correct it — `strategist-role.md` §6's "accurate when written, stale in transit", arriving by a standing route rather than a one-off. So the list answers two questions at once — what is **its business**, and what is **stable enough to survive being snapshotted**:

- `starter-content/c2b-ethos-and-vision.md` — one commit in the repo's history; genuinely stable
- `mission-overview.md` — **identity and offer sections only**

⚠ **Not the Deployment section** — the volatile part of that file (two of its six commits landed on 28 July) and build machinery, which is not the Strategist's domain. **Governance files are excluded on purpose.** Carl's reason: *"It will have a better understanding of me and what it only needs to know about giving advice as regards the site. It does not need to know about governance etc, not its domain."*

**This governs CS's *persistent* knowledge only.** Carl may paste anything a single conversation needs; what matters is what enters memory, because that is the part that goes stale unnoticed.

### Open, carried forward

⚠ **§11's own-repo rule still has no decision entry.** *Anything the Builder builds gets its own repository; this repo is the C2B website and nothing else.* It is a **repo-wide** constraint living inside a role file, so a session building something else has no reason to read it. Approved as part of `strategist-role.md`, but raising it to its own numbered decision is Carl's call — carried since Day 2.

**Authority:** Human Founder

---

## D-043 — Governance: The Architect Seat Moved In-House, And The Orbiting-Light Chunk Routes Direct

**Date:** 2026-08-02
**Status:** APPROVED

**Two things, decided together because the first is what settles the second.**

### 1. The PM/Architect seat is now Claude CLI, not an outside source

Carl has rebuilt the governance system so the **Architect runs as Claude CLI** rather than an external tool. The seat is unchanged in remit and authority — D-036's hierarchy and `handoff-protocol.md`'s chain both stand — but the surface filling it is now in-house.

⚠ **During the changeover the Builder held both seats.** Carl's words: *"In the course of that you were my Builder and PM/A. You are winding down from that PM/A role. I had to tell you the whole remit in the client info section."* That doubling was a transitional necessity, **not a precedent**, and it is recorded here precisely so a future session does not read it as one. A seat that reviews its own plans is not a gate; the Architect's amendments carry weight only because it did not author what it reviews (`handoff-protocol.md` §1).

### 2. What that means for the current section, and for after it

| Phase | How work arrives |
|---|---|
| **This section** | ⚠ The brief came to the Builder **direct**. In Plan Mode the **Architect evaluates the plan and returns it to the Builder to execute.** The plan-review gate runs; the drafting step does not. |
| **After this section** | **Carl and the Architect brainstorm and plan together**; the Builder receives **bitesize chunks** — scope and constraints, not implementation detail. The full `handoff-protocol.md` chain. |

⚠ **This resolves the open authority item on the orbiting-light chunk.** `orbiting-light-test-rig-brief.md` §"Authority" and the Day 7 handoff both recorded it as **Carl's call and not decided**. It is now decided: **for this chunk, direct to the Builder supersedes the PM/A route**, with the plan-review gate intact. Carl: *"For this section, we are good to go."*

**Why the gate surviving matters more than the drafting step.** The chain has two separable protections: the Architect *writing* the chunk, and the Architect *reviewing* the plan. Only the second one catches the failure D-039 names as the one Carl is most exposed to — **work that renders correctly, verifies clean, and is not what was asked for.** Dropping the drafting step for a brief Carl wrote himself costs little, because the brief already carries his specification verbatim. Dropping the review would remove the only check on the Builder's interpretation of it.

**Authority:** Human Founder

---

## D-044 — Contact Field: The Face Crown Deepened, And The Orbiting Light Built

**Date:** 2026-08-02
**Status:** PROVISIONAL (D-035) — in place, deliberately untuned, for the mastering pass.

⚠ **Carl's framing, which governs every value below:** *"At the end of the whole building of the website I'm going to go through it all from start to finish and fine tune things. Look upon it as mastering. We can keep what we've got so far."*

**So nothing here is approved and nothing here needs approving.** These are takes.

### 1. The crown was too shallow to shade — one number explains it

`CROWN_HEIGHT` **1.2 → 5.0**, with `FACE_SEAM_SINK` **0.35 → 5.35**.

⚠ **Carl's report was that the faces looked flat** — *"I cannot tell any face being convex... it was my understanding that doing this with three.js mesh and real geometry that it would highlight its 3D qualities, moreso when light is used."* **He was right, and the geometry was the cause.**

A raised-cosine crown 1.2 units tall over a 19-unit half-height has a **maximum surface tilt of 5.67°**. Lambert shading depends on the angle between light and normal, so:

| light angle | upper/lower ratio |
|---|---|
| 45° | 1.22 — nothing visible |
| 60° | 1.41 |
| 75° | 2.18 — only now reading |
| 84° | the lower face finally darkens |

⚠ **The shadow lived in the last ~6° of a 90° sweep.** The geometry was real and physically incapable of showing itself. At 5.0 the maximum tilt is **22.5°** and the shadow forms from ~67°.

**Measured before and after**, top/bottom luminance ratio across box 1's face: mid-arc **1.38 → 3.69**.

⚠ **THE TWO CONSTANTS MOVE TOGETHER — `FACE_SEAM_SINK = CROWN_HEIGHT + 0.35`.** `faceBaseZ` derives from the bevel's front plane at z=8, so a taller crown pushes the face's peak *forward*: at crown 5 with the old sink the face would sit **proud of its own gold rim**, reading as a lens on top of its frame rather than a window. The crown therefore grows **backward**. Written wrong once during the change (4.15 put the peak 0.85 proud) and caught by redoing the arithmetic, not by looking — a 0.85-unit protrusion on a 38-unit box is easy to miss on screen.

### 2. The texture was never the problem

⚠ **A probe measured the bare shaded geometry at 36 luminance of convex gradient against 18 with the colour map applied**, and this was initially read as *"the texture is drowning the geometry"*. **That reading was wrong.** The texture was not too strong — the geometry was too weak to compete. Deepened, they cooperate: the photograph supplies colour and variation, the crown supplies form and movement.

⚠ **AND IT PRODUCED THE DAY'S BEST RESULT.** Carl: *"the gradients are animated... that is so fckn cool."* **Nothing about the texture moves.** It is one static baked photograph; a travelling light across a sufficiently curved surface produces a travelling highlight. The apparent animation is the geometry doing its job.

### 3. The orbiting light

A tilted 3D ellipse around the whole four-box group, anticlockwise, spacebar on/off. Lives in `components/enquiry/contact-field-light-rig.tsx` behind `?lightrig=1` — **a throwaway instrument, deletable in one move.**

**Carl specified the path by naming two points**, both edge midpoints rather than box centres: the middle of **box 1's left vertical edge** and of **box 4's right vertical edge**, each with the light 200 units beyond — *"at the same distance it was from the face."* Aiming at an edge rather than a face is what satisfies the brief's *"no light should be on the box at this moment"*: the sweep has to **arrive**.

| Property | Value | Source |
|---|---|---|
| semi-major | ~489 | derived from the two edge points |
| semi-minor | 400 | Carl's cap — *"not more than double these corner distances"* |
| depth | ±400 | same envelope front and back |
| tilt | ~-5.7° | falls out of the two points |
| circuit | **6s front / 3s back** | Carl: *"let's try variable speed"* |

⚠ **THE ELLIPSE HAS NO INHERENT START.** Carl: *"it's circular, we could have chosen any start and halfway points."* The two edges fix the **axis**; the halfway cap fixes the **width**; the start is a free phase offset.

⚠ **THE TWO TIGHT BENDS DO THREE THINGS AT ONCE** — closest approach, sharpest curvature, and the front/back crossing. So **neither box gets a held moment of maximum light**; the glint is a passing event *by construction*, which is what the brief means by *"a glint is an ignition, not a pass."* No pulsing was needed.

**Why variable speed:** at the geometry probe's pace one circuit measured **45 seconds**. Carl: *"If a user waits for the page to load, realises what to do and uses autofill, we may have to speed things up."* A circuit the user never completes is an effect they never see.

**`decay = 0` → `decay = 2`**, because distance now has to matter. ⚠ **The intensity is derived, not guessed** — 1.6 × 341² = **185864**, where 341 is the measured nearest approach from a box *centre*. A first attempt used the 200 standoff and the whole orbit measured 18–27 luminance, barely above unlit: **the standoff is the distance from a box EDGE along the axis, not from a box centre to the light.**

### 4. The opal responds — and D-033 stays intact

The Send button's **specular dome catch only** now reads `var(--opal-shine, 0.72)`, resting **0.45** and peaking **0.85** as the light sweeps the front pass.

⚠ **THIS TOUCHES AN APPROVED MATERIAL (D-033 / R-018) ON CARL'S EXPLICIT AUTHORISATION.** One layer. The body gradient, both opal blooms, the shaping mottle and every box-shadow are untouched — Carl: *"The whole opal doesn't have to interact, but just that subtle shine on the opal."*

⚠ **AND IT IS INERT ON AN ORDINARY LOAD.** The variable is only ever written by the rig, so `var(--opal-shine, 0.72)` falls back to the approved value. **Verified: on a normal `/start` the property is empty and the button renders exactly as approved.**

⚠ **THE WEBGL LIGHT CANNOT ILLUMINATE A DOM ELEMENT** — different rendering worlds. The opal does not get lit; it **responds**, driven from the same phase on the same frame. Carl set the correct bar: *"The user won't know about the ellipse, all they will see is its effects. The goal is to give the impression the opal lives in our 3D world."* **Belonging, not accuracy.**

**True proximity was measured and rejected:** the closest approach lands at phase 0.953 — *inside the hidden half* — and the distance varies only 1.3×, because the opal sits near the ellipse's centre-bottom. It would have peaked while the boxes were dark.

⚠ **THE "PULSE" IS EMERGENT AND NOBODY WROTE IT.** Carl: *"it's as if the opal's shine pulses and the light of the cards is having some sort of effect on it."* The shine is one smooth rise and fall, then a flat hold through the hidden half — **the pause is what makes the next rise read as a new beat.** And nothing connects the boxes to the opal technically; they share a clock, and the brain supplies the causation.

### The box choice, settled

⚠ **Carl's original question — choose one box and apply it to all four — is CLOSED, and the answer is to change nothing:** *"leave it as they are. I like the randomness and adds to each box's individuality."*

**The variation IS the design.** The windows model stays intact, and the earlier worry that there was "no clean mechanism to apply one box's character to the others" is moot — that was never wanted.

### Parked

**Option B — text rendered on the curved surface**, so it follows the crown and catches the light. Currently DOM text over WebGL, so it stays flat while the surface behind it now has real form. Carl: *"Park option B, we will come back to it."* It would need a hidden input for accessibility, autofill and typing — a real chunk with its own risk.

**Authority:** Human Founder

---

## D-045 — Answer Cards: The Hover Light Specified, And Glass Put Under Review

**Date:** 2026-08-07
**Status:** SPECIFIED, NOT BUILT. The material is undecided and Carl is researching it. Build agreed for "a couple of days" from this date.

⚠ **NOTHING IN THIS ENTRY HAS BEEN BUILT OR SEEN.** It is a design specification given by Carl in conversation, recorded so the build is one pass rather than five. Every value marked *derived* is a rule, not a measured result. **Where a number appears it is Carl's first guess and is expected to move.**

### 1. The hierarchy, stated — and it reverses what the handoff assumed

> **Carl:** *"the q+a section will be the parent to the client info section."*

⚠ **THE 6 AUGUST HANDOFF HAD THIS BACKWARDS.** It recorded the contact field's orbiting light as prior art the card would inherit — *"the corridor's existing language arriving at the card."* **The field is DOWNSTREAM.** The card defines the language; the field is the first place it is reused. Getting this the wrong way round would have made the card a copy of its own child.

### 2. Hover is the user pondering, and that decides the mechanism

> **Carl:** *"Is the user pondering over a decision to pick that answer?... Does pondering have movement? Is it an ongoing process?"*

**Hover is not a visual state. It is attention dwelling.** So:

- **It LOOPS** — travels the arc and returns, continuously, while the pointer rests.
- ⚠ **AND THAT ANSWERS THE HANDOFF'S OPEN OBJECTION RATHER THAN OVERRIDING IT.** The worry was *"a loop risks becoming ambient motion, which this project has deliberately avoided."* Ambient motion happens REGARDLESS of the user. Here there is **zero motion on the page until someone points at something** — the loop satisfies the principle more strictly than a one-shot, which fires and then leaves a changed state sitting there.
- **A one-way pass asserts a conclusion the user has not reached.** It says "done" while they are still thinking.
- **Its duration is not chosen.** It is however long the user dwells — the timing comes from the person, not from a constant.

### 3. Motion character

> **Carl:** *"The motion should ease in/out and be at a slower speed and be subtle. The light will bring out the geometry. Pondering must feel relaxing, we dont want no fast, changing geometry to rush the user."*

**Eased at the reversals, slow, subtle.** The Builder argued for constant velocity with easing only at loop entry/exit, on the grounds that easing at every turn makes a repeating beat. **Carl overruled it and the reasoning is sound:**

> *"Not if the easing is slow enough. The alternative is to smash into the corners. The theory is sound but only a true judgement can be made visually."*

⚠ **CONSTANT VELOCITY MEANS AN INSTANTANEOUS REVERSAL** — infinite acceleration at each end, which is the "smash". At the speeds intended, a decelerating turn has no onset to register as a beat. **Neither reading is settled from argument; it is a tuning question and it needs eyes.** Build it so the easing shape and cycle length are adjustable without a rebuild.

### 4. The per-card arcs — the drawing, and what varies

**Card 2 is its own case.** Centred on the grid's centre line, vertical arc, starts in the middle. Symmetric, so it can use the full sweep: light rakes DOWN across the face with shadow on the lower half, then looks UP with shadow above, shining over the rim at both ends.

**The other four each take the diagonal toward their own nearest corner** — 1 top-left, 3 top-right, 4 bottom-left, 5 bottom-right. Carl's diagram (two drawings, 5 and 7 August): the small squares are the LIGHT SOURCE, the blue line its path.

⚠ **THE SOURCE STARTS JUST INSIDE THE CORNER, NOT ON IT.** Carl: *"i suspect we may well have to bring them in a little bit to get a more even coverage of light."* There is a measured precedent — the clay light's note records an earlier pass at ±34 that *"lit the card's short END and could never produce the middle state at all."*

**Start direction pairs on the DIAGONAL, and this is the one deliberate asymmetry:**

| card | position | direction |
|---|---|---|
| 1 | top-left | **out** → in → out |
| 3 | top-right | **in** → out → in |
| 4 | bottom-left | **in** → out → in |
| 5 | bottom-right | **out** → in → out |

Nothing mirrors left-right or top-bottom, so the pattern does not resolve — which is what makes the four read as individuals rather than two mirrored pairs. Carl: *"Even though the cards are geometrically the same they will appear individual because of the placement and arc of light."*

### 5. ⚠ The sweep must STOP SHORT on the corner cards, and card 2 must not

> **Carl:** *"It may not be neccersary to have the arc follow 0 deg - 180 deg... If it goes to the corners... the opposite corner may not receive as much light. Its not symmetrical like card 2. It may have to stop on 30 deg and 150 deg. At a point when the corners are most illuminated."*

⚠ **THE ENDPOINT THAT FLATTERS A SYMMETRIC CARD STARVES AN ASYMMETRIC ONE.** Card 2 is symmetric about its arc, so its extremes are where its shading is strongest. On a diagonal arc the source at 0°/180° sits out at a corner and rakes the face along its own diagonal — near corner lit hard, far corner barely reached.

**30°/150° is Carl's first guess, not a value.** The correct limit is wherever the far corner stops receiving useful light, which depends on cone angle, arc radius and the card's diagonal — **all known, so DERIVE the limits.** A hand-typed 30° goes stale the moment the beam width changes.

⚠ **AND IT IS MEASURABLE, NOT ONLY JUDGEABLE.** "The point at which the corners are most illuminated" = sample the face's four corners across the sweep, find where the spread between brightest and dimmest is smallest. Same method as `verify/clay-exposure.mjs`, which found 2.5 after three guesses missed. **Give Carl a measured starting value to adjust, not a guess.**

### 6. Intensity varies along the arc — build it as a curve from the start

> **Carl:** *"the lights intensity can also be varied at certain points in the arc. I wont know till i see it. It may well be that at the bottom of the arc, the light intensity should be slightly increased to bring out more of the curve."*

**This compensates for real physics** — at the ends of the arc the light rakes at a shallow angle and Lambert shading returns less, so constant intensity does not produce constant disclosure.

⚠ **BUT THERE IS A LIVE TENSION WITH `decay = 2`.** The contact field records that falloff was made physical *so distance matters*, and that a `decay = 0` probe was rejected because equal intensity everywhere destroyed the unevenness that was the effect. **A second variation on top could correct the shading OR flatten it.** Unknowable from here.

⚠ **SO INTENSITY MUST BE A FUNCTION OF ARC POSITION FROM THE OUTSET**, even if flat initially. Retrofitting position-dependence onto a constant is a rewrite; moving a control point is a keypress.

### 7. Only TWO things need judging, and that is also the correctness test

> **Carl:** *"there will only have to be two versions. Card 2 is its own thing, the others are mirror images of themselves."*

Tilt, inset and sweep limits all come from one calculation with sign flips; the start direction is the deliberate exception.

⚠ **IF CARD 3 NEEDS TUNING SEPARATELY AFTER CARD 1 IS RIGHT, THE DERIVATION IS WRONG** — it means something was hand-set and position is not actually deciding. Same principle as the retired four-zone colour system.

### 8. ⚠ GLASS IS UNDER REVIEW — the face material may not survive

> **Carl:** *"Glass for the card face may well be changed... Its so 'Apple' anyway and im wondering at this stage in modern website design its use could be considered somewhat cliched."*

**Ruled out by eye this session, without building either:**

- **Brushed / anodised metal** — *"its too close in look to the client info cards."* ⚠ The Builder had argued this made a "family"; **Carl's objection is better reasoning.** Derivation means a child expresses an inherited principle DIFFERENTLY. Two objects in the same material at the same scale is repetition, and the corridor depends on the cards and the field being distinguishable.
- **Satin** — Carl on the reference images: *"This is interesting. i like the way the light interacts with it."* Leading candidate at the close of the session, not chosen.

⚠ **AND THE CSS CARD WAS NEVER REALLY DESCRIBING GLASS.** `.enquiry-card`'s comment says *"frosted blue glass"*, but its six inset shadows are a **studio lighting diagram**: soft catch top, 1px hard specular, secondary catch left at one-third, depth shadow bottom and right, elevation drop. The border is *"thin structural edge"* at 0.20 — nearly invisible. **The rim light comes from the inset shadows, not the border.**

> **Carl:** *"My description was what the light should be doing. It is remarkable that the implied geometry is recognisable. Also on the ivory button and opal button too."*

⚠ **THE GENERAL RULE, AND IT WOULD HAVE PREVENTED THE TRANSMISSIVE CARD:** in this codebase **the labels name the CSS TECHNIQUE and the shadow stacks describe the OBJECT.** *"Frosted blue glass"*, *"opal cabochon"* — closest available names. Where the two disagree, **the shadows are right**, because they are what Carl tuned by eye. The WebGL card went transmissive because a Builder read the label.

⚠ **AND `backdrop-filter` WAS THE WORKAROUND, NOT THE SPECIFICATION** — the same correction Carl already made to `GRID_REFL`: *"approved only within the constraints of CSS."*

### 9. The Begin button's hover is the existing precedent

Measured off `globals.css` this session. **Every value moves deeper, and the specular line does not move at all:**

| | rest | hover |
|---|---:|---:|
| top light catch | 0.28 | **0.34** |
| face top | `#fffef8` | `#f8f2e0` darker |
| top rim, 1px white | **1.00** | **1.00** unchanged |
| sub-rim shadow | 0.38 | **0.50** |
| lower bevel | 0.54 | **0.66** |
| drop shadow | `3px 9px` 0.40 | **`4px 12px` 0.48** |

⚠ **THE CATCH BRIGHTENS WHILE THE FACE DARKENS** — that is increasing CONTRAST, not brightness. A single dial cannot produce it. And the hard specular holding constant is the same rule as the field's gold rim through the orbit: **the rim says "object", the light says "alive."**

**Carl on the relationship:** *"Not the same reading but a similar change."* The card's hover is a moving light; the button's is a static light with the surface responding more. Different means, same family.

### 10. Sequencing

1. **Material decided by Carl** (researching Three.js, WebGL and React; has videos and tutorials lined up).
2. **Cards built and rolled out to the other questions.**
3. **THEN the Next step button in Three.js** — Carl: *"We already have 2 exotic materials in ivory and opal. We need to keep in the same vein for this button."* ⚠ Note that the opal is currently lit by the FIELD's rig through `--opal-shine`; in Three.js it can be lit directly, but **whatever rig the cards get is the rig that button will live under.**

**Parked this session:** a rim light behind the contact field's boxes to catch the gold edges. Carl: *"Park it, i may come up with a better idea after i learn more."* Measured finding that motivated it — during the hidden return the rims are the only structure on screen and they hold it **dimly and unevenly**, because the orbiting spot targets the box group's CENTRE, so behind the boxes it points THROUGH them rather than raking their edges. **Position is not aim.**

**Authority:** Human Founder

---

## D-046 — The Warm Context Outlives Begin: An Overlap, Not A Shared Canvas

**Date:** 2026-08-09
**Status:** APPROVED by Carl's eye — *"it looks pretty clean"*. Implemented, commit `3a7cf1f`.
**Supersedes nothing. Constrains D-022/D-023/D-024 only in that it did NOT touch them.**

> ⚠⚠ **PARTLY OVERTAKEN — SEE D-048 (11 August 2026) BEFORE ACTING ON THE "NOT AUTHORISED" BELOW.**
>
> **The overlap fix in this entry stands and is unchanged.** What has been overtaken is its
> *rejection of the shared-canvas host*. Two of the three grounds no longer hold: the measurement
> hazard was engineered away by the fluid-grid work (the geometry is now anchored to
> `.enquiry-answer-grid` via `ResizeObserver`, not to the canvas's parent), and the ~70ms residue it
> was weighed against became a measured **193ms on every question step** once Stage B put cards on
> all five questions.
>
> ⚠ **D-046 WAS NOT WRONG.** It was correctly reasoned on the facts of 9 August. **A cost/benefit
> judgement expires when either side moves, and both sides moved.**
>
> The third ground — *"nothing I have approved may shift"* — **is still binding and is now the
> whole of the constraint.**

---

### The defect

Carl, 9 August: *"Q5 stuttered half way through its reveal on first run."*

Measured on the real GPU (`ANGLE (AMD Radeon(TM) Graphics, D3D11)`), cold: a **~580ms freeze at
+114–203ms** after Begin, inside a 1300ms phrase wipe that starts at +60ms. **40 of an expected
78 frames.** "Half way through" was accurate to the frame.

**Cause:** the warm-up canvas renders only while `stage === "opening"`; the real Q5 canvas only
after it. **They are mutually exclusive**, so Begin destroyed the warm WebGL context in the same
commit that created the real one, and the real one rebuilt everything from scratch.

⚠ **Shader compilation was NOT the cost** — 0.2–0.5ms inside the reveal. Three.js CPU-side
initialisation was. **This is the third time this project has cleared shader compilation of a
stutter it looked guilty of.**

### The decision

**An overlap on the warm node's lifetime, not a shared canvas.** The warm node stays mounted
900ms past the stage change, so the real canvas does its setup while the warm context still
exists.

⚠ **`stage` FLIPS EXACTLY WHEN IT ALWAYS DID.** Every consumer of it — the phrase band, the Q5
grid, the card ladder, the opening's teardown — is untouched. The only thing extended is how
long an invisible, `aria-hidden`, `pointer-events: none` node stays in the tree. **Delaying the
stage change itself would have moved the choreography**, which was forbidden.

| | before | after |
|---|---:|---:|
| Worst frame gap, cold | 584ms | **86ms** |
| Worst frame gap, warm | 591ms | **73ms** |
| Frames of ~78 | 40 | **76** |

⚠ **NOT ELIMINATED, AND NOT RECORDED AS FIXED.** ~70ms still lands in the wipe, above the ~50ms
visible threshold. Carl's eye accepted it; the residue is real.

### ⚠ THE REJECTED ROUTE, AND WHY IT LOOKS RIGHT

**One canvas shared across the stage change — rejected, and it was the Builder's first
recommendation.** Moving a single node between the opening branch and the phrase band **changes
its parent, which remounts it in React and destroys the very context the move exists to
preserve.** `enquiry-opening.tsx` had said so in a comment since 5 August; the Builder
recommended it anyway and found the warning only when opening the file to edit it.

**A true single-canvas fix needs a host that never unmounts** — a restructure of approved
layout, with a known hazard: the canvas maps one world unit to one CSS pixel from its *measured*
size, so a changed measurement path would reposition every card. **That is the route to the
remaining ~70ms, and it is not authorised.**

### ⚠⚠ THE FINDING THAT REFUTED THE OBVIOUS READING

**"The context dies at unmount, so the warm-up buys nothing, so delete it" is WRONG.**
`verify/warmup-value.mjs`, 3 runs per arm, cold GPU profile each:

    mount → compiled, warm-up PRESENT    161ms
    mount → compiled, warm-up ABSENT     919ms

**ANGLE's on-disk binary shader cache survives the context's death and is worth ~758ms.**
Deleting the warm-up would have made the stutter roughly twice as bad. The Builder reasoned its
way to the deletion and was saved only by running the experiment the harness's own header
demanded — its warning was explicit: *"only the binary cache crosses" is not "the binary cache
is worth 641ms".*

### Carl's constraint, and how it was met

> *"Nothing ive approved must shift. The start page text arrival and the choreography of Q5 and
> the cards."*

Verified by `verify/approved-timings.mjs --compare`, 3 runs, real GPU:

| | delta |
|---|---|
| **Card ladder internal gaps** (the choreography) | **−1 / 0 / +1 / −2ms** |
| Opening text rhythm | within the no-change control's own noise |
| Whole ladder, absolute | **+14ms uniform** — under one frame at 60fps |

⚠ **THE INTERNAL GAPS ARE REPORTED SEPARATELY FROM THE ABSOLUTE POSITION, AND THAT SEPARATION IS
THE POINT.** Every beat sliding together by 14ms is indistinguishable, in an absolute-only
report, from the ladder merely starting earlier — but only one of those is a corrupted
choreography. **A verification of "did it move" must be able to tell those apart.**

### ⚠ THE STALE FIGURES THIS WORK CORRECTED

Source comments claimed the entrance ran **+8857 → +15187ms from Begin**, with `compiled`
costing ~1944ms. **Measured: the ladder runs +695 → +2949ms** — nearly six seconds earlier.
Those comments predated the 7 August entrance fix.

⚠ **THE STALE FIGURE WAS ACTIVELY DANGEROUS, NOT MERELY OUT OF DATE.** It nearly caused a
~1944ms hold to be written into the Begin path to "preserve" a compile wait **that no longer
exists** — moving the approved entrance in the name of protecting it. **A recorded timing is a
claim about the past. Measure the ladder; do not read it off a comment.**

**Authority:** Human Founder

---

## D-047 — The Next Step Button Is A Mesh, And The Painted Reflection Layer Is Deleted

**Date:** 2026-08-10
**Decision:** The Next step button's surface is a Three.js mesh (`NextStepCanvas`) at every question, sized from its own measured box. The CSS-era **position-aware warm reflection layer is deleted in full** — `GRID_REFL`, `reflectionVars()`, `q5ReflectionVars()`, `Q5_ZONE_INFLUENCE`, `q5ZoneColour()`, the `--refl-*` and `--q5zone-*` variables, and the `.enquiry-nextstep-btn--q5proto` cabochon block. Select arity is **multi-select on all five questions**, superseding D-018's single-select for Q4.
**Authority:** Human Founder — *"amber might not return, delete"*; and on arity, *"when a single selection is made the next step button is made available. The user then can choose to select more answers or move on to the next section. If the user makes a single selection and changes their mind, the filament fades out, the button should too."*
**Status:** APPROVED

**What it supersedes.**
- **D-031 / D-032** — the reflected-amber lighting model, prototype and rollout. The behaviour is now **unimplemented, not rewired**: a selected card no longer warms the button at all.
- **D-018** — Q4 single-select (`role="radiogroup"` / `role="radio"`). ⚠ **It changes because Carl has changed it, and that is the whole reason.** Do not look for a defect in the old record to justify it; an early draft of the Stage B plan reached for D-018's authority line as though a softer attribution were the argument, and that reasoning would licence overriding any inconvenient decision. `radiogroup` was never implemented, so nothing unwound in code.
- **D-033's closing sentence** (`decisions.md:729`), which asserted the blue-platinum system "is unchanged and continues to govern `.enquiry-nextstep-btn`". Corrected in place.

**Why the reflection had to go rather than be left parked.** It was **already dead before it was deleted.** `.enquiry-nextstep-btn--mesh` sets `background-image: none`, so those variables were computed into a surface that no longer paints. ⚠ **An approved layer was superseded without being recorded** — the deletion is the correction, not the change. It stayed invisible because `selected` is always empty in this build, so both functions returned `{}` on every render and nothing looked wrong. Restoring selection is the change that would have made them run for the first time, into nothing.

⚠ **AND HALF A DELETION IS WORSE THAN NONE.** The first attempt removed the JS and left ~190 lines of painted cabochon CSS under a `transparent` override — dead weight that still read as authoritative. **Decide a layer all at once.** This entry's own line 763 named the layer as a single unit; it should have been read as the unit it said it was.

**If amber returns, it returns as light, not as gradients.** `AmberSource` on `NextStepCanvas` is the mesh's equivalent, currently `0` and parked — *"something that may or may not be implemented… I will return to this."* ⚠ **`GRID_REFL` was never a specification** and must not be resurrected as one: Carl retired that reading on 5 August, and its numbers were a hand-authored influence table with no falloff behind them. **Direction only: the bottom row receives more than the top row.**

**Measured, on production builds — dev-server numbers are noise here.**

| | |
|---|---|
| Q5 reveal, mesh in the corridor | **118–135ms** against a recorded 167ms — no regression |
| Q5→Q4 move, no canvas mounting | 62 / 67 / 68ms |
| Q5→Q4 move, canvas mounting | **186 / 188 / 200ms** |

⚠ **THE +126ms IS THE FINDING THAT GOVERNS STAGE B.** Mounting an answer canvas per question puts a visible stutter on every step — the Q5 stall's own mechanism at a new moment. ⚠ **But both arms were measured with `selected` empty, which the real path never is**, so the *delta* is the defensible figure and neither absolute is. An honest control needs selection wired first. **The shared-host question (D-046) is open and unauthorised; it is Carl's call and must be taken on a measurement, not a prediction.**

**Authority:** Human Founder

---

## D-048 — D-046's Rejection Of The Shared Host Is Reopened: The Ground It Stood On Has Moved

**Date:** 2026-08-11
**Decision:** **D-046's "not authorised" on the shared-canvas host no longer stands on its stated reasons.** Two of the three have been removed by work done since; the third was a scope judgement whose premise has changed. The restructure is **reopened for Carl's decision**, with measured evidence that did not exist on 9 August. ⚠ **This entry does NOT authorise it.** It removes stale grounds for refusal so the decision can be taken on current facts.
**Authority:** Human Founder — *"we have done some major restructuring and rebuilding, it is only right we make the necessary changes in the files."*
**Status:** APPROVED as a record. **The restructure itself remains UNAUTHORISED pending Carl's explicit word.**

---

### What D-046 actually said

> *"A true single-canvas fix needs a host that never unmounts — a restructure of approved layout, with a known hazard: the canvas maps one world unit to one CSS pixel from its measured size, so a changed measurement path would reposition every card. **That is the route to the remaining ~70ms, and it is not authorised.**"*

Three grounds, examined one at a time.

### Ground 1 — the measurement hazard. ⚠ REMOVED AT SOURCE, and D-046 did not know it

The hazard was that world units come from a *measured* size, so moving the canvas would move every card.

**That is no longer how it works.** `answer-card-canvas.tsx` now measures `.enquiry-answer-grid` with a `ResizeObserver` and derives **everything** downstream from that one number — `cardBoxesAt(width)`, the world positions, `cardScale`, the canvas box, the pointer targets. Its own comment: *"the cards now track the CSS… everything downstream derives from that one measurement."*

⚠ **SO THE GEOMETRY IS ANCHORED TO THE GRID ELEMENT, NOT TO THE CANVAS'S PARENT.** A canvas that changes parent while still measuring the same grid produces the same layout. **The hazard D-046 named was real when written and has since been engineered away** — by the fluid-grid work, not by anyone thinking about D-046.

### Ground 2 — "a bigger change than this defect justifies". ⚠ THE DEFECT IS NOW FOUR TIMES BIGGER

D-046 was weighing the restructure against **~70ms of residue, once, inside the opening reveal**, which Carl's eye had accepted (*"it looks pretty clean"*).

**The defect it is weighed against today is different in kind:**

| | worst frame gap | when |
|---|---|---|
| D-046's residue | ~70ms | once, in the opening |
| Measured 10 August | **193ms** vs a 69ms control — **+124ms, 2.8×** | **every question step, four times per walk** |

**Carl, 10 August, and this is the operative constraint:**

> *"A stutter or stall reads like a glitch, bad workmanship. For someone aiming to sell premium websites, this is a non negotiable."*

⚠ **A COST/BENEFIT JUDGEMENT IS NOT A PRINCIPLE, AND IT EXPIRES WHEN EITHER SIDE MOVES.** D-046's reasoning was sound for a 70ms residue on a corridor with one card grid. **Stage B put a card grid on all five questions**, so the same mechanism now fires four more times, in a moment nobody had measured.

### Ground 3 — *"nothing I have approved may shift"*. ⚠ STILL BINDING, AND IT IS THE REAL CONSTRAINT

**This one has not weakened and must not be read as weakened.** Carl restated it in substance on 10 August: *"the corridors movement is important, there is easing in there too."*

⚠ **AND THE RISK IS SPECIFIC.** The canvas currently sits INSIDE the phrase and inherits its motion **for free** — measured baseline: the grid travels **435→493px in lockstep with the phrase text, on all 161 frames** of a corridor move. A shared host lifts it out, and that inheritance becomes a **hand-driven animation** that must match `bottom 900ms cubic-bezier(0.37, 0, 0.63, 1)`. Three things are inherited today and would each need re-supplying: **the recede motion, the grid measurement, and the staggered entrance ladder** (which runs on mount, and a canvas that stops mounting per question must be told to re-run it — that ladder is approved choreography).

**✅ THE INSTRUMENT FOR THIS NOW EXISTS, WHICH IT DID NOT ON 9 AUGUST.** `verify/corridor-motion.mjs` samples the phrase and the grid every frame across a move, compares them as normalised curves, and has a **committed baseline** (`motion-before.json`) plus a **measured noise floor of 2.6–2.9%**. Steps 1a and 1b both scored **0.0–0.1%** against it. **A restructure can be held to the motion rather than judged from memory** — and Carl still judges by eye; the harness only says where to look.

### ⚠ WHAT REMAINS TRUE FROM D-046 AND MUST NOT BE LOST

- **Reparenting a live canvas destroys its context.** Moving a node between two branches remounts it in React. **That is why the host must NEVER unmount — not "move less often".** Recorded in `enquiry-opening.tsx` since 5 August; the Builder recommended the move anyway once and found the warning only when opening the file.
- **The warm-up must not be deleted.** *"The context dies at unmount so the warm-up buys nothing"* is refuted by measurement: 161ms with it, 919ms without. **ANGLE's on-disk binary shader cache survives the context's death and is worth ~758ms.**
- **Shader compilation is not the cost.** Three-js CPU-side initialisation is. This project has cleared shader compilation of a stutter it looked guilty of **three times**.
- **Report internal choreography gaps separately from absolute position.** Every beat sliding 14ms together is indistinguishable, in an absolute-only report, from the ladder starting earlier — and only one of those is a corrupted choreography.

### The decision this leaves for Carl

**Authorise the shared host, or accept the stutter.** Both are legitimate; neither is the Builder's to take.

⚠ **AND "NON-NEGOTIABLE" IS NOT THE SAME SENTENCE AS "AUTHORISED".** Carl has ruled the stutter unacceptable. Whether the remedy is *this* restructure — touching approved layout and approved motion — is a second decision, and the Builder must get it explicitly rather than infer it.

⚠ **THE ARCHITECT SHOULD SEE THE MEASUREMENT**, since this reopens a decision that was properly made and correctly reasoned on the facts available at the time. **D-046 was not wrong. It has been overtaken.**

**Authority:** Human Founder

---

## D-049 — The Architect Gets A Shell: Measurement Bought With The Write Boundary

**Date:** 2026-08-12
**Status:** ⚠ **REVERSED 13 August 2026 by D-050. The Architect is read-only again.** Applied to
the live file on 12 August and in force for one session; this entry is retained because its
reasoning is why the grant was made, and that reasoning has not been refuted — only outweighed.
**Carl's decision, given four times and executed on the fourth.**
**Supersedes:** D-036's read-only premise in part; `workflow-redesign/` DL-1 on the `Bash` denial.
**Reversed by:** D-050.

### The decision

**`Bash` is removed from the Architect's deny list**, along with `Monitor`, `TaskOutput` and
`TaskStop`. Twelve measurement commands are pre-approved so they do not prompt: `npm run build`,
`npm run lint`, `npx tsc --noEmit`, `node verify/*`, read-only git, `grep`, `ls`, `netstat`.

**`Edit`, `Write` and `NotebookEdit` remain denied.** So do `mcp__codex`, `mcp__ide`,
`DesignSync`, `CronCreate`, `EnterWorktree`, `RemoteTrigger`, `ScheduleWakeup`, `TaskCreate`.

### ⚠⚠ WHAT THIS COSTS, STATED PLAINLY

**The Architect can now write to the repository.** Not through `Write`, which is denied, but
through the shell. **Verified by attack on 24 July 2026:** with `Bash` available, denying the
edit tools is cosmetic — shell redirect, `sed -i` and `rm` all still write.

**And the `allow` list does not confine it.** `permissions.allow` *pre-approves* actions that
would otherwise prompt; it does **not** restrict a session to what it names, and no tool
allowlist exists at this tier. The seat also runs `disableAllHooks: true`, so the Builder's
`chunk-scope-guard.js` does not fire there.

⚠ **SO A READER WHO SEES `Write` ON THE DENY LIST AND CONCLUDES THE SEAT CANNOT WRITE IS WRONG.**
That is why this entry exists.

**The write boundary is now discipline, not mechanism.** `architect-role.md` §2 carries the rules
the Architect must hold: never write by any route, never `commit`/`checkout`/`reset`/`push`,
never `--fix`/`--write`/`-i`, never install, never build while the Builder has a server running.

### Why Carl chose it

On 11–12 August the Architect produced the two most useful analyses of the corridor work — the
reveal residue and the choreography audit — and **both rested on the Builder's numbers because it
could not take its own.** It named a falsifiable prediction (the contact pre-warm at
Begin+2949ms) and could not run the one test that would settle it; the Builder ran it and the
prediction failed.

**The review handicap was real, daily, and had just cost a day.** The write risk was **accepted,
not disproved.**

### ⚠ WHAT DID NOT CHANGE

- **The evidence file stays mandatory** (`checkpoint-review-protocol.md` §4). A reviewer that can
  run `git` is not a substitute for evidence the Builder prepared and kept separate from its own
  reasoning — that separation caught a false "byte-identical" claim in D-032.
- **The Architect still writes no repository files.** It reports; the Builder files. Unchanged.
- **Findings still go to Carl, who decides.** No approval authority was granted here.
- **Serialisation:** measurement happens at checkpoints, **after implementation stops**, one seat
  at a time (`checkpoint-review-protocol.md` §3a). Two seats measuring at once produce numbers
  neither can trust.

### Files updated in the same change

`architect-settings.reference.json.md` (reference + reconciliation date), `architect-role.md` §2,
`checkpoint-review-protocol.md` §3a and §7, `live-work-protocol.md` §5a, `ai-roles.md`, `CLAUDE.md`.
Live file backed up to `settings.json.bak-2026-08-12` before editing; JSON validated after.

⚠ **THE ARCHITECT MUST RESTART** for this to take effect — settings load at startup.

**Authority:** Human Founder

---

## D-050 — The Shell Is Taken Back: Carl Wanted Diagnostics And The Config Could Only Give A Shell

**Date:** 2026-08-13
**Status:** APPLIED to the live file. **Carl's decision.**
**Reverses:** D-049 in full.

### The decision

**`Bash`, `Monitor`, `TaskOutput` and `TaskStop` are restored to the Architect's deny list, and
the twelve-command `allow` list is removed.** The seat is read-only again, as it was before
12 August.

Everything else is unchanged: `Edit`/`Write`/`NotebookEdit` still denied, `allowedMcpServers`
still empty, `disableAllHooks` still true, `model` and `effortLevel` untouched.

### ⚠ WHY — AND IT IS NOT THAT THE ARCHITECT MISBEHAVED

**Carl's intent in granting D-049 was diagnostic access.** In his words, *"my intent was to
allow access to diagnostic tools in order to measure and evaluate the question reveal problem
that is still both undiagnosed and unfixed."*

⚠⚠ **WHAT THE CONFIG ACTUALLY DELIVERED WAS A GENERAL SHELL.** Those are different things, and
the difference is the whole entry:

- **`permissions.allow` pre-approves; it does not restrict.** The twelve commands stopped
  prompting. Nothing stopped the other commands.
- **No tool allowlist exists at this tier** — checked in the documentation, not assumed. `deny`
  is the only restricting mechanism, and it enumerates by design.
- **Argument-constrained `Bash` patterns were already rejected as fragile**, on Anthropic's own
  documentation (`ai-roles.md`, rejected alternatives).

**So the narrow grant Carl wanted could not be built out of the available parts.** The options
were a general shell or nothing. With a shell, denying `Edit`/`Write` is cosmetic — redirect,
`sed -i` and `rm` all write, verified by attack on 24 July 2026. **Carl took the enforced
boundary over the useful one.**

### ⚠ THE SEAT DID NOT BREACH ANYTHING

It ran **one session** with the shell (12 August, 03:29). The working tree was checked on
13 August: **no repository file was modified in that window.** Every change timestamps before
03:24 or after 03:58, and each maps to Builder work recorded in the handoff.

⚠ **Stated at its true strength: timestamps show when, not who.** Two seats were alive in that
period and a write from either would look identical on disk. What makes this conclusive rather
than suggestive is that **no file is unaccounted for.** This is a revert on principle, not a
response to an incident.

### ⚠ WHAT IT COSTS, AND THE COST IS REAL

**D-049's reasoning was never refuted — it was outweighed.** The Architect returns to quoting
the Builder's numbers. On 11–12 August its two most useful corridor analyses rested on
measurements it could not take, and it named a falsifiable prediction it could not test. **That
handicap is back in full, and the reveal defect is still unfixed.**

**The mitigation is the `!` route**, whose scope stays widened: the Architect proposes builds,
gates and `verify/` harnesses, and Carl runs them in his own shell. Capability stays outside the
seat; only output crosses. `architect-role.md` §2.

### ⚠ IF THIS IS EVER REOPENED, THERE IS NO PARTIAL VERSION

`Monitor` takes an arbitrary command in the same shell environment as `Bash`. Denying `Bash`
alone would close a name and not a capability — **the exact error the settings reference warns
against, and the round trip is now its worked example.** Read-only means all four stay denied.

### The governance point, which outlives the config

**D-049 was granted after Carl asked four times and was refused until he lost his temper.** The
Founder Override Protocol written on 13 August 2026 exists because of that failure, and this
entry is the first change made under it: Carl named the file, the reason and the scope; the
capability surface was disclosed before applying; the change was made without argument.

⚠ **Both halves of the 12 August failure are visible in this pair of entries.** The Builder
resisted a reasoned instruction, then complied under anger — and the instruction it eventually
carried out **did not deliver what Carl actually wanted**, because nobody had stated the gap
between *diagnostic access* and *a shell*. **Disclosure is what was missing, not compliance.**

### Files updated in the same change

`architect-settings.reference.json.md` (reference JSON, reconciliation date, both denial-table
rows), `architect-role.md` §2 (boundary and the `!` route), `ai-roles.md` (shorthand table and
the Architect's verification-limit section), this entry, and D-049 marked reversed.

Live file backed up to `settings.json.bak-2026-08-13` before editing; JSON validated after —
15 deny entries, no `allow` key.

⚠ **THE ARCHITECT MUST RESTART** for this to take effect — settings load at startup.

**Authority:** Human Founder

---

## D-051 — The Answer Card Face Is Satin, Not Glass — The Record Catches Up

**Date recorded:** 2026-08-19
**Date the change landed:** 2026-08-09, commit `1c9b8d7`
**Status:** APPROVED
**Authority:** Human Founder
**Supersedes:** D-028's face-material specification. **Resolves D-045 §8**, which put glass under
review and was never closed in the record.

### The decision

**The enquiry answer card FACE is a satin material.** Carl's reasoning, quoted in the commit that
made the change and authored by him: *"Glass has been discarded. Reason — it needs a background to
become truly effective and it could be seen as cliched in 2026."*

**The first half is the load-bearing one: glass is a LENS, and the lockup it refracted went on
5 August.** With nothing behind it to bend, transmission bought a measured near-nothing — see the
refraction table at the head of `answer-card-glass.ts`: sub-pixel displacement at the steepest
point on the face, zero across the whole crown centre under an orthographic camera.

### ⚠ WHAT IS ACTUALLY BUILT — read from the code, 19 August 2026

**Material type: `MeshPhysicalMaterial`** (`FaceMaterial`, `answer-card-mesh.tsx`), one instance
for the face, with sibling materials for rim, bevel and backdrop. The satin response comes from
**several lobes working together**, not from one parameter:

| parameter | value | constant | what it does |
|---|---|---|---|
| `transmission` | **0** | — | ⚠ **the change itself.** Passed as 0 rather than removed, so the prop's contract is unchanged for the clay/diagnostic path |
| `metalness` | 0 | — | dielectric, not metal |
| `roughness` | **0.26** | `SATIN_ROUGHNESS` | the specular tightness |
| `anisotropy` | **0.86** | `SATIN_ANISOTROPY` | ⚠ **the smear — what makes it satin rather than shiny blue plastic** |
| `anisotropyRotation` | 0 | `SATIN_ANISOTROPY_ROTATION` | along the card's long axis |
| `sheen` | **1** | — | enabled outright |
| `sheenRoughness` | 0.62 | `SATIN_SHEEN_ROUGHNESS` | |
| `sheenColor` | `#5b9ede` | `SATIN_SHEEN_COLOR` | the near-white peak while the body stays deep blue |
| `envMapIntensity` | **0.22** × `lightLevel` | `SATIN_ENV_INTENSITY` | low but deliberately not zero — the same rig lights the Next step button under D-045 §10 |
| body colour | `#0b1f4d` | `SATIN_COLOR` | ⚠ see the albedo note below |

**The two that carry the material:**

⚠ **THE ANISOTROPY IS THE SATIN.** It stretches the specular lobe along the tangent, which
`convexFaceGeometry` builds along the card's LONG axis — the axis the cylindrical crown does not
curve on. The result is a band running the card's width, disclosing the curve across its height.
⚠ **It is INERT without the `tangent` vertex attribute.**

⚠ **THE SHEEN IS A SEPARATE LOBE FROM THE SPECULAR**, and it is what carries the near-white peak
while the body stays deep blue. `sheenColor` is the light the surface returns at grazing angles —
the fabric behaviour — where `color` is the albedo underneath it.

⚠ **THE BODY COLOUR IS NOT ON THE MATERIAL WHEN A LABEL IS PRESENT.** `MeshPhysicalMaterial`
computes albedo as `color * map`. The answer label is the face's `map`, so the satin blue is
painted as that texture's BACKGROUND and `color` is left at pure white
(`color={labelMap ? "#ffffff" : SATIN_COLOR}`). A deep-blue `color` would drag near-white glyphs
down to a dim blue; a white `color` would throw away the body colour everywhere else. One albedo,
no compromise at either end.

**Reached through `DEFAULT_GLASS_TUNING`** (`answer-card-mesh.tsx`), whose `roughness` key now
holds `SATIN_ROUGHNESS`. ⚠ **The key was reused rather than renamed so the rig binding, the
`?roughness=` harness door and every existing sweep keep working — the dial's MEANING changed with
the material, its identity did not.**

### What else landed in the same commit

Recorded because they are not separable from the material and a reader will meet them together:

- **`LIGHT_LEVEL` 0.35 → 1.1.** ⚠ **This was the real fix for "flat at normal scale."** 0.35 was a
  GLASS value, tuned when the surface returned almost nothing; on satin it left mean luminance at
  21.6/255. Carl's symptom was **under-EXPOSURE, not under-resolution.**
- **The label became part of the face** — drawn into the albedo and mapped onto the UVs added for
  the anisotropy, after three DOM versions failed. ⚠ **ACCESSIBILITY DEBT, recorded not hidden:
  the visible answer text is a texture and is not in the a11y tree. Mandatory to fix when these
  become real controls.**
- **`FILAMENT_LIGHT_HEIGHT`** is now derived from `CROWN_HEIGHT` rather than typed.

### ⚠ MEASURED BEFORE AND AFTER, NOT ASSERTED

`verify/crown-disclosure.mjs`, quoted from the commit body. **Before:** the short-axis profile was
a flat 69.5 plateau, a cliff, then flat ~15 — two flat regions with a step, which is the RIM
against a dead FACE. **The 23.8° crown disclosed NOTHING, because `transmission: 0.97` mixes away
97% of the diffuse.** After: a smooth arc, `bothSidesFall` yes.

### ⚠⚠ KNOWN MISMATCH — THE FILENAME STILL SAYS GLASS

**`components/enquiry/answer-card-glass.ts` carries the old material in its name and holds the
satin constants.** So do the `GLASS_*`-prefixed keys inside it and the `glassTuning` /
`DEFAULT_GLASS_TUNING` identifiers, plus the `glass` boolean that selects the real material over
the clay diagnostic path.

⛔ **DELIBERATELY NOT RENAMED, and this entry exists so the name does not mislead the next
reader.** The file is imported by seven modules (`answer-card-canvas.tsx`, `answer-card-mesh.tsx`,
`nextstep-canvas.tsx`, and four `verify/` harnesses). **A rename is a mechanical change with no
behavioural payoff.**

⚠ **The `GLASS_*` constants are not all dead** — `GLASS_FILTER_TRANSMITTANCE`,
`GLASS_FILTER_STRENGTH`, `GLASS_CLEARCOAT` and `GLASS_CLEARCOAT_ROUGHNESS` are still consumed by
the face; the transmission set (`GLASS_TRANSMISSION`, `GLASS_THICKNESS`, `GLASS_IOR`) no longer
reaches it. **The name is wrong; the file is not dead.**

### ⚠⚠ WHY THIS ENTRY EXISTS AT ALL — the failure class, not the fact

**The material changed on 9 August. The record did not, for ten days.** D-028 stayed APPROVED with
no supersede note; CLAUDE.md's approved-layers list kept reading *"Frosted blue glass card material
(D-028)"*; and the only mention of satin anywhere in `decisions.md` recorded it as a *"leading
candidate at the close of the session, not chosen."* **All three were true when written. All three
were false by the time they were next read.**

⚠ **THIS IS THE SAME FAILURE CLASS ALREADY RECORDED IN `context-rules.md` → *Approved work is
amendable*:** a sentence that was true when written, outliving its subject, then **carried forward
as fact by the next reader.** D-046/D-048 are the worked case — a decision intact, uncontradicted,
and unsafe to act on because a fact it relied on had moved.

⚠⚠ **AND IT WAS ABOUT TO BE CARRIED FURTHER.** The approved-layers text was being used to build a
protected-file list. **The stale sentence would have become a protected description of a material
that no longer exists** — at which point the error stops being a stale note and starts enforcing
itself.

⚠ **THE COMPOUNDING DETAIL, worth keeping:** D-045 §8 records that in this codebase **the labels
name the CSS TECHNIQUE and the shadow stacks describe the OBJECT** — *"the WebGL card went
transmissive because a Builder read the label."* **`.enquiry-card` was never really describing
glass.** So "frosted blue glass" was an imprecise name for the CSS card, was then read literally
into a transmissive WebGL material, and survived in the record for ten days after that material was
discarded. **The same three words caused a wrong build and then a wrong record.**

### What D-028 keeps

⚠ **D-028's original wording is NOT rewritten** (P4 — dated entries keep their wording). It remains
the correct record of what was approved on **15 June 2026**, when the card was a **CSS** element:
gradients, inset shadows and an SVG filament border. **The face material it specifies is superseded
here. Its selected-state provisions are not** — the amber top-edge hairline lineage and the
filament border (D-029) are untouched by this entry.

### Files updated in the same change

`decisions.md` (this entry, and a supersede note on D-028), `CLAUDE.md` (the approved-layers line).
**No product code was changed and no file was renamed.**

---

## D-052 — The Question Number And Its Text Reveal As One Phrase

**Date recorded:** 2026-08-20
**Status:** APPROVED
**Authority:** Human Founder

### The decision

**The reveal wipe must cover the question NUMBER and the question TEXT as one phrase.**
Carl's terms: **one phrase, one wipe.**

*"Q5 What brought you here today?"* reveals as a **single left-to-right wipe** — not a number that
appears followed by text that wipes.

### ⚠ WHAT WAS FOUND — stated as fact, from the code and the history

**The number has NEVER been inside the wipe.**

`.enquiry-phrase-cue` is a **sibling span**, outside the `clip-path`'s scope
(`enquiry-opening.tsx`, the `.enquiry-phrase-qrow` block). The wipe is
`enquiry-mask-reveal-horizontal` — a `clip-path: inset()` animation carried by
`.enquiry-q-text-reveal`, applied **only** to `.enquiry-phrase-question`
(`globals.css`). `clip-path` clips the element it is set on and its descendants; a sibling is
outside its scope by construction. The cue carries **no `animation`, `clip-path` or `mask`**, and
no ancestor clips either — it simply appears.

⚠ **This has been true since the wipe was written.** At `0a1b04a`, the commit that introduced
`.enquiry-q-text-reveal`, the number was already a separate sibling outside the revealed element.
**No commit moved it out** — a search across the last 60 commits to `enquiry-opening.tsx` found no
version in which the number sat inside the reveal-classed element.

⛔ **THIS IS NOT A REGRESSION. It was never specified, and nothing in the record decided it either
way.** The behaviour is original, not drifted.

### How it was found

**Frame-by-frame review of the 25fps films** (`verify/out/reveal-stall/2026-08-19T21-37-45`), by
Carl, 20 August 2026.

⚠ **The control is what makes it solid.** On the same frames, the start-page heading *"Let's
understand what your business needs to become."* wipes visibly character by character — the L is
fast, but the travel of the E, T and S is clearly visible. **Same film, same capture rate, same
build.** So the absence of a wipe on "Qn" is **not an artefact of the 25fps sampling**: a
like-for-like comparison shows the wipe where it exists.

### ⚠ THE COUNTER-ARGUMENT — recorded because it is Carl's own, and overruled by him

**Commit `b233024` (28 July 2026), authored by Carl, states the opposite rationale:**

> *"Deliberately not full white. **The label is a locator, not content**, and the three-layer
> hierarchy from D-019 depends on it sitting under the question."*

**Carl has now ruled the other way: the number is part of the phrase, and reveals with it.**

⚠ **Both are recorded, and THE LATER RULING GOVERNS.** The July reasoning was sound when written
and is not being called mistaken — a design judgement is entitled to change. This is the
*overtaken*, not *superseded*, case in `context-rules.md`: the earlier statement is not withdrawn,
it is outranked. ⚠ **Note the two claims are about different properties** — `b233024` argues about
COLOUR and visual hierarchy; this entry decides REVEAL BEHAVIOUR. They are not in direct
contradiction, but the "locator, not content" premise points away from this decision, so it is
recorded rather than left for a future reader to rediscover as an apparent conflict.

### ⚠⚠ CONSTRAINTS THE IMPLEMENTATION MUST NOT BREAK — findings, not instructions

⛔ **The HOW is a separate chunk. No approach is proposed or endorsed here.** These are the
behaviours the current structure provides, enumerated per CLAUDE.md §5b so that whatever is built
states how each is preserved.

**1. `aria-hidden="true"` on the cue must survive.**
The cue span carries `aria-hidden="true"`. **"Q5" read aloud before the question is noise.**

**2. The cue's own colour and letter-spacing rules across SIX corridor depths must survive.**
`.enquiry-phrase-cue` has distinct `color` and `letter-spacing` at depths 0–5, including
**`rgb(214, 166, 77)` — the amber at receding depths.** ⚠ The white→gold transition at depth 1+ is
what marks a question as answered, and **D-029 derives the filament border colour from that gold
family** — an APPROVED layer.

**3. ⚠⚠ THE CLOCK-ZERO CONTRACT IS THE HIGHEST-RISK ONE.**
The question span's **`onAnimationStart` publishes the reveal's CLOCK ZERO** (`__revealStart`,
`__revealStartQ`) and is **a CONTRACT with `answer-card-canvas.tsx`, not a diagnostic** — its own
comment says so. It fires on `animationName.startsWith("enquiry-mask-reveal")`, and **only the
active phrase publishes.**

⚠ **Anything that moves where the animation fires puts that contract at risk.** **This is the same
failure class as the anchor-and-clock defects already on record** — the stale reveal anchor
(`ANCHOR-STALE`, `open-defects.md`) and the cross-question anchor bleed that made Q4's entrance
read Q5's clock from 8.2 seconds earlier on 4 of 6 runs.

### Observation — the colour change has no record entry

⚠ **`b233024` is recorded nowhere in `project-intelligence/`.** No `decisions.md` entry, no
`review-log.md` entry. It lives only in its **commit message and a CSS comment**.

⛔ **Stated as an observation only. No retrospective entry is created for it** — that is Carl's
call, not a gap to be filled by the Builder.

⚠ The nearest record entries — `decisions.md` D-024 and `review-log.md`, both **2026-06-14** —
concern **Q label SIZE, not colour**, and predate the colour change by six weeks. They were true
when written and remain true; they do not speak to this.

### Files updated in the same change

`decisions.md` (this entry). **No product code was changed.**

---

## D-053 — The Hover Teal Is A Legible State Change, Not A Colour Match

**Date recorded:** 2026-08-20
**Date the change landed:** 2026-08-20, commit `eba1287`
**Status:** APPROVED
**Authority:** Human Founder — **judged by eye**, on all five cards, with the light
passing over the text and after it had moved on, then re-judged on the baked default.

### The decision

**`LABEL_TEAL_STRENGTH = 1.7`** (`answer-card-mesh.tsx`), raised from 1.0.

⚠ **CARL'S EYE IS THE AUTHORITY FOR THIS VALUE, NOT THE ARITHMETIC.** No measurement
selected 1.7; he set it with `?tealstrength=` and approved what it looks like. The figures
below describe what that value renders — they do not justify it.

### ⚠⚠ WHAT THIS SUPERSEDES — the rail quotation, and it was Carl's own instruction

**The hover teal is NO LONGER a quotation of the rail's answer-line teal.**

The original instruction, quoted in place rather than rewritten — Carl, asked which teal:

> *"the same teal that is in the text in the rail system... It is the first teal, the answers
> lose their opacity as more questions are answered."*

and recorded at the time as *"the exact value is not negotiable: `rgb(160, 220, 218)`"*
(`live-work/architect-question-hover-teal.md`).

**Carl has now ruled the other way. The goal is a LEGIBLE STATE CHANGE, not a colour match.**

⚠ **BOTH STAND ON THE RECORD AND THE LATER RULING GOVERNS.** This is the *overtaken* case in
`context-rules.md`, not supersession by error: the earlier instruction was right for what it
was asked to do, and **is not being called mistaken.** ⛔ **No retrospective entry is written
for it** — it is quoted here as history, per the no-retroactive-rewriting rule.

⚠ **THE CONSTANT IS STILL THE RAIL'S TEAL. WHAT REACHES THE SCREEN IS NOT.**
`LABEL_INK_HOVER` remains `rgb(160, 220, 218)`; the shader extrapolates past it.

### Measured — before and after

Frozen-mask sampler, real GPU, production build, pixel count stable within each arm:

| | settled hovered | rendered RGB | px |
|---|---:|---|---:|
| **strength 1.0** (the quotation) | **27.4%** | `rgb(122,155,169)` | 402 |
| **strength 1.7** (Carl's value) | **79.4%** | `rgb(31,138,149)` | 455 |

The rail's own teal is 46.2% saturation, for reference. **The shipped default measures
identically to `?tealstrength=1.7` — 79.4%, `rgb(31,138,149)`, to the decimal** — so what
was approved by eye is what is baked in.

### ⚠⚠ WHY THE INK-COLOUR ROUTE IS CLOSED — recorded because it WILL be asked again

**Carl asked for the ink to be corrected instead of the dial raised**, so the file would not
enforce one value while describing another. **It was tried first and it cannot carry this.**

**`mix(a, b, t)` is `a + (b - a) * t`, and it does not stop at `b`.** At `t = 1.7` the shader
travels **70% BEYOND** the teal, away from the white it started at. **That is an
extrapolation, not a blend.**

⛔ **The equivalent ink at strength 1.0 needs a NEGATIVE RED CHANNEL** — `-0.1024` linear, at
every albedo tested from 0.3 to 2.0. **No colour can encode a negative channel.** Measured,
not argued:

| ink at strength 1.0 | settled hovered |
|---|---:|
| `rgb(0,190,186)` — the clamped equivalent | 68.1% |
| `rgb(0,255,250)` — a maximal cyan | **47.9% — still 31 points short** |

**So the dial is the only route, and raising the ink cannot restore the match.**

### ⚠ MEASURED CONSEQUENCE — the widened swing, recorded as a fact, NOT a defect

**The saturation swing as the light crosses the label widened from 8.7 points
(18.7–27.4%) to 21.5 points (57.9–79.4%).** The label changes appearance more as the light
passes over it than it did before.

⚠ **CARL APPROVED THE LOOK AT 1.7 WITH THE LIGHT MOVING**, so this is a known and accepted
property, not an open fault. It is recorded so a future reader does not rediscover it as a
regression.

### ⚠⚠ THE INSTRUMENT HISTORY — the most reusable thing here

**Three instruments measured this hover teal. Two produced confident, plausible, wrong
numbers.**

| # | what it did | why it was wrong |
|---|---|---|
| 1 | sampled the brightest 4% of a crop | it found the **card's RIM**, not the glyphs — near-white, no teal |
| 2 | gated on **luminance > 120** | as the card brightened, non-teal pixels **crossed the gate** and diluted the mean |
| 3 | **froze the glyph mask as fixed pixel POSITIONS** | trustworthy — see below |

⚠ **INSTRUMENT 2 IS THE INSTRUCTIVE ONE. It invented a phenomenon.** It reported a settled
**7.4%** and a "transient that decays within a second" — **neither existed.** The pixel count
rose 399 → 458 across the frames as the sample grew to include things that were never teal.
**A true number about the wrong pixels.**

⚠⚠ **AND A FOUR-WAY ATTRIBUTION WAS COMMISSIONED AGAINST THAT FALSE NUMBER.** It was stopped
**at its control**, which failed to reproduce 7.4% and measured 26.8% twice instead.
**THE CONTROL INSTRUCTION IS WHAT CAUGHT IT** — without "reproduce the figure before you
disable anything", four stages would have been disabled to explain a collapse that never
happened, and one of them would have looked like the answer.

**What makes instrument 3 admissible**, and the pattern worth reusing:

- **The mask is a fixed list of pixel INDICES, computed once and never recomputed.** Membership
  cannot change when the lighting does. It is also **eroded** to glyph cores, because
  antialiased rims carry the CARD's colour and made rest and hover read identically.
- **Negative control** — pointed at an empty region it reports **"NO GLYPHS FOUND ... an
  ABSENCE, not a zero"** and exits non-zero, with a floor of 100 px.
- **Red run, both directions** — `?tealstrength=0` collapses the teal, `?tealstrength=4` drives
  the glyph magenta at G−R **−106**, and the sampler reports each.
- **Stability** — 402 px identical across 60 frames while luminance swings 29 points.

⛔ **It lives in the scratchpad and is NOT in `verify/`.** It is not a proven instrument under
`verify/proven.json` and must not be cited as one.

### Files updated in the same change

`decisions.md` (this entry). **No product code was changed** — the code landed in `eba1287`.

---

## D-054 — Measurement For The Derived, Judgement For The Felt

**Date recorded:** 2026-08-20
**Date the change landed:** 2026-08-20, commit `87919f8`
**Status:** APPROVED
**Authority:** Human Founder — **judged by eye.** No measurement selected 250.

### The decision

**`ACK_LEAD_MS = 250`** (`enquiry-opening.tsx`). The "Understood." fade and the send
button both begin **250ms earlier**.

**What Carl saw:** cards 1 2 3 4, then a small *wait* before the fade began. **That wait
is gone; the sequence flows.** Arithmetic is in `87919f8` and not repeated here.

**`?acklead=` remains a live tuning door**, so the value can be re-judged on a running
build without a rebuild.

### The ripple — the gap is now structurally held

Both tail elements carry the **same** lead, so the **500ms of dead space** between
"Understood." leaving and the send button arriving is preserved at every value of
`ACK_LEAD_MS`.

⚠ **THIS IS AN IMPROVEMENT ON WHAT WAS THERE, NOT JUST A PRESERVATION.** The gap was
previously **emergent** — the difference between two independently hand-entered numbers,
with nothing holding it. **It could have widened without anyone touching it**, simply by
one of the two moving. It is now a consequence of one constant.

### ⚠ CORRECTION — the occlusion guard never did what its comment implied

The comment on `ACK_FADE_OUT_DELAY_MS` read as though the fade **waited for the boxes**.

⛔ **IT NEVER DID.** At the original timing the fade began at 6700ms with **boxes 2, 3 and
4 still arriving** — 86.7%, 70.0% and 53.3% faded in. Only box 1 had settled.

**What it actually guarantees is that "Understood." is GONE before the LAST box SETTLES.**
That still holds at 250: the fade ends at **7850ms**, box 4 settles at **8100ms** — a
250ms margin where there was previously none. ⚠ **The move is EARLIER, which is the safer
direction for occlusion**, not a relaxation of it.

⛔ **The original comment's history is not rewritten.** It was true about the *intent* and
imprecise about the *mechanism*; the correction is recorded here and in place.

### ⚠⚠ THE PRINCIPLE — the reusable part, and the reason behind Carl's 30 July instruction

**Some values must be EXACT because something is derived from them. Some only need to be
in the PERCEPTIBLE VICINITY.**

**Carl's framing, from quantisation:** at 120BPM, a request to drop to **118** is
pointless — *the ear cannot perceive it*, and believing it can **costs hours on a change
that isn't there.** So a feel value is hand-entered and judged by eye, and **measuring it
below the resolution of the judgement is wasted work.**

⚠ **AND THE COUNTERPART, WHICH IS THE OTHER HALF OF THE RULE: THE EYE CANNOT PICK BEZIER
CONTROL POINTS.** Hand-chosen control points measured **0.113** against a reference; a
fitted curve measured **0.011** — an order of magnitude better, and not recoverable by
looking harder.

> ### MEASUREMENT FOR THE DERIVED. JUDGEMENT FOR THE FELT.
> ⚠ **The error is using either where the other belongs** — and both directions cost. Eye
> on a derived value is imprecision that compounds downstream; instrumentation on a felt
> value is hours spent resolving a difference nobody can see.

⚠ **THIS IS THE REASON BEHIND CARL'S 30 JULY 2026 INSTRUCTION, NOT A NEW RULE.** That
instruction — *"break them apart and not have them so reliant on proportion and ratios...
We will judge it by eye and input the numbers"* — is recorded in
`contact-field-canvas.tsx`. **It is this principle applied to the completion tail**, and
the tail's values are hand-entered because they are felt, not because derivation failed.

⛔ **SO DO NOT "IMPROVE" `ACK_LEAD_MS` BY DERIVING IT** — from a fifth beat, a stagger
constant, or the box interval. Its correctness is Carl's eye, and a derivation would move
it out of reach of the only instrument that can judge it.

⚠ *The bezier figures above are from the working session, not from a prior
`project-intelligence/` entry — recorded here for the first time.*

### Files updated in the same change

`decisions.md` (this entry). **No product code was changed** — the code landed in `87919f8`.
