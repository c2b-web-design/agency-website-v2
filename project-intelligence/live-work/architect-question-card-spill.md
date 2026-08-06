# Architect question — a card's light does not reach its neighbours

**Written 5 August 2026 by the Builder, for Carl to route to the Architect.**

**Carl: *"lets go back to the architect... 'a little more light might show us the way'."***

**This is the third time a shared-scene assumption has been measured false.** Two consultations on
4 August and one on 5 August each solved in a single pass what the Builder had failed at
repeatedly. Same shape again.

Repo: `main`, head `fc27418`. Three 0.185.1. **Step 1 is applied but UNCOMMITTED.**

---

## What the plan predicted, and what happened

**Step 1 raised `FILAMENT_LIGHT_DISTANCE` 90 → 700.** The Architect's own analysis said the cutoff
was amputating each card's own face (half-width 93.3px against a 90px window) and that lifting it
would restore both the own-face falloff **and** the spill onto neighbours.

**Half of that came true.**

```
card 1 lit, every other card UNLIT, measured on a real GPU (ANGLE/AMD D3D11)

  card 1 own rim              warm(R-B)  +50.2      <- was 0
  card 1 own far end          warm(R-B)  +46.4      <- was 0, the amputation fix
  card 4 top-left  (~33px)    warm(R-B)   +0.1
  card 4 centre               warm(R-B)    0.0
  card 2 left edge (~102px)   warm(R-B)    0.0
  card 5 centre               warm(R-B)    0.0
  CONTROL far backdrop        warm(R-B)    0.0      <- control held
```

**The own-face fix is real and visible. The spill onto neighbours is ZERO.**

### It is not "too dim" — a power sweep rules that out

Driving `filamentPower` from 60 to 300 via the rig, card 1 lit only:

| power | card 1 own face | card 4 top-left (unlit) | card 2 left edge (unlit) |
|---:|---:|---:|---:|
| 60 | +5.8 | +0.1 | 0.0 |
| 120 | +13.2 | +0.1 | 0.0 |
| 180 | +20.1 | +0.2 | 0.0 |
| 240 | +26.2 | +0.2 | −0.1 |
| 300 | +31.4 | +0.3 | −0.1 |

⚠ **Card 1 climbs 5.4× while both neighbours stay pinned at ~0.** The light is **not arriving**,
not arriving weakly.

### A horizontal scan shows a hard boundary, not a falloff

Scanning warm-delta across the full 576px grid, card 1 lit:

```
row1 RIM   max Δwarm 71.4  ################................................
row1 FACE  max Δwarm 77.6  #......o.......#................................
row2 RIM   max Δwarm  0.2  ................................................
row2 FACE  max Δwarm  0.0  ................................................
                           ^card1 x0-187^  ^card2 x195-381^  ^card3 x389-576^
```

**The light covers exactly card 1's own width and stops dead.** No gradient into card 2's left
edge, nothing on row 2. **Inverse-square does not produce an edge like that.**

---

## What the Builder checked, and what it did and did not explain

**1. Transmission discards the face's diffuse response — TRUE, but insufficient.**
`transmission_fragment.glsl.js:33`:

```glsl
totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
```

with `GLASS_TRANSMISSION = 0.97` (`answer-card-glass.ts:110`). **So ~97% of a face's diffuse
response is thrown away.** That would explain a dark *face*.

⚠ **IT DOES NOT EXPLAIN THE RIM.** The rim is `meshStandardMaterial`, `metalness: 1`, **no
transmission**, and an unlit card's rim also measured **0.00 / +0.20**. A metal surface 33px from a
lit point light should show something. **This is where the Builder stopped, rather than guess a
fourth time.**

**2. Scene structure looks correct.** All five `AnswerCard`s are siblings under `CardScene`
(`answer-card-canvas.tsx:1622-1634`), each `<group position={[slot.x, slot.y, 0]}>` with
`FilamentLight` as a sibling of `CardLighting` inside it (`:890-925`) — the always-visible outer
group the cache-key constraint requires. **One scene, as the code's own comment at `:1616` insists.**

**3. `CardLighting` mutates materials per frame** (`:1042-1061`), multiplying `color` and
`envMapIntensity` by the entrance progress — but it settles at `lit = 1` and restores full values,
and the cards are visibly fully lit when measured.

