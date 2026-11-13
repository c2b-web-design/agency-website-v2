import * as THREE from "three";
import { ClippingGroup, MeshStandardNodeMaterial } from "three/webgpu";
import { mx_cell_noise_float, positionWorld, uniform } from "three/tsl";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { heroTextLayout } from "@/components/showcase/hero-text";
import { heroTextMaterial } from "@/components/showcase/hero-text-material";
import { HERO_LEAN, HERO_LOGO_METAL, HERO_LOGO_PLACE, HERO_LOGO_RED, LAND_WOBBLE, wobbleAngle } from "@/components/showcase/hero-logo";
import { loadStudioHdri, STUDIO_HDRI_SRC } from "@/lib/studio-hdri";
import { buildLogoMarkGeometry, LOGO_MARK_DEFAULTS } from "@/components/about/logo-mark-geometry";
import type { DeskMarkResult } from "@/components/about/desk-mark.worker";

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
 * first) are recorded in D-101 and `live-work/scripts/hero-ink-pixels-11-november.mjs`; the lean itself (R-103) stands.
 * ⛔ RE-BUILT ON THE 3D t (13 November 2026): `leanInSketch`, below the text. */

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

/** what the lean needs from the text, in the SKETCH's frame (world cm, as `heroTextLayout` lays it) and the similarity that
 *  carries that frame into this scene */
type SketchFrame = { toWorld: THREE.Matrix4; floorY: number; contact: THREE.Vector3; contactConstant: [number, number] };

/** the t's contact, MEASURED from the headline's glyph geometry (13 November 2026): of the headline's vertices within
 *  `CONTACT_SEARCH_CM` of the sketch's recorded contact (`HERO_LEAN.contact`, ⚠ unasserted there), the one a plane at the
 *  lean's angle meets first — the furthest along the back's normal (cos, sin, 0). So the contact is the glyph's, not a
 *  remembered number; the recorded one is kept beside it (`contactConstant`) as a check */
const CONTACT_SEARCH_CM = 25;
function tContact(headline: THREE.BufferGeometry): THREE.Vector3 {
  const a = THREE.MathUtils.degToRad(HERO_LEAN.deg);
  const c = Math.cos(a);
  const s = Math.sin(a);
  const [kx, ky] = HERO_LEAN.contact;
  const pos = headline.getAttribute("position");
  const best = new THREE.Vector3();
  let top = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    if (Math.hypot(x - kx, y - ky) > CONTACT_SEARCH_CM) continue;
    const d = c * x + s * y;
    if (d > top) {
      top = d;
      best.set(x, y, pos.getZ(i));
    }
  }
  return best;
}

async function buildText(): Promise<{ group: THREE.Group; unitsPerCm: number; sketch: SketchFrame; dispose(): void }> {
  const loader = new FontLoader();
  const [bold, regular] = await Promise.all([loader.loadAsync(FONT_URLS.bold), loader.loadAsync(FONT_URLS.regular)]);
  const { geometries } = heroTextLayout({ bold, regular });
  const [x1, x2, tipY] = yTips(geometries[1]);
  // the lean's contact, read BEFORE the geometry is moved (the sketch's frame)
  const contact = tContact(geometries[0]);
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
    // the sketch's floor for the lean is the text's y tips (`tipY`): the similarity puts them on `FLOOR_Y`
    sketch: { toWorld: m, floorY: tipY, contact, contactConstant: [...HERO_LEAN.contact] },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      material.dispose();
    },
  };
}

/**
 * ⛔ THE LOGO LEANING ON THE 3D "t" (13 November 2026; D-101). Carl: *"refer to the sketch and orient the logo in the same
 * position keeping the scale the same."* The sketch is the camera bench's lean (R-103, `components/showcase/hero-logo.tsx`,
 * `leanPose`): on its END, c on the floor, b against the t of "built", its top edge to the camera, its face to the right,
 * 12.5° from vertical; 2 m wide.
 * - THE SAME GEOMETRY: /about's desk mark (`buildLogoMarkGeometry`, `LOGO_MARK_DEFAULTS`), built by /about's own worker at
 *   the sketch's height in cm (`HERO_LOGO_PLACE.heightCm`, 103.9); inline if the worker cannot start.
 * - THE SAME POSE, IN THE SAME FRAME: the lean is solved in the SKETCH's frame (world cm), with the sketch's angle, depth
 *   (`HERO_LEAN.backZ`: the logo's far edge flush with the text's back) and solve, then carried by the SAME similarity as the
 *   text (`SketchFrame.toWorld`). So orientation, contact and SCALE are the text's: 2 m = 200 cm × `unitsPerCm` (~882 units).
 * - TWO DEPARTURES, both stated: (1) THE FLOOR is the text's y tips (`tipY`), where this scene's floor is — the sketch's
 *   floor was 1.57 cm BELOW them (its text floated; `HERO_LEAN.contact`'s note); (2) THE CONTACT is measured from the
 *   glyph geometry (`tContact`), not the recorded constant. Both moves are a fraction of a cm; `lean` reports them.
 * - THE MATERIAL: its OWN (`logoMaterial`, below) — not the liquid's `shiny` (the first take, 13 November, which mirrored
 *   the courtyard's amber arches).
 */

/**
 * ⛔ THE LOGO's OWN RED — NOTHING OF THE BLOBS' WORLD BEFORE THE BLOBS (13 November 2026; D-101). Carl, the blobs off:
 * *"seeing as the blobs are unseen at the moment, there is no need for the courtyard map effects to be felt. If a light or
 * map in the environment makes changes they should only happen when needed. For all intents and purposes there are no blobs
 * yet."* The courtyard (and the orange light) belong to the blobs; the logo at the start wears the sketch bench's red metal:
 * the BUTTON FAMILY's recipe in the blobs' red (`HERO_LOGO_METAL`, `HERO_LOGO_RED`, `hero-logo.tsx`; Carl: *"this is what
 * im after- a red version of this"*): metalness 1, roughness 0.4, the family's studio (`monochrome_studio_02`, its room
 * darkened to 0.1, turned 150°), strength 1. An equirectangular map, as the courtyard: WebGPU prefilters it the same way.
 * - NOT carried from the sketch: the glowing TEXT in its reflection (the sketch's `fromScene` capture) — its own step.
 * - ⚠ The lights differ from the sketch's (here the example's white directional 3 and grey ambient 3; there the two sketch
 *   lights): the light is its own step.
 * - ⛔ THE ENV TEXTURE's IDENTITY IN THE PROGRAM CACHE KEY: three r185's WebGPU program cache records a texture's KIND, not
 *   WHICH texture (D-101, "THE STALE REFLECTION"; `hero-logo.tsx`) — keyed here as there, so this material can never reuse
 *   a program built for the courtyard's.
 * - The logo is added only once its studio is on it: no stand-in, no dark first frame (the 10 November cold-load lesson).
 */
/**
 * ⛔ THE DISSOLVE — THE LOGO TAKEN AWAY AS THE BLOBS LEAVE (13 November 2026; D-101). Carl: *"if they emerge from top to
 * bottom some of the area where thy came from can go. maybe a fade as chunks are taken out of it"*. A FRONT (`front`, world
 * y, a uniform the scene moves) runs down the standing logo; every fragment is kept only below the front, the front broken
 * into CHUNKS (cells `chunk` units across, each with its own random offset within a `band`), so the logo is taken away
 * piece by piece across the band, not cut by a line. Before the emission the front sits far above (nothing taken). A node
 * material (the text's family, WebGPU TSL); the family red metal unchanged.
 * ⚰️ A SECOND TAKE (13 November 2026) drained the logo from each blob's own departure spot in the dance's order (takes 6–7
 * of the emission); WITHDRAWN with them — Carl: *"the logo disappears and blobs jusr spawn out of nowhere ... revert it to
 * when they came out from top to bottom"*.
 */
