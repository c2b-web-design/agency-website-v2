# Checkpoint Review Protocol

Governs how the Builder requests an implementation checkpoint review, how the Architect
performs it, and how findings route to Carl. The Architect reviews. The Architect does
not implement. Harness-agnostic: defined by function, not by which tool fills the review
role.

Cross-references: `ai-roles.md` (authority), `prompt-protocol.md` (Stage 5.5),
`live-work-protocol.md` (saved artefacts), `context-rules.md` (Rules 5, 8, 9),
`decisions.md` D-035 (PROVISIONAL), D-036 (hierarchy), `workflow-redesign/` DL-7 (git
evidence).

---

## 1. Purpose

The Builder implements. Without an independent check at meaningful milestones, structural
drift is discovered late — after it has been built on. A checkpoint review is a second
read of a completed step against the agreed plan, the intended visual result, and
approved decisions.

A checkpoint review is not approval. It produces findings only. Approval authority is
unchanged: Carl alone (D-036).

---

## 2. Direction of Control

The review exists so the Builder can obtain an independent read. It does not allow the
Architect to drive the Builder.

| Permitted | Not permitted |
|---|---|
| The Builder sends a review request | The Architect initiating Builder work |
| The Architect returns findings | The Architect editing, fixing, or committing code |
| Findings go to Carl | The Architect instructing the Builder directly |
| Carl decides the response | The Architect actioning its own findings |

The Builder remains the sole website implementation agent. The Architect is structurally
read-only over code (`ai-roles.md`). Carl has final authority.

**Where the independence comes from.** The Architect runs as a separate instance with
separate context and reasons only from saved files, never from the Builder's session
(D-006). That separation is the source of the review's value: a reviewer sharing the
Builder's context approves; one reasoning independently catches drift. It is a mechanism,
not a courtesy.

---

## 3. Cadence

Checkpoint reviews run after **meaningful implementation steps** — a completed visual
layer, a completed component, a structural change, a rollout of an approved pattern.

They do not run continuously, per keystroke, per file save, or per commit. Over-review
produces noise and slows the layered workflow that `context-rules.md` Rule 8 depends on.

Trigger a checkpoint review when:
- A visual layer pass is complete and about to be built upon
- A pattern approved at prototype scope is about to roll out more widely
- An implementation touched or came near an approved foundation layer
- The Builder is uncertain whether the result matches the agreed spec

Do not trigger for: lint fixes, formatting, comment changes, or work already covered by
an immediately preceding review.

---

## 4. What the Builder Sends

Every checkpoint request includes:

1. **Objective** — what the step was meant to achieve, one to two sentences
2. **Plan/spec reference** — the decision ID, review ID, or chunk being implemented
   against
3. **Files changed** — paths, with a one-line description of each change
4. **Relevant code** — the actual changed code, not a summary of it
5. **Screenshots** — where visual behaviour matters (`context-rules.md` Rule 9: rendered
   output is the source of truth for visual work)
6. **Reference image paths** — stable paths, where a target or inspiration reference
   exists; state which it is
7. **Git evidence (DL-7)** — raw diff, log, and attribution for the changed work. Because
   the Architect is structurally read-only and runs no `git` itself, git-dependent
   findings can only be closed from evidence the Builder supplies. This is not optional:
   on 24 July a finding was handed back unresolved for want of it.
8. **Builder reasoning** — in `claude-chat-window.md`, kept **separate** from the
   evidence above. The Architect weighs reasoning against evidence rather than trusting
   either alone. The separation is deliberate and load-bearing.
9. **Specific questions** — what the Builder actually wants checked
10. **Reporting instruction** — findings only, no fixes

During an active Builder run, checkpoint requests are saved to
`project-intelligence/live-work/checkpoint-request.md`. Architect responses are saved to
`project-intelligence/live-work/architect-review-response.md`.

---

## 5. What the Review Assesses

### 5.1 Structural drift from the agreed plan/spec

Whether the implementation matches the *structure* that was agreed, not merely whether it
looks correct.

**Verified example — reflected amber CTA lighting:** D-031/D-032 establish that
selected-card amber light must filter/tint the existing platinum-white reflection rather
than behave as an independent clean light source. R-016/R-017 record the failure mode:
fragile colour-channel arithmetic allowed clean white hover behaviour to leak through.
The lesson is structural: when a brief specifies a coupled or derived visual value,
implementation must preserve that coupling rather than creating an independent visual
channel that can drift.

The general rule: **if an effect is specified as modifying an existing coupled or derived
value, it must not be implemented as a new independent overlay unless that change is
explicitly approved.** Overlays are visually convenient and structurally fragile.

The Architect should ask: does this modify the existing value, or sit on top of it? Was
that the agreed structure?

