# Session Handoff — 20 November 2026 (Friday), session 2. "SCHRÖDINGER'S CLOTH": PASS 1 AND PASS 2 BUILT; NEXT: SESSION 3, FINE-TUNE PASS 2, THEN PASSES 3 AND 4

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"THE LOGO LEADS, THE CLOTH RESPONDS; PASS 1 DRIES THE TOP"* to the end:
every beat with Carl's words. Session ended on Carl's word: *"The hard part is done. Stop the capture, wtite a handoff and
commit and push."*

## ⛔ NEXT SESSION (session 3) — CARL's PLAN (D-101, the last entry)

1. **FINE-TUNE PASS 2.** ⛔ *"Pass 2 cloth finish is far too close"* — after the reverse move, the cloth's hem ends hanging
   just above and beside the logo home (his side still). The levers, Carl's: *"altering the speed of the backwards and
   forward logo movement and then altering the cloth distance and speed"*.
   ⛔ **And the RETURN (the reverse move) looks MESSY** (Carl, after the push: *"i like the energetic cloth on the way back
   but the movement, timing or cloth could be better. it looks....... messy"*; *"it only needs minor timing tweaks"*; the
   swivel backwards *"looks good"*). Seen: the UN-SWIVEL happens while the cloth is on the C and flings it. Candidates (D-101,
   none chosen): hold the side pose until the cloth slides off; a later/slower un-swivel; unwind the turn to 360° instead
   of back; the cloth's retreat timed to clear first. Films: `2026-11-20_pass2-gymnast-half-speed_take1eturn-*`.
2. **PASS 3 = A MIRROR IMAGE OF PASS 2, FOR THE B** (the swivel the other way: the B's face, then its back).
3. **PASS 4 = THE BOTTOM HALF OF THE 2** — *"a much easier movement"*.
4. *"The hard part is done."*

## THE CHOREOGRAPHY AS BUILT (`components/hero/hero-scene.ts`, `hero-cloth.ts`; the bench `/proto/hero`)

**Phase 3 is named "Schrödinger's cloth"** (Carl). One **Jump** plays pass 1; a second **Jump** (after it) plays pass 2.

- **Pass 1** (`pass1`): FORWARD — the logo jumps **95 cm** high, **up and back** (apex 34 cm behind its spot, lands 68 cm
  back), into the cloth as its HAND (the pins) carries it forward 120 cm (−60 → +60 from the spot), the hand's move
  spanning the flight. BACKWARD — after the landing's wobble the cloth retreats by itself to **−75** (the BEAT), and
  **2 s** later the logo jumps home into it. Measured: the top **~47% front / ~48% back**. (The cloth ends at −75, not
  its start −60: Carl ruled that FINE, and ⛔ *the next move starts from the cloth's ending position*.)
- **Pass 2** (`pass2`): the **JUMP SWIVEL** — roll 90° right + turn 180° in one move, complete at the apex, the C's face
  meeting the cloth in the air; lands on the **b's end**, its back to the front camera, **90 cm back** (landing on the
  spot hooked the cloth over the c). The cloth +120 forward from −75. Then the **GYMNAST**: no wobble, a **gather**
  (a 2° tip back and up), and a rebound straight into the **REVERSE MOVE** (held on its side to the apex — the C's back
  meets the cloth — then upright by the landing, home), the cloth retreating to **−30**; the normal wobble only at the
  end. All of pass 2 at **HALF SPEED** (`pass2.speed` 0.5: *"gravity is secondary to how it looks"*). Measured: the
  **C's front ~100%**, the **C's back ~75%**. (The BEAT version — `gymnast` off, cloth back −75, 2 s — gave the C's back
  ~100%: the trade-off was put to Carl, not ruled.)
- **The collision** (structural note `live-work/structural-note-cloth-collision-20-november.md`): the logo's FLAT distance
  field (from its ink, `hero-maps.worker.ts` `inkSdfData`) + its depth, read by the cloth's own step, the logo's pose
  interpolated per step; margin **3.5 cm** (no locked hem folds), friction 0.3. **0 points through the metal** in every
  measured pass. One way: the logo pushes the cloth.
- **The cloth OPAQUE** (*"an unexpected bonus"*): the logo's outline pressed into the blue cloth; the drying hidden under
  it; ⛔ the visitor, seeing the blue outline, expects a blue logo — the gold is the surprise; ⛔ the reveal needs a FRONT
  camera (straight, angled or oblique); candidate: Carl's LOW FRONT, looking up (position 516.5, −361.4, 1729.4; target
  536.6, 238.5, −496.5; fov 45).
