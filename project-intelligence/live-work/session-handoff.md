# Session Handoff — 1 November 2026, session 2. FILM 02'S CAPTIONS ARE ONE LAYER, APPROVED; THE GRADE IS NEXT.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Replaces the earlier 1 November handoff. Delete it at the end of the
session that reads it, once its replacement is written.

**Where the project is:** no site code changed; lint not run, nothing to lint. Deadline 19 November. Order: edit films 01, 02, 04
→ the hero (several sessions; film 3 is its capture) → music (Carl: *"Music comes after the hero is completed"*) → Send → mastering.

**Next session:** film 02's grade, Carl: *"we will do the colour grades next session. But we have gold and blue metal so i suspect the
values will be different, inlike film 1 teal."* Then film 04.

**How to work with Carl in Resolve:** one step at a time. He cuts; every edit is his. ⛔ **Two lists: FAULTS, and WHAT'S THERE for
his judgement.** He is not a colourist: name the box, say what it does. Look at the frame before calling anything a fault.
⚠ Don't state a Resolve menu or behaviour as fact unless it's been seen on his screen.
⛔ **Don't run ahead.** He stopped three actions this session that he had not asked for. "We will…" is not a go. Ask, then wait.
Give fade and timing differences in frames and time, not percentages (*"instaed of percentages give me time/frames"*).
**Seen on his screen:** Change Clip Duration (Ctrl+D); Transform Position X / Y; Composite Mode on a V2 piece. The Inspector shows
whichever clip is selected: find the highlighted clip before reading a value from a screenshot (I misread one this session).

## FILM 02 AS IT STANDS

- Resolve project `Film 2`, Timeline 1, 1920 × 1080, 30 fps, 56 clips on V1, 10 pieces on V2, **9:15:00, 16,650 frames**, no audio.
- **Latest render:** `02 Ornate corners\film2-review-2.mp4`, 252.9 MB, every frame scanned: **no faults.** Rendered BEFORE the `03H` Subtract change
  and the V2 cut around it. Film 02 is NOT approved.
- **Captions, R-099 APPROVED, with the workflow:** `07 Subtitles\film2-captions-layer.mov` on V2, not a subtitle track, from `film2-captions.ass`,
  91 lines. Wording from `film2.srt`; Carl's positions read from `film2-review.mp4` by differencing against the clean clips. Open Sans Bold, 80.6
  (`07 Subtitles\fonts`). Carl's figures: 30 frames clear at clip ends, fade in 30, fade out 15. My defaults, not contradicted: 15 frames between
  lines on a clip, 15 clear on clips of 5 s or less, no line under 2 s. Rules kept: Y 100 on cropped clips, Y 120 on chat clips. The subtitle track is
  gone, so ⛔ wording changes now come to me: edit, re-render about 15 minutes, overwriting the file may keep his V2 cuts (untested).
- **Moved on V2 by Carl:** `01C` Y 10, `03F` Y 20, `06G` X about 215.
- ⚠ **The fades land squared:** free Resolve reads the premultiplied file (version B) as straight. Half strength about 6 frames late in, 3 early out.
  Carl: *"200ms and 100ms are within tolerance."* **Ruled; do not raise again on film 02.** The `straight` render is untested at full length.
- **`03H`:** caption in Subtract (Composite Mode) on its own V2 piece: navy, contrast 5.05 : 1 against yellow's 2.50. Fades under Subtract not yet checked.
- **`06G`, `06H`, done:** the bench with its controls, then §3 of the page, stills 4 s each, `02 Ornate corners\10 Pick-ups`, PNGs on V1, Cross Dissolve 32
  frames. ⚠ The page is shot at gain 1 (pre-pass 3), rewritten in the capture browser only, so *"They agree."* is true of that moment. Today's page is brighter.
- **The ending:** `00A` 5 s, Cross Dissolve, `08C` 5 s. Carl: *"Timed beautifully."*
- **What's there, Carl's:** `01B`'s last caption line 3 px from the frame's bottom; `08A` 10 px; extremely faint traces at the crop line on `03G`, `06B`.
- **Four lines left as drafted, his to delete:** Gemini named (`03E`), the face in the leaves (`03L`), "someone else's product" (`03J`), film 01's closing
  line reused on `08C`.

