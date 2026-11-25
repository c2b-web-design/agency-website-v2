# Session Handoff — 25 November 2026 (Wednesday), session 2. THE PLINTH APPROVED; FILM 3 LOGGED; THE STORYBOARD's SPINE TIMED FROM THE SCENE; THE ORDER NOW FILM → STORYBOARD → POLISH

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"✔ THE PLINTH APPROVED (25 November 2026, session 2; R-117)"* to the end;
review **R-117** (*"Plinth is approved."*). Session ended on Carl's word (*"write a handoff and commit and push"*).

## ⛔ NEXT SESSION (Carl, after the push)

*"Next session. We will use the storyboard roadmap with the editing of the film and put precise numbers within the storyboard for
working out camera shots."* → (1) **film 3's edit driven by the roadmap** (`hero-event-order-25-november.md`, the scene's order;
step 3 below); (2) **precise numbers in the storyboard** (`hero-storyboard-25-november.md`) for the camera shots. The Builder's
reading, to confirm with Carl first: the TIMES are already printed; what a shot also needs is WHERE — the logo's position and size
at each event, the blobs' spread, the cloth's extent, the plinth, in the scene's units and cm — printed from the scene's state the
same way (`film03-scene-log-25-november.mjs` extended; read-only).

## ⛔ THE ORDER NOW (Carl, this session; amends 16 November)

**Film 3's edit NOW → the storyboard (the camera direction, phase 5) → the hero's polish** (our own marble take 4, the showcase
lights) → the hero on the site → the films on the site → Send → mastering. Carl: *"we will come back to the polish, the icing on
the cake. The film editing is a big job and the storyboarding is after that."*

## FILM 3 — WHERE IT STANDS

- **Shape** (ruled this session): asset construction; phase 4 AS IT STANDS today; the finished scene NOT replayed (*"A user will
  have already seen the finished scene. The film just gives a glimpse into BTS."*); the film ENDS on what comes next (add the
  sparkle, storyboard, direct). Rough cut ~27.5 min into Resolve.
