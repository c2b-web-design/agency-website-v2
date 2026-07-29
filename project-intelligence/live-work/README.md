# Live Work

Temporary shared workspace for active Builder, Architect, and Carl handoff.

Durable project memory does not live here. Generated plans, logs, transcripts, screenshots, and checkpoint files are scratch artifacts used during an active work cycle.

---

## ⚠ Live or closed — check here before acting on anything in this folder

**Added 29 July 2026, after a staleness audit found two files presenting as pending work
that had been finished for a week.** `claude-plan.md` said *"Nothing implemented"* about work
built in `db0dac7`; `checkpoint-request.md` said *"not committed, not pushed"* about
`cb42350`. Both also asked for review from **Codex, which is retired** — its review function
was inherited by the Architect (PM/A).

**The failure was not that the files were old. It was that nothing said which files were
current**, so a reader had to open each one and infer. This index is the fix.

| File | Standing |
|---|---|
| `session-handoff.md` | **LIVE, single-use.** Written at session end, deleted by the session that reads it (`live-work-protocol.md` §3a) |
| `contact-field-gold-and-light-reference.md` | **LIVE reference.** Measured values for the next chunk. Not a plan, grants no authority |
| `contact-form-current-geometry-reference.md` | **LIVE reference** |
| `contact-form-current-timing-reference.md` | **LIVE reference** |
| `enquiry-opening-timing-reference.md` | **LIVE reference** |
| `references/` | **LIVE.** Standing reference material |
| `templates/` | **LIVE.** Copy these when creating live-work files |
| `screenshots/` | **Evidence.** Dated by the work that produced them |
| `current-status.md` | **CLOSED — 24 July.** Carries its own correction box |
| `drift-sentinel.md` | **PARKED by D-039.** `STATUS: CONTINUE` means *no watch runs*, not *watched and clear* |
| `claude-plan.md` | **CLOSED.** Executed in `db0dac7` |
| `checkpoint-request.md` | **CLOSED.** Reviewed, corrected, committed in `cb42350` |
| `architect-review-findings.md` | **CLOSED.** All four findings routed and actioned 24 July. F-1's outstanding q5proto entry was closed by **D-035** (PROVISIONAL) |
| `2026-07-27-architect-review-settings-reference.md` | **CLOSED.** Dated in its filename, per the dating discipline |
| `contact-form-fields-brainstorm.md` | **Exploration.** Thinking, not a decision or a plan |
| `claude-chat-window.md`, `claude-run-log.md` | **Scratch.** Per-cycle working files |
| `claude-context-status.json` | **Generated, gitignored.** Telemetry from the status-line script |
| `chunk-scope.json` | **ABSENT — and that means the scope guard is OFF.** Written when a chunk is authorised; deleted when it closes (`live-work-protocol.md` §8) |

**Rules that follow, and they are cheap:**

1. **A closed file gets a box at the top, not a rewrite.** `context-rules.md` forbids
   retroactive rewriting — the original text stays, marked. History of who found what is
   worth more than a tidy file.
2. **Update this table when a file changes standing.** A file that finishes and is not
   re-marked becomes the next stale anchor.
3. **A recorded next-step is a claim about the present, and it decays.** Confirm it against
   git or the running app before acting on it — reading the code alone will often *confirm*
   a stale record rather than correct it.

`claude-chat-window.md` serves **two jobs**. First, it is the temporary copy/paste replacement for Builder chat-window content — the Builder writes the relevant chat output there so the Architect can inspect it from the filesystem without Carl relaying it manually. Second, at a checkpoint review it carries the Builder's **reasoning**, kept deliberately separate from the raw git evidence, so the Architect weighs one against the other rather than taking either on trust. See `ai-system/live-work-protocol.md` §5.

`git-evidence.md` holds raw `diff`, `log` and attribution for the changed work at each checkpoint. The Architect is structurally read-only and runs no `git` itself, so git-dependent findings can only be closed from evidence the Builder supplies. Evidence, not argument. See `ai-system/live-work-protocol.md` §5a.

**The capability boundary is not Codex-specific and did not retire with Codex.** No instance can read another's chat panel — that holds for the Architect exactly as it held for Codex, because separate instances have separate context and no shared session. The Architect sees what the Builder saves here, plus normal repository changes, and nothing more. That is a feature: file-only handoff is what keeps the review independent of the Builder's framing.

During active implementation, `current-status.md` also records the Builder session state (fresh or compacted once), context band (GREEN / AMBER / RED), anchor-integrity result, completed checks, outstanding checks, and the single next permitted action. Context refreshes and fresh-conversation re-entry follow Section 7 of `project-intelligence/ai-system/live-work-protocol.md`.

`claude-context-status.json` is an ignored, generated telemetry file written atomically by the Builder's status-line script. It contains percentages and session metadata only, and exists so context pressure is visible without reading the chat panel — the same capability boundary as above.

⚠ **`drift-sentinel.md` does not represent an active watch.** The continuous Sentinel retired with Codex and has no owner. `STATUS: CONTINUE` means "no watch is running", not "watched and clear". `STOP CLAUDE` is Carl-triggered until a mechanism is built. See `ai-system/live-work-protocol.md` §6 and §8.

Use the templates in `templates/` when creating live-work files. See `project-intelligence/ai-system/live-work-protocol.md`.
