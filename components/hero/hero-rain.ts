import * as THREE from "three";
import { MeshBasicNodeMaterial, type WebGPURenderer } from "three/webgpu";
import { cameraProjectionMatrix, cameraViewMatrix, cos, float, Fn, hash, If, instanceIndex, instancedArray, positionGeometry, positionLocal, select, sin, smoothstep, sqrt, step, texture, uniform, uv, vec2, vec3, vec4 } from "three/tsl";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { LOGO_BLUE_DEFAULTS, platinumBlueF0 } from "@/components/about/logo-mark-material";
import type { HitData } from "./hero-maps.worker";
import { precompileCompute, type PrecompileResult } from "./hero-steam";
import { createCodeDrops, type HeroCodeSettings } from "./hero-code-drops";

/**
 * ⛔ THE HERO's PHASE 2 — THE RAIN (14 November 2026; D-101). Carl: *"So lets start off with the rain om the Logo."* …
 * *"build it on the bench and put the controls in the panel. That way i can give tou some ballpark figures on how heavy the
 * rain should be"*. The reference: three's `webgpu_compute_particles_rain` at OUR version (r185), read whole.
 *
 * WHAT IS THE EXAMPLE's, KEPT: the drops live on the GPU (positions in a storage buffer, moved by a compute pass each
 * frame); each drop a thin camera-facing streak (`billboarding`, turning about the vertical only, so the streak stays
 * upright) with the example's glow (brightest at its foot); on a hit the drop leaves a SPLASH (the example's flat ring and
 * two crossed upright planes, its rings drawn by the splash's clock) and starts again at the top at a new spot; collision
 * against a HEIGHT MAP seen from above.
 *
 * WHAT IS OURS (Carl's rulings, D-101, 8–14 November):
 * - **LOCAL** (*"on the logo and in the immediate surrounding area. It will not be full scrren"*): drops start inside a
 *   disc about the landed logo (`radiusCm`), uniform over its area, and FADE toward its rim (no edge — the no-edge rule).
 * - **PLATINUM BLUE, the colour the logo will become** (*"Platinum blue, same as the logo will become"*): the family's
 *   platinum blue (`platinumBlueF0`, the desk mark's tint), unlit, scaled by `brightness`.
 * - **BY TIME, not per frame**: the example adds a fixed step every frame (twice as fast at 120 Hz, and no frame-stepped
 *   film); ours moves by the STORY's delta (`update`), so films step it exactly.
 * - **THE SHAPE** (*"start off fairly light, then an intense downpour and then it eases off. The timescale for this should
 *   be 5-7s"*): the number of live drops follows `weightAt` over `seconds`; `peak` is the downpour's drop count (the
 *   example's own "drop count" dial: Carl's *"you can dial it in"*); `hold` keeps it at the peak to judge the weight.
 * - **THE START** (*"the rain starts just as the wobble ends"*): the first drops are released one fall EARLY, so they LAND
 *   on the logo's top as phase 1's wobble ends (`update`'s `sinceLanding` = 0).
 * - **THE HIT MAP, MADE ONCE FROM THE LOGO's OWN GEOMETRY** (`hitMap`): the landed logo's triangles drawn from above onto a
 *   grid, each cell the highest surface over it — the flow map's method (`hero-maps.worker.ts`, `inkGrid`; both built off the
 *   main thread there since 16 November 2026, session 2: `hitMapData`). ⚠ A DEPARTURE,
 *   stated: the structure Carl approved (D-101, 14 November) was the example's — an orthographic camera rendering the
 *   logo into a texture, ONCE at the landing. The map is the same; made on the CPU it needs no second render, no second
 *   camera and no render target, and its orientation is the flow map's (proven), not a render's (unproven). Built when the
 *   logo is (with the flow map), not at the landing (no hitch at the story's key moment).
 * - The floor: outside the logo the map is 0 (`FLOOR_Y`); the rain splashes on the floor around it (Carl, 10 November:
 *   *"not just the logo but the floor around it too"*).
 * Values are takes (the panel's Rain folder).
 *
 * ⛔ TAKE 2 (14 November 2026; Carl on take 1 close up: *"Floor splashes the same size are the equivalent of "tiling" in
 * the game world. Same goes for the rain, We need to introduce randomness into it. Peak drops at 3600 boost the frame rate
 * and still look good."* and *"i agree with your suggestions"*):
 * - **NOTHING TILES** (`VARY`): each drop its own width, length and brightness (fixed per drop, from its index); each
 *   splash its own turn about the vertical, size and crown height (drawn fresh at every hit, `splashRnd`).
 * - **PEAK 3,600** by default.
 *
 * ⛔ THE CODE DROPS (20 November 2026; D-101; `hero-code-drops.ts`). Carl: *"In each run, every drop that is destined to
 * fall on the logo should be code."* At each RELEASE the step decides: in the LAST BAND (`bandFrom`, the rain's clock: one
 * fall before the shape's last live drop, `codeBandFrom`) AND over the logo in the hit map → a code drop (`codeNow`), its
 * column written (`codeCol`, `codeSurf`) for `hero-code-drops.ts` to draw. Its streak is hidden from its TURN down, and it
 * makes NO SPLASH when it lands. Nothing else in the rain changes; held at the peak (`hold`), there is no last band.
 * - ⚰️ THE DROPS LIT BY THE WORLD — built, then WITHDRAWN the same day (Carl: *"the red drops and splashes dont look
 *   right. if the logo is light emissive i dont think they would affect rain splashes like that."*): the logo is not a
 *   light source, so it cannot tint the rain. Removed whole (a face-on distance field and two dials); should the logo be
 *   ruled to glow, the tint follows from that light.
 */
