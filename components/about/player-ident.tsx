"use client";

/**
 * ⛔ THE VIEWER's TAKE 3 — THE IDENT (`/proto/player?take=3`, 21 October 2026). Carl: *"its not my design- its yours…
 * The goal, to show the user this is a video viewer, not simply a 16:9 box."* Inside the viewer is the digital world, the
 * Builder's to create (D-088, 3 October); the one rule: no bouncing logos.
 *
 * The platinum blue mark that has just fallen into the player STAYS, as a broadcaster's ident: lit by the logo's own
 * judging studio (`LOGO_JUDGING_STUDIO` — the metal standard, D-088), the studio drifting so the softboxes' reflections
 * slide across the face (the corners' way, D-100), the mark turning a few degrees and back. The pieces of light move; the
 * mark never travels.
 *
 * ⚠ A BENCH: its own canvas and context, the geometry built on the main thread (the page builds it in a Web Worker). If
 * this take is chosen, putting it on `/about` is a §5a question — the room's canvas already carries this mark into the
 * player, so a second context here would be the warm-up canvas again (CLAUDE.md §5a, worked case 1).
 * Loaded through `next/dynamic` from `player-bench.tsx`, so takes 1 and 2 never load three.js.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { buildLogoMarkGeometry, LOGO_MARK_DEFAULTS, logoMarkCentre } from "./logo-mark-geometry";
import type { DeskMarkRequest, DeskMarkResult } from "./desk-mark.worker";
import { LOGO_ASPECT } from "./logo-mark-outline";
// ⛔ the mark's place in the screen is the 2D outline's (one number, two drawings) — defined in the bench, which never
//   imports this module statically, so three.js stays out of takes 1 and 2
import { MARK_IN_SCREEN, type MarkPlace } from "./player-bench";
import { buildLogoStudioEnv, createLogoPlatinumBlue } from "./logo-mark-material";
import { useCanvasDpr } from "@/lib/use-site-scale";

/** ⚠ Takes for the eye: one turn of the mark and one drift of the studio, each a slow sine. */
const IDENT = { turnDeg: 9, turnPeriodS: 16, studioYawDeg: 38, studioPitchDeg: 8, studioPeriodS: 10 };

function Mark() {
  const gl = useThree((s) => s.gl);
  const geometry = useMemo(() => buildLogoMarkGeometry().geometry, []);
  const env = useMemo(() => buildLogoStudioEnv(gl), [gl]);
  const material = useMemo(() => {
    // ⚠ the studio at 1.8 (the bench's approved blue is judged at 1): a screen is seen from a lit room — a take
    const m = createLogoPlatinumBlue({ envMapIntensity: 1.8 });
    m.envMap = env.texture;
    return m;
  }, [env]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => env.dispose(), [env]);
  useEffect(() => () => material.dispose(), [material]);
  const centre = useMemo(() => logoMarkCentre(), []);
  const turn = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const d = Math.PI / 180;
    if (turn.current) turn.current.rotation.y = IDENT.turnDeg * d * Math.sin((t / IDENT.turnPeriodS) * Math.PI * 2);
    const a = (t / IDENT.studioPeriodS) * Math.PI * 2;
    material.envMapRotation.set(IDENT.studioPitchDeg * d * Math.cos(a), IDENT.studioYawDeg * d * Math.sin(a), 0);
  });
  return (
    <group ref={turn}>
      <mesh geometry={geometry} material={material} position={[-centre[0], -centre[1], -centre[2]]} />
    </group>
  );
}

// ── TAKE 4 — THE METAL HALF OF "THE MARK BECOMES THE PLAYER" ─────────────────────────────────────────────────────────

type MetalLink = { level: () => number; place: () => MarkPlace; onKick: (kick: () => void) => void; onReady: () => void };

