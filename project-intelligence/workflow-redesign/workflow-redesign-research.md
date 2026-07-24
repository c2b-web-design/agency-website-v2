# Workflow Redesign — Research Index

**Status:** Active research artifact. Not a plan, not a decision, not implementation
authority. This is the master index for a ~7-day research process, worked through
sequentially. Findings return to Claude Code (builder-context instance) to be
pressure-tested against this file system, the established ethos, and the two prior
failures below. Decisions that survive that test are logged (see "Decision log").

---

## Why this document exists

The current workflow uses an architect/builder split: a governance/architect layer
(previously Codex/GPT via the MCP bridge) reviews and directs; Claude Code
implements; Carl decides. The **design is sound**. What failed was **execution** —
Codex did not honour the token-efficiency and model-selection rules it was given,
and the ChatGPT monthly allowance was exhausted far too quickly. The guardrail that
was supposed to protect the budget was the guardrail that failed.

Two prior negative experiences frame this pivot, and both must stay in view:
- **V1 (Google Antigravity IDE):** billing/payment failures took money for a
  product that did not reliably work; forced a pivot and a rebuild (this repo is V2).
- **Codex/GPT (this workflow):** soft guardrails (token budget, model selection)
  ignored; allowance burned; no ballpark usage data provided despite substantive
  research being supplied to the agent.

**The lesson, and the non-negotiable that governs everything below:** a guardrail
written as prose that an agent may choose to ignore is not a control. The critical
guardrails — model selection and token/cost budget — must be **mechanisms Carl owns
and can verify**, not instructions delegated to any vendor's good faith. Staying in
the Anthropic ecosystem is a convenience decision; it is **not** the source of trust.
The source of trust is enforcement Carl controls.

**Verified ground truth (23 July 2026, checked against the real system — do not
re-litigate from memory):**
- **No live in-loop cost meter.** A running Claude Code session on a subscription
  exposes no env var, no `/cost` API, and no per-turn dollar figure the agent can
  poll mid-turn to self-throttle. Do not design around a real-time hard budget gate;
  it does not exist here.
- **Per-turn token usage IS recorded on disk.** Each assistant turn in the session
  JSONL transcript (`~/.claude/projects/<slug>/<session>.jsonl`) carries a `usage`
  object: `input_tokens`, `output_tokens`, `cache_read_input_tokens`,
  `cache_creation_input_tokens`, `server_tool_use` (web search/fetch counts), and
  `message.model` per turn. This is exactly the ballpark usage signal Codex refused
  to provide — it exists, already written, no API billing required.
- **Cost is derivable, not given.** Tokens × published per-model rates = an *estimate*
  Carl computes. Ballpark was always the goal, so this is sufficient. (The rates
  themselves are unverified here — confirm current rates via `claude-code-guide`
  before baking any number in. The mechanism is real; the rate is to-be-confirmed.)
- **The signal is read-AFTER, not stop-BEFORE.** Every turn can be accounted as it
  lands and alarmed when a session/day threshold is crossed — the same
  write-to-disk-then-read-back pattern already proven by `claude-context-status.json`.
  This is monitoring + alerting with teeth, not a pre-emptive spend gate.

## How to use this document

- Work the numbered items **in order**. Each is a bite-size chunk.
- For each item: research (Claude chat / parallel sessions / the `claude-code-guide`
  agent for live Claude Code + Agent SDK + API capability questions), then bring
  findings back to the builder-context Claude Code instance to check them against
  the non-negotiable above and against these files.
- Record **rejections with their reason**, not just conclusions — future-you at build
  time needs to know *why* an option was ruled out (mirrors `decisions.md` discipline).
- Technical ground (SDK APIs, exact capabilities) is learned in the research sessions.
  Direction, principle-fit, and pressure-testing happen in the builder-context
  instance. Do not treat memory-based capability claims as authoritative — verify.

---

## Research items

### 1. The Anthropic-ecosystem landscape
**Why:** Before choosing a harness, understand what exists — Claude Code (CLI +
VS Code extension, runs subagents), the Claude Agent SDK (programmatic multi-agent
orchestration), and the Claude API underneath. Each is a different level of control.
**Decide:** A plain-language map of the options and which layer each operates at.
No commitment yet — just the terrain.

### 2. Claude Agent SDK fundamentals
**Why:** The SDK is the most likely home for a programmatic architect/builder loop
with defined roles. Need a *relative* understanding (not bedrock) of what it is,
what it orchestrates, and its learning curve.
**Decide:** Is the Agent SDK the right primitive for this, or is a
second Claude Code instance (lighter) sufficient? Frame the trade-off; don't resolve
it until items 3–7 inform it.

