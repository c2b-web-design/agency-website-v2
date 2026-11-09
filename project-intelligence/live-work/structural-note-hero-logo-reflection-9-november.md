# Structural note — what the hero's logo reflects: the studio, and the glowing text (9 November 2026) — v1.3

**Status:** PROPOSED, for Carl, then the Architect (CLAUDE.md §5a). Nothing is built.
**v1.3:** ⛔ v1.2's TWO CAPTURES WITHDRAWN — Carl: *"There is not 2 red logos. It is one that goes from solid to liquid and back to solid."* See *One red body* at the end.
**v1.2:** Carl's two walls added (section *The liquid's space*): the logo is the LEFT wall, the viewport's edge the RIGHT. That changes what the BLOBS' reflection must contain.
**Author:** the Builder. **Record:** D-101, *"THE LOGO's COLOUR (9 November 2026)"* and after.
**v1.1:** rewritten after the Builder's homework, done before sending, on Carl's instruction:
- Carl's reference image (`Hero Section\1 Red Liquid Blobs.png`).
- The filmed reference (`00 References\marchingcubes-wallx-8-november.mp4`, a contact sheet every 5 s).
- The example's live source (`threejs.org/examples/webgl_marchingcubes.html`).
- Our own site's metal standard in code (`components/about/logo-mark-material.ts`).

**v1.0's cube camera is REPLACED** by the mechanism the desk mark already uses.

## The chunk, in Carl's words

- *"Where the logo is now is at the end of its first phase. The start of the first phase is it leaning. The colour
  should be the same. It should be a solidified version of the liquid reds blobs."*
- *"yes, we need a reflection. It would be more realistic if we could show the glowing text in it. Not so much in the
  solid state but definately in the liquid state."*

## What the reference actually is (the homework)

From the example's source, confirmed in the film and Carl's still:

1. **The material:** `MeshStandardMaterial({ color: 0x9c0000, roughness: 0.1, metalness: 1.0, envMap })`, the `shiny`
   preset.
2. **The environment is a static PHOTO cube map,** `textures/cube/SwedishRoyalCastle/`: a castle interior. **The red
   bands in the blobs are that room, not the scene.** Nothing in the example reflects the other blobs, the floor or
   anything else. Showing the glowing text in the reflection goes **beyond** the reference. It is Carl's addition.
3. **The bright red-orange hotspots are a POINT LIGHT:** `PointLight(0xff7c00, 3, 0, 0)` (orange, no falloff) at
   (0, 0, 100), just in front of the blobs. Seen through red metal, the orange reads red to red-orange.
   - There is also a white `DirectionalLight` (3) and an `AmbientLight(0x323232, 3)`.
   - The small yellow-white points are the directional light's highlight.
4. **The bronze rim** on every blob's silhouette is metal's Fresnel: at a grazing angle even `#9c0000` reflects close to
   white, so the castle shows warm at the edges. It is what outlines the blobs against the black.
5. **The floor and the wall are part of the LIQUID.** `addPlaneY` and `addPlaneX` add planes to the same metaball field,
   so the floor and the wall are sheets of the same red metal, and the blobs fold into them.
