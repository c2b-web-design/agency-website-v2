# Stage 2 — progress log (steps 1–3)

**14 August 2026. Branch `fix/q5-stall-and-label-colour`.**
Carl's decision: rebuild the never-unmounting shared canvas host, delete the separate warm-up
canvas, card canvas becomes the single context and the one that compiles early.

---

## ⚠⚠ WHICH THREAD IS THE THING YOU ARE MEASURING ACTUALLY ON?

**Recorded first because it is the most transferable lesson of the session, and it cost a
whole baseline.**

`requestAnimationFrame` frame gaps measure **main-thread scheduling**. That makes them:

- ❌ **THE WRONG INSTRUMENT FOR THE OPENING.** The opening's reveals are **CSS mask animations,
  which run on the compositor.** They stay smooth straight through a main-thread rAF gap. The
  Stage 2 baseline measured a **637ms median worst gap at ~+490ms** and Carl looked at exactly
  that moment and saw **nothing wrong** — heading, subtext and Begin all clean, Begin instantly
  clickable. **The number was real and described nothing a visitor experiences.**
- ✅ **THE RIGHT INSTRUMENT FOR THE REVEAL.** There the main thread is **idle** (2.3ms busy of
  210ms) and the **GPU process is saturated**, so a dropped frame really is a dropped frame —
  which is why `q5-stutter.mjs`'s worst-gap-in-reveal tracks the defect Carl can see.

⚠ **BEFORE REACHING FOR A FRAME-GAP NUMBER, ASK WHICH THREAD THE THING RUNS ON.** A compositor
animation and a main-thread stall need different instruments, and the same harness will lie
about one while telling the truth about the other.

**Consequence:** the opening rAF-gap metric is **withdrawn** as failure signal 2's instrument.
Failure signal 2 is now carried by `approved-timings.mjs --compare`, which reads real
`animationstart`/`animationend` events.

---

## Step 1 — baselines, captured on the CURRENT build before any edit

| Baseline | Result |
|---|---|
| `verify/out/approved-timings-baseline.json` | Re-saved for this branch. Current build was **within 17ms** of the 9 Aug approved record; internal gaps **−2/0/0/−1ms**. The 9 Aug original is backed up in the session scratchpad. |
| `verify/out/motion-stage2-before.json` | 153 frames, grid travels 435→493px |
| `verify/out/card-position/baseline-stage2-before-{1280,1440,1920}.json` | 5 cards each, rows 493..540 / 548..576 |

### Amendment C — ANSWERED: the page cannot scroll

`document.documentElement.scrollHeight === window.innerHeight` (900 vs 900), **before and after
Begin, every run, all widths.** ⚠ **So no scroll listener will be written.** An unexercised path
is worse than none — and note `answer-card-canvas.tsx:3842-3844` already *claims* a
"scroll/resize listener" while binding only `resize`.

### Amendment D — ANSWERED: no drawing-buffer resize at Begin

The card canvas is **already 576×104 (buffer 575×103) before Begin**. It does not change size,
so there is no reallocation of `renderTransmissionPass`'s target inside the reveal from a resize.

### Amendment B — the reduced-motion arm is already earning its place

    motion on    opening spans ~7840ms   Begin clickable late
    reduced      opening spans ~305-447ms

⚠ **Under reduced motion, Begin is clickable at +226ms while the warm-up compiles at ~2261ms.**
A reduced-motion visitor can press Begin **~2 seconds before the warm-up finishes**, so the toll
already lands on the cards for them. **Pre-existing — not caused by this work — but it means the
reduced-motion arm must stay on every check.**

---

## Step 2 — the position harness, falsified before it was trusted

**No screenshot-based card-position harness existed.** `cards-by-width.mjs:58-60` compares two
`getBoundingClientRect` calls, both of which move with the grid — **structurally blind to the
12 August failure**, and one of the three instruments that went green on the broken screen.

**RED run — injected `translateY(40px)`:**

    card 1  dx -2.8  dy 31.5   ⚠ OUT OF TOLERANCE
    card 2  dx  2.9  dy 31.9   ⚠
    card 3  dx -0.6  dy 32.3   ⚠
    card 4  dx  4.1  dy 39.8   ⚠
    card 5  dx -0.9  dy 40.0   ⚠
    worst deviation 40.0px    ⛔ POSITION CHANGED    exit 1

