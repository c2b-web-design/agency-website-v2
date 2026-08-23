# Session Handoff — 23 August 2026. Every correction went stale by the pass it authorised.

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

# ⛔⛔ TWO CONTROLS BLOCK BY DEFAULT. BOTH ARE THE CONTROL WORKING.

> ## 1. EDITS — `SCOPE GUARD: '<path>' is PERMANENTLY PROTECTED`
>
> Paths in `.claude/protected-files.json` (**25 of them**), locked on every `Edit`/`Write`/`NotebookEdit`.
> ⚠ **`CLAUDE.md`, `verify/proven.json` and `verify/run.mjs` are among them.** Unlocking needs Carl
> naming that exact path under `"unlocked"` in `live-work/chunk-scope.json`. Never a folder, never a
> glob. **Remove the unlock when done and re-verify the path locks again by observing a real denial.**
>
> ⚠ **`chunk-scope.json` DOES NOT CURRENTLY EXIST — no unlocks are live.** Verified at session end.
> **It was opened once today for `CLAUDE.md`, removed, and the lock re-confirmed by a real denial.**
>
> ## 2. VERIFY — `VERIFY FRONT DOOR: ... skips the verdict gate`
>
> **Calling a harness directly with `node` is DENIED on the Bash tool.** Use
> **`npm run verify -- <script.mjs>`**. ⚠ It fires on `node --check` too, and on a `grep` whose
> *search string* contains the verify path — a false positive, not a bug. Reword the search.

⛔ **A denial is not a bug. Do not diagnose it, and DO NOT ROUTE AROUND IT WITH A SHELL.** Both hooks
run on tool calls only; `sed -i`, redirect, `mv`, `cp`, `rm` bypass them entirely. **What catches a
shell write is the diff — a reviewer, not a mechanism.** Stop and ask Carl.

---

# ⛔⛔ THE HEADLINE — ONE FINDING, NOT THIRTEEN COMMITS

## ⚠⚠ EVERY CORRECTION THIS SESSION WENT STALE BY THE PASS IT AUTHORISED.

**D-057 named eleven sites that still required the component doc. The pass closed them. D-057 then
became the last file in the repo claiming they were open** — and had to be amended by the work it
had authorised (`024640b`).

**Same shape, earlier the same day:** the warm-up correction landed in `current-sprint.md` while
**D-046 and D-048 went on asserting the old claim** for three more tasks.

⛔ **FOUR DEMONSTRATIONS IN ONE SESSION of the gap D-048 names** — a fact established in one place
and never propagated to where a reader arrives. **Nothing requires a record to be written back.**

> ### ⚠ A SECOND SHAPE, DIFFERENT, AND WORTH LOOKING FOR SEPARATELY
>
> **D-046's status line said APPROVED while its own body, four paragraphs below, said *"NOT
> ELIMINATED, AND NOT RECORDED AS FIXED."* For a fortnight.**
>
> ⛔ **NO CROSS-FILE SWEEP CATCHES THAT.** It is a contradiction *inside one entry*. The propagation
> fault needs a sweep; this one needs reading the entry to its end.

---

# WHAT WAS RULED — each points at its entry, none re-argued here

## ⛔ D-057 — "done" is Carl's listen-back

**A component is complete when Carl has looked at the element and visually confirmed it looks
correct — his listen-back, in the DAW sense — and the verdict is recorded:** reasoning in a
`decisions.md` entry, binding constraints in load-bearing code comments, a `live-work/` measurement
record where one applies.

⛔ **The component-doc requirement is RETIRED.** ⚠ **A review entry is one place the verdict may
live, not a separate requirement.**

> ### ⚠⚠ CARL'S SCALE — RECORD THE VERDICT AT THE LEVEL IT WAS GIVEN
>
> | what he says | what it means |
> |---|---|
> | *"it looks pretty clean"* or any vague phrase | **IMPROVED BUT NOT FINISHED** |
> | *"good"* | **approved** |
> | effusive praise | **it exceeded expectation** |
>
> ⛔ **D-046 RECORDED *"pretty clean"* AS APPROVED.** That promotion is the failure the clause
> exists to prevent. **Quote the verdict; do not upgrade it.**

