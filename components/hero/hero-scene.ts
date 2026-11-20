import * as THREE from "three";
import { ClippingGroup, MeshBasicNodeMaterial, MeshPhysicalNodeMaterial, type Node, type WebGPURenderer } from "three/webgpu";
import { acesFilmicToneMapping, cameraWorldMatrix, float, interleavedGradientNoise, lights, materialColor, mix, mx_cell_noise_float, mx_noise_float, mx_noise_vec3, normalView, output, pmremTexture, positionLocal, positionViewDirection, positionWorld, pow4, roughness, screenCoordinate, smoothstep, texture, transformNormalToView, normalLocal, uniform, vec2, vec3, vec4 } from "three/tsl";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { heroTextLayout } from "@/components/showcase/hero-text";
import { heroTextMaterial } from "@/components/showcase/hero-text-material";
import { HERO_LEAN, HERO_LOGO_METAL, HERO_LOGO_PLACE, HERO_LOGO_RED, LAND_WOBBLE, wobbleAngle } from "@/components/showcase/hero-logo";
import { loadStudioHdri, STUDIO_HDRI_SRC } from "@/lib/studio-hdri";
import { buildLogoMarkGeometry, LOGO_MARK_DEFAULTS } from "@/components/about/logo-mark-geometry";
import type { DeskMarkResult } from "@/components/about/desk-mark.worker";
import { createHeroRain, HIT, type HeroRainInfo, type HeroRainSettings } from "./hero-rain";
import type { HeroCodeSettings } from "./hero-code-drops";
import { createHeroCloth, type HeroCloth } from "./hero-cloth";
import { createHeroSteam, MARGIN, type HeroSteamInfo, type HeroSteamSettings } from "./hero-steam";
import { createHeroHeat, type HeroHeat, type HeroHeatInfo, type HeroHeatSettings } from "./hero-heat";
import { createHeroFloor, type HeroFloorInfo, type HeroFloorSettings } from "./hero-floor";
import { faceMaps, landedMaps, type FaceRequest, type FaceResult, type FlowCheck, type FlowData, type InkGrid, type LandedRequest, type LandedResult, type MapsMessage, type MapsReply, type RunoffCheck, type RunoffData } from "./hero-maps.worker";
import { LOGO_BLUE_DEFAULTS, LOGO_JUDGING_STUDIO, platinumBlueF0 } from "@/components/about/logo-mark-material";

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
/**
 * ⛔ THE FLOW MAP — THE LOGO FILLS AS A CONTAINER (13 November 2026, session 2; D-101). Carl: *"The blobs converge on the
 * letter c. you should slow the fill down slightly. If the fluid id in c, it spreads to the 2. Some fluid would go up the 2
 * stem, negotiate the curve at the top. Some fluid would travel along the bottom towards the b. It would negotiate the long
 * bend and pour into the bottom part of the bs stem. Fill that up and them the top of the stem. The fluid would behave
 * exactly as it should in a "container" like that."* → made ONCE from the logo's own geometry: its triangles drawn flat
 * onto its face (local x, y) at `FLOW.perCm` cells per cm (the INK); from the ink nearest the c's entry, the distance the
 * liquid must travel INSIDE the ink to each cell (8-way, a priority flood) — so it goes round the c, into the 2, up its stem and
 * over its top curve, and along the bottom, round the long bend, into the foot of the b's stem and up it. Normalised 0–1;
 * cells off the ink take their nearest ink cell's value (the bevels' edges sample cleanly). GRAVITY added before Carl saw
 * it (the order below: the low road first; a pocket under an inflow fills from its floor up — *"pour into the bottom part
 * of the bs stem. Fill that up and them the top"*). Stored as each cell's RANK: `level(share)` = the share itself, the
 * poured share of the ink's AREA (the liquid's volume, not its reach).
 */
const FLOW = { perCm: 2, gravity: 1, noiseScale: 0.18, noiseAmp: 0.012 } as const;
type FlowMap = { tex: THREE.DataTexture; minX: number; minY: number; sizeX: number; sizeY: number; level(share: number): number; check: FlowCheck };
/**
 * THE LOGO's INK and THE FLOW MAP are built in `hero-maps.worker.ts` (16 November 2026, session 2; D-101: off the main
 * thread, lifted verbatim — `inkGrid`, `flowMapData`); here the texture is made from its texels and `level` added.
 */
function logoFlowMap(d: FlowData): FlowMap {
  const { data, W, H, minX, minY, sizeX, sizeY, check } = d;
  const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.HalfFloatType);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return {
    tex,
    minX,
    minY,
    sizeX,
    sizeY,
    // ⛔ FULL WITHIN A HAIR OF 1 (14 November 2026; Carl, close on the b's stem: *"theres a problem here. part of the logo
    // is missing."*): the poured share is a SUM of each blob's 1/n, and ten tenths add to 0.9999999999999999 in floating
    // point — so `>= 1` never held, the level stayed a hair under the top, and the LAST cells to fill (rank ~1, the top of
    // the b's stem) were cut away wherever the edge's wobble (`FLOW.noiseAmp`) pushed them over it. Present since phase 1
    // (13 November), unseen at Home
    level: (share) => (share <= 0 ? -1 : share >= 1 - 1e-9 ? 2 : share),
    check,
  };
}
/**
 * ⛔ THE BLUE IS THE DESK MARK's BLUE (14 November 2026; D-101). Carl: *"why is the colour different"* → *"Build them both.
 * Try to get the blue shade to be the same and apply the wet look."* … *"Phase 1 is over, so any changes in lighting for
 * Phase 2 can be done. The same goes for roughness or any other parameter."* The desk mark's approved blue (R-035, the mark
 * bench `/proto/logo?mode=blue`, face on: sRGB (8, 60, 128), #083C80, measured 14 November) is the swatch's F0 at
 * roughness 0.25 (`LOGO_BLUE_DEFAULTS`), in the JUDGING STUDIO (`LOGO_JUDGING_STUDIO`, five softboxes on near-black — NOT
 * the button family's studio photograph the hero logo uses), under ACES (the mark bench's renderer). Wash take 1's blue sat
 * in our studio photograph at 0.4 under no tone mapping, so it read pale. So WHERE THE LOGO HAS COOLED (`cooled`: the
 * wash's front until 16 November 2026, session 3; the temperature, `hero-heat.ts`, since) its material BECOMES the desk mark's: the judging studio's reflection, roughness 0.25, and the ACES curve on this
 * material's own output (the renderer's tone mapping is the whole scene's; untouched). Where it is red, nothing changes
 * (mixed by 0: the null control).
 * - `judgingStudioTexture`: the judging studio as an EQUIRECTANGULAR image made on the CPU from the SAME list the mark
 *   bench and `/about` read (no second copy): each former a 1 × 1 rect scaled, facing the origin (drei's `Lightformer`:
 *   +Z toward the origin, up +Y), colour × intensity, the nearest in front; the background behind. In the logo's frame +Z is
 *   where its face points — the landed logo faces +Z — so it is looked up UNTURNED (as the courtyard is).
 */
const JUDGING = { width: 512, height: 256 } as const;
function judgingStudioTexture(): THREE.DataTexture {
  const { width: W, height: H } = JUDGING;
  const bg = new THREE.Color(LOGO_JUDGING_STUDIO.background);
  const formers = LOGO_JUDGING_STUDIO.formers.map((f) => {
    const p = new THREE.Vector3(...f.position);
    const z = p.clone().negate().normalize();
    const x = new THREE.Vector3(0, 1, 0).cross(z).normalize();
    const y = z.clone().cross(x);
    const c = new THREE.Color(f.color ?? "white").multiplyScalar(f.intensity);
    return { p, z, x, y, sx: f.scale[0], sy: f.scale[1], c };
  });
  const data = new Uint16Array(4 * W * H);
  const d = new THREE.Vector3();
  const h = new THREE.Vector3();
  for (let j = 0; j < H; j++) {
    const theta = ((j + 0.5) / H - 0.5) * Math.PI;
    for (let i = 0; i < W; i++) {
      const phi = ((i + 0.5) / W - 0.5) * 2 * Math.PI;
      d.set(Math.cos(theta) * Math.cos(phi), Math.sin(theta), Math.cos(theta) * Math.sin(phi));
      let best = Infinity;
      let col = bg;
      for (const f of formers) {
        // the ray from the origin meets the former's plane (normal z, through p) at t, if in front
        const den = d.dot(f.z);
        if (den >= -1e-6) continue;
        const t = f.p.dot(f.z) / den;
        if (t <= 0 || t >= best) continue;
        h.copy(d).multiplyScalar(t).sub(f.p);
        if (Math.abs(h.dot(f.x)) <= f.sx / 2 && Math.abs(h.dot(f.y)) <= f.sy / 2) {
          best = t;
          col = f.c;
        }
      }
      const k = 4 * (W * j + i);
      data[k] = THREE.DataUtils.toHalfFloat(col.r);
      data[k + 1] = THREE.DataUtils.toHalfFloat(col.g);
      data[k + 2] = THREE.DataUtils.toHalfFloat(col.b);
      data[k + 3] = THREE.DataUtils.toHalfFloat(1);
    }
  }
  const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.HalfFloatType);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
/** the cooled metal: the desk mark's (`LOGO_BLUE_DEFAULTS`); `exposure` the mark bench's ACES, 1 */
const COOLED = { roughness: LOGO_BLUE_DEFAULTS.roughness, exposure: 1 } as const;
/**
 * ⛔ WET (14 November 2026; D-101). Carl: *"how do we make it look wet?"* → the Builder's three parts → *"Build them both
 * ... apply the wet look."* On METAL, water does not darken (that is a porous dielectric's look): it lays a thin GLASSY
 * LAYER over it. So:
 * - A CLEAR COAT (Unreal's Clear Coat model: `MeshPhysicalNodeMaterial`'s `clearcoat`), its strength the share the water has
 *   reached (`wet` — exactly where the run-off has passed; dry where it has not), its roughness WATER's. (Until 16 November
 *   2026, session 3, this front was named `cooled` and drove the colour too; the colour now follows the TEMPERATURE,
 *   `hero-heat.ts`, and the coat stays on the water.)
 * - MOVING WATER on the coat (its own normal, `clearcoatNormalNode`): ripples stretched tall and thin (`streakCm` across,
 *   `lengthCm` long) RUNNING DOWN at `runCmS` on the story's clock (`clock`, frame-steppable) while the water flows; as the
 *   wash completes the flow eases into still BEADS (a small, round, unmoving ripple). The base metal's normal is untouched
 *   (the desk mark's blue stays the desk mark's under the coat).
 * - It stays wet until phase 3's cloth dries it. Values are takes.
 */
const WET = { coat: 1, coatRoughness: 0.04, streakCm: 1.6, lengthCm: 14, runCmS: 22, flowTilt: 0.35, beadCm: 1.2, beadTilt: 0.12 } as const;
/**
 * ⛔ THE WET DIALS (16 November 2026, session 3; Carl: *"tes, we can tweak if needed"*): `WET`'s values as uniforms, the
 * bench's Wet folder edits them live (no rebuild). Their defaults ARE `WET`. ⛔ The coat's lightness is SETTLED (Carl, the
 * same day: the wet face reads lighter than the dry desk-mark blue — water reflecting is the wet look); a dial is for a
 * tweak, not for "correcting" it back.
 */
export type HeroWetSettings = { -readonly [K in keyof typeof WET]: number };
// a float uniform's type, as `makeFront`'s (above)
type WetUniforms = { [K in keyof typeof WET]: ReturnType<typeof makeFront> };
function wetUniforms(): WetUniforms {
  return Object.fromEntries(Object.entries(WET).map(([k, v]) => [k, uniform(v)])) as WetUniforms;
}

