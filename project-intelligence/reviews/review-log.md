# Review Log

All visual QA, component, and sprint reviews are logged here in reverse-chronological order.

Reviews are observational. They surface findings and recommendations. They do not override architecture or design-system decisions. See `context-rules.md` Rule 6.

---

## Schema

```
ID:               R-###
Date:             YYYY-MM-DD
Reviewer:         Agent name or Human
Subject:          What was reviewed
Findings:         Observations — factual, not editorial
Flags:            Issues requiring attention (severity: Low / Medium / High / Critical)
Recommendations:  Optional — must route through ChatGPT before actioning
Status:           Open | Actioned | Dismissed
```

---

## R-016 — Next Step Button: Q5 Position-Aware Warm Environmental Reflection

**Date:** 2026-06-16  
**Reviewer:** Human Founder  
**Subject:** Q5-only selected-card amber reflection on `.enquiry-nextstep-btn`, idle and hover

**Findings:**
- Selected Q5 answer cards act as warm environmental light sources; the blue-platinum button catches a faint, directional amber reflection from them.
- Reflection is position-aware: card position drives which curved zone warms (left cap, right cap, upper/lower quadrants, faint upper-centre for the distant card 2). Strength scales with card position and count.
- Geometry is stable between idle and hover — only the colour and intensity of reflected light change.
- Hover lighting rule enforced: hover must not introduce a new clean white light source. White remains a small platinum component; selected-card amber increasingly filters/tints it as more cards activate. Amber is the only channel that intensifies on hover (×1.35).
- Central lower belly stays shadowed — no broad amber wash under the text.
- Root cause of the persistent hover white streak identified and resolved: `rgba(calc(...))` per-channel arithmetic inside legacy comma-form `rgba()` was unreliable, silently falling back to white. Replaced with React-computed complete `rgba(...)` colour strings consumed via CSS variables.
- No-selected-card hover and non-Q5 questions retain normal blue-platinum behaviour (variables unset → white fallbacks).
- Scope: Q5 only. Not rolled out to Q4–Q1. No card styling, layout, timing, or JSX-structure changes beyond the wrapper `style` variables.

**Flags:** None.

**Status:** APPROVED — Q5 reflection prototype baseline. See D-031. Rollout to Q4–Q1 pending future brief.

---

## R-015 — Next Step Button: Face/Body Separation Sub-pass QA

**Date:** 2026-06-16  
**Reviewer:** Human Founder  
**Subject:** Face/body tonal separation sub-pass for `.enquiry-nextstep-btn` (blue-platinum direction)

**Findings:**
- Core diagnosis confirmed: the prior gradient had ~15 lightness-point delta between face and base — insufficient for a metallic read.
- Face gradient top stop lifted from `#2e4f78` (L≈32) to `#365d86` (L≈37). Gradient delta now ~20 points. Saturation held controlled (~38%) to avoid vivid polished-blue read.
- Key specular peak raised from 0.32 to 0.38 idle / 0.38 to 0.44 hover. Reinforces the lifted face plane.
- Hover top stop `#2a4870` → `#2f5378`. Proportionally consistent.
- Result: upper face clearly separated from lower body. Cooler and more polished without becoming loud or vivid. Blue-platinum direction established.
- Both "Next step" and "Send" inherit through the shared class. No JSX changed.

**Flags:** None.

**Status:** APPROVED — face/body separation sub-pass complete. See D-030 (updated). Sub-pass B rim recalibration and extrusion pending future briefs.

---

## R-014 — Next Step Button: Rim/Specular Polish Pass QA

**Date:** 2026-06-16  
**Reviewer:** Human Founder  
**Subject:** Rim and specular polish pass for `.enquiry-nextstep-btn`

**Findings:**
- First attempt (rim 0.42/0.52) was imperceptible in the rendered UI — too close to the prior 0.30 baseline to register on screen.
- Correction raised rim to 0.68 idle / 0.78 hover and face radial from 0.12 to 0.22 idle / 0.16 to 0.28 hover. Effect now clearly visible.
- Top rim reads as a perceptibly precise lit edge — not a drawn border, not a bright line. Confirmed cooler and quieter than Begin (1.00 white).
- Face curvature now visibly contributes to the 3D surface read. Upper face clearly lighter than base.
- Two-stop radial dissolve (via 0.06/0.07 mid-stop at 55%) embeds the catch in the surface; no blob or overlay read.
- Button remains quieter than Begin and does not overpower the answer cards or amber filament.
- Both "Next step" and "Send" buttons inherit through the shared class. No JSX changed.