- **⛔ THE FILM FOLLOWS THE SCENE's ORDER, NOT THE BUILD's** (*"It doesnt matter that we made the web later"*): each event its
  IDEA (*"the jump shock. hot, cold, wet, dry"*), its METHOD (mesh, material, light), its APPROVAL. The roadmap:
  **`live-work/hero-event-order-25-november.md`** (the opening O1–O4, phase 1 as 1a–1g, 2a–2e, 3a–3f, 4a–4e), with the film's
  opening drafted: the 6-line intro (three.js vs HTML/CSS, "information dumps", a film set OR A VIDEO GAME, mesh → material → light;
  ~30 s, Carl: *"30s is long enough"*), the blank canvas, the good idea, cue the text, the logo, THE FLOOR (⚠ the projector
  example's PATTERN, not its lamp: maths on a flat glowing sheet; Carl: *"i forgot we pivoted"*).
- **The beat list:** `Videos\C2B Films\03 The hero\beat-list.md` — 49 beats, each with **a time range in its day's capture**
  (all 18 captures OCR'd for Carl's words: `11 Log\`, `beat-hits.md`). Gaps: no capture of 8 Nov, of 16 Nov s2, of the steam's
  approval or of GPT's marble (bench takes cover them).
- **The text shot (Carl's idea):** the home page as it is DISSOLVING into the bench's lit 3D text —
  `03 The hero\2026-11-25_text-dissolve_take2\film.mp4` (registers; take 1 had the scrollbar strip, superseded). Not yet judged.
- **Cards:** Carl makes them in Resolve (a "c2b film presents" card, then a title card per film from a template); the Builder
  supplies elements WITH ALPHA on request. ⚠ The 2 November titles STAND (01 *Finger on the Button*, 02 *No Corners Cut*, 04 *Bold
  as Brass*); film 03's title OPEN (*Breaking Out*, and now *Holding Out for a Hero*, candidates). The Builder missed that trail
  this session — read D-107 first.
- **Next for film 3:** Carl checks the ranges / the roadmap's order and ideas; then STEP 3 — per event: the ask (~5–10 s), the
  result (the bench take or the capture), the verdict (~5 s), cut at 1080p 30 fps CFR in the roadmap's order, a markers EDL.

## THE STORYBOARD's SPINE — TIMED FROM THE SCENE

**`live-work/hero-storyboard-25-november.md`**: the whole scene filmed and LOGGED frame by frame from the dark at HOME
(`03 The hero\2026-11-25_whole-scene_home\`: `film.mp4`, `state.jsonl`, `events.md` — 165 events PRINTED from the scene's clock,
never typed). Five sections, SMPTE 30 fps non-drop, FILM (from the dark) and STORY (zero at the lean, FILM 00:00:08:14). The scene:
~86.3 s to the marble complete. ⚠ The 16 November ruling's other half — the BENCH clocks to SMPTE — NOT done (code; Carl's files).
Three OUTSIDE VIEWS beside it (Gemini on the film; Claude in Chrome on the live bench; an outside opinion), each sorted into
finding / our design / taste.

**Ruled this session for the direction:**
- ⛔ **HOME is the only thing set in stone; by the subtext's reveal the camera may already be moving** (*"im about to go all Peter
  Jackson on people"*). A camera move costs nothing to load: it fills the opening's loading seconds.
- ⛔ **The camera tells its own story and can ADD TO OR TAKE AWAY FROM the story** (standing principle; the outside views were
  the case: from a fixed HOME the lean, the jump, the code drops and pass 1 are lost).
- ⛔ **Phase 3's on-screen length is the CAMERA's** (speed ramps, the spline editor raised 27 Oct, not built); the passes keep their
  approved timing; ~90 s will end up shorter. ⚠ A ramp runs the scene's clock faster: the cloth must be stepped finely enough
  that its contact is unchanged — prove on the bench.
- ⛔ **The visitor does NOT drive the timeline** (*"giving them access to control the story and speed ramp the whole thing"*);
  RAISED, not chosen: a cursor drift of a few degrees on top of the shots; what a returning visitor sees.
- ⛔ **The story starts with what loads first** (Carl: a strong opening of marble and gold would load longer). The intro: a
  READ-ONLY measure of a cold and a return visit first; 16 Nov's "the logo is the loading bar" worth revisiting.

## OPEN — CARL's

- **The cloth and the logo passing through each other:** seen by two outside viewers (one closer than HOME); our "0 points inside
  the metal" counts the cloth's POINTS, not its triangles — UNRESOLVED, to be looked at close (read-only first).
- **Live pauses** reported with a debugger attached (to confirm on a clean run): ~130–217 ms on the headline's fade; ~50–67 ms
  at the rain and steam; ~100 ms at the marble (maybe the handoff-carried "one shadow pipeline made synchronously").
- **The logo's look by angle** (black edge-on, matte tan from below; the platinum blue dark from HOME) — the showcase lights.
- **"CSP"** — pass 4 upside down near the climax: a camera question.
- The music: the *Holding Out for a Hero* echo is Funky Claude's (Music Production; Pro Tools write access being granted;
  PT → Fairlight in Resolve). A melody quote vs a progression: rights, put to Carl.
- Carried: our marble take 4 (GPT's the bar); the loop / freeze / restart (structural, after phase 5); the frame cost (D-108).

## BUILT / CHANGED TODAY

- R-117 and D-101 entries; the three corrupted characters REPAIRED (R-114's path, decisions.md's 23 Nov path).
- `ai-system/governance-review-protocol.md`: "The next review" pointer (opened, written, LOCKED and probed).
- Scripts (`live-work/scripts/`): `film03-log-changes-`, `film03-log-ocr-`, `film03-find-beats-`, `film03-text-dissolve-`,
  `film03-scene-log-`, `film03-scene-events-25-november.*`. No site code changed.

## LESSONS (today)

- **The heredoc STILL collapses a doubled backslash** (0x03 and a backspace in a D-101 path; caught by the scan): record appends
  with a backslash go through a `.py` written with the Write tool. Memory updated.
- **Read the record before answering from files on disk** (the film titles: D-107 had them). Memory updated.
- **A green measure can still be narrower than its name:** "0 points inside the metal" checks points, not triangles; two viewers
  saw otherwise.
- Carl's prompt cache runs 60 min: on long background jobs a watcher wakes the Builder inside 40 min (memory).

## STATE

- Committed and pushed with this handoff. The dev server STOPPED. No screen capture this session (the work was logging).
- Scope (`chunk-scope.json`): the hero files still open (`_marble23Nov` etc.); `governance-review-protocol.md` LOCKED again.
- Carried: target 1 December; name the files and ask before the first code edit, every session; a question is answered, not
  built; record each verdict as it lands.

---

*Written 25 November 2026, session 2.*
