"use client";

/**
 * The card bench's client half — the canvas, the dials and the readouts.
 *
 * ⚠ SPLIT FROM THE PAGE so the route stays a server component, the same pattern
 * `/about` uses for `AboutNav` and `WallCardText`.
 *
 * ⛔ THE READOUT REPORTS THE MEASURED TILT, FROM BUILT NORMALS — never the value
 * predicted by `maxFaceTiltDegrees()`. Both are printed side by side precisely so
 * a disagreement is visible: that function once carried a factor-of-2 error and
 * a check sharing a formula with the thing it checks cannot fail.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⛔⛔ THE BACKPLATE IS WHAT THE GLASS REFRACTS. IT MUST COVER THE FRAME.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * **18 September 2026. The frosted face works and is ready for Carl's eye.**
 * ⛔ **Carl's ruling, 17 September, Option A, confirmed by name: the backplate is
 * the background for the frosted glass.** That was already decided; this file
 * just had not built it yet.
 *
 * ⚠⚠ **TRANSMISSION SAMPLES THE RENDER TARGET IN SCREEN SPACE**
 * (`transmission_pars_fragment.glsl.js:147`), so a plane that merely sits BEHIND
 * the card is not enough — **the refracted ray lands where it lands, and anywhere
 * the plate does not cover reads as empty target.** ⛔ The original proxy was
 * 1.6x the card and did not cover an oblique frame; the face measured **2.2**.
 *
 *     face centre luminance, glass OFF                113.2   <- lit grey
 *     glass ON, card-sized proxy                        2.2   <- the fault
 *     glass ON, frame-filling camera-aligned backplate  99.6   <- correct
 *
 * ⛔ **AND THE CONTROL HELD AT 113.2 THROUGHOUT**, which is the test that
 * separates a real fix from a scene-wide brightening.
 *
 * ### ⚠⚠ THE ROUGHNESS FADER WORKS, AND MEAN LUMINANCE CANNOT SEE IT
 *
 * **A sweep measured by MEAN read 99.6 -> 100.5 and looked dead. It is not.**
 * ⛔ **Blurring an image PRESERVES its mean** — the quantity frost changes is
 * LOCAL CONTRAST. Measured as standard deviation inside the face:
 *
 *     roughness 0.00   sd 12.21      roughness 0.30   sd  9.86
 *     roughness 0.18   sd 11.40      roughness 0.50   sd  4.09
 *                                    roughness 0.80   sd  2.95
 *
 * ⚠ **AT THE OPENING 0.18 THE FROST IS VERY LIGHT — sd falls only 7% from
 * clear.** The real range is above 0.3. ⛔ **Consistent with the crown, where
 * Carl's eye settled nearly 3x past the outside figure. Do not read 0.18 as the
 * answer.**
 *
 * ### ⛔ RULED OUT — do not re-walk any of it
 *
 *   - **An environment map is NOT required and was NOT the answer.** ⚠ A drei
 *     `<Environment>` lifted the face 2.2 -> 56.8, which located the symptom and
 *     **MISLED ON THE CAUSE**: it also lifted the CONTROL 113 -> 225, so it lit
 *     the whole bench. ⛔ And `/start`'s env map is a **SYNTHETIC two-panel
 *     studio in a black shell**, not a room — it was never the same thing as the
 *     backplate. **Removed.**
 *   - **Lighting / a dark proxy** — a fully emissive proxy moved it only to 6.1.
 *   - **The parameters** — `thickness: 0` and `roughness: 0` rendered identically
 *     black while the coverage was wrong.
 *   - **`alpha: true` on the canvas** — ⚠⚠ **REASONED IN FULL, THEN FALSIFIED.**
 *     A mechanism was built out of `three.module.js:18019` ->
 *     `transmission_fragment:31` -> `opaque_fragment:7`, every line of which is
 *     really in three 0.185.1, and it predicted exactly this symptom. **Setting
 *     `alpha: false` changed the number by 0.0.** ⛔ Recorded, not deleted: a
 *     wrong argument that survives next to a right conclusion becomes a false
 *     fact a later reader relies on.
 *
 * ⛔⛔ **AND TWO INSTRUMENT DEFECTS WORTH MORE THAN THE BUG.** The first probe
 * read the canvas with `drawImage` into a 2D context and reported **0/0/0 at
 * every setting — INCLUDING WITH GLASS OFF**, where the screenshot plainly shows
 * a bright grey face (`preserveDrawingBuffer: false` makes that readback empty).
 * **The second measured the wrong QUANTITY** — mean, where the effect lives in
 * variance — and made a working fader look dead. ⚠ **Both were caught by running
 * a control whose answer was already known.** **Run the control.**
 */

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  cardDims,
  FLOOR_CARD_ASPECT,
  CA_CARD_ASPECT,
  CB_CARD_ASPECT,
  CD_CARD_HEIGHT_MM,
  TENT_POLE_RATIO,
  GUIDE_CS,
  PROXY_COLORS,
  maxFaceTiltDegrees,
  TILT_REFERENCE_INVISIBLE_DEG,
  TILT_REFERENCE_LEGIBLE_DEG,
} from "./about-card-geometry";
import {
  GLASS_IOR,
  GLASS_ROUGHNESS,
  GLASS_ROUGHNESS_RANGE,
  GLASS_THICKNESS_MM,
  GLASS_THICKNESS_RANGE_MM,
  GLASS_TRANSMISSION,
} from "./about-card-glass";
import { AboutCardMesh } from "./about-card-mesh";
import { RoomEnvironment } from "./room-environment";

