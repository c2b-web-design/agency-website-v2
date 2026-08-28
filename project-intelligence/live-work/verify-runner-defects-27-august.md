# The verify runner's verdict detection — RESOLVED 28 August 2026

> ## ⛔⛔ ALL THREE DEFECTS BELOW ARE FIXED. A FOURTH WAS FOUND AND FIXED TOO.
>
> **Commits: `a374aa2` (defect 3), `301b605` (defects 1 and 2), `843eee4` (defect 4).**
> **All pushed to `main`. Reasoning for defect 4: D-064 in `decisions.md`.**
>
> ⚠ **THIS DOCUMENT IS KEPT FOR ITS DIAGNOSIS, NOT ITS STATUS.** It was written on 27 August
> as a hand-over to the next session. Everything below describes the state *before* the fix.
>
> ### ⛔ ONE THING BELOW IS WRONG, AND IT MATTERED
>
> **Defect 3 is filed here as a `run.mjs` problem. It is not.** The cause is a single line in
> **`verify/one-context.mjs:97`** — `const RUNS = Number(process.argv[2] ?? 3)` — and that file
> is **not protected**. ⚠ **So defect 3 never needed an unlock at all**, and the two-chunk split
> this document predicted was cheaper than it says.
>
> ### ⚠ AND THE SYMPTOM WAS UNDERSTATED
>
> Below, defect 3 reads as a cosmetic `NaN` in a verdict line. ⛔ **It was a SILENT NO-OP.**
> `1 <= NaN` is false, so the run loop never executed — no browser, no page, nothing measured —
> and it then reached **both** verdicts wrongly: a **red** in falsify mode (the exact artefact a
> `proven.json` entry is filed from) and a **green** in normal mode, masked only by the script
> being unproven.
>
> ### ⚠ WHAT WAS DECIDED, NOT JUST FIXED
>
> - **Defect 1** now returns a fourth outcome, **`"disagree"`** (exit 4) — a self-contradicting
>   script is not a product failure, and a red for the wrong reason is a manufactured proof.
> - **A `##VERDICT:` sentinel** lets a harness declare its result instead of having it inferred.
>   ⚠ **Defined but not yet emitted by any harness** — adoption rides on admission.
> - ⛔ **Defect 2 was deliberately NOT fixed.** The 38 harnesses printing `✅` mid-line fail
>   *closed* (`NO VERDICT`, exit 3), and loosening `PASS_MARK` was rejected on recorded evidence.
> - ⛔ **Defect 4, found during this work: `proven.json`'s only entry described a script that
>   FILMS.** Demoted, not re-filed. **The proven list is now 0.**

---


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
