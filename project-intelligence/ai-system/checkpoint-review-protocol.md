# Checkpoint Review Protocol

Governs how Claude Code requests implementation checkpoint reviews from Codex through the MCP bridge. Codex reviews. Codex does not implement.

Cross-references: `ai-roles.md` (authority), `prompt-protocol.md` (Stage 5.5), `live-work-protocol.md` (temporary saved artifacts), `context-rules.md` (Rules 5, 8, 9).

---

## 1. Purpose

Claude Code implements. Without an independent check at meaningful milestones, structural drift is discovered late — after it has been built on. A checkpoint review is a second read of a completed step against the agreed plan, the intended visual result, and approved decisions.

A checkpoint review is not approval. It produces findings only. Approval authority is unchanged: Human Founder.

---

## 2. Direction of Control

The bridge exists so Claude Code can request review from Codex. It does not allow Codex to drive Claude Code.

ChatGPT and Codex are one PM/governance/reviewer layer expressed through different surfaces: chat, the Codex app, and the MCP bridge. The MCP bridge holds no independent authority. It is a review channel only.

| Permitted | Not permitted |
|---|---|
| Claude Code sends a review request to Codex | Codex initiating work in Claude Code |
| Codex returns findings | Codex editing, fixing, or committing code |
| Findings go to Carl | Codex instructing Claude Code directly |
| Carl decides the response | Codex approving its own findings into action |

Claude Code remains the sole website implementation agent. Codex/GPT remains architect, project manager, reviewer, and governance layer. Carl has final authority.

---

## 3. Cadence

Checkpoint reviews run after **meaningful implementation steps** — a completed visual layer, a completed component, a structural change, a rollout of an approved pattern.

They do not run continuously, per keystroke, per file save, or per commit. Over-review produces noise and slows the layered workflow that `context-rules.md` Rule 8 depends on.

Trigger a checkpoint review when:
- A visual layer pass is complete and about to be built upon
- A pattern approved at prototype scope is about to roll out more widely
- An implementation touched or came near an approved foundation layer
- Claude Code is uncertain whether the result matches the agreed spec

Do not trigger for: lint fixes, formatting, comment changes, or work already covered by an immediately preceding review.

---

## 4. What Claude Code Sends

Every checkpoint request includes:

1. **Objective** — what the step was meant to achieve, one to two sentences
2. **Plan/spec reference** — the decision ID, review ID, or brief being implemented against
3. **Files changed** — paths, with a one-line description of each change
4. **Relevant code** — the actual changed code, not a summary of it
5. **Screenshots** — where visual behaviour matters (`context-rules.md` Rule 9: rendered output is the source of truth for visual work)
6. **Reference image paths** — stable paths, where a target or inspiration reference exists; state which it is
7. **Specific questions** — what Claude Code actually wants checked
8. **Reporting instruction** — findings only, no fixes

During an active Claude Code run, checkpoint requests are saved to `project-intelligence/live-work/checkpoint-request.md`. Codex responses are saved to `project-intelligence/live-work/codex-checkpoint-response.md`.

---

## 5. What Codex Reviews For

### 5.1 Structural drift from the agreed plan/spec

Whether the implementation matches the *structure* that was agreed, not merely whether it looks correct.

**Verified example — reflected amber CTA lighting:** D-031/D-032 establish that selected-card amber light must filter/tint the existing platinum-white reflection rather than behave as an independent clean light source. R-016/R-017 record the failure mode: fragile colour-channel arithmetic allowed clean white hover behaviour to leak through. The lesson is structural: when a brief specifies a coupled or derived visual value, implementation must preserve that coupling rather than creating an independent visual channel that can drift.

The general rule: **if an effect is specified as modifying an existing coupled or derived value, it must not be implemented as a new independent overlay unless that change is explicitly approved.** Overlays are visually convenient and structurally fragile.

Codex should ask: does this modify the existing value, or sit on top of it? Was that the agreed structure?

### 5.2 Visual drift from the intended or reference result

Whether the rendered output matches the stated visual objective. Per `context-rules.md` Rule 9: if code and screenshot disagree, the screenshot is the user-facing truth. Codex distinguishes inspiration references (optical direction only) from target designs (to reproduce).

### 5.3 Governance conflicts with approved decisions

Whether the step contradicts an APPROVED entry in `decisions.md`, deviates from `design.md`, or modifies an approved foundation layer without authorisation. Codex cites the decision ID.

---

## 6. Escalation

```
Claude Code completes a meaningful step
        │
        ▼
Claude Code requests checkpoint review via MCP bridge
        │
        ▼
Codex returns findings — findings only
        │
        ▼
Findings go to Carl
        │
        ├── Pause      — stop and reassess
        ├── Redirect   — change approach
        ├── Approve    — findings noted, continue
        └── Revise     — Carl asks Claude Code to change
```

Codex does not fix code. Codex does not instruct Claude Code directly. Codex does not action its own findings.

Findings are **Recommendations** under `prompt-protocol.md` §5 classification until Carl routes them. A checkpoint finding, however accurate, does not supersede an APPROVED decision (`context-rules.md` Rule 6).

Routine checkpoint findings are transient working feedback and are not logged by default. Only findings Carl actions into a decision go in `decisions.md`; findings actioned as a review outcome or QA finding go in `review-log.md`. Nothing is logged just because Codex noticed something, unless Carl wants it preserved.

---

## 7. Technical Registration

| Property | Value |
|---|---|
| Name | `codex` |
| Scope | user |
| Type | stdio |
| Command | `C:\Users\Carl Buckley\.local\bin\codex-mcp.bat` |
| Args | `mcp-server` |

The wrapper dynamically resolves the current Codex desktop-app binary under `%LOCALAPPDATA%\OpenAI\Codex\bin\*\codex.exe`, so the registration survives Codex self-updates. It fails loudly if zero or multiple binaries are found.

Codex runs under the existing ChatGPT auth in `~/.codex/auth.json`. If that auth expires, the bridge stops working even though the wrapper is correct.

---

## 8. Request Template

```
## Checkpoint Review Request

**Objective**
<What this step was meant to achieve.>

**Plan / spec reference**
<D-0XX / R-0XX / brief name. What was agreed.>

**Files changed**
- <path> — <what changed>

**Relevant code**
<The actual changed code.>

**Screenshots**
- <path or attachment> — <what it shows>

**Reference images**
- <stable path> — <target design | inspiration reference only>

**Questions for Codex**
1. Structural: does this modify the existing coupled value, or add an independent overlay? Was that the agreed structure?
2. Visual: does the rendered result match the stated objective?
3. Governance: does this conflict with any APPROVED decision?

**Reporting instruction**
Report findings only. Do not fix code. Do not instruct Claude Code. Findings go to Carl, who decides whether to pause, redirect, approve, or revise.
```

---

*Last updated: 2026-07-20 — Checkpoint review protocol established.*
