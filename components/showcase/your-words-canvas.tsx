"use client";

/**
 * ⛔ FILM 4's PAGE — ONE PIECE's CANVAS (D-088, 23 October 2026, session 2; the structural note
 * `live-work/structural-note-showcase-two-viewports-23-october.md` v2, option A: A CANVAS PER PIECE, each in its own
 * viewport, scrolling with it). Loaded ONLY through `your-words-section.tsx`'s `next/dynamic(…, { ssr: false })`: this module
 * is where three.js enters, never the SSR'd section — the ornate corners' pattern (`corner-frame.tsx` / `corner-canvas.tsx`).
 *
 * - ⛔ THE WORDS ARE THE BENCH's, BUILT BY THE BENCH's CODE (`lettering-hooks.tsx` — one mechanism): measured in the DOM
 *   (`MeasureSpans`, `aria-hidden` here — the section holds the accessible text), the font proved before anything is built,
 *   the arch's collisions checked. A failed check is a FAILURE (`onFailed` → the section shows the words as text).
 *   ⛔ ASSERTED: the words the section shows and the words built here must agree (case-insensitive — the arch is set in
 *   capitals); a mismatch fails loudly rather than reading one thing and drawing another.
 * - ⛔ THE MATERIAL: the one brushed brass (`BRUSHED_BRASS`) on both pieces — Carl: *"2 different elements with the same
 *   material that will differ with the use of light and movement."* The light until pass 3: the JUDGING STUDIO alone
 *   (`JUDGING_STUDIO` — the line 305°, the arch 355°, room 0.1), framed as the bench's material front (`frontDistance`, so
 *   the measured balance holds). Neutral tone mapping — a judging choice; the page's is pass 3's.
 *   PASS 3: viewport 1's static light is BUILT and APPROVED (`SignLamps`, R-092). Viewport 2's travelling light is PARKED
 *   (Carl, 26 October); in its place the CAMERA moves (`Journey`) under lamps on the orbit's axis (`AxisLamps`).
 *   ⚠ Was, 23 October: "PASS 3 IS NOT BUILT: viewport 1's static light, viewport 2's travelling light and the logo's animation".
 * - ⛔ FRAMES: `frameloop="demand"` — a frame when something changes, then nothing. The line is still. The arch's journey
 *   mounts the family `Ticker` (frames only while on screen — `whoweare-button-scene.tsx`); `?cam=0` or `?t=` keep it still.
 * - ⛔ THE STUDIO's PREFILTER AND THE SHADERS COMPILE WITHOUT BLOCKING — `usePrefilteredStudio` and `whenLinked`, REUSED from
 *   `corner-canvas.tsx` (D-100: a ~1 s main-thread freeze otherwise). The piece stays `visible={false}` until every program
 *   reports linked; `onReady` fires after the first frame drawn with it.
 * - ⛔ FAILURE → `onFailed`: anything thrown inside the canvas (`Guard`), a lost context, the font check, a collision.
 * - ⛔ LIFTED (26 October 2026, the camera bench's note v3): the build, the brass, the compile gate and the lamps now live in
 *   `lettering-piece.tsx` (`LetteringPiece`, `usePieceBuild`, `measurePiece`), shared with `/proto/camera`. THIS file keeps
 *   what is the PAGE's: its camera (`PageCamera`), the journey (`journeyPose`, `Journey`), the words' assertion, the canvas.
 *   Proved pixel-identical before and after (eight frames — `live-work/scripts/film04-lift-compare-26-october.mjs`).
 */
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useCanvasDpr } from "@/lib/use-site-scale";
import { Ticker } from "@/components/home/whoweare-button-scene";
import { FRONT_FOV, MeasureSpans } from "./lettering-hooks";
import {
  Guard,
  LetteringPiece,
  measurePiece,
  NeutralToneMapping,
  usePieceBuild,
  type Built,
  type Piece,
} from "./lettering-piece";

export type { Piece } from "./lettering-piece";

