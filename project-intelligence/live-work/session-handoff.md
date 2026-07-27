# Session Handoff — Day 3

**Written 27 July 2026, ~16:15 BST. For the Builder session that picks up next.**

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical
(D-006); this file and the repo are. **Delete this file at the end of the session that reads
it, once its replacement is written** — `live-work-protocol.md` §3a.

---

## Where the project is

**BUILDING IS STILL PAUSED.** Carl's instruction of 25 July stands. No chunk is authorised.
Day 3 of a governance rebuild; the subject was the CLI, and it became a security pass.

**Repo:** `main` at `8f7e624` + whatever this session adds, clean, pushed. Lint at the
recorded baseline — 1 accepted `react-hooks/set-state-in-effect` error.

**Ten commits today.** All governance and brand; no application code touched.

---

## ⚠ Two things done but NOT yet recorded — do these first

Both were applied late in the session and are on disk, but nothing in
`project-intelligence/` describes them yet.

### 1. GSD removed from the system — 264 files

Carl installed the third-party **GSD toolkit** from GitHub months ago (v1.40.0, 3 May 2026)
and stopped using it. **It was still running.** Discovered while checking `.claude` configs
for F-3.

It had **8 hook registrations** in `~/.claude/settings.json` firing in the *Builder* seat:
three `PreToolUse` guards on every Write/Edit, an injection scanner on every Read, a context
monitor, a commit validator, and two `SessionStart` hooks. `gsd-check-update.js` ran **at
14:38 today, during this session** — a self-updater pulling from a repo Carl was not
following, in the seat that writes code.

Carl's instruction: *"i dont use gsd anymore and have no plans to do so in the future. wipe
it and its effects from the system without compromising our new setup."*

**Removed:** `~/.claude/get-shit-done/` (246 files), 12 `gsd-*` hook scripts, 6 `gsd-*`
skills, the 8 hook registrations, `~/.cache/gsd/`, `gsd-file-manifest.json`.

**Preserved:** Carl's own `c2b-context-statusline.js` (23 July, his naming, not GSD's) and
its `statusLine` entry; the `npm install` / `npx tsc` permissions; the repo's own
`chunk-scope-guard.js`, untouched.

**Also dropped:** one dead `permissions.allow` rule — a `Rename-Item` for `Logo=Morph.png`
under `agency-website`, a path that no longer exists. Flagged to Carl at the time.

**Backup:** `C:\Users\Carl Buckley\gsd-removal-backup-2026-07-27` — 267 files including the
original `settings.json`. Leave it a week, then Carl's to delete.

**Why it matters beyond tidiness.** GSD is a *competing governance system* — its
phase/plan/execute model ran alongside the chunk → plan-review gate → checkpoint chain, with
its own opinions about when a write was allowed. Some unexplained friction in earlier
sessions may have been its guards.

**Needs writing up** as a `decisions.md` entry, and the GSD warning in
`live-work/references/slash-commands.md` needs updating — the six `/gsd-*` commands are now
gone, so that section describes something that no longer exists.

### 2. `disableAllHooks: true` on the Architect seat — closes F-3

F-3 observed that `launch-architect.cmd` does `cd /d` into the repo, so the Architect loads
the repo's `.claude/settings.json` and its `PreToolUse` hook executing `node` — and **hooks
run outside the permissions system**, so the deny list never governed them.

Two facts settled from the docs, closing questions the Architect could not answer itself:
project hooks are **not** auto-trusted (workspace trust gates them), and **`disableAllHooks`
exists** as a categorical off-switch.

Applied to the Architect seat only. Costs it nothing — the sole hook is the chunk-scope
guard, which blocks out-of-scope *edits*, and that seat makes none. **The Builder's guard is
fully intact.**

⚠ **NOT YET VERIFIED.** Carl restarted the Architect for `DesignSync` but `disableAllHooks`
went in afterwards. **Confirm on next Architect start** that hooks are inactive there and
that the Builder's chunk-scope guard still fires. Recorded as unverified deliberately — the
same E-2 error as this morning would be to assume it works because the docs say so.

**Also needs recording** in `architect-settings.reference.json.md`, which does not yet
mention `disableAllHooks` in its intended-state block or its key table. **The reference is
currently out of sync with the live file** — first drift since it was created.

---

## The Architect seat, as it now stands

| Control | Status |
|---|---|
| `Edit`, `Write`, `NotebookEdit` | Denied |
| `Bash` | Denied — proven bypass, 24 July |
| `mcp__codex`, `mcp__ide` | Denied |
| `DesignSync` | **Denied 27 July** — external write/exfiltration surface |
| `allowedMcpServers: []` | **Added 27 July** — allowlist; nothing MCP unless named |
| `disableAllHooks: true` | **Added 27 July — unverified** |
| Subagent delegation | **Measured 27 July** — inherits the deny list |

Backups: `settings.json.bak-2026-07-27`, `-b`, `-c`. No git history on that file; the
backups are the only undo.

---

## The eight findings — six closed, one open, one flagged

From the Architect's review of `architect-settings.reference.json.md`, recorded in
`live-work/2026-07-27-architect-review-settings-reference.md`.

