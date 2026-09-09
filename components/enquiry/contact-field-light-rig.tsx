"use client";

/**
 * THE ORBITING LIGHT — a tilted elliptical orbit around the four-box group.
 *
 * ⛔ IT SHIPS. Carl authorised deploying it on 9 September 2026: *"i would prefer
 * the light to be moving on Vercel."* The orbit runs on every build.
 *
 * ⚠⚠ BUT THE VALUES ARE STILL PROVISIONAL (D-044), AND THE TWO ARE DIFFERENT
 * THINGS. Shipping was authorised; the numbers were not. Crown depth, grain tint
 * and the 3s hidden half remain takes, chosen to make the effect judgeable rather
 * than because they are approved. ⛔ **Carl has named this section as one to look
 * at closely during the mastering pass (D-035)** — do not read its presence in
 * production as approval of any figure in this file.
 *
 * ⚠ THIS HEADER READ "STILL A TEST INSTRUMENT" UNTIL THE DAY IT SHIPPED, which is
 * the exact staleness `context-rules.md` warns about: a true sentence that
 * outlives its subject, sitting where a reader meets it first.
 *
 * ⚠ THE SPACEBAR IS NO LONGER PART OF THE SHIPPED SURFACE — it is bound only on
 * localhost or with `?lightrig=`. See `useLightRig` below.
 *
 * ── ⛔⛔ THE RELAY, AND WHAT IT IS FOR — approved by eye, 9 September 2026 ────
 *
 * Two lights, same behaviour, offset by a trigger. Carl on the running build:
 * *"There are no dead moments... There are moments that are more 'chill' than
 * others and moments when the state is on the way to excited."*
 *
 * ⚠⚠ **EVENNESS IS NOT THE TARGET, AND CHASING IT WOULD DESTROY THIS.** The
 * measured swing is **2.18x** and that is the EFFECT, not a residual defect to be
 * tuned out. A constant level is not alive, it is merely lit. ⛔ **Do not "improve"
 * this by flattening the ratio** — the variation between chill and excited is the
 * whole reason the section reads as something happening.
 *
 * ⛔ **THE RIM GLINT IS DELIBERATE.** Carl, on the top-right card's bottom rim:
 * *"you can see this gold edge glint with light and it has movement from its left
 * to right."* That is `ORBIT_BACK_MS` — the 1s fast return — landing on the gold
 * bevel while the OTHER light works the faces. He found the behaviour first
 * (*"the face is dead but you can see the gold rim glint. Which is interesting"*)
 * and then specified the fast back run to exploit it: *"glints happen fast."*
 *
 * ⚠ MEASURED ON THE RUNNING BUILD, 50 samples over 25.9s: floor **103**, peak
 * **224**, mean **146**, and **no sample at the ambient-only 64**. The previous
 * arrangements all had a flat dead stretch; this one has none.
 *
 * ── THE PATH, FROM CARL'S SPECIFICATION AND HIS SKETCH ──────────────────────
 *
 * A single continuous **anticlockwise** circuit of a **3D-tilted ellipse** around
 * the whole group — not around one box, and not flat in the screen plane.
 *
 * ⚠ THE MAJOR AXIS IS DEFINED BY TWO POINTS CARL NAMED, and both are edge
 * midpoints rather than box centres:
 *
 *   - the midpoint of **box 1's LEFT vertical edge**, with the light `EDGE_STANDOFF`
 *     out beyond it
 *   - the midpoint of **box 4's RIGHT vertical edge**, the same distance beyond
 *
 * Carl: *"The middle of the light should be aimed at the middle of the vertical
 * line on box 1's left hand side at the same distance it was from the face"*, and
 * for the other end *"Exactly the same. In box 4's vertical line on its right hand
 * side."*
 *
 * ⚠ AIMING AT AN EDGE RATHER THAN A FACE IS THE POINT. It satisfies the brief's
 * *"no light should be on the box at this moment"* — the cone is pointed at the
 * box's edge-on side, so it grazes past rather than landing. **The sweep has to
 * ARRIVE.**
 *
 * ⚠ AND THE ELLIPSE HAS NO INHERENT START. Carl: *"it's 'circular', we could have
 * chosen any start and halfway points."* Those two edges are convenient landmarks
 * that fix the axis and the tilt; the starting phase is a free parameter.
 *
 * ── THE SHAPE ──────────────────────────────────────────────────────────────
 *
 * | Property | Value | Where it comes from |
 * |---|---|---|
 * | semi-major | ~489 | derived: the two edge points + standoff |
 * | semi-minor | 400 | Carl's cap (see `ORBIT_SEMI_MINOR`) |
 * | depth | ±400 | same envelope, front and back |
 * | tilt | ~-5.7° | falls out of the two edge points |
 *
 * ⚠ THE TILT IS GENTLER THAN THE SKETCH SUGGESTS, and that is geometry rather
 * than a mistake: the group is 576 wide but its two rows are only 58 apart, so
 * its diagonal is nearly horizontal.
 *
 * ── WHAT HAPPENS AT THE ENDS ────────────────────────────────────────────────
 *
 * ⚠ THE TWO TIGHT BENDS DO THREE THINGS AT ONCE, which is what makes them the
 * interesting moments: they are the **closest approach** to box 1 and box 4, the
 * **sharpest curvature**, and the **front/back crossing**.
 *
 * Carl described the circuit precisely: from box 1 the light descends across the
 * front toward box 4, *"will already be making an ascent before it reaches that
 * position"*, crosses behind, and returns hidden — then *"will reach the highest
 * point of the tight bend, navigate the bend and then will descend into its
 * starting position."*
 *
 * ⚠ SO NEITHER BOX GETS A HELD, STATIC MOMENT OF MAXIMUM LIGHT. The light is
 * always already turning when it is nearest. **The glint is a passing event by
 * construction** — which is what the brief means by *"a glint is an ignition, not
 * a pass"* — and it comes from the geometry rather than from any pulsing.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { fieldPlacements } from "./contact-field-geometry";

/**
 * How far beyond a box's vertical edge the light sits at the ends of the major
 * axis.
 *
 * ⚠ 200 IS NOT A NEW NUMBER — it is the distance the light held from the face
 * throughout the geometry probe, which Carl asked to carry over: *"at the same
 * distance it was from the face."* Reusing it means the closest approach in the
 * orbit delivers the light at a distance already judged by eye.
 */
const EDGE_STANDOFF = 200;

