import type { ComponentType } from "react";
import type * as THREE from "three";
import type { BenchMedium, MediumName } from "./bench-medium";

/**
 * ⛔ THE IDEAS BROUGHT TO THE BENCH — the WORKSHOP's ONE SLOT (9 November 2026, session 2; the workshop note
 * `live-work/structural-note-bench-arch-removed-9-november.md` v2.3, STEP 3; the Architect's review 10). Carl: *"we need a
 * camera bench to build things with ... and to bring different things to it to build"*; *"What we build in there is
 * dependent on the idea we bring to it."* The camera bench (`camera-bench.tsx`) is a TOOL and names no idea; an idea is
 * FURNITURE, in its own files, reached ONLY through this list. ⛔ IN THE TEMPLATE THE LIST IS EMPTY (Carl: *"when a new
 * client comes along, we clone the template"*): taking the C2B site out deletes the idea's files and its line here, and
 * the bench is untouched.
 * - Chosen by the URL: `?idea=<name>`; `?blank=1` is the hero's alias (Carl's links); nothing = the EMPTY workshop.
 * - Loaded LAZILY (a dynamic `import()`, awaited OUTSIDE the canvas before it mounts, as the WebGPU medium is): the bench
 *   bundles no idea.
 * - ⛔ NO FORMULA ACROSS SCENES (Carl: *"each scene will be different ... i dont think we should apply a formuler with so
 *   mant parameters in play"*): an idea brings its HOME — where Cam 1 goes first, with what lens — and nothing that rescales
 *   a take. The chain's units stay the bench's (`BENCH_MEASURE`).
 */

/** where Cam 1 goes first, with what lens — WORKSHOP world cm (the floor y 0, the front line z 0); `fov` vertical degrees;
 *  `shift` the lens shift (a fraction of the frame); `frameAspect` the delivered frame the lens's mm is read across */
export type IdeaHome = { x: number; y: number; z: number; fov: number; shift: number; frameAspect: number };

/** an idea's effect pass, drawn by the bench INSTEAD of its plain draw: the BENCH owns the instance (makes it, calls it,
 *  catches a throw, disposes it a task late — `BenchScene`); the idea only supplies the factory */
export type BenchPost = {
  render(camera: THREE.Camera): void;
  dispose(): void;
  /** called once the bench KEEPS this instance (its effect — never in the factory: StrictMode runs a memo twice) */
  attach?(): void;
};

/** what an idea brings for ONE medium — loaded only in that medium, so a renderer's code never reaches the other's bench */
export type IdeaMediumPart = {
  post?: (renderer: unknown, scene: THREE.Scene, camera: THREE.Camera) => BenchPost;
  /** per-medium materials, by the idea's own names; a NEW material per call — the caller owns and disposes it */
  materials?: Record<string, () => THREE.Material>;
};

/** the idea's scene: its objects and lights, placed in the WORKSHOP's world. `onReady` once its content is in (the
 *  bench's "drawn" waits for it — the review's [R10-4]) */
export type IdeaSceneProps = { medium: BenchMedium; part: IdeaMediumPart | null; onReady: () => void };

export type BenchIdea = {
  name: string;
  home?: IdeaHome;
  Scene: ComponentType<IdeaSceneProps>;
  /** drawn over the picture (the overlay layer) */
  Guide?: ComponentType;
  /** the WebGPU medium's part, LAZY (the review's [R10-5]: `three/webgpu` stays out of the WebGL bench) */
  byMedium?: { webgpu?: () => Promise<IdeaMediumPart> };
};

/** ⛔ THE LIST — the ONE place ideas are named. `medium`: the idea's medium when the URL names none */
export const BENCH_IDEAS: Record<string, { medium?: MediumName; load: () => Promise<BenchIdea> }> = {
  // the hero (D-101): the 3D text, its sketch lights, the leaning logo; the page camera; WebGPU (Carl: *"WebGPU should be
  // the choice"*)
  hero: { medium: "webgpu", load: () => import("./hero-idea").then((m) => m.HERO_IDEA) },
};

/** the idea the URL asks for: `?idea=<name>`, or the hero for `?blank=1`; null = the empty workshop */
export function ideaFromUrl(search: string): string | null {
  const q = new URLSearchParams(search);
  return q.get("idea") ?? (q.has("blank") ? "hero" : null);
}
