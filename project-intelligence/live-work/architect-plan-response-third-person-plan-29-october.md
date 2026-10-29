# Architect's review: plan, the third-person view (v1). 29 October 2026

**Source:** pasted by Carl, saved verbatim. **Verified by the Builder in the installed source before folding in:**
three r185 `WebGLRenderer.setViewport` / `setScissor` multiply by the pixel ratio themselves
(`_currentViewport.copy( _viewport ).multiplyScalar( _pixelRatio )`); drei 10.7.7 `Grid` centres its fade on
`worldCamProjPosition`, projected from `state.camera` in its own `useFrame` (Grid.js:70, :107–112) — ⚠ **corrected after
review 2:** this line first read *"shifts its infinite plane and centres its fade"*; the plane moves only with
`followCamera` (Grid.js:37–39), default false and never set by the bench — an overclaim in the Builder's verification;
`CameraHelper` takes `this.matrix = camera.matrixWorld` with `matrixAutoUpdate = false` (CameraHelper.js:133–134). All
three hold. **Carl's word on item 4 (the Builder's question dialog, verbatim choice):** *"The drag's picture
(Recommended)"*. **Folded in:** the approved note's RECORD amended (v1.3.2: items 1 and 2, and the drag ruling — not a
reopening); the plan as v1.1.

---

I've found two real bugs in the plan, both checked in three's and drei's source. Now checking the rest of the scene for other per-camera updates.

  Searched for 2 patterns

Architect review: third-person view plan, v1

Verdict: send it back as v1.1. The steps and their order are right, the five-step split is sensible, and the checks are thorough. But three of the defects below would ship wrong pictures. Two of them came through my own reviews of the note, so the approved note needs amending as well as the plan.

Resolved: T1b is committed (5b95fdb, in .git/logs/HEAD), so the harness's first-person baseline exists. That closes my earlier aside.

Must fix

1. The PiP would land in the wrong place, at the wrong size, on any high-density screen.
   - three's setViewport and setScissor take CSS pixels and multiply by the pixel ratio themselves (WebGLRenderer.js:808, :845).
   - The plan's x = 16·dpr, y = (H − 16 − h)·dpr would therefore be scaled twice. At a pixel ratio of 2 the PiP comes out twice the size and in the wrong position.
   - Fix: pass CSS pixels, counted from the bottom left: y = H − 16 − h.
   - The note's "in drawing-buffer pixels" (§2) has the same error. It came in from my v1.1 finding [11] and I didn't catch it, so the approved note's record needs the same correction.
   - A harness at a pixel ratio of 1 won't see this bug, so run check 9 or 10 at a ratio of 2 as well.
2. The floor grid would fade around the shot camera when seen from the eye.
   - drei's Grid runs its own priority-0 frame callback, which sets worldCamProjPosition from state.camera, the default camera, which is the shot camera (Grid.js:107–113).
   - That uniform is the centre of the fade (:70–72).
   - The plan sets the line thickness per draw but not this, so in the eye's view both grids fade around wherever the shot camera stands.
   - Fix: BenchRender sets worldCamProjPosition on both grid materials before each draw, from that draw's camera, the same way it handles thickness.
   - This was missing from the note's §5b table, and I missed it in four reviews, so the table needs a row for it.
3. The camera frustums would be moved twice.
   - CameraHelper sets its matrix to the camera's world matrix and turns automatic updates off (CameraHelper.js:133–134).
   - In the plan the helper sits inside a group that is itself moved, so the group's transform gets applied on top of the camera's. The frustum would draw well away from the camera body.
   - Fix: mount the helpers at the scene root, or under a parent that never moves. Update each proxy camera's world matrix before helper.update().
4. Third person still moves the rig in three places. The plan says the rig doesn't move in third person, but three branches of frame() call setRig regardless:
   - the T1b drag picture (camera-bench.tsx:743–744);
   - the play branch (:749–750);
   - the posed branch (:755–757).

   The plan must gate all three in third person: the play branch still advances T but doesn't set the rig. It also has to say what the PiP shows during a trim or move drag. Builder's default to state, for your confirmation: the PiP shows the drag's picture, as first person does today, and the rig stays where it is. Check 3 should run a drag as well as a play.

Should fix

5. Switching off can't call setRig directly. It's a local function inside frame() (:674), so the key handler can't reach it. Use the existing route instead: this.jumpTo = p. It's applied at the start of the next frame and carries the roll.
6. The camera paths would show moves that never happen. trackPath should break wherever the playing take changes, not only at gaps. A newer take that starts partway through an older one is a jump, and a line drawn across that jump shows a move the camera never makes.
7. The eye camera's starting far of 1 means it draws nothing on its first frames. Set near, far and the lens in frame(), which the note makes the one writer, rather than in an effect.
8. frameAll() can run before sceneBox exists, for example by pressing T on a first visit. The plan needs a fallback: frame the arch alone, or use the default view.
9. Write the pass marks down before measuring. Check 10's "stated bound" should be stated now, not chosen after the measurement. The cost check needs a pass line too, for example third-person 95th percentile under 16.7 ms, or a statement that you judge it by eye.

