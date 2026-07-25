# Proposed Governance Design — Architect / Builder, Post-Codex

**Status: CONVERSATION STARTER. Not a proposal awaiting approval, not implemented, no
authority.**
Written 25 July 2026 by Claude Code (builder), wearing the PM hat temporarily while
the architect seat is empty. Carl's instruction: *same process — architect/builder
method, rules and governance in place; how we achieve that is mine to design; **discuss
first with Claude Project, decide, then implement.***

**Carl's framing, which governs how to read this (25 July 2026):**

> *"The document that we will send to Claude Projects is only the starting point for a
> conversation."*

So: **every recommendation here is an opening position, not a finding.** Where the builder
has a lean it is labelled as one. Where Carl has decided, it is marked as decided. The
distinction matters — Claude Project should feel free to overturn the leans, and should
*not* re-litigate the decisions.

**THE ONE FIXED POINT — Carl, 25 July 2026:**

> **Architect with its role in one VS Code instance. Builder in another.**
> Both see GitHub. Architect is read-only and cannot touch code.

Everything else in this document is negotiable, including requirements the builder
derived (see the R1 note in §1). If a derived requirement conflicts with the fixed shape,
**the requirement changes, not the shape.**

This document exists to be **argued with**. Take it into the Claude Project discussion
alongside `workflow-redesign-research.md`. Nothing in the repo has been restructured to
match it.

**Companion documents:**
- `workflow-redesign-research.md` — the evidence base. Every claim below traces to it.
- `../ai-system/ai-roles.md` — the **stale** current structure this replaces.
- `../DRAFT-working-with-carl.md` — how Carl works. Governs tone, not mechanism.

---

## 1. What we are replacing, stated honestly

The old system worked like this:

1. Carl brainstormed and planned in Codex.
2. Codex wrote a prompt for Claude Code.
3. Claude Code built, and wrote its results into `live-work/`.
4. Codex read those files back, closing the loop.

**The design was sound. Execution failed** — Codex ignored the token-efficiency and
model-selection rules it was given, and the ChatGPT allowance burned. The guardrail
that was supposed to protect the budget was the guardrail that failed.

**The lesson that governs this entire document:** a guardrail written as prose that an
agent may choose to ignore is not a control. Enforcement must be a mechanism Carl owns
and can verify.

### What the MCP bridge was actually for — corrected by Carl, 25 July 2026

**An earlier draft of this section got this wrong and is corrected here rather than
quietly amended.** It read the startup pack's "Codex cannot see the Claude Code chat
panel" line as the whole story, and concluded the old link was plain file polling. That
understated what was built.

**Carl's account, which is authoritative:**

- The bridge was set up **specifically to end the copy/paste burden** between the two
  agents. That was the problem it solved.
- **In Plan Mode, Codex could see the plan.** Not a file written afterwards — the plan.
- **Temporary handoff files carried the chat-window content**, and were disposable by
  design: if Carl needed something later, he could scroll his own window and get it.
- **The intent was that Codex should see the builder's *methodology*, not just its
  output** — more information, possibly better decisions.
- **The Drift Sentinel did what its name says:** watch for drift and scope creep.

Both statements are true of different things. The scripted answer was about the **raw
VS Code chat UI**, which Codex genuinely could not read. The bridge carried the **plan
and the handoff files**, which it could. My earlier reading collapsed the two.

**Why the distinction is load-bearing for this design:**

The requirement is not "replace a file-sync." It is **"the architect must see how the
builder is thinking, not only what it produced"** — and it must arrive without Carl
acting as a courier.

That reframes §5 entirely. An architect reading only a finished diff is reviewing a
*different object* than one that watched the reasoning form. The 24 July architect
review is evidence both ways: it caught a real defect from files alone — **and** it had
to hand F-1 back unresolved for want of information it could not fetch itself.

**This gives us a design *goal*, not a hard constraint:**

> **R1 (goal, negotiable) — It is desirable that the architect can see the builder's plan
> and methodology, not just its output, without Carl copy/pasting between windows.**

