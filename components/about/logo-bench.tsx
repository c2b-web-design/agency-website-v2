"use client";

/**
 * ⛔ THE MARK BENCH'S CLIENT HALF — D-088 chunk 1, 3 October 2026. Plan: `live-work/desk-mark-chunk1-plan-3-october.md`.
 *
 * ⛔ RENDERER PARITY WITH `/about` (Architect A5, `about-card-canvas.tsx` ~1069): R3F's defaults — ACES filmic tone
 * mapping, sRGB output — and `antialias: true`, `alpha: true`, `dpr={[1, 2]}`, soft shadows. A gold judged under a
 * different renderer would shift when it reaches the room. ⚠ `frameloop="always"` is the BENCH's (the turntable);
 * `/about` is `"demand"` — chunk 2's question, recorded in the plan.
 *
 * ⛔ THE FRONT VIEW IS FRAMED BY THE OUTLINE'S OWN NORMALISATION TRANSFORM (`LOGO_OUTLINE_SOURCE`), never by a hand
 * fit (Architect A4): the orthographic frustum covers exactly the source image, so the target cut-out laid over the
 * canvas registers by construction. The overlay is a DOM image over the canvas, NOT a textured plane — a plane would
 * be tone-mapped, and the gold would be matched against an altered target (A5).
 *
 * ⛔ THE BUILD IS TIMED IN AN EFFECT, not in render (A11; `performance.now()` in render trips the purity lint), and
 * runs debounced so a dial drag does not rebuild on every step. Stats are published on `window.__logoBench` for
 * `live-work/scripts/logo-bench-measure.mjs`.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import goldTarget from "../../brand-assets/logo/c2b-logo-gold-relit-alpha-1671.png";
import { buildLogoMarkGeometry, LOGO_MARK_DEFAULTS, type LogoMarkParams, type LogoMarkStats } from "./logo-mark-geometry";
import { createLogoGold, LOGO_GOLD_DEFAULTS } from "./logo-mark-material";
import { LOGO_HALF_WIDTH, LOGO_OUTLINE_SOURCE as SRC } from "./logo-mark-outline";
import { RoomEnvironment } from "./room-environment";
import { ROOM_PLATE_SRC } from "./about-room";

export type LogoBenchFlags = { view?: string; mask?: boolean; light?: string; overlay?: number };

const VIEWS = ["front", "oblique", "turntable", "side", "below", "roomsize"] as const;
type View = (typeof VIEWS)[number];
type Light = "studio" | "room";

/** ⚠ PLACEHOLDER — chunk 2 sets the real height in room millimetres from the plate target (144 plate px). */
const PLACEHOLDER_HEIGHT_MM = 180;
/** The room-size view: the mark's approved size on Carl's screen, ~70 CSS px tall (D-088, 3 October). */
const ROOMSIZE_MARK_CSS_PX = 70;

type Built = { geometry: THREE.BufferGeometry; stats: LogoMarkStats; ms: number };

declare global {
  interface Window {
    __logoBench?: { ready: boolean; stats: LogoMarkStats; buildMs: number; params: LogoMarkParams; view: View; mask: boolean };
  }
}

function Turntable({ on, children }: { on: boolean; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (on && group.current) group.current.rotation.y += dt * 0.35;
  });
  return <group ref={group}>{children}</group>;
}

/** Studio light: Lightformers ONLY, no preset (a preset fetches an HDR from a CDN — Architect A6). After the target's
 *  light: two tall softboxes (the two streaks along each stroke), a broad top, a front fill, the warm bounce of the
 *  floor it stands on, and a very dark warm base so no face reflects pure black. ⚠ A starting point for Carl's eye. */
