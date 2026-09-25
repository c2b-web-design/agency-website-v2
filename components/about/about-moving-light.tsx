"use client";

/**
 * ⛔⛔ THE MOVING LIGHT — /about §2, the room's light. 25 September 2026 (second session). Reasoning: D-090's
 * 25 September entries. **ON BY DEFAULT on plain `/about`; `?lightmove=0` removes it.**
 * ⚠ It was first built behind `?lightmove=1`, and Carl reached §2 the way he always does — through
 * **Roles**, which loads `/about#roles` with NO query — so he saw nothing: *"no its not."* **A flag on a
 * page reached by a link is a flag the reader never carries.** Carl works on plain `/about`.
 *
 * Carl: *"What we need is a different 'performance' from the light"* — the third in a family whose other
 * two ship on `/start`: the Q+A's traveller (a PASS, `TravellingLight` in `answer-card-canvas.tsx`) and
 * client info's orbit (a LOOP, `contact-field-light-rig.tsx`). **Variations on a theme.**
 *
 * ⛔ WHAT CARL DECIDED (D-090):
 *   - **It WASHES; it does not concentrate.** D-077: *"four positions you return to, not four stages."*
 *   - **One shared downbeat on the landing, CA first** — ⚠ PARKED (`DOWNBEAT_ON_LANDING`): the trigger is
 *     being reworked; *"make sure it has no impact at the moment."*
 *   - **SLOW. Its job is the 3D geometry.** ⛔ **Legibility first** — *"not at the expense of the task."*
 *
 * ══════════════════════════════════════════════════════════════════════════════════════════════════════
 * ⛔⛔ THE PERFORMANCE — CARL'S ORBIT, 25 September 2026, from his sketch:
 * ══════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * *"We should put it on a circular trajectory so it affects all the cards at different times… More like
 * the client info only it wont pass round the back. It should start closer to CA at its top left corner
 * looking right, accross its face. Then pull out slightly and sweep accross the floor card and make its
 * way to the bottom right of CB… A second light should start at CB in its bottom right corner. A mirror
 * image. They start at the same time. That light makes its way up. The orbit is fixed and you can change
 * the direction of the light so its always sweeping accross the card."* — and *"Allow for perspective."*
 *
 *   - **ONE FIXED ELLIPSE, in room space** (so the camera's perspective shapes it on screen), in front of
 *     the cards: centred on the wall pair, round the OUTSIDE of CA and CB, its top across CS, its bottom
 *     across CD (`?lmbottom=` sets where, as a fraction of CD's height). ⛔ **It passes through CA's
 *     top-left and CB's bottom-right corners by construction** — those fix its width.
 *   - **TWO LIGHTS, HALF A LAP APART, both anticlockwise on screen:** L1 from CA's top-left, down and
 *     across CD, up to CB's bottom-right; L2 from CB's bottom-right, up and across CS, down to CA's
 *     top-left. ⚠ **A mirror by point symmetry** — each is the other rotated 180° about the centre.
 *     They carry on round, so every card gets its moment at a different time.
 *   - **CLOSE AT THE CORNERS, PULLED OUT BETWEEN** (`?lmnear=` / `?lmfar=`, mm off the wall): nearest the
 *     wall at CA's top-left and CB's bottom-right, where it rakes; furthest a quarter-lap on, across CD and CS.
 *   - ⛔ **THE AIM TURNS — IT LOOKS AT THE CARD IT IS PASSING.** Spot lights (their direction is the
 *     point), aimed at the cards' centres weighted by 1/distance⁴ — so the aim glides from card to card
 *     rather than jumping. ⚠⚠ **The first rule tried — aim at the orbit's centre — MEASURED WRONG**
 *     (`live-work/scripts/orbit-design.mjs`): CD peaked at **0.03** (unlit) and CS spiked to **2.44**.
 *     With the proximity aim every card peaks in its own window: CA/CB **0.53** (~13% of a lap, N·L 0.48
 *     — raking), CD **0.97** and CS **0.63** (~29%). ⚠ CD is face-on at its peak — the client-info
 *     pattern: *"the ends give SHAPE and the middle gives PRESENCE."*
 *   - ⛔ **EXPOSURE HELD AT THE AIM POINT** — `intensity = exposure × d²` every frame, d = light to aim —
 *     the model both `/start` rigs prove. Without it the pass nearest CS blows out.
 *
 * ⚠ SUPERSEDED, SAME SESSION — "THE STRIP": one POINT light on a line at the LED strip's height, 1200 mm
 * out, a slow pendulum from CA to CB. Carl, on seeing its trajectory: *"Its position and trajectory is why
 * the effect is imperceptible and why there is no effect on the floor card."* ⛔ **It met the wall pair
 * near head-on from above and never came near CD.** Kept as a note; the code is in git.
 *
 * ⚠ Frames are not the evidence — Carl: *"Its a lot different when its moving, it comes 'alive'."*
 *
 * FADERS (read once per load):
 *   ?lightmove=0      remove it (ON otherwise)
 *   ?lmsec=20         seconds per HALF lap (one light from its corner to the other): a full lap is twice this
 *   ?lmnear=200       mm off the wall at the two corners
 *   ?lmfar=700        mm off the wall a quarter-lap on (across CD and CS)
 *   ?lmbottom=0.6     where the orbit's bottom crosses CD, as a fraction of CD's height (sets the top too)
 *   ?lmcone=40        cone half-angle, degrees (penumbra 0.3, the family's)
 *   ?lmexp=0.6        exposure at the aim point — a fader that starts low
 *   ?lmhex=ffffff     colour (white: *"the scene is already warm"*)
 *   ?lmrev=0.5        the chance of turning back at each LULL (0 never, 1 always) — see `findLulls`
 *   ?lmrevsec=4       seconds a reversal takes (ease to a stop, away the other way)
 *   ?lmglobal=1       the static key and fill back ON — ⚠ OFF BY DEFAULT since 25 September (Carl: *"yes
 *                     try it, im all for experimentation"*); ambient stays
 *   ?lighthelpers=1|0 the trajectory — ON by default on LOCALHOST only
 *   ?lmdip=0          the blowout dips OFF (full intensity all the way round) — see `BLOWOUT_DIPS`
 *   ?lmfreeze=0.25    MEASUREMENT: hold both lights at this fraction of a lap (no clock, no reversals)
 *   ?lmonly=1|2       MEASUREMENT: only L1 (or L2) lit — the other's intensity is 0
 */

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ROOM_CARDS, roomPoint, type RoomCardSpec } from "./about-room";
import { neonHex, neonNumber, neonParam, wallCardsInView } from "./about-neon";