function MetalMark({ level, place, onKick, onReady }: MetalLink) {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  // ⛔ THE GEOMETRY IS BUILT IN THE DESK MARK's WEB WORKER (`desk-mark.worker.ts`, the same function, height 1): built
  //   here inline it held the main thread ~2 s, and on `/about` this mounts while the reader scrolls the desk mark's
  //   journey (the structural note, Decision 4). If the worker cannot start, it builds inline, a tick later.
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  useEffect(() => {
    let live = true;
    let worker: Worker | null = null;
    let id = 0;
    const inline = () => {
      id = window.setTimeout(() => live && setGeometry(buildLogoMarkGeometry({ ...LOGO_MARK_DEFAULTS, scale: 1 }).geometry), 0);
    };
    try {
      worker = new Worker(new URL("./desk-mark.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (e: MessageEvent<DeskMarkResult>) => {
        worker?.terminate();
        worker = null;
        if (!live) return;
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(e.data.position, 3));
        g.setAttribute("normal", new THREE.BufferAttribute(e.data.normal, 3));
        g.setIndex(new THREE.BufferAttribute(e.data.index, 1));
        g.computeBoundingSphere();
        setGeometry(g);
      };
      worker.onerror = (e) => {
        e.preventDefault();
        worker?.terminate();
        worker = null;
        inline();
      };
      worker.postMessage({ scale: 1 } satisfies DeskMarkRequest);
    } catch {
      inline();
    }
    return () => {
      live = false;
      worker?.terminate();
      window.clearTimeout(id);
    };
  }, []);
  useEffect(() => () => geometry?.dispose(), [geometry]);
  const env = useMemo(() => buildLogoStudioEnv(gl), [gl]);
  const material = useMemo(() => {
    const m = createLogoPlatinumBlue({ envMapIntensity: 1.8 });
    m.envMap = env.texture;
    // ⛔ transparent from the first frame: toggling it later recompiles on the frame the fade lands (D-100's lesson)
    m.transparent = true;
    return m;
  }, [env]);
  useEffect(() => () => env.dispose(), [env]);
  useEffect(() => () => material.dispose(), [material]);
  const centre = useMemo(() => logoMarkCentre(), []);
  const pivot = useRef<THREE.Group>(null);
  // ⛔ FRONT-ON AND ORTHOGRAPHIC: the silhouette is then the traced outline itself, at the 2D outline's scale and place —
  //   read each frame from the 2D side (`place`), never computed twice. During the drop and the landing the 2D side hands
  //   over the ROOM's mark (its orientation, and its studio, in the camera's frame — `DeskMarkReadout`), so the mark that
  //   crosses the player's edge is the same mark, lit the same way.
  useEffect(() => {
    onKick(invalidate);
    invalidate();
  }, [onKick, invalidate]);
  const reported = useRef(false);
  const tmp = useMemo(() => ({ own: new THREE.Quaternion(), room: new THREE.Quaternion(), e: new THREE.Euler() }), []);
  useFrame(({ clock, camera }) => {
    const P = place();
    const s = P.s || (size.width * MARK_IN_SCREEN.width) / LOGO_ASPECT;
    if (camera.zoom !== s) {
      camera.zoom = s;
      camera.updateProjectionMatrix();
    }
    const g = pivot.current;
    if (g) {
      g.position.set((P.cx - size.width / 2) / s, (size.height / 2 - P.cy) / s, 0);
      if (P.q) g.quaternion.set(P.q[0], P.q[1], P.q[2], P.q[3]);
      else g.quaternion.identity();
    }
    const m = level();
    const a = (clock.elapsedTime / IDENT.studioPeriodS) * Math.PI * 2;
    const d = Math.PI / 180;
    tmp.own.setFromEuler(tmp.e.set(IDENT.studioPitchDeg * d * Math.cos(a), IDENT.studioYawDeg * d * Math.sin(a), 0));
    const mix = P.env ? (P.envMix ?? 1) : 0;
    if (P.env && mix > 0) tmp.own.slerp(tmp.room.set(P.env[0], P.env[1], P.env[2], P.env[3]), mix);
    material.envMapRotation.setFromQuaternion(tmp.own);
    // the room's blue is lit at 1 (`DESK_MARK_BLUE_STUDIO_INTENSITY`); the viewer's own at 1.8
    material.setValues({ opacity: m, envMapIntensity: (1.8 + (1 - 1.8) * mix) * m });
    if (g) g.visible = m > 0.002;
    if (geometry && !reported.current) {
      reported.current = true;
      window.setTimeout(onReady, 0);
    }
  });
  if (!geometry) return null;
  return (
    <group ref={pivot}>
      <mesh geometry={geometry} material={material} position={[-centre[0], -centre[1], -centre[2]]} />
    </group>
  );
}

export function MarkMetal(link: MetalLink) {
  const dpr = useCanvasDpr([1, 2]);
  return (
    <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 1, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true }} resize={{ offsetSize: true }} dpr={dpr} frameloop="demand">
      <MetalMark {...link} />
    </Canvas>
  );
}

export default function PlayerIdent({ active }: { active: boolean }) {
  const dpr = useCanvasDpr([1, 2]);
  return (
    <Canvas
      camera={{ position: [0, 0, 4.1], fov: 30, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true }}
      resize={{ offsetSize: true }}
      dpr={dpr}
      frameloop={active ? "always" : "never"}
    >
      <Mark />
    </Canvas>
  );
}
