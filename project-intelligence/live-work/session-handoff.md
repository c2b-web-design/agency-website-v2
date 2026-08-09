# Session Handoff — 9 August 2026

**Written at the end of the satin / resting-light session.**

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session
length, not a suggestion to stop or resume later. **Carl decides when a session ends and will
say so.** It was not broken today.

---

## ⚠⚠ THE TREE IS DIRTY. ~1560 LINES UNCOMMITTED. COMMIT BEFORE ANYTHING ELSE.

Two commits landed early (`3a7cf1f`, `2e71e5c`). **Everything after them is unstaged** —
the satin material, the label texture, and the whole resting-light investigation are in one
block across three files:

    components/enquiry/answer-card-canvas.tsx   +710
    components/enquiry/answer-card-glass.ts     +530
    components/enquiry/answer-card-mesh.tsx     +353

plus 12 untracked `verify/` harnesses. `npx tsc --noEmit` clean. Lint at the recorded
baseline: **1 problem (1 error, 0 warnings)** — the known `enquiry-opening.tsx`
reduced-motion effect. **Dev server was running on :3000.**

⚠ **`chunk-scope.json` IS STILL DELETED — the repo is FAIL-OPEN.** Fifth day.

---

## ✅ APPROVED BY CARL'S EYE THIS SESSION

**The Q5 stutter fix** — *"it looks pretty clean"* (86ms, down from 584ms).
**The satin card with its label** — *"Thats looks great!"*

Everything else below is measured or built, **not approved**.

---

## 🔴 START HERE — THE RESTING LIGHT, AND CARL IS DIRECTING IT

**He is drawing the path and correcting it by eye. Do not derive it.** His words when the
Builder kept measuring instead of showing him: *"Youre not listening... Youre not directing
them, i am. i have the advantage in a situation like this."* **He is right and he has been
right every time today.**

### The path, from his final drawing

**A blue curve, NOT a closed ellipse.** He drew a red ellipse around the grid captioned **NO**
— ⚠ **that red ellipse is the REJECTED shape.** A previous read had this backwards; do not
rebuild an orbit.

The blue path: **enters upper-left of card 1, sweeps down and across BENEATH the row, exits
lower-right past card 5**, and a small arrow curls back at the right — *"when it goes round the
back have it race to the beginning."* A **blue vertical arrow in the middle points UP** at the
cards: at its lowest the light rakes UP at the lower row, which is how their bottom edges catch.

> *"Start just behind top left and end just behind bottom right... Apply easing at the tight
> curves."*

**Built and on URL doors** (`TravellingLight` in `answer-card-canvas.tsx`):

    ?sag=       dip below the straight line     150
    ?fwd=       forward of the card plane       190
    ?travelms=  the visible pass                11000
    ?returnms=  the race round the back         2200
    ?travint=   the traveller's intensity       0.9
    ?noglobal=  1 = static rig off, or a fraction
    ?lighthelpers=1  draws BOTH statics AND the traveller's whole path + a ball on it

⚠ **CARL'S LAST INSTRUCTION, NOT YET SATISFIED:** *"i can tell by the arc of the white sphere
that it is wrong. Follow the ellipse, it is not a guide, its pretty accurate."* **The drawn
curve is a specification to be matched, not approximated.**

⚠ **AND WITH `?noglobal=1` THE TRAVELLER IS FAR TOO WEAK** — the faces are nearly black and the
rims carry everything. Carl: *"before you try it turn the global light off, only then will you
see the true effect."* `?travint=` needs to go up substantially before the path can be judged.

### ⚠⚠ SIX RESTING-LIGHT ATTEMPTS FAILED BEFORE THIS. ALL RECORDED IN `answer-card-glass.ts`.

Antiphase directionals (peak 38% every sample); in phase (exposure +25%, peak still still);
lateral swing (peak 0%); one moving directional (bloom 13%, brightness 43%); **five per-card
point lights on a tight ellipse — Carl's own design, removed by him**: *"it looks ok zoomed in
but not at this scale... i dont think 5 point lights are the solution."*

⚠ **THE FINDING WORTH KEEPING:** the face is ~104px tall on screen. **An effect that works by
moving a light across a curve cannot resolve at that size.** What carries the form is the
MATERIAL's own response. This does not rule the technique out for HOVER, where one card has
attention and a bigger gesture is legitimate.

⚠ **AND THE STATIC RIG IS NOW THE CONTACT FIELD'S, COPIED** — Carl: *"Lets emulate something
that works."* Key `[-160,120,40]` @1.6 top-left grazing, fill `[140,-90,60]` @0.35,
ambient 0.18. **The asymmetry is the point.** The cards had two EQUAL directionals at 1.55 — a
Builder invention — and that symmetry made two pinned blooms with a dead band.

---

## THE THREE STATES — Carl's model, 9 August

| state | spec |
|---|---|
| **Resting** | light moves, brings out the 3D. **In progress, above.** |
| **Hover** | the answer text becomes **teal** — the rail system's colour — gentle transition |
| **Selected** | filament warms off → amber → **stops halfway between amber and red** |

⚠ **THE TEXT CANNOT TAKE A TINT FROM LIGHT ALONE.** Measured (`verify/label-lit.mjs`): the
glyphs sit at luminance 208, so a warm light shifts them only 5 points — imperceptible. **A
colour change needs the texture redrawn, OR the glyph luminance dropped so light can tint it.**
The second is more truthful, the first more controllable. Carl's call.

---

## WHAT WAS BUILT AND APPROVED

### Glass is discarded. The face is satin. (Carl's decision, with his reasoning)

> *"it needs a background to become truly effective and it could be seen as cliched in 2026."*