**Flags:** None.

**Status:** APPROVED — rim/specular polish complete. See D-030 (updated). Next: extrusion/deeper 3D pass, pending a future brief.

---

## R-013 — Next Step Button: Material/Depth Pass QA

**Date:** 2026-06-16  
**Reviewer:** Human Founder  
**Subject:** Material/surface pass for `.enquiry-nextstep-btn` — face curvature and depth definition

**Findings:**
- Sub-pass A (face curvature): broad soft radial catch accepted. Upper face reads as gently lit surface, not a gloss blob. Atmosphere is embedded in the surface, not overlaid.
- Sub-pass B (depth/shadow): four-layer box-shadow stack accepted. Top rim reads as caught light, not a drawn border. Lower bevel and drop shadow give the button physical presence. Button reads as a small 3D object.
- Approval note: the lighter top read is a recognised consequence of the light direction beginning to read as 3D. Not a defect. Not a correction request.
- Both "Next step" and "Send" buttons inherit through the shared class. No JSX changed.
- Button remains quieter than Begin and does not overpower the selected cards or amber filament.

**Flags:** None.

**Status:** APPROVED — material/depth pass complete. See D-030 (updated). Extrusion/polish pass is next, pending a future brief.

---

## R-012 — Next Step Button: Colour Pass QA

**Date:** 2026-06-16  
**Reviewer:** Human Founder  
**Subject:** First-pass colour update for `.enquiry-nextstep-btn` (shared "Next step" and "Send" buttons)

**Findings:**
- Flat white pill replaced with three-stop smoked blue-steel gradient.
- Two interim iterations rejected: (1) desaturated slate — read as pale neutral/ivory on screen; (2) saturated cobalt — read as product-UI primary accent, visually separate from glass cards.
- Approved direction: smoked blue-steel, desaturated enough to feel native to the glass-card environment.
- Button now sits naturally alongside frosted blue cards, white active question, teal memory rail, and amber filament.
- Both "Next step" and "Send" buttons inherit the update through the shared class — no JSX changed.

**Flags:** None.

**Status:** APPROVED — colour pass complete. See D-030. Material/depth pass is next.

---

## R-011 — Enquiry Selected-Card Filament Border: QA Pass

**Date:** 2026-06-15  
**Reviewer:** Human Founder + Agent QA  
**Subject:** Animated filament border rollout across Q5–Q1 answer cards

**Findings:**
- Single-rect SVG filament border approved after iterative prototyping. Draw animation works across all cards Q5–Q1.
- Q5 multi-select: multiple simultaneous active filaments render independently with no interference. Visually controlled.
- Q4–Q1: selected card draws filament in; deselecting or advancing to next question fades completed border out smoothly.
- Memory rail and answered-question states: unaffected. `handleNextStep` clears `selected` Set before pushing to memory; filament fades with the card grid during corridor morph.
- Glass material: frosted blue glass unchanged. Filament SVG is `pointer-events: none`, `z-index: 3`; card text remains above at `z-index: 4`.
- Colour: aligned to Q-label gold family (`rgba(190,145,58,0.80)`). Glow layers use same bronze-gold family. Not yellow, not near-white.
- Reduced motion: animation skipped; full border appears immediately on select; opacity fade on deselect retained.
- Lint: only the two known pre-existing `react-hooks/set-state-in-effect` errors at lines 64 and 71 of `enquiry-opening.tsx`.

**Flags:**

*None.*

**Status:** Approved — 2026-06-15. See D-029.

---

## R-010 — Enquiry Answer Card Material: Frosted Blue Glass

**Date:** 2026-06-15  
**Reviewer:** Human Founder  
**Subject:** Answer card material pass — commit 3621997

