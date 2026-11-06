# Structural note — the bench in TWO MEDIA (WebGL and WebGPU); the hero's renderer

**Status: PROPOSED, v1.6 — READY FOR THE ARCHITECT (reviews 5 and 6).** Written 5 November 2026 by the Builder (CLAUDE.md §5a: a second kind of renderer; a second
version of renderer-specific bench parts; a new proto page; an edit to the approved shared `LetteringPiece` — **that choice,
(a), approved by Carl**; the structure as a whole awaits the Architect). For Carl, who routes it to the Architect. **Not built.**
- **v1.6:** review 6 (`review-6-structural-note-renderer-webgpu-5-november.md`, filed verbatim) — the seam paragraph says the medium module
  holds only the WebGPU twins for the environment and compile wait.
- **v1.5:** review 5 (`review-5-structural-note-renderer-webgpu-5-november.md`, filed verbatim): *"It's ready for the
  Architect"*; its three small points taken — where `ArchMediumContext` lives (beside `LetteringPiece`; the medium module
  imports it, never the reverse); the body always rendered, the texture or null; "today's code" corrected to "today's weight".
- **v1.4:** review 4 (`review-4-structural-note-renderer-webgpu-5-november.md`, filed verbatim): the environment component
  WRAPS the piece's body (nothing lifted — film 4 keeps today's timing); one compile-wait signature for both media,
  `(gl, scene, camera, done) => cancel`, the WebGPU twin with a cancelled flag; the failure row strengthened (`onDeviceLost`
  covers the fallback too; `'destroyed'` ignored); the harness citation names its file.
- **v1.3:** review 3 (`review-3-structural-note-renderer-webgpu-5-november.md`, filed verbatim): Carl's approval of (a) made
  consistent everywhere; "untouched" corrected — the WebGL BEHAVIOUR is unchanged, its CODE refactored at five named points,
  and what proves it named; `LetteringPiece`'s interface named (a context, WebGL its default, the environment injected as a
  component and the compile wait as a function — no hook chosen per medium); the medium module awaited before the `Canvas`
  mounts; the bench's arch checked before and after too.
- **v1.2:** review 2 (`review-2-structural-note-renderer-webgpu-5-november.md`, filed verbatim): **the arch reaches the
  WebGPU twins only through `LetteringPiece`, the ONE component film 4's approved page also draws with** — v1.1's "the
  approved shared files are NOT edited / film 4 untouched" was WRONG for that file; corrected, the choice named, (a)
  recommended, Carl's explicit word needed (§3) — ✔ given, recorded in v1.3. `fromEquirectangularAsync` is deprecated (r181) — the plain
  `fromEquirectangular` after `init()`. The WebGPU half loads ONLY when chosen (a dynamic `import()`). One seam call sets
  either grid's fade. The tone-mapping line is a typing question only.
