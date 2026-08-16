# The intermittent ladder compression — two samples

**16 August 2026. OBSERVATION ONLY.** No diagnosis, no attribution, no trace opened. Two
samples of the card entrance ladder, taken with `card-1-anchor.mjs`'s new gap assertion
(`859bb8f`). **Nothing was fixed and nothing is explained here.**

---

## ⚠⚠ THE DURABLE CORRECTION — IT IS NOT THE WHOLE LADDER

**Only the 1→2 gap moves.**

In **every** compressed run, gaps **2→3, 3→4 and 4→5 sit within ±11ms of nominal** —
indistinguishable from a clean run. The 1→2 gap ranges **264–388ms against 560ms
specified**.

⚠ **BOTH EARLIER SIGHTINGS WERE RECORDED AS "THE WHOLE LADDER COMPRESSES". THAT WAS WRONG,
AND THE INSTRUMENT CAUSED IT.**

`card-1-anchor.mjs` measures each beat's offset **FROM CARD 1**. So a single early shift in
card 2 propagates as **four equal-looking drifts** — the −230ms reading of the morning was
one displacement seen four times, not four displacements. The morning's other sighting
(cards 1 and 2 in the same millisecond) is the same fault at its extreme.

**The fault is localised and always was. The frame of reference made it look global for a
week.**

### ⚠ FIFTH INSTANCE OF THE MEASUREMENT-TRUST PATTERN — AND A DISTINCT SHAPE AGAIN

Collected for Carl's governance review. The running list:

| # | Instance | Shape |
|---|---|---|
| 1 | `q5-stutter.mjs` — window from `Q5_REVEAL_CLEAR_MS = 700`, the fix's own constant | **Circularity** — a check sharing a constant with its subject |
| 2 | A typed `1300` in a future reveal harness | **Staleness** (and the §2 claim about *why* was itself wrong — see `reveal-instrument-spec-16-august.md`) |
| 3 | `card-1-anchor` / `q5-card1-halfway` reading a constant-derived NAME as timing evidence | **Circularity in the consumers**, instrument clean |
| 4 | `__cardTrace` / beat marks carrying no question identity | **A missing dimension** — data silently reattributed to whatever question is active |
| **5** | **This** — offsets measured from card 1 | ⚠ **A CORRECT MEASUREMENT WHOSE FRAME OF REFERENCE DISTORTED WHAT IT APPEARED TO SHOW** |

⚠ **INSTANCE 5 IS NOT A WRONG NUMBER AND NOT A SHARED CONSTANT.** Every figure
`card-1-anchor.mjs` printed was accurate. It reported true offsets from a true origin —
and because the origin sat *before* the displacement, one fault presented as four. **No
rule about deriving constants or avoiding circularity would have caught it.**

---

## SAMPLE 1 — 20 desktop runs, then 10 mobile (CONSECUTIVE)

`1440x900`, fresh context and page load per run, one browser process.

```
run  elapsed   gaps (1→2, 2→3, 3→4, 4→5)          sum   verdict
  1     12s    351,  566,  550,  567    2034   ⛔ COMPRESSED (worst -209ms)
  2     23s    567,  567,  550,  567    2251   ✅
  3     34s    341,  566,  550,  567    2024   ⛔ COMPRESSED (worst -219ms)
  4     45s    317,  567,  550,  567    2001   ⛔ COMPRESSED (worst -243ms)
  5     56s    567,  568,  550,  566    2251   ✅
  6     67s    384,  566,  549,  567    2066   ⛔ COMPRESSED (worst -176ms)
  7     78s    568,  567,  550,  567    2252   ✅
  8     90s    388,  567,  549,  567    2071   ⛔ COMPRESSED (worst -172ms)
  9    101s    567,  567,  550,  567    2251   ✅
 10    112s    388,  566,  550,  567    2071   ⛔ COMPRESSED (worst -172ms)
 11    123s    567,  568,  549,  567    2251   ✅
 12    135s    567,  567,  550,  567    2251   ✅
 13    146s    567,  567,  550,  567    2251   ✅
 14    157s    567,  567,  550,  567    2251   ✅
 15    169s    567,  568,  550,  566    2251   ✅
 16    180s    567,  566,  551,  566    2250   ✅
 17    191s    568,  567,  549,  567    2251   ✅
 18    202s    567,  566,  551,  566    2250   ✅
 19    214s    264,  567,  550,  567    1948   ⛔ COMPRESSED (worst -296ms)
 20    225s    299,  552,  565,  567    1983   ⛔ COMPRESSED (worst -261ms)

  8 of 20 runs COMPRESSED  (40%)
  compressed run indices: 1, 3, 4, 6, 8, 10, 19, 20

  per-gap drift in compressed runs:
    run  1:  -209,    +6,   -10,    +7   spread 216ms
    run  3:  -219,    +6,   -10,    +7   spread 226ms
    run  4:  -243,    +7,   -10,    +7   spread 250ms
    run  6:  -176,    +6,   -11,    +7   spread 183ms
    run  8:  -172,    +7,   -11,    +7   spread 179ms
    run 10:  -172,    +6,   -10,    +7   spread 179ms
    run 19:  -296,    +7,   -10,    +7   spread 303ms
    run 20:  -261,    -8,    +5,    +7   spread 268ms

  clean runs: total span 2250–2252ms (expected 2240)
```

