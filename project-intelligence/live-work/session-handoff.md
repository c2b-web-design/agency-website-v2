# Session Handoff — 23 August 2026. A credential is off the disk and not yet revoked.

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
> ⚠ **`chunk-scope.json` DOES NOT EXIST — no unlocks are live.** Verified at session end.
>
> ## 2. VERIFY — `VERIFY FRONT DOOR: ... skips the verdict gate`
>
> **Calling a harness directly with `node` is DENIED on the Bash tool.** Use
> **`npm run verify -- <script.mjs>`**. ⚠ It fires on `node --check` too, and on a `grep` whose
> *search string* contains the verify path — a false positive, not a bug. Reword the search.
> **It fired on `node --check` this session; the script was not linted that way and was not routed around.**

⛔ **A denial is not a bug. Do not diagnose it, and DO NOT ROUTE AROUND IT WITH A SHELL.**

---

# ⛔⛔ FIRST ITEM IS AN ACTION CARL OWES, NOT A FINDING

## ⚠⚠ THE CODEX CREDENTIAL IS OFF THE DISK AND **NOT REVOKED**

`~/.codex/auth.json` (4,312 bytes) held a live OAuth set — `id_token`, `access_token`, a
**196-character `refresh_token`** — plus an `OPENAI_API_KEY` entry, in plaintext, for a
**cancelled** account. **It was deleted 23 August 2026. No backup was taken, deliberately** — a
copy of a credential is the same exposure in a second place.

⛔ **DELETION IS LOCAL. THE TOKEN IS STILL VALID ON OPENAI'S SERVERS.** The refresh token, and
anything minted from it, stays live until Carl acts:

1. **Revoke the API key** — OpenAI account → Settings → API keys.
2. **Sign out of all sessions** — Settings → Security → log out of all devices.

⛔ **CANCELLING A SUBSCRIPTION IS NOT REVOCATION.** ⚠ **IF THIS IS STILL OUTSTANDING, RAISE IT
AGAIN AT THE TOP OF THE NEXT SESSION. It is the only open item with a clock on it.**

---

# COMMITS — FOUR THIS SESSION

> ⚠ **THE HEAD SHA BELOW IS ALWAYS AT LEAST ONE BEHIND** — a file cannot name the commit that
> contains it. **Run `git log --oneline -10`. Do not trust this line.**

**Head at `4c61517`** before this handoff, tree clean, all four pushed and confirmed against the
remote with `git ls-remote`. **Counted with `git log 5fd522f..HEAD`, corroborated by `git log
--since`; both give 4.** ⛔ **`5fd522f` is the PREVIOUS session's handoff and is the boundary — it
is NOT a member of this session's four.** That error was made twice before.

### `e938b7b` — `verify/entry-numbering.mjs`

Answers *what is the next free D-/R- number* before an entry is written. ⛔ **A LOOKUP, NOT
EVIDENCE. No red run against a real defect; NOT in `proven.json`; the gate suppresses its PASS and
prints NO VERDICT. That is correct — do not add it.**

⚠ **Three load-bearing choices, each measured:** the end-anchored pattern `^## [DR]-\d{3}(?![-\w])`
(`open-defects.md` carries `## D-051-A11Y`, which a bare pattern reads as a duplicate of D-051);
scope to the **two canonical files only** (`session-handoff.md` carries `## D-0xx` headings and is
rewritten every session — a repo-wide scan would fire every time); and **per-file direction** —
`decisions.md` ascends, `review-log.md` descends.

⚠⚠ **IT FOUND THE DIRECTION BUG IN ITS OWN TEST HARNESS.** The gap injector bumped the last entry
in *file order*, which in the descending review-log is R-001 → R-003, colliding with the real
R-003. **The instrument reproduced the exact fault it exists to prevent.** Also caught: its
empty-input control printed an absence then exited 0 with ✅ PASS — the quiet zero, defect #12.