- **Reset** (both buttons): the logo home and the cloth RESTORED to its exact state at pass 1's first take-off (a GPU
  snapshot). ⛔ For accurate measurement **press Jump straight after Reset** — the cloth sways in the wind (~6 cm at the
  hem over 3 s), so a later press meets it elsewhere, as on a fresh load. Carl: *"One pass is built upon the other."*

**Bench folders:** Pass 1 (Jump, jump height, jump back, cloth back to, back jump after cloth, Reset pass 1); Pass 2
(Jump, apex, land back, cloth forward, roll, turn, reverse: cloth back to, reverse: jump after cloth, gymnast, gather,
gather tip, pass 2 speed, Reset); Stage (pass 2) (a still pose tool, off); Cloth (+ collide, margin, friction).

## OPEN — CARL's

1. **Pass 2's tuning** (above), then passes 3 and 4.
2. **The gymnast ~75% vs the beat ~100%** on the C's back — not ruled.
3. **The drying itself** (gold where the cloth touched): not built. The collision's contact per cell is the natural map
   (offered, not chosen). The floor's blue shrinking per wipe: not built. *"One step at a time"* — the floor and the rest
   wait for the choreography.
4. **Carried:** the rain and steam OFF on the bench (turn back on when Carl says); the cloth's colour C (#2E3FC8) judged
   again at the gold; how/when the cloth APPEARS; the camera (phase 5) — every move designed in 3D; the plinth
   brainstorm; Gandalf's fireworks; the floor's notes ([R5][T1][R6][R7], `heatPlane`); the untracked
   `live-work/structural-note-code-drops-20-november.md` (keep or delete).

## ⛔ STANDING — CARL's

- **Target 1 December 2026.** Name the files and ask before the first code edit, every session (all hero files open in
  `chunk-scope.json`, *"keep open until i ask you to lock and test"*).
- **A question is answered, not built** (*"can you fix …"* was answered with a test, then Carl chose).
- **Contact must be REAL from every angle; NO contact is the worst outcome.** Check every action from the SIDE.
- **Gravity serves the look** — slow enough that the gold's nuances are seen.

## LESSONS (today)

- ⛔ **A WAIT ABSORBED BY SET-UP:** a "press at different times" test waited right after replaying the story, so every
  wait passed inside phase 1 and every press took off at the same moment — it "proved" the press time didn't matter, and
  that went into D-101 and to Carl as a correction of my own true caveat. Corrected (D-101). Check that a varied input
  actually varied (log the take-off time) before concluding it has no effect.
- **A CPU write-back of a GPU storage buffer did not take** (the cloth carried on); not explained, so not built on — the
  snapshot is GPU-to-GPU (two compute passes).
- **The shortest rotation is not the described move:** slerping to the swivel's end pose flipped the logo flat (a pancake);
  the turn and roll interpolated together read as the swivel Carl described.
- **"Back to the beginning" meant the beginning of the PASS**, not of the story — ask which beginning when it is ambiguous.
- **A timing prediction was wrong** (the 100 ms rebound): measure, don't predict; say so when it is wrong.
- Lint covers `live-work/scripts/`: run it after the LAST edit (two unused variables caught before the push).

## STATE

- **COMMITTED AND PUSHED** with this handoff (after `e37a593`, the session's first push). Clean build passed; tsc clean;
  lint at the baseline (1 error, 0 warnings).
- **The screen capture STOPPED:** `03 The hero\01 Discussion\2026-11-20_s2_discussion_screen.remux.mkv` (6:11:08; raw kept).
- **The dev server is UP** (port 3000).
- Films today: `03 The hero\2026-11-20_pass1-*`, `…_pass2-*` (forward swivel takes 1–3, reverse, gymnast, gymnast
  half-speed with LOW FRONT), `…_pass1-collision_take1-film`, `…_pass1-backward-contact_front(_opaque)`.

---

*Written 20 November 2026, session 2.*
