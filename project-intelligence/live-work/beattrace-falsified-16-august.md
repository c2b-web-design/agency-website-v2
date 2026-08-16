# `?beattrace=1` — FALSIFIED. The instrument is sound; the dependents are not.

**16 August 2026.** First falsification of the instrument ten `verify/` harnesses depend on.
Three injections plus a cost measurement. **Nothing fixed, nothing diagnosed, nothing
committed beyond this record** — every injection reverted, tree clean.

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

⚠ **THE SHAPE IS THE SAME EACH TIME: the instrument and the thing under test draw on one
declaration, so the check cannot fail in the direction that matters.** Instance 3 is
distinct from 1 and 2 in one respect worth keeping: **the instrument itself was clean.**
The circularity lived entirely in the consumers. **A sound instrument does not make a sound
check.**

Existing reference: *a harness sharing a constant with the fix*.

---

## WHAT THIS FALSIFICATION DID NOT COVER

- **Desktop only, 1440x900.** No mobile.
- **One question (Q5).** The Q4–Q1 total-absence case was NOT exercised — it was reasoned
  about, not injected.
- **No reduced-motion path.**
- **Channel A's `performance.mark` cost was not isolated** from Channel B's; the flag gates
  both.
- ⚠ **Nothing was fixed.** Every weakness recorded here is still live in the tree.

---

*16 August 2026. The instrument observed everything asked of it. Ten harnesses read it, and*
*not one asserts ordering, gap, or card count.*
