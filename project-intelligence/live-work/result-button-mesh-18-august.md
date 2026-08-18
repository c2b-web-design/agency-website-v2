# RESULT — the button-mesh experiment, 18 August 2026

**Prediction:** [prediction-button-mesh-18-august.md](prediction-button-mesh-18-august.md),
written and approved BEFORE either arm was built. ⛔ **Not revised after seeing data.**

**Build `3NFnttSSYg9V4409Gio-t`, both arms, back to back, one session.** Production,
`npx next start -p 3100`, cold browser per run, 1440x900.
Renderer: `ANGLE (AMD Radeon(TM) Graphics, D3D11)` — not a software rasteriser.

---

# ⚠⚠ THE FINDING IS THE PMREM BAKE AND ITS `useMemo([gl])` KEYING — NOT "THE BUTTON"

**The button is where the bake happens to live.** It is the arm's name, not the diagnosis.

⚠ **This distinction decides the repair.** Removing a canvas and fixing a per-mount PMREM
bake are **different repairs**: the bake can be hoisted above the keyed phrase, or its
cache keyed on something more durable than the renderer, **with the mesh kept**. Letting
the arm's name become the diagnosis would throw away an approved surface to fix a caching
fault. ⛔ **Carl's framing constraint, given with the go-ahead, and it is correct.**

---

## THE TWO DISTRIBUTIONS

| | per run (ms) | median | range | freeze /8 |
|---|---|---|---|---|
| **BASELINE** (3 contexts) | 80 80 80 120 160 160 160 160 | **140ms** | 80–160 | **5/8** |
| **TREATMENT** `?nobtnmesh=1` (2 contexts) | 0 0 0 0 0 0 0 40 | **0ms** | 0–40 | **0/8** |

> ### ⛔ THE RANGES DO NOT OVERLAP. Baseline floor 80ms; treatment ceiling 40ms.
> **Separation 40ms at the closest point** — exactly the instrument's quantisation, so the
> gap is real but its size is bounded, not exact.

**7 of 8 treatment runs show no detectable freeze at all.**

---

## ⚠ WAS THE PREDICTION RIGHT? — MIXED. The direction held; two numbers missed.

| claim | predicted | measured | verdict |
|---|---|---|---|
| Baseline median | 160–260ms | **140ms** | ⚠ **MISS — below the band** |
| Baseline freeze rate | 6–8 / 8 | **5/8** | ⚠ **MISS — below the band** |
| Treatment median | 40–120ms | **0ms** | ⚠ **MISS — below the band** |
| Treatment freeze rate | 2–5 / 8 | **0/8** | ⚠ **MISS — below the band** |
| Treatment median ≤120ms | yes | 0ms | ✅ HIT |
| Treatment ≥60ms below baseline | yes | **140ms below** | ✅ HIT |
| Treatment rate strictly lower | yes | 0 < 5 | ✅ HIT |

### The three scoring conditions all passed. **But four of four range estimates missed, ALL IN THE SAME DIRECTION — every arm was quieter than predicted.**

⚠⚠ **AND THE EXPLICIT HEDGE WAS WRONG.** The prediction said:

> *"if the treatment arm comes back 0/8 my model of the mechanism is also wrong, just in
> the flattering direction."*

**It came back 0/8.** By its own terms that is recorded as a **failure of the model, not a
clean win** — the prediction expected residual freeze from the card host's own env bake and
material compiles, and there is none detectable. ⛔ **Do not report this as a straight
success.** Either the card host is cheaper than assumed, or this instrument's floor hides
what remains, or the button's bake was a larger share of the total than the model allowed.

⚠ **The systematic downward miss also means today's machine was quieter than the sessions
that produced the 40–640ms spread.** Baseline never exceeded 160ms today, against a
recorded 640ms. **This is another instance of the between-session drift the handoff
warns about, and it argues the arms were right to be measured back to back.**

---

## ⚠ FRAMES LOOKED AT — 4 films, both arms. Method requirement, not a formality.

⚠ **The measure script itself printed "NO FREEZE FOUND — and that is a finding ABOUT THIS
INSTRUMENT… DO NOT report the stall as fixed."** That warning is why the frames were
examined rather than the numbers believed.

**BASELINE run-01** — crop 520x70 @ 480,425:
```
  f249  "Q5 W"      advancing
  f251  "Q5 Wl"     <- freeze begins, mid-word
  f253  "Q5 Wl"     IDENTICAL
  f255  "Q5 Wl"     IDENTICAL
  f256  "Q5 Wl"     still
  f258  "Q5 What brou"   <- catches up in one jump
```
**BASELINE run-06** — frozen on `"Q5 W"` across f258–f261. Same signature.