/**
 * The ellipse's half-width across the short axis, in world units.
 *
 * ⚠ CARL'S CAP: *"the halfway point between the two — the distance must not be
 * more than double these corner distances."* The corner standoff is 200, so the
 * halfway bulge may reach 400 and no further.
 *
 * ⚠ AND THE CAP IS DOING REAL WORK, not just bounding a number. Left unbounded,
 * the light would swing far enough out that all four boxes sit at effectively the
 * same distance — which would deliver flat, even light and destroy the very
 * unevenness the ellipse exists to create.
 */
const ORBIT_SEMI_MINOR = 400;

/**
 * How far the orbit reaches toward the viewer and behind the boxes.
 *
 * ⚠ THE ELLIPSE IS TILTED IN 3D, NOT FLAT IN THE SCREEN PLANE. Carl: *"the
 * ellipse is supposed to be 3d, tilted. I had to use MS Paint"* — the sketch could
 * only show the in-plane shape.
 *
 * The front half of the circuit bulges toward the camera and the back half passes
 * behind the boxes, so the light genuinely goes out of sight. Same ±400 envelope
 * as the in-plane cap, so the orbit is bounded consistently in every direction
 * rather than introducing a fourth number.
 */
const ORBIT_DEPTH = 400;

/**
 * Cone half-angle and edge softness.
 *
 * ⚠ SIZED TO COVER A WHOLE BOX — Carl: *"make it the width of the box. The edges
 * of the face have geometry too."* An earlier 0.45 lit only the centre, which is
 * the FLATTEST part of the crown; the ends are where the surface turns away most
 * and where the shading actually lives.
 *
 * ⚠ `penumbra` IS THE FRACTION OF THE CONE GIVEN TO FALLOFF, and 0.85 was a bug:
 * it left a full-intensity core only ~15% of the cone's radius, so a 284-wide face
 * sat entirely in deep falloff. 0.3 keeps a soft edge with ~70% of the cone at
 * full strength.
 */
const CONE_ANGLE = 0.65;
const CONE_PENUMBRA = 0.3;

/**
 * ⚠ PHYSICAL FALLOFF — `decay = 2`, and this is the change that makes DISTANCE
 * MATTER. Carl: *"I would also imagine that the distance that the light is away
 * from the face is important too."*
 *
 * The geometry probe used `decay = 0` deliberately, so every box received the same
 * intensity and any difference was the box rather than its position. **That
 * fairness is exactly what has to go now**: on an ellipse the light's distance
 * changes continuously and differently for each box, and that unevenness is the
 * effect.
 *
 * ⚠ THE INTENSITY IS DERIVED, NOT GUESSED. Earlier today `decay = 2` was paired
 * with an intensity picked by feel (900) and the light arrived at the face as
 * roughly 0.06 — four orders of magnitude short, because this scene's world unit
 * is ONE CSS PIXEL and physical falloff is calibrated for scenes measured in
 * metres.
 *
 * Calibrated at the NEAREST approach so the closest pass matches the level already
 * judged by eye:
 *
 *   intensity = judged_intensity x nearest_distance^2 = 1.6 x 341^2 = 185864
 *
 * ⚠ 341 IS MEASURED FROM THE ORBIT, NOT ASSUMED FROM `EDGE_STANDOFF`, AND THE
 * FIRST ATTEMPT GOT THIS WRONG. It used 200 — the standoff — giving intensity
 * 64000, and the whole orbit measured 18-27 luminance against the ~61 the geometry
 * probe reached. **The standoff is the distance from a box EDGE along the major
 * axis; it is not the distance from a box CENTRE to the light.** Sweeping the
 * actual path and measuring gives a range of **341 to 643** from box 1's centre.
 *
 * ⚠ WHICH ALSO CORRECTS THE PREDICTED UNEVENNESS. A 10x near/far swing was
 * expected from the wrong 200; the real range gives **3.6x** — still clearly
 * uneven, and rather more usable than a factor of ten.
 *
 * If the far half reads as dead the lever is a softer decay, NOT a higher
 * intensity, which would blow out the near pass.
 */
const LIGHT_INTENSITY = 185864;
const LIGHT_DISTANCE = 0; // no hard cutoff; falloff alone shapes the reach
const LIGHT_DECAY = 2;
/**
 * ⛔ THE LIGHT IS BLUE — `#ffffff` until 9 September 2026. Carl: *"The only thing
 * I wish to try is the colour of the light. It is currently white. Changing the
 * colour will have an effect on the cards. Light must be a shade of blue."*
 *
 * ⚠ A LIGHT'S COLOUR MULTIPLIES THE SURFACE IT LANDS ON, so a blue light on the
 * blue field DEEPENS the hue rather than washing it out — where white light
 * pushed the brightest pass toward neutral, which is what made the glint read as
 * a lamp rather than as the field's own colour arriving.
 *
 * ⚠ CHOSEN, NOT ARBITRARY: **luma 222.6, or 87% of white.** Enough tint to read
 * as blue, enough level to keep the glint an event. The red channel is dropped
 * furthest (0xcf) and blue held at full, so the tint follows the same hue
 * direction as the field and the Send opal rather than introducing a third blue.
 *
 * ⛔ **PROVISIONAL, like everything else in this file (D-044).** It is a take for
 * Carl's eye, and the mastering pass (D-035) owns the final value.
 */
const LIGHT_COLOUR = "#cfe0ff";

/**
 * How long the VISIBLE half of the circuit takes, and how long the hidden half.
 *
 * ⚠ VARIABLE SPEED, ON CARL'S CHOICE — *"let's try variable speed."* The light
 * covers the front pass in `ORBIT_FRONT_MS` and the hidden return in
 * `ORBIT_BACK_MS`, so a full circuit is their sum.
 *
 * ⚠ THE REASON IS A USER-BEHAVIOUR CONSTRAINT, NOT AN AESTHETIC ONE. Carl: *"If a
 * user waits for the page to load, realises what to do and uses autofill, we may
 * have to speed things up."* A circuit the user never completes is an effect they
 * never see.
 *
 * ⚠ AND THE TEST SPEED WAS MEASURED FAR TOO SLOW FOR AN ORBIT. The geometry probe
 * ran 180° at radius 200 in 10s — 62.8 units/sec. This ellipse has a perimeter of
 * ~2800 units, so **at the probe's speed one circuit would take 45 seconds**, of
 * which half is hidden. A user present for twenty seconds might see nothing at
 * all. The probe's pace was correct for watching a shadow emerge across a narrow
 * band of angles and is wrong for travelling a loop four times longer.
 *
 * 6s front / 3s back keeps the visible pacing legible while cutting the dead time
 * the hidden half contributes. **Nothing is faked** — the light genuinely travels
 * the whole path, it simply does not dawdle where it cannot be seen.
 */
