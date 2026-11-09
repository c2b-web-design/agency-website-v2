import * as THREE from "three";
import { RenderPipeline } from "three/webgpu";
import { max, mrt, output, pass, renderOutput, vec3, vec4 } from "three/tsl";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";

/**
 * ⛔ THE HERO's GLOW — A SELECTIVE BLOOM (9 November 2026; D-101; `live-work/structural-note-hero-text-bloom-9-november.md`
 * v1.3, APPROVED by Carl: *"yes. v 1.3 approved."*, after four Architect reviews). Carl: *"ever so subtle"*.
 *
 * ONE SCENE PASS, TWO OUTPUTS (MRT): the colour (`output`) and the GLOW MASK (`glow`, default `vec4(0)`). ⛔ The mask is
 * written ONLY by a material that sets `mrtNode = mrt({ glow })` — today the text alone (`hero-text-material.ts`). Carl
 * ([R5]): *"A separate glow mask  Having 2 glowing objects is a bit much. A second one may take the focus off the text."* —
 * so a red-hot logo can be hot (emissive) without glowing. `bloom()` blurs ONLY the mask; the result is added to the scene.
 *
 * - [R1] ONE CAMERA. The pass and the bloom update once per FRAME (`updateBeforeType = FRAME`) and are sized to the whole
 *   drawing buffer, so `render(camera)` serves one camera per frame: the shot camera in first person, the eye in third.
 *   The PiP (the shot camera in third person) is drawn PLAIN by the bench — the glow is judged in first person.
 * - [C3] The pass is built with the camera `make` is given (the shot camera); `render(camera)`
 *   swaps `scenePass.camera` (read each frame, `PassNode.js:799`).
 * - [R3] 4× MSAA on the pass: the renderer's `antialias` covers only its own framebuffer.
 * - [A4]/[B1] THE CANVAS IS TRANSPARENT AND PREMULTIPLIED (`alphaMode 'premultiplied'`; the bench's dark is CSS). The
 *   pipeline's own output transform is OFF; the graph applies the tone mapping and colour space itself, then the alpha.
 *   THE COMPOSITE (measured into shape, 9 November 2026 — the note's [B1] intent, its exact formula corrected):
 *     S     = renderOutput(vec4(scene.rgb + bloom·scene.a, scene.a))   (three's own un-premultiply → tone map → encode
 *                                                                        → premultiply, with the scene's REAL alpha)
 *     G     = encode(bloom)                                             (the glow as light on its own)
 *     rgb   = S.rgb + G · (1 − scene.a)
 *     alpha = scene.a + maxChannel(G) · (1 − scene.a)
 *   At strength 0: S alone — EXACTLY the renderer's plain output pass (with tone mapping on, the plain draw also renders
 *   into a linear target and runs `renderOutput` on it). Opaque: encode(c + bloom), alpha 1. Over the empty canvas: G, alpha
 *   its brightest channel ([B1]). Every channel ≤ alpha (a valid premultiplied pixel) — expanded,
 *   rgb = a·enc(c + b) + (1 − a)·enc(b) and α = a + (1 − a)·max(enc(b)) — ⚠ PROVIDED THE ENCODED VALUES STAY ≤ 1: the
 *   bench's NEUTRAL tone mapping guarantees it; NoToneMapping or an HDR output would break it (the Architect, 9 November).
 *   ⛔ THE IDENTITY's ONE RESIDUE, TRACKED DOWN (9 November 2026; Carl: "We should always track down and fix problems"):
 *   66 pixels on the bench's guide LINES. Bisected: lines hidden → exact (max 0); the lines' alpha-to-coverage off → exact;
 *   grid hidden or the pass without MRT → unchanged. The cause is three r185's PLAIN path: drawing into its internal
 *   frame-buffer target (tone mapping on) `currentSamples` reports 0 (`Renderer.js:2476–2490`) though that target is
 *   created 4× multisampled, so `Line2NodeMaterial` takes its hard-edged branch (`Line2NodeMaterial.js:338`); in THIS pass's
 *   own 4× target it reports 4 and the lines get their designed alpha-to-coverage edge. Not this composite, not the MRT,
 *   not transparency. The glow pass draws the lines CORRECTLY.
 *   Where the glow overlaps a semi-transparent pixel the result is an APPROXIMATION (the glow over a partly covered
 *   pixel), checked by the halo test, not exact. ⚰️ Two earlier builds MEASURED wrong
 *   by the identity check (a null control at 0 first): a hand-rolled un-premultiply (the grid lines off), then [B1]
 *   verbatim, `encode(scene.rgb + bloom)` with alpha 1 into the transform (every antialiased edge off, up to 92 levels —
 *   it skipped `renderOutput`'s un-premultiply/premultiply round trip).
 * - ⛔ NO PRECOMPILE — a DEVIATION from the approved note's [B3]/[C2], FOUND IN THE BUILD (9 November 2026). Three's
 *   async compile builds each shader LATER, reading the renderer's LIVE render target and MRT (`Renderer.compileAsync`'s
 *   work items, `NodeMaterial.setup`), which is why `PassNode.compileAsync` holds the renderer on its target and MRT across
 *   its await. On the bench the renderer keeps drawing meanwhile (and the arch's own compile wait runs too): measured —
 *   `PassNode.compileAsync` blanked the canvas ("Active draw buffers with missing fragment shader outputs" ×209, the WebGL
 *   2 fallback); setting the state, starting the compile and restoring it at once gave builds with the WRONG outputs and
 *   GPU errors ("Color target has no corresponding fragment stage output", the depth format undefined — real WebGPU). So
 *   the glow draws from the FIRST frame and its shaders compile once, synchronously, on that frame — three's default: the
 *   "small first-frame hitch, KNOWN" the note accepted, now including the scene pass. The first cost samples are thrown
 *   away. No promise, so [C2]'s stale-promise hazard does not arise. The home page can compile before it shows anything.
 * - [S] `dispose()` frees the pipeline's quad AND the pass's and the bloom's render targets (`RenderPipeline.dispose()`
 *   frees only its quad's material).
 * - The tone mapping and colour space are read from the renderer when the graph is built, and the graph is REBUILT if
 *   either changes (with the transform in our hands, `RenderPipeline._update` no longer does it).
 * ⛔ WebGPU ONLY: imported only by `bench-medium-webgpu.tsx` (the seam's `post` slot), never by the WebGL half. The same
 * module is meant for the home page's hero canvas (one camera, no PiP).
 */
