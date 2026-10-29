"use client";

/**
 * ⛔ THE CAMERA BENCH — the RECORDER (`/proto/camera`; D-104). R1 (`live-work/plan-camera-recorder-r1-26-october.md` v2.3):
 * Carl's *"A should start the tracking of the movement and pressing it again should stop it"*; chunks as CLIPS. ⛔ T1a, CAMERA
 * TRACKS (`live-work/plan-camera-tracks-t1a-27-october.md` v2, under the note `structural-note-camera-recorder-26-october.md`
 * v3.1; Carl: *"Approved. Proceed"*): a TRACK PER CAMERA, clips PLACED IN TIME, the TOP track plays (Resolve's A / B roll),
 * a recording over a clip is a NEW TAKE on top (nothing destroyed; R1's Overwrite and punch-in RETIRED), a selection plays
 * SOLO, gaps HOLD the last picture. R1's saved chains are MIGRATED and PROVEN on load (`loadChain`). The chain is handed to
 * the Builder to refine in R2. Chunk 1's keyframes are RETIRED.
 *
 * - ⛔ THE ARCH (R-093's scene) is drawn by the SHARED `LetteringPiece` — one mechanism with the page.
 * - ⛔ ONE FRAME CALLBACK (`BenchStore.frame`): the pad polled, the rig, the recording, playback. The ONE thing outside it is a
 *   hidden tab, which draws no frames: a `visibilitychange` listener calls `stopRecording` (note decision 4).
 * - ⛔ A RECORDING LIVES IN THE STORE, never React state, and reaches React and storage ONCE, when it stops (note 4a).
 * - ⛔ THE CHAIN (`bench-chain.ts`, pure, checked under Node) saved in this browser when it CHANGES; a failed save is SHOWN.
 * - ⛔ FAILURE IN PLAIN WORDS: the no-WebGL net (`webglcontextcreationerror` in the CAPTURE phase), `Guard`, a lost context,
 *   the font / collision checks, a saved chain that cannot be read (kept aside, unread).
 * - ⚠ NOT WATCHED BY ANY TEST: how the pad FEELS (`camera-pad.ts`, `FEEL`) — Carl's hands only.
 * - ⛔ THE WORLD's SCALE (Carl, 26 October 2026 — *"Scale for the world"*, *"put a grid on the floor for the arch to sit
 *   on. Give me some numbers for the arch."*): ONE LAYOUT PX = ONE CENTIMETRE, Unreal's unit (`CM_PER_PX`). A READING —
 *   the arch, its light and film 4's page are unchanged; the scale names what the numbers mean. The FLOOR is the arch's
 *   lowest ink; the GRID lies on it (1 m squares, every line one weight), its lines through the arch's centre line and
 *   along its front face, so the squares count metres right of centre and out from the face. Round the FOCUS OBJECT (the C,
 *   `FOCUS`) the squares SUBDIVIDE into 10 cm once the camera is within 3 m of it.
 */
import { Fragment, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid, Line, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useCanvasDpr } from "@/lib/use-site-scale";
import { FRONT_FOV, MeasureSpans } from "./lettering-hooks";
import { Guard, LetteringPiece, measurePiece, NeutralToneMapping, usePieceBuild, type Built, type PieceMeasure } from "./lettering-piece";
import { BTN, Edges, focalMm, readPad, rigAt, SENSOR_MM, stepRig, FEEL, type Intent, type Rig } from "./camera-pad";
import {
  addTrack, applyEdit, chainEnd, clampDt, clipEnd, clipLength, clipPoseAt, deleteClips, EDGE_S, editPoints, emptyChain, gapsOf, isTrimmed, joinsOf, numberClips,
  newClipId, parityV1, parseChain, placeShape, poseAtT, poseInShape, recaptureStart, recordClip, replaceShape, Sampler, setTrim, shapeRefusal, sourceAt, startSpeed,
  takesAt, trackPoseAt, trackPath, clipPath, type Chain, type Clip, type Edit, type Pose, type Shape, type Units,
} from "./bench-chain";
import { BenchTransport, type Tone, type TransportView } from "./bench-transport";
import { BenchTimeline, camColour } from "./bench-timeline";
import { BUILDER_TAKE, type BuilderTake } from "./bench-builder-take";

type Mode = "fly" | "rec" | "play";
/** What the UI shows, every 0.1 s: the transport's view, the pad, the camera (world px), the subject's units. */
type View = TransportView & {
  pad: { connected: boolean; id: string };
  mm: number;
  fov: number;
  at: { x: number; y: number; z: number };
  /** the LIVE measure (framing); clips use the chain's units */
  units: { d: number; up: number; zc: number };
  rec: { at: number; length: number; cam: number } | null;
  focusPx?: number;
  /** ⛔ THE THIRD-PERSON VIEW (note v1.3.3): which view fills the picture; the PiP's label; the soloed clip (its path drawn);
   *  the eye's distance to the arch, metres */
  view: "first" | "third";
  pipLabel: string;
  soloId: string | null;
  eyeM: number | null;
};

/** ⛔ ONE LAYOUT PX = ONE CENTIMETRE (Carl's scale, 26 October 2026 — the header). */
const CM_PER_PX = 1;
/** layout px as a reading in metres, unit included — text after a `{…}` that runs to a line's end loses its space in JSX */
const metres = (px: number) => `${((px * CM_PER_PX) / 100).toFixed(2)} m`;
/** ⛔ THE FLOOR STOP (Carl, 27 October 2026: *"The xamera should not be able to pass through the floor."*): the lens no lower
 *  than this above the arch's floor — a camera on a low floor rig, and clear of the 1 cm near plane, so the grid cannot slice
 *  through the picture when the lens looks down. ⚠ A take; flying only (a pose the chain or a jump sets is not clamped). */
const LENS_MIN_CM = 10;

/**
 * The arch in the world (layout px): its box, the FLOOR it stands on (its lowest ink), the CLEAR OPENING — between the
 * legs' inner edges (the letters below the curve's centre) and from the floor to the crown's underside (the N's) — and the
 * two lines' letter heights (the N, the Y). From the letters' own geometry and placements: the meshes `LetteringPiece` draws.
 */
type ArchWorld = {
  floor: number;
  x0: number;
  x1: number;
  top: number;
  z0: number;
  z1: number;
  clearW: number;
  clearH: number;
  archCap: number;
  topCap: number;
  topBase: number;
  /** the FOCUS OBJECT's box (`FOCUS`), or null if the arch has no such letter */
  focus: THREE.Box3 | null;
  /** ⛔ every letter's box — the ONE source the clash warning reads (never a copied list) */
  letters: { ch: string; line: "arch" | "top"; box: THREE.Box3 }[];
};

/**
 * ⛔ THE FOCUS OBJECT (Carl, 26 October 2026: *"we will probably see the hero logo from afar first. We might zoom in. That
 * will be our focus object in that moment. The 1m square should stay, but should also be subdivided by 10. Thinner lines of
 * 10cm square. So we can test it on the C. If the camera gets within, say 3m of a focus object the square can subdivide and
 * show itself."*). THE C at the base of the left column — the test object; choosing a focus object is not built.
 * The 10 cm lines GROW IN (their thickness 0 → full) as the camera's distance to the object's nearest surface closes from
 * `FINE_FROM_CM` to `FINE_FULL_CM` — the Builder's ramp, so they do not pop. ⚠ Takes.
 */
const FOCUS = { line: "arch", ch: "C" } as const;
const FINE_FROM_CM = 300;
const FINE_FULL_CM = 260;
/** ⛔ A FULL PIXEL — at 0.5 the lines were under a pixel wide and broke into dashes at a slant (Carl: "some of the lines are
 *  breaking up"); they read thinner than the metre lines by their dimmer colour instead */
const FINE_THICKNESS = 1;
/** ⛔ ONLY THE SQUARES ROUND THE OBJECT (Carl: "Every square need not be sub divided, only the ones around the focus
 *  object") — the metre squares within this margin of its footprint; the C stands on the front-face line, so the margin
 *  takes in the squares in front of it as well as those it stands in (was: a fixed 4 m patch) */
const FINE_MARGIN_CM = 10;

/**
 * ⛔ THE LINES BY COLOUR (Carl: *"If it helps redefine the lines by colour"*) — as Fusion, Unreal and Blender draw theirs:
 * the metre lines neutral; the 10 cm lines a dim cool blue (never read as a metre line, or as the brass); the two lines the
 * readout measures from in AXIS COLOURS — the arch's FRONT FACE (it runs along x) red, the CENTRE LINE (along z) blue,
 * Unreal's and Fusion's x and z. ⚠ Colours are the Builder's takes.
 */
const METRE_COLOUR = "#6b6b6b";
const FINE_COLOUR = "#2c4660";
const AXIS_X_COLOUR = "#c0453c";
const AXIS_Z_COLOUR = "#3f6fd0";
/** the axis lines' half-length, each FADING to the bench's ground colour toward its ends (1 − s³: near full strength close
 *  in) — at full strength to the end it ran on past the grid's fade and stood up over the floor like a stub */
const AXIS_REACH_CM = 5000;
const GROUND = "#0a0a0a";
function axisPoints(from: THREE.Vector3, to: THREE.Vector3, colour: string) {
  const a = new THREE.Color(colour), g = new THREE.Color(GROUND);
  const points: [number, number, number][] = [];
  const colours: [number, number, number][] = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const s = Math.abs(t * 2 - 1);
    const c = g.clone().lerp(a, 1 - s * s * s);
    points.push(from.clone().lerp(to, t).toArray() as [number, number, number]);
    colours.push([c.r, c.g, c.b]);
  }
  return { points, colours };
}
function measureArch(built: Built, m: PieceMeasure): ArchWorld | null {
  if (built.kind !== "arch" || !m.crown || !m.curveCentre) return null;
  const all = built.letters.list.map((l) => {
    const p = built.placed.placements.get(l)!;
    const b = new THREE.Box3().setFromBufferAttribute(built.letters.geos.get(l)!.getAttribute("position") as THREE.BufferAttribute);
    return { l, b: b.translate(new THREE.Vector3(p.x, m.up + p.y, 0)) };
  });
  const box = all.reduce((u, { b }) => u.union(b), new THREE.Box3());
  const cy = m.curveCentre.y;
  const legs = all.filter(({ l, b }) => l.line === "arch" && (b.min.y + b.max.y) / 2 < cy);
  const left = legs.filter(({ b }) => b.max.x + b.min.x < 0).map(({ b }) => b.max.x);
  const right = legs.filter(({ b }) => b.max.x + b.min.x > 0).map(({ b }) => b.min.x);
  const height = (line: "arch" | "top", ch: string) => {
    const f = all.find(({ l }) => l.line === line && l.ch.toUpperCase() === ch);
    return f ? f.b.max.y - f.b.min.y : NaN;
  };
  const floor = box.min.y;
  return {
    floor,
    x0: box.min.x,
    x1: box.max.x,
    top: box.max.y,
    z0: box.min.z,
    z1: box.max.z,
    clearW: left.length && right.length ? Math.min(...right) - Math.max(...left) : NaN,
    clearH: m.crown.y - floor,
    archCap: height("arch", "N"),
    topCap: height("top", "Y"),
    topBase: Math.min(...all.filter(({ l }) => l.line === "top").map(({ b }) => b.min.y)) - floor,
    focus: all.find(({ l }) => l.line === FOCUS.line && l.ch.toUpperCase() === FOCUS.ch)?.b ?? null,
    letters: all.map(({ l, b }) => ({ ch: l.ch.toUpperCase(), line: l.line, box: b })),
  };
}

/** ⛔ THE CHAIN's KEYS — each with its own version inside (`CHAIN_VERSION`, never the shot format's). ⛔ SHAPE CLIPS (note
 *  v3.2 §4): v3 is read first; ONLY when it is ABSENT is v2 (T1a's tracks) read and migrated; only when BOTH are absent is
 *  v1 (R1's) read, migrated and proven. ⛔ ONLY v3 IS EVER WRITTEN: v2 and v1 are never written or removed (Carl, of v1:
 *  *"Only when I say so"*) — so an older checkout in this browser finds its own v2 intact. ⚠ Work done LATER in an older
 *  checkout writes v2, which this build never reads again once v3 exists. Chunk 1's keyed take is left UNREAD. */
const CHAIN_KEY = "c2b-camera-bench-chain-v3";
const CHAIN_KEY_V2 = "c2b-camera-bench-chain-v2";
const CHAIN_KEY_V1 = "c2b-camera-bench-chain-v1";
/** `localStorage` per origin, keys + values — MEASURED 27 October 2026 in Playwright's Chromium (Carl's Chrome's engine,
 *  not his browser): for the carry-over's report of how much the copies use */
const STORAGE_CHARS = 5_242_880;
const MOUSE_DEG_PER_PX = 0.15;
/** ⛔ THE CAMERA REMEMBERED (Carl, 27 October 2026: *"It shouldnt move"* → *"Yes, build it"*): the rig's pose in WORLD px,
 *  saved in this browser when it changes and restored on load — a refresh or a code reload never moves it. Home still goes
 *  to the default view. A per-viewer convenience: a failed read or write falls back to the default view, said nowhere. */
const CAMERA_KEY = "c2b-camera-bench-camera-v1";
/** ⛔ THE EYE REMEMBERED (note v1.3.3 §3): the third-person eye, its own key, as the shot camera's */
const EYE_KEY = "c2b-camera-bench-eye-v1";
/** the eye's lens on a first visit — wide, to see the scene (the bumpers zoom it, as the shot camera's) */
const EYE_FOV = 50;
function savedRig(key = CAMERA_KEY): Rig | null {
  try {
    const o = JSON.parse(window.localStorage.getItem(key) ?? "null") as Record<string, number> | null;
    const k = ["x", "y", "z", "yaw", "pitch", "fov"];
    return o && k.every((n) => Number.isFinite(o[n])) ? rigAt(o.x, o.y, o.z, o.yaw, o.pitch, o.fov) : null;
  } catch {
    return null; // unreadable storage: the default view
  }
}
/** what the store derives from a chain ON CHANGE, never per frame */
const derive = (chain: Chain) => ({ points: editPoints(chain), end: chainEnd(chain), numbers: numberClips(chain) });
const NOTICE_MS = 4000;
const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/** World ↔ subject units. The subject's centre is (0, up, zc); d the front distance. ⛔ SHAPE CLIPS: every clip pose
 *  converts through the CHAIN's units (`chain.units`), never the live measure — the recorder, playback, the join metres and
 *  the inspector's metres; so no clip moves when the window's shape moves the live `d` (note v3.2 §4). */
