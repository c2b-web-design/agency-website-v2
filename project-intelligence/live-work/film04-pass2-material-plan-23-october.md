# Plan: Film 4, the showcase. PASS 2: the material — brushed brass on "Your company" (D-088). VERSION 2.1

> **Status: v2.1, 23 October 2026 — the Architect: *"ready for Carl's approval"*** (table C: one non-blocking note, carried
> into the build). v1 was reviewed by the Architect: *approve once four amendments are made*, plus nine
> recommendations (table A). v2 was reviewed: *approve, with two small amendments that can go in without another round*,
> plus one ruling for Carl and four notes (table B). Both amendments, all four notes and Carl's ruling are in. The Builder
> checked every code reference before amending; all held (v2's precedent `answer-card-canvas.tsx:3715–3731` included).
> ⚠ **Nothing is built until Carl approves this version.** On approval this file is copied to
> `live-work/film04-pass2-material-plan-23-october.md`, and all four Architect responses (v1, v2, v2.1, and v2.1 with table C) are saved as
> `live-work/architect-plan-response-film04-pass2-23-october.md`, **the Builder's transcription of what Carl pasted** (§2.5: the
> Architect's window is the authority if the two differ). Plan mode allows no other file, so both wait for exit.

## Context

Film 4's showcase holds **two pieces** (Carl, 23 October): **"Your company" as one straight line** (R-088, smoothed walls
R-091) and **"Your company logo" as the round-headed arch** (R-090), both somewhere in the two viewports (not placed yet).
**Materials go on ONE PIECE AT A TIME, the line first.** Passes run mesh → material → light, each judged by eye.

