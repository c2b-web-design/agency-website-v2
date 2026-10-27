/**
 * ⛔ THE CAMERA RECORDER's TIMELINE — PURE FUNCTIONS AND TYPES. T1a, CAMERA TRACKS (the plan
 * `live-work/plan-camera-tracks-t1a-27-october.md` v2, under the note `structural-note-camera-recorder-26-october.md` v3.1;
 * D-104). Carl: *"If we put the playhead where we want it, select another camera and record Cam 2 takes precedent over
 * Cam 1. Which means cuts can be made easier and Cam 1 is non destructive."* (R1, one lane end to end, is replaced.)
 *
 * - ⛔ NO RUNTIME IMPORTS (the Architect's [A9]): this file is run by Node 25 with its types stripped
 *   (`live-work/scripts/bench-chain-check-26-october.mjs`), which handles neither `@/` aliases nor extensionless imports.
 * - A SAMPLE is `[t, x, y, z, yaw, pitch, fov]`: `t` seconds from the clip's start (the CLAMPED clock the rig integrates);
 *   position in units of `d` from the subject's centre; turn, tilt, lens in degrees. ROLL is NOT sampled (the rig has none): a recording is level; only a SHAPE rolls (`Pose.roll`).
 * - A CLIP is PLACED IN TIME (v3-1): `start` on the shot's clock, `order` its recording order (the take precedence inside a
 *   track), `in` / `out` the span of its samples it shows (TRIM, T1b: T1a always writes 0 and the length, but EVERY rule
 *   here reads them, so T1b changes no rule). Nothing ripples: recording, deleting one clip never moves another.
 * - ⛔ ONE RULE DECIDES WHAT PLAYS (`sourceAt`, v3-2): the TOP track with a clip at T; inside a track the NEWEST take. Every
 *   reader (playback, scrub, joins, gaps, the status, the harness) goes through it; none keeps its own copy.
 * - ⛔ SPANS ARE HALF-OPEN, `[start, end)`, with `EDGE_S` ([C5]): inside `[boundary − EDGE_S, boundary)` the rule rounds to
 *   the LATER clip (R1 rounded to the earlier there; its only ambiguity in that band was 2e-15 s sums). Every "just before"
 *   uses the named offset `PROBE` (2·EDGE_S), never a bare "just" ([E1]).
 * - ⛔ R1's CHAINS ARE MIGRATED, NOT REFUSED (v3-3), and PROVEN BY NUMBER against R1's own arithmetic (`v1PoseAt`, `parityV1`).
 * - ⛔ ROOM FOR R2: `refined` and `comp` stay RESERVED (null); `parseChain` ACCEPTS optional fields it does not know ([A2]).
 *
 * ⛔ SHAPE CLIPS — `CHAIN_VERSION` 3 (the plan `live-work/plan-shape-clips-27-october.md` v2.1, under the note
 * `structural-note-shape-clips-27-october.md` v3.2; D-104). Carl: a computed move is *"stored as a shape and its numbers"*
 * (*"It always helps if we can adjust the numbers later"*).
 * - A CLIP CARRIES ONE SOURCE: recorded `samples`, OR a `shape` (its numbers). `sourceAt` never looks at the source;
 *   `clipPoseAt` asks it (`poseInSamples` / `poseInShape`). Nothing about a shape is stored twice: its length, laps and
 *   direction are DERIVED from its numbers.
 * - ⛔ THE CHAIN CARRIES ITS UNITS (`units`: the `d`, `up`, `zc` its positions are in), filled by the bench on the first
 *   measured frame — so no clip moves when the window's shape moves the live `d`. This file never converts: every position
 *   here is in the chain's units ("d-units"); centimetres are the bench's.
 * - v2 and v1 chains are READ and migrated to v3 (`migrations` keeps each step's verdict); only v3 is ever written.
 */

export const CHAIN_KIND = "c2b-camera-chain";
export const CHAIN_VERSION = 3;
/** samples per second, whatever the display's refresh (the Architect's second R1 review, point 2) */
export const SAMPLE_HZ = 60;
/** ⛔ THE ONE CLAMP — a frame longer than this counts as this long, for the rig AND the recording (a hitch costs ≤ 0.1 s) */
export const MAX_DT = 0.1;

export type Sample = [t: number, x: number, y: number, z: number, yaw: number, pitch: number, fov: number];
/** `roll` (degrees, about the line of sight; absent = 0): ⛔ only a SHAPE rolls — recorded samples stay seven numbers, level
 *  (the pad has no roll). `structural-note-barrel-roll-27-october.md`, Carl: *"Approved, build it"*. */
export type Pose = { x: number; y: number; z: number; yaw: number; pitch: number; fov: number; roll?: number };
/**
 * ⛔ A SHAPE — the corkscrew (`kind: "helix"`) round a vertical axis, as its numbers. Positions in d-units; angles about
 * the axis in UNWRAPPED radians (`theta1 − theta0` gives the laps AND the direction — no `dir` stored); the aim in degrees.
 * - The path: the radius and the height LINEAR in the angle, from (`r0`, `y0`) at `theta0` to (`r1`, `y1`) at `theta1`.
 * - The aim: LEVEL, at the axis, at the camera's own height — settling from (`yaw0`, `pitch0`) over `aimS` seconds.
 * - The pace: `pace` d-units/s along the path, reached from `v0` over `rampS` seconds (the speed smoothstepped).
 * - `fov`: held. All of it judged by Carl on take 2 of clip 2 (D-104).
 */
export type HelixShape = {
  kind: "helix";
  axisX: number;
  axisZ: number;
  theta0: number;
  theta1: number;
  r0: number;
  r1: number;
  y0: number;
  y1: number;
  fov: number;
  yaw0: number;
  pitch0: number;
  aimS: number;
  pace: number;
  v0: number;
  rampS: number;
};
/**
 * ⛔ THE GLIDE (`structural-note-glide-and-open-27-october.md`, Carl: *"Approved, build it"*) — a free path as its numbers.
 * - The path: a CENTRIPETAL Catmull–Rom spline through `points` (d-units; no cusps or self-loops between close points).
 * - The aim: at each waypoint the camera LOOKS AT that knot's `looks` point; between knots the look-at point travels on a
 *   uniform Catmull–Rom at the same knot parameter — "at waypoint 2, look at YOUR".
 * - The clock: `pace` reached from `v0` over `rampS` (the helix's eased start), held, then eased to REST over `landS`.
 * - The aim settles from (`yaw0`, `pitch0`) over `aimS`; `fov` held.
 */
export type GlideShape = {
  kind: "glide";
  points: [number, number, number][];
  looks: [number, number, number][];
  fov: number;
  yaw0: number;
  pitch0: number;
  aimS: number;
  pace: number;
  v0: number;
  rampS: number;
  landS: number;
};
/**
 * ⛔ THE BARREL — the Vader move (Carl: *"fly forward at 2x speed while doing 3 rotations then fly through the arch. it
 * essentially a corkscrew through the air"*; *"Both, a barrel roll"*). A straight FLIGHT LINE `from` → `to` (d-units);
 * round it a SPIRAL of `turns` laps whose radius swells 0 → `radius` → 0 over the first `spiralEnd` of the line (it leaves
 * and REJOINS the line), then straight on; the view ROLLS with the spiral — one full roll a lap, the canopy toward the
 * line — level again at the end. The aim: along the line. The clock: `pace` ALONG THE LINE ("2x speed" = the D-pad's
 * 2.8 m/s), eased start and landing as the glide's.
 */
