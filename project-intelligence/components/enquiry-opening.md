# Component Documentation — EnquiryOpening

**Status:** IMPLEMENTED  
**Component file:** `components/enquiry/enquiry-opening.tsx`  
**Review entries:** R-002 (Stage 1), R-003 (Stage 2)  
**Related decisions:** D-015, D-016

---

## Purpose

The primary component for the `/start` route. Manages the full guided enquiry experience from the initial opening reveal (Stage 1) through the first active question (Stage 2 — Q5). Rendered by the thin server wrapper at `app/start/page.tsx`.

A client component (`"use client"`) — uses `useState`, `useEffect`, `setTimeout`, and `window.matchMedia` for animation state, stage transitions, and reduced-motion detection.

---

## UX Goal

Guide the visitor into a considered enquiry process without the friction of an admin-style form. The component creates a sense that the visitor is entering a process designed for them, not filling out a ticket.

Stage 1 builds anticipation and attention through a legato reveal sequence. Stage 2 makes the first question feel like a calm, natural continuation — not the arrival of a form. Multi-select allows honest, multi-reason responses. The "Next step" trigger puts the visitor in control of pacing.

---

## Emotional Role

**Calm, considered, premium, and guided.**

The component must never feel mechanical, pressured, or administrative. The motion language and visual surface are both serving the same purpose: making the visitor feel they are in a thoughtful process that understands them, rather than a digital form that is collecting data from them.

The opening sequence establishes the agency's tone before the visitor does anything. The guided question continues it.

---

## Design Principles Applied

- **Colour:** Dark radial gradient background (`#141414` → `#080808`). Cards use frosted/smoked glass surface — approved gradient exception per D-016. Card selected state uses amber/gold warmth with faint teal countertone. See `design.md` — Colour section and enquiry exceptions.
- **Typography:** Real DOM text throughout. Heading: `text-3xl sm:text-4xl font-semibold tracking-tight`. Question: `text-lg sm:text-xl font-medium`. Cards: `text-sm font-medium`. Q5 cue: `0.6875rem`, `letter-spacing: 0.18em`, `uppercase`.
- **Spacing:** `px-6 py-20` on the outer wrapper. `mt-8` between opening context and stage content. `gap-3` between cards.
- **Motion:** CSS `clip-path: inset()` masks, `linear` easing. No JS animation libraries. Full `prefers-reduced-motion: reduce` support. See D-015 and D-016.
- **Layout:** Full-viewport (`min-h-screen`). Does not use the `Container` component — this is intentional. See D-015.

---

## Layout Behaviour

The outer wrapper is `min-h-screen flex flex-col items-center justify-start`. The content block is centred horizontally and constrained to `max-w-xl`.

**Stage 1:** Content block is visually centred via `transform: translateY(calc(38vh - 5rem))` applied by `.enquiry-content-centered`. This produces approximately the same visual centring as `justify-center` without relying on the flex algorithm, which would cause an instant positional jump when content height changes on stage transition.

**Stage 2:** The content block transitions to `translateY(0)` over 1800ms linear via `.enquiry-content-settling`. The opening context dims (`opacity: 0.38, scale: 0.93`) simultaneously. Q5 cue, question text, and cards stack beneath the dimmed opening context within the same content block.

When Stage 2 content exceeds viewport height, the browser scrolls naturally — no overflow handling required.

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

Card stagger delays are applied via inline `animationDelay` style in JSX (not CSS classes) so the offset is index-generated.

### "Next step" reveal (triggered when `selected.size > 0`)

| Element | Keyframe | Duration |
|---|---|---|
| Next step wrapper | `enquiry-nextstep-appear` | 1200ms linear |

**Decision reference:** D-015, D-016  
**Reduced-motion:** All stage reveals disabled. All content appears immediately. Transitions are instant. `reducedMotion` state is read from `window.matchMedia("(prefers-reduced-motion: reduce)")` in `useEffect` and used to gate animation class application and `setTimeout` delays.

---

## Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| Mobile (`< 640px`) | `text-3xl` heading, `text-lg` question, `px-6` outer padding. Content block `max-w-xl` fills available width minus padding. |
| Small (`sm`, ≥ 640px) | `sm:text-4xl` heading, `sm:text-xl` question. Content block remains `max-w-xl`. |
| Medium+ | No additional breakpoints. Layout is stable at all viewport widths above `sm`. |

