# Session Handoff — 19 August 2026 (evening). Two controls now block by default.

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

# ⛔⛔ TWO THINGS WILL STOP YOU. BOTH ARE THE CONTROL WORKING.

> ## 1. EDITS — `SCOPE GUARD: '<path>' is PERMANENTLY PROTECTED`
>
> **23 paths** in `.claude/protected-files.json`, locked on every `Edit`/`Write`/`NotebookEdit`.
> ⚠ **`CLAUDE.md` IS NOW ONE OF THEM**, so **changing any rule needs Carl naming that exact path**
> under `"unlocked"` in `live-work/chunk-scope.json`. Never a folder, never a glob. Remove the
> unlock when done.
>
> ## 2. VERIFY — `VERIFY FRONT DOOR: ... skips the verdict gate`
>
> **`node verify/x.mjs` is DENIED on the Bash tool.** Use **`npm run verify -- <script.mjs>`**.
> Habit reaches for the first one. Reading is untouched — `cat`/`grep`/`ls` on `verify/` are fine.

⛔ **A denial is not a bug. Do not diagnose it, and DO NOT ROUTE AROUND IT WITH A SHELL.** Both
hooks run on tool calls only; `sed -i`, redirect, `mv`, `cp`, `rm` bypass them entirely. **What
catches a shell write is the diff — a reviewer, not a mechanism.** Stop and ask Carl.

---

## THIS SESSION'S COMMITS — SIX, on `fix/q5-stall-and-label-colour`

**Head `aa84584` at the time of writing. Tree clean, pushed, verified by `git ls-remote`.**
No product code touched in any of them. Servers: none. Ports 3000/3100 free.

> ⚠ **THE HEAD SHA HERE IS ALWAYS AT LEAST ONE BEHIND** — a file cannot name the commit that
> contains it. **Run `git log --oneline -6`. Do not trust this line.**

```
923295b  feat  the verify front door, and a guard that cannot fail quietly open
1c6c5a1  fix   the scope guard failed open, measured — and now fails closed
2f43d63  docs  two read lists, because seven equal items is a list nobody finishes
e899645  docs  remove the session-length directive
e913266  feat  CLAUDE.md joins the protected list — the rules file was the open door
aa84584  feat  the empty-input control — a zero is not a finding until it can say "nothing"
```