**TREATMENT run-01** — `f251 "Q5 Wha"` → `f253 "Q5 What"` → `f255 "Q5 What "`. **Advances
every frame across the span where baseline sat still.**
**TREATMENT run-05** — `f254 "Q5 W"` → `f256 "Q5 Wha"`. Advancing.

> ✅ **The documented signature — static mid-word inside the first word — is PRESENT in
> both baseline films and ABSENT in both treatment films.** The pixel measurement and the
> eye agree.

---

# ⚠⚠ INSTRUMENT DEFECT #11 — recorded in its own right, NOT consolidated

**`verify/reveal-stall.mjs` could not select an arm.** It hardcoded
`page.goto(\`${BASE}/start\`)` with no querystring and no parameter.

> ### ⛔ IT FAILS TOWARD A PASS, like the expensive ones before it.
> An A/B run would have **filmed the baseline twice** and reported the arms as
> indistinguishable. Against a freeze that varies 40–640ms, two baseline batches overlap
> heavily and read as a **clean, plausible negative** — "the button is not the cause."
> **A false alarm gets investigated; a false pass gets believed.**

Same class as `one-context.mjs` reporting ✅ 2/2 while a context was created per question
step, and the reveal window's version 3 reporting 0ms on a live filmed freeze.

**Fixed:** `REVEAL_STALL_QUERY` passthrough, and the arm + expected context count are now
printed in every batch header.

### ⚠ AND A TWELFTH, FOUND DURING THE FALSIFICATION ITSELF

**The first falsification read 4 contexts where the record said 3.** Cause: the counter
patched `getContext` before page scripts ran, so it counted **the harness's own renderer
check** ([reveal-stall.mjs:185](../../verify/reveal-stall.mjs#L185)) creating a detached
canvas for `WEBGL_debug_renderer_info`.

⚠ **An instrument that measures its own footprint reports a difference that is not in the
product.** Fixed by counting only canvases where `document.contains(this)`.

⚠⚠ **It was caught ONLY because the count was falsified against a known expectation
instead of being trusted on first output.** Had the arms been labelled by the flag in the
URL, this would never have surfaced — and the count would have been wrong in both arms.

## ⚠ FALSIFIED BY CONTEXT COUNT, NEVER BY THE FLAG IN THE URL

Carl's instruction: *"a flag that arrives but does not take is precisely the failure this
harness would hide."*

```
  BASELINE    webgl contexts 3   ✅ confirmed, every run of 8
  TREATMENT   webgl contexts 2   ✅ confirmed, every run of 8
```
⛔ The assertion **aborts the batch** if the count disagrees, so no run can be filed under
an arm label that was never verified.

---

## ⚠ THE COMMENT CORRECTED IN PLACE — separate from the result

[nextstep-canvas.tsx](../../components/enquiry/nextstep-canvas.tsx) claimed:

> *"the room is baked ONCE and turned."*

**True within one canvas's life. False across the corridor.** `useChromeEnv` memoises on
`[gl]` — the renderer. The component sits inside the keyed phrase `phrase-${qNum}`, so a
new context per question means a new `gl` and therefore **a fresh PMREM bake per question**.

⚠ **Same failure as the mark-name collision: a comment accurate in its original scope, left
standing after the structure changed around it.** Read as written, it says the per-frame
cost was the only one worth avoiding — **which is why the per-MOUNT cost went unexamined.**

⛔ **Corrected as a record, NOT repaired.** Hoisting the bake or re-keying the cache is a
structural decision (CLAUDE.md §5a) and was not taken.

---

## ⛔ WHAT IS NOT ESTABLISHED

- **Attribution.** The instrument says a freeze happened, where and for how long. It says
  **nothing about why.** The PMREM chain is the strongest candidate the code supports, but
  **the bake has still never been timed directly.** ⚠ The treatment removes context
  creation, the bake, the material link, the geometry upload and a draw **all at once** —
  **this experiment cannot separate them.**
- **The 40–640ms spread is unexplained and survives.** Today's baseline never passed 160ms.
- Q4–Q1, mobile, and the corridor step are unmeasured. Desktop 1440x900, Q5 only.
- Whether any freeze remains below the 40ms floor.

## ⛔ NOT SHIPPED

`?nobtnmesh=1` remains **diagnostic only**, exactly as before. Nothing was shipped from
this result. The working tree carries only the instrument fix and the comment correction.

---

*18 August 2026. **The direction predicted in advance held and the ranges did not** — every*
*arm came in quieter than forecast, and the 0/8 treatment was named beforehand as a signal*
*that the model is wrong. ⚠ **The finding is a per-mount PMREM bake keyed on the renderer,***
*⚠⚠ **not a button, and the repair follows the bake — not the arm's name.***