**⚠ R1 IS SUBORDINATE TO THE FIXED SHAPE — Carl, 25 July 2026.** An earlier draft
promoted this to a first-class requirement that the architecture had to satisfy. That
was the builder over-weighting its own derivation. Carl's ruling:

> *"If VS Code instances do not satisfy R1, we will change R1. Bottom line: architect
> with its role in one instance, you in your builder role in another."*

**The two-instance shape is the decided frame. R1 is an aspiration measured against it,
not a test it must pass.** If a cheap mechanism delivers R1 inside two instances, good.
If not, R1 gets reduced or dropped — the shape does not.

This is the intent-and-chunk principle applied to governance: the *why* behind the old
bridge (better information → better decisions) is worth carrying forward; the *mechanism*
it happened to use is not load-bearing.

---

## 1a. CONFIRMED STRUCTURE — Carl, 25 July 2026

**Decided. Not open for the discussion to relitigate.** The aim is a business set up like
a real company, with separated roles.

**The target structure, in plain terms:**

- **Carl** — founder, final authority. Decides, approves, routes everything.
- **Project Manager / Architect** — VS Code 1. Brainstorms, designs, breaks work into
  chunks, reviews the builder's plans. Reads git for context; **read-only over code**.
- **Builder** — VS Code 2. Implements all website code. The only agent that touches the
  codebase.

The Builder reports to the PM/Architect. The PM/Architect reports to Carl.

**Claude Design is deliberately out of scope here.** It arrives after the website ships
and its role is a future Carl↔PM conversation — not the builder's to design, and not
something this document should pre-shape. Noted only so its later arrival is not a
surprise.

### ⚠ Where Claude Project (CP) sits — corrected 25 July 2026

**An earlier draft of this document implied CP occupies the PM seat. It does not, and
Carl corrected this directly:** *"CP is not the PM, you are"* — meaning the builder is
covering the Architect role **temporarily**, wearing two hats until the new structure is
stood up.

**CP is a research, analysis and discussion partner.** It researches questions, reads the
repo, analyses options, argues with proposals (including this one), and produces reports
Carl carries back. It does **not** direct the builder, does not outrank it, and does not
approve anything.

**This matters for reading the rest of the document.** Where "the architect" or "the PM"
appears below, it means **the role** — currently held temporarily by the builder, and
destined for VS Code 1 once stood up. It does **not** mean CP.

**Recorded because the distinction is easy to lose:** CP is a *layer supporting the
work*, not a *seat in the hierarchy*. Conflating the two would put a discussion partner
in an authority position nobody granted it — the same class of error as the old
`ai-roles.md` giving ChatGPT veto power over implementation.

### The working loop

1. **Carl and the Architect brainstorm** until the design settles.
2. **Carl leads the chunking** — bite-sized, sometimes nibble-sized — and the Architect
   records it and drafts the prompt. **Carl approves the prompt** before it reaches the
   Builder, checking that his design, ethos and intent survived the translation. Carl
   deliberately gives the Architect only what it needs to know, for focus; the asymmetry
   is a control, not an oversight. *(Corrected 25 July 2026 — an earlier draft credited
   the Architect with leading the chunking.)*
3. **The Builder is put into Plan Mode** and writes the plan for that chunk.
4. **The Architect reviews the plan** — deep discussion, generally positive, but reliably
   added to or adjusted.
5. **Carl approves.**
6. **The Builder executes that chunk only.**

**Why the chunking exists — the load-bearing reason.** To keep the builder focused. The
builder does not need the gradient colouring inside the four boxes while working on the
gold rim. *Not yet.* This is the intent-and-chunk principle from
`DRAFT-working-with-carl.md` operating as an actual mechanism rather than an aspiration.

**On the review being "always added to":** Carl's own note is that "looks good" was his
loose paraphrase — the real pattern is a **deeply discussed** plan, generally positively
received, but reliably amended in small ways, with Carl holding final authority. Not a
rubber stamp; not a rewrite either.

