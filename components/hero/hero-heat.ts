import * as THREE from "three";
import { StorageTexture, type WebGPURenderer } from "three/webgpu";
import { float, Fn, If, instanceIndex, mx_noise_float, select, smoothstep, texture, textureLoad, textureStore, uniform, uvec2, vec3, vec4 } from "three/tsl";
import type { ComputeNode, Node } from "three/webgpu";
import { precompileCompute, type PrecompileResult } from "./hero-steam";

/**
 * ⛔ THE LOGO's TEMPERATURE DURING THE WASH (16 November 2026, session 3; D-101). The structural note:
 * `live-work/structural-note-temperature-model-16-november.md`. Carl, 16 November, session 2: *"The stright lines do not look
 * natural during the wash, either through the rain or with rapid cooling."* … *"yes, but in the next session ... it will be
 * built from the Home position"*; session 3: *"Just build it. components/hero/hero-heat.ts Authorised to create and use. 1. a"*
 * (1.a: the last red finishes NATURALLY after the wash, as the metal would, not forced to the wash's end).
 *
 * WHY: the wash's colour was a pure function of the run-off front (each vertical strip of the face on its own, no memory, no
 * heat between neighbours), so strips of different run lengths flipped at different moments — the ruler lines. Real metal
 * CONDUCTS: the logo cools as an object, fastest where the water runs, and its colour boundaries are soft and wander.
 *
 * WHAT: a field over the logo's FACE (local x, y; the run-off map's grid, 2 cells per cm, the same grid as the ink), on the
 * GPU, stepped on the STORY's clock in fixed sub-steps (a frame-stepped film and live playback give the same field). It holds
 * the COLDNESS C = 1 − T (0 = red-hot as phase 1 leaves it, 1 = cold): ⛔ WebGPU zero-fills every new texture, so before
 * any step — and after a reset — the logo is exactly phase 1's red (the null control holds by construction).
 * Each sub-step, per cell of the ink:
 * - **COOLS INTO THE AIR**, everywhere, slowly (`airPerS`): the logo cools AS AN OBJECT (Carl).
 * - **COOLS FASTER WHERE WET** (`wetPerS`): "wet" is the run-off front exactly as the material computes it (`RUNOFF` in
 *   `hero-scene.ts`: the reach of the water down each streak, its ragged edge) — the water arrives where and when it did;
 *   only the colour stops following it directly. Both pull toward cold as a Newton's-law rate on what heat is left.
 * - **CONDUCTS** to its four neighbours (`diffCm2S`, the thermal diffusivity), through the ink only: a neighbour off the ink
 *   is an insulated edge (no heat crosses empty space between letters).
 * Off the ink, a cell takes the mean of its neighbours on the ink (else of all four): a halo, so the walls and bevels and
 * the texture's filtering at the silhouette read the edge's temperature.
 * PHYSICS AS THE START (values are takes): metals' diffusivity is ~1 cm²/s (aluminium 0.97, copper 1.1) — over 2 s an edge
 * softens over ~3 cm at the logo's scale. The explicit scheme is stable while `dt·D/dx² ≤ 0.25` (dx 0.5 cm: D up to 7.5 at
 * the 1/120 s sub-step).
 * The material reads it as the share cooled (`share`): `smoothstep(redBelow, blueAbove, C)` — exactly 0 at C = 0.
 * Front and back faces share the field (the metal's thickness is thin against the distances heat travels here).
 */
export type HeroHeatSettings = {
  /** the temperature drives the colour (off = the run-off front directly, as before: an A/B) */
  on: boolean;
  /** cooling into the air, everywhere (per second, on the heat left) */
  airPerS: number;
  /** cooling where the water runs (per second, on the heat left) */
  wetPerS: number;
  /** thermal diffusivity (cm²/s; metals ~1) */
  diffCm2S: number;
  /** the coldness where the red starts to go, and where it is fully platinum blue */
  redBelow: number;
  blueAbove: number;
};
export const HERO_HEAT_DEFAULTS: HeroHeatSettings = { on: true, airPerS: 0.04, wetPerS: 1.2, diffCm2S: 1, redBelow: 0.1, blueAbove: 0.8 };

/** the fixed sub-step (s), and the most sub-step PAIRS run in one frame (a long frame drops the rest) */
const SUB_S = 1 / 120;
const MAX_PAIRS = 16;

/** what the field needs of the face: the run-off map's texture and frame, its parameters, the ink on the same grid */
export type HeatFace = {
  runoffTex: THREE.Texture;
  W: number;
  H: number;
  minX: number;
  minY: number;
  sizeX: number;
  sizeY: number;
  perCm: number;
  reachCm: number;
  bandCm: number;
  ragCm: number;
  ragScale: number;
  /** the ink, `W` × `H`, 1 on the logo */
  ink: Uint8Array;
  /** the visible (front) face's local z — the material's rag noise is read there */
  faceZ: number;
};

