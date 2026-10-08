# Session Handoff — 8 October 2026 (end). THE DESK MARK IS IN THE ROOM AND FALLS. NEXT: §3 — THE WHOLE ANIMATION, END TO END.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**
**The full record of 8 October is D-088's 8 October entries** at the END of `decisions.md` (long — read the last ~25
bullets), with R-036 and R-037 in `reviews/review-log.md`.

---

## ⛔ WHERE THINGS STAND

**Committed and pushed:** `4ca518e` (the crossing on the bench, R-036), `26e3c3d` (the mark in the room, R-037),
`400d9fd` (the fall, mid-session). **Committed, NOT pushed (Carl: "commit"):** this session's close — the somersault
search, the corner placement, 10% smaller, the records. Push when Carl says.
Everything is behind **`/about?mark=1`** — plain `/about` is unchanged and static. Lint baseline `1 problem (1 error,
0 warnings)`; `tsc` clean; the production build compiled at `400d9fd` and again before this commit. No server running.

**The mark in the room today (`?mark=1`), all switches:**
- `?markplay=corner` — ⛔ **THE CURRENT WORK.** Standing still and upright on the desk's front-right corner (ψ −45°,
  near square to the camera), its face's front-bottom edge 102 mm in from both edges, **205.1 mm tall** (10% smaller —
  Carl). `&cornerleft=` mm slides it left (+), `&marktip=0..1` tips it (1 = face down), `&cornerloop=1` loops the
  tip, `&cornerpsi=` `&cornerd=` adjust.
- default (no `markplay`) — the 3D SOMERSAULT run (facing the front edge, 40 mm from it, 220 from the end, nudge 4;
  at the frame's bottom facing +0.82, upright +0.83), 50% speed. Simulated at 227.9 mm — superseded, now off-size.
- `?markplay=fall` — the 2D fall (tip, teeter, over the end, onto the bin's rim; *"Outstanding"*). Also 227.9.
- Light/shadow faders: `?markenv=` (studio, 0.7), `?marktop=` `?markstrip=` `?markao=`, `?markshadow=0`,
  `?marklight=room`. Speeds: `?markfallspeed=`, `?markfall=0..1`, `?marktipms=`.

## ⛔⛔ NEXT SESSION — THE AGREED TASK

**Carl: *"to see the full animation we are going to have to venture into Sect 3 as well. We need to see it from
beginning to end."***
1. ⛔ **§3 is STRUCTURAL — STOP FIRST.** `live-work/structural-note-mark-into-section3-8-october.md` lays out: route 1
   on `/about` (plan → Architect → Carl), a **`/proto` bench first** (the Builder's recommendation: the room's frame
   over a §3 placeholder in ONE canvas, scroll- or scrub-driven), or the rejected overlay canvas. **Ask Carl which,
   and whether the Architect reviews** (3 October: *"Full process — not waived"*; Carl waived it for the bench
   crossing only). "Halfway down the viewport" needs the SCROLL link or a bench showing both sections.
2. **The corner placement, Carl's steps** (he places by eye): step 1 DONE (standing on the corner; falls face down
   across it — 135 / 139 mm over the edges, centre of mass 39 mm inside the front edge). **Step 2:** slide LEFT until,
   face down, it goes over the front edge (> ~40 mm at 227.9; re-measure at 205.1 —
   `desk-mark-corner-place-8-october.py`, which still has H = 227.9: change it). **Step 3:** stand it back up there =
   the START. **Step 4:** size (done: 10% smaller — confirm).
3. Then **SIMULATE the fall from that start** (`desk-mark-somersault-3d-8-october.py run ψ d_front d_end nudge` —
   update its H to 205.1 and its placement to the corner start), target: facing us AND upright by §3 (it continues
   past the frame into §3 — "a simple drop into the player"). Write it to the room with
   `desk-mark-somersault-to-room-8-october.py`.

## ⚠ PHYSICS FINDINGS — DO NOT RE-DERIVE (all in D-088, 8 October)

- **A forward tip moves NO weight sideways** (it turns about the letters' own axis): an overhang over the front edge
  is no less balanced face down than standing. The left-weight flip needs the TIP to carry the weight left — the
  turn toward the front edge (Carl's corner).
- From a teeter it leaves an edge with almost no outward speed (the centre of mass swings DOWN AND BACK); outward speed
  needs a push (the scroll) or a diagonal tip.
- Back-to-us-upside-down is HALF a somersault; finishing it gives facing + upright (needs ~690°/s by the floor; ~500
  from the end-edge teeter).
- An off-centre strike TWISTS it (the gymnast's somersault with a twist — Carl's image).
- The bin is OUT of the physics (Carl); its size was never measurable (the plate's ellipse is cut; foot out of shot).
- **Sim contact model:** per-point stiffness 2e5 with damping SHARED across the points in contact (4e6 per point
  EXPLODED on a flat landing). **Yaw convention:** ψ 0 faces the desk's END, −90 its FRONT EDGE; `rot_y(ψ)` turns the
  face to (sin ψ, 0, cos ψ) in (u, up, off) — the first search mislabelled it and turned the mark the wrong way.
- **Vertex export for the sims:** copy `logo-mark-outline.ts` + `logo-mark-geometry.ts` into a temp folder INSIDE the
  repo, add `.ts` to the import, `node` a script that writes every 3rd vertex at scale 1 as `{depth, v}` JSON; delete
  the folder before `tsc`. (The scratchpad copy will be gone.)

## ⚠ OPEN — WITH OWNERS

- **Carl:** §3's structure and the Architect; the corner steps 2–4; the final playback speed (*"somewhere between"*
  ¼ and real time); the raking key (white, orange-tinted; the Builder: let the tint cross with the metal) and its
  shadow; the face-down contact shadow; the gold's paleness; when `?mark=1` comes off and the mark goes on plain
  `/about`; carried from 7 October — the stem's corners, A13, the dials, the flat back's finish (now SEEN in the fall),
  the base double line; R-028 numbering.
- **Builder:** the room's reflection map gives the mark nothing although applied — cause not found (may bear on
  RIM-DARK).

## ⚠ STANDING / CORRECTIONS THIS SESSION

- **State presentation choices; one variable per A/B** (memory saved): the quarter speed was the Builder's, never
  asked for; an A/B changed light and shadow at once.
- **Carl's sketches are the CAMERA's 2D view** (MS Paint): the yellow box was the mark STANDING, its bottom edge the
  base. The Builder read it as lying flat; ⚠ a rejected Bash edit HAD already reached the file — check the file after
  any rejection.
- **Builder errors on the record:** "nearly edge-on" (41°); "lands more firmly" (it turned over too slowly); the dark
  face "probably the shell" (unproven); the yaw sign. Each corrected in D-088.
- Carl leads each room step directly; §5a still stops a structural decision (§3 now).
- Headed Playwright windows open on Carl's screen. `git add` of `live-work/scripts/` needs `-f` (the folder is
  ignored) — a plain add aborts the whole chain.

---

*Written 8 October 2026, end of session. Replaces the mid-session handoff of the same day.*
