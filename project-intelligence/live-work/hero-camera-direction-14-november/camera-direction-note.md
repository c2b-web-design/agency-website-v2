# The hero: camera direction note, 14 November 2026

**Status: Carl's direction, recorded. Nothing built.** The record of his words is D-101 (decisions.md), *"CARL's CAMERA
DIRECTION NOTE"*, 14 November. This file holds the direction and his test shots; it does not decide how the moves are made.

## Carl's words (verbatim)

> "first i want you to make a camera direction note. When the rain comes the camera should be close to the logo, either by
> zooming or by position. That way we will see the rain/logo interaction close up showing it to the best effect. The
> camera, having been caught in the rain should pull back showing the rain is localised, targeted. Towards the end of
> Phase 1 we should direct the camera to be in position. Some test shots"

What led to it (the same session): *"From further away the rain is not as effective as i thought it would be. so to get the
full effect on Phase 2 will depend on the camera."* Then his close-ups of rain take 1 (~2.3 m from the logo): the rain read
there, and did not read from Home.

## The direction, in order

1. **TOWARDS THE END OF PHASE 1: the camera is directed INTO POSITION** for the rain: close to the logo, by a zoom (the
   lens) **or** by position (the camera moves). Which is open, Carl's.
2. **THE RAIN, CLOSE (phase 2 opens):** the rain meeting the logo seen close up, to the best effect: the drops on the
   top edges, the splashes, the run-off down the face and the cooling (the cooling is not built yet).
3. **THE PULL BACK:** the camera, *"having been caught in the rain"*, pulls back and shows the rain is **LOCALISED,
   TARGETED**: a column of rain on the logo and its surround, not weather.

## Carl's test shots (in this folder; flown on the bench, the rain not in them)

| File | When in the story | What the frame shows |
|---|---|---|
| `test-shot-1-the-dance-low-left.png` | the dance (phase 1, middle) | the camera LOW, near the floor, at the front left; the blobs stand tall in the frame; the text *"Websites built to be seen."* angled at the left; the pool and its orange light on the floor |
| `test-shot-2-the-dance-low-close.png` | the dance | LOW and CLOSER: the blobs fill the upper frame, the chain of them curving; the text far behind, nearly edge-on; the pool and its light below |
| `test-shot-3-the-liquid-logo-oblique.png` | the re-forming (the logo LIQUID at the mould, before it hardens) | a LOW OBLIQUE from the front left: the liquid logo in the courtyard's swirl; the text angled at the left; the floor's grid to the horizon |

## How it sits with the camera rulings already on record (not changed by this note)

- **9 November (D-101):** the story animated from the fixed camera FIRST; the moving camera a LATER LAYER. The text move
  raised then (a quick push-in along the subtext, speed-ramped, perhaps oblique) is still on record.
- **13 November (R-106):** *"camera direction at the end of the phases"* — the icing on the cake.
- **26 October (R-093):** camera moves *"To be used both sparingly and appropriately."*
- **D-104:** a shot is made by Carl describing it, flying it on the pad, then refining.
- ⚠ **What this note changes, as Carl said it:** the camera now has a job INSIDE the phases. The END of phase 1 positions
  it for the rain, and phase 2's pull back is part of how the rain is shown. Whether this note's moves are built now, with
  phase 2, or in the camera layer after the phases: **open, Carl's.**

## The Builder's notes for when it is built (facts and questions, not decisions)

- **"Caught in the rain" means the camera stands INSIDE the rain's disc.** At 160 cm the disc already reaches past the
  logo's ends; a close camera in front of the face may be outside it, and would then watch the rain from dry ground. The
  disc's radius (or its centre) must cover the camera's close position, or the camera must move into it.
- **Drops very near the lens.** A streak passing a few cm from the camera fills the frame, and the camera's near plane (1
  unit, ~2 mm) cuts it. Real cameras in rain see near drops as large soft blurs. To be looked at on the bench before it is
  judged.
- **The pull back's end frame must show the column's TOP edge.** The drops now start 400 cm above the floor and fade
  over the top 15% of their fall. Pulled back far enough to read as "localised", the top of the column is in frame and
  has to read as a soft end, not a cut.
- **The run-off and the cooling must be built for the close camera, not for Home.** That camera is the one that judges
  them.
- **Zoom or position:** a zoom flattens depth and keeps the camera dry (outside the rain); moving in puts the camera in
  the rain (the drops pass the lens, *"caught in the rain"*). Carl's words lean on POSITION for the rain moment; this is
  not decided.
- The hero bench flies (the pad, the keys) but does not RECORD; the recorder is the camera bench's (`/proto/camera`). How
  a hero shot is recorded and played on the story's clock is to be worked out when the moves are built (structural, §5a).

