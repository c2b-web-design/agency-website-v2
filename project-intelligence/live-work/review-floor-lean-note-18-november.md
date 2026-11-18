# Review of `structural-note-floor-lean-18-november.md` v1.0 (18 November 2026)

Pasted by Carl into the Builder's session, 18 November 2026; kept VERBATIM below. The reviewing seat checked the note
against `hero-scene.ts`, `hero-rain.ts`, `hero-steam.ts` and D-101. The Builder's response: the note's v1.1 (each finding
answered there, by number). Findings go to Carl, who decides.

---

I've reviewed the note against the code (hero-scene.ts, hero-rain.ts, hero-steam.ts) and Carl's words in D-101 (decisions.md 7873–7889). The overall approach holds up, but one fact is wrong and would put the heat in the wrong place, and several claims need correcting before the Architect sees it.

What holds up

- Rejecting ProjectorLight is well argued. It would need machinery to stop it lighting the logo, plus a shadow pass and a frame to hide.
- One mesh with fixed source slots is the right structure, and the note says so for the reason 5a cares about.
- The timing is right. The glow is multiplied by logoFade, so it can't change the opening's timings. holdS = 2 s and flightS exists in arrivalInfo (hero-scene.ts:1333).
- The other §5b rows check out: FLOOR_Y is only read, never moved; two additive layers with no depth write add up the same in any order; the new file is named for Carl's word.

Findings, most serious first

1. ⛔ lean.contact is not where the logo touches the floor. Lean.contact (hero-scene.ts:527) is sketch.contact, the point where the logo's back rests on the headline's "t" (tContact, line 134). Using it would put source 1 under the t, not under the c's end. The floor contact is the lowest vertex, but the scene only keeps its height (lowest, line 523), not its position. So "as the scene already computes it" is untrue: a small new computation is needed.
2. ⛔ §4 departs from Carl's brief without saying so. Carl, 16 Nov: "emanating out from an objects centre" (D-101, line 7873). The note recommends the contact point and offers the centre only as the alternative. At a 12.5° lean the two are about 20 cm apart, so either would look similar, but the note should present the centre as the brief's reading and the contact as the Builder's proposed change.
3. The outward drift formula breaks down at the centre. Sampling at p − p̂·speed·t means a pixel at (r, θ) reads the noise at (r − st, θ). Near the centre, every pixel reads a ring of radius st. That ring's whole circumference gets squeezed into a tiny disc, so you'd see a starburst of thin spokes that grows finer every second. At about 1 cell/s over the 2 s hold and 3 s cooling, that's roughly 30 spokes, at the brightest spot. Cells also get squashed sideways wherever r is close to st. There's also a separate seam: "a slow noise of the angle" jumps at θ = ±π unless it samples (cos θ, sin θ). The Architect should see an alternative, such as a scale-based zoom out from the centre, cross-faded between two phases, which has no singularity.
4. The cooling comparison is backwards. The blobs' coolS: 1.6 is itself the time constant: heat × exp(−dt/coolS) (hero-scene.ts:1569). The blobs' glow is therefore at 5% after about 4.8 s. The proposed τ ≈ 1 s cools faster, which contradicts the stated reason ("longer because the logo soaked heat in"). Either raise τ above 1.6 s or change the reasoning before it reaches Carl as the answer to his question.
5. "Drawn after the logo" is false during the fade. While the opening runs, the logo draws as a transparent depth pass (renderOrder 1) and then a fade layer (renderOrder 2), at lines 1279 and 2145. A new transparent mesh at order 0 draws before both. The fade is exactly when the glow appears. Given the 16 Nov finding (a large draw earlier in the frame changed the text and logo shading by up to 59 levels), the check should cover the fade frames with the floor mesh present and absent. Checking only the story frames isn't enough.
6. Hide the floor until the warm-up is done; zero strength isn't enough. If the mesh is visible at strength 0 before warmScene finishes, its first frame builds the program on the main thread during the opening. That is the stall Carl's opening was designed to avoid. The null control's wording ("floor ON, before the fade-in") suggests it would be drawn then.
7. A 5a alternative is missing: extending the existing floor glow. heatPlane is already an additive, unlit floor plane at FLOOR_Y + 0.5. It is 1,400 units across over the field, which by the code's own numbers appears to reach position 1 (not measured). The new mesh is a second one, which is exactly the "why is there a second X?" test. There may be good reasons to reject the extension (a 28 × 28 texture filled on the CPU, gated on the blobs), but the note needs to state them rather than leave the merge for chunk 2.
8. Missing from §5b: draw order against the rain and steam. The drops, splashes and steam are transparent and blend normally (hero-rain.ts:334, 377, hero-steam.ts:409). A large transparent plane sorted by distance among them can swap order as the camera moves, and when it does, the glow pops in front of or behind the steam. This doesn't matter for source 1, which is gone before the rain, but it does for source 3, where steam rises right over the glow. The mesh is being decided now, so a fixed renderOrder for the floor should be decided now too.
9. Source 3's colour could become a second record of the logo's temperature. The handoff says the floor can read hero-heat.ts. A per-slot colour that the scene animates separately would duplicate that field. The slot design should state now how source 3 reads it.
10. "Radius < ~1 m" looks about 3× too generous. From the code's own comments (2 m = 882 units, so about 4.4 units/cm): the pool's rim is about 480 units, roughly 109 cm, and the landing is about 1.4 m from the lean. That leaves a gap of about 30 cm at full spread. This is arithmetic from comments, not a measurement.
11. Form A is labelled "the take", but D-101 records it as Carl's open first question (line 7883: "is the floor there from the start, and in what form"). It should be listed as a question for Carl, not a take.

