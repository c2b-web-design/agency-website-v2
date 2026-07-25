# Live Work Protocol

Governs temporary file-based handoff between the Builder, the Architect, and Carl during active implementation work. Live-work files exist to reduce copy/paste relay, expose plans, checkpoints, git evidence and screenshots to the Architect, and support drift detection before work is built on.

Cross-references: `ai-roles.md`, `checkpoint-review-protocol.md`, `prompt-protocol.md`, `context-rules.md` Rules 1-4, 8, 9, `decisions.md` D-036, `workflow-redesign/` DL-7.

---

## 1. Purpose

The Builder's chat panel is working memory, not project memory. During active work, important plan, status, screenshot, git-evidence and run-log information must be saved to a shared temporary folder so the Architect can inspect it without Carl copying and pasting chat output.

The live-work folder is a transport surface. It is not the permanent source of truth. Permanent outcomes still belong in `decisions.md`, `review-log.md`, component docs, sprint notes, or other established project-intelligence files (D-006).

**Capability boundary — why this file exists at all.** A reviewing instance cannot read the Builder's chat panel. This is **not** a Codex-specific limit that retired with Codex: it is true of *any* separate instance, including the Architect, because separate instances have separate context and no shared session (D-006). The Architect sees what the Builder saves into `live-work/`, plus normal repository changes — nothing more. If relevant Builder chat content is not saved there, the Architect cannot see it.

That boundary is a **feature, not a defect**: file-only handoff is exactly what keeps the Architect's review independent of the Builder's framing, which is why the review catches drift instead of rubber-stamping it.

---

## 2. Location

Temporary live-work files live under:

`project-intelligence/live-work/`

Durable templates and instructions in that folder are committed. Generated plans, logs, transcripts, screenshots, and checkpoint files are scratch artifacts and are ignored by Git unless Carl explicitly chooses to preserve one.

---

## 3. Required Files

The Builder writes or updates these files during active work:

| File | Purpose | Default lifecycle |
|---|---|---|
| `claude-plan.md` | Current plan shown to Carl before implementation | Overwritten per task |
| `architect-plan-response.md` | Architect approval, amendments, or rejection of the plan | Overwritten per task |
| `current-status.md` | Short live status during implementation | Overwritten frequently |
| `checkpoint-request.md` | the Builder's checkpoint package for the Architect | Overwritten per checkpoint |
| `architect-review-response.md` | Architect checkpoint findings | Overwritten per checkpoint |
| `claude-chat-window.md` | Two jobs (§5): relevant Builder chat-window content, **and** the Builder's reasoning at checkpoint, kept separate from git evidence | Overwritten during and after each Builder action cycle |
| `git-evidence.md` | Raw `diff`, `log` and attribution for the changed work (DL-7). Evidence, not argument — see §5a | Overwritten per checkpoint |
| `claude-run-log.md` | End-of-run summary of what happened | Overwritten per run |
| `claude-run-transcript.md` | Optional fuller transcript/extract when useful | Created only when needed |
| `claude-context-status.json` | Machine-readable Claude context-window status written by the status-line script | Replaced atomically on status-line updates; ignored by Git |
| `drift-sentinel.md` | ⚠ **No watch currently runs** (§6, §8). Retained for history and for Carl-triggered stops. `STATUS: CONTINUE` means "no watch running", not "watched and clear" | Overwritten per check |
| `screenshots/` | Saved visual evidence for review | Cleared or overwritten per task |
| `references/` | Stable references for the active task when needed | Cleared or promoted after task |

---

## 4. Plan Handoff

When the Builder produces a plan for Carl, it must also save the same plan to:

`project-intelligence/live-work/claude-plan.md`

Carl may read the plan in VS Code. When Carl tells the Architect "I have read the plan", the Architect reads the saved plan directly, then writes its response to:

`project-intelligence/live-work/architect-plan-response.md`

Carl can then tell the Builder:

`Read project-intelligence/live-work/architect-plan-response.md and proceed from that instruction.`

This removes the need for Carl to relay the plan between instances by hand.

---

## 5. Run Log

During and at the end of each Builder action cycle, the Builder writes or overwrites:

`project-intelligence/live-work/claude-chat-window.md`

This file is the copy/paste replacement for Carl. It contains the relevant content that appeared in the Builder chat window: the Builder's plan/status text, important tool results, errors, decisions made during the run, code-change summaries, and any final report. It does not need to be a verbatim full transcript when that would add noise, but it must include enough chat-window content for the Architect to understand what the Builder did, what it saw, and where the work stands without Carl pasting the chat manually.

