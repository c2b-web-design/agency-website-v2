# Structural note — the ornate corners on the home page (19 October 2026) — VERSION 2

**For:** Carl, to route to the Architect (Carl: *"we will consult the architect, get another pair of eyes on it."*).
**Status:** PROPOSED — nothing built on the page. The bench (`/proto/corner`) is approved through pass 2.
**Version 2 (+ Carl's two answers, the same day):** amended after a PRE-REVIEW Carl pasted in (19 October) — its points 1–9 and 11 are folded in below, each
checked against the code first (marked ✔ where verified, ⚠ where corrected). Its point 10 (the hero) is Carl's to answer.
Version 1 is in git at `f2a6aff`.
**CLAUDE.md §5a triggers:** new instances of an expensive resource (WebGL contexts) on a page that has one today; a new
mechanism (runtime relief-building from an image); state that outlives a page (a module cache); an overlay over approved
sections. §5b enumeration below.

## What is being put on the page

D-100: four ornate corners per box instead of the border — **§2's four boxes in gold (16 pieces), §3's three in platinum blue
(12 pieces): 28.** One shape (pass 1, R-081: Carl's acanthus bracket traced as a relief, a 24-layout-px reach, the long arm
along the top), the colour and material per section (pass 2: satin gilt R-082; enamel over metal R-083 — *"a bit dark… on the
page… we should be able to remedy that"*). Pass 3, the light — *"very subtle light… very little motion"* — is designed on the
page, which is why the structure comes first.

**What one corner is today:** a 12,697-vertex / 24,520-triangle mesh (the mass), a 406 × 201 object-space normal map (the
carving), a 406 × 201 mask (the outline, `alphaTest`), the family buttons' studio HDRI as its reflection. Built in the browser
from the source photo (`brand-assets/c4bf3a09-…jpg`, **50 KB**) by `buildCornerRelief` in ~60–90 ms on Carl's machine.

**⚠ THE TOTAL, which version 1 never multiplied (pre-review 6):** 28 × 24,520 = **≈ 687,000 triangles (≈ 355,000 vertices)**
every frame while the light moves. And they are SMALLER THAN A PIXEL: the mesh steps 2 photo px at `stats.scale` = 0.176
layout px per photo px — **0.35 layout px a cell, ≈ 0.48 screen px at Carl's zoom 1.36.** The normal map already carries that
detail. A coarser step (6 photo px ≈ 1 layout px) would cut the count by about nine — ⛔ **but pass 1's shape is approved, so
that is a BENCH TAKE for Carl's eye, not a quiet optimisation.** A frame time measured on the page goes in the build's record.

**What the home page runs today:** ONE WebGL context — the teal `Who we are` button (§4). It rolls and carries a moving lamp,
so it draws continuously WHILE ON SCREEN (the `Ticker`, `whoweare-button-scene.tsx`, gated by `canvasOnScreen`; still under
reduced motion), a still painted first and swapped pixel-identically (R-051). ✔ It reaches the page as a `next/dynamic` chunk
with `ssr: false` (`whoweare-button.tsx`), so three.js is not in the first-load bundle.

## Options for how the 28 are drawn

| | Contexts on home | For | Against |
|---|---|---|---|
| **A. A canvas per box** (7) | 8 | Each canvas the box's size | ⛔ 7 more contexts, each paying context creation (the Next step button measured **67 ms** blocked in `CommandBufferProxyImpl::Initialize`, §5a worked case 2), 7 PMREMs of one studio, 7 copies of the textures. **Rejected.** |
| **B. A canvas per section's GRID** (2) — **proposed** | 3 | Each canvas absolute over its section's grid of boxes, scrolling WITH it (no scroll sync); one scene, one PMREM, one upload of the corner per context; each gated on screen independently | Two contexts, not one; the two scenes are separate (one light cannot cross §2 → §3 — not asked for) |
| **C. One fixed canvas over both sections** (1) | 2 | Fewest contexts | A `position: fixed` canvas must re-place every corner every scroll frame from DOM rects — the corners lag the text by a frame (the class of fault `/start`'s persistent host had to engineer around, D-046/D-048), and the `fixed`-containing-block trap (context-rules, 18 August) applies. Machinery out of proportion to one context saved. |
| **D. No WebGL — pre-rendered stills** | 1 | Cheapest | Against the brief: a still cannot carry pass 3's moving light. |

⚠ **THE HERO (pre-review 10 — Carl's to answer):** the hero is *"the killer feature… we are going to pull out all the stops"*
(D-099) and D-098 already records a film with a code logo laid over it — the extruded headline and the logo sharing ONE three.js
scene. **If the hero is WebGL, B means FOUR contexts on the home page, not three.**
✔ **ANSWERED BY CARL (19 October): YES.** *"as the logo comes into code world it will have a light attached to it. It will be
animated and change colour from gold to blue. The subsequent colour changes will affect yhe text on the Left."* ⛔ **So under B
the home page runs FOUR contexts: the hero, §2's grid, §3's grid, the teal button** — and under C three. ⛔ **The Architect weighs
B vs C with the hero's canvas in view.** (The hero's canvas is full-window and continuous while on screen; the corners' are
gated on their own grids — at most two of the four draw at once, by scroll position. Stated, not measured.)

**Proposed: B.** Two canvases, each a sibling of its section's grid inside a `relative` wrapper around the grid,
`absolute inset-0`, `pointer-events-none`, `aria-hidden`; 28 separate meshes (four mirrors per box — three.js turns the winding
per object for a negative determinant; 28 draw calls is trivial; an `InstancedMesh` would need its own handling).

## Decisions inside B

1. **⛔ THE CANVAS IS SCOPED TO THE GRID, NOT THE SECTION (pre-review 1, adopted).** Version 1 put it `inset-0` in the
   `min-h-[100*var(--vh)]` section — a FULL WINDOW per canvas, antialiased, mostly empty, cleared and composited every frame of
   pass 3. ⚠ *Corrected figure:* at Carl's window (1920 × 952, DPR 1, zoom 1.36) that is ≈ 1905 × 952 device px each (the
   pre-review's "1440 × 900 at DPR 2" is not Carl's setup; the point stands). Over the grid, §3's canvas is about a quarter of
   that. The corners only ever sit inside the boxes' rects.
2. **PLACEMENT, ONE SOURCE OF TRUTH — and the observer's blind spot (pre-review 2, adopted).** `ResizeObserver` does NOT fire
   when a box MOVES without resizing — and in a `flex items-center` section the grid's position depends on everything above it
   (the heading's wrap, `text-balance`, the webfont swap, the intro). Scoped to the grid, the corners' positions depend only
   on the boxes' sizes and the column tracks, which the observer does cover. ✔ And re-measure after `document.fonts.ready`,
   as the button does (`whoweare-button.tsx`). Rects via `getBoundingClientRect` → `toLayoutPx` (D-097); never typed.
3. **FRAMES — the button's `Ticker`, reused (pre-review 11).** Not "`frameloop="demand"`" alone, which would read as a
   contradiction beside a moving light: `demand` plus the `Ticker` — continuous only while that grid is on screen; still
   under reduced motion.
4. **⛔ WHO OWNS THE BORDER AT RUNTIME (pre-review 4).** `app/page.tsx` is a SERVER component; the borders are static classes.
   **Proposed:** the server HTML KEEPS the 1-px `border-neutral-800` (so no-JS, no-WebGL and the moment before the first
   frame all show the approved pre-D-100 box); the corner canvas, once it has drawn its first frame, sets a data attribute on
   its wrapper and a CSS rule hides the borders under it. A lost context removes the attribute → the border returns.
   ⚠ **Rejected:** making the boxes client components — it changes their lifetime (§5a).
5. **THE COLD LOAD (pre-review 5).** ✔ Smaller than version 1 implied: §2 and §3 sit below a full-window hero, and `demand`
   draws one frame on mount whether on screen or not (the `Ticker` gates only the frames after), so on a normal arrival the
   corners are drawn long before anyone scrolls there. **The case that matters is the DEEP LINK** — the header nav from
   `/about` to `/#services` or `/#work` lands cold on the section. Design and measure for that. With point 4, what is seen
   first is the BORDER, then the corners replace it at their first frame. ⚠ Version 1's *"a fade, on an existing beat"* is
   dropped — these sections have no beat.
   ✔ **ANSWERED BY CARL (19 October) — A FADE, BOX BY BOX:** *"We have used fading before to get round problems. Yes, they can
   fade in and even be viewed sequentially. There are 4 and 3 boxes. This is feasible, in fact it would add to the effect
   instead of them all just being there when navigated to."* → the corners FADE IN, ONE BOX AFTER ANOTHER (§2's four, §3's
   three), when the grid is arrived at — so the sections GAIN a beat of their own. ⚠ **New for the build to settle (pass 3):**
   the order, the pace (`/start`'s phrasing, D-023, is the precedent), whether it replays on a return, reduced motion (all at
   once), and how the border hands over to each box's corners in turn — the border-hiding rule (decision 4) per BOX, not per
   grid.
6. **WHERE THE RELIEF IS BUILT — weighed on equal terms (pre-review 7).**
   - **(a) Runtime from the photo, module cache.** One source of truth. ⚠ Costs: a NEW download (the 50 KB JPG — version 1's
     "no download" was true of the HDRI only); its decode and `getImageData`; then ~60–90 ms as ONE long task on Carl's
     machine, several times that on a phone — unmeasured.
   - **(b) Baked offline into `public/`** (normal map, mask, mesh). No runtime cost. ⚠ Version 1 weighed it unfairly against
     R-051's stills: those are rendered pixels compared by eye; a baked relief is a DETERMINISTIC function of the photo and
     `CORNER_DEFAULTS`, so a verify script can rebuild and byte-compare it — drift becomes detectable.
   - **(c) A Web Worker** — one source, off the main thread. A new mechanism; §5a review if chosen.
   **No recommendation pressed** — for the Architect. Whichever: measured on the page, phone throttling included.
7. **⛔ THE CACHE'S LIFETIME (pre-review 8).** A module-level cache OUTLIVES the page: home → `/about` → home reuses it. Right,
   but it is *"state that survives a boundary"* (§5a) — stated here. **Disposal: never — it lives for the browser session.**
   (The bench disposes on unmount, `corner-bench.tsx`; a shared cache cannot, or it would free objects other renderers hold.)
   GPU uploads stay per context and are freed with their renderer.
8. **LAZY LOADING (pre-review 9).** The corner canvas is a `next/dynamic` chunk with `ssr: false`, as the button's is — or
   three.js joins the home page's first-load bundle.
9. **THE HDRI.** ✔ Already fetched by the teal button at the SAME `room` (0.1) — `loadStudioHdri` caches one fetch and one
   decode per URL and room; each context builds its own PMREM.

## §5b — what the current structure provides, and how each is preserved

| Provided today | How it is preserved |
|---|---|
| The boxes' 1-px border separating them | Kept in the server HTML; hidden only once the corners have drawn (decision 4) |
| The sections' layout, centring and measured vertical balance | The canvas is absolute — out of flow. ⚠ The wrapper is new markup round the grid: re-measured after the build |
| ⛔ **No section or grid is `position: relative` today** (pre-review 3) | Adding it to the grid's wrapper makes `inset-0` work — and makes the wrapper the containing block for ANY future absolute descendant. Stated so it is not discovered |
| ⛔ **Paint order** (pre-review 3) | A positioned canvas paints ABOVE the non-positioned text. Harmless here (`pointer-events-none`, no overlap) — but it is the "provided by where it sits" case: anything later placed under it in the grid paints beneath the corners |
| Text selection, reading order, screen readers | `pointer-events-none`, `aria-hidden`; the text untouched |
| The clearance between ornament and text | ✔ **MEASURED NOW, not at mastering (pre-review 11)** (`home-box-corner-space-19-october.mjs <width>x<height>`): Carl's window 35 layout px; tablet 768 px 35; ⛔ **phone 390 px: 27 — the 24-px reach leaves ~3 px of air.** Below 768 px the boxes' padding drops from `p-8` to `p-6`. A known risk, measured |
| §3 at tablet width | At 768 px §3's boxes are 219 px wide (three columns): two 71.5-px long arms take 143 of 219 — measured, judged at mastering (D-094) |
| The `#services` / `#work` anchors and the header nav | Unchanged |
| D-097's zoom | Canvases in LAYOUT px (`offsetSize`), DPR × zoom (`useCanvasDpr`), rects via `toLayoutPx` |
| The teal button's own context, still and swap in §4 | Untouched — a separate component in a separate section |

## What it couples to

`lib/studio-hdri.ts`, `lib/canvas-on-screen.ts` and the `Ticker` (`whoweare-button-scene.tsx`), `lib/site-scale.ts` /
`use-site-scale.ts`, `components/home/corner-geometry.ts`, `app/page.tsx` (two grid wrappers, two mounts), `app/globals.css`
(the border-hiding rule), `brand-assets/c4bf3a09-…jpg` (tracked).

## Files the build would touch (for Carl to name)

`app/page.tsx`, `app/globals.css`, a new `components/home/corner-canvas.tsx`, a new `components/home/corner-material.ts` (the
material values out of the bench so the page and the bench read one copy), `components/home/corner-geometry.ts`,
`corner-bench.tsx`; and — if (b) — a bake script and its outputs in `public/`.

## Asked of the Architect

1. B (grid-scoped) vs C — **weighed with the hero's canvas in view: four contexts under B, three under C** (Carl: the hero is
   WebGL).
2. The relief: (a) runtime with a cache, (b) an offline bake with a byte-compare check, or (c) a worker.
3. The ~687k sub-pixel triangles: is a coarser mesh (a bench take for Carl) the right lever, or does the frame time on the page
   decide it?
4. Anything §5b still misses.

## Asked of Carl — ANSWERED 19 October

1. **Does the hero's brief include a canvas?** — **Yes** (a lit, animated code logo crossing gold → blue, its colour changes
   lighting the text on the left). Four contexts under B.
2. **Border → corners?** — **A fade, box by box, in sequence** (decision 5).
