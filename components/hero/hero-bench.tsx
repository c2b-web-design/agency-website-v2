"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { WebGPURenderer } from "three/webgpu";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Container from "@/components/layout/container";
import { BTN, Edges, FEEL, readPad, rigAt, stepRig, type Intent, type Rig } from "@/components/showcase/camera-pad";
import { createHeroScene, FLOOR_Y, FLOW_OPENING, FLOW_TIMES, HERO_ENVIRONMENTS, HOME, type HeroEnvironment } from "./hero-scene";
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

/**
 * ⛔ THE FLOWING OPENING's 2D (26 November 2026; `hero-scene.ts`, `FLOW_OPENING`, its header, for Carl's words and the four
 * actions). The headline and subtext as HTML, the HOME PAGE's own markup (`app/page.tsx`'s hero: the guide below), in the
 * lit 3D face's colour (`FLOW_INK`, sampled from the scene's render at full light), OVER the canvas. An INLINE SCRIPT starts
 * them as the HTML is parsed — before any of the bench's script has loaded — so they are in the FIRST PAINT: (1) the
 * headline fades in over `headFadeS`; (3) the subtext's letters each fade in (`letterGrowS`; was 0.12 s) as the old reveal's eased front passes
 * them (`FLOW_TIMES.sub`, `subLineS`: one source with the scene). The scene's clock is handed the headline's animation time
 * at its first frame (`startOpeningAt`), so the 3D's growth and its subtext letters are timed against what the visitor has seen;
 * the HTML headline dissolves as the 3D headline starts growing back from under it, each HTML line once its 3D letters are
 * all in (each revealed ALREADY EXTRUDED, fading in with its 2D letter: 28 November 2026; `FLOW_OPENING` in the scene)
 * (`openingInfo.subDone`). Elements rendered by React, hidden, styled only by the script (`suppressHydrationWarning`: take 1
 * of the still showed hydration REMOVES nodes a script adds, `live-work/scripts/hero-opening-handover-probe-26-november.mjs`).
 * ⚠ The 2D registers with the 3D face only where the 3D text's layout was measured (Carl's window, 1896 x 946, at HOME —
 * the bench's camera starts there for this): the site needs the 3D laid out from the HTML (a structural note, not built).
 * ⚰️ B + C's opening still (`public/hero-bench/opening-poster.webp`) replaced the same day. `?open=a`: the old opening.
 */
const FLOW_INK = "#bed3ea";
/**
 * ⛔ THE 2D PUT ON THE 3D FACE (MEASURED, `live-work/scripts/hero-flow-registration-26-november.mjs`, at the REFERENCE window
 * 1896 x 946, HOME; the lit pixels of each line, 2D against 3D). Kerning OFF (above) made each block's misfit one
 * letter-spacing and one shift: the 3D's advances are 0.007 em tighter in BOTH blocks (headline lines 543/551 and 402/407
 * px; subtext 410/415 and 369/372); the headline's leading 1.088 (its second line 1 px low at 1.1). Every line then within
 * 1–2 px of its face; the colour exact.
 * ⛔ AT EVERY WINDOW (Carl, on his own window: *"alignment for text and subtext is way out."*): the camera's FOV is VERTICAL,
 * so the 3D's picture scales with the CANVAS's HEIGHT about its CENTRE, and does not reflow; the home page's markup did
 * (take 1: registered only at the reference window). Now the 2D is laid out ONCE, as measured at the reference (`FLOW_REF`:
 * the element boxes there, the shifts included, in CSS px at its root zoom 1.343; `scripts/hero-flow-ref-boxes-26-
 * november.mjs`), on a STAGE the reference canvas's size, centred on the canvas and scaled by the canvas's height
 * (`--flow-s`, set by the script and on resize). Fixed sizes, no breakpoints, explicit line breaks: nothing reflows.
 * ⚠ HOME only (the bench's camera starts there for this). The SITE still needs its own route (a structural note).
 */