**Open question Carl raised, worth actively watching:** will a *same-vendor* architect
behave the same way? Builder's honest guess — **yes, but the mechanism to watch is not
ego.** A reviewer returning "approved, no changes" produces nothing the process can use,
so there is structural pressure toward finding *something*. **Manufactured amendments
are worse than none.** Counter-evidence is encouraging: the 24 July architect **declined
two of four checkpoint questions** as not warranting Carl's attention rather than
inventing findings. Track whether that restraint holds across repeated reviews.

### File location — who holds what

| | Location | Contents |
|---|---|---|
| **Architect (VS1)** | its own filesystem + git read access | Business context, wider vision, starter-pack principles, PM-role `CLAUDE.md`, CP research outputs |
| **Builder (VS2)** | this repo | Only what is needed to build |

- **The architect reads git.** Information and context matter. **It cannot change
  anything — code is the builder's domain.** ⚠ This requires a config change: `Bash` is
  currently denied in `~/.claude-architect/settings.json`, which is what removes `git`.
  Reopening it reopens the DL-1 bypass, so the closure must be re-proven by attack (P4).
- **The architect gets its own `CLAUDE.md`**, reflecting the PM role — not this repo's
  builder-facing one.
- **Starter-pack principles carry over**, but live on VS1's filesystem so they are read
  every session. They sit in this repo **only while the builder wears the temporary
  architect hat**; the repo will eventually hold builder files alone.
- **CP-generated research and responses are stored on VS1**, deliberately keeping the
  builder repo uncluttered.

---

## 2. Design principles (derived, not invented)

| # | Principle | Source |
|---|---|---|
| P1 | **Enforcement in config, never in prose.** If an agent can choose to ignore it, it is not a control. | The Codex failure |
| P2 | **Pin *and* verify.** A pinned model silently falls back when unavailable. The pin is a request; the transcript is the proof. | DL-3 |
| P3 | **Independence comes from separate context, not from instruction.** A reviewer sharing the builder's context approves; one reasoning from files alone catches drift. | DL-2, proven 24 July |
| P4 | **Verification means attacking the boundary, not observing the happy path.** | Spike lesson |
| P5 | **Read-only costs capability.** On Windows the only real closure denies `Bash`, which costs `git`, `grep`, builds, tests. Plan the workaround, don't wish it away. | DL-1, F-1 handed back unresolved |
| P6 | **The architect reports; Carl decides; the builder implements.** No reviewer actions its own findings. | Existing protocol — survives intact |
| P7 | **Bite-sized chunks; the intent governs, the chunk executes.** | `DRAFT-working-with-carl.md` |

---

## 3. The proposed shape

**Carl** — final authority. Approves everything, and acts as conduit while the architect
seat is empty.

**Project Manager / Architect — VS Code 1.** Launched with
`CLAUDE_CONFIG_DIR=~/.claude-architect`. Brainstorms, designs, breaks work into chunks,
reviews the builder's plans. Reads git for context; **no Edit or Write**. Has its own
`CLAUDE.md` reflecting the PM role, plus business-context files on its own filesystem.
Briefs flow down to the builder; findings flow back up to Carl.

**Builder — VS Code 2.** Normal config, full tool access. Implements, tests and documents.
Writes to the repo and to `live-work/`; the architect reads that from git.

*(Diagrams deliberately avoided — box-drawing characters render as garbled text in some
readers, so the structure is written in plain prose throughout this document.)*

**This is the old topology with Codex swapped out**, now with the hierarchy Carl has
confirmed (§1a): the architect is the PM layer, not a side-car reviewer. Carl brainstorms
with the architect, the architect chunks the work and briefs the builder, the builder
implements and writes results back, the architect reads them from git. The loop Carl
already knows — one vendor instead of two.

### Why two instances rather than subagents

Subagents give **partial** independence only — a subagent's context is isolated, but its
findings return to the main session, so the builder is still biased by them (DL-2). The
entire point of the checkpoint is catching what the builder cannot see in its own work.
Two instances give complete independence: separate transcripts, file-only handoff.

