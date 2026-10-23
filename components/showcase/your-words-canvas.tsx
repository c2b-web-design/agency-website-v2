"use client";

/**
 * ⛔ FILM 4's PAGE — ONE PIECE's CANVAS (D-088, 23 October 2026, session 2; the structural note
 * `live-work/structural-note-showcase-two-viewports-23-october.md` v2, option A: A CANVAS PER PIECE, each in its own
 * viewport, scrolling with it). Loaded ONLY through `your-words-section.tsx`'s `next/dynamic(…, { ssr: false })`: this module
 * is where three.js enters, never the SSR'd section — the ornate corners' pattern (`corner-frame.tsx` / `corner-canvas.tsx`).
 *
 * - ⛔ THE WORDS ARE THE BENCH's, BUILT BY THE BENCH's CODE (`lettering-hooks.tsx` — one mechanism): measured in the DOM
 *   (`MeasureSpans`, `aria-hidden` here — the section holds the accessible text), the font proved before anything is built,
 *   the arch's collisions checked. A failed check is a FAILURE (`onFailed` → the section shows the words as text).
 *   ⛔ ASSERTED: the words the section shows and the words built here must agree (case-insensitive — the arch is set in
 *   capitals); a mismatch fails loudly rather than reading one thing and drawing another.
 * - ⛔ THE MATERIAL: the one brushed brass (`BRUSHED_BRASS`) on both pieces — Carl: *"2 different elements with the same
 *   material that will differ with the use of light and movement."* The light until pass 3: the JUDGING STUDIO alone
 *   (`JUDGING_STUDIO` — the line 305°, the arch 355°, room 0.1), framed as the bench's material front (`frontDistance`, so
 *   the measured balance holds). Neutral tone mapping — a judging choice; the page's is pass 3's.
 *   ⛔ PASS 3 IS NOT BUILT: viewport 1's static light, viewport 2's travelling light and the logo's animation (Carl).
 * - ⛔ FRAMES: `frameloop="demand"` — a frame when something changes, then nothing. Both pieces are still until pass 3; the
 *   arch's animation will mount the family `Ticker` (frames only while on screen — `whoweare-button-scene.tsx`).
 * - ⛔ THE STUDIO's PREFILTER AND THE SHADERS COMPILE WITHOUT BLOCKING — `usePrefilteredStudio` and `whenLinked`, REUSED from
 *   `corner-canvas.tsx` (D-100: a ~1 s main-thread freeze otherwise). The piece stays `visible={false}` until every program
 *   reports linked; `onReady` fires after the first frame drawn with it.
 * - ⛔ FAILURE → `onFailed`: anything thrown inside the canvas (`Guard`), a lost context, the font check, a collision.
 */
import { Component, Suspense, use, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useCanvasDpr } from "@/lib/use-site-scale";
import { loadStudioHdri, STUDIO_HDRI_SRC } from "@/lib/studio-hdri";
import { usePrefilteredStudio, whenLinked } from "@/components/home/corner-canvas";
import { LETTERING_DEFAULTS, type LetteringSpec, type LetteringStats } from "./lettering-geometry";
import { applyBrushedMetal, BRUSHED_BRASS, createBrushedMetal, JUDGING_STUDIO } from "./lettering-material";
import {
  ArchGrain,
  archShapeKey,
  frontDistance,
  FRONT_FOV,
  MeasureSpans,
  useArchCollisions,
  useArchLetters,
  useArchPlacement,
  useLineBuild,
  useLines,
  useMeasured,
  useShowcaseFont,
  type ArchLetters,
  type ArchPlaced,
} from "./lettering-hooks";

export type Piece = "line" | "arch";

/** The two pieces: the bench's defaults — the line is take 1's layout (R-088), the arch take 7/8 (R-090, R-091). */
const SPECS: Record<Piece, LetteringSpec> = {
  line: { ...LETTERING_DEFAULTS, layout: { kind: "line" } },
  arch: LETTERING_DEFAULTS,
};
const LOOK = BRUSHED_BRASS;

/**
 * ⛔ WHERE EACH PIECE STANDS — its centre's height, a fraction of the viewport from the top (Carl, 23 October 2026, session 2:
 * *"Size is good. Move the your company into the upper third"* — the middle of the upper third). ⛔ MOVED IN THE WORLD, the
 * camera kept: the word is seen from a little below, as a sign set high on a wall (the alternative, a lens shift, would
 * slide the picture and change nothing in it — stated to Carl as the Builder's choice). ⚠ So the studio's reflection on the
 * line is no longer the one measured at the centre.
 */
const PLACE: Record<Piece, number> = { line: 1 / 6, arch: 0.5 };

