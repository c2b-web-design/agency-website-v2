# Review 8 — the Architect on the reflection note v1.5 (9 November 2026, session 2)

**Subject:** `structural-note-hero-logo-reflection-9-november.md` v1.5. **Routed by Carl.** Pasted into the Builder's
session by Carl and saved verbatim below. **Builder's check (same day):**
- Findings 1, 3, 4 and 5 were confirmed in code.
- Finding 2's facts are confirmed (the effect's deps, `onReady` once), but its hazard is **disputed with source** in v1.6:
  `fromScene` has no await, and `Renderer.compileAsync` restores state before its first await.
- The Q7 aside was **measured**: the hemisphere's sky direction on the page is (0, −0.9993, 0.0374), i.e. straight down.
  Reported to Carl.

---

v1.5 is a faithful answer to review 7. All nine findings are addressed, and none was softened. The new frame fix (R7-5) is correct as written. One new item would break the build, though, and two of the controls need tightening before any numbers exist.

New findings on v1.5

1. HeroStage in hero-page.tsx creates a circular import that crashes when the bench loads.
Right now hero-page.tsx imports only React (:3). hero-logo.tsx and hero-text.tsx both import from it (hero-logo.tsx:10, hero-text.tsx:8). hero-logo.tsx also reads HERO_CAMERA and HERO_TEXT_PLACE the moment it loads (:42–51, :71). If hero-page.tsx imports HeroLogo to build the stage, here is the sequence:
- camera-bench.tsx:35 loads hero-page first.
- hero-page then loads hero-logo before its own constants exist.
- hero-logo reads HERO_CAMERA and gets an error or undefined at load.

Fix: put HeroStage in camera-bench.tsx. It already imports all three modules (:35–38), it's in open scope, and no new file is needed. The §5b table should also get a row for the import graph.

2. The gate on onReady covers only the first compile (Q9).
The arch's compile-wait effect runs again whenever gl, scene, camera, metal or built changes (lettering-piece.tsx:311). But onReady fires only once (:314–320). So a later capture, after a pose change, can still overlap a fresh compileAsync.
- My answer to Q9: not enough on its own. Either the note says plainly that later captures are unguarded, or Q3 (stop mounting the arch on ?blank=1) is the real fix. Q3 changes the arch's lifetime, so it's Carl's decision.
- Threading the ready signal also adds a prop from the bench's outer component (setDrawn, camera-bench.tsx:1971) through BenchScene to the stage. Neither the table nor the file list shows that.

3. The null control's negative check tests the wrong failure (measurement 1, Q12).
The worry behind it is a sign flip. A sign flip would turn the background to −150°, not 0°. Leaving it at 0° only proves the tolerance can spot a missing rotation.
- Use −150° as the negative.
- State the margin in absolute levels (e.g. mean ≥ 5.0). "5× the mean" has no fixed reference: 5× a measured mean of 0.1 is 0.5, which proves nothing.

4. The negative control (measurement 4) is ambiguous in the lean, and "none" is too strict.
Both of the lean's broad sides are flat. The back faces the text and rests on the t, so the text is expected to show there. The note should name the front face: the mesh's +Z side, which faces world +X in the lean.
- At roughness 0.4 the reflection is blurred over a wide angle, so some of the text's light will reach the front face's edges.
- Give it the same threshold as the positive control (no pixel above 4 levels), or it will fail on noise and invite exactly the after-the-fact reinterpretation the note is guarding against.

5. The WebGL bench needs an explicit switch (Q11).
I agree with leaving WebGL on step 1. But HeroLogo can't tell the two benches apart from pmrem, because both generators will have fromScene. The note should say what it branches on. For example, the presence of medium.heroText, or an explicit prop.

Answers to the round-2 questions

- Q2, the text's material in a second scene: no new hazard. Render objects are cached by object, material, render context and lights (RenderObjects.js:96–99). The copies are separate meshes in a separate scene, so they get their own variants. setup reads the MRT while it builds, and the capture builds while no MRT is set. The only remaining hazard is the async-compile overlap in finding 2.
- Q7, the lights copied in the page's frame: sound. Copying the parent's matrixWorld reproduces both lights exactly.
  - Separate thing on the page (not caused by this note; for Carl to decide): three takes the hemisphere light's sky direction from its world position: lightPosition(light).normalize(), HemisphereLightNode.js:44, Lights.js:88. Inside the offset group that position is (0, world.floor + 1, world.z1), not straight up. If world.floor is well below zero, the text's sky and ground colours are tilted or even swapped on the page today.
  - I haven't checked the actual value. It's worth logging world.floor and world.z1 once.
- Q10, HeroStage against onBuilt: HeroStage is the better design, but it belongs in camera-bench.tsx (finding 1). The rest of the §5b table holds, apart from the import graph and the ready prop.
- Q12, the tolerances: mean ≤ 1.0 and 99.5th percentile ≤ 6 are plausible for comparing a background drawn on a sphere with one computed exactly, but they are unmeasured. Accept them as proposed, with the changes in findings 3 and 4.
- Q1, Q3, Q4: unchanged from review 7. On Q3, finding 2 makes stopping the arch's mount on ?blank=1 more attractive.

Everything else I re-checked holds:
- WebGL's fromScene is at :109.
- The capture position from the bounding-box centre is correct in the lean too.
- The note credits its findings to the right review.
