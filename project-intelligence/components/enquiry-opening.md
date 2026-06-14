# Component Documentation — EnquiryOpening

**Status:** IMPLEMENTED — milestone approved 2026-06-14, commit 2152e6e  
**Component file:** `components/enquiry/enquiry-opening.tsx`  
**Review entries:** R-002 (Stage 1), R-003 (Stage 2), R-004 (Q4 stage), R-009 (full corridor milestone)  
**Related decisions:** D-015, D-016, D-017, D-018, D-019, D-020, D-021, D-022, D-023, D-024

---

## Purpose

The primary component for the `/start` route. Manages the full guided enquiry experience from the initial opening reveal through the complete Q5→Q1 corridor, completion state ("Understood" handoff), and Send button. Rendered by the thin server wrapper at `app/start/page.tsx`.

A client component (`"use client"`) — uses `useState`, `useEffect`, `useRef`, `setTimeout`, and `window.matchMedia` for animation state, stage transitions, scroll management, and reduced-motion detection.

---

## UX Goal

Guide the visitor into a considered enquiry process without the friction of an admin-style form. The component creates a sense that the visitor is entering a process designed for them, not filling out a ticket.

Stage 1 builds anticipation and attention through a legato reveal sequence. Stage 2 makes the first question feel like a calm, natural continuation. Multi-select allows honest, multi-reason responses. When the visitor confirms Q5, their answer settles quietly into memory and Q4 becomes the only active stage — communicating that their input was retained without pressure or judgement.

---

## Emotional Role

**Calm, considered, premium, and guided.**

The component must never feel mechanical, pressured, or administrative. The motion language and visual surface are both serving the same purpose: making the visitor feel they are in a thoughtful process that understands them, rather than a digital form that is collecting data from them.

---

## Design Principles Applied

- **Colour:** Dark radial gradient background (`#141414` → `#080808`). Cards use frosted/smoked glass surface — approved gradient exception per D-016. Card selected state uses amber/gold warmth with faint teal countertone. Q5 memory text: `rgba(255,255,255,0.25)`. See `design.md` — Colour section and enquiry exceptions.
- **Typography:** Real DOM text throughout. Heading: `text-3xl sm:text-4xl font-semibold tracking-tight`. Question: `text-lg sm:text-xl font-medium`. Cards: `text-sm font-medium`. Q5/Q4 cue: `0.6875rem`, `letter-spacing: 0.18em`, `uppercase`. Memory text: `0.8125rem`.
- **Spacing:** `px-6 py-20` on the outer wrapper. `mt-8` between opening context and stage content. `gap-3` between cards. `mb-8` below Q5 memory block.
- **Motion:** CSS `clip-path: inset()` masks, `linear` easing. No JS animation libraries. Full `prefers-reduced-motion: reduce` support. See D-015, D-016, D-017, D-018.
- **Layout:** Full-viewport (`min-h-screen`). Does not use the `Container` component — this is intentional. See D-015.

---

## Layout Behaviour

The outer wrapper is `min-h-screen flex flex-col items-center justify-start`. The content block is centred horizontally and constrained to `max-w-xl`.

**Stage 1:** Content block is visually centred via `transform: translateY(calc(38vh - 5rem))` applied by `.enquiry-content-centered`. This produces approximately the same visual centring as `justify-center` without relying on the flex algorithm, which would cause an instant positional jump when content height changes on stage transition.

**Stage 2 and Stage 3:** The content block uses `.enquiry-content-settling` — `translateY(0)` over 1800ms linear. The opening context dims (`opacity: 0.38, scale: 0.93`) simultaneously. Stage content stacks beneath the dimmed opening context within the same content block.

When stage content exceeds viewport height, the browser scrolls naturally — no overflow handling required.

---

## Stage Machine

The full corridor runs: Opening → Q5 → Q4 → Q3 → Q2 → Q1 → Completion.

Each completed question compresses into a memory capsule at corridor depth, governed by shared CSS variables (D-023). The active question always owns attention at full prominence.

