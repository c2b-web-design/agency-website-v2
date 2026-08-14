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
The Architect's design and review direction takes precedence over Builder implementation preferences. Carl's direction takes precedence over all agents. A lower-layer agent cannot introduce a change that contradicts a higher-layer decision without explicit approval logged as a new decision entry — and only Carl grants that approval (D-036). The Architect recommends; it does not approve.

### Rule 6 — QA cannot override architecture or design-system
Browser Extension findings are observations. They become actionable only after Carl routes and approves them (D-036) — the Architect may frame a finding, but no agent other than Carl moves it to actionable. A finding, however accurate, does not supersede an APPROVED decision.

### Rule 7 — Every component requires documentation before it is considered complete
A component is not done until:
- A documentation file exists in `/project-intelligence/components/{name}.md`
- A review entry has been filed in `review-log.md`
- Any architectural decisions made during its build are logged in `decisions.md`

### Rule 8 — Every visual layer pass must verify all element states before completion
Layered UI workflow only improves determinism if each layer is verified after it is added. A layer that is technically in scope but fails its basic visual purpose is a regression.

For every visual-layer pass on a UI element, verify before marking complete:
- Resting/default state is visible and legible without interaction
- Hover enhances but does not reveal essential visibility (hover-only appearance is a regression unless explicitly requested)
- Focus state remains visible
- Active, selected, disabled, and hidden states still behave as intended
- Existing timing and flow are intact
- Approved layers outside the current layer are unchanged

### Rule 9 — Rendered visual evidence is the source of truth for visual work
Applies to visual styling, material, animation, layout, and interaction polish. Does not apply to every implementation task. When visual evidence is available or requested, it is evidence — not decoration.

Code confirms what changed. Rendered output confirms whether it worked. CSS values can be technically present but visually invisible, too heavy, too weak, too sharp, too soft, or off-brand.

When visual evidence is available or requested:
- Inspect screenshots, browser output, or visual references before judging the result
- Distinguish inspiration references (optical direction only) from target designs (to reproduce)
- Compare the rendered result against the stated visual objective
- State whether the intended visual layer is actually visible
- If code and screenshot disagree, treat the screenshot as the user-facing truth
- Do not claim visual success based only on CSS values
- Use the smallest next adjustment when the screenshot shows the result is close but not correct

For screenshot-based visual review, report in this shape:
- **Objective** — what the layer was meant to achieve
- **What the screenshot confirms** — what is visibly working
- **What is not yet working** — gap between objective and rendered state
- **Likely cause** — root cause of the gap
- **Smallest next adjustment** — one targeted change to close the gap
- **What must not change** — approved layers and behaviour to preserve

---

## Status System

All decisions, work items, and components carry an explicit status. Statuses are written — never implied.

| Status | Definition | Used In |
|---|---|---|
| PROPOSED | Raised for consideration. Not yet reviewed or approved. | `decisions.md`, `review-log.md` |
| PROVISIONAL | In place, deliberately untuned, awaiting the mastering pass (D-035). Not "unapproved" and not a gap — reviewers must not raise a missing approval entry for provisional work. | `decisions.md`, `current-sprint.md`, component docs |
| APPROVED | Reviewed and authorised by Carl. | `decisions.md` |
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
| PROPOSED → APPROVED | Carl only |
| PROPOSED → PROVISIONAL | Carl only |
| PROVISIONAL → APPROVED | Carl only — granted in the mastering pass (D-035), which Carl runs with the Builder |
| PROPOSED → REJECTED | Carl only |
| APPROVED → IN PROGRESS | Builder (self-assigned) |
| IN PROGRESS → IMPLEMENTED | Builder |
| IMPLEMENTED → REVIEW REQUIRED | Builder (automatic on component completion) |
| REVIEW REQUIRED → APPROVED | Carl only — after review. The Architect reports findings; it does not approve. |
| APPROVED → DEPRECATED | Carl only |
| Any status → REJECTED | Carl only |

The Builder cannot move any item to APPROVED. The Builder can move an APPROVED item to IN PROGRESS. The Architect approves nothing — it recommends, and Carl grants (D-036).

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

### ⚠ Approved work is amendable — record the change where the approval lives
**Carl, 11 August 2026:** *"any file that is to do with approved work should be subject to amendments should new work on a particular element or section be recorded in said files."*

