# The Architect's review of probe 3 (28 November 2026)

Reviews `architect-probe3-reorder-28-november.md`. Routed by Carl (pasted, 28 November 2026).

## Verdict
Agreed: reorder alone fails (the warm-up ended after the due in 3 of 5 rounds, the logo late in two). The split gate
earns its place. Plan it. It was on time in all ten cold rounds, which holds whatever the warm-up does, because its gate
does not wait for the warm-up.

## 1. ⚠ The 1.6 s warm-up difference should not exist
reorder and splitov make the same first call and differ only in the gate, which matters only once the subtext is in
(`opening.fadeT` is set at `t >= subIn`). The Builder's guess contradicts its own data: in all ten splitov rounds the
warm-up ended before the logo was drawn. That leaves two explanations:
- **The modes differ in more than the gate:** diff the probe code.
- **The ORDER within each round matters:** was it fixed? The AMD driver keeps its own shader cache across Chrome profiles
  (unverified), so the second mode could reuse the first one's compiles. Rotate the order in any further run.

If splitov's real warm-up is ~10 s, three things the plan relies on change:
- the floor-web ordering would fail in ~3 rounds of 5;
- the swap margin shrinks toward +1.30 s;
- the touchdown margin shrinks toward +3.95 s.

## 2. The floor web needs its own guarantee
Not a measured ordering. Either:
- its own targeted `compileAsync(floorHeat.mesh, camera, scene)` among the split gate's first calls, gated on; or
- the logo's fade gated on the fade call AND the floor web's call together.

Either way the logo and its web come in together, guaranteed by the gate, not by timing.

## 3. LOGO-FADE-FRAME: probably avoided by timing, not fixed
Hypothesis (unverified): `warmShadow` starts the moment the warm-up ends. When the logo is late, it is drawn on that
frame, and the shadow pass's gathers and compiles land on the fade's first frame. Check from the logs:
- did reorder's 49.9 ms frames come only in its late rounds?
- does `hero:WarmShadowDone` fall after the fade's first frame?

Record the cause in `open-defects.md` either way. The plan says whether it relies on timing or guards against it (e.g.
`warmShadow`'s start never on the fade's start frame).

## 4. The `prefiltered` dependency (5b)
The plan must state that the fade's targeted call is made inside `warmScene`, after `prefiltered`, and cannot run earlier.

## 5. The plan's list, amended
- **Swap guard:** hold the fade material, and say what the story looks like while held (sorting, alpha-to-coverage edges,
  shadows).
- **Touchdown:** a guard in code.
- **The floor web:** its own guarantee (§2).
- **LOGO-FADE-FRAME:** its cause, and whether the plan relies on timing or guards (§3).
- **`prefiltered`:** the dependency stated (§4).
- **The full-story check:** not needed.

## Order
1. Builder, from the logs: the modes' code diff and the round order (§1); the 49.9 ms frames against the late rounds and
   `WarmShadowDone` (§3).
2. If §1 is unexplained: one ROTATED-order run of reorder against splitov (a temporary probe: Carl's word first).
3. The split-gate plan, covering §5.
4. Plan review; Carl rules on Option D.
5. Carl judges in Incognito, headed, with the recorder off.

---

## The Builder's answers to step 1 (from the probe-3 logs and scripts, no code)

- **The code diff:** the two modes differed ONLY in the gate (`openingReady`). The fade's own first call was made in
  both; the warm-up's gathers were identical; so were the marks.
- **The round order was FIXED:** reorder first, splitov second, in every round. So the order effect is not ruled out, and
  **step 2, a rotated-order run, is needed** (Carl's word first).
- **The 49.9 ms frame against the late rounds** (reorder, cold; LATE / fade frame (next-3 max) / logo drawn after the
  warm-up's end):
  - R1: 0.65 / **49.9 (50.0)** / **0.09 s**
  - R2: 0.21 / 16.7 (16.9) / 1.30 s
  - R3: 0.21 / 16.6 (16.9) / 0.73 s
  - R4: 0.21 / 16.6 (16.7) / 0.12 s
  - R5: 0.31 / 16.9 (**33.3**) / 0.20 s

  The long frames came in the late rounds, where the logo was drawn within ~0.2 s of the warm-up's end. Consistent with
  the hypothesis. But R4 was drawn 0.12 s after and had none, so it is not conclusive.
- **`hero:WarmShadowDone` is NOT recorded by the tool,** so the second check cannot be made from these logs. The tool
  must record it next time.
