# Session Handoff — 28 November 2026 (Saturday). THE OPENING's FREEZES FIXED; THE RACE FIXED; THE LOGO's FIRST-VISIT LAG MEASURED — A PROBE RUNNING

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff (the 26 November one is
gone). Delete it at the end of the session that reads it, once its replacement is written. Written mid-session, while the
second probe's rounds run (Carl: *"proceed. context is 47%"*).

**The record:** D-101 in `decisions.md`, from *"THE FLOWING OPENING: CARL's VERDICT, AND THE LOGO AFTER THE TEXT"* (28 Nov)
to the end. The Architect's thread is in `live-work/architect-*-28-november.md`, in this order: note → review →
measurement (with addendum) → review → probe → review → answers → review.

## ✔ The probe code is REMOVED

Both files are byte-identical to `e561aed` (SHA-1 checked, 28 November). The tool's new measures are kept (uncommitted:
`live-work/scripts/hero-logo-build-28-november.mjs`). `.next` may still hold the probe's production build, so rebuild
before serving production.

## ⛔ NEXT (the Architect's probe-3 review, `live-work/architect-review-probe3-28-november.md`)

The split gate is the route: on time in all 10 headed cold rounds. Reorder only failed (late in 2 of 5). Before or in
the plan:

1. **A ROTATED-order run, reorder against splitov** (Carl's word first: a temporary probe build).
   - Probe 3 ran in a FIXED order, reorder first. splitov's warm-up was 1.6 s shorter, though the modes differed ONLY in
     the gate.
   - A driver shader cache reused by the second mode is not ruled out.
   - **Make the tool record `hero:WarmShadowDone`** (for LOGO-FADE-FRAME's cause).
2. **Write the split-gate plan** (structural, to plan review). It must cover:
   - **The swap guard:** hold the fade material, and say what the story looks like while it is held.
   - **A touchdown guard in code.**
   - **The floor web's OWN guarantee:** its own targeted `compileAsync` in the gate.
   - **LOGO-FADE-FRAME:** the cause, and whether the plan relies on timing or guards against it (the evidence so far is
     consistent with `warmShadow` starting on the fade's frame).
   - **The fade's call inside `warmScene`, after `prefiltered`.**
3. **Carl rules on Option D** (what the opening waits for).
4. **Carl judges by eye:** Incognito, headed, with no recording.

**Re-creating the probes:** the edit scripts were `scratchpad/probe2_edit.py` and `probe3_edit.py` (session-only).
Rebuild from the reports if they are lost:
- splitov = a NOT-awaited `compileAsync(logo, camera, scene)` with the fade material and depth shown, at the top of
  `warmScene`, with `openingReady` set from it.
- Marks `hero:OpeningDone` (in `stepFlow`) and `hero:Touchdown` (in `update`).
- The tool: `QUERY`, `HEADED=1`; the aggregator was `scratchpad/probe-aggregate.mjs`.

**The probes are all REMOVED:** both files are byte-identical to `e561aed`. `open-defects.md` was edited and locked.

## WHERE THINGS STAND

- **Committed and pushed:**
  - `ae134a4`: the async builds before the first frame; the prefilter dry run; the subtext letters fading over 0.5 s (the
    "stall after the W" was the reveal's own schedule); the subtext revealed already extruded (Carl chose to keep its
    second sweep: *"C Leave it as it is. Its the effect we want."*); the logo after the subtext (Carl's rule).
  - `e561aed`: **the race fixed.** The logo is added hidden, so the bench's first-frame build no longer takes it. It had
    hit 2 of 4 headed loads; 0 of 6 after the fix. Also the Architect thread and the tool.
- **Carl's eye test, his own Chrome, Incognito, PRODUCTION (:3100):** *"Om 3100 there is still a significaknt delay to
  the logos apperance"*. Base does not stand; the route is being measured.
- **The facts (production, AMD RDNA 2):**
  - The logo's build is the GPU compiling TWO ~76 KB shaders, the opaque logo and its fade clone, at ~4.7 s each cold,
    overlapping.
  - A real return visit is cached, and the logo is on time.
  - A first visit is ~0.4–2 s late.
  - **Never time from a filmed run:** the screencast alone took the cold logo from 8.8 s to 14.1 s.
  - Headed, the 3D's first frame is ~3.7–4.3 s, against ~1.9 s headless. Unexplained.
- **Probe 1 (headless, five interleaved rounds), cold:**
  - **split, one after the other:** on time, but the rest was pushed past the swap (−2.2 s) and touchdown.
  - **side by side:** the warm-up 0.8 s sooner, but ~0.1 s later at the logo, even on return visits. Unexplained.
- **Probe 2 (headed: base / splitov / side), DONE (see NEXT above). From the smoke run:**
  - The results go to `scratchpad/rounds2`. Aggregate with
    `node scratchpad/probe-aggregate.mjs scratchpad/rounds2 base,splitov,side`. The scratchpad is session-only; if it is
    lost, re-run.
  - Smoke run, cold: splitov's fade compiled SLOWER alongside the rest (6.7 s against ~4.7 s); the logo was 0.66 s late.
    The fade's first-draw frame and the swap frame were both normal (16.6 ms), with nothing built on either.
- **Next, by the Architect's order:** report probe 2 to Carl and the Architect, then choose side by side or the
  overlapping split. If neither puts a first visit on time, the Architect's reserve is **A′, a light fade material** (red
  metal only), which attacks the compile itself. It is structural: a plan for review first.

## OPEN, CARL's

- **His `chrome://gpu` line:** he answered "Yes to both" but has not given the GPU yet.
- **Where the lesson "never time from a filmed run" is recorded.** The Architect suggests the tools' headers and the
  measurement protocol. It is in memory already.
- **The Architect's existing fault (flag only):** `warmScene(...).finally(() => { warmed = true; })` opens the gate even
  when the warm-up fails.
- **Carried from 26 November:**
  - the storyboard's phase 3 and 4 times are stale (re-print them from the scene's clock);
  - the site's 2D/3D layout (a structural note for the Architect, not yet written);
  - film 3's edit;
  - target 1 December.

## CORRECTIONS AND LESSONS (this session)

- **Carl records nothing manually: all recordings are the Builder's.** No capture may run while Carl judges a load or
  while a load is being timed (saved to memory).
- **Measure on the instrument's real conditions:**
  - the films' screencast inflated every timing;
  - a non-persistent browser context keeps no shader cache;
  - the GPU-work script lists frames only once the scene's clock runs;
  - interleave modes in rounds, because this PC drifts within the hour.
- **A hold in a film is a freeze only if the reveal itself has no still gaps.** Check with
  `hero-flow-letter-gaps-28-november.mjs`.
- **The heredoc STILL collapses backslashes:** write edit scripts with the Write tool. `git stash` / `checkout` rewrite
  files as CRLF here: put them back to LF.
- **Incognito is the nearest thing to a first-time visitor** in Carl's Chrome. Ctrl+Shift+R in a normal window keeps the
  compiled shaders.

## STATE

- The dev server on :3000 is up (Carl: *"keep 3000 up"*).
- The probe build is served on :3100 while probe 2 runs; stop it after.
- No recording of the Builder's is running.
- Uncommitted:
  - D-101's entries since `e561aed`;
  - the tool's changes;
  - this handoff (force-add it).