export type BarrelShape = {
  kind: "barrel";
  from: [number, number, number];
  to: [number, number, number];
  turns: number;
  radius: number;
  /** where the spiral BEGINS, a fraction of the line (absent = 0: take 1). Take 2 (Carl: *"Fly forward first, then the
   *  barrel roll"*): straight to here, then the laps */
  spiralStart?: number;
  spiralEnd: number;
  /** the ROTATION's ease, a fraction (0 … 0.5) of the spiral at EACH end over which the turning speeds up from 0 and slows
   *  back to 0 (a raised-cosine ramp; constant between). Absent = 0: take 2's even rate. Take 3 (Carl: *"when starting
   *  and ending the rotation, ease in and out more so its a lot smoother"*) */
  rollEase?: number;
  fov: number;
  pace: number;
  v0: number;
  rampS: number;
  landS: number;
};
export type Shape = HelixShape | GlideShape | BarrelShape;
/** the rotation's progress 0 → 1 through the spiral (u 0 → 1): its rate a raised-cosine ramp over `e` at each end, even
 *  between, so it starts and stops at zero turning speed; e = 0 is u itself. The middle turns 1 / (1 − e) × the average */
function easedTurn(u: number, e: number): number {
  if (e <= 0) return u;
  const A = (x: number) => (x < e ? x / 2 - (e / (2 * Math.PI)) * Math.sin((Math.PI * x) / e) : e / 2 + (x - e));
  const total = 1 - e;
  if (u <= 0.5) return A(u) / total;
  return 1 - A(1 - u) / total;
}
type ClipSpan = { id: string; cam: number; start: number; order: number; in: number; out: number };
/** `cam` 1, 2, 3 … — "Cam 2", never "Camera B" (B is a button). ONE source: `samples` or `shape`. */
export type Clip = ClipSpan & ({ samples: Sample[]; shape?: undefined } | { shape: Shape; samples?: undefined });
/** the conversion the chain's positions are in: world = (x·d, up + y·d, zc + z·d), layout px (1 px = 1 cm) */
export type Units = { d: number; up: number; zc: number };
/** `tracks`: the cameras, BOTTOM → TOP (Cam 1 first; a track exists before it has a clip, so it can be armed).
 *  `migrations`: each carry-over's verdict, oldest first. `from: 1` — R1's parity verdict, KEPT so a "differences" line
 *  survives a reload until Carl decides ([E2]); `maxDiff` null = a moment one rule could pose and the other could not.
 *  `from: 2` — the v2 → v3 step (the clips carried; ⚠ their units are the first measured frame's after it: the `d` each
 *  v2 clip was recorded under cannot be recovered — harmless if it never moved, which is unasserted). */
export type Migration = { from: 1; moments: number; maxDiff: number | null; ok: boolean } | { from: 2; clips: number };
export type Chain = {
  kind: typeof CHAIN_KIND;
  version: typeof CHAIN_VERSION;
  tracks: number[];
  clips: Clip[];
  /** null until the bench's first measured frame (a new or a migrated chain) */
  units: Units | null;
  refined: null;
  comp: null;
  migrations: Migration[];
};

/** time closer than this to a clip's edge counts as the edge (a microsecond; samples are 16.7 ms apart) */
export const EDGE_S = 1e-6;
/** ⛔ [E1] the named offset for "just before" an edge: outside the ±EDGE_S band, where every rule agrees */
export const PROBE = 2 * EDGE_S;

export const clampDt = (raw: number) => Math.min(Math.max(raw, 0), MAX_DT);
export const emptyChain = (): Chain => ({ kind: CHAIN_KIND, version: CHAIN_VERSION, tracks: [1], clips: [], units: null, refined: null, comp: null, migrations: [] });
const withClips = (chain: Chain, clips: Clip[]): Chain => ({ ...chain, clips });
export const newClipId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const samplePose = (s: Sample): Pose => ({ x: s[1], y: s[2], z: s[3], yaw: s[4], pitch: s[5], fov: s[6] });
const toSample = (t: number, p: Pose): Sample => [t, p.x, p.y, p.z, p.yaw, p.pitch, p.fov];

/** the samples' own length (their last time) */
export const sampleLength = (s: Sample[]) => (s.length ? s[s.length - 1][0] : 0);
/** the length of a clip's SOURCE (all of its samples, or its shape's own run) — the most it can show */
export const sourceLength = (c: Clip) => (c.shape ? shapeLength(c.shape) : sampleLength(c.samples));
/** the length a clip SHOWS (its trimmed span) */
export const clipLength = (c: Clip) => c.out - c.in;
export const clipEnd = (c: Clip) => c.start + clipLength(c);
/** the end of the shot: the latest clip end on any track */
export const chainEnd = (chain: Chain) => chain.clips.reduce((m, c) => Math.max(m, clipEnd(c)), 0);
/** ⛔ HALF-OPEN with EDGE_S ([C5]): a clip covers T in `[start − EDGE_S, end − EDGE_S)` */
export const covers = (c: Clip, T: number) => c.start - EDGE_S <= T && T < clipEnd(c) - EDGE_S;

/** A pose within a run of samples — linear between samples (60 a second: a straight line is finer than the eye). */
export function poseInSamples(s: Sample[], local: number): Pose {
  if (s.length === 1 || local <= s[0][0]) return samplePose(s[0]);
  const last = s[s.length - 1];
  if (local >= last[0]) return samplePose(last);
  let lo = 0, hi = s.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (s[mid][0] <= local) lo = mid;
    else hi = mid;
  }
  const a = s[lo], b = s[hi];
  const k = b[0] > a[0] ? (local - a[0]) / (b[0] - a[0]) : 1;
  const mix = (i: number) => a[i] + (b[i] - a[i]) * k;
  return { x: mix(1), y: mix(2), z: mix(3), yaw: mix(4), pitch: mix(5), fov: mix(6) };
}
/** A clip's pose at SHOT time T — clamped to its trimmed span (so its edge poses hold at its edges), then asked of its
 *  SOURCE. Also the SOLO pose: a selection plays this, precedence ignored (Carl: "The clip solo"). */
export function clipPoseAt(c: Clip, T: number): Pose {
  const local = Math.min(c.out, Math.max(c.in, c.in + (T - c.start)));
  return c.shape ? poseInShape(c.shape, local) : poseInSamples(c.samples, local);
}

// ── THE SHAPE's MATHS — the corkscrew, no table ─────────────────────────────────────────────────────────────────────────

/** below this radius change (d-units; ≈ 0.001 cm at d = 2287 cm) the constant-radius branch is taken: the closed form's
 *  divided difference cancels badly as the radius change goes to 0 (the note's review) */
const FLAT_R = 4e-7;
const deg = (r: number) => (r * 180) / Math.PI;
const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};
/** x mod 2π in [0, 2π) — JS `%` keeps the sign of x */
const mod2pi = (x: number) => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

/**
 * ⛔ THE PATH's LENGTH IN CLOSED FORM, inverted by Newton (note v3 §3). φ = the angle travelled, 0 … |θ1 − θ0|;
 * r = r0 + kφ, y = y0 + hφ, so ds/dφ = √(r² + k² + h²) and, with c² = k² + h², s(φ) = [F(r0 + kφ) − F(r0)] / k,
 * F(u) = ½(u√(u² + c²) + c² ln(u + √(u² + c²))); a (near-)constant radius: s = φ√((r0 + kφ/2)² + c²). MEASURED against the snippet's
 * 20,000-step chord table: the length agrees to 0.0013 mm (the table's shortfall, ≈ L·Δφ²/24).
 */
function helixPath(s: HelixShape) {
  const span = Math.abs(s.theta1 - s.theta0);
  const dir = Math.sign(s.theta1 - s.theta0);
  const k = (s.r1 - s.r0) / span, h = (s.y1 - s.y0) / span, c2 = k * k + h * h;
  const flat = Math.abs(s.r1 - s.r0) < FLAT_R;
  const F = (u: number) => {
    const q = Math.sqrt(u * u + c2);
    return (u * q + c2 * Math.log(u + q)) / 2;
  };
  const F0 = F(s.r0);
  // ⛔ the near-constant branch at the MEAN radius (r0 + kφ/2), not r0: at r0 it ignored a radius change below the
  // threshold, an error that grows with the angle (≈ φ·Δr/2 — 0.06 mm over two laps at 4e-7; caught red by the harness)
  const arc = (phi: number) => (flat ? phi * Math.sqrt((s.r0 + (k * phi) / 2) ** 2 + c2) : (F(s.r0 + k * phi) - F0) / k);
  const rate = (phi: number) => Math.sqrt((s.r0 + k * phi) ** 2 + c2);
  const L = arc(span);
  /** the angle travelled at path distance `d` — Newton from the mean-radius guess (it converges in a handful) */
  const phiAt = (d: number) => {
    if (d <= 0) return 0;
    if (d >= L) return span;
    let phi = d / rate(span / 2);
    for (let i = 0; i < 12; i++) {
      const step = (arc(phi) - d) / rate(phi);
      phi = Math.min(span, Math.max(0, phi - step));
      if (Math.abs(step) < 1e-15) break;
    }
    return phi;
  };
  return { span, dir, k, h, L, phiAt };
}

