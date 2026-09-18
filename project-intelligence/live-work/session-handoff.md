# Session Handoff — 18/19 September 2026. THE PROXY WORKS. THE PLACEMENT DATA DOES NOT.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔⛔ WHAT HAPPENED, IN ONE LINE

**Chunk 2a's glass was proven on the bench and approved by eye; putting it in the room took FIVE
attempts at the background geometry, the fifth works — and it exposed TWO PLACEMENT FAULTS IN
COMMITTED DATA that predate all of today's work.**

## ⛔ NOTHING IS COMMITTED. HEAD is `052703a`.

    M  components/about/about-card-canvas.tsx   the camera-matched proxy + guide overlay
    M  components/about/about-card-glass.ts     rim 0.10, env-map constants
    M  components/about/about-card-mesh.tsx     rim clear, bevel frosted
    M  components/about/card-bench.tsx          backplate, env map, faders
    ?? components/about/room-environment.tsx    NEW — the PMREM builder

⚠ **`npx tsc --noEmit` CLEAN.** ⛔ **`npm run lint` NOT RE-RUN since the last edits — run it.**
⚠ **A dev server may be on :3000. Kill it before any checkpoint.**
⛔ **`git stash@{0}` holds the FIRST (broken) room attempt. Keep — it carries the failure record.**

---

# ⛔⛔ THE TWO FAULTS IN COMMITTED DATA — THE SESSION'S REAL OUTPUT

## 1. `GUIDE_CA_QUAD` / `GUIDE_CB_QUAD` DO NOT MATCH CARL'S PINNED CORNERS

⛔ **In `about-card-geometry.ts`, committed, wrong today.** ⚠⚠ **THE TELL IS CARL'S OWN
VERTICAL-EDGE CORRECTION** — his instruction of 4 September was that every bottom node takes its
top node's x. **His file has that exactly; the code does not:**

    CA   code TL.x 0.17333  vs  BL.x 0.18944     Carl: BOTH 0.19766
    CB   code TL.x 0.59278  vs  BL.x 0.58944     Carl: BOTH 0.60731

**Worst positional error: CB's TR, out by 0.043 in x and 0.028 in y; CB's BR by 0.050 in y.**
⛔ **This is what Carl saw:** *"CB is way out of alignment, the distance from the top edge to the
ceiling is the giveaway."*

⛔ **SOURCE OF TRUTH: `live-work/wall-card-corners-4-september.md`**, the corrected `INITIAL_FRAC`
set. ⚠⚠ **THAT FILE SAYS "DO NOT EDIT THESE NUMBERS. THEY ARE CARL'S, SET BY EYE."** It exists
because the Builder lost them twice.

⚠ **A fix was written and then REVERTED with everything else. It is not in the tree.** The
conversion is `x` unchanged, `y` through `STAGE_CROP + y * STAGE_VISIBLE`.

⛔⛔ **AND THE DOWNSTREAM CONSTANTS ARE STALE IF THE QUADS CHANGE.** `CA_CARD_ASPECT` 2.327,
`CB_CARD_ASPECT` 2.248 and both heights were **derived from the wrong quads on 17 September**.
**Correcting the quads without re-deriving these leaves the cards the wrong shape.**

## 2. CB'S CEILING DROP IS UNRESOLVED IN THE PINNED DATA ITSELF

⛔ **Not a code fault and NOT fixable by arithmetic.** `wall-card-corners-4-september.md` lists it
under *"What is still open"*: **CB's TR sits at y = 0 — hard against the top edge of the pinning
tool — while CA's TL is at 0.02849.** Carl's rule *"The distance from the ceiling must be the same
for CA and CB. Its like hanging a picture"* **was never satisfied.**

⚠ **The old letterboxed framing hid it. A correctly-framed room shows it.**
⛔ **NEEDS CARL TO RE-PIN CB IN `/proto/wall`. Do not invent the number.**

---

# ⛔ THE BACKGROUND GEOMETRY — FIVE ATTEMPTS, AND WHY THE FIFTH IS RIGHT