const DISSOLVE = { band: 160, chunk: 30 } as const;
/** the front's uniform (world y), far above until the emission — made here so its type is the float uniform's */
const makeFront = () => uniform(1e6);
function logoMaterial(studio: THREE.Texture, front: ReturnType<typeof makeFront>): MeshStandardNodeMaterial {
  const m = new MeshStandardNodeMaterial({ color: HERO_LOGO_RED, metalness: HERO_LOGO_METAL.metalness, roughness: HERO_LOGO_METAL.roughness });
  m.envMap = studio;
  m.envMapIntensity = HERO_LOGO_METAL.envMapIntensity;
  m.envMapRotation.set(0, THREE.MathUtils.degToRad(HERO_LOGO_METAL.yawDeg), 0);
  // keep a fragment while its height is under the front, offset per chunk by up to half the band either way
  const cell = mx_cell_noise_float(positionWorld.div(DISSOLVE.chunk));
  m.maskNode = positionWorld.y.lessThan(front.add(cell.sub(0.5).mul(DISSOLVE.band)));
  const key = `hero-scene-logo-env:${studio.uuid}`;
  m.customProgramCacheKey = () => key;
  return m;
}
type Lean = { local: THREE.Matrix4; matrix: THREE.Matrix4; contact: THREE.Vector3; lowestWorldY: number; widthUnits: number };
function leanInSketch(g: THREE.BufferGeometry, sketch: SketchFrame): Lean {
  const a = THREE.MathUtils.degToRad(HERO_LEAN.deg);
  const c = Math.cos(a);
  const s = Math.sin(a);
  // the axes (the sketch's): the mesh's +X (c → b) UP, tilted to the text; +Y (bottom → top edge) to the camera; +Z (the
  // face's normal) RIGHT. World Y of a vertex relative to the origin = c·x + s·z; the lowest goes on the floor
  const basis = new THREE.Matrix4().makeBasis(new THREE.Vector3(-s, c, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(c, s, 0));
  const p = g.getAttribute("position");
  let low = Infinity;
  for (let i = 0; i < p.count; i++) low = Math.min(low, c * p.getX(i) + s * p.getZ(i));
  const oy = sketch.floorY - low;
  // the flat back (normal (c, s, 0) through the origin) through the contact: c(Kx − Ox) + s(Ky − Oy) = 0
  const ox = sketch.contact.x + (s / c) * (sketch.contact.y - oy);
  const local = basis.setPosition(ox, oy, HERO_LEAN.backZ);
  const matrix = sketch.toWorld.clone().multiply(local);
  // checks, in the scene: the lowest vertex's height (must be FLOOR_Y) and the width (200 cm in units)
  const v = new THREE.Vector3();
  let lowest = Infinity;
  for (let i = 0; i < p.count; i++) lowest = Math.min(lowest, v.fromBufferAttribute(p, i).applyMatrix4(matrix).y);
  g.computeBoundingBox();
  const b = g.boundingBox!;
  const widthUnits = (b.max.x - b.min.x) * new THREE.Vector3().setFromMatrixScale(sketch.toWorld).x;
  return { local, matrix, contact: sketch.contact.clone().applyMatrix4(sketch.toWorld), lowestWorldY: lowest, widthUnits };
}

/**
 * ⛔ THE ARRIVAL — THE LOGO NOTICES THE VISITOR (13 November 2026; D-101). Carl: *"Lets deal with the logo movement when a
 * user arrives. it can jump up slightly, land on the same spot, upright and have a slight wobble. Go look at the /about
 * section on the site. The desk logo has a slight wobble there. That should guide you."* The sketch bench's jump (R-105,
 * *"Perfect"*; `hero-logo.tsx`, `useJump`) is the model; what changed is where it lands and how high it goes.
 * - THE HOLD: the logo appears LEANING and holds `holdS` (the sketch's 2 s) before it jumps — the page arriving, then the
 *   logo noticing it. A take.
 * - UPRIGHT, THE SAME PROFILE (the Builder's reading, the sketch's ruling: *"i didnt say turn it ... keep the same
 *   profile"*): the lean straightened to vertical, still ON ITS END, face to the right, top edge to the camera. The body
 *   only turns about the line toward the camera (world Z), evenly through the flight.
 * - THE SAME SPOT (the Builder's reading): the edge it RESTS on in the lean — the c's bottom edge on the BACK (the lowest
 *   point at 12.5°) — is where it stands after, the back on the same line; its depth unchanged.
 * - SLIGHTLY UP: the body's centre flies a BALLISTIC arc under real gravity (981 cm/s², in the sketch's cm), its top
 *   `apexCm` above the higher of its start and end; the flight's length follows from the height (20 cm → ~0.4 s). A take.
 * - THE WOBBLE: /about's desk mark's (`DESK_MARK_WOBBLE`: 3.75°, 2.25°, 1.125°, 0.5625°, each swing eased, 2 s; watched on
 *   the page 13 November, gentle and peripheral), as the sketch bench carried it: ROCKING SIDEWAYS on its thin end about
 *   the line — onto the face's bottom edge to the right, onto the back's to the left, the pivot changing side through
 *   upright; RIGHT first, from touchdown (the straightening carries its top that way). `LAND_WOBBLE`, `wobbleAngle`
 *   imported: one source.
 * - THE CLOCK: the scene's (`update`), from the moment the logo is added; `replayArrival()` restarts it (the bench's
 *   button). Played ONCE: the arrival is not a loop.
 */
// apexCm 20 → 60 (13 November 2026, with the landing moved to the dance's centre, ~1.4 m away): a 20 cm hop over that
// distance is a flat skim (~0.4 s); 60 cm is the sketch bench's approved jump (R-105: 0.7 s under the same gravity)
const ARRIVAL = { holdS: 2, apexCm: 60, g: 981 } as const;

/**
 * ⛔ THE MOULD — WHERE THE BLOBS RE-FORM THE LOGO (13 November 2026; D-101). Carl: *"go and look at the sketch bench. tou
 * will see the outline of a yellow logo. that is what the blobe must squeeze into. If it happens from behind we will only
 * see the shape come into being."* … *"in the space on the right in the proto hero viewport draw a yellow logo outline, it
 * should be the smae size as the upright logo but facing us in it normal orientation. Im looking for good spacing within
 * the viewport when the blobs are gone."* The sketch bench's face-on spot (`hero-logo.tsx`, `uprightPose` + the outline's
 * 40 cm raise): FACING US, upright, balanced in the space on the right (Carl's balance, 9 November: equal gaps t → logo →
 * the page frame's right edge), raised `raiseCm` — solved in the sketch's frame and carried by the text's similarity (as
 * the lean). Its floor is the y tips (`floorY`), as the lean's. The scene holds the POSE (the re-forming's target); the
 * yellow outline drawn there is the bench's guide. The spot is a take for Carl's spacing.
 */
const MOULD = { raiseCm: 40 } as const;
function mouldPose(g: THREE.BufferGeometry, sketch: SketchFrame): THREE.Matrix4 {
  g.computeBoundingBox();
  const b = g.boundingBox!;
  const local = new THREE.Matrix4().makeTranslation(HERO_LOGO_PLACE.centreX - (b.min.x + b.max.x) / 2, sketch.floorY - b.min.y + MOULD.raiseCm, HERO_LOGO_PLACE.face - b.max.z);
  return sketch.toWorld.clone().multiply(local);
}
type Arrival = { duration: number; touchdown: number; minCornerY: number; apexCm: number; flightS: number; at(t: number, out: THREE.Matrix4): void };
function arrivalPlan(g: THREE.BufferGeometry, lean: Lean, sketch: SketchFrame, land: THREE.Vector3 | null): Arrival {
  g.computeBoundingBox();
  const b = g.boundingBox!;
  const c = b.getCenter(new THREE.Vector3());
  // the lean, in the sketch's frame
  const p0 = new THREE.Vector3();
  const q0 = new THREE.Quaternion();
  lean.local.decompose(p0, q0, new THREE.Vector3());
  // the resting edge: the c's (x min) bottom edge on the BACK (z min) — its world x is the "spot"
  const restX = new THREE.Vector3(b.min.x, c.y, b.min.z).applyQuaternion(q0).add(p0).x;
  // UPRIGHT on its end, the same profile: +X up, +Y to the camera, +Z (the face) right; the c's lowest ink on the floor.
  // ⛔ WHERE (Carl's solution, 13 November 2026: *"we must bring the mountain and have our logo junp slap bang in the middle
  // of the blobs mass"*): its centre — the middle of its thickness (local z → world x) and of its depth (local y → world z)
  // — on the DANCE's centre (`land`, world; carried into the sketch's frame). ⚰️ Was the same spot (its back on `restX`,
  // the lean's depth): the dance's motion is fixed, and from there the blobs had too far to go
  const q1 = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0)));
  const p1 = new THREE.Vector3(restX - b.min.z, sketch.floorY - b.min.x, p0.z);
  if (land) {
    const s = land.clone().applyMatrix4(sketch.toWorld.clone().invert());
    p1.x = s.x - (b.min.z + b.max.z) / 2;
    p1.z = s.z - (b.min.y + b.max.y) / 2;
  }
  // the centre's ballistic arc: up `apexCm` over the higher end, down to the upright's centre
  const c0 = c.clone().applyQuaternion(q0).add(p0);
  const c1 = c.clone().applyQuaternion(q1).add(p1);
  const peak = Math.max(c0.y, c1.y) + ARRIVAL.apexCm;
  const vy = Math.sqrt(2 * ARRIVAL.g * (peak - c0.y));
  const T = vy / ARRIVAL.g + Math.sqrt((2 * (peak - c1.y)) / ARRIVAL.g);
  const W = LAND_WOBBLE.ms / 1000;
  const touchdown = ARRIVAL.holdS + T;
  // the rocking edges, local: the c's bottom on the FACE (z max, right) and on the BACK (z min, left)
  const front = new THREE.Vector3(b.min.x, c.y, b.max.z);
  const back = new THREE.Vector3(b.min.x, c.y, b.min.z);
  const Z = new THREE.Vector3(0, 0, 1);
  const q = new THREE.Quaternion();
  const r = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const k = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);
  const m = new THREE.Matrix4();
  /** the pose (sketch frame) at time t */
  const local = (t: number) => {
    if (t <= ARRIVAL.holdS) {
      q.copy(q0);
      pos.copy(p0);
    } else if (t < touchdown) {
      const s = t - ARRIVAL.holdS;
      q.slerpQuaternions(q0, q1, s / T);
      pos.lerpVectors(c0, c1, s / T);
      pos.y = c0.y + vy * s - (ARRIVAL.g * s * s) / 2;
      pos.sub(k.copy(c).applyQuaternion(q));
    } else {
      // the rock about the line (world Z) on the edge it leans onto: + = its top to the right, onto the face's edge
      const th = -wobbleAngle((t - touchdown) * 1000);
      const pivot = th >= 0 ? front : back;
      r.setFromAxisAngle(Z, -th);
      q.copy(r).multiply(q1);
      pos.copy(pivot).applyQuaternion(q1).add(p1);
      pos.sub(k.copy(pivot).applyQuaternion(q));
    }
    return m.compose(pos, q, one);
  };
  // the check: the lowest bounding-box corner over the flight (must not go through the floor)
  let minCornerY = Infinity;
  const corners = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => new THREE.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z));
  for (let i = 0; i <= 200; i++) {
    const L = local(ARRIVAL.holdS + (i / 200) * T);
    for (const v of corners) minCornerY = Math.min(minCornerY, k.copy(v).applyMatrix4(L).y);
  }
  return {
    duration: touchdown + W,
    touchdown,
    minCornerY: minCornerY - sketch.floorY,
    apexCm: peak - c0.y,
    flightS: T,
    at(t, out) {
      out.multiplyMatrices(sketch.toWorld, local(t));
    },
  };
}

