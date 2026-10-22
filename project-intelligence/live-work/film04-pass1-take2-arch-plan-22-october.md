# Claude Plan: Film 4, the showcase. PASS 1, TAKE 2: the lockup as an ARCH, in clay (D-088). VERSION 2.1

> **Status: VERSION 2.1, 22 October 2026 (session 2). ✔ APPROVED BY CARL (*"Lets proceed."*).** v2 was reviewed: *approve*, two
> amendments folded in and two small points stated (the v2.1 table at the end); the closing note: *ready for Carl's approval*. v1 was reviewed by the Architect: *approve with amendments*. Its
> must-fix (the default arch collides) went to Carl BEFORE the build, as the Architect advised. **Carl ruled both open
> questions:** the lever is **wider letter-spacing**, and the letters are **ALL UPRIGHT** (placed along the curve, not
> turned). Every finding is mapped at the end. The Architect's three responses on this take are saved as the Builder's
> transcription (`live-work/architect-plan-response-film04-arch-22-october.md`).
> Builds on take 1 (R-088) and its plan (`live-work/film04-pass1-mesh-plan-22-october.md`, v4.1): the font proof, the
> kerning route, the chamfer rule and the capture all stand. **Only the layout changes.**

## Context

The client is **an established, higher-end restaurant**. The materials follow the business (brushed brass first, gold
leaf second), but the shape comes first. Carl: *"lets make it curve in some way more reflective of a logo"*. He ruled an
**arch** and the words **"Your company"**, with this lockup: *"Your linear at the top with Conpany as an upside down "U"
with C starting as its left base and Y as its righ base."* His reference (`live-work/references/film04/arch-form-reference-22-october.png`)
gives the FORM: *"a straight line at the top and a curved line forming the arch. Do not copy."*

**So "Your" is the lintel (straight, centred, above). "company" runs over a half-circle, the "c" at its left foot and
the "y" at its right. Every letter keeps the shape approved in take 1 and STANDS UPRIGHT** (Carl's answer). The arch
is drawn by where the letters stand, not by turning them. This is still pass 1 (the mesh, in clay).

## Why the geometry needs care (the Architect's finding, confirmed from the font)

From `geist-semibold.typeface.json` (1 em = 1,389 units): "company" measures **3.87 em** from the c's centre to the
y's. Over a half-circle, that is a radius of only **~1.23 em**. Turned letters (v1's reading) would collide at their
feet (m–p, by about 0.03 to 0.04 em). **Upright letters do not fan, but they crowd DIAGONALLY on the arch's shoulders**
(around 45°): a step of ~0.6 em between centres puts neighbours ~0.42 em apart on each axis, while a lowercase letter
is ~0.55 em wide and ~0.53 em tall. Whether their INK touches depends on the shapes, so it is **measured, not
estimated**. Carl's lever, wider letter-spacing, grows the radius with the word. **The take's tracking is the smallest
that clears every pair by a margin** (below), found by measurement and then judged by Carl's eye.

## Proposed approach

### 1. The spec grows a layout part (`lettering-geometry.ts`)

`LetteringSpec.layout`: `{ kind: "line" }` (take 1, kept and reachable) or
`{ kind: "arch", top, arch, sweepDeg, archTrackingEm, topScale, gapEm }`. Defaults: `top "Your"`, `arch "company"`,
`sweepDeg 180`, `topScale 1`, `gapEm 0.25`, and `archTrackingEm` set from the measurement in step 3. ⚠ Takes for
Carl's eye. Both words, and every number, are parts.

### 2. The arch: `layoutArch(...)`, positions only