export const HERO_BLOOM_DIALS = {
  /** how much of the blurred glow is added — ever so subtle */
  strength: 0.45,
  /** 0–1: how far the glow spreads (three's mip blend) */
  radius: 0.35,
  /** 0: the mask is already the selection — everything in it may glow */
  threshold: 0,
};
export type HeroBloomDials = typeof HERO_BLOOM_DIALS;

export type HeroBloom = {
  render(camera: THREE.Camera): void;
  dispose(): void;
  set(d: Partial<HeroBloomDials>): void;
};

type GpuRenderer = ConstructorParameters<typeof RenderPipeline>[0];

export function makeHeroBloom(renderer: unknown, scene: THREE.Scene, camera: THREE.Camera): HeroBloom {
  const r = renderer as GpuRenderer;
  const scenePass = pass(scene, camera, { samples: 4 });
  scenePass.setMRT(mrt({ output, glow: vec4(0) }));
  const colour = scenePass.getTextureNode("output");
  const mask = scenePass.getTextureNode("glow");
  const glow = bloom(mask, HERO_BLOOM_DIALS.strength, HERO_BLOOM_DIALS.radius, HERO_BLOOM_DIALS.threshold);
  const pipeline = new RenderPipeline(r);
  pipeline.outputColorTransform = false;

  let builtFor: { toneMapping: THREE.ToneMapping; colorSpace: string } | null = null;
  const build = () => {
    const toneMapping = r.toneMapping;
    const colorSpace = r.outputColorSpace;
    const b = glow.rgb;
    const a = colour.a;
    // THE SCENE, through three's OWN output transform with its REAL alpha — `renderOutput` un-premultiplies, tone-maps,
    // encodes and premultiplies again (`RenderOutputNode.js:108–138`), exactly as the renderer's plain output pass does. The
    // glow is added to the STRAIGHT colour (b·a in premultiplied terms), so an opaque pixel reads encode(c + b)
    const S = renderOutput(vec4(colour.rgb.add(b.mul(a)), a), toneMapping, colorSpace);
    // THE GLOW where the scene is not opaque: encoded as light on its own, laid OVER the scene; its alpha its brightest
    // encoded channel ([B1])
    const G = renderOutput(vec4(b, 1), toneMapping, colorSpace).rgb;
    const rest = a.oneMinus();
    const rgb = S.rgb.add(G.mul(rest));
    const alpha = a.add(max(G.r, max(G.g, G.b)).mul(rest)).clamp(0, 1);
    pipeline.outputNode = vec4(vec3(rgb), alpha);
    pipeline.needsUpdate = true;
    builtFor = { toneMapping, colorSpace };
  };

  return {
    render(cam) {
      // ⛔ A THROW MUST NOT LEAVE THE RENDERER CHANGED (the Architect's build review, 9 November 2026): neither
      // `PassNode.updateBefore` (`PassNode.js:837–867`) nor `RenderPipeline.render` (`RenderPipeline.js:129–147`) restores
      // its state in a `finally` — a throw mid-render would leave the renderer on the pass's target and MRT, or at
      // NoToneMapping in linear, and the bench's plain fallback would draw wrongly for the session. So the state is taken
      // here and PUT BACK before the error goes on to the bench (which then draws plain)
      const before = {
        target: r.getRenderTarget(),
        mrt: r.getMRT(),
        toneMapping: r.toneMapping,
        colorSpace: r.outputColorSpace,
        autoClear: r.autoClear,
        xr: r.xr.enabled,
      };
      try {
        if (!builtFor || builtFor.toneMapping !== r.toneMapping || builtFor.colorSpace !== r.outputColorSpace) build();
        scenePass.camera = cam;
        pipeline.render();
      } catch (e) {
        r.setRenderTarget(before.target);
        r.setMRT(before.mrt);
        r.toneMapping = before.toneMapping;
        r.outputColorSpace = before.colorSpace;
        r.autoClear = before.autoClear;
        r.xr.enabled = before.xr;
        throw e;
      }
    },
    dispose() {
      pipeline.dispose();
      scenePass.dispose();
      glow.dispose();
    },
    set(d) {
      if (d.strength !== undefined) glow.strength.value = d.strength;
      if (d.radius !== undefined) glow.radius.value = d.radius;
      if (d.threshold !== undefined) glow.threshold.value = d.threshold;
    },
  };
}
