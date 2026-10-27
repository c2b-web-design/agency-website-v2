# Structural note — ROLL, and the BARREL shape (the Vader move)

**27 October 2026, session 2. Builder. PROPOSED — for Carl. Nothing built.** Record: D-104 tail, "THE VADER MOVE".

Carl: *"you are at default position. i need you to fly forward at 2x speed while doing 3 rotations then fly through the
arch. it essentially a corkscrew through the air- the Vader move"*; the rotations: *"Both, a barrel roll"*.

## 1. ROLL — new to the bench (§5a: a new property of every pose)

- `Pose` gains an OPTIONAL `roll` (degrees, 0 when absent). **Recorded samples stay seven numbers** — the pad has no roll,
  so a recording is level; no chain version change. Only a shape can roll.
- The store holds the camera's roll beside the rig (⚠ `Rig` lives in `camera-pad.ts`, LOCKED — so the store keeps it, not
  the rig): set from a clip's pose during play / scrub, the camera drawn with it (three's YXZ, roll the Z — about the line
  of sight); **any fly input levels it to 0** (the pad cannot steer a rolled camera); Home levels it.
- ⚠ A take RECORDED while the view is rolled saves no roll (level) — stated, not hidden.
- Joins compare roll too (wrapped).

## 2. The BARREL — a third shape kind

- `kind: "barrel"`: a straight FLIGHT LINE from the start to an end; round it a SPIRAL of `turns` laps whose radius swells
  from 0 to `radius` and back to 0 by `spiralEnd` (a fraction of the line), so it LEAVES and REJOINS the line — then
  straight on through the arch; the view ROLLS with the spiral (a barrel roll: one full roll per lap, level at the end).
- **"2× speed" = 2.8 m/s ALONG THE LINE** (the true speed is higher round the spiral) — so the clock is in closed form,
  no arc length; eased start (from rest at the default view) and landing.
- The aim: along the line (straight at the arch), rolling.
- The Builder's numbers (take 1): from the default view (centred, 4.29 m up, 22.71 m out) to 8 m BEHIND the arch's face;
  3 laps, radius 1.2 m, the spiral done 6 m in front of the face (it rejoins the centre line before the arch; through the
  clear opening at its centre — 2.3 m to each leg, 1.6 m under the N); 2.8 m/s, a 2 s start, a 2.5 s landing ≈ 13 s.

## Files

`bench-chain.ts` (the pose's roll, the barrel kind, joins), `camera-bench.tsx` (the store's roll, the camera), the
inspector (`bench-timeline.tsx`: a barrel's numbers). All open. `camera-pad.ts` untouched.
