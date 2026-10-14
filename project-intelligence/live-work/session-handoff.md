# Session Handoff — 14 October 2026 (end). §2's RETURN RULES BUILT; THE FILM'S DISCUSSION CAPTURED; `Next step` REDONE IN PLATINUM BLUE AND ON `/start`. NEXT: THE BUTTON'S LIGHT ON THE CARDS, AND THE CARDS' GLOW ON THE BUTTON.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**
**The full record: D-088's 14 October entries at the END of `decisions.md` (from "14 OCTOBER 2026 — §2's RETURN RULES, STEP 2"); R-052 – R-056 (`reviews/review-log.md`).**

---

## ⛔ WHERE THINGS STAND

**Pushed today:** `d81effa` (§2's return rules + card 1's prompt, R-052) and `351813b` (`Next step` redone, R-053 – R-056). ⚠ ONE LINE IS NOT COMMITTED: the last bullet of `decisions.md` (`351813b` itself and the relock) — commit it with the next change. This handoff is force-added (staged), not committed.

**What is on the site now:**
- **`/about` §2's return rules** (`neon-bloom.tsx` owns three states — fresh / playing / static): reaching §4 sends a playing §2 STATIC (neon off, cards empty); a 3 s linger in §3 re-arms it; the trigger reads both directions (the wipe past CA AND the wall in full view — a page opened at `#start` no longer strikes §2 unseen). **Card 1's FACE is the restart** (an invisible button cut to CA's outline; `#roles` and the runway `pointer-events-none`); "click to restart" large on the face in the cards' Geist (`CardPrompt`), flickering OFF with CA's ignition reversed as the rim strikes. The desk mark holds its first strike (stays lit in the player).
- **`/start`'s `Next step`** is the button family's PLATINUM BLUE member (`NEXT_LOOK`: #3F6DB8 paint, metalness 1, roughness 0.4, ice blue #CFE6FF words, the teal's lamp), drawn by the UNCHANGED `NextStepSurfaceHost`; it rolls at every question, holds near the pointer or on focus, draws nothing while hidden. `NextStepCanvas` (the August pill) is still in the file, unused on `/start` — for `/proto/nextstep`; remove once the redo is settled.
- **The traveller (the moving light over the Q&A cards) is DARK by default** — mounted and moving at intensity 0; `?traveller=1` restores it. Carl: *"The travelling light will be repositioned because ot the new button we are adding, I dont want to see its effects on the page, not yet."*
- **Locks:** every code file touched today is RELOCKED and tested. `chunk-scope.json` is on `nextstep-family-bench` with only the governance files open — replace it for the next chunk; Carl names the files.
- **Dev server RUNNING on :3000** (started this session) — stop it by PID and confirm the port free if a checkpoint opens.

## ⛔⛔ NEXT SESSION — CARL'S NEXT SUBJECT

**The button's light on the cards, and the cards' warm glow on the button** (Carl: *"thats what we are going to look at next"*). The facts to start from (`live-work/structural-note-nextstep-rollout-14-october.md` §5):
- **Today the button's light reaches the cards NOT AT ALL, by construction** — the button's lamps live in its own scene and canvas; a WebGL light lights only its own scene. For it to fall on the cards, a twin of the lamp must be placed in the cards' scene (same path in page space, same clock) — the natural role for the traveller, which is dark and due to be repositioned.
- **The cards' glow on the button** (D-031/D-032, the CSS era) has been dead since the mesh took over and its 3D equivalent (`AmberSource`) was parked at 0 by Carl in August (*"something i will return to"*). The new button has no amber source at all — it would go into the family scene (a light or the environment), not CSS.
- A frame with both sets of helpers (the button's lamp path, the cards' scene) would show where a twin light would land — offered, not built.
- ⚠ Structural (§5a) if a light is shared or a clock is coupled across the two canvases — write it up first.

## ⚠ OPEN — WITH OWNERS

- **Carl:** whether the platinum button's roughness should move toward the desk mark's 0.25 (the same base blue #3F6DB8, lit differently — asked, not answered); the traveller's new position; the restart prompt's 60% "in §4" share (the Builder's reuse of §3's figure); the player's idle content (undecided — R-052's notes); the word "approved" for R-050/R-051/R-052/R-054/R-055/R-056 (all recorded at "looks good").
- **Builder:** reduced motion, phones and production not looked at for either of today's builds; the words' keyboard focus ring on card 1's face is clipped by the outline (mastering); `NextStepCanvas` and its diagnostics (`?nobtnmesh`, `?mounttrace`) to retire with the old pill.

## ⚠ STANDING / CORRECTIONS THIS SESSION

- **The film:** `Videos\C2B Films\01 Who we are button\01 Discussion\` holds three clean stills (the family; the 3D world; the build brief + HDRI, Carl's own capture), misses kept and logged in `shot-list.md`. ⛔ **From film 2, Carl screen-records the discussion LIVE** (memory `feedback_film_capture_independently`). The chat panel pins the current prompt, collapses long messages to three lines, and a reply written before a tool call may not render before a capture.
- **Carl's rule, restated:** *"the use of WebGL lighting should differ depending on the environment a particular button is in"* — each button lit by its world.
- **The desk mark's latch (Carl):** it stays in the player once the SCROLL crosses the §2/§3 boundary (the line reaching the window's top); between disappearing into the player and that point it can be pulled back. ⛔ **No fault** — the Builder's "jump fault" was withdrawn (its evidence was the player's placeholder picture, which is always there).
- **`page.screenshot()` fires stray pointer events** — read hover/hold state after they settle (bit check 6 once today).
- **A focused element removed from the DOM fires no blur** — any focus store must clear on unmount (the "only rolls on Q5" bug).
- **The React Compiler lint lets a component write only to a prop it recognises as a ref** — name it `…Ref` (`restartRef`).
- **Builder slips this session:** a control-byte check that silently checked nothing (`grep -P` refused the locale — redone in Python with a planted control); a "fault" asserted from a frame that could not show it (the placeholder picture); a first-run 1,017 ms reveal frame that was the dev server rebuilding (not reproduced in six runs — A/B interleaved before believing a cost).

---

*Written 14 October 2026, end of session. Replaces the 13 October handoff.*