const toWorld = (u: Units, p: { x: number; y: number; z: number }) => ({ x: p.x * u.d, y: u.up + p.y * u.d, z: u.zc + p.z * u.d });
const toUnits = (u: Units, w: { x: number; y: number; z: number }) => ({ x: w.x / u.d, y: (w.y - u.up) / u.d, z: (w.z - u.zc) / u.d });
/** The page's own start: face-on at (0, 0, d) in the WORLD on the LIVE `d` — the front distance from the arch's FRONT, not
 *  its middle. ⛔ A DELIBERATE SECOND VALUE OF `d` (note v3.2 §4, named under §5a): framing is about THIS window, so Home,
 *  the camera's `far` and the rig's first pose stay on the live `d`; clips stay on the chain's. Here expressed in the
 *  CHAIN's units for the harness (`__cameraBench.front`), so it compares like with like. */
const frontIn = (u: Units, m: PieceMeasure): Pose => ({ ...toUnits(u, { x: 0, y: 0, z: m.d }), yaw: 0, pitch: 0, fov: FRONT_FOV });

/**
 * ⛔ THE BENCH's ONE MUTABLE STORE — the chain (mirrored), the playhead, the armed track, the recording, the rig, the
 * inputs; changed only through these methods. React holds what the page SHOWS (the chain, the selection, the view); the
 * store COMMITS a changed chain to it (a stop, a delete, a new track) and nothing else. `frame()` is the whole of the one
 * frame callback.
 *
 * ⛔ T1a, CAMERA TRACKS (the plan `live-work/plan-camera-tracks-t1a-27-october.md` v2): A ALWAYS RECORDS, on the ARMED
 * track, at the PLAYHEAD (Carl: Overwrite *"Drop it"*; a recording over or into a clip is a NEW TAKE on top, the old kept).
 * ⛔ The playhead STAYS PARKED at the scrubbed moment while Carl re-frames (note v2.1): it decides where a take LANDS.
 * "At the end" is DERIVED (`T` at the shot's end), no longer a stored fact with four special cases (R1's [A5]–[B5]).
 */
class BenchStore {
  private chain: Chain;
  /** derived from the chain ON CHANGE, never per frame: the edit points, the end, the clip numbers */
  private derived: { points: number[]; end: number; numbers: Map<string, number> };
  private selection: string[] = [];
  private mode: Mode = "fly";
  private T: number;
  /** the camera HELD at the playhead's pose (after a scrub, a step, a play) until a fly input moves it */
  private posed = false;
  /** the track A records on — the TOP track on load (the Builder's default, stated in the status before A) */
  private armedCam: number;
  private rec: { sampler: Sampler; at: number; cam: number } | null = null;
  /** the play queue: the EDIT (`clip` null — precedence, gaps held) or one clip SOLO (Carl: "The clip solo") */
  private queue: { clip: Clip | null; a: number; b: number }[] = [];
  private queueIdx = 0;
  private queueLabel = "";
  private inGap = false;
  private jumpTo: Pose | "front" | null = null;
  private keys = new Set<string>();
  private mouse = { dx: 0, dy: 0 };
  private rig: Rig | null = null;
  private m: PieceMeasure | null = null;
  private edges = new Edges();
  private hudAt = 0;
  private padWas = false;
  private notice: { text: string; until: number } | null = null;
  /** ⛔ the UI's ONE commit; `action` = Carl did something (it clears the carry-over line); storage is written only for an
   *  action or a chain with clips — the rule stated once, in the UI (the plan v2.1) */
  private ui: { commit: (c: Chain, o: { action: boolean }) => void } | null = null;
  /** a quiet change (the units filled) made before React was attached — `bind()` pushes it */
  private unpushed = false;
  /** the camera as last written to storage (`CAMERA_KEY`) */
  private camSaved = "";
  /** ⛔ THE CAMERA's ROLL (`structural-note-barrel-roll-27-october.md`): set from a clip's pose (only a shape rolls), held
   *  here because `Rig` (`camera-pad.ts`) is locked; any flying, and Home, level it — the pad cannot steer a rolled camera */
  private roll = 0;
  /** ⛔ THE BUILDER's TAKE (`bench-builder-take.ts`), handed in by the page each render — so a code change to the take
   *  reaches even a store made before it — and the version last put on the bench */
  private builderTake: BuilderTake | null = null;
  private builderPlaced = -1;
  setBuilderTake(t: BuilderTake) {
    this.builderTake = t;
  }
  /** ⛔ T1b: THE DRAG IN PROGRESS (`plan-trim-and-move-t1b-29-october.md` v1.4) — the PAGE's, pushed here on every change and
   *  ended only by the page. While set, the picture is `applyEdit` on the CURRENT chain, and recording, delete, the transport,
   *  flying and the Builder's take all wait. Never a copy of the chain. */
  private edit: Edit | null = null;
  /** snapping (Carl: *"snapping always on and the N to turn it off/on"*) — the page's state, mirrored for the harness */
  private snap = true;
  /**
   * ⛔ THE THIRD-PERSON VIEW (`structural-note-third-person-view-29-october.md` v1.3.3, plan v1.2; Carl: *"Right stick click
   * for third person on, click again for off (selected camera view)"*). `eye`: the director's eye's POSE (its camera object
   * is the scene's; `frame()` writes it). ⛔ THIRD PERSON NEVER MOVES THE RIG. `sceneBox` / `archBox`: what "see it all"
   * frames (the scene hands them in on change). `helpers`: each track's camera in WORLD px, computed once a frame in third
   * person, read by the scene (the bodies) and the render callback (the labels).
   */
  private view: "first" | "third" = "first";
  private eye: Rig | null = null;
  private eyeSaved = "";
  private sceneBox: THREE.Box3 | null = null;
  private archBox: THREE.Box3 | null = null;
  private aspect = 16 / 9;
  helpers: { cam: number; x: number; y: number; z: number; yaw: number; pitch: number; roll: number; fov: number; held: boolean; armed: boolean }[] = [];
  get isThird() {
    return this.view === "third";
  }
  setScene(sceneBox: THREE.Box3 | null, archBox: THREE.Box3 | null) {
    this.sceneBox = sceneBox;
    this.archBox = archBox;
  }

  constructor(chain: Chain) {
    this.chain = chain;
    this.derived = derive(chain);
    this.T = this.derived.end;
    this.armedCam = chain.tracks[chain.tracks.length - 1];
  }
  /** ⛔ the existing channel (no new mechanism): a chain changed QUIETLY before React was attached is pushed on binding */
  bind(ui: BenchStore["ui"]) {
    this.ui = ui;
    if (ui && this.unpushed) {
      this.unpushed = false;
      ui.commit(this.chain, { action: false });
    }
  }
  setSelection(ids: string[]) {
    if (!this.rec) this.selection = ids;
  }
  keyDown(code: string) {
    this.keys.add(code);
  }
  keyUp(code: string) {
    this.keys.delete(code);
  }
  keysClear() {
    this.keys.clear();
  }
  addMouse(dx: number, dy: number) {
    this.mouse.dx += dx;
    this.mouse.dy += dy;
  }
  private get atEnd() {
    return this.T >= this.derived.end - EDGE_S;
  }
  private say(text: string) {
    this.notice = { text, until: performance.now() + NOTICE_MS };
  }
  /** ⛔ AN ACTION CLEARS AN OLD NOTICE — a 4 s message had hidden the very state its advice produced (measured 26 October) */
  private acted() {
    this.notice = null;
  }
  private commit(chain: Chain, action = true) {
    this.chain = chain;
    this.derived = derive(chain);
    this.selection = this.selection.filter((id) => chain.clips.some((c) => c.id === id));
    if (!chain.tracks.includes(this.armedCam)) this.armedCam = chain.tracks[chain.tracks.length - 1];
    if (this.ui) this.ui.commit(chain, { action });
    else if (!action) this.unpushed = true;
  }
  /** the rig's pose in the CHAIN's units — what the recorder samples and "Start here" / "End here" capture */
  private pose(): Pose | null {
    const r = this.rig, u = this.chain.units;
    return r && u ? { ...toUnits(u, r), yaw: r.yaw, pitch: r.pitch, fov: r.fov } : null;
  }
  private num(c: Clip) {
    return this.derived.numbers.get(c.id) ?? 0;
  }

  /** A / Space / the record button: stop a recording, stop a play, else RECORD on the armed track at the playhead */
  pressA() {
    if (this.edit) return;
    // ⛔ THIRD PERSON: A refused, said (note v1.3.3 §1) — recording happens in the camera's own view
    if (this.view === "third") return this.say("Third person: right-stick click or T to go to the camera, then record");
    if (this.rec) return this.stopRecording(null);
    if (this.mode === "play") return this.stopPlay(true);
    const pose = this.pose();
    if (!pose) return;
    this.acted();
    this.rec = { sampler: new Sampler(pose), at: this.chain.clips.length ? this.T : 0, cam: this.armedCam };
    this.mode = "rec";
    this.posed = false;
  }
  /** ⛔ STOP — the take reaches React and storage ONCE. `reason` (a hidden tab, a lost pad, View) is shown. */
  stopRecording(reason: string | null) {
    const rec = this.rec;
    const pose = this.pose();
    if (!rec || !pose) return;
    this.rec = null;
    this.mode = "fly";
    // ⛔ THE CAMERA HALTS WHERE THE CLIP ENDED — the rig's weight (`FEEL.smoothS`) would carry it on ~0.3 m after a stop at
    // walking pace, so the next clip began away from this one's end (measured 26 October: a 0.23 m "mismatch" with no
    // move between). Carl: "If its pressed again the 2 take should start from that point". Nothing is filmed between clips.
    if (this.rig) Object.assign(this.rig, { vx: 0, vy: 0, vz: 0, vyaw: 0, vpitch: 0, vfov: 0 });
    const samples = rec.sampler.finish(pose);
    if (samples[samples.length - 1][0] <= EDGE_S) {
      this.say(reason ? `${reason}; nothing was recorded` : "Nothing was recorded");
      return;
    }
    const chain = recordClip(this.chain, rec.cam, rec.at, samples);
    this.T = rec.at + samples[samples.length - 1][0];
    this.commit(chain);
    if (reason) this.say(reason);
  }
  togglePlay() {
    if (this.rec || this.edit) return;
    if (this.mode === "play") return this.stopPlay(true);
    const end = this.derived.end;
    if (end <= EDGE_S) return;
    const sel = this.chain.clips.filter((c) => this.selection.includes(c.id)).sort((a, b) => a.start - b.start || a.order - b.order);
    if (sel.length) {
      // ⛔ A SELECTION PLAYS SOLO (Carl: "The clip solo") — as a clip opened in Resolve's Source viewer; precedence ignored
      this.queue = sel.map((c) => ({ clip: c, a: c.start, b: clipEnd(c) }));
      const nums = sel.map((c) => this.num(c));
      this.queueLabel = nums.length === 1 ? `clip ${nums[0]} solo` : `clips ${nums.join(", ")} solo`;
    } else {
      this.queue = [{ clip: null, a: this.atEnd ? 0 : this.T, b: end }];
      this.queueLabel = "the edit";
    }
    this.acted();
    this.queueIdx = 0;
    this.T = this.queue[0].a;
    this.mode = "play";
    this.posed = true;
  }
  /** a play stopped INSIDE parks the playhead there; `hold` keeps the camera at the playhead's pose */
  private stopPlay(hold: boolean) {
    this.mode = "fly";
    this.posed = hold;
  }
  private advancePlay(dt: number) {
    this.T += dt;
    while (this.T >= this.queue[this.queueIdx].b) {
      if (this.queueIdx < this.queue.length - 1) {
        const over = this.T - this.queue[this.queueIdx].b;
        this.queueIdx++;
        this.T = this.queue[this.queueIdx].a + over;
      } else {
        this.T = this.queue[this.queueIdx].b;
        this.mode = "fly";
        this.posed = true;
        break;
      }
    }
  }
  /** the picture at the playhead: a SOLO clip's own pose while one plays, else the edit (precedence; a gap HELD) */
  private playheadPose(): Pose | null {
    const solo = this.mode === "play" ? this.queue[this.queueIdx]?.clip : null;
    if (solo) {
      this.inGap = false;
      return clipPoseAt(solo, this.T);
    }
    const p = poseAtT(this.chain, this.T);
    this.inGap = !!p?.gap;
    return p?.pose ?? null;
  }
  toStart() {
    if (this.rec || this.edit) return;
    if (!this.chain.clips.length) return this.home(); // [A5] Y on an empty shot: the default view
    this.acted();
    this.mode = "fly";
    this.T = 0;
    this.posed = true;
  }
  toEnd() {
    if (this.rec || this.edit) return;
    this.acted();
    this.mode = "fly";
    this.T = this.derived.end;
    this.posed = this.chain.clips.length > 0;
  }
  scrub(T: number) {
    if (this.rec || this.edit || !this.chain.clips.length) return;
    this.acted();
    this.mode = "fly";
    this.T = Math.max(0, Math.min(T, this.derived.end));
    this.posed = true;
  }
  /** comma / full stop: between the EDIT POINTS on every track; right past the last is To the end */
  step(dir: number) {
    if (this.rec || this.edit || !this.chain.clips.length) return;
    const pts = this.derived.points;
    if (dir > 0) {
      const next = pts.find((s) => s > this.T + EDGE_S);
      return next === undefined ? this.toEnd() : this.scrub(next);
    }
    const prev = [...pts].reverse().find((s) => s < this.T - EDGE_S);
    this.scrub(prev ?? 0);
  }
  /** ⛔ HOME — the DEFAULT view (0, 4.29, 22.71 m, square on, 30°), the playhead untouched. ⛔ [B2] while recording it STOPS
   *  the recording FIRST: a jump inside a clip is never recorded. */
  home() {
    if (this.edit) return;
    // ⛔ THIRD PERSON: View / H frame EVERYTHING (Carl: *"see it all"*); the keyboard's Home key is to-the-start in both views
    if (this.view === "third") return this.frameAll();
    if (this.rec) this.stopRecording("Stopped, then default view");
    if (this.mode === "play") this.stopPlay(false);
    this.posed = false;
    this.jumpTo = "front";
  }
  /** a new camera track ON TOP, armed (was "New camera", which only labelled the next clip) */
  addCamera() {
    if (this.edit) return;
    if (this.rec) return this.say("A camera track cannot be added while recording: stop first (A)");
    this.acted();
    const chain = addTrack(this.chain);
    this.armedCam = chain.tracks[chain.tracks.length - 1];
    this.commit(chain);
  }
  /** arm a track (its header) */
  arm(cam: number) {
    if (this.edit) return;
    if (this.rec) return this.say("The armed track cannot change while recording: stop first (A)");
    if (!this.chain.tracks.includes(cam)) return;
    this.acted();
    this.armedCam = cam;
  }
  /** ⛔ START (pad) / C (keyboard): the armed track, bottom → top → bottom (Carl: "Start cycles the armed track"). ⛔ [C10]
   *  while recording it does nothing, and says why */
  cycleArm() {
    if (this.edit) return;
    if (this.rec) return this.say("Start does nothing while recording: stop first (A)");
    const t = this.chain.tracks;
    this.acted();
    this.armedCam = t[(t.indexOf(this.armedCam) + 1) % t.length];
  }
  deleteSelected() {
    if (this.rec || this.edit || !this.selection.length) return;
    this.acted();
    const chain = deleteClips(this.chain, new Set(this.selection));
    this.selection = [];
    this.commit(chain);
    // nothing ripples: a deleted middle clip leaves a GAP; the playhead only clamps to a shorter shot
    if (this.T > this.derived.end) this.T = this.derived.end;
  }

