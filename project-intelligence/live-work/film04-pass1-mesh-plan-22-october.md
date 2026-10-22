# Claude Plan: Film 4, the showcase. PASS 1: the lettering's mesh, in clay (D-088). VERSION 4.1 (amended three times; v4's review notes applied)

> **Status: VERSION 4.1, 22 October 2026 (session 2). ✔ APPROVED BY CARL (*"Lets proceed wqith implementation"*).** v1 was reviewed by the Architect: *approve with amendments*, ten
> findings (table A at the end). v2: *approve once three of the verification checks are corrected*, plus three small
> text changes (table B). v3: *approve, with one amendment before build*, plus four small points (table C), which the
> Architect said need no further round. The Builder checked the Architect's code references before each amendment, and
> every one held.
> v4 was reviewed: *ready for Carl's approval*, with two build-time notes (in the text below) and one wording fix.
> ⚠ **Execution starts only on Carl's approval of THIS version.** All four Architect responses are to be saved **as the
> Builder's transcription of what Carl pasted** (§2.5: the Architect's window is the authority if the two differ).

## Context

Film 4 is §3's box 4: a build that stays off the C2B site and is filmed. Carl widened it today (D-088, 22 October,
session 2) into a **two-viewport showcase of modern web development**. It leads with three.js extruded text and WebGL
lighting, and a few themed stock images come in later. It is also a **client template**: the words, font, colour and pace
are interchangeable parts. It lives on a `/proto` bench, with a link we can send to clients. The copy speaks in the
client's voice ("Your company", "Your logo"). **What matters is the technique and the layout.**

**The order (Carl):** the text first, in passes (**mesh, then material, then light**), each judged by eye. The images
come once the words are approved. **This plan is pass 1: the shape of the words, in clay.**

## Corrections to what the Builder said earlier in this session

