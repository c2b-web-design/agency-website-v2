# Session Handoff — 13 November 2026 (Friday), session 2. THE HERO: ✔ PHASE 1 COMPLETE. NEXT: PHASE 2, THE RAIN

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"THE DISC GROWS FROM THE LANDING — TAKE 1 BUILT (13 November 2026, session
2"* to the end, every beat with Carl's words; R-106 in `reviews/review-log.md`.

## ⛔ WHERE IT STANDS

**PHASE 1 IS APPROVED WHOLE — R-106.** Carl: *"Phase 1 is mow complete and i can give my verdict. Outstanding! The added
animation to the floaty liquid logo is a great touch and we are yet to give it some icing on the cake with some camera
direction at the end of the phases. Great work."* Pushed `0f3b368`. All in `components/hero/hero-scene.ts` (the bench:
`hero-bench.tsx`), on `/proto/hero`:

1. The lean on the 3D t → holds 2 s → jumps into the middle of the dance → wobbles (session 1).
2. **The amber disc** grows from the landing (a radial mask), creeping, then FED by the blobs' arrivals (detected live,
   four steps) — ✔ *"Nailed it"*. **The orange light** comes with the blobs (each blob's 1/10 as it swells out).
3. The emission (3 s, top to bottom, eased) and **the 7 s dance** (the example's choreography).
4. **The re-forming** (`REFORM`): one blob leaves every 0.45 s; the three LOWEST take the disc's mass (it drains with
   them); the rest go DIRECT; all enter the mould's **c** from behind (the only part of the mould inside the field box).
5. **The fill** (`FLOW`, `logoFlowMap`): the SAME logo mesh at the mould, filled through its letters by a GRAVITY flow
   map made from its own geometry — the c, the 2's foot and the bottom stroke, up the 2 and over its top, round the b's
   bend, the b's stem from its foot up. 2.8 s a blob. As **LIQUID**: the blobs' mirror and courtyard, darker, a wavering
   surface and a bob (`LIQUID`).
6. **The hardening** (`harden`): once full, the whole logo dials to the solid family red over 1.2 s — ✔ *"i would expect
   the liquid logo to be darker. Lightening it adds to the hardening effect."* The solid is PIXEL-IDENTICAL to the lean's
   material (the null control `live-work/scripts/hero-logo-state-stills-13-november.mjs`).
7. **The fall** (`FALL`): hard → 40 cm straight down under gravity (0.29 s) → the arrival's wobble (2 s). The heat and
   the light are gone; the mould guide is OFF by default (Logo → "mould outline" to check it).
   Story times: re-forming 14.05 s, full ~22.2, hard 23.41, landed 23.69, **phase 1 ends 25.69 s**.

**THE FILM:** `Videos\C2B Films\03 The hero\phase 1 logo.mp4` — the whole phase from Home, 27.7 s, frame-stepped (its
stale first frame removed; the takes before it carry one: the first frame of each clip).

## ⛔ FIRST IN THE NEXT SESSION — PHASE 2's QUESTIONS

Carl: *"we will adrees those questions in the next session"*. The homework: `live-work/hero-phase2-homework-13-november.md`
(how three's `webgpu_compute_particles_rain` works, at r185; what our story needs that it lacks). The questions, Carl's:
- When the rain starts (on the landing's last wobble?), how long, how heavy, how it ends.
- How the face cools: the Builder's suggestion — rain hits the top edges and RUNS DOWN (vertical rain never meets the
  face; the flow map's gravity order already runs that way).
- Steam: raised 8 November, not chosen.
- ✔ **The floor — ANSWERED (Carl, end of session 2):** *"the floors pattern can be put in after phase 2. Its basically the
  same geometry all that will differ is the colour of the pattern on the floor depending on whether is hot or cold
  touchimg it."* → the cell pattern is built AFTER phase 2: ONE pattern, its colour set by what touches the floor, hot
  (reddish) or cold (bluish). Not a question for phase 2.
- The rain's look at our scale (streak size, density, splashes); Platinum Blue read from the site.

## STANDING

- ⛔ **THE HERO's SCOPE IS LOCKED** (Carl: *"Lock and test the files that are open"*; 55 paths closed, the scope cut to the
  records only; tested through the guard and with real edits: D-101, `_lockedPhase1_13Nov`). **The 9 November exception
  has ENDED: name the code files and ASK before the first code edit.** The scope's `chunk` name reads
  `trim-and-move-t1b` (stale; harmless — flagged).
- After the phases: the **camera direction** (*"icing on the cake"*; the camera layer after the animation).
- Still open from before: the walls (wallx, wallz) are the example's square ones; where a wall stands is Carl's.

## STATE

- **COMMITTED AND PUSHED:** `120e9c4` (the disc take 1), `a549786` (the fed disc, the light), `0f3b368` (phase 1). After
  `0f3b368`, UNCOMMITTED: this handoff, D-101's last two lines (the push note, the homework), the sprint's hero row; the
  homework file (live-work, scratch). tsc clean; lint the one accepted error, 0 warnings.
- **The dev server is STOPPED** (the whole tree; no project node process; port 3000 free).
- **The screen capture is STOPPED** (Carl: *"stop the capture"*): `Videos\C2B Films\03 The hero\01 Discussion\
  2026-11-13_s2_discussion_screen.remux.mkv`, 2:48:12; the RAW `.mkv` beside it, KEPT (not deleted without Carl's word).
- **Films** this session in `03 The hero\`: `disc-grow_take1–3`, `light-with-blobs_take1`, `reform_take1–7`
  (take 7 = the approved), `phase 1 logo`.
- **Scripts** (`live-work/scripts/`, 13-november, committed): the disc film, the floor contacts, the re-forming's facts,
  the re-forming film (ends at phase 1's end; steps once after a replay), the logo's red, the flow map's picture, the
  state stills (null control).

## LESSONS

- **Draw the instrument's data before trusting the effect.** The fill's holes were a 32-bit store against 64-bit queue
  values (the flood stopped at 1,485 of 39,384 cells); drawing the map found it in two steps, guessing (a crack-sealing
  close) found nothing.
- **Measure what the idea rests on before proposing it.** The re-forming's plan came from measured facts: the field box
  reaches only the c; the dance alone meets the disc at 7–31 s.
- **Carl's physical picture includes gravity** — "pour into the bottom part of the b's stem" is not a shortest path.
- **A null control and a positive control together:** 0 pixels changed means nothing until the new state is SEEN live.
- **Never type a Windows path's backslash in a scripted write** — three control bytes today; `chr(92)`, then scan.

---

*Written 13 November 2026, session 2.*
