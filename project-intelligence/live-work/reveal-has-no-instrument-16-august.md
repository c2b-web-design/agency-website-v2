# The Q5 reveal has NEVER been profiled — it has no instrument

**16 August 2026. READ-ONLY FINDING.** No code, no instrument, no diagnosis, no attribution.
Nothing was run to produce this; it is a reading of the source.

---

## THE FINDING

**The Q5 reveal has never been profiled and has no instrument.**

`?beattrace=1` — the only trace flag in this area — covers the **CARD ENTRANCE**. That is a
**third thing**: neither the reveal nor the corridor step.

It shares exactly one thing with the reveal: **clock zero.** The entrance measures

```
elapsed = performance.now() - revealStart
```

so it depends on **when the reveal started**. It records **nothing about what the reveal
does after that point** — no wipe progress, no per-character advance, nothing that could
show text frozen at `Wh`.

**The reveal is the text wipe on the question span** (`.enquiry-q-text-reveal`, the 1300ms
horizontal mask). The entrance is five WebGL cards rising. Different element, different
mechanism. **The reveal is the ladder's INPUT, not its subject.**

### What `?beattrace=1` actually is — two channels, one flag

Both inside `useCardEntrance`, `components/enquiry/answer-card-canvas.tsx`:

| | Where | What | Written to |
|---|---|---|---|
| **A — beat marks** | `:1861-1867` | Each card's first visible frame, once | `performance.mark("card-beat-<delayMs>")` — the performance timeline |
| **B — progress trace** | `:1889-1895` | Per card, per rAF frame: `{t, card, raw}` | `window.__cardTrace` (global) |

