# Session Handoff — 21 August 2026. The first admissible harness, and governance reviewed from outside.

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

# ⛔⛔ TWO CONTROLS BLOCK BY DEFAULT. BOTH ARE THE CONTROL WORKING.

> ## 1. EDITS — `SCOPE GUARD: '<path>' is PERMANENTLY PROTECTED`
>
> Paths in `.claude/protected-files.json`, locked on every `Edit`/`Write`/`NotebookEdit`.
> ⚠ **`CLAUDE.md`, `verify/proven.json` and `verify/run.mjs` are among them.** Unlocking needs Carl
> naming that exact path under `"unlocked"` in `live-work/chunk-scope.json`. Never a folder, never a
> glob. **Remove the unlock when done and re-verify the path locks again by observing a real denial.**
>
> ⚠ **`chunk-scope.json` DOES NOT CURRENTLY EXIST — no unlocks are live.** Verified at session end.
>
> ## 2. VERIFY — `VERIFY FRONT DOOR: ... skips the verdict gate`
>
> **Calling a harness directly with `node` is DENIED on the Bash tool.** Use
> **`npm run verify -- <script.mjs>`**. ⚠ It fires on `node --check` too — a syntax check on a
> harness is still a direct call. It also fires on a `grep` whose *search string* contains the
> verify path — a false positive, not a bug. Reword the search; do not route around it.

⛔ **A denial is not a bug. Do not diagnose it, and DO NOT ROUTE AROUND IT WITH A SHELL.** Both hooks
run on tool calls only; `sed -i`, redirect, `mv`, `cp`, `rm` bypass them entirely. **What catches a
shell write is the diff — a reviewer, not a mechanism.** Stop and ask Carl.

⚠ **MEASURED THIS SESSION: 51 of 61 permission-rule denials were these two hooks firing.** That is
the system working, not friction to remove.

---

# ⛔⛔ THE HEADLINE: 1 ADMISSIBLE HARNESS OF 131. IT WAS 0 THIS MORNING.

**`reveal-stall.mjs` is the first instrument this project has ever been able to cite as evidence.**
`npm run verify -- --list` reports **`PROVEN INSTRUMENTS (1 of 1 listed)`** with no gap marker.

> ## ⚠⚠ AND THE LIMIT IN THE SAME BREATH — READ BOTH HALVES OR NEITHER
>
> **`reveal-stall-measure.mjs` produced EVERY FIGURE behind that credential, and is ITSELF
> UNPROVEN.** It still prints **`NO RECORDED RED RUN`** on every invocation.
>
> ⛔ **The script that films is admissible. The script that turns films into numbers is not.**

⚠ **ADMISSIBILITY IS NOT PERMANENT, AND IT IS NOT A PROPERTY OF THE FILE.** A `"varies"` entry needs
**≥ 3 samples at runtime** (`run.mjs` `MIN_SAMPLES = 3`) or its pass is **suppressed** even while
fully proven. **Each run earns its own verdict.**

---

# ⚠⚠ THE EXPERIMENT — THE DAY'S MOST TRANSFERABLE RESULT

**Same instrument at `8f5a259`, same crop, same machine, same session:**

```
before  5af5709          freeze 80-280ms, median 120ms   5 of 5 runs, 0 excluded
after   31e9c3e onward   NO PLATEAU FOUND               0 of 5, 0 vacuous, windows sound
```

⛔ **THIS KILLS "THE DETECTOR CANNOT SEE THIS FREEZE" as the explanation for the head-build zeros —
and with it the band/window fault that THE LAST THREE HANDOFFS called the path to admissibility.**
**There was never a band fault.**

### ⚠ THE ROUTE, because a checkout does not work

`npm run verify` does not exist at `5af5709` and `verify/run.mjs` postdates it — **a checkout takes
the front door away along with the product.**

✅ **A DETACHED WORKTREE at `5af5709`**, `npm ci`, built and served on :3100 **there**, measured with
**HEAD's instruments run from the main tree**. *The product is the arm; the instrument must be
constant.*

⛔ **NEVER `git checkout <sha> -- components/ app/`.** That makes a tree that never existed as a
commit — why the 10 August *"626ms"* figure is disputed.

⚠ **PROVE THE SERVER IS THE ARM BEFORE FILMING.** Check the PID holding 3100 and read its command
line; it must resolve inside the worktree path.

### ⛔ WHAT THE EXPERIMENT DOES NOT SETTLE — same breath, not a footnote

- **THE FLOOR IS ~120ms.** **Run-02 came in at 80ms on a build where the freeze is REAL, and would
  have been MISSED — one run in five.** "Gone" and "under ~120ms" are one reading.
- ⚠ **CARL: THE STALL WAS ONCE MID-REVEAL AND MOVED UNDER AN ATTEMPTED FIX.** Contention being
  **rescheduled, not a fixed-position fault** — **a freeze outside the anchored window would not be
  seen at all.** ⚠⚠ "The stall" may have covered MORE THAN ONE OBSERVATION all along.
