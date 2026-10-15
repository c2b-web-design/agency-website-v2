# Session Handoff — 15 October 2026 (session 2, end). THE WHOLE SITE NOW SCALES TO THE WINDOW CARL COMPOSED IN (D-097, site-wide, PUSHED). THE Q&A TUBE: THINNER, UNIFORM, WITH A FILAMENT-COLOURED BLOOM — "a lot better", BEHIND DOORS.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**
**The full record: the END of `decisions.md` — D-051's 15 October tail (corrected), D-097, then "D-051 (the answer card's corners) — 15 October 2026, session 2"; R-063 – R-066 (`reviews/review-log.md`).**

---

## ⛔⛔ THE FINDING THAT CHANGES HOW EVERYTHING IS JUDGED

**Carl's 1.36 was WINDOWS TEXT SIZE 136%** (`HKCU\Software\Microsoft\Accessibility\TextScaleFactor`), which Chrome multiplies into its scale — not a Chrome zoom (session 1 said so; WRONG, corrected in place in `decisions.md`). He built and approved the whole site at 1.36 in a ~1412 × 608 window. **He set it to 100% this session; `devicePixelRatio` now reads 1.** Carl: *"Coz im Sixty bloody Two and need glasses!!! lol"* — he declined a separate judging Chrome and kept 100%.

**D-097 (Carl: *"Yes, scale it all"*):** above 1412 px wide the whole page is `zoom`ed (design width 1412, height 608, ceiling 2.0; 1 below) so a 1920 screen shows what he approved. ⛔ **Before measuring ANYTHING on a page, read `lib/site-scale.ts`:** `getBoundingClientRect`/`innerWidth` are SCREEN px, CSS lengths are LAYOUT px, they differ by the zoom. A rect WRITTEN into CSS goes through `toLayoutPx`; every R3F canvas takes `resize={{ offsetSize: true }}` + `useCanvasDpr` (`lib/use-site-scale.ts`, client-only — `layout.tsx` is a Server Component); window heights use `var(--vh)`, never `vh`. **A new canvas without both props is zoomed twice.**

## WHERE THINGS STAND

- **Pushed this session (with session 1's card work, which had not been committed):** D-097 site-wide; the answer-card doors below; records.
- **On the page by default:** the scale (all pages, benches too); the Q&A cards exactly as R-062 (tube 2, the studio-reflecting rim, no bloom).
- **Behind doors on `/start` — ✔ *"Thats looking a lot better"* (R-066), NOT the default:** `http://localhost:3000/start?tube=1.5&rimuniform=1&tubebloom=1`
  - `?rimuniform=1` — the tube's reflection the same at every point of the path (the "defect in the middle of the curve" was the reflection sliding through the studio, NOT the curve's shape — the mesh corner is a true 90° arc, measured at 8×).
  - `?tube=` — the tube's radius (1.5 chosen; 4 RAISED AND NOT CHOSEN: *"out of proportion to the card"*). The answer text keeps its size whatever the tube (`labelRef` UVs).
  - `?tubebloom=` — a glow band (`TubeBloom`): `beyond` the tube in the filament's colour when lit; `over` the tube cool white at rest, faded as the filament lights (against `FILAMENT_INTENSITY`, not 1). Selected measures 249/193/131 vs the approved 247/195/144.
  - `?cardradius=` — Carl's right-angle-first method; no value chosen (default 14).

## ⛔⛔ NEXT SESSION (Carl goes straight into it)

Carl's word on the tube take: **make `?tube=1.5&rimuniform=1&tubebloom=1` the default?** (Then: the corner radius, the Next step button and phones with the new tube, a cold load, `?carddpr=` to remove if unused.)

## ⚠ OPEN — WITH OWNERS

- **Carl:** the tube take to default; the corner radius; the platinum blue `Next step` (*"the shade seems a little jarring"*, held); the traveller and the button's light on the cards (deferred); the TV check of the scale (he has it mirrored); every approval R-001 – R-062 was made at 1.36 — the scale reproduces it on a 1920 screen.
- **Builder:** production's cold load with the scale (first paint measured on DEV only — no jump); the HDRI's production arrival (session 1); Safari/Firefox `currentCSSZoom` unasserted (falls back to 1 — unscaled, never broken); phones untouched (scale 1) but not looked at.

## ⚠ STANDING / CORRECTIONS THIS SESSION

- ⛔ **The dev server served the PREVIOUS `globals.css` after `sed -i` / Python writes** — one edit behind until the next write (a `touch` did not wake it; an Edit-tool write did). After a scripted edit to a served file, CHECK THE SERVED FILE before measuring. The Builder first misread it as the CSS build "folding" `var(--vh)` — retracted. Memory `reference_dev_server_misses_scripted_writes`.
- **A comparison harness whose two arms run today's code cannot see a fault common to both** — `--vh` declared in `.dark` collapsed every home section and passed; Carl caught it (*"viewports are messed up"*). The site-scale harness now carries ABSOLUTE window checks.
- **Shell `grep -P` cannot scan for control bytes here — it fails silently.** Use a Node scan, and prove it on a planted byte first (done this session; 51 files clean).
- **Builder slips:** the first glow burnt the tube white (linear gain); read the filament's intensity as 0–1 (it is 0.45 lit); `--vh` edit anchored into `.dark`; a two-material `onBeforeCompile` edit half-applied (caught before it shipped — this canvas does not log shader errors, only a frame proves a shader).
- `npm run verify -- <script>` is the front door for `verify/`; session scripts live in `live-work/scripts/` (force-added).
- Lint baseline holds: 1 error, 0 warnings. **Dev server RUNNING on :3000 (PID 10108)** — stop by PID and confirm the port free before any checkpoint.
- **Locks:** `chunk-scope.json` widened this session by Carl's naming (`enquiry-opening.tsx`, `answer-card-backdrop-geometry.ts`, `globals.css`, `nextstep-canvas.tsx`, `contact-field-canvas.tsx`, `contact-field-inputs.tsx`, `app/layout.tsx`, `app/page.tsx` — the protected ones in `unlocked`) and by the approved plan (the scale's files, the benches). ⛔ Relock when Carl says.

---

*Written 15 October 2026, session 2, end. Replaces session 1's handoff.*
