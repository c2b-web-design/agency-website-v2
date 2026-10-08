# Session Handoff — 8 October 2026. THE DESK MARK IS IN THE ROOM (`?mark=1`), LIT, SHADOWED, AND FALLING. NEXT: THE SOMERSAULT SEARCH.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**
The full record of today is **D-088's 8 October entries** (the end of `decisions.md`), R-036 and R-037.

---

## ⛔ WHERE THINGS STAND

**Pushed:** `4ca518e` (the crossing on the bench, R-036), `26e3c3d` (the mark in the room, lit and shadowed, R-037).
**NOT committed — everything after `26e3c3d`** (Carl has not asked):
- the studio on the mark at 0.7 (*"a lot better, more natural"*);
- the FALL: stage 1 the tip (gravity suspended), stage 2 over the desk's end to the rim (*"Outstanding"*), stage 3 onto
  its back across the rim, the strike's energy (angular momentum about the strike point), real-time playback;
- scripts: `desk-mark-fall-to-bin-8-october.py`, `desk-mark-roll-3d-8-october.py`, `desk-mark-somersault-3d-8-october.py`,
  `desk-mark-somersault-to-room-8-october.py`, `desk-mark-tip-8-october.mjs`, `desk-mark-fall-8-october.mjs`, and the
  extended `desk-right-end-measure-8-october.py` (strip, bin).
`tsc` clean, lint at baseline (1 error) as of the last edit. The dev server is on :3000.

## ⛔⛔ IN FLIGHT — THE SOMERSAULT (Carl's current target)

**Carl:** the mark must END **facing us and the right way up**; the bin is optional; the angle on the desk and the FRONT
EDGE are levers; *"almost like a gymnast doing a somersault with a twist"*; *"try it and show me"*; **50% speed**.
- Back-to-us-upside-down is HALF a somersault; finishing it (the same way) gives facing + upright. Needs ~690°/s from
  face-down to finish by the floor; it leaves the edge at ~500°/s. It may finish below the frame (it goes on to §3).
- **The search** (`desk-mark-somersault-3d-8-october.py <verts> search`, 63 starts: yaw ψ −45…+45, face 20/50/80 mm from
  the end, nudge 1.5/3/5 rad/s, u −312.5) was RUNNING in the background, output to
  `scratchpad/somersault-search.txt`. ⚠ **The scratchpad is session-specific — if it is gone, re-export the vertices and
  re-run** (export: copy `logo-mark-outline.ts` + `logo-mark-geometry.ts` to a repo temp folder, add `.ts` to the import,
  export every 3rd vertex at scale 1 as `{depth, v}` JSON — the 8 October run did this as `_tmp-fall`).
- Early results: ψ −45, 20 mm, nudge 5 → facing +0.67, upright +0.28. The current pose (ψ 0, 65 mm, nudge 1.5) →
  facing +0.78, upright −0.24.
- **Then:** `run ψ faceIn uC nudge` on the best → `desk-mark-somersault-to-room-8-october.py <run.json> "<note>"` writes
  `DESK_MARK_SOMERSAULT` into `about-room.ts` → apply `live-work/scripts/desk-mark-motion3d-edit-8-october.py <repo root>` (the room plays a full 3D pose:
  position + quaternion; `?markplay=fall` keeps the approved 2D fall) → `tsc`/lint → shoot → show Carl at 50%.
  (Saved into the repo so it survives the scratchpad.) What it does: `MarkPose` = {x, y, z, q}; `fallPose` returns a
  quaternion about X; new `somersaultPose` (lerp + slerp of the rows); `MarkMotion` gets `play`; `comM` is 3D (x from
  `DESK_MARK_SOMERSAULT.comLocal`); body/follow positioned at `comM`, mesh at `-comM`; the contact shadow sits under the
  START pose and fades by angle from it.
- ⚠ **Contact-model lesson (in the script):** per-point stiffness 4e6 EXPLODED on a flat-face landing; now per-point
  2e5 with damping shared across the points in contact.

## ⚠ OPEN — WITH OWNERS

- **Carl:** the somersault's look; the final playback speed (*"somewhere between"* ¼ and real time); the bin's size (a
  CHOICE — the plate cannot fix it; 280 mm is the only size the straight drop reaches, and it then wedges in a 34 mm
  gap); the raking key (white with an orange tint; the Builder: let the tint cross with the metal) and its long shadow;
  the face-down contact shadow; the gold's paleness; when to remove `?mark=1` and put the mark on plain `/about`.
- **Builder:** the room's reflection map contributes NOTHING measurable to the mark although applied — cause not
  found (may bear on RIM-DARK).
- Carried from 7 October: the stem's corners, A13, the dials, the flat back's finish (now SEEN in the fall), the base
  double line; two review entries share R-028.

## ⚠ STANDING / CORRECTIONS THIS SESSION

- **Don't choose presentation values silently.** The quarter-speed playback was the Builder's choice, never asked for —
  Carl: *"i said nothing originally about the speed it should fall."* State such values as choices.
- **Builder corrections on the record:** "nearly edge-on" (it was 41° off face-on); the room-light A/B changed light AND
  shadow at once (Carl: *"i nned to see them both in the same lighting"*); "lands a little more firmly" (it turned over too
  SLOWLY — the falling speed had been dropped); the dark face "probably the shell" (unproven, now doubtful).
- **Carl waived plan mode / the Architect** for the bench crossing and has led every room step directly; §5a still stops
  a STRUCTURAL decision. Route 1 (one canvas into §3) is still undesigned.
- Headed Playwright windows open on Carl's screen; his wheel can reach them (a 300 px "self-scroll" was three trusted
  wheel events).
- Lint baseline `1 problem (1 error, 0 warnings)`. Carl's machine: DPR 1.36, ~1412 × 700.

---

*Written 8 October 2026, mid-session, ahead of a context compaction (Carl: 35% to compaction, 74% of the session limit).
Replaces the 7 October handoff.*
