# Structural note — what the hero's logo reflects: the family's studio, and the glowing text (9 November 2026) — v1.7

**Status:** PROPOSED. **The Architect's third round (review 9) has NO BLOCKING FINDINGS**: R8-2 and R7-4 are WITHDRAWN on
the source reading below; review 9's two additions are adopted here, marked **[R9-n]**. For Carl's approval. Nothing is
built.
⚠ **Its file references will move:** Carl's WORKSHOP direction (the bench a tool, the hero an idea brought to it, the arch
removed; `structural-note-bench-arch-removed-9-november.md`) changes where `HeroStage` and the frame live. This note's
mechanism is unaffected; its *Files* and *Ownership* follow that note once it is settled.
**Authority:** Carl read v1.3 and said *"apply the metal and reflection"*. At session 1's close he redirected the background
to the button's studio. In session 2 he routed it: *"lets consult the architect."*
**History:** v1.5 answered review 7 (`review-7-…`, nine findings). **v1.6 answers review 8**
(`review-8-structural-note-hero-logo-reflection-9-november.md`, five findings and the answers to Q2, Q7, Q10, Q12). Changes
from v1.5 are marked **[R8-n]**; those from v1.4, **[R7-n]**. ⚠ **[R8-2] is DISPUTED with source, not adopted.** See *When
the capture runs*. This body is the whole current proposal. v1.0 to v1.5 are kept verbatim in the appendix, as history
only.
**Record:** D-101, from *"THE LOGO's COLOUR (9 November 2026)"*.

## The ask, in Carl's words

- *"yes, we need a reflection. It would be more realistic if we could show the glowing text in it. Not so much in the
  solid state but definately in the liquid state."*
- *"There is not 2 red logos. It is one that goes from solid to liquid and back to solid."*
- At session 1's close: the capture's background is the button's studio (the family HDRI), not the desk mark's formers.

## The proposal

**One `PMREMGenerator.fromScene` capture at the red body's centre, of a REFLECTION SCENE, used as the logo's `envMap`.**
- It is retaken when the body's centre moves (the upright, the lean, the landing, the blobs' space, the re-formed logo).
- It is not retaken per frame.
- The body is never in its own capture.

r185's `fromScene(scene, sigma, near, far, { size, position, renderTarget })` renders a cube of `scene` from `position`
and prefilters it in one call. It reuses `renderTarget` on a recapture (`PMREMGenerator.js:137–175`, WebGPU; WebGL's
`extras/PMREMGenerator.js:109` has the same signature).

### The reflection scene

1. **Background: the family HDRI.** It is the SAME texture the logo wears in step 1: `loadStudioHdri(STUDIO_HDRI_SRC, 0.1)`
   (`lib/studio-hdri.ts`, one fetch per page), as `scene.background` at `backgroundIntensity` 1.
   - A texture background passes through `_sceneToCubeUV` untouched (`PMREMGenerator.js:489–500`).
   - It is drawn in each face as the background sphere (`Background.js:83–147`).
   - Equirect is accepted (`NodeManager.js:666`).
2. **The text:** second `Mesh` objects sharing the text's geometries and material. No copied buffers.
   - The Architect's answer to Q2: no cache hazard. Render objects are keyed by object, material, render context and lights
     (`RenderObjects.js:96–99`).
3. **The text's lights:** second copies of `HeroSketchLight`'s hemisphere (1.2) and directional (1.6), built from ONE
   constant lifted out of its JSX in `hero-page.tsx`.
4. **[R7-5] Built in the SAME FRAME as the page.**
   - The reflection scene holds ONE root, whose matrix is copied at capture time from the logo's own parent
     (`mesh.parent.matrixWorld`).
   - **[R9-1] The root's `matrixAutoUpdate` is FALSE, and the copy goes into `root.matrix`.** `render()` calls
     `scene.updateMatrixWorld()` (`Renderer.js:939`), which would otherwise rebuild the root's matrix from its identity
     position, rotation and scale, putting the text and lights 4.29 m too high against the capture point. The null control
     cannot see that (no text); measurement 2 would.
   - The lights and the text sit inside it at their page transforms. The directional target stays unparented, at the
     origin.
   - The Architect's answer to Q7: sound.
   - **It reproduces the page's lighting EXACTLY, including the tilt measured below.** If Carl changes the page's lights,
     the reflection follows without a second edit.
5. **Not in it:** the logo, the blobs, the floor grid, the guides, the desk mark's formers, the hotspot former (the light
   chunk's) **[R7-9]**.

### The capture's parameters

- **[R7-1] `near` 1 cm, `far` 10,000 cm.** The defaults (0.1, 100) clip everything beyond 1 m in this centimetre world.
- **`size` 256:** the same as step 1's prefilter. 512 stays a take.
- **`position`:** the logo's world bounding-box centre in its current pose. The Architect confirmed it in the lean.
- **`sigma` 0.**

### The turn

- **The capture is made in WORLD orientation.** The 150° goes on `scene.backgroundRotation`, and the logo's
  `envMapRotation` returns to 0. Otherwise the text would turn with the studio.