The first half is load-bearing: glass is a lens, and **the lockup it refracted went on 5 August**.
Measured before the change — the short-axis profile was a flat 69.5 plateau, a cliff, then flat
~15: **the 23.8° crown disclosed nothing**, because `transmission: 0.97` mixes away 97% of the
diffuse.

**After:** a smooth arc, `bothSidesFall: yes`, ratio 2.91 → 7.26 as the palette deepened.

⚠ **`LIGHT_LEVEL` 0.35 → 1.1 WAS THE REAL FIX FOR "TOO FLAT AT NORMAL SCALE".** 0.35 was a
GLASS value; on satin it left mean luminance at 21.6/255. Three attempts at light POSITION
missed it. Carl's symptom — *"when i zoom in it is more like this but at a normal scale not so
much defined"* — was under-exposure, not under-resolution.

⚠ **`FILAMENT_LIGHT_HEIGHT` FIXED AFTER FOUR SESSIONS** — 6 → `CROWN_HEIGHT + 11.5` (16), now
DERIVED. The face rose to 4.5 on 5 August and the light never moved: the *"dot in the middle"*.
`FILAMENT_LIGHT_POWER` compensated ×(16/6)², also derived.

### The answer text is now PART OF THE FACE, not a DOM overlay

⚠ **THREE DOM VERSIONS FAILED AND THE THIRD IS THE INSTRUCTIVE ONE.** Shared clock (wrong
easing/distance/no scale); polled values (one frame late, 0.025); **same frame, same values,
measured 0.0000 divergence — and Carl still saw two objects**: *"as if the text is trying to
catch up with the card or mimmic its movement."*

⚠ **WHEN THE NUMBERS ARE PROVABLY IDENTICAL AND THE EYE STILL READS TWO OBJECTS, THE NUMBERS
WERE NEVER THE PROBLEM.** A DOM label moves in 2D CSS pixels; the card rises in 3D world space
under a perspective camera. **Different geometries — they agree at the endpoints and disagree
everywhere between.**

Now drawn into the face's albedo (`buildLabelTexture`), transformed and lit once.
⚠ **The satin body colour is BAKED INTO the texture and `color` is white**, because
`MeshPhysicalMaterial` computes `color * map` and no single `color` serves both.
⚠ **ACCESSIBILITY DEBT:** the visible text is a texture — not in the a11y tree. Mandatory to
fix when these become real controls.

### Carl answered his own question about wrapping text on the curve

*"Would the curve be enough to warp it and make it unreadable?"* **No** — `CROWN_PLATEAU_U` is
0.72, so the LONG axis (the reading direction) is flat across 72% of its width.

---

## ⚠ HOW THE BUILDER WASTED CARL'S TIME TODAY — read this before repeating it

1. **Kept measuring when asked to show.** Carl asked for light helpers; the Builder ran another
   harness instead. **He has the advantage watching continuous motion; a sampler sees 8 frames.**
2. **Changed two variables at once** (fill 1.55→0.16 AND arc radius 26) so the black-edge cause
   was unattributable.
3. **Built a helper that froze at mount** and then one that vanished against black. ⚠ **A
   debugging aid that lies is worse than none** — fifth recorded instance of that class.
4. **Coloured the helpers cyan/magenta**, and Carl reasonably read it as the LIGHTS being
   coloured. They are white. Markers must not imply properties.
5. **Reasoned instead of copying.** The contact field — an approved sibling — had a working rig
   the whole time. Carl: *"Lets emulate something that works."*

---

## Still open, unchanged from before

- **`GLASS_CLEARCOAT` = 0, inert.** The grid that dismissed it ran on the OLD geometry.
- **The ground plane** — three attempts, stashed as `ground-gradient-attempt-7aug`.
- **~2.4MB of three + fiber loads eagerly.** `next/dynamic` flagged, not done.
- ⚠ **SHADOW.** Fifth session parked.
- **~70ms of Q5 stutter remains** — needs the shared-canvas host (route A), not authorised.

---

## How to look at it

```
npm run dev
http://localhost:3000/start                       the corridor
http://localhost:3000/start?lighthelpers=1        the lights and the traveller's path
http://localhost:3000/start?noglobal=1            static rig off — the traveller alone
http://localhost:3000/start?cardrig=1             [7] satin tightness, [a] smear,
                                                  [n] direction, [s] sheen, [9] light,
                                                  [p] power, [z] height, [0] print
```

⚠ **MEASURE HEADED, WITH `--enable-gpu`, AND PRINT THE RENDERER.** Confirmed real:
`ANGLE (AMD Radeon(TM) Graphics, D3D11)`.

**New harnesses:** `crown-disclosure.mjs` (the disclosure ratio + profile SHAPE),
`satin-wired.mjs` (proves anisotropy is connected by differencing renders — introspection
FAILED on this R3F version), `label-coupling.mjs`, `label-frames.mjs`, `label-lit.mjs`,
`key-elevation-sweep.mjs`, `resting-motion.mjs`, `rest-dials.mjs`, `satin-look.mjs`,
`field-crops.mjs`, `field-material-study.mjs`, `label-with-card.mjs`.

⚠ **`resting-motion.mjs` REPORTED "NO CHANGE" ON A VISIBLY ANIMATING SCENE** — it samples a
narrow strip and the profile has TWO bands, so its "peak position" flipped between two local
maxima. **Do not trust it without reading the full profile.**

---

*9 August 2026. Glass is gone, satin is approved with its label, and the Q5 stutter is 85%
fixed. The resting light is Carl's to direct — he has drawn the path twice and corrected it
three times, and the next session should hand him the dials rather than another derivation.*
