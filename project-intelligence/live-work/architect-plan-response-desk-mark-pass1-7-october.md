# Architect Plan Response — D-088 desk mark, PASS 1 (the mark's shape in plain grey)

**Reviewed 7 October 2026 by the Architect.** Plan-review gate, `handoff-protocol.md` §2.5. Plan reviewed:
version 1 of `live-work/desk-mark-pass1-mesh-plan-7-october.md`, reviewed against `logo-mark-geometry.ts`,
`logo-bench.tsx`, the extract script, the 3 October checkpoint and frames, and both 7 October references.

> ⚠ **TRANSCRIBED BY THE BUILDER, NOT WRITTEN BY THE ARCHITECT.** Carl pasted the Architect's findings into the
> Builder's session on 7 October 2026, and the Builder copied them here verbatim in substance. **The Builder is an
> interested party in its own review. If this file and the Architect's window ever differ, the Architect's window is
> the authority.**
>
> ⚠ **The one item the Architect could not check, answered by the Builder (7 October):** the outline script IS tracked.
> `git ls-files` lists `logo-outline-extract.mjs`, `logo-bench-measure.mjs`, `logo-bench-shots-3-october.mjs` and
> `logo-silhouette-measure.mjs`, all force-added in `6302913`. ⚠ **That commit is local and NOT pushed** (Carl, 7
> October: hold the push), so the provenance is in the repository but not on the remote.

---

**Verdict: approve once six changes are made.** The overall approach is sound. Removing the materials and lights to
check only the shape is the right move. Joining the stroke and the stem as two separate solids is the honest answer to
the pinched tear, and making the bench prove it can see that known tear first is the best idea in the plan. The six
problems below are all in the step that rounds off the join (the fillet). Each would produce a visible line or bump
that the plan as written could pass, or would only catch after the work is done.

## Fix before approval

1. **The rounding would also round the bottom edge of every stroke inside its window, and nowhere else.** At the foot
   of every stroke, the flat lip meets the rising tube at a sharp inside angle of about 90°
   (`logo-mark-geometry.ts:232`). The bottom of the stem's slope meets the lip at a sharp angle too. The rolling-ball
   rounding fills every inside angle it can reach, not only the stroke-to-stem crease. The window has to sit on the
   outline, because that is where the crease meets the lip. So the foot would be rounded inside the window and sharp
   outside it, with a visible step where the window ends.
   **Fix:** do the rounding on the surfaces with the lip left off (the tube and the slope just carry on downward), then
   put the lip back afterwards. The check that the window edge changed nothing must include the lip area.
2. **Bicubic interpolation can overshoot.** The plan samples the smoothed heights with bicubic interpolation, which
   overshoots near sharp changes. That could put a small bump on the stem's flat face, the exact fault the plan was
   designed to avoid.
   **Fix:** interpolate only the added fill (smoothed height minus original, never below zero) and add it to the exact
   original surface. Wherever the rounding changed nothing, the surface stays exact. The window edge is then clean by
   construction, and the blend ramp may not be needed at all. Replace the ramp check with a simpler one: the fill is
   zero all along the window border.
3. **The height cap is underspecified, and it creates a second crease.**
   - *Which shape it uses:* the tube's round shape everywhere would cut down the stem's straight slope, because at the
     stem's slope width the round shape is only about 0.79 of full height. Use whichever of the round and straight
     shapes is higher at each point. Then the cap only switches on where the trace and the joined solids disagree.
   - *It adds a ridge:* taking the lower of two surfaces leaves a ridge where they cross, and the rounding only fills
     hollows, so it will not smooth that ridge. Put the order (join, round, then cap) and a measure of the ridge's
     sharpness at the inside corners in the plan.
   - *The stem's outer corners need it too:* the stem's slopes are built from a sharp-cornered rectangle, but the
     traced stem corners are probably slightly rounded. The same lip mismatch would then appear at the stem's four
     outer corners as well as the two inside ones.
   - *New checks:* (a) the lip is at its proper height at every point on the outer edge; (b) the number of points the
     cap touches, which must be zero outside the inside corners and the stem's corners.