`q5Phase` (and equivalent phase state for each question) tracks visual state independently of `stage`. Question DOM nodes persist through the corridor — visual state is driven entirely by class changes, not unmount/remount.

---

## Animation Behaviour

All animations are CSS-only. No JS animation libraries.

### Stage 1 sequence (triggered on route mount)

| Element | Keyframe | Duration | Delay | Easing |
|---|---|---|---|---|
| Heading line 1 | `enquiry-mask-reveal-horizontal` | 2500ms | 600ms | linear |
| Heading line 2 | `enquiry-mask-reveal-horizontal` | 2500ms | 2900ms | linear |
| Supporting text | `enquiry-mask-reveal-horizontal` | 4600ms | 5100ms | linear |
| Begin button | `enquiry-mask-reveal-downward` | 2500ms | 9000ms | linear |

Full phrase settles at ~11.5s. `animation-fill-mode: both` on all elements.

### Stage 1 → Stage 2 transition (triggered on Begin click)

| Element | Behaviour | Duration |
|---|---|---|
| Begin button | `opacity: 0` inline style | 400ms |
| Begin button (unmount) | Stage changes to `"question1"` | at 500ms |
| Opening context | `opacity: 0.38, scale: 0.93` CSS transition | 1600ms / 1400ms |
| Content wrapper | `translateY` from Stage 1 offset to `0` | 1800ms linear |

### Stage 2 reveals (triggered on stage mount)

| Element | Keyframe | Duration | Delay |
|---|---|---|---|
| Q5 cue | `enquiry-q5-presence` | 4000ms | 0ms |
| Question text | `enquiry-mask-reveal-horizontal` | 2500ms | 0ms |
| Card 1 | `enquiry-mask-reveal-downward` | 1800ms | 800ms |
| Card 2 | `enquiry-mask-reveal-downward` | 1800ms | 950ms |
| Card 3 | `enquiry-mask-reveal-downward` | 1800ms | 1100ms |
| Card 4 | `enquiry-mask-reveal-downward` | 1800ms | 1250ms |
| Card 5 | `enquiry-mask-reveal-downward` | 1800ms | 1400ms |

### "Next step" reveal (triggered when `selected.size > 0` in Stage 2)

| Element | Keyframe | Duration |
|---|---|---|
| Next step wrapper | `enquiry-nextstep-appear` | 1200ms linear |

### Stage 2 → Stage 3 transition (triggered on "Next step" click)

| Event | Time |
|---|---|
| `q5Phase = "settling"`. Per-element transitions begin. Q5 block (persistent DOM node) starts receding (`translateY(-24px) scale(0.95)`, 1100ms). | 0ms |
| Unselected cards reach `opacity: 0` | ~600ms |
| Q5 cue reaches memory opacity | ~800ms |
| Q5 question reaches memory opacity and size (font-size transitions to 0.8125rem) | ~900ms |
| Selected cards reach memory card style | ~1000ms |
| Block transform completes | ~1100ms |
| `q5Phase = "memory"`, `stage = "question2"`. Q5 block stays in DOM — class changes from `enquiry-q5-settling-block` to `enquiry-q5-memory-block-settled` (same transform value). Cards swap from buttons to `.enquiry-memory-chip` divs. Opening context transitions to `.enquiry-context-faintest` (chain reaction: 0.38 → 0.10 opacity). Q4 mounts. scrollIntoView (block: nearest) fires — no-op if Q4 already in view. | 1200ms |
| Q4 card 1 enters | 1200ms + 800ms = 2000ms |
| Q4 card 5 enters | 1200ms + 1400ms = 2600ms |

No DOM swap occurs for Q5. The persistent element stays mounted; only its class and children change at 1200ms. Since the CSS transform does not change at the class switch, the Q5 block does not visually move. The browser produces no repaint from element insertion.

### Stage 3 reveals (triggered on stage mount at 1200ms)

| Element | Keyframe | Duration | Delay |
|---|---|---|---|
| Q5 memory field | none — mounts at settled state immediately | — | — |
| Q4 cue | `enquiry-q5-presence` | 4000ms | 0ms |
| Q4 question | `enquiry-mask-reveal-horizontal` | 2500ms | 0ms |
| Q4 card 1–5 | `enquiry-mask-reveal-downward` | 1800ms | 800–1400ms (150ms stagger) |

