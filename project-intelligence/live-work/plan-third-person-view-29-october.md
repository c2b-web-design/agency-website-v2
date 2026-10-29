# Plan: THE THIRD-PERSON VIEW and the PiP (`/proto/camera`). 29 October 2026, v1.2

**Status:** PROPOSED. Nothing built. **For:** Carl, to route to the Architect (the plan-review gate). **Builder.**
**Under:** `live-work/structural-note-third-person-view-29-october.md` **v1.3.2** (APPROVED at v1.3.1, Carl: *"Approved.
Proceed"*; its RECORD amended at v1.3.2 after this plan's review). The note holds every rule and its reasoning; this plan
says HOW, in what order, and how each step is checked. **Record:** D-104's tail, 29 October.
**Versions.** **v1.2:** the Architect's review of v1.1: *"I recommend approval"* (appended verbatim); the COST measurement
re-specified (two faults it found) and the grid's wording corrected. **The approval is Carl's.** **v1.1:** the Architect's review of v1 folded in (four must-fix, five should-fix, two minor; saved verbatim,
`architect-plan-response-third-person-plan-29-october.md`; its three library claims verified in three r185 and drei 10.7.7
first) and Carl's ruling on the PiP during a drag (*"The drag's picture"*). **v1:** the plan.
**Files:** `bench-chain.ts`, `camera-bench.tsx` (open since T1b); `bench-timeline.tsx` not expected to change;
`camera-pad.ts` read only (`BTN.RS`). Harnesses in `live-work/scripts/`.

## Step 1 — `bench-chain.ts` (pure; the chain check)

- `trackPoseAt(chain, cam, T): { pose: Pose; held: boolean; clip: Clip | null } | null` — the newest take ON `cam`'s track
  covering T (`covers`, half-open, as `sourceAt` but one track only); in a gap on that track, the last picture before T
  (`held`); before its first clip, its first picture (`held`); no clips on the track: null.
- `trackPath(chain, cam, hz = 30): Pose[][]` — that track's poses over its own playing takes, sampled every 1/hz s and at
  every edge. ⛔ **A NEW STRETCH WHEREVER THE PLAYING TAKE CHANGES, not only at gaps** (v1.1, the review's [6]): a newer
  take starting partway through an older one is a JUMP, and a line drawn across it would show a move the camera never
  makes. **In chain units**; the caller converts.
- `clipPath(clip, hz = 30): Pose[]` — one clip's own poses over its span (a SOLO of a covered take).
- **Checks (Node):** a track's pose ignores higher tracks (Cam 1 under Cam 2 → Cam 1's take); inside a track the newest
  take wins; `held` in a gap and before the first clip; null on an empty track; a path breaks at a gap AND where a newer
  take cuts in (no segment spans the jump); every clip edge sampled; a barrel's path carries its roll; `clipPath` of a
  covered take = that take's own poses.

## Step 2 — the store, `camera-bench.tsx` (`BenchStore`)

- **State:** `view: "first" | "third"` (first on load); `eye: Rig | null` (remembered under `c2b-camera-bench-eye-v1`, as
  `CAMERA_KEY`: read on load, written when changed, every 0.1 s at most); `sceneBox: THREE.Box3 | null` (handed in by the
  scene on change, for "frame everything").
- **`toggleView()`** — the pad's RS edge (`hit(BTN.RS)`) and the keyboard's T (the page's handler):
  - while RECORDING: refused, said (*"Stop first (A)"*); during a T1b DRAG: ignored (`this.edit`; the page's handler
    already returns under `editRef` — the twelfth gate).
  - **ON:** `view = "third"`; no remembered eye → `frameAll()`.
  - **OFF, in this ORDER (note review 4):** `const p = this.pipPose()` FIRST; then `if (mode === "play")
    this.stopPlay(false)`; then, if `p`, ⛔ **`this.jumpTo = p`** (v1.1, the review's [5]: `setRig` is local to `frame()`,
    so the handler cannot reach it; `jumpTo` is the existing route, applied at the start of the next frame, and carries
    the roll) and `posed = false`; `view = "first"`. An armed track with no clips: `p` is null, the rig stays.
- **`pipPose(): Pose | null`** — ⛔ during a T1b DRAG: the drag's picture (`editPicture`) (Carl: *"The drag's picture"*);
  during a SOLO play: the soloed clip's `clipPoseAt(clip, T)`; else `trackPoseAt(chain, armed, T)?.pose`; else null (the
  PiP then shows the rig, labelled *"no clips yet"*).
