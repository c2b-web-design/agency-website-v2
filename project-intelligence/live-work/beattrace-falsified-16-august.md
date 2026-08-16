# `?beattrace=1` — FALSIFIED. The instrument is sound; the dependents are not.

**16 August 2026.** First falsification of the instrument ten `verify/` harnesses depend on.
**Four injections (A–D) plus the live defect observed with no injection (E), and a cost
measurement.** **Nothing fixed, nothing diagnosed, nothing committed beyond this record** —
every injection reverted, tree clean and byte-identical to HEAD.

⚠ **D AND E WERE ADDED AFTER THE FIRST WRITING OF THIS FILE**, which recorded the
total-absence case as *reasoned about, not injected*. **That gap is now closed by
experiment.** E is the more serious result and it required no injection at all.

---

## ⚠⚠ THE HEADLINE

**THE INSTRUMENT IS SOUND. THE DEPENDENTS ARE NOT.**

**The timestamps moved correctly under every injection.** Both channels observed what
actually happened, including when the ladder ran out of order. The suspicion on record —
that `card-beat-650` matching the computed ladder made it circular — **is answered: the
TIMESTAMP is genuinely observed.**

⚠ **BUT THE MARK NAME IS A CONSTANT-DERIVED LABEL, AND TWO HARNESSES READ IT AS EVIDENCE
OF THE TIMING:**

- **`card-1-anchor.mjs:128-129`** — selects by `rung === CARD_FIRST_ENTRANCE_MS`, then
  computes `entranceZero = card1 − CARD_FIRST_ENTRANCE_MS`. **It subtracts a constant from
  a timestamp it selected BECAUSE the name says that constant.**
- **`q5-card1-halfway.mjs:89,95`** — `waitForFunction` on `card-beat-650` existing, then
  reads `getEntriesByName("card-beat-650")[0]`. **Nothing verifies 650 was the rung that
  actually fired.**

⚠ **UNDER INJECTION A, BOTH WOULD HAVE PASSED ON A VISIBLY SCRAMBLED LADDER.**

