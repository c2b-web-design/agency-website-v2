import * as THREE from "three";
import { LineBasicNodeMaterial, MeshPhysicalNodeMaterial, type Node, SpriteNodeMaterial, type WebGPURenderer } from "three/webgpu";
import { attribute, cross, float, Fn, If, instancedArray, instanceIndex, lights, Loop, max, min, neutralToneMapping, output, Return, select, texture, transformNormalToView, triNoise3D, uniform, vec2, vec3, vec4 } from "three/tsl";
import { UltraHDRLoader } from "three/addons/loaders/UltraHDRLoader.js";
import { precompileCompute, type PrecompileResult } from "./hero-steam";

/**
 * ⛔ PHASE 3, THE CLOTH — STEP 1: THREE's `webgpu_compute_cloth` EXACTLY AS IT IS (20 November 2026; D-101). Carl: *"I want
 * you to build it on the page exactly as it is. The same angle. sphere included - exactly the same. Then we will look at it
 * and modify it and make it our own. Build it here, behind the logo. Make sure that the bottom of the cloth is clear of the
 * logos height."* The example's source read whole at r185 (ours) and on threejs.org (r187: one change, `0.000001` →
 * `EPSILON`, the same value's role) — the homework is in D-101.
 *
 * TRANSCRIBED UNCHANGED: the 31 × 31 Verlet grid (1 × 1, starting FLAT and horizontal at y 0.5, falling to hang from the 7
 * PINNED top points, every 5th); the springs (structural + both diagonals; the bending ones left commented, as there); the
 * two compute passes a step (spring forces; then each point: damping 0.99, its springs, gravity 0.00005, the triNoise
 * WIND along −z, the SPHERE pushing out what would end inside it); 360 steps a second; the sphere (r 0.15, drawn at 0.95)
 * on its path `(sin(2.1 t) × 0.1, 0, sin(0.8 t))`; the drawn mesh (30 × 30, each vertex the centre of four points, its
 * normal from them); the material (`MeshPhysicalNodeMaterial` #204080, opacity 0.85 — now OPAQUE, 20 November session 2 —, DoubleSide, sheen 1 white, sheen
 * roughness 0.5, roughness 1); the sphere's (`MeshStandardNodeMaterial`, defaults); the environment (Royal Esplanade 2k,
 * the example's own file, `public/hero-bench/`); Neutral tone mapping at exposure 1; the wireframe helpers. All in the
 * example's OWN units, inside one group.
 *
 * WHAT HAD TO DIFFER, STATED:
 *  - PLACED (`CLOTH_PLACE`): the group sits at Carl's camera TARGET (his bench pose, 20 November 14:57), turned about the
 *    VERTICAL so his camera looks at it along the example's own direction, and scaled so it fills his frame as the
 *    example's fills its page (his distance × tan(22.5°) over the example's × tan(20°): his lens 45°, the example's 40°).
 *    Only a turn about the vertical and one scale: gravity stays straight down. ⚠ His camera pitches ~10° down; the
 *    example's is level — not compensated (tilting the group would tilt gravity).
 *    ⛔ TAKE 2 (Carl, the same day, from Home): FACE ON with the logo, centred on its axis, still behind it, its BLUE side
 *    (the side the example's camera sees) to the front — turned 180° about the vertical; the same height, depth and scale.
 *  - CLEAR OF THE LOGO: at rest the cloth's bottom hangs at ~y 107 (world; `clothBottomY`, an estimate); ⚠ MEASURED (20
 *    November, `live-work/scripts/hero-cloth-clearance-20-november.mjs`, the points read back over 20 s, 2½ of the sphere's
 *    passes): its LOWEST point reaches y 63.8 while the sphere drags it, against the landed logo's top at y 20.71 — clear by
 *    43 units = 9.8 cm. The estimate (~20 cm) was the hanging cloth's, not the dragged one's.
 *  - THE CLOCK: the steps run on the bench's/story's time (`update`), so frame-stepped films step it exactly; the example
 *    caps a frame's time at 1/60 s (below 60 fps it runs slower than real time) — identical at 60 fps. The wind's noise
 *    reads the simulation's own clock (the example reads three's `time`, the renderer's: the same at 60 fps).
 *  - LIT ONLY BY ITS ENVIRONMENT: the example has no lights; here each material has an EMPTY light list (`lights([])`) so
 *    the hero's key, ambient and orange light do not touch it. The environment is the material's own (`envMap`); the
 *    page's black background is unchanged (the example's is the blurred HDR). The tone mapping is the material's own
 *    (`outputNode`; the renderer has none), the hero's own pattern (the cooled logo's ACES).
 *  - Its environment map PREFILTERED IN THE DARK with the scene's others (`hero-scene.ts`, the primer; `envReady`).
 *
 * ⚰️ THE SPHERE — DELETED (Carl, 20 November 2026, from Home: *"The sphere has done its job. we have seen how it interacts
 * with the cloth. There is no need for it now. It can be deleted."*): the example's test object removed whole — the mesh,
 * its collision in the vertex step (a point that would end inside it was pushed out to its surface: `sphereRadius −
 * |p + f − c|`, clamped at 0, along the radius), its path (`(sin 2.1t × 0.1, mid-height, sin 0.8t)`, one position a step),
 * its toggle. Everything said of it above is history; the cloth now hangs from its pins in the wind.
 */