| | Status |
|---|---|
| F-1 deny list enumerates | ✅ Closed — MCP allowlist, verified either side of a restart |
| F-2 subagent delegation | ✅ Closed — measured, file never appeared |
| F-3 hook surface | ✅ Closed by `disableAllHooks` — **verify** |
| F-4 model pin as state | ✅ Annotated as a request (DL-6) |
| F-5 non-deny keys | ✅ `model`/`effortLevel` marked governance, `theme`/`tui` cosmetic |
| F-6 "may fail open" | ⚠ **Still unverified** — flagged in place with the test that closes it |
| F-7 re-attack only relaxations | ✅ Corrected — re-attack after *every* change |
| F-8 no comparison trigger | ✅ Trigger and per-step owners added |

**F-6 is the one genuinely outstanding item.** To close it: corrupt a copy of
`settings.json`, launch the seat against it, attempt a write. Cheap, and it is load-bearing —
the whole backup convention rests on the claim.

**`DesignSync` was found by none of the eight.** The Architect turned it up while *measuring*
the MCP result. That is the day's strongest argument for measuring over reasoning.

---

## What else was settled today

**CLI ground covered** — the `architect` command (PowerShell profile function, forwards
args); sessions die with the terminal; `clear` vs `compact`; Plan Mode is unnecessary in a
read-only seat; prompts travel Architect → Carl → Builder by paste, then to a file; image
routes; the copy-paste route tested on a real ~100-line payload and passed.

**Two protocol rules written** (`live-work-protocol.md` §7a, §7b): the Architect carries the
design across chunks, the Builder is cleared between them — with the *reason*, so a bigger
context window does not invite the opposite conclusion. Plus the chunk handoff.

**A billed-command rule** in CLAUDE.md, after `/code-review ultra` was triggered during
exploration. Carl: *"I don't want to be billed for a mistake I made, even on exploration."*
Investigation found no evidence it ran. **Two facts worth keeping:** closing a terminal does
**not** cancel a cloud review (it runs server-side; `Esc` is the abort), and the **Builder
install has no `history.jsonl`** — so the seat that can write is the seat with the weaker
audit trail.

**A brand asset rescued** — `c2b-flat-white-alpha-cleaned-1x.png` existed only in
`OneDrive/Pictures/Camera Roll/`, which Carl was about to clear. Now committed. It renders
blank in most viewers (white on transparent); the README says so.

**Pictures is now clear to empty of C2B material** — everything verified in the repo and
pushed.

---

## Standing instructions given today

- **Verify before asserting in a governance file** — now in CLAUDE.md. Root of two logged
  Builder errors (E-2, E-3).
- **Never invoke a billed or destructive command to explore** — now in CLAUDE.md.
- **Self-improvement is a principle Carl follows personally**, not only a requirement on the
  tooling. Mistakes get logged. Note where the analogy stops: nothing carries between Builder
  sessions, so the files are the only place improvement accumulates.
- **Measure, do not narrate.** Twice today a session was confidently wrong about its own
  capabilities (the `mcp__ide` proposal; the subagent's "a shell redirect was probably
  available"). Both retracted under measurement.

---

## Open items

| Item | Owner | Note |
|---|---|---|
| **Write up GSD removal + `disableAllHooks`** | Builder | **Top of next session** |
| **Verify `disableAllHooks` took effect** | Carl + Builder | Needs an Architect restart |
| **F-6** — does a malformed settings file fail open? | Carl to authorise | The one open finding |
| Update the GSD section of `slash-commands.md` | Builder | Those commands no longer exist |
| Which slash commands matter for this workflow | Builder | Carl: *"come back to it in a later session"* — after chunks are flowing |
| Carl's CLI questions — more remain | Carl | *"the CLI questions can wait"* |
| Approve `strategist-role.md` (DRAFT) | Carl | From Day 2 |
| Route the outreach folder to the PM/Architect | Carl | He asked for this explicitly |
| Verify prices + Playwright licence | Carl → Strategist | Research mode |
| `decisions.md` entry for the own-repo rule | Carl | `strategist-role.md` §11 |
| Codex-era `.md` sweep in `live-work/` | Carl + Builder | ~Day 7. **Judgement, not deletion** |
| Codex app removal | Carl | ~14 August. Report before deleting registry entries |
| Cold outreach email drafts | Carl | ⏸ Parked |
| Delete GSD backup | Carl | After a week, ~3 August |

---

## How to work with Carl — carried forward

- **He leads.** Design, chunking and all decisions are his. D-036.
- **Answer execution questions yourself.** Ask only about intent and authority.
- **Do not tell him when to stop working.**
- **Two examples plus the principle** — when something arrives as an example, write the
  principle and mark the example as an example.
- **Music, DAW and production analogies land.** 45 years a musician. His CLI framing:
  *"like working in Pro Tools for years and all of a sudden you have to change to Cubase"* —
  same outcomes, different furniture.
- **No ASCII diagrams or box-drawing characters.**
- **Do not commit or push unless he explicitly asks.**
- **He verifies.** He asked the Architect to check the review-command incident rather than
  accept a reassurance. Give him evidence, not comfort.

---

*Day 3, 27 July 2026. Ten commits, all pushed. The Architect seat is genuinely read-only
now — including outward, which it was not this morning.*