/**
 * ⛔ CHUNK: THE LEFT FLOOR CARD (CD) — 14 September 2026, Carl: *"Lets start with
 * the left floor card first."* One card at a time.
 *
 * ⚠⚠ WHAT ACTUALLY CHANGED IS SMALL, AND SAYING SO MATTERS. The bench's opening
 * height now comes from `CD_CARD_HEIGHT_MM` instead of `FLOOR_CARD_HEIGHT_MM`.
 * ⛔ THOSE ARE THE SAME 860mm TODAY, so NOTHING MOVES ON SCREEN. What changed is
 * that the number is ADDRESSABLE AS CD'S and can diverge from CS without touching
 * this file.
 *
 * ⚠ AN EARLIER VERSION OF THIS COMMENT CLAIMED THE BENCH "NOW OPENS ON CD BY NAME
 * RATHER THAN AN ANONYMOUS DEFAULT." The default it replaced was the floor-pair
 * constant — not anonymous, and the same value. ⛔ Recorded rather than silently
 * fixed: a comment describing a change as larger than it is will be inherited as
 * fact by the next reader, which is this project's most-recorded failure.
 *
 * ⚠⚠ CD'S HEIGHT IS A PLACEHOLDER. See `CD_CARD_HEIGHT_MM` — no real millimetre
 * height is derivable until the card is on its rail, because converting a
 * projected size needs a depth that is about to change. ⛔ Do not read 860mm as
 * measured, and do not tune anything against it.
 *
 * ⚠ The proxy is read inline as `PROXY_COLORS.CD` at the mesh — it was already
 * per-card, so no alias is needed. ⛔ One was added here on 14 September and
 * consumed nothing; deleted rather than left as a second name for one value.
 */


/**
 * ⚠ `side` AND `top` ARE EDGE-ON ORTHOGRAPHIC-ISH VIEWS, added 11 September 2026
 * so the PROFILE can be read directly rather than inferred from shading. They are
 * the views Carl's own sketches are drawn in, and the only ones that show how far
 * the face stands proud of the bevel.
 */
type View = "face" | "oblique" | "side" | "top";

/**
 * ⛔⛔ THE TWO LIVE FACE TREATMENTS — 14 September 2026. Carl: *"its hard to tell
 * at this angle, id need to see them in the proto card page."*
 *
 * ⚠⚠ THE BENCH IS WHERE THIS IS JUDGED AND `/about` IS NOT. The bench has a
 * SWEEPABLE light and a SIDE ELEVATION; the room has one fixed stand-in beam and
 * one fixed camera. ⛔ A crown reads FLAT under a head-on light — this file's own
 * header says so — and judging a profile in the room was the error that cost most
 * of 14 September.
 *
 *   curved  THE BLUEPRINT for all four cards. Real geometry, `(1-x²)(1-y²)`.
 *           Normals genuinely vary, so it shades from any angle and has a real
 *           silhouette in profile.
 *   flat    the control. No curvature — useful for separating "is this curvature
 *           or is it shading?", which is how the dead normal map was caught.
 *
 * ⚠⚠ A THIRD OPTION, `domed`, WAS REMOVED ON 14 September 2026. It rendered a FLAT
 * mesh carrying a convex normal map. ⛔ Carl, after testing it here under the light
 * sweep: *"NO change. CD is the way to go."* The map was built correctly, the
 * binding was right, and missing UVs were found and added — it stayed inert.
 * **Likely cause, unproven: `meshStandardMaterial` needs a `tangent` attribute for
 * a tangent-space normal map, and this geometry has none.**
 *
 * ⛔ NEITHER IS APPROVED, and the lighting they will finally live under does not
 * exist: the rim is not a light source until chunk 3 and the four aimed lights
 * are unbuilt.
 */
type Treatment = "curved" | "flat";

