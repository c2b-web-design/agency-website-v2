# The card-1 entrance delay — three samples

*Filed as "the intermittent ladder compression". ⚠ **That name is the wrong frame** — see the*
*correction immediately below. The original title is kept here because the misread is part of*
*the record.*

**16 August 2026. OBSERVATION ONLY.** No diagnosis, no attribution, no trace opened. Two
samples of the card entrance ladder, taken with `card-1-anchor.mjs`'s new gap assertion
(`859bb8f`). **Nothing was fixed and nothing is explained here.**

---

# ⚠⚠⚠ READ THIS FIRST — THE NAME BELOW IS THE WRONG FRAME

**Added 16 August 2026, after a cold sample of twenty runs. Everything below this section
STANDS AS WRITTEN and nothing in it has been deleted** — the misread and its cause are both
part of the record, and a clean file would hide both.

## 1. THE CORRECTED NAME

> **Card 1's entrance is intermittently delayed; cards 3–5 hold their absolute schedule.
> The 1→2 gap absorbs the delay and closes to zero once the delay exceeds 560ms.**

Short form: **the card-1 entrance delay.**

⚠ **"The 1→2 gap compresses" describes the far end closing. It is the near end that moves.**
Card 1 arrives late, card 2 arrives on time, and the gap between them is simply what is left.
The old name points diagnosis at the wrong end of the ladder, and it did so for a week.

## 2. THE EVIDENCE — cold sample, absolute offsets from the Begin click

⚠ **From BEGIN, not from reveal start.** `card-1-anchor.mjs` sets `t0` immediately before
`begin.click()`, so these figures include the canvas mount and the async precompile.

| | card 1 | card 3 | card 5 |
|---|---|---|---|
| **Clean runs** (18 of 20) | +745–782 | +1880–1900 | +2997–3017 |
| **Run 20** — the clean failure | **+958** (194ms late) | +1901 | +3019 |
| **Run 1** — contaminated | **+1599** | +1945 | +3062 |

**Run 20 is the load-bearing instance.** Card 1 is 194ms late while card 3 sits **1ms** and
card 5 **2ms** outside the clean band. The tail does not move.

⚠ **RUN 1 IS NOT LOAD-BEARING.** It carried Next's first-request compile, and its whole tail
runs **~46ms late** (card 3 +1945, card 5 +3062) — not the ~2ms of run 20. A second, smaller
displacement is present in run 1 that is absent from run 20. **Do not cite run 1 as a second
instance of the same fault.**

⚠ **A span from card 3 to card 5 is 1117ms in run 1, 1118 in run 20 and 1117 clean — and
that identity CONCEALS run 1's 46ms shift,** because both endpoints moved together and the
difference cancels it. Spans are the wrong frame for this fault too.

**Cold rate: 2/20 including run 1, 1/19 excluding it. ⚠ Do not average them — they are not
the same fault.**

## 3. ⚠⚠ WHY THE WRONG NAME SURVIVED A WEEK — THE INSTRUMENT'S FRAME OF REFERENCE

`card-1-anchor.mjs` measures **every beat's offset FROM CARD 1**. The origin sits on the one
thing that moves. **A displacement of card 1 can therefore only ever present as a gap** —
the instrument is incapable of showing it any other way. **The name came from the frame of
reference, not from the fault.**

⚠ **THIS IS THE SECOND TIME THIS HARNESS'S FRAME HAS CHANGED THE APPARENT SHAPE OF THIS
SAME FAULT.**

| | Reading it produced | What was actually there |
|---|---|---|
| **First** | "the whole ladder compresses — −230ms × 4, a uniform drift" | One displacement of card 2, seen four times over |
| **Second** | "it is the 1→2 gap ALONE" | One displacement of **card 1**, seen as the gap beneath it |

The first is corrected in `beattrace-falsified-16-august.md` and in the section immediately
below this one. **Both misreads have the same cause: offsets measured from a moving origin.**

**Recorded, not generalised. No rule is proposed here — Carl is holding the pattern for the
governance review** (the five-instance table below is his; this is a second occurrence of
instance 5, not a sixth instance).

## 4. OPEN LEAD — UNTESTED, AND IT IS A LEAD AND NOTHING MORE

The **Mode B clamp** at [answer-card-canvas.tsx:1781](components/enquiry/answer-card-canvas.tsx#L1781)
rebases a card's `revealStart` to `nowMs - CARD_FIRST_ENTRANCE_MS` when its entrance effect
starts more than 650ms after the anchor. **A single card clamping while its siblings stay
anchored would produce exactly this signature.**

⚠ **UNVERIFIED.** It requires that card 1's effect can run meaningfully later than its
siblings', **which has not been established.** No measurement here supports it.

⚠ **`?modetrace=1` cannot settle it as it stands.** Its entries carry `t`, `mode`,
`overrunMs` and `q` — **`q` is a QUESTION identity, and there is no card field.** It cannot
say *which* card clamped without inferring from array order.

⚠ **The clamp is a safety net against a collapsed ladder and must not be "fixed" by removing
it** — the code comment at that site says so, and this lead does not change that.

## 5. WHAT IS STILL NOT ESTABLISHED

- **No mechanism.** Neither the clamp lead nor anything else here identifies a cause.
- **No rate.** Three samples gave **40%, 0%, 10%**.
- **Cold is NOT the trigger.** 18 consecutive runs with the on-disk GPU shader cache created
  and destroyed per run produced textbook-clean ladders.
- ⚠ **The from-Begin frame does not separate "card 1 fired late" from "the reveal started
  late and card 1 was on schedule relative to it."** Both produce +958. The harness prints
  the field that would separate them (`precompileGap` / `revealStart`); it was not captured
  in this sample.
- **A fresh cold sample predicting card 1 at ~+950 BEFORE it runs has not been taken.** The
  correction above is two readings of one dataset agreeing, not independent confirmation.

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
