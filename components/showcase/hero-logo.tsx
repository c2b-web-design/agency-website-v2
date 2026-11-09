"use client";

import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildLogoMarkGeometry, LOGO_MARK_DEFAULTS } from "@/components/about/logo-mark-geometry";
import { LOGO_ASPECT } from "@/components/about/logo-mark-outline";
import type { DeskMarkResult } from "@/components/about/desk-mark.worker";
import { loadStudioHdri, STUDIO_HDRI_SRC } from "@/lib/studio-hdri";
import { HERO_CAMERA, HERO_PAGE, HERO_TEXT_PLACE } from "./hero-page";
import { useDisposeOnUnmount } from "@/lib/use-dispose-on-unmount";
import type { PmremLike } from "./bench-medium";

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

/** the logo on the bench — mounted in the blank canvas's group beside `HeroText`, lit by `HeroSketchLight` and the family's
 *  studio (`pmrem`, the medium's). `pose`: the LEAN (the opening, the default) or UPRIGHT (where it stood first, balanced —
 *  kept, Carl approved the balance) */
export function HeroLogo({ pose = "lean", pmrem, onReady }: { pose?: "lean" | "upright"; pmrem?: (gl: unknown) => PmremLike; onReady?: () => void }) {
  const geometry = useLogoGeometry(LOGO_HEIGHT_CM);
  const geo = useMemo(() => (geometry ? { geometry, dispose: () => geometry.dispose() } : null), [geometry]);
  useDisposeOnUnmount(geo ?? NOTHING);
  const studio = useFamilyStudio(pmrem);
  // the material on its own life: a new one when the studio arrives, the old disposed a task later — never the geometry
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: HERO_LOGO_RED, metalness: HERO_LOGO_METAL.metalness, roughness: HERO_LOGO_METAL.roughness });
    if (studio) {
      m.envMap = studio.texture;
      m.envMapIntensity = HERO_LOGO_METAL.envMapIntensity;
      m.envMapRotation.set(0, (HERO_LOGO_METAL.yawDeg * Math.PI) / 180, 0);
    }
    return m;
  }, [studio]);
  useDisposeOnUnmount(material);
  const placed = useMemo(() => (geometry ? (pose === "lean" ? leanPose(geometry) : uprightPose(geometry)) : null), [geometry, pose]);
  // ⛔ READY (9 November 2026, session 2; the workshop note v2.1 [R10-4]): the geometry from /about's worker AND, where the
  // medium prefilters one, the studio on the material. The bench's "drawn" waits for it
  const ready = !!placed && (!pmrem || !!studio);
  useEffect(() => {
    if (ready) onReady?.();
  }, [ready, onReady]);
  if (!geometry || !placed) return null;
  return <mesh name="hero logo" geometry={geometry} material={material} position={placed.position} quaternion={placed.quaternion} />;
}
