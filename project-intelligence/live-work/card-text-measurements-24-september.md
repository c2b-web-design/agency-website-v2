# Card text — pre-build measurements, 24 September 2026 (D-094 step 2)

**Status:** measurement only. Nothing built. The route is not confirmed, so these numbers inform the
plan and do not decide it. Carl authorised this step and step 1 on 24 September. Plan mode is his to open.

**Method:** a read-only probe against `npm run dev` at `/about?neon=full#roles`. Headed Chromium with
the GPU, `deviceScaleFactor` 1, viewports 1440x900 and 1920x1080. The scene is reached through three's
own `__THREE_DEVTOOLS__` `observe` hook, with no product code touched. Faces are identified by their
161x81 grid plus a `uv` attribute (exactly four found), and labelled by screen position. Scripts are in
the session scratchpad, not in `verify/`: this is a one-off probe, not an instrument. ⚠ **This is a
single run.** The geometry is deterministic, but the sizes are only valid for the current camera, the
current cards and these two viewports.

## Step 1 — the copy is in one module

- `components/about/about-card-copy.ts` (new) holds all four cards: `id`, `role`, `position`,
  `body` and `keepLine` (D-077's do-not-cut line).
- `wall-card-text.tsx` now reads CA/CB from it.
- ✔ **Checked character for character** against the "FINAL FORM, 4 September" quotes in
  `about-section-thinking.md` and against the old inline strings: all match. Each `keepLine`
  appears verbatim in its `body`. There are no control characters; the only non-ASCII character is
  U+2014 (em dash).
- ⚠ **CS is 56 words, not the 55 recorded** in the sprint entry, the thinking file and five dated `live-work/` files. **Corrected in all of them the same day, on Carl's instruction.** D-077 carries no count. The text
  is identical; the recorded count is off by one.
- `tsc` is clean. Lint is at baseline: `1 problem (1 error, 0 warnings)`.

## Step 2 — the faces

| card | face mm (w x h) | crown mm | screen px @1440 | screen px @1920 | px/mm across the face, @1440 (u / v) |
|---|---|---|---|---|---|
| CA | 1220 x 477 | 40.9 | 373 x 161 | 448 x 193 | 0.22–0.39 / 0.24–0.37 |
| CB | 1092 x 443 | 38.0 | 345 x 198 | 415 x 237 | 0.16–0.51 / 0.23–0.48 |
| CD | 757 x 346 | 29.6 | 498 x 299 | 597 x 359 | 0.43–0.94 / 0.38–0.85 |
| CS | 731 x 334 | 28.6 | 345 x 386 | 414 x 464 | 0.25–0.99 / 0.30–0.97 |

⚠ **The spread in px/mm is the perspective.** On CB the densest point is about 3x the sparsest.

### The dome under the text block

- **Tilt from the built normals, inside a 90% x 85% block: 15.8° on all four.** It is the same on all
  four because the crown is a ratio of height (`TENT_POLE_RATIO` 0.073).
- **On screen, the dome moves the text by up to 2.9 / 8.2 / 8.1 / 14.0 px** (CA/CB/CD/CS, 1440),
  compared with the same face built flat.
- **A straight line of text bows on screen.** Deviation from its chord @1440:

| | CA | CB | CD | CS |
|---|---|---|---|---|
| column 5% in from each side (the justified edges) | 0.0–0.8 | 1.5 | 0.6–1.2 | 2.2–2.5 |
| centre column | 2.5 | 8.2 | 3.3 | 12.9 |
| middle row (a line of text) | 0.8 | 1.2 | **7.8** | **11.0** |

  ⚠ **The flat control reads 0.00 on every line**, as a plane's projection should. So every bow in
  the table is the dome.
- ⚠ **What this means:** the justified edges stay near-straight, within 2.5px. Lines through the
  middle of the floor cards curve visibly, by 8–11px at 1440 and 9–13px at 1920. That is the text
  following the glass, which is what D-094 asked for. **Whether it reads as the glass or as a fault
  is Carl's call by eye.**
- Two vertices per face, in two opposite rounded corners (u ≈ ±0.987, v ≈ ±0.968), have normals at
  about 89°. These are corner artefacts, outside any text block. Not investigated.

### Texture budget — one text texture per card, 1 texel per device pixel at the face's densest point

| | CA | CB | CD | CS | all four, R8 + mips | all four, RGBA + mips |
|---|---|---|---|---|---|---|
| 1440 DPR 1 | 474x176 | 554x214 | 715x293 | 722x325 | 0.82 MiB | 3.29 MiB |
| 1920 DPR 1 | 569x211 | 665x256 | 858x352 | 866x391 | 1.18 MiB | 4.73 MiB |
| 1920 DPR 2 | 1138x422 | 1330x512 | 1716x704 | 1732x782 | **4.73 MiB** | 18.94 MiB |

- ⛔ **D-086's feared 32 MiB per card does not hold here.** Sized to the real face, with one channel,
  all four together cost under 5 MiB at the worst case measured.
- The largest texture needed is 1732 px, against a maximum texture size of 16384. The scene today
  holds one image map (the 2560x1707 plate) among 14 GPU textures.
- ⚠ **The canvas DPR is clamped `[1, 2]`.** Carl's display DPR has not been measured.

### Fit — the copy, justified in Geist, at the real face shape

The text block is **assumed** to be 90% x 85% of the face; the margins are undecided. Line-height is
1.35, as in the overlay. This is the **largest** em that fits, not a recommended size.

| card | largest em | lines | widest gap, browser's own breaks | on-screen em @1440 | @1920 |
|---|---|---|---|---|---|
| CA | 37.6 mm | 7 | 3.4x a space | 9.0–13.9 px | 10.9–16.5 px |
| CB | 34.9 mm | 8 | 2.1x | **8.0**–16.7 px | 9.4–20.2 px |
| CD | 31.2 mm | 7 | 2.8x | 11.8–26.5 px | 14.3–31.5 px |
| CS | 29.8 mm | 7 | 4.0x | 9.0–28.9 px | 10.7–34.9 px |

- ⛔⛔ **THE FIT CARL JUDGED DOES NOT TRANSFER.** The overlay set Geist 16 in a **420x260 box
  (aspect 1.615)**, which is the aspect D-082 disproved by 42%. The real faces are **2.2–2.6:1**.
  In the overlay, CA's em was about **49.6 mm**; at the real face the most that fits is **37.6 mm
  (−24%)**. For CB the drop is 44.5 → 34.9 mm (−22%). The overlay's line breaks therefore cannot be
  reused; the setting has to be done afresh at the real shape.
- ⚠ **CB's far edge renders the largest fitting size at an 8 px em at 1440.** That is D-077's
  recorded "legibility budget", now measured. Under D-094's order it is the point where the setting
  runs out and card size becomes the next remedy.
- ⚠ **The browser's greedy breaks leave gaps of 2–4x a normal space.** This is the evidence for
  D-094's chosen-break plan: the justification has to be ours.
