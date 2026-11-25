# three.js r186 / r187 — what touches us (read 25 November 2026)

**We are on r185** (`package.json` `"three": "^0.185.1"` — on a 0.x version the caret allows 0.185.x only; the lockfile
pins the build). Released since: r186 (npm 0.186.0, 8 September; 0.186.1, 24 September), r187 (0.187.0, 30 October).
**The Builder's advice, 25 November:** stay on r185 to launch; upgrade AFTER, as its own chunk, on a branch, harnesses run,
every page walked. Carl asked for this report; no upgrade decided.

Source: the GitHub release pages for r186 and r187 (titles quoted; the bodies not read; the migration guide sections
185→186 and 186→187 NOT read — read them first when the upgrade is planned).

## Would change what is on screen — Carl's eye needed

- **`PCFSoftShadowMap` REMOVED** (r186: "Remove remaining PCFSoftShadowMap code." #33987; r185 already retired it, as
  `about-card-canvas.tsx` records). Still set in **`components/enquiry/answer-card-canvas.tsx`** (`/start`, WebGL) and
  **`components/hero/hero-bench.tsx`** (the hero's renderer). Both must change type; the shadows' softness may change.
- **PMREM rebuilt** (r187: "Replace the CubeUV atlas with cube render targets." #34585; r186: "Replace separable blur with
  spiral blur on both renderers." #32367; r187: "Restore minimal roughness, improve roughness ramp." #34645). Every
  reflection made through PMREM — the logo, the button family, the corners, `/start`'s cards, the desk mark — may look
  different. The reflection-map PRIMER (`hero-scene.ts`) depends on PMREM's caching: re-measure the opening's stalls.
- **Lighting fixes**: "Fix specular intensity in direct lighting." #34764 (r187); "MeshPhysicalNodeMaterial: Fix specular
  nodes." #34164 (r186); "MaterialNode: Fix clearcoat roughness texture channel." #34564 (r187). Approved metals and the
  marble's clear coat may shift.

## Touches our workarounds — re-test each

- **The shadow warm-up (`hero-scene.ts`, `warmShadow`, 25 November)** — r187 fixes the very fault it works round:
  "Preserve material side in compileAsync()." #35016, "Track the source material in override passes." #35232, "Ensure
  valid state in compileAsync()." #34506, "Compile pipelines in parallel in compileAsync()." #34816; r186: "Do not render
  shadow maps when precompile." #33924; "ShadowNode: Move shadow material and render object helpers to base class."
  #34312 (where `_getShadowNodes` lives may have moved); r187 "LightsNode: Fix cache key of shadow casting lights before
  the first build." #35019. → After an upgrade the workaround may be unnecessary, or may skip itself (`loadTimes.
  warmShadow` −2). Run `live-work/scripts/hero-pass4-stall-25-november.mjs` cold either way.
- **Pipeline / program cache keys** (memories: the polygon-offset pipeline key; the program cache ignoring which texture)
  — r187: "Refactor render cache key." #34726, "Add uv channel to material cache key." #34773, "Avoid cache key
  collision with similar IDs." #35226, "Fix handling of blending and combine." #35113, "Fix polygon offset with reveresed
  depth buffer." #34606. Our workarounds may become unnecessary — or behave differently.
- **MarchingCubes** (the count that hung the GPU): nothing in either release.

## Code changes an upgrade would need (renames / removals)

- "Introduce dispose() async" #34364 (r186) — check our `dispose()` callers.
- TSL: "Remove export of 'append'" #34156, "Do not export PMREMUtils" #33986, "Update exports in Three.TSL" #34310 (r186);
  "Rename getProjectionDepth() to projectionDepth()" #35230, "Replace 'addLight' with 'lightNode' reference" #34622,
  "Remove getSharedDataFromNode()" #34857 (r187). None of these names found in `components/` or `app/` (grep, 25 November).
- "TSL: Respect texture format when sampling textures." #33875 (r186) — a behaviour change.
- Global removals of deprecated code (#33886 r186; "Remove code deprecated in r177" #34517 r187).

## Possibly useful later

- "Support depth-only render targets." #34782 (r187); "BloomNode: Add faster blur strategy." #33923 (r186); "Compile
  pipelines in parallel in compileAsync()" #34816 (r187) — faster warm-ups; "Add SunLight with cascaded shadow maps."
  (r186).