/** /about's desk-mark geometry at `heightCm`, off the main thread by /about's worker (read, not changed); inline if the
 *  worker cannot start (it holds the main thread ~1 s) */
function logoGeometry(heightCm: number): Promise<THREE.BufferGeometry> {
  return new Promise((resolve) => {
    const inline = () => window.setTimeout(() => resolve(buildLogoMarkGeometry({ ...LOGO_MARK_DEFAULTS, scale: heightCm }).geometry), 0);
    let worker: Worker;
    try {
      worker = new Worker(new URL("../about/desk-mark.worker.ts", import.meta.url), { type: "module" });
    } catch {
      inline();
      return;
    }
    worker.onmessage = (e: MessageEvent<DeskMarkResult>) => {
      worker.terminate();
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(e.data.position, 3));
      g.setAttribute("normal", new THREE.BufferAttribute(e.data.normal, 3));
      g.setIndex(new THREE.BufferAttribute(e.data.index, 1));
      resolve(g);
    };
    worker.onerror = () => {
      worker.terminate();
      inline();
    };
    worker.postMessage({ scale: heightCm });
  });
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
  /** the logo leaning on the 3D t (`leanInSketch`), once built — not awaited by `ready` (the worker's ~1 s) */
  logo: THREE.Mesh | null;
  /** the lean's checks: the contact in the scene, the recorded and measured contacts (sketch cm), the lowest point, the width */
  lean: { contact: number[]; contactMeasuredCm: number[]; contactConstantCm: number[]; lowestY: number; floorY: number; widthUnits: number; widthCm: number } | null;
  /** the arrival's numbers (`arrivalPlan`): seconds, and the lowest corner over the flight above the floor (cm, ≥ 0) */
  arrival: { t: number; holdS: number; flightS: number; touchdownS: number; durationS: number; apexCm: number; minCornerAboveFloorCm: number; pool: number; poolHits: number[] } | null;
  /** plays the arrival again from the lean (the bench's button) */
  replayArrival(): void;
  /** the blobs' centres this frame, world units (born blobs only) — a READ-OUT for checks */
  blobs: number[][];
  /** THE MOULD (`mouldPose`): the logo's local → world matrix there, and the logo geometry's local bounds (cm) */
  mould: { matrix: THREE.Matrix4; bounds: THREE.Box3 } | null;
  /** the example's `render()` minus the draw and the clock: the field's time, resolution, isolation, `updateCubes` */
  update(delta: number): void;
  dispose(): void;
};

