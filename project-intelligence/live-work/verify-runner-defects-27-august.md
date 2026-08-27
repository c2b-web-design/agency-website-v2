# The verify runner's verdict detection — two defects Carl has parked for next session

**27 August 2026.** ⛔ **CARL'S RULING: noted, NOT fixed now. First item of the next session.**

**Carried into the handoff at the end of this session.**

---

## What was already fixed, and what was not

⚠ **`verify/one-context.mjs` IS FIXED — commit `37043aa`.** Two defects in that one file:
its scope caveat opened with a line-leading ⛔ (read as a failure), and every ✅ it printed
was mid-line (so it had **never** produced a detectable pass). Both corrected.

⛔ **THE UNDERLYING RUNNER BEHAVIOUR IS UNCHANGED. That is what next session fixes.**

---

## Defect 1 — `run.mjs` reads a documented limitation as a failure

**`verify/run.mjs`** — `FAIL_MARK` matches **any line starting with ⛔**, and `classify()`
applies it to the printed text **even when the script exits 0**.

⚠⚠ **THE IRONY IS THE POINT, AND IT IS WHY THIS NEEDS A REAL FIX RATHER THAN A WORKAROUND
PER HARNESS.** `context-rules.md` requires **every** harness to declare what it does NOT
watch, **in its output** — a rule written *because* `one-context.mjs` printed a green
verdict about the card host while `NextStepMeshButton` created eight WebGL contexts nobody
was watching. ⛔ **Complying with that rule in the clearest way available is what trips the
failure detector.**

**So the trap is not local to one file.** Any harness that leads a scope caveat with ⛔ —
i.e. any harness following the rule — hits it.

## Defect 2 — `PASS_MARK` only matches at line start

`PASS_MARK` requires ✅ / PASS / CLEAN / GREEN at the **start** of a line (after
whitespace). ⚠ **A harness printing `run 1   ✅ ONE CONTEXT` produces no detectable pass
at all.** `one-context.mjs` had this for its whole life; the only thing the runner ever
matched was the caveat's ⛔, which is why a clean 3/3 run reported as FAILURE.

⚠ **Worth checking how many other harnesses in `verify/` print ✅ mid-line.** Not surveyed
— that is part of next session's work.

## Defect 3 — `--falsify` reports `NaN`

**`verify/one-context.mjs --falsify`** prints `VERDICT — NaN run(s)` and `NaN/NaN runs`.

⛔ **PRE-EXISTING — verified identical with the 27 August change stashed.** Not caused by
that commit, and deliberately not fixed under the "unrelated pre-existing errors" rule.

⚠⚠ **THIS ONE BLOCKS A ROUTE, NOT JUST A NUMBER.** Falsify mode is how a harness
demonstrates it **can** go red, and a recorded red run is exactly what `verify/proven.json`
admission requires. **While falsify is broken, `one-context.mjs` has no path to becoming
admissible evidence.**

---

## The state it is in right now

`npm run verify -- one-context.mjs` reports the pass and the runner **SUPPRESSES** it —
**that is the gate working correctly.** `one-context.mjs` is not in `verify/proven.json`,
so its green is not admissible. ⚠ **Exit 3 means UNPROVEN, not failed.**

---

## ⛔ THE FIX NEEDS A PROTECTED-PATH UNLOCK

**`verify/run.mjs` is in `.claude/protected-files.json`.** Carl must name that exact path
under `"unlocked"` in `live-work/chunk-scope.json` — never a folder, never a glob — and the
unlock is removed and re-verified by observing a real denial when the work closes.

⚠ **`verify/proven.json` is ALSO protected**, and admitting any harness touches it.

**Carl has said this may go to the Architect.** The diagnosis above is what to hand over.