**When work lands on an element or section that an approved record describes, amend that record in the same chunk.** Not afterwards, not "when someone notices".

**This is distinct from supersession above.** A superseded decision was *replaced*. An **overtaken** decision still stands — but a fact it relied on, or a cost it weighed, has moved underneath it. Both need recording; only supersession had a rule.

**Where the amendment goes:**
- **A decision's reasoning is overtaken** → a **new** `decisions.md` entry that names what moved and why, plus a forward-pointer on the original. Do not silently edit the original's argument.
- **A code comment asserts something no longer true** → correct it *in place*, keep the original claim as history, and state what is still true. ⚠ **A reader reaches the comment before the governance file.**
- **A rejection is revisited** → say explicitly whether the amendment *reopens* the question or *decides* it. They are different, and only Carl decides.

⚠ **A DECISION IS NOT WRONG BECAUSE IT HAS BEEN OVERTAKEN, AND THE RECORD MUST SAY SO.** D-046 correctly declined the shared-canvas host on 9 August; two of its three grounds were then removed by unrelated work. **A cost/benefit judgement expires when either side moves.** Writing this up as "D-046 was mistaken" would be both false and corrosive — the next author would learn that records are attacked rather than updated. See **D-048**.

⚠ **SWEEP FOR EVERY COPY OF THE CLAIM, NOT JUST THE ONE IN FRONT OF YOU.** Stale assertions cluster: three comments asserting a removed viewport gate were corrected on 10 August, and the partial sweep left a **fourth** and then a **fifth** — the fifth *half* true, its true clause making the false one read as verified. `grep` the whole file for the claim.

⚠ **A STALE COMMENT IS AN INSTRUMENT.** It is what the next reader measures the code by, and it lies exactly as a bad harness lies — one misled a plan into asking the Architect to rule on a gate that no longer existed.

**What this rule does not license:** amending an approved record does not amend the approval. Changing what a file *says* about approved work is a Builder's job; changing the approved work itself needs Carl.

### ⚠⚠ AN INSTRUMENT THAT NAMES A GLOBAL PROPERTY WHILE CHECKING A LOCAL ONE LIES BY IMPLICATION

**Worked case, 14 August 2026 — `verify/one-context.mjs`.** It is called *one-context*, it prints
**"✅ ONE CONTEXT"** and **"2/2 runs held ONE context across all five questions"**, and every word
of that is **true of the thing it checks**: the card host's canvas is created once, never lost,
same element at Q1.

⚠ **And the page was creating a NEW WebGL CONTEXT ON EVERY QUESTION STEP** — eight across a
five-question walk — because `NextStepMeshButton` sits inside the keyed phrase and is rebuilt each
time. **The harness never looked at any canvas but the host.** The shared-host restructure was
built, measured and shipped against that green verdict while a second canvas paid the exact cost
the restructure existed to remove.

**The defect is not a wrong answer. It is a true answer to a narrower question than its name
implies.** A reader — including its author — reads "one context" as a claim about the *page*.
Nothing in the output said otherwise, so nothing prompted anyone to check.

⚠ **THE RULE: every harness must declare what it does NOT watch, IN ITS OUTPUT — not only in its
header.** A scope caveat in a comment is read once, by whoever opens the file; the verdict is read
every run, by whoever is deciding something. **The place a limit has to appear is next to the
number it qualifies.**

    ⛔ VERDICT — 2/2 runs held ONE context across all five questions
    ✅ VERDICT — 2/2 runs: the CARD HOST held one context across all five questions.
                 ⚠ NOT WATCHED: every other canvas on the page (the warm-up, the
                   contact field, NextStepMeshButton). This is not a page-wide count.

**Applies to every instrument in `verify/`, not just this one.** Before trusting a green verdict,
ask what the harness would have to be watching for that verdict to mean what its name says — and
if the answer is "more than it watches", the output must say so.

⚠ **This is the same family as the harness rules already recorded** — sharing a constant with the
fix, keying on a property the design varies, never having gone red. **All four are ways an
instrument can be working perfectly and still mislead.**

### ⚠⚠ NO GATE ASSERTS SOURCE-FILE SANITY — a control character passed all four

**Worked case, 14 August 2026, commit `b17eac4`.** A literal **NUL byte (0x00)** was written into
`answer-card-canvas.tsx` in place of a space — `labels.join("\0")` instead of `labels.join(" ")`.
It was committed and pushed.

