# The Architect's responses — film 4, pass 2 (the material), plan `film04-pass2-material-plan-23-october.md`

> **The Builder's transcription of what Carl pasted, 23 October 2026.** Four rounds: v1, v2, v2.1, v2.1 with table C.
> §2.5: the Architect's own window is the authority if this transcription and it ever differ. Headings added; the text is
> as pasted.

---

## Round 1 — on v1

Checking how the button scene wires the studio and anisotropy, to test the plan's claims against the code.

  Searched for 3 patterns, read 4 files

Verdict: approve once four amendments are made

The physics is right. The steps are gated in the right order. The plan's correction about the face and side groups holds up against three's source. Four things should be fixed before Carl approves it, because each one would produce a wrong result or a false green. After those are nine recommendations.

What I confirmed in the code

- Face/sides groups: materialIndex 0 is the lids and 1 is the walls plus the chamfer (ExtrudeGeometry.js:626, 650). So "polished edge" covers the walls and chamfer together, as the plan says.
- Anisotropy without a tangent attribute: the UV varying is declared under USE_ANISOTROPY even with no maps (uv_pars_fragment.glsl.js:2), and the tangent frame is built from vUv (normal_fragment_begin.glsl.js:30–36). The plan reads the shader correctly. about-card-glass.ts:491 says anisotropy "NEEDS A tangent ATTRIBUTE", which is stronger than the shader supports. If step 1 proves the wiring, that record is wrong and should be flagged to Carl. It's outside this chunk's scope.
- The crease keeps groups: toCreasedNormals edits a non-indexed geometry in place (BufferGeometryUtils.js:1319). mergeGeometries(…, true) gives one group per input, so merging the faces and sides separately and then joining the two gives exactly two groups.

Must amend (blocking)

1. Split by materialIndex, not by "group 0 / group 1". addShape runs once per shape, and each shape adds its own lid group and side group. A glyph made of two shapes ("i", "j", ":", "!", "%") produces groups in the order 0,1,0,1. "Your company" has no such glyph, so every planned check would pass and the first client word with an "i" ("Bistro") would break. Add a groups assertion on a string containing "i".
2. Step 1 can give a false result as designed.
   - The line's face is flat. Seen front-on, it reflects almost a single direction of the studio, so anisotropy only blurs a near-uniform patch. Rotation 0 vs π/2 can come out nearly identical while the wiring is correct.
   - Run the wiring test at the oblique view, at a yaw where a softbox edge falls in the face's reflection.
   - The red runs aren't real red runs. "0 vs 0.8 must differ" is a pair expected to pass. A red run is one that should fail: rotation 0 vs 0 must report 0, which proves the comparison isn't measuring noise.
   - "Mean difference > 0" is too weak. A broken tangent frame produces NaN or black pixels, which also "differ". Add a NaN/black pixel count and a measure of the highlight's orientation (its x/y spread).
   - Write the prediction down so step 1 tests it rather than picks it. Under three's convention the highlight stretches along the tangent, which here is +x, so vertical streaks should need rotation π/2.
3. Putting material on LetteringSpec rebuilds the geometry on every slider tick. The line's build effect depends on the whole spec object (showcase-bench.tsx:384), so any material or studio change re-extrudes and re-uploads all 13,676 triangles. Key the build on the geometry fields only, the way the arch's shapeKey already does (:390).
4. Name the tone mapping. The bench uses R3F's default, ACES (:618). The buttons use Neutral (whoweare-button-scene.tsx:626). The corners' gold was approved under ACES. ACES shifts yellows, and "tone, set on screen" will be set against whichever one is active. The plan should state which one, and pass 3 and the page will inherit the choice.

Recommended

5. The face may render near-black at the starting values. At room 0.1, a flat metal face lights only when a softbox is in its reflection. The buttons' 150° was tuned on curved shapes. Predict the yaw that puts a softbox in the face's reflection, and add the corners' strength dial (envMapIntensity). Without lamps, strength is metal's brightness control; blue needed 2.
6. Keep studio off LetteringSpec. The plan itself calls it a judging fixture. On the client template it becomes a client part by inertia. Bench state plus URL switches cover it.
7. Cite the existing precedent. components/home/corner-material.ts already does this: a look object with roughness, strength, yaw and room, built into a material, with setRGB(…, LinearSRGBColorSpace) written explicitly. createBrushedMetal should follow its shape.
8. The room slider costs memory. Each room value caches its own ~8 MB float copy plus a PMREM, and they are never freed (studio-hdri.ts:37). The corner bench already accepts this at step 0.01. State the cost and apply room on release, not on every tick.
9. The grain can disappear. A pitch below about 2 device px mips away to an average. State that floor. Also set the texture's filtering anisotropy (8, the answer-card precedent) against moiré at the oblique view, and comment the name clash with the material's anisotropy.
10. Use a simpler, stronger "one sheet" assertion. Three's face UVs are the shape's own x,y in px (generateTopUV), so after the offset, face uv must equal position.xy exactly. The plan should also say that UVs are in px, so repeat is 1/(pitch in px).
11. Capture the regression baseline before step 2 touches the code, and say so. Define "the caps' count" or drop it: every group-0 normal ±z and the total 13,676 already cover it.
12. State what "material" mode does on the arch layout (clay, or disabled).
13. Set Carl's expectation for the edge. The polished edge is a chamfer of about 3 px front-on at 160 px. It is judged mainly at the oblique view, and the 10° crease already softens it at the A and Y.

