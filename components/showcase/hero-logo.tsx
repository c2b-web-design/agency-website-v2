"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildLogoMarkGeometry, LOGO_MARK_DEFAULTS } from "@/components/about/logo-mark-geometry";
import { LOGO_ASPECT, LOGO_OUTLINE } from "@/components/about/logo-mark-outline";
import type { DeskMarkResult } from "@/components/about/desk-mark.worker";
import { loadStudioHdri, STUDIO_HDRI_SRC } from "@/lib/studio-hdri";
import { HERO_CAMERA, HERO_PAGE, HERO_SKETCH_LIGHT, HERO_TEXT_PLACE } from "./hero-page";
import { useDisposeOnUnmount } from "@/lib/use-dispose-on-unmount";
import type { AsyncCompileHandle, PmremLike } from "./bench-medium";
import { HeroLiquid, LIQUID_LENGTH } from "./hero-liquid";

/**
 * ⛔ THE HERO's LOGO ON THE BENCH (9 November 2026; D-101). Carl: *"Put a 2m logo thats facing us in the space on the right.
 * Have its bottom edge on the floor and space it out proportionately in the virwport so its looks balanced."* … *"Make the
 * logo three js and use the same geometry for it as the logo on the /about page. When we see it on the right, we will move
 * it into the lean position."*
 * - THE SAME GEOMETRY AS /about's DESK MARK: `buildLogoMarkGeometry` with `LOGO_MARK_DEFAULTS`, built off the main thread by
 *   /about's own worker (`desk-mark.worker.ts`, read, not changed — it holds the main thread ~1 s inline); inline if the
 *   worker cannot start. Only the SCALE differs (the mark's height in cm).
 * - 2 m WIDE (Carl's 2 m read as the width: the lean's length, the question it answers) → 103.9 cm tall, 7.6 cm thick
 *   (MEASURED from the mesh, 9 November 2026; a first figure, 4.9 cm, was calculated from the source units — wrong);
 *   volume 70,085 cm³ (~70 litres) — the mass the liquid phase must keep (Carl: "Is any new mass created?").
 * - FACING US: the mesh's face is +Z, the bench camera's side. Its FACE on the text's face plane (`HERO_TEXT_PLACE.face`),
 *   so on the page it is 2 px per cm, as the text is.
 * - THE BOTTOM EDGE ON THE FLOOR from the geometry's MEASURED bounds (not the outline's nominal 0).
 * - BALANCED — EQUAL GAPS (the Builder's take, Carl judges by eye): from the t of "built" to the logo = from the logo to the
 *   page frame's right edge at the text's depth.
 * - CLAY, as the text: the metal is its own step (mesh → material → light).
 */
const LOGO_WIDTH_CM = 200;
/** the blobs' red — the reference's material colour (`webgl_marchingcubes`, `shiny`) */
export const HERO_LOGO_RED = "#9c0000";
const LOGO_HEIGHT_CM = LOGO_WIDTH_CM / LOGO_ASPECT;
/** the t of "built"'s right-most ink, world X cm — ⚠ UNASSERTED: measured 9 November 2026 from the Geist Bold typeface JSON
 *  laid out as `heroTextLayout` lays it (a scratchpad script, −170.4; it lands on page x 684, as the bench draws it);
 *  nothing re-checks it if the text's layout moves. (A first reading, −56.6, scaled the glyphs by the JSON's `resolution`
 *  instead of `EM_UNITS` — 1.39× too large; the bench showed the unequal gaps.) */
const T_OF_BUILT_RIGHT = -170.4;
/** the page frame's right edge at the text's depth: the page camera's centre plus half the page, at the text plane's cm per
 *  page px (camera-to-face distance ÷ the lens's focal length in page px) — derived from the page camera, 434.5 cm */
const CM_PER_PAGE_PX = (HERO_CAMERA.z - HERO_TEXT_PLACE.face) / ((HERO_PAGE[0] * HERO_CAMERA.lensMm) / 36);
const FRAME_RIGHT = HERO_CAMERA.x + (HERO_PAGE[0] / 2) * CM_PER_PAGE_PX;
const GAP = (FRAME_RIGHT - T_OF_BUILT_RIGHT - LOGO_WIDTH_CM) / 2;
export const HERO_LOGO_PLACE = {
  centreX: T_OF_BUILT_RIGHT + GAP + LOGO_WIDTH_CM / 2,
  face: HERO_TEXT_PLACE.face,
  widthCm: LOGO_WIDTH_CM,
  heightCm: LOGO_HEIGHT_CM,
  gapCm: GAP,
} as const;

