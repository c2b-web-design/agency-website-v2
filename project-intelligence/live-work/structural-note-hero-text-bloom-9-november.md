# Structural note — the hero text's glow: a selective bloom on the bench (9 November 2026) — v1.3

**Carl's decision on [R5], 9 November 2026: (ii), a SEPARATE GLOW MASK** — see [R5].
**Status: v1.3, with the Architect's FOURTH review folded in (no further round): *"Approve v1.3 for Carl, with points
1–3 folded in. None of them changes the design."*** Marked **[C1]** (a stale sentence on the tone mapping, line 57),
**[C2]** (a stale compile never switches the frame), **[C3]** (how the camera reaches the pass). The Builder checked
`PassNode.js:799` and `bench-medium-webgpu.tsx:280–293`. **Nothing is built. Before the build: Carl's approval of v1.3.**
Open for the spike, as marked: MSAA with MRT on the WebGL 2 fallback; StrictMode's remount (the pipeline rebuilt or
kept); how much the transparent grid dims the glow; the cost, priced per D-108.
**v1.3** answers the Architect's THIRD review (of v1.2): *"Ready for Carl's approval once points 1–3 are amended."*
Marked **[B1]**, **[B2]**, **[B3]**:
- **[B1]** the alpha takes its extra from the BLOOM alone;
- **[B2]** the halo test runs over BLACK and WHITE;
- **[B3]** the warm-up belongs to the bloom, not to the arch's compile wait.
Plus housekeeping. The Builder checked that the compile wait is called inside `LetteringBody`
(`lettering-piece.tsx:310`) and gates the arch's reveal.
**v1.2** answered the SECOND review (of v1.1): *"v1.1 is ready for Carl's approval once 1–3 are fixed and 4–6 are added."*
It fixed three stale lines and added **[A4]**, **[A5]**, **[A6]**. Source claims checked in r185: `WebGPUBackend.js:349`
premultiplied; `NodeMaterial.js:566–578` the merge, and the material's MRT alone on a target without MRT;
`PassNode.compileAsync`, `PassNode.js:749`.
**v1.1** answered the FIRST review (of v1.0): *"Approve option A, after amendments 1–5."* Amendments 1–5 are marked
**[R1]** to **[R5]**: R1, R2, R3 and R5 have sections, and R4 is in verification 3. The smaller points are marked **[S]**.
⛔ **[R5] was a decision for Carl** that v1.0 made without saying so. He decided it: the mask.
**Author:** the Builder. **Record:** D-101, *"THE TEXT's MATERIAL (9 November 2026)"* and the entries after it.
**The review's source claims were checked by the Builder** in r185's `node_modules` before amending:
- `PassNode` and `BloomNode` have `updateBeforeType = FRAME` (PassNode.js:444, BloomNode.js:266).
- The pass is sized from `getDrawingBufferSize` (PassNode.js:801–805).
- The blur outputs `vec4(…, 1.0)` (BloomNode.js:541).
- `RenderPipeline.dispose()` frees only the quad's material (RenderPipeline.js:168–172).
- The canvas is `alpha: true` (`bench-medium-webgpu.tsx:71`), with its dark background in CSS (`camera-bench.tsx:1865`).

## The chunk

Carl: *"The text colour should be ice blue and it should have a slight glow/bloom. Not much, ever so subtle"* …
*"the bevels are where we want the magic to happen, We need to face to stay legible and readable."*

Take 1, the material, is built and on the bench: `hero-text-material.ts` (edge-lit acrylic, ice #CFE6FF, with a Fresnel
emissive on the bevels). Carl: *"Thats a great contrast with the dark background."* Take 2, this note, is the **glow**:
light bleeding softly off the bevels into the dark around each letter. That is a post-processing stage, which the bench
does not have today.

**Only what is marked glows.** The gold logo's highlights, the clay, the grid and the guide lines must not bloom.

## Why this is structural

