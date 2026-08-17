# The reveal instrument — item 3, extension landed

**17 August 2026.** Carl's decision: **extend `q5-card1-halfway.mjs`'s approach rather than
build the spec's poller**, and **defer the stall poller to its own chunk**. Both accepted and
implemented as decided.

---

## What landed

- **`verify/lib/reveal-ratio.mjs`** — the shared read. ⚠ Used by BOTH the instrument and its
  perturbation control, deliberately: a control running different code from the instrument
  answers the question about code nobody ships.
- **`verify/reveal-ratio-control.mjs`** — the perturbation gate (Condition 1).
- **`verify/reveal-ratio.mjs`** — the instrument, walking Q5→Q1.

**No product code changed.** `corridor-motion` 0.0%, `paint-order` 336/336.

---

## ⚠⚠ CONDITION 1 — THE GATE, RUN FIRST, BAND PRE-REGISTERED

Stated before any number was seen: **6 runs per arm, interleaved; ACCEPT if the mean
fall-through delta ≤ 1.0/run; REJECT on any asymmetric-clean arm; VOID if neither arm
reproduces the defect.**

```
  pair 1   attached: 2   unattached: 1
  pair 2   attached: 2   unattached: 2
  pair 3   attached: 1   unattached: 2
  pair 4   attached: 0   unattached: 2
  pair 5   attached: 2   unattached: 2
  pair 6   attached: 2   unattached: 1

  attached    mean 1.50      unattached  mean 1.67      |delta| = 0.17   ✅ ACCEPT
```

**Both arms reproduced the defect**, so the control is not void. **Nothing was tuned.**

⚠ **Noted for honesty:** attached pair 4 shows a 0. The pre-registered rule rejects only if
one arm goes clean *while the other never drops below 3*; the unattached arm has 1s, so it
does not trip. **The distributions overlap (0–2 both arms).** Recorded rather than smoothed.

---

## ⚠⚠ THE FIRST VERSION WENT GREEN ON A KNOWN-BROKEN BUILD

**The primary check is that an honest production run must go RED today. The first version
went GREEN — ~50% at every question — on a build where the anchor demonstrably falls through
to `now`.**

**It was measuring a tautology.** When the anchor falls through, the entrance synthesises
`revealStart = nowMs - CARD_FIRST_ENTRANCE_MS`, so card 1's beat lands exactly one rung after
that origin **by construction**. The element's real `startTime` sits within a few ms of it,
because the fall-through happens as the new reveal begins. **The ratio reads 50% however
untethered the cards actually are.**

⚠ **Mode A by arithmetic, not by choreography — the exact trap `?anchortrace=1` was built to
expose for the anchor fix, reproduced inside the instrument written to detect it.**

**The fix:** the harness now reads **which rung the code actually used** and asserts on it. A
ratio computed from an anchor the code did not use is not a measurement.

---

## ⚠ THREE MORE INSTRUMENT DEFECTS FOUND BY RUNNING IT

1. **The `noreveal` injection silently did not inject.** A `MutationObserver` could not beat
   React re-adding the class; the run reported `present=true` and still went RED — **for the
   unrelated ratio faults.** A red from an injection that never took would have been recorded
   as "the injection works". ⚠ **Caught by the resolution report** (spec §7's requirement to
   print what was resolved). Now stripped on an rAF loop; reports `present=false` and REDs on
   *"no animation resolved"*, never 0%.

2. **It read the ladder too early and invented a defect.** It reported **3 of 5 beats** at
   Q4–Q1 and raised it as a finding. `trace-identity.mjs` reported **5**, correctly, on the
   same build. The difference was read time: 3000ms after the step, when the last rung fires
   at 2890ms **plus its own rise**. ⚠ **Waiting for the state rather than guessing a duration
   is this project's own standing rule, and it was broken here on the first attempt.** Now
   waits for five keyed beats.

3. **It merged rungs across runs.** Printing a union per question made Q5 look like it fell
   through, contradicting the raw trace. Now reported as **N/M runs**.

---

## THE MEASUREMENT (production, 3 runs)

```
  question   ratio     into reveal   beats   anchor rung    verdict
  Q5          50.1%       652ms       5   1/3 now        ⛔
  Q4          50.2%       652ms       5   2/3 now        ⛔
  Q3          52.0%       676ms       5   3/3 now        ⛔
  Q2          51.5%       669ms       5   3/3 now        ⛔
  Q1          51.5%       670ms       5   3/3 now        ⛔
```

### ⚠ TWO FINDINGS THAT CHANGE THE PICTURE OF THE ANCHOR FAULT

1. **⚠ Q5 FALLS THROUGH TOO — 1 of 3 runs.** Every prior measurement had Q5 clean. **The
   fault is not confined to Q4–Q1**, and any fix judged only on Q5's Mode A rate would be
   judged on an unreliable control.
2. **It is PROBABILISTIC PER QUESTION, not positional.** One run showed Q5, Q4, Q3 and Q1
   clean with **only Q2** falling through. ⚠ **"Q4–Q1 are broken, Q5 is fine" is too neat a
   description of what is actually happening.**

⚠ **The ratio stays near 50% even when the anchor is synthesised** — which is exactly why the
rung column, not the ratio, is the load-bearing assertion.

---

## Falsification

| Check | Result |
|---|---|
| **honest, production, today** | ⛔ **RED** — the primary check, no injection needed |
| `noflag` | ⛔ RED "no trace at all" |
| `noreveal` | ⛔ RED "no animation resolved" — ⚠ **not 0%** |
| Q5 cross-check vs `q5-card1-halfway.mjs` | ✅ **50.2% / 653ms both** — two instruments, one number |

⚠ **The pre-registered red shape was "no reveal resolvable"; the actual red is
fall-through-to-`now`.** Different shape from the prediction. Recorded as a discrepancy rather
than claimed as confirmation.

## The floor — measured, nothing inherited

Two captures, same tree, production: ratios **50.1–51.5%** (651–669ms). **Worst spread ~1.4
points / ~18ms.**

⚠ **The ±30ms is Carl's stated spec (11 August), NOT a floor.** Run-to-run noise of ~18ms
**fills more than half of it**, so the tolerance discriminates poorly at this resolution.
**Reported as a finding; the tolerance was not widened.**

## What it does not watch

- ⚠ **Whether the reveal STALLS.** A mid-wipe freeze produces no event and no value change
  here — `startTime` and `getTiming()` describe intent. **That is the deferred poller.**
- **Pixels.** The video track remains the only unperturbing observation of what was shown.
- **Mobile** — named as excluded; the reveal is 1300ms at both widths, so this is not a
  timing gap, merely unexercised.

*17 August 2026. The reveal finally has a column. ⚠ Its first reading was a tautology, and the
rung trace is the only reason that was caught.*
