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
 * SCOPE: geometry/scale/placement proof plus ONE material sample on the bevel.
 * Static — no animation, no interaction, no timing.
 *
 * ENVIRONMENT: there IS now a reflection environment, generated ENTIRELY
 * LOCALLY (see `useStudioEnvMap` below). A small Three.js scene is constructed
 * in code from ordinary reflection-panel meshes, converted to a prefiltered
 * radiance map by `PMREMGenerator.fromScene()` on the GPU, and the resulting map
 * is assigned DIRECTLY to the gold bevel material — never to `scene.environment`.
 *
 * No HDRI, no CDN preset, no downloaded asset, no network request of any kind.
 * Passing `preset` or `files` to drei's `Environment` is what triggers a remote
 * fetch, and that path is deliberately NOT used: it failed in this project once
 * already (a 301 redirect from the drei-assets host went unhandled inside
 * Suspense and left the scene blank with NO console error; see the run log).
 */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
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

// ── Local procedural studio environment (reflection only) ────────────────────
// A metal shows almost nothing without something to REFLECT. Direct lights give
// a metal only tiny specular points, which is why the earlier `metalness: 1`
// attempt rendered the bevel near-black. This environment exists so genuinely
// metallic gold (metalness 1.0) has a surrounding to reflect.
//
// It is a controlled DARK PRODUCT STUDIO, not a scene: predominantly black,
// one broad restrained warm-white source above/upper-left, one much dimmer cool
// opposing fill. No scenery, no room, no colourful backdrop, no imagery.
//
// GENERATED ENTIRELY LOCALLY: a small scene is built in code and converted to a
// prefiltered radiance map by three's own `PMREMGenerator.fromScene()`, on the
// GPU. No HDRI, no CDN preset, no downloaded asset, no network request.
//
// WHY NOT `scene.environment` (drei's <Environment>, the obvious route): that
// assigns the map SCENE-WIDE, so every standard material samples it and
// isolation depends on getting per-material opt-outs right everywhere. Assigning
// the map to the BEVEL MATERIAL ALONE instead makes containment DETERMINISTIC:
// no other material references the map, so nothing else can respond to it.
//
// While trying the scene-wide route, the diagnostic-grey FACE was measured
// changing as the environment changed, even with its `envMapIntensity` at 0:
//
//   env key / scale        bevel maxWarm   face luma peak   face warm
//   (none, baseline)            52              ~61             0
//   1.50  scale 14x7            27               83            3-5
//   0.55  scale 14x7            17               69            1-2
//   0.55  scale 40x22           52               91            4-7
//   per-material envMap         91               61             0
//
// Those measurements are recorded as OBSERVATIONS only. An earlier version of
// this comment blamed ACES filmic tone mapping reacting to total scene
// luminance; that explanation is WRONG and has been removed. ACES is selected
// globally on the renderer, but three applies it per fragment, from that
// fragment's own outgoing colour and the fixed `toneMappingExposure` uniform
// (see tonemapping_pars_fragment.glsl) — it performs no averaging, histogram or
// adaptive exposure, so it cannot lift an unrelated pixel. The true cause of the
// measured face change was never proven and is deliberately left unclaimed.
// The per-material route is chosen for guaranteed containment, not as a
// workaround for adaptive exposure.
/**
 * Radius of the studio shell. Small, closed and finite — the map only needs to
 * describe direction, so nothing is gained by a larger surround.
 */
const ENV_SHELL_RADIUS = 60;
/** Broad warm-white key reflection, above and upper-left. */
const ENV_KEY_COLOR = "#fff2dd";
const ENV_KEY_INTENSITY = 2.6;
/** Dimmer neutral-cool opposing fill, so the far flank is not dead black. */
const ENV_FILL_COLOR = "#c8d4e6";
const ENV_FILL_INTENSITY = 0.5;

