# Run log — CA's etched-glass text, 24 September 2026

**Plan:** `card-text-etch-plan-24-september.md` (amended after the Architect's review, **approved by
Carl**). **Scope:** `chunk-scope.json` (`ca-etched-text`), confirmed live by a **real denial** on
`wall-card-text.tsx` before any code changed.
**Status: BUILT. NOT COMMITTED. NO VERDICT** — Carl tunes by eye. Measured against the dev server,
headed, on ANGLE / AMD Radeon.

## Carl's rulings this chunk

- **The `sr-only` copy is OUT of this chunk.** Carl, 24 September: *"When the site is finished and
  the 'mastering' is taking place we will optimise for screen readers, mobile and anything else we
  need to."*
- **He judges on this machine.** Measured: `devicePixelRatio` **1.36**, screen **1412 x 795** CSS
  (a 1920 x 1080 panel at 136%). ⚠ **The 1440 x 900 captures are the closest to what he sees**;
  his usable viewport is narrower and shorter.

## What was built

| file | change |
|---|---|
| `components/about/card-etch.ts` | **NEW.** Candidates and ranged faders; the font gate (F2); greedy justified layout; paint; the loud fit check |
| `about-card-mesh.tsx` | `etch` prop; the texture effect (primitive deps, state set after the await, `initTexture`); **frost + glow sibling meshes sharing `faceGeometry`** |
| `about-neon.ts` | `NeonChannel` += `textGlow`, `textColor`, `textDepth`; stale comment corrected in place |
| `neon-bloom.tsx` | the writer's third depth; `darken()` zeroes it |
| `about-card-canvas.tsx` | `etch` memoised once per mount; CA's channel carries the depth; the fader list extended |
| `app/about/page.tsx` | **comment only:** the stale "NOT YET WRITTEN" corrected in place, keeping the held-empty point |