**Findings:**
- Idle, hover, and selected card states updated to frosted blue glass material. Approved.
- Five deterministic glass variants (A–E) rotate across Q5–Q1. No repeated gradient directions. Approved.
- Selected state retains amber top-edge hairline and warm halo from D-016 — material activation model unchanged.
- Amber perimeter circuit experiment was prototyped, became unstable, and removed before commit. Not approved for production.

**Flags:**

*None.*

**Status:** Approved — commit 3621997. See D-028. Amber circuit work paused; restart requires a new brief.

---

## R-009 — Milestone QA: Homepage Scaffold + Full Enquiry Flow

**Date:** 2026-06-14  
**Reviewer:** Human Founder  
**Subject:** Full site review — homepage scaffold, `/start` full Q5→Q1 corridor, completion state, mobile nav, mobile opening reveal

**Findings:**
- Homepage scaffold (Hero, Services, Work, Contact/CTA, Footer) is clean and restrained. Approved.
- Nav order approved: Services → Work → About → Contact. About is planned but not built.
- Hero right-side space is intentionally empty. Future cinematic direction planned (D-026). Do not fill without a brief.
- Services section approved after spacing/anchor refinement.
- Work section approved. Possible future centred heading or visual asset only if later design direction requires it.
- Contact/CTA section approved. Nav landing is clean and full-screen in style.
- Footer is acceptable for now. Subtle C2B signature refinement planned.
- Full Q5→Q1 corridor approved. Corridor architecture (D-023) proved stable across all five questions.
- Q labels match question text size at all corridor depths. Approved.
- Completion state ("Understood" handoff) approved.
- Send button position approved.
- Begin / Next step / Send button visibility consistent and approved.
- Mobile nav approved. Mobile opening reveal and corridor refinements approved.

**Flags:**

*None.*

**Status:** Approved — milestone commit 2152e6e. Sprint 2 closed.

---

## R-008 — Persistent Q5 Element + Compact Memory Rail

**Date:** 2026-06-01  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx`, `app/globals.css` — D-022 persistent element, chip memory rail, Q4 framing

**Findings:**
- `q5Settling: boolean` replaced by `q5Phase: "active" | "settling" | "memory"` — single source of truth for Q5 visual state
- Q5 DOM node persists from `stage = "question1"` through `stage = "question2"` via `{stage !== "opening" && ...}` conditional; no unmount/remount at the 1200ms transition point — eliminates the repaint event that caused the perceived snap
- At 1200ms: class changes from `enquiry-q5-settling-block` to `enquiry-q5-memory-block-settled` — both specify `transform: translateY(-24px) scale(0.95)` with `transform-origin: top center`; computed transform is identical before and after the class change; block does not visually move
- Q5 cue, question, and cards change class based on `q5Phase`; `aria-labelledby` / `role="group"` in active/settling, `role="note"` / `aria-label` in memory — semantics update atomically with visual state
- Memory field now renders selected answers as `.enquiry-memory-chip` pills in `.enquiry-memory-chips` flex-wrap row — chip height ~26px vs ~53px for full cards; memory block is significantly shorter
- Generic memory rail classes added to `globals.css` (no `q5` prefix): `.enquiry-memory-cue`, `.enquiry-memory-question`, `.enquiry-memory-chips`, `.enquiry-memory-chip` — reusable for Q4, Q3, Q2, Q1 memory states
- `.enquiry-q5-settling-question` now transitions `font-size` (0.8125rem over 900ms) in addition to `color` — ensures no font-size jump at the 1200ms class switch; memory question (`enquiry-memory-question`) matches this size
- Opening context chain reaction: stage switch to "question2" triggers `.enquiry-context-faintest` (opacity 0.10 from 0.38 over 1200ms, scale 0.91 from 0.93 over 1000ms) — chain reaction is perceptible
- Q4 layout-first: with chip memory, Q4 cards end at ~745px from viewport top on a 768px viewport — fits without scroll on standard desktop heights
- Q4 fallback scroll: `scrollIntoView({ block: 'nearest' })` fires on Q4 mount — no-ops if already in view; does not push memory rail off-screen
- Q4 Next step scroll: `scrollIntoView({ block: 'nearest' })` fires when `q4Selected` becomes non-null — mirrors Q5 Next step behavior
- All three `scrollIntoView` calls respect `prefers-reduced-motion`: `behavior: 'auto'` when reduced-motion, `behavior: 'smooth'` otherwise
- `npm run lint` — 0 errors, 0 warnings

**Flags:**

*None.*

**Recommendations:**
- No changes required at this stage

**Status:** Approved — D-022 complete.

---

## R-007 — Q5 → Q4 Four-Point Choreography Correction

**Date:** 2026-06-01  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx`, `app/globals.css` — D-021 four-point choreography correction

