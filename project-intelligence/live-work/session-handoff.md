# Session Handoff — 18 September 2026. CHUNK 2a IS BUILT. IT NEEDS ONE MORE INGREDIENT.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔⛔ WHAT HAPPENED, IN ONE LINE

**Chunk 2a was built to the approved plan and all its gates pass — and the rendered face came up
BLACK. The cause was found by measurement: `MeshPhysicalMaterial`'s transmission needs an
ENVIRONMENT MAP, and the bench has none. What that env map should be is Carl's decision and is not
taken.**

## ⛔ COMMITTED AND PUSHED on Carl's instruction — ⚠ **COMMITTED IS NOT APPROVED.**

⛔ **Chunk 2a is on `main` and Carl has NOT seen the material.** The code travels with the record
that describes it (D-083 holds the status, and the blocker is open). ⚠ **Do not read "it is in
`main`" as acceptance.**

    M  components/about/about-card-mesh.tsx     the glass, behind an off-by-default prop
    M  components/about/card-bench.tsx          faders, photographic proxy, the open finding
    ?? components/about/about-card-glass.ts     NEW — the constants
    ?? verify/about-cards-still-grey.mjs        NEW — the A2 gate
    M  project-intelligence/decisions.md        D-082, D-083
    M  project-intelligence/active-sprints/current-sprint.md   two rows + the blocker
    M  project-intelligence/reviews/review-log.md              R-025

⚠ **`npx tsc --noEmit` CLEAN. `npm run lint` = `1 problem (1 error, 0 warnings)`** — the documented
`enquiry-opening.tsx` baseline, zero warnings held. ⚠ **A warning WAS introduced during the session
(an unused binding in the new harness) and was fixed before the gate was called clean.**
⛔ **Dev server killed; port 3000 confirmed free by `Get-NetTCPConnection`.**

---

# ⛔⛔ THE FINDING — AND IT IS THE SESSION'S REAL OUTPUT

**The glass toggle works, the faders move, the photographic proxy loads and is plainly visible
around the card. The FACE renders near-black and barely responds to either fader.**

**Measured from screenshots, face-centre luminance:**

    glass OFF                          113.2   <- correct, lit grey
    glass ON                             2.2
    roughness swept 0 -> 0.5          2.2 -> 3.1
    thickness swept 0 -> 40mm         2.2 -> 2.2   (no response at all)
    a FULLY EMISSIVE proxy behind     2.2 -> 6.1
    ⛔ an <Environment> in the scene   2.2 -> 56.8  <- 26x. THE CAUSE.

⛔⛔ **TRANSMISSION TAKES ITS SPECULAR AND IBL FROM AN ENVIRONMENT MAP. With none in the scene there
is almost nothing for the face to return**, so it reads black whatever the faders say. ⚠ **This is
why `/start`'s glass BUILDS ONE DELIBERATELY** — `answer-card-canvas.tsx` generates a local env map
with `PMREMGenerator` at a measured ~572ms, and that file already records `envMapIntensity` ramping
from black as *"what produced the black rectangle."*

## ⛔ WHAT IS CARL'S, AND IT IS A §5a-SHAPED QUESTION

**A drei `preset` was used as a DIAGNOSTIC ONLY and has been REMOVED.** ⚠ **It also lifted the
control from 113 to 225 — it lights the whole bench, not just the glass**, so it is not the answer.

⛔ **A room-derived env map — plausibly built from the plate the proxy already crops — is the
obvious candidate. It is NOT an implementation detail:** it is a new expensive GPU resource with a
measured cost on the precedent (~572ms of PMREM), and §5a's first category is *"a second instance
of an expensive resource."* **It goes to Carl before it is built.**

---

# ⚠⚠ WHAT I GOT WRONG — and one of them is the more useful half of the session

| | |
|---|---|
| **B1 — a probe that could not fail** | The first probe read the canvas via `drawImage` into a 2D context and reported **0/0/0 at every setting — INCLUDING GLASS OFF**, where the screenshot plainly shows a bright grey face. `preserveDrawingBuffer: false` makes that readback empty. ⛔ **Caught only because a control was run with the feature OFF and the "defect" was still there.** |
| **B2 — a false mechanism, reasoned in full** | I concluded the black face came from `alpha: true`: target cleared at alpha 0.5 (`three.module.js:18019`) → `transmission_fragment:31` → `opaque_fragment:7` → the face goes semi-transparent. ⚠⚠ **Every line of that is really in three 0.185.1 and it predicted the exact symptom. `alpha: false` changed the number by 0.0.** ⛔ I wrote it into a code comment as fact BEFORE testing it, and had to remove it. |
| **B3 — a threshold chosen by assertion** | The A2 harness's first `MILKY_LUM` was **170, picked before either population was measured.** On the red run the defect measured **167.2 — and the harness returned PASS.** It missed the defect it exists to catch, by 2.8 points. |

