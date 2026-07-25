# Workflow Redesign — Research Index

**Status:** Active research artifact. Not a plan, not a decision, not implementation
authority. This is the master index for a ~7-day research process, worked through
sequentially. Findings return to Claude Code (builder-context instance) to be
pressure-tested against this file system, the established ethos, and the two prior
failures below. Decisions that survive that test are logged (see "Decision log").

**Progress as of 25 July 2026:**

| Item | State |
|---|---|
| 1. Ecosystem landscape | ✅ **Resolved 25 July** — map drawn; no fifth governance shape exists (clean "no gaps"); git gap closed via DL-7 |
| 2. Agent SDK fundamentals | ✅ **Resolved 25 July** — SDK out (headless), agent teams out (permission inheritance); two instances confirmed. See DL-6 |
| 2.5. Early spike | ✅ Run 24 July — all sub-questions closed |
| 3. Meaning of "separation" | ✅ Answered empirically — independence confirmed |
| 4. Role mapping onto new harness | ⚠ **LIVE GAP** — Codex retired; open hole, interim holding position only |
| 5. Review independence | ✅ Settled — boundary holds *and* review is independent |
| 6. Model pinning | ✅ Largely settled — pin *and* verify; one ⚠ open |
| 7. Cost accounting | ✅ Ceiling confirmed — post-hoc alerting only; build work remains |
| 8. Converged decision | **UNBLOCKED** — items 1 and 2 both cleared 25 July. Item 4 is the remaining work |

**Two changes of circumstance since this document was first written, both after
24 July, neither of which the original text anticipates:**
1. **Codex is retired** — not "being considered for replacement". The bridge is
   deregistered and gone. Item 4 changed from a hypothetical comparison into an open
   hole in the governance record.
2. **The independence question is answered** — a live read-only architect review ran on
   24 July and reasoned independently. Item 3's last open question is closed.

**⚠ Reading this repo alongside this document:** `ai-system/ai-roles.md` is **stale**
(last updated 2026-05-23) and still documents ChatGPT as PM/Creative Director with veto
power, plus the Codex bridge. That layer is not operating. It is left unedited
deliberately — see item 4.

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

---

## THE TWO GOVERNING PRINCIPLES (established 25 July 2026 — read these first)

Both were **earned empirically in a single session**, from mechanisms that share no code.
They now govern every enforcement claim in this redesign, and item 4 inherits them as a
test any replacement review layer must pass.

### P-A · Verify what ran, never what was requested

The audit surface — `message.model` per turn, the actual exposed tool list, an *attacked*
boundary — is ground truth. **The config that was supposed to produce it is only an
intention.** Every enforcement claim in this document must name its after-the-fact
verification surface, or it is not enforcement.

**Four independent instances of this failure class are now on record, across four
unrelated subsystems:**

| # | Mechanism | Requested | Actually ran |
|---|---|---|---|
| 1 | **Model pin** (25 Jul) | `opus[1m]` in `settings.json` | `claude-opus-4-8` — 35 turns, silent fallback caught in the architect's own transcript |
| 2 | **MCP surface** (verified 25 Jul) | `github-mcp-server --read-only` | Write tools (`create_branch`, `merge_pull_request`) still present **and functional** — issue #2156 |
| 3 | **OS sandbox** (24 Jul spike) | `sandbox.filesystem.denyWrite` | Neither `bwrap` nor `sandbox-exec` exists on Windows — control absent entirely |
| 4 | **Tool permissions** (24 Jul, DL-1) | `deny: [Edit, Write, NotebookEdit]` | Every mutating op succeeded via shell — the deny was cosmetic |

**A pattern recurring across four unrelated mechanisms is not a property of those
mechanisms. It is a property of the platform.** Treat every configured control as
unverified until its execution is inspected.

### P-B · Remove the capability; do not ask a capable surface to decline

**A read-only flag on a write-capable surface is fragile. A surface with no write tools
is robust.** Prefer removing capability entirely over requesting that a capable surface
behave.

