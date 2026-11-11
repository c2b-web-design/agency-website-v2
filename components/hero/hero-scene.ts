import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { heroTextLayout } from "@/components/showcase/hero-text";
import { heroTextMaterial } from "@/components/showcase/hero-text-material";

/**
 * ⛔ THE HERO's SCENE — the marching scene, as the site will draw it (11 November 2026, session 1; D-101; the structural
 * note `live-work/structural-note-hero-bench-11-november.md` v1.3, two Architect reviews, Carl's decisions given). Carl:
 * *"we will not use the camera bench. We will use the marching cubes."* Built FROM `/proto/marching` (three r185's
 * `webgl_marchingcubes`, mirrored), which stays the untouched reference; the principle (Carl, 10 November): *"Because we
 * have an outside element with its own rules we must adapt to that first."*
 *
 * ⛔ THE BOUNDARY (note v1.3, "The boundary"): this module is what SHIPS. It imports NO panel, NO FPS meter, NO overlay
 * text and NO orbit controls — those are the bench's (`hero-bench.tsx`), and Carl: *"It should not be on the site"*.
 * ⚠ Unasserted: nothing in code checks these imports yet (a candidate check is in the note).
 * It owns: the camera (HOME's position and lens), the scene, its lights, materials and field, the simulation's settings,
 * the field's time, and the disposal of everything it made. It does NOT own the renderer, the clock (`Timer`), the loop
 * or the orbit's target — the bench does.
 *
 * Departures from the example, stated:
 * - THE DRAW: the addon builds the shape; a PLAIN mesh sharing its geometry and material draws it. `MarchingCubes` keeps
 *   its vertex count in `this.count`, which three r185's WebGPU renderer reads as an INSTANCE count
 *   (`RenderObject.js:610–612`): ~10,000 draws a frame, which hung Carl's GPU twice (10 November 2026).
 *   ⚠ THE SAME WORKAROUND LIVES IN `components/showcase/marching-bench.tsx` (Carl accepted the two copies, note v1.3
 *   decision 2): a three upgrade re-checks BOTH; a fix in one does not reach the other.
 * - `ready`: the cube map's loads as a promise the bench awaits before its first frame (WebGPU builds the reflection on
 *   the first frame; built before the images arrive it fails for good and the shiny draws black).
 * - NO toon materials (raw `ShaderMaterial`s WebGPU cannot draw); the reference keeps them on WebGL.
 * - ⚠ TWO LOADS FROM threejs.org, as the example: the castle cube map and `uv_grid_opengl.jpg` (the textured material).
 *   Fine for a bench; THE SITE CANNOT DEPEND ON threejs.org — the hero's own environment replaces them before the site.
 */

/** where the camera looks from, at what, with what lens: plain DATA. The scene applies `position` and `fov`; the BENCH
 *  sets the orbit's target from `target` (the controls are the bench's).
 *  ⛔ HOME (Carl, 11 November 2026): *"i will determine where Home is. The text will be the size it is now but the blobs
 *  size will be determined and that will be home."* … *"i only have to zoom once to establish Home. Once that is done it
 *  can be fixed."*
 *  ✔ SET BY CARL, 11 November 2026 (session 1), by the scroll wheel only, read from the bench's Camera readout at his
 *  window (1401 × 695 layout px, WebGPU): *"the POV looks right to me though. The text is in the position it will be on
 *  the site and the most important thing at this stage is the blobs look the right size. Not too big that they are
 *  overpowering and not too small that we cannot see your magnificent handiwork."* → THE EXAMPLE's ANGLE KEPT (~18° left
 *  of centre, ~17° above, looking at the field's middle: the same line as the example's −500, 500, 1500), the DISTANCE
 *  Carl's: 2438.4 (the example's 1658.3 × 1.47). Was: the example's own view, −500, 500, 1500.
 *  ⛔ RE-TRACKED, SQUARE ON (11 November 2026, session 1), once the floor and the logo were in: Carl, of the lean at that
 *  view: *"now we have a floor, the orientation is all wrong"*; he orbited to face the scene square on, low, and read the
 *  readout: position 9.5, −49.2, 2566.2, target 0, 0, 0 (distance 2566.7, 45°, 1401 × 695 layout px). *"the y line needs
 *  to be centred, Now we have a similar POV to the sketch bench."* → x 0 (the grid's centre line, running away from the
 *  camera, in the frame's middle); his height and distance kept; the target the field's middle, as he left it (so the
 *  camera tilts UP ~1.1°; the sketch bench's page camera had no tilt). Was (the first Home): −735.2, 735.2, 2205.6. */