⛔ **IT REPORTS GREEN ON ALL FOUR OF THE 23 AUGUST STALE CORRECTIONS.** Every one was correctly
numbered. **It holds a clerical convention and nothing more.**

### `f1ab714` — **D-058. ⛔ THIS IS THE ONE TO READ.**

Carl's account of how work is authorised, iterated and closed. Three parts, one account.

- ⛔ **There is no single moment of authorisation to capture.** Discuss with the Architect → plan
  with the Builder → back to the Architect → **and then Carl reserves the right to iterate while
  looking at the result.** The card exit is the worked case: all cards fading together → a fade →
  reversing it. **None of that was in the plan.** *It pays to be flexible.*
- ⛔ **"Done" is Carl confirming by eye, and the verdict recorded AT THE LEVEL IT WAS GIVEN.**
  ⚠ **EVERY SECTION STAYS OPEN UNTIL HE EXPLICITLY DECLARES IT CLOSED.** **Built + approved by eye
  + recorded ≠ CLOSED.** D-046 was wrong twice: it promoted *"pretty clean"* to APPROVED, **and it
  recorded a completion at all** while the enquiry corridor was open — and it is open now.
  ⚠ Recorded as **undecided**: the logo top-left in client info, with the orbital light glinting
  off it, real or faked.
- ⛔ **A BRIEF CARRIES WHAT THE SECTION DESCENDS FROM AND WHAT IT INHERITS — AND NOTHING ABOUT HOW
  THE PARENT WAS BUILT.** Client info descends from the Q+A, which descends from the Hero; knowing
  that is what let the Builder interpret intent rather than implement literally. ⚠ **Lineage is one
  or two sentences and is STABLE; implementation is neither. The thing safe to share early is
  exactly the thing useful early.**

⚠ **What it means for D-048:** the general form is **D-057 being followed** — the record is written
when the work is **finished**, not when it was authorised to begin. **No holder is possible, and the
entry says so on its face:** nothing in a tool call sees a conversation, an iteration, or a decision
to close a section.

### `a70011b` — `project-intelligence/evidence/`

The surviving GSD settings file moved into the repo. ⚠ **`.gitattributes` pins it with `-text`:**
this repo runs `core.autocrlf=true`, which would rewrite its LF endings on checkout — 2,891 bytes
becoming 3,000 — and **its own recorded SHA-256 would stop verifying on a fresh clone.**
Round-trip verified through the remote: byte-identical.

### `4c61517` — D-037's backup line corrected

A **scoped blockquote**, not an in-place rewrite (P4 — dated entries keep their wording; matches the
two D-028 precedents). ⚠ **The hash written into the entry verifies against the artefact** —
checked on disk and again as stored on the remote.

---

# GSD — ⛔ CLOSED

**266 of 267 files deleted** (2,720,154 bytes); the four `.claude.json` skill counters removed; the
backup folder gone. **Nothing GSD is registered anywhere.**

⛔ **THE SURVIVOR IS EVIDENCE, NOT RESIDUE.**
**`project-intelligence/evidence/settings-before-gsd-removal-2026-07-27.json`** — 2,891 bytes, the
**SOLE surviving copy** of the nine-registration table. **Not reconstructible** — global settings
live outside the repo and were never version-controlled. **Two records rest on it:** D-037's table,
and `live-work-protocol.md` §3b's worked example, **which is the evidence for a governance rule
about deferral, not a file count.**

⚠ **D-037's 246 / 12 / 6 / 267 counts are now ATTESTED, NOT FALSIFIABLE** — verified twice
(27 July, and again 23 August immediately before deletion), matched exactly both times, **and
unrepeatable.** The nine registrations are the one claim that stays checkable, which is why that
file was the one kept.

⚠ **NOT TOUCHED, and deliberately:** the GSD passthrough inside
`~/.claude/hooks/c2b-context-statusline.js` — **live, registered, runs every session**, but inert
(its `existsSync` guard finds nothing). **Editing it is live config and a separate decision.**

