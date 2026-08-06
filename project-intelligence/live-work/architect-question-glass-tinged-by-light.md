# Architect question — glass tinged by its own light

**Written 5 August 2026 by the Builder, for Carl to route to the Architect.**

**Carl's instruction: *"frame a comprehensive prompt to the architect. Include what we want to
achieve, not just technical steps. Give the architect the full picture to make informed
decisions."*** So this leads with intent and puts the mechanics after it.

Repo: `main`, head `fc27418`. Three 0.185.1. Working tree has uncommitted geometry and rig work
described below.

---

## PART 1 — WHAT CARL IS TRYING TO ACHIEVE

### The governing sentence

> **Carl, 5 August:** *"So do I want amber frosted glass? No. I need the frosted glass to be
> tinged by the light. To have the most subtle effect to confirm and reinforce that this is a 3D
> object. The filament's intensity can be changed to achieve this."*

⚠ **THE DISTINCTION IS THE WHOLE BRIEF.** Amber glass is a *material* — it is the same colour
whether the filament is lit or dark. **Glass tinged by light is a *response*** — it exists only
while there is light to tinge it, and it disappears when the filament cools.

**That difference is the entire point, because the effect's job is EVIDENCE, not decoration.**
Carl: *"to confirm and reinforce that this is a 3D object."* A tinted material would be a coloured
picture. A reflection that warms when a source lights and cools when it dies is the object telling
you it is really there, lit by something really there.

⚠ **AND ITS CORRECT VOLUME IS "THE MOST SUBTLE EFFECT."** Not a look. Not a feature. The least
that still reads. **An implementation that is clearly visible has probably failed**, and this is
the axis on which to err downward.

### How Carl reasons about it — physics, and he has been right every time

> *"If a light source is shining on glass and a colour filter is placed in front of the lens, would
> not that influence the colour?"*

⚠ **SUBTRACTION, NOT ADDITION.** A filter **removes blue** rather than adding orange, so the
result **darkens and saturates** instead of washing out. Recorded weeks ago, and it is the reason
an additive overlay is the wrong operation.

> *"The scene is lit by global white light, hence the reflections. When card 1 is locally lit, that
> white reflection wouldn't stay white — the amber would overpower it. It's the equivalent of
> having white light and then over the lens you put an amber filter. Depending what shade of amber
> determines its output. If the intensity of the filament was reduced so would the impact on the
> reflection, and if it was ramped up."*

**That is a complete specification** — source, mechanism, and the control that drives it. **It is
also a description of a multiply.**

⚠ **CARL NOTES WE HAVE HAD THIS CONVERSATION BEFORE, SESSIONS AGO.** *"Weve had this conversation
before, sessions ago."* **The physics keeps being agreed and not surviving into the build.** That
is a process signal, not a detail: whatever is decided here needs to land in the code with its
reasoning attached, or it will be re-litigated a fourth time.

### The mixing-desk frame

> *"All the parameters are in place, like a mixing desk. Now we have to move and blend to get what
> we want to hear/see."*

**Carl's method throughout: faders from a low start, pushed up together, judged by ear.** He tunes
from the extreme — *"if you start from a position of all 5 cards on, and work out theres little
effect on other colours, thats the strongest its gonna get."*

⚠ **HE IS MOSTLY RIGHT THAT THE DESK IS BUILT, AND THE EXCEPTION IS THIS CHUNK.** Faders that
exist: filament intensity `[f]`, spill power `[p]`, light height `[z]`, cutoff `[d]`, rim radius
`[1]`, light level, roughness, transmission. **What has no fader is the thing he just asked for —
the tint on the reflection has no signal path at all**, so no amount of moving existing controls
produces it.

### Where this sits in the larger arc

**Carl: *"the use of light is really whats gonna sell the 3d geometry."*** Everything built so far
is shape. This is the chunk that makes it read as material.

**And the frosting is still ahead.** The glass *"will eventually be slightly frosted"*, and Carl
wants the text under it to stay *"legible to some extent... that would depend on the frosting we
ramp up."* ⚠ **Frosting SCATTERS**, so the same tint will read stronger once it lands. **Values
set now should be deliberately under where they look right today.**

---

## PART 2 — WHAT IS ALREADY DECIDED

- **The backdrop outside the cards is exempt** — Carl: *"I would like the colour and the colour
  transition to keep their integrity."* ⚠ **Already true by construction:** the lockup is
  `MeshBasicMaterial` (`answer-card-backdrop.tsx:134`, `:196`), which ignores every light. **Any
  route working through scene lights or material shaders cannot touch it.** A route that tints the
  backdrop's own texture would break it.
- **Inside the cards, the lockup shows through and stays in the world** — it is deliberately opaque
  with `alphaTest` so it reaches the transmission target.