const FLOW_TRACK_EM = -0.007;
/** the reference's root zoom: the 2D is laid out AT IT at every window (`hero-flow-zoomed`), so its lines round to the same
 *  pixels as where it was registered — laid out at each window's own zoom (1.0–1.34), the subtext sat 2–4 px high */
const FLOW_REF_ZOOM = 1.343;
const FLOW_REF = (() => {
  const z = FLOW_REF_ZOOM;
  // (+7.25 px in x: the reference's 2D was measured on a 1896-wide layer while its canvas had kept the site's scrollbar
  // gutter, 1881.5 wide — the two centres 7.25 px apart; MEASURED, `scripts/hero-flow-projection-probe-26-november.mjs`:
  // the camera's projection lands on the lit pixels, gutter or none. The stage is centred on the canvas, so the 2D's
  // reference x is taken against the canvas's centre)
  const dx = 7.25;
  return { w: 1896 / z, h: 946 / z, head: [(120.45 + dx) / z, 387.33 / z], sub: [(116.45 + dx) / z, 602.61 / z] } as const;
})();
/**
 * ⛔ EACH LINE NUDGED ONTO ITS FACE (Carl: *"the text moves slightly left"* — at the hand-over the 3D sat 1–3 px left of the
 * 2D). MEASURED per line, the 3D against the 2D, by correlating the strokes' LEFT and TOP edges (the 3D's sides grow right
 * and down, so they cannot bias them) at 1896 x 946, 1600 x 860 and 1280 x 720 (gutter kept), averaged and taken to the
 * reference's px (÷ the stage's scale): [x, y] in the reference's visual px, the stage scales them with the canvas
 */
const FLOW_LINE_NUDGE = { head1: [-1.1, 0.8], head2: [-2.3, 0.8], sub1: [-1.5, 1.6], sub2: [-0.8, 1.2] } as const;
const nudge = (n: readonly [number, number]) => `translate(${n[0] / FLOW_REF_ZOOM}px, ${n[1] / FLOW_REF_ZOOM}px)`;
/**
 * ⛔ THE HEADLINE's WEIGHT MATCHED TO THE 3D's INK (Carl: *"when the light comes into play it should grow in intensityy,
 * theres a sudden change"*). FILMED live (`Videos\C2B Films\03 The hero\2026-11-26_flow-opening_take1-long`): at the hand-over
 * the headline's brightness dropped ~11% in a frame. MEASURED: the same colour, the same place, but the 3D's glyphs THINNER —
 * 22,158 solid px against the browser's Geist Bold's 24,524 (the browser draws the weight heavier than the typeface's own
 * outline). Geist is variable: by `scripts/hero-flow-weight-26-november.mjs`, 620 → 22,035, 640 → 22,511: 625
 */