**A second verified instance of the same class — the reduced-motion guard (24 July
2026).** A warm-callback delay was correctly derived from the completion choreography's
duration, but was implemented without preserving the condition that choreography actually
runs. Under reduced motion the animations are gated off while the delay still applied, so
the field waited 7100ms for choreography that never happened. Same failure shape: a value
derived from another behaviour, implemented without carrying the behaviour's condition
with it. Worth checking for explicitly, because it survived two days of the Builder's own
review and was caught only by an independent read.

### 5.2 Visual drift from the intended or reference result

Whether the rendered output matches the stated visual objective. Per `context-rules.md`
Rule 9: if code and screenshot disagree, the screenshot is the user-facing truth. The
Architect distinguishes inspiration references (optical direction only) from target
designs (to reproduce).

### 5.3 Governance conflicts with approved decisions

Whether the step contradicts an APPROVED entry in `decisions.md`, deviates from the
design-system, or modifies an approved foundation layer without authorisation. Cite the
decision ID.

**PROVISIONAL guard (D-035).** Before raising a governance finding, check status. A layer
marked PROVISIONAL is deliberately untuned and awaiting the mastering pass — the absence
of an approval entry is **expected and correct**, not a gap. Raise it only if the work has
left its provisional scope or contradicts an APPROVED decision. This guard exists because
two separate reviews (the 24 July architect review, and a 25 July repo pass) each spent a
finding on the same PROVISIONAL layer, reading correct-but-untuned as missing-approval.

---

## 6. Escalation

1. The Builder completes a meaningful step.
2. The Builder saves a checkpoint request to `live-work/` and pauses.
3. Carl routes the request to the Architect.
4. The Architect returns findings — findings only.
5. Findings go to Carl, who decides: **Pause** (stop and reassess), **Redirect** (change
   approach), **Approve** (findings noted, continue), or **Revise** (Carl asks the
   Builder to change).

The Architect does not fix code, does not instruct the Builder, and does not action its
own findings.

Findings are **Recommendations** under `prompt-protocol.md` §5 classification until Carl
routes them. A checkpoint finding, however accurate, does not supersede an APPROVED
decision (`context-rules.md` Rule 6), and does not by itself grant, move, or imply
APPROVED status — only Carl grants that (D-036).

Routine checkpoint findings are transient working feedback and are not logged by default.
Only findings Carl actions into a decision go in `decisions.md`; findings actioned as a
review outcome or QA finding go in `review-log.md`. Nothing is logged just because the
Architect noticed something, unless Carl wants it preserved.

---

## 7. Invocation and Registration

**There is no MCP bridge.** The retired `codex` server registration is void
(`workflow-redesign/` DL-5); do not attempt to call it. The wrapper is deleted and
`mcpServers` is empty.

Invocation is **file-based and Carl-routed**:

| Property | Value |
|---|---|
| Channel | Saved files in `project-intelligence/live-work/` |
| Request | `checkpoint-request.md` + git evidence + screenshots |
| Response | `architect-review-response.md` |
| Routing | Carl, manually. There is no agent-to-agent channel |
| Architect session | Separate `CLAUDE_CONFIG_DIR`; `Edit`, `Write`, `NotebookEdit` and `Bash` denied (`workflow-redesign/` DL-1) |

`Bash` is denied because it is a **proven** bypass: with a writable shell available,
denying the edit tools is cosmetic — overwrite, `sed -i`, create and delete all still
succeeded in testing. The boundary was verified by attack, not by reading configuration.

No agent-to-agent channel exists or is required. The file surface plus Carl's routing is
the entire mechanism — which is also why it survives a change of harness: nothing here
names a vendor.

---

## 8. Request Template

```
## Checkpoint Review Request

**Objective**
<What this step was meant to achieve.>

**Plan / spec reference**
<D-0XX / R-0XX / chunk name. What was agreed.>

**Files changed**
- <path> — <what changed>

**Relevant code**
<The actual changed code.>

**Screenshots**
- <path> — <what it shows>

**Reference images**
- <stable path> — <target design | inspiration reference only>

**Git evidence (DL-7)**
- <path to raw diff/log artefact in live-work/>

**Builder reasoning**
See `claude-chat-window.md` — kept separate from the evidence above by design.

**Questions for the Architect**
1. Structural: does this modify the existing coupled value, or add an independent
   overlay? Was that the agreed structure? Does any derived value carry its source
   behaviour's condition with it?
2. Visual: does the rendered result match the stated objective?
3. Governance: does this conflict with any APPROVED decision? (Check PROVISIONAL status
   first — see §5.3.)

**Reporting instruction**
Report findings only. Do not fix code. Do not instruct the Builder. Findings go to Carl,
who decides whether to pause, redirect, approve, or revise.
```

---

*Last updated: 2026-07-25 — rewritten for the Architect/Builder two-instance model. Codex
bridge registration void; invocation is file-based and Carl-routed. Review mechanics,
including the D-031/D-032 coupled-value example, retained from the prior protocol. Git
evidence, the reasoning/evidence separation, the reduced-motion instance of the
coupled-value class, and the PROVISIONAL guard are new. See `decisions.md` D-036.*
