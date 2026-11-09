import type * as THREE from "three";
import { MeshStandardNodeMaterial } from "three/webgpu";
import { cameraFar, cameraNear, cameraPosition, cameraViewMatrix, float, Fn, If, Loop, Break, length, materialRoughness, normalize, positionWorld, select, uniform, vec3, vec4, viewZToPerspectiveDepth } from "three/tsl";

/**
 * ⛔ THE LIQUID, ROUTE B — PROBE 1: THE SHADE NULL CONTROL (9 November 2026, session 3; THROWAWAY, removed after the
 * choice). `live-work/structural-note-hero-liquid-9-november.md` v1.5, APPROVED (Carl: *"i will trust your judgement.  as it
 * stands"*): route B lights a RAYMARCHED surface with the logo's material, and is OUT if that surface's shade differs from a
 * mesh's (Carl's T2 rule: *"Ant intense shade difference and it could be perceived as a differet object"*).
 *
 * ONE SPHERE, RAYMARCHED, inside a proxy box: each pixel of the box marches along the camera's ray (sphere tracing: step by
 * the distance to the surface) until it hits the sphere, or is DISCARDED. The hit then replaces the box's surface:
 * - its NORMAL (view space, `normalNode`, which `normalView` returns for every lighting term in r185);
 * - its DEPTH (`depthNode`, the same perspective conversion three uses, `viewZToPerspectiveDepth`), so it sits among the
 *   scene's other surfaces.
 * The view direction needs no override: the hit lies on the same camera ray as the box's pixel, so `positionViewDirection`
 * is already the hit's (perspective camera). The lights here (a hemisphere and a directional) and the reflection depend only
 * on the normal and that direction. ⚠ A POINT or SPOT light would also need the hit's POSITION: not handled; none exists.
 *
 * The material's colour, metalness, roughness and reflection are set by its user, `HeroLogo`, FROM THE LOGO's OWN MATERIAL,
 * so the comparison is against the exact material the logo wears. Unreal: a Ray Marching material with Pixel Depth Offset.
 * A SDF sphere; the logo's term and the smooth minimum come in later probes.
 */
export type LiquidProbeUniforms = { centre: { value: THREE.Vector3 }; radius: { value: number } };

/** the march: 96 steps, a hit within 0.01 cm (the scene is in cm) */
const STEPS = 96;
const HIT_CM = 0.01;

export function liquidProbeMaterial(): THREE.Material {
  const m = new MeshStandardNodeMaterial();
  const centre = uniform(vec3(0, 0, 0));
  const radius = uniform(20);
  // the ray through this pixel, and the angle one pixel spans (its screen-space change; outside the loop, so the
  // derivatives are taken in uniform control flow)
  const dir = normalize(positionWorld.sub(cameraPosition));
  const pixelAngle = dir.dFdx().length().max(dir.dFdy().length());
  // the march: from the camera, starting where the ray enters the proxy box. Returns the surface point (the hit, or on a
  // miss the ray's CLOSEST APPROACH) and the pixel's COVERAGE (0–1)
  const march = Fn(() => {
    const t = length(positionWorld.sub(cameraPosition)).toVar();
    const hit = float(0).toVar();
    const dMin = float(1e9).toVar();
    const tMin = float(0).toVar();
    Loop(STEPS, () => {
      const d = length(cameraPosition.add(dir.mul(t)).sub(centre)).sub(radius).toVar();
      If(d.lessThan(dMin), () => {
        dMin.assign(d);
        tMin.assign(t);
      });
      If(d.lessThan(HIT_CM), () => {
        hit.assign(1);
        Break();
      });
      t.addAssign(d);
    });
    const tAt = select(hit.greaterThan(0.5), t, tMin);
    const p = cameraPosition.add(dir.mul(tAt));
    // ⛔ THE EDGE (FOUND IN PROBE 1's SECOND RUN: the shade matched inside, the RIM failed — a mesh's edge is multisampled
    // (the scene pass, 4×), a discard is not). COVERAGE, in pixels at this distance (`footprint`), centred as
    // multisampling's is (a pixel centred ON the silhouette is half covered):
    // - a MISS: 0.5 less the closest approach in pixels (0 when the ray passes a pixel or more away);
    // - a HIT: 0.5 plus how far inside the silhouette the ray is, from the grazing angle (the sphere's: r(1 − sin θ));
    // handed to multisampling as alpha (`alphaToCoverage`). ⚠ The hit's estimate is the SPHERE's; metaballs need their
    // own (the local curvature) — a later probe.
    const footprint = tAt.mul(pixelAngle).max(1e-4);
    const c = normalize(p.sub(centre)).dot(dir.negate()).clamp(0, 1);
    const inside = radius.mul(float(1).sub(float(1).sub(c.mul(c)).max(0).sqrt()));
    const coverage = select(hit.greaterThan(0.5), inside.div(footprint).add(0.5).clamp(0.5, 1), float(0.5).sub(dMin.div(footprint)).clamp(0, 0.5));
    return vec4(p, coverage);
  })();
  const hitWorld = march.xyz;
  // the box's pixel is kept only where the sphere covers some of it; the coverage goes to multisampling
  m.maskNode = march.w.greaterThan(0.001);
  m.opacityNode = march.w;
  m.alphaToCoverage = true;
  // the sphere's normal at the hit, into view space (what `normalView` must be)
  const hitNormalView = normalize(cameraViewMatrix.mul(vec4(normalize(hitWorld.sub(centre)), 0)).xyz);
  m.normalNode = hitNormalView;
  // ⛔ FOUND IN PROBE 1's FIRST RUN (null mean 5.5, the interior 2.9 over 72 % of its pixels): r185's standard material adds
  // SPECULAR ANTI-ALIASING to the roughness — the screen-space change of the GEOMETRY's normal (`getGeometryRoughness`,
  // via `getRoughness`). A mesh sphere gets it from its curvature; the proxy box's flat faces give 0, so the raymarched
  // sphere drew SHARPER. The same term, from the HIT's normal, is added here (`getRoughness` then adds the box's 0)
  const d = hitNormalView.dFdx().abs().max(hitNormalView.dFdy().abs());
  m.roughnessNode = materialRoughness.add(d.x.max(d.y).max(d.z));
  // the hit's depth, so the sphere occludes and is occluded as a mesh would be
  m.depthNode = viewZToPerspectiveDepth(cameraViewMatrix.mul(vec4(hitWorld, 1)).z, cameraNear, cameraFar);
  (m.userData as { probe?: LiquidProbeUniforms }).probe = { centre: centre as unknown as LiquidProbeUniforms["centre"], radius: radius as unknown as LiquidProbeUniforms["radius"] };
  return m as unknown as THREE.Material;
}