/**
 * ⛔ THE LEAN — THE OPENING POSE (9 November 2026; D-101). Carl: *"Put it in the lean position using the andle you have quoted
 * and we will see how it looks ang judge it by eye."* His sketch (`live-work/hero-concept-8-november/sketch-1-the-lean.png`):
 * on its END, c on the floor, b up against the t of "built", its TOP EDGE to the camera (*"The lean will be edge on."*), its
 * FACE to the right.
 * - THE ANGLE: 12.5° from vertical, read off the sketch — a TAKE, judged by eye.
 * - THE AXES: the mesh's +X (c → b) goes UP, tilted toward the text (−sin, cos, 0); its +Y (bottom edge → top edge) goes to
 *   the CAMERA (+Z); its +Z (the face's normal) goes RIGHT (cos, sin, 0). Right-handed: X × Y = Z.
 * - THE CONTACT: the FLAT BACK (the mesh's z 0, `about-room.ts`: "the origin is the BACK") rests on the point of the t that a
 *   plane at this angle meets first — the RIGHT TIP OF ITS CROSSBAR, X −170.45, Y 129.43 (⚠ UNASSERTED: measured 9 November
 *   2026 from the typeface JSON as `heroTextLayout` lays it, AS DRAWN — the text still floats 1.57 cm; if the text is dropped
 *   onto its y tips this Y drops by 1.57 with it). Not the stem's top: at 12.5° the crossbar's tip stands proud of it.
 * - THE FLOOR: the geometry's lowest point after the turn (the c end's corner) on Y 0, measured from the vertices.
 * - DEPTH (Z): the logo's BOTTOM edge (its far end now) flush with the text's BACK (face − 0.2 em of the headline, 8.1 cm),
 *   so it rests along the t's whole depth and runs ~104 cm toward the camera — the Builder's take.
 */
const LEAN_DEG = 12.5;
const T_CONTACT: [number, number] = [-170.45, 129.43];
const TEXT_BACK_Z = HERO_TEXT_PLACE.face - 8.124;

function useLogoGeometry(scale: number): THREE.BufferGeometry | null {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  useEffect(() => {
    let live = true;
    let id = 0;
    let worker: Worker | null = null;
    const take = (g: THREE.BufferGeometry) => {
      if (!live) return g.dispose();
      setGeometry(g);
    };
    const inline = () => {
      worker?.terminate();
      worker = null;
      id = window.setTimeout(() => take(buildLogoMarkGeometry({ ...LOGO_MARK_DEFAULTS, scale }).geometry), 0);
    };
    try {
      worker = new Worker(new URL("../about/desk-mark.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (e: MessageEvent<DeskMarkResult>) => {
        worker?.terminate();
        worker = null;
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(e.data.position, 3));
        g.setAttribute("normal", new THREE.BufferAttribute(e.data.normal, 3));
        g.setIndex(new THREE.BufferAttribute(e.data.index, 1));
        take(g);
      };
      worker.onerror = inline;
      worker.postMessage({ scale });
    } catch {
      inline();
    }
    return () => {
      live = false;
      worker?.terminate();
      window.clearTimeout(id);
    };
  }, [scale]);
  return geometry;
}

const NOTHING = { dispose: () => {} };

type Pose = { position: [number, number, number]; quaternion: THREE.Quaternion };

/** UPRIGHT, facing us, balanced in the space on the right (Carl: *"ok, the balance looks good."*, 9 November 2026) */
function uprightPose(g: THREE.BufferGeometry): Pose {
  g.computeBoundingBox();
  const b = g.boundingBox!;
  // measured bounds: the lowest point on the floor, the ink centred on `centreX`, the FACE (max Z) on the text's face
  return { position: [HERO_LOGO_PLACE.centreX - (b.min.x + b.max.x) / 2, -b.min.y, HERO_LOGO_PLACE.face - b.max.z], quaternion: new THREE.Quaternion() };
}

/**
 * ⛔ THE FACE-ON POSITION's OUTLINE (10 November 2026, session 2; Carl: *"before we made the logo lean, we plotted that
 * position on the right side on the floor. Draw an outline of the logo in that same position"*; *"face on"*). The logo
 * FACING THE CAMERA, its bottom edge on the floor, balanced in the space on the right (`uprightPose`, Carl's balance,
 * 9 November) — where the liquid will fill the invisible logo and fall to (D-101). The logo's own outline (`LOGO_OUTLINE`,
 * the one its mesh is built from, scaled by the mesh's MEASURED height), one closed line on its FACE. A guide: amber, unlit.
 */
/** `raiseCm` (Carl: *"raise it a little so that the blobs on the way to the wall go through it"*): read off the bench at
 *  4 s — the clump's centre ~89 cm up (56–123), the outline's centre 52 → raised 40 cm. ⚠ Read from a frame, not measured
 *  in code (the `__liquid.material` dev hook returned a StrictMode-dropped instance's uniforms) */
const FACE_ON_OUTLINE = { show: true, colour: "#ffb84d", raiseCm: 40 } as const;
function FaceOnOutline({ geometry }: { geometry: THREE.BufferGeometry }) {
  const line = useMemo(() => {
    geometry.computeBoundingBox();
    const b = geometry.boundingBox!;
    const h = b.max.y - b.min.y;
    const pts: number[] = [];
    for (let i = 0; i < LOGO_OUTLINE.length; i += 2) pts.push(LOGO_OUTLINE[i] * h, LOGO_OUTLINE[i + 1] * h, b.max.z);
    // closed by repeating the first point: WebGPU draws no `LineLoop`
    pts.push(pts[0], pts[1], pts[2]);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const m = new THREE.LineBasicMaterial({ color: FACE_ON_OUTLINE.colour });
    const pose = uprightPose(geometry);
    // a THREE.Line built here (JSX `<line>` is SVG's in React's types)
    const obj = new THREE.Line(g, m);
    obj.name = "hero logo face-on outline";
    obj.position.set(pose.position[0], pose.position[1] + FACE_ON_OUTLINE.raiseCm, pose.position[2]);
    obj.quaternion.copy(pose.quaternion);
    return { obj, dispose: () => (g.dispose(), m.dispose()) };
  }, [geometry]);
  useDisposeOnUnmount(line);
  return <primitive object={line.obj} />;
}

