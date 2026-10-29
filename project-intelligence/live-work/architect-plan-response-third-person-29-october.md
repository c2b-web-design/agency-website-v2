# Architect's review: structural note, the third-person view (v1). 29 October 2026

**Source:** pasted into the Builder's session by Carl (*"The Architects review is ready."*). Saved verbatim below.
**Checked by the Builder before folding in:** drei `Line` sets `resolution: [size.width, size.height]` (the full canvas,
`@react-three/drei/core/Line.js`) — so item 6 is right and the note's §5b row was backwards. ⚠ **"T1b may not be
committed" is FALSE at the time of folding:** `5b95fdb` is HEAD and `origin/main` (checked with `git rev-parse`); the
review read a `git status` taken before the commit. **Carl's decisions on must-fix 1–3 (same message, verbatim):**
*"Right stick click for third person on, click again for off (selected camera view ) When in third person i will see the
whole scene on the screen from where i position myself using the controls. What the PiP should show is the view from the
currently selected camera. So i will see both its trajectory and the view while executing that trajectory in PiP."*
**Folded in as note v1.1.**

---

Let me read the scene section of the bench and the frame function.

  Searched for 5 patterns, read 4 files

Checking the note's claims against the code. One thing left to verify: how drei Line sizes its width, because the note's §5b table depends on it.

  Searched for 2 patterns

I've reviewed the note and checked its claims against the code. It's the Builder's own note, so this is a second pair of eyes, not approval. The Architect review and your approval still apply.

Verdict

The structure is sound. The behaviour around it has gaps, and one of them is a contradiction that has to be resolved first. I'd send it back as v1.1 before it goes to the Architect.

What I checked and confirmed:
- The render takeover. R3F is 9.6.1, and the only other frame callback is LetteringPiece's at priority 0, so a priority-1 callback does take over rendering.
- The switch keys. BTN.RS (11) exists and nothing uses it; the keyboard's T is free.
- Layers. three only draws objects and lights whose layers the camera can see (WebGLRenderer.js:1835). With helpers on layer 1, the shot camera can't draw them, so they can never reach a recording or a client film.
- One canvas, scissored. Rejecting a second canvas, a render target and drei View is well argued.

Must fix

1. Which pose does the PiP show? The note says three different things:
   - §1 and your choice: the PiP shows the armed track's camera.
   - §3: in third person the shot camera follows the playhead "as after a scrub". That is poseAtT, which gives what plays, the top track (bench-chain.ts:447).
   - The harness expects the PiP to match the first-person view at the same moment, which also means what plays.

   With Cam 1 armed and Cam 2 playing above it, these disagree. The note has to pick one, and playback (X) needs a ruling too: does the PiP show the edit or the armed camera? That's your call.
2. Flying the eye during playback. Today any fly input stops playback (camera-bench.tsx:746). The note leaves that unchanged, so moving the eye while a move plays would stop it. Your workflow ("step out… view… be put in position") suggests the eye should fly without stopping playback. That needs to be decided.
3. Entering third person loses an unrecorded framing. If you've flown to a framing but not pressed A, switching to third person moves the shot camera to the playhead. Switching back, by default 2, puts it at the armed camera's pose. Either way the framing is gone. Option 2 should say this plainly.
4. Switching while recording or mid-drag isn't covered. The note should say what happens: refused, or stops the recording. It should also add the switch to T1b's list of eleven controls that are blocked during a drag.
5. The camera labels bring back the lag the note rejected. drei View was rejected for its DOM-lag class (D-046/D-048), but "Cam 2" DOM labels placed "from the projected position" have the same problem:
   - If they update through the 10 Hz onView, they'll trail the moving bodies during playback.
   - The fix is to write them by ref inside the render callback, or draw them in the canvas on layer 1.
   - They also need hiding where they fall over the PiP.

Should fix

6. The §5b row about line widths is backwards.
   - drei Line sets its resolution to the full canvas size (Line.js:66), so in a quarter-width viewport the axis lines come out about 4× thinner, not heavier. That's the correct size for a scaled-down picture.
   - What does read heavier in the PiP is the drei Grid, whose lines are a fixed pixel width.
   - That makes the "compared downscaled" harness check work better than the note thinks.
7. The eye camera has no named owner or lifetime. That's §5a's lifetime test. Its near/far aren't given either; far needs to be at least the shot camera's m.d × 60 for "see it all" to work.
8. trackPath needs units. Chain poses are stored relative to d, so the paths must go through chain.units with toWorld, like setRig, never the live m. They also can't be drawn while units is still null. This is the same class of mistake as the earlier Home/T2 problem.
9. Layers apply per object, not per group. Every mesh in each camera body needs layer 1 set on it directly. I'd also keep the helpers mounted all the time: gl.compile compiles every material whatever its layer, so they'd compile with the brass at load instead of stuttering on the first switch.
10. "Home" is ambiguous. The keyboard's Home key is toStart; home() is the pad's View button and the keyboard's H. The note should name H as well.
11. The PiP's scissor coordinates. setScissor and setViewport count from the bottom left, so "16 px from the top" has to be converted. That conversion belongs with the PIP constant.

