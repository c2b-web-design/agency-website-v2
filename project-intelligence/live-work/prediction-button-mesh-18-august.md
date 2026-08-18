# PREDICTION — the `NextStepMeshButton` experiment, 18 August 2026

**Written BEFORE building either arm and BEFORE any measurement.** Carl's instruction:
*"Chat-only predictions do not survive the session, and the misses are the useful part
of this record."*

⛔ **NOTHING BELOW IS A MEASUREMENT.** Every number here is a commitment made in advance,
to be scored against the run and left in place whether it survives or not.

---

## THE QUESTION

Does suppressing the button's WebGL canvas (`?nobtnmesh=1`) change the Q5 reveal freeze?

**Arms:** BASELINE (`/start`) vs TREATMENT (`/start?nobtnmesh=1`), commit `3cecf5e`+,
production, cold, 8 runs each, back to back in one session, baseline re-measured today
and never recalled.

---

# ⚠ THE PREDICTION — NARROW ENOUGH TO BE WRONG

## Primary: **the freeze moves, and materially.**

| | median | freeze rate /8 | range I expect to contain 6 of 8 |
|---|---|---|---|
| **BASELINE (re-measured today)** | **160–260ms** | **6–8 / 8** | 40–650ms |
| **TREATMENT (`?nobtnmesh=1`)** | **40–120ms** | **2–5 / 8** | 0–260ms |

**Scored as a hit only if ALL THREE hold:**

1. Treatment median lands at or below 120ms, AND
2. Treatment median is **at least 60ms below** the baseline median measured today, AND
3. Treatment freeze rate is **strictly lower** than baseline's out of 8.

**Scored as a MISS if:** the two medians land within 60ms of each other, or the freeze
rate is unchanged, or the treatment median exceeds 120ms.

⚠ **The 60ms floor is deliberate and is the narrow part.** 40ms is the instrument's
quantisation; a claim smaller than that is unmeasurable. 60ms is the smallest gap this
instrument can honestly resolve, so it is where I am putting the line.

⛔ **I am NOT predicting the freeze disappears.** Predicting 0ms would be safer to defend
(any residue reads as "partial success"). The step-5 prediction failed by being too wide
to be wrong, and that is on the record. **Residual freeze in the treatment arm is expected
— 2–5 runs of 8 — and if the treatment arm comes back 0/8 my model of the mechanism is
also wrong, just in the flattering direction.**

---

# ⚠⚠ THE MECHANISM — Carl's question answered directly

> **"Can ~60ms of context creation inside a 1300ms wipe produce a 200ms median freeze?"**

## **No. It cannot, and I am not claiming it does.**

If context creation were the whole cost, the honest prediction would be "no change" —
60ms against a 40–640ms spread is unresolvable, and I would be predicting a negative.

**But context creation is not what the mount costs.** Reading
[nextstep-canvas.tsx](components/enquiry/nextstep-canvas.tsx) rather than reasoning from
the trace label, the `+54 to +65ms` figure is **the timestamp of the context's creation,
not the duration of the work that follows it.** What that mount drags in behind it:

### 1. ⚠⚠ A FULL PMREM BAKE, PER MOUNT — this is the load-bearing finding

