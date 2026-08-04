# The opening stutter — what is known, and what has been ruled out

**Open defect, 4 August 2026.** Carl: *"the text on the start page, where the ivory button is,
stutters."* The OPENING choreography, before Begin — text, subtext, ivory button. Not Q5.

**Reproducible on cold and warm runs, headed with `--enable-gpu`.**

---

## The symptom, measured

```
dropped frames (>45ms) : 6-8 across the opening
long tasks             : ~680ms at +1423ms, ~900ms at +2763ms
```

⚠ **IT ARRIVED WITH THE FILAMENT CHUNK.** The warm-up canvas mounts during the opening so its
WebGL setup lands in dead time. That was cheap when it compiled one plain glass card; the
filament gave it **two custom shaders** (rim and bevel), and the cost went with it.

---

## ⚠ Ruled out by measurement — do not retry these as fresh ideas

**1. Rescheduling the warm-up. Three attempts, all failed.**

| lead | result |
|---|---|
| 900ms | 920ms task at +2763ms — on the text reveals |
| 5200ms | moved to +7194ms — still mid-choreography |
| gated on `beginActive` | moved to ~+8400/+9700ms — **onto the Begin reveal** |

⚠ **THE LAST ONE IS THE WORST OUTCOME: A MOVED SYMPTOM.** The compile is ~1.6s and **no gap that
size exists anywhere in the opening**, so rescheduling cannot work. Treating a size problem as a
timing problem cost three rounds.

**The `beginActive` gate is still the right mechanism and is IN THE CODE** — a duration cannot
answer *"has the opening finished"*. It just does not solve this.

**2. `renderer.debug.checkShaderErrors = false`.** The theory was good — `three.module.js:7097`
issues blocking `getProgramParameter` queries when it is on, which would defeat `compileAsync`.
**Measured: moved the task by 0ms.** Reverted; it silently disables shader error reporting.

**3. Collapsing five point lights to one.** ⚠ **PARTIAL, AND IT BROKE THE SPILL.**

The reasoning is sound and worth keeping: `NUM_POINT_LIGHTS` is a `#define`, so five lights meant
every material — five rims, five bevels, five faces, the backdrop — compiled a five-light variant.

```
                      worst task    card 2 spill
five lights             ~900ms         works
one shared light        ~645ms       ⚠ BROKEN (+0.3, was measurable)
```

**It helped and was not enough**, and the scene-level light stopped reaching card 2 — which is the
whole reason the filament is a real light. **Reverted.** If retried, the position maths is the
suspect: the light moves to `slot + head`, and a light at scene level needs the card's slot added
by hand.

---

---

## ⚠ MEASURED 4 August (later): IT WAS NEVER SHADER COMPILATION

**A CPU profile of the opening, with every `linkProgram` and `texImage2D` call wrapped and timed:**

```
programs linked   16, costing    0ms
texImage2D        12, costing    0ms
onFirstUse        4 calls,    1384ms      <- 80% of the blocking time
total blocking                1740ms
```

⚠ **SHADER LINKING IS 0% OF IT.** The GPU links asynchronously and never blocks. **Every fix
attempted before this — three reschedules, deleting 560 lines of dead GLSL, collapsing five point
lights — was aimed at a cost that does not exist.** The dead-code removal was worth doing on its
own merits and bought ~7%, which should have been the clue.

**The real cost is `onFirstUse` (`three.module.js:7094`)**, which runs the first time a program's
uniforms are read. It does two things:

1. `getProgramInfoLog` / `getProgramParameter(LINK_STATUS)` when `checkShaderErrors` is on.
2. **`new WebGLUniforms(gl, program)` and `fetchAttributeLocations(gl, program)`** — enumerating
   every active uniform and attribute via `getActiveUniform` / `getUniformLocation`.

⚠ **BOTH ARE SYNCHRONOUS DRIVER QUERIES THAT WAIT FOR LINKING TO FINISH.** That is why linking
measures 0ms and this measures 1384ms: **the wait was moved, not removed.**

### `checkShaderErrors = false` — tried TWICE, and it is not the answer

First attempt measured 0ms improvement and was written off. **That test was wrong** — it was set
on the wrong renderer, since the warm-up canvas has its own. Retried correctly on the right one:
**1740ms → 1692ms.** So the error queries are a small part; **the uniform enumeration is the bulk,
and there is no flag to disable it.**

⚠ **THE DANGEROUS PART WAS RETIRING A CORRECT-SOUNDING HYPOTHESIS WITH A BROKEN TEST.** It was
recorded here as a dead end on evidence that did not support the claim.

### What this leaves

`onFirstUse` runs **once per program**, and 16 programs exist because five cards × three materials
plus the backdrop each get their own. **The lever is fewer distinct programs, not smaller ones:**
five cards sharing one rim material instance, one bevel instance and one face instance would cut
16 programs to about 4.

⚠ **THAT IS A REAL REFACTOR AND IT WAS NOT ATTEMPTED.** Materials are currently constructed
per-card by `AnswerCardMesh`; sharing them means hoisting construction out and passing instances
down, which changes how per-card state (the filament's own uniforms) is addressed.

---

## What is still untested

- **Simplifying the shaders themselves.** The rim and bevel each carry a full copy of
  `circuitPos`. The bevel's could be far simpler — it only needs a latch, not a heat profile.
- **Not warming during the opening at all**, and taking the cost at Q5 — where a stutter was
  previously fixed, so this trades one for another.
- **Whether the filament is worth a ~1.6s compile on every page load.** Carl's question to answer,
  not the Builder's.

---

## Also open, same chunk

**The travelling head is only ~8 points brighter than its own trail**, so it reads closer to a
uniform fill than a hot core with a bloom. Four values were tried (emissive multiplier, point-light
power, filament intensity, tail floor) and the contrast moved from 4 to 8 points. **Something else
pins the head near the top of the range and it has not been found.**

⚠ **AND A PROBE LIED ABOUT THIS ONCE.** It sampled the right edge at t=0.30 and called it "the
head" — but the card is 186x48, so the top edge alone is **0 → 0.356** of the circuit and the head
is still on it at that point. That probe reported the head as 119 points DIMMER than its trail, a
defect that did not exist, and it was acted on twice before the segment proportions were computed
instead of assumed.