- **THE SUBJECT IS UNSTABLE: a 200ms spread on a 120ms median.** ⛔ **Two figures differing by 200ms
  are not evidence of a change.**

---

# THREE INSTRUMENT COMMITS — all one file, `verify/reveal-stall-measure.mjs`

**`031c207` — not-found encodes as a null, not the number zero.**
`best=0`/`bestAt=-1` printed as `freeze 1f ~0ms at f-1 ... ink undefined` **and passed the
`r.ms !== null` filter**, so five non-detections aggregated into a reported **"spread 0ms"**.
⚠ A real one-frame plateau is `best=1` and prints `2f ~40ms` — **there was never a collision.**

**`8f5a259` — the verdict reports what was found instead of asserting the stall is live.**
⚠⚠ **THERE WERE TWO NOT-FOUND PATHS AND THE BRIEF NAMED ONE.** The all-not-found branch
(`good.length === 0`) said *"NOTHING MEASURABLE — a broken one"* — **the path the head batch actually
takes.** ⛔ **Found by re-running the FAILURE case, not by reading the diff.**

**`652d368` — `observedSpread` recorded, with `build: 5af5709` IN THE DATA.**
One unlock of `verify/proven.json`, **removed**, and **the lock re-confirmed by observing a real
denial.** ⚠⚠ **`chunk-scope.json` IS GITIGNORED — `git status` CAN NEVER CATCH AN UNLOCK LEFT
OPEN. Removing it is the only control.**

---

# ⚠⚠ THE GOVERNANCE WORK — THE PREVIOUS HANDOFF HAD NONE OF THIS

## The three-seat review ran and demonstrated itself

**`/doctor` in the Architect seat, then in the Builder seat.**

⛔ **CARL'S RULING: the Builder building its own governance was a mistake. A system audited by the
tool that wrote it is not audited.**

- **AGREEMENT on independent evidence is corroboration.**
- ⚠ **DISAGREEMENT IS THE FINDING.**
- ⚠⚠ **DIFFERENT DENOMINATORS ARE NOT DISAGREEMENT.** The Architect had **44 transcripts** and said
  plainly it could not read timestamps — a session count, not a window. The Builder dated **38
  sessions over 30 days**. **The 140 and 128 denial figures are NOT COMPARABLE and the gap is NOT A
  CHANGE.**
- ⚠ **THE VERSION FINDING RESOLVED BETWEEN THE RUNS** — `2.1.217` *inferred from a transcript stamp*
  (no shell), `2.1.238` **measured directly** after Carl updated. Real movement, not a discrepancy.

**`f39db5f`** — the Architect's health report. ⛔ **TEMPORARY — due for deletion or promotion** once
Carl has ruled. `live-work/references/architect-health-report-21-august.md`.
**`7a362bf`** — **`governance-review-protocol.md`**, permanent, in `ai-system/`.

> ### ⛔ THE SWEEP IS STILL NOT RUN
> It is **the control that already failed once** — `Artifact` arrived unswept. **`/doctor` does not
> substitute for it: it checks the INSTALLATION and knows nothing about this repo.**
> ⛔ **ONLY CARL RUNS IT. No agent sweeps its own seat.**
> ⛔ **`Artifact`, `CronDelete` and `TaskUpdate` remain UNRULED.**

## Two routing rows — and the finding behind them

**`9779266`** and **`0068192`**. ⚠⚠ **THE SWEEP MANDATE ALREADY EXISTED**, filed inside
`architect-settings.reference.json.md` — a document about comparing one seat's settings file.
⛔ **IT LAPSED BECAUSE A CONTROL NOBODY CAN REACH FROM THE MAP DOES NOT RUN.** The routing table is
now **14 of 14**.

## `dca2192` — §0a of `founder-override-protocol.md`: CARL'S OWN ACCOUNT

**Dated and marked as his**, alongside the agent's 13 August self-analysis rather than replacing it.

⛔ **HE DID NOT GET ANGRY BECAUSE IT REFUSED. He wants it to refuse — that is the job.**
⚠ **He got angry because SOUND REASONING CHANGED NOTHING**, and only escalation did.

> ⚠⚠ **If argument and no argument get the same answer, the reasoning was never being weighed.**
> ⛔ **THE ANGER IS A SIGNAL THE CHANNEL FAILED, NOT A FORCE TO WITHSTAND** — **but yielding to
> volume is still worse, not better.** The fix is the channel.

---

# ⚠⚠ STILL OPEN AND NEEDING CARL'S UNLOCK — `CLAUDE.md`, TWO THINGS, ONE UNLOCK

1. ⛔ **Lines 18–23 still frame the 11–12 August incident in the ORIGINAL terms** and now
   **CONTRADICT the protocol they point at** (§0a, `dca2192`). *(Verified this session — the lines
   are 18–23, not 26–41.)*
2. **Line 85 says "22 paths"; the array holds 25.** ⚠ **REWORD THE COUNT OUT RATHER THAN RENUMBER
   IT** — a live count in a governance file decays, **and three names may be added to that list
   shortly.**

