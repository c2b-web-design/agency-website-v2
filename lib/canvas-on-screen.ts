/**
 * Any part of the element inside the window, in a visible tab — the on-screen test that gates a canvas's frames.
 *
 * Moved here unchanged from `components/about/card-extrude.tsx` (12 October 2026) so the home page's `Who we are` button can
 * REUSE `/about`'s frame gating (its structural note, point 6) without importing the `/about` text module and everything it
 * pulls in. One copy; both import it.
 */
export function canvasOnScreen(el: Element): boolean {
  if (typeof document === "undefined" || document.visibilityState !== "visible") return false;
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
}
