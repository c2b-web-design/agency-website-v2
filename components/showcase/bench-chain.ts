/**
 * ⛔ THE CAMERA RECORDER's TIMELINE — PURE FUNCTIONS AND TYPES. T1a, CAMERA TRACKS (the plan
 * `live-work/plan-camera-tracks-t1a-27-october.md` v2, under the note `structural-note-camera-recorder-26-october.md` v3.1;
 * D-104). Carl: *"If we put the playhead where we want it, select another camera and record Cam 2 takes precedent over
 * Cam 1. Which means cuts can be made easier and Cam 1 is non destructive."* (R1, one lane end to end, is replaced.)
 *
 * - ⛔ NO RUNTIME IMPORTS (the Architect's [A9]): this file is run by Node 25 with its types stripped
 *   (`live-work/scripts/bench-chain-check-26-october.mjs`), which handles neither `@/` aliases nor extensionless imports.
 * - A SAMPLE is `[t, x, y, z, yaw, pitch, fov]`: `t` seconds from the clip's start (the CLAMPED clock the rig integrates);
 *   position in units of `d` from the subject's centre; turn, tilt, lens in degrees. ROLL is NOT sampled (the rig has none).
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
 */

export const CHAIN_KIND = "c2b-camera-chain";
export const CHAIN_VERSION = 2;
/** samples per second, whatever the display's refresh (the Architect's second R1 review, point 2) */
export const SAMPLE_HZ = 60;
/** ⛔ THE ONE CLAMP — a frame longer than this counts as this long, for the rig AND the recording (a hitch costs ≤ 0.1 s) */
export const MAX_DT = 0.1;

export type Sample = [t: number, x: number, y: number, z: number, yaw: number, pitch: number, fov: number];
export type Pose = { x: number; y: number; z: number; yaw: number; pitch: number; fov: number };
/** `cam` 1, 2, 3 … — "Cam 2", never "Camera B" (B is a button). */
export type Clip = { id: string; cam: number; start: number; order: number; in: number; out: number; samples: Sample[] };
/** `tracks`: the cameras, BOTTOM → TOP (Cam 1 first; a track exists before it has a clip, so it can be armed).
 *  `migration`: present only on a chain carried over from R1 — the parity verdict, KEPT so a "differences" line survives
 *  a reload until Carl decides ([E2]); `maxDiff` null = a moment one rule could pose and the other could not. */
export type Migration = { from: 1; moments: number; maxDiff: number | null; ok: boolean };
export type Chain = {
  kind: typeof CHAIN_KIND;
  version: typeof CHAIN_VERSION;
  tracks: number[];
  clips: Clip[];
  refined: null;
  comp: null;
  migration?: Migration;
};

/** time closer than this to a clip's edge counts as the edge (a microsecond; samples are 16.7 ms apart) */
export const EDGE_S = 1e-6;
/** ⛔ [E1] the named offset for "just before" an edge: outside the ±EDGE_S band, where every rule agrees */
export const PROBE = 2 * EDGE_S;

export const clampDt = (raw: number) => Math.min(Math.max(raw, 0), MAX_DT);
export const emptyChain = (): Chain => ({ kind: CHAIN_KIND, version: CHAIN_VERSION, tracks: [1], clips: [], refined: null, comp: null });
const withClips = (chain: Chain, clips: Clip[]): Chain => ({ ...chain, clips });
export const newClipId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const samplePose = (s: Sample): Pose => ({ x: s[1], y: s[2], z: s[3], yaw: s[4], pitch: s[5], fov: s[6] });
const toSample = (t: number, p: Pose): Sample => [t, p.x, p.y, p.z, p.yaw, p.pitch, p.fov];

/** the samples' own length (their last time) */
export const sampleLength = (s: Sample[]) => (s.length ? s[s.length - 1][0] : 0);
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
/** A clip's pose at SHOT time T — clamped to its trimmed span (so its edge poses hold at its edges). Also the SOLO pose:
 *  a selection plays this, precedence ignored (Carl: "The clip solo"). */
export function clipPoseAt(c: Clip, T: number): Pose {
  return poseInSamples(c.samples, Math.min(c.out, Math.max(c.in, c.in + (T - c.start))));
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
      degrees: Math.hypot(s.yaw - e.yaw, s.pitch - e.pitch),
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
  return { kind: CHAIN_KIND, version: CHAIN_VERSION, tracks, clips: out, refined: null, comp: null };
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

/** ⛔ OUTSIDE DATA IN — a chain from storage (or, in R2, a file) checked before anything plays; a refusal in words.
 *  Reads v2, and v1 (MIGRATED: `migrated` carries R1's clips for `parityV1`). Optional fields it does not know are
 *  ACCEPTED ([A2]). */
export function parseChain(raw: unknown): { chain: Chain; migrated: V1Clip[] | null } | { refusal: string } {
  if (!raw || typeof raw !== "object") return { refusal: "it is not a chain" };
  const o = raw as Record<string, unknown>;
  if (o.kind !== CHAIN_KIND) return { refusal: `its kind is "${String(o.kind)}", not "${CHAIN_KIND}"` };
  if (o.version !== 1 && o.version !== CHAIN_VERSION) return { refusal: `it is chain version ${String(o.version)}; this bench reads versions 1 and ${CHAIN_VERSION}` };
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
    return { chain: migrateV1(clips), migrated: clips };
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
    const bad = checkSamples(k.samples, n);
    if (bad) return { refusal: bad };
    const len = sampleLength(k.samples as Sample[]);
    const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
    if (!num(k.start) || (k.start as number) < 0) return { refusal: `clip ${n} has no start (or one before 0 s)` };
    if (!num(k.in) || !num(k.out) || (k.in as number) < 0 || (k.out as number) > len + EDGE_S || (k.out as number) - (k.in as number) <= EDGE_S) {
      return { refusal: `clip ${n}'s in and out are not a span of its samples` };
    }
    if (!Number.isInteger(k.order) || orders.has(k.order as number)) return { refusal: `clip ${n}'s take order is missing or repeated` };
    orders.add(k.order as number);
    clips.push({ id: k.id, cam: k.cam as number, start: k.start as number, order: k.order as number, in: k.in as number, out: k.out as number, samples: k.samples as Sample[] });
  }
  const chain: Chain = { kind: CHAIN_KIND, version: CHAIN_VERSION, tracks: tracks as number[], clips, refined: null, comp: null };
  const mg = o.migration as Record<string, unknown> | undefined;
  if (mg && mg.from === 1 && typeof mg.ok === "boolean" && typeof mg.moments === "number" && (mg.maxDiff === null || typeof mg.maxDiff === "number")) {
    chain.migration = { from: 1, moments: mg.moments, maxDiff: mg.maxDiff as number | null, ok: mg.ok };
  }
  return { chain, migrated: null };
}