**Sensitivity, measured rather than assumed:**

| injected | measured | verdict |
|---|---|---|
| 40px | **40.0px** | ⛔ red |
| 6px | **6.0px** | ⛔ red |
| 3px | **3.0px** | ✅ green |
| 0 | **0.1px** | ✅ green |

It reports displacement **exactly**, and the ±4px tolerance (amendment E) behaves as specified.
A 230px failure would be caught ~57× over. The red screenshot was **looked at**, not just
scored — the cards are visibly displaced.

### ⚠ Two faults found in the harness itself

1. **It reported 2 cards, not 5.** The grid is **3+2, not one row** — found by looking at the
   screenshot, not by reasoning. Fixed by segmenting two rows.
2. ⚠⚠ **Worse: it printed "EXPECTED 5, FOUND 21" and SAVED THE BASELINE ANYWAY.** At 1440 an
   early shot caught the *question text* (21 letter-shaped blobs). **A harness that records a
   result it has already flagged as wrong makes the bad number the definition of "unchanged".**
   Now a hard exit, a 100px minimum blob width, and a 6000ms settle.

---

## Step 3 — the arming path is recorded by name, not inferred

**Source change:** `armOpening(source)` writes `performance.mark("opening-armed-by-<source>")`,
first write wins. Four sources: `compile`, `ready-gate`, `backstop`, `reduced-motion`.
All three wrapped call sites are explicit — ⚠ `setTimeout(armOpening, 0)` would have passed the
**timer id** as the source.

**Instrument change:** `verify/opening-arm.mjs` reads the mark. The inference classifier is gone.

### Falsified against all three paths — forced, not assumed

| forced path | NEW (recorded) | OLD (inference) |
|---|---|---|
| compile (ready gate delayed past it) | **compile** @ +2564ms ✅ | COMPILE ✅ |
| ready gate (default) | **ready-gate** @ +254ms ✅ | READY GATE ✅ |
| 4000ms ceiling | **backstop** @ +4228ms ✅ | BACKSTOP ✅ |
| reduced motion | **reduced-motion** @ +231ms ✅ | *(not classified at all)* |

### ⚠ WHERE THE OLD LOGIC IS WRONG — the two Stage 2 cases

Evaluated directly against the old classifier:

    Case A — a FAST compile arms the opening (what steps 4-5 create:
             the card canvas compiles early, in the first commit)
      armedAt +700ms, compile mark +700ms
      OLD says: READY GATE          ⛔ WRONG — it was the COMPILE
      NEW says: compile

    Case B — same, after step 5 deletes the warm-up canvas
      armedAt +1500ms, warmupCompiled ABSENT
      OLD says: neither cleanly     ⛔ cannot name it, the mark is gone
      NEW says: compile

**`armedAt < 900` was tested BEFORE the compile branch, and the COMPILE branch keyed off
`warmup-canvas-compiled` — a mark step 5 deletes.** Both failures are silent: a different page
reported as the expected one.

### ⚠ A finding about today's build, not about the instrument

**The ready gate wins on every normal run — 3/3, at +181–332ms — while the compile lands at
+1456–2356ms.** So "the compile arms the opening" is **already not true today**; the compile
path had to be *forced* by delaying `document.fonts.ready` past it. My first falsification run
asserted the wrong expectation and the instrument was right.

⚠ **This matters for step 5.** The plan assumed arming moves *from the warm-up's* `onCompiled`
*to the card canvas's*. In practice arming is usually the ready gate either way — so deleting
the warm-up may change the arming path **less** than expected. Watch the named mark rather than
assuming.

### Two bugs I introduced and fixed in the same step

- The per-run row printed `armed by undefined` — it read `d.armedBy` where `armedBy` is a local.
- The verdict tally summed only three categories, so a `REDUCED MOTION` or unnamed run would
  **vanish from the totals while still appearing in the rows.** Now counted, printed, and the
  sum is asserted.

