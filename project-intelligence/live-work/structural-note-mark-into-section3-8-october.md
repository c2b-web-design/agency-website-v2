# Structural note — carrying the desk mark's animation into §3 (8 October 2026)

**Carl:** *"carry om the animation into Sect 3, about half way down the viewport"*.
**Status:** STOPPED for review under CLAUDE.md §5a / §5b — nothing built. D-088 (3 October) recorded route 1 (*one
canvas for the whole journey*) as chosen in kind, its STRUCTURE undesigned, *"structural under §5a and §5b… the plan
must… pass the Architect's plan-review gate"*; Carl then: *"Next phase will need discussion, a plan and consultation
with the Architect."* ⛔ That has not been waived for this step.

## Why it is structural

The mark lives in the ROOM'S canvas (`AboutCardCanvas`, inside `RoomStage`): sticky across §1–§2, sized to the plate's
box, gone when §2 ends (D-092). To be seen in §3 it must be drawn somewhere §3 is on screen. Every way of doing that is
on §5a's list: the canvas's EXTENT and LIFETIME change, or a SECOND canvas appears, or the mark's node MOVES between
parents.

## And a design question underneath it

"Halfway down the viewport" is a SCREEN position; the room's frame is a PAGE position that scrolls away. Once the mark
leaves the photograph, where it is on screen depends on where the reader has scrolled. The animation is time-driven
today (Carl: *"No link to the scroll yet"*). So "into §3" needs either **the scroll link**, or **a bench that shows
both sections at once**.

## Options

1. **Route 1 on `/about`, properly** — the canvas grows to span §2 and §3 (one context, the mark one object). Must
   enumerate what the current canvas provides by where it sits (§5b): its paint order and hit-testing over §3's
   content (14 August: moving a canvas made every card unclickable); the stage's sticky stop; the wipe's mask
   (`roomWipe`); the per-frame render cost while §3 is on screen (the neon frame owner renders every frame); the
   backplate's `object-contain` box (the camera maths assume the canvas IS the plate's box — a taller canvas breaks
   that, needs `setViewOffset` or a second camera region). Plan → Architect → Carl.
2. **Prove it on a bench first** (recommended) — a `/proto` page: the room's frame on top, a §3 placeholder below
   (the player's box), ONE canvas over both, a scroll (or a scrub) driving the mark from the desk to halfway down §3's
   viewport. Nothing on `/about` changes; the motion, the hand-off from the photograph to the page, and the
   scroll mapping are judged where a fault is attributable (the crossing's precedent, R-036). Needs a new file
   (scope: Carl's word) and still sets the pattern route 1 will follow — so the Architect sees its plan.
3. **A second, overlay canvas for the mark** — route 3 of 3 October, RAISED AND NOT CHOSEN (a second WebGL context;
   CLAUDE.md §5a worked cases 1 and 2). Not recommended.

## What it couples to

The somersault's end (it is nearly upright only AT the frame's bottom — the finish happens where this note's work
begins); the crossing (gold → blue must be COMPLETE by the point where the header path and the scroll path meet,
D-088 8 October); the light rig that rides the centre of mass (it must keep riding outside the room); §3's design
authority (Carl's up to the viewer's edge, the Builder's inside it).