export function movingLightEnabled(): boolean {
  return neonParam("lightmove") !== "0";
}

/** `?lmglobal=1` puts the static rig back (it is OFF by default under the moving light). */
/**
 * ⛔ THE STATIC KEY AND FILL ARE OFF BY DEFAULT under the moving light — Carl, 25 September 2026: *"Turning
 * the static lights off, yes try it, im all for experimentation."* Ambient stays. `?lmglobal=1` puts the
 * static rig back. ⚠ AN EXPERIMENT, and it sits against a ruling: **the text must read under the static
 * light alone** (D-090, legibility first). The text is hidden today; when it returns, this is re-judged.
 */
export function movingLightGlobalOn(): boolean {
  return !(movingLightEnabled() && neonParam("lmglobal") !== "1");
}

type OrbitSettings = {
  halfLapMs: number;
  /** Chance of reversing at each lull, 0..1. */
  reverseChance: number;
  /** How long a reversal takes — ease to a stop and away again. */
  reverseMs: number;
  nearMm: number;
  farMm: number;
  bottomFrac: number;
  coneRad: number;
  exposure: number;
  color: string;
  helpers: boolean;
  /** MEASUREMENT (`?lmfreeze=`): a lap fraction to hold at, or null to run. */
  freeze: number | null;
  /** MEASUREMENT (`?lmonly=`): 0 = both lit, 1 = L1 only, 2 = L2 only. */
  only: 0 | 1 | 2;
  /** The blowout dips (`?lmdip=0` turns them off). */
  dips: boolean;
};