export type HeroHome = { position: [number, number, number]; target: [number, number, number]; fov: number };
export const HOME: HeroHome = { position: [0, -49.2, 2566.2], target: [0, 0, 0], fov: 45 };

/** ⛔ THE FLOOR's HEIGHT, scene units (11 November 2026, session 1; D-101). Carl: *"The bottom of the subtext will be
 *  resting on it"* … *"on the subtext there are 2 letter ys on the bottom line that touch the floor, like on the old
 *  bench"*. MEASURED at HOME, at Carl's window (1401 × 695 layout px), by
 *  `live-work/scripts/hero-floor-from-y-tips-11-november.mjs`: the two y tips' rays ("you" −245.4, "eyes" −298.5 where
 *  they cross z 0, the text LEVEL WITH THE BLOBS, the field's centre depth); the mean, −271.9 → −272. At −272 both tips
 *  touch it, the text's line running from z −60 to +57: turned ~18° to face the camera, as the flat text does.
 *  ⚠ Holds at Home and Carl's window only (the overlay text moves with the window); the three.js text (step 3) stands on
 *  it in the scene. ⚠ The example's blobs fall to the field's bottom (−700) and so sink THROUGH this floor until our
 *  movement replaces theirs (accepted by Carl, 11 November).
 *  ⚠ AMENDED (11 November 2026, the square-on Home): the floor KEPT at −272 (Carl had accepted it: *"We are good"*); at the
 *  new Home the y tips meet it at z 1093.68, so the text stands THERE, in front of the blobs — not at z 0 as above.
 *  ⛔ DROPPED TO −437.5 (11 November 2026, session 1). Carl: *"we must make sure the blobs are next to the text. not in the
 *  foreground or background."* … *"drop the floor, lets see how it looks"* → the text at the BLOBS' depth (z 0): at the
 *  square-on Home the y tips' rays cross z 0 at y −437.48 (`hero-ink-pixels-11-november.mjs`, `tipsAtZ0Y`, both tips the
 *  same: square on). Was −272 (the first Home's measure, then kept at the square-on Home with the text at z 1093.68). */
export const FLOOR_Y = -437.5;

/* ⛔ STEP 2's FIRST LEAN — REMOVED (11 November 2026, session 1; Carl: *"remove the logo"*). Carl: *"we have gone about this
 * in the wrong order. coz the text is fixed in screen position if i move, rotate, zoom the logo comes with me. In short the
 * floor and logo is in the same world, the text isnt"*. The logo had been leaned on the OVERLAY text's t, measured from the
 * page's pixels at Home: it held at one view only. The three.js text comes into the world first; the logo then leans on
 * the 3D t. The measured values (the contact, the text plane, 1 unit = 0.3846 cm at the square-on Home; 0.2812 at the
 * first) are recorded in D-101 and `live-work/scripts/hero-ink-pixels-11-november.mjs`; the lean itself (R-103) stands. */

