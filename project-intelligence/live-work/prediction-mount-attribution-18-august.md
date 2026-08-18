# PREDICTION — component attribution of the `NextStepMeshButton` mount, 18 August 2026

**Written BEFORE building the instrumentation and BEFORE any measurement.**
⛔ **Not to be revised after seeing data.**

---

# ⚠⚠ FIRST: THE PREVIOUS PREDICTION IS RESCORED AS A **MISS**

The result file called it "mixed". **Carl's correction, 18 August 2026, is accepted and is
the standing scoring rule:**

> **A coarse condition passing on a wrong model teaches the wrong lesson.**

| what happened | |
|---|---|
| 3 scoring conditions | ✅ passed |
| 4 of 4 range estimates | ❌ **missed, ALL in the same direction** |
| its own written hedge ("0/8 means my model is wrong") | ❌ **fired** |

> ### ⛔ SCORED: **MISS.** Not "mixed", not "partial".
> The conditions were **too coarse to discriminate** — they passed a model that was wrong
> about every quantity it estimated. **The pass was the defect**, and recording it as a
> partial success would have preserved exactly the wrong lesson: that the mechanism model
> was roughly right. **It was not.** Every arm was quieter than forecast and the treatment
> was silent where residue was predicted.

⚠ **This rescoring changes how the prediction below must be written:** the failure last
time was **wide bands with coarse pass conditions**. So the bands below are narrow, and
there is **no composite pass condition to hide behind** — each component is scored
independently.

---

## THE QUESTION

The `?nobtnmesh=1` arm removed **five things at once**. It proved the bundle causes the
freeze. **It cannot say which component does.** This turn times them individually.

⛔ **The PMREM bake's plausibility must not stand in for a measurement.** It is the
best-supported candidate and it has **never been timed directly.**

---

# ⚠ THE PREDICTION — per component, Q5 mount, production, cold

**Baseline reference: median 140ms, range 80–160ms (measured today, same session).**

| # | component | side | predicted median | predicted share of 140ms |
|---|---|---|---|---|
| 1 | context creation → first usable `gl` | **GPU** | **25–70ms** | ~20–45% |
| 2a | `useChromeEnv` studio scene build | **main** | **1–6ms** | <5% |
| 2b | **`pmrem.fromScene(...)` at 256** | **GPU** | **35–90ms** | **~25–60%** |
| 3 | `MeshPhysicalMaterial` program link | **GPU** | **15–45ms** | ~10–30% |
| 4 | height-field geometry build + upload | **main** | **12–35ms** | ~10–25% |
| 5 | forced `invalidate()` draw | GPU | **2–12ms** | <10% |

## ⚠ THE CALL: **`pmrem.fromScene` (2b) is the single largest component.**

**Scored WRONG if any other component exceeds it**, or if 2b lands below 35ms.

**Reasoning:** `fromScene` renders a scene to a cubemap then runs the roughness
convolution across mip levels — multiple GPU passes at 256. It is the only component in
the list that is *inherently multi-pass GPU work*, and the freeze signature is **GPU
saturated with the renderer near-idle**. Components 2a and 4 are main-thread and therefore
**poor fits for that signature however large they measure** — which is a real risk, since
52,800 vertices (nx 220 × ny 240) with a `Vector3.normalize()` each is not trivial.

## ⚠⚠ A SECOND, INDEPENDENT PREDICTION — the reconciliation

**Sum of components: 90–190ms**, i.e. **compatible with the 140ms baseline median.**

⛔ **If the sum lands far BELOW ~80ms, I will say the bundle is unaccounted for** rather
than declare the largest component the cause. ⛔ **If it lands far ABOVE ~200ms, the
components overlap or my instrumentation is inflating them**, and I will say that instead.

⚠ **Overlap is the likelier failure**: context creation and the first GPU work after it
are not cleanly separable, and a `performance.now()` bracket around GPU-side work measures
**submission, not completion**, unless a sync is forced.

---

## ⚠ THE INSTRUMENTATION'S OWN FLOOR — to be measured, not assumed

**This is the 84ms-screenshot-sampler trap.** Timing GPU work honestly requires forcing
completion, and **forcing completion changes the scheduling being measured.**

- `performance.now()` brackets are **~microseconds** and safe, but on GPU-side work they
  time **submission only** — the command buffer may complete long after.
- Reading back (`gl.finish()`, `readPixels`) times **completion** but **serialises the
  pipeline**, which is precisely the perturbation to avoid.

**Both will be reported where they differ.** ⚠ **If the bracket cost is a material share
of the smallest component, that component's figure is not trustworthy and I will say so.**
The floor is measured by bracketing a no-op in the same place.

---

## ⚠ FALSIFICATION — mandatory before any figure is believed

**The instrumentation must report the PMREM bake ABSENT on `?nobtnmesh=1`.**
⛔ **If it reports a bake on the arm with no button, it is measuring something else** —
most likely the card host's own env — and every figure is void.

Both arms run. Baseline must show the bake; treatment must show **zero button mounts**.

⚠ Same discipline as the last turn, which caught the instrument counting **its own**
renderer-check canvas: **falsify against a known expectation, never trust first output.**

---

## ⛔ SCOPE

**MEASUREMENT ONLY.** No fix, no hoisting, no cache re-keying, nothing shipped. The repair
is structural (CLAUDE.md §5a) and goes through plan mode after Carl sees the attribution.

**Carried forward, unresolved, NOT investigated this turn:** the **40–640ms spread
survives**. Today's baseline never exceeded 160ms. **Whatever produces the tail is not
accounted for by anything measured so far**, including this attribution.

---

*Written 18 August 2026, before instrumentation. ⚠ **The bands are narrow and each***
*⚠ **component is scored on its own — because last time three coarse conditions passed***
*⚠⚠ **a model that was wrong about every quantity it estimated.***
