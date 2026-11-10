"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, type GLProps } from "@react-three/fiber";
import * as THREE from "three";
import { Line2NodeMaterial, MeshBasicNodeMaterial, PMREMGenerator, WebGPURenderer } from "three/webgpu";
import { abs, distance, Discard, float, Fn, fract, fwidth, If, min, mix, modelWorldMatrix, positionGeometry, pow, uniform, varying, vec4 } from "three/tsl";
import { Line2 } from "three/examples/jsm/lines/webgpu/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import type { AsyncCompileHandle, BenchMedium, GridProps, LineProps } from "./bench-medium";
import { useDisposeOnUnmount } from "@/lib/use-dispose-on-unmount";

/**
 * ⛔ THE BENCH's WebGPU MEDIUM — the NEW column of the renderer note v1.6 §3 (5 November 2026; APPROVED; D-101). Loaded ONLY
 * by `loadMedium("webgpu")` (`bench-medium.ts`), a dynamic `import()` awaited before the canvas mounts — the WebGL medium
 * never downloads this file or `three/webgpu`. Each part is the twin of a WebGL part the bench already had:
 * - THE RENDERER: `WebGPURenderer` through R3F's async `gl`; ⛔ a failed `init()` is CAUGHT HERE (R3F awaits it un-caught —
 *   note §2), and `onDeviceLost` (which ALSO fires when the WebGL 2 fallback loses its context; a normal unmount's
 *   `'destroyed'` is ignored) — both to the bench's "cannot draw". `&forcewebgl=1`: the WebGL 2 fallback, on purpose.
 * - THE GRID: drei's `Grid` shader rewritten in TSL, line for line (`@react-three/drei` 10.7.7, `core/Grid.js`) — the same
 *   props, the same fade (its centre a node uniform, set per draw through the seam).
 * - THE LINES: three's WebGPU `Line2` + `Line2NodeMaterial`, fed as drei's `Line` feeds its GLSL one.
 * - THE COST METER: timestamp queries (`trackTimestamp`, dev only) where the adapter has `timestamp-query`; CPU time always.
 * - THE ARCH's TWINS (provided through `ArchMediumContext`): the studio prefiltered by `three/webgpu`'s `PMREMGenerator`
 *   (public API, after `init()`), and the compile wait on `compileAsync` with a CANCELLED flag. ⛔ REMOVED 9 November 2026
 *   with the arch (the workshop note v2.1 step 1).
 * - ⛔ THE BRASS's `anisotropyRotation` π/2 RE-DERIVED FROM THE TSL CODE (note §3's last row; 5 November 2026, three r185),
 *   not taken from the image: (1) the anisotropy VECTOR is the same uniform, anisotropy × (cos, sin) of the rotation
 *   (`MaterialNode.js:797`); (2) B is mapped the same — `anisotropyB = TBN[1]·x − TBN[0]·y` (`MeshPhysicalNodeMaterial.js:440`;
 *   GLSL `lights_physical_fragment.glsl.js:158`); (3) the IBL BENDS THE NORMAL by the same formula — cross(B, v), crossed
 *   with B, mixed toward the normal by (1 − a(1 − r))⁴ (`AccessorsUtils.js:43–49`, used by `EnvironmentNode.js:77`; GLSL
 *   `envmap_physical_pars_fragment.glsl.js:52–56`), v from the surface to the camera in both; (4) the letters carry NO
 *   tangent attribute, and both paths build the tangent from the UV derivatives (`TangentUtils.js`; GLSL `getTangentFrame`,
 *   the same reference). B's sign cancels in the double cross, so only its AXIS matters, and the axis is the same: π/2 gives
 *   the same vertical streaks. Seen: the arch's letters differ from the WebGL medium's by a mean of 1 level (50.9 / 51.9 on
 *   the C) — the frame's tone mapping, not the brushing. `lettering-material.ts`'s comment (GLSL lines) stays true.
 * ⚠ TONE MAPPING: `WebGPURenderer` tone-maps the WHOLE frame once; a material's `toneMapped = false` is not honoured (the
 * spike's finding) — the route was put to Carl, unanswered; the renderer's own behaviour stands meanwhile.
 */

