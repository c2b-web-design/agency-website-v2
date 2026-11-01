# Session Handoff — 1 November 2026, later. FILM 02 CROPPED AND CAPTIONED; CARL IS TIMING AND FADING THE 91 CAPTIONS.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Replaces the earlier 1 November handoff. Delete it at the end of the
session that reads it, once its replacement is written.

**Where the project is:** no site code changed; lint not run, nothing to lint. Deadline 19 November. Order: edit films 01, 02, 04
→ the hero (several sessions; film 3 is its capture) → music (Carl: *"Music comes after the hero is completed"*) → Send → mastering.

**Next session:** Carl arrives with film 02's 91 captions timed and faded (*"I will have it done for the next session"*).
⛔ **TO DO FIRST: reshoot `06G` and `06H`** (below). Then: his before clip if not in, render, the scan below, the grade, then film 04.

**How to work with Carl in Resolve:** one step at a time. He cuts; every edit is his. ⛔ **Two lists: FAULTS, and WHAT'S THERE for
his judgement.** He is not a colourist (*"explain where is 1.12"*): name the box, say what it does. Look at the frame before
calling anything a fault. ⚠ Don't state a Resolve menu or behaviour as fact unless it's been seen on his screen.

## FILM 02 AS IT STANDS

- Resolve project `Film 2`, Timeline 1, 1920 × 1080, 30 fps, 55 clips, **9:15:00**, no audio. First render below.
- **Crops:** Carl's word, *"All crops done"*; not checked. Recommended: Crop Bottom 140 on `03B` `03C` `03K` `04A` `04E` `04F` `06A`
  `06B` `06C` `08C` (the N); 115 on `03G`; 48 on the 14 chat clips (taskbar). Crop Right 16 for the white strip on 33 clips was his call.
- **Captions:** `07 Subtitles\film2.srt`, 91 lines, imported and positioned by Carl. ⛔ **Never hand him a replacement .srt:** it wipes
  his placement and fades. Wording changes go directly on the timeline. Source: `live-work/scripts/film02-subtitles-build.py`; wording
  list `live-work/film02-captions-draft-1-november.md`. Both will drift from what he changes.
- ⛔ **Carl's rule: where a clip has a bottom crop, the caption sits at Y 100; on the 14 chat clips, Crop Bottom 50 and Y 120,** clear of the
  crop line. Crop Bottom 180 on the chat clips was tried and rejected (*"It looks ugly and blocks text that is in the editor."*): don't
  raise it again. Check both on the next render.
- **Four lines left as drafted, his to delete:** Gemini named (`03E`), the face in the leaves (`03L`), "someone else's product"
  (`03J`), film 01's closing line on `08C`.
- **The ending:** Carl: *"Yes, a before and after is important."* Suggested: a copy of `00A` before `08C`, "This is where it started."
  on it, "And this is what it became." on `08C`. Those two captions need dragging. Not in at the last screenshot.
- ⛔ **TO DO: `06G`, `06H`, THE ONE SHOT CARL ISN'T HAPPY WITH** (*"it looks blurred, out of focus. We may have to replace the shot."*).
  Cause: both are 40 × 40 px measurement crops (`06 On the page/2026-10-19_1559_page_t2-edge-{bench,page}.png`) enlarged to the frame.
  Proposed: reshoot the same corner from the bench and the page at high pixel density, so the WebGL redraws it; 4 s each, so
  *"We measured the page against the bench."* and *"They agree."* don't move; **one test frame to Carl first** (his go was to put it
  on this list, so confirm before shooting if in doubt). Unknown: how far sharpness holds on a 24 px corner. If bench and page visibly
  differ, say so: "They agree." would need rewording. Replacing in Resolve: Import Media, source viewer, playhead on the slot, F10.
  No site change; stop the local server afterwards.
- **`film2-review.mp4` (16,650 frames) checked against the source clips, 1 November:** taskbar and white strip gone; whole N gone (no
  template score over 0.73); no black, full-frame white or stray frames. Raised: an N rim above the crop line on `03G` and `06B`; `03H`'s
  caption over the pale photo; the caption list in D-107. Rendered before the fades were in, so no fade is checked.
