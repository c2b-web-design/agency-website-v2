"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { WebGPURenderer } from "three/webgpu";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { ToonShader1, ToonShader2, ToonShaderHatching, ToonShaderDotted } from "three/examples/jsm/shaders/ToonShader.js";
import Container from "@/components/layout/container";

/**
 * ⛔ THE MARCHING-CUBES BENCH — three's `webgl_marchingcubes`, MIRRORED EXACTLY (10 November 2026, session 2; D-101). Carl:
 * *"start on a new bench. mirror the marching cubes exactly."* … *"no lines yet. you dont need them. just put it in 3d
 * space"*; the principle: *"Because we have an outside element with its own rules we must adapt to that first."* The
 * example's source, three r185 (`examples/webgl_marchingcubes.html`, fetched from the three.js repository at r185,
 * 10 November 2026), copied LINE FOR LINE: its camera (45°, at −500, 500, 1500), its background, its three lights, its
 * thirteen materials (the castle cube map loaded from threejs.org, as the example loads its own), `MarchingCubes` at
 * resolution 28 and scale 700, its `updateCubes` (the paths, the strength, subtract 12, floor/walls `addPlane* (2, 12)`),
 * its clock (`Timer`, half speed), its orbit controls (500–5000), its fps meter and its controls panel. Its variable names
 * kept, so the two can be read side by side.
 * The ONLY departures, stated:
 * - THE RENDERER: the example's own `WebGLRenderer` BY DEFAULT; `?webgpu=1` is `WebGPURenderer` (the hero's medium).
 *   ⛔ Under WebGPU this bench HUNG the GPU on both runs, 10 November 2026 (`DXGI_ERROR_DEVICE_HUNG`, the AMD driver's
 *   timeout dialog on Carl's machine). Was: "cause NOT FOUND; WebGPU only on purpose until it is." ✔ FOUND AND FIXED the
 *   same session (THE DRAW, below: the addon's `count` read as an instance count). WebGL stays the default: the example's
 *   own renderer, the reference. (Corrected 11 November 2026; the hero's bench `/proto/hero` carries the same fix.)
 * - THE TOON MATERIALS (toon1, toon2, hatching, dotted) are raw `ShaderMaterial`s, which `WebGPURenderer` cannot draw:
 *   offered only on WebGL (the panel says so under `?webgpu=1`).
 * - THE SIZE: the page is zoomed at the root above 1412 px (D-097), so the canvas is sized from its CONTAINER (layout px)
 *   at the device ratio × that zoom, not from `window` — the same picture, sharp.
 * - THE ENVIRONMENT: the first frame waits for the castle cube map to load (WebGPU builds the reflection on the first
 *   frame and, built before the images arrive, it fails for good — the shiny liquid drew black).
 * - THE DRAW: the addon builds the shape, a plain mesh sharing its geometry draws it — the addon's `count` is read by
 *   three's WebGPU renderer as an INSTANCE count (below, "THE ONE STRUCTURAL DEPARTURE").
 * - Everything is DISPOSED on unmount (React's StrictMode mounts twice in development).
 * ⚠ DEV: `window.__marching` — the backend drawn on, the effect, the controller.
 */
