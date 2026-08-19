# Session Handoff — 19 August 2026 (late). Zero admissible harnesses, honestly.

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

# ⛔⛔ TWO CONTROLS BLOCK BY DEFAULT. BOTH ARE THE CONTROL WORKING.

> ## 1. EDITS — `SCOPE GUARD: '<path>' is PERMANENTLY PROTECTED`
>
> **25 paths** in `.claude/protected-files.json`, locked on every `Edit`/`Write`/`NotebookEdit`.
> ⚠ **`CLAUDE.md`, `verify/proven.json` and `verify/run.mjs` are among them.** Changing any needs
> Carl naming that exact path under `"unlocked"` in `live-work/chunk-scope.json`. Never a folder,
> never a glob. **Remove the unlock when done and re-verify the path locks again** — `chunk-scope.json`
> is gitignored, so a session ending with unlocks live leaves the next one with protected files
> quietly writable and no denial to reveal it.
>
> ## 2. VERIFY — `VERIFY FRONT DOOR: ... skips the verdict gate`
>
> **`node verify/x.mjs` is DENIED on the Bash tool.** Use **`npm run verify -- <script.mjs>`**.
> ⚠ It also catches `node --check verify/…`. Reading is untouched — `cat`/`grep`/`ls` are fine.

⛔ **A denial is not a bug. Do not diagnose it, and DO NOT ROUTE AROUND IT WITH A SHELL.** Both
hooks run on tool calls only; `sed -i`, redirect, `mv`, `cp`, `rm` bypass them entirely. **What
catches a shell write is the diff — a reviewer, not a mechanism.** Stop and ask Carl.

---

# ⚠⚠ THE PROJECT HAS ZERO ADMISSIBLE HARNESSES. 0 OF 130.

**`reveal-stall.mjs` was the one, and is now UNPROVEN** — its `observedSpread` is **deliberately
null**. A verdict now needs THREE things: a recorded **red run**, an **empty-input control**, and a
declared **subject stability** — with an observed spread for anything that varies.

⚠ **`⚠ NO VERDICT` on everything is the HONEST STATE, not a fault.** Nothing in `verify/` can
currently be cited as evidence. Do not read a green line as a pass.

## THE OPEN FAULT THAT CAUSED IT — a lead, not a mystery

**5 films on build `2026-08-19T21-37-45` reported 0ms on ALL FIVE runs.** The films are good: the
reveal resolved at **1240–1280ms against a declared 1300ms**, so the window found the reveal. ⚠ **It
is the FREEZE INSIDE that window that does not resolve.**

⛔ **The batch-sort defect was fixed (`e140743`) and did NOT cause it.** Re-measuring the SAME films
after the fix gives an identical result, and the stale directory reports 0ms too — both agree, and
neither explains the other. **So `reveal-stall.mjs`'s band, tolerance or window is a SEPARATE open
fault, untouched by this session** — and it is what stands between the project and its first
admissible harness. ⚠ Recording `0-0ms` as a spread would be the quiet zero requirement 2 exists to
prevent, which is why the entry stays unproven.

---

## THIS SESSION'S COMMITS — FOUR, on `fix/q5-stall-and-label-colour`

**Head `302b05d` at the time of writing. Tree clean, pushed, verified by `git ls-remote`.**

> ⚠ **THE HEAD SHA HERE IS ALWAYS AT LEAST ONE BEHIND** — a file cannot name the commit that
> contains it. **Run `git log --oneline -6`. Do not trust this line.**

```
5f43f15  feat  the single-run rule — a sample count, not a command typed twice
e140743  fix   pick the batch by when the films were shot, and say which
959ea69  feat  the evidence machinery joins the protected list — both halves
302b05d  fix   reveal-stall.mjs pointed at a door the front door denies
```

⚠ **`8ff107f` and earlier are from the PREVIOUS session**, already covered by the handoff this one
replaces. **Four, not six.**

---

## THE SINGLE-RUN RULE — what it actually requires

**Three samples in ONE INVOCATION**, read from the count the script itself declares and prints.

⛔ **NOT three invocations.** `reveal-stall.mjs` already takes five samples per run, and separate
invocations are separate batches — the script *aborts on a build-id change* because "runs across two
builds are not one distribution". A runner stitching three together would **manufacture a wider
spread than the subject has**. ⚠ **The rule is about the sample count behind the number, not how
many times the command was typed.**

**Three is fixed and deliberately NOT per-entry** — a per-entry minimum invites arguing an expensive
script deserves fewer, and that argument is always available to someone in a hurry.

