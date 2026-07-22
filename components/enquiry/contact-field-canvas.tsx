"use client";

/**
 * Contact-field canvas — the WebGL mount for the first Three.js contact-field
 * object, overlaid on the existing `.enquiry-contact-layer`.
 *
 * PIXEL MAPPING: the camera is ORTHOGRAPHIC with `zoom: 1`. @react-three/fiber
 * sets an orthographic frustum to `left = -size.width/2 … top = size.height/2`
 * in CSS pixels, and reapplies it whenever the measured size changes. One world
 * unit therefore equals one CSS pixel exactly, and stays exact across resize
 * with no resize code here. A perspective camera would foreshorten this field
 * (it sits 146px off the optical axis), so its silhouette would no longer
 * measure a clean 284 x 38 — which is precisely what this object must prove.
 *
 * PLACEMENT: the wrapper is `position: absolute; inset: 0`, so it fills the
 * contact layer exactly, contributes NOTHING to layout, and bypasses the
 * layer's flex centring. That is why the approved `.enquiry-contact-layer` CSS
 * needs no change, and why Send and the active slot cannot be displaced.
 *
 * SCOPE: geometry/scale/placement proof only. Static — no animation, no
 * interaction, no timing. Neutral diagnostic material and static light only.
 * No environment map (drei's `Environment preset` fetches from a CDN and failed
 * in this project — a 301 redirect went unhandled inside Suspense and left the
 * scene blank with NO console error; see components/lab/card-material-lab.tsx).
 */

import { useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { fieldPlacement } from "./contact-field-geometry";
import { ContactField } from "./contact-field-mesh";

// Static illumination. The key is deliberately RAKING from the upper left: a
// shallow crown is only legible under a grazing light, and a head-on key
// flattens it entirely.
//
// The z component is what matters here, and it must be read against the
// object's scale. The field is ~284 x 38 wide but only ~8.7 units DEEP, and the
// crown's steepest face tilt is ~7.4 degrees from flat. A light at z=200 sits
// only ~37 degrees off the surface normal, which is effectively head-on at this
// depth: measured Lambert response across the whole crown was ~5%, i.e. a flat
// slab with no readable form (verified from a render, not assumed).
//
// Dropping z well below the lateral offsets puts the key at a genuinely grazing
// angle (~76 degrees off-normal), so a shallow crown and the bevel shoulder both
// register. Geometry is unchanged — only the light angle is corrected.
const KEY_LIGHT_POSITION: [number, number, number] = [-160, 120, 40];
const KEY_LIGHT_INTENSITY = 1.6;
// A second, much dimmer fill from the opposite side keeps the unlit flank from
// going dead while preserving the directional read.
const FILL_LIGHT_POSITION: [number, number, number] = [140, -90, 60];
const FILL_LIGHT_INTENSITY = 0.35;
const AMBIENT_INTENSITY = 0.22;

function FieldScene() {
  // The layer's measured CSS box, tracked by R3F. This is the whole responsive
  // story: width changes flow into the placement maths automatically.
  const size = useThree((state) => state.size);
  const placement = useMemo(
    () => fieldPlacement(size.width, size.height),
    [size.width, size.height],
  );

  return (
    <>
      <ambientLight intensity={AMBIENT_INTENSITY} />
      <directionalLight position={KEY_LIGHT_POSITION} intensity={KEY_LIGHT_INTENSITY} />
      <directionalLight position={FILL_LIGHT_POSITION} intensity={FILL_LIGHT_INTENSITY} />
      <ContactField placement={placement} />
    </>
  );
}

/**
 * Decorative geometry proof: `aria-hidden`, non-interactive, no focus target.
 * There is no form control here yet, so there is nothing to label — a stand-in
 * label would be worse than none, announcing a control that does not exist.
 *
 * No reduced-motion branch by design: the object is completely static, so there
 * is nothing to reduce. Gating it on `prefers-reduced-motion` would invent a
 * behaviour difference where none is warranted.
 */
export default function ContactFieldCanvas() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
    >
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1000], near: 0.1, far: 4000 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        // The scene never changes, so render on mount/resize then idle rather
        // than running a 60fps loop behind a static image. This also enforces
        // "static" architecturally. Revisit if animation is ever authorised.
        frameloop="demand"
        style={{ pointerEvents: "none" }}
      >
        <FieldScene />
      </Canvas>
    </div>
  );
}
