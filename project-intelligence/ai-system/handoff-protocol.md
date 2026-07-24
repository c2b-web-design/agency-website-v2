# Handoff Protocol

The canonical standard for brief transmission between ChatGPT (project management) and Claude Code (implementation). Governs how work is initiated, acknowledged, executed, and reported — across session boundaries.

Cross-references: `prompt-protocol.md` (Claude Code's internal workflow), `context-rules.md` (information governance).

---

## 1. Purpose

### What a handoff is

A handoff is a compressed, structured brief from ChatGPT to Claude Code. It identifies the task, points to the governing project-intelligence files, states what must not change, and defines deliverables explicitly.

A handoff is not a conversation. It is not a request. It is an instruction package.

### Why structured handoffs exist

Claude Code begins each session with no memory of prior sessions. Without a structured brief, context is reconstructed from noise — and reconstructed context drifts. A structured brief locks the relevant project state at the moment of transmission. The brief points to files, not to ideas. When those files are updated, future sessions inherit the updates automatically. No re-briefing required.

### Why raw conversation transfer is prohibited

Passing a chat transcript forces Claude Code to extract intent from uncompressed text. Extracted intent is interpreted intent. Interpreted intent drifts from original intent. The brief format eliminates this: what is written is what is meant.

### The authority relationship

| Layer | Role |
|---|---|
| Project-intelligence files | Authoritative. Govern all constraints, decisions, and direction. |
| The brief | Operational. Points to files. Defines the task scope. |
| Chat | Temporary working memory. Ephemeral. Not persisted. |

---

## 2. Brief Structure (ChatGPT → Claude Code)

Every implementation brief follows this structure. Claude Code treats a brief missing any Mandatory field as incomplete and will not proceed without it.

```markdown
## Objective
<!-- Mandatory. One to two sentences. What is being built or changed, and why. -->

## Context Files
<!-- Mandatory. Files to read before implementation begins. -->
- project-intelligence/mission-overview.md
- project-intelligence/active-sprints/current-sprint.md
- project-intelligence/decisions.md
- project-intelligence/design-system/design.md
- project-intelligence/architecture/system-architecture.md

## Constraints
<!-- Mandatory. Hard limits. What must not change, be introduced, or be altered. -->
-

## Design-System Considerations
<!-- Mandatory for UI tasks. Pull from design.md. -->
- Visual tone:
- Spacing:
- Typography:
- Motion: None at this stage

## Deliverables
<!-- Mandatory. Exhaustive. No assumed outputs. -->
- [ ] Component file: components/...
- [ ] Component doc: project-intelligence/components/{name}.md
- [ ] Decision entry: decisions.md (if applicable)
- [ ] Review entry: review-log.md
- [ ] Sprint update: current-sprint.md

## Documentation Update Requirements
<!-- Mandatory. Which files. What detail level. -->
-

## Review Requirements
<!-- Mandatory. -->
- Self-review minimum
- Browser QA: recommended / not required

## Escalation Conditions
<!-- Optional. Known ambiguities Claude Code should pause on. -->
- If X, escalate before proceeding.

## Final Reporting Requirements
<!-- Optional. Additional scope beyond the standard implementation summary. -->
```

### Field Classification

| Field | Status | Consequence if Missing |
|---|---|---|
| Objective | Mandatory | Scope is undefined. Brief rejected. |
| Context Files | Mandatory | Governing constraints may be missed. Brief rejected. |
| Constraints | Mandatory | Implementation drifts. Brief rejected. |
| Design-System Considerations | Mandatory (UI) | Visual inconsistency likely. Brief rejected for UI tasks. |
| Deliverables | Mandatory | Completion cannot be verified. Brief rejected. |
| Documentation Update Requirements | Mandatory | Documentation will not be updated. Brief rejected. |
| Review Requirements | Mandatory | Review routing is undefined. Brief rejected. |
| Escalation Conditions | Optional | Claude Code applies standard escalation rules. |
| Final Reporting Requirements | Optional | Claude Code applies standard reporting. |

### Anti-Patterns

| Pattern | Problem |
|---|---|
| "Build a hero section that feels premium" | No constraints, no deliverables, no file reference |
| "You know what we discussed — continue" | References chat history, not project-intelligence files |
| "Update the design system to feel more modern" | No scope boundary, no measurable deliverable |
| "Fix the fonts thing" | No file reference, no constraint, no deliverable |
| Brief longer than one screen | Over-specification obscures the objective. Compress. |
| Deliverables list using "etc." | Every output must be named explicitly |

---

## 3. Acknowledgement Protocol

Before touching any file, Claude Code issues an acknowledgement. This prevents blind implementation.

### Acknowledgement Structure

Claude Code states, in order:

1. **Files read** — list of project-intelligence files reviewed
2. **Objective restated** — one sentence, in Claude Code's own words
3. **Constraints confirmed** — each constraint explicitly acknowledged
4. **Conflicts identified** — any contradiction between the brief and existing APPROVED decisions or architecture
5. **Ambiguities identified** — anything requiring a decision before implementation can proceed
6. **Escalation triggered?** — yes or no. If yes: state the trigger, propose two resolution options, stop.
7. **Safe to proceed** — stated only when all above items are resolved

If conflict or ambiguity is identified: Claude Code proposes options and waits. It does not implement.

### Safe to Proceed Checklist

- [ ] All Mandatory brief fields are present
- [ ] All context files read
- [ ] Objective understood and restated accurately
- [ ] No conflict with any APPROVED decision in `decisions.md`
- [ ] No ambiguity that would require a post-implementation decision
- [ ] All escalation conditions assessed — none triggered, or all resolved
- [ ] Deliverables list is clear and achievable

If any item is unchecked: Claude Code does not proceed.

---

## 4. Escalation Triggers

### Pause implementation — escalate to ChatGPT

| Trigger |
|---|
| Brief conflicts with an APPROVED decision in `decisions.md` |
| Task requires deviating from `design.md` with no supporting decision |
| UX direction is ambiguous and will have architectural consequences |
| New dependency not covered by existing stack decisions |
| Performance trade-off conflicts with design goals |
| Task scope is unclear and could cause significant rework |
| Visual direction feels inconsistent with luxury or futuristic standards |

### Pause implementation — escalate to Human Founder

| Trigger |
|---|
| An APPROVED decision needs to be reversed |
| Two APPROVED decisions are in direct conflict |
| A constraint is unsatisfiable and scope must change |

### Continue with a logged warning

Implementation may continue when:
- A minor visual judgement call is required and both options are clearly within `design.md` standards
- A trivial implementation detail is not covered by any existing decision

In both cases: log the judgement in `decisions.md` and flag it in the implementation summary. Do not silently decide.

**Escalation format:** State the conflict precisely. Reference the file and field. Propose two options. Await direction before implementing either.

---

## 5. Implementation Reporting Standard

Every completed task ends with a compressed report. Not a narrative. Not a reasoning chain. A structured statement of outcomes.

### Report Structure

```
## Implementation Summary

**Files changed:**
- path/to/file — what changed

**Architectural impact:**
None / [specific description]

**Documentation updated:**
- decisions.md — D-### added
- current-sprint.md — [tasks moved]
- components/{name}.md — created / updated
- review-log.md — R-### filed

**Unresolved concerns:**
None / [description with suggested next action]

**Review required:**
Self-review complete. Browser QA: recommended / not required.

**Technical debt introduced:**
None / [specific description]

**Recommended next actions:**
- [Next logical task]
```

### Anti-Patterns

| Pattern | Problem |
|---|---|
| "Everything looks good!" | States nothing. Not a report. |
| "Built the component and updated the files." | No specifics. Unverifiable. |
| A paragraph describing implementation approach | Reports state outcomes, not process. |
| Omitting Unresolved Concerns | The most critical field. Never omit. |
| Omitting Technical Debt | Debt that is not named is debt that compounds silently. |

---

## 6. Session Continuity Rules

### At session end

1. All decisions made in the session logged in `decisions.md`
2. `current-sprint.md` reflects current state — no task left IN PROGRESS if complete
3. Component documentation created or updated for any component touched
4. Review entry filed for any component or significant change completed
5. Open Questions and Blockers accurate
6. No unresolved issue silently dropped — every issue is named and placed

### How future sessions regain context

A future session reads, in order:

1. `mission-overview.md` — agency identity and stage
2. `current-sprint.md` — what is active, what is next, what is blocked
3. `decisions.md` — all Active constraints
4. The brief — the specific task

No chat history. No informal handover. The file system is the handover.

For an active task continued immediately after `/compact`, `/clear`, or automatic compaction, also follow `live-work-protocol.md` Section 7. The current live-work anchor supplements the durable files for that bounded task, and Claude Code must complete the re-entry handshake before implementation resumes.

### Sprint boundary

When a sprint closes:
- Archive `current-sprint.md` → `active-sprints/archive/sprint-N.md`
- Create new `current-sprint.md` with the new goal
- Carry all unresolved Open Questions and Blockers forward verbatim — reference the archived sprint

---

## 7. Browser Extension Interaction Rules

Browser QA output enters the system through `review-log.md` only. Not through chat. Not through direct instruction.

### Classification

All Browser Extension output is a **Recommendation**. It is observation with suggested direction. It is not a decision, not an override, and not a sprint task — until approved.

### What Browser QA cannot do

- Log a `decisions.md` entry directly
- Instruct Claude Code to implement without PM approval
- Override any entry in `decisions.md` or `design.md`
- Redefine UX direction or premium standards
- Shortcut the routing flow below

### Routing flow

```
Browser observes issue
    │
    ▼
review-log.md entry — severity assigned
    │
    ▼
ChatGPT reviews
    │
    ├── Low → ChatGPT approves → Claude Code actions
    ├── Medium → ChatGPT decides; may route to Human Founder
    └── High / Critical → Human Founder required
            │
            ▼
    Actioned → logged as decision → Claude Code implements
    Dismissed → review entry marked Dismissed with reason
```

---

*Last updated: 2026-07-22 - Active-task context refresh handoff added.*
