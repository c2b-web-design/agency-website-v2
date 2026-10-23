"use client";

/**
 * ⛔ THE ORNATE CORNERS' CANVAS — ONE PER SECTION's GRID (D-100; the structural note v6,
 * `live-work/structural-note-ornate-corners-on-home-19-october.md`, option B). Loaded ONLY through `corner-frame.tsx`'s
 * `next/dynamic(…, { ssr: false })`: this module is where three.js enters, never the SSR'd frame.
 *
 * - ⛔ SCENE UNITS = LAYOUT PX: R3F's orthographic default camera at zoom 1 with `offsetSize` (D-097) — the bench's world
 *   (`corner-bench.tsx`), so the approved pieces draw at their approved size. Sharpness from `useCanvasDpr`.
 * - ⛔ THE RELIEF IS BUILT ONCE PER BROWSER SESSION (option (a), runtime from the photo): `loadRelief` caches the promise at
 *   module level. ⚠ STATE THAT OUTLIVES THE PAGE (§5a, stated in the note): home → `/about` → home reuses it. NEVER disposed —
 *   both canvases (and a later visit) hold its geometry and maps; each renderer uploads its own copy and frees it with itself.
 * - ⛔ THE FADE: one material per BOX (`createCornerFadeMaterial` — alpha = the fade alone after the alpha test), all of a
 *   section's boxes sharing one program. ⛔ RENDERED AT FADE 0 BEFORE THE REVEAL, never first drawn on the frame the fade
 *   starts — three.js skips invisible objects, so their programs would link then (the answer cards' "Q5 stalls").
 * - ⛔ THE SHADERS COMPILE WITHOUT BLOCKING (21 October 2026 — Carl: *"On the corners issue. Implement your
 *   recommendation."*, D-100): `renderer.compile` hands the programs to the driver and the canvas POLLS each program's
 *   `isReady()` (three's `compileAsync` method, its loop written here so the fallback's unmount can stop it — three's own
 *   polls a lost context for ever). The pieces stay `visible={false}` until then: `compile` walks invisible objects too, so
 *   nothing links on a frame. Before this, the first draw waited ~1 s for the driver in ONE main-thread task — on a cold
 *   deep link the corners missed the deadline every time, and on the reader's path that freeze landed DURING THE HERO
 *   (measured, D-100). `onReady` fires after the first frame drawn with them: the programs are linked by then.
 * - ⛔ AND THE STUDIO's PREFILTER (PMREM) FIRST, THE SAME WAY (`usePrefilteredStudio`). Measured after the compile above
 *   (21 October): ~570–650 ms still blocked on ONE call — three's GGX prefilter shader, linked and drawn SYNCHRONOUSLY inside
 *   `compile` when it meets an equirect `envMap`. So the canvas prefilters the studio itself: its programs compiled into the
 *   same target type they draw into and polled ready, THEN `fromEquirectangular`, and the pieces get the finished cube-UV
 *   map (three passes it straight through — the same map it would have made). ⚠ THIS READS `PMREMGenerator`'s PRIVATE
 *   FIELDS (`_setSize`, `_allocateTargets`, `_equirectMaterial`, `_ggxMaterial`, `_pingPongRenderTarget`, three 0.185.1); if a
 *   three upgrade moves them it FALLS BACK to the synchronous prefilter — slower, never wrong. Re-measure on any upgrade.
 * - ⛔ FRAMES: `frameloop="demand"`. ⛔ PASS 3 (19 October 2026, session 2): the studio DRIFTS (`CORNER_LIGHT`,
 *   `corner-material.ts`), so while `moving` the family button's `Ticker` is mounted — `/about`'s mechanism, REUSED (the
 *   structural note, decision 3): continuous frames ONLY while this canvas is on screen in a visible tab. Under reduced
 *   motion it is not mounted and frames come only from a fade, a resize or the boxes moving. On the fallback the frame
 *   UNMOUNTS this canvas (one-way).
 * - ⛔ FAILURE → `onFailed` (the frame then falls back to the border, one-way): anything thrown inside the canvas (the photo,
 *   the HDRI, the build — R3F rethrows to its parent, caught by `Guard`), or a lost context. ⚠ A browser with no usable WebGL
 *   fails INSIDE R3F's async setup and may throw nothing here — the frame's DEADLINE is the net for that.
 */