Minor

- "three Layers" reads as three layers; only two are used.
- The note doesn't say what the PiP shows when the armed track has no clips yet.

Two things outside the note

- The handoff is stale. session-handoff.md is still the 27 October one, but decisions.md runs through 29 October.
- T1b may not be committed. Your "Commit and push" (R-097) is recorded, yet git status still shows the T1b changes staged and not committed. Worth checking before the third-person build touches the same files.

Should I fold these into the note as v1.1? Must-fix items 1–3 need your decisions first.

---

# Review 2: note v1.1. 29 October 2026

**Source:** pasted by Carl, saved verbatim. **Verified by the Builder:** must-fix 1 is right — `posed` re-poses the camera
each frame through `playheadPose()` → `poseAtT` (what PLAYS; camera-bench.tsx `playheadPose`, the `posed` branch of
`frame()`). ⚠ **The aside is FALSE again:** T1b is `5b95fdb` = `origin/main` (re-checked with `git rev-parse`). This round
the Architect named item 2 as Carl's call without putting options to him (the 29 October rule). **Carl's call on item 2
(the Builder's question dialog, verbatim choice):** *"The clip being played (Recommended)"*. **Folded in as note v1.2.**

---

Architect review: third-person view note, v1.1

Verdict: almost ready. All of the v1 findings are folded in correctly: the five must-fix, the six should-fix and the two minor. Your decisions are recorded word for word, and the review is saved at architect-plan-response-third-person-29-october.md. One must-fix comes from the new text: as written, switching off would show the wrong camera. Fix that and the should-fixes below, and I'd approve it. Nothing in this round changes the structure.

Must fix

1. Switching off would land on whatever plays, not the selected camera.
   - §1 says switching off leaves the camera "posed" on the selected (armed) camera.
   - In the code, "posed" means every frame re-poses the camera to playheadPose(), which is poseAtT: the top track, whatever plays (camera-bench.tsx:404–412, :755–757).
   - So with Cam 1 armed under a playing Cam 2, switching off shows Cam 1 for one frame and then jumps to Cam 2. That's the opposite of what you asked for ("click again for off (selected camera view)").
   - The note's own harness check (Cam 1 under Cam 2, framed as Cam 1 after switching off) would catch it, but the note should get it right first.
   - Fix: switching off sets the rig to trackPoseAt(armed) and parks it with posed = false, like a fly that has stopped. The camera then stays on Cam 1 until a scrub, play or step re-poses it.

Should fix

2. Solo playback isn't covered. X with clips selected plays them solo (playheadPose's solo branch). Two cases need a ruling:
   - The PiP follows the armed track, so soloing a Cam 2 clip with Cam 1 armed shows Cam 1.
   - Soloing an older take that sits under a newer one on the same track: the helpers follow the newest take (trackPoseAt), so the soloed take's path never moves.

   The Builder should state a default and you decide it. The likely one: during a solo, the PiP and the moving helper show the clip being played.
3. The shot camera needs exactly one writer in third person. §2 says the shot camera is "posed by trackPoseAt" but not by whom: frame() or the render callback. Two writers would be a second source of truth. It matters because frame() also saves the shot rig under CAMERA_KEY. The note should name frame() as the one writer and say whether rig itself moves or only the camera object.
4. The 10 cm grid's line thickness also needs one writer. It's set today in BenchScene's priority-0 callback from st.camera. The note moves it to "before each draw" but doesn't say the old write is removed. The render callback should own it, while the HUD's focusPx stays the shot camera's.
5. The cost can't be measured "before the build is approved". Third person has to exist before it can be timed. It should read: measured at the checkpoint, before you approve the take.
6. The Controls drawer. The help text (camera-bench.tsx:1368–1404) gains the right-stick click and T. A refused A also has to name T for keyboard use; the current message ("right-stick click to the camera to record") only names the pad.

Minor

- Each track's proxy camera for the frustum should carry the clip's roll, so a barrel take's frustum rolls with its picture.

Items 1 and 3–6 are wording or specification fixes for the Builder. Item 2 needs your call on the solo default.

On the earlier aside: git status at the start of this session still showed T1b staged and not committed, despite your "Commit and push" (R-097). I haven't checked since. Worth confirming before this build opens the same files.


---

# Review 3: note v1.2. 29 October 2026

