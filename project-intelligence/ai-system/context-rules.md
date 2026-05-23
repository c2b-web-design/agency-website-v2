# Context Rules

The operational integrity document for the C2B Web Design AI system. Governs how information is created, stored, updated, and carried forward across all agents and sessions.

---

## Core Rules

### Rule 1 — Chats are not the source of truth
AI conversations are working memory, not project memory. Nothing decided in a chat session persists unless it is compressed and written into `/project-intelligence/`. A session that relies on chat history is operating on unreliable context.

### Rule 2 — Project-intelligence files are the source of truth
Any agent beginning a task must read the relevant project-intelligence files before proceeding. The files reflect the current agreed state of the project. Chat history does not.

### Rule 3 — No raw AI conversations in documentation
Transcripts, uncompressed AI responses, and full chat logs must never be copied into project-intelligence files. Only the following belong:
- Decisions (logged in `decisions.md`)
- Implementation summaries (what was built, not how it was discussed)
- Finalized creative or technical direction

### Rule 4 — Compressed information only
The compression test: *would a new agent reading only this entry understand the decision, state, or finding accurately and completely, without access to any chat history?* If yes, write it. If no, compress further until it passes.

### Rule 5 — Authority flows downward
ChatGPT direction takes precedence over Claude Code implementation preferences. Human Founder direction takes precedence over all agents. A lower-layer agent cannot introduce a change that contradicts a higher-layer decision without explicit approval logged as a new decision entry.

### Rule 6 — QA cannot override architecture or design-system
Browser Extension findings are observations. They become actionable only after ChatGPT review and approval. A finding, however accurate, does not supersede an APPROVED decision.

### Rule 7 — Every component requires documentation before it is considered complete
A component is not done until:
- A documentation file exists in `/project-intelligence/components/{name}.md`
- A review entry has been filed in `review-log.md`
- Any architectural decisions made during its build are logged in `decisions.md`

---

## Status System

All decisions, work items, and components carry an explicit status. Statuses are written — never implied.

| Status | Definition | Used In |
|---|---|---|
| PROPOSED | Raised for consideration. Not yet reviewed or approved. | `decisions.md`, `review-log.md` |
| APPROVED | Reviewed and authorised by the appropriate authority. | `decisions.md` |
| IN PROGRESS | Actively being implemented in the current session or sprint. | `current-sprint.md` |
| IMPLEMENTED | Built and documented. Review may still be pending. | `current-sprint.md`, component docs |
| REVIEW REQUIRED | Implementation complete. Awaiting QA or PM review. | `review-log.md`, `current-sprint.md` |
| REJECTED | Considered and declined. Reason is recorded. | `decisions.md`, `review-log.md` |
| DEPRECATED | Previously APPROVED. Superseded or removed. Retained for record. | `decisions.md` |
| BLOCKED | Cannot proceed — named dependency or decision missing. Blocker must be explicit. | `current-sprint.md` |
| ARCHIVED | Sprint or work item closed and preserved in archive. No further updates. | `active-sprints/archive/` |

### Status Transition Authority

| Transition | Authority |
|---|---|
| PROPOSED → APPROVED | ChatGPT or Human Founder |
| PROPOSED → REJECTED | ChatGPT or Human Founder |
| APPROVED → IN PROGRESS | Claude Code (self-assigned) |
| IN PROGRESS → IMPLEMENTED | Claude Code |
| IMPLEMENTED → REVIEW REQUIRED | Claude Code (automatic on component completion) |
| REVIEW REQUIRED → APPROVED | ChatGPT (after QA review) |
| APPROVED → DEPRECATED | Human Founder only |
| Any status → REJECTED | ChatGPT or Human Founder |

Claude Code cannot move a PROPOSED item to APPROVED. Claude Code can move an APPROVED item to IN PROGRESS.

---

## Context Compression Rules

Every documentation entry must pass the compression test before being written.

### Rules