function orbitSettings(): OrbitSettings {
  return {
    halfLapMs: neonNumber("lmsec", 20, 2, 300) * 1000,
    reverseChance: neonNumber("lmrev", 0.5, 0, 1),
    reverseMs: neonNumber("lmrevsec", 4, 0.5, 30) * 1000,
    nearMm: neonNumber("lmnear", 200, 50, 3000),
    farMm: neonNumber("lmfar", 700, 50, 4000),
    bottomFrac: neonNumber("lmbottom", 0.6, -1, 2),
    coneRad: (neonNumber("lmcone", 40, 5, 85) * Math.PI) / 180,
    exposure: neonNumber("lmexp", 0.6, 0, 20),
    color: neonHex("#ffffff", "lmhex"),
    /* ⛔ ON BY DEFAULT ON LOCALHOST — Carl: *"Put the lights trajectory on the screen."* ⚠ Off anywhere
       else, so a push cannot put the diagnostic on the live site. */
    helpers: (() => {
      const v = neonParam("lighthelpers");
      if (v === "1") return true;
      if (v === "0") return false;
      return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    })(),
    /* ⚠ MEASUREMENT ONLY — the blowout scan (Carl, 25 September 2026, third session: *"watch the travelling
       light and see where it blows out the text"*) needs every lap position, repeatably. Absent → no effect. */
    freeze: neonParam("lmfreeze") === null ? null : neonNumber("lmfreeze", 0, 0, 1),
    only: neonParam("lmonly") === "1" ? 1 : neonParam("lmonly") === "2" ? 2 : 0,
    dips: neonParam("lmdip") !== "0",
  };
}

/**
 * ⛔⛔ THE BLOWOUT DIPS — Carl, 25 September 2026 (third session): *"Where it blows out, dial it down and as you
 * approach these points dial it down gradually, then back up when not blowing text out. we still want some
 * effect on the face."* And: *"This doesnt have to be perfect now, we have rim lights to add."*
 *
 * ⚠ WHAT BLOWS OUT IS THE REFLECTED HOTSPOT — the light mirrored in the glossy dome, about a word wide, turning
 * white letters white-on-white. Found by holding ONE light at 50 lap positions (`?lmfreeze`, `?lmonly=1`) with
 * every card's text static (`live-work/scripts/light-blowout-scan.mjs`; frames in `live-work/screenshots/
 * blowout-scan-25-september/`). ⚠ Whole-card contrast NEVER fell (the light adds more than it takes, card-wide),
 * so the four points were read off the FRAMES, the figures as a guide: each is where a light is nearest a card.
 *   CA ~7%  — the left ends of "the", "Architect", "design" wash white
 *   CD ~28% — a hotspot over "brand"; mild
 *   CB ~57% — "the site." and "environment"
 *   CS ~73% — "website. This" and "to serve,"
 * ⚠ CA/CB and CD/CS sit HALF A LAP APART — the orbit's point symmetry, found not placed.
 *
 * `at` is a position ON THE ORBIT (a fraction of a lap from CA's top-left, L1's start), so the dip belongs to
 * the PLACE and applies to whichever light passes it — and a reversal changes nothing. Each is a raised cosine:
 * full intensity outside ±`half`, easing down to `floor` at `at` and back up (§14a: legato, no toggle). At the
 * default 40 s lap, ±0.08 is ±3.2 s either side. ⚠ TAKES, for Carl's eye moving — the floors keep light on
 * the face (*"we still want some effect"*); CD dips least because it blows out least.
 */
const BLOWOUT_DIPS: { card: string; at: number; half: number; floor: number }[] = [
  { card: "CA", at: 0.07, half: 0.08, floor: 0.3 },
  { card: "CD", at: 0.28, half: 0.08, floor: 0.6 },
  { card: "CB", at: 0.57, half: 0.08, floor: 0.3 },
  { card: "CS", at: 0.73, half: 0.08, floor: 0.3 },
];

