"use client";

/**
 * ⛔ THE SHOWCASE BENCH's CLIENT HALF — film 4 (D-088, 22 October 2026, session 2). PASS 1: THE WORDS' MESH, IN CLAY.
 * Plans: take 1 `live-work/film04-pass1-mesh-plan-22-october.md` (v4.1, R-088); take 2, THE ARCH,
 * `live-work/film04-pass1-take2-arch-plan-22-october.md` (v2.1). The geometry: `lettering-geometry.ts`.
 *
 * ⛔ TWO LAYOUTS. `?layout=line` is take 1 exactly (one line, one merged mesh — its R-088 numbers are the regression).
 * The default is the ARCH: the restaurant lockup, "Your" as the lintel, every letter UPRIGHT (Carl), each letter ITS OWN
 * MESH, built once and only MOVED when the layout's sliders change (re-merging on a slider tick would stutter and could
 * not be filmed). Take 2 set "company" over a half-circle; ⚠ since take 7 (23 October, R-090) the default is "company
 * logo" on a ROUND-HEADED arch (`ArchLayout.form`) — the half-circle takes are at `?form=half&arch=company`.
 *
 * ⛔ HOW THE WORDS ARE MEASURED AND BUILT — `lettering-hooks.tsx` (LIFTED there 23 October, session 2, so the bench and the
 * page `/proto/your-words` share ONE mechanism; the bench's 24 frames compared pixel-for-pixel before and after). On the
 * bench the kern-on spans ARE the words' accessible text, in reading order (`MeasureSpans accessible`). The font check's
 * failures are shown here in plain words (calibrated on take 1: worst 0.061 px).
 *
 * ⛔ THE ARCH's COLLISION CHECK runs when the sliders STOP (debounced), never per tick; its time is recorded apart from the
 * layout's. A collision, or a clearance under the margin, is shown on the bench in plain words. `__showcaseBench.probe(em)`
 * runs the SAME layout and check at another arch tracking, positions derived from the current reading (letter-spacing
 * adds index × tracking × size) — the tracking script uses it, then confirms its pick with a real browser reading.
 *
 * WHY CLAY FIRST: mesh → material → light, each judged by Carl's eye (the desk mark's lesson, D-088, 7 October). The clay
 * and the shape light are COPIES of `corner-bench.tsx`'s (its `ShapeLight` is local). Stats on `window.__showcaseBench`.
 */
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { useCanvasDpr } from "@/lib/use-site-scale";
import type { Glyphs } from "@/components/home/whoweare-button-scene";
import {
  checkCollisions,
  COLLISION_MARGIN_EM,
  layoutArch,
  LETTERING_DEFAULTS,
  SHOWCASE_FONTS,
  SWEEP_MAX,
  SWEEP_MIN,
  setCase,
  type ArchLayout,
  type ArchReading,
  type CollisionReport,
  type LetteringSpec,
  type LetteringStats,
  type ShowcaseFont,
} from "./lettering-geometry";
import {
  ArchGrain,
  archShapeKey,
  frontDistance,
  FRONT_FILL,
  FRONT_FOV,
  MeasureSpans,
  useArchCollisions,
  useArchLetters,
  useArchPlacement,
  useLineBuild,
  useLines,
  useMeasured,
  useShowcaseFont,
  type FontCheck,
} from "./lettering-hooks";
import { applyBrushedMetal, BRUSHED_BRASS, createBrushedMetal, JUDGING_STUDIO, type BrushedMetal } from "./lettering-material";
import { loadStudioHdri, STUDIO_HDRI_SRC } from "@/lib/studio-hdri";

export type ShowcaseBenchFlags = {
  words?: string; size?: number; track?: number; depth?: number; bevel?: number; bevelseg?: number; curve?: number;
  font?: string; view?: string; mode?: string; az?: number; el?: number;
  layout?: string; top?: string; arch?: string; caps?: string; steps?: string; nudge?: string; sweep?: number; archtrack?: number; topscale?: number; gap?: number;
  form?: string; radius?: number; clear?: number; crease?: number;
  // pass 2 — the material's dials, and the judging studio's (bench state, NOT spec parts) and the oblique pose
  tone?: number; strength?: number; estrength?: number; froughness?: number; aniso?: number; anisorot?: number; eroughness?: number; grainem?: number; grain?: number;
  room?: number; yaw?: number; cam?: string;
  /** an INSTRUMENT: `mirror` shows a flat panel in the face material in place of the words (see `MirrorProbe`) */
  probe?: string;
};

const VIEWS = ["front", "oblique"] as const;
type View = (typeof VIEWS)[number];
const MODES = ["clay", "flat", "mesh", "normals", "zebra", "material"] as const;
type Mode = (typeof MODES)[number];

const CLAY = { color: "#8a8a8a", roughness: 0.6 } as const;
const KEY_DEFAULT = { az: -35, el: 40 } as const;
/** the words fill this share of the canvas, in either view (width AND height — the arch is tall) — the shared `FRONT_FILL` */
const FILL = FRONT_FILL;

type ArchStats = {
  triangles: number;
  buildMs: number;
  widthPx: number;
  heightPx: number;
  missing: string[];
  pairs: [];
  arch: ArchReading;
  collisions: CollisionReport | null;
};
type ProbeResult = {
  trackEm: number;
  collisions: number;
  tight: number;
  worst: CollisionReport["worst"];
  neighbours: CollisionReport["neighbours"];
  radiusPx: number;
  feetDeg: [number, number];
};

declare global {
  interface Window {
    __showcaseBench?: {
      ready: boolean;
      stats: LetteringStats | ArchStats | null;
      spec: LetteringSpec;
      fontCheck: FontCheck | null;
      probe?: (trackEm: number, patch?: Partial<ArchLayout>) => ProbeResult | null;
    };
    /** the live renderer's tone mapping (three's constant), published by `ToneMapping` for harnesses to print */
    __showcaseToneMapping?: number;
  }
}

