# /start — the logo transition after Begin, observed (8 October 2026)

**Asked by Carl:** *"Go look at the start page after the 'begin' button is pressed and observe and note the logo
transition."* Context: it is the model for the desk mark's gold → platinum-blue crossing (D-088, 7 October entries).

**Filmed:** `screenshots/start-logo-8-october/` — `realtime/` (as it plays, from the click), `seeked/` (the animation
paused at exact times, 0 → 1300 ms every 100 ms), `readings.json` (the computed `clip-path` at each step).
Script: `scripts/start-logo-film-8-october.mjs`. Headed Chrome, real GPU, 1412 × 700, DPR 4, dev server.

## What it is (code: `app/start/page.tsx` gold mark; `app/globals.css` `enquiry-logo-radial-in`)

- Two flat images stacked: the BLUE underneath at full opacity, the GOLD on top at full opacity. Only the gold is masked.
- The mask is `clip-path: circle()`, centred on the NAIL (50.05 %, 45.86 % of the gold's box), shrinking
  **75 % → 0 %** over **1300 ms, linear**. No crossfade (removed 27 August), so the edge is HARD.
- It starts on the Begin click. The reverse (`enquiry-logo-radial-out`, inside out, back to gold) plays at completion.
  It was not filmed today.

## What it looks like, in order (`seeked/`)

| time | what is on screen |
|---|---|
| 0–300 ms | **Nothing visibly changes.** The circle is shrinking through the box's empty corners. |
| ~400 ms | Blue enters at **both ends at once**: the c's outer left and the b's outer right. |
| 500–700 ms | The blue closes inward from both sides. The edge cuts across the strokes as **near-vertical arcs**: the c's bowl, the b's bowl and stem, the 2's base. |
| 900 ms | Only the **2's diagonal** is gold. A thin gold strip runs from the 2's upper arc down to the base. |
| 1100 ms | A short gold segment remains, mid-diagonal. |
| 1200 ms | A **small gold chip on the 2's diagonal**: the last gold. |
| 1300 ms | All blue. It rests blue through the Q+A (`page-after.png`). |

## Observations

1. **About the first quarter is dead time.** 75 % is set to clear the box's corners, but the mark is wide and short,
   so its corners are empty. The visible change runs over roughly 300 → 1300 ms. ⚠ This explains the 7 October
   finding that Begin's own button reveal is mostly invisible: the same overshoot carried over from the button.
2. **It reads as a pincer from left and right, not a closing ring.** That comes from the mark's shape, a wide mark
   under a centred circle, rather than from the motion itself.
3. **The last gold is on the 2's diagonal**, at the nail. This matches the desk mark's measured end point,
   `logoMarkCentre()` (0, 0.5, depth/2).
4. **The edge is a cut, not a light.** Both images are pre-lit artwork, so neither metal reacts to the edge passing.
   There is no glow and no feather.
5. **Linear radius.** The strokes are consumed fastest mid-way, where the circle crosses the most stroke length. The
   end lingers briefly as the chip.
6. **A fine blue hairline shows around the gold at rest** (`seeked/0000ms.png`, lower edges). This is the known
   0.29 px aspect difference between the two artworks, now visible because the blue sits permanently underneath.
   It is recorded in the code comment at the blue mark as a property of the artwork. Not new.

## What it means for the desk mark's crossing (for the plan; Carl's to rule)

- **Seen face-on, a sphere about `logoMarkCentre()` cuts the flat face in a circle**, so the bench's `front` view
  should reproduce these frames. That gives a direct check of the 3D crossing against `/start`.
- ⚠ **The 3D version has an END dead zone that the 2D one does not.** The centre sits INSIDE the solid, at
  depth/2 (20.5 px) behind the face. So the last visible gold leaves the surface when the sphere's radius reaches the
  nearest SURFACE point, about 20.5 px (the face, front or back; the 2's side wall is 22 px), not 0. If the crossing
  maps 0 → 1 onto radius R_max → 0, the end of the scroll would run with nothing changing.
- **The start has the same choice /start made.** Begin at the furthest surface point (to be measured), so movement
  starts at progress 0. Or keep a deliberate lead-in, as /start has by accident.
- **The 2D pincer depends on the camera.** In the tumble the mark turns, so the blue will close in from whichever end
  is furthest at the moment. That is the "tied to the object" property and it is intended.
- `/start`'s pace (1300 ms, on a click) is not the desk mark's. The crossing is *"smooth and deliberate"* and driven
  by the scroll (D-088).
