# Session Handoff — 1 November 2026. FILM 01 CUT AND GRADED, ON CARL'S PC; MUSIC AFTER THE HERO.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Replaces the 31 October handoff. Delete it at the end of the
session that reads it, once its replacement is written.

**Where the project is:** no site code changed; lint not run, nothing to lint. Deadline 19 November. Order: edit films 01, 02, 04
→ the hero (several sessions; film 3 is its capture) → music (Carl: *"Music comes after the hero is completed"*) → Send → mastering.

**Next session:** Carl's call; film 02 is next on the record, its every-frame scan before he starts (below).

**How to work with Carl in Resolve:** one step at a time. He cuts; every edit is his. ⛔ **Two lists: FAULTS, and WHAT'S THERE for
his judgement.** He is not a colourist (*"explain where is 1.12"*): name the box, say what it does. Look at the frame before
calling anything a fault.

## FILM 01 AS IT STANDS

- Resolve project "Film 1", Timeline 1, 1920 × 1080, 30 fps, **47 clips, 8:27:22, 15,232 frames**. Saved by Carl. No version approved.
- The extra clip is his: a copy of the finished pill at the end, for the before and after.
- **The grade:** master Gain 1.08 on 20 clips (strip numbers 19–22, 24–32, 38–42, 45, 47). Text clips left as they are; 46, `10C`,
  kept as the "before". D-107.
- `Videos\C2B Films\01 Who we are button\`: **`film1-review-5.mp4`** is the latest render. `08A` Crop Bottom 57 → 69 was saved after
  it and NOT re-scanned. Carl: *"After the music is put on we will check at the final process."* Don't raise it before then.
- ⚠ Review 4's filename is `film1-review-4.mp4 .mp4`, with the stray extension.
- ⛔ **The film stays on Carl's PC** (*"Leave it on my PC for now"*). Hosting not chosen. What going up needs is in D-107: a web
  encode, a host outside the repo (161 MB is over GitHub's 100 MB limit), box 1's stand-in, chapters and captions in `player-bench.tsx`.
- Carl's rulings, staying: the N inside Media Player at 4:43 (*"It is closed"*); the arc at 4:18; *"The white scroll line is fine"*
  (he did not say which). `05F`, `06A` white strip; `05D`'s dark head.
- Still Carl's: the faint line down `09B`'s left (Crop Left 22 would take it, raised once). A stray point on clip 47's curve, on the
  line, no effect.
- ⚠ `film1-v3.edl` and `.srt` are stale from `09A` on. The `whoweare-cut10-build.mjs` entry for `01E` is stale.
- ⛔ **Never hand him a replacement .srt for film 01:** it wipes his placement and fades.
- `10 Pick-ups\09A_…-tail-3s.mov` is unused. Raised once; delete only at his word.

## FILMS 02 AND 04, BEFORE CARL STARTS

- **Scan every frame first**, of the used spans, then LOOK at each flag. Film 04 has white openings (head scan only): `03F` 2, `05G`
  10, `07D` 11, `07E` 2, `07F` 14, `07G` 2, `09B` 1 frames. Film 02 never scanned whole. Also left edge, taskbar, Chrome bars, crop
  groups as film 01's, **and the N, whole-frame by template** (below).
- Scripts: `live-work/scripts/film-scan-every-frame-1-november.py`, `film-compare-renders-1-november.py`; paths are hard-coded to film 01.
- **Get the subtitle wording right BEFORE he places them.** Placing and fading 70 by hand was *"mind numbingly tedious"*.
- ⛔ **Carl's decision, not answered:** subtitles as one transparent video on V2, position and fades baked in; text not editable in
  Resolve, and whether Resolve reads the alpha is UNTESTED.
- Markers ready: `cut10-markers.edl` in each film's folder.

## OPEN — with owners

- **Carl:** film 01's approval and final check after the music; films 02 and 04; the hero; Send; mastering.
- **Proposed, not built (D-106):** colour test chart; frame-stepped capture at 2× (§5a note first); 10-bit master; a correction LUT.
- **Raised, not chosen:** stills of text in timeline gaps; flat views; the speed spline editor; signature moves; R2.
- **Carried:** `about-card-glass.ts:491` comment untrue (flag only, protected).

## LESSONS (this session; D-107 has the record)

- ⛔ **A wrong frame label reached Carl and he ruled on it.** A script zipped decoded frames to an unsorted list, so the 6:32 page
  was reported as 4:18. Sort the list, or extract one frame at a time.
- **My N "scan" was a corner window at x < 140; the N sat at x 134 to 147.** Review 3 had been called clean with a full N in it.
  Sampling one frame per clip missed it too. A template search found the rest; a template cannot see a cropped rim.
- ffmpeg 9 has no `-vsync`: use `-fps_mode`. My first scan read no frames and exited 0. Assert the frame count.
- A percentile on a scaled-down frame understated the end clip's peak (0.88 against 0.98). Carl's eye (*"This is where it is brightest"*)
  caught it: area and peak are different questions.
- The thumbnails for `08A`, `09A` show their first frame, the old page, so Carl missed them when selecting. Resolve's clip number turns
  rainbow once a clip is graded (Carl's find): check that, not the thumbnail.
- Don't parallel-pipe three decoders: the full-size stats pass took over ten minutes.

---

*Written 1 November 2026. Replaces the 31 October handoff.*
