# Frosted glass in Three.js — reference for chunk 2

**Supplied by Carl, 11 September 2026, from Gemini.** ⛔ **A REFERENCE, NOT A SPEC.** Nothing here
is measured against this project and no value is approved.

---

## ⛔⛔ THE ONE LINE THAT MATTERS MOST, AND IT CORROBORATES THIS PROJECT'S OWN RECORD

> *"Transmissive materials refract what lies behind them. Ensure your scene has **background
> geometry** or an **environment map**, otherwise the glass will appear invisible or dark grey."*

⚠⚠ **`answer-card-geometry.ts` reached the same conclusion the hard way on 3 August 2026:** a card
moved over the lockup *"would have put it in front visually while it refracted NOTHING — the same
pale slab"*, and ⛔ ***"The frost was never the problem; the absence of anything worth seeing through
was."***

**Two independent sources, same conclusion.** ⛔ **This is why the proxy rectangles exist** — Carl,
11 September: *"can you sample the wall colour and put a rectangle of the same colour behind the
cards?"* Sampled values are in `about-card-geometry.ts` → `PROXY_COLORS`.

⚠⚠ **AND THE SHARP QUESTION IT RAISES, WHICH IS MEASURED AND UNRESOLVED: after a heavy blur both
floor regions go FLAT** — one or two levels of variation across the whole footprint. **A faithful
proxy may give the glass nothing to distort**, and frosted glass over a flat field looks identical
to clear glass. ⛔ **That is the pale-slab defect restated.** `PROXY_CONTRAST` is the dial, currently
0 (faithful).

---

## The parameters

| parameter | Gemini's range | note |
|---|---|---|
| `transmission` | 0.90–0.98 | replaces opacity; passes light THROUGH |
| `roughness` | 0.20–0.35 | the frosted blur. 0.0 = window glass |
| `ior` | 1.40–1.52 | physical glass |
| `thickness` | — | volumetric depth; exaggerates edge refraction |
| `clearcoat` | 0.8 | polished layer over a frosted body |
| `opacity` | 1.0 | ⚠ keep at 1 when using transmission |

**Gemini's live demo, same day:** roughness 0.17 · transmission 0.54 · thickness 0.75 · IOR 1.41.

---

## ⛔⛔ THREE PROJECT-SPECIFIC FACTS THAT OVERRIDE ANY VALUE ABOVE

**1. `thickness` IS IN WORLD UNITS AND SCALES WITH THE MODEL.** `answer-card-glass.ts:187`: it is
*"in PIXELS, NOT METRES... one world unit here is one CSS pixel. A value tuned for a metre-scale
scene would be wrong by orders of magnitude."*

⚠⚠ **THIS CARD IS SPECIFIED IN MILLIMETRES AND IS SEVERAL TIMES LARGER THAN THE ANSWER CARD.**
⛔ **Reusing D-051's `GLASS_THICKNESS = 6` unchanged would read several times more saturated and
more opaque.** `thickness` and `attenuationDistance` must be rescaled with the card — **arithmetic,
not a tuning pass.** (Architect, 11 September, §3.6.)

**2. THE SITE'S APPROVED MATERIAL IS SATIN, NOT FROSTED.** CLAUDE.md: *"Satin answer-card face
material (D-051 — supersedes D-028's frosted blue glass)."* ⛔ **The file named `answer-card-glass.ts`
holds SATIN.** ⚠ **So "frosted glass" names a SUPERSEDED decision, and whether these cards are
frosted or satin is an open question for Carl.**

**3. NO HDRI, NO CDN, NO `drei` ENVIRONMENT PRESET.** `contact-field-canvas.tsx:23-34`: the
environment is generated locally by `PMREMGenerator.fromScene()` from ordinary panel meshes and
assigned **directly to the materials, never to `scene.environment`**. Drei's `Environment preset=`
is banned — *"it failed in this project once already (a 301 redirect from the drei-assets host went
unhandled inside Suspense and left the scene blank with NO console error)."*

