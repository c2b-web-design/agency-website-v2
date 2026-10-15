# Structural note — the answer cards bigger (15 October 2026, session 2)

**Status: PROPOSED. Nothing built.** CLAUDE.md §5a — a change to what sizes the card canvas and how its
world maps to the screen. Goes to Carl; Carl routes it to the Architect or rules on it.

**Carl (15 Oct, session 1):** *"if making the cards bigger, more pixels to work with, is an easy solution
then thats what we should do."* Reopened as *"a rework in this section"* (D-022 – D-024, the question flow).

---

## Measured (1920 × 1080, DPR 1, Q5 — `live-work/scripts/start-layout-room-15-october.mjs`)

| | top | bottom | size |
|---|---|---|---|
| Q5 question line | 513 | 544 | 310 × 31 (22 px text) |
| grid / card canvas | 561 | 665 | 576 × 104 |
| Next step host (after a pick) | 671 | 740 | 144 × 69 |
| viewport | | 1080 | — **~340 px free below Next step** |

⚠ NOT WATCHED: Q4–Q1, the complete state (contact field, Send), any width but 1920, phones.

## What sizes the cards today (read from the code)

- **The DOM grid is an empty box**: width from the `max-w-xl` shell (576), height an inline
  `minHeight: "6.5rem"` (104) — `enquiry-opening.tsx` ~L1985 (**PROTECTED**). No DOM cards exist; the hit
  targets are the canvas's own pointer targets, laid out from `cardBoxesAt`.
- **The canvas measures the grid** (`ResizeObserver`) and sets `cardScale = gridWidth / 576`. Every mesh —
  rim tube, bevel, face, corners, label texture — scales uniformly by it. **So a wider grid already draws
  bigger cards.** The 2048 × 512 label texture has ≥5× headroom at 2×.
- **Three fixed-height assumptions** would break: `cardBoxesAt` does not scale y/h; `cardSlotPosition` and
  `protoCanvasBox` use `GRID_HEIGHT_PX` 104 (`answer-card-backdrop-geometry.ts`, **PROTECTED**); the host
  placeholder in `enquiry-opening.tsx` falls back to the 576 × 104 constants.
- ⚠ **The LIGHTS ARE IN PIXELS.** The filament point lights (`FILAMENT_LIGHT_HEIGHT`,
  `FILAMENT_LIGHT_DISTANCE`, decay 2), the traveller spot (`REST_TRAVEL_DECAY`), the card point light at
  ~L547. One world unit = one CSS px (orthographic, `zoom: 1`). Scaling the meshes alone moves the cards
  apart and the tube up, while the lights keep their pixel heights and inverse-square falloff — **the
  approved lighting (the filament on its neighbours, D-029; R-061/R-062) would change.**
- No bloom or screen-space pass on the card canvas.

## The decision — two routes

**A. Scale the meshes (the existing mechanism, `cardScale`).** Already used below 576 px (phones).
Cost: the lit look changes and needs re-tuning by eye — light heights, distances and powers × s and s².
Every approved light value would be re-judged.

**B. Zoom the camera (RECOMMENDED).** The canvas becomes 576·s × 104·s; the orthographic camera's
`zoom = s`. **The whole world — meshes AND lights — is drawn s× larger; the scene itself does not change.**
The approved look is kept exactly, with s× the pixels. One number.
- Couples to: the pointer mapping (screen → world ÷ s), `pixelSlots` (screen px per world unit × s), the
  canvas box, the comment invariant *"one world unit == one CSS pixel"* (stated in ≥5 places — swept).
- ⚠ **It is a second scale mechanism beside `cardScale`** (the §5a test: "why is there a second X?").
  Answer: zoom scales the WORLD (lights included); `cardScale` scales only the CARDS. Below 576 px phones
  keep `cardScale` unchanged — phones are deferred to mastering (D-094). Unifying them (zoom at every
  width) is possible but changes phones; not proposed.

## What depends on the card size (§5b) — and how each is kept

| Depends | How kept |
|---|---|
| Pointer targets / hover / selection | derived from the same measured grid, ÷ zoom |
| Reveal ladder, entrance rise (6 world units) | world-space; becomes 6·s px — proportionate |
| Corridor step (depth-1 recede, 0.78, the host following the receding grid) | the host reads the grid's rect; unchanged in kind — **must be watched on screen** |
| Label texture | unchanged; the answer text grows with the card |
| Backdrop plane (`GRID * 2`, world units) | unchanged under B (world unchanged) |
| Next step's place (below the grid) | moves down with the taller grid; its host re-measures |
| Pixel snap (`useScreenPixelSnap`, `pixelSlots`) | k × s |
| Lights | unchanged under B |
| Phones (< 576 grid) | unchanged — `cardScale` as today |
| Q5 question text (22 px) | **unchanged unless Carl says** — see question 2 |

## Files Carl would need to name

`components/enquiry/enquiry-opening.tsx` (the grid box), `components/enquiry/answer-card-backdrop-geometry.ts`
(the fixed height), `app/globals.css` (if the grid's width is set there). Already open:
`answer-card-canvas.tsx`, `answer-card-geometry.ts`.

## For Carl

1. Route B (zoom), or A?
2. The question line: stays 22 px, or scales with the cards (as `#contact`'s text did with the home button, R-045)?
3. The size: built behind `?cardsize=` so it can be judged on your screen; first take at **1.5×** (grid 864 × 156,
   tube 6 px wide) or **2×** (1152 × 208, the buttons' factor, tube 8 px wide)?

---

## Carl's answer (15 Oct, session 2) and the probe that followed

Carl: *"Authorised to use"* (this note; route B) and named `enquiry-opening.tsx`,
`answer-card-backdrop-geometry.ts`, `globals.css`. Then widened it: ***"If the cards are made bigger change
everything else proportionately except the logo and header."***

**Mechanism tested by injection, no code changed** (`live-work/scripts/start-zoom-probe-15-october.mjs`,
`zoom: 1.5` on `.enquiry-shell-opening/-active`, 1920 × 1080, DPR 1, Q5 → Q1 → complete):

| | at 1.5× | needs |
|---|---|---|
| heading, corridor text, grid box, Send (DOM) | scale proportionately ✔ | — |
| shell `translateY(38vh − 5rem)` | zoomed too → everything ~110 px lower, Next step at y 1028–1089, OFF SCREEN | compensate (÷ zoom) |
| card canvas (fixed sibling) | width follows (864), height fixed 104 → cards cropped and overlapping | route B + the fixed height (files named) |
| Next step (fixed host) | host 174 × 61.5, mesh drawn at its old size | route B in `nextstep-canvas.tsx` — **NOT NAMED** |
| contact field canvas (INSIDE the shell) | R3F measures the zoomed box and sizes the canvas in zoomed space → **zoomed twice**: 1296 × 414 CSS on a 863 × 275 backing, right fields cut off, blurred | an un-zoomed wrapper + route B in `contact-field-canvas.tsx` (**PROTECTED**, not named) |

⚠ Carl's screenshot of Q1 is at ~1.355× Chrome zoom (the header's offset only solves at that) — a preview of
"everything ~1.35×", header included. His real density is 1.0 (`feedback_judge_at_carls_real_density`).

---

**Also found and fixed this session (in scope, uncommitted work):** a leftover `data-snapdbg` attribute on
the card canvas caused a hydration mismatch on every `/start` load (server 576 × 104, client 576.02 × 104.02;
Next.js showed "1 Issue"). Removed; the console is clean.
