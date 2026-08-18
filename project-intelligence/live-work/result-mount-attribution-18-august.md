# RESULT — component attribution of the `NextStepMeshButton` mount, 18 August 2026

**Prediction:** [prediction-mount-attribution-18-august.md](prediction-mount-attribution-18-august.md),
written before instrumentation. ⛔ **Not revised after seeing data.**

**MEASUREMENT ONLY.** No fix, no hoisting, no cache re-keying. Nothing shipped.

Production, cold, 1440x900, `ANGLE (AMD Radeon, D3D11)`. 8 runs per arm, plus a
falsification arm and a decomposition probe.

---

# ⚠⚠ THE PREDICTION IS SCORED: **MISS.**

**I predicted `pmrem.fromScene` would be the single largest component at 35–90ms,
accounting for ~25–60% of the 140ms baseline median.**

**The bake measured 32–39ms — inside the predicted band — and it is NOT the largest
component.** The prediction's own scoring rule was: *"scored WRONG if any other component
exceeds it."* **Two do.**

⚠ **And the reconciliation prediction failed in the direction I named as the likelier
failure.** I predicted a sum of 90–190ms and wrote that **overlap was the likelier fault**.
The raw sum came to **217.9ms against a 140ms freeze** — and the overlap was real, and
larger than the honest total.

---

## THE RAW OUTPUT — and why it must not be read as an attribution

| component | side | median | range |
|---|---|---|---|
| `0-floor-noop` | -- | **0.0ms** | 0.0–0.1 |
| `1-context-creation` | GPU | **150.3ms** | 143.6–**1163.1** |
| `2a-studio-build` | MAIN | 1.9ms | 1.4–2.7 |
| `2b-pmrem-fromScene` | GPU | **34.7ms** | 30.4–41.6 |
| `4-geometry-total` | MAIN | **30.8ms** | 27.7–39.8 |
| `4b-geometry-buffers` (subset of 4) | MAIN | 2.3ms | 1.9–3.1 |
| `3+4+5-firstdraw-composite` | GPU | 0.3ms | 0.2–94.9 |
| **raw sum of medians** | | **217.9ms** | vs a **140ms** freeze |

> ### ⛔ 217.9ms CANNOT BE RIGHT AGAINST A 140ms FREEZE. The components overlap.
> **Stating this rather than declaring the largest one the cause is the required
> response, and it is what the probe below then established.**

---

# ⚠⚠ COMPONENT 1 IS VOID AS A COMPONENT FIGURE — IT CONTAINS THE OTHERS

A probe timed the **raw `getContext` call** directly, alongside the tracer's marks with
absolute timestamps.

> ## **RAW `getContext` = 5.1–7.6ms. NOT 150ms.**

**Component 1's window does not measure context creation.** The stamp opens in a layout
effect and closes in `onCreated`, and **R3F runs the whole mount — geometry, studio, bake —
between those two points.** So component 1 *contains* components 2a, 2b and 4.

### The t-anchored decomposition (run 3, representative):

```
  t=9858   layout-effect stamp        <- component 1 OPENS
           ...87ms GAP: React/R3F scheduling, NO button work at all...
  t=9945   4-geometry-total starts     27.9ms   MAIN
  t=9973   2a-studio-build              1.4ms   MAIN
  t=9974   2b-pmrem-fromScene          32.2ms   GPU
           raw getContext               5.1ms   GPU  (inside R3F's mount)
  t=10008  component 1 CLOSES         150.1ms total
  t=10097  first draw                   0.3ms   GPU

  REAL BUTTON WORK = 27.9 + 1.4 + 32.2 + 5.1 + 0.3 = 66.9ms
  Component 1's 150ms = ~87ms SCHEDULING GAP + ~63ms of the work listed above it
```

⚠⚠ **The 1163ms outlier proves it.** In that run the layout effect fired at t=12097 and
the mount work did not begin until t=13189 — **component 1 measured 1092ms of nothing.**
A figure that swings 143→1163ms while every real component stays flat is **measuring
delay, not work.**

---

# THE CORRECTED ATTRIBUTION

| component | side | median | share of ~67ms real work |
|---|---|---|---|
| **`2b-pmrem-fromScene`** | **GPU** | **32–39ms** | **~48–55%** |
| `4-geometry-total` | MAIN | 28–31ms | ~42–46% |
| raw context creation | GPU | 5.1–7.6ms | ~8% |
| `2a-studio-build` | MAIN | 1.4–2.1ms | ~2% |
| `3+4+5-firstdraw-composite` | GPU | 0.3ms (median) | <1% |

## ⚠ THE TWO REAL COSTS ARE NEARLY EQUAL — AND ONLY ONE FITS THE SIGNATURE

**The PMREM bake (~35ms, GPU) and the height-field geometry build (~30ms, MAIN) are within
~5ms of each other.** ⛔ **The bake is NOT dominant in the way the prediction claimed.**

