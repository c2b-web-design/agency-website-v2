# ⛔ STEP 4 DEFECT — THE HOST MADE THE ANSWER CARDS UNCLICKABLE

**14 August 2026. Branch `fix/q5-stall-and-label-colour`, head `66fda24` (host commit `1e031cd`).**
**Found while building check 1 (one context across five questions). Not yet fixed.**

---

## THE FINDING

**A visitor cannot select an answer.** The five card hit targets receive no pointer events on
the host build. This is not a test-harness problem; it is the shipped behaviour of `1e031cd`.

Measured with `document.elementFromPoint()` at the centre of card 0, production build (`:3100`),
1440x900, entrance settled (6200ms after Begin):

| | pre-host `f0ff41e` | with host `1e031cd` |
|---|---|---|
| hover target rect | 432, 493, 187x48 | 432, 493, 187x48 — **identical** |
| `.enquiry-answer-grid` rect | 432, 493, 576x104 | 432, 493, 576x104 — **identical** |
| hit target inside the phrase grid | **yes** | **no** |
| hit target inside the host | n/a | **yes** |
| `elementFromPoint` at card centre | **`answer-card-hover-0`** ✅ | **`.enquiry-answer-grid`** ⛔ |
| computed `pointer-events` on host | n/a | **`none`** |
| computed `pointer-events` on target | `auto` | `auto` (inherited `none` wins) |

⚠ **THE GEOMETRY IS BYTE-IDENTICAL ACROSS THE TWO BUILDS.** That is why check 1 (position, 0.5px
at three widths) and check 8 (containing block) both passed and were right to pass. **The cards
render in exactly the correct place and cannot be clicked.**

---

## THE CAUSE — ⚠ IT IS PAINT ORDER, **NOT** `pointer-events`

**Measured, four scenarios (below). The cause is `z-index`, and the `pointer-events: none` chain
is a red herring.**

The hit targets are **children of `AnswerCardCanvas`** — `answer-card-canvas.tsx:4147`, an
`aria-hidden` wrapper of `position: absolute; inset: 0` holding
`data-testid="answer-card-hover-{i}"` divs with `onPointerEnter` / `onPointerDown`. **When the
canvas moved into the host, the hit targets moved with it.**

**The host is a `position: fixed` sibling that appears BEFORE the shell in DOM order, and both
sit at `z-index: auto`.** So the shell's contents paint on top of the host. Measured stack at
card 0's centre, topmost first:

    DIV  enquiry-answer-grid      pe=auto  z=auto  pos=relative   ← takes the hit
    DIV  enquiry-phrase-extras    pe=auto  z=auto  pos=absolute
    DIV  answer-card-hover-0      pe=auto  z=auto  pos=absolute   ← never reached
    DIV  min-h-screen …           pe=auto  z=auto  pos=static

⚠ **`.enquiry-answer-grid` is the element that receives the click**: it stays in the phrase at
the identical rect, deliberately, "so the canvas has a box to size against"
(`enquiry-opening.tsx:1478-1479`). Empty, `pointer-events: auto`, exactly on top. A perfect click
sponge.

### ⚠⚠ THE CORRECTION — my first reading of this was WRONG, and the probe caught it

The ancestor chain does carry `pointer-events: none` at **three** levels (host,
`.answer-card-proto`, and the unnamed wrapper), which looks like the obvious cause:

    DIV  answer-card-hover-0   pe=auto   ← the target re-enables itself
    DIV  (unnamed wrapper)     pe=none
    DIV  answer-card-proto     pe=none
    DIV  answer-card-host      pe=none

**It is not the cause.** A descendant's `pointer-events: auto` **does** override an ancestor's
`none` — that is how the property is specified — and the targets already set `auto`. Clearing all
three `none`s changes nothing (scenario B). Raising `z-index` alone fixes it completely with
every `none` left in place (scenario D).

⚠ **I asserted the inheritance cause after reading the computed styles and before testing it.**
The styles were read correctly and the conclusion drawn from them was still wrong. **`pe=none` on
an ancestor is not evidence that a descendant is unreachable** — only `elementFromPoint` is.

### The host's comment is stale, but not for the reason it first appeared

`enquiry-opening.tsx:1735-1737`, repeated at `1881-1883`:

> *"⚠ `pointer-events: none`. The DOM hit targets live in the phrase's own grid; a full-width
> transparent host over the corridor would swallow them."*

**Two claims, both now false, and neither one is what broke the cards:**

- *"The DOM hit targets live in the phrase's own grid"* — they do not; they moved with the canvas
  (measured `inGrid: false`, `inHost: true`).
- *"a full-width transparent host"* — the host is **576x104 in a 1440px viewport**, sized to the
  grid, not full width (measured). The corridor-swallowing hazard the `none` guards against **may
  no longer exist at all.**