  // ── ⛔ T1b, TRIM AND MOVE (the plan v1.4) — the PAGE owns the edit and every way a drag ends; the store is handed it
  setSnap(on: boolean) {
    this.snap = on;
  }
  /** a drag starts or moves (the page, on every change). Refused while recording ([A5]); a play stops, as a scrub stops it */
  setEdit(e: Edit | null): boolean {
    if (e && this.rec) return false;
    if (e && !this.edit) {
      this.acted();
      if (this.mode === "play") this.stopPlay(true);
    }
    this.edit = e;
    return true;
  }
  /**
   * ⛔ THE DRAG ENDS — called by the PAGE only (the first ending wins there). `commit`: the edit applied to the chain AS IT IS
   * NOW (never one copied at the press: [R2]) and committed ONCE — an unchanged chain (a move under a frame) saves nothing. A
   * cancel needs no restoring: nothing was changed. ⛔ THE PLAYHEAD DOES NOT MOVE (Carl, on take 1: *"If i click on the clip
   * it mustnt move the playhead"* — only the ruler moves it); an edit that shortens the shot clamps it, as Delete does ([R12]).
   */
  endEdit(commit: boolean) {
    const e = this.edit;
    this.edit = null;
    if (!e) return;
    // the camera was showing the edit's picture: it stays HELD at the playhead's pose, whichever way the drag ended
    this.mode = "fly";
    this.posed = true;
    if (!commit) return;
    const chain = applyEdit(this.chain, e);
    if (chain !== this.chain) this.commit(chain);
    if (this.T > this.derived.end) this.T = this.derived.end;
  }
  /** ⛔ THE PICTURE DURING A DRAG (the playhead itself never moves — Carl, on take 1). A trim: the CLIP's own pose at its edge
   *  AS CLAMPED by `applyEdit` (Carl: *"The frame at the edge"*; never the raw `edit.T`, which runs past the source or the
   *  1/60 s floor; at a tail the half-open rule would show the NEXT clip). A move: what plays at the parked playhead on the
   *  edited chain. `T`: the edge's time (a move: the playhead's) — for the harness, never the playhead. */
  private editPicture(e: Edit): { T: number; pose: Pose | null } {
    const chain = applyEdit(this.chain, e);
    const c = chain.clips.find((k) => k.id === e.id);
    if (!c || e.kind === "move") return { T: this.T, pose: poseAtT(chain, this.T)?.pose ?? null };
    const T = e.kind === "head" ? c.start : clipEnd(c);
    return { T, pose: clipPoseAt(c, T) };
  }

  // ── ⛔ THE THIRD-PERSON VIEW (note v1.3.3, plan v1.2)
  /**
   * The right-stick click (RS) and T. Refused while RECORDING (said, as Start's [C10]); ignored during a T1b drag (the
   * twelfth gate). ON: no remembered eye → frame everything. ⛔ OFF, IN THIS ORDER (note review 4): the PiP's pose FIRST (a
   * stop clears a solo); then stop playback (Carl: *"Whatever im doing i will stop"* — the Builder's reading); then the rig
   * JUMPS to it (`jumpTo`: the existing route, applied at the next frame, the roll carried) and is PARKED (`posed` false —
   * `posed` would re-pose it to what PLAYS). An armed track with no clips: the rig stays.
   */
  toggleView() {
    if (this.edit) return;
    if (this.rec) return this.say("Stop first (A)");
    this.acted();
    if (this.view === "first") {
      this.view = "third";
      if (!this.eye) this.eye = savedRig(EYE_KEY);
      if (!this.eye) this.frameAll();
      return;
    }
    const p = this.pipPose();
    if (this.mode === "play") this.stopPlay(false);
    if (p) {
      this.jumpTo = p;
      this.posed = false;
    }
    this.view = "first";
  }
  /** the SOLO clip playing, if any (X with clips selected) */
  private soloClip(): Clip | null {
    return this.mode === "play" ? (this.queue[this.queueIdx]?.clip ?? null) : null;
  }
  /**
   * ⛔ WHAT THE PiP SHOWS (Carl: *"the view from the currently selected camera"*): during a T1b DRAG the drag's picture
   * (*"The drag's picture"* — a trim's edge frame; a move: the armed camera at the playhead on the moved timeline); during a
   * SOLO the clip being played (*"The clip being played"*); else the ARMED camera's own take at T — not what plays. Null:
   * an armed track with no clips (the PiP shows the rig).
   */
  private pipPose(): Pose | null {
    if (this.edit) {
      if (this.edit.kind !== "move") return this.editPicture(this.edit).pose;
      return trackPoseAt(applyEdit(this.chain, this.edit), this.armedCam, this.T)?.pose ?? null;
    }
    const solo = this.soloClip();
    if (solo) return clipPoseAt(solo, this.T);
    return trackPoseAt(this.chain, this.armedCam, this.T)?.pose ?? null;
  }
  private pipLabel(): string {
    const solo = this.soloClip();
    if (solo) return `Cam ${solo.cam} · clip ${this.num(solo)} solo`;
    return this.chain.clips.some((c) => c.cam === this.armedCam) ? `Cam ${this.armedCam}` : `Cam ${this.armedCam} · no clips yet`;
  }
  /**
   * ⛔ "SEE IT ALL" (Carl: *"position myself on the edge of a scene so i can see it all"*): the eye on a fixed bearing
   * (front-left, 25° down), at the distance that fits the scene's bounding sphere in the NARROWER of its two lens angles,
   * plus 10%. No scene box yet (T on a first visit before the arch is measured): the arch's box; neither: the default view's
   * position pulled back 3× (plan v1.2).
   */
  frameAll() {
    const m = this.m;
    const fov = this.eye?.fov ?? EYE_FOV;
    const box = this.sceneBox ?? this.archBox;
    if (!box) {
      this.eye = rigAt(0, 0, (m?.d ?? 2000) * 3, 0, 0, fov);
      return;
    }
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const v = (fov * Math.PI) / 180;
    const h = 2 * Math.atan(Math.tan(v / 2) * this.aspect);
    const dist = (sphere.radius / Math.sin(Math.min(v, h) / 2)) * 1.1;
    const yaw = -35, pitch = -25;
    const y = (yaw * Math.PI) / 180, p = (pitch * Math.PI) / 180;
    const fwd = new THREE.Vector3(-Math.sin(y) * Math.cos(p), Math.sin(p), -Math.cos(y) * Math.cos(p));
    const at = sphere.center.clone().addScaledVector(fwd, -dist);
    this.eye = rigAt(at.x, at.y, at.z, yaw, pitch, fov);
  }

  // ── ⛔ SHAPE CLIPS (the plan `plan-shape-clips-27-october.md` v2.1) — each change a commit (an action), refused while
  //    recording, said in words. Placing lands as a recording does: the ARMED track, at the playhead, the newest take.

  /** a shape onto the armed track at the playhead — the panel's Place and the dev hook: the clip id, or the refusal */
  placeShape(shape: Shape): { id: string } | { refusal: string } {
    if (this.rec) return { refusal: "A shape cannot be placed while recording: stop first (A)" };
    const bad = shapeRefusal(shape);
    if (bad) return { refusal: `Not placed: ${bad}` };
    this.acted();
    const at = this.chain.clips.length ? this.T : 0;
    const id = newClipId();
    const chain = placeShape(this.chain, this.armedCam, at, shape, id);
    this.mode = "fly";
    this.T = at;
    this.posed = true;
    this.commit(chain);
    return { id };
  }
  /** ⛔ AN EDIT says what its new length does (T1a's rules: nothing ripples) — longer covers what follows on its track, as
   *  the newer take; shorter leaves a gap */
  editShape(id: string, shape: Shape): string | null {
    if (this.rec) return "A shape cannot be changed while recording: stop first (A)";
    const old = this.chain.clips.find((c) => c.id === id);
    if (!old?.shape) return "That clip is not a shape";
    const bad = shapeRefusal(shape);
    if (bad) return `Not changed: ${bad}`;
    this.acted();
    const chain = replaceShape(this.chain, id, shape);
    this.commit(chain);
    const now = chain.clips.find((c) => c.id === id)!;
    const was = clipEnd(old), end = clipEnd(now), by = Math.abs(end - was).toFixed(1);
    if (end > was + EDGE_S) {
      const hid = chain.clips.find((c) => c.id !== id && c.cam === now.cam && c.order < now.order && c.start < end - EDGE_S && clipEnd(c) > was + EDGE_S);
      this.say(hid ? `Now ${by} s longer: it covers clip ${this.num(hid)} from ${Math.max(was, hid.start).toFixed(1)} s (the shape is the newer take)` : `Now ${by} s longer`);
    } else if (end < was - EDGE_S) {
      const gap = gapsOf(chain).find(([a]) => Math.abs(a - end) <= EDGE_S);
      this.say(gap ? `Now ${by} s shorter: it leaves a gap from ${end.toFixed(1)} s` : `Now ${by} s shorter`);
    }
    return null;
  }
  /** "Start here" on a placed shape: the camera's pose now, its angle UNWRAPPED beside the old start; the end KEPT */
  /**
   * ⛔ THE BUILDER PUTS THE CLIP ON THE BENCH (Carl: *"After your calculations i need you to execute it and put the clip on
   * the bench ... Like building a mesh"*). Once per take `version`: built in the chain's units and placed as a clip; a NEW
   * version REPLACES the Builder's last take where it stood (its track, its start), as a mesh updates when its code changes;
   * a reload of the same version places nothing. Carl's own clips are never touched (the take is the newest take, over
   * whatever it covers). ⚠ HARNESS ONLY: `__benchNoBuilderTake` keeps it off a test chain.
   */
  private syncBuilderTake(m: PieceMeasure) {
    const t = this.builderTake, u = this.chain.units;
    // ⛔ T1b: a new take WAITS while a drag runs and lands after the release — the check IN THIS early return, BEFORE
    // `builderPlaced` is set below (placed after it, the version would be marked placed during the drag and never land)
    if (!t || !u || this.rec || this.edit || t.version === this.builderPlaced) return;
    if ((window as unknown as { __benchNoBuilderTake?: boolean }).__benchNoBuilderTake) return;
    this.builderPlaced = t.version;
    const id = `builder-v${t.version}`;
    if (this.chain.clips.some((c) => c.id === id)) return;
    const toU = (w: [number, number, number]): [number, number, number] => [w[0] / u.d, (w[1] - u.up) / u.d, (w[2] - u.zc) / u.d];
    const fromW: [number, number, number] = t.barrel.from === "default" ? [0, 0, m.d] : t.barrel.from;
    // the spiral's end as a fraction of the line, from its world z (the Vader move's line runs straight in z)
    const frac = (fromW[2] - t.barrel.spiralEndZ) / (fromW[2] - t.barrel.to[2]);
    const frac0 = t.barrel.spiralStartZ === undefined ? 0 : (fromW[2] - t.barrel.spiralStartZ) / (fromW[2] - t.barrel.to[2]);
    const shape: Shape = {
      kind: "barrel",
      from: toU(fromW),
      to: toU(t.barrel.to),
      turns: t.barrel.turns,
      radius: t.barrel.radiusCm / u.d,
      spiralStart: Math.max(0, frac0),
      rollEase: t.barrel.rollEase ?? 0,
      spiralEnd: Math.min(1, Math.max(1e-6, frac)),
      fov: FRONT_FOV,
      pace: t.barrel.paceCms / u.d,
      v0: 0,
      rampS: t.barrel.rampS,
      landS: t.barrel.landS,
    };
    const bad = shapeRefusal(shape);
    if (bad) return this.say(`The Builder's take "${t.name}" was not placed: ${bad}`);
    const old = this.chain.clips.find((c) => c.id.startsWith("builder-"));
    let chain = old ? deleteClips(this.chain, new Set([old.id])) : this.chain;
    const cam = old?.cam ?? chain.tracks[0], start = old?.start ?? 0;
    chain = placeShape(chain, cam, start, shape, id);
    // ⛔ "KEEP MY TRIM" (Carl, 29 October 2026): a new version over a TRIMMED take (head or tail) lands with its in / out,
    // in seconds — ⚠ a timing change moves where along the move the cut falls
    const kept = !!old && isTrimmed(old);
    if (old && kept) chain = setTrim(chain, id, old.in, old.out);
    this.commit(chain, false);
    this.mode = "fly";
    this.T = start;
    this.posed = true;
    this.say(`The Builder's take is on the bench: "${t.name}" on Cam ${cam} at ${start.toFixed(1)} s${old ? (kept ? " (it replaced the last take; your trim kept)" : " (it replaced the last take)") : ""}`);
  }
  recaptureShapeStart(id: string) {
    if (this.rec) return this.say("Stop first (A)");
    const c = this.chain.clips.find((k) => k.id === id);
    const pose = this.pose(), u = this.chain.units;
    if (!c?.shape || !pose || !u) return;
    const v = startSpeed(this.chain, c.start, pose, c.shape.pace, u.d);
    const why = this.editShape(id, recaptureStart(c.shape, pose, v.v0));
    this.say(why ?? `Start re-taken here; the end kept${v.why ? `. ${v.why}` : ""}`);
  }
  // ⛔ The Corkscrew PANEL's draft (Start here / End here / Place) was built and REMOVED (Carl, 27 October 2026: *"If there
  // are to be some "signature moves" that panel will grow very quickly. It a good idea but not needed."*). Shapes come in
  // through the dev hook; `helixFrom` / `startSpeed` in `bench-chain.ts` still build one from two poses.

