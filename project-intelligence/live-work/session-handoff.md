# Session Handoff — 21 August 2026. The first admissible harness, and the band fault that never existed.

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
> glob. **Remove the unlock when done and re-verify the path locks again.**
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
> Every measurement quoted in this handoff came through the unproven one.

⚠ **ADMISSIBILITY IS NOT PERMANENT, AND IT IS NOT A PROPERTY OF THE FILE.** A `"varies"` entry needs
**≥ 3 samples at runtime** (`run.mjs` `MIN_SAMPLES = 3`) or its pass is **suppressed** even while
fully proven. **Each run earns its own verdict.** `reveal-stall.mjs` films 5 by default, which
clears it — a run with fewer does not.

---

# ⚠⚠ THE EXPERIMENT — THE DAY'S MOST TRANSFERABLE RESULT

**Same instrument at `8f5a259`, same crop, same machine, same session:**

```
before  5af5709          freeze 80-280ms, median 120ms   5 of 5 runs, 0 excluded
after   31e9c3e onward   NO PLATEAU FOUND               0 of 5, 0 vacuous, windows sound
```

⛔ **THIS KILLS "THE DETECTOR CANNOT SEE THIS FREEZE" as the explanation for the head-build zeros —
and with it the "band / tolerance / window fault" that THE LAST THREE HANDOFFS called the path to
admissibility.** The same detector resolved a plateau on every run of the before arm.
**There was never a band fault.**

### ⚠ THE ROUTE, because a checkout does not work

`npm run verify` does not exist at `5af5709` and `verify/run.mjs` postdates it — **a checkout takes
the front door away along with the product**, and the arm's own measure script is the pre-repair
version.

✅ **A DETACHED WORKTREE at `5af5709`**, `npm ci`, built and served on :3100 **there**, measured with
**HEAD's instruments run from the main tree**. *The product is the arm; the instrument must be
constant.*

⛔ **NEVER `git checkout <sha> -- components/ app/`.** That makes a tree that never existed as a
commit — which is why the 10 August *"hover work exonerated at 626ms"* figure is disputed.

⚠ **PROVE THE SERVER IS THE ARM BEFORE FILMING.** A server can outlive its source. Check the PID
holding 3100 and read its command line — it must resolve inside the worktree path.

### ⛔ WHAT THE EXPERIMENT DOES NOT SETTLE — same breath, not a footnote

- **THE FLOOR IS ~120ms** (three frame intervals at 25fps). **Run-02 came in at 80ms on a build
  where the freeze is REAL, and would have been MISSED — one run in five.** "Gone" and "under
  ~120ms" are one reading, and a not-found verdict cannot separate them.
- ⚠ **CARL: THE STALL WAS ONCE MID-REVEAL AND MOVED UNDER AN ATTEMPTED FIX.** This is **contention
  being rescheduled, not a fixed-position fault.** A freeze outside the anchored window would not be
  seen at all. ⚠⚠ **So "the stall" may have covered MORE THAN ONE OBSERVATION all along** — treat
  the name as a label for a symptom, not for a mechanism.
- **THE SUBJECT IS UNSTABLE: a 200ms spread on a 120ms median.** The freeze varies by more than its
  own median, one build, one session, nothing changed. ⛔ **Two figures differing by 200ms are not
  evidence of a change.**

---

# THREE INSTRUMENT COMMITS — all one file, `verify/reveal-stall-measure.mjs`

**`031c207` — not-found encodes as a null, not the number zero.**
`best=0`/`bestAt=-1` printed as `freeze 1f ~0ms at f-1 t=-0.04s ... ink undefined` **and passed the
`r.ms !== null` filter**, so five non-detections aggregated into a reported **"spread 0ms"**.
⚠ **A real one-frame plateau is `best=1` and prints `2f ~40ms` — there was never a collision to
preserve.** The distribution now prints its denominator with the two exclusion reasons separated.

**`8f5a259` — the verdict reports what was found instead of asserting the stall is live.**
⚠⚠ **THERE WERE TWO NOT-FOUND PATHS, NOT ONE.** The brief named only the below-floor branch; the
**all-not-found branch** (`good.length === 0`) said *"NOTHING MEASURABLE. Not a clean verdict — a
broken one"* — **and that is the path the head batch actually takes.** Fixing only the named branch
would have left the head arm still reporting a broken instrument.
⛔ **Found by the instruction to re-run the FAILURE case, not by reading the diff.**

**`652d368` — `observedSpread` recorded, with `build: 5af5709` IN THE DATA.**
One unlock of `verify/proven.json`, removed at the end, and **the lock re-confirmed by observing a
real denial** — not assumed.
⚠⚠ **`chunk-scope.json` IS GITIGNORED, SO `git status` CAN NEVER CATCH AN UNLOCK LEFT OPEN.**
**Removing it is the only control there is.**

---

## STILL OPEN

- **Proving `reveal-stall-measure.mjs`** — the obvious next move. ⚠ **A matched pair of batches now
  sits on disk** (one with a freeze, one without), which makes a red run straightforward.
