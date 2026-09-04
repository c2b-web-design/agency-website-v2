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

/* ⛔ CARL'S POSITIONS, 4 September 2026 — held as FRACTIONS of the stage so they
   survive a reload and a resize. Pixels would not.
   Order is TL, TR, BR, BL. */
const INITIAL_FRAC: Record<"CA" | "CB", Pt[]> = {
  CA: [
    { x: 0.19766, y: 0.02849 },
    { x: 0.46604, y: 0.09063 },
    { x: 0.46604, y: 0.34148 },
    { x: 0.19766, y: 0.36449 },
  ],
  CB: [
    { x: 0.60731, y: 0.09178 },
    { x: 0.82441, y: 0 },
    { x: 0.82441, y: 0.40362 },
    { x: 0.60731, y: 0.35299 },
  ],
};

const STORE_KEY = "c2b-wall-pin-corners";

const toPx = (f: Record<"CA" | "CB", Pt[]>, w: number, h: number) => ({
  CA: f.CA.map((p) => ({ x: p.x * w, y: p.y * h })),
  CB: f.CB.map((p) => ({ x: p.x * w, y: p.y * h })),
});

export default function WallPinningTool() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [corners, setCorners] = useState<Record<"CA" | "CB", Pt[]>>({
    CA: [],
    CB: [],
  });
  const seeded = useRef(false);
  const [drag, setDrag] = useState<{ card: "CA" | "CB"; i: number } | null>(null);
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

      /* ⛔⛔ SEEDS ONCE, FROM localStorage IF ANYTHING IS STORED THERE — 4 September.
         The previous version re-seeded from INITIAL_FRAC on every mount, so every
         reload and every hot-reload THREW AWAY Carl's dragged positions and put the
         cards back to the Builder's baked-in numbers. That happened repeatedly and
         cost the positioning work more than once.
         ⚠ Now the last drag is persisted and restored. INITIAL_FRAC is only the
         very first-run fallback. */
      if (!seeded.current && w > 0 && h > 0) {
        seeded.current = true;
        let src = INITIAL_FRAC;
        try {
          const raw = window.localStorage.getItem(STORE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Record<"CA" | "CB", Pt[]>;
            if (parsed?.CA?.length === 4 && parsed?.CB?.length === 4) src = parsed;
          }
        } catch {
          /* storage blocked or corrupt — fall back to the defaults */
        }
        setCorners(toPx(src, w, h));
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
        JSON.stringify({ CA: asFrac(corners.CA), CB: asFrac(corners.CB) })
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

  const report = (["CA", "CB"] as const)
    .map((k) => {
      const f = corners[k].map(frac);
      return (
        `${k}  corners (fraction of stage, TL TR BR BL):\n` +
        f.map((p) => `     ${p.x}, ${p.y}`).join("\n") +
        `\n${k}  transform: ${matrixFor(corners[k])};`
      );
    })
    .join("\n\n");

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-lg font-semibold mb-1">Wall pinning tool — throwaway</h1>
      <p className="text-sm text-neutral-400 mb-4">
        Drag the corners onto the wall. Handles are TL, TR, BR, BL. The card follows
        exactly; nothing is estimated.
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

        {(["CA", "CB"] as const).map((k) => (
          <div
            key={k}
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: CARD_W,
              height: CARD_H,
              transformOrigin: "0 0",
              transformStyle: "preserve-3d",
              transform: matrixFor(corners[k]),
              background:
                k === "CA" ? "rgba(80,180,255,0.22)" : "rgba(255,180,80,0.22)",
              border: `2px solid ${k === "CA" ? "#5cf" : "#fb4"}`,
              backdropFilter: "blur(6px)",
            }}
          >
            <div className="p-4 text-sm font-medium">
              {k === "CA" ? "The Architect" : "The Builder"}
            </div>
          </div>
        ))}

        {(["CA", "CB"] as const).map((k) =>
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
              style={{
                left: p.x,
                top: p.y,
                background: k === "CA" ? "#09f" : "#f80",
              }}
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
