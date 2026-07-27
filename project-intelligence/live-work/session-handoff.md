# Session Handoff — Day 3

**Rewritten 27 July 2026, ~16:50 BST, replacing an earlier version whose measured detail was
wrong. For the Builder session that picks up next.**

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical
(D-006). **Delete this file at the end of the session that reads it, once its replacement is
written** — `live-work-protocol.md` §3a.

**This file points at records; it does not restate them.** The earlier version restated
measured detail and got it wrong — see §3b, now a rule.

---

## Where the project is

**BUILDING IS STILL PAUSED.** Carl's instruction of 25 July stands. No chunk is authorised.

Day 3's subject was the CLI. It became a security pass on the Architect seat, then a toolkit
removal. **No application code was touched.**

**Repo:** `main`, clean, pushed through `22fffc4`; further changes uncommitted at time of
writing. Lint at the recorded baseline — 1 accepted `react-hooks/set-state-in-effect` error.

---

## What was decided and where it is recorded

**Read the records, not this summary.**

| What | Where |
|---|---|
| GSD toolkit removed in full | **`decisions.md` D-037** |
| Architect seat hardening — `DesignSync`, `allowedMcpServers`, `disableAllHooks` | **`ai-system/architect-settings.reference.json.md`** |
| The eight findings that drove it, and four Builder errors | **`live-work/2026-07-27-architect-review-settings-reference.md`** |
| Two seats, opposite context needs; the chunk handoff | **`live-work-protocol.md` §7a, §7b** |
| Record in the same session as the change | **`live-work-protocol.md` §3b** |
| Slash commands, billed-command caution, seat audit-trail asymmetry | **`live-work/references/slash-commands.md`** |
| Verify before asserting in a governance file; never invoke a billed command to explore | **`CLAUDE.md`** |

---

## ⚠ Outstanding — the two that need action

### 1. `disableAllHooks` — applied, effect NOT verified

The key is in the live Architect settings, confirmed from disk. **No session has yet started
with it in force**, because the restart happened before it was added.

**On the next Architect start:** confirm hooks are inactive there, and that the Builder's
`chunk-scope-guard.js` still fires. Detail in the reference file's `disableAllHooks` section.

### 2. F-6 — does a malformed settings file fail open?

**The only genuinely open finding of the eight.** The claim was written into the reference
without testing, and it is load-bearing — the whole backup convention rests on it.

**The test:** copy `~/.claude-architect/settings.json` to a scratch location, corrupt the JSON,
launch the seat **against the copy**, attempt a write. Needs Carl's authorisation and his hand
on the launch. **Can ride the same restart cycle as item 1.**

⚠ Be certain the seat points at the copy, not the live file. Backups
(`settings.json.bak-2026-07-27`, `-b`, `-c`) are the only undo — that file has no git history.

---

## Standing instructions from this session

- **Verify before asserting in a governance file** — in `CLAUDE.md`. Root of E-2 and E-3.
- **Never invoke a billed or destructive command to explore** — in `CLAUDE.md`.
- **Record in the same session that makes the change** — now §3b. Carl: *"i think its important
  to make changes like this in the same session."*
- **Measure, do not narrate.** Three times in one day a session was confidently wrong about its
  own capabilities or its own record. All three retracted under measurement.
- **Self-improvement is a principle Carl follows personally**, not only a requirement on the
  tooling. Mistakes get logged. Where the analogy stops: nothing carries between Builder
  sessions, so the files are the only place improvement accumulates.

---

## Open items

| Item | Owner | Note |
|---|---|---|
| **Verify `disableAllHooks` took effect** | Carl + Builder | Needs an Architect restart |
| **F-6** — malformed settings file | Carl to authorise | Can share that restart |
| Commit the uncommitted work | Carl | D-037, reference sync, slash-commands, E-4, §3b |
| Delete GSD backup | Carl | After ~3 August |
| Which slash commands matter for this workflow | Builder | Carl: *"come back to it in a later session"* — after chunks are flowing |
| Carl's CLI questions — more remain | Carl | *"the CLI questions can wait"* |
| Approve `strategist-role.md` (DRAFT) | Carl | From Day 2 |
| Route the outreach folder to the PM/Architect | Carl | He asked for this explicitly |
| Verify prices + Playwright licence | Carl → Strategist | Research mode |
| `decisions.md` entry for the own-repo rule | Carl | `strategist-role.md` §11 |
| Codex-era `.md` sweep in `live-work/` | Carl + Builder | ~Day 7. **Judgement, not deletion** |
| Codex app removal | Carl | ~14 August. Report before deleting registry entries |
| Cold outreach email drafts | Carl | ⏸ Parked |

---

## One thing that happened today and is worth avoiding

**Two Builder sessions were open on the same working tree at once.** A second session was
opened to continue the work; both had the same three modified files in Source Control, and
either could have overwritten the other silently. Nothing in the harness prevents it — the
chunk-scope guard stops the wrong *files* being edited, not the same file being edited twice.

It resolved without loss because the second session's work was on disk, not held in its
conversation, and closing a chat does not revert edits. **One Builder at a time on one tree.**

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
- **He verifies.** He had the Architect audit an incident rather than accept reassurance, and
  had a second session audit this handoff rather than trust it. **Give him evidence, not
  comfort** — and expect what you write to be checked.

---

*Day 3, 27 July 2026. The Architect seat is genuinely read-only now, including outward, which
it was not this morning.*