**Gates:** `tsc` is clean. `lint` is at `1 problem (1 error, 0 warnings)`, the baseline, with **no
suppression added** (a draft needed one; the builder's signature was changed instead).

## Measurements

| check | 1440 | 1920 | verdict |
|---|---|---|---|
| **identity** (`about-neon.mjs`), `none` / `off` | **0 px / 0 px** | **0 px / 0 px** | plain `/about` unchanged. The pass is suppressed as unproven (D-064). |
| **red arm**: `neon=off&etch=1` vs baseline | 16,010 px (max 40) | 19,442 px (max 44) | the comparison sees the text |
| **glow**: `full` vs `off`, in the text block | 39,705/39,705 px (max 75) | 57,198/57,198 | noise floor **0 px** (full vs full) |
| **the text's own glow** (etch lit−unlit, minus the same without etch) | Δ rgb(0, 2.9, 29.9), max 54 | Δ rgb(0, 3.3, 34.3), max 62 | **responds to the track** |
| **F1**: `etchop=0`, lit vs lit-without-etch | 16,224 px (max 54) | 19,707 px | **glows with no frost**, the "revealed" answer |
| F1: `etchop=0`, unlit vs unlit-without-etch | **0 px** | **0 px** | invisible unlit, as it should be |
| unlit contrast, glyph vs the same pixels without etch | **1.30 : 1** | **1.35 : 1** | ⚠ faint (see below) |

**The probe:**
- two text meshes on CA only (Standard/normal/renderOrder 1; Basic/additive/2), **same geometry
  uuid as the face**
- texture 1220 x 477
- paint **3.8 ms**, upload **2.7 ms**
- font gate passed; the fit log: **7 lines at 34 mm, block 321/405 tall, widest gap 3.18x a space,
  no dash-led lines**
- `?etchem=60` → `⛔ CA TEXT DOES NOT FIT … 12 lines … Nothing was trimmed` (the loud failure
  fires)
- `?neon=none&etch=1` → frost only, no glow mesh (S3)
- no page errors

**Orientation:** read by eye from the captures. **Not mirrored, not inverted.**

## ⚠ Findings for Carl

1. **⚠ STOP CONDITION HIT — A LONG TASK AT THE IGNITION (recorded, not tuned).**
   - The texture becomes ready **within 1 ms of `neon:ignite`** on a direct `#roles` landing: both
     wait on the scene's first load.
   - The long task at that moment:

     | run | long task |
     |---|---|
     | with etch | **249 ms** |
     | with etch | **114 ms** |
     | without etch | 68 ms |

   - **Attribution: probably the first-render compile of the two new programs** (paint and upload
     are under 7 ms together). ⚠ **Unverified.**
   - It lands in the ignition's **dark lead-in** (CA is dark ~700 ms before its first blip), so it
     may not be visible. **That is the Q5 pattern F3 named, and it is Carl's to rule on.**
   - Candidate remedies, not built: precompile the programs before the ignition (`gl.compileAsync`),
     or hold the ignition until the etch is ready.
2. **⚠ HUE: 234° against the 211° target (S4, fixed before measuring).**
   - The glow takes the tube colour `#1b2f8a` at face value. At the text's low intensity ACES
     barely shifts it, unlike the tube core at intensity 6.

     | `?etchhex=` | on-screen hue |
     |---|---|
     | `1b518a` | 217° |
     | `1b4789` | 222° |
     | **`1b5c8a`** | **210° ✔** |

   - **The default is NOT changed**, because the plan said tube colour. Try `?etchhex=1b5c8a`.
3. **⚠ Unlit contrast is about 1.3 : 1 at `etchop` 0.35.** Legible close up, faint at room scale.
   **This is the dial for "readable before the neon, or revealed by it?"**
4. **⚠ The setting is provisional and it shows.** Greedy breaks leave gaps of up to **3.2x a space**
   (line 2: *"development   environment,"*), and the last line is set left. **Not the setting; the
   fit chunk's job.**

## Files for Carl (scratchpad, not tracked)

- `etch-{1440,1920}-{off,full}.png`
- `etch-{1440,1920}-{off,full}-faredge.png` (1:1 crops of CA's far edge)
- `etch-1440-full-dpr2.png`
- `ca-{off,full}-zoom.png`

## To view

`npm run dev` is **RUNNING** (PID 18708). ⚠ **Stop it before any checkpoint opens.**
- `/about?etch=1&neon=full#roles` holds it lit
- `/about?etch=1&neon=off#roles` shows it unlit
- `/about?etch=1&reignite=10000#roles` replays the ignition
- Faders: `?etchop=`, `?etchglow=`, `?etchhex=`, `?etchem=`, `?etchrough=`, `?etchweight=`.
  Reload to apply.

## Carl: *"The text is not readable from this distance, it is too small. Can it be made to fit the entire card?"*

**The text-block size is now a fader:** `?etchbw=` / `?etchbh=` (0.5–1). `tsc` is clean and lint is
at baseline. The largest em that fits CA justified, in Geist:

| block | largest em | vs this take's 34 mm | on screen (captured at Carl's 1412 x 700) |
|---|---|---|---|
| 0.90 x 0.85 (this take) | 37.6 mm | +11% | — |
| **0.96 x 0.92** | 40.6 mm | **+18% at 40** | 7 lines; clears the bevel; the last line runs nearly full |
| 1.00 x 1.00 (the whole face) | 44.2 mm | **+30% at 44** | 8 lines, 475/477 tall. ⚠ Words touch the bevel at the right edge, and the rounded corner crowds the top right. Gaps reach 4.8x a space. |

⚠ **The face is the ceiling of the setting:** the rim is the neon and the bevel is not a writing
surface. If +18–30% is still not readable at room distance, **the next remedy in D-094's order is
the CARD SIZE**, then the words.

## Carl: *"Whats not helping is the colour. If its supposed to match the rim it is not doing that."*

**The rim's ON-SCREEN colour, measured on CA at 1440:** mean `#7eb7f3`, **hue 211°, sat 83%, light 72%**
(median `#84c1ff`). ⚠ **The tube is not its hex on screen.** At intensity 6, ACES pales it, and its
bloom (the navy glow, never tone-mapped) is added on top. The text is not bloomed, so matching the
tube's HEX can never match the rim as SEEN.

**Glyph cores (the brightest 10% of text pixels), at Carl's full-face setting
(`etchbw=1&etchbh=1&etchem=44`):**

| `?etchhex=` | `?etchglow=` | `?etchop=` | glyph cores | hue | sat | light |
|---|---|---|---|---|---|---|
| tube (default) | 0.05 (default) | 0.35 | `#506aaa` | 223° | 36% | 49% — the dim violet Carl saw |
| tube | 0.2 / 0.35 / 0.5 / 0.7 | 0.35 | → `#80a4f5` at 0.7 | 222° | 86% | 73% — the right brightness, **still violet** |
| `84c1ff` (pale) | 0.167–0.25 | 0.15–0.35 | `#abd8f2`–`#cfeaf7` | ~199–202° | ~71–75% | 81–89% — **overshoots: too pale, drifts cyan** |
| **`5c9cff`** | **0.1** | 0.35 | **`#80baf2`** | **209°** | **81%** | **72% — MATCHES THE RIM** |

By eye (Builder's capture): it reads as the rim's colour and is far more legible than the default.
⚠ **The defaults are NOT changed; this is a URL for Carl to judge.**

## CB added — the gate waived for this piece (Carl, D-094)

**New defaults, still behind `?etch=1`:** the whole face; the size per card (CA 44 / CB 40 mm); the
glow `#5c9cff` at 0.1. `tsc` is clean, lint is at baseline, the identity gate is **0 px on all four
arms**.

| | fit | rim as seen | glyph cores |
|---|---|---|---|
| CA | 8 lines, 475/477 mm, widest gap 4.81x | `#7fb7f3` 211° 83% 73% | `#80baf2` 209° 81% 72% |
| CB | 8 lines, 432/443 mm, widest gap **1.60x** | `#7db7f4` 211° 84% 72% | `#6db0f7` 211° 90% 70% |

⚠ **CB's on-screen type spans ~9 px (far/left) to ~19 px (near/right) at 1440**, about 2x across the
card, against ~1.5x on CA. By eye at Carl's 1412 x 700: correct orientation and the rim's colour;
the receding left side is the smallest text in the room.

## Extruded text — cost MEASURED (Carl: *"Is extrusion more costly… well placed light might bring the far edge into better legibility"*)

Carl also raised: **the text need not be on the card all at once** — the site already reveals text
(`/start`, the Q&A). ⚠ **Raised, not chosen.**

Measured in node on one core with three's `TextGeometry`, words merged per card, size 40, depth 4 mm.
⚠ **The font is a stand-in, Droid Sans** (the only typeface JSON installed). Geist would have to be
converted: a new asset and a new pipeline.

| profile | whole CA | whole CB | CB's biggest sentence (30 of 84 words) |
|---|---|---|---|
| no bevel, curve 4 | 126k tris · 11.5 MiB · 119 ms | 142k · 13.0 MiB · 90 ms | 57k · 5.2 MiB · **41 ms** |
| no bevel, curve 8 | 243k · 22.3 MiB · 151 ms | 275k · 25.2 MiB · 186 ms | 109k · 10.0 MiB · 68 ms |
| bevelled, curve 6 | 741k · 67.8 MiB · 495 ms | 838k · 76.8 MiB · 431 ms | 333k · 30.5 MiB · 188 ms |

CB's sentences are 7, 30, 15, 10 and 22 words. **For comparison, the etched build:** two textures of
~2.8 MiB each, painted in ~4 ms, on geometry the face already has. ⚠ Vertex data is non-indexed here;
indexing would roughly halve it (unmeasured).
