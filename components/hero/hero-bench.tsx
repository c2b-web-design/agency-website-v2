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
    const floor = { grid: true, spacing: 100 };
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

      // the home page's hero text over the view (Carl, 10 November 2026: spacing)
      f = gui.addFolder("Home page");
      // ⛔ OFF by default (11 November 2026): the text is BAKED into the world (`hero-scene.ts`); the page's text stays on
      // the screen as the camera flies, so it is now a CHECK at Home (on: it should sit on the 3D text), not the text
      const page = { text: false };
      f.add(page, "text").onChange((on: boolean) => {
        if (homeText.current) homeText.current.style.display = on ? "" : "none";
      });

      // the logo's arrival (`hero-scene.ts`, `arrivalPlan`; 13 November 2026): played once on load; replayed from the lean here
      f = gui.addFolder("Logo");
      f.add({ jump: () => hero.replayArrival() }, "jump").name("Arrival again");
      f.add(mouldGuide, "outline")
        .name("mould outline")
        .onChange((on: boolean) => {
          if (mouldLine) mouldLine.visible = on;
        });

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