/**
 * ⛔ VIEWPORT 1's STATIC LIGHT — PASS 3 BEGUN ON THE LINE: TWO PAIRS (Carl, 23 October 2026, session 2). The trail: *"light it
 * from the upper left and right"*; *"almost as if its on stage and its being lit from stage left and right. We are looking
 * for balance and to highlight its geometry."*; on the WINGS take: *"The light shouldnt be in the wings, it should be out
 * front like in a theatre."*; on the FRONT take: *"the wing lights on the first pass made the face too dark but brought out
 * the highlights and shadows inside. Start from there and then bring up the other pair to an adequate level. rather than
 * tweaking 4 parameters we get it close to how we want it and then slowly bring up the others."*
 *
 * ⛔ THE WINGS ARE THE BASE — take 2 EXACTLY: beyond the word's ends, high, just in front (x ±0.9, y +0.35, z +0.15 of the
 *   word's width), intensity 3. Raking side light: it misses the metal face and catches the chamfers facing each wing — the
 *   highlights and shadows INSIDE the letters (Carl). Too dark on the face by itself.
 * ⛔ THE FRONT PAIR IS BROUGHT UP UNDER IT — take 3's McCANDLESS placement, kept as measured balanced: out front, 30° off the
 *   centre line each side, 45° up, 1.5 word-widths' throw, crossing on the word's centre. ONLY ITS INTENSITY MOVES (Carl: not
 *   four parameters at once). Take 3 had it alone at 2 — the face lit, paler, the grain quieter.
 * Both: spotlights aimed at the word's centre, no distance falloff (`decay` 0 — the scene's units are layout px), 35°
 * soft-edged cones (penumbra 0.8). The studio stays the face's reflection DETAIL (the logo standard, 15 October).
 * Dials: `?wing=` `?front=` (intensities) — one per pair. Still — `frameloop="demand"` holds.
 */
// ⛔ APPROVED (R-092, *"Yes, its approved"*): the wings at 3, the front pair at 0.5 — *"The face is lighter and letter depth is
// clearly visible. The naterial is also clearly reading as Brass"*. MEASURED (fixed mask, fifths): 102.8 · 106.2 · 102.4 ·
// 106.0 · 100.8, mean 103.4, blown 2.6% (the edges' glints); the wings alone 82.6. ⚠ Set under Neutral tone mapping.
const WINGS = { intensity: 3, x: 0.9, y: 0.35, z: 0.15 };
const FRONT = { intensity: 0.5, azDeg: 30, elDeg: 45, distW: 1.5 };
const CONE = { angleDeg: 35, penumbra: 0.8 };
function readIntensities(): { wing: number; front: number } {
  const q = new URLSearchParams(window.location.search);
  const n = (k: string, d: number) => (q.get(k) !== null && Number.isFinite(Number(q.get(k))) ? Number(q.get(k)) : d);
  return { wing: n("wing", WINGS.intensity), front: n("front", FRONT.intensity) };
}

/** The two pairs, aimed at the word's centre (`at`); `w` the word's width, layout px. */
function SignLamps({ w, at }: { w: number; at: [number, number, number] }) {
  const [level] = useState(readIntensities);
  const target = useMemo(() => new THREE.Object3D(), []);
  const r = (deg: number) => (deg * Math.PI) / 180;
  const D = FRONT.distW * w;
  // each lamp's offset from the word's centre, by side (−1 stage left of the viewer, +1 right)
  const lamps = [-1, 1].flatMap((side) => [
    { key: `wing${side}`, intensity: level.wing, off: [side * WINGS.x * w, WINGS.y * w, WINGS.z * w] },
    {
      key: `front${side}`,
      intensity: level.front,
      off: [side * D * Math.sin(r(FRONT.azDeg)) * Math.cos(r(FRONT.elDeg)), D * Math.sin(r(FRONT.elDeg)), D * Math.cos(r(FRONT.azDeg)) * Math.cos(r(FRONT.elDeg))],
    },
  ]);
  return (
    <>
      <primitive object={target} position={at} />
      {lamps.map((l) => (
        <spotLight
          key={l.key}
          position={[at[0] + l.off[0], at[1] + l.off[1], at[2] + l.off[2]]}
          target={target}
          intensity={l.intensity}
          angle={r(CONE.angleDeg)}
          penumbra={CONE.penumbra}
          decay={0}
        />
      ))}
    </>
  );
}

type Built =
  | { kind: "line"; geometry: THREE.BufferGeometry; stats: LetteringStats }
  | { kind: "arch"; placed: ArchPlaced; letters: ArchLetters };

/** Neutral tone mapping on the live renderer, set before anything compiles (three keys its programs on it). */
function NeutralToneMapping() {
  const get = useThree((s) => s.get);
  useEffect(() => {
    get().gl.toneMapping = THREE.NeutralToneMapping;
  }, [get]);
  return null;
}

