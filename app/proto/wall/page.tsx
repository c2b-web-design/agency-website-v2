"use client";

/* ⛔⛔ THROWAWAY DEVELOPMENT TOOL — 4 September 2026. DELETE WHEN IT HAS DONE ITS JOB.

   WHAT IT IS FOR: pinning the four corners of a card onto the walls of the `/about`
   §2 room photograph, and emitting the CSS that reproduces that placement.

   ⚠⚠ WHY IT EXISTS: the Builder cannot see. It spent a session measuring the
   ceiling/wall boundary by eye and by pixel detection, produced FOUR different
   angles (2, 2.44, 3.67, 5.19 deg), and each time verified the result against its
   own wrong figure — so the check could never fail. Carl found the fault in one
   move: lift a supposedly-parallel line onto the ceiling seam and see whether it
   traces it. It did not.

   ⛔ THIS TOOL REMOVES THE BUILDER'S MEASUREMENT FROM THE LOOP ENTIRELY. Carl drags
   the corners to where he can see they belong; the homography is exact arithmetic
   from those four points. Nothing is estimated.

   ⚠ IT DOES NOT REMOVE THE BUILDER FROM VERIFICATION — only Carl can confirm the
   result sits on the wall. Stated so it is not discovered later.

   ⛔ PRECEDENT: D-053's `?tealstrength=` dial — a development instrument that
   produced a number by eye; the number went into the code and the dial was retired.

   ⛔⛔ FOUR CORRECTIONS TO THE SUPPLIED DRAFT, each one a real defect:

   1. THE WORKSPACE MUST CROP THE IMAGE EXACTLY AS `/about` DOES. The draft used an
      800x600 box with `background-size: cover`; `/about` is full-bleed `object-cover`
      at the viewport. DIFFERENT CROPS — corners pinned here would land elsewhere
      there. ⚠ THIS IS THE EXACT TRAP THAT COST THE PREVIOUS SESSION: geometry
      derived in the source file's coordinate space, applied to a cropped view.
      Fixed by rendering the same <Image fill object-cover> inside a box whose
      aspect ratio is settable to match the target viewport.

   2. THE IMAGE PATH was `/images/room-background.jpg`, which does not exist. The
      file is `/about-studio-source.jpg`. It would have failed as a blank box.

   3. OUTPUT IS NORMALISED (0-1 of the image box), NOT RAW PIXELS. A matrix is a
      dead end the moment anything moves; fractional corners survive a viewport
      change and can be re-edited. Both are emitted.

   4. TWO CARDS, NOT ONE. CA and CB are pinned in the same session because Carl's
      constraint — EQUAL DROP FROM THE CEILING FOR BOTH — cannot be held by pinning
      them independently one after the other. The tool shows both at once.

   ⚠ `transform-style: preserve-3d` is set on the stage so the perspective divide in
   the matrix is not flattened to an affine skew. Without it the g/h terms can be
   dropped and the result is a parallelogram — the same wrong shape, arrived at a
   new way. */

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Pt = { x: number; y: number };

/* ⛔ FOUR CARDS, TWO PAIRS, AND THE PAIRS ARE NOT THE SAME KIND OF THING.
   CA/CB are calculated wall placements; CD/CS are Carl's hand placement on the
   floor. `kind` keeps that distinction visible in the UI and in the output, so
   nobody reads a dragged floor number as a solved one. */
type CardKey = "CA" | "CB" | "CD" | "CS";
type Kind = "wall" | "floor";

const CARDS: CardKey[] = ["CA", "CB", "CD", "CS"];

const META: Record<CardKey, { label: string; kind: Kind; fill: string; line: string }> = {
  CA: { label: "The Architect", kind: "wall", fill: "rgba(80,180,255,0.22)", line: "#5cf" },
  CB: { label: "The Builder", kind: "wall", fill: "rgba(255,180,80,0.22)", line: "#fb4" },
  CD: { label: "The Designer", kind: "floor", fill: "rgba(150,255,170,0.20)", line: "#7fa" },
  CS: { label: "The Strategist", kind: "floor", fill: "rgba(230,150,255,0.20)", line: "#d9f" },
};

/* The un-transformed card. The homography maps this rectangle onto the four pinned
   corners, so these are the card's own coordinates, not screen sizes. */
const CARD_W = 420;
const CARD_H = 260;