1. **The `/about` "H" was fixed on 24 September** (the source moved to Vercel's static TTF).
2. **The site is ALREADY hidden from search engines**, through `app/robots.ts` and `app/layout.tsx`'s `robots`. Both are
   marked REMOVE BEFORE LAUNCH. The bench's own noindex is the protection that **survives launch** (below).
3. **Extruded text on the site is ALREADY kerned.** The `Who we are` family label is laid out by the browser and extruded
   at the browser's positions (`measureLabel`, verified to dx 0.03 px, D-088). v1 missed this.

## What already exists, and what pass 1 reuses (the Architect's finding 1)

| Existing | Use in pass 1 |
|---|---|
| `public/fonts/geist-semibold.typeface.json`, built 12 October by `live-work/scripts/build-geist-semibold-typeface.mjs` from Vercel's static `Geist-SemiBold.ttf` (geist 1.7.2), all printable ASCII | **REUSED AS IS.** "Your company" is ASCII. **No new converter in pass 1.** |
| `measureLabel` (`components/home/whoweare-button-scene.tsx:973`): the browser lays out a live Geist span, and a DOM Range reads each character's x and the baseline in layout px | **REUSED, imported, the file unchanged.** The browser's shaper applies the font's full kerning (GPOS included), plus `letter-spacing` as tracking. |
| The family's per-glyph extrusion (`ExtrudedLabel`, same file): `TextGeometry` per character, translated to the browser's x | **The method is followed** in a new module (below). The button's own component is not reused, because it bends letters onto the pill's dome. |
| opentype.js's kerning reader (`three-stdlib/libs/opentype.js`) | **NOT USED.** The Architect found three ways it returns 0 silently: GPOS Lookup 9 unsupported (:11734); no fallback to `kern` once GPOS exists (:11321); class kerning returns the first covering subtable's value (:7123–7127). Used only as a cross-check measurement (Verification 4). |

**Why the browser and not a converter, for a client template:** a client's site loads its own font as a webfont
anyway, so the browser that draws their copy is the authority on their spacing. The converter then supplies outlines
only. That is the job it does reliably. ⚠ **The caveat, and the template's NORMAL case:** the webfont and the clean
outline file are usually DIFFERENT FILES (here: Google's variable Geist in the browser, Vercel's static TTF for the
outlines). The browser's spacing is real only once the two are **proven to be the same font** (Verification 2). It can also
silently measure a FALLBACK font if the webfont has not loaded. Both are asserted.

## Proposed approach

### 1. The overlap check: `scripts/check-typeface-overlaps.mjs` (new, which fails loudly)

`node scripts/check-typeface-overlaps.mjs <typeface.json> [--curve=N]`, run on a typeface JSON.
- **It checks what three triangulates:** the converted, ROUNDED JSON outlines, flattened at the bench's
  `curveSegments`. Every contour is tested for self-crossing, and every pair of contours in a glyph for crossing.
  **Tolerance:** points that coincide or touch within 1 JSON unit are not counted as crossings.
- It lists the glyphs it flags and **exits non-zero.**
- **Green run:** `geist-semibold.typeface.json`, all printable ASCII, must give 0 flagged glyphs. ⚠ This **closes D-088's
  open item**: SemiBold was checked on 12 October for "W h o w e a r" only, and was *"not yet shown red on a known-bad
  font"*.
- **Red run:** Google Fonts' Geist Regular instance (the 24 September URL, recorded in `build-geist-typeface.mjs`),
  converted into the scratchpad. **It passes if h n a u r p m H B F are ALL among the glyphs it names.** It may name
  more, because the subset is all of ASCII.
- ⚠ **Latin-1 accented letters are out of pass 1** (the existing JSON is ASCII). Whether an accent touching its base
  letter fails the font or drops the glyph is **Carl's call, at the font-swap chunk**.

### 2. The lettering module: `components/showcase/lettering-geometry.ts` (new, pure, no React)

**ONE spec object is the template's interchangeable parts:**
`LetteringSpec { words, font, sizePx, trackingEm, depthEm, bevel: { sizeEm, thicknessEm, segments }, curveSegments }`.
- **Depth and bevel are FRACTIONS OF THE EM** (finding 8), so a client's size change keeps the edge's proportions.
  `sizePx` is the type's size in layout px. **It is the spec's.** The front view frames the words with the camera
  (orthographic zoom). It never rescales them.
- `buildLettering(spec, font, glyphs)` takes the browser's `Glyphs` and builds **one `TextGeometry` per character,
  translated to its measured x and the baseline, then merged** (`mergeGeometries`), as the family label does
  (finding 7).
- **The bevel does not thicken the letters:** `bevelOffset = −bevelSize`, as `whoweare-button-scene.tsx:137`. Three adds
  the bevel's thickness at BOTH the front and the back, so the straight depth is **`max(0.01, depth − 2 × thickness)`**
  and the total holds, as the label's `depth − bevel` with thickness `bevel / 2` (`:132–137`).
- **The edge, take 1:** a narrow straight chamfer (`segments 1`), the family's language from the desk mark. Rounded is a
  switch (`?bevelseg=`).
- Returns the stats: triangles, build ms, width and height, **the missing glyphs**, and **per pair: the advance gap and
  the VISIBLE gap**. The visible gap is measured on the **SILHOUETTE**: each glyph's bounding box over ALL its vertices,
  taken **before the glyphs are merged**. ⚠ Not the front face: with `bevelOffset = −size` the face is set in by the
  bevel size, so a face-edge gap would widen by ~2 × bevel on a correct build.

### 3. The bench: `/proto/showcase`

- `app/proto/showcase/page.tsx` is the server page, as `/proto/corner`: it reads the switches and passes them down.
  **`metadata.robots = { index: false, follow: false }`.**
- `components/showcase/showcase-bench.tsx` is the client half:
  - **TWO measuring spans**, both in the site's Geist (`var(--font-geist-sans)`), weight 600, at `sizePx`, with
    `font-variant-ligatures: none` (so no pair collapses into a ligature the per-character build would never draw):
    the **kern-on** span (`font-kerning: normal`, `letter-spacing: trackingEm`), and the **kern-off** span
    (`font-kerning: none`, no tracking), used only for the font proof.
  - **They are set on ONE LINE:** `white-space: nowrap` on both spans, inside a wrapper with `overflow: clip`. ⛔ Without
    it, "Your company" at display size (~1,000 px wide) WRAPS in the bench's column: `measureLabel` would read x from two
    lines and the baseline from the second, and every check would be built on wrong numbers with no error. The opacity-0
    box would also scroll the page sideways at narrow widths. Clipping does not change the layout, so the Range readings
    are unaffected and the kern-on span stays readable by screen readers. ⚠ **The wrapper is `position: relative`**, so it
    is the spans' containing block. Otherwise `overflow: clip` does not clip them and the page still scrolls sideways.
  - **How they are hidden:** absolutely positioned, shrink-wrapped, `opacity: 0`, `pointer-events: none`. ⛔ Not
    `sr-only` (it makes the box 1 px wide, so the right-edge reading would be wrong). Not `visibility: hidden`, which would
    take the words from screen readers. The kern-on span **is the words' accessible text**: the canvas has none, and
    D-088 records that D-051-A11Y's baked-text defect *"must not repeat"*. The kern-off span is `aria-hidden`.
  - **The text node is each span's FIRST child, and the zero-size baseline mark comes AFTER it**, as both existing
    callers place it (`measureLabel` reads `el.firstChild`).
  - **The family name comes from the span's computed style** (`measureLabel` returns it as `font`), never the literal
    "Geist": `next/font/google` may give it a generated name. **Only the FIRST family in the computed list is passed**
    (next/font adds a "Fallback" family built from local Arial, which could load when Geist has not). It awaits
    **`document.fonts.load("600 <size>px <first family>")`, whose result must contain at least one face with status
    `loaded` AND that face's family must match the first family.** Names are compared **with quotes stripped**
    (`"__Geist_x"` against `__Geist_x`), or a correct font would cause a false stop. ⛔ Not `document.fonts.check`, which
    returns true for a family that does not exist at all. Then `measureLabel` on both spans, then the build.
  - **`measureLabel` is loaded by DYNAMIC import** (`await import(".../whoweare-button-scene")`), as `whoweare-button.tsx:179`
    does, so the showcase page does not carry the button's geometry, the logo studio and `RectAreaLightUniformsLib` in
    its first load.
  - One `<Canvas>`, `frameloop="demand"`, `useCanvasDpr([1, 2])`, `resize={{ offsetSize: true }}`. 1 unit = 1 layout
    px, as the family label.
  - The clay (`#8a8a8a`, roughness 0.6) and the shape light (hemisphere, key, fill) are **a copy of `corner-bench.tsx`'s
    local `ShapeLight`** (it is not exported).
- **Views:** `front` (orthographic, face-on) and `oblique` (orbit).
- **Modes:** `clay`, `flat`, `mesh` (wireframe), `normals`, `zebra`. The Y's acute inside corner is inspected in
  `normals` and `zebra` (three's bevel can spike at sharp corners).
- **Switches:** `?words=` `?size=` `?track=` `?depth=` `?bevel=` `?bevelseg=` `?curve=` `?view=` `?mode=` `?az=` `?el=`,
  with sliders. **`?font=` accepts only the names in a fixed list** (pass 1: `geist-semibold`).
- **Bad input on a link a client may see (finding 6):** characters the font lacks are named in the stats AND on the
  bench in plain words. They are never silently drawn as "?".
- `window.__showcaseBench` exposes `{ ready, stats, spec, fontCheck }`.

### 4. Capture (film 04, from the first frame, unprompted)

- `Videos\C2B Films\04 Extruded lettering\`: `02 Plan and review` (v1, response 1, v2, response 2, v3, response 3,
  v4, response 4),
  `03 Pass 1 - Mesh` (a still of every take in front, oblique, mesh and normals at Carl's DPR 1, and an orbit clip at
  1080p30 CFR), `shot-list.md`, `README.md`.
- The overlap check's red and green runs are captured as terminal stills.
- Script: `live-work/scripts/film04-capture-22-october.mjs`. **Carl is shown ONE take, not a comparison sheet.**

## Structural contract (§5a / §5b)

- **Existing files modified: NONE.** `measureLabel` is imported (dynamically), not changed. Importing rather than
  copying keeps ONE way of taking the measurement (§5a). ⚠ **This creates a new coupling.** The bench
  depends on `whoweare-button-scene.tsx`'s export. **A change to `measureLabel` now reaches the showcase.** Its doc comment
  says *"Shared by the bench and the home button"*, and that line goes stale. It is amended **only with Carl's word**,
  since the file is out of scope; otherwise it is recorded here and in D-088.
- **New mechanisms:** the overlap check (none exists; the gap is recorded in both converters' headers) and the lettering
  module (display layout; the family label's version bends onto a dome).
- **Rejected:** a third converter (the SemiBold JSON already exists); opentype.js kerning (the three silent zeros
  above); `TextGeometry` on whole strings (no kerning); `layoutCardText` (the wrong job).
- **One WebGL canvas on the bench.** ⛔ **The two-viewport page's canvas structure is NOT decided here.** It gets its own
  note when the layout pass comes.
- **§5b:** a new route that deploys with the site, is not linked from any page, and is noindexed. No shared module
  changes.
- ⚠ **`three-stdlib` is not a direct dependency** (it comes through drei). Pass 1 uses only its main export
  (`TTFLoader`, for the red run's conversion, as both existing converters do). The file-path import of opentype.js is
  confined to one measurement script.

## For Carl to reconcile (not blocking pass 1; nothing is sent in this pass)

- **Sending the link** means the first outside eyes on the deployment. That conflicts with the 28 July position recorded
  in `app/robots.ts` (*"no other human has seen the site and none will until it is finished"*). Today's ruling (*"The
  ability to send to clients would be useful"*) is later; **which holds, and from when, is Carl's call.**
- **At launch, `/proto` must stay out of search** when the site-wide blocks are removed. Recorded in D-088 and the
  handoff so the launch step finds it.

## Files (Carl names them for `chunk-scope.json`; none are protected)

`scripts/check-typeface-overlaps.mjs` · `components/showcase/lettering-geometry.ts` ·
`components/showcase/showcase-bench.tsx` · `app/proto/showcase/page.tsx` · records already in scope.
The red-run font and its conversion go to the scratchpad and are never tracked.

## Carl's calls in this plan (the Builder's recommendation first)

1. **The font for take 1: Geist SemiBold** (the existing, clean JSON, and the site's own webfont; the browser's spacing
   is real once Verification 2 proves the two files are the same font). The font swap, which is the template's
   demonstration, comes later with its own converter work.
2. **The setting: one line, "Your company".**
3. **The edge: a narrow chamfer,** the family's.

## Verification

1. **The overlap check:** green on `geist-semibold.typeface.json` (0 flagged, all ASCII); red on Google Fonts' Regular
   instance, naming all ten of h n a u r p m H B F.
2. **The font is the font (assertions, which fail loudly on the bench and in the stats):**
   - `document.fonts.load(...)` for the FIRST computed family returned **at least one face, status `loaded`, whose
     family matches it**.
   - **The webfont and the outline file are the same font:** in the **kern-off** span, every gap between characters
     equals that character's JSON advance (scaled to `sizePx`) **within 0.1 layout px**, and the last glyph's x plus its
     advance meets the text's right edge within the same tolerance. **The right edge comes from a Range over the whole
     text**, not `measureLabel`'s `w`, which is rounded to 0.1 (`:997`) and would use up half the tolerance on its own.
     ⛔ A fallback font, or a different release with other widths, fails here on every glyph, not just one.
   - ⚠ **The 0.1 px tolerance is UNCALIBRATED.** The label's dx 0.03 proved the placement, not that the webfont's advances
     match the JSON's. **The first kern-off reading is the calibration:** if it fails by small, uniform amounts, that is
     reported as such, not read as a fallback. (The response is "stop and report" either way.)
3. **Kerning, read directly:** each pair's kern is the **kern-on gap minus the kern-off gap** (at `trackingEm 0`), so the
   JSON is not involved. Y-o and every other pair in "Your company" are recorded as numbers. **Zero kerned pairs is a
   stop** (Geist SemiBold is expected to kern "Yo"; unverified).
4. **The cross-check, read with care:** a Node measurement script reads opentype.js's `getKerningValue` for the same pairs.
   ⚠ **It reads Vercel's static TTF while the browser uses Google's variable Geist**, so a disagreement may come from the
   files, not from opentype.js's gap. **Recorded as a finding for the font-swap chunk, not a pass/fail.**
5. **The bevel:** the **silhouette** gap for each pair (bounding boxes over all vertices, before the merge) with the bevel
   on and off is unchanged within 0.5 layout px (`bevelOffset` holds the outline). The Y's inside corner is looked at in
   `normals` and `zebra`.
6. `npx tsc --noEmit` is clean. `npm run lint` stays at **1 error, 0 warnings**.
7. **Looked at, not just measured:** stills at DPR 1 in every mode, viewed before Carl is shown anything. A cold load,
   then the bench at Carl's window.
8. Servers are stopped and the port confirmed free before the checkpoint opens.

## Stop conditions

- The overlap check flags any glyph in the chosen font: **stop and report.**
- A font assertion fails (fallback measured, or the advances disagree): **stop and report. Do not build on the numbers.**
- Zero kerned pairs measured in "Your company": **stop and report.**
- The build for two words takes more than 100 ms on the main thread: report it with the measurement.
- Anything that would touch an existing file outside the named scope (including `measureLabel`'s comment): **stop and
  ask.**

## The Architect's findings, mapped

**D. On v4 (changes in v4.1):**

| # | Note | Change in v4.1 |
|---|---|---|
| 1 | The clipping wrapper must be positioned | `position: relative` on the wrapper |
| 2 | Family names may differ only by quotes | Compared with quotes stripped |
| 3 | The status line said "Both" responses | "All four" |

**C. On v3 (changes in v4):**

| # | Finding | Change in v4 |
|---|---|---|
| 1 | The measuring spans wrap at display size, and overflow the page | `white-space: nowrap` on both, inside an `overflow: clip` wrapper |
| 2 | A loaded face can be next/font's Arial fallback | Only the first family passed; the face's family must match |
| 3 | 0.1 px has no evidence; `w` is rounded | The right edge from a whole-text Range; the first reading treated as calibration |
| 4 | The bevel's thickness is added at both ends | Straight depth `max(0.01, depth − 2 × thickness)`, as the label |
| 5 | The capture folder's list | v1 to v4 and the responses |

**B. On v2 (changes in v3):**

| # | Finding | Change in v3 |
|---|---|---|
| 1 | The font checks would not catch a fallback | `fonts.load` result must hold a loaded face; the family from computed style; a kern-off span proves webfont = outline file to 0.1 px; kerning = kern-on minus kern-off |
| 2 | How the measuring span is hidden | Absolute, shrink-wrapped, `opacity: 0` (not `sr-only`, not `visibility: hidden`); the kern-on span is the accessible text; the baseline mark after the text node |
| 3 | The bevel check would fail a correct build | The gap is measured on each glyph's silhouette, before the merge |
| 4 | Ligatures and alternates | `font-variant-ligatures: none` on both spans |
| 5 | The cross-check compares two files | Stated; the "real spacing" phrase carries the caveat |
| 6 | Import cost | `measureLabel` by dynamic import, as the home button |

**A. On v1 (changes in v2):**

| # | Finding | Change in v2 |
|---|---|---|
| 1 | §5a omits the existing SemiBold JSON and `measureLabel` | Both reused; the converter dropped from pass 1; the coupling stated |
| 2 | opentype.js kerning can return 0 silently | Not used as the source; the browser is. Assertions plus a zero-pairs stop; opentype.js kept only as a cross-check |
| 3 | Kerning units do not match the JSON's scale | Moot. No kerning table is written; positions come in layout px from the browser |
| 4 | The bevel thickens the letters | `bevelOffset = −size`; the visible gap measured; the Y's corner inspected |
| 5 | The overlap check's spec | Runs on the rounded JSON at `curveSegments`; tolerance 1 unit; the red run's pass rule is "all ten among those named"; Latin-1 deferred to Carl |
| 6 | Bad URL input | Missing glyphs named on the bench; `?font=` limited to a list |
| 7 | "One ExtrudeGeometry" was unclear | One `TextGeometry` per character, translated, merged |
| 8 | Size versus fit | `sizePx` is the spec's; the camera frames; depth and bevel in em |
| 9 | The client link and launch | Per-page noindex kept; the launch note recorded; the 28 July conflict put to Carl |
| 10 | `three-stdlib` is not a direct dependency | Main export only, as precedent; the file-path import confined to one script |
