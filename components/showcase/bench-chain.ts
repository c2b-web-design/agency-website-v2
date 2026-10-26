/**
 * ⛔ THE CAMERA RECORDER's CHAIN — PURE FUNCTIONS AND TYPES (R1; the plan `live-work/plan-camera-recorder-r1-26-october.md`
 * v2.3, under the approved note `structural-note-camera-recorder-26-october.md` v2.2; D-104). Carl's design: record / stop
 * in CHUNKS, the chunks as DAW CLIPS, a punch-in that cuts a clip and keeps what follows, new cameras as cuts.
 *
 * - ⛔ NO RUNTIME IMPORTS (the Architect's [A9]): this file is run by Node 25 with its types stripped
 *   (`live-work/scripts/bench-chain-check-26-october.mjs`), which handles neither `@/` aliases nor extensionless imports.
 * - A SAMPLE is `[t, x, y, z, yaw, pitch, fov]`: `t` seconds from the clip's start (the CLAMPED clock the rig integrates —
 *   note decision 4; it SUPERSEDES v3's "not clamped" for recordings); position in units of `d` from the subject's centre
 *   (v3's units); turn, tilt, lens in degrees. ROLL is NOT sampled — the rig has none; it is reserved for the fitted shot.
 * - A CHAIN is the clips end to end. ⛔ It plays a JUMP at every join — never smoothed (a cut, or a mismatch the Builder
 *   compensates at hand-off, Carl: "i would ask you to compensate").
 * - ⛔ ROOM FOR R2 ([A2]): `refined` and `comp` are RESERVED now (null), and `parseChain` ACCEPTS optional fields it does not
 *   know. `CHAIN_VERSION` moves ONLY for a change an older reader would misread — so R2 never refuses Carl's R1 takes.
 */

export const CHAIN_KIND = "c2b-camera-chain";
export const CHAIN_VERSION = 1;
/** samples per second, whatever the display's refresh (the Architect's second review, point 2) */
export const SAMPLE_HZ = 60;
/** ⛔ THE ONE CLAMP — a frame longer than this counts as this long, for the rig AND the recording (a hitch costs ≤ 0.1 s) */
export const MAX_DT = 0.1;

export type Sample = [t: number, x: number, y: number, z: number, yaw: number, pitch: number, fov: number];
export type Pose = { x: number; y: number; z: number; yaw: number; pitch: number; fov: number };
/** `cam` 1, 2, 3 … — "Cam 2", never "Camera B" (B is a button). Its NUMBER in the lane is its place, not stored. */
export type Clip = { id: string; cam: number; samples: Sample[] };
export type Chain = { kind: typeof CHAIN_KIND; version: typeof CHAIN_VERSION; clips: Clip[]; refined: null; comp: null };

/** time closer than this to a clip's edge counts as the edge (a microsecond; samples are 16.7 ms apart) */
export const EDGE_S = 1e-6;

export const clampDt = (raw: number) => Math.min(Math.max(raw, 0), MAX_DT);
export const emptyChain = (): Chain => ({ kind: CHAIN_KIND, version: CHAIN_VERSION, clips: [], refined: null, comp: null });
const withClips = (chain: Chain, clips: Clip[]): Chain => ({ ...chain, clips });
export const newClipId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const samplePose = (s: Sample): Pose => ({ x: s[1], y: s[2], z: s[3], yaw: s[4], pitch: s[5], fov: s[6] });
const toSample = (t: number, p: Pose): Sample => [t, p.x, p.y, p.z, p.yaw, p.pitch, p.fov];

export const clipLength = (c: Clip) => (c.samples.length ? c.samples[c.samples.length - 1][0] : 0);
/** where each clip starts on the chain's time */
export function clipStarts(chain: Chain): number[] {
  const out: number[] = [];
  let t = 0;
  for (const c of chain.clips) {
    out.push(t);
    t += clipLength(c);
  }
  return out;
}
export const chainDuration = (chain: Chain) => chain.clips.reduce((s, c) => s + clipLength(c), 0);

/** The clip at chain time `T` and the time within it. ⛔ AT A JOIN, T belongs to the LATER clip (its first pose — a jump). */
export function locate(chain: Chain, T: number): { index: number; local: number } | null {
  const n = chain.clips.length;
  if (!n) return null;
  const starts = clipStarts(chain);
  const t = Math.max(0, Math.min(T, chainDuration(chain)));
  let i = n - 1;
  while (i > 0 && starts[i] > t) i--;
  // a clip of zero length cannot hold T; step back to one that can (they are never stored, but be safe)
  return { index: i, local: Math.min(t - starts[i], clipLength(chain.clips[i])) };
}