/** ⛔ THE SHAPE's OWN CLOCK — take 2's eased start (Carl: *"It moves off too fast"* → *"it is smoother"*): the speed from
 *  `v0` to `pace` over `rampS` (smoothstepped), then even; s = v0·t + (pace − v0)·rampS·(u³ − u⁴/2), u = t / rampS. A helix
 *  SHORTER than its ramp reaches its end before `rampS` and holds there until `rampS` (the snippet's own behaviour, kept).
 *  ⛔ THE GLIDE's LANDING (`landS` > 0): the speed eased from `pace` to REST over the last `landS` (smoothstepped, the
 *  start's mirror): s = (L − pace·landS/2) + pace·landS·(w − w³ + w⁴/2), w through the landing. With `landS` 0 the clock
 *  is the helix's exactly. A glide too short for both eases at its pace is REFUSED (`shapeRefusal`), never squeezed. */
function shapeClock(s: { pace: number; v0: number; rampS: number; landS?: number }, L: number) {
  const land = s.landS ?? 0;
  const sRamp = s.v0 * s.rampS + (s.pace - s.v0) * s.rampS * 0.5;
  const sLand = s.pace * land * 0.5;
  const T = L <= sRamp + sLand ? s.rampS + land : s.rampS + (L - sRamp - sLand) / s.pace + land;
  const distAt = (t: number) => {
    if (land > 0 && t > T - land) {
      const w = Math.min(1, (t - (T - land)) / land);
      return Math.min(L, L - sLand + s.pace * land * (w - w * w * w + (w * w * w * w) / 2));
    }
    if (t >= s.rampS) return Math.min(L, sRamp + s.pace * (t - s.rampS));
    const u = t / s.rampS;
    return Math.min(L, s.v0 * t + (s.pace - s.v0) * s.rampS * (u * u * u - (u * u * u * u) / 2));
  };
  return { T, distAt, fits: L >= sRamp + sLand };
}

// ── THE GLIDE's MATHS — a centripetal Catmull–Rom path, its length by Gauss–Legendre, no table ──────────────────────────

type V3 = [number, number, number];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len3 = (a: V3) => Math.hypot(a[0], a[1], a[2]);
/** the end knots' neighbours, mirrored (P₋₁ = 2P₀ − P₁): the spline starts and ends ON its first and last points */
const padded = (p: V3[]): V3[] => [sub([2 * p[0][0], 2 * p[0][1], 2 * p[0][2]], p[1]), ...p, sub([2 * p.at(-1)![0], 2 * p.at(-1)![1], 2 * p.at(-1)![2]], p.at(-2)!)];
/** CENTRIPETAL Catmull–Rom (α = ½, Barry–Goldman) on the segment P1 → P2 at t ∈ [0, 1] */
function centripetal(p0: V3, p1: V3, p2: V3, p3: V3, t: number): V3 {
  const t1 = Math.sqrt(len3(sub(p1, p0))), t2 = t1 + Math.sqrt(len3(sub(p2, p1))), t3 = t2 + Math.sqrt(len3(sub(p3, p2)));
  const u = t1 + (t2 - t1) * t;
  const lerp = (a: V3, b: V3, ta: number, tb: number): V3 => {
    const k = tb === ta ? 0 : (u - ta) / (tb - ta);
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  };
  const a1 = lerp(p0, p1, 0, t1), a2 = lerp(p1, p2, t1, t2), a3 = lerp(p2, p3, t2, t3);
  const b1 = lerp(a1, a2, 0, t2), b2 = lerp(a2, a3, t1, t3);
  return lerp(b1, b2, t1, t2);
}
/** UNIFORM Catmull–Rom for the look-at points (two knots may look at the same point, which the centripetal form cannot) */
function uniform(p0: V3, p1: V3, p2: V3, p3: V3, t: number): V3 {
  const t2 = t * t, t3 = t2 * t;
  const f = (i: 0 | 1 | 2) => 0.5 * (2 * p1[i] + (p2[i] - p0[i]) * t + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 + (3 * p1[i] - p0[i] - 3 * p2[i] + p3[i]) * t3);
  return [f(0), f(1), f(2)];
}
/** 8-point Gauss–Legendre on [0, 1], applied over 8 sub-intervals of each span */
const GL_X = [-0.9602898564975363, -0.7966664774136267, -0.525532409916329, -0.1834346424956498, 0.1834346424956498, 0.525532409916329, 0.7966664774136267, 0.9602898564975363];
const GL_W = [0.1012285362903763, 0.2223810344533745, 0.3137066458778873, 0.362683783378362, 0.362683783378362, 0.3137066458778873, 0.2223810344533745, 0.1012285362903763];
/**
 * ⛔ THE GLIDE's PATH — its segment lengths by Gauss–Legendre quadrature of |dP/dt| (the speed by a central difference),
 * a distance inverted to (segment, t) by Newton. ⚠ MEMOIZED per shape object (a WeakMap): a shape is never mutated (every
 * edit makes a new one), so the memo cannot go stale — a convenience of a pure function, not a second copy of the data.
 */
const glideMemo = new WeakMap<GlideShape, ReturnType<typeof buildGlide>>();
function buildGlide(s: GlideShape) {
  const P = padded(s.points), A = padded(s.looks);
  const n = s.points.length - 1;
  const at = (i: number, t: number) => centripetal(P[i], P[i + 1], P[i + 2], P[i + 3], t);
  const speed = (i: number, t: number) => {
    const h = 1e-6, a = at(i, Math.max(0, t - h)), b = at(i, Math.min(1, t + h));
    return len3(sub(b, a)) / (Math.min(1, t + h) - Math.max(0, t - h));
  };
  const lengthTo = (i: number, t: number) => {
    let total = 0;
    for (let k = 0; k < 8; k++) {
      const a = (t * k) / 8, b = (t * (k + 1)) / 8;
      for (let g = 0; g < 8; g++) total += ((b - a) / 2) * GL_W[g] * speed(i, (a + b) / 2 + ((b - a) / 2) * GL_X[g]);
    }
    return total;
  };
  const seg = Array.from({ length: n }, (_, i) => lengthTo(i, 1));
  const starts = seg.reduce<number[]>((acc, l) => [...acc, acc.at(-1)! + l], [0]);
  const L = starts[n];
  /** distance along the path → the knot parameter (segment, t) */
  const knotAt = (d: number): { i: number; t: number } => {
    if (d <= 0) return { i: 0, t: 0 };
    if (d >= L) return { i: n - 1, t: 1 };
    let i = 0;
    while (i < n - 1 && starts[i + 1] <= d) i++;
    const r = d - starts[i];
    let t = r / seg[i];
    for (let k = 0; k < 12; k++) {
      const step = (lengthTo(i, t) - r) / speed(i, t);
      t = Math.min(1, Math.max(0, t - step));
      if (Math.abs(step) < 1e-13) break;
    }
    return { i, t };
  };
  return { L, knotAt, at, look: (i: number, t: number) => uniform(A[i], A[i + 1], A[i + 2], A[i + 3], t) };
}
const glideOf = (s: GlideShape) => {
  let g = glideMemo.get(s);
  if (!g) glideMemo.set(s, (g = buildGlide(s)));
  return g;
};
/** the aim from a camera position to a look-at point: three's YXZ (yaw 0 looks along −z; pitch up positive), degrees */
const aimAt = (from: V3, to: V3) => {
  const [dx, dy, dz] = sub(to, from);
  return { yaw: deg(Math.atan2(-dx, -dz)), pitch: deg(Math.atan2(dy, Math.hypot(dx, dz))) };
};
/** ⛔ A GLIDE's POSE at its own time: the path at the clock's distance; the aim AT the travelling look-at point, wrapped
 *  beside `yaw0` (⚠ so a glide whose aim turns more than half a turn from its start would read the short way — refused by
 *  `shapeRefusal`), settling from `yaw0` / `pitch0` over `aimS` */