export type HeroHeatInfo = { on: boolean; cells: [number, number]; stepped: number; pairsLastFrame: number; dropped: number; precompile: PrecompileResult | null };

export type HeroHeat = {
  settings: HeroHeatSettings;
  /** the face (once, when the run-off map arrives — BEFORE the logo's material is built: it reads `share`) */
  setFace(f: HeatFace): void;
  /** the share of a point cooled (0 red → 1 platinum blue) at the run-off map's uv; `front` = the run-off front's share (the
   *  colour as before, used when the temperature is off) */
  share(uv: Node<"vec2">, front: Node<"float">): Node<"float">;
  /** the story's delta and the wash (0–1); a wash of 0 resets the field (the story replayed, the rain again) */
  update(delta: number, wash: number): void;
  /** the GPU sub-steps owed since the last call, before the draw */
  compute(renderer: WebGPURenderer): void;
  readonly info: HeroHeatInfo | null;
  dispose(): void;
};

function storage2D(W: number, H: number, name: string): StorageTexture {
  const t = new StorageTexture(W, H);
  t.name = name;
  // rgba16float: a storage format on every device (r16float is not), and filterable for the material
  t.format = THREE.RGBAFormat;
  t.type = THREE.HalfFloatType;
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.generateMipmaps = false;
  // no mipmaps are made after the compute writes (the field is read at level 0)
  (t as unknown as { mipmapsAutoUpdate: boolean }).mipmapsAutoUpdate = false;
  return t;
}

