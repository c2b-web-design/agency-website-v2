# ⚠⚠ THE THREE-COMMIT SPLIT IS FALSIFIED — LIFETIME AND OPACITY ARE NOT SEPARABLE

**18 August 2026. Found by Carl looking at the screen. Recorded before any decision.**

---

## THE REGRESSION

**The button is visible before any answer is selected.** It appears suddenly as the question
reveals — present, lit, blank, no text, no light interaction. **It should not be there at all**
until an answer is selected, at which point it fades in over 600ms with its text and the
traveller sweep.

⛔ **That is a state the design does not have.**

## THE MECHANISM — commit 2's work surfacing one commit early, not a new fault

The plan already identified that hoisting loses **all three** opacity sources:

| source | today | after the hoist |
|---|---|---|
| wrapper `opacity: selected.size>0?1:0`, 600ms | `enquiry-opening.tsx` | ⛔ **stayed behind in the phrase** |
| `.enquiry-pdepth-1 .enquiry-phrase-extras {opacity:0.78}` | `globals.css:1863` | ⛔ lost — host has no depth ancestor |
| `.enquiry-phrase-extras-out {opacity:0}`, 900ms | `globals.css:1886` | ⛔ lost — same reason |

**The mesh moved to a host with no opacity of its own, so it is simply ON from mount.**

⚠ **It was never visible in this state before because it did not exist** — the canvas was a child
of the wrapper, so `opacity: 0` hid it and nothing ever needed to gate it on selection.
`nextstep-canvas.tsx:1324` publishes the rect on `box && !suppressMesh` — **measurement only, no
consultation of `selected`** — which was correct in the old structure and is incomplete in the new
one.

---

# ⛔ THE SEQUENCING CONSEQUENCE — RECORD THIS, IT INVALIDATES A PLAN ASSUMPTION

> ## **THERE IS NO "LIFETIME ONLY, APPEARANCE UNCHANGED" BUILD AVAILABLE.**

The plan's three-commit split assumed lifetime and opacity were separable. **They are not.**
Moving the canvas out of the wrapper *is* removing its opacity source; the two are the same edit
seen from two sides.

**Two consequences:**

1. ⛔ **Commit 1 cannot be approved on appearance in isolation.** There is no state of it that both
   hoists the canvas and preserves the approved behaviour.
2. ⛔⛔ **AND ITS MEASUREMENT MUST NOT BE TAKEN ON THIS BUILD.** A lit, blank button appearing
   during the reveal sits **inside the exact window the freeze occupies**. Whatever number came
   back would describe a page with a forbidden state in the measured window — not the repair.

---

## ⚠ THE APPEARANCE GATE WOULD HAVE PASSED THIS BUILD — recorded in its own right

`verify/mesh-appearance.mjs` reports ✅ CHROME PRESENT here. **Correctly.** It confirms chrome
rendered in the right place; it says nothing about whether the button should be visible **at that
moment**.

⚠ **This is NOT a defect in the gate.** It is the gate's stated limit meeting a fault outside it —
the file says so in its own header: *"It is a FLOOR, not a verdict… Carl judges the chrome by eye
and that judgement is not replaceable by this or any harness."*

> ### ⚠⚠ THIRD TIME THIS SESSION THAT LOOKING AT THE SCREEN CAUGHT WHAT READING OUTPUT COULD NOT.
>
> 1. **The flat white pill** — containing-block fault, while a context-count check was one command
>    from certifying the build as fixed (2 contexts is what a build renders when the mesh never
>    mounts).
> 2. **The corridor walk** — a harness reporting `cards=0` produced a false constraint and a design
>    decision put to Carl; he clicked the cards himself and photographed the corridor at Q3.
> 3. **This** — a passing appearance gate on a build showing a state the design does not have.
>
> ⚠ **In all three the instruments were green or silent.** Two of the three were caught only
> because Carl looked; the first was too.

---

---

# ⛔ CARL'S RULING, 18 August 2026 — OPTION A. THE BUTTON MUST WORK AS DESIGNED.