- **The browser sets both words**, each in its own kern-on span (with the arch's tracking for "company") and its own
  kern-off span for the font proof, as take 1 did for one line.
- ⛔ **The kerning reading subtracts the tracking:** kern = kern-on gap − kern-off gap − `archTrackingEm × sizePx`.
  Without that, every pair reads as kerned and the zero-pairs stop could never fire.
- **Each letter's centre** is its browser x plus half its JSON advance (the font proof has shown the two agree), at
  half the x-height (742 units, read from the "x" glyph). Kerning and tracking therefore carry onto the arc (finding 7).
- **The arc:** the distance between neighbouring centres becomes arc length on a circle whose **sweep is measured
  between the first and last letters' centres**. So the "c" sits exactly at the left foot (180°) and the "y" at the
  right (0°). `R = (c_last − c_first) / sweep`. **No rotation:** each letter keeps take 1's geometry, moved to its place.
- **The lintel "Your":** a straight line at `topScale × size`, centred on the arch's axis. **Its LOWEST INK sits
  `gapEm` above the arch's HIGHEST INK** (finding 6), so a client word with descenders stays clear.
- The whole lockup is re-centred on its bounding box, so the camera frames it as one object.
- **Sweep is clamped to 20°–200°.** Below 20° the radius runs away; the line layout serves that (finding 4).

### 3. The collision check, which can see an overlap (finding 2)

For **EVERY pair of letters in the lockup** (both words, not only neighbours, since upright letters at the feet and
shoulders sit above and beside each other), using their outlines as placed (`extractPoints` at `curveSegments`):
1. **Intersection first:** any outline segment of one crossing a segment of the other, OR any point of one inside the
   other (even-odd). Either is a **COLLISION**.
2. Only if they do not intersect: the **clearance**, the minimum point-to-segment distance, **measured both ways**
   (A's points against B's segments, and B's against A's).
- **Cost, kept off the slider:** only pairs whose bounding boxes come within the margin get the full outline test (most
  of the 55 pairs are far apart), and the check runs **once the slider stops** (debounced), not on every tick. Its time
  is recorded separately from the layout time.
A collision, or a clearance under the margin (**0.02 em**, ~3 px at 160 px), is shown on the bench in plain words.
`live-work/scripts/film04-arch-tracking-22-october.mjs` sweeps `archTrackingEm` from 0 in 0.005 em steps and reports
the smallest value that clears every pair by the margin. **Positions per step are worked out from the tracking-0
browser reading** (each letter shifted by its index × tracking × size, which is exactly how letter-spacing adds), and
**the chosen value is then confirmed with one real browser reading** on the bench. **That is take 2's tracking.**
(The Architect's estimate: at tracking 0, a–n overlaps by ~0.09 em and c–o clears by only ~0.012 em, so the red run
should fire on a–n.) ⚠ The check is shown red once:
at tracking 0 it must report at least one collision (expected: a–n); if it reports none, the check is examined before
it is trusted.

### 4. The bench (`showcase-bench.tsx`, `app/proto/showcase/page.tsx`)

- Four measuring spans (kern-on and kern-off for each line), one line each, clipped, as take 1's. ⛔ **The two kern-on
  spans are the accessible text, in reading order: "Your", then "company".**
- **Each letter is its own mesh, built ONCE** per shape spec (size, depth, edge, smoothness, words). Sweep, gap and the
  lintel's place move the meshes only. Nothing is re-extruded on a slider tick (finding 4). The build time and the
  layout time are recorded separately; a tick over 33 ms is reported. **Take 1's line layout keeps its merged build**,
  so its regression numbers stand.
- **Framing fits width AND height** (the lockup is tall).
- Switches: `?layout=arch|line`, `?top=`, `?arch=`, `?sweep=`, `?archtrack=`, `?topscale=`, `?gap=`, plus take 1's.
  Sliders for sweep, arch tracking, top scale and gap. Two word boxes. **Default `layout=arch`.**

### 5. Capture (film 04, `03 Pass 1 - Mesh`, label `take2`)

Stills of every mode and view, an orbit, the tracking measurement's output, and **a sweep run** (the straight word
bending up into the arch, from 20° to 180°: the geometry happening). 1080p30 CFR.

## Structural contract (§5a / §5b)

- **Files:** the three showcase files only (Carl-named, open), plus measurement scripts in `live-work/`.
- **No new mechanism:** the same per-character build, `measureLabel` and canvas. ⚠ **One change of structure inside the
  bench:** the arch draws one mesh per letter instead of one merged mesh, so the slider moves letters without
  rebuilding them. Rejected: re-merging on every tick (it would stutter and could not be filmed in real time).
- **§5b, what take 1 provides and how it is kept:** the line layout and its merged build (`?layout=line`, unchanged);
  the font proof and kerning (per line); the silhouette check (kept for the line; on the arch the all-pairs collision
  check replaces it); the accessible text (both lines, in order); the swap (both words editable).

## Verification

1. Both lines: font proof ✅ within 0.1 px; kerned pairs > 0.
2. The feet: the "c" centre at 180° and the "y" at 0°, within 0.1°; every letter's rotation exactly 0.
3. The collision check goes red at tracking 0 (or is examined); at take 2's tracking, every pair is clear by ≥ 0.02 em,
   the lintel included. The tracking value and the tightest pair are recorded.
4. Take 1 unchanged at `?layout=line`: 13,676 triangles and the same silhouette gaps as recorded in R-088.
5. Slider ticks: layout time per tick recorded; no re-extrusion on sweep, gap or tracking-free moves.
6. `tsc` clean; lint at 1 error, 0 warnings; no console errors; no sideways scroll.
7. Looked at in every mode before Carl is shown it. Servers stopped before any checkpoint.

## Stop conditions

- No tracking up to 0.3 em clears every pair: stop and report (the lever is then Carl's again).
- A font proof fails on either line: stop.
- Anything outside the three showcase files: stop and ask.

## For Carl's eye (from the brief, not defects; the Architect's notes)

- **The spacing will look uneven round the arch.** Upright letters crowd most on the shoulders, so the tracking that
  clears them leaves the crown and the feet looser.
- **The arch is not symmetrical.** The crown falls between the m and the p: three letters on the left side, four on
  the right.
- **The y's tail drops below the c.** The feet share a baseline, but the y's descender hangs lower.

## The Architect's findings on v2 (changes in v2.1)

| # | Finding | Change |
|---|---|---|
| 1 | With tracking on, the kern reading measures tracking | The tracking subtracted from each pair |
| 2 | All-pairs collision could stutter the sweep | Bounding-box pre-filter; run when the slider stops; timed separately |
| 3 | Where the tracking sweep gets positions; clearance both ways | Derived from the tracking-0 reading, confirmed by one browser reading; both ways |
| 4 | The expected red run | Recorded: a–n should fire at tracking 0 |

## The Architect's findings on v1, mapped

| # | Finding | Change in v2 |
|---|---|---|
| 1 | The default arch collides; the lever is Carl's, before the build | Put to Carl: **wider letter-spacing**. The value is found by measurement |
| 2 | Minimum point distance cannot see an overlap | Intersection first (crossing segments, point in polygon), then distance; every pair |
| 3 | "Upright feet" was ambiguous; three readings | Put to Carl: **all upright** (no rotation) |
| 4 | Sweep 0 and the slider's cost | Sweep clamped 20°–200°; letters built once, only moved |
| 5 | The fan stat said cap height | Dropped: upright letters do not fan |
| 6 | The lintel gap from its lowest ink | Lowest ink of the top word to highest ink of the arch; the lintel in the collision check |
| 7 | Centres from the browser's positions | Browser x plus half the JSON advance, so kerning and tracking carry |
