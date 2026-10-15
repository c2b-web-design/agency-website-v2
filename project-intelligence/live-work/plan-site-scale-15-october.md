# Plan — D-097: the whole site scales to the window it was composed in

*Builder's plan, 15 October 2026 (session 2). APPROVED by Carl in plan mode, 15 October 2026 (session 2). Architect review: see the gate note below.*

## Context

Carl's Chrome read `devicePixelRatio` 1.36 for the whole build: **Windows Text size 136%**, which Chrome multiplies into its scale. So the site was composed and approved in a window of ~**1412 × 700 CSS px**. At 1.0 (where it is now, and where most 1920 × 1080 visitors are) every page draws at ~74% of the size approved — Carl: *"it feels as if its just gone into 16:9 or cinemascope"*; *"this would of been a disaster upon launch."* **Carl's decision (D-097): "Yes, scale it all"** — above the composed width everything grows in proportion, header and logo included, so a wide screen shows what was approved. Below it, nothing changes.

## Measured facts the design rests on (Chromium 151, `html { zoom: 1.36 }`)

| reading | reports |
|---|---|
| `getBoundingClientRect`, `innerWidth/Height` | **zoomed** (screen) px — 576 → 783 |
| `offsetWidth`, `clientWidth`, `ResizeObserver.contentRect` | **unzoomed** layout px — 576 |
| `ResizeObserver.devicePixelContentBoxSize` | true device px — 783 |
| `100vh` | zoomed: 1.36 × the window (the hero sits low) |
| `position: fixed; left: 100px` | paints at 136 |
| `element.currentCSSZoom` | 1.36 — a native accessor |

Probe (`live-work/scripts/site-scale-probe-15-october.mjs`, reference = 1412 × 700 @ 1.36 vs candidate = 1920 × 952 @ 1 + root zoom): **text, header and horizontal layout reproduce exactly.** Three failure classes, all mechanical: (1) every R3F canvas **zoomed twice** (home button 390×150 → 703×258 screen px, backing too small → blurred); (2) `fixed` hosts drift (Next step 314 px out — its own guard fired); (3) `vh` sizing zoomed.

## The mechanism — one number, one accessor

