/**
 * ⛔ THE CAMERA BENCH's CONTROLLER AND ITS FEEL (the structural note v3, "The controller"; D-104 — Carl performs the move on
 * his Xbox pad to get it "in the ballpark"). Pure functions and plain objects — read inside the bench's frame callback only
 * (no second loop), so a test can drive them through a stubbed `navigator.getGamepads`.
 *
 * - THE PAD: the browser's Gamepad API. Windows drives an Xbox pad (XInput) — nothing to install. ⚠ The browser shows the
 *   pad to a page only after a button press ON THE PAD; the sticks are POLLED (no events). Standard mapping (`BTN`).
 *   ⚠ Believed, not tested: Chrome gives the API only to a SECURE page — `localhost` is one; the dev server's network
 *   address over plain http is not.
 * - THE FEEL (the Builder's takes — Carl's hands judge them; no test can):
 *   a radial DEAD ZONE (a resting stick does not drift); a RESPONSE CURVE (power 2: fine near the centre, fast at full throw);
 *   the rig as a WEIGHTED camera — velocities eased toward the stick's with a first-order lag (`FEEL.smoothS`), which never
 *   overshoots (a critically damped response); speeds in units of `d`, the subject's front distance, so the same throw
 *   covers the same share of the frame on any scene.
 * - ⛔ THE MOVE IS AT WALKING PACE, IN METRES (Carl, 26 October 2026: *"Make the L stick just go forwards and backwards at
 *   walking speed."*): `FEEL.walk`, 1.4 m/s at full throw — an average adult's walk; the start (22.71 m out) is ~16 s away.
 *   Was 0.45 d/s ≈ 10.3 m/s at 1 px = 1 cm, and it moved with the window's shape. The crane and the look are still in d
 *   and degrees — Carl's item 3 (sensitivity).
 */

export const BTN = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, VIEW: 8, START: 9, LS: 10, RS: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 } as const;

/** ⚠ TAKES, to be judged on the pad: dead zone, curve, smoothing, and the speeds (d per second; degrees per second). */
export const FEEL = {
  dead: 0.15,
  power: 2,
  smoothS: 0.22,
  /** metres per second at full throw — walking pace (was `move: 0.45` d/s) */
  walk: 1.4,
  crane: 0.3,
  lookDeg: 75,
  lensDeg: 14,
  fast: 3,
  slow: 0.25,
  pitchLimitDeg: 89,
  fovMin: 6,
  fovMax: 100,
};

export type PadRead = {
  connected: boolean;
  id: string;
  /** shaped: left / right sticks (−1…1, +y = pushed UP), triggers (0…1) */
  lx: number; ly: number; rx: number; ry: number; lt: number; rt: number;
  buttons: boolean[];
  rumble: ((ms: number) => void) | null;
};

const NONE: PadRead = { connected: false, id: "", lx: 0, ly: 0, rx: 0, ry: 0, lt: 0, rt: 0, buttons: [], rumble: null };

/** A stick pair through the radial dead zone and the response curve. */
export function shapeStick(x: number, y: number): [number, number] {
  const m = Math.hypot(x, y);
  if (m <= FEEL.dead) return [0, 0];
  const k = Math.pow(Math.min(1, (m - FEEL.dead) / (1 - FEEL.dead)), FEEL.power) / m;
  return [x * k, y * k];
}

/** The first connected pad, shaped — or `connected: false`. */
export function readPad(): PadRead {
  if (typeof navigator === "undefined" || !navigator.getGamepads) return NONE;
  const pad = Array.from(navigator.getGamepads()).find((p) => p && p.connected);
  if (!pad) return NONE;
  const ax = (i: number) => pad.axes[i] ?? 0;
  const [lx, ly] = shapeStick(ax(0), -ax(1));
  const [rx, ry] = shapeStick(ax(2), -ax(3));
  const trig = (i: number) => {
    const v = pad.buttons[i]?.value ?? 0;
    return v <= 0.05 ? 0 : Math.pow((v - 0.05) / 0.95, FEEL.power);
  };
  const act = (pad as Gamepad & { vibrationActuator?: { playEffect?: (t: string, p: object) => Promise<unknown> } }).vibrationActuator;
  return {
    connected: true,
    id: pad.id,
    lx, ly, rx, ry,
    lt: trig(BTN.LT),
    rt: trig(BTN.RT),
    buttons: pad.buttons.map((b) => b.pressed),
    rumble: act?.playEffect
      ? (ms) => {
          act.playEffect!("dual-rumble", { duration: ms, strongMagnitude: 0.35, weakMagnitude: 0.6 }).catch(() => {});
        }
      : null,
  };
}