Proven, not argued: the 24 July architect found a defect I had missed across two days of
self-review, flagged a governance gap I had walked past repeatedly, declined two
questions as not worth Carl's attention, and refused a role label it had not been
granted.

---

## 4. Where the SDK fits — the honest position

Carl's understanding, from an earlier session: **an SDK is about stronger enforcement
rules written in config files.** That is broadly right, and it is the correct instinct.
But the specifics matter, and this is the **single most valuable question for Claude
Project**, because nobody has checked.

### What we know

| Mechanism | Enforcement | Where it lives |
|---|---|---|
| Per-**subagent** model pin | **HARD** — harness-checked, agent cannot override | `.claude/agents/*.md` frontmatter |
| Per-subagent tool restriction | **HARD** — tool simply not provided | same frontmatter |
| Per-**instance** tool deny | **HARD** (with `Bash` denied) | `settings.json` — **already working** |
| Per-instance model | Set in `settings.json`, but a session-level default | currently `opus[1m]` |
| Hard spend limit | **DOES NOT EXIST** anywhere | — |

### The gap, stated plainly

The **strongest** model-pinning mechanism is per-*subagent*. Two plain VS Code instances
are two *sessions*, not subagents — so instance-level model control is a settings
default, weaker than subagent frontmatter.

**That is the real argument for a hybrid**, and it is Carl's instinct arriving at the
right place by a different route.

### Three candidate shapes — for Claude Project to resolve

**(A) Two instances only.** Simplest. Separation proven. Enforcement = tool denial
(hard) + settings model (softer) + post-hoc transcript audit.
*Cost:* no per-role hard model pin.

**(B) Two instances + subagent roles inside each.** Named agents in `.claude/agents/`
with hard-pinned models for defined task classes (e.g. a cheap Haiku doc-checker, a
heavy reviewer). Keeps both IDEs; adds hard pinning where it matters.
*Cost:* subagent findings return to the parent session — fine for tasks, **not** a
substitute for the architect.

**(C) Agent SDK orchestration.** ~~Programmatic roles, hard config, strongest
enforcement.~~ **RULED OUT — see the resolution block below.** The framing here was also
wrong, not just the conclusion: it treated the SDK as *strongest enforcement at an unknown
IDE cost*. In fact its orchestration primitive is the **subagent**, whose findings return
to the parent context — so it is **weaker** on independence, the property that matters
most. Not a trade-off; closer to a straight loss.

**(D) Agent teams.** A fourth shape the builder did not know existed, surfaced by CP.
**Also ruled out — see below.**

---

### ✅ ITEM 2 RESOLVED — 25 July 2026 (CP research + builder verification)

**Outcome: (B) two instances + subagent model pinning is confirmed.** Not by elimination-
as-default, but by **documented incompatibility** in the two alternatives.

**(C) Agent SDK — OUT.** CP's reasoning, which the builder accepts: *SDK orchestration
means **code** drives the agent; an interactive VS Code session means **Carl** drives it.*
Those are mutually exclusive. Orchestrating the builder forces it headless, costing the
IDE Carl works in — which the fixed shape (§1a) does not permit. CP additionally flagged
the subagent-primitive problem recorded under (C) above.

**(D) Agent teams — OUT, and this one needed checking.** Real feature: released
5 February 2026, Research Preview, works on Pro; the CLI here is **2.1.219**, well past
requirements. Teammates are genuinely full independent Claude Code sessions with their own
context windows and direct peer-to-peer messaging — materially different from subagents.
CP flagged it as a possible hybrid and called for a spike. **The official documentation
settles it without one, and against it:**

> *"Teammates start with the lead's permission settings [...] you can't set per-teammate
> modes at spawn time."* — and, under Limitations: *"Permissions set at spawn: all
> teammates start with the lead's permission mode."*

