# Structural note: directing the hero's camera (14 November 2026), v1.2

**v1.2 (14 November 2026) — ⛔ CARL CLARIFIES ROUTE A: THE CAMERA BENCH PLOTS; THE SCENE STAYS.** *"The whole scene doesnt
have to be brought over. In this instance its primary function is to plot camera position and movement. We need to know
three things. Where Home is, where the camera is and where the objects are relative to each other in 3d space. Objects can
be represented by 3d outlines. Its not important how they look, its important where they are. Any camera movements can be
mapped."* (D-101). → The camera bench gets a STAND-IN of the hero: HOME, the CAMERA, and each OBJECT as a 3D OUTLINE at its
true place (the text block, the logo at its poses, the rain's column, the dance's region…). Moves are plotted there (flown
or computed) and played back IN the hero on its own bench. So v1.1's questions 2–6 FALL AWAY (no hero scene in the R3F
canvas, no compute, no draw twice, no panel; the 9 November hero idea's fate stays Carl's). What remains, for the rewrite:
1. **ONE CONVERSION** between the two worlds (the hero: 4.41 units a cm, the floor at −437.5; the bench: 1 cm a unit, the
   floor at 0) — for the outlines going over and the moves coming back. A pure function, checkable both ways.
2. **WHICH OUTLINES, AND WHERE:** exported from the hero's own numbers (its bounds and poses), not re-measured by hand.
3. **TIME:** the objects MOVE (the lean, the jump, the dance, the fall). Whether an outline follows the story's clock on the
   bench (its poses sampled from the hero) or stands at its key poses only — Carl's.
4. **THE WAY BACK:** a plotted move is the chain's numbers (the MOVE shape, §4); the hero plays it on the story's clock.

**v1.1 (14 November 2026) — ⛔ CARL CHOSE ROUTE A, AND ITS TIME.** *"we will move the scene to the camera bench"* … *"That is
after our work is done on the proto/hero first"* (D-101). → **THE STORY MOVES TO THE CAMERA BENCH** (its idea slot,
`?idea=hero`), where the recorder, tracks, cuts, third person and shapes already are; **WHEN: after the scene is finished on
`/proto/hero`.** The v1.0 decision below (the recorder brought to the hero bench, a second store) is **SUPERSEDED, kept as
v1.0's record**; what stays is the ONE CLOCK (the story's time is the playhead), FLOWN and COMPUTED moves, JUMP CUTS, and
the MOVE shape and its mathematics (§4). This note is REWRITTEN IN FULL for route A when the move is due. The structural
questions route A raises, found on 14 November reading `camera-bench.tsx` and `bench-medium.ts` (to be answered then):
1. **THE UNITS:** the hero is 4.41 units a cm with the floor at −437.5; the bench is 1 cm a unit with the floor at 0 (its
   grid, floor stop, walking pace, near plane, the chain's units). A parent SCALE breaks the hero's world-space effects (the
   dissolve's `positionWorld` chunks, the fronts in world y, the rain's world-space compute and its billboard, which uses no
   model matrix). Options: (a) scale + audit every world-space dependency; (b) draw the hero in its OWN frame with the bench
   camera converted (position ×4.41, offset; near and far matched so the depth is shared with the bench's grid and path
   helpers); (c) rebuild the hero in centimetres (the largest change to approved phase 1). Phase 1 must stay pixel-identical
   at Home (a null control) whichever is chosen.
2. **THE IDEA CONTRACT:** an idea receives no TIME and no RENDERER step today (`IdeaSceneProps`: medium, part, onReady). The
   story needs the bench's playhead (and a SEEK) and the rain's `compute(renderer)` before the draw.
3. **THE DRAW:** in third person the bench draws the scene TWICE (the eye, then the shot camera in the PiP) — the hero's
   cost twice; an idea's `post` replaces the plain draw for ONE camera. Priced then (D-108).
4. **A plain-three scene in the R3F canvas:** `createHeroScene` is imperative (its own Scene, camera, lights, background);
   mounted by the idea's Scene component, its lifetime tied to the bench's.
5. **THE PANEL:** the hero's dials (lil-gui: rain, logo, simulation) need a home on the camera bench (the idea's Guide layer).
6. **The 9 November hero idea** (`hero-idea.tsx` and its parts: the text, the lean, the route B liquid probe) is replaced by
   the story: retired or kept, Carl's.
7. **`/proto/hero`'s fate** once the story runs on the camera bench: Carl's.

