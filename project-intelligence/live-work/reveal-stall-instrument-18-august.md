# The reveal stall instrument — BUILT, FALSIFIED, AND THE FIRST DISTRIBUTION

**18 August 2026.** Carl's authorisation lifted `reveal-instrument-spec-16-august.md`
from SPEC ONLY. **Instrument only — no fix attempted, no attribution drawn.**

---

## WHAT LANDED

| File | What it is |
|---|---|
| `verify/reveal-stall.mjs` | Films N runs of Q5's reveal, one build, one session |
| `verify/reveal-stall-measure.mjs` | Reads the freeze out of the films, reports the distribution |

**No product code changed.** The one source edit is a **comment correction** in
`enquiry-opening.tsx` — verified comment-only by diff. `tsc` clean; `npm run lint`
**1 problem (1 error, 0 warnings)**, the known reduced-motion baseline, untouched.

---

## ⚠⚠⚠ THE FINDING — ABOVE THE MEDIAN, AND IT INVALIDATES TWO WEEKS OF MEASUREMENT

> ## **THE FREEZE VARIES 40ms TO 640ms ON ONE BUILD, IN ONE SESSION, ON ONE MACHINE,
> ## WITH NOTHING CHANGED BETWEEN RUNS. A 16x SPREAD.**

**The median is 200ms. ⚠ THE MEDIAN IS NOT THE FINDING — THE SPREAD IS.**

### ⚠⚠ WHAT THIS DOES TO EVERY FIGURE ON THE RECORD

**Every prior measurement of this defect is a single run or three cold samples.**
Against a 16x run-to-run spread, **none of them can carry the weight placed on it:**

| Figure | Date | Basis | Status against the spread |
|---|---|---|---|
| ~720ms | 14 Aug | **one run** | within the distribution; not distinguishable from any other draw |
| ~400ms | 16 Aug | **one run** | same |
| 626ms | 10 Aug | **one run** | same |
| 81/80/119/117/294/303ms | 13 Aug | **three cold samples per arm** | ⚠ **see below — NOT SAFE** |

⚠ **A SINGLE RUN ON THIS BUILD COULD HAVE RETURNED 40ms OR 640ms.** Any two single
runs can differ by 16x with no cause but chance.

### ⛔⛔ THE 13 AUGUST BISECT IS **NOT SAFE**. MARKED, NOT REWRITTEN.

`q5-stall-bisect-13-august.md` ran **three cold samples per arm** and read a
staircase off the result.

⚠⚠ **THREE SAMPLES PER ARM CANNOT DISTINGUISH AN ARM THAT RAISES THE STALL FROM ONE
THAT DOES NOT, AGAINST A 16x SPREAD.** The arms' reported figures (81/80, 119/117,
294/303) sit comfortably inside the range a single unchanged build produces.

**The staircase may well be real. THE EVIDENCE CANNOT CARRY IT.** That is a statement
about the sample size, not about the conclusion.

⚠ **SUPERSEDED IN PLACE — NOT REWRITTEN, NOT DELETED.** The file stands; this is the
correction forward. **Anyone citing the bisect must cite this alongside it.**

### ⚠ THE 10-vs-13 AUGUST CONTRADICTION HAS A SECOND CANDIDATE EXPLANATION

The disagreement about the hover work was attributed to a **mixed-tree artefact**.
⚠ **That guess was never tested, and it is now ONE OF TWO candidates** — the other
being that the two readings are simply **two draws from this distribution.**

**Neither is established. Recorded as open.**

### ⚠⚠ THE RULE THIS ESTABLISHES

> **ANY FUTURE CLAIM ABOUT THIS STALL'S MAGNITUDE NEEDS A DISTRIBUTION, NOT A NUMBER.**
> **Eight runs is the working floor established here.** A lower median on fewer runs
> is not a result.

---

## ⚠⚠ THE HEADLINE — 8 RUNS, ONE BUILD, ONE SESSION

**Build `k7Q61m8UeH9ePHlCjZ6if`, production `:3100`, 1440x900,
ANGLE (AMD Radeon(TM) Graphics, D3D11).**