This explains, in one rule, several findings that previously looked separate:
- Bare-name `Bash` deny **held** (the tool is gone from context) where pattern-based Bash
  allow-listing is **documented by Anthropic as fragile**.
- A no-write-tools MCP surface would beat a `--read-only` flag on a write-capable one
  (instance 2 above).
- It is the structural reason **§5 builder-supplied evidence is sound**: it gives the
  architect *no write-capable git surface to misfire*, rather than a git surface asked
  nicely not to write.

**⇒ For item 4:** whatever performs checkpoint review, its read-only boundary must be
**structural absence of capability**, verified by attack, with a named audit surface —
never a mode, flag, or instruction trusted to hold.

*Both principles proposed by CP, 25 July 2026, after the builder verified instances 1
and 2. Recorded as first-class governing principles rather than caveats attached to
individual items.*

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

### 1. The Anthropic-ecosystem landscape — ✅ RESOLVED 25 July 2026
**Why:** Before choosing a harness, understand what exists — Claude Code (CLI +
VS Code extension, runs subagents), the Claude Agent SDK (programmatic multi-agent
orchestration), and the Claude API underneath. Each is a different level of control.
**Decide:** A plain-language map of the options and which layer each operates at.
No commitment yet — just the terrain.

**Scope taken: decision-support map, not a reference map.** Reasoning recorded because it
generalises: a reference map that "outlives the decision" documents ruled-out territory
*and* silently misses live territory. Agent teams shipped 5 Feb 2026 and neither the
builder nor CP knew of it in July — that is the shelf life of a reference map here.

**THE MAP.**

- **Claude Code CLI** — the interactive engine a human drives in a terminal.
- **VS Code extension** — a front-end onto that same engine. ⚠ The extension alone
  provides **no `claude` binary**, so `CLAUDE_CONFIG_DIR` isolation requires the CLI
  installed (v2.1.219 here).
- **Agent SDK** — the same engine as a Python/TypeScript library, driven by **code, not a
  human**.
- **API** — raw model access, no tool loop.

**The two-instance choice sits entirely in the CLI/extension layer.** CP's sharpening,
accepted: it is not "two instances *instead of* the SDK" but "two instances *in the layer
below* the SDK" — because the SDK does not add a coordinating layer **above** interactive
sessions, it **replaces the human driver**. Nothing orchestrates two interactive instances
from above except agent teams, already ruled out for governance (DL-6).

**Is there a fifth governance shape? No — clean "no gaps", recorded as a real finding.**
Everything else surfaced is builder-side parallelism or an enforcement lever, not a
separation shape:

| Surfaced | What it actually is | Governance shape? |
|---|---|---|
| Background agents / `run_in_background` | Within-session concurrency | No |
| Worktrees / `Agent(isolation:worktree)` | Isolated working copies, builder-side | No |
| `--agents` JSON flag | Still the subagent primitive — inherits DL-6's independence weakness. Note `disableSideloadFlags` can reject it | No |
| **Managed settings** | A tier **above** user/project settings that cannot be overridden, **not even by `--allowedTools`**. Precedence: managed → CLI args → local project → shared project → user | **Enforcement lever, not a shape.** ⚠ Unverified whether it applies to a personal non-org setup — same open question as `availableModels` in DL-3 |
| Plan mode | A permission *mode* where the session is "structurally incapable of making changes" | ⚠ Lighter route to read-only, but **unverified against the DL-1 Bash bypass**. Do not adopt untested — this is exactly the docs-say-X shape P-A warns about |

**⇒ Separation options remain exactly three:** two instances (**chosen**), SDK subagent
pair (rejected — independence), agent teams (rejected — permission inheritance).

### 2. Claude Agent SDK fundamentals — ✅ RESOLVED 25 July 2026
**Why:** The SDK is the most likely home for a programmatic architect/builder loop
with defined roles. Need a *relative* understanding (not bedrock) of what it is,
what it orchestrates, and its learning curve.
**Decide:** Is the Agent SDK the right primitive for this, or is a
second Claude Code instance (lighter) sufficient? Frame the trade-off; don't resolve
it until items 3–7 inform it.

