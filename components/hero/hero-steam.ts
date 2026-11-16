import * as THREE from "three";
import { MeshBasicNodeMaterial, Storage3DTexture, type Node, type WebGPURenderer } from "three/webgpu";
import { Break, float, frameId, Fn, hash, If, instanceIndex, instancedArray, interleavedGradientNoise, Loop, max, min, mx_noise_float, cameraPosition, positionWorld, screenCoordinate, select, smoothstep, step, storageTexture, texture3D, textureStore, uniform, uvec3, vec3, vec4 } from "three/tsl";
import { snoiseVec3 } from "three/addons/tsl/math/curlNoise.js";

/**
 * ⛔ THE HERO's PHASE 2: THE STEAM (16 November 2026; D-101). Carl: *"Steam first. build it on the proto hero and we will
 * take measurements. It shouldnt run for the whole rainfall time or colour transformation. When rhe rain first fall that is
 * when it should happen, so the effect will be rather short."* On the standing ruling of 14 November: VOLUMETRIC, best
 * first, by `webgpu_volume_fire`'s method (smoke only), in a box sized to the logo, MEASURED on Carl's PC. Structure:
 * `live-work/structural-note-hero-steam-16-november.md` v1.0 (Carl: *"components/hero/hero-steam.ts Authorised to create
 * and use."*).
 *
 * WHAT IS THE EXAMPLE's, KEPT (r185, read whole): the fluid on the GPU in 3D storage textures (rgba16float): semi-
 * Lagrangian advection of velocity, buoyancy (hot rises, dense sinks), a curl-noise turbulence (thermal, decaying with age,
 * and ambient), damping, a soft border; divergence → Jacobi pressure → projection; the dye (density, temperature, age)
 * advected, dissipated and cooled; emission added at points; the draw a ray march with a cheap self-shadow toward the key.
 *
 * WHAT IS OURS:
 * - **THE BOX IS THE LOGO's** (not the example's 2,000,000 cells): its footprint + `MARGIN` each side, from the floor to
 *   `MARGIN.riseCm` above its top, in cubic cells of `cellCm` (2.5 cm: 190,896 cells, measured). ONE step per frame
 *   (`SIM_DT`), not up to eight at 120 Hz.
 * - **THE LOGO IS A SOLID** (the mask, made ONCE on the CPU from the ink raster × the extrusion's depth, at half a cell):
 *   in the simulation the velocity is 0 inside it and the pressure solve treats it as a wall (a solid neighbour's pressure
 *   is the cell's own), so steam meeting the underside of a letter pools and spills round it; in the draw the ray STOPS at
 *   the metal, so steam behind the logo does not show through its face.
 * - **WHERE THE RAIN LANDS** (the emitters): in each column of cells, the cell just above the logo's HIGHEST surface there,
 *   the rain's own hit-map rule (vertical rain reaches only what faces up and is not under another part of the logo).
 * - **WHEN** (Carl's brief): a short BURST from the moment the FIRST DROPS LAND (`burstS`, eased in and out) × the red still
 *   left (1 − the wash); then it rises and thins (`lifeS`). After that the simulation STOPS and the box is hidden, so it
 *   costs nothing outside those seconds. The clock is the rain's (`HeroRain.sinceFirstLanding`), so "Rain again" plays it.
 * - **BY TIME**: each step is the story's delta (clamped to `SIM_DT`), so frame-stepped films (1/30 s) step it exactly.
 * - **THE DRAW**: ONE box in the main pass, my own march (no second render, no volumetric lighting pass, no blur): front
 *   faces depth-tested (the text in front hides it); from inside the box its back faces, untested.
 * - **TAKE 1 IS FOR THE MOTION AND THE COST**: neutral white, lit by the scene key's direction and an ambient share. Not
 *   tinted by the logo: it is not a light source (Carl's ruling on the rain, 14 November).
 * Values are takes (the panel's Steam folder).
 */

/** the box about the landed logo (cm): each side in x and z, and above its top */
const MARGIN = { xCm: 20, zCm: 25, riseCm: 100 } as const;
/**
 * ONE STEP PER FRAME, its length the frame's (clamped to `SIM_DT`). ⚰️ Take 1 stepped a FIXED 1/60 s, up to two a frame:
 * below 60 fps it ran TWO steps every frame to catch up, doubling the simulation's cost exactly when the frame was already
 * slow (measured, 16 November: `stepsLastFrame` 2 at every cell size). A frame longer than `SIM_DT` steps `SIM_DT` (the steam
 * slows rather than going unstable); frame-stepped films (1/30 s) step it exactly, one step a frame.
 */
const SIM_DT = 1 / 30;
/** Jacobi iterations (even: the solve ends in pressure A) */
const PRESSURE_ITERATIONS = 4;
/** the curl noise's feature size (cm) */
const NOISE_CM = 18;
/** the share of the 1/30 s draws on which an emitting spot puffs (a take) */
const PUFF_CHANCE = 0.25;
/** the explicit mip level for every sample in a loop or a compute pass (no derivatives there) */
const LOD0 = float(0);