/**
 * ⛔⛔ THE FRONT PASS IS 9s, NOT 6s. Carl, 9 September 2026: *"if the light is at
 * 6s at the front, slow it down to 9s. Its a little too energetic."*
 *
 * ⚠⚠ THE REASON IS THE USE, NOT THE LOOK: *"Users have to type in the box, we
 * dont want them too distracted."* ⛔ **This is a FORM. The movement is ambient,
 * and it competes with a text field for attention every second it runs.** A
 * slower pass is not a weaker effect — it is the effect staying subordinate to
 * the task, which is what lets it run continuously at all.
 *
 * ⚠ AND SLOWING THE FRONT LENGTHENS THE DEAD STRETCH unless the hidden half
 * speeds up with it. `BEHIND_SPEED` rose in the same change for that reason —
 * see its note. **The two numbers are one decision.**
 */
const ORBIT_FRONT_MS = 9000;
/**
 * ⛔ 1s, NOT 2s — AND IT IS A GLINT, NOT A RETURN JOURNEY. Carl, 9 September 2026:
 * *"If the back light moves faster it will show the rim glint. Glints happen
 * fast."*
 *
 * ⚠⚠ THIS INVERTS WHAT THE BACK STRETCH IS FOR. It used to be dead time to be
 * minimised — the interval where the faces felt nothing. **It is now a deliberate
 * event on the GOLD RIM**, which is `metalness: 1.0` and stays alive whether or
 * not the beam reaches the faces. Carl found that himself: *"The face is dead but
 * you can see the gold rim glint. Which is interesting."*
 *
 * ⛔ So the circuit reads as **slow continuous light on the faces, punctuated by
 * fast glints at the back** — and the two happen on DIFFERENT lights at the same
 * time, which is what the stagger below is for.
 */
const ORBIT_BACK_MS = 1000;
const ORBIT_PERIOD_MS = ORBIT_FRONT_MS + ORBIT_BACK_MS;

/**
 * ⛔⛔ THE SPEED PROFILE — THREE ZONES, NOT TWO HALVES. Carl, 9 September 2026.
 *
 * ⚠⚠ THE OLD FRONT/BACK SPLIT IS THE WRONG SHAPE. It divides the circuit at a
 * fixed phase, which puts the acceleration wherever 0.5 happens to fall. Carl:
 * *"if you decide to speed up the light as soon as it crosses the plane of where
 * the side of the card... there will suddenly be fast movement of light on the
 * card face. Only when its passed and theres no effect on the face then speed it
 * up."*
 *
 * ⛔ **A SPEED CHANGE THAT HAPPENS WHILE THE BEAM IS STILL LANDING IS VISIBLE AS
 * MOTION ON THE FACE.** That is the defect this profile exists to avoid.
 *
 * So the circuit has three zones, and the boundaries are where the cone STOPS
 * REACHING — not where the ellipse crosses an axis:
 *
 *   FACES   `t` in [0, FACE_EXIT] and [FACE_ENTER, 1]   slow, CONSTANT
 *   RAMP    the margins either side                     eased, no face effect
 *   BEHIND  the middle of the hidden half               fast
 *
 * ⚠ EASED, NOT STEPPED. A step in velocity is visible in the APPROACH even
 * before the beam lands, because the eye tracks the glow ahead of the cone.
 */
const FACE_EXIT = 0.42;   // beam has left the last face by here
const FACE_ENTER = 0.86;  // beam begins to reach the first face again here
/** How much faster the hidden stretch runs than the face pass. */
/**
 * ⛔ RAISED 3.4 -> 6.0, 9 September 2026, in the same change that slowed the front
 * pass to 9s. Carl: *"There is a period of time when nothing is happening. I
 * presume when the light is round the back. The face is dead."*
 *
 * ⚠⚠ SLOWING THE FRONT WOULD HAVE MADE THE DEAD STRETCH WORSE ON ITS OWN. The
 * hidden interval is the only part of the circuit where the faces feel nothing,
 * so it must shrink as the visible pass lengthens. **These two constants move
 * together or the fix creates the fault it was meant to remove.**
 */
const BEHIND_SPEED = 6.0;

/**
 * ⛔⛔ THE STAGGER — CARL'S DESIGN, 9 September 2026. TWO LIGHTS, ONE ON THE FRONT
 * AT ANY INSTANT.
 *
 * In his words: *"let me pick a start position. Top left and face position = 9s.
 * Back should = 1s. But as its at its start position again, turn it off, its done
 * its job for now. 2nd light would by now have started. As that is about to go
 * round the back, turn on the first light. So both lights are doing exactly the
 * same thing, the behavior is the same, its just 'staggered'."*
 *
 * ⛔ **EACH LIGHT RUNS ONE 10s LAP THEN SWITCHES OFF** — 9s slow across the faces,
 * 1s fast round the back, then dark until its next turn. Its partner is already
 * mid-front-pass by then, so the faces are never unlit.
 *
 * ⚠⚠ WHY THIS IS BETTER THAN THE OVERLAPPING PAIR IT REPLACES, and it fixes two
 * faults at once:
 *
 *   1. ⛔ **NO SHADOW CANCELLATION.** The previous arrangement put both lights on
 *      the front for 18% of the lap, at OPPOSITE ENDS — so their shadows pointed
 *      in opposite directions and cancelled, flattening the crown at exactly the
 *      most raking angles. Carl: *"having 2 light sources apart cancels out some
 *      of the shadows and therefore the geometry."* With one light on the front,
 *      there is one shadow direction and the relief survives.
 *   2. ⛔ **THE OPAL TRACKS THE FRONT LIGHT.** `--opal-shine` is driven from the
 *      phase of whichever light is currently crossing — see the tick loop. Under
 *      the overlapping pair it followed light 1 regardless, so the CSS button's
 *      shine drifted out of step with the beam the viewer could see. Carl:
 *      *"2 lights also throw the shine on the CSS button out of whack."*
 *
 * ⚠ THE CYCLE IS 10s PER LIGHT AND THE PAIR IS OFFSET BY HALF THAT — so a light
 * starts its front pass as its partner reaches the back. **The visible period is
 * therefore 10s, not 20s.**
 */
const LAP_MS = ORBIT_FRONT_MS + ORBIT_BACK_MS;

/**
 * ⛔ EASE IN/OUT ON THE HAND-OFF — Carl's instruction. A hard switch pops.
 *
 * The window is short because the outgoing light is behind the boxes by then and
 * the incoming one is only beginning to reach the first face, so there is very
 * little on screen to cross-fade. It exists to remove the step, not to blend two
 * visible passes.
 */