- **[R7-6] The signs agree, read in source:** both rotations are `makeRotationFromEuler(e).transpose()` on the lookup
  direction (`SceneProperties.js:37` with `Background.js:93`; `MaterialProperties.js:47` with `PMREMNode.js:347`), with
  the same Y flip (`PMREMNode.js:346`). The null control still runs.

### When the capture runs — [R8-2] DISPUTED, with source

**Review 8's facts are right:**
- the arch's compile-wait effect re-runs on its deps (`lettering-piece.tsx:311`);
- `onReady` fires once (`:314–320`).

**The Builder's reading is that the overlap it guards against cannot happen in either direction, because the two never
interleave:**

- **`fromScene` is SYNCHRONOUS from end to end.** There is no `await` in it or in `render()`: the WebGPU `PMREMGenerator`'s
  only `async` methods are the deprecated `*Async` wrappers (`:196`, `:240`, `:284`). It sets the cube target, draws the
  six faces, prefilters, and restores the target, face and mip level (`_cleanup`) without yielding. JavaScript cannot run
  a compile work item in the middle of it.
- **`Renderer.compileAsync` holds NO renderer state across its awaits.**
  - It saves the render context and object functions, projects the scene, and RESTORES all of it (`Renderer.js:1025`,
    *"restore render tree"*) **before** its first await (`:1044`, `getForRenderAsync`).
  - Each work item carries the render context it was queued with (`item.renderContext`).
  - Its later builds read the LIVE MRT (the bloom's finding). They can only run between tasks, when the capture has
    already restored everything.
- **The hazard `hero-bloom.ts:46–52` records is `PassNode.compileAsync`,** which DOES hold the target and MRT across its
  await. The bloom does NOT use it (removed in that build). Nothing on the bench calls it.

**So v1.6 drops v1.5's `onReady` gate** and the prop it would have threaded (`setDrawn`, `camera-bench.tsx:1971`, through
`BenchScene`). **In its place is a bench-asserted guard:**
- On entry, the capture asserts `renderer.getRenderTarget() === null` and `renderer.getMRT() === null`: nobody holds the
  renderer.
- If either fails, it skips, defers to the next task, and counts the skip in `__benchCost` (published, per
  `reference_a_guard_that_hides_its_own_skips`).
- **[R9-2] Bounded:** it retries on the next frame, at most 10 times, then GIVES UP. The give-ups are published as a
  separate count from the skips, so a renderer held for good cannot retry forever unseen.
- **The Architect (review 9): the reading holds** (`Renderer.js:1362–1372` not async; `:1025–1032` restored before `:1044`;
  each build carries its own context, `:1039`). The guard is a safety net, not a fix.
- That catches the one real hazard, a state-holding compile, whoever adds it later.

⚠ **This is a reading of source, not a run.** The skip count is how a run will show it. If the Architect knows a path where
r185 yields inside `render()` (for instance a pipeline created asynchronously on first draw), the onReady gate and Q3 come
back.

- **Between frames** still holds: an effect or a task, never inside `useFrame` or the bloom pass. There `getMRT()` is null,
  so the text's material builds without its glow mask (`hero-text-material.ts:46–50`) and keeps its colour.
- ⚠ The first capture compiles the text's variant for the cube target: a one-time stall, measured.

### The seam

- **[R7-7]** `PmremLike` (`bench-medium.ts:91`) gains `fromScene(scene, sigma, near, far, options)`. Both media's
  generators have it.
- **[R8-5] The explicit switch: the reflection runs only where the medium supplies `heroText`.**
  - Only the WebGPU medium does (`bench-medium-webgpu.tsx:323`; `bench-medium.ts:80` makes it optional).
  - The stage passes the text's build to `HeroLogo` as a `reflect` prop only when `medium.heroText` exists.
  - Without `reflect`, `HeroLogo` keeps step 1 (`fromEquirectangular`, `envMapRotation` 150°). So the WebGL medium (clay
    text) is unchanged. The Architect agreed (Q11).

### The ownership

- **RECOMMENDED — build the text ONCE above both and pass it down** (the Architect: the better design, Q10).
  - `hero-text.tsx` exports `useHeroTextBuild(material)`: today's `useMemo` and `useDisposeOnUnmount`, moved verbatim.
  - **[R8-1] `HeroStage` lives in `camera-bench.tsx`, not `hero-page.tsx`.** In `hero-page.tsx` it would make an import
    cycle: `hero-page` → `hero-logo` → `hero-page`, with `hero-logo` reading `HERO_CAMERA` and `HERO_TEXT_PLACE` at load
    (`hero-logo.tsx:42–51, 71`) before they exist. `camera-bench.tsx` already imports all three (`:35–38`), so the move
    needs no new import.
  - The stage replaces the blank canvas's group. It calls the hook and mounts the lights, `HeroText` (which renders the
    build it is given) and `HeroLogo` (given the same build as `reflect`).
- **Considered — `onBuilt`:** a child-to-parent callback, an extra render of the whole bench.
- **Rejected — by name** (`getObjectByName`): a string coupling nothing asserts.
- **Rejected — a module-level store:** a second source of truth.