[`useChromeEnv`](components/enquiry/nextstep-canvas.tsx#L248) builds an entire studio
scene and bakes it:

- a `THREE.Scene` with **multiple soft-edged panel meshes**, each its own `ShaderMaterial`
- a **`SphereGeometry(ENV_SHELL_RADIUS, 48, 32)`** shell — ~1500 tris — with a gradient
  `ShaderMaterial`
- **`new THREE.PMREMGenerator(gl)` → `pmrem.fromScene(studio, 0, 0.1, 200)` at 256**

`fromScene` renders the scene into a cubemap and runs the **roughness convolution chain**
— multiple mip levels, each a GPU pass. **This is one of the most expensive single
operations in Three.js**, and the file's own comment concedes it: re-baking per frame
*"would be ruinous."*

> ### ⚠⚠ AND IT IS NOT CACHED ACROSS QUESTIONS.
> `useMemo(..., [gl])` — **keyed on the renderer.** A new context per question means a
> **new `gl`, therefore a fresh bake every mount.** The memo protects re-renders within
> one canvas's life; it does nothing across a remount. The comment "the room is baked
> ONCE and turned" is true **within one canvas** and misleading across the corridor.

### 2. A `MeshPhysicalMaterial` program compile

`metalness: 1`, `envMap`, `DoubleSide`, `NeutralToneMapping`. **The most expensive shader
permutation Three.js ships** — the physical program is large and its link is not free.
Fresh context ⇒ **no program cache** ⇒ full compile.

### 3. A height-field pill geometry build

`usePillGeometry` computes positions, per-vertex normals (a `Vector3` normalize per
vertex) and UVs, then uploads three `Float32BufferAttribute`s. CPU-side, but on the
main thread, and the upload is a GPU transfer.

### 4. The `invalidate()` draw

The env map "arrives after the first React commit", so the effect fires again and forces
a second render once the PMREM lands.

## So the chain is:

> **context init (~67ms, the part that was traced and named)
> → PMREM studio construction → cubemap render → convolution chain
> → physical-material link → geometry upload → forced draw**

⚠ **Only the first link has ever been measured.** The trace named
`CommandBufferProxyImpl::Initialize` because that is what a context-creation profile
surfaces; **nothing has ever put a number on the bake that follows it**, and the freeze's
signature — **GPU process saturated, renderer idle at 2.3ms busy of 210ms** — is the
signature of *GPU work*, which is exactly what a PMREM convolution is and exactly what
context creation alone is not.

**That is why I am predicting a real move rather than a negative.** The `+54 to +65ms`
offset places the *start* of this chain inside the 1300ms wipe on 4 of 4 runs.

---

## ⚠ WHY THE PREDICTED MOVE IS PARTIAL, NOT TOTAL

Two candidates have already been eliminated (step 5's warm-up canvas; program-link count),
and both were eliminated **because the freeze did not move.** The freeze is real, GPU-side
and still unexplained. **The button is a candidate, not a confession.** Specifically:

- **The card host still bakes its own env** and still compiles its own materials. Removing
  the button removes one GPU consumer from a contended process, not all of them.
- **The 40–640ms spread is not this button's doing.** A single resource that mounts once
  per question cannot produce a 16x swing on an unchanged build; something stochastic sits
  underneath — scheduling, GPU contention, or thermal. **Whatever that is survives this
  experiment.**
- ⚠ **A lower median is not a result** against a spread that reaches 640ms — which is why
  the freeze RATE is in the prediction as an independent channel, and why the hit
  condition requires both.

---

# ⚠⚠ A GAP THAT MUST BE CLOSED BEFORE MEASURING — found while writing this

**`verify/reveal-stall.mjs` CANNOT RUN THE TREATMENT ARM AS WRITTEN.**

[verify/reveal-stall.mjs:119](verify/reveal-stall.mjs#L119) hardcodes:

```js
await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
```

No querystring, no parameter. **It would film BASELINE TWICE and report a clean null
result** — two draws from the same distribution, which given the 16x spread would look
exactly like a plausible negative.

> ⚠⚠ **THIS IS THE ELEVENTH INSTRUMENT DEFECT IN SIX DAYS AND IT FAILS TOWARD A PASS** —
> the same class as `one-context.mjs` reporting 2/2 while a context was created per step.
> Found by reading the instrument before trusting it, which is the recorded method.

**Required before any measurement:** a query-passthrough (env var or argv), then
**falsify it** — confirm the treatment arm actually reaches the page with the flag and
that `webgl contexts` reads **2, not 3**. ⛔ **A green run on an instrument that cannot
distinguish the arms is worth nothing.** Per the handoff's own standard: where a
difference is live, the instrument must be shown capable of seeing it.

---

## METHOD I AM BOUND TO

- 8 runs per arm, production, cold, **both arms in this session**, builds minutes apart.
- **Baseline re-measured today. Never recalled** — `f058854` read 1252ms and 1450ms in
  two sessions on identical code.
- ⚠ **Extract frames and LOOK at ≥1 freeze per arm.** Every wrong version of this
  instrument was caught by looking and none by reading output.
- ⛔ **Overlapping ranges mean NO CONCLUSION, and I will say so** rather than reach for
  the median.
- Report the distribution, not a number.
- ⛔ **`?nobtnmesh=1` is diagnostic. Nothing ships from it.** If the result says the button
  is the cause, the FIX is a structural decision (lifetime/ownership of that canvas) and
  **stops for review before it is built** — CLAUDE.md §5a. It is not a licence to delete
  the mesh.

---

*Written 18 August 2026, before the arms were built. ⚠ **If this misses, the miss stays***
*⚠ **on the record next to the reasoning that produced it** — that is the point of the file.*
