# Plan — Stage B: restore selection, so the corridor can be walked

**Author:** Builder, 10 August 2026
**For:** Carl, then the Architect (`handoff-protocol.md` §2.5)
**Branch:** `fix/q5-stall-and-label-colour` @ `e077689`
**Status:** revised twice. The Architect's **second** review is folded in below.

> ⚠ **CITE SYMBOLS, NOT LINE NUMBERS.** An earlier revision carried references from `1611836`
> under a `30c3ca7` header, and the tree had already moved ~25 lines beneath them — the
> `qNum === 5` gate cited at line 1352 was at 1377. **Any line number in this file is a hint that
> decays; the symbol name is the durable reference.** This project already omits line numbers from
> the lint baseline for exactly this reason (`CLAUDE.md`).

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
| **Selection state + the fade-in Carl wants** | ✅ `toggleOption` is complete; the button wrapper, its `tabIndex` and the mesh's `active` all gate on `selected.size > 0` | `enquiry-opening.tsx` — `toggleOption`, and the wrapper around `NextStepMeshButton` |
| **The bridge between them** | ❌ **does not exist** — `litCards` never leaves the canvas; no selection callback | `AnswerCardCanvas`'s prop contract |

The fade-in is already implemented and waiting: the button's wrapper is
`opacity: selected.size > 0 ? 1 : 0` on a 600ms linear transition — **exactly what Carl
described.** Nothing writes to `selected`, so it never fires.

### ⚠ Four mismatches the wiring must resolve, not paper over

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
4. ⚠⚠ **`litCards` AND `selected` DIVERGE DURING THE CORRIDOR MOVE — and it is a lie told to a
   screen reader, not a cosmetic drift.** Architect's finding, verified on disk.

   `handleNextStep` calls `setSelected(new Set())` **immediately**, but `showExtras =
   isActive || (corridorMoving && depth === 1)` keeps the **outgoing** phrase's grid rendered
   through the whole move, with its `litCards` intact until unmount. So for the length of that
   transition the old question's cards would report **`aria-pressed="true"` on a question already
   answered and left**.

   ⚠ **THIS IS MISMATCH 1's CLASS, NOT A NEW ONE**: two sources of truth for the same fact, keyed
   differently. `litCards` is canvas-local and positional; `selected` is the application's
   selection truth and is keyed by option string.

   **It must be a decision in the plan, not an emergent property.** Two options — derive
   `aria-pressed` from `selected` (one truth, canvas keeps `litCards` purely as filament state), or
   derive `selected` from `litCards` (one truth, but the canvas becomes the owner of application
   state). **Recommendation: the former** — the filament is a visual effect with its own lifetime
   including a cool-down, and it should not become the application's memory. See B2.

---

## ⚠ THE STRUCTURAL QUESTION — a WebGL context per question step, and keying cannot avoid it

**This is the decision that should be made before any wiring. Architect's finding, verified.**

`renderPhrase` gives each question `key={`phrase-${qNum}`}`, and the grid lives inside
`enquiry-phrase-extras`, gated on `showExtras = isActive || (corridorMoving && depth === 1)`.
Therefore:

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

⚠ **MEASURE BEFORE CHOOSING.** This project does not choose restructures on prediction.

### ⚠⚠ THE CONTROL CANNOT BE TAKEN ON THE CURRENT BUILD — corrected 10 August 2026

**An earlier revision made "run `transition-cost.mjs` first, on the current build" the plan's first
action. That action is not available, and the Architect was right to call it blocking.**

**There is no corridor move on the current build.** `handleNextStep` is reachable only through the
Next step button, which is `pointer-events: none` / `tabIndex: -1` whenever `selected` is empty —
which is always. A harness can force it with a programmatic `.click()`, and I did.

**What that measurement is and is not** — I ran it, so this is a correction to my own reported
number, not a hypothetical:

- ✅ **The transition itself is real.** `handleNextStep` runs the same
  `setCorridorMoving` → `setActiveQ` sequence however it is invoked.
- ⚠ **But the control ran with `selected` empty, and the real path never is.** `answersSnap` is
  `Array.from(selected).join(" • ")` — with nothing selected the memory chip renders **empty**, so
  the real move does work mine did not.

**Both arms shared the flaw, so the delta (+126ms) is defensible and neither absolute is.** The
65ms control is a **floor**, not "what a corridor move costs today".

**The sequencing that produces an honest control, and it fails safe:**

| step | what | why |
|---|---|---|
| **1a** | B1 + B3 wiring, **`qNum === 5` retained** | selection works, the button fades in, the corridor advances into a Q4 with an empty grid. **A real move on a real path, no canvas on the far side — this is the control.** |
| — | **measure** | |
| **1b** | remove the `qNum === 5` gate | same move, canvas both sides. **This is the arm.** |

The delta is then context creation and nothing else. ⚠ **And if the delta is bad you stop at 1a
with a corridor that already walks** — which is the outcome Carl asked for either way.

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