/**
 * ⛔ STEP 3 FIRST — THE TEXT BAKED INTO THE WORLD (11 November 2026, session 1; D-101). Carl: *"we have gone about this in
 * the wrong order. coz the text is fixed in screen position ... the floor and logo is in the same world, the text isnt"*;
 * then, at the square-on Home: *"we should bake in the text with threejs at these coordinates. we must make sure the blobs
 * are next to the text. not in the foreground or background."* … *"Bake the text in, put in camera motion and i will fly
 * in and look from the side."*
 * - THE LETTERING: the sketch bench's own (`heroTextLayout`, `components/showcase/hero-text.tsx`: the page's two blocks in
 *   Geist Bold / Regular, set as the browser sets them, 0.2 em deep, bevelled front and back), built in ITS frame (world cm)
 *   and carried here by ONE similarity (a uniform scale and a move): its two y tips on the subtext's bottom line ("you",
 *   "eyes", the geometry's lowest points) onto `TEXT_TIPS` — where the overlay's y tips land on the floor at the text's
 *   depth, read from the page's pixels at Home (`live-work/scripts/hero-ink-pixels-11-november.mjs`, the floor fixed at
 *   −437.5: −1531.69 and −1097.45, z −0.14) — its FRONT on that depth. So at Home it lands on the overlay; elsewhere it is
 *   in the world. The scale it implies is `textScale` (units per cm), the scene's centimetre from here on.
 * - THE MATERIAL: the sketch bench's EDGE-LIT ICE ACRYLIC (`heroTextMaterial`, `hero-text-material.ts`, imported unchanged:
 *   #CFE6FF, a satin dielectric face, a Fresnel emissive in the same ice on the bevels; WebGPU TSL — this scene is WebGPU).
 *   Carl, 11 November 2026: *"Right now our ice blue is hot."* → *"yrs, proceed"*. Was CLAY (`#9a9a96`, the mesh step).
 *   ⚠ The example's ORANGE point light (below, `0xff7c00`) still warms it: the light is its own step. The bloom (the
 *   sketch bench's glow layer) is NOT here: without an MRT the material is a plain standard one (its own note).
 * - ⚠ The typeface carries NO KERNING (the browser kerns): the lines' widths differ a little from the page's, as on the
 *   sketch bench (its `fits` report it).
 */
const TEXT_TIPS: [THREE.Vector3, THREE.Vector3] = [new THREE.Vector3(-1531.69, FLOOR_Y, -0.14), new THREE.Vector3(-1097.45, FLOOR_Y, -0.14)];
const FONT_URLS = { bold: "/fonts/geist-bold.typeface.json", regular: "/fonts/geist-regular.typeface.json" } as const;

/** the subtext's two y tips in the sketch frame: its lowest vertices, split at the widest gap in x; each tip the middle of
 *  its cluster's extent (as the pixel reading took the middle of the lowest ink row) */
function yTips(g: THREE.BufferGeometry): [number, number, number] {
  const pos = g.getAttribute("position");
  let minY = Infinity;
  for (let i = 0; i < pos.count; i++) minY = Math.min(minY, pos.getY(i));
  const xs: number[] = [];
  for (let i = 0; i < pos.count; i++) if (pos.getY(i) < minY + 0.05) xs.push(pos.getX(i));
  xs.sort((a, b) => a - b);
  let cut = 1;
  for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] > xs[cut] - xs[cut - 1]) cut = i;
  const a = xs.slice(0, cut);
  const b = xs.slice(cut);
  return [(a[0] + a[a.length - 1]) / 2, (b[0] + b[b.length - 1]) / 2, minY];
}

async function buildText(): Promise<{ group: THREE.Group; unitsPerCm: number; dispose(): void }> {
  const loader = new FontLoader();
  const [bold, regular] = await Promise.all([loader.loadAsync(FONT_URLS.bold), loader.loadAsync(FONT_URLS.regular)]);
  const { geometries } = heroTextLayout({ bold, regular });
  const [x1, x2, tipY] = yTips(geometries[1]);
  let front = -Infinity;
  for (const g of geometries) {
    g.computeBoundingBox();
    front = Math.max(front, g.boundingBox!.max.z);
  }
  const S = (TEXT_TIPS[1].x - TEXT_TIPS[0].x) / (x2 - x1);
  const m = new THREE.Matrix4()
    .makeTranslation((TEXT_TIPS[0].x + TEXT_TIPS[1].x) / 2, FLOOR_Y, TEXT_TIPS[0].z)
    .multiply(new THREE.Matrix4().makeScale(S, S, S))
    .multiply(new THREE.Matrix4().makeTranslation(-(x1 + x2) / 2, -tipY, -front));
  const material = heroTextMaterial();
  const group = new THREE.Group();
  for (const g of geometries) {
    g.applyMatrix4(m);
    group.add(new THREE.Mesh(g, material));
  }
  return {
    group,
    unitsPerCm: S,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      material.dispose();
    },
  };
}