**ANSWER: the SDK is NOT the right primitive — two Claude Code instances are.**
Resolved by CP research plus builder documentation verification. See **DL-6**.

- **SDK ruled out.** SDK orchestration means *code* drives the agent; an interactive
  VS Code session means *Carl* drives it. Mutually exclusive — orchestrating the builder
  forces it **headless**, costing the IDE Carl works in. The fixed shape does not permit
  that. Compounding it: the SDK's orchestration primitive is the **subagent**, whose
  findings return to the parent context, which **reintroduces the independence bias**
  item 5 exists to prevent. So the SDK is not "stronger enforcement at an IDE cost" — it
  is *weaker* on the property that matters most.
- **Agent teams ruled out** (a fourth option, surfaced by CP; the builder did not know it
  existed). Real and current — 5 Feb 2026, works on Pro, CLI here is 2.1.219. But
  documented: *"Teammates start with the lead's permission settings [...] you can't set
  per-teammate modes at spawn time."* The read-only architect **is** a different
  permission set, so this defeats it. Also *"Lead is fixed"* (architect would be
  subordinate to the builder) and split panes are unsupported in VS Code's terminal on
  Windows.
- **Retained for a different purpose:** agent teams is a strong *builder-side* tool for
  parallel review — the docs' competing-hypotheses pattern is designed to beat anchoring
  bias. Useful inside a build task, with Carl's approval. **Not** governance.

**⇒ Item 8's remaining blocker is item 1 alone.**

### 2.5. EARLY SPIKE — ✅ RUN 24 July 2026. Results in the findings block above.
*(Outcome in brief: Bash bypass proven total; Windows sandbox closure unavailable;
model audit trail confirmed. One open item remained — whether a fresh-context instance
reasons independently — which needed a live second instance, not a config probe.*
***That item is now CLOSED: see "Independence — ANSWERED" under item 3 and item 5.****)*
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

