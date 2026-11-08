# Brainstorm record — the hero (home), the new concept, 8 November 2026

<!-- Filled through `live-work/templates/brainstorm-record.template.md`. The RECORD of Carl's words is D-101 in decisions.md,
from "THE NEW CONCEPT — CARL PRESENTS IT (8 November 2026)" to "THE NEW HERO CONCEPT IS SET"; this file is the form's summary
and points there. Carl: "We will get to the details in the next session." -->

**Filmed:** the discussion NOT filmed (Carl, 2 November: recording only on his word). The references filmed into
`Videos\C2B Films\03 The hero\00 References\`: `marchingcubes-wallx-8-november.mp4`, `rain-sliders-8-november.mp4`,
`fog-8-november.mp4`, `vdb-smoke-8-november.mp4`, `cloth-8-november.mp4`, `projector-floor-8-november.mp4`,
`linkedparticles-sliders-8-november.mp4`, `linkedparticles-pointer-6-november.mp4`; raw `.webm`s beside them (kept, Carl).
Carl's sketch: `sketch-1-the-lean.png` (this folder). Capture scripts: this folder.

## Carl's words
Verbatim, in order, in D-101 (above). The direction they answer: *"The logo is the central theme. It should always return to
that shape, that form."* (6 November). The rule they keep: *"This wont be fancy three js effects for their own sake."*
Close: *"We have the logo phases and the pointer im nicknaming "Gandalfs fireworks" We have our concept."*

## Ideas raised
| Idea | Raised by | Status |
|---|---|---|
| The story's ORDER: the numbered references — 1 the liquid, 2 the rain | Carl | CHOSEN |
| Opening: the RED logo on its end, c on the floor, b against the t of *"built"*, top edge to camera, face to the right | Carl | CHOSEN (pose a take) |
| Leaning against *"to be seen."* | Builder | RAISED AND NOT CHOSEN |
| It NOTICES the visitor, JUMPS (x cm, a take), turns in the air to face us; the HEAVY LANDING melts it | Carl | CHOSEN |
| Beat 1: RED LIQUID BLOBS (`webgl_marchingcubes`), the same red as the logo — one material | Carl | CHOSEN |
| A WALL just past the viewport's right edge, unseen — the blobs read as bouncing off the screen's side (on the bench) | Carl | CHOSEN |
| The blobs gather IN THE MIDDLE and RE-FORM the logo STANDING ON THE FLOOR, FACING US (the jump's destination) | Carl | CHOSEN |
| Beat 2: LOCALISED PLATINUM BLUE RAIN on the logo; red because HOT; the rain COOLS it to PLATINUM BLUE | Carl | CHOSEN |
| STEAM — fog (`webgpu_custom_fog`) or a VDB volume (`webgl_loader_vdb`) | Builder noted steam; Carl both examples | RAISED, NOT CHOSEN |
| Beat 3: the logo WET; a CLOTH (`webgpu_compute_cloth`) MOVES OVER THE STILL LOGO, drying it; each pass leaves GOLD — shiny and new | Carl | CHOSEN |
| The logo JUMPS UP TO MEET THE CLOTH | Carl ("could possibly") | RAISED, NOT CHOSEN |
| The FLOOR: HEAT or COLD by the logo's phase, a GRADIENT from the logo, no square, no edge (reference `webgpu_lights_projector`) | Carl | CHOSEN |
| The SUBTEXT's bottom line on the floor — only the TIPS of the y's (*"you"*, *"eyes"*) touch; heat/cold there, minimal — "balance" | Carl | CHOSEN |
| The baseline on the floor (descenders sunk) | Builder | RAISED AND NOT CHOSEN |
| The PHASES END on the GOLD LOGO (it stays) | Carl | CHOSEN |
| "GANDALF's FIREWORKS": after the gold logo is established, the POINTER emits numerous tiny c2bs that come apart into c's, 2s and b's, maybe growing; a SHELF LIFE; nothing during the phases (from `webgpu_tsl_vfx_linkedparticles`, NO connecting lines) | Carl | CHOSEN |
| Each particle a c, 2 or b drawn on a sprite; the logo's own triangles coming away | Builder | RAISED AND NOT CHOSEN (both misreadings, corrected) |
| A CYCLE: re-form the leaning logo at the start | Carl | RAISED, OPEN — routes: the letters rebuild it, or the gold logo waddles back and reheats |
| Unused from the folder: `webgl_instancing_dynamic`, `webgl_buffergeometry` (the shard cloud) | Carl (6 Nov) | not placed in the concept |

## The world: materials, light, atmosphere, motion
- Materials: the logo one METAL through three states — RED-HOT (the marching cubes' red metal, `#9c0000`, metalness 1, roughness 0.1, env reflection; ⚠ GLOW from within or not: open), PLATINUM BLUE (cooled, wet), GOLD (dried, polished — the metal standard); the 3D text ICE BLUE, bevelled front and back; the floor's look by phase (heat / cold: open).
- Light: the logo's states light the text SELECTIVELY (6 November); the floor's gradient follows the logo; the projector's caustics as one reference for cold.
- Atmosphere: the localised rain; steam raised, not chosen.
- Motion: the jump and turn; the liquid (fixed-path metaballs, the floor fold, the off-screen wall); the rain; the cloth carried by its pins; the pointer's letters on turbulence. The camera: not discussed this session.

## ⛔ MEDIUM — WebGL or WebGPU (a take, proven before building)
- **Medium (take):** WebGPU.
- **The rows that tipped it:** thousands of moving things — the rain (compute), the cloth (compute), Gandalf's fireworks; a post stack (bloom on the fireworks); materials driven by the world (the cooling and drying maps, the floor's gradient). Four of the references are WebGPU as written.
- **Shares a page with:** the home page's other canvases (the ornate corners, D-100 — WebGL): to be listed when built.
- **Proof before building:** ⚠ UNVERIFIED — that three's `MarchingCubes` renders under `WebGPURenderer` (the example is WebGL); that the rain's and the cloth's compute run on the WebGL 2 fallback (or what a browser without WebGPU sees); the VDB example is raw GLSL (a port, if steam is chosen). The bench already has the WebGPU medium.

## Open — with owners
- The DETAILS of every phase (choreography, timings, the jump height) — Carl, next session.
- Do the hot blobs and logo GLOW? — Carl.
- What heat and cold LOOK like on the floor; what the floor does in the GOLD phase — Carl.
- When the pointer activates; the fireworks' count, growth and shelf life — Carl.
- The CYCLE — Carl.
- Every technique PRICED on the real assets before adoption (D-108) — Builder, as each is built.
- The hero's build goes through the structural-note process (CLAUDE.md §5a) before it is built — Builder.
