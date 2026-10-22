# Architect plan responses: Film 4, PASS 1 TAKE 2, the lockup as an arch (22 October 2026, session 2)

> ⚠ **TRANSCRIBED BY THE BUILDER** from the text Carl pasted into the Builder's chat, verbatim. **The Architect's window
> is the authority if the two ever differ** (`handoff-protocol.md` §2.5). The approved plan:
> `live-work/film04-pass1-take2-arch-plan-22-october.md` (v2.1, Carl: *"Lets proceed."*). Between responses 1 and 2,
> the Builder put the two open questions to Carl: the lever (**wider letter-spacing**) and the letters (**all upright**).

---

## Response 1, on v1. Verdict: approve with amendments

Verdict: approve with amendments. The plan keeps what take 1 proved (the font proof, the kerning route, the chamfer rule and the regression check against R-088's 13,676 triangles) and adds no new mechanism. But my estimate from the font's own numbers says the default arch will collide on its first build. The check that is meant to catch that collision also can't detect an overlap. Both should be fixed before building.

**Fix before build**

1. The default arch is predicted to collide, so the decision belongs to Carl before the build, not at a stop afterwards. I worked this out from geist-semibold.typeface.json. It is an estimate: I ignored kerning and ran no code.
- The arch is very tight. "company"'s advances are c 806, o 838, m 1,239, p 863, a 806, n 835 and y 792, in units where 1 em = 1,389. From the c's centre to the y's centre is 5,380 units, about 3.87 em. Over a 180° sweep that gives a radius of about 1.23 em where the spacing is held, at the middle of the x-height. The x-height (the "x" glyph's top) is 742 units, or 0.53 em, so the baseline circle sits at only about 0.97 em.
- The m and p collide at their stems. The m's right stem reaches the baseline at x = 1142 (from its outline), and the p's left stem is at 97. At the baseline radius, their facing edges overlap by about 51 units, roughly 0.04 em (about 6 px at 160 px type). The overlap runs through the bottom 0.06 em or so of the stems.
- The a and n probably collide too, by about 0.05 em. That one rests on an assumption I couldn't see in the outline: that the a's right side reaches the baseline.
- The tops fan open. At the top of the x-height, the m–p gap is about 2.7 times the flat gap.

This follows from the brief rather than a fault in the build: seven letters standing on their feet in a half circle force a radius only about 2.3 times the x-height. Three ways out, each Carl's call:
- Tracking. This keeps the feet vertical, as Carl described. By my numbers, +0.1 em clears m–p with about 0.07 em to spare, because the radius grows with the length of the arc.
- Hold the spacing at the baseline instead of the x-height middle. That removes the collisions, but the tops open about 4 times.
- A smaller sweep. That clears the collisions too, but the feet tilt.

The plan should state the predicted radius and the collision, and ask Carl which lever before the build.

2. "Closest approach" as specified can't report an overlap. The minimum distance between two sets of outline points is always positive, even when the shapes cross, because the points of overlapping outlines don't coincide. The check has to test for intersection first: crossing segments, or a point of one outline inside the other. Only if they don't intersect should it take the distance from point to segment. As written, the collision stop would pass the m–p case above.

**Should be in the plan**