const FLOW_HEAD_WEIGHT = 625;
// (at 625 the letters are narrower: the lines 532/543 and 394/402 px against the 3D's, ~0.8 px a gap — +0.0102 em of tracking
// gives the width back; the left edges already matched)
const FLOW_HEAD_TRACK_EM = -0.025 + FLOW_TRACK_EM + 0.0102;
const FLOW_FADE_OUT_MS = 250;
const FLOW_KEYFRAMES = "@keyframes heroFlowIn{from{opacity:0}to{opacity:1}}";
const FLOW_SUB = ["We show you what your website could be, ", "then we build you a site for sore eyes."] as const;
// the inverse of the scene's eased sine (`beat`): u = acos(1 − 2y) / π — a letter at share f of its line's ink is reached at u
// ⛔ EACH LETTER FADES OVER `letterGrowS` (0.5 s), the time its 3D letter (already extruded, since the same day) takes to fade in with it (28 November 2026; Carl:
// *"There appears to be a slight stall after the W on the word "We""*). ⚰️ Was 0.12 s: where the eased front moves slowly
// (each line's start and end) a letter finished before the next began, and the screen stood still — MEASURED
// (`live-work/scripts/hero-flow-letter-gaps-28-november.mjs`): W→e 277 ms, t→h 148 ms, two of 54 ms. From 0.4 s none
const FLOW_SCRIPT = `(function(){var o=new URLSearchParams(location.search).get("open")||"";if(o==="a")return;var L=document.getElementById("hero-flow-2d");if(!L)return;L.style.display="block";var z=parseFloat(getComputedStyle(document.documentElement).zoom)||1;var S=document.getElementById("hero-flow-stage");S.style.width=(1896/z)+"px";S.style.height=(946/z)+"px";S.style.setProperty("--flow-s",String(L.getBoundingClientRect().height/946));document.getElementById("hero-flow-zoomed").style.zoom=String(${FLOW_REF_ZOOM}/z);var h=document.getElementById("hero-flow-head");h.style.animation="heroFlowIn ${FLOW_OPENING.headFadeS}s cubic-bezier(0.37,0,0.63,1) 0s both";var st=[${FLOW_TIMES.sub[0]},${FLOW_TIMES.sub[1]}];[1,2].forEach(function(n,k){var sp=document.getElementById("hero-flow-sub"+n).querySelectorAll("span");var a=sp[0].getBoundingClientRect().left,b=sp[sp.length-1].getBoundingClientRect().right;for(var i=0;i<sp.length;i++){var f=Math.min(1,Math.max(0,(sp[i].getBoundingClientRect().left-a)/(b-a)));var u=Math.acos(1-2*f)/Math.PI;sp[i].style.animation="heroFlowIn ${FLOW_OPENING.letterGrowS}s linear "+(st[k]+${FLOW_OPENING.subLineS}*u).toFixed(3)+"s both";}});})();`;

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
    // ⛔ THE OPENING (`FLOW_INK`'s header): the flowing opening, or the old A by `?open=a`
    const optA = new URLSearchParams(window.location.search).get("open") === "a";
    const flowing = !optA;
    const hero = createHeroScene(w / h, { opening: optA ? "a" : "flow" });
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
      // ⛔ THE FLOOR (`hero-cloth.ts`, `setFloor`; 22 November 2026): 0 slides freely, 1 sticks where it lies
      f.add(cl, "floorFriction", 0, 1, 0.01).name("floor friction");

      // ⛔ THE CLOTH's ARRIVAL (`hero-scene.ts`, `clothArrival`): it lies flat on the floor, asleep, `back` behind the spot; `delay`
      // after the last code drop it is HUNG over the logo and fades in (phase 3's circle). ⚰️ The rise and the departure folder
      // went with the passes (26 November 2026)
      f = gui.addFolder("Cloth arrival");
      f.add(hero.clothArrival, "auto").name("hang after the code drops");
      f.add(hero.clothArrival, "backCm", 160, 500, 5).name("lies back (cm from the spot)");
      f.add(hero.clothArrival, "delayS", 0, 6, 0.1).name("delay after the last code drop (s)");
      f.add({ go: () => hero.clothRiseNow() }, "go").name("Hang now");
      f.add({ lay: () => hero.clothLayAgain() }, "lay").name("Lay it on the floor again");

      // ⛔ PHASE 4, THE MARBLE, step 1 (`hero-scene.ts`, `hero-marble.ts`; 23 November 2026; Carl: *"Copy the code exactly. We
      // can turn off the rotations and other things, then we will tweak it"*): `webgpu_lights_spotlight`'s own GUI, in its
      // units, + rotate, the scale and the hemisphere. Takes
      {
        const mb = hero.marble.settings;
        f = gui.addFolder("Marble (spotlight example)");
        f.add(mb, "on");
        f.add(mb, "map", ["ours", "gpt", "disturb.jpg", "none"]).name("map (ours, gpt: the floor's)");
        f.addColor(mb, "color");
        f.add(mb, "intensity", 0, 500);
        f.add(mb, "distance", 0, 20);
        f.add(mb, "angle", 0, Math.PI / 3);
        f.add(mb, "penumbra", 0, 1);
        f.add(mb, "decay", 1, 2);
        f.add(mb, "focus", 0, 1);
        f.add(mb, "shadowIntensity", 0, 1);
        f.add(mb, "helpers");
        f.add(mb, "rotate").name("rotate (the light circles)");
        f.add(mb, "metresPerUnit", 0.25, 3, 0.05).name("metres per example unit");
        f.add(mb, "ambient", 0, 1, 0.01).name("hemisphere");
        // its entrance (Carl, 23 November 2026): radiating from the logo as the cloth leaves
        f.add(mb, "story").name("enters with the cloth's departure");
        f.add(mb, "spreadS", 0.5, 10, 0.1).name("spread from the logo (s)");
        f.add(mb, "featherCm", 0, 300, 5).name("spread's soft edge (cm)");
        // the floor's circle and the marble image's size (Carl: no square; the floor's own, static marble)
        f.add(mb, "rimCm", 100, 700, 5).name("circle radius (cm)");
        f.add(mb, "rimFadeCm", 0, 500, 5).name("circle's fading rim (cm)");
        // the slope (Carl, 23 November 2026): an oval wider than deep, the far side faded along a straight line
        f.add(mb, "widthScale", 1, 3, 0.05).name("oval: × wider than deep");
        f.add(mb, "farCm", 0, 500, 5).name("far fade starts (cm behind)");
        f.add(mb, "farFadeCm", 10, 600, 5).name("far fade length (cm)");
        f.add(mb, "tileCm", 50, 1500, 10).name("marble image size (cm)");
        // the stone (every map but the example's) and OUR marble's dials (23 November 2026; Carl: "Build it.")
        f.add(mb, "roughness", 0, 1, 0.01).name("stone roughness");
        f.add(mb, "clearcoat", 0, 1, 0.01).name("clear coat");
        f.add(mb, "clearcoatRoughness", 0, 1, 0.01).name("clear coat roughness");
        f.add(mb, "scale", 0.25, 4, 0.05).name("ours: scale");
        f.add(mb, "gold", 0, 2, 0.05).name("ours: gold veins");
        f.add(mb, "web", 0, 2, 0.05).name("ours: hairline web");
        f.add(mb, "teal", 0, 2, 0.05).name("ours: teal");
        // ⛔ THE PLINTH (25 November 2026, route B; Carl: *"the width of the plinth will be important"*): its height is the
        // text's top less the logo's (not a dial); width, depth and the round of its edges are takes; "risen" until its timing
        f.add(mb, "plinth").name("plinth");
        f.add(mb, "plinthWidthCm", 200, 500, 5).name("plinth width (cm)");
        f.add(mb, "plinthDepthCm", 10, 200, 1).name("plinth depth (cm)");
        f.add(mb, "plinthRadiusCm", 0, 15, 0.5).name("plinth edge round (cm)");
        f.add(mb, "plinthRiseS", 0.5, 10, 0.1).name("plinth rise (s)");
        f.add(mb, "plinthRise", 0, 1, 0.01).name("plinth risen (0 → 1)");
        // its own fill (Carl: "The marble plinth should always be visible, the spotlight would only highlight it")
        f.add(mb, "plinthFill", 0, 10, 0.1).name("plinth fill");
        f.add(mb, "plinthFillUpDeg", 0, 80, 1).name("plinth fill: up (°)");
        f.add(mb, "plinthFillLeftDeg", -80, 80, 1).name("plinth fill: from the left (°)");
      }

      // ⛔ PHASE 3 REDESIGNED — ONE CIRCLE THROUGH THE CLOTH (`hero-scene.ts`, `circle`; Carl, 26 November 2026): the cloth hung
      // and faded in over the logo, the upright circle backwards first, slowed through the cloth, gold behind it, the web floor
      // shrinking to touchdown, the marble from touchdown. Read at the circle's take-off: replay to see a change. APPROVED as
      // take 4 (R-119). ⚰️ The four passes' folders (Pass 1–4, Stage, Passes) deleted with their code (26 November 2026)
      f = gui.addFolder("Phase 3: the circle (approved, R-119)");
      f.add({ back: () => hero.resetPhase3() }, "back").name("Back to phase 3's start");
      f.add(hero.circle, "radiusCm", 40, 120, 1).name("radius (cm; the cloth's centre at the top)");
      f.add(hero.circle, "seconds", 1, 12, 0.1).name("the circle (s)");
      f.add(hero.circle, "slow", 0.05, 1, 0.01).name("speed through the cloth (×)");
      f.add(hero.circle, "slowAtDeg", 150, 230, 1).name("the slow's centre (deg; 180 = top)");
      f.add(hero.circle, "slowHalfDeg", 5, 80, 1).name("the slow's half width (deg)");
      f.add(hero.circle, "easeDeg", 5, 120, 1).name("ease at take-off and landing (deg)");
      f.add(hero.circle, "fadeInS", 0.1, 5, 0.1).name("cloth fade in (s)");
      f.add(hero.circle, "beatS", 0, 4, 0.1).name("beat before the circle (s)");
      f.add(hero.circle, "goldLeadCm", 0, 80, 1).name("gold starts: face behind the cloth (cm)");
      f.add(hero.circle, "goldS", 0.05, 2, 0.05).name("gold change (s)");
      f.add(hero.circle, "letGo").name("cloth lets go (takes 1–2; off = drapes)");
      f.add(hero.circle, "releaseCm", 0, 60, 1).name("lets go: past its plane (cm)");
      f.add(hero.circle, "fadeOutLeadS", -3, 3, 0.05).name("cloth fade out: before touchdown (s; − = after)");
      f.add(hero.circle, "fadeOutS", 0.1, 5, 0.1).name("cloth fade out (s)");

      // ⛔ DRIED TO GOLD (`hero-dry.ts`): since 26 November 2026 the whole logo at once (phase 3's circle), so the regions below
      // (built 22 November for the passes: 1 the top third, 2 where the c meets the 2, 3 where the b meets the 2, 4 what's left)
      // all fill together; the blotch, the border and the regions' soft, wandering edges still shape it
      f = gui.addFolder("Drying (gold)");
      const dr = hero.dry.settings;
      f.add(dr, "topThird", 0, 1, 0.01).name("pass 1: above (height share)");
      f.add(dr, "cMeets2", 0, 1, 0.01).name("pass 2: left of (width share)");
      f.add(dr, "bMeets2", 0, 1, 0.01).name("pass 3: right of (width share)");
      f.add(dr, "pass4Below", 0, 1, 0.01).name("pass 3: the 2 above (height share)");
      f.add(dr, "regionEdge", 0, 0.3, 0.005).name("region edge softness");
      f.add(dr, "regionWander", 0, 0.3, 0.005).name("region edge wander");
      f.add(dr, "wanderCm", 2, 60, 0.5).name("region wander size (cm)");
      f.add(dr, "blotch", 0, 2, 0.01).name("fills unevenly");
      f.add(dr, "blueBelow", 0, 1, 0.01).name("all blue below");
      f.add(dr, "goldAbove", 0, 1, 0.01).name("all gold above");
      f.add(dr, "ragged", 0, 1, 0.01).name("edge wander");
      f.add(dr, "raggedCm", 1, 40, 0.5).name("edge wander size (cm)");

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

    // ⛔ THE FLOWING OPENING's HAND-OVER (`FLOW_INK`'s header): the scene's clock from the HTML headline's, at its first frame;
    // then each HTML part dissolved once the 3D has taken it over
    let flowSynced = false;
    // the stage on the CANVAS's own box once it exists (`FLOW_REF`): centred on it, scaled by its height — the 3D's picture is
    // the canvas's; before it exists, the script used the layer's box (the same box, unless the page's gutter differs)
    const flowScale = () => {
      const L = document.getElementById("hero-flow-2d");
      const st = document.getElementById("hero-flow-stage");
      const c = renderer?.domElement.getBoundingClientRect();
      if (!L || !st || !c) return;
      const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
      const l = L.getBoundingClientRect();
      st.style.left = `${(c.left - l.left + c.width / 2) / z}px`;
      st.style.top = `${(c.top - l.top + c.height / 2) / z}px`;
      st.style.width = `${1896 / z}px`;
      st.style.height = `${946 / z}px`;
      st.style.setProperty("--flow-s", String(c.height / 946));
      const zz = document.getElementById("hero-flow-zoomed");
      if (zz) zz.style.zoom = String(FLOW_REF_ZOOM / z);
    };
    window.addEventListener("resize", flowScale);
    const flowOut = { head: false, sub: [false, false] };
    const dissolve = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.transition = `opacity ${FLOW_FADE_OUT_MS}ms linear`;
      el.style.opacity = "0";
    };
    function animate() {
      timer.update();
      const dt = Math.min(timer.getDelta(), 0.1);
      if (flowing && !flowSynced) {
        // the first frame: the opening's clock from the HTML headline's fade (0 = the page's first paint) — the time SINCE ITS
        // START on the document's timeline, not its `currentTime`, which stops at the fade's end (MEASURED: a scene arriving at
        // 1.6 s was handed 1.5 − dt = 1.17 s, `live-work/scripts/hero-flow-timeline-26-november.mjs`)
        const a = document.getElementById("hero-flow-head")?.getAnimations()[0];
        const now = document.timeline.currentTime;
        const t = a && typeof a.startTime === "number" && typeof now === "number" ? (now - a.startTime) / 1000 : 0;
        hero.startOpeningAt(t - dt);
        flowSynced = true;
        flowScale();
      }
      fly(dt);
      hero.update(dt);
      // ⛔ PHASE 2, THE RAIN: the scene's GPU step before the draw (D-101, 14 November 2026 — the one new call)
      hero.compute(renderer!);
      buildMouldLine();
      renderer!.render(scene, camera);
      stats!.update();
      // ⛔ THE FLOWING OPENING: the HTML headline goes as the 3D starts growing back from under it; each line once its 3D letters are all in
      if (flowing) {
        const o = hero.openingInfo;
        if (!flowOut.head && o.growAt >= 0 && o.t >= o.growAt) {
          flowOut.head = true;
          dissolve("hero-flow-headwrap");
        }
        for (const k of [0, 1] as const) {
          if (!flowOut.sub[k] && o.subDone[k]) {
            flowOut.sub[k] = true;
            dissolve(`hero-flow-sub${k + 1}`);
          }
        }
      }
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
      // ⛔ THE MARBLE (`hero-marble.ts`; 23 November 2026): the example's shadows — on, PCF soft (`webgpu_lights_spotlight`)
      r.shadowMap.enabled = true;
      r.shadowMap.type = THREE.PCFSoftShadowMap;
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
      // (the flowing opening: from HOME, where the 2D registers with the 3D — not the remembered pose)
      applyPose((flowing ? null : readPose()) ?? { position: HOME.position, target: HOME.target, fov: HOME.fov });
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
      // ⛔ THE FIRST FRAME's PROGRAMS BUILT ASYNCHRONOUSLY BEFORE IT IS DRAWN (28 November 2026; Carl: *"Proceed with Option
      // A"*; D-101). MEASURED (`live-work/scripts/hero-opening-gpu-work-16-november.mjs`, a reload): the first draw's submit
      // held the GPU ~1 s — three r185 builds a render pipeline SYNCHRONOUSLY at its first draw, and the GPU process stops
      // making frames for the whole page meanwhile (the 2D headline's fade froze, then jumped). `compileAsync` builds the
      // same pipelines off the frame (three's own path; the draw then finds them cached). The loop starts once they are
      // built: the 3D's growth may start later on a slow device (it starts at the scene's first frame, if later)
      // (the reflection maps' prefilter pipelines FIRST, the same way: `primePrefilter`, `hero-scene.ts`, which puts the
      // primer in the scene and lets the warm-up start. ⚰️ Tried 28 November 2026 on a production build, the 3D's first
      // frame ~2.3–2.5 s after the paint this way: ALONGSIDE the first frame's builds — the two slowed each other (first frame
      // ~2.0 s, the subtext's holds 233–300 ms); AFTER them — the text's builds alone took 1.0–1.5 s (0.6 s after this: the
      // first builds on a cold page carry a start-up cost, whoever pays it), so no earlier. This order measured best)
      await hero.primePrefilter(renderer);
      if (!live) return;
      // ⚠ ONE `compileAsync` PER TOP-LEVEL OBJECT, side by side: one call over the scene builds its pipelines ONE AT A TIME
      // (three r185 awaits each before the next) — MEASURED 4.7 s cold on the dev bench, the 3D's first frame at opening
      // 6.8 s. Each object is gathered against the scene (its lights, its background), so the keys match the draw's
      performance.mark("hero:FirstCompile");
      await Promise.all(scene.children.filter((o) => o.visible).map((o) => renderer!.compileAsync(o, camera, scene)));
      performance.mark("hero:FirstCompileDone");
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
      window.removeEventListener("resize", flowScale);
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
      {/* ⛔ THE FLOWING OPENING's 2D (`FLOW_INK`'s header): the home page's hero markup, hidden; shown and started by the script
          as the HTML is parsed (not for `?open=a`; hydration leaves the script's styles: `suppressHydrationWarning`) */}
      <style>{FLOW_KEYFRAMES}</style>
      {/* (no kerning: the 3D text's typeface has none — `three`'s typeface JSON carries advances only — so a kerned 2D would
          drift from its face letter by letter; measured: line 1 9 px wider in 3D, line 2 2 px narrower) */}
      <div id="hero-flow-2d" suppressHydrationWarning className="pointer-events-none fixed inset-0 overflow-hidden" style={{ display: "none", zIndex: 1, color: FLOW_INK, fontKerning: "none", fontVariantLigatures: "none" }}>
        <div id="hero-flow-stage" suppressHydrationWarning style={{ position: "absolute", left: "50%", top: "50%", width: FLOW_REF.w, height: FLOW_REF.h, transform: "translate(-50%, -50%) scale(var(--flow-s, 1))", transformOrigin: "50% 50%" }}>
          <div id="hero-flow-zoomed" suppressHydrationWarning style={{ position: "absolute", inset: 0 }}>
          <div id="hero-flow-headwrap" suppressHydrationWarning style={{ position: "absolute", left: FLOW_REF.head[0], top: FLOW_REF.head[1] }}>
            <h1 id="hero-flow-head" suppressHydrationWarning style={{ margin: 0, opacity: 0, whiteSpace: "nowrap", fontSize: 60, fontWeight: FLOW_HEAD_WEIGHT, lineHeight: 1.088, letterSpacing: `${FLOW_HEAD_TRACK_EM}em` }}>
              <span style={{ display: "inline-block", transform: nudge(FLOW_LINE_NUDGE.head1) }}>Websites built</span>
              <br />
              <span style={{ display: "inline-block", transform: nudge(FLOW_LINE_NUDGE.head2) }}>to be seen.</span>
            </h1>
          </div>
          <p style={{ position: "absolute", left: FLOW_REF.sub[0], top: FLOW_REF.sub[1], margin: 0, whiteSpace: "nowrap", fontSize: 16, lineHeight: "26px", letterSpacing: `${FLOW_TRACK_EM}em` }}>
            {FLOW_SUB.map((line, k) => (
              <span key={k}>
                <span id={`hero-flow-sub${k + 1}`} suppressHydrationWarning style={{ display: "inline-block", transform: nudge(k === 0 ? FLOW_LINE_NUDGE.sub1 : FLOW_LINE_NUDGE.sub2) }}>
                  {[...line].map((c, i) => (
                    <span key={i} suppressHydrationWarning style={{ opacity: 0 }}>
                      {c}
                    </span>
                  ))}
                </span>
                {k === 0 && <br />}
              </span>
            ))}
          </p>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: FLOW_SCRIPT }} />
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