/* Homography from the CARD_W x CARD_H rectangle to four arbitrary corners.
   Standard projective mapping; corners are TL, TR, BR, BL. */
function matrixFor(c: Pt[]): string {
  /* Before the stage has been measured the corner arrays are empty; identity
     keeps the card off-screen-safe rather than emitting NaNs. */
  if (c.length !== 4) return "matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1)";
  const [p0, p1, p2, p3] = c;
  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const dy3 = p0.y - p1.y + p2.y - p3.y;

  const det = dx1 * dy2 - dy1 * dx2;
  let g = 0;
  let h = 0;
  if (Math.abs(det) > 1e-9) {
    g = (dx3 * dy2 - dy3 * dx2) / det;
    h = (dx1 * dy3 - dy1 * dx3) / det;
  }

  const a = p1.x - p0.x + g * p1.x;
  const b = p3.x - p0.x + h * p3.x;
  const c0 = p0.x;
  const d = p1.y - p0.y + g * p1.y;
  const e = p3.y - p0.y + h * p3.y;
  const f = p0.y;

  const n = (v: number) => (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(6));

  return `matrix3d(${n(a / CARD_W)}, ${n(d / CARD_W)}, 0, ${n(g / CARD_W)}, ${n(
    b / CARD_H
  )}, ${n(e / CARD_H)}, 0, ${n(h / CARD_H)}, 0, 0, 1, 0, ${n(c0)}, ${n(f)}, 0, 1)`;
}

/* ⛔ CARL'S POSITIONS — held as FRACTIONS of the stage so they survive a reload
   and a resize. Pixels would not. Order is TL, TR, BR, BL.

   ⛔⛔ CA AND CB ARE MEASURED FROM THE CALCULATED PLATE — 10 September 2026.
   NOT the 4/5 September numbers, which described a HAND-DRAWN iteration Carl has
   DISCARDED: *"the original hand drawn is discarded, the perspective is wrong."*

   ⚠⚠ SO THE DELTA CHAIN IN `live-work/wall-card-corners-4-september.md` IS
   HISTORY, NOT A SOURCE OF TRUTH. Its arithmetic is sound and its subject is
   retired. ⛔ Do not "restore" those values; do not reconcile these against them.

   HOW THESE WERE OBTAINED, so nobody re-derives them by eye: the guide quads in
   `brand-assets/about-studio-wall-cards-1800.jpg` were isolated by hue (cyan
   ~190deg sat 0.89; magenta ~310deg sat 0.67 — thresholds READ OFF THE IMAGE
   HISTOGRAM, not picked, which matters because a guessed 0.72 floor silently
   discarded 90% of the magenta stroke on the first attempt). Each quad's four
   edges were then fitted as lines and intersected. All eight edges came in under
   1px rms; corner points were excluded from the fits so the joins could not bend
   an edge.

   ⛔ THE CHECK THAT MAKES THESE TRUSTWORTHY, and it was not imposed: CA's top and
   bottom edges converge at (2523, 397); CB's at (374, 397). Opposite sides of the
   frame — as two walls receding in opposite directions must — AT THE SAME HORIZON
   HEIGHT. Vertical ratios agree independently: CA 1.317 (left edge longer), CB
   0.587 (right edge longer).

   ⚠ THESE ARE FRACTIONS OF THE 1.500 SOURCE FRAME, which is what this tool's
   stage shows. They are NOT stage fractions at 2.106 and must be mapped through
   the object-cover crop if that aspect is ever used again. */