type GpuR = InstanceType<typeof WebGPURenderer>;
type GlDefaults = Parameters<Extract<GLProps, (p: never) => Promise<unknown>>>[0];

// ⛔ `useDisposeOnUnmount` (dispose on a REAL unmount only — StrictMode's cleanup cancelled) lives in `hero-page.tsx`,
// shared with the hero's 3D text (moved there 6 November 2026, session 2, when the street and `hero-blockout.tsx` were
// removed; first written 5 November for the block-out's batched stones; not in the seam, which imports drei)

// ── THE RENDERER ────────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * ⛔ ONE RENDERER PER CANVAS (found 5 November 2026, the first WebGPU capture of the arch: 167 GPU validation errors, the
 * picture black). R3F's `configure` checks `if (!state.gl)` and THEN awaits an async `gl`; React's StrictMode (dev) mounts
 * the canvas, unmounts and remounts it, so `configure` runs TWICE before either await returns — both see no renderer and
 * each made its OWN `WebGPURenderer` (the adapter requested twice, in the log). The one that never received the canvas's
 * size kept drawing with a 300 × 150 depth buffer against the 1859 × 733 picture. Here the start is kept PER CANVAS:
 * every call for the same canvas gets the SAME renderer. (The WebGL medium never had this: R3F's default `gl` is
 * synchronous, and two `WebGLRenderer`s on one canvas share its one context.)
 * ⚠ NOT HANDLED: R3F's unmount calls `forceContextLoss` (WebGL's), which `WebGPURenderer` lacks — a truly unmounted bench's
 * renderer is not disposed (its device stays until the page goes). The bench lives for the page's life today.
 */
const started = new WeakMap<HTMLCanvasElement, Promise<GpuR>>();
function startRenderer(canvas: HTMLCanvasElement, powerPreference: GlDefaults["powerPreference"]): Promise<GpuR> {
  let p = started.get(canvas);
  if (!p) {
    const r = new WebGPURenderer({
      canvas,
      // WebGL's "default" has no WebGPU twin — left to the browser then
      powerPreference: powerPreference === "default" ? undefined : powerPreference,
      antialias: true,
      alpha: true,
      forceWebGL: new URLSearchParams(window.location.search).has("forcewebgl"),
      // ⚠ DEV ONLY: the cost meter's GPU time — the pool is drained every frame (`meter`), harness or not
      trackTimestamp: process.env.NODE_ENV !== "production",
    });
    p = r.init().then(() => {
      installAsyncCompile(r);
      return r;
    });
    started.set(canvas, p);
  }
  return p;
}