/**
 * ⛔⛔ THE ROOM ENVIRONMENT MAP — built from the plate, on Carl's instruction,
 * 18 September 2026: *"We are gonna need an env map. Lets build it now."*
 *
 * ⚠⚠ **IT EXISTS FOR THE RIM, NOT THE FACE.** The frosted face is served by the
 * backplate (measured 2.2 -> 99.6). ⛔ **The CLEAR rim cannot render at all
 * without an environment**: at `transmission: 1` there is no diffuse colour, and
 * `three.module.js:18039` renders `opaqueObjects` ONLY into the transmission
 * target — **so no transmissive object can see itself or its neighbours.**
 * Specular reflection is the only channel left.
 *
 * ⛔ **THE SHELL IS THE PLATE, NOT A STUDIO.** `/start` builds two abstract
 * panels in a black sphere; that is right for an orthographic card on a dead
 * backdrop and wrong here. This card stands IN a photographed room and must
 * reflect THAT room — §14a: *"Effects should feel caused by the world, not
 * layered on top of it."*
 *
 * ⚠ **IT IS NOT THE NEON AND DOES NOT PRETEND TO BE.** Carl's references show a
 * rim that spills visibly onto the floor with bloom. **That is emission plus a
 * real light plus a bloom pass — chunk 3.** This makes the rim LEGIBLE so the
 * glass can be judged; it does not make it CORRECT.
 *
 * ⚠ **BENCH ONLY.** It is built here and NOT in `about-card-canvas.tsx`, which
 * 2a does not touch. ⛔ Its cost is unmeasured in the room — the `/start`
 * precedent is ~572ms of ungated PMREM, and 2b owns that measurement.
 */

