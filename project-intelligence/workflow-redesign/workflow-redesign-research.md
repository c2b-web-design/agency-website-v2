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
  Carl computes. Ballpark was always the goal, so this is sufficient.
- **The signal is read-AFTER, not stop-BEFORE.** Every turn can be accounted as it
  lands and alarmed when a session/day threshold is crossed — the same
  write-to-disk-then-read-back pattern already proven by `claude-context-status.json`.
  This is monitoring + alerting with teeth, not a pre-emptive spend gate.

**Documentation findings (24 July 2026, via `claude-code-guide`; sourced from official
docs — NOT yet independently verified on this machine. Items marked ⚠ must be confirmed
empirically by the item 2.5 spike before being relied on.):**

*Enforcement status — the distinction that governs the redesign:*

| Capability | Enforced? | Mechanism |
|---|---|---|
| Model pinning per subagent | **HARD** | Subagent frontmatter `model`; harness-checked, agent cannot override |
| Read-only (Edit/Write/NotebookEdit) | **NOT ALONE — see below** | `permissions.deny` blocks the *tools*, but Bash bypasses it entirely (proven) |
| Subagent tool restriction | **HARD** | `tools` / `disallowedTools`; tool simply not provided |
| Sandbox filesystem isolation | **HARD** (OS-level) | Seatbelt/bubblewrap — but Bash only, and opt-in |
| Context independence (two instances) | **HARD** | Separate transcripts; file-only handoff |
| Context independence (subagents) | **PARTIAL** | Findings return to main session → bias risk |
| **Hard spend limit / cost gate** | **NONE** | Does not exist. Plan limits are soft; no CLI threshold or halt |

- **Model pinning is genuinely enforced** — the exact guardrail Codex ignored is one of
  the strongest-enforced mechanisms available. Resolution order: env var →
  per-invocation → frontmatter → inherited session model.
  ⚠ **Fallback caveat:** an unavailable pinned model **silently falls back** to the
  default/inherited model with a warning; there is no hard-fail mode. Therefore: pin it
  *and* verify via `message.model` in the transcript that it actually ran. Both halves.
- **Read-only has two real gaps that must be closed deliberately** — there is no single
  "read-only" flag; it is an assembled combination:
  ⚠ **Bash bypass** — denying the `Read`/`Edit` tools does not stop shell equivalents.
  Close via `sandbox.filesystem` rules or by restricting `Bash`.
  ⚠ **MCP bypass** — denying `Edit`/`Write` does **not** stop an MCP server's own write
  tools. Must deny `mcp__<server>` / `mcp__<server>__*` patterns explicitly.
- **The JSONL `usage` object is DOCUMENTED as a supported cost-tracking source**, not an
  undocumented implementation detail. Safe to build accounting on; it should not vanish.
- **Additional supported telemetry surfaces:** `/usage` (session tokens by model + local
  cost estimate; resets on `/clear`), and **OpenTelemetry export** —
  `CLAUDE_CODE_ENABLE_TELEMETRY=1` + OTLP config emits `claude_code.cost.usage` and
  `claude_code.token.usage`. Official and documented.
- **All cost figures are client-side estimates**, explicitly not authoritative billing.
- **Published rates (per MTok):** Fable 5 $10/$50 · Opus 4.8 $5/$25 · Sonnet 5 $2/$10
  (intro, → $3/$15 after 31 Aug 2026) · Haiku 4.5 $1/$5. Cache read ≈10% of input price;
  cache creation ≈+25%. **Note Fable is 2× Opus on both input and output** — the
  "reserve the heavy model for low-iteration hard tasks" instinct is now a *costed*
  decision, not a vibe.
- ⚠ **`availableModels` allowlist** (restricting which models any subagent may use) is
  documented as a *managed settings* feature — may not apply to a personal setup.
  Confirm before relying on it.

**SPIKE RESULTS — empirically observed on this machine (24 July 2026, item 2.5 run).
These supersede the documentation findings above where they conflict.**