For Carl to weigh (not defects)

- §14a, "caused by the world": a red glow on the floor that the logo's underside and the "t" never catch may read as layered on top. The note flags only the reflection.
- The subtext: Carl raised the subtext conducting heat ("we will get to that"). Position 1 sits against the text, so its glow will frame the subtext's base from chunk 1 onwards, which brings that question forward.
- Small gaps: hero-floor.ts will need a chunk-scope.json entry. Both replayArrival and openingAgain need to reset the cooling, since §5 mentions them as one.


---

## Round 2 — review of v1.1 (18 November 2026)

*Added by the Builder at Carl's paste, verbatim; the reviewing seat has no write tools (its note: "If Carl wants this seat
to write files like this one, that's a change to its permissions. Carl would need to make it, and the seat's actual
capabilities should be stated before he does.").*

The reviewing seat checked v1.1 against the same sources, plus `hero-heat.ts` and `live-work/floor-sketch-18-november/`.
Findings go to Carl, who decides.

**v1.1 answers all eleven findings and the small gaps; the answers hold.**
- [R1][R2] fixed: `lean.contact` named as the t's; the brief's centre is the default; the contact is the Builder's change, for Carl.
- [R3] the drift formula withdrawn for a zoom with two cross-faded copies; the angle noise samples (cos θ, sin θ), no seam.
- [R4] consistent with the code: τ ≈ 2.5 s gives half gone ~1.7 s, 5% at ~7.5 s, longer than the blobs' τ 1.6 s.
- [R6], [R11], [R12] answered as asked.
- [R9] `HeroHeat.texture` exists (`hero-heat.ts:91`).
- [R7] the case against `heatPlane` as the host holds (texture too coarse, square, alive only with the blobs); retiring it
  in chunk 2 limits the second plane to chunks 1–2.
- [R5] and [R8] corrected, checks added.

**Still open:**
1. **[R8]'s fix could create a new risk to the steam, approved as R-108.** Drawing the floor first among the
   transparents makes it a large draw early in the frame, the condition that shifted later draws by up to 59 levels on
   16 November. The checks cover the fade frames and a moving camera, but not the steam and rain with the floor present
   vs absent. Simplest fix: hide the mesh whenever every source is ~0 (chunk 1: once source 1 has cooled, ~7 s after the
   jump), so everything from the blobs onward, the steam included, draws exactly as today. Hiding an already-built
   mesh does not rebuild it.
2. **The sketch is being done in the lamp version; the proposal ships the floor-glow version.** `floor-sketch-18-november/`
   is the example's `ProjectorLight` code (script 1: no statue, no rotation). A look approved there comes from the
   lamp's cone fade-off on a lit floor; the proposal ships an unlit additive glow that has to recreate it. Workflow 3:
   roll out the exact approved pattern. Either the sketch moves to the shipping pieces (noise on a flat unlit additive
   plane) before Carl judges it, or the note states that the port needs its own approval.
3. **To watch in the zoom when the sketch shows it:** movement is proportional to distance from the centre, so the
   pattern hardly moves at the hot spot ("emanating" reads strongest at the faded edge); and averaging two cellular-noise
   layers flattens the web halfway through each cross-fade, so the contrast pulses at twice the cycle rate (it might read
   as the pulse Carl likes, or as a muddy beat).
4. **A small inconsistency:** line 24 says threejs.org, line 35 says "threejs.dev's editor"; one is probably a typo.

None of these block the Architect's review of v1.1. Points 1 and 2 are the ones to settle before the build.

---

## Round 3 — review of v1.2 (18 November 2026)

*Added by the Builder at Carl's paste, verbatim.*

[S2], [S3], [S4] answered. One correction:
1. **[S1]'s "everything from the blobs on draws exactly as today" does not fit the timing.** The jump is at story 2 s;
   the floor is hidden ~7.5 s later (~9.5 s). The blobs come out at 4.72 s (`hero-scene.ts:2191`), after the landing
   (~2.7 s), the 2 s wobble (`LAND_WOBBLE`), the pool growing from touchdown, and the 3 s emission (`EMISSION.seconds`).
   So the floor is still drawn through the landing, the pool, the emission and ~5 s of blobs. The rain and steam claim
   holds. The checks should say: blob frames identical to the reference only AFTER the hide; [R5]'s present-vs-absent
   check covers touchdown → hide by name.
2. Small: the hide threshold in output levels (the glow's brightest added pixel below one 8-bit level), not "strength ~0",
   so the hide is not seen as a step.

Nothing further blocks the Architect's review. Carl's decisions before the build: form A/B; centre vs contact; sketch route (a)/(b).

---

## Round 4 — review of v1.3 (18 November 2026)

*Added by the Builder at Carl's paste, verbatim.*

[T1], [T2] answered. Ready for the Architect; housekeeping only:
1. §4 still names the CENTRE as the default; D-101 (Carl, *"a rough circle from the leaning logo base"*) is cited only
   in the changelog. §4 should quote it beside the 16 November "centre", and the confirming question should name both
   readings of "base": the contact edge (the c's end) or the footprint under the leaning logo.
2. Line 114 "~7.5 s after the jump" vs line 125 "a trace to ~7 s": 7.5 s (3τ) is right.
3. The checks state the touchdown → hide window twice (lines 156 and 158); once is enough.
4. The v1.2 changelog's "everything after the blobs draws as today" could carry "(corrected in v1.3, [T1])".