- **`GRID_REFL` is retired as a target.** Carl: it was *"approved only within the constraints of
  CSS"*. Direction only — bottom row more than top row. **Do not propose measuring against it.**
- **Approved and locked:** frosted glass (D-028), filament border (D-029).

---

## PART 3 — THE STATE OF THE BUILD, MEASURED

### What was done this session, uncommitted

1. **`FILAMENT_LIGHT_DISTANCE` 90 → 700.** The cutoff was amputating each card's own face — a card's
   half-width is 93.3px against a 90px window, so **the outer third of every lit card's face
   received zero light from its own filament.** Fixed: **+46.4 warm at the far end, was 0.**
2. **Geometry made proportional** — Carl: *"change the bevel proportionate to the filament"*, and
   *"expand the face proportionately."* `BEVEL_RISE = RIM_TUBE_RADIUS × 0.8`,
   `faceRecess = bevelRise × 0.3125`. **At the approved rim of 2.0 both reproduce the previously
   hardcoded values exactly** (1.6 and 0.5). Face *width* needed no change — `faceInset` was already
   `2×tubeRadius + bevelWidth`.
3. **Rig gained `[z]` height, `[p]` power, `[d]` cutoff**, plus `?fz=` / `?fp=` for harnesses.

**Verified at rim 0.8 the card still reads correctly** — fine-line rim, grey boundary when off, no
black interior. ⚠ **And Carl's own verdict on the visual cost: *"The change at human level/scale is
imperceptible."*** So the rim is now effectively a **functional** dial, not a visual one.

### Four things measured to be structurally missing, not mis-tuned

⚠ **THIS IS THE PATTERN THAT MATTERS MOST, AND IT IS WHY THIS CONSULTATION IS BROADER THAN ONE
FEATURE.** Each was found by fixing the one before it:

| # | missing | evidence |
|---|---|---|
| 1 | **Cross-card light transport** | Card 1 lit: neighbours read **0.0**. A 5× power sweep moved the lit card 5.4× and neighbours **not at all** |
| 2 | **The tint on the reflection** | The env reflection is multiplied by nothing. **No existing fader can warm it** |
| 3 | **Filament size → output** | `tubeRadius` appears **nowhere** in the light's intensity. Shrinking the rim changes emitting geometry and output stays identical |
| 4 | **Bottom-edge light** | The filament is a **closed loop**; the light modelling it is **one point at the card's centre** |
| 5 | **Shadow** | No `castShadow` anywhere. Carl: *"we are using light — light without shadow is not the full and true effect of light"* |

**On #1, the mechanism is understood** (Architect, previous answer): every card surface is
specular-only — rim `metalness: 1` gives `diffuseContribution = 0`
(`lights_physical_fragment.glsl.js:4`), face `transmission: 0.97` mixes 97% of diffuse away
(`transmission_fragment.glsl.js:33`). A z-height sweep confirmed height is the dial, **though
measured ratios ran 2.5–5× steeper than the flat-plane model predicted**:

| z | own:neighbour measured | predicted |
|---:|---:|---:|
| 6 | 78.5 : 1 | 175 : 1 |
| 15 | 34.1 : 1 | 14 : 1 |
| 30 | 10.4 : 1 | 3.3 : 1 |
| 45 | 7.5 : 1 | 1.9 : 1 |

⚠ **Carl's own reading of why, and it is better than the Builder's:** the light sits at z=6 in the
plane of the cards, so *"the light from one filament cannot go over an adjacent filament because
they are the same height — it effectively acts as a wall."* **Not occlusion** (there are no
shadows, so nothing blocks anything) **but elevation** — everything is lit at grazing incidence,
and a convex face curving away returns almost nothing to an orthographic camera. **He then
proposed lowering the filament BELOW the face apex** so neighbouring faces catch light on the curve
turned *toward* the source. **That has not been built.**

⚠ **THE BUILDER'S MEASUREMENT HARNESS FOR THE FACE BAND IS CURRENTLY RETURNING STALE VALUES** —
three distinct cards read byte-identical RGB, which is impossible over a blue-to-teal lockup.
Sample-point placement was proven correct with an on-screen marker overlay; the decode is at fault.
**No face-band baseline should be trusted until that is fixed.**

---

## PART 4 — WHAT IS BEING ASKED

**1. Is the multiply the right operation for "tinged by light", and is this the right insertion
point?**

The prior answer confirmed `transmission_fragment` mixes only `totalDiffuse` and leaves
`totalSpecular` unmodified, so the IBL band survives transmission at full strength. Verified here:
`radiance` is written at `lights_fragment_maps.glsl.js:33` and consumed by `RE_IndirectSpecular`
inside `lights_fragment_end.glsl.js:16`, so the tint must go **before** that include:

