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

## 3a. Measurement at checkpoints — and only one seat measures at a time

**Added 12 August 2026, on Carl's instruction.**

### The rule

**Measurement happens at checkpoints, after implementation stops.** The Builder finishes
its work, stops any dev or production server it started, and *then* the checkpoint opens.

⚠ **NEVER TWO BUILDS OR TWO SERVERS AT ONCE.** Both seats measuring simultaneously
produces numbers neither can trust: they contend for the same GPU, the same CPU and the
same ports. This project has already lost a day to variance smaller than that
— *"measured variance on IDENTICAL code was 399-750ms: larger than the regression being
hunted"* — and a second build running underneath would swamp it entirely.

⚠ **AND A ZOMBIE SERVER IS THE COMMON WAY THIS GOES WRONG.** `TaskStop` has reported
success on a port that stayed held **three times in one session** (11 August 2026). **Kill
by PID and confirm the port free** before declaring implementation stopped. A newer build
sitting unserved behind an older one answering `200` is the failure mode, and it is
invisible in the numbers.

### How the Architect gets a measurement

⚠⚠ **IT RUNS THEM ITSELF, AS OF 12 AUGUST 2026.** `Bash` was removed from the Architect's
deny list on Carl's instruction, together with `Monitor`, `TaskOutput` and `TaskStop`.
Builds, `npx tsc --noEmit`, `npm run lint`, the `verify/` harnesses, read-only git and
search are pre-approved so they do not prompt him.

**Why:** on 11–12 August the Architect's two best analyses of the corridor were built on
the Builder's numbers because it could not take its own, and it named a falsifiable
prediction it could not run the test for. **The review handicap was real and daily.**

⚠ **AND UNDERSTAND WHAT THAT COSTS, BECAUSE THE DENY LIST NO LONGER SHOWS IT.** `Edit`,
`Write` and `NotebookEdit` remain denied — **and with a shell present that is cosmetic**;
a redirect, `sed -i` or `rm` writes just as well (verified by attack, 24 July 2026). The
`allow` list pre-approves, it does **not** restrict: anything not on it still runs, it
merely prompts. The seat also has `disableAllHooks: true`, so the chunk-scope guard does
not fire there. **The Architect not writing to the repository is now discipline, not
mechanism** — `architect-role.md` §2 carries the rules it must hold.

**The `!` prefix remains available** (`live-work-protocol.md` §5a) and is the right choice
when Carl should witness the command and its output — a contested number, or anything
touching state. For ordinary measurement the Architect now simply runs it.

**What the Architect runs, or proposes via `!`:**

| Category | Examples |
|---|---|
| Builds and type/lint gates | `! npm run build`, `! npx tsc --noEmit`, `! npm run lint` |
| Measurement scripts in this repo | `! VERIFY_BASE_URL=http://localhost:3100 node verify/<name>.mjs` |
| Read-only git | `! git log --oneline -10`, `! git diff --stat`, `! git status --short` |
| Search and inspection | `! grep -rn "<pattern>" components/`, `! ls verify/` |

**What it must never run or propose** — ⚠ **and since 12 August this is a rule it keeps
rather than a wall that stops it**, so it is restated in full here and in
`architect-role.md` §2:

- Anything with `--fix`, `--write`, `-i`, or an output redirect (`>`, `>>`, `tee`)
- `git commit`, `checkout`, `reset`, `restore`, `push`, `clean`, `stash`
- Package installs or removals
- Anything writing into `app/`, `components/`, `lib/`, `public/` or `verify/`
- Starting a long-lived server while the Builder still has one running

⚠ **CARL READS THE COMMAND BEFORE HE RUNS IT, AND THAT IS THE ACTUAL CONTROL.** The list
above is guidance for the proposer, not a mechanism. Nothing enforces it. **A proposed
command is a request, not an instruction** — the same standing that every other Architect
finding has.

### Where measurement output goes

