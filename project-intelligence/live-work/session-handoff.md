# Session Handoff — 9 November 2026 (Monday), SESSION 3. THE REFLECTION SHIPPED; THE LIQUID NOTE APPROVED; PROBE 1 ACCEPTED; PROBE 2 NEXT

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces session 2's handoff. Delete it at the end of the
session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"THE MIRROR HYPOTHESIS FALSIFIED"* to the end. Every beat is there with
Carl's words.

## STATE

- **Pushed:** `719cefa`, the logo's reflection (the studio and the glowing text), with the clean-checkout build passing
  first. Carl: *"i dont have a problem with it ... It looks like the family of metals."*
- **UNCOMMITTED (Carl has not said commit):** probe 1 (THROWAWAY): `hero-liquid-webgpu.tsx` (NEW), `hero-idea-webgpu.tsx`,
  `hero-idea.tsx`, `hero-logo.tsx` (`LiquidProbe`); D-101's session-3 lines. Ask Carl before committing.
- **The dev server is STOPPED** (the whole `next dev` tree; port 3000 free), on Carl's word. Start it, and check
  `/proto/camera` answers.
- **The screen capture is STOPPED** on Carl's word, and remuxed:
  `Videos\C2B Films\03 The hero\01 Discussion\2026-11-09_s3_discussion_screen.mkv`, 2 h 25 min. Start a new one (into
  `01 Discussion`) at the start of the next session's discussion, unprompted (the filmed-build rule).
- **The scope is OPEN on Carl's word** (`_heroLogo9Nov`, `chunk-scope.json`). This session added
  `hero-liquid-webgpu.tsx` and **`hero-liquid.tsx` (NEW, for probe 2, not yet created)**. **It stays open, with no
  re-asking, until the end of the hero's PHASE 1**; then lock and test them all (Carl's standing exception, below).
- **Lint:** the accepted error and the 2 known warnings in `projector.mjs`. `tsc` clean.

## WHAT SESSION 3 SETTLED

- **The reflection's null control:** there was NO mirror. The session-2 failure came from the `mode: "equirect"` dev
  switch, which showed the lamps alone. Committed step 1 is sound (checked from a scratch worktree on port 3001).
  Instrument v2: the reference is committed step 1's own frame (`live-work/scripts/hero-reflection-ref/`), with a yaw
  sweep (150° the single best of 36) in place of a chosen bar. All checks pass.
- **Carl's standard for the phases:** *"Whats important is the colour of the states are consistant."*
- **⛔ Solid to liquid reads as ONE object** (Carl's T2 / T-1000 rule): the liquid looks exactly like the LOGO's material
  (`#9c0000`, metalness 1, roughness 0.4, its reflection). No shade change at the transition.
- **The liquid note** `live-work/structural-note-hero-liquid-9-november.md` **v1.5 APPROVED** (*"i will trust your
  judgement.  as it stands"*), after reviews 11 and 12 (saved beside it). **Route B: RAYMARCHED METABALLS.**
  - The blobs emerge out of the logo like the example's `wallx` (only the coming-out half), carrying its 70,085 cm³.
  - **~4 s** against the right wall. **They stay in the air** (no floor fold). The logo forms **just above its landing
    spot** (`HERO_LOGO_PLACE`) and falls.
  - **D1-a:** a second capture of the landing spot, taken at load, swapped in on the landing frame. **D2:** if a
    still-frame handover fails its bar, swap at the first bulge.
  - The volume curve is solved at DEV TIME and shipped; per-frame volume is verification only.
  - The liquid mounts INSIDE `HeroLogo`, through a prop slot from the WebGPU part.
- **Probe 1, the shade null control:** BUILT. The shade matches (interior mean 0.08); the edge is fixed by
  alpha-to-coverage, and its 1-px ring is **ACCEPTED by Carl's eye** (*"its acceptable, the one pixel ring. To me the left
  blov looks better"*). The whole-mask bar is NOT met (1.13, p99.5 28) and is not moved.
  - Two findings to KEEP in the real build: specular anti-aliasing must come from the HIT's normal (`roughnessNode`); the
    edge needs coverage → `alphaToCoverage`.
  - The coverage estimate for a hit is the SPHERE's (grazing angle). Metaballs need their own.

## NEXT — PROBE 2 (the note v1.5's live plan, step 2), in `hero-liquid.tsx` + `hero-liquid-webgpu.tsx`

**⛔ NO need to ask before the first code edit for the open files** (Carl's override, 9 November, session 3: *"to close
them all only for you to ask to open them again in 9hrs in the next session is a waste of your energy and mine"*). Every
file open under `_heroLogo9Nov` stays open, with no re-asking, until the END OF THE HERO's PHASE 1; then lock and test
them all before phase 2. **New files outside the list still need his word.** Then build:
- **The logo as a field term.** A 2D distance texture of the OUTLINE (`components/about/logo-mark-outline.ts`;
  ~480 × 288 at 0.5 cm with a ±20 cm margin), extruded to 7.6 cm by the standard formula, in the lean's frame. Bake it
  in a worker in the end; a probe may bake on load and say so.
- **The first handover:** mesh → field logo at full weight, null control at mean ≤ 1.0, p99.5 ≤ 6; then D2 if needed.
  Measure the extrusion's volume at weight 1 against 70,085 cm³ (the approximation check).
- **ONE blob** bulging out of the logo's right face, necking and pinching off (smooth minimum), looping on the bench.
- **The drain, for Carl's eye:** an even shrink against a directional front. Show the true 70 L scale.
- Measure on WebGPU and on the fallback (`&forcewebgl=1`). Remove probe 1's spheres when probe 2 replaces them.

## OPEN — WITH OWNERS

- **Commit of probe 1:** Carl's word.
- **The glow's selection check fails at the previous HEAD** (pre-existing, from session 2): Carl's call, unchanged.
- **Fable 5.2:** tried for one diagnosis and dropped (10 % of its own weekly limit). Do not propose it again.

## LESSONS

- **A null control's REFERENCE must itself be verified.** Session 2 chased a "mirror" for hours; the reference (a dev
  switch) was the broken thing. Check the reference first, ideally against a commit Carl approved.
- **Homework before a note works twice:** the source showed `wallx` is a plane in the SAME field (so the logo must be in
  the field), and the measurements showed "copy it whole" could not work at our scale, before anything was built.
- **An adopted review finding must be carried through the whole body**, not only the answer table (review 12).

---

*Written 9 November 2026, session 3.*