**Ruled (Carl, 22–23 October):** an established, higher-end restaurant; **brushed brass leads** (gold leaf later); the grain
**HORIZONTAL** along the reading line; **a BRUSHED FACE with a POLISHED EDGE**. The **tone stays open, set on screen**. The
material is a **part of `LetteringSpec`** (a client's swap is data, not code). **The standard:** the logo is the metal
standard — a studio's REFLECTION, not paint under lamps (15 October). §14a: start from the physics; prove one object first.

## What already exists and is reused

| Existing | Use |
|---|---|
| `lib/studio-hdri.ts` `loadStudioHdri(url, room)` — Monochrome Studio 02, one fetch per page | **The judging studio**, read as is. ⚠ **Cost (Architect 8):** each `room` value caches its own ~8 MB float copy plus a PMREM, never freed (`studio-hdri.ts:37`); so the room dial applies **on release**, not per tick — the corner bench accepts the same cost. |
| `components/home/corner-material.ts` — a LOOK object (`roughness, envInt, yaw, room, …`) built into a material, F0 set with `setRGB(…, LinearSRGBColorSpace)` | **The precedent `createBrushedMetal` follows** (Architect 7), including the **strength** dial (`envMapIntensity`): without lamps it is metal's brightness control — the blue corners needed 2. |
| `MeshPhysicalMaterial` `anisotropy`, three **r185** | **The brushing.** Without a `tangent` attribute the frame is built from `vUv` (`normal_fragment_begin.glsl.js:30–36`; the UV varying exists under `USE_ANISOTROPY` with no maps, `uv_pars_fragment.glsl.js:2`). The text geometry has UVs. ⚠ `about-card-glass.ts:491` records anisotropy as *"NEEDS A tangent ATTRIBUTE"* — stronger than the shader supports. **If step 1 proves the wiring, that record is wrong: flagged to Carl, NOT edited in this chunk** (outside its files). |
| Three's text geometry: each SHAPE adds a FACE group (materialIndex 0) and a SIDES group (materialIndex 1 — walls and chamfer together), `ExtrudeGeometry.js:65–68, 626, 650` | **The brushed face / polished edge split comes free** — the sides polish together, which is what "polished edge" asked. ⛔ **Split by `materialIndex`, never by group position** (Architect 1): a glyph of two shapes ("i", "j", ":", "!", "%") gives groups 0,1,0,1. ⚠ Corrects the Builder's word to Carl that the chamfer needed separating by angle. |
| `GOLD_F0_LINEAR`'s method (`logo-mark-material.ts`): the metal's measured reflectance, linear | **Brass F0 from physics**, starting value linear ≈ (0.910, 0.778, 0.423) (physicallybased.info). ⛔ **A second source is checked BEFORE step 1 writes the value into code** (Architect B note); a disagreement goes to Carl, not averaged. |
| Texture filtering `anisotropy = 8` (`card-etch.ts:300`, `answer-card-mesh.tsx:1943`) | **The grain texture's filtering** against moiré at the oblique view (Architect 9). ⚠ The name clashes with the MATERIAL's anisotropy — commented at both. |

## Decided in this version

- **Tone mapping: NEUTRAL in "material" mode — A JUDGING CHOICE ONLY** (Architect A4; ✔ **Carl, 23 October: "Judging choice
  only"**). The buttons — the metal standard's family — render under `NeutralToneMapping` (`whoweare-button-scene.tsx:626`);
  the bench and the corners use R3F's default ACES, which shifts yellows. **The page's tone mapping is NOT decided here — it is
  pass 3's**, not inherited from this chunk (Neutral for the metal and ACES kept were raised and not chosen). **The clay modes
  keep ACES**, so their frames stay the regression baseline. ⛔ **The switch is PROVEN, not assumed** (Architect B1): a
  changed Canvas `gl` prop may not reach a renderer that already exists, so the mode sets `gl.toneMapping` in an effect,
  RESTORES the previous value on leaving (the save/restore precedent, `answer-card-canvas.tsx:3715–3731`) and calls
  `invalidate()` (the bench is `frameloop="demand"`).
- **The studio is NOT a spec part** (Architect 6): a judging fixture lives in bench state and URL switches, so it cannot
  become a client part by inertia. `LetteringSpec.material` alone is the part.
- **The arch in "material" mode shows CLAY** with a plain-words note — one piece at a time (Architect 12).
- **The line's build keys on its GEOMETRY fields only** (Architect 3) — words, font, size, tracking, depth, edge, curve
  segments, crease — as the arch's `shapeKey` does (`showcase-bench.tsx:390`); today the line's build depends on the whole
  `spec` (`:384`), so a material slider would re-extrude 13,676 triangles a tick.

## The build — five steps, each shown before the next

**Step 0 — the baseline and the prediction.** (a) Capture today's frames BEFORE any code moves (Architect 11): the line and
the arch (take 8), clay, front and oblique, every mode — the regression baseline. (b) Measure the studio HDRI's softbox
azimuths and **predict the yaw** that puts a softbox in the face's reflection, front and oblique (Architect 5) — at room 0.1
a flat metal face is lit only where a softbox reflects; the buttons' 150° was tuned on curves. ⛔ **Backed by a sweep**
(Architect B note): the face's mean luminance at 15° yaw steps, oblique view — three's equirect mapping and
`envMapRotation`'s sign make a paper prediction easy to miss by 90° or 180°, so step 1 starts from a MEASURED yaw.
(c) **The oblique view is a FIXED POSE for every harness** — a URL switch for the camera (`?cam=`), the pose named in each
output, so "the same view" across two renders is guaranteed (Architect B note).

**Step 1 — prove the dials reach the shader.** A plain brass on the line, in the studio, **at the OBLIQUE view, at a yaw
where a softbox edge falls in the face's reflection** (Architect 2 — front-on, a flat face reflects nearly one direction and
the anisotropy only blurs a uniform patch). ⛔ **The prediction is written first:** under three's convention the highlight
stretches along the tangent (+x here), so VERTICAL streaks — across the horizontal grain — need rotation π/2. ⛔ **The red
run:** rotation 0 vs 0 must report difference 0 (the comparison is not measuring noise). Then 0 vs π/2, anisotropy 0 vs 0.8,
yaw 0 vs 180 must differ — **and** a count of NaN/black pixels (a broken tangent frame also "differs") **and** the
highlight's x/y spread, so its ORIENTATION is measured, not assumed.

**Step 2 — the face and the edge.** The line's merged geometry keeps two groups (Files): the face BRUSHED (anisotropy on, the
rotation step 1 confirmed), the sides POLISHED (low roughness, no anisotropy). ⚠ **Carl's expectation (Architect 13):** the
polished edge is a ~3 px chamfer front-on at 160 px — it is judged mainly at the OBLIQUE view, and the 10° crease already
softens it at the A and Y.

