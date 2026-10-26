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
 *   PASS 3: viewport 1's static light is BUILT and APPROVED (`SignLamps`, R-092). Viewport 2's travelling light is PARKED
 *   (Carl, 26 October); in its place the CAMERA moves (`Journey`) under lamps on the orbit's axis (`AxisLamps`).
 *   ⚠ Was, 23 October: "PASS 3 IS NOT BUILT: viewport 1's static light, viewport 2's travelling light and the logo's animation".
 * - ⛔ FRAMES: `frameloop="demand"` — a frame when something changes, then nothing. The line is still. The arch's journey
 *   mounts the family `Ticker` (frames only while on screen — `whoweare-button-scene.tsx`); `?cam=0` or `?t=` keep it still.
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
import { Ticker } from "@/components/home/whoweare-button-scene";
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

/**
 * ⛔ VIEWPORT 2's CAMERA — THE JOURNEY (Carl, 26 October 2026, after learning the camera can move — D-098, D-101): *"The
 * camera can start face on and orbit the object. When it reaches the same position but at the back, try flying it through
 * the arch. as it goes through have the camera turn to face the object as move backwards to its original position."*
 * The travelling light is PARKED (Carl, the same day).
 *
 * One loop, time-driven, its clock running ONLY while frames are drawn (on screen — the family `Ticker`), so the journey
 * resumes where it was left rather than jumping:
 *   HOLD face-on → ORBIT 180° about the arch's vertical axis (through its centre and the middle of its depth) to the same
 *   distance behind → REST → FLY through the opening at the CENTRE OF THE CURVE (`reading.curveCentre`), dipping to its
 *   height at the crossing, passing DIRECTLY UNDER THE CROWN LETTER (the N); it comes out facing the arch and backs away
 *   to the start.
 * ⛔ THE TURN IS A TILT (Carl, take 3): *"As it approaches the arch/doorway from behind there will come a point when the
 *   letters are out of view. so as it approaches, tilt the camera upwards to focus on the underside of the N and then as its
 *   immediately underneath the N reverse the process so the camera then is essentially backing away from the object and
 *   tilting back to its horizontal position as other letters come into view."* So the camera AIMS: level at the arch's
 *   centre, then — from the distance at which the N would leave the top of a level frame — its aim slides up to the N's
 *   underside, straight up as it passes beneath; out the other side the aim slides back down to the centre.
 *   ⛔ THE 180° IS SPENT WHERE IT CANNOT BE SEEN AS A PAN: facing the back on the way in and the front on the way out
 *   needs a half turn, and it is made ONLY while the camera looks almost straight up (pitch ≥ `spinAboveDeg`) — so on
 *   screen it is the N's underside turning in place overhead, not a sideways swing. The orbit turns the camera 180° and
 *   this turn another 180° the SAME way — one full turn per loop, so the loop closes on the first frame. (A 180° slerp
 *   takes the "shortest" way, undefined at exactly 180° — the angles are driven directly, rotation order YXZ.)
 * ⚠ THE BUILDER's PRESENTATION CHOICES, stated (Carl set the path and the tilt, not the pace): the durations below,
 *   smootherstep eases on every move, the drift through the doorway (`drift`), where the tilt begins (`tiltFrom`), the
 *   spin threshold. Carl's to change.
 * Switches: `?cam=0` the still front (as before); `?t=` frozen at that many seconds into the loop (stills, captures).
 * Reduced motion: the still front.
 */
// TAKE 1 turned by PANNING after the crossing (45–85% of the flight) and looked out into empty space for ~2 s, a black
// frame; TAKE 2 centred the pan on the doorway and slowed the flight through it — still black but for the instant the pan
// faced a leg: at the 30° lens the opening's middle is empty and the legs stand ~230 px either side, out of frame.
// TAKE 3 is Carl's tilt (above). `drift`: how much of the flight's straight-line speed is taken out at the crossing
// (0 none; 1 a full stop under the N) — 0.95 so it LINGERS beneath the N while the overhead turn is made.
// `tiltFrom`: the tilt begins this many times the distance at which the N's underside would leave a level frame's top.
// ⛔ APPROVED (R-093, *"Yes, its approved"*): take 3 — the journey AND its light (`AxisLamps`) as below. Carl: *"This looks so
// good an both unlocks and unleashes bags of potential. To be used both sparingly and appropriately."*
const JOURNEY = { hold: 3, orbit: 12, rest: 1.5, fly: 14, drift: 0.95, tiltFrom: 1.3, spinAboveDeg: 80 };
const JOURNEY_S = JOURNEY.hold + JOURNEY.orbit + JOURNEY.rest + JOURNEY.fly;
const ease = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (6 * x - 15) + 10);
};
/** smoothstep — the flight's clock: gentler at the crossing than smootherstep, so the turn is not a whip */
const easeSoft = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
type Pose = { x: number; y: number; z: number; yaw: number; pitch: number };
/** The camera at `t` s into the loop: its position, its turn about the vertical (three's `rotation.y`; 0 looks −z) and its
 *  tilt (`rotation.x`; + looks up). `r` the orbit's radius, `zc` the depth's middle, `cy` the curve centre's height, `n` the
 *  N's underside (its middle) — layout px, the arch's centre at (0, 0, zc). */
