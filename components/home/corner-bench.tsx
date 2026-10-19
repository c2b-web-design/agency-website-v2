"use client";

/**
 * ⛔ THE CORNER BENCH'S CLIENT HALF — D-100 (19 October 2026). PASS 1: THE SHAPE, IN CLAY.
 *
 * ⛔ TAKE 3: COPIED FROM CARL'S BRACKET (`brand-assets/c4bf3a09-80f3-4b2c-b88a-925f08e9c26f.jpg` — *"Its ours, i made it
 * with gemini. Copy it."*), traced as a RELIEF: the photo is drawn to a canvas here and `buildCornerRelief` turns it into
 * a height field — a mesh for the mass and an object-space normal map for the carving. Takes 1 and 2 (swept tubes, then
 * banded tubes) are retired; their code is in the session's scratchpad, their record in D-100.
 *
 * ⛔ WHY CLAY FIRST: the desk mark's lesson (D-088, 7 October) — mesh, material and light built at once let the gold dress
 * a torn join. ⚠ The material is OPEN and may differ per section (Carl: *"material guided by what works best with the
 * colour"*).
 *
 * ⛔ TRUE SIZE: the `box` view draws §3's tightest box (*Proven on ourselves first*) at its page size in LAYOUT px with its
 * own text in the page's classes, the canvas over it at 1 scene unit = 1 layout px (R3F's `offsetSize`, the default
 * orthographic frustum). ⚠ NOT the page: §2's boxes are wider; other widths are not drawn.
 *
 * ⛔ THE MODES SEE DIFFERENT THINGS: `clay`, `zebra` and `normals` shade with the NORMAL MAP (the carving's detail);
 * `mesh` lights the triangles as built (`flatShading`, no map, no cut outline) — the mass alone. Mirrored corners are the same mesh under a
 * mirroring transform (three.js turns the winding for a negative determinant; the object-space map turns with it).
 * Stats on `window.__cornerBench` for the live-work scripts.
 *
 * ⛔ PASS 2 — THE MATERIAL, GOLD FIRST (19 October 2026; Carl: *"lets do ona at a time"*). §2's gold as SATIN GILT — the
 * soft sheen of gessoed gold leaf that Carl's bracket shows, not the logo's polish (his doubt: *"Im not sure if metal will be
 * the right choice here"* — answered by roughness: rough metal shows broad soft sheens, not mirror reflections). Starts from
 * THE LOGO STANDARD (D-088, 15 October): physical gold's F0 (`GOLD_F0_LINEAR`), metalness 1, reflecting the family buttons'
 * studio (`lib/studio-hdri.ts`) at their values — room 0.1, strength 1, turned 150° — with ONE change: roughness 0.45
 * (the logo's 0.25, the buttons' 0.4). ⚠ That studio is the JUDGING light for this pass; the real light and its small motion
 * are pass 3. The clay's lamps are off in `gold` (metal is lit by what it reflects).
 */