⚠ **The `none` is nevertheless harmless and should stay unless separately justified** — removing
it is not required by this fix, and scenario D shows the fix works with it untouched.

---

## ⚠ WHY EVERY INSTRUMENT MISSED IT — the same shape as 12 August

**No harness in `verify/` asserts that a card can be clicked.** They assert position, colour,
timing, motion, compile cost. The walk harnesses (`active-grid-fixed.mjs`, `compile-by-question.mjs`,
`walk-cost.mjs` …) DO click cards — and would have crashed — but every one of them either
defaults to `:3100` with no server running, or had not been run against this commit.

⚠⚠ **THE HOST COMMIT WAS MEASURED BY TWO CHECKS THAT CANNOT SEE INTERACTION, AND BOTH PASSED.**
This is 12 August's failure with the polarity flipped: then, the geometry was wrong and three
instruments said fine; now the geometry is perfect and the page is dead. **A green position
verdict says nothing about whether the thing is usable.**

**The lesson for the remaining checks:** the six outstanding step-4 checks are all timing and
motion. **None of them would catch this either.** Interaction needs its own assertion.

---

## WHAT IS NOT YET KNOWN

- **Whether hover works.** `onPointerEnter` is on the same dead subtree, so the hover teal and
  the filament almost certainly do not fire either — but that is inference, and it must be
  measured, not assumed. ⚠ Note the standing precedent: the hover teal silently never arrived
  for reduced-motion users and nobody noticed for weeks.
- **Whether the Next step button is affected.** It is outside the host; expected fine, unverified.
- **Keyboard access.** The targets are `aria-hidden` divs with no roles, so there was never a
  keyboard path through them; this defect does not change that, but it means there is no
  fallback route to answering.

---

## THE FIX — MEASURED, FOUR SCENARIOS. ⚠ NOT YET APPLIED; CARL'S CALL.

Runtime patches on the built page (`:3100`, 1440x900, entrance settled). Each scenario re-tested
all five targets with `elementFromPoint`, then fired a real `pointerdown` on card 2.

| | scenario | result |
|---|---|---|
| A | as shipped (control) | ⛔ all five BLOCKED by `.enquiry-answer-grid` |
| B | clear `pointer-events:none` on host + proto + wrapper | ⛔ **all five still BLOCKED** |
| C | B **+** `z-index` on the host | ✅ all five OK, selection registers |
| D | **`z-index` on the host ONLY**, every `none` left as shipped | ✅ **all five OK, selection registers** |

**D is the recommendation: a single `zIndex` on the host div.** It is the smallest change, it
leaves the `pointer-events: none` corridor guard entirely intact, and B proves the `none` chain
was never the blocker.

⚠ **WHAT MUST BE CHECKED BEFORE IT IS BELIEVED — a z-index raise moves the cards in the paint
order, and this is an APPROVED VISUAL LAYER.** The probe used `z-index: 5` arbitrarily. Before
applying:

1. **What must the cards paint UNDER?** The memory rail, the Next step button, the corridor's
   receding phrases. A value that clears the grid may also lift the cards over something they
   are meant to sit behind. **This is a visual question and Carl's eye decides it, not a probe.**
2. **The receding phrase during a corridor move.** The outgoing copy at depth 1 renders while
   `corridorMoving`; the cards must not jump in front of it mid-move.
3. ~~**Whether `.enquiry-answer-grid` should instead get `pointer-events: none`.**~~ ⛔ **TESTED
   AND IT FAILS.** Scenario E: silencing the grid exposes the NEXT layer in the stack,
   `.enquiry-phrase-extras`, and all five cards stay blocked. **It is a stack of overlapping
   layers, not a single sponge**, so this route means silencing each one in turn and re-opens the
   question every time a layer is added. Recorded so it is not proposed again.

### ✅ SCENARIO D CONFIRMED END-TO-END

Re-run with a full corridor walk: `z-index: 5` on the host → all five reachable, **4/4 steps
walked, Q5 → Q1, arriving at Q1.** The whole enquiry is traversable with this one property.

⚠ **The value 5 is arbitrary and unreviewed.** It is what proved the mechanism, not a
recommendation of that number.

---

## STATE

- `verify/one-context.mjs` — **written, NOT yet falsified, NOT yet trusted.** It crashed on the
  card click, which is how this was found. It carries the `:3000` refusal guard.
- Check 1 (one context across five questions) is **BLOCKED**: the walk cannot proceed past the
  first question until a card can be clicked.
- Ports: production build on `:3100`. **⚠ The server currently running is the PRE-HOST build
  `f0ff41e`** from the attribution test — it must be rebuilt before any further measurement.
- The working tree is restored to `66fda24` + `verify/one-context.mjs` untracked.

*Verification is not approval. Carl's eye decides — and this one needs his decision on the fix
before the remaining step-4 checks can run.*
