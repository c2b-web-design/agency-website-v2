"use client";

import { useEffect } from "react";

/**
 * ⛔ THE HERO's PAGE — what the bench's blank canvas (`/proto/camera?blank=1`) keeps after the street was REMOVED (6 November
 * 2026, session 2; Carl: *"We should pivot. Come up with a new concept for the hero. I want you to delete whats there on the
 * bench. On the site, the guide lines can go leaving just the text."* — D-101's street superseded at the load crossroads,
 * D-108). Moved here VERBATIM from `hero-blockout.tsx` (deleted): the home page's measured frame, where the 3D text stands,
 * the page camera calculated from them (D-101), the page guide, the text's two sketch lights, and two helpers both media use.
 *
 * Units: 1 cm (the bench's: 1 layout px = 1 cm). Origin: the bench's grid crossing on the floor (X 0 the centre line, Y 0 the
 * ground, +Z towards the camera) — the frame the block-out used, kept so the text and the page camera do not move.
 */

/** THE HOME PAGE at Carl's window, 1909 × 934, and the hero text's ink on it (measured 3 November 2026) — ONE source: the
 *  text's place, the page guide and the page camera all come from these. ⚠ The PAGE is 1894 wide, not the window's 1909:
 *  the 15 px scrollbar gutter (`scrollbar-gutter: stable`) is not page — found when the page's own drawing measured 1894 */
const PAGE: [number, number] = [1894, 934];
const GUIDE_HEADLINE = { left: 125, top: 366, width: 542, height: 195 };
const GUIDE_SUBTEXT = { left: 125, top: 600, width: 412, height: 63 };

// THE TEXT (Carl: *"The text should be in the foreground on the left. The bottom of the subtext should sit in the
// ground."* — "on" the ground). The page's ink at a sketch scale of 0.5 cm per screen px, left-aligned. Left edge at X −450,
// 8 m in front of centre; 4 cm cards, so the FACE is at Z 802.
const SKETCH_CM_PER_PX = 0.5;
const TEXT_LEFT = -450;
const TEXT_Z = 800;
const CARD_DEPTH = 4;
const HEADLINE: [number, number] = [GUIDE_HEADLINE.width * SKETCH_CM_PER_PX, GUIDE_HEADLINE.height * SKETCH_CM_PER_PX];
const GAP = (GUIDE_SUBTEXT.top - GUIDE_HEADLINE.top - GUIDE_HEADLINE.height) * SKETCH_CM_PER_PX;
const SUBTEXT: [number, number] = [GUIDE_SUBTEXT.width * SKETCH_CM_PER_PX, GUIDE_SUBTEXT.height * SKETCH_CM_PER_PX];
/** ⛔ WHERE THE TEXT STANDS (5 November 2026, session 2): the two cards' boxes — the page's ink measured at Carl's window —
 *  for the 3D text (`hero-text.tsx`), which fits its INK to them: left edge, bottom, height; its FRONT on the cards' front
 *  face (the page camera was calculated from it). In world cm, the bench's blank-canvas frame */
export const HERO_TEXT_PLACE = {
  left: TEXT_LEFT,
  face: TEXT_Z + CARD_DEPTH / 2,
  headline: { width: HEADLINE[0], height: HEADLINE[1], bottom: SUBTEXT[1] + GAP },
  subtext: { width: SUBTEXT[0], height: SUBTEXT[1], bottom: 0 },
} as const;

/**
 * ⛔ THE PAGE CAMERA, CALCULATED (Carl: *"The point of this is to get the perspective the same. Not just to build this
 * abstract on the bench but to also mirror it on the page"*; *"if the lens needs to be changed thats ok"*). The cards face
 * the camera, so to land as the page's RECTANGLES the camera must be SQUARE ON — no turn, no tilt (either would keystone
 * them). Then the page fixes everything but the lens: a card point at (X, Y) on the face lands at
 * page x = W/2 + f·(X − cx)/D, page y = H/2 − f·(Y − cy)/D, with f/D = 1 / SKETCH_CM_PER_PX (2 page px per cm). So:
 * - SIDEWAYS: the text's left edge on page x 125 → cx = TEXT_LEFT + (W/2 − 125) · 0.5 = −39 cm
 * - HEIGHT: the subtext's foot (Y 0) on page y 663 → cy = (663 − H/2) · 0.5 = 98 cm (the horizon at mid-screen)
 * - LENS → DISTANCE: f in page px from the lens on a 36 mm-wide sensor over the page's width; D = f · 0.5
 * ⚠ The height with its shift (71.5 cm) was judged FOR THE STREET (D-101) — a take the new concept may move.
 * ⛔ THE LENS: THE ARCH's (9 November 2026; Carl: *"Change the lens back to the same value we had when we built the arch."*).
 * The arch was framed at a 30° VERTICAL angle of view (`FRONT_FOV`, `lettering-hooks.tsx` — not imported: this file stays
 * free of the bench's hooks), so the page camera takes the same vertical angle: f = (H/2) / tan 15° in page px → 33.1 mm on
 * the 36 mm-wide sensor over the page's width; the camera 8.7 m from the text's face (it was 17.1 m at 65 mm). The text stays
 * locked to the page (2 page px per cm at its face). ⚰️ Until then 65 mm, judged for the street (D-101).
 */