/** Rising edges — a button counts once per press. */
export class Edges {
  private prev: boolean[] = [];
  pressed(now: boolean[]): (i: number) => boolean {
    const was = this.prev;
    this.prev = now.slice();
    return (i) => !!now[i] && !was[i];
  }
}

/** The camera as a rig: position (world layout px), turn and tilt (degrees, unwrapped), the lens (vertical FOV), and the
 *  eased velocities that give it weight. */
export type Rig = {
  x: number; y: number; z: number;
  yaw: number; pitch: number; fov: number;
  vx: number; vy: number; vz: number; vyaw: number; vpitch: number; vfov: number;
};
export function rigAt(x: number, y: number, z: number, yaw = 0, pitch = 0, fov = 30): Rig {
  return { x, y, z, yaw, pitch, fov, vx: 0, vy: 0, vz: 0, vyaw: 0, vpitch: 0, vfov: 0 };
}

/** What the hands ask for this frame, each −1…1 (lens: + longer). `speed` the bumpers' multiplier. */
export type Intent = { forward: number; right: number; up: number; turn: number; tilt: number; lens: number; speed: number };

/** One frame of the rig: velocities eased toward the intent, then integrated. Moves are relative to where the camera FACES
 *  (level — forward does not dive when the camera looks down). `pxPerMetre` the world's scale (the bench's). */
export function stepRig(r: Rig, i: Intent, dt: number, d: number, pxPerMetre: number): void {
  const k = 1 - Math.exp(-dt / FEEL.smoothS);
  const yawR = (r.yaw * Math.PI) / 180;
  // three's camera looks −z at yaw 0; `rotation.y` = yaw turns it toward −x
  const fx = -Math.sin(yawR), fz = -Math.cos(yawR);
  const rx = Math.cos(yawR), rz = -Math.sin(yawR);
  const m = FEEL.walk * pxPerMetre * i.speed;
  const tx = (fx * i.forward + rx * i.right) * m;
  const tz = (fz * i.forward + rz * i.right) * m;
  const ty = i.up * FEEL.crane * d * i.speed;
  r.vx += (tx - r.vx) * k;
  r.vy += (ty - r.vy) * k;
  r.vz += (tz - r.vz) * k;
  r.vyaw += (-i.turn * FEEL.lookDeg * Math.min(i.speed, 1.5) - r.vyaw) * k;
  r.vpitch += (i.tilt * FEEL.lookDeg * Math.min(i.speed, 1.5) - r.vpitch) * k;
  r.vfov += (-i.lens * FEEL.lensDeg - r.vfov) * k;
  r.x += r.vx * dt;
  r.y += r.vy * dt;
  r.z += r.vz * dt;
  r.yaw += r.vyaw * dt;
  r.pitch = Math.max(-FEEL.pitchLimitDeg, Math.min(FEEL.pitchLimitDeg, r.pitch + r.vpitch * dt));
  r.fov = Math.max(FEEL.fovMin, Math.min(FEEL.fovMax, r.fov + r.vfov * dt));
}

/**
 * ⛔ THE mm READOUT — NOT three's (the note v3): three's focal length uses a film height of `filmGauge / max(aspect, 1)`, so
 * the same field of view reads a different mm as the window changes shape; Unreal's filmback is a fixed sensor. Shown here
 * against ONE FIXED sensor on the HORIZONTAL field of view. ⚠ The sensor is a DEFAULT — full-frame, 36 mm wide — until Carl
 * names the Unreal filmback preset he works with (chunk 0); labelled so on the bench.
 */
export const SENSOR_MM = 36;
export function focalMm(vfovDeg: number, aspect: number): number {
  const hHalf = Math.atan(Math.tan((vfovDeg * Math.PI) / 360) * aspect);
  return SENSOR_MM / 2 / Math.tan(hHalf);
}
