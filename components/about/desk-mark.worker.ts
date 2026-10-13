/**
 * ⛔ THE DESK MARK's GEOMETRY, BUILT OFF THE MAIN THREAD (D-088, 13 October 2026).
 *
 * Carl, on `/about`: *"the start a conversation button there is a delay before it start to move."* Profiled: on every load
 * the desk mark's geometry (`buildLogoMarkGeometry`, 173,974 vertices, 885,237 indices) took ~1 s of the main thread in one
 * task, and nothing on the page drew meanwhile — the gold button included. Its output never changes between loads, but a
 * pre-computed file would be 7.7 MB (`live-work/scripts/desk-mark-size-probe.mjs`), so the SAME function runs here instead,
 * in a Web Worker, and the arrays are TRANSFERRED back (moved, not copied).
 *
 * ⛔ NOTHING ABOUT THE MARK CHANGES — the same function, the same input (`DeskMark` in `about-card-canvas.tsx` sends the scale
 * it would have passed inline). `?markcheck=1` on the dev server builds it inline as well and compares the two, array by
 * array. If the worker cannot start or fails, `DeskMark` builds inline, as before.
 */
import { buildLogoMarkGeometry, LOGO_MARK_DEFAULTS } from "./logo-mark-geometry";

export type DeskMarkRequest = { scale: number };
export type DeskMarkResult = { position: Float32Array; normal: Float32Array; index: Uint16Array | Uint32Array };

const scope = self as unknown as { onmessage: ((e: MessageEvent<DeskMarkRequest>) => void) | null; postMessage: (m: DeskMarkResult, transfer: Transferable[]) => void };

scope.onmessage = (e) => {
  const { geometry } = buildLogoMarkGeometry({ ...LOGO_MARK_DEFAULTS, scale: e.data.scale });
  const position = geometry.getAttribute("position").array as Float32Array;
  const normal = geometry.getAttribute("normal").array as Float32Array;
  const index = geometry.getIndex()!.array as Uint16Array | Uint32Array;
  scope.postMessage({ position, normal, index }, [position.buffer, normal.buffer, index.buffer]);
};
