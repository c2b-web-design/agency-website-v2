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