/**
 * Build the studio radiance map on the GPU and return its texture, applied to
 * the BEVEL MATERIAL ALONE (never to `scene.environment`).
 *
 * LIFECYCLE — the reason this is an effect and not a `useMemo`.
 * `PMREMGenerator.fromScene()` returns a `WebGLRenderTarget`, and the texture
 * handed out here is that target's texture. Only the TARGET can free the GPU
 * allocation, so it must be owned for as long as it is in use and disposed on
 * teardown. A previous version returned `target.texture` from a `useMemo` and
 * dropped the target, which leaked one render target per mount — and this canvas
 * mounts and unmounts with the enquiry `complete` stage, so remounts accumulated.
 *
 * Allocating in an effect rather than during render also means React
 * development/Strict Mode's double-invoke cannot strand an allocation: every
 * allocation has a matching cleanup, and a discarded one is disposed rather than
 * orphaned. The effect re-runs if the renderer is ever replaced, disposing the
 * old target first, so remounting and renderer swaps are both safe.
 *
 * The map is never routed through React state or read during render. It is a
 * GPU resource consumed by one material, so the effect assigns it DIRECTLY to
 * that material via a ref and marks the material for recompile. This avoids
 * both `react-hooks/set-state-in-effect` (setState in an effect/cleanup) and
 * `react-hooks/refs` (reading `ref.current` during render), and it is the more
 * honest description of what is happening: a texture is being attached to a
 * material, not state driving a re-render.
 *
 * `invalidate()` asks R3F for one more frame once the map is attached —
 * necessary because this canvas runs `frameloop="demand"` and would otherwise
 * keep showing the frame drawn before the map existed.
 *
 * Returns the ref to attach to the bevel material. The ref is created and owned
 * HERE rather than passed in, so the effect only ever mutates a value it owns.
 */
function useStudioEnvMap(): React.RefObject<THREE.MeshStandardMaterial | null> {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const targetMaterial = useRef<THREE.MeshStandardMaterial | null>(null);

  useEffect(() => {
    const studio = new THREE.Scene();
    const disposables: Array<THREE.BufferGeometry | THREE.Material> = [];

    // Reflection panels. `MeshBasicMaterial` with `toneMapped: false` and the
    // colour pre-multiplied by intensity: these are things to be SEEN IN a
    // reflection, not lights. Large rather than fierce — a tubular bevel
    // reflects a wide arc, so a big soft source reads as a satin sweep instead
    // of a hot pinpoint.
    const panel = (
      color: string,
      intensity: number,
      position: [number, number, number],
      size: [number, number],
    ) => {
      const geometry = new THREE.PlaneGeometry(size[0], size[1]);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position[0], position[1], position[2]);
      mesh.lookAt(0, 0, 0);
      studio.add(mesh);
      disposables.push(geometry, material);
    };

    // Black surround — the dark-studio baseline everything else sits against.
    const shellGeometry = new THREE.SphereGeometry(ENV_SHELL_RADIUS, 16, 16);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.BackSide,
      toneMapped: false,
    });
    studio.add(new THREE.Mesh(shellGeometry, shellMaterial));
    disposables.push(shellGeometry, shellMaterial);

    panel(ENV_KEY_COLOR, ENV_KEY_INTENSITY, [-16, 22, 18], [70, 38]);
    panel(ENV_FILL_COLOR, ENV_FILL_INTENSITY, [18, -16, 14], [48, 26]);

    // The generator and the temporary studio scene are only needed to produce
    // the map; the TARGET is what must outlive them.
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromScene(studio, 0, 0.1, 200);
    pmrem.dispose();
    disposables.forEach((d) => d.dispose());
    studio.clear();

    const material = targetMaterial.current;
    if (material) {
      material.envMap = target.texture;
      material.needsUpdate = true;
    }
    invalidate(); // frameloop="demand": request the frame that shows the map

    return () => {
      // Detach BEFORE disposing, so a disposed texture can never be sampled.
      // Disposing the render target releases its texture with it.
      if (material) {
        material.envMap = null;
        material.needsUpdate = true;
      }
      target.dispose();
      invalidate();
    };
  }, [gl, invalidate]);

  return targetMaterial;
}

function FieldScene() {
  // Owns the studio render target and hands back the ref to attach to the
  // bevel material. Only this one material ever receives the map.
  const bevelMaterialRef = useStudioEnvMap();

  // The layer's measured CSS box, tracked by R3F. This is the whole responsive
  // story: width changes flow into the placement maths automatically.
  const size = useThree((state) => state.size);
  const placement = useMemo(
    () => fieldPlacement(size.width, size.height),
    [size.width, size.height],
  );

  return (
    <>
      {/* Existing key/fill/ambient rig — UNCHANGED. The studio map adds
          something for the metal to REFLECT; it does not relight the scene and
          is never assigned to `scene.environment`. */}
      <ambientLight intensity={AMBIENT_INTENSITY} />
      <directionalLight position={KEY_LIGHT_POSITION} intensity={KEY_LIGHT_INTENSITY} />
      <directionalLight position={FILL_LIGHT_POSITION} intensity={FILL_LIGHT_INTENSITY} />
      <ContactField placement={placement} bevelMaterialRef={bevelMaterialRef} />
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
