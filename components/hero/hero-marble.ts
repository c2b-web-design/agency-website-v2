import * as THREE from "three";
import { MeshLambertNodeMaterial } from "three/webgpu";
import { float, lights, neutralToneMapping, output, positionWorld, smoothstep, uniform, vec2, vec3, vec4 } from "three/tsl";

/**
 * ⛔ PHASE 4, THE MARBLE, STEP 1 — `webgpu_lights_spotlight` EXACTLY AS IT IS (23 November 2026; D-101, route B).
 * Carl: *"So at the moment there is nothing on the floor. We will recreate the floor with the same image. Then we will
 * create our own similar image. Much like we did with the marching cubes."* … *"No we dont need the architect. Copy the
 * code exactly. We can turn off the rotations and other things, then we will tweak it to how we want it."* … *"no plinth
 * yet, just exactly whats in the example."*
 *
 * THE EXAMPLE (three r185, `examples/webgpu_lights_spotlight.html`), line for line:
 * - a `HemisphereLight` (0xffffff, 0x8d8d8d, 0.25);
 * - a `SpotLight` (white, 100) carrying the picture `disturb.jpg` as its `map` (LinearFilter, no mipmaps, sRGB), at
 *   (2.5, 5, 2.5), angle π/6, penumbra 1, decay 2, distance 0, casting a shadow (1024², near 2, far 10, focus 1,
 *   intensity 1), CIRCLING the statue: x = cos(t) × 2.5, z = sin(t) × 2.5, t = seconds / 3;
 * - a `SpotLightHelper` and the shadow camera's `CameraHelper`, hidden ("helpers");
 * - a 10 × 10 PLANE, `MeshLambertMaterial` 0xbcbcbc, at y −1, receiving the shadow;
 * - Neutral tone mapping, exposure 1; PCF soft shadows (the bench's renderer: `hero-bench.tsx`).
 *
 * ⛔ WHAT IS OURS, AND WHY:
 * - THE STATUE IS OUR LOGO (the scope Carl authorised): the light aims where the statue stood, the logo's spot; the logo
 *   casts and receives the shadow (`hero-scene.ts`) and is in the light (its own light list includes both lights).
 * - THE SCALE: 1 example unit = `metresPerUnit` m (default 1) — the example's floor at y −1 is our floor (`FLOOR_Y`), its
 *   origin 1 unit above it at the logo's spot. Positions, the floor, the shadow camera and `distance` are scaled; the
 *   INTENSITY by scale^decay (a physical light: the same light falling on the floor at the scaled distance). The dials
 *   read in the EXAMPLE's units, so its GUI's values apply as they are.
 * - THE CLOCK: the scene's (`update`'s delta), not `performance.now()` — a frame-stepped film moves exactly as live.
 * - THE FLOOR's LIGHTS: the example's two only (its own `lightsNode`), as in the example's scene.
 * - TONE MAPPING: the hero's renderer has none (each look carries its own); the FLOOR alone takes the example's Neutral
 *   (exposure 1) in its own output, so it reads as the example's floor without touching the logo's or the text's looks.
 * - ⛔ ITS ENTRANCE (Carl, 23 November 2026: *"When the cloth makes its final journey backwards, it should radiate outwards
 *   from the logo, much like the web floor does."*): `setReveal(share)` — the story's (`hero-scene.ts`, from the cloth's
 *   departure) — opens a CIRCLE on the floor from the logo's spot, linear, to beyond the floor's corners (a soft edge
 *   `featherCm` wide; outside it the floor is not drawn), and both lights rise with the same share (no pop on the logo or
 *   the text). `story` off = fully revealed, for tuning.
 * - OFF = both lights at intensity 0 and the floor hidden — NEVER `visible` on a light: the light set must not change
 *   (every lit material's program would rebuild).
 */