const clamp = (v: number | undefined, lo: number, hi: number, d: number) => (v === undefined ? d : Math.min(hi, Math.max(lo, v)));

/** A copy of `corner-bench.tsx`'s shape light: a key you can rake, a soft fill, a hemisphere so no face goes black. */
function ShapeLight({ az, el }: { az: number; el: number }) {
  const r = (d: number) => (d * Math.PI) / 180;
  const dir: [number, number, number] = [Math.sin(r(az)) * Math.cos(r(el)), Math.sin(r(el)), Math.cos(r(az)) * Math.cos(r(el))];
  const S = 1000;
  const key: [number, number, number] = [dir[0] * S, dir[1] * S * 0.6 + 0.4 * S, dir[2] * S];
  return (
    <>
      <hemisphereLight args={["#ffffff", "#3a3a3a", 0.45]} />
      <directionalLight position={key} intensity={2.4} />
      <directionalLight position={[-key[0] * 0.8, -0.2 * S, 0.6 * S]} intensity={0.35} />
    </>
  );
}

/** A copy of `corner-bench.tsx`'s zebra matcap: stripes that bend where the surface's curvature changes. */
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

/** Front: orthographic, face-on, zoomed so the words fill `FILL` of the canvas's width AND height — the camera frames, the
 *  words keep their size.
 *  ⚠ FAR BACK ON PURPOSE: three's matcap takes its view direction from each fragment's VIEW POSITION, even under an
 *  orthographic camera; at z 2000 a flat face read as a light-to-dark band across the words (the first zebra still,
 *  22 October). At 1e5 the direction is constant to ~0.5°, and an orthographic view does not change with distance. */
const FRONT_Z = 100000;
/**
 * ⛔ IN THE MATERIAL MODE THE FRONT IS A PERSPECTIVE VIEW (Carl, 23 October: route 2). Orthographic, every point of a flat
 * face reflects the IDENTICAL direction of the studio, so the face can only be one even colour — a bench artifact; a page
 * shows it in perspective, where the reflection varies across the word. Face-on, still (no orbit: the line is STATIC, Carl),
 * framed to `FILL` like the orthographic view. The clay modes keep the orthographic front — the shape's inspection view and
 * step 0's regression baseline.
 */
function FrontCamera({ widthPx, heightPx, perspective }: { widthPx: number; heightPx: number; perspective: boolean }) {
  const size = useThree((s) => s.size);
  const zoom = widthPx > 0 ? Math.min((FILL * size.width) / widthPx, heightPx > 0 ? (FILL * size.height) / heightPx : Infinity) : 1;
  if (perspective) {
    // the shared framing (`lettering-hooks.tsx`) — the page `/proto/your-words` frames each piece the same way
    const d = frontDistance(widthPx, heightPx, size);
    return <PerspectiveCamera makeDefault position={[0, 0, d]} fov={FRONT_FOV} near={1} far={d * 10} />;
  }
  return <OrthographicCamera makeDefault position={[0, 0, FRONT_Z]} zoom={zoom} near={FRONT_Z - 5000} far={FRONT_Z + 5000} />;
}

/** Oblique: a perspective camera turned to show the depth and the edge, the same framing; orbit to look round.
 *  ⛔ The pose is FIXED until a hand orbits it — `?cam=az,el` (degrees, default 28,16) names it, so a harness's "the same
 *  view" across two renders is guaranteed (the Architect, pass 2). */
const OBLIQUE_POSE = { az: 28, el: 16 } as const;
function ObliqueCamera({ widthPx, heightPx, azDeg, elDeg }: { widthPx: number; heightPx: number; azDeg: number; elDeg: number }) {
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const fov = 30;
  const vHalf = ((fov / 2) * Math.PI) / 180;
  const hHalf = Math.atan(Math.tan(vHalf) * aspect);
  const d = widthPx > 0 ? Math.max(widthPx / FILL / 2 / Math.tan(hHalf), heightPx / FILL / 2 / Math.tan(vHalf)) : 1000;
  const az = (azDeg * Math.PI) / 180, el = (elDeg * Math.PI) / 180;
  return (
    <>
      <PerspectiveCamera makeDefault position={[Math.sin(az) * Math.cos(el) * d, Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d]} fov={fov} near={1} far={d * 10} />
      <OrbitControls target={[0, 0, 0]} enableDamping={false} />
    </>
  );
}

/**
 * ⛔ NEUTRAL TONE MAPPING IN THE MATERIAL MODE — A JUDGING CHOICE ONLY (Carl, 23 October: *"Judging choice only"*; the
 * page's tone mapping is pass 3's). The family buttons — the metal standard's — render under Neutral; the bench's clay
 * modes keep R3F's default ACES, so their frames stay the regression baseline. ⛔ SET HERE, ON THE LIVE RENDERER, not by a
 * changed Canvas `gl` prop (which may not reach a renderer that already exists — the Architect): saved, set, RESTORED on
 * leaving (the save/restore of `answer-card-canvas.tsx:3715–3731`), then `invalidate()` — the bench is `frameloop="demand"`.
 * Three recompiles each program for the new tone mapping by itself (its cache key carries it). The live value is published
 * as `window.__showcaseToneMapping` so every harness PRINTS it, not assumes it.
 */