**1. `lib/site-scale.ts` (new) — the single source.**
- `SITE_DESIGN_WIDTH = 1412`, `SITE_DESIGN_HEIGHT = 700` (Carl's measured window), `SITE_SCALE_MAX` (see questions).
- `siteScaleFor(w, h) = clamp(1, min(w / 1412, h / 700), MAX)` — the height term stops a short/ultrawide window cutting off what was composed for 700 tall.
- `pageZoom()` → `document.documentElement.currentCSSZoom ?? 1` (reads what the CSS actually did, not the intended value).
- `toLayoutPx(screenPx)` → `÷ pageZoom()`; `effectiveDpr()` → `devicePixelRatio × pageZoom()`.
- `useSiteScale()` — `useSyncExternalStore` on resize, for canvases whose `dpr` must follow.
- `SITE_SCALE_SCRIPT` — the inline string below.

**2. Applied before first paint (`app/layout.tsx`, PROTECTED).** An inline `<script>` in `<head>` sets `--site-scale` on `<html>` from `siteScaleFor(innerWidth, innerHeight)` and on `resize`; `<html suppressHydrationWarning>` (the theme-script pattern — the server cannot know the window). `globals.css`: `html { zoom: var(--site-scale, 1); }`. ⚠ Next 16's `beforeInteractive` does not promise to run before paint (`node_modules/next/dist/docs/.../script.md`), so it is a plain inline script, and "no jump on first paint" is ASSERTED (verification §2).

**3. Window-height units — `--vh`.** `globals.css`: `--vh: calc(1vh / var(--site-scale, 1))`. Every `Nvh` / `h-screen` / `min-h-screen` / `[Nvh]` becomes `calc(N * var(--vh))` (Tailwind: a `min-h-screen-scaled` utility or arbitrary values). ~63 sites in 13 files: `app/page.tsx` 13, `app/about/page.tsx` 11, `about-card-canvas.tsx` 10, `pillarbox-plate.tsx` 6, `enquiry-opening.tsx` 4, `globals.css` 4, `room-plate.tsx`, `nextstep-canvas.tsx`, the `/proto` benches.

**4. Every shipped canvas measures in layout px** (5: `whoweare-button-scene.tsx`, `about-card-canvas.tsx`, `answer-card-canvas.tsx`, `nextstep-canvas.tsx`, `contact-field-canvas.tsx`): `<Canvas resize={{ offsetSize: true }} dpr={…× pageZoom()}>`. R3F's measurer (`react-use-measure`) then takes `offsetWidth/Height` — unzoomed — so **each scene's world stays exactly today's CSS-px world: no camera, light or mesh value changes.** Sharpness from `dpr × zoom` (today's `[1, 2]` becomes `[1, 2] × zoom`; the card canvas's `?carddpr=` likewise).

**5. Code that measures the page converts once, through `toLayoutPx`.** Rule: a value from `getBoundingClientRect`/`innerWidth` that is WRITTEN into CSS (a `fixed` host's left/top/width/height, a `translate`, a `clip-path`) is divided by `pageZoom()`; values only COMPARED with each other (gBCR vs `innerHeight` — `/about`'s wipe, `lib/canvas-on-screen.ts`) are already in one space and stay. Sites: `enquiry-opening.tsx` (`hostRect` → the card host), `nextstep-canvas.tsx` (its host; its containing-block guard stays and must read green), `answer-card-canvas.tsx` (`gridWidth`/`gridOffset` → `offsetWidth`/`contentRect`; `useScreenPixelSnap` and `snapToScreen` → `effectiveDpr()`), `whoweare-button-scene.tsx`/`whoweare-button.tsx` (the still's handover), `about-card-canvas.tsx` + `app/about/page.tsx` (card 1's restart `clip-path`, the desk mark's drop onto the §3 player), `neon-bloom.tsx`, `about-neon.ts`. Each is checked by the reference comparison, not by reading.

**6. Today's `/start`-only work is reverted (one mechanism, not two).** `--enquiry-scale` and the shell zoom (`globals.css`), `gridWorldZoom` and the camera zoom (`answer-card-backdrop-geometry.ts`, `answer-card-canvas.tsx`) — overtaken by D-097, unneeded once the canvas measures layout px. The `data-snapdbg` hydration fix stays.

## §5a — structural, stated

New: a root `zoom` and a site-wide scale accessor. **Rejected:** a fluid root font size (hundreds of px values never reach it); `transform: scale` on a wrapper (blurs canvases, breaks `fixed`); per-canvas camera zoom (route B — works, but five scenes each carry a second scale; measuring layout px leaves every scene untouched); stepped media queries (jumps between sizes). **Couples to:** every `fixed` host, every value written from a measured rect, `vh`, every canvas's `dpr` and size. **Unasserted until measured:** `currentCSSZoom` in Safari/Firefox (falls back to 1 → unscaled, never broken).

## §5b — what depends on the page's size, and how each is kept

Layout and text (zoom) · canvases' size and world (offsetSize) · sharpness (dpr × zoom) · `fixed` hosts and the containing-block guards (`toLayoutPx`) · the button stills' pixel-identical handover (re-measured; the swap-match harness) · `/about`'s scroll wipe, runway and journey (compared values, one space — verified at stops) · card 1's restart hit area · `/start`'s corridor, card hit targets, Next step, contact field · phones and anything under 1412 (scale 1 — byte-identical) · the `/proto` benches (scaled too) · reduced motion (unaffected) · hydration (suppressed on `<html>` only).

## Order — prove on one page, then roll out (CLAUDE.md workflow 1–3)

1. **Mechanism + the home page** (one canvas, the simplest page) → Carl judges at 1.0 (and on the TV) → approve.
2. **`/about`** (the room, scroll journeys, desk mark, §4 button) → Carl.
3. **`/start`** (three canvases, the corridor) → Carl. Then the subject that started this: **re-judge the Q&A cards at the restored size** before anything else is done to them.

## Verification

1. **Reference comparison** (`site-scale-probe` grown into `verify/site-scale.mjs`): each page at several stops, 1412 × 700 @ DPR 1.36 vs 1920 × 952 @ DPR 1 — must match within anti-aliasing (target: <0.5% of pixels differ by >8 levels, canvases included); every canvas's screen rect and backing reported side by side. ⚠ NOT WATCHED stated in its output: motion and timing, hover, phones.
2. **No jump on first paint:** the first frame's `--site-scale` equals the settled one (cold load, production build).
3. **Below 1412 unchanged:** 1280 × 800 and 390 × 844 byte-identical before/after.
4. Each canvas's containing-block / hydration console clean; `npx tsc --noEmit`; `npm run lint` = 1 error, 0 warnings; `npm run build`; a clean-checkout build before any push.
5. Carl by eye at DPR 1.0 — fresh load and production arrival (memory: approval includes the cold load).

## Files Carl must name (PROTECTED)

`app/layout.tsx`, `app/page.tsx`, and for the later steps: `components/enquiry/answer-card-mesh.tsx` (only if the label texture needs it), `components/about/about-card-glass.ts` (not expected). Already named today: `enquiry-opening.tsx`, `answer-card-backdrop-geometry.ts`, `contact-field-canvas.tsx`, `contact-field-inputs.tsx`.

## For Carl to decide at the gate

1. **The design width:** **1412** (recommended — reproduces exactly what you approved) or a rounder 1440 (a common design width; ~2% smaller).
2. **A ceiling:** a 2560-wide monitor at 100% would scale 1.81×, a 4K TV at 100% ~2.7×. Recommended cap **2.0**, re-judged on the TV.

## Gate note — Carl, 15 October 2026 (session 2)

- **Review route:** *"Build on my approval"* — step 1 is built without a prior Architect review; the Architect may review the checkpoint after it.
- **Design width:** **1412** (*"1412 (Recommended)"*).
- **Ceiling:** **2.0** (*"Cap at 2.0 (Recommended)"*), re-judged on the TV.
- **Protected files for step 1** (`app/layout.tsx`, `app/page.tsx`): named by Carl: *"app/layout.tsx  app/page.tsx  Authorised to use"*.
- **Builder correction at build time:** `SITE_DESIGN_HEIGHT` is **608**, not the plan's 700. 700 was a guess (952 ÷ 1.36); Carl's Claude-in-Chrome check MEASURED his page area at 1.36 as 1026 × **608** CSS px. With 700, a window of his height (608 × 1.36 ≈ 827 screen px) would compute 827 / 700 = 1.18 — the height guard would undo the scale on the very screen it exists for. With 608 it computes 1.36. The guard's job is unchanged: it binds only on windows wider than 16:9-ish (ultrawide), never on his.
