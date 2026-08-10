# Plan — Stage B: restore selection, so the corridor can be walked

**Author:** Builder, 10 August 2026
**For:** Carl, then the Architect (`handoff-protocol.md` §2.5)
**Branch:** `fix/q5-stall-and-label-colour` @ `30c3ca7`
**Status:** revised after the Architect's review; four amendments folded in

> **Stage A is DONE** — the button mesh is the corridor's surface at `1611836`, sized from its own
> measured box, reveal measured on a production build at **118–135ms** against a recorded 167ms.
> This plan covers Stage B only and replaces the earlier three-stage plan entirely.

---

## Context

Carl, having seen the button in isolation: *"When the user makes a selection, the button fades in."*

That is the behaviour to restore. Today it cannot happen — **nothing in the corridor can be
selected**, so the button never fades in and Q4–Q1 are unreachable. That state is Carl's own
chunk-3 instruction (*"just remove the 5 cards that are there now and build"*, *"we do not need
to advance atm"*), not a regression.

### What exists, and what the gap actually is

**Three halves that already work, never connected to each other.** Stage B is mostly wiring.

| half | state | where |
|---|---|---|
| **Pointer targets that toggle** | ✅ `pointerdown` toggles `litCards`, filament heats; toggling off runs a real cool-down | `answer-card-canvas.tsx:3736-3770`, `useFilament` `:1835-1876` |
| **Selection state + the fade-in Carl wants** | ✅ `toggleOption` is complete; every gate keys off `selected.size > 0` | `enquiry-opening.tsx:1153-1163`, gates `:1363`, `:1406`, `:1408` |
| **The bridge between them** | ❌ **does not exist** — `litCards` never leaves the canvas; no selection callback | contract at `:3332-3336` |

The fade-in is already implemented and waiting: `enquiry-opening.tsx:1363` is
`opacity: selected.size > 0 ? 1 : 0` on a 600ms linear transition — **exactly what Carl
described.** Nothing writes to `selected`, so it never fires.

### ⚠ Three mismatches the wiring must resolve, not paper over

1. **Keyed by index vs keyed by string.** `litCards` is `boolean[]` by position; `selected` is a
   `Set<string>` of option text. The bridge maps index → `QUESTIONS[qNum].options[i]`, which means
   the canvas must be *told* its labels — it currently holds its own copy.
2. **`CARD_LABELS` is a hard-coded duplicate of Q5's answers** (`answer-card-canvas.tsx:792`). The
   file's own comment commits to deleting it: *"When the cards return as real controls they take
   their labels from the corridor as props, and this constant is deleted."*
3. **The hit targets are `aria-hidden` non-focusable divs, deliberately** (`:3725-3729`): *"a div
   with a pointer handler must not start impersonating a control in the accessibility tree."*
   **Making them selectable without roles and keyboard access would turn a documented safeguard
   into the exact defect it was written to prevent.**

---

## ⚠ THE STRUCTURAL QUESTION — a WebGL context per question step, and keying cannot avoid it

**This is the decision that should be made before any wiring. Architect's finding, verified.**

`renderPhrase` gives each question `key={`phrase-${qNum}`}` (`:1219`), and the grid lives inside
`enquiry-phrase-extras`, gated on `showExtras = isActive || (corridorMoving && depth === 1)`
(`:1216`). Therefore:

- **A canvas mounts and an old one is destroyed on EVERY question step, however the canvas is
  keyed.** The phrase structure already costs the context. *"Remount vs reset"* was a false choice
  I put to the Architect — a `resetLit` prop saves nothing.
- **At most two canvases exist, only during a corridor move.** No accumulation, no "five canvases"
  problem. That question was simply wrong.

⚠ **AND THIS IS THE Q5 STALL'S OWN MECHANISM, POINTED AT A NEW MOMENT.** WebGL context creation
inside an animating transition is the documented cause of the stall. The reveal measures 118–135ms
*because that happens once*. Stage B makes it happen **four more times, each inside the Q5→Q4
corridor move** — a different, untested moment.

**The question, and it is Carl's:**

> **Accept a context creation per question step and measure the transition, or take the shared-host
> restructure (D-046) now so the grid outlives the phrase?**

⚠ **MEASURE BEFORE CHOOSING.** The transition cost is unknown and this project does not choose
restructures on prediction. `verify/transition-cost.mjs` runs **first, on the current build**, to
establish what a corridor move costs today.

---

## B0 — SELECT ARITY: MULTI-SELECT ON EVERY QUESTION. Carl, 10 August 2026

Carl, asked how a single-select question should behave:

> *"When a single selection is made the next step button is made available. The user then can
> choose to select more answers or move on to the next section. If the user makes a single
> selection and changes their mind, the filament fades out, the button should too."*

**That is multi-select on all five questions**, with the button gated on *any* selection existing —
exactly what `selected.size > 0` already computes, and exactly what the filament's existing
heat/cool pair already renders.

⚠ **THIS SUPERSEDES D-018's "Q4 is single-select".**

- D-018 (1 June 2026) specified `role="radiogroup"` / `role="radio"` for Q4, rationale
  *"single-select reflects Q4 as a prioritisation question."*
- Its authority line reads **"ChatGPT / PM, based on Human Founder direction"** — the previous
  Architect seat, recording a decision on Carl's direction.
- ⚠ **IT CHANGES BECAUSE CARL HAS CHANGED IT, AND THAT IS THE WHOLE REASON.** He holds final
  authority (`CLAUDE.md` — Authority) and gave a direct, current instruction. **Do not look for a
  defect in the old record to justify this** — an earlier draft of this plan reached for the
  attribution as though a softer authority line were the argument. It is not, and that reasoning
  would licence overriding any inconvenient decision. A founder superseding his own earlier call
  is ordinary governance and needs no further warrant.
- **It also predates the WebGL rebuild** — 1 June, when the cards were CSS buttons, before D-028
  and the filament. Context for why it is revisited now, not grounds for the change.
- **`radiogroup` was never implemented**: a search of `components/` and `app/` returns nothing.
  The decision lived only in the record, so there is nothing to unwind in code.

**Consequence:** every card is `<button aria-pressed>`. No radio semantics anywhere.

---

## B0b — D-031's REFLECTION IS ALREADY DEAD, AND STAGE B IS WHEN IT SHOWS

**Architect's finding, verified. A governance matter, not a cleanup.**

`reflectionVars` / `q5ReflectionVars` (`enquiry-opening.tsx:272`, `:396`) still compute CSS custom
properties onto the button wrapper (`:1371`). Those vars feed the **painted** material's gradients
— and `globals.css:1260` now sets `background-image: none; background-color: transparent` under
`--mesh`.

⚠ **SO STAGE A SUPERSEDED AN APPROVED LAYER (D-031/D-032) WITHOUT RECORDING IT.** That is the
Builder's omission. Nobody noticed because `selected` is always empty, so both functions return
`{}` on every render. **Stage B is the change that makes them run for the first time — into a
surface that no longer exists.**

The mesh's equivalent of *"selected cards warm the button"* is amber on `NextStepCanvas`, currently
`0` and **parked by Carl's own instruction** (*"may or may not be implemented… I will return to
this"*). So the honest position: **the behaviour is currently unimplemented, not merely rewired.**

Recorded in decisions.md alongside the D-018 supersession. Disposition of the functions themselves
is Open Question 2.

---

## The approach

**Follow the pattern this repo already approved for exactly this problem.**
`contact-field-inputs.tsx` pairs real DOM controls with a WebGL surface: a **sibling** layer
(`:600-619`), `position: absolute; inset: 0`, `role="group"`, host `pointerEvents: "none"` with
controls opting in, positioned from **the same geometry module the mesh reads**. Its header states
the rules that make it work, including that `aria-hidden` belongs on the canvas wrapper *only*.

The canvas stays a surface; a sibling layer carries the controls.

### B1 — the canvas learns its labels and reports selection

`components/enquiry/answer-card-canvas.tsx`

- Add `labels?: string[]` and `onToggle?: (index: number) => void` to the contract (`:3332`).
- ⚠ **GUARD THE FIVE-OPTION ASSUMPTION.** All five questions carry exactly five options
  (`:226-242`) and `CARD_BOXES` has exactly five slots — **which is what makes the index→label
  bridge total, and nothing enforces it.** A sixth option would silently vanish: no card, no
  control, no error. A dev-time assert (or a typed 5-tuple) turns a silent disappearance into a
  loud one.
- Thread `labels` → `CardScene` (`:3684`) → the one call site at `:3234` (`label={labels?.[i]}`).
  **One consumer only.**
- **Delete `CARD_LABELS`** (`:792`), discharging the recorded debt.
- ⚠⚠ **PASS Q5's OPTIONS TO THE WARM-UP INSTANCE TOO** (`enquiry-opening.tsx:1671`). An earlier
  draft said it "passes no labels; `labelMap` is null-safe" — **that is the wrong test.** It will
  not crash; that was never the risk.

  Today `CARD_LABELS` is a module constant, so the warm-up instance **does** build label textures.
  After the change it would receive `undefined` and build none. **The warm-up exists to precompile
  the shaders the real cards use** — and a no-label material is a *different variant*. The
  precompile would silently stop covering what the entrance renders.

  ⚠ **THE FAILURE MODE IS A RETURNED STUTTER, ATTRIBUTED TO SOMETHING ELSE** — this project's most
  expensive class of bug. One line keeps the precompile honest.
- `litCards` stays internal and keeps owning the filament — `onToggle` fires *alongside* it, so the
  visual behaviour Carl approved is untouched.

### B2 — real controls, replacing the hover-only divs

`answer-card-canvas.tsx:3731-3771`

- The wrapper loses `aria-hidden`; each target becomes
  `<button type="button" aria-pressed={litCards[i]}>` with the option text as its accessible name
  (visually hidden — the visible text is a GPU texture).
- Keyboard falls out of using a real `<button>`: Enter/Space, focus ring, tab order.
- ⚠ **THE DOUBLE-FIRE MECHANISM, SPECIFIED RATHER THAN LEFT AS A REQUIREMENT.** A `<button>` with
  `onPointerDown` fires **both** `pointerdown` and `click` on every mouse press:

      onPointerDown  → toggle          (the pointer path; Carl's mouse-button trigger)
      onClick        → toggle ONLY if event.detail === 0

  **A synthesised click — keyboard Enter/Space — carries `detail === 0`; a real mouse click carries
  1 or more.** That is the discriminator, and it must carry this reason in the code or the next
  reader will "simplify" it away. `pointerdown` stays because Carl specified the mouse button and
  `click` fires on release (`:3742-3745`).
- ⚠ **Tab order must not contain cards that have not entered yet.** The entrance is staggered per
  card. Gate `tabIndex`/`aria-disabled` on entrance completion, as
  `contact-field-inputs.tsx:738-764` does — never `display: none`.
- ⚠ **THE FOCUS RING MUST BE DRAWN ON THE DOM CONTROL.** The cards' visible text is a GPU texture
  and the controls are transparent boxes over a canvas — **the mesh cannot show focus**, and
  nothing in the scene knows which card is focused. Precedent: the Next step button's
  `focus-visible:outline` (`enquiry-opening.tsx:1409`).

### B3 — the corridor wires it up

`components/enquiry/enquiry-opening.tsx`

- Render the canvas for **every** `qNum`, not `qNum === 5` (`:1352`).
- Pass `labels={QUESTIONS[qNum].options}` and
  `onToggle={(i) => toggleOption(QUESTIONS[qNum].options[i])}`.
- Remove the `eslint-disable` on `toggleOption` (`:1152`) — it has a caller now.
- ⚠ **`litCards` resets for free, and NOT because of anything this plan does.** `handleNextStep`
  already calls `setSelected(new Set())` (`:1173`), and the phrase's own `key` makes each question
  a distinct element — so the canvas unmounts and `litCards` goes with it. **An earlier draft
  proposed "key the canvas by question" as the mechanism; that was redundant** (see the structural
  question above — the phrase structure already remounts it). No reset protocol is needed, and no
  extra keying either.

---

## Files

| file | change |
|---|---|
| `components/enquiry/answer-card-canvas.tsx` | `labels` + `onToggle` props; delete `CARD_LABELS`; five-option guard; promote hit targets to real buttons (B2) |
| `components/enquiry/enquiry-opening.tsx` | render for all `qNum`; pass labels + onToggle; labels to the warm-up instance; un-disable `toggleOption` |
| `components/enquiry/enquiry-opening.tsx` (`:272`, `:396`, `:1371`) | ⚠ **`reflectionVars` / `q5ReflectionVars`** — dead since Stage A. **Disposition is Open Question 2.** Not to be silently left running |
| `components/enquiry/answer-card-mesh.tsx` | none expected — `label` already optional |
| `project-intelligence/decisions.md` | **new entry** superseding D-018 (B0) **and** recording D-031/D-032's reflection as unimplemented (B0b). Drafted in this chunk, approved by Carl |
| `verify/transition-cost.mjs` | **new** — Q5→Q4 frame cost. ⚠ Run on the CURRENT build first, as the control |
| `verify/corridor-walk.mjs` | **new** — walks Q5→Q1→completion by clicking real controls |

---

## Verification

- `npx tsc --noEmit` clean; `npm run lint` at the recorded baseline of **1**
- ⚠⚠ **`verify/transition-cost.mjs` FIRST, BEFORE ANY WIRING.** The Q5→Q4 move is where Stage B
  creates a context, and it is untested. Establish today's cost as a control, then measure again
  after. Production, interleaved, real GPU.
  ⚠ An earlier draft said *"reveal cost, five canvases mount instead of one"* — **that measured the
  wrong thing.** The reveal is not where the new cost lands, and there are never five canvases.
- **`verify/corridor-walk.mjs`** — the point of the chunk: select an answer, assert the button
  fades in, click through Q5→Q1, reach completion. Screenshot each question.
  ⚠ It must also assert the **inverse Carl specified**: deselect the last answer and the button
  fades back out. A walk that only ever adds selections never tests that path.
- **Keyboard-only pass — after commit 2 (B2)**: tab to a card, Space to select, tab to Next step,
  Enter. No mouse. ⚠ Expected to FAIL after commit 1; that is what commit 2 fixes.
- **Reveal cost, production build** — re-run as a control that Stage B has not disturbed the
  opening. ⚠ Dev-server numbers are worthless: the first Stage A attempt read 231ms with the mesh
  vs **269ms without**, indistinguishable. Production: 118–135ms against a recorded 167ms.
- ⚠ Kill any `next start` **by PID on the port** and confirm the port is free — a zombie server
  answered 200 while a newer build sat unserved during Stage A.
- ⚠ Run each new harness as a **no-change control** before trusting it.

---

## Order of work — Carl's call, 10 August 2026

**Two commits in this chunk:**

1. **B0 + B1 + B3 — selection wired, corridor walkable.** Carl sees the fade-in he described and
   can walk Q5→Q1 by mouse.
2. **B2 — the accessibility layer**, immediately after, as its own reviewable commit.

Carl chose *"same chunk, separate commit"*: B2 is the accessibility work and deserves to be judged
on its own rather than buried in a wiring change.

⚠ **B2 IS NOT OPTIONAL, ONLY SEPARABLE, AND THE CHUNK IS NOT DONE UNTIL IT LANDS.** The moment the
cards select they are controls, and `answer-card-mesh.tsx:1345-1349` already records that the
visible text being a texture makes a correct DOM label **mandatory at that point, not optional.**
Between the two commits the corridor is unusable by keyboard and unreadable by a screen reader —
acceptable for one step inside a chunk, not as a resting state.

---

## Open questions

1. **The structural question above** — accept a context creation per question step and measure, or
   take the shared-host restructure (D-046) now? **Carl's call, after the measurement.**
2. **D-031's disposition** — delete `reflectionVars` / `q5ReflectionVars`, or keep them as the
   marker for where amber returns?

**Answered and folded in, no longer open:** the D-018 supersession is recorded as a *new*
decisions.md entry rather than an edit to D-018 (Architect); select arity is multi-select
throughout (Carl); the B1+B3 / B2 split is two commits in one chunk (Carl).

**Withdrawn as mis-framed:** *remount vs reset* (keying is not what costs the context — the phrase
structure is); *five canvases or one* (at most two exist, only during a move); *`aria-pressed` vs
`role="checkbox"` by arity* (B0 removes the variation).
