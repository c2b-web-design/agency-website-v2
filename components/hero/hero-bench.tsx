"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { WebGPURenderer } from "three/webgpu";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Container from "@/components/layout/container";
import { BTN, Edges, FEEL, readPad, rigAt, stepRig, type Intent, type Rig } from "@/components/showcase/camera-pad";
import { createHeroScene, FLOOR_Y, HERO_ENVIRONMENTS, HOME, type HeroEnvironment } from "./hero-scene";
import { RAIN_MAX_DROPS } from "./hero-rain";
import { LOGO_OUTLINE } from "@/components/about/logo-mark-outline";

/**
 * ⛔ THE HERO's BENCH — `/proto/hero` (11 November 2026, session 1; D-101; the structural note
 * `live-work/structural-note-hero-bench-11-november.md` v1.3). Carl: *"Can we moves the marching scene to a new bench with
 * a different scale. We will still need access to cameras as the end of the animation process."* … *"WebGPU"*.
 * STEP 1 of four (note, "The decision"): the scene (`hero-scene.ts`) under the bench's tools, and HOME. Step 2 the logo
 * at the lean and the scale; step 3 the three.js text, the volume, the blobs; step 4 the cameras.
 *
 * ⛔ THE BENCH's TOOLS, NEVER ON THE SITE (Carl: *"the controls would be good to have access to on the bench, for tweaking
 * and making it our own. It should not be on the site though along with the frame rate counter"*): the panel, the FPS
 * meter, the orbit controls, the home page's text over the canvas, the camera readout. They live HERE; the scene module
 * imports none of them.
 *
 * The bench owns: the renderer (WebGPU; a lost device stops the loop), the CLOCK (`Timer`, `connect(document)`, disposed
 * here), the loop (waits for the scene's `ready`), the orbit controls and their target, the panel, the meter, the overlay,
 * the readout, Copy, Home, the remembered camera. Unmount: the loop stops, the bench's parts go, the scene's, then the
 * renderer (the reference's order).
 *
 * ⛔ HOME (note v1.3, "HOME"): the camera is REMEMBERED in this browser (its own key; Carl, 27 October, of the camera bench:
 * *"It shouldnt move"*) and on load the remembered view BEATS `HOME`. The panel's Camera readout and COPY give Carl the
 * numbers to paste; the Builder writes them into `HOME` in code; the HOME BUTTON goes there (Home is checked through it).
 * ⚠ DEV: `window.__heroBench` (development only).
 */

/** the remembered camera — position, orbit target, lens; its OWN key (never the camera bench's) */
const CAMERA_KEY = "c2b-hero-bench-camera-v1";
type Pose = { position: [number, number, number]; target: [number, number, number]; fov: number };

