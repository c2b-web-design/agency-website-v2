/**
 * ⛔ A CAMERA SHOT AS DATA — the format (the camera bench's structural note v3, `live-work/structural-note-camera-bench-26-
 * october.md`; Carl's method, D-104: he describes the shot, performs it on the pad, we refine). Built in chunk 1 of
 * `/proto/camera`; read later by the page a shot is FOR (the hero's — not `/proto/your-words`, whose approved journey stays
 * CODE, `journeyPose`).
 *
 * ⛔ UNITS — RELATIVE TO THE SUBJECT (chunk 0, both seats' proposal): positions and the look-at target in units of `d`, the
 * subject's FRONT DISTANCE on the canvas the shot plays on (`measurePiece`), from the subject's centre (`0, up, zc`) — so a
 * shot scales with the window as R-093's journey does. Turn, tilt and roll in DEGREES, UNWRAPPED (never a slerp: a 180°
 * turn has no "shortest way", so the data keeps which way it went — R-093). The lens as the VERTICAL field of view, degrees.
 * Exposure in stops. `recordedAt` keeps the window it was performed in, for a reviewer.
 *
 * ⛔ EACH TRACK IS A CURVE OF VALUE AGAINST TIME through its keys (cubic Hermite): AUTO tangents by default — the slope
 * through a key is its neighbours' (Catmull-Rom on time), so the camera FLOWS THROUGH keyframes and does not stop at each
 * one; a HOLD key has zero slope (a deliberate stop). The first and last keys hold — a shot starts from and ends at rest.
 * Unreal's twin: Sequencer's Auto vs User/Break tangents. ⚠ Auto tangents can OVERSHOOT between keys far apart in value;
 * not clamped (Unreal's "Smart Auto" is) — a take, to be judged on the pad.
 *
 * ⛔ RESERVED TRACKS (v2): carried from version 1 so adding one later is an EDIT. Chunk 1 DRAWS position, turn, tilt, roll and
 * the lens; the rest are carried and NOT drawn — `unsupportedTracks` names any set away from its default, and a page REFUSES
 * such a shot (house style: loud, never a silent drop). A shot of another `version` is refused the same way.
 */

export const SHOT_VERSION = 1;

export type TrackName =
  | "x" | "y" | "z" // position, units of d from the subject's centre
  | "yaw" | "pitch" | "roll" // degrees, unwrapped
  | "fov" // vertical field of view, degrees
  | "shiftX" | "shiftY" // lens shift, fraction of the frame (x: `filmOffset`; y: `setViewOffset`)
  | "exposure" // stops
  | "shake" | "shakeFreq" // amount (degrees), frequency (Hz) — seeded by the shot's `seed`
  | "focus" | "aperture" // units of d; f-stop (0 = no depth of field) — need a post-processing stage
  | "lookX" | "lookY" | "lookZ" | "lookWeight"; // the look-at target (units of d) and its weight 0–1

export const TRACK_DEFAULTS: Record<TrackName, number> = {
  x: 0, y: 0, z: 1, yaw: 0, pitch: 0, roll: 0, fov: 30,
  shiftX: 0, shiftY: 0, exposure: 0, shake: 0, shakeFreq: 1, focus: 1, aperture: 0,
  lookX: 0, lookY: 0, lookZ: 0, lookWeight: 0,
};
/** What chunk 1 draws. Everything else is carried, not drawn. */
export const DRAWN_TRACKS: TrackName[] = ["x", "y", "z", "yaw", "pitch", "roll", "fov"];

export type Key = { t: number; v: number; hold?: boolean };
export type ShotCamera = { name: string; tracks: Partial<Record<TrackName, Key[]>> };
export type Shot = {
  version: typeof SHOT_VERSION;
  recordedAt: { width: number; height: number };
  seed: number;
  cameras: ShotCamera[];
  /** which camera is live from when — one camera: `[{ t: 0, camera: 0 }]` */
  cuts: { t: number; camera: number }[];
  /** ⚠ BEHAVIOURAL, NOT ENFORCED: the review entry that approved this shot (e.g. "R-095"); a page logs loudly without it */
  approved?: string;
};

/** The track's value at `t` — cubic Hermite through the keys, auto tangents, holds and both ends at rest. */
export function evalTrack(keys: Key[] | undefined, t: number, def: number): number {
  if (!keys || !keys.length) return def;
  if (keys.length === 1 || t <= keys[0].t) return keys[0].v;
  const last = keys[keys.length - 1];
  if (t >= last.t) return last.v;
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const k0 = keys[i], k1 = keys[i + 1];
  const h = k1.t - k0.t;
  if (h <= 0) return k1.v;
  const slope = (j: number) => {
    const k = keys[j];
    if (k.hold || j === 0 || j === keys.length - 1) return 0;
    const a = keys[j - 1], b = keys[j + 1];
    return b.t > a.t ? (b.v - a.v) / (b.t - a.t) : 0;
  };
  const s = (t - k0.t) / h, s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * k0.v + (s3 - 2 * s2 + s) * h * slope(i) + (-2 * s3 + 3 * s2) * k1.v + (s3 - s2) * h * slope(i + 1);
}

/** Every track at `t` (defaults where a track is absent). */
export function evalCamera(cam: ShotCamera, t: number): Record<TrackName, number> {
  const out = { ...TRACK_DEFAULTS };
  for (const name of Object.keys(TRACK_DEFAULTS) as TrackName[]) out[name] = evalTrack(cam.tracks[name], t, TRACK_DEFAULTS[name]);
  return out;
}

/** The shot's length — its last key, any track. */
export function cameraDuration(cam: ShotCamera): number {
  let end = 0;
  for (const keys of Object.values(cam.tracks)) if (keys?.length) end = Math.max(end, keys[keys.length - 1].t);
  return end;
}

/** Reserved tracks set away from their default — what this build cannot draw. */
export function unsupportedTracks(cam: ShotCamera): TrackName[] {
  return (Object.keys(cam.tracks) as TrackName[]).filter(
    (n) => !DRAWN_TRACKS.includes(n) && (cam.tracks[n] ?? []).some((k) => k.v !== TRACK_DEFAULTS[n]),
  );
}

/** A page's gate: `null` when the shot can be drawn as written; otherwise why not, in plain words. */
export function shotRefusal(shot: { version?: unknown; cameras?: ShotCamera[] }): string | null {
  if (shot.version !== SHOT_VERSION) return `shot format version ${String(shot.version)} is not ${SHOT_VERSION}`;
  if (!shot.cameras?.length) return "the shot has no camera";
  for (const c of shot.cameras) {
    const u = unsupportedTracks(c);
    if (u.length) return `camera "${c.name}" uses tracks this build does not draw: ${u.join(", ")}`;
  }
  return null;
}
