# Live Work Protocol

Governs temporary file-based handoff between Claude Code, Codex, and Carl during active implementation work. Live-work files exist to reduce copy/paste relay, expose plans/checkpoints/screenshots to Codex, and support drift detection before work is built on.

Cross-references: `checkpoint-review-protocol.md`, `prompt-protocol.md`, `context-rules.md` Rules 1-4, 8, 9.

---

## 1. Purpose

Claude Code's chat panel is working memory, not project memory. During active work, important plan, status, screenshot, and run-log information must be saved to a shared temporary folder so Codex can inspect it without Carl copying and pasting chat output.

The live-work folder is a transport surface. It is not the permanent source of truth. Permanent outcomes still belong in `decisions.md`, `review-log.md`, component docs, sprint notes, or other established project-intelligence files.

Important capability boundary: Codex cannot directly read Claude Code's VS Code chat panel. "Codex reads Claude at its discretion" means Codex inspects saved live-work files, screenshots, and normal repo changes whenever Carl asks or a sentinel check runs. If relevant Claude chat content is not saved into `project-intelligence/live-work/`, Codex cannot see it.

---

## 2. Location

Temporary live-work files live under:

`project-intelligence/live-work/`

Durable templates and instructions in that folder are committed. Generated plans, logs, transcripts, screenshots, and checkpoint files are scratch artifacts and are ignored by Git unless Carl explicitly chooses to preserve one.

---

## 3. Required Files

Claude Code writes or updates these files during active work:

| File | Purpose | Default lifecycle |
|---|---|---|
| `claude-plan.md` | Current plan shown to Carl before implementation | Overwritten per task |
| `codex-plan-response.md` | Codex approval, amendments, or rejection of the plan | Overwritten per task |
| `current-status.md` | Short live status during implementation | Overwritten frequently |
| `checkpoint-request.md` | Claude Code's checkpoint package for Codex | Overwritten per checkpoint |
| `codex-checkpoint-response.md` | Codex checkpoint findings | Overwritten per checkpoint |
| `claude-chat-window.md` | Latest relevant Claude Code chat-window content for Codex to inspect | Overwritten during and after each Claude Code action cycle |
| `claude-run-log.md` | End-of-run summary of what happened | Overwritten per run |
| `claude-run-transcript.md` | Optional fuller transcript/extract when useful | Created only when needed |
| `claude-context-status.json` | Machine-readable Claude context-window status written by the status-line script | Replaced atomically on status-line updates; ignored by Git |
| `drift-sentinel.md` | STOP/CONTINUE status when Codex detects drift | Overwritten per check |
| `screenshots/` | Saved visual evidence for review | Cleared or overwritten per task |
| `references/` | Stable references for the active task when needed | Cleared or promoted after task |

---

## 4. Plan Handoff

When Claude Code produces a plan for Carl, it must also save the same plan to:

`project-intelligence/live-work/claude-plan.md`

Carl may read the plan in VS Code. When Carl tells Codex "I have read the plan", Codex reads the saved plan directly, then writes its response to:

`project-intelligence/live-work/codex-plan-response.md`

Carl can then tell Claude Code:

`Read project-intelligence/live-work/codex-plan-response.md and proceed from that instruction.`

This removes the need for Carl to copy the plan from Claude Code into Codex.

---

## 5. Run Log

During and at the end of each Claude Code action cycle, Claude Code writes or overwrites:

`project-intelligence/live-work/claude-chat-window.md`

This file is the copy/paste replacement for Carl. It contains the relevant content that appeared in the Claude Code chat window: Claude's plan/status text, important tool results, errors, decisions made during the run, code-change summaries, and any final report. It does not need to be a verbatim full transcript when that would add noise, but it must include enough chat-window content for Codex to understand what Claude did, what it saw, and where the work stands without Carl pasting the chat manually.

At the end of each Claude Code run, Claude Code writes:

`project-intelligence/live-work/claude-run-log.md`

The log is compressed. It contains only what Codex needs to review the run:

- Task
- Plan followed
- Files changed
- What changed
- Commands/checks run
- Screenshots saved
- Codex checkpoint result, if any
- Issues or deviations
- Final status
- Next suggested action

Full raw transcripts are not written by default. For complex, visual, risky, or drift-prone work, Claude Code may also write a fuller extract to:

`project-intelligence/live-work/claude-run-transcript.md`

The transcript/extract is temporary working material, not permanent documentation.

---

## 6. Drift Sentinel

For sensitive visual, material, animation, Three.js, layout, or approved-foundation work, Claude Code must not work silently for long stretches. It writes live status and checkpoint files in small steps so Codex can inspect saved state.

### Automatic activation at execution start

When Carl states that Claude Code has entered **Edit Automatically**, has begun executing an approved plan, or is otherwise actively editing implementation files, Codex must start a task-scoped Drift Sentinel immediately. Carl must not have to remind Codex to enter Sentinel mode.

The Sentinel must:

- use the latest approved prompt, Claude plan, and Codex amendments as its comparison baseline
- inspect `claude-context-status.json`, `current-status.md`, `claude-chat-window.md`, `claude-run-log.md`, current checkpoint files, relevant screenshots, and the repository diff
- preserve unrelated working-tree state and distinguish normal incomplete work or objective in-scope correction from genuine drift
- run at a two-minute interval by default; use one-minute checks when the task is unusually destructive, architectural, or drift-prone
- alert Carl immediately with a message beginning `STOP CLAUDE` when real drift is found, followed in the same message by one complete copy-ready corrective prompt for Carl to paste into Claude Code
- continue until the implementation checkpoint is complete or Carl stops the work, then perform the final read-only review and delete the Sentinel

Plan-mode discussion and read-only investigation do not themselves trigger a Sentinel. The trigger is the transition into implementation execution.

Claude Code updates:

- `current-status.md` during work
- `checkpoint-request.md` at meaningful implementation checkpoints
- `screenshots/` when visual behaviour matters
- `claude-run-log.md` at the end of the run

Codex inspects the saved state. If drift is detected, Codex writes:

`project-intelligence/live-work/drift-sentinel.md`

with a clear status:

- `STATUS: CONTINUE`
- `STATUS: STOP`

### STOP alert and correction handoff

If Codex detects real drift while Claude Code is still executing, the user-facing alert must:

1. begin exactly `STOP CLAUDE`
2. state the precise evidence and why the current course conflicts with the approved scope
3. include one fenced, copy-ready prompt that Carl can paste immediately, including when Claude Code's UI Stop control is unavailable or greyed out
4. make that prompt stop the current course and provide the complete next instruction: the required correction, strict boundaries, preservation requirements, verification, and live-work handoff

The alert must not merely tell Carl to press Stop and return later for instructions. Carl should need one paste, not a stop-only message followed by a second corrective prompt. Codex routes this prompt through Carl; it does not instruct Claude Code directly through the MCP bridge.

If Claude Code has already stopped implementation and written its checkpoint or handoff files, Codex must not describe it as active drift. Codex instead reports the checkpoint finding and supplies a copy-ready next-action prompt for Carl to use if he authorises a correction.

---

## 7. Context Refresh Gate

Claude Code's chat is expendable working memory. The repository and the refreshed live-work anchor are the continuity mechanism. A context refresh is therefore a controlled handoff, not an informal slash command used while work continues.

### Context visibility

Each implementation session should expose the context-window used and remaining percentages in Claude Code's persistent status line. Carl may configure this with `/statusline`. If the status line is unavailable or unclear, `/context` is the immediate diagnostic command.

The status-line script should also atomically replace:

`project-intelligence/live-work/claude-context-status.json`

using `workspace.project_dir` from Claude Code's status-line input rather than a machine-specific absolute project path. The file contains only:

```json
{
  "schema": 1,
  "updatedAt": "ISO-8601 timestamp",
  "sessionId": "Claude session id",
  "sessionName": "optional Claude session name",
  "model": "display name",
  "contextWindowSize": 0,
  "usedPercentage": 0,
  "remainingPercentage": 0,
  "band": "GREEN | AMBER | RED | UNKNOWN"
}
```