  /** ⛔ THE STATUS — what A will do, in plain words, BEFORE it is pressed (no em dashes) */
  private status(): { status: string; tone: Tone } {
    if (this.edit) return { status: `${this.edit.kind === "move" ? "Moving" : "Trimming"} clip ${this.derived.numbers.get(this.edit.id) ?? ""} · Esc cancels`, tone: "idle" };
    if (this.notice && performance.now() < this.notice.until) return { status: this.notice.text, tone: "warn" };
    const cam = this.armedCam;
    if (this.rec) return { status: `● Recording Cam ${this.rec.cam} · ${this.rec.sampler.length.toFixed(1)} s · A stops`, tone: "rec" };
    if (this.mode === "play" && this.view === "third") return { status: `Playing ${this.queueLabel} · Third person · X stops`, tone: "play" };
    if (this.mode === "play") return { status: `Playing ${this.queueLabel}${this.inGap ? " · Gap" : ""} · X or any stick stops`, tone: "play" };
    if (this.view === "third") return { status: `Third person · ${this.pipLabel()} in the PiP · RS / T to the camera`, tone: "idle" };
    if (!this.chain.clips.length) return { status: `Ready · Cam ${cam} armed · A records clip 1 from here`, tone: "idle" };
    if (this.atEnd) return { status: `At the end · Cam ${cam} armed · A records here`, tone: "idle" };
    const at = `Cam ${cam} armed · A records at ${this.T.toFixed(1)} s`;
    const rank = (c: number) => this.chain.tracks.indexOf(c);
    const plays = sourceAt(this.chain, this.T);
    const own = takesAt(this.chain, this.T).find((c) => c.cam === cam);
    if (plays && rank(plays.cam) > rank(cam)) return { status: `${at}, under Cam ${plays.cam} (Cam ${plays.cam} plays there)`, tone: "idle" };
    if (own) return { status: `${at}, a new take over clip ${this.num(own)} (the old is kept)`, tone: "idle" };
    if (plays) return { status: `${at}, over Cam ${plays.cam}'s clip ${this.num(plays)}: Cam ${cam} will play there`, tone: "idle" };
    return { status: `${at}, in a gap`, tone: "idle" };
  }