## D-056 — the card exit, and the principle that existed nowhere

**The cards leave as a compressed reversal of their arrival.** Built 18 August (`d008b4d`,
`c831bf9`, `387653a`); approved 23 August — *"I am more than happy with how it turned out."*
**Review: R-019.**

⛔ **THE ASYMMETRY IS DELIBERATE.** On arrival the ladder is slower **because the user has to examine
the questions**; on next step the answers **have done their job**, so it is a better design decision
to move on faster. ⚠ **A reader seeing ~425ms out against 2000ms in could try to "correct" it toward
symmetry. Do not.**

⚠ **425ms (`CARD_EXIT_DURATION_MS`) IS THE ONE CHOSEN NUMBER** — gap 119ms and span 901ms **derive**
from it and `CARD_OVERLAP`. ⛔ **Do not hand-type a ladder to compensate.**

## D-046 closed — ⛔ SUPERSEDED, NOT FAILED

The 900ms warm-up overlap is **gone from the build** (`WARMUP_OVERLAP_MS`, `warmupHeldOver` removed;
four tombstones remain). ⛔ **Not because it did not work — it improved the reveal.** D-048's shared
host made it unnecessary: one context that never unmounts leaves nothing to hold over.

⚠ **TRAP: `CARD_OVERLAP = 0.72` is LIVE and UNRELATED** — the ladder's stagger, not the hold-over.

## D-048 — the shared host is authorised as built

**Carl's ruling, 23 August.** ⛔ **A judgement made on 23 August, NOT a recovered memory of
12 August** — nobody can point to the moment, and the entry does not claim one.

## Rule 7 amended in place

⚠ **It now declares what does not enforce it — the only rule in the set that does.** Both hooks are
`PreToolUse`; they fire on an edit *happening*, and the failure mode is an edit that never happens.
**A hook cannot fire on an absence.**

⛔ **DO NOT RENUMBER ANY RULE. Rules 1, 5, 6, 8 and 9 are cited by number from other files.** Rule 7
is cited by number nowhere — verified by two independent sweeps.

---

# STILL OPEN

- ⛔ **THE WRITE-BACK GAP** — D-048, **five citing entries, four demonstrations, no holder.** Nothing
  requires an authorisation or a verdict to reach the record when Carl gives one.
- **`components/enquiry-opening.md`** — describes the **primary component of `/start`**, **reads as
  current**, and stops at **D-033**. The whole D-046 → D-056 layer is absent; content last updated
  22 June; **two contradicting "Known Issues" sections** disagreeing on F-007.
- **The 758ms attribution** — contested in `decisions.md` (D-046, D-048) and `current-sprint.md`,
  adjudicated in neither. ⚠ **The 13 August finding disputes the MECHANISM, not just the magnitude:**
  both halves reproduce (106ms vs 1353ms) but disabling the disk cache costs 53ms *with* the warm-up
  and **nothing at all without it**. ⛔ **The gap is real; the explanation is what is disputed.** Not
  a number swap.
- **`ai-roles.md:448`** — footer still reads `Last updated: 2026-08-13`.
- **The exit's cubic ease-in** — the spec left curve assignment open for Plan Mode. **Built, never
  put to Carl.** Inside what he approved by eye, so not a defect.
- ⚠ **THE NUMBERING CHECK** — a check that a new `D-###`/`R-###` does not collide and follows the
  highest existing number is **cheap, buildable, and would have caught this session's R-013 error.**
  The one holder today's work proved both needed and easy.

---

## ENVIRONMENT TRAPS

- **Production is the verdict**; dev and production disagree. `npm run build && npx next start -p 3100`.
- ⚠ **A SERVER CAN OUTLIVE ITS SOURCE.** `rm -rf .next` and rebuild when a probe has been in.
- ⚠ **Playwright's pointer stays where the last action left it.** Park it (`mouse.move(10,10)`).
- ⚠ **Card hover is DOM divs (`[data-testid="answer-card-hover-N"]`), not the canvas.**
- ⚠ **`TaskStop` reports success on a held port. Kill by PID, confirm free** — LISTENING only;
  `TIME_WAIT` is not a held port.
