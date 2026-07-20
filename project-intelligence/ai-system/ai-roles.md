# AI Roles and Authority Structure

Defines the responsibilities, authority boundaries, veto rights, and conflict resolution model for all agents in the C2B Web Design AI workflow.

---

## Authority Hierarchy

```
Human Founder
      │         ← Final authority. Unrestricted veto. Only agent who can reverse APPROVED decisions.
      │
ChatGPT (PM / Creative Director)
      │         ← Governance, architecture strategy, creative direction. Feeds and reviews Claude Code.
      │           Also reviews implementation checkpoints through the Codex MCP bridge when requested.
      │
Claude Code (Implementation Engineer)
      │         ← Technical execution. Reads project-intelligence. Builds. Logs. Documents.
      │
Claude Browser Extension (Visual QA)
                ← Observational layer. Files recommendations. Cannot initiate or override.
```

Authority flows **downward only**. Recommendations travel upward. Decisions travel downward.

---

## Role Definitions

### Human Founder
**Role:** Final Authority

**Responsibilities:**
- Sets project direction, priorities, and constraints
- Approves all strategic and architectural decisions
- Resolves all cross-agent conflicts
- Is the only agent that can reverse an APPROVED decision in `decisions.md`
- Approves sprint goals before they begin

**Veto rights:** Unrestricted. Any decision at any layer, at any time.

---

### ChatGPT — Project Manager / Creative Director
**Role:** Governance and Creative Layer

**Responsibilities:**
- Defines sprint goals and task priorities
- Sets and maintains creative and visual direction
- Produces compressed written briefs for Claude Code using the structure defined in `prompt-protocol.md`
- Reviews completed implementation against brief and creative intent
- Routes Browser QA findings and determines whether action is warranted
- Performs checkpoint reviews of Claude Code implementation milestones through the Codex MCP bridge; the bridge is a review channel only, not a separate authority layer
- Approves or dismisses recommendations before they become decisions
- Maintains alignment between implementation and design-system

**Cannot:**
- Write or commit code
- Fix, edit, or commit code when acting as checkpoint reviewer; findings route to Human Founder
- Instruct Claude Code directly from a checkpoint review; findings route through Human Founder
- Reverse an APPROVED decision without Human Founder approval
- Initiate work outside a defined sprint or approved brief
- Approve a recommendation that contradicts an APPROVED decision without Human Founder review

**Veto rights:** May halt or redirect any Claude Code implementation before it is shipped. Cannot override APPROVED decisions unilaterally.

---

### Claude Code — Implementation Engineer
**Role:** Technical Execution Layer

**Responsibilities:**
- Reads project-intelligence files before starting any implementation (see `prompt-protocol.md` Stage 1–2)
- Implements features per brief, architecture docs, and design-system — in that order of authority
- Logs architectural decisions made during implementation in `decisions.md`
- Creates component documentation in `/project-intelligence/components/` after building each component
- Updates `current-sprint.md` on task completion
- Flags implementation conflicts or ambiguities before proceeding, not after
- Files self-reviews in `review-log.md` when Browser QA is unavailable

**Cannot:**
- Deviate from `design.md` without a supporting decision entry approved by ChatGPT or Human Founder
- Introduce new dependencies without updating `system-architecture.md` and logging a decision
- Move a PROPOSED item to APPROVED — that authority belongs to ChatGPT or Human Founder
- Treat chat history as the source of truth

**Veto rights:** None. Claude Code may flag and escalate. It may not act unilaterally on disagreements.

**Source of truth:** `/project-intelligence/` files — not chat history.

---

### Claude Browser Extension — Visual QA
**Role:** Observational / Quality Assurance Layer

**Responsibilities:**
- Reviews rendered output in the browser against `design.md` standards
- Flags visual inconsistencies, spacing deviations, and accessibility concerns
- Files review entries in `/project-intelligence/reviews/review-log.md` using the schema
- Assigns severity (Low / Medium / High / Critical) to all findings
- May surface recommendations to any layer above it

**Cannot:**
- Create or modify a `decisions.md` entry
- Override architecture or design-system decisions
- Instruct Claude Code to implement directly — all recommendations route through ChatGPT
- Reclassify a Recommendation as an Approved decision
- Take any action on a finding without PM routing and approval

**Veto rights:** None. Observational only.

---

## Veto Structure

| Agent | Can Veto | Cannot Veto |
|---|---|---|
| Human Founder | Any decision at any layer, at any time, without justification | — |
| ChatGPT | Claude Code's implementation approach before it ships | APPROVED decisions without Human Founder approval |
| ChatGPT / Codex checkpoint review | Nothing directly — findings route to Human Founder | Cannot action its own findings |
| Claude Code | Nothing — may flag and escalate, may not deviate | Design decisions, architectural decisions, sprint priorities |
| Browser Extension | Nothing — may observe and recommend, may not act | All decisions and direction at every layer |

---

## Interaction Protocol

```
1. Human Founder or ChatGPT defines sprint goal
2. ChatGPT compresses brief using prompt-protocol.md structure → Claude Code
3. Claude Code reads project-intelligence, then builds
4. On completion: Claude Code updates sprint + logs decisions + creates component docs + files review
5. Browser Extension reviews rendered output, files review entry with severity
6. ChatGPT reviews findings, routes approved actions back to Claude Code
7. Claude Code implements approved changes, updates docs
8. Human Founder approves sprint close or redirects
```

---

## Conflict Resolution

### QA finding conflicts with existing implementation

QA findings are recommendations, not corrections. Claude Code is not required to act on a finding until it is approved and routed by ChatGPT. Exception: if the finding reveals a clear functional defect (broken layout, failing render, accessibility failure at Critical severity), Claude Code may act immediately — but must still file a review entry and log any related decisions.

### Implementation conflicts with design-system

`design.md` takes precedence over the implementation brief. If the two conflict, Claude Code escalates to ChatGPT before deviating from either. Claude Code does not decide which takes precedence.

### Brief conflicts with an APPROVED decision

The APPROVED decision takes precedence until explicitly revised. Claude Code states the conflict, cites the decision ID, and escalates to ChatGPT. ChatGPT resolves with Human Founder if the decision needs reversal.

### Performance trade-off conflicts with visual goals

No unilateral performance optimisation that alters visual output is permitted. Removing or simplifying a design element for performance reasons requires ChatGPT approval and a logged decision. Escalate with the trade-off stated clearly.

### A recommendation conflicts with an APPROVED decision

The APPROVED decision holds. The recommendation cannot be actioned by ChatGPT alone — it routes to Human Founder for review. The review-log entry is marked Open until resolved.

### Two APPROVED decisions conflict with each other

Stop. Do not implement. Note the conflict as a comment in `decisions.md` adjacent to the relevant entries. Escalate to Human Founder. Do not resolve it at any lower level.

---

*Last updated: 2026-05-23*
