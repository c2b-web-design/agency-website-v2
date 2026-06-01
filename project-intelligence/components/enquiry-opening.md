# Component Documentation — EnquiryOpening

**Status:** IMPLEMENTED  
**Component file:** `components/enquiry/enquiry-opening.tsx`  
**Review entries:** R-002 (Stage 1), R-003 (Stage 2), R-004 (Q4 stage)  
**Related decisions:** D-015, D-016, D-017, D-018

---

## Purpose

The primary component for the `/start` route. Manages the full guided enquiry experience from the initial opening reveal (Stage 1) through the Q5 guided question (Stage 2) and Q4 active stage (Stage 3). Rendered by the thin server wrapper at `app/start/page.tsx`.

A client component (`"use client"`) — uses `useState`, `useEffect`, `setTimeout`, and `window.matchMedia` for animation state, stage transitions, and reduced-motion detection.

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

| Stage value | Description |
|---|---|
| `"opening"` | Stage 1 — opening reveal sequence, Begin button |
| `"question1"` | Stage 2 — Q5 multi-select ("What brought you here today?") |
| `"question2"` | Stage 3 — Q5 settled into memory; Q4 single-select active |

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
| Q5 wrapper begins settling (opacity 0.2, scale 0.97) | 0ms |
| Stage switches to `"question2"` | 500ms |
| Q5 memory block fades in | 500ms (0ms delay on mount) |
| Q4 cue drifts in | 500ms |
| Q4 question reveals left-to-right | 500ms |
| Q4 card 1 enters | 500ms + 800ms = 1300ms |

Q5 selections are saved to `q5Selections` state before the transition begins.

### Stage 3 reveals (triggered on stage mount)

| Element | Keyframe | Duration | Delay |
|---|---|---|---|
| Q5 memory block | `enquiry-q5-memory-appear` | 1400ms | 0ms |
| Q4 cue | `enquiry-q5-presence` | 4000ms | 0ms |
| Q4 question | `enquiry-mask-reveal-horizontal` | 2500ms | 0ms |
| Q4 card 1–6 | `enquiry-mask-reveal-downward` | 1800ms | 800–1550ms (150ms stagger) |

**Reduced-motion:** All stage reveals disabled. All content appears immediately. Transitions are instant. Q5 settling skipped — stage switches directly to `"question2"`.

Card stagger delays are applied via inline `animationDelay` style in JSX (not CSS classes) so the offset is index-generated. Omitted when `reducedMotion` is true.

---

## Q5 → Q4 Interaction Model

**Q5 (Stage 2):**
- Multi-select. Any combination of options valid.
- "Next step" appears after first selection.
- Pressing "Next step" triggers the Q5 → Q4 transition.
- Selected Q5 options are preserved as `q5Selections: string[]`.

**Q5 memory (Stage 3):**
- Selected options compressed to compact labels via `Q5_MEMORY_LABELS` map.
- Rendered as: "You mentioned: [comma-separated short labels]"
- Example: "You mentioned: premium website, better enquiries"
- Q5 cue label ("Q5") remains visible at further reduced opacity (`rgba(255,255,255,0.10)`).
- Memory surface is non-interactive and purely informational.
- See D-018 for memory format decision.

**Q4 (Stage 3):**
- Single-select. `role="radiogroup"` on the group, `role="radio"` + `aria-checked` on each card.
- Selecting a card deselects any previously selected card.
- Clicking the selected card deselects it (returns to null state).
- "Next step" appears after selection — **placeholder only, logs to console** (Q4 → Q3 not yet implemented).
- See D-017 for Q4 question and options. D-018 for single-select decision.

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
| React (`useState`, `useEffect`) | npm | Stage state, reduced-motion detection |
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

---

## Future Improvements

- Q4 → Q3 transition — Q4 "Next step" is currently a placeholder. Q3 model not yet designed; requires a new brief.
- Stage 4–5 (remaining guided questions, submit dissolve, completion state) — scope not yet defined.
- Consider extracting individual stage components (`EnquiryStage1`, `EnquiryStage2`, etc.) once Stage 4 scope is known — premature before that point.

---

*Last updated: 2026-06-01*