import { Suspense, use, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import bracket from "../../brand-assets/c4bf3a09-80f3-4b2c-b88a-925f08e9c26f.jpg";
import { buildCornerRelief, CORNER_DEFAULTS, CORNER_LIMIT_PX, type CornerParams, type CornerStats } from "./corner-geometry";
import { useCanvasDpr } from "@/lib/use-site-scale";
import { loadStudioHdri, STUDIO_HDRI_SRC } from "@/lib/studio-hdri";
import { GOLD_F0_LINEAR } from "@/components/about/logo-mark-material";

export type CornerBenchFlags = { view?: string; mode?: string; border?: boolean; guides?: boolean; az?: number; el?: number; orient?: string };

const VIEWS = ["box", "close", "oblique"] as const;
type View = (typeof VIEWS)[number];
const MODES = ["gold", "clay", "mesh", "zebra", "normals"] as const;
type Mode = (typeof MODES)[number];

/** ⛔ §3's centre box at Carl's window, measured 530 × 267 screen px at zoom 1.36 → layout px. The tightest box: 48
 *  screen px (≈ 35 layout) from every edge to its text. `live-work/scripts/home-box-corner-space-19-october.mjs`. */
const BOX = { w: 390, h: 196 } as const;
/** the text's nearest edge in that box, layout px (48 screen px ÷ 1.36) */
const TEXT_EDGE_PX = 35;
/** the close view's enlargement */
const CLOSE_ZOOM = 7;

const CLAY = { color: "#8a8a8a", roughness: 0.6 } as const;
/** ⛔ PASS 2's first take — the logo standard's studio values; roughness the one change (satin gilt). For Carl's eye. */
const GOLD_DEFAULTS = { roughness: 0.45, envInt: 1, yaw: 150, room: 0.1 };
type Gold = typeof GOLD_DEFAULTS;
type Placement = { key: string; position: [number, number, number]; scale: [number, number, number] };

/** The gold pieces: suspend until the studio is decoded, so nothing draws black first. */
function GoldPieces({ built, gold, placements }: { built: Built; gold: Gold; placements: Placement[] }) {
  const hdri = use(loadStudioHdri(STUDIO_HDRI_SRC, gold.room));
  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      metalness: 1, roughness: gold.roughness, envMap: hdri, envMapIntensity: gold.envInt,
      normalMap: built.normalMap, normalMapType: THREE.ObjectSpaceNormalMap, alphaMap: built.alphaMap, alphaTest: 0.5,
    });
    m.envMapRotation.set(0, (gold.yaw * Math.PI) / 180, 0);
    m.color.setRGB(GOLD_F0_LINEAR[0], GOLD_F0_LINEAR[1], GOLD_F0_LINEAR[2], THREE.LinearSRGBColorSpace);
    return m;
  }, [hdri, gold, built]);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <>
      {placements.map((p) => <mesh key={p.key} geometry={built.geometry} material={material} position={p.position} scale={p.scale} />)}
    </>
  );
}
const KEY_DEFAULT = { az: -55, el: 32 };

declare global {
  interface Window {
    __cornerBench?: { ready: boolean; stats: CornerStats; buildMs: number; view: View; mode: Mode; limitPx: number; box: typeof BOX; params: CornerParams };
  }
}

/** a raking key from the upper left, a weak opposite fill, a low hemisphere so no face goes black */
function ShapeLight({ az, el }: { az: number; el: number }) {
  const r = (d: number) => (d * Math.PI) / 180;
  const dir: [number, number, number] = [Math.sin(r(az)) * Math.cos(r(el)), Math.sin(r(el)), Math.cos(r(az)) * Math.cos(r(el))];
  const key: [number, number, number] = [dir[0] * 100, dir[1] * 100 * 0.6 + 40, dir[2] * 100];
  return (
    <>
      <hemisphereLight args={["#ffffff", "#3a3a3a", 0.45]} />
      <directionalLight position={key} intensity={2.4} />
      <directionalLight position={[-key[0] * 0.8, -20, 60]} intensity={0.35} />
    </>
  );
}

function makeMatcap() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const bands = 14;
  for (let i = 0; i < bands; i++) {
    g.fillStyle = i % 2 ? "#f2f2f2" : "#151515";
    g.fillRect(0, (i * 512) / bands, 512, 512 / bands + 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** the limit lines for the close view, top-left corner frame: red = the ornament's limit, amber = the text's edge */
function Guides() {
  const geo = useMemo(() => {
    const L = (d: number, far: number) => new Float32Array([d, -d, 3, far, -d, 3, d, -d, 3, d, -far, 3]);
    return { limit: L(CORNER_LIMIT_PX, 120), text: L(TEXT_EDGE_PX, 120) };
  }, []);
  return (
    <>
      <lineSegments>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[geo.text, 3]} /></bufferGeometry>
        <lineBasicMaterial color="#c08a2a" />
      </lineSegments>
      <lineSegments>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[geo.limit, 3]} /></bufferGeometry>
        <lineBasicMaterial color="#b03030" />
      </lineSegments>
    </>
  );
}