---

# CODEX — SURVEYED, ONLY THE CREDENTIAL ACTED ON

⛔ **Nothing is live in Claude Code:** no MCP entry (all three `mcpServers` blocks empty), no hook,
nothing read at session start, no `.mcp.json`. ⛔ **Repo and git history are CLEAN of credentials —
`auth.json` was never committed, no `.codex/` path was ever tracked, and all four `-S` probes
return zero.** ⚠ Two token-shaped hits were investigated and are false positives: a 77-char base64
fragment inside `c2b-logo-gold-hero.svg`, and six short `eyJ` fragments in `logs_2.sqlite` (25–102
chars; a real JWT here would be 700+).

**~2.8 GB sits inert on disk** — `~/.codex` (953 MB), `~/.cache/codex-runtimes` (1,032 MB),
`AppData\Local\OpenAI` (776 MB), plus `Documents\Codex`.

## ⚠ THREE THINGS AWAIT CARL — none touched

- ⛔ **Four PNGs at `~/.codex/generated_images/019fb2e1-…`** — 30 July 2026, ~4.5 MB, **blue/indigo
  card and button material studies** on near-black. ⛔ **A DIFFERENT SESSION FROM THE 24 JULY
  SALVAGE AND SIX DAYS LATER — never in its scope.** No hash matches anything in `brand-assets/`.
  ⚠ **The salvage record's "complete set" claim was true on 24 July and is not now.**
  ⚠ **Possibly work product, given the logo work ahead.** Not categorised on purpose.
- **`Documents\Codex`** — **66,526 files, 10 dated session dirs (31 May → 30 July)**: the former
  Architect's own history. **27,464 of those are a disposable `.pnpm-store`;** the rest is unread.
- **`codex-pasted-text-archive`** (128 UUID-named `.txt`) and **`memories_1.sqlite`** — unread,
  **possibly briefs or requirements Carl pasted in.**

⚠ **The salvage that DID happen is verified:** commit `0c1b802` names it — *"salvage C2B logo assets
from Codex before removal"*, 14 files from `~/.codex/generated_images/019e7de9-…`, `cmp` 14/14.
**The prose records only ever say "an external AI image tool"; the git history is what names Codex.**

---

# STILL OPEN

- ⛔ **D-048's PROPAGATION HALF — NOW AT FIVE RECORDED INSTANCES.** A correction lands in one file
  while its source stands unmarked. The fifth is D-037's own backup line, stale the moment the
  files went. **D-058 answers the other half; this half has no holder.**
- **`components/enquiry-opening.md`** — describes the **primary component of `/start`**, **reads as
  current**, stops at **D-033**. The whole D-046 → D-056 layer is absent; content last updated
  22 June; **two contradicting "Known Issues" sections** disagreeing on F-007.
- **The 758ms attribution** — contested in `decisions.md` (D-046, D-048) and `current-sprint.md`,
  adjudicated in neither. ⚠ **The 13 August finding disputes the MECHANISM, not just the
  magnitude:** both halves reproduce (106ms vs 1353ms) but disabling the disk cache costs 53ms
  *with* the warm-up and **nothing at all without it.** ⛔ **The gap is real; the explanation is
  what is disputed.** Not a number swap.
- **`ai-roles.md:448`** — footer still reads `Last updated: 2026-08-13`.
- **The exit's cubic ease-in** — the spec left curve assignment open for Plan Mode. **Built, never
  put to Carl.** Inside what he approved by eye, so not a defect.
- ⚠ **`live-work-protocol.md` §3b does not name `evidence/`.** It cites the finding, not the path,
  so nothing is broken — but it is the same one-directional gap in a second place. **Carl's call.**

---

# ⛔ NEXT — AND IT IS WHAT GATES BUILDING

**Carl's stated sequence:** the remaining governance work → **a session on how his working process
with the Architect and the Builder can be improved** → **he explicitly restarts building.** Not
before, and not in any other order.