**Cost of one verdict: ~2m 35s** (143s filming + 12s measuring).

---

## ⚠ PROVING A SCRIPT NOW NEEDS AN UNLOCK FROM CARL

`verify/proven.json` is protected, so adding an entry, fixing a stale `redRun` or filling in an
`observedSpread` is a stop-and-ask. **Cheap today** — one entry, currently unproven, proofs rare.

⚠ **THE TEST IS FREQUENCY.** If proofs become routine, the failure mode is **not a bad proof getting
in — it is PROOFS QUIETLY STOPPING**, which looks identical to a project with no instruments worth
proving. At that point the right instrument is a review gate on the diff, not a block on the edit.

---

## ⚠ 155 HEADER COMMENTS STILL NAME THE BLOCKED ROUTE

Across **129 of 130 scripts**. A reader following a script's own header hits a denial and has to work
out that **the file is wrong, not the hook**. We created that contradiction when the front door
landed. The two **printed** cases are fixed; **`corridor-motion.mjs:388` is a third** (`fix-mojibake.mjs:25`
is a usage line on a repair utility — a separate question).

⛔ **NOT A SWEEP. Carl's direction stands: a hook that checks text AS IT IS WRITTEN, not the 155 as
they stand.** They shrink as files are touched.

### The doc-route hook was STARTED AND STOPPED mid-falsification

**Reverted entirely and deliberately — nothing is on disk, nothing is registered.** Both hook files
deleted, the `settings.json` registration reverted, the two unlocks closed and re-verified.

⚠ **WHY REVERTED RATHER THAN PARKED:** cases (e) and (f) never ran, so there is **no evidence it
fails closed on a malformed matcher, and none that it leaves the other two hooks undisturbed.** A
hook registered but unfalsified is a control that looks installed and isn't — the exact defect
measured in `1c6c5a1`. What it did prove: cases (a)–(d) passed, including the one that decides
usability — **an unrelated edit to a file that already contains the direct form is ALLOWED**, because
it inspects only the text being written. A whole-file check would deny every edit to 129 scripts.

---

## ⚠ TOOLING FAULT — TWICE, AND IT WILL HAPPEN AGAIN

**Bash heredoc patches have silently no-opped, and have stripped regex backslashes** (`\d` → `d`,
which broke a live file-discovery regex). **Both were caught only by GREPPING THE RESULT.**

⛔ **A patch's success message is not evidence it applied.** Grep the file after every scripted edit.

---

# STILL OPEN

## Waiting on Carl's eye — FOURTH session running

- **Commit 3 — the opening/complete visibility gate.** ⚠ Carries **a chrome pill painted over the
  contact form.** Walk Q1 → complete, by eye AND by capture. ⛔ Do not bundle it.
- **The Next step button appearance verdict.** Shots at `live-work/shots/commit2-0{1..4}-*.png`.
- **The corridor fix remains ON HOLD by Carl's decision.**

## Loose ends

- ⚠ **`reveal-stall.mjs`'s band/tolerance/window** — the open fault above. Report-only so far.
- **`verify/proven.json` is now protected**; `reveal-stall-measure.mjs` is not.
- **Open from the governance split:** a stored baseline still passes as a control; nothing counts
  contexts or canvases on a walk; only 9 of 130 harnesses declare what they do not watch.
- **`open-defects.md`** holds four live faults — the a11y fault, Q4–Q1 having no card entrance, the
  7.4s/10.1s opening delay (Carl's standing decision: first job when building resumes), and the
  stale anchor at `answer-card-canvas.tsx:1925`.

---

## ENVIRONMENT TRAPS

- **Production is the verdict**; dev and production disagree. `npm run build && npx next start -p 3100`.
- **Turbopack serves cached CSS failures.** Tell: a line number exceeding the file's length. `rm -rf .next`.
- ⚠ **`TaskStop` reports success on a held port. Kill by PID, confirm free** — and check for a
  **LISTENING** socket specifically; `TIME_WAIT` entries are closed connections, not a held port.
- ⛔ **`canvas.__r3f` IS UNDEFINED ON PRODUCTION BUILDS.**
- ⚠ **Q5's reveal begins ~7.8s AFTER Begin**, not ~2.5s.

---

*19 August 2026, late. **The gate now reports what is true: almost nothing here is evidence yet.***
*⚠ **That is the instrument working. The next session's job is the freeze that will not resolve.***
