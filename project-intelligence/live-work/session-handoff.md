# Session Handoff — 9 November 2026 (Monday). THE TEXT GLOWS; THE LOGO IS RED METAL; PHASE 1's STORY IS SET

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Replaces the 8 November handoff. Delete it at the end of the
session that reads it, once its replacement is written. **The record:** D-101 in `decisions.md`, from *"THE DETAILS SESSION
— THE TEXT AND THE LOGO's SIZE (9 November 2026)"* to the end. Every beat is there with Carl's words.

## STATE AT CLOSE

- **Everything is committed and pushed.** The dev server is STOPPED (port 3000 free).
- **The film 3 capture is STOPPED:** `Videos\C2B Films\03 The hero\01 Discussion\2026-11-09_discussion_screen.mkv`, 4 h 01,
  remuxed after the stop to restore its duration.
- **The scope is OPEN on Carl's word** (*"keep open until i ask you to close. Then lock and test"*). Open since today:
  `hero-logo.tsx`, `camera-bench.tsx`, `hero-page.tsx`, `hero-text.tsx`, `bench-medium.ts`, `bench-medium-webgpu.tsx`,
  `hero-text-material.ts`, `hero-bloom.ts` (the `_heroLogo9Nov` entry in `chunk-scope.json`). **Do not close them
  without Carl.**
- Carl moved his reference folder: `OneDrive\Pictures\Hero Section` is now `Videos\C2B Films\03 The hero\Hero Section`.

## WHAT IS ON THE BENCH (`/proto/camera?blank=1`, now WebGPU by default)

- **The page camera: the arch's 30° vertical angle** (33 mm on the page frame, 8.7 m from the text). APPROVED (R-103).
- **The text: EDGE-LIT ICE ACRYLIC** (`hero-text-material.ts`): #CFE6FF, satin faces, a Fresnel emissive on the bevels.
  Carl: *"a great contrast"*.
- **The text's GLOW, a selective bloom** (`hero-bloom.ts`): note v1.3, approved after four Architect reviews, plus a build
  report the Architect reviewed. Carl: *"The glow looks great"*. The glow mask is written only by the text (Carl:
  *"Having 2 glowing objects is a bit much"*).
  - **Measured:** identity exact (with the lines' alpha-to-coverage off); halo clean; the logo unlit by it; +1.3 ms GPU; a
    ~500 ms first-frame compile, accepted as known.
  - Standing check: `live-work/scripts/hero-bloom-measure-9-november.mjs`.
- **The logo: 2 m, /about's desk-mark geometry** (`hero-logo.tsx`).
  - Volume **70,085 cm³ (~70 L)**, **7.6 cm thick** (measured; an earlier "4.9 cm" was wrong).
  - Two poses: **upright** (balanced, APPROVED, now mounted) and the **lean** (12.5°, on the t's crossbar tip, APPROVED,
    R-103).
  - **Material STEP 1:** the button family's metal in the blobs' red: #9c0000 as F0, metalness 1, roughness 0.4, the
    family's HDRI (room 0.1, 150°), through the seam's new `pmrem`. It measures #4e0000 / #731712 against the blobs'
    sampled #460000 / #700f08. Carl: *"looking good so far"* — **NOT approved.**

## NEXT — CARL's PLAN

1. **STEP 3: the glowing TEXT in the logo's reflection.** Design: `live-work/structural-note-hero-logo-reflection-9-november.md`
   v1.3. Carl said *"apply the metal and reflection"* after reading it; no Architect round yet.
   - **Then Carl redirected to the BUTTON's studio:** the capture's background is the **family HDRI**, NOT the desk mark's
     formers (v1.3 still says formers, so amend it).
   - The mechanism: one `fromScene` capture at the logo's position, of the studio plus the text (as second meshes sharing
     its geometry and material). The logo is never in its own capture. Captured when the body moves, not per frame.
   - Expectation stated: the text reads as bright edge-lit shapes, not words, at 256 px.
   - **Carl builds substantial code in a FRESH session: this is that build.**
2. **Then the LEAN:** switch the mount to `pose="lean"` and judge it.
3. Later, raised by Carl:
   - a **solid/liquid side-by-side bench** (*"They have to look the same, only the state should of changed"*);
   - the colour **compared at the END of the process**.

## PHASE 1's STORY — SET TODAY (D-101)

- **One red body, no new mass:** solid (the lean) → liquid → solid.
- The blobs **emerge from the logo almost at once on the uncomfortable landing**, taking all its mass.
- They travel **right**, **bounce off the unseen right wall a few times** (as in the reference film), **gather in the
  middle, form the logo IN THE AIR**, and it **falls to the floor**. The landing is more balanced, but it HITS: it lands
  on the spot the lean was jumping toward.
- **Blobs: few and UNEQUAL**, one LARGER one (it shows the reflection), not many bubbles. A take: 50/20/15/10/5 % → Ø ~41,
  30, 27, 24, 19 cm.
- ⚠ **Metaballs do NOT conserve volume.** Merging inflates, so the 70 L must be HELD (measured each frame, strengths
  scaled).
- Their movement mirrors the film's fixed paths.
- **Reflections:** the liquid smoother (sharp, the text clear), the solid rougher. **Roughness is the dial.**

## THE CAMERA — LATER (D-101; memory `project_hero_camera_layer.md`)

- The story is animated from the **FIXED page camera first**. The moving camera is a later layer on top.
- Raised for that layer: a quick **push-in along the subtext, L→R, with speed ramps**, possibly **oblique** (the logo
  seen behind it); and a **speed spline editor** on the bench.

## OPEN — WITH OWNERS

- **The reflection note:** amend it to the family HDRI, then build (Builder; an Architect round if Carl routes it).
- **Marching cubes under WebGPU:** still unproven. Prove it before the liquid (Builder).
- **The glow's dials** (strength 0.45, radius 0.35) are takes. In the lean, the text's glow WILL visibly light the logo
  (measured reach). That is Carl's judgement there; radius is the dial.
- **[R4]:** the glow-attachment selection check, to be built before the lean (Architect, build review).
- **Lint:** the accepted error plus **2 warnings in `live-work/hero-concept-8-november/projector.mjs`**, committed 8 November.
  Reported, not touched; Carl's call.
- **Phones:** the glow's cost is unmeasured there (D-108).

## LESSONS (this session)

- **Do the homework before a structural note** (Carl: *"before i send that i want you to do your homework"*): read the
  reference's SOURCE, watch its film, and read our own code. It overturned the first note: the reference reflects a photo,
  not the scene, and the desk mark's studio is lit panels.
- **Measure before asserting.**
  - A font scale error (glyphs 1.39× too large) gave Carl a wrong text height; the bench exposed it.
  - "4.9 cm thick" was calculated from source units; the mesh measured 7.6.
  - The glow's identity check caught two wrong composites of the Builder's own.
- **A null control first, then the negative control.** The identity failure was real (null 0/0), and it was bisected to a
  three r185 quirk (`currentSamples` 0 on the frame-buffer target) rather than reclassified. Carl: *"We should always
  track down and fix problems. casles made on sand have weak foundations."*
- **Async compile in three reads the LIVE renderer state.** `PassNode.compileAsync` blanked the bench; there is no
  precompile while anything else draws. A material's `mrtNode` on a target without MRT wipes it, and with tone mapping on,
  every plain draw is such a target.

---

*Written 9 November 2026.*