**Reduced-motion:** All stage reveals disabled. All content appears immediately. Transitions are instant. Q5 settling skipped — stage switches directly to `"question2"`.

Card stagger delays are applied via inline `animationDelay` style in JSX (not CSS classes) so the offset is index-generated. Omitted when `reducedMotion` is true.

---

## Q5 → Q4 Interaction Model

**Q5 (Stage 2):**
- Multi-select. Any combination of options valid.
- "Next step" appears after first selection.
- Pressing "Next step" triggers the Q5 → Q4 transition.
- Selected Q5 options are preserved as `q5Selections: string[]`.

**Q5 memory field (Stage 3) — receding memory rail:**
- The same Q5 DOM node that was active in Stage 2 remains mounted. At 1200ms, its `q5Phase` changes from `"settling"` to `"memory"`, switching its class to `.enquiry-q5-memory-block-settled`.
- Memory field shows: Q5 cue (`.enquiry-memory-cue`), Q5 question text (`.enquiry-memory-question`), and selected answer labels as compact pill chips (`.enquiry-memory-chips` / `.enquiry-memory-chip`).
- Chip layout: 1 answer → single chip centred; 2 answers → side by side; 3+ answers → flex-wrap, centred. Chips are short in height (~26px) compared to full cards (~53px), keeping the memory rail compact.
- ARIA: `role="note"` on the wrapper with `aria-label` summarising question and selections. Visual children are `aria-hidden="true"`.
- Memory field is non-interactive: `.enquiry-memory-chip` has `pointer-events: none; user-select: none`.
- Opening context recedes further in Stage 3 via `.enquiry-context-faintest` (opacity 0.10 → from 0.38, scale 0.91 → from 0.93, transitions over 1200ms/1000ms). This is the chain reaction: Q5 becomes memory → opening context moves one layer deeper. Three-layer depth hierarchy: opening = faintest, Q5 memory = subdued, Q4 = active foreground.
- See D-018, D-019, D-020, D-021, D-022.

**Q4 (Stage 3):**
- Single-select. `role="radiogroup"` on the group, `role="radio"` + `aria-checked` on each card.
- Five options (symmetry with Q5 — see D-019).
- Selecting a card deselects any previously selected card.
- Clicking the selected card deselects it (returns to null state).
- "Next step" appears after selection — **placeholder only, logs to console** (Q4 → Q3 not yet implemented).
- See D-017 for Q4 question. D-018 for single-select. D-019 for option count.

---

## Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| Mobile (`< 640px`) | `text-3xl` heading, `text-lg` question, `px-6` outer padding. Content block `max-w-xl` fills available width minus padding. |
| Small (`sm`, ≥ 640px) | `sm:text-4xl` heading, `sm:text-xl` question. Content block remains `max-w-xl`. |
| Medium+ | No additional breakpoints. Layout is stable at all viewport widths above `sm`. |

---

## Accessibility Considerations

- **Q5 multi-select cards:** `role="checkbox"`, `aria-checked={isSelected}`. Grouped under `role="group"` with `aria-labelledby="q1-label"`.
- **Q4 single-select cards:** `role="radio"`, `aria-checked={isSelected}`. Grouped under `role="radiogroup"` with `aria-labelledby="q4-label"`.
- **Q5/Q4 orientation cues:** `aria-hidden="true"` — atmospheric, not read by screen readers.
- **Q5 memory cue/text:** `aria-hidden="true"` on the Q5 cue label. Memory text is readable DOM text — available to screen readers as informational content.
- **Begin button:** `tabIndex=-1` and `pointer-events: none` until `buttonReady` state is true (~11.5s, or immediately for reduced-motion users). `focus-visible` outline is white.
- **Card focus ring:** `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40`.
- **"Next step" buttons:** In normal tab order. `focus-visible` ring matches card style.
- **Reduced motion:** `window.matchMedia("(prefers-reduced-motion: reduce)")` read in `useEffect`. When true: no settling delay, no animation classes, transitions instant, stage switches immediately.
- All text is real DOM text — no canvas, SVG, or image-based rendering.