export type HeroSteamSettings = {
  on: boolean;
  /** emitting ON (to judge the look and measure the cost); off = the burst at the first drops */
  hold: boolean;
  /** the burst's length (s, from the first drops landing) */
  burstS: number;
  /** the steam's life after it is made (s; its density's time constant) */
  lifeS: number;
  /** its heat's time constant (s): how long it keeps rising hard */
  coolS: number;
  /** density and heat made per second at each emitting cell */
  amount: number;
  heat: number;
  /** buoyancy (cm/s² per unit of heat) and the dense steam's weight */
  rise: number;
  weight: number;
  /** the curl-noise force (cm/s²) */
  turbulence: number;
  /** the simulation's cell (cm) — the cost's main dial */
  cellCm: number;
  /** the ray march's steps through the box */
  steps: number;
  /** extinction per cm at density 1 */
  thickness: number;
  brightness: number;
};

export const HERO_STEAM_DEFAULTS: HeroSteamSettings = {
  on: true,
  hold: false,
  burstS: 1.2,
  lifeS: 1.2,
  coolS: 0.8,
  amount: 8,
  heat: 6,
  rise: 400,
  weight: 30,
  turbulence: 300,
  cellCm: 2.5,
  steps: 48,
  thickness: 0.04,
  brightness: 0.8,
};

/** the bench's read-out (`__heroBench.hero.steamInfo`) */
export type HeroSteamInfo = {
  live: boolean;
  /** seconds since the first drops landed (NaN = no rain), the burst's envelope now */
  t: number;
  env: number;
  cells: [number, number, number];
  count: number;
  cellCm: number;
  boxCm: [number, number, number];
  emitters: number;
  maskCells: [number, number, number];
  solidCells: number;
  maskBuildMs: number;
  /** simulation steps run in the last frame */
  stepsLastFrame: number;
  /** the GPU memory held by the simulation and the mask (MB) */
  gpuMB: number;
  /** the warm-up's time at load (ms, to its last compile; −1 = not done) */
  warmMs: number;
};

export type HeroSteam = {
  group: THREE.Group;
  settings: HeroSteamSettings;
  /** the landed logo: geometry (local cm), its landed world pose, units per cm, its ink raster (`hero-scene.ts`, `inkGrid`) */
  setLogo(g: THREE.BufferGeometry, landed: THREE.Matrix4, unitsPerCm: number, ink: SteamInk): void;
  /** the scene key's direction (world, toward the light) */
  setLight(dir: THREE.Vector3): void;
  /** the story's delta; seconds since the first drops landed (NaN = none); the red left (1 − wash); the camera (world) */
  update(delta: number, sinceFirstLanding: number, redLeft: number, camera: THREE.Vector3): void;
  /** the GPU steps, before the draw (the scene's `compute`); the scene and camera for the WARM-UP's compile (`warm`) */
  compute(renderer: WebGPURenderer, scene: THREE.Scene, camera: THREE.Camera): void;
  readonly info: HeroSteamInfo | null;
  dispose(): void;
};

/** the logo's ink on its face (local x, y in cm) — `inkGrid`'s result */
export type SteamInk = { ink: Uint8Array; W: number; H: number; minX: number; minY: number; sizeX: number; sizeY: number };

const smooth01 = (u: number) => {
  const x = Math.max(0, Math.min(1, u));
  return x * x * (3 - 2 * x);
};

type Logo = { g: THREE.BufferGeometry; landed: THREE.Matrix4; upc: number; ink: SteamInk };
type Box = { min: THREE.Vector3; sizeWorld: THREE.Vector3; cm: THREE.Vector3; n: [number, number, number]; cellCm: number };

/** the box about the landed logo, in whole cubic cells */
function boxFor(logo: Logo, floorY: number, cellCm: number): Box {
  logo.g.computeBoundingBox();
  const wb = logo.g.boundingBox!.clone().applyMatrix4(logo.landed);
  const u = logo.upc;
  const lo = new THREE.Vector3(wb.min.x - MARGIN.xCm * u, floorY, wb.min.z - MARGIN.zCm * u);
  const hi = new THREE.Vector3(wb.max.x + MARGIN.xCm * u, wb.max.y + MARGIN.riseCm * u, wb.max.z + MARGIN.zCm * u);
  const cmSize = hi.clone().sub(lo).divideScalar(u);
  const n: [number, number, number] = [Math.ceil(cmSize.x / cellCm), Math.ceil(cmSize.y / cellCm), Math.ceil(cmSize.z / cellCm)];
  const cm = new THREE.Vector3(n[0] * cellCm, n[1] * cellCm, n[2] * cellCm);
  // centred on the logo in x and z; the floor kept as the bottom
  const min = new THREE.Vector3(lo.x - ((cm.x - cmSize.x) * u) / 2, floorY, lo.z - ((cm.z - cmSize.z) * u) / 2);
  return { min, sizeWorld: cm.clone().multiplyScalar(u), cm, n, cellCm };
}