*Written 14 November 2026 from Carl's words and shots; the Builder's notes are marked as the Builder's.*

---

## The camera bench, read and run (14 November 2026; Carl: *"Go look at the proto camera bench"*)

**What it has (D-104):** the RECORDER — Carl flies Cam 1 on the pad, A records a clip; a track per camera, clips placed in
time, the top track plays, a recording over a clip is a new take (nothing destroyed); trim and move (T1b, R-097); the
THIRD-PERSON VIEW with the shot camera as picture-in-picture (R-098); SHAPE CLIPS stored as their numbers (the helix, the
GLIDE — a smooth path through waypoints with a look-at point at each, an eased start and an eased landing — and the barrel);
the BUILDER's TAKE (`bench-builder-take.ts`: Carl describes, the Builder calculates, the bench places the take; the method
of *"we build our move just like we build our three js objects"*). The chain's arithmetic is pure (`bench-chain.ts`, no
imports) and checked under Node.

**What it does not have for the hero (seen running, `/proto/camera?idea=hero`):**
1. **Not the hero's story.** Its hero idea is 9 November's (the text, the logo on edge at the lean, the mould outline, no
   blobs, no rain); the story lives in `hero-scene.ts` on `/proto/hero` since 11 November (Carl: *"we will not use the
   camera bench. We will use the marching cubes."*).
2. **Not the story's clock.** Its timeline runs its own clock from 0 s; the hero's beats sit on the story's clock (phase 1
   ends 25.69 s; the rain from there). The direction needs the camera's moves TIMED to the story.
3. **Not the same world.** The camera bench: 1 unit = 1 cm, the floor at y 0 (R3F). The hero bench: 4.41 units = 1 cm,
   the floor at −437.5 (plain three, WebGPU).
4. **The hero bench flies, but does not record** (the same pad code, `camera-pad.ts`), and its Camera readout's Copy gives
   a pose's numbers.
5. **The story cannot be scrubbed backward yet:** it is stepped forward by each frame's delta (the blobs, the pool, the
   heat). Deterministic (no random numbers), so a jump means replaying from 0 at fixed steps.

**Routes (the Builder's; structural, §5a — Carl's to choose; none built):**
- **A. The story on the camera bench:** `hero-scene.ts` brought as a bench idea; the bench's timeline drives the story's
  clock. Every recorder tool at once; costs: the units, a plain-three scene inside the R3F canvas, a scrubbable story.
- **B. The recorder on the hero bench:** the pure chain and the timeline brought to `/proto/hero`, recorded against the
  story's clock. The story stays where it is; costs: a second home for the recorder's UI.
- **C. The Builder's take on the story's clock:** Carl flies to each position on the hero bench (as the three test shots)
  and Copies it; the Builder computes a GLIDE through them, timed to the story's beats; the hero bench plays it on the
  story's clock. Smallest; no recorder, no scrubbing; the moves are numbers to refine.

---

## ⛔ Carl's note for the direction: the WET LOOK reads best OBLIQUE (14 November 2026)

> "They look good and are more pronounced from an oblique angle. A note for camera direction"

Of the matched blue and the wet coat (D-101, wash take 2 with the wet look). Face on, the coat and the running water are
quiet; from an OBLIQUE angle the coat's reflections and the water streaks are pronounced. His two frames, kept here:
`oblique-wet-1-low-left-close.png` (low, front left, ~7 m of distance in units, mid-wash: the blue glassy, the red going at
the feet of the c and the b) and `oblique-wet-2-steep-side.png` (a steep side angle, the coat bright along the strokes).
For the direction (decided when the scene is finished): the rain/wash moment wants an OBLIQUE camera, not face on.

**And the BEADS and streaks (14 November 2026, later):** Carl: *"this is a better angle for the bead droplets/streaks"* —
`oblique-wet-3-low-right-steep-beads.png`: LOW and from the front RIGHT, a steep raking angle along the face, the text
turned edge-on behind at the left; the coat's streaks bright down the strokes, the last red at the b's foot. For the
direction: the beads and streaks want a LOW, RAKING angle along the face.

## ⛔ Carl: "This angle is great." — ACROSS THE TEXT (14 November 2026, after the commit)

Three frames from one camera position through phase 1 (`across-the-text-1-the-dance.png`, `-2-one-blob.png`,
`-3-the-liquid-logo.png`): the camera LOW and to the LEFT of the text, looking ACROSS it toward the story — *"Websites built
to be seen."* huge in the left foreground, raking away; the subtext laid along the floor leading the eye in; the story
beyond it on the right: the dance (with the pool and its orange light), one blob, the liquid logo in the mould. For the
direction: a shot that keeps the TEXT and the STORY in one frame — the words in front, what they promise behind.