function poseInGlide(s: GlideShape, local: number): Pose {
  const g = glideOf(s);
  const clock = shapeClock(s, g.L);
  const t = Math.min(clock.T, Math.max(0, local));
  const k = g.knotAt(clock.distAt(t));
  const p = g.at(k.i, k.t);
  const a = aimAt(p, g.look(k.i, k.t));
  const w = s.aimS > 0 ? smooth(t / s.aimS) : 1;
  const yaw = s.yaw0 + wrapDeg(a.yaw - s.yaw0);
  return { x: p[0], y: p[1], z: p[2], yaw: s.yaw0 + (yaw - s.yaw0) * w, pitch: s.pitch0 + (a.pitch - s.pitch0) * w, fov: s.fov };
}

/** a shape's own length in seconds (derived, never stored) */
export function shapeLength(s: Shape): number {
  if (s.kind === "barrel") return shapeClock(s, len3(sub(s.to, s.from))).T;
  return s.kind === "glide" ? shapeClock(s, glideOf(s).L).T : shapeClock(s, helixPath(s).L).T;
}

/** a SHAPE's POSE at its own time `local` (0 … its length), by its kind */
export function poseInShape(s: Shape, local: number): Pose {
  if (s.kind === "barrel") return poseInBarrel(s, local);
  return s.kind === "glide" ? poseInGlide(s, local) : poseInHelix(s, local);
}

/** ⛔ A BARREL's POSE — closed form, no inversion: the clock gives the distance ALONG THE LINE; the spiral's angle and radius
 *  follow from it; the offset turns in the line's own right / up frame and the view rolls with it, so the camera's up
 *  points back at the line (three's YXZ roll: up' = cos φ·up − sin φ·right ⇔ roll = φ) */
function poseInBarrel(s: BarrelShape, local: number): Pose {
  const D = sub(s.to, s.from);
  const L = len3(D);
  const dir: V3 = [D[0] / L, D[1] / L, D[2] / L];
  const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const r0 = cross(dir, [0, 1, 0]);
  const right: V3 = len3(r0) > 1e-9 ? [r0[0] / len3(r0), r0[1] / len3(r0), r0[2] / len3(r0)] : [1, 0, 0];
  const up = cross(right, dir);
  const clock = shapeClock(s, L);
  const d = clock.distAt(Math.min(clock.T, Math.max(0, local)));
  const sEnd = s.spiralEnd * L, s0 = (s.spiralStart ?? 0) * L;
  // straight to the spiral's start (u 0: on the line, level), the laps between, straight on after (u 1)
  const u = sEnd > s0 ? Math.min(1, Math.max(0, (d - s0) / (sEnd - s0))) : 1;
  const phi = 2 * Math.PI * s.turns * easedTurn(u, s.rollEase ?? 0);
  // ⛔ TAKE 4 (Carl: *"theres a little jolt at the star and finish of the roll"*): the radius swells as sin⁴ — it LEAVES and
  // REJOINS the line FLAT. As sin (takes 1–3) its slope at the ends was π·radius per spiral length, so the camera's sideways
  // speed jumped 0 → ~95 cm/s in a frame at 2.8 m/s (measured) — the jolt; sin² still left an ACCELERATION step at the ends
  // (measured: the sideways speed falling ~2.5 cm/s a frame to 0, then stopping); sin⁴ starts and ends with zero speed AND
  // zero acceleration. Peak radius unchanged
  const r = u < 1 ? s.radius * Math.sin(Math.PI * u) ** 4 : 0;
  // the offset: from below the line (−up) round toward the right — the canopy (the camera's up) toward the line
  const off = (k: 0 | 1 | 2) => r * (-Math.cos(phi) * up[k] + Math.sin(phi) * right[k]);
  const at = (k: 0 | 1 | 2) => s.from[k] + dir[k] * d + off(k);
  return { x: at(0), y: at(1), z: at(2), yaw: deg(Math.atan2(-dir[0], -dir[2])), pitch: deg(Math.asin(Math.max(-1, Math.min(1, dir[1])))), fov: s.fov, roll: deg(phi) };
}

/** ⛔ A HELIX's POSE at its own time `local`: the path at the clock's distance, the aim LEVEL at the axis (yaw = 90° − the
 *  angle round the axis, unwrapped beside `yaw0`), settling from `yaw0` / `pitch0` over `aimS` */
function poseInHelix(s: HelixShape, local: number): Pose {
  const path = helixPath(s);
  const clock = shapeClock(s, path.L);
  const t = Math.min(clock.T, Math.max(0, local));
  const phi = path.phiAt(clock.distAt(t));
  const b = s.theta0 + path.dir * phi;
  const r = s.r0 + path.k * phi;
  const shift = Math.round((s.yaw0 - (90 - deg(s.theta0))) / 360) * 360;
  const aim = 90 - deg(b) + shift;
  const w = s.aimS > 0 ? smooth(t / s.aimS) : 1;
  return {
    x: s.axisX + r * Math.cos(b),
    y: s.y0 + path.h * phi,
    z: s.axisZ + r * Math.sin(b),
    yaw: s.yaw0 + (aim - s.yaw0) * w,
    pitch: s.pitch0 * (1 - w),
    fov: s.fov,
  };
}

/** ⛔ THE ONE RULE (v3-2): the top track with a clip covering T; inside it the highest `order`. Null = a gap. */
export function sourceAt(chain: Chain, T: number): Clip | null {
  for (let t = chain.tracks.length - 1; t >= 0; t--) {
    const cam = chain.tracks[t];
    let best: Clip | null = null;
    for (const c of chain.clips) if (c.cam === cam && covers(c, T) && (!best || c.order > best.order)) best = c;
    if (best) return best;
  }
  return null;
}

/**
 * The picture at T: what `sourceAt` plays, else ⛔ THE GAP HOLD (Carl: *"Hold the last picture"*; [C6]): the last picture
 * BEFORE T (the clip playing just before the latest clip end at or before T, at that end); none before → the FIRST picture
 * after T. Null only for an empty chain.
 */
export function poseAtT(chain: Chain, T: number): { pose: Pose; clip: Clip | null; gap: boolean } | null {
  const c = sourceAt(chain, T);
  if (c) return { pose: clipPoseAt(c, T), clip: c, gap: false };
  if (!chain.clips.length) return null;
  let before = -Infinity;
  for (const k of chain.clips) {
    const e = clipEnd(k);
    if (e <= T + EDGE_S && e > before) before = e;
  }
  if (before > -Infinity) {
    const h = sourceAt(chain, before - PROBE);
    if (h) return { pose: clipPoseAt(h, before), clip: null, gap: true };
  }
  let after = Infinity;
  for (const k of chain.clips) if (k.start >= T - EDGE_S && k.start < after) after = k.start;
  const h = after < Infinity ? sourceAt(chain, after) : null;
  return h ? { pose: clipPoseAt(h, after), clip: null, gap: true } : null;
}

/** every clip start and end, sorted, deduplicated within EDGE_S — the shot's edit points */
export function editPoints(chain: Chain): number[] {
  const all = chain.clips.flatMap((c) => [c.start, clipEnd(c)]).sort((a, b) => a - b);
  const out: number[] = [];
  for (const t of all) if (!out.length || t - out[out.length - 1] > EDGE_S) out.push(t);
  return out;
}

/** ⛔ A JOIN is any edit point where what PLAYS changes ([C2]): a CUT between cameras; else a MISMATCH — how far the
 *  incoming clip starts from where the outgoing one IS at that moment (mid-move when it is covered, not its end), in metres
 *  (given `metresPerD`) and degrees. Zero = continuous. ⛔ A GAP EDGE IS NOT A JOIN: the gap is shown on its own. */