- ⛔ **`canvas.__r3f` IS UNDEFINED ON PRODUCTION BUILDS.**
- ⚠ **No backticks in comments inside the shader template literals** — it closes the string.
- **Bash heredoc patches have silently no-opped and stripped regex backslashes.** ⛔ **Grep the file
  after every scripted edit.**
- ⚠⚠ **A HEREDOC APPENDS LF INTO A CRLF FILE.** Every `.md` here is CRLF. Normalise after appending,
  or the file goes mixed. **Caught this session on `decisions.md`.**
- ⚠⚠ **`tail` ON A REVERSE-CHRONOLOGICAL FILE SHOWS THE OLDEST ENTRIES.** `review-log.md` runs newest
  first. **This is how R-012 was read as the highest when the log ran to R-018** — and a duplicate
  R-013 was nearly written. **Sort, do not tail.**
- ⚠⚠ **`git worktree remove` CAN FAIL ON "Filename too long"** under `node_modules`, pruning the
  registration while leaving the directory on disk. ⛔ **Re-check the disk.**
- ⚠⚠ **`jq` IS NOT INSTALLED, and NEITHER IS `python`.** Use `node -e`. A parse "error" may be that.
- ⚠⚠ **The `before-5af5709` films are under gitignored `verify/out/` and are NOT BACKED UP.**
- ⚠ **Nothing is running on 3100.**

---

# ⚠⚠ THE BLIND SPOT — READ THIS BEFORE TRUSTING A NUMBER

## ⛔ THE ARCHITECT'S FIGURES AND PATHS WERE WRONG SIX TIMES IN TWO DAYS.

| the claim | what it actually was |
|---|---|
| the freeze near **680–760ms** | **120ms** — `31e9c3e`'s own commit message said median 140 |
| `project-intelligence/README.md` | **does not exist** — the table is in `ai-system/README.md` |
| **one** not-found branch | **two** — the head batch takes the other one |
| the review log stops at **R-012** | **R-018** — a `tail` of a reverse-chronological file |
| the exit's **500 / 140 / 1060ms** | **425 / 119 / 901** — the spec's were candidates, tuned down |
| **D-044 and D-045** as judged-by-eye evidence | **PROVISIONAL** and **SPECIFIED, NOT BUILT** |

⚠ **EVERY ONE WAS CAUGHT BY CHECKING AT SOURCE — never by reasoning about it.** Two of the six were
the Builder's own, carried from a summary instead of from the thing itself.

⛔ **TREAT ARCHITECT FIGURES AND PATHS AS PREDICTIONS AND CHECK THEIR SOURCE.**

---

## COMMITS — THIRTEEN THIS SESSION

> ⚠ **THE HEAD SHA BELOW IS ALWAYS AT LEAST ONE BEHIND** — a file cannot name the commit that
> contains it. **Run `git log --oneline -15`. Do not trust this line.**

**Head at `024640b`** before this handoff, tree clean, all pushed and confirmed against the remote
with `git ls-remote`. **Counted with `git log ed86d7d..HEAD`, corroborated by `git log --since`;
both give 13.** ⚠ **The incoming handoff `ed86d7d` is the PREVIOUS session's and is not counted** —
it was miscounted as this session's twice during the day.

```
ff8293b  docs   CLAUDE.md — the anger is evidence; the path count reworded out
7899725  docs   ai-roles.md — pointer to founder-override-protocol §0a
ff6153d  docs   current-sprint.md — the warm-up paragraph is superseded
cd2c028  docs   D-048's warm-up bullet — a scoped marker
675e849  docs   D-048 — the shared host authorised as built
7fa62a0  docs   D-046 CLOSED — superseded, not failed
67ee543  docs   D-056 — the card exit
366bb78  docs   R-019 + the sprint entry — one event, two files
90dd671  docs   D-057 — "done" is Carl's listen-back; D-009 amended
3925418  docs   D-009 points at D-057
5298916  docs   the five INSTRUCTING sites match D-057
8bee6e9  docs   the ten DESCRIPTIVE sites — components/ is an archive
024640b  docs   the eleven are done — D-057 and D-009 catch up
```

---

*23 August 2026. **Thirteen commits, one finding: a record without a write-back holder corrects
itself into staleness, and the correction is the last thing left asserting the error.***