The `calc(38vh - 5rem)` Stage 1 vertical centring approximation is accurate within the viewport height range of 600–1200px. At extreme viewport heights it may visually drift slightly — acceptable; no fix needed at this stage.

---

## Accessibility Considerations

- **Multi-select cards:** `role="checkbox"`, `aria-checked={isSelected}` on each card button. Grouped under `role="group"` with `aria-labelledby="q1-label"` pointing to the question text.
- **Q5 orientation cue:** `aria-hidden="true"` — purely atmospheric, not read by screen readers.
- **Begin button:** `tabIndex=-1` and `pointer-events: none` until `buttonReady` state is true (at ~11.5s, or immediately for reduced-motion users). Becomes keyboard-accessible when visually available. `focus-visible` outline is white.
- **Card focus ring:** `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40`.
- **"Next step" button:** In normal tab order. `focus-visible` ring matches card style.
- **Reduced motion:** `window.matchMedia("(prefers-reduced-motion: reduce)")` read in `useEffect`. When true: Begin sets stage immediately (no fade delay); button is immediately accessible; no animation classes applied to Next step reveal; all CSS animations are overridden to `animation: none` and `transition: none`.
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

---

## Planned: Q5 → Q4 Transition

**Decision reference:** D-017  
**Status:** Approved — not yet implemented.

### Layered attention model

When the user presses "Next step" on Q5, the experience transitions into Q4 via a layered dimming model:

| Layer | Element | Visual state |
|---|---|---|
| Faintest | Opening context (heading + subtext) | Dimmed per D-016 — persists unchanged |
| Memory | Q5 cue + memory summary | Further subdued — muted, non-interactive |
| Active | Q4 cue + question + cards | Full prominence — the only interactive stage |

### Q5 memory surface

The selected Q5 answers compress into a small muted text summary directly above the Q4 block. The Q5 cue ("Q5") remains at reduced opacity above the summary. Format (comma-separated selections or compact prose) to be resolved at implementation brief.

### Q4 question and options (approved)

**Question:** "What would you most like your website to improve?"

**Options:**
- How people see the business
- The quality of enquiries
- Speed of response
- Trust before a conversation
- Clarity around what we offer
- I'm still working that out

Select behaviour (single-select or multi-select) unresolved — to be determined at implementation brief.

### Motion (legato)

- Q5 cards and "Next step" de-emphasise via opacity/scale/position changes, not abrupt removal.
- Q5 selections condense into the memory summary with a calm dissolve.
- Q4 begins entering slightly before Q5 de-emphasis fully resolves — overlapping phrase.
- Q4 cue drifts in using the same presence animation as the Q5 cue.
- Q4 question reveals left-to-right via `enquiry-mask-reveal-horizontal`.
- Q4 options enter top-to-bottom with staggered delays (matching Q5 card pattern).
- `prefers-reduced-motion: reduce`: Q5 memory and Q4 appear immediately.

---

## Known Issues

| ID | Description | Severity | Review Reference | Status |
|---|---|---|---|---|
| F-005 | "Next step" button logs to console only — no navigation or Q4 reveal | Medium | R-003 | Open — Q4 implementation pending |
| F-006 | Q4 transition behaviour undefined | Low | R-003 | Actioned — D-017 approved 2026-05-31 |

---

## Review History

| ID | Date | Reviewer | Status |
|---|---|---|---|
| R-002 | 2026-05-26 | Claude Code | Approved — Stage 1 complete |
| R-003 | 2026-05-31 | Claude Code | Partially open — Stage 2 approved; F-005 open; F-006 actioned via D-017 |

---

## Future Improvements

- Wire "Next step" to Q4 — Q4 transition model approved (D-017); awaiting implementation brief.
- Stage 3–5 (remaining guided questions, submit dissolve, completion state) — scope not yet defined.
- Consider extracting individual stage components (`EnquiryStage1`, `EnquiryStage2`, etc.) once Stage 3 scope is known — premature before that point.

---

*Last updated: 2026-05-31*
