"use client";

/**
 * ⛔ THE CAMERA BENCH — R1, THE RECORDER (`/proto/camera`; D-104). The plan `live-work/plan-camera-recorder-r1-26-october.md`
 * v2.3 (five rounds of the Architect's review; Carl: *"Approved and proceed"*), under the approved note
 * `live-work/structural-note-camera-recorder-26-october.md` v2.2. Carl's design: *"A should start the tracking of the movement
 * and pressing it again should stop it"*; chunks as CLIPS; a deliberate OVERWRITE before a punch-in; new cameras as cuts; the
 * chain handed to the Builder to refine (R2). Chunk 1's keyframes are RETIRED (the keys, the key table, the key clock).
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
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid, Line, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useCanvasDpr } from "@/lib/use-site-scale";
import { FRONT_FOV, MeasureSpans } from "./lettering-hooks";
import { Guard, LetteringPiece, measurePiece, NeutralToneMapping, usePieceBuild, type Built, type PieceMeasure } from "./lettering-piece";
import { BTN, Edges, focalMm, readPad, rigAt, SENSOR_MM, stepRig, FEEL, type Intent, type Rig } from "./camera-pad";
import {
  appendClip, chainDuration, clampDt, clipLength, clipStarts, deleteClips, EDGE_S, emptyChain, locate, maxCam, newClipId, parseChain, poseAt,
  punchIn, Sampler, type Chain, type Pose,
} from "./bench-chain";
import { BenchTransport, type Tone, type TransportView } from "./bench-transport";
import { BenchTimeline } from "./bench-timeline";

type Mode = "fly" | "rec" | "play";
/** What the UI shows, every 0.1 s: the transport's view, the pad, the camera (world px), the subject's units. */
type View = TransportView & {
  pad: { connected: boolean; id: string };
  mm: number;
  fov: number;
  at: { x: number; y: number; z: number };
  units: { d: number; up: number; zc: number };
  rec: { at: number; length: number; cam: number } | null;
  focusPx?: number;
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
  };
}

/** ⛔ THE CHAIN's KEY — its own version inside (`CHAIN_VERSION`, never the shot format's). Chunk 1's keyed take
 *  (`c2b-camera-bench-take-v1`) is left UNREAD, so nothing written before R1 is reinterpreted. */
const CHAIN_KEY = "c2b-camera-bench-chain-v1";
const MOUSE_DEG_PER_PX = 0.15;
const NOTICE_MS = 4000;
const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/** World ↔ subject units. The subject's centre is (0, up, zc); d the front distance. */
const toWorld = (m: PieceMeasure, p: { x: number; y: number; z: number }) => ({ x: p.x * m.d, y: m.up + p.y * m.d, z: m.zc + p.z * m.d });
const toUnits = (m: PieceMeasure, w: { x: number; y: number; z: number }) => ({ x: w.x / m.d, y: (w.y - m.up) / m.d, z: (w.z - m.zc) / m.d });
/** The page's own start: face-on at (0, 0, d) in the world — the front distance from the arch's FRONT, not its middle. */
const front = (m: PieceMeasure): Pose => ({ ...toUnits(m, { x: 0, y: 0, z: m.d }), yaw: 0, pitch: 0, fov: FRONT_FOV });

/**
 * ⛔ THE BENCH's ONE MUTABLE STORE — the chain (mirrored), the playhead, the recording, the rig, the inputs; changed only
 * through these methods. React holds what the page SHOWS (the chain, the selection, the view); the store COMMITS a changed
 * chain to it (a stop, a delete) and nothing else. `frame()` is the whole of the one frame callback.
 *
 * ⛔ THE PLAYHEAD `T` and `atEnd`: "AT THE END" IS A FACT THE STORE KEEPS ([A5]) — set ONLY when no clip follows the
 * playhead: a stop that appended; a punch-in's stop with no clip after it ([B1]); To the end; an empty chain; a play that
 * reaches the CHAIN's end ([B4]); a delete leaving no clip after T ([B5]). Cleared by a scrub, Y, a step, a play stopped
 * inside. A at the end RECORDS; A inside the chain does nothing unless OVERWRITE is armed (Carl: *"a deliberate act"*).
 */
