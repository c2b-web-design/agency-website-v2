# Prompt Protocol

The standard operational workflow for all future implementation tasks. All agents must operate within this protocol. Deviations require explicit approval from Carl.

---

## 1. Prompt Lifecycle

Every task follows this sequence in order. No stage is optional unless the prompt explicitly states otherwise.

### Stage 1 — Context Acquisition

Before any planning begins:

- Read `mission-overview.md` — confirm agency identity and current project stage
- Read `current-sprint.md` — confirm the chunk aligns with the active sprint goal
- Read `decisions.md` — identify the APPROVED decisions the chunk sits under, named in the chunk definition's approved-decision references
- Read the chunk definition itself — objective, scope, must-not-change, files in scope, definition of done (`handoff-protocol.md` §2)
- Read domain-specific files relevant to the chunk (see Stage 2)

If the chunk conflicts with an APPROVED decision: **escalate before planning. Do not plan around it.** Where nothing is built yet, escalate straight to Carl (§4).

---

### Stage 2 — Required File Reads, then Plan

Determine which files are directly relevant to the chunk. Minimum reads by task type:

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

**Then plan, and pass the gate.** Once the required files are read, the Builder enters
Plan Mode and writes the detailed plan for the chunk — the *how*. Plan Mode is
structurally incapable of editing files, so planning cannot leak into execution.

The plan then passes the plan-review gate (`handoff-protocol.md` §2.5) before any code is
written:

1. Builder plans in Plan Mode.
2. Architect reviews the plan and amends — findings and amendments only; it does not
   rewrite the plan or instruct the Builder directly. The review carries weight because
   the Architect did not author the plan.
3. Carl approves the amended plan. Only Carl approves (D-036).
4. Builder proceeds to Stage 3 and executes that chunk only.

**Execution does not begin until Carl has approved the plan.**

---

### Stage 3 — Task Execution

Execute the **approved plan** — that chunk only. Do not iterate beyond approved scope
during execution; a new need is a new chunk, taken back through the gate (Stage 2).

Implement according to the approved plan, architecture docs, and design-system — in that
order of authority.

- Do not improvise on design direction
- Do not introduce patterns not established in `system-architecture.md` without logging a decision
- If the plan proves ambiguous on a point with architectural consequences: flag and escalate before implementing, not after
- For active plan handoff, run logging, screenshots, git evidence, or drift-prone work, use `live-work-protocol.md` and `project-intelligence/live-work/` so the Architect can inspect saved state without Carl copying chat output
- Context health follows the machine-readable Context Watch, GREEN / AMBER / RED bands, and Context Refresh Gate in `live-work-protocol.md`. At AMBER, finish only the command or bounded verification already running, refresh all four continuity files, and pause. Never reuse an anchoring prompt after its described command or outstanding checks have changed. After any refresh, the Builder completes the fresh-context re-entry handshake and pauses for Carl's approval before editing. An unexpected automatic compaction triggers the same gate immediately.

**Drift watching during execution — a currently ownerless function.** Under the retired
layer, Codex activated a task-scoped Drift Sentinel at execution start, watched for
divergence from the approved plan, and could issue `STOP CLAUDE`. **That function has no
owner in the current structure.**

Drift watching is a mechanism not yet built. An agent merely *asked* to watch is an
intention, not a control — the retired Sentinel sat at `STATUS: STOP` while work was being
submitted for review, which is precisely the failure mode this redesign exists to
eliminate. Until the mechanism is built, `STOP CLAUDE` is **Carl-triggered**: issued when
Carl sees drift, not by any watching agent.

This is a real capability the old layer provided and the current one does not yet replace.
It is stated as a known gap so it is not mistaken for a covered function. The conditions
that would justify a stop are retained in `live-work-protocol.md` §8, so that whoever or
whatever eventually owns the mechanism inherits the specification.

---

### Stage 4 — Documentation Updates

On task completion, update all relevant files per Section 3 of this document. Documentation updates are not optional. A task without documentation updates is incomplete.

---

### Stage 5 — Review Generation