export function createHeroHeat(wash: Node<"float">): HeroHeat {
  const settings: HeroHeatSettings = { ...HERO_HEAT_DEFAULTS };
  const u = {
    dt: uniform(SUB_S),
    air: uniform(HERO_HEAT_DEFAULTS.airPerS),
    wet: uniform(HERO_HEAT_DEFAULTS.wetPerS),
    // D / dx² (per second)
    diff: uniform(HERO_HEAT_DEFAULTS.diffCm2S * 4),
    redBelow: uniform(HERO_HEAT_DEFAULTS.redBelow),
    blueAbove: uniform(HERO_HEAT_DEFAULTS.blueAbove),
    on: uniform(1),
  };

  // a 1-texel stand-in (cold 0: red) until the face arrives; the material samples whichever is current
  const placeholder = new THREE.DataTexture(new Uint16Array(4), 1, 1, THREE.RGBAFormat, THREE.HalfFloatType);
  placeholder.needsUpdate = true;
  const field = texture(placeholder);

  type Sim = { a: StorageTexture; b: StorageTexture; inkTex: THREE.DataTexture; clear: ComputeNode; ab: ComputeNode; ba: ComputeNode; W: number; H: number };
  let sim: Sim | null = null;

  function build(f: HeatFace): Sim {
    const { W, H } = f;
    const a = storage2D(W, H, "hero heat A");
    const b = storage2D(W, H, "hero heat B");
    const inkTex = new THREE.DataTexture(f.ink, W, H, THREE.RedFormat, THREE.UnsignedByteType);
    inkTex.magFilter = THREE.NearestFilter;
    inkTex.minFilter = THREE.NearestFilter;
    inkTex.generateMipmaps = false;
    inkTex.unpackAlignment = 1;
    inkTex.needsUpdate = true;
    const count = W * H;

    const clear = Fn(() => {
      const c = uvec2(instanceIndex.mod(W), instanceIndex.div(W));
      textureStore(a, c, vec4(0)).toWriteOnly();
      textureStore(b, c, vec4(0)).toWriteOnly();
    })().compute(count);
    clear.setName("hero heat: clear");

    const stepPass = (from: StorageTexture, to: StorageTexture, name: string) => {
      const pass = Fn(() => {
        const ix = instanceIndex.mod(W);
        const iy = instanceIndex.div(W);
        const c = uvec2(ix, iy);
        const C = textureLoad(from, c).r;
        // ⚠ the ink holds 1 (not 255) on the logo: as an 8-bit normalised texture it reads 1/255 — so the test is "> half
        // of that" (16 November 2026: a "> 0.5" found NO ink, every cell was halo, and the field never left 0 — measured)
        const inkAt = (x: Node<"uint">, y: Node<"uint">) => textureLoad(inkTex, uvec2(x, y)).r.greaterThan(0.5 / 255);
        // the four neighbours, clamped to the grid (the grid's border is off the ink: a 1 cm margin)
        const xl = select(ix.greaterThan(0), ix.sub(1), ix);
        const xr = select(ix.lessThan(W - 1), ix.add(1), ix);
        const yd = select(iy.greaterThan(0), iy.sub(1), iy);
        const yu = select(iy.lessThan(H - 1), iy.add(1), iy);
        const n = [
          [xl, iy],
          [xr, iy],
          [ix, yd],
          [ix, yu],
        ] as const;
        const out = C.toVar();
        If(inkAt(ix, iy), () => {
          // CONDUCTION through the ink (an off-ink neighbour is an insulated edge: it counts as this cell)
          const lap = float(0).toVar();
          for (const [x, y] of n) lap.addAssign(select(inkAt(x, y), textureLoad(from, uvec2(x, y)).r, C).sub(C));
          // WET: the run-off front, as the material computes it (`RUNOFF`, `hero-scene.ts`)
          const run = textureLoad(f.runoffTex, c);
          const px = float(ix).add(0.5).div(W).mul(f.sizeX).add(f.minX);
          const py = float(iy).add(0.5).div(H).mul(f.sizeY).add(f.minY);
          const rag = mx_noise_float(vec3(px, py, f.faceZ).mul(f.ragScale)).mul(0.5).add(0.5).clamp(0, 1).mul(f.ragCm);
          const reach = wash.mul(f.reachCm).mul(run.g);
          const wetShare = smoothstep(0, f.bandCm, reach.sub(run.r).sub(rag));
          // COOLING (air everywhere, faster where wet) on the heat left, plus conduction
          const rate = u.air.add(u.wet.mul(wetShare));
          out.assign(C.add(u.dt.mul(rate.mul(float(1).sub(C)).add(u.diff.mul(lap)))).clamp(0, 1));
        }).Else(() => {
          // THE HALO: the mean of the neighbours on the ink, else of all four
          const sumInk = float(0).toVar();
          const nInk = float(0).toVar();
          const sumAll = float(0).toVar();
          for (const [x, y] of n) {
            const v = textureLoad(from, uvec2(x, y)).r;
            const k = select(inkAt(x, y), float(1), float(0));
            sumInk.addAssign(v.mul(k));
            nInk.addAssign(k);
            sumAll.addAssign(v);
          }
          out.assign(select(nInk.greaterThan(0), sumInk.div(nInk.max(1)), sumAll.mul(0.25)));
        });
        textureStore(to, c, vec4(out, 0, 0, 1)).toWriteOnly();
      })().compute(count);
      pass.setName(name);
      return pass;
    };
    const ab = stepPass(a, b, "hero heat: step A→B");
    const ba = stepPass(b, a, "hero heat: step B→A");
    return { a, b, inkTex, clear, ab, ba, W, H };
  }

  // THE CLOCK: sub-step pairs owed (each pair ends in A, the texture the material samples)
  let owed = 0;
  let acc = 0;
  let needsClear = false;
  let dirty = false;
  let stepped = 0;
  let pairsLastFrame = 0;
  let dropped = 0;
  let warmed = false;
  let precompiling: Promise<unknown> | null = null;
  let precompile: PrecompileResult | null = null;

  return {
    settings,
    setFace(f) {
      if (sim) return;
      sim = build(f);
      field.value = sim.a;
    },
    share(uvNode, front) {
      const C = field.sample(uvNode).r;
      return select(u.on.greaterThan(0.5), smoothstep(u.redBelow, u.blueAbove, C), front);
    },
    update(delta, w) {
      const s = settings;
      u.air.value = s.airPerS;
      u.wet.value = s.wetPerS;
      u.diff.value = s.diffCm2S * 4;
      u.redBelow.value = s.redBelow;
      u.blueAbove.value = Math.max(s.redBelow + 1e-3, s.blueAbove);
      u.on.value = s.on ? 1 : 0;
      // no wash: the field is phase 1's red (a reset once, after any stepping)
      if (!(w > 0)) {
        if (dirty) needsClear = true;
        dirty = false;
        owed = 0;
        acc = 0;
        return;
      }
      acc += delta;
      const pairs = Math.floor(acc / (2 * SUB_S));
      acc -= pairs * 2 * SUB_S;
      owed += pairs;
    },
    compute(renderer) {
      if (!sim) return;
      if (!precompile) {
        if (!precompiling) precompiling = precompileCompute(renderer, [sim.clear, sim.ab, sim.ba]).then((r) => (precompile = r));
        return;
      }
      // THE WARM-UP: each program run once with no time passing (nothing changes), then cleared — not first built at the rain
      if (!warmed) {
        warmed = true;
        u.dt.value = 0;
        renderer.compute(sim.ab);
        renderer.compute(sim.ba);
        u.dt.value = SUB_S;
        needsClear = true;
      }
      if (needsClear) {
        renderer.compute(sim.clear);
        needsClear = false;
      }
      const pairs = Math.min(owed, MAX_PAIRS);
      dropped += owed - pairs;
      owed = 0;
      pairsLastFrame = pairs;
      for (let k = 0; k < pairs; k++) {
        renderer.compute(sim.ab);
        renderer.compute(sim.ba);
      }
      if (pairs > 0) {
        dirty = true;
        stepped += 2 * pairs;
      }
    },
    get info() {
      if (!sim) return null;
      return { on: settings.on, cells: [sim.W, sim.H] as [number, number], stepped, pairsLastFrame, dropped, precompile };
    },
    dispose() {
      placeholder.dispose();
      sim?.a.dispose();
      sim?.b.dispose();
      sim?.inkTex.dispose();
    },
  };
}