## B0b — ✅ DONE. The dead reflection layer is deleted (`c426c5f`, `e077689`, D-047)

**No longer a plan item. Kept because Stage B would otherwise re-encounter it, and because how it
was found matters more than what it was.**

The Architect found that `reflectionVars` / `q5ReflectionVars` were still computing CSS custom
properties into the button's wrapper — feeding the **painted** material's gradients, which
`.enquiry-nextstep-btn--mesh` had already cleared with `background-image: none`.

⚠ **STAGE A SUPERSEDED AN APPROVED LAYER (D-030/D-031/D-032) WITHOUT RECORDING IT** — the Builder's
omission. It stayed invisible because `selected` is always empty, so both functions returned `{}`
on every render. **Stage B is the change that would have made them run for the first time, into a
surface that no longer exists.**

**Deleted on Carl's instruction** — *"amber might not return, delete."* Recorded as **D-047**.

⚠⚠ **AND THE FIRST DELETION WAS HALF A DELETION**, which the Architect correctly called the worst
of both outcomes: `c426c5f` removed the JS and left 219 lines of painted cabochon CSS
(`.enquiry-nextstep-btn--q5proto`) under a `transparent` override — dead weight that still read as
authoritative. Completed in `e077689`, together with a false sentence in `decisions.md` asserting
the system *"is unchanged and continues to govern `.enquiry-nextstep-btn`"*.

**The lesson Stage B should carry:** `decisions.md` named that layer as *one thing* — functions,
constants, CSS block. **Decide a layer all at once; what survives a partial deletion reads as
deliberate.**

If amber returns it returns as light — `AmberSource` on `NextStepCanvas`, currently `0` and parked
— **not as gradients on a painted button.**

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
  and `CARD_BOXES` has exactly five slots — **which is what makes the index→label
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
- `litCards` stays internal and keeps owning **the filament and nothing else** — `onToggle` fires
  *alongside* it, so the visual behaviour Carl approved is untouched. ⚠ **But it is no longer the
  source of truth for "is this selected"** — see mismatch 4 and B2. It is a visual effect with its
  own lifetime, including a cool-down that outlives the selection.

### B2 — real controls, replacing the hover-only divs

`answer-card-canvas.tsx:3731-3771`

- The wrapper loses `aria-hidden`; each target becomes a real `<button type="button">` with the
  option text as its accessible name (visually hidden — the visible text is a GPU texture).
- ⚠⚠ **`aria-pressed` COMES FROM `selected`, NOT FROM `litCards`** — mismatch 4 above. The canvas
  must be told which options are selected (a `selectedIndices` prop, or `labels` plus the corridor's
  `selected`) rather than reporting its own filament state. **`litCards` stays what it is: a visual
  effect with its own lifetime, including a cool-down that outlives the selection.** A surface's
  animation state is not the application's answer to "is this pressed".
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

- ⚠ **THE `qNum === 5` GATE STAYS IN 1a AND IS REMOVED IN 1b.** That split is the whole measurement
  design — see the corrected sequencing above. Removing it in 1a would destroy the control.
- Pass `labels={QUESTIONS[qNum].options}` and an `onToggle` mapping index → option string.
- ⚠⚠ **`onToggle` MUST BE `useCallback`-STABLE, KEYED ON `qNum`.** Architect's finding. Written
  inline it is a **new closure on every render** — and `toggleOption` writes `selected`, which
  re-renders the corridor, which re-renders `AnswerCardCanvas`. That component is a plain export
  with no `memo`, **and this happens on the same frame as the filament heat Carl approved.**

  ⚠ **THE PRECEDENT IS IN THAT FILE ALREADY**: `onCompiled` and `onEntranceStart` sit in effect
  dependency arrays, which is the demonstration that unstable callbacks matter here — an unstable
  one would re-fire those effects. **None of this happens today, because nothing writes to
  `selected`.** Stage B is what makes it possible.
- **Verification must include a click-cost check** — frame cost at the moment of selection, not
  only at the transition.
- Remove the `@typescript-eslint/no-unused-vars` disable above `toggleOption` — it has a caller now.
- ⚠ **`litCards` resets for free, and NOT because of anything this plan does.** `handleNextStep`
  already calls `setSelected(new Set())`, and the phrase's own `key` makes each question
  a distinct element — so the canvas unmounts and `litCards` goes with it. **An earlier draft
  proposed "key the canvas by question" as the mechanism; that was redundant** (see the structural
  question above — the phrase structure already remounts it). No reset protocol is needed, and no
  extra keying either.

---

## Files