⚠ **`72aabc1` and earlier are from the PREVIOUS session** (13:02 vs this session's 17:54–18:54),
already covered by the handoff this one replaces. Six, not seven.

---

## ⚠⚠ BOTH HOOKS FAILED OPEN UNTIL TODAY. MEASURED, NOT INFERRED.

**The scope guard was corrupted with a syntax error, and an Edit to `lib/utils.ts` — a protected
path DENIED ninety seconds earlier — LANDED ON DISK.** All 19 paths were writable while the guard
still appeared installed.

**THE MECHANISM. It applies to every hook this project will ever add:**

| hook exits | harness behaviour |
|---|---|
| `0` + deny JSON | DENIED |
| `0`, no JSON | **ALLOWED** |
| `2` | **BLOCKED**, stderr shown |
| `1`, or any crash | **ALLOWED** — reported, not blocking |

⚠ **A syntax error exits 1.** And **a file cannot catch its own parse error** — node dies in the
module loader before line 1 runs, so wrapping the body in `try/catch` does nothing. Both were
tried and falsified.

**Both hooks are now launcher + matcher pairs.** A parse error in the matcher is a catchable
runtime error in the launcher, which exits 2. Edits belong in the matcher.

⚠ **EACH LAUNCHER IS STILL A SINGLE POINT THAT FAILS OPEN IF IT IS MALFORMED.** Nothing can catch
the outermost frame. **Their whole defence is being short enough to review by eye — and they are
241 and 282 lines.** ⛔ **If either grows, that defence stops being true.** Keep logic in the
matchers.

**Fail-closed scope differs, deliberately:** the scope guard denies EVERY edit (the shell still
works, so `git checkout .claude/hooks/` is a real escape hatch); the front door denies verify
commands ONLY (a total Bash block would need an unlock in a session where nothing can run — a
trap, not a stop).

---

## ⚠ ONE HARNESS OF 130 CAN NOW PRODUCE AN ADMISSIBLE PASS

**Two requirements, both mandatory** — an entry missing either is treated as unproven:

1. **`redRun`** — shown to go RED. It CAN fail.
2. **`emptyInput`** — pointed at NOTHING, and it **reported an ABSENCE**. ⛔ A zero value does not
   qualify; `0ms` from an empty crop is the defect, not the control.

**`reveal-stall.mjs` is the only proven script.** **`extras-hold-position.mjs` was DEMOTED** — its
red run is genuine, but every arm of it measured a real element. ⚠ **A control was not invented for
it and the requirement was not weakened to keep it.** Its capability exists at line 181, but **a
capability is not a run.**

⚠ **So `⚠ NO VERDICT` is the normal, honest result — 129 scripts.** Not a fault. **Almost nothing
in `verify/` can currently be cited as evidence.**

---

## THE READ LIST IS NOW TWO LISTS (CLAUDE.md)

**Read-first: 8,837 words** — handoff, `open-defects.md`, `current-sprint.md`, `context-rules.md`.
**Consult on demand** — `decisions.md`, `review-log.md`, component docs, files to be touched.

⚠ **`decisions.md` is CHEAPER TO SKIP, NOT SAFE TO IGNORE.** The approved layers are named in
CLAUDE.md and 23 paths are guarded, so you will be *stopped* without it — but **only
`decisions.md` carries the reasoning.** Before touching an approved layer, read the decision.

---

# STILL OPEN — NONE OF IT IS GOVERNANCE WORK

## Waiting on Carl's eye, third session running

- **Commit 3 — the opening/complete visibility gate.** ⚠ Carries **a chrome pill painted over the
  contact form.** Walk Q1 → complete, by eye AND by capture. ⛔ Do not bundle it.
- **The Next step button appearance verdict.** Landed but unapproved. Shots at
  `live-work/shots/commit2-0{1..4}-*.png`.
- **The corridor fix remains ON HOLD by Carl's decision.**

## Loose ends

- ⚠ **`reveal-stall.mjs` still prints `node verify/reveal-stall-measure.mjs`** on completion — a
  route the front door now DENIES. Its own instructions point at the blocked door. One line, in a
  `verify/` file, not yet authorised.
- ⚠ **`verify/proven.json` is NOT protected.** The file that decides what counts as evidence is not
  on the list.
- **Open from the governance split, untouched:** a single run still counts as a measurement; a
  stored baseline still passes as a control; nothing counts contexts or canvases on a walk; only 9
  of 130 harnesses declare what they do not watch.
- **`open-defects.md`** holds four live faults — the a11y fault, Q4–Q1 having no card entrance, the
  7.4s/10.1s opening delay (Carl's standing decision: first job when building resumes), and the
  stale anchor at `answer-card-canvas.tsx:1925`.

---

## ENVIRONMENT TRAPS

- **Production is the verdict**; dev and production disagree.
- **Turbopack serves cached CSS failures.** Tell: a line number exceeding the file's length.
  `rm -rf .next`.
- ⚠ **`TaskStop` reports success on a held port. Kill by PID, confirm free.**
- **Serving:** `npm run build && npx next start -p 3100`.
- ⛔ **`canvas.__r3f` IS UNDEFINED ON PRODUCTION BUILDS.**
- ⚠ **Q5's reveal begins ~7.8s AFTER Begin**, not ~2.5s.

---

*19 August 2026, evening. **Two controls that looked installed and were not are now measured and***
*⚠ **fixed. Both were found only because a brief demanded the FAILURE path be falsified —***
*⚠⚠ **every case that exercised the healthy path passed against a broken guard.***
