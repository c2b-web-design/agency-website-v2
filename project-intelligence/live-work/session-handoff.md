# Session Handoff — 29 October 2026, session 2. THREE FILMS CUT FOR RESOLVE; THE SHOWCASE STANDARD (D-106); THE HERO NEXT.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Replaces the 29 October session-1 handoff. Delete it at the
end of the session that reads it, once its replacement is written.

## ⛔ NEXT — tomorrow: EDIT THE THREE FILMS IN RESOLVE (with Carl)

Carl is updating DaVinci Resolve (it needs a PC restart). Then the three cuts go in. Each: a 1920×1080, 30 fps project,
**Rec.709 Gamma 2.4**, *File > Import > Timeline…*, the film's `cut10.fcpxml` (`cut10.edl` is the fallback). Media in each
film's `09 Cut - 10 min/`: DNxHR HQ 4:2:2 .mov, constant 30 fps, tagged BT.709 limited range.

| Film | Folder (`Videos\C2B Films\`) | Length | Build script (`live-work/scripts/`) |
|---|---|---|---|
| 01 Who we are | `01 Who we are button` | 9:49, 44 segments | `whoweare-cut10-build.mjs` |
| 02 Ornate corners | `02 Ornate corners` | 9:15, 55 segments | `films-02-04-cut-build.mjs 02` |
| 04 Extruded lettering | `04 Extruded lettering` | 8:40, 43 segments | `films-02-04-cut-build.mjs 04` |

- **Every film follows ONE journey** (Carl: *"a story with a beginning, middle and end … that is our process - and it
  works"*): before and the idea → the plan and its review → each pass ending on Carl's approval → on the page, live.
  Film 01's stage weights APPROVED by Carl; films 02 and 04's are the Builder's (in each `shot-list.md`), Carl's to move.
  Film 04 is shorter on purpose (cuts faster; exempt from the C2B restraint).
- **The films are tutorials:** how we did it, plain language, no jargon call-outs, clean cuts, and visually good. ~10 min
  into Resolve for final polish; Carl cuts, grades and scores (his Resolve → Pro Tools → Fairlight work).
- **Personal details:** Carl's NAME stays (paths `C:\Users\Carl Buckley`, "for Carl's eye" on benches). Carl blurs
  anything else in Resolve (a blur strip). Film 02's two fallback stills had the Next.js dev badge ("N 10 Issues"):
  PAINTED OUT at Carl's word (originals in `06 On the page/_raw/`).
- **Subtitle drafts** are in each film's shot list / `07 Subtitles/` ("We", no em dashes). Film 02's last turning point
  (15:04, "The box shape is implied by the corners") has no still: a subtitle over 14:55's.

## DONE THIS SESSION

- **The third-person view APPROVED (R-098), pushed `2aa8e15`.** The framing check PASSED on Carl's ruling (*"Yes,
  pass"*), its mark still unable to fail — the pass is his eye. Filmed for film 4 (`07 Camera bench - Third person`).
  Carl on who performs a shot: *"C2b will make it and that included you and me"* (D-104). Bench files CLOSED, LOCKED,
  TESTED (31/31 protected denied; `577efc1`).
- **SCHEDULE CHANGED** (Carl): edit films 01, 02, 04 NOW → the hero (several sessions; film 3 is its capture) → Send →
  mastering. Deadline 19 November.
- **⛔ THE SCREEN IS RECORDED EVERY SESSION OF A FILMED BUILD, BY THE BUILDER, UNPROMPTED** — from the hero's FIRST
  discussion (D-101 tail; `03 The hero/README.md`). Film 02's discussion was never filmed (*"Its clear my direction wasnt
  followed"*). Recovered: films 02 and 04's discussions recorded from the archived sessions as Carl scrolled (ffmpeg
  gdigrab), logged from the transcripts (`~/.claude/projects/…/<session>.jsonl` — the Builder can read them directly).
  Start: `ffmpeg -f gdigrab -framerate 30 -offset_x 0 -offset_y 0 -video_size 1920x1080 -i desktop -c:v libx264 -preset
  ultrafast -crf 18 -pix_fmt yuv420p <bin>/<name>.mkv` in the background; stop by killing the PID (mkv survives).
- **Film 02 padded from the corner bench** (Carl): 14 clips of the dials moving (carving, relief, key light, modes, the
  gold's roughness, the blue's tint and coat, the studio turning, rocks to face-on), via Chrome's screencast at ~57
  painted frames/s → constant 30 fps (`film02-bench-capture-29-october.mjs`).
- **⛔ COLOUR, MEASURED:** the FFmpeg screen recordings AND the Playwright clips are **BT.601**; today's bench screencasts
  BT.709. VS Code's blue badge read as 601 = (45,124,157), the same pixel as a known-601 recording. Film 01's first cut
  assumed 709 and was REBUILT; film 04's discussion MP4 was mislabelled and REBUILT. Tesseract 5.4 installed (OCR).
- **⛔ D-106, THE SHOWCASE STANDARD (APPROVED as a definition):** "standard" = the best showcase of THAT object; the
  route per object and conditions. Fixed layer measured (colour standard, no dropped frames, quality master; LUT =
  correction only). Per-object layer by Carl's eye (tone mapping by the scene's light: Neutral for materials, AgX/none for
  light, ACES for mood). **Film 4's page: NEUTRAL — RULED** (*"i will take your recommendation"*).

## ⛔ OPEN — with owners

- **PROPOSED, not built (D-106):** a colour test chart through the whole chain; frame-stepped capture at 2× (⚠ §5a — a
  structural note first); a 10-bit master; one correction LUT from a Resolve grade, applied by FFmpeg `lut3d` in the
  bench's client films. Carl's word to start the note.
- **Carl:** the hero (camera and triggers his; the build is §5a); Send after it; mastering.
- **Raised, not chosen:** stills of text in timeline gaps; flat views; the speed spline editor; signature moves; R2.
- **Carried:** `about-card-glass.ts:491` comment untrue (flag only, protected).

## STANDING / LESSONS (this session)

- **Shell text hazards, twice:** `\04` in a heredoc'd Python string wrote 0x04 into `decisions.md` (caught, fixed);
  backticks in a double-quoted bash string ran as a command. Use `chr(92)`, Edit/Write, or a quoted heredoc to a file.
- **A Python print redirected to a file is cp1252 on Windows** — write files from Python with `encoding='utf-8'`.
- **OrbitControls on a relief:** the oblique view starts turned; a symmetric swing goes edge-on. Rock one way only.
- **A tiling filter resets on a pixel-format change** (RGBA stills among RGB frames): normalise tiles to rgb24 first.
- **The Grep tool skips `live-work/`** (gitignored) — use `grep -rn` there.

---

*Written 29 October 2026, session 2. Replaces the 29 October session-1 handoff.*
