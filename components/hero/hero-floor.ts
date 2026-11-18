import * as THREE from "three";
import { MeshBasicNodeMaterial, type Node } from "three/webgpu";
import { exp, exp2, float, floor, fract, max, mix, mx_noise_float, mx_worley_noise_float, positionWorld, select, smoothstep, uniform, vec2, vec3 } from "three/tsl";

/**
 * ⛔ THE FLOOR's HEAT (18 November 2026; D-101). The structural note: `live-work/structural-note-floor-lean-18-november.md`
 * v1.5 (four Architect review rounds). Carl: *"The liquid and logo would provide a heat source and hence the webbed
 * pattern"*; three positions — 1 the leaning logo (left), 2 the landing and the amber liquid (centre, hotter, a bigger
 * area), 3 the solid logo (right, red then blue); every source *"hotter/colder near an object. Further away the heat/cold
 * would disssipate"*. FORM A (Carl): the floor is seen ONLY where heat shows it.
 *
 * WHAT: ONE flat mesh at the floor, ONE unlit ADDITIVE material (black adds nothing: the world stays dark), with
 * `FLOOR_SOURCES` fixed SLOTS (centre on the floor, strength, radius, colour) — later chunks drive the other slots with no
 * new mesh, material or program (note §2).
 *
 * ⛔ CHUNK 1, STEP 1 — THE ROUGH CIRCLE (Carl: *"before you build it i will ask you to draw a rough circle from the leaning
 * logo base"*; the base = THE CONTACT EDGE): per slot, a glow hottest at the centre that dissipates to nothing at a ROUGH
 * radius — the radius wanders with a slow noise of the DIRECTION, sampled at (cos θ, sin θ) so there is no seam at ±π
 * (note [R3]).
 *
 * ⛔ STEP 2 — THE WEBS (Carl, on step 1: *"wheres the webs? It looks nothing like the example video- its just a red
 * glow."*): the example's OWN pattern (`webgpu_lights_projector`, r187): `mx_worley_noise_float(p).pow(2) × 2` — cellular
 * noise, dark at each cell's point, a bright web between — measured on the FLOOR in cm (`cellCm`), × the circle's heat.
 * THE MOTION, EMANATING (note [R3], v1.5: v1.0's radial slide withdrawn — spokes at the centre): a ZOOM out of the source's
 * centre — the pattern sampled at `q / 2^phase`, so every cell grows and travels outward together over `zoomS` (one
 * doubling), no singularity; two copies half a cycle apart, each faded in from and out to nothing (a triangle), joined by
 * the BRIGHTER of the two (max, not the average: the reviewer's [S3] — an average flattens the web mid-way); each cycle a
 * fresh offset, so the pattern never repeats. The clock is the scene's (`update`'s delta), so a frame-stepped film moves
 * exactly as live playback.
 *
 * The values are TAKES (the bench's Heat floor folder).
 */
