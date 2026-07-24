# Prompt Protocol

The standard operational workflow for all future implementation tasks. All agents must operate within this protocol. Deviations require explicit approval from ChatGPT or Human Founder.

---

## 1. Prompt Lifecycle

Every task follows this sequence in order. No stage is optional unless the prompt explicitly states otherwise.

### Stage 1 — Context Acquisition

Before any implementation begins:

- Read `mission-overview.md` — confirm agency identity and current project stage
- Read `current-sprint.md` — confirm the task aligns with the active sprint goal
- Read `decisions.md` — identify any APPROVED decisions that constrain or govern the task
- Read domain-specific files relevant to the task (see Stage 2)

If the task conflicts with an APPROVED decision: **escalate before proceeding. Do not implement.**

---

### Stage 2 — Required File Reads

Determine which files are directly relevant to the task. Minimum reads by task type:

| Task Type | Required Files |
|---|---|
| UI component | `design.md`, `system-architecture.md`, existing component docs if related |
| Layout change | `design.md`, `system-architecture.md` |
| New dependency | `system-architecture.md`, `decisions.md` |
| Design token or CSS change | `design.md`, `app/globals.css`, `decisions.md` |
| Sprint planning | `current-sprint.md`, `mission-overview.md` |
| QA review | `review-log.md`, `design.md`, relevant component doc |
| Governance or documentation update | All relevant `ai-system/` files |

Reading files outside this list is encouraged when scope is unclear.

---

### Stage 3 — Task Execution

Implement according to the brief, architecture docs, and design-system — in that order of authority.

- Do not improvise on design direction
- Do not introduce patterns not established in `system-architecture.md` without logging a decision
- If the brief is ambiguous on a point that will have architectural consequences: flag and escalate before implementing, not after
- For active plan handoff, run logging, screenshots, or drift-prone work, use `live-work-protocol.md` and `project-intelligence/live-work/` so Codex can inspect saved state without Carl copying chat output
- When Carl confirms that Claude Code has entered **Edit Automatically** or has begun executing an approved plan, Codex must immediately activate the task-scoped Drift Sentinel defined in `live-work-protocol.md`. This is automatic at execution start and must not depend on a further reminder from Carl.
- If that Sentinel stops work before a checkpoint, Codex's `STOP CLAUDE` alert must include, in the same message, one fenced and copy-ready prompt that stops the current course and gives Claude Code the full corrective instruction, boundaries, verification, and handoff requirements. A stop-only alert requiring Carl to return for a second prompt is not sufficient. If Claude Code has already completed its handoff, treat the issue as a checkpoint finding and provide the proposed next-action prompt for Carl's approval instead of claiming Claude is still coding.
- Context health follows the machine-readable Context Watch, GREEN / AMBER / RED bands, and Context Refresh Gate in `live-work-protocol.md`. At AMBER, finish only the command or bounded verification already running, refresh all four continuity files, and pause. Codex must verify that those files agree before `/compact` or `/clear`. Never reuse an anchoring prompt after its described command or outstanding checks have changed. After any refresh, Claude Code completes the fresh-context re-entry handshake and pauses for Carl's approval before editing. An unexpected automatic compaction triggers the same gate immediately.

---

### Stage 4 — Documentation Updates

On task completion, update all relevant files per Section 3 of this document. Documentation updates are not optional. A task without documentation updates is incomplete.

---

### Stage 5 — Review Generation

If a component was built or a significant visual or architectural change was made: file a review entry in `review-log.md`. Use the schema. Self-review is acceptable; Browser QA review is preferred where possible.

---

### Stage 5.5 — Checkpoint Review (conditional)

If the completed step is a meaningful implementation milestone — a completed visual layer, component, structural change, or rollout of an approved pattern — request a checkpoint review from Codex through the MCP bridge before building further on it.

See `checkpoint-review-protocol.md` and `live-work-protocol.md` for cadence, saved artifacts, request structure, and escalation. Codex returns findings only; Carl decides the response.

Not required for lint fixes, formatting, or work covered by an immediately preceding review.

---

### Stage 6 — Decision Logging

Log any architectural or design decisions made during execution in `decisions.md`. Use the schema exactly. If no decisions were made, this stage is skipped.

---

### Stage 7 — Sprint Update

Update `current-sprint.md`:

- Move completed tasks from In Progress to Completed
- Add newly discovered tasks to Up Next
- Update or add Open Questions and Blockers
- Do not leave tasks in In Progress if they are complete

---

### Stage 8 — Final Implementation Summary

Provide a compressed summary covering:

- What was created or changed (file paths)
- What is unresolved or deferred
- What documentation was updated

No reasoning chains. No process narration. State outcomes, not method.

---

## 2. Standard Prompt Structure

Prompts handed to Claude Code by ChatGPT or Human Founder must follow this structure. Claude Code should flag incomplete prompts before executing.