**That defeats the read-only architect outright.** The entire boundary is a *different
permission set* — `deny: [Edit, Write, NotebookEdit, Bash, mcp__codex]` via a separate
`CLAUDE_CONFIG_DIR`. An architect teammate would inherit the **builder's** permissions and
could therefore write code. Subagent definitions do honour a `tools` allowlist, but that
is tool restriction *inside* the builder's session — and **DL-1 already proved tool
restriction without `Bash` denial is cosmetic.**

Two further disqualifiers, both documented:
- **"Lead is fixed"** — the main session leads for its lifetime. The architect would be
  **subordinate to the builder**, inverting the hierarchy in §1a.
- **Split panes are unsupported in VS Code's integrated terminal and Windows Terminal** —
  so the two-VS-Code shape is not what the feature is built for.

**Keep for a different drawer:** agent teams is a strong **builder-side** tool for
parallel review. The docs' own competing-hypotheses example is explicitly designed to beat
anchoring bias, and the parallel-review pattern (security / performance / test coverage as
separate lenses) is directly useful inside a build task, with Carl's approval. **It is not
the governance layer.** Recorded so the capability is not lost along with the rejection.

**Process note worth keeping.** CP surfaced agent teams — a shape the builder did not know
existed — and corrected the builder's framing of the SDK. The builder's (B) lean survived,
but only after scrutiny it had not previously had. **First evidence that a same-vendor
reviewer does not simply agree with the builder** (bears on §1a's open question and on
DL-2's caveat about a single trial).

---

**Superseded lean, retained for the record:** *"start at (B), keep (C) open."*
**But items 1 and 2 of the research doc are unstarted — the SDK has never been
investigated — so (C) is unevaluated, not rejected.** Treating my lean as a conclusion
would be exactly the "reason instead of verify" habit the research doc warns against.

**Ask Claude Project:** what the Agent SDK actually orchestrates, whether an
SDK-orchestrated builder keeps a usable IDE, and what (B) cannot do that (C) can.

### R1 — nice to have, inside the fixed two-instance shape

**The shape is settled (see §1): architect in one instance, builder in another.** The
question is not *whether* to use two instances but *how much of R1 we can get for free*
inside them.

The old bridge gave Codex the **plan** (visible in Plan Mode) and the **chat-window
handoff files** automatically. Two instances sharing a repo give the architect what the
builder writes down. Whether that gap matters in practice is **an open question for the
discussion, not a settled deficiency** — the 24 July review caught a real defect from
files alone, so files-only is demonstrably *workable*.

**Candidate closures, cheapest first — take whichever survives the discussion:**

| Option | How it works | Honest assessment |
|---|---|---|
| **Plan-file discipline** | Builder writes every plan to `live-work/claude-plan.md` *before* executing; architect reads from disk | Closest to the old behaviour. Cheap, needs no new tech. **Weakness:** relies on the builder writing it — a prose rule, which is what P1 rejects |
| **Hook-enforced plan capture** | A `PostToolUse`/`Stop` hook writes plans and transcript extracts to `live-work/` automatically | **Satisfies P1** — the harness does it, not the agent's goodwill. Needs verification that hooks can capture plan content |
| **A new MCP bridge, Claude↔Claude** | Rebuild what Codex had, between two Claude instances | Restores R1 fully. **Unknown:** whether a Claude Code instance can expose plan state over MCP to another instance |
| **SDK orchestration (C)** | Both agents in one programmatic loop; plan is a passed object | Strongest R1 answer — the architect sees the plan by construction. Cost: the IDE question |

**One property worth preserving whatever is chosen.** The old setup was **one-way and
read-only**: Codex could *see* the plan but could not touch code and had no authority to
act on its own findings. Carl confirms this explicitly — *"Codex couldn't touch the code,
read only."* Keep that asymmetry: architect sees the builder's reasoning; the builder
does not see the architect's in-progress review; neither can action the other's work
without Carl. That is what kept the review independent while the bridge was open.

**Question 7 for Claude Project** (added): *inside the two-instance shape, what is the
cheapest mechanism — if any is worth it — that gives the architect the builder's plan and
methodology without Carl couriering it?*

---

## 5. Closing the read-only cost (P5)

The architect has no `Bash`, so it cannot run `git log`, `grep`, builds or tests. This
is not theoretical: on 24 July, finding **F-1** was handed back **unresolved** because
the architect could not run `git` to establish whether a code layer was drift or prior
committed work. The builder closed it afterwards in one command.

**Proposed rule — the builder pre-supplies evidence.** At each checkpoint the builder
writes a factual evidence file into `live-work/` *before* review:

- `git diff --stat` and the full diff of changed files
- `git log --oneline` for the range
- lint + typecheck output, verbatim
- test/build results
- screenshots for anything visual

**Load-bearing distinction:** this is **evidence, not argument.** Raw command output the
architect can read, not the builder's characterisation of it. The builder's reasoning
belongs in `claude-chat-window.md`, kept separate, so the architect can weigh the
reasoning against the raw facts rather than receiving them pre-blended.

**Known weakness, stated rather than hidden:** this makes the architect partly dependent
on the builder's honesty about what it supplies. It is a real narrowing of independence.
Mitigations: the architect reads the repo directly (it has `Read`/`Grep`/`Glob`), so any
claim about file *contents* is checkable; only *history* and *command output* need
supplying. Carl can also run a command himself when a finding turns on it.

**Alternative for Claude Project to weigh:** grant the architect `Bash` restricted to an
allowlist of read-only commands (`git log`, `git diff`, `grep`). **Caution:** DL-1 proved
that with `Bash` available the edit-tool deny is cosmetic — so this must be verified by
*attack* (P4), not assumed from config. If allowlisting cannot be proven airtight, keep
`Bash` denied and accept the evidence-file dependency.

---

## 6. Enforcement stack — what Carl owns and can verify

| Layer | Mechanism | Enforced? | How Carl verifies |
|---|---|---|---|
| Architect cannot write | `settings.json` deny incl. `Bash` | **HARD** | Attack it: attempt Write, shell redirect, `sed -i` |
| Role model pin | subagent frontmatter (shape B) | **HARD** | `message.model` in transcript JSONL |
| Pin actually ran | transcript audit | **verify-after** | grep `message.model` per turn |
| Token/cost | JSONL `usage` object | **post-hoc only** | sum per session/day; alert at threshold |
| Spend ceiling | — | **NONE — does not exist** | accept and design around |

**Two things Carl must build; nothing does them for him:**
1. A **transcript audit script** — reads session JSONL, reports models actually used and
   token totals per session/day. Closes P2's second half.
2. A **threshold alert** — the write-to-disk-then-read-back pattern already proven by
   `claude-context-status.json`.

### ✅ PROVEN 25 July 2026 — the data Codex never supplied, extracted in one command

Carl: *"Is it possible to monitor tokens? Absolutely."* Correct. Demonstrated live
against 14 real session transcripts in `~/.claude/projects/<slug>/`:

```
MODEL                 TURNS      INPUT      OUTPUT      CACHE-READ     EST $
claude-opus-4-8        2528     23,718   1,791,816     582,066,453   $389.96
claude-sonnet-5         498      3,965     286,469     112,737,669    $35.59
claude-opus-5            83        151      62,840       8,843,301     $8.86
                                                        TOTAL ESTIMATE  $434.40

2026-06-22  243 turns  $24.64      2026-07-23   58 turns  $12.29
2026-07-20  607 turns  $46.55      2026-07-24  425 turns  $75.31
2026-07-21  785 turns $132.36      2026-07-25   83 turns   $8.86
2026-07-22  915 turns $134.41
```

**These are API-rate equivalents, not Carl's bill** — the work is on a subscription.
They are exactly the *ballpark* asked for and never received.

**Three findings from Carl's own data that should shape the efficiency rules:**

1. **Output dominates cost.** 1.79M Opus output tokens ≈ $45 of the total; true input is
   trivial (23,718 tokens). **"Token efficiency" therefore means shorter responses and
   fewer turns — not shorter prompts.** Writing the rule the other way would optimise
   the wrong variable.
2. **Cache reads are 99% of input volume** (582M). Cheap at ~10% of input rate, but this
   is the conversation being re-read every turn — the mechanism by which a long session
   silently gets expensive. An argument for `/clear` discipline and tight scoping.
3. **The model mix is already sane.** 498 Sonnet turns at roughly a sixth of Opus
   per-turn cost. The instinct is operating; it just was never *measured*.

**⇒ The Codex failure was never a platform limitation.** The `usage` object was written
to disk on every turn, the whole time. The data existed; the agent simply did not supply
it. This is the strongest possible argument for **P1** — enforcement Carl owns and can
verify beats any agent's promise, because it does not require the agent's cooperation
at all.

**Status:** proven as a one-off extraction, **not yet a built tool.** Turning it into a
standing script (plus threshold alerting) remains implementation steps 7–8.

**Until the audit script exists, model pinning is half a control** — the pin is a
request and nothing checks the receipt.

---

## 7. Governance files — proposed disposition

Nothing below is actioned. This is the **plan** for after the decision.

| File | Disposition | Why |
|---|---|---|
| `ai-system/ai-roles.md` | **REWRITE** | Names ChatGPT as PM with veto power and Codex as review channel. Neither operates. Most stale file in the repo |
| `ai-system/checkpoint-review-protocol.md` | **REWRITE** routing, **KEEP** mechanics | Review *mechanics* are sound and model-agnostic; only "Technical Registration" (the `codex` MCP bridge) is dead |
| `starter-content/C2B_Codex_Startup_Context_Pack.md` | **SPLIT** | §§1–7, 12–33 are ethos/vision/preferences — **excellent, model-agnostic, keep**. §§8–11 are Codex governance — replace. Rename off "Codex" |
| `starter-content/# C2B Website Session Rules.txt` | **REPLACE** | Almost entirely Codex-specific, incl. the scripted chat-panel answer |
| `starter-content/# C2B Web Design — Wider Vision, Et.txt` | **KEEP**, one-line fix | Only line 5 mentions Codex. Otherwise clean |
| `starter-content/Briefing_Agent.md` | **KEEP** unchanged | About Claude Design. No Codex content |
| `live-work/codex-*.md` (remaining) | **ARCHIVE**, do not delete | Historical record of a real process. Move to `live-work/archive/`. Some were already removed 24 July during Codex's exit |
| `live-work/drift-sentinel.md` | **KEEP the function, reassign the owner** | Carl: it did what its name says — watched for drift and scope creep. That job did not leave with Codex. Currently Codex-owned and reading `STATUS: CONTINUE`; needs a new owner and, ideally, a **hook-driven** trigger rather than an agent remembering to check (P1) |
| `live-work/` transport | **KEEP** — now load-bearing | Was a workaround for a vendor boundary; is now the mechanism of independence (DL-2) |
| `CLAUDE.md` step 5 | **UPDATE** once routing is decided | Currently a holding position naming the gap |

**Proposed new file: `starter-content/architect-session-start.md`** — the architect
equivalent of what Carl used to paste into Codex. Points at the ethos documents, states
the role boundary, lists what to read in order, and forbids implementation. Written to be
model-agnostic so the next pivot costs a line, not a rewrite.

**Deliberately NOT deleting anything yet.** Under P4 and Carl's no-retroactive-rewriting
discipline, a superseded record is evidence; a deleted one is a gap.

---

## 8. What I am least sure about

Recorded because hiding uncertainty starves the judgement (`DRAFT-working-with-carl.md`).

1. **Whether (B) is enough, or whether (C) is genuinely needed.** I lean (B). But I have
   never used the Agent SDK and items 1–2 are unstarted. **This is a guess in the
   ballpark, openly flagged as a guess.**
2. **Whether the evidence-file pattern preserves enough independence.** It reintroduces a
   builder dependency into a boundary designed to remove one.
3. **Whether one good architect review generalises.** One run, one well-documented file
   set. Independence is shown *achievable*, not guaranteed.
4. **Whether I should be designing this at all.** I am the builder proposing the system
   that reviews me. That is a structural conflict of interest, and it is exactly why this
   goes to Claude Project before implementation rather than after.

---

## 8a. Carl's own open questions — 25 July 2026

Raised by Carl, recorded as **questions for the discussion, not answered here.** The
builder's notes are context for the conversation, not conclusions.

### Q-A · Should both instances see GitHub?

**Carl: "Yes."** Taken as decided.

*Builder note:* the architect already reads the repo from disk via `Read`/`Grep`/`Glob`.
Worth clarifying in discussion whether "see GitHub" means (i) the local working tree
(already true), (ii) remote branches/PR state, or (iii) the read-only GitHub connector
that Claude Project itself uses. (ii) is the one currently blocked — it needs `git`, which
is denied with `Bash`. Directly related to §5.

### Q-B · Is a Drift Sentinel still needed?

**Carl: "I don't know — it's an AI from the same vendor, same coding conventions."**
Genuinely open.

*Builder note, both directions:*
- **Argument it is less needed:** the Sentinel guarded against a *cross-vendor* mismatch —
  divergent conventions, a reviewer reasoning from different priors. Two Claude instances
  share conventions and training, so that specific failure largely disappears.
- **Argument it is still needed:** the Sentinel's stated job was **drift and scope creep**,
  which are not vendor artefacts — they are what happens when a build runs long. The
  24 July architect review found real drift *from a same-vendor builder*. Shared
  conventions reduce *misunderstanding*, not *creep*.
- **Possible middle:** keep the function, drop the ceremony. A `STATUS: STOP/CONTINUE`
  file that a human or hook sets, rather than an agent-maintained protocol. Cheaper and
  harder to leave stale — the current file sat at `STOP` while work was submitted for
  review, which is exactly the failure mode of governance-by-prose.

### Q-C · The read-only boundary

**Carl: "Codex couldn't touch the code, read only."** Confirms the boundary to preserve.

*Builder note:* already proven achievable and already built — `~/.claude-architect/`
with `deny: [Edit, Write, NotebookEdit, Bash, mcp__codex]`, attacked and held on
24 July. The open cost is §5: no `Bash` means no `git`/`grep`/builds. `mcp__codex` can
come out of that deny list once the app is gone (~14 August).

---

## 9. Questions for Claude Project

1. **Can the Agent SDK orchestrate a VS Code builder instance, or does the builder go
   headless?** Highest-value unknown. Decides (B) vs (C).
2. **Is there per-*session* hard model enforcement**, or is subagent frontmatter genuinely
   the only hard pin?
3. **Can `Bash` be allowlisted to read-only commands safely** — and can that be *attacked*
   to prove it? Would restore `git`/`grep` to the architect and close §5's weakness.
4. **Does `availableModels` apply outside managed/enterprise settings?** Carried from DL-3.
5. **Is the evidence-file pattern the right closure for the no-`Bash` cost, or is there a
   cleaner one?**
6. **Does anything here contradict the ethos** in the starter pack or the working-with-Carl
   portrait?

---

## 10. If approved — implementation order

Bite-sized, in dependency order. Each is a stopping point.

1. Rewrite `ai-roles.md` — authority structure, model-agnostic
2. Rewrite `checkpoint-review-protocol.md` routing; keep mechanics
3. Write `architect-session-start.md`
4. Split the startup pack; excise Codex from session rules; one-line fix to Wider Vision
5. Archive `live-work/codex-*.md` to `live-work/archive/`
6. Stand up enforcement config (shape decided in discussion)
7. **Build the transcript audit script** — until this exists, pinning is half a control
8. Build threshold alerting on the JSONL `usage` object
9. Update `CLAUDE.md` step 5 with the decided routing
10. **Attack the finished boundary** (P4) and record the result

**Steps 1–5 are documentation. Steps 6–8 are the actual enforcement, and they are where
the Codex failure gets fixed.** Do not stop after 5 and call it done.
