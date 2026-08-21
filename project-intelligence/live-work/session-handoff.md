# Session Handoff — 21 August 2026. A defect that was never a defect, and an instrument with no green.

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
> **`npm run verify -- <script.mjs>`**. ⚠ It also fires on a `grep` whose *search string* contains
> the verify path — a false positive, not a bug. Reword the search; do not route around it.

⛔ **A denial is not a bug. Do not diagnose it, and DO NOT ROUTE AROUND IT WITH A SHELL.** Both hooks
run on tool calls only; `sed -i`, redirect, `mv`, `cp`, `rm` bypass them entirely. **What catches a
shell write is the diff — a reviewer, not a mechanism.** Stop and ask Carl.

⚠ **THE FRONT DOOR STOPPED AN EXPERIMENT TODAY AND THAT WAS THE RIGHT OUTCOME** — see the before-arm
section. The Builder hit the denial, stopped, and reported rather than reaching for bare `node`.

---

# ⚠⚠ ZERO ADMISSIBLE HARNESSES. 0 of 131. UNCHANGED TODAY.

**`⚠ NO VERDICT` on everything is the HONEST STATE, not a fault.** Nothing in `verify/` can be cited
as evidence. Do not read a green line as a pass.

*(131 verified by `git ls-tree`: 132 `.mjs` files under `verify/`, minus `run.mjs`, which is the
gate itself and not a harness.)*

---

## TODAY — SIX COMMITS. Head `141f67d`, tree clean, pushed and confirmed by `git ls-remote`.

> ⚠ **THE HEAD SHA HERE IS ALWAYS AT LEAST ONE BEHIND** — a file cannot name the commit that
> contains it. **Run `git log --oneline -7`. Do not trust this line.**

```
80cf796  docs   D-055 — the Begin gating is the design, not a defect
50d908f  docs   the timing reference: classification closed, and nothing was ever fixed
9b6bf3f  docs   OPENING-DELAY removed from open-defects.md
9e31801  docs   the sprint's Begin entry said RESOLVED — nothing was ever fixed
e2238c3  docs   the pause stands — scope, reaffirmation, exit sequence
141f67d  docs   a live commit count removed from the pause block
```

⚠ **Six, not five.** The brief for this handoff said five; `80cf796` (D-055 itself, 11:07:20) is
dated 21 August and belongs to today. Counted from `git log`.

---

## ⛔ D-055 — THE BEGIN GATING IS THE DESIGN, NOT A DEFECT

**Carl's ruling, 21 August 2026, on a clean running production build.** The Begin button on
`/start` is **not meant to be immediately clickable.** The radial reveal is correct, and so is its
gating.

⛔ **THIS CLOSES THE STANDING 27 JULY DECISION** that the opening delay was *"the first job when
building resumes"* — **closed, not deferred.** Desktop and mobile need no answer at all.

⚠ **YOU WILL SEE THE DELAY IF YOU LOAD THE PAGE. THAT IS THE DESIGN WORKING**, not evidence that
this is stale. Full ruling and the approved measurements: `decisions.md` **D-055**.

### Four records corrected to match it

- **`live-work/enquiry-opening-timing-reference.md`** — ⚠ **its 28 July "✅ RESOLVED" was ALSO
  false.** Nothing was ever fixed. What happened on 28 July was **Carl being satisfied with the
  button, misfiled as a fix.** Measurements retained; only the classification changed.
- **`open-defects.md`** — OPENING-DELAY **removed**, per the file's own *"Resolved defects are
  REMOVED, not struck through"* rule. Three entries remain.
- **`active-sprints/current-sprint.md`** — two edits: the struck-through Begin entry, and the pause
  block below.

> ### ⚠⚠ A SATISFACTION IS NOT A FIX. FILING ONE AS THE OTHER IS WHY THIS ITEM RETURNED TWICE.
> **"Fixed" is a claim about the build** — it decays, and anyone refutes it by loading the page.
> **"Approved" is a design decision** — observing the delay *confirms* it.

---

## ⛔ THE PAUSE STANDS — reaffirmed by Carl, 21 August 2026

**Covers NEW BUILDING ONLY.** Governance, tooling, documentation and fixes to existing faults are
**not building** and have continued throughout. ⚠ **Commit activity is not a restart.**

**Exit sequence, in order:** remaining governance work → **a session on Carl's working process with
the Architect and the Builder** → **Carl explicitly restarts building.** Not before.

⛔ **"No chunk is authorised" is the PERMANENT ARRANGEMENT, not a dated pause condition.** It does
not expire with the pause. Recorded in `current-sprint.md`.

---

# ⚠⚠ THE Q5 REVEAL STALL IS CLOSED BY CARL'S EYE — AND HAS NO DIAGNOSIS

**Carl walked `/start` on 21 August: the stall is gone.** His own words — **not there, or too small
to see.**

⛔ **NOTHING IN THE RECORD CLAIMS TO HAVE FIXED IT.** `98429af` says explicitly that deleting the
warm-up canvas did **NOT** remove the freeze.

⚠⚠ **THE CLOSURE AND THE ABSENCE OF A CAUSE ARE RECORDED TOGETHER ON PURPOSE. An unexplained
closure is weaker than a diagnosed one, and this defect has returned before.** Do not write it up
as solved.

---

# ⚠⚠ THREE FINDINGS ABOUT `reveal-stall.mjs` — THE MOST REUSABLE PART OF TODAY

