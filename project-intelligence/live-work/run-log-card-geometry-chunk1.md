# Run log — Q&A answer card, chunk 1 (geometry)

**Date:** 3 August 2026
**Plan:** `.claude/plans/glowing-sniffing-quiche.md` (10 review findings folded in before build)
**Briefing:** `live-work/architect-briefing-card-rebuild.md`
**Status:** ⚠ **Built and instrumented. NOT APPROVED — awaiting Carl's eye.**

---

## What was built

Three new files, plus one authorised additive edit.

| File | Contents |
|---|---|
| `components/enquiry/answer-card-geometry.ts` | Measured constants, budget maths, assertions |
| `components/enquiry/answer-card-mesh.tsx` | Half-tube rim, swept bevel, convex recessed face |
| `components/enquiry/answer-card-canvas.tsx` | Ortho canvas, static diagnostic lights, entrance, `?cardrig=1` |
| `components/enquiry/enquiry-opening.tsx` | ⚠ **+17 lines, 0 deletions** — one import, one element |

**Shipped values — all PROVISIONAL under D-035:**

| Parameter | Value | Result |
|---|---|---|
| Card | 186.66 × 48, radius 14 | Matches the CSS card exactly |
| Rim tube radius R | 2.0 | Consumes **4.0** per side (2R) |
| Bevel width / rise | 4.0 / 1.6 | Rise held below the rim apex |
| Crown height | 4.5 | **23.70°** face tilt, shading ratio **1.98** |
| Crown plateau | 0.72 | Long-axis roll-off |
| Face | 170.66 × 32, radius 6 | 66.7% of card height |

Z-stack, outermost first: **rim apex 2.0 → bevel lip 1.6 → face apex 1.1.** The rim is the
frontmost surface, which is what makes it the outline and what keeps it unobstructed for the
chunk-4 filament.

---

## ⚠ Three defects found during the build. Two were invisible to the assertions.

### 1. The bevel stood proud of the rim, and the face sat in a well

`BEVEL_RISE` was 2.5 against a rim apex of 2.0, and the face was anchored to the **rim's**
apex rather than the **bevel's** inner lip. Face apex landed at z = 1.5 beneath a bevel lip at
z = 2.5.

**The card rendered with a black interior** — the face at the bottom of a well, correctly lit
and correctly invisible. The geometry was doing exactly what it had been told.

**Fix:** anchor the face to `bevelRise` (the surface it actually joins), and cap the rise below
the rim apex. `BEVEL_RISE` 2.5 → 1.6.

### 2. ⚠ THE FACE'S NORMALS ALL POINTED BACKWARD, AND EVERY ASSERTION PASSED

Triangle winding was inverted, so `computeVertexNormals` produced **3201 of 3201 normals at
−z**. The face was lit from behind and rendered a perfectly uniform `rgb(44,44,44)` — ambient
only, no directional contribution, no gradient across a convex surface.

⚠ **`side: DoubleSide` HID IT.** The face stayed visible, so nothing looked broken — it just
looked flat and dark, **which is precisely the symptom this chunk exists to prevent.**

⚠ **AND THE TILT ASSERTION COULD NOT CATCH IT.** It reads `|normal.z|`, and a flipped normal
has identical magnitude. It reported a healthy 23.70° throughout.

**Found by sampling rendered pixels** and noticing the interior was uniform across a surface
that must have a gradient. Not by any check.

**Two checks added so it cannot recur:** normal direction (`+z`, all of them) and shading
variance (`hi − lo > 0.15`). ⚠ **Both were confirmed to FAIL against the old winding before
the harness was synced** — a check that has never failed is not known to work.

### 3. ⚠ `maxFaceTiltDegrees()` carried a factor-of-2 error

Written as `atan(H*pi / (4*a))`; the derivative of `H(1+cos(pi*v))/2` peaks at `H*pi / (2*a)`.
It under-reported every angle by roughly half.

