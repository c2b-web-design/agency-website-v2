# Q5 reveal stall — RE-OBSERVED on the current tree

**16 August 2026. OBSERVATION ONLY.** No diagnosis, no attribution, no trace opened.
This file records what the frames show and nothing beyond it.

Prior record: `q5-reveal-stall-filmed-15-august.md` (film from the **pre-fix** build
`jDrD-05vIuNLxHLfOlGpe`, 14 August; `.webm` committed at `cbd7ad3`).

---

## WHY IT WAS RE-OBSERVED

Since the film the tree has changed: the CSS split, the entrance work written and unwound,
the 0.78 dimming now actually applied (it had never reached a stylesheet — see
`css-parse-error-15-august.md`), and the extras fade 300ms → 900ms.

**Nobody had looked at the reveal since.**

---

## ⚠ THE PREDICTION, WRITTEN BEFORE THE CAPTURE

Per the standing rule that a prediction is recorded before the measurement:

> **I expect the stall to still reproduce, at roughly the same magnitude.**
>
> Q5 follows the **Begin click**, not a corridor step. At Begin there is no recession, no
> outgoing copy at pdepth-1, no `corridorMoving`. The split governs how a phrase
> **recedes**; Q5 does not recede on arrival, it appears. The entrance work was Q4–Q1;
> Q5 always had its entrance. The 0.78 dimming is scoped `.enquiry-pdepth-1` and Q5 is
> depth 0. The extras fade is the `-out` class, outgoing only.
>
> **All four are depth-1/outgoing concerns; Q5's reveal is a depth-0 arrival.** None of
> them plausibly touches it. If it has changed materially, my model of the split's scope
> is wrong and that is the finding.
>
> Caveat held at the time: the stall's **cause was never established**, so "the split
> does not touch the reveal" is an argument about the split, not a claim about the cause.

**IT WAS HALF RIGHT.** Same place — exactly the same character. **Different duration.**

⚠ **LEFT UNRECONCILED, DELIBERATELY.** Reconciling it means attributing, and attribution
is out of scope for this observation. The discrepancy is recorded, not explained. **Do not
let a later reader find this and assume it was resolved.**

---

## THE RESULT — IT REPRODUCES, AT THE SAME CHARACTER

**Build:** current tree at `81e04b2`, dev server `:3100`, 1440x900.
**Renderer:** ANGLE (AMD Radeon(TM) Graphics, D3D11).

| | 14 Aug film | **16 Aug, current tree** |
|---|---|---|
| Frames | 204–221 (18) | **197–206 (10)** |
| Duration | ~720ms (bounded 680–760) | **~400ms (bounded 360–440)** |
| Text position | `Q5 Wh` — mid-word | **`Q5 Wh` — mid-word, IDENTICAL** |
| Sampling | 40ms | 40ms |

**The freeze sits at exactly the same character:**

- **f196** — `Q5 W` (the W complete, alone)
- **f197 → f206** — **`Q5 Wh`, STATIC. Ten consecutive frames.**
- **f207** — `Q5 Wha` (motion resumes)

**The word "What" is incomplete throughout the freeze** — the same signature the 14 August
record describes, at the same point inside the first word.

---

## ⚠⚠ THE DURATIONS ARE NOT COMPARABLE — DO NOT RECORD THIS AS AN IMPROVEMENT

**~400ms against ~720ms is NOT a measurement of change.** The two numbers come from:

- **different days**, with different machine state
- **dev server here**, and the 14 August film's build was a different serving context
- **single runs on both sides** — no repetition, no distribution, no variance figure

⚠ **A single run cannot separate a real change from run-to-run variance.** Two numbers
from two sessions are two anecdotes, not a trend.

**WHAT CARRIES ACROSS IS THE QUALITATIVE SIGNATURE:** the reveal freezes, mid-word, at the
same character, plainly visible at 40ms sampling. **THE DURATIONS DO NOT CARRY.**