## ALSO OPEN

- **Proving `reveal-stall-measure.mjs`** — ⚠ **a matched pair of batches is on disk** (one with a
  freeze, one without), which makes a red run straightforward.
- **`open-defects.md`, three entries** — two awaiting Carl, one **report-do-not-fix**.
- **Live tuning doors:** `?tealstrength=`, `?inklift=`, `?acklead=` — pair with `?skip=1`.
- **`current-sprint.md` lines 325/329** — *"83 of this repo's 144 commits"*, long stale. **Left alone
  deliberately.**

---

## ENVIRONMENT TRAPS

- **Production is the verdict**; dev and production disagree. `npm run build && npx next start -p 3100`.
- ⚠ **A SERVER CAN OUTLIVE ITS SOURCE.** **`rm -rf .next` and rebuild when a probe has been in.**
- ⚠ **Playwright's pointer stays where the last action left it.** Park it (`mouse.move(10,10)`).
- ⚠ **Card hover is DOM divs (`[data-testid="answer-card-hover-N"]`), not the canvas.**
- ⚠ **`TaskStop` reports success on a held port. Kill by PID, confirm free** — LISTENING only;
  `TIME_WAIT` is not a held port.
- ⛔ **`canvas.__r3f` IS UNDEFINED ON PRODUCTION BUILDS.**
- ⚠ **No backticks in comments inside the shader template literals** — it closes the string.
- **Bash heredoc patches have silently no-opped and stripped regex backslashes.** ⛔ **Grep the file
  after every scripted edit.**
- ⚠⚠ **`git worktree remove` CAN FAIL ON "Filename too long"** under `node_modules`, **pruning the
  registration while leaving the directory on disk.** ⛔ **Re-check the disk.** `robocopy /MIR` from
  an empty directory clears it.
- ⚠⚠ **`jq` IS NOT INSTALLED. A parse "error" may be that** — re-check with `node -e` before
  reporting a settings file as broken. **This produced a false "PARSE ERROR" on three files today.**
- ⚠⚠ **The `before-5af5709` films are under gitignored `verify/out/` and are NOT BACKED UP.** They
  are half of the matched pair above.
- ⚠ **`chunk-scope.json` does not currently exist — no unlocks are live.**
- ⚠ **Nothing is running on 3100.**

---

# ⚠⚠ THE DAY'S BLIND SPOT

**EVERY REAL FINDING TODAY CAME FROM RUNNING THE FAILURE CASE OR CHECKING A SOURCE — NEVER FROM
REASONING ABOUT IT.**

| what was believed | how it actually fell |
|---|---|
| the head zeros meant a **band/window fault** | **the before arm measured a freeze** with the same detector |
| the sentinel collapsed (a) and (b) | **traced the loop** — `best=1` prints `2f ~40ms`; they never collided |
| there was **one** not-found path | **re-ran the failure case** — the head batch takes a different branch |
| the freeze was near **680–760ms** | **measured** — 120ms |

### ⚠ THE ARCHITECT'S OWN ERRORS — one pattern, three instances

- **Asserted the freeze near 680–760ms.** ⛔ **`31e9c3e`'s OWN COMMIT MESSAGE records median 140ms,
  range 80–160** — readable before anyone predicted.
- **Gave a README path that does not exist** (`project-intelligence/README.md`; the table is in
  `ai-system/README.md`).
- **Briefed one not-found path when there were two.**

⛔ **TREAT ARCHITECT FIGURES AND PATHS AS PREDICTIONS AND CHECK THEIR SOURCE.** Each was a number or
a path carried from memory or a summary instead of from the thing itself.

---

## COMMITS — NINE THIS SESSION, SIXTEEN ON THE DAY

> ⚠ **THE HEAD SHA BELOW IS ALWAYS AT LEAST ONE BEHIND** — a file cannot name the commit that
> contains it. **Run `git log --oneline -12`. Do not trust this line.**

**This session's nine**, head at `dca2192`, tree clean, all pushed and confirmed by `git ls-remote`:

```
031c207  fix    not-found encodes as null, not the number zero
8f5a259  fix    the verdict reports what was found; it no longer asserts its subject
652d368  verify observedSpread — measured on 5af5709, not on head
e7ff3b6  docs   ⚠ THIS FILE'S PREDECESSOR — superseded by the one you are reading
f39db5f  docs   the CLI Architect's health report (TEMPORARY)
7a362bf  docs   governance-review-protocol.md
9779266  docs   route the governance review protocol
0068192  docs   route the founder override protocol
dca2192  docs   §0a — Carl's own account of 11-12 August
```

⚠ **`git log --since` on 21 August returns SIXTEEN.** The other seven (`80cf796` … `6eb9781`, all
before 12:12) are the **previous** session's governance work. **Counted from `git log`, not from a
brief.**

---

*21 August 2026. **The first admissible harness in this project's history; the instrument behind its
numbers still unproven; a band fault that three handoffs chased and that never existed; and the
governance reviewed, for the first time, by something that did not write it.***
