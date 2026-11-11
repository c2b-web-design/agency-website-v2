# Structural note: the hero's new bench, built from the marching scene (11 November 2026), v1.3

**For:** Carl, to route to the Architect (CLAUDE.md Workflow 5a: a second bench is a second instance of a unique
resource, the renderer and its scene). **Status:** PROPOSED. Nothing in it is built.

**v1.3 (11 November 2026, session 1):** on the Architect's re-review of v1.1 (`review-structural-note-hero-bench-11-
november-v1.1.md`: all five v1.0 findings closed; one citation, three gaps, one minor; checked by the Builder):
(1) the mastering citation: D-035 is the method; ⚠ D-094 is the card text, BUT it carries Carl's ruling of 24 September
2026 deferring mobile to mastering (`decisions.md`, D-094, "ACCESSIBILITY IS DEFERRED TO MASTERING") — so BOTH are now
cited, each for what it holds; (2) the logo's geometry is `buildLogoMarkGeometry` + `LOGO_MARK_DEFAULTS` from
`components/about/logo-mark-geometry.ts` (`hero-logo.tsx`'s hook is not exported; its 2 m width and floor placement
are rebuilt or copied in step 2), added to the couplings; (3) `HOME` is DATA (position, target, fov): the scene applies
position and fov, the bench sets `controls.target`; the remembered camera beats `HOME` on load, so Home is checked
through the Home button; (4) the Timer is the BENCH's (`connect(document)`, disposed on the bench's side); the scene
keeps only `time += delta × speed × 0.5`; minor: the import check also fails on `OrbitControls`.

**v1.2 (11 November 2026, session 1): CARL's THREE DECISIONS GIVEN** (D-101), verbatim: *"1. The logo will assume the
lean position and be proportionate to the text. 2. i accept your proposal 3. i only have to zoom once to establish Home.
Once that is done it can be fixed. In Phase 2 for example, when the rain comes i might want to zoom out slightly to get
more of the floor in."* → (1) step 2 brings the logo AT THE LEAN, proportionate to the text; (2) the two copies of the
count workaround ACCEPTED, the reference untouched on purpose; (3) Home set ONCE, then FIXED; later camera moves (phase 2's
slight zoom out for more floor) depart from it, in the camera layer. The steps and § "Carl's decisions" amended to match.

**v1.1 (11 November 2026, session 1):** on the Architect's review of v1.0 (five findings, every line reference checked
by the Builder and found true). Findings 1–3 are CARL's decisions: each now carries the Builder's proposal, marked as a
proposal (§ "Carl's decisions"). Findings 4–5 corrected: the scene/bench boundary spelled out (§ "The boundary"); the
count workaround named in BOTH files; the overlay a THIRD copy; the remembered camera stores target and fov under its
own key; the dev hook development-only; `bench-ideas.ts` and `LIQUID_ON` worded checkably; the second threejs.org load
named; the two further stale comments named.

## Why

Carl, 11 November 2026: *"we will not use the camera bench. We will use the marching cubes."* … *"Can we moves the
marching scene to a new bench with a different scale. We will still need access to cameras as the end of the animation
process. On the existing camera bench the grid lines on the floor are set to a meter square. That wont work in the new
scene."* Then: *"WebGPU"*; the panel and the FPS meter *"good to have access to on the bench ... It should not be on the
site"*; and **Home**: *"When the bench is ready, before threejs text and the lean goes in- i will determine where Home
is. The text will be the size it is now but the blobs size will be determined and that will be home."* (D-101.)

The principle it serves (Carl, 10 November): *"Because we have an outside element with its own rules we must adapt to
that first."* The marching scene comes in as it is; the bench gives it our scale.

## The decision

A NEW bench, **`/proto/hero`** (the name is Carl's to change), built FROM `/proto/marching`, in its own folder
**`components/hero/`** so it is never confused with the camera bench's hero sketch (`components/showcase/hero-*.tsx`).

**Built in steps, each shown to Carl before the next** (steps 2–3 as Carl's decision 1 set them):

1. **The scene and the bench (this note's build).** The marching scene as `/proto/marching?webgpu=1` draws it today: the
   example's camera, lights, materials, `MarchingCubes` (resolution 28, scale 700), `updateCubes`, the clock, the orbit
   controls; the plain-mesh draw (the addon's `count` read as an instance count by three r185's WebGPU renderer, which
   hung Carl's GPU, D-101); the first frame waiting for the cube map. **WebGPU** (Carl's word). The panel (Materials,
   Simulation, Home page → text) and the FPS meter, **bench only**. The home page's text laid over the canvas, as now.
   Plus **HOME**, below.
2. **The logo and the scale** (after Home): the logo's mesh (the 2 m logo: `buildLogoMarkGeometry` with
   `LOGO_MARK_DEFAULTS` from `components/about/logo-mark-geometry.ts`, the /about desk mark's own geometry, as
   `hero-logo.tsx` builds it; that file's 2 m width `LOGO_WIDTH_CM` and floor placement from measured bounds rebuilt or
   copied, `hero-logo.tsx` being an R3F component whose geometry hook is not exported) brought in
   **AT THE LEAN, proportionate to the text** at Home (Carl: *"The logo will assume the lean position and be
   proportionate to the text"*). Its size fixes ONE number, centimetres per scene unit. The floor grid comes with it,
   its spacing a DIAL in centimetres (Carl: *"lines at whatever scale"*).
3. **The three.js text, then the logo's volume and the blobs mapped from it** (Carl's order).
4. **The cameras, last:** the camera bench's recorder brought across, its centimetre speeds converted through step 2's
   number. A separate note when it comes.

### HOME (step 1)

- **The camera is remembered** in this browser: a refresh or a code reload never moves it (as the camera bench,
  Carl 27 October: *"It shouldnt move"*). It stores the camera's **position, the orbit's target and the fov**, under
  **its own key** (`c2b-hero-bench-camera-v1`), never the camera bench's `CAMERA_KEY`. A per-viewer convenience: a failed
  read falls back to Home, said nowhere.
- **A readout in the panel**, always live: the camera's position, the orbit's target, its distance to the target, the
  lens (vertical fov), the window's size in layout px (Home is judged at a window; see Carl's decision 3), and the
  backend drawn on. **A "Copy" button** puts those numbers on the clipboard, to paste into the chat.
- **Carl sets Home by eye** (zoom and orbit until the blobs' size is right against the text), then says so and pastes
  the readout. **The Builder writes it into code** as `HOME` (the record; versioned in its comment with Carl's words).
  A **"Home" button** returns to it. Until Carl sets it, Home is the example's own view (−500, 500, 1500, 45°, the
  target the origin).
- **`HOME` is DATA** (position, target, fov), exported by the scene: the scene applies the position and fov to its
  camera; the BENCH sets the orbit's `controls.target` (the controls are the bench's).
- **Precedence on load: the remembered camera beats `HOME`.** So once the Builder writes Carl's Home into code, a reload
  shows the remembered view, not Home; the **Home button** shows Home. (Home is verified through the button.)
- ⛔ The bench never writes a file and Home is never only in the browser: the code holds it.

### The boundary: what ships and what does not

The SCENE (`hero-scene.ts`) imports **no panel, no FPS meter, no overlay text, no orbit controls**. The BENCH
(`hero-bench.tsx`) wraps the scene with them. So "not on the site" is a fact of the imports, not a switch: the site's
hero will import the scene module only. ⚠ **Unasserted** until a check exists; a candidate: a script that fails if
`hero-scene.ts` imports `lil-gui`, `stats` or `OrbitControls`. Not built unless Carl wants it.

**The split, spelled out** (the reference keeps all of it in one `useEffect` closure):

- **The scene** — exports `HOME` (data: position, target, fov) and `createHeroScene()`, which returns:
  - `scene`, `camera` (HOME's position and fov applied; the target is the bench's, below),
  - `settings` — the simulation's values (material, speed, numBlobs, resolution, isolation, floor, wallx, wallz): the
    example's `effectController`, as plain data the panel edits,
  - `materials` and `setMaterial(name)` (the example's `createHandler`, which also sets the addon's UV/colour flags),
  - `ready` — a promise that resolves when the cube map's loads have (the first-frame wait moves from the closure to a
    promise the BENCH awaits before starting its loop),
  - `update(delta)` — the example's `render()` body minus the draw and minus the Timer: the scene keeps only its
    `time += delta × speed × 0.5`, the resolution and isolation changes, `updateCubes`, the view following the addon's
    transform,
  - `dispose()` — everything the SCENE made (the addon's geometry, the materials, the cube maps, the texture).
- **The bench** — owns the renderer (`WebGPURenderer`, `onDeviceLost` stopping the loop, `init()`, the D-097 zoom
  sizing from the container), **the clock** (the example's `Timer`, `connect(document)`, which adds a document listener:
  disposed on the bench's side), the loop (`await ready`, then `timer.update()`, `update(timer.getDelta())` and
  `render`), the orbit controls (and `controls.target` from `HOME`), the panel, the FPS meter, the overlay, the readout, Copy, Home, the remembered camera; on unmount it stops the loop, disposes ITS
  parts, then calls `scene.dispose()`. StrictMode's double mount in development: every create has its dispose, as the
  reference.
- ⚠ **Said now, not found later:** the renderer's setup (`onDeviceLost`, the zoom sizing, `init`) lives in the bench, so
  the site's hero will need its OWN copy, or a shared module decided then. Not decided here.

## Carl's decisions (from the Architect's review, findings 1–3) — ✔ GIVEN, v1.2

1. **Where the logo comes in.** v1.0 set the scale "when the logo is sized" but brought no logo before step 3.
   ✔ **Carl: *"The logo will assume the lean position and be proportionate to the text."*** Step 2 brings it AT THE
   LEAN, sized against the text at Home; the scale follows from it.
2. **The count workaround in two files.** Building from `/proto/marching` COPIES the plain-mesh draw and the cube-map
   wait into `hero-scene.ts`; the reference keeps its own. A three upgrade must re-check `RenderObject.js:610–612` in
   **BOTH** (`components/showcase/marching-bench.tsx` and `components/hero/hero-scene.ts`); a fix in one does not reach
   the other. ✔ **Carl: *"i accept your proposal"*:** the two copies stand, the reference UNTOUCHED ON PURPOSE.
3. **Home holds at ONE window shape.** The overlay text is fixed CSS px, stepped at Tailwind breakpoints; the scene
   scales with the canvas HEIGHT (a perspective camera keeps its vertical fov), so the blobs' size against the text
   changes with the window's height. The readout records the window. ✔ **Carl: *"i only have to zoom once to establish
   Home. Once that is done it can be fixed. In Phase 2 for example, when the rain comes i might want to zoom out slightly
   to get more of the floor in."*** → Home is set ONCE at Carl's window and FIXED in code; later camera moves depart
   from it (the camera layer). In step 3 the three.js text moves INTO the scene, so text and blobs scale together at any
   height; the frame's shape on other screens stays with mastering (the method: D-035; Carl's 24 September 2026 ruling
   deferring mobile to mastering is recorded under D-094, "ACCESSIBILITY IS DEFERRED TO MASTERING"), the Builder's
   reading, not ruled.

## Alternatives rejected

- **Put the marching scene into the camera bench**, as an idea brought to it through `bench-ideas.ts` (no marching idea
  exists there; the file is the mechanism). The camera bench is React Three Fiber through its own medium layer, in a
  world fixed at 1 unit = 1 cm with metre squares: the example would be reshaped to fit us, the opposite of Carl's
  principle. It also carries route B's liquid code (`LIQUID_ON = true`, `components/showcase/hero-idea.tsx:19`).
- **Rescale the example to 1 unit = 1 cm** (field scale, near and far, the orbit's limits, the point light's 100, all
  rewritten). It changes the example's numbers before we have judged the scene, and breaks reading it side by side with
  the original. The scale is ONE number in step 2 instead.
- **Build on `/proto/marching` itself.** It is the untouched reference: when ours looks wrong, the original is one tab
  away. It stays as it is.
- **Home in the browser only** (a "Set Home" button storing it). Lost with the browser's data, invisible to the Builder
  and to the record. Rejected for the readout + paste + code.

## What it couples to

- **three r185's `MarchingCubes` addon** and its `count`: the plain-mesh draw is load-bearing on WebGPU, in TWO files
  (Carl's decision 2).
- **Two loads from threejs.org**, as the example does: the castle cube map (`SwedishRoyalCastle`) and the textured
  material's `uv_grid_opengl.jpg`. ⚠ Fine for a bench; **the site cannot depend on threejs.org.** The hero's own
  environment (the studio HDRI, the logo standard) replaces the cube map before the site, and the textured material
  does not ship; noted here, not built now.
- **The /about desk mark's geometry module** (step 2): `components/about/logo-mark-geometry.ts`
  (`buildLogoMarkGeometry`, `LOGO_MARK_DEFAULTS`). A change there changes the hero's logo too, as it already does for
  the camera bench's.
- **The toon materials** (toon1, toon2, hatching, dotted) are raw `ShaderMaterial`s WebGPU cannot draw: NOT on the new
  bench. The reference bench keeps them on WebGL.
- **The root zoom above 1412 px** (D-097): the canvas sized from its container in layout px, as the marching bench.
- **The overlay text is the THIRD copy of the home page's hero markup** (`app/page.tsx`, `marching-bench.tsx`, now
  `hero-bench.tsx`). If the home page's text changes, the copies do not follow. A guide until the three.js text
  replaces it (step 3).
- **WebGPU's fallback:** on a browser without WebGPU, `WebGPURenderer` falls back to WebGL 2. The readout names the
  backend drawn on, so a judgement is never made on the fallback by mistake.
- **The dev hook** `window.__heroBench` (the scene, the settings, the renderer, the backend) is set only when
  `NODE_ENV !== "production"`, as `__marching`.

## What depends on the current structures (5b)

Nothing existing changes shape. `/proto/marching` and `/proto/camera` are untouched in behaviour; nothing imports from
the new folder. ⚠ One exception, comments only: four stale comments in the reference, corrected in place (stale comments
are instruments, context-rules), the behaviour untouched:
- `marching-bench.tsx:26`: *"cause NOT FOUND; WebGPU only on purpose until it is"* (found and fixed, 10 November);
- `marching-bench.tsx:45–46`: *"WebGPU only on purpose, `?webgpu=1`, until the cause is found"*;
- `marching-bench.tsx:309`: *"WebGPU unless `?webgl=1`"* (the reverse: WebGL unless `?webgpu=1`, line 47);
- `app/proto/marching/page.tsx:7`: *"(it hung the GPU on 10 November 2026: on purpose only)"*.

## The files (authorised by Carl, 11 November: `_heroBench11Nov`)

**New (step 1):**
- `app/proto/hero/page.tsx`: the route, noindex, never linked.
- `components/hero/hero-scene.ts`: the scene (§ "The boundary"), `HOME`; no panel, meter, overlay or controls.
- `components/hero/hero-bench.tsx`: the bench (the renderer, the loop, the orbit controls, the panel, the FPS meter,
  the overlay text, the readout, Copy, Home, the remembered camera, the dev hook).

**Existing, comments only:** `components/showcase/marching-bench.tsx`, `app/proto/marching/page.tsx`.

**Governance, already in scope:** `decisions.md`, `live-work/`.

**Checks after the build:** `npx tsc --noEmit`; `npm run lint` (the one accepted error, 0 warnings); the page at
`/proto/hero` against `/proto/marching?webgpu=1` by eye, 60 fps, 0 console errors; a reload keeps the camera; the Home
BUTTON returns to `HOME` (position, target, fov); Copy works; the dev hook absent in a production build; Carl's look.

---

*Written 11 November 2026, session 1. v1.0 → v1.1 on the Architect's review; v1.2 Carl's three decisions; v1.3 the
Architect's re-review of v1.1.*
