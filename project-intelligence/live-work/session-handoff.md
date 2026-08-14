# Session Handoff — 14 August 2026 (Step 4: the cards are UNCLICKABLE; z-index found by measurement)

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

# ⛔⛔ THE HOST BUILD SHIPS A DEAD PAGE. A VISITOR CANNOT ANSWER A QUESTION.

**Branch `fix/q5-stall-and-label-colour`, head `66fda24`. Working tree: 3 new harnesses,
UNTRACKED. NO SOURCE FILE HAS BEEN EDITED.**

`1e031cd` renders all five cards in exactly the right place — **position 0.5px at three widths,
containing block verified, both checks right to pass** — and **not one card can receive a pointer
event.** The walk cannot start.

    ⛔ THE DEFECT      .enquiry-answer-grid paints ON TOP of the cards and eats every click
    ✅ THE CAUSE       PAINT ORDER, not pointer-events. Measured, not reasoned.
    ✅ THE FIX         z-index: 1 on the host. NOT YET APPLIED — Carl's call.
    ⛔ THE BLOCKER     mid-corridor cannot be fixed by ANY z-index. See below.

**Two live-work files carry the detail. Read both before touching anything:**
- `live-work/q5-step4-pointer-events-defect.md` — the defect, attribution, 4 scenarios
- `live-work/q5-step4-paint-order-conflict.md` — the approved order, the sweep, the conflict

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session
length, not a suggestion to stop or resume later. **Carl decides when a session ends and will
say so.** It was not broken this session.

---

## WHAT CARL INSTRUCTED, AND WHERE EACH PART STANDS

Carl, this session: *"Do not pick a z-index by eye. Reproduce the paint order the canvas already
had."* Five numbered instructions:

| # | instruction | state |
|---|---|---|
| 1 | Record the approved paint order on `f0ff41e` | ✅ **DONE** — 336 samples on disk |
| 2 | Find the z-index that reproduces it | ✅ **DONE** — `z-index: 1`, 288/336 points |
| 3 | If ONE value works: apply + screenshot-diff | ⛔ **N/A — no single value works** |
| 4 | If NO value works: **stop**, name the conflict | ✅ **THIS IS THE ROUTE TAKEN** |
| 5 | Write `verify/card-interaction.mjs`, falsify first | ✅ **DONE, fully falsified** |
| — | Falsify `one-context.mjs`, then use it | ✅ **DONE — check 1 PASSES 2/2** |

⚠ **Route 4 was taken, so nothing was applied and nothing was screenshotted.** That is the
instruction being followed, not work left undone.

---

## 1. THE APPROVED PAINT ORDER — captured, on disk

`verify/out/paint-order/pre-host.json` — **21 moments x 16 probe points = 336 samples**, from
`f0ff41e`, production `:3100`, 1440x900.

    at-rest / card-selected / next-visible / post-corridor
        CARD-HIT > .enquiry-answer-grid > .enquiry-phrase-extras
    mid-corridor
        CARD-HIT                          ← alone; the grid has moved away

⚠ **There is NO memory-rail element.** The "memory" is the receding phrase stack
(`.enquiry-pdepth-1/2/3`) at y≈345-436 — **above the card band at y=493, never overlapping it.**
My first sampler reported "memory elements: 0"; that was a wrong selector, confirmed against the
DOM rather than assumed.

## 2. THE SWEEP

| host z-index | identical | changed | what still differs |
|---|---:|---:|---|
| none (control) | 84/336 | **252** | everything except mid-corridor |
| **1** | 288/336 | **48** | **mid-corridor only** |
| 2 | 288/336 | 48 | identical to z=1 |
| 3 | 288/336 | 48 | identical to z=1 |

**z = 1, 2, 3 are byte-identical. `1` is sufficient; there is no evidence for anything larger,
and a larger number would be picking by eye.**

## ⛔ 3. THE CONFLICT — mid-corridor, and NO z-index can fix it

All 48 remaining differences: `was: CARD-HIT` → `now: (empty)`. **Pre-host the cards were on
screen during the move; the host build's cards are not.**

Measured through the move — **the context SURVIVES, this is a visibility question:**

| moment | host | canvas | hits | rect | visibility |
|---|---|---|---|---|---|
| at rest | mounted | 575x103 | 5 | 432,493 | **visible** |
| +150→+900ms | mounted | 575x103 | 5 | **0,0** | **hidden** |
| +1400ms | mounted | 575x103 | 5 | 432,493 | **visible** |

**Two causes, both by design:** `activeCardsVisible = !corridorMoving && …`
(`enquiry-opening.tsx:1688`), and `hostRect → null → visibility:hidden` because the active
phrase is not rendered while `corridorMoving` so `setActiveGrid` detaches.

⚠⚠ **`z-index` orders things that are PAINTED. Nothing is painted here.** The old nesting gave
the cards a mid-move presence by being a CHILD of the receding phrase — inheriting its motion for
free. A `fixed` host outside the shell has nothing to inherit from.

### THE DECISION CARL FACES

- **A.** Accept it — cards vanish ~900ms x 4 per walk. ⚠ **A visible change to approved corridor
  motion (D-046).** A regression unless Carl accepts it.
- **B.** Give the host a mid-move rect from the OUTGOING grid (it exists, moves 493→480).
  ⚠ **Re-opens the hand-driven easing D-046 warned about** — the thing the restructure exists to
  avoid.