```
  run   freeze         at frame        reveal window     ink at freeze
  ────  ─────────────  ──────────────  ────────────────  ─────────────
   1     40ms  ( 2f)   f254  10.16s    f251-f284  1320ms      396
   2    120ms  ( 4f)   f252  10.08s    f250-f282  1280ms      395
   3    200ms  ( 6f)   f258  10.32s    f255-f288  1320ms      398
   4    200ms  ( 6f)   f258  10.32s    f255-f288  1320ms      398
   5    240ms  ( 7f)   f259  10.36s    f257-f290  1320ms      396
   6    240ms  ( 7f)   f258  10.32s    f256-f289  1320ms      368
   7    240ms  ( 7f)   f259  10.36s    f256-f289  1320ms      398
   8    200ms  ( 6f)   f260  10.40s    f258-f291  1320ms      395

  per run   40  120  200  200  200  240  240  240  ms
  MEDIAN    200ms       RANGE 40-240ms       SPREAD 200ms
  ⛔ FREEZE PRESENT IN 7/8 RUNS
```

### ⚠ TWO INDEPENDENT CONFIRMATIONS THAT THIS IS THE RIGHT WINDOW

1. **Every reveal window measures 1280–1320ms against the declared 1300ms**
   (`globals.css:1315`). The harness never reads that number — it finds the window
   from the film's own content — and lands on it eight times out of eight.
2. **The ink at every freeze is ~396**, and frames at that value were opened and
   read: they show **`Q5 Wh`** — static, mid-word, inside the first word.
   ⚠ **That is the exact signature the 14 and 16 August films record.**

### ⚠ AN EARLIER SIX-RUN BATCH, ON THE SAME BUILD, RAN WIDER

```
  per run   80  80  200  200  200  640  ms      median 200ms   range 80-640ms
```

⚠ **Same build, same session, same machine — a 640ms run and an 80ms run.** The
640ms freeze was validated by eye (f260 and f273 both `Q5 Wh`; f280 resumed). The
median agreed at 200ms across both batches; **the tails did not.**

---

## ⚠⚠ WHAT THIS SETTLES — AND WHAT IT REFUSES TO SETTLE

### SETTLED: the ~720ms and ~400ms figures cannot carry a claim of improvement

`q5-reveal-stall-reobserved-16-august.md` says twice that its ~400ms and the 14
August ~720ms are not comparable, and asks for repeated runs on one build in one
session before the magnitude is trusted. **That has now been done, and it vindicates
the refusal.**

⚠ **A SINGLE RUN ON THIS BUILD COULD HAVE RETURNED 40ms OR 640ms — a 16x span, with
NOTHING CHANGED BETWEEN THEM.** Both figures under comparison are single runs. **The
run-to-run spread on one build is wide enough to produce either of them by chance.**

⚠⚠ **SO "720 → 400 IS AN IMPROVEMENT" IS NOT MERELY UNPROVEN — IT IS UNPROVABLE FROM
SINGLE RUNS.** Any future claim about the stall's magnitude needs a distribution or
it means nothing. **That is the instrument's main contribution.**

### NOT SETTLED — deliberately

- ⛔ **NO ATTRIBUTION.** Nothing here says why the freeze happens. Out of scope.
- **Whether the median moves under any fix** — that is what the instrument is *for*,
  and it has only ever been run against today's build.
- **Whether 8 runs is enough.** The distribution is not obviously normal (four runs
  cluster at 200–240ms, one sits at 40ms). **Reported as measured, not modelled.**

---

## THE CHANNEL, AND WHY IT IS NOT A COMPUTED-STYLE POLLER

**Stated before building, as the brief required.**

| Channel | Thread | Sees a GPU-side presentation freeze? |
|---|---|---|
| `getComputedStyle().clipPath` | MAIN — the animation's *intent* | ❌ no |
| `Animation.currentTime` | MAIN — clock | ❌ no |
| **video track** (`recordVideo`) | **OUT-OF-PROCESS** | ✅ **yes** |

The reveal is `clip-path`, which **Chromium does not composite** — it is main-thread
animated. ⚠ **But the defect is not on the main thread.** A CDP trace names it
`CommandBuffer::Flush` / `GpuChannel::ExecuteDeferredRequest`, ~164ms in four blocks,
**renderer idle**; Stage 1 measured the main thread at **2.3ms busy of 210ms** while
the GPU saturated. **The style advances smoothly while the GPU fails to present.**

⚠ **A computed-style poller would have repeated `extras-hold-position.mjs` exactly** —
asserting the channel that stays healthy and saying nothing about the one that fails.