const makeGl: BenchMedium["makeGl"] = (fail, onBackend) => async (props: GlDefaults) => {
  try {
    const r = await startRenderer(props.canvas as HTMLCanvasElement, props.powerPreference);
    onBackend((r.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend ? "webgpu" : "webgl2");
    r.onDeviceLost = (info: { reason?: string | null; message?: string }) => {
      if (info?.reason === "destroyed") return;
      fail(`the GPU device was lost: ${info?.message ?? "no reason given"}`);
    };
    return r;
  } catch (e) {
    fail(`the WebGPU renderer did not start: ${String(e)}`);
    return new Promise<never>(() => {});
  }
};

// ── THE ASYNC COMPILE ──────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * ⛔ A MATERIAL's PIPELINE BUILT ASYNCHRONOUSLY IN THE REAL DRAW (10 November 2026, session 2;
 * `live-work/structural-note-liquid-async-compile-10-november.md` v1.4, through four Architect reviews;
 * `live-work/plan-liquid-async-compile-10-november.md` v1.2, APPROVED by Carl). MEASURED first
 * (`live-work/liquid-stall-split-10-november.md`): the liquid's first draw held the page ~3 s, the main thread WAITING for
 * 99.6 % of it — the GPU compile of a pipeline three r185 builds SYNCHRONOUSLY on first draw.
 * - ONE WRAPPER PER RENDERER, installed here after `init()`, on the INSTANCE's `renderer._pipelines.getForRender` — ⚠ a
 *   PRIVATE part of three 0.185.1. It relies on: `getForRender(renderObject, promises)` (`Pipelines.js:160`; a promise
 *   list sends the build to `createRenderPipelineAsync`, `WebGPUPipelineUtils.js:292`; the WebGL 2 fallback's
 *   `KHR_parallel_shader_compile` poll, `WebGLBackend.js:1520–1546`); `isReady` (`Pipelines.js:255`; the draw SKIPS an
 *   object whose pipeline is still compiling, `Renderer.js:3725`); the backend's `error` (`WebGPUPipelineUtils.js:316–333`,
 *   a failed compile still RESOLVES); `renderObject.onDispose` (`RenderObjects.js:203`, called by `dispose()`,
 *   `RenderObject.js:969`). An upgrade of three must re-check every one.
 * - Only for a REGISTERED material (`asyncCompile`); every other material keeps three's default.
 * - READINESS from the RENDER OBJECTS the wrapper has SEEN (not promises: none is made on a cache hit,
 *   `Pipelines.js:218–228`): `ready` = at least one seen, every one `isReady`, none with an error; any error → `failed`.
 *   A seen render object leaves the set when three DISPOSES it (its `onDispose` chained once; the hook looks up the
 *   material's registration AT DISPOSE TIME, so a re-registration cannot keep a dead one).
 * - THE WINDOW: async only until the state first reads `ready`; later builds stall as three's default (a new render
 *   CONTEXT is a new render object, `RenderContexts.js:53–67`: per-object async would make the liquid blink mid-shot).
 * - PER REGISTRATION: a new registration replaces the old (the window reopens, the seen set is fresh); `dispose()` removes
 *   only its own — React's StrictMode double mount cannot stack or cross them.
 * - ⚠ An error scope stays open for the whole async compile (`WebGPUPipelineUtils.js:253` → `:316`): another draw's
 *   validation error in that window lands in this one's — accepted (note v1.4), the owner's failure branch the guard.
 * - ⚠ The WebGL 2 fallback reads a failed link as ready (`WebGLBackend.js:1670–1694`): no worse than today.
 */
type RenderObjectLike = { id: number; material: THREE.Material; onDispose: (() => void) | null };
type PipelinesLike = {
  getForRender(ro: RenderObjectLike, promises?: unknown[] | null): unknown;
  isReady(ro: RenderObjectLike): boolean;
  get(ro: RenderObjectLike): { pipeline?: object };
};
type BackendLike = { get(o: object): { error?: boolean } };
type Forced = null | { kind: "fail" } | { kind: "delay"; ms: number; since: number | null };
type Registration = { open: boolean; seen: Set<RenderObjectLike>; forced: Forced };
const registries = new WeakMap<object, Map<THREE.Material, Registration>>();
const hookedDispose = new WeakSet<RenderObjectLike>();
const privates = (r: GpuR) => r as unknown as { _pipelines: PipelinesLike; backend: BackendLike };

function installAsyncCompile(r: GpuR) {
  if (registries.has(r)) return;
  const map = new Map<THREE.Material, Registration>();
  registries.set(r, map);
  const pipes = privates(r)._pipelines;
  const original = pipes.getForRender.bind(pipes);
  pipes.getForRender = (ro, promises = null) => {
    const g = map.get(ro.material);
    if (g) {
      g.seen.add(ro);
      if (!hookedDispose.has(ro)) {
        hookedDispose.add(ro);
        const before = ro.onDispose;
        ro.onDispose = () => {
          map.get(ro.material)?.seen.delete(ro);
          before?.();
        };
      }
      if (g.open && promises === null) return original(ro, []);
    }
    return original(ro, promises);
  };
}

