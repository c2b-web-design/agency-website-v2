# Architect question — the opening stutter, six wrong diagnoses in

**Raised by Carl, 4 August 2026: *"lets ask the architect."*** Drafted by the Builder for
Carl's approval before it is sent.

⚠ **THIS IS A DIAGNOSTIC QUESTION, NOT A CHUNK REQUEST.** It does not follow
`handoff-protocol.md` §1's chunk shape because no work is being scoped — the Builder is asking
for a second reading of a problem it has failed to solve six times.

⚠ **AND THE BUILDER'S OWN JUDGEMENT IS THE THING MOST IN DOUBT HERE.** Every one of the six
theories below was measured before it was acted on, and every one measured near zero. The
useful question is not only *"what is the fix"* but **"what is wrong with how this was being
diagnosed."**

---

## The symptom

**Carl:** *"the text on the start page, where the ivory button is, stutters."* The OPENING
choreography — text, subtext, ivory Begin button — **before Begin is pressed**. Not Q5.

Reproducible cold and warm, headed with `--enable-gpu`: **6–8 dropped frames, ~1740ms total
blocking work** across two tasks of roughly 700ms and 850ms.

**It arrived with the filament chunk.** An invisible warm-up canvas mounts during the opening so
its WebGL setup lands in dead time — added earlier the same day, when it was cheap.

---

## ⚠ What it actually is — read from a CPU call tree, not inferred

```
777ms   renderTransmissionPass          the warm-up render the Builder added
585ms   PMREMGenerator.fromScene        the environment map
  └ 542ms  _applyPMREM                  its blur chain
```

Both are **real work that has to happen**. Neither is shader compilation.

---

## ⚠ Six diagnoses, all measured, all wrong

**Recorded in full in `live-work/references/opening-stutter.md`.** Summarised so the pattern is
visible in one place:

| # | theory | measured result |
|---|---|---|
| 1 | Badly timed — reschedule the warm-up | 3 attempts; the last **moved** the stutter onto the Begin reveal |
| 2 | `checkShaderErrors` blocking queries | 1740 → 1692ms |
| 3 | Five point lights inflating every shader | 900 → 645ms **but broke the neighbour spill**; reverted |
| 4 | Dead GLSL from the retired travelling head | ~7%, worth doing anyway |
| 5 | `getActiveUniform` / `getUniformLocation` | 337 calls, **1ms** |
| 6 | Env-map resolution 200 → 64 | 585 → 580ms |

⚠ **THEORY 2 WAS TESTED TWICE AND THE FIRST TEST WAS BROKEN** — set on the wrong renderer, since
the warm-up canvas has its own. It was recorded as a dead end on evidence that did not support
the claim, then re-tested correctly and found to be a genuine but small effect. **Retiring a
correct-sounding hypothesis with a broken test is the worst outcome of the six.**

⚠ **AND SHADER COMPILATION — THE ASSUMPTION BEHIND THEORIES 1, 3 AND 4 — IS 0% OF THE BLOCKING
TIME.** 16 programs link in 0ms. The Builder spent five rounds on a cost that does not exist,
and the call tree that settled it took ten minutes.

---

## The trade the Builder cannot decide

⚠ **THE 777ms TRANSMISSION RENDER IS THE BUILDER'S OWN ADDITION.** It exists to fix a different
stutter Carl reported — *"the stall occurs between cards 1+2"* — by paying the transmission
pass's first-draw cost while the cards are still hidden. It worked: gap 1 went from 263ms to
~510ms against a 560ms target.

**Removing it would roughly halve the opening stall and bring the card-ladder stall back.**

⚠ **THAT IS A TRADE BETWEEN TWO STUTTERS, NOT A FIX, AND IT IS CARL'S CALL** — but the Architect
may see an option the Builder has not.

---

## What the Builder would ask

1. **Is there a third way** — splitting the two costs across frames so the browser paints
   between them, deferring the env map until after Begin, or something structural neither of
   these?
2. **Is the warm-up canvas the right idea at all?** It was introduced to move WebGL setup out of
   the Q5 phrase (a real, measured, previously-fixed defect). It moved that cost into the
   opening instead. **Is there a moment in this page that can absorb ~1.4s, or does the
   architecture need the cost to not exist?**
3. **What should have caught this at theory 1?** The Builder's own note: the task's DURATION
   never changed across three reschedules, only its start time. That was visible in the first
   measurement.

---

## Where to look

- `live-work/references/opening-stutter.md` — the full record, including the two entries added
  after the call tree was read
- `components/enquiry/answer-card-canvas.tsx` — `useScenePrecompile` (the warm-up render),
  `useLocalEnvMap` (the PMREM cost)
- `components/enquiry/enquiry-opening.tsx` — `cardCanvasWarm`, the gate that decides when the
  warm-up may run
- `ai-system/working-with-the-builder.md` entries 5 and 6 — the two instrument failures that
  preceded this

**Current head: `9e922df`.** Two files are uncommitted (`answer-card-backdrop-geometry.ts`,
`answer-card-backdrop.tsx`) carrying an unrelated lockup-opacity change Carl approved at 50%.