function ToneMapping({ neutral }: { neutral: boolean }) {
  // the renderer read through `get()` inside the effect: React's immutability rule forbids writing to a value a hook returns
  const get = useThree((s) => s.get);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const gl = get().gl;
    const prev = gl.toneMapping;
    if (neutral) gl.toneMapping = THREE.NeutralToneMapping;
    window.__showcaseToneMapping = gl.toneMapping;
    invalidate();
    return () => {
      gl.toneMapping = prev;
      window.__showcaseToneMapping = gl.toneMapping;
      invalidate();
    };
  }, [get, invalidate, neutral]);
  return null;
}

/** The look onto the two materials when it changes, then one frame (`frameloop="demand"`). */
function MetalApply({ metal, look, yawDeg, sizePx }: { metal: BrushedMetal; look: Extract<LetteringSpec["material"], { kind: "brushed-metal" }>; yawDeg: number; sizePx: number }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    applyBrushedMetal(metal, look, yawDeg, sizePx);
    invalidate();
  }, [metal, look, yawDeg, sizePx, invalidate]);
  return null;
}

/**
 * ⛔ THE GRAIN's FLOOR, FROM THE CURRENT FRAMING (the Architect): a pitch below ~2 DEVICE px mips away to an average. One
 * layout px on the face spans `zoom × pixelRatio` device px under the front camera (the orthographic zoom IS css px per
 * world unit, one world unit one layout px), so the floor in em is 2 / (zoom × pixelRatio × size). Under the material
 * mode's PERSPECTIVE front, the same at the face's plane (z 0): size.height / (2 · d · tan(fov/2)) css px per unit. Reported
 * up whenever it changes. ⚠ The FRONT view's: the oblique's perspective varies across the word, so there it is an estimate.
 */
function FramingReport({ onDevicePxPerUnit }: { onDevicePxPerUnit: (v: number) => void }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const pixelRatio = useThree((s) => s.viewport.dpr);
  const persp = camera as THREE.PerspectiveCamera;
  const cssPerUnit = (camera as THREE.OrthographicCamera).isOrthographicCamera
    ? (camera as THREE.OrthographicCamera).zoom
    : persp.isPerspectiveCamera
      ? size.height / (2 * persp.position.z * Math.tan(((persp.fov / 2) * Math.PI) / 180))
      : NaN;
  useEffect(() => {
    if (Number.isFinite(cssPerUnit) && cssPerUnit > 0) onDevicePxPerUnit(cssPerUnit * pixelRatio);
  }, [cssPerUnit, pixelRatio, onDevicePxPerUnit]);
  return null;
}

function Slider({ label, value, min, max, step, onChange, fmt, onCommit }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt?: (v: number) => string;
  /** called on RELEASE (pointer up, key up, blur) — for a value too costly to apply per tick */
  onCommit?: (v: number) => void;
}) {
  const commit = onCommit ? (e: { currentTarget: HTMLInputElement }) => onCommit(Number(e.currentTarget.value)) : undefined;
  return (
    <label className="flex items-center gap-2">
      <span className="w-28">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={commit} onKeyUp={commit} onBlur={commit} className="w-36"
      />
      <span className="tabular-nums text-neutral-400 w-28">{fmt ? fmt(value) : value.toFixed(3)}</span>
    </label>
  );
}

/** `?nudge=P:0.02,M:-0.01` → { P: 0.02, M: -0.01 } (em); anything unreadable is dropped. `?nudge=` (empty) clears them. */
function parseNudge(s: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const part of s.split(",")) {
    const [ch, v] = part.split(":");
    if (ch && ch.length === 1 && Number.isFinite(Number(v))) out[ch.toUpperCase()] = Math.max(-0.2, Math.min(0.2, Number(v)));
  }
  return out;
}

/** The x positions an arch would have at another tracking: letter-spacing adds (index × Δtracking × size) to each. */
function shiftX(g: Glyphs, dEm: number, sizePx: number): number[] {
  return g.x.map((x, i) => x + i * dEm * sizePx);
}