6. **The background is `0x050505`, with NO tone mapping** (WebGL's default). Our bench tone-maps with Neutral, so the same
   `#9c0000` will render differently. It is judged on the bench, not copied by number.

## What our own metal standard is (the homework)

**The desk mark is not lit by a photo.**
- `buildLogoStudioEnv` (`logo-mark-material.ts:202–224`) builds a **small scene of lit panels**: `LOGO_JUDGING_STUDIO`,
  five "formers" (two tall warm side boxes, a top box, a dim front fill, and an orange-amber `#ffb060` bounce from below)
  on a near-black `#0d0b09`.
- It then turns that scene into a prefiltered reflection with **`PMREMGenerator.fromScene(studio, 0, 0.1, 1000,
  { size: 256 })`**.
- The mark is lit by that **environment only**: direct lights are zeroed (`environmentOnly`). That is "studio
  reflection, not paint under lamps."

## The mechanism this suggests: no new one

**r185's `PMREMGenerator.fromScene(scene, sigma, near, far, { size, position, renderTarget })`** renders a cube of
`scene` **from `position`** and prefilters it, in one call.
- It can **reuse** its render target on a recapture (`PMREMGenerator.js:137–161`).
- It is the desk mark's own call, and the bench's WebGPU half already imports `PMREMGenerator` from `three/webgpu`.
- So the logo's reflection is one `fromScene` call **at the logo's centre**, of a **reflection scene**, not a separate
  `CubeCamera` and prefilter (v1.0).

**The reflection scene** holds two things:
1. **The judging studio's formers**, scaled to the 2 m logo: the metal standard, as on the desk mark.
2. **The text**, as second `Mesh` objects sharing the text's own geometry and material (no copied buffers). The text
   cannot be placed in two scenes, but its geometry and material can.

**The logo and the blobs are not in it,** so they cannot reflect their own inside, and no hiding is needed.

## How it answers Carl's two asks

- **The text in the reflection.** The capture draws the text with its acrylic and Fresnel edge. It draws without the
  renderer's MRT, so `GlowMaskedStandardMaterial` keeps the text's colour (the bloom note's [A5], already safe). **The
  text's bloom halo is not reflected:** it is a screen effect added after. That keeps Carl's one-glowing-object rule;
  the logo carries the text's light, not a second glow.
- ⚠ **Expectation, stated now:** at a 256 px capture, with the text 1–3 m from the logo, the text in the reflection reads
  as **bright edge-lit shapes**, not legible words. That is realistic for a curved mirror at that distance. A 512 capture
  sharpens it (four times the pixels). It appears only on surfaces **turned toward the text**:
  - the blobs' left flanks,
  - the logo's left edges and bevels (in the lean, the edge toward the t),
  - not the flat face, which faces the camera and reflects what is in front of it.
- **"Not so much solid, definitely liquid" is ROUGHNESS, not a switch.** The prefiltered reflection is read sharper at low
  roughness and blurred at high.
  - The liquid at ~0.05 to 0.1 (the example's 0.1).
  - The set metal at ~0.2 to 0.3. Takes, by eye.
  - One material, one dial, animated across the phase change.
  - The blobs' curvature adds to it: part of their surface always faces the text.

## The reference's HOTSPOTS, within the metal standard (for the material take)

- The reference's red-orange hotspots come from a coloured point light. Our metal standard lights the logo by its studio
  only.
- **Both can be had:** a small, bright **orange former** in the reflection scene (where the example's point light sits,
  in front of the logo) puts the same hotspot in the reflection, without a direct light. Highlights then come from the
  studio, as on the desk mark.
- The judging studio already carries an amber bounce (`#ffb060`). Whether the hot phase wants more is a take on the
  bench, by eye.

## Why this is structural (still)

- **A second environment resource:** a cube capture and a prefilter at the logo, held for the life of the phase.
  - The arch's studio PMREM is still built, invisibly, on `?blank=1` (`bench-medium-webgpu.tsx:259–279`).
  - The desk mark's studio is a separate one on `/about`. This one is the hero's.
- **A new draw of the scene's text into a render target.** It is safe because of the bloom's [A5] fix. It must not run
  inside the bloom pass's update, or while that pass holds the renderer's state.
- **When it is captured:** once when the scene is ready, again only when something in the reflection scene changes.
  - The text is still during the phases. The camera does not matter to it.
  - **The rain (phase 2) will be in the reflection scene** if it is to be seen in the metal. That would be a capture
    every frame, a real cost (D-108), to be priced when the rain is built. Not decided here.

## Options weighed

- **A — `fromScene` at the logo: the judging studio plus the text (RECOMMENDED).** The desk mark's mechanism, the metal
  standard's studio, and the text Carl asked for.
- **A′ — the same, with the studio HDRI** (`monochrome_studio_02_1k.hdr`, the buttons' and the arch's) as the
  background, in place of the formers. Not the logo's standard: the desk mark uses the formers. Kept as a take if the
  formers read thin at 2 m.
- **B — screen-space reflections (`tsl/display/SSRNode.js`). Rejected:** the logo's face points at the camera, so most
  reflected rays leave the screen. It costs a full-screen pass every frame, and needs depth and normals in the bloom pass.
- **C — the studio only, without the text. Rejected:** it does not do what Carl asked. It is the reference's own level.
- **D — the text baked into the studio as a picture. Rejected:** static. It would not cool, light or move with the story
  (ethos §14a).

## Not decided here (the material take)

- Whether the logo's metal stays `MeshStandardMaterial` or becomes a node material.
- The roughness values, and how the phase change animates them.
- The capture size (256 or 512).
- The hotspot former.
- How Neutral tone mapping treats `#9c0000` against the reference's untone-mapped look.

## Questions for the Architect

1. A, the desk mark's `fromScene` mechanism at the logo with a reflection scene of the formers plus the text: sound?
   Is r185's WebGPU `PMREMGenerator.fromScene` with `position` and a reused `renderTarget` verified? (Read in source,
   not run.)
2. The text as second meshes sharing its geometry and material in another scene: any r185 cache or ownership hazard,
   given the text material's per-variant `setup` override?
3. The invisible arch's studio PMREM on `?blank=1`: leave it, or stop the blank canvas building an environment it never
   shows?
4. Should marching cubes under `WebGPURenderer` be proven first (unproven, D-101), since the liquid is where Carl wants
   the text seen most?

## Files A would need

- `components/showcase/hero-logo.tsx`: the material and the capture's owner. Open.
- Possibly `components/showcase/hero-reflection.ts`: the reflection scene and the capture. NEW.
- `components/about/logo-mark-material.ts`: **read only.** `LOGO_JUDGING_STUDIO` imported, not changed.

## The liquid's space — two walls (v1.2; Carl, 9 November 2026)

Carl: *"The logo is a "wall" on the left side and the scroll bar or very edge of the viewport is the wall on the right.
The blobs bounce between the rwo."*
- The blobs emerge out of the logo and bounce off it, as the example's blobs do from `wallx`.
- The right wall is unseen, just past the viewport's edge (recorded 8 November).

**What that changes here:** the blobs and the logo no longer want the same reflection.
- **The blobs' reflection must INCLUDE the logo.** It stands between them and the text, so it occludes the text where it
  covers it. It is also red metal, so the blobs show it, as the example's blobs show the wall they merge into.
- A blob reflecting the text **through** the logo would be wrong. v1.1's single scene excluded the logo, which is right
  for the logo's own reflection and wrong for the blobs'.
- **The logo's own reflection** still excludes the logo (no self-reflection), and also the blobs. They move, so including
  them would mean a capture every frame, which is to be priced with the liquid, not assumed.

**So, during the liquid phase, TWO captures**, both by the same `fromScene` mechanism, both static while the text and the
logo stand still, so each is captured once per phase:
1. **The logo's:** at the logo's centre. The studio formers and the text.
2. **The blobs':** at the centre of the blobs' space (between the two walls). The studio formers, the text, AND the logo.
   It is shared by every blob. Its single point of view displaces the text a little in blobs far from it, which reads as
   nothing on a liquid.

That is a third environment resource on the blank canvas in the liquid phase (counting the arch's invisible one), at
12 draws plus two prefilters per phase. **Priced when built (D-108).**

**For the Architect:**
- 5. Two captures (logo's, blobs') against one shared capture, and whether "captured once per phase" holds while the
  logo melts (does its shape change during the liquid phase?).
- 6. The example's wall is a plane IN the metaball field: one surface, so the blobs merge into it. Our logo is a separate
  mesh. How blobs emerge out of it is the liquid build's question. It is noted here because the answer may put the logo
  in the field, and then the blobs' capture would see it as part of themselves.

## One red body — v1.3 (Carl, 9 November 2026)

Carl: *"if on the leaning logo the blobs come out almost at once the logo effectively has become the blobs. The end state
is the solid logo where it is now. There is not 2 red logos. It is one that goes from solid to liquid and back to solid.
Is any new mass created?"*

- **v1.2's premise was wrong.** It had the solid logo standing as a wall while the blobs bounced beside it. The solid and
  the liquid never coexist: the logo becomes the blobs, and the blobs become the logo.
- **So ONE capture serves the red body in whichever state it is in.**
  - It is taken at the body's centre: the lean; the landing; the middle of the blobs' space between the two walls; the
    re-formed logo.
  - Its scene is the studio formers and the text. The body is never in its own capture.
  - It is retaken when the body's centre moves to a new place, not every frame.
  - This also removes v1.2's question 5.
- **The left wall** in the liquid phase is where the logo was. Whether it is an unseen boundary there (as the right one is)
  is Carl's, and asked.
- **No new mass.** The 2 m logo measures **70,085 cm³ (~70 L)** (signed volume of the bench's mesh; 7.6 cm thick). That
  volume, as one ball, is Ø 51 cm; as 10 equal blobs, Ø ~24 cm each.
  - For the liquid build, the metaballs' total should match it, or Carl's call on reading larger.
  - It does not change the reflection: one body, one capture.