```
## Objective
One to two sentences. What is being built or changed, and why.

## Context Files to Read
Explicit list of project-intelligence file paths relevant to this task.

## Constraints
Hard limits — what must not change, must not be introduced, or must be preserved.

## Deliverables
Explicit list of expected outputs: component files, doc entries, decision logs, review entries.

## Documentation Update Requirements
Which files must be updated. What level of detail is expected.

## Review Requirements
Whether a self-review, Browser QA review, or ChatGPT review is required on completion.

## Final Reporting Requirements
What the implementation summary must cover.
```

**Incomplete prompts:** A prompt missing Objective, Constraints, or Deliverables is incomplete. Claude Code must state which fields are missing and request them before proceeding.

---

## 3. Documentation Update Rules

### Trigger Events

| Trigger | Files to Update | Detail Level |
|---|---|---|
| New component built | `components/{name}.md` (create), `review-log.md`, `current-sprint.md`, `decisions.md` if applicable | Component: full. Review: all fields. Sprint: move to Completed. |
| Architectural decision made | `decisions.md`, `system-architecture.md` if structural | Decision: full schema. Architecture: current state only, no narrative. |
| Design system rule changed | `design.md`, `decisions.md` | Design: update the relevant section. Decision: full schema. |
| New dependency added | `system-architecture.md` Stack table, `decisions.md` | Architecture: add to table. Decision: one-line rationale minimum. |
| QA issue discovered | `review-log.md`, `current-sprint.md` Up Next if severity is High or Critical | Review: full schema. Sprint: add actionable flags. |
| Sprint completed | Archive `current-sprint.md` to `active-sprints/archive/sprint-N.md`, create new `current-sprint.md` | Archive: full snapshot. New: goal + rolled-forward Up Next and Open Questions. |
| Motion or animation introduced | `design.md` Motion section, `decisions.md` | Design: updated motion rules. Decision: full schema with rationale. |
| Performance or security constraint added | `system-architecture.md` Constraints table, `decisions.md` | Architecture: add row. Decision: full schema. |

### What Is Not Logged

- Intermediate debugging steps or failed attempts
- Discarded implementation approaches
- Linting, formatting, or import order changes with no functional effect
- Code comments added, removed, or reformatted

---

## 4. Escalation Rules

Claude Code must stop and escalate before proceeding when any of the following applies.

| Situation | Escalate To |
|---|---|
| Brief conflicts with an APPROVED decision in `decisions.md` | ChatGPT |
| Task requires deviating from `design.md` with no supporting decision | ChatGPT |
| UX direction is ambiguous and will have architectural consequences | ChatGPT |
| New dependency not covered by existing stack decisions | ChatGPT |
| Performance trade-off conflicts with design or animation goals | ChatGPT |
| Task scope is unclear and could result in significant rework | ChatGPT |
| Visual decision feels inconsistent with luxury or futuristic standards | ChatGPT |
| An APPROVED decision needs to be reversed | Human Founder only |
| Two APPROVED decisions conflict with each other | Human Founder only |

**Escalation format:** State the conflict precisely. Reference the file and field. Propose two options if possible. Do not implement either until directed.

---

## 5. Browser QA Routing Rules

### Output Classification

All Browser Extension output is classified as **Recommendation**. Nothing from the Browser Extension layer is a Decision until approved by ChatGPT or Human Founder.

| Classification | Authority | Action |
|---|---|---|
| Recommendation | Browser Extension | File in `review-log.md`. Await routing. |
| Decision | ChatGPT or Human Founder | Log in `decisions.md`. Claude Code implements. |

### Routing Flow

```
Browser Extension observes issue
        │
        ▼
Entry filed in review-log.md with severity
        │
        ▼
ChatGPT reviews
        │
        ├── Low — ChatGPT approves Claude Code to action
        ├── Medium — ChatGPT decides; may route to Human Founder
        └── High / Critical — Human Founder review required
                │
                ▼
        If actioned: decision logged, Claude Code implements
        If dismissed: review entry marked Dismissed with reason
```

### Severity Definitions

| Severity | Definition | Example |
|---|---|---|
| Low | Cosmetic, no user impact | Minor spacing inconsistency |
| Medium | Degrades experience, recoverable | Font not rendering |
| High | Significant UX or brand impact | Mobile layout broken |
| Critical | Blocks usage or severely misrepresents the agency | Page fails to load |

### QA Constraints

- Cannot log a `decisions.md` entry directly
- Cannot instruct Claude Code to implement without PM approval
- Cannot override any entry in `decisions.md` or `design.md`
- Cannot reclassify a Recommendation as Approved

---

*Last updated: 2026-07-22 - Automatic Drift Sentinel, machine-readable Context Watch, and refresh/re-entry gate added to Stage 3.*
