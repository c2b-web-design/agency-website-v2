# Session Handoff — 3 October 2026. THE CARDS' LIGHT REBUILT FROM ZERO (R-031: "both goals have been surpassed"); THE IMAGE SCROLL BUILT (D-092). NEXT: THE DESK MARK — DISCUSSION, PLAN, ARCHITECT.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔ WHERE THINGS STAND

**Everything is committed and pushed** (this handoff rides in the session's last commit). ⚠ Pushing `main` DEPLOYS —
live `/about` has all of the below. **No server is running.**

⛔ Carl works on plain `/about`, starts at the TOP, and either SCROLLS into §2 or presses "Roles".

**Built this session** (record: the 3 October entries at the END of `decisions.md` — the D-095 tail, then D-092's):

1. **THE CARDS' LIGHT, FROM ZERO** — ✔ **R-031**, Carl: *"both goals have been surpassed. It looks great!"*
   - Carl's two goals (the brief for any future light work): *"1. The glass face should clearly read as frosted glass
     and its geometry visible. 2. The text should be legible and be noticeably 3d, extruded."*
   - **ONE light**, `TakeLight` (`about-card-canvas.tsx`): directional, still, shadows on, **50° off the faces from
     upper-left**, the room's own orange (`#ff6528`, sampled from the plate) at 0.25 into white (*"Caused by the
     world"*), intensity 2. Faders `?takeoff= ?takeaz= ?takei= ?takemix= ?take=0`.
   - **The bevel capped** at 0.03 (`BEVEL_HIGHLIGHT_CAP`, `about-card-mesh.tsx`, `?bevelcap=`) — Carl's rule:
     *"Highlights or glints on the rim are good. Its when they are on the face that it looks bad."* Rim uncapped.
   - **Every earlier light REMOVED from the code** (Carl: *"As long as you dont change how it looks now, delete what
     is not needed"*): `about-moving-light.tsx` deleted, the ambient, the static key/fill, their faders. Measured
     pixel-identical (0 of 5,483,520 values; `live-work/scripts/identity-frames-3-october.mjs`). In git at `cec1eff`.
   - Combining /start's Q+A light and the client info's orbit was **RULED OUT** for this scene (*"it doesnt work
     here… back to the drawing board"*).
2. **THE IMAGE SCROLL — D-092 BUILT** (plan gate waived by Carl). One `RoomStage` (`about-card-canvas.tsx`), sticky
   behind §1 and §2: the room faded at 0.2 under §1, §2's room through a **top-down S-curve wipe** (0.3 of the window,
   `?wipegrad=`); **one wipe number** (`roomWipe`, `about-neon.ts`) read by the mask AND the trigger; the §2 sequence
   now strikes when **the wipe clears CA's bottom** (`roomWipeClearsCA`). ✔ Carl: *"It looks good apart from the thin
   black line"* — §2's `border-t` removed. Then: the gradient smoothed (the band was a linear fade's corners), and
   **a fault Carl found** — the room covered §3 (the stage's negative margin let it stick a window past §2) — fixed by
   moving the margin to §1. ⚠ **Not yet judged as finished:** the S-curve and the §3 fix had no verdict before close.

## ⛔⛔ NEXT SESSION — CARL'S ORDER

Carl: *"The cubby hole idea is discarded. Logo on desk will be built with Three js and be animated… Next phase will
need discussion, a plan and consultation with the Architect."*

- ⛔ **THE DESK MARK (D-088), three.js, ANIMATED.** ⛔ **FULL PROCESS — NOT WAIVED: discussion first, then Plan Mode,
  the Architect's plan-review gate, checkpoints.** Do not build before that.
- ⚠ **THE FIRST STRUCTURAL QUESTION FOR THE PLAN:** the room's stage now leaves with §2, so a mark inside the cards'
  canvas cannot follow the scroll into §3's player — D-088's *"hard part"* (3D scene → DOM player) is on the route.
- ⚠ Read D-088 whole (incl. its 22 September amendment) and the 3 October rulings at the end of `decisions.md`.
  Open, Carl's: D-065 (a second mark), D-063 (blue), reduced motion, ONE scroll source (`roomWipe` — reuse it), the
  §3 design authority (the thinking file says both *"i will take care of the design of section 3"* and later
  DELEGATED to the Builder — **ask**). §3 itself is a placeholder; its record: four filmed builds, selectors left,
  viewer right, the mark as the player's idle content.

## ⚠ OPEN ON WHAT WAS BUILT — CARL'S

- The image scroll: §1's last lines pass over the opaque room as they leave (no comment from Carl); scrolling back up
  fades the room again; reduced motion untouched; **phones not looked at**; `RoomPlate` lacks `priority` now it is on
  screen at first paint (`room-plate.tsx` is OUTSIDE the chunk's scope).
- Flash cap at 3 (at the cap) ~87–88 s; continuous rendering while text loops (carried).
- **RIM-DARK** (`open-defects.md`) may be resolved by the take light — Carl praised CS unlit against the wood; worth a
  deliberate look before he closes it. Its sibling ENVMAP-STALE is unaffected.
- The per-card text spots (`?textlight=1`, `card-extrude.tsx`) are still in the code, off.

## ⚠ STANDING INSTRUCTIONS AND CORRECTIONS FROM THIS SESSION

- ⛔ **Carl's Chrome had fallen back to SOFTWARE WebGL** (`--use-angle=d3d11-warp-webgl` on its GPU process) — the
  "stutter" was that. A full Chrome restart fixed it. **If Carl reports stutter, check the GPU process's flags first.**
- ⚠ **Twice the Builder handed over without checking the whole page**: the 25 September static-lights experiment's
  re-judge was never put to Carl, and the image scroll's walk stopped at §2 (the §3 overlap). **Walk past the edge of
  what changed.**
- Restate Carl's words in his terms; when an answer is ambiguous, ask once (carried, and it held this session).
- No em dashes in site copy (carried).

## ⚠ HOUSEKEEPING

- `live-work/chunk-scope.json` is still labelled `about-moving-light` and its file list includes the deleted
  `about-moving-light.tsx`; the desk mark is a NEW chunk — Carl sets its scope.
- Measurement scripts from this session are in `live-work/scripts/` (force-added); screenshot folders stay local.
- `live-work/structural-note-image-scroll-30-september.md` — the §5a note the build followed; force-added.
- Playwright: the first load of a context can land off `#roles` — the 3 October scripts check `#roles`' top and
  throw. Lint baseline: `1 problem (1 error, 0 warnings)`. Carl's machine: DPR 1.36, viewport ~1400 × 660–700 CSS.
- Shell quoting eats backticks: write edits as `.cjs` files or use the Edit tool (bit again this session).

---

*Written 3 October 2026. Replaces the 27 September handoff.*