⚠⚠ **A DOM `<img>` BEHIND A TRANSPARENT CANVAS IS INVISIBLE TO THE GLASS** — three never renders
it, so transmission samples an empty target (cleared to 50% WHITE on `alpha: true`) and CS reads as
a **milky slab**. The room must be IN the scene.

    1  flat plane, depth 30, exact FOV     bottom third of frame BLACK
    2  same + overscan 2.2                 filled the frame but SCALED THE IMAGE —
                                           room zoomed, cards against a framing their
                                           positions were never solved from
    3  flat plane, depth 6                 PIXEL-IDENTICAL to (1). ⛔ A change that
                                           should have mattered did not, which PROVED
                                           the variable being tuned was never the cause
    4  projected from PLATE FRACTIONS      correct framing lost — see the bug below
    5  projected from SCREEN NDC           ⛔ WORKS

⛔⛔ **WHY A FLAT PLANE CANNOT WORK, MEASURED:** at VFOV 67.31 / pitch 12.68 **the bottom of the
frame meets the floor at t = 1.38 camera units** while the back wall is ~16. **No single plane at
one depth can be both.**

## ⛔ THE BUG IN ATTEMPT 4, AND IT IS THE ONE WORTH REMEMBERING

Past a `FAR` limit it **clamped `z` and scaled `x` while leaving `y` untouched** — which lifts the
vertex **off the camera ray that generated its UV**. The vertex then draws its photograph pixel at
the wrong screen position, non-uniformly across the grid. ⛔ **The cards never moved. The
background's camera-to-image mapping did.**

## ⛔ THE FIX — EVERY VERTEX IS AN UNPROJECTED SCREEN POINT

⚠⚠ **THE METHOD CAME FROM OUTSIDE — Carl took the problem to ChatGPT on 19 September and pasted
the answer back.** ⛔ **Recorded because provenance matters: it is the second outside contribution
to this chunk, after the glass sandbox, and the record should say which parts the Builder did not
originate.**

**What it supplied, and it was the architecture, not a tweak:**
- ⛔ **Derive every vertex by unprojecting a screen/NDC point through the SOLVED camera**, so
  position and UV come from the same point *by construction*.
- ⛔ **Bound the grid at the horizon rather than clamping vertices.**
- ⛔ **The acceptance test** — opaque material first, prove the framing is pixel-identical to the
  CSS photograph, and only THEN enable transmission. ⚠ **A better gate than the Builder had.**
- ⚠ **The round-trip check** — back-project known points and re-project them; ~0px error proves the
  proxy cannot be causing framing drift.

⚠⚠ **ITS FIRST DIAGNOSIS WAS WRONG AND THAT IS WORTH KEEPING TOO.** It identified missing
`object-contain` letterbox offsets. ⛔ **Measurement showed those are ZERO here** — the wrapper is
`aspect-[3/2]`, so the canvas box and the displayed image box already coincide (0.00px at 1440 and
1920). **The real bug was the Builder's `FAR` clamp.**

⛔ **THE METHOD WAS STILL RIGHT, AND FOR A BETTER REASON THAN THE ONE GIVEN.** It fixes the clamp
bug as a side effect, and being correct by construction rather than by coincidence **it survives
the 800x1200 case where the boxes DO diverge by 338px.** ⚠ **A right method reached through a wrong
cause — do not let the wrong cause be inherited as fact.**

    NDC point -> camera ray -> plane intersection -> vertex
    the SAME NDC point -> the photograph's UV

**Correct by construction; framing cannot drift.** Horizon handled by **bounding the grid**, never
by clamping vertices. ⚠ **NDC round-trip verified at 2.22e-16.**

⚠⚠ **AND IT WAS *NOT* AN `object-contain` FAULT, WHICH WAS THE FIRST DIAGNOSIS.** ⛔ **MEASURED: the
canvas box and the `object-contain` displayed image box agree to 0.00px at 1440 AND 1920** — the
wrapper is `aspect-[3/2]`, the plate's own aspect. ⚠ **But at 800x1200 they diverge by 338px**, so
the NDC route is still right: correct by construction, not by coincidence.

