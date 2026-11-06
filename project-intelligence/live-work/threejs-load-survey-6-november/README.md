# threejs.org load survey — 6 November 2026, session 2

Carl: *"Go look at threejs.org and you will see what i mean."* (heavy scenes use a loading bar). Sites from threejs.org's
showcase grid plus three examples; each opened fresh (no cache), 1920 × 1080, headed Chromium with GPU flags, on Carl's PC
— **GPU: AMD Radeon integrated graphics (0x164C), D3D11** — broadband **~250 Mbps (Carl's figure, ~31 MB/s)**, no
throttling: every download in the table took ≤ ~4 s (rainyworlds' 126 MB) and most under 1 s, so **the waits seen are
the DEVICE (building, compiling, first frame), not the line.** Contact sheets: frames at
0.25 / 0.5 / 1 / 2 / 3 / 5 / 8 / 12 s. ⚠ A RED tile = the screenshot timed out: the page's main thread was frozen
(read as shader compiling — not proven per site). Scripts: `loadfilm.mjs`, `slop.mjs` (paths are this session's scratchpad).
⚠ The contact sheets (`*.png`) are screenshots of other studios' sites: kept on Carl's PC only, NOT committed.

| Site | MB by 12 s | What the visitor sees while it loads | Scene up |
|---|---|---|---|
| Slop New York (mrdoob; a city street, WebGPU, built in code) | 2.1 | loader with stage text: building 0.5–8 s, "Compiling scene shaders 621 batches" 8.5–14.3 s, "waiting for first frame" to 19.5 s | **19.5 s**, then 15–17 fps |
| rainyworlds | 126 | loading panel, then a menu | ~8 s (menu) |
| basement.studio (agency) | 20.6 | black 1 s → WIREFRAME build-in 2–3 s → freeze → lit room | ~8 s |
| igloo.inc | 14.6 | white/grey ~4 s → particle/wire build 5 s | ~8 s |
| bruno-simon.com | 7.2 | dark 2 s → loading ring 3–8 s | ~12 s, "click to start" |
| sebastien-lempens.com | 14.0 | counter 000 → 100 with a scooter | ~12 s, "START" gate |
| messenger.abeto.co | 5.6 | loading envelope | ~5 s, "BEGIN" gate |
| utsubo.com | 3.0 | logo loader | ~5 s, "begin experience" gate |
| hublot (darkroom) | 1.9 | black, frozen 1–2 s | ~3 s |
| locomotive.ca | 9.4 | text scramble | ~5 s |
| junni.co.jp | 12.7 | dark | ~1 s (type) |
| example: animation_keyframes (glTF) | 4.0 | blank | ~2 s |
| example: shadowmap | 0.6 | — | ~1 s |
| example: instancing_performance | 0.5 | — | ~0.6 s |

**Read (the Builder's):** every heavy scene hides 3–20 s behind a loader, a counter, a "begin" gate or a DESIGNED build-in
(basement's wireframe, igloo's particles). The nearest to ours — a street built in code — downloads little (2.1 MB) and
spends its wait BUILDING and COMPILING on the device (19.5 s here). Desktop broadband only; phones not measured.

## Our street so far, counted by Slop New York's rule (Carl: *"count the batches so far"*)

Slop New York's "batch" (its `js/main.js`, `precompileShaders`): one compile job per instanced or multi-material mesh,
plus one per distinct material among plain meshes. Counted the same way on `/proto/camera?blank=1&bricks=1` (the whole
bench scene: the block-out, the right wall's bricks, the text, the stand-in light, the bench's grid and mark), dev server,
`count-batches.mjs`:

| | Batches (NY's rule) | Instanced meshes | Plain meshes | Materials | Shader programs actually compiled |
|---|---|---|---|---|---|
| WebGL | 54 | 9 (36,975 bricks) | 43 | 53 | 19 programs |
| WebGPU | 54 | 9 | 43 | 53 | 26 pipelines (37 shader stages) |
| Slop New York | 621 | — | — | — | not counted |

⚠ NOT WATCHED: what is still to come (the lamp's and the neon's light, the wet road, the logo, bloom, the other two walls'
bricks) — each adds programs, and in WebGL a change in light count recompiles every lit material; the compile TIME
(the bench's "drawn" at ~7.8 s is the dev server's whole page, not the compile); phones; NY's own program count.

## Ballpark with what is to come (Carl: *"give me a ballpark figure for batches"*) — ARITHMETIC, NOT MEASURED

54 today, then: the far wall and the corner building's bricks +18–22 (~9 instanced shapes each, the arch's curved cuts
more); the lamp post +3–5; neon signs +6–10 (two or three, tubes and backs); graffiti +1–2; the wet road and puddles
+3–6; the logo and its splash +4–8; the door's details +2–4; street props +5–20 (not designed — the widest part); the
bench's grid and mark −3. **≈ 95–130 batches — roughly a fifth of Slop New York's 621.** Naive scaling from NY's compile
(621 in ~6 s on this PC) gives ~1–1.5 s — ⚠ but NY then waited ~5 s more for its first frame, and our lights, shadows and
wet reflections make each shader heavier: batch count is not compile time.

## webgl_marchingcubes (Carl: *"show them something like this ... they will be impressed"*)

Glossy red blobs merging and splitting over a floor, reflecting an environment map. On Carl's PC: canvas at 1.2 s, first
frame ~1.4 s, **1.22 MB**, **~60 fps**. One material, one surface rebuilt every frame, a reflection — it impresses by
MOTION and MATERIAL, not by scene size or photorealism. `marchingcubes.png` (12 frames, 0.25 s apart), `mc.mjs`.

## webgl_effects_parallaxbarrier (Carl: *"look and film"*)

500 chrome spheres orbiting in a photographed street (the Pisa cube map), the camera following the MOUSE. On Carl's PC:
first frame ~1.0 s, **0.84 MB**, **~60 fps**. Its source: the background is a CUBE MAP (six photos), every sphere one
`MeshBasicMaterial` with that cube map as `envMap` — **unlit: no lights, no shadows**; the realism is the PHOTOGRAPH,
reflected. The parallax-barrier effect itself interleaves left- and right-eye columns for a 3D (barrier) screen — on an
ordinary monitor it shows as fine vertical combing on edges (`parallaxbarrier-crop.png`). `parallaxbarrier.png`: 12 frames,
the pointer swept. ⚠ A cube map is seen from ONE point: the camera can turn in it, not travel through it (no parallax).

### marching cubes, looked at again (Carl: *"go look again"*)

Its source: a voxel grid of only **28³**, re-meshed on the CPU every frame; the default "shiny" is one `MeshStandardMaterial`
(red, metalness 1, roughness 0.1) reflecting a low-res photographed cube map (a castle); one directional light, one ORANGE
point light (0xff7c00) among the blobs, an ambient; the floor is part of the same field — the blobs DIP INTO IT and merge;
13 materials (most legacy Lambert/Phong, toon, hatching); drag to orbit. **Up close it is CRUDE** (`mc-shiny-full.png`):
faceted silhouettes from the coarse grid, a blurry reflection — and it still impresses, by movement and gloss.
`mc-materials.png`: all 13 materials, the walls on, a low orbit.