**Step 3 — the grain.** A generated canvas texture of fine horizontal streaks as the face's `roughnessMap`; its pitch in EM (a
part), so it scales with the client's size. ⚠ **UVs are in px** (`generateTopUV` returns the shape's own x, y), so the
repeat is 1/(pitch in px). ⚠ **A pitch below ~2 device px mips away to an average** — that floor is shown on the slider, **computed from the current
dpr and framing** (the camera's zoom), not stored as a fixed em value (Architect B note).
⛔ **One sheet across the word:** each letter's face UV is offset by its place, so after the offset **face uv = position.xy
exactly** (Architect 10) — the streaks run continuously through "Your company", as if cut from one brushed plate.

**Step 4 — Carl's eye.** Sliders: tone (0 physical brass → 1 pale satin, toward its own luminance), strength, face roughness,
anisotropy, grain pitch and contrast, edge roughness; the studio's room (on release) and yaw. ⚠ Starting values, not tuned:
face roughness ~0.35, anisotropy ~0.8, edge roughness ~0.12, strength 1, room 0.1, yaw from step 0's prediction.

## Files

- `components/showcase/lettering-geometry.ts` — `LetteringSpec.material` (`{ kind: "clay" }` | `{ kind: "brushed-metal", f0,
  tone, strength, face: { roughness, anisotropy, anisotropyRotation, grainEm, grainContrast }, edge: { roughness } }`; the
  line brushed brass, the arch clay); `buildLettering` splits each letter **by materialIndex**, merges faces and sides apart,
  joins them with `mergeGeometries([faces, sides], true)`, and sets each letter's face UV to its placed position.
- **NEW `components/showcase/lettering-material.ts`** — `createBrushedMetal(material, hdri)` → `[face, edge]`, on
  `corner-material.ts`'s shape; the grain texture; brass F0 and the tone. ⚠ **A new file: Carl names it into scope**
  (`live-work/chunk-scope.json`).
- `components/showcase/showcase-bench.tsx` — the "material" mode (Neutral tone mapping, `ShapeLight` off — lit by the
  studio alone, as the desk mark's pass 2 was judged); the studio through `loadStudioHdri`; the line's build key; the sliders.
- `app/proto/showcase/page.tsx` — URL switches for every dial (a harness holds a value across a reload).

## §5a / §5b — what is structural, and what depends on it

- **The studio on the bench:** a second CONSUMER of `lib/studio-hdri.ts`, not a second source; per-material `envMap` +
  `envMapRotation`, as the buttons and corners do — no `scene.environment`. Memory cost stated above.
- **The line's merged geometry gains two groups; its triangles are reordered (faces, then sides).** Depends on it: take 1's
  stats (from per-letter boxes, not order) — asserted unchanged; the clay/flat/mesh/normals/zebra modes (a single material
  draws the whole geometry, groups ignored) — asserted pixel-identical to step 0's baseline; the crease (in place, groups kept,
  `BufferGeometryUtils.js:1319`).
- **The line's build key narrows** from the whole spec to its geometry fields — what it no longer rebuilds on: material and
  studio changes (intended); nothing else read by the build lives outside the key (asserted by listing the fields `buildLettering`
  reads).
- **Tone mapping per mode:** the renderer's setting changes when the mode does; three recompiles per program key.
- **A generated texture** per material build, disposed with it.
- **Not in this plan:** the arch's material; the two-viewport layout (structural, its own note); the light (pass 3); gold leaf;
  correcting `about-card-glass.ts:491` (flagged only).

## Verification

1. **Wired, red first** (step 1): 0 vs 0 → 0; the three pairs differ; NaN/black count 0; the highlight's x/y spread reported
   and matching the written prediction. The output states what it does NOT watch (whether it looks right).
2. **Groups:** every materialIndex-0 normal ±z; total 13,676 (take 1); ⛔ **and on a string with an "i"** ("Bistro"): every
   face triangle still in the face group — seen red first by splitting by group POSITION.
3. **Regression:** step 0's frames — the line and the arch in clay, every mode — pixel-identical; take 1's stats as R-088.
   ⛔ **Including a ROUND TRIP** (Architect B1): material → clay must still match step 0's baseline exactly (the restore works).
   **Every harness prints `gl.toneMapping` in each mode** (Neutral in material, ACES in clay — the switch seen, not assumed).
4. **One sheet:** face uv = position.xy exactly, every face vertex.
5. **No rebuild on a material tick — with a POSITIVE CONTROL** (Architect B2): in the same run the build's timing mark is
   first shown FIRING on a geometry change (a depth change), then shown NOT firing when a material slider moves. An absent
   mark proves nothing until it has been seen present.
6. `tsc` clean; lint at baseline (1 error, 0 warnings); no console errors; clean-checkout build before any push.
7. **Carl's eye**, at his density, dev server: stills front and oblique, an orbit, the studio turning — into the film's
   `04 Pass 2 - Material`, every take.

## A. The Architect's review of v1 — *"approve once four amendments are made"* (Carl pasted it, 23 October)

| # | Finding | Taken how |
|---|---|---|
| 1 ⛔ | Split by materialIndex: two-shape glyphs give groups 0,1,0,1; "Bistro" would break | Files; Verification 2, red first |
| 2 ⛔ | Step 1 could give a false result: flat face front-on; no true red run; ">0" too weak; prediction not written | Step 1 rewritten: oblique + softbox yaw, 0 vs 0, NaN/black, x/y spread, prediction π/2 |
| 3 ⛔ | Material on the spec rebuilds the line every tick (`:384`) | Decided: the line's build key, geometry fields only; Verification 5 |
| 4 ⛔ | Name the tone mapping (bench ACES `:618`, buttons Neutral `:626`) | Decided: Neutral in material mode, clay keeps ACES |
| 5 | Face may render near-black; predict the yaw; add strength | Step 0(b); strength dial |
| 6 | Keep the studio off `LetteringSpec` | Decided |
| 7 | Follow `corner-material.ts` | Reused table; Files |
| 8 | Room slider memory cost; apply on release | Reused table; Step 4 |
| 9 | Grain floor ~2 device px; texture filtering 8; name clash | Step 3; Reused table |
| 10 | Face uv = position.xy exactly; UVs in px | Step 3; Verification 4 |
| 11 | Capture the baseline first; define or drop "the caps' count" | Step 0(a); dropped |
| 12 | What material mode does on the arch | Decided: clay, with a note |
| 13 | Carl's expectation for the edge | Step 2 |
| — | `about-card-glass.ts:491`'s anisotropy record may be wrong | Flagged to Carl after step 1; not edited here |

## B. The Architect's review of v2 — *"approve, with two small amendments that can go in without another round"* (Carl pasted it, 23 October)

| # | Finding | Taken how |
|---|---|---|
| B1 | Prove the tone-mapping switch happens: set `gl.toneMapping` in an effect, restore on exit, `invalidate()` (precedent `answer-card-canvas.tsx:3715–3731`); print it per mode; a material → clay round trip | Decided (tone mapping); Verification 3 |
| B2 | "The mark does not fire" needs a positive control — seen firing on a depth change in the same run | Verification 5 |
| For Carl | Neutral for the metal is a direction decision, not a material chunk's | ✔ **Carl: "Judging choice only"** — the page's tone mapping is pass 3's |
| Note | Back the yaw prediction with a 15° sweep, oblique | Step 0(b) |
| Note | The oblique view a fixed pose for the harness | Step 0(c), `?cam=` |
| Note | The grain's floor computed from the current dpr and framing | Step 3 |
| Note | Brass F0's second source before step 1 | Reused table |

## C. The Architect's review of v2.1 — *"ready for Carl's approval"* (Carl pasted it, 23 October)

| # | Note (non-blocking) | Carried how |
|---|---|---|
| C1 | Every value Carl sets this pass — tone, strength, roughness — is set UNDER NEUTRAL. If pass 3 picks ACES for the page they become values to re-check, not approved numbers that quietly read differently (D-046/D-048) | Each value written into `LetteringSpec`'s comment and the record is marked **"set under Neutral, judging"** |
| Housekeeping | Carl names `lettering-material.ts` into scope before it is written; the plan and both responses copied to `live-work/`; brass F0's second source before step 1, a disagreement to Carl | First actions on approval, in that order |
