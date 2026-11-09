# Build report — the hero text's glow, against the approved note v1.3 (9 November 2026)

**For:** the Architect, read-only review. Routed by Carl, who has seen it on the bench: *"It looks very good so far."*
That is recorded at the level given, not as an approval.
**From:** the Builder.
**The approved design:** `live-work/structural-note-hero-text-bloom-9-november.md` v1.3 (Carl: *"yes. v 1.3 approved."*).
**The record:** D-101, *"THE GLOW BUILT (9 November 2026)"*.
**State:** built, uncommitted, measured; AMENDED after the Architect's build review (section at the end). **Three departures from v1.3**, each forced by a fault seen or measured during the
build, are set out below for your review. Nothing else departs from v1.3.

## What was built, as approved

- **`components/showcase/hero-bloom.ts`** (NEW), `makeHeroBloom(renderer, scene, camera)`:
  - `pass(scene, camera, { samples: 4 })` with `mrt({ output, glow: vec4(0) })`.
  - `bloom(glowTexture, 0.45, 0.35, 0)`: strength, radius and threshold are TAKES.
  - A `RenderPipeline` with `outputColorTransform = false`; the graph applies the transform (composite below).
  - `render(camera)` swaps `scenePass.camera` each frame. `dispose()` frees the pipeline's quad, the pass's targets and
    the bloom's targets. `set(dials)`.
  - The graph is rebuilt if the renderer's tone mapping or colour space changes.
