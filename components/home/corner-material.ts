/**
 * ⛔ THE ORNATE CORNERS' MATERIALS — ONE COPY, read by the home page (`corner-canvas.tsx`) and the bench (`corner-bench.tsx`)
 * — D-100, 19 October 2026 (session 2). Moved out of the bench so the page and the bench cannot drift (the structural note,
 * `live-work/structural-note-ornate-corners-on-home-19-october.md`, files).
 *
 * The values are the APPROVED pass-2 takes, verbatim:
 *  - §2 GOLD — satin gilt (R-082, *"The Satin gilt look is very good… Approved."*): physical gold F0, metalness 1,
 *    roughness 0.45, the family buttons' studio at room 0.1, strength 1, turned 150°.
 *  - §3 PLATINUM BLUE — enamel over metal (R-083, approved with a caveat carried to pass 3: *"a bit dark, some of the detail
 *    is being lost"*): the swatch blue leaned towards platinum (tint 0.75), roughness 0.35, a clear coat 1 / 0.06, strength 2.
 * ⛔ Changing a value here changes BOTH the page and the bench — the approval was given to these numbers.
 */
import * as THREE from "three";
import { GOLD_F0_LINEAR, platinumBlueF0 } from "@/components/about/logo-mark-material";

export type CornerColour = "gold" | "blue";
export type CornerLook = { roughness: number; envInt: number; yaw: number; room: number; coat: number; coatRough: number; tint: number };

/** ⛔ §2 — the approved satin gilt (R-082). */
export const CORNER_GOLD: CornerLook = { roughness: 0.45, envInt: 1, yaw: 150, room: 0.1, coat: 0, coatRough: 0.06, tint: 1 };
/** ⛔ §3 — the approved enamel (R-083). ⚠ The swatch blue as plain metal measured a third of the gold's brightness and
 *  vanished at true size; enamel's physics — blue glass over BRIGHT metal — is why the body leans to platinum (tint 0.75) and
 *  the studio is raised (strength 2). `live-work/scripts/corner-brightness-19-october.mjs`. */
export const CORNER_BLUE: CornerLook = { roughness: 0.35, envInt: 2, yaw: 150, room: 0.1, coat: 1, coatRough: 0.06, tint: 0.75 };
export const CORNER_LOOKS: Record<CornerColour, CornerLook> = { gold: CORNER_GOLD, blue: CORNER_BLUE };

/**
 * ⛔ PASS 3 — THE LIGHT ON THE PAGE (19 October 2026, session 2). Carl: *"On the corners you can see the highlights and
 * shadows.. All that is needed is simple movement from a light to indicate that the geometry is 3d. Not as dramatic as the
 * q+a or the client info. just emough to say what these objects are. To give them a little life. The blue corners must be
 * less dark."*
 * - ⛔ THE MOVEMENT IS THE STUDIO's, NOT A LAMP's: metal is lit by what it reflects (the logo standard, D-088), so the studio
 *   drifts in a slow small circle about its approved turn (150°) — `yawDeg` side to side, `pitchDeg` up and down, a quarter
 *   period apart, once per `periodS`. The softboxes' reflections slide across the carving; the pieces never move.
 *   Under reduced motion the studio holds at its approved turn.
 * - ⛔ THE BLUE, LIGHTER BY ITS LIGHT, NOT ITS MATERIAL (R-083's caveat: *"subject it to different lighting conditions we
 *   should be able to remedy that"*): the page's studio gain per section multiplies the approved strength. The bench keeps
 *   the approved pass-2 look (gain 1).
 * ⚠ All takes, for Carl's eye.
 */
export const CORNER_LIGHT = {
  sway: { yawDeg: 20, pitchDeg: 10, periodS: 12 },
  gain: { gold: 1, blue: 2 } as Record<CornerColour, number>,
};

/** The metal's colour (linear F0) for a section. */
export function cornerF0(colour: CornerColour, look: CornerLook): readonly [number, number, number] {
  return colour === "gold" ? GOLD_F0_LINEAR : platinumBlueF0(look.tint);
}

/** The relief's two maps — the outline (`alphaMap`, cut at `alphaTest` 0.5) and the carving (object-space normals). */
export type CornerMaps = { normalMap: THREE.Texture; alphaMap: THREE.Texture };

/** The approved material as the bench draws it: OPAQUE (three.js's default) — every pixel the mask passes at alpha 1. */
export function createCornerMaterial(colour: CornerColour, look: CornerLook, maps: CornerMaps, hdri: THREE.Texture): THREE.MeshPhysicalMaterial {
  const m = new THREE.MeshPhysicalMaterial({
    metalness: 1, roughness: look.roughness, envMap: hdri, envMapIntensity: look.envInt,
    normalMap: maps.normalMap, normalMapType: THREE.ObjectSpaceNormalMap, alphaMap: maps.alphaMap, alphaTest: 0.5,
    clearcoat: look.coat, clearcoatRoughness: look.coatRough,
  });
  m.envMapRotation.set(0, (look.yaw * Math.PI) / 180, 0);
  const f0 = cornerF0(colour, look);
  m.color.setRGB(f0[0], f0[1], f0[2], THREE.LinearSRGBColorSpace);
  return m;
}

/**
 * ⛔ THE PAGE'S MATERIAL — the approved one with a per-box FADE (the structural note v6, "the fade's method").
 *
 * ⛔ WHY NOT `opacity`: three.js multiplies `opacity` into the alpha BEFORE `alphaTest` discards, so an opacity fade would
 *   ERODE the outline (nothing until ~0.5, then the shape growing out from its thick parts) — verified in three.js.
 * ⛔ WHY `transparent: true` PERMANENTLY: `transparent` decides the program (`#define OPAQUE` forces alpha to 1,
 *   `WebGLPrograms.js`) and the renderer does not re-check it between frames — a toggle either silently kills the fade or
 *   recompiles on the frame the fade lands.
 * ⛔ WHY ALPHA = THE FADE ALONE, NOT MASK × FADE: the approved look was rendered OPAQUE — every pixel past the test at alpha
 *   1. The mask is blurred (`corner-geometry.ts`), so mask × fade would leave every outline 0.5–1 alpha: a softer, darker rim
 *   than R-082 / R-083. With the fade alone, fade = 1 IS the approved edge; the mask only cuts.
 * ⛔ NO custom program cache key: the injected source is identical for every box, so all of a section's boxes share ONE
 *   program (`answer-card-mesh.tsx` records a cache key taking the worst frame gap ~150 → ~620 ms). Each box's fade is its
 *   own uniform object.
 * ⚠ The blend is three.js's default `NormalBlending` with the material's `premultipliedAlpha` false (`SRC_ALPHA,
 *   ONE_MINUS_SRC_ALPHA`), so a half-faded corner composites as colour × alpha — no highlight glows through.
 */
export function createCornerFadeMaterial(colour: CornerColour, maps: CornerMaps, hdri: THREE.Texture): { material: THREE.MeshPhysicalMaterial; fade: { value: number } } {
  const material = createCornerMaterial(colour, CORNER_LOOKS[colour], maps, hdri);
  const fade = { value: 0 };
  material.envMapIntensity *= CORNER_LIGHT.gain[colour];
  material.transparent = true;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uCornerFade = fade;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uCornerFade;")
      .replace("#include <alphatest_fragment>", "#include <alphatest_fragment>\ndiffuseColor.a = uCornerFade;");
  };
  return { material, fade };
}
