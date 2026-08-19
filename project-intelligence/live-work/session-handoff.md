# Session Handoff — 19 August 2026 (the repo now blocks edits by default)

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

# ⛔⛔ READ THIS BEFORE YOUR FIRST EDIT

> ## **EDITS ARE NOW BLOCKED BY DEFAULT. A DENIAL IS THE CONTROL WORKING, NOT A BUG.**
>
> If an `Edit`/`Write` comes back **`SCOPE GUARD: '<path>' is PERMANENTLY PROTECTED`**,
> nothing is broken. **Do not diagnose it. Do not route around it. STOP AND ASK CARL.**

**19 paths in `.claude/protected-files.json` are locked on every `Edit`/`Write`/`NotebookEdit`**,
whether or not a chunk scope file exists. This is new as of today and the first time this repo has
had a control that blocks by default.

**The only route through:** Carl names **one specific path** under `"unlocked"` in
`project-intelligence/live-work/chunk-scope.json`. **Never a folder. Never a glob. Never
`"active": false`** — all three were tested and all three still DENY. Remove the unlock when the
edit is done.

⚠ **If `.claude/protected-files.json` is missing or malformed, EVERY edit is denied**, including
unlisted files. That is deliberate. Fix: `git checkout .claude/protected-files.json`.

## ⚠ WHAT THE GUARD DOES NOT DO — do not trust it further than this

- **It is not tamper-proofing.** The hook runs on `Edit`/`Write`/`NotebookEdit` **only**. `Bash`
  redirect, `sed -i`, `mv`, `cp` and `rm` **never reach it** — every protected file can still be
  rewritten or deleted from a shell. ⛔ **Do not use a shell to get past a denial.** What catches a
  shell write is the diff, because the files are tracked: **a reviewer, not a mechanism.**
- **A file nobody listed is unprotected** — including a renamed one.
- **Adding a path is itself an edit to a locked file**, so it needs an unlock first.

## ⚠ WHY THESE 19 AND NOT OTHERS — the omissions are deliberate

**The list is SETTLED GROUND: files not edited in the last week.**

**Files under active repair are DELIBERATELY NOT LOCKED** — `enquiry-opening.tsx`,
`answer-card-canvas.tsx`, `answer-card-geometry.ts`, `nextstep-canvas.tsx`, `globals.css`.
⚠ **A lock that gets unlocked every session becomes a form to fill in rather than a stop**, and
then the whole mechanism reads as noise.

**The Next step button is deliberately not locked either.** Carl's constraint on it is about
**appearance and behaviour**, and **a file lock cannot tell a repair from a redesign.** What
protects it is the appearance gate and **Carl's eye** — not a path list.

---

## THIS SESSION'S FIVE COMMITS

**Branch `fix/q5-stall-and-label-colour`, head `4d4d534`. Tree clean, pushed, verified by
`git ls-remote`.** No product code touched in any of the five. Servers: none. Ports 3000/3100 free.

```
f531d9d  docs  the card face is satin, not glass — D-051
65b89fe  feat  the permanent list, fail-loud when missing or malformed
f5647b4  feat  the list protects itself on the edit path
f2a1710  docs  this handoff
4d4d534  feat  the verify verdict gate
```

- **`f531d9d`** — the material changed on **9 August (`1c9b8d7`)** and **the record was ten days
  behind.** D-051 records what is built (`MeshPhysicalMaterial`, `transmission: 0`, anisotropy 0.86,
  separate sheen lobe); D-028 superseded **in part** — its wording untouched (P4), its
  selected-state provisions still stand; CLAUDE.md's approved-layers line corrected.
  ⚠ `answer-card-glass.ts` still carries the old material in its **name** — recorded as a known
  mismatch, deliberately not renamed.

> ### ⚠⚠ READ `f5647b4`'s COMMIT MESSAGE IN FULL — `git log -1 f5647b4`
>
> **It is the ONLY record that a permanent lock was ever opened**, and the only record that
> **the guard fired for real.** `live-work/` is gitignored, so the unlock left no other trace.

⚠ **The guard denied the Builder mid-task, from the live harness** — not a stdin test. That closes
the *"proved the script, not the wiring"* gap `65b89fe` left open. **The Builder stopped and asked
Carl rather than unlocking on its own authority**, which is the behaviour the control exists to
produce. Carl named `.claude/hooks/chunk-scope-guard.js`, one path, for one purpose; it was removed
immediately and the lock re-verified.

---