export type Join = { t: number; kind: "cut"; fromCam: number; toCam: number } | { t: number; kind: "mismatch"; metres: number; degrees: number };
/** an angle difference in (−180°, 180°] — ((Δ + 540) mod 360) − 180, with JS `%`'s sign handled */
export const wrapDeg = (d: number) => ((((d + 540) % 360) + 360) % 360) - 180;
export function joinsOf(chain: Chain, metresPerD: number): Join[] {
  const out: Join[] = [];
  for (const p of editPoints(chain)) {
    const a = sourceAt(chain, p - PROBE), b = sourceAt(chain, p);
    if (!a || !b || a.id === b.id) continue;
    if (a.cam !== b.cam) {
      out.push({ t: p, kind: "cut", fromCam: a.cam, toCam: b.cam });
      continue;
    }
    const e = clipPoseAt(a, p), s = clipPoseAt(b, p);
    out.push({
      t: p,
      kind: "mismatch",
      metres: Math.hypot(s.x - e.x, s.y - e.y, s.z - e.z) * metresPerD,
      // ⛔ WRAPPED, per axis: the rig's yaw is unwrapped (a long turn runs past 360°) and a corkscrew turns ~810°, so a
      // raw difference would read whole turns as a mismatch
      degrees: Math.hypot(wrapDeg(s.yaw - e.yaw), wrapDeg(s.pitch - e.pitch), wrapDeg((s.roll ?? 0) - (e.roll ?? 0))),
    });
  }
  return out;
}

/** the `[a, b)` spans where NO clip plays, from 0 to the shot's end */
export function gapsOf(chain: Chain): [number, number][] {
  if (!chain.clips.length) return [];
  const pts = [0, ...editPoints(chain)].filter((t, i, all) => i === 0 || t - all[i - 1] > EDGE_S);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    if (sourceAt(chain, (pts[i] + pts[i + 1]) / 2)) continue;
    const last = out[out.length - 1];
    if (last && Math.abs(last[1] - pts[i]) <= EDGE_S) last[1] = pts[i + 1];
    else out.push([pts[i], pts[i + 1]]);
  }
  return out;
}

/** ⛔ [E4] every take covering T — top track first, newest first (the first is what PLAYS) — so a take wholly covered by a
 *  newer one can be reached without deleting anything */
export function takesAt(chain: Chain, T: number): Clip[] {
  const rank = (c: Clip) => chain.tracks.indexOf(c.cam);
  return chain.clips.filter((c) => covers(c, T)).sort((a, b) => rank(b) - rank(a) || b.order - a.order);
}

/** T1a's clip NUMBERS: 1, 2, 3 by start time across every track (then take order) — R1's sequential rule (Carl: *"the
 *  numbering system should be sequential"*); per-track numbers are T1b */
export function numberClips(chain: Chain): Map<string, number> {
  const sorted = [...chain.clips].sort((a, b) => a.start - b.start || a.order - b.order);
  return new Map(sorted.map((c, i) => [c.id, i + 1]));
}

/** a new camera track ON TOP (Resolve's order) */
export const addTrack = (chain: Chain): Chain => ({ ...chain, tracks: [...chain.tracks, Math.max(0, ...chain.tracks) + 1] });

/**
 * ⛔ A RECORDING LANDS on `cam`'s track at T, as the NEWEST take there (`order` above every clip's), shown whole (`in` 0,
 * `out` its length). Over or INTO an older clip it is a new take ON TOP; the older is kept (Carl: *"Cover it, as a new take"*).
 * `start ≥ 0` ([C9]). ⛔ Never an empty clip: the caller records nothing for a stop within EDGE_S of the start.
 */
export function recordClip(chain: Chain, cam: number, T: number, samples: Sample[], id = newClipId()): Chain {
  const clip: Clip = { id, cam, start: Math.max(0, T), order: chain.clips.reduce((m, c) => Math.max(m, c.order), -1) + 1, in: 0, out: sampleLength(samples), samples };
  const tracks = chain.tracks.includes(cam) ? chain.tracks : [...chain.tracks, cam];
  return { ...chain, tracks, clips: [...chain.clips, clip] };
}

export const deleteClips = (chain: Chain, ids: ReadonlySet<string>): Chain => withClips(chain, chain.clips.filter((c) => !ids.has(c.id)));

// ── SHAPE CLIPS — placed, edited, captured ──────────────────────────────────────────────────────────────────────────────

/** ⛔ A SHAPE LANDS as a recording does (`recordClip`'s rules): on `cam`'s track at T, the NEWEST take, shown whole */
export function placeShape(chain: Chain, cam: number, T: number, shape: Shape, id = newClipId()): Chain {
  const clip: Clip = { id, cam, start: Math.max(0, T), order: chain.clips.reduce((m, c) => Math.max(m, c.order), -1) + 1, in: 0, out: shapeLength(shape), shape };
  const tracks = chain.tracks.includes(cam) ? chain.tracks : [...chain.tracks, cam];
  return { ...chain, tracks, clips: [...chain.clips, clip] };
}
/** ⛔ AN EDITED SHAPE keeps its id, start and take order; `out` is RE-DERIVED (nothing ripples: longer covers what follows
 *  on its track as the newer take, shorter leaves a gap — T1a's rules); `in` kept while it leaves a span */
export function replaceShape(chain: Chain, id: string, shape: Shape): Chain {
  return withClips(
    chain,
    chain.clips.map((c) => {
      if (c.id !== id || !c.shape) return c;
      const out = shapeLength(shape);
      return { ...c, shape, out, in: c.in < out - EDGE_S ? c.in : 0 };
    }),
  );
}

/**
 * ⛔ THE START SPEED `v0`, measured AT THE PLAYHEAD T (the plan v2.1): what PLAYS at T − PROBE (any track; 0 in a gap) —
 * the straight-line speed from its pose at the first sample at or after the clip-local time (T − 0.25 s) (a shape: its
 * pose at T − 0.25 s) to its pose at T, capped at `pace`. At a clip's end this IS the snippet's rule. ⛔ ONLY WHEN THE
 * CAPTURED START IS WHERE THAT CLIP IS (within 1 mm and 0.01°, angles wrapped): a start Carl re-framed after parking
 * continues no move, so `v0` is 0 — and `why` says so. `cmPerUnit` = the chain's `d` (for the 1 mm test).
 */
export function startSpeed(chain: Chain, T: number, at: Pose, pace: number, cmPerUnit: number): { v0: number; why: string | null } {
  const c = sourceAt(chain, T - PROBE);
  if (!c) return { v0: 0, why: "in a gap: it starts from rest" };
  const p = clipPoseAt(c, T);
  const off = Math.hypot(at.x - p.x, at.y - p.y, at.z - p.z) * cmPerUnit * 10;
  if (off > 1 || Math.abs(wrapDeg(at.yaw - p.yaw)) > 0.01 || Math.abs(wrapDeg(at.pitch - p.pitch)) > 0.01) {
    return { v0: 0, why: "the camera is not where the clip before it is: it starts from rest" };
  }
  const lT = Math.min(c.out, Math.max(c.in, c.in + (T - c.start)));
  let a: Pose | null = null, ta = lT;
  if (c.shape) {
    ta = Math.max(c.in, lT - 0.25);
    a = poseInShape(c.shape, ta);
  } else {
    const s = c.samples.find((x) => x[0] >= lT - 0.25 && x[0] <= lT);
    if (s) [a, ta] = [samplePose(s), s[0]];
  }
  if (!a || lT <= ta) return { v0: 0, why: null };
  return { v0: Math.min(pace, Math.hypot(p.x - a.x, p.y - a.y, p.z - a.z) / (lT - ta)), why: null };
}

/** ⛔ A CORKSCREW FROM TWO CAPTURED POSES (note v3.2 §3): `theta0` the start's raw angle about the axis; `theta1` UNWRAPPED
 *  from it by the laps and direction Carl states at "End here" (`dir` +1 = left first: the angle grows); the start's aim
 *  and lens; the end's radius and height. The rest are numbers. */