/**
 * ⛔ PHASE 2, THE WASH — THE RAIN TURNS THE RED TO PLATINUM BLUE (14 November 2026; D-101). Carl: *"ok, let the rain wash
 * the red and turn it blue."* — on his rulings: the face cools by RUN-OFF (*"3.A yes your suggestion"*: the rain meets the
 * top edges and the water runs DOWN the face); the colour the logo becomes is the family's PLATINUM BLUE (*"Platinum blue,
 * same as the logo will become"*; `platinumBlueF0`, the desk mark's tint).
 * - THE RUN-OFF MAP (`logoRunoffMap`), made ONCE from the logo's own ink (`inkGrid`, the flow map's): on the face, each
 *   cell's distance in cm BELOW THE TOP OF ITS RUN — the stretch of ink straight above it up to where the ink ends, the top
 *   edge the rain lands on. On a vertical face water runs straight down; where a run ends (an edge facing down) it drips off,
 *   and the run below starts at its own top edge. So EVERY point is below a top edge that the rain reaches.
 * - THE WASH (`hero-rain.ts`, `wash`, 0–1): the share of the rain's whole fall that has LANDED so far — slow in the light
 *   opening, fast in the downpour, slowing as it eases off; 1 by the last drop.
 * - THE FRONT: on each streak the water has run `wash` × the REACH × its PACE, a share 1 to 1 + `spread` from a smooth
 *   noise across the face (`streakCm` wide; made in the map, take 2) — rivulets, not a sheet; the REACH is scaled so the
 *   slowest point is done at a wash of exactly 1 (take 2). A point is cooled as
 *   the front passes it (eased over `bandCm`), its edge ragged by up to `ragCm` (a noise of the face).
 * - ⛔ EXACT AT BOTH ENDS: at wash 0 every point's front is at or above it by the rag (≥ 0), so the cooled share is 0 and
 *   the colour is the material's own red (`materialColor`, mixed by 0 — the null control); at wash 1 every point's front is
 *   past it by the band and the rag (the reach's scaling), so every point is 1: the whole logo platinum blue.
 * Values are takes.
 * ⛔ 16 NOVEMBER 2026, SESSION 3 — THE FRONT IS THE WATER, NOT THE COLOUR. Carl: *"The stright lines do not look natural
 * during the wash"* → the front above now marks only where the WATER is (the wet coat, and the wetness the temperature
 * reads). The colour, roughness, reflection and tone curve follow the logo's TEMPERATURE (`hero-heat.ts`): cooling
 * everywhere, faster where wet, conducting through the metal. "Exact at both ends" still holds for the colour: 0 before the
 * rain (the field starts at 0); all platinum blue once every cell is cold (measured: the last red at ~33 s, as before).
 */
const RUNOFF = { perCm: 2, bandCm: 6, spread: 0.6, streakCm: 3.5, ragCm: 4, ragScale: 0.12 } as const;
type RunoffMap = { tex: THREE.DataTexture; minX: number; minY: number; sizeX: number; sizeY: number; tallestCm: number; reachCm: number; check: RunoffCheck };
// the map itself is built in `hero-maps.worker.ts` (16 November 2026, session 2: off the main thread, lifted verbatim —
// `runoffMapData`); here the texture is made from its texels
function logoRunoffMap(d: RunoffData): RunoffMap {
  const { data, W, H, minX, minY, sizeX, sizeY, tallestCm, reachCm, check } = d;
  const tex = new THREE.DataTexture(data, W, H, THREE.RGFormat, THREE.HalfFloatType);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return { tex, minX, minY, sizeX, sizeY, tallestCm, reachCm, check };
}
/**
 * ⛔ THE HARDENING — FROM BLOB TO SOLID (13 November 2026, session 2; D-101). Carl: *"the spread is mettallic. solid,
 * straight away. That gives it no time to cool down"* … *"the whole logo can have the blob material at first … no one will
 * expect the logo to come back. It makes sense that its fluid inside the logo container. The hardening process would then
 * be to dial down the attributes."* … *"kkep the 2.8 for filling and use 1.2 for hardening."* → ONE dial, `harden` (0 =
 * the blobs' liquid, 1 = the solid logo), for the whole logo, inside its one material: its ROUGHNESS the blobs' 0.1 → the
 * logo's 0.4, its REFLECTION the blobs' courtyard → the logo's studio (the two mixed per pixel); the colour the family
 * red in both (one object). The material rotates its studio by the logo's yaw (`envMapRotation`) and applies that to
 * every environment lookup, so the courtyard's lookup is turned back by it first (the radiance context's own reflection
 * vector, re-made here): the logo's liquid sees the courtyard exactly as the blobs do. At 1 it is the solid logo as before
 * (the null control: `hero-logo-state-stills-13-november.mjs`). Metalness 1: the courtyard's diffuse term is nothing.
 */
/**
 * ⛔ FLOATY WHILE LIQUID (13 November 2026, session 2; D-101). Carl: *"While liquid it still has some of its floaty, bubble
 * like qualities."* → while the logo is liquid (`harden` < 1) its SURFACE wavers like the blobs' skin: a smooth noise field
 * of its own position (cm, the geometry's units), drifting in time (`clock`), moves the surface by up to `swellCm` (a
 * continuous field: the same point moves the same way on every face, so no seams open at the bevels) and tilts its
 * shading normal by up to `tilt` (the highlights swim) — both × (1 − harden): nothing at all once hard (the null control).
 * Values are takes.
 */
const LIQUID = { roughness: 0.1, swellCm: 1.2, tilt: 0.35, scale: 0.045, drift: 0.35 } as const;
function logoMaterial(studio: THREE.Texture, front: ReturnType<typeof makeFront>, fill: ReturnType<typeof makeFront>, flow: FlowMap, courtyard: THREE.Texture, harden: ReturnType<typeof makeFront>, clock: ReturnType<typeof makeFront>, runoff: RunoffMap, wash: ReturnType<typeof makeFront>, judging: THREE.Texture, logoLights: THREE.Light[], heat: HeroHeat, wetU: WetUniforms): MeshPhysicalNodeMaterial {
  // ⛔ PHYSICAL since the wet look (14 November 2026; `WET`): the clear coat is the physical model's; dry (coat 0) it draws as
  // the standard material did (the null control)
  const m = new MeshPhysicalNodeMaterial({ color: HERO_LOGO_RED, metalness: HERO_LOGO_METAL.metalness, roughness: HERO_LOGO_METAL.roughness });
  m.envMap = studio;
  m.envMapIntensity = HERO_LOGO_METAL.envMapIntensity;
  m.envMapRotation.set(0, THREE.MathUtils.degToRad(HERO_LOGO_METAL.yawDeg), 0);
  // the logo's OWN light list (`LOGO_KEY`, in `createHeroScene`): the scene's three, its key a copy that fades with the wash
  m.lightsNode = lights(logoLights);
  // ⛔ PHASE 2, THE WASH (`RUNOFF`): where the run-off has reached this point (the water; since 16 November 2026, session 3,
  // the colour follows the temperature that reads it, below)
  const runUv = vec2(positionLocal.x.sub(runoff.minX).div(runoff.sizeX), positionLocal.y.sub(runoff.minY).div(runoff.sizeY));
  const run = texture(runoff.tex, runUv);
  const belowTop = run.r;
  // each column's pace (take 2: from the map, so the reach can be scaled to finish at a wash of exactly 1)
  const pace = run.g;
  const rag = mx_noise_float(positionLocal.mul(RUNOFF.ragScale)).mul(0.5).add(0.5).clamp(0, 1).mul(RUNOFF.ragCm);
  const reach = wash.mul(runoff.reachCm).mul(pace);
  // ⛔ 16 November 2026, session 3: this is now the WATER's front (`wet`) — where the run-off has reached. It drives the wet
  // coat (water does run in streaks); the METAL's state (colour, roughness, reflection, tone curve) follows the TEMPERATURE
  // (`hero-heat.ts`: cooling everywhere, faster where wet, conducting through the metal), which reads this same front.
  // Until 16 November it drove all of them (`cooled` was this front): the ruler lines Carl ruled out
  const wet = smoothstep(0, RUNOFF.bandCm, reach.sub(belowTop).sub(rag));
  // ⛔ THE TEMPERATURE (`hero-heat.ts`): the share cooled, 0 (red) → 1 (platinum blue); exactly 0 before the rain (the field
  // starts cold-free: phase 1 unchanged). The heat panel's switch off = the front as before (an A/B)
  const cooled = heat.share(runUv, wet);
  // the cooled metal's roughness is the desk mark's (`COOLED`, above)
  m.roughnessNode = mix(mix(float(LIQUID.roughness), float(HERO_LOGO_METAL.roughness), harden), float(COOLED.roughness), cooled);
  // the radiance context's reflection (three r185, `EnvironmentNode`'s `createRadianceContext`), turned by the yaw R so
  // the material's own Rᵀ leaves the courtyard unturned
  const turn = uniform(new THREE.Matrix4().makeRotationFromEuler(m.envMapRotation));
  const reflected = pow4(roughness).mix(positionViewDirection.negate().reflect(normalView), normalView).normalize().transformDirection(cameraWorldMatrix);
  // …and it reflects the desk mark's JUDGING STUDIO where cooled (looked up unturned, as the courtyard)
  m.envNode = mix(mix(pmremTexture(courtyard, turn.mul(reflected)), pmremTexture(studio), harden), pmremTexture(judging, turn.mul(reflected)), cooled);
  // floaty while liquid (LIQUID, above)
  const liquid = float(1).sub(harden);
  const field = positionLocal.mul(LIQUID.scale).add(vec3(0, 0, clock.mul(LIQUID.drift)));
  m.positionNode = positionLocal.add(mx_noise_vec3(field).mul(liquid.mul(LIQUID.swellCm)));
  const wobbled = transformNormalToView(normalLocal.add(mx_noise_vec3(field.add(vec3(17, 5, 3))).mul(LIQUID.tilt))).normalize();
  m.normalNode = mix(normalView, wobbled, liquid);
  // ⛔ PHASE 2, THE WASH (`RUNOFF`, above): the red cooled to platinum blue as the metal cools (the temperature, `cooled`)
  const [pr, pg, pb] = platinumBlueF0(LOGO_BLUE_DEFAULTS.tint);
  m.colorNode = mix(materialColor, vec3(pr, pg, pb), cooled);
  // ⛔ WET (`WET`, above): the coat where the water has reached; its normal the running water, easing into beads as the
  // wash completes (`flowing`: 1 while it runs, 0 once done)
  m.clearcoatNode = wet.mul(wetU.coat);
  m.clearcoatRoughnessNode = wetU.coatRoughness;
  const flowing = float(1).sub(smoothstep(0.85, 1, wash));
  const runField = vec3(positionLocal.x.div(wetU.streakCm), positionLocal.y.add(clock.mul(wetU.runCmS)).div(wetU.lengthCm), positionLocal.z.div(wetU.streakCm));
  const beadField = positionLocal.div(wetU.beadCm);
  const ripple = mx_noise_vec3(runField).mul(flowing.mul(wetU.flowTilt)).add(mx_noise_vec3(beadField.add(vec3(31, 7, 13))).mul(float(1).sub(flowing).mul(wetU.beadTilt)));
  m.clearcoatNormalNode = transformNormalToView(normalLocal.add(ripple.mul(wet))).normalize();
  // …under the desk mark's tone curve (ACES), on THIS material's output only, where cooled
  // (the cast: r185's types give the tone-mapping function an untyped Node; it returns the colour's vec3)
  const aces = acesFilmicToneMapping(output.rgb, float(COOLED.exposure)) as unknown as ReturnType<typeof vec3>;
  m.outputNode = vec4(mix(output.rgb, aces, cooled), output.a);
  // keep a fragment while its height is under the front, offset per chunk by up to half the band either way; and (THE
  // RE-FORMING's FILL, `REFORM`, `FLOW`) while its FLOW distance is under the fill LEVEL, the edge a soft liquid wobble
  // (smooth noise; the chunks were square up close) — the level far above until then (everything kept)
  const cell = mx_cell_noise_float(positionWorld.div(DISSOLVE.chunk));
  const jitter = cell.sub(0.5).mul(DISSOLVE.band);
  const flowUv = vec2(positionLocal.x.sub(flow.minX).div(flow.sizeX), positionLocal.y.sub(flow.minY).div(flow.sizeY));
  const along = texture(flow.tex, flowUv).r;
  const wobble = mx_noise_float(positionLocal.mul(FLOW.noiseScale)).mul(FLOW.noiseAmp);
  m.maskNode = positionWorld.y.lessThan(front.add(jitter)).and(along.lessThan(fill.add(wobble)));
  const key = `hero-scene-logo-env:${studio.uuid}:${courtyard.uuid}`;
  m.customProgramCacheKey = () => key;
  return m;
}
/**
 * ⛔ THE LEAN's CONTACT EDGE ON THE FLOOR (18 November 2026; Carl: the floor's heat from *"the leaning logo base"* = THE
 * CONTACT EDGE, where the c's end touches the floor). `Lean.contact` is NOT it — that is where the logo's back rests on the
 * headline's t (the note's [R1]) — and the lean keeps only the lowest HEIGHT. So: the vertices within `CONTACT_EDGE_CM` of
 * the lowest, in the lean's world pose; their centre (x, z) on the floor.
 */
const CONTACT_EDGE_CM = 0.5;
/** ⛔ the leaning logo's web OPENS (contact edge → rim) over this from the logo's fade-in START, and CLOSES (rim → contact
 *  edge) over this from LIFT-OFF (s). Carl, 18 November 2026: first *"Lets pick the figure 500ms"* (the close; the open rode
 *  the logo's 1.2 s fade), then *"the heat spread/collapse is far too fast. change to 2s from 500ms"* → BOTH 2 s; then, told
 *  one floor carries the landing's own spread beside it, *"ok, good. in that case change from 2s to 2.5s"* → BOTH 2.5 s */