/**
 * THE SOLID MASK (header): each cell of a grid at half the simulation's cell, 255 where its centre is inside the logo — the
 * ink at its face position (local x, y) and inside the extrusion's depth (local z). The landed pose inverted takes each
 * world centre to the logo's local cm. ⚠ The bevel is not modelled (the ink's outline × the full depth).
 */
function solidMask(logo: Logo, box: Box): { data: Uint8Array; n: [number, number, number]; solid: number; ms: number } {
  const t0 = performance.now();
  const mc = box.cellCm / 2;
  const n: [number, number, number] = [Math.round(box.cm.x / mc), Math.round(box.cm.y / mc), Math.round(box.cm.z / mc)];
  const data = new Uint8Array(n[0] * n[1] * n[2]);
  const inv = logo.landed.clone().invert().elements;
  const zb = logo.g.boundingBox!;
  const { ink, W, H, minX, minY, sizeX, sizeY } = logo.ink;
  const stepW = mc * logo.upc;
  let solid = 0;
  for (let k = 0; k < n[2]; k++) {
    const wz = box.min.z + (k + 0.5) * stepW;
    for (let j = 0; j < n[1]; j++) {
      const wy = box.min.y + (j + 0.5) * stepW;
      for (let i = 0; i < n[0]; i++) {
        const wx = box.min.x + (i + 0.5) * stepW;
        const lz = inv[2] * wx + inv[6] * wy + inv[10] * wz + inv[14];
        if (lz < zb.min.z || lz > zb.max.z) continue;
        const lx = inv[0] * wx + inv[4] * wy + inv[8] * wz + inv[12];
        const ly = inv[1] * wx + inv[5] * wy + inv[9] * wz + inv[13];
        const ix = Math.floor(((lx - minX) / sizeX) * W);
        const iy = Math.floor(((ly - minY) / sizeY) * H);
        if (ix < 0 || iy < 0 || ix >= W || iy >= H || !ink[W * iy + ix]) continue;
        data[n[0] * (n[1] * k + j) + i] = 255;
        solid++;
      }
    }
  }
  return { data, n, solid, ms: Math.round(performance.now() - t0) };
}

/** THE EMITTERS (header): per column of simulation cells, the cell above the highest solid one (uvw at its centre) */
function emittersFor(mask: { data: Uint8Array; n: [number, number, number] }, box: Box): Float32Array {
  const [nx, ny, nz] = box.n;
  const [mx, my] = mask.n;
  const solidAt = (i: number, j: number, k: number) => {
    // the mask cell nearest the simulation cell's centre (the mask is twice as fine)
    const a = Math.min(mask.n[0] - 1, 2 * i + 1);
    const b = Math.min(mask.n[1] - 1, 2 * j + 1);
    const c = Math.min(mask.n[2] - 1, 2 * k + 1);
    return mask.data[mx * (my * c + b) + a] > 0;
  };
  const out: number[] = [];
  for (let k = 0; k < nz; k++) {
    for (let i = 0; i < nx; i++) {
      for (let j = ny - 2; j >= 0; j--) {
        if (solidAt(i, j, k)) {
          out.push((i + 0.5) / nx, (j + 1.5) / ny, (k + 0.5) / nz, 0);
          break;
        }
      }
    }
  }
  return new Float32Array(out);
}

function storage3D(n: [number, number, number], name: string): Storage3DTexture {
  const t = new Storage3DTexture(n[0], n[1], n[2]);
  t.name = name;
  t.format = THREE.RGBAFormat;
  t.type = THREE.HalfFloatType;
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.wrapR = THREE.ClampToEdgeWrapping;
  return t;
}