It must not contain transcript text, prompts, file contents, tokens, credentials, or other project data. It is a generated live-work artifact and remains ignored by Git.

Claude Code updates the status-line input after interaction events and after compaction; it is not a continuous per-token feed. The writer therefore uses a real timestamp and atomic replacement. Codex treats a missing, malformed, or stale file as `UNKNOWN`, never as GREEN.

`/context` only reports usage. `/compact` summarizes the active conversation. `/clear [name]` saves the old conversation under the supplied name and opens a new empty conversation. These commands are not interchangeable.

Project operating bands use the displayed **used percentage**:

| State | Context used | Required action |
|---|---:|---|
| GREEN | Below 50% and no native context warning | Continue the current bounded workflow. |
| AMBER | 50% to below 55%, or Claude Code shows its native context indicator/warning | Notify Carl immediately with **COMPACTION AMBER**. Finish only the command or bounded verification already running. Do not start the next step. |
| RED | 55% or above, an automatic-compaction warning, or uncertain state after compaction | Notify Carl immediately. Stop at the next safe command boundary, refresh the anchor, and use `/clear [name]` unless Carl and Codex explicitly approve another route. |

These are deliberately conservative project safety thresholds, not claims about Claude Code's platform limit. The alert occurs as soon as usage reaches 50% because Claude may already be inside a large multi-file action. The narrow five-point AMBER band preserves enough headroom to finish that one bounded action, write a complete anchor, and refresh cleanly before reasoning quality or platform auto-compaction becomes relevant.

### Automatic Context Watch

When Carl says a Claude Code session is actively planning, investigating, verifying, or editing, Codex starts a lightweight Context Watch unless the active Drift Sentinel already performs that check. It reads `claude-context-status.json` at the same one- or two-minute cadence used for live work.

- GREEN: no user notification.
- AMBER: notify Carl, inspect the current live-work state, and provide one current-state anchoring prompt. Do not rely on a stock prompt.
- RED: notify Carl to stop after the command presently running, then provide the complete anchor-and-refresh instruction.
- UNKNOWN or stale while Claude is known to be active: notify Carl that automatic context visibility is unavailable and request `/context` or status-line repair; do not guess a percentage.

The Context Watch is monitoring only. It does not broaden implementation authority, send instructions directly to Claude Code, or replace Carl's control of `/compact`, `/clear`, and `/resume`.

### Amber stop and anchor

On **COMPACTION AMBER**:

1. Claude Code may finish only the command or bounded verification currently running. It must not begin another implementation step, second verification, investigation branch, or correction cycle.
2. Codex gives Carl one fenced, copy-ready anchoring prompt written for the **current** state.
3. Claude Code refreshes all four continuity files:
   - `current-status.md` - exact current state, context state, completed and outstanding work, next permitted action
   - `claude-chat-window.md` - methodology, important chat output, corrections, rejected approaches, and current conclusion
   - `claude-run-log.md` - files changed, commands and checks run, results, deviations, and remaining work
   - `checkpoint-request.md` - current review package and verification status when a checkpoint exists
4. Claude Code pauses and explicitly confirms that the live-work anchor is complete. It must not start another command.
5. Codex performs a read-only **anchor integrity check** before any context command is used.

The anchor integrity check fails if the four files disagree about whether implementation is complete, which checks remain outstanding, what code is current, or what action is next. Superseded sections must be marked clearly, and their headings must not contradict the authoritative current section. A stale sentence such as "two tests outstanding" after those tests passed must be corrected before `/compact` or `/clear`.

The anchoring prompt is disposable. It must describe the command actually in progress and the checks actually outstanding at the moment it is issued. Never reuse an earlier context-refresh prompt after the task state has changed.

### Choosing compact or clear

Carl chooses the context action with Codex only after the anchor passes:

- Use focused `/compact [instructions]` only when this is the first compaction in a healthy session, no drift or contradictory reasoning has appeared, the same bounded task is continuing, and keeping the conversation is materially useful.
- Use `/clear [name]` or a new conversation when any of these is true: the session has already compacted once; drift, stale methodology, or contradictory claims appeared; a milestone or checkpoint is complete; the task or work mode is changing; the indicator is RED; or maximum fresh capacity is preferable.
- Do not compact merely because the command exists. At a clean milestone, `/clear [name]` is the default.
- Use a descriptive session name, for example `/clear contact-prewarm-hardening-22-july-2026`.

The previous conversation remains available through `/resume`. `/resume` is for reference or deliberate continuation; it is not required for a fresh re-entry because the file anchor is authoritative.

### Fresh-context re-entry handshake

After `/compact`, `/clear`, or an unexpected automatic compaction, Claude Code must not edit files or begin implementation immediately. Its first task is re-entry:

1. Read `CLAUDE.md` and `AGENTS.md` where present.
2. Read the latest approved prompt, plan, Codex amendments, and relevant AI-system protocols.
3. Read `current-status.md`, `claude-chat-window.md`, `claude-run-log.md`, and the current checkpoint files.
4. Inspect the repository status and diff without changing them. Identify unrelated working-tree changes and their owners.
5. Restate, in a short re-entry report:
   - current objective and milestone
   - approved implementation state
   - strict boundaries and forbidden changes
   - files already changed and unrelated changes to preserve
   - checks completed and checks genuinely outstanding
   - the single next permitted action
   - whether the session is fresh or has compacted once
6. Save the same re-entry report to `current-status.md` and `claude-chat-window.md`.
7. Pause. Carl and Codex compare the report with the anchor. Implementation resumes only after Carl approves that the reconstruction is accurate.

If automatic compaction happens before the gate is used, Carl tells Codex immediately. Claude Code must stop before beginning its next action and follow the same anchor and re-entry sequence. Continuing from compressed chat memory while the shared files are stale is governance drift and may trigger `STOP CLAUDE`.

### Capacity and Sentinel rules

Repeated compaction is not the default strategy. After one compaction in an implementation task, the next context-pressure event uses `/clear [name]` or a new conversation after a complete anchor.

If the same implementation task continues through a refresh, its Drift Sentinel remains active and treats the repository plus refreshed files as authoritative. If a milestone is complete and the final read-only checkpoint passes, Codex deletes that Sentinel before the clear; a new Sentinel starts automatically when the next implementation enters Edit Automatically.

---

## 8. Drift Triggers

Codex may issue `STOP CLAUDE` when it sees:

- Implementation contradicts the approved plan or Codex plan response
- An effect specified as a coupled or derived value is implemented as an independent overlay without approval
- A visual/material layer starts modifying an approved foundation layer outside scope
- Screenshots show the active visual goal is not being reached and further work would build on the wrong structure
- Claude Code is continuing after a checkpoint that should have paused for Carl or Codex review
- A governance conflict with an APPROVED decision is visible

Codex should prefer early interruption over allowing a wrong structure to compound.

---

## 9. Screenshots And References

For visual work, Claude Code saves screenshots to:

`project-intelligence/live-work/screenshots/`

Each screenshot should be named by step and viewport where practical, for example:

- `step-01-desktop.png`
- `step-01-mobile.png`

Reference images for the active task live in:

`project-intelligence/live-work/references/`

Claude Code must state whether each reference is a target to match or inspiration only.

---

## 10. Cleanup

Live-work files are temporary. They may be overwritten on the next task or deleted after the cycle ends.

Do not copy raw live-work transcripts into permanent project-intelligence files. Compress durable outcomes into the established documents:

- `decisions.md` for decisions
- `review-log.md` for actioned review findings
- component docs for component state
- `current-sprint.md` for sprint status, open questions, and blockers

---

*Last updated: 2026-07-22 - Automatic Sentinel, machine-readable Context Watch, anchor-integrity gate, and fresh-context re-entry rules added.*
