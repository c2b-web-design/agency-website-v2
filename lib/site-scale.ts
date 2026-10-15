/**
 * THE SITE'S SCALE — D-097, 15 October 2026 (session 2). ONE number for the whole site.
 *
 * ⛔ WHY IT EXISTS. Carl built and approved every page with Windows Text size at 136%, which Chrome multiplies into its
 * device scale: his window was ~1412 × 608 CSS px. At 100% — most visitors on a 1920 × 1080 screen — the same pages
 * drew at ~74% of the size approved. Carl: *"it feels as if its just gone into 16:9 or cinemascope"*; *"Yes, scale it
 * all."* So above the composed window the whole page is `zoom`ed (`app/globals.css`, `html { zoom: var(--site-scale) }`)
 * and a wide screen shows what was approved. Below it the scale is 1 and nothing changes (phones included).
 *
 * ⚠ THE SCALE IS SET BEFORE FIRST PAINT by `SITE_SCALE_SCRIPT`, inline in `app/layout.tsx`'s `<head>` — the server
 * cannot know the window. Everything else READS what the CSS did (`pageZoom`), never the intended value.
 *
 * ⚠⚠ WHAT THE ZOOM DOES TO MEASUREMENTS (measured, Chromium 151 — `live-work/plan-site-scale-15-october.md`):
 *   `getBoundingClientRect`, `innerWidth/Height`  → SCREEN px (zoomed)
 *   `offsetWidth`, `clientWidth`, `ResizeObserver.contentRect` → LAYOUT px (unzoomed)
 *   a length written into CSS (`left: 100px`, a `fixed` host, `translate`, `clip-path`) → painted × the zoom
 *   `100vh` → × the zoom (use `var(--vh)`, `app/globals.css`)
 * So: a value from `getBoundingClientRect` that is WRITTEN into CSS goes through `toLayoutPx` once; values only
 * COMPARED with each other (a rect against `innerHeight`) are in one space already and stay as they are.
 *
 * ⚠ NO REACT IN THIS FILE: `app/layout.tsx` (a Server Component) imports `SITE_SCALE_SCRIPT` from it. The hooks live in
 *   `lib/use-site-scale.ts` (a Client module).
 *
 * ⚠ R3F CANVASES: `resize={{ offsetSize: true }}` makes its measurer take `offsetWidth/Height` (layout px), so every
 * scene's world is unchanged; `useCanvasDpr` (`lib/use-site-scale.ts`) multiplies the resolution by the zoom so the bigger drawing stays sharp.
 * Without both, a canvas is zoomed twice and blurred (measured: the home button 390 × 150 → 703 × 258 screen px).
 */


/** The width Carl composed in — 1920 ÷ 1.36. Carl at the gate: *"1412 (Recommended)"*. */
export const SITE_DESIGN_WIDTH = 1412;

/**
 * The height Carl composed in — MEASURED by his Claude-in-Chrome check at 1.36 (page area 1026 × 608 CSS px).
 * ⚠ It guards only windows wider than his (ultrawide): at his own window height it gives the same 1.36 as the width.
 * The plan's 700 was a guess and would have computed 1.18 on his own screen (the correction is in the plan file).
 */
export const SITE_DESIGN_HEIGHT = 608;

/** The ceiling. Carl at the gate: *"Cap at 2.0 (Recommended)"* — re-judged on the TV. */
export const SITE_SCALE_MAX = 2;

/** The scale for a window of this SCREEN size: 1 at or below the composed window, never above the ceiling. */
export function siteScaleFor(width: number, height: number): number {
  const s = Math.min(width / SITE_DESIGN_WIDTH, height / SITE_DESIGN_HEIGHT);
  return Math.round(Math.min(SITE_SCALE_MAX, Math.max(1, s)) * 1000) / 1000;
}

/**
 * Inline in `<head>` (`app/layout.tsx`), before anything paints. Built from the constants above, so the script and the
 * module cannot disagree. `innerWidth/Height` are screen px and do not change with the zoom, so this cannot feed back.
 */
export const SITE_SCALE_SCRIPT = `(function(){var d=document.documentElement;function f(){var s=Math.min(innerWidth/${SITE_DESIGN_WIDTH},innerHeight/${SITE_DESIGN_HEIGHT});s=Math.round(Math.min(${SITE_SCALE_MAX},Math.max(1,s))*1000)/1000;d.style.setProperty("--site-scale",String(s));}f();addEventListener("resize",f);})();`;

/** The zoom the page is ACTUALLY drawn at — read from the browser, 1 on the server or where unsupported. */
export function pageZoom(): number {
  if (typeof document === "undefined") return 1;
  const el = document.documentElement as HTMLElement & { currentCSSZoom?: number };
  const z = el.currentCSSZoom ?? Number(getComputedStyle(el).zoom);
  return Number.isFinite(z) && z > 0 ? z : 1;
}

/** A screen-px value (from `getBoundingClientRect` / `innerWidth`) → the layout px to WRITE into CSS. */
export function toLayoutPx(screenPx: number): number {
  return screenPx / pageZoom();
}