**a. ⚠ THE 0ms IS NOT A PROVENANCE ARTEFACT — THE HYPOTHESIS WAS REFUTED BY MEASUREMENT.**
The Architect predicted it was: `proven.json`'s `observedSpread` note went in at **22:42:59**
(`5f43f15`), **eleven minutes before** the silent batch-selection fault was fixed at **22:53:15**
(`e140743`). **Re-measured today** under the repaired script with **explicit** selection — five
films, provenance printed and confirmed, **0ms on all five, spread 0ms.** ⛔ **Record it as
refuted, not as open.**

**b. ⛔ THE INSTRUMENT HAS NO GREEN.** Line 484 states the premise outright — *"the instrument must
go RED on today's build — the stall is live"* — and lines 492–496 fire **unconditionally** when
nothing is found, printing *"the stall is live and filmed… DO NOT report the stall as fixed"* and
exiting 1.

> ### ⚠⚠ AN INSTRUMENT THAT ASSERTS ITS SUBJECT EXISTS CANNOT DETERMINE WHETHER IT EXISTS.
> **There is NO path by which absence is a finding about the subject.** The previous handoff's
> framing — *"the band/window fault is the path to the first admissible harness"* — **rests on that
> hardcoded verdict.**

**c. ⚠ THE SENTINEL PRINTS AS DATA. NOT FIXED — open, and next session's first candidate.**
`best=0` and `bestAt=-1` render as *"freeze 1f ~0ms at f-1 t=-0.04s … ink undefined"*. **`best+1`
makes zero look like one frame; `inks[-1]` is where the `undefined` comes from.** ⚠ **A null in the
shape of a measurement.**

⛔ **THE FLOOR IS ~120ms** — three frame intervals at 25fps. **"Gone" and "under 120ms" are the
same reading, and no band setting changes that.**

---

# ⚠ THE BEFORE-ARM EXPERIMENT — DESIGNED, BLOCKED, REDESIGNED. NOT YET RUN.

**The question:** did **`31e9c3e`** (*one WebGL context for the Next step button*, 18 Aug 22:43)
remove the stall? It landed **after** the red run that certified the instrument and **before** the
19 August films that read 0ms. `5af5709` is its direct parent, 37 seconds earlier.

⛔ **`git checkout 5af5709` DOES NOT WORK.** `npm run verify` does not exist at that commit and
`verify/run.mjs` postdates it — **there is no front door on that arm.** The Architect specified the
route without checking; the Builder **stopped at the denial rather than routing around it.**

⚠ **AND THE ARM'S OWN `reveal-stall-measure.mjs` IS THE PRE-REPAIR VERSION** — measuring with it
would reproduce the exact provenance fault refuted in (a).

✅ **THE ROUTE:** a **git worktree** at `5af5709`, built and served on 3100, **measured with HEAD's
instruments from the main tree.** *The product is the arm; the instrument must be constant.*

⛔ **NEVER `git checkout <sha> -- components/ app/`.** That makes a tree that never existed as a
commit — which is why the 10 August *"hover work exonerated at 626ms"* figure is disputed.

⚠⚠ **THE BUILDER'S ASYMMETRY, WRITTEN BEFORE MEASURING AND STILL UNANSWERED: if the band fault
produces zeros, it produces them on this arm too. Only a NON-ZERO result would be strong. The
experiment is half-powered by construction.**

---

## STILL OPEN

- **The sentinel** (c above) — next session's first candidate.
- **The no-green verdict** (b above) — and what it does to the "path to admissibility" framing.
- **The before-arm experiment** — route agreed, not run.
- **`open-defects.md`, three entries** — two are design questions for Carl, one is
  **report-do-not-fix**, and **ANCHOR-STALE carries a line number that shifts with every edit above
  it.**
- **Live tuning doors, all still in the build:** `?tealstrength=`, `?inklift=`, `?acklead=` — pair
  with `?skip=1`, which mounts the completion state directly.
- **`current-sprint.md` lines 325/329** claim *"83 of this repo's 144 commits"* while the branch is
  at 367. ⚠ **Left alone deliberately** — it sits inside a decided direction about splitting the
  repo that nobody has re-read.

⚠ **ONE MORE, AND IT IS THE ARCHITECT'S OWN.** A **live commit count** was written into the pause
block and removed in `141f67d` — **not because the number was wrong, but because a count decays.**
⛔ **Record the class of error, not the arithmetic.** Same family as *"RESOLVED before 28 July"*: a
claim about the present, written as though durable.

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
- ⚠ **`chunk-scope.json` does not currently exist — no unlocks are live.**
- ⚠ **Nothing is running on 3100.**

---

# ⚠⚠ THE DAY'S BLIND SPOT — READ THIS BEFORE TRUSTING TODAY'S REASONING

**Two Architect hypotheses were put today. Both were refuted — neither by argument, both by
checking:**

| the hypothesis | how it fell |
|---|---|
| the 0ms is a **provenance artefact** | **re-measured** with explicit selection — 0ms held |
| `git checkout 5af5709` is a **workable arm** | **the front door does not exist there** |

⚠ **Neither was caught by better reasoning. One was caught by an instruction to verify before
believing; the other by the Builder stopping at a denial instead of complying.** ⛔ **The checking
step is what worked today. Do not skip it because a hypothesis sounds well-founded — both of these
did.**

---

*21 August 2026. **A defect that was never a defect, closed by ruling; a stall closed by Carl's eye
with no diagnosis; and an instrument that cannot report the absence of the thing it looks for.***
