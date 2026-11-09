# Review 7 — the Architect on the reflection note v1.4 (9 November 2026, session 2)

**Subject:** `structural-note-hero-logo-reflection-9-november.md` v1.4. **Routed by Carl.** Pasted into the Builder's
session by Carl and saved verbatim below. **Builder's check (same day):** every finding verified against the code and r185
before v1.5 was written. Findings 1 to 8 confirmed as stated. Finding 6's sign proof was read in source. Answered in v1.5.

---

I've read the note against the code it cites and against three r185's source. Every line reference I checked is accurate, and the main mechanism holds: fromScene with position and a reused renderTarget does what the note says (PMREMGenerator.js:137–175). But one gap would let the whole measurement plan pass with no text in the reflection at all, and two expectations are probably wrong. In order of severity:

Findings

1. The capture's default range is 1 metre, so the text would be cut off and every check would still pass.
The world is in centimetres (LOGO_WIDTH_CM = 200 is used directly, hero-logo.tsx:31). fromScene defaults to near = 0.1, far = 100 (PMREMGenerator.js:137), which is 100 cm, and the text sits 100–300 cm from the logo. The note never mentions near or far.
- The background is forced to the far plane anyway (Background.js:117), so the null control would pass.
- The negative control only says the text may change pixels only on surfaces facing it. If no pixels change at all, it passes too.
- Fix: pass near and far in cm, and add a positive control: the text must change some pixels.

2. In the upright pose, the capture point sits inside the text's own depth.
The logo's face is on the text's face plane (HERO_LOGO_PLACE.face), so its centre is about 3.8 cm behind it. The text is 8.1 cm deep (TEXT_BACK_Z). From there each line of text is seen exactly edge-on: you'd see the side of the nearest letter, not the words. The bench currently mounts pose="upright" (camera-bench.tsx:1480).
- That is physically right, but it means the first look will show almost nothing.
- Either judge the reflection in the lean, or tell Carl this before he looks.

3. The text's edge glow depends on the viewer, so it changes in the capture.
The emissive is (1 − N·V)^2.5 (hero-text-material.ts:60–62), worked out from the cube camera's position. In the lean, the capture point is roughly 44 cm in front of the text and to its right. From there the flat letter faces are at a grazing angle, so they glow at roughly 30–75% of full strength. On the page they are near 0. So the reflection may show glowing slabs, not "bright edge-lit shapes". These figures are my geometry from the code, not measured.
- Suggested check: render the capture texture itself to an image and look at what the logo "sees" before judging the logo.

4. "Between frames" is not a safe enough guarantee: there is a known async compile running at the same time (answers Q9, and bears on Q3).
On ?blank=1 the hidden arch is still mounted (camera-bench.tsx:1467–1469). Its compile wait runs compileAsync(scene, camera) over the whole scene (lettering-piece.tsx:310, bench-medium-webgpu.tsx:281–294). hero-bloom.ts:46–52 already records that an async compile reads the renderer's live target and MRT. A first capture fired "when the scene is ready" can land inside that window.
- Fix: gate the first capture on the arch's compile wait having finished (onReady / drawn).

5. Finding 1's copied lights won't match the page.
The directional light's target is the world origin, but its position is set inside the blank canvas's group, which is offset by [0, world.floor, world.z1]. Copying the same constant into a reflection scene built in the group's frame changes the light's direction by that offset. So the claim that the two "cannot drift" is not true as written.
- Fix: build the reflection scene in world coordinates, or set the light's target explicitly.

6. Finding 2 (Q8): the rotation signs can be settled from source, but the null control can't demand an exact match.
- The signs agree. Both rotations are makeRotationFromEuler(e).transpose() applied to the lookup direction: background at SceneProperties.js:37 with Background.js:93, environment map at MaterialProperties.js:47 with PMREMNode.js:347. Both captures are render targets, so both get the same Y flip (PMREMNode.js:346). There is no WebGL-style sign flip in this path. Still run the null control.
- "Frame for frame" is unlikely. fromScene draws the background on a 32×32 sphere mesh (Background.js:131). fromEquirectangular computes each direction exactly. Expect small differences.
- Set the tolerance before running, so a mismatch isn't reinterpreted afterwards. That is the handoff's own lesson.

7. The seam has to change, and that file is missing from the list.
PmremLike has no fromScene (bench-medium.ts:91), so bench-medium.ts changes. It is in open scope, but not in Files, v1.4. The note also doesn't say what the WebGL bench does: HeroLogo gets pmrem there too, with clay text.

8. A single capture point distorts nearby objects.
A cube capture treats everything it sees as infinitely far away. With the text 0.5–3 m from a 2 m body, the reflected text will land in noticeably the wrong place on the surface, more so on the solid than the liquid. This belongs in the Expectation paragraph.

9. The document is hard to review in its current form.
The current proposal has to be pieced together from four versions. The formers still appear as the recommendation (lines 67–72, Q1). The orange hotspot former's fate under the HDRI isn't stated: "Not in it: the formers" may or may not cover it, and it is still in Not decided here. A consolidated v1.5, with superseded sections moved to an appendix, would stop the Architect reviewing text that no longer applies.

On the open questions

- Q10 (ownership): one alternative wasn't weighed: build the text once in camera-bench.tsx and pass it down to both HeroText and HeroLogo. That keeps data flowing one way, with no child-to-parent callback. It does move who owns the text's lifetime, so it is structural too. I'd put it beside onBuilt rather than choose for the Architect.
- Q4 (marching cubes first): findings 2 and 3 suggest the solid will show little of the text, which fits Carl's "not so much in the solid state". The reflection mostly pays off in the liquid, which is still unproven under WebGPU. That's context for the Architect, not a reason to reopen Carl's "apply the metal and reflection".