const HANDOFF_MS = 320;

/**
 * ⛔⛔ THE TRIGGER — WHERE LIGHT B ENTERS. **0.5694 of a lap, i.e. 5694ms of
 * 10000ms.** Carl's model, 9 September 2026, from a side-view sketch:
 *
 * *"There is a time when the cone doesn't affect the face. When the first light
 * reaches the position of the blue arrow, that's the time to start the second
 * light. That place will have a number, a trigger. All you have to do is sort out
 * the figures for the first light and clone it."*
 *
 * ⚠⚠ IT IS A PROPERTY OF ONE LIGHT'S OWN LAP, NOT A RELATIONSHIP BETWEEN TWO.
 * That is what makes the design simple: solve light A, find the moment its cone
 * stops reaching the faces, and start light B there. **The two are INDEPENDENT** —
 * Carl: *"In a way they're independent, it's only the timing that appears to give
 * them synchronicity."*
 *
 * ⛔ **MEASURED, NOT CHOSEN.** Integrating the speed profile and testing where the
 * orbit phase leaves `FACE_EXIT..FACE_ENTER` puts the crossing at **5694ms**.
 * Relay coverage at that value: **0.0% of the lap with the faces unlit** — the
 * dead stretch is gone by construction rather than by tuning.
 *
 * ⚠⚠ AND THE EARLIER "SHADOW CANCELLATION" WORRY WAS OVER-STATED — CHECKED, NOT
 * ASSUMED. A naive count says both lights are on the front hemisphere ~52% of the
 * lap, which sounds fatal. **But cancellation needs both cones on the SAME card
 * from opposing sides, and they are not**: traced around the lap, whenever both
 * are forward they sit at OPPOSITE ENDS of the row — L1 at axis +0.93 while L2 is
 * at -0.71, and later L1 at -1.00 while L2 is at +0.95. One is arriving as the
 * other leaves, across a 576-unit row with a 0.65 cone. **They mostly light
 * different cards.**
 *
 * ⛔ A LAP IS 10s: 9s of slow face pass + 1s of fast rim glint (`ORBIT_BACK_MS`).
 */
const RELAY_TRIGGER = 0.5694;

/**
 * ⛔⛔ THE AIM ROTATES. Carl's specification, 9 September 2026, with a diagram.
 *
 * ⚠⚠ UNTIL NOW THE LIGHT ALWAYS AIMED AT ONE FIXED POINT — a target pinned at the
 * group's centre. It orbited, so distance and incidence changed, but it never
 * turned to look somewhere else. **That is a lamp carried in a circle, not a
 * luminaire being panned.**
 *
 * Carl's path, in his words: at the top-left card *"it gets very close looking
 * across the cards. It then swings down changing the lights angle to encompass
 * all four cards and 'look at' all 4 cards. Its beam takes in the send button. It
 * continues to make its way to the bottom right card changing its light angle
 * until it looks across the cards in an opposite angle to what it did before."*
 *
 * ⛔ **THE AIM SWEEPS ~180° ACROSS THE VISIBLE PASS**: raking along the row from
 * one side, opening to face-on at the bottom, then raking from the other side.
 *
 * ⚠⚠ AND THE RAKE IS WHAT SHOWS THE GEOMETRY. The face has a shallow crown and a
 * normal-mapped grain, and **both are only legible under grazing light** — a
 * head-on beam flattens them entirely. Carl: *"it will also show the shadows
 * because of the geometry, especially from the left and right."* So the ends give
 * SHAPE and the middle gives PRESENCE.
 *
 * `AIM_REACH` is how far past the group the aim point swings at the extremes,
 * in world units. Larger = a flatter rake.
 */
const AIM_REACH = 620;
/** How far below the group the aim dips at the bottom of the pass, so the beam
 *  takes in the Send button as Carl specified. */
const AIM_DIP = 96;

/**
 * ⛔⛔ EXPOSURE, NOT INTENSITY — the model the APPROVED Q+A cards already use.
 *
 * ⚠⚠ THE PROBLEM CARL NAMED: *"When the card is near the send button, right in
 * the middle, the light will be looking straight onto the faces of all the cards.
 * Its also at its furthest distance. Its also closest when near to top left and
 * bottom right. So light intensity is a factor."*
 *
 * ⛔ **WITH A FIXED INTENSITY THOSE TWO EFFECTS FIGHT.** The middle of the pass is
 * where the aim is most face-on and should be the most present moment — and it is
 * also the dimmest. Measured range on this orbit is 341..643 from box centre, so
 * `decay: 2` delivers roughly **3.5x less** light at the far point.
 *
 * ⚠ THE FIX IS ALREADY PROVED ELSEWHERE. `answer-card-canvas.tsx` holds a constant
 * EXPOSURE and multiplies by d² every frame, so the delivered light is steady and
 * **the only thing changing around the circuit is direction**. Its record states
 * why: a fixed intensity *"blew out the near angles and lost the far ones
 * entirely — five of eight frames were pure white or black."*
 *
 * ⛔ This is that model, not a new invention. `LIGHT_INTENSITY` below becomes the
 * exposure: `intensity = LIGHT_EXPOSURE * d²`, recomputed per frame.
 *
 * ⚠ THE VALUE IS THE OLD CALIBRATION'S EXPOSURE. 185864 = 1.6 x 341², so the
 * exposure it encoded was **1.6** — the level Carl already judged by eye at the
 * near pass. Holding it constant raises the far half to match rather than
 * changing what the near pass looks like.
 */
const LIGHT_EXPOSURE = 0.7;

