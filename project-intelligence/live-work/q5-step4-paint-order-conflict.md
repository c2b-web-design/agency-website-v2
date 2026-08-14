# PAINT ORDER — ONE Z-INDEX FIXES 4 OF 5 MOMENTS. THE FIFTH IS NOT A Z-INDEX PROBLEM.

**14 August 2026. Branch `fix/q5-stall-and-label-colour`, head `66fda24` (host commit `1e031cd`).**
**Route 4 of Carl's instruction: NO single value works. Stopping for Carl's decision.**

Carl's instruction: *"Do not pick a z-index by eye. Reproduce the paint order the canvas already
had."* — and *"If NO single value works, stop. That means the old nesting gave a paint order that
cannot be expressed from outside the shell — name the specific conflict and Carl decides."*

---

## 1. THE APPROVED ORDER, CAPTURED ON `f0ff41e` (pre-host)

`verify/paint-order.mjs --save pre-host` → `verify/out/paint-order/pre-host.json`
**21 moments x 16 probe points = 336 samples.** Production build, `:3100`, 1440x900.

Moments: `at-rest`, `card-selected`, `next-visible`, `mid-corridor` (+300ms into the 900ms move),
`post-corridor` — at every question Q5→Q1.

**The approved order is the same everywhere:**

    at rest / selected / next-visible / post-corridor
        CARD-HIT > .enquiry-answer-grid > .enquiry-phrase-extras

    mid-corridor
        CARD-HIT                              ← alone; the grid has moved away

⚠ **There is no memory-rail element.** The "memory" is the receding phrase stack
(`.enquiry-pdepth-1/2/3`) at y≈345–436, **above the card band at y=493. It never overlaps the
cards.** My first sampler counted "memory elements: 0" and that was a wrong selector, not a
missing feature — checked against the DOM rather than assumed.

---

## 2. THE SWEEP ON THE HOST BUILD

`verify/paint-order.mjs --compare pre-host [--z N]`

| host z-index | probe points identical | changed | which moments still differ |
|---|---:|---:|---|
| **none (control)** | 84 / 336 | **252** | everything except mid-corridor |
| **1** | 288 / 336 | **48** | **mid-corridor only, all 4 moves** |
| **2** | 288 / 336 | **48** | mid-corridor only — **identical to z=1** |
| **3** | 288 / 336 | **48** | mid-corridor only — **identical to z=1** |

**The control proves the instrument sees the defect:** 252 points changed, each one reading

    was: CARD-HIT > .enquiry-answer-grid > .enquiry-phrase-extras
    now: .enquiry-answer-grid > .enquiry-phrase-extras > CARD-HIT

— the cards demoted from first to third. **That is the whole of the unclickability defect,
stated as data.**

⚠ **z = 1, 2 and 3 give byte-identical results.** The value does not matter beyond "greater than
auto"; **1 is sufficient and there is no evidence for any larger number.** Any bigger value would
be picking by eye, which is what Carl forbade.

---

## ⛔ 3. THE CONFLICT — MID-CORRIDOR, AND IT IS NOT ABOUT PAINT ORDER

All 48 remaining differences are the same thing, at all four corridor moves:

    Q5|mid-corridor @fix-card0    was: CARD-HIT
                                  now: (empty — NOTHING is painted at the card band)

**The pre-host cards were ON SCREEN during the move. The host build's cards are NOT.**

### The mechanism, measured through the move (not inferred)

| moment | host mounted | canvas | hit targets | host rect | visibility |
|---|---|---|---|---|---|
| at rest | yes | 575x103 | 5 | 432,493 576x104 | **visible** |
| +150ms | yes | 575x103 | 5 | **0,0** 576x104 | **hidden** |
| +300ms | yes | 575x103 | 5 | **0,0** | **hidden** |
| +600ms | yes | 575x103 | 5 | **0,0** | **hidden** |
| +900ms | yes | 575x103 | 5 | **0,0** | **hidden** |
| +1400ms | yes | 575x103 | 5 | 432,493 576x104 | **visible** |