export function createHeroScene(aspect: number): HeroScene {
  const disposables: { dispose(): void }[] = [];
  const loads: Promise<void>[] = [];

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
  // ⛔ NOTHING OF THE LIQUID IS DRAWN BELOW THE FLOOR (13 November 2026; D-101; Carl: *"just the amber/gold disc at the top"*):
  // the round pool's body lies under the floor (so the blobs merge into its top, as the example's slab lay under our
  // floor); the floor is grid lines only, so that body and the pool's sinking rim showed THROUGH it. The liquid's mesh is
  // drawn inside a ClippingGroup cutting at `FLOOR_Y` (three r185's WebGPU renderer clips by GROUP; `material.clippingPlanes`
  // is WebGL's). The Builder's structure choice, stated: the liquid's mesh now has this group as its parent; nothing else
  // is in it. The field is unchanged by it — only what is drawn
  const belowFloor = new ClippingGroup();
  belowFloor.name = "hero liquid clip (floor)";
  belowFloor.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR_Y)];
  belowFloor.add(view);
  scene.add(belowFloor);
  disposables.push(effect.geometry);

  // ⛔ THE TEXT IN THE WORLD (above)
  let text: THREE.Group | null = null;
  let unitsPerCm: number | null = null;
  let disposed = false;
  let textDispose: (() => void) | null = null;
  const logoGeo = logoGeometry(HERO_LOGO_PLACE.heightCm);
  let logo: THREE.Mesh | null = null;
  let lean: HeroScene["lean"] = null;
  // the arrival (`arrivalPlan`) and THE STORY's clock (`storyT`, seconds since the logo appeared) — advanced in `update`;
  // the arrival plays on it once, the emission follows it
  let arrival: Arrival | null = null;
  let storyT = 0;
  /**
   * ⛔ THE EMISSION (13 November 2026; D-101). Carl: *"the blobs should come out of the logo over 500ms. if they emerge from
   * top to bottom some of the area where thy came from can go. maybe a fade as chunks are taken out of it"*; then *"slow it
   * down to 1s"*, *"try 1.5s"*, eased in and out. From the moment the wobble settles (`arrival.duration`), over `seconds`:
   * - THE LOGO TAKEN AWAY, TOP TO BOTTOM: the dissolve's front (`logoMaterial`) runs from above its top to below its foot,
   *   EASED (smoothstep of the time).
   * - THE BLOBS BORN AT THE FRONT (`birthOf`): blob i at its share of the logo's long axis (top first), at its middle, born
   *   as the front reaches that height; it SWELLS from nothing over `swellS`; held clear of the field box's left side by its
   *   own current radius (pushed out of the logo's FACE as it swells).
   * - THEY PEEL OFF INTO THE DANCE: each eases (smoothstep) from its birth spot onto its moving dance position over
   *   `blendS`, on ONE shared dance clock from the emission — the example's own choreography. ⚠ Known (Carl): one far blob
   *   moves too fast; his solution (*"about mountains and Muhammed"*) to come.
   *   ⚰️ Withdrawn, 13 November: takes 5–7 (each blob its own clock; worked backward from the dance with a drain: *"a lot
   *   worse"*; *"blobs jusr spawn out of nowhere"*) and take 8 (each path shifted to the blob, the Builder's reading of the
   *   proverb: *"no, thats not the version. the 1.5s version"* … *"with the original dance choreography"*).
   * - THE ORANGE LIGHT rises with the emission (the same eased share): 0 → `light`.
   * Values are takes. `replayArrival` restarts the whole story (the logo whole, no blobs).
   */
  // ⛔ TAKE 4 RESTORED EXACTLY (Carl: "no, thats not the version. the 1.5s version") — the shift ("the dance comes to the
  // blob", the Builder's reading of "mountains and Muhammed") was built and WITHDRAWN unseen; Carl's own solution to come
  // seconds 1.5 → 3 (Carl, on take 9, the logo in the middle: "slow the emission down by 50%" — half the speed, twice the
  // time); the swell and the hand-off unchanged (one variable)
  const EMISSION = { seconds: 3, swellS: 0.2, blendS: 0.7, light: 3 } as const;
  // the dissolve's front (world y): far above until the emission
  const dissolveFront = makeFront();
  // the settled logo: its pose and height (world), for the births and the front
  let settled: { matrix: THREE.Matrix4; bounds: THREE.Box3; topY: number; bottomY: number; box: THREE.Box3 } | null = null;
  let arrivalInfo: Omit<NonNullable<HeroScene["arrival"]>, "t" | "pool" | "poolHits"> | null = null;
  let mould: HeroScene["mould"] = null;
  const textReady = buildText().then((t) => {
    if (disposed) return t.dispose();
    text = t.group;
    unitsPerCm = t.unitsPerCm;
    textDispose = t.dispose;
    scene.add(text);
    // ⛔ THE LOGO ON THE 3D t (`leanInSketch`): once its geometry and the text's frame are both in
    // the studio is `loadStudioHdri`'s shared, cached texture: not disposed here (the sketch bench's rule)
    Promise.all([logoGeo, loadStudioHdri(STUDIO_HDRI_SRC, HERO_LOGO_METAL.room)]).then(([g, studio]) => {
      if (disposed) return g.dispose();
      const material = logoMaterial(studio, dissolveFront);
      disposables.push(g, material);
      const l = leanInSketch(g, t.sketch);
      logo = new THREE.Mesh(g, material);
      logo.name = "hero logo";
      // its pose is written whole each frame by the arrival (`update`)
      logo.matrixAutoUpdate = false;
      logo.matrix.copy(l.matrix);
      scene.add(logo);
      // the landing: the dance's centre (the field's middle, x and z; its height is the floor's)
      arrival = arrivalPlan(g, l, t.sketch, new THREE.Vector3(effect.position.x, FLOOR_Y, effect.position.z));
      storyT = 0;
      {
        const m = new THREE.Matrix4();
        arrival.at(arrival.duration, m);
        const b = g.boundingBox!.clone();
        const wb = b.clone().applyMatrix4(m);
        settled = { matrix: m, bounds: b, topY: wb.max.y, bottomY: wb.min.y, box: wb };
      }
      mould = { matrix: mouldPose(g, t.sketch), bounds: g.boundingBox!.clone() };
      const r = (v: number) => Math.round(v * 100) / 100;
      arrivalInfo = { holdS: ARRIVAL.holdS, flightS: r(arrival.flightS), touchdownS: r(arrival.touchdown), durationS: r(arrival.duration), apexCm: r(arrival.apexCm), minCornerAboveFloorCm: r(arrival.minCornerY) };
      lean = {
        contact: l.contact.toArray().map(r),
        contactMeasuredCm: t.sketch.contact.toArray().map(r),
        contactConstantCm: t.sketch.contactConstant,
        lowestY: r(l.lowestWorldY),
        floorY: FLOOR_Y,
        widthUnits: r(l.widthUnits),
        widthCm: r(l.widthUnits / t.unitsPerCm),
      };
    });
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
    // Home was judged with it off.
    // ⛔ ON AGAIN, AS OUR FLOOR (13 November 2026; Carl: *"make the floor solid for them"*): the switch now means the
    // SOLID floor and the ROUND POOL (`addLocalFloor`, `POOL`), not the example's square slab. It acts only with the blobs (the switch); it is drawn from the logo's TOUCHDOWN, growing from the landing (`POOL_GROW`).
    floor: true,
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

  /**
   * ⛔ THE FLOOR IS SOLID FOR THE BLOBS, AND ITS LIQUID ONLY WHERE THEY TOUCH (13 November 2026; D-101). Carl: *"The blobbs
   * currently go through the floor. We should make the floor solid for them, so the blobs partly merge with it and then
   * come out. The floor can be activated when the blobbs are emitted. The way they interact with it looks great, what is
   * not so good is the square they do it in. It would be better if the square is not there but where there is contact than
   * that effect is only local for the blobs. meaning only the immediate area that the blobs touch should have that orange
   * effect."* Three changes to the example's field, all inside it (no new object; the floor goes with the blobs):
   * 1. THE FLOOR ON A LAYER: the field is raised so one of its layers lies exactly on `FLOOR_Y` (`alignFieldToFloor`; at
   *    resolution 28 a layer is 50 units and the lift 12.5) — the cut below is then AT the floor, not between layers.
   * 2. SOLID: every layer BELOW the floor is emptied, and the layer ON it held just past the isolation (amended the same
   *    day: emptying that layer too left the liquid's foot up to a layer above the floor) — nothing ever below the floor.
   * 3. ⚰️ THE PUDDLE, LOCAL (first take, REPLACED the same day by the ROUND POOL, `POOL` below; Carl preferred the example's
   *    floor's interaction, "more fluid", without its square): the example's floor field weighted per column by how close
   *    a blob was. Its per-column CONTACT WEIGHT survives as the heat's source (`contact`): strongest under a blob whose
   *    bottom is at the floor, fading with the horizontal distance (σ = one blob radius) and its height (gone once its
   *    bottom is a radius clear).
   * 4. THE PATHS (the choreography Carl likes — the merges, the speed — kept): each blob's height (the example's
   *    `|cos|`, 0 → 0.77 of the field) is RE-SCALED so its lowest point presses `FLOOR_CONTACT.press` of a radius into the
   *    floor instead of sinking to the field's bottom (−700); the top (0.77) unchanged. Timing untouched.
   * The values are takes, for Carl's eye.
   */
  // press 0.4 → 0.65 (13 November 2026): with the squash (5, below) the deeper press is what spreads the mass
  const FLOOR_CONTACT = { sigmaR: 1, reachR: 1, press: 0.65 } as const;
  /**
   * 5. ⛔ THE SQUASH — A BLOB HITS THE FLOOR AND SPREADS ITS MASS (13 November 2026; D-101). Carl: *"the blobs dont hit the
   *    floor and spread their mass. Its notiable and from far away too. There is no interaction with the floor."* A blob
   *    whose sphere would go below the floor is added as an ELLIPSOID instead: its height × 1/s², its width and depth × s,
   *    so its VOLUME is unchanged (s · s · 1/s² = 1), with s = (r / (centre − floor))^0.35 — a little short of resting
   *    on the floor, so its bottom presses in and the solid floor flattens it into a contact patch (the call, below).
   *    At the deepest press (0.65 of a radius) s ≈ 1.44: 1.44 × as wide, 0.48 × as tall.
   *    The example's `|cos|` heights give a quick impact and rebound, so it splats and springs back. Field only (the
   *    palette is the multiColors material's: that material keeps the round ball).
   */
  function addSquashedBall(object: MarchingCubes, bx: number, by: number, bz: number, strength: number, subtract: number, s: number) {
    const size = object.resolution;
    const field = object.field;
    const sy = 1 / (s * s);
    const R = Math.sqrt(strength / subtract); // the field's reach (field units), as `addBall`'s
    const lo = (c: number, r: number) => Math.max(1, Math.floor((c - r) * size));
    const hi = (c: number, r: number) => Math.min(size - 1, Math.floor((c + r) * size));
    for (let z = lo(bz, R * s); z < hi(bz, R * s); z++) {
      const fz = (z / size - bz) / s;
      for (let y = lo(by, R * sy); y < hi(by, R * sy); y++) {
        const fy = (y / size - by) / sy;
        const off = size * size * z + size * y;
        for (let x = lo(bx, R * s); x < hi(bx, R * s); x++) {
          const fx = (x / size - bx) / s;
          const val = strength / (0.000001 + fx * fx + fy * fy + fz * fz) - subtract;
          if (val > 0) field[off + x] += val;
        }
      }
    }
  }
  /** raise the field so a layer lies on `FLOOR_Y`; returns that layer's index */
  function alignFieldToFloor(object: MarchingCubes): number {
    const size = object.resolution;
    const half = 700; // the field's half-height in units (`effect.scale`)
    const k = Math.round(((FLOOR_Y / half + 1) * size) / 2);
    object.position.y = FLOOR_Y - ((2 * k) / size - 1) * half;
    return k;
  }
  let floorLayer = alignFieldToFloor(effect);
  /**
   * ⛔ THE FLOOR's HEAT (13 November 2026; D-101). Carl: *"If the blobs are hot that might heat up the floor around the part
   * where the temporary merge happens, so that orange would be a local glow around where the blob merges with the floor. As
   * the blob exits, it would cool down the floor, going back to normal."*
   * - THE SOURCE: the per-column contact weight (`addLocalFloor` writes `contact`; it shaped the first take's puddle) — how
   *   close a blob is to the floor above that column. Squared, so the heat sits where the merge is, not at its faint edge.
   * - THE HEAT: per column, it RISES toward the contact (`riseS`) while a blob is merged, and COOLS back to nothing
   *   (`coolS`, exponential) after it leaves; a 3 × 3 soften so it glows AROUND the merge.
   * - THE GLOW: one flat plane on the floor over the field's footprint (`FLOOR_Y` + 0.5, over the bench's grid lines),
   *   ADDITIVE and unlit — black adds nothing, so only the heat shows; its colour from a ramp (deep red → orange → amber)
   *   written per column into a small texture (the field's resolution, 28 × 28), filtered across the floor.
   * - It is the blobs': drawn only while they are out and the floor is on. Values are takes.
   */
  const HEAT = { riseS: 0.25, coolS: 1.6, gain: 1.4 } as const;
  const HEAT_RAMP: [number, [number, number, number]][] = [
    [0, [0, 0, 0]],
    [0.3, [0.45, 0.04, 0]],
    [0.65, [1, 0.32, 0.02]],
    [1, [1, 0.62, 0.18]],
  ];
  let contact = new Float32Array(effect.resolution * effect.resolution);
  let heat = new Float32Array(contact.length);
  let heatData = new Uint8Array(contact.length * 4);
  let heatTex = new THREE.DataTexture(heatData, effect.resolution, effect.resolution, THREE.RGBAFormat);
  heatTex.magFilter = THREE.LinearFilter;
  heatTex.minFilter = THREE.LinearFilter;
  heatTex.colorSpace = THREE.SRGBColorSpace;
  const heatMat = new THREE.MeshBasicMaterial({ map: heatTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const heatPlane = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), heatMat);
  heatPlane.name = "hero floor heat";
  heatPlane.rotation.x = -Math.PI / 2;
  heatPlane.visible = false;
  scene.add(heatPlane);
  disposables.push(heatPlane.geometry, heatMat, { dispose: () => heatTex.dispose() });
  /** the texture's texel centres on the field's columns (column x at world (2x/size − 1) · 700) */
  function placeHeat() {
    const size = effect.resolution;
    if (contact.length !== size * size) {
      contact = new Float32Array(size * size);
      heat = new Float32Array(size * size);
      heatData = new Uint8Array(size * size * 4);
      heatTex.dispose();
      heatTex = new THREE.DataTexture(heatData, size, size, THREE.RGBAFormat);
      heatTex.magFilter = THREE.LinearFilter;
      heatTex.minFilter = THREE.LinearFilter;
      heatTex.colorSpace = THREE.SRGBColorSpace;
      heatMat.map = heatTex;
      heatMat.needsUpdate = true;
    }
    const cell = 1400 / size;
    // texel x's centre at the plane's −700 + (x + ½)·cell must be the column's x·cell − 700: the plane's centre −½ cell (z
    // likewise, through the flipped rows)
    heatPlane.position.set(effect.position.x - cell / 2, FLOOR_Y + 0.5, effect.position.z - cell / 2);
  }
  placeHeat();
  function stepHeat(dt: number) {
    const size = effect.resolution;
    const up = 1 - Math.exp(-dt / HEAT.riseS);
    const down = Math.exp(-dt / HEAT.coolS);
    for (let i = 0; i < heat.length; i++) {
      const target = Math.min(1, contact[i] * contact[i] * HEAT.gain);
      heat[i] = target > heat[i] ? heat[i] + (target - heat[i]) * up : heat[i] * down;
    }
    for (let z = 0; z < size; z++) {
      for (let x = 0; x < size; x++) {
        // the 3 × 3 soften
        let h = 0;
        let n = 0;
        for (let dz = -1; dz <= 1; dz++) {
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            const zz = z + dz;
            if (xx < 0 || zz < 0 || xx >= size || zz >= size) continue;
            const k = dx === 0 && dz === 0 ? 4 : dx === 0 || dz === 0 ? 2 : 1;
            h += heat[size * zz + xx] * k;
            n += k;
          }
        }
        h = Math.min(1, h / n);
        let j = 1;
        while (j < HEAT_RAMP.length - 1 && h > HEAT_RAMP[j][0]) j++;
        const [h0, c0] = HEAT_RAMP[j - 1];
        const [h1, c1] = HEAT_RAMP[j];
        const u = Math.min(1, Math.max(0, (h - h0) / (h1 - h0)));
        // the texture's row 0 is the plane's +Z edge (turned flat): column z → row size − 1 − z
        const o = 4 * (size * (size - 1 - z) + x);
        for (let c = 0; c < 3; c++) heatData[o + c] = Math.round(255 * (c0[c] + (c1[c] - c0[c]) * u));
        heatData[o + 3] = 255;
      }
    }
    heatTex.needsUpdate = true;
  }

  /** the round pool, the heat's contact weights and the solid floor, after the balls are in */
  /**
   * ⛔ THE CONTAINER IS A SPHERE; THE FLOOR's LIQUID A ROUND POOL (13 November 2026; D-101). Carl, of the example's floor and
   * walls: *"i like the way they interact with the floor/walls a lot better. Its more fluid. What is putting me off is the
   * square shape."* … *"so this field doesnt have to be a box. Can it be a sphere with a gradient on it. Circular to match the
   * blobs. Curves."* … *"build it and show me."* The field's GRID stays a box (marching cubes needs an even grid; it is only
   * the calculation, never drawn); the CONTAINER's shape is a spherical gradient on it, inside the box (the box is the only
   * place liquid can exist, so the sphere must fit in it): full strength to `fadeFrom` of the box's half-width from its
   * centre, smoothly to NOTHING at `fadeTo` (short of the box's faces, and of the outer layer marching cubes skips).
   * - THE POOL: the example's floor liquid at the example's own strength (`addPlaneY(2, 12)`: the merging Carl likes),
   *   rising from OUR floor instead of the box's bottom, × the sphere's gradient. Where the floor cuts the sphere the shape
   *   is a CIRCLE: a round pool, deepest in the middle (~200 units), thinning to nothing at its rim (~480 units out).
   *   It REPLACES the local puddle (3, above). The solid floor, the squash and the heat are unchanged (one variable).
   * - The blobs are NOT faded: their paths stay inside the sphere (the example's choreography, kept).
   * - ⚠ THE WALLS (wallx, wallz) are still the example's, square: they lie ON the box's faces, outside any sphere that fits
   *   inside it — faded, they would vanish. Where a wall stands is Carl's (the choreography's "right wall"), not built.
   */
  // fadeFrom 0.3 → 0.4 (13 November 2026, before Carl saw it): at 0.3 the fade began at the pool's centre (the floor is 0.32
  // from the sphere's centre) and the pool read as a DOME; at 0.4 it is flat — the example's slab — to ~330 units out, and
  // only its last ~150 units thin to the rim
  // topLift (take 2, the disc): the pool's flat top this many units above the floor (~3 cm); its body below, clipped
  const POOL = { strength: 2, subtract: 12, fadeFrom: 0.4, fadeTo: 0.47, topLift: 12 } as const;
  /**
   * ⛔ THE DISC GROWS FROM THE LANDING (13 November 2026, session 2; D-101). Carl: *"the fluid disc appears complete out of
   * nowhere ... Is it possible to use a radial nasc on the fluid disc? So when the logo hits the floor if starts from the
   * middle and by time the blobs appear it will be complete."* → a RADIAL MASK on the pool about the LANDING (the logo lands
   * on the dance's centre, which is the disc's: the field's middle), × the sphere's fade above: its radius 0 at TOUCHDOWN,
   * growing EASED (smoothstep) to past the full disc by the FIRST BLOB's birth (`poolGrow`, `update`: tied to that moment,
   * not a fixed time, so it follows the emission's length). A soft edge `edge` wide (field units; ~19 cm) inside its
   * radius: where the mask thins the pool's top sinks below the floor, as at the disc's own rim. Values are takes.
   * ✔ Take 1 (the full disc by the first blob): Carl, *"That looks great."*
   * ⛔ TAKE 2 — THE BLOBS FEED IT (Carl: *"can the disc be partially unmasked si it look like it added to the disc mass?"* …
   * *"it doesnt have to be accurate by volume, just look as if it has"*): by the first blob the disc reaches `atFirst` of
   * its radius (eased from touchdown as take 1); then EACH BIRTH eases the edge out one equal step over `stepS`, so it
   * reaches the full disc as the last blob leaves the logo's foot (the logo gone with it). Births, not floor touches: the
   * touches measured too sparse (two at birth, then 3.2 s, 3.7 s, ~1 s apart after: `hero-floor-contacts-13-november.mjs`).
   * ✗ Carl, on take 2: *"the timing is slight off. the disc grows, stops and grows again before the blobs hit it."* (seen in
   * its frames: eased OUT to half at the first birth, a stop, then grown by births high on the logo, ~1.3 s before the
   * first blob reaches the disc).
   * ⛔ TAKE 3 — IT GROWS WHEN A BLOB REACHES IT: (1) from touchdown the disc SPREADS as a poured liquid, fast then ever
   * slower, never a hard stop: `atFirst` × (1 − e^(−t / `spreadS`)); (2) each time a blob comes DOWN INTO the disc (its
   * sphere's bottom within `reach` of a radius of the pool's top, its centre over the disc as it stands: `updateCubes`, a
   * rising edge per blob) the edge eases out one step of (1 − `atFirst`) / `hits` over `stepS` from that frame; full
   * after `hits` arrivals. Detected live, so it follows the dance if the dance changes.
   * ✔ Take 3: Carl, *"Nailed it, that looks great."*
   */
  const POOL_GROW = { edge: 0.06, atFirst: 0.5, spreadS: 1.2, hits: 4, reach: 0.5, stepS: 0.5 } as const;
  // the mask's radius share, 0 → 1 (`update`); the read-out `arrival.pool`
  let poolGrow = 0;
  // take 3: the arrivals in the disc (emission seconds) and each blob's last state (in the disc or not); cleared before
  // the emission
  let poolHits: number[] = [];
  let poolIn: boolean[] = [];
  function addLocalFloor(object: MarchingCubes, balls: [number, number, number][], radius: number) {
    const size = object.resolution;
    const field = object.field;
    const k = floorLayer;
    const floorC = k / size;
    // the mask's radius (field units, about the field's middle): 0 → the full disc (the sphere's section at the floor) plus
    // its soft edge, so at 1 it no longer touches the disc
    const fullR = Math.sqrt(Math.max(0, POOL.fadeTo ** 2 - (floorC - 0.5) ** 2));
    const maskR = poolGrow * (fullR + POOL_GROW.edge);
    const sigma2 = 2 * (FLOOR_CONTACT.sigmaR * radius) ** 2;
    // the pool's base: one slab-depth (where strength / dy² − subtract = isolation) below its top; its top `topLift` units
    // ABOVE the floor (clear of the grid's lines and the clip at the floor)
    const baseC = floorC + POOL.topLift / 1400 - Math.sqrt(POOL.strength / (object.isolation + POOL.subtract));
    const kb = Math.max(1, Math.ceil(baseC * size));
    const near = balls.map(([x, y, z]) => ({ x, z, p: Math.min(1, Math.max(0, 1 - (y - radius - floorC) / (FLOOR_CONTACT.reachR * radius))) })).filter((b) => b.p > 0);
    for (let z = 0; z < size; z++) {
      const fz = z / size;
      for (let x = 0; x < size; x++) {
        const fx = x / size;
        // the column's weight: the nearest contact's
        let w = 0;
        for (const b of near) w = Math.max(w, b.p * Math.exp(-((fx - b.x) ** 2 + (fz - b.z) ** 2) / sigma2));
        // the heat's source (`stepHeat`): the same weight
        contact[size * z + x] = w;
        const col = size * size * z + x;
        // THE POOL (above), its TOP AT THE FLOOR (13 November 2026, take 2; Carl: "just the amber/gold disc at the top"):
        // the example's slab measured from a BASE one slab-depth below the floor, so its flat top face lies ON the floor and
        // its body below it, as the example's lay below our floor. Faded by the sphere's section AT THE FLOOR (a disc): where
        // the fade thins it, its top sinks below the floor — the disc's soft edge
        const d = Math.sqrt((fx - 0.5) ** 2 + (fz - 0.5) ** 2 + (floorC - 0.5) ** 2);
        const u = Math.min(1, Math.max(0, (d - POOL.fadeFrom) / (POOL.fadeTo - POOL.fadeFrom)));
        // × the radial mask (POOL_GROW, above): 1 inside its soft edge, 0 past its radius
        const rho = Math.sqrt((fx - 0.5) ** 2 + (fz - 0.5) ** 2);
        const fade = (1 - u * u * (3 - 2 * u)) * (1 - smooth((rho - maskR + POOL_GROW.edge) / POOL_GROW.edge));
        if (fade > 0.01) {
          for (let y = kb; y < size; y++) {
            const dy = y / size - baseC;
            if (POOL.strength / (dy * dy) - POOL.subtract <= 0) break; // past the slab's reach at full strength
            const val = (fade * POOL.strength) / (0.0001 + dy * dy) - POOL.subtract;
            if (val > 0) field[col + size * y] += val;
          }
          // solid below the pool's base
          for (let y = 0; y < kb; y++) field[col + size * y] = 0;
          continue;
        }
        // off the disc — solid: nothing BELOW the floor; the layer ON it held just past the surface where there is liquid,
        // so the bottom forms AT the floor (13 November 2026: emptying this layer too left a foot a layer, 50 units, above it)
        for (let y = 0; y < k; y++) field[col + size * y] = 0;
        const on = col + size * k;
        field[on] = Math.min(field[on], object.isolation * 1.0001);
      }
    }
  }

  // this controls content of marching cubes voxel field (the example's, with OUR floor: above)
  const smooth = (u: number) => {
    const c = Math.min(1, Math.max(0, u));
    return c * c * (3 - 2 * c);
  };
  // the shared dance clock (the example's `time`), from the emission
  let danceT = 0;
  let blobRead: number[][] = [];
  /** blob i's path (field units) at dance time t — the example's formulas, the floor's re-scaled heights */
  function pathAt(i: number, t: number, low: number, floor: boolean): [number, number, number] {
    const x = Math.sin(i + 1.26 * t * (1.03 + 0.5 * Math.cos(0.21 * i))) * 0.27 + 0.5;
    const dip = Math.abs(Math.cos(i + 1.12 * t * Math.cos(1.22 + 0.1424 * i))) * 0.77; // the example's dip into the floor
    const y = floor ? low + (dip / 0.77) * (0.77 - low) : dip;
    const z = Math.cos(i + 1.32 * t * 0.1 * Math.sin(0.92 + 0.53 * i)) * 0.27 + 0.5;
    return [x, y, z];
  }
  /** the field's blob values for n blobs: the example's strength, the visible radius (field units: where strength / r² −
   *  12 = isolation) and the paths' lowest point (pressed `press` of a radius into the floor) */
  function fieldParams(n: number, isolation: number, resolution: number) {
    const baseStrength = 1.2 / ((Math.sqrt(n) - 1) / 4 + 1);
    const radius = Math.sqrt(baseStrength / (isolation + 12));
    const low = floorLayer / resolution + (1 - FLOOR_CONTACT.press) * radius;
    return { baseStrength, radius, low };
  }
  const toField = (w: number, o: number) => ((w - o) / 700 + 1) / 2;
  /** the smoothstep's inverse on [0, 1]: x = ½ − sin(asin(1 − 2y) / 3) */
  const smoothInverse = (y: number) => 0.5 - Math.sin(Math.asin(Math.min(1, Math.max(-1, 1 - 2 * y))) / 3);
  /** blob i of n's birth (the emission, above): its spot in FIELD coordinates and its time after the emission starts —
   *  top first, at its share of the logo's long axis, when the (eased) front reaches that height */
  const birthWorld = new THREE.Vector3();
  function birthOf(i: number, n: number): { x: number; y: number; z: number; t: number } | null {
    if (!settled) return null;
    const b = settled.bounds;
    const f = (i + 0.5) / n;
    // the long axis (local x: c → b, UP when standing): top first; the middle of its depth and thickness
    birthWorld.set(b.max.x - f * (b.max.x - b.min.x), (b.min.y + b.max.y) / 2, (b.min.z + b.max.z) / 2).applyMatrix4(settled.matrix);
    const len = settled.topY - settled.bottomY;
    // when the front (from `band`/2 above the top to `band`/2 below the foot) reaches that height
    const u = (f * len + DISSOLVE.band / 2) / (len + DISSOLVE.band);
    // the front is EASED (`update`): it reaches share u of its run at the time the smoothstep's INVERSE gives
    return { x: toField(birthWorld.x, effect.position.x), y: toField(birthWorld.y, effect.position.y), z: toField(birthWorld.z, effect.position.z), t: smoothInverse(u) * EMISSION.seconds };
  }

  function updateCubes(object: MarchingCubes, delta: number, numblobs: number, floor: boolean, wallx: boolean, wallz: boolean, emitT: number) {
    object.reset();

    const rainbow = [new THREE.Color(0xff0000), new THREE.Color(0xffbb00), new THREE.Color(0xffff00), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff), new THREE.Color(0x9400bd), new THREE.Color(0xc800eb)];
    const subtract = 12;
    const { baseStrength, radius, low } = fieldParams(numblobs, object.isolation, object.resolution);
    const balls: [number, number, number][] = [];
    const ids: number[] = [];
    // the shared dance clock, at the dance's full pace from the emission (the pool alone before it: the clock waits)
    if (emitT >= 0) danceT += delta * settings.speed * 0.5;
    for (let i = 0; i < numblobs; i++) {
      // ⛔ THE EMISSION (above): not yet born → not in the field; born → swelling out of the logo, easing onto its dance
      const birth = birthOf(i, numblobs);
      if (!birth) continue;
      const age = emitT - birth.t;
      if (age < 0) continue;
      const [pathx, pathy, pathz] = pathAt(i, danceT, low, floor);
      const grow = smooth(age / EMISSION.swellS);
      // take 4's hand-off: eased (smoothstep) from its birth spot onto its moving dance position over `blendS`
      const e = smooth(age / EMISSION.blendS);
      const strength = baseStrength * grow;
      const r = radius * Math.sqrt(grow);
      // clear of the box's left side by its own radius and the undrawn outer layer
      const bx = Math.max(birth.x, r + 1.5 / object.resolution);
      const ballx = bx + (pathx - bx) * e;
      const bally = birth.y + (pathy - birth.y) * e;
      const ballz = birth.z + (pathz - birth.z) * e;
      balls.push([ballx, bally, ballz]);
      ids.push(i);

      // the squash (5, above): only where its sphere would go below the floor
      const above = bally - floorLayer / object.resolution;
      // s = (r / above)^0.35, not ^0.5: ^0.5 would rest the ellipsoid's round bottom ON the floor (a point of contact); a
      // little less squash leaves its bottom pressed into the floor, which the solid floor flattens into a CONTACT PATCH
      // (at the deepest press: s 1.44, 0.48 × as tall, the bottom 0.13 of a radius in, the patch ~one radius across)
      const s = floor && above < r ? Math.pow(r / Math.max(above, 0.05 * r), 0.35) : 1;
      if (settings.material === "multiColors") {
        object.addBall(ballx, bally, ballz, strength, subtract, rainbow[i % 7]);
      } else if (s > 1) {
        addSquashedBall(object, ballx, bally, ballz, strength, subtract, s);
      } else {
        object.addBall(ballx, bally, ballz, strength, subtract);
      }
    }

    // ⛔ THE DISC's ARRIVALS (take 3, `POOL_GROW`): a blob whose bottom comes within `reach` of a radius of the pool's top,
    // over the disc as it stands, is an ARRIVAL on its rising edge (once per blob per descent)
    if (floor) {
      const poolTop = floorLayer / object.resolution + POOL.topLift / 1400;
      const fullR = Math.sqrt(Math.max(0, POOL.fadeTo ** 2 - (floorLayer / object.resolution - 0.5) ** 2));
      const discR = poolGrow * (fullR + POOL_GROW.edge) - POOL_GROW.edge;
      for (let k = 0; k < balls.length; k++) {
        const [x, y, z] = balls[k];
        const i = ids[k];
        const on = y - radius <= poolTop + POOL_GROW.reach * radius && Math.hypot(x - 0.5, z - 0.5) <= Math.max(discR, 0);
        if (on && !poolIn[i] && poolHits.length < POOL_GROW.hits) poolHits.push(emitT);
        poolIn[i] = on;
      }
    }

    // the read-out (`blobs`): each born blob's centre, world units, with its index
    blobRead = balls.map(([x, y, z], k) => [ids[k], (2 * x - 1) * 700 + object.position.x, (2 * y - 1) * 700 + object.position.y, (2 * z - 1) * 700 + object.position.z]);
    if (floor) addLocalFloor(object, balls, radius);
    if (wallz) object.addPlaneZ(2, 12);
    if (wallx) object.addPlaneX(2, 12);

    object.update();
  }

  function update(delta: number) {
    // ⛔ THE ARRIVAL (`arrivalPlan`): the logo's pose on the story's clock, once; still after it settles
    const wasT = storyT;
    if (logo) storyT += delta;
    if (logo && arrival && wasT <= arrival.duration) {
      arrival.at(Math.min(storyT, arrival.duration), logo.matrix);
      logo.matrixWorldNeedsUpdate = true;
    }
    // ⛔ THE EMISSION (above): seconds since it started, or −1 before
    const emitT = arrival && settled && storyT >= arrival.duration ? storyT - arrival.duration : -1;
    // ⛔ EASED IN AND OUT (13 November 2026; Carl: "have you used eaing im/out for the emission?" … "yes"): the front and the
    // light follow a smoothstep of the time (a gentle start at the top, quickest through the middle, a soft finish at the
    // c); the births follow the front (`birthOf`)
    const emitted = emitT < 0 ? 0 : smooth(emitT / EMISSION.seconds);
    if (settled && logo) {
      const len = settled.topY - settled.bottomY;
      dissolveFront.value = emitT < 0 ? 1e6 : settled.topY + DISSOLVE.band / 2 - (len + DISSOLVE.band) * emitted;
      logo.visible = emitted < 1;
    }
    // ⛔ THE DISC GROWS FROM THE LANDING (`POOL_GROW`, take 3): from TOUCHDOWN it spreads (fast, then ever slower, toward
    // `atFirst`), then each ARRIVAL of a blob in it (`updateCubes`) eases it out a step — so the liquid is DRAWN from
    // touchdown, the pool alone until the blobs
    if (emitT < 0) {
      poolHits = [];
      poolIn = [];
    }
    const poolT = arrival && settled ? storyT - arrival.touchdown : -1;
    if (poolT < 0) poolGrow = 0;
    else {
      poolGrow = POOL_GROW.atFirst * (1 - Math.exp(-poolT / POOL_GROW.spreadS));
      for (const h of poolHits) poolGrow += ((1 - POOL_GROW.atFirst) / POOL_GROW.hits) * smooth((emitT - h) / POOL_GROW.stepS);
      poolGrow = Math.min(1, poolGrow);
    }
    const live = settings.blobs && (emitT >= 0 || (settings.floor && poolT >= 0));
    // the field's time — the example's `time += delta * speed * 0.5`; the clock itself is the bench's
    view.visible = live;
    // ⛔ THE ORANGE LIGHT BELONGS TO THE BLOBS (11 November 2026, session 1; Carl's idea, D-101): *"At the start of the scene
    // there are no blobs, no orange light needed. When the blobs come out of the logo it is needed and that affects the
    // text, not in a negative way but a caused by the world way. When the blobs reform into the logo, the lights are not
    // needed."* → the example's orange point light is ON only while the liquid is out (§14a: caused by the world, not
    // layered on it). ⛔ 13 November 2026: it RISES with the emission (0 → `EMISSION.light` over its 500 ms; Carl, 11
    // November: *"as more blobs drain or reform putting it on a fade is a good idea"*) — ⚰️ superseded the same day by the blobs
    // out (below); the re-forming's fall comes later
    // the light and the heat wait for the EMISSION, not the pool (the blobs' light comes with the blobs)
    const blobsOut = live && emitT >= 0;
    pointLight.visible = blobsOut;
    // ⛔ THE LIGHT IS THE BLOBS' OUT (13 November 2026, session 2; Carl: *"the pre blob text is ice blue when the blobs
    // appear it turns a tinge of orange ... If you can make it better and more accurate by this 0.7s that would be great"*):
    // it rose with the emission's eased share, ~0.7 s BEFORE the first blob (0.22 of full by then). Now each blob adds its
    // 1/n as it SWELLS out of the logo (the same `swellS` smoothstep as its size): 0 until the first birth, full when the
    // last blob is out
    let out = 0;
    if (emitT >= 0) {
      const n = settings.numBlobs;
      for (let i = 0; i < n; i++) {
        const b = birthOf(i, n);
        if (b && emitT >= b.t) out += smooth((emitT - b.t) / EMISSION.swellS) / n;
      }
    }
    pointLight.intensity = EMISSION.light * out;
    // the floor's heat (`stepHeat`) is the blobs' and the floor's: hidden and cleared without them
    heatPlane.visible = blobsOut && settings.floor;
    if (!heatPlane.visible) heat.fill(0);
    // before the emission the dance's clock waits at its start
    if (emitT < 0) danceT = 0;
    // before touchdown (or the blobs off): not drawn, not moved; the read-out emptied (it held the last run's blobs)
    if (!live) {
      blobRead = [];
      return;
    }

    if (settings.resolution !== resolution) {
      resolution = settings.resolution;
      effect.init(Math.floor(resolution));
      floorLayer = alignFieldToFloor(effect);
      placeHeat();
    }
    if (settings.isolation !== effect.isolation) {
      effect.isolation = settings.isolation;
    }

    updateCubes(effect, delta, settings.numBlobs, settings.floor, settings.wallx, settings.wallz, emitT);
    if (blobsOut && settings.floor) stepHeat(delta);
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
    get logo() {
      return logo;
    },
    get lean() {
      return lean;
    },
    get arrival() {
      return arrivalInfo ? { t: Math.round(storyT * 100) / 100, ...arrivalInfo, pool: Math.round(poolGrow * 1000) / 1000, poolHits: poolHits.map((h) => Math.round(h * 100) / 100) } : null;
    },
    replayArrival() {
      storyT = 0;
      danceT = 0;
      if (logo) logo.visible = true;
    },
    get blobs() {
      return blobRead;
    },
    get mould() {
      return mould;
    },
    update,
    dispose() {
      disposed = true;
      textDispose?.();
      for (const d of disposables) d.dispose();
    },
  };
}
