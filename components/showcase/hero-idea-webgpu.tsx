import type * as THREE from "three";
import type { BenchPost, IdeaMediumPart } from "./bench-ideas";
import { makeHeroBloom, type HeroBloom } from "./hero-bloom";
import { heroTextMaterial } from "./hero-text-material";

/**
 * ⛔ THE HERO's WebGPU PART (9 November 2026, session 2; the workshop note v2.3, STEP 3, the review's [R10-5]): the text's
 * EDGE-LIT ACRYLIC (`hero-text-material.ts`, route B) and its GLOW (`hero-bloom.ts`, the bloom note v1.3, APPROVED) —
 * moved out of the bench's WebGPU medium, which is a TOOL. Loaded ONLY in the WebGPU medium (`bench-ideas.ts`'s
 * `byMedium.webgpu`), so the WebGL bench never downloads TSL or `three/webgpu`.
 * ⛔ THE DEV HOOKS STAY HERO-NAMED, here ([R10-6]): `__heroBloom` (the kept instance — a harness sets its dials) and
 * `__heroBloomOff` (draw plain — the identity check's "without"). `hero-bloom-measure-9-november.mjs` reads both.
 */
type HeroDevHooks = { __heroBloom?: HeroBloom | null; __heroBloomOff?: boolean };

function heroPost(renderer: unknown, scene: THREE.Scene, camera: THREE.Camera): BenchPost {
  const bloom = makeHeroBloom(renderer, scene, camera);
  const dev = process.env.NODE_ENV !== "production" ? (window as unknown as HeroDevHooks) : null;
  return {
    render(cam) {
      // the identity check's "without": the plain draw, exactly as the bench's own (`gl.render(scene, cam)`)
      if (dev?.__heroBloomOff) {
        (renderer as { render(s: THREE.Scene, c: THREE.Camera): void }).render(scene, cam);
        return;
      }
      bloom.render(cam);
    },
    dispose() {
      if (dev && dev.__heroBloom === bloom) dev.__heroBloom = null;
      bloom.dispose();
    },
    // the hook names the instance the bench KEPT (StrictMode makes and drops one in development)
    attach() {
      if (dev) dev.__heroBloom = bloom;
    },
  };
}

export const HERO_WEBGPU: IdeaMediumPart = { post: heroPost, materials: { heroText: heroTextMaterial } };
