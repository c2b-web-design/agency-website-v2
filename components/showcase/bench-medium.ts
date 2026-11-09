import type { ComponentType, ForwardRefExoticComponent, RefAttributes } from "react";
import type { GLProps } from "@react-three/fiber";
import { Grid as DreiGrid, Line as DreiLine } from "@react-three/drei";
import type * as THREE from "three";
import { PMREMGenerator } from "three";

/**
 * ⛔ THE BENCH's SEAM — the camera bench in TWO MEDIA (5 November 2026; the renderer note
 * `live-work/structural-note-renderer-webgpu-5-november.md` v1.6 §3, APPROVED — Carl: *"Approved and proceed"*; D-101).
 * The bench is ONE bench — one recorder, pad, timeline, PiP — in either medium, chosen by the URL (`?medium=webgpu`; absent =
 * WebGL, so today's links, takes and harnesses stay WebGL). ONLY the parts that speak a renderer's language exist twice, and
 * the bench reaches them ONLY through a `BenchMedium`:
 *   the RENDERER (R3F's `gl`) with its FAILURE watch · the floor GRID and its per-draw FADE / THICKNESS · the path LINES ·
 *   the COST meter (harness-only) · the PiP's VIEWPORT ORIGIN. (Was also: the ARCH's environment and compile wait, WebGPU
 *   only — REMOVED 9 November 2026 with the arch, the workshop note v2.1 step 1; film 4's page keeps its own, the
 *   `ArchMediumContext` default beside `LetteringPiece`.)
 * This file holds the interface, the WebGL versions (TODAY's code, moved here unchanged in behaviour) and the loader.
 * ⛔ THE WebGPU HALF (`bench-medium-webgpu.tsx`) LOADS ONLY WHEN CHOSEN — a dynamic `import()`, awaited OUTSIDE the canvas
 * before it mounts (note §4): the WebGL medium never downloads `three/webgpu`.
 * The anisotropy accessor (`maxAnisotropy`, `hero-page.tsx` since 6 November 2026; first in `hero-blockout.tsx`, removed
 * with the street) serves both media from one helper and is not here.
 */
export type MediumName = "webgl" | "webgpu";

/** the floor grid's props — the subset of drei's `Grid` the bench uses; each medium's grid takes exactly these */
export type GridProps = {
  position: [number, number, number];
  args?: [number, number];
  infiniteGrid?: boolean;
  cellSize: number;
  sectionSize: number;
  cellThickness: number;
  sectionThickness: number;
  cellColor: string;
  sectionColor: string;
  fadeDistance: number;
  fadeStrength: number;
  side: THREE.Side;
};
/** a path line's props — the subset of drei's `Line` the bench uses */
export type LineProps = {
  points: [number, number, number][];
  color?: THREE.ColorRepresentation;
  vertexColors?: [number, number, number][];
  lineWidth: number;
  toneMapped?: boolean;
  transparent?: boolean;
  opacity?: number;
};

/** ⚠ HARNESS-ONLY, DEV-ONLY: the cost instrument's record (`window.__benchCost`, set by the cost harness) */
export type BenchCost = { renderer?: string; ext?: boolean; cpu: number[]; gpu: number[]; disjoint: number; pending: WebGLQuery[] };

export type BenchMedium = {
  name: MediumName;
  /** R3F's `gl` for this medium — `fail` is called with a reason if the renderer cannot start; `onBackend` names what drew */
  makeGl: (fail: (why: string) => void, onBackend: (name: string) => void) => GLProps;
  /** called in the canvas's `onCreated`: the medium's failure watch on the live renderer */
  watch: (gl: unknown, fail: (why: string) => void) => void;
  Grid: ForwardRefExoticComponent<GridProps & RefAttributes<THREE.Mesh>>;
  /** ⛔ ONE call sets either grid's FADE centre for the NEXT draw (drei's `worldCamProjPosition`; note review 2, finding 4) —
   *  false if the grid has none (the bench then skips its log entry, as before) */
  setGridFade: (grid: THREE.Mesh, point: THREE.Vector3) => boolean;
  /** the 10 cm lines' thickness (cell and section alike), for the next draw */
  setGridThickness: (grid: THREE.Mesh, t: number) => void;
  Line: ComponentType<LineProps>;
  /** draw, timed when a harness asks (`cost`): CPU always, the GPU's work where the medium can measure it */
  meter: (gl: unknown, cost: BenchCost | undefined, draw: () => void) => void;
  /** the PiP's viewport and scissor Y, from the picture's height and the PiP's top and height (CSS px). ⛔ WebGL counts from
   *  the BOTTOM-LEFT; `WebGPURenderer` from the TOP-LEFT on both its backends (three r185: `WebGPUBackend.updateViewport`
   *  passes it to `setViewport` as is; `WebGLBackend.updateViewport` flips it) — read in the source 5 November 2026; both
   *  take CSS px and multiply by the pixel ratio themselves */
  pipY: (height: number, top: number, h: number) => number;
  // ⛔ (the hero text's material, `heroText`, and the hero's glow, `post`, LEFT THE MEDIUM on 9 November 2026, session 2 —
  // the workshop note v2.3, step 3: they are the HERO's, an idea's, and live in its WebGPU part, `hero-idea-webgpu.tsx`,
  // reached through `bench-ideas.ts`. The medium holds what ANY idea needs from a renderer, nothing more)
  /** ⛔ the medium's PMREM generator (9 November 2026; the hero logo's studio reflection — the button family's HDRI): WebGL's
   *  `PMREMGenerator` from `three`, WebGPU's from `three/webgpu` — each renderer prefilters with its own. The caller owns
   *  and disposes what it makes */
  pmrem: (gl: unknown) => PmremLike;
};
/** the part of either medium's `PMREMGenerator` the bench uses */
export type PmremLike = { fromEquirectangular(t: THREE.Texture): { texture: THREE.Texture; dispose(): void }; dispose(): void };