/** The intensity multiplier at an orbit position (0..1 of a lap): 1, except inside a dip. Dips never stack — the deepest wins. */
function blowoutDim(pos: number): number {
  let m = 1;
  for (const d of BLOWOUT_DIPS) {
    const off = Math.abs(((pos - d.at + 1.5) % 1) - 0.5); // circular distance, 0..0.5
    if (off >= d.half) continue;
    const bump = 0.5 * (1 + Math.cos((Math.PI * off) / d.half)); // 1 at the point, 0 at the edge, flat at both
    m = Math.min(m, 1 - (1 - d.floor) * bump);
  }
  return m;
}

/** Room mm: u along the back wall, v up from the floor, w out from the wall. */
type RoomMm = [number, number, number];

const cardCentre = (c: RoomCardSpec): RoomMm => [c.uLeftMm + c.widthMm / 2, c.bottomMm + c.heightMm / 2, c.offWallMm];
const CARD_CENTRES: RoomMm[] = Object.values(ROOM_CARDS).map(cardCentre);

/**
 * ⛔ THE ORBIT, derived from the cards. Centre: the wall pair's centre. Height: `b` puts the bottom across
 * CD at `bottomFrac` of its height (the top follows, the same distance above). Width: whatever makes the
 * ellipse pass through CA's top-left corner — and so, by symmetry, CB's bottom-right.
 */
function orbitGeometry(s: OrbitSettings) {
  const { CA, CB, CD } = ROOM_CARDS;
  const cu = (CA.uLeftMm + CB.uLeftMm + CB.widthMm) / 2;
  const cv = CA.bottomMm + CA.heightMm / 2;
  const du = CA.uLeftMm - cu;
  const dv = CA.bottomMm + CA.heightMm - cv;
  const b = cv - CD.heightMm * s.bottomFrac;
  const a = Math.abs(du) / Math.sqrt(Math.max(1e-6, 1 - (dv / b) ** 2));
  const phi0 = Math.atan2(dv / b, du / a); // CA's top-left: where L1 starts
  const at = (phi: number): RoomMm => [
    cu + a * Math.cos(phi),
    cv + b * Math.sin(phi),
    s.nearMm + (s.farMm - s.nearMm) * Math.sin(phi - phi0) ** 2,
  ];
  return { at, phi0 };
}

/** ⛔ The aim: the card centres weighted by 1/distance⁴ from the light — it looks at the card it passes. */
function aimAt(p: RoomMm): RoomMm {
  let sw = 0;
  const acc: RoomMm = [0, 0, 0];
  for (const c of CARD_CENTRES) {
    const d = Math.max(Math.hypot(c[0] - p[0], c[1] - p[1], c[2] - p[2]), 1);
    const wgt = 1 / d ** 4;
    sw += wgt;
    for (let i = 0; i < 3; i++) acc[i] += wgt * c[i];
  }
  return acc.map((x) => x / sw) as RoomMm;
}

const toWorld = (p: RoomMm) => new THREE.Vector3(...roomPoint(p[0], p[1], p[2]));

/**
 * ⛔⛔ THE LULLS — where the lights may turn back. Carl, 25 September 2026: *"To make it interesting there
 * is a point when between cards theres hardly anything going on. It can be reversed, given an element of
 * randomness."*
 *
 * ⚠ FOUND, NOT PLACED. "Activity" is the brightest card at each moment of the lap (either light, inside
 * its cone, exposure at the aim); the lulls are its local minima below `LULL_LEVEL` of the peak. With the
 * default orbit there are two, at **41% and 91% of a lap, at 3% of peak** — both lights travelling between
 * cards. The shallower dips (22–26% of peak, at 20/48.5/70/98.5%) still have a card lit and are NOT lulls.
 * (`live-work/scripts/orbit-design.mjs` prints the same table.) ⚠ Derived from the live settings, so a
 * fader that reshapes the orbit moves the lulls with it.
 *
 * ⛔ **A reversal is only ever made where nothing is lit to see it turn** — so the reader sees no hesitation,
 * only that the next card to wake is not the one the pattern promised.
 */