**Then 10 runs at `390x844`, immediately after:**

```
run  elapsed   gaps (1→2, 2→3, 3→4, 4→5)          sum   verdict
  1     14s    568,  567,  549,  567    2251   ✅
  2     28s    567,  566,  551,  567    2251   ✅
  3     41s    568,  567,  550,  566    2251   ✅
  4     55s    568,  567,  550,  566    2251   ✅
  5     68s    567,  566,  550,  567    2250   ✅
  6     81s    568,  566,  551,  566    2251   ✅
  7     95s    566,  567,  550,  568    2251   ✅
  8    108s    566,  567,  550,  566    2249   ✅
  9    122s    567,  568,  549,  567    2251   ✅
 10    135s    567,  566,  550,  567    2250   ✅

  0 of 10 runs COMPRESSED  (0%)
```

⚠ Note run 20 of the desktop set: `299, 552, 565, 567`. **The only compressed run whose
other gaps moved at all** (−8, +5), and still far inside tolerance.

---

## SAMPLE 2 — 20 runs, INTERLEAVED, ten of each width

Same browser process, fresh context and page load per run. **Only the interleaving changed.**

```
run  width    elapsed   1→2    2→3, 3→4, 4→5      sum   verdict
  1  desktop     12s    568    567,  550,  567    2252   ✅
  2  mobile      26s    567    567,  550,  567    2251   ✅
  3  desktop     37s    568    566,  551,  567    2252   ✅
  4  mobile      50s    568    567,  550,  567    2252   ✅
  5  desktop     61s    567    567,  551,  567    2252   ✅
  6  mobile      75s    568    566,  551,  567    2252   ✅
  7  desktop     86s    567    567,  551,  566    2251   ✅
  8  mobile     100s    567    567,  551,  566    2251   ✅
  9  desktop    111s    568    566,  550,  568    2252   ✅
 10  mobile     125s    567    567,  550,  568    2252   ✅
 11  desktop    136s    567    567,  550,  567    2251   ✅
 12  mobile     149s    567    567,  550,  567    2251   ✅
 13  desktop    161s    568    567,  550,  567    2252   ✅
 14  mobile     175s    568    566,  551,  567    2252   ✅
 15  desktop    186s    568    566,  551,  567    2252   ✅
 16  mobile     199s    567    566,  551,  566    2250   ✅
 17  desktop    210s    567    567,  551,  567    2252   ✅
 18  mobile     224s    567    566,  551,  567    2251   ✅
 19  desktop    235s    569    565,  551,  567    2252   ✅
 20  mobile     249s    568    565,  551,  567    2251   ✅

  COMPRESSION RATE (1→2 gap outside ±120ms)
    desktop  0/10 (0%)
    mobile   0/10 (0%)
    overall  0/20 (0%)

  BY RUN INDEX (halves):
    runs 1–10   0/10 (0%)
    runs 11–20  0/10 (0%)

  THE 1→2 GAP:
    desktop   568,  568,  567,  567,  568,  567,  568,  568,  567,  569
    mobile    567,  568,  568,  567,  567,  567,  568,  567,  567,  568

  THE OTHER THREE GAPS — worst drift seen anywhere:
    -10ms to +8ms across 60 measurements
```

