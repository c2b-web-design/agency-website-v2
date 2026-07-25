# Live Work

Temporary shared workspace for active Builder, Architect, and Carl handoff.

Durable project memory does not live here. Generated plans, logs, transcripts, screenshots, and checkpoint files are scratch artifacts used during an active work cycle.

`claude-chat-window.md` serves **two jobs**. First, it is the temporary copy/paste replacement for Builder chat-window content — the Builder writes the relevant chat output there so the Architect can inspect it from the filesystem without Carl relaying it manually. Second, at a checkpoint review it carries the Builder's **reasoning**, kept deliberately separate from the raw git evidence, so the Architect weighs one against the other rather than taking either on trust. See `ai-system/live-work-protocol.md` §5.

`git-evidence.md` holds raw `diff`, `log` and attribution for the changed work at each checkpoint. The Architect is structurally read-only and runs no `git` itself, so git-dependent findings can only be closed from evidence the Builder supplies. Evidence, not argument. See `ai-system/live-work-protocol.md` §5a.

**The capability boundary is not Codex-specific and did not retire with Codex.** No instance can read another's chat panel — that holds for the Architect exactly as it held for Codex, because separate instances have separate context and no shared session. The Architect sees what the Builder saves here, plus normal repository changes, and nothing more. That is a feature: file-only handoff is what keeps the review independent of the Builder's framing.

During active implementation, `current-status.md` also records the Builder session state (fresh or compacted once), context band (GREEN / AMBER / RED), anchor-integrity result, completed checks, outstanding checks, and the single next permitted action. Context refreshes and fresh-conversation re-entry follow Section 7 of `project-intelligence/ai-system/live-work-protocol.md`.

`claude-context-status.json` is an ignored, generated telemetry file written atomically by the Builder's status-line script. It contains percentages and session metadata only, and exists so context pressure is visible without reading the chat panel — the same capability boundary as above.

⚠ **`drift-sentinel.md` does not represent an active watch.** The continuous Sentinel retired with Codex and has no owner. `STATUS: CONTINUE` means "no watch is running", not "watched and clear". `STOP CLAUDE` is Carl-triggered until a mechanism is built. See `ai-system/live-work-protocol.md` §6 and §8.

Use the templates in `templates/` when creating live-work files. See `project-intelligence/ai-system/live-work-protocol.md`.
