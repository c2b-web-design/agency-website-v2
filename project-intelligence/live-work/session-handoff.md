# Session Handoff — 17 August 2026 (the boundary is BUILT; the cards are choreographed)

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## STATE

**Branch `fix/q5-stall-and-label-colour`. TREE CLEAN.** Servers: none. Ports 3000/3100 free.

**Local and remote level** — verified by `git ls-remote`, not by trusting push. SHA at the
foot of this file.

---

## WHAT LANDED TODAY — SEVEN COMMITS

```
b2aaf05  corridor-motion was measuring a static element        (harness only)
cbedda1  the question boundary is a phase machine              (Step 1)
41d429a  Q4-Q1 get a card entrance — the epoch re-arms it      (Step 2)
06d527c  the reveal anchor is stamped with its question        (+ rung trace)
190ff1f  the reveal finally has a column — card 1's ratio      (item 3)
a20a19d  the entrance predicts the reveal's start              (candidate 3)
ede6eb0  the text jump is PRE-EXISTING                         (docs only)
```

**Where it got to:** the ratio is **50.2% at every question** on production, **zero
fall-throughs to `now`**, and the rung is asserted alongside the ratio. Q4–Q1 have a card
entrance for the first time; the boundary has a name the system can read.

---

## ⚠ WHAT IS STILL OPEN

### 1. The text jump — characterised, NOT fixed. **The fix is Carl's.**

`text-jump-17-august.md` (`ede6eb0`). **Pre-existing**, identical to the digit on `a8996b7`
and `a20a19d`, stylesheet byte-identical. `gap` and `letter-spacing` snap at the pdepth flip
and are **not in the transition list**; `font-size`/`font-weight` do not change on that frame.
**Whether they should ease, and on what curve, is a design question — Carl's.**

### 2. Item 4 / Step 3 — the card exit. **CARL SETTLES THE SEVEN.**

`card-exit-spec-16-august.md`. ⚠ **Today the cards have NO exit at all** — only the DOM box
fades. A replacement, not a retiming.

### 3. ⚠⚠ THREE OF THE SEVEN ARE BLOCKED ON CARL SEEING THE 0.78 DIMMING

**It has still never been viewed by eye.** It first reached a stylesheet at `a8cee4b`.
Outgoing cards depart at **0.78 now, 1.0 before**. It blocks **#6** (does it fight the WebGL
exit), **#1** (curves) and **#3** (compression). **Items 2, 4, 5 and 7 do not depend on it.**
**Costs one walk.**

### 4. Item 5 — the card-1 entrance delay. Characterised and correctly named, NOT explained.

**Still live:** `card-1-anchor.mjs` fails **1 run in 3, on the cold run, ~450ms drift** —
**verified identical on the stashed pre-change build**, so not caused by this week's work.

### 5. Item 6 — mobile. **Never looked at.** Rects yes, pixels no.

### 6. The stall poller — deferred from item 3 to its own chunk, on Carl's decision.

**Nothing measures whether the reveal STALLS.** A mid-wipe freeze produces no event and no
value change in any instrument that exists.

### 7. The ~18ms floor observation — **recorded, NOT established, not chased.**

The ratio instrument's floor is close to one frame interval. It *may* be the same
quantisation. **Not investigated, deliberately.**

---

## ⚠⚠ THINGS A FRESH SESSION WOULD OTHERWISE REPEAT

- ⚠ **Q5 IS NOT A CLEAN CONTROL for the anchor fault.** It fell through **1 run in 3**. The
  fault is **probabilistic per question, not positional** — one run had only Q2 fall through.
  "Q4–Q1 broken, Q5 fine" is too neat a description.
- ⚠⚠ **~50% BY ARITHMETIC AND ~50% BY CHOREOGRAPHY ARE INDISTINGUISHABLE ON THE RATIO
  ALONE.** When the anchor falls through, `revealStart` is synthesised as
  `now - CARD_FIRST_ENTRANCE_MS`, so card 1 lands one rung later **by construction** and the
  ratio reads ~50% however untethered the cards are. **THE RUNG IS WHAT SEPARATES THEM.
  ASSERT BOTH.** This tautology was found *inside* the instrument built to detect it.
