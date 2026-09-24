# Run log — CA's extruded text, the "dry" take, 24 September 2026

**Carl's instruction:** *"At first try the lights centred and static… turned all the rims off… Keep
the light white… a 'dry' sound first… First just put the text in with the timings… No need to plan
or the architect."* ⛔ **The gate is WAIVED for this piece only** (D-094). **Scope:**
`chunk-scope.json` (`ca-extruded-text-dry`).
**Status: BUILT, NOT COMMITTED, NO VERDICT.** View it at `/about?extrude=1#roles`.

## Built

| file | what |
|---|---|
| `scripts/build-geist-typeface.mjs` + `public/fonts/geist-regular.typeface.json` (NEW) | Geist Regular from Google Fonts' TTF, converted with `opentype.js` (already installed in `three-stdlib`), subset to 96 glyphs, 33 KiB. The licence stays in `original_font_information`. |
| `components/about/card-text-timeline.ts` (NEW) | Pure. `setJustified` (the font's own advances) and `chase`: write and erase heads, the lag `floor(0.75 N)` capped at `N − 2`, the lead, the rest, `graceMs`, and a published `clipped` count |
| `components/about/card-extrude.tsx` (NEW) | Font load; one line built per macrotask; N slot meshes, each with two world-space clipping planes (reveal, erase); letters placed on the dome; one white spot, static, 45° DOWN from above-front, casting shadows |
| `about-card-mesh.tsx` | `faceDome` and `faceBaseZ` EXPORTED (the formula moved verbatim, so there is one source for the face AND the letters); `faceReceiveShadow` prop |
| `about-card-canvas.tsx` | `?extrude=1`: neon `none` (all rims plain glass, no bloom), etch off, `shadows="soft"`, local clipping in `onCreated`, the text inside CA's group |

## Gates

- `tsc` is clean. `lint` is at baseline with **no suppression added** (one draft mutated the renderer from a hook; that moved to `onCreated`).
- **Identity** `none`/`off`: **0 px** on all four arms after the change. ⚠ This also shows the `faceDome` move left the face byte-identical on screen.
- **The timeline, 3 passes at 50 ms steps, for 5/6/7 slots:** 0 slot clashes, 0 erases cut short.

## Measured (dev server, headed GPU, 1412 x 700 — Carl's viewport)

- **Font scale exact:** the browser's Geist `x` at 100 px measures 58.50 px; the typeface gives 58.54.
- **Setting:** **10 lines, 6 slots, the erase 4 lines behind**, 52 mm, 3 mm deep, **85,200 triangles**. Widest gap 4.41x (greedy, last line left: provisional).
- **Timing:** **pass 16.8 s at 240 wpm + a 1.5 s rest**. ⚠ **Grace 4.5 s** at its minimum: line 0, whose fast lead shortens its own life. **That is under the ~6 s a 200-wpm reader needs.** More slots help: at ~45 mm there are 7.
- **Cost:**
  - line builds **4–28 ms each** (no single long build)
  - ⚠ **a 309 ms long task at the clock's start**, probably the first render compiling the shadowed and clipped programs. **Recorded, not tuned.**
  - chase frames: p50 **16.7 ms**, p99 **17.2**, **one 117 ms hitch**

## Seen (the Builder's captures, 6 s / 16 s / 20 s)

1. ✔ Extruded Geist is **larger and clearer than the etch**, reads un-mirrored, and follows the card.
2. ✔ **The chase works as designed.** At 20 s the new pass writes at the top while the old pass's last lines wipe mid-card, and the paragraph restarts in the bottom slots.
3. ⚠ **THE SPOT'S SPECULAR HOTSPOT.** A bright pool on CA's glass, top-centre, **washes out the words passing through it** ("down" at 16 s, "the Architect" at 20 s). This is D-082's "street light", on the glass. The dials: `?lighti=`, `?lightangle=`, or the glass's own roughness (D-089, locked).
4. ⚠ **CA's glass reads greyer and paler under the spot.** A real light lights the approved glass (expected, D-094).
5. ⚠ **The shadows cannot be judged at this capture scale.** They are 3 mm deep at 45°, so ~3 mm long. Carl's eye decides.

## Light intensity 3 → 1.5

Carl: *"Turn down the light intensity, its too bright."* The spot's default `lightIntensity` is
halved, **3 → 1.5**. `?lighti=` still overrides it (0–50).

## Light intensity 1.5 → 0.5, and the angle is the real lever

Carl: *"its still too bright. Its making the word where its focused 'blown out'. It needs to be at a
level where the word is legible."*

**Measured at t = 20 s:** the contrast of a word against the glass directly behind it (95th vs
35th percentile luminance), comparing "the Architect" (in the hotspot) with "The technical
foundation" (outside it):

| `lighti` | angle | hotspot word | elsewhere |
|---|---|---|---|
| 1.5 | 45° | 1.87 : 1 | 2.83 : 1 |
| 1.0 | 45° | 2.02 | 2.89 |
| 0.75 | 45° | 2.09 | 2.86 |
| **0.5** | 45° | **2.22** | 2.82 |
| 0.3 | 45° | 2.32 | 2.77 |
| 0.5 | **60°** | **2.59** | 2.80 |
| 0.5 | 70° | 2.59 | 2.77 |

⚠ **Intensity plateaus.** The hotspot is the spot MIRRORED in the glossy dome, and dimming dims the
letters with it. **The angle moves the reflection:** 60° nearly closes the gap. ⚠ **But a steeper
angle lengthens the shadows** (depth × tan θ: ~3 mm at 45°, ~5 mm at 60°, ~8 mm at 70°, against a
~5 mm stroke). So **60° sits at the edge of ghosting and 70° is past it.** The default intensity is
now **0.5**; **the angle is NOT changed** (it is a shadow-length choice, Carl's).

⚠ **Correction:** the first sweep reported the hotspot contrast as FINE. Its box measured the words
against the dark gaps between lines, not against the glass right behind them. It was re-measured
tight around the words.

## The pass restarts at the top left; the pace slows to the start page's

Carl: *"The text reveal seems 'chaotic'… its too fast and with the start and endpoint being in the
card its off putting… once it has reached the end it should start again from the top left. To make
space for it have the preceeding text disappear. Only when the last word has disappeared then start
the cycle again. Slow it down to the speed of the start page text."*

- **The model** (`card-text-timeline.ts`): a pass ENDS by erasing everything left, at the same pace,
  line after line. The next pass begins on an EMPTY card at slot 0. Passes never overlap.
- **The pace: 240 → 171.4 wpm**, `START_PAGE_WPM`, DERIVED from `/start`'s subtext (12 words in
  4200 ms).
- **The lead is OFF:** at 0.35 the first line ran ~3x the pace (`?textlead=0.35` restores it).
- **The rest: 1.5 s → 0**, per *"only when the last word has disappeared"* (`?textrest=` adds one).

| | before | now |
|---|---|---|
| pace | 240 wpm (first line ~3x faster) | **171.4 wpm** throughout |
| one cycle | 16.8 s, and the restart continued mid-card | **32.9 s: 22.8 s writing + 10.2 s clearing**, then the restart on an empty card |
| grace (the shortest time from a line's reveal to its erase) | 4.5 s | **7.7 s** |

**The timeline is checked** against CA's real breaks (10 lines of 6,5,5,6,7,7,6,8,8,7 words; 6
slots; lag 4): 0 slot clashes, 0 erases cut short, every pass starts empty at slot 0. **In the
running page** (captures at 12 / 24 / 30 / 33.6 s): the last lines sit at the top after the in-pass
wrap, then the card clears, then "The technical fo…" begins top left on an empty card.

⚠ **For Carl:** the clearing takes **10.2 s** with nothing new appearing. A faster clear would echo
the Q&A cards leaving faster than they arrive (*"it's done its job"*). **Not built; his call.**

✔ **Verdict (Carl, by eye), on the pace and the pass model only:** *"This is a lot better… it is clearly 'pages' with a start and end. This i great."* Recorded in D-094 at that level.