**Consequence: crown was briefly raised 4.5 → 7.5** because 4.5 appeared to give only 12.5°
(ratio 1.29, effectively invisible). The true figure was 23.8° (ratio 1.68) and 4.5 was right
all along. **7.5 would have shipped a dome** rather than the "slightly convex" face specified.

⚠ **Caught ONLY because the harness reads the built geometry's own normals rather than calling
the helper:** 36.19° measured against 20.21° predicted. **Had both shared the formula, a dome
would have shipped as "verified".** This is the Q5-stutter lesson repeating in a new form — a
harness sharing a *formula* with the thing it checks is as blind as one sharing a constant.

**`MIN_FACE_TILT_DEGREES` was rebased 18 → 16** on the corrected ladder, and set from the
luminance ratio rather than from the shipped crown, so it is not fitted to pass.

---

## Verification — 18 checks, all passing

`verify/_tmp-answer-card-geometry.mjs` (temporary; delete when the chunk closes).

| Group | Result |
|---|---|
| Budget: face height 66.7%, corner radius 6.0 | PASS |
| Face tilt 23.70° ≥ 16° floor, **from mesh normals** | PASS |
| ⚠ **CONTROL: zero crown FAILS the same assertion** (0.00°) | PASS |
| Face normals +z: **3201/3201** | PASS |
| Shading varies: lambert 0.456 → 0.904, **ratio 1.98** | PASS |
| Placement: 12px gap, no overlap, level with row 1 (516.8 vs 516.8) | PASS |
| Viewport gate: present @1280, **absent @1024**, no scrollbar at either | PASS |
| Reduced motion renders | PASS |
| Unmounts once past Q5 | PASS |

**Lint: `1 problem (1 error, 0 warnings)`** — the recorded baseline, nothing added.
**`npx tsc --noEmit`: clean.**

**Screenshot:** `screenshots/answer-card-chunk1-1440.png`

---

## How to look at it

```
http://localhost:3000/start        walk to Q5 — the grey card sits left of "Premium new website"
http://localhost:3000/start?cardrig=1    [1-6] select   [↑/↓] adjust   [0] print all values
```

⚠ **`?cardrig=1` is NOT defaulted on for localhost**, unlike the orbiting light rig. That rig
earned its default by being a finished effect; this one binds the **arrow keys**, which would
otherwise be live on every local page load including while typing in the contact field. The
`INPUT`/`TEXTAREA`/`contentEditable` guard is carried across from `useLightRig`.

`[0]` prints face dimensions, corner radius, height ratio, predicted tilt and both budget
assertions — so the 5.67° trap and the budget squeeze are visible **while** tuning.

---

## What is deliberately absent

No glass, no transmission, no environment map, no filament, no light beyond the static
diagnostic rig, no text, no A–E variants, no logo backdrop, no Next step button. **The five CSS
cards are untouched and still work.** Those are chunks 2–5.

⚠ **`frameloop="demand"` is preserved.** The light is static — Carl: *"There would be no
animated light"* — so nothing spins a continuous rAF loop. The orbiting rig's loop is the
reason it cannot ship to production; this chunk does not inherit that cost.

---

## Open for Carl's judgement

1. **The whole form** — silhouette, rim, bevel, convexity. Everything above is instrumentation;
   none of it says the card looks right.
2. **Crown 4.5** — legible enough to judge, not chosen. ⚠ **Revisited in chunk 4**: the crown's
   other job is giving the travelling filament something to catch, which is invisible until the
   filament exists.
3. **Face recessed 0.5 behind the bevel lip** — decided by the Builder on Carl's delegation
   (*"Whatever is best suited for the design"*). Control #6 overrules it by eye.
4. **The diagnostic grey is not a proposal.** Colour and material are chunk 2.

---

*3 August 2026. Geometry only. Nothing approved was edited; the WebGL card is built beside the
live grid, not on it.*