const PAGE_VFOV_DEG = 30;
const F_PX = PAGE[1] / 2 / Math.tan((PAGE_VFOV_DEG / 2) * (Math.PI / 180));
const PAGE_LENS_MM = (F_PX * 36) / PAGE[0];
/** the height at which a square-on camera with NO shift lands the subtext's foot (Y 0) on page y 663: 98 cm */
const UNSHIFTED_Y = (GUIDE_SUBTEXT.top + GUIDE_SUBTEXT.height - PAGE[1] / 2) * SKETCH_CM_PER_PX;
/**
 * ⛔ THE CAMERA's HEIGHT: 71.5 cm, WITH A SHIFT LENS (3 November 2026, D-101). THE SHIFT keeps the text locked: the
 * picture slides DOWN by (98 − 71.5) / 0.5 = 53 page px, so the subtext's foot stays on page y 663 and the horizon lands at
 * 663 − 2 × 71.5 = 520. Verticals stay vertical (no tilt, no keystone). The bench's Home and its shot camera's view offset
 * on `?blank=1` read this (Carl: *"its impoertant that the two views are mirrored."*).
 */
const PAGE_CAMERA_Y = 71.5;
export const HERO_CAMERA = {
  lensMm: PAGE_LENS_MM,
  x: TEXT_LEFT + (PAGE[0] / 2 - GUIDE_HEADLINE.left) * SKETCH_CM_PER_PX,
  y: PAGE_CAMERA_Y,
  z: TEXT_Z + CARD_DEPTH / 2 + F_PX * SKETCH_CM_PER_PX,
  /** the VERTICAL angle of view, degrees (three's `fov`) — the same on the page and the bench (the guide crops by height) */
  vfov: (2 * Math.atan(PAGE[1] / 2 / F_PX) * 180) / Math.PI,
  /** THE SHIFT, as a FRACTION OF THE FRAME's HEIGHT, + = the picture slides DOWN (the bench's view offset reads this) */
  shift: (UNSHIFTED_Y - PAGE_CAMERA_Y) / SKETCH_CM_PER_PX / PAGE[1],
};
export const HERO_PAGE = PAGE;

/**
 * THE PAGE GUIDE on the bench (`?blank=1`): the home page's frame at Carl's window, centred over the bench's canvas, the
 * same VERTICAL angle of view, so what falls inside it is what the page would show through the same camera. DOM, no clicks.
 * ⛔ THE TEXT's DASHED BOXES REMOVED (5 November 2026, session 2; Carl, the 3D text on the bench: *"The yellow box lines
 * around the text are not needed now."*): the text itself stands there. The page's frame and its label stay
 */
export function HeroPageGuide() {
  return (
    <div className="absolute inset-y-0 left-1/2 h-full -translate-x-1/2 border border-amber-300/70" style={{ aspectRatio: `${PAGE[0]} / ${PAGE[1]}` }} data-page-guide>
      <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-amber-200">Home page, 1894 × 934</span>
    </div>
  );
}

/**
 * ⛔ THE TEXT's SKETCH LIGHT (moved from the block-out, 6 November 2026, session 2): the two plain lights the block-out
 * carried — the arch's lights are hidden with it on `?blank=1` — so the 3D text in its clay reads EXACTLY as before the street
 * was removed. A sketch light, not a design: the new concept's light is its own step.
 */
export function HeroSketchLight() {
  return (
    <>
      <hemisphereLight args={["#ffffff", "#30302c", 1.2]} />
      <directionalLight position={[-600, 900, 1400]} intensity={1.6} />
    </>
  );
}

/**
 * ⛔ DISPOSE ON A REAL UNMOUNT ONLY (found 5 November 2026, the third-person harness in the WebGPU medium: a capture FROZEN on
 * an early frame and *"Buffer used in submit while destroyed"*). React's StrictMode (dev) runs every effect's cleanup once
 * while the object stays MOUNTED, so a `useEffect(() => () => x.dispose())` disposed objects still in the scene. WebGL quietly
 * re-uploads a disposed geometry; `WebGPURenderer` can keep a cached draw holding the destroyed buffer, and then EVERY frame's
 * commands are rejected — the picture stops. Here the disposal waits one task and is CANCELLED if the object mounts again
 * (StrictMode's remount comes at once); a real unmount, or a replaced object, is disposed a task later, already out of the
 * scene. Shared: the 3D text (`hero-text.tsx`) and the WebGPU half's grid and lines (`bench-medium-webgpu.tsx`). ⚠ Kept OUT
 * of the bench's seam (`bench-medium.ts`), which imports drei.
 */
const pendingDispose = new WeakMap<object, number>();
export function useDisposeOnUnmount(obj: { dispose(): void }) {
  useEffect(() => {
    const id = pendingDispose.get(obj);
    if (id !== undefined) window.clearTimeout(id);
    pendingDispose.delete(obj);
    return () => {
      pendingDispose.set(
        obj,
        window.setTimeout(() => {
          pendingDispose.delete(obj);
          obj.dispose();
        }, 0),
      );
    };
  }, [obj]);
}

/**
 * ⛔ THE MAX ANISOTROPY, FOR EITHER MEDIUM (5 November 2026; the renderer note v1.6 §3, approved): `WebGLRenderer` answers
 * through `capabilities.getMaxAnisotropy()`; `WebGPURenderer` has no `capabilities` object (reading it THREW on mount) and
 * answers through its own `getMaxAnisotropy()`. ONE accessor for both. ⚠ No caller after the street's removal (its brick
 * canvases were the only one) — kept as the record's both-media accessor for the next textured object
 */
export function maxAnisotropy(gl: unknown): number {
  const r = gl as { getMaxAnisotropy?: () => number; capabilities?: { getMaxAnisotropy(): number } };
  return r.getMaxAnisotropy?.() ?? r.capabilities?.getMaxAnisotropy() ?? 1;
}