export type HeroFloorSettings = {
  /** the floor's heat drawn at all */
  on: boolean;
  /** the glow at the centre, AS SEEN (0–1 of the colour on screen; see `visible` below) */
  strength: number;
  /** the rough circle's radius (cm) — slot 1's (the leaning logo's) */
  radiusCm: number;
  /** how quickly it dissipates toward the rim: 1 = evenly, higher = held near the object, then gone */
  falloff: number;
  /** the rim's wander, a share of the radius (0 = a true circle) */
  roughness: number;
  /** the rim's wander: how many bumps around it (higher = more, smaller) */
  lobes: number;
  /** the heat's colour (the family red; a take, judged against the logo's `#9c0000`) */
  colour: string;
  /** ⛔ THE WEBS (step 2): a cell's size on the floor (cm) */
  cellCm: number;
  /** ⛔ THE RADIAL MASK (Carl, 18 November 2026): the soft band of its moving edge, a share of the radius */
  maskEdge: number;
  /** ⛔ SOURCE 2, THE AMBER LIQUID (Carl, 18 November 2026: *"we can infer that the amber liquid has some heat. Not as much
   *  as the logo though. When touchdown happens some effect can be seen on the floor from the amber liquid. The logo breaks
   *  down and when the first blob hits the liquid this supercharges it. It can spread outwards. The speed can be the same
   *  but it will be longer given its larger area."*): its strength (as seen, × `strength`) under the disc from touchdown —
   *  less than the logo's 1 */
  liquidStrength: number;
  /** … how far its web reaches beyond the disc before the supercharge, × the disc's radius (the web under the disc itself
   *  is hidden: the disc's top sits ~3 cm above the floor — measured on take 1, nothing seen until the first blob; at 1.8×
   *  (~77 cm by the first blob) it lay under the blobs' cluster, seen from above only as a fringe — so 3×) */
  liquidReach: number;
  /** … once SUPERCHARGED by the first blob reaching the disc (> 1: hotter than the logo) */
  chargedStrength: number;
  /** … the supercharge's rise (s) */
  chargeS: number;
  /** … the supercharged area's radius (cm; larger than the logo's) — it spreads to it at the LOGO's speed (`radiusCm` over
   *  the lean's spread time), so it takes longer */
  chargedRadiusCm: number;
  /** … its colour (a bit more red than the logo's) */
  liquidColour: string;
  /** ⛔ THE RAIN COOLS THE FLOOR (Carl, 18 November 2026: *"the rain falls in an almost circular area. the rain woukd make
   *  the red inside this area turn blue almost right away. At the extremity, it would be slower."*): the cold colour (the
   *  same web and strength, only blue) */
  coldColour: string;
  /** … the cooling rate where the rain falls (per second; ~95% blue after 3 / rate) */
  rainCoolIn: number;
  /** … the cooling rate just outside the rain's area (per second), falling away with distance */
  rainCoolOut: number;
  /** … how far beyond the rain's area the outside cooling halves… (cm, an e-folding distance) */
  rainEdgeCm: number;
  /** the web's contrast — the noise's power (1 = r185's example, 2 = r187's, today's threejs.org) */
  contrast: number;
  /** the web's brightness (the example's × 2) */
  webGain: number;
  /** the outward drift: seconds for the pattern to double in size (lower = faster) */
  zoomS: number;
};
// take 2's scale (18 November 2026): the example's lit patch is ~2× the statue's height across, its cells ~1/5 of it —
// against the 2 m logo, a 110 cm radius and 22 cm cells, held toward the rim (fall-off 0.7). ⛔ RADIUS 250 cm — Carl, 18
// November 2026, on the bench (three screenshots: Home, above, oblique): *"the default radius should be 250"*
export const HERO_FLOOR_DEFAULTS: HeroFloorSettings = { on: true, strength: 0.9, radiusCm: 250, falloff: 0.7, roughness: 0.16, lobes: 1.3, colour: "#c4260a", cellCm: 22, maskEdge: 0.15, liquidStrength: 0.5, liquidReach: 3, chargedStrength: 1.4, chargeS: 0.5, chargedRadiusCm: 350, liquidColour: "#c81400", coldColour: "#3a78d8", rainCoolIn: 4, rainCoolOut: 0.5, rainEdgeCm: 80, contrast: 2, webGain: 2.5, zoomS: 4 };

/** the fixed slots: 1 the leaning logo, 2 the landing and the liquid, 3 the solid logo (note §2) */
export const FLOOR_SOURCES = 3;

/** a slot as the scene sets it each frame: its centre on the floor (world x, z), its strength (0–1, as seen) and its
 *  EXTENT — ⛔ THE RADIAL MASK (Carl, 18 November 2026): the share of the rough radius shown, from the centre out (0 = none,
 *  1 = the whole web). Opening it 0 → 1 reveals the web INSIDE OUT; closing it 1 → 0 takes the EXTREMITY first */
export type FloorSource = { x: number; z: number; strength: number; extent: number; radiusCm?: number; colour?: string; coolable?: boolean };
/** the rain as the floor needs it: its centre (world x, z), its radius (cm) and the seconds since its first drops landed
 *  (negative or NaN = not yet) */
export type FloorRain = { x: number; z: number; radiusCm: number; sinceFirstLanding: number };

export type HeroFloorInfo = { visible: boolean; strengths: number[]; extents: number[]; addedLevels: number; centre: number[] | null };

export type HeroFloor = {
  mesh: THREE.Mesh;
  settings: HeroFloorSettings;
  /** slot `i` this frame (the scene's story clock decides the strength) */
  setSource(i: number, s: FloorSource | null): void;
  /** after the slots are set: sizes the mesh over the live circles and HIDES it when nothing it adds can be seen;
   *  `ready` = its program has been built (the warm-up) — before that it is never drawn (note [R6]); `unitsPerCm` the
   *  scene's (from the baked text) */
  update(ready: boolean, unitsPerCm: number, delta: number, rain?: FloorRain | null): void;
  readonly info: HeroFloorInfo;
  dispose(): void;
};

/** sRGB (0–1) of a linear value, for the hide test */
const toSRGB = (l: number) => (l <= 0.0031308 ? 12.92 * l : 1.055 * Math.pow(l, 1 / 2.4) - 0.055);

