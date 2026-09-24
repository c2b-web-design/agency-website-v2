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
**Status:** APPROVED — ⚠ **the schema stands; the COMPLETION CONDITION is amended by D-057 (23 August 2026).** See the marker below.

> ⚠⚠ **AMENDED BY D-057 — CARL, 23 AUGUST 2026. The clause above making a documentation file a condition of completion no longer holds.**
>
> ⛔ **"DONE" NOW MEANS CARL HAS CONFIRMED THE ELEMENT BY EYE — his listen-back, in the DAW sense — and his verdict is recorded.** D-057 carries the reasoning, the scale for reading a verdict, and what replaces the doc; **it is not restated here.**
>
> **What this entry KEEPS:** the schema in `components/_component-template.md`, the rationale above, and the two documents written to it. ⛔ **D-009 is NOT deprecated.** Only the *"a component without a documentation file is not considered complete"* clause is replaced.
>
> ⚠ **D-009 WAS NOT WRONG.** It was followed for two components in the project's first month and **the practice moved on** — the reasoning behind the change is in D-057, and this is an amendment, not a fault.
>
> ⚠ **THE PROPAGATION IS COMPLETE — 23 August 2026, commits `5298916` and `8bee6e9`.** ⛔ **No surviving site requires a component doc**, confirmed by sweep. **The mid-correction warning this marker carried until then no longer applies.**
>
> ⚠ **It read:** *"Eleven downstream sites still require the component doc… if one of them contradicts this marker, D-057 wins."* **True when written; false within hours.** Kept as the record of the interval. D-057 still wins, and now nothing contradicts it.

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
- ⛔ **DEVICE AND VIEWPORT COVERAGE, SITE-WIDE** *(added 31 August 2026 — see the amendment below)*. The site is built in **one medium first** on Carl's instruction; optimising for all devices happens in this pass. ⚠ **A layout that works at 1440 and not at 375 is provisional, not broken.** Known: no nav below `md` on `/start` or `/about`; nothing in this repo has ever been measured above 1920.

**What mastering will involve:** balance, tempo, brightness, contrast, emphasis, breathing room and emotional flow across the whole site — the same list the ethos files already give. **Files will be written to during the pass**, so the record must be clean going in. Values settled in the pass graduate from `PROVISIONAL` to `APPROVED` with an entry.

> ⚠⚠ **AMENDED 31 AUGUST 2026 — MASTERING INCLUDES OPTIMISING FOR ALL DEVICES, AND THE SITE IS
> BUILT IN ONE MEDIUM FIRST BY DESIGN.**
>
> **Carl:** *"At the end of construction there will be a 'mastering' phase where we will fine tune
> and also optimise for all devices."* And on why not sooner: *"we could of optimised for mobile
> while building but that would of slowed the process down. Its right that we should get the site
> built in one medium first before optimising for others."*
>
> ⛔ **THE LIST ABOVE STOPS AT EMOTIONAL FLOW AND SAYS NOTHING ABOUT VIEWPORTS.** ⚠ **That silence
> was read, on 31 August, as mobile being an unscheduled gap — and the Builder began writing it up
> as a separate "mobile optimisation pass" before Carl corrected it. ⛔ There is no such pass. It is
> this one.**
>
> ⚠⚠ **SO DEVICE COVERAGE IS `PROVISIONAL`, NOT MISSING.** A route that works at 1440 and not at
> 375 is **in place, deliberately untuned, awaiting this pass** — the same standing as the
> provisional gold on `/about` or the landing page's stale copy. ⛔ **Reviewers: do not raise it as a
> defect, and do not "fix it while passing".**
>
> **The reasoning, and it is the same argument as the rest of this entry.** ⛔ **Optimising while
> building means every layout decision is made TWICE — and the second time against placeholders that
> are going to change.** ⚠ **You cannot balance a mix that does not exist yet; you equally cannot
> balance it across four widths while its content is still provisional.** **One medium first is
> tracking; all devices is mastering.**
>
> ⚠ **"ALL DEVICES" IS WIDER THAN MOBILE.** ⛔ **This site has been judged at 1440 and 1920 only.**
> Carl also walks it on a **4K TV** for ballpark spatial decisions — a surface no measurement in
> this repo has ever covered. `Container` is `max-w-7xl` (1280px), so at 4K the content occupies a
> third of the screen; that is a mastering question, not a defect.
>
> ⛔ **KNOWN AND CARRIED INTO THE PASS, so it is not rediscovered:** below `md` neither `/start` nor
> `/about` has any nav or menu button — the links are `hidden md:flex` after a measured collision
> with the mark at 375px. `site-header.tsx` **does** have a mobile route, so the site currently has
> one mobile nav pattern and two routes with none. See `live-work/run-log-start-header-31-august.md`.

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

> ### ⚠⚠ THE BACKUP IS GONE — 23 AUGUST 2026. ONE FILE SURVIVES, IN THIS REPOSITORY
>
> **Carl's ruling, 23 August 2026:** GSD belonged to **V1** of the website and turned out not to be the right way to go, so the residual toolkit was deleted. ⛔ **266 of the 267 files were removed — 2,720,154 bytes — and the path above no longer exists.**
>
> ⚠ **The line above is deliberately unchanged (P4 — dated entries keep their wording).** It remains the correct record of where the backup stood on **27 July 2026**, which is what the entry was written to attest.
>
> ⛔ **THE ONE FILE THAT SURVIVES, BY ITS NEW PATH:**
>
> **`project-intelligence/evidence/settings-before-gsd-removal-2026-07-27.json`** — **2,891 bytes**, SHA-256 `7c3c3413671f0fe07e86a12b4feb979dd1033b7f6b9f686a4c290ec948bffa0e`.
>
> **It is the source of the nine-registration table above**, and it is the **sole surviving copy** — global settings live at `~/.claude/settings.json`, outside this repository, and were never version-controlled. **Not reconstructible.**
>
> ⚠ **Why it moved.** Its previous home was a folder named `gsd-removal-backup-2026-07-27` holding **one file** — a name a future cleanup reads as residue, with nothing at that location saying otherwise. **In the repository it is on the remote, in the diff, and beside the entry that cites it.** ⚠ **`evidence/README.md` records what depends on it.**
>
> #### ⛔⛔ WHAT CAN NO LONGER BE CHECKED — AND THIS IS THE POINT OF THE CORRECTION
>
> **This entry says its counts were *"verified against the backup, not recalled"*. ⛔ That verification cannot be repeated for four of the five figures.**
>
> | Claim | Standing now |
> |---|---|
> | **246** files in `get-shit-done/` | ⚠ **assertion** — the files are gone |
> | **12** hook scripts (9 `.js`, 3 `.sh`) | ⚠ **assertion** — the files are gone |
> | **6** skills | ⚠ **assertion** — the files are gone |
> | **267** files total | ⚠ **assertion** — the folder is gone |
> | **9** hook registrations | ✅ **VERIFIABLE** — the source was kept |
>
> ⚠ **Their honest standing is ATTESTED, NOT FALSIFIABLE.** The counts were verified against the backup **twice** — on **27 July 2026** when this entry was written, and again on **23 August 2026** immediately before the deletion — and **matched exactly both times.** ⛔ **But nobody can repeat it a third time.**
>
> ⛔ **THE NINE-REGISTRATION TABLE IS THE ONE CLAIM THAT REMAINS VERIFIABLE, AND THAT IS EXACTLY WHY ITS SOURCE WAS THE FILE KEPT.** ⚠ **It is also the claim that most needed keeping:** this entry records the registrations precisely *because the first written account of them was wrong in two places*, and `ai-system/live-work-protocol.md` §3b rests on the same file for a governance rule about deferral — not merely a file count.
>
> ⚠ **Stated rather than left implicit, because an entry implying all of it can still be checked would be the overstatement this week has been correcting.**

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
**Status:** ⛔ **CLOSED 23 August 2026 by Carl — SUPERSEDED, NOT FAILED. The mechanism is gone
from the build.** This line previously read *"APPROVED by Carl's eye — "it looks pretty clean".
Implemented, commit `3a7cf1f`"*, and is kept because **the promotion in those words is itself
part of what was ruled on** — see the closure below. Implemented, commit `3a7cf1f`.
**Supersedes nothing. Constrains D-022/D-023/D-024 only in that it did NOT touch them.**

> ### ⛔ CLOSED — CARL, 23 AUGUST 2026. Two rulings: the mechanism, and the status word.
>
> ⚠ **This supersedes the "the overlap fix in this entry stands and is unchanged" line in the
> marker below, which was true on 11 August and is not true now.**
>
> #### 1. THE MECHANISM IS GONE — ⛔ SUPERSEDED, NOT FAILED
>
> `WARMUP_OVERLAP_MS` and `warmupHeldOver` are **removed from the build**. Verified in code, not
> from documents: no live reference to either remains in `components/enquiry/`; four tombstone
> comments stand in `enquiry-opening.tsx` as the record of why the overlap existed.
>
> ⛔ **IT WAS NOT REMOVED BECAUSE IT DID NOT WORK. The overlap improved the reveal.** What
> removed it was **D-048's shared host making it unnecessary** — one context that never unmounts
> leaves nothing to hold over. The tombstone states exactly that: *"WITH NO WARM NODE THERE IS
> NOTHING TO HOLD OVER."*
>
> ⚠ **THE 161ms / 919ms MEASUREMENT IS KEPT AS REFERENCE, DELIBERATELY.** It was a real
> measurement and may be useful if a similar problem emerges. **Its ANGLE attribution is
> separately contested — see the marker on D-048.**
>
> ⚠ **TRAP: `CARD_OVERLAP = 0.72` (`answer-card-geometry.ts`) IS LIVE AND UNRELATED.** It governs
> the card ladder's stagger, not the warm-up hold-over. **A reader sweeping for "overlap" will hit
> it. It is not this.**
>
> #### 2. THE STATUS WORD OVERSTATED THE QUOTE — AND THE BODY ALREADY SAID SO
>
> The status read **APPROVED**, on the quote *"it looks pretty clean"*. ⛔ **On Carl's own scale,
> given 23 August 2026: a vague phrase like that means IMPROVED BUT NOT FINISHED. "Good" means
> approved. Effusive praise means it exceeded expectation.** ⚠ **The words are his; the status was
> a promotion of them.**
>
> ⚠⚠ **AND THIS ENTRY HAS CONTRADICTED ITSELF SINCE 9 AUGUST.** Its own body says *"NOT
> ELIMINATED, AND NOT RECORDED AS FIXED. ~70ms still lands in the wipe… Carl's eye accepted it;
> the residue is real."* ⛔ **The status line is the half a reader meets first**, and it said the
> opposite of the paragraph below it for a fortnight.
>
> #### 3. WHERE THE REVEAL ACTUALLY REACHED SATISFACTION — ⚠ AND IT IS NOT RECORDED
>
> **D-046 is ONE STEP IN A CHAIN, not the step that settled the reveal.** Carl's account,
> 23 August: the Q stall exposed several problems, the card overlap being one of them. **The card
> reveal reached his satisfaction later, improved by a compressed reversal** — the card exit,
> built **18 August 2026, commit `c831bf9`**; spec at `live-work/card-exit-spec-16-august.md`.
>
> ⛔ **NO DECISION ENTRY COVERS THE CARD EXIT, AND NO VERDICT FROM CARL ON IT IS RECORDED
> ANYWHERE** — not in `decisions.md`, not in `reviews/review-log.md`, not in any commit message or
> live-work file. **Swept 23 August 2026.** ⚠ **So this pointer names where the work happened, not
> a documented successor. There is no documented successor.** That gap is known and is its own
> task.

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
**Status:** APPROVED as a record. ⚠ **THE SHARED HOST IS AUTHORISED AS BUILT — Carl, 23 August
2026.** This line previously read *"The restructure itself remains UNAUTHORISED pending Carl's
explicit word"*, and is retained here because it is what the record said while the host was
built and for nine days afterwards. **Authorised by:** the ruling below.

> ⚠⚠ **THE AUTHORISATION — CARL, 23 AUGUST 2026. Read the second half: this is a judgement
> made on 23 August, NOT a recovered memory of 12 August.**
>
> **The shared card host is authorised as built.** It was built 12–14 August 2026, commit
> `1e031cd` — *"the shared card host — one context, positioned from the grid's viewport rect"*
> — and the code cites D-048 as its authority in **17 places** across two files.
>
> **Carl's reasoning, in his own words:** the work was technical, so he takes it that it was
> explained to him and that he gave his authorisation — and if he had wanted to clarify his
> understanding he would have asked for a simpler explanation. He adds that if the
> implementation had not worked, or had surfaced new information, he would have given
> permission for that too. **He takes responsibility for the decision on that basis.**
>
> ⛔ **NOBODY CAN POINT TO THE MOMENT OF AUTHORISATION ON 12 AUGUST, AND THIS ENTRY DOES NOT
> CLAIM ONE.** The ruling is dated 23 August because that is when it was made. **An entry that
> stated a moment nobody can evidence would be the exact fault this correction exists to
> repair.**
>
> ⛔ **THIS RULES ON AUTHORITY, NOT ON THE IMPLEMENTATION.** It says nothing about whether the
> shared host works, and nothing about D-046's standing — a separate ruling, still pending.

> ### ⚠⚠ THE DEFECT THIS EXPOSES — LIVE, NOT TIDIED AWAY
>
> ⛔ **THE STATUS LINE WAS NOT THE FAULT. THE AUTHORISATION NEVER REACHED THE ENTRY.**
>
> The work went ahead, the code recorded D-048 as its authority in 17 places, and **the
> decision record was never updated.** For nine days the canonical record said UNAUTHORISED
> while the build said otherwise — and the source of truth is the record, so anyone reading it
> would have been correctly informed and factually wrong.
>
> ⚠ **NOTHING CURRENTLY REQUIRES AN AUTHORISATION TO BE WRITTEN BACK WHEN CARL GIVES IT.** No
> gate, no checklist step, no harness. **This can happen again tomorrow, and the next instance
> will look exactly as ordinary as this one did.** Amending this entry does not close it.

> ⚠⚠ **ONE BULLET BELOW IS OVERTAKEN — *"The warm-up must not be deleted"*, in *WHAT REMAINS
> TRUE FROM D-046 AND MUST NOT BE LOST*.**
>
> ⛔ **SCOPE: THAT BULLET ONLY.** The rest of this entry is unaffected — Ground 1 and Ground 2
> stand as written, and **Ground 3 is still binding and still the whole of the constraint.**
> The other three bullets in that list are untouched.
>
> **Three separate things overtook it, on two dates. They are recorded apart because they are
> not the same objection.**
>
> **1. THE INSTRUCTION — overtaken 18 August 2026.** The warm-up canvas **was deleted**, commit
> `98429af`. **The freeze survived the deletion** — the second context and the redundant second
> link of all 17 programs went, and the median did not move. Run as a measured experiment, not
> as a fix. Full record: `live-work/step5-warmup-deletion-18-august.md`.
>
> **2. THE MECHANISM — contested since 13 August 2026.** Whether ANGLE's **on-disk** cache is
> what produces the gap. `live-work/q5-stage1-resolution-and-cache-13-august.md` §FINDING 2
> reproduces **both halves** (106ms vs 1353ms) and finds disabling the disk cache costs **53ms
> with** the warm-up and **nothing at all without** it. ⚠ **The gap is real; the attribution to
> the disk cache is what is disputed.**
>
> **3. THE MAGNITUDE — a separate question from 2, and not a smaller number.** ⛔ **This is NOT
> "758 should read 53".** The ~53ms is what the **disk cache** is worth; the gap that work
> measured is **~1250ms — larger than ~758ms — and attributed elsewhere** (its own candidate is
> marked a guess). **The gap outlives its explanation.**
>
> ⚠ **CONTESTED, NOT SETTLED, AND NOT ADJUDICATED HERE — that is Carl's.** The 161/919
> measurement is not withdrawn. **This marker says nothing about whether deleting the warm-up
> was right**, and nothing about D-046's standing or this entry's Status.

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

> ### ✅ OBSERVED AND GOOD — 20 August 2026. This constraint is CLOSED.
>
> **Carl walked the current build and looked at the receding-depth amber directly. It is
> correct.**
>
> ⚠ **This closes the "structurally safe but unobserved" caveat** carried at implementation.
> The implementation commit (`d731c1c`) recorded the amber as verified only by reasoning —
> `globals.css` untouched, the depth rules being descendant selectors on an unmoved element —
> because the probe failed to advance the corridor and never saw it. **It has now been seen on
> the running build. Reasoning and observation agree.**

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

---

## D-055 — The Begin Button Is Gated By The Opening, And That Is The Design

**Date recorded:** 2026-08-21
**Date the change landed:** No code changed. This entry rules on existing behaviour.
**Status:** APPROVED
**Authority:** Human Founder — **judged by eye on the production build, 21 August 2026.**

### The decision

**The Begin button on `/start` is not meant to be immediately clickable.** The radial
reveal is correct as it is, **and so is its gating of clickability.** Carl walked a clean
production build today and ruled on it directly.

⛔ **THIS CLOSES THE STANDING DECISION OF 27 JULY 2026** that the opening delay was *"the
first job when building resumes"*. **Closed, not deferred.** The desktop and mobile values
do not need separate answers — they do not need an answer at all.

### ⚠⚠ THE MECHANISM IS APPROVED, NOT TOLERATED

The hit target activates on the radial mask's `animationstart`. **That animation is last in
the sequence, so the button becomes usable at the end of the opening.** Mechanism recorded
in `live-work/enquiry-opening-timing-reference.md` — cited, not repeated here.

⚠ **A LATER READER WILL FIND THIS GATING AND RECOGNISE IT AS THE "CLICKABILITY IS WELDED TO
THE VISUAL CLOCK" DEFECT** described at that reference. **It is the same mechanism. It is no
longer a defect.** The description there is accurate; the classification is what this entry
changes.

⛔ **DO NOT UNWELD IT. DO NOT DECOUPLE THE HIT TARGET FROM THE MASK. DO NOT SHORTEN THE
DELAY TO MAKE THE BUTTON AVAILABLE EARLIER.** Any of those is a change to approved work and
needs Carl.

### The 27 July analysis was not wrong about the facts

**It measured correctly and described the mechanism correctly.** The timings, the
`animationstart` coupling, and the desktop/mobile split are all accurate as recorded.

⚠ **What it got wrong was calling it a defect** — a judgement about intent, not a
measurement. **The record is not written off as an error**, and its numbers remain the
reference for this behaviour.

### ⚠⚠ WHY THIS CLOSURE SHOULD HOLD WHERE THE 28 JULY ONE DID NOT

**The 28 July closure said the button was "fixed".** That is a **claim about the present** —
it decays, and **anyone could refute it by loading the page and still seeing the delay.**
That is exactly how the item returned on 19 August.

> ### ⚠ A CLOSURE THAT IS A CLAIM ABOUT THE BUILD CAN BE REFUTED BY THE BUILD.
> ### A CLOSURE THAT IS A DESIGN DECISION CANNOT.

**This closure is a design decision.** Observing the delay confirms the design; it does not
contradict it. **Seeing the button gated is not evidence that this entry is stale.**

### The measured state — the shape of the approved design, not a defect report

Observed 21 August 2026 on a clean production build (`rm -rf .next`, rebuilt, `next start`),
animated path, non-reduced-motion:

| Viewport | Gate lifts | Declared |
|---|---:|---:|
| Desktop 1440×900 | **+7711ms** | 7400ms |
| Mobile 390×844 | **+10259ms** | 10100ms |

At the flip, `pointer-events` → `auto`, `tabindex` → `0`, `aria-disabled` removed, together.
Before it, the button is **fully opaque and visible** while the hit target is inert.

**Reduced motion is unaffected — the button is usable at once.** That path is not gated and
this entry does not change it.

⚠ *These figures describe the approved design. They are **not** a defect measurement and
must not be cited as one.*

### ⚠ WHAT THIS DOES NOT COVER

**This rules on clickability gating only.** It says nothing about:

- the reveal's **appearance**
- the **reading-speed overlaps** recorded in `live-work/enquiry-opening-timing-reference.md`
- **anything else** in the opening sequence

⚠ **Silence here is not approval of those.** They are untouched by this decision.

### Files updated in the same change

`decisions.md` (this entry). **No product code changed, and no other record amended** —
`open-defects.md`, `current-sprint.md` and the timing reference are separate tasks.

---

## D-056 — The Cards Leave As A Compressed Reversal, Because They Have Done Their Job

**Date recorded:** 2026-08-23
**Date the change landed:** 2026-08-18 — commits `d008b4d`, `c831bf9`, `387653a`
**Status:** APPROVED
**Authority:** Human Founder — **the reversal was Carl's own idea**, and his verdict on the
built result, given 23 August 2026: *"I am more than happy with how it turned out."* ⚠ **On
Carl's scale that is the top level — beyond approval, not at it.**

### The decision

**The answer cards leave as a compressed reversal of their arrival.** The departure keeps the
arrival's *shape* and plays it faster: same `CARD_OVERLAP`, same three strands, reversed
order, roughly a quarter of the duration.

⚠ **THE ASYMMETRY IS THE DESIGN, NOT A CONCESSION.** In Carl's terms:

> **On arrival the ladder is slower because the user has to examine the questions. On next
> step the answers have done their job, so it is a better design decision to move on a little
> faster.**

⛔ **IT IS DERIVED FROM WHAT THE USER IS DOING AT EACH MOMENT.** It is **not** a performance
concession and **not** a compromise forced by the timings. ⚠ **A future reader seeing ~425ms
out against 2000ms in could easily try to "correct" it back toward symmetry. Do not.** The
gap between the two numbers is the decision.

Carl's reasoning at the time, in his words: ⛔ ***"its done its job."***

### ⚠ How it was arrived at — the sequence, because nothing in the repo carried it

1. At one point the cards left **all together, simultaneously and abrupt.**
2. The original design called for them to **fade out.** That was implemented.
3. ⚠ **Carl then asked about reversing the effect. The reversal was his idea.**
4. He was told it would **not be an exact mirror** — the timings would change.
5. He accepted that: ⛔ **as long as the choreography was there, he was happy.**

### The mechanism

**As built** (`answer-card-geometry.ts`), against the entrance it reverses:

| | Entrance | **Exit** |
|---|---:|---:|
| per-card duration | 2000ms | **425ms** (`CARD_EXIT_DURATION_MS`) |
| gap between cards | 560ms | **119ms** (`CARD_EXIT_GAP_MS`) |
| total span | 4240ms | **901ms** (`CARD_EXIT_END_MS`) |
| overlap | 0.72 | **0.72 — preserved** |

⚠ **425ms IS THE ONE CHOSEN NUMBER; EVERYTHING ELSE DERIVES FROM IT AND FROM `CARD_OVERLAP`.**
The gap is `round(duration × (1 − overlap))`, the ladder is `(4 − i) × gap`. **PROVISIONAL under
D-035 — Carl tunes by eye.** ⛔ **If the gesture reads wrong the correction belongs in the
duration or the overlap. Do not hand-type a ladder to compensate.**

⚠ **THE SPEC'S FIGURES WERE CANDIDATES AND WERE TUNED DOWN.**
`live-work/card-exit-spec-16-august.md` §3.1 proposed ~500ms / ~140ms / ~1060ms and marked them
*"CANDIDATE, NOT SETTLED"*. **The built values are 425 / 119 / 901.** The proportions are
unchanged; only the compression factor moved.

- **Stagger — card 5 first.** It unwinds: last to arrive, first to leave, **5 → 4 → 3 → 2 → 1**.
- **All three strands reversed** — opacity 1 → 0, `position.y` 0 → **−10px**, scale 1.0 → 0.94.
  ⚠ **The rise becomes a FALL, not a retrace.** The card continues its direction of travel and
  accelerates away on a cubic ease-**in**; it does not return to +10px.
- **The button leaves first, then the cards.** The Next step button is not part of the arrival
  ladder, so it is not mirrored into the departure one.

### ⚠⚠ What it fixed — the substantive change is ORDERING, not smoothness

Measured before: the cards extinguished at **~1341ms** while the next question's reveal began at
**~1153ms** — ⛔ **the departure was landing on top of the arriving text, 188ms into it.**

Measured after, 1440×900 production:

    departure order   card 5 → 4 → 3 → 2 → 1
    mean gap          151.8ms
    last card dark    876ms
    reveal begins     1152ms          vacates 276ms early

**The premise is that one thing vacates and the next arrives into the space it left.** That
ordering is functional in this corridor, not aesthetic.

### ⚠ The recording fault, stated plainly

The spec was written 16 August under a header reading **"SPEC. NO CODE. NOT AUTHORISED TO
BUILD"**; the work went in **two days later**; and **no decision entry and no recorded verdict
existed for five days** — swept 23 August across `decisions.md`, `reviews/review-log.md`, commit
messages and `live-work/`, and found nowhere.

⛔ **THE WORK IS FINE. THE RECORD WAS THE FAULT.**

⚠ **This is the second instance of the write-back gap recorded at D-048** — see that entry's
closure marker. **This entry does not close that gap.** Nothing yet requires an authorisation to
reach the record when Carl gives one.

⚠ **AND THIS ENTRY IS NOT THE D-048 CASE.** D-048's authorisation was reconstructed as a
judgement made on 23 August, with no moment anyone could point to. **This one is recalled:**
Carl remembers the conversation, the reversal was his own idea, and the sequence above is his
account of it.

### What this entry does not cover

**The card exit only.** It says nothing about the entrance ladder's own timings, the corridor
step, or the reveal it vacates for.

---

## D-057 — "Done" Is Carl's Listen-Back, Not A File On Disk — D-009 Amended

**Date recorded:** 2026-08-23
**Status:** APPROVED
**Authority:** Human Founder — ruled 23 August 2026, after a sweep found D-009's schema followed for **two components of sixteen**, both in the project's first month, neither updated since.
**Amends:** **D-009** (Component Documentation Schema Adopted, 2026-05-23), whose completion condition is replaced. ⚠ **D-009 is not DEPRECATED and its schema is not withdrawn** — what changes is that a component doc is no longer what makes a component complete.

### The decision

⛔ **A component is complete when Carl has looked at the element and visually confirmed it looks correct — and that verdict is recorded.**

**Carl's own terms, and they are the substance of this entry:** *"done" means he has looked at the element and visually confirmed it looks correct — **the same way, in a DAW, he would listen back.*** ⛔ **The listen-back is the completion condition.** Not a file existing. Not a checkbox ticked.

**Where the verdict is recorded:**

- **The reasoning** — a `decisions.md` entry.
- **The binding constraints** — load-bearing comments in the code, next to what they constrain.
- **A measurement record in `live-work/`** where one applies.

⛔ **THE COMPONENT-DOCUMENTATION REQUIREMENT IS RETIRED.** A component without a file in `project-intelligence/components/` is **not** incomplete.

⚠ **A REVIEW ENTRY IS ONE PLACE THE VERDICT MAY LIVE — NOT A SEPARATE REQUIREMENT.** The evidence is the record's own: **D-047, D-051, D-052, D-053 and D-055 have no review-log entry**, and every one was judged by Carl's eye. Their verdicts sit in **Authority lines and entry bodies** instead. ⛔ **The log was not the place. The verdicts were still there** — which is the distinction this clause turns on.

### ⚠⚠ RECORD THE VERDICT AT THE LEVEL IT WAS GIVEN — DO NOT PROMOTE IT

**Carl's scale:**

| What he says | What it means |
|---|---|
| A vague phrase — *"it looks pretty clean"* | ⚠ **IMPROVED BUT NOT FINISHED** |
| *"Good"* | **Approved** |
| Effusive praise | **It exceeded expectation** |

⛔ **D-046 RECORDED *"it looks pretty clean"* AS APPROVED. That promotion is the failure this clause exists to prevent** — the words were Carl's, the status was not what they meant, and the entry's own body said *"NOT ELIMINATED, AND NOT RECORDED AS FIXED"* four paragraphs below it. **Quote the verdict; do not upgrade it.**

⚠ **NEW, NOT YET THE PRACTICE — Carl, 23 August:** where his phrase is vague he will add a fuller explanation of where the work has got to and what *"good"* would look like. **This is a commitment made today, not a description of what has happened, and it is labelled as such.**

### ⚠ THIS IS A DESCRIPTION, AND THAT IS THE POINT

**D-009 and Rule 7 wrote down an intention as though it were a description.** The result: **2 of 16 components documented — about 12% — over three months**, both docs from the first month and neither maintained. **A rule nobody completes is not a rule.**

**Everything in "The decision" above except the labelled clause is already what this project does.** The decision entry, the code comments and the `live-work/` record are how D-046 through D-056 were handled. ⛔ **Nothing here is being introduced.**

### ⛔ THIS ENTRY HAS NO HOLDER, AND SAYS SO ON ITS FACE

Per the standing ruling that a rule gets a holder where one is possible and states plainly where none is:

| | Holdable? |
|---|---|
| Does a decision or review entry exist for a given number | ✅ A file read — mechanisable today |
| Is the next `D-###` / `R-###` correct and non-colliding | ✅ Mechanisable — **and would have caught an R-number error made on 23 August 2026** |
| ⛔ **Did the verdict get written down at all** | ❌ **NOT MECHANISABLE with the events in use** |

⚠ **The blocker is the trigger, not the check.** Both hooks are `PreToolUse` — they fire on **an edit happening**, and the failure mode here is **an edit that never happens.** A `PreToolUse` hook cannot fire on an absence. Catching *"work landed and no verdict was recorded"* needs a session-end or commit-time event; **only `PreToolUse` is configured.**

⛔ **SO THIS RULE RELIES ON SOMEONE REMEMBERING, AND THAT IS STATED RATHER THAN IMPLIED.** It is the same gap recorded at **D-048** — nothing requires a record to be written back when Carl gives a verdict. **This entry does not close it.**

### ⚠ WHAT THIS ENTRY DOES NOT DO

**It deletes nothing in `project-intelligence/components/`.** `_component-template.md`, `container.md` and `enquiry-opening.md` stand.

⚠⚠ **AMENDED 23 AUGUST 2026 — THE ELEVEN SITES ARE DONE.** ⛔ **This section read "IT DOES NOT AMEND THE ELEVEN LIVE SITES THAT STILL REQUIRE THE DOC… until each is corrected, it still requires the component doc." That was true when written and false within hours.**

**Closed by two commits, both 23 August:** `5298916` — the **five instructing sites** (Rule 7, amended in place with its number kept; two session-end steps; the Deliverables checkbox; the bundled trigger row). `8bee6e9` — the **ten descriptive sites**, ⚠ **two of which proved to be instructions on inspection** (`design.md`'s completion promise and the Builder's duty in `ai-roles.md`) and were handled as such.

⚠ **THE TABLE IS KEPT, NOT DELETED** — it is the record of what had to be reached, and the next propagation job will want its shape.

| File | What required it — ✅ all amended |
|---|---|
| `ai-system/context-rules.md` | **Rule 7** (the restatement); Status table rows PROVISIONAL and IMPLEMENTED; File Integrity *"every component doc references the review entry"*; Session Protocol read-list and session-end step |
| `ai-system/handoff-protocol.md` | Deliverables checkbox; report template line; session-end step 3 |
| `ai-system/prompt-protocol.md` | *"New component built → `components/{name}.md` (create)"*; two task read-lists |
| `ai-system/ai-roles.md` | The Builder's duties — *"updates sprint and component docs"* |
| `ai-system/live-work-protocol.md` | Component docs named as a permanent destination (twice) |
| `design-system/design.md` | *"Receive a documentation file in `/project-intelligence/components/` upon completion"* |
| `architecture/system-architecture.md` | The directory tree entry |

⛔ **DO NOT RENUMBER ANY RULE WHEN `context-rules.md` IS AMENDED.** Rules **1, 5, 6, 8 and 9** are cited by number from other files. **Rule 7 is cited by number nowhere** — verified by two independent sweeps on 23 August — so it can be amended in place, but its slot must not be removed.

### ⚠⚠ THE FINDING — EVERY CORRECTION IN THIS SEQUENCE WENT STALE BY THE PASS IT AUTHORISED

**This entry named eleven sites. The pass closed them. D-057 then became the last file in the repo claiming they were open** — and had to be amended by the work it had authorised.

⚠ **Same shape as the warm-up correction**, which landed in `current-sprint.md` while D-046 and D-048 went on asserting the old claim. ⛔ **Four demonstrations in one session** of the gap recorded at **D-048** — not re-explained here. ⛔ **This entry does not close it; it is a fourth instance of it.**

### ⚠ FLAGGED, NOT FIXED

**`components/enquiry-opening.md` describes the primary component of `/start`, reads as current, and stops at D-033.** The entire **D-046 → D-056** layer is absent, its content was last updated **22 June 2026**, and it carries **two contradicting "Known Issues" sections** disagreeing on F-007. **Reported here; not corrected by this entry.**

---

## D-058 — How Work Is Authorised, Iterated And Closed — Carl's Account

**Date recorded:** 2026-08-23
**Status:** APPROVED
**Authority:** Human Founder — Carl's own account of his working process, given 23 August 2026.
**Bears on:** **D-048** (the write-back gap) and **D-057** (the listen-back). ⛔ **Neither is amended here.** This entry records the account; propagation to any other file follows separately and is not done by this entry.

### Why this exists — the write-back gap was framed wrongly

**D-048 framed the gap as: *an authorisation from Carl never reaches the record.*** ⛔ **That framing was wrong, and Carl's account is why.** It assumed a moment of authorisation exists to be captured. **It does not.**

⚠ **This is one account in three parts. They are not three decisions and must not be split.**

### 1. ⛔ There is no single moment of authorisation to capture

**Carl's loop, in his terms:** he discusses a feature with the Architect — **implementation and the order of the chunks** — it is planned with the Builder, sent back to the Architect, and **amendments are usually added**.

⛔ **BUT ONCE A PLAN IS AGREED AND DOCUMENTED, HE RESERVES THE RIGHT TO ITERATE AND MODIFY WHILE LOOKING AT THE RESULT.**

**The worked case is the card exit (D-056).** It went from **all cards fading together**, to **a fade**, to **Carl asking about reversing it** — the compressed reversal that shipped. ⚠ **None of that was in the plan.** It happened while looking at the running product.

⛔ **So a rule demanding "the authorisation must reach the record" was aimed at a moment that does not exist.** The plan is a starting position, not a contract. **In Carl's words: it pays to be flexible.**

### 2. ⛔ A verdict on an element is not a closure of its section

**This is the part the record currently cannot say, and it is the substance of this entry.**

**Carl builds like a music composition: the basics first, the nuances later.** ⚠ **EVERY SECTION STAYS OPEN UNTIL HE EXPLICITLY DECLARES IT FINISHED.** ⛔ **That declaration is his alone** — it is not implied by a build, an approval, or a recorded entry.

⚠ **The live example, recorded as UNDECIDED:** the logo goes **top-left in the client info section**, and having the **orbital light glint off it — real or faked — is an open option.** ⛔ **So "logo placed, done" would be false** while that remains open.

⛔ **D-046 IS THE WORKED FAILURE, AND IT WAS WRONG TWICE:**

1. **It promoted *"pretty clean"* to APPROVED** — the verdict-scale error D-057 exists to prevent.
2. ⛔ **More deeply: it recorded a completion at all.** **The enquiry corridor was open then and is open now.**

⚠ **Built + approved by eye + recorded ≠ closed.** ⛔ **The three are different states and the record must not collapse them.** A `decisions.md` entry records that an element was judged correct **at that point**; it does not close the section the element sits in.

### 3. ⛔ Scope is deliberately limited, and lineage is the exception

**Carl does not want the whole site's implementation revealed at once.** The **Architect stays on one section at most**; the **Builder on the current task.** ⚠ **This is deliberate, not an oversight, and it is not a gap to be closed.**

⚠ **BUT THE CLIENT INFO SECTION PROVED WHAT MUST BE SHARED.** Knowing that it **descends from the Q+A**, which **descends from the Hero**, and **what ethos runs through all three**, is what let the Builder **interpret intent rather than implement instructions literally.**

⛔ **THE RULE: A BRIEF CARRIES WHAT THE SECTION DESCENDS FROM AND WHAT IT INHERITS — AND NOTHING ABOUT HOW THE PARENT WAS BUILT.**

⚠ **Why the split works, and it is the reason this is safe to adopt:** **lineage is one or two sentences and is STABLE.** Implementation is neither — it is long, and it moves. ⛔ **The thing safe to share early is exactly the thing useful early.**

### ⚠ What this means for D-048's write-back gap

**The general form is not a separate rule.** ⛔ **It is D-057 being followed** — because **the record is written when the work is finished, not when it was authorised to begin.** There is no earlier moment to write down. **That half of D-048's framing is answered by this entry.**

⛔ **WHAT REMAINS IS THE PROPAGATION HALF, AND IT IS STILL OPEN.** A correction lands in one file while its source stands unmarked — **four times on 23 August 2026.** ⚠ **This entry does not close it.**

### ⛔ No holder — and this entry says so on its face

**Per Carl's ruling, a rule gets a holder where one is possible and states plainly where none is.** ⛔ **None is possible here.**

⚠ **Nothing in a tool call sees a conversation, an iteration, or a decision to close a section.** A `PreToolUse` hook fires on an edit happening; the three things this entry governs are **a discussion**, **a change of mind while looking at the screen**, and **a declaration Carl alone makes**. **None of them is a file write.**

⛔ **This rule relies on being read, not on being enforced.** Stated here rather than implied, on the same principle as Rule 7's own amendment.

---

## D-059 — How The Loop Runs: Declared Files, Checked Premises, And Section Records

**Date recorded:** 2026-08-23
**Status:** APPROVED
**Authority:** Human Founder — Carl's rulings on the working process, 23 August 2026, in the session that gates the restart of building.
**Bears on:** **D-058** (how work is authorised, iterated and closed) — this is the operational half of the same subject. **D-009** and **D-057** for where a component record lives. ⛔ **Neither is amended here.**

⚠ **Three rulings, recorded together because they are one thing: how the loop runs.** Splitting them would lose the connection — each one is a place the loop was leaking.

---

### 1. ⚠⚠ THE PLAN DECLARES ITS FILES

⛔ **Every plan names the files it expects to touch, and FLAGS WHICH ARE ON THE PROTECTED LIST.**

⚠ **The point is WHEN the unlock decision arrives: with the plan, while Carl is reading it** — not mid-task with half a change in flight. A denial discovered at the first edit stops work that has already started; a flag in the plan is a decision made calmly, before anything is touched.

**The Architect predicts that list independently.** It reads the working tree, so it can trace where a thing is rendered and what imports it — ⚠ **a grep, not a guess.**

⛔ **THE TWO ARRIVE AT THE LIST DIFFERENTLY, AND THAT IS THE WHOLE VALUE.** The Architect reads **structure, before any work exists**; the Builder plans **the actual edit**. Two independent routes to one answer:

- ⚠ **Agreement is corroboration.**
- ⛔ **DISAGREEMENT IS THE FINDING.** One of them has misread the structure — and **learning that while reading a plan costs nothing.** Learning it at the first denial, or worse at the first wrong edit, does not.

⚠⚠ **AND THE HONEST LIMIT, WHICH MUST NOT BE INVERTED: THE BUILDER IS THE ONE THAT CAN BE RIGHT.** It is the seat touching the code. ⛔ **The Architect's list is something to CHECK THE PLAN AGAINST, not authority over it.** If a plan names a file the Architect did not predict, the question is **"why does it need that one"** — never *"the Architect said otherwise"*.

⚠ **THE LIVE CASE, and the reason this is recorded now:** the logo work lands in **`app/layout.tsx`** and **`components/layout/site-header.tsx`**. ⛔ **Both are on the protected list.** This rule exists so that is known **before the first edit, not at the first denial.**

---

### 2. ⛔ ARCHITECT FIGURES AND PATHS ARE PREDICTIONS — CHECK THEM AT SOURCE

**Across 21–24 August 2026 the Architect stated SEVEN figures or paths as fact that were wrong:**

| Stated as fact | What it actually was |
|---|---|
| The freeze at **680–760ms** | **~120ms** — ⚠ **`31e9c3e`'s own commit message said so** |
| `project-intelligence/README.md` | **Does not exist** — the table is in `ai-system/README.md` |
| **One** not-found branch | **Two** — the head batch takes the other |
| The next review number **R-013** | **R-019** — a `tail` of a reverse-chronological file |
| The card exit's **500 / 140 / 1060ms** | **425 / 119 / 901** — the spec's candidates, not the built values |
| **D-044 / D-045** as judged-by-eye evidence | **PROVISIONAL** and **SPECIFIED, NOT BUILT** |
| Two line ranges | Both wrong |

⛔ **EVERY ONE WAS CAUGHT BY THE BUILDER CHECKING — NOT BY BETTER REASONING.** Reasoning about a figure cannot detect that it is wrong; only going to the source can.

⚠ **This was never written down. It worked because Carl kept asking for verification** — a practice held by one person's habit, which is exactly the shape of thing this project converts into a rule.

⛔ **THE RULE: A PLAN VERIFIES THE ARCHITECT'S PREMISES RATHER THAN INHERITING THEM.** A figure, path, line range or status quoted from a brief is **a prediction to be checked at source before it is built on**, not a fact to be carried forward. ⚠ **Two of the seven were the Builder's own, carried from a summary instead of from the thing itself** — so this is not a rule about one seat being unreliable. It is about what a summary does to a measured detail.

---

### 3. ⛔ SECTION FILES LIVE IN `project-intelligence/sections/`, AND EVERY SECTION IS OPEN

**One file per section** — the home page, `/start` (the Q+A), client info, and the client information page **not yet built**.

**Each file carries:**

- ⚠ **A top-level LINEAGE line** — e.g. *"the client info section is a child of the Q+A section"*. This is the thing D-058 established as safe to share early and useful early: **what the section descends from and what it inherits, and nothing about how the parent was built.**
- **Then Carl's reasoning, the ethos, and the design consistency running through it.**

⛔ **WRITTEN AS THE SECTION NEARS COMPLETION — NOT PER CHUNK.** Elements get modified as a section expands, and a per-chunk record would be rewriting itself continuously while describing a thing that is still moving.

#### ⚠ TWO VOICES, AND ONE OF THEM CANNOT BE DELEGATED

- **The Architect's account** — what was decided and why.
- **Carl's account** — the ethos.

⛔ **CARL'S CANNOT BE DELEGATED. D-056 IS THE PROOF:** *"the answers have done their job"* — the reason the card exit is deliberately asymmetric — **existed nowhere in the record until he said it.** No amount of reading the code or the decisions would have produced that sentence. **An agent writing the ethos section would have written something plausible and wrong.**

#### ⛔⛔ EVERY SECTION IS OPEN, AND EVERY FILE WILL SAY SO

⚠ **THE HERO IS THE LAST THING TO BE BUILT.** When it is done, **Carl walks the whole site — a MASTERING SESSION, in the DAW sense (D-035)** — and **sections are declared closed THEN, together.**

⛔ **A SECTION CANNOT BE JUDGED ALONE WHEN IT IS MEANT TO RELATE TO THE OTHERS.** That is why closure is collective and why it comes last.

⚠ **NOTHING IS CLOSED BEFORE THAT WALK.** ⛔ **A file that looks finished is not a closure.** **D-046 is the worked failure** — it recorded a completion while the enquiry corridor was open, and that corridor is open now. This is D-058's *built + approved by eye + recorded ≠ closed*, applied to the section record itself.

---

### ⚠ Where this is reachable from

**`project-intelligence/sections/README.md`** states the folder's purpose, the two voices, the lineage line, and that every section is open until the mastering walk. ⛔ **A routing row was added to `ai-system/README.md` in the same change** — because the sweep mandate lapsed for exactly one reason: **it was filed where nobody looked.**

⚠ **`sections/` is NOT `components/`.** That directory is an **archive** (D-057) — no new files are written there.

### ⛔ No holder

⚠ **Nothing enforces any of the three.** The scope guard denies a protected edit but cannot require a plan to have *declared* it in advance; nothing detects an unchecked premise; nothing detects a section file that was never written or a closure claimed too early. **All three rely on being read.** Stated here rather than implied, on the same principle as Rule 7 and D-058.

---

## D-060 — The Logo Runs At 40px Tall On Dark Pages

**Date recorded:** 2026-08-25
**Status:** APPROVED
**Authority:** Human Founder — Carl, 25 August 2026, judged by eye on a running production build.
**Bears on:** The site header (`components/layout/site-header.tsx`). ⛔ **The header section is NOT closed** — no section is, until the mastering walk (D-059 §3). This records a decision *inside* an open section.

**40px is the STANDARD SIZE FOR THE LOGO ON PAGES** — not a value for this header alone.

⛔ **40px IS THE HEIGHT. The width follows from the aspect ratio** — 69.9px at 40px tall, from the 951x544 cropped mark. ⚠ **Anyone applying this sets the HEIGHT and lets the width fall out. Never the reverse.**

The nav grows from **61px to 81px** as a result. ⛔ **THAT IS ACCEPTED, NOT A COST TO BE RECOVERED.** Carl let it grow deliberately; the nav was 61px around a 16px line and had the room. **Do not shrink the mark to protect the old height.**

### ⚠⚠ WHY CAP-HEIGHT MATCHING IS THE WRONG TARGET FOR THIS MARK

**Recorded because the arithmetic looks correct and will be "corrected" back otherwise.**

The first placement derived 24px by matching the **cap-height** of the `C2B` text it replaced — a 12px/700 span with a 16px line box and 10px of actual cap-height. ⚠ **Sound arithmetic on the wrong target. It read too small and Carl rejected it by eye.**

⛔ **THE c AND THE b ARE OPEN LOOPS.** Measured on the cropped mark: **only 38.4% of the ink box is ink — the other 61.6% is background showing through the letterforms.** The text it replaced was **solid**. So equal cap-height delivers roughly a third of the visual weight, and the mark must run **larger than the text** to carry the same presence.

⚠ **THE TRANSPARENT MARGIN WAS NOT THE PROBLEM.** Measured before resizing: ink box `(28,28)-(962,555)` inside a 991x584 frame — **5.7% empty width, 9.6% empty height**, with **hard edges** (alpha 0 to 255 in a single pixel at top, left and right; only the bottom carries a faint tail). **Cropping helped a little. The open-loop nature is the reason.**

The shipped asset is `public/c2b-logo-mark.png` — **951x544**, cropped from the 991x584 frame keeping **8px of breathing room on every side** rather than cutting to the ink. ⚠ **Verified non-destructive: opaque (137,956) and partial-alpha (59,500) pixel counts are IDENTICAL before and after the crop.** Only fully-transparent pixels were removed.

### ⛔ THE LIMIT OF THIS STANDARD: 40px ON DARK

**Every page is dark today, and this standard assumes it.**

⛔ **ON A LIGHT BACKGROUND THE GOLD LOSES CONTRAST AND THE WHITE SPECULAR HIGHLIGHTS DISAPPEAR ENTIRELY.** The mark carries **11,219 fully-opaque pixels at luminance 255** — on dark they read as the metal's highlights; on light they are white-on-white and the mark looks washed out. ⚠ **That is what Carl saw in Edge, and it was the background, not the file.**

⛔ **A LIGHT-BACKGROUND TREATMENT IS UNDECIDED AND THIS STANDARD DOES NOT COVER IT.**

### ⚠ Undecided — recorded as open questions, NOT as omissions

- ⛔ **Whether "Web Design" stays beside the mark at all.** ⚠ **And if Carl does implement it, it will almost certainly be a 3D TEXT FONT.** That matters: **extruded type beside an extruded mark is a lockup of two objects in one material world** — not a metal mark beside flat grey text. ⛔ **The current "Web Design" is a PLACEHOLDER. Its awkwardness at 40px is NOT evidence against the size.**
- **Animation.**
- **Hover behaviour.**
- **Whether the orbital light catches the mark.**

### ⚠ Not changed here

The `<img>` element carries one lint warning (`@next/next/no-img-element`, suggesting `next/image`). ⛔ **Left as it is deliberately** — a loader and optimisation behaviour is a conversation for when the logo work continues, not something to slip in with a decision entry. The one known accepted lint error is unchanged.

⚠ **`brand-assets/logo/c2b-logo-gold-hero.svg` IS NOT A VECTOR** — it is a single `<image>` element wrapping a base64 PNG, and its own `<desc>` says so. `hero-logo-transition-concept.md` calls it the vector master and states a Blender/Three.js pipeline depends on having one. ⛔ **There is no vector master in `brand-assets/`. That record is wrong and is NOT corrected here** — a record correction is Carl's.

---

## D-061 — Building Officially Restarts. The Pause Is Lifted; "No Chunk Is Authorised" Is NOT

**Date recorded:** 2026-08-27
**Status:** APPROVED
**Authority:** Human Founder — Carl, 27 August 2026, stated explicitly and confirmed when restated back.
**Bears on:** `active-sprints/current-sprint.md` (amended in the same chunk), and every session that reads it.

⛔ **THE BUILDING PAUSE IS LIFTED. New building is authorised again.**

The pause stood from **25 July 2026**, was reaffirmed on 21 August, and is now ended by the only
thing that could end it: **Carl saying so explicitly.**

**The exit condition ran in its stated sequence and completed:**

| Step | State |
|---|---|
| Remaining governance work | complete |
| A session on the working process with the Architect and Builder | complete — **D-059** came out of it |
| **Carl explicitly restarts building** | **done, 27 August 2026 — this entry** |

### ⛔⛔ WHAT DOES *NOT* LIFT WITH IT — READ THIS BEFORE STARTING ANYTHING

⛔ **"NO CHUNK IS AUTHORISED" IS UNCHANGED AND IS NOT PART OF THE PAUSE.**

`current-sprint.md` has always stated this as **the permanent arrangement, not a pause condition** —
it does not expire with the pause and it is not dated. ⚠ **It remains true now that building has
restarted.** Work still arrives as a **named chunk from Carl**, with scope and constraints, through
the plan-review gate.

⚠ **THE FAILURE MODE THIS GUARDS AGAINST IS SPECIFIC:** reading "building has restarted" as
"therefore I may begin building". **It does not follow.** The pause governed *whether* new building
could happen at all; the chunk rule governs *what* may be built and *when it may start*. **Two
separate controls. Only one moved.**

### The next body of work — named, not yet authorised

**Inserting the logos across the site.** Carl, 27 August 2026. ⚠ **This is a statement of what comes
next, NOT a chunk.** It carries no scope, no constraints and no plan-review gate yet.

**What is already in:** the gold mark, top-left on the landing page — **D-060**, APPROVED.
**Placement ruling (25 August, unchanged):** gold on landing, start and client info; **platinum-blue
on Q+A**, which carries a strong blue presence.

⚠ **TWO THINGS THE CHUNK WILL HAVE TO ANSWER, recorded so they are not discovered mid-task:**

1. ⛔ **EXTENDING THE GOLD MARK BEYOND THE LANDING PAGE IS STRUCTURAL.** Measured 25 August:
   `app/layout.tsx` renders `{children}` **and nothing else**; the header is imported by
   `app/page.tsx` **alone**. So it is **homepage-only, not site-wide.** Putting it on `/start` and the
   client info page means either two more imports or **moving the header into the layout** — a change
   to what owns and mounts a component, which is **structural under CLAUDE.md §5a and stops for
   review before it is built.**
2. ⛔ **D-060's 40px DOES NOT AUTOMATICALLY TRANSFER TO THE BLUE MARK.** 40px was derived from the
   **gold** mark's proportions and its open-loop ink density (38.4% ink). The blue mark is a
   different asset: **1448x1086 frame, solid content at x113–1216, y263–959**. ⚠ **At an equal 40px
   height the widths differ — gold 69.9px, blue 63.4px on content, 53.3px on the full frame.**
   **Carl's eye decides the blue size, not arithmetic** — cap-height matching was already wrong once
   for exactly this reason (D-060).

### ⚠ Three protected paths sit directly in the next chunk's way

`app/page.tsx`, `app/layout.tsx` and `components/layout/site-header.tsx` are **all in
`.claude/protected-files.json`**. ⚠ **Logo insertion cannot touch any of them until Carl names that
exact path under `"unlocked"` in `live-work/chunk-scope.json`** — never a folder, never a glob — and
**the unlock is removed and re-verified by observing a real denial** when the chunk closes.

### Recorded in the same chunk — the branch is merged to `main`

**`fix/q5-stall-and-label-colour` → `main`, fast-forward, pushed 27 August 2026: `eb827f0..334db03`,
170 commits.** On Carl's explicit instruction.

⚠ **WHY IT MATTERED:** `main` had not moved since **10 August**, so the Vercel deployment was serving
a faithful build of 17-day-old code — **`public/c2b-logo-mark.png` did not exist on `main` at all.**
⛔ **The live site was not broken and Vercel was not at fault.** The work was simply never merged.
**The branch was named for bugfixes and had become the trunk in practice.**

---

## D-062 — The Gold Mark Goes On /start As The Logo ALONE, And The Scrollbar Gutter Is Reserved Site-Wide

**Date recorded:** 2026-08-27
**Status:** APPROVED
**Authority:** Human Founder — Carl, 27 August 2026, judged by eye on a running production build: *"Confirmed, both occupy the same position."*
**Bears on:** `app/start/page.tsx`, `app/globals.css`, `components/enquiry/enquiry-opening.tsx` (comment-only). Commit **`79796eb`**. First application of **D-060** to a second page.

⛔ **THE LOGO ALONE. NO HEADER, NO NAV LINKS, NO "Web Design" TEXT.**

The mark is **absolutely positioned and out of flow**, so it occupies **no vertical space** and the
enquiry corridor sits exactly where it did before. Geometry verified in a real browser:
**x=92.36, y=19.99, 69.91x39.99 — identical to the landing page on both axes.**

### ⚠⚠ THE INSTRUCTION NARROWED THREE TIMES, AND EACH WRONG ANSWER LOOKED REASONABLE

**Recorded because the failure was not carelessness — it was scope creep that each step justified.**

1. **`SiteHeader` was reused** for guaranteed-identical geometry, and that reasoning was sound: it
   keeps one source of truth for D-060's site-wide 40px standard. ⛔ **But it brought the nav links
   and the "Web Design" span with it.** Carl: *"the text on the right side of the header shouldn't
   be there. i only wanted the logo inserted."*
2. ⛔ **AND IT BROUGHT AN 81px NAV BAND THAT PUSHED THE QUESTIONS AND ANSWERS DOWN** — the document
   went from 900px to **981px**. Carl: *"That effectively pushed the questions down."*
3. **The mark alone, out of flow.** Document back to **900px**, corridor undisplaced.

⚠ **THE LESSON IS ABOUT READING SCOPE LITERALLY.** "Put the logo on the start page" was answered
with a component that carries a logo. **The furniture came free and unasked for**, and the cost
landed on approved work — the corridor — rather than on the thing being added.

### ⛔ THE 7.35px OFFSET, AND WHY NO INSTRUMENT SAW IT

Carl, navigating between `/` and `/start`: *"it is not in exactly the same position... a little bit
to the right."*

**The cause was never the logo.** The landing page is **2971px tall and scrolls**; `/start` is
**exactly 900px and does not**. A visible scrollbar takes **~14px** out of the client width, and
`Container` is `mx-auto`, **so the loss splits evenly — 7.35px, exactly half.**

**Fix:** `scrollbar-gutter: stable` on `html` in `app/globals.css`. ⚠ **SITE-WIDE ON PURPOSE** —
any page that does not scroll would otherwise sit 7px off from every page that does.

⚠⚠ **HEADLESS MEASUREMENT REPORTED 0.00px WHILE THE DEFECT WAS REAL.** Headless Chromium has no
scrollbar, so both pages measured **x=112** and agreed exactly. The offset appears **only in a
headed browser**. ⛔ **VERIFY SCROLLBAR-SENSITIVE GEOMETRY HEADED** — a green headless number here
is the instrument being blind, not the page being correct.

**This is the same family as the headless-GPU defect** (`current-sprint.md`, where
`q5-stutter.mjs` measured SwiftShader for ten days) and **`one-context.mjs`** naming a global
property while checking a local one. ⚠ **Three recorded instances of an instrument that is working
perfectly and still cannot see the defect. Carl's eye found all three classes first.**

### The gradient took a round trip and ends where it started

While the header existed, the enquiry's background gradient was moved to a wrapper spanning both,
because ⛔ **a flat colour cannot match a gradient** running `rgb(20,20,20)` at centre to
`rgb(8,8,8)` at the edges — any single value is right at one point and wrong across the width.
Carl saw `#0a0a0a` as *"a different shade of black"*. **The header had to JOIN the gradient.**

⚠ **Removing the header removed the seam, so the gradient returned to the enquiry root unchanged.**
`enquiry-opening.tsx` is a **comment-only diff — 20 insertions, 0 deletions.** ⛔ **No code in
approved work (D-022/D-023/D-024) was changed, and the gradient anchor never moved in the shipped
result.**

### ⚠ Not changed here

A **second** `@next/next/no-img-element` warning now exists — one per logo. ⛔ **It is another
instance of the rule D-060 deliberately left open, not a new class of problem.** The `next/image`
question stays open and is not settled by adding a second `<img>`.

---

## D-063 — The Logo Changes Colour By Section: Gold → Blue → Gold, On A Radial Edge, Nailed To One Point

**Date recorded:** 2026-08-27
**Status:** APPROVED
**Authority:** Human Founder — Carl, 27 August 2026, judged by eye on a running production build. On the transition: *"that looks good."* On the radial: *"much better than a crossfade. If I was to describe it in musical terms I would say it has more clarity."*
**Bears on:** `app/start/page.tsx`, `app/globals.css`, `components/enquiry/enquiry-opening.tsx`. Commits **`47f0ce3`**, **`5ff93c7`**, **`8adf9c8`**. Builds on **D-060** (the 40px standard) and **D-062** (the mark on `/start`).

⛔ **BLUE BELONGS TO THE Q+A AND NOTHING ELSE.**

| Section | Mark | Changes on |
|---|---|---|
| Opening | **Gold** | — |
| Q+A | **Platinum-blue** | the Begin press |
| Client info | **Gold** | the start of the completion fade |

⚠ **This implements the placement ruling of 25 August** — gold on landing, start and client info; blue on Q+A — **as a transition rather than a static choice**, because `/start` carries all three sections in one page.

---

### ⛔ NO NEW TIMING EXISTS. BOTH CHANGES RIDE BEATS THAT WERE ALREADY THERE

**Carl's constraint, and it shaped the whole design:** *"Any timings will absolutely not change. What you will be doing is matching the gold/blue transition to other timings that are already there."*

- **Duration: 1300ms** — `Q5_REVEAL_CLEAR_MS`, the phrase wipe.
- **Gold → blue fires in `enterActive()`** — the single entry point the Begin button already calls.
- **Blue → gold fires in `enterComplete()`** — which is already called from `setTimeout(…, COMPLETE_HOLD_MS)`, **900ms**, the corridor move in which Q1 travels into the rail and the cards leave 5→1. ⚠ **The stage flips at the END of that hold, which is exactly when the completion fade starts.** ⛔ **So the callback already landed on the right beat and needed no delay of its own.**

### ⚠ WHY THE RETURN IS TIED TO THE FADE — Carl's design argument, not an arbitrary beat

1. ⛔ **Client info box 1 (Name) already carries a GOLD RIM**, signalling it is the field to fill first. **The logo must be gold before that arrives** — *"its a much stronger design choice to have the logo already transitioned back to gold by this point."*
2. ⚠ **At the fade the amber Q-numbers are dissolving, so the logo introduces no new colour** — it joins one already on screen and already leaving. *"The amber of the Q(n) is close to gold and its fading. Why not at this point change the blue to gold logo."*

**Measured on a production build:** gold first appears at **+993ms** (fade starts ~966ms), the change runs **1266ms**, gold is solid at **+2259ms**, and the Name box's entrance does not begin until **+3600ms** — **1341ms of margin.**

---

### ⛔ THE NAIL — CARL'S ARCHITECTURE, AND IT REPLACED A WORSE ONE

*"Pick a point on the page, both pages, that are identical. The exact same spot. Then pick an exact centrepoint for each asset. It will be like driving a nail through all 3. Any movement will be restricted to scale."*

⚠⚠ **POSITION USED TO BE A DERIVED VALUE, AND THE ERRORS COMPOUNDED.** Frame height, then a margin correcting for the two frames disagreeing, then another correcting that. Each step rounded. **The result was a jump visible on a hard cut but hidden by the crossfade.**

**Now one point is DECLARED and both marks are placed from it** — origin the Container's content box, **identical on both pages at 92.363, 19.9908**. ⚠ **The gold's placement computes to `left: 0, top: 0`, independently confirming the nail agrees with the landing page's approved position.**

**Result across all three states — landing gold, `/start` gold, `/start` blue: centre spread 0.0058px horizontal, 0.0064px vertical.**

⚠ **WHAT REMAINS IS SCALE, EXACTLY AS CARL PREDICTED:** ±0.29px on the left and right edges, symmetric about the nail, because **the two marks have genuinely different letterform aspects — gold 1.94364, blue 1.92525.** ⛔ **Squaring all four edges would mean distorting one mark. It is not a positioning bug.**

### ⚠⚠ THREE WRONG ANSWERS PRECEDED THE NAIL, AND EACH LOOKED REASONABLE

**Recorded so none is retried:**

| attempt | why it failed |
|---|---|
| **Frame-centring** | The gold's letterforms sit **4.14% ABOVE** its frame centre (heavier shadow below); the blue's sit **0.80% BELOW**. Centring the frames drops the blue ~5% of its height. |
| **Top-left anchoring** | Every size difference lands entirely on the bottom and right edges, so the smaller mark sinks and slides. |
| **A tight-cropped pair of assets** | Built on the false premise that the gold frame held *"53px of dead space at the bottom"*. ⛔ **It is the mark's SHADOW FALLOFF.** Padded and tight gold differ by ~1% at 40px and are visually identical. **Cropping would have altered approved work to fix a problem it did not have.** |

---

### ⛔ THE CHANGE IS A RADIAL EDGE, NOT A CROSSFADE

**Carl, on seeing the crossfade version:** *"The crossfade can go. If the edge is much sharper so the blue is sitting over the gold all the time, the radial reveals the blue."*

⚠ **THE MODEL, AND IT IS THE WHOLE MECHANISM:** the blue sits **permanently underneath at opacity 1**; the gold sits **on top at opacity 1**. **Neither ever fades.** The gold's `clip-path` alone decides how much gold shows, so the radial **reveals** the blue rather than dissolving into it.

⛔ **THE TWO DIRECTIONS ARE OPPOSITE GESTURES, NOT ONE ANIMATION REVERSED.** Entering the Q+A the gold clips **75% → 0%**, closing in so it is *"the last thing to disappear"* at the centre. Returning to client info it clips **0% → 75%**, opening out from the same point. ⚠ **The button's `enquiry-mask-reveal-radial` runs inside-out, so the entry here is deliberately its reverse.**

⚠⚠ **THE CIRCLE IS CENTRED ON THE NAIL, NOT ON EACH BOX.** The boxes differ (gold 69.93×40.00, blue 69.24×35.94) and the nail sits at a different percentage in each — **50.0526%/45.8640%** gold, **50%/50.7952%** blue. ⛔ **A plain `at 50% 50%` would make the two reveals non-concentric and the circle would visibly drift between the outgoing and incoming mark.**

### ⚠ 75% REPLACES THE BUTTON'S 150%, AND IT WAS MEASURED

**The gold's ink occupies 5%–61% of the radius range from the nail.** At 150% the circle spent **673ms — 52% of the animation — shrinking through empty space** before touching the mark. **At 75% the edge crosses the letterforms for 976ms of 1300ms.**

### ⚠⚠ EASING WAS REQUESTED, BUILT, MEASURED AND REJECTED

**Carl asked for it, and the reasoning was sound:** fast through the outer band where nothing is visible, slow across the text, and the reverse coming back.

⛔ **EVERY CURVE MADE THE INK CROSSING SHORTER, NOT LONGER:**

| | time crossing the letterforms |
|---|---|
| **75% linear (shipped)** | **976ms** |
| 75% ease-out | 881ms |
| 110% + hard easing | 692ms |
| 150% + hard easing | 631ms |

⚠ **The request was aimed at the 150% dead zone, which the radius change had already removed.** Easing can only redistribute time, and at 75% there is no longer a gap to steal from. **Left linear.**

---

### ⚠ How the logo learns the stage — it does NOT own it

`EnquiryOpening` gained **one optional prop, `onStageChange`**. ⛔ **It REPORTS the stage and does not own it:** `stage` stays where it always lived, and the callback fires from **the same two functions that call `setStage`**, so the logo cannot show a state the corridor is not in.

⚠ **A mount effect reports the initial stage too**, because **`?skip=1` mounts straight to `complete` without calling either entry point** — a listener on transitions alone would hear nothing.

### ⛔ Reduced motion: the animation goes, the CLIP STAYS

⚠⚠ **The inline resting `clip-path` is what EXPRESSES the state** — 75% in the opening and at completion, 0% during the Q+A. ⛔ **Adding `clip-path: none` under reduced motion would render the Q+A GOLD**, because it would unclip the gold in every stage. **The colour change is a state, not decoration.**

### ⚠ Unasserted, and stated because nothing checks them

- **1300ms against `Q5_REVEAL_CLEAR_MS`** — if the phrase reveal is re-timed, the logo does not follow.
- **The 1341ms margin against the field cascade's 3600ms first delay** — if the cascade is re-timed, the logo could still be changing when the gold rim arrives.
- **The `MARK` letterform fractions** — ⛔ **stale the moment either PNG is re-exported or re-cropped.**

### ⚠ Not changed here

A **third** `@next/next/no-img-element` warning now exists — one per mark. ⛔ **Another instance of the rule D-060 deliberately left open, not a new class of problem.**

---

## D-064 — The Only Proven Credential Was Filed Against The Wrong Script. It Is DEMOTED, Not Re-Filed

**Status: APPROVED** — Carl, 28 August 2026. Diagnosis by the Architect; implemented in the
`defect-4-misattributed-credential` chunk.

⛔ **`verify/proven.json` held ONE entry, and it described a script that does not measure
anything.** `reveal-stall.mjs` **films**. Its last two lines were:

    ✅ N films → out/run-NN.webm
    Now measure them:  npm run verify -- reveal-stall-measure.mjs

**Every arm of the proof was produced by a DIFFERENT script, `reveal-stall-measure.mjs`:**

| entry field | where the evidence actually came from |
|---|---|
| `emptyInput.reported` — *"NO REVEAL FOUND"* | `reveal-stall-measure.mjs:432` — **the only occurrence in `verify/`** |
| the sample count `run.mjs:283` matches | `reveal-stall-measure.mjs:562` |
| `stability.observedSpread` | the entry itself named `reveal-stall-measure.mjs` and its two 21 August commits |

### ⛔ The live consequence — a fully admissible pass for recording video

`run.mjs:214` matches entries **by exact script name**. So `npm run verify -- reveal-stall.mjs 5`
wrote five videos, printed `✅ 5 films`, matched `PASS_MARK` **on a line meaning FILES WERE
WRITTEN**, satisfied the three-sample rule via the `films?` pattern, and returned
**`✓ VERDICT STANDS`** — with nothing measured.

⚠ **Meanwhile `reveal-stall-measure.mjs`, which produces the actual verdict, was unlisted and had
its pass suppressed.** ⛔ **Exactly backwards.**

⚠⚠ **THIS IS INSTRUMENT DEFECT #12 — THE QUIET ZERO — OCCURRING INSIDE THE GATE BUILT TO PREVENT
IT.** That is why it is recorded as a decision and not merely fixed.

### ⚠ THE DECISION: demotion, not re-filing. This is the part worth keeping

**Moving the entry to `reveal-stall-measure.mjs` looks like the obvious repair. It was rejected.**

The empty-input control was run on **18 August**. The entry itself already declares that
`reveal-stall-measure.mjs` **changed twice on 21 August** (`031c207`, `8f5a259`) and that the
stability figures are **not transferable across those commits**. ⛔ **The same logic voids
transferring an 18 August control onto the post-`8f5a259` script.**

⚠ **Re-filing would have preserved the APPEARANCE of a credential while repeating the exact fault
that produced it** — attributing runs to a script that did not perform them, in a version that did
not perform them.

⚠ **`reveal-stall.mjs` does have a genuine red of its own** — `reveal-stall.mjs:290-292` exits 1 on
a vacuous film. ⛔ **But that is a red about a DIFFERENT SUBJECT** — *did the film capture a
reveal* — with no empty-input control and no stability declaration behind it. **Do not restore the
entry on the strength of it.**

**Precedent followed exactly: the `extras-hold-position.mjs` demotion of 19 August.**

### ⚠⚠ THE PROVEN LIST GOES 1 → 0, AND THAT IS THE HONEST NUMBER

⛔ **No pass from any harness in this project is currently admissible as evidence.**

⚠ **That is NOT a regression — it is the true state, made visible.** It was already true in
substance; the list merely disagreed. **Nothing was weakened to fit, and no control was
manufactured to keep the entry.**

### ⚠ What was changed in the harness

`reveal-stall.mjs`'s `✅` is removed and replaced with an explicit statement that **the script
reports no verdict — it films.** Expected result is now **`⚠ NO VERDICT DETECTED`, exit 3**, which
is correct: there is nothing to report either way. ⛔ **Do not "fix" it back.**

### ⚠⚠ AND THE REPLACEMENT TEXT TRIPPED DEFECT 1 TWICE WHILE BEING WRITTEN

**Recorded because it is the most transferable thing here.** The brief's replacement wording
wrapped so that the word **`fail` began a line** — `FAIL_MARK` matched it and the script
classified as **`disagree`**. Rewrapping put **`PASS` at a line start**, which `PASS_MARK` matched,
classifying it as **`pass` — a false green, worse than the original defect.**

⛔ **Three recurrences of defect 1's shape inside one task, one of them in the fix for it.** The
wording in the file is now constrained on purpose and says so in its own text: **no verdict word
may begin a line.** ⚠ **This is the argument for the verdict sentinel** (`##VERDICT:`, D-064's
sibling work in the defects-1-and-2 chunk): while verdicts are inferred from prose, *writing
English near a harness is a hazard.* **The honest declaration for this script is
`##VERDICT: NONE`.**

### ⚠ How to restore — TWO entries, not one

⛔ **Not one entry covering a pipeline.** Each must earn all three requirements **against current
HEAD**:

1. **`reveal-stall-measure.mjs`** — the measuring pass, the one that produces verdicts. Re-run the
   empty-sky crop control against the post-`8f5a259` script, re-observe the spread, write both up.
2. **`reveal-stall.mjs`** — the filming pass, **if it is listed at all.** Its subject is *film
   validity*, not freeze duration; its empty-input control is a run with no films to read.

### ⚠ Verified

- `--list` → **`PROVEN INSTRUMENTS (0 of 0 listed):`**, no rows, JSON parses.
- **No orphan banner** — the orphan check reads `proven` only, never `_demoted`.
- The new `reveal-stall.mjs` output classifies as **`none`** against the real `classify()`.
- **No `package.json` script and no chained command depends on `reveal-stall.mjs` exiting 0** —
  checked, because the brief flagged it as unverified.
- ⚠ **NOT run against a live `:3100` build.** Nothing was listening, and standing up a production
  server was outside this chunk. **The end-to-end run remains owed.**

### ⚠ The demoted entry keeps its original evidence

`injected`, `emptyInput`, `stability`, `whyItCounts` and `blindSpots` are **preserved intact**
alongside the demotion reasoning. ⛔ **History is preserved, not rewritten** — `context-rules.md`,
*No retroactive rewriting*.

---

## D-065 — The Mark Does Not Move. A Site-Wide Rule, And A Capability A Client Can Buy

**Date recorded:** 2026-08-30
**Status:** ⚠ **APPROVED as a STANDARD; the `/about` insertion is APPROVED ON DELIVERY.** ⛔ **Carl, 30 August 2026, ruling on outcome rather than method:** *"This is the last section that will need logo insertion. All others align to my satisfaction and are approved. If, and excuse the pun, you are given instructions to nail the about logo and you do, then approved. By what method? Thats your domain, i care about outcome."*
**Authority:** Human Founder — Carl, 30 August 2026: *"a user could be on a page. No matter where the user navigates to, the logo wont move. It might change colour but it will be absolutely constant and accurate, showing no movement, only change."* On the signal: *"Think what such a concept says to a user - pin point precision."* On the reach: *"Think beyond our site to a clients who will possibly have a logo… What if a client wants the same immobility?"*
**Bears on:** every route that renders the mark — `app/page.tsx` (via `components/layout/site-header.tsx`), `app/start/page.tsx`, and `app/about/page.tsx`. Generalises **D-062** and **D-063**; depends on **D-060**. ⚠ **Also bears on `live-work/references/workshop-template-and-client-delivery.md`** — see *the capability*, below.

> ⛔ **AMENDED 31 August 2026 — `/about` HAS LANDED, AND "prospectively" IS REMOVED.** The word was true when written and went false on delivery. **The insertion was measured and approved on delivery under clause 4 — see D-066.** ⚠⚠ **THE STATE OF THE SITE IS NOW: TWO COPIES OF THE NAIL CONSTANTS (`app/start/page.tsx`, `app/about/page.tsx`) AND THREE MECHANISMS REACHING ONE POINT** — the landing page through `SiteHeader`'s flow layout, the other two from the nail. ⛔ **THE INVARIANT REMAINS UNASSERTED and the harness is still owed when the header work lands; a third route joining has not changed that, it has raised what it costs.**

> ## ⛔⛔ **NO MOVEMENT, ONLY CHANGE.**

⚠⚠ **THIS IS A PROMOTION, NOT A NEW MECHANISM.** D-063 established the nail for **two marks on two pages**. ⛔ **Carl has stated it as a property of the whole site — and then as something a CLIENT may want.**

---

### ⛔ THE RULE — stated as OUTCOME, because that is what Carl ruled on

1. ⛔ **The mark occupies the same point on every route.** Not "approximately", not "the same margin token" — **the same point, verified by measurement.**
2. ⚠ **Colour is the only permitted variation.** Gold → blue → gold is D-063's journey and is unaffected.
3. ⛔ **Scale variance is permitted ONLY where two assets have genuinely different letterform aspects, and only symmetric about the centre.** ⚠ **Measured: ±0.29px per side; centre spread 0.0058px horizontal, 0.0064px vertical across all three current states** (D-063). ⛔ **Recorded as *sub-pixel and symmetric* rather than *invisible to the eye* — the first is checkable, the second is not.**
4. ⛔⛔ **A NEW ROUTE MUST LAND ON THE SAME POINT AS THE APPROVED ROUTES. THE MECHANISM IS THE BUILDER'S.** ⚠⚠ **Carl: *"By what method? Thats your domain, i care about outcome."*** **The nail (D-063) is the method that has worked and is the obvious starting point — it is NOT a requirement of this entry.**

⚠ **CLAUSE 4 WAS REDRAFTED ON CARL'S RULING.** ⛔ **It originally required a new route to *"hang from the nail, whose origin is `Container`'s content box"* — a MECHANISM.** ⚠⚠ **That was wrong twice over: it is not what Carl is ruling on, and it mis-describes the landing page, which reaches the same point through `SiteHeader`'s flow layout rather than from the nail.** ⛔ **As originally drafted it would also have obliged the header work to make the nail shared — a structural decision smuggled in through a decision entry.**

### ⚠⚠ WHY IT MATTERS — Carl's reasoning, and it is a design argument

⛔ **PIN POINT PRECISION IS THE SIGNAL, and it works because nothing else on the web behaves this way.** ⚠ **On an ordinary site the mark shifts a few pixels between templates** — different header padding, a different container, a scrollbar arriving. **Nobody consciously notices. The eye tracks it anyway, and the accumulated effect is *assembled from parts*.**

⚠⚠ **A MARK PROVABLY IDENTICAL ACROSS EVERY ROUTE READS AS ONE THING BUILT DELIBERATELY** — the *scene, not the part* finding applied ACROSS pages rather than within one.

⛔ **AND IT IS DEMONSTRABLE, WHICH ALMOST NO CRAFT CLAIM IS.** ⚠ **A visitor can navigate and watch it not move — a claim they verify themselves, without being told to.**

### ⛔ WHY MOST SITES DRIFT — the mechanism, because it is what makes the technique transferable

⚠ **Sites do not drift because nobody wanted precision. They drift because POSITION IS DERIVED.** A logo sits in a header, the header sits in each page's layout, and the position falls out of padding, container width, and whether a scrollbar appeared. **Each step rounds.**

⛔⛔ **THE INVERSION IS THE TECHNIQUE: DECLARE THE POINT, HANG THE ASSET FROM IT, AND THE ONLY REMAINING VARIABLE IS SCALE.** ⚠ **D-063 records the previous approach here — margins correcting margins — compounding into a jump visible on a hard cut.** ⛔ **The technique is the inversion, not the numbers, and it depends on nothing about c2b's mark.**

---

### ⛔⛔ THE CAPABILITY — Carl, 30 August. THIS IS THE PART THAT REACHES BEYOND THIS SITE

> *"Think beyond our site to a clients who will possibly have a logo. You noted yourself, they all move. What if a client wants the same immobility?"*

⚠⚠ **THE IMMOBILE MARK IS NOT ONLY A C2B DESIGN RULE. IT IS A CAPABILITY, AND THIS SITE IS WHERE IT IS DEMONSTRATED.**

⛔ **It is the variant principle in a harder dimension.** ⚠ **The recolour says *your colours*; the nail says *your mark, held to a precision nobody else is offering*.** **Any logo, any client, same method.**

⚠⚠ **AND IT IS THE STRONGEST AVAILABLE ANSWER TO THE SAMPLE-OF-ONE PROBLEM** — a prospect asking *"can you do this for my business?"* can be shown something visibly true on this site and obviously transferable, **because it is a technique rather than a style choice.**

### ⚠⚠ WHAT THE CAPABILITY FRAMING DOES TO THE UNASSERTED PROBLEM — it raises the stakes

⛔ **THE INVARIANT IS CURRENTLY UNASSERTED. Two routes reach the same point by two different mechanisms:**

| route | how the mark is placed |
|---|---|
| **landing** | inside `SiteHeader`, **in normal flow**, in an 81px band |
| **`/start`** | **absolutely positioned, out of flow**, at explicit px from the nail (D-062) |

⛔ **They agree because both resolve through `Container`, NOT because they share code** — an invariant held by the coincidence of two implementations, which `context-rules.md` names as a failure mode. **Nothing detects the day a third route misses by 2px.**

⚠⚠ **IF THIS WERE ONLY C2B'S RULE, "UNASSERTED" WOULD MEAN A FUTURE ROUTE MIGHT DRIFT AND WE WOULD NOTICE EVENTUALLY.** ⛔⛔ **AS A CLIENT-FACING CAPABILITY IT IS THE THING THAT MAKES THE CLAIM SAFE TO MAKE.** ⚠ **Selling pinpoint precision on a site where precision is verified by the Builder measuring it once is a promise resting on a coincidence.**

⛔ **That is §7 of `about-section-thinking.md` arriving: *only show what you would build and maintain*.** ⚠ **A prospect points at the immobile mark and says *I want that* — it is then built on a deadline and supported for years, on a codebase that is not this one.**

⚠⚠ **SO THE HARNESS IS NOT HOUSEKEEPING — IT IS WHAT MAKES THE TECHNIQUE DELIVERABLE**, and where it lives is an open question the workshop/storeroom split will settle. ⛔ **See `live-work/references/workshop-template-and-client-delivery.md` → *THE STOREROOM*.**

⛔ **THE HONEST STATUS TODAY: UNASSERTED — VERIFY BEFORE RELYING ON THIS.** ⚠ **The assertion is owed when the header work lands, because that is when a third route joins.**

---

### ⛔ WHAT IS NOT SETTLED BY THIS ENTRY

- ⛔ **The mark's COLOUR on `/about` is PROVISIONAL GOLD.** Carl: *"In the about section it is provisionary gold. It may not stay that way."* ⚠ **PROVISIONAL is a defined status — in place, deliberately untuned, awaiting the mastering pass (D-035). Not "unapproved" and not a gap.**
- ⛔ **Whether `SiteHeader` renders on all routes is NOT decided.** ⚠ **Carl, 30 August: likely, but deferred — he is weighing it against a FONT decision and context not yet shared with the Builder.** ⛔ **Site headers are the NEXT body of work after the `/about` scaffolding.** ⚠⚠ **The scaffolding must NOT settle it by rendering `SiteHeader` as a convenience** (CLAUDE.md §5a).
- ⚠ **The header's DESIGN is TBD** — Carl's word.
- ⚠ **Where the ASSERTION lives** — this repo, the workshop, or the storeroom. **Open.**

### ⚠ HOW THE `/about` APPROVAL IS DISCHARGED

⛔ **Carl's condition is that the mark lands correctly.** ⚠ **The Builder measures `/about` against the approved routes and reports the figures alongside the visual evidence, as part of the scaffolding chunk's delivery** — **not as a separate later step.** ⛔ **That is what makes "you did it" checkable rather than the Builder's word** (Rule 9: rendered output is the truth for visual work).

---

*⚠ **Drafted by the Builder, 30 August 2026, on Carl's instruction, and REDRAFTED the same day after his outcome ruling.** ⛔ **The rule, its reasoning and the capability framing are Carl's, quoted above; the measurements are D-063's, already approved. The Builder authored the write-up, not the decision.** ⚠ **The STANDARD is approved. The `/about` insertion is approved ON DELIVERY, against measurement.***

---

## D-066 — The `/about` Scaffolding: The Page Exists, The Link Is Hot, And The Mark Is Nailed

**Date recorded:** 2026-08-31
**Status:** ⚠ **TWO STATUSES ON ONE ELEMENT, AND BOTH ARE WRITTEN — `context-rules.md`: *"Statuses are written — never implied."***

| element | status |
|---|---|
| **The mark's PLACEMENT on `/about`** | ⛔ **APPROVED** — on delivery, under **D-065 clause 4**, against the figures below. ⚠ **CONFIRMED BY EYE, 31 August 2026: Carl navigated between routes and checked for movement — *"Excuse the pun - nailed it. Great"*. See R-020.** ⛔ **Rule 7 is satisfied: the verdict is Carl's, recorded at the level he gave it.** |
| **The mark's COLOUR on `/about`** | ⛔ **PROVISIONAL** — Carl: *"it may not stay that way."* In place, deliberately untuned, awaiting the mastering pass (**D-035**). ⚠ **Not a gap. Do not raise a missing approval for it.** |
| **The page CONTENT** | ⛔ **PROVISIONAL** — scaffolding that conveys position. **Not the About section.** |

**Authority:** Human Founder — Carl, 31 August 2026. On the fourth section: *"Build the 4th section but just put a heading of TBD- To Be Determined, in there and we will decide what content is in there later. Authorisation is granted for F7."* On the unlock: *"You are authorised to use site-header.tsx  Lock it after use."*
**Bears on:** `app/about/page.tsx` (new), `components/layout/site-header.tsx` (one line). Discharges the on-delivery half of **D-065**; depends on **D-060**, **D-062**, **D-063**. ⚠ **Does NOT touch `app/page.tsx` or `app/start/page.tsx`.**

---

### ⛔ THE DECISION

**`/about` is set up the way the landing page was set up: bare bones that convey position.** Carl's DAW model (**D-035**) — *"Lets get the bare bones in there and then zero in and focus at the right time."* ⛔ **THIS IS TRACKING, NOT THE SECTION.**

1. **The dead link is fixed.** `href="#"` → `href="/about"` in `site-header.tsx`. ⚠ **`#` jumped to the top of the page, so the link read as BROKEN, not inert.** That was the defect that opened the whole subject.
2. **The page carries FOUR SECTIONS, mirroring the landing page's four** — the founder and the process, the roles, what a website can actually do, and **TBD**.
3. **The mark is gold, top-left, placed by the nail.**

⚠ **The copy conveys position and is NOT final.** It is held to the standard Carl set for the landing page's own placeholders: they *"convey positions and ideas"* while *"the text wording will be edited, refined and focused."*

⛔ **AMENDED THE SAME DAY, AFTER CARL LOOKED AT IT — the sections are FULL-VIEWPORT and the page title shares section 1's canvas.**

> Carl: *"make them larger like on the home page. Sections 2,3 and 4 should be the same as 1. If i can see all the real estate that gives a better size canvas to design in. Rather than thinner 'strips'."* And: *"Lose the dividing line that runs through the middle of section 1."*

⚠⚠ **THE REASON IS THE DEVELOPMENT PASS, NOT THIS ONE.** Each section is `min-h-screen`, **so the canvas it will eventually be designed into is visible at its real size while it is being designed.** ⛔ **A section sized to its placeholder copy would have to be resized once real content arrives, and every design judgement until then would have been made against the wrong dimensions.**

⚠ **The page title and section 1 were two full-height sections with a rule between them, which cut the opening statement in half.** They are now **one section**; three dividers remain, between the four. **`border-neutral-800` — the site's existing hairline-rule vocabulary, not a new value.**

⚠⚠ **AND THE RESIZE INTRODUCED A DEFECT THAT WAS CAUGHT BY EYE, NOT BY A NUMBER.** The heading rendered at **left 442.5** against the landing page's **104.5** — the text detached from the mark it aligns under. ⛔ **THE CAUSE IS `Container`'s `mx-auto`: an auto inline margin sizes the box to its CONTENT and centres the shrunken result, REGARDLESS of the parent's alignment.** `align-items` and `justify-items` do not override it, and **three layout modes were tried and measured failing** — `flex items-center`, `flex flex-col items-stretch`, and `grid content-center justify-items-stretch`, the last with a full-width track and `stretch` applied. **The layout mode was never the cause.** ⛔ **Fixed by giving the child an explicit `w-full`; `container.tsx` is protected and the fix belongs on the consuming page.** ⚠ **The three failed attempts are recorded in a load-bearing comment in `app/about/page.tsx` so the class is not "simplified" away.** **Verified: `/` and `/about` both at container left 72.5, width 1280.0, heading left 104.5000.**

⚠ **The copy obeys the settled register rulings so the placeholders cannot contradict them later:** **first person** (*"I run C2B"*), **no condescension toward other agencies**, and **the roles described in principle, never by roster.** ⛔ **That is the rulings CONSTRAINING scaffolding, not the argument being built.**

### ⛔⛔ SECTION 4 IS A RENDERED "TBD", AND CARL AUTHORISED IT KNOWING IT SHIPS

⚠ **The Architect recommended AGAINST it** — three rendered sections with section 4 as a source comment — **on the grounds that it deploys.** ⛔ **Every push to `main` deploys to Vercel, and the production alias returns HTTP 200 with no authentication** (`app/robots.ts` blocks crawlers and states in its own header that it *"is NOT access control"*).

⛔ **The exposure was put to Carl explicitly and he authorised the heading anyway.** ⚠ **Recorded because the Architect's objection was sound and is on the record; the ruling is Carl's and it is not an oversight.**

⚠ **Inventing a subject for section 4 would have DECIDED IT BY DEFAULT.** ⛔ **The placeholder exists precisely to prevent that** — its subject is Carl's and undecided.

---

### ⚠⚠ THE NAIL IS DUPLICATED, DELIBERATELY — AND THE DEBT HAS AN OWNER

⛔ **`app/about/page.tsx` carries a SECOND COPY of `NAIL_X`, `NAIL_Y`, `MARK.gold`, `CORE_H` and `place()`.**

⚠⚠ **THE COUNT, STATED ACCURATELY BECAUSE THE PLAN FIRST GOT IT WRONG.** The plan said *"a third independent copy"*; **it is the second.** Verified: those constants appear in exactly one other file, `app/start/page.tsx`. ⛔ **The landing page does not use the nail at all** — it reaches the same point through `SiteHeader`'s flow layout, **which is why D-065 clause 4 was redrafted away from naming the nail as a requirement.** ⚠ **Caught by the Architect (F1). A trade-off argued from an inflated number is a weaker argument, not a safer one.**

⛔⛔ **THE TRUE STATE OF THE SITE: TWO COPIES OF THE CONSTANTS, THREE MECHANISMS REACHING ONE POINT.**

**Why a shared module was NOT extracted, though the duplication is real:**

- It would **edit `app/start/page.tsx`** — approved work under D-062/D-063, needing Carl's word.
- It would be a **structural decision taken inside a chunk that did not authorise it** (CLAUDE.md §5a).
- It would **pre-empt the header work**, which is where the sharing question belongs. ⚠ **D-065 clause 4 was redrafted precisely because its first draft *"would have obliged the header work to make the nail SHARED — a structural decision smuggled in through a decision entry."***

⛔ **THE DEBT'S OWNER IS THE HEADER CHUNK.** ⚠ **A cost with no holder is how things go quiet; naming the owner here is what stops that.**

---

### THE MEASUREMENT — how D-065's approval is discharged

**Full record: `live-work/about-scaffold-measurement-31-august.md`.** Production build, **HEADED** Chromium, two viewports.

| viewport | `/` | `/start` | `/about` |
|---|---|---|---|
| **1440** | left **104.8598**, top **19.9908** | left **104.8598**, top **19.9908** | left **104.8598**, top **19.9908** |
| **375** | left **15.9926**, top **19.9908** | left **15.9926**, top **19.9908** | left **15.9926**, top **19.9908** |

⛔ **Identical across all three routes at both widths.** Derived centre spread: **0.0058px horizontal, 0.0000px vertical** — inside D-062's recorded 0.0058 / 0.0064, and the 0.0058 is the known artefact of the landing page's frame width (69.9104 vs the nail's 69.9219), not drift. **`/start` and `/about` agree to 0.0000px on both axes.**

⚠⚠ **`/about` SCROLLS (doc 1511px) WHERE `/start` DOES NOT (900px)** — ⛔ **exactly the asymmetry that produced the 7.35px offset Carl saw on 27 August**, held by `scrollbar-gutter: stable` (D-062). **A headless run could not have shown this working: headless Chromium has no scrollbar and reported 0.00px while the real defect was live.**

**Three things the measurement was built to avoid, all on this project's record:**

1. ⛔ **It publishes RAW `getBoundingClientRect()`, not the derived centre.** The centre is computed through `MARK.gold.cx/cy` — **the same constants copied into the new file** — so measuring it directly would have shared a constant with the implementation, and **a mis-transcribed fraction would have produced three agreeing numbers and a mark in the wrong place.** *(Architect F2. Same class as `cross-section.mjs`'s duplicated `BEVEL_WIDTH`.)*
2. ⛔ **It checks computed style against the painted rect.** On 18 August computed read correct while the element painted 400px away, because an ancestor established a containing block. ⚠ **The `/about` wrapper is new code.** Computed resolves to **~0.00003px — effectively `left: 0, top: 0`**, independently confirming the nail lands on `Container`'s content origin. *(Architect F3.)*
3. ⛔ **It measures at TWO viewports.** `Container` is `px-4 sm:px-6 lg:px-8`, so the content-left edge moves at breakpoints. **The three routes agree at every width only because all three resolve through `Container` — the coincidence D-065 calls unasserted.** *(Architect F4. `opening-arm.mjs` running only at 1440px is on the record as one of the seven harness lies.)*

### ⛔ NO HARNESS WAS ADDED, AND THE INVARIANT IS STILL UNASSERTED

⚠⚠ **`verify/proven.json` lists ZERO proven instruments.** `run.mjs` suppresses the pass verdict of any unlisted script, so **a new harness would be unproven by construction** — no red run, no empty-input control, no stability declaration. ⛔ **Filing one would have manufactured the exact false credential D-064 exists to prevent, and it would have looked like rigour.**

⛔ **D-065'S STATUS IS UNCHANGED: UNASSERTED — VERIFY BEFORE RELYING ON THIS.** ⚠ **The measurement above is a ONE-OFF DELIVERY MEASUREMENT discharging Carl's on-delivery condition. It is not an assertion.** **The harness is owed when the header work lands.**

---

### ⚠ WHAT THIS ENTRY DOES NOT DECIDE

- ⛔⛔ **Whether `SiteHeader` renders on `/about` or any other route. NOT DECIDED, and deliberately not settled here.** ⚠ **Carl, 31 August: *"We will probably add a site header to all the pages. What i have to decide is what font to use and the design."*** ⛔ **`SiteHeader` is NOT rendered on `/about`; the mark is placed independently.** **Site headers are the next body of work.**
- ⛔ **The About section's content.** All of it — the argument, the examples, C2B TV, the fourth section's subject. **Development-pass work, unauthorised.**
- ⚠ **`about-section-thinking.md` is untouched by this chunk.** It is idea stage; the scaffolding settles no question in it.

### ⚠⚠ TWO THINGS THE HEADER CHUNK INHERITS — raised by the Architect, recorded so they are not rediscovered

1. ⛔⛔ **FULL NAVIGATION DEFEATS D-065's DEMONSTRATION.** ⚠ **Verified: `next/link` is used NOWHERE in the app, and `app/page.tsx:245` already navigates to `/start` via a plain `<a>`.** A plain `<a href="/about">` is a **full document navigation** — the page blanks and repaints, **so the mark disappears and comes back.** ⛔ **D-065's argument is precisely *"a visitor can navigate and watch it not move — a claim they verify themselves."*** ⚠⚠ **Under full navigation the immobility stays MEASURABLE and stops being PERCEIVABLE: the measurement above passes, and the demonstration does not run.** ⛔ **This is not "should the nav use `next/link`" — it is whether the site's navigation is client-side at all, which decides whether D-065 is a claim a visitor can verify or one only an instrument can.** *(Architect F8.)*
2. ⚠ **THE OTHER THREE NAV LINKS BECOME DEAD IF THE HEADER GOES SITE-WIDE.** `Services`, `Work` and `Contact` remain in-page anchors. **Harmless today** — `SiteHeader` does not render on `/about`. ⛔ **But from `/about` they would resolve to `/about#services`, which has no target, and behave exactly like the `href="#"` defect this chunk fixed.** *(Architect F9.)*

---

*⚠ **Reviewed by the Architect before execution** (`live-work/architect-prompt-about-scaffolding.md` → the plan → its findings). ⛔ **Six findings were applied to the plan before any code was written: F1 the constant count, F2 raw rects, F3 the containing-block check, F4 the second viewport, F5 the constraint's `/about` reason, F6 the two statuses above.** **F7 and F8 went to Carl. F7 he authorised against the recommendation; F8 is recorded for the header chunk.***

*⛔ **The unlock was opened and closed within the chunk.** Carl named `components/layout/site-header.tsx`; the edit was **one line** (`git diff --stat`: 1 file changed, 1 insertion, 1 deletion); `chunk-scope.json` was deleted and **the lock RE-VERIFIED BY OBSERVING A REAL DENIAL** — the guard fails open on an absent scope file, so deletion alone proves nothing.*

---

## D-067 — Homepage Section 2 Copy: The Four Services, And The Two-Register Rule

**Date recorded:** 2026-09-02
**Status:** ⛔ **APPROVED** — Carl, on the rendered production build, 2 September 2026: *"Section 2 approved. Commit and push."* ⛔ **Rule 7 is satisfied: confirmed by eye, verdict recorded at the level given.**

**Authority:** Human Founder — Carl, 2 September 2026. On the unlock: *"app/page.tsx Authorised to use. Lock when instructed."*
**Bears on:** `app/page.tsx` — the four `#services` cards only. Commit `fb732d9`. ⚠ **The section heading and intro paragraph are UNCHANGED and were settled at the outset:** *"I agree with the headline and subtext, iy doesnt need editing."* ⛔ **Does not touch the hero, `#work`, `#contact`, or any layout.**

---

### ⛔ THE DECISION

**All four service cards are rewritten. Card 3 is unchanged, by decision.**

| card | heading | register |
|---|---|---|
| 1 | Premium Website Design | ⛔ **statement** |
| 2 | Website Transformation | **we speak** |
| 3 | Intelligent Enquiry Systems | ⛔ **statement** — unchanged |
| 4 | **Ongoing Long Term Care** (was *Ongoing Growth & Improvement*) | **we speak** |

### ⛔⛔ THE TWO-REGISTER RULE — THE PART MOST LIKELY TO BE FLATTENED

**Carl:** *"On 2+4, that is enough. 1+3 should be statements like the sections main headline and subtext."* And: *"We shouldnt overuse the word 'we'."*

⛔ **Cards 1 and 3 contain no "we" at all. That is deliberate and it mirrors the section heading and intro, which also state rather than speak.**

⚠⚠ **THE FORESEEABLE FUTURE EDIT IS SOMEONE "TIDYING" CARDS 1 AND 3 TO MATCH 2 AND 4.** It would read as consistency work and it would destroy the pattern. **Recorded in code comments at the cards as well as here**, because a reader reaches the comment before the governance file.

### ⛔ CARD 4 — THE OFFER, NOT THE DIAGNOSIS

**The heading changed because Carl named the fault:** *"Are we shipping a product that needs improvement?"* ⚠ **"Improvement" concedes a deficit at launch, which card 1 directly contradicts — the two cards were arguing against each other.** *"Growth"* framed the value as financial return; Carl ruled it is *"not just from a financial sense."* **"Care" is the relationship word and carries the section's tone.**

⚠⚠ **THE BODY OPENS WITH AN OFFER BECAUSE SUPPORT IS A CHOICE.** Carl: the client buys the site, hosts it where they like, and takes the retainer or not — *"Their choice, they would be foolish not to, but its still a choice."*

⛔ **FOUR DRAFTS WERE REJECTED FOR THE SAME FAULT, AND IT IS WORTH THE SPACE.** Each opened by telling the client something about their situation so the service could answer a problem the copy had just planted: *"websites drift"*, *"a website does not change on its own"*, *"as the business changes, the website should change with it"*, *"Business decisions come first"*. **Carl:** *"Dont tell people how to run a business."*

⚠ **"Websites drift" failed on ACCURACY, not only tone** — it attributes motion to the wrong object. Carl: *"thats not a drift, its static... a website is immobile until a Dev comes onto the scene."*

⛔ **NO PREDICTION AND NO FEAR.** *"If something goes wrong"*, *"small faults can appear"* and *"not starting again with a stranger"* were all cut. **Carl:** *"Were not gonna tell them about a world where 'shit happens'."* **The difficulty sits in the WORLD — "in an ever changing world" — never in the client's business.**

⚠ **"Ready for whatever comes next" SURVIVED that cut deliberately, overruling the Builder's objection that it predicted trouble.** ⛔ **It promises presence, it does not predict difficulty.** Carl: *"For what ever comes next is good copy. Its honest."*

⚠ **"Endeavour" promises effort, which is what a retainer buys — not outcomes it cannot guarantee.**

### ⚠ CARDS 1 AND 2 — WHAT MOVED AND WHY

**Card 1:** *"Designed from scratch"* was cut as a **non-differentiator**. ⛔ **Carl confirmed everything is designed from scratch, so it described the house standard rather than this service** — and a claim every competitor also makes is not positioning. **Closes on "unique", not "premium"**: premium bookended the heading and claimed what the body had not earned. ⚠ **"YOUR brand identity" — an earlier draft read "our", which reverses the promise.**

**Card 2:** *"We turn"*, not *"Turning"* — ⚠ **the original was a gerund with no actor**, which reads as a catalogue entry rather than a person. ⛔ **"Tired" not "dated"** — the word a client would use about their own site; it diagnoses without blaming, where *dated* implies neglect. ⚠ **"Underperforming" is kept alongside it: tired is APPEARANCE, underperforming is RESULTS, and they are two different reasons a client arrives.** *"Same business, stronger first impression"* is unchanged from the original.

### ⛔ CARD 3 IS UNCHANGED, AND THE REASONING IS PART OF THE DECISION

**Its outcome-only restraint was already correct** — it names no tool or technology, which the standing ruling requires (the factory model is reasoning, never page content).

⚠⚠ **THE BUILDER PROPOSED ELEVATING CARD 3 VISUALLY** on the grounds that the enquiry system is the real differentiator sitting in a grid that weights all four equally. ⛔ **CARL RULED AGAINST IT, AND THE REASON GOVERNS THE WHOLE SECTION:** *"This is the next thing a user will see after the Hero. The hero will be the showpiece of the site, its gonna be a killer feature. What this next section must do is follow it and not compete."*

⛔ **THE 2×2 GRID'S EVENNESS IS THE ASSET, NOT THE FLAW.** Elevating one card would place a second climax immediately after the hero. ⚠ **Carl's frame:** *"If this was lord of the rings, this section would be the shire after the opening exposition."* **Calm and concrete, dense with specifics, unperformed.**

⚠ **And the ordering principle, which is general:** *"Whats important at the outset is the information. How that information is presented then comes into focus."*

### ⛔ THE TONE, IN CARL'S WORDS

> *"businesslike but not corporate. Personal, confident that says in every way 'we got your back'."*

**The test that follows: does the sentence sound like a person who will be there, or like a company describing itself?**

### ⚠ VERIFICATION

`npx tsc --noEmit` clean · `npm run build` compiles, 8/8 static · `npm run lint` **1 error, 5 warnings — the recorded baseline, unchanged by this work.** ⛔ **Copy verified in the SERVED HTML on a production build at :3100, not only in source.** Carl's approval is on the rendered page.

---

## D-068 — Homepage Section 3: The Cards Are Removed And The Argument Becomes One Paragraph

**Date recorded:** 2026-09-02
**Status:** ⛔ **APPROVED — THE COPY ONLY.** Carl, on the rendered production build: *"Sec 3 is approved. Layout work to be done at a later date."* ⚠ **The LAYOUT is explicitly PROVISIONAL and is not approved by this entry.**

**Authority:** Human Founder — Carl, 2 September 2026. Under the same unlock as **D-067**: *"app/page.tsx Authorised to use. Lock when instructed."*
**Bears on:** `app/page.tsx` — the `#work` section only. Commit `93ad412`. **Follows D-067**; sections 1, 2 and 4 untouched.

---

### ⛔⛔ THE DECISION — THE THREE CARDS ARE GONE

**Carl:** *"cards will be gone, that is a decision."*

`Design Standard`, `Business Thinking` and `Modern Capability` are removed as cards. ⛔ **Their three titles survive as PHRASES inside a single merged paragraph** — *"Our design standards…"*, *"In business thinking we…"*, *"We apply modern capabilities…"* — which is the form Carl specified: *"incorporate the 3 titles into the paragraph and we can be a bit personal here."*

### ⚠⚠ WHY THEY WENT — STRUCTURAL, NOT A COPY PREFERENCE

⛔ **Section 2 is a 2×2 grid of bordered boxes. This was a 1×3 grid of bordered boxes ON THE VERY NEXT SCREEN** — same border vocabulary, same heading-plus-paragraph shape, same scan pattern.

⚠⚠ **BY THE SECOND GRID THE EYE RECOGNISES THE PATTERN AND SKIMS**, so the harder argument landed on the least attention. ⛔ **And section 2's evenness only reads as RESTRAINT if it happens once; twice and it is the site's default way of presenting anything — which is what a template does.**

⛔ **THE FORM WAS ALSO SLIGHTLY FALSE HERE.** Section 2's four cards are **four different services**. These three were **three lenses on ONE thing — this site** — so the grid presented a single piece of evidence as three parallel items.

⚠⚠ **THIS IS A PRECEDENT AND IT BEARS ON SECTION 4.** `#contact` is also a full viewport and is the next screen. **The run of screens must vary in shape, or the same fatigue arrives one screen later.**

### ⛔⛔ THE OLD INTRO DATED ON THE FIRST SALE

**It read:** *"Before we bring this level of thinking to client projects, we apply it to our own. This site is the first expression of the C2B approach…"*

⛔ **Carl:** *"This is a problem. A line like this shouldnt be used."*

⚠ **BOTH HALVES CONCEDED THE ABSENCE OF A PORTFOLIO.** *"Before"* means **not yet**; *"first expression"* is **a count whose value is one**. ⛔ **Nobody arrives counting the portfolio — that line handed the reader the thought.** **It also explained the demonstration instead of letting it work.**

⚠⚠ **THE IDEA SURVIVED; ONLY THE TENSE WAS WRONG.** Carl: *"We will/can do for you what we do for ourselves is a good philosophy."* ⛔ **A PERMANENT commitment, not a stage the business is passing through.** *"One standard, applied to our own work and to yours"* says it with no date in it.

### ⚠ THE HEADING — AND WHY THE THIRD OPTION WAS RULED OUT

**"Built to set the standard." → "Quality Without Exception."** Carl chose it from three he proposed; the other two were *Built Without Compromise* and *Guided by Principle*.

⚠ **It is the same claim as the body's**, so heading and paragraph now make **one argument** rather than two. ⛔ **"Guided by Principle" was ruled out as METHOD language: how the work is done is `/about`'s subject, not the landing page's.** ⚠ **That boundary is load-bearing — the landing page hands off to `/about` and must not spend its argument first.**

### ⛔ THE REGISTER TURNS INSIDE THE SECTION, DELIBERATELY

| element | register |
|---|---|
| heading + subtext | ⛔ **STATE** — no "we" |
| the paragraph | **SPEAKS** |

**Carl on the subtext:** *"No need for a 'we' here, its more than implied 'our own' and 'yours'."* ⚠ **The speaker is carried by the possessives. Do not add one.**

⛔ **THIS IS CONSISTENT WITH D-067'S TWO-REGISTER RULE, NOT AN EXCEPTION TO IT.** **A commitment is something a person makes**; a description of a thing is not. Carl: *"we can be a bit personal here."*

### ⚠ TWO AMENDMENTS CARL MADE TO THE DRAFT

- ⛔ **"an asset, AS WELL AS a brochure"** — the draft read *"an asset, not a brochure"*. **Carl's version concedes the presentational role on purpose rather than denying it.** ⚠ **A different claim, not a softening.**
- **"build your website", not "build yours"** — *yours* had no clear antecedent; the nearest noun was *our own work*.

### ⛔⛔ THE LAYOUT IS PROVISIONAL AND IS NOT APPROVED

**Carl:** *"Layout work to be done at a later date."* ⚠ **The paragraph sits under the subtext in the same `max-w-2xl` column, on the left — an interim arrangement, marked as such in code.** ⛔ **Do not read this entry as approving the arrangement. Only the copy is approved.**

⚠ **The section is `min-h-screen` with `flex items-center` and has just lost the grid that filled it**, so there is more space around less content than before. **Whether that reads as breathing room or as an empty screen is a Rule 9 question for the redesign.**

### ⚠ VERIFICATION

`npx tsc --noEmit` clean · `npm run build` 8/8 static · `npm run lint` **1 error, 5 warnings — baseline, unchanged.** ⛔ **Copy and the cards' ABSENCE both verified in the served HTML** (0 occurrences of each card title), not only in source.

---

## D-069 — Homepage Section 4: The Copy Stands, And The "Who We Are" Button Becomes A Three.js Surface

**Date recorded:** 2026-09-02
**Status:** ⚠ **TWO STANDINGS ON ONE SECTION, AND BOTH ARE WRITTEN** — `context-rules.md`: *"Statuses are written — never implied."*

| element | status |
|---|---|
| **The section 4 COPY** | ⛔ **APPROVED.** Carl: *"I think Sec 4s copy doesnt need changing, its already good."* One word changed — see below. |
| **The `Who we are` BUTTON — Three.js rebuild** | ⛔ **PROVISIONAL, AND NOT AUTHORISED TO BUILD.** Carl: *"We are not redesigning now but in later sessions."* ⚠ **The GEOMETRY is settled; the MATERIAL and LIGHTING are undetermined.** |

**Authority:** Human Founder — Carl, 2 September 2026.
**Bears on:** `app/page.tsx` — the `#contact` section. Commit `0f606b8` (the copy). ⛔ **The button is NOT built and no code exists for it.**

---

### ⛔ THE COPY — APPROVED AS IT STOOD, ONE WORD CHANGED

**Section 4 is a closing invitation, not a claim**, which is why it survived review where sections 2 and 3 did not: it asserts nothing and so never carried the portfolio problem D-068 records. ⚠ **Its three clauses echo cards 1, 2 and 3 in order** — website, first impression, enquiries — so the page closes by recalling what it opened with.

⛔ **"premium" → "bespoke", and the reason is FREQUENCY, NOT THE WORD.** Carl: *"Mentioned once - its there. Mentioned again - reinforces it. Mentioned again - lets not labour the point."*

⚠ **"Premium" REMAINS twice in body copy** — the `#services` intro and the `#work` subtext — **and in card 1's heading `Premium Website Design`.** ⛔ **The word is not retired; only the third body mention is.** **Do not sweep the rest.**

⚠ **The `#services` intro was the risk in making this change** and was deliberately not touched: **that copy is SETTLED** — *"I agree with the headline and subtext, iy doesnt need editing."*

### ⛔⛔ THE BUTTON — WHAT IS DECIDED, AND WHAT IS NOT

**Carl's decision, in his words:** *"The button. Redesigned using three js with existing geometry used elsewhere on the site. However, the material and lighting will be different. This has yet to be determined."*

| | |
|---|---|
| ⛔ **SETTLED** | it becomes a **Three.js** surface; it **reuses existing geometry from elsewhere on the site** |
| ⛔ **UNDETERMINED** | the **material** and the **lighting** — explicitly *"yet to be determined"* |
| ⛔ **NOT AUTHORISED** | building it. **Later sessions.** |

⚠ **WHICH BUTTON: `Who we are` in `#contact`, which links to `/about`.** ⛔ **NOT the hero's `See our work`** — the hero is deferred and is Carl's own work.

### ⛔⛔ THIS DOES NOT GET BUILT WITHOUT STRUCTURAL REVIEW — RULE 5a

⚠⚠ **A Three.js button on `app/page.tsx` IS A NEW WebGL SURFACE ON A PAGE THAT CURRENTLY HAS NONE.** ⛔ **That is a structural decision under CLAUDE.md §5a — a second instance of an expensive, unique resource — and it stops for review BEFORE it is built.**

⛔ **TWO WORKED CASES ALREADY ON THE RECORD, AND THIS IS THE SAME SHAPE AS BOTH:**

| case | what it cost |
|---|---|
| **the warm-up canvas** | 17 programs linked twice, 833ms of GPU work delivering **0.0ms** to the reveal. **Four sessions to diagnose, a week to unwind, an hour to build.** |
| **`NextStepMeshButton`** | ⚠ **a button, exactly like this one** — inside a keyed subtree, so a **fresh WebGL context on every question step**: 67ms of blocked main thread, **eight contexts across a five-question walk**, invisible for weeks because `one-context.mjs` watched a different canvas |

⚠ **NEITHER WAS A CODING ERROR. Both worked exactly as written.** ⛔ **Recording the precedent here so a later session does not read "Carl decided this" as "therefore build it."** **The decision authorises the DIRECTION. The structure needs its own review, and Carl routes it.**

### ⚠ TWO CONSTRAINTS FOR WHOEVER PLANS IT

- ⛔ **`nextstep-geometry.ts` and `contact-field-geometry.ts` ARE BOTH ON THE PERMANENT PROTECTED LIST.** ⚠ **Reusing geometry means READING them, which is free. If the reuse requires either file to CHANGE, that is an unlock AND an approved-layer question** — both are approved work.
- ⚠ **The landing page's four screens are each exactly one viewport, and two pairs are UNASSERTED** (81px header, 61px footer — see the comments in `app/page.tsx`). ⛔ **A mesh button in `#contact` sits inside the `calc(100vh-61px)` screen. Anything that changes that section's height stales the pairing silently.**

### ⚠ AND ONE THING THE COPY WORK LEFT OUT OF STEP

⛔ **The hero's CTA reads `See our work` and points at `#work` — which, after D-068, contains no work.** It is now *Quality Without Exception*: a statement of standard with no examples. ⚠ **Raised with Carl and not acted on: the hero is deferred and is his.** **Recorded so it is not discovered later as a defect.**

⛔ **SUPERSEDED BY D-070, 2 September 2026 — SAME DAY.** ⚠ **It WAS acted on: the label is now `TBD`, and Carl has ruled the button will not be navigational.** **This note stands as history; D-070 is the current state.**

---

## D-070 — The Hero Button: Not Navigational. Kept With A Function, Or Deleted

**Date recorded:** 2026-09-02
**Status:** ⛔ **APPROVED — WHAT IT IS NOT.** ⚠ **PROVISIONAL — whether it survives at all.** Both are written; neither is implied.

**Authority:** Human Founder — Carl, 2 September 2026. On the unlock: *"Authorised to open file, lock after use."* **Closed and re-verified by observing a real denial.**
**Bears on:** `app/page.tsx` — the hero CTA only. Commit `1541a12`. ⛔ **Amends the open note at the foot of D-069, which is now superseded** — see below.

---

### ⛔⛔ WHAT IS RULED — AND IT IS A NEGATIVE RULING

**Carl:** *"I can definately say the button wont be navigational."* And: *"It will not be having navigational capabilities."*

⚠⚠ **A NEGATIVE RULING IS STILL A RULING.** ⛔ **It closes a question rather than opening one, and it is not a placeholder for a decision Carl has yet to make.** **The button does not move a reader anywhere. That is settled.**

### ⛔ THE TWO REMAINING OUTCOMES — AND THERE ARE ONLY TWO

**Carl:** *"If its kept it will do some function in the hero section. If not, it will be deleted."*

| outcome | what it means |
|---|---|
| **KEPT** | ⛔ it performs **some function IN the hero section** — ⚠ **what that function is, is undetermined** |
| **DELETED** | ⛔ it goes entirely |

⚠⚠ **NOTE WHAT IS ABSENT: there is no third outcome where it navigates.** ⛔ **A later session proposing "point it at `/about`" or "restore a descriptive label" is re-opening a question Carl has closed.**

### ⚠ THE LABEL IS `TBD`, AND IT IS A PLACEHOLDER, NOT A DESIGN

**Was `See our work`.** ⛔ **It had to change because D-068 removed the three cards from `#work`, so that section now contains NO WORK** — it is *Quality Without Exception*, a statement of standard with no examples. ⚠ **The label promised a portfolio and delivered a philosophy.**

⚠ **THE ELEMENT IS DAY-1 SCAFFOLDING.** Carl: *"The hero scaffolding was the very first thing to be built on Day 1."* **A hero conventionally carries a navigation CTA, so one was built.** ⛔ **Its presence is an artefact of that convention, not a decision anyone took.**

### ⛔⛔ THE `href="#work"` IS LEFT IN PLACE AND IS KNOWN-STALE

⚠ **Changing the element's TYPE is structural and was not authorised by a label change.** ⛔ **DO NOT "TIDY" IT** — do not remove the anchor, repoint it, or restore a descriptive label. **The destination is undecided BY RULING**, and ⚠ **the header nav already reaches `#work`, so nothing is lost while it waits.**

⚠ **The Builder asserted during this session that the button was "the only thing that moves a reader down the page from the hero". THAT WAS WRONG and Carl corrected it: *"There is navigation in the header to move a user down the page."*** ⛔ **Recorded because the false premise would have made removal look costly when it is not.**

### ⛔⛔ THE HERO'S BRIEF IS NOT IN THIS REPOSITORY — AND THAT IS DELIBERATE

**Carl has developed the hero concept across several earlier sessions and *"had it stricken from the record."*** ⚠⚠ **The silence is an instruction, not a gap.**

⛔ **WHAT IS ON THE RECORD, AND IT IS ONLY THIS:**

- **The hero will be a VIDEO BACKGROUND.**
- **`/about` section 1's image is STATIC.**
- ⛔⛔ **THEY ARE TWO TOTALLY SEPARATE PIECES OF WORK WITH DIFFERENT IMAGES.** ⚠ **What they may share is a similar LAYOUT — nothing else.**

⚠⚠ **THIS CORRECTS A COUPLING THE BUILDER HAD ASSUMED TWICE.** ⛔ **The travelling-image dependency in the 1 September handoff — *"the image must work as a right-hand slot in section 1 AND as a full-width ground behind section 2"* — belongs to `/about` ALONE.** **The homepage hero is not in that problem.**

⚠ **AND THE VIDEO/NOT-VIDEO SPLIT IS DELIBERATE:** the hero is video; the `/about` section 3 showroom screen is briefed as ⛔ **explicitly NOT a video.** **Do not "harmonise" them.**

⛔⛔ **THE OPERATIONAL CONSEQUENCE: A SESSION READING THESE FILES CANNOT PLAN THE HERO.** ⚠ **Ask Carl. Do not infer it from the layout, the copy, the surrounding sections, or this entry.** **This is why it is built last** — not only sequencing, but because its brief lives outside the system.

### ⚠ WHAT THIS SUPERSEDES

⛔ **D-069's closing note** — *"the hero's CTA reads `See our work` and points at `#work`, which contains no work… raised with Carl and not acted on"* — **is now acted on and out of date.** ⚠ **The label is changed and the button's function is ruled. D-069's note stands as history; this entry is the current state.**

---

## D-071 — §10a Is Broadened Again: It Governs What C2B CLAIMS TO HAVE MADE, Not Where Pixels Sit

**Date recorded:** 2026-09-04
**Status:** ⛔ **APPROVED.**
**Authority:** Human Founder — Carl, 4 September 2026.
**Bears on:** `public/about-studio-source.jpg` (the `/about` §2 room photograph) and every future material decision. ⚠ **Broadens §10a in `live-work/about-section-thinking.md` L575–640. Does NOT supersede it — the 30 August TV ruling stands undisturbed.**

---

### ⛔⛔ WHAT IS RULED

**Carl, in his own words:**

> *"This is quite literally a background. Is using a font our own work? Its an ornamentation, the paper in a book."*

⛔ **A BACKGROUND PHOTOGRAPH IS MATERIAL, NOT CONTENT. §10a DOES NOT REACH IT.**

### ⚠⚠ THE BUILDER CALLED THIS A REVERSAL. CARL CORRECTED THAT, AND THE CORRECTION IS THE ENTRY

**The Builder's framing:** the 30 August broadening says *"a borrowed background, texture or loop fails for the same reason a borrowed example does"* — the word **background** is in the record — so ruling a background exempt reverses it.

⛔ **CARL: *"is not a reversal, its the broadening of a concept."*** ⚠⚠ **AND HE IS RIGHT, BECAUSE THE TWO READINGS OF §10a ARE NOT THE SAME RULE:**

| the Builder's reading | Carl's reading |
|---|---|
| §10a is about **where the pixels sit** — foreground, background, texture, loop | ⛔ §10a is about **what C2B CLAIMS TO HAVE MADE** |

⚠ **Under the first reading, a background is inside the rule and today contradicts 30 August.** ⛔ **Under the second — which is the real one — a background was never the subject, and both rulings follow from one principle applied at different distances.**

### ⛔ THE TEST, STATED SO IT CAN BE APPLIED WITHOUT CARL

**Does a visitor read this as something C2B MADE?**

| | | |
|---|---|---|
| **MATERIAL — outside §10a** | fonts, frameworks, the paper stock, a photograph used as ground | ⚠ **Nobody reads Geist as our typeface design.** Using it asserts nothing |
| **CONTENT — inside §10a** | examples, the corridor, the cards, the light rig, **a screen playing something** | ⛔ **These ARE the claim.** A borrowed one is evidence of taste in SELECTION where the thing sold is judgement in CONSTRUCTION |

### ⚠⚠ WHY THE C2B TV REFUSAL STILL STANDS — AND THIS IS THE LOAD-BEARING PART

⛔ **A ROYALTY-FREE VIDEO ON THE C2B TV WAS REFUSED ON 30 AUGUST AND REMAINS REFUSED.** ⚠ **It is not rescued by today's ruling, and a session reading only this entry must not conclude otherwise.**

**The reason it fails is the test above, not its position on the page:** ⛔ **a screen playing content reads as content, even unlabelled.** The TV sits where C2B's work goes; the visitor's eye arrives at it asking *what has this agency made?* ⚠ **A room photograph behind glass panels never prompts that question.**

### ⚠ THE COPYRIGHT QUESTION IS SEPARATE AND CARL HAS ANSWERED IT

⛔ **§10a is C2B's own honesty rule. Copyright is someone else's rule and does not move when C2B moves its own.** ⚠ **The room photograph is a Reddit upload (r/workstations) whose licence is unknown.** The Builder raised seeking the photographer's permission with a credit.

⛔ **CARL'S RULING: *"not a concern."*** ⚠ **Recorded as ASKED AND ANSWERED so it is not re-raised a fourth time.** ⛔ **It is Carl's call and it is made.**

### ⛔ WHAT THIS UNBLOCKS

⚠ **The 3 September handoff listed §10a as *"UNRESOLVED and it is Carl's"*, raised three times and never settled, with the note that everything in section 2 now builds on that image.** ⛔ **It is settled. Section 2 proceeds on the photograph.**

---

## D-072 — `/about` Section 1 Copy: Two Registers, Statement And Person, Balanced By Eye

**Date recorded:** 2026-09-04 (approved 2026-09-03; recorded late — see D-074)
**Status:** ⛔ **APPROVED — copy AND layout.** ⚠ Both, and the layout is not incidental.
**Authority:** Human Founder — Carl, 3 September 2026, on a running build.
**Bears on:** `app/about/page.tsx` §1 (the unnamed first section). Commit `63b55cb`. Review: **R-023**.

---

### ⛔⛔ THE SPLIT IS THE DESIGN, AND IT IS A RULE

| | register | Carl's ruling |
|---|---|---|
| **text 1** (left) — *"How the work gets done."* | ⛔ **A STATEMENT. NO FIRST PERSON** | *"Statement. No i or we."* |
| **text 2** (right) — *"The founder and the process."* | ⛔ **THE PERSON. FIRST PERSON** | the standing ruling, `about-section-thinking.md` L1183–1214 |

⚠⚠ **TEXT 1 IS NOT THE THIRD-PERSON DRIFT THE RECORD WARNS ABOUT.** ⛔ **The first-person ruling governs copy about THIS OPERATION — Carl, the seats, who approves. Text 1 is about how the tools behave IN GENERAL, and it is impersonal BY INSTRUCTION.**

⚠ **THE HOMEPAGE RUNS THE SAME SPLIT (D-067, D-068). THE FORESEEABLE EDIT IS SOMEONE HARMONISING THE TWO** — it would read as consistency work and would destroy the pattern in both places.

### ⛔ CARL WROTE BOTH TEXTS

⚠ **The Builder drafted options; Carl selected, cut, pasted back and rewrote.** ⛔ **Text 2 is his paragraph INCLUDING the choices the Builder queried and he kept:** the *"we"*/*"I"* mix, *"pristine, production-ready code"*, *"my exact standards"*. ⛔⛔ **THOSE ARE HIS. DO NOT "FIX" THEM.**

### ⚠ LAYOUT IS APPROVED WORK, NOT INCIDENTAL STYLING

**Two equal columns (`grid md:grid-cols-2 gap-12 md:gap-20`), BOTH headings `text-3xl`.**

⛔ **The h1 came DOWN from `text-4xl md:text-5xl` to match the h2**, and now heads the left column rather than spanning the section. ⚠⚠ **Carl balanced the two paragraphs BY EYE against this exact arrangement, and added a sentence to text 1 to even them up.** ⛔ **Change the widths, the gap or either heading size and the balance he approved is gone.**

### ⛔ TWO CLAIMS WERE KEPT OUT ON PURPOSE — DO NOT REINTRODUCE THEM

Both were drafted and rejected:

1. ⛔ **control over *"every pixel and line of code"*** — ⚠ **a claim about CLIENT WORK on a site with no client work.** **The same defect was struck from the homepage on 2 September (D-068).**
2. ⛔ ***"cutting-edge execution with uncompromised artistry"*** — ⚠ **it ASSERTS what the page is meant to DEMONSTRATE.**

### ⚠⚠ SECTION 1 ALREADY NAMES THE FOUR SEATS — A CONSTRAINT ON SECTION 2

⛔ **Text 2 contains *"specialized roles of Strategist, Designer, Architect, and Builder"*.**

⚠⚠ **AMENDED THE SAME DAY — CARL WITHDREW THE CONSTRAINT THIS PARAGRAPH ORIGINALLY DREW.** The Builder wrote that *"section 2 cannot earn its screen by naming the seats again — section 1 names, section 2 must SHOW."* ⛔ **Carl, 4 September: *"Section 1 only names them in the process. Sec 2 will expand on the naming and give a brief description of their roles."*** ⚠ **A list inside a sentence about process is not an introduction.** ⛔ **§2 NAMES THE ROLES ON THE CARDS and describes them — Carl: *"What will show the differentiation is we will put the Role on the cards."***

⚠ **The original claim is kept above as history per `context-rules.md`. What survives of it: §1's mention is IN PASSING and §2 must not read as a repeat — but naming is §2's job, not a duplication to avoid.**

---

## D-073 — The `/about` §2 Room Is A REAL PHOTOGRAPH. Four Generated Rooms Were Built And Rejected

**Date recorded:** 2026-09-04 (decided 2026-09-03/04; recorded late — see D-074)
**Status:** ⛔ **APPROVED.**
**Authority:** Human Founder — Carl, 3/4 September 2026.
**Bears on:** `public/about-studio-source.jpg`, `brand-assets/reddit-original.jpg`, `app/about/page.tsx` §2. Commit `ed0fb5b`. ⚠ **Licence question closed by D-071.**

---

### ⛔⛔ THE REASON IS THE SECTION'S OWN ARGUMENT

**Carl:** *"If anything says 'made with AI', its this picture. Exactly the thing we are arguing against in this section."*

⛔⛔ **A PAGE ARGUING THAT UNGOVERNED AI YIELDS GENERIC OUTPUT CANNOT ILLUSTRATE ITSELF WITH GENERIC OUTPUT.** ⚠ **Same defect as the homepage line struck on 2 September, arriving in a picture rather than a sentence.** ⛔ **THIS SECTION IS WHERE A SCEPTIC CHECKS.**

⚠ **The tells in the rejected images were real, not fastidiousness:** picture frames at disagreeing angles, rack gear dissolving into noise, cabling going nowhere, repeated speakers at wrong scales.

⛔ **DO NOT REPLACE IT WITH A GENERATED IMAGE, however good it looks in isolation.**

### ⚠⚠ THE COLOUR NEEDED NO GRADING, AND THAT IS MEASURED

| | H | S | L |
|---|---|---|---|
| **interaction teal, `/start`** (D-053) | 186 | **66%** | 35% |
| **the wall, untouched** | 200–206 | **32–43%** | 12–17% |

⛔ **Half the saturation, a third the lightness — exactly what the record asks of a large teal area (*"well below them in saturation, nearer a duck-egg tint over near-black"*), STRAIGHT OUT OF CAMERA.** ⚠ **No collision with the `/start` states.**

⚠⚠ **A TEAL REGRADE WAS BUILT AND ABANDONED: it moved the hue ~5° and cost 94% of the resolution.** ⛔ **THE LESSON IS GENERAL — EVERY GENERATIVE ROUND-TRIP IS DESTRUCTIVE.** The chain ran `699px → upscale → regrade → plant removal → figure`. ⛔ **EDIT THE MASTER.**

### ⛔ THE FILES — AND ONE MUST NOT BE DELETED AS A STRAY

| file | what |
|---|---|
| `brand-assets/reddit-original.jpg` | ⛔ **6158×4105 MASTER**, the photographer's own upload. **Re-cut from this; NEVER upscale** |
| `public/about-studio-source.jpg` | **2560×1707, 459KB** — what the route serves. ⚠ **3:2, NOT 16:9** — a comment in `app/about/page.tsx` calls it a 16:9 crop and that is wrong |
| `public/about-studio-figure.jpg` | ⚠⚠ **NOT USED BY ANY ROUTE. DO NOT DELETE AS A STRAY.** Kept on Carl's instruction as a **LIGHTING REFERENCE** — its figure was generated INTO this scene, so its rim light and shadow direction already answer to these lamps. ⛔ **The PIXELS are unusable: 1264px file, figure ~300×400, a 5× upscale.** Two known tells: the chair back reads IN FRONT OF the torso, and there is no contact shadow |

⚠ **Carl's idea, 4 September: bring the figure into Resolve and extract it** — *"the lighting would almost match."* ⛔ **Not done.**

### ⚠ TOOLING NOTES THAT COST TIME TO LEARN

- ⛔ **BING'S BROWSER EDITOR SAVES AT 1080×719** — it works on Reddit's display-size webp, not the original, **whatever zoom it reports.** ⚠ Use Resolve, Photopea, or ffmpeg.
- ⚠ **`ffmpeg` 9.0.1 installed 3 September** (`Gyan.FFmpeg`). ⛔ **`-vsync` is REMOVED in ffmpeg 9 — use `-fps_mode`.**

### ⛔ THE BACK WALL RUNS AT ~2°, MEASURED — AND BEING RIGHT PRODUCED THE WRONG PICTURE

**Measured off the source image from two guides Carl named:** monitor top `x220 y343 → x400 y350` = **2.2°**; picture-frame bottom `x560 y269 → x678 y273` = **1.9°**.

⚠⚠ **A GEOMETRICALLY FAITHFUL VERSION WAS BUILT AND REJECTED.** `skewY(2deg)` **looked flat, because it IS flat.** ⛔⛔ **DO NOT "CORRECT" WALL CARDS BACK TOWARDS 2° ON THE GROUND THAT IT MATCHES THE PHOTOGRAPH. THAT HAS BEEN TRIED.** ⚠ **The measurement is a fact about the image; it is NOT automatically the target.**

⛔ **THE LEFT WALL GENUINELY RECEDES and has real perspective to work with. THE BACK WALL DOES NOT.** ⚠ **Carl then asked for *"text that is initially face on but the left side must be anchored as the right side pushed back"* — an EFFECT angle, not a measured one.**

### ⚠ THE IMAGE IS NOW SERVED THROUGH `next/image` — 4 September

⛔ **Converted as part of taking lint to zero (see CLAUDE.md).** ⚠ **The CROP IS UNCHANGED — `fill` + `object-cover` alters DELIVERY, not framing.** **Measured on the running server: 459KB source → 105KB WebP at 1440 (−77%), 22KB at 750 (−95%).**

⚠⚠ **UNASSERTED: nothing checks that the rendered framing matches what the plain `<img>` produced.** ⛔ **Verify by eye before tuning any card position against this crop.**

---

## D-074 — Three Approvals Lived Only In A Handoff For A Day. The Gap, And Why It Is Recorded Rather Than Quietly Filled

**Date recorded:** 2026-09-04
**Status:** ⛔ **CLOSED** — D-071, D-072, D-073 and R-023/R-024 are the fill. ⚠ **The entry stays as the record of HOW it happened.**
**Authority:** Human Founder — Carl, 4 September 2026: *"Decisions and developmant that was made in the last session will be recorded in this session."*
**Bears on:** `decisions.md`, `reviews/review-log.md`, and `ai-system/live-work-protocol.md` §3a.

---

### ⛔ WHAT HAPPENED

**The 3/4 September session approved three things by Carl's eye and wrote NONE of them into `decisions.md` or `review-log.md`:**

| approved | where it actually lived |
|---|---|
| §1's copy and layout | a commit message and `session-handoff.md` |
| the room photograph, and the rejection of four generated rooms | the same two places |
| the §10a question | ⚠ **recorded as UNRESOLVED — it was, until 4 September** |

⚠⚠ **THE HANDOFF ITSELF FLAGGED THIS AS A REAL GAP**, in its own words: *"Section 1's copy and layout are APPROVED BY CARL'S EYE and have no `decisions.md` or `review-log.md` entry... THIS IS A REAL GAP."*

### ⛔⛔ WHY IT WAS URGENT AND NOT MERELY UNTIDY

**`live-work/session-handoff.md` IS DELETED AT THE END OF THE SESSION THAT READS IT** — `live-work-protocol.md` §3a, and it is single-use BY DESIGN.

⚠⚠ **SO THE ONLY DURABLE RECORD OF THREE APPROVALS WAS A FILE SCHEDULED FOR DELETION, IN A GITIGNORED FOLDER.** ⛔ **This is not the ordinary staleness failure the record is full of — a claim that OUTLIVES its subject. It is the opposite and it is worse: a true claim about to be DESTROYED while its subject lives on.**

⚠ **The commit messages would have survived. They are not the record** — D-006 and Rule 1: chat history is not canonical, and neither is a commit subject line. **A reader asking *"why is text 1 impersonal?"* does not run `git log`.**

### ⚠ THE MECHANISM THAT FAILED, NAMED PRECISELY

⛔ **NOTHING ENFORCES RULE 7, AND `context-rules.md` ALREADY SAYS SO IN THOSE WORDS:** *"NOTHING ENFORCES THIS RULE... Both hooks are `PreToolUse` — they fire on an edit HAPPENING, and the failure mode here is an edit that NEVER HAPPENS. A hook cannot fire on an absence."*

⚠⚠ **THIS IS THAT FAILURE, ARRIVING EXACTLY AS PREDICTED, THREE WEEKS AFTER THE PREDICTION WAS WRITTEN DOWN.** ⛔ **Recorded because a foreseen failure that then occurs is evidence about the CONTROL, not about the session that tripped it.** The rule was known, written, and cited — and the work still did not happen.

### ⛔ WHAT IS NOT PROPOSED HERE

⚠ **No new rule, no new hook, no checklist item.** ⛔ **A remembered step failed; adding a second remembered step is not a fix, and `live-work-protocol.md` already carries the instruction.**

⚠ **The one thing that would actually close it is a gate that fires on session END rather than on an edit** — and that is a mechanism nobody has designed. ⛔ **Raised to Carl, not built.** Per D-038 it is not parked in a roadmap here.

### ⚠⚠ THE PATTERN WORTH CARRYING FORWARD

⛔ **A HANDOFF THAT CARRIES APPROVALS RATHER THAN POINTING AT THEM IS LOAD-BEARING SCRATCH.** ⚠ **The 3 September handoff was excellent — thorough, honest, and it flagged its own gap. That is precisely what made it dangerous: it was good enough to feel like a record.**

⛔ **THE TEST FOR ANY FUTURE HANDOFF: if this file were deleted right now, what would be LOST rather than merely inconvenient?** ⚠ **Whatever the answer names belongs in `decisions.md` BEFORE the handoff is written, not after.**

---

## D-075 — Lint Goes To Zero Warnings. The Room Image Takes `next/image`; The Four Marks Are Suppressed By Decision

**Date recorded:** 2026-09-04
**Status:** ⛔ **APPROVED.**
**Authority:** Human Founder — Carl, 4 September 2026. Unlock: *"app/start/page.tsx components/layout/site-header.tsx Authorised to use."*
**Bears on:** `CLAUDE.md` (the baseline), `app/about/page.tsx`, `app/start/page.tsx`, `components/layout/site-header.tsx`.

---

### ⛔ WHAT CHANGED

**Before: `7 problems (1 error, 6 warnings)`. After: `1 problem (1 error, 0 warnings)`.**

| | |
|---|---|
| **The room image** | ⛔ **CONVERTED to `next/image`** — the project's first use. ⚠ **Measured on the running server: 459KB source → 105KB WebP at 1440 (−77%), 22KB at 750 (−95%).** The crop is unchanged; `fill` + `object-cover` alters DELIVERY, not framing |
| **The four gold marks** | ⛔ **STAY `<img>`, suppressed per-line with a stated reason.** ⚠ The mark is positioned by measured pixel constants Carl tuned by eye (D-065/D-066); `next/image` wraps and re-sizes its output. **Nothing to win on a small already-optimal PNG, an approved alignment to lose** |
| **`showBlue`** | ⛔ **DELETED, and it was dead** — declared once, referenced nowhere but the comment explaining why a two-state boolean could not choose between the two radials. ⚠⚠ **The previous baseline flagged it as possibly *"a transition computed and never applied"*. THAT CONCERN IS ANSWERED AND WAS UNFOUNDED** |

### ⚠⚠ THE REASON FOR ZERO RATHER THAN A CORRECTED COUNT

⛔ **The baseline had gone stale TWICE IN A WEEK** — recorded as 6 warnings on 2 September, was 7 by
3 September when the room image landed. ⚠ **A non-zero baseline is a number someone must remember to
update; zero is a number the tool maintains.** ⛔ **Any warning is now a regression and is visible on
sight.**

### ⚠ A SUPPRESSION IS A DEBT

**Four `eslint-disable-next-line` comments now exist.** ⛔ **Each names its reason at the line, and the
full argument lives once at the mark in `app/about/page.tsx`** rather than four times. ⚠ **If the mark
ever stops being positioned by measured pixels, the suppressions lose their justification and should
be revisited rather than inherited.**

⚠ **`site-header.tsx`'s mark is IN FLOW (`h-10 w-auto`), not nail-hung, so only half the argument
applies there — its comment says so.**

---

## D-076 — The Builder Cannot Measure A Photograph. Four Wrong Angles, And The Instrument That Replaced Them

**Date recorded:** 2026-09-04
**Status:** ⛔ **APPROVED — the method.** ⚠ **The card positions themselves are Carl's and are recorded in `live-work/wall-card-corners-4-september.md`.**
**Authority:** Human Founder — Carl, 4 September 2026.
**Bears on:** `/about` §2 card geometry; `app/proto/wall/` (throwaway tool). ⚠ **Amends D-073's 2° note.**

---

### ⛔⛔ WHAT HAPPENED

**The Builder produced FOUR different values for the angle of the left wall's ceiling seam** — 2.0°,
3.67°, 5.19°, then 2.31/2.15/2.11° across three runs of one detector on an unchanged image.

⛔⛔ **EACH TIME IT CHECKED ITS LINE AGAINST ITS OWN FIGURE AND REPORTED AGREEMENT.** ⚠⚠ **THE CHECK
COULD NEVER FAIL, BECAUSE THE MEASUREMENT AND THE CHECK SHARED THE ERROR.** ⛔ **Same family as
`verify/one-context.mjs` — a true answer to the wrong question.**

⚠ **Why the pixel detector lied specifically: it scans each column for the steepest luminance drop.
The wall carries bright pools from the downlights, so in some columns the strongest transition is not
the seam. The fit then draws a confident line through points that are not all on the boundary and
reports a small residual, because the wrong points are consistent with each other.**

### ⛔⛔ CARL'S TEST FOUND IT IN ONE MOVE

> ⛔ ***"take the red line and move it up to where the ceiling meets the wall. DO NOT alter the angle."***

⚠⚠ **A LINE TRULY PARALLEL AT A CONSTANT OFFSET, LIFTED BY THAT OFFSET, LANDS ON THE SEAM ALONG ITS
WHOLE LENGTH.** ⛔ **It did not. It diverged visibly.** ⚠ **Carl: *"i knew this 30 mins ago because ive
got eyes and i could see the perspective is wrong."***

⛔⛔ **THE GENERAL RULE: WHEN A VALUE IS DERIVED FROM AN IMAGE, THE VERIFICATION MUST NOT USE THAT
VALUE.** ⚠ **Land it on the feature itself. The reference must be the artefact, not the arithmetic.**

### ⛔ THE SHAPE WAS ALSO WRONG, AND THAT IS SEPARATE

⛔⛔ **IT IS A PARALLELOGRAM, NOT A CONVERGING TRAPEZOID.** ⚠ **The Builder foreshortened the far end
twice on the theory that perspective demands it. At this shallow an angle, this close to face-on, it
does not — and the convergence is why every attempt read as a panel TIPPING AWAY from the wall.**

⚠ **Carl's framing is the better guide: *"Remember we are hanging a painting/picture. IRL you do that
face on and stand in the middle. make sure the top is horizontal."***

### ⛔ THE RESOLUTION — A 4-POINT PINNING TOOL

**`app/proto/wall/page.tsx`** — Carl drags four corners; a homography maps the card exactly onto them.
⛔ **THE BUILDER'S MEASUREMENT IS OUT OF THE LOOP.** ⚠ **It is NOT out of verification — only Carl can
confirm the result sits on the wall.**

⛔ **THROWAWAY, on the D-053 `?tealstrength=` pattern: an instrument that yields a value by eye, the
value goes in the code, the instrument is retired.** ⚠ **It is a client component on its own route so
`/about` keeps its static prerender.**

⚠⚠ **ONE EXTERNAL DIAGNOSIS WAS WRONG AND IS CORRECTED HERE:** it held that the failure was 2D-vs-3D
thinking and that CSS 3D transforms were the fix. ⛔ **The Builder's line WAS mathematically parallel
to the slope it had measured — the slope was wrong.** ⚠ **`rotateY(50deg)` would have been guessed and
mis-verified identically. Changing the transform does not fix a blind operator; removing the
Builder's eye from the measurement does.**

### ⚠ WHAT THIS AMENDS

⛔ **D-073 records the wall at ~2°, measured off a monitor top and a picture frame.** ⚠⚠ **THOSE ARE
OBJECTS NEAR THE WALL, NOT THE WALL'S OWN LINE. The figure should not be used for card geometry.**
⛔ **D-073's substantive ruling — that the measurement is a fact about the image and NOT automatically
the target — stands and is reinforced.**

---

## D-077 — `/about` §2 Copy: Four Seats, PROVISIONAL. And The Placement Is Settled

**Date recorded:** 2026-09-04
**Status:** ⚠ **PROVISIONAL — the copy.** ⛔ **APPROVED — the placement, the sizes and the register rules.**
**Authority:** Human Founder — Carl, 4 September 2026: *"ok, copy is provisionally approved. It has to work in finite space, it may need tweaking."*
**Bears on:** `/about` §2. Full drafting record: `live-work/about-section-thinking.md`.

---

### ⛔ THE PLACEMENT — SETTLED, AND THE REASON IS THE ARGUMENT

| position | seat | reads |
|---|---|---|
| **WALL LEFT** | **The Architect** | 1st |
| **WALL RIGHT** | **The Builder** | 2nd |
| **FLOOR LEFT** | **The Designer** | 3rd |
| **FLOOR RIGHT** | **The Strategist** | 4th |

⛔ **Carl: *"Architect is top left, reading L to R beacuse the Architect begins the work. You cannot
code if youve no idea what to code."*** ⚠⚠ **A geometric convenience does not get to re-order an
argument about how the work is done.** ⛔ **The Builder raised an objection about which wall recedes;
Carl overruled it — *"No, the layout is as it stands."***

⛔ **WALL CARDS ARE LARGER** — *"It is logical to assume a user will drawn to them first."* ⚠ Size,
position and word count all say the same thing: the heavy lifting is on the wall.

### ⛔⛔ NO CARD IS A STEP — THE CHAIR IS WHY

> ⛔ ***"Dont think in linear terms. In the course of a Clients project i would have to consult each
> 'team member' on a number of occassions. Thats why the chair sits in the middle."***

⚠⚠ **TWO DESKS, FOUR POSITIONS, AND A CHAIR THAT MOVES BETWEEN THEM. THE ROOM ALREADY CONTAINS THE
ARGUMENT.** ⛔ **§1 establishes the bridge; §2 shows what it connects to — FOUR POSITIONS YOU RETURN
TO, not four stages you pass through.**

⛔ **So no card carries a position in an order. No *first*, *then*, *finally*. Each is a standing
description of a position that is consulted.**

### ⚠ TWO PATTERNS IN THE COPY THAT A LATER EDITOR WOULD "FIX"

1. ⛔ **THE WALL PAIR NEVER SAYS "YOU". THE FLOOR PAIR DOES.** ⚠ The front pair is what the client
   PARTICIPATES IN; the back pair is work done on their behalf, where "you" would be false intimacy.
2. ⛔ **THE TOOLING IS NOT NAMED.** ⚠ *"If a client asks i will tell them what i use."* **No product
   names, no model names.** ⛔ **AND: Anthropic's logo or marks may NOT appear on the site without
   permission — that includes any "powered by" badge or logo strip. Naming Claude descriptively in
   conversation is fine.**

### ⛔ WHY PROVISIONAL — THE COPY HAS NOT MET ITS CONTAINER

⚠ **A word count is not a fit.** ⛔ **Wall cards lose width as their far edge compresses; floor cards
lean back and foreshorten; the room is dark and the glass frosted, so CONTRAST decides legibility as
much as size.**

⚠⚠ **FOUR LINES MUST SURVIVE ANY TRIM**, and if a card cannot fit while keeping its line, **THE CARD
SIZE IS WRONG, NOT THE LINE:**

| card | do not cut |
|---|---|
| **CA** | *"the work is then checked by someone who did not do it"* |
| **CB** | *"Code is only good when it stays within the brief."* — ⛔ **Carl wrote this line** |
| **CD** | *"not a blank page, and not a template"* |
| **CS** | *"Nothing it recommends becomes work without a decision"* |

### ⚠ ONE CLAIM AHEAD OF THE FACT, FLAGGED NOT RESOLVED

⛔ **CS's *"connected to the things the business actually runs on"* is PRESENT TENSE.** ⚠ **Whether the
Strategist is currently wired to any live system was raised and not answered.** ⛔ **§2 is where a
sceptic checks (D-073) — if nothing is connected yet, the fix is small: *"can be connected to"*.**

### ⛔⛔ AMENDED 23 September 2026 — HOW THE COPY IS SET IS PART OF THE COPY. CARL'S RULES FOR THE TEXT WORK

Raised as the Three.js text work was being discussed (D-086, D-091). ⛔ **They bind whichever text route is built.**

- ⛔ **CRAFTED COPY — THE SETTING IS PART OF THE EDIT.** Carl: *"The text copy has been crafted and edited. It is important that it sits within the card. So text size is important as is the spaces inbetwwen words."* ⚠ **The fit was judged in the BROWSER's text engine** (the superseded overlay, Geist 16px / 1.35 in the card's 420x260 space). **An engine that re-wraps or re-spaces the text undoes the edit silently** — so line breaks are FIXED, not re-flowed, and **fit is MEASURED** (every line within the face; the block within its height), not assumed.
- ⛔ **NOT LEFT-ALIGNED.** Carl: *"they shouldnt be left aligned, that would read like a letter or memo and inevitably leads to spacing issues on the right. It must fit within the card and be visually balanced."* ⚠ **A ragged right edge is ruled out.** ⛔ **JUSTIFIED — chosen the same day** (*"lets go with justified"*); centred raised and not chosen. ⛔ **Rewording is the LAST RESORT** — *"i would rather not"* — after the setting and the card size. **Full direction: D-094.**
- ⚠ **Measured the same day:** `troika-three-text` (installed via drei) has **no word-spacing control**, justifies by its own calculation, lays out with its own engine, and **does not read `.woff2`** (its README) — so it cannot guarantee a crafted setting. **The route that can is the browser's own text engine drawing each card's text into its own texture**, with the line breaks and word gaps computed and fixed. ⛔ **A finding, not a ruling — the text route is Carl's.**
- ⚠ **CD's and CS's final copy exists only in `live-work/about-section-thinking.md`** (the CA/CB copy in `wall-card-text.tsx` matches its final forms word for word). **When the text work opens, all four move into ONE module** that both the rendered text and the D-086 screen-reader copy read — one source, so an edit cannot reach one and miss the other.

---

## D-078 — The Orbiting Light Ships. The Flag Controlled Two Things And Only One Of Them Was Ever The Problem

**Date recorded:** 2026-09-09
**Status:** ⛔ **APPROVED — that it ships.** ⚠⚠ **PROVISIONAL — every value in it (D-044 stands).**
**Authority:** Human Founder — Carl, 9 September 2026: *"i would prefer the light to be moving on Vercel"*, and on seeing it: *"The orbit looks good, however this is one of the things to look closely at when 'mastering' is taking place at build completion."*
**Bears on:** `components/enquiry/contact-field-canvas.tsx`, `components/enquiry/contact-field-light-rig.tsx`. Amends **D-044**, which is not superseded.

---

### ⛔ THE FAULT AS REPORTED WAS NOT THE FAULT

Reported as *"the webgl camera in the client section is static, it should be moving."*
⚠ **The camera is orthographic, fixed at `[0, 0, 1000]`, and has never moved.** What moves
is a **spotlight orbiting the four boxes**; the apparent motion is the glint travelling
across the faces. ⛔ **Recorded because "the camera is static" would send the next reader
into camera code, which is correct, and waste the trip.**

### ⛔⛔ THE MECHANISM — ONE FLAG, TWO UNRELATED JOBS

`lightRigEnabled` gated **both** *does the light orbit* **and** *is SPACEBAR bound to
toggle it*. ⚠⚠ **That conflation is the whole reason the orbit could not be deployed:
shipping the motion meant shipping the key binding.** The two are now separate concerns.

| | before | after |
|---|---|---|
| **The orbit** | localhost / `?lightrig=1` only | ⛔ **every build**, gated on `active` + reduced motion |
| **The spacebar** | shipped with the orbit | localhost / `?lightrig=` **only** |

### ⚠ BOTH ORIGINAL OBJECTIONS ARE ANSWERED IN CODE, NOT WAIVED

1. **Spacebar belonged to the visitor** — it scrolls and activates a focused button,
   **including Send**. The binding is no longer shipped. Carl's local toggle is unchanged.
2. **The rAF loop cannot idle under `frameloop="demand"`.** Now gated on `active`, so it
   runs at the `complete` stage only. ⛔ **The canvas mounts far earlier on `canvasWarm`,
   so this is STRICTLY LESS work than the localhost behaviour it replaced**, which span
   from mount through the entire questionnaire lighting boxes nobody could see.

**Also added:** `prefers-reduced-motion` suppresses the orbit entirely — a continuous
9-second circuit is what that preference exists to remove. ⚠ **The static field is
unaffected either way: `BASE_LIGHT_SCALE` is 1.0**, so key/fill/ambient are identical
whether the rig is mounted or not. **Verified by reading the constant, not assumed.**

### ⛔⛔ SHIPPING IS NOT APPROVAL OF THE VALUES, AND CARL SAID SO IN THE SAME BREATH

⚠⚠ **D-044 STANDS. Crown depth, grain tint and the 3s hidden half remain takes**, not
decisions, awaiting the mastering pass (**D-035**). ⛔ **Carl has NAMED THIS SECTION as one
to look at closely during that pass.** **Do not read its presence in production as approval
of any figure in `contact-field-light-rig.tsx`.**

### ⚠ HOW IT WAS TESTED — AND THE TRAP THAT MAKES THE OBVIOUS TEST WORTHLESS

⛔ **A harness that visits `localhost` takes the OLD path and proves nothing.** The test
routed a fake production host (`www.example-deployed.test`) at a local **production build**,
so the page saw a non-localhost hostname exactly as Vercel does. Motion was read from
`--opal-shine`, which the orbit writes every frame from the same clock as the light.

| arm | before fix | after fix |
|---|---|---|
| deployed host, `complete` | ⛔ **static** (0 distinct) | ✅ **moving** (22) |
| deployed host, reduced motion | static | ✅ static — correct |
| deployed host, **before** `complete` | static | ✅ static — loop idle |
| localhost, `complete` | moving (23) | ✅ moving (23) |
| spacebar on deployed host | — | ✅ **not bound** |

⚠⚠ **THE INSTRUMENT WAS FALSIFIED BEFORE IT WAS TRUSTED** — stashed, rebuilt, confirmed
**red** against the old code (reproducing the reported fault), restored, confirmed green.
⛔ **The harness was temporary and was deleted; it is not in `verify/` and is NOT in
`proven.json`.** The evidence is this entry and the commit.

### ⚠ STALE COMMENTS CORRECTED IN THE SAME CHUNK — `context-rules.md`, and the sweep found a fourth

⛔ **The file header read *"STILL A TEST INSTRUMENT"* until the day it shipped** — the exact
staleness the rules warn about, sitting where a reader meets it first. ⚠ **A `grep` sweep
for every copy of the claim then found `baseScale`'s *"TEST RIG ONLY"* comment**, also
false. **Both corrected.** ⛔ **This is the "sweep for every copy, not just the one in front
of you" rule doing its job.**

### ⚠ NOT FIXED, AND DEFERRED BY CARL

**The `?skip=1` dev door leaves the opening heading overlapping the contact boxes** in
screenshots. ⛔ **Pre-existing, cannot fire for a visitor, and Carl has deferred it:** *"We
will fix the artifact when we fix another issue in this section that has recently come to
light."* **Not a defect of this work.**

---

## D-079 — The Contact Field's Source Image Was An Unlicensed Watermarked Comp. Removed From The Repo And The Live Site

**Date recorded:** 2026-09-09
**Status:** ⛔ **APPROVED — the removal.** ⚠ **The procedural fallback is INTERIM, not the destination.**
**Authority:** Human Founder — Carl, 9 September 2026: *"I cannot use the old file, references to it in the repo should be deleted."*
**Bears on:** `components/enquiry/contact-field-canvas.tsx`. Amends the sampled-source decision recorded in that file's comments (30 July 2026, commit `30ababe`).

---

### ⛔⛔ WHAT WAS SHIPPING

`public/contact-field-source.jpg` — a **699x392 Pikbest comp with the wordmark
visible in the pixels** — was fetched by every visitor to `/start` and sampled into
the four contact boxes' face texture. ⚠ **A byte-identical second copy sat at
`brand-assets/images.jpg`** (MD5 `615696bc…`), also tracked. Both committed
30 July 2026 in `30ababe`. **Both now deleted.**

### ⚠ THE ORIGINAL DECISION WAS RECORDED HONESTLY AND STILL WENT WRONG

⛔ **This was not hidden.** The code comment named Pikbest, said *"watermarked in
the original"*, called it *"a deliberate exception to this project's own rule"*, and
warned it was **"the one element that is NOT C2B's to pass on"** if the site were
ever used as a client template. Carl took it with the trade-off stated: *"Yes, I'd
be breaking my own rule, but for this effect — worth it!"*

⚠⚠ **THE FAULT WAS ONE WORD: "licensed".** The comment called it *"a licensed stock
asset"* in the same sentence that called it watermarked. ⛔ **A watermarked preview
is the opposite of licensed, and the two claims sat side by side for six weeks
without the contradiction being read.**

### ⛔ THE SAFEGUARD WORKED, AND IT IS THE REASON REMOVAL WAS CHEAP

⚠ **The procedural arc field was kept as a working fallback FOR EXACTLY THIS
EVENT** — the comment said so. ⛔ **So this was a deletion, not a rebuild.**
**Verified on a production build before the file was touched**, by blocking the
request: the four boxes keep their gold rims, blue faces and the orbit's glint.
**Flatter and darker than the sampled version, and coherent.**

### ⚠⚠ HOW IT WAS FOUND — NOT BY THIS PROJECT, AND NOT BY THIS SEAT

⛔ **A third party using Claude found it.** ⚠ **The Builder had the file open, read
the procedural path, and told Carl "nothing loads an image" — the JPEG upgrade was
one function call below where it stopped.** The `"not copied"` palette comment was
true of the three hex constants and false of the field, and was read as covering
both.

⛔⛔ **THE GENERAL FORM: A COMMENT WAS CONFIRMED INSTEAD OF THE BEHAVIOUR.** Same
family as every instrument defect on the record — `context-rules.md`, *"a green gate
proves the thing it tests and nothing else."* ⚠ **Nothing in this project — not
lint, not tsc, not any of the 131 harnesses — asserts that a shipped asset is
licensed. That gap is unclosed and is stated here rather than implied.**

### ⛔ WHAT REPLACES IT

**Carl is commissioning original work** — *"We are going to remove it and build our
own. It will look similar to whats there, serve as inspiration if you will, but the
work will be our own and i am gonna outsource the work."* ⚠ **He holds the reference
offline, on his desktop, and will delete it once the new field exists.**

⚠⚠ **THE CONSTRAINT TO BRIEF WHOEVER BUILDS IT: the four box faces are WINDOWS ONTO
ONE SHARED FIELD.** The variation between boxes comes from where each window sits,
not from per-box artwork. ⛔ **It must survive being cropped into four unrelated
rectangles — a design whose interest sits in one corner will not work.**

### ⚠ WHAT WAS KEPT, AND WHY IT IS NOT A LICENSING RESIDUE

- **The palette constants** — *measured* from the reference then compressed against
  the Send opal. ⛔ **Colour direction, not copied expression.** They are what keeps
  the procedural field in the opal's family.
- **The crest positions** — a traced description of the reference's SHAPE, which the
  arcs were built to approximate. **Nothing else records it.**
- **`buildFieldColourTexture`'s `source` parameter and its sampling branch** — now
  **dead code**, kept because the replacement drops straight into it. ⛔ **If the
  commission is abandoned, delete the branch.**

### ⚠ NOT DONE — AND IT IS CARL'S CALL

- ⛔⛔ **THE FILE REMAINS IN GIT HISTORY.** Removal takes it off the live site and
  out of new clones; **it is still retrievable from commits back to `30ababe`.**
  Purging needs `git filter-repo` and a force-push — **destructive, rewrites every
  hash from that point.** ⚠ **Private repo. Not done, and will not be without a
  direct instruction.**
- ⚠ **`components/layout/site-header.tsx:101` still cites the deleted file as
  precedent** for serving an asset from `public/`. **A protected file; the mention is
  cosmetic and carries no licensing risk.** Left rather than unlock a protected path
  for a comment.

---

## D-080 — The Contact Field Relit: An Aimed Relay Of Two Lights, C2B's Own Plate, And The Row Pitch Fixed

**Date recorded:** 2026-09-09
**Status:** ⛔ **APPROVED BY EYE on the running build.** ⚠ **The VALUES remain PROVISIONAL (D-044/D-035).**
**Authority:** Human Founder — Carl, 9 September 2026, on the finished behaviour: *"There are no dead moments... There are moments that are more 'chill' than others and moments when the state is on the way to excited... This looks so cool. Well done."*
**Bears on:** `contact-field-light-rig.tsx`, `contact-field-canvas.tsx`, `contact-field-geometry.ts`, `public/contact-field-plate.jpg`. Follows **D-078** (the orbit ships) and **D-079** (the comp removed).

---

### ⛔ FIVE CHANGES, AND THEY ARE ONE SYSTEM

Carl ruled early that they could not be tuned separately: *"changing one aspect at a time wont be enough."*

| | from | to |
|---|---|---|
| **`ROW_PITCH_PX`** | 58 | **70** |
| **The plate** | unlicensed comp | **C2B's own, generated** |
| **Aim** | fixed target | **rotating, rakes then opens** |
| **Intensity** | fixed | **exposure x d²** |
| **Lights** | one | **two, in relay** |

### ⛔⛔ THE AIM ROTATES — the change that made the geometry legible

Until now the light aimed at one pinned point: it orbited, so distance changed, but **it never turned to look somewhere else.** Carl specified a sweep from a side-view sketch — raking along the row from one side, opening face-on at the bottom to take in the Send button, then raking from the other side.

⚠⚠ **THE RAKE IS WHAT SHOWS THE CROWN.** The face has a shallow crown and a normal-mapped grain and **both are only legible under grazing light.** Carl: *"it will also show the shadows because of the geometry, especially from the left and right."* **Ends give SHAPE; the middle gives PRESENCE.**

### ⛔ EXPOSURE, NOT INTENSITY — borrowed from the APPROVED Q+A cards

Carl named the problem: the light is **furthest** where it is most face-on, **closest** at the corners, so a fixed intensity makes the most important moment the dimmest. `answer-card-canvas.tsx` already solved this — hold a constant exposure, multiply by d² per frame. ⛔ **Not a new invention; the same model, one file over.**

**Shipped exposure: 0.70.** ⚠ Derived, not guessed: the previous pair delivered an effective 0.80 which Carl judged *"just a little too bright"*, so this is 87% of it.

### ⛔⛔ THE RELAY, AND CARL'S MODEL IS WHY IT IS SIMPLE

**Two lights, same behaviour, offset by a TRIGGER — the moment light A's cone stops reaching the faces.** ⚠ **5694ms of a 10000ms lap, MEASURED by integrating the speed profile.**

⚠⚠ **THE TRIGGER IS A PROPERTY OF ONE LIGHT'S OWN LAP, NOT A RELATIONSHIP BETWEEN TWO.** Carl: *"All you have to do is sort out the figures for the first light and clone it. Do they have to be synchronised? No... It's like having a four bar piece of music, copying it and offsetting it."*

⛔ **A lap is 9s slow across the faces + 1s fast round the back.** The fast return is **a rim glint, not dead time** — Carl found the behaviour (*"the face is dead but you can see the gold rim glint"*) and then designed for it (*"glints happen fast"*).

### ⚠⚠ EVENNESS IS NOT THE TARGET — the correction that matters most

**Measured: floor 103, peak 224, mean 146, swing 2.18x, no sample at the ambient-only 64.**

⛔ **The Builder was optimising toward evenness and that would have killed it.** Carl's verdict names the intent: *"that means its not constantly alive, an evenness... moments that are more 'chill'... and moments when the state is on the way to excited."* **The remaining 2.18x swing IS the effect.** ⛔ **A future session that flattens the ratio will destroy the thing this entry approves.**

### ⚠ THREE ERRORS BY THE BUILDER, RECORDED BECAUSE THEY SHARE ONE SHAPE

1. ⛔ **A curve measured in TIME, applied as PHASE.** The dead zone was sampled by wall clock; the offset derived from it was applied to orbit phase. The speed profile makes those non-linear, so the "measured" 0.40 offset was a real curve read against the wrong ruler — and measured **worse than a single light**.
2. ⚠ **"Shadow cancellation" over-stated.** A naive count said both lights were forward ~52% of the lap. **Checked rather than assumed: when both are forward they sit at OPPOSITE ENDS of the row** — cancellation needs both cones on the same card, and they are mostly lighting different ones.
3. ⚠ **"Restoring full exposure doubles the brightness"** — wrong. The pair already delivered an effective 0.80 per light.

⛔ **All three are the same failure: reasoning about a quantity without checking which space it lives in.** Same family as the instrument defects in `context-rules.md`.

### ⚠ THE ROW PITCH, AND WHY IT HAD TO GO FIRST

A row-2 label sat **0px** below the box above it and **4px** above its own field — bound by proximity to the wrong control. **Found by a third party (Runable), not by this project.** Now 12px/4px.

⛔ **It had to be fixed BEFORE the plate was authored**: pitch -> `spanY` 96->108 -> plate aspect 6.00:1 -> **5.33:1**. Authoring first would have meant authoring twice.

### ⛔ THE PLATE — `public/contact-field-plate.jpg`, 2048 x 384, 62 KB

**C2B's own, generated from a parameterised script**, replacing the comp removed in D-079. ⚠ **Placement "A" chosen by Carl against three alternatives**, on his criterion: *"a good spread of shades of blue... good representation in each card."*

⚠ **The generator lives OUTSIDE the repo.** If `ROW_PITCH_PX` moves again the plate must be re-run at the new span — it is one command, not a re-author.

---

## D-081 — The Pikbest Blob Stays In History Until The Blueprint Clone. That Is When It Must Not Travel

**Date recorded:** 2026-09-09
**Status:** ⛔ **DEFERRED BY DESIGN, NOT UNRESOLVED.** The purge is OWED at a named moment.
**Authority:** Human Founder — Carl, 9 September 2026: *"History is important. Pikbest is not needed anymore."* And on the plan: *"Remove the C2B site info and clone the repo so i have a blueprint to work with clients."*
**Bears on:** git history from `30ababe`. Follows **D-079**, which removed the file from the working tree and the live site.

---

### ⛔ WHAT IS AND IS NOT ALREADY DONE

**Done (D-079):** the comp is deleted from `public/` and `brand-assets/`, off the live site, out of every new clone, and referenced by nothing.

⚠ **Not done:** it remains **retrievable from two commits** — `30ababe` (added) and `d76d96f` (removed). ⛔ **`git gc` CANNOT help**: pruning removes only UNREACHABLE objects, and the blob is reachable from `30ababe`. **The only route is rewriting those commits.**

### ⚠⚠ WHY IT IS NOT BEING REWRITTEN NOW — THE COST IS TO THE RECORD

**324 commits sit between `30ababe` and HEAD.** A rewrite changes every one of their hashes. ⛔ **`decisions.md`, `current-sprint.md` and the handoffs cite commit hashes constantly** — `2152e6e`, `442e95e`, `d008b4d`, `30ababe` itself and dozens more. **All would point at commits that no longer exist.**

⛔ **Carl's ruling names the tension exactly: *"History is important."*** A rewrite would remove a dead 17 KB file at the cost of silently invalidating the citation network the whole governance system runs on.

### ⛔⛔ THE PURGE IS OWED AT THE BLUEPRINT CLONE, AND THAT IS THE RIGHT MOMENT

Carl's plan: when the site is finished, strip the C2B-specific content and **clone the repo as a client blueprint.**

⚠⚠ **THAT IS PRECISELY WHEN THE BLOB MUST NOT TRAVEL — and the code comment predicted it, six weeks before the licensing problem was found:** *"If this site is ever used as a template for client work, this asset is the one element that is NOT C2B's to pass on."*

⛔ **AT THAT POINT THE REWRITE COSTS NOTHING.** The blueprint is a fresh artefact with no governance record depending on its hashes. **Same outcome; no collateral.** ⚠ **Doing it now buys nothing the blueprint stage does not buy more cheaply.**

### ⚠ WHAT MUST HAPPEN AT THE BLUEPRINT STAGE — do not let this be rediscovered

1. ⛔ **Purge `public/contact-field-source.jpg` and `brand-assets/images.jpg` from the clone's history** before it reaches any client. Blob `3cefad5`.
2. ⚠ **`git-filter-repo` is NOT installed and there is no Python on this machine** — either install it, or use `git filter-branch`, which ships with Git.
3. ⚠ **The rewrite is blocked by the Claude Code safety classifier**, correctly. It needs a Bash permission rule Carl adds himself, or Carl runs the command.
4. ⛔ **Two branches carry it** — `main` and `fix/q5-stall-and-label-colour`. ⚠ **That branch is KEPT DELIBERATELY**: Carl, *"something that put a spanner in the works for weeks... we will have a ref point."* **Its commits are merged into `main`, and a purge strips the blob while leaving every commit and message intact — the reference point survives.**
5. ⚠ **Local backup refs exist** from tonight's aborted attempt: branch `backup-pre-purge-2026-09-09` and tag `backup-pre-purge-tag`. **Left in place; useful when the purge runs.**

### ⚠ AND THE WIDER QUESTION IS CARL'S, NOT A TIDY-UP

Carl, on the blueprint: *"we will look at the repo and decide whats stays and if info is important as a record we could possibly store it elsewhere."* ⛔ **The governance record is not automatically part of a client blueprint.** What transfers, what is archived, and what is discarded is a decision for that session.

---

## D-082 — The Wall Pair Gets Geometry, A 42% Aspect Error Is Found, And The Lighting Becomes Two Directional Lights

**Date recorded:** 2026-09-18 (work done 17 September 2026)
**Status:** ⛔ **APPROVED.** Carl accepted the lighting on sight after four rejected rigs. Commits `ac4a4c8`, `30442e2`.
**Authority:** Human Founder — Carl, 17 September 2026. On the card family: *"The cards can be seen as one 'family'. They all share similar chracteristics, only the dimensions change."* On the lighting trade: *"It is a trade off, but all 4 are now visible. Its something to work with."*
**Bears on:** `components/about/about-card-geometry.ts`, `components/about/about-card-canvas.tsx`, `app/about/page.tsx`. Extends **D-076** (the measurement instrument) and **D-077** (placement).

---

### ⛔⛔ `WALL_CARD_ASPECT = 1.615` WAS WRONG BY 42%

**It came from `wall-card-text.tsx`'s 420x260 CSS box and had NEVER been measured against the plate.** ⛔ Solved from Carl's pinned corners: **CA 2.327, CB 2.248** (`about-card-geometry.ts:155-156`). ⚠ **The dead value is kept as `WALL_CARD_ASPECT_DEPRECATED` at `:166`** so a reader who finds 1.615 in an old note can see what happened to it.

⚠⚠ **CARL CHOSE THE SLOWER ROUTE AND IT IS WHAT FOUND THE FAULT** — *"getting it right is more important than how fast."* ⛔ **The quads are PROJECTED trapezoids**; a bounding box returned CA and CB **overlapping**, which is impossible for two cards on a wall.

**Five independent checks:** three focal lengths agree within 6.4% · the aspect is stable across that range · orthogonality within 0.012 · the overlay lands on the painted quads (`live-work/wall-corner-check-17-september.png`) · **and Carl's own test** — the desks relate to the walls, so two flat cards should be ~89.4° apart; **measured 96.10°.**

⚠ **THE 6.7° RESIDUAL IS STATED, NOT DRESSED UP.** The record already lists the right desk's direction under *"What is NOT established"*.

### ⛔⛔ THE LIGHT TYPE WAS THE FAULT, NOT ITS PLACEMENT

**FOUR SPOTLIGHT RIGS WERE BUILT AND REJECTED ON SIGHT.** Carl: *"its acting like a street light."*

⛔ **A `spotLight` has a position, so it pools and falls off. A `directionalLight` has neither, so the only thing varying across a face is THE FACE.** ⚠ **Four measured iterations — raking spots, cones, rim axis, a 25° swing — EVERY ONE MEASURED CLEAN AND LOOKED WORSE.** **Rule 9: the screen is the truth and Carl's eye is the instrument.**

**The built result** (`about-card-canvas.tsx:561, :628`): key `[1,2,2]` at **0.5**, fill `[5,2,-2]` at **2.6**, ambient **0.20**.

⚠ **THE OBVIOUS MIRROR `[-1,2,2]` IS WRONG** — it lights the RIGHT pair more (0.632) than the left (0.380), **because the cards are yawed to their desks, not mirrored about the room.** `[5,2,-2]` grazes CD/CA at 0.179/0.104 and gives exactly **0.000** to CS/CB.

⚠⚠ **AND THE KEY HAD TO COME DOWN, WHICH WAS NOT PART OF THE REQUEST.** At key 1.2 it still supplied **88% of CD's light AT NEAR HEAD-ON** — so 88% of what the left pair received carried no gradient. **Key 0.5 / fill 2.6 inverts that to 56% fill at a grazing angle.**

⛔ **CARL ACCEPTS THE TRADE: the right pair drops ~0.03 from values he had already approved.** ⚠ **Do not "fix" this imbalance later** — it is the accepted outcome of four rejected rigs, not an oversight.

### ⚠ THE CLEAN PLATE — the guides were CONSUMED, not discarded

**Wall guides gone, floor rails kept.** One `src` swap: **the wall quads are PAINTED INTO the plate**; the floor rails are SVG in the component. ⚠ **Both plates are 1.500 framing, so no card moved.** **The guides became the solved aspects.**

### ⚠ WHAT THIS ENTRY DOES NOT SETTLE

⛔ **`WallCardText` stays commented out.** Its 420x260 box is the 1.615 aspect the solve disproved. ⚠ **Uncommenting it reintroduces the error.**

---

## D-083 — Chunk 2a: CS's Frosted Face Is Built And Gated. Transmission Needs An Environment Map, And The Bench Has None

**Date recorded:** 2026-09-18
**Status:** ⚠ **IMPLEMENTED, NOT APPROVED.** ⛔ **Carl's verdict is PENDING and CANNOT be given yet** — the material is not judgeable until the environment-map question below is answered. ⚠⚠ **COMMITTED ON CARL'S INSTRUCTION, 18 September. ⛔ COMMITTING IS NOT APPROVING** — the code is on `main` so it travels with the record that describes it, and **this entry is the status.** A later reader must not read "it is in `main`" as "Carl accepted it."
**Authority:** Human Founder — Carl, 17 September 2026, approving the plan: *"The plan is approved."* ⛔ **That authorises the BENCH only.** The three rulings it carries: thickness *"9.80mm"*, *"Confirm Option A"*, and *"The figures were presented as a starting point."*
**Bears on:** `components/about/about-card-glass.ts` (new), `about-card-mesh.tsx`, `card-bench.tsx`, `verify/about-cards-still-grey.mjs` (new). Spec: `live-work/chunk2-plan-amended-17-september.md`. Follows **D-051** (satin on `/start`, NOT reopened).

---

### ⛔⛔ THE FINDING — TRANSMISSION TAKES ITS SPECULAR AND IBL FROM AN ENVIRONMENT MAP

**The glass toggle works, the faders move, the photographic proxy loads and is plainly visible around the card — and the FACE renders near-black and barely responds to either fader.**

**Measured from screenshots, face-centre luminance:**

    glass OFF                          113.2   <- correct, lit grey
    glass ON                             2.2
    roughness swept 0 -> 0.5          2.2 -> 3.1
    thickness swept 0 -> 40mm         2.2 -> 2.2   (no response at all)
    a FULLY EMISSIVE proxy behind     2.2 -> 6.1
    ⛔ an <Environment> in the scene   2.2 -> 56.8  <- 26x. THE CAUSE.

⛔ **With no environment map there is almost nothing for the face to return**, so it reads black whatever the faders say. ⚠⚠ **THE PARAMETERS ARE NOT THE VARIABLE — `thickness: 0` and `roughness: 0` are the near-clear case and render identically black.**

⚠ **THIS IS WHY `/start`'s GLASS BUILDS ONE DELIBERATELY.** `answer-card-canvas.tsx` generates a local env map with `PMREMGenerator` at a measured **~572ms**, and that file already records `envMapIntensity` ramping from black as *"what produced the black rectangle."*

⚠⚠ **OVERTAKEN BY D-084, 18 September 2026 — READ THIS BEFORE THE SECTION BELOW.** ⛔ **The finding that follows is TRUE OF THE FROSTED FACE AND FALSE OF THE CLEAR RIM.** The backplate supplies the face; **the rim CANNOT RENDER AT ALL without an environment map**, because at `transmission: 1` there is no diffuse colour and transmissive objects are excluded from the transmission target. ⚠ **The distinction did not exist when this was written — Carl ruled the rim clear on 18 September, a day later.** ⛔ **The entry is not wrong; a fact it relied on moved.** See D-084.

### ⛔⛔ WHAT THE ENVIRONMENT MAP SHOULD BE IS CARL'S, AND IT IS §5a-SHAPED

**A drei `preset` was used as a DIAGNOSTIC ONLY and has been REMOVED.** ⚠ **It also lifted the control from 113 to 225 — it lights the whole bench, not just the glass.** It is not the answer.

⛔ **A room-derived env map — plausibly built from the plate the proxy already crops — is the obvious candidate and is NOT an implementation detail.** It is a new expensive GPU resource with a measured cost on the precedent, and §5a's first category is *"a second instance of an expensive resource."* **It goes to Carl before it is built.**

### ⛔ WHAT IS BUILT AND WHAT IT HOLDS

- **`about-card-glass.ts`** — constants, each labelled with its provenance. ⛔ **Only `GLASS_THICKNESS_MM = 9.8` is Carl's**; the rest are marked a starting point in the file AND in the bench UI.
- ⛔ **THICKNESS IS A TYPED CONSTANT, NOT `heightMm * TENT_POLE_RATIO`** — that expression gives **28.6mm**, not the 9.80mm Carl approved. **The coupling to the crown is DECLINED**, so the crown can be re-tuned without dragging the glass with it.
- ⛔ **THE A2 GATE.** `about-card-mesh.tsx` is shared by **all four room cards**, so the glass sits behind a prop that is **OFF by default**. ⚠ **Verified by LOADING `/about` and measuring, not by reasoning** — CD 112.0, CS 37.4, channel spread < 2.
- ⛔ **The face is WHITE, not `DIAG_FACE_COLOR`** — transmission is multiplied by `color` and the grey would tint the *"colourless"* glass to **78%**.
- ⛔ **The stale comment at `card-bench.tsx:109` is CORRECTED.** It claimed `TENT_POLE_RATIO = 0.025` against a code value of **0.073** and produced a 2.92x thickness error in a plan put to Carl. ⚠ **The live value is deliberately NOT repeated there — naming it twice is how it went stale.**

### ⚠⚠ THREE BUILDER ERRORS, AND THE THIRD IS THE ONE THAT MATTERS

| | |
|---|---|
| **B1 — a probe that could not fail** | The first probe read the canvas via `drawImage` into a 2D context and reported **0/0/0 at every setting, INCLUDING GLASS OFF**, where the screenshot plainly shows a bright grey face. `preserveDrawingBuffer: false` makes that readback empty. ⛔ **Caught only by running a control with the feature OFF.** |
| **B2 — a false mechanism, reasoned in full and written down as fact** | The black face was attributed to `alpha: true`: target cleared at alpha 0.5 (`three.module.js:18019`) → `transmission_fragment:31` → `opaque_fragment:7`. ⚠⚠ **Every line is really in three 0.185.1 and it predicted the exact symptom. `alpha: false` changed the number by 0.0.** ⛔ **It was written into a code comment BEFORE being tested.** Recorded, not deleted, in `card-bench.tsx`. |
| **B3 — a threshold chosen by assertion** | The A2 harness opened at `MILKY_LUM = 170`, picked before either population was measured. ⛔⛔ **On the red run the defect measured 167.2 AND THE HARNESS RETURNED PASS.** It missed the defect it exists to catch, by 2.8 points. **Now 140, measured between both populations.** |

> ⛔⛔ **THE PATTERN: A CONFIDENT EXPLANATION WAS PRODUCED TWICE BEFORE IT WAS TESTED.** B2 was verified line-by-line in `node_modules` and was still wrong, **because verifying that a mechanism EXISTS is not the same as verifying it is THE ONE ACTING.**

⚠⚠ **B3 IS THE GENERAL LESSON. A harness written specifically to prevent this project's recorded failure class committed it on its first run** — `q5-stutter.mjs` read 0/3 CLEAN on a visible stall; `one-context.mjs` read 2/2 while a context was created every question. **All failed toward a PASS, and so did this.**

### ⚠ THE HARNESS IS PROVEN-CAPABLE BUT NOT ADMISSIBLE

**`verify/about-cards-still-grey.mjs` was run against the defect** — glass forced on in the room — **confirmed RED at 167.2, reverted, confirmed green at 112.0.** ⛔ **It is still NOT admissible: `proven.json` is empty (D-064) and no entry was filed** — the write-up and the `emptyInput` block do not exist.

### ⛔ WHAT IS EXPLICITLY NOT DECIDED HERE

**The final roughness** (set in the room, in 2b — frost scale depends on render-target width) · **thickness for CD, CA and CB** at rollout · **the four neon colours** (four, all different, none chosen) · **`transmissionResolutionScale`** (after 2b measures) · ⛔ **and glass in the room, which 2a does not touch.**

---

## D-084 — The Room Becomes A Camera-Matched Depth Proxy. Five Attempts, And Two Faults In Committed Data

**Date recorded:** 2026-09-18
**Status:** ⚠ **IMPLEMENTED, NOT APPROVED.** ⛔ **Carl has not passed the room build by eye.** Verified for FRAMING only. Commit `f51e865`, pushed.
**Authority:** Human Founder — Carl, 18 September 2026: *"Yes, build the backplate and env map. It cannot be properly judged until its in place."* Option A was his by name on 17 September. ⚠ **The METHOD came from outside — see below.**
**Bears on:** `about-card-canvas.tsx`, `room-environment.tsx` (new). Supersedes the billboard approach in **D-083**; amends D-083's env-map finding.

---

### ⛔⛔ WHY THE ROOM HAD TO ENTER THE SCENE

**A DOM `<img>` behind a transparent canvas is invisible to the glass** — three never renders it. So transmission samples an empty target, cleared to **50% white** on an `alpha: true` canvas (`three.module.js:18019`), and CS reads as a **milky slab**. ⛔ **Not a tuning problem; the photograph had to become geometry.**

### ⛔ FIVE ATTEMPTS, AND THE THIRD IS THE ONE THAT DIAGNOSED IT

    1  flat plane, depth 30, exact FOV   bottom third of frame BLACK
    2  same + overscan 2.2               filled the frame but SCALED THE IMAGE — the
                                         room zoomed and every card sat against a
                                         framing its position was never solved from
    3  flat plane, depth 6               PIXEL-IDENTICAL to (1)
    4  projected from PLATE FRACTIONS    framing lost
    5  projected from SCREEN NDC         ⛔ WORKS

⚠⚠ **(3) IS THE USEFUL RESULT. A change that should have mattered did not — which proved the variable being tuned was never the cause.** ⛔ Measured: at VFOV 67.31 / pitch 12.68 **the bottom of the frame meets the floor at t = 1.38 camera units** while the back wall is ~16. **No single flat plane at one depth can be both.**

### ⛔⛔ THE BUG IN (4) — THE ONE WORTH REMEMBERING

Past a `FAR` limit it **clamped `z` and scaled `x` while leaving `y` untouched**, lifting the vertex **off the camera ray that generated its UV**. The vertex then drew its photograph pixel at the wrong screen position, **non-uniformly across the grid**.

⛔⛔ **THE CARDS NEVER MOVED. THE BACKGROUND'S CAMERA-TO-IMAGE MAPPING DID.** ⚠ That distinction cost most of an evening: the symptom reads as "the cards are misplaced".

### ⛔ THE FIX — EVERY VERTEX IS AN UNPROJECTED SCREEN POINT

    NDC point -> camera ray -> plane intersection -> vertex
    the SAME NDC point -> the photograph's UV

**Correct by construction; framing cannot drift.** ⛔ The horizon is handled by **bounding the grid**, never by clamping vertices. ⚠ **NDC round-trip verified at 2.22e-16.**

### ⚠⚠ THE METHOD CAME FROM OUTSIDE, AND THE PROVENANCE IS RECORDED

**Carl took the problem to ChatGPT on 18 September and pasted the answer back.** ⛔ **The second outside contribution to this chunk**, after the glass sandbox (D-083). It supplied the NDC architecture, the horizon bounding, the acceptance test and the round-trip check.

⛔ **ITS FIRST DIAGNOSIS WAS WRONG AND THAT IS KEPT.** It identified missing `object-contain` letterbox offsets. ⚠ **Measured: those are ZERO here** — the canvas wrapper is `aspect-[3/2]`, so the canvas box and the displayed image box agree to **0.00px at 1440 and 1920**. The real bug was the Builder's clamp.

⚠⚠ **THE METHOD IS STILL RIGHT, FOR A BETTER REASON THAN THE ONE GIVEN:** it fixes the clamp bug as a side effect, and being correct by construction rather than by coincidence **it survives the 800x1200 case where the boxes DO diverge by 338px.** ⛔ **A right method reached through a wrong cause — do not inherit the wrong cause as fact.**

### ⛔ THE ACCEPTANCE TEST — run it after any change here

> ⛔⛔ **WITHDRAWN AS EVIDENCE BY D-085, 18 September 2026 — THE FIGURES BELOW DID NOT MEASURE THE PROXY.**
> **The proxy's triangles were wound backwards and were culled by the GPU on every frame**, so it
> contributed **no pixels** to either side of this comparison: both were the DOM `<img>`. ⚠⚠ **A
> control comparing an image with itself returns 0.000 and proves nothing.** ⛔ **The numbers are
> kept, not deleted** — a future reader finding them in an old plan needs to find out here why they
> mean nothing. **The METHOD below is still right; only the claim that it was verified is gone.**

**Unlit proxy vs the CSS photograph, card-free regions, 0-255 scale:**

    ceiling strip  8.93   ·   far-left wall  4.70   ·   far-right wall  2.71

⚠ **Control (reference vs itself) = 0.000, so the comparison is sound.** ⛔ Agreement at 2.7-8.9 is **resampling noise, not displacement.** ⚠ **Opaque material FIRST, prove the framing, and only THEN enable transmission** — otherwise a projection error hides inside the glass effect.

⚠⚠ **AND THE OPAQUE-FIRST RULE IS THE ONE THAT WAS SKIPPED.** It is stated here and was not followed: had the proxy been proved painting with an opaque material before transmission went on, **the invisibility would have been caught on day one.** ⛔ **The rule was written down and not executed** — see D-085.

### ⛔⛔ AMENDS D-083 — AN ENV MAP *IS* REQUIRED, FOR THE RIM

**D-083 records that an environment map was "NOT required and NOT the answer."** ⚠ **That was true of the FROSTED FACE — the backplate supplies it — and is FALSE of the CLEAR RIM**, which did not exist as a question until Carl ruled the rim clear on 18 September.

⛔ At `transmission: 1` a clear material has no diffuse colour, and **transmissive objects are excluded from the transmission target** (`three.module.js:18039` renders `opaqueObjects` only), so **specular reflection is the only channel that can draw the rim.** ⚠ Measured: with no environment the all-glass card lost its silhouette entirely.

⚠ **`ENV_PLATE_INTENSITY = 6.0` IS A COMPENSATION, NOT A PHYSICAL VALUE** — it multiplies a photograph of a dim room by six to manufacture highlights the room does not contain. ⛔ **Revisit downward when the neon exists.**

### ⛔⛔ TWO FAULTS IN COMMITTED DATA, EXPOSED BY THE CORRECTED FRAMING

⚠⚠ **BOTH PREDATE THIS WORK. NEITHER IS FIXED. BOTH ARE CARL'S.**

**1. `GUIDE_CA_QUAD` / `GUIDE_CB_QUAD` DO NOT MATCH CARL'S PINNED CORNERS.** ⛔ The tell is **his own vertical-edge correction** (4 September): every bottom node should take its top node's x. **His file has that exactly; the code does not.**

    CA   code TL.x 0.17333  vs  BL.x 0.18944      Carl: BOTH 0.19766
    CB   code TL.x 0.59278  vs  BL.x 0.58944      Carl: BOTH 0.60731

**Worst error: CB's TR, out by 0.043 in x and 0.028 in y.** ⛔ Carl: *"CB is way out of alignment, the distance from the top edge to the ceiling is the giveaway."* ⚠⚠ **CORRECTING THE QUADS ALSO REQUIRES RE-DERIVING `CA_CARD_ASPECT` (2.327), `CB_CARD_ASPECT` (2.248) AND BOTH HEIGHTS** — all computed from the wrong quads on 17 September (D-082). **Source of truth: `live-work/wall-card-corners-4-september.md`.**

**2. CB'S CEILING DROP IS UNRESOLVED IN THE PINNED DATA ITSELF.** ⛔ **Not a code fault and not fixable by arithmetic.** That file lists it under *"What is still open"*: **CB's TR sits at y = 0, hard against the pinning tool's top edge**, while CA's TL is at 0.02849. Carl's rule — *"The distance from the ceiling must be the same for CA and CB. Its like hanging a picture"* — **was never satisfied.** ⚠ **The old letterboxed framing hid it; a correctly-framed room shows it.** ⛔ **Needs Carl to re-pin CB in `/proto/wall`.**

### ⚠ WHAT IS DELIBERATELY NOT DONE

⛔ **`?guides=1` draws the quads, the floor rects and the PL/PR rails. THEY MUST COME OUT BEFORE THIS SHIPS.** · The proxy is **one floor plane plus one wall plane** — desks, chairs and plants are painted on and have no depth, which is accepted; ⛔ **it is a depth proxy, NOT a 3D reconstruction, and must not be grown into one.** · The PMREM cost in the room is **unmeasured**; the `/start` precedent is ~572ms for a different scene.

---

## D-085 — The Depth Proxy Was Never Visible. Its Triangles Were Wound Backwards, And Every Instrument Reported Green

**Date recorded:** 2026-09-18
**Status:** ⚠ **IMPLEMENTED, NOT APPROVED.** ⛔ **Carl has not passed the result by eye.** Two defects fixed; the cards are measured unmoved.
**Authority:** Human Founder — Carl, 18 September 2026: *"The most important thing at this stage is that card position and geometry MUST NOT change. Fix then write."*
**Bears on:** `about-card-canvas.tsx` (`RoomBackplate`). ⛔ **Corrects D-084's acceptance test, which passed against the wrong thing.**

---

### ⛔⛔ THE FAULT — BACK-FACING TRIANGLES, CULLED BY THE GPU

**The proxy built in D-084 never appeared on screen for a single frame of its first day.** The index order `a, a+DIV+1, a+1` winds **clockwise** as seen from this camera, so all 4,608 triangles were back-facing and discarded under the default `FrontSide`.

⛔ **IT WAS NEVER FRUSTUM-CULLED AND NEVER HIDDEN.** `onBeforeRender` **fired every frame** — the mesh reached `renderObject()` and was submitted to the GPU, which then dropped it at the face-culling stage. `visible: true`, texture bound, `frustumCulled={false}` changed nothing.

⚠⚠ **HOW IT HID FOR A WHOLE SESSION: the room LOOKED right.** The DOM `<img>` sat behind a transparent canvas exactly as before the proxy was written. ⛔ **A layer contributing nothing is indistinguishable from one that works, when something else is already drawing the same picture.**

### ⛔⛔ AND IT EXPLAINS THE CONTRADICTION THAT LOOKED IMPOSSIBLE

**CS refracted a room that was not on screen.** Three's transmission pass temporarily flips `material.side` to `BackSide`, so the proxy was **visible to the glass and culled in the main pass.** ⚠ **Two observations that appeared to contradict each other, one cause.** The `side: 1` reading in a live scene dump — which nothing in the source sets — was this flip caught mid-pass.

### ⛔ THE FIX — INDEX ORDER ONLY

    was:  idx.push(a, a + DIV + 1, a + 1,  a + 1, a + DIV + 1, a + DIV + 2)
    now:  idx.push(a, a + 1, a + DIV + 1,  a + 1, a + DIV + 2, a + DIV + 1)

⛔ **POSITIONS AND UVs ARE UNTOUCHED.** No vertex moves, so no card geometry can shift. **`side` is NOT set** — the default `FrontSide` now works because the winding is right, rather than being papered over with `DoubleSide`.

### ⛔ SECOND DEFECT — THE HORIZON SIGN, REAL AND SEPARATE

`nyHorizon = SIN_P / (COS_P * tanV)` returned **-0.33794**; the horizon is **+0.33794**. From `rayDir`, `y = ny*tanV*COS_P + SIN_P`, so `y = 0` gives `ny = -SIN_P/(tanV*COS_P)`. **The minus was dropped.** Verified by substitution: at +0.33794 the y-component is **2.8e-17**; at -0.33794 it is **-0.43901**, which is not a horizon.

⚠⚠ **THE COMMENT WAS RIGHT WHILE THE CODE WAS WRONG.** The note above the line read *"ny ~= 0.400"* — positive — directly above a line computing a negative. ⛔ **Nothing checked that the two agreed.** Same class as every prose invariant on this record.

⚠⚠ **THIS WAS NOT WHY THE PROXY WAS INVISIBLE, AND THE DISTINCTION MATTERS.** Both grids build finite, bounded, NaN-free vertices either way. ⛔ **Fixing the sign alone would have changed nothing on screen** — a real bug that would have looked like a failed fix. `WALL_Z` moves from **-2.04 to -78.68**, far closer to the ~16-unit back wall the record describes.

### ⛔⛔ D-084's ACCEPTANCE TEST MEASURED THE PHOTOGRAPH AGAINST ITSELF

**Its figures — ceiling 8.93, far-left 4.70, far-right 2.71, control 0.000 — are withdrawn as evidence of proxy framing.** The proxy contributed **nothing** to either side of that comparison; both were the DOM `<img>`. ⚠ **A control comparing an image with itself agrees perfectly and proves nothing.** The NDC round-trip at **2.22e-16** is likewise uninformative — it verified the maths of a mesh that never rendered.

⛔ **D-084's ARCHITECTURE IS NOT WITHDRAWN.** Unprojecting NDC through the solved camera is still right, and the `FAR`-clamp diagnosis still stands. **What is withdrawn is the claim that it was verified working.**

### ⚠⚠ WHAT THE INSTRUMENTS DID — FOUR WAYS TO REPORT GREEN ON A DEAD LAYER

| instrument | verdict | why it was wrong |
|---|---|---|
| D-084's acceptance test | ✅ agreement at 2.7–8.9 | compared the DOM image with itself |
| NDC round-trip | ✅ 2.22e-16 | correct maths, mesh never drawn |
| live scene dump | ✅ `visible: true`, map bound, 13,824 verts | present ≠ painted |
| `about-cards-still-grey.mjs` | — | watches card greyness, not the proxy |

⛔ **A GREEN GATE PROVES THE THING IT TESTS AND NOTHING ELSE.** None was asked *"does this layer contribute any pixels?"*

### ⛔⛔ A BUILDER PROBE THAT COULD NOT FAIL — CAUGHT BY ITS OWN CONTROL

An r3f-internals harness toggled scene objects and reported **0.0 delta** for hiding the backplate. ⚠⚠ **Its control — hide nine card meshes, expect a large delta — ALSO returned 0.0.** The canvas is `frameloop="demand"` with no `invalidate` call, so nothing repainted and **every number it produced was fiction.** ⛔ **Without the control it would have been reported as a finding.** Third instance of this class after the `drawImage` 0/0/0 probe and `q5-stutter.mjs`.

⚠ **A second harness was also discarded mid-session:** a CS edge-shift measure reported shifts up to 411px. Its "before" image contained **1,025 guide-line pixels** the "after" did not, so it was measuring dashed guides, then CD's rim. **Numbers withdrawn, not reported.**

### ⛔ THE CARDS DID NOT MOVE — MEASURED, NOT ASSERTED

Silhouette fingerprints, 1440x900, baseline at HEAD vs fixed:

    ✔  94,578,603,806  area 4003    IDENTICAL
    ✔ 112,489,609,664  area 56817   IDENTICAL   <- CD
    ✔ 257,162,625,314  area 23219   IDENTICAL

⚠ **CS's blob necessarily changed — it stopped being an opaque white slab. That is the fix, not a move.** ⛔ **Confirmed by cropping CS's region from both frames: same outline, same corners, same slant; only the face changed from milky white to transparent frosted glass showing the desk and chair through it.**

`npx tsc --noEmit` clean. `npm run lint` = `1 problem (1 error, 0 warnings)`, the documented baseline.

### ⚠ WHAT IS STILL OPEN

⛔ **Carl has not approved the result by eye** — the glass is now judgeable for the first time, which is the point. · **`?guides=1` guide lines render WITHOUT the flag** — 1,025 guide-coloured pixels in a plain `/about` load. **Found while measuring, not chased. Reported, not fixed.** · **`ENV_PLATE_INTENSITY = 6.0` is still a compensation.** · **Roughness 0.35 was approved on the BENCH, not in the room.** · **PMREM cost in the room still unmeasured.**

### ⚠⚠ THE METHOD CAME FROM OUTSIDE AGAIN — AND ITS HEADLINE WAS WRONG

Carl took the problem to an outside AI. ⛔ **Its lead diagnosis — the horizon sign — was a REAL bug and NOT the cause.** Its claim that *"if frustum-culled it cannot appear in the transmission pass"* was sound reasoning pointing away from the answer; the mesh was never frustum-culled.

⚠ **ITS TEST ORDERING IS WHAT FOUND IT** — `onBeforeRender` plus one-variable-at-a-time isolation, better than the instrument the Builder was building. ⛔ **Third outside contribution to this chunk, and the second whose first diagnosis was wrong.** **Recorded so the wrong cause is not inherited as fact.**

---

## D-086 — The Card Copy Is BAKED INTO THE FACE, Because The Light Must Reach It. Recorded Four Days Late, From A Gitignored File

**Date recorded:** 2026-09-18
**Status:** ⛔ **APPROVED — Carl's ruling, 14 September 2026.** The RULING is his and settled; the IMPLEMENTATION is unbuilt and its texture budget is unmeasured.
**Authority:** Human Founder — Carl, 14 September 2026, and re-stated 18 September: *"i decided to use three js text that is affected by the scene."*
**Bears on:** `about-card-mesh.tsx`, `wall-card-text.tsx` (the DOM overlay this supersedes), chunk 3. ⛔ **Closes the shape of D-051-A11Y rather than repeating it four times.**

---

### ⛔⛔ THE RULING, AND THE REASON IS LIGHT

> ⛔ ***"If its a simple text overlay the light from the rim will have no effect. However, if its baked in this will have echoes of what im gonna do as part of the hero section."***

⛔ **AND THE LIGHT IS NOT ONLY THE RIM.** Carl: *"The light will come from the neon rim but also 4 individual lights pointed at each card."* ⚠⚠ **A DOM overlay forfeits BOTH.**

⚠ **The answer-card file states the same mechanism from the other side:** *"the text now catches the light exactly as the surface does… because the label is part of the material rather than sitting in front of it."*

### ⛔ WHAT THIS SUPERSEDES

**`components/about/wall-card-text.tsx` renders `text-white` DOM copy in an overlay div.** It is currently commented out at `app/about/page.tsx:663`. ⛔ **It is NOT the approved approach and must not be reinstated as one.** ⚠ It may survive as the `sr-only` accessibility copy — see below — but not as the visible text.

### ⛔⛔ ACCESSIBILITY IS NOT A TRADE-OFF, AND FRAMING IT AS ONE WAS A BUILDER ERROR

**A visually-hidden DOM copy gives screen readers and search the real text while the visible text stays in the material.** ⚠ The answer-card file already establishes that a correct DOM label becomes ***"MANDATORY, not optional"*** once text is a texture. ⛔ **Only the selection affordance is lost.**

⚠⚠ **THIS CLOSES D-051-A11Y's SHAPE.** That defect exists because answer-card text is baked with no DOM equivalent. **Baking four About cards without the `sr-only` copy would reproduce it four times over.**

### ⛔⛔ THE TEXTURE BUDGET IS THE REAL CONSTRAINT AND IT IS UNMEASURED

**The answer card bakes ONE LINE into 2048x512 = 4 MiB RGBA per card, ~27 MiB with mips across five**, uploaded synchronously, measured at **+108ms inside the 1300ms reveal — the largest single allocation in that window.**

⚠⚠ **THE ABOUT CARDS CARRY 49-84 WORDS.** A naive scale-up to 4096x2048 is **32 MiB per card before mips, four times over.**

⛔ **THREE ROUTES, ALL CHEAPER, TO BE SIZED BEFORE THE FIRST CARD IS BUILT — NOT DISCOVERED IN A STALL:**
- **Size the texture to the real face.** The answer card's oversample measured **>=11x linear, >=121x by area**, against a justification wrong by 3x *in the flattering direction*. **There is a great deal of headroom before crispness is at risk.**
- **Signed-distance-field text** — crisp at a fraction of the resolution, the standard answer for paragraphs in WebGL.
- **Bake + `sr-only` DOM copy.**

⛔ **FORWARD POINTER, 23 September 2026 — D-094 carries the text direction.** ⚠ The ruling here (text in the scene, never a DOM overlay; the `sr-only` copy mandatory) **stands.** D-094 adds Carl's setting rules and weighs the three routes above against them — **troika measured unable to guarantee a crafted setting.**

### ⛔ THE HERO CALLBACK — RECORDED ON CARL'S EXPLICIT INSTRUCTION

> ⛔ ***"The hero section follows the same idea but is much more sophisticated with moving object animation and a light pinned to it that changes colour as the object changes colours and the 3D text on the left, its edges catch the light. The About section can be seen as the child of the Hero."***

⚠ **THE HERO'S BRIEF IS NOT IN THIS REPOSITORY — D-070, stricken deliberately.** The sentence is recorded because Carl instructed it and **it governs the About cards' technique.** ⛔ **It is NOT a hero specification and a session cannot plan the hero from it.**

### ⚠⚠ WHY THIS ENTRY EXISTS — THE RECORD FAILED IN THE EXACT WAY D-074 NAMES

⛔ **The ruling was taken on 14 September and lived ONLY in `live-work/structural-decision-note-about-canvas.md` §6.2 — a GITIGNORED scratch folder — with no `decisions.md` entry for four days.**

⚠⚠ **AND IT MISLED A SESSION ON 18 September.** The Builder, asked whether the card text is readable without the neon rim, **read `wall-card-text.tsx`, found DOM `text-white`, and answered "Yes — legibility does not depend on the neon at all."** ⛔ **That was the superseded approach, and nothing canonical said so.** Carl corrected it: *"This is out of date… Find out about what was decided for this section, it may not have been recorded, when it should of."*

⛔⛔ **THE CORRECT ANSWER IS THAT IT IS UNKNOWN AND IS A REAL DESIGN CONSTRAINT.** If the copy is part of the material, **how legible it is under an unlit or flickering rim is a question the neon work must answer, not assume.** ⚠ **The text and the neon are ONE problem, not two.**

⚠ **Second instance of D-074's failure mode in this chunk**, after §1's copy, the room image and §10a. **An approval living only in a folder scheduled for deletion is not recorded.**

### ⛔ WHAT THIS ENTRY DOES NOT DECIDE — all Carl's, all open

- **Which baking route** — size-to-face, SDF, or another. **Unmeasured; measure before building.**
- **Whether the neon flickers at all, and in what pattern.** ⚠ An imperfect ignition is a **broken-tube cue** and is *"the most effect-like thing proposed"* — in tension with §14a's *"emotional discipline of Comfortably Numb"* and *"nothing should feel like a sudden UI toggle unless there is a deliberate reason."* ⛔ **Carl's call, made deliberately.**
- ⛔⛔ **FOUR NEON COLOURS, ALL DIFFERENT, NONE CHOSEN.** Carl, 17 September: *"No colour is decided yet, but there will be 4 and all different."* ⚠⚠ **RED IS NOT A DECISION AND MUST NOT BE INHERITED FROM THE DIAGRAMS** — *"Red was just an example i used to describe the problem."* ⛔ **Each card spills its colour onto the photograph and its neighbours, so the palette determines WHAT COLOUR THE ROOM TURNS.** ⛔ **SUPERSEDED 22 September — the neon is BLUE (D-090, amended).**
- **Duty cycle before periods** — how often the room may go fully dark, and for how long. ⛔ **Compute the rest pattern from the duties FIRST, then pick periods.**
- **Whether CA strikes first.** ⚠⚠ **A strict sequence is in tension with Carl's own ruling that NO CARD IS A STEP** — *"Dont think in linear terms."*
- **`prefers-reduced-motion`** — unhandled, and belongs with the timing mechanism.

⛔⛔ **EVERY NUMBER IN THE SOURCE NOTES IS HELD AND MUST NOT BE IMPLEMENTED AS A STARTING POINT** — rim 100%, glass 20-40%, text 10-25%, wall/floor 2-5%, ceiling 1-2%, cross-card 0.5-2%, the 50-150ms delay, hold times, flicker steps. ⚠⚠ **THE PRECEDENT COST A DAY: the face crown opened at an outside recommendation's 0.015-0.03 and Carl's eye settled it at 0.073 — nearly THREE TIMES the recommended start.** ⛔ **The failure mode is not a wrong value, it is an ANCHOR: a number already in the code becomes the thing Carl's judgement is argued AGAINST, rather than the input it should be.**

---

## D-087 — The Neon Is A LOOP Of Incommensurate Periods. Mouse Proximity And Real Randomness Were Raised And NOT Chosen

**Date recorded:** 2026-09-18
**Status:** ⛔ **DIRECTION SETTLED, VALUES OPEN.** The loop is Carl's choice; the periods, duties, colours and ignition style are all his and unchosen. **Nothing is built — chunk 3.**
**Authority:** Human Founder — Carl, 11 September 2026, expanding on the loop. **Recorded 18 September on his instruction:** *"When im brainstorming at the start of a section things i mention, albeit provisionally should be recorded. Its clear that some ideas were not."*
**Bears on:** chunk 3, `about-card-mesh.tsx`, the Fusion glow plates. ⚠ Pairs with **D-086** — the baked copy is lit BY this neon, so the two are one problem.

---

### ⛔⛔ THREE OPTIONS WERE RAISED. ONE WAS CHOSEN BY BEING EXPANDED ON

> *"Our scene needs to be alive."* — *"We could put them on a loop, **or mouse proximity, or add an element of randomness.** Still technically on a loop but appearing more random."*

⛔ **THE LOOP IS THE CHOICE.** Carl then expanded only on it, and ⚠⚠ **THE EXPANSION *WAS* THE DECISION** — Carl, 18 September: *"These were options, however when i expanded on an idea i had settled on it should of been clear that the other 2 ideas had not been chosen."*

| option | status |
|---|---|
| **A loop of incommensurate periods** | ⛔ **CHOSEN** |
| **Mouse proximity** | ⛔ **RAISED, NOT CHOSEN.** Never mentioned again after the sentence that raised it. |
| **Real randomness** | ⛔ **RAISED, NOT CHOSEN** — and separately answered: it is not needed. |

⚠⚠ **NEITHER REJECTION WAS WRITTEN DOWN ANYWHERE UNTIL NOW, AND THAT IS THE DEFECT.** A future session reading the source sentence finds **three live options** and no indication that two are dead. ⛔ **Being dropped is not the same as being recorded as dropped.**

### ⛔ CARL'S MECHANISM, IN HIS WORDS

> *"I'm sure there's a way to have them on/off for **4,5,6,7,8s** and have some formula that with 4 boxes and 5 durations can 'randomise' the whole thing."*

**And his own frame for it:** ⛔ ***"It's like writing a song in 5/4. Every 4 bars complete the cycle."***

### ⚠⚠ NO RANDOMNESS IS REQUIRED — INCOMMENSURATE PERIODS DO IT

Four cards on periods that do not divide into one another produce a composite that repeats only at their **LCM**:

    periods 5,6,7,8  ->  LCM 840s  = 14 minutes
    periods 4,6,7,8  ->  LCM 168s  = 2.8 minutes

⛔ **4 AND 8 ARE A BAD PAIR** — 8 is a **multiple** of 4, so the two lock into a fixed relationship and visibly pulse together. **Two similar-looking sets differ five-fold.**

⚠ **Phase offsets and unequal on/off times extend it further at no cost** — on 5s / off 7s is a 12s cycle, not 10.

**Why a loop beats real randomness — three properties, and they are the argument:**
- ⛔ **REPRODUCIBLE.** The same moment always looks the same, so a screenshot is comparable and a change is verifiable. ⚠ **Random state cannot be checked** — and on this project an instrument that cannot be checked has cost days repeatedly.
- ⛔ **NO BAD STATES BY ACCIDENT.** Whether all four are ever dark together, and for how long, is **computable in advance** rather than discovered live.
- ⛔ **TUNABLE BY EAR**, which is how Carl works (D-035, the DAW model).

### ⛔ TWO ARCHITECT CORRECTIONS, BOTH ACCEPTED

**1. "Coprimality buys the length" is LOOSE.** {5,6,7,8} is **not** pairwise coprime — 6 and 8 share 2 — and still gives 840s. ⛔ **LCM is the quantity.** 4-and-8 fails because 8 is a **multiple** of 4, not because they share a factor. {5,7,8,9} gives 2520s.

**2. ⛔⛔ LENGTH PAST A COUPLE OF MINUTES IS VANITY — DUTY CYCLE IS THE REAL LEVER.** No viewer tracks a 14-minute cycle. What they notice is **how often the room goes dark**:

    all-dark fraction = product of (1 - duty_i)

    50% duty each                  -> 6.25%   a rest every few seconds, too often
    on/off (4,1)(5,2)(6,2)(7,2)    -> periods 5/7/8/9, pairwise coprime, LCM 2520s
                                      duties 0.80/0.71/0.75/0.78
                                      all-dark 0.32% — a rest of a second or two,
                                      roughly once every five minutes

⛔ **COMPUTE THE REST PATTERN FROM THE DUTIES FIRST, THEN PICK PERIODS. The plan had that ordering backwards.**

### ⚠ ALL-FOUR-DARK IS A REST, NOT A FAULT

**In the 5/4 frame a rest is written, and a rest before a downbeat is what makes the downbeat land.** ⛔ How long, how often and where it falls are **all computable from the periods before anything is built.**

### ⛔ THE CLOCK MUST NOT BE A MOUNT TIME

⚠ A loop driven from component mount is not reproducible and drifts per visitor. **Stop dead when the tab is hidden, phase-correct on the first frame back**, and add a **`?neon=<seconds>` freeze so a screenshot is comparable.** ⛔ **The reproducibility argument above is void without this.**

### ⛔ `prefers-reduced-motion` IS UNHANDLED AND BELONGS WITH THE MECHANISM

**A continuous on/off loop is motion.** This project honours the query throughout — ⚠ **the one accepted lint error is that very effect.** Under reduced motion the neon **holds a steady state.** ⛔ **Architect's placement: with the timing mechanism, NOT deferred to chunk 3.**

### ⚠ WHAT IS STILL OPEN AND IS CARL'S

- **Whether the four are independent voices or some move together.**
- **The exact periods and duties.**
- **Whether "lit" is binary or has levels.**
- **The ignition style** — deferred by Carl: *"does the neon pop on, fade on or flicker on? We can sort this out when it's time to do so."* ⚠ **Not three styles: real neon strikes with a stutter and holds; a clean fade is LED behaviour.** ⛔ And an imperfect ignition is *"the most effect-like thing proposed"*, in tension with §14a's *"emotional discipline of Comfortably Numb"*.
- **Whether CA strikes first.** ⚠⚠ **A strict sequence is in tension with Carl's own ruling that NO CARD IS A STEP** — *"Dont think in linear terms."*
- ⛔⛔ **FOUR COLOURS, ALL DIFFERENT, NONE CHOSEN** — and **red must not be inherited from the diagrams.** ⛔ **SUPERSEDED 22 September — four colours WITHDRAWN; the neon is BLUE. See D-090, amended.**

---

## ⛔⛔ THE STANDING RULE THIS ENTRY ESTABLISHES — Carl, 18 September 2026

> ⛔ ***"When im brainstorming at the start of a section things i mention, albeit provisionally should be recorded. Its clear that some ideas were not."***

**A brainstorm at the start of a section is a source of record, not conversation.** ⛔ **Write down what Carl raises, including what he does not pick — and mark which is which.**

⚠⚠ **AND THE HARDER HALF: AN IDEA CAN BE CHOSEN BY BEING EXPANDED ON.** Carl does not always say *"I reject A and B."* **He raises three, then develops one.** ⛔ **The development IS the decision, and the other two are then DEAD — record them as raised-and-not-chosen rather than leaving them to read as live options.**

⚠ **WHY IT MATTERS, CONCRETELY.** Mouse proximity sat in a quoted sentence in a gitignored file with nothing to say it had been dropped. **A future session planning chunk 3 would have found three live options and no way to tell which Carl had settled on** — and would have asked him to decide something he decided on 11 September.

⛔ **Same family as D-074 and D-086: a decision that exists only in `live-work/` is not recorded.** ⚠ **Third instance in this chunk.**

---

## D-088 — The Mark Travels: Desk In §2, Into The Player In §3. The Poster Is Ruled Out

**Date recorded:** 2026-09-18
**Status:** ⛔ **PROPOSED — Carl's direction, and he expects to run with it.** *"This is further discussion for an idea that i think would work well… We will probably run with this."* ⚠ **Not APPROVED and nothing is authorised to build. Recorded so the details can be worked out at the appropriate time.** ⚠ **AMENDED 22 September (end of entry): the mark now STARTS ON THE RIGHT WALL, gold, and the SCROLL pulls it off — a simple 2D fall into §3, gold to platinum-blue, reversible.**
**Authority:** Human Founder — Carl, 18 September 2026.
**Bears on:** `/about` §2 and §3, `about-card-canvas.tsx`, the §3 player. ⛔ **Supersedes the POSTER ruling of 1 September.** ⚠ Answers Carl's own §3 clue.

---

### ⛔⛔ THE POSTER IS RULED OUT — AND THE REASON IS THE CARDS GREW

**Carl, 18 September:** *"The cards are bigger than the first iteration, theres no room for a poster but that doesnt mean the logo cant be used."*

⚠⚠ **THIS SUPERSEDES *"Its going in there"* (1 September), WHICH IS OTHERWISE STILL WRITTEN AS SETTLED.** ⛔ The poster argument depended on **negative space behind the setup, "where nothing else is happening"** — and that space is now occupied by the wall cards. **The reasoning did not fail; its premise moved.** ⚠ Classic overtaken decision, `context-rules.md`: *"a cost/benefit judgement expires when either side moves."*

⛔ **WHAT SURVIVES THE POSTER'S DEATH, because it was never about the poster:**
- **The mark makes it THIS workspace** — *"this is where C2B is made"*, not a generic studio.
- ⛔ **IN THE WORLD OF THE IMAGE, NOT COMPOSITED ON TOP.** A real object in a real space.
- ⛔ **DISCOVERED RATHER THAN ANNOUNCED.** ⚠ Warm at low saturation against a cool field reads as WARM long before it reads as GOLD.

### ⛔ THE PLACE — THE RIGHT DESK, RIGHT OF THE MOUSE

**Carl:** *"Look at the right desk on its right side, to the right of the mouse. Do you think theres room to put a Logo there?"*

⚠ **MEASURED, AND THERE IS.** Inspected on the plate: right of the iMac sit a speaker, a small succulent and a dark cylindrical speaker, then **the desk surface runs out to the right and is EMPTY** before the snake plant.

⛔ **AND IT IS CLEAR OF THE CARDS. CB's lowest point is y 0.3785; the desk surface sits around y 0.50-0.62.** **CB stops well above it** — the mark would occupy genuinely unoccupied space, not sit behind glass.

**Three reasons this beats the poster on its own merits, not only on space:**
- ⚠ **IT IS A LIT SURFACE.** The desktop catches the wall wash and the iMac's glow, so a reflective mark picks up the room. **A poster on a wall in shadow sits flat.**
- ⛔ **AN OBJECT ON A DESK IS WHAT THE MARK ALREADY IS.** `c2b-logo-mark.png` and `c2b-logo-blue-mark.png` are **physical half-tube objects with real specular** — the same rim/bevel/lit-core construction as the answer card. **A poster would have flattened that.**
- ⚠ **IT STARTS IN THE RIGHT HALF OF THE FRAME**, which is where §3's player goes. **It begins on the side it must exit from.**

### ⛔⛔ THE TRAVEL — AND IT ANSWERS CARL'S OWN §3 CLUE

**Carl, 18 September:** *"When scrolling to Sec 3 it moves, comes with us and at a certain point when the player comes into view — jumps in the screen."*

⚠⚠ **THIS IS THE ANSWER TO THE CLUE CARL SET ON 1 SEPTEMBER AND REFUSED TO CONFIRM:**

> ⛔ *"The gold logo already exists in some form in 1 and 2. It stops at 2. How would it get in the TV?"*

⛔ **IT CARRIES ITSELF THERE.** ⚠ **Not two instances of a logo on one page — ONE OBJECT, the whole way down**, which is what *"Connectivity. Same world."* demands.

⛔⛔ **AND IT SOLVES §3's IDLE-PLAYER PROBLEM IN THE SAME MOVE.** Carl: *"Sec 3 will have a video player on the right hand side, it cannot be idle and must contain something. Possibly a Logo image, before a video is chosen."* ⚠ **The screen is not empty before a video is chosen, because the thing that just arrived is in it.**

⛔ **§2's MARK AND §3's PLACEHOLDER ARE THEREFORE ONE PIECE OF WORK, NOT TWO.**

### ⛔ FOUR NEON COLOURS IS NOW DOUBTED BY CARL

⛔ **RESOLVED 22 September: four colours WITHDRAWN by Carl — *"too loud and seem out of place."* The neon is BLUE; the gold is the mark's alone. See D-090, amended.**

**Carl, 18 September:** *"I did rule 4 colours but i think that would be too much."*

⚠ **D-087's "four, all different, none chosen" is NOT withdrawn — it is doubted by its author.** ⛔ **No new number is chosen.** ⚠ The concern matches what the record already flagged: *"the site's established language is narrow: gold, platinum-blue, amber"*, and **each card spills onto the photograph and its neighbours, so the palette decides what colour the room turns.** **Four fighting colours make mud.**

⚠ **AND TWO STRONG NEON OBJECTS ALREADY EXIST** — `c2b-logo-mark.png` (gold) and `c2b-logo-blue-mark.png` (platinum-blue), both already half-tube neon with a lit core. ⛔ **Carl: *"The Gold and Blue are strong."*** **Whether §2 uses two colours, or one with variations, is open.**

### ⚠ THE `/start` PRECEDENT CARL POINTED AT

**Carl:** *"Look what we did in the contact/start section. Look what the Logo does after the 'Begin' button is pressed."*

⛔ **THE MARK TRANSFORMS IN PLACE AND NEVER MOVES.** Two marks stacked at one pinned point; a radial mask rides the GOLD layer while the blue cross-fades underneath. **Begin: gold clipped 150%->0%, OUTSIDE IN** — *"right at the centre of the logo the gold would be the last thing to disappear."* **Client info: 0%->150%, INSIDE OUT.** D-062/D-063.

⚠⚠ **THE PRECEDENT IS *THE MARK RESPONDS TO PAGE STATE*, NOT *THE MARK MOVES*.** ⛔ **D-065 makes it constant and immobile site-wide.** **§2/§3 proposes something genuinely new: a SECOND instance that travels.** ⚠ **Whether that enriches D-065 or contradicts it is CARL'S and is unresolved.**

### ⛔⛔ WHAT MUST BE SETTLED BEFORE THIS IS BUILT — §5a APPLIES

⚠ **THIS IS STRUCTURAL AND IS NOT AUTHORISED.** Raised now so it is not discovered mid-build:

1. ⛔ **A SCROLL-LINKED ANIMATION IS A NEW MECHANISM. THE SITE HAS NO PRECEDENT FOR ONE** — nothing currently moves with scroll. **A new lifecycle for the canvas, which today mounts once and draws on demand.**
2. ⛔⛔ **THE HAND-OFF IS THE HARD PART.** The mark leaves a **3D scene** and enters a **DOM player** in another section. ⚠ **Two different coordinate spaces, and the moment of transfer is where it looks either wrong or magical.**
3. ⚠ **`prefers-reduced-motion`** — a travelling mark would be the site's most prominent motion.
4. ⚠ **WHICH MARK, AND WHAT HAPPENS TO ITS COLOUR IN THE ROOM.** The neon spills onto the photograph, so a gold mark under a magenta card is not gold. ⛔ **The mark's colour is load-bearing on `/start`.**
5. ⚠ **Does the pinned top-left mark persist while the travelling one moves** — two marks visible at once, or one?

### ⚠ RECORDED UNDER THE D-087 RULE

**This entry exists because of the standing rule added the same day:** a brainstorm is a source of record, and provisional ideas are written down. ⛔ **Carl: *"It should be recorded so the details can be worked out at the appropriate time."*** ⚠ **PROPOSED is the honest status — he expects to run with it, and has not ruled.**

### ⛔⛔ AMENDED 22 September 2026 — THE MARK STARTS ON THE WALL, AND THE SCROLL PULLS IT OFF

⚠ **STILL PROPOSED. Nothing is authorised to build.** Recorded under the D-087 rule.

**WHY THE WALL IS BACK — THE POSTER'S PREMISE MOVED AGAIN.** The poster died for **lack of wall space** (above). ⛔ **The 4:3 pillarbox work (22 September) created wall that did not exist on 18 September:** the RIGHT band, whose column was deliberately left unrepaired. Carl: *"The bottom right hand side was a happy accident, serendipity... the right hand side is as room extension that was never planned but fixed a few problems."* ⚠ Carl, on the frame idea: *"It was ruled out for a lack of space. Your happy accident on the right hand side means it could be back on the table."*

**CARL'S DIRECTION, verbatim:**

> *"It can start off Gold on the right wall facing the user. There is no direct link from Sect 2 to 3. A user has to scroll. Scrolling can show the effect of the user 'pulling' it off the wall with the scroll action. It could 'tumble' off the wall to Sect 3 TV screen slowly transitioning to Platinum Blue along the way. The intensity of the Gold colour could be dialed down at first because of its location in the scene. But its Gold, there will still be plenty of contrast and it wont overpower other elements."*

> *"[Reversal is] just like deselecting an answer card choice in the q+a reverses the process."* — *"it doesnt have to tumble in a 3D way. Scroll dislodges it from the wall. We just need to give it some simple animation as it falls."*

| element | status |
|---|---|
| **Starts GOLD, on the right wall (the pillarbox band), FACING THE USER** | ⛔ **PROPOSED — replaces the desk as the starting point.** ⚠ The band's stretched skirting runs horizontal, so it reads as a wall facing camera; a square-on mount agrees with it. **Builder's observation, not measured.** |
| **Gold dialled down at first, for its place in the scene** | ⛔ PROPOSED — *"it wont overpower other elements."* |
| **SCROLL-DRIVEN, not triggered — the scroll dislodges it** | ⛔ PROPOSED. ⚠⚠ **The user CAUSES it — §14a's *"caused by the world"*, with the visitor's hand as the cause.** |
| **REVERSIBLE — scrolling back returns it, like deselecting an answer card** | ⛔ PROPOSED. ⚠⚠ **This answers D-092's replay question FOR THIS OBJECT:** motion the user drives cannot become wallpaper. **The neon still needs D-092's trigger; the mark does not.** |
| **A SIMPLE 2D FALL, not a 3D tumble** | ⛔ PROPOSED. ⚠ **Removes the flat-asset problem** — both marks are 2D renders of a half-tube and would thin to a line edge-on. |
| **Gold -> platinum-blue ON THE WAY, arriving as §3's idle-player content** | ⛔ PROPOSED. ⚠ **D-063's radial reveal is an approved C2B colour gesture and a CANDIDATE for the change — not chosen.** |

#### ⚠⚠ WHAT THE WALL START CHANGES STRUCTURALLY

⛔ **THE BAND IS DOM, OUTSIDE THE WEBGL CANVAS; §3's PLAYER IS DOM. A 2D fall need never enter the 3D scene.** ⚠⚠ **So the hand-off this entry calls *"the hard part"* — 3D scene into DOM player — MAY NOT EXIST on this route.** **The Builder's reading, not tested.**

⚠ **Consequences of the mark living in the DOM:** its light on the room would cross DOM -> canvas (the opal-style coupling, D-091), and **the cards' glass will not see it** — it is not in the scene.

#### ⛔ OPEN, AND CARL'S

1. ⛔ **D-065, *"No movement, only change."*** The pinned header mark does not move; this is a SECOND mark, an object in the room. **Whether that enriches D-065 or contradicts it is unresolved** (point 5 above still applies: two marks visible at once, or one?).
2. ⛔ **D-063, *"BLUE BELONGS TO THE Q+A AND NOTHING ELSE."*** The mark arrives in §3 blue. **Whether §3 earns blue, or blue gains a second meaning, is Carl's.** ⚠ The same objection bears on D-090's neon colours.
3. ⛔⛔ **THE BAND'S WIDTH IS VIEWPORT-DEPENDENT.** Measured 22 September: **~240px at 1920x950, ~143px at 1920x1080, ~118px at 1600x900, 0px at 3:2 and narrower** — laptops, tablets, phones. **Where the mark hangs when there is no wall is unanswered.** ⚠ The Builder suggested the desk as the fallback; **Carl has not ruled on that.**
4. ⚠ **Reduced motion.** The fall would be the site's most prominent motion. **D-063's precedent: the animation goes, the STATE stays** — gold on the wall, blue in the player, no journey.
5. ⛔ **§5a — A SCROLL-LINKED MECHANISM IS NEW TO THIS SITE.** ⚠ **Design it WITH D-092's activation trigger, not separately** — both need scroll position, and two mechanisms would be two things to keep in sync.

---

## D-089 — The Face Gets A BODY. Transmission Splits From The Rim's And Carl Settles 0.86

**Date recorded:** 2026-09-22
**Status:** ✔ **APPROVED — Carl's eye, on the built room, 22 September 2026.** *"Material is approved. Its a good basis to start from."* ⚠ **Approved as a BASIS: the neon (chunk 3) and lighting build on it. It is not a mastering-pass verdict and the card is not finished.**
**Authority:** Human Founder — Carl, 22 September 2026, after sweeping the fader to both ends on `/proto/card` and judging the result on `/about`.
**Bears on:** `about-card-glass.ts`, `about-card-mesh.tsx`, `about-card-canvas.tsx` (CS), `card-bench.tsx`. ⛔ **CS ONLY. CD, CA and CB are still diagnostic grey and their values are NOT decided by this entry.**

---

### ⛔⛔ THE FAULT — AT `transmission: 1.0` THE CARD HAD NO BODY OF ITS OWN

**Carl, 22 September, on the built room:** *"the blurring is working well due to the backplate but its difficult to make out the shape of the card at the moment."*

⚠⚠ **A `meshPhysicalMaterial` AT `transmission: 1.0` HAS NO DIFFUSE CONTRIBUTION AT ALL.** `about-card-glass.ts` already stated this **of the rim** — *"at `transmission: 1` a clear material has no diffuse colour"* — and it was **equally true of the face, where it was never the intention.** All three surfaces shared one constant at 1.0.

⛔ **SO EVERY PIXEL OF THE BODY WAS REFRACTED BACKGROUND OR SPECULAR REFLECTION.** The card took its brightness **entirely from whatever sat behind it.** ⚠ **Against the dark desk mass CS's left edge disappeared completely** — measured by eye on the render: the right edge traceable only because lighter floor sat behind it.

⚠ **`GLASS_COLOR` WAS INERT.** White multiplied into transmission at 1.0 contributes nothing. The constant carried a careful note about why it must be white rather than `DIAG_FACE_COLOR` grey — **correct, and doing nothing.**

### ⛔⛔ AND MORE ROUGHNESS WAS NOT THE FIX — THIS IS THE TRAP THE ENTRY EXISTS TO RECORD

**Carl's opening instinct was to increase the frost** — *"im thinking of making the frostedness more like the screenshot i sent you."* ⛔ **It would not have worked, and it would have looked like progress.**

⚠⚠ **ROUGHNESS BLURS WHAT IS BEHIND THE CARD. A BLURRED DARK BACKGROUND IS STILL DARK.** The card would have stayed a region of smeared room with no silhouette of its own.

⛔ **AND CARL RULED OUT THE DESTINATION HIMSELF** before any of it was built. Shown two glassmorphism references, one with heavy diffusion: *"Here are 2 examples with one of them with the 'frosted' dialed up. Too much for us but i like the other example."* ⚠ **The reference he chose is barely frosted — its legibility is a WHITE BODY AT LOW ALPHA, not diffusion.** Its background stays recognisable; the rejected one destroys it.

⚠⚠ **THE MISSING INGREDIENT WAS NEVER FROST. IT WAS TONE** — and the two are separate dials that were fused into one constant.

### ⛔ THE SPLIT — THE RIM KEEPS 1.0 AND IS NOT ON THE FADER

**Carl, restating the constraint when the work opened:** *"The rim is clear glass, as per the neon light it will become. The bevel and face are frosted."*

| surface | transmission | why |
|---|---|---|
| **rim** | `GLASS_TRANSMISSION` **1.0** | ⛔ **it IS the neon** (D-086 lineage, `about-card-mesh.tsx`). **A body tone on a light source is wrong.** |
| **bevel** | `GLASS_FACE_TRANSMISSION` | tracks the face, for the same reason it already tracks the face's roughness |
| **face** | `GLASS_FACE_TRANSMISSION` | the surface that needed a body |

⚠ **THE BEVEL TRACKS RATHER THAN GETTING ITS OWN DIAL**, consistent with the existing roughness note: *"giving the bevel its own roughness would let the two drift apart silently the first time the face is re-tuned."*

### ✔ 0.86 — SWEPT TO BOTH ENDS, THEN SETTLED

⛔ **CARL SWEPT THE FADER BEFORE RULING, AND THE ENDS ARE RECORDED BECAUSE THEY BOUND THE RANGE:**

    0.5  (full left)   "gives a milky effect"        -> stops being glass
    1.0  (full right)  "practically clear"           -> the original fault
    0.86                "was a good estimation"       -> APPROVED

⚠ **THIS IS THE ONE CASE IN THIS FILE WHERE AN OPENING FIGURE SURVIVED CARL'S EYE**, and the entry says so because the precedent runs the other way: **the crown opened at an outside 0.015-0.03 and Carl settled 0.073, nearly three times it.** ⛔ **0.86 was chosen as a deliberate over-reach past the 0.95 an outside source proposed on 22 September** — 0.95 is a 5% body and would have been too timid against a dark room. **The over-reach is why it landed, not luck.**

⚠ **THE FADER RANGE STOPS AT 0.5 AT THE BOTTOM** and Carl's sweep confirms that floor is real: below it the card stops reading as glass.

### ⚠ WHAT IS APPROVED, AND WHAT IS EXPLICITLY NOT

✔ **APPROVED:** the transmission split, the rim staying clear at 1.0, and **0.86 on CS's face and bevel at roughness 0.35, in the room.**

⛔ **NOT APPROVED AND NOT DECIDED BY THIS ENTRY:**
- **CD, CA and CB.** They remain diagnostic grey. ⚠ **Whether they take 0.86 or values of their own is OPEN** — the same question `GLASS_THICKNESS_MM` already carries: *"do not assume either."*
- **Roughness 0.35**, which was approved on the BENCH and has never been swept in the room. ⚠ It rode along here; it was not the subject.
- **`ENV_PLATE_INTENSITY = 6.0`**, still a compensation for a missing light, still marked for revisiting downward once the neon exists.
- **The neon, the lighting, and the baked text.** *"A good basis to start from"* names them as the things that come next.

### ⚠⚠ A FROST SCALE THAT DEPENDS ON THE RENDER TARGET — STILL TRUE, AND IT SURVIVED THE MOVE

`lod = log2(transmissionSamplerSize.x) * applyIorToRoughness(roughness, ior)` (`transmission_pars_fragment.glsl.js:147`), so **the same roughness frosts differently on the bench and in the room.** ⚠ **The prediction was that 0.35 might not transfer. It did — judged by eye across both, 22 September.** ⛔ **Recorded as an observation, not a proof: nothing measured it, and the next value change re-opens the question.**

### ⚠ WHAT NOTHING ASSERTS — declared rather than implied

⛔ **NO GATE CHECKS ANY OF THIS.** `tsc` and lint confirm it compiles; they cannot see a material. ⚠ **The verdict is Carl's eye on a rendered frame, and `verify/proven.json` remains empty (see D-064) — no harness pass is admissible.** **If the value moves, only a person looking at the screen will know whether it is still right.**

⚠ **`GLASS_FACE_TRANSMISSION` IS A SHARED DEFAULT AND ITS REACH IS REAL.** Every `AboutCardMesh` consumer that omits the prop inherits it. ⛔ **CS passes it explicitly at the `/about` call site anyway** — the render is identical, but the room's two glass numbers are readable where the room is built rather than requiring a second file.

---

## D-090 — Each Card Gets Its Own Light. Whether The Frost Is TINTED, And Whether That Light Is White Or Neon, Are OPEN

**Date recorded:** 2026-09-22
**Status:** ⛔ **RAISED, NOT DECIDED.** Carl, 22 September 2026, on approving D-089's material: *"If there is a change to the card it will come when we address lighting."* ⚠ **AMENDED 22 September (end of entry): the neon is BLUE, built PAIR BY PAIR (wall cards first, a darker blue), with a MEASURED BLOOM TARGET. The glow colour is not chosen.** ⛔ **AMENDED 23 September: POST-PROCESSING BLOOM IS PART OF THE NEON — decided by Carl (end of entry).**
**Authority:** Human Founder — Carl, 22 September 2026.
**Bears on:** the lighting chunk (not open), `about-card-glass.ts`, `about-card-mesh.tsx`, and **D-087's neon**, which is also unbuilt. ⚠ **Does NOT reopen D-089.**

---

### ⛔ RECORDED UNDER THE D-087 RULE, AND THAT IS WHY THIS ENTRY EXISTS

**`context-rules.md`:** *"a brainstorm is a source of record, and an idea can be chosen by being EXPANDED ON."* ⚠⚠ **The rule was added on 18 September after THREE decisions were found living only in gitignored files** — and one of them produced a wrong answer to Carl. ⛔ **These are provisional and are written down anyway. That is the point of the rule.**

### ✔ WHAT IS SETTLED

- ⛔ **EACH CARD GETS AN INDIVIDUAL LIGHT.** Carl: *"Each card will have an individual light."* ⚠ **Four cards, four lights** — not one rig lighting the group.
- ⛔ **THE NEON RIM ALSO LIGHTS THE CARD.** *"It will also have light from the neon rim."* ⚠⚠ **This is the second source and it is not optional** — it follows from D-087's rim being a real emitter, and from the reference behaviour recorded at `ENV_PLATE_INTENSITY`: **the rim is the brightest thing in frame and the ROOM reflects IT.**
- ⛔ **THE STARTING POINT IS NEON + WHITE LIGHT.** Carl: *"We will start of with neon and white light."*

### ⛔⛔ THE THREE OPEN QUESTIONS — CARL'S OWN WORDS, UNANSWERED

1. **Should the frosting be lightly coloured?** ⚠ **D-089 approved a COLOURLESS face** (`GLASS_COLOR` `#ffffff`, `GLASS_ATTENUATION_COLOR` `#ffffff`, attenuation distance `Infinity`). ⛔ **A tint would be a change to approved work and needs Carl** — it is raised here, not authorised.
2. **Is the individual light white, or the colour of the neon?**
3. ⚠ **AND THE TWO INTERACT.** A tinted face lit by a coloured light is not the sum of the two decisions taken separately. ⛔ **Sweep them against each other, one at a time, the way `card-bench.tsx` already insists.**

### ⚠⚠ THE METHOD IS STATED AND IT IS THE SAME ONE THAT JUST WORKED

**Carl:** *"wont know until we see it in the scene."*

⛔ **THIS IS §14a AND R-026's QUALIFICATION RESTATED** — *"Not until i see the card in the scene can it be truly judged."* ⚠ **It was correct about the glass: the bench approved 0.35, and the ROOM exposed that the card had no body at all.** **Do not settle a lighting value on the bench and call it done.**

### ⚠ WHAT THIS ENTRY DOES NOT DO

⛔ **IT DOES NOT REOPEN D-089.** The material is APPROVED. ⚠ Carl's framing is explicit: *"a good basis to start from"*, and *"if there is a change it will come when we address lighting."* **A later change made under lighting supersedes by a new entry; it does not make D-089 wrong** (`context-rules.md` — an overtaken decision is not a mistaken one).

⛔ **AND NOTHING HERE IS AUTHORISED TO BUILD.** The lighting chunk is not open. ⚠ **Four individual lights is a STRUCTURAL question under CLAUDE.md §5a** — it is a new mechanism where an existing rig could serve, and R-025 records **four lighting rigs that each measured clean and were each rejected on sight.** **It stops for review before it is built.**

### ⛔⛔ AMENDED 22 September 2026 — THE NEON IS BLUE, BUILT PAIR BY PAIR, AND THE BLOOM HAS A MEASURED TARGET

⚠ **DIRECTION, NOT AUTHORISED TO BUILD.** Recorded under the D-087 rule. ⛔ **The glow colour itself is NOT chosen** — Carl: *"ive not made my mind up yet."*

#### ⛔ FOUR COLOURS IS DEAD — THE NEON IS BLUE

**Carl:** *"4 different colours, even brand colours would be too much for the scene. Too loud and seem out of place."* ⚠ **This RETIRES D-087's "four, all different"** (doubted by its author on 18 September, now withdrawn). ⛔ **The cards' neon is BLUE.**

⚠⚠ **HOW BLUE WAS REACHED, BECAUSE A WRONG OBJECTION NEARLY BLOCKED IT.** The Builder objected that D-063 rules *"blue belongs to the Q+A and nothing else."* ⛔ **Carl pointed at the answer cards and the client-info boxes: both are BLUE-BODIED** (satin `#0b1f4d` with sheen `#5b9ede`; field ramp `#1148bd -> #2784e1 -> #35a9f4 -> #c2ffff`). **D-063's rule governs the MARK's colour, not materials.** Blue neon on the cards continues the site's material family.

⚠ **AND THE COMPOSITION IS ALREADY THE SITE'S:** client info is **blue boxes with ONE gold accent** (the Name box's rim, `#f2bf61`). `/about` becomes **four blue neon cards with ONE gold mark** on the right wall (D-088, amended). ⛔ **Warm means *lit because chosen* (the answer-card filament), so blue cards that ignite on their own do not claim selection, and the gold mark stays the only warm light.**

#### ⛔ BUILT PAIR BY PAIR — WALL CARDS FIRST

**Carl:** *"When it comes to implementing this we should separate them. Wall cards first, tweak so they visually match then work on the floor cards."* ⛔ **And: *"We should start with a darker blue for the wall cards."***

| step | what | note |
|---|---|---|
| **1** | **Wall pair (CA, CB) neon** — a DARKER blue, tuned until the two visually match | ⚠ The rim is on the card, so **the neon needs nothing from the backplate** |
| **2** | **Floor pair (CD, CS) neon** — tuned the same way | |
| **3** | **Spill** | ⛔ **Only here does the unmodelled CEILING (D-091) bite** — track before spill, as D-091 already rules |

⚠⚠ **THE PAIRS ARE THE EYE'S GROUPING, NOT THE BACKGROUND'S — AND THE BUILDER WAS CORRECTED ON IT.** The Builder argued from sampled backgrounds that the surroundings split **3+1**, not 2+2 (CD, a floor card, sits in the desk's shadow at `#15191f`, darker than the walls; only CS is lit, `#2d353c`). ⛔ **Carl: *"Yes, the figures say that but visually they are part of the same family."*** **The pairs group by POSITION, which is what the eye reads — and Carl had already ruled *"the cards are essentially 2+2."*** ⚠ **Background luminance was the wrong measure for a grouping question.**

**Why a colour per pair rather than one hex — Carl's reasoning:** one blue will read differently by placement anyway (*"even if we use 4 same blue, same Hex, they may look slightly different because of where they're located"*), so either route is tuned by eye; ⛔ **a darker and a lighter blue per pair means tweaking less, *"but probably still tweak."*** ⚠ **Precedent for expecting the tweak: D-089's glass needed FOUR values to read as ONE material** — and those came out on the DIAGONAL (CA/CD 0.95, CB/CS 0.86), so **one property grouping by pair does not guarantee another will.**

#### ⚠ THE CANDIDATE BLUES — FROM CARL'S OWN LOGOS, NOT CHOSEN

**Carl:** *"Look inside brand assets for blue Logos, theres plenty of variation and shades."* ⛔ **The navy-to-teal chrome renders** (`brand-assets/logo/ig_…c6430c…png`, `Logo 2.2.png`, and siblings) are **lit tubes running deep blue on the "c" to teal-cyan on the "b"** — so **ONE MARK already holds a darker and a lighter blue.** Sampled per half; two files agree within a few levels:

    the "c" — DARKER    edge #01143a  body #05265c  GLOW #17468a/#1b4789  bright #477ec4  CORE #b7d6f3/#a5caf3
    the "b" — LIGHTER   edge #02344e  body #08758c  GLOW #1bb6c5/#18a6bd  bright #5ce5eb  CORE #cefcfe/#d1fcfe

⚠ **Candidate, not chosen:** the "c" blue for the wall pair, the "b" teal for the floor pair — **the two pairs as the two halves of one mark.** ⛔ **Matches D-025 exactly:** *"teal / duck-egg / deep blue as modern intelligence accent."*

⚠ **The PLATINUM-BLUE** (the `/start` mark, `#486285 -> #d2e4f9`) is **too desaturated to read as neon** — it stays **the MARK's blue**, the one it arrives in §3 wearing.

⚠ **"DARKER" FOR A LIGHT SOURCE MEANS DEEPER AND MORE SATURATED, NOT DIMMER.** Dimming is the intensity fader's job.

⚠ **PREDICTION, UNTESTED:** the wall behind CA/CB is itself dark blue (`#182733`); a cobalt neon is close in hue and may read subtle — or merge. **Only the scene decides.**

#### ⛔⛔ THE BLOOM TARGET — CARL CHOSE IT, AND THE BUILDER'S FIRST READING OF IT WAS WRONG

**Carl, from four neon-on-wall references:** *"This one. Not so much the colour but the bloom. Its more localised."* ⛔ **Carl: *"Neon intensity is also important."***

⚠ **References saved locally (gitignored — third-party images, some watermarked, NOT committed):** `live-work/references/neon-22-september/` — **`CHOSEN-blue-rectangle-localised-bloom.png`** plus the three not chosen. ⛔ **The numbers below carry the record if the images are lost.**

⚠⚠ **THE BUILDER FIRST CALLED THIS REFERENCE'S GLOW "FLATTER, BROADER… bloom laid on top" — THE OPPOSITE OF TRUE.** It compared raw luma without subtracting each image's background; this one sits on lighter concrete (L20 against L4-8). ⛔ **Re-measured with background subtracted, averaged over 21 rows:**

    glow ABOVE BACKGROUND, px outward from the tube
                       0     2     4     8    16    32    48
    CHOSEN (blue)    180   161    15    18    11     7     2   <- cliff at 2-4px, then a faint shelf
    purple            228   161    85    37    27    16     8   <- gradual halo
    blue-violet       215   102    48    32    23    15     6   <- gradual halo

⛔⛔ **"LOCALISED" MEANS TWO LAYERS WITH DIFFERENT DEPTHS:**
1. **A TIGHT BLOOM ON THE TUBE** — 89% of core at 2px, **8% by 4px**. All the brightness hugs the tube. **This is the neon itself.**
2. **A FAINT, SHORT WASH BEYOND IT** — ~8-10% of core, out to ~24px, gone by ~48px. **This is the secondary light: the first DEPTH on D-091's one track**, and the level Carl's *"just enough to suggest its the same world"* points at.

⚠ **The same reference shows the FLOOR case** — a soft blue reflection on the ground below the frame, where the floor cards' pool would sit.

#### ⚠ WHAT BOTH REFERENCE SETS AGREE ON — the logo renders AND the neon frames

- ⛔ **THE CORE IS NEAR-WHITE; THE COLOUR LIVES IN THE GLOW.** Logo tube peaks sat 0.04-0.16 (`#f1f8fe`, `#fefbd6`); frame cores `#f3e3fe`, `#eceaff`. ⚠ **Choosing the neon colour means choosing the GLOW.** The one exception, the chosen reference's own saturated cyan tube (`#04ffe7`), reads as LED/graphic — **which is why Carl took its bloom and not its colour.**
- ⛔ **SPILL IS DARKER BUT FAR MORE SATURATED THAN THE TUBE** — logo pools at 15-31% of tube brightness, saturation 0.3-0.99. ⚠ **Gold spills ORANGE** (`#a03c01`), so the gold mark on the wall would throw amber — the filament's family, and caused by the mark.
- ⛔ **SPILL POOLS WHERE THE TUBE IS NEAREST THE SURFACE** and fades with distance (§14a). **For the floor cards: at the rim's base, not spread evenly.**
- ⚠ **THE INSIDE OF A FRAME HOLDS LIGHT** from all four sides adding up — **on the cards, the frosted face is that interior**: the rim lighting the card, seen directly.
- ⚠ **The logo renders are showpieces with generous spill.** They give **shape and colour behaviour, not strength.** ⛔ **The neon-frame references sit at background L6-12 against the wall cards' ~9 — their ratios transfer; the showpieces' do not.**

#### ⚠ IGNITION — A CANDIDATE FROM THE SITE'S OWN APPROVED WORK

⚠ **The answer-card filament is an approved ignition language**: it **fades up along a physical heat ramp**, red `#8c1f06` -> orange `#ff6a1a` -> amber `#ffab52` — Carl: *"does it have to move? No. it could fade in, like a real light bulb filament."* ⛔ **A blue equivalent — dim blue to near-white core — is a CANDIDATE against D-087's open "pop, fade or flicker".** Not chosen.

#### ⛔⛔ AMENDED 23 September 2026 — POST-PROCESSING BLOOM IS PART OF THE NEON. DECIDED BY CARL

**Carl:** *"This is an essential element for making neon lights look realistic."* ⛔ **And the second reason, which is his:** *"this is new for us but future clients may want this feature and one of the purposes for the C2B site is to demonstrate and showcase various techniques."*

⚠⚠ **THE BUILDER FIRST PROPOSED EXTENDING THE FILAMENT'S IN-SHADER BLOOM** (`answer-card-mesh.tsx`, `uBloomWidth`/`uBloomGain`) to avoid a new mechanism. ⛔ **Wrong, and the MEASURED TARGET above is what rules it out:** a material colours only the pixels its mesh covers, and both layers of the target — the tight bloom and the ~24px wash — sit on the wall **beyond** the tube. **No rim shader can draw there.**

| route | status |
|---|---|
| **Screen-space bloom pass** (`@react-three/postprocessing`, installed and unused; or three's `UnrealBloomPass`) | ⛔ **CHOSEN.** Which library is for the plan and the Architect. |
| In-shader emissive falloff (the filament's method) | ⛔ **REJECTED** — cannot reach outside the mesh. |
| A blurred halo mesh behind the tube | ⛔ **REJECTED** — fixed geometry; does not follow the loop's stutter for free. |

⛔ **BLOOM IS GLARE, NOT ILLUMINATION.** It lights nothing. **The rim lighting the face (above) and the spill (D-091) remain separate work** — bloom makes the tube read as a source; those make the room answer it. §14a needs all three.

⚠ **THE ETHOS LINE THIS SITS BESIDE:** `c2b-ethos-and-vision.md` — the site should not feel like *"a developer demonstrating technical tricks."* ⚠ **Builder's reading, not Carl's words:** the two do not conflict while the technique serves the world — the showcase is bloom tuned to the measured, *localised* target, not bloom as spectacle. ⛔ **The measured target is the guard.**

⛔ **STRUCTURAL (§5a) — it replaces the /about canvas's render path.** Known couplings, **predictions, untested:** the photograph renders IN the canvas (`RoomBackplate`), so selectivity must come from the neon exceeding 1.0 against a threshold the unlit, `toneMapped={false}` plate cannot reach; tone mapping moves into the composer, so **bloom at intensity 0 must be pixel-identical to today** or approved work (D-089) has moved; `frameloop="demand"` gives way to the loop anyway. ⚠ **`answer-card-glass.ts` records a bloom pass considered and not taken for the ENQUIRY canvas**, for that canvas's reasons, naming it *"the upgrade path"* — **not reopened here; different canvas.**

⛔ **FORWARD POINTER — D-093 (23 September 2026) BUILT THIS, BY THE NEON-ONLY ROUTE.** ⚠ **The paragraph above is now half overtaken:** the THRESHOLD clause is **retired** (the bloom's only input is the emitter meshes, so no threshold exists), and the PIXEL-IDENTITY clause is **carried and measured** (0 px). ⛔ **Read D-093's table before relying on either.**

---

## D-091 — The Neon Is ONE BRIGHTNESS TRACK And The Room Reads It. ⚠ AMENDED: The Send Opal Already Does This

**Date recorded:** 2026-09-22
**Status:** ⛔ **DIRECTION — RAISED AND EXPANDED ON BY CARL, NOT AUTHORISED TO BUILD.** Carl, 22 September 2026: *"its not authorised yet but its in the files to be worked out and expanded upon."* ⚠ **SECOND AMENDMENT (end of entry): the BACKPLATE route is chosen for secondary effects; the opal route is the fallback; Carl's own questions to CS are on file.**
**Authority:** Human Founder — Carl, 22 September 2026, working from a conversation with an outside model (recorded below as such).
**Bears on:** D-087 (the neon loop), D-090 (the per-card lights), D-086 (the card text), D-088 (the travelling mark), D-084/D-085 (the backplate), `room-environment.tsx`, `about-card-canvas.tsx`. ⛔ **§5a APPLIES — the backplate change is STRUCTURAL and stops for review.**

---

### ⛔⛔ THE GOVERNING RULE IS §14a AND IT WAS WRITTEN BEFORE ANY OF THIS

**`c2b-ethos-and-vision.md` §14a:** *"Effects should feel caused by the world, not layered on top of it."* ⚠⚠ **AND ITS OWN EXAMPLES NAME THIS EXACT CASE:**

- *"A glowing filament should affect nearby card light, not sit as an isolated overlay."*
- *"More selected glowing objects should mean more light in the shared environment."*

⛔ **SO THE SPILL IS NOT AN ENHANCEMENT. A LIT TUBE THAT LEAVES THE ROOM UNTOUCHED IS THE "ISOLATED OVERLAY" §14a FORBIDS.** ⚠ **The Builder initially scoped the ceiling spill as expensive-and-optional and asked whether wall spill would do. That framing was WRONG and is recorded so it is not repeated** — it is a coherence requirement, not a cost trade.

### ⚠⚠ AND THE CEILING ON THE EFFECT IS AS IMPORTANT AS THE FLOOR — CARL'S CORRECTION

**Carl, 22 September:** *"subtlety is important, just enough to suggest its the same world."*

⛔ **READ THIS AS A LIMIT, NOT A BUDGET.** ⚠ The Builder first read "subtle" as *do less because it is expensive*. **It is not.** The suggestion IS the effect; **a convincing light simulation would overshoot it.** §14a: *"Prefer David Gilmour restraint over Yngwie Malmsteen excess."*

⚠⚠ **THIS LOWERS THE ENGINEERING BAR AND THAT MATTERS.** A surface that must read as *approximately the same room* is a far cheaper thing than a correctly solved one. ⛔ **Do not over-build the geometry for an effect whose success condition is that it is barely noticed.**

### ⛔ THE ARCHITECTURE — ONE TRACK PER CARD, EVERYTHING KEYED OFF IT

**Each card's neon has a brightness track over time — off, through the stutters, to full. The trigger starts the TRACK. Every effect reads that same track at its own depth:**

    rim itself              full strength
    reflection in its TEXT  a small fraction
    ceiling / wall spill    smaller
    neighbouring card       smaller still

⛔⛔ **BECAUSE THEY ALL READ ONE SIGNAL THEY CANNOT DRIFT.** ⚠ **Every stutter appears in the room on the same frame.** **This is a sidechain — a lighting desk cue — and it is the same model as Carl's DAW method (D-035).**

⚠⚠ **AND IT IS NOT NEW — SEE THE AMENDMENT BELOW.** ⛔ **The `/start` Send opal already does exactly this in production**, driving a CSS custom property from a WebGL light's phase on the same frame. **This paragraph was written as though the architecture had to be invented; it has to be EXTENDED.**

⚠ **A CONSEQUENCE WORTH NAMING: the secondary effects are DEPTH SETTINGS ON AN EXISTING SIGNAL, not new systems.** ⛔ **So build the TRACK first and the spill after** — §14a: *"Build the track before adding automation."* **The pun is accidental and the rule is literal.**

⛔ **FORWARD POINTER — THE TRACK IS BUILT for the wall pair: D-093** (`about-neon.ts`, `neonLevel`), read at two depths (tube, bloom source) with a hold-or-loop tail. **Spill and the text's reflection join as further depths on the same value.**

⚠ **THE SEQUENCE:** the button fires the Architect card's track; the next card starts at a chosen offset. ⛔ **AUTHORED TO THE MILLISECOND, NOT RANDOM** — *"the way you'd program a drum fill."* ⚠⚠ **This CONFIRMS D-087 rather than adding to it**: the loop was already ruled, and mouse proximity and randomness were already raised-and-not-chosen on 11 September.

### ⛔⛔ THE STRUCTURAL BLOCKER — THE BACKPLATE CANNOT RECEIVE LIGHT

**`RoomBackplate` is `MeshBasicMaterial`, UNLIT BY DELIBERATE DECISION.** Its own comment: *"The room is ALREADY LIT — the ceiling lights and their falloff are IN the photograph. Shading it again would light a picture of a lit room."*

⚠⚠ **THAT REASONING WAS RIGHT AND IS NOW IN TENSION WITH §14a.** ⛔ **An unlit plate cannot respond to anything.** **Classic overtaken decision** (`context-rules.md`, D-046/D-048): the judgement did not fail, **one side of it moved.**

⛔ **THE REQUIREMENT IS SELECTIVE: THE PLATE MUST RECEIVE THE NEON WITHOUT RECEIVING AMBIENT.** ⚠ **A plain swap to `MeshStandardMaterial` would let EVERY light reach it — including D-090's four card lights — which is exactly the failure the original decision prevented.** **A material swap is NOT the fix; a mechanism is needed (layers, or selective lights).**

⚠⚠ **THIS SECTION ASSUMES THE PLATE MUST BECOME LIGHTABLE AT ALL. THE AMENDMENT BELOW GIVES A ROUTE WHERE IT DOES NOT** — drive one property of a surface from the same clock, the way the Send opal is driven. ⛔ **Read both before treating this as the only option.**

### ✔ WHAT THE PROXY ALREADY PROVIDES — AND WHAT IT DOES NOT

⛔ **THE BACKPLATE IS ALREADY SHAPED TO THE ROOM. It is NOT a flat sheet.** Two camera-solved 48x48 grids (D-084/D-085): a **floor** intersecting `y = -CAM_H`, and a **wall** at `WALL_Z`, meeting along a derived horizon.

⚠ **THE OUTSIDE MODEL ASKED TWICE WHETHER IT WAS FLAT, AND CAVEATED ITS ANSWER ON NOT KNOWING.** ⛔ **It is answered here: already shaped.**

| surface | state | consequence |
|---|---|---|
| **floor** | ✔ a correct horizontal plane | ⛔ **a floor card's pool needs NO new geometry** |
| **wall** | ✔ a correct vertical plane at `WALL_Z` | wall spill is available |
| **ceiling** | ⛔⛔ **DOES NOT EXIST** | everything above the horizon is mapped onto the VERTICAL wall plane |

⚠⚠ **SO CARL'S OWN QUESTION — *"would you not expect it to have some sort of impact on the white of the ceiling?"* — LANDS ON THE ONE SURFACE THAT IS NOT MODELLED.** ⛔ **Geometrically the ceiling IS A WALL FACING THE CAMERA**, which is precisely the failure the outside model described: light would land in the wrong shape and fall off in the wrong direction.

⛔ **AND THIS INVERTS THE OUTSIDE MODEL'S DIFFICULTY ORDERING.** It predicted floor pieces would need cutting for the floor cards and named the wall cards as the simpler case. **The opposite is true: the FLOOR CARDS ARE THE CHEAP TEST and the WALL CARDS need a ceiling plane solved.**

### ⚠⚠ THE DEPENDENCY THAT MAKES THIS BIGGER THAN THE RIM — CARL'S POINT, AND THE REASON IT IS RECORDED NOW

**Carl, 22 September:** *"Your suggestion about extending the backplate has implications for 'later on' thats why i mention the larger vision."*

⛔ **A ROOM THAT CAN RESPOND IS A CAPABILITY, NOT A FIX.** ⚠ **Everything downstream inherits whatever shape is chosen here:**

- **the neon spill** — ceiling, wall, floor pool, neighbour glow
- **D-088's travelling mark**, which crosses §2 into §3 and would want the room to acknowledge it
- **§3's player**, which is a light source in a room
- **anything later that needs the world to react**

⚠⚠ **SO A MINIMAL CEILING PIECE CUT ONLY FOR THE WALL CARDS' SPILL MAY BE SCOPED TO THE WRONG REQUIREMENT.** ⛔ **Choose the shape against the vision, not against the rim.**

### ⚠ THE TEXT — THIS MAY AMEND D-086, AND THE DISTINCTION HAS ALREADY MISLED ONCE

**Carl:** the cards carry the four AI workflows — **Architect, Builder, Designer, Strategist** — and *"the text will be three JS text because I want when the neon starts on a card for it to be slightly reflected in the text itself."*

⛔⛔ **"BAKED INTO THE FACE'S ALBEDO" (D-086) AND "LIT BY THE SCENE" ARE NOT THE SAME THING.** ⚠⚠ **The confusion between them ALREADY produced a wrong answer to Carl on 18 September** — the Builder read the superseded DOM overlay and told him the text was legible without the neon. ⛔ **Settle this explicitly before the text chunk opens; a texture baked into an albedo map does not take a live reflection.**

⚠ **THE TEXTURE BUDGET IS STILL UNMEASURED** and remains the real constraint — the answer card bakes ONE LINE into 4 MiB at +108ms; these cards carry 49-84 words.

⛔ **FORWARD POINTER, 23 September 2026 — D-094.** ⚠ **The "baked cannot take a live reflection" framing above is half right:** baked text IS lit by the scene; what it cannot do is respond differently from the glass. **The axis is the text's OWN material vs the face's.** D-094 records Carl's setting rules (crafted copy, justified, rewording last) and the recommended route.

### ⛔ ACCESSIBILITY — THREE FLASHES PER SECOND, AND FOUR CARDS IS WHERE IT BREAKS

**The guideline is no more than three flashes in any one second.** ⚠⚠ **ONE card stuttering is unlikely to breach it; FOUR CARDS IN A TIMED SEQUENCE IS WHERE IT WOULD.** ⛔ **This is a constraint on the AUTHORED PATTERN and must be designed in, not checked afterwards.**

⚠ **`prefers-reduced-motion` GETS A GENTLE FADE-UP INSTEAD OF THE STUTTER.** ⛔ **This is now the THIRD accessibility item owed on this section** — D-088's reduced-motion for the travelling mark and D-086's `sr-only` copy are the others. **They are one piece of work and should be scoped as one.**

### ⚠ PARKED BY CARL — DO NOT PRESS

**Whether showing clients that the site is built by AI roles strengthens or weakens a premium, human-led positioning.** ⛔ **A real strategic question, Carl's alone, and the neon effect does not depend on the answer.**


### ⛔⛔ AMENDED 22 September 2026 — THE PROJECT HAD ALREADY SOLVED THIS, AND NOTHING POINTED TO IT

**Carl, 22 September, after the entry above was written:** *"Let me demonstrate subtlety. Go to the client info section and look whats going on. Look particularly at the blue opal CSS button and the 'shine'."*

⚠⚠ **THE `/start` SEND OPAL IS A DOM ELEMENT LIT BY A WEBGL LIGHT, IN PRODUCTION, APPROVED (D-033 / R-018, the coupling authorised 2 August 2026).** ⛔ **That is the 3D-to-photograph boundary — the thing this entry called unsolved — CROSSED AND WORKING.**

**The mechanism, in `contact-field-light-rig.tsx`:** a light orbits the four contact boxes; **on the same frame it moves**, the rig writes `--opal-shine` to `<html>`; the CSS button reads that variable in **exactly one** of its eleven gradient layers, swinging **0.45 -> 0.85** on a smoothed bell across the visible sweep.

⛔⛔ **THIS IS D-074's FAILURE MODE — the answer existed, and nothing in the record pointed at it.** ⚠ **The entry above was written from an outside model's architecture while this project's own proven solution sat unreferenced.** **The amendment is the fix; the pointer is the point.**

#### ⛔ THE FOUR RULES THE OPAL ALREADY PROVES — TAKE THESE, NOT A NEW ARCHITECTURE

**1. ⛔⛔ ONE LAYER MOVES. TEN DO NOT.** The button's own comment: *"IT IS DELIBERATELY THE ONLY ANIMATED LAYER... Carl: 'The whole opal doesn't have to interact, but just that subtle shine on the opal.' One specular catch responding reads as a material in a lit world; the whole button moving would read as a light show."*

⚠⚠ **THIS IS THE DIRECT ANSWER TO THE CEILING QUESTION. THE ROOM DOES NOT NEED TO RESPOND — ONE THING IN IT DOES.** ⛔ **It is §14a's Gilmour/Malmsteen line expressed as code, and it was written before this conversation.**

**2. ⛔ ONE CLOCK, BOTH EFFECTS.** *"Written on the same frame as the light moves, so the shine and the sweep share ONE clock — two clocks would drift and the opal would stop reading as part of the same event."*

⚠⚠ **THE SIDECHAIN RECORDED ABOVE AS A NEW ARCHITECTURE IS ALREADY BUILT AND ALREADY APPROVED.** ⛔ **It is not a new mechanism (§5a) — it is an EXISTING one to extend.** **That materially lowers the structural risk of the whole direction.**

**3. ⛔⛔ TRUE PROXIMITY WAS MEASURED AND REJECTED — AND THE MEASUREMENT IS THE ARGUMENT.** Driving the shine from real distance fails twice: **closest approach lands at phase 0.953, inside the HIDDEN half**, so it would peak while the boxes are dark; and **the whole range is a 1.3x swing** (489 to 625 units), too little to read.

⚠⚠ **SO THE AUTHORED BELL READS AS *CAUSED* AND THE PHYSICALLY CORRECT VERSION DOES NOT.** ⛔ **This is the strongest evidence in the project for AUTHORED over SIMULATED, and it is measured rather than asserted.** **It bears directly on the neon's stutter pattern: authored to the millisecond is not a compromise, it is the thing that works.**

**4. ⚠ THE FALLBACK IS THE APPROVED VALUE.** `var(--opal-shine, 0.72)` — with no rig mounted the button renders D-033 **exactly as approved**. ⛔ **The coupling is INERT unless something drives it.** **A pattern to copy: a new effect that is invisible when its driver is absent cannot regress approved work.**

#### ⚠⚠ WHAT THIS CHANGES — A ROUTE THIS ENTRY MISSED

**The entry above states that the backplate must become able to receive light, and calls that structural.** ⛔ **THE OPAL DEMONSTRATES A CHEAPER ROUTE: do not light the surface — DRIVE ONE PROPERTY OF IT FROM THE SAME CLOCK.**

⚠ A subtle brightening of the ceiling region could be **a driven value on an overlay**, not a lit material: **no `MeshStandardMaterial`, no selective layers, and no re-lighting a photograph of a lit room.** ⛔ **The D-084 reasoning would not need reopening at all.**

⚠⚠ **THIS IS NOT A FINDING AND IT IS NOT TESTED.** ⛔ **It is a second candidate that was missing when the options above were listed, and the options list was therefore incomplete.** **Both routes go to the Architect; neither is chosen.**

#### ⛔ AND THE PRECEDENT CUTS ON FAITHFULNESS TOO

⚠ **§14a asks that effects feel *caused by the world*. The opal's shine is NOT physically derived — and it reads as caused BECAUSE the authored version was chosen over the measured one.** ⛔ **"Caused by the world" is a perceptual standard, not a physical one.** **Do not read §14a as a mandate for simulation.**
### ⚠ PROVENANCE — RECORDED BECAUSE THE METHOD CAME FROM OUTSIDE

**The trigger model and the two-kinds-of-light distinction came from a conversation between Carl and an outside model, pasted into the session in full.** ⚠ **Its principles are sound and are adopted.** ⛔ **Its two open questions are ANSWERED HERE — the backplate is already shaped, and it is unlit by decision — and its difficulty ordering is CORRECTED above.** **Same handling as D-084, where an outside method's first diagnosis was wrong and was recorded as such so it was not inherited as fact.**

### ⛔⛔ SECOND AMENDMENT, 22 September 2026 — THE BACKPLATE ROUTE IS CHOSEN, AND CARL'S QUESTIONS ARE NOW ON FILE

⚠⚠ **THE PROVENANCE ABOVE RECORDED THE ANSWERS AND NOT THE QUESTIONS.** The outside conversation was with **CS, the Strategist seat** — the card Carl addresses as *"you here the strategist"*. ⛔ **An answer read without its question was read wrongly once already:** the Builder took "the backplate method" to mean three different things before Carl supplied his own words. **They are recorded here so no later reading depends on CS's paraphrase.**

**CARL'S QUESTIONS, verbatim (spoken, lightly punctuated):**

> *"the cards on them represent the four AI workflows for example the architect the builder the designer and you here the strategist telling how it works in the system so there will be text on the cards the text will be three JS text because I want when the neon starts on a card for it to be slightly reflected in the text itself the effect I want is going to be subtle it doesn't have to be really really heavy just enough to indicate that it belongs in the room ... if it's a bloom on the wall or the ceiling it will be very very subtle a lot of it depends on the intensity of the neon so when a user navigates to this page by pressing a button ... the top left the architect card would come on first and that would stutter flicker come on and it would have some effect on the ceiling maybe on the card next to it so this will be a trigger that starts the neon coming on but could that trigger also trigger the secondary effects"*

> *"So would it be right to assume that the backplate method could be used for the ceiling and for the walls? It's only going to be in immediate proximity. Could I use the same technique to get these secondary light effects? i already have the backplate in the scene, incidentally for your card."*

#### ⛔ WHAT IS NOW CHOSEN, AND WHAT IS NOT

| item | status |
|---|---|
| **The backplate carries the secondary light** — the neon's light falls on the in-scene copy of the photograph (D-084/D-085), the technique built so CS's frost could see the room | ⛔ **CHOSEN** — Carl, 22 September: *"We can use the backplate method for light secondary effects."* |
| **The opal route** — drive one property of an overlay instead of lighting anything | ⛔ **RAISED, NOT CHOSEN for secondary effects.** ⚠ **Kept as the FALLBACK** if the lit backplate fails the eye test. |
| **The card text is Three.js text, so the neon reflects in it** | ⛔ **DIRECTION** — stated by Carl as intent, not asked as a question. ⚠⚠ **This moves D-086** (copy baked into the face's albedo, which cannot take a live reflection). **D-086 is amended by a new entry when the text chunk opens, not silently.** |
| **One trigger starts the neon AND its secondary effects** | ⛔ **CONFIRMED** — this is the track architecture above, now in Carl's words. |
| **Spill strength follows the neon's intensity** — *"a lot of it depends on the intensity of the neon"* | ⛔ **CONFIRMED** — the depth-per-effect model above, stated by Carl before it was written. |
| **The Architect card striking first; spill on the ceiling and the neighbouring card** | ⚠ **EXAMPLES, NOT FIXED** — *"for example"*. ⛔ Still open under D-087 (*"whether CA strikes first"*). |

#### ⚠⚠ THE ROUTE CHOSEN INHERITS THIS ENTRY'S STRUCTURAL BLOCKER — IT IS NOT DISSOLVED BY CHOOSING

⛔ **The backplate is `MeshBasicMaterial`, unlit by decision, and must take THE NEON AND NOTHING ELSE** — not the ambient, not the stand-in key, not D-090's four card lights. ⚠ **As far as the Builder knows, three.js has no built-in per-object light targeting, so the selective mechanism must be designed. UNVERIFIED — check before planning.** **§5a: it stops for review before it is built.**

⚠ **Two further points the CS answers did not carry:**
- **The rim's reflections come from `useRoomEnvMap`, built once from the plain photograph.** Spill on the backplate shows THROUGH the glass (transmission renders it) but **not IN the rim's reflection.** ⛔ **Bears on ENVMAP-STALE.**
- **Physics favours the subtlety Carl asked for.** Light multiplies the surface's own colour; the wall is ~luma 9, so a neon falling on it can only lift it a little. ⚠ **CS's "coloured wash" risk is an ADDED wash — a lit dark surface cannot overshoot the same way.** Prediction from how the shading works, **not measured.**

#### ⚠⚠ CARL'S OWN FIRST EXAMPLE LANDS ON THE UNSOLVED SURFACE

**His scenario is the Architect card (top left, a WALL card) lighting the CEILING.** ⛔ **The ceiling is the one surface the proxy does not model** (table above). ⚠ **The Builder's floor-first test — CS's pool on the already-modelled floor — proves the mechanism most cheaply but is NOT the case Carl described.** ⛔ **Which is proven first is Carl's call; both are recorded so the choice is visible.**

**Proposed first test, NOT AUTHORISED:** proto bench, one card, one neon-coloured light at a hand-set value, reaching the backplate only, judged by eye against the photograph. No track, no stutter, no second card — §14a: *"Prove one object, one motion phrase, or one light behaviour before rolling it out."*

---

## D-092 — The Room May Begin In §1, FADED, And SOLIDIFY Into §2. And The Cards Need An ACTIVATION TRIGGER That Does Not Exist

**Date recorded:** 2026-09-22
**Status:** ⛔ **RAISED AND REASONED, NOT DECIDED.** Carl, 22 September 2026: *"Sec 1 may yet have the image there but in a faded state... The 4 cards may yet fade in."* ⚠ **"May yet" is the status — recorded under the D-087 rule, which exists because provisional ideas were lost.**
**Authority:** Human Founder — Carl, 22 September 2026.
**Bears on:** `app/about/page.tsx` §1 and §2, `about-card-canvas.tsx`, `components/layout/about-nav.tsx`, **D-091** (the brightness track this trigger would start), D-088 (the travelling mark, which needs the same mechanism). ⛔ **§5a APPLIES.**

---

### ⛔⛔ THE DESIGN IDEA — THE ROOM SOLIDIFIES AS THE EXPLANATION LANDS

**Carl, 22 September:** *"From a design point of view to have an 'office' there while giving a top level explanation is a good idea. To see that 'solidify' with members of the team drives home the point."*

⚠⚠ **THE MOTION CARRIES THE ARGUMENT, IT DOES NOT DECORATE IT.** §1 explains the roles in prose against a **faded room behind the text**; §2 is that same room **resolved**, with the four role cards in it. ⛔ **The reader is told a team exists, and then shown it.**

⚠ **THIS IS §14a'S "recurring theme with variations" ACROSS SECTIONS RATHER THAN WITHIN ONE** — the same room, twice, in two states. **And it is the ONE-OBJECT principle D-088 already applies to the travelling mark: continuity beats a cut.**

**Two movements, and they are separable:**
- **THE ROOM** — faded behind §1's text, solidifying toward §2.
- **THE FOUR CARDS** — fading in *"once roles has been pressed or by a trigger that is activated by scrolling."*

⛔ **DO NOT ASSUME THEY ARE ONE ANIMATION.** The room could resolve on scroll while the cards wait for the neon's own trigger. **Which is undecided.**

### ⛔⛔ THE GAP CARL FOUND — THERE IS NO ACTIVATION MECHANISM, AND THERE IS NO SECOND ONE EITHER

**Carl:** *"A user will navigate to the about section and read Sect 1. Most likely they will press 'Roles' and get here... But what if they scroll here? We need a mechanism that at a certain point the cards will be 'activated'."*

⛔ **VERIFIED, 22 September: there is NO `IntersectionObserver` ANYWHERE IN THIS CODEBASE.** No viewport-activation mechanism of any kind exists.

⚠⚠ **AND THE "PRESS ROLES" PATH IS NOT A SEPARATE CASE.** `about-nav.tsx` gives `Roles` as `href="#roles"` — **a plain anchor jump, not an event the canvas can hear.** ⛔ **So the click path and the scroll path are the SAME unhandled problem**, and one observer covers both. **Two mechanisms would be two things to keep in sync; there is no reason to build them.**

### ⚠ THE CASES ANY MECHANISM MUST SURVIVE — named so they are not discovered one at a time

- **Anchor click** — the section is already in view on arrival
- **Scrolling in** — a threshold is crossed
- **Deep link or refresh on `#roles`** — in view at FIRST PAINT, ⚠ **possibly before the canvas is ready**
- ⛔⛔ **SCROLL AWAY AND BACK — DOES IT REPLAY?** ⚠ **A neon that re-strikes on every pass becomes wallpaper.** A one-shot is the likely answer. **CARL'S CALL, NOT THE BUILDER'S — it is a design decision wearing technical clothes.**
- **Scrolled past fast** — ⚠ does a half-seen section consume its one shot?
- **`prefers-reduced-motion`** — a gentle fade, not the stutter. ⛔ **THE FOURTH accessibility item owed on this section** (D-086's `sr-only`, D-088's reduced-motion mark, D-091's three-flashes limit). **Scope them as ONE piece of work.**

### ⛔ WHY THIS IS STRUCTURAL (§5a) AND MUST NOT BE BUILT INSIDE ANOTHER CHUNK

- **A fired-once flag is "state that survives a boundary it previously died at"** — named explicitly in §5a's list.
- **It is a new mechanism where none exists**, so it **sets the pattern for every scroll-triggered effect on this site** — including D-088's travelling mark, which needs the same thing.
- ⚠⚠ **IT IS THE FRONT DOOR TO THE NEON.** The trigger starts D-091's brightness track, and **every secondary effect keys off that track.** ⛔ **Its shape therefore matters far more than "make the cards appear."**

### ⚠ THE BUILDER'S RECOMMENDATION — RECORD NOW, BUILD WITH THE NEON

⛔ **THERE IS NOTHING FOR THE TRIGGER TO DRIVE YET.** The cards are already visible and no sequence exists. ⚠ **Building the trigger before the thing it triggers means guessing at the interface it must expose** — and D-091's track is that interface.

⚠ **RECORDED TODAY REGARDLESS, because a finding that lives only in chat is lost — D-074.**

⛔⛔ **REVISED BY CARL THE SAME DAY — THE IGNITION PLAYS WHEN THE READER REACHES §2, NOT ON LANDING.** Having seen that a landing trigger plays the ignition while the reader is still in §1: *"i do not think the clock should start as soon as a user lands in About. The flicker is wasted. By the time they get there the lights are alredy on."* ⚠ **So this entry's viewport trigger IS needed after all, and every case in the list below applies to the neon** — including replay on scroll-back. ⛔ **§5a stands: it stops for review before it is built.** Current behaviour (strike on landing) is acceptable *"for now"* — Carl. **The paragraph below is kept as the record of the first reading and why it was revised.**

⛔ **CARL'S TRIGGER, same day:** *"If Roles is pressed it will instantly take them to Sect 2. What is the Lights start then. Its as if they are responding to the viewer. If a user decides to scroll to Sect 2 when they reach a certain point that should trigger the lights. Maybe when the wall cards come into full view."* ⚠ **ONE CONDITION SERVES BOTH PATHS** — this entry already found `Roles` is a plain anchor, so the jump lands with the wall cards in view and the same check fires at once. **Candidate condition: CA and CB entirely inside the viewport** (*"maybe"* — a candidate, not ruled). ~~⛔ **Still Carl's: does it strike once per visit, or again on scrolling away and back?**~~ ✔ **Answered below: once per visit.**

✔ **BUILT THE SAME DAY ON CARL'S INSTRUCTION, WITHOUT THE PLAN-REVIEW GATE** — Carl: *"No need to plan or go to the architect. This is relatively straight forward. Implement it."* **Scope: the in-view trigger only.** ⚠ **No `IntersectionObserver`:** a rAF-coalesced check of the canvas rect against the wall band, on `document` scroll (capture), `resize` and `visibilitychange` — `wallCardsInView` in `about-neon.ts`, the band DERIVED from `GUIDE_CA_QUAD`/`GUIDE_CB_QUAD`. ⛔ **ONCE PER VISIT — CARL'S RULING, confirmed after it was built as the Builder's default:** *"once a user has seen the on effect theres no need to labour the point."* **This closes this entry's replay question for the neon.** **Verified in a real browser:** landing on §1 → no strike; scrolling → strikes as the band's lower edge clears the window (1440×900: scrollY 360, cards at 645–884px); scrolling away and back → still one strike; `Roles` → strikes on arrival; deep link `#roles` → strikes on load. Identity gate 0 px after the change. ⚠ **It fires the moment the cards' bottom edge enters — with them in the lower third of the window.** *"Maybe"* was Carl's word; the point is his to move.

~~⛔⛔ **ANSWERED FOR THE NEON BY CARL, 23 September 2026 — THE TRIGGER IS LANDING ON THE PAGE, NOT REACHING §2:**~~ *(superseded above, same day)* *"If a user is on the Home page and navigates to About (Sect 1) as soon as they land there the lights are activated. So by time they read the copy they either press Roles or scroll to Sect 2 and the lights are on going through their sequence."* ⚠ **So the neon needs NO viewport mechanism, and the replay-on-scroll-back question does not arise for it** — the sequence belongs to the page visit, not to the section. ⛔ **Still open here and NOT answered by this:** the room fading from §1 into §2, and D-088's scroll-driven mark. **Verified the same day:** the built stand-in already strikes on landing at §1 (scrollY 0), direct and via the Home link — see D-093.

⛔ **FORWARD POINTER, 23 September 2026 — THE INTERFACE NOW EXISTS: D-093.** The wall pair's track is built, and **`ignite()` in `neon-bloom.tsx` is the one door a track starts through.** ⚠ **It must invalidate the canvas in the same statement** (Architect F1) — a scroll callback is neither a store change nor a prop update, so an observer that merely set a start time would strike nothing. **A dev watchdog asserts it.** The stand-in trigger (first ready frame) is what this entry replaces; **nothing here is decided by it.**

---

## D-093 — The Wall Pair's Neon Is Built: Neon-Only Bloom, Two Colours On One Track, A Stutter Ignition

**Date recorded:** 2026-09-23
**Status:** ✔ **THE PALETTE IS APPROVED AS A STARTING POINT — R-028, 23 September 2026:** *"Its a great colour combination and the neon palette works very well in the room. its a good starting point… they still need working on."* ⚠ **The individual values (peaks, bloom, ignition patterns, order) are NOT individually approved and the ignition has no verdict** — a take, not a master (D-035). ~~IMPLEMENTED — CARL'S VERDICT PENDING.~~
**Authority:** Human Founder — Carl, 23 September 2026: the route (*neon-only bloom*), ignition in scope (*"The lights will be off at first then flicker or stutter on"*), the plan approved after the Architect's review, and `about-card-glass.ts` unlocked for the colour-ruling comments.
**Bears on:** D-087 (the loop), D-090 (the neon, the bloom target), D-091 (the track), D-092 (the trigger). **Files:** `components/about/about-neon.ts` (new), `neon-bloom.tsx` (new), `about-card-mesh.tsx`, `about-card-canvas.tsx`, `about-card-glass.ts` (comments only), `verify/about-neon.mjs` (new). **Plan and review:** `live-work/wall-neon-plan-23-september.md`, `live-work/architect-plan-response-wall-neon-23-september.md`.

---

### ⛔ WHAT IS BUILT — CA AND CB ONLY

- **The rim emits.** CA's and CB's `meshPhysicalMaterial` rims gain an emissive, written every frame by one writer. **D-089's glass values are untouched.**
- **Neon-only bloom.** The scene renders exactly as before; an **emitter** mesh sharing each rim's geometry is drawn alone on `NEON_LAYER` into a HalfFloat target, blurred with `postprocessing`'s `MipmapBlurPass` (the Unreal-style dual filter), and **added** onto the screen.
- **A brightness track per card (D-091)**, read at two depths: the tube and the bloom's source. **Its type carries a HOLD or LOOP tail**, so D-087's loop extends it rather than replacing it.
- **A stutter ignition**, CA first then CB, with a reduced-motion fade-up. **The flash cap is asserted in code** (`maxRisesPerSecond`, across the loop wrap).
- ⛔ **CD and CS are untouched. The floor pair is the next step.**

### ⛔ WHY NEON-ONLY AND NOT `EffectComposer` — Carl's choice, verified in the installed source

`@react-three/postprocessing`'s composer sets `NoToneMapping` while mounted, and three 0.185 tone-maps a material only when drawing to the screen (`WebGLRenderer.js:2351-2357`). ⚠ **Under a composer, D-089's glass would lose ACES, the backplate's `toneMapped={false}` would stop meaning anything, and the glass's HDR env-map highlights would bloom.** The neon-only route leaves the base render as the same call R3F makes.

### ⛔⛔ D-090's §5a PARAGRAPH — WHICH HALF IS ANSWERED, WHICH IS CARRIED (Architect F11)

D-090 recorded, as untested predictions: *"selectivity must come from the neon exceeding 1.0 against a threshold… bloom at intensity 0 must be pixel-identical to today."*

| clause | status |
|---|---|
| **Selectivity by threshold** | ⛔ **RETIRED.** There is no threshold: the bloom's only input is the two emitter meshes. Nothing else can glow — not the ceiling lights in the photograph, not the glass's highlights. |
| **Pixel-identical at intensity 0** | ✔ **CARRIED AND MEASURED** — the identity gate below. |

### ⛔⛔ THE TUBE AND THE GLOW NEED DIFFERENT COLOURS — MEASURED, AND IT CORRECTS A PREDICTION

**Predicted (Architect F10, and the Builder agreed):** under ACES the tube's core *"desaturates toward white while the bloom stays saturated navy"* — D-090's model for free.

⚠⚠ **HALF RIGHT.** The glow did land on the logo's navy (**214–216°** from 8px out). ⛔ **The tube did NOT whiten toward pale blue — it passed through CYAN: 186–196°**, where the logo's own core sits at ~210°. **ACES lifts the green channel into its shoulder first. The navy "c" was reading as the teal "b".**

⛔ **So the tube has its own colour, pre-shifted away from green**; the glow keeps the logo's navy. Measured tube cores: `#1b4789` → 186° · **`#1b2f8a` → 211° (chosen: the logo's core)** · `#1a2699` → 224° · `#2323a0` → 237°. ⚠ **Two colours, one track** — and three dials that are NOT views of one: tube colour, peak (tube whiteness), bloom strength (glow reach).

### ⚠ THE STARTING VALUES — candidates, measured against D-090's chosen reference

| | value | why |
|---|---|---|
| glow | `#1b4789` | the navy "c", re-sampled from two logo files |
| tube | `#1b2f8a` | lands the core at 211° (above) |
| peak | CA 6 · CB 6 | separate constants, so the pair can be matched |
| bloom | strength 0.25 · radius 0.7 · 5 levels | 8px 13% · 16px 7% · 24px 4% · 48px 2% of core (target ~8–10% shelf, ~0 by 48px). The first build (peak 12, bloom 0.6) measured 26% at 8px and 6% at 48px — **a broad halo, the kind Carl did not choose** |

⚠ **4px reads 53–93% at every setting because the tube is ~5px across on screen** — the reference's was a hairline. **Compare from 8px out.**

### ⛔ WHAT WAS MEASURED — `verify/about-neon.mjs`, headed, real GPU (AMD D3D11)

- **Noise floor:** HEAD against HEAD, **0 px** at 1440 and 1920.
- **Identity gate:** `?neon=none` and `?neon=off` against the HEAD baseline — **0 px at both widths**, re-run on the final code.
- **Floor (Architect F9):** the gate sees a neon at **peak 0.0005** (2,559 px, max delta 1) — the lowest swept, so the true floor is lower. ⚠ **The Architect's concern that 0.01 might sit below one quantisation step is answered: it does not** (36,404 px).
- **Red run at 0.001 (2x the lowest visible):** **FAIL, 5,004 / 7,085 px** — the same counts as the sweep; deterministic. ⚠ **Not filed in `proven.json`** (protected, and admission needs a written-up run). **Carl's call.**
- **Frames:** the FIRST strike lands during page load (0.8–1.6s in) and frames over 50ms occur around it — **but the no-neon control shows them at the same offsets.** ⛔ **Struck again after load (`?reignite=5000`), 6 of 6 runs: zero frames over 33ms, max 17.5ms against the control's 17.4ms.** The ignition costs nothing measurable in pacing. ⚠ **Consequence: until D-092's trigger fires later, load hitches can land on CA's stutter.**
- ⚠ **`##VERDICT:` sentinel — first real use.** `run.mjs` honoured PASS, FAIL and NONE correctly.

### ⚠⚠ A BUILDER DEFECT, CAUGHT BY THE GATE — RECORDED BECAUSE OF WHERE IT BROKE

The emitter's layer ref callback did not guard `null`. React calls an inline ref with `null` whenever it swaps the function, and **the throw happened in React, OUTSIDE `NeonBloom`'s isolation — the whole canvas unmounted with a lost context.** ⛔ **The frame's try/catch protects the render; it cannot protect React callbacks.** Caught by the identity gate's `?neon=off` arm (the canvas detached mid-capture); fixed, and the guard's reason is at the line.

### ⚠ CORRECTIONS MADE IN PLACE (the amendable rule, Architect F12)

- **The five "four colours ruled, none chosen" copies** — `about-card-mesh.tsx` ×2, `about-card-glass.ts` ×3 (**Carl's unlock, comments only; no value changed**).
- `about-card-canvas.tsx`: the stand-in key's *"the rim is not a light source until chunk 3"* — **amended: the rims glow and bloom but light nothing.**
- ⚠ **KNOWINGLY LEFT, OUTSIDE THIS CHUNK'S FILES — for Carl:** *"the rim is not a light source until chunk 3"* in `about-card-geometry.ts` (the `TENT_POLE_RATIO` note) and `card-bench.tsx` (two notes), and *"emission plus a real light plus a bloom pass — chunk 3"* in `about-card-glass.ts` (`ENV_PLATE_INTENSITY` and its neighbour). **Partly overtaken, not false:** emission and bloom now exist for the wall pair; the real light does not.

### ⛔ WHAT THIS DOES NOT DO

The floor pair · D-087's loop (**its type exists; its periods do not**) · D-090's four lights · the rim lighting the face as real light · spill (D-091) · a glass tint · **D-092's trigger** · Three.js text · RIM-DARK and ENVMAP-STALE. ⚠ **The OFF state still shows RIM-DARK, and the ignition begins in it** (Architect F13) — a stutter judged at checkpoint 2 starts from a frame with an open defect.

⚠ **Pulled forward from the four accessibility items: the flash cap and the reduced-motion fade only.** The rest stays one piece of work.

### ⛔⛔ REVISED BY CARL THE SAME DAY — THE IGNITION BELONGS AT §2, SO THE STAND-IN IS NOT THE DESIGN

**Carl, after the section below was written:** *"i do not think the clock should start as soon as a user lands in About. The flicker is wasted. By the time they get there the lights are alredy on."* ⛔ **The ignition must start when the reader REACHES §2** — D-092's viewport trigger, which is structural (§5a) and stops for review. ⚠ **The measurement below is WHY he revised it:** a landing trigger plays a ~4s ignition to a reader still in §1. **The strike-on-landing behaviour stays "for now" — Carl — until that trigger is built.** ⚠ **It plugs into `ignite()`**, which already wakes the canvas (F1), so the trigger is a new caller, not a new clock.

⚠ **This also narrows the D-087 question below:** the clock starts at §2, not at mount — closer to what D-087 asked for. Hidden-tab pause is still unbuilt.

✔ **CARL'S EYE, 23 September 2026, on the running build (screenshot of the lit pair):** *"i think the colour is good."* ⚠ **Recorded at the level given — the COLOUR** (tube `#1b2f8a`, glow `#1b4789`). Not yet a verdict on intensity, bloom or the ignition.

⚠ **HE ALSO SAW "a noticable change to the colour of the face when the cards flicker on" — MEASURED: IT IS THE BLOOM'S GLARE, NOT LIGHT.** Face centres: neon off CA `#151e25` / CB `#1d2f3e`; neon on `#151f2c` / `#1d3041`; ⛔ **neon on with `bloom=0` is byte-identical to neon off.** The rim does not yet light the face (D-090's second source is unbuilt); the glow washing inward over the frost is the whole change — the "inside of a frame holds light" behaviour D-090 recorded from the references.

⚠ **Then asked for the card lights on a 5s timer** — *"i want to see the difference between a light shining on the card and not"* — built as a URL-only diagnostic, `?lightblink=5000` (`LightBlink`, `about-card-canvas.tsx`; the two directional lights, ambient left on; intensity to 0, not hidden, so no shader recompile). **Measured:** CA `#151f2c` → `#061220` with the lights off; ⚠ **CB barely moves** (`#1d3041` → `#1a2e3f`), consistent with the rig's recorded grazing incidence on the right pair. ⛔ **To be removed once Carl has his answer.**

✔ **The blink was removed the same day** — Carl: *"Done with the blink, remove it."* His on/off screenshots showed the WALL pair holding without the light (the neon defines them) and the FLOOR pair, then unlit, dissolving without it.

### ⛔⛔ THE FLOOR PAIR (CD, CS) — BUILT THE SAME DAY, WITHOUT THE PLAN-REVIEW GATE

**Carl:** *"Implement the floor cards. No need for plan/architect. We will then see what the whole scene looks like."* ⚠ **Scope: the same mechanism on CD and CS; nothing structural is new** — two more channels on the existing writer, layer and bloom.

- **Colour — CANDIDATE, not chosen:** the logo's teal **"b"**, glow and tube both `#18a6bd` (D-090's recorded pairing: *"the two pairs as the two halves of one mark"*). ⚠ **No tube pre-shift:** ACES drifts it to cyan-white, and the "b"'s own core IS cyan-white (`#cefcfe`).
- ⛔⛔ **PEAK 1.8, NOT 6 — MEASURED:** at the wall pair's 6 the floor tubes blew out white (`#edffff`, sat 0.07) with a heavy halo (8px 52%, 48px 8%). **The teal is ~4.75x brighter than the navy at the same peak** (relative luminance 0.311 vs 0.065 — green, which the eye weights most). **1.8 matches CA's core whiteness** (sat 0.46 vs 0.48); 1.3 goes saturated cyan, the "LED" look. Full table at `CD_NEON_PEAK`.
- **Sequence — the Builder's order, candidates:** wall pair then floor pair, each left to right — CD at 4.4s, CS at 6.4s; all four hold by ~8.1s. **Rises never exceed 2 in any second across all four** (asserted at module load). `?reignite`'s floor is now DERIVED from the sequence (10s) and **clamps a shorter request up** rather than silently ignoring it.
- **Verified:** identity gate 0 px (all four cards wired); profile covers all four (16px out: wall 7–9%, floor 9–14%); no console errors.
- ⚠⚠ **FRAMES — INTERMITTENT, UNEXPLAINED, TO WATCH.** 1440: clean. **1920: the first two four-card runs showed 17–25 frames >33ms and one >50ms (66.8, 50.1) during the ignition; the control was clean. Two further runs as built were completely clean (0 >33ms in every segment), and a floor-dark variant with identical GPU work was clean too.** ⛔ **Not attributed** — plausibly machine load, but that is not measured, and this project's Q5 history is exactly an intermittent stall that read as noise. **Recorded, not dismissed.**

✔ **BUILT THE SAME DAY** — the wall cards in full view, once per visit. Carl waived the plan-review gate for it. **Detail and verification: D-092's revision note.** ⚠ `?reignite=` deliberately keeps striking on load, as a tuning tool.

### ~~⛔⛔ AMENDED 23 September 2026 — THE TRIGGER IS LANDING, SO THE STAND-IN IS THE DESIGN~~ *(superseded above, same day — kept as the first reading)*

**Carl:** *"as soon as they land there the lights are activated. So by time they read the copy they either press Roles or scroll to Sect 2 and the lights are on going through their sequence."*

- ⛔ **The "stand-in" trigger (the first ready frame) IS the intended behaviour.** **Verified:** direct `/about` strikes at 1756ms, Home → About by the site's link at 709ms after the new page, both with the reader at the top of §1. **The canvas mounts with the page, not with §2.**
- ⚠⚠ **SO THE IGNITION IS MOSTLY PLAYED WHILE THE READER IS IN §1, AND WHAT §2 SHOWS IS WHATEVER THE SEQUENCE IS DOING WHEN THEY ARRIVE.** With only the ignition built, that is a steady hold. ⛔ **"Going through their sequence" is D-087's LOOP — which makes the loop, not the ignition, the thing a reader of §2 actually sees.**
- ⚠ **The ignition is seen directly only by a deep link to `#roles`** — or behind §1 if D-092's faded room is built.
- ⚠ **It also lands inside page load** (0.7–1.8s), where the frames measurement found load hitches in the no-neon control too. **Mostly unseen from §1** for the same reason.
- ⚠⚠ **D-087 SAYS "THE CLOCK MUST NOT BE A MOUNT TIME."** A clock that starts on landing is a mount time in substance. **The concerns behind that line are reproducibility (met by `?neont` and the deterministic track), a stop when the tab is hidden with a phase-correct return (not built — the track reads `performance.now()`, so a hidden tab skips ahead), and per-visitor drift (inherent to Carl's design: each reader arrives at §2 at a different point).** ⛔ **Whether Carl's ruling supersedes that line is his to confirm, not the Builder's to assume.**

---

## D-094 — The Card Text: Carl's Crafted Copy, JUSTIFIED, Set By The Browser's Own Engine On Its Own Surface. The Direction, Not Yet Built

**Date recorded:** 2026-09-23
**Status:** ⛔ **JUSTIFIED IS RULED** — Carl, 23 September 2026: *"lets go with justified."* ⛔ **Copy edits are a LAST RESORT, ruled** — *"I dont want to edit the text but i understand it may be a last resort. If that means rewording a sentence i will have to compromise - but i would rather not."* ⚠ **The IMPLEMENTATION ROUTE below is the Builder's recommendation, following from those rules and from measurement — not yet confirmed by Carl, and NOTHING IS BUILT.** This is the entry D-091 said was owed when the text work opened; it records the direction so the chunk opens on it.
**Authority:** Human Founder — Carl, 23 September 2026, in a discussion of Three.js text he opened (*"Talk to me about three js text. Look what the files say about the diection as well."*).
**Bears on:** **D-077** (the copy — its 23 September amendment carries Carl's setting rules), **D-086** (text must catch the light; the screen-reader copy), **D-091** (the neon *"slightly reflected in the text itself"*), D-093 (the track the text would read), `wall-card-text.tsx`, the four card faces.

---

### ⛔⛔ CARL'S RULES — THEY BIND ANY ROUTE

1. ⛔ **The copy is crafted; its SETTING is part of the edit** — *"text size is important as is the spaces inbetwwen words."* **The copy must sit within the card.**
2. ⛔ **NOT LEFT-ALIGNED** — *"that would read like a letter or memo and inevitably leads to spacing issues on the right. It must fit within the card and be visually balanced."*
3. ⛔ **JUSTIFIED** — chosen over centred. ⚠ **Centred was raised and NOT chosen** (it keeps word spacing natural but makes the eye hunt for each line start across 49–84 words).
4. ⛔ **REWORDING IS THE LAST RESORT**, and a compromise Carl would rather not make. ⚠⚠ **So the order of remedies when a card does not fit is: the SETTING first (line breaks, gap limits, a hair of letter-spacing), then the CARD SIZE — D-077 already rules *"if a card cannot fit while keeping its named line, the CARD SIZE is wrong, not the line"* — and ONLY THEN the words, taken to Carl.** ⛔ **The Builder never trims copy to make a fit.**

### ⚠⚠ THE FRAMING THE RECORD HAD WRONG — "BAKED vs THREE.JS" IS NOT THE AXIS

D-091 set it up as baked text versus Three.js text, claiming a texture *"baked into an albedo map does not take a live reflection."* ⛔ **Half right.** Text baked into the FACE'S albedo IS lit by the scene — it is part of the glass material. **What it cannot do is respond DIFFERENTLY from the glass around it.** ⛔ **The real question is whether the text SHARES the face's material or HAS ITS OWN.** *"Slightly reflected in the text itself"* needs its own. **Neither D-086 nor D-091 is reversed by this — the correction is to how they were framed.**

### ⛔ THE THREE ROUTES, WEIGHED AGAINST THE RULES

| | baked into the face | `troika-three-text` (installed, via drei `<Text>`) | extruded 3D text |
|---|---|---|---|
| own material (can catch the neon) | ⛔ no — frosted with the glass | ✔ any three material | ✔ edges catch light |
| follows the domed face | ✔ automatically | ⛔ flat | ⛔ |
| **Carl's setting rules** | ✔ browser engine | ⛔ **see below** | ⛔ wrong for paragraphs |

⛔ **MEASURED FROM troika's OWN README AND SOURCE, 23 September:** **no word-spacing control** (only `letterSpacing`); `textAlign: 'justify'` computes its own gaps, so they **cannot be capped or evened**; it lays out with **its own engine** (Typr), so widths differ from the browser the copy was fitted in and **line breaks can move**; and **`.woff2` is not supported** (README l.150) — the site's Geist is served as `woff2` by `next/font`. ⚠ **troika can hold the words; it cannot guarantee the setting.**

### ⛔⛔ THE RECOMMENDED ROUTE — the browser's engine, drawing into the text's OWN surface

| need | how |
|---|---|
| **size and spacing exactly as edited** | Draw with the **browser's own text engine and font** (the engine the copy was fitted in), into a texture per card. **Line breaks are FIXED, not re-flowed.** |
| **justified, with even word spacing** | **Choose the line breaks to share the stretch evenly** (book-typesetting practice; the browser alone does not), **cap the widest gap**, allow a **hair** of letter-spacing to absorb what is left, and decide the short last line. ⚠ **This is possible only because every word is placed by us** — the argument against troika's `justify`. |
| **sits within the card** | A **measured fit check** in the card's own space — every line within the face width, the block within its height, **every gap under the cap** — that **fails loudly**. ⚠ Gate it (`context-rules.md`: an invariant in prose is not asserted). |
| **the neon *"slightly reflected in the text itself"*** | The text surface has **its OWN material**, one property driven from the card's **D-091 track** — the opal route (*"one layer moves"*, one clock). ⚠ **The neon currently lights NOTHING** (emission + glare, D-093), so without this or D-090's real rim light the text cannot respond at all. |
| **follows the domed face** | The text surface **reuses the face's own geometry**, lifted a hair, so it curves with the glass. |
| **accessibility** | The **`sr-only` DOM copy D-086 makes mandatory** — `wall-card-text.tsx`'s markup is the candidate. |
| **one source** | All four cards' copy in **ONE module**, read by the rendered text AND the screen-reader copy. ⚠ **CD's and CS's final copy currently exists only in `live-work/about-section-thinking.md`** (D-077's pointer); CA/CB in `wall-card-text.tsx` match their final forms word for word. |

⚠ **COST: one text texture per card — D-086's unmeasured budget.** Text needs **ONE channel** (a quarter of the answer card's RGBA) and can be **sized to the real face** (D-086: the answer card was oversampled ≥11x linear). ⛔ **Measure before building, not in a stall.**

⚠ **The wall cards recede.** Setting the text FLAT in the card's own space first means the justified edges stay true to the card's edges as the far side compresses — **the perspective is the geometry's job, not the typesetter's.**

### ⚠ OPEN — CARL'S, NOT DECIDED HERE

- **The route itself** — recommended above, not confirmed.
- **The role names** (The Architect, …) — the same setting as the body, or a title that *"catches the light"* (the hero's *"its edges catch the light"*, D-086 — extruded or troika text suits a short title where crafted setting is not at stake).
- **Is the text readable BEFORE the neon strikes**, or does it come up with the light — the neon revealing the copy?
- **The font** — Geist, as the overlay used, or other.
- **The last line of each justified paragraph** — centred, or eliminated by the break choice.
- **The gap cap** — a number to be set by eye in the room, not asserted in advance (D-086's anchoring warning).

### ⛔ FIRST STEP WHEN THE CHUNK OPENS — §14a

**CA alone:** one justified block, its own material, the fit check, responding to CA's track. **Measure the dome under the text block and the texture budget BEFORE building.** Then the other three.

### ⛔⛔ AMENDED 24 September 2026 — THE TEXT'S MATERIAL IS ETCHED GLASS, EDGE-LIT BY THE RIM. And the first two steps are done

**Carl, 24 September 2026:** *"Etched glass sounds like a great concept. We can rule out metal because of the surroundings issue. The gilded idea is a good thought too and i will take it as a recommendation. It fits the concept."* ⛔ **He tunes it by eye.**

| option | standing |
|---|---|
| ⛔ **ETCHED GLASS, EDGE-LIT** — the body copy is a frosted, etched region IN the glass. When the rim strikes, the etching glows in the tube's colour. | **CHOSEN** |
| **Metal body text** (gilded, reflective) | ⛔ **RULED OUT** — *"because of the surroundings issue"*: a metal letter reflects its environment, which is near-black (RIM-DARK), and the neon lights nothing (D-093). Unlit metal text would read dark. |
| **Gilded ROLE NAMES** with an etched body | ⚠ **RECOMMENDED, NOT RULED OR BUILT** — Carl: *"take it as a recommendation. It fits the concept."* It answers the open "a title that catches the light" question. ⚠ **It carries the same surroundings dependency that ruled metal out for the body**, so it cannot read as intended until the rim is a real light (D-090) or the environment is fixed (RIM-DARK). |

**Why etched glass — the physics is the argument (§14a).** Engrave a glass or acrylic sheet, light its edge, and the light travels inside the sheet until the engraving lets it escape: the letters light up and the clear glass stays dark. **These cards have that construction: a glass face with a light-source tube around its rim.** The glowing text is therefore caused by the world, not laid on top of it. It is also a real signage technique, which fits the showcase brief.

**How it behaves:**
- **One layer moves** (D-091, the opal rule). The glow reads the card's existing D-093 brightness track at a small depth, so every stutter reaches the words on the same frame.
- **Unlit, the etch reads as pale frost on clear glass.** That turns the open question *"readable before the neon, or revealed by it?"* into ONE dial: how strongly the etch reads unlit. The material serves either answer.
- **It depends on nothing unbuilt**: no ceiling, no real rim light, no env-map fix. That is exactly what separates it from the metal option.

**Carl's by eye, not asserted here:** the etch's unlit visibility; the glow's depth on the track; whether the glow falls off from the rim toward the centre (real edge-lit glass does). ⚠ **Measure the glow's hue on screen:** ACES turned the navy tube cyan (D-093).

**Steps 1 and 2 — DONE 24 September, on Carl's instruction.** The copy is in ONE module, `components/about/about-card-copy.ts`, checked character for character against the final forms; ⚠ **CS is 56 words, not 55, and the record is corrected everywhere.** The measurements are in `live-work/card-text-measurements-24-september.md`:
- ⛔⛔ **The overlay's fit does NOT transfer.** It set the copy in a 420x260 box, the aspect D-082 disproved; the largest justified size that fits the real face is **−24% on CA and −22% on CB**. The setting must be done fresh.
- ⚠ **CB's far edge renders at an 8px em at 1440**, even at the largest fitting size. That is D-077's legibility budget, now measured.
- ✔ **The texture budget is small:** all four cards need **under 5 MiB** at 1920 DPR 2 with one channel. D-086's 32 MiB/card does not hold.
- ⚠ **The dome curves the text on screen.** The justified edges stay within 2.5px of straight; a middle line on the floor cards curves by 8–11px at 1440, against a flat control at 0.00. Carl judges it by eye.

⛔ **ACCESSIBILITY IS DEFERRED TO MASTERING — Carl, 24 September 2026:** *"When the site is finished and the 'mastering' is taking place we will optimise for screen readers, mobile and anything else we need to."* ⚠ **This defers D-086's `sr-only` copy; it does not drop it.** It also carries the other owed items (D-088's and D-091's reduced motion, the flash cap) into the mastering pass (D-035). The copy's one source for the screen-reader text already exists (`about-card-copy.ts`).

**CA's etched text is BUILT behind `?etch=1`, through the plan-review gate** (plan, Architect response and run log in `live-work/`, all `…-24-september.md`). ⛔ **NOT APPROVED — Carl tunes it by eye.** Two measured findings go to him:
- a first-render stall that lands on the ignition's first frame on a direct `#roles` landing (114–249 ms against 68 ms without the etch)
- the glow's hue at 234° against the 211° target, where `?etchhex=1b5c8a` measures 210°.

⛔ **TUNED BY EYE, 24 September 2026 — CA at the whole face (`etchbw=1&etchbh=1&etchem=44`, +30%) with the glow matched to the rim AS SEEN** (`etchhex=5c9cff&etchglow=0.1`: glyph cores `#80baf2`, 209° / 81% / 72%, against the rim's `#7eb7f3`, 211° / 83% / 72%). Carl: *"Thats a lot better, more readable now."* ⚠ **Recorded at the level given — "better", not approved.** ⚠ **The finding behind it:** the rim on screen is the tube tone-mapped at intensity 6 PLUS its untone-mapped bloom, and the text has no bloom, so **matching the tube's hex can never match the rim as seen.** Measured in `live-work/run-log-card-text-etch-24-september.md`.

⚠ **RAISED BY CARL, NOT CHOSEN — "display options":** *"making the text bigger but not having it all in the card at the same time, and there are a few ways to do this."* ⛔ **It depends on how CB looks with this configuration** — *"Its angle is different."* No option is named or chosen yet; record the ones Carl names when he names them (the brainstorm rule, `context-rules.md`).

⚠ **CB JOINED, BEYOND THE CA-ONLY PLAN — a gate waiver for THIS PIECE ONLY.** Carl, 24 September: *"Yes it does go against the approved plan but we had no idea how that plan would look in practice. The plan would have to be modified depending on how CB looks and we wont know that until text is put into CB. Only then can a decision be made to make both wall card text non static."* ⛔ **A waiver is not standing.** It was the same pattern, the same files and no new structure.
- **The new defaults (behind `?etch=1`):** the whole face (`ETCH_BLOCK` 1 x 1); the largest fitting size per card (**CA 44mm, 8 lines, 475/477 · CB 40mm, 8 lines, 432/443**); glow `#5c9cff` at 0.1.
- **The colour carries to CB:** glyph cores **211° / 90% / 70%** against CB's rim as seen, **211° / 84% / 72%**.
- The identity gate is still **0 px** without the flag.

⚠ **"NON-STATIC" IS THE DISPLAY OPTION CARL IS WEIGHING** for the wall pair's text: bigger type, not all on the card at once. **It depends on CB's angle**, and the ways to do it are his to name. Raised, not chosen.

### ⚠ RAISED BY CARL AND BEING DEVELOPED, 24 September 2026 — "THE COPY CHASING ITSELF". NOT YET RULED

**The problem it answers:** CB's receding side is unreadable at room distance (~9 px at 1440) and
will be worse on mobile; the setting has run out at the whole face. Carl: *"We are gonna have to
pivot and think on our feet."*

**Carl's idea, verbatim:** *"First sentence reveals. Then the second sentence. We follow this pattern
until putting in the whole of the next sentence means it wouldnt fit in the card. At this point we
return to the first sentence and hide it. meaning the left to right reveal makes the text disappear.
At the appropriate time we reveal the next sentence. It wouls be like the copy is chasing itself.
The text could be bigger and becuase timing is involved the process could be carefully
choreographed. Its not as if we havent done it before on this site. 'variation on a theme'."*

- **"Variation on a theme"** is §14a's own phrase: `/start` and the Q&A already reveal text with a
  left-to-right wipe.
- **Why it works:** the card only ever holds as many sentences as fit, so the type is sized to the
  largest SENTENCE, not to the whole paragraph.

**Also raised in the same exchange — its standing:**

| raised | standing |
|---|---|
| *"the text doesn't have to be in the card all at once"* | the premise of the idea above |
| **extruded text**, with a well-placed light for the far edge | **measured, not chosen and not rejected** (`live-work/run-log-card-text-etch-24-september.md`): whole cards 126k–838k triangles, 90–495 ms to build; one sentence at a time ~57k triangles / ~41 ms at its cheapest |
| a **display behind frosted glass**, with scrolling or paging | **raised by the Builder**; Carl developed the reveal instead |

⚠ **A consequence Carl should rule on:** text that is written and then erased is not a cut in the
glass. **The permanent etched frost does not fit a copy that disappears.** The idea points to the text
being LIGHT (the glow), and that may amend the etched-glass ruling above. ⛔ **The ruling is Carl's.**

⚠ **REFINED BY CARL — the control is READING POSITION, not sentences:** *"We dont have to use sentences as the control. If we get through say, 75% of the cards visible text, the earlier text ( first sentence) could be removed and as the user is coming to the last few words on the cards, space will be available at the beginning. Look at the text reveal on the start page. Its not a random number. Its at the speed that an average person reads at."*

⛔ **So: a WRITE head and an ERASE head, both at reading pace, a fixed gap apart.** The erase starts when the write reaches ~75% of the card's capacity, and the write wraps into the space freed at the top. Sentence length stops constraining the size (the sentence-as-unit framing above is superseded by this).

**Tuning: size against a slow reader's grace**, the time before the text they are on is erased. For CB, from the measured 40 mm fit and ESTIMATED beyond it:
- 50 mm: ~12 px at the far edge, ~13 s of grace
- 57 mm: ~13 px, ~10 s of grace

**The reading pace is recorded here because it is written down NOWHERE:** it is implicit in `/start`'s approved durations (`globals.css`, `.enquiry-*-mask`). Derived from the real copy:
- **body (the subtext): 12 words / 59 characters in 4.2 s → ~171 wpm, ~14 characters/s**
- the heading lines: ~114 wpm

At the body pace one pass of CA takes ~22 s, and of CB ~29 s. ⚠ **Carl holds the source reading-speed data** (*"i got timing data on how fast an average human reads"*, 27 July); these figures are derived from the durations, not from it.

**Open, Carl's:**
- the size / grace trade
- a rest at the loop point (D-087's *"a rest before the downbeat"*)
- whether the erase is gentler than the reveal: it happens in peripheral vision
- the start's coupling to the neon ignition
- the material (whether the etched frost goes)

⚠ **RAISED BY CARL AND BEING DEVELOPED — THE FOUR CARDS STRIKE IN TURN, LED BY THE READING.** *"Just before the end of CA process CB could flicker on, This doesnt put too much infomation on screen at once and gently leads the user as the q+a does and as the client info does."* **It would REPLACE D-093's ignition schedule** (all four within ~8 s), which **has no verdict**, so nothing approved is undone. ⚠ It interacts with **D-092's trigger**.

**The precedent is the site's own principle:** the next element begins BEFORE the current one resolves, at a point tied to what the reader is doing, and the lead point is a RELATIONSHIP, not a fixed delay:

| section | lead point |
|---|---|
| `/start` | each element 600 ms before the previous ends; Begin "during the final words" (reading pace) |
| Q&A | card 1 at **half the question's reveal** (`CARD_FIRST_ENTRANCE_MS`), then a 72% overlap |
| client info | the fields at ~78% of the supporting sentence's reveal, 500 ms apart with overlapping fades |

**So CB's lead point would be a POSITION in CA's copy** (its last line or last few words), not a fixed time.

**First-pass estimates at 171 wpm:** CA ~22 s · CB ~29 s · CD ~17 s · CS ~20 s, so **CS strikes about a minute in.**

**Open, Carl's:**
- the dark wait for the later cards: a scanner sees unlit rims for longer, and RIM-DARK makes that state read worse
- what CA does once CB takes over: keep chasing, hold, or quiet down (the Q&A's *"it's done its job"*)
- whether the floor pair also waits to be in view (D-092)

⚠ **THE SEQUENCE, CALCULATED FROM `/start`'s READING FIGURES (Carl asked for it to decide the loop), 24 September 2026:**

**Inputs:**
- **The pace:** `/start`'s body subtext, 59 characters / 12 words in 4200 ms → **14.05 characters/s (71.2 ms each), 171.4 wpm.**
- **The overlap:** `/start`'s **600 ms**, so each card's text starts 600 ms before the previous card's text ends.
- **The ignitions:** as built (D-093) — CA 1950 ms, CB 1610, CD 1700, CS 1690 — each timed so its neon HOLDS just as its text is due to begin.

| card | characters | words* | reading at 14.05 char/s | (at 171 wpm) | neon starts | text starts | text ends |
|---|---:|---:|---:|---:|---:|---:|---:|
| CA | 428 | 65 | **30.5 s** | 22.8 s | 0.0 s (the trigger, D-092) | 1.9 s | 32.4 s |
| CB | 470 | 84 | **33.5 s** | 29.4 s | 30.2 s | 31.8 s | 65.3 s |
| CD | 284 | 50 | **20.2 s** | 17.5 s | 63.0 s | 64.7 s | 84.9 s |
| CS | 331 | 57 | **23.6 s** | 19.9 s | 82.6 s | 84.3 s | **107.9 s** |

\* Whitespace-split, so the em dash counts as a word (the D-077 counts are 64 / 84 / 49 / 56).

**Each next card's flicker begins ~2.2 s before the previous text ends, which is its last 6–7 words:** *"during the final words"*, as Begin does on `/start`.

**TOTAL first pass, trigger to CS's last word:**
- **~108 s by characters**
- ~90 s by words

⚠ **The two paces differ because this copy is denser:** ~6.6 characters per word against the subtext's 4.9. **Characters are what the wipe crosses; words are what the reader reads.** Which one sets the clock is Carl's.

⛔ **SUPERSEDED THE SAME DAY — MEASURED, NOT DERIVED. The pace is 200 wpm.** Carl timed CA with a stopwatch (*"less than 20s"*) and named the tool: **Read-o-Meter, `https://niram.org/read/`**, *"This site will give you accurate results"* (200 wpm; it computes in the browser, with no upload).
- **Its results:** CA **19 s** (65 words) · CB **25 s** (84) · CD **15 s** (50) · CS **17 s** (57). It counts the em dash as a word, as the table above did.
- **They agree with Carl's stopwatch.** The ~108 s / ~90 s figures above are superseded; they are kept for the reasoning.

| card | reads | neon strikes | text | flicker leads the previous text's end by |
|---|---:|---:|---|---|
| CA | 19.5 s | 0.0 s | 1.9 → 21.4 s | — |
| CB | 25.2 s | 19.2 s | 20.9 → 46.0 s | 2.2 s ≈ its last 7 words |
| CD | 15.0 s | 43.8 s | 45.5 → 60.5 s | 2.3 s |
| CS | 17.1 s | 58.2 s | 59.9 → **77.0 s** | 2.3 s |

**TOTAL, trigger to CS's last word: ~77 s.** ⚠ **Note:** `/start`'s own body reveal runs at ~171 wpm, slower than 200. The cards would reveal a little faster than `/start`'s text.

**Second opinion — Gorby (`https://gorby.app/tools/reading-time-calculator/`), on Carl's instruction.**
- ⚠ **It rounds UP to whole minutes** ("1 minutes" for every card at every speed), so **it cannot time copy this short.**
- **Its word counts are 64 / 84 / 49 / 56**, matching D-077: it does not count the em dash.
- Seconds computed from its counts at its speeds:

| | CA | CB | CD | CS | total, trigger to CS's last word |
|---|---:|---:|---:|---:|---:|
| Read-o-Meter @200 | 19.5 | 25.2 | 15.0 | 17.1 | **76.9 s** |
| Gorby's counts @200 | 19.2 | 25.2 | 14.7 | 16.8 | **76.0 s** |
| Gorby @150 ("slow") | 25.6 | 33.6 | 19.6 | 22.4 | 101.4 s |
| Gorby @250 ("average adult") | 15.4 | 20.2 | 11.8 | 13.4 | 60.9 s |

✔ **At the same speed the two tools agree to 0.3 s per card, <1 s in total**; the only difference is the em dash. ⚠ **The real variable is the SPEED ASSUMED, not the tool:** 150–250 wpm spans **61–101 s**. Carl's stopwatch (CA under 20 s) sits at 200.

⛔ **THE AUDIENCE THE PACE IS SET FOR — Carl, 24 September 2026:** *"We can assume that a business owner or someone who is responsible for the commission of a website will be a user. We must give them credit for a little bit more than average intelligence and not a slow reader. Its difficult not to be judgemental on this as its hard to quantify."* *"Timing for this will be all important."*
- ⚠ **The Builder's first figure (~107 s) was wrong by ~30 s:** it stacked `/start`'s ~171 wpm subtext pace on a per-character clock that penalised this denser copy. **Carl's stopwatch and two tools corrected it.**

**The Builder's recommendation, NOT ruled:** split the one compromise into TWO numbers.
1. **The reveal pace**, at the audience's speed: **~225–240 wpm**. The average adult reads non-fiction at ~238 wpm (Brysbaert 2019, a meta-analysis of 190 studies; from knowledge, not re-checked this session). Carl's stopwatch puts him at ~200.
2. **The grace**, the erase head's gap, sized for the slowest reader still served: **~200 wpm**. A 200-wpm reader of a 240-wpm reveal falls ~17% behind, **~4 s by the end of CB**, against ~10–13 s of grace at the larger sizes.

**The whole sequence, trigger to CS's last word, by reveal pace:** 200 → 76 s · 225 → 68 s · 240 → 63 s · 250 → 61 s.

⚠ **To quantify rather than judge:** time 3–4 real business owners reading CA on the card.

⛔ **RULED — AUTOMATIC, NEVER CLICK-TO-ADVANCE. Carl, 24 September 2026:** *"The worse scenario here is that we keep most users waiting. The way around this is if we give them something to click but id rather avoid that- too mechanical, we must provide the automatic average mechanics."*
- ⛔ **A click / advance control: RAISED BY CARL AND NOT CHOSEN** — *"too mechanical"*.
- ⚠ **The priority it sets:** keeping most users WAITING is the worst case. Falling behind is the lesser one, because the erase head's grace can absorb it.

⛔ **EXTRUSION IS THE ROUTE; CA FIRST, ONE CARD. Carl, 24 September 2026:** *"We will try it with CA first. Let us stick to one card at the moment… seeing as we are going with extrusion that raises interesting options and possibilities of what to do with light. Mainly WebGL light that can move."*

⚠ **This SUPERSEDES the etched-glass material ruled this morning.** Etched glass was built behind `?etch=1` and tuned (the rim-matched glow, the whole-face setting); it stays in the code, gated, until Carl rules on removing it. **Why it went:** CB's receding side was unreadable at room distance, and the copy now writes and erases (the chase), which a cut in glass cannot do.

**What extrusion brings, measured today** (`live-work/run-log-card-text-etch-24-september.md`):
- ~57k triangles and ~41 ms to build CB's largest sentence at its cheapest; whole cards 126k–838k triangles, 90–495 ms
- **Geist must be converted** into a font format three can extrude: a new asset and a new pipeline
- geometry edges alias more than a filtered texture, worst when small and moving
- a 4 mm depth is ~1 px at the far edge, so **the depth shows only if the letters are bigger or deeper**
- the letters must follow the dome

⛔ **§5a — a new mechanism. The plan goes to the Architect.**

**Next subject, opened by Carl: moving WebGL light on the extruded text.**

⛔ **THE LIGHT ON THE EXTRUDED TEXT — CARL'S DIRECTION, 24 September 2026:** *"the difference from q+a. Each letter has a different geometry that will appear and change what is in the same place at different times. Shadows are the biggest win here so placement and movement doesnt have to be 'sweeping'. Having a light angled either down or up will present the shadows in a certain way. If its slightly off centre, say left and makes its way right and back again the shadows will be slightly animated. We need to keep the text, albeit larger, legible. So subtle animation will be achieved."*

**The principle:** the CHANGING TEXT supplies the variation (new letter geometry arrives where old letters were), so **the light need not sweep**. It is **SHADOW-FIRST, for legibility**, from **one light angled down or up, slightly off-centre left, drifting right and back.** The animation is subtle.

| option | standing |
|---|---|
| a shadow light, off-centre, a slow left–right–left drift | **CHOSEN as the direction** |
| the light as the write head | raised by the Builder, **not taken up** |
| the rim as a real light on the letters | raised by the Builder, **not taken up** |
| a roaming / orbiting light like the contact field's | raised by the Builder, **not taken up** — *"doesnt have to be sweeping"* |

**Open, Carl's:**
- **above or below** — *"either down or up"*
- the drift's range and period
- the extrusion depth and the light's angle, which together set the shadow's length

⛔ **DOWNWARD — Carl, 24 September 2026:** *"If you look at the scene there are 3 lights in the ceiling. Im not soggesting we put lights in that location, im just making the case for downward pointing lights."*
- **Downward is CHOSEN; up-lighting (from the monitors below CA) is raised and NOT CHOSEN.**
- ⚠ **The ceiling downlights are the JUSTIFICATION, not the POSITION:** the light is not placed at them.
- **Why it holds:** the photograph's own shading already falls downward, so the text's shadows agree with the room (§14a). It also matches how relief is read: raised letters lit from above read as raised.

⛔ **THE "DRY" EXTRUDED TAKE IS BUILT behind `?extrude=1`** — CA only; every rim off; one white spot, centred, static, downward; the chase at 240 wpm with a lead and a rest. **The gate was waived by Carl for this piece.** ⚠ **NOT APPROVED.**

**Measured** (`live-work/run-log-card-text-extrude-dry-24-september.md`):
- 10 lines in 6 slots
- a 16.8 s pass
- ⚠ **grace 4.5 s**
- a 309 ms compile stall at the start
- ⚠ **a specular hotspot from the spot washing out words at the top-centre of CA's glass**

⛔ **THE PASS — RULED BY CARL, 24 September 2026:** *"once it has reached the end it should start again from the top left. To make space for it have the preceeding text disappear. Only when the last word has disappeared then start the cycle again. Slow it down to the speed of the start page text."*
- **The model:** each pass ends by erasing everything left, and the next begins on an EMPTY card, top left. It supersedes the continuous wrap across passes.
- **The pace is `/start`'s, 171.4 wpm** (was 240). The lead is off and there is no rest.
- **Measured on CA:** a 32.9 s cycle (22.8 s writing + 10.2 s clearing), grace 7.7 s.

✔ **CARL'S VERDICT ON THE PASS MODEL AND THE PACE, by eye, 24 September 2026:** *"This is a lot better because it also solves the problem if someone reads slower. The text is on the page for longer giving them time to read it. The whole sequence is not long enough for someone to lose focus and it is clearly 'pages' with a start and end. This i great."*
- ⚠ **Recorded at the level given.** It covers the **pace (`/start`'s 171.4 wpm)** and the **"pages" model** (each pass writes, clears to an empty card, restarts top left).
- ⛔ **It does NOT cover:** the light (intensity 0.5, angle 45°, the hotspot), the extrusion depth, the letters' colour and roughness, the type size, the greedy breaks, or the 10.2 s clear. Those are still takes.
- ⚠ **Why it works, in Carl's terms:** the slower pace IS the slow reader's grace (7.7 s at minimum), so one number answers both the waiting problem and the falling-behind problem. **The page boundary gives the copy a beginning and an end.**

⛔⛔ **PROMOTED TO PLAIN `/about`, RIMS OFF — Carl, 24 September 2026 (session 2):** *"First turn off all the rim lights. Can you see what was built here at this URL? I want you to implement it… No need for a plan or the architect, this already has been approved."* Scope restated and confirmed: *"Yes… After we made the plan we had to pivot. Certain complications arose. What we arrived at was far better than i had envisaged. The rim lights should be turned off so we can see the card in isolation. CA light intensity was modified, it stays static for now."*
- ⚠ **A gate waiver for THIS PIECE ONLY.** It is not standing.
- **What changed:** `extrudeEnabled()` is `?extrude !== "0"`, so plain `/about` IS the take: CA's extruded text in "pages", the neon NOT mounted (every rim plain clear glass, no bloom), one white static spot at 0.5. ⛔ **`?extrude=0` is the previous page exactly**, and the only route to the neon, its faders and the etched take (`&etch=1`). `?extrude=1` still works and means the same.
- **Measured** (`live-work/run-log-extrude-default-24-september.md`): `?extrude=0` against the pre-neon baseline reads **0 px on all four arms** (`about-neon.mjs` now pins `extrude=0` in its one URL builder and says so in its output). Plain `/about` against HEAD's `?extrude=1` at fixed clock offsets differs **only inside CA's face**, within the run-to-run noise of the wipe.
- ⚠ **"Far better than I had envisaged" is recorded at the level given:** a verdict on the pivot's result (etched → extruded, "pages"), not on any single value. **The light stays static at 0.5 "for now".** Every other look value is still a take.
- ⚠ **What plain `/about` now pays on every visit:** the shadow pass and the clock-start compile (the 309 ms task), previously flag-only. ⚠ **Not re-measured as a cost:** the long tasks read 139/637/195/314/366 ms on plain `/about` against 123/616/187/274/313 at HEAD's `?extrude=1`, **one dev-server run each, buffered from page load.** The same order of cost, **not a production figure and not a comparison fine enough to call a regression.**
- ⚠ **Parked, not built:** the step 1 plan (text into CB, CD, CS). ⛔ **Its measured limit:** at 52 mm the floor faces fit 4 slots and the grace falls to **2.8 s (CD) / 2.5 s (CS)** against CA's 7.7 s. See `live-work/cards-text-isolation-plan-24-september.md`.
- ✔ **CARL'S VERDICT ON PLAIN `/about` AS PROMOTED, by eye, 24 September 2026 (session 2):** *"Thats great. we can commit and push this."* ⚠ **Recorded at the level given:** the promotion itself (the take as plain `/about`, rims off, light static) is accepted. ⛔ **It does not approve the look values** listed under R-029 as takes.

⛔⛔ **CB'S TEXT, AND ONE CARD AT A TIME — Carl, 24 September 2026 (session 2).** *"Same text size, same type of text. Same reveal. It should appear in the card in the same way as CA text does. The only difference being is that CB has more words. So that means the total reveal time will be longer."* Then: *"isolate CA text so we can focus on CB. It doesnt need to be seen at the moment. We should do it one card at a time. When all 4 cards have text we can then work out at what point a card triggers the next and what does that card do after."*
- **The sequence, stated as direction, NOT built:** *"A user will arrive and CA will start. The rim will flicker on and the text will start. Just as the text sequence is coming to an end, CB will activate and so to the rest of the cards. We will work out all the details later."* ⛔ **This is the first chunk; others follow with discussion in between.**
- **Built:** `extrudeCard()` selects ONE card per load. Plain `/about` shows **`EXTRUDE_WORKING_CARD` = CB** (a working position, not a design). `?extrude=ca|cb|cd|cs` picks a card; **`?extrude=1` still means CA**; `?extrude=0` is the neon page; anything else mounts nothing and logs why.
- **CB's light — *"Each card gets its own light, white for now… approximately in the same position as CAs light given its proportions"*:** CA's spot at 900 mm **scaled by face width** (1092/1220 ≈ 806 mm), with the same 45°, cone, intensity (0.5) and colour. The cone covers CB with CA's margin, and the shadows keep CA's length.
- **Measured** (`live-work/run-log-cb-text-24-september.md`): CB **12 lines, 5 slots, erase 3 behind, a 38.9 s cycle, grace 6.7 s** (CA: 10 / 6 / 4 / 32.9 s / 7.7 s). ⚠ **The shorter face gives one slot fewer at the same size.** ✔ **CB's light spills 15 px at a delta of 1 level**, on CA's right-hand rim; nothing else. ✔ `?extrude=ca` renders CA as before, within the wipe's run-to-run noise.
- ⚠ **The parked plan is SUPERSEDED on two points by Carl's direction:** the text lives on plain `/about` (not only behind a flag), and **one light per card is DECIDED** (the plan's §5a question).
- ✔ **CARL ON CB, by eye, 24 September 2026 (session 2):** *"CBs speed is good. The only problem i have with it is with the readability of the furthest text. The angle the card is at doesnt help."* ⚠ **Recorded at the level given: the pace on CB passes; the far (left) side's legibility is an OPEN problem**, the one D-094 already measured for the etch (*"CB's receding side is unreadable at room distance"*). ⛔ No fix chosen. **The reveal lengths he asked for:** CA writes in **22.8 s** and clears in 10.1 s (a 32.9 s cycle); CB writes in **29.4 s** and clears in 9.4 s (38.9 s).
- ⛔ **CB: SPOT OFF, RIM ON — Carl, 24 September 2026 (session 2):** *"On CB, turn off the light but turn on the rim."* Step 2 of his order, taken on CB. **Built as per-card switches** (`EXTRUDE_SWITCHES` in `card-extrude.tsx`): CB defaults to spot off and rim on, **CA keeps spot on and rim off**, so `?extrude=ca` still shows what R-029/R-030 judged. `?textlight=0|1` and `?textrim=0|1` override. With the rim on, the neon mounts as on the neon page (`neonMode()`: CB's ignition when the wall is in view, and every neon fader applies), but **only the selected card's channel is passed**, so the other three rims stay unlit. ⚠ **Measured, the same words at the same moment** (95th/35th luminance, the word against the glass behind it): the ratio holds, **~1.8 on both** (spot 1.84 / 1.78 / 1.81 near-centre-far; rim 1.78 / 1.82 / 1.80), but **everything is ~20–25% darker** (letters 126 → 94–106). ⚠ **The rim casts no light** (D-093: emission and bloom are seen, not received), so the letters are now lit by the room's key and ambient only. ⛔ No verdict yet.
- ⚠ **CARL ON CB WITH THE RIM ONLY, by eye:** *"It looks better close up. I think i know the problem but before i give you my thoughts turn the light back on so CB has Rim and WebGL light."* ⚠ **Recorded at the level given: "better close up" — at room distance it is not judged better.** CB's default is now **spot ON and rim ON** (`EXTRUDE_SWITCHES`). ⛔ **Carl holds a diagnosis he has not yet given; record it when he does.**
- ⛔ **CB'S EXTRUSION DEPTH 3 → 1.5 mm — Carl's diagnosis, 24 September 2026 (session 2):** *"Whats not helping is the angle and that cannot be changed… CA and CB are at different angles to the user, the text shouldnt be at the same extruded height. It should be slightly smaller. That might help with the readability issue."* ⚠ **MEASURED, and it holds.** The view angle off the face normal is **CB 46.5° / 37.4° / 25.5°** (far / centre / near) against **CA 23.7° / 12.1° / 4.0°**. A side wall shows at ≈ (depth ÷ stem) × tan θ of a stroke's face, and Geist's stem is ≈ 4.5 mm at 52 mm. **At 3 mm, CB's far edge carries 70% against CA's worst 29%.** 1.5 mm gives CB **35% / 26% / 16%**; ≈ 1.25 mm would match CA's worst. ⚠ **This is a larger size's hidden cost:** a bigger letter scales its side wall with it. By eye, the far words read cleaner at 1.5. The contrast ratio dips slightly (far 1.76 → 1.69) because the side walls were adding light, not form. **A take; CA stays at 3 mm.** `?textdepth=` overrides.
- ⛔⛔ **THE DEPTH RULE — Carl, 24 September 2026 (session 2), confirmed for recording:** ***the steeper a card sits to the viewer, the shallower its letters.*** Carl: *"It makes sense because the more the text comes out from the card the more oblique it will be to the user."* ⚠ **Stated precisely:** depth does not change the viewing angle (the card's placement does). It changes **how much side wall shows at that angle**, ≈ (depth ÷ stem) × tan θ. **How to apply: for CD and CS, MEASURE each card's view angle first (far / centre / near) and set a starting depth from this rule; do not inherit CA's 3 mm.** Reference points: CA ≤ 23.7° carries 3 mm (worst side wall 29% of a stroke); CB ≤ 46.5° takes 1.5 mm (35%).
- ⚠ **RAISED BY CARL, NOT CHOSEN — GLOBAL LIGHTS INSTEAD OF ONE PER CARD, 24 September 2026 (session 2):** *"what is a further problem is the lights reflection in the card. It can blow out a word and a location. The cards may not need individual lights but global lights for the whole scene."* ⚠ **It reopens "each card gets its own light"**, ruled earlier the same session. **Not decided.** The Builder's framing, given to Carl: a shared light still reflects in a glossy dome, so global lighting makes highlights CONSISTENT and world-caused (§14a) but does not remove them. What removes a hotspot is (1) a BROAD source, e.g. `RectAreaLight`, a soft sheen with **no shadows**; (2) placing the light outside the reflecting angles, hard on a dome; or (3) no direct light on the glass: CB rim-only had no hotspot and read *"better close up"*, at ~20–25% less level. ⚠ **Three.js cannot light the letters without lighting the glass;** there is no per-object light selection.
- **The light sweep, stopped by Carl part-way** (`live-work/run-log-cb-text-24-september.md`): swinging CB's spot 20° right to 60° toward the far end left word contrast flat at ~1.7 and clipped nothing, and **moved the reflection across the dome**. The faders `?lightyaw=` and `?lightaimx=` exist (defaults 0, no change).

⛔⛔ **CD AND CS HAVE THEIR TEXT; EVERY CARD LIGHT OFF — Carl, 24 September 2026 (session 2):** *"a way around this is to change the light type and to alter the intensity. Turn all the lights off and put the text in for CD and CS. We will commit and push then. Next step would be to make visible all the text in each card but make them static for now. Then look at the light issue."*
- ⛔ **THE LIGHT DIRECTION, CHOSEN IN OUTLINE:** *"change the light type and… alter the intensity."* This is the route for the reflection problem raised above. **The type and the values are the light chunk, after the static chunk.**
- **Carl's order from here:** (1) this, committed and pushed; (2) ALL FOUR cards' text visible, **static**; (3) the light.
- **"All the lights off"** was read as **every card's own spot and rim** (`EXTRUDE_SWITCHES`, all false). The room's ambient, key and fill are untouched. `?textlight=1` and `?textrim=1` restore either. CA's judged state is `?extrude=ca&textlight=1`.
- **CD and CS:** CA's treatment at 52 mm, one card per load (`?extrude=cd` / `?extrude=cs`); plain `/about` stays on CB. **Depth by the depth rule** from measured view angles (far / centre / near): **CD 26.9 / 27.4 / 34.7° → 2 mm** (side wall 31%) and **CS 60.0 / 52.8 / 44.2° → 0.9 mm** (35%; at 3 mm it would be 115%).
- ⚠ **MEASURED LIMITS, reported plainly:**
  - **CS is the steepest card of the four.** Its far letters are squashed to about half their width at 60°, which no depth can fix.
  - **With the card lights off, CS's text is dim grey:** the room's key reaches CS at ~0.18.
  - **CS's setting opens word gaps up to 7.1× a space** on its narrow face (the fit chunk).
  - **The floor pair's grace is 2.8 s (CD) / 2.5 s (CS)** against CA's 7.7 s: 4 slots at 52 mm (reported before building).
  - **CD reads well:** the fill light reaches it.

⛔⛔ **ALL FOUR CARDS' TEXT VISIBLE AND STATIC — Carl, 24 September 2026 (session 2):** *"make visible all the text in each card but make them static for now"*, then *"yes, so that there is a lot of text on each card to judge."*
- **Built:** `extrudeCards()` — plain `/about` (or `?extrude=all`) mounts **all four**. `?extrude=cb` isolates one; a comma list (`ca,cb`) mounts several; `1` = CA; `0` = the neon page. Settings are **per card** (depth, switches). `still` (`?textstatic=0|1`, default **on**): each card shows **its first full page, every slot filled, no chase and no self-invalidation.** `?textstatic=0` runs the pages.
- ⚠ **"All the text" read as A FULL FIRST PAGE:** at 52 mm no card holds its whole copy (CA 10 lines in 6 slots, CB 12/5, CD 11/4, CS 13/4).
- ⚠ **The font now loads ONCE for all cards** (a module-level promise); the typeface JSON is **~33 KB** (⚠ *corrected in place: first recorded as "~198 KB" from a misread `ls` listing, since the username has a space and the columns shifted; `stat` gives 34,048 bytes*), and would otherwise be parsed four times. ⚠ The saving is small; kept because it costs nothing.
- **Measured:** two loads of plain `/about` are **pixel-identical (0 px)**, so the frame is truly static; neon identity gate **0 px** on all four arms; tsc clean; lint at baseline. The card lights are off (as ruled), so CB and CS read dimmer and CD brightest (the room's fill reaches it).
- ⛔ **A FONT DEFECT, FOUND HERE:** CA's **"H"** (in "High-level") renders with a filled wedge. **Cause:** in `geist-regular.typeface.json` the H is ONE self-crossing contour (its crossbar overshoots both stems, x 186 vs stem 247, 804 vs 743), which three's triangulator cannot fill correctly. The converted Geist keeps **overlapping outlines** (typical of a variable-font instance). A crude check also flags h, n, a, u, r, p, m, B and F (arch-into-stem overlaps), **but only the H is visibly broken.** **The fix is to rebuild the typeface from an overlap-removed static Geist** (`scripts/build-geist-typeface.mjs` and the font file), **outside this chunk's scope; Carl's call.**
- ⛔ **CARL, on the static four, 24 September 2026 (session 2):** *"Wow. The problems just keep mounting up — where do i start?"* The Builder's triage, with measurements:
  - **SIZE IS THE ROOT.** On-screen em at each card's centre: **CA 12.2 px, CB 14.3, CD 22.2, CS 22.7.** The floor text reads ~1.8× the wall text, which also causes its 4-line pages, wide gaps and 2.5–2.8 s grace. **At ~30 mm (screen-matched) the floor pair holds its WHOLE copy on one page:** CD 6 lines in 7 slots, gap 2.5×, grace 15.4 s; CS 7 in 7, gap 4.4×, grace 13.7 s.
  - Then the angle (a limit, partly mitigated), the light chunk, the setting, and the H (a bug, independent). **The principle Carl is asked to choose: same size ON SCREEN or same size IN THE WORLD.** Not decided.
- ⛔ **RULED — CS's COLOUR CANNOT STAY AS IT IS. Carl:** *"Also CS colour cannot stay as it is. Because of the backgroud its the worse for legiblity and its the closest card."* ⚠ **MEASURED:** CS's average contrast is fine (letters 128 against glass median 64), but **the glass behind it ranges 16–117 (10th–90th percentile)**, so where a letter crosses a bright patch it falls to ~1.1 : 1. CD has the same spread (28–132), and the fill light lifts its letters to 165. ⚠ **The principle: legibility is set by the BRIGHTEST patch behind a letter, not the average.** The levers: (1) CS's glass colour or tint, to calm the field; D-090 lets colour move, and **the 0.86 frost is D-089-approved and needs Carl to reopen**; (2) brighter letters (the light chunk); (3) dark letters do NOT work, because the field runs both ways. **How to change the colour is not chosen.**
- ✔ **THE "H" IS FIXED — Carl: *"Yes, fix the 'H'."*** The typeface is rebuilt from **Vercel's own static `Geist-Regular.ttf`** (`geist` npm package v1.7.2; font version 1.800, the same as before), replacing Google Fonts' variable-font instance. **Measured:** self-crossing contours among the 41 glyphs used went **10 → 0**; **advances are identical for all 42 characters used**, so every card's lines, slots and gaps are unchanged (the console lines match exactly); triangles fell ~9% (CA 85,200 → 77,292) because the overlap walls inside letters are gone. On screen, the H reads cleanly and the other changes sit only at the old overlap joins. The build script's source note is corrected in place, with *"Do not go back to the Google Fonts TTF."* ⚠ **Nothing checks a future source for overlaps (unasserted).**

⛔⛔ **RAISED BY CARL, LEANING — REPLACE THE ROOM PHOTOGRAPH. 24 September 2026 (session 2):** *"The concept and technique are good. It works. I can see tremendous possibilities. What doesnt work? The environment. Had i known what i know now going through this process- i wouldnt of chosen this image. That drastic!"* ⚠ **NOT DECIDED.** It would reopen **D-073** (the room is a real photograph) as to WHICH photograph, not whether it is real, and it touches **D-082/D-084** (placement, depth proxy), **D-089** (glass values tuned to this background), **D-092** (the room in §1) and **D-088** (the mark on a desk into §3, proposed).
- **The Builder's reading: every problem measured today is the room's, not the technique's** — the view angles (CB 46.5°, CS 60° off normal), the distance spread (on-screen em 12.2 / 14.3 / 22.2 / 22.7 px), the backgrounds (CS's glass field 16–117), and uneven light.
- **What carries over:** the extruded text and page model, the depth rule, per-card settings, the typeface fix, the card mesh and glass as a material, the neon, and the camera-solve method (perspective solve, depth proxy, env map). **What is redone:** placement, solve, proxy geometry, lighting rig, per-card glass values, the in-view band.
- **Selection criteria from today's measurements (candidates for Carl):** (1) card faces within ~25° of square to the camera; (2) cards at similar distances, so one type size reads alike; (3) calm, even surfaces behind the faces; (4) visible light sources that can justify the card lights; (5) faces tall enough for 6-line pages (~470 mm). **Standing constraints:** a REAL photograph (D-073, *"If anything says 'made with AI', its this picture"*) and a clean licence (D-079).
- **Builder's recommendation:** commit the current state (four cards static, the H fixed) first, as the reference the rebuild is measured against.
- **Carl, confirming the commit:** *"On the positive side - we have all the assets and know how so its not a 'back to the drawing board'."* The current state (four cards static, the H fixed) is committed as the reference point for a room change.

## D-095 — PROPOSED: The Room Is CONSTRUCTED, Not Found. A Wireframe First, Governed Generation At Most

**Date:** 2026-09-24 (session 2)
**Status:** ⚠ **PROPOSED — raised by Carl, not decided.** ⛔ **It would REOPEN D-073** ("DO NOT REPLACE IT WITH A GENERATED IMAGE"), which only Carl can do.
**Authority:** Human Founder — Carl.

**Carl:** *"We have 2 choices. Try to find a suitable image or have AI consruct one. I favour the latter but i want to do it differently than one shot a prompt and iterate. I would want to construct a wire frame, a scene constuction. Does it have to be photo realistic? Not neccersarily. It must be an office environment. The visual style is open. Plus, i have Davinci Resolve. So we must 'build' our office ourselves."*

- **Raised and not chosen:** find a suitable photograph (the other of Carl's two choices; not favoured).
- ⛔ **Why it differs from what D-073 rejected:** D-073's tells were STRUCTURAL (frames at disagreeing angles, gear dissolving, cabling to nowhere, repeated speakers at wrong scales), because the generator invented the geometry. **Here the geometry is authored, and generation at most surfaces it: GOVERNED, where D-073's reason was UNGOVERNED output.** ⚠ **D-073's test stands regardless: if it SAYS "made with AI", it fails.**
- **Routes (Builder's framing, none chosen):** **A**, the room is real 3D in three.js (designed angles and distances, no camera solve, real light, a camera that can move); **B**, blockout → depth/line-conditioned generation → Resolve grade → plate, with the blockout as an EXACT depth proxy (one generation from the master; no chains); **C**, real 3D structure with generated surface textures only.
- **Photorealism: not required (Carl).** Builder's note: the cards are rendered, so a constructed room makes cards and room one world (§14a, *"caused by the world"*); today every card is a composite on a photograph.
- **Resolve:** Fusion (3D compositing, depth passes) and Color (grading, the plate's mastering). Not a modeller — the wireframe is code or Blender.
- **Proposed first step, route-independent:** a parametric three.js blockout on a `/proto` page (walls, floor, desks, four card slots, camera, practical lights), measured live against D-094's five criteria (≤ ~25° view angle, similar distances, calm backgrounds, justifying light sources, ~470 mm faces). **Not authorised.**
- **Carries over from the current room:** see D-094's room entry.
- ⛔ **CARL'S CLARIFICATION ON D-073, same session:** *"my comments were recorded months ago. AI image generation is much better now with GPT now leading Gemini. Also, with a blueprint and an elaborate prompt we stand a better chance of a good outcome today than 'models' ago."*
  - ⚠ **Framed per D-048: D-073 is OVERTAKEN, not wrong.** It judged one-shot generations from the models of its day. Carl changes BOTH inputs: the METHOD (blueprint plus elaborate prompt) and the MODELS.
  - ⚠ **Date, for accuracy:** D-073 is dated 3–4 September 2026, three weeks before this. Carl's point is that model generations turn over fast.
  - ⚠ **"GPT now leading Gemini" is Carl's assessment, not verified by the Builder.**
  - ⛔ **The test is unchanged and empirical:** generate FROM THE BLUEPRINT, then check against D-073's tells (agreeing angles, resolving objects, cabling that goes somewhere, consistent scale) and *"does it say made with AI"*. ⚠ **A blueprint makes the geometry MEASURABLE against its source,** which a found photograph never was (D-076).
- ⚠ **EXTERNAL INFORMATION — GPT's answer to the information-only prompt** (`live-work/gpt-room-information-prompt-24-september.md`), pasted by Carl. **Information, not a decision.** Its core: ***"3D controls where things are. AI controls what they look like."*** Blockout = source of truth; two blueprints (technical and art-direction, same camera); a structured prompt (constraints kept apart from aesthetics); freeze the composition and then edit deterministically; designed calm fields behind each card; *"lighting variation in the room, lighting consistency on the cards"*; a validation pass projecting the card planes onto the result, **regenerating rather than moving cards to fit an AI mistake.**
  - ✔ **Consistent with the record:** D-095's governed framing; D-073's *"every generative round-trip is destructive"*; the CS field measurement; the light findings; the D-084 edge-fitting method and the `?guides=1` quads as the validation instrument.
  - ⛔ **Builder's caveats:**
    - (1) **It concedes the model will not hold the camera exactly, and the glass refracts a depth proxy.** Drift from the blueprint misaligns refraction, the D-076/D-084 problem. **A pass/fail tolerance must be set BEFORE generating** (card-zone corners and key edges within N px of the blueprint, measured the D-084 way).
    - (2) **It does not weigh routes A/C.** An exact blueprint rendered by us has exact geometry by construction. B costs alignment risk; A/C cost art time.
    - (3) **Using the current photograph as an atmosphere reference** may be a use D-071 did not cover. Check before doing it.
  - ⚠ **UNVERIFIED by the Builder:** the output limits (≤ 3840 px edge, multiples of 16, >2560×1440 experimental) and the licence/indemnity summary. Its citations did not survive the paste. **Check OpenAI's current documentation before relying on either;** a legal review is Carl's call.
- ⚠ **EXTERNAL INFORMATION — GEMINI's answer to the same brief**, pasted by Carl for comparison. **Information, not a decision.**
  - **Agrees with GPT:** the blockout is the authority and references are suggestions; neither model holds an exact camera or lens; edits must be local; keep generated content minimal where the tells live; commercial use is allowed, exclusivity is not guaranteed.
  - ⛔ **DIFFERS ON THE CONCLUSION:** *"relying on AI to generate the final composite plate is likely the wrong tool for the job… You should simply finish the 3D scene"*, with AI for textures and concept art only (**route C**). GPT recommends blueprint → image model → validate (**route B**). **Gemini's route removes the alignment caveat recorded above.**
  - **Other differences:**
    - geometry control needs Stable Diffusion + **ControlNet** (depth/edge), not a chat image model;
    - native resolution ~1536 px then upscale, where GPT claims up to 3840 px — ⛔ **they conflict, neither is verified, and upscaling is the generative round-trip D-073 forbids for a master**;
    - negatives backfire (GPT includes an avoid list): **model-dependent, test it**;
    - the US Copyright Office position that output without significant human authorship is not copyrightable **favours an authored 3D room for a studio selling craft.**
  - **Gemini's best specific idea:** SOLID FLAT BLOCKS in the blockout where the cards go, so calm backgrounds are a geometric fact, not a prompt request. Also a hybrid: generate only the shell and render desks and monitors ourselves.
  - ⚠ A small factual error in it: *"potted plants behind the lower cards"*. The plants are BESIDE them; floorboards and chair legs are behind.
  - **Builder's synthesis:** both lead to the same first step, the exact blueprint. The fork after it is **render it ourselves (Gemini; wins on alignment, light accuracy, ownership) vs AI renders from our blueprint (GPT; wins on richness per hour of art)**. ⚠ **A third option neither named: the room REAL-TIME in three.js** — the room's lights ARE the cards' lights (§14a by construction), and the camera can move (D-092's §1 fade, D-088's mark to §3); a showcase technique in itself. **Not decided.**
- ⚠ **CARL, on current tooling, same session:** *"When you ask GPT or Gemini to make an image now you can use styles or templates. Sonething that didnt exist a while back."* (Screenshots of both galleries.)
  - **Builder's reading: two kinds of preset.**
    - (1) **STYLE presets** for a new image ('80s, Cinematic, Moody, isometric Interior design, Blueprint poster, Cross-section): good for exploring a direction; ⚠ **a shared house look raises D-073's "says made with AI" risk.**
    - (2) **TRANSFORM presets on an uploaded image** (Gemini **Restyle**; GPT **Improve Your Desk Setup**, **Fix lighting**, **Enhance photos**): they keep the supplied structure and change its treatment — **GPT's route (B) without ControlNet.**
  - ⛔ **Proposed test, not authorised:** run a blockout's clay render through both transforms and MEASURE the drift of walls, desk edges and card zones against the blueprint. **That settles B vs render-it-ourselves with evidence.**
  - ⚠ Upload a blockout render or a sketch, **not the current photograph** (D-071 scope).
- ⛔ **CARL — THE INVENTORY AND NEGATIVE PROMPTS, same session:** *"The trick is to use negative prompts as well. What do we need? Desk, PC monitors and Walls. Thats it."* **The scene is MINIMAL: desks, monitors, walls.** Every omitted object is a tell that cannot occur, and the card backgrounds calm (CS's chair legs go).
  - ⚠ **Implied, and put to Carl to decide:**
    - (1) **floor and ceiling** — the floor cards stand on the floor, and the ceiling downlights are criterion 4, the cards' light source (§14a);
    - (2) **keyboard and mouse** — staged-looking without them vs more small-object risk with them;
    - (3) **cables** — say where they go ("monitor arms, cables routed out of sight through the desk") rather than negate them, or the monitors feed from nowhere (D-073's cabling tell, inverted).
  - **Draft negative list (Builder's, from the recorded tells):** plants, artwork, picture frames, shelves, speakers, rack equipment, visible cables, chairs, people, windows, lamps, decorative objects, text, logos, signage, clutter, reflections of people, curved or warped desk edges, duplicated monitors, extreme wide-angle distortion. ⚠ **Negative-prompt efficacy is model-dependent (GPT vs Gemini disagree); the drift test shows it.**
- ⛔ **CARL — THE PIPELINE, same session:** *"If we start off from a simple blueprint, basic geometry of a room. Placement of obects. Once an image is made ill get it in Resolve and get rid of the awful colour grade that screams 'made with AI'."*
  - **Order (Builder's, agreed in outline):** blueprint → generate → **measure the drift against the blueprint (accept or reject BEFORE grading)** → Resolve grade (Carl) → into three.js → re-tune the glass against the new plate.
  - ⚠ **The grade has a MEASURED target:** D-073's wall at **H 200–206°, S 32–43%, L 12–17%**, clear of `/start`'s interaction teal (H 186, S 66%, L 35%). The Builder can check the graded plate against it.
  - ⛔ **Protect the master (D-073):** the generator's full-resolution output straight into Resolve, lossless export (16-bit TIFF/PNG), NEVER upscale.
  - ⚠ **Grading fixes colour, not every tell:** texture tells (over-sharpened micro-detail, halos, plastic smoothness) need grain, softness or midtone work. **Structural tells are the blueprint's job.**
- ⛔ **CARL — THE CARD ARRANGEMENT IS OPEN, same session:** *"It doesnt have to be 2+2 cards. Everything is open. Cards can go anywhere in the scene."* ⚠ **The two-wall / two-floor layout (D-077's placement, D-082) is NOT carried into the blueprint as a given.** ⚠ The four copy blocks (CA/CB/CD/CS) are unchanged unless Carl says otherwise; **only where the cards sit is open.** The blueprint plan is authorised to be WRITTEN ("Yes"); Carl is gathering references first (*"Stand by, im trawling the internet"*).
- ⚠ **CARL PIVOTS, same session:** *"A blueprint may not be needed. Ive got 3 images, all are suitable. Any AI manipulation will be minimal. I will post them one by one for discussion."* **The found-image route (Carl's other first choice) is back in play;** the blueprint is on hold, not dropped. Each image is to be assessed against D-094's five criteria, D-073's tells and real-photograph standard, and D-079's licence requirement.
- **CANDIDATE IMAGE 1 of 3 — a 3D ARCHVIZ RENDER** (a cutaway room: marble slab edge, curved ceiling slab, a mural back wall, a live-edge table, a chrome chair, a blue cabinet, a black glass vitrine). **Carl's edits:** *"Wall colour change needed- mural gone. PC and chair to be added. Anything else, black box rectangle gone."*
  - ✔ **Geometry — the best seen:** a one-point perspective; the back wall is near square-on (estimated by eye from level horizontals and true verticals, **to be confirmed with the perspective tool per D-076**); every card on it sits at ONE distance, so one type size reads alike; ceiling downlights are visible (criterion 4).
  - ⚠ **Wall-washer pools** near the top of the back wall will sit behind the cards once the mural goes: to be judged.
  - ⛔ **THE BIG RISK: A BRIGHT, DAYLIT ROOM.** White extruded letters need a dark field (the CS problem, wall-wide). **Taking bright to dark is a RELIGHT, not a regrade;** a dark navy back wall alone may hold, the whole room less likely. The neon reads weak on light walls.
  - ⚠ **Framing:** the cutaway (slab edges, sky strip) is either a feature for a construction argument or a crop, and cropping costs resolution.
  - ⛔ **1920×1109 (~16:9), NOT 3:2; D-073 forbids upscaling, so a higher-resolution original is needed.** **Licence unknown (D-079).** **Authorship:** a human CG render, not a generated image and not a photograph; whether it meets D-073's "real photograph" is Carl's call (it arguably fits D-095's "constructed").
  - ⚠ **The added PC is the most exposed generated object** (stands, cables): keep it simple or render it ourselves.
- **CANDIDATE 1 — SOURCE AND LICENCE, VERIFIED:** Pixabay #6804137, *"Office Home Interior Design"* by **ST4N**, https://pixabay.com/photos/office-home-office-interior-design-6804137/ .
  - ✔ **Uploaded 18 November 2021, no AI label.** The date predates public image generators (2022), so it is almost certainly a human CG render (**the Builder's inference**).
  - ✔ **Original 4500 × 2599** (fetched from the page). A 3:2 crop at full height ≈ 3900 × 2600; cropped inside the cutaway ≈ 3150 wide. **No upscale needed.**
  - ✔ **Pixabay Content License** (the summary page, fetched 24 September 2026): commercial use; *"Modify or adapt Content into new works"*; no attribution required. **Prohibitions:** standalone sale or distribution; trademarked content for goods and services; merchandise; immoral or illegal use; ***misleading or deceptive use***; trademark registration; the user checks third-party IP.
  - ⚠ **Consequences:**
    - removing the mural also removes a THIRD-PARTY IP question (it is a landscape photograph inside the render);
    - ⚠ **"misleading use": the room must not be presented as C2B's actual premises** (D-071's §10a line);
    - ⚠ **not exclusive: 3,055 downloads**, mitigated by heavy modification.
  - **Carl's first grade** (a global cool shift) measured: wall H 218°, S 33% (on target) but **L 63% vs the 12–17% target**, and the floor lost its warmth (H 18° → 252°). **The deciding test is still open: a WALLS-ONLY pull to dark navy, floor kept warm.**
- ✔ **Carl has downloaded candidate 1 at its original 4500 × 2599** (the master).
- **CANDIDATE IMAGE 2 of 3 — a CG render of a red-LED gaming room** (preview 1920 × 1279, **exactly 3:2**; source and licence not yet known).
  - ✔ **The best CONCEPT seen:** four equal white CABINET DOORS in a row above the desk, near square-on (estimated <~15° by eye) and at one distance — **card positions built into the room.** ✔ **Already DARK**, lit by LED strips (the neon's family; §14a). Red → navy/teal is a HUE ROTATION that keeps the light's form, far easier than relighting image 1.
  - ⛔ **Against it:**
    - **pervasive TRADEMARKS** (PS5 and its logo, Pokémon figures, Minecraft and Mario blocks, Spider-Man, Steam, Call of Duty), which Pixabay's licence prohibits for commercial use: **many detailed removals**;
    - **clutter** far beyond Carl's inventory (gaming chair in front of the desk, sofa, TV, controllers, PC tower, headphones, shelves);
    - **the wrong register** (a gamer's den against D-094's business-owner audience);
    - busy acoustic foam behind the monitors (the CS problem).
  - **Builder's net: image 1 is the stronger BASE; image 2 is a LIGHTING DIRECTION for it** (dark, lit by its own practical sources).
- ⚠ **CARL, on candidate 2:** *"the main task would be removal which AI is better at because it has context."* **Accepted in part; the Builder's "many removals" objection is REVISED.** Context-aware fill handles small objects on simple surfaces well (figures, blocks, PS5, logo; the screens are REPLACED with our content).
  - ⛔ **The deciding variable is what sits BEHIND a removal:** simple visible surfaces (low risk); the sofa, TV and controllers at the front edge (moderate); **the gaming chair, which hides desk underside, floor, cabinet and foam = invented hidden geometry (HIGH, D-073's "dissolving equipment" tell).**
  - ⚠ **Cautions:** masked edits are not pixel-exact and round-trips accumulate (D-073), so use FEW passes, at FULL resolution, with the outside-mask drift measured. **Removal does not change the room's character** (LED strips, foam, chair shapes); whether it reads studio or den is Carl's eye after the pass.
  - **Revised net: candidate 2 is a real contender IF THE CHAIR COMES OUT CLEANLY** — its deciding test, as the walls-only pull is image 1's.
- **CARL'S EDITS FOR CANDIDATE 2:** *"remove foam and replace with the wall its placed against. For the playstation, copy the PC tower on the right side."*
  - **Foam → wall:** ✔ removes the busiest background. ⚠ **Brief it to KEEP the LED gradient** from the strips above and below; a flat, evenly lit wall would contradict the strips and read as a paste-over.
  - **PS5 → a copy of the PC tower:** ⛔ **"repeated objects at the wrong scale" is one of D-073's four tells.** A straight copy is wrong in perspective (the left spot is seen from front-right, nearer, larger) and identical in detail. **Safer brief: GENERATE a matching tower in place, consistent with the room's perspective and lighting.** ⚠ **Alternative put to Carl:** remove the PS5 and leave the desk clear (Carl's inventory; fewer tells; less gaming register). **Carl's call.**
- ✔ **Carl has downloaded candidate 2's original.**
- **CANDIDATE IMAGE 3 of 3 — a CG render (game-engine look) of an orange-LED room:** a large wall-set TV on a frontal back wall above a long credenza, a run of upper cabinet doors, LED light lines wrapping the corner, a desk with twin monitors to the right, and a chair mid-floor. Preview 1920 × 1080 (16:9); source and licence not yet known. Carl: *"Guess why i chose image 3."*
  - **Builder's guess:** (1) **the TV** — a large dark square-on rectangle, both a card-quality field and **D-088's §3 "player"** (Carl: *"How would it get in the TV?"*); (2) **the LED strips are light LINES, the neon's own form** — §14a's *"recurring theme with variations"* and *"caused by the world"* built into the room.
  - ✔ **Also:** already dark (a hue rotation, not a relight); a frontal back wall at one distance; the chair occludes less than candidate 2's.
  - ⛔ **Costs:** trademarks (a Deadpool figure, Mario/Luigi, a PS5, an Xbox controller, anime on the screens, book spines), small removals on simple surfaces; dense shelving and cubbies; a bright, receding right wall (no cards); **16:9, a 3:2 crop at full height ≈ 1620 wide from the preview, so the original's size and source are needed.**
- ⛔ **CARL'S LAYOUT FOR CANDIDATE 3:** *"crop image on the left, lose the clutter. Delete TV and shelving in the corner. Chair closer to desk. pc tower under desk. 2 cards on the wall facing, one elongated one above and same on the floor."*
  - **Read as FOUR cards:** two side by side on the back wall where the TV was, one ELONGATED above them, one ELONGATED freestanding on the floor. **The reading is put to Carl for confirmation.**
  - **The Builder's annotated brief:** `live-work/screenshots/candidate3-layout-brief-full.png` and `…-crop-3x2.png`. The crop is at x = 300 (3:2 = 1620 × 1080 from the preview); the card outlines follow the wall's perspective from two guides read off the image (the LED strip's lower edge and the credenza top). **Placement is approximate, not solved.**
  - ⚠ **Not in Carl's list but inside the card zones:** the two tall speakers, the headset stand, the white box and the console on the credenza, all in front of the wall cards' lower edges. Presumably covered by *"lose the clutter"*; **confirm.**
- ✔ **ALL THREE ORIGINALS ARE IN `brand-assets/`, verified against their Pixabay pages (fetched 24 September 2026):**
  - **Candidate 1:** `st4n-office-6804137.jpg`, **4500 × 2599**, ST4N, uploaded 18 November 2021.
  - **Candidate 2:** `setupx3d-interior-design-8922413.jpg`, **3840 × 2560 (exactly 3:2)**, *"Interior Design Home Office Modern"*, Setupx3D, **26 July 2024**.
  - **Candidate 3:** `setupx3d-interior-design-7413418.jpg`, **4000 × 2250 (16:9)**, *"Interior Design Home Office Desk"*, Setupx3D, **28 August 2022**.
  - **All three:** Pixabay Content License, no AI label; the file sizes match each page's stated maximum.
  - ⚠ **Provenance strength differs:** candidate 1's 2021 date makes "human-made" near-certain; for candidates 2 and 3, "not AI" rests on **the absent label and the creator's 3D-render name** — reasonable, weaker.
  - ✔ **Candidate 3's crop at full resolution:** x = 625 → **3375 × 2250** at 3:2 (the brief's x = 300 of 1920 scales exactly), ~30% above the 2560 served now. **No upscale.**
  - ⛔ **These are MASTERS (D-073): edit copies, never these files.**
- **RENAMED on Carl's instruction** (*"Rename them office image 1, 2 and 3"*), kebab-case like the other assets. **The provenance lives HERE, not in the filenames:**
  - `brand-assets/office-image-1.jpg` ← `st4n-office-6804137.jpg` (Pixabay #6804137, ST4N)
  - `brand-assets/office-image-2.jpg` ← `setupx3d-interior-design-8922413.jpg` (Pixabay #8922413, Setupx3D)
  - `brand-assets/office-image-3.jpg` ← `setupx3d-interior-design-7413418.jpg` (Pixabay #7413418, Setupx3D)
  - ⚠ The entries above use the old names; this mapping resolves them. **Untracked in git; commit them to keep the masters.**
- ⛔⛔ **CHOSEN — CANDIDATE 3 (`office-image-3.jpg`), Carl, 24 September 2026 (session 2).** The Builder chose it independently before Carl revealed his pick; Carl: *"Welcome to the choir!"* **The reasons both hold** (Builder's): already dark (a hue rotation, not a relight); LED light LINES are the neon's form (§14a); a frontal back wall at one distance holding Carl's four cards; mostly low-risk removals (the chair MOVES into open floor rather than being removed); the 3:2 crop at full height gives 3375 × 2250, no upscale. **Watch:** whether the hue rotation still reads as light; a bright, steep right wall (no cards there); the moved chair and tower (repetition and perspective tells).
- ⛔ **CARL — WHAT MAY CHANGE, WHAT MAY NOT:** *"The Rim colours can change, as the text colours and size to fit in with the new image. The concept remains the same."* **Rim colours (D-093), text colour and size (D-094) are OPEN to fit the room; the CONCEPT is fixed:** glass cards, extruded text in pages, neon rims, the room's light as the cards' light.
  - ⚠ **OPEN, put to Carl: WARM or COOL.** Keep the room's orange and let the rims go amber or gold (least editing; kin to the gold mark, D-063; but the navy/teal palette and D-073's wall target stop applying to this section), OR rotate the room to navy/teal (keeps the palette and D-073's target; carries the hue-rotation risk).
- ⛔ **RULED — THE ROOM STAYS ORANGE/AMBER.** Carl: *"Yes, the room can stay orange/amber. For the rims we shall see what works."* **No hue rotation.** ⚠ **D-073's teal wall target and the navy/teal pair colours (D-093) do NOT carry to this room;** rim colour is judged on screen against it.
- ⛔ **CARL, on the perspective:** *"To match the perspective there are plenty of straight lines to use as references and the angles are 'kinder'. Go look to the files to find out how the perspective was worked out and give me your assessment."* **The Builder's assessment, from `camera-solve-11-september.md`, D-076, D-084 and `placeWallCard`:**
  - **The method transfers:** Carl pins, not the Builder's eye (D-076); two perpendicular vanishing points give f; one feature held out as a falsification test; back-projection for wall cards; the ground plane plus hand rails for floor cards; an NDC-unprojected depth proxy (D-084).
  - ✔ **Easier here:**
    - a CG render is likely a true pinhole (no distortion; the principal point at the ORIGINAL frame's centre);
    - far better features: long bright LED strips, cabinet-door gaps, credenza and drawer edges, the desk (the old solve fought wood grain);
    - the right-wall strip gives a well-conditioned vanishing point.
  - ⛔ **NEW TRAP 1 — THE CROP MOVES THE PRINCIPAL POINT.** Cropping x = 625 puts the original centre (x 2000) at x 1375 of the 3375-wide crop, not 1687. **SOLVE ON THE UNCROPPED ORIGINAL; apply the crop as an off-centre view (three's view offset).** Solving on the crop gives a wrong camera that passes a casual look — the scale trap's twin.
  - ⛔ **NEW TRAP 2 — "KINDER" ANGLES ARE WORSE-CONDITIONED FOR THE SOLVE.** A near-frontal back wall's vanishing point is far off-frame, so small slope errors move it, and f, a long way. **Solve mainly from the RIGHT wall, use MANY back-wall lines together, and MEASURE whether the verticals converge.** A renderer's lens shift would move the principal point vertically; **that is the first measurement.**
  - ⛔ **SOLVE AND VERIFY ON THE UNEDITED MASTER.** The AI edits are not geometry-exact; the edited plate is checked against the master's camera (the drift test) BEFORE grading.
- ⛔ **CARL — NO CROP; MINIMAL REMOVAL; THE TV BECOMES A CARD:** *"So it might be better not to crop and just remove the deadpool. The trinkets can stay as ornamentation, to give the room some character. one wall card can be the dimensions of the TV. A left wall card. Measure the space on the right and make sure it can fit."*
  - ✔ **No crop removes trap 1** (the principal point stays at the frame centre). ⚠ **The plate is 16:9, not 3:2**, so the canvas frame (`aspect-[3/2]`, `PLATE_W/H`) changes; placement is re-derived anyway.
  - ✔ **MEASURED — THE RIGHT CARD FITS** (full-resolution master; scripts in `live-work/scripts/wallfit*.mjs`; overlay `live-work/screenshots/office-image-3-right-card-fit.png`).
    - Method: lines fitted to the back wall's horizontals (LED strip rms 0.34 px; shelf top 0.45; shelf strip 0.28; TV top 2.52 and bottom 1.96, looser); their least-squares vanishing point; the wall position along the TV's bottom line by 1-D projective mapping. **Needs NO TV aspect assumption.**
    - **Free wall between the TV's right edge and the corner = ~1.41 TV widths** (range 1.20–1.48 across line subsets; the TV-only pair is the worst-conditioned).
    - **A TV-sized right card fits with ~0.20 TV widths of gap each side**, top and bottom level with the TV. It renders ~450 px tall at its far edge vs the TV's 513: true perspective.
    - The fitted horizon (y ≈ 1291 of 2250) sits just under the TV's bottom edge.
    - **Obstacles:** the corner shelving (behind most of it — delete); the right speaker's top (lower-left clip); the PC tower's top (lower-right clip — moving under the desk); the white box and headset stand are clear.
    - ⚠ **By D-076, this is a FEASIBILITY measurement by the Builder, not placement.** Final corners are Carl's pins, checked against an independent feature.
  - ⚠ **Trinkets vs the licence** (Pixabay: no recognisable trademarks/brands in commercial use):
    - fine: masks, vases, the molecule model, the clock, plants, books;
    - **must go:** Deadpool (Carl); the Mario/Luigi figures (on the corner shelving, so they leave with it); **the consoles** (white PS5, the PS4 under the credenza, the Xbox and controllers on it — recognisable products without a visible logo);
    - the monitors' anime is replaced with our content;
    - **check book spines and the PC tower for logos at full resolution before editing.**
- ⛔ **CARL — WHICH CARD IS WHICH:** *"These cards are CA on the left and CB on the right."* **CA = the TV-sized card on the back wall's left (in the TV's place); CB = the same-sized card to its right, before the corner.** Reading order stays left to right, CA → CB (D-077).
  - ⚠ **Consequences for the text (D-094), to re-derive once the room is solved:** the cards take the TV's proportions (roughly 16:9 if it is a standard screen, **UNMEASURED**) instead of today's CA/CB faces (1220 × 477 / 1092 × 443 mm), so **more lines per page and more grace at the same type size**. CB carries the most words (84) on a card that renders slightly smaller (the wall recedes), mild but real. Both sit near square-on, so the depth rule likely lets both carry more depth than CB's 1.5 mm; **measure the view angles after the camera solve.**
- ⛔ **CARL — THE ABOVE CARD:** *"between these cards total combined width and the space in between there will be a centre point. That should be the centre point of the Above elongated card, a rectangle. The height should be the height of those squares. We will see what the area of the wall cards are and make the above card the same."* **Read as:** centred on the CA + gap + CB span; height = the UPPER CABINET DOORS; area = one wall card's.
  - ✔ **MEASURED** (`live-work/scripts/abovecard.mjs`; overlay `live-work/screenshots/office-image-3-above-card.png`):
    - the span's centre is **1.102 TV widths** from CA's left edge (image x 1652 of 4000);
    - door height there is **0.564 × the wall cards' height** (door bottom edge rms 1.38 px; ⚠ door TOP edge soft, rms 6.38 px → ~±2% on the height);
    - **equal area → width 1.773 TV widths**, spanning **0.215–1.988** (inside CA's left edge and CB's right edge, well inside the cabinet run; corner at 2.407);
    - ~3.1× the wall cards' elongation (≈ 5.6 : 1 IF the TV is 16:9, unmeasured). **Robust:** width 1.773–1.775 across the gap uncertainty.
  - ⚠ **Put to Carl:**
    - (1) **wall-centred reads slightly LEFT of centre on screen** (the receding wall gives its left half more pixels); screen-centring is a deliberate alternative, his call;
    - (2) **the cabinet fronts stand proud of the wall**, so pixel heights overstate the doors slightly vs the wall plane, and the true equal-area width is a little WIDER; the solved camera settles it.
- ⛔ **CARL — BALANCE BETWEEN THE ABOVE AND FLOOR CARDS:** *"if the squares are cabinet doors and above and below they have their own 'rim' measure this height… If the floor card is to sit in front of the draws at the bottom measure how far up it would go if these above and floor cards were the same height. Also measure the height of the 2 draws… If this is close to the height of the above card- the floor card can float/hover. im looking for balance here."*
  - **MEASURED at the centre line** (x 1652 of 4000; `live-work/scripts/profile.mjs`, `balance.mjs`; overlay `live-work/screenshots/office-image-3-balance.png`):
    - band top incl. the upper rim y ≈ 211 (soft, ±6); door bottoms 499; the lower rim (the perforated fascia) to the LED strip's upper edge ≈ 585;
    - counter edge / top of drawer 1 ≈ 1547–1550; the drawer gap ≈ 1690–1698; bottom of drawer 2: 1833; kick recess then plinth to the floor ≈ 1960 (±8).
  - **Heights:**

    | | px | vs band |
    |---|---|---|
    | band incl. rims | **374** | 1.00 |
    | doors only | 288 | 0.77 |
    | **two drawers stacked** | **283** | 0.76 |

  - **Two balanced options, put to Carl:**
    - **A** — the above card = band WITH rims (374) → a floor card of equal height STANDS on the floor and its top lands ≈ 36 px under the counter edge, filling the credenza front floor-to-counter; equal area → above-card width ≈ **1.37 TV widths**;
    - **B** — the above card = DOORS ONLY (288) → the drawer stack (283) matches within **2%**, so the floor card HOVERS in front of the drawers as an exact mirror; equal area → **1.77 TV widths**.
    - ⚠ **The drawer stack is NOT close to the band with rims** (24% short), so the hover works only with B.
  - ⚠ **Accuracy:** the cabinet fronts and the credenza front sit at different depths (~±4% on cross-plane comparison), plus the soft top edge (~2%). Neither closes the 24% gap nor breaks the 2% match. The solved camera firms it.
- ⛔ **CARL — SYMMETRY AND THE CHAIR:** *"if we can get the chair closer to the desk theres real estate behind for the card. if its tight we can move the floor card left and the above card right a little. Thats why i asked about a centre line- to achieve balance and symmetry."*
  - ✔ **The principle, stated:** equal and opposite shifts along the wall keep the PAIR's combined centre on the CA + gap + CB centre line (a seesaw), so balance holds when neither card is individually centred.
  - **MEASURED against the chair as it stands** (chair from image x ≈ 2020 at credenza height; wall-plane mapping as before):
    - **A** (1.37 wide): floor card x 1035–2182 → shift needed ≈ **0.25 TV widths**; the above card then ends at 2.03, clear of the corner (2.407) ✔;
    - **B** (1.77 wide): floor card x 834–2324 → shift needed ≈ **0.45**; the above card would end at 2.43, **PAST THE CORNER** ✘.
    - **Moving the chair to the desk frees both.** ⛔ **With B the chair MUST move; A tolerates the symmetric shift.**
  - ⚠ **Edit risk:** behind the chair is the credenza's right cubby with a book stack (some spines look branded) → the move requires hidden-geometry fill (moderate). **Suggest clearing the books too**, which simplifies the fill and the licence question.
- ⛔ **CARL — THE FLOOR CARD STOPS AT THE CUBBY LINE; THE CHAIR STAYS:** *"the chair might not have to move yet, the card rim can stop at this point, the vertical line here at the entrance to the cubby hole."*
  - **MEASURED:** the cubby's right inner wall ends at **x ≈ 2110 of 4000 (±15)**; the chair frame starts ≈ 2135, so **~25 px of clearance**. Along the wall that line is **1.688 TV widths**.
  - **Seesaw applied** (`live-work/scripts/layouts.mjs`; overlays `live-work/screenshots/office-image-3-layout-A.png`, `…-layout-B.png`):
    - **A:** shift 0.099 → floor 0.318–1.688, above 0.516–1.886 (corner 2.407, comfortable);
    - **B:** shift 0.301 → floor −0.085–1.688 (starts just left of CA's left edge, still in front of the credenza), above 0.516–2.289 (0.12 from the corner, tight but clear).
    - ✔ **BOTH FIT WITH THE CHAIR UNMOVED.**
  - ⚠ **The floor card now fronts the cubby opening:** the books would sit behind frosted glass (the CS busy-background problem). **Clearing the books solves that and the branded-spine question.**
  - **Open, Carl's eye: A (compact, floor-to-counter) or B (wide, hovering).**
- **CARL: *"for the new wall card size, the TV, are any of the old cards comparable in size?"*** — **NO.**
  - **Scale estimate:** the desk top's back edge meets the wall at the room corner. **ASSUMING a standard 750 mm desk** (`DESK_HEIGHT_MM`), it spans ≈ 395 px there vs the TV lines' 486 px at the same x → **TV ≈ 920 mm tall × 1640 mm wide (~75")**, at 16:9 (the pixel aspect ≈ 1.77, consistent). ⚠ **An estimate, ±~5%, resting on the desk-height assumption; the solved camera confirms it.**
  - **Vs the old outer sizes:** CA 1303 × 560 (2.33:1, **0.48×** the new area); CB 1169 × 520 (0.40×); CD 823 × 406 (0.22×); CS 794 × 392 (0.21×). **The new wall card is ~2× CA's area and TALLER in shape** (16:9 vs 2.0–2.3:1).
  - ⚠ **Consequence for D-094's text:**
    - at 52 mm the face holds ~10 lines per page (CA today: 6) and is wider, so **CA's 64 words, and likely CB's 84, fit on ONE page** and the page model goes idle;
    - ⛔ **but 52 mm was set for the OLD camera distance. Re-derive the type size from ON-SCREEN em in the new room** (the old wall cards ≈ 12–14 px/em) after the camera solve. A larger size brings pages back naturally.
- ⛔ **POINTER — HOW THE CARD FAMILY IS BUILT (Carl: *"go look how it was done and how they were built and at least make a note to point yourself at this info"*):**
  - **The blueprint:** `cardDims(heightMm, aspect)` in `components/about/about-card-geometry.ts`. **Every dimension is a FRACTION OF CARD HEIGHT:** `CORNER_RADIUS_RATIO` 0.12, `RIM_BEAD_RATIO` 0.022 (the rim takes 2 × bead per side), `BEVEL_WIDTH_RATIO` 0.03, `FACE_PROUD_RATIO` 0.018, face inset = 2·bead + bevel.
  - **The crown:** `TENT_POLE_RATIO` 0.073 × height (Carl's, by eye, on the bench), shaped by the quartic `faceDome` = (1−u²)(1−v²) in `about-card-mesh.tsx`; the text sits on the same formula (`faceBaseZ`). **A ratio holds the curvature's ANGLE across sizes.**
  - ⛔ **TRAP:** `cardDims().crownMm` still uses the SUPERSEDED `CROWN_RATIO` (0.0901); the canvas passes `heightMm × TENT_POLE_RATIO` itself (`placeWallCard`, the floor placement). **Use the canvas route.**
  - **The bench:** `/proto/card` (`components/about/card-bench.tsx`) — one card (CD) proven in face-on AND oblique views (oblique = acceptance) under a SWEEPABLE light; dials `?crown= ?h= ?aspect= ?light=`; **tilt read from BUILT NORMALS, never the formula.**
  - **Scale:** millimetres, anchored on an ASSUMED 750 mm desk (`DESK_HEIGHT_MM`); a wrong anchor scales everything together.
  - **Per-card glass:** `about-card-glass.ts` (D-089's 0.86 / 0.95 were tuned against the OLD backgrounds; re-tune for the new room).
  - ⚠ **Open for the new room:** heights would span ~920 mm (CA/CB) to ~520 mm (option B's elongated cards) IN ONE VIEW, against 392–560 mm before. The trim is a fraction of HEIGHT, so the small card's rim and corners are ~57% of CA's. **Whether one family still reads at that spread is Carl's eye, on the bench, BEFORE the room.**
- ⛔ **CARL — NOT EVERYTHING IS REMOVED; ONE PROMPT:** *"im not sure we have to delete everything youve mentioned. Everything is a product right? i can see a case for deadpool and mario, possibly the games console but we need to give just one prompt for removal."* **Accepted: the test is RECOGNISABLE brand, not "a product".** The list is re-tiered:
  - **MUST (layout):** the TV (CA replaces it); the corner shelving AND its contents (CB's wall; takes Mario/Luigi with it).
  - **SHOULD (licence):** Deadpool; the consoles (PS5, the PS4 under the credenza, the Xbox and controllers) — recognisable characters and distinctive product designs.
  - **OPTIONAL (technical, not licence):** the two tall speakers. **WebGL draws the cards OVER the plate, so a plate object standing IN FRONT of a card renders BEHIND it** (the right speaker clips CB). Keeping them needs an occlusion matte. **Carl's call.**
  - **KEEP:** books, masks, vases, the clock, headphones, the PC tower, the chair, the desk kit. **The monitors' anime is replaced in a separate step,** not in the removal prompt.
  - **The single prompt:** `live-work/office-image-3-removal-prompt.md`. ⛔ **Edit a COPY; check the output size (no downscale accepted, no upscale).**
- ✔ **A TEST RUN of the removal prompt, in Gemini and GPT** (Carl: *"this was just a test. i think it will work with a one shot."*). Both removed the listed items and kept the room's structure and light.
  - ⚠ **The Builder had omitted Carl's PC-tower move** (under the desk); it is now line 8 of `live-work/office-image-3-removal-prompt.md`, and the keep-list names the white box and headphones explicitly.
  - **Observed by eye, not measured:** Gemini also changed things NOT asked for (the white box went, the cubbies were re-rendered as lit boxes, the monitors changed); GPT stayed closer to the original but cleared the cubby books. ⚠ **Both previews looked smaller than the 4000 × 2250 master — check the real output's size before accepting it (D-073: no upscale).**
- ⛔ **THE TEST, COMPARED ON THE CUBBIES (Carl: *"have you noticed something about the cubby holes?"*):**
  - **Gemini's cubby interiors went NEUTRAL GREY-WHITE,** lit by light that does not exist in the room: they read as pasted-in boxes, **the room's light stops at the openings — the OPPOSITE of §14a's "caused by the world", and a generation tell.** GPT's cubbies keep the room's warm light.
  - **Also seen:** the credenza's rhythm (drawers / cubby / drawers / cubby), with the two cubbies roughly under CA and CB and the right cubby at the floor card's cubby line.
  - ⛔ **MEASURED OUTPUT SIZES: Gemini 1024 × 576, GPT 1672 × 941, vs the master's 4000 × 2250.** Neither is usable as a master; no upscale (D-073). **The real run must return full resolution** (an API or high-resolution mode, not the chat window; GPT's claimed 3840 px limit is UNVERIFIED).
  - **On this evidence GPT is the stronger editor for this image** (truer light, fewer uninvited changes). **Resolution is the problem to solve.**
- ⛔ **RULED — GPT IS THE EDITOR; A NEW PROMPT; THE CUBBIES ARE NOT TOUCHED.** Carl: *"GPT is the stronger editor. Thats what we will use but we will craft a new prompt for it - the cubby holes dont need to be touched, the card will be in the way, whatever is behind it will be blurred."*
  - The prompt is `live-work/office-image-3-removal-prompt.md` (the earlier draft is superseded): TV, corner shelving and contents, Deadpool, the white console, the console and controllers on the cabinet top, the speakers (**optional, Carl's call**), and **the PC tower MOVED under the desk**. Explicit keep-list incl. the cubbies and their contents.
  - ✔ **The frost removes the cubby contents' SHAPE, and with it their recognisability** (the licence concern for the PS4 and the book covers).
  - ⚠ **It does NOT remove BRIGHTNESS:** the PS4's cyan light bar and the red covers will show as soft glows behind the floor card's text (the CS rule: the brightest patch sets legibility). **Judge through the glass; a targeted fix later if needed.**
  - ⛔ **Resolution is still the gate:** the test returned 1672 × 941; the prompt asks for 4000 × 2250, and the output must be checked.
- ⚠ **ChatGPT's image editor, examined (Carl's screenshot):** tools *Markup, Comment, Remove BG, Erase, Resize*.
  - ⛔ **"Resize" is NOT a resolution control:** *"Generate this image with a different aspect ratio"* (1:1, 3:4, 9:16, 4:3, 16:9) — a FULL REGENERATION (a round trip, drift) at the chat window's own resolution. **Nothing on that screen sets pixel size.**
  - ✔ **"Erase" is a LOCAL masked edit** — the right kind of tool.
  - **Builder's proposed route to full resolution: PATCH THE MASTER IN PLACE.** Nearly every removal sits over PLAIN surfaces (wall, cabinet top, shelf), so an in-place fill on the 4000 × 2250 original (e.g. Photoshop Generative Fill or another in-place inpainting tool) regenerates ONLY the selected regions; **every other pixel stays the master's** (no downscale, no drift, D-073-clean). The PC-tower move is the one true generation, and it is a small patch. **Tool availability is Carl's to confirm.**
  - ⚠ **The shown GPT result removed the TV, shelving, speakers and consoles cleanly, with the light holding, but the PC tower is STILL ON THE DESK** (if it was the new prompt, GPT skipped the move), another reason to do the move as its own patch.
- ⛔ **CHATGPT'S ERASE DOES NOT WORK** — Carl tried the brush-erase in both the web chat and the desktop app; it failed in both. **GPT's editor is OUT for the master.**
  - **Builder's route: edit the 4000 × 2250 original IN PLACE with a tool that works on the full file.**
    - **Photopea** (free, browser; already trusted in D-073): Content-Aware Fill / Remove tool — fills from the surrounding pixels at full resolution; every unselected pixel stays the master's. Plain walls with a smooth light gradient suit it; ⚠ watch the LED glow's continuity across a fill.
    - **DaVinci Resolve** (Carl has it): the Patch Replacer ResolveFX; Object Removal in Studio if available — full resolution, in the same tool as the grade.
  - **The PC tower:** neither tool MOVES objects. Either copy it as a layer from the same image and relight it by hand, or **REMOVE it** — its move existed only to clear CB's lower-right corner, which removal also achieves with one fewer invented object. **Builder's suggestion: Photopea for the removals, remove the tower. Carl's call.**
  - **Acceptance:** the Builder measures the result's size (must be 4000 × 2250) and the PIXEL IDENTITY of the unedited regions against the master.
- ⛔ **RULED — THE PC TOWER STAYS, MOVED UNDER THE DESK.** Carl: *"the tower should stay but moved- how do the monitors work? they are clearly not an AIO."* ⚠ **The Builder's suggestion to remove it is WITHDRAWN:** monitors with no computer are a world-logic tell (D-073's "cables going nowhere" family; §14a).
  - **Method — COPY-MOVE, no generation** (Photopea, on the full-resolution master): copy the tower to a layer → Content-Aware Fill its old spot (desk top and lit wall) → move the layer DOWN to the floor under the desk, against the right wall near the corner. **At the same depth there is NO scaling;** a forward move needs a slight enlargement. Darken the case body to the under-desk shade, keep the self-lit RGB rings bright, add a soft floor contact shadow.
  - The Builder offers a scale check against the room's floor and wall lines once it is placed.
- ⚠ **CARL: *"If less is being removed we should be able to one shot it in GPT."*** The Builder's answer: **the removal COUNT was never the obstacle.** Two things are, and neither changes with a shorter list:
  - (1) **Resolution:** 1672 × 941 against ≈ 1920 device px needed on Carl's screen (the section ~1412 CSS × DPR 1.36, so ~87%) and ≥ 2560 on large or Retina displays (~65%), with no upscale (D-073);
  - (2) **a FULL REDRAW:** every pixel is regenerated, so the camera must be solved on GPT's image and all measurements so far re-derived on it.
  - **A knowing trade, Carl's:** GPT one-shot = fastest, ~1672 px, a fresh measurement pass; Photopea = full resolution and the master's own pixels, removals by hand. **Proposed decider:** run the one-shot; the Builder measures its size and how much of the unedited room was redrawn; Carl judges the softness at his screen size.
- **CARL — A SHORT GPT ONE-SHOT, THE TOWER TO THE FLOOR CORNER:** *"Give it a shorter removal list and it already knows what the tower looks like… just put it in the corner where the 2 skirtings meet. Some of it will be hidden by the chair anyway."*
  - ⚠ **MEASURED:** the skirtings meet at ≈ (2611, 1806), **under the small drawer unit hanging beneath the desk** (underside y ≈ 1744; ~62 px of clearance vs a ~265 px tower). **The corner itself cannot take it.**
  - **Options:** right of the hanging unit against the right wall (fits, lit by the under-desk glow, NOT chair-hidden), or in front of the unit at the corner (partly chair-hidden, blocks the drawer). **Carl's call.**
  - The short prompt is appended to `live-work/office-image-3-removal-prompt.md`.
- **CARL — THE TOWER, THREE SOLUTIONS:** *"1. Put it flush against the drawer and remove the handle. 2. turn it 90 deg 3. the other side of the desk. Theres always a solution."*
  - **Measured for (1):** the tower rises to y ≈ 1541, covering almost all of the hanging drawer front (y ≈ 1517–1744; the handle is behind it); partly chair-hidden; clear of CB and the floor card.
  - (2) the turn shows the glass side and ring fans: a practical light source in the corner (the LED-room idea); it combines with (1) or (3).
  - (3) is the simplest for the generator: open, lit floor, not chair-hidden.
  - **Builder's recommendation: (1), optionally with (2).** Revised line 6 appended to `live-work/office-image-3-removal-prompt.md`. Carl's choice.
- ⛔ **CARL — THE LOGO (D-088) IN THE NEW ROOM:** *"On the Logo, the concept will remain, the execution will differ. i will let you know when the time is right."* **D-088's CONCEPT stands** (the mark lives in §2's room and travels into §3's player); **its execution is re-planned for the new room** (the desk and TV it assumed have changed). Carl has a placement in mind. ⛔ **Timing is Carl's: do not raise or plan it until he does.**