### 2.5. EARLY SPIKE — stand up a read-only second instance and observe
**Why:** Seven days of sequential *reasoning* before any *test* is this document's
weakest structural choice — and it repeats the "reason instead of verify" habit that
just produced a wrong conclusion on the budget question. A second VS Code / Claude
Code instance with `Edit`/`Write`/`NotebookEdit` **denied in settings** can be stood
up in under an hour and resolves items 3, 5, and part of 6 by *observation* instead
of speculation. Do this early; let the later research lean on observed behaviour.
**Decide (empirically, not by argument):**
- Does the read-only denial actually hold — can the second instance read the repo and
  `project-intelligence/` files but genuinely not edit? (resolves item 5's read-only
  question)
- Does a fresh-context instance reasoning only from the files produce an *independent*
  read, or does it drift toward the builder's framing? (resolves item 3)
- Pin that instance to a specific model and confirm the transcript records that model
  per turn. (validates item 6's audit trail on a throwaway setup, before betting the
  workflow on it)
This is a disposable experiment. Keep it cheap; capture what was observed in the
decision log; tear it down.

### 3. The meaning of "separation" for the architect
**Why:** "A second VS Code as the architect" can mean two very different things:
(a) fresh, uncontaminated context reasoning from the repo + `project-intelligence/`
files, or (b) process isolation that runs even while the builder is mid-task.
The current protocol already assumes the architect reads saved files, not the
builder's chat.
**Decide:** Which kind of separation is actually required. This choice picks
IDE-vs-SDK and determines how heavy the setup needs to be. Prefer the lightest
separation that delivers fresh context; add isolation only if a real need appears.

### 4. Mapping the architect/builder roles onto the new harness
**Why:** The existing role boundaries are sound and model-agnostic: architect
reviews and reports findings only; Carl decides; builder implements. These must
survive the pivot intact (see `checkpoint-review-protocol.md`, `context-rules.md`).
**Decide:** How each existing protocol role maps to the chosen harness. What changes
in `checkpoint-review-protocol.md` "Technical Registration" (currently the `codex`
MCP bridge) when the architect is a Claude instance/SDK agent instead.

### 5. Independence of the review (avoiding rubber-stamping)
**Why:** The checkpoint's value comes from the architect NOT sharing the builder's
context and assumptions — otherwise it approves rather than catches drift. This is
why the file-based handoff exists.
**Decide:** How the new harness guarantees the architect reasons independently
(separate session/context, read-only where appropriate) rather than inheriting the
builder's framing. Confirm the harness can constrain an agent to read-only.

### 6. ENFORCEMENT — model pinning per role (the enforceable CONTROL)
**Why:** This is the exact guardrail Codex ignored, and — unlike budget (item 7) —
it is a genuine, enforceable control AND verifiable after the fact. "Use the
appropriate model / strength for the task" cannot be an instruction the agent
adjudicates; it must be a config fact. Note 6 and 7 solve *different* problems and
must not be conflated: 6 controls *which model runs*; 7 accounts for *what was spent*.
The Codex failure involved both, but they are separable.
**Decide:** Can the chosen harness pin a specific model **per agent/role in config**
(not by instruction)? Can lighter/heavier models be assigned per task-class? What is
the fallback behaviour? **Verify it actually ran the pinned model** — the transcript
records `message.model` per turn (see ground truth above), so the pinning has a real
audit trail; use it rather than assuming compliance.

### 7. ENFORCEMENT — token/cost accounting and alerting (post-hoc, not a live gate)
**Why:** The allowance burned because nothing mechanical watched it. Corrected from
the original "budget with teeth": a real-time hard gate that blocks an overspending
turn **does not exist** on a subscription (see ground truth above) — so this item is
*accounting + alerting*, not a pre-emptive control. That is not settling for less; it
is what the platform actually permits, and it is still night-and-day better than
Codex's nothing. It remains genuine enforcement, applied *after* each turn rather than
before it.
**Decide:** Confirm the exact `usage` fields per turn in the JSONL transcript (already
verified to exist), the method to sum them per session/day, the published rates to
turn tokens into an estimated cost (rates to-be-confirmed via `claude-code-guide` —
do not hardcode a stale number), and the threshold at which a hook or the loop
**alerts or pauses**. The write-to-disk-then-read-back mechanism is already proven by
`claude-context-status.json`; this extends it to tokens/cost. Ballpark is the target,
and ballpark is achievable.

### 8. Decision — harness shape and converged plan
**Why:** Items 1–7 (plus the early spike 2.5) should converge on a concrete choice.
This is where research becomes a plan. Note: the *first empirical test* has moved
forward to item 2.5 — this item is the final converged decision informed by that
spike, not the first time anything is tried.
**Decide:** The harness shape (SDK vs second-instance vs hybrid), the model-pinning
scheme (control), the token/cost accounting-and-alerting mechanism (post-hoc), and the
**next build step** to prove the whole workflow before rebuilding on it. Log the
rejected alternatives and why.

---

## Decision log (fill as items resolve)

> One entry per resolved item: what was chosen, what was rejected, and the reason for
> the rejection. Keeps the "why not" recoverable at build time.

- _(none yet)_

---

## Open questions carried forward

- _(add as they surface; do not silently drop them)_
