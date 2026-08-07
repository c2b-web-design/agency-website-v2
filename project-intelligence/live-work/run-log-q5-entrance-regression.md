# Run log — the Q5 entrance regression, and the Builder work that made it worse

**Written 6 August 2026, during the session, by the Builder.**

⚠ **THIS FILE EXISTS BECAUSE THE PREVIOUS ONE DID NOT.** The last session's handoff
carried a confident diagnosis and no record of what had actually been changed or
measured. When that conversation was cleared, the reasoning went with it and this
session restarted from a wrong instruction written in the Builder's own hand. See
§6 — that is the governance failure, and it is the Builder's, not Carl's.

---

## 1. Where things stand — READ THIS FIRST

**Carl's report on the current working tree, after three Builder fix attempts:**

> *"The q5 reveal stutters. No card overlap. Black rectangle still there. Its worse"*

**All three symptoms are present and CONFIRMED IN CAPTURED FRAMES**
(`verify/out/nowstate/`):

| t | what is drawn |
|---:|---|
| 1699ms | card 1 is a **solid black rectangle** — no rim, no interior, nothing |
| 2111ms | card 1 alone on screen, faint rim only; cards 2–5 still hidden |
| 2945ms | cards 1–3 visible at three brightnesses |

The card at t=1699 is at `raw` 0.52 by the entrance's own trace. **It is drawn and
unlit.**

⚠ **THE WORKING TREE IS WORSE THAN `HEAD`, AND WORSE THAN `fe352b4`.** Everything
uncommitted is the Builder's from this session. Reverting costs Carl nothing of
his own — every commit through `0961332` is intact.

---

## 2. What the Builder changed this session — the record that should already have existed

All uncommitted, in `answer-card-canvas.tsx` unless noted.

| # | change | status |
|---|---|---|
| 1 | Ramped `transmission` with the entrance | **REVERTED** — see §3.1 |
| 2 | Visibility gate `lit >= 0.5` | **REVERTED** — see §3.2 |
| 3 | `CARD_RISE_GAP_MS` → `* CARD_OVERLAP` (1440ms gap) | **REVERTED** — see §3.3 |
| 4 | `envMapIntensity` floor sweep | **REVERTED** — dead end, §3.4 |
| 5 | Reveal-clock anchor, unclamped | **IN TREE, clamped in #6** — §3.5 |
| 6 | Overrun clamp on the anchor | **IN TREE** — §3.5 |
| 7 | Warm-up render: reveal groups at `scale 0` | **IN TREE** — §3.6 |
| 8 | `?beattrace=1` per-frame `raw` trace | **IN TREE** — inert without the flag |
| 9 | `CARD_OVERLAP` comment correction (geometry) | **IN TREE** — comment only |

---

## 3. Each change, what it was for, and what it actually did

### 3.1 The transmission ramp — the previous handoff's prescription. IT DOES NOT WORK.

The 6 August handoff diagnosed the entrance step as "the transmission pass
engaging" and prescribed ramping `transmission` alongside `color` and
`envMapIntensity`. **Both halves of that are wrong in a way worth recording:**

- **It does not remove the step.** With the ramp in place `verify/entrance-drop.mjs`
  still reported **−11.63**, unchanged. At `lit ≈ 0` the face is black whatever its
  transmission is.
- **It made the card arrive as an opaque grey slab.** Carl: *"The cards should not
  appear with a full grey face even though it fades."* **Transmission is what makes
  the face glass. It is not a fader.**

⚠ **A CAUSE CONFIRMED AGAINST A CONTROL IS NOT A FIX CONFIRMED AGAINST ONE.** The
handoff's control (clay vs glass) genuinely established that only glass shows the
drop. It never tested that ramping transmission fixes it, and the Builder treated
the diagnosis as if it had.

⚠ **A SECOND BUG INSIDE THE FIX.** The first version sampled `transmission` into
the `originals` map, so the ramp read its own previous write, latched `base = 0`,
and pinned the face at 0.001 permanently. **A ramp must never derive its origin
from the thing it is ramping.**

### 3.2 The `lit >= 0.5` visibility gate — treats the symptom, kills the choreography

Stopped the card being drawn while darker than the ground. It also hid the entire
first half of every rise, so cards switched on at half brightness and the stagger
collapsed. Carl: *"the appearance of the cards are bullet like, not smooth."*