import { Component, Suspense, use, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import bracket from "../../brand-assets/c4bf3a09-80f3-4b2c-b88a-925f08e9c26f.jpg";
import { buildCornerRelief } from "./corner-geometry";
import { CORNER_LIGHT, CORNER_LOOKS, createCornerFadeMaterial, type CornerColour } from "./corner-material";
import { Ticker } from "./whoweare-button-scene";
import { useCanvasDpr } from "@/lib/use-site-scale";
import { loadStudioHdri, STUDIO_HDRI_SRC } from "@/lib/studio-hdri";

/** A box in LAYOUT px, relative to the frame's top-left (the canvas's own origin). */
export type CornerBox = { x: number; y: number; w: number; h: number };
/** When the sequence started (`performance.now()`), each box's delay and fade, ms. `at: -Infinity` = all shown at once. */
export type CornerReveal = { at: number | null; stagger: number; dur: number };

type Relief = ReturnType<typeof buildCornerRelief>;
let relief: Promise<Relief> | null = null;
/** ⛔ The photo → the relief, ONCE per browser session (see the header). A failure stays failed — the fallback is one-way. */
function loadRelief(): Promise<Relief> {
  if (!relief) {
    relief = new Promise<Relief>((resolve, reject) => {
      const im = new Image();
      im.onload = () => {
        try {
          const c = document.createElement("canvas");
          c.width = im.naturalWidth;
          c.height = im.naturalHeight;
          const g = c.getContext("2d", { willReadFrequently: true })!;
          g.drawImage(im, 0, 0);
          resolve(buildCornerRelief(g.getImageData(0, 0, c.width, c.height)));
        } catch (e) {
          reject(e);
        }
      };
      im.onerror = () => reject(new Error("corner: the bracket photo did not load"));
      im.src = bracket.src;
    });
  }
  return relief;
}

/** the four corners of a box: the top-left mesh, mirrored by its transform (three.js turns the winding) */
const CORNERS = [
  { c: "tl", at: (b: CornerBox) => [b.x, -b.y] as const, s: [1, 1, 1] as const },
  { c: "tr", at: (b: CornerBox) => [b.x + b.w, -b.y] as const, s: [-1, 1, 1] as const },
  { c: "bl", at: (b: CornerBox) => [b.x, -(b.y + b.h)] as const, s: [1, -1, 1] as const },
  { c: "br", at: (b: CornerBox) => [b.x + b.w, -(b.y + b.h)] as const, s: [-1, -1, 1] as const },
];

type Ready = { currentProgram?: { isReady(): boolean } };
/** Poll until every material's program reports linked (`KHR_parallel_shader_compile`; without it three reports ready at
 *  once). Returns the cancel. ⚠ EXPORTED (23 October 2026) — REUSED by film 4's page (`your-words-canvas.tsx`), not copied:
 *  a change here reaches it. */
export function whenLinked(gl: THREE.WebGLRenderer, pending: Set<THREE.Material>, done: () => void): () => void {
  let id = 0;
  const poll = () => {
    for (const m of pending) if ((gl.properties.get(m) as Ready).currentProgram?.isReady()) pending.delete(m);
    if (pending.size === 0) done();
    else id = window.setTimeout(poll, 10);
  };
  poll();
  return () => window.clearTimeout(id);
}

/** `PMREMGenerator`'s private surface this file reads (three 0.185.1 — see the header). */
type PmremInside = {
  _setSize?: (cubeSize: number) => void;
  _allocateTargets?: () => THREE.WebGLRenderTarget;
  _equirectMaterial?: THREE.Material | null;
  _ggxMaterial?: THREE.Material | null;
  _pingPongRenderTarget?: THREE.WebGLRenderTarget | null;
};

/** ⛔ The studio prefiltered for THIS renderer without a main-thread compile stall (see the header). Null until done.
 *  ⚠ EXPORTED (23 October 2026) — REUSED by film 4's page (`your-words-canvas.tsx`); its reading of three's private fields
 *  now serves both. */
export function usePrefilteredStudio(gl: THREE.WebGLRenderer, hdri: THREE.DataTexture): THREE.Texture | null {
  const [env, setEnv] = useState<{ from: THREE.DataTexture; map: THREE.Texture } | null>(null);
  useEffect(() => {
    const gen = new THREE.PMREMGenerator(gl);
    const inside = gen as unknown as PmremInside;
    let target: THREE.WebGLRenderTarget | null = null;
    let cancel = () => {};
    const finish = () => {
      target = gen.fromEquirectangular(hdri);
      setEnv({ from: hdri, map: target.texture });
    };
    if (typeof inside._setSize === "function" && typeof inside._allocateTargets === "function") {
      // the sizes `fromEquirectangular` will choose (width / 4), so the materials made here are the ones it draws with
      inside._setSize(hdri.image.width / 4);
      inside._allocateTargets().dispose();
      gen.compileEquirectangularShader();
      const mats = [inside._equirectMaterial, inside._ggxMaterial].filter((m): m is THREE.Material => !!m);
      const into = inside._pingPongRenderTarget ?? null;
      if (mats.length === 2 && into) {
        // compiled while bound to a target of the type they draw into (half float, linear — no tone mapping, no sRGB out)
        const was = gl.getRenderTarget();
        gl.setRenderTarget(into);
        const pending = new Set<THREE.Material>();
        const flat = new THREE.OrthographicCamera();
        for (const m of mats) gl.compile(new THREE.Mesh(new THREE.BufferGeometry(), m), flat).forEach((x) => pending.add(x));
        gl.setRenderTarget(was);
        cancel = whenLinked(gl, pending, finish);
      } else cancel = whenLinked(gl, new Set(), finish);
    } else cancel = whenLinked(gl, new Set(), finish);
    return () => {
      cancel();
      target?.dispose();
      gen.dispose();
    };
  }, [gl, hdri]);
  return env && env.from === hdri ? env.map : null;
}

function fadeAt(i: number, reveal: CornerReveal, now: number): number {
  if (reveal.at === null) return 0;
  const t = (now - reveal.at - i * reveal.stagger) / reveal.dur;
  const f = Math.min(1, Math.max(0, t));
  // the Q&A cards' rise curve (`?riseease=cubic`, their default): quick to show, a long settle — so each box is ~63% in when
  // the next begins, "reaching its full appearance" (Carl, 19 October 2026). Was a smoothstep (19% at that point).
  return 1 - (1 - f) ** 3;
}

function Pieces({ colour, boxes, reveal, moving, onReady }: { colour: CornerColour; boxes: CornerBox[]; reveal: CornerReveal; moving: boolean; onReady: () => void }) {
  const built = use(loadRelief());
  const hdri = use(loadStudioHdri(STUDIO_HDRI_SRC, CORNER_LOOKS[colour].room));
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const n = boxes.length;
  const env = usePrefilteredStudio(gl, hdri);
  const perBox = useMemo(
    () => (env ? Array.from({ length: n }, () => createCornerFadeMaterial(colour, built, env)) : []),
    [n, colour, built, env],
  );
  useEffect(() => () => perBox.forEach((p) => p.material.dispose()), [perBox]);

  // ⛔ THE COMPILE, OFF THE MAIN THREAD (see the header): drawn only once every program reports ready
  const [compiled, setCompiled] = useState<typeof perBox | null>(null);
  const linked = perBox.length > 0 && compiled === perBox;
  useEffect(() => {
    if (perBox.length === 0) return;
    return whenLinked(gl, gl.compile(scene, camera), () => setCompiled(perBox));
  }, [gl, scene, camera, perBox]);

  // a frame whenever what is drawn changes; the sequence keeps asking while a fade runs
  useEffect(() => invalidate(), [boxes, reveal, size, linked, invalidate]);
  const reported = useRef(false);
  useFrame(() => {
    const now = performance.now();
    // ⛔ the light: the studio's slow small circle about its approved turn (still under reduced motion)
    const { yawDeg, pitchDeg, periodS } = CORNER_LIGHT.sway;
    const a = moving ? (now / 1000 / periodS) * Math.PI * 2 : 0;
    const yaw = ((CORNER_LOOKS[colour].yaw + yawDeg * Math.sin(a)) * Math.PI) / 180;
    const pitch = moving ? (pitchDeg * Math.cos(a) * Math.PI) / 180 : 0;
    perBox.forEach((p) => p.material.envMapRotation.set(pitch, yaw, 0));
    let running = false;
    perBox.forEach((p, i) => {
      p.fade.value = fadeAt(i, reveal, now);
      if (reveal.at !== null && p.fade.value < 1) running = true;
    });
    if (running) invalidate();
    if (linked && !reported.current) {
      reported.current = true;
      // this frame draws the pieces (their programs already linked) straight after the callbacks — ready once it has
      window.setTimeout(onReady, 0);
    }
  });

  // canvas centre is the scene origin: a box at (x, y) from the top-left sits at (x − W/2, H/2 − y)
  const ox = -size.width / 2;
  const oy = size.height / 2;
  return (
    <group visible={linked}>
      {perBox.length > 0 && boxes.map((b, i) =>
        CORNERS.map(({ c, at, s }) => {
          const [x, y] = at(b);
          return <mesh key={`${i}-${c}`} geometry={built.geometry} material={perBox[i].material} position={[ox + x, oy + y, 0]} scale={s} />;
        }),
      )}
    </group>
  );
}

/** Anything thrown inside the canvas (R3F rethrows it here) → the fallback. Renders nothing after. */
class Guard extends Component<{ onFailed: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailed();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function CornerCanvas({ colour, boxes, reveal, moving, onReady, onFailed }: {
  colour: CornerColour;
  boxes: CornerBox[];
  reveal: CornerReveal;
  /** the light drifts (false under reduced motion) */
  moving: boolean;
  onReady: () => void;
  onFailed: () => void;
}) {
  const dpr = useCanvasDpr([1, 2]);
  return (
    <Guard onFailed={onFailed}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 200], near: 1, far: 1000, zoom: 1 }}
        gl={{ antialias: true, alpha: true }}
        resize={{ offsetSize: true }}
        dpr={dpr}
        frameloop="demand"
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", () => onFailed(), { once: true });
        }}
      >
        <Suspense fallback={null}>
          <Pieces colour={colour} boxes={boxes} reveal={reveal} moving={moving} onReady={onReady} />
        </Suspense>
        {moving && <Ticker />}
      </Canvas>
    </Guard>
  );
}
