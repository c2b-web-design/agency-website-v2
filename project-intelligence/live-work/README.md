# Live Work

Temporary shared workspace for active Claude Code, Codex, and Carl handoff.

Durable project memory does not live here. Generated plans, logs, transcripts, screenshots, and checkpoint files are scratch artifacts used during an active work cycle.

`claude-chat-window.md` is the temporary copy/paste replacement for Claude Code chat-window content. Claude Code writes the relevant chat output there so Codex can inspect it from the filesystem without Carl relaying it manually.

During active implementation, `current-status.md` also records the Claude session state (fresh or compacted once), context band (GREEN / AMBER / RED), anchor-integrity result, completed checks, outstanding checks, and the single next permitted action. Context refreshes and fresh-conversation re-entry follow Section 7 of `project-intelligence/ai-system/live-work-protocol.md`.

`claude-context-status.json` is an ignored, generated telemetry file written atomically by Claude Code's status-line script. It contains percentages and session metadata only; Codex Context Watch and Drift Sentinel checks use it to notify at AMBER from 50% and RED from 55% without relying on Carl to notice the UI indicator.

Use the templates in `templates/` when creating live-work files. See `project-intelligence/ai-system/live-work-protocol.md`.