**Source:** pasted by Carl, saved verbatim. **Verified by the Builder:** the play branch re-poses every frame whatever
`posed` says (camera-bench.tsx:745–751); the fly branch levels the roll with no input (:760–761); the HUD reads the rig
(:803, :805). **Carl's word on point 1 (the Builder's question dialog, his own text):** *"Whatever im doing i will stop. The
goal and idea here is to be able to have more than one perspective on the scene. First for compositional purpose and then
editing purpose."* **Folded in as note v1.3.**

---

Architect review: third-person view note, v1.2

Verdict: ready for your approval once the three points below are written in. All seven v1.1 findings are folded in correctly:
- Switching off: it now sets the rig and parks it.
- Solo: recorded with your call.
- One writer: frame() writes every camera, the rig stays put, and CAMERA_KEY is protected.
- Grid thickness: the priority-0 write is removed.
- Cost: measured at the checkpoint.
- Controls drawer: gains the switch.
- Roll: the frustum carries it.

The harness list now covers the must-fix. Nothing new is structural; points 1 and 2 are edges of the switch-off fix.

1. Switching off during playback still jumps to whatever plays (should fix, your call)

The parked posed = false only holds when the bench is not playing. During play, the play branch re-poses the rig every frame from playheadPose(), whether or not posed is set (camera-bench.tsx:745–751). So with X running, Cam 1 armed and Cam 2 on top, switching off shows Cam 1 for one frame and then cuts to Cam 2. A plain play also ends with posed = true (:398), which goes back to poseAtT.

Builder's default to state, for you to confirm: switching off stops playback at T (stopPlay(false)) and then sets the rig, so what was in the PiP goes full screen and holds. The alternative is to keep playing in first person, which shows the cut, not the selected camera. Your words ("click again for off (selected camera view)") point to the default. A harness check should cover it: switch off mid-play with Cam 1 under Cam 2, and it holds on Cam 1.

2. Switching off mid-roll snaps the picture level (should fix)

With posed = false the fly branch runs every frame and sets this.roll = 0 with no input at all (:760–761). Switching off in the middle of the barrel would show the PiP rolled, then a level picture full screen the next frame.

Fix: keep the pose's roll until a fly input. Put roll = 0 under the same active test that clears posed. That doesn't change first person today, because roll is only non-zero after a posed or played frame, and those only end on an input. Harness check: switch off mid-barrel and the roll is kept.

3. The HUD reads from the wrong source in third person (minor)

The HUD's position and lens come from r, the rig (:803–805). In third person the rig stays where first person left it, while the PiP shows the armed camera, so the HUD would describe a camera you can't see. The note's "the shot camera's, always (what A records)" is now ambiguous. Suggested: in third person the HUD shows the PiP's pose and lens. That's where switching off puts you, so it's what A would record from.

Point 1 needs your word on the default. Points 2 and 3 are wording for the Builder. With them made, I'd approve.

---

# Review 4: note v1.3. 29 October 2026

**Source:** pasted by Carl, saved verbatim. **The Architect recommends APPROVAL; the approval is Carl's.** Its two build
notes folded into the note (v1.3.1, wording only). ⚠ **Its "T1b may not be committed" is false a third time:** `5b95fdb`
= `origin/main`; the Architect's seat reads a `git status` taken at the START of its own session and has not rechecked.

---

Architect review: third-person view note, v1.3

Verdict: I recommend approval. All three points are written in correctly, and nothing new is structural. The final approval is yours.

What I checked:
1. Switching off mid-play: the switch now stops playback at T with stopPlay(false), then sets and parks the rig, so it holds on the armed camera. A harness check covers it.
2. Roll: roll = 0 now sits under the active test. I checked the note's claim that first person is unchanged against the code:
   - stopPlay(false) is only called on a fly input (camera-bench.tsx:746) and by home() (:452), and home() sets the roll to zero itself through jumpTo = "front".
   - Starting a recording still levels the picture at once.
   - So nothing in first person behaves differently. The claim holds.
3. HUD: in third person it reads from the PiP's camera. In first person it reads from the rig, as today.

Two notes for the Builder at build time (neither blocks approval):
- Take the PiP's pose before stopping playback. In a solo, stopping clears the solo, so working out the pose after stopPlay would land on the armed track instead of the soloed clip. Take the pose first, then stop, then set the rig. The note's own solo harness check will catch it if the order is wrong.
- Your words were read slightly differently. "Whatever im doing i will stop" reads to me as you stopping playback before you switch. The note turned it into the switch stopping playback for you. It comes to the same thing either way, but the record shows it as the Builder's reading of your words.

Still open before the build: whether T1b is committed. Git status at the start of this session showed it staged and not committed, and I haven't rechecked. This build opens the same three bench files.