- **`bench-medium.ts`:** the `post?: { make }` slot, with the type imported type-only.
- **`bench-medium-webgpu.tsx`:** supplies `post: { make: makeHeroBloom }`.
- **`camera-bench.tsx` (`BenchScene`):**
  - Owns the instance: created in a `useMemo` on `[blank, medium, gl, scene, camera]` and disposed by
    `useDisposeOnUnmount`.
  - First person draws through it. In third person the eye draws through it and the PiP draws plain [R1].
  - A throw inside `render` switches it off for the session and the bench falls back to `gl.render`. GPU validation
    errors are not caught: they are not thrown.
  - Dev-only hooks: `__heroBloom` (the instance's dials) and `__heroBloomOff` (draw plain).
- **`hero-text-material.ts`:** the text writes its Fresnel edge into `glow`. Nothing else writes it [R5].

## The three departures

### 1. No precompile: against [B3] and [C2]

- **v1.3 said:** `HeroBloom.compile()` awaits `PassNode.compileAsync`, the bench draws plain until it resolves, and a stale
  instance is ignored.
- **Found:**
  - `Renderer.compileAsync` takes its render context synchronously, but **each shader is built later**, in the work-item
    loop (`getForRenderAsync`). That build reads the renderer's **live** render target and MRT, both in `NodeMaterial`'s
    setup and in the output it builds. That is why `PassNode.compileAsync` holds the renderer on its target and MRT
    across its `await`.
  - The bench keeps drawing during that `await`, and the arch's own compile wait also calls `compileAsync`.
- **Measured:**
  - `PassNode.compileAsync` as is blanked the canvas. On the WebGL 2 fallback: "Active draw buffers with missing fragment
    shader outputs" ×209. The plain frames drawn during the await went into the pass's target.
  - Setting the target and MRT, starting `Renderer.compileAsync`, and restoring at once gave builds with the wrong outputs.
    On real WebGPU: "Color target has no corresponding fragment stage output" (the grid's material), and
    `depthStencil.format` undefined (the grid and the lines).
- **Built:** no precompile. The glow draws from its first frame, and its pipelines are created synchronously then
  (three's default). This is the "small first-frame hitch, known" that v1.3 accepted for the quads, now including the
  scene pass. There is no promise, so the [C2] hazard cannot arise.
- **For review:** whether that hitch is acceptable on the bench, and what the home page should do. The page can compile
  before it shows anything, because it has no plain frames to keep drawing.

### 2. The glow mask attaches only inside an MRT draw: [A5] was live, not a future case

- **v1.3 said** ([A5]): a render target without the pass's MRT would draw the text as its glow only. *"Safe today
  (the PiP's plain gl.render goes to the canvas)."*
- **Found:** with tone mapping on, `needsFrameBufferTarget` is true (`Renderer.js:2446`). So **every plain draw** goes
  into the renderer's internal frame-buffer target, not the canvas. That target's texture is not named `output`, so the
  text's `mrtNode` mapped to nothing (`MRTNode.setup`, `getTextureIndex`). The text vanished from every plain frame: with
  the bloom off, in the PiP, and in the frames before the first glowing frame. Seen on both backends.
- **Built:** `GlowMaskedStandardMaterial extends MeshStandardNodeMaterial`. Its `setup(builder)` sets
  `this.mrtNode = builder.renderer.getMRT() !== null ? glowMRT : null` before `super.setup`.
  - The MRT is part of the render context, so each variant is built separately: the pass's variant gets the mask, and
    every other variant is a plain standard material.
  - `mrtNode` is read synchronously inside `setup` (`setupOutput`), so builds cannot interleave on it.
  - [A5]'s constraint no longer needs to be remembered by every future draw.
- **For review:** the subclass's reliance on `setup` being called per render-context variant, and on reading
  `getMRT()` synchronously there. Read in r185. Not asserted by anything in code.

### 3. The composite is built on three's own `renderOutput`: [B1] corrected

- **v1.3 said** ([B1]): `rgb = renderOutput(scene.rgb + bloom.rgb)` (alpha 1 into the transform);
  `alpha = max(scene.a, maxChannel(renderOutput(bloom.rgb)))`.
- **Found:** `renderOutput` un-premultiplies, tone-maps, encodes and premultiplies again, using the alpha it is given
  (`RenderOutputNode.js:108–138`). The renderer's plain output pass runs it on the stored premultiplied value with that
  value's real alpha. Passing alpha 1 skips that round trip.
- **Measured:**
  - [B1] verbatim failed the identity check on **every antialiased edge**, up to 92 levels.
  - The Builder's first attempt, a hand-rolled un-premultiply, failed on the grid lines.
  - Both failures were caught by the identity check, with a null control at 0.
- **Built:**
  - `a = scene.a`
  - `S = renderOutput(vec4(scene.rgb + bloom·a, a))`: three's own transform with the real alpha. The glow is added to
    the straight colour, so an opaque pixel reads `encode(c + bloom)`.
  - `G = renderOutput(vec4(bloom, 1)).rgb`: the glow as light on its own.
  - `rgb = S.rgb + G·(1 − a)`
  - `alpha = a + maxChannel(G)·(1 − a)`, clamped.
- **Properties:**
  - At strength 0 this is exactly the plain output pass.
  - Opaque pixels: `encode(c + bloom)`, alpha 1.
  - Over the empty canvas: `G`, with alpha its brightest channel, as [B1] intended.
  - Every channel ≤ alpha.
- **For review:** the formula, and the approximation where the glow overlaps semi-transparent pixels.

## Measurements

**The instrument:** a scratch script. It is not a `verify/` harness, on Carl's word, so its readings are **unproven**
(no recorded red run). It carries a null control and a negative control.
- Real WebGPU: installed Chrome, AMD RDNA 2, "drew on webgpu".
- The WebGL 2 fallback: Playwright's bundled Chromium, whose WebGPU device fails without `dxil.dll`.
- The bench's canvas: 1848 × 633 at device pixel ratio 1, page camera at Home.
- Tolerances as v1.3 set them: p99.9 ≤ 2 and none over 4.

| Check | WebGPU | WebGL 2 |
|---|---|---|
| **Null control:** off vs off (must pass) | 0 / 0, PASS | 0 / 0, PASS |
| **Identity:** strength 0 vs off | ⛔ **FAIL** against the tolerance set in advance: p99.9 0, but 110 channel values (66 pixels) over 4, max 47 | ⛔ **FAIL**: p99.9 0; 117 over 4, max 47 |
| **Negative control:** glow on vs off (must fail) | FAILS: p99.9 37 | FAILS: p99.9 37 |
| **Selection:** the logo's region, x 1000–1450, glow on vs off | max **3** levels (the far tail of the text's glow) | — |
| **Selection:** more than 200 px from the text | max 4, none over 4 | — |
| **The glow's reach** (mean lift) | ~9 levels at 10 px from the letters, 4.6 at 30 px, 2.7 at 60 px, 1.3 at 100 px, 0.7 at 150 px | — |
| **Halo over black and white** [B2] | 114,808 pixels, **0 failing**; channels agree within 1; colour never above alpha | 114,840, 0 failing |
| **Far canvas alpha** | 0 (transparent) | 0 |
| **Console errors** | 0 | 0 |
| **Cost (D-108):** GPU median per frame | 3.08 → **4.42 ms** (+1.3); CPU 1.3 → 2.5 ms (nearly doubled) | samples too few to read |
| **The first glowing frame (departure 1's hitch)** | ⛔ **one ~67 ms frame, then a ~500 ms stall** two frames later (500–534 ms, three runs); 16.7 ms after | — |

- ⛔ **The identity FAILED, and its cause is OPEN** (corrected after the Architect's review; v1.0 of this report called it
  "approximate", which was wrong).
  - All 66 pixels lie where the bench's guide lines (the blue camera path and the red horizon line) cross the grid:
    overlapping transparent layers.
  - **v1.3's approximation covers only the glow over semi-transparent pixels.** At strength 0 the bloom is zero and the
    composite is exactly the plain output pass, so the formula did not produce this residue.
  - It must come from the **scene pass itself**: the same overlapping transparent layers store a different value in the
    pass's 4× MSAA MRT target than in the renderer's own frame target. **Cause unknown.**
  - "Bench furniture" is true today, but the hero's later phases are made of overlapping transparent layers: the rain,
    the steam, the fireworks.
  - **Proposed as an open defect, for Carl to admit, and to bisect before any transparent phase is built:** with the lines
    hidden, with the grid hidden, and with the pass run without MRT.
  - **Whether to accept it for now is Carl's call.**
- **Not done:**
  - Selection was measured on the final picture, not on the `glow` attachment as [R4] asked. With the logo upright,
    and 600 px from the text, the picture check is valid. With the logo in the lean it would not be.
  - Phone cost is not measured.
  - StrictMode's remount was not separately probed. The dev bench mounted under StrictMode with no
    "Buffer used in submit while destroyed", but nothing asserted it.

## Questions for the Architect

1. Departure 1: is no-precompile acceptable on the bench, and what should the home page do?
2. Departure 2: is the per-variant `setup` override sound, or is there a sanctioned three route for a material-scoped MRT
   output that degrades on targets without an MRT?
3. Departure 3: the formula, and whether the overlap approximation needs stating anywhere beyond the code.
4. Should [R4]'s attachment-level selection check be built before the lean pose brings the logo under the glow?

## Amendments after the Architect's build review (9 November 2026)

*"Approve departures 2 and 3. Approve departure 1 for the bench, with the hitch measured. Before commit: fix the fallback
(point 2); restate the identity row as FAIL, with the cause open (point 1), for Carl to decide."*

1. **The identity row is FAIL**, its cause open, and proposed as an open defect. See *Measurements*.
2. **The fallback is fixed, and its limit is stated.**
   - `HeroBloom.render` takes the renderer's state before drawing: target, MRT, tone mapping, output colour space,
     `autoClear`, `xr.enabled`. On a throw it **puts the state back**, then rethrows, so the bench's plain fallback draws
     on a clean renderer.
   - ⚠ The restore path has not been exercised by a forced throw.
   - ⛔ **A BEHAVIOURAL BOUNDARY, NOT AN ENFORCED ONE:** the bench's catch sees JavaScript errors only.
     - A TSL node-build error does **not** throw in r185: `NodeManager` logs "TSL: …" and swaps in a default material.
     - GPU validation errors are asynchronous and never thrown.
     - Both show in the **console** only. v1.3's "[S] a node-build error is caught" was not true. It is stated so in
       `camera-bench.tsx`.
3. **The hitch is measured:** one ~67 ms frame, then ~500 ms (table above).
   - On the bench it falls once, at load (or on the first switch on).
   - **For the home page:** compile before anything shows. ⛔ **A STATED CONSTRAINT:** `PassNode.compileAsync` holds the
     renderer on its target and MRT across its `await`, so **nothing else may render or compile during it**, including
     any other compile wait. The same reliance on the renderer's live state underlies departure 2.
4. **The bound on the composite** is in `hero-bloom.ts`'s header: every channel ≤ alpha **provided the encoded values stay
   ≤ 1**. The bench's Neutral tone mapping guarantees that; NoToneMapping or an HDR output would break it. The overlap
   approximation is stated there as well.
5. **The camera is no longer a key** of the instance's `useMemo`. It is read when the instance is made, and
   `render(cam)` swaps it, so a remounted default camera does not rebuild the pipeline.
6. **Scope:** the bloom exists **only on `?blank=1`** (`blank &&` in `BenchScene`). The arch's bench has none.
7. **Checks:** `npx tsc --noEmit` clean. `npx eslint` on all eight changed files: 0 errors, 0 warnings. The repo-wide
   `npm run lint`: the accepted baseline error plus 2 warnings in `live-work/hero-concept-8-november/projector.mjs`
   (8 November, reported to Carl, not touched).
8. **[R4] before the lean:** the check on the glow attachment is to be built before the lean pose. The measured reach is
   0.7 levels at 150 px, and 3 levels in the logo's region about 600 px away. In the lean, the text's glow **will visibly
   light the logo**. That touches Carl's reason for the mask, and it is his judgement at the lean; radius is the dial.
9. **Cost:** +1.3 ms GPU and nearly double the CPU on a desktop RDNA 2. Phones are not measured. D-108 requires pricing
   against the audience's devices before the page adopts it. BloomNode's resolution scale is the lever.

## The identity residue — TRACKED DOWN (9 November 2026; Carl: *"We should always track down and fix problems."*)

**Bisected** on real WebGPU: the glow at 0 against plain, counting channel values over 4.

| Variant | Over 4 | Max |
|---|---|---|
| all shown | 110 | 47 |
| **lines hidden** | **0** | **0** |
| grid hidden | 117 | 47 |
| **the lines' alpha-to-coverage off** | **0** | **0** |
| the pass without MRT | 110 | 47 |

**Root cause, in three r185's source:**
- When the renderer draws into its internal frame-buffer target (tone mapping on), `currentSamples` returns 0
  (`Renderer.js:2476–2490`). The target itself is created with the renderer's 4 samples.
- So `Line2NodeMaterial` builds its hard-edged discard branch (`Line2NodeMaterial.js:338`).
- In the glow pass's own 4× target it reads 4, and builds the designed alpha-to-coverage edge.

**What this rules out:** the composite, the MRT, and transparency. The grid's overlapping transparent layers are exact.
**The glow pass draws the lines correctly; the plain path does not.** With the lines' alpha-to-coverage off, the
identity is exact everywhere.

**The fix is Carl's to choose.**

**Carl's choice (9 November 2026): option 1** — *"Fix with 1"*: the glow pass's picture is the correct one; three's plain-path quirk is recorded, not worked around. The standing identity check (`live-work/scripts/hero-bloom-measure-9-november.mjs`) runs with the lines' alpha-to-coverage off. **Re-run on real WebGPU: null 0/0; identity EXACT (max 0) — PASS; negative control FAILS; halo 0 failing of 114,806; no console errors.**