**Findings:**
- `transform-origin: top center` added to `.enquiry-q5-settling-block` and `.enquiry-q5-memory-block-settled` — scale now anchors to top edge; visual top positions match at DOM swap regardless of block height; eliminates ~5px jump caused by height-dependent transform-origin mismatch
- Q5 memory field now renders only selected answers via `q5Selections.map()` — no invisible placeholder slots; field is compact and proportional to actual selections
- `nextStepRef` added to Q5 Next step wrapper; `useEffect` calls `scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' })` when `selected.size > 0` and not settling — reduced-motion path uses instant scroll; normal path uses smooth scroll; no-ops if Next step already in view
- `useRef` added to React import
- Stage 2 settling block unchanged — still has 5 cards with per-element transitions; height collapse at 1200ms is invisible because unselected cards were already `opacity: 0` and Q4 hasn't appeared yet
- Q4 natural layout position is higher after compact memory removes invisible placeholder height — Q4 question and cards comfortably visible at standard desktop viewport heights
- `npm run lint` — 0 errors, 0 warnings

**Flags:**

*None.*

**Recommendations:**
- No changes required at this stage

**Status:** Approved — D-021 complete.

---

## R-006 — Q5 → Q4 Handoff Motion Correction

**Date:** 2026-06-01  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx`, `app/globals.css` — Q5 → Q4 handoff motion corrected to per-element settle + spatial recede (D-020)

**Findings:**
- Q5 block now spatially recedes (`translateY(-24px) scale(0.95)` over 1100ms) while individual elements morph toward memory values in parallel — cue dims (800ms), question dims (900ms), selected cards morph (1000ms), unselected cards fade to invisible (600ms)
- Next step button removed from DOM immediately when settling begins — no ghost button during transition
- Stage switches at 1200ms (after settling is fully complete); memory field mounts at same static transform with no animation — swap is invisible
- All five `Q1_OPTIONS` rendered in memory field: selected as card echoes, unselected as `invisible` layout placeholders — no layout reflow on stage switch
- Visual continuity confirmed: outgoing settling end state and incoming memory field start state are identical on opacity, colour, and transform values
- Q4 cards begin entering at 2000ms from click — memory is fully static before Q4 appears
- Reduced-motion: stage switches immediately, no transforms, no transitions — settled memory + Q4 appear at once
- `npm run lint` — 0 errors, 0 warnings
- Settling Q5 cards have `tabIndex=-1` — not in tab order during transition

**Flags:**

*None.*

**Recommendations:**
- No changes required at this stage

**Status:** Approved — Q5 → Q4 handoff motion correction complete (D-020).

---

## R-005 — Q5 Memory Field Correction and Q4 Option Count

**Date:** 2026-06-01  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx`, `app/globals.css` — Q5 memory field corrected to bounded quiet model; Q4 reduced to 5 options; three-layer visual hierarchy enforced

**Findings:**
- Q5 memory field renders Q5 cue label, Q5 question text (muted), and selected answer card echoes — only selected cards, not all Q5 options
- Memory cards are non-interactive `div`s with transparent background, faint border (`rgba(255,255,255,0.06)`), and muted text (`rgba(255,255,255,0.22)`)
- Visual hierarchy in Stage 3 confirmed: opening context at opacity 0.10 / scale 0.91 (`.enquiry-context-faintest`) is visibly fainter than Q5 memory (question at 0.14, cards at 0.22), which is visibly fainter than Q4 (full material surface)
- Memory field does not animate after its 1400ms fade-in — fully static once settled
- ARIA: `role="note"` on memory wrapper with `aria-label` summarising Q5 question and selections; visual children are `aria-hidden="true"` — no duplication for screen readers
- Memory cards are not in tab order (div, not button)
- Q4 reduced to 5 options (removed "Speed of response") — symmetric with Q5
- Reduced-motion: memory field and Q4 appear immediately; no staged reveals
- `npm run lint` — 0 errors, 0 warnings

