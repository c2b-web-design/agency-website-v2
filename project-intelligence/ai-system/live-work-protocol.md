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

If Codex sends a chat message beginning `STOP CLAUDE`, Carl interrupts Claude Code immediately, then returns to Codex for diagnosis and correction instructions.

---

## 7. Drift Triggers

Codex may issue `STOP CLAUDE` when it sees:

- Implementation contradicts the approved plan or Codex plan response
- An effect specified as a coupled or derived value is implemented as an independent overlay without approval
- A visual/material layer starts modifying an approved foundation layer outside scope
- Screenshots show the active visual goal is not being reached and further work would build on the wrong structure
- Claude Code is continuing after a checkpoint that should have paused for Carl or Codex review
- A governance conflict with an APPROVED decision is visible

Codex should prefer early interruption over allowing a wrong structure to compound.

---

## 8. Screenshots And References

For visual work, Claude Code saves screenshots to:

`project-intelligence/live-work/screenshots/`

Each screenshot should be named by step and viewport where practical, for example:

- `step-01-desktop.png`
- `step-01-mobile.png`

Reference images for the active task live in:

`project-intelligence/live-work/references/`

Claude Code must state whether each reference is a target to match or inspiration only.

---

## 9. Cleanup

Live-work files are temporary. They may be overwritten on the next task or deleted after the cycle ends.

Do not copy raw live-work transcripts into permanent project-intelligence files. Compress durable outcomes into the established documents:

- `decisions.md` for decisions
- `review-log.md` for actioned review findings
- component docs for component state
- `current-sprint.md` for sprint status, open questions, and blockers

---

*Last updated: 2026-07-20 - Live work protocol established.*