⚠ **NO SCREENSHOT-PER-SAMPLE.** ~84ms/capture on the animation's own thread.

---

## ⚠⚠ THE DETECTION METHOD — AND WHY IT BEATS THE BYTE PLATEAU

**Decoded PIXELS, compared with a measured tolerance.** ffmpeg crops the question
row and emits lossless 8-bit greyscale PNGs; node's own `zlib` decodes them.

### ⚠ Both recorded traps were reproduced and MEASURED on this film

**Trap 1 — hashing.** Frames f201–f208 have **eight different MD5s** and byte sizes
ranging **2930–2993**, while their **decoded pixels differ by EXACTLY ZERO.** A hash
check calls all eight "changed". ⚠ **The 15 August record's warning is confirmed
directly, not merely repeated.**

**Trap 2 — the byte plateau under-reports.** Same cause: the encoder writes different
bytes for an identical screen, so a size plateau ends before the stall does. **The
pixel channel is subject to neither.**

### The threshold was measured, not typed

```
  671 frame pairs, run-01, this build:
    exactly-zero changed pixels ...... 626 pairs   <- the static screen
    non-zero ......................... 45 pairs    <- min 1, median 200, max 4190
```

⚠ **THE TWO CLUSTERS DO NOT OVERLAP — static frames score EXACTLY 0, not "small".**

⚠ **MY FIRST TYPED GUESS WAS `NOISE_PIXELS = 400` AND IT WAS BADLY WRONG.** It would
have classified genuine text motion (real pairs at 108, 200, 316) as static and so
reported freezes **longer** than they are. **Plausible, and only measuring showed it
was not.** Now 8.

---

## ⚠⚠ THREE WRONG VERSIONS OF THE WINDOW. ALL THREE RECORDED.

**Every one produced a confident number. None was caught by the number.**

| # | The idea | What it reported | Why it was wrong |
|---|---|---|---|
| 1 | Bracket first-to-last moving frame | **5040ms freeze** | Spanned the opening, Begin, the reveal *and* the settled question after it |
| 2 | "Ink reaches its plateau" | **5040ms again** | Settled ink **drifts ±2** (2337→2339) from decode noise, so "stops climbing" never became true |
| 3 | "Last frame below 25% of settled" | **0ms — CLEAN** | ⚠⚠ The frozen band **is not empty** — it holds `Q5 Wh` at ink ~397. **The window began after the freeze and excluded the thing it exists to measure.** |

⚠⚠ **VERSION 3 IS THE DANGEROUS ONE. IT REPORTED A CLEAN REVEAL ON A FILM WHOSE
FREEZE IS PLAINLY VISIBLE.** Had the brief not demanded a RED on today's build, it
would have shipped as "the stall is gone."

⚠ **ALL THREE WERE CAUGHT THE SAME WAY: BY EXTRACTING THE FRAMES AND LOOKING AT
THEM.** Not one was caught by inspecting the output.

### And a fourth, before any of those — THE CROP

The first crop ran `y 430-550`, 120px tall, which **swallowed the card grid at
y~490-600**. The cards, spotlight and filament animate continuously, so **every frame
would have shown motion and the harness would have reported NO FREEZE on a frozen
reveal.** Caught by extracting one frame and looking at it. The crop is now
`420x46 @ 530,437` — the question row alone.

### What the band actually contains — measured, and it is why the anchor is what it is

```
  f000-f185   ink 0        empty
  f186-f200   ink 0→2860   ⚠ THE OPENING'S OWN SUBTEXT wipes through this same band
  f200-f249   ink 2860     sitting
  f250        ink ~396     Begin clears it; "Q5 Wh" appears
  f256-f280   ink 397→2337 ⚠ Q5'S REVEAL — the one under test
  f281+       ink 2337±2   settled
```

⚠ **A HARNESS TAKING THE FIRST INK RISE MEASURES THE OPENING, NOT Q5** — the same
shape as the recorded failure where a 2500ms capture filmed the opening and concluded
the stall was gone.

⚠ **AND `Math.max` IS THE WRONG "SETTLED":** the opening's subtext is **brighter than
Q5** (2860 vs 2337), so a max-anchored window never resolves. Settled is the film's
**last frame**.

