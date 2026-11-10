# Session Handoff — 10 November 2026 (Tuesday), session 2 (a long one). THE LIQUID MOVES TO THE EXAMPLE's OWN CODE

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written. Carl: *"we will do it in the next session tomorrow."*

**The record:** D-101 in `decisions.md`, from *"CARL ON THE EMERGENCE (10 November 2026, session 2"* to the end — every
beat with Carl's words. ⚠ Read the LAST FIVE entries first: they set where the work now stands.

## ⛔ WHERE IT STANDS — THE TURN THIS SESSION TOOK

1. **Route B (the raymarched liquid shader) cost too much.** Its compile froze the page ~3 s on a cold load; the async
   compile built to remove it (note v1.4, plan v1.2, Architect-reviewed, APPROVED) removed the freeze but its probe
   STOPPED at 6/12 (`live-work/liquid-async-compile-probe-results-10-november.md`): the background compile is slower than
   the 1 s cap; the warm-up frame 100–117 ms; the WebGL 2 fallback never reads ready (the liquid always off there). Carl:
   *"keep it and determine and fix the problems"* — then: *"what my original advice was to use the entire code off the
   site. use it then modify it to our taste. That was not done."*
2. **⛔ CARL's PRINCIPLE:** *"Because we have an outside element with its own rules we must adapt to that first."* The
   example's code comes in AS IT IS; OUR scene adapts to it.
3. **THE NEW BENCH `/proto/marching`** (`app/proto/marching/page.tsx`, `components/showcase/marching-bench.tsx`; Carl
   authorised both; in `chunk-scope.json`): three r185's `webgl_marchingcubes` MIRRORED line for line. WebGL by default
   (the example exactly); `?webgpu=1` WebGPU. ⛔ **The WebGPU HANG was found and fixed** (it hung Carl's AMD GPU twice —
   the driver's timeout dialog): `MarchingCubes` keeps its vertex count in `this.count`, which three's WebGPU renderer reads
   as an INSTANCE count (`RenderObject.js:610–612`), ~10,000 draws a frame. Fix: the addon builds, a plain mesh sharing
   its geometry draws; the first frame waits for the cube map (else the shiny draws black). WebGPU = WebGL by eye, 60 fps,
   0 errors. Memory: `reference_marchingcubes_count_webgpu.md`.
4. **THE HOME PAGE's TEXT is laid over the bench** (its own markup; panel "Home page → text"), and Carl ruled:
   *"so now the control is the text. we can work out the size and lean of the logo. when we do that we can work out its
   volume. we map the volume to the blobs"*; the camera DISTANCE and the floor's line scale are set later, together.
5. **⛔ THE LAST RULINGS** (D-101's last entry), on his view (camera pulled back, floor and walls off): *"This to me looks
   like the right scale. the logo can jump up but not move forward. its base should be on the same spot for leaning and
   upright positions. the onscreen position for the blobs to bounce off the side bar is not far."*

## NEXT — Carl's order (start here)

1. **The logo onto `/proto/marching`**: the same 2 m mesh and red metal, LEANING on the "t" of the overlaid text — its
   SIZE judged by eye against the text, at the scale Carl approved (his screenshot: the blobs ~150–250 px across, the
   cluster ~380 px wide, right of the text). Ask before bringing it (the Builder offered; Carl had not yet answered).
2. Its VOLUME from that size → the blobs' sizes MAPPED from it (no new mass).
3. Later: the camera's distance and the floor's lines (any scale); the jump (UP only, the base on the SAME spot leaning
   and upright — R-105's travel to x = −100 overtaken); the wall close on screen.
4. ⚠ **Open for Carl:** whether route B's code on the camera bench (the liquid shader, the async compile, the gate) is
   RETIRED now the example's route is taken — not asked yet. It is uncommitted and in place; the camera bench still
   runs it (`LIQUID_ON = true`).

## STATE

- **HEAD `f829572`, pushed. EVERYTHING since is UNCOMMITTED** (Carl has not said commit): the emergence (regions, the
  wobble-then-blobs start, the slowed travel 8 s, the crowd, the cold-load stand-in fix), the face-on outline (raised
  40 cm), the async compile (`bench-medium.ts`, `bench-medium-webgpu.tsx`, the gate in `hero-liquid.tsx` / `hero-logo.tsx`),
  the marching bench, `decisions.md`. Live-work files staged with `git add -f`. tsc clean; eslint clean on the files
  touched (`components/showcase/`, `app/proto/marching/`); ⚠ whole-repo `npm run lint` NOT re-run this session — run it
  before any commit (CLAUDE.md's baseline: 1 error, ZERO warnings; the earlier handoff's "2 projector.mjs warnings" is
  NOT a baseline — flag them to Carl if they show). Build a clean checkout before any push.
- **The dev server is RUNNING** (port 3000, PID 17048). **No screen recording is running.**
- **Recordings:** `Videos\C2B Films\03 The hero\01 Discussion\`: `2026-11-10_s2_discussion_screen.mkv` (fixed, 1:22:50);
  `2026-11-10_s3_discussion_screen.mkv` (raw) beside `…s3…fixed.mkv` (1:05:40) — ⚠ Carl not yet asked whether to delete
  the raw and rename the fixed (he said yes for s2's).
- **Scope:** the hero's standing exception holds (`_heroLogo9Nov`, to the end of phase 1); the marching bench's two
  files added (`_marchingBench10Nov`).

## THE STORY (Carl's, set this session; D-101)

Lean → notices the visitor → jumps (up, no forward travel) → wobble → when the wobble stops the blobs emerge from ALL of
the logo, each with its own mass, the logo masked away as they go → they amble (slow: *"showcase the wonderful geometry
and shaders and reflections"*), crowding and merging → the wall (close) → back to the middle → FILL the invisible logo
(the face-on outline: the drain reversed) → solid → gravity drops it → the floor's cell pattern REDDISH from the heat →
phase 2 the platinum blue RAIN on the logo AND the floor around it, the pattern BLUISH from the cold → phase 3 the CLOTH
moves over the STILL logo, drying it to shiny GOLD → the pointer's fireworks. Phase 4 = the floor, DURING phases 1–2.
⛔ *"its not just fancy three js for its own sake. Ours do not belong in isolation. Every frame tells a story."*

## LESSONS

- **Copy the outside element first, then adapt** (Carl): the example's own route would have avoided route B's compile cost.
- **Measure the GPU, not the frame:** `device.queue.onSubmittedWorkDone()` split JS (4 ms) from GPU (2.85 s) and found
  the instance-count clash in a few steps.
- **A probe must apply its force only once its target exists** (checks 4 and 6 forced nothing).
- **Moving a stall is not removing it** (the warm-up); Carl caught it.

---

*Written 10 November 2026, session 2.*