export function journeyPose(t: number, r: number, zc: number, cy: number, n: { x: number; y: number }): Pose {
  const J = JOURNEY;
  let u = ((t % JOURNEY_S) + JOURNEY_S) % JOURNEY_S;
  if (u < J.hold) return { x: 0, y: 0, z: zc + r, yaw: 0, pitch: 0 };
  u -= J.hold;
  if (u < J.orbit) {
    const th = Math.PI * ease(u / J.orbit);
    return { x: r * Math.sin(th), y: 0, z: zc + r * Math.cos(th), yaw: th, pitch: 0 };
  }
  u -= J.orbit;
  if (u < J.rest) return { x: 0, y: 0, z: zc - r, yaw: Math.PI, pitch: 0 };
  u -= J.rest;
  const s = easeSoft(u / J.fly);
  // −1 behind → 0 under the N → +1 at the start; the cubic share slows it through the doorway without stopping it
  const c = 2 * s - 1;
  const f = (1 - J.drift) * c + J.drift * c * c * c;
  const bump = Math.sin(Math.PI * s);
  // the path: dipping to the curve centre's height, sliding sideways to pass directly beneath the N
  const x = n.x * bump, y = cy * bump, z = zc + r * f;
  const hd = Math.abs(z - zc);
  // ⛔ THE AIM: level at the arch's centre (0, 0) far out; the N's underside within `tiltFrom` × the distance at which it
  // would leave a level frame's top — the slide eased, so the tilt starts gently
  const half = Math.tan(((FRONT_FOV / 2) * Math.PI) / 180);
  const reach = Math.min(0.8 * r, (J.tiltFrom * Math.max(1, n.y - y)) / half);
  const w = ease(1 - hd / reach);
  const aimY = w * n.y;
  const pitch = Math.atan2(aimY - y, Math.max(hd, 1e-3));
  // ⛔ THE HALF TURN, made only while the camera looks nearly straight up: over the stretch where the N is above
  // `spinAboveDeg`, signed by which side of the arch the camera is on
  const spinHalf = Math.max(1, (n.y - y) / Math.tan((J.spinAboveDeg * Math.PI) / 180));
  const k = ease(0.5 + (z - zc) / (2 * spinHalf));
  return { x, y, z, yaw: Math.PI + Math.PI * k, pitch };
}
function readJourney(): { on: boolean; frozen: number | null } {
  const q = new URLSearchParams(window.location.search);
  const t = q.get("t");
  const still = q.get("cam") === "0" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return { on: !still, frozen: t !== null && Number.isFinite(Number(t)) ? Number(t) : null };
}

/** Drives the default camera along the journey once the arch is drawn (`running`) — `journeyPose`'s arguments. */
function Journey({ running, r, zc, cy, n, frozen }: {
  running: boolean;
  r: number;
  zc: number;
  cy: number;
  n: { x: number; y: number };
  frozen: number | null;
}) {
  const clock = useRef(0);
  useFrame((st, delta) => {
    if (!running) return;
    // ⚠ the clock advances only on drawn frames, and never by more than a frame's worth — no jump after time off screen
    if (frozen === null) clock.current += Math.min(delta, 0.05);
    const p = journeyPose(frozen ?? clock.current, r, zc, cy, n);
    st.camera.position.set(p.x, p.y, p.z);
    // YXZ: turn about the vertical first, then tilt — the tilt stays a tilt whichever way the camera faces
    st.camera.rotation.set(p.pitch, p.yaw, 0, "YXZ");
    st.camera.updateMatrixWorld();
  });
  return null;
}

/** The crown letter's underside — the arch letter whose lowest ink stands highest (the N) — its middle, layout px. */
function crownUnderside(built: { placed: ArchPlaced; letters: ArchLetters }): { x: number; y: number } {
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
  const [journey] = useState(readJourney);
  // the orbit's centre: the arch's centre, at the middle of its depth (the letters run from z 0 to the depth); the radius
  // keeps the camera's start exactly where the still front stood
  const zc = (SPECS[piece].depthEm * SPECS[piece].sizePx) / 2;
  const moving = piece === "arch" && journey.on;
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, d]} fov={FRONT_FOV} near={1} far={d * 10} />
      {built.kind === "arch" && <ArchGrain shown={built} />}
      {piece === "line" && <SignLamps w={w} at={[0, up, 0]} />}
      {built.kind === "arch" && <AxisLamps at={[0, up, zc]} w={w} />}
      {moving && built.kind === "arch" && (
        <>
          {journey.frozen === null && <Ticker />}
          <Journey
            running={linked}
            r={d - zc}
            zc={zc}
            cy={up + built.placed.reading.curveCentre.y}
            n={(({ x, y }) => ({ x, y: up + y }))(crownUnderside(built))}
            frozen={journey.frozen}
          />
        </>
      )}
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