export function helixFrom(o: {
  start: Pose;
  end: Pose;
  axisX: number;
  axisZ: number;
  laps: number;
  dir: 1 | -1;
  v0: number;
  pace: number;
  rampS: number;
  aimS: number;
}): HelixShape {
  const theta0 = Math.atan2(o.start.z - o.axisZ, o.start.x - o.axisX);
  const b1 = Math.atan2(o.end.z - o.axisZ, o.end.x - o.axisX);
  return {
    kind: "helix",
    axisX: o.axisX,
    axisZ: o.axisZ,
    theta0,
    theta1: theta0 + o.dir * (o.laps * 2 * Math.PI + mod2pi(o.dir * (b1 - theta0))),
    r0: Math.hypot(o.start.x - o.axisX, o.start.z - o.axisZ),
    r1: Math.hypot(o.end.x - o.axisX, o.end.z - o.axisZ),
    y0: o.start.y,
    y1: o.end.y,
    fov: o.start.fov,
    yaw0: o.start.yaw,
    pitch0: o.start.pitch,
    aimS: o.aimS,
    pace: o.pace,
    v0: o.v0,
    rampS: o.rampS,
  };
}

/** ⛔ "START HERE" AGAIN on a placed shape: the new start's angle UNWRAPPED BESIDE THE OLD `theta0` (a raw `atan2` jumps at
 *  ±180° and would gain or lose a whole lap); its radius, height, aim, lens and `v0` taken; the END KEPT where Carl put it */
export function recaptureStart(s: Shape, start: Pose, v0: number): Shape {
  // a GLIDE: its first waypoint moves to the camera; its look-at points, the rest of its path and its numbers kept
  if (s.kind === "glide") return { ...s, points: [[start.x, start.y, start.z], ...s.points.slice(1)], fov: start.fov, yaw0: start.yaw, pitch0: start.pitch, v0 };
  // a BARREL: its line starts at the camera; its end, spiral and numbers kept
  if (s.kind === "barrel") return { ...s, from: [start.x, start.y, start.z], fov: start.fov, v0 };
  const raw = Math.atan2(start.z - s.axisZ, start.x - s.axisX);
  const theta0 = raw + 2 * Math.PI * Math.round((s.theta0 - raw) / (2 * Math.PI));
  return { ...s, theta0, r0: Math.hypot(start.x - s.axisX, start.z - s.axisZ), y0: start.y, fov: start.fov, yaw0: start.yaw, pitch0: start.pitch, v0 };
}

/** a GLIDE's own checks: its points and looks, its eases against its length, its aim never undefined or past half a turn */
function glideRefusal(o: Record<string, unknown>): string | null {
  const triples = (v: unknown) => Array.isArray(v) && v.every((p) => Array.isArray(p) && p.length === 3 && p.every((x) => typeof x === "number" && Number.isFinite(x)));
  if (!triples(o.points) || (o.points as V3[]).length < 2) return "its waypoints are not a list of at least two points of three numbers";
  if (!triples(o.looks) || (o.looks as V3[]).length !== (o.points as V3[]).length) return "its look-at points are not one per waypoint";
  const keys = ["fov", "yaw0", "pitch0", "aimS", "pace", "v0", "rampS", "landS"] as const;
  for (const k of keys) if (typeof o[k] !== "number" || !Number.isFinite(o[k])) return `its ${k} is not a number`;
  const s = o as unknown as GlideShape;
  for (let i = 1; i < s.points.length; i++) if (len3(sub(s.points[i], s.points[i - 1])) < 1e-9) return `its waypoints ${i} and ${i + 1} are the same point`;
  if (!(s.pace > 0)) return "its pace must be above 0";
  if (s.v0 < 0 || s.v0 > s.pace) return "its start speed must be between 0 and its pace";
  if (s.rampS < 0 || s.landS < 0 || s.aimS < 0) return "its eases and aim settle cannot be negative";
  if (!(s.fov > 0 && s.fov < 180)) return "its lens is outside 0–180°";
  const g = buildGlide(s);
  if (!shapeClock(s, g.L).fits) return "it is too short for its start ease and landing at its pace";
  // the aim, at 256 knot moments: never AT its look-at point (no direction), never turning more than half a turn between
  let last: number | null = null;
  const n = s.points.length - 1;
  for (let j = 0; j <= 256; j++) {
    const i = Math.min(n - 1, Math.floor((j / 256) * n)), t = (j / 256) * n - i;
    const p = g.at(i, t), q = g.look(i, t);
    if (len3(sub(q, p)) < 1e-6) return "its camera passes through one of its own look-at points (no direction to look)";
    const yaw = aimAt(p, q).yaw;
    if (Math.abs(wrapDeg(yaw - s.yaw0)) > 179) return "its aim turns more than half a turn from its start";
    if (last !== null && Math.abs(wrapDeg(yaw - last)) > 90) return "its aim swings more than 90° between two moments";
    last = yaw;
  }
  return null;
}

/**
 * ⛔ A MOVE FILE IN — `{ kind: "c2b-camera-move", version: 1, name, start: "camera", glide: { points, looks, paceCms,
 * rampS, landS, aimS } }` (`structural-note-glide-and-open-27-october.md`): positions in WORLD CENTIMETRES (the Builder
 * writing it cannot know the chain's units), converted through the CHAIN's units here, once, at the boundary.
 * ⛔ `start: "camera"` (Carl: *"no cheating"*): the glide BEGINS WHERE THE CAMERA IS when the file is opened — its first
 * waypoint the camera's position, its first look-at point 10 m along the camera's own line of sight, its aim and lens the
 * camera's; `points` / `looks` in the file are the knots AFTER that. `v0` is the opener's (`startSpeed`).
 */
export function moveFromFile(raw: unknown, camera: Pose, units: Units, v0 = 0): { name: string; shape: Shape } | { refusal: string } {
  const o = raw as Record<string, unknown> | null;
  if (!o || typeof o !== "object" || o.kind !== "c2b-camera-move") return { refusal: "it is not a camera move file" };
  if (o.version !== 1) return { refusal: `it is move file version ${String(o.version)}; this bench reads version 1` };
  if (o.start !== "camera") return { refusal: 'its start is not "camera"' };
  const g = o.glide as Record<string, unknown> | undefined;
  if (!g || typeof g !== "object") return { refusal: "it holds no glide" };
  const triples = (v: unknown) => Array.isArray(v) && v.every((p) => Array.isArray(p) && p.length === 3 && p.every((x) => typeof x === "number" && Number.isFinite(x)));
  if (!triples(g.points) || !triples(g.looks)) return { refusal: "its points and look-at points are not lists of three numbers" };
  const toU = (w: V3): V3 => [w[0] / units.d, (w[1] - units.up) / units.d, (w[2] - units.zc) / units.d];
  const y = (camera.yaw * Math.PI) / 180, p = (camera.pitch * Math.PI) / 180;
  const ahead = 1000 / units.d;
  // ⛔ TAKE 2 (Carl on take 1: *"there a period of time at the start when theres no logo in sight. Remedy this."*): a file
  // may name the START's look-at point (`startLook`, world cm) — the aim then turns from the camera's own toward it over
  // `aimS` from the first frame; without one, 10 m along the camera's line of sight (take 1's behaviour)
  const sl = g.startLook;
  if (sl !== undefined && !triples([sl])) return { refusal: "its start look-at point is not three numbers" };
  const look0: V3 = sl ? toU(sl as V3) : [camera.x - Math.sin(y) * Math.cos(p) * ahead, camera.y + Math.sin(p) * ahead, camera.z - Math.cos(y) * Math.cos(p) * ahead];
  const num = (k: string) => (typeof g[k] === "number" ? (g[k] as number) : NaN);
  const shape: GlideShape = {
    kind: "glide",
    points: [[camera.x, camera.y, camera.z], ...(g.points as V3[]).map(toU)],
    looks: [look0, ...(g.looks as V3[]).map(toU)],
    fov: camera.fov,
    yaw0: camera.yaw,
    pitch0: camera.pitch,
    aimS: num("aimS"),
    pace: num("paceCms") / units.d,
    v0: Math.min(v0, num("paceCms") / units.d),
    rampS: num("rampS"),
    landS: num("landS"),
  };
  const bad = shapeRefusal(shape);
  return bad ? { refusal: bad } : { name: typeof o.name === "string" ? o.name : "a move", shape };
}