/** STANDING ON ITS END in the lean's PROFILE (Carl: *"keep the same profile"*): the lean straightened to vertical — the mesh's
 *  +X (c → b) straight UP, its +Y (bottom edge → top edge) to the CAMERA (+Z), its face (+Z) to the RIGHT (+X); the c's lowest
 *  ink on the floor; the THICKNESS centred on world X `x` (the line); its depth where the lean's is (`z`) */
function endPose(g: THREE.BufferGeometry, x: number, z: number): Pose {
  g.computeBoundingBox();
  const b = g.boundingBox!;
  const basis = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0));
  return { position: [x - (b.min.z + b.max.z) / 2, -b.min.x, z], quaternion: new THREE.Quaternion().setFromRotationMatrix(basis) };
}

/**
 * ⛔ THE JUMP — THE START (10 November 2026; D-101). Carl: *"so a visitor lands, the page loads. its as if the logo notices
 * this. it jumps up from its leaning postion and lands on the line. its the "shock" of this landing that causes the
 * blobs."* The line: *"not the blue line, the one before it"* — the grid line x = −100 cm (`JUMP.landX`).
 * ⛔ NO TURN — Carl, on take 1 (turned to face us): *"i didnt say turn it. if the blobs were too be expelled now they would
 * shoot right at us. keep the same profile."* TAKE 2: the logo's CENTRE flies a BALLISTIC arc under real gravity (981 cm/s²,
 * the world is in cm) while the body only STRAIGHTENS the lean (12.5° → vertical, within its own profile, evenly), landing
 * STANDING ON ITS END (the c) in the lean's profile (`endPose`): face to the RIGHT (the blobs leave toward the wall), top
 * edge toward us, its 7.6 cm thickness centred on the line, its edge running toward the camera along it. No crouch, no recoil.
 * ⛔ THE LANDING's WOBBLE — Carl: *"look at the desk in the /about section. the logo can have a bit of a wobble as it lands."*
 * The DESK MARK's wobble (`about-card-canvas.tsx`, `DESK_MARK_WOBBLE` and its curve, COPIED here — that file is outside
 * this chunk): a block ROCKING ON ITS BOTTOM EDGES — here SIDEWAYS on its thin end, about the line: to the right about the
 * face's bottom edge, to the left about the back's, the pivot changing side through upright; turning points 3.75°, 2.25°,
 * 1.125°, 0.5625°, each swing eased (`easeInOutSine`), the first and last half-swings half the time; 2 s. From TOUCHDOWN,
 * RIGHT first (the straightening's momentum carries its top that way). The desk's numbers as the first take.
 * On the bench: a LOOP (`JUMP`): leaning, the jump, landed. Starts only once the logo wears its reflection (the capture
 * is the LEAN's, taken at load). ⚠ DEV: `window.__heroJump` — play, at(t), and the arc's lowest corner (`minCornerCm`).
 */
const JUMP = { landX: -100, lean: 2, flight: 0.7, landed: 3, g: 981 } as const;
/** the desk mark's wobble (`DESK_MARK_WOBBLE`, 10 October 2026, approved by Carl's eye), copied: ms and turning points */
const LAND_WOBBLE = { ms: 2000, ampsDeg: [3.75, 2.25, 1.125, 0.5625] } as const;
/** the desk mark's curve (radians) `w` ms into it: its first swing NEGATIVE, eased between turning points */
function wobbleAngle(w: number): number {
  if (w < 0 || w >= LAND_WOBBLE.ms) return 0;
  const pts = [0, ...LAND_WOBBLE.ampsDeg.flatMap((a) => [-a, a]), 0];
  const shares = pts.slice(1).map((_, i) => (i === 0 || i === pts.length - 2 ? 0.5 : 1));
  let u = (w / LAND_WOBBLE.ms) * shares.reduce((a, b) => a + b, 0);
  let i = 0;
  while (i < shares.length - 1 && u > shares[i]) u -= shares[i++];
  const e = (1 - Math.cos(Math.PI * Math.min(1, u / shares[i]))) / 2;
  return THREE.MathUtils.degToRad(pts[i] + (pts[i + 1] - pts[i]) * e);
}
type JumpDev = { play(on: boolean): void; at(t: number): void; stats: { apexCm: number; minCornerCm: number; distanceCm: number; turnDeg: number } | null };