function readPose(): Pose | null {
  try {
    const o = JSON.parse(window.localStorage.getItem(CAMERA_KEY) ?? "null") as Pose | null;
    const v3 = (a: unknown) => Array.isArray(a) && a.length === 3 && a.every((n) => Number.isFinite(n));
    return o && v3(o.position) && v3(o.target) && Number.isFinite(o.fov) ? o : null;
  } catch {
    return null; // unreadable storage: Home
  }
}
function writePose(p: Pose) {
  try {
    window.localStorage.setItem(CAMERA_KEY, JSON.stringify(p));
  } catch {
    // a per-viewer convenience: a failed write is said nowhere
  }
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export default function HeroBench() {
  const box = useRef<HTMLDivElement>(null);
  const homeText = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = box.current;
    if (!host) return;
    const container: HTMLDivElement = host;
    const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const size = () => ({ w: container.clientWidth, h: container.clientHeight });
    let live = true;
    let gui: GUI | null = null;
    let stats: Stats | null = null;
    let controls: OrbitControls | null = null;
    let renderer: WebGPURenderer | null = null;
    let backend = "starting";

    const timer = new THREE.Timer();
    timer.connect(document);

    const { w, h } = size();
    const hero = createHeroScene(w / h);
    const { scene, camera, settings } = hero;

    // ⛔ THE GRID FLOOR — a GUIDE, bench only, drawn APART from the field (so nothing puddles into it) at the scene's
    // `FLOOR_Y` (the subtext's y tips). Carl: *"without a floor, everything is floating in space for me, it would be good to
    // have some perspective"*; *"The scale is not inportant to me, though it will be to you."* Spacing in SCENE UNITS until
    // step 2's scale gives them centimetres. Rebuilt when the spacing changes
    // ⛔ OFF BY DEFAULT (16 November 2026, session 2; D-101). Carl: *"The grid lines were for my benefit when putting the page
    // together. To establish relative distance of objects from each other. In the finished scene they wont be there. In fact,
    // theyve served their purpose and are not needed anymore."* … *"you can switch it off now"*. The panel's switch kept.
    // (It also carried the flick at the logo's fade end: this GPU draws the grid dimmer after a LARGE draw — D-101.)
    const floor = { grid: false, spacing: 100 };
    const GRID_EXTENT = 4000;
    let grid: THREE.GridHelper | null = null;
    const buildGrid = () => {
      if (grid) {
        scene.remove(grid);
        grid.geometry.dispose();
        (grid.material as THREE.Material).dispose();
      }
      const divisions = Math.max(1, Math.round(GRID_EXTENT / floor.spacing));
      grid = new THREE.GridHelper(divisions * floor.spacing, divisions, 0x5a5a5a, 0x2c2c2c);
      grid.position.set(0, FLOOR_Y, 0);
      grid.visible = floor.grid;
      scene.add(grid);
    };
    buildGrid();

    // ⛔ THE MOULD's OUTLINE — a GUIDE, bench only (13 November 2026; Carl: *"in the space on the right in the proto hero
    // viewport draw a yellow logo outline, it should be the smae size as the upright logo but facing us in it normal
    // orientation. Im looking for good spacing within the viewport when the blobs are gone."*). The sketch bench's own
    // outline (`hero-logo.tsx`, `FaceOnOutline`: `LOGO_OUTLINE` scaled by the logo mesh's measured height, on its FACE,
    // amber `#ffb84d`, unlit, one closed line) placed by the scene's mould pose (`hero.mould`); built once the logo is in
    // OFF by default (13 November 2026, session 2; Carl: *"take the yellow guide lines away"*): the re-forming fills the
    // mould; the switch stays (Logo → "mould outline") to check its place
    const mouldGuide = { outline: false };
    let mouldLine: THREE.Line | null = null;
    const buildMouldLine = () => {
      const m = hero.mould;
      if (mouldLine || !m) return;
      const hCm = m.bounds.max.y - m.bounds.min.y;
      const pts: number[] = [];
      for (let i = 0; i < LOGO_OUTLINE.length; i += 2) pts.push(LOGO_OUTLINE[i] * hCm, LOGO_OUTLINE[i + 1] * hCm, m.bounds.max.z);
      // closed by repeating the first point: WebGPU draws no `LineLoop`
      pts.push(pts[0], pts[1], pts[2]);
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
      mouldLine = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffb84d }));
      mouldLine.name = "hero mould outline (guide)";
      mouldLine.matrixAutoUpdate = false;
      mouldLine.matrix.copy(m.matrix);
      mouldLine.visible = mouldGuide.outline;
      scene.add(mouldLine);
    };

    // the readout's values (the panel's Camera folder lists them)
    const readout = { position: "", target: "", distance: "", fov: "", window: "", backend: "" };
    const pose = (): Pose => ({
      position: camera.position.toArray().map(r1) as Pose["position"],
      target: (controls ? controls.target.toArray() : HOME.target).map(r1) as Pose["target"],
      fov: r1(camera.fov),
    });
    const refreshReadout = () => {
      const p = pose();
      const { w, h } = size();
      readout.position = p.position.join(", ");
      readout.target = p.target.join(", ");
      readout.distance = String(r1(controls ? camera.position.distanceTo(controls.target) : camera.position.length()));
      readout.fov = `${p.fov}°`;
      readout.window = `${w} × ${h} layout px, zoom ${r1(zoom * 100) / 100}, DPR ${window.devicePixelRatio}`;
      readout.backend = backend;
    };

    function goHome() {
      rig = null;
      applyPose({ position: HOME.position, target: HOME.target, fov: HOME.fov });
      writePose(pose());
      refreshReadout();
    }
    const applyPose = (p: Pose) => {
      camera.position.set(...p.position);
      camera.fov = p.fov;
      camera.updateProjectionMatrix();
      if (controls) {
        controls.target.set(...p.target);
        controls.update();
      }
    };

    function setupGui() {
      gui = new GUI({ container });
      gui.domElement.style.position = "absolute";
      gui.domElement.style.top = "0";
      gui.domElement.style.right = "0";
      // the panel SCROLLS inside the window: with every folder open it is taller than the window, and Home and Copy at
      // its foot were cut off (seen 11 November 2026 at 1909 × 934; the example's panel never grew a Camera folder)
      gui.domElement.style.maxHeight = "100%";
      gui.domElement.style.overflowY = "auto";

      // material (type) — the example's buttons
      let f = gui.addFolder("Materials");
      // ours: what the metals reflect — the courtyard with the emblem (Carl's env map) or the example's castle
      f.add(settings, "environment", [...HERO_ENVIRONMENTS]).onChange((v: HeroEnvironment) => hero.setEnvironment(v));
      const buttons: Record<string, () => void> = {};
      for (const m in hero.materials) {
        buttons[m] = () => hero.setMaterial(m);
        f.add(buttons, m).name(m);
      }

      // simulation — the example's
      f = gui.addFolder("Simulation");
      f.add(settings, "blobs"); // ours: the liquid on/off (off while the logo's position is worked out)
      f.add(settings, "speed", 0.1, 8.0, 0.05);
      f.add(settings, "numBlobs", 1, 50, 1);
      f.add(settings, "resolution", 14, 100, 1);
      f.add(settings, "isolation", 10, 300, 1);
      f.add(settings, "floor");
      f.add(settings, "wallx");
      f.add(settings, "wallz");

      // the grid floor (above)
      f = gui.addFolder("Floor");
      f.add(floor, "grid").onChange((on: boolean) => {
        if (grid) grid.visible = on;
      });
      f.add(floor, "spacing", 25, 500, 25).name("spacing (units)").onFinishChange(buildGrid);

      // ⛔ THE FLOOR's HEAT (`hero-floor.ts`; 18 November 2026; structural note v1.5): chunk 1, the leaning logo's rough
      // circle and webs from its contact edge; a radial mask opens it inside out over 2.5 s from the logo's fade-in and
      // closes it outside in over 2.5 s from the leap (Carl). Values are takes
      const fh = hero.floor;
      f = gui.addFolder("Heat floor");
      f.add(fh, "on").name("floor heat");
      f.add(fh, "strength", 0, 1, 0.01).name("strength (as seen)");
      f.add(fh, "radiusCm", 5, 500, 1).name("radius (cm)");
      f.add(fh, "falloff", 0.3, 5, 0.05).name("fall-off");
      f.add(fh, "roughness", 0, 0.6, 0.01).name("rim roughness");
      f.add(fh, "lobes", 0.2, 6, 0.05).name("rim bumps");
      f.addColor(fh, "colour").name("colour");
      f.add(fh, "maskEdge", 0, 0.6, 0.01).name("mask edge (soft)");
      f.add(fh, "liquidStrength", 0, 2, 0.01).name("liquid: heat at touchdown");
      f.add(fh, "liquidReach", 1, 4, 0.05).name("liquid: reach beyond the disc (×)");
      f.add(fh, "chargedStrength", 0, 2, 0.01).name("liquid: supercharged heat");
      f.add(fh, "chargeS", 0.05, 3, 0.05).name("liquid: supercharge rise (s)");
      f.add(fh, "chargedRadiusCm", 50, 800, 5).name("liquid: supercharged radius (cm)");
      f.addColor(fh, "liquidColour").name("liquid: colour");
      f.addColor(fh, "coldColour").name("rain: cold colour");
      f.add(fh, "rainCoolIn", 0.1, 20, 0.1).name("rain: cooling inside (/s)");
      f.add(fh, "rainCoolOut", 0, 5, 0.05).name("rain: cooling outside (/s)");
      f.add(fh, "rainEdgeCm", 5, 300, 5).name("rain: outside fall-off (cm)");
      f.add(fh, "cellCm", 2, 60, 0.5).name("cell size (cm)");
      f.add(fh, "contrast", 0.5, 4, 0.05).name("web contrast");
      f.add(fh, "webGain", 0.2, 6, 0.05).name("web brightness");
      f.add(fh, "zoomS", 0.5, 15, 0.1).name("outward drift (s)");

      // the home page's hero text over the view (Carl, 10 November 2026: spacing)
      f = gui.addFolder("Home page");
      // ⛔ OFF by default (11 November 2026): the text is BAKED into the world (`hero-scene.ts`); the page's text stays on
      // the screen as the camera flies, so it is now a CHECK at Home (on: it should sit on the 3D text), not the text
      const page = { text: false };
      f.add(page, "text").onChange((on: boolean) => {
        if (homeText.current) homeText.current.style.display = on ? "" : "none";
      });

      // ⛔ THE OPENING (`hero-scene.ts`, `OPENING`; 16 November 2026): the text, then the leaning logo fades in; plays on
      // load, and again from the dark here
      f = gui.addFolder("Opening");
      f.add({ again: () => hero.openingAgain() }, "again").name("Opening again");

      // the logo's arrival (`hero-scene.ts`, `arrivalPlan`; 13 November 2026): played once on load; replayed from the lean here
      f = gui.addFolder("Logo");
      f.add({ jump: () => hero.replayArrival() }, "jump").name("Arrival again");
      f.add(mouldGuide, "outline")
        .name("mould outline")
        .onChange((on: boolean) => {
          if (mouldLine) mouldLine.visible = on;
        });

      // ⛔ PHASE 2, THE RAIN (`hero-rain.ts`; 14 November 2026; Carl: *"build it on the bench and put the controls in the panel.
      // That way i can give tou some ballpark figures on how heavy the rain should be"*). It starts on its own as phase 1's
      // wobble ends; "Rain again" plays the shape from now; "hold" keeps the downpour on to judge the weight
      const rs = hero.rain;
      f = gui.addFolder("Rain");
      f.add(rs, "on");
      f.add(rs, "hold").name("hold (at peak)");
      f.add({ again: () => hero.rainAgain() }, "again").name("Rain again");
      f.add(rs, "peak", 200, RAIN_MAX_DROPS, 100).name("peak drops");
      f.add(rs, "light", 0, 1, 0.01).name("light share");
      f.add(rs, "seconds", 4, 8, 0.1).name("length (s)");
      f.add(rs, "radiusCm", 20, 400, 5).name("area radius (cm)");
      f.add(rs, "heightCm", 150, 800, 10).name("start height (cm)");
      f.add(rs, "speedCmS", 100, 1500, 10).name("fall speed (cm/s)");
      f.add(rs, "lengthCm", 1, 60, 0.5).name("streak length (cm)");
      f.add(rs, "widthMm", 0.5, 10, 0.1).name("streak width (mm)");
      f.add(rs, "opacity", 0, 1, 0.01);
      f.add(rs, "brightness", 0, 20, 0.1);
      f.add(rs, "splashes");
      f.add(rs, "splashCm", 0.5, 15, 0.1).name("splash size (cm)");
      // the wash: the run-off keeps running after the rain (from the first drops landing to the logo all platinum blue)
      f.add(rs, "washSeconds", 3, 15, 0.1).name("wash length (s)");

      // ⛔ PHASE 3's START, THE CODE DROPS (`hero-code-drops.ts`; 20 November 2026; Carl: *"In each run, every drop that is
      // destined to fall on the logo should be code"*): the rain's last band, every drop landing on the logo. Live, no rebuild.
      // "Rain again" plays them again (they are the rain's)
      const cd = hero.code;
      f = gui.addFolder("Code drops");
      f.add(cd, "on");
      f.add({ again: () => hero.rainAgain() }, "again").name("Rain again");
      f.add(cd, "band", 0.25, 4, 0.05).name("band (falls)");
      f.add(cd, "speed", 0.05, 1, 0.01).name("code speed (× rain)");
      f.add(cd, "glyphCm", 1, 30, 0.5).name("character (cm)");
      f.add(cd, "trailMin", 0, 16, 1).name("trail min (cells)");
      f.add(cd, "trailMax", 0, 16, 1).name("trail max (cells)");
      f.add(cd, "turnMinCm", 0, 300, 5).name("turn min (cm above)");
      f.add(cd, "turnMaxCm", 0, 300, 5).name("turn max (cm above)");
      f.add(cd, "brightness", 0, 6, 0.05);
      f.add(cd, "glow", 0, 2, 0.01).name("halo");
      f.add(cd, "flare", 0, 4, 0.05).name("flare burst");
      f.add(cd, "flareOdds", 0, 1, 0.01).name("flare share");
      f.add(cd, "cOdds", 0, 1, 0.01).name("c 2 b share");
      f.add(cd, "flickMinMs", 20, 600, 10).name("flicker min (ms)");
      f.add(cd, "flickMaxMs", 20, 600, 10).name("flicker max (ms)");

      // ⛔ PHASE 3, THE CLOTH, step 1 (`hero-cloth.ts`; 20 November 2026; Carl: *"build it on the page exactly as it is"*):
      // three's `webgpu_compute_cloth` behind the logo; its own GUI's controls (stiffness, wireframe, wind, material; the sphere deleted, Carl),
      // "Cloth again" from flat
      const cl = hero.cloth.settings;
      f = gui.addFolder("Cloth");
      f.add(cl, "on");
      f.add({ again: () => hero.cloth.again() }, "again").name("Cloth again");
      f.add(cl, "stiffness", 0.1, 0.5, 0.01);
      f.add(cl, "wireframe");
      f.add(cl, "wind", 0, 5, 0.1);
      // ⛔ 1 = the gusts scaled to the cloth (the example's look; Carl, 20 November); ~0.27 = the example's world size
      f.add(cl, "gustSize", 0.1, 3, 0.01).name("gust size (× cloth)");
      // ⛔ THE COLLISION with the logo (`hero-cloth.ts`; 20 November 2026, session 2; note
      // `structural-note-cloth-collision-20-november.md`): on/off, the margin (cm), the friction (0 slides, 1 sticks)
      f.add(cl, "collide").name("collide with logo");
      f.add(cl, "marginCm", 0.5, 5, 0.1).name("collision margin (cm)");
      f.add(cl, "friction", 0, 1, 0.01).name("friction");
      const mf = f.addFolder("material");
      mf.addColor(cl, "color");
      mf.add(cl, "roughness", 0, 1, 0.01);
      mf.add(cl, "sheen", 0, 1, 0.01);
      mf.add(cl, "sheenRoughness", 0, 1, 0.01);
      mf.addColor(cl, "sheenColor");

      // ⛔ PHASE 3, PASS 1, FORWARD (`hero-scene.ts`, `pass1`; 20 November 2026, session 2; Carl: *"have the logo jump up and
      // down with the figures youve suggeated"*): the first jump, straight up and down, on "Jump" once phase 1's wobble is
      // done. The height's rows put to Carl: 32.7 (touching), 47.7, 60 (phase 1's hop), 72.7 cm; take 3: 95 (half the front face, the default). The cloth answers
      // the jump (behind → in front, crossing at the apex) when it is at its place; "Reset pass 1" restores the cloth as it was at pass 1's first take-off
      f = gui.addFolder("Pass 1");
      f.add({ jump: () => hero.jump() }, "jump").name("Jump");
      f.add(hero.pass1, "apexCm", 20, 120, 0.1).name("jump height (cm)");
      // ⛔ take 3: UP AND BACK into the cloth (apex this far behind its spot; it lands twice as far back)
      f.add(hero.pass1, "backCm", 0, 80, 1).name("jump back (cm, at apex)");
      // ⛔ the BACKWARD action, by itself after the forward landing's wobble (the beat): the cloth retreats to here (cm from
      // the spot); the logo jumps home into it this long after the cloth set off
      f.add(hero.pass1, "clothBackToCm", -250, 60, 1).name("cloth back to (cm)");
      f.add(hero.pass1, "backJumpDelayS", 0, 4, 0.01).name("back jump after cloth (s)");
      // the cloth answers the jump (from behind to in front, `CLOTH_PATH_CM`); a bench reset brings both back
      // ⛔ RESET = THE BEGINNING OF PASS 1 (Carl: accurate measurement): the logo home, the cloth restored EXACTLY to its state
      // at pass 1's first take-off (the button's name "Reset": *"change the buttons back to reset, not back to the beginning"*)
      f.add({ back: () => hero.resetPass1() }, "back").name("Reset pass 1");

      // ⛔ PASS 2, STAGED (`hero-scene.ts`, `stage`; 20 November 2026, session 2; Carl: *"an easier way to do this is if i show
      // you in stages"*): a still pose — roll (− = right, as the front camera sees it), then turn about the vertical
      // ⛔ PASS 2, FORWARD — THE JUMP SWIVEL (`hero-scene.ts`, `pass2`): "Jump" once pass 1 is done
      f = gui.addFolder("Pass 2");
      f.add({ jump: () => hero.jump() }, "jump").name("Jump");
      f.add(hero.pass2, "apexCm", 0, 150, 1).name("apex (cm above)");
      f.add(hero.pass2, "landBackCm", -100, 150, 1).name("land back (cm)");
      f.add(hero.pass2, "clothForwardCm", 0, 250, 1).name("cloth forward (cm)");
      // ⛔ the REVERSE MOVE (by itself after the swivel's wobble): the cloth back to here (cm from the spot); the logo's jump
      f.add(hero.pass2, "clothBackToCm", -250, 60, 1).name("reverse: cloth back to (cm)");
      f.add(hero.pass2, "backJumpDelayS", 0, 4, 0.01).name("reverse: jump after cloth (s)");
      // ⛔ THE GYMNAST: no wobble between, the reverse move `reboundS` after the swivel lands, the cloth setting off with it
      f.add(hero.pass2, "gymnast").name("gymnast (one movement)");
      f.add(hero.pass2, "reboundS", 0, 1, 0.01).name("gymnast: gather (s)");
      f.add(hero.pass2, "gatherDeg", 0, 10, 0.1).name("gymnast: gather tip (deg)");
      // ⛔ PASS 2's SPEED (Carl: *"slow the logos pass 2 movement down by 50%"*): 0.5 = twice as long, the same path
      f.add(hero.pass2, "speed", 0.1, 1, 0.01).name("pass 2 speed (× real)");
      f.add(hero.pass2, "rollDeg", -180, 180, 1).name("roll (deg, − = right)");
      f.add(hero.pass2, "yawDeg", -180, 180, 1).name("turn (deg)");
      f.add({ back: () => hero.resetPass1() }, "back").name("Reset (pass 1)");

      f = gui.addFolder("Stage (pass 2)");
      f.add(hero.stage, "on").name("stage the logo");
      f.add(hero.stage, "rollDeg", -180, 180, 1).name("roll (deg, − = right)");
      f.add(hero.stage, "yawDeg", -180, 180, 1).name("turn (deg)");

      // ⛔ PHASE 2, THE TEMPERATURE (`hero-heat.ts`; 16 November 2026, session 3): the logo cools as an object during the
      // wash — off = the run-off front drives the colour directly, as before (an A/B). The rates act on the heat left
      const hs = hero.heat;
      f = gui.addFolder("Heat");
      f.add(hs, "on").name("temperature drives colour");
      f.add(hs, "airPerS", 0, 0.5, 0.005).name("air cooling (/s)");
      f.add(hs, "wetPerS", 0.1, 10, 0.05).name("wet cooling (/s)");
      f.add(hs, "diffCm2S", 0, 7, 0.05).name("conduction (cm²/s)");
      f.add(hs, "redBelow", 0, 0.9, 0.01).name("red until (cold)");
      f.add(hs, "blueAbove", 0.1, 1, 0.01).name("blue from (cold)");

      // ⛔ THE WET LOOK's DIALS (`WET`, `hero-scene.ts`; 16 November 2026, session 3; Carl: "we can tweak if needed"): the
      // clear coat where the water is, its running streaks while the wash runs, its beads after. Live, no rebuild
      const ws = hero.wet;
      f = gui.addFolder("Wet");
      f.add(ws, "coat", 0, 1, 0.01).name("coat strength");
      f.add(ws, "coatRoughness", 0, 0.5, 0.005).name("coat roughness");
      f.add(ws, "streakCm", 0.2, 6, 0.05).name("streak width (cm)");
      f.add(ws, "lengthCm", 2, 40, 0.5).name("streak length (cm)");
      f.add(ws, "runCmS", 0, 80, 0.5).name("run speed (cm/s)");
      f.add(ws, "flowTilt", 0, 1, 0.01).name("streak ripple");
      f.add(ws, "beadCm", 0.2, 5, 0.05).name("bead size (cm)");
      f.add(ws, "beadTilt", 0, 0.6, 0.01).name("bead ripple");

      // ⛔ PHASE 2, THE STEAM (`hero-steam.ts`; 16 November 2026; Carl: *"build it on the proto hero and we will take
      // measurements"*): a short burst as the first drops land; "hold" keeps it emitting to judge and measure; it plays on
      // the rain's clock, so "Steam again" plays the rain again; the cell size is the cost's main dial
      const ss = hero.steam;
      f = gui.addFolder("Steam");
      f.add(ss, "on");
      f.add(ss, "hold").name("hold (emitting)");
      // ⛔ 16 November 2026, session 3: each puff × the heat left under it (the logo's temperature); off = one number for all
      f.add(ss, "localHeat").name("local heat");
      f.add({ again: () => hero.rainAgain() }, "again").name("Steam again (rain again)");
      f.add(ss, "burstS", 0.3, 4, 0.05).name("burst (s)");
      f.add(ss, "lifeS", 0.2, 5, 0.05).name("life (s)");
      f.add(ss, "coolS", 0.1, 4, 0.05).name("heat life (s)");
      f.add(ss, "amount", 0, 40, 0.5);
      f.add(ss, "heat", 0, 20, 0.1);
      f.add(ss, "rise", 0, 1500, 10).name("rise (cm/s²)");
      f.add(ss, "weight", 0, 200, 1);
      f.add(ss, "turbulence", 0, 1500, 10);
      f.add(ss, "cellCm", [1.5, 2, 2.5, 3, 4, 5]).name("cell (cm)");
      f.add(ss, "steps", 8, 128, 1).name("ray steps");
      f.add(ss, "thickness", 0.002, 0.2, 0.001);
      f.add(ss, "brightness", 0, 3, 0.01);

      // ⛔ THE CAMERA — the readout, Copy and Home (note v1.3, "HOME")
      f = gui.addFolder("Camera");
      for (const k of Object.keys(readout) as (keyof typeof readout)[]) f.add(readout, k).disable().listen();
      const actions = {
        home: goHome,
        copy: () => {
          refreshReadout();
          const { w, h } = size();
          const text = `HOME ${JSON.stringify({ ...pose(), window: { w, h }, zoom, dpr: window.devicePixelRatio, backend })}`;
          navigator.clipboard.writeText(text).then(
            () => copyCtl.name("Copied"),
            () => copyCtl.name("Copy failed"),
          );
          window.setTimeout(() => copyCtl.name("Copy"), 2000);
        },
      };
      f.add(actions, "home").name("Home");
      const copyCtl = f.add(actions, "copy").name("Copy");
    }

    function onWindowResize() {
      const { w, h } = size();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer?.setSize(w, h);
      refreshReadout();
    }

    // ⛔ FLYING (11 November 2026, session 1; Carl: *"put in camera motion and i will fly in and look from the side"*; earlier
    // *"The WASD doesnt work or the pad"*). The camera bench's OWN controller, imported (`camera-pad.ts`, read, not changed):
    // the same pad mapping and feel Carl co-designed — the LEFT STICK forward / back, the RIGHT STICK's x a truck, B + the
    // right stick the look, the TRIGGERS up / down, the D-PAD a movement pad at 2×, the BUMPERS the lens, VIEW = Home; the
    // keys W S A D, E Q (up / down), the arrows (look), [ ] (lens), Shift ×3, Alt ×0.25. At WALKING PACE in metres: the
    // scene's centimetre is the baked text's (`unitsPerCm`). The lens stops 10 cm above the floor. The orbit's mouse still
    // works: a fly input takes the camera from wherever the mouse left it; after a flight the orbit's target is set ahead of
    // the lens, so a drag turns about what it faces. Not the recorder (step 4).
    const keys = new Set<string>();
    const typing = (e: KeyboardEvent) => e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
    const down = (e: KeyboardEvent) => {
      if (typing(e)) return;
      keys.add(e.code);
      if (e.code.startsWith("Arrow") || e.code === "AltLeft") e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keys.delete(e.code);
    const blur = () => keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    const edges = new Edges();
    let rig: Rig | null = null;
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    function fly(dt: number) {
      const pad = readPad();
      const hit = edges.pressed(pad.buttons);
      if (pad.connected && hit(BTN.VIEW)) goHome();
      const key = (c: string) => (keys.has(c) ? 1 : 0);
      const btn = (i: number) => (pad.buttons[i] ? 1 : 0);
      const speed = (keys.has("ShiftLeft") || keys.has("ShiftRight") ? FEEL.fast : 1) * (keys.has("AltLeft") ? FEEL.slow : 1);
      const look = !!pad.buttons[BTN.B];
      const lookX = look && Math.abs(pad.rx) >= Math.abs(pad.ry) ? pad.rx : 0;
      const lookY = look && Math.abs(pad.ry) > Math.abs(pad.rx) ? pad.ry : 0;
      const dpad = (v: number) => Math.max(-FEEL.dpad, Math.min(FEEL.dpad, v));
      const intent: Intent = {
        forward: dpad(clamp(pad.ly + key("KeyW") - key("KeyS")) + FEEL.dpad * (btn(BTN.UP) - btn(BTN.DOWN))),
        right: dpad(clamp((look ? 0 : pad.rx) + key("KeyD") - key("KeyA")) + FEEL.dpad * (btn(BTN.RIGHT) - btn(BTN.LEFT))),
        up: clamp(pad.rt - pad.lt + key("KeyE") - key("KeyQ")),
        turn: clamp(lookX + key("ArrowRight") - key("ArrowLeft")),
        tilt: clamp(lookY + key("ArrowUp") - key("ArrowDown")),
        lens: clamp(btn(BTN.RB) - btn(BTN.LB) + key("BracketRight") - key("BracketLeft")),
        speed,
      };
      const active = intent.forward !== 0 || intent.right !== 0 || intent.up !== 0 || intent.turn !== 0 || intent.tilt !== 0 || intent.lens !== 0;
      if (!active && !rig) return;
      if (!rig) {
        const e = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
        rig = rigAt(camera.position.x, camera.position.y, camera.position.z, THREE.MathUtils.radToDeg(e.y), THREE.MathUtils.radToDeg(e.x), camera.fov);
      }
      const cm = hero.unitsPerCm ?? 1 / 0.2207;
      stepRig(rig, intent, dt, 100 * cm, FLOOR_Y + 10 * cm);
      camera.position.set(rig.x, rig.y, rig.z);
      camera.rotation.set(THREE.MathUtils.degToRad(rig.pitch), THREE.MathUtils.degToRad(rig.yaw), 0, "YXZ");
      if (camera.fov !== rig.fov) {
        camera.fov = rig.fov;
        camera.updateProjectionMatrix();
      }
      if (controls) {
        const d = Math.max(controls.minDistance, Math.min(controls.maxDistance, camera.position.distanceTo(controls.target)));
        controls.target.copy(camera.position).add(new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).multiplyScalar(d));
      }
      refreshReadout();
      const still = !active && Math.abs(rig.vx) + Math.abs(rig.vy) + Math.abs(rig.vz) + Math.abs(rig.vyaw) + Math.abs(rig.vpitch) + Math.abs(rig.vfov) < 1e-3;
      if (still) {
        rig = null;
        writePose(pose());
      }
    }

    function animate() {
      timer.update();
      const dt = Math.min(timer.getDelta(), 0.1);
      fly(dt);
      hero.update(dt);
      // ⛔ PHASE 2, THE RAIN: the scene's GPU step before the draw (D-101, 14 November 2026 — the one new call)
      hero.compute(renderer!);
      buildMouldLine();
      renderer!.render(scene, camera);
      stats!.update();
    }

    const start = async () => {
      // ⛔ ANTIALIASED (11 November 2026, session 1; Carl: *"i can see some aliasing on the edge of the text"*): the example
      // creates its renderer without it; MSAA (4 samples) on. ⚠ A cost per frame on every device (D-108: priced, below the
      // site's own record)
      const r = new WebGPURenderer({ antialias: true });
      // a lost device STOPS the loop at once: a hang must not repeat within the run
      r.onDeviceLost = (info: { message?: string }) => {
        r.setAnimationLoop(null);
        container.dataset.heroError = `device lost: ${info?.message ?? ""}`.slice(0, 300);
      };
      await r.init();
      if (!live) {
        r.dispose();
        return;
      }
      renderer = r;
      backend = (r.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend ? "webgpu" : "webgl2 (fallback)";
      container.dataset.heroBackend = backend;
      // the root zoom above 1412 px (D-097): sized from the container in layout px, drawn at DPR × zoom
      renderer.setPixelRatio(window.devicePixelRatio * zoom);
      renderer.setSize(w, h);
      container.appendChild(renderer.domElement);

      // CONTROLS — the example's limits; the target from the remembered camera, else HOME
      controls = new OrbitControls(camera, renderer.domElement);
      controls.minDistance = 500;
      controls.maxDistance = 5000;
      applyPose(readPose() ?? { position: HOME.position, target: HOME.target, fov: HOME.fov });
      controls.addEventListener("change", refreshReadout);
      controls.addEventListener("start", () => {
        rig = null; // the mouse takes the camera; the next fly input starts from where it leaves it
      });
      controls.addEventListener("end", () => writePose(pose()));

      // STATS
      stats = new Stats();
      stats.dom.style.position = "absolute";
      container.appendChild(stats.dom);

      setupGui();
      refreshReadout();
      window.addEventListener("resize", onWindowResize);

      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __heroBench?: unknown }).__heroBench = { backend, hero, settings, renderer: r, scene, camera, controls, pose };
      }
      await hero.ready;
      if (!live) return;
      renderer.setAnimationLoop(animate);
    };
    start().catch((e: unknown) => {
      container.dataset.heroError = String(e);
      console.error("[hero bench] the renderer did not start", e);
    });

    return () => {
      live = false;
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      renderer?.setAnimationLoop(null);
      controls?.dispose();
      gui?.destroy();
      stats?.dom.remove();
      timer.dispose();
      grid?.geometry.dispose();
      (grid?.material as THREE.Material | undefined)?.dispose();
      mouldLine?.geometry.dispose();
      (mouldLine?.material as THREE.Material | undefined)?.dispose();
      hero.dispose();
      renderer?.domElement.remove();
      renderer?.dispose();
    };
  }, []);
  return (
    <>
      <div ref={box} data-hero-bench="" className="fixed inset-0 overflow-hidden bg-[#050505]" />
      {/* ⛔ THE HOME PAGE's HERO TEXT, OVER THE VIEW — a GUIDE (Carl: *"The text will be the size it is now"*), the home
          page's own markup and classes (`app/page.tsx`'s hero section). ⚠ The THIRD copy (with `marching-bench.tsx`): if
          the home page's text changes, this does not follow. Replaced by the three.js text in step 3. Clicks pass through */}
      <div ref={homeText} className="pointer-events-none fixed inset-0 text-white" style={{ display: "none" }}>
        <div className="h-[81px]" />
        <section className="min-h-[calc(100*var(--vh)-81px)] flex items-center [&>div]:w-full">
          <Container>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-2xl">
              Websites built <br />
              to be seen.
            </h1>
            <p className="mt-8 text-base text-neutral-400 max-w-lg leading-relaxed">
              We show you what your website could be, <br className="hidden sm:block" />
              then we build you a site for sore eyes.
            </p>
          </Container>
        </section>
      </div>
    </>
  );
}
