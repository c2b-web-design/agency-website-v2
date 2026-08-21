# The AI System — start here

**A map, not a rulebook.** Every line points somewhere else. **Nothing is defined here**, so
nothing here can go stale — a pointer either resolves or it does not, which is checkable.

**If this file ever explains a rule instead of pointing at it, that is a defect.** Two copies
of a rule become two versions of a rule, and the copy is the one nobody updates.

---

## The four seats

| Short | Seat | What it does | Defined in |
|---|---|---|---|
| — | **Carl** | Decides. Everything else recommends | `ai-roles.md` |
| **PM/A** | Project Manager / Architect | Designs *with* Carl, records the chunk, writes the prompt, reviews plans and completed steps. **Never writes code** | `architect-role.md` |
| **CB** | Claude Builder | Writes all website code. The only seat that touches the codebase | `ai-roles.md`, `prompt-protocol.md` |
| **CS** | Claude Strategist | Business strategy — positioning, pricing, acquisition, copy. **Advises Carl only** | `strategist-role.md` |
| **CD** | Claude Design | Named and expected. **Not in use; remit not yet defined** | — |

**Only Carl grants APPROVED.** No seat approves its own work, and no seat approves another's.

**PM/A and CB are the build chain. CS sits beside it, not above or below it** — it has no
channel to either, in either direction. Carl carries everything both ways. Why that placement
matters: `ai-roles.md`, "Beside the chain".

---

## How work moves

Intent → chunk → plan → gate → code → checkpoint. Six steps, and Carl is in four of them.

1. **Carl leads the design and the chunking.** Work does not originate with PM/A.
2. **PM/A records the chunk and drafts the prompt.** Scope and constraints — *what* and *what
   not*, never *how*.
3. **Carl approves the prompt.** The check is specific: did my design, ethos and intent
   survive the translation?
4. **CB writes the plan** in Plan Mode, then the **plan-review gate**: PM/A amends, Carl
   approves.
5. **CB executes that chunk only.** A new need is a new chunk.
6. **Checkpoint review** at meaningful milestones. Findings only — they go to Carl, who
   decides.

Full definition: `handoff-protocol.md` §2 and §2.5. Review mechanics:
`checkpoint-review-protocol.md`.

⚠ **Authorising a chunk includes writing `live-work/chunk-scope.json`.** Without it the scope
guard is inert and every edit passes. PM/A drafts it, Carl approves it —
`handoff-protocol.md` §2, `live-work-protocol.md` §8.

**Direct conversation is also legitimate**, and produced the gold rim. It does not replace the
chunk model — `working-with-the-builder.md`.

---

## The rules that override everything else

Four, and they are the ones worth knowing cold.

1. **Only Carl approves.** Any seat may recommend; none may grant, and none may action its
   own finding. — D-036
2. **Files are canonical; chat is not.** If it is not written down, it did not happen. —
   D-006, `context-rules.md` Rule 1
3. **Approved layers are locked** unless Carl explicitly reopens them. Stop, explain, state
   the risk, ask. — `../../CLAUDE.md`
4. **A recorded next-step is a claim about the present, and it decays.** Confirm it against
   git or the running app before acting on it. Reading the code alone will often *confirm* a
   stale record rather than correct it.

---

## Where to read more — by the question you have

| Your question | File |
|---|---|
| Who decides what, and what may each seat not do? | `ai-roles.md` |
| I am PM/A — how do I start a session? | `architect-role.md` |
| I am CB — what is my workflow, stage by stage? | `prompt-protocol.md` |
| I am CS — what is my remit, and where does output go? | `strategist-role.md` |
| How is a chunk defined and handed over? | `handoff-protocol.md` |
| How does a checkpoint review work? | `checkpoint-review-protocol.md` |
| Am I about to decide how the system is SHAPED, not just implement it? | `structural-decision-gate.md` |
| What status does this work have? What may I write down? | `context-rules.md` |
| What goes in `live-work/`, and what is the scope guard? | `live-work-protocol.md` |
| What has already been decided, and why? | `../decisions.md` |
| What has Carl visually approved? | `../reviews/review-log.md` |
| What is authorised right now? | `../active-sprints/current-sprint.md` |
| Who is Carl, and how does he transmit intent? | `working-with-carl.md` |
| How should I actually behave in conversation with him? | `working-with-the-builder.md` |
| What is the business, and is the site deployed? | `../mission-overview.md` |
| How is the PM/A seat locked down, and was it tested? | `architect-settings.reference.json.md` |
| Claude Code has updated — who checks the controls still work? | `governance-review-protocol.md` |

---

## Two things a new session gets wrong

**Reading order is not in this file.** It is in `../../CLAUDE.md` for CB, `architect-role.md` §4
for PM/A, and `context-rules.md` "Session Protocol" for both. **Three audiences, three
orders** — a single copy here would drift from all of them.

⚠ **Check for `live-work/session-handoff.md` before anything else.** It carries what the last
session decided, parked and corrected, which the canonical files do not record. **It is
single-use: delete it once its replacement is written** — `live-work-protocol.md` §3a.

---

## What is deliberately not written down

Absence here is usually a decision, not a gap. Do not "fix" these.

- **Future work.** Kept outside this repository entirely — D-038.
- **The contents of an in-flight brief.** Feature intent is conveyed **live**, so it can be
  pushed on and calibrated. Only the *pattern* is recorded — `working-with-carl.md`.
- **Continuous drift watching.** Structurally impossible, not merely unbuilt —
  `live-work-protocol.md` §8. `STOP CLAUDE` is Carl-triggered.
- **CD's remit.** Named, not defined.
- **What Carl chose not to tell a seat.** He deliberately gives each only what the work in
  hand needs. **That asymmetry is a control, not an oversight** — `architect-role.md` §3.

---

*Created 29 July 2026. It exists because the answer to "how do these seats work together" was
spread across nine files and ~5,000 lines, with no entry point. It adds no rules and holds no
reasoning of its own — **if you need to know why a rule exists, follow the pointer**, because
the reasoning is written well where the rule lives, and a summary of it here would be the
copy that rots.*