---

## Dependencies

| Dependency | Type | Purpose |
|---|---|---|
| React (`useState`, `useEffect`, `useRef`) | npm | Stage state, reduced-motion detection, scroll management |
| Tailwind CSS | npm | All layout and typography classes |
| `app/globals.css` enquiry classes | Internal CSS | All animation keyframes and enquiry-specific styles |

No shadcn/ui primitives. No `cn()` utility — class composition uses template literals directly.

---

## Related Decisions

| ID | Title |
|---|---|
| D-015 | Enquiry Experience: Stage 1 Opening Direction |
| D-016 | Enquiry Experience: Stage 2 — Q5 Guided Question |
| D-017 | Enquiry Experience: Q5 → Q4 Transition Model |
| D-018 | Enquiry Experience: Q5 → Q4 Implementation Choices |
| D-019 | Enquiry Experience: Q5 Memory Field Correction |
| D-020 | Enquiry Experience: Q5 → Q4 Handoff Motion Correction |
| D-021 | Enquiry Experience: Four-Point Choreography Correction |
| D-022 | Enquiry Experience: Persistent Q5 Element + Compact Memory Rail |

---

## Known Issues

| ID | Description | Severity | Review Reference | Status |
|---|---|---|---|---|
| F-005 | "Next step" on Q5 triggered Q4 reveal | Medium | R-003 | Actioned — Q4 implemented 2026-06-01 |
| F-006 | Q4 transition behaviour undefined | Low | R-003 | Actioned — D-017 approved 2026-05-31 |
| F-007 | Q4 "Next step" is a placeholder — logs to console only; Q4 → Q3 not yet implemented | Low | R-004 | Open — Q3 model not yet designed |

---

## Review History

| ID | Date | Reviewer | Status |
|---|---|---|---|
| R-002 | 2026-05-26 | Claude Code | Approved — Stage 1 complete |
| R-003 | 2026-05-31 | Claude Code | Partially open — Stage 2 approved; F-005 open; F-006 actioned via D-017 |
| R-004 | 2026-06-01 | Claude Code | Partially open — Q4 stage approved; F-005 actioned; F-007 open (Q4 Next step placeholder) |
| R-005 | 2026-06-01 | Claude Code | Approved — Q5 memory field corrected to bounded quiet model (D-019); Q4 reduced to 5 options |
| R-006 | 2026-06-01 | Claude Code | Approved — Q5 → Q4 handoff motion corrected (D-020); per-element settle + spatial recede |
| R-007 | 2026-06-01 | Claude Code | Approved — Four-point choreography correction (D-021); transform-origin fix, compact memory, Next step scroll |
| R-008 | 2026-06-01 | Claude Code | Approved — Persistent Q5 element, chip memory rail, Q4 layout-first framing (D-022) |

---

## Known Issues

| ID | Description | Severity | Review Reference | Status |
|---|---|---|---|---|
| F-005 | "Next step" on Q5 triggered Q4 reveal | Medium | R-003 | Actioned |
| F-006 | Q4 transition behaviour undefined | Low | R-003 | Actioned — D-017 |
| F-007 | Q4 "Next step" was a placeholder | Low | R-004 | Actioned — full corridor complete |

## Future Work

- **Colour/material pass** — D-024 future direction. Active question stays white/off-white. Memory question text may use teal/duck-egg family. Q labels may use muted gold/amber. Selected state to move away from current brown fill toward glass/smoked material. Requires a new brief. Do not implement without one.
- **Send wiring** — Send button is present and positioned. Backend target (email service, storage) not yet decided.
- **Component extraction** — consider splitting individual corridor stages into sub-components once the Send wiring brief is defined.

---

*Last updated: 2026-06-14 — Full Q5→Q1 corridor and completion state approved at milestone commit 2152e6e. D-023 and D-024 added to related decisions.*