export const CLOTH_ENV_SRC = "/hero-bench/royal_esplanade_2k.hdr.jpg";

/**
 * ⛔ THE PLACE (header): from Carl's bench pose (position −475.4, 321.4, −397.8; target 53, 229.6, −329.4; fov 45) and the
 * example's camera (position −1.6, −0.1, −1.6; target 0, −0.1, 0; fov 40).
 */
const CARL = { position: new THREE.Vector3(-475.4, 321.4, -397.8), target: new THREE.Vector3(53, 229.6, -329.4), fov: 45 };
const EXAMPLE = { position: new THREE.Vector3(-1.6, -0.1, -1.6), target: new THREE.Vector3(0, -0.1, 0), fov: 40 };
const toRad = THREE.MathUtils.degToRad;
/** take 4: the pins' height, world y (header of the bigger cloth, below) */
const PINS_Y = 760;
const UNITS_PER_CM = 4.41; // the hero's world (D-101, 11 November: 1 cm = 4.41 units)
/**
 * ⛔ PASS 1, FORWARD — THE CLOTH MOVED BACK, OUT OF THE WAY (20 November 2026, session 2; Carl: *"Move the cloth back, out of the
 * way and have the logo jump up and down"*): its plane `CLOTH_BACK_CM` behind the logo's centre (z −16.92). MEASURED first
 * (`live-work/scripts/hero-cloth-depth-20-november.mjs`, 25 s after settling): the hanging cloth swings up to 46.5 cm IN FRONT
 * of its plane and ~0 behind it; the logo's back face is 3.8 cm behind its centre (7.6 cm thick) → 46.5 + 3.8 + ~10 cm of air.
 * The cloth's place for the FORWARD action's start (its path not built). Unasserted: one run's swing — the wind is random.
 */
export const CLOTH_BACK_CM = 60;
export const CLOTH_PLACE = (() => {
  const dc = CARL.target.clone().sub(CARL.position);
  const de = EXAMPLE.target.clone().sub(EXAMPLE.position);
  const scale = (dc.length() * Math.tan(toRad(CARL.fov / 2))) / (de.length() * Math.tan(toRad(EXAMPLE.fov / 2)));
  // ⚰️ take 1 turned it so Carl's camera looked along the example's direction:
  //   turn = setFromUnitVectors(flat(de), flat(dc)); position = CARL.target − turn(EXAMPLE.target × scale)
  // ⛔ TAKE 2 (Carl, 20 November 2026, from Home: *"put it face on with the logo, still behind it but we need to see the width
  // of the cloth in relation to the logo. Turn it arouknd as well fo the blu/purple side is facing front."*): the cloth's plane
  // PARALLEL to the logo's face, centred on the logo's vertical axis (x 718.48, the orbit's, 16 November), at take 1's height
  // and depth behind it (z −329.4, ~71 cm behind the logo's centre at z −16.92), the same scale. TURNED 180° about the
  // vertical: the side the example's camera sees — local −z, the drawn normal's side (`cross(+x, down)`) — now faces +z,
  // the front (Home)
  const turn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
  // ⛔ TAKE 3 (Carl, the same day: *"for now you can put the cloth directly above the logo"*): over the logo's own plane — its
  // centre z −16.92 (the orbit's axis, 16 November) — not behind it; the height unchanged (take 2's depth was z −329.4)
  // ⛔ TAKE 4, THE BIGGER CLOTH (below): its PINS at world y `PINS_Y` (the pins sit at the example's y 0.5)
  // ⛔ PASS 1 (`CLOTH_BACK_CM`, above): moved straight back from over the logo's plane
  const position = new THREE.Vector3(718.48, PINS_Y - 0.5 * scale, -16.92 - CLOTH_BACK_CM * UNITS_PER_CM);
  return { position, turn, scale };
})();

/**
 * ⛔ TAKE 4 — THE CLOTH BIGGER (20 November 2026; Carl, choosing (B) over more passes: *"B is the best way to go. make the
 * cloth bigger"*). The logo's face is ~192 × 104 cm; the example's cloth here was ~62 cm square (1 unit × `scale`). Now
 * `SIZE_CM` (covering the face in ONE pass, ~19 cm spare each side) at the EXAMPLE's POINT SPACING (30 segments a unit,
 * ~2.06 cm): the same fabric, more of it — every per-point rule (springs, damping, gravity, wind, the sphere) unchanged.
 * The sphere (the example's test object, unchanged in size and path) now swings at the cloth's MID-HEIGHT, where the
 * example's swings (its y 0 is its cloth's middle). The pins: the example's rule (every 5th top point) — 23 along the top.
 * `PINS_Y`: high enough that the longer cloth, hanging and dragged, stays CLEAR of the logo's top (y 20.71) — measured
 * after (`live-work/scripts/hero-cloth-clearance-20-november.mjs`).
 */