export type HeroMarbleSettings = {
  on: boolean;
  map: "disturb.jpg" | "none";
  color: string;
  /** the example's units (scaled by scale^decay) */
  intensity: number;
  distance: number;
  angle: number;
  penumbra: number;
  decay: number;
  focus: number;
  shadowIntensity: number;
  helpers: boolean;
  /** the light circling the logo (the example's animate) */
  rotate: boolean;
  /** metres per example unit */
  metresPerUnit: number;
  /** the hemisphere light (the example's 0.25) */
  ambient: number;
  /** ⛔ the entrance follows the story (the cloth's departure); off = shown whole */
  story: boolean;
  /** the circle's spread from the logo to the floor's corners (s); the Builder's take: the cloth's departure (3 s) */
  spreadS: number;
  /** the circle's soft edge (cm) */
  featherCm: number;
};

export type HeroMarble = {
  readonly group: THREE.Group;
  /** the two lights: in the logo's own light list (`hero-scene.ts`) */
  readonly lights: THREE.Light[];
  readonly floor: THREE.Mesh;
  readonly settings: HeroMarbleSettings;
  /** where the statue stood: the logo's spot on the floor (world), and the world's units per cm; until then, off */
  place(spot: THREE.Vector3, unitsPerCm: number): void;
  /** the entrance's share (0 = none, 1 = whole): the circle's radius and the lights' strength */
  setReveal(share: number): void;
  update(delta: number): void;
  readonly info: { placed: boolean; unitsPerMetre: number; lightAt: [number, number, number]; intensityWorld: number; reveal: number };
  dispose(): void;
};