> **"Not negotiable. No interim gate, no hard on/off placeholder, no build that behaves wrongly
> for the convenience of a measurement."**

**Commit 2 is brought forward and lands before any measurement is taken.**

⚠⚠ **MY RECOMMENDATION WAS B AND IT WAS WRONG ON PRIORITY.** I argued the throwaway gate preserved
the attribution of commit 1 against the unaccounted ~73ms. **That reasoning subordinated the
product's approved behaviour to the convenience of a measurement** — and the measurement exists to
serve the product, not the other way round. Recorded because the error is in the ranking, not the
analysis: every fact in the B case was correct and the conclusion still should not have been drawn.

## ⛔ THE COST TO ATTRIBUTION — CARRY THIS INTO EVERY FIGURE THAT FOLLOWS

**The recovery figure is now bounded by COMMITS 1+2 TOGETHER and must be reported as such.**

⛔ **It may NOT be claimed for the hoist alone.** Commit 1 has no valid appearance state, therefore
no valid measurement, therefore **the clean separation of per-mount cost from steady-state
contention is not available and will not become available later** — the arms were never measured
apart and cannot be retrofitted.

⚠ **The unaccounted ~73ms is still unaccounted.** Commits 1+2 together bound it; nothing now
attributes it between lifetime and opacity. **Say so in the result rather than letting a combined
figure read as the hoist's.**

---

## THE OPTIONS AS PUT (superseded by the ruling above, kept for the record)

### A. Bring commit 2 forward
Land the opacity reproduction now, judge appearance on a build that behaves correctly, measure
commits 1+2 together.
⛔ **Cost: loses the clean attribution of commit 1 alone against the unaccounted ~73ms.** The
recovery figure would then describe lifetime + opacity together, and the plan built commit 1
specifically to bound that gap.

### B. Minimal interim gate for commit 1 only
Host hidden unless `selected.size > 0` — **hard on/off, no fade curve** — purely so the measurement
runs on a build with no forbidden state. Commit 2 then replaces it with the reproduced curve.
⛔ **Cost: a throwaway step.**

---

## RECOMMENDATION: **B**, and the reason is what commit 1 is FOR

**Commit 1 is not a feature. It is the instrument that bounds the unaccounted ~73ms.** The
suppressed-canvas control sits at median 0ms and is the ceiling; commit 1's recovery figure is the
only measurement that separates **per-mount cost** from **steady-state contention**. Under A that
number never exists — it is folded into a combined figure and cannot be recovered afterwards,
because the arms were never measured apart.

⚠ **B's throwaway step is small and its risk is contained:** a hard on/off gate is one condition on
an existing publish path, it is visibly correct or visibly wrong at a glance, and commit 2 deletes
it rather than building on it.

⚠⚠ **AND THE HARD ON/OFF IS NOT THE APPROVED BEHAVIOUR EITHER** — it pops instead of fading. So
the B build is **for measurement, not for approval**: Carl should be asked to confirm only that no
forbidden state sits inside the reveal window, with the real appearance judgement deferred to
commit 2's reproduced curve. ⛔ **Recording that plainly so a "Carl approved the B build" is never
read later as approval of a hard cut.**

**What would change the recommendation:** if the interim gate turns out to need more than a
condition on the existing publish path — if it needs its own state, its own effect, or a second
source of truth about selection — then it is no longer minimal, and A becomes the honest choice
rather than smuggling structure into a throwaway step.

---

## STANDS AND IS UNAFFECTED

- **The containing-block fix** — host moved to a sibling of the shell, no arithmetic compensation.
  Host and button agree to a hundredth of a pixel (662.075 vs 662.086).
- **The self-checking assertion** — `data-cb-ok` voids the run on disagreement. ⚠ Carl:
  *"exactly the 'assert it, don't write it down' pattern."*
- **Both gates** — appearance and reachability, each falsified in both directions.
- **The context result** — 3 flat across a full Q5→Q1 walk, down from 8. ⚠ **A measurement about
  lifetime, not a verdict on the repair**, and it was taken on the position-fault build.