⛔ **BUILDING IS PAUSED** — reaffirmed 21 August. **New building only**; governance, tooling,
documentation corrections and fixes to existing faults have continued throughout and do not need the
pause lifted. ⚠ **RECENT COMMITS ARE NOT EVIDENCE THE PAUSE HAS LAPSED.**
⛔ **NO CHUNK IS AUTHORISED, and that is the permanent arrangement, not a pause condition.**

---

## ENVIRONMENT TRAPS

- ⚠⚠ **AUTO MODE MAY STEER TOWARD `Bash` FOR FILE EDITS. ⛔ BOTH HOOKS FIRE ON TOOL CALLS ONLY**, so
  `sed -i`, redirects, `mv`, `cp`, `rm` and heredocs **bypass the scope guard entirely on all 25
  protected paths.** ⛔ **READ through Bash freely; MODIFY through `Edit`/`Write` ONLY.** What
  catches a shell write is the diff — a reviewer, not a mechanism.
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
- ⚠⚠ **A HEREDOC APPENDS LF INTO A CRLF FILE.** Every `.md` here is CRLF. Normalise after appending.
- ⚠⚠ **`tail` ON A REVERSE-CHRONOLOGICAL FILE SHOWS THE OLDEST ENTRIES.** `review-log.md` runs newest
  first. **Sort, do not tail** — or run `npm run verify -- entry-numbering.mjs`.
- ⚠ **`run.mjs` CLASSIFIES ANY LINE STARTING WITH ⛔ AS A FAILURE MARKER, even on exit 0.** An
  explanatory ⛔ at the head of a line will make a clean run print "⛔ FAILURE". Keep it mid-line.
- ⚠⚠ **`git worktree remove` CAN FAIL ON "Filename too long"** under `node_modules`. ⛔ **Re-check disk.**
- ⚠⚠ **`jq` IS NOT INSTALLED, and NEITHER IS `python`.** Use `node -e`. A parse "error" may be that.
- ⚠ **Node resolves `/tmp` as `C:\tmp`; Bash does not.** A file written by one is not found by the
  other. Pipe through stdin, or use a Windows path.
- ⚠⚠ **The `before-5af5709` films are under gitignored `verify/out/` and are NOT BACKED UP.**
- ⚠ **Nothing is running on 3100.**

---

# ⚠⚠ THE BLIND SPOT — READ THIS BEFORE TRUSTING A NUMBER

## ⛔ ARCHITECT FIGURES AND PATHS HAVE BEEN WRONG SEVEN TIMES IN THREE DAYS.

| the claim | what it actually was |
|---|---|
| the freeze near **680–760ms** | **120ms** |
| `project-intelligence/README.md` | **does not exist** — the table is in `ai-system/README.md` |
| **one** not-found branch | **two** |
| the review log stops at **R-012** | **R-018** — a `tail` of a reverse-chronological file |
| the exit's **500 / 140 / 1060ms** | **425 / 119 / 901** |
| **D-044 and D-045** as judged-by-eye evidence | **PROVISIONAL** and **SPECIFIED, NOT BUILT** |
| the surviving evidence file at **4 KB** | **2,891 bytes** — `du` reported disk-allocated size |

⚠ **EVERY REAL FINDING IN THREE DAYS CAME FROM CHECKING AT SOURCE — never from reasoning about it.**
This session: the nine registrations were re-read from the file before anything was deleted; the
hash was recomputed by two tools before being written into D-037; the commit count was taken from
`git log` twice by different methods; and the four PNGs were **opened and looked at** rather than
inferred from their filenames.

⛔ **TREAT ARCHITECT FIGURES AND PATHS AS PREDICTIONS AND CHECK THEIR SOURCE.**

---

*23 August 2026. **Four commits. A clerical check that caught its own bug, an account of how work
actually gets authorised, an artefact given a home, and a credential taken off the disk but not yet
revoked.***