⚠⚠ **But the freeze signature is GPU-saturated with the renderer near-idle** — Stage 1
measured the main thread at **2.3ms busy of 210ms**. **A 30ms main-thread geometry build is
a POOR FIT for that signature however large it measures**, which is exactly the test the
task set. **The bake fits; the geometry does not.**

⛔ **This is a fit argument, not a measurement of causation.** The instrument says how long,
never why.

### `gl.finish()` moved the bake 34.7 → 38.6ms — only ~4ms.

**So the bake's GPU work is essentially complete at submission time**; its ~35ms is real
work, not queued work. ⚠ **The queue depth is small, which weakens any story that the bake
merely *submits* cheaply and pays later.**

---

# ⚠⚠ THE RECONCILIATION — STATED EXPLICITLY, AS REQUIRED

```
  Real button work (non-overlapping):     ~67ms
  Baseline freeze median today:           140ms   (range 80-160)
  UNACCOUNTED:                            ~73ms   — slightly MORE than half
```

> ## ⛔ THE COMPONENTS SUM TO ROUGHLY **HALF** THE FREEZE. SOMETHING IN THE BUNDLE IS UNACCOUNTED FOR.
>
> **Per the task's instruction, I am saying so rather than declaring the largest component
> the cause.**

**Candidates for the missing ~73ms, none measured:**

- **The ~87ms scheduling gap** between the layout-effect stamp and the start of mount work.
  ⚠ **This is not nothing** — it is main-thread time during which the button is committed
  but not yet built, and it sits inside the reveal. **Whether it is caused by the button or
  merely contains it is unknown.**
- **GPU-side work after submission** that no `performance.now()` bracket sees — the freeze
  is a *presentation* failure, and the compositor's cost is outside every bracket here.
- **Contention**: the card host is also live. Removing the button frees GPU capacity that
  the card host then uses; the freeze may be a *shared* resource failure that no
  single-component timing can attribute.

---

## ⚠ THE INSTRUMENT'S OWN FLOOR — MEASURED, NOT INHERITED

**`0-floor-noop` = 0.0–0.1ms per bracket; ~0.0ms across all 7.**

✅ **Negligible against the smallest reported component (0.3ms) and utterly negligible
against the two that matter (~30ms).** ⚠ The exception is `3+4+5-firstdraw-composite` at a
0.3ms median — **that figure is within a few multiples of the floor and should not be
leaned on.**

⚠ **`--sync` IS perturbing by design** (`gl.finish()` serialises the pipeline). Both arms
are reported above; the ~4ms difference on the bake is the queue depth, and it is small.

---

## ⚠ FALSIFICATION — PASSED

```
  ?nobtnmesh=1   →   marks: 0   distinct: 0   (2/2 runs)
```
✅ **Zero marks on the arm with no button.** The tracer sees this mount and nothing else —
it is **not** picking up the card host's own env bake. **Had it reported a bake there,
every figure above would have been void.**

---

## ⛔ WHAT IS STILL NOT ESTABLISHED

- **Components 3, 4-upload and 5 were never separated.** three.js links lazily on first
  render, so the material link, the GPU upload and the draw fall in one call. The composite
  reads 0.3ms median with a 94.9ms tail — ⚠ **the tail is unexplained and the median is
  near the instrument floor.** Separating them needs `renderer.info.programs` and a WebGL
  timer query; **neither was built and I did not guess a split.**
- **Component 1 as originally specified was not measured** — the instrument could not
  isolate it. Raw `getContext` (5–8ms) is the closest honest figure.
- **~73ms of the freeze is unattributed.**
- **Causation.** The bake *fits* the GPU-saturated signature; fit is not proof.

## Carried forward, unresolved, NOT investigated this turn

⚠ **The 40–640ms spread survives.** Today's baseline never exceeded 160ms. **Whatever
produces the tail is not accounted for by anything measured so far, including this
attribution.** The 1163ms component-1 outlier is a *scheduling* artefact of the instrument
and should **not** be mistaken for the tail.

---

## Changes in the working tree — instrumentation only

- `components/enquiry/nextstep-canvas.tsx` — `?mounttrace=1` / `?mountsync=1`, off by
  default and free when off. ⚠ Marks live in **module scope** with the impure clock read
  behind `nowImpure()`: a first cut wrote to `window` during render and took the repo from
  its recorded baseline of **1 lint error to 8** (`react-hooks/purity`,
  `react-hooks/immutability`). **Verified back at exactly 1** — the known pre-existing
  `enquiry-opening.tsx` error. `tsc --noEmit` clean.
- `verify/mount-attribution.mjs` — new reader, declares what it cannot separate.

⛔ **Nothing shipped. The repair is structural (CLAUDE.md §5a) and goes through plan mode
after Carl sees this.**

---

*18 August 2026. **Predicted the bake would dominate; it did not** — it ties with a***
*main-thread geometry build at ~30ms, and only the bake fits the GPU-saturated signature.*
*⚠⚠ **The largest number on the first output was 150ms of the instrument measuring its own***
*⚠⚠ **scheduling delay, and the components account for only half the freeze.***