export function createHeroSteam(floorY: number): HeroSteam {
  const settings: HeroSteamSettings = { ...HERO_STEAM_DEFAULTS };
  const group = new THREE.Group();
  group.name = "hero steam";
  group.visible = false;

  const u = {
    dt: uniform(SIM_DT),
    time: uniform(0),
    boxCm: uniform(new THREE.Vector3(1, 1, 1)),
    boxMin: uniform(new THREE.Vector3()),
    boxSize: uniform(new THREE.Vector3(1, 1, 1)),
    upc: uniform(1),
    rise: uniform(HERO_STEAM_DEFAULTS.rise),
    weight: uniform(HERO_STEAM_DEFAULTS.weight),
    turb: uniform(HERO_STEAM_DEFAULTS.turbulence),
    turbDecay: uniform(0.1),
    damp: uniform(0.6),
    dissipate: uniform(1 / HERO_STEAM_DEFAULTS.lifeS),
    cool: uniform(1 / HERO_STEAM_DEFAULTS.coolS),
    emitD: uniform(0),
    emitT: uniform(0),
    steps: uniform(HERO_STEAM_DEFAULTS.steps, "int"),
    thickness: uniform(HERO_STEAM_DEFAULTS.thickness),
    brightness: uniform(HERO_STEAM_DEFAULTS.brightness),
    fade: uniform(1),
    lightDir: uniform(new THREE.Vector3(0.5, 0.5, 1).normalize()),
    // the self-shadow's tap spacing (cm)
    shadowCm: uniform(6),
  };

  // the draw's textures, swapped when the simulation is rebuilt (a 1-cell placeholder until then)
  const placeholder = new THREE.Data3DTexture(new Uint8Array(4), 1, 1, 1);
  placeholder.needsUpdate = true;
  const dyeNode = texture3D(placeholder);
  const maskNode = texture3D(placeholder);

  // THE DRAW (header): the march through the box, front faces depth-tested; from inside, the back faces untested
  const march = Fn(() => {
    const ro = cameraPosition;
    const rd = positionWorld.sub(ro).normalize().toVar();
    // a safe reciprocal: never divide by an exact 0
    const rdS = step(0, rd).mul(2).sub(1).mul(rd.abs().max(1e-6));
    const bmax = u.boxMin.add(u.boxSize);
    const ta = u.boxMin.sub(ro).div(rdS);
    const tb = bmax.sub(ro).div(rdS);
    const tlo = min(ta, tb);
    const thi = max(ta, tb);
    const tNear = max(max(tlo.x, tlo.y), max(tlo.z, 0));
    const tFar = min(min(thi.x, thi.y), thi.z);
    const dt = tFar.sub(tNear).max(0).div(u.steps.toFloat()).toVar();
    // dithered start (the example's): no banding
    const jitter = interleavedGradientNoise(screenCoordinate).add(float(frameId).mul(0.618033988749895)).fract();
    const t = tNear.add(dt.mul(jitter)).toVar();
    const T = float(1).toVar();
    const lum = float(0).toVar();
    const stepCm = dt.div(u.upc);
    const toLight = u.lightDir.mul(u.shadowCm.mul(u.upc)).div(u.boxSize);
    Loop({ start: 0, end: u.steps, type: "int" }, () => {
      const uvw = ro.add(rd.mul(t)).sub(u.boxMin).div(u.boxSize).toVar();
      // the metal: the ray stops (steam behind the logo is hidden by it)
      If(maskNode.sample(uvw).level(LOD0).r.greaterThan(0.5), () => {
        Break();
      });
      const e = min(uvw, vec3(1).sub(uvw));
      const d = dyeNode.sample(uvw).level(LOD0).r.max(0).mul(smoothstep(0, 0.04, min(e.x, min(e.y, e.z))));
      If(d.greaterThan(0.002), () => {
        // the example's cheap self-shadow: two taps toward the key
        const s1 = dyeNode.sample(uvw.add(toLight.mul(0.5))).level(LOD0).r.max(0);
        const s2 = dyeNode.sample(uvw.add(toLight.mul(1.5))).level(LOD0).r.max(0);
        const tau = s1.add(s2).mul(u.thickness).mul(u.shadowCm).mul(2);
        const lit = tau.negate().exp().add(0.35);
        const a = float(1).sub(d.mul(u.thickness).mul(stepCm).negate().exp());
        lum.addAssign(T.mul(a).mul(lit));
        T.mulAssign(a.oneMinus());
      });
      If(T.lessThan(0.01), () => {
        Break();
      });
      t.addAssign(dt);
    });
    const alpha = T.oneMinus();
    const c = lum.div(alpha.max(1e-4)).mul(u.brightness);
    return vec4(c, c, c, alpha.mul(u.fade));
  });
  const mat = new MeshBasicNodeMaterial();
  mat.colorNode = march();
  mat.transparent = true;
  mat.depthWrite = false;
  mat.depthTest = true;
  mat.side = THREE.FrontSide;
  mat.forceSinglePass = true;
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const mesh = new THREE.Mesh(boxGeo, mat);
  mesh.name = "hero steam: volume";
  mesh.frustumCulled = false;
  group.add(mesh);

  let logo: Logo | null = null;

  /** THE SIMULATION (header) — rebuilt when the cell size changes */
  function buildSim(l: Logo, cellCm: number) {
    const box = boxFor(l, floorY, cellCm);
    const mask = solidMask(l, box);
    const maskTex = new THREE.Data3DTexture(mask.data, mask.n[0], mask.n[1], mask.n[2]);
    maskTex.format = THREE.RedFormat;
    maskTex.type = THREE.UnsignedByteType;
    maskTex.minFilter = THREE.LinearFilter;
    maskTex.magFilter = THREE.LinearFilter;
    maskTex.unpackAlignment = 1;
    maskTex.needsUpdate = true;
    const emit = emittersFor(mask, box);
    const [nx, ny, nz] = box.n;
    const count = nx * ny * nz;
    const dims = vec3(nx, ny, nz);
    const tx = 1 / nx;
    const ty = 1 / ny;
    const tz = 1 / nz;

    const velA = storage3D(box.n, "steam velocity A");
    const velB = storage3D(box.n, "steam velocity B");
    const dyeA = storage3D(box.n, "steam dye A");
    const dyeB = storage3D(box.n, "steam dye B");
    const div = storage3D(box.n, "steam divergence");
    const pressA = storage3D(box.n, "steam pressure A");
    const pressB = storage3D(box.n, "steam pressure B");
    const curl = storage3D(box.n, "steam curl noise");
    curl.wrapS = THREE.RepeatWrapping;
    curl.wrapT = THREE.RepeatWrapping;
    curl.wrapR = THREE.RepeatWrapping;
    const textures = [velA, velB, dyeA, dyeB, div, pressA, pressB, curl];
    dyeNode.value = dyeA;
    maskNode.value = maskTex;
    const dyeWrite = storageTexture(dyeB).toWriteOnly();
    const curlNode = texture3D(curl);

    const voxel = () => {
      const id = instanceIndex;
      return uvec3(id.mod(nx), id.div(nx).mod(ny), id.div(nx * ny));
    };
    const toUVW = (c: ReturnType<typeof voxel>) => vec3(c).add(0.5).div(dims);
    const solid = (p: ReturnType<typeof toUVW>) => texture3D(maskTex, p, 0).r.greaterThan(0.5);

    const curlPass = Fn(() => {
      const c = voxel();
      const p = toUVW(c).mul(u.boxCm).div(NOISE_CM);
      const e = 0.1;
      const n = (o: [number, number, number]) => snoiseVec3(p.add(vec3(o[0], o[1], o[2])));
      const x0 = n([-e, 0, 0]);
      const x1 = n([e, 0, 0]);
      const y0 = n([0, -e, 0]);
      const y1 = n([0, e, 0]);
      const z0 = n([0, 0, -e]);
      const z1 = n([0, 0, e]);
      const cx = y1.z.sub(y0.z).sub(z1.y).add(z0.y);
      const cy = z1.x.sub(z0.x).sub(x1.z).add(x0.z);
      const cz = x1.y.sub(x0.y).sub(y1.x).add(y0.x);
      textureStore(curl, c, vec4(vec3(cx, cy, cz).mul(1 / (2 * e)), 0)).toWriteOnly();
    })().compute(count);
    curlPass.setName("hero steam: curl noise");

    // (two passes: at most four storage textures per stage on every device)
    const clearA = Fn(() => {
      const c = voxel();
      textureStore(velA, c, vec4(0)).toWriteOnly();
      textureStore(velB, c, vec4(0)).toWriteOnly();
      textureStore(pressA, c, vec4(0)).toWriteOnly();
    })().compute(count);
    clearA.setName("hero steam: clear A");
    const clearB = Fn(() => {
      const c = voxel();
      textureStore(dyeA, c, vec4(0)).toWriteOnly();
      textureStore(dyeB, c, vec4(0)).toWriteOnly();
      textureStore(pressB, c, vec4(0)).toWriteOnly();
    })().compute(count);
    clearB.setName("hero steam: clear B");

    // 1) the velocity advected, buoyancy, turbulence, damping, the border; 0 inside the metal
    const advectVel = Fn(() => {
      const c = voxel();
      const p = toUVW(c);
      const v = texture3D(velA, p, 0).xyz;
      const back = p.sub(v.div(u.boxCm).mul(u.dt));
      const nv = texture3D(velA, back, 0).xyz.toVar();
      const dye = dyeNode.sample(p).level(LOD0);
      const dens = dye.r;
      const temp = dye.g;
      const age = dye.b;
      nv.addAssign(vec3(0, temp.mul(u.rise).sub(dens.mul(u.weight)), 0).mul(u.dt));
      const thermalAt = p.add(vec3(0, age.negate().mul(0.6), age.mul(0.13)).div(10));
      const thermal = curlNode.sample(thermalAt).level(LOD0).xyz.mul(u.turb).mul(temp).mul(age.mul(u.turbDecay.negate()).exp());
      const ambientAt = p.mul(0.5).add(vec3(0, u.time.mul(0.25), u.time.mul(0.06)).div(10));
      const ambient = curlNode.sample(ambientAt).level(LOD0).xyz.mul(u.turb.mul(0.2)).mul(dens);
      nv.addAssign(thermal.add(ambient).mul(u.dt));
      nv.mulAssign(max(float(1).sub(u.damp.mul(u.dt)), 0));
      const e = min(p, vec3(1).sub(p));
      nv.mulAssign(smoothstep(0, 0.08, min(e.x, min(e.y, e.z))));
      textureStore(velB, c, vec4(select(solid(p), vec3(0), nv), 0)).toWriteOnly();
    })().compute(count);
    advectVel.setName("hero steam: advect velocity");

    // 2) divergence (the metal's velocity is 0: a wall)
    const divergence = Fn(() => {
      const c = voxel();
      const p = toUVW(c);
      const vR = texture3D(velB, p.add(vec3(tx, 0, 0)), 0).x;
      const vL = texture3D(velB, p.sub(vec3(tx, 0, 0)), 0).x;
      const vU = texture3D(velB, p.add(vec3(0, ty, 0)), 0).y;
      const vD = texture3D(velB, p.sub(vec3(0, ty, 0)), 0).y;
      const vF = texture3D(velB, p.add(vec3(0, 0, tz)), 0).z;
      const vK = texture3D(velB, p.sub(vec3(0, 0, tz)), 0).z;
      textureStore(div, c, vec4(vR.sub(vL).add(vU.sub(vD)).add(vF.sub(vK)).mul(0.5), 0, 0, 0)).toWriteOnly();
    })().compute(count);
    divergence.setName("hero steam: divergence");

    // a neighbour's pressure, or the cell's own where the neighbour is metal (no flow through the wall)
    const pAt = (tex: Storage3DTexture, p: ReturnType<typeof toUVW>, o: [number, number, number], pc: Node<"float">) => {
      const q = p.add(vec3(o[0], o[1], o[2]));
      return select(solid(q), pc, texture3D(tex, q, 0).x);
    };
    const jacobi = (from: Storage3DTexture, to: Storage3DTexture, name: string) => {
      const pass = Fn(() => {
        const c = voxel();
        const p = toUVW(c);
        const pc = texture3D(from, p, 0).x;
        const sum = pAt(from, p, [tx, 0, 0], pc)
          .add(pAt(from, p, [-tx, 0, 0], pc))
          .add(pAt(from, p, [0, ty, 0], pc))
          .add(pAt(from, p, [0, -ty, 0], pc))
          .add(pAt(from, p, [0, 0, tz], pc))
          .add(pAt(from, p, [0, 0, -tz], pc));
        textureStore(to, c, vec4(sum.sub(texture3D(div, p, 0).x).div(6), 0, 0, 0)).toWriteOnly();
      })().compute(count);
      pass.setName(name);
      return pass;
    };
    const jacobiAB = jacobi(pressA, pressB, "hero steam: jacobi AB");
    const jacobiBA = jacobi(pressB, pressA, "hero steam: jacobi BA");

    // 4) projection: the pressure's gradient taken away; 0 inside the metal
    const project = Fn(() => {
      const c = voxel();
      const p = toUVW(c);
      const pc = texture3D(pressA, p, 0).x;
      const g = vec3(
        pAt(pressA, p, [tx, 0, 0], pc).sub(pAt(pressA, p, [-tx, 0, 0], pc)),
        pAt(pressA, p, [0, ty, 0], pc).sub(pAt(pressA, p, [0, -ty, 0], pc)),
        pAt(pressA, p, [0, 0, tz], pc).sub(pAt(pressA, p, [0, 0, -tz], pc)),
      ).mul(0.5);
      const v = texture3D(velB, p, 0).xyz.sub(g);
      textureStore(velA, c, vec4(select(solid(p), vec3(0), v), 0)).toWriteOnly();
    })().compute(count);
    project.setName("hero steam: project");

    // 5) the dye advected, thinned and cooled; none inside the metal
    const advectDye = Fn(() => {
      const c = voxel();
      const p = toUVW(c);
      const v = texture3D(velA, p, 0).xyz;
      const back = p.sub(v.div(u.boxCm).mul(u.dt));
      const dye = dyeNode.sample(back).level(LOD0);
      const dens = dye.r.mul(max(float(1).sub(u.dissipate.mul(u.dt)), 0)).toVar();
      const temp = dye.g.mul(max(float(1).sub(u.cool.mul(u.dt)), 0)).clamp(0, 12).toVar();
      // the age by the nearest cell (no numerical spread)
      const near = back.mul(dims).floor().add(0.5).div(dims);
      const age = dyeNode.sample(near).level(LOD0).b.add(u.dt).toVar();
      If(dens.lessThanEqual(0.01), () => {
        age.assign(0);
      });
      const out = select(solid(p), vec4(0), vec4(dens, temp, age, 1));
      textureStore(dyeWrite, c, out).toWriteOnly();
    })().compute(count);
    advectDye.setName("hero steam: advect dye");

    // 6) emission where the rain lands (the emitters), patchy in space and time
    const emitCount = Math.max(1, emit.length / 4);
    const emitters = instancedArray(emitCount, "vec4");
    (emitters.value.array as Float32Array).set(emit.length ? emit : new Float32Array(4).fill(-1));
    emitters.value.needsUpdate = true;
    const emitPass = Fn(() => {
      const p = emitters.element(instanceIndex).xyz;
      If(p.x.greaterThanEqual(0), () => {
        const c = uvec3(p.mul(dims));
        const flicker = mx_noise_float(p.mul(u.boxCm).div(8).add(vec3(0, u.time.mul(-2.5), u.time.mul(0.7))))
          .mul(0.5)
          .add(0.5);
        // A PUFF NOW AND THEN AT EACH SPOT (drops land at random): a fresh draw 30 times a second; a spot puffs on
        // `PUFF_CHANCE` of them at 1 / `PUFF_CHANCE` the amount (the same total). Take 1's every-spot-every-tick traced the
        // whole top outline at once as an even white fringe (seen, 16 November): a glow, not drops meeting hot metal
        const draw = hash(instanceIndex.add(u.time.mul(30).floor().toUint().mul(7919)));
        const puff = step(1 - PUFF_CHANCE, draw).mul(1 / PUFF_CHANCE);
        const k = flicker.mul(0.85).add(0.15).mul(puff);
        const cur = dyeNode.sample(p).level(LOD0);
        const dens = cur.r.add(u.emitD.mul(k));
        const temp = cur.g.add(u.emitT.mul(k)).clamp(0, 12);
        const age = cur.b.mul(cur.r.div(dens.max(0.001)));
        textureStore(dyeWrite, c, vec4(dens, temp, age, 1)).toWriteOnly();
      });
    })().compute(emitCount);
    emitPass.setName("hero steam: emit");

    u.boxCm.value.copy(box.cm);
    u.boxMin.value.copy(box.min);
    u.boxSize.value.copy(box.sizeWorld);
    u.upc.value = l.upc;
    mesh.position.copy(box.min).addScaledVector(box.sizeWorld, 0.5);
    mesh.scale.copy(box.sizeWorld);
    mesh.updateMatrix();

    const bytes = 8 * count * textures.length + mask.data.length;
    return {
      box,
      mask,
      maskTex,
      textures,
      dyeWrite,
      curlPass,
      clearA,
      clearB,
      advectVel,
      divergence,
      jacobiAB,
      jacobiBA,
      project,
      advectDye,
      emitPass,
      emitCount: emit.length / 4,
      count,
      gpuMB: Math.round((bytes / (1024 * 1024)) * 10) / 10,
      dispose() {
        for (const t of textures) t.dispose();
        maskTex.dispose();
      },
    };
  }
  type Sim = ReturnType<typeof buildSim>;
  let sim: Sim | null = null;
  let needsCurl = true;
  let needsClear = true;
  let needsWarm = true;
  let warmMs = -1;

  /**
   * ⛔ THE WARM-UP (16 November 2026; D-101). Carl: *"I opened a new browser window. The stutter was there"* → *"Implement
   * the fix."* MEASURED first (`live-work/scripts/hero-first-run-hitch-16-november.mjs`, a fresh browser = an empty shader
   * cache): with the steam, frames of 300–367 ms at the first drops; with it off, the rain's own 83–100 ms at its release.
   * The steam's programs were first BUILT when the story reached the first drops. Now they are built at LOAD, during the
   * logo's lean (a held frame looks the same):
   * - every COMPUTE program built and run once (nothing emitted), the fields then cleared. ⚠ r185 builds compute
   *   pipelines synchronously only: this is a frame's work during the lean, not a background job.
   * - the DRAW compiled with `compileAsync` (r185 builds render pipelines in the background), BOTH variants one after
   *   the other: outside the box (front faces, depth-tested) and inside it (back faces, untested). The box stays hidden;
   *   r185 builds the pipeline AFTER an await, from the material as it is THEN, so each variant is awaited before the
   *   material is set for the next.
   */
  async function warm(renderer: WebGPURenderer, scene: THREE.Scene, camera: THREE.Camera) {
    const s = sim!;
    const t0 = performance.now();
    u.dt.value = SIM_DT;
    u.emitD.value = 0;
    u.emitT.value = 0;
    for (const pass of [s.advectVel, s.divergence, s.jacobiAB, s.jacobiBA, s.project, s.advectDye, s.emitPass]) renderer.compute(pass);
    needsClear = true;
    const keep = { side: mat.side, depthTest: mat.depthTest };
    for (const [side, depthTest] of [
      [THREE.FrontSide, true],
      [THREE.BackSide, false],
    ] as const) {
      mat.side = side;
      mat.depthTest = depthTest;
      mat.needsUpdate = true;
      // compileAsync gathers what to build synchronously at the call: visible for that moment only
      const was = group.visible;
      group.visible = true;
      const done = renderer.compileAsync(group, camera, scene);
      group.visible = was;
      await done;
    }
    mat.side = keep.side;
    mat.depthTest = keep.depthTest;
    mat.needsUpdate = true;
    warmMs = Math.round(performance.now() - t0);
  }

  // THE CLOCK (header)
  let t = NaN;
  let lastT = NaN;
  let env = 0;
  let live = false;
  let pending = 0;
  let stepsLastFrame = 0;
  let simTime = 0;

  const endS = () => settings.burstS + 2.5 * settings.lifeS;

  function rebuild() {
    if (!logo) return;
    sim?.dispose();
    sim = buildSim(logo, settings.cellCm);
    needsCurl = true;
    needsClear = true;
    needsWarm = true;
  }

  return {
    group,
    settings,
    setLogo(g, landed, unitsPerCm, ink) {
      if (logo) return;
      logo = { g, landed: landed.clone(), upc: unitsPerCm, ink };
      rebuild();
    },
    setLight(dir) {
      u.lightDir.value.copy(dir).normalize();
    },
    update(delta, sinceFirstLanding, redLeft, camera) {
      const s = settings;
      pending = 0;
      if (sim && s.cellCm !== sim.box.cellCm) rebuild();
      t = sinceFirstLanding;
      const started = Number.isFinite(t) && t >= 0;
      // a new run (first landing, or the rain played again): start clean
      if (started && !(lastT >= 0 && t >= lastT)) needsClear = true;
      lastT = t;
      const wasLive = live;
      live = !!sim && s.on && started && (s.hold || t < endS());
      group.visible = live;
      if (!live) {
        env = 0;
        if (wasLive) needsClear = true;
        return;
      }
      const b = s.burstS;
      env = s.hold ? 1 : smooth01(t / (0.25 * b)) * (1 - smooth01((t - 0.5 * b) / (0.5 * b)));
      const red = Math.max(0, Math.min(1, redLeft));
      // ONE STEP PER FRAME (`SIM_DT`): this frame's length, clamped; none on a paused frame
      const dt = Math.min(delta, SIM_DT);
      pending = dt > 1e-6 ? 1 : 0;
      u.dt.value = dt;
      u.emitD.value = s.amount * env * red * dt;
      u.emitT.value = s.heat * env * red * dt;
      u.rise.value = s.rise;
      u.weight.value = s.weight;
      u.turb.value = s.turbulence;
      u.dissipate.value = 1 / Math.max(0.05, s.lifeS);
      u.cool.value = 1 / Math.max(0.05, s.coolS);
      u.steps.value = Math.max(4, Math.round(s.steps));
      u.thickness.value = s.thickness;
      u.brightness.value = s.brightness;
      const end = endS();
      u.fade.value = s.hold ? 1 : 1 - smooth01((t - (end - 0.6)) / 0.6);
      // inside the box: its back faces, untested (the front faces are behind the camera)
      const m = sim!.box;
      const inside =
        camera.x > m.min.x && camera.x < m.min.x + m.sizeWorld.x && camera.y > m.min.y && camera.y < m.min.y + m.sizeWorld.y && camera.z > m.min.z && camera.z < m.min.z + m.sizeWorld.z;
      const side = inside ? THREE.BackSide : THREE.FrontSide;
      if (mat.side !== side) {
        mat.side = side;
        mat.depthTest = !inside;
        mat.needsUpdate = true;
      }
    },
    compute(renderer, scene, camera) {
      stepsLastFrame = 0;
      if (!sim) return;
      if (needsCurl) {
        renderer.compute(sim.curlPass);
        needsCurl = false;
      }
      // THE WARM-UP (`warm`): once per build, at load
      if (needsWarm) {
        needsWarm = false;
        warm(renderer, scene, camera).catch((e: unknown) => console.warn("[hero steam] warm-up", e));
      }
      if (needsClear) {
        renderer.compute(sim.clearA);
        renderer.compute(sim.clearB);
        // the ping-pong back to its start
        dyeNode.value = sim.textures[2];
        sim.dyeWrite.value = sim.textures[3];
        simTime = 0;
        needsClear = false;
      }
      if (!live) return;
      for (let k = 0; k < pending; k++) {
        simTime += u.dt.value;
        u.time.value = simTime;
        renderer.compute(sim.advectVel);
        renderer.compute(sim.divergence);
        for (let i = 0; i < PRESSURE_ITERATIONS; i++) renderer.compute(i % 2 === 0 ? sim.jacobiAB : sim.jacobiBA);
        renderer.compute(sim.project);
        renderer.compute(sim.advectDye);
        if (sim.emitCount > 0 && u.emitD.value > 0) renderer.compute(sim.emitPass);
        const read = dyeNode.value;
        dyeNode.value = sim.dyeWrite.value;
        sim.dyeWrite.value = read;
        stepsLastFrame++;
      }
      pending = 0;
    },
    get info() {
      if (!sim) return null;
      const r = (v: number) => Math.round(v * 100) / 100;
      return {
        live,
        t: r(t),
        env: r(env),
        cells: sim.box.n,
        count: sim.count,
        cellCm: sim.box.cellCm,
        boxCm: [r(sim.box.cm.x), r(sim.box.cm.y), r(sim.box.cm.z)] as [number, number, number],
        emitters: sim.emitCount,
        maskCells: sim.mask.n,
        solidCells: sim.mask.solid,
        maskBuildMs: sim.mask.ms,
        stepsLastFrame,
        gpuMB: sim.gpuMB,
        warmMs,
      };
    },
    dispose() {
      sim?.dispose();
      placeholder.dispose();
      boxGeo.dispose();
      mat.dispose();
    },
  };
}
