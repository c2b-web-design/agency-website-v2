# Run log — CB's extruded text, one card per load. 24 September 2026 (session 2)

**Chunk:** `cb-extruded-text-dry`. The scope guard was re-scoped and proved by a real denial (`about-card-mesh.tsx`).

## Change

- `card-extrude.tsx`:
  - `extrudeCard()` and `EXTRUDE_WORKING_CARD = "cb"`; `extrudeEnabled()` = a card is selected.
  - `LIGHT_DISTANCE_MM` is exported; a `lightDistanceMm` prop (default 900, CA's) feeds the spot's position and the shadow camera's near/far.
  - Comments corrected in place.
- `about-card-canvas.tsx`:
  - CB's `AboutCardMesh` receives shadows when selected.
  - `CardExtrudedText id="cb"` is added, with `lightDistanceMm = 900 × cb.face / ca.face`.
  - CA's text and shadow now key on `extrudeCardId === "ca"`.

## Measured — headed GPU Chromium (AMD / D3D11), 1412×700 @1.36

| check | result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run lint` | 1 problem (1 error, 0 warnings): the known baseline |
| plain `/about` | marks `cb:1`, `ca:0`, `ignite:0`. `cb extrude: 12 lines, 5 slots, erase 3 lines behind · 52mm … 94,744 tris · pass 38.9s … grace 6.7s · widest gap 2.43x` |
| `?extrude=ca` vs the pre-change plain capture | 786 / 1215 / 255 px at 4 / 12 / 26 s, **all inside CA's wipe** (noise floor 959 / 79 / 684) |
| CB at 12 s vs `?extrude=0&neon=none` (no spot) | 70,778 px, all on CB's face except **15 px at delta 1, on CA's right-hand rim** |
| long tasks, plain | 119 / 614 / 188 / 315 / 317 ms (one dev run, buffered from load; not a cost figure) |

⚠ **NOT WATCHED:** the neon page (`?extrude=0`, unchanged code path; the identity gate was not re-run
this chunk); `?extrude=cd|cs` (no text is wired for them yet, so they mount nothing but the switches).

⚠ **Observed, not judged:** CB's far (left) side renders small and reads as sheared. That is the card's yaw
seen in perspective (D-094: *"CB's receding side"*). The specular hotspot sits at the top centre, as on CA.

✔ **Stale comment corrected** after Carl widened the scope: `about-card-mesh.tsx` (the face shadow belongs to the selected card). R-030 filed in the same widening.

## CB's far-side legibility — measured for Carl's size question

On-screen em in CSS px, 1412×700 @1.36, projected from the live text group (h = one em upright, w = one em along the line):

| | far edge | centre | near edge |
|---|---|---|---|
| CA (far = right) | h 10.9 · w 9.6 | h 12.2 · w 11.8 | h 13.9 · w 15.0 |
| CB (far = left) | **h 11.8 · w 8.1** | h 14.3 · w 11.9 | h 18.4 · w 19.1 |

- ⚠ **CB's far letters are not SMALLER than CA's far letters; they are SQUASHED.** CB's far width-to-height ratio is 0.69 (CA's far: 0.88), and its size falls 1.56× across one line (CA's: 1.28×). A bigger size scales both; **it cannot change the squash**, which is the yaw.
- Geist: x-height 0.53 em, cap height 0.71 em. CB's far x-height is ≈ 6.3 CSS px at 52 mm.
- **Size sweep (the component's own functions):** CB holds 5 lines per page, 3 pages, up to **59 mm**. At 60 mm it becomes 4 lines per page, 4 pages. CA at 52 mm has 6 lines per page and **drops to 5 at 54 mm**.

| em | CA | CB |
|---|---|---|
| 52 | 10 lines / 6 per page = 2 pages · 32.9 s · grace 7.7 s | 12 / 5 = 3 pages (last: 2 lines, final 0.45 wide) · 38.9 s · grace 6.7 s |
| 54 | 10 / 5 = 2 · 30.8 s · 5.6 s | 13 / 5 = 3 (last 3) · 38.1 s · 5.6 s |
| 56 | 11 / 5 = 3 (last: 1 line, 0.39 wide) · 29.8 s · 5.6 s · gap 5.0× | 13 / 5 = 3 · 38.1 s · 5.3 s · gap 7.0× |
| 58 | 11 / 5 = 3 (last: 1 line, 0.40) · 29.8 s · 5.3 s · gap 2.8× | 13 / 5 = 3 (last 3, final 0.90) · 37.8 s · 5.3 s · gap 3.9× |
| 60 | 12 / 5 = 3 · 29.8 s · 4.5 s · gap 7.3× | 14 / 4 = **4 pages** · 35.0 s · 3.1 s |

## CB: spot off, rim on (Carl: "On CB, turn off the light but turn on the rim")

- `EXTRUDE_SWITCHES` gives per-card defaults (CB: light off, rim on; CA: light on, rim off). `?textlight=` and `?textrim=` override. The spot is **unmounted** when off, not set to 0.
- The canvas passes `liveNeon` to `NeonBloom` and the cards: under the text take, **only the selected card's channel**; on the neon page (`?extrude=0`), all four as before.
- tsc clean; lint 1 problem (1 error, 0 warnings); **identity gate 0 px on all four arms** (the neon page is unchanged).
- Plain `/about`: marks `cb:1`, `ignite:1`. Only CB's rim is lit (checked by eye in the capture).
- Legibility at 26 s, the same words (spot → rim): near 1.84 → 1.78 · centre 1.78 → 1.82 · far 1.81 → 1.80. The ratio holds; absolute level drops ~20–25%. The spot's glossy hotspot is gone.

## CB: spot back on, rim on; depth 3 → 1.5 mm (Carl's diagnosis)

- `EXTRUDE_SWITCHES.cb` = spot on, rim on. `depthMm` defaults per card: CB 1.5, the rest 3.
- View angle off the face normal (camera ray against the text group's +Z), far / centre / near: **CA 23.7 / 12.1 / 4.0°** (far = right), **CB 46.5 / 37.4 / 25.5°** (far = left).
- Side wall as a fraction of a stroke's face ≈ (d ÷ 4.5 mm) × tan θ: at 3 mm, CA's worst 0.29 and CB's far 0.70. At 1.5 mm CB reads 0.35 / 0.26 / 0.16.
- Legibility at 26 s (spot + rim): 3 mm 1.82 / 1.76 / 1.76 → 1.5 mm 1.78 / 1.73 / 1.69. By eye (crops `cbboth-far` vs `cbd15-far`): the far words are less smeared.
- tsc clean; lint 1 problem (1 error, 0 warnings).

## CB light sweep — STOPPED by Carl part-way

`?lightyaw=` (swing about the face's vertical, − toward CB's far end) and `?lightaimx=` (aim across the face, half-widths) were added; defaults 0 reproduce the original position exactly.
At 26 s, spot + rim, depth 1.5 (word 95th/35th): yaw 0 → far 1.69 · −15 → 1.69 · −30 → 1.68 · −45 → 1.69 · −60 → 1.69 · +20 → 1.70. Nothing clipped (≥245) on CB's face at any setting. Level falls with the swing (near letters 122 → 97 at −60). **By eye the far words barely change; the reflection moves across the dome, toward the far top at −60.** Elevation, aim and intensity were NOT run. Carl then raised global lights (D-094).
