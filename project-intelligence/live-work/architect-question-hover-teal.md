# Architect question — the hover teal that animates and paints nothing

**Written 10 August 2026 by the Builder, for Carl to route to the Architect.**

Repo: `main`, head `071923c` (pushed). Three 0.185.1, React 19, Next 16.2.5.
Working tree has the uncommitted hover-teal work described below.

**Carl's standing instruction for these prompts:** *"Include what we want to achieve, not just
technical steps. Give the architect the full picture to make informed decisions."*

---

## PART 1 — WHAT CARL IS TRYING TO ACHIEVE

### The feature, in his words

> **Carl, 10 August:** *"Resting state is also hover state with this addition — answer text turns
> teal slowly when hovered. This echoes the rail system."*

And on the depth of the effect:

> *"Can the teal text be extruded slightly?"* — then, having been given the cost of real
> geometry: *"the text is so small doing it with real geometry would be a waste and too
> expensive."*

⚠ **THE WORD THAT MATTERS IS "ECHOES."** The teal is not decoration and not a new colour. The
memory rail already shows a user their answered questions in teal; a card turning teal under the
pointer says *this will become one of those*. **It is a promise about where the answer is going.**

That is why the exact value is not negotiable: `rgb(160, 220, 218)`, read from
`app/globals.css` — `.enquiry-pdepth-1` through `-5` `.enquiry-phrase-answers`. Carl, when asked
which teal: *"the same teal that is in the text in the rail system... It is the first teal, the
answers lose their opacity as more questions are answered."* **The rail's depth fade is opacity
applied on top of that one colour**, so this is the single value the rail uses at every depth.

⚠ **AND "SLOWLY" IS PART OF THE SPEC.** Not a 200ms UI transition. The current build uses an
exponential ease with tau 0.42s (~1s to settle), chosen to read as a material warming rather than
a state flipping. Unjudged by Carl — he has not seen it work yet.

### Why this is the next thing at all

The resting light was approved and committed this session (`7b056c2`) after a long correction
loop. Carl's model has three states:

| state | status |
|---|---|
| **Resting** | ✅ approved, `7b056c2` |
| **Hover** | resting + the answer text turns teal — **this question** |
| **Selected** | filament warms off → amber → stops halfway between amber and red |

**Hover is the smallest of the three and it is blocking the third.**

---

## PART 2 — THE PROBLEM

**The teal animates in the uniform and never appears on screen.** No GLSL error, no console
warning, no exception. The shader compiles, reaches the GPU, and paints white text.

### What was measured

`verify/hover-teal.mjs` samples card 1's label band before, during and after hover, and reports
the green-minus-blue balance of the brightest pixels — teal is green-dominant, the resting
near-white is blue-dominant.

    resting ink   r 199.4  g 204.1  b 213.6
    hovered       r 201.6  g 205.8  b 214.5

    green-minus-blue:  rest -9.41   hovered -8.67   shift 0.75
    expected shift, if the blend landed:              +13

**The captured frames show plain white text in both states** —
`verify/out/hover-teal/1-rest.png` and `3-held.png`. It is not a sampling artefact; the eye
agrees with the numbers.

### What has been ruled OUT, with evidence

⚠ **These are checked, not assumed. Please do not spend time re-eliminating them.**

| suspect | how it was ruled out |
|---|---|
| **The injected source never reaches the GPU** | Intercepted `WebGL2RenderingContext.prototype.shaderSource`. Eight fragment shaders containing `uLabelTeal` were compiled, 81991–85559 chars each. **The code is on the GPU.** |
| **A GLSL compile error** | Console and `pageerror` captured across a full run: none. |
| **Program cache serving a stale shader** | Added `customProgramCacheKey={() => "satin-face-hover-teal-v1"}`. **No change to the measurement** (shift 1.04 → 0.75). |
| **`vMapUv` / `USE_MAP` wrong** | Both are exactly what `three/src/renderers/shaders/ShaderChunk/map_fragment.glsl.js` uses at line 4. |
| **The teal texture is never built** | Built in a `useMemo` beside the white one, same `buildLabelTexture` call with a different ink argument. |

### What has NOT been checked, and is where I would look next

**Whether `uHover` actually reaches 1, and whether `uLabelTeal.value` is non-null at draw
time.** I was about to instrument both when Carl stopped me to consult you — correctly, because
I had already burned two wrong guesses (the cache key, and a suspicion about the sampling crop)
and was about to start a third.

---

## PART 3 — THE IMPLEMENTATION, SO YOU CAN SEE THE MISTAKE IF IT IS OBVIOUS

All in `components/enquiry/answer-card-mesh.tsx`.

**Two textures, blended on the GPU.** Carl chose this over redrawing the canvas (stepped, and a
2048×512 redraw on the interaction frame) and over tinting the whole face (tints the body, not
the glyphs).