**§5b — what the current group provides, and how each is kept:**

| What the current group provides | Kept by |
|---|---|
| Mounted only when `blank && world` | `HeroStage` mounted under the same condition |
| Its offset `[0, world.floor, world.z1]` | the stage's own group, given `world` |
| The lights inside the offset (their direction depends on it) | the lights stay inside it; the capture copies the parent's matrix (R7-5) |
| The text's material from `medium.heroText?.material` | passed to the stage, then to the hook |
| The logo's PMREM from `medium.pmrem` | passed through |
| The logo's pose (`"upright"` today) | passed through, unchanged |
| The text's build disposed a task late on a real unmount | the same hook, inside the stage |
| **[R8-1] The import graph:** `hero-page.tsx` imports only React; `hero-text` and `hero-logo` import it | unchanged: the stage is in `camera-bench.tsx`, and `hero-page.tsx` gains only the lights' constant (no import) |
| **[R8-2] The ready signal:** not threaded (the guard replaces the gate) | nothing new crosses `BenchScene` |
| By accident of position: nothing found | grepped 9 November, session 2 (`components/showcase/`, `app/proto/`, `live-work/scripts/`, `verify/`): the names `"hero text"` and `"hero logo"` are read by nothing; the bench's two `traverse` calls (`camera-bench.tsx:1171, 1181`) walk the camera helpers' own root |

## Measured on the page today (the Architect's Q7 aside) — FOR CARL, not changed here

Logged from the running bench (`window.__benchScene`, WebGPU, `?blank=1`; 9 November, session 2):
- **The group's offset:** `[0, −429.05, 16]` (`world.floor` −429.05, `world.z1` 16).
- **The hemisphere light:** world position (0, −428.05, 16). Its sky direction, `normalize(position)`
  (`HemisphereLightNode.js:44`), is **(0, −0.9993, 0.0374): straight DOWN.**
  - So **the white sky (`#ffffff`) lights the text's downward faces, and the dark ground (`#30302c`) its upward faces.**
    The two are swapped.
- **The directional light:** world position (−600, 470.9, 1416), aimed at the origin. Its direction to the light is
  (−0.373, 0.293, 0.880). Built at the group's origin, it would have been (−0.339, 0.509, 0.791). It comes from 17° above
  the horizon, against the 31° as written: about 14° lower.
- **The approved acrylic and its glow** (*"a great contrast"*, *"The glow looks great"*) were judged UNDER this lighting.
  Whether it is corrected, and when, is Carl's call. **This note changes nothing about it.** The reflection copies the page
  as it is (R7-5), and would follow a correction automatically.

## What to expect — said before anyone looks

- **[R7-2] In the UPRIGHT (mounted today) the reflection shows almost nothing:** the capture point is inside the text's
  depth, and every line is seen edge-on. **So the reflection is judged in the LEAN.** That brings *"then the lean"*
  forward: Carl's call.
- **[R7-3] The text may read as glowing SLABS:** the edge glow `(1 − N·V)^2.5` is worked out from the capture point, where
  the letter faces are grazing (estimated 30–75 %, not measured). That is the material behaving as built. The capture image
  is shown first (measurement 2).
- **[R7-8] Placement error:** a cube capture treats everything as infinitely far away, so the reflected text lands
  displaced. More on the solid's flat faces, less on the liquid's curves.
- At 256 px, shapes, not words. Roughness is the dial: the liquid ~0.05 to 0.1, the solid ~0.2 to 0.4. Takes.

## Measurement plan — tolerances set BEFORE the first run

1. **The null control.** The capture WITHOUT the text against step 1's logo (`fromEquirectangular`, `envMapRotation` 150°):
   same pose, camera and frame, 8-bit, at Carl's density.
   - **Pass:** over the logo's pixels, mean |Δ| ≤ 1.0 level per channel, and the 99.5th percentile ≤ 6 levels (the
     Architect: plausible, unmeasured, accepted).
   - **[R8-3] Its negative control:** the same comparison with the background at **−150°** (the sign flip it exists to
     catch) must give **mean |Δ| ≥ 5.0 levels**, an absolute margin. If it does not, the tolerance cannot see the fault,
     and the null control is not evidence.
   - If the null control fails, nothing else is judged; the cause is tracked down.
2. **The capture itself, looked at [R7-3].** Its cube-UV target written to an image: what the logo "sees". Checked for the
   text being present, unclipped, and lit like the page.