### Choreography after step 3 — unchanged

    internal gaps   +0 / +0 / +0 / +1ms
    worst absolute drift                18ms (under two frames)
    ✅ NOTHING SHIFTED beyond 32ms

Gates: `npx tsc --noEmit` clean; `npm run lint` **1 problem (1 error, 0 warnings)** — the known
`enquiry-opening.tsx` reduced-motion baseline, untouched.

---

## Step 4 — the host is BUILT and positioning is PROVEN. Warm-up still in place.

**The host exists in the working tree.** `components/enquiry/enquiry-opening.tsx`:

- A `position: fixed` div, `data-testid="answer-card-host"`, **sibling of the shell** inside the
  untransformed `min-h-screen` container, mounted **unconditionally** (no `stage` gate).
- Its rect comes from `.enquiry-answer-grid` of the active question via a **callback ref**
  (`setActiveGrid`) plus a `ResizeObserver` — replacing the 12 August `MutationObserver` on the
  whole phrase band.
- `hostRect === null` → `visibility: hidden` at the constant 576×104. **This is the guard the
  12 August build promised and never implemented.**
- The canvas is **gone from inside the keyed phrase**; a tombstone marks the spot.
- `activeCardsVisible` (one expression, two consumers) gates the entrance, so cards compile
  during the opening but do not enter.

### ✅ Check 1 — POSITION, from screenshots, three widths

| width | worst deviation | verdict |
|---|---:|---|
| 1280 | **0.5px** | ✅ |
| 1440 | **0.5px** | ✅ |
| 1920 | **0.5px** | ✅ |

`dx = 0` on every card at every width. Secondary assertion (cards below the phrase) passes.

### ✅ Check 8 — the containing block

    offsetParent: null (viewport)   position: fixed

⚠ **This is the assertion that catches an invisible regression.** If anyone adds `transform`,
`filter`, `contain` or `will-change` to any ancestor, `offsetParent` stops being null and the
cards move — with nothing in the DOM looking wrong.

### ⚠⚠ A FAULT IN MY OWN HARNESS, CAUGHT BY THE FIRST RUN — and it nearly inverted the verdict

The first Check-1 run reported **card 4 out of tolerance at +4.1px, at all three widths**, and
**exit 1 — POSITION CHANGED**.

**It was wrong.** Card 4's x-extent was `529..716` in the baseline AND with the host —
**byte-identical, not moved by one pixel.** The harness weighted its centroid by *luminance*,
and card 4's right half measured **107.5 mean against its left half's 103.4**, dragging the
"centroid" 4.1px right.

⚠ **A POSITION HARNESS THAT WEIGHTS BY BRIGHTNESS CONFLATES LIGHTING WITH POSITION.** The
travelling spotlight makes per-card brightness vary *by design*, so this would misreport on any
build. **It would have reported a regression that did not exist — the mirror image of the
12 August failure, and just as wrong.**

**Fixed:** centres are now the **geometric midpoint of the thresholded blob**, still found in
the image, with no DOM rect consulted anywhere. Baselines were **recaptured on the pre-change
build** (host stashed, rebuilt, re-measured, restored) and the corrected harness was
**re-falsified: red at 40.0px, green at 0.0px.**

⚠ **The reason this was caught is that the number was looked at, not just the verdict.** A
4.1px "failure" on exactly one card at exactly three widths is a signal, not noise.

### Still outstanding for step 4

Not yet measured: one-context-across-five-questions, check 5 (ladder), check 6 (corridor
motion), the arming path by name **with the host present**, the opening measured across this
step, and the reduced-motion arm of each. **These are the next actions.**

---

## State

- **Modified:** `components/enquiry/enquiry-opening.tsx` (armOpening source + the host),
  `verify/opening-arm.mjs` (read the name), `verify/out/approved-timings-baseline.json`.
- **Added:** `verify/card-position.mjs` (the screenshot position harness).
- **The warm-up canvas is UNTOUCHED and still mounts.** Deleting it is step 5, deliberately
  separate so the host and the deletion are independently attributable.
- Gates: `tsc --noEmit` clean; `npm run lint` **1 problem (1 error, 0 warnings)** — the known
  `enquiry-opening.tsx` reduced-motion baseline, untouched.

*Verification is not approval. Carl's eye decides.*
