# Session Handoff — 20 November 2026 (Friday), session 1. THE CODE DROPS APPROVED (R-110); THE CLOTH BUILT, STEP BY STEP; NEXT: SESSION 2, THE CLOTH CONTINUES

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"THE LAST BAND's HITS ON THE LOGO, MEASURED ON THE GPU (20 November 2026)"* to
the end: every beat with Carl's words. Session ended on Carl's word: *"compaction is 46%. Write a handoff. connit and push.
stop the capture and keep the server up. We will start a new convo and go into session 2."*

## ⛔ NEXT SESSION (session 2) — THE CLOTH CONTINUES

Nothing is set as the first item: ask Carl. **What is open, all Carl's:**

1. **THE CLOTH — what next.** Built and committed as step-by-step takes (below). Open: **how and when it APPEARS** (*"the
   cloth wont be there from the start. We will decide how and when it appears"*); the HAND (its pins carried on an authored
   path — with a 230 cm cloth, a rail/bar or two hands at the corners, *"like buffing with a chamois"* was the Builder's
   aside, not ruled); the LOGO's COLLISION with it (the steam's voxel solid mask is the candidate shape; the rain's hit map
   sees from above only); the JUMP to meet it (CHOSEN 16 November); the DRYING to gold (a field over the face, like the
   temperature's). Each likely a §5a note — the Architect: *"We may consult the architect, but not yet."*
2. **THE CLOTH's COLOUR:** C, ultramarine **#2E3FC8** — *"the colour does look better. we will judge it again when we get to
   the gold transition"* (against the gold AND the wet platinum blue #3F6DB8).
3. **THE CODE DROPS' LANDING → THE DRYING:** what a landing does to start the drying — open since 16 November.
4. **THE RAIN AND STEAM ARE OFF BY DEFAULT ON THE BENCH, FOR NOW** (`HERO_RAIN_DEFAULTS.on`, `HERO_STEAM_DEFAULTS.on` =
   false, marked in the code) — Carl: *"for now ... turn off the rain and steam"*; *"its ok if the logo stays red for now"*.
   ⛔ **TURN THEM BACK ON when Carl says.** With the rain off the logo and floor stay RED (no wash, no cooling).
5. **Carried:** the plinth brainstorm (`live-work/hero-concept-8-november/brainstorm-plinth-18-november.md`); Gandalf's
   fireworks; the floor's notes not done ([R5][T1][R6][R7], `heatPlane` not retired); the camera bench's plotted-moves tool
   and a storyboard form (asked, not answered).

## ⛔ SESSION 2's SUBJECT: MOVEMENT AND CHOREOGRAPHY (Carl, after the handoff: *"we move on to monement and choreography"*)

**Read first in D-101 (16 November, session 3 — the rulings are there, don't re-derive or re-ask):** *"PHASE 3 — THE CLOTH
MOVES THROUGH SPACE AND THE LOGO JUMPS UP TO MEET IT"*, *"THE LOGO's JUMP TO MEET THE CLOTH: CHOSEN"*, *"THE CAMERA CAN HIDE
PART OF A TRANSITION"*, *"variations on a theme"*, *"THE CAMERA STORY IS PLACE, TIME, MOVE, DURATION — AND THE NEXT MARK"*;
and 18 November's *"THE BLUE WEB SHRINKS WITH EACH WIPE"*. What they rule:

- **The CLOTH MOVES through space; its PINS are the HAND** — carried on an AUTHORED path with timing and easing (*"the
  camera's mathematics"*). Carl's 10 November inversion: the logo still, the cloth moves over it.
- **The LOGO JUMPS UP TO MEET IT (CHOSEN)** — no propulsion, it never flies; it jumps BECAUSE IT IS WET, to dry itself; the
  meeting MID-AIR; the cloth drapes over the letters' tops and slides off as the logo drops back (the Builder's 16 Nov
  reading, recorded). DRY = shiny gold (*"a shiny gold Threepio would be proud of"*). A theme with variations: phase 1's
  jump ECHOED.
- **The camera may hide part of the drying** once the behaviour is established; continuity when it returns.
- **Each move:** where, when, how, how long — and where it must be NEXT and by when (planned backward from the next mark).
- **The floor:** the blue web SHRINKS with each wipe as the gold appears (18 Nov).
- **(B) was chosen** so ONE pass covers the face (230 × 130 cm); (A) more passes stays a possible variation.

**The echo — phase 1's jumps, as built:** the lean → jump (R-105, *"Perfect"*: a 0.7 s ballistic hop, the lean straightened
in its own profile, landing on its end, the desk mark's wobble); the ARRIVAL (`hero-scene.ts`, `ARRIVAL = { holdS 2, apexCm
60, g 981 }`: a ballistic arc under real gravity, 981 cm/s²); the landing wobble `LAND_WOBBLE` (`components/showcase/
hero-logo.tsx`: 2 s, 3.75°/2.25°/1.125°/0.5625°).

**The machinery to know before planning (facts, not decisions):**
- **The cloth's pins never move today** (`hero-cloth.ts`: a fixed point `Return()`s from the step). Carrying them = writing
  the pins' positions from the hand's path each step (a uniform transform) — a change to the step; likely a §5a note.
- **The logo's collision with the cloth does not exist yet.** Candidates: the steam's voxel solid mask
  (`hero-maps.worker.ts`, `steamSolidMask` → `SteamMask`, a 3D grid at a cell size) as a 3D texture / distance field; the
  rain's hit map (`HitData`) sees from above only.
- **Authored paths with easing already exist** on the camera bench (`components/showcase/bench-chain.ts`: clips, shapes,
  the corkscrew maths; D-104) — the "camera's mathematics" the hand's path can borrow (a structural choice, named first).
- **The story's clock at phase 3:** phase 1 ends at `phase1End` (the wobble done) = the rain's start; the rain's last
  release ~31.23–31.30 s of story; the code drops land to ~31.9 s; the wash's last red ~1.5 s after the last drop. ⚠ With
  the rain OFF on the bench, none of phase 2/3's clock runs (`rain.sinceFirstLanding` NaN) — choreography timed on the rain
  needs it back on, or the cloth's own clock.
- **The cloth runs on its own clock from load** (`Cloth again` restarts) — not yet tied to the story.

## ⛔ THE WORKING CAMERA (Carl: *"this is the camera position we will contine from"*)

**position 675.5, −2.8, 2203.3; target 695.4, −0.4, 0.9; fov 45** — face on to the logo, ~5 m back. ⛔ **Build face on;
at stages Carl moves the camera to judge it IN 3D, for PHASE 5 (camera direction and movement).** The Builder's habit that
served: stills from four angles (`live-work/scripts/hero-cloth-views-20-november.mjs`: working, orbit ±40°, raised 25°).

## THE CLOTH — WHERE IT STANDS (`components/hero/hero-cloth.ts`, new; D-101)

three's `webgpu_compute_cloth` transcribed (r185 source = r187's but one constant), in its OWN units inside one group:
Verlet grid, pins (every 5th top point), structural + shear springs, two compute passes a step (springs; each point: damping
0.99, springs, gravity, wind), **360 steps/s on the bench's/story's time**; the sheen material (`MeshPhysicalNodeMaterial`,
opacity 0.85, sheen 1 white, sheen roughness 0.5, roughness 1), lit ONLY by its own environment (Royal Esplanade,
`public/hero-bench/royal_esplanade_2k.hdr.jpg`, prefiltered in the dark with the scene's maps — the primer), an EMPTY light
list, Neutral tone mapping in its output. Carl: *"All the parameters in the cloth are good."*

Carl's takes, in order: the example exactly (at his camera) → **face on, blue side to the front** → **directly ABOVE the
logo** (centred x 718.48, z −16.92) → **(B) BIGGER, 230 × 130 cm** at the example's point spacing (113 × 64 = 7,232 points,
28,399 springs, 23 pins, pins at world y 760) — (A) more passes RAISED, NOT CHOSEN → **the SPHERE DELETED** → **the GUSTS
SCALED TO THE CLOTH** (`gustSize` 1: the sheet sways as one; *"looks better, its not just influencing the bottom"*) →
**colour C**. The bench's **Cloth** folder: on, Cloth again, stiffness, wireframe, wind, gust size, material.

- **MEASURED:** clearance — lowest point y 164.9 vs the landed logo's top 20.71: **32.7 cm** clear
  (`hero-cloth-clearance-20-november.mjs`); cost — **~3–5 ms a frame** on this PC (`hero-cloth-cost-20-november.mjs`:
  59–60 fps on vs 71–91 off, Playwright's Chrome; D-108). The first swing rises above the pins (it starts flat): not a fault.
- **Not asked to change, noted:** blobs and cloth do not interact (not needed — they never share the stage).

## THE CODE DROPS — APPROVED (R-110; `components/hero/hero-code-drops.ts`, new; `hero-rain.ts`)

Every last-band drop that will land on the logo (the rain decides at release, from the hit map) turns to `/about`'s code at
a height of its own and falls at **0.5 × the rain's speed** (*"Its not slow mo and its not rain either"*), drains into the
logo, no splash. The glyphs from `components/code-rain-atlas.ts` (moved verbatim from `player-bench.tsx`, one source).
Measured 2–4 a run (GPU read-back); 0 band splashes on the logo over every checked run.

## ⛔ STANDING — CARL's

- **Target 1 December 2026.** The order to the finish (16 November) unchanged.
- **Name the files and ask before the first code edit, every session.** Open in `chunk-scope.json` (kept open, *"keep open
  until i ask you to lock and test"*): the hero files, `code-rain-atlas.ts`, `player-bench.tsx`, `hero-code-drops.ts`,
  `hero-cloth.ts`, the HDR.
- **A question in a brief is answered, not built** (twice today it was a question — wind, blobs — and answered only).
- **Approval includes the record:** C and the scaled wind are TAKES (*"looks better"*), not approvals.

## LESSONS (today)

- **A LINT WARNING WAS COMMITTED AGAIN** (`b34de82`: an edit to a check script after lint ran). Fixed (`38100c6`). Run lint
  after the LAST edit, read its last line, then commit.
- **I said "far less than the rain or the steam" before measuring** the bigger cloth: it measured ~3–5 ms. Price after
  measuring, never before.
- **The clean build:** `node project-intelligence/live-work/scripts/clean-build.mjs` (stage first; ~50 s; packages in
  `~/.c2b-clean-build`, reinstalled only when the lock file changes). ⛔ Never `cp -r node_modules` (>10 min today).
- **A check that judges by time alone misjudged** a pre-band drop landing on a low surface: track the cause (each drop's
  release), not a proxy. **Per-drop values decided in the vertex stage and passed on** (take 1's square glows: the fragment
  recomputed them).
- **The "vertex count of 0" warning was the liquid's empty marching-cubes draw** — fixed (`38100c6`).

## STATE

- **COMMITTED AND PUSHED** to the session's last commit (this handoff with it): the code drops `b34de82`; the empty-draw fix
  `38100c6`; the clean-build script `8ff7775`; the cloth `75f86b3`; colour C and the records with this handoff. Clean
  build passed before each push; tsc clean; lint at the baseline (1 error, 0 warnings).
- **The screen capture STOPPED:** `03 The hero\01 Discussion\2026-11-20_discussion_screen.remux.mkv` (3:23:07; raw kept).
- **The dev server is UP** (port 3000, at Carl's word — *"keep the server up"*).
- **Untracked, Carl's call:** `live-work/structural-note-code-drops-20-november.md` (the superseded draft — keep or delete).
- Films and stills today: `03 The hero\2026-11-20_code-drops_take1–3\`, `…_cloth-step1_take1–3\`, `…_cloth-bigger_take1\`,
  `…_cloth-no-sphere\`, `…_cloth-gusts-scaled\`, `…_cloth-colour-C\`.

---

*Written 20 November 2026, session 1.*