**The 1→2 gap ranged 567–569 across all twenty runs.** Not one approached the 264–388ms band.

---

## ⚠⚠ NEITHER SAMPLE SEPARATES ANYTHING

**Sample 1 confounds WIDTH with ORDERING.** Desktop and mobile ran consecutively, so the
mobile block sits in exactly the position where desktop had already gone quiet (runs
11–18). Its 0/10 cannot be attributed to width.

**Sample 2 confounds INTERLEAVING with ELAPSED SESSION TIME.** ⚠ **Desktop alone went from
8/20 to 0/10 between the samples.** Interleaving changed — and so did everything downstream
of the session having run longer. **Sample 2 therefore does not test what it was designed
to test:** neither branch of the intended comparison (mobile at desktop's rate → ordering;
mobile near zero while desktop compresses → width) could fire, because the desktop control
also went to zero.

**The two samples differ in more than one respect. Neither rules out width. Neither rules
out ordering.**

---

## ⚠ 0/20 DOES NOT RETIRE THE FINDING

**The compression was real.** It was measured **eight times**, with verbatim numbers, on an
unmodified tree with no injection present.

⚠ **An intermittent fault that fails to appear in one window has not been shown absent.**
A 0/20 bounds the rate loosely below the previously observed 40% **for that window** and
says nothing more. **Do not read sample 2 as evidence the fault is gone.**

---

## THE WALL-CLOCK OBSERVATION — RECORDED, NOT EXPLAINED

**Sample 1's eight compressed runs all fell inside the first ~112 seconds** (indices 1, 3,
4, 6, 8, 10 at 12–112s; then indices 19 and 20 at 214s and 225s).

⚠ **Correction to that sentence as stated: six of the eight fell inside the first ~112s.
Runs 19 and 20, at 214s and 225s, did not.**

**Sample 2's first ~112 seconds were clean** (runs 1–9, 12s–111s).

**Both samples ran to a similar wall-clock scale** (~225s and ~249s).

⚠ **THAT IS THE OBSERVATION. NO ACCOUNT OF IT IS OFFERED HERE**, and none should be read
into the ordering of these paragraphs.

---

## OUTSTANDING — NOT RUN

⚠ **A COLD RUN: fresh server, fresh browser process.** Both samples shared one browser
process, and sample 2 followed sample 1 in the same session against a server that had been
up for hours. **Until a cold sample exists, neither the 40% nor the 0% should be treated as
characteristic.**

**This was not run** — the task was scoped to the interleave.

---

## ⚠ THREE OF FOUR PREDICTIONS IN THIS THREAD MISSED

Recorded because the predictions were written before each measurement, and the misses are
the point of writing them down:

| Prediction | Outcome |
|---|---|
| Sample 1 rate: **2–4 of 20** | **8 of 20** — over double |
| Sample 1 shape: **uniform across all four gaps** | ⛔ **Localised to 1→2 alone** |
| Sample 1 mobile: **compresses MORE than desktop** | ⛔ **0/10** |
| Sample 2: **mobile 2–4/10, desktop 3–5/10, ordering dominant** | ⛔ **0/20 — neither branch fired** |

⚠ **The one that mattered most was the shape**, and it was wrong in the direction the
instrument's framing suggested. **Twice the reasoning over-attributed to a mechanism
(frame budget, then ordering) when the data supported neither.**

---

## WHAT THESE SAMPLES DO NOT COVER

- **One machine, one session, one browser process, dev server, one afternoon.**
- **20 and 10 runs are samples, not rates.**
- **No production build.** Dev-server frame pacing is not the shipped motion.
- **No second machine, no cold start, no repetition of sample 1 after sample 2.**
- **Q5 only.** No corridor step, and ⚠ neither trace channel carries a question identity
  anyway (`beattrace-falsified-16-august.md`).

---

*16 August 2026. The fault is real, localised to the 1→2 gap, and did not appear in the*
*last twenty runs. Both statements are true and neither cancels the other.*
