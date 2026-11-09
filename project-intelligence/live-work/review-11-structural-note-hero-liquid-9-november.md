# Review 11 — the Architect on `structural-note-hero-liquid-9-november.md` v1.0 (9 November 2026, session 3)

Pasted by Carl into the Builder's session, verbatim below. It reviews **v1.0** (v1.1 and v1.2 were written while it was
in review). The Builder's answers are in the note's v1.3, each marked **[R11-n]** in the order of the findings below.

---

I've reviewed the note, the handoff, and both hero files; next I'm checking whether D-101's reflection null control was resolved, since two requirements depend on it.

  Read 1 file

I've reviewed the note. It's well grounded and honest about what hasn't been measured, but it has four design problems I'd fix in a v1.1 before it goes to the Architect. Each one either changes how the three routes are priced or would surface as a glitch on screen.

I checked it against hero-logo.tsx, hero-bloom.ts, three r185's source and D-101 up to "THE LIQUID NOTE v1.0 WRITTEN". The arithmetic is correct: the blob diameters, cell sizes and the 28 MB figure all check out. The r185 APIs it names exist (BufferGeometry.setIndirect at BufferGeometry.js:253, and IndirectStorageBufferAttribute).

What's sound

- Every figure is marked as measured, not measured, or not tried, and Carl's words are quoted rather than paraphrased.
- The "one field" reasoning is correct: a separate logo mesh can only give a seam, never a neck.
- It proposes a cheap probe for each route before any choice is made, and includes the §5a/§5b sections the rules require.

Major findings

1. The reflection rule contradicts the "invisible handover" rule (items 3 and 7).
- The handover from the solid logo to the liquid must be invisible. That means the liquid's logo has to start with the lean's own reflection capture, which is taken at the logo's centre.
- Item 7 then retakes the capture at the space's centre "as the emergence ends". On a moving surface, that swap shows as a sudden jump in the reflection.
- Each capture also costs about 20 ms, which is more than one frame at 60 fps. Taking one mid-animation drops a frame.
- Fix: take one capture before the liquid starts, during the lean's hold, from a single fixed position, and use it for the whole sequence. Then the handover's null control tests what will actually play.

2. Fading out a thin logo's weight makes it fall apart into holes, not drain.
- The logo is 7.6 cm thick. Lowering a distance-field term's weight shrinks it evenly from every side, so the plate wears through where it's thinnest long before its 200 × 104 cm outline shrinks. On screen that reads as the logo disintegrating, which risks breaking the no-glitch rule.
- The weight ramp is therefore a visual decision, not just bookkeeping for the mass.
- Fix: make this the first probe, judged by Carl's eye. A directional drain (a front sweeping across the logo) may read as liquid where an even shrink won't.

3. Holding the volume by rescaling every frame will make the blobs visibly breathe.
- When two blobs merge, scaling all strengths together shrinks every blob, including those nowhere near the merge.
- In route A the volume reading arrives a frame late, so the correction lags and can oscillate.
- The ±1 % bar is far below what the eye can see: 1 % of volume is about 0.07 cm on the 41 cm blob. The bar is set by the measuring tool, not by perception, and the visible risk is the correction itself.
- Fix: the paths are fixed, so the motion is deterministic. Solve the strength curve once (offline or at load) along the choreography and play it back with no runtime feedback. The per-frame volume check then becomes verification only.

4. Routes A and C are priced with an unnecessary constraint: a cube grid over the space.
- Three's MarchingCubes is an ordinary mesh, so its box can be rotated to the lean and stretched unevenly. A box of 200 × 104 × ~60 cm at grid 72 gives cells of about 2.8 × 1.4 × 0.8 cm, so roughly 9 cells across the logo's thickness instead of under 3.
- A custom GPU compute grid (route A) has no cube constraint at all.
- The catch: the addon's addBall makes round balls only in grid units, so with a stretched box the field has to be filled by our own code.
- This changes the "marginal" row of the pricing table. Not tried.

Moderate findings

5. §5b misses who owns the material.
- The liquid would be mounted in hero-idea.tsx, but the material and its reflection both live inside HeroLogo (hero-logo.tsx:345–362), where a sibling can't reach them.
- That material is rebuilt when the capture arrives, and the old one is disposed a task later. A liquid holding a reference to it would draw a destroyed material, which breaks the 5 November rule.
- Fixing this means lifting the material up the tree or mounting the liquid inside HeroLogo. That is a change of ownership, so it's structural under §5a.

6. Route B's two listed couplings are misstated.
- The capture renders its own separate scene (hero-logo.tsx:229–241), so no route can ever appear in its own reflection. That isn't a B-specific risk.
- The glow pass gives every material without its own glow output a default of zero (hero-bloom.ts:84), which very likely covers B too. That should be checked, not listed as a hazard.
- B's real risk is getting identical lighting when a raymarched surface overrides the position and normal (Q-A3).

7. The logo's distance-field bake isn't priced, and its grid is too tight.
- The proposed 200 × 104 × 8 voxels holds no distances outside the surface. The raymarch steps and the blending need a margin. At ±20 cm that's about 1.7 M values, roughly 10× the note's 166 k.
- The bake works from a bevelled, domed mesh (logo-mark-geometry.ts), and its cost on the main thread versus a worker isn't stated.
- An analytic distance field built from the outline and profile might be cheaper. Not verified.

8. The handover null control has no pass bar. Item 6 sets its tolerance before the run; item 3 doesn't. At any field resolution the bevels will round off, so a comparison against the mesh will probably fail on a still frame. Decide now what happens then, for example making the swap at the first bulge, while the logo is moving.

Questions to add for Carl

- 70 L will look small. As one sphere it's 51 cm across; the largest blob is 41 cm against a 200 cm logo. Keeping the true mass will read as "less stuff", and he should see that early, in the first probe.
- The logo forming in the air from the same distance field is the Builder's addition. Carl's words cover only the emergence ("the logo only ever GIVES volume", D-101). Mark it as a take.
- Q-C3 almost answers itself. WebGL has no reflection (hero-logo.tsx:346), and Carl wants the reflection "definately in the liquid state". So route C's "works in both media" advantage is weak.

Minor

- There's no option of route C run in a Web Worker. The repo already builds the logo geometry in a worker, and this would take the 18 ms off the main thread.
- session-handoff.md is out of date. It's still session 2's: it says the reflection's null control fails, but D-101 records it fixed and committed in session 3 (719cefa). Under CLAUDE.md it should have been replaced at the end of session 3.

I haven't changed anything. If you want, I can write these as amendments for a v1.1 of the note, or save this review to live-work/ so it can go to the Architect with the note.