const FLOOR_SPREAD_S = 2.5;
function leanFloorContact(g: THREE.BufferGeometry, matrix: THREE.Matrix4, unitsPerCm: number): { point: THREE.Vector3; count: number } {
  const p = g.getAttribute("position");
  const v = new THREE.Vector3();
  let low = Infinity;
  for (let i = 0; i < p.count; i++) low = Math.min(low, v.fromBufferAttribute(p, i).applyMatrix4(matrix).y);
  const band = CONTACT_EDGE_CM * unitsPerCm;
  const sum = new THREE.Vector3();
  let count = 0;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).applyMatrix4(matrix);
    if (v.y > low + band) continue;
    sum.add(v);
    count++;
  }
  sum.divideScalar(Math.max(1, count));
  return { point: new THREE.Vector3(sum.x, low, sum.z), count };
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


/**
 * ⛔ THE OPENING — THE TEXT, THEN THE LEANING LOGO FADES IN (16 November 2026; D-101). Carl: *"scrap the HTML logo idea and
 * the overlay. Frame rate drops to 14fps while its compiling. Just have the text happen and fade in the leaning logo. No
 * loading needed."* ⚰️ WITHDRAWN the same day (D-101): the HTML loading logo, "Loading" and its dots, the face-on swap and
 * the swivel into the lean (Carl's opening of the same day; built and measured before he scrapped it).
 * - THE LIGHTS COME UP (`litS`): the key and the ambient from 0, and the text's edge glow with them — intensities only (no
 *   shader rebuilt); the text fades in with them.
 * - THE SUBTEXT REVEALS, line by line, at READING SPEED (`/start`'s subtext: 59 letters in 4.2 s, ~70 ms a letter, eased in
 *   and out — `sub1`, `sub2`: start, length): a reveal edge sweeping left to right (`maskNode`).
 * - THE LEANING LOGO FADES IN (`logoAtS`, `logoFadeS`) — in the lean, where the story starts — at its time OR WHEN ITS
 *   PROGRAMS ARE BUILT, if later (`warmScene`: it is never drawn before it is built). THE FADE IS ALPHA-TO-COVERAGE: the
 *   logo stays OPAQUE; its opacity decides how many of each pixel's 4 MSAA samples it covers, dithered per pixel between
 *   the levels (`logoFade`), exactly 1 when faded in. ⚰️ Two routes MEASURED and rejected the same day: the material
 *   TRANSPARENT from the start changed the floor grid's pixels at the lean (111,236 px, max 45; the null control — the same
 *   frame opaque was 0 px), and switching transparency on only for the fade is a SECOND build of the logo's shader
 *   (3.2 s measured). Alpha-to-coverage is set from the start too: one shader, built once.
 *   ⛔ OVERTAKEN (16 November 2026, session 2; Carl: *"When the logo fades in it doesnt look right"* … *"implement 1"*): seen
 *   close (`live-work/scripts/hero-logo-fade-film-16-november.mjs`), alpha-to-coverage showed a FIXED stipple (the noise
 *   locked to the screen: a dotted net, the "t" behind it a grey crosshatch) and the logo's INNER walls (each surface
 *   part-covered on its own: red glass, not a solid fading). NOW THE FADE IS ONE SOLID LAYER (`logoFadeParts`): during the
 *   opening the logo draws with a TRANSPARENT copy of its material at the fade's opacity, after a DEPTH-ONLY draw of the same
 *   geometry (its own vertex position node; drawn after the scene's opaques, so the text behind stays and shows through):
 *   only its front surface is coloured. Once the opening is done it is the opaque material above, untouched — the story's
 *   frames 0 px against before (the null control). Both materials are built in the background by the warm-up. ⚠ The
 *   grid's pixels (the first rejection above): MEASURED to come from a draw-ORDER effect in three r185, not from
 *   transparency — whenever the opaque logo is drawn BEFORE the bench's grid, the grid's distant lines differ (up to 44
 *   levels), however the logo is drawn; so the grid changes when the opaque logo returns at the fade's END (it used to
 *   change when the logo appeared, at the fade's start). Drawing the grid first fixes the grid but changed the text's and
 *   the logo's shading (up to 59 levels) — approved frames: REVERTED, put to Carl (D-101).
 * - Then the story as approved from the lean (`ARRIVAL`: the hold, then the jump forward).
 * All values are TAKES.
 */
export const OPENING = {
  /** the lights' rise: start, length (s). ⛔ 2.0 → 3.0 (Carl, 16 November 2026: *"Theres some leeway on the text fade in. it
   *  can happen a bit slower. Its almost instantaneous to the human eye. That will buy us a little more time."*): the subtext
   *  and the logo move later with it, so the load's main-thread stalls land before the subtext begins */
  litS: [0.3, 3.0],
  /** the subtext's two lines: start, length (s) — reading pace, ~70 ms a letter (40 and 39 letters). ⛔ 3.4 → 2.2 (Carl, 16
   *  November 2026: *"there is too much of a gap between text and subtext"*): it starts as the headline's fade ends — OR
   *  `settleS` after the logo's arrival work (the load's main-thread stalls: `stepOpening`), if later; the second line and
   *  the logo keep their spacing after it. Were 1.4 / 3.4 and 3.9 / 5.9 */
  sub1: [2.2, 2.8],
  sub2: [4.7, 2.8],
  /** the leaning logo fades in (s; or when built, if later), over `logoFadeS`. Was 6.4, then 8.4 */
  logoAtS: 7.2,
  logoFadeS: 1.2,
  /** the subtext waits this long after the warm-up has started (s), so no stall falls on it */
  settleS: 0.6,
  /** … but never longer than this past its own time (s): it starts regardless */
  subCeilingS: 3,
} as const;
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

/**
 * ⛔ THE MAPS, OFF THE MAIN THREAD (`hero-maps.worker.ts`; 16 November 2026, session 2; D-101). Carl: *"The stalls are the
 * problem."* ONE worker per scene, STARTED WITH THE SCENE (its module, three included, is loaded while the logo's geometry
 * is still being built); sent the geometry once it arrives (COPIED: the scene keeps its own), then "face" (the flow and
 * run-off maps, the ink) at once, and "landed" (the rain's hit map, the steam's solid mask) when the landed pose is known;
 * it is ended after "landed". If it cannot start or fails, the SAME functions run inline (the main thread, as before
 * 16 November). `check` (`?mapcheck=1`, dev only): each map built inline as well, and the number of mismatched values
 * reported (0 = identical; timings not compared).
 */
type MapsClient = { geometry(g: THREE.BufferGeometry): void; face(r: FaceRequest): Promise<FaceResult>; landed(r: LandedRequest): Promise<LandedResult>; dispose(): void };
function mapsClient(check: ((kind: "face" | "landed", mismatches: number) => void) | null): MapsClient {
  let g: THREE.BufferGeometry | null = null;
  let worker: Worker | null = null;
  try {
    worker = new Worker(new URL("./hero-maps.worker.ts", import.meta.url), { type: "module" });
  } catch {
    worker = null;
  }
  // the ink, for "landed" (from "face", wherever it ran)
  let ink: InkGrid | null = null;
  const inline = {
    face: (r: FaceRequest) => {
      if (!g) throw new Error("[hero maps] face before the geometry");
      return faceMaps(g, r);
    },
    landed: (r: LandedRequest) => {
      if (!g || !ink) throw new Error("[hero maps] landed before face");
      return landedMaps(g, ink, r);
    },
  };
  type Wait = { req: FaceRequest | LandedRequest; resolve(v: FaceResult | LandedResult): void };
  const waiting = new Map<"face" | "landed", Wait>();
  const settle = (kind: "face" | "landed", v: FaceResult | LandedResult) => {
    const w = waiting.get(kind);
    if (!w) return;
    waiting.delete(kind);
    if (v.kind === "face") ink = v.ink;
    if (check) check(kind, mismatches(v, kind === "face" ? inline.face(w.req as FaceRequest) : inline.landed(w.req as LandedRequest)));
    w.resolve(v);
  };
  /** the worker is gone: what it owed runs inline */
  const fallBack = () => {
    worker?.terminate();
    worker = null;
    for (const [kind, w] of [...waiting]) {
      waiting.delete(kind);
      const v = kind === "face" ? inline.face(w.req as FaceRequest) : inline.landed(w.req as LandedRequest);
      if (v.kind === "face") ink = v.ink;
      w.resolve(v);
    }
  };
  if (worker) {
    worker.onmessage = (e: MessageEvent<MapsReply>) => {
      const m = e.data;
      if (m.kind === "error") {
        console.warn("[hero maps] worker failed; inline", m.message);
        fallBack();
      } else settle(m.kind, m);
    };
    worker.onerror = (e) => {
      console.warn("[hero maps] worker error; inline", e.message);
      e.preventDefault();
      fallBack();
    };
  }
  const ask = <R extends FaceResult | LandedResult>(req: FaceRequest | LandedRequest) =>
    new Promise<R>((resolve) => {
      if (!worker) {
        // inline, in its own task (as `logoGeometry`'s fallback)
        window.setTimeout(() => {
          const v = req.kind === "face" ? inline.face(req) : inline.landed(req);
          if (v.kind === "face") ink = v.ink;
          resolve(v as R);
        }, 0);
        return;
      }
      waiting.set(req.kind, { req, resolve: resolve as Wait["resolve"] });
      worker.postMessage(req satisfies MapsMessage);
    });
  return {
    geometry(geo) {
      g = geo;
      if (!worker) return;
      const pos = geo.getAttribute("position").array as Float32Array;
      const idx = geo.getIndex();
      worker.postMessage({ kind: "geometry", position: pos, index: idx ? (idx.array as Uint16Array | Uint32Array) : null } satisfies MapsMessage);
    },
    face: (r) => ask<FaceResult>(r),
    landed: (r) => ask<LandedResult>(r),
    dispose() {
      worker?.terminate();
      worker = null;
      waiting.clear();
    },
  };
}
/** the dev check's count: values that differ between two results, every typed array element by element (`ms` skipped) */
function mismatches(a: unknown, b: unknown): number {
  if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
    const x = a as unknown as ArrayLike<number>;
    const y = b as unknown as ArrayLike<number>;
    let n = Math.abs(x.length - y.length);
    for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) n++;
    return n;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    let n = 0;
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) if (k !== "ms" && k !== "buildMs") n += mismatches((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]);
    return n;
  }
  return a === b ? 0 : 1;
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
  /** the lean's checks: the contact in the scene, the recorded and measured contacts (sketch cm), the lowest point, the width;
   *  `floorContact` = THE CONTACT EDGE on the floor (world; the floor's heat, source 1), `floorContactVerts` its vertex count */
  lean: { contact: number[]; contactMeasuredCm: number[]; contactConstantCm: number[]; lowestY: number; floorY: number; widthUnits: number; widthCm: number; floorContact: number[]; floorContactVerts: number } | null;
  /** the arrival's numbers (`arrivalPlan`): seconds, and the lowest corner over the flight above the floor (cm, ≥ 0) */
  arrival: { t: number; holdS: number; flightS: number; touchdownS: number; durationS: number; apexCm: number; minCornerAboveFloorCm: number; pool: number; poolHits: number[] } | null;
  /** plays the arrival again from the lean (the bench's button); the opening skipped */
  replayArrival(): void;
  /** ⛔ THE OPENING (`OPENING`; 16 November 2026): plays it again from the dark (the bench's button) */
  openingAgain(): void;
  /** the opening's read-out: its clock, the logo built, when its fade began (−1 = not yet), the end, the lights, the logo's opacity */
  openingInfo: { t: number; ready: boolean; subAtS: number; fadeAtS: number; done: boolean; lit: number; logoOpacity: number };
  /** the blobs' centres this frame, world units (born blobs only) — a READ-OUT for checks */
  blobs: number[][];
  /** THE FLOW MAP (`FLOW`), once the logo is in — a READ-OUT for checks: its texture (half floats, RGBA) and frame (cm) */
  flow: { tex: THREE.DataTexture; minX: number; minY: number; sizeX: number; sizeY: number; check: FlowMap["check"] } | null;
  /** THE RE-FORMING's plan (`REFORM`), once it has started — a READ-OUT for checks: emission seconds, the fill share */
  reform: { startS: number; filled: number; hardness: number; fullS: number; hardS: number; landS: number; endS: number; dropCm: number; blobs: { i: number; carrier: boolean; departS: number; touchS: number; reachS: number }[] } | null;
  /** THE MOULD (`mouldPose`): the logo's local → world matrix there, and the logo geometry's local bounds (cm) */
  mould: { matrix: THREE.Matrix4; bounds: THREE.Box3 } | null;
  /** the example's `render()` minus the draw and the clock: the field's time, resolution, isolation, `updateCubes` */
  update(delta: number): void;
  /** ⛔ PHASE 2, THE RAIN (`hero-rain.ts`; D-101, 14 November 2026): the GPU's step, called by the bench each frame after
   *  `update` and before the draw — the one new call Carl approved (the scene does not hold the renderer) */
  compute(renderer: WebGPURenderer): void;
  /** ⛔ THE WARM-UP (`warmScene`; 16 November 2026): the story's later programs built in the background (the story does NOT wait for it), and its time (ms; −1 = not done) */
  readonly warmed: boolean;
  readonly warmMs: number;
  /** the load's main-thread steps (ms): the logo's arrival, the warm-up's synchronous part, the worst GPU-step frame */
  readonly loadTimes: Record<string, number>;
  /** the rain's dials (the bench's Rain folder edits them) */
  rain: HeroRainSettings;
  /** ⛔ PHASE 3, THE CLOTH, step 1 (`hero-cloth.ts`; 20 November 2026): three's `webgpu_compute_cloth` exactly as it is, behind
   *  the logo — its dials (the bench's Cloth folder), "again", and a read-out */
  cloth: Pick<HeroCloth, "settings" | "again" | "info" | "points">;
  /** ⛔ THE CODE DROPS' dials (`hero-code-drops.ts`, inside the rain; the bench's Code drops folder; 20 November 2026) */
  code: HeroCodeSettings;
  /** ⛔ THE TEMPERATURE's dials (`hero-heat.ts`; the bench's Heat folder) and its read-out */
  heat: HeroHeatSettings;
  readonly heatInfo: HeroHeatInfo | null;
  /** ⛔ THE WET DIALS (`WET`; the bench's Wet folder) */
  wet: HeroWetSettings;
  /** the rain's shape again from now (once the logo has landed) */
  rainAgain(): void;
  /** the rain's numbers — a READ-OUT for checks; null until the logo (and its hit map) is in */
  rainInfo: HeroRainInfo | null;
  /** ⛔ PHASE 2, THE STEAM (`hero-steam.ts`; 16 November 2026): its dials (the bench's Steam folder) and its read-out */
  steam: HeroSteamSettings;
  steamInfo: HeroSteamInfo | null;
  /** ⛔ THE FLOOR's HEAT (`hero-floor.ts`; 18 November 2026): its dials (the bench's Heat floor folder) and its read-out */
  floor: HeroFloorSettings;
  readonly floorInfo: HeroFloorInfo & { liquidStep: number; liquidReachCm: number };
  dispose(): void;
};