✅ **THE CONTEXT SURVIVES THE MOVE** — the host stays mounted, the canvas stays alive at 575x103,
all five hit targets persist. **The restructure's core claim is intact.** This is a visibility
question, not a teardown.

**Two independent causes, both by design, and neither is `z-index`:**

1. **`activeCardsVisible = !corridorMoving && …`** (`enquiry-opening.tsx:1688`) withholds the
   cards' entrance during the move.
2. **`hostRect` goes null → `visibility: hidden` at rect 0,0** (`enquiry-opening.tsx:1744-1748`).
   The rect comes from `.enquiry-answer-grid` of the ACTIVE phrase via `setActiveGrid`; the
   active phrase is **not rendered at all while `corridorMoving`** (`phraseList`,
   `enquiry-opening.tsx:1689-1691`), so the callback ref detaches and the documented null-guard
   fires. **The guard is working exactly as written.**

### ⚠ WHY NO Z-INDEX CAN FIX THIS

**`z-index` orders things that are painted. Nothing is painted here.** The cards are
`visibility: hidden` at `0,0` — there is no stacking question to answer. This is the conflict
Carl's route 4 anticipated: **the old nesting gave the cards a mid-move presence that came from
being a CHILD of the receding phrase** — they inherited its recede motion, its position and its
travel for free. A `position: fixed` host outside the shell has no phrase to inherit from, and
during the move there is no active grid to measure.

---

## THE DECISION CARL FACES

**The z-index half is settled: `z-index: 1` on the host, and nothing larger.** It reproduces the
approved order at 288/336 points — every at-rest, selected, next-visible and post-corridor moment
at all five questions. ⚠ **Not yet applied — no source edit has been made.**

**The mid-corridor half is a design question, not a measurement:**

- **A.** Accept it. The cards disappear for ~900ms during each of the 4 moves and reappear. ⚠ This
  is a **visible change to approved motion** — D-046's *"the corridors movement is important,
  there is easing in there too"*. **Four times per walk.** It needs Carl's eye, and the honest
  framing is that it is a regression against the approved corridor unless he accepts it.
- **B.** Give the host a mid-move rect so the cards travel with the receding phrase — measure the
  OUTGOING grid at depth 1 while `corridorMoving` (it exists and moves: 493 → 480 at +300ms,
  measured). ⚠ This re-opens exactly the hazard D-046 named: *"lift the canvas out and the easing
  becomes a hand-driven animation matching `bottom 900ms cubic-bezier(0.37, 0, 0.63, 1)`"* —
  the thing `active-grid-fixed.mjs` was written to prove unnecessary. **It would be reproducing
  easing by hand, which is what the whole restructure was designed to avoid.**
- **C.** Something else Carl sees that I do not.

⚠ **I am not choosing between these.** A is cheap and changes approved motion; B is faithful and
re-introduces the hand-driven easing the restructure exists to avoid. **That trade is Carl's.**

---

## STATE

- `verify/paint-order.mjs` — **NEW.** Records and diffs the full `elementsFromPoint` stack at 16
  points x 21 moments. Carries the `:3000` refusal guard. **Proven to go RED** (252-point control
  failure) before any green was trusted.
  ⚠ **A fault in it was found and fixed by reading its OUTPUT, not its exit code**: the first
  baseline anchored only to `.enquiry-answer-grid`, which **does not exist mid-corridor** — it
  sampled the outgoing copy at a different position and printed the page root, **exiting 0 with
  meaningless samples.** It now samples a FIXED band (captured once at rest, where the fixed host
  paints) as well as the live grid.
- `verify/out/paint-order/pre-host.json` — the approved baseline, on `f0ff41e`.
- **No source file has been edited.** `enquiry-opening.tsx` is untouched.
- Still outstanding: `verify/card-interaction.mjs` (instruction 5), falsifying `one-context.mjs`,
  and the six step-4 checks.
- Server: host build on `:3100`.

*Verification is not approval. Carl's eye decides.*