**1. The Bash bypass is REAL, TOTAL and TRIVIAL — proven, not theorised.**
With `permissions.deny: ["Edit","Write","NotebookEdit"]` active, a throwaway instance
successfully performed **every** mutating operation via the shell:
overwrite (`>`), in-place edit (`sed -i`), file creation, and file deletion.
**None was blocked.** A config that reads as "read-only" in review, and that the
documentation describes as hard-enforced, **is not read-only if Bash is available.**
The tool-level deny is genuine but guards only the front door.

**2. ⛔ THE DOCUMENTED SANDBOX CLOSURE DOES NOT EXIST ON THIS MACHINE.**
`sandbox.filesystem.denyWrite` relies on OS-level enforcement — Seatbelt (macOS) or
bubblewrap (Linux). This machine is **Windows 11**; verified: `bwrap` **ABSENT**,
`sandbox-exec` **ABSENT**. The elegant closure the docs recommend is for a platform
not in use here. **Do not plan around it.**

Remaining closures, with their real costs:
- **Deny `Bash` outright** — genuinely closes the gap, but costs the architect
  `git log`, `grep`, build inspection and test runs. Acceptable for a pure reviewer;
  a real capability loss, not a free win.
- **Two instances, architect's Bash denied** — the file-handoff pattern; architect
  reads and reasons but executes nothing.
- **Accept the gap knowingly** — REJECTED on principle: that is exactly the
  prose-guardrail-by-intent failure this redesign exists to eliminate.

**3. Model audit trail CONFIRMED working.** `message.model` was recorded on **179
turns** in this session (all `claude-opus-4-8`). The pin-then-verify loop of item 6 is
real and closed.

**4. ✅ CLOSURE VERIFIED IN A LIVE ARCHITECT SESSION (24 July 2026).**
A real read-only architect instance was stood up and **attacked**, not merely observed:
Write tool, shell redirect via Bash, and `sed -i` via Bash were each attempted.
**All three refused; no boundary breached.** `Bash` is unavailable as a tool, closing
both shell routes. This is the same edit-tool denial that was proven *cosmetic* in
result 1 — the difference is `Bash` in the deny list. The boundary is now genuinely
binary rather than nominal.

Working configuration (`~/.claude-architect/settings.json`, launched via
`CLAUDE_CONFIG_DIR` so it never applies to the builder session):
`deny: ["Edit","Write","NotebookEdit","Bash","mcp__codex"]`

Notes from standing it up:
- The **Claude Code CLI is required** (`@anthropic-ai/claude-code`); the VS Code
  extension alone provides no `claude` binary, so `CLAUDE_CONFIG_DIR` isolation is not
  available through the extension. CLI installed at v2.1.218.
- First-run setup **preserved all five deny rules** (verified after the fact, not
  assumed) but did rewrite `model` to `opus[1m]` — the 1M-context variant. Larger
  context than a PM-altitude reviewer needs; revisit if token spend matters.
- The launcher must call the CLI by **absolute path**; relying on `PATH` failed.

**Lesson worth keeping (the OpenAI/Hugging Face parallel).** The guide agent read the
documentation correctly and the documentation is accurate — but its *applicability to
this specific machine* went unchecked until probed. That is the same class of error as
a sandbox believed isolated but configured otherwise: a control accurately described in
the abstract, absent in the actual deployment. It was caught only by **probing for
failure rather than confirming success**. Verification means attacking the boundary,
not observing the happy path.

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

### 2.5. EARLY SPIKE — ✅ RUN 24 July 2026. Results in the findings block above.
*(Outcome in brief: Bash bypass proven total; Windows sandbox closure unavailable;
model audit trail confirmed. One open item remains — whether a fresh-context instance
reasons independently — which needs a live second instance, not a config probe.)*
**Why:** Seven days of sequential *reasoning* before any *test* is this document's
weakest structural choice — and it repeats the "reason instead of verify" habit that
just produced a wrong conclusion on the budget question. A second VS Code / Claude
Code instance with `Edit`/`Write`/`NotebookEdit` **denied in settings** can be stood
up in under an hour and resolves items 3, 5, and part of 6 by *observation* instead
of speculation. Do this early; let the later research lean on observed behaviour.
**Decide (empirically, not by argument).** Documentation now answers much of this
(see findings above) — so the spike's job has narrowed to **confirming the ⚠ items that
docs alone cannot settle for this machine**:
- Does `permissions.deny: ["Edit","Write","NotebookEdit"]` actually hold in practice?
- ⚠ **Test the Bash gap deliberately:** with edit tools denied, can the instance still
  mutate files via shell? Confirm the closure (`sandbox.filesystem` rules or denying
  `Bash`) actually works.
