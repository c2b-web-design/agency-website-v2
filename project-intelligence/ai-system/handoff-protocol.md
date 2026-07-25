# Handoff Protocol

The canonical standard for handing work to the Builder. Work moves as a **chunk**: the
Architect defines it, Carl routes it, the Builder plans it in Plan Mode, the Architect
reviews the plan and amends, Carl approves, the Builder executes that chunk only. Governs
how work is initiated, acknowledged, executed, and reported — across session boundaries.

Harness-agnostic: defined by the chunk-and-plan discipline, not by which agent fills each
role.

Cross-references: `ai-roles.md` (authority), `prompt-protocol.md` (the Builder's internal
workflow), `context-rules.md` (information governance), `decisions.md` D-036.

---

## 1. Purpose

### What a handoff is

A handoff is a compressed, structured **chunk definition**, authored by the Architect and
routed by Carl. It identifies the work, points to the governing project-intelligence
files, states what must not change, and defines the finish condition explicitly.

A handoff is not a conversation. It is not a request. It is a scoping package.

**What it deliberately is not: an implementation spec.** The chunk says *what* and *what
not*; it does not say *how*. The how is the Builder's plan, written in Plan Mode and
reviewed by the Architect at the plan-review gate (§3). That separation is the point — the
Architect's amendments carry weight precisely because it did not author the plan it
reviews.

### Why structured handoffs exist

The Builder begins each session with no memory of prior sessions. Without a structured
chunk definition, context is reconstructed from noise — and reconstructed context drifts.
A structured definition locks the relevant project state at the moment of transmission. It
points to files, not to ideas. When those files are updated, future sessions inherit the
updates automatically. No re-briefing required.

### Why raw conversation transfer is prohibited

Passing a chat transcript forces the Builder to extract intent from uncompressed text.
Extracted intent is interpreted intent. Interpreted intent drifts from original intent.
The structured format eliminates this: what is written is what is meant.

### The authority relationship

| Layer | Role |
|---|---|
| Project-intelligence files | Authoritative. Govern all constraints, decisions, and direction. |
| The chunk definition | Operational. Points to files. Defines the work's scope. |
| The Builder's plan | Operational. Defines the approach. Reviewed before execution. |
| Chat | Temporary working memory. Ephemeral. Not persisted. |

---

## 2. Chunk Definition

The Architect defines each chunk after the design is settled with Carl. A chunk is the
smallest useful unit of work — bite-sized, sometimes smaller. The definition says what the
chunk is and what it must not touch. It deliberately does **not** specify how the work is
built: that is the Builder's plan (§3), written in Plan Mode and reviewed by the
Architect. The Architect scopes; the Builder plans; the separation is the point.

Every chunk definition follows this structure. The Builder treats a definition missing any
Mandatory field as incomplete and will not enter Plan Mode without it (D-008).

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

## 2.5 Plan-Review Gate

*(Numbered 2.5 rather than 3 so existing section numbers — and the cross-references that
point at them — stay stable.)*

No chunk is executed from its definition alone. Between definition and execution sits a
gate:

1. **Builder plans.** In Plan Mode, the Builder writes the detailed plan for the chunk —
   the *how*: approach, structure, the specific changes intended. Plan Mode is
   structurally incapable of editing files, so planning cannot leak into execution.
2. **Architect reviews and amends.** The Architect reads the Builder's plan, agrees what
   is sound, and adds its amendments — corrections, cautions, missed constraints. This
   review has weight because the Architect did **not** write the plan: it assesses the
   executor's own thinking rather than grading its own. Findings and amendments only — the
   Architect does not rewrite the plan or instruct the Builder directly.
3. **Carl approves.** The amended plan goes to Carl, who approves, revises, or sends it
   back. Only Carl approves (D-036).
4. **Builder executes.** The Builder executes the approved plan, that chunk only. It does
   not iterate beyond the approved scope during execution; a new need is a new chunk,
   taken back through this gate.

This gate is why Plan Mode is in the loop at all: it makes the plan a reviewable artefact
*before any code exists*, so drift is caught at the plan stage rather than after it has
been built and depended upon.

---

## 3. Acknowledgement Protocol

Before touching any file, the Builder issues an acknowledgement. This prevents blind implementation.

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

### Pause implementation — escalate

The route depends on whether work exists yet to review. Where nothing is built, there is
no artefact for a reviewer to assess, and inserting one would only rebuild the
intermediating tier D-036 removed.

**Escalate straight to Carl** — nothing built yet:

| Trigger |
|---|
| Chunk conflicts with an APPROVED decision in `decisions.md` |
| Task requires deviating from `design.md` with no supporting decision |
| Two APPROVED decisions conflict with each other |
| A design-system conflict surfaces before implementation |
| UX direction is ambiguous and will have architectural consequences |
| New dependency not covered by existing stack decisions |
| Task scope is unclear and could cause significant rework |

**Architect may frame, Carl decides** — an artefact or proposal exists:

| Trigger |
|---|
| A QA finding conflicts with existing implementation |
| Performance trade-off conflicts with design goals |
| A recommendation conflicts with an APPROVED decision |
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

For an active task continued immediately after `/compact`, `/clear`, or automatic compaction, also follow `live-work-protocol.md` Section 7. The current live-work anchor supplements the durable files for that bounded task, and the Builder must complete the re-entry handshake before implementation resumes.

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
- Instruct the Builder to implement without Carl's approval
- Override any entry in `decisions.md` or `design.md`
- Redefine UX direction or premium standards
- Shortcut the routing flow below

### Routing flow

1. Browser observes an issue.
2. A `review-log.md` entry is filed, with severity assigned.
3. The Architect **may frame** the finding — assess its severity, relate it to an approved
   decision, recommend a response. Framing is not approval.
4. **Carl decides.** Every severity routes to Carl: Low, Medium, High and Critical alike.

**No severity tier may be cleared by any agent other than Carl (D-036).** The prior
protocol allowed Low findings to be approved without the founder and Medium to be decided
below him; both are removed. A second approver, however routine the finding, is a second
approver — and consolidating approval is the point of D-036.
            │
            ▼
    Actioned → logged as decision → Claude Code implements
    Dismissed → review entry marked Dismissed with reason
```

---

*Last updated: 2026-07-25 — rewritten for the Architect/Builder two-instance model.
Reporting standard, acknowledgement discipline, anti-patterns and continuity rules
retained from the prior protocol. §2 becomes the chunk definition (the Architect scopes;
it does not specify implementation), §2.5 adds the plan-review gate (Builder plans,
Architect amends, Carl approves), §4 adopts the work-exists-yet escalation discriminant,
and §7 QA routing consolidates to Carl at every severity. Section numbers held stable so
existing cross-references continue to resolve. See `decisions.md` D-036.*
