"use client";

/* ⛔⛔ THROWAWAY SCAFFOLDING — /about §2 wall-card copy, projected onto the wall.
   10 September 2026. DELETE WITH THE GUIDES.

   WHAT IT IS FOR: Carl asked to "put the wall text at an angle, so it looks right
   in the card." The copy is laid out FLAT in the card's own coordinate space, then
   a homography maps that rectangle onto the four pinned corners, so the type takes
   the wall's perspective instead of sitting as a flat label near the card.

   ⚠⚠ WHY THIS IS ITS OWN CLIENT FILE. `app/about/page.tsx` is a STATIC PRERENDERED
   SERVER COMPONENT and its own header comment says it is kept that way on purpose
   — `AboutNav` was split out for exactly this reason. A homography needs the box's
   PIXEL size, which needs a ResizeObserver, which needs hooks, which would convert
   the whole page to client rendering. ⛔ That is a structural change to an approved
   property of the page, and it is not worth making for scaffolding. Same pattern,
   same reason, second instance.

   ⚠ THE FLOOR PAIR IS NOT IN THIS FILE AND MUST NOT BE. CD and CS are face-on by
   Carl's sequence (size and position first, lean and inward turn later) and their
   positions are APPROVED. An earlier attempt at this projection moved them onto a
   fixed-pixel coordinate layer as a side effect and was reverted. Leave them alone.

   ⚠ WHAT THIS DOES NOT ANSWER: whether the copy is legible. It answers whether the
   copy FITS the card face. The far edge of each card recedes — CA's right, CB's
   left — so type there is genuinely smaller, which is the wall doing its job, not a
   rendering fault. Carl has already established type cannot shrink further. */

import { useEffect, useRef, useState } from "react";

type Pt = { x: number; y: number };

/* The un-transformed card. The homography maps this rectangle onto the four
   pinned corners, so these are the CARD's own coordinates, not screen sizes.
   ⚠ Same values as `/proto/wall`, deliberately: the matrix arithmetic below is
   ported from that tool and the two must describe the same rectangle. */
const CARD_W = 420;
const CARD_H = 260;

/* Homography from the CARD_W x CARD_H rectangle to four arbitrary corners.
   ⛔ PORTED VERBATIM from `app/proto/wall/page.tsx` -> matrixFor(), which is the
   proven implementation: it produced the corners Carl approved by eye, and its
   inverse round-trips against his real numbers to 1e-13.
   Corners are TL, TR, BR, BL. */
function matrixFor(c: Pt[]): string {
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

/* ⛔ MEASURED CORNERS, as fractions of the 1.500 plate. Not eyeballed: isolated by
   hue from the calculated guide plate and fitted per edge (all eight edges under
   1px rms), then intersected. The two quads' vanishing points landed on a COMMON
   HORIZON without that being imposed, which is the check that makes them
   trustworthy. Order TL, TR, BR, BL. */
const WALL_CARDS = [
  {
    id: "CA",
    frac: [
      { x: 0.17504606, y: 0.16608964 },
      { x: 0.46536328, y: 0.20506728 },
      { x: 0.4668487, y: 0.35997265 },
      { x: 0.19208298, y: 0.36854913 },
    ],
    text: "The technical foundation of every project. Operating directly inside the development environment, the Architect collaborates on feature design, evaluates system logic, and solves structural problems before a single line of production code is written. High-level ideas are broken down into precise, modular components — a clear blueprint the Builder can execute exactly. And the work is then checked by someone who did not do it.",
  },
  {
    id: "CB",
    frac: [
      { x: 0.59518006, y: 0.2060109 },
      { x: 0.86463728, y: 0.11912387 },
      { x: 0.84034374, y: 0.37848976 },
      { x: 0.59164856, y: 0.35975847 },
    ],
    text: "Where the approved plan becomes the site. Stationed in the same environment as the Architect, the Builder drafts the implementation step by step, then passes it back for review and amendment before any production code is written. Each piece of work has a declared scope, and the Builder cannot reach outside it. Code is only good when it stays within the brief. The plan is verified against the work as it goes, so the site that gets built is the site that was approved.",
  },
];

export default function WallCardText() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  /* ⚠ MEASURED, NOT DERIVED. The plate is `object-contain`, so the image box is
     letterboxed inside the section and its pixel size changes with the window.
     A matrix built for one size is wrong at every other, so it is recomputed from
     the observed box — the same approach `/proto/wall` uses on its stage. */
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const apply = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    apply();
    return () => ro.disconnect();
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {/* Tracks object-contain's own box: height drives on a window wider than
          3:2, width on a taller one. ⛔ `w-full` here would force full section
          width and every card would drift off its quad. */}
      <div
        ref={boxRef}
        className="relative h-full max-h-full w-auto max-w-full aspect-[3/2]"
      >
        {size.w > 0 &&
          WALL_CARDS.map((c) => (
            <div
              key={c.id}
              /* ⛔ `transformOrigin: "0 0"` IS MANDATORY. Without it the element
                 transforms about its CENTRE and leaves the wall entirely — the
                 proto tool's own footnote records this.
                 ⚠ `preserve-3d` keeps the perspective divide from being flattened
                 to an affine skew, which would give a parallelogram: the same
                 wrong shape reached a different way. */
              /* ⚠ Geist — the project's own face, loaded by next/font in the
                 protected layout. No webfont import, no extra request, and the
                 fit judged here is the fit the cards will actually have. */
              className="absolute left-0 top-0 p-[14px] text-white"
              style={{
                width: CARD_W,
                height: CARD_H,
                transformOrigin: "0 0",
                transformStyle: "preserve-3d",
                transform: matrixFor(
                  c.frac.map((p) => ({ x: p.x * size.w, y: p.y * size.h }))
                ),
                /* ⛔⛔ 23 -> 16px. THE 23 WAS SET FOR CAVEAT AND CARRIED OVER TO
                   GEIST BY MISTAKE, which is why the copy got WORSE on the switch.
                   Caveat sits small on its em; Geist has a high x-height and fills
                   it, so the same nominal size renders much larger. The overflow
                   Carl saw was that error, not a fair reading of Geist's density.
                   ⚠ Geist should fit MORE words per line than Caveat at matched
                   optical size — this is the value that actually tests it.
                   ⛔ A SIZE IN THE CARD'S OWN 420x260 SPACE, not on screen: the
                   homography scales it with the card, so it reads smaller on CB,
                   whose face is smaller and whose far edge recedes further. */
                fontSize: "16px",
                lineHeight: 1.35,
              }}
            >
              {c.text}
            </div>
          ))}
      </div>
    </div>
  );
}