function Scene({ piece, built, onReady }: { piece: Piece; built: Built; onReady: () => void }) {
  const hdri = use(loadStudioHdri(STUDIO_HDRI_SRC, JUDGING_STUDIO.room));
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const env = usePrefilteredStudio(gl, hdri);
  const metal = useMemo(() => (env ? createBrushedMetal(env) : null), [env]);
  useEffect(() => () => metal?.dispose(), [metal]);
  useEffect(() => {
    if (!metal) return;
    applyBrushedMetal(metal, LOOK, JUDGING_STUDIO.yawDeg[piece], SPECS[piece].sizePx);
    invalidate();
  }, [metal, piece, invalidate]);

  // ⛔ THE COMPILE, OFF THE MAIN THREAD: drawn only once every program reports ready
  const [compiled, setCompiled] = useState<object | null>(null);
  const linked = !!metal && compiled === metal;
  useEffect(() => {
    if (!metal) return;
    return whenLinked(gl, gl.compile(scene, camera), () => setCompiled(metal));
  }, [gl, scene, camera, metal, built]);

  useEffect(() => invalidate(), [size, linked, built, invalidate]);
  const reported = useRef(false);
  useFrame(() => {
    if (linked && !reported.current) {
      reported.current = true;
      // this frame draws the piece (its programs already linked) straight after the callbacks — ready once it has
      window.setTimeout(onReady, 0);
    }
  });

  const w = built.kind === "line" ? built.stats.widthPx : built.placed.reading.widthPx;
  const h = built.kind === "line" ? built.stats.heightPx : built.placed.reading.heightPx;
  const d = frontDistance(w, h, size);
  // the piece's centre raised to its place: at the face's plane the window spans 2·d·tan(fov/2) — `PLACE` from the top
  const up = (0.5 - PLACE[piece]) * 2 * d * Math.tan(((FRONT_FOV / 2) * Math.PI) / 180);
  const material = metal ? [metal.face, metal.edge] : undefined;
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, d]} fov={FRONT_FOV} near={1} far={d * 10} />
      {built.kind === "arch" && <ArchGrain shown={built} />}
      {piece === "line" && <SignLamps w={w} at={[0, up, 0]} />}
      <group visible={linked} position={[0, up, 0]}>
        {material && built.kind === "line" && <mesh geometry={built.geometry} material={material} />}
        {material &&
          built.kind === "arch" &&
          built.letters.list.map((l) => {
            const p = built.placed.placements.get(l)!;
            // each letter keeps three's own groups: the brushed FACE (materialIndex 0), the polished SIDES (1)
            return <mesh key={`${l.line}${l.index}`} geometry={built.letters.geos.get(l)} material={material} position={[p.x, p.y, 0]} />;
          })}
      </group>
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

export default function YourWordsCanvas({ piece, words, onReady, onFailed }: {
  piece: Piece;
  /** the words the section shows as text — asserted against the words built here */
  words: string;
  onReady: () => void;
  onFailed: (why: string) => void;
}) {
  const dpr = useCanvasDpr([1, 2]);
  const spec = SPECS[piece];
  const arch = spec.layout.kind === "arch" ? spec.layout : null;
  const lines = useLines(spec);
  const font = useShowcaseFont(spec.font);
  const { spans, measured } = useMeasured(font, lines, spec.font, spec.sizePx);
  const ok = !!measured && !measured.check.stops.length;
  const made = useLineBuild(!!arch, font, measured, spec);
  const shapeKey = archShapeKey(arch, spec);
  const letters = useArchLetters(shapeKey, font);
  const placed = useArchPlacement(arch, font, letters, shapeKey, measured, spec.sizePx);
  const report = useArchCollisions(placed, letters, spec.sizePx);

  // ⛔ the words asserted, the checks enforced — each a failure in plain words (the section logs it and shows the text)
  const built = lines.map((l) => l.words).join(" ").toLowerCase();
  const why =
    built !== words.toLowerCase()
      ? `the words built ("${built}") are not the words shown ("${words}")`
      : measured?.check.stops.length
        ? measured.check.stops.join(" ")
        : report && (report.collisions > 0 || report.tight > 0)
          ? `${report.collisions} overlapping and ${report.tight} tight pairs of letters`
          : null;
  useEffect(() => {
    if (why) onFailed(why);
  }, [why, onFailed]);

  // one object per build — the compile and the grain re-run only when what is drawn changes
  const shown = useMemo<Built | null>(
    () =>
      !ok
        ? null
        : arch
          ? placed && letters && report
            ? { kind: "arch", placed, letters }
            : null
          : made?.geometry
            ? { kind: "line", geometry: made.geometry, stats: made.stats }
            : null,
    [ok, arch, placed, letters, report, made],
  );

  return (
    <>
      <MeasureSpans lines={lines} fontKey={spec.font} spans={spans} accessible={false} />
      <Guard onFailed={() => onFailed("the canvas threw")}>
        <Canvas
          gl={{ antialias: true, alpha: true }}
          resize={{ offsetSize: true }}
          dpr={dpr}
          frameloop="demand"
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", () => onFailed("the WebGL context was lost"), { once: true });
          }}
        >
          <NeutralToneMapping />
          <Suspense fallback={null}>{shown && <Scene piece={piece} built={shown} onReady={onReady} />}</Suspense>
        </Canvas>
      </Guard>
    </>
  );
}