type JumpPlan = { c: THREE.Vector3; q0: THREE.Quaternion; q1: THREE.Quaternion; c0: THREE.Vector3; c1: THREE.Vector3; vy: number };
/** the pose at time s into the flight (0 → T): the centre on its ballistic arc, the body turned evenly about it */
function jumpPoseAt(plan: JumpPlan, s: number, outQ: THREE.Quaternion, outP: THREE.Vector3) {
  const T = JUMP.flight;
  const u = Math.min(1, Math.max(0, s / T));
  const tt = u * T;
  outQ.slerpQuaternions(plan.q0, plan.q1, u);
  outP.lerpVectors(plan.c0, plan.c1, u);
  outP.y = plan.c0.y + plan.vy * tt - (JUMP.g * tt * tt) / 2;
  outP.sub(plan.c.clone().applyQuaternion(outQ));
}

/** ⛔ THE JUMP's CLOCK IS THE HERO's (10 November 2026, session 2): the liquid reads it (`HeroLiquid`), so the landing's
 *  shock and the expulsion cannot drift apart. Advanced HERE only. The loop's landed phase runs `landedS` (the liquid's
 *  length while it is on). `poseAt` — the logo's pose at any time on it — is what the field logo follows */
type JumpClock = { current: { playing: boolean; t: number } };
type Jump = { touchdown: number; settled: number; landed: Pose; poseAt(t: number, outQ: THREE.Quaternion, outP: THREE.Vector3): void };

/** ⛔ THE LIQUID's HOLD (10 November 2026, session 2; the async-compile plan v1.2): written by the liquid EVERY frame —
 *  while `hold`, the clock is clamped at `settled` BEFORE it crosses (never stepped back), the logo standing after its
 *  wobble until the liquid's pipeline is ready (Carl: the extra beat accepted, up to 1 s) */
export type JumpHold = { current: { hold: boolean } };

function useJump(mesh: THREE.Mesh | null, g: THREE.BufferGeometry | null, from: Pose | null, on: boolean, clockRef: JumpClock, landedS: number, holdRef: JumpHold): Jump | null {
  const plan = useMemo(() => {
    if (!g || !from) return null;
    g.computeBoundingBox();
    const b = g.boundingBox!;
    const c = b.getCenter(new THREE.Vector3());
    const to = endPose(g, JUMP.landX, from.position[2]);
    const q0 = from.quaternion.clone();
    const q1 = to.quaternion.clone();
    const c0 = new THREE.Vector3(...from.position).add(c.clone().applyQuaternion(q0));
    const c1 = new THREE.Vector3(...to.position).add(c.clone().applyQuaternion(q1));
    const T = JUMP.flight;
    const vy = (c1.y - c0.y + (JUMP.g * T * T) / 2) / T;
    const corners = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => new THREE.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z));
    // the landed pose and its two rocking edges (local): the c's lowest ink (x min) on the FACE (z max, world right) and on
    // the BACK (z min, world left); the rock is about world Z (the line), so their y does not matter
    const landPos = new THREE.Vector3(...to.position);
    const front = new THREE.Vector3(b.min.x, c.y, b.max.z);
    const back = new THREE.Vector3(b.min.x, c.y, b.min.z);
    return { c, q0, q1, c0, c1, vy, corners, landPos, front, back, to };
  }, [g, from]);
  const jump = useMemo<Jump | null>(() => {
    if (!plan) return null;
    const k = new THREE.Vector3();
    const z = new THREE.Vector3(0, 0, 1);
    const r = new THREE.Quaternion();
    return {
      touchdown: JUMP.lean + JUMP.flight,
      settled: JUMP.lean + JUMP.flight + LAND_WOBBLE.ms / 1000,
      landed: plan.to,
      poseAt(t, outQ, outP) {
        const s = t - JUMP.lean;
        if (s < JUMP.flight) return jumpPoseAt(plan, s, outQ, outP);
        // landed: the rock SIDEWAYS about the line (world Z), on the bottom edge it leans onto — RIGHT first (+ = its top
        // to the right, onto the face's edge); the pivot stays where it stands
        const th = -wobbleAngle((s - JUMP.flight) * 1000);
        const pivot = th >= 0 ? plan.front : plan.back;
        r.setFromAxisAngle(z, -th);
        outQ.copy(r).multiply(plan.q1);
        outP.copy(pivot).applyQuaternion(plan.q1).add(plan.landPos);
        outP.sub(k.copy(pivot).applyQuaternion(outQ));
      },
    };
  }, [plan]);
  const tmp = useMemo(() => ({ q: new THREE.Quaternion(), p: new THREE.Vector3() }), []);
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !plan) return;
    // the arc's numbers, sampled: its apex above the start's centre, the lowest bounding-box corner over the flight
    let minY = Infinity;
    let apex = -Infinity;
    const q = new THREE.Quaternion();
    const p = new THREE.Vector3();
    for (let i = 0; i <= 200; i++) {
      const s = (i / 200) * JUMP.flight;
      jumpPoseAt(plan, s, q, p);
      apex = Math.max(apex, p.clone().add(plan.c.clone().applyQuaternion(q)).y);
      for (const k of plan.corners) minY = Math.min(minY, k.clone().applyQuaternion(q).add(p).y);
    }
    const d: JumpDev = {
      play: (v) => void (clockRef.current.playing = v),
      at: (t) => {
        clockRef.current.playing = false;
        clockRef.current.t = t;
      },
      stats: { apexCm: +(apex - plan.c0.y).toFixed(1), minCornerCm: +minY.toFixed(2), distanceCm: +plan.c0.distanceTo(plan.c1).toFixed(1), turnDeg: +((plan.q0.angleTo(plan.q1) * 180) / Math.PI).toFixed(1) },
    };
    (window as unknown as { __heroJump?: JumpDev }).__heroJump = d;
  }, [plan, clockRef]);
  useFrame((_, delta) => {
    if (!on || !mesh || !jump) return;
    const L = JUMP.lean + JUMP.flight + landedS;
    if (clockRef.current.playing) {
      const t0 = clockRef.current.t;
      let t = t0 + Math.min(delta, 0.1);
      if (holdRef.current.hold && t0 <= jump.settled) t = Math.min(t, jump.settled);
      clockRef.current.t = t % L;
    }
    jump.poseAt(clockRef.current.t, tmp.q, tmp.p);
    mesh.quaternion.copy(tmp.q);
    mesh.position.copy(tmp.p);
  });
  return jump;
}