export default function CardBench() {
  const [treatment, setTreatment] = useState<Treatment>("curved");
  const [heightMm, setHeightMm] = useState(CD_CARD_HEIGHT_MM);
  const [aspect, setAspect] = useState(FLOOR_CARD_ASPECT);
  /**
   * ⚠ THE SLIDER IS A RATIO NOW, NOT MILLIMETRES — Carl, 11 September: the formula
   * is shared across cards, the figures are not. Sweeping this changes the crown
   * on EVERY size at once, which is what a family parameter should do; a
   * millimetre slider would tune one card and silently leave the others.
   */
  /**
   * ⚠⚠ OPENS AT `TENT_POLE_RATIO`, NOT `CROWN_RATIO` — corrected 14 September 2026.
   * ⛔ `CROWN_RATIO = 0.0901` was back-derived to hold 27.9° of tilt on the
   * SUPERELLIPSE profile, which is dead. The live surface is the quartic
   * `(1-x²)(1-y²)` and its dial is `TENT_POLE_RATIO`.
   *
   * ⚠⚠ THIS COMMENT SAID `TENT_POLE_RATIO = 0.025` UNTIL 18 September 2026 AND
   * THE CODE SAID 0.073 — corrected in place, per `context-rules.md`. **0.025 was
   * true when written and was dropped on 14 September when Carl's eye settled
   * 0.073.** ⛔ The stale figure was not inert: it was read as current while
   * drafting chunk 2's plan and produced **a thickness figure 2.92x out in a plan
   * put to Carl.** *"A STALE COMMENT IS AN INSTRUMENT. It is what the next reader
   * measures the code by, and it lies exactly as a bad harness lies."*
   *
   * ⛔ THE LIVE VALUE IS NOT REPEATED HERE. `about-card-geometry.ts:624` is the
   * one place it is written; naming it again is how this comment went stale.
   */
  const [crownRatio, setCrownRatio] = useState(TENT_POLE_RATIO);
  const crownMm = heightMm * crownRatio;
  const [ovalExpand, setOvalExpand] = useState(1.35);
  const [lightAngle, setLightAngle] = useState(60);
  const [view, setView] = useState<View>("oblique");
  const [measuredTilt, setMeasuredTilt] = useState<number | null>(null);
  const [proxyOn, setProxyOn] = useState(true);

  /**
   * ⛔⛔ CHUNK 2a — THE GLASS FADERS. ⚠⚠ THESE OPEN AT A STARTING POINT, NOT AT A
   * PROPOSAL. Carl, 17 September 2026: *"The figures were presented as a starting
   * point."* See `about-card-glass.ts` — the crown precedent is a 3x move from an
   * outside figure, and the UI below says so where the numbers are read.
   */
  const [glassOn, setGlassOn] = useState(false);
  const [glassRoughness, setGlassRoughness] = useState(GLASS_ROUGHNESS);
  const [glassThicknessMm, setGlassThicknessMm] = useState(GLASS_THICKNESS_MM);
  /**
   * ⛔ THE ENV MAP TOGGLE. ⚠ ON by default when the glass is on — without it the
   * CLEAR rim does not render at all, so the card would be judged missing a part.
   * It is a toggle rather than always-on so the rim's dependence on it stays
   * VISIBLE and is not rediscovered later as a mystery.
   */
  const [envOn, setEnvOn] = useState(true);

  /**
   * ⛔ THE PHOTOGRAPHIC PROXY — the region of the plate that sits behind CS,
   * cropped in PLATE SPACE from `GUIDE_CS`, which is already in plate space.
   *
   * ⚠⚠ THE STAGE→PLATE CONVERSION TRAP DOES NOT APPLY HERE, and that is stated
   * rather than left to be rediscovered: that trap corrupted every card placement
   * for hours on 14 September while the arithmetic reported *"EXACT, 0.00000px"*.
   * `GUIDE_CS` needs no conversion — it is fractions of the plate.
   *
   * ⛔ CROPPED FROM `about-studio-source.jpg`, THE CLEAN PLATE. ⚠ NOT
   * `about-studio-wall-only.jpg`, which carries painted guide quads, and not the
   * guides plate. A guide quad behind the glass would be read as an artefact of
   * the material.
   *
   * ⚠ `/proto` IS NOT A PRODUCTION ROUTE, so D-075 (the lint/bytes decision) does
   * not apply and a raw `<img>` fetch is acceptable here.
   */
  const [proxyTexture, setProxyTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let cancelled = false;
    let made: THREE.Texture | null = null;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      /**
       * ⛔⛔ THE CROP IS CENTRED ON CS BUT WIDENED TO THE BACKPLATE'S ASPECT.
       *
       * ⚠⚠ AN EARLIER VERSION TOOK `GUIDE_CS` EXACTLY AND IT WAS WRONG FOR A
       * BACKPLATE — a 1.34:1 crop stretched across a 16:9 plane distorts the
       * room, and the glass would then be judged against a misshapen photograph.
       * ⛔ The crop keeps CS's CENTRE and takes as much plate as the plane's
       * aspect asks for, so the room behind the card is the real room at the
       * real proportions.
       *
       * ⚠ `GUIDE_CS` IS ALREADY IN PLATE SPACE, so no stage->plate conversion is
       * involved. **That trap corrupted every card placement for hours on 14
       * September while the arithmetic reported "EXACT, 0.00000px"** — stated
       * because its absence here is worth knowing, not assumed.
       */
      const cx = (GUIDE_CS.x0 + GUIDE_CS.x1) / 2;
      const cy = (GUIDE_CS.y0 + GUIDE_CS.y1) / 2;
      const TARGET_ASPECT = 16 / 9;
      // Take the full plate height available around CS, then the width its aspect needs.
      let sh = (GUIDE_CS.y1 - GUIDE_CS.y0) * img.naturalHeight * 2.2;
      let sw = sh * TARGET_ASPECT;
      // ⚠ Clamp to the plate rather than sampling outside it, which returns transparent.
      sw = Math.min(sw, img.naturalWidth);
      sh = Math.min(sh, img.naturalHeight, sw / TARGET_ASPECT);
      const sx = Math.round(
        Math.max(0, Math.min(cx * img.naturalWidth - sw / 2, img.naturalWidth - sw)),
      );
      const sy = Math.round(
        Math.max(0, Math.min(cy * img.naturalHeight - sh / 2, img.naturalHeight - sh)),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(sw);
      canvas.height = Math.round(sh);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, sx, sy, Math.round(sw), Math.round(sh), 0, 0, Math.round(sw), Math.round(sh));
      const tex = new THREE.CanvasTexture(canvas);
      /* ⛔ A KNOWN FAILURE, NOT A PRECAUTION. `contact-field-canvas.tsx:806`:
         *"Omitting it double-applies the transfer function."* */
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      made = tex;
      setProxyTexture(tex);
    };
    img.src = "/about-studio-source.jpg";
    return () => {
      cancelled = true;
      if (made) made.dispose();
    };
  }, []);

  const dims = useMemo(() => cardDims(heightMm, aspect), [heightMm, aspect]);
  const predictedTilt = useMemo(
    () => maxFaceTiltDegrees(crownMm, dims.faceHeightMm),
    [crownMm, dims],
  );

  // Camera far enough back to frame the card with a little air.
  const camDist = dims.widthMm * 1.5;
  /**
   * ⚠ THE EDGE-ON VIEWS SIT A LONG WAY OUT AND USE A NARROW FOV, which is how a
   * perspective camera approximates an orthographic elevation. Close up, the
   * near end of the card would flare and the profile would be unreadable.
   */
  const camPos: [number, number, number] =
    view === "face"
      ? [0, 0, camDist]
      : view === "side"
        ? [camDist * 2.6, 0, 0]
        : view === "top"
          ? [0, camDist * 2.6, 0.0001]
          : [camDist * 0.62, camDist * 0.34, camDist * 0.72];

  const edgeOn = view === "side" || view === "top";

  /**
   * ⛔⛔ THE BACKPLATE'S SIZE IS DERIVED FROM THE CAMERA IN USE, NOT CHOSEN.
   *
   * ⚠⚠ THIS IS THE FIX FOR THE BLACK FACE AND THE ARITHMETIC IS THE POINT.
   * Transmission samples the render target in SCREEN SPACE, so the backplate has
   * to cover the FRAME, not merely sit behind the card. **Anywhere it does not
   * cover reads as empty target** — which is exactly what the 1.6x-the-card proxy
   * produced (face luminance 2.2).
   *
   * `visibleHeight = 2 * distance * tan(fov / 2)`, the standard perspective
   * relation, with the SAME `fov` the Canvas is given below. ⛔ Sharing the
   * source with the camera is deliberate: a hard-coded size would go stale the
   * moment the view or the fov changes, and a stale constant is this project's
   * most-recorded failure.
   *
   * ⚠ `backplateDistance` is measured from the CAMERA, not from the origin, so
   * the card sits between the two. **1.35x the camera distance** puts it behind
   * the card with room to spare at every view.
   *
   * ⚠ `OVERSCAN` covers the oblique views, where the plane is seen at an angle
   * and its projected footprint shrinks. ⛔ It is a margin, not a measurement —
   * if a future view shows an edge, raise it rather than hand-tuning a size.
   */
  const BACKPLATE_OVERSCAN = 1.8;
  const backplateDistance = camDist * 1.35;
  const backplateFov = edgeOn ? 15 : 40;
  const backplateH =
    2 *
    (backplateDistance + camDist) *
    Math.tan(((backplateFov * Math.PI) / 180) / 2) *
    BACKPLATE_OVERSCAN;
  /**
   * ⚠ 16/9 IS THE PANEL'S ASPECT, set on the wrapper below as `aspectRatio`.
   * ⛔ It is NOT the plate's 1.5 — the plate is cropped INTO this plane by the
   * texture, and stretching the plane to the plate's aspect would letterbox the
   * frame rather than fill it.
   */
  const backplateW = backplateH * (16 / 9);
  /**
   * ⛔ THE BACKPLATE TURNS TO FACE THE CAMERA, derived from `camPos` — the same
   * source the camera itself uses, so the two cannot drift apart.
   *
   * ⚠ A plane's default normal is +z, so yawing by `atan2(x, z)` and pitching by
   * `-asin(y / |camPos|)` points it back down the view axis. **In the face-on
   * view both terms are 0 and the plane is unrotated**, which is the correct
   * degenerate case rather than a special case that needs handling.
   */
  const camLen = Math.hypot(camPos[0], camPos[1], camPos[2]) || 1;
  const backplateRot: [number, number, number] = [
    -Math.asin(camPos[1] / camLen),
    Math.atan2(camPos[0], camPos[2]),
    0,
  ];

  // The raking light: swept around the card in its own plane, kept forward of it.
  const a = (lightAngle * Math.PI) / 180;
  const lightR = dims.widthMm * 1.1;
  /**
   * ⚠ THE EDGE-ON VIEWS NEED THEIR OWN LIGHT. A raking beam that reveals the
   * crown face-on leaves the card a black silhouette when viewed from the side —
   * the lit surface is turned away from the camera. These views are for reading
   * the PROFILE, so the light comes from the camera's side of the object.
   */
  const lightPos: [number, number, number] = edgeOn
    ? view === "side"
      ? [camDist * 1.6, dims.heightMm * 0.5, dims.heightMm * 1.2]
      : [dims.widthMm * 0.4, camDist * 1.6, dims.heightMm * 1.2]
    : [
        Math.cos(a) * lightR,
        Math.sin(a) * lightR * 0.55,
        dims.heightMm * 0.42,
      ];

  const num = (v: number, d = 1) => v.toFixed(d);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          view
          <select
            value={view}
            onChange={(e) => setView(e.target.value as View)}
            className="bg-neutral-800 px-2 py-1 rounded"
          >
            <option value="oblique">oblique (as seen in the room)</option>
            <option value="face">face-on</option>
            <option value="side">side elevation (the profile)</option>
            <option value="top">top elevation</option>
          </select>
        </label>

        {/* ⛔ THE TWO LIVE TREATMENTS, SIDE BY SIDE UNDER THE SWEEP. See the
            `Treatment` type for what each one is and what it costs. ⚠ The "side"
            view is where real geometry and a normal map should separate
            unmistakably — a flat mesh has no silhouette to show in profile. */}
        <label className="flex items-center gap-2">
          face
          <select
            value={treatment}
            onChange={(e) => setTreatment(e.target.value as Treatment)}
            className="bg-neutral-800 px-2 py-1 rounded"
          >
            <option value="curved">curved geometry</option>
            <option value="flat">flat (control)</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          height
          <input
            type="range"
            min={400}
            max={1400}
            step={10}
            value={heightMm}
            onChange={(e) => setHeightMm(Number(e.target.value))}
            className="w-36"
          />
          <span className="tabular-nums text-neutral-400 w-16">
            {heightMm}mm
          </span>
        </label>

        <label className="flex items-center gap-2">
          aspect
          <select
            value={aspect}
            onChange={(e) => setAspect(Number(e.target.value))}
            className="bg-neutral-800 px-2 py-1 rounded"
          >
            {/* ⛔ The wall entry was `wall 1.615:1` until 17 September 2026. That
                value came from a CSS text box, never from the plate, and the
                corner solve put the real figures at 2.327 / 2.248 — see
                `about-card-geometry.ts`. ⚠ BOTH wall cards are listed because
                they genuinely differ by 3.5%; the bench exists to compare
                proportions, so flattening them here would hide the thing it is
                for. */}
            <option value={FLOOR_CARD_ASPECT}>floor 2.026:1</option>
            <option value={CA_CARD_ASPECT}>wall CA 2.327:1</option>
            <option value={CB_CARD_ASPECT}>wall CB 2.248:1</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          crown
          <input
            type="range"
            min={0}
            max={0.2}
            step={0.001}
            value={crownRatio}
            onChange={(e) => setCrownRatio(Number(e.target.value))}
            className="w-44"
          />
          <span className="tabular-nums text-neutral-400 w-24">
            {(crownRatio * 100).toFixed(2)}% = {crownMm.toFixed(0)}mm
          </span>
        </label>

        <label className="flex items-center gap-2">
          oval
          <input
            type="range"
            min={1.0}
            max={2.2}
            step={0.01}
            value={ovalExpand}
            onChange={(e) => setOvalExpand(Number(e.target.value))}
            className="w-36"
          />
          <span className="tabular-nums text-neutral-400 w-12">
            {ovalExpand.toFixed(2)}
          </span>
        </label>

        <label className="flex items-center gap-2">
          light
          <input
            type="range"
            min={0}
            max={180}
            step={1}
            value={lightAngle}
            onChange={(e) => setLightAngle(Number(e.target.value))}
            className="w-44"
          />
          <span className="tabular-nums text-neutral-400 w-12">
            {lightAngle}°
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={proxyOn}
            onChange={(e) => setProxyOn(e.target.checked)}
          />
          proxy behind
        </label>
      </div>

      {/* ⛔⛔ CHUNK 2a — THE GLASS ROW. Separated from the geometry dials above
          because they answer different questions and mixing them is how two
          variables get swept at once. */}
      <div className="flex flex-wrap items-center gap-4 text-sm border-t border-neutral-800 pt-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={glassOn}
            onChange={(e) => setGlassOn(e.target.checked)}
          />
          <strong>frosted glass face</strong>
        </label>

        <label className="flex items-center gap-2 aria-disabled:opacity-40" aria-disabled={!glassOn}>
          roughness
          <input
            type="range"
            min={GLASS_ROUGHNESS_RANGE.min}
            max={GLASS_ROUGHNESS_RANGE.max}
            step={GLASS_ROUGHNESS_RANGE.step}
            value={glassRoughness}
            disabled={!glassOn}
            onChange={(e) => setGlassRoughness(Number(e.target.value))}
            className="w-44"
          />
          <span className="tabular-nums text-neutral-400 w-14">
            {glassRoughness.toFixed(3)}
          </span>
        </label>

        <label className="flex items-center gap-2 aria-disabled:opacity-40" aria-disabled={!glassOn}>
          thickness
          <input
            type="range"
            min={GLASS_THICKNESS_RANGE_MM.min}
            max={GLASS_THICKNESS_RANGE_MM.max}
            step={GLASS_THICKNESS_RANGE_MM.step}
            value={glassThicknessMm}
            disabled={!glassOn}
            onChange={(e) => setGlassThicknessMm(Number(e.target.value))}
            className="w-44"
          />
          <span className="tabular-nums text-neutral-400 w-16">
            {glassThicknessMm.toFixed(2)}mm
          </span>
        </label>

        <label className="flex items-center gap-2 aria-disabled:opacity-40" aria-disabled={!glassOn}>
          <input
            type="checkbox"
            checked={envOn}
            disabled={!glassOn}
            onChange={(e) => setEnvOn(e.target.checked)}
          />
          room env map
        </label>

        <span className="text-neutral-500">
          ior <span className="tabular-nums">{GLASS_IOR}</span> · transmission{" "}
          <span className="tabular-nums">{GLASS_TRANSMISSION}</span> — fixed
        </span>

        <button
          type="button"
          onClick={() => {
            setGlassRoughness(GLASS_ROUGHNESS);
            setGlassThicknessMm(GLASS_THICKNESS_MM);
          }}
          className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
        >
          reset to opening values
        </button>
      </div>

      <div
        className="relative w-full border border-neutral-700 bg-neutral-900"
        style={{ aspectRatio: "16 / 9" }}
      >
        <Canvas
          camera={{
            position: camPos,
            fov: edgeOn ? 15 : 40,
            near: 1,
            far: camDist * 8,
          }}
          key={view}
          dpr={[1, 2]}
          /**
           * ⚠ `alpha: false` ON THE BENCH. ⛔ IT IS NOT THE FIX FOR THE BLACK
           * FACE AND MUST NOT BE RECORDED AS ONE — see the open defect in this
           * file's header. Measured 18 September 2026: face luminance was 2.2
           * both before and after this change, **identical to three significant
           * figures.**
           *
           * ⚠⚠ A PLAUSIBLE MECHANISM WAS WRITTEN HERE AND IT WAS FALSE. The
           * argument ran: the transmission target is cleared at alpha 0.5
           * (`three.module.js:18019`), that alpha reaches the face's own alpha
           * (`transmission_fragment:31` -> `opaque_fragment:7`), so the face goes
           * semi-transparent over a dark page. **Every line of it is really in
           * three 0.185.1. It still did not cause this.** ⛔ Recorded rather than
           * deleted, on the Architect's standing reasoning: *"A wrong argument
           * recorded in support of a right conclusion becomes a false fact later
           * readers rely on."*
           *
           * ⚠ KEPT ONLY because an opaque canvas is the honest setting for a
           * bench that draws on its own dark panel, and it removes one variable
           * from the next session's search. ⛔ It decides NOTHING for `/about`.
           */
          gl={{ antialias: true, alpha: false }}
          frameloop="always"
        >
          {/* ⚠ Deliberately dim ambient. The room is dark and the point of this
              bench is SHADOW; a bright fill would erase the thing being judged. */}
          <ambientLight intensity={0.12} />
          <directionalLight position={lightPos} intensity={2.4} />

          {/* ⛔ THE ROOM ENV MAP. ⚠ Gated on `glassOn` as well as its own toggle:
              it exists for the CLEAR RIM and costs a PMREM build, so it does not
              run while the card is diagnostic grey. */}
          <RoomEnvironment plate={proxyTexture} enabled={glassOn && envOn} />

          {/* ⛔⛔ THE BACKPLATE — what the frosted glass refracts. Carl's ruling,
              17 September 2026, Option A, confirmed by name: **the backplate is
              the background for the frosted glass.**

              ⚠⚠ IT IS SIZED TO FILL THE CAMERA'S FRUSTUM AT ITS OWN DEPTH, and
              that is the whole fix for the black face. Transmission samples the
              transmission render target in SCREEN SPACE
              (`transmission_pars_fragment.glsl.js:147`), so a plane that merely
              sits behind the card is not enough — **the refracted ray lands
              wherever it lands, and anywhere the plate does not cover reads as
              empty target.** ⛔ The previous 1.6x-the-card proxy did not cover an
              oblique frame, which is why the face measured 2.2.

              ⚠ AN `<Environment>` WAS TRIED AS A DIAGNOSTIC AND IS NOT THE
              ANSWER. It lifted the face 2.2 -> 56.8, which located the symptom
              and MISLED ON THE CAUSE: it also lit the whole bench (control
              113 -> 225), and `/start`'s env map is a SYNTHETIC two-panel studio
              in a black shell, not a room. ⛔ The backplate was already the
              decided route; the env map was never an alternative to it. */}
          {/* ⚠ Hidden edge-on: seen from the side the backplate is a wall across
              the frame and the card's profile disappears behind it. */}
          {proxyOn && !edgeOn && (
            /**
             * ⛔ CAMERA-ALIGNED, NOT AXIS-ALIGNED. ⚠ The oblique view looks at
             * the scene from `[0.62, 0.34, 0.72] * camDist`, so a plane lying on
             * the z axis is seen at an angle and its projected footprint leaves
             * a wedge of empty target in the corner — which the glass then
             * refracts as BLACK. **Turning the plane to face the camera is the
             * fix; raising the overscan only hides it.**
             */
            <mesh position={[0, 0, -backplateDistance]} rotation={backplateRot}>
              <planeGeometry args={[backplateW, backplateH]} />
              {/* ⛔ `toneMapped={false}` — the same reason as F7 on the room's
                  backplate. Without it the bench shows a COLOUR-SHIFTED
                  photograph behind the glass and the frost is judged against the
                  wrong image. ⚠ The flat sampled colour is the fallback until
                  the crop loads, not a second option. */}
              <meshStandardMaterial
                map={proxyTexture ?? undefined}
                color={proxyTexture ? "#ffffff" : PROXY_COLORS.CD}
                toneMapped={false}
                roughness={0.95}
                metalness={0}
              />
            </mesh>
          )}

          {/* ⚠ `flat` AND `domed` TOGETHER IS THE NORMAL-MAP TREATMENT, not a
              contradiction: the MESH is flat — flush to the bevel at every point,
              undistorted UVs for text — and only the LIGHTING reads as curved. */}
          <AboutCardMesh
            dims={dims}
            crownMm={crownMm}
            ovalExpand={ovalExpand}
            flat={treatment === "flat"}
            glass={glassOn}
            glassRoughness={glassRoughness}
            glassThicknessMm={glassThicknessMm}
            onTilt={setMeasuredTilt}
          />
        </Canvas>
      </div>

      <pre className="text-xs leading-relaxed text-neutral-300 bg-neutral-900 border border-neutral-800 rounded p-3 overflow-x-auto">
{`CARD          ${num(dims.widthMm, 0)} x ${num(dims.heightMm, 0)} mm   aspect ${num(aspect, 3)}
corner radius ${num(dims.cornerRadiusMm, 1)} mm
rim bead      ${num(dims.rimBeadMm, 1)} mm    (consumes ${num(2 * dims.rimBeadMm, 1)} per side)
bevel band    ${num(dims.bevelWidthMm, 1)} mm
face          ${num(dims.faceWidthMm, 0)} x ${num(dims.faceHeightMm, 0)} mm
              ${num((100 * dims.faceWidthMm * dims.faceHeightMm) / (dims.widthMm * dims.heightMm), 1)}% of the card's area is face

CROWN         ${num(crownRatio * 100, 2)}% of height = ${num(crownMm, 1)} mm
  ⚠ A RATIO, so the TILT is identical at every card size. Sweeping the
    slider changes the crown on the wall pair and the floor pair together.
  measured tilt   ${measuredTilt === null ? "—" : num(measuredTilt, 2) + "°"}   <- FROM BUILT NORMALS. This is the one to trust.
  predicted tilt  ${num(predictedTilt, 2)}°   <- from the formula. Shares its maths with the geometry; cannot fail.
  ${
    measuredTilt !== null && Math.abs(measuredTilt - predictedTilt) > 2
      ? "DISAGREEMENT > 2 deg — the formula and the mesh do not match. Trust the mesh."
      : "the two agree"
  }

REFERENCE (face-on, orthographic, light 30 deg off-normal — DOES NOT TRANSFER)
  ${TILT_REFERENCE_INVISIBLE_DEG}deg  measured invisible
  ${TILT_REFERENCE_LEGIBLE_DEG}deg  measured clearly legible
  The floor at which convexity reads HERE must be re-derived: oblique view,
  89.9 deg lens, and eventually a neon rim a few mm away rather than a key light.

GLASS         ${glassOn ? "ON" : "off — the face is chunk 1's diagnostic grey"}
  roughness   ${glassOn ? num(glassRoughness, 3) : "—"}   opened at ${num(GLASS_ROUGHNESS, 3)}
  thickness   ${glassOn ? num(glassThicknessMm, 2) + " mm" : "—"}   opened at ${num(GLASS_THICKNESS_MM, 2)} mm
  ior ${GLASS_IOR} · transmission ${GLASS_TRANSMISSION} — fixed, not swept
  ⚠⚠ THE OPENING VALUES ARE A STARTING POINT, NOT A PROPOSAL. They came from
     an outside source and Carl passed them on as such, 17 September 2026.
     The face crown opened at an outside 0.015-0.03 and Carl's eye settled
     0.073 — nearly 3x. Do not read these as where the answer is.
  ⛔ THICKNESS IS A TYPED CONSTANT (9.80mm, Carl's), NOT heightMm x the crown
     ratio. That expression gives 28.6mm. The coupling to the crown is DECLINED,
     so sweeping the crown above does not move the glass.
  ⛔ WHAT THIS BENCH CANNOT SETTLE — the FINAL roughness. lod =
     log2(transmissionSamplerSize.x) x roughness, so FROST SCALE DEPENDS ON THE
     RENDER TARGET'S WIDTH, and this canvas is not the room's. The bench settles
     the frost's CHARACTER; its scale is set in the room, in 2b.
  ⚠ Blur and refraction offset are both sampled in SCREEN SPACE, so how far the
     proxy sits behind the glass changes neither. A textured plane at any depth
     shows the real character.
  ⚠ NOT WATCHED HERE: this bench creates its own transmission target and
     compiles every shader twice with NO warm-up. A stutter here is expected on
     /proto and is NOT a production regression.

TRIM as a share of card height
  bead   ${num((100 * dims.rimBeadMm) / dims.heightMm, 2)}%
  bevel  ${num((100 * dims.bevelWidthMm) / dims.heightMm, 2)}%
  Q5 answer card for comparison: rim 4.2% of height, consuming 8.3%, and it reads.`}
      </pre>
    </div>
  );
}