## ⚠ THE VERIFY FRONT DOOR IS NOW `npm run verify` (`4d4d534`)

> ### **`npm run verify -- <script.mjs>` — NOT `node verify/<script>.mjs`.**
> **Habit will reach for the second one.**

**A script with no recorded red run may print its numbers but NOT a pass.** Every expensive
instrument failure in this project failed toward a PASS — `q5-stutter.mjs` read 0/3 CLEAN on a
visible stall; `one-context.mjs` read 2/2 while a context was created per question. A failure from
an unproven script always passes through: **a red still means go and look.**

**Only 2 of 130 scripts are proven today** — `extras-hold-position.mjs`, `reveal-stall.mjs`.
⚠ **So `⚠ NO VERDICT` is the normal, honest result right now, not a fault.** Scripts get proven as
they are used: one at a time, by running the falsification and recording it in `verify/proven.json`.

⛔ **THE GATE CAN BE BYPASSED, AND THAT IS NOT A DEFECT TO REPORT.** Running a script directly
skips it entirely and prints the raw verdict. **Unlike the scope guard, this one can be declined** —
it is a convention with a reminder attached, not a mechanism. Do not read it as enforced.

⚠ **Neither seeded script has been run through the runner for real.** Both need a production server
and a full Q5 walk. **The runner's logic is proved against fixtures; the wiring against a live
harness is not** — the same gap `65b89fe` left and `f5647b4` closed for the scope guard.

---

# ⚠⚠ AN OPEN DEFECT IS FILED IN THE WRONG PLACE — CARL DECIDES WHERE IT GOES

**The answer card labels are baked into a texture, so the answer text is NOT in the accessibility
tree.** Real defect, recorded not hidden.

⛔ **It currently lives inside D-051 — an entry about MATERIAL.** A live defect filed alongside the
story of something else is **exactly the pattern this session set out to stop.** It needs to become
a tracked open item somewhere Carl will see it.

⛔ **DO NOT FIX IT. DO NOT DECIDE WHERE IT GOES. PUT IT TO CARL.**

---

## ⚠ STILL WAITING ON CARL'S EYE — THIRD SESSION RUNNING

Untouched by this session's work. **No timing number until he has judged the appearance.**

- **Commit 3 — the opening/complete visibility gate. ITS OWN COMMIT.** ⚠ Carries **the worst
  visible failure in the plan: a chrome pill painted over the contact form.** Verify by walking
  Q1 → complete, **by eye AND by capture**. ⛔ Do not bundle it with anything.
- **The Next step button appearance verdict.** Committed as **landed-but-unapproved**. Serve with
  `npm run build && npx next start -p 3100`, walk to Q5, select a card. Shots at
  `live-work/shots/commit2-0{1..4}-*.png`.
- **The corridor fix remains ON HOLD by Carl's decision.**

---

## ⚠ THE GOVERNANCE WORK IS ONE GATE, NOT THE JOB

**Do not mistake today's guard for the whole problem.** Still open, from the split Carl approved:

- ⚠ **A harness that has never gone red can still print a verdict — PARTLY ADDRESSED by `4d4d534`,
  and only through the front door.** Run directly, it still prints one.
- **Only 9 of 130 harnesses declare what they do not watch.**
- **A single run still counts as a measurement.**
- **A stored baseline still passes as a control.**
- **A quiet zero still reads as a finding.**
- **Nothing counts contexts or canvases on a walk.**

⚠ **And the corpus itself is untouched — 228,651 words in `project-intelligence`, 35,703 of which
CLAUDE.md tells you to read before starting.**

---

## ENVIRONMENT TRAPS

- **Production is the verdict**; dev and production disagree.
- **Turbopack serves cached CSS failures.** Tell: a line number exceeding the file's length.
  `rm -rf .next`.
- ⚠ **`TaskStop` reports success on a held port. Kill by PID, confirm free.**
- **Serving:** `npm run build && npx next start -p 3100`.
- ⛔ **`canvas.__r3f` IS UNDEFINED ON PRODUCTION BUILDS.**
- ⚠ **Q5's reveal begins ~7.8s AFTER Begin**, not ~2.5s. A short window films the opening.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session length,
not a suggestion to stop or resume later. **Carl decides when a session ends and will say so.**
It was not broken this session.

---

*19 August 2026. **The guard fired for real and the Builder stopped rather than route around it.***
*⚠ **A denial is the control working. The gap it does not cover is the shell, and no mechanism***
*⚠⚠ **closes that one — only the diff, and a reader.***
