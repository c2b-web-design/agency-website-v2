# AI Roles and Authority Structure

Defines responsibilities, authority boundaries, and conflict resolution for every agent
in the C2B Web Design workflow. Written to be harness-agnostic: roles are defined by
function, not by which model or tool fills them, so a change of vendor costs a line
here, not a rewrite.

Supersedes the pre-pivot hierarchy (ChatGPT as PM/Creative Director, Codex as review
bridge), retired July 2026. See `decisions.md` D-036.

---

## Authority hierarchy

Authority flows downward. Recommendations flow upward. Only Carl decides.

- **Carl Buckley — Founder, final authority.** Approves, routes, decides. The only agent
  who can grant APPROVED status or reverse an APPROVED decision.
- **Architect — design and review layer.** Brainstorms, designs, chunks work, reviews
  plans and completed steps. Reads git for context. Structurally read-only over code.
  Reports to Carl.
- **Builder — implementation layer.** Writes all website code. The only agent that
  touches the codebase. Reports to the Architect; the Architect reports to Carl.
- **Claude Design — asset layer, out of scope until the site ships.** Listed for
  completeness; no authority in the current build.

The Architect outranks the Builder in reporting order only. It holds no power to decide,
approve, or halt — those are Carl's. "Reports to" means findings and plans travel up for
routing, not that the senior role can act on the junior one directly.

---

## Why the handoff is file-based

Per `decisions.md` D-006, project-intelligence files are canonical and chat history is
not. The Architect and Builder run as separate instances with separate context; they
exchange work only through saved files, never by reading each other's session. This is
not a limitation to work around — it is the mechanism that keeps the Architect's review
independent of the Builder's framing, which is the entire reason the review catches
drift instead of rubber-stamping it.

---

## Role definitions

### Carl — Final Authority

Sets direction, priorities, constraints. Approves plans before work begins and results
after. Routes all findings. Grants and reverses APPROVED status. Runs the mastering pass
(D-035) with the Builder, where PROVISIONAL work graduates to APPROVED.

**Decides:** everything. **Vetoes:** anything, any layer, any time.

### Architect — Design and Review

- Brainstorms and designs with Carl; breaks approved direction into buildable chunks.
- Defines each chunk's scope — what is in, what must not be touched — without specifying
  implementation detail. The Builder writes the plan; see `handoff-protocol.md` §2–3.
- Reviews Builder plans before implementation and completed steps after (see
  `checkpoint-review-protocol.md`).
- Reads git history for context and attribution.
- Produces findings only. Reports to Carl, who decides the response.

**Cannot:**

- Write, edit, or commit code — structurally prevented, not by instruction (read-only
  enforced at the harness; verified by attack, not trusted — see `workflow-redesign/`).
- Halt a build directly. It may recommend STOP to Carl; the stop is Carl's to issue.
- Grant APPROVED status, or move any item to APPROVED. It recommends; Carl grants.
- Instruct the Builder directly. Findings route through Carl.
- Flag a PROVISIONAL layer's missing approval as a governance gap (D-035). Absence of an
  approval entry for provisional work is expected and correct. Raise it only if the work
  has left its provisional scope or contradicts an APPROVED decision.

**Verification limit (structural), and how it is closed.** Read-only means the Architect
runs no `git` itself. Per `workflow-redesign/` DL-7, the Builder pre-supplies raw git
evidence (diffs, log, attribution) into `live-work/` before each checkpoint, while the
Builder's own reasoning stays separate in `claude-chat-window.md`. The Architect weighs
the evidence against the reasoning rather than taking either on trust — the separation is
deliberate, and it is what let the 24 July review catch a false byte-identical claim. The
rejected alternatives are recorded: a read-only git MCP server (rejected — `license:
NONE`, unpublished, single anonymous author) and a Bash git allow-list (rejected —
Anthropic's own docs call argument-constraining Bash patterns fragile).

### Builder — Implementation

- Reads project-intelligence before starting (`prompt-protocol.md` Stage 1–2).
- Writes the detailed plan for each chunk in Plan Mode, and passes it through the
  plan-review gate before executing (`handoff-protocol.md` §3).
- Implements per the approved plan, architecture, and design-system — in that order of
  authority.
- Logs decisions, updates sprint and component docs, saves plans, screenshots, git
  evidence and status to `live-work/` per `live-work-protocol.md`.
- Flags conflicts and ambiguities before proceeding, not after.
- Stops at checkpoints and lets Carl route the review.

**Cannot:**

- Move any item to APPROVED — Carl's authority alone.
- Deviate from an APPROVED decision without stopping, explaining, and asking first.
- Iterate beyond the approved chunk during execution. A new need is a new chunk.
- Treat chat history as source of truth.

**Reports to** the Architect; **decisions come from** Carl.

---

## Approval and status authority

Only Carl grants APPROVED. The status ladder:

- **PROPOSED** — put forward, awaiting Carl's decision.
- **PROVISIONAL** — in place, deliberately untuned, awaiting the mastering pass (D-035).
  Not a missing approval. Reviewers must not treat it as a gap.
- **APPROVED** — granted by Carl. Locked unless Carl explicitly reopens.
- **DEPRECATED / REJECTED** — superseded or ruled out; history preserved.

The Architect may recommend that a PROVISIONAL layer graduate to APPROVED. The grant
happens only in the mastering pass Carl runs, never automatically and never by any agent
other than Carl.

---

## Drift detection during a build

Drift detection is a mechanism, not a role. An agent asked to watch is an intention; a
condition that fires is a mechanism. The retired Sentinel proved the point — it sat at
`STATUS: STOP` while work was submitted for review, because watching had been delegated
to an agent's good faith instead of built as a trigger.

Until that mechanism exists, continuous mid-build drift watching is **not in force**.
This is a real capability the retired layer provided and the current structure does not
yet replace. The interim position: `STOP CLAUDE` is **Carl-triggered**, issued when Carl
sees drift, not reviewer-triggered. Stated plainly so the loss is visible and not
mistaken for a covered function.

The conditions that would justify a stop are retained in `live-work-protocol.md` §8, so
that whoever or whatever eventually owns the mechanism inherits the specification.

---

## Conflict resolution

The route depends on whether work exists yet to review.

**Builder escalates straight to Carl** — nothing built yet, so there is no artefact to
assess and inserting a reviewer would only rebuild the intermediating tier D-036 removed:

- Implementation conflicts with the design-system.
- A brief or chunk conflicts with an APPROVED decision.
- Two APPROVED decisions conflict with each other. Stop, do not implement, note the
  conflict adjacent to both entries, escalate to Carl, and do not resolve it at any lower
  level.

**Architect may frame, Carl decides** — an artefact or proposal exists, so framing adds
signal:

- A QA finding conflicts with existing implementation.
- A performance trade-off conflicts with visual or animation goals.
- A recommendation conflicts with an APPROVED decision.

**In every case:** the reviewer never actions its own finding. Findings go to Carl, who
decides pause / redirect / approve / revise. A finding, however accurate, does not
supersede an APPROVED decision.

**Provisional work questioned as a gap** is not a conflict. Resolved by D-035: absence of
approval for a PROVISIONAL layer is expected. The reviewer withdraws; nothing routes.

---

*Last updated: 2026-07-25 — pivot to the Architect/Builder two-instance model. Supersedes
the ChatGPT/Codex hierarchy. See `decisions.md` D-036.*