- **C.** Something Carl sees that I do not.

**I am not choosing between these. That trade is Carl's.**

---

## THE THREE NEW HARNESSES — all falsified, all UNTRACKED

    verify/paint-order.mjs        records + diffs the full elementsFromPoint stack
    verify/card-interaction.mjs   ⚠ THE ONE THAT WAS MISSING — clickability
    verify/one-context.mjs        check 1: one context across five questions

### ✅ CHECK 1 PASSES — 2/2 runs, one context across all five questions

    creation marks 2 → 2 (no growth)   host context lost: 0   same element at Q1: yes

⚠ **`verify/card-interaction.mjs` is the harness whose absence let a dead page pass everything.**
It uses a **real `.click()`**, not `dispatchEvent` — every other walk harness in `verify/` uses
`dispatchEvent`, **which bypasses hit-testing and is exactly why none of them caught this.**
Falsified three ways: ⛔ on the real defect, ⛔ on an injected overlay, **✅ green with
`z-index:1` (4/4 walk, all five cards, all five questions).**

---

## ⚠⚠ FOUR INSTRUMENT FAULTS FOUND IN MY OWN HARNESSES THIS SESSION

**Every one was caught by reading the OUTPUT, never by the exit code.** This is the session's
transferable lesson and it cost four separate corrections.

1. **`paint-order.mjs` anchored only to `.enquiry-answer-grid` — which does not exist
   mid-corridor.** It sampled the outgoing copy at a different position, printed the page root,
   and **exited 0 with meaningless samples.** Now samples a FIXED band as well.
2. **`one-context.mjs` counted `card-canvas-created` — a mark the host build never emits.**
   The host's canvas marks itself **`warmup-canvas-created`**, because the name is chosen by
   `warm && !active` (`answer-card-canvas.tsx:4091`) and `active` is false during the opening.
   It read **0 on a live context.**
3. **`webglcontextlost` DOES NOT BUBBLE.** A window capture listener saw nothing through a real
   `loseContext()`. The witness printed a reassuring `✅ never torn down` **and could not have
   reported a teardown.** Now patched onto each canvas via `getContext`.
4. ⚠⚠ **THE WORST: that listener then reported `lost=5` on a build whose host context was never
   lost.** The events belonged to the **separate warm-up canvas**. I nearly wrote up "the context
   is destroyed every corridor move" as a finding. **Checked independently with a plain listener
   and no patch: `sameEl: true, isContextLost(): false`, one event, on a non-host canvas.**
   **The witness was measuring a real thing and attributing it to the wrong object.**

⚠ **The harness's own "THE WITNESSES DISAGREE" rule is what caught #4.** Three witnesses that
must agree, with disagreement printed rather than resolved in favour of the expectation.

---

## ⚠ TWO FACTS ABOUT THE BUILD, FOUND EN ROUTE

1. **TWO card-sized canvases exist before Begin** — the host's AND the separate warm-up, both
   575x103, both compiling. **This is the duplicate step 5 deletes.** Confirms the plan.
2. **The host's canvas mislabels itself as the warm-up** in `performance.mark` (fault 2 above).
   ⚠ **This will confuse step 5's before/after comparison**, which reads exactly these mark
   names. Deleting the warm-up leaves the host still marking itself `warmup-canvas-created`.
   **Decide how to handle that BEFORE running step 5's measurement.**

---

## THE SIX OUTSTANDING STEP-4 CHECKS

    ✅ 1. One context serving ALL FIVE questions        PASSES 2/2 (verify/one-context.mjs)
    ⏳ 2. Check 5 — the ladder, gaps AND absolute, reported SEPARATELY
    ⏳ 3. Check 6 — corridor motion vs motion-stage2-before.json
    ⏳ 4. The arming path BY NAME, with the host present
    ⏳ 5. The OPENING measured across this step
    ⏳ 6. The reduced-motion arm of each of the above

⚠ **2-6 are ALL blocked behind Carl's mid-corridor decision** — they measure motion and timing
through a walk that currently cannot be performed by a real user, and the fix will change what
they measure. **Do not run them against the current build and record the numbers as a baseline.**

---

## STATE

- **Working tree:** 3 untracked harnesses. **`enquiry-opening.tsx` is UNTOUCHED.**
- Gates: `npx tsc --noEmit` **clean**. Lint not re-run — no source changed.
- Baseline on disk: `verify/out/paint-order/pre-host.json`.
- **Ports: production build of the HOST commit on `:3100`.** ⚠ The build directory currently
  holds the host build; the pre-host baseline is already captured, so no rebuild is needed to
  proceed.
- Scratch copies at the repo root: **none left** (checked).

---

## THE STEPS AFTER (unchanged from the previous handoff)

5. **Delete the warm-up canvas** — separate, measured. ⚠ `mount → compiled` near ~1350ms is
   EXPECTED; **~106ms is the SUSPICIOUS number.** ⚠ See "two facts" above re: mark names.
6. Amend `decisions.md:1501` — the warm-up need not be a second context; the mechanism is NOT
   the disk cache (53ms with, **0ms** without).
7. Final run log; pause for Carl's eye.

*14 August 2026. ⚠⚠ **THE PAGE IS DEAD AND THE FIX IS ONE PROPERTY, BUT MID-CORRIDOR NEEDS
CARL'S DECISION FIRST — route 4 of his own instruction. Nothing has been applied.***