/** take 2's spreads, ± shares of each dial (takes) */
const VARY = { width: 0.35, length: 0.25, brightness: 0.35, splashSize: 0.4, crown: 0.4 } as const;

/** the buffers' size — the example's maximum (its "drop count" dial runs 200–50,000) */
export const RAIN_MAX_DROPS = 50000;
/** a parked drop's height (world): far below the camera's far plane — not drawn, waiting to be released */
const PARK = -1e6;
/** the hit map's cells per cm (the logo's top edges are ~7.6 cm deep: ~30 cells across). Exported: sent with the map's
 *  request to `hero-maps.worker.ts`, which builds it (16 November 2026, session 2) */
export const HIT = { perCm: 4, marginCm: 2, maxCells: 4096 } as const;
/** how fast the live count may RISE (a full peak over this many seconds): `hold` switched on mid-story must not drop a
 *  sheet of thousands of drops from the same height at once */
const RISE_S = 0.5;

export type HeroRainSettings = {
  /** the rain at all */
  on: boolean;
  /** held at the peak (to judge the weight); off = the shape over `seconds` */
  hold: boolean;
  /** the downpour's drop count (the example's "drop count") */
  peak: number;
  /** the light opening's share of the peak */
  light: number;
  /** the whole shape: light → downpour → eases off (Carl: 5–7 s) */
  seconds: number;
  /** the disc rained on, about the landed logo's centre (cm) */
  radiusCm: number;
  /** where the drops start, above the floor (cm) — above the frame at Home */
  heightCm: number;
  /** fall speed (cm/s; real rain ~900) */
  speedCmS: number;
  /** the streak's length (cm) and width (mm) */
  lengthCm: number;
  widthMm: number;
  /** the streaks' and splashes' opacity, and the blue's brightness */
  opacity: number;
  brightness: number;
  /** the splashes, and their size (cm) */
  splashes: boolean;
  splashCm: number;
  /** ⛔ THE WASH's LENGTH (s, from the first drops landing to the wash complete): the run-off keeps running after the
   *  rain (Carl, 14 November 2026: *"the wash happens too fast"* → option 1, *"lets go with 1"*) */
  washSeconds: number;
};

/** starting values — takes, for Carl's eye */
export const HERO_RAIN_DEFAULTS: HeroRainSettings = {
  // ⛔ BACK ON (Carl, 22 November 2026, session 3: *"Hide the cloth for now and activate the rain and steam. We will decide how and when the cloth arrives."*). ⚰️ Off from
  // 20 November while the cloth was built (*"for now you can put the cloth directly above the logo but turn off the rain and
  // steam."*) (D-101)
  on: true,
  hold: false,
  // Carl, take 1: "Peak drops at 3600 boost the frame rate and still look good" (8,000 before)
  peak: 3600,
  light: 0.2,
  seconds: 6,
  radiusCm: 160,
  heightCm: 400,
  speedCmS: 900,
  lengthCm: 12,
  widthMm: 2.5,
  opacity: 0.35,
  brightness: 4,
  splashes: true,
  // Carl's, take 1 close up (5.4); 4 before
  splashCm: 5.4,
  // ⚠ MEASURED (14 November 2026, red pixels counted from Carl's close camera, frame-stepped): the LAST RED goes at ~0.77 of
  // this (the wash's last few per cent carry no visible red): 7.5 → the last red 5.75 s after the first drops (with the last
  // drop); 9.8 → 7.5 s, ~1.5 s after the last drop (Carl: the run-off running on after the rain) — the default
  washSeconds: 9.8,
};