⚠⚠ **B3 IS THE ONE TO CARRY FORWARD. A harness written specifically to prevent this project's
recorded failure class committed it on its first run** — `q5-stutter.mjs` read 0/3 CLEAN on a
visible stall; `one-context.mjs` read 2/2 while a context was created every question; **all of them
failed toward a PASS, and so did this.** ⛔ **The threshold is now 140, measured between both
populations, and the red/green pair is recorded in the file.**

> ⛔ **THE PATTERN ACROSS ALL THREE: I twice produced a confident explanation before testing it.**
> B2 was verified line-by-line in `node_modules` and was still wrong, **because verifying that a
> mechanism EXISTS is not the same as verifying it is THE ONE ACTING.**

---

# ⛔ WHAT WAS BUILT, AND WHAT IT HOLDS

- **`about-card-glass.ts`** — the constants, each labelled with its provenance. ⛔ **Only
  `GLASS_THICKNESS_MM = 9.8` is Carl's**; the rest are marked a starting point, in the file and in
  the bench UI.
- ⛔ **THICKNESS IS A TYPED CONSTANT, NOT `heightMm * TENT_POLE_RATIO`** — the coupling to the crown
  is declined, exactly as ruled.
- ⛔ **THE A2 GATE HOLDS.** `about-card-canvas.tsx` is untouched; the `glass` prop defaults OFF.
  **Verified by loading `/about` and measuring the cards, not by reasoning** — CD 112.0, CS 37.4,
  channel spread < 2. ⚠ **And the harness was PROVEN: forced glass on in the room, confirmed it goes
  RED (167.2), reverted, confirmed green.** ⛔ **It is still NOT admissible** — `proven.json` is
  empty (D-064) and no entry was filed.
- ⛔ **THE STALE COMMENT AT `card-bench.tsx:109` IS CORRECTED.** It claimed `TENT_POLE_RATIO = 0.025`
  against a code value of 0.073 and produced the 2.92x thickness error in the plan. ⚠ **The live
  value is deliberately NOT repeated there — naming it twice is how it went stale.**
- ⛔ **The face is WHITE, not `DIAG_FACE_COLOR`** (F4), and `FrontSide` is set with F5's corrected
  reasoning.

---

# ⛔ WHAT THE NEXT SESSION SHOULD NOT DO

- ⛔⛔ **Do not pick the environment map and build it.** It is Carl's, and §5a-shaped.
- ⛔⛔ **Do not conclude the parameters are wrong.** `thickness: 0` and `roughness: 0` render
  identically black — **the faders are not the variable.**
- ⛔ **Do not re-test `alpha: true`.** Falsified by measurement, and the false argument is recorded
  in `card-bench.tsx` so it is not re-derived.
- ⛔ **Do not trust an in-page `drawImage` canvas readback.** It returns empty. Screenshot instead,
  **and run a control with the feature OFF.**
- ⛔ **Do not put glass in the room.** 2a is still bench-only and the milky-slab artefact is waiting.
- ⛔ **Do not file a proof into `proven.json` from this session's run.** The red/green pair exists
  but the write-up and the `emptyInput` block do not.

---

# ⚠ STILL OPEN AND CARL'S

1. ⛔⛔ **The environment map for the bench** — the blocker on 2a being judgeable. **New.**
2. **Carl's eye on the bench** — 2a's checkpoint (Rule 7). ⚠ **Cannot happen until item 1 does.**
3. **Four neon colours** — four, all different, none chosen.
4. **Option C** — its fetch behaviour must be MEASURED if he wants the failure-mode cover back.
5. **`transmissionResolutionScale`** — after 2b measures the target's real memory.
6. **Final roughness** — set in the room, in 2b. The bench cannot settle it.
7. **Thickness for CD, CA, CB** at rollout — 9.80mm is CS's; same-or-scaled is undecided.
8. **§2's copy is PROVISIONAL** — CA 64 / CB 84 / CD 49 / CS 55 words, four lines uncuttable.
9. **Accessibility** — ruled to get done; needs final copy or it is written twice.
10. ⛔ **THE RECORD IS CAUGHT UP — CLOSED 18 September, on Carl's instruction.** **D-082** (the wall
    pair, the 42% aspect error, the two directional lights), **D-083** (chunk 2a and the
    environment-map finding), **R-025** (the lighting, approved by eye), two `current-sprint.md`
    rows and the blocker **CHUNK-2a-ENVMAP**. ⚠ **No R entry exists for chunk 2a and that is
    correct — Carl has not seen it, and only Carl moves REVIEW REQUIRED → APPROVED (D-036).**

---

*Written 18 September 2026. ⛔ **Chunk 2a is built, gated and NOT judgeable until the environment
map question is answered by Carl.** ⚠ Committed and pushed on his instruction — ⛔ committed is not approved.*