class BenchStore {
  private chain: Chain;
  private selection: string[] = [];
  private mode: Mode = "fly";
  private T: number;
  private atEnd = true;
  /** the camera HELD at the playhead's pose (after a scrub, a step, a play) until a fly input moves it */
  private posed = false;
  private armed = { overwrite: false, newCam: false };
  private rec: { sampler: Sampler; punchAt: number | null; cam: number } | null = null;
  private queue: [number, number][] = [];
  private queueIdx = 0;
  private queueLabel = "";
  private queueToEnd = false;
  private jumpTo: Pose | "front" | null = null;
  private keys = new Set<string>();
  private mouse = { dx: 0, dy: 0 };
  private rig: Rig | null = null;
  private m: PieceMeasure | null = null;
  private edges = new Edges();
  private hudAt = 0;
  private padWas = false;
  private notice: { text: string; until: number } | null = null;
  private ui: { commit: (c: Chain) => void } | null = null;

  constructor(chain: Chain) {
    this.chain = chain;
    this.T = chainDuration(chain);
  }
  bind(ui: BenchStore["ui"]) {
    this.ui = ui;
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
  private say(text: string) {
    this.notice = { text, until: performance.now() + NOTICE_MS };
  }
  /** ⛔ AN ACTION CLEARS AN OLD NOTICE — a 4 s message ("Inside the chain: press Overwrite…") had hidden the very state its
   *  advice produced ("Overwrite armed"; measured 26 October) */
  private acted() {
    this.notice = null;
  }
  private commit(chain: Chain) {
    this.chain = chain;
    this.selection = this.selection.filter((id) => chain.clips.some((c) => c.id === id));
    this.ui?.commit(chain);
  }
  private pose(): Pose | null {
    const r = this.rig, m = this.m;
    return r && m ? { ...toUnits(m, r), yaw: r.yaw, pitch: r.pitch, fov: r.fov } : null;
  }
  /** the camera a recording goes on: a NEW one if armed; a punch-in continues the PUNCHED clip's camera ([A1]); at the end,
   *  the last clip's */
  private camFor(punchAt: number | null) {
    if (this.armed.newCam) return maxCam(this.chain) + 1;
    if (punchAt !== null) return this.chain.clips[locate(this.chain, punchAt)!.index].cam;
    return this.chain.clips[this.chain.clips.length - 1]?.cam ?? 1;
  }

  /** A / Space / the record button */
  pressA() {
    if (this.rec) return this.stopRecording(null);
    if (this.mode === "play") return this.stopPlay(true);
    const pose = this.pose();
    if (!pose) return;
    if (!this.chain.clips.length || this.atEnd) return this.startRec(null, pose);
    if (this.armed.overwrite) return this.startRec(this.T, pose);
    const at = locate(this.chain, this.T)!;
    this.say(`Inside the chain: press Overwrite, then A, to record over clip ${at.index + 1} from ${at.local.toFixed(1)} s`);
  }
  private startRec(punchAt: number | null, pose: Pose) {
    this.acted();
    this.rec = { sampler: new Sampler(pose), punchAt, cam: this.camFor(punchAt) };
    this.mode = "rec";
    this.posed = false;
  }
  /** ⛔ STOP — the clip reaches React and storage ONCE. `reason` (a hidden tab, a lost pad, View) is shown. */
  stopRecording(reason: string | null) {
    const rec = this.rec;
    const pose = this.pose();
    if (!rec || !pose) return;
    this.rec = null;
    this.mode = "fly";
    this.armed = { overwrite: false, newCam: false };
    // ⛔ THE CAMERA HALTS WHERE THE CLIP ENDED — the rig's weight (`FEEL.smoothS`) would carry it on ~0.3 m after a stop at
    // walking pace, so the next clip began away from this one's end (measured 26 October: a 0.23 m "mismatch" with no
    // move between). Carl: "If its pressed again the 2 take should start from that point". Nothing is filmed between clips.
    if (this.rig) Object.assign(this.rig, { vx: 0, vy: 0, vz: 0, vyaw: 0, vpitch: 0, vfov: 0 });
    const samples = rec.sampler.finish(pose);
    if (samples[samples.length - 1][0] <= EDGE_S) {
      this.say(reason ? `${reason}; nothing was recorded` : "Nothing was recorded");
      return;
    }
    const clip = { id: newClipId(), cam: rec.cam, samples };
    if (rec.punchAt === null) {
      const chain = appendClip(this.chain, clip);
      this.T = chainDuration(chain);
      this.atEnd = true;
      this.commit(chain);
    } else {
      const { chain, index } = punchIn(this.chain, rec.punchAt, clip);
      this.T = clipStarts(chain)[index] + clipLength(clip);
      // ⛔ [B1] a punch-in's stop is "at the end" ONLY if no clip follows the new one
      this.atEnd = index === chain.clips.length - 1;
      this.commit(chain);
    }
    if (reason) this.say(reason);
  }
  togglePlay() {
    if (this.rec) return;
    if (this.mode === "play") return this.stopPlay(true);
    const starts = clipStarts(this.chain);
    const dur = chainDuration(this.chain);
    if (dur <= EDGE_S) return;
    const sel = this.chain.clips.map((c, i) => ({ c, i })).filter(({ c }) => this.selection.includes(c.id));
    if (sel.length) {
      this.queue = sel.map(({ c, i }) => [starts[i], starts[i] + clipLength(c)]);
      this.queueToEnd = sel[sel.length - 1].i === this.chain.clips.length - 1;
      const nums = sel.map(({ i }) => i + 1);
      this.queueLabel = nums.length === 1 ? `clip ${nums[0]}` : `clips ${nums.join(", ")}`;
    } else {
      const from = this.atEnd || this.T >= dur - EDGE_S ? 0 : this.T;
      this.queue = [[from, dur]];
      this.queueToEnd = true;
      this.queueLabel = "the chain";
    }
    this.acted();
    this.queueIdx = 0;
    this.T = this.queue[0][0];
    this.mode = "play";
    this.posed = true;
  }
  /** a play stopped INSIDE the chain parks the playhead there; `hold` keeps the camera at the playhead's pose */
  private stopPlay(hold: boolean) {
    this.mode = "fly";
    this.posed = hold;
    this.atEnd = false;
  }
  private advancePlay(dt: number) {
    this.T += dt;
    while (this.T >= this.queue[this.queueIdx][1]) {
      if (this.queueIdx < this.queue.length - 1) {
        const over = this.T - this.queue[this.queueIdx][1];
        this.queueIdx++;
        this.T = this.queue[this.queueIdx][0] + over;
      } else {
        this.T = this.queue[this.queueIdx][1];
        this.mode = "fly";
        this.posed = true;
        // ⛔ [B4] only a play that reaches the CHAIN's end is "at the end"
        this.atEnd = this.queueToEnd;
        break;
      }
    }
  }
  toStart() {
    if (this.rec) return;
    if (!this.chain.clips.length) return this.home(); // [A5] Y on an empty chain: the default view
    this.acted();
    this.mode = "fly";
    this.T = 0;
    this.posed = true;
    this.atEnd = false;
  }
  toEnd() {
    if (this.rec) return;
    this.acted();
    this.mode = "fly";
    this.T = chainDuration(this.chain);
    this.posed = this.chain.clips.length > 0;
    this.atEnd = true;
  }
  scrub(T: number) {
    if (this.rec || !this.chain.clips.length) return;
    this.acted();
    this.mode = "fly";
    this.T = Math.max(0, Math.min(T, chainDuration(this.chain)));
    this.posed = true;
    this.atEnd = false;
  }
  /** comma / full stop: between clip starts; right past the last clip is To the end (the D-pad's until 27 October 2026) */
  step(dir: number) {
    if (this.rec || !this.chain.clips.length) return;
    const starts = clipStarts(this.chain);
    if (dir > 0) {
      const next = starts.find((s) => s > this.T + EDGE_S);
      return next === undefined ? this.toEnd() : this.scrub(next);
    }
    const prev = [...starts].reverse().find((s) => s < this.T - EDGE_S);
    this.scrub(prev ?? 0);
  }
  /** ⛔ HOME — the DEFAULT view (0, 4.29, 22.71 m, square on, 30°), the playhead untouched. ⛔ [B2] while recording it STOPS
   *  the recording FIRST: a jump inside a clip is never recorded. */
  home() {
    if (this.rec) this.stopRecording("Stopped, then default view");
    if (this.mode === "play") this.stopPlay(false);
    this.posed = false;
    this.jumpTo = "front";
  }
  toggleOverwrite() {
    if (this.rec || !this.chain.clips.length) return;
    this.acted();
    this.armed = { ...this.armed, overwrite: !this.armed.overwrite };
  }
  toggleNewCam() {
    if (this.rec) return;
    this.acted();
    this.armed = { ...this.armed, newCam: !this.armed.newCam };
  }
  deleteSelected() {
    if (this.rec || !this.selection.length) return;
    this.acted();
    const chain = deleteClips(this.chain, new Set(this.selection));
    const dur = chainDuration(chain);
    // ⛔ [A5] the playhead CLAMPED to the new end; [B5] "at the end" whenever no clip remains after it
    if (this.T > dur) this.T = dur;
    this.atEnd = this.T >= dur - EDGE_S;
    this.selection = [];
    this.commit(chain);
  }

  private status(): { status: string; tone: Tone } {
    if (this.notice && performance.now() < this.notice.until) return { status: this.notice.text, tone: "warn" };
    const n = this.chain.clips.length;
    if (this.rec) {
      const L = this.rec.sampler.length.toFixed(1);
      if (this.rec.punchAt === null) return { status: `● Recording clip ${n + 1} (Cam ${this.rec.cam}) · ${L} s · A stops`, tone: "rec" };
      const at = locate(this.chain, this.rec.punchAt)!;
      return { status: `● Recording over clip ${at.index + 1} from ${at.local.toFixed(1)} s (Cam ${this.rec.cam}) · ${L} s · A stops`, tone: "rec" };
    }
    if (this.mode === "play") return { status: `Playing ${this.queueLabel} · X or any stick stops`, tone: "play" };
    if (!n) return { status: `Ready · A records clip 1 (Cam ${this.camFor(null)}) from here`, tone: "idle" };
    if (this.atEnd) return { status: `At the end · A records clip ${n + 1} (Cam ${this.camFor(null)}) from here`, tone: "idle" };
    const at = locate(this.chain, this.T)!;
    if (this.armed.overwrite) {
      return { status: `Overwrite armed · A records over clip ${at.index + 1} from ${at.local.toFixed(1)} s (Cam ${this.camFor(this.T)})`, tone: "warn" };
    }
    return { status: `In clip ${at.index + 1} at ${at.local.toFixed(1)} s · Overwrite then A records over the rest of it · End adds after the last clip`, tone: "idle" };
  }

  /** ⛔ ONE FRAME: the pad (polled here and nowhere else), the keyboard and mouse, the rig, the recording, playback. */
  frame(camera: THREE.PerspectiveCamera, rawDt: number, m: PieceMeasure, aspect: number, floorY?: number): View | null {
    this.m = m;
    const dt = clampDt(rawDt);
    if (!this.rig) this.rig = rigAt(0, 0, m.d, 0, 0, FRONT_FOV);
    const r = this.rig;
    const setRig = (p: Pose) => {
      const w = toWorld(m, p);
      Object.assign(r, rigAt(w.x, w.y, w.z, p.yaw, p.pitch, p.fov));
    };
    if (this.jumpTo) {
      setRig(this.jumpTo === "front" ? front(m) : this.jumpTo);
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

    if (this.mode === "play") {
      if (active) this.stopPlay(false); // a fly input STOPS playback and flies from where it stopped
      else {
        this.advancePlay(dt);
        const p = poseAt(this.chain, this.T);
        if (p) setRig(p);
      }
    }
    if (this.mode === "fly" && this.posed) {
      if (active) this.posed = false; // a fly input leaves the playhead's pose; the playhead stays PARKED
      else {
        const p = poseAt(this.chain, this.T);
        if (p) setRig(p);
      }
    }
    if (this.mode === "rec" || (this.mode === "fly" && !this.posed)) {
      // a mouse drag turns the camera DIRECTLY (degrees per pixel), not through the stick's eased speed
      r.yaw -= this.mouse.dx * MOUSE_DEG_PER_PX;
      r.pitch = Math.max(-FEEL.pitchLimitDeg, Math.min(FEEL.pitchLimitDeg, r.pitch - this.mouse.dy * MOUSE_DEG_PER_PX));
      stepRig(r, intent, dt, 100 / CM_PER_PX, floorY === undefined ? -Infinity : floorY + LENS_MIN_CM / CM_PER_PX);
    }
    this.mouse.dx = 0;
    this.mouse.dy = 0;
    if (this.rec) this.rec.sampler.step(rawDt, this.pose()!);

    camera.position.set(r.x, r.y, r.z);
    // YXZ: turn about the vertical first, then tilt — as the page's journey (no roll: the rig has none)
    camera.rotation.set((r.pitch * Math.PI) / 180, (r.yaw * Math.PI) / 180, 0, "YXZ");
    if (camera.fov !== r.fov) {
      camera.fov = r.fov;
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();

    this.hudAt += rawDt;
    if (this.hudAt < 0.1) return null;
    this.hudAt = 0;
    const dur = chainDuration(this.chain);
    const recAt = this.rec ? (this.rec.punchAt ?? dur) : 0;
    const view: View = {
      mode: this.mode,
      T: this.T,
      duration: dur,
      recLength: this.rec?.sampler.length ?? 0,
      armed: this.armed,
      ...this.status(),
      chainEmpty: !this.chain.clips.length,
      hasSelection: this.selection.length > 0,
      pad: { connected: pad.connected, id: pad.id },
      mm: focalMm(r.fov, aspect),
      fov: r.fov,
      at: { x: r.x, y: r.y, z: r.z },
      units: { d: m.d, up: m.up, zc: m.zc },
      rec: this.rec ? { at: recAt, length: this.rec.sampler.length, cam: this.rec.cam } : null,
    };
    // for harnesses: the bench's state, read-only
    (window as unknown as { __cameraBench?: object }).__cameraBench = {
      ...view,
      atEnd: this.atEnd,
      posed: this.posed,
      selection: this.selection,
      chain: this.chain,
      clips: this.chain.clips.map((c, i) => ({ n: i + 1, id: c.id, cam: c.cam, len: clipLength(c), samples: c.samples.length })),
      pose: this.pose(),
      d: m.d,
      front: front(m),
    };
    return view;
  }
}

function BenchScene({
  built,
  store,
  grid,
  onView,
  onWorld,
  onReady,
}: {
  built: Built;
  store: BenchStore;
  grid: boolean;
  onView: (v: View) => void;
  onWorld: (w: ArchWorld | null) => void;
  onReady: () => void;
}) {
  const size = useThree((s) => s.size);
  const m = measurePiece("arch", built, size);
  // the arch's box does not depend on the canvas's size (`up` is 0 for the arch) — measured once per build
  const world = useMemo(() => measureArch(built, measurePiece("arch", built, { width: 1, height: 1 })), [built]);
  useEffect(() => onWorld(world), [world, onWorld]);
  const fine = useRef<THREE.Mesh>(null);
  useFrame((st, dt) => {
    const v = store.frame(st.camera as THREE.PerspectiveCamera, dt, m, st.size.width / st.size.height, world?.floor);
    // ⛔ THE FOCUS OBJECT's 10 cm lines: their thickness from the camera's distance to its nearest surface (same callback)
    const focusPx = world?.focus ? world.focus.distanceToPoint(st.camera.position) : Infinity;
    const mat = fine.current?.material as THREE.ShaderMaterial | undefined;
    if (mat?.uniforms?.cellThickness) {
      const k = Math.max(0, Math.min(1, (FINE_FROM_CM / CM_PER_PX - focusPx) / ((FINE_FROM_CM - FINE_FULL_CM) / CM_PER_PX)));
      mat.uniforms.cellThickness.value = FINE_THICKNESS * k;
      mat.uniforms.sectionThickness.value = FINE_THICKNESS * k;
    }
    if (v) onView(world?.focus ? { ...v, focusPx } : v);
  });
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
      {/* ⛔ THE FLOOR GRID — on the arch's lowest ink; lines on the centre line and the front face; EVERY line a metre, all one
          weight (Carl: "make the grid squares 1m x 1m" — the faint metre lines under heavier 5 m ones read as 5 m squares).
          Drawn unlit (its own shader): the arch's light and reflections are untouched. Fades out LINEARLY to 150 m from the
          camera — Carl: "From 21m away i still meed to see 1m squares" (at 21 m the lines keep ~86%). */}
      {grid && world && (
        <Grid
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
          floor (no fight with the metre lines), dimmer; its lines' thickness set each frame from the distance (above), 0 = not
          drawn. Its edges lie on metre lines, and from any half or whole metre the 10 cm lines fall on the metre lines too. */}
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

/** The saved chain, read through `parseChain`. ⛔ One that cannot be read is KEPT ASIDE (`…-refused`), never overwritten
 *  unread, and the reason is shown. */
function loadChain(): { chain: Chain; refusal: string | null } {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(CHAIN_KEY);
    if (!raw) return { chain: emptyChain(), refusal: null };
    const r = parseChain(JSON.parse(raw));
    if ("chain" in r) return { chain: r.chain, refusal: null };
    throw new Error(r.refusal);
  } catch (e) {
    try {
      if (raw) window.localStorage.setItem(`${CHAIN_KEY}-refused`, raw);
    } catch {}
    return { chain: emptyChain(), refusal: `The saved recording could not be read (${(e as Error).message}); it is kept aside, unread.` };
  }
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
  const [chain, setChain] = useState<Chain>(initial.chain);
  const [selection, setSelection] = useState<string[]>([]);
  const [view, setView] = useState<View | null>(null);
  const [saveError, setSaveError] = useState<string | null>(initial.refusal);
  const [failed, setFailed] = useState<string | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [grid, setGrid] = useState(true);
  const [drawer, setDrawer] = useState<"help" | "info" | null>(null);
  const [world, setWorld] = useState<ArchWorld | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const why = failed ?? failure;

  /** ⛔ THE ONE PLACE A CHANGED CHAIN ENTERS REACT AND STORAGE — called by the store at a stop or a delete. A failed write is
   *  SHOWN (never `catch {}`) until the next good one. */
  const commit = useCallback((c: Chain) => {
    setChain(c);
    setSelection((sel) => sel.filter((id) => c.clips.some((k) => k.id === id)));
    try {
      window.localStorage.setItem(CHAIN_KEY, JSON.stringify(c));
      setSaveError(null);
    } catch (e) {
      const full = (e as Error).name === "QuotaExceededError";
      setSaveError(full ? "Not saved: the browser's storage is full. The recording is safe until this page is closed." : `Not saved: ${(e as Error).message}`);
    }
  }, []);
  useEffect(() => {
    store.bind({ commit });
    return () => store.bind(null);
  }, [store, commit]);

  // click selects one (click it again to clear); shift / ctrl / cmd adds or removes
  const select = (id: string, additive: boolean) => {
    const next = additive ? (selection.includes(id) ? selection.filter((s) => s !== id) : [...selection, id]) : selection.length === 1 && selection[0] === id ? [] : [id];
    setSelection(next);
    store.setSelection(next);
  };

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
      if (e.code === "Space") store.pressA();
      else if (e.code === "Backspace" || e.code === "Delete") store.deleteSelected();
      else if (e.code === "KeyP") store.togglePlay();
      else if (e.code === "Home") store.toStart();
      else if (e.code === "End") store.toEnd();
      else if (e.code === "KeyH") store.home();
      else if (e.code === "Comma") store.step(-1);
      else if (e.code === "Period") store.step(1);
    };
    const up = (e: KeyboardEvent) => store.keyUp(e.code);
    const blur = () => store.keysClear();
    // ⛔ THE ONE THING OUTSIDE THE FRAME CALLBACK: a hidden tab draws no frames, so it is heard here (note decision 4)
    const hidden = () => {
      if (document.hidden) store.stopRecording("Stopped: the tab was hidden");
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
  }, [store]);

  // ⛔ THE NO-WEBGL NET — heard in the CAPTURE phase (it does not bubble)
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fail = () => setFailed("a WebGL context could not be created");
    el.addEventListener("webglcontextcreationerror", fail, { capture: true, once: true });
    return () => el.removeEventListener("webglcontextcreationerror", fail, { capture: true });
  }, []);