3. Say plainly what "upright feet" means. In the radial reading, the c and y are turned 90°: they lie on their sides, with their baselines vertical, reading up the left leg and down the right. They are not standing upright. The plan's "the feet stand truly upright" will read to Carl as the opposite. Carl was asked "upright or bent" and answered "Other", so there are three readings, not two:
- radial (the plan's take)
- upright letters placed along the curve, with no rotation
- warped

The upright reading costs one rotation set to zero, so it could be kept behind a switch. Carl is still shown one take, as the standing rule says.

4. The sweep slider clip.
- At sweep 0 the radius is infinite. Clamp the slider, or hand over to the line layout below a small angle.
- Bending only turns each letter. The extruded letters should be built once and only their positions and angles changed per frame, not re-extruded and re-merged on every tick. Record the build time either way. Above about 33 ms per tick, the slider stutters live, and the run can't be filmed smoothly in real time.

**Minor**

5. The fan stat says "cap height". "company" is lowercase, so use the x-height, the same measure as the reference radius.
6. Measure the lintel gap from the lintel's lowest ink. "Your" has no descenders, but a client's top word may ("Typography"). Measuring from the lowest ink, or adding the lintel and the arch to the closest-approach check, makes the swap safe.
7. Use the browser's positions for the centres. Compute each letter's centre from the browser's x positions, so kerning carries onto the arc. Use the JSON advance only for the last letter.

**What holds**

- Each line's font proof and kerning, run separately.
- The sweep measured between the first and last letters' centres, so the feet land at exactly ±90°.
- The x-height half taken from the "x" glyph. I read 742 units, consistent with the plan.
- Framing that fits both width and height.
- Both kern-on spans kept as the accessible text, in reading order.
- Take 1 kept at ?layout=line, with a regression check against its recorded numbers.

Points 1 and 2 decide whether the first build produces a usable take or a stop. These findings are for Carl to route.

---

## Response 2, on v2. Verdict: approve (fold in two amendments; no further round)

Verdict: approve. Fold in the two amendments below; no further review round is needed. v2 takes up all seven v1 findings. Carl has ruled both open questions: wider letter-spacing, and all letters upright. That leaves fewer geometry problems than v1, since upright letters don't fan, and the collision check can now see an overlap. Two things in it would quietly go wrong, and both are fixes to text, not design.

**Fold in before build**

1. With tracking on, the kerning measure stops measuring kerning.
- Take 1 defined kern as the kern-on gap minus the kern-off gap at tracking 0. In v2 the kern-on span for "company" carries archTrackingEm, so every gap includes the tracking.
- The effect: all six pairs read as kerned, "kerned pairs > 0" passes whether or not any kerning exists, and the zero-pairs stop can never fire.
- Fix: subtract the tracking from each pair (archTrackingEm × sizePx), or take the kerning from a tracking-0 reading.
- Take 1 recorded 8 of its 9 pairs as kerned (R-088), so "company" should still pass honestly once the tracking is subtracted.

2. The collision check could make the sweep stutter, which is what the per-letter meshes were meant to prevent.
- "Every pair" in the lockup is 11 letters, so 55 pairs. Testing every segment of one outline against every segment of the other runs to around a million segment tests at curveSegments 12.
- If the bench reruns this on every slider tick to keep its warning live, it can exceed the 33 ms budget and spoil the filmed sweep.
- Fix: test the full outlines only for pairs whose bounding boxes come within the margin, or run the check once the slider stops moving.
- Record its time separately from the layout time, so a slow tick can be traced to its cause.

**Small, state in the text**

3. Where the tracking sweep gets its positions. Say whether film04-arch-tracking-22-october.mjs reads the browser's positions at each step, or works them out from the tracking-0 positions (each letter shifted by its index × tracking × size, which is exactly how letter-spacing adds). If it works them out, confirm the value it chooses with one browser reading. Also, the clearance should be measured both ways: A's points against B's segments, and B's points against A's.

4. My estimate agrees with the check's expected red run. Without tracking, the a and n, near the right foot, look set to overlap by about 0.09 em, where the a's right stem crosses the n's left stem. The c and o at the left foot clear by only about 0.012 em, below the margin. So the red run at tracking 0 should fire on a–n. This is an estimate from the JSON advances and outlines: I assumed the a's right stem runs at full height, and ran no code.

**For Carl's eye, not defects**

- Spacing will look uneven around the arch. Upright letters crowd worst on the shoulders, so the tracking that clears them will leave the crown and the feet looser.
- The arch isn't symmetrical. The crown falls between the m and the p, so the left side carries three letters and the right side four.
- The y's tail drops below the c. The feet share a baseline, but the y's descender hangs lower than the c.

These come from the brief, not the build.

**What holds**

- Carl's two rulings were taken to him before the build.
- Every letter has a rotation of exactly 0, and the feet land at exactly 180° and 0°.
- The lintel is placed from its lowest ink, and the lintel is included in the collision check.
- The sweep is clamped.
- Each letter is built once and only moved, with this structure change declared and re-merging rejected.
- Take 1's merged build and its 13,676-triangle regression are kept.
- The check must go red once before it is trusted.

These are for Carl to route. With 1 and 2 in, the plan is ready for his approval.

---

## Response 3, on v2.1. Verdict: ready for Carl's approval

Verdict: ready for Carl's approval. No further review round is needed.

All four of the v2 findings are in:

1. Kerning with tracking: the tracking is now subtracted from each pair's reading, so the check can fail again (§2).
2. The sweep stutter: a bounding-box pre-filter, the check run once the slider stops, and its time recorded separately (§3).
3. Where the tracking sweep gets its positions: worked out from the tracking-0 reading and confirmed with one browser reading, with the clearance measured both ways (§3).
4. The expected red run: a–n is recorded as the pair that should fire at tracking 0.

The three notes for Carl's eye are correctly set apart as consequences of the brief, not defects.

Two small wording fixes, neither of which needs a review:

- The red-run expectation says "at least one collision on the shoulders". The pair it expects, a–n, sits between the right shoulder and the foot (by my estimate the a is at about 55° and the n at about 27°). Read literally, a correct red run could be sent for examination. Say "at least one collision (expected: a–n)" instead.
- The status lines don't match. The title says 2.1, but the line under it still says "Status: VERSION 2" and "to be saved with response 1". There are now two responses on this take. It also mentions a "table B" where the tables are labelled by version.

There's nothing else in the plan's substance. It is Carl's to approve.

*(Both wording fixes applied by the Builder in the saved v2.1.)*