// `UNITS_PER_CM`: moved above `CLOTH_PLACE` (20 November 2026, session 2), which now reads it
const SIZE_CM = { width: 230, height: 130 } as const;
const SEGS_PER_UNIT = 30; // the example's: 30 segments across its 1-unit cloth
const CLOTH = (() => {
  const width = (SIZE_CM.width * UNITS_PER_CM) / CLOTH_PLACE.scale;
  const height = (SIZE_CM.height * UNITS_PER_CM) / CLOTH_PLACE.scale;
  return { width, height, segX: Math.round(width * SEGS_PER_UNIT), segY: Math.round(height * SEGS_PER_UNIT), stepsPerSecond: 360 } as const;
})();
/** the hanging cloth's bottom at rest, world y (the pins at 0.5, ~1.05 of its length below: an ESTIMATE — measure) */
export const clothBottomY = CLOTH_PLACE.position.y + (0.5 - 1.05 * CLOTH.height) * CLOTH_PLACE.scale;

export type HeroClothSettings = {
  /** the cloth at all (not the example's: the bench's) */
  on: boolean;
  /** the example's GUI */
  wireframe: boolean;
  wind: number;
  /** ⛔ the gusts' size, × the cloth's (1 = one gust across the whole cloth, the example's look; Carl, 20 November) */
  gustSize: number;
  stiffness: number;
  color: string;
  roughness: number;
  sheen: number;
  sheenRoughness: number;
  sheenColor: string;
  /** ⛔ THE COLLISION with the logo (`setCollider`; 20 November 2026, session 2) */
  collide: boolean;
  /** how close a point may come to the logo's surface, cm (the cloth's points are ~2 cm apart) */
  marginCm: number;
  /** 0 = slides freely over the metal; 1 = sticks where it touches */
  friction: number;
};
/** the example's values */
export const HERO_CLOTH_DEFAULTS: HeroClothSettings = {
  on: true,
  wireframe: false,
  wind: 1.0,
  gustSize: 1,
  stiffness: 0.2,
  // ⛔ C, ULTRAMARINE (Carl, 20 November 2026: *"lets try it with C"*): opposite the gold (#FFE39E, ~43° → ~223°), mid
  // lightness to hold against the dark, more saturated and a touch more violet (233°) than the wet logo's platinum blue
  // (#3F6DB8, 217°) so the two do not run together where they touch. Was the example's #204080 (220°: the wet logo's hue)
  color: "#2E3FC8",
  roughness: 1,
  sheen: 1,
  sheenRoughness: 0.5,
  sheenColor: "#ffffff",
  collide: true,
  // ⛔ 1.5 → 3.5 (Carl, 20 November 2026, session 2: *"set to 3.5  smaller creases, if they happen do so when the logo jumps
  // back. Because of the cloths distance to travel and logo contact they always iron out."*): at 1.5 the hem folded under
  // round the logo's top edge and the fold LOCKED (0 → 17 flipped cells after one pass, surviving resets); at 3 none in six
  // frame-stepped passes, one live that undid itself (`live-work/scripts/hero-cloth-folds-20-november.mjs`)
  marginCm: 3.5,
  friction: 0.3,
};

export type HeroCloth = {
  group: THREE.Group;
  settings: HeroClothSettings;
  /** the example's environment, loaded (for the scene's primer) */
  envReady: Promise<THREE.Texture>;
  /** the bench's/story's delta: accumulates the steps' time */
  update(delta: number): void;
  /** the steps due, on the GPU (before the draw) */
  compute(renderer: WebGPURenderer): void;
  /** from the start again: flat, falling to hang */
  again(): void;
  /** ⛔ THE HAND (`setHand`, below): the pins' offset from their place, cm toward the camera (world +z), for the next steps */
  setHand(zCm: number): void;
  /** ⛔ THE COLLIDER (the collision, below): the logo's flat distance field and its frame, once */
  setColliderShape(shape: ClothColliderShape): void;
  /** the logo's pose for the next steps: its local (cm) from WORLD (the inverse of its world matrix); null = no collider */
  setCollider(worldToLogo: THREE.Matrix4 | null): void;
  /** a READ-OUT for checks: the collider's shape once given (null before) */
  readonly collider: ClothColliderShape | null;
  readonly info: { steps: number; simTime: number; precompiled: boolean; bottomY: number; scale: number; points: number; springs: number; grid: [number, number] };
  /** a READ-OUT for checks: the points' storage (961 × vec3, the example's units; `group`'s matrix to world) */
  readonly points: THREE.BufferAttribute;
  dispose(): void;
};

/** the logo's shape for the collision: its flat distance field (`hero-maps.worker.ts`, `inkSdfData`) on its face (local x,
 *  y, cm) and its depth (local z, cm) */