/** a read-out for checks (the bench's `__heroBench.hero.rainInfo`) */
export type HeroRainInfo = {
  /** the rain's own clock (s since the first release; −1 = off), the shape's weight, the live drops */
  t: number;
  weight: number;
  active: number;
  /** seconds a drop takes from its start to the logo's top (the early release) and to the floor */
  leadS: number;
  fallS: number;
  running: boolean;
  /** phase 2's wash: the share of the rain's whole fall that has landed (0–1; `hero-scene.ts`, `RUNOFF`) */
  wash: number;
  /** the code drops' band on the rain's clock (s; null = none: held, or off) */
  codeBand: [number, number] | null;
  map: { cellsX: number; cellsZ: number; minX: number; minZ: number; sizeX: number; sizeZ: number; topY: number; centre: [number, number]; litCells: number; maxHeight: number; buildMs: number };
};

export type HeroRain = {
  /** the drops and the splashes (added to the scene by its owner) */
  group: THREE.Group;
  settings: HeroRainSettings;
  /** the landed logo's HIT MAP (built by `hero-maps.worker.ts` from its geometry and its world pose once landed; `HIT`) */
  setLogo(hit: HitData, unitsPerCm: number): void;
  /** the story's delta, and the seconds since phase 1's end (the wobble done; NaN = no story to rain on) */
  update(delta: number, sinceLanding: number): void;
  /** the GPU step, before the draw (the bench calls it each frame, D-101's approved structure) */
  compute(renderer: WebGPURenderer): void;
  /** ⛔ THE WARM-UP (16 November 2026; `hero-scene.ts`, `warmScene`): the step program built and run once at load with no
   *  drop live (nothing moves) — not first built at the rain's release (~100 ms on a cold shader cache, measured) */
  warm(renderer: WebGPURenderer): void;
  /** the shape again from now (once the logo has landed) */
  again(): void;
  /** ⛔ PHASE 2, THE WASH: the share of the rain's whole fall that has LANDED, 0 until the first drop, 1 by the last (held
   *  at the peak: 1 after one whole fall's worth). The logo's run-off reads it (`hero-scene.ts`, `RUNOFF`) */
  readonly wash: number;
  /** ⛔ PHASE 2, THE STEAM's clock (`hero-steam.ts`; 16 November 2026): seconds since the FIRST DROPS LANDED on the rain's
   *  own clock (negative before; NaN while off), so "Rain again" plays the steam again too. A read-out only */
  readonly sinceFirstLanding: number;
  readonly info: HeroRainInfo | null;
  /** ⛔ THE CODE DROPS' dials (`hero-code-drops.ts`) and their mesh (in `group`; shown to the warm-up by its owner) */
  code: HeroCodeSettings;
  codeMesh: THREE.Mesh;
  dispose(): void;
};

type HitMap = { tex: THREE.DataTexture; minX: number; minZ: number; sizeX: number; sizeZ: number; topY: number; cx: number; cz: number; check: Omit<HeroRainInfo["map"], "minX" | "minZ" | "sizeX" | "sizeZ" | "topY" | "centre"> };

/**
 * THE HIT MAP (header): the landed logo seen from straight above. Each cell holds the height ABOVE THE FLOOR of the
 * highest surface over it (0 = the floor). The logo's triangles in world space, drawn flat onto x–z (the flow map's
 * barycentric fill); walls edge-on from above are skipped (no area). Row = z, column = x — the flow map's convention, so
 * `texture(map, ((x − minX) / sizeX, (z − minZ) / sizeZ))` reads the cell under (x, z).
 */
function hitMap(d: HitData): HitMap {
  // ⛔ BUILT IN `hero-maps.worker.ts` (16 November 2026, session 2; D-101: off the main thread, lifted verbatim —
  // `hitMapData`); here the texture is made from its heights
  const { hgt, W, H, minX, minZ, sizeX, sizeZ, topY, cx, cz, check } = d;
  const tex = new THREE.DataTexture(hgt, W, H, THREE.RedFormat, THREE.FloatType);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return { tex, minX, minZ, sizeX, sizeZ, topY, cx, cz, check };
}

const smooth01 = (u: number) => {
  const x = Math.max(0, Math.min(1, u));
  return x * x * (3 - 2 * x);
};
/**
 * THE SHAPE (Carl: *"start off fairly light, then an intense downpour and then it eases off"*), u = the share of `seconds`
 * (0–1) → the share of the peak: up to `light` over the first 0.12; into the downpour over 0.3–0.5; held to 0.62; eased off
 * to nothing by 1. The breakpoints are takes.
 */