1. **A new expensive resource.** A render pipeline brings an HDR scene target with a second attachment, plus the bloom's
   mip chain, all sized to the canvas.
2. **A change to who draws the frame.** Today the bench's one priority-1 render callback (`camera-bench.tsx`, note v1.3.3
   §2) calls `gl.render(scene, camera)`: once in first person, or twice in third person (the eye, then the shot camera in
   the PiP, by viewport and scissor), wrapped in the medium's `meter`. A pipeline replaces that call with its own
   `render()`.
3. **Renderer-specific code.** It is WebGPU (TSL nodes), so it has to go through the medium seam (renderer note v1.6), as
   the text's material does.
4. **It will be built twice if it is shaped wrong.** The home page's hero canvas will need the same glow.

## Option A — chosen, as amended

- **One scene pass writes two outputs (MRT):** the colour (`output`) and the glow's source.
  - **[R5]** The glow's source is the **GLOW MASK** (`glow`, default `vec4(0)`), written only by the text.
  - **[R3]** The pass is `pass(scene, cam, { samples: 4 })`.
- **`bloom(glowSource, strength, radius, threshold)`** (three's `tsl/display/BloomNode.js:572`) blurs only that source.
- **The composite is the scene plus the blurred glow, with the alpha rule [R2].** The graph ITSELF then applies the
  renderer's tone mapping (Neutral on the bench) and colour space once at its end (`renderOutput`). The pipeline's own
  `outputColorTransform` is set to `false` ([A4]), so it is applied once, not twice. (`RenderPipeline.js:121–151,
  206–212` is where three's automatic transform lives, now switched off.)
- **One camera [R1].** The pipeline serves ONE camera, the first-person view. That is also what the home page needs: one
  camera, no PiP.

### [R1] The PiP draws plain: this is the design, not a fallback

- `PassNode` and `BloomNode` run **once per frame**. The frame counter is advanced by the renderer's own loop
  (Renderer.js:825, Animation.js:77), not by each `render()` call.
- So a second `post.render(shot)` in the same frame would **not** draw the scene again.
- The pass's target is the whole drawing buffer, not the viewport, so the final quad would squeeze the eye's frame into
  the PiP.
- **Therefore:** in third person the eye draws through the pipeline, and **the PiP draws with plain `gl.render`, without
  the glow.**
- Blooming the PiP would need a second pipeline with its own targets. That is a second instance, and needs its own note.
  Not proposed.
- ⚠ **For Carl:** the PiP is the SHOT camera, the frame that becomes the page. **In third person it never shows the glow;
  only first person does.** Judge the glow in first person.

### [R2] The canvas is TRANSPARENT: the alpha rule

- The bench's dark is CSS behind a transparent canvas: there is no scene background.
- The blur writes alpha 1, so a naive `scene + bloom` would raise alpha across the whole canvas, not just near the bevels.
- **[A4] The rule (v1.2, corrected):**
  - **The canvas is PREMULTIPLIED** (`alpha: true` → `alphaMode 'premultiplied'`, `WebGPUBackend.js:349`). A pixel is valid
    only when every colour channel is ≤ its alpha.
  - v1.1's `alpha = luminance(bloom.rgb)` broke that for an ice glow: blue is the strongest channel and sits above the
    luminance. It was also computed BEFORE the tone mapping and the sRGB encoding, which raise the colour and leave alpha
    alone.
  - **So the alpha is computed AFTER the output transform.**
    - The pipeline's `outputColorTransform` is set to `false`.
    - The graph applies `renderOutput(scene.rgb + bloom.rgb, toneMapping, outputColorSpace)` itself.
    - **[B1] It then sets `alpha = max(scene.a, maxChannel(renderOutput(bloom.rgb)))`, clamped to 1: the extra alpha
      comes from the BLOOM ALONE.**
      - v1.2 took `max(r, g, b)` of the WHOLE encoded colour, which changed the scene's own semi-transparent pixels. The
        scene pass stores transparent materials premultiplied in linear, and the sRGB encoding raises their colour more
        than their alpha. So the grid's fade would have turned more opaque than today, even at strength 0.
      - **At strength 0 the bloom is zero, so the alpha is exactly `scene.a`: the identity holds by construction.**
      - Over the empty canvas (scene 0), the colour is the encoded bloom and the alpha is its brightest channel, so the
        pixel is valid.
      - Where the glow overlaps a semi-transparent grid line it is APPROXIMATE. The halo test (verification 2) checks it.
  - ⚠ With the transform in our hands, a change of the renderer's tone mapping or colour space must rebuild the graph.
    `RenderPipeline._update` does that only for its own transform. The bench's tone mapping is fixed (Neutral), but the
    rebuild is keyed on both all the same.
  - ⚠ The scene's own partly transparent pixels (antialiased edges, the grid's fade) pass through as the scene pass wrote
    them. The identity check (verification 1) covers them.
- **Tested at strength > 0** (verification 2, with the halo test). The identity check at strength 0 cannot see this.
- **The alternative, named and NOT chosen:** an opaque scene background matching the CSS (`#0a0a0a`). It removes the
  problem on the bench, but the page's canvas would still need its own answer. The post-transform rule serves both.
- ⚠ The home page's hero canvas will carry the same dependency if it is transparent too.

### [R3] Antialiasing

- `PassNode`'s target has no MSAA by default (PassNode.js:246). The renderer's `antialias: true` covers only its own
  framebuffer, so without samples the letters, grid and lines would draw jagged.
- **The pass takes `{ samples: 4 }`.**
- ⚠ MSAA together with MRT on the WebGL 2 fallback is UNVERIFIED (verification 4).

### [R5] ✔ DECIDED BY CARL (9 November 2026): A SEPARATE GLOW MASK

Carl: *"A separate glow mask  Having 2 glowing objects is a bit much. A second one may take the focus off the text."*

**So:**
- The glow's source is a **mask output of its own**, not `emissive`.
- The scene-wide MRT carries `glow` with a default of `vec4(0)`. A material glows only by writing it
  (`material.mrtNode = mrt({ glow: … })`); three's selective-bloom pattern sets a per-material `mrtNode` over the pass's
  defaults.
- **The text writes its Fresnel emissive into `glow`.** Nothing else writes it.
- **A red-hot logo can be hot (emissive) without glowing.**
- Verification 3 reads the `glow` attachment.

(The decision as it was put, kept as asked:)

### [R5] Emitting and glowing are coupled under A

- Under A, **anything with an emissive glows.** A red-hot logo will almost certainly need an emissive to look hot, so it
  would bloom automatically.
- **Whether the hot logo GLOWS is open in D-101, and Carl's.** The mechanism must not decide it for him.
- **Two ways, for Carl:**
  - **(i) Emissive = glow,** the default above (SUPERSEDED by Carl's choice of (ii)). Simplest. A hot logo glows.
  - **(ii) A separate bloom MASK:** a third MRT output that a material writes only if it is meant to glow, so a hot logo
    can be hot without glowing. Adds one output and one line per glowing material.
- For the text alone the two draw the same. **The choice only matters when the hot logo arrives**, and it can be made then.
  The module is shaped so (ii) slots in without restructuring: the glow's source is one node, named in one place.

## The seam's shape — who owns the instance [S]

- `WEBGPU_MEDIUM` is a **module-level constant**, so its slot can hold only a **factory**:
  `post?: { make(renderer, scene, camera) → HeroBloom }`.
- **The instance is owned by `BenchScene`.** It is created in a `useMemo` keyed on `[gl, scene, medium]`, and disposed
  through `useDisposeOnUnmount`: the 5 November StrictMode rule, a task late and cancelled on remount.
- **[C3] HOW THE CAMERA REACHES THE PASS.**
  - The pass is built with the camera `make` is given: the **SHOT camera** (R3F's default camera, the page's frame), so
    `compile()` runs against it.
  - `render(camera)` sets `scenePass.camera = camera` before drawing. `PassNode.updateBefore` reads `this.camera` each
    frame (`PassNode.js:799`), so a swap between frames works: the shot camera in first person, the eye in third.
  - One camera per frame, as [R1] requires.
- **[C2] A STALE COMPILE NEVER SWITCHES THE FRAME.** `BenchScene` acts on a resolved `compile()` ONLY IF that instance is
  still the current one: a ref holds the current `HeroBloom`, and the `.then` compares against it.
  - Under StrictMode the first instance is disposed a task late. Its promise may resolve after that, and it must never
    switch the render callback onto a disposed pipeline. That would be the 5 November *"Buffer used in submit while
    destroyed"* again.
  - It is the arch's compile-wait rule carried over: *"a CANCELLED flag, so a stale promise never calls done"*
    (`bench-medium-webgpu.tsx:280–293`).
- ⚠ **To confirm in the spike:** that the shared per-canvas `WebGPURenderer` (one renderer per canvas, `bench-medium-webgpu.tsx`)
  survives StrictMode's remount with the pipeline rebuilt or kept. Unverified.
- `HeroBloom = { render(camera), compile(): Promise, dispose(), set(dials) }`, in the new `hero-bloom.ts`, imported only by
  `bench-medium-webgpu.tsx`.
- **Question 1, answered by the review:** not folded into `meter`. `meter` measures; drawing inside it would mix the
  instrument with what it measures.

## What depends on the current structure (§5b), and how A keeps each

| Today's behaviour | Where it comes from | Under A |
|---|---|---|
| Both grids' fade and line thickness set per camera before each draw (`gridsFor`) | the render callback | Unchanged. `gridsFor(cam)` runs before `post.render(cam)`. |
| Third person: the eye fills the canvas, then the shot camera in the PiP (viewport + scissor) | the callback's two draws | **[R1]** The eye through the pipeline; the PiP by plain `gl.render`, no glow, by design. |
| The canvas is transparent; the dark is CSS **[R2]** | `alpha: true`, `bg-[#0a0a0a]` | The alpha rule above; tested at strength > 0. |
| Antialiased edges **[R3]** | the renderer's `antialias: true` (its framebuffer only) | The pass at `samples: 4`. |
| GPU timing for the cost instrument | `medium.meter` wraps the draw | Unchanged: `meter` wraps `post.render`. The bloom's cost shows in the same meter (D-108). |
| Tone mapping once per frame, Neutral | the WebGPU renderer | Applied BY THE GRAPH ITSELF at its end (`renderOutput`, the same operator; `outputColorTransform = false`, [A4]), and rebuilt if the renderer's tone mapping or colour space changes. Identity check below. |
| Nothing renderer-specific loads inside the canvas (v1.6 §4) | the seam's dynamic import | Kept. `hero-bloom.ts` is imported only by the WebGPU medium. |
| The WebGL medium | `WEBGL_MEDIUM` | Untouched. No `post` slot, so `gl.render` as today. |
| Disposal under StrictMode | `useDisposeOnUnmount` | **[S]** `HeroBloom.dispose()` disposes the pipeline AND the `PassNode`'s and `BloomNode`'s render targets. `RenderPipeline.dispose()` frees only its quad's material. |
| A failure must not black out the bench | (no post today) | **[S]** A throw inside `post.render` (a node-build error) is caught, logged once, and the slot is switched off for the session, falling back to `gl.render`. ⚠ **This does NOT catch GPU validation errors**, which arrive asynchronously and are never thrown (the 5 November black picture was 167 of them). Those are watched in the console during the spike. |
| The labels, written after the draw | the callback | Unchanged. |
| **[A5]** The text's colour survives every draw of the scene | today, every draw goes to the canvas | ⛔ **A CONSTRAINT FOR EVERY FUTURE DRAW.** On a render target WITHOUT the pass's MRT, a material's `mrtNode` becomes its ENTIRE output (`NodeMaterial.js:576–578`): the text would draw only its glow and lose its colour. Safe today (the PiP's plain `gl.render` goes to the canvas). Any future render-target draw of this scene (a capture, a reflection, a second pass) must carry the pass's MRT, or render the text without its `mrtNode`. Written in `hero-text-material.ts`'s header when built. |
| **[A6] → [B3]** The first frame compiles before it is shown | the arch's compile wait, called inside `LetteringBody` (`lettering-piece.tsx:310`, through `ArchMediumContext`); it gates the ARCH's reveal, not the frame | The pass's target is a different pipeline variant (two attachments, 4 samples), so the first glowing frame would compile every material again. ⛔ **[B3] NOT through the arch's compile wait** (v1.2): that would couple the lettering piece to the bench's post-processing. **`HeroBloom` gets its OWN `compile(): Promise`**, awaiting `PassNode.compileAsync(renderer)` (`PassNode.js:749`). **`BenchScene` awaits it, and the render callback draws with plain `gl.render` until it resolves**: the fallback path that already exists. `PassNode.compileAsync` compiles only the scene pass, so the bloom's blur and composite quads and the output quad still compile on the first glowing frame. **That small first-frame hitch is RECORDED AS KNOWN**, not warmed by a hidden draw (a hidden draw would be a second, invisible use of the pipeline to explain). **The first cost samples after the switch are thrown away.** |

## Verification, before Carl's eye

1. **Identity, at strength 0:** the same frame with the pipeline and without, compared pixel by pixel. **The tolerance is set
   now:** at most 2 levels per channel at the 99.9th percentile, and no pixel over 4. The arch already differs by ~1 level
   between the two media. The point is to catch a tone-mapping or colour-space slip, not to prove zero. **[S]**
2. **The alpha, at strength > 0 [R2] [A4]:**
   - A region far from any emitter stays fully transparent (alpha 0).
   - **[B2] The halo test, over BLACK and WHITE:** the same frame captured with the CSS background `#000000`, then
     `#ffffff`.
     - Over black, each pixel reads its colour **C** directly.
     - White minus black gives **(1 − α)** per channel.
     - **Pass:** the three channels give the SAME α (within verification 1's tolerance), and **C ≤ α**.
     - An invalid pixel (colour above alpha) clips over white, so its channels disagree. That is the failure this test can
       see.
     - v1.2's grey test could not fail: α worked out from the same two captures makes "differ by (1 − α)" true by definition.
       Black and white also give the largest signal.
3. **Selection, on the glow's source itself [R4]:** read the `glow` attachment and check it is 0 everywhere outside the
   text's pixels.
   - That covers the logo, the grid's `MeshBasicNodeMaterial` and the lines' `Line2NodeMaterial`.
   - ⚠ Not on the final picture near the logo: the lean puts the text's glow over the logo's pixels on purpose, so a crop
     there cannot read 0.
   - The final-picture crops are kept for regions away from any emitter.
   - ⚠ **Watch for:** the transparent grid's blending dimming the glow source behind its lines. Minor and unverified
     **[S]**; this check shows it.
4. **On the WebGL 2 fallback:** `WebGPURenderer`'s fallback backend (headless captures run on it) draws the same pipeline.
   ⚠ MRT with MSAA there is UNVERIFIED **[R3]**.
5. **Cost:** the meter's GPU time with and without, at Carl's 1909 × 934, priced per D-108.

## The Architect's questions, closed

1. The seam's shape: a factory in an optional `post?` slot, not inside `meter`.
2. The PiP: plain, by design **[R1]**.
3. The page's needs or the bench's first: **one camera**, which serves both **[R1]**.

## Files

- `components/showcase/hero-bloom.ts`: NEW.
- `components/showcase/bench-medium.ts`: the `post?` slot (open).
- `components/showcase/bench-medium-webgpu.tsx`: supplies the factory (open).
- `components/showcase/camera-bench.tsx`: `BenchScene` owns the instance, and the callback calls it (open).