**4. Not ruled out, and the Builder did not get to it:** whether the point lights are actually
present in the scene at render time with the world positions and intensities expected, whether
anything (layers, `traverseVisible` at draw time, the transmission pass's own render list) is
excluding them, or whether five point lights exceed some limit and are silently dropped.

---

## What is being asked

1. **Why does a point light 33px from an unlit card's METAL rim contribute nothing?** Transmission
   explains the face; it cannot explain the rim. What is the actual mechanism?

2. **Is the "one world" premise achievable as designed at all?** The code asserts at `:912` that
   *"nothing written into card 1's own material can light card 2 — only a light can. And it works
   only because all five cards share ONE scene."* **The measurement contradicts that.** If real
   point lights cannot deliver cross-card spill here, that assertion needs correcting in the code
   as well as in the plan.

3. ⚠ **CARL'S OWN SUGGESTION, AND IT DESERVES A DIRECT ANSWER:** *"We have global light. Could that
   somehow be used to help with a card's secondary effects?"*

   The three scene lights (`:1514-1524` — ambient 0.35, key directional 2.1, fill 0.35, all white,
   all `× lightLevel`) **demonstrably do reach every card** — they are what lights the grid now. The
   filament point lights demonstrably do not.

   **Is driving the global lights from lit state a sound route to the neighbour effect, or a fake
   that will not survive?** Carl's design intent is specifically physical — *"if a light source is
   shining on glass and a colour filter is placed in front of the lens"* — so a global that warms
   everything equally is **not** the same thing as light falling off with distance. But it is the
   one channel proven to work.

   Possible shapes, for the Architect to accept, reject or replace:
   - **Global colour driven by total lit intensity** (already Step 2 of the approved plan) — cheap,
     proven channel, but **position-blind**: card 5 would warm as much as card 4.
   - **A second directional or point light positioned at the CENTROID of the lit cards**, so the
     warm light has a direction that shifts with selection — position-aware without needing
     per-card lights to cross.
   - **Per-card uniforms fed by a JS-side distance calculation** — physically-shaped falloff
     computed on the CPU and passed as a number, abandoning real light transport for the spill
     while keeping it for the card's own filament. ⚠ Note this is close to what `GRID_REFL` did in
     CSS, which Carl retired as *"approved only within the constraints of CSS"* — **so it may be
     the very thing he does not want.**

4. **Does the answer change Step 3?** The plan's face-band tint (tinting `radiance` before
   `<lights_fragment_end>`) was confirmed sound and is independent of spill — **but if the neighbour
   effect has to come from a different channel, should Step 3 still be next, or does the ordering
   change?**

---

## Constraints the answer must respect

- ⚠ **`numPointLights` is in the shader program cache key**, lights are gathered with
  `traverseVisible`, and the precompile runs while each card's inner group is hidden
  (`answer-card-canvas.tsx:1337-1342`). **Light COUNT must stay constant** — mounted at intensity 0
  rather than conditionally rendered. **Adding a sixth light is a cache-key change and must be
  stated as such**, not slipped in.
- ⚠ **Colour and intensity are uniform-only and safe to mutate per frame** — verified,
  `WebGLLights.js:281,375`.
- **The backdrop is `MeshBasicMaterial` and therefore unlit** — Carl's requirement that the lockup
  keep its colour integrity outside the cards is satisfied **by construction** on any route that
  works through scene lights. **A route that tints the backdrop's own material would break it.**
- **Approved and locked:** frosted glass (D-028), filament border (D-029). Frosting is a **future**
  layer — the glass *"will eventually be slightly frosted"* — so values should stay deliberately
  low; frosting scatters and will read stronger.
- **Carl's volume:** it should *"sing but at low volume"*. Restrained, unmistakable.

## Files

- `components/enquiry/answer-card-canvas.tsx` — `FilamentLight` (`:938-995`), `AnswerCard` group
  (`:889-926`), `CardLighting` (`:1012-1071`), scene lights (`:1514-1524`), `CardScene` slot map
  (`:1622-1634`), cache-key constraint (`:1337-1342`)
- `components/enquiry/answer-card-mesh.tsx` — rim (`:895-903`), bevel (`:918-924`), face (`:939-959`)
- `components/enquiry/answer-card-glass.ts` — `FILAMENT_LIGHT_DISTANCE` (now 700),
  `FILAMENT_LIGHT_POWER`, `GLASS_TRANSMISSION = 0.97`
- `verify/card-spill.mjs` — the harness above. **Positive control (a lit card's own rim must move)
  and negative control (far backdrop must not) both pass**, so the zeros are real.

## Prior answers not to be re-derived

- `live-work/architect-answer-begin-stall.md`
- `live-work/architect-plan-response-card-lighting.md` — the review this work is executing
- `live-work/architect-answer-opening-stutter.md` — the two-variant compile and cache-key reasoning

---

*Written by the Builder. Step 1's own-face fix is real and measured; only the neighbour half
failed. If this question has misstated the mechanism, the correction is more useful than the
answer.*
