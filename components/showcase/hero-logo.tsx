"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { buildLogoMarkGeometry, LOGO_MARK_DEFAULTS } from "@/components/about/logo-mark-geometry";
import { LOGO_ASPECT } from "@/components/about/logo-mark-outline";
import type { DeskMarkResult } from "@/components/about/desk-mark.worker";
import { HERO_CAMERA, HERO_PAGE, HERO_TEXT_PLACE, useDisposeOnUnmount } from "./hero-page";

/**
 * ⛔ THE HERO's LOGO ON THE BENCH (9 November 2026; D-101). Carl: *"Put a 2m logo thats facing us in the space on the right.
 * Have its bottom edge on the floor and space it out proportionately in the virwport so its looks balanced."* … *"Make the
 * logo three js and use the same geometry for it as the logo on the /about page. When we see it on the right, we will move
 * it into the lean position."*
 * - THE SAME GEOMETRY AS /about's DESK MARK: `buildLogoMarkGeometry` with `LOGO_MARK_DEFAULTS`, built off the main thread by
 *   /about's own worker (`desk-mark.worker.ts`, read, not changed — it holds the main thread ~1 s inline); inline if the
 *   worker cannot start. Only the SCALE differs (the mark's height in cm).
 * - 2 m WIDE (Carl's 2 m read as the width: the lean's length, the question it answers) → 103.9 cm tall, 4.9 cm thick.
 * - FACING US: the mesh's face is +Z, the bench camera's side. Its FACE on the text's face plane (`HERO_TEXT_PLACE.face`),
 *   so on the page it is 2 px per cm, as the text is.
 * - THE BOTTOM EDGE ON THE FLOOR from the geometry's MEASURED bounds (not the outline's nominal 0).
 * - BALANCED — EQUAL GAPS (the Builder's take, Carl judges by eye): from the t of "built" to the logo = from the logo to the
 *   page frame's right edge at the text's depth.
 * - CLAY, as the text: the metal is its own step (mesh → material → light).
 */
const LOGO_WIDTH_CM = 200;
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

/** the logo on the bench, in clay — mounted in the blank canvas's group beside `HeroText`, lit by `HeroSketchLight`.
 *  `pose`: the LEAN (the opening, the default) or UPRIGHT (where it stood first, balanced — kept, Carl approved the balance) */
export function HeroLogo({ pose = "lean" }: { pose?: "lean" | "upright" }) {
  const geometry = useLogoGeometry(LOGO_HEIGHT_CM);
  const built = useMemo(() => {
    if (!geometry) return null;
    const material = new THREE.MeshStandardMaterial({ color: "#9a9a96", roughness: 0.9, metalness: 0 });
    return { geometry, material, dispose: () => (geometry.dispose(), material.dispose()) };
  }, [geometry]);
  const placed = useMemo(() => (geometry ? (pose === "lean" ? leanPose(geometry) : uprightPose(geometry)) : null), [geometry, pose]);
  useDisposeOnUnmount(built ?? NOTHING);
  if (!built || !placed) return null;
  return <mesh name="hero logo" geometry={built.geometry} material={built.material} position={placed.position} quaternion={placed.quaternion} />;
}
