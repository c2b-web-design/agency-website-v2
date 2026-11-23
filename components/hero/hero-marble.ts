import * as THREE from "three";
import { MeshPhysicalNodeMaterial } from "three/webgpu";
import { abs, clamp, color, float, fwidth, lights, max, mix, mx_fractal_noise_float, mx_fractal_noise_vec3, mx_noise_float, neutralToneMapping, output, positionWorld, smoothstep, texture as sampleTexture, uniform, vec2, vec3, vec4 } from "three/tsl";

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
 *   casts the shadow (`hero-scene.ts`). ⚰️ It was also IN the light (both lights in its own list) until Carl's question,
 *   23 November 2026: *"can the floor light be isolated from the logo?"* … *"Do those 2 things"* → the two lights are on
 *   `MARBLE_LIGHT_LAYER` (31, the logo's key's layer), which the camera never collects (r185 culls lights by the camera's
 *   layers), so ONLY the floor — which names them in its own `lightsNode` — is lit by them: the logo keeps its approved gold
 *   and the text its look whatever the floor light's colour; the logo still CASTS its shadow on the floor (casting is not
 *   being lit). The default colour Carl's `#f7f8c9` (his bench, the same day: *"The black marble isnt so black, nor is it
 *   jarring technicolour green"*).
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
 * - ⛔ THE MARBLE IS THE FLOOR's OWN, STATIC (Carl, 23 November 2026: *"The floors own marble will be static, any movement
 *   will come from the camera"* … *"we dont need the square it sits in. It should be roughly a flat oval, circular like the
 *   web floor"* … *"i think the Gpt image is better, so try Gemini first."*): `map` "gemini" puts the AI marble
 *   (`marble-gemini.jpg`, 1024²) ON THE FLOOR as its colour, in world cm (`tileCm` per image, repeating), mipmapped with
 *   16× anisotropic filtering (sharpness low and close); the spotlight then carries a plain WHITE picture (the light set
 *   and its programs unchanged: never `map` = null). "disturb.jpg" is step 1 as it was (projected, on the grey floor). The
 *   floor is a CIRCLE `rimCm` from the logo's spot, fading over `rimFadeCm` (no square) INTO THE SCENE's BACKGROUND
 *   colour (Carl, on the Gemini take: *"the circle is noticable"* — it faded to pure black, darker than the background
 *   `0x050505`, so its edge read as a dark ring). Carl: *"Lets try GPTs"* → `map` "gpt" (`marble-gpt.webp`, 1254²), the
 *   default; the two share ONE sampler node, its texture swapped (no rebuild).
 *   ⚰️ GEMINI REMOVED (Carl, the same day: *"delete every marble image except for GPTs, thats the bar."* … *"we need the
 *   original image as a fallback. the GPT image is the bar. Everything else marble used today in either image or video can
 *   go."*): `marble-gemini.jpg` deleted, its map choice gone; GPT is THE BAR; `disturb.jpg` kept as the fallback.
 * - ⛔ OUR OWN MARBLE (Carl, 23 November 2026: *"My point is this was done by an earlier version of Opus in CSS! Think you
 *   can do marble at a greater scale. Weve got Gemini, GPT and yourself vying for the plinth. I have the utmost faith in
 *   you. Build it."*): `map` "ours" — `ourMarble` below, built in the shader, no image: sharp at any distance, no tiles,
 *   no seams. Inspired by the GPT image (Carl: *"If there was a design inspiration it should come from this image"*: gold
 *   veins echoing the logo's states, the brand's teal), built on the SEND OPAL's recipe (D-033, R-018): depth from
 *   formations SUBMERGED in the stone, a few strong shapes, local contrast rather than brightness, and ONE thing that
 *   answers the light — the polished coat's highlight. A SOLID stone in world cm (x, height, z), so the plinth can be cut
 *   from the same block. Every line ANTI-ALIASED (`fwidth`), and the fine web fades to its average colour where it would
 *   be finer than a pixel (nothing may shimmer: *"Nothing in the hero may read as a glitch"*).
 * - THE FLOOR IS STONE for every map (a fair comparison): a physical material — a matte base under a CLEAR COAT
 *   (`roughness`, `clearcoat`, `clearcoatRoughness`); "disturb.jpg" keeps the example's look (rough, no coat, grey).
 * - ⛔ THE SLOPE (Carl: *"Is it just me or does the floor seem sloped?"* … *"sort out the seemingly slope effect"*): MEASURED
 *   level (`hero-marble-level-23-november.mjs`); the circle's far rim, centred on the logo, read from HOME (~88 cm above
 *   the floor) as a horizon falling to the left. Now: the floor an OVAL `widthScale` × wider than deep, its back half
 *   stretched away, and the FAR side faded along a STRAIGHT line (`farCm` behind the spot, over `farFadeCm`), parallel to
 *   HOME's screen (world z) — a level horizon; the sides round, out at the frame's edges.
 * - OFF = both lights at intensity 0 and the floor hidden — NEVER `visible` on a light: the light set must not change
 *   (every lit material's program would rebuild).
 */
/** the layer the camera never collects (the logo's key's, `hero-scene.ts`): lights here reach only materials that name them */
export const MARBLE_LIGHT_LAYER = 31;

export type HeroMarbleSettings = {
  on: boolean;
  /** "ours": built in the shader; "gpt": the AI marble on the floor (static; THE BAR); "disturb.jpg": the example's,
   *  projected by the light; "none" */
  map: "ours" | "gpt" | "disturb.jpg" | "none";
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
  /** the floor's circle: its radius from the logo's spot (cm), and the fade at its rim (cm) */
  rimCm: number;
  rimFadeCm: number;
  /** the oval: × wider than deep; and the far side's straight fade, from `farCm` behind the spot over `farFadeCm` */
  widthScale: number;
  farCm: number;
  farFadeCm: number;
  /** the floor's marble image: cm of floor per image (it repeats beyond) */
  tileCm: number;
  /** the stone's surface (every map but "disturb.jpg"): the matte base, the clear coat and its roughness */
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  /** OUR marble: its scale (1 = the take), the gold veins, the hairline web, the teal */
  scale: number;
  gold: number;
  web: number;
  teal: number;
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
    map: "gpt",
    color: "#f7f8c9",
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
    rimCm: 450,
    rimFadeCm: 200,
    widthScale: 1.6,
    farCm: 200,
    farFadeCm: 250,
    tileCm: 900,
    roughness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    scale: 1,
    gold: 1,
    web: 1,
    teal: 1,
  };
  const group = new THREE.Group();
  group.name = "hero marble (webgpu_lights_spotlight)";

  // Textures — the example's `disturb.jpg` (its others not copied: the map dial offers it or none)
  const texture = new THREE.TextureLoader().load("/hero-bench/disturb.jpg");
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  // the AI marble, ON the floor: repeating, mipmapped, anisotropic (sharp at grazing angles)
  const loadMarble = (url: string) => {
    const t = new THREE.TextureLoader().load(url);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 16;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const gpt = loadMarble("/hero-bench/marble-gpt.webp");
  // the spotlight's picture when the marble is on the floor: plain white (the light's map never null: no rebuild)
  const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  white.colorSpace = THREE.SRGBColorSpace;
  white.needsUpdate = true;

  // Lights
  const ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.25);
  ambient.name = "hero marble hemisphere";
  // ⛔ ON THE HIDDEN LAYER (`MARBLE_LIGHT_LAYER`, above): the floor's alone
  ambient.layers.set(MARBLE_LIGHT_LAYER);
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
  spotLight.layers.set(MARBLE_LIGHT_LAYER);
  group.add(spotLight);
  group.add(spotLight.target);

  const lightHelper = new THREE.SpotLightHelper(spotLight);
  lightHelper.visible = false;
  group.add(lightHelper);
  const shadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
  shadowCameraHelper.visible = false;
  group.add(shadowCameraHelper);

  // the floor — the example's plane, now STONE (a physical material for every map); its output through the example's Neutral
  // tone mapping (above)
  const material = new MeshPhysicalNodeMaterial({ color: 0xbcbcbc });
  // its colour: the example's grey, or the AI marble in world cm from the logo's spot (one shader: a uniform chooses)
  const tileWorld = uniform(1);
  const useMarble = uniform(0);
  const marbleCentre = uniform(new THREE.Vector2());
  const floorUv = positionWorld.xz.sub(vec2(marbleCentre)).div(tileWorld).add(0.5);
  const marbleSample = sampleTexture(gpt, floorUv);
  // OUR marble (`ourMarble`): in cm from the logo's spot, the height above the floor its third axis (a solid stone)
  const cmPerUnit = uniform(1);
  const floorY = uniform(0);
  const ours = ourMarble(
    vec3(positionWorld.x.sub(marbleCentre.x), positionWorld.y.sub(floorY), positionWorld.z.sub(marbleCentre.y)).mul(cmPerUnit),
  );
  material.colorNode = mix(color(0xbcbcbc), marbleSample.rgb, useMarble);
  // the stone's surface: a matte base under a clear coat (the example's "disturb.jpg": rough, no coat)
  const roughU = uniform(0.5);
  const coatU = uniform(1);
  const coatRoughU = uniform(0.06);
  material.roughnessNode = roughU;
  material.metalnessNode = float(0);
  material.clearcoatNode = coatU;
  material.clearcoatRoughnessNode = coatRoughU;
  // (the cast: r185's types give the tone-mapping function an untyped Node; it returns the colour's vec3 — as the logo's ACES)
  const neutral = neutralToneMapping(output.rgb, float(1)) as unknown as ReturnType<typeof vec3>;
  // the entrance's circle (`setReveal`): drawn inside its radius, a soft edge `feather` wide, nothing outside (masked)
  const revealCentre = uniform(new THREE.Vector2());
  const revealRadius = uniform(0);
  const revealFeather = uniform(1);
  const fromSpot = positionWorld.xz.distance(vec2(revealCentre));
  // the floor's OVAL (no square; the slope, above): x over `rimX`, z toward the camera over `rim`, behind stretched away;
  // the far side's STRAIGHT fade; `rimFade` as a share of the oval
  const rim = uniform(1);
  const rimX = uniform(1);
  const rimFade = uniform(0.5);
  const far = uniform(1);
  const farFade = uniform(1);
  const dx = positionWorld.x.sub(revealCentre.x);
  const dz = positionWorld.z.sub(revealCentre.y);
  const dzOval = dz.max(0).add(dz.min(0).mul(0.35));
  const oval = vec2(dx.div(rimX), dzOval.div(rim)).length();
  const behind = dz.negate();
  material.maskNode = fromSpot.lessThan(revealRadius).and(oval.lessThan(1)).and(behind.lessThan(far.add(farFade)));
  const edge = float(1)
    .sub(smoothstep(revealRadius.sub(revealFeather), revealRadius, fromSpot))
    .mul(float(1).sub(smoothstep(float(1).sub(rimFade), 1, oval)))
    .mul(float(1).sub(smoothstep(far, far.add(farFade), behind)));
  // faded INTO the scene's background colour (`hero-scene.ts`, 0x050505), not to black: no ring at the rim
  material.outputNode = vec4(mix(color(0x050505), neutral, edge), output.a);
  // ⛔ ITS OWN LIGHT LIST — the example's two lights only (the logo's method, `hero-scene.ts`): in the hero the floor would
  // also take the scene's key, ambient and point light, and read an even light grey (seen, take 1)
  material.lightsNode = lights([spotLight, ambient]);
  // ⛔ OUR MARBLE ON ITS OWN MATERIAL (Carl's close-up screenshots, 23 November 2026: ours ~8 FPS filling the frame, and
  // GPT and Gemini down to ~35 FPS because one shader computed ours for every map) — the same stone surface, its colour
  // and roughness generated; swapped onto the floor only when "ours" is chosen. ⚠ Not built in the warm-up: the first
  // switch to "ours" compiles it then (a bench stall, the bench only)
  const oursMaterial = new MeshPhysicalNodeMaterial();
  oursMaterial.colorNode = ours.colour;
  oursMaterial.roughnessNode = ours.roughness.mul(roughU).mul(2);
  oursMaterial.metalnessNode = float(0);
  oursMaterial.clearcoatNode = coatU;
  oursMaterial.clearcoatRoughnessNode = coatRoughU;
  oursMaterial.maskNode = material.maskNode;
  oursMaterial.outputNode = material.outputNode;
  oursMaterial.lightsNode = material.lightsNode;
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
    spotLight.map = settings.map === "disturb.jpg" ? texture : white;
    useMarble.value = settings.map === "gpt" ? 1 : 0;
    floor.material = settings.map === "ours" ? oursMaterial : material;
    const example = settings.map === "disturb.jpg" || settings.map === "none";
    roughU.value = example ? 1 : settings.roughness;
    coatU.value = example ? 0 : settings.clearcoat;
    coatRoughU.value = settings.clearcoatRoughness;
    ours.u.scale.value = settings.scale;
    ours.u.gold.value = settings.gold;
    ours.u.web.value = settings.web;
    ours.u.teal.value = settings.teal;
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
    // the circle and the marble image, in world units from the spot
    rim.value = Math.max(1, settings.rimCm * unitsPerCm);
    rimX.value = Math.max(1, settings.rimCm * settings.widthScale * unitsPerCm);
    rimFade.value = Math.min(1, Math.max(0.001, settings.rimFadeCm / Math.max(1, settings.rimCm)));
    far.value = settings.farCm * unitsPerCm;
    farFade.value = Math.max(1, settings.farFadeCm * unitsPerCm);
    marbleCentre.value.set(spot!.x, spot!.z);
    tileWorld.value = Math.max(1, settings.tileCm * unitsPerCm);
    cmPerUnit.value = 1 / unitsPerCm;
    floorY.value = spot!.y;
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
      gpt.dispose();
      white.dispose();
      material.dispose();
      oursMaterial.dispose();
      floor.geometry.dispose();
      lightHelper.dispose();
      shadowCameraHelper.dispose();
      spotLight.dispose();
    },
  };
}