/** THE LEAN (above): the turn, then the origin solved from the floor and the contact */
function leanPose(g: THREE.BufferGeometry): Pose {
  const a = (LEAN_DEG * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const basis = new THREE.Matrix4().makeBasis(new THREE.Vector3(-s, c, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(c, s, 0));
  // world Y of a vertex, relative to the origin = c·x + s·z (the X and Z axes' Y parts); the lowest goes on the floor
  const p = g.getAttribute("position");
  let low = Infinity;
  for (let i = 0; i < p.count; i++) low = Math.min(low, c * p.getX(i) + s * p.getZ(i));
  const oy = -low;
  // the back plane (normal (c, s, 0) through the origin) passes through the contact: c(Kx − Ox) + s(Ky − Oy) = 0
  const ox = T_CONTACT[0] + (s / c) * (T_CONTACT[1] - oy);
  return { position: [ox, oy, TEXT_BACK_Z], quaternion: new THREE.Quaternion().setFromRotationMatrix(basis) };
}

/**
 * ⛔ THE LOGO's METAL — THE BUTTON FAMILY's, IN THE BLOBS' RED (9 November 2026; D-101). Carl, on the home page's teal button:
 * *"this is what im after- a red version of this"*; *"yes, go that way."* The family's recipe (`WHOWEARE_LOOK`,
 * `whoweare-button-scene.tsx`; R-045, R-058) exactly, only the colour changed:
 * - THE COLOUR AS THE METAL's F0, PAINTED ON: the blobs' #9c0000 (the reference's `shiny`). No real metal is red (copper's
 *   F0 is orange-pink), so red takes the TEAL's route — a chosen colour — not the gold's (the desk mark's measured gold F0).
 *   At F0 linear ≈ 0.33 / 0 / 0 it is a DARK metal (luminance ~0.07; the teal ~0.35, the gold ~0.8), as the blobs read.
 * - METALNESS 1, ROUGHNESS 0.4 (Carl's pick on the teal's ramp: *"closer without becoming too dark and it still showing
 *   metalness"*).
 * - THE STUDIO's REFLECTION: the family's HDRI (`monochrome_studio_02`), strength 1, its room darkened to 0.1, turned 150°
 *   (the dark side behind the words on the buttons) — prefiltered by the medium's own PMREM generator (the seam's `pmrem`).
 * - The family's LAMPS (the clay's and the moving one) are NOT here: light is its own chunk; the logo stands under the
 *   bench's two sketch lights. ⚠ If it reads too dark, the teal's method: step the metalness and roughness, don't guess.
 * - NEXT (Carl's plan, step 3): the glowing TEXT in the reflection — `structural-note-hero-logo-reflection-9-november.md`.
 */
export const HERO_LOGO_METAL = { metalness: 1, roughness: 0.4, envMapIntensity: 1, room: 0.1, yawDeg: 150 } as const;

/** the family's studio, prefiltered for THIS renderer — made a task after the HDRI arrives, disposed a task late on a real
 *  unmount or replacement (`useDisposeOnUnmount`: the 5 November StrictMode rule — WebGPU must never draw a destroyed one) */
function useFamilyStudio(pmrem: ((gl: unknown) => PmremLike) | undefined): { texture: THREE.Texture; dispose(): void } | null {
  const gl = useThree((s) => s.gl);
  const [env, setEnv] = useState<{ texture: THREE.Texture; dispose(): void } | null>(null);
  useEffect(() => {
    if (!pmrem) return;
    let live = true;
    loadStudioHdri(STUDIO_HDRI_SRC, HERO_LOGO_METAL.room).then((hdri) => {
      if (!live) return;
      const gen = pmrem(gl);
      const target = gen.fromEquirectangular(hdri);
      setEnv({ texture: target.texture, dispose: () => (target.dispose(), gen.dispose()) });
    });
    return () => {
      live = false;
    };
  }, [gl, pmrem]);
  useDisposeOnUnmount(env ?? NOTHING);
  return env;
}

/** what the logo reflects besides the studio: the TEXT, as second meshes sharing its geometry and material */
export type HeroReflect = { geometries: THREE.BufferGeometry[]; material: THREE.Material };
/** ⚠ DEV controls. ⛔ The step-1 switch (`mode: "equirect"`) was REMOVED 9 November 2026, session 3 (Carl: *"remove it"*):
 *  it showed the lamps alone, not step 1's studio (D-101, *"COMMITTED STEP 1 IS SOUND"*; cause not found). The null
 *  control's reference is now committed step 1's own frame, kept as a file (`hero-reflection-measure-9-november.mjs`) */
type ReflectOpts = { text: boolean; yawDeg: number };
type ReflectionDev = {
  captures: number;
  skips: number;
  giveUps: number;
  firstMs: number | null;
  lastMs: number | null;
  opts: ReflectOpts;
  set(o: Partial<ReflectOpts>): void;
  view(): Promise<{ w: number; h: number; data: number[] } | null>;
};
/** the capture's resolution, range and retries — the reflection note v1.7: 256 (the step-1 prefilter's), near 1 cm and
 *  far 100 m ([R7-1]: the defaults, 0.1 and 100, clip everything past 1 m in this cm world), at most 10 frames' wait ([R9-2]) */
const CAPTURE = { size: 256, near: 1, far: 10000, maxTries: 10 } as const;

/**
 * ⛔ THE LOGO's REFLECTION — THE STUDIO AND THE GLOWING TEXT (9 November 2026, session 2; `live-work/structural-note-hero-
 * logo-reflection-9-november.md` v1.7, cleared by the Architect in review 9; Carl: *"It would be more realistic if we could
 * show the glowing text in it"*). ONE `PMREMGenerator.fromScene` capture at the logo's centre, of a REFLECTION SCENE:
 * - the family HDRI as its BACKGROUND (the same texture step 1 prefilters), turned 150° on `backgroundRotation` — the
 *   capture is made in WORLD orientation, so the logo's `envMapRotation` is 0 (finding 2; the signs agree, review 9);
 * - the TEXT, second meshes sharing its geometry and material (never the logo itself — no self-reflection);
 * - the text's LIGHTS, copied from `HERO_SKETCH_LIGHT` (finding 1), under ONE root whose matrix is the logo's parent's,
 *   `matrixAutoUpdate` OFF ([R9-1]: `render()` would otherwise rebuild it to identity).
 * ⛔ RUN BETWEEN FRAMES (a task), guarded: the renderer must hold no target and no MRT, or the capture waits a frame — at
 * most 10, then GIVES UP; skips and give-ups counted apart ([R8-2], [R9-2]). Retaken when the pose (the body's centre)
 * moves, never per frame. ⛔ WebGPU only: `reflect` is given only by the hero's WebGPU part (the slot); without it the
 * logo keeps step 1's studio. ⚠ DEV: `window.__heroReflection` — the counts, `set()` for the controls (text off; the yaw),
 * `view()` for what the logo "sees" (measurement 2).
 */
function useReflection(pmrem: ((gl: unknown) => PmremLike) | undefined, reflect: HeroReflect | undefined, mesh: THREE.Mesh | null, opts: ReflectOpts, devRef: { current: ReflectionDev | null }) {
  const gl = useThree((s) => s.gl);
  const [hdri, setHdri] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!reflect) return;
    let live = true;
    loadStudioHdri(STUDIO_HDRI_SRC, HERO_LOGO_METAL.room).then((t) => live && setHdri(t));
    return () => {
      live = false;
    };
  }, [reflect]);
  const built = useMemo(() => {
    if (!reflect || !hdri) return null;
    const scene = new THREE.Scene();
    scene.background = hdri;
    scene.backgroundIntensity = HERO_LOGO_METAL.envMapIntensity;
    scene.backgroundRotation.set(0, (opts.yawDeg * Math.PI) / 180, 0);
    const root = new THREE.Group();
    root.matrixAutoUpdate = false;
    const { hemi, dir } = HERO_SKETCH_LIGHT;
    root.add(new THREE.HemisphereLight(hemi.sky, hemi.ground, hemi.intensity));
    const d = new THREE.DirectionalLight(0xffffff, dir.intensity);
    d.position.set(...dir.position);
    root.add(d);
    if (opts.text) for (const g of reflect.geometries) root.add(new THREE.Mesh(g, reflect.material));
    scene.add(root);
    return { scene, root };
  }, [reflect, hdri, opts.yawDeg, opts.text]);
  // the generator and its target, reused on every recapture; disposed a task late on a real unmount
  const holder = useMemo(() => {
    const h = {
      gen: null as PmremLike | null,
      target: null as { texture: THREE.Texture; dispose(): void } | null,
      dispose() {
        h.target?.dispose();
        h.gen?.dispose();
      },
    };
    return h;
  }, []);
  useDisposeOnUnmount(holder);
  const [env, setEnv] = useState<THREE.Texture | null>(null);
  const centreRef = useRef<THREE.Vector3 | null>(null);
  useEffect(() => {
    if (!built || !mesh || !pmrem) return;
    let live = true;
    let tries = 0;
    let timer = 0;
    const attempt = () => {
      if (!live) return;
      const dev = devRef.current;
      const r = gl as unknown as { getRenderTarget(): unknown; getMRT?(): unknown };
      if (r.getRenderTarget() !== null || (r.getMRT?.() ?? null) !== null) {
        if (dev) dev.skips++;
        if (++tries >= CAPTURE.maxTries) {
          if (dev) dev.giveUps++;
          return;
        }
        timer = window.setTimeout(() => requestAnimationFrame(() => attempt()), 0);
        return;
      }
      mesh.updateWorldMatrix(true, false);
      built.root.matrix.copy(mesh.parent ? mesh.parent.matrixWorld : new THREE.Matrix4());
      built.root.matrixWorldNeedsUpdate = true;
      const centre = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
      centreRef.current = centre;
      holder.gen ??= pmrem(gl);
      const t0 = performance.now();
      holder.target = holder.gen.fromScene(built.scene, 0, CAPTURE.near, CAPTURE.far, { size: CAPTURE.size, position: centre, renderTarget: holder.target ?? undefined });
      const ms = performance.now() - t0;
      if (dev) {
        dev.captures++;
        dev.lastMs = ms;
        dev.firstMs ??= ms;
      }
      setEnv(holder.target.texture);
    };
    timer = window.setTimeout(attempt, 0);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [built, mesh, pmrem, gl, holder, devRef]);
  // measurement 2: what the logo "sees" — the reflection scene from the capture's point, 90° toward the text (−x), RGBA8
  useEffect(() => {
    const dev = devRef.current;
    if (!dev) return;
    dev.view = async () => {
      const c = centreRef.current;
      if (!built || !c) return null;
      const rt = new THREE.RenderTarget(512, 512);
      const cam = new THREE.PerspectiveCamera(90, 1, CAPTURE.near, CAPTURE.far);
      cam.position.copy(c);
      cam.lookAt(c.x - 1, c.y, c.z);
      cam.updateMatrixWorld();
      const r = gl as unknown as { setRenderTarget(t: unknown): void; render(s: THREE.Scene, c: THREE.Camera): void; readRenderTargetPixelsAsync(t: unknown, x: number, y: number, w: number, h: number): Promise<ArrayLike<number>> };
      r.setRenderTarget(rt);
      r.render(built.scene, cam);
      r.setRenderTarget(null);
      const px = await r.readRenderTargetPixelsAsync(rt, 0, 0, 512, 512);
      rt.dispose();
      return { w: 512, h: 512, data: Array.from(px) };
    };
  }, [devRef, built, gl, reflect]);
  return reflect ? env : null;
}

