# Session Handoff — 26 November 2026 (Thursday). PHASE 3 IS THE CIRCLE (R-118, R-119); THE PASSES DELETED; FILM 3's PHASE 3 SWAPPED; THE OPENING ON THE COLD LOAD: A → B+C → THE FLOWING OPENING (IN PROGRESS, UNCOMMITTED)

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"⛔ PHASE 3 REDESIGNED: QUICKER AND SIMPLER, ONE CIRCLE THROUGH THE CLOTH"* to
the end; reviews **R-118** and **R-119**; `live-work/hero-cold-load-26-november.md` (the cold load, measured: A, B, C).
Written at Carl's word mid-task (*"compaction is 35% write a handoff first"*), not at a session's end.

## ⛔ NEXT SESSION: THE FIRST-FRAME FREEZE (Carl: *"the jump is noticable. put the fix options in the handoff and we will deal with it in the next session."*)

**The fault, MEASURED:** as the scene draws its FIRST frame (~1.3–1.5 s after the first paint on the dev bench), the screen
produces NO frames for ~200 ms — the 2D headline's fade (and the subtext's letter fades) freeze, then catch up in one frame:
a visible jump (`Videos\C2B Films\03 The hero\2026-11-26_flow-opening_take2-weight-matched`: the headline's brightness 35.8
held six frames, then 44.4). NOT the camera: `scripts/screencast-freeze-test-26-november.mjs` shows the screencast keeps
filming a CSS fade through a blocked script thread, so a stall with no frames at all is deeper than the script — most likely
the GPU building the first frame's programs (three r185 builds a render pipeline at its first draw; the 16 November stall
work and the 10 November async-compile plan are the precedents: `live-work/plan-liquid-async-compile-10-november.md`).

**The options (Carl's choice; measure first, read-only, on a production build — `scripts/hero-cold-load-26-november.mjs`):**
- **(a) Build the first frame's programs ASYNCHRONOUSLY before it is drawn** — e.g. `renderer.compileAsync(scene, camera)`
  awaited before `setAnimationLoop` in `hero-bench.tsx`'s `start()`, or the bench's existing background warm-up extended to
  the text's and floor's programs. The cleaner fix: no freeze at all. ⚠ Prove on the bench that three r185 WebGPU really builds
  them off the frame (the 10 November plan found the liquid's draw built synchronously despite a warm-up); a structural
  question if it adds a mechanism — the Architect.
- **(b) Hold the scene until the 2D headline's fade is done** (1.5 s) before its first draw, so the freeze lands on still
  text and is invisible. Simpler; the growth then starts at ~1.5 s rather than 0.75 s on fast loads. ⚠ The subtext's letter
  fades start at 1.31 s and could still catch the freeze: start them after the scene's first frame, or accept.
- **(c)** Not raised to Carl: both — (a) where it works, (b) as the guard. The Builder's note only.

**Also open on the flowing opening (Carl's):** his verdict on the take; OPTION D (the logo waits for the WHOLE story's warm-up:
fades in at ~8.75 s on dev, not ~3.0 s); the unused poster (`public/hero-bench/opening-poster.webp`, untracked) — delete?;
the SITE's route (the 2D registers at HOME only: a structural note for the Architect).

**Done since the mid-session handoff (committed with this one):** *"the text moves slightly left"* — each 2D line nudged onto
its face by edge correlation (`FLOW_LINE_NUDGE`); *"when the light comes into play it should grow in intensityy, theres a
sudden change"* — FILMED: the headline lost ~11% brightness at the hand-over because the 3D's glyphs are ~10% THINNER than the
browser's Geist Bold; the 2D now at weight 625 with +0.0102 em tracking (`FLOW_HEAD_WEIGHT`, `scripts/hero-flow-weight-26-
november.mjs`): ink within ~1%, every line ±1 px at three windows, the brightness HOLDS through the hand-over (refilmed).

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

## THE OPENING ON THE COLD LOAD — COMMITTED AS A TAKE (not approved; the first-frame freeze above)

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
- **The heredoc STILL collapses backslashes** (twice more today: a 0x03 and a U+0082 in Windows paths, in `hero-bench.tsx`
  and D-101): write ANY script that carries a backslash with the Write tool, and scan for C1 controls (U+0080–U+009F) too.
- **Match the 2D's INK, not only its place and colour:** the browser draws a weight heavier than the font's own outline.
- The plan gate was set aside twice on Carl's word (*"Just implement it"*; the flowing opening built on *"yes"*).

## STATE

- Dev server STOPPED (Carl: *"commit and push and stop the server"*). Production server :3100 stopped. Screen recording
  STOPPED (Carl: *"stop the screen capture."*).
- Committed and pushed with this handoff: `hero-scene.ts`, `hero-bench.tsx` (A, the lights' B, the flowing opening),
  `decisions.md`, today's scripts, `live-work/hero-cold-load-26-november.md`. ⚠ NOT committed: the poster
  (`public/hero-bench/opening-poster.webp`, unused — left untracked on disk for Carl's word on deleting it). `chunk-scope.json`: `opening-poster.webp` added on
  Carl's *"yes, authorised"* (`_openingPoster26Nov`).
- Carried: target 1 December; name the files and ask before the first code edit, every session; a question is answered,
  not built; record each verdict as it lands.

---

*Written 26 November 2026; updated at the session's end (Carl: "put the fix options in the handoff").*