/** ⛔ A SHAPE CHECKED as outside data is (storage, the hook, a move file, an edit): its numbers in words, or null */
export function shapeRefusal(s: unknown): string | null {
  if (!s || typeof s !== "object") return "it is not a shape";
  const o = s as Record<string, unknown>;
  if (o.kind === "glide") return glideRefusal(o);
  if (o.kind === "barrel") {
    const tri = (v: unknown) => Array.isArray(v) && v.length === 3 && v.every((x) => typeof x === "number" && Number.isFinite(x));
    if (!tri(o.from) || !tri(o.to)) return "its line's start and end are not three numbers each";
    for (const k of ["turns", "radius", "spiralEnd", "fov", "pace", "v0", "rampS", "landS"]) if (typeof o[k] !== "number" || !Number.isFinite(o[k])) return `its ${k} is not a number`;
    const b = o as unknown as BarrelShape;
    if (len3(sub(b.to, b.from)) < 1e-9) return "its line goes nowhere";
    if (b.turns < 0 || b.radius < 0) return "its laps and radius cannot be negative";
    if (!(b.spiralEnd > 0 && b.spiralEnd <= 1)) return "its spiral must end within its line (0 to 1)";
    if (o.rollEase !== undefined && !(typeof o.rollEase === "number" && o.rollEase >= 0 && o.rollEase <= 0.5)) return "its rotation ease must be between 0 and 50% at each end";
    if (o.spiralStart !== undefined && !(typeof o.spiralStart === "number" && o.spiralStart >= 0 && o.spiralStart < b.spiralEnd)) return "its spiral must start before it ends (0 up to its end)";
    if (!(b.pace > 0)) return "its pace must be above 0";
    if (b.v0 < 0 || b.v0 > b.pace) return "its start speed must be between 0 and its pace";
    if (b.rampS < 0 || b.landS < 0) return "its eases cannot be negative";
    if (!(b.fov > 0 && b.fov < 180)) return "its lens is outside 0–180°";
    if (!shapeClock(b, len3(sub(b.to, b.from))).fits) return "it is too short for its start ease and landing at its pace";
    return null;
  }
  if (o.kind !== "helix") return `its kind is "${String(o.kind)}", not "helix" or "glide"`;
  const keys = ["axisX", "axisZ", "theta0", "theta1", "r0", "r1", "y0", "y1", "fov", "yaw0", "pitch0", "aimS", "pace", "v0", "rampS"] as const;
  for (const k of keys) if (typeof o[k] !== "number" || !Number.isFinite(o[k])) return `its ${k} is not a number`;
  const n = o as Record<(typeof keys)[number], number>;
  if (Math.abs(n.theta1 - n.theta0) < 1e-9) return "it goes nowhere: its end angle is its start angle";
  // ⛔ radii > 0: at r = 0 the camera is ON the axis and "aim at the axis" has no direction; linear between the two, so
  // both > 0 covers the whole path
  if (!(n.r0 > 0) || !(n.r1 > 0)) return "its start and end must both be off the axis (a radius above 0)";
  if (!(n.pace > 0)) return "its pace must be above 0";
  if (n.v0 < 0 || n.v0 > n.pace) return "its start speed must be between 0 and its pace";
  if (n.rampS < 0 || n.aimS < 0) return "its ease and aim settle cannot be negative";
  if (!(n.fov > 0 && n.fov < 180)) return "its lens is outside 0–180°";
  return null;
}

/**
 * ⛔ THE FIXED-RATE SAMPLER — one sample per 1/SAMPLE_HZ of CLAMPED time, so the size is the same on any display; ⛔ AT
 * MOST ONE SAMPLE A FRAME ([C2]), stamped with the clamped time built up so far — below 60 Hz a long frame gives one sample,
 * never a repeated pose at a repeated time. `step` takes the RAW frame time and clamps it (`MAX_DT`, the rig's clamp).
 */
export class Sampler {
  private t = 0;
  private acc = 0;
  readonly samples: Sample[];
  constructor(start: Pose) {
    this.samples = [toSample(0, start)];
  }
  get length() {
    return this.t;
  }
  step(rawDt: number, pose: Pose) {
    const dt = clampDt(rawDt);
    this.t += dt;
    this.acc += dt;
    const period = 1 / SAMPLE_HZ;
    if (this.acc + 1e-9 >= period) {
      this.samples.push(toSample(this.t, pose));
      this.acc = (this.acc - period) % period;
    }
  }
  /** the samples, ending exactly where the recording stopped */
  finish(pose: Pose): Sample[] {
    if (this.samples[this.samples.length - 1][0] < this.t) this.samples.push(toSample(this.t, pose));
    return this.samples;
  }
}

// ── R1 (CHAIN_VERSION 1): READ, MIGRATED, PROVEN ────────────────────────────────────────────────────────────────────────

/** an R1 clip: the clips end to end, no start of their own */
export type V1Clip = { id: string; cam: number; samples: Sample[] };

/**
 * ⛔ R1's OWN POSE RULE — `clipLength`, `clipStarts`, `chainDuration`, `locate` and `poseAt` from `bench-chain.ts` at
 * `fb86684` (the R1 file, unchanged from R1's commit), INLINED into one function: every operation as it was, in the same
 * order; R1's `poseInClip` is `poseInSamples` above, line for line. ⚠ A SECOND POSE FUNCTION BY DESIGN: the reference the
 * migration is MEASURED against (`parityV1`), never a playback path. Do not "fix" it; it is R1 as it was.
 */
export function v1PoseAt(clips: V1Clip[], T: number): Pose | null {
  const clipLength = (c: V1Clip) => (c.samples.length ? c.samples[c.samples.length - 1][0] : 0);
  const clipStarts: number[] = [];
  let t0 = 0;
  for (const c of clips) {
    clipStarts.push(t0);
    t0 += clipLength(c);
  }
  const chainDuration = clips.reduce((s, c) => s + clipLength(c), 0);
  const n = clips.length;
  if (!n) return null;
  const t = Math.max(0, Math.min(T, chainDuration));
  let i = n - 1;
  while (i > 0 && clipStarts[i] > t) i--;
  const local = Math.min(t - clipStarts[i], clipLength(clips[i]));
  return poseInSamples(clips[i].samples, local);
}

/** ⛔ R1 → T1a (v3-3): the clips laid end to end at R1's summed starts (the same arithmetic as R1's `clipStarts`, so each
 *  start is the same number), `order` = its place, shown whole, each on its camera's track (Cam 1 always) */
export function migrateV1(clips: V1Clip[]): Chain {
  let t = 0;
  const out: Clip[] = clips.map((c, i) => {
    const len = sampleLength(c.samples);
    const clip: Clip = { id: c.id, cam: c.cam, start: t, order: i, in: 0, out: len, samples: c.samples };
    t += len;
    return clip;
  });
  const tracks = [...new Set([1, ...clips.map((c) => c.cam)])].sort((a, b) => a - b);
  return { kind: CHAIN_KIND, version: CHAIN_VERSION, tracks, clips: out, units: null, refined: null, comp: null, migrations: [] };
}

/**
 * ⛔ THE MIGRATION PROVEN BY NUMBER ([C5], [E1]): R1's rule against T1a's at EVERY sample time, EXACTLY at every clip
 * boundary and the end, and at every boundary ± PROBE (NOT ± EDGE_S: inside that band the two rules differ BY DESIGN).
 * "Identical" = every field within `tol` (1e-9). Returns the moments checked and the largest difference.
 */