export function createHeroScene(aspect: number): HeroScene {
  const disposables: { dispose(): void }[] = [];
  const loads: Promise<void>[] = [];
  // the courtyard's image (`generateMaterials`); the logo's material waits for it (THE HARDENING)
  let courtyardReady: Promise<void> = Promise.resolve();

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
  // off until the blobs are out (`update`): by intensity, never by `visible` — the light set must not change (`update`)
  pointLight.intensity = 0;
  scene.add(pointLight);

  const ambientLight = new THREE.AmbientLight(0x323232, 3);
  scene.add(ambientLight);

  /**
   * ⛔ THE LOGO's OWN KEY (14 November 2026; D-101). Measured face on after the wash: with the scene's white key the b's
   * stem read (32, 89, 166); WITHOUT it the blue IS the desk mark's — (8, 60, 127) against (8, 60, 128) — the desk mark is
   * lit by its studio alone ("Studio only"). Turning the key off for the WHOLE scene turns the 3D text dark grey (seen at
   * Home), so the logo gets its OWN LIGHT LIST (`logoMaterial`'s `lightsNode`): the scene's point light and ambient as
   * they are, and its OWN COPY of the key on layer 31, which the camera never collects (r185 culls lights by the camera's
   * layers), so the copy lights the logo and nothing else. Its strength follows the WASH (`update`): the scene key's 3 while
   * the logo is red — phase 1 unchanged (the null control) — fading to 0 as the wash completes (Carl: *"Phase 1 is over,
   * so any changes in lighting for Phase 2 can be done"*). The scene's key is untouched: the text keeps it.
   * ⚠ The Builder's structure (a second key light; the logo's own list), stated to Carl before it was built.
   */
  const LOGO_KEY_LAYER = 31;
  const logoKey = new THREE.DirectionalLight(light.color, light.intensity);
  logoKey.name = "hero logo key (the logo's own)";
  logoKey.position.copy(light.position);
  logoKey.layers.set(LOGO_KEY_LAYER);
  scene.add(logoKey);
  const logoLights: THREE.Light[] = [logoKey, pointLight, ambientLight];

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
  /** THE LEAN's CONTACT EDGE on the floor (world): the floor's heat, source 1 (`leanFloorContact`) */
  let floorContact: THREE.Vector3 | null = null;
  /** the floor's heat, source 2: the web's reach (cm) when the first blob reached the disc — the supercharge spreads from it
   *  (reset with the liquid) */
  let liquidReachCm = 0;
  /** THE SOLID LOGO's BASE on the floor where it lands (world): the floor's heat, source 3 */
  let landedContact: THREE.Vector3 | null = null;
  /** … its reach at the first hit (the steps start from it), and the step it is heading for (0–3; a read-out) */
  let liquidHitCm = 0;
  let liquidStep = 0;
  /** … its reach when the collapse began (−1 = not begun) */
  let liquidCollapseCm = -1;
  // the arrival (`arrivalPlan`) and THE STORY's clock (`storyT`, seconds since the logo appeared) — advanced in `update`;
  // the arrival plays on it once, the emission follows it
  let arrival: Arrival | null = null;
  let storyT = 0;
  // THE WARM-UP (`warmScene`): false until the story's later programs are built (in the background; the story does not wait)
  let warmed = false;
  let warming = false;
  let warmMs = -1;
  // the load's main-thread steps (ms; the logo's arrival, the warm-up's synchronous part) — a READ-OUT (`loadTimes`)
  const loadTimes: Record<string, number> = {};
  // ⛔ THE OPENING (`OPENING`): its own clock (s, from the first update) and state; the story's clock waits for its end
  // `subT`: when the subtext actually began (opening s; −1 = not yet); `warmT`: when the warm-up began (the stalls)
  const opening = { t: 0, fadeT: -1, done: false, subT: -1, warmT: -1 };
  // the leaning logo's fade (0 → 1), read by its alpha-to-coverage (`OPENING`)
  const logoFade = uniform(0);
  // the opening's fade drawn as one solid layer (`OPENING`): the opaque material, the fade's, and the depth drawn first
  let logoFadeParts: { opaque: THREE.Material; fade: THREE.Material; depth: THREE.Mesh } | null = null;
  // the lights' share (0 → 1), the text's glow with them; the subtext's reveal edges (world x)
  const lit = uniform(0);
  const reveal1 = uniform(-1e9);
  const reveal2 = uniform(-1e9);
  let subLines: { midY: number; x1: [number, number]; x2: [number, number] } | null = null;
  const KEY_I = 3;
  const AMBIENT_I = 3;
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
  // the re-forming's fill LEVEL (the flow map's distance, `FLOW`): far above (nothing masked) until the re-forming
  const fillFront = makeFront();
  let flow: FlowMap | null = null;
  // ⛔ PHASE 2, THE WASH: the run-off map (built with the flow map) and the wash's share (from the rain, each frame)
  let runoff: RunoffMap | null = null;
  const washShare = makeFront();
  washShare.value = 0;
  // the desk mark's judging studio, for the cooled metal (made once, on the CPU)
  const judging = judgingStudioTexture();
  disposables.push(judging);
  /**
   * ⛔ THE REFLECTION MAPS PREFILTERED IN THE DARK (16 November 2026, session 2; D-101). Carl: *"get to the bottom of the
   * stall and try to fix it"* … *"We had stall problems in the q+a months ago. See if the problems are similar"* — they are:
   * `/start`'s opening stutter was the cards' PMREM (~572 ms, `answer-card-canvas.tsx`, deferred to where nothing visible
   * depended on it) and the corners' was the studio's GGX prefilter (`corner-canvas.tsx`, prefiltered first, 21 October).
   * MEASURED here (`live-work/scripts/hero-opening-gpu-work-16-november.mjs`, a return visit, a visible window): the frames
   * left on the headline's fade were the GPU running three's PMREM (one GGX submit 249 ms, ~0.5 s in all at opening
   * 1.5–2.1 s), made when the warm-up first built the logo's material — its three reflections (the courtyard, the studio,
   * the judging studio; the liquid shares the courtyard's).
   * So a PRIMER — one tiny draw that writes nothing (no colour, no depth, a zero-area triangle) and samples the SAME three
   * textures through three's own `pmremTexture` — is put in the scene as soon as they are loaded: three prefilters each
   * then, into the RENDERER's cache (per texture; `_getPMREMFromTexture`), while the opening is still dark or early. The
   * logo's and the liquid's materials later find each in that cache: ONE build per map, only earlier (⚠ the warm-up canvas,
   * D-036's worked case, built its programs twice; this must not — measured by counting the PMREM passes). Nothing the
   * visitor sees changes: the maps are three's, made by the same function from the same textures. Removed after
   * `PRIMER_FRAMES` drawn frames.
   */
  // ⛔ PHASE 3, THE CLOTH, step 1 (`hero-cloth.ts`; 20 November 2026; Carl: *"build it on the page exactly as it is ... Build
  // it here, behind the logo"*): the example in its own group, placed at Carl's camera target; made HERE so its environment
  // joins the primer below (prefiltered in the dark with the others, not at its first draw)
  const cloth = createHeroCloth();
  scene.add(cloth.group);
  disposables.push(cloth);
  const PRIMER_FRAMES = 3;
  let primer: THREE.Mesh | null = null;
  let primerFrames = 0;
  Promise.all([loadStudioHdri(STUDIO_HDRI_SRC, HERO_LOGO_METAL.room), courtyardReady, cloth.envReady]).then(([studio, , clothEnv]) => {
    if (disposed || !envs.courtyard) return;
    const m = new MeshBasicNodeMaterial();
    // each with an explicit direction AND level: outside a lit material's environment context `pmremTexture` has neither
    // (three r185: `PMREMNode.setup` reads `uvNode.x` and passes the level on — without them the build throws after the
    // FIRST map is made, and the others never are)
    const dir = vec3(0, 0, 1);
    const level = float(0);
    // ⛔ + the cloth's environment (`hero-cloth.ts`, 20 November 2026): the example's Royal Esplanade, prefiltered with the rest
    m.colorNode = pmremTexture(studio, dir, level).add(pmremTexture(envs.courtyard.reflect, dir, level)).add(pmremTexture(judging, dir, level)).add(pmremTexture(clothEnv, dir, level));
    m.colorWrite = false;
    m.depthWrite = false;
    m.depthTest = false;
    m.name = "hero reflection-map primer";
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(9), 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
    primer = new THREE.Mesh(g, m);
    primer.name = "hero reflection-map primer";
    primer.frustumCulled = false;
    scene.add(primer);
    performance.mark("hero:Primer");
  });
  // THE HARDENING's dial (`logoMaterial`): 1 = the solid logo (all before the re-forming), 0 = the blobs' liquid
  const hardness = uniform(1);
  /**
   * ⛔ THE FALL — THE LAST STEP OF PHASE 1 (13 November 2026, session 2; D-101). Carl: *"While liquid it still has some of
   * its floaty, bubble like qualities. As soon as it hardens, gravity kicks in and it can fall to the floor with a slight
   * wobble on langing."* → while liquid the logo BOBS (`bobCm` at `bobHz`, × (1 − hardness): still once hard) and its surface
   * wavers (`LIQUID`); the moment it is HARD it FALLS straight down from the mould to the floor under real gravity (981
   * cm/s² in world units; `mouldDrop`, the mould's 40 cm raise, ~0.29 s), and on landing WOBBLES — the arrival's (the desk
   * mark's, `wobbleAngle`, 2 s): rocking front and back on its thin base about its long axis, the pivot the base's FACE edge
   * (top toward the camera) or its BACK edge (away), changing side through upright — the arrival's rock, seen face on.
   * Values are takes.
   */
  const FALL = { bobCm: 1.5, bobHz: 0.45 } as const;
  let mouldDrop = 0;
  const fallT = new THREE.Matrix4();
  const fallR = new THREE.Matrix4();
  const fallP = new THREE.Vector3();
  // the liquid's own clock (seconds, the scene's — frame-stepped films step it exactly): its surface drifts on it
  const liquidClock = uniform(0);
  // the settled logo: its pose and height (world), for the births and the front
  let settled: { matrix: THREE.Matrix4; bounds: THREE.Box3; topY: number; bottomY: number; box: THREE.Box3 } | null = null;
  let arrivalInfo: Omit<NonNullable<HeroScene["arrival"]>, "t" | "pool" | "poolHits"> | null = null;
  let mould: HeroScene["mould"] = null;
  // ⛔ PHASE 2, THE RAIN (`hero-rain.ts`): its drops and splashes in the scene; its hit map made from the LANDED logo once
  // the logo is in (below); it runs on the story's clock from phase 1's end (`update`)
  const rain = createHeroRain(FLOOR_Y);
  scene.add(rain.group);
  disposables.push(rain);
  // ⛔ PHASE 2, THE STEAM (`hero-steam.ts`; 16 November 2026; structural note v1.0): a short burst as the FIRST DROPS land,
  // in a box about the landed logo, the logo a solid in it; on the rain's clock; lit by the scene key's direction
  const steam = createHeroSteam(FLOOR_Y);
  steam.setLight(light.position);
  scene.add(steam.group);
  disposables.push(steam);
  // ⛔ PHASE 2, THE TEMPERATURE (`hero-heat.ts`; 16 November 2026, session 3; structural note v1.0): the logo's face cools
  // as an object during the wash — its field reads the wash's share (the run-off front) and the logo's material reads it
  const logoHeat = createHeroHeat(washShare);
  disposables.push(logoHeat);
  // ⛔ THE FLOOR's HEAT (`hero-floor.ts`; 18 November 2026; structural note v1.5): ONE additive glow on the floor with three
  // source slots; chunk 1 drives slot 1, the LEANING LOGO, from its CONTACT EDGE (`floorContact`, below). Hidden until the
  // warm-up has built it, and whenever nothing it adds can be seen
  const floorHeat = createHeroFloor(FLOOR_Y);
  scene.add(floorHeat.mesh);
  disposables.push(floorHeat);
  // ⛔ THE WET DIALS (`WET`, `wetUniforms`): the bench's Wet folder edits `wetSettings`; copied to the uniforms in `update`
  const wetSettings: HeroWetSettings = { ...WET };
  const wetU = wetUniforms();
  // ⛔ THE MAPS (`mapsClient`, `hero-maps.worker.ts`; 16 November 2026, session 2): "face" is asked THE MOMENT THE LOGO's
  // GEOMETRY ARRIVES — it needs nothing else — so it runs while the text, the studio and the courtyard are still loading;
  // "landed" is asked below, once the landed pose is known. `landedIn`: the rain's hit map and the steam's mask are in
  let landedIn = false;
  let rainWarmed = false;
  const mapCheck = process.env.NODE_ENV !== "production" && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("mapcheck");
  let maps: MapsClient | null = mapsClient(mapCheck ? (kind, n) => (loadTimes[kind === "face" ? "mapCheckFace" : "mapCheckLanded"] = n) : null);
  // the load's moments (ms on the page's clock: `at*` in `loadTimes`) — when each step of the logo's way in happened
  const at = (k: string) => {
    loadTimes[`at${k}`] = Math.round(performance.now());
    // the same moment on the page's timeline (`performance.mark`, "hero:…"): read by the measurement scripts, free otherwise
    performance.mark(`hero:${k}`);
  };
  const faceReady = logoGeo.then((g) => {
    if (disposed || !maps) return null;
    at("Geometry");
    maps.geometry(g);
    // the re-forming's flow map, from the ink nearest the c's entry (`REFORM`'s c: its middle, at mid height)
    g.computeBoundingBox();
    const gb = g.boundingBox!;
    const seed: [number, number] = [gb.min.x + (REFORM.cShare * (gb.max.x - gb.min.x)) / 2, (gb.min.y + gb.max.y) / 2];
    return maps.face({ kind: "face", seed, flow: { perCm: FLOW.perCm, gravity: FLOW.gravity }, runoff: RUNOFF, inkPerCm: FLOW.perCm }).then((f) => {
      at("Face");
      return f;
    });
  });
  const textReady = buildText().then((t) => {
    if (disposed) return t.dispose();
    at("Text");
    text = t.group;
    unitsPerCm = t.unitsPerCm;
    textDispose = t.dispose;
    // ⛔ THE OPENING's TEXT (`OPENING`, beats 2–3): the glow rises with the lights (`lit`, a uniform: no rebuild); the
    // SUBTEXT (the layout's second geometry) gets its own copy of the material with a REVEAL EDGE per line (`maskNode`)
    {
      const [headMesh, subMesh] = t.group.children as THREE.Mesh[];
      type Glowing = THREE.Material & { emissiveNode: Node<"vec3">; maskNode: unknown; glowMRT?: unknown };
      const headMat = headMesh.material as Glowing;
      headMat.emissiveNode = headMat.emissiveNode.mul(lit);
      const subMat = (headMat as unknown as { clone(): Glowing }).clone();
      subMat.glowMRT = headMat.glowMRT;
      subMat.name = "hero text: edge-lit acrylic (subtext, revealed)";
      // the lines: split at the subtext's middle height; each line's ink from its left to its right
      const pos = subMesh.geometry.getAttribute("position");
      subMesh.geometry.computeBoundingBox();
      const sb = subMesh.geometry.boundingBox!;
      const midY = (sb.min.y + sb.max.y) / 2;
      const x1: [number, number] = [Infinity, -Infinity];
      const x2: [number, number] = [Infinity, -Infinity];
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const r = pos.getY(i) > midY ? x1 : x2;
        r[0] = Math.min(r[0], x);
        r[1] = Math.max(r[1], x);
      }
      subLines = { midY, x1, x2 };
      subMat.maskNode = positionWorld.x.lessThan(positionWorld.y.greaterThan(midY).select(reveal1, reveal2));
      subMesh.material = subMat;
      disposables.push(subMat);
    }
    scene.add(text);
    // ⛔ THE LOGO ON THE 3D t (`leanInSketch`): once its geometry and the text's frame are both in
    // the studio is `loadStudioHdri`'s shared, cached texture: not disposed here (the sketch bench's rule)
    Promise.all([logoGeo, loadStudioHdri(STUDIO_HDRI_SRC, HERO_LOGO_METAL.room), courtyardReady, faceReady]).then(([g, studio, , face]) => {
      if (disposed || !face) return g.dispose();
      at("Arrival");
      // ⛔ THE ARRIVAL's MAIN-THREAD WORK, TIMED (16 November 2026; Carl: *"theres a stall on the W of the subtext"*): each
      // step's ms into `loadTimes` (the bench's read-out)
      let lt = performance.now();
      const t0 = lt;
      const mark = (k: string) => {
        const n = performance.now();
        loadTimes[k] = Math.round(n - lt);
        lt = n;
      };
      // the flow and run-off maps, built by the worker ("face", above): their textures
      loadTimes.workerFace = face.ms;
      flow = logoFlowMap(face.flow);
      disposables.push(flow.tex);
      runoff = logoRunoffMap(face.runoff);
      disposables.push(runoff.tex);
      // ⛔ THE TEMPERATURE's FACE (`hero-heat.ts`): the run-off map and the ink share one grid (both 2 per cm: `RUNOFF`,
      // `FLOW`) — asserted here, not assumed; the visible face is the geometry's +z (the material's rag noise is read there)
      if (face.ink.W !== face.runoff.W || face.ink.H !== face.runoff.H) throw new Error("[hero] the ink and the run-off map are not one grid");
      g.computeBoundingBox();
      logoHeat.setFace({ runoffTex: runoff.tex, W: face.runoff.W, H: face.runoff.H, minX: runoff.minX, minY: runoff.minY, sizeX: runoff.sizeX, sizeY: runoff.sizeY, perCm: RUNOFF.perCm, reachCm: runoff.reachCm, bandCm: RUNOFF.bandCm, ragCm: RUNOFF.ragCm, ragScale: RUNOFF.ragScale, ink: face.ink.ink, faceZ: g.boundingBox!.max.z });
      // the steam's emitters read the same field (each puff × the heat left under it); given before the steam's logo (below)
      steam.setHeat(logoHeat.texture);
      mark("mapTextures");
      const material = logoMaterial(studio, dissolveFront, fillFront, flow, envs.courtyard!.reflect, hardness, liquidClock, runoff, washShare, judging, logoLights, logoHeat, wetU);
      // ⛔ THE OPENING's FADE (`OPENING`): ALPHA-TO-COVERAGE from the start (one shader, built once; the logo stays opaque):
      // the fade's opacity, dithered per pixel between the 4 samples' levels, exactly 1 when faded in
      material.alphaToCoverage = true;
      const dither = interleavedGradientNoise(screenCoordinate).sub(0.5).mul(0.25);
      (material as unknown as { opacityNode: unknown }).opacityNode = logoFade.greaterThanEqual(1).select(float(1), logoFade.add(dither).clamp(0, 1));
      disposables.push(g, material);
      mark("material");
      const l = leanInSketch(g, t.sketch);
      const fc = leanFloorContact(g, l.matrix, t.unitsPerCm);
      floorContact = fc.point;
      mark("lean");
      logo = new THREE.Mesh(g, material);
      logo.name = "hero logo";
      // ⛔ THE FADE AS ONE SOLID LAYER (`OPENING`; 16 November 2026, session 2): its transparent material and the depth first
      {
        const fade = (material as unknown as { clone(): MeshPhysicalNodeMaterial }).clone();
        fade.alphaToCoverage = false;
        fade.transparent = true;
        fade.depthWrite = false;
        fade.depthFunc = THREE.LessEqualDepth;
        (fade as unknown as { opacityNode: unknown }).opacityNode = logoFade;
        const key = `${material.customProgramCacheKey()}:fade`;
        fade.customProgramCacheKey = () => key;
        fade.name = "hero logo (the opening's fade)";
        const depthMat = new MeshBasicNodeMaterial();
        // the logo's own vertex position (the same node: the same depth, so the fade's test meets it exactly)
        depthMat.positionNode = material.positionNode;
        depthMat.colorWrite = false;
        depthMat.transparent = true;
        depthMat.depthWrite = true;
        depthMat.name = "hero logo (the fade's depth)";
        const depth = new THREE.Mesh(g, depthMat);
        depth.name = "hero logo (the fade's depth)";
        depth.renderOrder = 1;
        depth.visible = false;
        logo.add(depth);
        logoFadeParts = { opaque: material, fade, depth };
        disposables.push(fade, depthMat);
      }
      // its pose is written whole each frame by the arrival (`update`)
      logo.matrixAutoUpdate = false;
      logo.matrix.copy(l.matrix);
      scene.add(logo);
      // the landing: the dance's centre (the field's middle, x and z; its height is the floor's)
      arrival = arrivalPlan(g, l, t.sketch, new THREE.Vector3(effect.position.x, FLOOR_Y, effect.position.z));
      mark("arrivalPlan");
      storyT = 0;
      {
        const m = new THREE.Matrix4();
        arrival.at(arrival.duration, m);
        const b = g.boundingBox!.clone();
        const wb = b.clone().applyMatrix4(m);
        settled = { matrix: m, bounds: b, topY: wb.max.y, bottomY: wb.min.y, box: wb };
      }
      mould = { matrix: mouldPose(g, t.sketch), bounds: g.boundingBox!.clone() };
      mark("mould");
      {
        // THE FALL's height (`FALL`): the mould pose's lowest vertex above the floor (world units)
        const pa = g.getAttribute("position");
        const v = new THREE.Vector3();
        let low = Infinity;
        for (let i = 0; i < pa.count; i++) low = Math.min(low, v.fromBufferAttribute(pa, i).applyMatrix4(mould.matrix).y);
        mouldDrop = low - FLOOR_Y;
      }
      // THE RAIN's HIT MAP (`hero-rain.ts`): the logo where it LANDS — the fall's pose at rest (`update`: the mould dropped
      // by `mouldDrop`, the rock 0 once the wobble is done)
      const landedPose = new THREE.Matrix4().makeTranslation(0, -mouldDrop, 0).multiply(mould.matrix);
      // the floor's heat, source 3: the solid logo's BASE where it lands (`leanFloorContact` on the landed pose)
      landedContact = leanFloorContact(g, landedPose, t.unitsPerCm).point;
      // ⛔ built by the worker ("landed"): the rain's hit map, and THE STEAM's solid mask (`hero-steam.ts`) — the same
      // landed pose; the steam's ink the flow map's (2 cells per cm). The rain's step program is warmed when they are in
      // (`compute`, `landedIn`)
      const upc = t.unitsPerCm;
      maps!
        .landed({ kind: "landed", landed: landedPose.toArray(), upc, floorY: FLOOR_Y, hit: HIT, steam: { margin: MARGIN, cellCm: steam.settings.cellCm } })
        .then((r) => {
          if (disposed) return;
          at("Landed");
          const t1 = performance.now();
          loadTimes.workerLanded = r.ms;
          rain.setLogo(r.hit, upc);
          steam.setLogo(g, landedPose, upc, face.ink, r.mask);
          loadTimes.landedMain = Math.round(performance.now() - t1);
          landedIn = true;
          maps?.dispose();
          maps = null;
        });
      loadTimes.arrivalTotal = Math.round(performance.now() - t0);
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
        floorContact: fc.point.toArray().map(r),
        floorContactVerts: fc.count,
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
    // its load is also awaited by the LOGO's material (the hardening mixes it in): a PMREM built before the image arrives
    // draws black for good (the note at the top)
    const courtyardDone = loaded();
    let courtyardResolve: () => void = () => {};
    courtyardReady = new Promise<void>((r) => (courtyardResolve = r));
    const courtyard = new THREE.TextureLoader().load("/hero-bench/courtyard-emblem.jpg", () => {
      courtyardDone();
      courtyardResolve();
    });
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

  /**
   * ⛔ THE RE-FORMING — INTO THE MOULD THROUGH THE c (13 November 2026, session 2; D-101). Carl: *"the yellow logo outline
   * is just a guide. The blobs must fill it up and become a solid logo, like the leaning logo, only face on. The dance
   * sequence should last about 7s. So after that if a blob touches the disc, it should take some mass and make its way to
   * the logo. Almost all of the blobs touch the letter "c". That could be the entry point. That wat the completed logo could
   * already ne there only masked. We would also be able to account for the disc and be able to remove it ib a realistic
   * way."* … *"Only a few blobs can hit the disc then- we nust account for its mass. Ones that are floating you can send
   * direct. Its the principle im after."* (the method delegated; he judges after the event).
   * MEASURED first (`hero-reform-contacts-13-november.mjs`): the field box ends at ~x 650, the mould spans x 277–1160 —
   * the c (and the 2's start) is the ONLY part the liquid can reach; the dance alone brings blobs to the disc after 7 s
   * at 7.2 … 30.8 s (one never in 40 s) and to the c rarely (its 34-unit depth) — so the blobs are GUIDED out of the dance.
   * - WHEN: `danceS` after the LAST blob's birth (the Builder's reading of "about 7s": the dance with all blobs out).
   * - THE ORDER: one leaves every `gapS`, nearest the c's entry first (planned once at the start, from the dance's own
   *   positions, which are a function of time: `pathAt`).
   * - THE DISC's MASS: the `carriers` blobs LOWEST at their departure dip into the disc (centre half a radius above its
   *   top, drawn in toward the middle), REST `dwellS` while they SWELL by `takeMass` of their strength (taking it), and the
   *   disc's radius drains a 1/`carriers` step over `drainS` from each touch — gone with the last carrier.
   * - THE FLOATING ONES go direct.
   * - THE ENTRY: each comes to a point BEHIND the c (`behindR` radii past its back, away from the camera), then sinks into
   *   the c's middle over `enterS`, its strength to nothing; as it does the LOGO — the same mesh, moved to the mould's pose
   *   (never two logos), masked by the FILL (the flow map's level, `FLOW`; take 1 a world-x front) — fills 1/n through the letters,
   *   and the orange light loses that blob's 1/n.
   * - THE MOTION: each leg eased (smoothstep), its time from its length at a PEAK of `speed` units/s (the dance's own top
   *   ~390–409); the hand-off from the dance blended over `blendS`. Values are takes.
   */
  // pourS (Carl: "you should slow the fill down slightly"): each blob's liquid spreads through the logo over 1.4 s (it
  // was the 0.6 s of its entry); then 1.4 → 2.8 (Carl: "slow the logo fill by 50%": half the speed, twice the time); then 2.8 → 4 (Carl: "its the 2.8s spread i want to focus on. First of all make that 4s"); then back to 2.8 with the
  // HARDENING (Carl: "kkep the 2.8 for filling and use 1.2 for hardening"): the logo fills as the blobs' liquid, and once
  // FULL the whole logo hardens over `hardenS` (`logoMaterial`)
  const REFORM = { danceS: 7, gapS: 0.45, carriers: 3, speed: 420, dwellS: 0.4, takeMass: 0.35, drainS: 0.6, enterS: 0.6, pourS: 2.8, hardenS: 1.2, blendS: 0.8, cShare: 0.33, behindR: 1 } as const;
  type V3 = [number, number, number];
  type ReformBlob = { i: number; carrier: boolean; depart: number; p0: V3; q: V3 | null; l1: number; touch: number; leave: number; l2: number; reach: number; e: V3; c: V3 };
  let reform: { start: number; blobs: ReformBlob[]; xMin: number; xMax: number } | null = null;
  const lerp3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
  const dist3 = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  /** the re-forming's start (emission seconds): `danceS` after the last birth */
  function reformStart(n: number): number | null {
    const last = birthOf(n - 1, n);
    return last ? last.t + REFORM.danceS : null;
  }
  /** the plan (field units, emission seconds), made once at the start from the dance's positions */
  function planReform(object: MarchingCubes, start: number, n: number, floor: boolean): NonNullable<typeof reform> | null {
    if (!mould) return null;
    const { radius, low } = fieldParams(n, object.isolation, object.resolution);
    const { matrix, bounds } = mould;
    const v = new THREE.Vector3();
    const toF = (x: number, y: number, z: number): V3 => {
      v.set(x, y, z).applyMatrix4(matrix);
      return [toField(v.x, object.position.x), toField(v.y, object.position.y), toField(v.z, object.position.z)];
    };
    const w = bounds.max.x - bounds.min.x;
    const cx = bounds.min.x + (REFORM.cShare * w) / 2;
    const cy = (bounds.min.y + bounds.max.y) / 2;
    const c = toF(cx, cy, (bounds.min.z + bounds.max.z) / 2);
    const back = toF(cx, cy, bounds.min.z);
    const away = Math.sign(back[2] - c[2]) || -1;
    const e: V3 = [back[0], back[1], back[2] + away * REFORM.behindR * radius];
    const xs = [bounds.min.x, bounds.max.x].map((x) => v.set(x, cy, bounds.min.z).applyMatrix4(matrix).x);
    const poolTop = floorLayer / object.resolution + POOL.topLift / 1400;
    const fullR = Math.sqrt(Math.max(0, POOL.fadeTo ** 2 - (floorLayer / object.resolution - 0.5) ** 2));
    const dance = (i: number, t: number) => pathAt(i, 0.5 * settings.speed * t, low, floor);
    const legS = (a: V3, b: V3) => Math.max(0.5, (1.5 * dist3(a, b) * 1400) / REFORM.speed);
    // the order: nearest the entry first, by where each is at the start
    const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => dist3(dance(a, start), e) - dist3(dance(b, start), e));
    const departs = order.map((i, k) => ({ i, depart: start + k * REFORM.gapS }));
    // the carriers: the lowest at their own departure
    const carriers = new Set([...departs].sort((a, b) => dance(a.i, a.depart)[1] - dance(b.i, b.depart)[1]).slice(0, REFORM.carriers).map((d) => d.i));
    const blobs = departs.map(({ i, depart }): ReformBlob => {
      const p0 = dance(i, depart);
      if (carriers.has(i)) {
        const dx = p0[0] - 0.5;
        const dz = p0[2] - 0.5;
        const s = Math.min(1, (0.6 * fullR) / Math.max(1e-6, Math.hypot(dx, dz)));
        const q: V3 = [0.5 + dx * s, poolTop + 0.5 * radius, 0.5 + dz * s];
        const l1 = legS(p0, q);
        const touch = depart + l1;
        const leave = touch + REFORM.dwellS;
        const l2 = legS(q, e);
        return { i, carrier: true, depart, p0, q, l1, touch, leave, l2, reach: leave + l2, e, c };
      }
      const l2 = legS(p0, e);
      return { i, carrier: false, depart, p0, q: null, l1: 0, touch: depart, leave: depart, l2, reach: depart + l2, e, c };
    });
    return { start, blobs, xMin: Math.min(...xs), xMax: Math.max(...xs) };
  }
  /** blob b's guided position at emission time t (after its departure) and its strength factor */
  function guidedAt(b: ReformBlob, t: number): { p: V3; k: number } {
    const enter = smooth((t - b.reach) / REFORM.enterS);
    if (t >= b.reach) return { p: lerp3(b.e, b.c, enter), k: (b.carrier ? 1 + REFORM.takeMass : 1) * (1 - enter) };
    if (b.carrier && b.q) {
      const took = 1 + REFORM.takeMass * smooth((t - b.touch) / REFORM.dwellS);
      if (t < b.touch) return { p: lerp3(b.p0, b.q, smooth((t - b.depart) / b.l1)), k: 1 };
      if (t < b.leave) return { p: b.q, k: took };
      return { p: lerp3(b.q, b.e, smooth((t - b.leave) / b.l2)), k: took };
    }
    return { p: lerp3(b.p0, b.e, smooth((t - b.depart) / b.l2)), k: 1 };
  }
  /** THE HARDENING's dial at emission time t: 1 (solid) outside the re-forming; in it 0 (the blobs' liquid) until the logo
   *  is FULL (the last entry + `pourS`), then eased to 1 over `hardenS` */
  function hardnessAt(t: number): number {
    if (!reform || t < reform.start) return 1;
    return smooth((t - fullAt()) / REFORM.hardenS);
  }
  /** emission seconds: the logo FULL; HARD (the fall starts); LANDED; the wobble DONE (phase 1's end) */
  function fullAt() {
    return reform ? Math.max(...reform.blobs.map((b) => b.reach)) + REFORM.pourS : Infinity;
  }
  const gWorld = () => 981 * (unitsPerCm ?? 1);
  const fallS = () => Math.sqrt((2 * Math.max(0, mouldDrop)) / gWorld());
  /** the re-forming's shares at emission time t: the disc drained, the blobs ENTERED (each over `enterS`: the light and
   *  the heat go with them) and the liquid POURED through the logo (each blob's over `pourS`, slower: the fill), 0–1 */
  function reformShares(t: number): { drained: number; filled: number; poured: number } {
    if (!reform) return { drained: 0, filled: 0, poured: 0 };
    let drained = 0;
    let filled = 0;
    let poured = 0;
    for (const b of reform.blobs) {
      if (b.carrier) drained += smooth((t - b.touch) / REFORM.drainS) / REFORM.carriers;
      filled += smooth((t - b.reach) / REFORM.enterS) / reform.blobs.length;
      poured += smooth((t - b.reach) / REFORM.pourS) / reform.blobs.length;
    }
    return { drained, filled, poured };
  }
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
    // the re-forming's plan, made once when it starts (`REFORM`)
    if (!reform && emitT >= 0) {
      const start = reformStart(numblobs);
      if (start !== null && emitT >= start) reform = planReform(object, start, numblobs, floor);
    }
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
      let strength = baseStrength * grow;
      let r = radius * Math.sqrt(grow);
      // clear of the box's left side by its own radius and the undrawn outer layer
      const bx = Math.max(birth.x, r + 1.5 / object.resolution);
      let ballx = bx + (pathx - bx) * e;
      let bally = birth.y + (pathy - birth.y) * e;
      let ballz = birth.z + (pathz - birth.z) * e;
      // ⛔ THE RE-FORMING (`REFORM`): from its departure, blended off the dance onto its guided way to the c
      const rb = reform?.blobs.find((b) => b.i === i);
      if (rb && emitT >= rb.depart) {
        const g = guidedAt(rb, emitT);
        if (g.k <= 0.001) continue; // entered: no longer in the field
        [ballx, bally, ballz] = lerp3([ballx, bally, ballz], g.p, smooth((emitT - rb.depart) / REFORM.blendS));
        strength *= g.k;
        r = radius * Math.sqrt(grow * g.k);
      }
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
    // over the disc as it stands, is an ARRIVAL on its rising edge (once per blob per descent); not in the re-forming (the
    // carriers' dips TAKE from the disc)
    if (floor && !reform) {
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

  /**
   * ⛔ THE WARM-UP — THE STORY's LATER PROGRAMS BUILT IN THE BACKGROUND (16 November 2026; D-101). Carl: *"Yes, fix them
   * now."* MEASURED in a FRESH browser (an empty shader cache, as a first-time visitor; `live-work/scripts/hero-pipeline-
   * builds-16-november.mjs` logs what is built when): the LIQUID first drawn at touchdown (133 ms); the RAIN's step and
   * draws at its release (~100 ms); (the ~600 ms–2.7 s at the emission was the orange light's `visible` switch: `update`).
   * Once the logo exists, WHILE THE STORY RUNS, the liquid, the heat plane and the rain's drops and splashes are compiled
   * in the BACKGROUND (`compileAsync`: r185 builds render pipelines asynchronously), each made visible (and not culled)
   * only for `compileAsync`'s synchronous gather; the rain's step program is run once with no drop live (`HeroRain.warm`;
   * r185 builds compute pipelines synchronously only — ⛔ since 16 November 2026, session 2, the rain's and the steam's
   * compute pipelines are first COMPILED IN THE BACKGROUND, `hero-steam.ts`, `precompileCompute`, so that synchronous build
   * is a cache hit). The steam warms itself (`hero-steam.ts`, `warm`).
   * ⛔ THE LOGO IS LEFT OUT, and the story is NOT held. ⚰️ Withdrawn the same day: the logo hidden and the story's clock
   * held until the warm-up was done (~6 s of the text alone on a cold cache). Carl: *"That is far too long to have text on
   * its own. The start of the story is the logo realises their is a visitor and responds. ... Whats to stop a visitor going
   * straight to the menu or scrolling. This is a fundamental change i didnt ask for and goes against the first line in the
   * story."* The logo is hidden for the gather so `compileAsync` does not take its pipeline (a pipeline still compiling is
   * SKIPPED by r185's draw: the logo would vanish by another route). ⚠ So the LOGO's OWN first build (~4.3 s on a cold
   * cache, measured) is NOT fixed here: it is Carl's open question (D-101, 16 November).
   */
  async function warmScene(renderer: WebGPURenderer) {
    const t0 = performance.now();
    rain.warm(renderer);
    loadTimes.warmRainStep = Math.round(performance.now() - t0);
    // ⛔ THE LOGO IS IN IT AGAIN (16 November 2026, Carl's OPENING, `OPENING`): it is not drawn until its fade, which waits
    // for this — so its background build hides nothing
    // ⛔ THE CODE DROPS' mesh too (`hero-code-drops.ts`; 20 November 2026): hidden outside its band, so shown here to be
    // built now, not at the last band
    // ⛔ + the cloth (`hero-cloth.ts`; 20 November 2026): hidden until its environment is in, so shown here to be built now
    const show: THREE.Object3D[] = [view, heatPlane, rain.group, rain.codeMesh, floorHeat.mesh, cloth.group];
    if (logo) show.push(logo);
    const keep = show.map((o) => [o.visible, o.frustumCulled] as const);
    for (const o of show) {
      o.visible = true;
      o.frustumCulled = false;
    }
    // compileAsync gathers what to build synchronously at the call; everything is put back straight after
    const tc = performance.now();
    // ⛔ BOTH of the logo's materials (`logoFadeParts`, 16 November 2026, session 2): the fade's (and its depth) for the
    // opening, the opaque one for the story after it — two gathers, the logo's material swapped between them
    const parts = logoFadeParts;
    const keepMat = logo?.material;
    const keepDepth = parts?.depth.visible ?? false;
    const builds: Promise<void>[] = [];
    if (logo && parts) {
      logo.material = parts.fade;
      parts.depth.visible = true;
      builds.push(renderer.compileAsync(scene, camera));
      logo.material = parts.opaque;
      parts.depth.visible = false;
    }
    builds.push(renderer.compileAsync(scene, camera));
    if (logo && keepMat) logo.material = keepMat;
    if (parts) parts.depth.visible = keepDepth;
    const done = Promise.all(builds);
    loadTimes.warmGatherSync = Math.round(performance.now() - tc);
    show.forEach((o, i) => {
      o.visible = keep[i][0];
      o.frustumCulled = keep[i][1];
    });
    await done;
    warmMs = Math.round(performance.now() - t0);
    performance.mark("hero:WarmDone");
  }

  const easeSine = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, u)));
  /** the opening's share of a beat (start, length in opening seconds), eased in and out (`/start`'s curve) */
  const beat = ([start, len]: readonly [number, number]) => easeSine((opening.t - start) / len);
  /** the logo's programs are built (`warmScene`) */
  const openingReady = () => warmed;
  function resetOpening() {
    opening.t = 0;
    opening.fadeT = -1;
    opening.done = false;
    opening.subT = -1;
    // a replay: the load is long done — the warm-up's moment is the start
    opening.warmT = warming || warmed ? 0 : -1;
  }
  /** the logo's opacity in the opening: 0 before its fade, eased up over `logoFadeS`, 1 once the opening is done */
  const logoOpacity = () => (opening.done ? 1 : opening.fadeT < 0 ? 0 : easeSine((opening.t - opening.fadeT) / OPENING.logoFadeS));
  /** ⛔ THE OPENING's CLOCK (`OPENING`): the lights, the subtext, the logo's fade; the story starts at its end */
  function stepOpening(delta: number) {
    if (opening.done) {
      lit.value = 1;
      reveal1.value = 1e9;
      reveal2.value = 1e9;
      light.intensity = KEY_I;
      ambientLight.intensity = AMBIENT_I;
      return;
    }
    opening.t += delta;
    const L = beat(OPENING.litS);
    lit.value = L;
    light.intensity = KEY_I * L;
    ambientLight.intensity = AMBIENT_I * L;
    // the warm-up's start, on the opening's clock (the load's main-thread stalls come with it and the logo's arrival)
    if (opening.warmT < 0 && warming) opening.warmT = opening.t;
    // THE SUBTEXT's START: its time, or `settleS` after the warm-up began if later (no stall on it), never past the ceiling
    const [s1, len1] = OPENING.sub1;
    if (opening.subT < 0 && opening.t >= s1 && ((opening.warmT >= 0 && opening.t >= opening.warmT + OPENING.settleS) || opening.t >= s1 + OPENING.subCeilingS)) opening.subT = opening.t;
    // everything after keeps its spacing from the subtext's start
    const shift = opening.subT < 0 ? Infinity : opening.subT - s1;
    if (subLines) {
      const edge = (r: [number, number], s: number) => (s <= 0 ? -1e9 : s >= 1 ? 1e9 : r[0] + (r[1] - r[0]) * s);
      reveal1.value = edge(subLines.x1, beat([s1 + shift, len1]));
      reveal2.value = edge(subLines.x2, beat([OPENING.sub2[0] + shift, OPENING.sub2[1]]));
    }
    // the leaning logo fades in at its time AND once built (never drawn before it is built)
    if (opening.fadeT < 0 && logo && openingReady() && opening.t >= OPENING.logoAtS + shift) opening.fadeT = opening.t;
    // faded in: the story begins (the lean's hold, then the jump)
    if (opening.fadeT >= 0 && opening.t >= opening.fadeT + OPENING.logoFadeS) {
      opening.done = true;
      storyT = 0;
    }
  }

  function update(delta: number) {
    stepOpening(delta);
    // THE PRIMER (above): drawn `PRIMER_FRAMES` frames, then gone
    if (primer && ++primerFrames > PRIMER_FRAMES) {
      scene.remove(primer);
      primer.geometry.dispose();
      (primer.material as THREE.Material).dispose();
      primer = null;
      performance.mark("hero:PrimerDone");
    }
    // ⛔ THE ARRIVAL (`arrivalPlan`): the logo's pose on the story's clock, once; still after it settles
    const wasT = storyT;
    // ⚰️ the story's clock waited for THE WARM-UP (16 November 2026) — WITHDRAWN the same day (`warmScene`): the story
    // starts the moment the logo exists. ⛔ 16 November 2026 (Carl's opening, `OPENING`): the story starts when the
    // OPENING ends — the logo swivelled into the lean
    if (logo && opening.done) storyT += delta;
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
    // ⛔ THE RE-FORMING (`REFORM`): the plan is cleared before the emission; once it runs, the SAME logo stands in the
    // mould's pose, masked by the fill (the flow map, `FLOW`) as the liquid pours in
    if (emitT < 0) reform = null;
    const { drained, filled, poured } = reformShares(emitT);
    fillFront.value = 1e6;
    hardness.value = hardnessAt(emitT);
    liquidClock.value = Math.max(0, emitT);
    if (reform && mould && logo && flow && emitT >= reform.start) {
      // THE FALL (`FALL`): the bob while liquid; from HARD, the drop and the landing's rock
      const hardAt = fullAt() + REFORM.hardenS;
      let dy = ((FALL.bobCm * (unitsPerCm ?? 1)) / 2) * Math.sin(2 * Math.PI * FALL.bobHz * (emitT - reform.start)) * (1 - hardness.value);
      let rock = 0;
      const tf = emitT - hardAt;
      if (tf > 0) {
        const T = fallS();
        if (tf < T) dy -= 0.5 * gWorld() * tf * tf;
        else {
          dy -= mouldDrop;
          rock = wobbleAngle((tf - T) * 1000);
        }
      }
      const b = mould.bounds;
      fallP.set((b.min.x + b.max.x) / 2, b.min.y, rock >= 0 ? b.max.z : b.min.z);
      // world drop · the mould pose · the rock about the base's edge (local x, + tips the top toward the face)
      logo.matrix.makeTranslation(0, dy, 0).multiply(mould.matrix);
      logo.matrix.multiply(fallT.makeTranslation(fallP.x, fallP.y, fallP.z)).multiply(fallR.makeRotationX(rock)).multiply(fallT.makeTranslation(-fallP.x, -fallP.y, -fallP.z));
      logo.matrixWorldNeedsUpdate = true;
      dissolveFront.value = 1e6;
      // the liquid's level in the flow map: the distance by which the poured share of the ink's area is full (`FLOW`)
      fillFront.value = flow.level(poured);
      logo.visible = poured > 0;
    }
    // ⛔ THE OPENING (`OPENING`): the leaning logo not drawn before its fade; then fading in (its opacity, a uniform)
    if (logo) {
      logoFade.value = logoOpacity();
      if (!opening.done && opening.fadeT < 0) logo.visible = false;
      // THE FADE AS ONE LAYER: while the opening runs, the fade's material after its depth; once done, the opaque logo
      if (logoFadeParts) {
        const fading = !opening.done;
        logo.material = fading ? logoFadeParts.fade : logoFadeParts.opaque;
        logo.renderOrder = fading ? 2 : 0;
        logoFadeParts.depth.visible = fading;
      }
    }
    // ⛔ THE FLOOR's HEAT, SOURCE 1 — THE LEANING LOGO (`hero-floor.ts`; 18 November 2026): at its contact edge, at full
    // strength (⚰️ the Builder's unasked cooling REMOVED — Carl: *"I did not tell you to make it fade"*), shown through a
    // RADIAL MASK (Carl: *"when it leaps, no contact is on the floor. Heat at the extremity of the web will dissapear first
    // ... a radial fade or mask for 500ms, outside to in. Consequently, when the logo fades in ... We need to opposite
    // effect, inside out."*):
    // - THE SPREAD: from the START of the logo's fade-in the mask OPENS from the contact edge to the rim over
    //   `FLOOR_SPREAD_S` (2.5 s, Carl), linear — so it runs on 1.3 s past the 1.2 s fade, into the lean (story 1.3 s).
    // - THE COLLAPSE: from LIFT-OFF (`ARRIVAL.holdS`) the mask CLOSES from the rim to the contact edge over
    //   `FLOOR_SPREAD_S` (2.5 s, Carl; was 500 ms, then 2 s), linear — gone at story 4.5 s.
    // A pure function of the story's clock: replayed and frame-stepped runs give the same floor
    if (logo && floorContact) {
      // seconds since the fade-in started: in the opening its own clock; after it, the fade's length + the story's clock
      const sinceFade = opening.done ? OPENING.logoFadeS + storyT : opening.fadeT >= 0 ? opening.t - opening.fadeT : -1;
      const opened = sinceFade < 0 ? 0 : Math.min(1, sinceFade / FLOOR_SPREAD_S);
      const closed = Math.max(0, Math.min(1, (storyT - ARRIVAL.holdS) / FLOOR_SPREAD_S));
      floorHeat.setSource(0, { x: floorContact.x, z: floorContact.z, strength: 1, extent: opened * (1 - closed) });
    } else floorHeat.setSource(0, null);
    // ⛔ PHASE 2, THE RAIN (`hero-rain.ts`; Carl, 14 November 2026: *"the rain starts just as the wobble ends"*): the seconds
    // since phase 1's end — HARD, the fall, the landing's wobble done (the `reform` read-out's `endS`); NaN before the
    // re-forming has a plan (nothing to rain on). The rain releases its first drops one fall early, so they land at 0
    const phase1End = reform ? fullAt() + REFORM.hardenS + fallS() + LAND_WOBBLE.ms / 1000 : NaN;
    rain.update(delta, emitT >= 0 ? emitT - phase1End : NaN);
    // ⛔ THE CLOTH (`hero-cloth.ts`): on its own clock from load, stepped by the bench's/story's time
    cloth.update(delta);
    // the wash follows the rain that has LANDED (0 until the first drop, 1 by the last)
    washShare.value = rain.wash;
    // ⛔ THE TEMPERATURE (`hero-heat.ts`): its sub-steps owed on the story's clock (stepped in `compute`); no wash = reset
    logoHeat.update(delta, rain.wash);
    for (const k of Object.keys(wetSettings) as (keyof HeroWetSettings)[]) wetU[k].value = wetSettings[k];
    // the logo's own key fades as the wash completes (`LOGO_KEY`)
    logoKey.intensity = light.intensity * (1 - rain.wash);
    // ⛔ THE STEAM (`hero-steam.ts`): on the rain's clock (the first drops landing), × the red still left
    steam.update(delta, rain.sinceFirstLanding, 1 - rain.wash, camera.position);
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
      // the re-forming's carriers TAKE it back (`REFORM`): gone with the last
      poolGrow = Math.max(0, Math.min(1, poolGrow) - drained);
    }
    const live = settings.blobs && (emitT >= 0 || (settings.floor && poolT >= 0));
    // ⛔ THE FLOOR's HEAT, SOURCE 2 — THE AMBER LIQUID (`hero-floor.ts`; 18 November 2026). Carl: *"we can infer that the
    // amber liquid has some heat. Not as much as the logo though. When touchdown happens some effect can be seen on the floor
    // from the amber liquid. The logo breaks down and when the first blob hits the liquid this supercharges it. It can spread
    // outwards. The speed can be the same but it will be longer given its larger area."* So, on the landing (the disc's
    // centre, the field's middle):
    // - FROM TOUCHDOWN: about the DISC as it grows (`poolGrow`: the disc's own radius × `liquidReach`, so it grows with the
    //   liquid and shows BEYOND its edge — take 1 kept to the edge and the disc, 3 cm up, hid it all), at `liquidStrength`
    //   (less than the logo's);
    // - FROM THE FIRST BLOB REACHING THE DISC (`poolHits[0]`, detected live): SUPERCHARGED — the strength rises to
    //   `chargedStrength` over `chargeS`, and the web spreads outward from the disc's edge at the LOGO's speed (its radius
    //   over `FLOOR_SPREAD_S`) to `chargedRadiusCm` — longer, as the area is larger. Then HELD (no fade until Carl says).
    // The blobs' own glows near the floor are the 13 November merge glow (`heatPlane`, `stepHeat`), unchanged.
    if (live && poolT >= 0 && unitsPerCm) {
      const fs = floorHeat.settings;
      const fullR = Math.sqrt(Math.max(0, POOL.fadeTo ** 2 - (floorLayer / effect.resolution - 0.5) ** 2));
      const discCm = ((Math.max(0, poolGrow * (fullR + POOL_GROW.edge) - POOL_GROW.edge) * 1400) / unitsPerCm) * fs.liquidReach;
      const first = poolHits.length ? emitT - poolHits[0] : -1;
      const speed = fs.radiusCm / FLOOR_SPREAD_S;
      // before the first blob the web follows the disc. ⛔ THEN BY THE HITS — CAUSED BY THE WORLD (Carl, 18 November 2026:
      // *"the first blob hit should expand it a little. The next blob hit, expand a little more and another to ful size. We
      // also know when the second to last and last blob hit so the effect can happen in reverse."* … told the first three
      // hits land within 0.3 s: *"caused by the world ... even if the surges are small it would still add to the area. 300ms
      // is quick for the human eye. i wont know until i see it. After the last hit we will have to look at it and when the
      // rain starts."*): the reach at the first hit (`liquidHitCm`) and the full radius split in three STEPS; each of the
      // first three hits in the disc (`poolHits`, live) raises the TARGET a step; in reverse the SECOND-TO-LAST and LAST
      // carrier touches (`reform`, the blobs taking the disc back) lower it a step each, and once the amber is DRAINED it
      // collapses to nothing. The edge moves toward the target at the logo's speed (take 2's lesson: never jump with the
      // disc)
      if (first < 0) {
        liquidHitCm = discCm;
        liquidReachCm = discCm;
      } else {
        const step = Math.min(3, poolHits.filter((h) => emitT >= h).length);
        liquidStep = step;
        const target = liquidHitCm + ((fs.chargedRadiusCm - liquidHitCm) * step) / 3;
        const move = speed * Math.max(0, delta);
        // ⛔ THE COLLAPSE — SLOW, AND GONE WHEN THE LOGO IS FULLY FORMED (Carl, 18 November 2026: first *"yes if would collapse
        // fully"* once the amber is drained; then *"make the larger area shrink much slower. When the logo is fully forned the
        // last web must be gone. the collapse can be slower. the floor has been hotter so is should collapse slower."*): from
        // the SECOND-TO-LAST carrier touch (the blobs taking the amber back) the reach shrinks steadily from where it is to
        // NOTHING, arriving exactly when the logo is FULL (`fullAt`). ⚰️ Was: a step down at each of the last two touches,
        // then nothing at the drain, at the logo's speed (100 cm/s; gone ~3.4 s after it began)
        const touches = reform ? reform.blobs.filter((b) => b.carrier).map((b) => b.touch).sort((a, b) => a - b) : [];
        const from = touches.length >= 2 ? touches[touches.length - 2] : touches[0];
        if (reform && from !== undefined && emitT >= from) {
          if (liquidCollapseCm < 0) liquidCollapseCm = liquidReachCm;
          const u = Math.max(0, Math.min(1, (emitT - from) / Math.max(0.1, fullAt() - from)));
          liquidReachCm = liquidCollapseCm * (1 - u);
          liquidStep = 0;
        } else liquidReachCm = liquidReachCm < target ? Math.min(target, liquidReachCm + move) : Math.max(target, liquidReachCm - move);
      }
      const radCm = Math.min(fs.chargedRadiusCm, liquidReachCm);
      const charge = first < 0 ? 0 : smooth(first / Math.max(0.01, fs.chargeS));
      const strength = fs.liquidStrength + (fs.chargedStrength - fs.liquidStrength) * charge;
      floorHeat.setSource(1, { x: effect.position.x, z: effect.position.z, strength, extent: radCm / Math.max(1, fs.chargedRadiusCm), radiusCm: fs.chargedRadiusCm, colour: fs.liquidColour });
    } else {
      floorHeat.setSource(1, null);
      liquidReachCm = 0;
      liquidHitCm = 0;
      liquidStep = 0;
      liquidCollapseCm = -1;
    }
    // ⛔ THE FLOOR's HEAT, SOURCE 3 — THE SOLID LOGO (Carl, 18 November 2026: *"when the solidified logo lands, the floor
    // would have the properties of the leaning logo"*): from the LANDING of the fall (`fullAt` + `hardenS` + the fall), at
    // its BASE (`landedContact`: the landed pose's lowest vertices, as the lean's contact edge), the lean's web — the same
    // strength, radius and colour — spreading inside out over `FLOOR_SPREAD_S`, then HELD; the rain turns it blue (below)
    if (reform && landedContact && unitsPerCm) {
      const sinceLand = emitT - (fullAt() + REFORM.hardenS + fallS());
      floorHeat.setSource(2, sinceLand < 0 ? null : { x: landedContact.x, z: landedContact.z, strength: 1, extent: Math.min(1, sinceLand / FLOOR_SPREAD_S), coolable: true });
    } else floorHeat.setSource(2, null);
    // ⛔ THE RAIN COOLS IT (Carl, 18 November 2026: *"the rain falls in an almost circular area. the rain woukd make the red
    // inside this area turn blue almost right away. At the extremity, it would be slower."*): the floor reads the RAIN
    // itself — its disc (centre, radius) and its clock since the first drops landed — not the logo's temperature: the floor
    // is cooled by the water falling on it. (The note's [R9] had source 3 read `hero-heat.ts`; Carl's model is the rain.)
    const rainMap = rain.info?.map;
    floorHeat.update(warmed, unitsPerCm ?? 1, delta, rainMap ? { x: rainMap.centre[0], z: rainMap.centre[1], radiusCm: rain.settings.radiusCm, sinceFirstLanding: rain.sinceFirstLanding } : null);
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
    // ⛔ OFF BY INTENSITY 0, NOT BY `visible` (16 November 2026; D-101, the first-run hitches): r185 rebuilds EVERY lit
    // material when the number of lights changes — the text, the logo and the liquid were rebuilt the moment the blobs came
    // out (story 4.72 s; ~600 ms on a cold shader cache, measured). In the light list always, it adds exactly 0 when off:
    // the same picture (null control), one light set, no rebuild. Its intensity below is 0 unless the blobs are out
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
    // … and each blob that ENTERS the logo takes its 1/n back (`REFORM`; Carl, 11 November: *"When the blobs reform into
    // the logo, the lights are not needed."*)
    pointLight.intensity = blobsOut ? EMISSION.light * Math.max(0, out - filled) : 0;
    // the floor's heat (`stepHeat`) is the blobs' and the floor's: hidden and cleared without them
    // … and it COOLS WITH THE FILL (13 November 2026, session 2; Carl: *"the end logo should ne ted, with no hints of
    // orange. Exactly as it is in leaning state before the blobs took over."*): each blob that enters the logo takes its
    // 1/n of the glow (the additive plane's colour scaled), and the floor is cold — not drawn — when the logo is whole
    heatPlane.visible = blobsOut && settings.floor && filled < 1;
    heatMat.color.setScalar(1 - filled);
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
    // ⛔ NO EMPTY DRAW (20 November 2026; Carl: "yes, fix it"): a field with no surface leaves the draw range at 0, and three
    // r185 still sends a draw of 0 vertices (only a negative count is skipped) — Chrome's "Draw with a vertex count of 0 is
    // unusual", 424 draws a story (`live-work/scripts/hero-zero-vertex-draw-20-november.mjs`). Shown only with triangles,
    // the same frame they are built (the warm-up still shows it to compile it)
    view.visible = effect.geometry.drawRange.count > 0;
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
      // from the LEAN: the opening skipped (its end state: the lights up, the subtext whole)
      opening.done = true;
      storyT = 0;
      danceT = 0;
      if (logo) logo.visible = true;
    },
    openingAgain() {
      resetOpening();
      storyT = 0;
      danceT = 0;
    },
    get openingInfo() {
      const r = (v: number) => Math.round(v * 100) / 100;
      return { t: r(opening.t), ready: openingReady(), subAtS: r(opening.subT), fadeAtS: r(opening.fadeT), done: opening.done, lit: r(lit.value), logoOpacity: r(logoOpacity()) };
    },
    get blobs() {
      return blobRead;
    },
    get mould() {
      return mould;
    },
    get flow() {
      return flow;
    },
    get reform() {
      if (!reform) return null;
      const r = (v: number) => Math.round(v * 100) / 100;
      const t = arrival && storyT >= arrival.duration ? storyT - arrival.duration : -1;
      const hard = fullAt() + REFORM.hardenS;
      return { startS: r(reform.start), filled: r(reformShares(t).poured), hardness: r(hardnessAt(t)), fullS: r(fullAt()), hardS: r(hard), landS: r(hard + fallS()), endS: r(hard + fallS() + LAND_WOBBLE.ms / 1000), dropCm: r(mouldDrop / (unitsPerCm ?? 1)), blobs: reform.blobs.map((b) => ({ i: b.i, carrier: b.carrier, departS: r(b.depart), touchS: r(b.touch), reachS: r(b.reach) })) };
    },
    update,
    compute(renderer: WebGPURenderer) {
      const tc = performance.now();
      rain.compute(renderer);
      cloth.compute(renderer);
      steam.compute(renderer, scene, camera);
      logoHeat.compute(renderer);
      const ms = Math.round(performance.now() - tc);
      if (ms > (loadTimes.computeMaxMs ?? 0)) loadTimes.computeMaxMs = ms;
      // THE RAIN's STEP PROGRAM (`HeroRain.warm`) is built from its hit map, which arrives from the worker AFTER the logo
      // (`landedIn`, 16 November 2026, session 2): run once when it is in (the warm-up's own call is then a no-op if early)
      if (landedIn && !rainWarmed) {
        rainWarmed = true;
        rain.warm(renderer);
      }
      // THE WARM-UP (`warmScene`): once the logo exists, in the background, while the story runs
      if (logo && !warmed && !warming) {
        warming = true;
        at("Warm");
        warmScene(renderer)
          .catch((e: unknown) => console.warn("[hero] warm-up", e))
          .finally(() => {
            warmed = true;
          });
      }
    },
    floor: floorHeat.settings,
    get floorInfo() {
      return { ...floorHeat.info, liquidStep, liquidReachCm: Math.round(liquidReachCm) };
    },
    get warmed() {
      return warmed;
    },
    get warmMs() {
      return warmMs;
    },
    get loadTimes() {
      return loadTimes;
    },
    wet: wetSettings,
    heat: logoHeat.settings,
    get heatInfo() {
      return logoHeat.info;
    },
    steam: steam.settings,
    get steamInfo() {
      return steam.info;
    },
    rain: rain.settings,
    code: rain.code,
    cloth: {
      settings: cloth.settings,
      again: () => cloth.again(),
      get info() {
        return cloth.info;
      },
      get points() {
        return cloth.points;
      },
    },
    rainAgain() {
      rain.again();
    },
    get rainInfo() {
      return rain.info;
    },
    dispose() {
      disposed = true;
      maps?.dispose();
      textDispose?.();
      for (const d of disposables) d.dispose();
    },
  };
}
