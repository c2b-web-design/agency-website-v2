# Run log — all four cards' text, static. 24 September 2026 (session 2)

**Chunk:** `four-cards-static-text`. The scope guard was proved by a real denial (`card-text-timeline.ts`).

## Change
- `card-extrude.tsx`:
  - `extrudeCards()` (all four by default; `all`, one id, a comma list, `1`, `0`).
  - `still` setting (`?textstatic=`, default on): first full page, no clock, no self-invalidation.
  - The font is loaded once for every card (module-level promise).
  - Comments corrected in place.
- `about-card-canvas.tsx`:
  - `extrude` is now a per-card settings map.
  - The neon mounts only if a mounted card's `rim` is on, and passes only those channels.
  - The four text sites take `extrude.<id>`.
  - Stale comments corrected.

## Measured — headed GPU Chromium (AMD / D3D11), 1412×700 @1.36
| check | result |
|---|---|
| tsc / lint | clean / 1 problem (1 error, 0 warnings) |
| identity gate (`extrude=0` arms) | 0 px on all four |
| plain `/about` | marks ca/cb/cd/cs 1 each, ignite 0; the four console lines unchanged from the per-card runs |
| two loads, 6 s settle | **0 px differ**: static |
| long tasks (dev, buffered) | 106/600/152/428 and 128/614/158/429 ms |

⛔ **The H defect:** see D-094. A crude self-crossing test (sampled outlines, any segment crossing) flags h n a u r p m H B F among the 41 glyphs used. **By eye only H is broken** (CA, once).

## The "H" fix — typeface rebuilt from Vercel's static Geist

- Source: `npm pack geist` (v1.7.2) → `dist/fonts/geist-sans/Geist-Regular.ttf` (font version 1.800, with ttfautohint), converted by `scripts/build-geist-typeface.mjs`.
- Self-crossing check (the same crude test): current 10 of 41 used glyphs → Vercel 0. Advances (`ha`): 0 differences over 42 used characters. Vercel H: `m 247 0 l 128 0 l 128 986 l 247 986 l 247 554 l 743 554 l 743 986 l 863 986 l 863 0 l 743 0 l 743 438 l 247 438 l 247 0 z`.
- File: 34,048 → 32,914 bytes. ⚠ **An earlier "~198 KB" figure was a misread `ls` (the username has a space, so the columns shifted); corrected in place in `card-extrude.tsx` and D-094.**
- Plain `/about` recaptured: the four console lines match (lines/slots/gaps), tris ~9% lower. 20,743 px differ from the pre-fix frame, **all at letter shapes** (heat map: the H strongest, small spots at h/n/a/r joins).
- tsc clean; lint 1 problem (1 error, 0 warnings). ⚠ Identity gate NOT re-run: the neon page (`extrude=0`) loads no font and this change touches only the font and its build script.