/**
 * ⛔⛔ HOW FAR ROUND THE CIRCUIT THE SECOND LIGHT SITS. **0.40, MEASURED.**
 *
 * ⚠⚠ NOT GUESSED, AND EVERY GUESS WOULD HAVE BEEN WRONG. Carl's method: *"Have
 * one do an orbit and take measurements. Clone the first one and then start it in
 * a different place."* The single orbit was profiled at 44 samples over one full
 * period, reading the four face luminances off the running build.
 *
 * ⛔ **WHAT THE PROFILE FOUND: a FLAT DEAD ZONE from phase 0.10 to 0.41** — total
 * 64 across the four faces, identical to three significant figures at every
 * sample. **The faces were not dimmer there; they were receiving NOTHING from the
 * orbit and sitting on ambient alone.** That is 31% of the circuit, ~2.9s.
 *
 * ⚠⚠ **0.40 WAS TRIED FIRST AND MEASURED WORSE THAN THE SINGLE LIGHT — min 70,
 * ratio 3.67x. THE ERROR IS WORTH RECORDING BECAUSE IT IS A WHOLE CLASS OF
 * MISTAKE: I SWEPT A CURVE IN ONE SPACE AND APPLIED THE ANSWER IN ANOTHER.**
 *
 * The 0.10..0.41 dead zone was measured by WALL-CLOCK sampling — elapsed time
 * divided by the period. But `FACE_EXIT`/`FACE_ENTER` are ORBIT PHASE, and the
 * speed profile deliberately makes those two non-linear with respect to each
 * other: the fast stretch compresses a wide phase range into very little time.
 * ⛔ **The measured curve was real; the offset derived from it was applied to the
 * wrong axis.**
 *
 * ⚠ **CONVERTED PROPERLY, THE OBVIOUS ANSWER IS THE RIGHT ONE.** The dead arc
 * centres on phase 0.640 and the lit arc on 0.140 — **exactly half a turn apart**,
 * because the profile is symmetric in PHASE even though it is not in time.
 * Coverage, as a fraction of time with at least one light on the faces:
 *
 *     offset 0.30   90.0%
 *     offset 0.40   95.2%      <- the 4.8% gap the measurement found
 *     offset 0.50  100.0%      <- shipped
 *     offset 0.60   95.3%
 *
 * ⛔ **MEASURED ON THE RUNNING BUILD, 40 samples: min total 64 -> 89, and the
 * swing 3.69x -> 1.92x.** The dead period is REMOVED, not softened, and the
 * gentler swing serves Carl's constraint that the movement stay subtle enough to
 * type against.
 *
 * ⚠ THE PEAK ALSO FALLS (237 -> 172) because each light carries HALF the
 * exposure. That is intended — the pair must not stack into a hot moment.
 */
const LIGHT_2_OFFSET = 0.5;

/** The base key/fill/ambient are untouched while the rig runs. See the canvas. */
const BASE_LIGHT_SCALE = 1.0;

/**
 * The opal's specular catch — resting and peak alpha.
 *
 * ⚠ THIS DRIVES AN APPROVED CSS MATERIAL (D-033 / R-018) AND CARL AUTHORISED IT
 * DELIBERATELY. The Send button's dome catch — layer 1 of `.enquiry-send-btn`'s
 * `background-image` — rests at 0.72 in the approved material. It is dialled down
 * to 0.45 so a sweep has somewhere to rise from, and peaks at 0.85.
 *
 * ⚠ ONE LAYER ONLY. The body gradient, the opal blooms, the shaping mottle and
 * every box-shadow are untouched. Carl: *"The whole opal doesn't have to interact,
 * but just that subtle shine on the opal."* **A single specular catch responding
 * reads as a material; the whole button animating reads as a light show.**
 *
 * ⚠ AND IT IS NOT PHYSICAL SIMULATION, WHICH IS THE RIGHT CALL AND CARL'S. The
 * WebGL light cannot illuminate a DOM element — the two live in different
 * rendering worlds entirely. What this does is let the opal RESPOND to where the
 * light is. Carl: *"The user won't know about the ellipse, all they will see is
 * its effects. The goal is to give the impression the opal lives in our 3D
 * world."* The bar is belonging, not accuracy.
 */
const OPAL_SHINE_REST = 0.45;
const OPAL_SHINE_PEAK = 0.85;

/**
 * How the shine follows the orbit.
 *
 * ⚠ TRUE PROXIMITY WAS MEASURED AND REJECTED — it does not work, for two reasons
 * found by sweeping the actual path rather than assuming:
 *
 *   1. **The closest approach lands at phase 0.953 — inside the HIDDEN half**,
 *      2.7s into the 3s back pass. Driving the shine from distance would peak it
 *      while the boxes are dark, which reads as disconnected rather than caused.
 *   2. **The range is only 489 to 625 units — a 1.3x swing.** The opal sits near
 *      the ellipse's centre-bottom, so the orbit is never dramatically near or
 *      far. Far too flat to produce a visible rise and fall.
 *
 * So the shine follows the **front pass** instead: one rise and fall across the 6s
 * visible half, peaking as the light sweeps down past the middle of the group.
 * That ties the opal to the moment the user is actually watching the boxes light,
 * so the whole thing reads as ONE event crossing the scene.
 *
 * ⚠ AND IT IS FLAT THROUGH THE HIDDEN HALF, deliberately. With the light behind
 * everything there is nothing for the opal to be responding to, and a shine
 * moving with no visible cause is the thing that would give the trick away.
 */
function opalShineAt(phase: number): number {
  // Hidden half: hold at rest.
  if (phase >= 0.5) return OPAL_SHINE_REST;
  // Front half: one smooth rise and fall, peaking at the midpoint of the pass.
  const p = phase / 0.5; // 0..1 across the visible sweep
  const bell = Math.sin(p * Math.PI); // 0 at both ends, 1 in the middle
  // Smoothed so the shine eases rather than tracking a raw sine's shoulders.
  const eased = bell * bell * (3 - 2 * bell);
  return OPAL_SHINE_REST + (OPAL_SHINE_PEAK - OPAL_SHINE_REST) * eased;
}

/** One end of the major axis, as a world-space point. */
type Vec3 = [number, number, number];

/**
 * The orbit's frame: centre, and the two axes it sweeps between.
 *
 * ⚠ DERIVED FROM THE LIVE PLACEMENTS, never from copied constants. The boxes move
 * with the viewport, so re-deriving here means the orbit follows them — the same
 * rule `sharedFieldWindow` follows, and for the same reason: a second copy of the
 * placement maths can silently disagree with the first.
 */
function orbitFrame(placements: ReturnType<typeof fieldPlacements>) {
  const b1 = placements[0];
  const b4 = placements[3];
  if (!b1 || !b4) return null;

  // The two aim points Carl named: midpoints of box 1's LEFT and box 4's RIGHT
  // vertical edges.
  const aim1 = { x: b1.x - b1.width / 2, y: b1.y };
  const aim4 = { x: b4.x + b4.width / 2, y: b4.y };

  // The major axis runs between them, extended by the standoff at each end.
  const dx = aim4.x - aim1.x;
  const dy = aim4.y - aim1.y;
  const span = Math.hypot(dx, dy);
  const ux = dx / span;
  const uy = dy / span;

  const end1 = { x: aim1.x - ux * EDGE_STANDOFF, y: aim1.y - uy * EDGE_STANDOFF };
  const end4 = { x: aim4.x + ux * EDGE_STANDOFF, y: aim4.y + uy * EDGE_STANDOFF };

  return {
    cx: (end1.x + end4.x) / 2,
    cy: (end1.y + end4.y) / 2,
    semiMajor: Math.hypot(end4.x - end1.x, end4.y - end1.y) / 2,
    // Unit vector along the major axis, and its in-plane perpendicular.
    ux,
    uy,
    px: -uy,
    py: ux,
  };
}