export function createHeroFloor(floorY: number): HeroFloor {
  const settings: HeroFloorSettings = { ...HERO_FLOOR_DEFAULTS };
  const slots = Array.from({ length: FLOOR_SOURCES }, (_, i) => ({
    centre: uniform(new THREE.Vector2()),
    // the LINEAR multiplier (`setSource` converts the as-seen strength)
    gain: uniform(0),
    radius: uniform(1),
    extent: uniform(0),
    coolable: uniform(0),
    colour: uniform(new THREE.Color(settings.colour)),
    seed: 17.3 * (i + 1),
    live: null as FloorSource | null,
  }));
  const u = {
    // the rain (`update`): centre, radius (units), clock (s; −1 = none), rates, the edge's distance (units), the cold colour
    rainCentre: uniform(new THREE.Vector2()),
    rainRadius: uniform(1),
    rainT: uniform(-1),
    coolIn: uniform(settings.rainCoolIn),
    coolOut: uniform(settings.rainCoolOut),
    edge: uniform(1),
    coldColour: uniform(new THREE.Color(settings.coldColour)),
    maskEdge: uniform(settings.maskEdge),
    falloff: uniform(settings.falloff),
    roughness: uniform(settings.roughness),
    lobes: uniform(settings.lobes),
    // the webs: the scene's clock (s), a cell in units, contrast, brightness, the zoom's period
    clock: uniform(0),
    cell: uniform(1),
    contrast: uniform(settings.contrast),
    webGain: uniform(settings.webGain),
    zoomS: uniform(settings.zoomS),
  };
  // the zoom's two copies (phase 0–1, half a cycle apart) and each one's cycle count (a fresh offset each cycle)
  const cycles = u.clock.div(u.zoomS);
  const copies = [cycles, cycles.add(0.5)].map((c, k) => ({ phase: fract(c), n: floor(c), k }));

  // the glow, summed over the slots (additive: their sum is order-free)
  const p = vec2(positionWorld.x, positionWorld.z);
  // ⛔ THE RAIN's COLD, per point of the floor (Carl): where the rain falls — its density, as the drops fade at its rim
  // (`hero-rain.ts`: 1 − smoothstep(0.65, 1, d / R)) — it cools fast (`coolIn`); outside, slower (`coolOut`), falling away
  // with distance beyond the area (`edge`). Coldness = 1 − e^(−rate · t) on the rain's own clock: 0 before the first drops
  const dRain = p.sub(u.rainCentre).length();
  const density = float(1).sub(smoothstep(u.rainRadius.mul(0.65), u.rainRadius, dRain));
  const rate = u.coolIn.mul(density).add(u.coolOut.mul(exp(max(dRain.sub(u.rainRadius), float(0)).div(u.edge).negate())));
  const cold = select(u.rainT.greaterThan(0), float(1).sub(exp(rate.mul(u.rainT).negate())), float(0));
  let sum: Node<"vec3"> = vec3(0, 0, 0);
  for (const s of slots) {
    const d = p.sub(s.centre);
    const dist = d.length();
    // the direction as (cos θ, sin θ): the rim's noise has no seam
    const dir = d.div(max(dist, float(1e-3)));
    const wander = mx_noise_float(dir.mul(u.lobes).add(vec2(s.seed, s.seed * 0.37)));
    const r = s.radius.mul(float(1).add(wander.mul(u.roughness)));
    // hottest at the centre, dissipating to nothing at the rough rim
    // ⛔ THE RADIAL MASK (Carl): shown inside `extent` of the same rough radius, its edge a soft band (`maskEdge`) — so the
    // receding or advancing edge is as rough as the rim
    const edge = r.mul(s.extent);
    const mask = float(1).sub(smoothstep(edge.sub(r.mul(u.maskEdge)), edge, dist));
    const heat = float(1).sub(smoothstep(float(0), r, dist)).pow(u.falloff).mul(mask);
    // THE WEBS (step 2): the example's cellular pattern, zooming out of the centre (above)
    const q = d.div(u.cell);
    let web: Node<"float"> = float(0);
    let wMax: Node<"float"> = float(1e-4);
    for (const c of copies) {
      const w = float(1).sub(c.phase.mul(2).sub(1).abs());
      const off = vec2(c.n.mul(7.13).add(s.seed + 31 * c.k), c.n.mul(3.71).add(s.seed * 0.53 + 11 * c.k));
      const cellular = mx_worley_noise_float(q.div(exp2(c.phase)).add(off)).pow(u.contrast).mul(u.webGain);
      web = max(web, cellular.mul(w));
      wMax = max(wMax, w);
    }
    web = web.div(wMax);
    // the slot's colour, turned to the cold colour by the rain where it is coolable (the solid logo's)
    const tint = mix(s.colour, u.coldColour, cold.mul(s.coolable));
    sum = sum.add(tint.mul(heat.mul(web).mul(s.gain)));
  }
  const material = new MeshBasicNodeMaterial();
  material.name = "hero floor heat";
  material.colorNode = sum;
  material.transparent = true;
  material.blending = THREE.AdditiveBlending;
  material.depthWrite = false;
  material.toneMapped = false;
  // ONE plane, sized each frame over the live circles (`update`) — only those pixels pay for it
  const geometry = new THREE.PlaneGeometry(1, 1);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "hero floor heat (the floor's own glow)";
  mesh.rotation.x = -Math.PI / 2;
  // ⛔ FIRST among the transparents (note [R8]): it lies under everything, so the rain, the steam and the logo's fade
  // layers (orders 1, 2) always composite over it and never swap order as the camera moves
  mesh.renderOrder = -1;
  mesh.visible = false;
  mesh.frustumCulled = false;
  // a hair above the floor (the blobs' glow sits at +0.5 too: both additive, order-free)
  mesh.position.y = floorY + 0.5;

  let info: HeroFloorInfo = { visible: false, strengths: slots.map(() => 0), extents: slots.map(() => 0), addedLevels: 0, centre: null };

  return {
    mesh,
    settings,
    setSource(i, s) {
      slots[i].live = s;
    },
    update(ready, unitsPerCm, delta, rain) {
      u.coldColour.value.set(settings.coldColour);
      u.coolIn.value = settings.rainCoolIn;
      u.coolOut.value = settings.rainCoolOut;
      u.edge.value = Math.max(1, settings.rainEdgeCm) * unitsPerCm;
      if (rain && Number.isFinite(rain.sinceFirstLanding)) {
        u.rainCentre.value.set(rain.x, rain.z);
        u.rainRadius.value = Math.max(1, rain.radiusCm) * unitsPerCm;
        u.rainT.value = rain.sinceFirstLanding;
      } else u.rainT.value = -1;
      u.clock.value += delta;
      u.cell.value = Math.max(0.1, settings.cellCm) * unitsPerCm;
      u.contrast.value = settings.contrast;
      u.webGain.value = settings.webGain;
      u.zoomS.value = Math.max(0.2, settings.zoomS);
      u.falloff.value = settings.falloff;
      u.maskEdge.value = settings.maskEdge;
      u.roughness.value = settings.roughness;
      u.lobes.value = settings.lobes;
      let minX = Infinity;
      let maxX = -Infinity;
      let minZ = Infinity;
      let maxZ = -Infinity;
      let added = 0;
      const strengths: number[] = [];
      for (const s of slots) {
        const live = s.live;
        const extent = live ? Math.max(0, Math.min(1, live.extent)) : 0;
        s.extent.value = extent;
        // (the mask's edge carries a soft band: at extent 0 nothing is shown)
        // (as seen; up to 2 — a source hotter than the logo, the supercharged liquid, may pass 1)
        const seen = live && settings.on && extent > 0 ? Math.max(0, Math.min(2, live.strength * settings.strength)) : 0;
        strengths.push(Math.round(seen * 1000) / 1000);
        // ⛔ THE STRENGTH IS AS SEEN: the screen shows sRGB, so the linear gain is the seen share's ~2.2 power — the
        // cooling's curve is then the curve on the screen (half gone means half as bright TO THE EYE)
        s.gain.value = Math.pow(seen, 2.2);
        s.colour.value.set(live?.colour ?? settings.colour);
        s.coolable.value = live?.coolable ? 1 : 0;
        const slotReach = (live?.radiusCm ?? settings.radiusCm) * unitsPerCm;
        s.radius.value = slotReach;
        if (!live || seen <= 0) continue;
        s.centre.value.set(live.x, live.z);
        // the brightest added pixel (at the centre), in 8-bit levels on screen
        // (the web's brightest is ~`webGain`: its noise peaks near 1)
        const c = s.colour.value;
        added = Math.max(added, 255 * toSRGB(Math.min(1, s.gain.value * settings.webGain * Math.max(c.r, c.g, c.b))));
        const rim = slotReach * (1 + settings.roughness) * 1.05;
        minX = Math.min(minX, live.x - rim);
        maxX = Math.max(maxX, live.x + rim);
        minZ = Math.min(minZ, live.z - rim);
        maxZ = Math.max(maxZ, live.z + rim);
      }
      // ⛔ HIDDEN when nothing it adds can be seen — the brightest pixel under ONE 8-bit level (note [S1][T2]): then every
      // later draw is exactly today's; hiding a built mesh does not rebuild it. Never drawn before the warm-up ([R6]).
      const visible = ready && added >= 1;
      mesh.visible = visible;
      if (visible) {
        mesh.position.set((minX + maxX) / 2, floorY + 0.5, (minZ + maxZ) / 2);
        // the plane lies flat (rotated about x): its local y is world −z
        mesh.scale.set(maxX - minX, maxZ - minZ, 1);
      }
      const first = slots[0].live;
      info = { visible, strengths, extents: slots.map((s) => Math.round(s.extent.value * 1000) / 1000), addedLevels: Math.round(added * 10) / 10, centre: first ? [Math.round(first.x * 100) / 100, Math.round(first.z * 100) / 100] : null };
    },
    get info() {
      return info;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