**Flags:**

*None. No overflow observed with 1 or multiple Q5 selections in manual review.*

**Recommendations:**
- No changes required at this stage

**Status:** Approved — Q5 memory field and Q4 correction complete (D-019).

---

## R-004 — `/start` Stage 3: Q4 Single-Select and Q5 → Q4 Transition

**Date:** 2026-06-01  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx`, `app/globals.css` — Q5 → Q4 transition, Q5 memory surface, Q4 single-select stage

**Findings:**
- Pressing "Next step" in Q5 saves selections to `q5Selections`, applies `.enquiry-q5-settling-wrapper` (opacity 0.2, scale 0.97 over 1100ms), then switches stage to `"question2"` at 500ms — producing the approved calm overlap
- Q5 memory block renders with compact label summary: "You mentioned: [comma-separated short labels]" — labels mapped via `Q5_MEMORY_LABELS` constant
- Q5 memory cue ("Q5") renders at `rgba(255,255,255,0.10)` — more muted than the active Q5 cue (`rgba(255,255,255,0.20)`)
- Q5 memory block fades in via `enquiry-q5-memory-appear` (1400ms linear) — calm, non-urgent
- Q4 cue ("Q4") uses the same `enquiry-q5-presence` animation as Q5 cue — consistent atmospheric orientation
- Q4 question reveals left-to-right via `enquiry-mask-reveal-horizontal` — consistent with Q5 and Stage 1 motion language
- Q4 cards enter top-to-bottom with staggered delays (800ms base + 150ms per card) — matching Q5 card pattern
- Q4 is single-select: `role="radiogroup"` on the group, `role="radio"` + `aria-checked` on each card
- Selecting a Q4 card deselects the previously selected card; clicking the active card deselects it
- Card visual states (amber/gold selected, hover) reuse existing `.enquiry-card` and `.enquiry-card-selected` CSS — no new selectors needed
- "Next step" appears after Q4 selection via `enquiry-nextstep-reveal` — same as Q5 Next step
- `prefers-reduced-motion: reduce`: settling skipped, stage switches immediately, no animation classes applied, all content appears at once
- Keyboard focus navigates Q4 cards; `focus-visible` ring present
- Opening context remains at Stage 2 dimmed state — no further change on Q4 entry

**Flags:**

| Severity | ID | Finding | Status |
|---|---|---|---|
| Low | F-007 | Q4 "Next step" is a placeholder — `console.log` only; Q4 → Q3 transition not implemented | Open — Q3 model not yet designed |

**Recommendations:**
- Design Q4 → Q3 transition before implementing — new brief required
- No other changes needed at this stage

**Status:** Partially open — Q4 stage interaction approved. F-005 actioned. F-007 open (Q4 Next step placeholder pending Q3 brief).

---

## R-003 — `/start` Stage 2: Q5 Guided Question

**Date:** 2026-05-31  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx` — Stage 2 Q5 multi-select question, card surface, Q5 cue, Next step trigger

**Findings:**
- Q5 orientation cue ("Q5") renders above question text; `aria-hidden="true"` confirmed; scale+fade animation triggers on stage mount
- Question text ("What brought you here today?") reveals left-to-right, linear, consistent with Stage 1 motion language
- Five answer cards reveal sequentially top-to-bottom with staggered delays (800ms base + 150ms per card)
- Cards use frosted/smoked glass gradient surface with inset top-edge hairline; visible gradient depth from top to bottom
- Card selection activates amber/gold warmth: border shifts, top hairline shifts from white to amber, faint outer halo; no ticks, circles, or form-control indicators
- Multi-select works correctly: multiple cards can be activated simultaneously
- "Next step" ghost-pill button appears after first selection; unmounts if all cards deselected
- `role="checkbox"` + `aria-checked` on cards; `role="group"` + `aria-labelledby` on wrapper — correct multi-select ARIA semantics
- `prefers-reduced-motion: reduce`: Q5 cue, card reveals, and Next step all appear immediately; selection transitions instant
- Card `focus-visible` ring is visible at keyboard; "Next step" button is keyboard accessible