const LULL_LEVEL = 0.1;
function findLulls(
  orbit: ReturnType<typeof orbitGeometry>,
  coneRad: number,
): number[] {
  const N = 720;
  const cardCentres = CARD_CENTRES.map((c) => toWorld(c));
  const activity: number[] = [];
  for (let i = 0; i < N; i++) {
    let best = 0;
    for (const L of [0, 1]) {
      const pRoom = orbit.at(orbit.phi0 + Math.PI * L + (2 * Math.PI * i) / N);
      const P = toWorld(pRoom);
      const T = toWorld(aimAt(pRoom));
      const axis = T.clone().sub(P);
      const exposureAtCard = (c: THREE.Vector3) => {
        const toCard = c.clone().sub(P);
        if (axis.angleTo(toCard) >= coneRad) return 0;
        const out = toWorld([0, 0, 1000]).sub(toWorld([0, 0, 0])); // the cards' normal, 1 m
        const ndl = -toCard.dot(out) / toCard.length();
        return ndl > 0 ? (axis.lengthSq() / toCard.lengthSq()) * ndl : 0;
      };
      for (const c of cardCentres) best = Math.max(best, exposureAtCard(c));
    }
    activity.push(best);
  }
  const peak = Math.max(...activity);
  return activity
    .map((v, i) => ({ v, i }))
    .filter(({ v, i }) => v < LULL_LEVEL * peak && v < activity[(i + N - 1) % N] && v <= activity[(i + 1) % N])
    .map(({ i }) => i / N);
}

/** ⚠ Reduced motion: a still frame an eighth of a lap in — CA's (and CB's) raking moment. */
const REDUCED_MOTION_LAP = 0.125;

/**
 * ⛔⛔ THE DOWNBEAT IS OFF FOR NOW — Carl, 25 September 2026: *"The trigger mechanism is still going to be
 * used but its going to be changed. Dont delete or remove it, just make sure it has no impact at the
 * moment. I need to see the lights movement."* The lights start as soon as the canvas is on screen. The
 * landing trigger (`wallCardsInView`) and the code that waits on it are KEPT — flip this to `true` when the
 * reworked trigger lands. ⚠ The DECISION stands (D-090); only its wiring is parked.
 */
const DOWNBEAT_ON_LANDING = false;

/** Helper colours — cool, so nothing can be mistaken for the warm room. L1 cyan, L2 magenta. */
const HELPER_ORBIT = "#35e0ff";
const HELPER_LIGHT = ["#35e0ff", "#ff5fd2"] as const;