If a component was built or a significant visual or architectural change was made: file a review entry in `review-log.md`. Use the schema. Self-review is acceptable; Browser QA review is preferred where possible.

---

### Stage 5.5 — Checkpoint Review (conditional)

If the completed step is a meaningful implementation milestone — a completed visual layer, component, structural change, or rollout of an approved pattern — pause for checkpoint review before building further on it.

**Invocation is file-based and Carl-routed, not an MCP call** — the retired `codex` bridge is void. The Builder saves the review request, git evidence and screenshots to `live-work/` per `checkpoint-review-protocol.md` §4, and pauses. Carl routes it to the Architect, which returns findings to `live-work/`.

See `checkpoint-review-protocol.md` and `live-work-protocol.md` for cadence, saved artefacts, request structure, and escalation. The Architect returns findings only; Carl decides the response.

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

The unit of work handed to the Builder is the **chunk**, defined by the Architect and routed by Carl. Its Mandatory fields — objective, scope, must-not-change, files in scope, approved-decision references, definition of done — are specified once, in `handoff-protocol.md` §2, and are **not restated here** so the two cannot drift apart. A chunk missing any Mandatory field is rejected before planning begins (D-008); the Builder flags it rather than proceeding.

This protocol governs what the Builder does with a chunk once received: read (Stage 1), plan and pass the plan-review gate (Stage 2), execute (Stage 3), and — where the step is meaningful — checkpoint review (Stage 5.5). The structure below is the shape a chunk arrives in.

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
Whether a self-review, Browser QA review, or Architect checkpoint review is required on completion.

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

The route depends on whether work exists yet to review. Where nothing is built, there is
no artefact for a reviewer to assess, and inserting one only rebuilds the intermediating
tier D-036 removed.

| Situation | Route |
|---|---|
| Chunk conflicts with an APPROVED decision in `decisions.md` | **Carl** — nothing built yet |
| Task requires deviating from `design.md` with no supporting decision | **Carl** — nothing built yet |
| A design-system conflict surfaces before implementation | **Carl** — nothing built yet |
| UX direction is ambiguous and will have architectural consequences | **Carl** — nothing built yet |
| New dependency not covered by existing stack decisions | **Carl** — nothing built yet |
| Task scope is unclear and could result in significant rework | **Carl** — nothing built yet |
| A QA finding conflicts with existing implementation | Architect may frame → **Carl decides** |
| Performance trade-off conflicts with design or animation goals | Architect may frame → **Carl decides** |
| A recommendation conflicts with an APPROVED decision | Architect may frame → **Carl decides** |
| Visual decision feels inconsistent with luxury or futuristic standards | Architect may frame → **Carl decides** |
| An APPROVED decision needs to be reversed | **Carl only** |
| Two APPROVED decisions conflict with each other | **Carl only** — stop, do not implement, note the conflict adjacent to both entries, do not resolve at any lower level |

**Escalation format:** State the conflict precisely. Reference the file and field. Propose two options if possible. Do not implement either until directed.

---

## 5. Browser QA Routing Rules

### Output Classification

All Browser Extension output is classified as **Recommendation**. Nothing from the Browser Extension layer is a Decision until approved by Carl (D-036).

| Classification | Authority | Action |
|---|---|---|
| Recommendation | Browser Extension | File in `review-log.md`. Await routing. |
| Decision | **Carl only** | Log in `decisions.md`. The Builder implements. |

### Routing Flow

1. The Browser Extension observes an issue.
2. An entry is filed in `review-log.md` with severity assigned.
3. The Architect **may frame** the finding — assess severity, relate it to an approved
   decision, recommend a response. Framing is not approval.
4. **Carl decides.** Every severity routes to Carl: Low, Medium, High and Critical alike.
5. If actioned: the decision is logged and the Builder implements. If dismissed: the
   review entry is marked Dismissed with a reason.

**No severity tier may be cleared by any agent other than Carl (D-036).** The prior
protocol let Low findings be approved without the founder and Medium be decided below him;
both are removed. A second approver, however routine the finding, is still a second
approver.
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