function Slider({ label, value, min, max, step, onChange, fmt }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt?: (v: number) => string;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-28">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-36" />
      <span className="tabular-nums text-neutral-400 w-24">{fmt ? fmt(value) : value.toFixed(2)}</span>
    </label>
  );
}

/** the four corners: the top-left mesh, mirrored by its transform */
const CORNERS: { c: string; at: (w: number, h: number) => [number, number, number]; s: [number, number, number] }[] = [
  { c: "tl", at: (w, h) => [-w / 2, h / 2, 0], s: [1, 1, 1] },
  { c: "tr", at: (w, h) => [w / 2, h / 2, 0], s: [-1, 1, 1] },
  { c: "bl", at: (w, h) => [-w / 2, -h / 2, 0], s: [1, -1, 1] },
  { c: "br", at: (w, h) => [w / 2, -h / 2, 0], s: [-1, -1, 1] },
];

type Built = ReturnType<typeof buildCornerRelief> & { ms: number };

export default function CornerBench({ flags }: { flags: CornerBenchFlags }) {
  const dpr = useCanvasDpr([1, 2]);
  const [view, setView] = useState<View>(VIEWS.includes(flags.view as View) ? (flags.view as View) : "box");
  const [mode, setMode] = useState<Mode>(MODES.includes(flags.mode as Mode) ? (flags.mode as Mode) : "gold");
  const [gold, setGold] = useState<Gold>(GOLD_DEFAULTS);
  const setG = (k: keyof Gold, v: number) => setGold((g) => ({ ...g, [k]: v }));
  const [border, setBorder] = useState(!!flags.border);
  const [guides, setGuides] = useState(flags.guides ?? true);
  const [az, setAz] = useState(Number.isFinite(flags.az) ? (flags.az as number) : KEY_DEFAULT.az);
  const [el, setEl] = useState(Number.isFinite(flags.el) ? (flags.el as number) : KEY_DEFAULT.el);
  const [params, setParams] = useState<CornerParams>({ ...CORNER_DEFAULTS, orient: flags.orient === "down" ? "down" : "along" });
  const set = (k: keyof CornerParams, v: number | string) => setParams((p) => ({ ...p, [k]: v }));

  // the photo's pixels, once
  const [pixels, setPixels] = useState<ImageData | null>(null);
  useEffect(() => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas");
      c.width = im.naturalWidth; c.height = im.naturalHeight;
      const g = c.getContext("2d", { willReadFrequently: true })!;
      g.drawImage(im, 0, 0);
      setPixels(g.getImageData(0, 0, c.width, c.height));
    };
    im.src = bracket.src;
  }, []);

  // build — in an effect, timed there, never in render
  const [built, setBuilt] = useState<Built | null>(null);
  useEffect(() => {
    if (!pixels) return;
    const id = window.setTimeout(() => {
      const t0 = performance.now();
      const r = buildCornerRelief(pixels, params);
      setBuilt({ ...r, ms: performance.now() - t0 });
    }, 60);
    return () => window.clearTimeout(id);
  }, [pixels, params]);
  useEffect(() => () => { built?.geometry.dispose(); built?.normalMap.dispose(); built?.alphaMap.dispose(); }, [built]);
  const stats = built?.stats;

  const matcap = useMemo(() => (typeof document === "undefined" ? null : makeMatcap()), []);
  const materials = useMemo(() => {
    const nm = built?.normalMap ?? null;
    const os = THREE.ObjectSpaceNormalMap;
    // the outline is cut from the full-resolution mask, not the mesh's coarse cells (`buildCornerRelief`)
    const cut = { alphaMap: built?.alphaMap ?? null, alphaTest: 0.5 };
    return {
      clay: new THREE.MeshStandardMaterial({ ...CLAY, metalness: 0, normalMap: nm, normalMapType: os, ...cut }),
      mesh: new THREE.MeshStandardMaterial({ ...CLAY, metalness: 0, flatShading: true }),
      zebra: new THREE.MeshMatcapMaterial({ matcap, normalMap: nm, normalMapType: os, ...cut }),
      normals: new THREE.MeshNormalMaterial({ normalMap: nm, normalMapType: os }),
    };
  }, [built, matcap]);
  useEffect(() => () => { for (const m of Object.values(materials)) m.dispose(); }, [materials]);
  useEffect(() => () => { matcap?.dispose(); }, [matcap]);
  const material = mode === "gold" ? materials.clay : materials[mode];
  const isGold = mode === "gold";

  useEffect(() => {
    if (!built || !stats) return;
    window.__cornerBench = { ready: true, stats, buildMs: built.ms, view, mode, limitPx: CORNER_LIMIT_PX, box: BOX, params };
  }, [built, stats, view, mode, params]);

  const select = "bg-neutral-900 border border-neutral-700 px-2 py-1";
  const n = (v: number, d = 1) => v.toFixed(d);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          view
          <select value={view} onChange={(e) => setView(e.target.value as View)} className={select}>
            <option value="box">box — true size, with its text</option>
            <option value="close">close — one corner, ×{CLOSE_ZOOM}</option>
            <option value="oblique">oblique — the relief</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          mode
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} className={select}>
            <option value="gold">gold — pass 2, satin gilt in the judging studio</option>
            <option value="clay">clay — pass 1</option>
            <option value="mesh">mesh — the mass alone, triangles as built</option>
            <option value="zebra">zebra — surface continuity</option>
            <option value="normals">normals</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          long arm
          <select value={params.orient} onChange={(e) => set("orient", e.target.value)} className={select}>
            <option value="along">along the top</option>
            <option value="down">down the side (as photographed)</option>
          </select>
        </label>
        {view === "box" && <label className="flex items-center gap-2"><input type="checkbox" checked={border} onChange={(e) => setBorder(e.target.checked)} /> the old border</label>}
        {view === "close" && <label className="flex items-center gap-2"><input type="checkbox" checked={guides} onChange={(e) => setGuides(e.target.checked)} /> limit lines</label>}
      </div>

      {view === "box" ? (
        // ⛔ the box as the page draws it — `#work`'s card classes, minus the border (unless asked for)
        <div className="relative" style={{ width: BOX.w, height: BOX.h }}>
          <div className={`absolute inset-0 p-6 md:p-8 text-center ${border ? "border border-neutral-800" : ""}`}>
            <h3 className="text-lg font-semibold tracking-tight">Proven on ourselves first</h3>
            <p className="mt-3 mx-auto text-sm text-neutral-400 leading-relaxed max-w-sm text-balance">
              We work alongside modern technology every day, and only recommend what has proved itself in our own work
              first. Nothing untested reaches your business, and a person always stands behind it.
            </p>
          </div>
          <Canvas className="!absolute inset-0 pointer-events-none" gl={{ antialias: true, alpha: true }} resize={{ offsetSize: true }} dpr={dpr} frameloop="demand">
            <OrthographicCamera makeDefault position={[0, 0, 200]} near={1} far={1000} />
            {!isGold && <ShapeLight az={az} el={el} />}
            {built && isGold && (
              <Suspense fallback={null}>
                <GoldPieces built={built} gold={gold} placements={CORNERS.map(({ c, at, s }) => ({ key: c, position: at(BOX.w, BOX.h), scale: s }))} />
              </Suspense>
            )}
            {built && !isGold && CORNERS.map(({ c, at, s }) => (
              <mesh key={c} geometry={built.geometry} material={material} position={at(BOX.w, BOX.h)} scale={s} />
            ))}
          </Canvas>
        </div>
      ) : (
        <div className="relative border border-neutral-800" style={{ width: 720, height: 420, background: "#0a0a0a" }}>
          <Canvas key={view} gl={{ antialias: true, alpha: true }} resize={{ offsetSize: true }} dpr={dpr} frameloop="always">
            {view === "close" ? (
              <OrthographicCamera makeDefault position={[48, -27, 200]} zoom={CLOSE_ZOOM} near={1} far={1000} />
            ) : (
              <PerspectiveCamera makeDefault position={[95, -80, 75]} fov={30} near={1} far={2000} />
            )}
            {view === "oblique" && <OrbitControls target={[30, -16, 0]} enableDamping={false} />}
            {!isGold && <ShapeLight az={az} el={el} />}
            {built && isGold && (
              <Suspense fallback={null}>
                <GoldPieces built={built} gold={gold} placements={[{ key: "tl", position: [0, 0, 0], scale: [1, 1, 1] }]} />
              </Suspense>
            )}
            {built && !isGold && <mesh geometry={built.geometry} material={material} />}
            {view === "close" && guides && <Guides />}
          </Canvas>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-sm">
        <div className="space-y-2">
          {isGold && (
            <>
              <div className="text-neutral-500">gold — physical F0, the logo standard&apos;s studio; ⚠ starting values for Carl&apos;s eye</div>
              <Slider label="roughness" value={gold.roughness} min={0.05} max={0.9} step={0.01} onChange={(v) => setG("roughness", v)} fmt={(v) => `${v.toFixed(2)}${v === GOLD_DEFAULTS.roughness ? " satin" : ""}`} />
              <Slider label="studio strength" value={gold.envInt} min={0.2} max={3} step={0.05} onChange={(v) => setG("envInt", v)} />
              <Slider label="studio turned" value={gold.yaw} min={0} max={359} step={1} onChange={(v) => setG("yaw", v)} fmt={(v) => `${v}°`} />
              <Slider label="studio room" value={gold.room} min={0.02} max={1} step={0.01} onChange={(v) => setG("room", v)} fmt={(v) => (v === 1 ? "as shot" : v.toFixed(2))} />
            </>
          )}
          <div className="text-neutral-500">light — rake it across the relief (clay modes)</div>
          <Slider label="key azimuth" value={az} min={-90} max={90} step={1} onChange={setAz} fmt={(v) => `${v}°`} />
          <Slider label="key elevation" value={el} min={0} max={85} step={1} onChange={setEl} fmt={(v) => `${v}°`} />
          <div className="text-neutral-500 pt-2">form — ⚠ starting points for Carl&apos;s eye</div>
          <Slider label="reach" value={params.reachPx} min={14} max={CORNER_LIMIT_PX} step={0.5} onChange={(v) => set("reachPx", v)} fmt={(v) => `${v.toFixed(1)} px`} />
          <Slider label="relief height" value={params.heightPx} min={0.8} max={6} step={0.1} onChange={(v) => set("heightPx", v)} fmt={(v) => `${v.toFixed(1)} px`} />
          <Slider label="carving" value={params.carve} min={0} max={1} step={0.05} onChange={(v) => set("carve", v)} fmt={(v) => (v === 0 ? "smooth mass" : v.toFixed(2))} />
          <Slider label="edge round" value={params.edgeRoundImg} min={1} max={14} step={0.5} onChange={(v) => set("edgeRoundImg", v)} fmt={(v) => `${v.toFixed(1)} photo px`} />
        </div>
        <div className="space-y-1 tabular-nums text-neutral-300">
          <div className="text-neutral-500">readouts — from the BUILT mesh, layout px</div>
          {built && stats ? (
            <>
              <div>build {n(built.ms, 0)} ms · {stats.vertices} vertices · {stats.triangles} triangles per corner · normal map {built.normalMap.image.width}×{built.normalMap.image.height}</div>
              <div>extent {n(stats.extentU)} along the top × {n(stats.extentV)} down the side · relief up to {n(stats.height, 2)} px · {n(1 / stats.scale, 2)} photo px per layout px</div>
              <div>
                reach into the corner {n(stats.diagonalReach)} · limit {CORNER_LIMIT_PX} · text at {TEXT_EDGE_PX}{" "}
                {stats.withinLimit ? <span className="text-emerald-400">— inside the limit</span> : <span className="text-red-400">— OVER the limit</span>}
              </div>
            </>
          ) : <div>building…</div>}
          <div className="text-neutral-500">⚠ Not watched: §2&apos;s wider boxes; other window widths. The carving is the photo&apos;s light read as depth — an assumption.</div>
        </div>
      </div>
    </div>
  );
}