export function AboutMovingLight() {
  const s = useMemo(() => orbitSettings(), []);
  const orbit = useMemo(() => orbitGeometry(s), [s]);
  const l1 = useRef<THREE.SpotLight | null>(null);
  const l2 = useRef<THREE.SpotLight | null>(null);
  const t1 = useRef<THREE.Object3D | null>(null);
  const t2 = useRef<THREE.Object3D | null>(null);
  const gl = useThree((st) => st.gl);
  const scene = useThree((st) => st.scene);
  const invalidate = useThree((st) => st.invalidate);

  useEffect(() => {
    const pairs = [
      [l1.current, t1.current],
      [l2.current, t2.current],
    ] as const;
    if (pairs.some(([l, t]) => !l || !t)) return;

    /**
     * ⚠ A spot's direction comes from `target.matrixWorld`, and the target must be in the scene graph or
     * its matrix never updates (the trap both `/start` rigs record). The targets are `<object3D>`s below.
     */
    const place = (lapFraction: number) => {
      pairs.forEach(([light, target], i) => {
        const phi = orbit.phi0 + Math.PI * i + 2 * Math.PI * lapFraction;
        const p = orbit.at(phi);
        const q = aimAt(p);
        const P = toWorld(p);
        const Q = toWorld(q);
        light!.position.copy(P);
        target!.position.copy(Q);
        target!.updateMatrixWorld(true);
        light!.target = target!;
        /* ⛔ EXPOSURE HELD AT THE AIM POINT: intensity × 1/d² at the aim = exposure. */
        /* ⛔ …× THE BLOWOUT DIP at this light's own place on the orbit (`BLOWOUT_DIPS`). */
        const dim = s.dips ? blowoutDim((((lapFraction + i / 2) % 1) + 1) % 1) : 1;
        light!.intensity = s.only && s.only !== i + 1 ? 0 : s.exposure * P.distanceToSquared(Q) * dim;
        light!.updateMatrixWorld(true);
      });
    };

    if (s.freeze !== null) {
      place(s.freeze);
      invalidate();
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      place(REDUCED_MOTION_LAP);
      invalidate();
      return;
    }
    place(0);
    invalidate();

    /**
     * ⚠ THE LOOP RUNS ONLY WHILE THE CANVAS IS ON SCREEN AND THE TAB IS VISIBLE — `invalidate()` every
     * frame makes this demand-mode canvas render continuously, glass transmission and all (the Q+A once
     * rendered five glass cards at 60fps, unseen, for ~12 s). ⚠ The clock counts VISIBLE time only.
     */
    let onScreen = false;
    const io = new IntersectionObserver((entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
    });
    io.observe(gl.domElement);

    let started = !DOWNBEAT_ON_LANDING;
    let last = performance.now();
    let raf = 0;
    const lapMs = 2 * s.halfLapMs;

    /**
     * ⛔ THE CLOCK IS A PHASE WITH A DIRECTION, so it can turn back. `phase` is unwrapped (it can run past 1
     * or below 0); `dir` is +1 (anticlockwise on screen, Carl's direction) or −1.
     *
     * ⛔ A REVERSAL IS LEGATO, NEVER A SNAP (§14a): the speed follows `dir · cos(π·τ/reverseMs)` — it eases
     * to a stop half way and away the other way by the end. At the default 20 s half-lap and 4 s turn the
     * lights overrun the lull by ~1.6% of a lap before coming back — still inside it.
     *
     * ⚠ THE COIN IS TOSSED ONCE PER LULL CROSSING, and the lull just turned at is skipped on the way back
     * (`lastCrossing`) — otherwise the lights would re-toss the instant they came back through it.
     */
    const lulls = findLulls(orbit, s.coneRad);
    let phase = 0;
    let dir = 1;
    let reversing: { fromDir: number; startMs: number } | null = null;
    let lastCrossing = "";
    let visibleMs = 0;
    const crossingId = (prev: number, next: number): string | null => {
      for (let i = 0; i < lulls.length; i++) {
        const a = Math.floor(prev - lulls[i]);
        const b = Math.floor(next - lulls[i]);
        if (a !== b) return `${i}:${Math.max(a, b)}`;
      }
      return null;
    };

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!started && wallCardsInView(gl.domElement)) {
        started = true;
        performance.mark("movinglight:downbeat");
      }
      if (started && onScreen && document.visibilityState === "visible") {
        const step = Math.min(dt, 100); // a stalled frame must not throw the lights across the room
        visibleMs += step;
        let speed = dir;
        if (reversing) {
          const tau = visibleMs - reversing.startMs;
          if (tau >= s.reverseMs) {
            dir = -reversing.fromDir;
            reversing = null;
            speed = dir;
          } else {
            speed = reversing.fromDir * Math.cos((Math.PI * tau) / s.reverseMs);
          }
        }
        const next = phase + (speed * step) / lapMs;
        const crossed = reversing ? null : crossingId(phase, next);
        if (crossed && crossed !== lastCrossing) {
          lastCrossing = crossed;
          if (Math.random() < s.reverseChance) {
            reversing = { fromDir: dir, startMs: visibleMs };
            performance.mark("movinglight:reverse");
          }
        }
        phase = next;
        place(((phase % 1) + 1) % 1);
        invalidate();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [orbit, s, gl, invalidate]);

  /**
   * ⛔ THE TRAJECTORY ON SCREEN (localhost by default). ⚠ A line in the air cannot be read on its own, so:
   *   - the ORBIT (bright cyan) and its SHADOW ON THE BACK WALL (faint) — the same ellipse pushed flat
   *   - per light: a BALL (white), its AIM LINE to the point it looks at (L1 cyan, L2 magenta), and a
   *     TETHER to its foot on the wall
   * ⚠ Read back from the lights themselves every frame — the helpers never recompute a phase, so they
   * cannot drift from what the lights do. Drawn over everything (`depthTest: false`): a diagnostic.
   */
  useEffect(() => {
    if (!s.helpers) return;
    const disposables: Array<{ dispose(): void }> = [];
    const objects: THREE.Object3D[] = [];
    const lineMat = (color: string, opacity: number) => {
      const m = new THREE.LineBasicMaterial({ color, depthTest: false, transparent: true, opacity });
      disposables.push(m);
      return m;
    };
    const line = (pts: THREE.Vector3[], m: THREE.Material, loop = false) => {
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      disposables.push(g);
      const l = loop ? new THREE.LineLoop(g, m) : new THREE.Line(g, m);
      l.renderOrder = 999;
      /* ⛔ NEVER FRUSTUM-CULLED. The aim and tether lines are born with zero length at the origin, and
         `setFromPoints` moves their points without refreshing the bounding sphere — so three culled them
         as off-screen and they never drew (seen on the first frame of the orbit). */
      l.frustumCulled = false;
      objects.push(l);
      return l;
    };
    const ball = (radius: number, color: string) => {
      const g = new THREE.SphereGeometry(radius, 16, 16);
      const m = new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.95 });
      disposables.push(g, m);
      const b = new THREE.Mesh(g, m);
      b.renderOrder = 1000;
      objects.push(b);
      return b;
    };

    const N = 128;
    const ring = Array.from({ length: N }, (_, i) => orbit.phi0 + (2 * Math.PI * i) / N);
    line(ring.map((phi) => toWorld(orbit.at(phi))), lineMat(HELPER_ORBIT, 0.95), true);
    line(ring.map((phi) => { const p = orbit.at(phi); return toWorld([p[0], p[1], 0]); }), lineMat(HELPER_ORBIT, 0.35), true);

    /* ⛔ THE LULLS, marked on the orbit (amber) — where the lights may turn back. */
    for (const lull of findLulls(orbit, s.coneRad)) {
      ball(0.03, "#ffc233").position.copy(toWorld(orbit.at(orbit.phi0 + 2 * Math.PI * lull)));
    }

    const intoWall = toWorld([0, 0, 0]).sub(toWorld([0, 0, 1000])); // 1 m toward the wall
    const perLight = [0, 1].map((i) => ({
      ball: ball(0.035, "#ffffff"),
      foot: ball(0.022, HELPER_LIGHT[i]),
      aim: line([new THREE.Vector3(), new THREE.Vector3()], lineMat(HELPER_LIGHT[i], 0.9)),
      tether: line([new THREE.Vector3(), new THREE.Vector3()], lineMat(HELPER_LIGHT[i], 0.45)),
    }));
    scene.add(...objects);

    const wallFoot = new THREE.Vector3();
    const target = new THREE.Vector3();
    let raf = 0;
    const follow = () => {
      [l1.current, l2.current].forEach((light, i) => {
        if (!light) return;
        const h = perLight[i];
        h.ball.position.copy(light.position);
        light.target.getWorldPosition(target);
        h.aim.geometry.setFromPoints([light.position, target]);
        /* The foot: the light pushed straight back onto the wall by its own distance off it. */
        const off = light.position.clone().sub(toWorld([0, 0, 0])).dot(intoWall.clone().negate());
        wallFoot.copy(light.position).addScaledVector(intoWall, off);
        h.foot.position.copy(wallFoot);
        h.tether.geometry.setFromPoints([wallFoot, light.position]);
      });
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);
    invalidate();
    return () => {
      cancelAnimationFrame(raf);
      scene.remove(...objects);
      disposables.forEach((d) => d.dispose());
    };
  }, [s.helpers, s.coneRad, orbit, scene, invalidate]);

  const spot = (ref: RefObject<THREE.SpotLight | null>) => (
    <spotLight ref={ref} color={s.color} angle={s.coneRad} penumbra={0.3} decay={2} distance={0} />
  );
  return (
    <>
      <object3D ref={t1} />
      <object3D ref={t2} />
      {spot(l1)}
      {spot(l2)}
    </>
  );
}
