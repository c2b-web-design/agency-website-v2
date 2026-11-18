# Session Handoff — 18 November 2026 (Wednesday). THE FLOOR BUILT; PHASE 2 APPROVED (R-109); PHASE 3 STARTS WITH THE CODE DROPS

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"✔ CARL: THE STEAM APPROVED (18 November 2026)"* to the end: every beat, with
Carl's words. Session ended on Carl's word: *"im on 44% till compaction. Write a handoff"*.

## ⛔ NEXT SESSION — WHAT IS OPEN

**⛔ THE SESSION's SHAPE (Carl, 18 November 2026):** *"so the prep is done, the code is alraedy built, literally, it shouldnt
take long to implement. Then we can spend the majurity of the session on the cloth."* → **the CODE DROPS first and QUICK**
(the rulings are in D-101, 16 November; the rain's code is `player-bench.tsx`'s — reuse it), **then the CLOTH for the
majority of the session.** Still name the files and ask before the first edit; the approved `player-bench.tsx` is touched
only on Carl's word.

0. **⛔ FIRST: THE CLOTH — STATIC, AN OBJECT THROUGH IT** (Carl, after the handoff was written: *"we will build the cloth
   first. Static. we will put an object through it while its static. Like it is on the site and in the video, look at the
   interaction. we will develop from there."*). ⛔ Then, asked to commit: *"yes, code drops then cloth."* — **THE STORY's ORDER stays code drops → cloth** (phase 3 starts with the drops, which initiate the drying). ✔ **CONFIRMED (Carl): *"the code drops are first"* — the BUILD order is CODE DROPS, THEN THE CLOTH** (was: confirm the BUILD order — his *"we will build the cloth first"* (read as: built first) against *"code drops then cloth"* (the story's order, or the build's?). The cloth as described: a STATIC cloth (hanging, not yet
   moving through space), and an OBJECT passed through it, as `webgpu_compute_cloth` does on threejs.org and in Carl's film
   — study THE INTERACTION. **Homework first** (the memory rule): the reference film `Videos\C2B Films\03 The hero\00
   References\cloth-8-november.mp4` (contact sheet), the example's source at r185 (and today's r187 — the projector
   example changed between them), and our own scene's matching pieces (the steam's and rain's compute, `hero-scene.ts`).
   Then develop from there, on Carl's word. Files: name them and ask.