Minor

- frameAll should fit the scene into the narrower of the horizontal and vertical lens angles.
- With autoClear on, the second render already clears inside the scissor, so the explicit gl.clear() is redundant. Say which one the plan relies on.

Item 4's drag default needs your word. The rest are corrections for the Builder. Must-fix items 1 and 2 also mean the approved note gets amended. That's amending the record, not reopening the design.

---

# Review 2: plan v1.1. 29 October 2026

**Source:** pasted by Carl, saved verbatim. **The Architect recommends APPROVAL; the approval is Carl's.** Its minor point
verified (drei `Grid` moves the plane only with `followCamera`, default false, never set by the bench). **Folded in as plan
v1.2** (the cost measurement re-specified; the grid wording) and the note's record (v1.3.3, wording).

---

Architect review: third-person view plan, v1.1

Verdict: I recommend approval. All four must-fix and five should-fix items are folded in correctly, and so are both minor ones. I checked the new text against the code:
- The rig: only home() sets jumpTo (camera-bench.tsx:454). With View/H mapped to frameAll() in third person, the three gated branches really are the only other places the rig moves, so "third person never moves the rig" holds.
- The PiP rectangle: now passed in CSS pixels, and checks 9 and 10 run at pixel ratios 1 and 2.
- The camera frustums: the helpers are at the scene root, and the proxies' matrices are updated before helper.update().
- The grid: worldCamProjPosition is set per draw, and check 13 covers it.
- The paths: they break at take cut-ins, and check 14 covers it.
- Your drag ruling is in pipPose(). Check 3 now proves the rig doesn't move through a fly, a play, a scrub and a drag.

The cost check has two measurement faults. They don't affect the design or the build, but they need fixing before the checkpoint, or the numbers you're shown won't mean anything.

Fix before the checkpoint

1. The cost pass line would fail on a healthy machine.
   - Frame time measured between browser animation frames is tied to the screen's refresh rate.
   - On a 60 Hz screen the interval sits at about 16.7 ms with natural jitter, so a 95th percentile ≤ 16.7 ms fails even when the GPU is idle.
   - On a 144 Hz screen the same line passes even when frames are being dropped.
   - Fix: measure the work, not the interval. Time the render callback, and use the GPU's timer queries (EXT_disjoint_timer_query_webgl2) where available. Alternatively, count dropped frames against the screen's measured refresh rate. Compare first person with third person either way.
2. The test browser may not be using the GPU. Playwright's Chromium, especially headless, often falls back to SwiftShader, which is software WebGL. Then the cost numbers say nothing about your machine. Fix: record the renderer string (UNMASKED_RENDERER_WEBGL) next to every number, and report a software renderer as a failed measurement, not as a result. This is the same software-WebGL problem your memory from 3 October records for your own Chrome.

Minor (wording)

- worldCamProjPosition only sets where the grid fades from. The plane is moved only when followCamera is on (Grid.js:37–39), and it's off here. So "the point the infinite plane is centred on" (Step 3) is wrong, and check 13 should test the fade centre only. The fix in the plan is still right.

With 1 and 2 fixed before the checkpoint, nothing stands in the way of the build. The approval is yours.

---

# Review 3: plan v1.2. 29 October 2026 — and CARL's APPROVAL

**Source:** pasted by Carl, saved verbatim. **Carl, the same message: *"Approved. Proceed and implement."*** The
checkpoint note (CPU render time understates the GPU's cost; without timer queries the dropped-frames comparison carries
the verdict; the report says whether the extension was present) is carried into the checkpoint as written.

---

Architect review: third-person view plan, v1.2

Verdict: I recommend approval. Both cost-check faults and the wording point are fixed:
- What's measured: the work, not the interval. GPU time where timer queries exist, CPU time of the render callback always, and dropped frames against the screen's measured refresh rate as a cross-check.
- The renderer: recorded beside every number, and a software renderer counts as a failed measurement.
- Pass lines, stated in advance: half the refresh interval, and third person drops no more frames than first person.
- The browser really is headed with GPU flags. I checked: camera-bench-verify-26-october.mjs:15 launches with headless: false, --enable-gpu, --use-angle=default, --ignore-gpu-blocklist.
- The grid: now described as the fade centre only, in Step 3 and check 13.

One note for the checkpoint (it doesn't block approval): without timer queries, the CPU render time only measures how long it takes to send the draws. gl.render returns before the GPU has done the work, so that number will understate the cost of the second draw. If the extension is missing, the dropped-frames comparison has to carry the verdict, and the report should say whether the extension was present so the numbers are read correctly.

The plan has been through the gate. The approval is yours.