**This file has two jobs. Do not mistake the second for a duplication.**

1. **Chat-panel extract** — the above. No instance can read another's chat panel (§1), so
   what matters must be written down.
2. **Builder reasoning at checkpoint (DL-7)** — at a checkpoint review, the Builder's
   *reasoning* about the change lives here, deliberately kept **separate from the raw git
   evidence** (§5a). The Architect weighs reasoning against evidence rather than taking
   either on trust. This is what let the 24 July review catch a false byte-identical
   claim: the reasoning asserted one thing and the evidence showed another.

Both jobs are the same underlying function — surfacing what is otherwise trapped in the
Builder's session so an independent reviewer can assess it. Keeping reasoning and evidence
in **separate files** is not redundancy; it is what makes the review adversarial rather
than confirmatory.

---

## 5a. Git Evidence At Checkpoint (DL-7)

> **⏸ OPEN — raise this with Carl when the VS1 architect instance is set up.**
> *Carl's instruction, 25 July 2026: "we will revisit… you will bring it up as a reminder
> to me. we will discuss then." Deferred, not decided. The Builder is to raise it at
> setup time rather than wait to be asked.*
>
> **What is settled:** the architect reads the working tree **directly from disk** — every
> file, current, including uncommitted work. It is not "partially sited"; it sees the
> project. Confirmed 24 July: it read the code well enough to find a defect the Builder
> had missed over two days.
>
> **What is open:** it cannot ask git questions about *time*, because `Bash` is denied and
> that is what removes `git`. The gap is **history**, not state.
>
> **The question that actually bit (F-1, 24 July):** it found the q5proto layer,
> understood it, and could not tell whether it was **new drift or prior committed work**.
> Attribution. It handed the finding back unresolved; the Builder closed it with one
> command.
>
> **The structural one, and the reason this deserves a real discussion rather than a
> shrug:** under DL-7 the architect reviews the Builder's work against *the Builder's own
> account of that work*. That narrows the independence the review exists to provide. It is
> why §5a insists on **evidence, not argument** — but the dependency remains.
>
> **Routes to weigh at that point** (DL-7 chose the first, partly because the third turned
> out unlicensed — it was one answer, not the only one):
> 1. Builder-supplied evidence — current position. Zero new trust surface; keeps the
>    dependency above.
> 2. Re-enable `Bash` for the architect — self-serving history, but **DL-1 proved this
>    makes the read-only boundary cosmetic**. Would need re-attacking, not re-reading.
> 3. A read-only git MCP server — right shape per P-B (no write tools in the surface).
>    `@readonly-mcp/core` was rejected on `license: NONE` + unpublished + single anonymous
>    author. **Re-check whether a licensed, published option exists by then.**
>
> **Worth separating in that discussion:** read-only *writes* is what keeps the review
> independent — an architect that can edit becomes a second builder. Read-only *history*
> was never the goal; it came along because denying `Bash` was the only way to enforce the
> first. Those two got bundled, and they need not stay bundled.

The Architect is structurally read-only and runs no `git` itself, so git-dependent findings
can only be closed from evidence the Builder supplies.

Before each checkpoint review, the Builder saves raw git evidence — `diff`, `log`, and
attribution for the changed work — into `live-work/` as a **distinct artefact**, separate
from its reasoning in `claude-chat-window.md`. This is the item `checkpoint-review-protocol.md`
§4 requires.

**Evidence, not argument.** Raw command output the Architect can read for itself, not the
Builder's characterisation of it.

**Why this route.** The alternatives were examined and rejected (`workflow-redesign/`
DL-7): a read-only git MCP server (rejected — `license: NONE`, unpublished, single
anonymous author) and a Bash git allow-list (rejected — Anthropic's own documentation calls
argument-constraining Bash patterns fragile). Builder-supplied evidence gives the Architect
git **facts** without a git **capability**, which is the same no-write-surface principle
that governs the read-only boundary itself.

**Cost, stated plainly:** git-dependent findings close on a one-turn handoff rather than by
the Architect serving itself. On 24 July, F-1 was handed back unresolved for want of this.

At the end of each Builder run, the Builder writes:

`project-intelligence/live-work/claude-run-log.md`

The log is compressed. It contains only what the Architect needs to review the run:

- Task
- Plan followed
- Files changed
- What changed
- Commands/checks run
- Screenshots saved
- Architect checkpoint result, if any
- Issues or deviations
- Final status
- Next suggested action

Full raw transcripts are not written by default. For complex, visual, risky, or drift-prone work, the Builder may also write a fuller extract to:

`project-intelligence/live-work/claude-run-transcript.md`

The transcript/extract is temporary working material, not permanent documentation.

---

## 6. Drift Sentinel

For sensitive visual, material, animation, Three.js, layout, or approved-foundation work, the Builder must not work silently for long stretches. It writes live status and checkpoint files in small steps so the Architect can inspect saved state.

### ⚠ Not currently in force — see §8

**The automatic Sentinel described below does not run.** Under the retired layer, Codex
activated it at execution start. Nothing does so now. The Builder's obligation to write
status and checkpoint files in small steps **remains in force**; the continuous watching of
those files does not.

`STATUS: CONTINUE` in `drift-sentinel.md` therefore means *"no watch is running"*, not
*"a watch is running and sees no drift"*. Do not read it as an active all-clear.

### Retained specification, for whoever eventually owns the mechanism

Kept because it describes what the watch should *do* — harness-agnostic, and the one thing
worth salvaging from the Sentinel. **This is a specification, not a live instruction.**

A Sentinel, once built, should:

- trigger on the transition into implementation execution — not on plan-mode discussion or read-only investigation
- use the latest approved prompt, the Builder's plan, and the Architect's amendments as its comparison baseline
- inspect `claude-context-status.json`, `current-status.md`, `claude-chat-window.md`, `claude-run-log.md`, current checkpoint files, relevant screenshots, and the repository diff
- preserve unrelated working-tree state, and distinguish normal incomplete work or objective in-scope correction from genuine drift
- run at a two-minute interval by default; one-minute when the task is unusually destructive, architectural, or drift-prone
- alert with `STOP CLAUDE` when real drift is found, followed in the same message by one complete copy-ready corrective prompt — a stop-only alert requiring a second round-trip is not sufficient
- continue until the implementation checkpoint is complete or the work is stopped, then perform a final read-only review and stand down

**Design note for that future mechanism (P-A).** An agent *asked* to run this loop is an
intention, not a control — that is exactly how the retired Sentinel came to sit at
`STATUS: STOP` while work was being submitted for review. A condition that fires is a
mechanism. Prefer a hook over an instruction.

The Builder updates:

- `current-status.md` during work
- `checkpoint-request.md` at meaningful implementation checkpoints
- `screenshots/` when visual behaviour matters
- `claude-run-log.md` at the end of the run

The Architect inspects the saved state. If drift is detected, the Architect writes:

`project-intelligence/live-work/drift-sentinel.md`

with a clear status:

- `STATUS: CONTINUE`
- `STATUS: STOP`

### STOP alert and correction handoff

If the Architect detects real drift while the Builder is still executing, the user-facing alert must:

1. begin exactly `STOP CLAUDE`
2. state the precise evidence and why the current course conflicts with the approved scope
3. include one fenced, copy-ready prompt that Carl can paste immediately, including when the Builder's UI Stop control is unavailable or greyed out
4. make that prompt stop the current course and provide the complete next instruction: the required correction, strict boundaries, preservation requirements, verification, and live-work handoff

The alert must not merely tell Carl to press Stop and return later for instructions. Carl should need one paste, not a stop-only message followed by a second corrective prompt. the Architect routes this prompt through Carl; it does not instruct the Builder directly through the MCP bridge.

If the Builder has already stopped implementation and written its checkpoint or handoff files, the Architect must not describe it as active drift. the Architect instead reports the checkpoint finding and supplies a copy-ready next-action prompt for Carl to use if he authorises a correction.

---

## 7. Context Refresh Gate

the Builder's chat is expendable working memory. The repository and the refreshed live-work anchor are the continuity mechanism. A context refresh is therefore a controlled handoff, not an informal slash command used while work continues.

### Context visibility

Each implementation session should expose the context-window used and remaining percentages in the Builder's persistent status line. Carl may configure this with `/statusline`. If the status line is unavailable or unclear, `/context` is the immediate diagnostic command.

The status-line script should also atomically replace:

`project-intelligence/live-work/claude-context-status.json`

using `workspace.project_dir` from the Builder's status-line input rather than a machine-specific absolute project path. The file contains only:

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