- **`open-defects.md`, three entries** — two are design questions for Carl, one is
  **report-do-not-fix**, and **ANCHOR-STALE carries a line number that shifts with every edit above
  it.**
- **Live tuning doors, all still in the build:** `?tealstrength=`, `?inklift=`, `?acklead=` — pair
  with `?skip=1`, which mounts the completion state directly.
- **`current-sprint.md` lines 325/329** claim *"83 of this repo's 144 commits"* while the branch is
  well past that. ⚠ **Left alone deliberately** — it sits inside a decided direction about splitting
  the repo that nobody has re-read.

---

# ⚠⚠ THE ARCHITECT'S ERRORS TODAY — ONE ERROR, NOT THREE

**The prediction:** the before-arm freeze would be near **680–760ms**. **It was 120ms.**

⛔ **`31e9c3e`'s OWN COMMIT MESSAGE records `median 140ms, range 80-160` — readable by anyone before
a prediction was made.** The 680–760ms figure came from a summary of a different measurement.

⚠ **SAME ERROR AS THE BEZIER FIGURES, AND AS THE COMMIT COUNT TWICE:** *a number carried from a
summary instead of from its source.* ⛔ **TREAT ARCHITECT FIGURES AS PREDICTIONS AND CHECK THEIR
SOURCE.** The Builder read that commit message during the task and noted the discrepancy **without
letting it move the prediction** — noticing is not the same as acting on it.

---

## ENVIRONMENT TRAPS

- **Production is the verdict**; dev and production disagree.
  `npm run build && npx next start -p 3100`.
- ⚠ **A SERVER CAN OUTLIVE ITS SOURCE.** **`rm -rf .next` and rebuild when a probe has been in.**
- ⚠ **Playwright's pointer stays where the last action left it.** **Park it (`mouse.move(10,10)`)
  before capturing an idle state.**
- ⚠ **Card hover is DOM divs (`[data-testid="answer-card-hover-N"]`), not the canvas.**
- ⚠ **`TaskStop` reports success on a held port. Kill by PID, confirm free** — LISTENING only;
  `TIME_WAIT` is not a held port.
- ⛔ **`canvas.__r3f` IS UNDEFINED ON PRODUCTION BUILDS.**
- ⚠ **No backticks in comments inside the shader template literals** — it closes the string and the
  build stops.
- **Bash heredoc patches have silently no-opped and stripped regex backslashes.** ⛔ **Grep the file
  after every scripted edit.**
- ⚠⚠ **NEW — `git worktree remove` CAN FAIL ON "Filename too long"** under `node_modules`, **pruning
  the registration while leaving the directory on disk.** ⛔ **Re-check the disk; do not trust the
  command's output.** `robocopy /MIR` from an empty directory clears it.
- ⚠⚠ **NEW — the `before-5af5709` films are under gitignored `verify/out/` and are NOT BACKED UP.**
  They are half of the matched pair above. Losing them costs a worktree rebuild to recreate.
- ⚠ **`chunk-scope.json` does not currently exist — no unlocks are live.**
- ⚠ **Nothing is running on 3100.**

---

# ⚠⚠ THE DAY'S BLIND SPOT — READ THIS BEFORE TRUSTING TODAY'S REASONING

**EVERY REAL FINDING TODAY CAME FROM RUNNING THE FAILURE CASE, NOT FROM REASONING ABOUT IT.**

| what was believed | how it actually fell |
|---|---|
| the head zeros meant a **band/tolerance/window fault** | **the before arm measured a freeze** with the same detector |
| the sentinel collapsed (a) one-frame plateau and (b) nothing-found | **traced the loop** — `best=1` prints `2f ~40ms`; they never collided |
| there was **one** not-found path to fix | **re-ran the failure case** — the head batch takes a different branch |
| the freeze was near **680–760ms** | **measured** — 120ms, and the figure was in `31e9c3e`'s own message |

⛔ **Four beliefs, four refutations, NONE of them by argument.** The pattern from the previous
handoff held for a second day: **the checking step is what works.** Do not skip it because a
hypothesis sounds well-founded — every one of these did.

---

## TODAY — THREE COMMITS IN THIS SESSION, TEN ON THE DAY

> ⚠ **THE HEAD SHA BELOW IS ALWAYS AT LEAST ONE BEHIND** — a file cannot name the commit that
> contains it. **Run `git log --oneline -8`. Do not trust this line.**

**This session's three**, head at `652d368`, tree clean, all pushed and confirmed by `git ls-remote`:

```
031c207  fix    not-found encodes as null, not as the number zero
8f5a259  fix    the verdict reports what was found; it no longer asserts its subject
652d368  verify observedSpread — measured on 5af5709, not on head
```

⚠ **`git log --since` on 21 August returns TEN, not three.** The other seven (`80cf796` … `6eb9781`,
all before 12:12) are the **previous** session's governance work, already described in the handoff
this file replaces. **Counted from `git log`, not from a brief** — yesterday a briefed count of five
was really six.

---

*21 August 2026. **The first admissible harness in this project's history; the instrument behind its
numbers still unproven; and a band fault that three handoffs chased and that never existed.***
