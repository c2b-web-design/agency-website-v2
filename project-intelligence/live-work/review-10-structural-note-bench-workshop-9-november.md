# Review 10 — the Architect on the workshop note v2.0 (9 November 2026, session 2)

**Subject:** `structural-note-bench-arch-removed-9-november.md` v2.0 (the camera bench as a workshop). **Routed by Carl**
(*"wait for the architects review."*). Pasted into the Builder's session by Carl and saved verbatim below.
**Builder's check (same day):** all eight findings were confirmed in code: the `(0, 0, d)` sites at `:244`, `:739`, `:824`,
`:837`, `:979`, `:1466`; `CAMERA_KEY` and `EYE_KEY` (`:216`, `:218`, `:1010`, `:1021`); `bench-builder-take.ts:46`;
`lettering-hooks.tsx:91–94`; the glow script's hooks (`:3`, `:21`, `:40–41`). Answered in v2.1.

---

v2.0 is the right shape, and Carl's workshop model justifies it. I checked the saved-take conversion: rewriting a chain's units from {up 0, zc 16} to {up 429.05, zc 0} moves every pose by exactly the same amount as the world (toWorld, camera-bench.tsx:238). Shape clips are stored in units too (:738, :745–748), so they move with it. The seven ?blank=1 sites are as listed, and the workshop reference exists.

But the rebase is less self-contained than the note says. Several things are stored or written in world coordinates and would end up 4.29 m out of place.

Findings

1. Home and the camera defaults are written relative to the old origin, so "Home unchanged at 4.29 m up" is false as written.
These sites put the camera at (0, 0, d) in world coordinates:
- frontIn (:244)
- the barrel's "default" start (:739)
- the rig's fallbacks (:824, :837)
- the third-person eye's default at (0, 0, 3d) (:979)
- the starting camera (:1466)

After the rebase, y 0 is the floor, so every one of these lands at floor height. The Builder's take uses world positions too (bench-builder-take.ts:46: to [0, 0, −800], spiralStartZ 1730, spiralEndZ 616), and that file isn't in the file list. Each site needs the new up and front added, or should go through toWorld.

2. The remembered camera and third-person eye are saved in world coordinates and aren't converted.
CAMERA_KEY and EYE_KEY store world positions (:213–218, :1006–1021). After the rebase the free camera (without ?blank=1) and the eye (on both URLs) would reopen 4.29 m lower relative to the floor, which puts the default height on the floor itself.
- Fix: convert them along with the chain, or bump their keys so they fall back to the default view. Either is fine; the note needs to say which.

3. The rebase quietly decides the lighting, and step 1 isn't one variable.
In v1.6, whether to correct the swapped hemisphere light was Carl's open decision. Here it becomes a side effect of moving the origin. Step 1 also mixes three changes:
- removing the arch, which should change no pixels;
- the rebase, which visibly changes the light;
- the saved-chain conversion.

Recommended: three steps.
1. v1.0 as written: the arch out, its numbers frozen, checked by a pixel-identical comparison.
2. The rebase, with Carl choosing either the corrected light, or the light kept exactly as it is (the lights placed at their measured world positions today).
3. The slot, again checked pixel-identical.

4. The new ready signal promises less than the old one (part of Q1).
Today drawn comes after the arch's compileAsync has compiled the whole scene (decisions.md:7591). "The bench's first drawn frame" would fire before the hero's fonts, the logo's worker and the HDRI have arrived. The slot needs an optional ready from the idea, with drawn meaning the first frame after it.

5. Two things from earlier decisions lose their footing when the medium names no idea.
- The reflection switch. The reflection note's R8-5 switch is keyed on medium.heroText, and this note removes that field. The note needs to name the replacement, e.g. the idea's materials for the active medium.
- Keeping WebGPU code out of the WebGL bench. Route B (the text-material note) keeps three/webgpu out of the WebGL bench. A single hero-idea.tsx that imports the acrylic and the bloom directly would pull that code into the WebGL path. The hero's WebGPU-only parts need their own lazily loaded file, which probably means a third new file. That widens the scope.

6. The standing glow check reads hero-named hooks from the bench.
hero-bloom-measure-9-november.mjs loads ?blank=1 (:18) and reads __heroBloom, __heroBloomOff and __benchScene (:3, :21, :40–41). The note's dependency list only mentions world positions. Either keep these hooks through the slot, or rename them and update the script in the same change.

7. "d does not vary with the canvas" is only true for wide windows.
frontDistance takes whichever of the width and height limits is larger (lettering-hooks.tsx:91–94), and all three measured sizes were wide (2.3–2.9:1). Freezing d is fine with no arch. But it retires a deliberate earlier decision, the live d for Home, the far plane and the rig's first pose (camera-bench.tsx:240–243, note v3.2 §4). The note should say it retires that.

8. The measurement plan lost v1.0's tsc, lint and clean-console checks. Add them back.

Answers

- Q1, what the slot is missing: an idea-reported ready (finding 4), post and materials keyed by medium (finding 5), and the dev hooks (finding 6).
- Q2, saved chains: convert them, as recommended. The maths is right. Extend the conversion to the remembered camera and eye (finding 2), and update the Builder's take (finding 1).
- Q3, moving the glow's ownership:
  - No new renderer-state hazard, as long as BenchScene keeps owning and calling the instance exactly as it does now (:1269–1277) and only the factory's source moves.
  - Two conditions:
    - post must be keyed by medium, because the bloom treats the renderer as a WebGPU one and would break under WebGL.
    - The throw-catch stays the bench's job. The known limit (TSL build errors don't throw, :1260–1263) carries over unchanged.
- Q4, the build steps: no. Use the three steps in finding 3.

For Carl

- Lighting: correct the light as part of the rebase, or keep it exactly as you judged it? That's now your decision inside step 2, rather than a side effect.
- Scope: besides the two files the note names, this would also touch bench-builder-take.ts, and probably needs a third new file for the hero's WebGPU-only part.
