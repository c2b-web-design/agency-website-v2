# Contact Field — Gold, Light and the Orbiting Glint

**Captured:** 28 July 2026
**Status:** Working reference. **Not a plan and grants no implementation authority.**
**Purpose:** Carry the measured values, the display findings and Carl's stated intent for the
orbiting light, so the eventual chunk starts from evidence rather than re-derivation.

**Code state at capture:** commit `776921d`. Colour and environment changed; **no light, no
glint, no bloom, no logo on the page, no opal response.** Those are the work ahead.

---

## ⚠ ADDED 31 July 2026 — THE LIGHT IS INTERMITTENT, NOT CONSTANT

**Carl, on why the progressive rim's A/B could not be judged yet:**

> *"We cannot judge it properly until we see a moving light shining across the boxes. **A light
> that is not constantly on but turns on/off as it moves.**"*

⚠ **This is new and materially changes the brief below.** Everything already recorded describes
an orbiting light with a momentary aimed glint — but travelling as a **constant source**. Carl
has now specified that it **extinguishes and re-ignites along its path.**

**Two things now wait on this chunk rather than one:**

| Deferred | Why |
|---|---|
| `FIELD_GRAIN_TINT` (0.55) | Relief exists to catch the glint; tint-vs-relief cannot be compared without it |
| **The progressive rim's unlit technique** | Fully-dark vs dim-gold is a question about how metal reads when light crosses it |

⚠ **Both A/Bs must stay in the build until this chunk runs.** Collapsing either to a single
value first would silently discard a comparison that was built to be made under the light.

---

## Carl's method — read this before using anything below

**This is a rough mix, not a calibration.** Carl's process, in his words:

> *"Get the basics down, like a rough mix, and producing after. Fine tuning the numbers etc.
> Doing things in stages, once in place going back and getting granular."*

And the correction that matters most for how these numbers should be treated:

> *"Don't come at it from the perspective that we put things in place and that's it. The page
> is a whole mix, all the tracks and subtracks. VSTs and automation. Effects, routing and
> busses. You don't do a thing to one element and that's it. **There is a relationship
> between everything. Sometimes a causal relationship.**"*

⚠ **Therefore: every value here is provisional and expected to move.** Raising the
environment did not only brighten the bevel — it also changed the face's satin gradient, the
apparent depth of the well, and how much headroom a glint has before it clips. One fader
moved several things. **Do not treat a measured value as settled because it was measured.**

---

## The three-layer depth model — Carl's stated intent

One light, in orbit, across three layers. **Depth is expressed by how each layer responds to
the same light at different distances.**

| Layer | Element | Position |
|---|---|---|
| Background | C2B logo | top-left corner (not yet placed) |
| Middle | the boxes | contact layer |
| Foreground | the opal | above Send |

Carl: *"Thus our orbiting light can be used to emphasize these layers."*

**Distance is the intensity control, and it falls out of placement rather than being three
arbitrary numbers.** Carl: *"We are very close to the logo and the light intensity needs to
be dialled down. The boxes are further away."*

### The glint

- **Momentary, not a constant key.** Achieved by turning the light on and off over *a few
  hundred milliseconds*.
- **Aimed**, not sweeping the whole band — Carl named the **top-left** and possibly the
  **bottom-right** of Box 1, where the geometry already catches light.
- **Bloom is coupled, not decorative.** Carl: *"the numbers that define that bloom will be
  related to the metal and intensity of light."* This is the project's ethos applied —
  *effects should feel caused by the world, not layered on top of it.*
- **The opal is the prize.** Light passing *behind* a transmissive foreground element, so the
  existing white shine above Send *"would quickly intensify and decrease as the light moves
  away."* That is light **through** the material, not off it, and it is the effect that sells
  the depth ordering, because it only works if the light genuinely orbits behind the
  foreground.

---

## Measured — the gold

**Logo reference.** Sampled from `brand-assets/logo/c2b-logo-gold-hero-transparent.png`,
149,431 opaque non-black pixels sorted by luminance:

| Band | Hex | Luminance |
|---|---|---|
| 5th pct — shadow | `#603d11` | 65 |
| 50th pct — median | `#ad772d` | 125 |
| 40–60 pct mean | `#b07828` | — |
| 75th pct — **champagne** | `#f2bf61` | 195 |
| 95th pct — blown specular | `#f6f7ec` | 246 |

**Rendered bevel, before and after:**

| | Colour | Rendered | Luminance | Warmth (R−B) |
|---|---|---|---|---|
| Baseline | `#c08f42` | — | — | — |
| First attempt | `#b07828` | `#562b03` | **49** | 83 |
| **Current** | `#f2bf61` | `#cca650` | **168** | 124 |

### The mistake worth not repeating

The first attempt used the logo's **median**. It rendered ~2.5× too dark *with the logo's own
average already applied*. **The sampling was correct; the role was wrong.** The logo mark is
mostly bright gold with thin dark edges, so its median is dragged down by shadow lines and
anti-aliased pixels against black. **That median is the logo's average, not the logo's gold.**

### The constraint that colour alone cannot solve