const asyncCompile = (gl: unknown, material: THREE.Material): AsyncCompileHandle => {
  const r = gl as GpuR;
  installAsyncCompile(r);
  const map = registries.get(r)!;
  const { _pipelines: pipes, backend } = privates(r);
  const g: Registration = { open: true, seen: new Set(), forced: null };
  map.set(material, g);
  const real = (): "pending" | "ready" | "failed" => {
    if (g.seen.size === 0) return "pending";
    let all = true;
    for (const ro of g.seen) {
      const pl = pipes.get(ro).pipeline;
      if (pl && backend.get(pl).error) return "failed";
      if (!pipes.isReady(ro)) all = false;
    }
    if (all) g.open = false;
    return all ? "ready" : "pending";
  };
  return {
    state() {
      const f = g.forced;
      if (f?.kind === "fail") return "failed";
      const s = real();
      // the forced delay counts from the HOLD's start, so a hold always happens (the plan v1.2, check 6)
      if (f?.kind === "delay" && s === "ready" && (f.since === null || performance.now() - f.since < f.ms)) return "pending";
      return s;
    },
    holding() {
      if (g.forced?.kind === "delay" && g.forced.since === null) g.forced.since = performance.now();
    },
    force(kind, ms = 0) {
      if (process.env.NODE_ENV === "production") return;
      g.forced = kind === "fail" ? { kind } : { kind, ms, since: null };
    },
    seenIds: () => [...g.seen].map((ro) => ro.id),
    dispose() {
      if (map.get(material) === g) map.delete(material);
    },
  };
};

// ── THE GRID (drei's, in TSL) ──────────────────────────────────────────────────────────────────────────────────────────

type GridU = ReturnType<typeof gridUniforms>;
const gridUniforms = () => ({
  cellSize: uniform(0.5),
  sectionSize: uniform(1),
  cellThickness: uniform(0.5),
  sectionThickness: uniform(1),
  cellColor: uniform(new THREE.Color()),
  sectionColor: uniform(new THREE.Color()),
  fadeDistance: uniform(100),
  fadeStrength: uniform(1),
  /** drei's vertex stretch: `1 + fadeDistance` for an infinite grid, else 1 */
  stretch: uniform(1),
  /** drei's `worldCamProjPosition` — the point the fade is measured from (`fadeFrom` 1) */
  camProj: uniform(new THREE.Vector3()),
});
function gridMaterial(u: GridU): InstanceType<typeof MeshBasicNodeMaterial> {
  const m = new MeshBasicNodeMaterial({ transparent: true });
  // vertex: localPosition = position.xzy (× the stretch); worldPosition = modelMatrix × localPosition
  const local = positionGeometry.xzy.mul(u.stretch);
  m.positionNode = local;
  const vLocal = varying(local);
  const vWorld = varying(modelWorldMatrix.mul(vec4(local, 1)).xyz);
  // fragment: drei's getGrid, the fade, the colour, the alpha — line for line
  const getGrid = (size: typeof u.cellSize, thickness: typeof u.cellThickness) => {
    const r = vLocal.xz.div(size);
    const g = abs(fract(r.sub(0.5)).sub(0.5)).div(fwidth(r));
    const line = min(g.x, g.y).add(1).sub(thickness);
    return float(1).sub(min(line, 1));
  };
  const g1 = getGrid(u.cellSize, u.cellThickness);
  const g2 = getGrid(u.sectionSize, u.sectionThickness);
  const d = float(1).sub(min(distance(u.camProj, vWorld).div(u.fadeDistance), 1));
  m.colorNode = mix(u.cellColor, u.sectionColor, min(1, u.sectionThickness.mul(g2)));
  const a0 = g1.add(g2).mul(pow(d, u.fadeStrength));
  const a = mix(a0.mul(0.75), a0, g2);
  m.opacityNode = Fn(() => {
    If(a.lessThanEqual(0), () => {
      Discard();
    });
    return a;
  })();
  return m;
}
const GRID_KEY = "benchGridUniforms";
/** the props into the uniforms (as R3F's props reach drei's uniforms); colours through `Color.set` — sRGB in, linear held.
 *  A plain function (the project's pattern, as `applyBrushedMetal`): three objects are mutable by design */
