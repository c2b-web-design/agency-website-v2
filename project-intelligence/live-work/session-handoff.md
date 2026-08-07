# Session Handoff — 7 August 2026

**Written at the end of the entrance-fix / responsive-cards session.**

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session
length, not a suggestion to stop or resume later. **Carl decides when a session ends and will
say so.** It was not broken today.

---

## THE STATE — everything is committed, the tree is clean, nothing is half-built

**Five commits on `main`, from `0961332`:**

| | |
|---|---|
| `1e3d65c` | the card arrives as glass, and stops re-linking its shader |
| `9957465` | the opening no longer waits on WebGL to show its first line |
| `26f6981` | the answer cards follow the grid at every width |
| `d8dd1a8` | verify harnesses for the entrance, the arm path, the responsive grid |
| `e429fc2` | verify harnesses for the ground edge, the page background, the field orbit |

`npx tsc --noEmit` clean. Lint at the recorded baseline: **1 problem (1 error, 0 warnings)** —
the known `enquiry-opening.tsx` reduced-motion effect. **Dev server stopped.**

**One stash: `ground-gradient-attempt-7aug`** — three failed attempts at the ground plane,
see below. `stash@{1}` is still the June parachute; leave it alone.

⚠ **`chunk-scope.json` IS STILL DELETED — the repo is FAIL-OPEN.** Unchanged for a fourth day.

---

## ✅ APPROVED BY CARL'S EYE THIS SESSION

**The card entrance** — *"The cards look good."*
**The opening's text** — *"The text appearance is a lot better."*
**The responsive cards** — *"I seen the narrow widths when you were doing your thing and
understand that it is all about scaling."*

Everything else below is measured, not approved.

---

## 🔴 START HERE NEXT SESSION — THE MATERIAL DECIDES, AND CARL DECIDES IT

**Carl is researching Three.js, WebGL and React** — videos and tutorials lined up. He said so
explicitly and it is the right call:

> *"i would make better decisions if i learnt more."*
> *"The design and my ability to talk to you in appropriate and coherent language will be best
> served if i research and learn about what we are trying to achieve."*

**Build agreed for "a couple of days" from 7 August.** ⚠ **DO NOT START BUILDING THE HOVER
LIGHT UNTIL THE MATERIAL IS SETTLED** — the two decisions are coupled (a moving light reveals
a coated or anisotropic surface very differently from how it reveals glass).

### ⚠⚠ THE FULL HOVER SPECIFICATION IS IN `decisions.md` D-045. READ IT BEFORE BUILDING.

It is long, it is Carl's, and it is complete enough to build in one pass. Summary only here:

- **Hover is the user PONDERING** — so the light **loops** while the pointer rests, eased,
  slow, subtle. A one-way pass asserts a conclusion the user has not reached.