type F = ReturnType<typeof float>;
type V3 = ReturnType<typeof vec3>;

/**
 * ⛔ OUR MARBLE (23 November 2026; Carl: *"Build it."*) — a solid stone, from `p` in cm (x, height above the floor, z). The
 * GPT image is the inspiration, not a target: near-black, gold-led veins, teal clouding, a dense hairline web. The SEND
 * OPAL's recipe (D-033): formations SUBMERGED in the stone (the teal, the amber bleed), a few strong shapes (two families of
 * gold vein, the cracks between), local contrast, the polish the only thing that answers the light. Layers, deep to surface:
 * 1. the BODY — near-black, a slow warm/cold clouding (never flat black);
 * 2. the TEAL formations — submerged, mottled inside;
 * 3. the AMBER BLEED — a soft halo round the bold veins, under the surface;
 * 4. the HAIRLINE CRACKS — the zero lines of a fine fractal noise at two scales, patchy, denser near the veins, dim gold;
 * 5. the GOLD VEINS — the zero lines of a fractal noise along a diagonal grain, two families (bold and secondary), their
 *    width wandering so they swell, thin and break; CREAM in the boldest cores.
 * Everything domain-WARPED twice: a broad flow, and a fine one that makes every line jagged.
 * ⚰️ Take 1 (the same day, not shown to Carl): the veins from a single smooth noise read as RIVERS on a map (even width,
 * smooth curves), and the web from cellular noise read as POLYGONS (reptile skin); too much gold. → fractal zero lines,
 * the second warp, the cracks from fractal noise, the gold thinner and masked. ⚰️ Take 2: the fractal zero lines closed
 * into LOOPS (contour lines), the cracks too faint → take 3: the grain stretched 3.3×, the cracks isotropic, wider, brighter.
 * Lines anti-aliased by `fwidth`; the cracks fade to their average tint where finer than ~2 px (no shimmer). Its colours
 * are takes; the dials: scale, gold, web, teal.
 */