**v1.0 — For:** Carl, to route to the Architect (CLAUDE.md Workflow 5a: a second home for the camera recorder; the story's clock
taking ownership of the camera; a new shape in the camera bench's shared, approved chain file). **Status:** PROPOSED.
Nothing in it is built.

## Carl's words (14 November 2026, verbatim; recorded in D-101)

> "So the point of me showing you that is we are talking about camera direction. Our scene will be built from the Home
> position. Ocassionally, as now , i may move the camera in to check in this instance how the rain interacts and looks
> close up. The phases tell a story as you know, camera position can enhance that story. i have the ability to use a pad
> and fly about the scene, recording as i go. Sometimes i will place the camera in a starting and end position. I may
> require an arc or parabola and zooming- all at the same time. Thats where you come in, for as the Vader move shows. that
> requires precise mathematics."

> "yes, you can write that up as a structural note. Also add that more than one camera may be used using jump cuts. Only
> when the scene is finidhed will we decide on how to direct it."

## ⛔ What this note does NOT decide

**The DIRECTION — which shots, when, from where — is decided ONLY WHEN THE SCENE IS FINISHED** (Carl, above). The
direction note (`hero-camera-direction-14-november/camera-direction-note.md`: in position by phase 1's end, close for the
rain, pull back to show it local) is a candidate on record, not a shot list. This note is the INSTRUMENT the direction
will be made with. **When it is built is Carl's.**

## Why

The camera bench (`/proto/camera`, D-104) has the instrument: the recorder, tracks and takes, cuts, the third-person view
and PiP, shape clips as numbers, the Builder's take. The hero's story is on a different bench (`/proto/hero`, since
11 November), on its own clock. Read and run on 14 November (the direction note, "The camera bench, read and run"):
the camera bench's hero is 9 November's; its timeline is not the story's clock; its world is 1 cm a unit with the floor
at 0 (the hero's: 4.41 units a cm, the floor at −437.5); the hero bench flies but does not record; the story only runs
forward. A camera move for the hero must be timed to the story (*"Towards the end of Phase 1 we should direct the camera
to be in position"*), so the two have to meet.

## The decision (proposed)

**The recorder comes to the hero bench, and the story's clock drives it.** Four parts:

### 1. One clock: the story's

The hero bench's playhead IS the story's time (`storyT`, seconds since the logo appeared). A clip placed at 24 s plays
when the story reaches 24 s. Recording runs while the story plays forward, so a flown move is timed to what it sees.

- **Seeking** (scrub, "to the start", playing from the playhead) needs the story AT a time. The story is stepped forward by
  each frame's delta (the arrival, the dance, the pool's hits, the heat, the rain); it uses no random numbers except the
  rain's GPU seeds. So a seek REPLAYS the story from 0 at a fixed step to T. ⚠ **UNMEASURED: its cost.** Each step runs
  the marching cubes (the field's polygonising); 25 s at 60 steps a second is 1,500 steps. If it is too slow the steps
  can skip the polygonising and the drawing (the field's state only) — to be measured before it is chosen.
- ⚠ The rain on a seek is the same rain in kind, not drop for drop (its seeds are random); a film is still made by
  stepping from 0, frame by frame, as phase 1's were.

### 2. Two ways a move is made, both stored as the chain's clips

- **FLOWN:** Carl flies on the pad (the hero bench's fly controls are already the camera bench's `camera-pad.ts`), A
  records a clip on the armed camera at the story's time. As the camera bench: a recording over a clip is a new take,
  nothing destroyed.
- **COMPUTED — a new shape, the MOVE:** Carl places a START and an END (fly there, mark it); the Builder computes the move
  between them and puts it on the bench as a Builder's take (D-104's method, as the Vader move). Stored as its NUMBERS.

### 3. More than one camera, cut between (Carl: *"more than one camera may be used using jump cuts"*)

The camera bench's tracks already do this: a track per camera; at any time the TOP track with a clip plays; a clip on
Cam 2 over Cam 1 is a CUT at its start and a cut back at its end (`sourceAt`, one rule). The hero bench uses the same rule,
so a jump cut is placing a clip on another track. Nothing new.

### 4. THE MOVE — the shape's mathematics (the new part)

From START (position P0, look-at point L0, focal length f0) to END (P1, L1, f1), over `seconds`, placed at story time T0:

- **The clock:** s = E(t / seconds), E an ease with an eased start and an eased landing (the glide's `rampS` / `landS`,
  so a move can begin and end at rest). One s drives the path, the aim and the lens together: *"all at the same time"*.
- **The path, one of:**
  - **STRAIGHT:** P(s) = P0 + s (P1 − P0).
  - **ARC:** a circular arc from P0 to P1 bulging by `bend` (the sagitta, cm) toward a chosen side (up, left, right, or a
    direction). Chord c = |P1 − P0|; radius R = c²/(8·bend) + bend/2; the angle runs linearly in s, so the speed along
    the arc is even.
  - **PARABOLA:** P(s) = P0 + s (P1 − P0) + 4·`apex`·s(1 − s)·n, peaking at `apex` (cm) along n at the middle.
    Reparametrised by arc length (a table, built once), so its speed along the curve is even too, not faster at the
    ends.
- **The aim:** the camera looks at L(s) = L0 + s (L1 − L0), level (no roll). So a move can hold one subject (L0 = L1)
  or hand the eye from one to another.
- **The zoom:** the focal length f(s) = f0 + s (f1 − f0) in mm (the bench's 36 mm filmback, `focalMm`), the view's angle
  derived from it. Changed in mm, not in degrees, so a zoom feels even to the eye.
- Every number editable after the fact (Carl: *"It always helps if we can adjust the numbers later"*), checked under Node
  as the chain's other shapes are.

## Alternatives rejected

- **A. The story on the camera bench** (`hero-scene.ts` brought as an idea): every recorder tool at once, but the scene is
  plain three on WebGPU in its own units, the camera bench is React Three Fiber in centimetres, and the story's clock
  would have to reach into the camera bench's store. More is moved, and the story leaves the bench it was built on.
- **C. The Builder's take only, no recorder:** smallest, but Carl's first way of making a move (*"fly about the scene,
  recording as i go"*) would have no instrument.
- **The camera bench's whole store copied** into the hero bench: two recorders drifting apart. Rejected for the shared
  pieces below.

## What it couples to

- **`components/showcase/bench-chain.ts`** — the camera bench's chain, PURE (no imports, checked under Node,
  `live-work/scripts/bench-chain-check-26-october.mjs`). The hero bench READS it as is (clips, tracks, `sourceAt`,
  `poseAtT`, `placeShape`); its positions are in the chain's own units (`d`, `up`, `zc`), so the hero bench gives it its
  own units and converts at the edge. ⚠ **The MOVE shape is a NEW KIND in this shared, approved file** (`Shape` gains
  `move`; `poseInShape` a case; `parseChain` accepts it): the camera bench gains it too. A chain version step is needed
  only if an older reader must refuse it — to be settled in the plan.
- **`components/showcase/bench-timeline.tsx`** and **`bench-transport.tsx`** — the camera bench's timeline and transport
  (React components). Reused if their props allow, else a smaller hero-bench timeline: decided in the plan by reading them.
- **The camera bench's store** (`BenchStore`, inside `camera-bench.tsx`): NOT reused whole — it carries the camera bench's
  world, its R3F camera, its third-person eye. The hero bench gets a smaller store of its own: record, play, seek, select,
  the armed track. ⚠ This is a SECOND RECORDER STORE (§5a: "why is there a second X?"): its answer is that the story's
  clock owns the hero's playhead and the camera bench's clock owns its own. What is shared is the chain (the data and its
  rules), so a clip means the same on both benches.
- **`components/hero/hero-scene.ts`** — gains a SEEK (replay to T) and gives its clock to the bench; `update(delta)` is
  unchanged in meaning.
- **`components/hero/hero-bench.tsx`** — the camera: today OrbitControls plus the fly rig; while a take plays, the chain
  owns the camera and the orbit is off (as the camera bench's playback takes the camera).
- **The site, later:** the home page's hero will PLAY the chosen direction. What ships then is the chain's data and its
  pure evaluator; the recorder, the timeline and the pad never ship (the bench's tools stay on the bench, 11 November).

## What depends on the current structures (5b)

- **The hero bench's camera is remembered in the browser and beats `HOME` on load** — kept; playback must not write the
  remembered pose (a played take is not where Carl left the camera).
- **The story replays from the lean on "Arrival again"** — becomes "to the start", the same replay.
- **The rain releases its drops from the story's phase-1 end** (`hero-rain.ts`) — unchanged; a seek into the rain starts
  it as the story would.
- **Phase 1's films are frame-stepped from Home** (`live-work/scripts/hero-*-13-november.mjs`) — unchanged; a take is
  played only when one is placed.
- **The camera bench is untouched** except the shared chain gaining the MOVE (its Node check extended, its own playback
  unchanged for every existing kind).
- ⚠ Not enumerated yet: what in the hero scene reads the camera (the logo's reflection capture, the text's glow) — to be
  read before the plan.

## Cost (D-108)

Bench only, nothing on the site: the recorder's store and timeline are bench code. The SEEK's replay cost is the one
number to measure first. On the site later: the chain's data (a few KB) and its evaluator (pure arithmetic per frame).

## Proposed files (NOT authorised; for the plan)

`components/hero/hero-bench.tsx`, `components/hero/hero-scene.ts` (open now), `components/showcase/bench-chain.ts` (the
MOVE), a new `components/hero/hero-recorder.ts` (the hero bench's store), possibly `bench-timeline.tsx` /
`bench-transport.tsx` (reuse), and the chain's Node check.

*Written 14 November 2026 by the Builder for Carl and the Architect.*