The Builder updates the status-line input after interaction events and after compaction; it is not a continuous per-token feed. The writer therefore uses a real timestamp and atomic replacement. the Architect treats a missing, malformed, or stale file as `UNKNOWN`, never as GREEN.

`/context` only reports usage. `/compact` summarizes the active conversation. `/clear [name]` saves the old conversation under the supplied name and opens a new empty conversation. These commands are not interchangeable.

Project operating bands use the displayed **used percentage**:

| State | Context used | Required action |
|---|---:|---|
| GREEN | Below 50% and no native context warning | Continue the current bounded workflow. |
| AMBER | 50% to below 55%, or the Builder shows its native context indicator/warning | Notify Carl immediately with **COMPACTION AMBER**. Finish only the command or bounded verification already running. Do not start the next step. |
| RED | 55% or above, an automatic-compaction warning, or uncertain state after compaction | Notify Carl immediately. Stop at the next safe command boundary, refresh the anchor, and use `/clear [name]` unless Carl and the Architect explicitly approve another route. |

These are deliberately conservative project safety thresholds, not claims about the Builder's platform limit. The alert occurs as soon as usage reaches 50% because Claude may already be inside a large multi-file action. The narrow five-point AMBER band preserves enough headroom to finish that one bounded action, write a complete anchor, and refresh cleanly before reasoning quality or platform auto-compaction becomes relevant.

### Automatic Context Watch

When Carl says a the Builder session is actively planning, investigating, verifying, or editing, the Architect starts a lightweight Context Watch unless the active Drift Sentinel already performs that check. It reads `claude-context-status.json` at the same one- or two-minute cadence used for live work.

- GREEN: no user notification.
- AMBER: notify Carl, inspect the current live-work state, and provide one current-state anchoring prompt. Do not rely on a stock prompt.
- RED: notify Carl to stop after the command presently running, then provide the complete anchor-and-refresh instruction.
- UNKNOWN or stale while Claude is known to be active: notify Carl that automatic context visibility is unavailable and request `/context` or status-line repair; do not guess a percentage.

The Context Watch is monitoring only. It does not broaden implementation authority, send instructions directly to the Builder, or replace Carl's control of `/compact`, `/clear`, and `/resume`.

### Amber stop and anchor

On **COMPACTION AMBER**:

1. the Builder may finish only the command or bounded verification currently running. It must not begin another implementation step, second verification, investigation branch, or correction cycle.
2. the Architect gives Carl one fenced, copy-ready anchoring prompt written for the **current** state.
3. the Builder refreshes all four continuity files:
   - `current-status.md` - exact current state, context state, completed and outstanding work, next permitted action
   - `claude-chat-window.md` - methodology, important chat output, corrections, rejected approaches, and current conclusion
   - `claude-run-log.md` - files changed, commands and checks run, results, deviations, and remaining work
   - `checkpoint-request.md` - current review package and verification status when a checkpoint exists
4. the Builder pauses and explicitly confirms that the live-work anchor is complete. It must not start another command.
5. the Architect performs a read-only **anchor integrity check** before any context command is used.

The anchor integrity check fails if the four files disagree about whether implementation is complete, which checks remain outstanding, what code is current, or what action is next. Superseded sections must be marked clearly, and their headings must not contradict the authoritative current section. A stale sentence such as "two tests outstanding" after those tests passed must be corrected before `/compact` or `/clear`.

The anchoring prompt is disposable. It must describe the command actually in progress and the checks actually outstanding at the moment it is issued. Never reuse an earlier context-refresh prompt after the task state has changed.

### Choosing compact or clear

Carl chooses the context action with the Architect only after the anchor passes:

- Use focused `/compact [instructions]` only when this is the first compaction in a healthy session, no drift or contradictory reasoning has appeared, the same bounded task is continuing, and keeping the conversation is materially useful.
- Use `/clear [name]` or a new conversation when any of these is true: the session has already compacted once; drift, stale methodology, or contradictory claims appeared; a milestone or checkpoint is complete; the task or work mode is changing; the indicator is RED; or maximum fresh capacity is preferable.
- Do not compact merely because the command exists. At a clean milestone, `/clear [name]` is the default.
- Use a descriptive session name, for example `/clear contact-prewarm-hardening-22-july-2026`.

The previous conversation remains available through `/resume`. `/resume` is for reference or deliberate continuation; it is not required for a fresh re-entry because the file anchor is authoritative.

### Fresh-context re-entry handshake