## ⛔ THE ACCEPTANCE TEST PASSED — run it again after any change

**Unlit proxy vs the CSS photograph, card-free regions, 0-255 scale:**

    ceiling strip           8.93      far-right wall column   2.71
    far-left wall column    4.70      (bottom-centre 22.92 — contains CS, not clean)

⚠ **Control (ref vs ref) = 0.000, so the comparison is sound.** ⛔ **Wall/ceiling agreement at
2.7-8.9 is resampling noise, not displacement. THE FRAMING IS RIGHT.**

---

# ⚠⚠ WHAT I GOT WRONG

| | |
|---|---|
| **Kept fixing forward** | ⛔ **Four failed background attempts before stopping.** Should have stopped at two. Each fix broke something the last had not. |
| **Lost the placement while chasing the material** | Carl: *"The cards can look fantastic but it will mean nothing if it looks like it dont belong in the scene."* **Correct, and it is the lesson of the session.** |
| **A probe that could not fail** | `drawImage` off a WebGL canvas returned **0/0/0 even with glass OFF**. `preserveDrawingBuffer: false`. Caught only by running a CONTROL. |
| **Measured the wrong quantity** | A roughness sweep by MEAN looked dead. ⛔ **Blur PRESERVES the mean** — frost lives in VARIANCE. sd 12.21 -> 2.95 across 0 -> 0.8. |
| **A threshold chosen by assertion** | The A2 harness opened at 170 and **returned PASS on a defect measuring 167.2.** Now 140, measured between both populations. |
| **A diagnostic that ignored its own switch** | `false && a \|\| b` collapses to `b` — guides drew with the flag off. Caught only because the render disagreed with the flag. |
| **A false mechanism written down as fact** | Attributed the black face to `alpha: true`, reasoned line-by-line out of three 0.185.1. **`alpha: false` changed the number by 0.0.** |

> ⛔⛔ **THE PATTERN: A CONFIDENT EXPLANATION PRODUCED BEFORE IT WAS TESTED, TWICE.** Verifying that
> a mechanism EXISTS is not verifying it is THE ONE ACTING.

---

# ⛔ WHAT THE NEXT SESSION SHOULD DO, IN ORDER

1. ⛔ **`npm run lint`** — not re-run since the last edits.
2. ⛔⛔ **Put the two committed-data faults to Carl.** They are independent of today's build and are
   recorded NOWHERE except this file. **Fault 1 needs the quads corrected AND the aspects/heights
   re-derived. Fault 2 needs Carl to re-pin CB.**
3. ⚠ **Do not touch card positions otherwise.** They are approved.
4. ⚠ **`?guides=1` draws the quads, the floor rects and the PL/PR rails.** ⛔ **They must come out
   before this ships.**
5. ⛔ **The record is THREE sessions behind** — 17 Sept, 18 Sept, and this. D-082/D-083/R-025 were
   written and are COMMITTED; today's proxy work and both faults are not.

---

# ⚠ STILL OPEN AND CARL'S

1. ⛔⛔ **The two placement faults above.**
2. **`ENV_PLATE_INTENSITY = 6.0` is a COMPENSATION, not a physical value** — it multiplies a dim
   room by six to manufacture highlights. ⚠ **Revisit DOWNWARD when the neon exists.**
3. ⛔ **The rim will not read like Carl's references until it EMITS** — emission + a real light +
   bloom. **Chunk 3. An env map makes it LEGIBLE, not CORRECT.**
4. **The bevel is frosted FOR NOW** — metallic is live and gets tested in chunk 3, *"when the neon
   light is off."*
5. **Four neon colours** — four, all different, none chosen.
6. **`transmissionResolutionScale`** and the PMREM cost — both unmeasured in the room.
7. **Final roughness** — Carl at **0.35** on the bench, *"in the ballpark... any modifications
   would be slight."* ⚠ **Not settled in the room.**
8. **§2 copy PROVISIONAL**; **accessibility** owed.

---

*Written 19 September 2026. ⛔ **The proxy works and is verified. The placement data underneath it
does not.** ⚠ Nothing committed.*