**The split is exact:** identity is DECLARED (`delayMs`, a constant — the mark name in
Channel A, the `card` field in Channel B); timing is OBSERVED (`performance.now()` at the
card's first visible frame). **The instrument never conflates them. Two harnesses do.**

---

## THE BLAST RADIUS — what each dependent consumes

| Harness | Channel | Uses NAME as | Uses TIMESTAMP as |
|---|---|---|---|
| `card-1-anchor.mjs` | A | ⚠ **the rung value**, then subtracts it | `at`, `entranceZero` |
| `q5-card1-halfway.mjs` | A | ⚠ **a selector and a wait condition** | `markTime` → % into reveal |
| `q5-card-latency.mjs` | A | filter / label | beat times |
| `stall-source.mjs` | A | filter / label | beat times |
| `warm-guard.mjs` | A | filter / label | beat times |
| `approved-timings.mjs` | B | `card` field, to group | first sample where `raw > 0` |
| `entrance-fade.mjs` | B | `card` field, to group | span start/end, curve shape |
| `entrance-frames.mjs` | B | `card` field, to group | per-frame timing |
| `label-with-card.mjs` | B | `card` field, to group | card timing vs label |
| `warm-collision.mjs` | B | `card` field, to group | collision timing |

⚠ **`approved-timings.mjs` IS THE ONE THAT REPORTS "APPROVED" VALUES.** Its beat column
inherits whatever the trace says.

---

## ⚠ THE BASELINE WAS ALREADY ANOMALOUS — BEFORE ANY INJECTION

```
MARKS (name @ absolute ms):
  card-beat-650        @ 10359
  card-beat-1210       @ 10359
  card-beat-1770       @ 10555
  card-beat-2330       @ 11121
  card-beat-2890       @ 11671

GAPS between consecutive marks:
  card-beat-650  -> card-beat-1210: 0ms
  card-beat-1210 -> card-beat-1770: 196ms
  card-beat-1770 -> card-beat-2330: 566ms
  card-beat-2330 -> card-beat-2890: 550ms
```

**Cards 1 and 2 fired in the SAME MILLISECOND**, where the ladder specifies
`CARD_RISE_GAP_MS` = 560ms. The 1210→1770 gap was 196ms, also short.

Later clean runs in this same session gave **567 / 566 / 550 / 567** — the expected ladder.
So the anomaly is intermittent, not constant.

⚠ **OBSERVATION ONLY. NOT DIAGNOSED.** ⚠ **The instrument REPORTED it correctly and NO
DEPENDENT ASSERTS IT** — `card-1-anchor.mjs` reads only card 1, and nothing anywhere checks
the gaps. **It was visible in the raw data the whole time and nothing was watching.**

### ⚠ IT RECURRED ON A CLEAN TREE — AND THE NEW ASSERTION CAUGHT IT ON ITS FIRST RUN

**16 August, immediately after the gap/ordering/count assertions were added to
`card-1-anchor.mjs` (`859bb8f`).** The very first run against an **unmodified tree, no
injection**, went RED:

```
  ⛔ LADDER INTEGRITY FAILED in 1 of 1 run(s):
     · GAP: rung 1210 sits  330ms after card 1, expected  560ms (drift -230ms)
     · GAP: rung 1770 sits  896ms after card 1, expected 1120ms (drift -224ms)
     · GAP: rung 2330 sits 1447ms after card 1, expected 1680ms (drift -233ms)
     · GAP: rung 2890 sits 2013ms after card 1, expected 2240ms (drift -227ms)
```

⚠ **A UNIFORM ~−230ms DRIFT ON ALL FOUR GAPS** — the whole ladder compressed, not one card
displaced. **Ordering and count were both fine.**

**Three consecutive runs immediately after were green**, and three more later:

```
  650@+764, 1210@+1331, 1770@+1897, 2330@+2447, 2890@+3014   ✅
  650@+764, 1210@+1331, 1770@+1898, 2330@+2448, 2890@+3015   ✅
  650@+763, 1210@+1331, 1770@+1896, 2330@+2447, 2890@+3013   ✅
```

— gaps **568 / 566 / 551 / 567**, against the specified 560.

⚠ **SO IT IS INTERMITTENT, IT IS REAL, AND IT IS THE SAME SHAPE AS THE 0ms BASELINE GAP
ABOVE** (cards 1 and 2 in the same millisecond). Both are the ladder collapsing rather than
a single beat moving.

⚠⚠ **NOT DIAGNOSED. NOT ATTRIBUTED.** Recorded because **the assertion that found it did
not exist until today**, and the instrument had been publishing this correctly for as long
as it has existed. ⚠ **It is a live intermittent finding on the current tree, not an
artefact of the falsification** — no defect was present when it fired.

---

## INJECTION A — DELAY WITHOUT CHANGING THE CONSTANT

**Defect:** card 3's first visible frame delayed +800ms. `CARD_RISE_LADDER_MS` **untouched**.

```
MARKS (name @ absolute ms):
  card-beat-650        @ 9600
  card-beat-1210       @ 9893
  card-beat-2330       @ 11010
  card-beat-1770       @ 11260
  card-beat-2890       @ 11577

__cardTrace: 543 samples, cards [650, 1210, 1770, 2330, 2890]
first raw>0 per card:
  card   650  first-moving t=9600
  card  1210  first-moving t=9893
  card  1770  first-moving t=11260
  card  2330  first-moving t=11010
  card  2890  first-moving t=11577

GAPS between consecutive marks:
  card-beat-650  -> card-beat-1210: 293ms
  card-beat-1210 -> card-beat-2330: 1117ms
  card-beat-2330 -> card-beat-1770: 250ms
  card-beat-1770 -> card-beat-2890: 317ms
```

### ⚠ THE RESULT — THE TIMESTAMP MOVED, THE NAME DID NOT

**`card-beat-1770` fired at 11260 — AFTER `card-beat-2330` at 11010.** Card 3 appeared
after card 4, out of order, 800ms late. **Channel B agreed independently:** `card 1770
first-moving t=11260`, later than card 2330's `t=11010`.

✅ **WHERE THE INSTRUMENT LOOKED CORRECT — AND WAS:** both channels observed the real
lateness and the real reordering. **This is the falsification passing.** The timestamp is
not derived from the constant; it responds to what the card actually did.

⛔ **WHERE THE DEPENDENTS FAIL:** the name still reads `card-beat-1770` for a card that
appeared 800ms elsewhere. `card-1-anchor.mjs` and `q5-card1-halfway.mjs` both key on card
1, which was unaffected — **they would have reported normally while the ladder was
scrambled.** ⚠ **Nothing asserts ordering.**

**Reverted. Confirmed green** — gaps 567 / 567 / 549 / 568.

---

## INJECTION B — SUPPRESS A CARD ENTIRELY

**Defect:** card 3 (rung 1770) returns before its `tick` loop — never mounts its entrance.

**Flag ON:**
```
MARKS (name @ absolute ms):
  card-beat-650        @ 9424
  card-beat-1210       @ 9790
  card-beat-2330       @ 10906
  card-beat-2890       @ 11474

__cardTrace: 472 samples, cards [650, 1210, 2330, 2890]
```

**Same defect, flag OFF:**
```
MARKS (name @ absolute ms):
  (none)

__cardTrace: 0 samples, cards []
```

### ⚠⚠ THE RESULT — A PRIOR CLAIM OF MINE IS WRONG, AND IS CORRECTED HERE

**These are PLAINLY DISTINGUISHABLE.** A missing card leaves the other four present; a
disabled flag leaves nothing at all.

⚠ **`reveal-has-no-instrument-16-august.md` states that an empty `__cardTrace` is
indistinguishable from "the flag was off", and calls it a real defect in an instrument with
ten dependents. THAT CLAIM IS TOO BROAD.** It holds only for **TOTAL absence**. Under
**partial** failure the instrument discriminates cleanly. **That file is amended alongside
this one; corrected forward, not rewritten.**

**THE NARROWER TRUE VERSION:**

> ⚠ **NO HARNESS CHECKS WHICH CARDS ARE PRESENT AGAINST AN EXPECTED FIVE.** The
> instrument publishes enough to detect a missing card — `cards [650, 1210, 2330, 2890]`
> is four, not five — **and nothing reads it that way.** The harnesses' shared
> `"⚠ NO TRACE — ?beattrace=1 published nothing"` still cannot separate total absence from
> a disabled flag, and the Q4–Q1 case IS total absence, so it holds there.
> **⚠ CONFIRMED BY INJECTION D below — no longer an inference.** ⚠ **But see E: the live
> Q4 case does NOT present as total absence. It presents as a full healthy ladder carrying
> Q5's data.**

✅ **WHERE THE INSTRUMENT LOOKED CORRECT — AND WAS:** it published exactly the evidence
needed to catch this. **The information was there. Nobody consumes it.**

**Reverted. Confirmed green** — all five cards present.

---

## INJECTION C — BLOCK THE MAIN THREAD MID-LADDER

**Defect:** a 600ms **synchronous** spin block, once, when card 2 starts.

```
MARKS (name @ absolute ms):
  card-beat-650        @ 9375
  card-beat-1210       @ 9704
  card-beat-1770       @ 10304
  card-beat-2330       @ 10820
  card-beat-2890       @ 11387

__cardTrace: 516 samples, cards [650, 1210, 1770, 2330, 2890]
first raw>0 per card:
  card   650  first-moving t=9375
  card  1210  first-moving t=10304
  card  1770  first-moving t=10304
  card  2330  first-moving t=10820
  card  2890  first-moving t=11387

GAPS between consecutive marks:
  card-beat-650  -> card-beat-1210: 329ms
  card-beat-1210 -> card-beat-1770: 600ms
  card-beat-1770 -> card-beat-2330: 516ms
  card-beat-2330 -> card-beat-2890: 567ms
```

### ⚠ THE RESULT — A SPLIT VERDICT BETWEEN THE TWO CHANNELS

⛔ **CHANNEL A NEARLY HIDES IT.** One 600ms gap among 329 / 600 / 516 / 567. To anyone not
checking against `CARD_RISE_GAP_MS`, **that reads as an unremarkable ladder.**

✅ **CHANNEL B SHOWS IT CLEARLY.** `card 1210` and `card 1770` both report first motion at
**t=10304 — the identical millisecond.** Two cards collide: the collapsed-ladder signature.

⚠ **THE TWO CHANNELS DISAGREE IN INFORMATIVENESS, AND ONLY B CAUGHT IT.** Five harnesses
read A alone.

⚠ **NO HARNESS FLAGS IT EITHER WAY.** Nothing asserts inter-beat gaps against
`CARD_RISE_GAP_MS`.

**Reverted. Confirmed green** — gaps 567 / 566 / 550 / 567.

---

## ⚠ THE COST FLAG IS RETIRED — MEASURED, NOT ARGUED

rAF frame intervals across the entrance, 3 runs each:

```
═══ FLAG ON  ═══
  run1  frames  997  median 16.7ms  p95 17.5ms  max   372ms  >50ms: 11  trace 604
  run2  frames 1042  median 16.7ms  p95 17.2ms  max 170.2ms  >50ms:  5  trace 605
  run3  frames 1045  median 16.7ms  p95 17.4ms  max 161.3ms  >50ms:  6  trace 606
  MEDIAN-OF-RUNS: median 16.7ms   p95 17.4ms

═══ FLAG OFF ═══
  run1  frames  935  median 16.7ms  p95 17.2ms  max   895ms  >50ms:  6  trace 0
  run2  frames  958  median 16.7ms  p95 17.5ms  max 639.6ms  >50ms: 10  trace 0
  run3  frames  943  median 16.7ms  p95 17.8ms  max 727.2ms  >50ms: 10  trace 0
  MEDIAN-OF-RUNS: median 16.7ms   p95 17.5ms
```

**NO MEASURABLE DIFFERENCE.** Both sit at the 16.7ms vsync floor; p95 differs by **0.1ms**,
inside noise. Long-frame counts overlap (5–11 on, 6–10 off), and the **largest `max` values
appeared with the flag OFF** (895ms) — noise, not signal.

⚠ **WHAT THIS DOES NOT ESTABLISH:**

- **Unbounded array growth over a long session is UNTESTED.** `__cardTrace` has no cap and
  no flush; only ~600 entries accumulated here.
- **ONLY THE ENTRANCE WINDOW WAS MEASURED** — ~11s from load. Nothing about a long walk,
  repeated questions, or a session left open.
- **Frame pacing is not the only cost.** Memory growth and GC pressure were not measured.

**The flag is retired for the question it was raised about — per-frame main-thread cost
during the entrance — and for nothing wider.**

---

## ⚠⚠ THE PATTERN — THIRD INSTANCE THIS SESSION

**A check sharing an assumption with the thing it checks.** Recorded for Carl's governance
review:

1. **`q5-stutter.mjs`** — its 0–700ms window came from `Q5_REVEAL_CLEAR_MS = 700`, **the
   fix's own constant**, against a 1300ms animation. Reported **0/3 CLEAN** on a stall Carl
   could plainly see.
2. **A typed `1300` in any future reveal harness** — already wrong at mobile widths, where
   the same keyframes run at 1500 / 1550 / 1700 / 1450 / 2800 / 2400ms
   (`reveal-instrument-spec-16-august.md` §2).
3. **Two harnesses reading a constant-derived LABEL as timing evidence** — `card-1-anchor`
   subtracting the very constant it selected on; `q5-card1-halfway` waiting on a name that
   verifies nothing (this file).

⚠ **THE SHAPE IS THE SAME IN 1–3: the instrument and the thing under test draw on one
declaration, so the check cannot fail in the direction that matters.** Instance 3 is
distinct from 1 and 2 in one respect worth keeping: **the instrument itself was clean.**
The circularity lived entirely in the consumers. **A sound instrument does not make a sound
check.**

### ⚠⚠ INSTANCE 4 — AND IT IS A DIFFERENT SHAPE ENTIRELY

4. **A MEASUREMENT WITH NO IDENTITY** (injection E, above). `__cardTrace` and the beat
   marks record *when* and *which rung* — **never which QUESTION.** So the data is
   **silently reattributed to whatever question is active when someone reads it.**

⚠ **THIS IS NOT THE 1–3 SHAPE.** Those are circularity: a check that cannot fail because it
shares an assumption with its subject. **This one has no shared assumption — it has a
MISSING DIMENSION.** The measurement is accurate about everything it records and simply
does not record what it is about.

⚠ **STALE DATA THAT LOOKS FRESH IS WORSE THAN NO DATA, BECAUSE NO DATA PROMPTS A
QUESTION.** D produces silence, and silence at least invites "why is there nothing here?"
E produces a full healthy ladder at a question where **no card entered at all**, and
invites nothing.

**Collected for Carl's governance review.** Existing reference: *a harness sharing a
constant with the fix* — which covers 1–3 and **does not cover 4.**

---

## INJECTION D — TOTAL ABSENCE, FLAG ON vs FLAG OFF

⚠ **ADDED 16 AUGUST 2026. This case was previously recorded here as REASONED ABOUT, NOT
INJECTED. It is now injected**, because reasoning had already been wrong three times the
same day (the `clip-path`/`transform` comment, the over-broad ambiguous-silence claim, and
the byte-plateau bound). **The reasoning turned out to be correct — and that was not
knowable without the injection.**

**Defect:** every card returns before its `tick` loop. No card runs its entrance at all —
the Q4–Q1 shape, injected rather than argued.

**All five suppressed, FLAG ON:**
```
MARKS (name @ absolute ms):
  (none)

__cardTrace: 0 samples, cards []
__cardTrace is undefined: true
grid in DOM: true   card hit-targets: 5
```

**All five suppressed, FLAG OFF:**
```
MARKS (name @ absolute ms):
  (none)

__cardTrace: 0 samples, cards []
__cardTrace is undefined: true
grid in DOM: true   card hit-targets: 5
```

### ⚠⚠ CONFIRMED IDENTICAL — BYTE FOR BYTE

**There is no distinguishing signal.** An `undefined` check was added specifically to hunt
for one: **`__cardTrace` is never created in either case**, because `w.__cardTrace ??= []`
only runs **inside the tick loop that never executes.** The flag being on leaves no trace
of itself whatsoever.

⚠ **AN INSTRUMENT WITH TEN DEPENDENTS CANNOT DISTINGUISH "NO CARDS ENTERED" FROM "FLAG
OFF" — IN THE EXACT CASE THIS TREE EXHIBITS TODAY.**

**Reverted. Confirmed green:** `650@9402  1210@9743  1770@10310  2330@10861  2890@11428`,
592 samples, `undefined=false`.

---

## ⚠⚠ INJECTION E — THE LIVE DEFECT, NO INJECTION AT ALL. WORSE THAN D.

**No defect introduced. This is the tree as it stands**, walked Q5 → Q4 with the flag on.

```
──── Q5 — after Begin  (active Q5) ────
  MARKS: 650@9058  1210@9625  1770@10192  2330@10742  2890@11309
  __cardTrace: 605 samples, cards [650, 1210, 1770, 2330, 2890], undefined=false
  card hit-targets in DOM: 5

──── Q4 — after Next step  (active Q4) ────
  MARKS: 650@9058  1210@9625  1770@10192  2330@10742  2890@11309
  __cardTrace: 605 samples, cards [650, 1210, 1770, 2330, 2890], undefined=false
  card hit-targets in DOM: 5

════ DELTA Q5 -> Q4 ════
  new marks at Q4: 0
  new __cardTrace samples at Q4: 0
```

### ⚠⚠ ZERO NEW MARKS, ZERO NEW SAMPLES — AND THE OUTPUT LOOKS HEALTHY

**The Q4 snapshot is Q5's data, unchanged.** Same five marks, same timestamps, same 605
samples.

| Compared against | Distinguishable? |
|---|---|
| A **healthy** run | ⛔ **NO** |
| A **flag-off** run | ✅ yes — flag-off gives nothing; Q4 gives five marks |

⚠ **AT Q4 THE INSTRUMENT DOES NOT GO SILENT. IT PUBLISHES A FULL, CORRECT-LOOKING LADDER**
— five cards on a 567/567/550/567 ladder. **The data is real. It belongs to Q5.**

⚠ **NEITHER CHANNEL CARRIES A QUESTION IDENTITY.** Channel A's mark name is the rung
constant; Channel B's `card` field is the same constant. Nothing anywhere records *which
question* a beat belongs to. **So every harness reading the trace after a step inherits
Q5's timings as the current question's**, with no signal that anything is wrong.

### ⚠ D AND E ARE OPPOSITE FAILURES

> **D is silence that looks like being switched off.**
> **E is a confident wrong answer.**

E is the more dangerous of the two, and it is the one **live in the tree right now**.

### ⚠ UNTESTED — RECORDED AS UNTESTED

**Whether a harness that RESET `__cardTrace` between steps would then see D's silence at
Q4 is NOT KNOWN.** That is the link between the two failures — E may simply be D wearing
stale data.

⚠ **IT WAS NOT INJECTED AND IT IS NOT REASONED ABOUT HERE.** Given the day's record,
reasoning about it would be a fourth guess. **It is an open experiment, not a conclusion.**

---

## WHAT THIS FALSIFICATION DID NOT COVER

- **Desktop only, 1440x900.** No mobile.
- **Q5 and one step to Q4.** Q3–Q1 not walked.
- **No reduced-motion path.**
- **Channel A's `performance.mark` cost was not isolated** from Channel B's; the flag gates
  both.
- **The `__cardTrace` reset experiment** (above) — untested.
- ⚠ **Nothing was fixed.** Every weakness recorded here is still live in the tree.

---

*16 August 2026. The instrument observed everything asked of it. Ten harnesses read it, and*
*not one asserts ordering, gap, or card count.*
