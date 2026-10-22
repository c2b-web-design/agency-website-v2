# The drop traced against the player — 22 October 2026 (D-088, the same-logo fix, step 1)

Script: `live-work/scripts/drop-trace-22-october.mjs` (Carl's window 1920 × 952, dev server, `/about`, scroll in 25 px steps
through the drop window, 350 ms settle each). Frames: `screenshots/drop-trace-22-october/`.
⚠ NOT WATCHED: drawn pixels except the eight saved frames; phones; Carl's GPU; production.

## 1. Why 21 October's read-out "held near y ≈ 400" — NOT a read-out fault

- The drop is scroll-driven: it begins when the stage stops pinning (`scrollY` 1904) and ends one screen later (2856).
  From then on the canvas AND the player both scroll with the page.
- In the canvas (= in the player's frame) the mark falls under gravity from rest: relative to the player's top edge
  −403 px (drop 0.05) → −258 (0.50) → +3 (0.81) → +209 (1.00). Accelerating, as designed.
- On SCREEN, the page's scroll cancels most of that fall: the centre goes 743 → 450 (rising, drop 0–0.5), then holds
  at ~416–455 for drop 0.5–1.0. **The mark hovers; the player rises up through it.** That is the "stays near 400".
- ✔ The crossing exists: the player's top edge passes the mark's bottom at drop ≈ 0.71 (`scrollY` 2579), its centre at
  ≈ 0.81 (2679), its top at ≈ 0.92 (2779). Latched at 1.00 (2879), centre (1358, 436) vs the player's (1366, 453).
- ⚠ Small jitter late in the drop (cy 416 → 455, not monotone): the journey's lag behind the scroll (`DESK_MARK_TIE`)
  against a 350 ms settle. Not chased.

## 2. ⛔ PAINT ORDER — the room's canvas is UNDER the player

Every ancestor of both is `z-index: auto`; the player (`#examples-player`, `position: relative`, background
`rgb(5, 7, 10)`, opaque) comes after the room's canvas in the DOM, so **it paints over the canvas.** Today the top-edge
clip hides nothing that would have shown: below the edge the room's mark is already behind the player's background.
**So replacing the clip with a mask to the player's edges would draw the mark where nobody can see it.** The room's mark
inside the player needs a change of paint order or of the player's opacity: structural (CLAUDE.md §5a/§5b). Taken to Carl.

## 3. Seen in the frames

The clip at the top edge is exact (frame 036). Below it, 21 October's viewer copy is drawn dark navy against the room's
bright blue above (frame 042), the colour fault already recorded.

## 4. Step 2 built — option A (Carl: "Go with A")

Recorded in D-088 (22 October, step 2). Frames: `screenshots/drop-into-player-22-october/`, the hit:
`screenshots/hit-gap-22-october/`. The hand-over at the hit is INTERIM (the room's mark hides, the viewer's landing takes
over): dark navy replaces the room's blue; on a first arrival one frame showed the player empty. → step 3.