const INITIAL_FRAC: Record<CardKey, Pt[]> = {
  CA: [
    { x: 0.17505, y: 0.16609 },
    { x: 0.46536, y: 0.20507 },
    { x: 0.46685, y: 0.35997 },
    { x: 0.19208, y: 0.36855 },
  ],
  CB: [
    { x: 0.59518, y: 0.20601 },
    { x: 0.86464, y: 0.11912 },
    { x: 0.84034, y: 0.37849 },
    { x: 0.59165, y: 0.35976 },
  ],

  /* ⛔⛔ THE FLOOR PAIR — SEEDS ONLY. NOT MEASURED, NOT CALCULATED, NOT APPROVED.
     10 September 2026. Carl sets these by dragging; these numbers exist only so
     there is something on screen to grab.

     ⚠⚠ THE WALL PAIR AND THE FLOOR PAIR ARE DIFFERENT KINDS OF NUMBER AND MUST
     NOT BE READ THE SAME WAY. CA/CB were solved against the room's perspective
     by another system. CD/CS are Carl's eye, by his ruling of 10 September:
     the floor cards stand in FRONT of a surface rather than lying ON one, so
     their placement is a design decision, not a value the photograph dictates.

     ⛔ FACE-ON, DELIBERATELY. Carl's sequence: establish size and position with
     the guide shapes facing forward, build the Three.js card in that position,
     THEN lean it back and turn it inward. The lean and the inward turn are NOT
     applied here and must not be added to this tool without his word.

     ⚠ SO THIS QUAD IS NOT AN ACCEPTANCE TEST FOR THE BUILT CARD. Both rotations
     will move the projected corners. A leaning card checked against these
     face-on corners would fail correctly and send someone fixing the wrong
     thing. It is a SIZE-AND-POSITION statement, nothing more.

     ⚠ IT DESCRIBES THE FRONT FACE, unlike the wall pair, whose pinned quad is
     the BACK face lying against the wall. A floor card stands free — there is no
     surface it is flush against — so the face Carl judges is the one he sees.
     ⛔ UNCONFIRMED BY CARL. Raised 10 September; if it is wrong the card sits
     out by its own depth.

     Placement, from Carl's brief of 10 September:
       CD  left floor, SET FURTHER BACK — the space left of the left chair,
           up toward the left desk's near end.
       CS  right floor, A LITTLE FURTHER FORWARD — right of the right chair,
           clear of the snake plant and NOT obscuring it.
     ⛔ THE CENTRE FLOOR STAYS EMPTY. The chair is the bridge (D-077); the middle
     of the room is not decorated.

     ⚠ CD AND CS WILL NOT PROJECT TO THE SAME ON-SCREEN SIZE even at equal size
     in the room — CS is nearer the camera. ⛔ CARL: "yes that is the point." Do
     not flatten them to match. */
  CD: [
    { x: 0.06, y: 0.5 },
    { x: 0.18, y: 0.5 },
    { x: 0.18, y: 0.86 },
    { x: 0.06, y: 0.86 },
  ],
  CS: [
    { x: 0.7, y: 0.54 },
    { x: 0.83, y: 0.54 },
    { x: 0.83, y: 0.95 },
    { x: 0.7, y: 0.95 },
  ],
};

/* ⚠ BUMPED FROM `c2b-wall-pin-corners` — the old key holds two-card objects, and
   a stored {CA,CB} would restore over a four-card layout leaving CD/CS missing
   with no error. A new key retires the stale shape rather than migrating it. */
const STORE_KEY = "c2b-pin-corners-4card";

const toPx = (f: Record<CardKey, Pt[]>, w: number, h: number) =>
  Object.fromEntries(
    CARDS.map((k) => [k, f[k].map((p) => ({ x: p.x * w, y: p.y * h }))])
  ) as Record<CardKey, Pt[]>;