3. **The positive control [R7-1].** With the text in, at least 0.5 % of the logo's pixels change by more than 4 levels.
4. **[R8-4] The negative control, named.**
   - The surface is **the FRONT face**: the mesh's +Z side, facing world +X in the lean, the camera in the upright.
   - Its pixels are masked by their normals, and the mask is eroded 4 px from the face's silhouette, where the
     roughness-0.4 blur legitimately reaches.
   - **Pass: no masked pixel changes by more than 4 levels** (the positive control's threshold).
   - The BACK face (toward the text, resting on the t in the lean) is EXPECTED to change, and is not tested here.
5. **The cost (D-108):** one capture's time, and the first capture's compile stall.
6. **The guard's skip and give-up counts** ([R8-2], [R9-2]): published, separately. Zero expected for both.
7. **The glow's identity check** (`live-work/scripts/hero-bloom-measure-9-november.mjs`) still passes.

## Files

| File | Change | Scope |
|---|---|---|
| `components/showcase/hero-logo.tsx` | the capture when given `reflect` (guard, skip count); `envMapRotation` 0 then; step 1 otherwise | open |
| `components/showcase/hero-text.tsx` | `useHeroTextBuild` exported; `HeroText` renders a given build | open |
| `components/showcase/hero-page.tsx` | `HeroSketchLight`'s values as one exported constant (no new import) | open |
| `components/showcase/camera-bench.tsx` | **[R8-1]** `HeroStage`, replacing the group; `reflect` only with `medium.heroText` | open |
| `components/showcase/bench-medium.ts` | `PmremLike.fromScene` **[R7-7]** | open |
| `components/showcase/bench-medium-webgpu.tsx` | none expected | open |
| `lib/studio-hdri.ts` | read only | — |
| a NEW `hero-reflection.ts` | only if `hero-logo.tsx` grows too long: **Carl widens the scope first** | not open |

## Not decided here

- Whether the logo's metal becomes a node material.
- Roughness values, and the phase-change animation.
- 256 or 512.
- The hot phase's hotspot (the light chunk).
- The rain in the reflection (phase 2): a capture per frame, to be priced then (D-108).

## Questions for the Architect, round 3

- **R8-2 disputed:** is the reading above right?
  - `fromScene` has no yield.
  - `compileAsync` restores the renderer's state before its first await (`Renderer.js:1025` / `:1044`).
  - Is the entry guard (`getRenderTarget()` and `getMRT()` null, skip counted) an adequate replacement for the `onReady`
    gate? If you know a yield inside r185's `render()`, say where.
- ~~**Q3** (stop mounting the arch on `?blank=1`)~~ **DECIDED BY CARL (9 November, session 2):** *"The arch does not need
  to be there, it was the blueprint for one of the films which is now completed."* The arch is unmounted on `?blank=1` as
  its own change, with its §5b list (D-101). Its compile wait and PMREM leave the blank canvas. The entry guard stays.
- **Carl, the same reply:** *"i need to see it leaning first. It will move from that position."* The bench now mounts the
  LEAN. The reflection is judged there (R7-2 settled).
- **Q4** stands (marching cubes first).
- **R8-4:** the eroded front-face mask and the 4-level threshold.

## For Carl (not the Architect's)

- **The first look in the lean** (R7-2): bringing *"then the lean"* forward.
- **If the text reads as slabs** (R7-3): a look for your eye, with the capture image first.
- **The hemisphere light points DOWN on the page today** (measured above): the text's sky and ground colours are swapped,
  and the approved look was judged under it. Reported, not changed.
- **Q3** (stop mounting the hidden arch on `?blank=1`) changes the arch's lifetime: yours, if the Architect says it is
  needed.

---

# Appendix — v1.0 to v1.5, verbatim (HISTORY; superseded by the body above)

## (v1.5 as written)

### Structural note — what the hero's logo reflects: the family's studio, and the glowing text (9 November 2026) — v1.5

**Status:** PROPOSED, for the Architect's second round (CLAUDE.md §5a). Nothing is built.
**Authority:** Carl read v1.3 and said *"apply the metal and reflection"*. At session 1's close he redirected the background
to the button's studio. In session 2 he routed it: *"lets consult the architect."*
**v1.5:** consolidated after the Architect's review of v1.4 (`review-7-structural-note-hero-logo-reflection-9-november.md`,
nine findings, each verified by the Builder before this was written). **This body is the whole current proposal.** v1.0 to
v1.4 are kept verbatim in the appendix, as history only. Each change from v1.4 is marked **[R7-n]**, n being the
Architect's finding.
**Record:** D-101, from *"THE LOGO's COLOUR (9 November 2026)"*.

## The ask, in Carl's words

- *"yes, we need a reflection. It would be more realistic if we could show the glowing text in it. Not so much in the
  solid state but definately in the liquid state."*
- *"There is not 2 red logos. It is one that goes from solid to liquid and back to solid."*
- At session 1's close: the capture's background is the button's studio (the family HDRI), not the desk mark's formers.

## The proposal

**One `PMREMGenerator.fromScene` capture at the red body's centre, of a REFLECTION SCENE, used as the logo's `envMap`.**
It is retaken when the body's centre moves (the upright, the lean, the landing, the blobs' space, the re-formed logo). It
is not retaken per frame. The body is never in its own capture.

r185's `fromScene(scene, sigma, near, far, { size, position, renderTarget })` renders a cube of `scene` from `position`
and prefilters it in one call. It reuses `renderTarget` on a recapture (`PMREMGenerator.js:137–175`, WebGPU; WebGL's
`extras/PMREMGenerator.js:109` has the same signature).