export function weightAt(u: number, light: number): number {
  if (u < 0 || u >= 1) return 0;
  return (light * smooth01(u / 0.12) + (1 - light) * smooth01((u - 0.3) / 0.2)) * (1 - smooth01((u - 0.62) / 0.38));
}

/** the whole shape's fall, in "seconds at the peak": ∫ weightAt over 0–1 (× `seconds` by the caller) — 400 steps */
function shapeArea(light: number): number {
  let a = 0;
  for (let k = 0; k < 400; k++) a += weightAt((k + 0.5) / 400, light) / 400;
  return a;
}
/** the share of the shape's whole fall by u (0–1 of it): a cumulative table, 400 steps, kept for the last light share */
let washTable: { light: number; cum: Float64Array } | null = null;
function shapeShareBy(u: number, light: number): number {
  if (!washTable || washTable.light !== light) {
    const cum = new Float64Array(401);
    for (let k = 0; k < 400; k++) cum[k + 1] = cum[k] + weightAt((k + 0.5) / 400, light);
    for (let k = 1; k <= 400; k++) cum[k] /= cum[400] || 1;
    washTable = { light, cum };
  }
  const x = Math.max(0, Math.min(1, u)) * 400;
  const k = Math.min(399, Math.floor(x));
  return washTable.cum[k] + (washTable.cum[k + 1] - washTable.cum[k]) * (x - k);
}

/** ⛔ THE CODE DROPS' BAND (header): the rain's clock at the shape's LAST LIVE DROP (the live count `peak × weightAt` last at
 *  ≥ 1, scanned back from the end), less `falls` × one fall. Measured 20 November (`hero-last-band-hits-20-november.mjs`):
 *  the last release falls at 31.23–31.30 s of story over five runs */
function codeBandFrom(peak: number, light: number, seconds: number, fallS: number, falls: number): [number, number] {
  let end = 0;
  for (let k = 2000; k >= 0; k--) {
    if (peak * weightAt(k / 2000, light) >= 1) {
      end = (k / 2000) * seconds;
      break;
    }
  }
  return [end - falls * fallS, end];
}

