"use client";

/**
 * The site's scale as React state — the hooks half of `lib/site-scale.ts` (D-097). Split out because `app/layout.tsx`
 * is a Server Component and imports the constants; a module holding hooks cannot be imported there (measured: a 500).
 */

import { useSyncExternalStore } from "react";
import { pageZoom } from "./site-scale";

function subscribe(onChange: () => void): () => void {
  // ⚠ The head script's own resize listener was added first, so it has already moved `--site-scale` when this runs.
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

/** The page zoom as React state — for anything that must re-render when the window crosses a size. */
export function useSiteScale(): number {
  return useSyncExternalStore(subscribe, pageZoom, () => 1);
}

/**
 * An R3F `dpr` that stays sharp under the zoom: the device ratio clamped to `[min, max]` as R3F does with a range,
 * then × the page zoom (a canvas `offsetSize`-measured at 576 layout px is 576 × zoom screen px wide).
 * ⚠ Pair it with `resize={{ offsetSize: true }}` — on its own it would only sharpen a canvas that is zoomed twice.
 */
export function useCanvasDpr(range: readonly [number, number] = [1, 2]): number {
  const zoom = useSiteScale();
  const device = useSyncExternalStore(subscribe, () => window.devicePixelRatio || 1, () => 1);
  return Math.min(range[1], Math.max(range[0], device)) * zoom;
}