export default function WallPinningTool() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [corners, setCorners] = useState<Record<CardKey, Pt[]>>({
    CA: [],
    CB: [],
    CD: [],
    CS: [],
  });
  const seeded = useRef(false);
  const [drag, setDrag] = useState<{ card: CardKey; i: number } | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  /* Aspect ratio of the workspace. MUST match the viewport `/about` is judged at,
     because object-cover crops differently at every shape. 1906x905 is Carl's
     browser at the size the screenshots were taken. */
  const [aspect, setAspect] = useState(1906 / 905);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const apply = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize({ w, h });

      /* ⛔⛔ `INITIAL_FRAC` WINS ON LOAD, UNCONDITIONALLY. Storage is still WRITTEN
         (so a drag survives within a session) and is NEVER READ back on mount.

         ⚠⚠ BOTH EARLIER SEEDING RULES FAILED ONCE EACH, IN OPPOSITE DIRECTIONS:
           v1  re-seed from INITIAL_FRAC every mount  -> threw away Carl's drags on
               every reload. Cost the positioning work twice.
           v2  prefer localStorage                    -> hid the committed set
               behind a stale browser drag.
         ⛔ THE PRINCIPLE (Carl, 5 September): A GITIGNORED BROWSER STORE MUST NOT
         OUTRANK A COMMITTED RECORD. To carry a drag forward, read it out of the
         output block and write it into INITIAL_FRAC — the route these numbers took.

         ⚠ CORRECTED 10 September 2026 ON CARL'S INSTRUCTION. The 5 September record
         said this change had already been made; the file still ran v2. The record
         and the code had disagreed for six weeks and nothing detected it. */
      if (!seeded.current && w > 0 && h > 0) {
        seeded.current = true;
        setCorners(toPx(INITIAL_FRAC, w, h));
      }
    };
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    apply();
    return () => ro.disconnect();
  }, []);

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag || !stageRef.current) return;
      const r = stageRef.current.getBoundingClientRect();
      /* Clamped to the stage: a handle dragged past the edge becomes unreachable,
         and the card silently loses a corner. */
      const x = Math.max(0, Math.min(r.width, e.clientX - r.left));
      const y = Math.max(0, Math.min(r.height, e.clientY - r.top));
      setCorners((prev) => {
        const next = { ...prev, [drag.card]: [...prev[drag.card]] };
        next[drag.card][drag.i] = { x, y };
        return next;
      });
    },
    [drag]
  );

  /* Persist on release, as fractions so a different window size still restores
     the same placement. */
  const stop = useCallback(() => {
    setDrag(null);
    if (!size.w || !size.h) return;
    try {
      const asFrac = (ps: Pt[]) =>
        ps.map((p) => ({ x: p.x / size.w, y: p.y / size.h }));
      window.localStorage.setItem(
        STORE_KEY,
        JSON.stringify(
          Object.fromEntries(CARDS.map((k) => [k, asFrac(corners[k])]))
        )
      );
    } catch {
      /* storage unavailable — the session still works, it just will not persist */
    }
  }, [corners, size]);

  /* Normalised corners — fractions of the stage. These survive a viewport change;
     the matrix does not. */
  const frac = (p: Pt) => ({
    x: size.w ? +(p.x / size.w).toFixed(5) : 0,
    y: size.h ? +(p.y / size.h).toFixed(5) : 0,
  });

  /* Projected area of a quad in stage px — the shoelace formula on the four
     corners. ⚠ ON-SCREEN area, which is NOT size in the room: a card further from
     the camera projects smaller at equal real size. Reported so the difference
     between CD and CS is VISIBLE rather than accidental — Carl, 10 September:
     "yes that is the point." ⛔ Do not flatten the two to match. */
  const areaPx = (ps: Pt[]) => {
    if (ps.length !== 4) return 0;
    let a = 0;
    for (let i = 0; i < 4; i++) {
      const p = ps[i];
      const q = ps[(i + 1) % 4];
      a += p.x * q.y - q.x * p.y;
    }
    return Math.abs(a) / 2;
  };

  const pct = (v: number) =>
    size.w && size.h ? ((v / (size.w * size.h)) * 100).toFixed(2) : "0";

  const block = (k: CardKey) => {
    const f = corners[k].map(frac);
    const m = META[k];
    const tag =
      m.kind === "wall"
        ? "CALCULATED — solved against the room's perspective. Do not edit by eye."
        : "HAND-PLACED, FACE-ON — Carl's eye. Seeds only until he approves.";
    return (
      `${k}  ${m.label}  [${m.kind}]  ${tag}\n` +
      `${k}  corners (fraction of stage, TL TR BR BL):\n` +
      f.map((p) => `     ${p.x}, ${p.y}`).join("\n") +
      `\n${k}  projected area: ${areaPx(corners[k]).toFixed(0)} px²  (${pct(
        areaPx(corners[k])
      )}% of stage)\n` +
      `${k}  transform: ${matrixFor(corners[k])};`
    );
  };

  const wallArea = areaPx(corners.CA) + areaPx(corners.CB);
  const floorArea = areaPx(corners.CD) + areaPx(corners.CS);

  const report =
    CARDS.map(block).join("\n\n") +
    `\n\n── SIZE READINGS ──────────────────────────────────────────\n` +
    `  CA vs CB   ${areaPx(corners.CA).toFixed(0)} / ${areaPx(corners.CB).toFixed(
      0
    )} px²   ratio ${
      areaPx(corners.CB) ? (areaPx(corners.CA) / areaPx(corners.CB)).toFixed(3) : "—"
    }\n` +
    `  CD vs CS   ${areaPx(corners.CD).toFixed(0)} / ${areaPx(corners.CS).toFixed(
      0
    )} px²   ratio ${
      areaPx(corners.CS) ? (areaPx(corners.CD) / areaPx(corners.CS)).toFixed(3) : "—"
    }\n` +
    `  floor/wall ${
      wallArea ? ((floorArea / wallArea) * 100).toFixed(1) : "—"
    }%   (the floor pair should read SMALLER — D-077)\n` +
    `\n  ⚠ ON-SCREEN AREA ONLY. Not size in the room, and not a legibility\n` +
    `    judgement. CS sits nearer the camera than CD, so equal real size\n` +
    `    projects LARGER for CS. That difference is intended.\n` +
    `  ⚠ NOT WATCHED: whether the copy fits, whether the type is legible in\n` +
    `    the dark room, and whether any card clears the furniture. This block\n` +
    `    reports geometry and nothing else.`;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-lg font-semibold mb-1">Card pinning tool — throwaway</h1>
      <p className="text-sm text-neutral-400 mb-1">
        Drag the corners. Handles are TL, TR, BR, BL. The card follows exactly;
        nothing is estimated.
      </p>
      <p className="text-sm text-neutral-400 mb-4">
        <span className="text-[#5cf]">CA</span> /{" "}
        <span className="text-[#fb4]">CB</span> are{" "}
        <strong>calculated wall placements</strong> — solved against the room&apos;s
        perspective outside this system. Do not adjust them by eye.{" "}
        <span className="text-[#7fa]">CD</span> /{" "}
        <span className="text-[#d9f]">CS</span> are the{" "}
        <strong>floor pair, face-on</strong>: size and position by Carl&apos;s eye.
        Lean-back and inward turn come later, and are not in this tool.
      </p>

      <div className="mb-4 flex items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          Stage aspect
          <input
            type="number"
            step="0.001"
            value={aspect.toFixed(3)}
            onChange={(e) => setAspect(parseFloat(e.target.value) || 1)}
            className="bg-neutral-800 px-2 py-1 w-24 rounded"
          />
        </label>
        <span className="text-neutral-500">
          match this to the viewport /about is judged at — the crop depends on it
        </span>
        <button
          onClick={() => {
            try {
              window.localStorage.removeItem(STORE_KEY);
            } catch {
              /* nothing to clear */
            }
            setCorners(toPx(INITIAL_FRAC, size.w, size.h));
          }}
          className="ml-auto bg-neutral-800 px-3 py-1 rounded hover:bg-neutral-700"
        >
          reset
        </button>
      </div>

      <div
        ref={stageRef}
        onPointerMove={onMove}
        onPointerUp={stop}
        onPointerLeave={stop}
        className="relative w-full overflow-hidden touch-none select-none border border-neutral-700"
        style={{ aspectRatio: String(aspect), perspective: "1200px" }}
      >
        {/* Identical treatment to /about §2 — same file, same fit, so the crop matches. */}
        <Image
          src="/about-studio-source.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-neutral-950/25" />

        {CARDS.map((k) => (
          <div
            key={k}
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: CARD_W,
              height: CARD_H,
              transformOrigin: "0 0",
              transformStyle: "preserve-3d",
              transform: matrixFor(corners[k]),
              background: META[k].fill,
              border: `2px solid ${META[k].line}`,
              backdropFilter: "blur(6px)",
            }}
          >
            <div className="p-4 text-sm font-medium">{META[k].label}</div>
          </div>
        ))}

        {CARDS.map((k) =>
          corners[k].map((p, i) => (
            <div
              key={`${k}${i}`}
              onPointerDown={(e) => {
                e.stopPropagation();
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
                setDrag({ card: k, i });
              }}
              title={`${k} ${["TL", "TR", "BR", "BL"][i]}`}
              className="absolute w-5 h-5 rounded-full border-2 border-white cursor-move z-20 -translate-x-1/2 -translate-y-1/2 hover:scale-125"
              style={{ left: p.x, top: p.y, background: META[k].line }}
            />
          ))
        )}
      </div>

      <pre className="mt-4 bg-black p-4 rounded text-green-400 text-xs overflow-x-auto select-all whitespace-pre">
        {report}
      </pre>
      <p className="mt-2 text-xs text-neutral-500">
        The card element needs <code>transform-origin: 0 0</code> wherever this
        matrix is used, or it transforms about its centre and leaves the wall.
      </p>
    </div>
  );
}