  const recording = view?.mode === "rec";
  const units = view?.units;
  const metresPerD = units ? (units.d * CM_PER_PX) / 100 : 0;
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
    duration: chainDuration(chain),
    recLength: 0,
    armed: { overwrite: false, newCam: false },
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
                  {shown && <BenchScene built={shown} store={store} grid={grid} onView={setView} onWorld={setWorld} onReady={() => setDrawn(true)} />}
                </Suspense>
              </Canvas>
            </Guard>
          )}
        </div>

        {/* ⛔ THE OVERLAY LAYER — pointer-events: none ([A3]); only its controls take clicks, so a drag on bare picture looks */}
        <div className="pointer-events-none absolute inset-0" data-overlay>
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
                </>
              )}
            </div>
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
                    <dd>play / stop (the selected clips, else the chain)</dd>
                    <dt className="text-neutral-500">Y</dt>
                    <dd>to the start</dd>
                    <dt className="text-neutral-500">View</dt>
                    <dd>default view</dd>
                  </dl>
                  <h2 className="mb-2 mt-4 text-sm font-semibold text-white">How it records</h2>
                  <p>
                    Fly to frame the shot; nothing records until A. A again stops: that is a clip. At the end of the chain A adds the next clip. Inside it,
                    press Overwrite first, then A: the clip is cut there and the new recording follows; later clips stay. New camera makes the next clip a cut.
                  </p>
                  <h2 className="mb-2 mt-4 text-sm font-semibold text-white">Keyboard</h2>
                  <p>
                    W S forward / back · A D slide · E Q rise / sink · arrows turn / tilt · drag to look · [ ] lens · Shift fast · Alt slow · Space record · P play ·
                    Home start · End end · H default · , . step · Delete delete
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
                  <p>Recordings are saved in this browser when a clip stops or is deleted.</p>
                </>
              )}
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 flex">
            <BenchTransport
              v={transportView}
              saveError={saveError}
              act={{
                record: () => store.pressA(),
                play: () => store.togglePlay(),
                toStart: () => store.toStart(),
                toEnd: () => store.toEnd(),
                home: () => store.home(),
                newCam: () => store.toggleNewCam(),
                overwrite: () => store.toggleOverwrite(),
                remove: () => store.deleteSelected(),
              }}
            />
          </div>
        </div>
      </div>

      <BenchTimeline
        chain={chain}
        T={view?.T ?? chainDuration(chain)}
        rec={view?.rec ?? null}
        selection={selection}
        disabled={recording}
        metresPerD={metresPerD}
        toMetres={toMetres}
        onSelect={select}
        onScrub={(T) => store.scrub(T)}
      />
    </div>
  );
}
