# /start — the Begin button's entrance, observed (8 October 2026)

**Asked by Carl:** *"now look at the begin button which is an opposite transition."* The companion to
`start-logo-transition-observed-8-october.md` (the logo's gold → blue, outside in). Both are models for the desk
mark's crossing (D-088).

**Filmed:** `screenshots/start-begin-8-october/` — `realtime/` (as it plays), `seeked/` (the mask's animation paused
at exact times: every 50 ms to 1200 ms, then every 500 ms to 5000 ms), `readings.json` (clip-path, radius in px, and
whether the circle covers the pill's height, width and corners). Script: `scripts/start-begin-film-8-october.mjs`.
Headed Chrome, real GPU, 1412 × 700, DPR 3. The real-time frames match the seeked ones (7214 ms ≈ 300 ms in,
7507 ≈ 600, 7729 ≈ 800).

## What it is (code: `app/globals.css` `.enquiry-button-mask`, `enquiry-mask-reveal-radial`; `enquiry-opening.tsx`)

- **One state to another from NOTHING:** the ivory pill is revealed out of the dark page. No second state sits under it.
- The mask is `clip-path: circle()` on a **full-width row** (576 × 40 px), centred `at 50% 50%`. It is concentric
  with the pill to **0.006 px** (row centre 698.891, pill centre 698.886).
- **0 % → 150 % over 5000 ms, `cubic-bezier(0.37, 0, 0.63, 1)` (ease-in-out sine), from 7400 ms** after load
  (10 100 ms on mobile). The edge is hard: no feather, no fade.
- The click target is a sibling of the mask and becomes live at `animationstart`, before anything is visible.

## What it looks like, in order (`seeked/`; radius from `readings.json`)

| into the track | radius | what is on screen |
|---|---|---|
| 0–100 ms | ≤ 0.6 px | Nothing. |
| 150 ms | 1.3 px | **A pinpoint of ivory**, on the "e/g", the pill's centre. |
| 300 ms | 5.3 px | A small disc showing "eg". |
| 450 ms | 12 px | A disc showing "Begi". |
| 600 ms | 21 px | The disc **touches the pill's top and bottom** (half-height 20 px). "Begin" whole. |
| 750 ms | 33 px | **A barrel**: flat top and bottom from the pill, curved sides from the circle, moving outward. |
| 850–900 ms | 42–47 px | The curved sides reach the rounded ends. The pill's full width is covered at 900 ms. |
| ~950 ms | 52 px | **Complete**, corners included. The drop shadow fills in last. |
| 950–5000 ms | → 612 px | **Nothing visible.** 81 % of the track runs over empty row. |

## Observations

1. **The visible phrase is under a second, about 150 → 950 ms of a 5000 ms track.** The reason is that the circle
   resolves against the full-width row (a 408 px reference), not the 86 × 40 px pill.
2. **So only the EASE-IN half of the curve is ever seen.** It starts imperceptibly slowly, then accelerates. At
   ~950 ms the radius is still speeding up (about 5 px per 50 ms) as it clears the pill, so the phrase **ends at full
   speed, with no settle**. The ease-out happens later, over nothing.
3. **It grows from a point**, the centre, and **the logo shrinks TO a point**, the nail. These are the two directions
   of one gesture.
4. **The stages mirror the logo's.** Both shapes are wide and short (pill 86 × 40, mark 70 × 40). Inside out, the
   circle meets the TOP AND BOTTOM first and the reveal becomes a barrel. Outside in, the circle meets the ENDS first
   and the logo's blue comes in as a pincer from left and right.
5. **Same family as the logo:** a hard edge, a centred circle, no light on the edge.
6. **Neither transition puts its whole timing curve on screen.** The logo shows the last ~77 % of a linear track
   (about 300 ms of dead lead-in). Begin shows the first ~19 % of an eased one (a 4 s dead tail). Both are
   by-products of the circle's reference box being bigger than the artwork, not choices.

## What it means for the desk mark's crossing (for the plan; Carl's to rule)

- **Map the crossing's 0 → 1 onto the VISIBLE radius window only.** That runs from the furthest surface point of the
  solid (to be measured) down to the nearest surface point to `logoMarkCentre()` (≈ 20.5 px, the face; see the logo
  note). Then whatever easing is chosen is seen whole. That is the control *"smooth and deliberate"* needs, and
  neither 2D version has it.
- **The 3D crossing still ends at a point, as both 2D gestures do.** At the end, the last gold on the face is a disc
  shrinking to the point in front of the centre. It also shrinks on the back face, which is hidden on the desk and
  may be seen in the tumble.
- **Begin reveals from nothing; the desk mark crosses between two metals.** The logo, not Begin, is the closer model
  for the material change. Begin's lessons are the point-of-origin and the easing.