function applyGrid(u: GridU, material: THREE.Material, mesh: THREE.Mesh | null, p: Omit<GridProps, "position" | "args">) {
  u.cellSize.value = p.cellSize;
  u.sectionSize.value = p.sectionSize;
  u.cellThickness.value = p.cellThickness;
  u.sectionThickness.value = p.sectionThickness;
  u.cellColor.value.set(p.cellColor);
  u.sectionColor.value.set(p.sectionColor);
  u.fadeDistance.value = p.fadeDistance;
  u.fadeStrength.value = p.fadeStrength;
  u.stretch.value = p.infiniteGrid ? 1 + p.fadeDistance : 1;
  material.side = p.side;
  if (mesh) mesh.userData[GRID_KEY] = u;
}
/** drei's own frame callback: the fade from the default camera's floor point (the bench overrides it per draw) */
function fadeFromCamera(u: GridU, g: THREE.Mesh, plane: THREE.Plane, camera: THREE.Camera) {
  plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3()).applyMatrix4(g.matrixWorld);
  plane.projectPoint(camera.position, u.camProj.value);
}
const GridWebGPU = forwardRef<THREE.Mesh, GridProps>(function GridWebGPU(
  { position, args, infiniteGrid = false, cellSize, sectionSize, cellThickness, sectionThickness, cellColor, sectionColor, fadeDistance, fadeStrength, side },
  ref,
) {
  const mesh = useRef<THREE.Mesh>(null);
  useImperativeHandle(ref, () => mesh.current!, []);
  const [u] = useState(gridUniforms);
  const material = useMemo(() => gridMaterial(u), [u]);
  useDisposeOnUnmount(material);
  useLayoutEffect(() => {
    applyGrid(u, material, mesh.current, { infiniteGrid, cellSize, sectionSize, cellThickness, sectionThickness, cellColor, sectionColor, fadeDistance, fadeStrength, side });
  }, [u, material, cellSize, sectionSize, cellThickness, sectionThickness, cellColor, sectionColor, fadeDistance, fadeStrength, infiniteGrid, side]);
  const [plane] = useState(() => new THREE.Plane());
  useFrame((st) => {
    if (mesh.current) fadeFromCamera(u, mesh.current, plane, st.camera);
  });
  return (
    <mesh ref={mesh} position={position} frustumCulled={false} material={material}>
      <planeGeometry args={args} />
    </mesh>
  );
});
const gridU = (g: THREE.Mesh) => g.userData[GRID_KEY] as GridU | undefined;

// ── THE LINES (drei's `Line`, on three's WebGPU `Line2`) ───────────────────────────────────────────────────────────────

/** the line's geometry and material set from its props — a plain function, as `applyGrid` */
function applyLine(line: InstanceType<typeof Line2>, geometry: LineGeometry, p: Pick<LineProps, "color" | "vertexColors" | "lineWidth" | "transparent" | "opacity">) {
  line.geometry = geometry;
  line.computeLineDistances();
  const m = line.material as InstanceType<typeof Line2NodeMaterial>;
  // with vertex colours the colour must be white (drei, #1813)
  m.color.set(p.vertexColors ? 0xffffff : (p.color ?? 0xffffff));
  m.vertexColors = !!p.vertexColors;
  m.linewidth = p.lineWidth;
  m.transparent = !!p.transparent;
  m.opacity = p.opacity ?? 1;
  m.needsUpdate = true;
}
function LineWebGPU({ points, color = 0xffffff, vertexColors, lineWidth, transparent, opacity = 1 }: LineProps) {
  const [line] = useState(() => new Line2(new LineGeometry(), new Line2NodeMaterial()));
  const geometry = useMemo(() => {
    const g = new LineGeometry();
    g.setPositions(points.flat());
    if (vertexColors) g.setColors(vertexColors.flat());
    return g;
  }, [points, vertexColors]);
  useLayoutEffect(() => {
    applyLine(line, geometry, { color, vertexColors, lineWidth, transparent, opacity });
  }, [line, geometry, color, vertexColors, lineWidth, transparent, opacity]);
  useDisposeOnUnmount(geometry);
  useDisposeOnUnmount(line.material as THREE.Material);
  return <primitive object={line} />;
}

