# Session Handoff — 30 October 2026. FILM 01 IN RESOLVE, NEARLY THROUGH ITS FAULT LIST; FILMS 02 AND 04 NOT STARTED.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Replaces the 29 October session-2 handoff. Delete it at the
end of the session that reads it, once its replacement is written.

**Where the project is:** no site code changed. HEAD `7f9f7de`; this session's record (D-107, the sprint row, this file) is
NOT committed: Carl has not asked. Lint not run, nothing to lint. Schedule unchanged: edit films 01, 02, 04 → the hero
(several sessions; film 3 is its capture) → Send → mastering. Deadline 19 November.

**How to work with Carl in Resolve:** one step at a time. He cuts; every edit is his. ⛔ **Two lists: FAULTS, and WHAT'S THERE
for his judgement. Never file a suggestion as "to fix" or chase it across exports** (*"Did i authorise any editing
choices?"*). Don't explain his own controls: he edits and adds subtitles himself. Look at the frame before calling anything a
fault.

## ⛔ TO-DO LIST (Carl, end of session: *"Put it on the todo list. Make a note of other things and we will tackle them next session."*)

1. **BRAND COLOURS PICTURE — ASK CD (Carl's step). The Builder does NOT make it.** Carl: *"We need a visual represention of our
   brand colours. I know you can do it but we will ask CD and import it from there."* It replaces `01E` (01:00:39:00 to
   01:00:44:00), a stock swatch sheet with a faint **dreamstime** watermark that cannot go out in a public film. Carl tried the
   caption in another colour there and wasn't happy.
2. **Film 01's remaining faults** (timecodes from the render at 8:28:22; shift if he has trimmed since):
   - `07C` and the second piece of `08B`: white sliver bottom left, up to 22 px wide. **Crop Left 22, keeping Crop Top 132.**
   - `09B`, 01:07:40:13: one black frame at the cut. Trim 1 frame off its head.
   - `01G`, 01:00:54:10: the first caption line touches "Home" in the nav. Nudge the caption.
3. **Film 01, for Carl's judgement (not faults, raise each once):**
   - `05F`: the white strip inside the media player, about 15 s, runs through "screen" in the caption. `06A`'s image viewer
     shows the same strip. A crop can't reach either.
   - `05F`: 20 s with no caption after 01:04:47:18. Three lines were offered; he hasn't used them, so don't re-offer.
   - `05D`: 13 near-black frames, buttons fully up by frame 24. Its two captions have not moved.
   - N dev badge on `01G` and `10C`. He painted it out of film 02's stills; a blur or small crop would be his.
   - `03A`: stair-stepped edges at 4× (noted early, not raised since).
4. **After those:** a new burned-in render, then his grade and score (Resolve → Pro Tools → Fairlight; Sonar for the bed).

## FILM 01 AS IT STANDS

- Resolve project "Film 1", Timeline 1, 1920 × 1080, 30 fps, Rec.709 Gamma 2.4, 46 clips, 8:28:22. Ask Carl whether it is saved.
- `Videos\C2B Films\01 Who we are button\`: `film1-review.mp4` is the 17:39 render, subtitles burned in. `film1-v3.edl` and
  `.srt` PREDATE the new `10B` and the `10C` cut (exact shape: everything up to `10A` unchanged, then `10B` 5:00, `10C` 8:09).
- New `10B`: `10 Pick-ups\10B_the-who-we-are-button-live-uhd.mov`, live site, 3840 × 2160, DNxHR HQ. Sharp to about 2×.
  Old `10B` deleted at Carl's word. `whoweare-cut10-build.mjs` can rebuild it.
- **The render's every-frame scan** (15,262 frames, controls passed on known-bad sources): no white, no right bars or strips, no
  taskbars, no bright browser bars. All 70 captions present; 64 measurably fade.
- ⛔ **Never hand him a replacement .srt for film 01:** it wipes his placement and fades. The wording is his in Resolve now.

## FILMS 02 AND 04, BEFORE CARL STARTS

- **Scan every frame first**, of the used spans, then LOOK at each flag. Film 04 has white openings (from a head scan only):
  `03F` 2, `05G` 10, `07D` 11, `07E` 2, `07F` 14, `07G` 2, `09B` 1 frames. Film 02: none in the first 5 s of each clip;
  never scanned whole. Also scan left edge, taskbar and Chrome bars and give him crop groups, as film 01's (D-107).
- **Get the subtitle wording right BEFORE he places them.** Placing and fading 70 by hand was *"mind numbingly tedious"*.
- ⛔ **Carl's decision, not answered:** subtitles rendered as one transparent video on V2, position and fades baked in. One drag
  and retimeable from his EDL, but text not editable in Resolve, and whether Resolve reads the alpha is UNTESTED.
- Markers ready: `cut10-markers.edl` in each film's folder (`films-markers-edl.py`). Route in `D-107` and the film-pipeline memory.

## OPEN — with owners

- **Carl:** the hero; Send after it; mastering. Ask CD for the colours picture.
- **Proposed, not built (D-106):** colour test chart; frame-stepped capture at 2× (§5a note first); 10-bit master; a correction LUT.
- **Raised, not chosen:** stills of text in timeline gaps; flat views; the speed spline editor; signature moves; R2.
- **Carried:** `about-card-glass.ts:491` comment untrue (flag only, protected).

## LESSONS (this session; D-107 has them too)

- A threshold is a question, the frame is the answer: `10C`'s "white flash" was the `/about` logo panel. Sampling lied twice.
- Never carry a measure from a neighbouring clip: `05D`'s "4.7 s" opening was 0.8 s.
- ffmpeg's dnxhd fails at UHD on default threads, and this machine ran out of memory at 8: `-threads 1` throughout.
- Site captures need `--hide-scrollbars` AND `html{scrollbar-gutter:auto!important}`, or a white strip lands on the right.
- A python print or tool with `tail` hides capture logs: send them to a file (the GPU line was lost once).

---

*Written 30 October 2026. Replaces the 29 October session-2 handoff.*