`metalness: 1.0` means `color` tints the **reflection** — it is not paint. **A metal can only
be as bright as its surroundings.** The scene's surroundings are two reflection panels. At
`ENV_KEY_INTENSITY = 2.6` there was not enough radiance for a champagne tint to land on, so
every colour value tested collapsed toward bronze.

Raised in the same change: key `2.6 → 7.0`, fill `0.5 → 1.3`, ratio preserved.

---

## Measured — across displays

Carl views this site on a phone, a 27" desktop monitor, and a 65" 4K TV (browser on the TV,
and via a Formuler 4K Android box). Run `node verify/field-displays.mjs`.

| Display | Luminance | Falloff | Lit px |
|---|---:|---:|---:|
| phone 390×844 @3x | 152 | 112 | 7,831 |
| tablet 900×1200 @2x | 161 | 84 | 4,863 |
| **desktop-27 2560×1440 @1x** | **104** | 111 | **2,060** |
| tv-4k 3840×2160 @1x | 126 | 88 | 1,800 |
| tv-4k 1920×1080 @2x | 128 | 118 | 5,935 |

**Two findings.**

1. **The band is not flat.** Falloff of 84–118 is a genuine tubular gradient. An earlier claim
   in this session that it looked flat was wrong — it came from a 1440 capture too small to
   show the roundness. Corrected here so the error is not inherited.

2. ⚠ **Carl's 27" monitor is the worst case.** Luminance **104** against a phone's 152 — the
   same material a third darker on the display he actually judges on. Cause is device pixel
   ratio: fewer samples across a 38px bevel average the bright crown away.

**Carl's correction on where that leads, and it changes the approach:** contrast carries form
at low resolution, **not** sample count. Light and shadow are the lever, not pixel density.

**HDR is not tested and is not a priority.** Headless Chromium is sRGB. Carl: *"HDR is not
really a priority. Its clarity."*

---

## Geometry — the numbers the light has to work with

From `contact-field-geometry.ts` and `contact-field-mesh.tsx`:

| | Value |
|---|---|
| Box 1 body | **284 × 38** world units (1 unit = 1 CSS px) |
| Corner radius | 14 |
| Rim depth | 6 |
| **Bevel crown height** | **1.2** |
| Bevel inset from rim | 1.5 |
| Face inset | 4.5, sunk 0.35 at the seam |

⚠ **The crown is 1.2 units proud on a 284-wide object — roughly 1:240.** That is the entire
relief the light has to work with. It is a shallow tube, not a pipe.

### Predicted shadow behaviour — a prediction to check, not a decision

Carl's test case: light overhead, centred, angled 45° left, aimed at the top-left corner.

- **Inner edge of the well, right side.** Crown 1.2 high at 45° casts ≈ **1.2 units**, roughly
  a quarter of the 4.5 face inset. Visible, not dominant.
- **The top-left rounded corner is where form reads.** Across a 14-unit radius the crown's
  angle to the light rotates continuously, so the shadow sweeps from inner-right round to
  inner-bottom.
- **Almost nothing along the straights.** A 45° side light on a horizontal tube casts along
  the tube's own length, where there is nothing to receive it. **Straights carry the glint;
  corners carry the form.**

**Beam width.** At 1:240 relief, a wide beam lights the band evenly and the relief disappears
— which is what "flat" looked like. **A narrow beam produces contrast, and contrast is what
survives at low pixel counts.**

---

## Open — for the Architect, not for the Builder to decide

1. **Are there real shadows?** There are **no** `castShadow`, `receiveShadow` or AO maps in
   this scene. What currently reads as shadow is reflection falloff plus geometric occlusion.

   **Carl's position, and it is sound:** they look and read like shadows, the rim has real
   geometry, and with a *momentary* glint rather than a constant key there is no sustained
   lighting condition for a missing cast shadow to contradict. **Whether real shadow mapping
   is needed cannot be settled before the light exists** — it depends on the glint intensity,
   the coupled bloom, and the opal's response. Deciding it now would be soloing a track and
   mixing it against silence.

2. **Roughness** stays at `0.34` on Carl's instruction — *"lets keep the .34 see how it looks
   first."* Untouched so the colour change was the only variable.

3. **Bloom means postprocessing.** A real addition to the render pipeline, and it interacts
   with the canvas pre-warm already hardened in this component (see the `canvasWarm` gate).

4. **The `@1x` clarity question** touches the 1-world-unit-to-1-CSS-pixel mapping, which is
   documented as load-bearing for the geometry proof. Not a value tweak.

5. **Boxes 2–4 do not exist.** Their entrance timing is already contracted — `--eq-field-delay`
   of 4100/4600/5100ms — so they need no retiming when built.

---

## Harness

| Script | Answers |
|---|---|
| `verify/field-colour.mjs [label]` | Rendered gold at completion vs the sampled logo bands |
| `verify/field-displays.mjs` | The same across phone → 4K TV, with tubular falloff |
| `verify/field-entrance-timing.mjs` | Entrance timing against the approved 3600ms contract |

⚠ **A note for when the other elements exist.** These measure values in **isolation**. Under
Carl's mix model the useful measurement is the **relationship** — gold against opal against
background in one frame, balance rather than level. Worth rebuilding then.

**The boundary does not move: verification is not approval.** These scripts answer *is it
what I think it is*. Carl answers whether it is right.