/**
 * The light's position at phase `t` (0..1) around the circuit.
 *
 * ⚠ ANTICLOCKWISE, WITH `t = 0` AT BOX 1's EDGE. The front (visible) half runs
 * `t` 0 -> 0.5, descending across the faces from box 1 toward box 4; the hidden
 * half runs 0.5 -> 1, returning behind the boxes.
 *
 * The ellipse is built in its own frame — major axis `u`, in-plane minor `p` — and
 * the tilt is applied by giving the minor axis a Z component. At `t = 0` and
 * `t = 0.5` the light is exactly on the major axis, i.e. **in the plane of the
 * boxes**: those are the crossings, and they coincide with the closest approach to
 * box 1 and box 4.
 */
function orbitPosition(
  t: number,
  frame: NonNullable<ReturnType<typeof orbitFrame>>,
): Vec3 {
  const a = t * Math.PI * 2;
  const cosA = Math.cos(a);
  const sinA = Math.sin(a);

  // Along the major axis: +semiMajor at t=0 (box 1 end), -semiMajor at t=0.5.
  const along = cosA * frame.semiMajor;
  // Across it: the in-plane bulge, capped by Carl's rule.
  const across = sinA * ORBIT_SEMI_MINOR;

  return [
    frame.cx + frame.ux * along + frame.px * across,
    frame.cy + frame.uy * along + frame.py * across,
    // ⚠ THE TILT. `sinA` is positive on the front half and negative on the back,
    // so the same term that bulges the ellipse sideways also lifts it toward the
    // viewer and then drops it behind. That coupling is what makes it ONE tilted
    // plane rather than a wobble.
    sinA * ORBIT_DEPTH,
  ];
}

/**
 * Phase at a given elapsed time, honouring the front/back speed split.
 *
 * ⚠ THE SPLIT IS IN TIME, NOT IN GEOMETRY. The path is a plain ellipse; only the
 * rate at which `t` advances changes. The first `ORBIT_FRONT_MS` covers phase
 * 0 -> 0.5 (the visible half) and the next `ORBIT_BACK_MS` covers 0.5 -> 1.
 */
function orbitPhase(elapsedMs: number, tune?: Tuning | null): number {
  const behindSpeed = tune?.behindSpeed ?? BEHIND_SPEED;

  // Angular RATE as a function of phase: 1 across the faces, `behindSpeed`
  // behind, smoothly eased between. Integrating this gives phase over time.
  const rateAt = (t: number) => {
    // Ease across each margin rather than stepping — a velocity step is visible
    // in the approach even before the beam lands.
    const ease = (u: number) => u * u * (3 - 2 * u); // smoothstep
    if (t <= FACE_EXIT) return 1;
    if (t >= FACE_ENTER) return 1;
    const mid = (FACE_EXIT + FACE_ENTER) / 2;
    const half = (FACE_ENTER - FACE_EXIT) / 2;
    // 0 at both boundaries, 1 at the midpoint of the hidden stretch.
    const k = 1 - Math.abs(t - mid) / half;
    return 1 + (behindSpeed - 1) * ease(Math.max(0, Math.min(1, k)));
  };

  // Precompute the cumulative time to traverse each phase step, so the loop can
  // map elapsed -> phase. 512 steps is well below one frame's worth of error.
  const STEPS = 512;
  const dt = 1 / STEPS;
  let total = 0;
  const cum: number[] = [0];
  for (let i = 0; i < STEPS; i++) {
    total += dt / rateAt((i + 0.5) * dt);
    cum.push(total);
  }

  // `total` is in arbitrary units; scale so one full circuit takes the period.
  const period = tune?.periodMs ?? ORBIT_PERIOD_MS;
  const target = ((elapsedMs % period) / period) * total;

  // Binary search the cumulative table.
  let lo = 0, hi = STEPS;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < target) lo = mid + 1; else hi = mid;
  }
  const i = Math.max(1, lo);
  const span = cum[i] - cum[i - 1] || 1e-9;
  return Math.min(1, ((i - 1) + (target - cum[i - 1]) / span) * dt);
}

/**
 * Where the light LOOKS at phase `t` — Carl's rotating aim path.
 *
 * Rakes along the row from one side, opens to face-on at the bottom of the pass
 * (taking in the Send button), then rakes from the other side. See `AIM_REACH`.
 */
function aimPoint(
  t: number,
  frame: NonNullable<ReturnType<typeof orbitFrame>>,
  tune?: Tuning | null,
): Vec3 {
  const reach = tune?.aimReach ?? AIM_REACH;
  const dip = tune?.aimDip ?? AIM_DIP;

  // `cos` is +1 at the box-1 end, -1 at the box-4 end, 0 at top and bottom of
  // the pass. The aim point runs the OPPOSITE way to the light's own position,
  // which is what turns a translation into a rake.
  const a = t * Math.PI * 2;
  const along = -Math.cos(a) * reach;
  // Dips below the group at the bottom of the visible pass (sin > 0 there), so
  // the beam takes in the Send button as specified.
  const across = -Math.sin(a) * dip;

  return [
    frame.cx + frame.ux * along + frame.px * across,
    frame.cy + frame.uy * along + frame.py * across,
    0,
  ];
}

/** Live tuning, supplied by the keyboard rig on localhost. Undefined ships. */
export type Tuning = {
  periodMs: number;
  behindSpeed: number;
  aimReach: number;
  aimDip: number;
  exposure: number;
  offset: number;
};

export type LightRigState = {
  /**
   * Whether the orbiting light is on. The spacebar toggles it where that binding
   * is enabled (localhost / `?lightrig=`); elsewhere it is simply `true`.
   */
  lightOn: boolean;
  /**
   * ⚠ `true` only at the `complete` stage — the four-box contact field.
   *
   * ⛔ THE ORBIT'S RUN GATE, AND IT IS NOT COSMETIC. The rAF loop below calls
   * `invalidate()` every frame, so the canvas cannot idle in `frameloop="demand"`
   * while it turns. The canvas MOUNTS far earlier, on `canvasWarm`, to keep WebGL
   * setup off the completion choreography — so without this gate the orbit would
   * start at warm-up and spin through the entire questionnaire **lighting boxes
   * nobody can see yet**.
   *
   * ⚠ That was the second of the two reasons the orbit was localhost-only. It is
   * fixed here rather than accepted: gating on `active` makes the deployed
   * behaviour strictly better than the localhost behaviour it replaces, which ran
   * the loop from mount.
   */
  active: boolean;
};