export default function MarchingBench() {
  const box = useRef<HTMLDivElement>(null);
  const homeText = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = box.current;
    if (!host) return;
    const container: HTMLDivElement = host;
    // ⛔ WebGL BY DEFAULT (10 November 2026, session 2): under WebGPU this bench HUNG Carl's GPU twice (DXGI_ERROR_DEVICE_HUNG;
    // the AMD driver reported a timeout and reset). Was: "WebGPU only on purpose, `?webgpu=1`, until the cause is found".
    // ✔ The cause was found and fixed the same day (THE ONE STRUCTURAL DEPARTURE, below); WebGL stays the default as the
    // example's own renderer, the reference; `?webgpu=1` WebGPU (corrected 11 November 2026)
    const webgl = !new URLSearchParams(window.location.search).has("webgpu");
    const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const size = () => ({ w: container.clientWidth, h: container.clientHeight });
    let live = true;
    let gui: GUI | null = null;
    let stats: Stats | null = null;
    let controls: OrbitControls | null = null;
    let renderer: THREE.WebGLRenderer | WebGPURenderer | null = null;
    const disposables: { dispose(): void }[] = [];
    // the cube maps' loads — awaited before the first frame (below, "THE ENVIRONMENT WAITED FOR")
    const loads: Promise<unknown>[] = [];

    // the example's module state
    let current_material: string;
    let resolution: number;
    let time = 0;
    const timer = new THREE.Timer();
    timer.connect(document);

    // CAMERA
    const { w, h } = size();
    const camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000);
    camera.position.set(-500, 500, 1500);

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
    const materials = generateMaterials();
    current_material = "shiny";

    // MARCHING CUBES
    resolution = 28;

    const effect = new MarchingCubes(resolution, materials[current_material], true, true, 100000);
    effect.position.set(0, 0, 0);
    effect.scale.set(700, 700, 700);

    effect.enableUvs = false;
    effect.enableColors = false;

    // ⛔ THE ONE STRUCTURAL DEPARTURE — THE ADDON's `count` (found 10 November 2026, session 2, by measurement). `MarchingCubes`
    // keeps its VERTEX count in `this.count`; three r185's WebGPU renderer reads a mesh's `object.count` as its INSTANCE
    // count (`RenderObject.js:610–612`), so it drew the whole liquid ~10,000 times a frame (~100 M vertices, ~2.5 s on the
    // GPU): the device HUNG twice on Carl's machine (the AMD driver's timeout). The WebGL renderer never reads it. So the
    // addon BUILDS the shape (its own `update`, untouched) but is not in the scene; a PLAIN mesh sharing its geometry and
    // material DRAWS it (measured: 3–7 ms on WebGPU). Same geometry, same material, same transform: the same picture.
    const view = new THREE.Mesh(effect.geometry, effect.material);
    view.position.copy(effect.position);
    view.scale.copy(effect.scale);
    scene.add(view);
    disposables.push(effect.geometry);

    const effectController = {
      material: "shiny",
      speed: 1.0,
      numBlobs: 10,
      resolution: 28,
      isolation: 80,
      floor: true,
      wallx: false,
      wallz: false,
      dummy: function () {},
    };
    // the material buttons: the example stores them ON `effectController`; kept in their own record here for lil-gui's typing
    const ec: Record<string, () => void> = {};

    function generateMaterials() {
      // environment map
      const path = "https://threejs.org/examples/textures/cube/SwedishRoyalCastle/";
      const format = ".jpg";
      const urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];

      const cubeTextureLoader = new THREE.CubeTextureLoader();

      // ⛔ THE ENVIRONMENT WAITED FOR (10 November 2026, session 2): under WebGPU the reflection node is built on the FIRST
      // frame; with the cube's images not yet loaded it failed for good (`PMREMNode.setup`: "Cannot read properties of
      // null (reading 'isRenderTargetTexture')") and the shiny liquid drew BLACK. The example's WebGL waits implicitly;
      // here the first frame waits for both loads, on both renderers
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

      const out: Record<string, THREE.Material> = {
        shiny: new THREE.MeshStandardMaterial({ color: 0x9c0000, envMap: reflectionCube, roughness: 0.1, metalness: 1.0 }),
        chrome: new THREE.MeshLambertMaterial({ color: 0xffffff, envMap: reflectionCube }),
        liquid: new THREE.MeshLambertMaterial({ color: 0xffffff, envMap: refractionCube, refractionRatio: 0.85 }),
        matte: new THREE.MeshPhongMaterial({ specular: 0x494949, shininess: 1 }),
        flat: new THREE.MeshLambertMaterial({
          /*TODO flatShading: true */
        }),
        textured: new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x111111, shininess: 1, map: texture }),
        colors: new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 2, vertexColors: true }),
        multiColors: new THREE.MeshPhongMaterial({ shininess: 2, vertexColors: true }),
        plastic: new THREE.MeshPhongMaterial({ specular: 0xc1c1c1, shininess: 250 }),
      };
      // toons — raw ShaderMaterials: the WebGL reference only (`WebGPURenderer` cannot draw them)
      if (webgl) {
        out.toon1 = createShaderMaterial(ToonShader1, light, ambientLight);
        out.toon2 = createShaderMaterial(ToonShader2, light, ambientLight);
        out.hatching = createShaderMaterial(ToonShaderHatching, light, ambientLight);
        out.dotted = createShaderMaterial(ToonShaderDotted, light, ambientLight);
      }
      disposables.push(...Object.values(out));
      return out;
    }

    function createShaderMaterial(shader: { uniforms: Record<string, THREE.IUniform>; vertexShader: string; fragmentShader: string }, light: THREE.DirectionalLight, ambientLight: THREE.AmbientLight) {
      const u = THREE.UniformsUtils.clone(shader.uniforms);

      const vs = shader.vertexShader;
      const fs = shader.fragmentShader;

      const material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: fs });

      material.uniforms["uDirLightPos"].value = light.position;
      material.uniforms["uDirLightColor"].value = light.color;

      material.uniforms["uAmbientLightColor"].value = ambientLight.color;

      return material;
    }

    function setupGui() {
      const createHandler = function (id: string) {
        return function () {
          current_material = id;

          effect.material = materials[id];
          view.material = materials[id];
          effect.enableUvs = current_material === "textured" ? true : false;
          effect.enableColors = current_material === "colors" || current_material === "multiColors" ? true : false;
        };
      };

      let h: GUI;

      gui = new GUI({ container });
      gui.domElement.style.position = "absolute";
      gui.domElement.style.top = "0";
      gui.domElement.style.right = "0";

      // material (type)
      h = gui.addFolder("Materials");

      for (const m in materials) {
        ec[m] = createHandler(m);
        h.add(ec, m).name(m);
      }
      if (!webgl) h.add({ note: "toon materials: WebGL only" }, "note").name("toons").disable();

      // simulation
      h = gui.addFolder("Simulation");

      h.add(effectController, "speed", 0.1, 8.0, 0.05);
      h.add(effectController, "numBlobs", 1, 50, 1);
      h.add(effectController, "resolution", 14, 100, 1);
      h.add(effectController, "isolation", 10, 300, 1);

      h.add(effectController, "floor");
      h.add(effectController, "wallx");
      h.add(effectController, "wallz");

      // OURS (not the example's): the home page's hero text over the view, for SPACING (Carl, 10 November 2026)
      h = gui.addFolder("Home page");
      const page = { text: true };
      h.add(page, "text").onChange((on: boolean) => {
        if (homeText.current) homeText.current.style.display = on ? "" : "none";
      });
    }

    // this controls content of marching cubes voxel field
    function updateCubes(object: MarchingCubes, time: number, numblobs: number, floor: boolean, wallx: boolean, wallz: boolean) {
      object.reset();

      // fill the field with some metaballs
      const rainbow = [new THREE.Color(0xff0000), new THREE.Color(0xffbb00), new THREE.Color(0xffff00), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff), new THREE.Color(0x9400bd), new THREE.Color(0xc800eb)];
      const subtract = 12;
      const strength = 1.2 / ((Math.sqrt(numblobs) - 1) / 4 + 1);

      for (let i = 0; i < numblobs; i++) {
        const ballx = Math.sin(i + 1.26 * time * (1.03 + 0.5 * Math.cos(0.21 * i))) * 0.27 + 0.5;
        const bally = Math.abs(Math.cos(i + 1.12 * time * Math.cos(1.22 + 0.1424 * i))) * 0.77; // dip into the floor
        const ballz = Math.cos(i + 1.32 * time * 0.1 * Math.sin(0.92 + 0.53 * i)) * 0.27 + 0.5;

        if (current_material === "multiColors") {
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

    function render() {
      const delta = timer.getDelta();

      time += delta * effectController.speed * 0.5;

      // marching cubes
      if (effectController.resolution !== resolution) {
        resolution = effectController.resolution;
        effect.init(Math.floor(resolution));
      }

      if (effectController.isolation !== effect.isolation) {
        effect.isolation = effectController.isolation;
      }

      updateCubes(effect, time, effectController.numBlobs, effectController.floor, effectController.wallx, effectController.wallz);
      // the addon (not in the scene) holds its transform; the view follows it
      view.position.copy(effect.position);
      view.scale.copy(effect.scale);

      // render
      renderer!.render(scene, camera);
    }

    function animate() {
      timer.update();

      render();
      stats!.update();
    }

    function onWindowResize() {
      const { w, h } = size();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer!.setSize(w, h);
    }

    // RENDERER (the one departure: WebGL, the example's own, unless `?webgpu=1`. Corrected 11 November 2026; it read
    // "WebGPU unless `?webgl=1`", the reverse of the code)
    const start = async () => {
      const r = webgl ? new THREE.WebGLRenderer() : new WebGPURenderer();
      if (r instanceof WebGPURenderer) {
        // a lost device STOPS the loop at once: a hang must not repeat within the run
        r.onDeviceLost = (info: { message?: string }) => {
          r.setAnimationLoop(null);
          container.dataset.marchingError = `device lost: ${info?.message ?? ""}`.slice(0, 300);
        };
        await r.init();
      }
      if (!live) {
        r.dispose();
        return;
      }
      renderer = r;
      renderer.setPixelRatio(window.devicePixelRatio * zoom);
      renderer.setSize(w, h);
      container.appendChild(renderer.domElement);

      // CONTROLS
      controls = new OrbitControls(camera, renderer.domElement);
      controls.minDistance = 500;
      controls.maxDistance = 5000;

      // STATS
      stats = new Stats();
      stats.dom.style.position = "absolute";
      container.appendChild(stats.dom);

      // GUI
      setupGui();

      // EVENTS
      window.addEventListener("resize", onWindowResize);

      if (process.env.NODE_ENV !== "production") {
        const backend = r instanceof WebGPURenderer ? ((r.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend ? "webgpu" : "webgl2 (fallback)") : "webgl (the example's own)";
        (window as unknown as { __marching?: unknown }).__marching = { backend, effect, effectController, renderer: r, scene, camera };
        container.dataset.marchingBackend = backend;
      }
      await Promise.all(loads);
      if (!live) return;
      renderer.setAnimationLoop(animate);
    };
    start().catch((e: unknown) => {
      container.dataset.marchingError = String(e);
      console.error("[marching bench] the renderer did not start", e);
    });

    return () => {
      live = false;
      window.removeEventListener("resize", onWindowResize);
      renderer?.setAnimationLoop(null);
      controls?.dispose();
      gui?.destroy();
      stats?.dom.remove();
      timer.dispose();
      for (const d of disposables) d.dispose();
      renderer?.domElement.remove();
      renderer?.dispose();
    };
  }, []);
  return (
    <>
      <div ref={box} data-marching-bench="" className="fixed inset-0 overflow-hidden bg-[#050505]" />
      {/* ⛔ THE HOME PAGE's HERO TEXT, OVER THE VIEW (10 November 2026, session 2; Carl: *"is it possible to show me where thr
          text is in this view? it doesnt have to be threejs, im looking at spacing"*). The home page's OWN markup and classes
          (`app/page.tsx`, the hero section: under the 81 px header, the same `Container`, heading and subtext), as page text
          laid over the canvas, clicks passing through. A GUIDE for spacing, not part of the example: "Home page → text" in the
          panel hides it */}
      <div ref={homeText} className="pointer-events-none fixed inset-0 text-white">
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