export type ClothColliderShape = { tex: THREE.Texture; minX: number; minY: number; sizeX: number; sizeY: number; zMin: number; zMax: number };

type V = { id: number; position: THREE.Vector3; isFixed: boolean; springIds: number[] };
type S = { id: number; vertex0: V; vertex1: V };

export function createHeroCloth(): HeroCloth {
  const settings: HeroClothSettings = { ...HERO_CLOTH_DEFAULTS };
  const group = new THREE.Group();
  group.name = "hero cloth (the example)";
  group.position.copy(CLOTH_PLACE.position);
  group.quaternion.copy(CLOTH_PLACE.turn);
  group.scale.setScalar(CLOTH_PLACE.scale);
  // hidden until its environment is in (unlit otherwise: it has no lights)
  group.visible = false;

  // ── setupVerletGeometry (the example's) ──
  const verletVertices: V[] = [];
  const verletSprings: S[] = [];
  const verletVertexColumns: V[][] = [];
  const addVerletVertex = (x: number, y: number, z: number, isFixed: boolean) => {
    const vertex: V = { id: verletVertices.length, position: new THREE.Vector3(x, y, z), isFixed, springIds: [] };
    verletVertices.push(vertex);
    return vertex;
  };
  const addVerletSpring = (vertex0: V, vertex1: V) => {
    const spring: S = { id: verletSprings.length, vertex0, vertex1 };
    vertex0.springIds.push(spring.id);
    vertex1.springIds.push(spring.id);
    verletSprings.push(spring);
    return spring;
  };
  for (let x = 0; x <= CLOTH.segX; x++) {
    const column: V[] = [];
    for (let y = 0; y <= CLOTH.segY; y++) {
      const posX = x * (CLOTH.width / CLOTH.segX) - CLOTH.width * 0.5;
      const posZ = y * (CLOTH.height / CLOTH.segY);
      const isFixed = y === 0 && x % 5 === 0; // make some of the top vertices' positions fixed
      column.push(addVerletVertex(posX, CLOTH.height * 0.5, posZ, isFixed));
    }
    verletVertexColumns.push(column);
  }
  for (let x = 0; x <= CLOTH.segX; x++) {
    for (let y = 0; y <= CLOTH.segY; y++) {
      const vertex0 = verletVertexColumns[x][y];
      if (x > 0) addVerletSpring(vertex0, verletVertexColumns[x - 1][y]);
      if (y > 0) addVerletSpring(vertex0, verletVertexColumns[x][y - 1]);
      if (x > 0 && y > 0) addVerletSpring(vertex0, verletVertexColumns[x - 1][y - 1]);
      if (x > 0 && y < CLOTH.segY) addVerletSpring(vertex0, verletVertexColumns[x - 1][y + 1]);
      // You can make the cloth more rigid by adding more springs between further apart vertices (the example's, commented)
    }
  }

  // ── setupVerletVertexBuffers / setupVerletSpringBuffers (the example's) ──
  const vertexCount = verletVertices.length;
  const springListArray: number[] = [];
  const vertexPositionArray = new Float32Array(vertexCount * 3);
  const vertexParamsArray = new Uint32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i++) {
    const vertex = verletVertices[i];
    vertexPositionArray[i * 3] = vertex.position.x;
    vertexPositionArray[i * 3 + 1] = vertex.position.y;
    vertexPositionArray[i * 3 + 2] = vertex.position.z;
    vertexParamsArray[i * 3] = vertex.isFixed ? 1 : 0;
    if (!vertex.isFixed) {
      vertexParamsArray[i * 3 + 1] = vertex.springIds.length;
      vertexParamsArray[i * 3 + 2] = springListArray.length;
      springListArray.push(...vertex.springIds);
    }
  }
  const vertexPositionBuffer = instancedArray(vertexPositionArray, "vec3").setPBO(true);
  // ⛔ THE HAND (header of `setHand`): each point's place as built — read by the PINNED points only, which are SET to it + the hand
  const pinStartBuffer = instancedArray(vertexPositionArray.slice(), "vec3");
  const vertexForceBuffer = instancedArray(vertexCount, "vec3");
  const vertexParamsBuffer = instancedArray(vertexParamsArray, "uvec3");
  const springListBuffer = instancedArray(new Uint32Array(springListArray), "uint").setPBO(true);
  const springCount = verletSprings.length;
  const springVertexIdArray = new Uint32Array(springCount * 2);
  const springRestLengthArray = new Float32Array(springCount);
  for (let i = 0; i < springCount; i++) {
    const spring = verletSprings[i];
    springVertexIdArray[i * 2] = spring.vertex0.id;
    springVertexIdArray[i * 2 + 1] = spring.vertex1.id;
    springRestLengthArray[i] = spring.vertex0.position.distanceTo(spring.vertex1.position);
  }
  const springVertexIdBuffer = instancedArray(springVertexIdArray, "uvec2").setPBO(true);
  const springRestLengthBuffer = instancedArray(springRestLengthArray, "float");
  const springForceBuffer = instancedArray(springCount * 3, "vec3").setPBO(true);

  // ── setupUniforms (the example's; + the simulation's clock for the wind, header) ──
  const dampeningUniform = uniform(0.99);
  const windUniform = uniform(1.0);
  const stiffnessUniform = uniform(0.2);
  const simTimeUniform = uniform(0);
  // the gusts' size (example units; `gustSize` × the cloth's width and height: the wind, below)
  const gustX = uniform(1);
  const gustY = uniform(1);
  /** ⛔ THE HAND: the pins' offset along the cloth's local z (example units; `setHand`) */
  const handUniform = uniform(0);
  /**
   * ⛔ THE COLLISION (20 November 2026, session 2; `live-work/structural-note-cloth-collision-20-november.md`). The logo is an
   * EXTRUSION, so its 3D distance is its FLAT field (the face's outline, `inkSdfData`) combined with its DEPTH (local z):
   * the box-style union |max(q, 0)| + min(max(q.x, q.y), 0), q = (flat, depth). Each free point, after its step, is taken
   * into the logo's frame (`toLogo`, this step's pose, interpolated across the frame's steps like the hand); if it is
   * nearer than the MARGIN it is pushed out along the field's slope (central differences, 0.5 cm), its speed INTO the
   * logo removed and its sliding slowed by FRICTION. One way: the logo pushes the cloth, never the reverse (its moves are
   * authored). The logo's own speed is not given to the cloth: a point it meets is pushed out each step, not thrown.
   */
  const colliderOn = uniform(0);
  const toLogo = uniform(new THREE.Matrix4());
  const fromLogo = uniform(new THREE.Matrix4());
  const sdfPlaceholder = new THREE.DataTexture(new Uint16Array([THREE.DataUtils.toHalfFloat(1000), 0, 0, 0]), 1, 1, THREE.RGBAFormat, THREE.HalfFloatType);
  sdfPlaceholder.needsUpdate = true;
  const sdfNode = texture(sdfPlaceholder);
  const sdfMin = uniform(new THREE.Vector2(0, 0));
  const sdfSize = uniform(new THREE.Vector2(1, 1));
  const zRange = uniform(new THREE.Vector2(0, 0));
  const marginU = uniform(1.5);
  const frictionU = uniform(0.3);
  /** the logo's distance at a point of its frame (cm); off the field's edge, the edge's value + the distance to it */
  const logoDistance = Fn(([p]: [Node<"vec3">]) => {
    const uv = p.xy.sub(sdfMin).div(sdfSize);
    const uvc = uv.clamp(0, 1);
    const flat = sdfNode.sample(uvc).level(float(0)).r.add(uv.sub(uvc).mul(sdfSize).length());
    const depth = max(zRange.x.sub(p.z), p.z.sub(zRange.y));
    const q = vec2(flat, depth);
    return max(q, vec2(0)).length().add(min(max(q.x, q.y), 0));
  });

  // ── setupComputeShaders (the example's) ──
  const computeSpringForces = Fn(() => {
    const vertexIds = springVertexIdBuffer.element(instanceIndex);
    const restLength = springRestLengthBuffer.element(instanceIndex);
    const vertex0Position = vertexPositionBuffer.element(vertexIds.x);
    const vertex1Position = vertexPositionBuffer.element(vertexIds.y);
    const delta = vertex1Position.sub(vertex0Position).toVar();
    const dist = delta.length().max(0.000001).toVar();
    const force = dist.sub(restLength).mul(stiffnessUniform).mul(delta).mul(0.5).div(dist);
    springForceBuffer.element(instanceIndex).assign(force);
  })()
    .compute(springCount)
    .setName("hero cloth: Spring Forces");

  const computeVertexForces = Fn(() => {
    const params = vertexParamsBuffer.element(instanceIndex).toVar();
    const isFixed = params.x;
    const springCountP = params.y;
    const springPointer = params.z;
    If(isFixed, () => {
      // don't need to calculate vertex forces if the vertex is set as immovable
      // ⛔ THE HAND (20 November 2026, session 2; `setHand`): a pinned point is CARRIED — set to its place + the hand's offset
      // (was: never moved). The free points follow through the springs: the sheet trails, swings and settles as cloth
      vertexPositionBuffer.element(instanceIndex).assign(pinStartBuffer.element(instanceIndex).add(vec3(0, 0, handUniform)));
      Return();
    });
    const position = vertexPositionBuffer.element(instanceIndex).toVar("vertexPosition");
    const force = vertexForceBuffer.element(instanceIndex).toVar("vertexForce");
    force.mulAssign(dampeningUniform);
    const ptrStart = springPointer.toVar("ptrStart");
    const ptrEnd = ptrStart.add(springCountP).toVar("ptrEnd");
    Loop({ start: ptrStart, end: ptrEnd, type: "uint", condition: "<" }, ({ i }) => {
      const springId = springListBuffer.element(i).toVar("springId");
      const springForce = springForceBuffer.element(springId);
      const springVertexIds = springVertexIdBuffer.element(springId);
      const factor = select(springVertexIds.x.equal(instanceIndex), 1.0, -1.0);
      force.addAssign(springForce.mul(factor));
    });
    // gravity
    force.y.subAssign(0.00005);
    // wind (the example's `time` → the simulation's clock, header)
    // ⛔ THE GUSTS SCALED TO THE CLOTH (Carl, 20 November 2026: *"no gusts. increase the wind scales to the example look"*):
    // the noise is read where the EXAMPLE's 1 × 1 cloth would have it — x over the width, y down from the pins over the
    // height, z over the width — so the whole sheet sits in one gust and sways as one, as the example's does; × `gustSize`
    // (1 = the cloth's size; 1 / width = the example's world size, the ripples of take 4). The strength per point unchanged
    const gustPos = vec3(position.x.div(gustX), float(0.5).sub(float(0.5).sub(position.y).div(gustY)), position.z.div(gustX));
    const noise = triNoise3D(gustPos, 1, simTimeUniform).sub(0.2).mul(0.0001);
    const windForce = noise.mul(windUniform);
    force.z.subAssign(windForce);
    // (⚰️ the collision with the sphere: deleted, header)
    // ⛔ THE COLLISION (above): the point where this step takes it, pushed out of the logo
    const next = position.add(force).toVar("next");
    If(colliderOn.greaterThan(0.5), () => {
      const pL = toLogo.mul(vec4(next, 1)).xyz.toVar("pLogo");
      const d = logoDistance(pL).toVar("dLogo");
      If(d.lessThan(marginU), () => {
        const h = float(0.5);
        const n = vec3(
          logoDistance(pL.add(vec3(h, 0, 0))).sub(logoDistance(pL.sub(vec3(h, 0, 0)))),
          logoDistance(pL.add(vec3(0, h, 0))).sub(logoDistance(pL.sub(vec3(0, h, 0)))),
          logoDistance(pL.add(vec3(0, 0, h))).sub(logoDistance(pL.sub(vec3(0, 0, h)))),
        )
          .normalize()
          .toVar("nLogo");
        next.assign(fromLogo.mul(vec4(pL.add(n.mul(marginU.sub(d))), 1)).xyz);
        const nC = fromLogo.mul(vec4(n, 0)).xyz.normalize().toVar("nCloth");
        const vn = force.dot(nC).toVar("vn");
        // the speed into the logo removed; the sliding slowed by friction; the speed away from it kept
        const vT = force.sub(nC.mul(vn)).mul(float(1).sub(frictionU));
        force.assign(vT.add(nC.mul(max(vn, 0))));
      });
    });
    vertexForceBuffer.element(instanceIndex).assign(force);
    vertexPositionBuffer.element(instanceIndex).assign(next);
  })()
    .compute(vertexCount)
    .setName("hero cloth: Vertex Forces");

  // the start again: the positions as built, the forces zero (`again`)
  const startPositions = vertexPositionBuffer.value.array.slice() as Float32Array;
  let needsReset = false;

  // ── the environment (the example's file; header) and the materials' shared output ──
  let env: THREE.Texture | null = null;
  const envReady = new UltraHDRLoader().loadAsync(CLOTH_ENV_SRC).then((t) => {
    t.mapping = THREE.EquirectangularReflectionMapping;
    env = t;
    return t;
  });
  const neutral = (m: THREE.Material & { outputNode: unknown; lightsNode: unknown }) => {
    m.lightsNode = lights([]);
    const toned = neutralToneMapping(output.rgb, float(1)) as unknown as ReturnType<typeof vec3>;
    m.outputNode = vec4(toned, output.a);
  };

  // ── setupWireframe (the example's) ──
  const vertexWireframeMaterial = new SpriteNodeMaterial();
  vertexWireframeMaterial.positionNode = vertexPositionBuffer.element(instanceIndex);
  const vertexWireframeObject = new THREE.Mesh(new THREE.PlaneGeometry(0.01, 0.01), vertexWireframeMaterial);
  vertexWireframeObject.name = "hero cloth: vertex wireframe";
  vertexWireframeObject.frustumCulled = false;
  vertexWireframeObject.count = vertexCount;
  vertexWireframeObject.visible = false;
  group.add(vertexWireframeObject);
  const springWireframePositionBuffer = new THREE.BufferAttribute(new Float32Array(6), 3, false);
  const springWireframeIndexBuffer = new THREE.BufferAttribute(new Uint32Array([0, 1]), 1, false);
  const springWireframeMaterial = new LineBasicNodeMaterial();
  springWireframeMaterial.positionNode = Fn(() => {
    const vertexIds = springVertexIdBuffer.element(instanceIndex);
    const vertexId = select(attribute<"uint">("vertexIndex").equal(0), vertexIds.x, vertexIds.y);
    return vertexPositionBuffer.element(vertexId);
  })();
  const springWireframeGeometry = new THREE.InstancedBufferGeometry();
  springWireframeGeometry.setAttribute("position", springWireframePositionBuffer);
  springWireframeGeometry.setAttribute("vertexIndex", springWireframeIndexBuffer);
  springWireframeGeometry.instanceCount = springCount;
  const springWireframeObject = new THREE.Line(springWireframeGeometry, springWireframeMaterial);
  springWireframeObject.name = "hero cloth: spring wireframe";
  springWireframeObject.frustumCulled = false;
  springWireframeObject.count = springCount;
  springWireframeObject.visible = false;
  group.add(springWireframeObject);


  // ── setupClothMesh (the example's) ──
  const meshVertexCount = CLOTH.segX * CLOTH.segY;
  const geometry = new THREE.BufferGeometry();
  const verletVertexIdArray = new Uint32Array(meshVertexCount * 4);
  const indices: number[] = [];
  const getIndex = (x: number, y: number) => y * CLOTH.segX + x;
  for (let x = 0; x < CLOTH.segX; x++) {
    // (the example loops y to segX — its cloth is square; ours is not: segY)
    for (let y = 0; y < CLOTH.segY; y++) {
      const index = getIndex(x, y);
      verletVertexIdArray[index * 4] = verletVertexColumns[x][y].id;
      verletVertexIdArray[index * 4 + 1] = verletVertexColumns[x + 1][y].id;
      verletVertexIdArray[index * 4 + 2] = verletVertexColumns[x][y + 1].id;
      verletVertexIdArray[index * 4 + 3] = verletVertexColumns[x + 1][y + 1].id;
      if (x > 0 && y > 0) {
        indices.push(getIndex(x, y), getIndex(x - 1, y), getIndex(x - 1, y - 1));
        indices.push(getIndex(x, y), getIndex(x - 1, y - 1), getIndex(x, y - 1));
      }
    }
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(meshVertexCount * 3), 3, false));
  geometry.setAttribute("vertexIds", new THREE.BufferAttribute(verletVertexIdArray, 4, false));
  geometry.setIndex(indices);
  const clothMaterial = new MeshPhysicalNodeMaterial({
    color: new THREE.Color(settings.color),
    side: THREE.DoubleSide,
    // ⛔ FULLY OPAQUE (Carl, 20 November 2026, session 2: *"the blue logo wont show through quite as much as the red, but it
    // will see show through. That makes the golg transition, problematic."* … *"yes, full opacity"*): the logo no longer
    // shows THROUGH the cloth, so the drying's gold appears as the cloth UNCOVERS it, never tinted through it. Was the
    // example's `transparent: true, opacity: 0.85`
    transparent: false,
    opacity: 1,
    sheen: 1.0,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color(settings.sheenColor),
  });
  clothMaterial.name = "hero cloth: cloth";
  neutral(clothMaterial as never);
  // (typed as called with no inputs, as the example calls it: the builder supplies `material`)
  clothMaterial.positionNode = (Fn(({ material }: { material: THREE.Material & { normalNode: unknown } }) => {
    // gather the position of the 4 verlet vertices and calculate the center position and normal from that
    const vertexIds = attribute<"uvec4">("vertexIds");
    const v0 = vertexPositionBuffer.element(vertexIds.x).toVar();
    const v1 = vertexPositionBuffer.element(vertexIds.y).toVar();
    const v2 = vertexPositionBuffer.element(vertexIds.z).toVar();
    const v3 = vertexPositionBuffer.element(vertexIds.w).toVar();
    const top = v0.add(v1);
    const right = v1.add(v3);
    const bottom = v2.add(v3);
    const left = v0.add(v2);
    const tangent = right.sub(left).normalize();
    const bitangent = bottom.sub(top).normalize();
    const normal = cross(tangent, bitangent);
    // send the normalView from the vertex shader to the fragment shader
    material.normalNode = transformNormalToView(normal).toVarying();
    return v0.add(v1).add(v2).add(v3).mul(0.25);
  }) as unknown as () => ReturnType<typeof vec3>)();
  const clothMesh = new THREE.Mesh(geometry, clothMaterial);
  clothMesh.name = "hero cloth: cloth";
  clothMesh.frustumCulled = false;
  group.add(clothMesh);

  envReady.then((t) => {
    clothMaterial.envMap = t;
    clothMaterial.needsUpdate = true;
  });

  // ── the steps (the example's `render`, on the bench's/story's time: header) ──
  let timestamp = 0;
  let timeSinceLastStep = 0;
  let stepsDue = 0;
  let stepsDone = 0;
  const timePerStep = 1 / CLOTH.stepsPerSecond;
  let precompile: PrecompileResult | null = null;
  let precompiling: Promise<unknown> | null = null;
  /**
   * ⛔ THE HAND (20 November 2026, session 2; `live-work/structural-note-cloth-hand-20-november.md`, Carl: *"Thays ok that
   * nothing collides yet. we will know its speed and the area of the logo it touches."*): the scene sets where the hand is
   * each frame (cm toward the camera from the cloth's place); the steps due between two frames INTERPOLATE from the last
   * place to the new one, so the pins move smoothly at 360 steps a second, never in one jump. World +z → the group's local
   * −z (turned 180°), ÷ its scale.
   */
  let handFrom = 0;
  let handTo = 0;
  /** the collider's pose: last frame's and this frame's (cloth local → logo local), interpolated across the steps */
  const poseFrom = new THREE.Matrix4();
  const poseTo = new THREE.Matrix4();
  const poseStep = new THREE.Matrix4();
  let posePrimed = false;
  let poseOn = false;
  let shapeIn = false;
  let shapeGiven: ClothColliderShape | null = null;

  return {
    group,
    settings,
    envReady,
    update(delta) {
      const s = settings;
      group.visible = s.on && env !== null;
      windUniform.value = s.wind;
      gustX.value = CLOTH.width * Math.max(0.01, s.gustSize);
      gustY.value = CLOTH.height * Math.max(0.01, s.gustSize);
      stiffnessUniform.value = s.stiffness;
      clothMesh.visible = !s.wireframe;
      vertexWireframeObject.visible = s.wireframe;
      springWireframeObject.visible = s.wireframe;
      clothMaterial.color.set(s.color);
      clothMaterial.roughness = s.roughness;
      clothMaterial.sheen = s.sheen;
      clothMaterial.sheenRoughness = s.sheenRoughness;
      clothMaterial.sheenColor.set(s.sheenColor);
      marginU.value = s.marginCm;
      frictionU.value = s.friction;
      if (!s.on || !precompile) return;
      timeSinceLastStep += Math.max(0, delta);
      while (timeSinceLastStep >= timePerStep) {
        timeSinceLastStep -= timePerStep;
        stepsDue++;
      }
    },
    compute(renderer) {
      if (!precompile) {
        if (!precompiling) precompiling = precompileCompute(renderer, [computeSpringForces, computeVertexForces]).then((r) => (precompile = r));
        return;
      }
      if (needsReset) {
        needsReset = false;
        const pos = vertexPositionBuffer.value as THREE.BufferAttribute;
        (pos.array as Float32Array).set(startPositions);
        pos.needsUpdate = true;
        const f = vertexForceBuffer.value as THREE.BufferAttribute;
        (f.array as Float32Array).fill(0);
        f.needsUpdate = true;
      }
      const n = stepsDue;
      const colliding = poseOn && shapeIn && settings.collide;
      colliderOn.value = colliding ? 1 : 0;
      for (let k = 1; stepsDue > 0; stepsDue--, k++) {
        timestamp += timePerStep;
        simTimeUniform.value = timestamp;
        handUniform.value = handFrom + ((handTo - handFrom) * k) / n;
        if (colliding) {
          // the pose this step: last frame's to this frame's, element by element (a frame's turn is a fraction of a degree)
          const a = poseFrom.elements;
          const b = poseTo.elements;
          const e = poseStep.elements;
          for (let j = 0; j < 16; j++) e[j] = a[j] + ((b[j] - a[j]) * k) / n;
          toLogo.value.copy(poseStep);
          fromLogo.value.copy(poseStep).invert();
        }
        renderer.compute(computeSpringForces);
        renderer.compute(computeVertexForces);
        stepsDone++;
      }
      if (n > 0) {
        handFrom = handTo;
        poseFrom.copy(poseTo);
      }
    },
    setHand(zCm) {
      handTo = -(zCm * UNITS_PER_CM) / CLOTH_PLACE.scale;
    },
    setColliderShape(shape) {
      sdfNode.value = shape.tex;
      sdfMin.value.set(shape.minX, shape.minY);
      sdfSize.value.set(shape.sizeX, shape.sizeY);
      zRange.value.set(shape.zMin, shape.zMax);
      shapeIn = true;
      shapeGiven = shape;
    },
    get collider() {
      return shapeGiven;
    },
    setCollider(worldToLogo) {
      poseOn = worldToLogo !== null;
      if (!worldToLogo) {
        posePrimed = false;
        return;
      }
      group.updateMatrixWorld();
      poseTo.multiplyMatrices(worldToLogo, group.matrixWorld);
      if (!posePrimed) {
        poseFrom.copy(poseTo);
        posePrimed = true;
      }
    },
    again() {
      timestamp = 0;
      timeSinceLastStep = 0;
      stepsDue = 0;
      needsReset = true;
    },
    get points() {
      return vertexPositionBuffer.value as THREE.BufferAttribute;
    },
    get info() {
      return { steps: stepsDone, simTime: Math.round(timestamp * 100) / 100, precompiled: precompile !== null, bottomY: Math.round(clothBottomY * 10) / 10, scale: Math.round(CLOTH_PLACE.scale * 10) / 10, points: vertexCount, springs: springCount, grid: [CLOTH.segX + 1, CLOTH.segY + 1] as [number, number] };
    },
    dispose() {
      geometry.dispose();
      clothMaterial.dispose();
      vertexWireframeObject.geometry.dispose();
      vertexWireframeMaterial.dispose();
      springWireframeGeometry.dispose();
      springWireframeMaterial.dispose();
      env?.dispose();
    },
  };
}