- **Carl's fixes since that render, seen in his screenshots, not in a render:** `03G` Crop Bottom 115, `06B` Crop Bottom 140, `03H`'s caption
  yellow at Y 100 (the film's only coloured caption so far).

**When he renders again:** as `film2-review-2.mp4` in `02 Ornate corners`, watching for Resolve's `Untitled` prefix on the name. Check the length first (9:15:00 plus any before clip). Then every
frame: black, white, stray frames; the crops, by comparing with the source clips (`film-compare-renders-1-november.py`, adapt it);
the N whole-frame by template AND any rim at the crop lines; captions against what's behind them.

**The grade:** not discussed for film 02. Film 01's method: leave the text and chat clips as they are; one grade on the object clips,
copied across; set the amount against the clip with the hottest peaks. Measure the gold and blue before suggesting a value: film 01's
1.08 was teal's. ⛔ Keep the differences between stages. Rejected takes are meant to look rejected.

## FILM 01 AS IT STANDS

- Resolve project "Film 1", 47 clips, 8:27:22, 15,232 frames, graded: master Gain 1.08 on 20 clips. No version approved.
- `film1-review-5.mp4` is the latest render. `08A` Crop Bottom 69 saved after it, not re-scanned. Carl: *"After the music is put on we
  will check at the final process."* Don't raise it before then.
- ⛔ **It stays on Carl's PC** (*"Leave it on my PC for now"*). Hosting not chosen. What going up needs is in D-107.
- Staying by his ruling: the N in Media Player at 4:43; the arc at 4:18; *"The white scroll line is fine"* (he did not say which).
- Still Carl's: the faint line down `09B`'s left (Crop Left 22 would take it, raised once); a stray point on clip 47's curve, no effect.
- ⚠ `film1-v3.edl`, `.srt` stale from `09A` on; the `whoweare-cut10-build.mjs` entry for `01E` stale. `10 Pick-ups\09A_…-tail-3s.mov`
  unused: delete only at his word.

## FILM 04, BEFORE CARL STARTS

- **Scan every frame first:** `live-work/scripts/film-scan-clips-1-november.py` (per clip, needs OpenCV and `n-template.png` beside it; the
  venv was session scratch). `film-caption-heights-1-november.py` is the height test. Paths are film 02's. White openings, head scan only: `03F` 2, `05G` 10, `07D` 11, `07E` 2, `07F` 14, `07G` 2, `09B` 1 frames.
- **Get the wording right BEFORE he places the captions, and hand him the height list with the .srt.** ⛔ The film sets the number of
  captions, never the editing (Carl: *"Just because there is a lot of editing should not alter how many captions we put in."*).
- **Baked subtitles** (one transparent video on V2; alpha untested): raised twice, not taken up. Carl places and fades by hand and is
  happy to (*"i thrive on the tedious lol"*). Don't raise it again as a labour saver.
- Markers ready: `cut10-markers.edl` in the film's folder.

## OPEN — with owners

- **Carl:** film 02's captions, before clip, render; films' approvals and final checks after the music; film 04; the hero; Send; mastering.
- **Proposed, not built (D-106):** colour test chart; frame-stepped capture at 2× (§5a note first); 10-bit master; a correction LUT.
- **Raised, not chosen:** stills of text in timeline gaps; flat views; the speed spline editor; signature moves; R2.
- **Carried:** `about-card-glass.ts:491` comment untrue (flag only, protected).

## LESSONS (this session; D-107 has the record)

- ⛔ **A wrong frame label reached Carl and he ruled on it.** A script zipped decoded frames to an unsorted list, so the 6:32 page
  was reported as 4:18. Sort the list, or extract one frame at a time.
- **A corner window at x < 140 missed an N at x 134 to 147,** and review 3 was called clean with a full N in it. One frame per clip
  missed it too. Use a template; a template can't see a cropped rim, so check crop lines separately.
- ffmpeg 9 has no `-vsync`: use `-fps_mode`. A scan read no frames and exited 0. Assert the frame count.
- A percentile on a scaled-down frame understated the end clip's peak (0.88 against 0.98). Carl's eye caught it.
- A graded clip's number turns rainbow in Resolve (Carl's find). Check that, not the thumbnail, which shows the first frame only.
- Paste Attributes opens on subtitles but carries no fade. I said so as uncertain and asked him to test on one clip: keep doing that.
- `taskkill /IM ffmpeg.exe` kills every ffmpeg on the machine, not just mine. Stop the PID instead.

---

*Written 1 November 2026, later. Replaces the earlier 1 November handoff.*