These findings go to Carl. Nothing has been edited or saved; the Builder transcribes this response as the plan says.

---

## Round 2 — on v2

Verdict v2: approve, with two small amendments that can go in without another round

I didn't re-read the code this round. My checks were against what I verified for v1. All four blocking findings are taken, and taken correctly. The nine recommendations are all in. The redesigned step 1 is now a real test: the prediction is written first, there's a true red run (0 vs 0), it counts NaN/black pixels, and it measures orientation. The "Bistro" check is seen red by splitting on the wrong key, which is the right way to prove it.

Amend before approval (small)

1. Prove that the tone-mapping switch actually happens. If the switch is done by changing the Canvas gl prop, it may not apply once the renderer exists. Carl would then set brass's tone under ACES while the plan says Neutral. The precedent is to set gl.toneMapping in an effect, restore it on exit, and invalidate() because the bench uses frameloop="demand". That pattern is the save/restore at answer-card-canvas.tsx:3715–3731. Then add two checks:
   - The harness prints gl.toneMapping in each mode.
   - The regression frames include a round trip: material → clay must still match step 0's baseline exactly.
2. "The build's timing mark does not fire" needs a positive control. An absent mark proves nothing unless the mark is shown firing on a geometry change, such as a depth change, in the same run. This is the same red-first rule the plan applies everywhere else.

For Carl, not the Builder

- Neutral tone mapping for the metal is a direction decision. The plan says pass 3 and the page will inherit it, while the corners' gold was approved under ACES. That puts two metals on one site under two tone mappers. Neutral is the right pick for judging, because it matches the buttons, the metal standard's family. But it shouldn't be decided inside a material chunk. Carl rules on it, or the plan records it as a judging choice only, with the page's tone mapping left to pass 3.

Notes (no change needed for approval)

- Step 0(b): three's equirect mapping and the sign of envMapRotation make a yaw predicted on paper easy to get wrong by 90° or 180°. Back it with a cheap sweep: face mean luminance at 15° yaw steps, oblique view. Then step 1 starts from a measured yaw, not a calculated one.
- The oblique view must be a fixed pose for the harness. Add a URL switch for the camera, or name the fixed pose the harness uses. Otherwise "the same view" across two renders isn't guaranteed.
- The grain's ~2 device px floor depends on the dpr and on how the camera frames the words. The slider's shown floor should be computed from the current framing, not stored as a fixed em value.
- The brass F0 second source is still pending, as the plan says. It must be checked before step 1 writes the value into code.

With amendment 1 and 2 in and Carl's ruling on the tone mapper, this is ready to build.

---

## Round 3 — on v2.1

Verdict v2.1: ready for Carl's approval

Both amendments are in as asked:

- B1, the tone-mapping switch: it is set in an effect, restored on leaving and followed by invalidate(). It is also checked three ways: gl.toneMapping is printed in each mode, the material → clay round trip must match the baseline exactly, and the precedent it cites is right.
- B2, the build mark: it is now shown firing on a depth change before it is shown not firing on a material change.

Carl's ruling is recorded as he gave it ("Judging choice only"), and the page's tone mapping is left to pass 3. All four notes are taken, and I have no new findings that block the build.

One note to carry into the build (non-blocking)

- Every value Carl sets in this pass is set under Neutral. That covers the tone first, and also strength and roughness. When they are written into LetteringSpec or the record, mark them "set under Neutral, judging". If pass 3 picks ACES for the page, those values become things to re-check, not approved numbers that quietly read differently. One line in the record covers it. It is the same lesson as D-046/D-048: a value can stay intact while the facts it depended on move.

Housekeeping on exit from plan mode (already in the plan, listed so they don't slip)

- Carl names components/showcase/lettering-material.ts into live-work/chunk-scope.json before the Builder writes it.
- The plan is copied to live-work/film04-pass2-material-plan-23-october.md, and both Architect responses are transcribed to live-work/architect-plan-response-film04-pass2-23-october.md.
- The brass F0 is checked against a second source before step 1 writes it into code. If the sources disagree, Carl decides.

Approval is Carl's decision.

---

## Round 4 — on v2.1 with table C

v2.1 with table C added: no change to my verdict, still ready for Carl's approval

C1 is carried correctly. Values written into LetteringSpec's comment and into the record get marked "set under Neutral, judging". The housekeeping order is right too: scope first, then the copies, then the F0 second source.

One small text fix. The status line still says "both Architect responses are saved as…". There are now three: v1, v2 and v2.1. The transcription should hold all three, or table C's response gets lost when the plan is copied to live-work/. It's a one-word edit and doesn't need another round.

Approval is Carl's decision.
