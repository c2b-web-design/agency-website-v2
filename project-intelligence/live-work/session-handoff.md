# Session Handoff — 14 August 2026 (Stage 2: the shared host is built, positioning proven)

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session
length, not a suggestion to stop or resume later. **Carl decides when a session ends and will
say so.** It was not broken this session.

---

## WHERE THE WORK IS

**Branch `fix/q5-stall-and-label-colour`.** Stage 2 steps 1–3 are complete. **Step 4 is
part-done: the host is BUILT and positioning is PROVEN; the remaining step-4 measurements are
outstanding.** The warm-up canvas is **untouched and still mounts** — deleting it is step 5.

Full detail: **`live-work/q5-stage2-progress-14-august.md`** — read it before acting.

### The plan being executed

Carl's decision: **rebuild the never-unmounting shared canvas host with correct positioning,
delete the separate warm-up canvas, the card canvas becomes the single context and the one that
compiles early.** Steps run in order and **must not be collapsed**; stop and report after each
of steps 1, 2 and 4.

---

## ✅ AMENDMENTS A, C, D — RESOLVED, DO NOT RE-OPEN

**A. `mayCompile` does NOT depend on `openingArmed`. There is no deadlock.**
Chain: `mayCompile={warm}` ← `warm` prop ← a literal at the warm-up site, **not passed at all**
at the card site (defaults `true`). `openingArmed` occurs once in `answer-card-canvas.tsx` and
it is **prose in a comment**. The dependency runs one way: compile → arming.
⚠ **RULE: `warm` must never be derived from `openingArmed`.** If it ever is, the 4000ms ceiling
fires and **masks the deadlock as a merely late-starting opening.**

**C. The page CANNOT scroll — so no scroll listener was written.**
`scrollHeight === innerHeight` (900 vs 900), before and after Begin, every run, all widths.
An unexercised path is worse than none. (`answer-card-canvas.tsx:3842-3844` already *claims* a
"scroll/resize listener" while binding only `resize`.) If it ever becomes scrollable, sample in
the render loop's rAF — do not add a listener.

**D. No drawing-buffer resize at Begin.** The card canvas is **already 576×104 (buffer 575×103)
before Begin**, so there is no `renderTransmissionPass` target reallocation from a size change.

---

## ⚠⚠ FAILURE SIGNAL 1 IS INVERTED — THE READY GATE ARMS THE OPENING, NOT THE COMPILE

**Measured, 3/3 runs: the ready gate arms at +181–332ms while the compile lands at
+1456–2356ms.** The compile path had to be *forced* (by delaying `document.fonts.ready` past it)
to be tested at all.

⚠ **So "the compile arms the opening" is ALREADY UNTRUE on today's build.** The plan assumed
arming moves from the warm-up's `onCompiled` to the card canvas's at step 5.

⚠⚠ **THEREFORE ARMING SHOULD *NOT* MOVE ACROSS STEP 5. If it moves, that is UNEXPECTED — report
it, do not fit it to the prediction.** Watch the named mark; do not infer.

---

## ⚠⚠ THE 637ms OPENING-GAP METRIC IS WITHDRAWN — AND THE LESSON GENERALISES

The Stage 2 baseline measured a **637ms median worst frame gap at ~+490ms** in the opening.
**Carl watched exactly that moment and saw nothing:** *"the text reveals as it should… No
visible defect, stall or stutter. The subtext is also good as is the begin button and is
instantly clickable."*

⚠ **`requestAnimationFrame` GAPS MEASURE MAIN-THREAD SCHEDULING.** So they are:

- ❌ **wrong for the OPENING** — its reveals are **CSS mask animations that run on the
  compositor** and stay smooth straight through a main-thread rAF gap.
- ✅ **right for the REVEAL** — there the main thread is **idle** (2.3ms of 210ms) and the **GPU
  process is saturated**, so a dropped frame really is dropped.

**⚠ BEFORE REACHING FOR A FRAME-GAP NUMBER, ASK WHICH THREAD THE THING RUNS ON.**

**Failure signal 2 is now `approved-timings.mjs --compare`**, which reads real
`animationstart`/`animationend` events.

---

## BASELINES ON DISK — captured on the PRE-CHANGE build

    verify/out/approved-timings-baseline.json          ladder + opening rhythm
    verify/out/motion-stage2-before.json               153 frames, grid 435→493px
    verify/out/card-position/baseline-stage2-before-1280.json
    verify/out/card-position/baseline-stage2-before-1440.json
    verify/out/card-position/baseline-stage2-before-1920.json

⚠ **The card-position baselines were RECAPTURED** after the harness's metric was corrected (see
the standing rules below). They are geometric, not brightness-weighted.
⚠ The **9 August** approved-timings baseline was overwritten by `--save`; a copy exists only in
the session scratchpad. The current file is this branch's own pre-change state, which measured
**within 17ms** of the 9 August record with internal gaps **−2/0/0/−1ms**.

**Position harness sensitivity floor, measured: RED at 6px, GREEN at 3px** (tolerance ±4px).
Exact readings: 40px→40.0, 6px→6.0, 3px→3.0, 0→0.0.

---

## ⚠ REDUCED MOTION — A SEPARATE, PRE-EXISTING DEFECT. NOT THIS PLAN'S JOB.

    motion on   opening spans ~7840ms
    reduced     opening spans ~305-447ms

