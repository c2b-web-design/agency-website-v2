# A screenshot fires pointer events — the hover hold read as broken (12 October 2026, session 2)

**Subject:** the `Who we are` button's roll and its mouse-proximity HOLD (D-088, pass 1 reopened), bench `/proto/button?mode=clay&label=1&roll=1&scale=2`.

## What was measured, and what it seemed to say

`page.screenshot()` frames taken 1 s apart with the pointer 30 px above the button changed by ~25 000–48 000 channel values
(> 8) every second for 10 s — as much as the free roll. Read as: the hold does not hold.

## What was actually true

- **The hold works.** A probe of the roll's own state (angle, run, hold), read with NO screenshots: the angle settles on
  π (3.14159261…) in ~2 s, the run falls to 1.6e-9, and it stays there.
- **The screenshot releases it.** `data-hold` read `1` before one `page.screenshot({ clip })` and `0` after it. During the
  capture the page received two `pointermove` events at (376.5, 593.9) and (377.2, 594.6) — nowhere near the real pointer
  (712, 293) — which the proximity listener read as the pointer leaving.
- **Controls:** the roll frozen (`?rollat=0`, `?rollat=180`), pointer near → 0 change over 1 s. The renderer is stable; only
  the hold path reacts, because only it listens to the pointer.

## The rule this leaves

⛔ **Any capture of a pointer-driven state (hover, proximity, hold) taken with `page.screenshot()` in this Playwright/Chromium
setup is suspect: the capture itself fires pointer events.** Check state through a non-visual read (a probe or a `data-`
attribute) before and AFTER the capture. ⚠ Not watched: whether `recordVideo` (the film script) does the same — it does not
call `screenshot()` per frame, but it is unverified.

⚠ Not a product fault: a visitor's browser does not inject these events. Unverified on touch devices (no pointer to be near).