// ── THE WebGL MEDIUM — today's code, its behaviour unchanged ─────────────────────────────────────────────────────────────

type GridUniforms = { worldCamProjPosition?: { value: THREE.Vector3 }; cellThickness?: { value: number }; sectionThickness?: { value: number } };
const dreiUniforms = (g: THREE.Mesh) => (g.material as THREE.ShaderMaterial | undefined)?.uniforms as GridUniforms | undefined;

type TimerExt = { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number };
const timerExt = new WeakMap<WebGL2RenderingContext, TimerExt | null>();
/** the cost instrument's start: the renderer named once; a GPU timer query begun where the extension exists */
function costBegin(gl: THREE.WebGLRenderer, cost: BenchCost): WebGLQuery | null {
  const c = gl.getContext() as WebGL2RenderingContext;
  if (!timerExt.has(c)) timerExt.set(c, c.getExtension("EXT_disjoint_timer_query_webgl2") as TimerExt | null);
  const ext = timerExt.get(c)!;
  if (cost.renderer === undefined) {
    const info = c.getExtension("WEBGL_debug_renderer_info");
    cost.renderer = info ? String(c.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "unknown";
    cost.ext = !!ext;
  }
  if (!ext) return null;
  const q = c.createQuery();
  if (q) c.beginQuery(ext.TIME_ELAPSED_EXT, q);
  return q;
}
/** the cost instrument's end: the CPU time kept; finished GPU queries read (ms), a disjoint frame's discarded */
function costEnd(gl: THREE.WebGLRenderer, cost: BenchCost, q: WebGLQuery | null, cpuMs: number) {
  const c = gl.getContext() as WebGL2RenderingContext;
  const ext = timerExt.get(c);
  cost.cpu.push(cpuMs);
  if (!ext) return;
  if (q) {
    c.endQuery(ext.TIME_ELAPSED_EXT);
    cost.pending.push(q);
  }
  const disjoint = !!c.getParameter(ext.GPU_DISJOINT_EXT);
  while (cost.pending.length && c.getQueryParameter(cost.pending[0], c.QUERY_RESULT_AVAILABLE)) {
    const done = cost.pending.shift()!;
    if (disjoint) cost.disjoint++;
    else cost.gpu.push(Number(c.getQueryParameter(done, c.QUERY_RESULT)) / 1e6);
    c.deleteQuery(done);
  }
}

export const WEBGL_MEDIUM: BenchMedium = {
  name: "webgl",
  pmrem: (gl) => new PMREMGenerator(gl as THREE.WebGLRenderer),
  makeGl: () => ({ antialias: true, alpha: true }),
  watch: (gl, fail) => {
    (gl as THREE.WebGLRenderer).domElement.addEventListener("webglcontextlost", () => fail("the WebGL context was lost"), { once: true });
  },
  Grid: DreiGrid as unknown as BenchMedium["Grid"],
  setGridFade: (grid, point) => {
    const u = dreiUniforms(grid);
    if (!u?.worldCamProjPosition) return false;
    u.worldCamProjPosition.value.copy(point);
    return true;
  },
  setGridThickness: (grid, t) => {
    const u = dreiUniforms(grid);
    if (!u?.cellThickness || !u.sectionThickness) return;
    u.cellThickness.value = t;
    u.sectionThickness.value = t;
  },
  Line: DreiLine as unknown as BenchMedium["Line"],
  meter: (gl, cost, draw) => {
    if (!cost) return draw();
    const r = gl as THREE.WebGLRenderer;
    const t0 = performance.now();
    const q = costBegin(r, cost);
    draw();
    costEnd(r, cost, q, performance.now() - t0);
  },
  pipY: (height, top, h) => height - top - h,
};

/** the medium the URL asks for (`?medium=webgpu`); anything else, or nothing, is WebGL */
export const mediumFromUrl = (search: string): MediumName => (new URLSearchParams(search).get("medium") === "webgpu" ? "webgpu" : "webgl");

/** the medium's parts: WebGL at once; WebGPU by a dynamic `import()` — the only way the WebGPU half is ever loaded */
export function loadMedium(name: MediumName): Promise<BenchMedium> {
  if (name === "webgl") return Promise.resolve(WEBGL_MEDIUM);
  return import("./bench-medium-webgpu").then((m) => m.WEBGPU_MEDIUM);
}