/**
 * ⛔ VIEWPORT 2's CAMERA — THE JOURNEY (Carl, 26 October 2026, after learning the camera can move — D-098, D-101): *"The
 * camera can start face on and orbit the object. When it reaches the same position but at the back, try flying it through
 * the arch. as it goes through have the camera turn to face the object as move backwards to its original position."*
 * The travelling light is PARKED (Carl, the same day).
 *
 * One loop, time-driven, its clock running ONLY while frames are drawn (on screen — the family `Ticker`), so the journey
 * resumes where it was left rather than jumping:
 *   HOLD face-on → ORBIT 180° about the arch's vertical axis (through its centre and the middle of its depth) to the same
 *   distance behind → REST → FLY through the opening at the CENTRE OF THE CURVE (`reading.curveCentre`), dipping to its
 *   height at the crossing, passing DIRECTLY UNDER THE CROWN LETTER (the N); it comes out facing the arch and backs away
 *   to the start.
 * ⛔ THE TURN IS A TILT (Carl, take 3): *"As it approaches the arch/doorway from behind there will come a point when the
 *   letters are out of view. so as it approaches, tilt the camera upwards to focus on the underside of the N and then as its
 *   immediately underneath the N reverse the process so the camera then is essentially backing away from the object and
 *   tilting back to its horizontal position as other letters come into view."* So the camera AIMS: level at the arch's
 *   centre, then — from the distance at which the N would leave the top of a level frame — its aim slides up to the N's
 *   underside, straight up as it passes beneath; out the other side the aim slides back down to the centre.
 *   ⛔ THE 180° IS SPENT WHERE IT CANNOT BE SEEN AS A PAN: facing the back on the way in and the front on the way out
 *   needs a half turn, and it is made ONLY while the camera looks almost straight up (pitch ≥ `spinAboveDeg`) — so on
 *   screen it is the N's underside turning in place overhead, not a sideways swing. The orbit turns the camera 180° and
 *   this turn another 180° the SAME way — one full turn per loop, so the loop closes on the first frame. (A 180° slerp
 *   takes the "shortest" way, undefined at exactly 180° — the angles are driven directly, rotation order YXZ.)
 * ⚠ THE BUILDER's PRESENTATION CHOICES, stated (Carl set the path and the tilt, not the pace): the durations below,
 *   smootherstep eases on every move, the drift through the doorway (`drift`), where the tilt begins (`tiltFrom`), the
 *   spin threshold. Carl's to change.
 * Switches: `?cam=0` the still front (as before); `?t=` frozen at that many seconds into the loop (stills, captures).
 * Reduced motion: the still front.
 */
// TAKE 1 turned by PANNING after the crossing (45–85% of the flight) and looked out into empty space for ~2 s, a black
// frame; TAKE 2 centred the pan on the doorway and slowed the flight through it — still black but for the instant the pan
// faced a leg: at the 30° lens the opening's middle is empty and the legs stand ~230 px either side, out of frame.
// TAKE 3 is Carl's tilt (above). `drift`: how much of the flight's straight-line speed is taken out at the crossing
// (0 none; 1 a full stop under the N) — 0.95 so it LINGERS beneath the N while the overhead turn is made.
// `tiltFrom`: the tilt begins this many times the distance at which the N's underside would leave a level frame's top.
// ⛔ APPROVED (R-093, *"Yes, its approved"*): take 3 — the journey AND its light (`AxisLamps`) as below. Carl: *"This looks so
// good an both unlocks and unleashes bags of potential. To be used both sparingly and appropriately."*
const JOURNEY = { hold: 3, orbit: 12, rest: 1.5, fly: 14, drift: 0.95, tiltFrom: 1.3, spinAboveDeg: 80 };
const JOURNEY_S = JOURNEY.hold + JOURNEY.orbit + JOURNEY.rest + JOURNEY.fly;
const ease = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (6 * x - 15) + 10);
};
/** smoothstep — the flight's clock: gentler at the crossing than smootherstep, so the turn is not a whip */
const easeSoft = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
type Pose = { x: number; y: number; z: number; yaw: number; pitch: number };
/** The camera at `t` s into the loop: its position, its turn about the vertical (three's `rotation.y`; 0 looks −z) and its
 *  tilt (`rotation.x`; + looks up). `r` the orbit's radius, `zc` the depth's middle, `cy` the curve centre's height, `n` the
 *  N's underside (its middle) — layout px, the arch's centre at (0, 0, zc). */
export function journeyPose(t: number, r: number, zc: number, cy: number, n: { x: number; y: number }): Pose {
  const J = JOURNEY;
  let u = ((t % JOURNEY_S) + JOURNEY_S) % JOURNEY_S;
  if (u < J.hold) return { x: 0, y: 0, z: zc + r, yaw: 0, pitch: 0 };
  u -= J.hold;
  if (u < J.orbit) {
    const th = Math.PI * ease(u / J.orbit);
    return { x: r * Math.sin(th), y: 0, z: zc + r * Math.cos(th), yaw: th, pitch: 0 };
  }
  u -= J.orbit;
  if (u < J.rest) return { x: 0, y: 0, z: zc - r, yaw: Math.PI, pitch: 0 };
  u -= J.rest;
  const s = easeSoft(u / J.fly);
  // −1 behind → 0 under the N → +1 at the start; the cubic share slows it through the doorway without stopping it
  const c = 2 * s - 1;
  const f = (1 - J.drift) * c + J.drift * c * c * c;
  const bump = Math.sin(Math.PI * s);
  // the path: dipping to the curve centre's height, sliding sideways to pass directly beneath the N
  const x = n.x * bump, y = cy * bump, z = zc + r * f;
  const hd = Math.abs(z - zc);
  // ⛔ THE AIM: level at the arch's centre (0, 0) far out; the N's underside within `tiltFrom` × the distance at which it
  // would leave a level frame's top — the slide eased, so the tilt starts gently
  const half = Math.tan(((FRONT_FOV / 2) * Math.PI) / 180);
  const reach = Math.min(0.8 * r, (J.tiltFrom * Math.max(1, n.y - y)) / half);
  const w = ease(1 - hd / reach);
  const aimY = w * n.y;
  const pitch = Math.atan2(aimY - y, Math.max(hd, 1e-3));
  // ⛔ THE HALF TURN, made only while the camera looks nearly straight up: over the stretch where the N is above
  // `spinAboveDeg`, signed by which side of the arch the camera is on
  const spinHalf = Math.max(1, (n.y - y) / Math.tan((J.spinAboveDeg * Math.PI) / 180));
  const k = ease(0.5 + (z - zc) / (2 * spinHalf));
  return { x, y, z, yaw: Math.PI + Math.PI * k, pitch };
}
function readJourney(): { on: boolean; frozen: number | null } {
  const q = new URLSearchParams(window.location.search);
  const t = q.get("t");
  const still = q.get("cam") === "0" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return { on: !still, frozen: t !== null && Number.isFinite(Number(t)) ? Number(t) : null };
}