**The anchor is the HANDOVER DROP** — the frame where ink collapses (2860 → 195) as
the opening's text is replaced. Derived from the film's own content: **no timestamp,
no literal, nothing shared with the page or with any fix.**

---

## ⚠⚠ INSTRUMENT DEFECT — RECORDED INDIVIDUALLY, NOT CONSOLIDATED

**Carl is leading the pattern across the instrument defects. This one is recorded on
its own, in the file where it was found, and is NOT merged with the others.**

### THE DEFECT: a window anchor that excluded the thing it measured

**Version 3 of the reveal window anchored on *"the last frame below 25% of settled
ink"*.** The reasoning was that the band is empty before Q5 arrives, so the last
empty frame marks the start.

⚠⚠ **THE FROZEN BAND IS NOT EMPTY. It holds `Q5 Wh` at ink ~397** — well above the
25% threshold. So the anchor landed at **f268, inside the freeze and after most of
it**, and the measurement window **began after the defect and excluded it.**

### ⛔ WHAT IT REPORTED: **0ms. A CLEAN REVEAL.**

**On a film whose freeze is plainly visible and was confirmed by eye four frames
later.**

⚠⚠ **WITHOUT THE REQUIRED RED ON TODAY'S BUILD, IT WOULD HAVE SHIPPED AS "THE STALL
IS GONE."** The number was clean, the harness ran without error, and every other
check passed. **Nothing in the output looked wrong.**

### ⚠ THE PROPERTY THAT MAKES IT DANGEROUS

**It fails in the direction of a PASS.** A harness that breaks loudly costs an hour;
this one would have closed a defect that is still live — and the closure would have
been backed by an instrument built specifically to be trusted on this question.

⚠ **It is the same shape as `q5-stutter.mjs` reporting 0/3 CLEAN on a visible stall**
(its 700ms window sat inside a 1300ms animation), and the same shape as
`one-context.mjs` reporting 2/2 while a second context was created per question.
**Three instruments, three green verdicts, three live defects.** ⚠ **Recorded as an
observation, NOT proposed as a rule — that is Carl's to draw.**

### ⚠⚠ HOW IT WAS CAUGHT — AND THIS IS THE TRANSFERABLE PART

**By extracting the frames and looking at them.**

⚠ **NONE OF THE FOUR WRONG VERSIONS — the crop that swallowed the card grid, the
first-to-last-moving window, the ink-plateau window, or this one — WAS CAUGHT BY
READING THE OUTPUT.** All four produced confident, plausible numbers:
5040ms, 5040ms, 0ms, and "no freeze". **All four were caught by opening a PNG.**

**The instrument's own output was the least reliable thing about it at every stage.**

---

## FALSIFICATION

| Check | Result |
|---|---|
| **honest, production, today** | ⛔ **RED — 7/8 runs, no injection needed** |
| crop moved to empty sky (`y=200`) | ⛔ RED **"NO REVEAL FOUND"** on all 8 — ⚠ **not 0ms** |
| a run below the floor | ⛔ RED "NO FREEZE FOUND — a finding ABOUT THIS INSTRUMENT" |
| exit code on RED | **1** |
| signature validated by eye | ✅ `Q5 Wh` at the freeze in every run opened; resumed after |
| reveal window vs declared 1300ms | ✅ **1280–1320ms, 8/8** |

⚠ **The primary check is the honest production run, and it goes RED today.** Per the
standing rule, a green from an unfalsified instrument is not evidence — and a green
*here* would have been a finding about the instrument, which is what the harness says
in those words when it finds nothing.

---

## ⚠ THE COMMENT CORRECTION — WRONG IN BOTH HALVES

`enquiry-opening.tsx` claimed the wipe *"was rewritten from `clip-path` to
`transform` — because Chrome cannot composite `clip-path`, so a blocked main thread
freezes the reveal outright."*

1. ⚠ **THE RULE ON DISK IS `clip-path`.** All three reveal keyframes
   (`globals.css:132-164`) animate `clip-path`; **no transform-based reveal exists in
   the stylesheet.** The rewrite was real but was **reverted**; the comment described
   it in the present tense and outlived it. **The coupling lesson it teaches still
   stands, so the paragraph is corrected, not deleted.**
2. ⚠⚠ **"A BLOCKED MAIN THREAD" NAMES THE WRONG THREAD** — the freeze is in the **GPU
   process with the renderer idle.** The shared-host comment forty lines below had
   this right all along, and the two contradicted each other in one file.

