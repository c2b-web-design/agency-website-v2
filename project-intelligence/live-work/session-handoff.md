# Session Handoff — 24 September 2026. CA'S TEXT IS EXTRUDED AND RUNS IN "PAGES". NEXT: THE "EFFECTS".

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔ WHERE THINGS STAND

**CA's copy is EXTRUDED Geist, written and erased left to right in "pages" at `/start`'s pace.**
Carl: *"it is clearly 'pages' with a start and end. This i great."*
- **R-029 records that verdict for the PACE AND PAGE MODEL ONLY.** Every look value is still a take.
- **The record is D-094.** Its 24 September amendments run in order: etched → CB → the chase → pace → extrusion → light → pages.

- **To view:** `npm run dev` (**the server is STOPPED; port 3000 is free**), then **`/about?extrude=1#roles`**.
  Under the flag every rim is off, the etch is off, and one white spot is on, centred, static and
  downward. **Plain `/about` is measured pixel-identical** (the identity gate reads 0 px on all four arms).
- **Faders**, read once per load (reload to apply). Defaults are in `card-extrude.tsx`:
  - `textem` (52 mm), `textdepth` (3 mm)
  - `textwpm` (171.4 = `START_PAGE_WPM`), `textlead` (1 = off), `textrest` (0)
  - `lighti` (0.5), `lightangle` (45° from the face normal)
  - `textcolor`, `textrough`, `textbw`/`textbh`, `textlh`
- **Code:**
  - `card-extrude.tsx`: the component
  - `card-text-timeline.ts`: the setting and the chase, pure
  - `about-card-mesh.tsx`: `faceDome` / `faceBaseZ` exported; `faceReceiveShadow`
  - `about-card-canvas.tsx`: the flag wiring
  - `public/fonts/geist-regular.typeface.json`, built by `scripts/build-geist-typeface.mjs` from Google Fonts' Geist TTF; the TTF itself is not in the repo, and its URL is in the script
  - `about-card-copy.ts`: the ONE copy source
- **The etched take** (`card-etch.ts`, behind `?etch=1`) is **superseded but still in the code, gated.
  Removing it is Carl's call.**

## ⛔ CARL'S METHOD FOR THIS WORK — standing for this subject

*"Im looking at this as a 'dry' sound first. We will add 'effects' as we go and 'shape' the cards
and scene. Its best to do this in chunks."* **One card (CA) until he says otherwise.**
- ⚠ **He waived the plan gate twice today, each for that piece only:** CB's etch, and the dry
  extrusion. **A waiver is not standing.**

## ⛔ NEXT: THE "EFFECTS", A CHUNK AT A TIME — Carl leads the order

**Measured and open, from the run logs:**
1. **The light's hotspot.** The spot mirrored in the glossy dome washes out words at CA's top-centre.
   - Intensity plateaus: 3 → 1.5 → **0.5 now**.
   - **The angle is the lever:** at 0.5, 60° gives a hotspot word 2.59 : 1 vs 2.80 elsewhere (45° gives 2.22).
   - ⚠ **But steeper angles lengthen the shadows** (≈ depth × tan θ): ~3 mm at 45°, ~5 at 60°, ~8 at 70°, against a ~5 mm stroke.
   - **Carl asked what angle it is (45°) and did not rule.**
2. **The drift:** off-centre left → right → back, subtle (D-094). **Not built.**
3. **Depth and colour of the letters** (3 mm, `#f2f4f7`, roughness 0.6). **Not judged.**
4. **The clear takes 10.2 s** with nothing new appearing. A faster clear would echo the Q&A's "it's done its job". **Not built.**
5. **The setting:** greedy breaks, gaps up to 4.4x a space, the last line set left. **The fit chunk.**
6. ⚠ **A 309 ms long task at the clock's start**, probably the first compile of the shadowed and clipped programs. **Recorded, not tuned** (the Q5 pattern).
7. **CB, CD, CS**, then **the four cards striking in turn**. The next card flickers on as the reader
   reaches the previous card's last words; the lead point is a POSITION in the copy (D-094).
   - ⚠ **Those sequence figures were computed at 200 wpm with no clear phase.** At 171.4 wpm with the page model, CA alone is a 32.9 s cycle. **Recompute before planning the sequence.**

## ⛔ CORRECTIONS THIS SESSION, so they are not repeated

1. ⚠ **The Builder's first reading-time figure (~107 s for all four) was ~30 s out.** It stacked
   `/start`'s 171 wpm on a per-character clock. **Carl's stopwatch and two tools fixed it:**
   Read-o-Meter (`https://niram.org/read/`) and Gorby agree at 200 wpm. ⛔ **Gorby rounds to whole
   minutes; do not use it for timing.**
2. ⚠ **The first hotspot measurement read "fine".** Its box measured words against the dark gaps
   between lines. **Measure a word against the glass right behind it.**
3. ⚠ The Builder told Carl D-077 held CS's word count. **It holds none;** the count lived in the
   sprint entry and in live-work files, and **is corrected to 56 everywhere.**
4. **Matching the tube's HEX cannot match the rim AS SEEN:** the rim is tone-mapped at intensity 6
   plus its untone-mapped bloom. **Measure colour on screen** (the D-093 lesson again).

## ⚠ OPEN — owners in brackets

1. **The review log has TWO entries numbered R-028** (22 and 23 September), and the 22nd sits ABOVE
   the 23rd in a reverse-chronological file. **Found today, not renumbered.** History is not
   rewritten without Carl. [Carl]
2. **Remove the etched take** (`card-etch.ts`, the `?etch=1` wiring), or keep it as a fallback. [Carl]
3. **Accessibility:** `sr-only` copy, reduced motion, the flash cap, hidden-tab pause. **All
   deferred to mastering by Carl's ruling** (D-094). [mastering]
4. **CS's present-tense "connected to…"** (D-077) is still unanswered. [Carl]
5. Carried: the ignition verdict and the scroll strike point; the intermittent 1920 frame drops;
   D-087's loop; RIM-DARK / ENVMAP-STALE; the `proven.json` filing; the stale "rim is not a light
   source" comments; `wall-card-corners-4-september.md`'s supersession notice. [Carl / Builder]

## ⚠ HOUSEKEEPING

- **`live-work/chunk-scope.json` is LIVE** (`ca-extruded-text-dry`). It is gitignored. **Re-scope it
  for the next chunk.** Don't delete it silently: the guard FAILS OPEN when the file is absent.
- **Carl's machine:** DPR **1.36**, viewport ~**1412 x 700** CSS. Capture at that size for his eye.
- **Committed and pushed at the end of this session** (see `git log`). The push deploys to production;
  everything new is gated behind flags.

---

*Written 24 September 2026.*
