# Structural note — the ornate corners on the home page (19 October 2026)

**For:** Carl, to route to the Architect (Carl: *"we will consult the architect, get another pair of eyes on it."*).
**Status:** PROPOSED — nothing built on the page. The bench (`/proto/corner`) is approved through pass 2.
**CLAUDE.md §5a triggers:** new instances of an expensive resource (WebGL contexts) on a page that has one today; a new
mechanism (runtime relief-building from an image) that every page load would pay for; an overlay placed over approved
sections. §5b enumeration below.

## What is being put on the page

D-100: four ornate corners per box instead of the border — **§2's four boxes in gold (16 pieces), §3's three in platinum blue
(12 pieces): 28.** One shape for all of them (pass 1, R-081: Carl's acanthus bracket traced as a relief, a 24-layout-px reach,
the long arm along the top), the colour and material per section (pass 2: satin gilt R-082; enamel over metal R-083, *"a bit
dark… on the page… we should be able to remedy that"*). Pass 3, the light — *"very subtle light… very little motion"* — is
designed on the page, which is why the structure comes first.

**What one corner is:** a 12,697-vertex / 24,520-triangle mesh (the mass), a 406 × 201 object-space normal map (the carving),
a 406 × 201 mask (the outline, `alphaTest`), and the family buttons' studio HDRI as its reflection (`lib/studio-hdri.ts`). The
four corners of a box are ONE mesh under mirroring transforms. Built today in the browser from the source photo
(`brand-assets/c4bf3a09-…jpg`) by `buildCornerRelief` in ~60–90 ms.

**What the home page runs today:** ONE WebGL context — the teal `Who we are` button (§4). It rolls and carries a moving lamp,
so it draws continuously WHILE ON SCREEN (gated by `canvasOnScreen`; still under reduced motion), a still painted first and
swapped pixel-identically (the cold-load rule, R-051). (`whoweare-button.tsx`'s header; its `frameloop="demand"` line is
marked overtaken there.)

## Options for how the 28 are drawn

| | Contexts on home | For | Against |
|---|---|---|---|
| **A. A canvas per box** (7) | 8 | Each canvas the box's size; trivial placement | ⛔ The mistake this file's rule exists for: 7 more contexts, each paying context creation (the Next step button measured **67 ms** blocked in `CommandBufferProxyImpl::Initialize`, CLAUDE.md §5a worked case 2), 7 PMREMs of the same studio, 7 copies of the textures. **Rejected.** |
| **B. A canvas per section** (2) — **proposed** | 3 | Each canvas absolute inside its section, scrolling WITH it (no scroll sync), one scene, one PMREM, the corner's geometry/textures uploaded once per context; placement from the boxes' measured rects; each section gated on screen independently | Two contexts, not one; the two sections' scenes are separate (so one light cannot cross from §2 into §3 — not asked for) |
| **C. One fixed canvas over both sections** (1) | 2 | Fewest contexts | A `position: fixed` canvas must re-place every corner every scroll frame from DOM rects — the corners lag the text by a frame while scrolling (the class of fault `/start`'s persistent host had to engineer around, D-046/D-048), and §5b's `fixed`-containing-block trap (context-rules, 18 August) applies. More machinery for one context saved. |
| **D. No WebGL — pre-rendered stills** | 1 | Cheapest | Against the brief (*"3D with Three js and very subtle light… very little motion"*): a still cannot carry pass 3's moving light. Stills ARE still needed — see the cold load — but as the first frame, not the design. |

**Proposed: B.** Two canvases, one per section, each `absolute inset-0` inside its `<section>`, `pointer-events-none`,
`aria-hidden`, drawing its section's 16 or 12 pieces (four meshes per box — the TL/TR/BL/BR mirrors — so mirrored winding is
handled per object as three.js does today; an `InstancedMesh` would need its own handling for negative determinants).

## Decisions inside B that need a second pair of eyes

1. **Where the relief is built.** (a) **At runtime from the photo, once per page, cached at module level** and shared by both
   canvases (the GPU uploads are still per context) — one source of truth (the photo), ~60–90 ms of main thread once, off the
   first paint. (b) **Baked offline** into `public/` (normal map, mask, mesh) by a script — no runtime cost, but a SECOND COPY
   of the relief that must be re-baked after any change (the family stills' rule, R-051: *"RE-RUN THE STILLS SCRIPT AFTER ANY
   CHANGE"*). **Leaning (a)**, measured on the page before committing to it.
2. **Placement — one source of truth for the boxes' geometry.** The corners are placed from `getBoundingClientRect()` of each
   box (layout px via `toLayoutPx`, D-097), re-measured on `ResizeObserver` — never typed. The bench's box size is a bench
   constant only.
3. **Frames.** `frameloop="demand"`, gated by `canvasOnScreen` per section; pass 3's slow light motion runs only while that
   section is on screen; under reduced motion the light is still.
4. **The cold load (R-051, *"What is approved is what loads"*).** The boxes have NO border once the corners replace it, so until
   the first frame the boxes are bare. Options: (i) the corners simply arrive with the first frame (a fade, on an existing
   beat); (ii) a per-section still — ⚠ but the boxes move with the window width, so a pre-rendered still cannot match at every
   width the way the button's can. **Carl's call; flagged now so it is not discovered at approval.**
5. **No WebGL / a lost context.** The fallback is the old 1-px `border-neutral-800` — the approved state before D-100 — so a box
   is never left bare.
6. **The HDRI.** Already fetched on the home page by the teal button; `loadStudioHdri` caches the decode, so the corners add no
   download. Each context builds its own PMREM (as the button's does).

## §5b — what the current structure provides, and how each is preserved

| Provided today | How it is preserved |
|---|---|
| The boxes' 1-px border separating them | Replaced by the corners (the brief); restored as the fallback (point 5) |
| The sections' layout, centring and measured vertical balance (`home-s3-vertical-balance-19-october.mjs`) | The canvas is absolutely positioned — out of flow; no box, padding or gap changes. Re-measured after the build |
| Text selection, reading order, screen readers | `pointer-events-none`, `aria-hidden` on the canvas; the boxes' text untouched |
| The clearance between ornament and text | The 24-px reach inside the measured 35-px gap (§3's tightest box); ⚠ re-measured on §2's wider boxes and at other widths |
| The `#services` / `#work` anchors and the header nav | Unchanged — the canvas is inside the sections, not around them |
| D-097's zoom | Canvases in LAYOUT px (`offsetSize`), DPR × zoom (`useCanvasDpr`), rects via `toLayoutPx` — as every canvas on the site |
| The teal button's own context, still and swap in §4 | Untouched; a separate component in a separate section |
| Phones (one column under 768 px) | Placement is from measured rects, so stacked boxes still get their corners; ⚠ judged at mastering (D-094) |

⚠ **Not enumerable from the code alone:** paint order relative to anything Carl adds to these sections later. Stated as a
limit, not an answer.

## What it couples to

`lib/studio-hdri.ts` (the shared studio), `lib/canvas-on-screen.ts` (frame gating), `lib/site-scale.ts` / `use-site-scale.ts`
(layout px), `components/home/corner-geometry.ts` (the relief), `app/page.tsx` (two mounts, the boxes' border classes),
`brand-assets/c4bf3a09-…jpg` (the source, now tracked).

## Files the build would touch (for Carl to name)

`app/page.tsx` (mounts; border → fallback), a new `components/home/corner-canvas.tsx` (the section canvas), and
`components/home/corner-geometry.ts` / `corner-bench.tsx` (the material values moved out of the bench into a shared module
so the page and the bench read one copy — a new `components/home/corner-material.ts`).

## Asked of the Architect

1. Is **B** right, or does C's single context justify its scroll-sync machinery here?
2. Runtime-built relief with a module cache (a) vs an offline bake (b)?
3. Anything in §5b this misses.
4. The cold-load option (point 4) — a view to put beside Carl's.
