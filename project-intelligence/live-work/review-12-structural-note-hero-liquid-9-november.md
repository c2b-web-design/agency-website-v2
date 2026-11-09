# Review 12 — the Architect on `structural-note-hero-liquid-9-november.md` v1.3 (9 November 2026, session 3)

Pasted by Carl into the Builder's session, verbatim below (the Architect cannot write files). The Builder's answers are in
the note's v1.4, each marked **[R12-n]**.

---

I've reviewed v1.3 as review 12. The answers to review 11 are sound, and I accept both disputes. But many adopted findings were written into the answer table and the recommendation without being carried through the rest of the note. About a dozen passages still say what v1.0 said and contradict the table above them. The fixes also leave three new design issues and a handful of smaller ones.

Accepted, no further comment

- Q-C3 disputed: accepted. You measured that visitors without WebGPU get the WebGL 2 fallback, which still runs the reflection. My "WebGL has no reflection" was about the old ?medium=webgl, which visitors don't get.
- "70 L looks small": accepted. Carl answered it on 8 November, and the first probe shows him the scale anyway.
- "The handoff is stale": withdrawn. Session 3 was still running, so that finding was mine in error.
- R11-1 to R11-8 are adopted correctly in the table, and the bar set for R11-8 is a fair one.

R12-1: Adopted findings not carried into the body (major, because the note now contradicts itself)

| Line | Still says | Contradicts |
|---|---|---|
| 38–39 | A's "grid is still marginal for the logo's thickness" | R11-4 (line 16), line 27 |
| 149–150 | A: "one cube over the space… Marginal for the emergence" | R11-4, pricing table line 199 |
| 182–189 | C: "MarchingCubes, unchanged, with its cube box"; 2.8 cm cell | R11-4 (stretched box, our own fill code instead of addBall) |
| 193 | C: "A per-frame CPU job on the main thread" | C-w (line 24). A worker is also a new mechanism under §5a, so it needs saying |
| 161 | B: the logo as "the baked 3D texture (texture3D)" | R11-7 (a 2D outline, extruded) |
| 173–174 | B's load: "baked at load from the mesh, or shipped: ~166 k values" | R11-7 |
| 204 | Media: B "WebGPU (TSL)" | Line 41–42 ("runs in BOTH systems") |
| 226 | "route B writes its own fragment" under the glow | R11-6 |
| 228 | "the hero has no reflection there… Q-C3" | Your own measurement (line 23); Q-C3 answered |
| 246 | Q-A3: "And the MRT for the glow?" | R11-6 |
| 52–53, 208–213 | "the choice… after… the probes", "one probe per route", C first | Lines 30–34, 47: B first, A only if B fails |

The media row needs three columns, not two: WebGPU, the WebGL 2 fallback, and the old WebGL medium. A runs on the first only, B on the first two (untested on the fallback), C on all three. The probe plan needs one sentence saying which plan is live.

R12-2: R11-1 moves the reflection's jump to the landing (major)

- Using one capture for the whole sequence fixes the jump during the liquid. But "no recapture until the formed logo has landed" means a recapture after landing, and a jump in the reflection on a still solid logo, which is the most visible moment of all.
- It also costs ~20 ms at that point.
- The reflection scene is static (the text and lights never move), so the landing spot's capture can be taken at load, during the lean's hold, and swapped in on the landing frame, where the impact hides the change.
- That means a second capture target held at once. It's structural under §5a, so it's for Carl.
- The trade-off should be stated, not just made: for ~5 m of travel, the liquid shows the text as seen from the lean, close and large. That probably serves Carl's "definately in the liquid state", but it's a choice.

R12-3: R11-5 runs into how the WebGPU part is loaded (moderate, structural)

- With B, the liquid's material is a TSL node material, so it must come from the WebGPU part (hero-idea-webgpu.tsx). HeroLogo imports only three and must stay that way for the old WebGL medium.
- So the liquid reaches HeroLogo through a prop slot from hero-idea.tsx, as reflect does today (hero-idea.tsx:29, 37). The Files section (lines 234–235) says hero-idea.tsx changes "only if the clock is passed down". It changes for B in any case.
- Also, "the material never leaves its owner" is true only for A and C. B has its own material and shares the logo's reflection texture. That's still safe, because the texture's lifetime is HeroLogo's, but Q-A7 should say what is actually shared.

R12-4: The volume target at frame 0 is undefined (moderate)

- The field's logo is an extruded outline. The mesh is domed and bevelled (logo-mark-geometry.ts:13), so at full weight the field's logo will not enclose 70,085 cm³.
- Measured against the mesh's figure, the ±1 % check fails on frame 0, or the mass "jumps" at the first handover.
- Fix: keep 70,085 as the target, and make the extrusion's volume at weight 1 a measured check of the approximation. That pairs with Q-A8, since the shape difference and the volume difference are the same error.

R12-5: Pricing the "solve once" curve (minor)

- Solving at load means about 300 frames × several iterations × a volume sample each. That's unpriced, and it would run on the main thread before the sequence.
- Prefer a dev-time solve shipped as a curve, re-solved for each take of the choreography.
- For B, the solved quantities are blob radii (or the smooth-minimum's blend width), not "strengths"; the wording assumes metaballs.

R12-6: C's aligned box changes three times (minor; only if C stays live)

The box aligned to the lean, the box that travels, and the box aligned to the upright logo for the formation are different grids. Each switch re-meshes the surface on a new grid, which shows as popping. The snapping rule on line 183 covers sliding a box, not swapping one.

R12-7: Small number (minor)

An outline of 200 × 104 cm with a ±20 cm margin at 0.5 cm texels is 480 × 288, about 0.14 M values, not ~0.1 M. That doesn't change the conclusion.

Recommendation: a v1.4 that carries R11 through the body (R12-1) and settles R12-2 and R12-3 before Carl approves the route. R12-4 to R12-7 can be answered in the same pass.

I can't write files from this seat, so this review exists only in the chat. If it's to be kept as review-12-… beside review 11, it needs saving from the Builder's session.