After `/compact`, `/clear`, or an unexpected automatic compaction, the Builder must not edit files or begin implementation immediately. Its first task is re-entry:

1. Read `CLAUDE.md` and `AGENTS.md` where present.
2. Read the latest approved prompt, plan, Architect amendments, and relevant AI-system protocols.
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
7. Pause. Carl and the Architect compare the report with the anchor. Implementation resumes only after Carl approves that the reconstruction is accurate.

If automatic compaction happens before the gate is used, Carl tells the Architect immediately. The Builder must stop before beginning its next action and follow the same anchor and re-entry sequence. Continuing from compressed chat memory while the shared files are stale is governance drift and may trigger `STOP CLAUDE`.

### Capacity and Sentinel rules

Repeated compaction is not the default strategy. After one compaction in an implementation task, the next context-pressure event uses `/clear [name]` or a new conversation after a complete anchor.

⚠ **No Sentinel runs — see §6 and §8.** The paragraph that stood here described a Sentinel remaining active through a refresh, being deleted at a milestone, and a new one starting automatically at the next execution. **None of that happens**: the continuous watch retired with Codex and has no owner. Retained as a note rather than deleted, so a reader who remembers the old behaviour sees why it is gone. When a mechanism is eventually built, its refresh behaviour belongs here.

What **does** survive a refresh: the repository plus the refreshed continuity files are authoritative, and the Builder completes the re-entry handshake before resuming. Drift is Carl's to spot and `STOP CLAUDE` is Carl's to issue, before and after a refresh alike.

---

## 8. Drift Watching — a currently ownerless function

Under the retired layer, Codex activated a task-scoped Drift Sentinel at execution start,
watched for divergence from the approved plan, and could issue `STOP CLAUDE`. **That
continuous watching has no owner in the current structure.**

**⚠ Continuous watching is not "not yet built" — it is not possible, and will not return.**
Corrected 25 July 2026, on Carl's observation: *"Drift sentinel wouldn't work, no
connection."*

The old Sentinel worked because the **MCP bridge** let Codex see the Builder's live state
continuously. That bridge is gone and has no replacement: Claude Project runs in a browser
with no channel to this machine, and a local architect instance sees only what is on disk,
only when Carl invites it to look. **Neither can watch a build in progress.** This is
structural, not a gap awaiting an owner. Do not plan around a future Sentinel.

An agent merely *asked* to watch was never a control anyway — the retired Sentinel sat at
`STATUS: STOP` while work was being submitted for review. `STOP CLAUDE` is therefore
**Carl-triggered**: issued when Carl sees drift.

**What replaced it, and it is a better shape.** The chunk scope guard (below) does not
*watch* — it **blocks**, inside the Builder's own process, needing no connection at all.
That is why it works where the Sentinel could not. The mechanical third of the drift list
is genuinely enforced; the judgement two-thirds move to the **plan-review gate** and
**checkpoint review**, which are deliberate inspection points rather than continuous
observation.

**The governance choice this reflects.** Carl's position, 25 July: pasting slows the
process, so *"if the governance we put in place can mitigate that with less iteration,
better."* A bridge would make each handoff cheaper; governance makes fewer handoffs
necessary. The plan-review gate catches misunderstandings before code exists, the chunk
definition names untouchable work upfront, the scope guard stops wrong-file drift without
anyone reviewing anything, and the fixed reference files mean both agents check against the
record rather than against each other's paraphrase. **Fewer iterations beats faster
couriering** — and it needs no new component to trust.

This is a real capability the old layer provided and the current one does not yet replace.
It is stated as a known gap, matching `prompt-protocol.md` Stage 3, so the two files that
describe this one missing function say the same thing.

### ✅ Partial mechanism built — 25 July 2026: the chunk scope guard

**One third of the list below is now genuinely enforced.** A `PreToolUse` hook
(`.claude/hooks/chunk-scope-guard.js`, registered in `.claude/settings.json`) runs before
every `Edit`, `Write` and `NotebookEdit`. It reads `live-work/chunk-scope.json` and
**denies** the tool call when the Builder tries to edit:

- a file **outside the chunk's declared scope** (`files`), or
- an **approved-foundation file** (`protected`) the chunk did not unlock.

This is a mechanism, not an intention: it runs in the harness, before the call, and the
Builder cannot decline it. That is the P-A distinction the retired Sentinel failed.