function StudioLight() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#0d0b09"]} />
      <Lightformer form="rect" intensity={1.7} color="#fff1d8" position={[-4, 1, 3]} scale={[2.5, 8, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.7} color="#fff1d8" position={[4, 1, 3]} scale={[2.5, 8, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.1} color="#fff1d8" position={[0, 5, 1]} scale={[8, 2.5, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.45} position={[0, 0.5, 6]} scale={[6, 3, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.5} color="#ffb060" position={[0, -4, 2]} scale={[8, 2.5, 1]} target={[0, 0, 0]} />
    </Environment>
  );
}

/** "Room reflection — no take light" (Architect A7): the room's env map from the plate, as `/about` builds it. */
function RoomReflection() {
  const texture = useLoader(THREE.TextureLoader, ROOM_PLATE_SRC);
  useEffect(() => {
    // as `about-card-canvas.tsx` does for the same plate; Object.assign because the hook's return value is not ours to mutate
    Object.assign(texture, { colorSpace: THREE.SRGBColorSpace, needsUpdate: true });
  }, [texture]);
  return <RoomEnvironment plate={texture} enabled />;
}

function Slider({ label, value, min, max, step, onChange, fmt }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt?: (v: number) => string;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-24">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-36" />
      <span className="tabular-nums text-neutral-400 w-20">{fmt ? fmt(value) : value.toFixed(3)}</span>
    </label>
  );
}

export default function LogoBench({ flags }: { flags: LogoBenchFlags }) {
  const [view, setView] = useState<View>(VIEWS.includes(flags.view as View) ? (flags.view as View) : "oblique");
  const [mask, setMask] = useState(!!flags.mask);
  const [light, setLight] = useState<Light>(flags.light === "room" ? "room" : "studio");
  const [overlay, setOverlay] = useState(flags.overlay ?? 0);
  const [heightMm, setHeightMm] = useState(PLACEHOLDER_HEIGHT_MM);
  const [geo, setGeo] = useState<LogoMarkParams>({ ...LOGO_MARK_DEFAULTS });
  const [roughness, setRoughness] = useState(LOGO_GOLD_DEFAULTS.roughness);
  const [envI, setEnvI] = useState(LOGO_GOLD_DEFAULTS.envMapIntensity);
  const [built, setBuilt] = useState<Built | null>(null);

  const params = useMemo(() => ({ ...geo, scale: heightMm }), [geo, heightMm]);

  // build — debounced, timed here, never in render
  useEffect(() => {
    const id = window.setTimeout(() => {
      const t0 = performance.now();
      const r = buildLogoMarkGeometry(params);
      setBuilt({ ...r, ms: performance.now() - t0 });
    }, 200);
    return () => window.clearTimeout(id);
  }, [params]);
  useEffect(() => () => built?.geometry.dispose(), [built]);
  useEffect(() => {
    if (!built) return;
    window.__logoBench = { ready: true, stats: built.stats, buildMs: built.ms, params, view, mask };
  }, [built, params, view, mask]);

  const gold = useMemo(() => createLogoGold({ roughness, envMapIntensity: envI }), [roughness, envI]);
  useEffect(() => () => gold.dispose(), [gold]);
  const white = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }), []);
  useEffect(() => () => white.dispose(), [white]);

  const S = heightMm;
  const front = view === "front" || view === "roomsize";
  // the frustum that covers the source image exactly, in model units
  const frame = {
    left: (-SRC.originPx.x / SRC.pxPerUnit) * S,
    right: ((SRC.widthPx - SRC.originPx.x) / SRC.pxPerUnit) * S,
    top: (SRC.originPx.y / SRC.pxPerUnit) * S,
    bottom: ((SRC.originPx.y - SRC.heightPx) / SRC.pxPerUnit) * S,
  };
  const centre: [number, number, number] = [0, 0.5 * S, 0.04 * S];
  const persp: Record<Exclude<View, "front" | "roomsize">, [number, number, number]> = {
    oblique: [0.95 * S, 0.85 * S, 1.9 * S],
    turntable: [0, 0.55 * S, 2.6 * S],
    side: [2.4 * S, 0.2 * S, 0.12 * S],
    below: [0.35 * S, -0.75 * S, 1.3 * S],
  };
  const panelStyle: React.CSSProperties =
    view === "roomsize"
      ? { height: (ROOMSIZE_MARK_CSS_PX * SRC.heightPx) / SRC.pxPerUnit, width: (ROOMSIZE_MARK_CSS_PX * SRC.widthPx) / SRC.pxPerUnit }
      : { aspectRatio: `${SRC.widthPx} / ${SRC.heightPx}` };
  const st = built?.stats;
  const n = (v: number | undefined, d = 2) => (v === undefined ? "…" : v.toFixed(d));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          view
          <select value={view} onChange={(e) => setView(e.target.value as View)} className="bg-neutral-900 border border-neutral-700 px-2 py-1">
            {VIEWS.map((v) => (<option key={v} value={v}>{v === "roomsize" ? "room size (~70 CSS px)" : v}</option>))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          light
          <select value={light} onChange={(e) => setLight(e.target.value as Light)} className="bg-neutral-900 border border-neutral-700 px-2 py-1">
            <option value="studio">studio (Lightformers)</option>
            <option value="room">room reflection — no take light</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={mask} onChange={(e) => setMask(e.target.checked)} /> mask (measurement)
        </label>
        {front && !mask && (
          <Slider label="target overlay" value={overlay} min={0} max={1} step={0.05} onChange={setOverlay} fmt={(v) => v.toFixed(2)} />
        )}
      </div>

      <div
        className={`relative border border-neutral-700 ${view === "roomsize" ? "" : "w-full"}`}
        style={{ ...panelStyle, background: mask ? "#000000" : "#121212", maxWidth: view === "roomsize" ? undefined : "100%" }}
      >
        <Canvas key={front ? "ortho" : "persp"} gl={{ antialias: true, alpha: true }} dpr={[1, 2]} shadows="soft" frameloop="always">
          {front ? (
            <OrthographicCamera makeDefault position={[0, 0, 10 * S]} near={0.1} far={40 * S} {...frame} manual />
          ) : (
            <PerspectiveCamera makeDefault position={persp[view as keyof typeof persp]} fov={30} near={S * 0.01} far={S * 40} />
          )}
          {!front && <OrbitControls target={centre} enableDamping={false} />}
          {!mask && (light === "studio" ? <StudioLight /> : <RoomReflection />)}
          {built && (
            <Turntable on={view === "turntable"}>
              <mesh geometry={built.geometry} material={mask ? white : gold} />
            </Turntable>
          )}
        </Canvas>
        {front && !mask && overlay > 0 && (
          <Image
            src={goldTarget}
            alt="Carl's gold target, the trace source's cut-out, in the same framing"
            fill
            unoptimized
            className="pointer-events-none select-none"
            style={{ opacity: overlay, objectFit: "fill" }}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-sm">
        <div className="space-y-2">
          <div className="text-neutral-500">form — ⚠ starting points for Carl&apos;s eye</div>
          <Slider label="height mm" value={heightMm} min={60} max={600} step={10} onChange={setHeightMm} fmt={(v) => `${v} (placeholder)`} />
          <Slider label="dome R" value={geo.R} min={0.4 * LOGO_HALF_WIDTH.p5} max={LOGO_HALF_WIDTH.p5} step={0.0005} onChange={(v) => setGeo({ ...geo, R: v })} fmt={(v) => `${((v / LOGO_HALF_WIDTH.p5) * 100).toFixed(0)}% of p5`} />
          <Slider label="dome height" value={geo.domeH} min={0.3} max={1} step={0.01} onChange={(v) => setGeo({ ...geo, domeH: v })} fmt={(v) => (v === 1 ? "half-round" : v.toFixed(2))} />
          <Slider label="wall" value={geo.wallH} min={0} max={0.6} step={0.01} onChange={(v) => setGeo({ ...geo, wallH: v })} fmt={(v) => `${v.toFixed(2)} R`} />
          <Slider label="lip" value={geo.lipW} min={0.02} max={0.4} step={0.01} onChange={(v) => setGeo({ ...geo, lipW: v })} fmt={(v) => `${v.toFixed(2)} R`} />
          <Slider label="stem R" value={geo.stemR} min={0.2} max={1} step={0.01} onChange={(v) => setGeo({ ...geo, stemR: v })} fmt={(v) => `${v.toFixed(2)} R`} />
          <Slider label="stem bevel" value={geo.stemBevel} min={0} max={1} step={0.05} onChange={(v) => setGeo({ ...geo, stemBevel: v })} fmt={(v) => (v === 0 ? "round" : v === 1 ? "straight" : v.toFixed(2))} />
          <Slider label="stem ease" value={geo.stemBlend} min={0.005} max={0.12} step={0.005} onChange={(v) => setGeo({ ...geo, stemBlend: v })} />
          <Slider label="stem crown" value={geo.stemCrown} min={0} max={0.6} step={0.01} onChange={(v) => setGeo({ ...geo, stemCrown: v })} fmt={(v) => (v === 0 ? "flat" : v.toFixed(2))} />
          <Slider label="grid step" value={geo.gridStep * SRC.pxPerUnit} min={1} max={6} step={0.25} onChange={(v) => setGeo({ ...geo, gridStep: v / SRC.pxPerUnit })} fmt={(v) => `${v.toFixed(2)} src px`} />
          <Slider label="edge band" value={geo.bandT} min={0.05} max={0.8} step={0.05} onChange={(v) => setGeo({ ...geo, bandT: v })} fmt={(v) => `t ${v.toFixed(2)}`} />
          <Slider label="band rings" value={geo.bandRings} min={2} max={24} step={1} onChange={(v) => setGeo({ ...geo, bandRings: v })} fmt={(v) => `${v}`} />
          <div className="text-neutral-500 pt-2">gold</div>
          <Slider label="roughness" value={roughness} min={0.02} max={0.8} step={0.01} onChange={setRoughness} />
          <Slider label="env intensity" value={envI} min={0.2} max={3} step={0.05} onChange={setEnvI} fmt={(v) => v.toFixed(2)} />
        </div>
        <div className="space-y-1 tabular-nums text-neutral-300">
          <div className="text-neutral-500">readouts — from the BUILT mesh</div>
          <div>build {n(built?.ms, 0)} ms · {st?.vertices ?? "…"} vertices · {st?.triangles ?? "…"} triangles</div>
          <div>open edges (welded) {st?.openEdges ?? "…"} · non-manifold {st?.nonManifoldEdges ?? "…"} · NaN {st?.nanValues ?? "…"}</div>
          <div>flipped band triangles {st?.flippedBandTriangles ?? "…"} · ring clamps {st?.ringClamps ?? "…"}</div>
          <div>crest {n(st?.crestHeight, 4)} units · ÷ median half-width {n(st?.crestOverHalfWidth, 3)}</div>
          <div>max normal angle — crest {n(st?.maxNormalAngleCrestDeg, 1)}° (a spine seam would show here)</div>
          <div>— stem ease {n(st?.maxNormalAngleStemEaseDeg, 1)}° · whole front {n(st?.maxNormalAngleDeg, 1)}° (mitres at corners) · edges &gt; 30° {st?.edgesOver30Deg ?? "…"}</div>
          <div>max interior z-step {n(st?.maxGridZStepSourcePx, 2)} source px · R used {n(st?.rUsed, 4)}</div>
        </div>
      </div>
    </div>
  );
}