⚠ **Anyone citing "720 → 400" as progress is misreading this file.** It is not stated here
because it is not established here. If the magnitude matters, it needs repeated runs on
one build in one session — which this was not.

---

## ⚠ METHOD NOTE — Q5 ARRIVES ~7.8s AFTER BEGIN, NOT ~2.5s

**The first capture used a 2500ms window and MISSED THE REVEAL ENTIRELY.** It caught only
the opening sequence ("Let's understand what your business needs to become."); Q5 appeared
fully-formed at the very last frame, its reveal cut off at the boundary.

**Q5's question reveal begins around 7.8s after the Begin click.** The capture window must
cover that — 9000ms was used here and was sufficient.

⚠ **Anyone repeating this needs that number before they start**, or they will film the
opening and conclude the stall is gone.

### The two-part method held, and part 2 corrected part 1

**Part 1 — the byte plateau, as LOCATOR.** f199–f206 alternate ±5 bytes: the VP8
encoder-noise signature. No MD5 (every static frame hashes differently — that trap is in
the 15 August record).

**Part 2 — reading the frames, as CONFIRMATION.** f199 and f206 read identical by eye,
both `Q5 Wh`.

⚠ **AND PART 2 CORRECTED PART 1: f197 and f198 are visually IDENTICAL to f199 but sat
OUTSIDE the byte plateau.** The plateau under-reported the stall by two frames — 8 frames
by bytes, **10 frames by eye**. The amendment this forces on the 14 August record is
written up there; see below.

---

## ARTEFACTS — ⚠ SESSION-SCOPED, NOT COMMITTED

```
scratchpad/reveal-capture2/page@f3163db5ce9f1f901bb0e0fbe7e03e2e.webm   (1.2MB)
scratchpad/reveal-capture2/frames/scan_001.png ... scan_445.png         (445 frames)
scratchpad/reveal-capture/                                              (the short, failed 2500ms capture)
```

Full scratchpad root:
`%LOCALAPPDATA%\Temp\claude\c--Users-Carl-Buckley-agency-website-v2\2d1b3382-5e4e-4f0d-bb6d-2a0e32ab4d33\scratchpad\`

⚠ **THESE ARE IN SESSION SCRATCH AND WILL NOT SURVIVE.** They are not in `verify/out/`
(deliberately — `corridor-filmstrip.mjs` `rmSync`s that directory), but scratchpad is
session-scoped and no more permanent.

### ⚠ DO THEY NEED COMMITTING, AS `cbd7ad3` DID?

**Recommendation: NO, not on the same footing — but the decision is Carl's and it expires
with the session.**

The 14 August `.webm` was committed because it was **the first visual record of a defect
that had gone four sessions without one** — it was the evidence that the stall exists at
all. **That job is done and its artefact is permanent in git history.**

This capture is a **re-observation of an already-established defect**, and its own headline
finding is that **its duration figure should not be relied upon.** Committing a 1.2MB
`.webm` to preserve a number this file explicitly says is not comparable would give that
number a permanence it has not earned.

⚠ **BUT IF THE MAGNITUDE EVER BECOMES THE QUESTION, THIS FOOTAGE IS GONE AND THE RUN
CANNOT BE RECOVERED** — a fresh capture would be a different run on a different day, which
is exactly the problem this file describes. **If Carl wants the option preserved, it must
be committed now.** After the session it is not a decision anyone can make.

---

## WHAT THIS DOES NOT COVER

- **One run. Desktop 1440x900 only. Dev server.**
- **40ms frame quantisation** — the magnitude is BOUNDED (360–440ms), not exact.
- **NO ATTRIBUTION.** No trace opened, no cause investigated, nothing said about why.
- **Says nothing about mobile**, about any question other than Q5, or about the corridor
  step (the ~240ms/step, ~180ms gap and 67.2ms button figures remain unreconciled against
  the reveal — see the 15 August record; **that is still not answered**).

---

*16 August 2026. It reproduces, at the same character. The duration is not a measurement.*
