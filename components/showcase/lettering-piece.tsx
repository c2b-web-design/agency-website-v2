"use client";

/**
 * ⛔ FILM 4's LETTERING PIECE — the scene of ONE piece, lifted out of `your-words-canvas.tsx` (26 October 2026) so the page
 * and the CAMERA BENCH (`/proto/camera`) draw it from ONE mechanism (the structural note
 * `live-work/structural-note-camera-bench-26-october.md` v3, "What the bench draws"). Moved VERBATIM, by script — the build,
 * the brass, the compile gate, the lamps (`SignLamps`, R-092; `AxisLamps`, R-093) and their comments.
 *
 * ⛔ WHAT CHANGED IN THE LIFT, and only this:
 * - THE CAMERA IS THE CALLER's. `LetteringPiece` makes no camera; it compiles against whichever camera the caller has made
 *   default (`gl.compile(scene, camera)` — three's compile reads lights and materials, not the camera's pose). The page's
 *   camera is in `your-words-canvas.tsx` (`PageCamera`), the bench's in `camera-bench.tsx`.
 * - THE MEASUREMENTS ARE ONE PURE FUNCTION, `measurePiece` — the interface the note names: `d` (the front distance at the
 *   canvas's size), `up`, `zc`, the width and height, and for the arch the curve centre and the crown's underside, all in
 *   world layout px. The piece places itself from it; the page's camera and journey, and the bench, are driven from it.
 * - THE BUILD (`usePieceBuild`) — the hooks that measured, proved and built the words in `YourWordsCanvas`, now shared; the
 *   page keeps its own assertion that the words built are the words its section shows.
 * ⛔ PROVED UNCHANGED: `/proto/your-words` captured before and after at eight frames (viewport 1; viewport 2 at `?cam=0`
 *   and `?t=` 1, 9, 15.75, 20, 23.5, 28) — `live-work/scripts/film04-lift-compare-26-october.mjs`.
 */