export default function ShowcaseBench({ flags }: { flags: ShowcaseBenchFlags }) {
  const dpr = useCanvasDpr([1, 2]);
  const D = LETTERING_DEFAULTS;
  const DA = D.layout as ArchLayout;
  const [spec, setSpec] = useState<LetteringSpec>(() => ({
    words: flags.words ?? D.words,
    font: (flags.font && flags.font in SHOWCASE_FONTS ? flags.font : D.font) as ShowcaseFont,
    sizePx: clamp(flags.size, 40, 400, D.sizePx),
    trackingEm: clamp(flags.track, -0.1, 0.3, D.trackingEm),
    depthEm: clamp(flags.depth, 0, 1, D.depthEm),
    bevel: {
      sizeEm: clamp(flags.bevel, 0, 0.08, D.bevel.sizeEm),
      thicknessEm: clamp(flags.bevel, 0, 0.08, D.bevel.thicknessEm),
      segments: Math.round(clamp(flags.bevelseg, 1, 8, D.bevel.segments)),
    },
    curveSegments: Math.round(clamp(flags.curve, 2, 32, D.curveSegments)),
    creaseDeg: clamp(flags.crease, 0, 44, D.creaseDeg),
    layout:
      flags.layout === "line"
        ? { kind: "line" }
        : {
            kind: "arch",
            top: flags.top ?? DA.top,
            arch: flags.arch ?? DA.arch,
            caps: flags.caps === undefined ? DA.caps : flags.caps !== "0",
            steps: flags.steps === "font" ? "font" : flags.steps === "equal" ? "equal" : DA.steps,
            nudgeEm: flags.nudge !== undefined ? parseNudge(flags.nudge) : DA.nudgeEm,
            form: flags.form === "half" ? "half" : flags.form === "round" ? "round" : DA.form,
            radiusEm: clamp(flags.radius, 0.5, 4, DA.radiusEm),
            clearEm: clamp(flags.clear, 0, 0.6, DA.clearEm),
            sweepDeg: clamp(flags.sweep, SWEEP_MIN, SWEEP_MAX, DA.sweepDeg),
            archTrackingEm: clamp(flags.archtrack, 0, 0.3, DA.archTrackingEm),
            topScale: clamp(flags.topscale, 0.3, 2, DA.topScale),
            gapEm: clamp(flags.gap, 0, 1.5, DA.gapEm),
          },
    material: {
      ...BRUSHED_BRASS,
      tone: clamp(flags.tone, 0, 1, BRUSHED_BRASS.tone),
      face: {
        ...BRUSHED_BRASS.face,
        strength: clamp(flags.strength, 0, 4, BRUSHED_BRASS.face.strength),
        roughness: clamp(flags.froughness, 0, 1, BRUSHED_BRASS.face.roughness),
        anisotropy: clamp(flags.aniso, 0, 1, BRUSHED_BRASS.face.anisotropy),
        anisotropyRotation: clamp(flags.anisorot, -Math.PI, Math.PI, BRUSHED_BRASS.face.anisotropyRotation),
        grainEm: clamp(flags.grainem, 0.002, 0.2, BRUSHED_BRASS.face.grainEm),
        grainContrast: clamp(flags.grain, 0, 1, BRUSHED_BRASS.face.grainContrast),
      },
      edge: {
        strength: clamp(flags.estrength, 0, 4, BRUSHED_BRASS.edge.strength),
        roughness: clamp(flags.eroughness, 0, 1, BRUSHED_BRASS.edge.roughness),
      },
    },
  }));
  const metalLook = spec.material.kind === "brushed-metal" ? spec.material : null;
  const setLook = (patch: (m: NonNullable<typeof metalLook>) => NonNullable<typeof metalLook>) =>
    setSpec((s) => (s.material.kind === "brushed-metal" ? { ...s, material: patch(s.material) } : s));
  // the judging studio — bench state, NOT a spec part (the Architect): room applies on release (each value caches its own
  // ~8 MB float copy and PMREM, never freed — `studio-hdri.ts`), yaw per tick
  const [roomShown, setRoomShown] = useState(clamp(flags.room, 0, 1, JUDGING_STUDIO.room));
  const [room, setRoom] = useState(roomShown);
  // ⛔ 305° — THE REFLECTION CENTRED AND BALANCED (Carl, 23 October: "the reflection from the HDRI should be more balanced.
  // Centred on the middle the edges are getting lost"). MEASURED across the word in fifths, perspective front, 5° steps
  // (`live-work/scripts/film04-pass2-balance-23-october.mjs`): 305° left 26.2 · middle 39.3 · right 29.1 — the middle
  // lit, both ends held at ~70% of it. 15° (23.2 / 52.0 / 23.5) is centred too but its ends fall below half — lost; 30°
  // (the brightest, the take-2 setting) was right-heavy, 24.8 / 31.7 / 49.6. ⚠ A judging fixture, not a design value —
  // pass 3 lights it. History: 15° (orthographic, step 1), 30° (perspective brightest, take 2).
  // ⛔ THE ARCH's TURN IS ITS OWN — 355° (session 2, 23 October): the arch is TALL, so its balance runs feet to lintel, not
  // left to right. MEASURED on the FACE alone over a fixed mask, in bands bottom-up — lower legs · upper legs · head · lintel
  // (`live-work/scripts/film04-pass2-arch-balance-23-october.mjs`): at the line's 305° 141 · 130 · 144 · 81, the lintel
  // lost (the top of a tall piece reflects another height of the studio); at 355° 83 · 94 · 87 · 93, the face's whole
  // 89 against the line's 95 — AT THE LINE's OWN STRENGTH, so the material stays one and only the light differs (Carl's
  // "same material… differ with the use of light"). 345° and 265° are evener (0.94–0.95 against 0.89) but sit at ~59 and
  // would need the face's strength doubled. ⚠ A judging fixture, not a design value.
  // ⛔ the values live in `JUDGING_STUDIO` (`lettering-material.ts`), shared with the page `/proto/your-words`
  const [yaw, setYaw] = useState(clamp(flags.yaw, -360, 360, JUDGING_STUDIO.yawDeg[flags.layout === "line" ? "line" : "arch"]));
  // device px per layout px on the face, from the front camera's framing — the grain's floor (`FramingReport`)
  const [devicePxPerUnit, setDevicePxPerUnit] = useState<number | null>(null);
  const camPose = (() => {
    const [a, e] = (flags.cam ?? "").split(",").map(Number);
    return Number.isFinite(a) && Number.isFinite(e) ? { az: a, el: e } : OBLIQUE_POSE;
  })();
  const fontRejected = flags.font !== undefined && !(flags.font in SHOWCASE_FONTS);
  const [view, setView] = useState<View>(VIEWS.includes(flags.view as View) ? (flags.view as View) : "front");
  const [mode, setMode] = useState<Mode>(MODES.includes(flags.mode as Mode) ? (flags.mode as Mode) : "clay");
  const [az, setAz] = useState(clamp(flags.az, -90, 90, KEY_DEFAULT.az));
  const [el, setEl] = useState(clamp(flags.el, 0, 85, KEY_DEFAULT.el));
  const set = <K extends keyof LetteringSpec>(k: K, v: LetteringSpec[K]) => setSpec((s) => ({ ...s, [k]: v }));
  const setEdge = (v: number) => setSpec((s) => ({ ...s, bevel: { ...s.bevel, sizeEm: v, thicknessEm: v } }));
  const setArch = <K extends keyof ArchLayout>(k: K, v: ArchLayout[K]) =>
    setSpec((s) => (s.layout.kind === "arch" ? { ...s, layout: { ...s.layout, [k]: v } } : s));
  const arch = spec.layout.kind === "arch" ? spec.layout : null;
  // the crown letter: the middle of an odd-length arch word (equal steps put it at the top) — the one Carl nudged. A
  // round arch has no fixed crown letter (the spacing decides where each stands).
  const archSet = arch ? setCase(arch.arch, arch).replace(/\s/g, "") : "";
  const round = arch?.form === "round";
  const crown = arch && !round && arch.steps === "equal" && archSet.length % 2 === 1 ? archSet[(archSet.length - 1) / 2] : null;

  // ⛔ THE MEASUREMENT AND THE BUILD — `lettering-hooks.tsx` (lifted 23 October, session 2; the same timings and keys)
  const lines = useLines(spec);
  const font = useShowcaseFont(spec.font);
  const { spans, measured } = useMeasured(font, lines, spec.font, spec.sizePx);
  const ok = !!measured && !measured.check.stops.length;
  // TAKE 1 — the line, one merged mesh
  const made = useLineBuild(!!arch, font, measured, spec);
  // TAKE 2 — the arch's letters, each built once per shape; sweep, gap and tracking only move them
  const shapeKey = archShapeKey(arch, spec);
  const letters = useArchLetters(shapeKey, font);
  const archGlyphs = measured?.glyphs.arch;
  const topGlyphs = measured?.glyphs.top;
  const placed = useArchPlacement(arch, font, letters, shapeKey, measured, spec.sizePx);
  // the collision check — once the sliders STOP
  const report = useArchCollisions(placed, letters, spec.sizePx);

  const matcap = useMemo(() => (typeof document === "undefined" ? null : makeMatcap()), []);
  const materials = useMemo(
    () => ({
      clay: new THREE.MeshStandardMaterial({ ...CLAY, metalness: 0 }),
      flat: new THREE.MeshStandardMaterial({ ...CLAY, metalness: 0, flatShading: true }),
      mesh: new THREE.MeshBasicMaterial({ color: "#c8c8c8", wireframe: true }),
      normals: new THREE.MeshNormalMaterial(),
      zebra: new THREE.MeshMatcapMaterial({ matcap }),
    }),
    [matcap],
  );
  useEffect(() => () => { for (const m of Object.values(materials)) m.dispose(); matcap?.dispose(); }, [materials, matcap]);

  // PASS 2 — the studio and the metal, in the material mode: the LINE first (23 October), then the ARCH (session 2, Carl:
  // "its the same material" — one look on both, no plan round), its grain laid as bricks (`ArchGrain`)
  const metalOn = mode === "material" && !!metalLook;
  const [hdri, setHdri] = useState<{ room: number; tex: THREE.Texture } | null>(null);
  useEffect(() => {
    if (!metalOn) return;
    let live = true;
    loadStudioHdri(STUDIO_HDRI_SRC, room).then((tex) => live && setHdri({ room, tex }));
    return () => {
      live = false;
    };
  }, [metalOn, room]);
  // the shared texture is the studio module's (cached per page) — never disposed here; the materials are ours
  const metal = useMemo(() => (hdri ? createBrushedMetal(hdri.tex) : null), [hdri]);
  useEffect(() => () => metal?.dispose(), [metal]);
  const metalReady = metalOn && !!metal && hdri?.room === room;
  /**
   * ⛔ THE MIRROR PROBE — an INSTRUMENT, not the design (`?mode=material&probe=mirror`). A flat panel in the FACE material,
   * its UVs oriented as the letters' faces are (u along +x, v along +y — `PlaneGeometry`), the size of the words, in their
   * place. Step 1's first orientation reading was measured on the LETTERS and flipped between two yaws: whole-word gradients
   * depend on where a softbox edge happens to fall. A panel reflects the studio ITSELF, so how a rotation softens its
   * vertical vs horizontal edges, against no brushing and over a full turn of the studio, says which way it smears.
   */
  const probeMirror = metalOn && flags.probe === "mirror";
  const mirrorGeo = useMemo(
    () => (probeMirror && made?.stats ? new THREE.PlaneGeometry(made.stats.widthPx, made.stats.heightPx * 2) : null),
    [probeMirror, made],
  );
  useEffect(() => () => mirrorGeo?.dispose(), [mirrorGeo]);

  // what is shown: a mesh built before a check failed is never shown (derived, not cleared in an effect)
  const lineBuilt = !arch && ok ? made : null;
  const archShown = useMemo(() => (arch && ok && placed && letters ? { placed, letters } : null), [arch, ok, placed, letters]);
  const stats: LetteringStats | ArchStats | null = useMemo(
    () =>
      arch
        ? archShown
          ? {
              triangles: archShown.letters.triangles,
              buildMs: archShown.letters.buildMs,
              widthPx: archShown.placed.reading.widthPx,
              heightPx: archShown.placed.reading.heightPx,
              missing: archShown.letters.missing,
              pairs: [],
              arch: archShown.placed.reading,
              collisions: report,
            }
          : null
        : (lineBuilt?.stats ?? null),
    [arch, archShown, report, lineBuilt],
  );

  // the tracking probe: the same layout and check at another arch tracking (positions derived from this reading)
  const probe = useMemo(() => {
    if (!arch || !font || !letters || !archGlyphs || !topGlyphs) return undefined;
    return (trackEm: number, patch?: Partial<ArchLayout>): ProbeResult | null => {
      const x = shiftX(archGlyphs, trackEm - arch.archTrackingEm, spec.sizePx);
      const p = layoutArch({ ...arch, ...patch }, font, spec.sizePx, letters.list, x, topGlyphs);
      const r = checkCollisions(letters.list, p.placements, COLLISION_MARGIN_EM * spec.sizePx);
      return { trackEm, collisions: r.collisions, tight: r.tight, worst: r.worst, neighbours: r.neighbours, radiusPx: p.reading.radiusPx, feetDeg: p.reading.feetDeg };
    };
  }, [arch, font, letters, archGlyphs, topGlyphs, spec.sizePx]);

  useEffect(() => {
    window.__showcaseBench = {
      ready: (arch ? !!archShown && !!report : !!lineBuilt?.geometry) && (mode !== "material" || metalReady),
      stats,
      spec,
      fontCheck: measured?.check ?? null,
      probe,
    };
  }, [arch, archShown, report, lineBuilt, stats, spec, measured, probe, mode, metalReady]);

  const check = measured?.check;
  const select = "bg-neutral-900 border border-neutral-700 px-2 py-1";
  const em = (px: number) => (px / spec.sizePx).toFixed(3);
  const short = !!stats && "arch" in stats && !stats.arch.fits;
  const blocked = (check && check.stops.length > 0) || (report && (report.collisions > 0 || report.tight > 0)) || short;

  return (
    <div className="space-y-4">
      {/* ⛔ the measuring spans (`lettering-hooks.tsx`) — the kern-on ones are the words' accessible text, in order */}
      <MeasureSpans lines={lines} fontKey={spec.font} spans={spans} accessible />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {arch ? (
          <>
            <label className="flex items-center gap-2">
              top
              <input value={arch.top} onChange={(e) => setArch("top", e.target.value)} className={`${select} w-40`} />
            </label>
            <label className="flex items-center gap-2">
              arch
              <input value={arch.arch} onChange={(e) => setArch("arch", e.target.value)} className={`${select} w-48`} />
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={arch.caps} onChange={(e) => setArch("caps", e.target.checked)} /> capitals
            </label>
            <label className="flex items-center gap-2">
              form
              <select value={arch.form} onChange={(e) => setArch("form", e.target.value as ArchLayout["form"])} className={select}>
                <option value="round">round-headed, on upright legs</option>
                <option value="half">half-circle</option>
              </select>
            </label>
            {!round && (
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={arch.steps === "equal"} onChange={(e) => setArch("steps", e.target.checked ? "equal" : "font")} /> equal steps
              </label>
            )}
          </>
        ) : (
          <label className="flex items-center gap-2">
            words
            <input value={spec.words} onChange={(e) => set("words", e.target.value)} className={`${select} w-56`} />
          </label>
        )}
        <label className="flex items-center gap-2">
          view
          <select value={view} onChange={(e) => setView(e.target.value as View)} className={select}>
            <option value="front">front, face-on</option>
            <option value="oblique">oblique, turn to look round</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          mode
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} className={select}>
            <option value="clay">clay</option>
            <option value="flat">flat, each facet shown</option>
            <option value="mesh">mesh, the triangles as built</option>
            <option value="normals">normals</option>
            <option value="zebra">zebra, surface continuity</option>
            <option value="material">material, in the studio</option>
          </select>
        </label>
      </div>

      {(fontRejected || blocked || (stats && stats.missing.length > 0)) && (
        <div className="border border-red-900 bg-red-950/40 text-red-200 text-sm p-3 space-y-1 max-w-4xl">
          {fontRejected && <p>The font &quot;{flags.font}&quot; is not one this page offers, so it shows {spec.font}.</p>}
          {check?.stops.map((s) => <p key={s}>{s}</p>)}
          {report && report.collisions > 0 && (
            <p>
              {report.collisions} pair{report.collisions > 1 ? "s" : ""} of letters overlap:{" "}
              {report.pairs.filter((p) => p.collide).map((p) => p.pair).join(", ")}. Open the arch with more letter-spacing or a different sweep.
            </p>
          )}
          {report && report.collisions === 0 && report.tight > 0 && (
            <p>
              {report.tight} pair{report.tight > 1 ? "s" : ""} of letters sit closer than {COLLISION_MARGIN_EM} em:{" "}
              {report.pairs.filter((p) => !p.collide && p.clearancePx < report.marginPx).map((p) => `${p.pair} ${em(p.clearancePx)} em`).join(", ")}.
            </p>
          )}
          {short && <p>At this width the letters cannot reach round the arch to the right foot. Narrow the arch or open the spacing.</p>}
          {stats && stats.missing.length > 0 && <p>This font has no {stats.missing.map((c) => `"${c}"`).join(", ")}, so those characters are left out.</p>}
        </div>
      )}

      <div className="relative w-full border border-neutral-800" style={{ height: "calc(60 * var(--vh))", background: "#0a0a0a" }} aria-hidden>
        <Canvas key={view} gl={{ antialias: true, alpha: true }} resize={{ offsetSize: true }} dpr={dpr} frameloop="demand">
          {view === "front" ? (
            <FrontCamera widthPx={stats?.widthPx ?? 0} heightPx={stats?.heightPx ?? 0} perspective={metalOn} />
          ) : (
            <ObliqueCamera widthPx={stats?.widthPx ?? 0} heightPx={stats?.heightPx ?? 0} azDeg={camPose.az} elDeg={camPose.el} />
          )}
          <ToneMapping neutral={metalOn} />
          {/* lit by the studio ALONE in the material mode, as the desk mark's pass 2 was judged */}
          {!metalOn && <ShapeLight az={az} el={el} />}
          {metalOn && metal && metalLook && <MetalApply metal={metal} look={metalLook} yawDeg={yaw} sizePx={spec.sizePx} />}
          {view === "front" && <FramingReport onDevicePxPerUnit={setDevicePxPerUnit} />}
          {mirrorGeo && metal && <mesh geometry={mirrorGeo} material={metal.face} />}
          {lineBuilt?.geometry && !mirrorGeo && (
            // the line's two groups: the brushed FACE (materialIndex 0), the polished SIDES — walls and chamfer (1)
            <mesh geometry={lineBuilt.geometry} material={metalOn ? (metal ? [metal.face, metal.edge] : materials.clay) : materials[mode === "material" ? "clay" : mode]} />
          )}
          {archShown && <ArchGrain shown={archShown} />}
          {archShown &&
            archShown.letters.list.map((l) => {
              const p = archShown.placed.placements.get(l)!;
              // each letter keeps three's own groups: the brushed FACE (materialIndex 0), the polished SIDES (1)
              const material = metalOn ? (metal ? [metal.face, metal.edge] : materials.clay) : materials[mode === "material" ? "clay" : mode];
              return <mesh key={`${l.line}${l.index}`} geometry={archShown.letters.geos.get(l)} material={material} position={[p.x, p.y, 0]} />;
            })}
        </Canvas>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-sm">
        <div className="space-y-2">
          <div className="text-neutral-500">the setting</div>
          <Slider label="size" value={spec.sizePx} min={40} max={400} step={1} onChange={(v) => set("sizePx", v)} fmt={(v) => `${v} px`} />
          {arch ? (
            <>
              {round ? (
                <>
                  <Slider label="arch width" value={arch.radiusEm} min={0.5} max={4} step={0.01} onChange={(v) => setArch("radiusEm", v)} fmt={(v) => `radius ${v.toFixed(2)} em`} />
                  <Slider label="letter spacing" value={arch.clearEm} min={0} max={0.6} step={0.005} onChange={(v) => setArch("clearEm", v)} fmt={(v) => `${v.toFixed(3)} em · ${(v * spec.sizePx).toFixed(1)} px`} />
                </>
              ) : (
                <>
                  <Slider label="arch sweep" value={arch.sweepDeg} min={SWEEP_MIN} max={SWEEP_MAX} step={1} onChange={(v) => setArch("sweepDeg", v)} fmt={(v) => `${v}°`} />
                  <Slider label={arch.steps === "equal" ? "arch size" : "arch spacing"} value={arch.archTrackingEm} min={0} max={0.3} step={0.005} onChange={(v) => setArch("archTrackingEm", v)} fmt={(v) => `${v.toFixed(3)} em`} />
                </>
              )}
              {crown && (
                <Slider
                  label={`${crown} nudge`}
                  value={arch.nudgeEm[crown] ?? 0}
                  min={-0.1}
                  max={0.1}
                  step={0.002}
                  onChange={(v) => setArch("nudgeEm", { ...arch.nudgeEm, [crown]: v })}
                  fmt={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(3)} em · ${(v * spec.sizePx).toFixed(1)} px`}
                />
              )}
              <Slider label="top size" value={arch.topScale} min={0.3} max={2} step={0.01} onChange={(v) => setArch("topScale", v)} fmt={(v) => `× ${v.toFixed(2)}`} />
              <Slider label="top gap" value={arch.gapEm} min={0} max={1.5} step={0.01} onChange={(v) => setArch("gapEm", v)} fmt={(v) => `${v.toFixed(2)} em`} />
            </>
          ) : (
            <Slider label="tracking" value={spec.trackingEm} min={-0.1} max={0.3} step={0.005} onChange={(v) => set("trackingEm", v)} fmt={(v) => `${v.toFixed(3)} em`} />
          )}
          <div className="text-neutral-500 pt-2">the shape (⚠ starting values for Carl&apos;s eye)</div>
          <Slider label="depth" value={spec.depthEm} min={0} max={1} step={0.01} onChange={(v) => set("depthEm", v)} fmt={(v) => `${v.toFixed(2)} em · ${(v * spec.sizePx).toFixed(0)} px`} />
          <Slider label="edge" value={spec.bevel.sizeEm} min={0} max={0.08} step={0.002} onChange={setEdge} fmt={(v) => (v === 0 ? "none" : `${v.toFixed(3)} em · ${(v * spec.sizePx).toFixed(1)} px`)} />
          <Slider label="edge steps" value={spec.bevel.segments} min={1} max={8} step={1} onChange={(v) => set("bevel", { ...spec.bevel, segments: v })} fmt={(v) => (v === 1 ? "1, a chamfer" : `${v}, rounded`)} />
          <Slider label="smoothness" value={spec.curveSegments} min={2} max={32} step={1} onChange={(v) => set("curveSegments", v)} fmt={(v) => `${v} per curve`} />
          <Slider label="crease" value={spec.creaseDeg} min={0} max={44} step={0.5} onChange={(v) => set("creaseDeg", v)} fmt={(v) => (v === 0 ? "none, faceted" : `smooth below ${v}°`)} />
          {metalLook && (
            <>
              <div className="text-neutral-500 pt-2">the material (⚠ starting values, judged under Neutral tone mapping)</div>
              <Slider label="tone" value={metalLook.tone} min={0} max={1} step={0.01} onChange={(v) => setLook((m) => ({ ...m, tone: v }))} fmt={(v) => (v === 0 ? "brass" : `${(v * 100).toFixed(0)}% to no colour`)} />
              <Slider label="face strength" value={metalLook.face.strength} min={0} max={2} step={0.01} onChange={(v) => setLook((m) => ({ ...m, face: { ...m.face, strength: v } }))} fmt={(v) => `× ${v.toFixed(2)}`} />
              <Slider label="edge strength" value={metalLook.edge.strength} min={0} max={4} step={0.05} onChange={(v) => setLook((m) => ({ ...m, edge: { ...m.edge, strength: v } }))} fmt={(v) => `× ${v.toFixed(2)}`} />
              <Slider label="face roughness" value={metalLook.face.roughness} min={0} max={1} step={0.01} onChange={(v) => setLook((m) => ({ ...m, face: { ...m.face, roughness: v } }))} />
              <Slider label="brushing" value={metalLook.face.anisotropy} min={0} max={1} step={0.01} onChange={(v) => setLook((m) => ({ ...m, face: { ...m.face, anisotropy: v } }))} fmt={(v) => (v === 0 ? "none" : v.toFixed(2))} />
              <Slider label="brush turn" value={metalLook.face.anisotropyRotation} min={-Math.PI} max={Math.PI} step={0.01} onChange={(v) => setLook((m) => ({ ...m, face: { ...m.face, anisotropyRotation: v } }))} fmt={(v) => `${((v * 180) / Math.PI).toFixed(0)}°`} />
              <Slider
                label="grain pitch" value={metalLook.face.grainEm} min={0.002} max={0.1} step={0.001}
                onChange={(v) => setLook((m) => ({ ...m, face: { ...m.face, grainEm: v } }))}
                fmt={(v) => {
                  const floor = devicePxPerUnit ? 2 / (devicePxPerUnit * spec.sizePx) : null;
                  return `${v.toFixed(3)} em${floor ? (v < floor ? " ⚠ below floor" : ` (floor ${floor.toFixed(3)})`) : ""}`;
                }}
              />
              <Slider label="grain contrast" value={metalLook.face.grainContrast} min={0} max={1} step={0.01} onChange={(v) => setLook((m) => ({ ...m, face: { ...m.face, grainContrast: v } }))} fmt={(v) => (v === 0 ? "none" : v.toFixed(2))} />
              <Slider label="edge roughness" value={metalLook.edge.roughness} min={0} max={1} step={0.01} onChange={(v) => setLook((m) => ({ ...m, edge: { ...m.edge, roughness: v } }))} />
              <div className="text-neutral-500 pt-2">the judging studio (not part of the design)</div>
              <Slider label="studio turn" value={yaw} min={-360} max={360} step={1} onChange={setYaw} fmt={(v) => `${v}°`} />
              <Slider label="studio room" value={roomShown} min={0} max={1} step={0.01} onChange={setRoomShown} onCommit={setRoom} fmt={(v) => `${v.toFixed(2)} (on release)`} />
            </>
          )}
          <div className="text-neutral-500 pt-2">light, to rake across the shape</div>
          <Slider label="key azimuth" value={az} min={-90} max={90} step={1} onChange={setAz} fmt={(v) => `${v}°`} />
          <Slider label="key elevation" value={el} min={0} max={85} step={1} onChange={setEl} fmt={(v) => `${v}°`} />
        </div>
        <div className="space-y-1 text-neutral-300 tabular-nums">
          <div className="text-neutral-500">the font</div>
          <div>{check ? (check.faceLoaded ? `✅ "${check.family}" loaded` : `⛔ "${check.family}" not loaded`) : "measuring…"}</div>
          {check?.lines.map((c) => (
            <div key={c.key}>
              {c.proof.ok ? "✅" : "⛔"} {check.lines.length > 1 ? <>&quot;{c.words}&quot;: </> : null}the browser&apos;s font matches the outline file, worst{" "}
              {c.proof.worstPx.toFixed(3)} px · kerned pairs {c.kernedPairs} of {c.kerns.length}
              {c.kerns.some((k) => Math.abs(k.kernPx) > 0.01) &&
                ` (${c.kerns.filter((k) => Math.abs(k.kernPx) > 0.01).map((k) => `${k.pair} ${k.kernPx.toFixed(2)}`).join(" · ")} px)`}
            </div>
          ))}
          <div className="text-neutral-500 pt-2">the mesh</div>
          {stats ? (
            <>
              <div>{stats.triangles.toLocaleString()} triangles · built in {stats.buildMs.toFixed(1)} ms · {stats.widthPx.toFixed(1)} × {stats.heightPx.toFixed(1)} px</div>
              {"arch" in stats ? (
                <>
                  <div className="text-neutral-400">
                    radius {stats.arch.radiusPx.toFixed(1)} px ({em(stats.arch.radiusPx)} em) ·{" "}
                    {round
                      ? `legs ${stats.arch.legPx.toFixed(1)} px (${em(stats.arch.legPx)} em)${stats.arch.fits ? "" : ", none: too wide"}`
                      : `feet at ${stats.arch.feetDeg[0].toFixed(2)}° and ${stats.arch.feetDeg[1].toFixed(2)}°`}{" "}
                    · laid out in {stats.arch.layoutMs.toFixed(2)} ms
                  </div>
                  {stats.collisions && (
                    <div className="text-neutral-400">
                      gaps round the arch: {stats.collisions.neighbours.map((n) => `${n.pair} ${n.collide ? "OVERLAP" : `${n.clearancePx.toFixed(1)} px`}`).join(" · ")}
                    </div>
                  )}
                  <div className="text-neutral-400">
                    {stats.collisions
                      ? `${stats.collisions.collisions ? "⛔" : stats.collisions.tight ? "⚠" : "✅"} closest pair ${stats.collisions.worst ? `${stats.collisions.worst.pair} ${stats.collisions.worst.collide ? "OVERLAP" : `${em(stats.collisions.worst.clearancePx)} em`}` : "—"} · ${stats.collisions.tested} pairs tested in ${stats.collisions.checkMs.toFixed(1)} ms`
                      : "checking the spacing…"}
                  </div>
                </>
              ) : (
                <div className="text-neutral-400">gaps between letters (silhouette): {stats.pairs.map((p) => `${p.pair} ${p.visibleGapPx.toFixed(1)}`).join(" · ")}</div>
              )}
            </>
          ) : (
            <div>{check?.stops.length ? "not built" : "building…"}</div>
          )}
        </div>
      </div>
    </div>
  );
}