- **v1.1:** the review of v1 (`review-structural-note-renderer-webgpu-5-november.md`, filed verbatim, findings 1–7 and the
  Builder's notes) and **Carl's TWO MEDIA**: *"Is it possible to have the 2 mediums to work in? By that i mean the arch bench
  is webGL. Is it possible to have a webGPPU version of it. So in future if we are building with either webGL or wbGPU we
  would have 2 prototypes."*, then *"Yes, that would give us more flexability."* **v1's proposal — move the whole bench to
  `WebGPURenderer` — is WITHDRAWN**: it rested on an incomplete §3 (the arch's WebGL-only environment and compile helpers,
  finding 1), and Carl's two media replace it. The rejected "renderer per mode" of v1 returns, re-argued, as a medium switch.

**Record:** the approved surfaces' plan v1.5 (`plan-pavement-tiling-4-november.md`), §6 *THE MATERIAL ROUTE* and §9 step 4;
D-101, 4 November (Carl: *"WebGPU would be better"*; *"plus roughness and ambient occlusion for weathering and WenGPU"*) and
5 November (the wet-brick direction; the note written; the two media). **The site as a technique showcase** (Carl): a client
may want either route.

⚠ **Verified vs not:** **[checked]** = read in `node_modules` / the code, or measured on this machine, 5 November;
**[to verify]** = the spike's or the build's job. Nothing has been run on `WebGPURenderer` yet.

---

## 1. The decision

1. **The bench works in TWO MEDIA**, chosen when it mounts: the **WebGL medium** (today's `WebGLRenderer`, GLSL — every
   approved piece is built in it) and the **WebGPU medium** (`WebGPURenderer`, TSL node materials, with three's automatic
   WebGL 2 fallback where a browser lacks WebGPU). One bench, one recorder, one pad, one timeline, one PiP; only the parts
   that speak a renderer's language exist twice, behind ONE SEAM (§3).
2. **The hero's textured scene is built in the WebGPU medium** — the proof flag's material onward (plan steps 5–9).
3. **Any scene can be put in either medium** — the arch, the hero — so a shot can be compared across the two, image against
   image; a client can be shown either route.

**Why now:** a material is written in its renderer's language — on WebGL, GLSL patched into a built-in material
(`onBeforeCompile`, its own `customProgramCacheKey`); on WebGPU, a TSL node graph (Unreal's material graph is the nearest
twin), where `onBeforeCompile` does not apply. The proof flag's material is next; it is written once, in TSL.

## 2. The facts it rests on

| | |
|---|---|
| **three 0.185.1, R3F 9.6.1** [checked]; `three/webgpu`, `three/tsl` are package exports [checked] | |
| **R3F awaits a function `gl`** [checked: `typeof glConfig === 'function' ? await glConfig(defaultProps)`] | the route: `gl={async (p) => { const r = new WebGPURenderer(p); await r.init(); return r; }}` [to verify] |
| ⚠ **A failed `init()` is an UNHANDLED REJECTION in R3F** [checked: `Canvas` calls an async `run()` whose `await root.current.configure({ gl, … })` is not caught there] | it never reaches `ErrorBoundary` / the bench's `Guard` — **the catch is ours, inside the `gl` function** (§3, failure) |
| **WebGPU falls back to WebGL 2 by itself** (`WebGLBackend`; always with `forceWebGL`) [checked: `WebGPURenderer.js`] | one TSL source compiles to WGSL and to GLSL [compile path checked; the look's parity to verify] |
| **This machine has a hardware WebGPU adapter**: AMD RDNA 2, not a fallback adapter, `timestamp-query` available (Chromium 151, Playwright's) [checked] | ⚠ Carl's own Chrome not checked — read its GPU flags first (the memory's rule) [to verify] |
| **The two renderers share three's core** (both builds import `./three.core.js`) [checked] | minified, uncompressed: core 385 KB, WebGL renderer 366 KB, **WebGPU build 668 KB**, TSL 24 KB [checked]; compressed not measured |
| **Built-ins convert to node materials**; `ShaderMaterial` / `RawShaderMaterial` do NOT [checked: `StandardNodeLibrary.js:64–76`] | any GLSL shader material must have a TSL twin in the WebGPU medium |
| **Closed from v1's [to verify]** (review finding 4) [checked] | device lost: `renderer.onDeviceLost` (`Renderer.js:595, 1225`); timestamps: the backend's `trackTimestamp` (`Backend.js:76`; off without `timestamp-query`, `WebGPUBackend.js:294`), read by `resolveTimestampsAsync` (`Renderer.js:2856`); `polygonOffset` → `depthBias` / `depthBiasSlopeScale` (`WebGPUPipelineUtils.js:241–242`, triangle lists only — the joints are boxes: triangles) |
| **`compile` is `compileAsync` on WebGPU** [checked: `Renderer.js:3811`] — a Promise | the WebGL medium's `whenLinked` (polling programs) cannot serve it |
| **A WebGPU environment prefilter, PUBLIC API**: `PMREMGenerator` from `three/webgpu`, **`fromEquirectangular` after `await renderer.init()`** (`PMREMGenerator.js:217`; it throws before `init()`; ⚠ `fromEquirectangularAsync`, `:240`, is DEPRECATED since r181 — review 2) [checked] | the WebGPU medium needs none of the WebGL helper's private fields |
| **The wet look's tools in TSL** [checked: present]: `reflector()` (⚠ **no roughness setting** — `generateMipmaps` only; a rough reflection is built by reading blurrier mip levels where the surface is rougher — review finding 5), `SSRNode`, `GTAONode`, `BloomNode` | which the reflections use: their own note (plan §6, step 8) |

## 3. The seam — what is renderer-specific, and its two versions (§5b)

Everything else in the bench is shared and unchanged (the recorder, the chain, the pad, the timeline, the PiP's rectangle,
the page guide, the shot and eye cameras, `NeutralToneMapping`). ⚠ **The WebGL medium's BEHAVIOUR is unchanged — its CODE is refactored** (review 3, finding 2: an approved bench gets a
refactor, and this note says so): the grid's fade moves to `setGridFade` (the cast at `camera-bench.tsx:1314–1320` leaves),
the anisotropy accessor replaces `hero-blockout.tsx:1210`, the `Canvas` gains its choice of renderer, the WebGL cost meter is
reached through the seam, and `LetteringPiece` takes its environment and compile wait from the context ((a), below).
**What proves the behaviour unchanged:** `camera-bench-verify` (120) and `third-person-verify` (28) re-run in the WebGL medium
with their checks unchanged; film 4's page and the bench's arch captured before and after, image against image.

| Renderer-specific part (where today) | WebGL medium | WebGPU medium (NEW) |
|---|---|---|
| **The renderer** (`camera-bench.tsx`, the `Canvas`) | R3F's default | `WebGPURenderer` through an async `gl` |
| **Failure** (`:1844` `webglcontextlost` → "The bench cannot draw") | as today | **`init()` failure caught INSIDE the `gl` function** (R3F does not), and `onDeviceLost` — both to the same "cannot draw" message. [checked, review 4] `onDeviceLost` ALSO fires when the WebGL 2 fallback loses its context (`WebGLBackend.js:241, 247`) — one hook covers both backends; real WebGPU ignores the reason `'destroyed'` (`WebGPUBackend.js:264`), so a normal unmount never shows "cannot draw" |
| **The floor grids** (drei `Grid`, a GLSL `shaderMaterial`; its fade from `worldCamProjPosition`, set per draw for the PiP by a cast into its uniforms, `:1314–1320`) | as today, its fade set through the seam | a **TSL grid**, the same look, its fade position a node uniform — new code, checked against the WebGL grid by image. **ONE seam call, `setGridFade(grid, point)`, sets either grid's fade** — the cast leaves the bench (review 2, finding 4) |
| **Path lines** (drei `Line`, three-stdlib's GLSL `LineMaterial`) | as today | three's WebGPU `Line2` / `LineSegments2` (`examples/jsm/lines/webgpu/`) [checked: present] |
| **The cost meter** (harness-only, dev-only; `:1077`, `:1092` `gl.getContext()` + `EXT_disjoint_timer_query_webgl2`) | as today | timestamp queries (`trackTimestamp`, `resolveTimestampsAsync`); ⚠ where unavailable, CPU time only — **said in the harness's output** |
| **Max anisotropy** (`hero-blockout.tsx:1210` `s.gl.capabilities.getMaxAnisotropy()` — **throws on WebGPU**, review finding 2) | `capabilities.getMaxAnisotropy()` | `renderer.getMaxAnisotropy()` [checked] — **ONE accessor serving both** (a small helper reading whichever the renderer has) |
| **The PiP's viewport and scissor** (`:1336–1352`) | as today | the same three methods exist [checked]; ⚠ their units (logical vs device px; note v1.3.2) [to verify, by the PiP's own check] |
| **The arch's studio environment** (`lettering-piece.tsx:277` → `usePrefilteredStudio`, `corner-canvas.tsx:115`: the WebGL `PMREMGenerator`, its private fields) | the approved helper, as today | a **WebGPU twin** on `PMREMGenerator` from `three/webgpu`, `fromEquirectangular` after `init()` — public API |
| **The arch's compile wait** (`lettering-piece.tsx:291` → `whenLinked(gl, gl.compile(…))`, `corner-canvas.tsx:92`, WebGL program internals) | the approved helper, as today | a **WebGPU twin**: await `compileAsync` — the "drawn" signal waits on it |
| **The brushed brass's anisotropy** (`lettering-material.ts:32–34`: `anisotropyRotation` π/2, DERIVED FROM THE GLSL CHUNK `envmap_physical_pars_fragment`) | as today | ⚠ **re-derived from the TSL code** (the node path builds the anisotropy vector the same way, `MaterialNode.js:797`, but bends the normal in its own lighting code) — review finding 3; an image comparison alone does not prove it |

**⛔ `corner-canvas.tsx` IS NOT EDITED.** Its two helpers serve the home corners, the approved film 4 page
(`your-words-canvas.tsx`) and the arch on the bench (a search finds them in those three files — not in
`answer-card-canvas.tsx`, which calls `compileAsync` directly; review 2 agrees). The WebGPU medium has **its own twins**: the
second mechanism, **named here for review**, not slipped in.

**⚠ BUT THE ARCH REACHES THEM ONLY THROUGH `LetteringPiece` (review 2, finding 1 — v1.1 was WRONG to say no approved file is
touched).** `lettering-piece.tsx` is ONE component, drawn by the approved film 4 page (`your-words-canvas.tsx:40`, `:233`) AND
by the bench (`camera-bench.tsx:1404`; the bench's rule, `:12`: *"drawn by the SHARED `LetteringPiece` — one mechanism with the
page"*), and it calls the WebGL helpers itself (`:277`, `:291`). Two ways:
- **(a) CHOSEN: edit `lettering-piece.tsx`** so it takes the environment and the compile wait FROM THE ACTIVE MEDIUM, the
  WebGL path as the DEFAULT — film 4's page provides nothing and behaves exactly as now. A small edit; ONE arch mechanism
  kept. ✔ **APPROVED by Carl, 5 November: *"Option A is fine, approval given"*** — his ruling settles (a) over (b); it changes
  the file film 4's approved page runs (not on the protected list, but approved shared work, R-094). The structure as a whole
  stays PROPOSED until the Architect's review.
  **THE INTERFACE (review 3, finding 3):** a React CONTEXT, `ArchMediumContext`, whose DEFAULT VALUE is the WebGL path (the
  approved `corner-canvas.tsx` helpers, imported statically as today), PROVIDED only by the bench in its WebGPU medium, with
  the dynamically imported twins. `LetteringPiece` never imports the medium module — film 4's page never loads the WebGPU
  half. ⚠ **No hook is chosen per medium** (the hooks lint; the zero-warning baseline):
  - **THE ENVIRONMENT — a component that WRAPS the piece's body** (review 4, finding 1): the medium's environment component
    calls its own hook and RENDERS the body with the texture as a prop. NOTHING IS LIFTED — no setter called from an effect
    (close to the project's one accepted lint error, `set-state-in-effect`), no extra render: today `usePrefilteredStudio`
    holds the texture in its own state (`corner-canvas.tsx:116`) and `LetteringPiece` builds the metal in the same render
    (`lettering-piece.tsx:277–278`); wrapped, the body gets the texture in that same render — **film 4's WebGL path keeps
    today's timing**. The WebGL default wraps the approved hook; the WebGPU twin its own; each a fixed set of hooks.
    ⛔ **The body is ALWAYS rendered, given the texture OR NULL, as now** (review 5): the grain and the lamps
    (`lettering-piece.tsx:308–310`) mount at once and only the metal waits — a wrapper that rendered the body only once the
    texture existed would mount them late and shift film 4's timing.
  - **WHERE THE CONTEXT LIVES** (review 5): `ArchMediumContext`, with its WebGL default, is defined in a small file BESIDE
    `lettering-piece.tsx` (it imports only the approved `corner-canvas.tsx` helpers). The medium module IMPORTS it to provide
    the WebGPU twins — never the other way round — so `LetteringPiece`, and film 4's page with it, can never pull in the
    WebGPU half.
  - **THE COMPILE WAIT — one signature for both media: `(gl, scene, camera, done) => cancel`** (review 4, finding 2), the
    cancel the effect's cleanup as today (`lettering-piece.tsx:291`, deps `[gl, scene, camera, metal, built]`). The WebGL
    default a small wrapper round `whenLinked` (typed `WebGLRenderer` — the cast stays inside the wrapper); the WebGPU twin
    awaits `compileAsync` and keeps a CANCELLED flag, so a stale promise (`built` changed, the metal the same) never calls
    `done` — `linked` can never turn true before the new geometry has compiled.
  The lint run on this shape is the build's first check [to verify].
  **Checked after:** film 4's PAGE captured before and after, and the BENCH's ARCH (WebGL medium) captured before and after
  (review 3, finding 5: the bench harness's arch check, `camera-bench-verify-26-october.mjs:72`, is `check(true, …)` after the
  "drawn" signal — it proves the arch DREW, not that it looks the same) — each compared image against image, identical
  expected.
- **(b) a WebGPU copy of `LetteringPiece`** — rejected: it breaks the bench's own one-mechanism rule and the copies drift.

**Where the seam lives:** one small medium module beside the bench — the renderer factory (with its failure catch), the grid
and its `setGridFade`, the lines, the cost meter, the anisotropy accessor — each with a WebGL and a WebGPU version — and, for
the arch's environment and compile wait, the WebGPU TWINS ONLY (their WebGL versions are `ArchMediumContext`'s default, in
the file beside `LetteringPiece`; review 6); the bench asks the module for the medium's version once, at mount. ⛔ **THE WebGPU HALF LOADS
ONLY WHEN CHOSEN** (a dynamic `import()`; review 2, finding 3): the WebGL medium, the default, never downloads `three/webgpu`
(668 KB minified) or the TSL grid — its column keeps today's WEIGHT (its code is refactored, its behaviour unchanged — above). **The medium is chosen by the URL**
(`/proto/camera?medium=webgpu`; absent = WebGL, so today's links, takes and harnesses stay WebGL), and the bench shows which
medium it is in.

**R3F's typing** assumes `WebGLRenderer` (`useThree((s) => s.gl)`): the renderer-specific reads are exactly the seam's rows —
`camera-bench.tsx:1077, 1092, 1314–1320, 1336–1352, 1844`, `hero-blockout.tsx:1210`, `lettering-piece.tsx:277, 291`, the two
`corner-canvas.tsx` helpers (review finding 4) — each goes through the seam, so no cast spreads through the bench.
`lettering-piece.tsx:264` (`gl.toneMapping = THREE.NeutralToneMapping`) is NOT a seam row: `toneMapping` exists on both
renderers — a TYPING question only (review 2, finding 5); `NeutralToneMapping` stays shared.

**The harnesses:** `camera-bench-verify` (120 checks) and `third-person-verify` (28) run in the WebGL medium as today
(unchanged); a WebGPU run of each is added, each WebGL-only check rewritten for the medium or marked NOT WATCHED in that run's
output.

**The home page:** its two WebGL canvases (corners, button) and the approved `onBeforeCompile` materials stay WebGL. The hero
on `/` later would be a WebGPU canvas beside them — that placement is the D-101 structural note's.

## 4. The order — prove it first

**(1) THE SPIKE, the smallest scope (CLAUDE.md workflow 1):** a new proto page, `/proto/webgpu` — one R3F canvas on
`WebGPURenderer` (async `gl`, its `init()` failure caught), the hero block-out under the page camera (`HERO_CAMERA` with its
shift), no recorder, no grid, no PiP. ⚠ **First, inside the spike's scope (review finding 2): the anisotropy accessor in
`hero-blockout.tsx`** — else the block-out throws on mount (the file is open on Carl's word; the edit is named here). Measured,
not assumed:
- it **draws on WebGPU** here and on Carl's Chrome (its GPU flags read first);
- **`forceWebGL`** (the fallback) draws the same — image against image;
- **colour parity with today's WebGL bench**: the same view, compared by image (tone mapping, sRGB, the bricks, the flush
  joints' depth bias);
- **a first TSL material on the proof flag** — the wetness mask's skeleton only (one world-height gradient driving roughness
  and darkening, D-101 5 November) — the route proven; ⚠ its LOOK is the material step's approval;
- the **clean-checkout build** passes (Next 16, `three/webgpu` client-only).

**(2) THE BENCH's WebGPU MEDIUM** (§3's NEW column), then the harnesses in both media. The arch enters it through
`LetteringPiece`'s approved edit (§3, (a), Carl's word given) — the hero first, then the arch.
⛔ **THE MEDIUM MODULE IS AWAITED BEFORE THE `Canvas` MOUNTS** (review 3, finding 4): the bench resolves `await import()` of
the WebGPU half in a loading state OUTSIDE the canvas, then mounts it — nothing renderer-specific suspends inside the
`Canvas` (the bench's recorded failure, `camera-bench.tsx:1848–1851`, 26 October: a suspend reaching the outer boundary
forced "Context Lost").

**(3) The proof flag's material, written once in TSL** — in the WebGPU medium; later scenes choose their medium.

**Alternatives rejected:**
- **Move the whole bench to WebGPU** (v1) — withdrawn: it would edit the approved shared helpers (or `LetteringPiece`) or copy
  them without the other medium to show for it, re-derive the brass for a bench that loses WebGL, and leave no WebGL prototype — the opposite
  of Carl's two media.
- **Two separate benches** (a copy of `camera-bench.tsx` for WebGPU) — rejected: the recorder, pad, timeline and PiP would
  each be fixed twice and drift; only the renderer-specific parts need two versions.
- **Stay WebGL only** — rejected: Carl chose WebGPU for the hero; TSL is one source for WebGPU and the WebGL 2 fallback,
  with the wet look's tools in three.
- **Skip the spike** — rejected: a renderer that fails should fail on a page of its own, not inside the bench that carries
  R1–T1 and the third-person view.

## 5. Cost and risk

- **The spike:** small — one page, the anisotropy accessor, existing pieces, one TSL skeleton.
- **The WebGPU medium: SEVEN new pieces** (review finding 6 — v1 said four, then listed five): the renderer factory with its
  failure catch, the TSL grid (the largest), the WebGPU lines, the timestamp cost meter, the anisotropy accessor, the
  environment twin, the compile-wait twin. **Plus** the brass re-derivation before the arch is judged in WebGPU, and the
  small `LetteringPiece` edit (approved by Carl) with film 4's page and the bench's arch checked before and after.
- **Two media are tested twice:** every renderer-specific feature has two versions and two harness runs — the price of the
  flexibility Carl asked for.
- **First frame:** `WebGPURenderer` compiles asynchronously (`init()`, `compileAsync`) — the bench's "drawn" signal must wait
  on the real first frame (the A1 reload flake, seen once, makes this worth watching).
- **Browsers without WebGPU** draw the WebGPU medium through the WebGL 2 fallback — the same TSL; differences are the spike's
  fallback comparison.
- **Size:** +668 KB minified (uncompressed) wherever `three/webgpu` loads — the bench's WebGPU medium now; the hero on `/`
  later (weighed in the D-101 placement note).

## 6. Not decided here

- Which reflection technique (reflector with mip-blur / SSR / probes) — its own note (plan §6, step 8).
- Where the textured scene lives on `/`, beside the corners' and the button's canvases — the D-101 structural note.
- The proof flag's material LOOK — its own approval (plan step 5, stage 2).
- Which medium each FUTURE scene uses — chosen per scene, by Carl.