**✅ INDEPENDENCE — ANSWERED EMPIRICALLY (24 July 2026, live architect review).**
The one question documentation could not settle is now closed by observation, not
argument. A read-only architect instance (`~/.claude-architect`, fresh context, files
only, no access to the builder's chat) performed a full checkpoint review of the
pre-warm work. Full record: `live-work/architect-review-findings.md`.

**It reasoned independently — demonstrated on four counts, not asserted:**
- Found a **real defect the builder had missed across two days of self-review** (F-2:
  the reduced-motion route waits the full 7100ms for choreography that never runs).
- Flagged a **governance gap the builder had repeatedly walked past** (F-1: the
  undocumented q5proto Q5 lighting layer, and the resulting false "byte-identical"
  claim in D-032).
- **Declined two of the four checkpoint questions** as not warranting Carl's attention,
  rather than manufacturing findings to look useful.
- **Led with its own verification limit** (Bash denied ⇒ no `git diff`) and **refused
  the Codex role label** it had not been granted.

⇒ **Item 3's open question is resolved: a fresh-context instance reasons independently
rather than drifting toward the builder's framing.** The two-instance lean above is
therefore confirmed by evidence, not just by documentation.

**The cost is confirmed too, and it is not free.** The same review had to hand F-1 back
**unresolved** because it could not run `git` to establish attribution — the builder
closed it afterwards (committed prior work, `b08815b`, zero occurrences in the working
diff). This is the item 5 / spike-result-2 trade-off appearing in production rather
than in theory: **a genuinely read-only architect on Windows cannot self-serve
attribution questions.** Any design that keeps the read-only boundary must also plan a
route for git-dependent findings to be closed — builder-supplied evidence, a
pre-generated diff placed in `live-work/`, or Carl arbitrating.

**Caveat on generality:** this is **one** run against a well-documented file set. It
proves independence is *achievable* under this configuration, not that it is guaranteed
on every future review. Do not over-read a single trial.

### 4. Mapping the architect/builder roles onto the new harness
**Why:** The existing role boundaries are sound and model-agnostic: architect
reviews and reports findings only; Carl decides; builder implements. These must
survive the pivot intact (see `checkpoint-review-protocol.md`, `context-rules.md`).
**Decide:** How each existing protocol role maps to the chosen harness. What changes
in `checkpoint-review-protocol.md` "Technical Registration" (currently the `codex`
MCP bridge) when the architect is a Claude instance/SDK agent instead.

**⚠ NO LONGER HYPOTHETICAL — THIS ITEM IS NOW THE LIVE GAP (25 July 2026).**
Item 4 was written as a future question: what *would* change when the architect stops
being Codex. Events have overtaken it. **Codex is retired** — the MCP bridge is
deregistered, `mcpServers` in `~/.claude.json` is empty, and the wrapper is deleted
(`live-work/codex-removal-status.md`). The old routing is gone whether or not a
replacement is designed, so this is no longer a comparison between two options; it is
an **open hole in the governance record**.

**Interim measure already applied (25 July 2026), so nothing is silently broken:**
`CLAUDE.md` workflow step 5 now states that Codex is retired, that the `codex` server
must not be called, and that the replacement review layer is **undecided and under
active discussion (this document)**. Crucially **the milestone gate itself is
preserved** — the builder still stops at checkpoints, reports, and lets Carl route the
review. Only the *routing* is open; the *obligation* is not. That clause also marks
`checkpoint-review-protocol.md`'s Codex-specific Technical Registration as superseded.
This is a holding position, not an answer to item 4.

**⚠ STALE EXHIBIT — read this before reasoning from `ai-system/ai-roles.md`.**
`ai-roles.md` (last updated 2026-05-23) still describes the **pre-pivot** structure and
has NOT been revised: it places **ChatGPT as PM / Creative Director between Carl and
Claude Code**, with authority to define sprints, compress every brief, route all QA
findings, and **veto Claude Code's implementation before it ships**; and it names the
Codex MCP bridge as ChatGPT's review channel. **None of that layer is operating.**
Treat `ai-roles.md` as a historical exhibit, not a description of the current workflow.
Deliberately left unedited — rewriting the authority structure is exactly the decision
item 4 exists to make, and is Carl's, not the builder's.

**What item 4 must now actually produce** (it inherits more than it was first scoped
for):
- Who or what performs checkpoint review, and how it is technically registered.
- How the **read-only cost** established under item 3 is handled — the route by which
  git-dependent findings get closed without granting the architect write capability.
- A corrected `ai-roles.md` authority hierarchy with the ChatGPT/Codex layer removed
  and whatever replaces it named.
- Whether `checkpoint-review-protocol.md` is amended or superseded outright.

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

**✅ RUBBER-STAMPING QUESTION ANSWERED IN PRODUCTION (24 July 2026).** The live
architect review did not approve — it found a defect the builder had missed, flagged a
governance gap, declined two questions, and refused a role label. Detail and the four
counts are recorded under item 3 above; not repeated here. **Both halves of item 5 are
now evidenced:** the boundary holds under attack (spike result 4), *and* the review
that boundary protects is genuinely independent.

**The trade-off is now priced, not estimated.** The same review handed F-1 back
unresolved for want of `git`. Read-only is affordable, but it is **not free**, and
item 4 must specify how git-dependent findings get closed.

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

**These are research findings, not APPROVED decisions.** Nothing here has been through
`decisions.md`; this log records what the research established and what it ruled out.
Item 8 remains the point where research becomes a plan.

**Index** (entries appear below in the order they were written, not numerical order —
numbers are stable references and are deliberately not renumbered):

| Entry | Subject | Date |
|---|---|---|
| **DL-1** | Read-only enforcement — deny `Bash` too | 24 Jul |
| **DL-2** | Review independence — proven by live architect run | 24 Jul |
| **DL-3** | Model pinning — hard for subagents, silent fallback | 24 Jul |
| **DL-4** | Cost control — post-hoc accounting only, no gate exists | 24 Jul |
| **DL-7** | Architect's git gap — builder-supplied evidence | 25 Jul |
| **DL-6** | Harness primitive — two instances *(carries a correction)* | 25 Jul |
| **DL-5** | Codex retirement | 24–25 Jul |

### DL-1 · Read-only enforcement mechanism (items 2.5, 5) — 24 July 2026
**Chosen:** deny `Edit`, `Write`, `NotebookEdit` **and `Bash`** together, in a separate
config dir launched via `CLAUDE_CONFIG_DIR`. Verified by attacking it: Write tool,
shell redirect and `sed -i` all refused.
**Rejected — tool-deny alone (no `Bash` deny):** proven **cosmetic**. Overwrite,
`sed -i`, create and delete all succeeded via the shell. Reads as read-only in review;
is not read-only in fact.
**Rejected — `sandbox.filesystem.denyWrite`:** requires Seatbelt or bubblewrap. This is
Windows 11; both verified absent. The documented closure is for a platform not in use.
**Rejected — accept the gap knowingly:** this is precisely the prose-guardrail failure
the redesign exists to eliminate. Rejected on principle, not on cost.
**Known cost:** the architect loses `git`, `grep`, build inspection and test runs.

### DL-2 · Review independence (items 3, 5) — 24 July 2026
**Established:** a fresh-context, read-only instance reasoning from files alone
**reasons independently** — found a missed defect, flagged a walked-past governance
gap, declined two questions, refused an ungranted role label.
**Consequence:** the two-instance lean is confirmed by evidence, not documentation
alone. Subagents remain **partial** independence (findings return to the main session),
so they are not a substitute for the review role.
**Caveat:** one trial, one well-documented file set. Independence is shown achievable,
not guaranteed per-run.

### DL-3 · Model pinning (item 6) — 24 July 2026
**Established:** per-subagent `model` frontmatter is hard-enforced; `message.model` is
recorded per turn (179 turns observed), so the pin has a real audit trail.
**Not sufficient alone:** an unavailable pinned model **silently falls back** — there is
no hard-fail mode. **Pin *and* verify** is the rule; the pin by itself is a request.
**Still open:** whether `availableModels` applies outside managed/enterprise settings.

### DL-4 · Cost control (item 7) — 24 July 2026
**Established ceiling:** no hard spend limit or cost gate exists anywhere in Claude
Code. Not a gap in imagination — the platform ceiling.
**Chosen shape:** post-hoc accounting and alerting on the JSONL `usage` object (a
documented, supported source), optionally via OpenTelemetry export.
**Rejected — real-time budget gate:** does not exist on a subscription. Designing
around one would repeat the "reason instead of verify" error this document names.
**Remaining work is Carl's to build:** nothing does the threshold alerting for you.

### DL-7 · The architect's git gap — builder-supplied evidence (items 1, 5) — 25 July 2026
**Chosen:** **§5 builder-supplied evidence.** Before each checkpoint the builder writes
raw git output (`diff --stat`, full diff, `log --oneline`, lint/typecheck verbatim, test
results, screenshots) into `live-work/`. **Evidence, not argument** — the builder's
reasoning stays separate in `claude-chat-window.md` so the architect weighs one against
the other. `Bash` stays fully denied; **zero new trust surface.**
**Why it was needed:** F-1 on 24 July was handed back **unresolved** because the architect
could not run `git` to establish whether a code layer was drift or prior committed work.
Real cost, observed in production.
**Rejected — read-only-git Bash allow-list:** Anthropic's own docs state *"Bash permission
patterns that try to constrain command arguments are **fragile**"*, and their example is
defeated by flags-before-URL, protocol change, redirects, shell variables, and extra
spaces. **Rejected on documentation, no spike spent** — the vendor names the weakness.
(Confirmed separately: read-only `git` *is* in the built-in no-prompt set, but reaching it
requires the fragile allow-list shape, and `git` prompts anyway on unquoted globs and on
`cd`+`git` into a different directory, since git can execute that directory's hooks.)
**Rejected — `@readonly-mcp/core` MCP server:** CP surfaced it and its design rationale
independently restates DL-1 (allowlists not denylists, `execFile` with no shell, no `cwd`,
no write tools in the git surface). Genuinely the right *shape* per P-B. **But builder
verification found it disqualifying on provenance:** **not on npm at all** (404,
unpublished), **`license: NONE`** — all-rights-reserved by default, so there is no grant
to use it — **0 stars / 0 forks / 0 watchers**, no releases, created 2 April 2026, and
**one** contributor (`gtbuchanan`, 32 commits) where CP had read three.
**The license fact is dispositive before security enters**, so no audit was run: the spike
would have decided whether to trust unlicensed code from an anonymous single author with
privileged access to the architect's entire view of git — and the answer is no regardless
of how the audit reads. Adopting it would replace a trust problem with a larger one, in a
project whose two founding scars are exactly that.
**Cost accepted:** git-dependent findings close on a one-turn handoff rather than
architect self-service.

### DL-6 · Harness primitive — two instances, not the SDK (item 2) — 25 July 2026
**⚠ CORRECTED 25 July 2026 — see the correction block at the end of this entry. The
original "hard per-role pinning" claim below is WRONG and is preserved, not deleted.**
**Chosen:** **two Claude Code instances** (architect + builder), with **subagent
frontmatter model pinning** for hard per-role model enforcement where it applies.
**Rejected — Agent SDK orchestration:** SDK orchestration means code drives the agent;
an interactive session means Carl drives it. Mutually exclusive, so orchestrating the
builder forces it **headless** and costs the IDE. Separately, the SDK's orchestration
primitive is the **subagent**, whose findings return to the parent context — reintroducing
the very independence bias DL-2 and item 5 exist to prevent. Weaker where it counts.
**Rejected — Agent teams:** real, current (5 Feb 2026; CLI 2.1.219 supports it), and
genuinely independent sessions with peer messaging. But **permissions are inherited from
the lead and cannot be set per teammate at spawn time** — and the read-only architect *is*
a distinct permission set (`deny: [Edit, Write, NotebookEdit, Bash, mcp__codex]` via a
separate `CLAUDE_CONFIG_DIR`). A teammate would inherit the builder's permissions and
could write code. Also **"lead is fixed"** (the architect would be subordinate to the
builder, inverting the hierarchy), and split panes are unsupported in VS Code's integrated
terminal and Windows Terminal.
**Not rejected, re-filed:** agent teams as a **builder-side** parallel-review tool. The
documented competing-hypotheses pattern is designed to beat anchoring bias. Governance no;
build-task review yes, with Carl's approval.
**How it was resolved:** CP researched and flagged agent teams as a possible hybrid needing
a spike; the builder verified against official documentation, which settled it **without**
a spike. **CP surfaced an option the builder did not know existed and corrected the
builder's framing of the SDK.** The builder's prior two-instance lean survived — but only
after scrutiny it had not previously had. First evidence that a same-vendor reviewer does
not merely agree with the builder.

**⚠ CORRECTION — "hard per-role pinning" was wrong (25 July 2026, proven on this machine).**

CP was asked to pressure-test the claim above rather than accept it, and found it
overstated. **The builder then proved CP right from the architect's own transcript:**

```
~/.claude-architect/settings.json  requests:  "model": "opus[1m]"
7119e808-….jsonl  message.model records:      claude-opus-4-8   x35 turns
```

**The requested model is not the model that ran.** Silent fallback, caught in the act.

**Why the original claim was wrong:** subagent `model` frontmatter *is* hard-enforced —
but the architect and builder are **two top-level sessions, not subagents**. They run
their *session* model from their own config. DL-3's hard-pin finding therefore **does not
transfer** to the two-instance split, and DL-3's silent-fallback caveat applies in full.

**Corrected statement, which is what the record now holds:** per-role model choice on two
instances is **config-set and verify-audited**, not hard-pinned. The 179-turn
`message.model` audit trail from the 24 July spike **does transfer** — the *verify* half of
pin-and-verify is intact and is precisely what exposed this.

**The tension worth logging, and it is load-bearing for item 4:** *the harder pin and the
independence we need pull in opposite directions.* Two instances buy independence and
settle for config-plus-verify pinning. Moving the architect to a subagent would buy the
harder pin and **cost the independence** (DL-2, item 5). **Independence wins** — it is the
property the review layer exists to protect. This is instance 1 of principle **P-A**.

### DL-5 · Codex retirement (item 4) — 24–25 July 2026
**Actioned:** Codex retired as the governance layer. MCP bridge deregistered, wrapper
deleted, `mcpServers` empty. App removal deliberately paused until ~14 August 2026
(paid access unexpired) — `live-work/codex-removal-status.md`.
**Interim:** `CLAUDE.md` step 5 preserves the checkpoint **gate** while declaring the
**routing** undecided. A holding position, explicitly not an answer to item 4.
**Not actioned, by design:** `ai-system/ai-roles.md` still documents the ChatGPT/Codex
authority layer. Rewriting it is item 4's job and Carl's decision.

---

## Open questions carried forward

- **Item 4 is now the live gap** — Codex is gone, so this is an open hole in the
  governance record rather than a design comparison. See the item 4 block above for the
  four things it must produce.
- ~~**How do git-dependent findings get closed** when the architect has no `Bash`?~~
  **CLOSED 25 July — DL-7.** Builder pre-supplies raw git evidence into `live-work/`.
  Allow-list route rejected on Anthropic's own "fragile" warning; MCP server rejected on
  `license: NONE` + unpublished + single anonymous author.
- **Does `availableModels` apply to a personal (non-managed) setup?** Carried from DL-3.
  **Now joined by the same question about the whole managed-settings tier** (item 1) —
  managed settings sit above user/project config and cannot be overridden even by
  `--allowedTools`, which would make it the strongest enforcement lever available. Both
  hinge on one unknown: does the managed tier work outside an org deployment?
- **Does plan mode close the DL-1 Bash bypass?** Surfaced by item 1. Documented as
  "structurally incapable of making changes", which *sounds* like a lighter route to
  read-only than the full deny-list. **Untested against the proven bypass** — and per
  **P-A**, a documented control is an intention until its execution is inspected.
- **Is the two-instance session model enforced at all, or only requested?** Partly
  answered and the answer is unwelcome: `opus[1m]` requested, `claude-opus-4-8` ran (DL-6
  correction). Open question is whether *any* session-model request is honoured reliably,
  or whether verify-after is the only real control.
- **Does independence hold across repeated reviews**, or was the 24 July result a
  favourable single trial? Only accumulated runs can answer this.
- ~~**Items 1 and 2 remain unstarted**~~ — **item 2 resolved 25 July (DL-6);** the
  two-instance choice has now been compared against both the SDK and agent teams, and both
  were ruled out on documented grounds. **Item 1 (ecosystem map) remains unstarted and is
  the sole remaining blocker on item 8.**
- **Does independence hold when the reviewer is same-vendor?** Partly answered, and
  encouragingly: on 25 July CP surfaced **agent teams** — an option the builder did not
  know existed — and corrected the builder's framing of the SDK. That is a same-vendor
  reviewer contributing something the builder could not produce itself. Still one data
  point on a research question rather than a code review; keep accumulating.
- **Is `opus[1m]` right for the architect?** First-run setup rewrote the model to the
  1M-context variant — more context than a PM-altitude reviewer needs, and Fable/Opus
  rates make it a costed choice. Revisit if token spend matters.