⚠ **IT PASSED EVERYTHING:**

    npx tsc --noEmit        clean
    npm run lint            1 problem (1 error, 0 warnings) — the known baseline, unchanged
    npm run build           compiled successfully
    the behavioural walk    00000 across all five arrivals — the CORRECT result

**And it passed because it worked.** NUL is a legal string separator, so the key computed
correctly and the feature behaved exactly as intended. **No gate in this project asserts that a
source file contains only sane characters**, and none of them noticed.

⚠ **WHAT ACTUALLY CAUGHT IT: `grep` refused to search the file.** Git and ripgrep classify a file
containing NUL as **binary**, so `Grep` returned *"binary file matches"* instead of results. The
defect surfaced as a **tool failing to work**, not as any check failing.

**The consequences, which are worse than the byte:**
- **`git diff` degrades to "Binary files differ"** — the file becomes unreviewable in every diff
  view, so a reviewer sees nothing at all rather than something wrong.
- **Search tools skip it silently.** Any later `grep` for a symbol in that file returns nothing,
  and "no matches" reads as "not present" — the exact inference that produces a wrong conclusion.

**The rule:** ⚠ **if a search tool reports a source file as binary, stop and find out why.** Do not
work around it by switching tools. That message is not noise about encodings; on a `.ts`/`.tsx`/
`.mjs` file it means the file contains something that does not belong in source.

⚠ **AND THE GENERAL LESSON, WHICH IS THE POINT OF RECORDING IT HERE: a green gate proves the thing
it tests, and nothing else.** Four gates agreed the file was fine. None of them was asked whether
the file was *well-formed*, because nobody had thought to ask. **The failure mode is not a gate
being wrong — it is a gate being absent and its absence looking identical to a pass.**

### Formatting consistency
Use the established schema for every entry type. Do not add new fields. Do not omit mandatory fields. Schema deviations require a governance update to the relevant file.

---

## Session Protocol

### Starting a session

1. Read `mission-overview.md` — confirm project identity and stage
2. Read `current-sprint.md` — understand what is authorised now. **It carries no roadmap** (D-038)
3. Read `decisions.md` — identify APPROVED decisions relevant to the task
4. Read domain-specific files for the task (architecture, design, component docs)
5. Do not ask for context that should already exist in project-intelligence files
6. Do not rely on chat history from previous sessions
7. If this is a `/compact`, `/clear`, or automatic-compaction continuation of active work, follow the fresh-context re-entry handshake in `live-work-protocol.md` before editing
8. Treat the repository diff and consistent live-work anchor as authoritative; a resumable transcript is supporting evidence only

### During a session

- If a decision is made: log it in `decisions.md` before the session ends
- If scope expands beyond the sprint goal: **flag it to Carl and stop** — do not silently expand, and do not park it in a roadmap section (D-038)
- If a blocker is encountered: add it to `current-sprint.md` Blockers before stopping

### Ending a session

1. Log all decisions made during the session in `decisions.md`
2. Update `current-sprint.md` — completed tasks to Completed. **Do not create an "Up Next" or roadmap section** (D-038); future work is not recorded in this repository. Newly discovered work goes to Carl, who decides whether it becomes a chunk
3. Create or update component documentation if a component was built or modified
4. File a review entry in `review-log.md` if a component or significant change was completed
5. **Raise unresolved questions with Carl** — do not record them as an Open Questions section (D-038)

### Sprint continuity

**Blockers** are carried forward from sprint to sprint until resolved. When archiving a sprint, copy unresolved Blockers into the new `current-sprint.md` verbatim. Do not discard them.

**Forward-looking items are not carried forward** — they go to Carl, who holds the future-work record outside this repository (D-038). A question with no current answer is not a Blocker unless it is blocking authorised work.

### Unresolved issues

An unresolved issue is never silently dropped. It either:
- **Goes to Carl**, who decides whether it becomes a chunk — this replaces the former "add it to Up Next" route (D-038)
- Becomes a Blocker in `current-sprint.md`
- Or is explicitly Dismissed with a one-line reason noted

**Not being written down as future work is not the same as being dropped.** The rule is that
Carl hears about it; the repo is not the place it waits.

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

*Last updated: 2026-08-11 — "Approved work is amendable" added to File Integrity Rules on Carl's instruction: a record describing an element must be amended when new work lands on it. Distinct from supersession, which was already covered. Worked case: D-046/D-048.*