// ── THE COST METER ─────────────────────────────────────────────────────────────────────────────────────────────────────

/** frames drawn since the last resolve, per renderer — the pool SUMS every query since its last resolve, so a resolve that
 *  covers several frames is divided by their count (⚠ an average over those frames, said in the cost harness's output) */
const sinceResolve = new WeakMap<object, { frames: number; busy: boolean }>();
const meter: BenchMedium["meter"] = (gl, cost, draw) => {
  const r = gl as GpuR;
  const t0 = performance.now();
  draw();
  const backend = r.backend as { trackTimestamp?: boolean; isWebGPUBackend?: boolean; device?: { adapterInfo?: { vendor?: string; architecture?: string; description?: string } } };
  if (cost) {
    cost.cpu.push(performance.now() - t0);
    if (cost.renderer === undefined) {
      const a = backend.device?.adapterInfo;
      cost.renderer = backend.isWebGPUBackend ? `WebGPU: ${[a?.vendor, a?.architecture, a?.description].filter(Boolean).join(" ") || "unknown adapter"}` : "WebGPU medium on its WebGL 2 fallback";
      cost.ext = !!backend.trackTimestamp;
    }
  }
  if (!backend.trackTimestamp) return;
  const s = sinceResolve.get(r) ?? { frames: 0, busy: false };
  sinceResolve.set(r, s);
  s.frames++;
  if (s.busy) return;
  s.busy = true;
  const frames = s.frames;
  s.frames = 0;
  r.resolveTimestampsAsync("render")
    .then((ms) => {
      if (cost && typeof ms === "number" && ms > 0) cost.gpu.push(ms / frames);
    })
    .catch(() => {})
    .finally(() => {
      s.busy = false;
    });
};

// ── THE ARCH's TWINS — REMOVED (9 November 2026, session 2; the workshop note v2.1 step 1): the studio prefiltered for the
// arch (`WebGPUEnvironment`) and its compile wait (`compileAsync` with a cancelled flag) went with the arch. Film 4's page
// keeps the WebGL versions (`arch-medium.tsx`).

// ── THE MEDIUM ─────────────────────────────────────────────────────────────────────────────────────────────────────────

export const WEBGPU_MEDIUM: BenchMedium = {
  name: "webgpu",
  pmrem: (gl) => new PMREMGenerator(gl as GpuR),
  makeGl,
  // the failure watch lives in `makeGl` (`init()` caught, `onDeviceLost`) — nothing to add on the live renderer
  watch: () => {},
  Grid: GridWebGPU,
  setGridFade: (grid, point) => {
    const u = gridU(grid);
    if (!u) return false;
    u.camProj.value.copy(point);
    return true;
  },
  setGridThickness: (grid, t) => {
    const u = gridU(grid);
    if (!u) return;
    u.cellThickness.value = t;
    u.sectionThickness.value = t;
  },
  Line: LineWebGPU,
  meter,
  pipY: (_height, top) => top,
  asyncCompile,
  // (the hero's acrylic and glow moved to the hero's own WebGPU part, `hero-idea-webgpu.tsx` — 9 November 2026, session 2)
};