/** the environments the bench can show: OUR courtyard with the emblem (the default), the example's castle (comparison) */
export const HERO_ENVIRONMENTS = ["courtyard", "castle"] as const;
export type HeroEnvironment = (typeof HERO_ENVIRONMENTS)[number];

/** the simulation's values — the example's `effectController`, as plain data the bench's panel edits */
export type HeroSettings = {
  /** the liquid drawn and moved at all — OFF for now (Carl, 11 November 2026: *"Can you turn the blobs off for now while we
   *  work out the logo position. Given the blobs current trajectory, they would hit it anyway."*) */
  blobs: boolean;
  /** the environment the metals reflect and the liquid refracts — `HERO_ENVIRONMENTS` */
  environment: HeroEnvironment;
  material: string;
  speed: number;
  numBlobs: number;
  resolution: number;
  isolation: number;
  floor: boolean;
  wallx: boolean;
  wallz: boolean;
};

export type HeroScene = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  settings: HeroSettings;
  materials: Record<string, THREE.Material>;
  setMaterial(name: string): void;
  setEnvironment(name: HeroEnvironment): void;
  /** resolves when the cube map's loads have */
  ready: Promise<void>;
  /** the baked text (step 3 first), once built */
  text: THREE.Group | null;
  /** scene units per cm — from the baked text (`buildText`); null until it is built */
  unitsPerCm: number | null;
  /** the example's `render()` minus the draw and the clock: the field's time, resolution, isolation, `updateCubes` */
  update(delta: number): void;
  dispose(): void;
};