### 3.3 `CARD_RISE_GAP_MS` — changing approved behaviour to satisfy a comment

`CARD_OVERLAP` = 0.72 with `(1 - CARD_OVERLAP)` gives a **560ms** gap. The comment
above it claimed each card starts at 72% of the previous. The Builder "fixed" the
arithmetic to match the prose, producing a 1440ms gap. Carl rejected it: *"There is
no overlap between ths cards."*

⚠ **THE CODE WAS THE APPROVED OBJECT AND THE COMMENT WAS ASPIRATIONAL PROSE.** One
clause was wrong; the constant, its name and the arithmetic were all correct. Now
corrected at source — the rises *overlap by* 72%, the next beginning 28% in.

### 3.4 The `envMapIntensity` floor — a measured dead end

Swept 0 → 0.4 against a ground of 16.59; lowest luminance only reached 9.00. Would
need a floor near 1.0, i.e. no fade. **Recorded so it is not retried.**

### 3.5 The reveal-clock anchor — fixes a real bug, and CAUSED A WORSE ONE unclamped

**The real bug it fixes:** the ladder's zero was `useCardEntrance`'s own
`performance.now()`, which runs when the canvas mounts — after the CSS reveal has
started. Card 1's rung fired at **71%** of the reveal, not 50%.

**The bug it caused:** `.enquiry-q-text-reveal` is `1300ms ... both`. The `both`
fill keeps the animation relevant forever, so `startTime` stays readable and **the
fallback never fires**. The effect is gated on `compiled` (~1944ms), so the anchor
returned an origin ~1944ms in the past and the first frame consumed every rung
already passed. Measured (`verify/entrance-fade.mjs`):

```
card 650    starts 0ms    52 frames of rise left
card 1210   starts 0ms    86 frames
card 1770   starts 0ms   120 frames
```

**Cards 1, 2 and 3 visible in the same frame.** That is Carl's *"no overlap …
rectangular black shape"*, caused by the Builder and then hunted through commit
history for two turns while it sat in the Builder's own uncommitted diff.

⚠ **CAUGHT BY THE ARCHITECT, NOT BY THE BUILDER.** The clamp — use the anchor only
while it has not overrun `CARD_FIRST_ENTRANCE_MS`, else degrade to current
behaviour — is the Architect's, as is matching the animation by `animationName`
rather than `getAnimations()[0]`.

⚠ **AND IT LOOKS IDENTICAL TO A WORKING STAGGER IN A STILL.** Three cards at three
brightnesses is consistent with a correct ladder AND with one that consumed three
rungs in a frame. **Screenshots cannot tell them apart. Only the per-frame trace
can.**

### 3.6 The warm-up scale-to-zero

`useScenePrecompile` reveals hidden groups so the transmission pass allocates. Its
"invisible anyway" justification assumed the lockup behind the cards at fade 0 —
**the lockup was removed on 5 August**, so the frame became a visible flash at
~254ms (16.00 → 4.65 → 16.00). Revealing at `scale 0` keeps the draw call.

**Accepted on gap 1, not on the flash:** 568ms across three runs against a 560ms
target, clear of the ~263ms that would mean the warm-up had gone no-op.

---

## 4. The nondeterminism finding — this is the important one

**Card 1's phase against the reveal, same build, same machine, minutes apart:**

| | phase |
|---|---:|
| warm × 5 | 50%, 50%, 50%, 50%, 50% |
| cold × 1 | **169%** |

`entranceRunning = active && compiled && warm`. `compiled` waits on two
`compileAsync` passes plus a full `gl.render`, and `useLocalEnvMap`'s ~572ms of
PMREM runs outside every gate (a documented open defect).

⚠ **SO THE PHASE WAS NEVER FIXED — IT FLOATED WITH COMPILE LATENCY.** That produces
*"Carl approved it by eye, and now it looks wrong, with no code change"* without a
regression existing. **The disease is a ~2.5s compile on the critical path of a
1300ms reveal.** The anchor is only satisfiable when it isn't.

---

## 5. Instrument failures — every one of these produced a wrong conclusion