  /** ⛔ ONE FRAME: the pad (polled here and nowhere else), the keyboard and mouse, the rig, the recording, playback. */
  frame(camera: THREE.PerspectiveCamera, eyeCam: THREE.PerspectiveCamera | null, rawDt: number, m: PieceMeasure, aspect: number, floorY?: number): View | null {
    this.m = m;
    this.aspect = aspect;
    // ⛔ THE CHAIN's UNITS, FILLED ON THE FIRST MEASURED FRAME (note v3.2 §4): a new chain and a migrated one both load before
    // any measure, with `units` null. A QUIET commit (not an action): it does not clear the carry-over line, and the UI
    // writes storage only if the chain has clips (an empty first visit writes nothing)
    if (!this.chain.units) this.commit({ ...this.chain, units: { d: m.d, up: m.up, zc: m.zc } }, false);
    const units = this.chain.units!;
    this.syncBuilderTake(m);
    const dt = clampDt(rawDt);
    if (!this.rig) this.rig = savedRig() ?? rigAt(0, 0, m.d, 0, 0, FRONT_FOV);
    const r = this.rig;
    /** a CLIP pose onto the rig — through the CHAIN's units */
    const setRig = (p: Pose) => {
      const w = toWorld(units, p);
      Object.assign(r, rigAt(w.x, w.y, w.z, p.yaw, p.pitch, p.fov));
      this.roll = p.roll ?? 0;
    };
    if (this.jumpTo) {
      // ⛔ HOME is not a clip: the default view in the WORLD on the LIVE `d` (as the rig's first pose above), never through
      // the chain's units — so it lands square on even when the two values of `d` differ (the plan's T2)
      if (this.jumpTo === "front") {
        Object.assign(r, rigAt(0, 0, m.d, 0, 0, FRONT_FOV));
        this.roll = 0;
      }
      else setRig(this.jumpTo);
      this.jumpTo = null;
    }
    const pad = readPad();
    // ⛔ [A6] a pad LOST while recording stops it, as a hidden tab does
    if (this.rec && this.padWas && !pad.connected) this.stopRecording("Stopped: the controller disconnected");
    this.padWas = pad.connected;
    const hit = this.edges.pressed(pad.buttons);
    if (pad.connected) {
      if (hit(BTN.A)) {
        this.pressA();
        pad.rumble?.(80);
      }
      if (hit(BTN.X)) this.togglePlay();
      if (hit(BTN.Y)) this.toStart();
      if (hit(BTN.VIEW)) this.home();
      if (hit(BTN.START)) this.cycleArm();
      // ⛔ THE RIGHT-STICK CLICK: third person on / off (Carl: *"Right stick click for third person on, click again for off"*)
      if (hit(BTN.RS)) this.toggleView();
      // the D-pad MOVES now (below); stepping between clips is the keyboard's ( , . ) and the timeline's
    }

    // ⛔ THE FLY INPUTS — the pad (sticks, triggers, the D-pad, B's look, the bumpers' zoom) and the keyboard together
    const k = this.keys;
    const key = (c: string) => (k.has(c) ? 1 : 0);
    const btn = (i: number) => (pad.buttons[i] ? 1 : 0);
    // ⛔ [D2] the speed modifiers are the KEYBOARD's only (Shift / Alt)
    const speed = (k.has("ShiftLeft") || k.has("ShiftRight") ? FEEL.fast : 1) * (k.has("AltLeft") ? FEEL.slow : 1);
    // ⛔ ONE JOB PER STICK, READ BY HEMISPHERE (Carl, 27 October 2026: *"the right stick should only move l+r using the l+r
    // hemispheres. That way accuracy isnt a problem on the stick, i just move them approx l+r"*) — a stick reads only its own
    // axis, so a rough push moves straight. Was: the right stick's x trucked AND its y tilted, so any push off the horizontal
    // also tilted the camera. ⛔ THE LOOK IS HELD: B + the right stick turns / tilts (Unreal's right-mouse look), taking
    // whichever axis is pushed more — a pan stays level, a tilt stays straight (the Builder's; Carl: "Yes")
    const look = !!pad.buttons[BTN.B];
    const lookX = look && Math.abs(pad.rx) >= Math.abs(pad.ry) ? pad.rx : 0;
    const lookY = look && Math.abs(pad.ry) > Math.abs(pad.rx) ? pad.ry : 0;
    // ⛔ the D-PAD a MOVEMENT PAD (Carl: "Yes the Dpad should be a movement pad") at TWICE the sticks' pace (`FEEL.dpad`)
    const dpad = (v: number) => Math.max(-FEEL.dpad, Math.min(FEEL.dpad, v));
    const intent: Intent = {
      // the LEFT STICK forward and back ONLY (Carl: "Make the L stick just go forwards and backwards at walking speed");
      // the D-pad's up / down
      forward: dpad(clamp(pad.ly + key("KeyW") - key("KeyS")) + FEEL.dpad * (btn(BTN.UP) - btn(BTN.DOWN))),
      // the RIGHT STICK's x a TRUCK, facing unchanged (Carl: "i need it to move physically l and r") — not while B looks;
      // the D-pad's left / right
      right: dpad(clamp((look ? 0 : pad.rx) + key("KeyD") - key("KeyA")) + FEEL.dpad * (btn(BTN.RIGHT) - btn(BTN.LEFT))),
      up: clamp(pad.rt - pad.lt + key("KeyE") - key("KeyQ")),
      turn: clamp(lookX + key("ArrowRight") - key("ArrowLeft")),
      tilt: clamp(lookY + key("ArrowUp") - key("ArrowDown")),
      // ⛔ THE ZOOM ON THE BUMPERS (Carl: "The zoom you can put on the bumpers"): RB longer, LB wider (was the D-pad; the
      // bumpers turned, 26 October)
      lens: clamp(btn(BTN.RB) - btn(BTN.LB) + key("BracketRight") - key("BracketLeft")),
      speed,
    };
    const active =
      intent.forward !== 0 || intent.right !== 0 || intent.up !== 0 || intent.turn !== 0 || intent.tilt !== 0 || intent.lens !== 0 || this.mouse.dx !== 0 || this.mouse.dy !== 0;

    // ⛔ T1b: DURING A DRAG the picture is the edit's (the trim view, or the edited chain at the playhead) and NOTHING flies —
    // the sticks, the triggers, the mouse look are ignored ([R3])
    // ⛔ THIRD PERSON NEVER MOVES THE RIG (plan v1.2, the review's [4]): the drag picture, the play branch and the posed
    // branch each set it in first person only — in third person the PiP shows their pose instead
    const third = this.view === "third";
    const pic = this.edit ? this.editPicture(this.edit) : null;
    if (pic) {
      if (pic.pose && !third) setRig(pic.pose);
    } else if (this.mode === "play") {
      // a fly input STOPS playback and flies from where it stopped — ⛔ in FIRST person only: flying the EYE never stops it
      // (Carl: *"i will see both its trajectory and the view while executing that trajectory in PiP"*)
      if (active && !third) this.stopPlay(false);
      else {
        this.advancePlay(dt);
        const p = this.playheadPose();
        if (p && !third) setRig(p);
      }
    }
    if (!pic && !third && this.mode === "fly" && this.posed) {
      if (active) this.posed = false; // a fly input leaves the playhead's pose; the playhead stays PARKED
      else {
        const p = this.playheadPose();
        if (p) setRig(p);
      }
    }
    if (!pic && !third && (this.mode === "rec" || (this.mode === "fly" && !this.posed))) {
      // flying is level (a recording is level: samples carry no roll) — ⛔ levelled only BY a fly input (or at once by a
      // recording), so a camera switched to mid-barrel keeps its roll until Carl moves it (note v1.3.3, review 3 [2])
      if (this.mode === "rec" || active) this.roll = 0;
      // a mouse drag turns the camera DIRECTLY (degrees per pixel), not through the stick's eased speed
      r.yaw -= this.mouse.dx * MOUSE_DEG_PER_PX;
      r.pitch = Math.max(-FEEL.pitchLimitDeg, Math.min(FEEL.pitchLimitDeg, r.pitch - this.mouse.dy * MOUSE_DEG_PER_PX));
      stepRig(r, intent, dt, 100 / CM_PER_PX, floorY === undefined ? -Infinity : floorY + LENS_MIN_CM / CM_PER_PX);
    }
    // ⛔ THIRD PERSON: the pad, the keys and the mouse fly the EYE (the same controls, `FEEL`, the floor stop); not during a drag
    if (third && !pic) {
      if (!this.eye) this.frameAll();
      const e = this.eye!;
      e.yaw -= this.mouse.dx * MOUSE_DEG_PER_PX;
      e.pitch = Math.max(-FEEL.pitchLimitDeg, Math.min(FEEL.pitchLimitDeg, e.pitch - this.mouse.dy * MOUSE_DEG_PER_PX));
      stepRig(e, intent, dt, 100 / CM_PER_PX, floorY === undefined ? -Infinity : floorY + LENS_MIN_CM / CM_PER_PX);
    }
    this.mouse.dx = 0;
    this.mouse.dy = 0;
    if (this.rec) this.rec.sampler.step(rawDt, this.pose()!);

    // ⛔ THE ONE WRITER OF EVERY CAMERA (note v1.3.3, review 2 [3]). The SHOT camera: first person from the rig (as before);
    // third person from the PiP's pose — the rig itself untouched, so `CAMERA_KEY` keeps first person's camera
    const rad = Math.PI / 180;
    const pip = third ? this.pipPose() : null;
    const pw = pip ? toWorld(units, pip) : null;
    const shot = pip && pw ? { x: pw.x, y: pw.y, z: pw.z, yaw: pip.yaw, pitch: pip.pitch, roll: pip.roll ?? 0, fov: pip.fov } : { x: r.x, y: r.y, z: r.z, yaw: r.yaw, pitch: r.pitch, roll: this.roll, fov: r.fov };
    camera.position.set(shot.x, shot.y, shot.z);
    // YXZ: turn about the vertical first, then tilt, then ROLL about the line of sight (only a shape rolls; the rig has none)
    camera.rotation.set(shot.pitch * rad, shot.yaw * rad, shot.roll * rad, "YXZ");
    if (camera.fov !== shot.fov) {
      camera.fov = shot.fov;
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();
    // ⛔ THE EYE's camera object — ALL of it, every frame, before any draw (plan v1.2, the review's [7]): its pose, lens,
    // near 1, far the shot camera's (m.d × 60: "see it all" must not clip), aspect the canvas's
    if (eyeCam) {
      const e = this.eye ?? rigAt(0, 0, m.d * 3, 0, 0, EYE_FOV);
      eyeCam.position.set(e.x, e.y, e.z);
      eyeCam.rotation.set(e.pitch * rad, e.yaw * rad, 0, "YXZ");
      if (eyeCam.fov !== e.fov || eyeCam.near !== 1 || eyeCam.far !== m.d * 60 || eyeCam.aspect !== aspect) {
        Object.assign(eyeCam, { fov: e.fov, near: 1, far: m.d * 60, aspect });
        eyeCam.updateProjectionMatrix();
      }
      eyeCam.updateMatrixWorld();
    }
    // ⛔ EACH TRACK's CAMERA, in WORLD px through the CHAIN's units, for the helpers and labels (third person only). During a
    // SOLO the soloed clip's track rides the soloed clip; during a drag, the edited chain
    this.helpers = [];
    if (third) {
      const ch = this.edit ? applyEdit(this.chain, this.edit) : this.chain;
      const solo = this.soloClip();
      for (const cam of ch.tracks) {
        const tp = solo && solo.cam === cam ? { pose: clipPoseAt(solo, this.T), held: false } : trackPoseAt(ch, cam, this.T);
        if (!tp) continue;
        const w = toWorld(units, tp.pose);
        this.helpers.push({ cam, x: w.x, y: w.y, z: w.z, yaw: tp.pose.yaw, pitch: tp.pose.pitch, roll: tp.pose.roll ?? 0, fov: tp.pose.fov, held: tp.held, armed: cam === this.armedCam });
      }
    }

    this.hudAt += rawDt;
    if (this.hudAt < 0.1) return null;
    this.hudAt = 0;
    // ⛔ the camera remembered — written only when it has changed (every 0.1 s at most)
    const cam = JSON.stringify({ x: r.x, y: r.y, z: r.z, yaw: r.yaw, pitch: r.pitch, fov: r.fov });
    if (cam !== this.camSaved) {
      this.camSaved = cam;
      try {
        window.localStorage.setItem(CAMERA_KEY, cam);
      } catch {
        // full or blocked storage: the camera is simply not remembered (the chain's own save failure IS shown)
      }
    }
    // ⛔ the EYE remembered — its own key, written only when changed
    if (this.eye) {
      const ej = JSON.stringify({ x: this.eye.x, y: this.eye.y, z: this.eye.z, yaw: this.eye.yaw, pitch: this.eye.pitch, fov: this.eye.fov });
      if (ej !== this.eyeSaved) {
        this.eyeSaved = ej;
        try {
          window.localStorage.setItem(EYE_KEY, ej);
        } catch {
          // full or blocked storage: the eye is simply not remembered
        }
      }
    }
    const view: View = {
      mode: this.mode,
      T: this.T,
      duration: this.derived.end,
      recLength: this.rec?.sampler.length ?? 0,
      armedCam: this.armedCam,
      ...this.status(),
      chainEmpty: !this.chain.clips.length,
      hasSelection: this.selection.length > 0,
      pad: { connected: pad.connected, id: pad.id },
      // ⛔ the HUD: first person the RIG (what A records); third person the PiP's camera — where switching off puts Carl
      // (note v1.3.3, review 3 [3]); `shot` is exactly that in both views
      mm: focalMm(shot.fov, aspect),
      fov: shot.fov,
      at: { x: shot.x, y: shot.y, z: shot.z },
      units: { d: m.d, up: m.up, zc: m.zc },
      rec: this.rec ? { at: this.rec.at, length: this.rec.sampler.length, cam: this.rec.cam } : null,
      view: this.view,
      pipLabel: this.pipLabel(),
      soloId: this.soloClip()?.id ?? null,
      eyeM: third && this.eye ? Math.hypot(this.eye.x, this.eye.y - m.up, this.eye.z - m.zc) / 100 : null,
    };
    // for harnesses: the bench's state, read-only. ⚠ `units` / `d` are the LIVE measure; `chainUnits` the chain's; `pose`
    // and `front` are in the CHAIN's units
    (window as unknown as { __cameraBench?: object }).__cameraBench = {
      ...view,
      atEnd: this.atEnd,
      posed: this.posed,
      selection: this.selection,
      editing: this.edit ? { id: this.edit.id, kind: this.edit.kind, edgeT: pic?.T ?? null } : null,
      snap: this.snap,
      // the third-person view, for the harnesses: `pose` below stays the RIG (it must not move in third person)
      eye: this.eye ? { x: this.eye.x, y: this.eye.y, z: this.eye.z, yaw: this.eye.yaw, pitch: this.eye.pitch, fov: this.eye.fov } : null,
      pip,
      helpers: this.helpers,
      roll: this.roll,
      // LIVE readings (this snapshot is 10 Hz): the helpers and the eye as of the LAST FRAME — the labels check compares them
      // with the labels written in that same frame
      helpersNow: () => this.helpers,
      eyeNow: () => this.eye,
      chain: this.chain,
      chainUnits: units,
      tracks: this.chain.tracks,
      clips: [...this.chain.clips]
        .sort((a, b) => this.num(a) - this.num(b))
        .map((c) => ({ n: this.num(c), id: c.id, cam: c.cam, start: c.start, order: c.order, in: c.in, out: c.out, len: clipLength(c), source: c.shape ? "shape" : "samples", samples: c.samples?.length ?? 0 })),
      source: sourceAt(this.chain, this.T)?.id ?? null,
      gap: poseAtT(this.chain, this.T)?.gap ?? false,
      takes: takesAt(this.chain, this.T).map((c) => c.id),
      pose: this.pose(),
      d: m.d,
      front: frontIn(units, m),
    };
    return view;
  }
}

/**
 * ⛔ THE PiP's RECTANGLE — ONE SOURCE (note v1.3.3 §2): the scissor and the DOM frame over it both read `PIP`. Top-left,
 * inset 16 CSS px, a quarter of the picture's width and height (the picture's own aspect, so the shot is framed as
 * recorded). ⛔ The GL rectangle counts from the BOTTOM-LEFT and is in CSS PIXELS — three multiplies by the pixel ratio
 * itself (`WebGLRenderer.setViewport`, r185; the note's v1.3.2 correction: `× dpr` here would scale twice).
 */
const PIP = { insetPx: 16, widthFrac: 0.25 } as const;
function pipRect(size: { width: number; height: number }) {
  const w = size.width * PIP.widthFrac, h = size.height * PIP.widthFrac;
  return { left: PIP.insetPx, top: PIP.insetPx, w, h, glX: PIP.insetPx, glY: size.height - PIP.insetPx - h };
}

/** ⚠ HARNESS-ONLY, DEV-ONLY window hooks of the render callback */
type BenchCost = { renderer?: string; ext?: boolean; cpu: number[]; gpu: number[]; disjoint: number; pending: WebGLQuery[] };
type BenchDevHooks = { __benchGrid?: { who: string; at: number[] }[]; __benchCost?: BenchCost };
type TimerExt = { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number };
const timerExt = new WeakMap<WebGL2RenderingContext, TimerExt | null>();
/** the cost instrument's start: the renderer named once; a GPU timer query begun where the extension exists */
function costBegin(gl: THREE.WebGLRenderer, cost: BenchCost): WebGLQuery | null {
  const c = gl.getContext() as WebGL2RenderingContext;
  if (!timerExt.has(c)) timerExt.set(c, c.getExtension("EXT_disjoint_timer_query_webgl2") as TimerExt | null);
  const ext = timerExt.get(c)!;
  if (cost.renderer === undefined) {
    const info = c.getExtension("WEBGL_debug_renderer_info");
    cost.renderer = info ? String(c.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "unknown";
    cost.ext = !!ext;
  }
  if (!ext) return null;
  const q = c.createQuery();
  if (q) c.beginQuery(ext.TIME_ELAPSED_EXT, q);
  return q;
}
/** the cost instrument's end: the CPU time kept; finished GPU queries read (ms), a disjoint frame's discarded */
function costEnd(gl: THREE.WebGLRenderer, cost: BenchCost, q: WebGLQuery | null, cpuMs: number) {
  const c = gl.getContext() as WebGL2RenderingContext;
  const ext = timerExt.get(c);
  cost.cpu.push(cpuMs);
  if (!ext) return;
  if (q) {
    c.endQuery(ext.TIME_ELAPSED_EXT);
    cost.pending.push(q);
  }
  const disjoint = !!c.getParameter(ext.GPU_DISJOINT_EXT);
  while (cost.pending.length && c.getQueryParameter(cost.pending[0], c.QUERY_RESULT_AVAILABLE)) {
    const done = cost.pending.shift()!;
    if (disjoint) cost.disjoint++;
    else cost.gpu.push(Number(c.getQueryParameter(done, c.QUERY_RESULT)) / 1e6);
    c.deleteQuery(done);
  }
}

/** one track's camera, drawn in third person: a proxy camera (its lens, `far` 1.5 m) carrying an unlit body, and its frustum */
type HelperParts = { proxy: THREE.PerspectiveCamera; helper: THREE.CameraHelper; mats: THREE.MeshBasicMaterial[] };
/** ⚠ HARNESS-ONLY (check 9): `window.__benchHelpers` "off" unmounts the helpers, "loud" paints them magenta — read once */
const helperMode = () => (window as unknown as { __benchHelpers?: "off" | "loud" }).__benchHelpers;
function makeHelper(cam: number, loud: boolean): HelperParts {
  const colour = new THREE.Color(loud ? "#ff00ff" : camColour(cam));
  const proxy = new THREE.PerspectiveCamera(FRONT_FOV, 16 / 9, 1, 150 / CM_PER_PX);
  const mat = () => new THREE.MeshBasicMaterial({ color: colour, transparent: true, toneMapped: false });
  const mats = [mat(), mat()];
  // the body 20 × 12 × 26 cm; the lens forward (−z, where the camera looks)
  const body = new THREE.Mesh(new THREE.BoxGeometry(20 / CM_PER_PX, 12 / CM_PER_PX, 26 / CM_PER_PX), mats[0]);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(5 / CM_PER_PX, 6 / CM_PER_PX, 8 / CM_PER_PX, 16), mats[1]);
  lens.rotation.x = Math.PI / 2;
  lens.position.z = -17 / CM_PER_PX;
  proxy.add(body, lens);
  const helper = new THREE.CameraHelper(proxy);
  helper.setColors(colour, colour, colour, colour, colour);
  return { proxy, helper, mats };
}

/**
 * ⛔ THE HELPERS (note v1.3.3 §5; plan v1.2 Step 3) — ALWAYS MOUNTED (they compile with the brass at load, never as a
 * stutter on the first switch), every object on LAYER 1, which only the eye sees: never in the shot camera's picture, the
 * PiP, a recording or a client film. ⛔ Each `CameraHelper` sits in a group that NEVER MOVES (it takes its proxy's world
 * matrix as its own, `matrixAutoUpdate` off — under a moving parent it would be moved twice: the plan review's [3]). The
 * proxies are written by the scene's frame callback (`registryRef`), the paths drawn from `paths` (the chain's units).
 */
function TrackHelpers({
  tracks,
  armedCam,
  paths,
  soloPath,
  soloCam,
  registryRef,
}: {
  tracks: number[];
  armedCam: number;
  paths: Map<number, [number, number, number][][]> | null;
  soloPath: [number, number, number][] | null;
  soloCam: number | null;
  registryRef: { current: Map<number, HelperParts> };
}) {
  const [mode] = useState(helperMode);
  const root = useRef<THREE.Group>(null);
  const key = tracks.join(",");
  const parts = useMemo(() => new Map(key.split(",").map((t) => [Number(t), makeHelper(Number(t), mode === "loud")])), [key, mode]);
  useEffect(() => {
    registryRef.current = parts;
    return () => {
      for (const p of parts.values()) {
        p.helper.dispose();
        p.proxy.traverse((o) => {
          if (o instanceof THREE.Mesh) o.geometry.dispose();
        });
        p.mats.forEach((m) => m.dispose());
      }
    };
  }, [parts, registryRef]);
  // ⛔ LAYER 1 ON EVERY OBJECT (layers are per object, never inherited: the review's [9]) — after every render, so a new
  // path line or a new track's parts are covered
  useLayoutEffect(() => {
    root.current?.traverse((o) => o.layers.set(1));
  });
  if (mode === "off") return null;
  return (
    <group ref={root}>
      {[...parts].map(([cam, p]) => (
        <Fragment key={cam}>
          <primitive object={p.proxy} />
          <primitive object={p.helper} />
        </Fragment>
      ))}
      {paths &&
        [...paths].flatMap(([cam, segs]) =>
          segs.map((seg, i) => (
            <Line key={`${cam}-${i}`} points={seg} color={mode === "loud" ? "#ff00ff" : camColour(cam)} lineWidth={2} toneMapped={false} transparent opacity={cam === armedCam ? 1 : 0.7} />
          )),
        )}
      {soloPath && soloCam !== null && <Line points={soloPath} color={mode === "loud" ? "#ff00ff" : camColour(soloCam)} lineWidth={2.5} toneMapped={false} />}
    </group>
  );
}

function BenchScene({
  built,
  store,
  grid,
  chain,
  armedCam,
  soloId,
  labels,
  onView,
  onWorld,
  onReady,
}: {
  built: Built;
  store: BenchStore;
  grid: boolean;
  /** React's COMMITTED chain — the paths derive from it, on change */
  chain: Chain;
  armedCam: number;
  soloId: string | null;
  /** the labels' layer (DOM, the overlay's) — written by the render callback, never through React */
  labels: { current: HTMLDivElement | null };
  onView: (v: View) => void;
  onWorld: (w: ArchWorld | null) => void;
  onReady: () => void;
}) {
  const size = useThree((s) => s.size);
  const m = measurePiece("arch", built, size);
  // the arch's box does not depend on the canvas's size (`up` is 0 for the arch) — measured once per build
  const world = useMemo(() => measureArch(built, measurePiece("arch", built, { width: 1, height: 1 })), [built]);
  useEffect(() => onWorld(world), [world, onWorld]);
  const main = useRef<THREE.Mesh>(null);
  const fine = useRef<THREE.Mesh>(null);
  // ⛔ THE EYE's CAMERA OBJECT (note v1.3.3 §3): made ONCE with the canvas, never keyed, gone with it; layers 0 and 1. Not
  // the default camera. Every property written by `store.frame()` — none here
  const [eye] = useState(() => {
    const c = new THREE.PerspectiveCamera();
    c.layers.enable(1);
    return c;
  });
  const registry = useRef<Map<number, HelperParts>>(new Map());
  // ⛔ THE PATHS — each track's, through the CHAIN's units (never the live measure: the review's [8]); nothing while the
  // units are null. One derivation, on chain change: the helpers draw it, "see it all" frames it
  const units = chain.units;
  const paths = useMemo(() => {
    if (!units) return null;
    const w = (p: Pose): [number, number, number] => {
      const q = toWorld(units, p);
      return [q.x, q.y, q.z];
    };
    return new Map(chain.tracks.map((cam) => [cam, trackPath(chain, cam).map((seg) => seg.map(w))]));
  }, [chain, units]);
  const solo = soloId ? (chain.clips.find((c) => c.id === soloId) ?? null) : null;
  const soloPath = useMemo(() => {
    if (!solo || !units) return null;
    return clipPath(solo).map((p): [number, number, number] => {
      const q = toWorld(units, p);
      return [q.x, q.y, q.z];
    });
  }, [solo, units]);
  // ⛔ "SEE IT ALL": the arch's box, and that box with every path's points — handed to the store on change
  useEffect(() => {
    const arch = world ? new THREE.Box3(new THREE.Vector3(world.x0, world.floor, world.z0), new THREE.Vector3(world.x1, world.top, world.z1)) : null;
    const scene = arch?.clone() ?? null;
    if (scene && paths) for (const segs of paths.values()) for (const seg of segs) for (const [x, y, z] of seg) scene.expandByPoint(new THREE.Vector3(x, y, z));
    store.setScene(scene, arch);
  }, [world, paths, store]);

  useFrame((st, dt) => {
    const shot = st.camera as THREE.PerspectiveCamera;
    const aspect = st.size.width / st.size.height;
    const v = store.frame(shot, eye, dt, m, aspect, world?.floor);
    // ⛔ THE HELPERS' PROXIES — written here, after the store, from its track poses (third person; none in first)
    const rad = Math.PI / 180;
    for (const [cam, p] of registry.current) {
      const h = store.helpers.find((k) => k.cam === cam);
      p.proxy.visible = p.helper.visible = !!h;
      if (!h) continue;
      p.proxy.position.set(h.x, h.y, h.z);
      p.proxy.rotation.set(h.pitch * rad, h.yaw * rad, h.roll * rad, "YXZ");
      const lensChanged = p.proxy.fov !== h.fov || p.proxy.aspect !== aspect;
      if (lensChanged) Object.assign(p.proxy, { fov: h.fov, aspect });
      if (lensChanged) p.proxy.updateProjectionMatrix();
      p.proxy.updateMatrixWorld();
      if (lensChanged) p.helper.update();
      const a = h.held ? 0.35 : h.armed ? 1 : 0.7;
      for (const mt of p.mats) mt.opacity = a;
    }
    // the HUD's focus distance: the SHOT camera's (the 10 cm lines' thickness is the render callback's now)
    const focusPx = world?.focus ? world.focus.distanceToPoint(shot.position) : Infinity;
    if (v) onView(world?.focus ? { ...v, focusPx } : v);
  });

  // ⛔ BENCH RENDER — THE ONE PRIORITY-1 CALLBACK (note v1.3.3 §2): R3F 9 hands rendering to it. It only DRAWS — it writes no
  // camera. Before EACH draw it sets both grids' per-camera uniforms from THAT draw's camera: the 10 cm lines' thickness
  // (moved here from the frame callback: one writer) and drei Grid's `worldCamProjPosition` — the point its FADE is measured
  // from, which drei sets from `state.camera` (the shot camera) in its own callback (Grid.js:107–112; the plan review's [2]).
  const plane = useMemo(() => new THREE.Plane(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  useFrame((st) => {
    const { gl, scene, size: sz } = st;
    const shot = st.camera as THREE.PerspectiveCamera;
    // ⚠ HARNESS-ONLY, DEV-ONLY: the grids' fade centre per draw (check 13) and, when a harness sets `__benchCost`, the cost
    // instrument (the plan's checkpoint: the render callback's CPU time always; its draws' GPU time by
    // EXT_disjoint_timer_query_webgl2 where it exists — the WORK, not the frame interval)
    const dev = process.env.NODE_ENV !== "production" ? (window as unknown as BenchDevHooks) : null;
    const gridLog: { who: string; at: number[] }[] = [];
    const cost = dev?.__benchCost;
    const t0 = cost ? performance.now() : 0;
    const q = cost ? costBegin(gl, cost) : null;
    const gridsFor = (cam: THREE.Camera, who: string) => {
      for (const g of [main.current, fine.current]) {
        const u = (g?.material as THREE.ShaderMaterial | undefined)?.uniforms;
        if (!g || !u?.worldCamProjPosition) continue;
        plane.setFromNormalAndCoplanarPoint(up, new THREE.Vector3()).applyMatrix4(g.matrixWorld);
        plane.projectPoint(cam.position, u.worldCamProjPosition.value);
        if (dev) gridLog.push({ who, at: u.worldCamProjPosition.value.toArray() });
      }
      const u = (fine.current?.material as THREE.ShaderMaterial | undefined)?.uniforms;
      if (u?.cellThickness) {
        const focusPx = world?.focus ? world.focus.distanceToPoint(cam.position) : Infinity;
        const k = Math.max(0, Math.min(1, (FINE_FROM_CM / CM_PER_PX - focusPx) / ((FINE_FROM_CM - FINE_FULL_CM) / CM_PER_PX)));
        u.cellThickness.value = FINE_THICKNESS * k;
        u.sectionThickness.value = FINE_THICKNESS * k;
      }
    };
    const box = labels.current;
    const done = () => {
      if (dev) dev.__benchGrid = gridLog;
      if (cost) costEnd(gl, cost, q, performance.now() - t0);
    };
    if (!store.isThird) {
      // FIRST PERSON: one draw, the shot camera — as R3F's own render did
      gridsFor(shot, "shot");
      gl.render(scene, shot);
      return done();
    }
    // THIRD PERSON: the EYE fills the canvas; then the SHOT camera in the PiP's rectangle (`autoClear` on: with the scissor
    // test on, its clear touches only the PiP)
    gl.setScissorTest(false);
    gl.setViewport(0, 0, sz.width, sz.height);
    gridsFor(eye, "eye");
    gl.render(scene, eye);
    const r = pipRect(sz);
    gl.setViewport(r.glX, r.glY, r.w, r.h);
    gl.setScissor(r.glX, r.glY, r.w, r.h);
    gl.setScissorTest(true);
    gridsFor(shot, "shot");
    gl.render(scene, shot);
    gl.setScissorTest(false);
    gl.setViewport(0, 0, sz.width, sz.height);
    done();
    // ⛔ THE LABELS — written by ref in the same frame as the draw (never React, never the 10 Hz view: they would trail the
    // bodies during play — the review's [5]); hidden behind the eye or inside the PiP
    if (!box) return;
    const at = new THREE.Vector3();
    for (const el of Array.from(box.children) as HTMLElement[]) {
      const h = store.helpers.find((k) => String(k.cam) === el.dataset.camLabel);
      if (!h) {
        el.style.display = "none";
        continue;
      }
      at.set(h.x, h.y, h.z).project(eye);
      const x = ((at.x + 1) / 2) * sz.width, y = ((1 - at.y) / 2) * sz.height;
      const inPip = x >= r.left && x <= r.left + r.w && y >= r.top && y <= r.top + r.h;
      if (at.z < -1 || at.z > 1 || inPip) {
        el.style.display = "none";
        continue;
      }
      el.style.display = "";
      el.style.transform = `translate(${x + 10}px, ${y - 10}px)`;
    }
  }, 1);

  const axes = useMemo(() => {
    if (!world) return null;
    const r = AXIS_REACH_CM / CM_PER_PX, y = world.floor + 0.4;
    return {
      x: axisPoints(new THREE.Vector3(-r, y, world.z1), new THREE.Vector3(r, y, world.z1), AXIS_X_COLOUR),
      z: axisPoints(new THREE.Vector3(0, y, world.z1 - r), new THREE.Vector3(0, y, world.z1 + r), AXIS_Z_COLOUR),
    };
  }, [world]);
  // the subdivided squares: the metre squares (on the main grid — x from the centre line, z from the front face) that the
  // focus object's footprint, widened by the margin, touches
  const metre = 100 / CM_PER_PX;
  const f = world?.focus;
  const margin = FINE_MARGIN_CM / CM_PER_PX;
  const patch =
    world && f
      ? (() => {
          const x0 = Math.floor((f.min.x - margin) / metre) * metre;
          const x1 = Math.ceil((f.max.x + margin) / metre) * metre;
          const z0 = world.z1 + Math.floor((f.min.z - margin - world.z1) / metre) * metre;
          const z1 = world.z1 + Math.ceil((f.max.z + margin - world.z1) / metre) * metre;
          return { at: [(x0 + x1) / 2, world.floor + 0.2, (z0 + z1) / 2] as [number, number, number], size: [x1 - x0, z1 - z0] as [number, number] };
        })()
      : null;
  return (
    <>
      {/* ⛔ the bench's camera: the page's start and lens; `far` d × 60 — a free camera leaves the page's d × 10 */}
      <PerspectiveCamera makeDefault position={[0, 0, m.d]} fov={FRONT_FOV} near={1} far={m.d * 60} />
      <LetteringPiece piece="arch" built={built} onReady={onReady} />
      <TrackHelpers tracks={chain.tracks} armedCam={armedCam} paths={paths} soloPath={soloPath} soloCam={solo?.cam ?? null} registryRef={registry} />
      {/* ⛔ THE FLOOR GRID — on the arch's lowest ink; lines on the centre line and the front face; EVERY line a metre, all one
          weight (Carl: "make the grid squares 1m x 1m" — the faint metre lines under heavier 5 m ones read as 5 m squares).
          Drawn unlit (its own shader): the arch's light and reflections are untouched. Fades out LINEARLY to 150 m from the
          camera — Carl: "From 21m away i still meed to see 1m squares" (at 21 m the lines keep ~86%). */}
      {grid && world && (
        <Grid
          ref={main}
          position={[0, world.floor, world.z1]}
          infiniteGrid
          cellSize={100 / CM_PER_PX}
          sectionSize={100 / CM_PER_PX}
          cellThickness={1}
          sectionThickness={1}
          cellColor={METRE_COLOUR}
          sectionColor={METRE_COLOUR}
          fadeDistance={15000 / CM_PER_PX}
          fadeStrength={1}
          side={THREE.DoubleSide}
        />
      )}
      {/* ⛔ THE 10 cm SUBDIVISION round the focus object — the squares it stands in and beside (`patch`), 2 mm above the
          floor (no fight with the metre lines), dimmer; its lines' thickness set before each draw from that draw's camera's
          distance (the render callback), 0 = not drawn. Its edges lie on metre lines, and from any half or whole metre the
          10 cm lines fall on the metre lines too. */}
      {grid && patch && (
        <Grid
          ref={fine}
          position={patch.at}
          args={patch.size}
          cellSize={10 / CM_PER_PX}
          sectionSize={10 / CM_PER_PX}
          cellThickness={0}
          sectionThickness={0}
          cellColor={FINE_COLOUR}
          sectionColor={FINE_COLOUR}
          fadeDistance={15000 / CM_PER_PX}
          fadeStrength={1}
          side={THREE.DoubleSide}
        />
      )}
      {/* ⛔ THE TWO AXES — the front face (x, red) and the centre line (z, blue), 4 mm above the floor, over the grid's lines */}
      {grid && axes && (
        <>
          <Line points={axes.x.points} vertexColors={axes.x.colours} lineWidth={1.5} toneMapped={false} />
          <Line points={axes.z.points} vertexColors={axes.z.colours} lineWidth={1.5} toneMapped={false} />
        </>
      )}
    </>
  );
}

/**
 * ⛔ THE CLASH WARNING (Carl: *"In, warning only"*) — where a shape clip's path crosses the letters' depth slab, its nearest
 * letter (2D, front view) from the LETTERS' OWN BOXES (`measureArch` — never a copied list). 4,000 moments along the clip's
 * shown span. ⚠ Boxes, not ink: a lower bound of the true clearance. Never blocks.
 */
function clashNote(c: Clip, u: Units | null, world: ArchWorld | null): string | null {
  if (!c.shape || !u || !world?.letters.length) return null;
  const zMin = Math.min(...world.letters.map((l) => l.box.min.z)), zMax = Math.max(...world.letters.map((l) => l.box.max.z));
  let best = Infinity, who = "";
  for (let i = 0; i <= 4000; i++) {
    const w = toWorld(u, poseInShape(c.shape, c.in + ((c.out - c.in) * i) / 4000));
    if (w.z < zMin || w.z > zMax) continue;
    for (const l of world.letters) {
      const dist = Math.hypot(Math.max(l.box.min.x - w.x, 0, w.x - l.box.max.x), Math.max(l.box.min.y - w.y, 0, w.y - l.box.max.y));
      if (dist < best) [best, who] = [dist, l.line === "top" ? `YOUR's ${l.ch}` : `the ${l.ch}`];
    }
  }
  if (best === Infinity) return "It never crosses the letters' plane.";
  return best <= 0 ? `It passes THROUGH ${who} (by the letters' boxes).` : `Nearest letter where it crosses their plane: ${who}, ${metres(best)}.`;
}

type Loaded = { chain: Chain; error: string | null; carry: { text: string; persist: boolean } | null };
/** the chain written to storage; a failure in plain words (never `catch {}`) */
function saveChain(c: Chain): string | null {
  try {
    window.localStorage.setItem(CHAIN_KEY, JSON.stringify(c));
    return null;
  } catch (e) {
    const full = (e as Error).name === "QuotaExceededError";
    return full ? "Not saved: the browser's storage is full. The recording is safe until this page is closed." : `Not saved: ${(e as Error).message}`;
  }
}
/**
 * ⛔ THE SAVED CHAIN, LOADED ONCE PER PAGE LOAD (React's Strict Mode runs a state initializer twice in development; the
 * cache keeps one migration and its carry-over report). ⛔ SHAPE CLIPS (note v3.2 §4): NOTHING IS WRITTEN HERE — a
 * migrated chain loads with `units` null, and the store saves it on the first measured frame (if it has clips).
 * - v3 present and readable → it. ⛔ [E3] v3 present but UNREADABLE → kept aside (`…-v3-refused`), the bench starts EMPTY
 *   and says so; ⛔ it NEVER falls back to v2 or v1 (an older state would be shown as current, then saved over Carl's work).
 * - v3 ABSENT → v2 (T1a's tracks) migrated (R1's verdict carried as `migrations[0]`). v2 UNREADABLE → the bench starts
 *   EMPTY and says so, v2 left as it is; ⛔ never a fall back to v1. (No v3 is written for an empty chain, so the refusal
 *   is shown again on every load until something is recorded.)
 * - BOTH ABSENT → v1 (R1) migrated and ⛔ PROVEN ON CARL's OWN CHAIN (`parityV1`: every sample, every boundary exactly and
 *   ± PROBE, within 1e-9). ⛔ [E2] Different → still carried (his work is never held or lost), v1 untouched, and a
 *   PERSISTENT line until Carl decides. ⛔ v2 and v1 are never written or removed (Carl: "Only when I say so").
 */
let loaded: Loaded | null = null;
function loadChain(): Loaded {
  if (loaded) return loaded;
  return (loaded = readChain());
}
function readChain(): Loaded {
  const empty = (error: string | null): Loaded => ({ chain: emptyChain(), error, carry: null });
  const read = (k: string) => window.localStorage.getItem(k);
  const parse = (raw: string): ReturnType<typeof parseChain> => {
    try {
      return parseChain(JSON.parse(raw));
    } catch (e) {
      return { refusal: (e as Error).message };
    }
  };
  let raw3: string | null = null;
  try {
    raw3 = read(CHAIN_KEY);
  } catch (e) {
    return empty(`This browser's storage cannot be read (${(e as Error).message}); the bench starts empty.`);
  }
  if (raw3 !== null) {
    const r = parse(raw3);
    if ("chain" in r && r.from === 3) return { chain: r.chain, error: null, carry: differences(r.chain) };
    const why = "refusal" in r ? r.refusal : "it holds an older version under the new name";
    try {
      window.localStorage.setItem(`${CHAIN_KEY}-refused`, raw3);
    } catch {}
    return empty(
      `The saved recording could not be read (${why}). It is kept aside, unread, as "${CHAIN_KEY}-refused"; the older copies are kept as "${CHAIN_KEY_V2}" and "${CHAIN_KEY_V1}". The bench starts empty.`,
    );
  }
  const raw2 = read(CHAIN_KEY_V2);
  if (raw2 !== null) {
    const r = parse(raw2);
    if (!("chain" in r) || r.from !== 2) {
      const why = "refusal" in r ? r.refusal : `it holds chain version ${r.from} under the version 2 name`;
      return empty(`Your track recording could not be read (${why}). It is kept, unread, as "${CHAIN_KEY_V2}". The bench starts empty.`);
    }
    const all = ((raw2.length + JSON.stringify(r.chain).length + CHAIN_KEY.length + CHAIN_KEY_V2.length) / STORAGE_CHARS) * 100;
    const carry = differences(r.chain) ?? {
      text: `Your recording was carried over to the new format (shapes can now sit on the tracks): ${r.chain.clips.length} clips. The old copy is kept (both use ${all.toFixed(1)}% of this browser's storage).`,
      persist: false,
    };
    return { chain: r.chain, error: null, carry };
  }
  const raw1 = read(CHAIN_KEY_V1);
  if (raw1 === null) return empty(null);
  let r: ReturnType<typeof parseChain>;
  try {
    r = parseChain(JSON.parse(raw1));
  } catch (e) {
    r = { refusal: (e as Error).message };
  }
  if ("refusal" in r) return empty(`Your R1 recordings could not be read (${r.refusal}); they are kept, unread. The bench starts empty.`);
  if (!r.migrated) return empty(`The R1 key holds a newer chain (version ${r.chain.version}); it is kept, unread. The bench starts empty.`);
  // ⚠ HARNESS ONLY: `__cameraBenchParityTol` < 0 forces the "differences" path. Valid R1 data cannot reach it (proven in
  // Node: the migration is the same arithmetic), so the harness has no other way to exercise [E2]. Never set by the page.
  const tol = (window as unknown as { __cameraBenchParityTol?: number }).__cameraBenchParityTol ?? 1e-9;
  const p = parityV1(r.migrated, r.chain, tol);
  const chain: Chain = { ...r.chain, migrations: [{ from: 1, moments: p.moments, maxDiff: Number.isFinite(p.maxDiff) ? p.maxDiff : null, ok: p.ok }] };
  const both = ((raw1.length + JSON.stringify(chain).length + CHAIN_KEY.length + CHAIN_KEY_V1.length) / STORAGE_CHARS) * 100;
  const carry = p.ok
    ? {
        text: `Your R1 recordings were carried over to tracks: ${chain.clips.length} clips, checked at ${p.moments} moments, identical. The old copy is kept (both copies use ${both.toFixed(1)}% of this browser's storage).`,
        persist: false,
      }
    : differences(chain);
  return { chain, error: null, carry };
}
/** ⛔ [E2] the carry-over's DIFFERENCES line — persistent, from R1's verdict (`from: 1`) kept with the chain, until Carl
 *  decides */
function differences(chain: Chain): Loaded["carry"] {
  const m = chain.migrations.find((x) => x.from === 1);
  if (!m || m.from !== 1 || m.ok) return null;
  return { text: `Carried over with differences: largest ${m.maxDiff === null ? "a moment one rule could not pose" : m.maxDiff.toPrecision(3)} (the old copy is kept).`, persist: true };
}

const noFocus = (e: { preventDefault: () => void }) => e.preventDefault();

/** A small control on the picture's overlay — no focus on a mouse click ([B3]), its own pointer events. */
function OverlayButton({ label, pressed, onClick, children }: { label: string; pressed?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onMouseDown={noFocus}
      onClick={onClick}
      className={`pointer-events-auto flex h-7 min-w-7 items-center justify-center rounded border border-white/10 px-2 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
        pressed ? "bg-neutral-200 text-neutral-950" : "bg-black/60 text-neutral-200 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

/** Drawn in the browser only — the saved chain is read on the first render, and the bench has nothing to show a server. */
export default dynamic(() => Promise.resolve(CameraBenchInner), { ssr: false });

function CameraBenchInner() {
  const dpr = useCanvasDpr([1, 2]);
  const { spec, lines, spans, shown, failure } = usePieceBuild("arch");
  const [initial] = useState(loadChain);
  const [store] = useState(() => new BenchStore(initial.chain));
  // ⛔ the Builder's take handed to the store (an effect, re-run when the take's code changes — Fast Refresh re-runs effects)
  useEffect(() => {
    store.setBuilderTake(BUILDER_TAKE);
  });
  const [chain, setChain] = useState<Chain>(initial.chain);
  const [selection, setSelection] = useState<string[]>([]);
  const [view, setView] = useState<View | null>(null);
  const [saveError, setSaveError] = useState<string | null>(initial.error);
  const [carry, setCarry] = useState(initial.carry);
  const [failed, setFailed] = useState<string | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [grid, setGrid] = useState(true);
  const [drawer, setDrawer] = useState<"help" | "info" | null>(null);
  const [world, setWorld] = useState<ArchWorld | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  /** the third-person labels' layer — written by the render callback by ref, never through React */
  const labelsRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const why = failed ?? failure;

  /** ⛔ THE ONE PLACE A CHANGED CHAIN ENTERS REACT AND STORAGE — called by the store at a stop, a delete, a new track. A
   *  failed write is SHOWN until the next good one. The carry-over's report goes at the first change; its DIFFERENCES line
   *  stays ([E2]). */
  // ⛔ THE SAVE RULE, STATED ONCE (the plan v2.1): storage is written for an ACTION, or for a chain with CLIPS — so a quiet
  // change (the units filled on the first measured frame; `bind()`'s catch-up) never writes an empty v3, and an unreadable
  // v2's refusal is not buried by one. ONLY an action clears the carry-over line: today it lasts until Carl's first action.
  const commit = useCallback((c: Chain, o: { action: boolean }) => {
    setChain(c);
    setSelection((sel) => sel.filter((id) => c.clips.some((k) => k.id === id)));
    if (o.action || c.clips.length) setSaveError(saveChain(c));
    if (o.action) setCarry((k) => (k?.persist ? k : null));
  }, []);
  useEffect(() => {
    store.bind({ commit });
    return () => store.bind(null);
  }, [store, commit]);

  // ⛔ THE ONE WAY IN FOR A COMPUTED MOVE (note v3.2 §5a): `window.__benchPlace(shape)` hands a shape (chain units) to the
  // STORE's own Place — validated, the newest take on the armed track at the playhead, committed by the one commit. The
  // Builder (Playwright) or the Browser seat (Carl's tab) calls it; it retires the console snippet's write behind the bench.
  // ⛔ GATED IN CODE: Next inlines NODE_ENV, so a production build has no hook (⚠ so hook harnesses run on the dev server)
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const w = window as unknown as { __benchPlace?: (s: Shape) => { id: string } | { refusal: string } };
    w.__benchPlace = (s) => store.placeShape(s);
    return () => {
      delete w.__benchPlace;
    };
  }, [store]);

  // click selects one (click it again to clear); shift / ctrl / cmd adds or removes
  const select = (id: string, additive: boolean) => {
    const next = additive ? (selection.includes(id) ? selection.filter((s) => s !== id) : [...selection, id]) : selection.length === 1 && selection[0] === id ? [] : [id];
    setSelection(next);
    store.setSelection(next);
  };
  /** a press on an UNSELECTED clip selects it at once (T1b: Resolve; the inspector's trim readout shows during the drag);
   *  a bare-row click clears (Carl: "Clear the selection") */
  const selectOnly = (ids: string[]) => {
    setSelection(ids);
    store.setSelection(ids);
  };

  // ⛔ T1b, THE EDIT's ONE OWNER (the plan v1.4 §5a) — every way a drag ends comes HERE: pointer up (commit), Esc and a
  // hidden tab (the window listeners below), a lost pointer (the timeline). ⛔ WHETHER A DRAG IS LIVE IS A REF: pointerup
  // and lostpointercapture arrive back to back before React re-renders, so THE FIRST ENDING WINS and a later one finds the
  // ref clear; the keyboard handler (registered once) reads the ref, never the state. The state is for drawing only.
  const [edit, setEdit] = useState<Edit | null>(null);
  const editRef = useRef<Edit | null>(null);
  const editStart = useCallback(
    (e: Edit) => {
      if (editRef.current || !store.setEdit(e)) return false;
      editRef.current = e;
      setEdit(e);
      return true;
    },
    [store],
  );
  const editMove = useCallback(
    (e: Edit) => {
      if (editRef.current?.id !== e.id) return; // ended (Esc, a hidden tab): a stray move cannot restart it
      editRef.current = e;
      store.setEdit(e);
      setEdit(e);
    },
    [store],
  );
  const editEnd = useCallback(
    (commit: boolean) => {
      if (!editRef.current) return;
      editRef.current = null;
      store.endEdit(commit);
      setEdit(null);
    },
    [store],
  );
  // snapping: ON by default, N toggles it — also mid-drag (Carl: "snapping always on and the N to turn it off/on")
  const [snap, setSnap] = useState(true);
  const snapRef = useRef(true);

  // ⛔ KEYBOARD — the fallback (and what tests drive). Ignored while typing in a field. ⛔ [A4] Space / Enter on a FOCUSED
  // control (reached by Tab) belong to THAT control: the window handler leaves them alone, so nothing fires twice.
  useEffect(() => {
    const typing = (e: Event) => (e.target as HTMLElement | null)?.closest?.("input, textarea, select") != null;
    const onControl = (e: Event) => (e.target as HTMLElement | null)?.closest?.("button, [role='button']") != null;
    const down = (e: KeyboardEvent) => {
      if (typing(e)) return;
      if ((e.code === "Space" || e.code === "Enter") && onControl(e)) return;
      store.keyDown(e.code);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "Home", "End", "Backspace"].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      if (e.code === "KeyN") {
        snapRef.current = !snapRef.current;
        setSnap(snapRef.current);
        store.setSnap(snapRef.current);
        return;
      }
      // ⛔ T1b: DURING A DRAG Esc cancels and every other key is IGNORED ([R3]) — read from the REF (this handler is
      // registered once); the store's own gates hold too
      if (editRef.current) {
        if (e.code === "Escape") editEnd(false);
        return;
      }
      if (e.code === "Space") store.pressA();
      else if (e.code === "Backspace" || e.code === "Delete") store.deleteSelected();
      else if (e.code === "KeyP") store.togglePlay();
      else if (e.code === "Home") store.toStart();
      else if (e.code === "End") store.toEnd();
      else if (e.code === "KeyH") store.home();
      else if (e.code === "Comma") store.step(-1);
      else if (e.code === "Period") store.step(1);
      else if (e.code === "KeyC") store.cycleArm();
      // ⛔ T: third person on / off — the keyboard twin of the right-stick click (ignored mid-drag: the `editRef` return above)
      else if (e.code === "KeyT") store.toggleView();
    };
    const up = (e: KeyboardEvent) => store.keyUp(e.code);
    const blur = () => store.keysClear();
    // ⛔ THE ONE THING OUTSIDE THE FRAME CALLBACK: a hidden tab draws no frames, so it is heard here (note decision 4)
    const hidden = () => {
      if (!document.hidden) return;
      store.stopRecording("Stopped: the tab was hidden");
      editEnd(false); // T1b: a hidden tab cancels a drag
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [store, editEnd]);

  // ⛔ THE NO-WEBGL NET — heard in the CAPTURE phase (it does not bubble)
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fail = () => setFailed("a WebGL context could not be created");
    el.addEventListener("webglcontextcreationerror", fail, { capture: true, once: true });
    return () => el.removeEventListener("webglcontextcreationerror", fail, { capture: true });
  }, []);

  const recording = view?.mode === "rec";
  // ⛔ CLIP METRES through the CHAIN's units (never the live `d`); while they are null (a migrated chain, before its first
  // measured frame) the metres are unknown — shown as "…", not guessed from the live measure
  const units = chain.units;
  const metresPerD = units ? (units.d * CM_PER_PX) / 100 : NaN;
  // ⛔ the joins and gaps derived ON CHAIN CHANGE, never per frame (the plan v2)
  const joins = useMemo(() => joinsOf(chain, metresPerD), [chain, metresPerD]);
  const gaps = useMemo(() => gapsOf(chain), [chain]);
  // ⛔ the clash warnings, ON CHAIN CHANGE too (4,000 poses per shape — never per 0.1 s view)
  const clashes = useMemo(() => new Map(chain.clips.filter((c) => c.shape).map((c) => [c.id, clashNote(c, units, world)])), [chain, units, world]);
  const toMetres = units && world
    ? (p: Pose) => ({
        right: (p.x * units.d * CM_PER_PX) / 100,
        up: ((units.up + p.y * units.d - world.floor) * CM_PER_PX) / 100,
        out: ((units.zc + p.z * units.d - world.z1) * CM_PER_PX) / 100,
      })
    : null;
  const transportView: TransportView = view ?? {
    mode: "fly",
    T: 0,
    duration: chainEnd(chain),
    recLength: 0,
    armedCam: chain.tracks[chain.tracks.length - 1],
    status: "Starting…",
    tone: "idle",
    chainEmpty: !chain.clips.length,
    hasSelection: false,
  };

  return (
    <div className="space-y-3" data-camera-bench={why ? "failed" : drawn ? "drawn" : "pending"}>
      <MeasureSpans lines={lines} fontKey={spec.font} spans={spans} accessible={false} />
      <div className="relative w-full overflow-hidden rounded-md border border-white/10 bg-[#0a0a0a]" style={{ height: "min(calc(68 * var(--vh)), 56.25vw)" }}>
        {/* ⛔ THE DRAG SURFACE — the picture only. Every overlay is its SIBLING ([A3]), never inside it: this element takes
            pointer capture on every pointerdown, so a button inside it would start a camera drag. */}
        <div
          ref={wrap}
          className="absolute inset-0 touch-none"
          data-drag-surface
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            store.addMouse(e.clientX - drag.current.x, e.clientY - drag.current.y);
            drag.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
        >
          {why ? (
            <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-neutral-300">The bench cannot draw: {why}.</p>
          ) : (
            <Guard onFailed={() => setFailed("the canvas threw")}>
              <Canvas
                gl={{ antialias: true, alpha: true }}
                resize={{ offsetSize: true }}
                dpr={dpr}
                frameloop="always"
                onCreated={({ gl }) => {
                  gl.domElement.addEventListener("webglcontextlost", () => setFailed("the WebGL context was lost"), { once: true });
                }}
              >
                <NeutralToneMapping />
                {/* ⛔ THE SUSPENSE BOUNDARY INSIDE THE CANVAS (the page's own pattern): the piece waits on the studio HDRI
                    (`use`). Without a boundary here the wait reaches the OUTER boundary, React hides the bench and disconnects its
                    effects, R3F takes that for an unmount and forces the context lost — measured 26 October (the bench drew,
                    then "Context Lost" at ~2 s). */}
                <Suspense fallback={null}>
                  {shown && (
                    <BenchScene
                      built={shown}
                      store={store}
                      grid={grid}
                      chain={chain}
                      armedCam={transportView.armedCam}
                      soloId={view?.soloId ?? null}
                      labels={labelsRef}
                      onView={setView}
                      onWorld={setWorld}
                      onReady={() => setDrawn(true)}
                    />
                  )}
                </Suspense>
              </Canvas>
            </Guard>
          )}
        </div>

        {/* ⛔ THE OVERLAY LAYER — pointer-events: none ([A3]); only its controls take clicks, so a drag on bare picture looks */}
        <div className="pointer-events-none absolute inset-0" data-overlay>
          {/* ⛔ THIRD PERSON: the PiP's frame and label — over the rectangle the render callback scissors (`PIP`, one source) —
              and the cameras' labels, positioned by the render callback by ref */}
          {view?.view === "third" && (
            <>
              <div
                className="absolute rounded-sm border"
                style={{ left: PIP.insetPx, top: PIP.insetPx, width: `${PIP.widthFrac * 100}%`, height: `${PIP.widthFrac * 100}%`, borderColor: camColour(transportView.armedCam) }}
                data-pip
              >
                <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-white" data-pip-label>
                  {view.pipLabel}
                </span>
              </div>
              <div ref={labelsRef} className="absolute inset-0 overflow-hidden" data-cam-labels>
                {chain.tracks.map((cam) => (
                  <span key={cam} data-cam-label={cam} className="absolute left-0 top-0 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold" style={{ color: camColour(cam), display: "none" }}>
                    Cam {cam}
                  </span>
                ))}
              </div>
            </>
          )}
          {/* the HUD: the pad, where the camera is, the lens; the two drawers */}
          <div className="absolute right-3 top-3 flex items-start gap-2">
            <div className="rounded-md border border-white/10 bg-black/60 px-2.5 py-1.5 text-right font-mono text-[11px] leading-snug text-neutral-300 tabular-nums" data-hud>
              <div data-pad={view?.pad.connected ? "connected" : "none"}>
                <span className={view?.pad.connected ? "text-emerald-400" : "text-neutral-500"}>●</span>{" "}
                {view?.pad.connected ? "Pad" : "Press a pad button"}
              </div>
              {view && world && (
                <>
                  <div>
                    {((view.at.x * CM_PER_PX) / 100).toFixed(2)} · {(((view.at.y - world.floor) * CM_PER_PX) / 100).toFixed(2)} ·{" "}
                    {(((view.at.z - world.z1) * CM_PER_PX) / 100).toFixed(2)} m
                  </div>
                  <div className="text-neutral-500">{view.mm.toFixed(0)} mm lens</div>
                  {/* third person: the position and lens above are the PiP camera's (where switching off puts Carl) */}
                  {view.view === "third" && (
                    <div className="text-amber-300" data-hud-third>
                      Third person{view.eyeM !== null ? ` · eye ${view.eyeM.toFixed(1)} m out` : ""}
                    </div>
                  )}
                </>
              )}
            </div>
            {/* ⛔ The MOVES drop-down (and Open before it) was built and REMOVED (Carl: "remove the moves, i said we will come
                back to it") — signature moves are a future session. `moveFromFile` in `bench-chain.ts` stays, tested. */}
            <OverlayButton label="Controls" pressed={drawer === "help"} onClick={() => setDrawer((d) => (d === "help" ? null : "help"))}>
              ?
            </OverlayButton>
            <OverlayButton label="Scene information" pressed={drawer === "info"} onClick={() => setDrawer((d) => (d === "info" ? null : "info"))}>
              i
            </OverlayButton>
          </div>

          {drawer && (
            <div className="pointer-events-auto absolute bottom-24 right-3 top-14 w-80 overflow-auto rounded-md border border-white/10 bg-black/85 p-4 text-xs leading-relaxed text-neutral-300 backdrop-blur-sm" data-drawer={drawer}>
              {drawer === "help" ? (
                <>
                  <h2 className="mb-2 text-sm font-semibold text-white">The pad</h2>
                  <dl className="grid grid-cols-[6.5rem_1fr] gap-x-2 gap-y-1">
                    <dt className="text-neutral-500">Left stick</dt>
                    <dd>forward / back, walking pace</dd>
                    <dt className="text-neutral-500">Right stick</dt>
                    <dd>slide left / right</dd>
                    <dt className="text-neutral-500">Hold B + right stick</dt>
                    <dd>look: turn left / right or tilt up / down</dd>
                    <dt className="text-neutral-500">D-pad</dt>
                    <dd>forward / back, slide left / right, twice walking pace</dd>
                    <dt className="text-neutral-500">LT / RT</dt>
                    <dd>sink / rise</dd>
                    <dt className="text-neutral-500">LB / RB</dt>
                    <dd>zoom wider / longer</dd>
                    <dt className="text-neutral-500">A</dt>
                    <dd>record / stop</dd>
                    <dt className="text-neutral-500">X</dt>
                    <dd>play / stop (the selected clips solo, else the edit)</dd>
                    <dt className="text-neutral-500">Y</dt>
                    <dd>to the start</dd>
                    <dt className="text-neutral-500">Start</dt>
                    <dd>arm the next camera track</dd>
                    <dt className="text-neutral-500">View</dt>
                    <dd>default view (third person: see the whole scene)</dd>
                    <dt className="text-neutral-500">Right-stick click</dt>
                    <dd>third person on / off: off puts you in the selected camera</dd>
                  </dl>
                  <h2 className="mb-2 mt-4 text-sm font-semibold text-white">How it records</h2>
                  <p>
                    Each camera has its own track; the armed one (red) is where A records, at the playhead. Fly to frame first; nothing records until A,
                    and A again stops. The top track plays wherever it has a clip, like Resolve&apos;s A and B roll, so a Cam 2 clip over Cam 1 is a cut
                    and Cam 1 is untouched underneath. Recording over a clip on the armed track makes a new take on top; the old one is kept. Selected
                    clips play solo. Nothing ripples: delete a clip and its time becomes a gap, which holds the last picture.
                  </p>
                  <h2 className="mb-2 mt-4 text-sm font-semibold text-white">Keyboard</h2>
                  <p>
                    W S forward / back · A D slide · E Q rise / sink · arrows turn / tilt · drag to look · [ ] lens · Shift fast · Alt slow · Space record · P play ·
                    Home start · End end · H default (third person: the whole scene) · , . step · C arm the next track · T third person · Delete delete
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mb-2 text-sm font-semibold text-white">The arch (1 px = 1 cm)</h2>
                  {world && (
                    <ul className="space-y-1 font-mono text-[11px]" data-arch-world>
                      <li>
                        {metres(world.x1 - world.x0)} wide × {metres(world.top - world.floor)} tall × {metres(world.z1 - world.z0)}
                        {" deep"}
                      </li>
                      <li>
                        opening {metres(world.clearW)} wide × {metres(world.clearH)}
                        {" to the crown"}
                      </li>
                      <li>
                        letters {metres(world.archCap)} tall; &quot;YOUR&quot; stands {metres(world.topBase)}
                        {" up"}
                      </li>
                    </ul>
                  )}
                  <h2 className="mb-2 mt-4 text-sm font-semibold text-white">The floor</h2>
                  <OverlayButton label="Floor grid" pressed={grid} onClick={() => setGrid((g) => !g)}>
                    {grid ? "Grid on" : "Grid off"}
                  </OverlayButton>
                  <p className="mt-2">
                    1 m squares (grey); 10 cm round the focus object within 3 m (blue); the arch&apos;s face (red) and centre line (blue) cross at ground zero.
                  </p>
                  {view?.focusPx !== undefined && (
                    <p className="mt-2 font-mono text-[11px]">
                      focus object: the C, {metres(view.focusPx)}
                      {" away"}
                    </p>
                  )}
                  <h2 className="mb-2 mt-4 text-sm font-semibold text-white">The lens</h2>
                  <p>
                    {view ? `${view.mm.toFixed(0)} mm, ${view.fov.toFixed(1)}° vertical` : "…"}, on a full-frame {SENSOR_MM} mm-wide sensor: a default until Carl
                    names his Unreal filmback.
                  </p>
                  <h2 className="mb-2 mt-4 text-sm font-semibold text-white">Saving</h2>
                  <p>
                    Recordings are saved in this browser when a clip stops or is deleted, or a track is added. Recordings made before camera tracks are kept
                    under their old name as well; the bench never removes them.
                  </p>
                </>
              )}
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 flex">
            <BenchTransport
              v={transportView}
              saveError={saveError}
              carry={carry ? { text: carry.text, warn: carry.persist } : null}
              act={{
                record: () => store.pressA(),
                play: () => store.togglePlay(),
                toStart: () => store.toStart(),
                toEnd: () => store.toEnd(),
                home: () => store.home(),
                addCam: () => store.addCamera(),
                remove: () => store.deleteSelected(),
              }}
            />
          </div>
        </div>
      </div>

      <BenchTimeline
        chain={chain}
        joins={joins}
        gaps={gaps}
        T={view?.T ?? chainEnd(chain)}
        armedCam={transportView.armedCam}
        rec={view?.rec ?? null}
        selection={selection}
        disabled={recording}
        toMetres={toMetres}
        onSelect={select}
        onSelectOnly={selectOnly}
        onArm={(cam) => store.arm(cam)}
        onScrub={(T) => store.scrub(T)}
        edit={edit}
        snap={snap}
        metresPerD={metresPerD}
        onEditStart={editStart}
        onEditMove={editMove}
        onEditEnd={editEnd}
        frame={units && world ? { units, floor: world.floor, z1: world.z1 } : null}
        shapeNote={(c) => clashes.get(c.id) ?? null}
        onShapeEdit={(id, s) => store.editShape(id, s)}
        onShapeStart={(id) => store.recaptureShapeStart(id)}
      />
    </div>
  );
}