| file | change |
|---|---|
| file | change | step |
|---|---|---|
| `answer-card-canvas.tsx` | `labels` + `onToggle` + `selectedIndices` props; delete `CARD_LABELS`; five-option guard | 1a |
| `enquiry-opening.tsx` | pass labels + a `useCallback`-stable `onToggle`; labels to the **warm-up** instance too; un-disable `toggleOption` | 1a |
| `enquiry-opening.tsx` | remove the `qNum === 5` gate | **1b only** |
| `answer-card-canvas.tsx` | promote hit targets to real `<button>`s; `aria-pressed` from `selected`; focus ring; entrance-gated `tabIndex` | B2 |
| `answer-card-mesh.tsx` | none expected — `label` already optional | — |
| `verify/transition-cost.mjs` | ✅ **exists** (`c426c5f`). ⚠ Its header records that its current numbers are a floor, not a product measurement — re-run against 1a/1b | 1a→1b |
| `verify/corridor-walk.mjs` | **new** — walks Q5→Q1→completion, and asserts the button fades back **out** on deselect | 1a |
| `project-intelligence/decisions.md` | ✅ **D-047 written** (`e077689`) — supersedes D-018 and records the reflection deletion | done |

---

## Verification

- `npx tsc --noEmit` clean; `npm run lint` at the recorded baseline of **1**
- ⚠⚠ **`verify/transition-cost.mjs` AFTER 1a, NOT BEFORE THE WIRING.** See the corrected
  sequencing above: there is no reachable corridor move until selection exists, so the control has
  to be taken on 1a (real move, no canvas on the far side) and the arm on 1b. Production, real GPU.
  ⚠ Two earlier drafts got this wrong in different ways — one said *"reveal cost, five canvases
  mount instead of one"* (**wrong window, and there are never five canvases**), the next said *"run
  it first on the current build"* (**no such move exists**).
- **Click cost** — frame cost at the moment of selection, since `onToggle` re-renders the corridor
  and the canvas on the same frame as the filament heat. New, and it belongs with 1a.
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

**Three commits, and the split of the first one is what makes the measurement honest:**

1. **1a — B0 + B1 + B3 wiring, `qNum === 5` RETAINED.** Selection works, the button fades in, the
   corridor advances into a Q4 with an empty grid. **Carl sees the fade-in he described**, and this
   is the measurement control. ⚠ Q4–Q1 have no cards yet; that is expected, not a defect.
2. **1b — remove the `qNum === 5` gate**, after measuring 1a. Cards at every question. ⚠ **If the
   transition delta is bad, STOP HERE AND DO NOT SHIP 1b** — 1a is a corridor that already walks,
   and the structural question then goes to Carl with a real number behind it.
3. **B2 — the accessibility layer**, as its own reviewable commit.

Carl chose *"same chunk, separate commit"*: B2 is the accessibility work and deserves to be judged
on its own rather than buried in a wiring change.

⚠ **B2 IS NOT OPTIONAL, ONLY SEPARABLE, AND THE CHUNK IS NOT DONE UNTIL IT LANDS.** The moment the
cards select they are controls, and `answer-card-mesh.tsx` already records that the visible text
being a texture makes a correct DOM label **mandatory at that point, not optional.** Between the
commits the corridor is unusable by keyboard and unreadable by a screen reader — acceptable for one
step inside a chunk, not as a resting state.

---

## Open questions

**One remains.**

1. **The structural question** — accept a WebGL context creation per question step, or take the
   shared-host restructure (D-046) so the grid outlives the phrase? ⚠ **Carl's call, and it should
   be taken on the 1a/1b delta rather than on the +126ms already measured, which came from a forced
   path with `selected` empty.** If the delta is bad, stop at 1a: a corridor that walks, with a real
   number to take the restructure on.

**Answered, and already executed:**

- **D-031/D-032's reflection** — deleted, Carl: *"amber might not return, delete."* D-047 written.
- **D-018's single-select** — superseded by multi-select throughout, Carl.
- **The D-018 record** — a *new* decisions.md entry, not an edit to D-018 (Architect).
- **The B1+B3 / B2 split** — same chunk, separate commits (Carl); now three, because the
  measurement needs 1a and 1b apart.

**Withdrawn as mis-framed:** *remount vs reset* (keying is not what costs the context — the phrase
structure is); *five canvases or one* (at most two exist, only during a move); *`aria-pressed` vs
`role="checkbox"` by arity* (B0 removes the variation).

---

## ⚠ How this plan has gone wrong, twice — read before executing it

Both revisions were caught by review, not by the plan checking itself:

1. **It cited a viewport gate that had been removed on 7 August**, because three stale comments in
   `enquiry-opening.tsx` still asserted it. Fixing those found a fourth and then a **fifth** — the
   fifth *half* true, which is why it survived two sweeps.
2. **It made its own first action impossible** — "measure the corridor move on the current build",
   when no reachable corridor move exists.

⚠ **THE COMMON SHAPE: the plan asserted things about the code that were true when someone wrote
them down and false when they were read.** The same class as the seven instrument failures recorded
on 9–10 August. **Verify each claim against the code at execution time, not against this file.**
