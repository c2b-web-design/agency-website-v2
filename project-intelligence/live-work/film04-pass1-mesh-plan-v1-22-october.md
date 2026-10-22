# Claude Plan: Film 4, the showcase. PASS 1: the lettering's mesh, in clay (D-088). VERSION 1 — AS FIRST REVIEWED

> ⚠ **SUPERSEDED.** Kept as the version the Architect's first response reviewed
> (`live-work/architect-plan-response-film04-pass1-22-october.md`). The approved plan is v4.1:
> `live-work/film04-pass1-mesh-plan-22-october.md`. Its main change: kerning comes from the browser (`measureLabel`),
> not a new converter reading opentype.js.

## Context

Film 4 is §3's box 4: a build that stays off the C2B site and is filmed. Carl widened it today (D-088, 22 October,
session 2) into a **two-viewport showcase of modern web development**: three.js extruded text and WebGL lighting lead,
with a few themed stock images later, showing features the C2B site does not use. It is also a **client template**: the
words, font, colour and pace are interchangeable parts from the first pass. It lives on a `/proto` bench, with a link we
can send to clients. The copy speaks in the client's voice ("Your company", "Your logo"), never invented company names.
**What matters is the technique and the layout.**

**The order (Carl):** the text alone first, in passes (**mesh, then material, then light**), each judged by eye; images
only once the words are approved. **This plan is pass 1: the shape of the words, in clay.**

## Proposed approach (summary of v1)

1. **A new general font converter** `scripts/build-showcase-typeface.mjs`: glyphs through `TTFLoader`; **kerning pairs
   read through opentype.js** (`three-stdlib/libs/opentype.js`, file-path import) and written into the JSON "in font
   units"; an overlap check that exits non-zero, seen red once on Google Fonts' Geist instance (10 known offenders).
   `build-geist-typeface.mjs` untouched.
2. **A lettering module** `components/showcase/lettering-geometry.ts`: a `LetteringSpec` (words, font, sizePx, tracking,
   kerning on/off, depth, bevel, curveSegments, lines); shapes per character at advance + kern + tracking; "one
   `ExtrudeGeometry`"; take 1's edge a narrow chamfer.
3. **The bench** `/proto/showcase`: server page + client bench as `/proto/corner`; noindex; clay and shape light;
   front/oblique views; clay/flat/mesh/normals/zebra modes; URL switches incl. `?kern=0|1`; `window.__showcaseBench`.
4. **Capture** into `Videos\C2B Films\04 Extruded lettering\`.

Structural contract: no existing file modified; a second converter and a second text layout named as new mechanisms
(rejected: generalising the Geist script; `TextGeometry`; `layoutCardText`); one canvas on the bench, the two-viewport
page's canvas deferred to its own note.

Carl's calls: Geist SemiBold for take 1; one line "Your company"; a narrow chamfer.

Verification: converter green on Geist SemiBold and red on Google Fonts' instance (exactly ten); tsc/lint baseline;
bench loads; the Y-o gap with `kern=1` vs `kern=0`; stills at DPR 1; servers stopped.

Stops: an overlap in the chosen font; opentype.js kerning not importable; build > 100 ms; anything outside scope.

⚠ *This file is a faithful SUMMARY of v1's sections, written by the Builder after approval; v1's full text was not saved
at the time. Every point the Architect's first response cites is kept.*
