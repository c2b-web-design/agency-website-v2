import * as THREE from "three";
import { MeshStandardNodeMaterial, type NodeBuilder } from "three/webgpu";
import { color, dot, float, mrt, normalView, positionViewDirection, pow, saturate, uniform, vec4 } from "three/tsl";

/**
 * ⛔ THE HERO TEXT's MATERIAL — EDGE-LIT ACRYLIC IN ICE BLUE (9 November 2026; D-101, *"THE TEXT's MATERIAL"*). TAKE 1: the
 * material only — the bloom is its own layer after it. Carl: *"The text colour should be ice blue and it should have a slight
 * glow/bloom. Not much, ever so subtle"* … *"From where the logo is positioned relative to the text the bevels are where we
 * want the magic to happen, We need to face to stay legible and readable."*
 * - WebGPU ONLY (TSL; Carl: *"WebGPU should be the choice"*): supplied by the WebGPU medium (`bench-medium-webgpu.tsx`,
 *   `heroText`) through the seam's optional slot (`bench-medium.ts`), so the WebGL half never imports it — route B of
 *   `live-work/structural-note-hero-text-material-9-november.md`. In the WebGL medium the text stays in clay.
 * - THE FACES: a lit dielectric — no metal, a satin roughness — so they read flat and legible and TAKE the logo's light
 *   later (the logo's phases light the text selectively, D-101). Unreal: Default Lit, Base Color, Roughness.
 * - THE GLOW: an EMISSIVE driven by a FRESNEL term, `(1 − N·V)^power` — 0 where a surface faces the camera (the faces, square
 *   on), rising across the rounded bevel as it turns away. That is how light gathers at the edges of acrylic. Unreal: the
 *   Fresnel node into Emissive (Exponent = `power`). Cost: one dot product and a pow per pixel — the material stays a
 *   standard one. The bevel's four segments shade as one round (the 30° crease, `hero-text.tsx`), so the glow runs smoothly
 *   round each letter's edge.
 * - THE ICE: #CFE6FF — C2B's own ice, already the head of the code rain in /about's player (`player-bench.tsx`) — distinct
 *   from the logo's platinum blue (#3F6DB8), so the rain phase keeps them apart. A starting point for Carl's eye.
 * ⚠ All values are TAKES, judged on the bench. `WebGPURenderer` tone-maps the whole frame once (Neutral on the bench), so the
 * emissive's strength is read through that.
 */
export const HERO_TEXT_ACRYLIC = {
  ice: "#cfe6ff",
  roughness: 0.4,
  /** the glow's colour — the same ice; its strength comes from `glow` */
  glowColor: "#cfe6ff",
  /** the emissive at full Fresnel (a surface edge-on to the camera) — ever so subtle */
  glow: 0.9,
  /** the Fresnel exponent: higher keeps the glow nearer the bevel's outer turn and off the faces */
  power: 2.5,
};

/**
 * ⛔ THE MASK ONLY WHERE THERE IS AN MRT (FOUND IN THE BUILD, 9 November 2026). A material's `mrtNode` on a render target
 * WITHOUT the renderer's MRT becomes its ENTIRE output (`NodeMaterial.js:576–578`, the bloom note's [A5]) — and that is not
 * a future case: with tone mapping on, EVERY plain draw goes through the renderer's internal frame-buffer target
 * (`needsFrameBufferTarget`, `Renderer.js:2446`), whose texture is not named `output`, so the text wrote NOTHING there — it
 * vanished from every plain frame (before the bloom compiled, the third-person PiP, `?medium` comparisons). So the mask is
 * attached PER BUILD: `setup` runs once per render-object variant (the MRT is part of its render context), and attaches
 * `glowMRT` only when the renderer has an MRT set — i.e. inside the bloom's pass. Everywhere else this is a plain standard
 * material. `setup` reads and uses `mrtNode` synchronously (`setupOutput`), so builds cannot interleave on it.
 */
class GlowMaskedStandardMaterial extends MeshStandardNodeMaterial {
  glowMRT: ReturnType<typeof mrt> | null = null;
  setup(builder: NodeBuilder) {
    this.mrtNode = builder.renderer.getMRT() !== null ? this.glowMRT : null;
    return super.setup(builder);
  }
}

export function heroTextMaterial(): THREE.Material {
  const s = HERO_TEXT_ACRYLIC;
  const m = new GlowMaskedStandardMaterial({ color: s.ice, roughness: s.roughness, metalness: 0 });
  const glow = uniform(s.glow);
  const power = uniform(s.power);
  // N·V in view space: the surface normal against the direction to the camera
  const facing = saturate(dot(normalView, positionViewDirection));
  const fresnel = pow(float(1).sub(facing), power);
  const edge = color(s.glowColor).mul(fresnel).mul(glow);
  m.emissiveNode = edge;
  // ⛔ THE GLOW MASK (9 November 2026; the bloom note v1.3 [R5], `hero-bloom.ts`): the text is the ONE object that writes
  // `glow`, so only its bevels bloom — attached ONLY inside an MRT draw (`GlowMaskedStandardMaterial`, below)
  m.glowMRT = mrt({ glow: vec4(edge, 1) });
  m.name = "hero text: edge-lit acrylic";
  return m;
}