export function createHeroMarble(): HeroMarble {
  const settings: HeroMarbleSettings = {
    on: true,
    map: "disturb.jpg",
    color: "#ffffff",
    intensity: 100,
    distance: 0,
    angle: Math.PI / 6,
    penumbra: 1,
    decay: 2,
    focus: 1,
    shadowIntensity: 1,
    helpers: false,
    rotate: true,
    metresPerUnit: 1,
    ambient: 0.25,
    story: true,
    spreadS: 3,
    featherCm: 60,
  };
  const group = new THREE.Group();
  group.name = "hero marble (webgpu_lights_spotlight)";

  // Textures — the example's `disturb.jpg` (its others not copied: the map dial offers it or none)
  const texture = new THREE.TextureLoader().load("/hero-bench/disturb.jpg");
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  // Lights
  const ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.25);
  ambient.name = "hero marble hemisphere";
  group.add(ambient);

  const spotLight = new THREE.SpotLight(0xffffff, 100);
  spotLight.name = "hero marble spotLight";
  spotLight.map = texture;
  spotLight.angle = Math.PI / 6;
  spotLight.penumbra = 1;
  spotLight.decay = 2;
  spotLight.distance = 0;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.focus = 1;
  spotLight.shadow.intensity = 1;
  group.add(spotLight);
  group.add(spotLight.target);

  const lightHelper = new THREE.SpotLightHelper(spotLight);
  lightHelper.visible = false;
  group.add(lightHelper);
  const shadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
  shadowCameraHelper.visible = false;
  group.add(shadowCameraHelper);

  // the floor — the example's plane and Lambert grey; its output through the example's Neutral tone mapping (above)
  const material = new MeshLambertNodeMaterial({ color: 0xbcbcbc });
  // (the cast: r185's types give the tone-mapping function an untyped Node; it returns the colour's vec3 — as the logo's ACES)
  const neutral = neutralToneMapping(output.rgb, float(1)) as unknown as ReturnType<typeof vec3>;
  // the entrance's circle (`setReveal`): drawn inside its radius, a soft edge `feather` wide, nothing outside (masked)
  const revealCentre = uniform(new THREE.Vector2());
  const revealRadius = uniform(0);
  const revealFeather = uniform(1);
  const fromSpot = positionWorld.xz.distance(vec2(revealCentre));
  material.maskNode = fromSpot.lessThan(revealRadius);
  const edge = float(1).sub(smoothstep(revealRadius.sub(revealFeather), revealRadius, fromSpot));
  material.outputNode = vec4(neutral.mul(edge), output.a);
  // ⛔ ITS OWN LIGHT LIST — the example's two lights only (the logo's method, `hero-scene.ts`): in the hero the floor would
  // also take the scene's key, ambient and point light, and read an even light grey (seen, take 1)
  material.lightsNode = lights([spotLight, ambient]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  floor.name = "hero marble floor";
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.visible = false;
  group.add(floor);

  let spot: THREE.Vector3 | null = null;
  let unitsPerCm = 0;
  let t = 0;
  let intensityWorld = 0;
  let reveal = 0;
  const lightAt: [number, number, number] = [0, 0, 0];

  /** an example point (its floor at y −1) in the world */
  const toWorld = (v: THREE.Vector3, x: number, y: number, z: number) => {
    const u = settings.metresPerUnit * 100 * unitsPerCm;
    return v.set(spot!.x + x * u, spot!.y + (y + 1) * u, spot!.z + z * u);
  };

  function apply() {
    const placed = spot !== null;
    const share = settings.story ? reveal : 1;
    const on = settings.on && placed && share > 0;
    const u = settings.metresPerUnit * 100 * unitsPerCm;
    spotLight.map = settings.map === "none" ? null : texture;
    spotLight.color.set(settings.color);
    intensityWorld = on ? settings.intensity * Math.pow(u, settings.decay) * share : 0;
    spotLight.intensity = intensityWorld;
    spotLight.distance = settings.distance * u;
    spotLight.angle = settings.angle;
    spotLight.penumbra = settings.penumbra;
    spotLight.decay = settings.decay;
    spotLight.shadow.focus = settings.focus;
    spotLight.shadow.intensity = settings.shadowIntensity;
    ambient.intensity = on ? settings.ambient * share : 0;
    floor.visible = on;
    lightHelper.visible = on && settings.helpers;
    shadowCameraHelper.visible = on && settings.helpers;
    if (!placed) return;
    // the example's shadow camera (near 2, far 10), scaled
    const cam = spotLight.shadow.camera;
    if (cam.near !== 2 * u || cam.far !== 10 * u) {
      cam.near = 2 * u;
      cam.far = 10 * u;
      cam.updateProjectionMatrix();
    }
    // the plane: 10 × 10 at y −1
    floor.scale.set(10 * u, 10 * u, 1);
    toWorld(floor.position, 0, -1, 0);
    // the circle: from the spot, out past the floor's corners (5√2 units) and its own soft edge
    const feather = Math.max(1, settings.featherCm * unitsPerCm);
    revealCentre.value.set(spot!.x, spot!.z);
    revealFeather.value = feather;
    revealRadius.value = share * (5 * Math.SQRT2 * u + feather);
    // the light circling: x = cos(t) × 2.5, z = sin(t) × 2.5 at y 5 (the example's animate; "rotate" off holds it where it is)
    const time = t / 3;
    toWorld(spotLight.position, Math.cos(time) * 2.5, 5, Math.sin(time) * 2.5);
    // its target: the example's origin (the statue's place)
    toWorld(spotLight.target.position, 0, 0, 0);
    spotLight.target.updateMatrixWorld();
    lightAt[0] = Math.round(spotLight.position.x);
    lightAt[1] = Math.round(spotLight.position.y);
    lightAt[2] = Math.round(spotLight.position.z);
    if (lightHelper.visible) {
      lightHelper.update();
      shadowCameraHelper.update();
    }
  }
  apply();

  return {
    group,
    lights: [spotLight, ambient],
    floor,
    settings,
    place(at, upc) {
      spot = at.clone();
      unitsPerCm = upc;
      apply();
    },
    setReveal(v) {
      reveal = Math.min(1, Math.max(0, v));
      apply();
    },
    update(delta) {
      if (settings.rotate) t += Math.max(0, delta);
      apply();
    },
    get info() {
      return { placed: spot !== null, unitsPerMetre: settings.metresPerUnit * 100 * unitsPerCm, lightAt, intensityWorld, reveal };
    },
    dispose() {
      texture.dispose();
      material.dispose();
      floor.geometry.dispose();
      lightHelper.dispose();
      shadowCameraHelper.dispose();
      spotLight.dispose();
    },
  };
}