**When he renders again:** `film2-review-3.mp4` in `02 Ornate corners`, watching for Resolve's `Untitled` prefix. Check the length first, 16,650 frames. Then
`live-work/scripts/film02-scan-review2-1-november.py` and `film02-check-captions-1-november.py`; the venv was session scratch (numpy, opencv-python-headless, pillow).

**The grade:** Film 01's method: leave the text and chat clips as they are; one grade on the object clips, copied across; set the amount against the clip with
the hottest peaks. ⛔ **Measure the gold and the blue separately before suggesting a value:** film 01's 1.08 was teal's. ⛔ Keep the differences between stages.
Rejected takes are meant to look rejected.

## FILM 01 AS IT STANDS

- Resolve project "Film 1", 47 clips, 8:27:22, 15,232 frames, graded: master Gain 1.08 on 20 clips. No version approved.
- `film1-review-5.mp4` is the latest render, 164.5 MB. `08A` Crop Bottom 69 saved after it, not re-scanned. Carl: *"After the music is put on we will check at
  the final process."* Don't raise it before then.
- ⛔ **It stays on Carl's PC** (*"Leave it on my PC for now"*). Hosting not chosen. What going up needs is in D-107.
- Staying by his ruling: the N in Media Player at 4:43; the arc at 4:18; *"The white scroll line is fine"* (he did not say which).
- Still Carl's: the faint line down `09B`'s left (Crop Left 22 would take it, raised once); a stray point on clip 47's curve, no effect.

## FILM 04 AND THE CAPTIONS

- **Carl: *"For films 3 + 4 we will look at a combo wokflow"*:** Resolve with Kdenlive (kdenlive.org). Chosen in principle, not designed. Proposed: Resolve finishes the picture;
  I write the ASS; Carl checks and corrects it in Kdenlive; I render the layer. Untested: does Kdenlive show `\fad` and `\pos`, drag a caption, save them intact.
  Carl: Kdenlive's tutorial docs *"We will download them"*: not done, wait for his word.
- **Carl's plain moves count as the method:** cut V2 at V1's cuts, Position, Composite Mode.
- **Scan every frame first:** `live-work/scripts/film-scan-clips-1-november.py`. White openings, head scan only: `03F` 2, `05G` 10, `07D` 11, `07E` 2, `07F` 14, `07G` 2, `09B` 1 frames.
- ⛔ The film sets the number of captions, never the editing. Markers ready: `cut10-markers.edl` in the film's folder.

## OPEN — with owners

- **Carl:** the grade; films' approvals and final checks after the music; film 04; the hero; Send; mastering.
- **Proposed, not built (D-106):** colour test chart; frame-stepped capture at 2× (§5a note first); 10-bit master; a correction LUT.
- **Raised, not chosen:** stills of text in timeline gaps; flat views; the speed spline editor; signature moves; R2; real text over the films (hosting first).
- **Carried:** `about-card-glass.ts:491` comment untrue (flag only, protected).

## LESSONS (this session; D-107 has the record)

- ⛔ **"B is the right version" went to Carl on one frame at full strength.** Only a render showed the fade was wrong. Prove an alpha mode across a fade.
- Frame count and "all captions present" both passed on a broken layer. Read the alpha back. ffmpeg's `ass=...:alpha=1` applies a fade twice; draw the matte separately.
- Importing `film02-subtitles-build.py` rewrites the wording list as a side effect. Parse the .srt.
- ⚠ A forced 12× close-up lost its WebGL context; `DEADLINE_MS` drops the page corners to the border if slow. Dropped: Carl wanted the bench seen, not a close-up.
- A process kill matched by command text stopped its own shell. Netstat and `Get-NetTCPConnection` reported port 3100 clear while it served. Stop by process name and confirm with a request.
- The Grep tool skips `live-work/`: use `grep -rn` there. `taskkill /IM ffmpeg.exe` kills every ffmpeg on the machine.
- ffmpeg 9 has no `-vsync`: use `-fps_mode`. Assert the frame count.

---

*Written 1 November 2026, session 2. Replaces the earlier 1 November handoff.*