**`project-intelligence/live-work/`**, which is already gitignored as scratch
(`live-work-protocol.md` §Gitignore) and already holds run logs and evidence files.
Harness output that is worth keeping goes to `verify/out/`, which is where the existing
harnesses already write.

⚠ **THE ARCHITECT STILL WRITES NOTHING.** It reads the output and reports findings in
chat; **the Builder files them**, as it did for `architect-answer-q5-reveal-residue.md`
and `architect-analysis-corridor-choreography.md`. That division is unchanged.

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
7. **Git evidence (DL-7)** — raw diff, log, and attribution for the changed work. The
   Architect is structurally read-only and runs no `git` itself. **Still not optional:**
   on 24 July a finding was handed back unresolved for want of it. The Architect can now
   also ask Carl to run a read-only `!` command for history the evidence did not anticipate
   (`live-work-protocol.md` §5a) — but that is a backstop for unforeseen questions, not a
   reason to supply less. Evidence prepared in advance does not depend on the Architect
   thinking to ask.
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

#### The Builder must separate what it measured from what it believes

**Added 27 July 2026, with the `verify/` harness.** The Builder can now observe what a change
renders rather than reasoning about it. That changes what a checkpoint must state.

**Every visual or timing claim is one of three things, and the Builder says which:**

| Kind | Meaning | Example |
|---|---|---|
| **Measured** | A script produced this number or image. Reproducible. | *"Begin usable at +7466ms, `verify/begin-timing.mjs`"* |
| **Observed** | The Builder looked at a capture and is describing it. | *"The gold reads warmer than the previous pass"* |
| **Reasoned** | Nothing was run. The Builder inferred it from the code. | *"This should not affect the corridor"* |

**"Reasoned" is not forbidden — hiding it is.** A reasoned claim is a hypothesis and the
Architect should weigh it as one. A reasoned claim written in the register of a measured one is
the failure this section exists to prevent.

**Name the command that produced a measurement**, so the Architect can ask Carl to re-run it
(`!` prefix, `live-work-protocol.md` §5a). A screenshot is not evidence; a script that
regenerates the screenshot is.

**State what was NOT measured.** A checkpoint that reports only what passed leaves the
Architect unable to tell a clean result from an unexercised path. *"Desktop measured; mobile
not measured"* is a useful sentence. *"Verified and working"* is not.

**Why this matters more now, not less.** A feedback loop makes the Builder faster at producing
work that does what the code says. It cannot tell whether the code says the right thing.
**Wrong work now arrives verified, measured and polished** — which is harder to spot than
wrong work that arrives rough. The loop raises the value of this review; it does not reduce it.

**Worked example, 27 July 2026.** Carl reported that the Three.js contact-field work had
"gone back too far" and affected the opening. Plausible — the pre-warm genuinely does mount a
canvas earlier than completion. Reasoning from the code would have confirmed the gate holds and
concluded "not the Three.js work", **leaving the real defect unfound.** Measuring recorded 0
WebGL contexts and 0 canvas elements during the opening, and pointed instead at a 7400ms CSS
animation delay. *A plausible cause and a measured cause are different things — including when
the hypothesis is Carl's.*

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

#### ⚠ 5.3a Overtaking — a decision left intact but no longer safe to act on

**"Conflict" is not the only way an approved record goes wrong, and it is the easier half.**
A decision can be **untouched, uncontradicted and still misleading**, because a fact it
relied on — or a cost it weighed — has moved.