**Begin is clickable at +226ms while the warm-up compiles at ~2261ms** — a reduced-motion
visitor can press Begin **~2 seconds before the warm-up finishes**, so the toll already lands on
the cards for them.

⚠ **Recorded, not fixed. It is not caused by this work and must not be silently absorbed into
it.** The reduced-motion arm nevertheless stays on every check, because every harness in this
repo has historically run with motion ON — *that is how the hover teal silently never arrived
for reduced-motion users.*

---

## ⚠⚠ STANDING HARNESS RULES — EARNED THIS SESSION, FOUR SEPARATE INCIDENTS

1. **No instrument writes a baseline it has flagged as suspect.** `card-position.mjs` printed
   `EXPECTED 5 CARDS, FOUND 21` and **saved the baseline anyway.** A harness that records a
   result it has already identified as wrong makes the bad number the definition of
   "unchanged". It now hard-exits.
2. **Every new harness must be proven to go RED before it is trusted GREEN** — all of them, not
   just the position one. An instrument that has never failed has not been tested.
3. **Read the SCRIPT's exit code, not `grep`'s.** `node x.mjs | grep …; echo $?` reports grep's
   status; a genuine failure was reported as `EXIT 0` because of this. Redirect to a file and
   read `$?` directly.
4. ⚠ **A position harness must measure GEOMETRY, not LIGHT.** `card-position.mjs` weighted its
   centroid by luminance and reported **card 4 out of tolerance at +4.1px at all three widths**
   — while that card's x-extent was **byte-identical to baseline (529..716)**. The travelling
   spotlight varies per-card brightness *by design*. **It would have reported a regression that
   did not exist — the mirror image of the 12 August failure.** Now geometric midpoints,
   baselines recaptured, re-falsified red 40.0 / green 0.0.

---

## WHAT IS IN THE WORKING TREE (uncommitted at handoff time)

    M components/enquiry/enquiry-opening.tsx    armOpening(source) + THE HOST
    M verify/opening-arm.mjs                    reads the arming name, no inference
    M verify/out/approved-timings-baseline.json
    ?? verify/card-position.mjs                 the screenshot position harness

⚠ A copy of the host WIP is also at `scratchpad/enquiry-opening-HOST-WIP.tsx`.

### The host, as built

- `position: fixed` div, `data-testid="answer-card-host"`, **sibling of the shell** inside the
  untransformed `min-h-screen` container, mounted **unconditionally** (no `stage` gate).
  ⚠ **Both shells carry `transform: translateY(...)`, and a transformed ancestor becomes the
  containing block for `position: fixed`** — that is why it must not live inside the shell.
- Rect from `.enquiry-answer-grid` of the active question via a **callback ref**
  (`setActiveGrid`) + `ResizeObserver`, replacing the 12 August `MutationObserver`.
- `hostRect === null` → `visibility: hidden` at the constant 576×104. **This is the guard the
  12 August build promised and never implemented.**
- The canvas is **gone from inside the keyed phrase**; a tombstone marks the spot.
- `activeCardsVisible` (one expression, two consumers) gates the entrance, so the cards compile
  during the opening but do not enter.

### Step 4 results so far

    ✅ Check 1  POSITION  0.5px worst at 1280 / 1440 / 1920, dx=0 on every card
    ✅ Check 8  offsetParent === null (viewport), position: fixed

### Step 4 — STILL OUTSTANDING

- One context address serving all five questions
- Check 5 ladder (internal gaps AND absolute, reported separately)
- Check 6 corridor motion
- The arming path **by name**, with the host present
- **The opening measured across this step** — the card canvas now compiles inside the window the
  opening is already running in. ⚠ **Do not infer this is harmless: four recorded lead-time
  attempts each stuttered whatever was animating at the time.**
- Reduced-motion arm on each of the above that supports it

**Then STOP for Carl's eye before step 5.**

---

## THE STEPS AFTER

5. **Delete the warm-up canvas** — a separate measured change, deliberately not bundled with the
   host so the two are independently attributable.
   ⚠⚠ **`mount → compiled` near ~1350ms is the EXPECTED result, not a failure** — the card
   canvas is then first in the process and pays the first-context toll. **~106ms is the
   SUSPICIOUS number**, meaning something else went first; find out what.
6. Amend `decisions.md:1501` — *"the warm-up must not be deleted"* → what Stage 1 established:
   **something must compile early; it need not be a second context; and the mechanism is NOT the
   disk cache** (53ms with the warm-up, **0ms** without — 1353 vs 1351).
7. Final run log; pause for Carl's eye.

---

## HOUSEKEEPING

- **Kill servers by PID and confirm the port free** — `TaskStop` has reported success on a held
  port. Production build on **:3100** for all measurement.
- Harnesses need `node_modules`, so scratch copies (`cp.mjs`, `af.mjs`, `bo.mjs`) get created at
  the repo root during runs. **Delete them after**; one may still be present.
- Ports 3000/3100 free at the end of this session.

---

*14 August 2026. **The host is built and positions to 0.5px at three widths; the warm-up is
still in place, deliberately.** The remaining step-4 measurements are the next job, then Carl's
eye before the deletion.*