| Rule | Write This | Not This |
|---|---|---|
| Decisions over discussions | `Decision: use Tailwind v4` | `After discussing v3 vs v4, we agreed that...` |
| Summaries over reasoning | `Container: max-w-7xl, responsive px, mx-auto` | `I considered several approaches to width constraints...` |
| State over process | `Font not rendering — circular CSS variable reference` | `After investigation, I discovered the issue was caused by...` |
| Present tense over narrative | `The stack uses Next.js App Router` | `We decided to use Next.js App Router` |
| File path over description | `See design.md — Motion section` | `As documented in our design system notes...` |
| Outcome over method | `shadcn/ui installed. components.json created. cn() available.` | `I ran the CLI and it prompted me for several options...` |

---

## File Integrity Rules

### No duplication
If information belongs in `decisions.md`, it does not also belong as narrative text in `system-architecture.md`. Cross-reference instead: `see D-004`.

### No contradiction
Before writing an entry, verify it does not conflict with existing entries in the same file or related files. If a conflict exists, resolve or flag it before writing.

### No orphan entries
- Every `review-log.md` entry references a subject (file, component, or sprint)
- Every `decisions.md` entry references the authority who made it
- Every component doc references the review entry that reviewed it

### No retroactive rewriting
When a decision is superseded: mark the original DEPRECATED, create a new entry. Never edit or delete the original. History is preserved, not rewritten.

### Formatting consistency
Use the established schema for every entry type. Do not add new fields. Do not omit mandatory fields. Schema deviations require a governance update to the relevant file.

---

## Session Protocol

### Starting a session

1. Read `mission-overview.md` — confirm project identity and stage
2. Read `current-sprint.md` — understand what is IN PROGRESS and what is Up Next
3. Read `decisions.md` — identify APPROVED decisions relevant to the task
4. Read domain-specific files for the task (architecture, design, component docs)
5. Do not ask for context that should already exist in project-intelligence files
6. Do not rely on chat history from previous sessions

### During a session

- If a decision is made: log it in `decisions.md` before the session ends
- If scope expands beyond the sprint goal: flag it and add to Up Next — do not silently expand
- If a blocker is encountered: add it to `current-sprint.md` Blockers before stopping

### Ending a session

1. Log all decisions made during the session in `decisions.md`
2. Update `current-sprint.md` — completed tasks to Completed, new tasks to Up Next
3. Create or update component documentation if a component was built or modified
4. File a review entry in `review-log.md` if a component or significant change was completed
5. Record unresolved questions in `current-sprint.md` Open Questions

### Sprint continuity

Open Questions and Blockers are carried forward from sprint to sprint until resolved. When archiving a sprint, copy all unresolved Open Questions and Blockers into the new `current-sprint.md` verbatim. Do not discard them.

### Unresolved issues

An unresolved issue is never silently dropped. It either:
- Becomes a task in Up Next
- Becomes an Open Question
- Becomes a Blocker
- Or is explicitly Dismissed with a one-line reason noted

---

## What Does Not Belong in Project Intelligence

| Excluded | Reason |
|---|---|
| Full AI chat transcripts | High volume, low signal, ephemeral |
| Debugging sessions | Log the outcome and fix, not the investigative process |
| Explored-and-discarded approaches | Not a decision; not relevant to future agents |
| In-progress speculation | Working memory belongs in chat, not docs |
| "We discussed..." phrasing | Documentation records decisions, not conversations |
| Motivational or framing language | Governance docs are operational, not editorial |

---

## Documentation Integrity Standards

- Write in the present tense. Not *we decided* but *the decision is.*
- Write for a new agent with no prior context. Assume nothing is known outside this file system.
- Never duplicate content across files. Cross-reference by file path and section.
- Mark superseded entries DEPRECATED. Do not delete.
- Keep entries short. If an entry requires more than six lines of prose, it is not sufficiently compressed.

---

*Last updated: 2026-05-23*