**The worked case, and it went unnoticed for two days.** D-046 declined the shared-canvas
host on 9 August, on three grounds. Later work removed two of them: the fluid-grid change
anchored the geometry to a `ResizeObserver` (killing the *"a changed measurement path would
reposition every card"* hazard), and Stage B took the defect it was weighed against from
~70ms once to **193ms on every question step**. **Nothing contradicted D-046.** Its own
words still read as current, and *"it is not authorised"* would have been quoted at anyone
who proposed the restructure. Recorded as **D-048**.

**What the reviewer is looking for:**
- an approved decision whose **stated reason** cites a mechanism this work changed
- a **cost/benefit judgement** — those expire when either side moves, and they rarely say so
- a comment or entry that is **half true**, where the true clause makes the false one read
  as verified

⚠ **THIS IS NOT AN INVITATION TO ATTACK OLD RECORDS.** D-046 was correctly reasoned on the
facts of 9 August. **A decision is not wrong because it has been overtaken**, and writing
it up as an error teaches the next author that records get attacked rather than updated.
Name what moved; leave the reasoning its dignity.

⚠ **AND AN AMENDMENT IS NOT AN AUTHORISATION.** Removing a stale ground for refusal reopens
a question. Deciding it is Carl's.

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
| Architect session | Separate `CLAUDE_CONFIG_DIR`; `Edit`, `Write`, `NotebookEdit` denied. ⚠ **`Bash` ALLOWED since 12 August 2026** (`workflow-redesign/` DL-1 is superseded on this point) |

⚠⚠ **`Bash` WAS DENIED BECAUSE IT IS A PROVEN BYPASS, AND IT IS NOW ALLOWED ANYWAY.** The
finding is unchanged and was verified by attack rather than by reading configuration: with a
writable shell available, **denying the edit tools is cosmetic** — overwrite, `sed -i`,
create and delete all succeeded in testing.

**Carl removed it on 12 August 2026 so the Architect can measure**, after two sessions in
which its analyses rested on the Builder's numbers because it could not take its own.
**The write risk was not disproved; it was accepted in exchange for a working reviewer.**

**What follows for this protocol:** the Architect not writing to the repository is now a
rule it keeps, not a wall that stops it — §3a and `architect-role.md` §2 carry the rules.
**And the evidence file stays mandatory.** A reviewer that can run its own `git` is still
not a substitute for evidence the Builder prepared and separated from its own reasoning;
that separation is what caught a false "byte-identical" claim in D-032.

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

**Approved records this work overtakes**
<Which APPROVED decisions describe an element or section this work touched, and what
moved underneath them. "None" is a valid answer — but it must be answered, not omitted.
See `context-rules.md` → "Approved work is amendable".>
- <D-0XX> — <the fact it relied on, or the cost it weighed, that has since changed>
- <path> — <a code comment now asserting something untrue>

**Builder reasoning**
See `claude-chat-window.md` — kept separate from the evidence above by design.

**Questions for the Architect**
1. Structural: does this modify the existing coupled value, or add an independent
   overlay? Was that the agreed structure? Does any derived value carry its source
   behaviour's condition with it?
2. Visual: does the rendered result match the stated objective?
3. Governance: does this conflict with any APPROVED decision? (Check PROVISIONAL status
   first — see §5.3.)
4. ⚠ Overtaking: does this **remove a ground** an approved decision stood on, without
   contradicting it? A decision can be left intact and still be **wrong to act on** —
   see the field above, and D-046/D-048 for the worked case.

**Reporting instruction**
Report findings only. Do not fix code. Do not instruct the Builder. Findings go to Carl,
who decides whether to pause, redirect, approve, or revise.
```

---

*Last updated: 2026-08-11 — §5.3a and the "Approved records this work overtakes" field added: a decision can be intact, uncontradicted and still unsafe to act on. Worked case D-046/D-048, unnoticed for two days because the form had no slot for it. Prior footer: 2026-07-25 — rewritten for the Architect/Builder two-instance model. Codex
bridge registration void; invocation is file-based and Carl-routed. Review mechanics,
including the D-031/D-032 coupled-value example, retained from the prior protocol. Git
evidence, the reasoning/evidence separation, the reduced-motion instance of the
coupled-value class, and the PROVISIONAL guard are new. See `decisions.md` D-036.*