### The reflection scene

1. **Background: the family HDRI.** It is the SAME texture the logo wears in step 1: `loadStudioHdri(STUDIO_HDRI_SRC, 0.1)`
   (`lib/studio-hdri.ts`, one fetch per page), as `scene.background` at `backgroundIntensity` 1.
   - A texture background passes through `_sceneToCubeUV` untouched (`PMREMGenerator.js:489–500`). It is drawn in each
     face as the background sphere (`Background.js:83–147`). Equirect is accepted (`NodeManager.js:666`).
2. **The text:** second `Mesh` objects sharing the text's geometries and material. No copied buffers.
3. **The text's lights:** second copies of `HeroSketchLight`'s hemisphere (1.2) and directional (1.6), built from ONE
   constant lifted out of its JSX in `hero-page.tsx`.
   - On the page the text's satin faces are lit by these. Without them the metal would show it lit differently from the page.
4. **[R7-5] Built in the SAME FRAME as the page.** On the page the lights and the text sit inside the blank canvas's group
   (`[0, world.floor, world.z1]`, `camera-bench.tsx:1474`). The directional light's target is unparented, at the world
   origin. So the light's direction depends on that offset (and the hemisphere's on its world position).
   - The reflection scene therefore holds ONE root whose matrix is copied, at capture time, from the logo's own parent
     (`mesh.parent.matrixWorld`). The lights and the text sit inside it at the same local transforms as on the page, and
     the directional target stays unparented at the origin.
   - That reproduces the page's lighting exactly, with no second copy of the offset. **v1.4's "cannot drift" was not true
     as written; this makes it true.**
5. **Not in it:** the logo, the blobs, the floor grid, the guides, the desk mark's formers. **[R7-9]** The orange hotspot
   former is not in it either: the reference's hotspot is a take for the LIGHT chunk, not this one.

### The capture's parameters

- **[R7-1] `near` 1 cm, `far` 10,000 cm.** The world is in centimetres, and the defaults (0.1, 100) would clip everything
  beyond 1 m, i.e. all the text, while every v1.4 check still passed. The background is drawn at the far plane regardless
  (`Background.js:117`).
- **`size` 256:** the same as step 1's prefilter (the 1k equirect gives a 256 cube). 512 stays a take.
- **`position`:** the logo's world bounding-box centre in its current pose.
- **`sigma` 0.**

### The turn

- Step 1 turns the studio by the logo's `envMapRotation` (150°). With the text in the capture, that would turn the text
  too. **The capture is made in WORLD orientation:** the 150° goes on `scene.backgroundRotation`, and the logo's
  `envMapRotation` returns to 0.
- **[R7-6] The signs agree, read in source:**
  - Both rotations are `makeRotationFromEuler(e).transpose()` applied to the lookup direction: the background at
    `SceneProperties.js:37` with `Background.js:93`; the environment at `MaterialProperties.js:47` with `PMREMNode.js:347`.
  - Both are render targets, so both get the same Y flip (`PMREMNode.js:346`).
  - Still run the null control.

### When the capture runs

- **Between frames** (an effect or a task, never inside `useFrame` or the bloom pass). There the renderer holds no MRT, so
  the text's material builds without its glow mask (`hero-text-material.ts:46–50`) and keeps its colour. The cube target
  is its own render context, so it gets its own variant.
- **[R7-4] And never before the arch's compile wait has finished.** On `?blank=1` the hidden arch is still mounted
  (`camera-bench.tsx:1467–1469`). Its `compileAsync` reads the renderer's live target and MRT
  (`bench-medium-webgpu.tsx:281–294`, recorded in `hero-bloom.ts:46–52`). The first capture is gated on that wait's
  `onReady`; later captures are triggered only by a pose change.
  - Whether the blank canvas should stop mounting the arch at all is question 3. It would remove the race at its source,
    but it changes the arch's lifetime, so it is not assumed here.
- ⚠ The first capture compiles the text's variant for the cube target: a one-time stall, measured when built.

### The seam

- **[R7-7]** `PmremLike` (`bench-medium.ts:91`) gains `fromScene(scene, sigma, near, far, options)`. Both media's
  generators have it.
- **The WebGL medium: unchanged.** It keeps step 1's `fromEquirectangular` with `envMapRotation`, and its clay text is not
  captured. The hero's medium is WebGPU, and the bench is WebGPU by default. The WebGL medium is the comparison bench, not
  the hero's renderer. This is recommended, not assumed: question 11.

### The ownership

The capture needs the text's geometries and material (owned by `HeroText`) and the logo's pose (owned by `HeroLogo`). They
are siblings in the blank canvas's group.

- **RECOMMENDED — [R7, Q10] build the text ONCE above both and pass it down.**
  - `hero-text.tsx` exports a hook, `useHeroTextBuild(material)`: today's `useMemo` and `useDisposeOnUnmount`, moved
    verbatim.
  - A small component (`HeroStage`, in `hero-page.tsx`) replaces the blank canvas's group. It calls the hook and mounts the
    lights, `HeroText` (which now renders what it is given) and `HeroLogo` (given the same build for its capture).
  - Data flows one way. The text's lifetime is the stage's, which mounts and unmounts exactly where the group does today.