⚠ **A PMREM CANNOT BE SHARED BETWEEN CANVASES** — it is bound to one renderer, so `/about` must
generate its own regardless of any material reuse.

---

## ⛔⛔ THE PARAMETERS ARE NOT THE WHOLE ANSWER — LIGHT PLACEMENT AND TINT

**Carl, 11 September 2026, on a second set of demo renders:** *"It's not just the parameters that
are important but also where the light is placed. Also what colour glass."*

### ⚠ WHERE THE LIGHT SITS

⛔ **The same parameters read as glass or as grey plastic depending on the rig.** In the demo the
knot reads as glass because a source BEHIND it transmits through — picking out the thick parts of
the curve — while a separate source catches the surface, and the spheres behind are visible and
blurred by the roughness.

⚠⚠ **THIS IS THE SAME PRINCIPLE THE GEOMETRY BENCH ALREADY PROVED.** A correct crown reads as FLAT
under a head-on beam; *"the ends give SHAPE and the middle gives PRESENCE."* ⛔ **A material cannot
be judged under a light that cannot disclose it** — and this project has already mis-judged a crown
exactly that way (contact field, 5.67° max tilt: *"I cannot tell any face being convex"*).

⛔ **CONSEQUENCE FOR CHUNK 2: the material bench needs a MOVEABLE light before any value is tuned**,
or the first parameter set that "looks right" will be one that suits an arbitrary light position.

### ⛔⛔ TINT COMES FROM `attenuationColor`, NOT `color` — AND THIS CARD MAKES IT MATTER

⚠⚠ **ONCE `transmission` IS HIGH, `color` STOPS BEHAVING LIKE PAINT.** Tint in a transmissive
material comes from **`attenuationColor` + `attenuationDistance`**: light is absorbed as it travels
THROUGH the volume, so **thick parts tint more than thin parts** (Beer-Lambert). It is why real
glass is pale at an edge and saturated through its body.

⛔ **AND THIS CARD'S THICKNESS VARIES BY DESIGN.** The crown is thickest at the centre and falls to
nothing at the rim. **Under volume attenuation that produces a tint gradient across the face for
free — deepest where the crown is highest, clearing toward the edges.**

⚠ **That is the SAME behaviour the record already says the convex face exists for:** a curved face
*"concentrates transmission where the glass is thickest and falls off toward the rim — which is what
makes it read as a solid object made of glass rather than a glowing panel"* (4 September).

⛔ **Setting the tint with `color` would give a FLAT WASH that ignores the geometry entirely** —
throwing away the one optical property the crown was shaped to produce.

⚠ **`attenuationDistance` IS IN WORLD UNITS and scales with the model, exactly like `thickness`.**
Same trap, same rescale. ⛔ **Unmeasured on a millimetre-scale card.**

⚠ **THE COLOUR ITSELF IS UNDECIDED AND IS CARL'S.** It interacts with the neon — if the rim is the
light source, its hue passes THROUGH the glass and is attenuated by the tint. **Two colour decisions
that cannot be taken separately.**

---

## ⚠ WHAT THE SNIPPET'S GEOMETRY IS NOT

Gemini uses `BoxGeometry(2, 2, 0.04)` — a flat slab. ⛔ **This project's card is a rim, a bevel and
a convex face built from one sampled path**, and the convexity is load-bearing for the lighting, not
decoration: a curved face *"concentrates transmission where the glass is thickest and falls off
toward the rim"* (4 September). **Take the material parameters; ignore the geometry.**

---

## ⚠ TWO THINGS STILL UNTESTED

- ⛔ **Whether the approved glass carries light THROUGH from behind.** It was tuned for a FRONT-LIT
  card in a dark corridor. Nobody has checked.
- ⛔ **Whether transmission reads at low intensity.** Carl's neon is deliberately subtle — *"just
  enough to confirm the same world idea"* — so it cannot be the main thing lighting the face. The
  material has to work at a low level.

---

*Filed 11 September 2026. Gemini's text is Carl's supply and is reproduced for its parameter ranges;
every project-specific fact above is from this repository and overrides it.*