- **Card 2 is its own case** — centred, vertical arc, full sweep, symmetric.
- **The other four take the diagonal to their nearest corner**, source starting **just inside**
  the corner, and **stop short** of the extremes (Carl's guess: 30°/150°) because an
  asymmetric card is starved where a symmetric one is flattered.
- **Start direction pairs on the diagonal** — 1 and 5 start outward, 3 and 4 inward. The one
  deliberate asymmetry; everything else mirrors.
- **Derive tilt, inset and sweep limits from grid position.** ⚠ **If card 3 needs tuning
  separately after card 1 is right, the derivation is wrong.**
- **Intensity must be a function of arc position from the outset**, even if flat initially.

### ⚠ GLASS IS UNDER REVIEW AND MAY NOT SURVIVE

> *"Its so 'Apple' anyway and im wondering at this stage in modern website design its use could
> be considered somewhat cliched."*

**Ruled out by eye, without building:** brushed/anodised metal — *"its too close in look to the
client info cards."* **Leading candidate:** satin — *"I like the way the light interacts with
it."* Not chosen.

⚠ **AND THE CSS CARD WAS NEVER DESCRIBING GLASS.** Its six inset shadows are a studio lighting
diagram. **The labels name the CSS technique; the shadow stacks describe the object.** Where
they disagree the shadows are right. See D-045 §8 — this is the most transferable finding of
the session.

---

## What was fixed, and the two errors worth inheriting

### 1. The black rectangle — a workaround whose premise expired

`CardLighting` ramped `color` and `envMapIntensity` from black, justified as *"an unlit surface
in a dark scene IS the page behind it."* True while the lockup sat behind the cards; **the
lockup went on 5 August and `GROUND_COLOR` #101010 took its place**, so an unlit card became
DARKER than its background. Steepest drop at arrival **−11.36 → −0.59** (clay control −0.35).

The approved figures were in `globals.css` all along — `@keyframes enquiry-card-rise`,
opacity 0→1 with translateY.

### 2. ⚠ THE FIX'S FIRST VERSION CAUSED A WORSE BUG, AND THIS IS THE LESSON

Toggling `mat.transparent` per fade **re-links the shader** — `transparent` is in the program
cache key, so `useScenePrecompile` cannot have warmed it. Measured in `getProgramParameter`
self-time, with a stash-and-compare control:

    without the toggle    725ms
    with the toggle      1977ms
    built transparent     424ms   <- shipped

That ~1250ms arrived as one ~1490ms freeze 330ms after card 4's rung. **Carl saw it exactly:**
*"cards 1+2 look good, 3 happens, then a pause, 3 flashes and 4+5 come on."*

⚠ **THE BUILDER SUSPECTED THE CONTACT FIELD AND BUILT TWO INSTRUMENTS POINTING AT IT.**
`verify/warm-guard.mjs` proved that guard innocent — it held correctly to +14945ms, exactly
`ENTRANCE_END_MS` after the entrance start. **The profiler naming the function is what found
the truth; the stash-and-compare is what proved it was the Builder's own.**

### 3. The opening's 4.2-second blank screen — caught by an outside audit

`AnswerCardCanvas` returns `null` below 1280px, so no canvas existed, nothing reported
`compiled`, and the 4000ms ceiling armed the opening **on every load**:

| width | canvas | armed by | heading |
|---:|:---:|---|---:|
| 1440 | yes | compile | 2349ms |
| 1279 | **no** | **⚠ ceiling** | **4413ms** |
| 1024 | **no** | **⚠ ceiling** | **4382ms** |

⚠ **`OPENING_ARM_CEILING_MS`'s OWN COMMENT STATED THE RULE THIS BROKE** — *"if this is ever the
thing that starts the opening on a normal run, the gate is broken and the page is merely hiding
it."*

⚠ **AND THIS PROJECT'S OWN HARNESS COULD NEVER HAVE CAUGHT IT.** `verify/opening-arm.mjs` only
ever ran at 1440px, where the gate works. **A harness that exercises only the passing case is
not a test.** `verify/arm-by-width.mjs` now sweeps widths. Fixed by arming on
`document.fonts.ready` + a committed frame; ready gate 3/3, backstop 0/3, all widths now
408–609ms.

### 4. The 1280px cliff — a false reason hiding a real coupling bug

`PROTO_MIN_VIEWPORT_PX` claimed the grid *"reflows"* below 1280. **Measured at eight widths: it
never reflows.** 576×104 down to 640px, then proportional, 3+2 intact to 375px, no overflow.

**The real bug was `CARD_BOXES` — an absolute-pixel table shadowing a `repeat(6, 1fr)` layout.**
Now: `ResizeObserver` measures the grid, `cardBoxesAt(width)` scales the boxes, cards are
**scaled not rebuilt** (rebuilding would change the cross-section and could drop the 16° tilt
guard below its floor). Five cards at every width, 0.01px drift.

---

## ⚠ THE FAILURE — the ground plane, three attempts, escalated not shipped

**The rectangle is real and measured.** The flat plane steps **+1 luminance level** against the
page at its left and right edges (15 outside, 16 inside), along a straight vertical edge
hundreds of pixels long. Top and bottom match perfectly. Amplified 24× it is unmistakable:
`verify/out/ground/left-edge-amplified.png`.

**Cause:** `GROUND_COLOR` #101010 is one sample of a radial gradient, and a flat fill can only
match a gradient at one distance from its centre. ⚠ **Oversizing the mesh does not help** —
that fixes a BOUNDARY mismatch; this is a COLOUR mismatch, and the plane is clipped by the
CANVAS anyway.

**Three attempts, all failed:**

| | result | cause |
|---|---:|---|
| 1 | −15 levels | `THREE.Color` converts sRGB→linear; a raw shader needs `#include <colorspace_fragment>` |
| 2 | −1.00 | per-axis radii — wrong formula for CSS `farthest-corner` |
| 3 | +1.00 | √2 radii — closer, still not the browser's curve |

**The gradient plane ended up no better than the flat one it replaced.** Solving radii from
measured pixels gives rx 960 / ry 808 — ratios 1.333 and 1.497 against farthest-side, which
**disagree**, meaning the browser is not interpolating the way the formula assumes.

⚠ **STASHED, NOT COMMITTED, AND ESCALATED.** Carl's rule is escalate after two attempts; this
went to three. `git stash list` → `ground-gradient-attempt-7aug`.

**A candidate route, UNTESTED and recorded as a candidate not a prescription:** sample the
page's PAINTED gradient into a texture and upload it, so the plane carries the browser's own
pixels rather than a reconstruction. *(The previous handoff asserted an untested fix as "THIS
IS THE ONE" and cost a session. That is not repeated here.)*

---

## ⚠ Open, and unresolved

- **`FILAMENT_LIGHT_HEIGHT` still needs re-checking.** The face moved z=1.10 → z=4.00 in the
  rebuild while the filament light stayed at z=6 — that is the *"dot in the middle"* Carl saw.
  **Arithmetic, not design. Still not done.**
- **The glass material has never been judged on the rebuilt geometry** — and may now be
  replaced entirely.
- **`GLASS_CLEARCOAT` defaults to 0, inert.** The frost/coat grid that dismissed it ran on the
  OLD broken geometry. ⚠ **Worth re-testing on the rebuilt crown, not inheriting.**
- **`?warmtrace=1`** was added to `enquiry-opening.tsx` — inert without the flag, and
  `verify/warm-guard.mjs` depends on it.
- **`PROTO_MIN_VIEWPORT_PX` is no longer read by the canvas** but `ENTRANCE_ANCHOR_CEILING_MS`
  still cites it. **That citation is stale** — left deliberately rather than changed in
  passing, because it guards another component's timing.
- **~2.4MB of three + @react-three/fiber loads eagerly.** An outside audit flagged
  `next/dynamic` with `ssr: false`. Not done — real, but a build-level change with its own
  risks and it does not affect the timeline.
- ⚠ **SHADOW.** Still parked, fourth session.

---

## How Carl worked today

- ⚠ **HIS DRAWINGS AND HIS EYE SETTLED WHAT PROSE COULD NOT, AGAIN.** Two arc diagrams. He
  also ruled out two materials on sight without either being built — fast and cheap and the
  right way round.
- ⚠ **HE CORRECTED THE BUILDER'S REASONING TWICE, AND WAS RIGHT BOTH TIMES.** On brushed metal
  being "family" (it is repetition, not derivation) and on easing at the reversals (*"not if
  the easing is slow enough"*). **When his argument and the Builder's disagree, check the
  Builder's premise first.**
- **He questions premises.** *"Is it necessary?"* on the lockup; *"is it cliched?"* on glass.
- **He asks for the principle before deciding.** Reasoning first, trade-offs stated, the choice
  left with him.
- **No ASCII diagrams or box-drawing characters.**
- **Do not commit or push unless he explicitly asks.** He asked today; five commits on `main`,
  and he chose `main` over a branch when asked.

---

## How to look at it

```
npm run dev
http://localhost:3000/start                the corridor
http://localhost:3000/start?clay=1         the form study
http://localhost:3000/start?skip=1         the contact field  (DEV DOOR — delete when Q5
                                           gets real selection)
http://localhost:3000/start?cardrig=1      [1-6] geometry, [7-9] glass/light, [r] rim rough,
                                           [m] metal, [f] filament, [c] face clearcoat,
                                           [v] coat roughness, [0] print
http://localhost:3000/start?beattrace=1    per-frame card progress
http://localhost:3000/start?warmtrace=1    the contact field's warm-up guard decisions
```

⚠ **MEASURE HEADED, WITH `--enable-gpu`, AND PRINT THE RENDERER STRING.** Headless substitutes
SwiftShader. Confirmed real: `ANGLE (AMD Radeon(TM) Graphics, D3D11)`.

**New harnesses:** `arm-by-width.mjs`, `cards-by-width.mjs`, `grid-by-width.mjs`,
`grid-narrow.mjs`, `opening-held.mjs`, `entrance-frames.mjs`, `stall-profile.mjs`,
`warm-collision.mjs`, `warm-guard.mjs`, `ground-edge.mjs`, `bg-truth.mjs`,
`field-light-walk.mjs`. `stall-source.mjs` is **kept as a record of failure** — its prototype
wrap never took because three is bundled, and an instrument that cannot fire is not a negative
result.

---

## ⚠⚠ THE SESSION'S LESSON — a harness that only tests the passing case is not a test

**Two harnesses were found LYING this session, and both had been trusted.**

`verify/cross-section.mjs` held its own copy of `BEVEL_WIDTH = 3.0` while the source said 0, so
it printed the **pre-rebuild card** — a 3-wide bevel and a 5.00-unit gap in a card that had not
had either for two days. **It nearly produced a false report that the geometry rebuild had been
lost.** It is the file the handoff calls the authority on the form.

`verify/opening-arm.mjs` only ever ran at 1440px, where the gate works — so a **4.2-second blank
screen on every narrower viewport survived for days** and was found by an outside audit, not by
this project's own instruments.

⚠ **THIS IS THE THIRD AND FOURTH RECORDED INSTANCE OF THE SAME CLASS.** `q5-stutter.mjs`
reported 0/3 CLEAN on a visible defect for the same reason. **A harness holding a duplicate of
the value it checks cannot fail when that value moves; a harness that exercises one case cannot
find a defect in the others.** Both are fixed and both now say so in their own headers.

---

*7 August 2026. The entrance is fixed and approved, the opening starts on time at every width,
and the cards exist below 1280px for the first time. The ground plane defeated three attempts
and is stashed.*

*And the next chunk is now specified rather than sketched — D-045 carries the whole hover
design in Carl's words. **The material comes first, and it is Carl's to decide.** He is
learning the stack so he can specify it himself, which is the right order and worth waiting
for.*
