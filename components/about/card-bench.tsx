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
 */

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  cardDims,
  FLOOR_CARD_ASPECT,
  WALL_CARD_ASPECT,
  FLOOR_CARD_HEIGHT_MM,
  CROWN_RATIO,
  PROXY_COLORS,
  maxFaceTiltDegrees,
  TILT_REFERENCE_INVISIBLE_DEG,
  TILT_REFERENCE_LEGIBLE_DEG,
} from "./about-card-geometry";
import { AboutCardMesh } from "./about-card-mesh";


/**
 * ⚠ `side` AND `top` ARE EDGE-ON ORTHOGRAPHIC-ISH VIEWS, added 11 September 2026
 * so the PROFILE can be read directly rather than inferred from shading. They are
 * the views Carl's own sketches are drawn in, and the only ones that show how far
 * the face stands proud of the bevel.
 */
type View = "face" | "oblique" | "side" | "top";

export default function CardBench() {
  const [heightMm, setHeightMm] = useState(FLOOR_CARD_HEIGHT_MM);
  const [aspect, setAspect] = useState(FLOOR_CARD_ASPECT);
  /**
   * ⚠ THE SLIDER IS A RATIO NOW, NOT MILLIMETRES — Carl, 11 September: the formula
   * is shared across cards, the figures are not. Sweeping this changes the crown
   * on EVERY size at once, which is what a family parameter should do; a
   * millimetre slider would tune one card and silently leave the others.
   */
  const [crownRatio, setCrownRatio] = useState(CROWN_RATIO);
  const crownMm = heightMm * crownRatio;
  const [ovalExpand, setOvalExpand] = useState(1.35);
  const [lightAngle, setLightAngle] = useState(60);
  const [view, setView] = useState<View>("oblique");
  const [measuredTilt, setMeasuredTilt] = useState<number | null>(null);
  const [proxyOn, setProxyOn] = useState(true);

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
            <option value={FLOOR_CARD_ASPECT}>floor 2.026:1</option>
            <option value={WALL_CARD_ASPECT}>wall 1.615:1</option>
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
          gl={{ antialias: true, alpha: true }}
          frameloop="always"
        >
          {/* ⚠ Deliberately dim ambient. The room is dark and the point of this
              bench is SHADOW; a bright fill would erase the thing being judged. */}
          <ambientLight intensity={0.12} />
          <directionalLight position={lightPos} intensity={2.4} />

          {/* The transmission proxy — a flat plane of the sampled floor colour,
              standing in for what is behind the card in the room.
              ⛔ It does nothing under a diagnostic material; it is here so the
              same scene serves chunk 2 without restructuring. */}
          {/* ⚠ Hidden edge-on: seen from the side the proxy is a wall across the
              frame and the card's profile disappears behind it. */}
          {proxyOn && !edgeOn && (
            <mesh position={[0, 0, -dims.heightMm * 0.06]}>
              <planeGeometry
                args={[dims.widthMm * 1.6, dims.heightMm * 1.6]}
              />
              <meshStandardMaterial
                color={PROXY_COLORS.CD}
                roughness={0.95}
                metalness={0}
              />
            </mesh>
          )}

          <AboutCardMesh
            dims={dims}
            crownMm={crownMm}
            ovalExpand={ovalExpand}
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

TRIM as a share of card height
  bead   ${num((100 * dims.rimBeadMm) / dims.heightMm, 2)}%
  bevel  ${num((100 * dims.bevelWidthMm) / dims.heightMm, 2)}%
  Q5 answer card for comparison: rim 4.2% of height, consuming 8.3%, and it reads.`}
      </pre>
    </div>
  );
}