⚠ **WHY IT MATTERED HERE:** a reader trusting the old wording concludes the freeze is
main-thread and reaches for a `getComputedStyle` poller — **which is precisely the
instrument that cannot see this defect.** The correction is in place, with both
halves recorded so the next reader sees what was wrong rather than a silent edit.

---

## WHAT THIS DOES NOT WATCH — declared in the harness output, not only here

- **Mobile.** 1440x900 only. The reveal is 1300ms at both widths, so this is a
  coverage gap, not a timing one.
- **Q4–Q1 and the corridor step.** Q5 after Begin only.
- **Anything shorter than 40ms.** 25fps is a floor; every duration is **bounded**.
- ⛔ **WHY.** No attribution, no trace, no cause.
- ⚠ **The ~240ms/step, ~180ms gap and 67.2ms button figures remain unreconciled
  against the reveal.** Still not answered — carried forward from 15 August.

---

## ARTEFACTS — ✅ PRESERVED, on the same footing as `cbd7ad3`

**Carl's decision, 18 August: preserve.** `verify/out/` is gitignored scratch and
`reveal-stall.mjs` `rmSync`s it on every run, so the films were copied into
`live-work/screenshots/` and **force-added**, exactly as the 15 August `.webm` was.

```
project-intelligence/live-work/screenshots/
  q5-reveal-stall-18aug-tail-40ms.webm      run-01   40ms   1,798,973 bytes
  q5-reveal-stall-18aug-median-200ms.webm   run-03  200ms   1,801,110 bytes
  q5-reveal-stall-18aug-tail-240ms.webm     run-05  240ms   1,804,414 bytes
```

**Each copy is SHA256-verified identical to its source**, not merely equal in size:

```
tail-40ms      d119751c02a916a5f94ca0d19ab132268e10e4410ad066f5d11cef94e3fec778
median-200ms   59baae1f769265a5c72b2abfcaf6ef160997a0987fe31bba7770591fe9fddd7c
tail-240ms     107f67399864e6be55aeac37a5d34c0555937852f550fcc6c80c90bb34634f3c
```

⚠ **SIZE, CORRECTED:** each film is **~1.79 MB**, comparable to the 1.38 MB
`cbd7ad3` precedent. **A first reading of these as 0.19 MB was an arithmetic error
and is corrected here** — all eight would be 14.3 MB, which is why three are kept
rather than the set: the two tails, which are the evidence for the spread, plus one
median run for comparison.

## ⛔⛔ THE 640ms FILM IS GONE. IT CANNOT BE RECOVERED.

**The 640ms run was in the earlier SIX-run batch. `verify/reveal-stall.mjs` calls
`rmSync(OUT)` at startup, so filming the eight-run batch DESTROYED IT.** The figure
survives in this file; **its evidence does not.**

⚠ **A fresh capture cannot replace it** — it would be a different run on a different
day, which is the exact problem this file exists to describe. ⚠⚠ **This is the same
trap the 15 August record warned about in its own words: `verify/out/` is destroyed
by the next run, and that recording was copied out BEFORE analysis for this reason.
The warning was on the record and the loss happened anyway.**

**Consequence, stated plainly:** the preserved spread is **40–240ms (6x)** on the
eight-run batch. ⚠ **The 40–640ms (16x) span is now a NUMBER IN A FILE, not an
inspectable artefact.** Anyone re-deriving the spread from the committed films will
measure 6x and should not conclude the 16x figure was wrong — it was measured, by
eye-validated frames (f260 and f273 both `Q5 Wh`, f280 resumed), and then lost.

⚠ **HARNESS DEFECT, RECORDED: `reveal-stall.mjs` DESTROYS ITS OWN PRIOR EVIDENCE.**
A harness whose subject is run-to-run variance must not delete previous runs. **Not
fixed here** — it is a change to an instrument under review, and this file is the
record, not the fix.

---

*18 August 2026. ⚠ **The reveal finally has a stall instrument, and its first act was to*
*show that a single run on one build can return 40ms or 640ms with nothing changed.***
*⚠⚠ **Three versions of the window reported confident numbers before this one; the third***
*⚠⚠ **reported the reveal CLEAN. All were caught by looking at the frames, none by the number.***