4. **The plan doesn't say how the new surface's normals are computed, and the inspection modes look at the normals
   rather than the shape.** Near the edge, each band vertex's normal currently comes from its distance to the outline
   (`surface()`, line 243). Once the height comes from join, round and cap, that no longer applies. Clay, zebra and
   normals all shade with these computed normals, not the triangles, and chunk 1 deliberately spreads a crease over two
   cells (deviation 4), so the shading can hide a crease that is really there.
   **Fix:** name the one normal method that covers the whole new surface; add a mode that lights the actual triangles
   flat, so the geometry itself is judged; the step 1 test must show the tear in that mode too.
5. **The cut-position dial doesn't fit with generating the cut offline.** A browser dial can't move a cut the script
   generates without regenerating it or duplicating the logic. The cut's position doesn't show anyway, because the
   stem's flat face covers it. Replace the dial with checks the script prints:
   - *Cut placement:* the cut and the ends of the continued edges lie inside the flat face with a margin, and the tube
     is never taller than the stem along the cut. Otherwise the jump in the tube's height at the cut shows through.
   - *Continuation width:* the two continued edges stay at least 2R apart. If they get closer, the tube grows a ridge
     down its middle inside the stem's slope band — the seam that capping R at p5 was meant to prevent.
6. **The step 1 test is marked by the Builder alone, and the "before" numbers are deleted before they're used.** "The
   tear must be visible" is the Builder judging its own instrument, which CLAUDE.md doesn't allow. Send the step 1
   frames to Carl before step 3 begins (step 2 is offline and can go ahead in parallel). Step 3 removes the old ease
   and its reading, but the 3 October mesh is meant to be the comparison: record its junction-window readings and the
   junction camera position in step 1, so the before and after frames are taken from the same viewpoint.

## Should fix

- **Self-shadowing:** shadows on a smooth surface can produce stripy acne or a gap at the base (peter-panning), and
  either could be mistaken for a fault in the shape. State the shadow settings and add a shadows-off switch.
- **Removing the stem's crown undoes something Carl asked for by eye on 3 October** (*"showing the flat back"*). It is
  listed only under "Removed". Say so at the checkpoint, and carry it to pass 2 as a question for the material and
  lights — not something to be quietly solved by putting the crown back.
- **The window should come from the script's printed corner positions** plus a margin of at least 2 × `filletR` (plus
  the ramp), not typed in by hand. The closing costs roughly cells × (filletR ÷ step)²; report build time against
  chunk 1's ~0.8 s.
- **Step 2 should also print the traced inside-corner radii.** In the references, the rounded corner seen from the
  front and the 3D fillet look like the same feature, so the fillet's starting size should come from the measurement.
- **Check whether the outline script is tracked in git** (answered above: yes, in the unpushed `6302913`).

## Already right

Proving the bench can see the known tear before trusting it; rejecting smooth max for the right reason (it bumps
wherever the two surfaces are equal); the structural checks (one canvas, the second outline generated from the same
trace and md5, the rejected alternatives); the stop conditions; leaving `logo-mark-material.ts` unused rather than
deleted; flagging the `chunk-scope.json` wording as Carl's.

## Checked against the code

Importers (only `logo-bench.tsx`, `logo-mark-geometry.ts`, `app/proto/logo/page.tsx`) — confirmed. Scope: every
planned file is in `chunk-scope.json` or in `live-work/`. `stemBlend` 0.04, the 46.7° reading and the detected stem
rectangle match the code and the checkpoint. The references show the stem's right slope broken where the bowl joins.

## Not checked

The clay and zebra modes' behaviour (no code yet); the traced corner radii.

*Findings only; Carl decides.*