export function createHeroScene(aspect: number): HeroScene {
  const disposables: { dispose(): void }[] = [];
  const loads: Promise<void>[] = [];
  let time = 0;

  // CAMERA — the example's (45°, near 1, far 10000), at HOME
  const camera = new THREE.PerspectiveCamera(HOME.fov, aspect, 1, 10000);
  camera.position.set(...HOME.position);

  // SCENE
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  // LIGHTS
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(0.5, 0.5, 1);
  scene.add(light);

  const pointLight = new THREE.PointLight(0xff7c00, 3, 0, 0);
  pointLight.position.set(0, 0, 100);
  scene.add(pointLight);

  const ambientLight = new THREE.AmbientLight(0x323232, 3);
  scene.add(ambientLight);

  // MATERIALS
  const envs: Partial<Record<HeroEnvironment, { reflect: THREE.Texture; refract: THREE.Texture }>> = {};
  const materials = generateMaterials();

  // MARCHING CUBES
  let resolution = 28;
  const effect = new MarchingCubes(resolution, materials.shiny, true, true, 100000);
  effect.position.set(0, 0, 0);
  effect.scale.set(700, 700, 700);
  effect.enableUvs = false;
  effect.enableColors = false;

  // THE DRAW (header): the addon builds, a plain mesh sharing its geometry and material draws
  const view = new THREE.Mesh(effect.geometry, effect.material);
  view.position.copy(effect.position);
  view.scale.copy(effect.scale);
  scene.add(view);
  disposables.push(effect.geometry);

  // ⛔ THE TEXT IN THE WORLD (above)
  let text: THREE.Group | null = null;
  let unitsPerCm: number | null = null;
  let disposed = false;
  let textDispose: (() => void) | null = null;
  const textReady = buildText().then((t) => {
    if (disposed) return t.dispose();
    text = t.group;
    unitsPerCm = t.unitsPerCm;
    textDispose = t.dispose;
    scene.add(text);
  });

  const settings: HeroSettings = {
    // ON again (Carl, 11 November 2026: *"put the blobs back on and i will send you another screenshot"*), after the logo's
    // first take; they were OFF while its position was worked out
    blobs: true,
    environment: "courtyard",
    material: "shiny",
    speed: 1.0,
    numBlobs: 10,
    resolution: 28,
    isolation: 80,
    // ⛔ OFF (Carl, 11 November 2026, of the field's floor plane: *"yes we dont need it"*); the example's default was true.
    // Home was judged with it off
    floor: false,
    wallx: false,
    wallz: false,
  };

  function generateMaterials() {
    const path = "https://threejs.org/examples/textures/cube/SwedishRoyalCastle/";
    const format = ".jpg";
    const urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const loaded = () => {
      let done: () => void = () => {};
      loads.push(new Promise<void>((r) => (done = r)));
      return () => done();
    };
    const reflectionCube = cubeTextureLoader.load(urls, loaded());
    const refractionCube = cubeTextureLoader.load(urls, loaded());
    refractionCube.mapping = THREE.CubeRefractionMapping;

    const texture = new THREE.TextureLoader().load("https://threejs.org/examples/textures/uv_grid_opengl.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    disposables.push(reflectionCube, refractionCube, texture);

    // ⛔ OUR ENVIRONMENT: THE COURTYARD AND THE EMBLEM (11 November 2026, session 1; D-101). Carl had GPT make a night
    // courtyard of lit arches (the castle's effect, our own place; the Builder's prompt), then put the gold c2b emblem IN it:
    // *"thats why i asked it to put it in there! The form is going to be distorted by the blobs. this is our env map. Put it
    // in"*. `public/hero-bench/courtyard-emblem.jpg`: his 1536 × 1024 PNG cropped to 2:1 (1536 × 768, sky off the top, paving
    // off the bottom), JPEG, 415 KB (D-108: a load the site's hero would pay); its left and right edges join (checked). An
    // equirectangular map: reflection for the metals, refraction for the liquid (one image, two mappings). The castle kept
    // as a switch for comparison
    const courtyard = new THREE.TextureLoader().load("/hero-bench/courtyard-emblem.jpg", loaded());
    courtyard.mapping = THREE.EquirectangularReflectionMapping;
    courtyard.colorSpace = THREE.SRGBColorSpace;
    const courtyardRefract = courtyard.clone();
    courtyardRefract.mapping = THREE.EquirectangularRefractionMapping;
    disposables.push(courtyard, courtyardRefract);
    envs.courtyard = { reflect: courtyard, refract: courtyardRefract };
    envs.castle = { reflect: reflectionCube, refract: refractionCube };
    const env = envs.courtyard;

    const out: Record<string, THREE.Material> = {
      shiny: new THREE.MeshStandardMaterial({ color: 0x9c0000, envMap: env.reflect, roughness: 0.1, metalness: 1.0 }),
      chrome: new THREE.MeshLambertMaterial({ color: 0xffffff, envMap: env.reflect }),
      liquid: new THREE.MeshLambertMaterial({ color: 0xffffff, envMap: env.refract, refractionRatio: 0.85 }),
      matte: new THREE.MeshPhongMaterial({ specular: 0x494949, shininess: 1 }),
      flat: new THREE.MeshLambertMaterial({
        /*TODO flatShading: true */
      }),
      textured: new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x111111, shininess: 1, map: texture }),
      colors: new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 2, vertexColors: true }),
      multiColors: new THREE.MeshPhongMaterial({ shininess: 2, vertexColors: true }),
      plastic: new THREE.MeshPhongMaterial({ specular: 0xc1c1c1, shininess: 250 }),
    };
    disposables.push(...Object.values(out));
    return out;
  }

  // the example's `createHandler`
  function setEnvironment(name: HeroEnvironment) {
    const e = envs[name];
    if (!e) return;
    settings.environment = name;
    for (const [id, m] of Object.entries(materials)) {
      if (id !== "shiny" && id !== "chrome" && id !== "liquid") continue;
      (m as THREE.MeshStandardMaterial | THREE.MeshLambertMaterial).envMap = id === "liquid" ? e.refract : e.reflect;
      m.needsUpdate = true;
    }
  }

  function setMaterial(id: string) {
    const m = materials[id];
    if (!m) return;
    settings.material = id;
    effect.material = m;
    view.material = m;
    effect.enableUvs = id === "textured";
    effect.enableColors = id === "colors" || id === "multiColors";
  }

  // this controls content of marching cubes voxel field (the example's, unchanged)
  function updateCubes(object: MarchingCubes, time: number, numblobs: number, floor: boolean, wallx: boolean, wallz: boolean) {
    object.reset();

    const rainbow = [new THREE.Color(0xff0000), new THREE.Color(0xffbb00), new THREE.Color(0xffff00), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff), new THREE.Color(0x9400bd), new THREE.Color(0xc800eb)];
    const subtract = 12;
    const strength = 1.2 / ((Math.sqrt(numblobs) - 1) / 4 + 1);

    for (let i = 0; i < numblobs; i++) {
      const ballx = Math.sin(i + 1.26 * time * (1.03 + 0.5 * Math.cos(0.21 * i))) * 0.27 + 0.5;
      const bally = Math.abs(Math.cos(i + 1.12 * time * Math.cos(1.22 + 0.1424 * i))) * 0.77; // dip into the floor
      const ballz = Math.cos(i + 1.32 * time * 0.1 * Math.sin(0.92 + 0.53 * i)) * 0.27 + 0.5;

      if (settings.material === "multiColors") {
        object.addBall(ballx, bally, ballz, strength, subtract, rainbow[i % 7]);
      } else {
        object.addBall(ballx, bally, ballz, strength, subtract);
      }
    }

    if (floor) object.addPlaneY(2, 12);
    if (wallz) object.addPlaneZ(2, 12);
    if (wallx) object.addPlaneX(2, 12);

    object.update();
  }

  function update(delta: number) {
    // the field's time — the example's `time += delta * speed * 0.5`; the clock itself is the bench's
    view.visible = settings.blobs;
    // ⛔ THE ORANGE LIGHT BELONGS TO THE BLOBS (11 November 2026, session 1; Carl's idea, D-101): *"At the start of the scene
    // there are no blobs, no orange light needed. When the blobs come out of the logo it is needed and that affects the
    // text, not in a negative way but a caused by the world way. When the blobs reform into the logo, the lights are not
    // needed."* → the example's orange point light is ON only while the liquid is out (§14a: caused by the world, not
    // layered on it). For now it follows the blobs switch; later, the liquid's own phases drive it
    pointLight.visible = settings.blobs;
    if (!settings.blobs) return; // off: not drawn, not moved
    time += delta * settings.speed * 0.5;

    if (settings.resolution !== resolution) {
      resolution = settings.resolution;
      effect.init(Math.floor(resolution));
    }
    if (settings.isolation !== effect.isolation) {
      effect.isolation = settings.isolation;
    }

    updateCubes(effect, time, settings.numBlobs, settings.floor, settings.wallx, settings.wallz);
    // the addon (not in the scene) holds its transform; the view follows it
    view.position.copy(effect.position);
    view.scale.copy(effect.scale);
  }

  return {
    scene,
    camera,
    settings,
    materials,
    setMaterial,
    setEnvironment,
    ready: Promise.all([...loads, textReady]).then(() => undefined),
    get text() {
      return text;
    },
    get unitsPerCm() {
      return unitsPerCm;
    },
    update,
    dispose() {
      disposed = true;
      textDispose?.();
      for (const d of disposables) d.dispose();
    },
  };
}