/** the logo on the bench — mounted in the hero's scene beside `HeroText`, lit by `HeroSketchLight` and the family's
 *  studio (`pmrem`, the medium's). `pose`: the LEAN (the opening, the default) or UPRIGHT (where it stood first, balanced —
 *  kept, Carl approved the balance). `reflect` (WebGPU only, the hero's part): the studio comes from the REFLECTION capture,
 *  the glowing text in it */
export function HeroLogo({ pose = "lean", pmrem, asyncCompile, onReady, reflect, liquid }: { pose?: "lean" | "upright" | "jump"; pmrem?: (gl: unknown) => PmremLike; asyncCompile?: (gl: unknown, material: THREE.Material) => AsyncCompileHandle; onReady?: () => void; reflect?: HeroReflect | null; liquid?: () => THREE.Material }) {
  const geometry = useLogoGeometry(LOGO_HEIGHT_CM);
  const geo = useMemo(() => (geometry ? { geometry, dispose: () => geometry.dispose() } : null), [geometry]);
  useDisposeOnUnmount(geo ?? NOTHING);
  // ⚠ DEV: the reflection's controls and counts (`window.__heroReflection`) — the controls default to the design
  const [opts, setOpts] = useState<ReflectOpts>({ text: true, yawDeg: HERO_LOGO_METAL.yawDeg });
  // the counts live in a REF (mutable by design): they survive a control change and are written between frames
  const devRef = useRef<ReflectionDev | null>(null);
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !reflect) return;
    const d: ReflectionDev = { captures: 0, skips: 0, giveUps: 0, firstMs: null, lastMs: null, opts: { text: true, yawDeg: HERO_LOGO_METAL.yawDeg }, set: (o) => setOpts((p) => ({ ...p, ...o })), view: async () => null };
    devRef.current = d;
    (window as unknown as { __heroReflection?: ReflectionDev }).__heroReflection = d;
  }, [reflect]);
  useEffect(() => {
    if (devRef.current) devRef.current.opts = opts;
  }, [opts]);
  const [mesh, setMesh] = useState<THREE.Mesh | null>(null);
  // the same mesh as a REF, for the liquid's per-frame visibility switch
  const meshRef = useRef<THREE.Mesh | null>(null);
  const onMesh = useCallback((m: THREE.Mesh | null) => {
    meshRef.current = m;
    setMesh(m);
  }, []);
  // the liquid's field draws the logo while it runs: the mesh is HIDDEN then, never unmounted (the note v1.5) — by the
  // liquid itself, in the frame the field shows (session 2; was a state here, a React render late)
  const reflected = useReflection(pmrem, reflect ?? undefined, mesh, opts, devRef);
  // step 1's studio — where there is no reflection (WebGL)
  // ⛔ NO STAND-IN (10 November 2026, session 2; Carl: *"when the logo does finally appear on its far edge there is a light
  // and then its darker. its very noticable"*). FILMED on a cold load (`hero-cold-load-film-10-november.mjs`): the logo
  // showed step 1's studio (the text not yet built, so no capture) and ~1 s later its live reflection, darker. Now
  // `reflect === null` means a reflection is COMING (the WebGPU part is loaded): no studio is made, the solid stays HIDDEN
  // and the logo is not READY until the reflection is on it (the solid shows only once `reflected` is on its material —
  // the text being built is not enough: the capture follows it). `undefined` (WebGL): step 1's studio, as before
  const studio = useFamilyStudio(reflect !== undefined ? undefined : pmrem);
  // the material on its own life: a new one when the studio arrives, the old disposed a task later — never the geometry
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: HERO_LOGO_RED, metalness: HERO_LOGO_METAL.metalness, roughness: HERO_LOGO_METAL.roughness });
    if (reflected) {
      // the reflection capture is in WORLD orientation (the turn is on its background): no rotation here
      m.envMap = reflected;
      m.envMapIntensity = HERO_LOGO_METAL.envMapIntensity;
    } else if (studio) {
      m.envMap = studio.texture;
      m.envMapIntensity = HERO_LOGO_METAL.envMapIntensity;
      m.envMapRotation.set(0, (HERO_LOGO_METAL.yawDeg * Math.PI) / 180, 0);
    }
    // ⛔ THE ENV TEXTURE's IDENTITY IN THE PROGRAM CACHE KEY (10 November 2026; D-101, "THE STALE REFLECTION"). three r185's
    // WebGPU renderer caches a built program by a key that records a texture's KIND (mapping, filters, wrapping), not WHICH
    // texture (`RenderObject.getMaterialCacheKey`), and `EnvironmentNode` fixes the env texture into the program when it is
    // built. Step 1's studio and the reflection capture are the same kind (CubeUV PMREMs): when the studio arrived before the
    // text was built (a load race), the reflection's material REUSED the studio's program and drew the studio, unturned,
    // for good — the "two states by load", deaf to a recapture. three's own hook keys the program on the texture instead.
    // Also guards every later swap (D1-a's landing capture).
    const envKey = `hero-logo-env:${m.envMap ? m.envMap.uuid : "none"}`;
    m.customProgramCacheKey = () => envKey;
    return m;
  }, [studio, reflected]);
  useDisposeOnUnmount(material);
  // ⚠ DEV: which env each logo material was built with, in order (`window.__heroLogoEnvs`) — the race's evidence
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const w = window as unknown as { __heroLogoEnvs?: string[] };
    (w.__heroLogoEnvs ??= []).push(reflected ? "reflection" : studio ? "studio" : "none");
  }, [material, reflected, studio]);
  const placed = useMemo(() => (geometry ? (pose === "upright" ? uprightPose(geometry) : leanPose(geometry)) : null), [geometry, pose]);
  // ⛔ READY (9 November 2026, session 2; the workshop note v2.1 [R10-4]): the geometry from /about's worker AND, where the
  // medium prefilters one, the studio (or the reflection) on the material. The bench's "drawn" waits for it
  const ready = !!placed && (!pmrem || !!studio || !!reflected);
  useEffect(() => {
    if (ready) onReady?.();
  }, [ready, onReady]);
  // ⛔ THE JUMP (the start): from the lean, once the logo is ready — the lean's capture is taken first. Its clock is the
  // liquid's too; with the liquid on, the landed phase runs the wobble, then the liquid's length (the expulsion starts
  // once the wobble has played: `settled`)
  const clockRef = useRef({ playing: true, t: 0 });
  const holdRef = useRef({ hold: false });
  const liquidOn = !!liquid && !!reflected && pose === "jump";
  const jump = useJump(mesh, geometry, pose === "jump" ? placed : null, pose === "jump" && ready, clockRef, liquidOn ? LAND_WOBBLE.ms / 1000 + LIQUID_LENGTH : JUMP.landed, holdRef);
  if (!geometry || !placed) return null;
  return (
    <>
      <mesh ref={onMesh} name="hero logo" geometry={geometry} material={material} position={placed.position} quaternion={placed.quaternion} visible={reflect === undefined || !!reflected} />
      {/* ⚠ THE LIQUID (`hero-liquid.tsx`, 10 November 2026): ONE field — the logo, the ten blobs, the wall — from the
          LANDING (session 2: on the jump's clock, out of the landed logo), only once the logo wears its reflection (the
          field copies the real one). ⛔ With the jump only (`pose="jump"`) */}
      {FACE_ON_OUTLINE.show && <FaceOnOutline geometry={geometry} />}
      {liquidOn && jump && mesh && <HeroLiquid make={liquid} logoMaterial={material} logoGeometry={geometry} landed={jump.landed} logoMeshRef={meshRef} clockRef={clockRef} start={jump.settled} poseAt={jump.poseAt} asyncCompile={asyncCompile} holdRef={holdRef} />}
    </>
  );
}
