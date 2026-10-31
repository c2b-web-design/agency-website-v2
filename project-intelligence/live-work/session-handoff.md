# Session Handoff — 31 October 2026. FILM 01 THROUGH ITS FAULT LIST IN RESOLVE; CARL HAS MORE TO DO ON IT FIRST.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Replaces the 30 October handoff. Delete it at the end of the
session that reads it, once its replacement is written.

**Where the project is:** no site code changed. Lint not run, nothing to lint. Schedule unchanged: edit films 01, 02, 04 → the
hero (several sessions; film 3 is its capture) → Send → mastering. Deadline 19 November.

**Next session:** Carl: *"There are a couple more things we need to do first"*, on film 01 before anything else. **He has not said
what they are: ask him, don't guess.** Then his grade and score (Resolve → Pro Tools → Fairlight; Sonar for the bed), then films
02 and 04.

**How to work with Carl in Resolve:** one step at a time. He cuts; every edit is his. ⛔ **Two lists: FAULTS, and WHAT'S THERE for
his judgement.** Don't explain his own controls. Look at the frame before calling anything a fault.

## FILM 01 AS IT STANDS

- Resolve project "Film 1", Timeline 1, 1920 × 1080, 30 fps, **46 clips, 8:26:20**. Saved by Carl. No version approved.
- `Videos\C2B Films\01 Who we are button\`: **`film1-review-3.mp4`** is the latest render, 15,200 frames, scanned clean bar two
  faint N rims (`01G` crop line; `08B` first piece's left crop line). ⚠ **Carl then said "done and saved": those two were fixed
  after the render and NOT re-scanned.** Asked for: `01G` Crop Bottom 130, `08B` first piece Crop Left 80. Check on the next render.
- ⚠ `film1-v3.edl` and `.srt` are STALE from `09A` on. Mapping: `09A` 19:14, `09B` 9:13, `09C` 14:01 starting 01:07:49:10, a 32-frame
  centred Cross Dissolve at 01:07:39:27. Everything after `09C`'s head is 62 frames earlier than the old EDL.
- ⚠ The `whoweare-cut10-build.mjs` entry for `01E` is stale: a re-run rebuilds the stock clip. The folder's other clips are as cut.
- Judged and staying: `05F` and `06A`'s white strip (*"you showing me a video overlaid the chat window"*), `05D`'s dark head (Carl: under
  0.2 s, a space for the pills to appear; *"to AI and Commander Data its almost an eternity"*). `03A`: Carl said *"fixed"*.
- Still Carl's: the faint line down `09B`'s left (Crop Left 22 would take it, raised once). Not raised: the scrollbar on the right
  of `08B`'s 1:08 piece; `10C` shows the old white `Start a conversation` pill (the page as it was then).
- ⛔ **Never hand him a replacement .srt for film 01:** it wipes his placement and fades.

## `01E`, REPLACED (D-107)

- ⛔ **THE BRAND COLOURS ARE GOLD, TEAL, PLATINUM BLUE** (Carl: *"Go to our site and look at our colours"*). The stock sheet's four
  and "four brand colours" are overtaken. The CD route is withdrawn.
- `09 Cut - 10 min\01E.mov`: three metal spheres, the names and hex codes under them, the light reaching each in turn. Carl:
  *"Tha look great"*. Script: `live-work/scripts/whoweare-swatch-01E-31-october.mjs`. Preview copies:
  `live-work/film-previews/` (gitignored; VS Code failed on the temp-folder copy, Chrome opened it).
- The old clip deleted at his word. The source JPG stays in `00 References`.
- `10 Pick-ups\09A_…-tail-3s.mov` (23 s) is unused. Raised once; delete only at his word.

## FILMS 02 AND 04, BEFORE CARL STARTS

- **Scan every frame first**, of the used spans, then LOOK at each flag. Film 04 has white openings (head scan only): `03F` 2, `05G`
  10, `07D` 11, `07E` 2, `07F` 14, `07G` 2, `09B` 1 frames. Film 02 never scanned whole. Also left edge, taskbar, Chrome bars,
  crop groups as film 01's, **and the N badge by clip**.
- First-frame check done: of 141 clips across the three cuts, film 01's `09B` was the only one starting a frame late. Their
  subtitles contain no "four brand colours".
- **Get the subtitle wording right BEFORE he places them.** Placing and fading 70 by hand was *"mind numbingly tedious"*.
- ⛔ **Carl's decision, not answered:** subtitles as one transparent video on V2, position and fades baked in; text not editable in
  Resolve, and whether Resolve reads the alpha is UNTESTED.
- Markers ready: `cut10-markers.edl` in each film's folder.

## OPEN — with owners

- **Carl:** his couple of things on film 01; grade and score; the hero; Send after it; mastering.
- **Proposed, not built (D-106):** colour test chart; frame-stepped capture at 2× (§5a note first); 10-bit master; a correction LUT.
  ⚠ The swatch was frame-stepped at UHD by a one-off script outside the app; that is not this proposal built.
- **Raised, not chosen:** stills of text in timeline gaps; flat views; the speed spline editor; signature moves; R2.
- **Carried:** `about-card-glass.ts:491` comment untrue (flag only, protected).

## LESSONS (this session; D-107 has the record)

- ⛔ **Resolve 21's Media Pool menu has NO "Replace Selected Clip".** I told him it did, three times. What works: Import Media, open in
  the source viewer, playhead on the slot, F10. A dissolve without handles: Resolve trims both clips by half and can leave a gap.
- **A timeline length that doesn't match the expected figure is a fault report.** 8:28:18 against 8:28:21 found a 58-frame gap.
- **Undos take crops with them:** two Crop Lefts vanished in a run of undos. Re-check earlier fixes after one.
- **"Call it X" means X exactly.** And when he names a file, check which one: he renamed the `09A` tail thinking it was the swatch,
  because I had given him two new files in two folders; check file length, not the name.
- A test with a bad baseline read 41 of 70 captions missing. Replacing it with a direct comparison to the verified render read 68,
  the other two seen in the frame. An alarming number from a new instrument is a question about the instrument first.
- On a sphere the buttons' recipe gives wet-pearl dots and a dark front: the route is per object (D-106).

---

*Written 31 October 2026. Replaces the 30 October handoff.*