| instrument | what it reported | what was true |
|---|---|---|
| screenshot-per-sample fade trace | cards 1 and 2 in lockstep, 0ms gap | artefact; ~40–130ms/sample cannot resolve a 560ms stagger |
| coarse threshold sweep | 0.2 "clean" | a finer trace found −9.16; a constant was set from it |
| clock-offset probe | drift = 17ms | sampled only once the canvas was ready — past the drift it measured |
| `entrance-drop.mjs` | "CONFIRMED: transmission pass" | correct about the cause, silent on whether the fix works |

⚠ **A SAMPLER SLOWER THAN WHAT IT SAMPLES WILL INVENT A DEFECT AND HIDE A REAL
ONE.** `useCardEntrance` now publishes `raw` per card per frame under
`?beattrace=1` for this reason.

⚠ **AND `raw` IS INTENT, NOT WHAT WAS DRAWN.** The trace reported a correct ladder
while the frames showed a black rectangle. Both were true. **A trace of the
animation's intent cannot detect an unlit card.**

---

## 6. The governance failure — the Builder's, and the reason this file exists

⚠ **THE PREVIOUS HANDOFF ASSERTED AN UNVERIFIED FIX AS THE ROUTE TO TAKE.** It was
written up with a control, a measurement and a recommended change, and the change
had never been tested. Written down, it read as verified. This session followed it
and lost hours.

**CLAUDE.md already forbids this:** *"a claim written into `project-intelligence/`
stops being your opinion and becomes something others rely on — and it will be read
as verified because it is written down. If it has not been tested, say so in the
file."*

⚠ **AND NO RUN LOG WAS WRITTEN AT ALL.** Carl writes prompts; **the Builder writes
the files.** When the conversation was cleared, nothing survived it but a wrong
diagnosis. The Builder then blamed the clear, and Carl was right to reject that:
*"the it wasnt me Guv is a cop out."*

**Rule for next time: write the run log AS THE WORK HAPPENS, including the attempts
that failed and the measurement that killed each one.** A fix with no recorded
falsification test is not a finding.

---

## 7. Builder process errors this session

1. **Checked out an old `answer-card-canvas.tsx` over uncommitted work** mid-investigation; three edits had to be rebuilt from context.
2. **`git checkout fe352b4 -- components/enquiry/` silently resurrected and STAGED `answer-card-mark.ts`**, deleted with the lockup. Caught two turns later. **A path-scoped checkout restores deletions as additions.**
3. **Told Carl a defect was inherent, twice**, when it was the Builder's own regression.
4. **Framed Carl's report as "your eyes vs the instrument"** when he had simply stated the state.

---

## 8. What is actually known about a "good" state

- **`fe352b4` (lockup removal) reads correctly in captured frames** — card 1 lit, card 2 mid-fade with rim and interior, card 3 starting (`verify/out/fe352b4/`). **Not confirmed by Carl by eye.**
- **At pure `HEAD`, entering cards have rim structure** — dim glass, not black rectangles (`verify/out/pure-head/`).
- **Only `enquiry-opening.tsx` changed between `fe352b4` and `HEAD`** (`00dffed`, the `?skip=1` dev door). The Architect examined its lazy `useState` initialiser and concluded it cannot touch the ladder — it is a pure initialiser with no side effects, and the canvas mounts only on `stage !== "opening"`.

⚠ **NOTHING HAS BEEN CONFIRMED GOOD BY CARL.** The Builder treated `HEAD` as a
known-good baseline all session; **that assumption came from the Builder, not from
Carl.** The stutter Carl reports on the reveal itself is not explained by anything
above.

---

## 9. Verify harnesses added (all untracked, none affect runtime)

| file | what it answers |
|---|---|
| `entrance-step.mjs` | prints EVERY step — found the real shape of the defect |
| `entrance-fade.mjs` | reads the rAF trace; measures the stagger honestly |
| `q5-card-latency.mjs` | rung vs the reveal animation's own `startTime` |
| `q5-face-arrival.mjs` | saves frames + stdev — how "grey slab" was told from "glass" |
| `q5-clock-offset.mjs` | the two clocks (⚠ sampled at the wrong instant — see §5) |
| `q5-card-vs-reveal.mjs` | card 1's phase from pixels |
| `entrance-threshold.mjs` | threshold sweep (⚠ was too coarse — see §5) |

---

*The state is Carl's to direct. The Builder has made this worse three times and
should not choose the next step alone.*