- ⚠ **`published <= nowMs` guards RUNG 1 ONLY.** The prediction is its own rung and bypasses
  it. It looked like a precondition for the whole candidate and **resolved by not applying** —
  the guard was never changed and is still correct.
- ⚠ **THE ~1000ms `animationstart` LATENESS WAS WITHDRAWN.** n=1 reported as a property; it
  did not reproduce (17–18ms on every fresh-browser run). **Do not resurrect it.**
- ⚠ **THE COMPUTED-BOUNDARY OPTION WAS REJECTED, and the reason matters:** arithmetically
  excellent (0.1ms median) but **wrong by a full frame 30–37% of the time** when the last
  frame boundary is stale — precise in the easy case, wrong in the busy case the anchor exists
  for. It also needed cached frame-interval state (`document.timeline` exposes only
  `currentTime`; `screen.refreshRate` does not exist).
- ⚠ **CARL'S TOLERANCE IS ±30ms on the 650 mark. The measurement floor is ~18ms**, so the
  tolerance **discriminates poorly at this resolution.** ⚠ **That is a FINDING, not a number
  to widen.**
- ⚠ **CARD 2 IS CUED AT 28% INTO CARD 1's 2000ms ENVELOPE**, leaving **72% as tail**
  (`CARD_RISE_GAP_MS` 560 against `CARD_RISE_DURATION_MS` 2000). ⚠ `CARD_RISE_DURATION_MS` is
  **PROVISIONAL under D-035** — Carl tunes it by eye.
- ⚠⚠ **THE REVEAL IS A SINGLE FIXED 1300ms FOR EVERY QUESTION** (`globals.css:1314`), and
  `CARD_FIRST_ENTRANCE_MS` is `Q5_REVEAL_MS / 2` from that one number. **Carl's design intent
  was durations set against average reading speed** — so "halfway" is only halfway *in a
  reading sense* at whichever question 1300 was derived for. **Recorded as a design finding.
  Carl's to decide.**

---

## THE CONSTANT, AND WHY IT IS NOT A DIAL

`REVEAL_START_OFFSET_MS = 6.45` (`answer-card-geometry.ts`). **Measured, not chosen:** 40
question-steps across 10 production walks, min −1.50ms, max 14.40ms. **The midpoint bounds
worst-case error at ±7.95ms.**

⚠ **The spread is QUANTISATION, not uncertainty.** Every offset fell inside one frame
interval (16.70ms measured) and the reveal's `startTime` lands exactly on a frame boundary
(30/32). ⚠ **It describes frame scheduling, not choreography — if it needs to change, the
reason is that the MEASUREMENT moved. Re-measure it; do not tune it by eye.**

**The self-check publishes drift every run** (`__anchorTrace.deltaMs`), asserted at one frame
by `anchor-freshness.mjs`. Honest: n=30, 0.8–7.0ms, median 6.4.

---

## ⚠⚠ SEVEN INSTRUMENT DEFECTS IN THREE DAYS — STILL CARL'S

Several were found **inside instruments built to catch the fault they then reproduced.** They
are recorded individually where they were found:
`instrument-defects-17-august.md`, `reveal-ratio-instrument-17-august.md`,
`anchor-stamp-17-august.md`, `mode-ab-finding-17-august.md`, `text-jump-17-august.md`.

⚠⚠ **DO NOT CONSOLIDATE THEM AND DO NOT DRAW A RULE FROM THEM. Carl is holding that pattern
and will lead it himself.**

---

## SERVING

`npm run build && npx next start -p 3100` for anything measuring pacing, mode, or the ratio —
**production is the verdict.** ⚠ **Dev and production DISAGREE on the anchor fault** (0/75
fall-throughs on dev, 25 on production); **dev alone reported it fixed.**

`?phasetrace=1` boundary edges · `?beattrace=1` the ladder · `?modetrace=1` Mode A/B ·
`?anchortrace=1` which rung answered **and the prediction's drift**.

⚠ Kill servers **by PID** and confirm the port free — `TaskStop` has reported success on a
held port.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session
length, not a suggestion to stop or resume later. **Carl decides when a session ends and will
say so.** It was not broken this session.

---

*17 August 2026. ⚠ **The cards now arrive in a fixed relationship to the text at every***
*⚠ **question. What no instrument can yet see is whether the text arrives smoothly — and***
*⚠ **the one fault Carl can see by eye has no harness at all.***