- **`frame(shot, eye, …)`** — ⛔ THE ONE WRITER OF EVERY CAMERA:
  - fly inputs go to `this.eye` in third person (`stepRig`, the same `FEEL`, the floor stop), to the rig in first;
  - ⛔ **THIRD PERSON NEVER MOVES THE RIG** (v1.1, the review's [4]: three branches call `setRig` today). Gated in third
    person: the drag picture's `setRig` (the drag's pose goes to the PiP instead); the PLAY branch's `setRig` (it still
    ADVANCES `T`, and a fly input does NOT stop it); the POSED branch's `setRig`. Only `jumpTo` (switching off, Home in
    first person) and first-person flying move the rig.
  - the SHOT camera object: first person from the rig (today); third person from `pipPose()` through `toWorld(units)` (or
    the rig when null) — so `CAMERA_KEY` (saved from the rig) is untouched;
  - ⛔ **the EYE camera object, ALL of it, from here** (v1.1, the review's [7]): position, rotation, lens, `near` 1, `far`
    m.d × 60, aspect from the canvas — written every frame before any draw, so it never draws with a default `far`;
  - ⛔ **roll:** `this.roll = 0` moves under the fly branch's `active` test (a recording still levels at once).
- **A in third person:** refused, said (*"Third person: right-stick click or T to go to the camera, then record"*).
- **View / H in third person → `frameAll()`**: the eye placed to see `sceneBox` whole — on a fixed bearing (front-left,
  25° down), at the distance that fits the box's bounding sphere in the NARROWER of the eye's horizontal and vertical lens
  angles (v1.1, minor), plus 10%. ⛔ **No `sceneBox` yet** (T pressed on a first visit, before the arch is measured)
  (v1.1, the review's [8]): the arch's box alone if it is measured, else the default view's position pulled back 3×.
  First person unchanged (`home()`).
- **HUD:** third person reads the PiP's pose and lens (`pipPose()`, or the rig); first person the rig (today). The view
  gains `view`, `pipLabel` (*"Cam 2"*, *"Cam 2 · clip 3 solo"*, *"Cam 2 · no clips yet"*), `soloId`, and the eye's distance
  to the arch.
- **`__cameraBench`** gains `view`, `eye`, `pip` (the PiP's pose), `rig` (to prove it does not move), `tracks` with each
  track's `trackPoseAt` and `held`.
- **The status** in third person: *"Third person · Cam 2 in the PiP · RS / T to the camera"*.

## Step 3 — the canvas, `camera-bench.tsx` (`BenchScene` and two new parts)

- **The eye's camera object:** `useState(() => new THREE.PerspectiveCamera())` in `BenchScene`, layers 0 and 1 enabled;
  mounted with the canvas, never keyed. ⛔ Every property written by `frame()` (above), none here.
- **`BenchScene`'s frame callback (priority 0):** `store.frame(shot, eye, …)`, then writes the HELPERS from the store's
  track poses (below). ⛔ **The 10 cm grid's thickness write is REMOVED from here**; the HUD's `focusPx` stays (from the
  shot camera).
- **`BenchRender` — the ONE priority-1 callback (R3F 9: takes rendering over). Before EACH draw it sets, on BOTH grids'
  materials, from THAT draw's camera:** the 10 cm thickness, and ⛔ **`worldCamProjPosition`** (v1.1, the review's [2]:
  drei's `Grid` sets it in its own callback from `state.camera` — the shot camera — and it is the point the FADE is
  measured from; seen from the eye the grid would fade round the shot camera). ⚠ v1.2: the FADE centre only — the plane
  itself moves only with `followCamera` (Grid.js:37–39), default false, never set here (v1.1 said it was the plane's centre). The projection
  is drei's own: the grid plane's `projectPoint(camera.position)`.
  - first person: the per-draw grid uniforms from the shot camera, `gl.render(scene, shot)`. One draw, as today.
  - third person: viewport = the whole canvas, scissor off; grid uniforms from the EYE; `gl.render(scene, eye)`; then the
    PiP: `setViewport` / `setScissor` with `pipRect`'s GL rectangle, scissor test ON; grid uniforms from the SHOT camera;
    `gl.render(scene, shot)` — ⛔ **relying on `autoClear`** (left on; with the scissor test on, the clear touches only the
    PiP's rectangle; no explicit `gl.clear()`, v1.1 minor); scissor test off, viewport restored.
  - the LABELS: each track's body projected by the eye camera, written straight into its label element's
    `style.transform` (refs, never React); hidden behind the eye or inside the PiP's rectangle.
  - ⛔ writes NO pose.
- **`PIP`** (one constant, exported for the overlay): `{ insetPx: 16, widthFrac: 0.25 }`; `pipRect(size)` returns the CSS
  rectangle (left 16, top 16, width W × 0.25, height H × 0.25 — the picture's own aspect) AND the GL rectangle ⛔ **IN CSS
  PIXELS, from the bottom-left: x 16, y = H − 16 − h, w, h** (v1.1, the review's [1]: three multiplies by the pixel ratio
  itself; v1's `·dpr` would scale twice). Both the scissor and the DOM frame call it.
- **`TrackHelpers` (always mounted; layer 1 on EVERY object, set by one traversal on mount and on change):** per track in
  `chain.tracks`:
  - a proxy `PerspectiveCamera` (`far` 150 cm) and a body (an unlit box 20 × 12 × 26 cm and a lens cylinder,
    `MeshBasicMaterial`, `toneMapped` false) — the body a CHILD of the proxy, so they move together;
  - ⛔ **its `CameraHelper` mounted at the SCENE ROOT, never under a moving parent** (v1.1, the review's [3]: it takes the
    proxy's world matrix as its own with `matrixAutoUpdate` off, so a moving parent would apply twice and the frustum
    would draw away from the body). After writing the proxy: `proxy.updateMatrixWorld()`, then (lens or aspect changed)
    `updateProjectionMatrix()`, then `helper.update()`;
  - its path: drei `Line`s (one per stretch) through `trackPath(...)` converted by `toWorld(chain.units)`, ~2 px. ⛔
    Nothing drawn while `chain.units` is null. The solo's path (`clipPath`) drawn while `soloId` is set.
  - the armed track's colour full, others at 70%; `held` at 35%.
  - each proxy registered in a ref map the frame callback writes (position, YXZ rotation with the roll, lens).
- **`sceneBox`**: `BenchScene` computes it with a `useMemo` on `[world, chain]` (the arch's box ∪ every path's points) and
  hands it to the store (`store.setSceneBox`). One derivation.
- `BenchScene` gains the `chain` prop (React's committed chain — the paths derive from it, on change).

## Step 4 — the overlay, `camera-bench.tsx`

- **The PiP frame:** a DOM box over `pipRect`'s CSS rectangle: a 1 px border in the armed track's colour and the
  `pipLabel` in its corner; third person only.
- **The labels' layer:** one absolutely-positioned element per track (`Cam N`, its colour), `pointer-events: none`,
  written by `BenchRender`.
- **The HUD:** the `Third person` mark, the PiP camera's position and lens, the eye's distance to the arch.
- **The Controls drawer:** *"Right-stick click / T — third person on and off"*; in third person *"View / H — see the whole
  scene"*.

## Step 5 — checks

- **`bench-chain-check`** (Node): Step 1's list.
- **`camera-bench-verify`** (Playwright, dev server; a seeded chain: Cam 1 0–6 s, Cam 2 2–5 s on top, a covered Cam 1
  take cut in at 3 s, a barrel shape on Cam 1):
  1. T on → `view` third; the eye seeded by `frameAll` (the scene box inside its frustum); T off → first. T on a FIRST
     visit before the arch is measured: the fallback, no error.
  2. RS edge (the fake pad) toggles; refused while recording (said); ignored mid-drag.
  3. In third person the pad flies the EYE; ⛔ **the RIG and `CAMERA_KEY` unchanged through a fly, a PLAY, a scrub (posed)
     AND a trim DRAG** (v1.1); a fly input during X does NOT stop play; during the drag the PiP = the drag's picture.
  4. A refused in third person (the status names RS and T).
  5. **The PiP shows the ARMED camera** with Cam 1 armed under a playing Cam 2: `pip` = Cam 1's `trackPoseAt`.
  6. **Switch off with Cam 1 under Cam 2 HOLDS Cam 1** over 60 frames, still and MID-PLAY (play stopped).
  7. **A SOLO of the covered take:** `pip` = that take's `clipPoseAt`; switch off mid-solo lands on it (the order).
  8. **Switch off mid-barrel KEEPS the roll** until a fly input.
  9. **No helper pixel in first person or in the PiP:** a frame with the helpers in a loud colour against a frame with them
     unmounted (a harness switch) — identical in first person; identical inside the PiP's rectangle. ⛔ **Run at a pixel
     ratio of 1 AND of 2** (v1.1, the review's [1]: a ratio of 1 cannot see a doubled scale).
  10. **The PiP's framing = the first-person view of the same camera:** the PiP's pixels against the first-person frame
      after switching off, downscaled to the PiP's size, grid OFF. ⛔ **PASS MARK, stated now (v1.1, the review's [9]):
      mean absolute difference ≤ 8 / 255 per channel** (a smaller render and a downscaled one differ in antialiasing; a
      wrong camera or a misplaced rectangle differs by far more). **Also at a pixel ratio of 2**, and the PiP's rectangle
      found where `pipRect` says.
  11. **First person unchanged:** frames before and after the build at three playhead moments, grid on, pixel-identical
      (the baseline captured from `5b95fdb` before Step 3 lands).
  12. The labels track the bodies during play (a label's position against the body's projection, same frame).
  13. The grid seen from the eye FADES round the EYE (its `worldCamProjPosition` = the eye's projection on the floor during
      the eye's draw, the shot camera's during the PiP's) (v1.1, the review's [2]; v1.2: the fade centre only).
  14. A path does not span a take's cut-in (no segment from the covered take's pose to the newer take's) (v1.1).
  15. HUD in third person reads the PiP's camera; the eye remembered across a reload.
  - ⚠ **NOT WATCHED:** how flying the eye feels (Carl's hands); a client film (D-105's route is not built).
- **THE COST (the checkpoint, before Carl approves the take) — re-specified v1.2 (the review of v1.1, [1] and [2]):**
  - ⛔ **MEASURE THE WORK, NOT THE INTERVAL.** The time between animation frames is tied to the screen's refresh rate (on
    60 Hz it sits at ~16.7 ms with jitter, so v1.1's line would FAIL an idle GPU; on 144 Hz it would PASS while dropping
    frames). Instead: (a) the GPU's time for `BenchRender`'s draws by timer query (`EXT_disjoint_timer_query_webgl2`, a
    query round each frame's draws, results read when available, disjoint frames discarded) where the extension exists;
    (b) the CPU time of the render callback (`performance.now()` around it) always; (c) DROPPED FRAMES against the
    screen's MEASURED refresh rate (the median interval over 2 s idle first), as a cross-check. Each over 10 s of play,
    first person against third person.
  - ⛔ **THE RENDERER RECORDED BESIDE EVERY NUMBER** (`WEBGL_debug_renderer_info` → `UNMASKED_RENDERER_WEBGL`). ⛔ A
    SOFTWARE renderer (SwiftShader, WARP, llvmpipe) = **a FAILED MEASUREMENT, reported as such, never a result** (memory:
    Carl's own Chrome on d3d11-warp, 3 October). The harness runs headed with the GPU flags it already uses.
  - ⛔ **PASS LINE, stated now:** third person's GPU time (or, without timer queries, its CPU render time) at the 95th
    percentile **≤ half the measured refresh interval** (≤ 8.3 ms on 60 Hz — headroom for the rest of the frame), AND
    **third person drops no more frames than first person** over the same 10 s (± 1%). Over either: the numbers reported
    plainly and Carl judges by eye — never passed silently.
- `tsc`; `npm run lint` at the baseline; the control-byte scan.

## Order and checkpoint

Step 1 → its Node checks. The first-person BASELINE captured (check 11) from the current code. Then Steps 2 + 3 + 4
together (the store, the canvas and the overlay depend on each other). Then Step 5. **Checkpoint:** the dev server
stopped by PID; the cost and one image of third person to Carl (one take, its own folder). Carl flies it.

## Not in this plan

Flat views (top, side); a focus-object chooser; the speed spline; signature moves; R2; stills in gaps; an overlay switch
button.