**Opt-in by design.** No `chunk-scope.json` present ⇒ no enforcement. Scope is declared
when a chunk starts. A guard that blocked by default would make every unscoped session
unusable, and an unusable control gets switched off — worse than one that is honestly
narrow. `active: false` disables it; `unlocked` lets **Carl** authorise a protected path
for one chunk. Both are Carl's levers, not the Builder's.

**Verified by attack, not by reading config (P-A), 25 July 2026 — 10/10:**

| Case | Result |
|---|---|
| In-scope file | allowed |
| `live-work/` prefix rule | allowed |
| Out-of-scope file | **DENIED** |
| Protected `app/globals.css` | **DENIED** |
| Protected `enquiry-opening.tsx` | **DENIED** |
| Non-file tool (Bash payload) | allowed |
| Protected path after Carl unlocks it | allowed |
| `active: false` | allowed |
| Malformed scope file | allowed — **fails open** |
| No scope file | allowed — **fails open** |

**⚠ Two limits, stated so the gap is not mistaken for covered.**

1. **The Bash bypass applies here too (DL-1).** The hook matches `Edit|Write|NotebookEdit`.
   The Builder has `Bash`, so a shell redirect or `sed -i` goes around it entirely. This
   guard raises the cost of *accidental* scope drift; it is **not** a security boundary
   against a determined process. The read-only architect closes that gap by denying `Bash`
   outright — the Builder cannot, because it needs the shell to work.
2. **It enforces only the mechanical conditions.** Judgement-based drift — a coupled value
   built as an independent overlay, a derived value that lost its source condition, visual
   drift from the intended result — **cannot** be path-checked. The 24 July reduced-motion
   defect was exactly that class and no scope guard would ever have caught it. Those stay
   with checkpoint review and with Carl.

⇒ `STOP CLAUDE` remains **Carl-triggered**. The guard narrows the gap; it does not close
it.

**The drift conditions are retained below as a specification**, so that whoever — or
whatever — eventually owns the remaining two thirds inherits it — though note the continuous-watching route above is closed, so any future owner is a blocking mechanism, not a watcher. These describe what drift *is*, not
who watches for it, and are therefore harness-agnostic. Today they are conditions Carl
watches for, not a running check:

- Implementation contradicts the approved plan
- An effect specified as a coupled or derived value is implemented as an independent overlay without approval
- A derived value is implemented without carrying its source behaviour's condition with it (see `checkpoint-review-protocol.md` §5.1, reduced-motion instance)
- A visual/material layer starts modifying an approved foundation layer outside scope
- Screenshots show the active visual goal is not being reached and further work would build on the wrong structure
- The Builder is continuing after a checkpoint that should have paused for review
- The Builder is iterating beyond the approved chunk rather than opening a new one
- A governance conflict with an APPROVED decision is visible

Early interruption is preferable to allowing a wrong structure to compound — but note that
under the current structure that judgement is Carl's, exercised on what he sees, not a
mechanism running in the background.

---

## 9. Screenshots And References

For visual work, the Builder saves screenshots to:

`project-intelligence/live-work/screenshots/`

Each screenshot should be named by step and viewport where practical, for example:

- `step-01-desktop.png`
- `step-01-mobile.png`

Reference images for the active task live in:

`project-intelligence/live-work/references/`

the Builder must state whether each reference is a target to match or inspiration only.

---

## 10. Cleanup

Live-work files are temporary. They may be overwritten on the next task or deleted after the cycle ends.

Do not copy raw live-work transcripts into permanent project-intelligence files. Compress durable outcomes into the established documents:

- `decisions.md` for decisions
- `review-log.md` for actioned review findings
- component docs for component state
- `current-sprint.md` for sprint status, open questions, and blockers

---

*Last updated: 2026-07-25 — rewritten for the Architect/Builder two-instance model.
Mechanism unchanged (file-based transport, D-006); the reader is renamed Codex → Architect
throughout, because the capability boundary was never Codex-specific — it holds for any
separate instance. `STOP CLAUDE` is now Carl-triggered pending a built mechanism, matching
`prompt-protocol.md` Stage 3; the Sentinel specification is retained in §6 for whoever
eventually owns it. `claude-chat-window.md` now carries both the chat extract and the DL-7
Builder reasoning; git evidence is added as §5a. Response templates renamed to role names.
Context Watch, anchor-integrity gate and §7 re-entry handshake retained; §7's number held
stable so `handoff-protocol.md` continues to resolve. See `decisions.md` D-036.*