```
uniforms = useRef({
  uAmber:      { value: 0 },
  uGlassFilter:{ value: new THREE.Color(GLASS_FILTER_TRANSMITTANCE) },
  uHover:      { value: 0 },
  uLabelTeal:  { value: null as THREE.Texture | null },
});

useFrame((_, delta) => {
  ...
  const target = hovered ? 1 : 0;
  const u = uniforms.current.uHover;
  u.value += (target - u.value) * Math.min(1, delta / LABEL_HOVER_TAU);
  uniforms.current.uLabelTeal.value = labelTealMap;
});

const onBeforeCompile = useCallback((shader) => {
  Object.assign(shader.uniforms, uniforms.current);
  shader.fragmentShader = `
    uniform float uAmber;
    uniform vec3  uGlassFilter;
    uniform float uHover;
    uniform sampler2D uLabelTeal;
    ...
    ${shader.fragmentShader}
  `.replace(
    "#include <lights_fragment_end>",
    `... radiance *= pow(...); #include <lights_fragment_end>`
  ).replace(
    "#include <map_fragment>",
    `#include <map_fragment>
     #ifdef USE_MAP
     {
       vec4 tealTexel = texture2D(uLabelTeal, vMapUv);
       diffuseColor = mix(diffuseColor, tealTexel * vec4(diffuse, opacity), uHover);
     }
     #endif`
  );
}, []);
```

The material is `<meshPhysicalMaterial>` with `map={labelMap}`, `color="#ffffff"` when a label
map is present (the body colour is baked into the texture — `color * map`, and no single `color`
serves both body and glyphs).

⚠ **`onBeforeCompile` is `useCallback([], ...)` and the uniforms live in a ref**, so the
`Object.assign` shares uniform *objects* with the shader and later mutations should propagate.
That is the pattern the three sibling materials in this file already use successfully for the
filament — **it is known to work in this codebase**, which is part of why this failure is
confusing.

---

## PART 4 — THE QUESTIONS

1. **What is actually wrong?** The shader is on the GPU and the uniform is being written. Is
   this a `useFrame`-ordering problem (the material's `onBeforeCompile` capturing a different
   ref instance per card?), a `#ifdef USE_MAP` scope issue, an sRGB/`colorSpace` interaction that
   makes the two textures resolve nearly identically after decode, or something else?

2. **Is `mix()` into `diffuseColor` after `map_fragment` even the right insertion point** for
   `meshPhysicalMaterial`, given transmission is 0 but sheen and anisotropy are live? Would
   blending the two textures BEFORE the material sees them — one texture, redrawn — be the
   sounder engineering even at the redraw cost?

3. **Is the two-texture approach right at all?** An alternative nobody has costed: keep one
   texture and put the teal in a **second UV channel or an alpha-packed mask**, so the glyph
   pixels can be recoloured in-shader from a single sample. That trades a sampler for
   complexity in `buildLabelTexture`.

4. **The faked extrusion** — Carl asked for the teal text to look *"extruded slightly"* and ruled
   out real geometry on cost. The current fake draws four passes into the canvas: drop shadow,
   dark offset lower-right, light lip upper-left (matching the key at `[-160, 120, 40]`), then
   the glyph. **It cannot respond to the travelling light** — the relief is baked at a fixed
   angle while the ring sweeps past. At ~12px glyphs that is likely invisible. **Is that
   acceptable, or does the relief need to come from a normal map so it lights correctly?**

---

## PART 5 — CONSTRAINTS THE ANSWER MUST RESPECT

- **The resting light is approved and committed.** Nothing in the answer should require
  reopening `7b056c2`.
- **The label lives in the face's albedo and must stay there.** Three DOM versions failed; the
  third had *provably identical* transforms and Carl still saw two objects, because DOM moves in
  2D CSS px while the card rises in 3D under a perspective camera.
- **Accessibility debt is already logged** — the visible text is a texture, not in the a11y tree.
  Mandatory to fix when these become real controls. An answer that makes the text *more* baked
  should note the cost.
- **Textures must be disposed.** Each card already carries one; this adds a second, so a corridor
  walk goes from 25 textures to 50.
- **There is an open, unrelated defect on this component:** the faces read as floating with black
  edges. Carl established it is a REGRESSION (*"the card in general was approved. If it had dark
  edges i would of flagged it"*). Measured: with the whole static rig at zero the face still
  reads 44 of 58, so ~77% is baked albedo plus an unscaled sheen lobe. **Not this question, but
  do not let an answer here make it worse.**

---

## PART 6 — HOW TO SEE IT

```
npm run dev
http://localhost:3000/start          press Begin, hover a card
node verify/hover-teal.mjs           the measurement above
```

⚠ **MEASURE HEADED, WITH `--enable-gpu`.** Headless Chromium substitutes SwiftShader and this
project has already been misled by that once — a whole "resolved" entry in `current-sprint.md`
cited numbers that never touched a GPU. Every harness in `verify/` prints the renderer and aborts
on a software rasteriser. Confirmed real here: `ANGLE (AMD Radeon(TM) Graphics, D3D11)`.

---

*The Builder's own view, offered as a starting point and not a conclusion: the most likely
culprit is that each card constructs its own `uniforms` ref but the material may be sharing a
compiled program across all five cards, so one card's uniform object wins and the others animate
into nothing. That would explain why the shader is present, no error is raised, and the pixels do
not move. It has not been tested.*