function ourMarble(pIn: unknown) {
  // (r185's types give the MaterialX noises and vector swizzles loose or wrong node types: cast at the boundary, as the
  // logo's ACES line in `hero-scene.ts`)
  const f = (n: unknown) => n as F;
  const v3 = (n: unknown) => n as V3;
  const p = v3(pIn);
  const u = { scale: uniform(1), gold: uniform(1), web: uniform(1), teal: uniform(1) };
  /** a line along the zero set of `n`: `w` its half-width (in n's units), anti-aliased */
  const line = (n: F, w: F) => {
    const fw = f(max(fwidth(n), 1e-5));
    return f(float(1).sub(smoothstep(w, w.add(fw.mul(1.5)), abs(n))));
  };
  const fbm = (q: V3, oct: number) => f(mx_fractal_noise_float(q, oct, 2.1, 0.5));

  // the GRAIN: veins run along a diagonal (the GPT image's), stretched along it
  const a = (35 * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  // (take 3: stretched 3.3× along the grain — at 1.7× the veins closed into loops, contour lines on a map)
  const q0 = v3(vec3(p.x.mul(ca).add(p.z.mul(sa)).mul(0.3), p.y, p.z.mul(ca).sub(p.x.mul(sa))).div(u.scale));
  // the stone's FLOW (broad) and its FRACTURE (fine: every line jagged)
  const flow = v3(v3(mx_fractal_noise_vec3(q0.div(180), 4, 2, 0.5)).mul(60));
  const q1 = v3(q0.add(flow));
  const fracture = v3(v3(mx_fractal_noise_vec3(q1.div(18), 3, 2.2, 0.5)).mul(4.5));
  const q = v3(q1.add(fracture));
  // the cracks run every way (not along the grain): the stone's own place, with the same flow and fracture
  const qIso = v3(p.div(u.scale).add(flow).add(fracture));

  // 1. the BODY — near-black, never flat
  const cloud = f(fbm(v3(q0.div(220).add(vec3(3.1, 0, 7.7))), 3).mul(0.5).add(0.5));
  let col = v3(mix(color(0x040405), color(0x0f0b08), smoothstep(0.4, 0.9, cloud)));
  col = v3(mix(col, color(0x061011), f(smoothstep(0.5, 0.1, cloud).mul(0.7))));

  // 2. the TEAL formations (submerged), mottled
  const tealMask = f(smoothstep(0.1, 0.42, fbm(v3(q.div(85).add(vec3(11.3, 0, -4.2))), 4)).mul(u.teal));
  const mottle = f(fbm(v3(q.div(7).add(vec3(-3.3, 0, 6.1))), 3).mul(0.5).add(0.5));
  const tealCol = v3(mix(color(0x0a2628), color(0x2c7673), smoothstep(0.35, 0.8, mottle)));
  col = v3(mix(col, tealCol, clamp(tealMask.mul(0.8), 0, 1)));

  // 5. (the veins' fields first: the bleed and the cracks read them)
  const wander = f(f(mx_noise_float(q0.div(240).add(vec3(-5.5, 0, 2.2)))).mul(0.5).add(0.5));
  const n1 = fbm(v3(q.div(170)), 3);
  const w1 = f(wander.mul(0.02).add(0.0015));
  const boldOn = f(smoothstep(0.35, 0.6, wander));
  const bold = f(line(n1, w1).mul(boldOn));
  const core = f(line(n1, f(w1.mul(0.3))).mul(smoothstep(0.55, 0.85, wander)));
  const wander2 = f(f(mx_noise_float(q0.div(110).add(vec3(1.7, 0, -8.8)))).mul(0.5).add(0.5));
  const n2 = fbm(v3(q.div(65).add(vec3(17.1, 0, 9.4))), 3);
  const second = f(line(n2, f(wander2.mul(0.014).add(0.001))).mul(smoothstep(0.3, 0.55, wander2)).mul(0.8));

  // 3. the AMBER BLEED round the bold veins (submerged)
  const bleed = f(float(1).sub(smoothstep(w1, w1.mul(5).add(0.04), abs(n1))).mul(boldOn));
  col = v3(mix(col, color(0x4a2a0a), clamp(bleed.mul(0.45).mul(u.gold), 0, 1)));

  // 4. the HAIRLINE CRACKS — two scales, patchy, denser near the veins and in the teal; to their average where too fine
  const c1 = fbm(v3(qIso.div(16).add(vec3(2.4, 0, 5.1))), 3);
  const c2 = fbm(v3(qIso.div(6).add(vec3(-7.7, 0, 1.9))), 2);
  const fine1 = f(float(1).sub(smoothstep(0.3, 0.7, fwidth(qIso.x.div(16)))));
  const fine2 = f(float(1).sub(smoothstep(0.3, 0.7, fwidth(qIso.x.div(6)))));
  const crack1 = f(mix(float(0.05), line(c1, f(float(0.02))), fine1));
  const crack2 = f(mix(float(0.03), line(c2, f(float(0.016))), fine2).mul(0.6));
  const density = f(clamp(f(smoothstep(-0.15, 0.45, f(mx_noise_float(qIso.div(80).add(vec3(9.9, 0, -2.5)))))).add(bleed.mul(0.9)).add(tealMask.mul(0.35)), 0, 1));
  const cracks = f(max(crack1, crack2).mul(density).mul(u.web));
  col = v3(mix(col, v3(mix(color(0x6a4515), color(0xb47c30), bleed)), clamp(cracks.mul(0.9), 0, 1)));

  // 5. the veins on top: secondary, bold, cream cores
  col = v3(mix(col, color(0xa86f26), clamp(second.mul(u.gold), 0, 1)));
  col = v3(mix(col, color(0xd6973a), clamp(bold.mul(u.gold), 0, 1)));
  col = v3(mix(col, color(0xf0dbb0), clamp(core.mul(u.gold), 0, 1)));

  // the base's roughness (0.5 = the dial's own): the veins a little smoother under the coat
  const roughness = f(mix(float(0.5), float(0.38), clamp(bold.add(second).add(cracks), 0, 1)));
  return { colour: col, roughness, u };
}