Flag read **once** at `:1636-1638`, not per frame — deliberate, with a recorded note about
an SSR read that shipped as a bug (instrument fault #8). **No console output, no DOM
writes, no file writes.**

---

## ⚠ CORRECTION TO THE RECORD — WHAT WAS UNRUN

**`?beattrace=1` HAS been run, extensively.** Ten harnesses in `verify/` consume it:

```
approved-timings.mjs   card-1-anchor.mjs    entrance-fade.mjs
entrance-frames.mjs    label-with-card.mjs  q5-card-latency.mjs
q5-card1-halfway.mjs   stall-source.mjs     warm-collision.mjs
warm-guard.mjs
```

and `answer-card-canvas.tsx:3736` cites a value as one that *"must be measured with
`?beattrace=1` rather than assumed."*

⚠ **THE INSTRUMENT THAT WAS UNRUN ON 15 AUGUST WAS `corridor-filmstrip.mjs`** — the
harness whose never-viewed video track carried the filmed stall. **Do not conflate the
two.** The 15 August lesson (*"a harness never run, whose recording nobody had looked
at"*) belongs to the filmstrip, not to `?beattrace=1`.

---

## WHAT THIS RESOLVES — AN ABSENCE, NOT A CONTRADICTION

The 15 August handoff recorded an **"OPEN AND UNRECONCILED"** gap: the ~720ms reveal stall
against the ~240ms/step, ~180ms gap, 67.2ms button and ~112ms `PutChanged` figures — *"all
from the corridor STEP, an order of magnitude smaller."*

⚠ **THOSE FIGURES WERE NEVER COMPARABLE AND WERE NEVER IN COMPETITION.** They measure
**different phases of the flow.** The step figures describe a corridor transition; the
reveal figure describes a text wipe after Begin. Neither was ever evidence about the other.

**THE REVEAL'S COLUMN HAS BEEN EMPTY THROUGHOUT.**

⚠ **RESTATE THE HANDOFF ITEM: it is not a contradiction to resolve. It is an absence to
fill.** Anyone who opens that item expecting to reconcile two conflicting measurements is
chasing a conflict that does not exist — there is one measurement and one blank.

⚠ **AND THIS APPLIES TO THE 16 AUGUST RE-OBSERVATION TOO.** The ~400ms figure in
`q5-reveal-stall-reobserved-16-august.md` came from **counting video frames**, not from an
instrument. It remains the only class of evidence the reveal has ever had.

---

## ⚠ `?beattrace=1` IS UNFALSIFIED, WITH TEN DEPENDENTS — AN OPEN RISK

**It has never produced a known-wrong reading.** There is no falsification record for it.
It is another instrument that has **only ever been read as true**, and ten harnesses rest
on it.

**Two things that look like falsification and are not:**

1. **Its beat marks contradicted a screenshot-based harness** that reported cards 1 and 2
   rising in lockstep with a 0ms gap. The marks were right and the screenshots were the
   artefact. ⚠ **That is CREDIBILITY, not falsification** — it has been shown to disagree
   correctly with a worse instrument, never shown to go red on a known defect.

2. **`card-beat-650` matches the computed ladder** (`CARD_FIRST_ENTRANCE_MS`). ⚠ **THAT IS
   AN INSTRUMENT AGREEING WITH THE CONSTANT IT WAS DERIVED FROM** — precisely the failure
   mode already recorded in the *harness sharing a constant with the fix* reference, where
   `verify/q5-stutter.mjs` reported **0/3 CLEAN on a defect Carl could plainly see**,
   because its window and the fix came from the same 700ms.

⚠ **Recorded as an OPEN RISK. Not acted on here.** Falsifying it is its own decision.

---

## ⚠ ITS SILENCE IS AMBIGUOUS — IT CANNOT TELL A DEFECT FROM BEING SWITCHED OFF

**An empty `window.__cardTrace` is indistinguishable from "the flag was off."**

Both produce the same output: nothing. The harnesses that consume it print variations of
*"⚠ NO TRACE — `?beattrace=1` published nothing"* — which is the correct message for a
missing flag **and** for a missing entrance.

⚠ **THAT IS EXACTLY THE Q4–Q1 CASE.** Those questions have no card entrance: no mount, no
tick, **no trace**. The instrument that would report the defect is silent *because* of the
defect, in a way it cannot distinguish from not being asked.

**An instrument whose failure signal and whose off-state are the same signal cannot report
that failure.**

---

## ALSO RECORDED

### ⚠ Its main-thread cost is UNMEASURED

Channel B pushes an object per card per rAF frame. With four cards overlapping that is ~4
pushes/frame; across a 4240ms entrance the array reaches roughly **1000–1500 entries**, and
it **grows unbounded for the session** — no cap, no flush.

⚠ **Whether that is material against a ~400ms stall is NOT KNOWN.** The argument that it
sits orders of magnitude below `page.screenshot()` — no serialisation, no IPC, no GPU
readback — is **an argument from MECHANISM, not a measurement.** Given this project's
documented history of plausible-but-false timing claims, **it is flagged here as
UNMEASURED and must not be cited as small.**

### ⚠ The trace is written INSIDE the rAF tick it measures

If it ever did perturb timing, **it would perturb the very channel used to detect that.**
Stated as a structural property, not a claim that it does.

### What it does not watch

- **The reveal** — the wipe, its progress, its stall
- **The corridor step** — it is anchored to a question's reveal, not a transition
- **Anything post-entrance** — no exit, no steady state
- ⚠ **Pixels.** Card 5 could render invisibly and Channel B would still report a clean
  0 → 1 curve. It reports what the code *intended* per frame, not what was drawn.
- **Cards that never mount** — the ambiguous-silence case above
- ⚠ **The main thread itself.** No long-task recording, no frame-gap recording. **A stall
  BETWEEN its own samples appears only as a gap in `t`, which someone has to notice.**

---

## ⚠⚠ NOTHING HERE AUTHORISES BUILDING A REVEAL INSTRUMENT

This file records an **absence**. It does not specify, design or approve anything to fill
it. **What to measure — and whether to measure at all — is its own decision and comes
next.**

⚠ The obvious next move (*"add a trace to the wipe"*) is **not** licensed by this file. Any
such instrument would need falsifying before a green from it means anything, and would need
its main-thread cost established rather than argued — **both of which are the open
criticisms of the instrument that already exists.**

---

*16 August 2026. The reveal's column has been empty the whole time. That is the finding.*