export function createHeroRain(floorY: number): HeroRain {
  const settings: HeroRainSettings = { ...HERO_RAIN_DEFAULTS };
  const group = new THREE.Group();
  group.name = "hero rain";
  group.visible = false;

  let map: HitMap | null = null;
  let upc = 1;

  // the uniforms (world units; set each frame from the settings in `update`)
  const u = {
    dt: uniform(0),
    seed: uniform(0),
    active: uniform(0),
    speed: uniform(1),
    halfLen: uniform(1),
    spawnY: uniform(0),
    fadeTop: uniform(1),
    floorY: uniform(floorY),
    cx: uniform(0),
    cz: uniform(0),
    radius: uniform(1),
    mapMinX: uniform(0),
    mapMinZ: uniform(0),
    mapSizeX: uniform(1),
    mapSizeZ: uniform(1),
    lift: uniform(0),
    splashOn: uniform(1),
    splashSize: uniform(1),
    opacity: uniform(HERO_RAIN_DEFAULTS.opacity),
    brightness: uniform(HERO_RAIN_DEFAULTS.brightness),
    // take 2: the streak's size (world units; each drop varies it, `VARY`)
    dropW: uniform(1),
    dropL: uniform(1),
    // ⛔ THE CODE DROPS: the rain's clock (s), the band's start on it (1e9 = none)
    clock: uniform(0),
    bandFrom: uniform(1e9),
  };
  const [br, bg, bb] = platinumBlueF0(LOGO_BLUE_DEFAULTS.tint);
  const blue = vec3(br, bg, bb);

  // THE BUFFERS (the example's): each drop's position; each splash's position and clock; take 2: each splash's own random
  // (drawn at its hit: its turn, size and crown)
  const pos = instancedArray(RAIN_MAX_DROPS, "vec3");
  const splashPos = instancedArray(RAIN_MAX_DROPS, "vec3");
  const splashT = instancedArray(RAIN_MAX_DROPS, "float");
  const splashRnd = instancedArray(RAIN_MAX_DROPS, "float");
  // ⛔ THE CODE DROPS (header): this fall is code (1/0); its column (x, release height, z, release clock); the surface it
  // lands on (`PARK` = no column)
  const codeNow = instancedArray(RAIN_MAX_DROPS, "float");
  const codeCol = instancedArray(RAIN_MAX_DROPS, "vec4");
  const codeSurf = instancedArray(RAIN_MAX_DROPS, "float");

  // take 2, NOTHING TILES: a drop's fixed share of a dial, 1 ± spread (from its index; the same in the step and the draw)
  const vary = (salt: number, spread: number) => hash(instanceIndex.add(salt)).mul(2).sub(1).mul(spread).add(1);
  const lengthVary = () => vary(2000003, VARY.length);


  // ALL PARKED (run before the first step, and after each stop: a new run starts clean)
  const park = Fn(() => {
    pos.element(instanceIndex).assign(vec3(0, PARK, 0));
    splashT.element(instanceIndex).assign(1000);
    codeNow.element(instanceIndex).assign(0);
    codeSurf.element(instanceIndex).assign(PARK);
  })().compute(RAIN_MAX_DROPS);
  park.setName("hero rain: park");

  // THE STEP (built once the hit map exists — it samples it)
  let step_: typeof park | null = null;
  const buildStep = (m: HitMap) => {
    const hits = texture(m.tex);
    step_ = Fn(() => {
      const p = pos.element(instanceIndex);
      const sp = splashPos.element(instanceIndex);
      const st = splashT.element(instanceIndex);
      const i = instanceIndex.toFloat();
      const rnd = (k: number) => hash(i.mul(4).add(k).add(u.seed));
      const live = i.lessThan(u.active);
      st.addAssign(u.dt.mul(4));
      // released at the top: uniform over the disc (√ of the random radius), a fraction of one step above the top so
      // drops released in the same frame do not line up
      const cn = codeNow.element(instanceIndex);
      const cs = codeSurf.element(instanceIndex);
      // ⛔ THE CODE DROPS: a column from a replayed run (released "later" than now on a restarted clock) is cleared
      If(cs.greaterThan(PARK / 2).and(codeCol.element(instanceIndex).w.greaterThan(u.clock.add(0.001))), () => {
        cs.assign(PARK);
      });
      const release = () => {
        const r = sqrt(rnd(0)).mul(u.radius);
        const a = rnd(1).mul(Math.PI * 2);
        p.assign(vec3(u.cx.add(r.mul(cos(a))), u.spawnY.add(rnd(2).mul(u.speed).mul(u.dt)), u.cz.add(r.mul(sin(a)))));
        // ⛔ THE CODE DROPS (header): in the last band and over the logo (the cell its hit test will sample: it falls
        // straight down, so it lands there) → code, its column written
        const land = hits.sample(vec2(p.x.sub(u.mapMinX).div(u.mapSizeX), p.z.sub(u.mapMinZ).div(u.mapSizeZ))).r;
        const chosen = u.clock.greaterThanEqual(u.bandFrom).and(land.greaterThan(0));
        cn.assign(select(chosen, float(1), float(0)));
        If(chosen, () => {
          codeCol.element(instanceIndex).assign(vec4(p.x, p.y, p.z, u.clock));
          cs.assign(u.floorY.add(land));
        });
      };
      If(p.y.lessThan(PARK / 2), () => {
        If(live, () => {
          release();
        });
      }).Else(() => {
        // each drop its own speed, ±10% (a fixed share per drop)
        p.y.subAssign(u.speed.mul(hash(i.add(9000000)).mul(0.2).add(0.9)).mul(u.dt));
        const cell = vec2(p.x.sub(u.mapMinX).div(u.mapSizeX), p.z.sub(u.mapMinZ).div(u.mapSizeZ));
        const hitY = u.floorY.add(hits.sample(cell).r).toVar();
        // the streak's FOOT reaches the surface: a splash there; the drop again at the top, or parked
        If(p.y.sub(u.halfLen.mul(lengthVary())).lessThan(hitY), () => {
          sp.assign(vec3(p.x, hitY.add(u.lift), p.z));
          // ⛔ a CODE drop makes no splash (once code, always code: it drains into the logo, `hero-code-drops.ts`)
          st.assign(select(u.splashOn.greaterThan(0.5).and(cn.lessThan(0.5)), float(1), float(1000)));
          splashRnd.element(instanceIndex).assign(rnd(3));
          If(live, () => {
            release();
          }).Else(() => {
            p.assign(vec3(0, PARK, 0));
          });
        });
      });
    })().compute(RAIN_MAX_DROPS);
    step_.setName("hero rain: step");
  };

  // THE DROPS (the example's streak and glow; the colour ours; faded at the disc's rim and over the top of the fall).
  // Take 2: the example's `billboarding` written out here so each drop has its OWN size (`VARY`) — the quad's x along the
  // view's right, its y along the world's up seen from the camera (the streak upright, as the example's)
  // ⛔ THE CODE DROPS (`hero-code-drops.ts`): drawn from the columns the step writes; the rain's own per-drop shares passed
  // in, so a column's head is the drop's foot
  const code = createCodeDrops({
    codeCol,
    codeSurf,
    none: PARK,
    clock: u.clock,
    speed: u.speed,
    halfLen: u.halfLen,
    speedShare: hash(instanceIndex.toFloat().add(9000000)).mul(0.2).add(0.9),
    lengthShare: lengthVary(),
  });
  group.add(code.mesh);
  const dropAt = pos.toAttribute();
  const dropMat = new MeshBasicNodeMaterial();
  // `.xyz`: the storage's vec3 is padded to four on the GPU, so its attribute reads as a vec4
  const centre = cameraViewMatrix.mul(vec4(dropAt.xyz, 1)).xyz;
  const upView = cameraViewMatrix.mul(vec4(0, 1, 0, 0)).xyz;
  const across = vec3(positionLocal.x.mul(u.dropW).mul(vary(1000003, VARY.width)), 0, 0);
  const along = upView.mul(positionLocal.y.mul(u.dropL).mul(lengthVary()));
  dropMat.vertexNode = cameraProjectionMatrix.mul(vec4(centre.add(across).add(along), 1));
  const glow = uv().distance(vec2(0.5, 0)).oneMinus().mul(3).exp().mul(0.1);
  dropMat.colorNode = blue.mul(u.brightness).mul(vary(3000017, VARY.brightness)).mul(glow);
  const rim = float(1).sub(smoothstep(0.65, 1, dropAt.xz.sub(vec2(u.cx, u.cz)).length().div(u.radius)));
  const top = float(1).sub(smoothstep(u.spawnY.sub(u.fadeTop), u.spawnY, dropAt.y));
  // ⛔ a CODE drop's streak goes at its TURN (its foot at or below the turn): from there it is code (`hero-code-drops.ts`)
  const turned = codeNow.element(instanceIndex).mul(code.turned(dropAt.y.sub(u.halfLen.mul(lengthVary()))));
  dropMat.opacityNode = u.opacity.mul(rim).mul(top).mul(float(1).sub(turned));
  dropMat.transparent = true;
  dropMat.depthWrite = false;
  dropMat.depthTest = true;
  dropMat.side = THREE.DoubleSide;
  dropMat.forceSinglePass = true;
  // a unit quad; its width and length are uniforms (`dropW`, `dropL`), so the dials act live
  const dropGeo = new THREE.PlaneGeometry(1, 1);
  const drops = new THREE.Mesh(dropGeo, dropMat);
  drops.name = "hero rain: drops";
  drops.frustumCulled = false;
  drops.count = HERO_RAIN_DEFAULTS.peak;
  group.add(drops);

  // THE SPLASHES (the example's ring and crown, in units of `splashCm`; its 2.5 : 1 : 2 proportions). Our floor is not
  // drawn, so the crown's half BELOW the surface (the example's hid under its opaque floor) is cut away here
  const flat = new THREE.PlaneGeometry(1, 1);
  flat.rotateX(-Math.PI / 2);
  const crownX = new THREE.PlaneGeometry(0.4, 0.8);
  crownX.rotateY(-Math.PI / 2);
  const crownZ = new THREE.PlaneGeometry(0.4, 0.8);
  const splashGeo = mergeGeometries([flat, crownX, crownZ])!;
  flat.dispose();
  crownX.dispose();
  crownZ.dispose();
  const age = splashT.element(instanceIndex);
  const ring = Fn(() => {
    const d = age.sub(uv().sub(0.5).length().mul(7));
    return d.min(1).sub(d.max(1).sub(1)).max(0);
  })();
  const splashMat = new MeshBasicNodeMaterial();
  const splashAt = splashPos.toAttribute();
  // take 2, NOTHING TILES: each splash its own turn about the vertical, size and crown height, from its random (drawn at
  // its hit) — three numbers from one by scaling and keeping the fraction
  const sr = splashRnd.element(instanceIndex);
  const turn = sr.mul(Math.PI * 2);
  const size = sr.mul(97.31).fract().mul(2).sub(1).mul(VARY.splashSize).add(1);
  const crown = sr.mul(53.17).fract().mul(2).sub(1).mul(VARY.crown).add(1);
  const sg = vec3(positionGeometry.x, positionGeometry.y.mul(crown), positionGeometry.z).mul(size).mul(u.splashSize);
  splashMat.positionNode = vec3(sg.x.mul(cos(turn)).sub(sg.z.mul(sin(turn))), sg.y, sg.x.mul(sin(turn)).add(sg.z.mul(cos(turn)))).add(splashAt);
  splashMat.colorNode = blue.mul(u.brightness).mul(ring);
  // faded toward the disc's rim as the drops are (take 1 had a hard-edged oval of splashes on the floor)
  const splashRim = float(1).sub(smoothstep(0.65, 1, splashAt.xz.sub(vec2(u.cx, u.cz)).length().div(u.radius)));
  splashMat.opacityNode = age.mul(0.3).oneMinus().max(0).mul(0.5).mul(u.opacity).mul(splashRim).mul(step(-0.001, positionGeometry.y));
  splashMat.transparent = true;
  splashMat.depthWrite = false;
  splashMat.depthTest = true;
  splashMat.side = THREE.DoubleSide;
  splashMat.forceSinglePass = true;
  const splashes = new THREE.Mesh(splashGeo, splashMat);
  splashes.name = "hero rain: splashes";
  splashes.frustumCulled = false;
  splashes.count = HERO_RAIN_DEFAULTS.peak;
  group.add(splashes);

  // THE CLOCK (header): `t` seconds since the first release (−1 = off); the live count follows the shape
  let t = -1;
  let started = false;
  let active = 0;
  let lastLive = -Infinity;
  let running = false;
  let needsPark = true;
  let weight = 0;
  let leadS = 0;
  let fallS = 0;
  // THE WASH (above): the rain LANDED so far, in seconds at the peak
  let landed = 0;
  // THE CODE DROPS' band on the rain's clock (`codeBandFrom`), null when none
  let codeBand: [number, number] | null = null;

  /**
   * ⛔ THE WASH, TAKE 2 (Carl: *"the wash happens too fast"* → *"lets go with 1"*: the water keeps running after the rain).
   * The rain's own shape (slow in the light opening, fast in the downpour, easing off) STRETCHED over `washSeconds` from
   * the first drops landing — so with a 6 s rain and 9.8 s the last of the red goes ~1.5 s after the last drop (measured; `washSeconds`). Held at the
   * peak (`hold`): the rain landed so far, as take 1 (a held rain has no end to stretch to). Take 1 (the wash = the share
   * of the rain landed, done with the last drop) was ~4.6 s to the last red.
   */
  const washNow = () => {
    if (t < 0) return 0;
    if (settings.hold) return Math.min(1, landed / Math.max(1e-6, shapeArea(settings.light) * settings.seconds));
    return shapeShareBy((t - leadS) / Math.max(0.1, settings.washSeconds), settings.light);
  };
  const stop = () => {
    landed = 0;
    t = -1;
    started = false;
    active = 0;
    lastLive = -Infinity;
    if (running) needsPark = true;
    running = false;
    group.visible = false;
  };

  // ⛔ THE BACKGROUND COMPILE (`hero-steam.ts`, `precompileCompute`; 16 November 2026, session 2): the park and the step
  // compiled before their first dispatch, so three's synchronous compile is a cache hit (the step is built once: `buildStep`)
  let precompiling: Promise<unknown> | null = null;
  let precompile: PrecompileResult | null = null;
  const precompiled = (renderer: WebGPURenderer) => {
    if (precompile) return true;
    if (!precompiling && step_) precompiling = precompileCompute(renderer, [park, step_]).then((r) => (precompile = r));
    return false;
  };

  return {
    group,
    settings,
    setLogo(hit, unitsPerCm) {
      if (map) return;
      upc = unitsPerCm;
      map = hitMap(hit);
    },
    update(delta, sinceLanding) {
      const s = settings;
      if (!map || !s.on) return stop();
      const speed = s.speedCmS * upc;
      const spawnY = floorY + s.heightCm * upc;
      leadS = (spawnY - map.topY) / speed;
      fallS = (spawnY - floorY) / speed;
      // before the early release (or no story, or the story replayed): off
      if (!Number.isFinite(sinceLanding) || sinceLanding < -leadS) return stop();
      if (!started) {
        started = true;
        t = sinceLanding + leadS;
        needsPark = true;
      } else t += delta;
      weight = s.hold ? 1 : weightAt(t / s.seconds, s.light);
      // what LANDS now left the top one fall to the logo earlier (`leadS`)
      const tl = t - leadS;
      if (tl > 0) landed += (s.hold ? 1 : weightAt(tl / s.seconds, s.light)) * delta;
      const target = s.peak * weight;
      active = target < active ? target : Math.min(target, active + (s.peak * delta) / RISE_S);
      if (active >= 1) lastLive = t;
      // drawn while a drop can still be falling or a splash fading (~0.83 s) after the last live drop
      const wasRunning = running;
      running = t <= lastLive + fallS + 1;
      if (wasRunning && !running) needsPark = true;
      group.visible = running;

      u.dt.value = delta;
      u.seed.value = Math.floor(Math.random() * 1e7);
      u.active.value = active;
      u.speed.value = speed;
      u.halfLen.value = (s.lengthCm * upc) / 2;
      u.spawnY.value = spawnY;
      u.fadeTop.value = 0.15 * (spawnY - floorY);
      u.cx.value = map.cx;
      u.cz.value = map.cz;
      u.radius.value = s.radiusCm * upc;
      u.mapMinX.value = map.minX;
      u.mapMinZ.value = map.minZ;
      u.mapSizeX.value = map.sizeX;
      u.mapSizeZ.value = map.sizeZ;
      u.lift.value = 0.05 * upc;
      u.splashOn.value = s.splashes ? 1 : 0;
      u.splashSize.value = s.splashCm * upc;
      u.opacity.value = s.opacity;
      u.brightness.value = s.brightness;
      u.dropW.value = (s.widthMm / 10) * upc;
      u.dropL.value = s.lengthCm * upc;
      // ⛔ THE CODE DROPS: the clock; the band (none while held or off); the columns drawn from the band's start until the
      // last could have drained: one fall after the band's end, plus the code's own slower fall from the highest turn and a
      // whole trail's drain (`speed`, a share of the rain's; the slowest drop 0.9 ×)
      u.clock.value = t;
      codeBand = !s.hold && code.settings.on ? codeBandFrom(s.peak, s.light, s.seconds, fallS, code.settings.band) : null;
      u.bandFrom.value = codeBand ? codeBand[0] : 1e9;
      code.update(upc, Math.ceil(s.peak));
      const cs = code.settings;
      const codeTail = (cs.turnMaxCm + cs.trailMax * cs.glyphCm) / (s.speedCmS * 0.9 * Math.max(0.05, cs.speed));
      code.mesh.visible = !!codeBand && t >= codeBand[0] && t <= codeBand[1] + fallS + codeTail + 0.2;
      drops.count = Math.max(1, Math.ceil(s.peak));
      splashes.count = drops.count;
      splashes.visible = s.splashes;
    },
    compute(renderer) {
      if (!map) return;
      if (!step_) {
        buildStep(map);
        needsPark = true;
      }
      if (!precompiled(renderer)) return;
      if (needsPark) {
        renderer.compute(park);
        needsPark = false;
      }
      // only the peak's drops are stepped (r185: a count given here dispatches that many threads), not all 50,000: at 200
      // drops the full buffer cost ~2 fps on its own (measured, 14 November). Drops past a LOWERED peak stay where they
      // are, undrawn (the draw's count is the peak), until the next run parks them all
      if (running && step_) renderer.compute(step_, Math.max(1, Math.ceil(settings.peak)));
    },
    warm(renderer) {
      if (!map) return;
      if (!step_) {
        buildStep(map);
        needsPark = true;
      }
      // still compiling in the background: nothing to warm (the first dispatch is then a cache hit anyway)
      if (!precompiled(renderer)) return;
      if (needsPark) {
        renderer.compute(park);
        needsPark = false;
      }
      // no drop live and no time passing: every drop stays parked, every splash where it is
      if (running || !step_) return;
      u.active.value = 0;
      u.dt.value = 0;
      renderer.compute(step_, 1);
    },
    again() {
      if (started) {
        landed = 0;
        t = 0;
        active = 0;
      }
    },
    get wash() {
      return washNow();
    },
    get sinceFirstLanding() {
      return t < 0 ? NaN : t - leadS;
    },
    code: code.settings,
    codeMesh: code.mesh,
    get info() {
      if (!map) return null;
      const r = (v: number) => Math.round(v * 100) / 100;
      return {
        t: r(t),
        weight: r(weight),
        active: Math.round(active),
        leadS: r(leadS),
        fallS: r(fallS),
        running,
        wash: r(washNow()),
        codeBand: codeBand ? ([r(codeBand[0]), r(codeBand[1])] as [number, number]) : null,
        map: { ...map.check, minX: r(map.minX), minZ: r(map.minZ), sizeX: r(map.sizeX), sizeZ: r(map.sizeZ), topY: r(map.topY), centre: [r(map.cx), r(map.cz)] as [number, number] },
      };
    },
    dispose() {
      dropGeo.dispose();
      dropMat.dispose();
      splashGeo.dispose();
      splashMat.dispose();
      code.dispose();
      map?.tex.dispose();
    },
  };
}
