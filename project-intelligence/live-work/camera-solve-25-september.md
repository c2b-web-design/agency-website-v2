# The new room's camera is solved — 25 September 2026

**Status: MEASURED, with independent confirmations. Not approved.** Plan gate waived by Carl for the room swap:
*"We are swapping out the image and inserting our three js assets and re composing the image as described. So nothing is new here- only the image."*

Solved on the **master** `brand-assets/office-image-3.jpg` (**4000 × 2250**; every pixel figure below is in that frame
unless marked PLATE). Transferred to the plate `brand-assets/office-image-3-edited.png` (3632 × 2048) by the mapping in D-095.
Scripts: `live-work/scripts/camera-solve-office3.mjs`, `verticals-office3.mjs`, `verticals2-office3.mjs`.

## The result

| | master (4000 × 2250) | PLATE, squared to 3632 × 2035 |
|---|---|---|
| focal length | **2013.7 px** | **1828.8 px** |
| horizontal FOV | **89.6°** (18.1 mm equiv.) | 89.6° |
| vertical FOV (full frame) | 58.38° | **58.18°** (`PerspectiveCamera.fov` is VERTICAL) |
| pitch | **3.22° UP** (the old room was 12.68° DOWN) | same |
| roll | 0 (the two VPs agree in y to 4.7 px over 6700 px, 0.04°) | same |
| horizon | y 1238.3 (0.5504 of H), **below centre** | y 1120.2 of 2035 |
| principal point | image centre (assumed; the verticals support it, below) | (1816.2, 1017.3) vs centre (1816, 1017.5) |
| back-wall VP | (8065, 1240.6); the back wall is turned **18.4°** from face-on | |
| right-wall VP | (1329.3, 1236.0), inside the frame | |
| vertical VP (predicted) | (2000, −34 667) | |

**Inputs.** Back: the LED strip (rms 0.41 px over 2000 px) + the shelf strip (0.37). Right: the LED strip (0.51 over 792) + the shelf strip (0.40 over 744).
⚠ **Conditioning:** the back-wall VP is far away. Its x ±300 moves f to 1963–2063 (±2.5%); the right VP's x ±10 moves f ±15.
**Squaring the plate** is a 0.6% vertical DOWNSCALE (3632 × 2048 → 3632 × 2035), which D-073 allows. It makes the pixels square, so a single focal length applies.

## ⛔ The falsification tests: four could have failed, and none did

1. **A held-out right-wall line.** The skirting (rms 0.48, never fed in) passes the right VP within **8.6 px** from ~1700 px away.
2. **A held-out back-wall line.** The shelf top misses the back VP by 6.6 px (short run, weak).
3. **Verticals, predicted from the horizontals alone.** TV right edge: −0.0135 against **−0.0121 predicted** (rms 0.34). Desk end panel, right edge: +0.0431 against **+0.0476** (rms 0.65). Credenza edge at x 1332: −0.0177 against **−0.0184**.
4. **Five cabinet door gaps across the top (x 189–1894)** lean linearly in x, as a pinhole requires. The far-left one: **−0.048 against −0.052 predicted**. Their implied vertical VP is (1807, ≈ −33 000). **Pooling all 8 good verticals: VP x = 1920 ± 50 against a centre of 2000**, so a centred principal point is supported. Their convergence puts f at ~1966 (−2.4%), inside the conditioning band above.

**Overlay (Step 5): the fitted lines sit on the strips and the skirting, and the predicted verticals run parallel to the TV and end-panel edges.**

## ⛔ THE LEFT BOOKCASE IS NOT PLUMB — do not use it as a reference

Both edges of its side panel measure **upright in the IMAGE** (lean −0.0005 and +0.0016). The camera predicts **−0.041 to −0.043**, and the cabinet door gap directly above it leans −0.048 as predicted. **The render's bookcase leans; the camera does not.**
An overlay confirms it: the uprights follow pixel columns, not the predicted verticals. ⚠ **This nearly read as a failed solve.** Rigid geometry in the same column settled it.

## Failed instruments, recorded so they are not retried

| attempt | result | why |
|---|---|---|
| right-wall corner seam | rms 4.4 | visible for only ~100 px (the tower and shelf hide it) |
| desk end panel, left edge | rms 3.8–6 | two edges 30 px apart (side face and front face); the tracker hops |
| TV left edge | rms 6.9 | reflections on the bezel |
| cabinet door gaps at x 598, 2150, 2395 | rms 4.8–7.3 | the tracker left the gap |
| credenza drawer edges at x 295, 832, 1742 | rms 1.6–2.2 | handles and shadow lines near the edge |

## Not established

- **Scale.** Nothing in the room is measured in real units. The horizon (camera height) sits at about the TV's bottom edge (TV bottom y ≈ 1267 at x 1000).
- **The card corners.** By D-076, final corners are Carl's pins, checked against an independent feature. This file gives the camera they are placed through.
