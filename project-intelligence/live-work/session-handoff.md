# Session Handoff — 26 November 2026 (Thursday). PHASE 3 IS THE CIRCLE (R-118, R-119); THE PASSES DELETED; FILM 3's PHASE 3 SWAPPED; THE OPENING ON THE COLD LOAD: A → B+C → THE FLOWING OPENING (IN PROGRESS, UNCOMMITTED)

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"⛔ PHASE 3 REDESIGNED: QUICKER AND SIMPLER, ONE CIRCLE THROUGH THE CLOTH"* to
the end; reviews **R-118** and **R-119**; `live-work/hero-cold-load-26-november.md` (the cold load, measured: A, B, C).
Written at Carl's word mid-task (*"compaction is 35% write a handoff first"*), not at a session's end.

## ⛔ NEXT: CARL LOOKS AT THE FLOWING OPENING AGAIN

His note *"the text moves slightly left"* is fixed and committed: each 2D line nudged onto its 3D face (`FLOW_LINE_NUDGE`),
measured per line by edge correlation — within 0 to +1 px horizontally and ±1 px vertically at 1896 x 946, 1600 x 860 and
1280 x 720 (`scripts/hero-flow-registration-26-november.mjs <out> <w> <h>`; D-101). The flowing opening is a TAKE: his
verdict is next, then OPTION D (the logo's wait) and the poster's deletion (below).

## DONE AND PUSHED TODAY

- **`e22c4a7` — PHASE 3 REDESIGNED (R-118, R-119).** Carl: phase 3 measured 40.7 s, *"far too long"*. Now ONE CIRCLE: the
  cloth hung and faded in over the logo; the logo UPRIGHT round a 1.5 m circle, backwards first, 5.7 s; slowed to 0.06×
  through the cloth (the outline held ~2.0 s; take 1 0.40 s); the cloth DRAPES (the collision on all the way — takes 1–2
  let the metal through: Carl *"you took my description too literally"*); the whole logo gold behind the cloth; the web
  floor shrinking to touchdown; the marble + plinth from touchdown; the cloth fading out 0.5 s after touchdown (*"keep the
  cloth visible for 1s longer"*). Take 4 APPROVED (*"now we get more of the collision physics. Approved."*).
- **`f9b31ed` — THE FOUR PASSES' CODE DELETED** (937 lines out); the scene's own log matched take 4 on 413/413 frames.
  **FILM 3's PHASE 3 SWAPPED** in the roadmap (`hero-event-order-25-november.md`, 3a–3f) and the beat list (`Videos\C2B
  Films\03 The hero\beat-list.md`: P3-12 – P3-15 new, timed EXACTLY from the session log against the captures; the passes
  kept as ⚰️; the cut ~25 min).
- Captures: `03 The hero\01 Discussion\2026-11-26_discussion_screen.mkv` (35:45) and `_part2.mkv` (18:15), each with a
  `.remux.mkv`; take films `03 The hero\2026-11-26_phase3-circle_take1` … `take4-cloth-1s-longer` (Home + side).

## THE OPENING ON THE COLD LOAD — COMMITTED AS A TAKE (not approved)

Carl: *"Im trying to avoid a black viewport at the start."* Measured (production, cold): the headline readable ~2.7 s.
- **A** (kept): the castle cube map and uv grid (threejs.org, bench-only) no longer fetched at load — no visible gain on
  Carl's PC; the dependency gone. `loadCastle`, `loadUvGrid` in `hero-scene.ts`.
- **B + C** (built, measured best: readable 1.02 s cold; Carl *"implement the B+C option. Its the fadtest yet."*) —
  **SUPERSEDED the same session** by Carl's idea, THE FLOWING OPENING. `OPENING.litS` is now [0, 1.5] (A's [0.3, 3.0] kept as
  `OPENING_LIGHTS_A`, `?open=a`). ⚠ `public/hero-bench/opening-poster.webp` (C's still; authorised, in scope, STAGED) is
  now UNUSED — ask Carl whether to delete it.
- **THE FLOWING OPENING** (`FLOW_OPENING` in `hero-scene.ts`, the bench's 2D in `hero-bench.tsx`; D-101 has every quote).
  Four actions flowing like `/start`'s Q5 cards (first halfway through, each next 28% in): (1) the HTML headline (#bed3ea,
  the lit 3D face's colour, sampled) fades in 1.5 s from the first paint; (2) the 3D headline, flat on it, grows BACKWARDS
  over 2 s; (3) the HTML subtext reveals letter by letter and STAYS, its extrusion following each line letter by letter;
  (4) the logo once the headline is fully 3D. The 2D on a STAGE laid out at the reference (`FLOW_REF`), centred on the
  canvas, scaled by its height, at the reference root zoom 1.343; kerning off; letter-spacing −0.007 em. Registered within
  1–2 px at four windows, then each line nudged (above).
- ⚠ **OPEN FOR CARL — OPTION D:** the logo waits for the WHOLE story's warm-up (`openingReady` = `warmed`): measured live it
  fades in at **8.75 s** (dev) instead of ~3.0 s. Changing what the opening waits for is his call.
- ⚠ **OPEN — THE SITE:** the 2D registers at HOME only; on the site the 3D should be laid out from the HTML — a STRUCTURAL
  note for the Architect, not written.
- Gates at the time of writing: `tsc` clean; lint 1 error 0 warnings (the baseline).

## STILL CARRIED

- **The storyboard's phase 3 and 4 times are STALE** (`hero-storyboard-25-november.md`, printed 25 Nov from the passes):
  re-print from the scene's clock. The session's opening subject — precise numbers (positions) in the storyboard for the
  camera shots — not started.
- Carl's earlier opens (25 Nov handoff): the cloth/logo interpenetration close-up (now with the drape); live pauses on a
  clean run; the logo's look by angle (the showcase lights); our marble take 4; the loop/freeze/restart.
- The marble's circling spotlight runs on a clock from PAGE LOAD (`marble.update`), not the story's: its angle differs run
  to run — a fact for the camera direction.

## CORRECTIONS AND LESSONS (this session)

- **"stop" means stop the work, not the servers**: Carl said "syop"/"stop" mid-commit; the Builder killed the dev server and
  the recording; Carl: *"no keep the server up and screen recording"*.
- **A measurement is only as good as its conditions**: removing the scrollbar gutter AFTER load left the canvas at one width
  and the HTML at another — a 7.25 px error baked into a "reference".
- Hydration REMOVES nodes an inline script adds to `<body>`: render them with React, hidden, `suppressHydrationWarning`,
  and let the script only style them. A finished CSS animation's `currentTime` stops at its end: use the document timeline
  minus `startTime`. three's typeface JSON has no kerning: kerned HTML drifts from it.
- The plan gate was set aside twice on Carl's word (*"Just implement it"*; the flowing opening built on *"yes"*).

## STATE

- Dev server on :3000 RUNNING (a background task of this session). Production server :3100 stopped. Screen recording
  STOPPED (Carl: *"stop the screen capture."*).
- Committed and pushed with this handoff: `hero-scene.ts`, `hero-bench.tsx` (A, the lights' B, the flowing opening),
  `decisions.md`, today's scripts, `live-work/hero-cold-load-26-november.md`. ⚠ NOT committed: the poster
  (`public/hero-bench/opening-poster.webp`, unused — left untracked on disk for Carl's word on deleting it). `chunk-scope.json`: `opening-poster.webp` added on
  Carl's *"yes, authorised"* (`_openingPoster26Nov`).
- Carried: target 1 December; name the files and ask before the first code edit, every session; a question is answered,
  not built; record each verdict as it lands.

---

*Written 26 November 2026, mid-session (compaction at 35%).*