- **Considered — `onBuilt`** (v1.4's recommendation): a child-to-parent callback that sets the bench's state. It works, but
  it makes the build's lifetime harder to read, and it adds an extra render of the whole bench.
- **Rejected — find the text by name** (`getObjectByName`): a string coupling nothing asserts (the mark-name collision).
- **Rejected — a module-level store:** a second source of truth for the build.

**Moving the group into `HeroStage` moves nodes between parents in the React tree (CLAUDE.md §5a/§5b). What the group
provides today, and how each is kept:**

| What the current group provides | Kept by |
|---|---|
| Mounted only when `blank && world` | `HeroStage` mounted under the same condition |
| Its offset `[0, world.floor, world.z1]` | the stage's own group, given `world` |
| The lights inside the offset (their direction depends on it) | the lights stay inside it; the capture copies the parent's matrix (R7-5) |
| The text's material from `medium.heroText?.material` | passed to the stage, then to the hook |
| The logo's PMREM from `medium.pmrem` | passed through |
| The logo's pose (`"upright"` today) | passed through, unchanged |
| The text's build disposed a task late on a real unmount (`useDisposeOnUnmount`) | the same hook, inside the stage |
| By accident of position: nothing found | grepped 9 November, session 2 (`components/showcase/`, `app/proto/`, `live-work/scripts/`, `verify/`): the names `"hero text"` and `"hero logo"` are read by nothing; the bench's two `traverse` calls (`camera-bench.tsx:1171, 1181`) walk the camera helpers' own root, not this group |

## What to expect — said before anyone looks

- **[R7-2] In the UPRIGHT (mounted today) the reflection shows almost nothing.** The logo's centre is 3.8 cm behind the
  text's face plane, and the text is 8.1 cm deep. From there every line of text is seen exactly edge-on. That is physically
  right, but it is not a judgeable look.
  - **So the reflection is judged in the LEAN** (it is the phase-1 opening anyway). That brings Carl's next step, *"then
    the lean"*, forward, and only Carl can reorder it: question for Carl.
- **[R7-3] The text may read as glowing SLABS, not edge-lit shapes.** Its edge glow is `(1 − N·V)^2.5`, worked out from
  the viewer. The capture point sits ~44 cm in front of the text and to its right (the lean), so the letter faces are at
  a grazing angle and glow at an estimated 30–75 % (the Architect's geometry from the code, not measured). On the page they
  glow near 0.
  - **That is the material behaving as built,** seen from where the logo stands. Whether it reads right is Carl's eye.
  - The first look is therefore the capture ITSELF (measurement 2), before the logo.
- **[R7-8] Placement error.** A cube capture treats everything as infinitely far away. With the text 0.5 to 3 m from a 2 m
  body, the reflected text lands visibly displaced on the surface: more on the solid's flat faces, less on the liquid's
  curves.
- At 256 px, words are not legible; shapes are. Roughness sets how sharp they are: the liquid low (~0.05 to 0.1), the
  solid higher (~0.2 to 0.4). One material, one dial, animated across the phase change. The values are takes.

## Measurement plan — tolerances set BEFORE the first run [R7-6]

1. **The null control.** The capture WITHOUT the text (background and lights only) against step 1's logo
   (`fromEquirectangular` with `envMapRotation` 150°): same pose, same camera, bench frame, 8-bit, at Carl's density.
   - **Pass:** over the logo's pixels, mean |Δ| ≤ 1.0 level per channel, and the 99.5th percentile ≤ 6 levels.
   - **Its own negative control:** the same comparison with the background left at 0° must FAIL by at least 5× the
     mean. That shows the tolerance can see a wrong turn.
   - If the null control fails, nothing else is judged; the cause is tracked down.
2. **The capture itself, looked at [R7-3].** Its six faces (or its cube-UV target) written to an image: what the logo
   "sees". Checked for the text present, unclipped, lit like the page.
3. **The positive control [R7-1].** With the text in: at least 0.5 % of the logo's pixels change by more than 4 levels. If
   none change, the text is not in the reflection, whatever else passes.
4. **The negative control.** The changed pixels lie on the surfaces turned toward the text. None are on the flat face.
5. **The cost (D-108):** one capture's time, and the first capture's compile stall.
6. **The glow's identity check** (`live-work/scripts/hero-bloom-measure-9-november.mjs`) still passes.

⚠ The tolerances in 1 and 3 are the Builder's, proposed here so that they are reviewed before any number exists.

## Files

| File | Change | Scope |
|---|---|---|
| `components/showcase/hero-logo.tsx` | owns the capture; `envMap` from it; `envMapRotation` 0 (WebGPU only) | open |
| `components/showcase/hero-text.tsx` | `useHeroTextBuild` exported; `HeroText` renders a given build | open |
| `components/showcase/hero-page.tsx` | `HeroSketchLight`'s values as one constant; `HeroStage` | open |
| `components/showcase/camera-bench.tsx` | the group replaced by `<HeroStage>` | open |
| `components/showcase/bench-medium.ts` | `PmremLike.fromScene` **[R7-7]** | open |
| `components/showcase/bench-medium-webgpu.tsx` | possibly nothing (its generator already has `fromScene`) | open |
| `lib/studio-hdri.ts` | read only | — |
| a NEW `hero-reflection.ts` | only if `hero-logo.tsx` grows too long: **Carl widens the scope first** | not open |

## Not decided here

- Whether the logo's metal becomes a node material.
- Roughness values, and the phase-change animation.
- 256 or 512.
- The hot phase's hotspot (the light chunk).
- The rain in the reflection (phase 2): a capture per frame, to be priced then (D-108).

## Questions for the Architect, round 2

1. (stands) `fromScene` with `position` and a reused `renderTarget` under WebGPU: confirmed by your reading, to be run here.
2. (stands) The text's material in a second scene: any cache or ownership hazard, given its per-variant `setup`?
3. (stands, sharpened by R7-4) Should the blank canvas stop mounting the hidden arch? That would end its PMREM and its
   compile wait on `?blank=1`.
4. (stands) Marching cubes under WebGPU proven first, given the reflection pays off mostly in the liquid (your note on Q4).
7. The text's lights copied, in the page's frame (R7-5's fix as above): sound?
9. The first capture gated on the arch's `onReady`: enough, given question 3 is open?
10. `HeroStage` with `useHeroTextBuild`, against `onBuilt`. Is the §5b table complete?
11. The WebGL medium left on step 1 (no capture): agreed?
12. The tolerances in measurements 1 and 3.

## For Carl (not the Architect's)

- **The first look in the lean, not the upright** (R7-2): bringing *"then the lean"* forward.
- **If the text reads as slabs** (R7-3), that is the material seen from the logo's position: a look for your eye, with the
  capture image shown first.


## (v1.0 to v1.4 as written)

## (v1.4 as written) Structural note — what the hero's logo reflects: the studio, and the glowing text (9 November 2026) — v1.4

**Status:** PROPOSED, for the Architect (CLAUDE.md §5a). Carl read v1.3 and said *"apply the metal and reflection"*; on
9 November, session 2, he routed it: *"lets consult the architect."* Nothing is built.
**v1.4 (9 November, session 2):** ⛔ **THE CAPTURE's BACKGROUND IS THE BUTTON FAMILY's HDRI, NOT THE DESK MARK's FORMERS**
(Carl's redirect at the close of session 1). A′ becomes the recommendation and A is withdrawn. Three findings from reading
r185's source for the swap change the mechanism. They are in *v1.4 — the family's studio* at the end, and that section
SUPERSEDES the formers wherever the earlier text names them.
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

- **A — `fromScene` at the logo: the judging studio plus the text.** ⛔ **WITHDRAWN in v1.4** (Carl: the button's
  studio). Recommended through v1.3.
- **A′ — the same, with the studio HDRI** (`monochrome_studio_02_1k.hdr`, the buttons' and the arch's) as the
  background, in place of the formers. **RECOMMENDED in v1.4:** the logo already wears this studio (step 1,
  `hero-logo.tsx`, `HERO_LOGO_METAL`), so the capture adds the text to the reflection Carl has already seen and changes
  nothing else.
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

⛔ **Superseded by v1.4's file list** (at the end). Kept as written:
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

## v1.4 — the family's studio (9 November 2026, session 2)

Carl, at session 1's close: the capture's background is **the button's studio** (the family HDRI), not the desk mark's
formers. **The mechanism is unchanged: one `fromScene` capture at the red body's centre, of the studio plus the text,
retaken when the body moves.** What changes is below, with three findings from reading r185's source (read, not run).

### The reflection scene, v1.4

- **Background:** the family HDRI, the SAME texture the logo wears now: `loadStudioHdri(STUDIO_HDRI_SRC, 0.1)` (room
  darkened to 0.1; one fetch and decode per page, `lib/studio-hdri.ts`), as `scene.background`, at `backgroundIntensity`
  1 (`HERO_LOGO_METAL.envMapIntensity`).
  - **Read in source:** r185's WebGPU `PMREMGenerator._sceneToCubeUV` passes a texture background through untouched (only
    a `Color` is swapped for its box, `PMREMGenerator.js:489–500`). The renderer then draws it in each of the six faces as
    its background sphere (`Background.js:83–147`). An equirect `DataTexture` is accepted (`NodeManager.js:666`).
- **The text:** second meshes sharing the text's geometries and material (as v1.1).
- **The text's lights:** new, finding 1.
- **Not in it:** the formers, the logo, the blobs, the floor grid, the guides.

### Finding 1 — the text must carry its lights into the capture

- On the bench the text is lit by `HeroSketchLight` (`hero-page.tsx:102–106`: a hemisphere at 1.2, a directional at 1.6).
  Its satin faces take their light from those; only the bevels' Fresnel emissive is light of its own.
- A reflection scene without them draws the faces dark and only the edges bright. **That might even be the look**, but it
  would be the text lit differently in the metal than on the page, which is not a reflection.
- **So the reflection scene carries second copies of the same two lights**, built from ONE constant shared with
  `HeroSketchLight` (lifted out of its JSX in `hero-page.tsx`), so the two cannot drift. A light cannot sit in two scenes
  either.
- ⚠ The logo itself is also lit by `HeroSketchLight` (step 1 is not `environmentOnly`, unlike the desk mark). Unchanged
  here; light is its own chunk.

### Finding 2 — the 150° turn moves from the logo's material to the capture's background

- Step 1 turns the studio with **`envMapRotation`** on the logo's material (150°, `hero-logo.tsx`).
- With the text in the capture, that rotation would turn **the text too**: the reflected words would sit 150° from where
  the text stands. **The capture must be made in WORLD orientation**, so the turn goes on the background
  (`scene.backgroundRotation`, read at `Background.js:93`) and the logo's `envMapRotation` returns to 0.
- ⚠ **Unasserted: that `backgroundRotation` and `envMapRotation` turn the same way in r185's WebGPU path.** WebGL has sign
  flips between the two. The null control below exists to catch it.

### Finding 3 — when the capture may run

- The text's material attaches its glow mask only when the renderer holds an MRT (`GlowMaskedStandardMaterial.setup`,
  `hero-text-material.ts:46–50`, the bloom build's fix for [A5]). The renderer holds one **only inside the bloom pass's
  draw**.
- **So the capture runs BETWEEN frames** (an effect or a task, never inside `useFrame` or the pass). There `getMRT()` is
  null, the text draws as a plain standard material and keeps its colour. The cube target is its own render context, so
  it builds its own variant and never disturbs the pass's.
- ⚠ **The first capture compiles that variant** (a new target format and sample count): a one-time stall, like the glow's
  ~500 ms first frame. Measured when built.
- `fromScene` saves and restores the renderer's target, cube face and mip level (`PMREMGenerator.js:154–156`, `_cleanup`).

### The ownership question (structural)

- The text's geometries and material are owned by `HeroText`; the logo's pose by `HeroLogo`. They are siblings in the
  blank canvas's group (`camera-bench.tsx:1474–1480`). The capture needs both.
- **Recommended — the bench passes the text down.** `HeroText` reports what it built (`onBuilt`); `camera-bench.tsx` holds
  it and hands it to `HeroLogo`, which owns the capture: it knows its pose, its centre and when it moves. The text's
  lifetime stays with `HeroText`; when that rebuilds, the logo recaptures.
- **Rejected — find the text by name in the scene graph** (`getObjectByName("hero text")`). Cheaper, but it is the
  mark-name collision's shape (`context-rules.md`, *An invariant that lives only in prose*): a coupling by a string that
  nothing asserts.
- **Rejected — a module-level store:** a second source of truth for the text's build.

### Measurement plan (built with it)

1. **Null control:** the capture WITHOUT the text (background and lights only) must reproduce step 1's logo, frame for
   frame, against `fromEquirectangular` with `envMapRotation`. Both prefilter at 256 (the 1k equirect gives a 256 cube).
   **It tests finding 2's rotation and the capture's exposure in one comparison.** If it fails, nothing else is judged.
2. **Negative control:** the text in the capture must change the logo's pixels **only** on surfaces turned toward the text
   (the left edges and bevels in the upright; the edge toward the t in the lean), not on the flat face.
3. **The cost:** the capture's time, and the first capture's compile stall, each measured (D-108).
4. **The glow's identity check** (`live-work/scripts/hero-bloom-measure-9-november.mjs`) still passes: the capture must
   leave the bloom untouched.

### Files, v1.4

- `components/showcase/hero-logo.tsx`: the capture's owner; the material's `envMap` from the capture; `envMapRotation` 0.
  Open.
- `components/showcase/hero-text.tsx`: `onBuilt`. Open.
- `components/showcase/camera-bench.tsx`: passes the text to the logo. Open.
- `components/showcase/hero-page.tsx`: `HeroSketchLight`'s values lifted into one constant. Open.
- `lib/studio-hdri.ts`: read only.
- Possibly `components/showcase/hero-reflection.ts`, NEW: the reflection scene's builder, if `hero-logo.tsx` grows too
  long. ⚠ **A new file needs Carl to widen the scope.**

### Questions for the Architect, v1.4

Questions 1 to 4 stand, with question 1's "formers" read as "the family HDRI". Questions 5 and 6 were closed by v1.3 (one
body).

7. Finding 1: the text's lights copied into the capture from one shared constant. Sound, or should the reflection see the
   text unlit (edges only)?
8. Finding 2: the turn on `scene.backgroundRotation`, the logo's `envMapRotation` at 0, proven by the null control. Any
   r185 WebGPU difference between the two that you know of?
9. Finding 3: the capture run between frames, the text's variant compiled on the first capture. Is "between frames" a safe
   enough guarantee, or should it be gated on something the bench asserts (no pass mid-draw)?
10. Ownership: `onBuilt` up through the bench, against the two alternatives.