```js
.replace(
  "#include <lights_fragment_end>",
  `radiance *= mix(vec3(1.0), uAmberTint, uAmberAmount);
   #include <lights_fragment_end>`,
)
```

**Does multiplying `radiance` genuinely implement Carl's filter** — subtraction, darkening and
saturating rather than washing out — or does it need a different form to behave like a filter
rather than a tint?

**2. What drives `uAmberAmount`, given Carl's *"if the intensity of the filament was reduced so
would the impact"*?** The card's own `filament.intensity.current` is the obvious source. **Should
it be that alone, or that plus a neighbour term?** Carl has asked for both effects but explicitly
parked the neighbour half: *"first lets deal with card 1 alone and park secondary effects."*

**3. ⚠ SHOULD THE FILAMENT'S SIZE DRIVE ITS OUTPUT?** Carl: *"Does a smaller filament give out the
same amount of light?"* Physically no; in the code, currently yes. **If output should scale with
`tubeRadius`, by what — cross-section, surface area, or not at all so the rim stays a purely visual
dial?** This changes what happens when Carl sweeps `[1]`.

**4. ⚠ THE SOURCE-MODEL QUESTION, AND IT MAY BE THE REAL ONE.** Carl: *"you will also have the
filament on its bottom edge whose light will travel through glass and add to the reflection."*

**The design is a glowing perimeter around a recessed convex lens. The model is a single point at
the centre.** Light should arrive on the crown from all four edges — the bottom edge lighting the
underside of the curvature where the top edge cannot reach, refracting through the face's thickness
and adding to the band from beneath.

**Is a point light the wrong primitive for this design?** Options the Builder can see, none costed:
a light per edge (4× the count, and `numPointLights` is in the program cache key), an emissive ring
the glass samples via the env map, or an area-light approximation. ⚠ **Four of Carl's five
questions this session have been about behaviour a PERIMETER has and a POINT does not** — which
suggests the model, not the values, is what is wrong.

**5. Sequencing.** The Builder's instinct is **the tint first, alone** — it is the one thing that
directly serves *"subtle reinforcement of a 3D object"*, it is two lines and a uniform, and it is
immediately a fader Carl can move. The source-model and shadow questions are about making the light
**physically complete**; the tint is about making it **read**, and Carl's stated goal is the second.
**Is that right, or does building the tint on a point-source model bake in something that has to be
undone when the model changes?**

---

## PART 5 — CONSTRAINTS

- ⚠ **`numPointLights` is in the shader program cache key**; lights are gathered with
  `traverseVisible`; the precompile runs while each card's inner group is hidden
  (`answer-card-canvas.tsx:1337-1342`). **Light COUNT must stay constant** — mounted at intensity 0,
  never conditionally rendered. **Any answer that adds lights must say so explicitly.**
- **Colour and intensity are uniform-only and safe to mutate per frame** (`WebGLLights.js:281,375`).
- ⚠ **A per-card uniform must NOT travel in shader text.** `onBeforeCompile` enters the cache key via
  `customProgramCacheKey()` → `toString()`. Interpolating a per-card number into the source gives
  **five programs instead of one**. Use `useCallback(…, [])` with a per-instance uniforms ref, as
  the rim already does (`answer-card-mesh.tsx:205-234`).
- **The face currently has NO `onBeforeCompile`** — the tint would be its first, adding a material
  variant. It does not change light counts, so the two-state precompile still warms the right
  variants, **but confirm rather than assume.**
- ⚠ **`chunk-scope.json` is deleted; the repo is fail-open.** No mechanical scope enforcement.

## Files

- `components/enquiry/answer-card-mesh.tsx` — face material (`:939-959`), `onBeforeCompile` patterns
  to mirror (`:205-234`, `:309-332`), derived `bevelRise` / `faceRecess`
- `components/enquiry/answer-card-canvas.tsx` — `FilamentLight` (`:938-1000`), scene lights
  (`:1514-1524`), `GLASS_RIG_PARAMS` (`:119-190`), cache-key constraint (`:1337-1342`)
- `components/enquiry/answer-card-glass.ts` — `HEAT_WHITE` (`#ffab52`), `FILAMENT_LIGHT_*`,
  `GLASS_TRANSMISSION = 0.97`, env panels (cool, `#dceaff` / `#9fb4d0`)
- `components/enquiry/answer-card-geometry.ts` — `BEVEL_RISE_RATIO`, `FACE_TUCK_RATIO`, `cardBudget`
- `verify/card-spill.mjs` — differential harness with positive and negative controls, both passing

## Prior answers not to be re-derived

- `live-work/architect-plan-response-card-lighting.md` — the plan review this executes
- `live-work/architect-question-card-spill.md` — the transport question and its measurements
- `live-work/architect-answer-begin-stall.md`, `architect-answer-opening-stutter.md` — cache-key
  reasoning

---

*Written by the Builder. If this has misstated the mechanism, the correction is more useful than
the answer — three of the four "structurally missing" findings above came from a Builder assumption
being measured false.*