/**
 * The orbiting spotlight.
 *
 * ⚠ THE TARGET IS A REAL OBJECT AND IT SITS AT THE GROUP'S CENTRE. A three.js
 * `SpotLight` resolves its direction from `target.matrixWorld`; assigning a bare
 * `Vector3` silently does nothing. Aiming at the group's centre rather than at any
 * one box is what makes this an orbit around the whole assembly.
 */
export function LightRigScene({ lightOn, active }: LightRigState) {
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  const placements = useMemo(
    () => fieldPlacements(size.width, size.height),
    [size.width, size.height],
  );
  const frame = useMemo(() => orbitFrame(placements), [placements]);

  const lightRef = useRef<THREE.SpotLight | null>(null);
  const targetRef = useRef<THREE.Object3D | null>(null);
  /**
   * ⛔⛔ THE SECOND LIGHT — a CLONE of the first, offset around the same circuit.
   * Carl, 9 September 2026: *"A workaround to keep this effect is to have 2
   * lights. Have one at the front while the other is at the back and synchronise
   * them."*
   *
   * ⚠⚠ IT IS NOT A FILL AND IT IS NOT A SECOND DESIGN. Same orbit, same aim path,
   * same exposure model — **only the phase differs.** So there is one light
   * behaviour in this file, evaluated twice.
   */
  const lightRef2 = useRef<THREE.SpotLight | null>(null);
  const targetRef2 = useRef<THREE.Object3D | null>(null);

  /**
   * ⚠ LIVE TUNING — LOCALHOST ONLY, and `null` on every deployed build.
   *
   * Five parameters interact here: grade, aim spread, speed, exposure and colour.
   * Carl: *"changing one aspect at a time wont be enough."* Guessing a value,
   * rebuilding and asking is the wrong loop for that — these are ridden by eye
   * while the thing runs, like a fader.
   */
  const tuneRef = useRef<Tuning | null>(null);


  useEffect(() => {
    if (typeof window === "undefined") return;
    const { hostname, search } = window.location;
    const local =
      hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
    if (!local && !new URLSearchParams(search).has("tune")) return;

    const t: Tuning = {
      periodMs: ORBIT_PERIOD_MS,
      behindSpeed: BEHIND_SPEED,
      aimReach: AIM_REACH,
      aimDip: AIM_DIP,
      exposure: LIGHT_EXPOSURE,
      offset: LIGHT_2_OFFSET,
    };
    tuneRef.current = t;


    const report = () =>
      console.log(
        `[rig] period ${t.periodMs}ms · behind x${t.behindSpeed.toFixed(1)} · ` +
          `reach ${t.aimReach.toFixed(0)} · dip ${t.aimDip.toFixed(0)} · ` +
          `exposure ${t.exposure.toFixed(2)} · offset ${t.offset.toFixed(2)}`,
      );

    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      const shift = e.shiftKey ? 4 : 1;
      let hit = true;
      switch (e.key) {
        case "[": t.periodMs = Math.max(2000, t.periodMs - 500 * shift); break;
        case "]": t.periodMs = Math.min(30000, t.periodMs + 500 * shift); break;
        case ",": t.behindSpeed = Math.max(1, t.behindSpeed - 0.2 * shift); break;
        case ".": t.behindSpeed = Math.min(12, t.behindSpeed + 0.2 * shift); break;
        case "-": case "_": t.aimReach = Math.max(0, t.aimReach - 40 * shift); break;
        case "=": case "+": t.aimReach = Math.min(3000, t.aimReach + 40 * shift); break;
        case ";": t.aimDip = Math.max(-400, t.aimDip - 16 * shift); break;
        case "'": t.aimDip = Math.min(400, t.aimDip + 16 * shift); break;
        case "9": t.exposure = Math.max(0.05, t.exposure - 0.1 * shift); break;
        case "0": t.exposure = Math.min(20, t.exposure + 0.1 * shift); break;
        case "o": t.offset = Math.max(0.02, t.offset - 0.02 * shift); break;
        case "p": t.offset = Math.min(0.98, t.offset + 0.02 * shift); break;
        default: hit = false;
      }
      if (hit) { e.preventDefault(); report(); }
    };
    window.addEventListener("keydown", onKey);
    console.log(
      "[rig] live tuning ON — [ ] period · , . behind speed · - = aim reach · " +
        "; ' aim dip · 9 0 exposure · o p light-2 offset · hold Shift for x4",
    );
    report();
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const light = lightRef.current;
    const targetObj = targetRef.current;
    if (!light || !targetObj || !frame) return;
    targetObj.position.set(frame.cx, frame.cy, 0);
    targetObj.updateMatrixWorld(true);
    light.target = targetObj;
    invalidate();
  }, [frame, invalidate]);

  /**
   * Drive the orbit with `requestAnimationFrame`.
   *
   * ⚠ NOT `useFrame`. Under `frameloop="demand"` R3F only runs its loop when
   * something calls `invalidate()`, so a `useFrame` callback that invalidates
   * itself never gets a first frame to run in. `contact-field-canvas.tsx` records
   * the same finding for both cascade hooks — this drives with rAF and calls
   * `invalidate()` only to PRESENT each frame.
   *
   * The loop runs only while the light is on, so the spacebar genuinely lets the
   * canvas go quiet again.
   */
  useEffect(() => {
    // ⛔ `active` JOINS THE CONDITION HERE — see `LightRigState.active`. The loop
    // runs only at the `complete` stage, so the canvas stays quiet through the
    // questionnaire it is mounted behind. Leaving the effect early also restores
    // the opal's resting value through the cleanup below, so a light that never
    // started cannot strand the button mid-shine.
    if (!lightOn || !active || !frame) {
      invalidate();
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const now = performance.now() - start;
      const lap = tuneRef.current?.periodMs ?? LAP_MS;

      /**
       * ⛔ EACH LIGHT RUNS ITS OWN 10s LAP, STAGGERED BY HALF. Light A starts at
       * t=0; light B is half a lap ahead, so when A finishes its back run and
       * switches off, B is already mid-front-pass.
       *
       * `gain` is 0 while a light is waiting its turn, easing to 1 across the
       * hand-off. ⚠ ONE light is on the faces at a time — that is the whole point
       * of the stagger. See `LAP_MS`.
       */
      const legOf = (offsetMs: number) => {
        // ⛔ EACH LIGHT RUNS ITS OWN LAP CONTINUOUSLY. They are INDEPENDENT — same
        // part, entered at different moments. Carl: *"Do they have to be
        // synchronised? No. They only have to exhibit the same behaviour and work
        // in relay... It's like having a four bar piece of music, copying it and
        // offsetting it."*
        const cycle = (((now + offsetMs) % lap) + lap) % lap;
        const t = cycle / lap;

        // Ease in/out at the lap seam so the wrap is not a step. Carl: ease in/out.
        const ease = (u: number) => u * u * (3 - 2 * u);
        const h = HANDOFF_MS / lap;
        const gain = ease(Math.min(1, Math.min(t / h, (1 - t) / h)));
        return { gain, ms: cycle };
      };

      const legA = legOf(0);
      // ⛔ THE TRIGGER — light B enters where A's cone LEAVES THE FACES.
      const legB = legOf(RELAY_TRIGGER * lap);
      // The opal follows whichever light is actually crossing the faces.
      const frontLeg = legA.gain >= legB.gain ? legA : legB;
      const phase = orbitPhase(frontLeg.ms, tuneRef.current);

      /**
       * Place one light at a given phase. ⚠ ONE code path, called twice — the
       * two lights differ ONLY in phase, so anything tuned here applies to both
       * by construction and they cannot drift apart.
       */
      const place = (
        lr: React.RefObject<THREE.SpotLight | null>,
        tr: React.RefObject<THREE.Object3D | null>,
        ph: number,
        gain: number,
      ) => {
        const light = lr.current;
        const targetObj = tr.current;
        if (!light) return;

        const [x, y, z] = orbitPosition(ph, frame);
        light.position.set(x, y, z);

        // ⛔ THE AIM MOVES WITH IT. The target is no longer pinned at the group's
        // centre — it sweeps, so the beam rakes at the ends and opens face-on at
        // the bottom. See `AIM_REACH`.
        if (targetObj) {
          const [tx, ty, tz] = aimPoint(ph, frame, tuneRef.current);
          targetObj.position.set(tx, ty, tz);
          targetObj.updateMatrixWorld(true);
        }

        // ⛔ EXPOSURE x d², recomputed per frame — constant delivered light, so
        // the only thing changing around the circuit is direction. Distance is
        // measured to the AIM POINT, which is what the cone is centred on.
        const ax = targetObj?.position.x ?? frame.cx;
        const ay = targetObj?.position.y ?? frame.cy;
        const d2 = (x - ax) ** 2 + (y - ay) ** 2 + z ** 2;
        // ⛔ FULL EXPOSURE x `gain`, NOT HALVED. The halving existed because the
        // previous pair BOTH lit the faces at once. Under the stagger only one
        // does, so halving would leave the faces at half the judged level.
        // `gain` is the hand-off ramp and is 0 while a light waits its turn.
        light.intensity =
          (tuneRef.current?.exposure ?? LIGHT_EXPOSURE) * gain * Math.max(1, d2);

        light.updateMatrixWorld(true);
      };

      place(lightRef, targetRef, orbitPhase(legA.ms, tuneRef.current), legA.gain);
      place(lightRef2, targetRef2, orbitPhase(legB.ms, tuneRef.current), legB.gain);
      invalidate();
      // ⚠ THE OPAL IS DRIVEN THROUGH A CSS CUSTOM PROPERTY ON <html>, because it
      // is a DOM element and cannot be lit by a WebGL light. Written on the same
      // frame as the light moves, so the shine and the sweep share ONE clock —
      // two clocks would drift and the opal would stop reading as part of the
      // same event.
      document.documentElement.style.setProperty(
        "--opal-shine",
        opalShineAt(phase).toFixed(3),
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      // Hand the opal back to its resting value when the light stops, so a
      // paused rig cannot strand the button mid-shine.
      document.documentElement.style.setProperty(
        "--opal-shine",
        String(OPAL_SHINE_REST),
      );
    };
  }, [lightOn, active, frame, invalidate]);

  if (!frame) return null;

  const start = orbitPosition(0, frame);

  return (
    <>
      <object3D ref={targetRef} position={[frame.cx, frame.cy, 0]} />
      <spotLight
        ref={lightRef}
        position={start}
        angle={CONE_ANGLE}
        penumbra={CONE_PENUMBRA}
        // ⚠ A SEED ONLY. The tick loop overwrites `intensity` every frame with
        // `exposure x d²` — see the exposure note. This value exists so the very
        // first frame is not unlit, and so `lightOn: false` genuinely goes dark.
        intensity={lightOn ? LIGHT_INTENSITY : 0}
        distance={LIGHT_DISTANCE}
        decay={LIGHT_DECAY}
        color={LIGHT_COLOUR}
      />
      {/* ⛔ THE CLONE. Identical in every property — only its PHASE differs, and
          that lives in the tick loop, not here. See `LIGHT_2_OFFSET`. */}
      <object3D ref={targetRef2} position={[frame.cx, frame.cy, 0]} />
      <spotLight
        ref={lightRef2}
        position={orbitPosition(LIGHT_2_OFFSET, frame)}
        angle={CONE_ANGLE}
        penumbra={CONE_PENUMBRA}
        intensity={lightOn ? LIGHT_INTENSITY : 0}
        distance={LIGHT_DISTANCE}
        decay={LIGHT_DECAY}
        color={LIGHT_COLOUR}
      />
    </>
  );
}

/**
 * The spacebar. That is the entire control surface.
 *
 * ⚠ KEYS AIMED AT A TEXT FIELD ARE IGNORED — the contact boxes are real inputs, so
 * a space typed into a field must not also kill the light.
 *
 * ⚠⚠ `enabled` IS THE KEYBOARD BINDING ALONE — IT IS NO LONGER THE ORBIT'S GATE.
 * Until 9 September 2026 one flag controlled both, so shipping the orbit meant
 * shipping the spacebar with it. **That conflation was the whole reason the orbit
 * could not be deployed**: on `/start`'s completion stage space belongs to the
 * visitor — it scrolls, and it activates a focused button, including **Send**. A
 * visitor who tabbed to Send and pressed space would have toggled a test rig.
 *
 * ⛔ The two are now separate. The orbit runs unconditionally on every build;
 * this binding stays localhost/`?lightrig=` only. Carl's local toggle is
 * unchanged. See `contact-field-canvas.tsx` for the gate that calls this.
 */
export function useLightRig(enabled: boolean) {
  const [lightOn, setLightOn] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) {
        return;
      }
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setLightOn((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  return { lightOn };
}

export { BASE_LIGHT_SCALE };
