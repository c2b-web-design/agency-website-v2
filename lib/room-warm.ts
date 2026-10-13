/**
 * ⛔ IS `/about`'s ROOM WARM? — the one signal between the room's canvas and §4's gold button (D-088, 13 October 2026).
 *
 * Carl chose it (*"lets go with option A - proceed"*): on a page opened straight at `#start` the room is off screen from the
 * first moment and, since it stopped drawing off screen, had never rendered — so the first scroll up compiled its shaders
 * at once and froze (1.57 s; 0.98 s after the precompile). Nine shaders can only be compiled by a REAL render (clipping
 * planes, the shadow map, the bloom). So the room does one hidden full render, and §4's gold button stays on its still
 * until it has — the roll then starts on a quiet page (`/start`'s rule: the choreography waits for the loading).
 *
 * ⚠ A COUPLING, KEPT SMALL ON PURPOSE: module state, three calls each side, reset when the room unmounts (a client-side
 * navigation away and back gets a new canvas, which must warm again). The button never waits forever — it has a backstop.
 *
 *   `DeskMark` (about-card-canvas.tsx)  → markDeskMarkBuilt() / resetRoomWarm on unmount
 *   `NeonBloom` (neon-bloom.tsx)       → deskMarkBuilt(), markRoomWarm()
 *   `FamilyButton` (whoweare-button.tsx, the `start` member) → isRoomWarm(), the `room:warm` window event
 */
let deskMark = false;
let warm = false;

/** The desk mark's geometry is in the scene — the last of the room's materials to arrive (from its worker). */
export function markDeskMarkBuilt(): void {
  if (!deskMark && typeof window !== "undefined") performance.mark("desk-mark:built");
  deskMark = true;
}
export function deskMarkBuilt(): boolean {
  return deskMark;
}

/** The room has drawn one full frame with everything in it — every shader it will use is compiled. */
export function markRoomWarm(): void {
  if (warm) return;
  warm = true;
  if (typeof window === "undefined") return;
  performance.mark("room:warm");
  window.dispatchEvent(new Event("room:warm"));
}
export function isRoomWarm(): boolean {
  return warm;
}

/** The room's canvas has gone (unmount) — a new one must warm again. */
export function resetRoomWarm(): void {
  deskMark = false;
  warm = false;
}