/** A clip's pose at a time within it — linear between samples (60 a second: a straight line is finer than the eye). */
export function poseInClip(c: Clip, local: number): Pose {
  const s = c.samples;
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
export function poseAt(chain: Chain, T: number): Pose | null {
  const at = locate(chain, T);
  return at ? poseInClip(chain.clips[at.index], at.local) : null;
}

/** ⛔ A JOIN between neighbouring clips: a CUT where the cameras differ ([A5]); else a MISMATCH — how far the next clip
 *  starts from where the last stopped (metres, given `metresPerD`) and how far it turns (degrees). Zero = continuous. */
export type Join = { kind: "cut" } | { kind: "mismatch"; metres: number; degrees: number };
export function joinKind(a: Clip, b: Clip, metresPerD: number): Join {
  if (a.cam !== b.cam) return { kind: "cut" };
  const e = a.samples[a.samples.length - 1], s = b.samples[0];
  return {
    kind: "mismatch",
    metres: Math.hypot(s[1] - e[1], s[2] - e[2], s[3] - e[3]) * metresPerD,
    degrees: Math.hypot(s[4] - e[4], s[5] - e[5]),
  };
}

export const appendClip = (chain: Chain, clip: Clip): Chain => withClips(chain, [...chain.clips, clip]);

/**
 * ⛔ THE PUNCH-IN — the clip under `T` is CUT at T and ITS TAIL DISCARDED; the new clip goes in after it; LATER CLIPS ARE
 * KEPT (Carl: compensate). ⛔ A punch at a clip's very START leaves it no samples — that clip is REMOVED, never kept empty
 * ([A5]). Returns the new chain and the new clip's index.
 */
export function punchIn(chain: Chain, T: number, clip: Clip): { chain: Chain; index: number } {
  const at = locate(chain, T);
  if (!at) return { chain: appendClip(chain, clip), index: 0 };
  const cut = chain.clips[at.index];
  const kept = cut.samples.filter((s) => s[0] < at.local);
  const clips = chain.clips.slice();
  // ⛔ within EDGE_S of the clip's start IS its start — a clip's length is a sum of sixtieths, so a "boundary" can land
  // 2e-15 s inside the next clip and keep a zero-length sliver (measured by the chain check, 26 October)
  if (at.local > EDGE_S && kept.length) {
    clips[at.index] = { ...cut, samples: [...kept, toSample(at.local, poseInClip(cut, at.local))] };
    clips.splice(at.index + 1, 0, clip);
    return { chain: withClips(chain, clips), index: at.index + 1 };
  }
  clips.splice(at.index, 1, clip);
  return { chain: withClips(chain, clips), index: at.index };
}

export const deleteClips = (chain: Chain, ids: ReadonlySet<string>): Chain => withClips(chain, chain.clips.filter((c) => !ids.has(c.id)));

/** The highest camera number in use (0 when empty) — a NEW camera is this + 1. */
export const maxCam = (chain: Chain) => chain.clips.reduce((m, c) => Math.max(m, c.cam), 0);

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

/** ⛔ OUTSIDE DATA IN — a chain from storage (or, in R2, a file) checked before anything plays; a refusal in words. Optional
 *  fields it does not know are ACCEPTED ([A2]). */
export function parseChain(raw: unknown): { chain: Chain } | { refusal: string } {
  if (!raw || typeof raw !== "object") return { refusal: "it is not a chain" };
  const o = raw as Record<string, unknown>;
  if (o.kind !== CHAIN_KIND) return { refusal: `its kind is "${String(o.kind)}", not "${CHAIN_KIND}"` };
  if (o.version !== CHAIN_VERSION) return { refusal: `it is chain version ${String(o.version)}; this bench reads version ${CHAIN_VERSION}` };
  if (!Array.isArray(o.clips)) return { refusal: "it has no list of clips" };
  const clips: Clip[] = [];
  for (const [i, c] of (o.clips as unknown[]).entries()) {
    const k = c as Record<string, unknown>;
    if (!k || typeof k.id !== "string") return { refusal: `clip ${i + 1} has no id` };
    if (!Number.isInteger(k.cam) || (k.cam as number) < 1) return { refusal: `clip ${i + 1} has no camera number` };
    if (!Array.isArray(k.samples) || k.samples.length < 2) return { refusal: `clip ${i + 1} has fewer than two samples` };
    let last = -Infinity;
    for (const s of k.samples as unknown[]) {
      if (!Array.isArray(s) || s.length !== 7 || !s.every((v) => typeof v === "number" && Number.isFinite(v))) {
        return { refusal: `clip ${i + 1} holds a sample that is not seven numbers` };
      }
      if (s[0] < last) return { refusal: `clip ${i + 1}'s samples run backwards in time` };
      last = s[0];
    }
    if ((k.samples as Sample[])[0][0] !== 0) return { refusal: `clip ${i + 1} does not start at 0 s` };
    clips.push({ id: k.id, cam: k.cam as number, samples: k.samples as Sample[] });
  }
  return { chain: { kind: CHAIN_KIND, version: CHAIN_VERSION, clips, refined: null, comp: null } };
}