import { Component, use, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { loadStudioHdri, STUDIO_HDRI_SRC } from "@/lib/studio-hdri";
import { usePrefilteredStudio, whenLinked } from "@/components/home/corner-canvas";
import { LETTERING_DEFAULTS, type LetteringSpec, type LetteringStats } from "./lettering-geometry";
import { applyBrushedMetal, BRUSHED_BRASS, createBrushedMetal, JUDGING_STUDIO } from "./lettering-material";
import {
  ArchGrain,
  archShapeKey,
  frontDistance,
  FRONT_FOV,
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
export const SPECS: Record<Piece, LetteringSpec> = {
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

/** The crown letter's underside — the arch letter whose lowest ink stands highest (the N) — its middle, layout px. */
export function crownUnderside(built: { placed: ArchPlaced; letters: ArchLetters }): { x: number; y: number } {
  let best: { x: number; y: number } | null = null;
  for (const l of built.letters.list) {
    if (l.line !== "arch") continue;
    const p = built.placed.placements.get(l)!;
    const under = p.y + l.bounds.minY;
    if (!best || under > best.y) best = { x: p.x + (l.bounds.minX + l.bounds.maxX) / 2, y: under };
  }
  return best ?? { x: 0, y: 0 };
}

/**
 * ⛔ VIEWPORT 2's LIGHT — LAMPS ON THE ORBIT's AXIS, ONE ABOVE, ONE BELOW (the Builder, on Carl's *"light it appropriately
 * for the cameras journey"* — his *"hemisphere lights, top and bottom"* the starting point). Why on the axis: the camera
 * orbits about the VERTICAL, so a lamp straight above and one straight below are the SAME to it from every point of the
 * orbit. Why lamps and not three's `HemisphereLight`: that feeds only the DIFFUSE term, which a metal (metalness 1) does
 * not have — on this brass it adds exactly nothing (three r185, `lights_physical_fragment`: diffuse × (1 − metalness)).
 * On the metal these lamps catch the CHAMFERS: a 45° chamfer facing up reflects the top lamp straight out along the face's
 * normal, toward a camera anywhere on the orbit — the bottom lamp the same for the chamfers facing down. The studio stays the
 * faces' reflection (the logo standard), fixed in the world, so what the faces show changes as the camera moves.
 * Directional (no position falloff), white. Dials: `?top=` `?bottom=` (intensities).
 *
 * ⛔ AND A BACK PAIR — the arch is THEATRE IN THE ROUND (take 2). Measured on take 1: from behind, the faces read darker
 * (lit mean 60 against the front's 86) — they reflect the studio's dark side. Viewport 1's McCANDLESS front pair (30° off
 * centre, 45° up, 1.5 widths — R-092's placement) MIRRORED BEHIND the arch lifts the backs; from the front the pair sits
 * behind the letters and is seen only as edge light. `?back=` (intensity).
 */
const AXIS_LAMPS = { top: 2, bottom: 1, back: 0.7 };
function AxisLamps({ at, w }: { at: [number, number, number]; w: number }) {
  const [level] = useState(() => {
    const q = new URLSearchParams(window.location.search);
    const n = (k: string, d: number) => (q.get(k) !== null && Number.isFinite(Number(q.get(k))) ? Number(q.get(k)) : d);
    return { top: n("top", AXIS_LAMPS.top), bottom: n("bottom", AXIS_LAMPS.bottom), back: n("back", AXIS_LAMPS.back) };
  });
  const target = useMemo(() => new THREE.Object3D(), []);
  const r = (deg: number) => (deg * Math.PI) / 180;
  const D = FRONT.distW * w;
  return (
    <>
      <primitive object={target} position={at} />
      <directionalLight position={[at[0], at[1] + 1000, at[2]]} target={target} intensity={level.top} />
      <directionalLight position={[at[0], at[1] - 1000, at[2]]} target={target} intensity={level.bottom} />
      {[-1, 1].map((side) => (
        <spotLight
          key={side}
          position={[
            at[0] + side * D * Math.sin(r(FRONT.azDeg)) * Math.cos(r(FRONT.elDeg)),
            at[1] + D * Math.sin(r(FRONT.elDeg)),
            at[2] - D * Math.cos(r(FRONT.azDeg)) * Math.cos(r(FRONT.elDeg)),
          ]}
          target={target}
          intensity={level.back}
          angle={r(CONE.angleDeg)}
          penumbra={CONE.penumbra}
          decay={0}
        />
      ))}
    </>
  );
}

export type Built =
  | { kind: "line"; geometry: THREE.BufferGeometry; stats: LetteringStats }
  | { kind: "arch"; placed: ArchPlaced; letters: ArchLetters };

/**
 * ⛔ THE PIECE's MEASUREMENTS — ONE PURE FUNCTION (the interface the camera bench's note names). World layout px, the
 * piece's group raised by `up`; the camera's start is `(0, 0, d)`. `zc` the middle of the letters' depth (they run from z 0
 * to the depth). For the arch: `curveCentre` and `crown` (the N's underside) already raised by `up`.
 * ⚠ The arithmetic is the lifted `Scene`'s own, unchanged — the pixel check proves the page draws as before.
 */
export type PieceMeasure = {
  w: number;
  h: number;
  d: number;
  up: number;
  zc: number;
  curveCentre: { x: number; y: number } | null;
  crown: { x: number; y: number } | null;
};
export function measurePiece(piece: Piece, built: Built, size: { width: number; height: number }): PieceMeasure {
  const w = built.kind === "line" ? built.stats.widthPx : built.placed.reading.widthPx;
  const h = built.kind === "line" ? built.stats.heightPx : built.placed.reading.heightPx;
  const d = frontDistance(w, h, size);
  // the piece's centre raised to its place: at the face's plane the window spans 2·d·tan(fov/2) — `PLACE` from the top
  const up = (0.5 - PLACE[piece]) * 2 * d * Math.tan(((FRONT_FOV / 2) * Math.PI) / 180);
  // the orbit's centre: the arch's centre, at the middle of its depth (the letters run from z 0 to the depth); the radius
  // keeps the camera's start exactly where the still front stood
  const zc = (SPECS[piece].depthEm * SPECS[piece].sizePx) / 2;
  if (built.kind === "line") return { w, h, d, up, zc, curveCentre: null, crown: null };
  const c = built.placed.reading.curveCentre;
  const n = crownUnderside(built);
  return { w, h, d, up, zc, curveCentre: { x: c.x, y: up + c.y }, crown: { x: n.x, y: up + n.y } };
}

/**
 * ⛔ THE BUILD — the hooks that measure the words in the DOM, prove the font, build the piece and check the arch's
 * collisions (`lettering-hooks.tsx`), as `YourWordsCanvas` ran them; now shared with the camera bench. Render `MeasureSpans`
 * with `lines`, `spec.font` and `spans`. `failure` — the font check or a collision, in plain words; `words` — what was built.
 */
export function usePieceBuild(piece: Piece) {
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
  const failure = measured?.check.stops.length
    ? measured.check.stops.join(" ")
    : report && (report.collisions > 0 || report.tight > 0)
      ? `${report.collisions} overlapping and ${report.tight} tight pairs of letters`
      : null;
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
  return { spec, lines, spans, shown, failure, words: lines.map((l) => l.words).join(" ") };
}

/** Neutral tone mapping on the live renderer, set before anything compiles (three keys its programs on it). */
export function NeutralToneMapping() {
  const get = useThree((s) => s.get);
  useEffect(() => {
    get().gl.toneMapping = THREE.NeutralToneMapping;
  }, [get]);
  return null;
}

/** ONE PIECE, lit and drawn — the camera is the caller's (above). `onReady` after the first frame drawn with it. */
export function LetteringPiece({ piece, built, onReady }: { piece: Piece; built: Built; onReady: () => void }) {
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

  const { w, up, zc } = measurePiece(piece, built, size);
  const material = metal ? [metal.face, metal.edge] : undefined;
  return (
    <>
      {built.kind === "arch" && <ArchGrain shown={built} />}
      {piece === "line" && <SignLamps w={w} at={[0, up, 0]} />}
      {built.kind === "arch" && <AxisLamps at={[0, up, zc]} w={w} />}
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
export class Guard extends Component<{ onFailed: () => void; children: ReactNode }, { failed: boolean }> {
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
