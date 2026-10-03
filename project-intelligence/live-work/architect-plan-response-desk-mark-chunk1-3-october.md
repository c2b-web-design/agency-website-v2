# Architect Plan Response — D-088 desk mark, chunk 1 (the mark alone on a bench)

**Reviewed 3 October 2026 (session 2) by the Architect.** Plan-review gate, `handoff-protocol.md`
§2.5. Plan reviewed: `live-work/desk-mark-chunk1-plan-3-october.md` (version 1, before amendment).

> ⚠ **TRANSCRIBED BY THE BUILDER, NOT WRITTEN BY THE ARCHITECT.** Carl pasted the Architect's
> findings into the Builder's session on 3 October 2026; the Builder copied them here verbatim
> in substance. **The Builder is an interested party in its own review. The Architect's window is
> the authority if this file and it ever differ.**
>
> ⚠ **The Builder checked four of the review's code claims before amending** (3 October): `/about`'s
> `<Canvas>` runs `frameloop="demand"`, `dpr={[1, 2]}`, `gl={{ antialias: true, alpha: true }}`
> (`about-card-canvas.tsx` ~1069) ✔; the take light's shadow camera is ±2.2 (a 4.4 square) ✔;
> `git diff --stat` omits untracked files ✔. ⚠ **One addition the review did not name:** `/about`
> also sets `shadows="soft"` while the extruded text is on (its default) — the bench copies it.

---

**Verdict: approve once the amendments below are made.** The premise checks are the strongest part
of the plan. Finding that the white silhouette is a different drawing (IoU 0.84) has saved a chunk
built on the wrong outline. The chunk is the right size, and its boundary with chunk 2 is drawn in
the right place. The findings were checked against the code, except where a finding says otherwise.

## Fix before Carl approves

1. **The plan changes Carl's own scope wording, not just the file list.** `chunk-scope.json` says
   "Scope: trace the white silhouette". The plan changes the trace source to the gold alpha. Put
   this to Carl as a change of input, with premise 2 as the reason, and update the wording as well
   as the file list (add `logo-mark-outline.ts`, remove `public/c2b-mark-silhouette.png`). The
   extraction script is already covered, because `live-work/` is in scope as a folder.
2. **A single global R puts a visible seam down every stroke's middle.** Half-widths run 45.6–49.2
   against R = 48 (the median). Where a stroke is narrower than R the crest is the medial axis with
   a non-zero slope; the SDF gradient flips across it and the analytic normals flip with it — on
   metal, a bright or dark line along the spine. **Fix:** R at or below the minimum half-width
   (5th percentile or lower), so the slope is exactly zero wherever the medial axis falls; the crest
   becomes a narrow plateau ("close to a half-round, possibly slightly flattened"). **Readout:** the
   maximum angle between neighbouring vertices' analytic normals.
3. **The stem mask leaves a height step at its edge** — a switch from dome to chamfer makes z jump
   and the stem/bowl seam a cliff. **Fix:** the stem gets its own box SDF, combined with the dome by
   a smooth max/min so z stays continuous. **The extraction script emits the stem rectangle** (same
   md5 provenance), not typed by hand.
4. **Verification:**
   - `git diff --stat` does not list untracked files — use `git status --porcelain`.
   - Lit metal on `#121212` is not a reliable mask (gold facing away renders near the background).
     **Add a mask mode:** unlit `MeshBasicMaterial`, white on black.
   - **IoU ≥ 0.99 is uncalibrated** — one pixel of edge error over the perimeter is worth several
     points. **Run the control first** (the gold alpha against itself eroded by 1 px; state what
     0.99 means), then add an **edge-distance measure** (max and 95th percentile, source px) — what
     "outline exact" and "gaps open" actually depend on.
   - **The front ortho framing comes from the outline's normalisation transform**, recorded in its
     provenance — fitted by hand, the IoU measures the fit, not the mesh.
5. **The bench renderer must match `/about`'s**, or the gold shifts between bench and room: R3F
   defaults — ACES tone mapping, sRGB output, `antialias: true`, `alpha: true`, `dpr={[1, 2]}`.
   State and copy them. **The target overlay is a DOM `<img>` over the canvas**, not a textured
   plane (a plane would be tone-mapped — matching gold against an altered target).
6. **Studio light: `<Lightformer>` only, no preset** (a preset fetches an HDR from a CDN). The bench
   header says `card-bench.tsx`'s "`<Environment>` ruled out" applies to the GLASS, not to metal —
   metal with no environment renders black.
7. **The "room" option is the room's REFLECTION, not its light.** The approved light (R-031) is
   `TakeLight`, private to `about-card-canvas.tsx` with inline literals. **Do not copy its numbers**
   (a second source of truth, §5a). Label the option "room reflection — no take light". Exporting
   the take light's values changes an existing file — chunk 2's, needing Carl's word on scope.

## Should fix (in the plan, or stated at the checkpoint)

8. **A grid in XY cannot represent the half-round's steep sides cleanly** — vertical at d = lipW;
   with a 2 px grid the first cell inside the lip rises ~13 px; the oblique view will show stepping
   on exactly the flanks where the highlights live. **Pre-authorise the remedy within the same
   mechanism:** a finer band near the edge (a dial) + a readout of the max z-step per cell.
   **Correct the claim:** the boundary is the interpolated zero-crossing of a sampled SDF, NOT exact;
   corners are cut short by up to one cell. **Two loops exist** (the outline file; the grid-clip loop
   the wall and back are built from) — say so under Coupled values; the edge-distance check keeps
   them together.
9. **Count open edges on WELDED positions**, not indices (the wall/front hard edge splits vertices).
10. **Fix the origin's reason:** the topple pivots on the FRONT bottom edge, not the bottom-centre.
    Keep the origin, drop the pivot claim; chunk 3 offsets with a group.
11. **A view at room size** — the mark at ~70 CSS px × DPR 1.36 (gaps ~0.5 CSS px, chamfers a few
    px), so Carl judges what readers see; the large views stay for the form. **Report triangle count
    and build time (ms)**, timed in an effect, not during render (`performance.now()` in render trips
    lint). Chunk 2 needs both.
12. **Gold: start from PHYSICAL gold**, F0 in linear ≈ (1.00, 0.77, 0.34), not a sample of the
    target (its mid-tones mix the lighting in). The target judges the result. One starting value.

## A question for Carl, in this chunk

13. **What does the mark stand on?** Flat back, domed front: upright, it touches the desk only along
    the wall under the base stroke (wallH deep) — balanced on a thin edge, against Carl's world-logic
    test. **Show a bottom/side view at the checkpoint and ask: a flat foot (the base's underside sliced
    flat to full depth), or as built?** The Builder should not decide this.

## For chunk 2 — record now, do not act

- `/about` is `frameloop="demand"` and `neon-bloom.tsx` owns every frame (useFrame priority 1); a
  moving mark changes the rendering model.
- `TakeLight`'s shadow frustum is a 4.4 m square centred on the four cards; the desk mark may sit
  outside it.
- Building the geometry at runtime costs time on `/about`'s load — measure on the bench before
  deciding whether to bake offline.

## Already right

The lint baseline (`1 problem (1 error, 0 warnings)`), the gate (save the plan and stop), no new
dependencies, one canvas on its own route, the stop conditions. The README note about the silhouette
is Carl's call — **`hero-logo-transition-concept.md` also mentions the silhouette; include it.**