1. **⛔ THE CODE DROPS REUSE `/about`'s CODE RAIN — READ D-101's 16 NOVEMBER ENTRIES FIRST** (*"HOMEWORK DONE: THE LOGO IN `/about` §3's PLAYER"* to *"THE OPTION OF A CUT TO CAM 2"*: every code-drop ruling is there; Carl, 18 November: *"weve already dicussed the code drop. read the notes"*) (Carl: *"most of the work has been done, you dont have to do it from
   scratvh"*): `player-bench.tsx`'s `CODE_RAIN` / `rainAtlas` — the characters, colours, glowing head, flares — carried into
   the hero (homework done: `00 References\about-code-rain-18-november.webm`, D-101). ⚠ `player-bench.tsx` is APPROVED
   (R-086/R-087): exporting or moving the atlas to a shared file is a §5a choice for the note, named to Carl first.
1. **⛔ PHASE 3 STARTS WITH THE CODE DROPS** (Carl: *"The code drops can be seen as the start of Phase 3. i described them as
   an in joke. This may be true but they can have a function too - to inutiate the drying process."*). The 16 November
   rulings stand: ~3 CHOSEN drops in the rain's LAST BAND (~170 drops in the air as the last starts down, `00:00:31:10`),
   ALL landing on the logo, AUTHORED (spots on the top edges, release times, staggered turning heights); once code, always
   code; no slow motion; glyphs sized in the WORLD; the camera then not at Home (Cam 2 candidate to the side, along the
   logo's edge). **OPEN, Carl's:** what a code drop's LANDING does to START THE DRYING (the spot it hits dries first and
   spreads? the first landing sets the whole logo drying?). The Builder's 16 November note: no splash. Nothing built.
1a. **⛔ THE BRAINSTORM AFTER THE PUSH — PHASE 3's END (Carl: *"all for the next session. We got the makings of a great idea
   to develop."*):** `live-work/hero-concept-8-november/brainstorm-plinth-18-november.md` (D-101, from *"THE BLUE WEB SHRINKS
   WITH EACH WIPE"*). The blue web shrinks with each wipe as the gold appears; the drying done → the gold logo at rest on the
   floor → SPOTLIGHTS to showcase, PROJECTED MARBLE on the floor (2D) → a plain ROUNDED BLOCK rises slowly out of the floor
   (the same projected marble wrapping it in 3D, *"a plinth but not so ostentatious as to build a real one"*) → the LOGO
   GROWS as it rises. Open (Carl's): "rotating" (the marble flowing or the block turning); the text's size; the drying's
   how; the timings. Not built; a structural note before it is.
2. **Phase 3 after the drops:** the cloth MOVES (its pins the hand, an authored path), the logo JUMPS to meet it (CHOSEN —
   wet, it jumps; dry, it is C-3PO gold); after the cloth: TBD, Carl's. **Carried in: THE BLUE FLOOR** (the solid logo's
   web after the rain) is phase 3's starting state (R-109).
3. **Gandalf's fireworks** (c, 2, b from the pointer for 2 s once gold) — open: each letter's life, a still/absent
   pointer, colour.
4. **Asked, not answered (16 November):** the camera bench's plotted-moves tool; a storyboard form.
5. **Flags, not chased:** the console warning *"Draw with a vertex count of 0"*; the emission's square dissolve chunks side
   on; the one-off pink tint.

## THE FLOOR — WHERE IT STANDS (`components/hero/hero-floor.ts`, new; D-101; R-109)

One unlit ADDITIVE glow at the floor, three SOURCE SLOTS, the example's cellular webs (`mx_worley_noise_float(…).pow(2)`,
r187's) drifting outward (a zoom, two cross-faded copies). FORM A: seen only where heat shows it. Hidden until the warm-up
has built it and whenever it adds under one 8-bit level; `renderOrder` −1. The **Heat floor** folder holds every dial.

- **1, the lean (left):** from its CONTACT EDGE (`leanFloorContact`, x −490.94, z 130.37); radius **250 cm** (Carl);
  opens inside out over **2.5 s** from the logo's fade-in start; closes outside in over 2.5 s from lift-off (story 2.0).
- **2, the amber liquid (centre, the disc's centre):** from touchdown it grows with the DISC × 3 at half the logo's heat;
  the FIRST BLOB in the disc (story 6.76) SUPERCHARGES it (1.4, `#c81400`), and each of the first three hits (6.76, 6.86,
  7.06) steps it out toward **350 cm** at 100 cm/s (the steps merge on screen: Carl, *"caused by the world ... i wont
  know until i see it"*); from the second-to-last carrier touch (15.98) it shrinks steadily to NOTHING exactly when the
  logo is FULL (22.21).
- **3, the solid logo (right):** from its landing (23.69) at its base, the LEAN's web, spread over 2.5 s, held; **THE RAIN
  TURNS IT BLUE** (`#3a78d8`): fast where the rain falls (its disc's density × 4/s), slower outside (0.5/s, falling away
  over 80 cm) — Carl: *"Excellent!"*. It reads the RAIN, not `hero-heat.ts` (a stated departure from the note's [R9]).
- **Seen, not ruled (Carl's to judge):** the amber disc reads BLACK from above; the zoom's cross-fade can look busier (two
  webs); the red → blue passes through PURPLE; the blue reads dimmer than the red; the floor is dark 22.21 – 23.69.
- **Raised, for later (Carl):** the subtext stands on the floor and *"might conduct some of the heat ... We will get to that"*.
- **⚠ The note's checks NOT YET DONE:** the fade frames and touchdown → hide with the floor present vs absent ([R5][T1]),
  the warm-up's pipeline log ([R6]), the frame cost (D-108). **`heatPlane` NOT YET retired into the floor** ([R7]): two
  floor planes still exist (the 13 November blob glow and this).

## ⛔ STANDING — CARL's

- **Target 1 December 2026** (was 19 November; Carl: *"im gonna be busy juggling both the site and rhe game"*).
- **THE ORDER TO THE FINISH** (16 November): finish building the hero → camera direction, its own phase → the hero on the
  site → edit film 3 → the four films on the site → Send → mastering.
- ⛔ **A QUESTION IN A BRIEF IS ANSWERED, NOT BUILT** (today: *"When it jumps, does the pattern fade?"* — the Builder built a
  fade; Carl: *"I did not tell you to make it fade ... How can i judge it againsy other objects when its there
  fleetingly?"*). **A new element stays ON and visible until Carl tunes it.** Memory updated.
- **Show the reference's look first:** the webs were held back as "step 2" and Carl saw *"just a red glow"*.
- **Scope:** `components/hero/hero-floor.ts` added (`chunk-scope.json`, `_heroFloor18Nov`, Carl: *"Yes, all three"*); the
  hero files stay open (no lock asked). ⛔ **Name the files and ask before the first code edit, every session.**
- **A FIX MUST NOT CHANGE THE STORY. SOMETHING IS ALWAYS MOVING. Best first.**

## LESSONS (today)

- **Measure what hides a layer:** the liquid's web was drawn but hidden under the disc (3 cm up) and the blobs — found by a
  floor on/off pixel diff, not by its numbers.
- **Following a moving thing inherits its jumps:** the supercharge followed the disc, which jumps as blobs land (~320 cm/s).
- **The review rounds (four) caught real faults** — `lean.contact` is the t's, not the floor's; a cooling comparison
  backwards; the draw order during the fade; the blobs' time (4.72 s) against a "from the blobs on" claim.
- **`git add` refuses a TRACKED file in an ignored folder** without `-f` — and the commit then goes nowhere quietly.
- **A lint warning was committed on 16 November** (`a4b08f8`, recorded as 0 warnings) — fixed today (`3c3838c`). Run lint
  and read its last line before writing "0 warnings".

## SCRIPTS (all `live-work/scripts/`, today)

`hero-floor-circle`, `-mask`, `-extent-times`, `-liquid`, `-steps`, `-sources-late`, `-rain-cold` (the floor by time,
frame-stepped, with stills); `hero-floor-probe`, `-onoff` (state / pixel diffs); `hero-arrival-read`, `hero-first-blob`,
`hero-reform-read` (the story's times from the scene); `floor-sketch-run`, `threejs-*-shot` (the threejs.org sketch).
The threejs.dev sketch: `live-work/floor-sketch-18-november/` (step 1 only; Carl chose the bench).

## STATE

- **COMMITTED AND PUSHED** to `753a2ed` (the floor `b87747a`, the lint fix `3c3838c`, the records): tsc clean; lint at the
  baseline (1 error, 0 warnings); a clean-checkout build before the floor's push.
- **The screen capture STOPPED** (`01 Discussion\2026-11-18_discussion_screen.remux.mkv`, 2:45:18; raw kept).
- **The dev server is STOPPED** (the whole `next dev` tree killed at Carl's word, port 3000 free).
- The Architect note v1.5 and its review (four rounds): `live-work/structural-note-floor-lean-18-november.md`,
  `review-floor-lean-note-18-november.md`.

---

*Written 18 November 2026.*