export function parityV1(clips: V1Clip[], chain: Chain, tol = 1e-9): { moments: number; maxDiff: number; ok: boolean } {
  const times: number[] = [];
  let t = 0;
  for (const c of clips) {
    for (const s of c.samples) times.push(t + s[0]);
    times.push(t, t + PROBE);
    if (t > PROBE) times.push(t - PROBE);
    t += sampleLength(c.samples);
  }
  times.push(t, Math.max(0, t - PROBE));
  let maxDiff = 0;
  for (const T of times) {
    const a = v1PoseAt(clips, T), b = poseAtT(chain, T)?.pose ?? null;
    if (!a || !b) {
      if (a !== b) maxDiff = Infinity;
      continue;
    }
    maxDiff = Math.max(maxDiff, Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z), Math.abs(a.yaw - b.yaw), Math.abs(a.pitch - b.pitch), Math.abs(a.fov - b.fov));
  }
  return { moments: times.length, maxDiff, ok: maxDiff <= tol };
}

// ── OUTSIDE DATA IN ──────────────────────────────────────────────────────────────────────────────────────────────────────

function checkSamples(samples: unknown, n: number): string | null {
  if (!Array.isArray(samples) || samples.length < 2) return `clip ${n} has fewer than two samples`;
  let last = -Infinity;
  for (const s of samples as unknown[]) {
    if (!Array.isArray(s) || s.length !== 7 || !s.every((v) => typeof v === "number" && Number.isFinite(v))) return `clip ${n} holds a sample that is not seven numbers`;
    if (s[0] < last) return `clip ${n}'s samples run backwards in time`;
    last = s[0];
  }
  if ((samples as Sample[])[0][0] !== 0) return `clip ${n} does not start at 0 s`;
  return null;
}

/** a migration verdict as stored, or null when it is not one this bench knows (an unknown entry is dropped, not refused) */
function readMigration(m: unknown): Migration | null {
  const g = m as Record<string, unknown> | null;
  if (!g || typeof g !== "object") return null;
  if (g.from === 1 && typeof g.ok === "boolean" && typeof g.moments === "number" && (g.maxDiff === null || typeof g.maxDiff === "number")) {
    return { from: 1, moments: g.moments, maxDiff: g.maxDiff as number | null, ok: g.ok };
  }
  if (g.from === 2 && Number.isInteger(g.clips)) return { from: 2, clips: g.clips as number };
  return null;
}

/** ⛔ OUTSIDE DATA IN — a chain from storage (or, in R2, a file) checked before anything plays; a refusal in words.
 *  Reads v3; v2 (MIGRATED to v3: `units` null until the bench's first measured frame, its R1 verdict carried UNCHANGED as
 *  `migrations[0]`, the step recorded as `{ from: 2 }`); and v1 (MIGRATED: `migrated` carries R1's clips for
 *  `parityV1`). `from` = the version read. Optional fields it does not know are ACCEPTED ([A2]). */
export function parseChain(raw: unknown): { chain: Chain; migrated: V1Clip[] | null; from: 1 | 2 | 3 } | { refusal: string } {
  if (!raw || typeof raw !== "object") return { refusal: "it is not a chain" };
  const o = raw as Record<string, unknown>;
  if (o.kind !== CHAIN_KIND) return { refusal: `its kind is "${String(o.kind)}", not "${CHAIN_KIND}"` };
  if (o.version !== 1 && o.version !== 2 && o.version !== CHAIN_VERSION) return { refusal: `it is chain version ${String(o.version)}; this bench reads versions 1 to ${CHAIN_VERSION}` };
  if (!Array.isArray(o.clips)) return { refusal: "it has no list of clips" };
  if (o.version === 1) {
    const clips: V1Clip[] = [];
    for (const [i, c] of (o.clips as unknown[]).entries()) {
      const k = c as Record<string, unknown>;
      if (!k || typeof k.id !== "string") return { refusal: `clip ${i + 1} has no id` };
      if (!Number.isInteger(k.cam) || (k.cam as number) < 1) return { refusal: `clip ${i + 1} has no camera number` };
      const bad = checkSamples(k.samples, i + 1);
      if (bad) return { refusal: bad };
      clips.push({ id: k.id, cam: k.cam as number, samples: k.samples as Sample[] });
    }
    return { chain: migrateV1(clips), migrated: clips, from: 1 };
  }
  const tracks = o.tracks;
  if (!Array.isArray(tracks) || !tracks.length || !tracks.every((t) => Number.isInteger(t) && t >= 1) || new Set(tracks).size !== tracks.length) {
    return { refusal: "its list of camera tracks is not a list of distinct camera numbers" };
  }
  const clips: Clip[] = [];
  const orders = new Set<number>();
  for (const [i, c] of (o.clips as unknown[]).entries()) {
    const k = c as Record<string, unknown>;
    const n = i + 1;
    if (!k || typeof k.id !== "string") return { refusal: `clip ${n} has no id` };
    if (!Number.isInteger(k.cam) || !tracks.includes(k.cam)) return { refusal: `clip ${n}'s camera is not one of the tracks` };
    // ⛔ ONE SOURCE: v2 holds samples only; v3 samples OR a shape, never both, never neither
    const hasShape = k.shape !== undefined;
    if (hasShape && (o.version === 2 || k.samples !== undefined)) return { refusal: `clip ${n} holds ${o.version === 2 ? "a shape in a version 2 chain" : "both samples and a shape"}` };
    let len: number;
    if (hasShape) {
      const bad = shapeRefusal(k.shape);
      if (bad) return { refusal: `clip ${n}: ${bad}` };
      len = shapeLength(k.shape as Shape);
    } else {
      const bad = checkSamples(k.samples, n);
      if (bad) return { refusal: bad };
      len = sampleLength(k.samples as Sample[]);
    }
    const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
    if (!num(k.start) || (k.start as number) < 0) return { refusal: `clip ${n} has no start (or one before 0 s)` };
    if (!num(k.in) || !num(k.out) || (k.in as number) < 0 || (k.out as number) > len + EDGE_S || (k.out as number) - (k.in as number) <= EDGE_S) {
      return { refusal: `clip ${n}'s in and out are not a span of its ${hasShape ? "shape" : "samples"}` };
    }
    if (!Number.isInteger(k.order) || orders.has(k.order as number)) return { refusal: `clip ${n}'s take order is missing or repeated` };
    orders.add(k.order as number);
    const span = { id: k.id, cam: k.cam as number, start: k.start as number, order: k.order as number, in: k.in as number, out: k.out as number };
    clips.push(hasShape ? { ...span, shape: { ...(k.shape as Shape) } } : { ...span, samples: k.samples as Sample[] });
  }
  if (o.version === 2) {
    // ⛔ v2 → v3: R1's verdict (the old single `migration`) carried UNCHANGED as the first entry, so its persistent
    // "differences" line survives ([E2]); the units are the bench's to fill on its first measured frame
    const kept = readMigration(o.migration);
    const migrations: Migration[] = [...(kept ? [kept] : []), { from: 2, clips: clips.length }];
    return { chain: { kind: CHAIN_KIND, version: CHAIN_VERSION, tracks: tracks as number[], clips, units: null, refined: null, comp: null, migrations }, migrated: null, from: 2 };
  }
  const u = o.units as Record<string, unknown> | null | undefined;
  let units: Units | null = null;
  if (u !== null && u !== undefined) {
    const fin = (v: unknown) => typeof v === "number" && Number.isFinite(v);
    if (typeof u !== "object" || !fin(u.d) || !((u.d as number) > 0) || !fin(u.up) || !fin(u.zc)) return { refusal: "its units are not three numbers with a front distance above 0" };
    units = { d: u.d as number, up: u.up as number, zc: u.zc as number };
  }
  const migrations = Array.isArray(o.migrations) ? (o.migrations as unknown[]).map(readMigration).filter((m): m is Migration => m !== null) : [];
  return { chain: { kind: CHAIN_KIND, version: CHAIN_VERSION, tracks: tracks as number[], clips, units, refined: null, comp: null, migrations }, migrated: null, from: 3 };
}
