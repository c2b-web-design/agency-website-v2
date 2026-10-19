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
 *   section's boxes sharing one program. ⛔ RENDERED FROM THE FIRST FRAME AT FADE 0, never `visible={false}` until the reveal —
 *   three.js skips invisible objects, so their programs would link on the frame the fade starts (the answer cards' "Q5 stalls").
 *   `onReady` fires after that first frame: the shaders are compiled by then.
 * - ⛔ FRAMES: `frameloop="demand"`. ⛔ PASS 3 (19 October 2026, session 2): the studio DRIFTS (`CORNER_LIGHT`,
 *   `corner-material.ts`), so while `moving` the family button's `Ticker` is mounted — `/about`'s mechanism, REUSED (the
 *   structural note, decision 3): continuous frames ONLY while this canvas is on screen in a visible tab. Under reduced
 *   motion it is not mounted and frames come only from a fade, a resize or the boxes moving. On the fallback the frame
 *   UNMOUNTS this canvas (one-way).
 * - ⛔ FAILURE → `onFailed` (the frame then falls back to the border, one-way): anything thrown inside the canvas (the photo,
 *   the HDRI, the build — R3F rethrows to its parent, caught by `Guard`), or a lost context. ⚠ A browser with no usable WebGL
 *   fails INSIDE R3F's async setup and may throw nothing here — the frame's DEADLINE is the net for that.
 */
import { Component, Suspense, use, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
  const n = boxes.length;
  const perBox = useMemo(
    () => Array.from({ length: n }, () => createCornerFadeMaterial(colour, built, hdri)),
    [n, colour, built, hdri],
  );
  useEffect(() => () => perBox.forEach((p) => p.material.dispose()), [perBox]);

  // a frame whenever what is drawn changes; the sequence keeps asking while a fade runs
  useEffect(() => invalidate(), [boxes, reveal, size, invalidate]);
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
    if (!reported.current) {
      reported.current = true;
      // this frame renders (and links the programs) straight after the callbacks — ready once it has
      window.setTimeout(onReady, 0);
    }
  });

  // canvas centre is the scene origin: a box at (x, y) from the top-left sits at (x − W/2, H/2 − y)
  const ox = -size.width / 2;
  const oy = size.height / 2;
  return (
    <>
      {boxes.map((b, i) =>
        CORNERS.map(({ c, at, s }) => {
          const [x, y] = at(b);
          return <mesh key={`${i}-${c}`} geometry={built.geometry} material={perBox[i].material} position={[ox + x, oy + y, 0]} scale={s} />;
        }),
      )}
    </>
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