/** Drives the default camera along the journey once the arch is drawn (`running`) — `journeyPose`'s arguments.
 *  ⚠ SINCE THE LIFT (26 October): `running` is the piece's `onReady` (it no longer shares the scene's `linked`), so a FROZEN
 *  pose (`?t=`) is applied from the first frame — before the piece shows, while it is invisible — and the live clock starts
 *  on the frame after the first drawn one (a frame's difference; the pixel check covers the frozen frames). */
function Journey({ running, r, zc, cy, n, frozen }: {
  running: boolean;
  r: number;
  zc: number;
  cy: number;
  n: { x: number; y: number };
  frozen: number | null;
}) {
  const clock = useRef(0);
  useFrame((st, delta) => {
    if (frozen === null) {
      if (!running) return;
      // ⚠ the clock advances only on drawn frames, and never by more than a frame's worth — no jump after time off screen
      clock.current += Math.min(delta, 0.05);
    }
    const p = journeyPose(frozen ?? clock.current, r, zc, cy, n);
    st.camera.position.set(p.x, p.y, p.z);
    // YXZ: turn about the vertical first, then tilt — the tilt stays a tilt whichever way the camera faces
    st.camera.rotation.set(p.pitch, p.yaw, 0, "YXZ");
    st.camera.updateMatrixWorld();
  });
  return null;
}

/** The page's camera — the lifted `Scene`'s, unchanged: face-on at the piece's front distance, the bench's 30° lens,
 *  `near` 1, `far` d × 10. Made default here, BEFORE `LetteringPiece` compiles against it (it renders first). */
function PageCamera({ piece, built }: { piece: Piece; built: Built }) {
  const size = useThree((s) => s.size);
  const { d } = measurePiece(piece, built, size);
  return <PerspectiveCamera makeDefault position={[0, 0, d]} fov={FRONT_FOV} near={1} far={d * 10} />;
}

/** Viewport 2's journey, from the piece's measurements (`measurePiece`). */
function ArchJourney({ built, running }: { built: Built; running: boolean }) {
  const size = useThree((s) => s.size);
  const [journey] = useState(readJourney);
  if (!journey.on) return null;
  const m = measurePiece("arch", built, size);
  return (
    <>
      {journey.frozen === null && <Ticker />}
      <Journey running={running} r={m.d - m.zc} zc={m.zc} cy={m.curveCentre!.y} n={m.crown!} frozen={journey.frozen} />
    </>
  );
}

export default function YourWordsCanvas({ piece, words, onReady, onFailed }: {
  piece: Piece;
  /** the words the section shows as text — asserted against the words built here */
  words: string;
  onReady: () => void;
  onFailed: (why: string) => void;
}) {
  const dpr = useCanvasDpr([1, 2]);
  const { spec, lines, spans, shown, failure, words: builtWords } = usePieceBuild(piece);
  const [drawn, setDrawn] = useState(false);
  const ready = useCallback(() => {
    setDrawn(true);
    onReady();
  }, [onReady]);

  // ⛔ the words asserted, the checks enforced — each a failure in plain words (the section logs it and shows the text)
  const built = builtWords.toLowerCase();
  const why = built !== words.toLowerCase() ? `the words built ("${built}") are not the words shown ("${words}")` : failure;
  useEffect(() => {
    if (why) onFailed(why);
  }, [why, onFailed]);

  return (
    <>
      <MeasureSpans lines={lines} fontKey={spec.font} spans={spans} accessible={false} />
      <Guard onFailed={() => onFailed("the canvas threw")}>
        <Canvas
          gl={{ antialias: true, alpha: true }}
          resize={{ offsetSize: true }}
          dpr={dpr}
          frameloop="demand"
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", () => onFailed("the WebGL context was lost"), { once: true });
          }}
        >
          <NeutralToneMapping />
          <Suspense fallback={null}>
            {shown && (
              <>
                <PageCamera piece={piece} built={shown} />
                {piece === "arch" && <ArchJourney built={shown} running={drawn} />}
                <LetteringPiece piece={piece} built={shown} onReady={ready} />
              </>
            )}
          </Suspense>
        </Canvas>
      </Guard>
    </>
  );
}