- ⚠ **Test the MCP gap:** confirm whether any configured MCP server exposes write tools
  that survive the deny rules, and that `mcp__<server>` patterns close it.
- ⚠ **Test the model-pin fallback:** pin a model, confirm `message.model` in the
  transcript records it. Then (if cheap) pin an unavailable model and observe the
  silent-fallback behaviour, so the failure mode is known rather than assumed.
- Does a fresh-context instance reasoning only from the files produce an *independent*
  read, or does it drift toward the builder's framing? (docs cannot answer this;
  observation only — resolves item 3)
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

**Documentation lean (24 July 2026):** subagents give only **partial** context
independence — a subagent's own context is isolated, but its findings return to the
main session, so the implementer can still be biased by them. **Two separate Claude
Code instances give complete independence** (separate transcripts, file-only handoff).
Since item 5's entire purpose is preventing rubber-stamping, this points toward two
instances for the review role rather than an SDK-orchestrated subagent pair. Confirm
by observation in the 2.5 spike before treating as settled.

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

**SETTLED BY SPIKE (24 July 2026) — and the answer is worse than documentation implied.**
`permissions.deny` genuinely blocks the *tools*, but **Bash bypasses it completely**
(proven: overwrite, `sed -i`, create, delete all succeeded with edit tools denied). And
the documented sandbox closure is **unavailable on Windows**. Therefore, on this
machine, read-only is enforceable **only by also denying `Bash`** — accepting the loss
of `git`/`grep`/build inspection for the architect — or by not relying on enforcement
at all, which is rejected on principle. There is no free, full-capability read-only
architect on this platform. Plan around that constraint, do not wish it away.

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

**LARGELY SETTLED (24 July 2026, documentation):** per-subagent `model` frontmatter is
**hard-enforced** by the harness; per-role assignment (architect heavy / builder light)
is supported and documented. Two things remain open: ⚠ the **silent fallback** when a
pinned model is unavailable (no hard-fail mode — so always verify `message.model`
rather than trusting the pin alone), and ⚠ whether the `availableModels` allowlist
applies outside managed/enterprise settings. Both go to the 2.5 spike.

### 7. ENFORCEMENT — token/cost accounting and alerting (post-hoc, not a live gate)
**Why:** The allowance burned because nothing mechanical watched it. Corrected from
the original "budget with teeth": a real-time hard gate that blocks an overspending
turn **does not exist** on a subscription (see ground truth above) — so this item is
*accounting + alerting*, not a pre-emptive control. That is not settling for less; it
is what the platform actually permits, and it is still night-and-day better than
Codex's nothing. It remains genuine enforcement, applied *after* each turn rather than
before it.
**Decide:** Confirm the exact `usage` fields per turn in the JSONL transcript (already
verified to exist), the method to sum them per session/day, and the threshold at which
a hook or the loop **alerts**. The write-to-disk-then-read-back mechanism is already
proven by `claude-context-status.json`; this extends it to tokens/cost. Ballpark is the
target, and ballpark is achievable.

**CEILING CONFIRMED (24 July 2026, documentation):** there is **no hard spend limit or
cost gate anywhere in Claude Code** — plan limits are soft, `/usage-credits` is a
request flow rather than a stop, and no CLI threshold or halt exists. This is the
platform ceiling, not a gap in imagination; design accordingly. What IS available and
documented: the JSONL `usage` object is a **supported** cost-tracking source (safe to
build on — it should not vanish); `/usage` shows session tokens by model with a local
estimate (resets on `/clear`); and **OpenTelemetry export** is official
(`CLAUDE_CODE_ENABLE_TELEMETRY=1` + OTLP → `claude_code.cost.usage`,
`claude_code.token.usage`). All cost figures are **client-side estimates**, explicitly
not authoritative billing. Rates are recorded in the findings block above.
**Remaining work is therefore Carl's to build:** the threshold alerting on top of these
surfaces. Nothing will do it for you.

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