**Flags:**

| Severity | ID | Finding | Status |
|---|---|---|---|
| Medium | F-005 | "Next step" button currently only `console.log`s selections — no navigation or Q4 reveal | Actioned — Q4 implemented 2026-06-01 |
| Low | F-006 | Q4 transition behaviour is undefined — how answered questions become contextual memory is not yet designed or documented | Actioned — D-017 approved 2026-05-31 |

**Recommendations:**
- Design Q4 transition before implementing — see D-016 Future Work section
- No other changes required at this stage

**Status:** Closed — Stage 2 interaction approved. F-005 actioned (Q4 implemented 2026-06-01). F-006 actioned via D-017.

---

## R-002 — `/start` Stage 1: Opening Reveal

**Date:** 2026-05-26  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx` — Stage 1 mask-based reveal sequence and Begin button

**Findings:**
- Dark radial gradient background renders immediately on route arrival — no flash of white
- Heading line 1 reveals left-to-right, linear, from ~0.6s
- Heading line 2 reveals left-to-right, linear, beginning just before line 1 finishes (~2.9s)
- Supporting text reveals left-to-right, linear, beginning just before line 2 finishes (~5.1s)
- Begin button reveals top-to-bottom, linear, during the final words of supporting text (~9.0s)
- Full phrase settles at ~11.5s — consistent with D-015 approved timing
- Begin button has `tabIndex=-1` and `pointer-events: none` until animation completes; becomes keyboard-accessible on completion
- `prefers-reduced-motion: reduce`: all staged reveals disabled, all content immediately visible, button immediately keyboard-accessible
- All text is real DOM text — no canvas, SVG, or image rendering
- Content wrapper uses `translateY(calc(38vh - 5rem))` in Stage 1 to approximate vertical centring without `justify-center` — prevents layout reflow jump on stage transition

**Flags:**

*None. Stage 1 behaviour matches D-015 approved spec.*

**Recommendations:**
- Minor microtiming adjustments remain possible during a future mastering phase — no action required now

**Status:** Approved. Stage 1 creative milestone complete.

---

## R-001 — Homepage Skeleton

**Date:** 2026-05-23  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `app/page.tsx` — initial homepage structure

**Findings:**
- Navbar, Hero, Services, Work, and Footer sections render in correct order
- Forced dark background (`bg-neutral-950`) applied consistently across all sections
- `Container` component used in every section — layout is consistent
- Typography hierarchy is clear: H1 (6xl bold) → H2 (3xl semibold) → body (lg, neutral-400) → muted (sm, neutral-500)
- CTA button (white pill, `rounded-full`) is visually distinct against the dark background
- Section dividers (`border-t border-neutral-800`) create rhythm without visual noise

**Flags:**

| Severity | ID | Finding | Status |
|---|---|---|---|
| High | F-001 | Geist font variables declared in `layout.tsx` but not applied to `<html>` className — Geist not rendering | Actioned — Sprint 2. Variables applied to `<html>`. See D-011. |
| High | F-002 | `--font-sans` in `globals.css` references `var(--font-sans)` — circular, no effect | Actioned — Sprint 2. Corrected to `var(--font-geist-sans)`. `--font-heading` also fixed. See D-011. |
| Medium | F-003 | Navbar has no mobile responsive state — links will overflow or collapse on small screens | Open — Sprint 2 Up Next |
| Low | F-004 | Nav and CTA use plain `<a>` tags — should use Next.js `<Link>` for client-side routing | Open — Sprint 2 Up Next |

**Recommendations:**
- Apply `${geistSans.variable} ${geistMono.variable}` to `<html>` className in `layout.tsx` (not `<body>` — see D-011 for rationale)
- Correct `--font-sans` and `--font-heading` tokens in `globals.css` to `var(--font-geist-sans)`
- Add mobile nav before launch — pattern TBD (hamburger menu, collapsed links, or slide drawer)
- Replace `<a>` with `<Link>` from `next/link`

**Status:** Partially actioned — F-001 and F-002 resolved in Sprint 2. F-003 and F-004 remain open.

---

*Last updated: 2026-06-16 — R-016 added (D-031 Q5 position-aware warm environmental reflection on Next step button)*
