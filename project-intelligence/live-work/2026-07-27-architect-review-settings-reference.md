# Architect review — `architect-settings.reference.json.md`, plus Builder self-noted errors

**27 July 2026. Findings only. Nothing here is decided, and nothing has been acted on.**

Two records of the same day's work, from the two seats. Saved so neither is lost to a
closed terminal — which would be a poor end for a review about auditability.

**Provenance.** This review was commissioned as a **test of the copy-paste route** from the
Architect's terminal to the Builder's, on a subject that would produce roughly chunk-prompt
length. The test passed — ~100 lines, structure intact, no truncation. The findings are a
by-product, and they are real.

---

## Part 1 — The Architect's findings

Reviewing `project-intelligence/ai-system/architect-settings.reference.json.md`, committed
that morning at `f08a17d`. Reproduced in substance; the Architect's own wording is
preserved where it carries the argument.

### What it verified as sound

- Live file matches the reference exactly — all six deny entries, all four other keys.
- `.credentials.json` does exist, so the reason for not versioning the whole folder is real.
- Every cross-reference resolves and says what the file claims — `architect-role.md` §1/§2,
  `live-work-protocol.md` §5a, `ai-roles.md`, D-036, DL-1, DL-7. The ~14 August Codex date
  is sourced twice.
- The `Bash` rationale is exactly DL-1, including the accepted cost and both mitigations.
- The `mcp__ide` section is "the best part of the file."

**"The reasoning is sound. The findings below are about what it doesn't cover."**

### F-1 · The deny list is an enumeration, and the file's own lesson argues against that

Lesson 1 says close boundaries by rule, not by circumstance. The list then closes two
**named** MCP servers; anything arriving later is allowed by default — the precise shape of
the `mcp__ide` problem, not a fix for it.

Two things make it concrete:

- `.claude-architect/plugins/marketplaces/claude-plugins-official/` is **already cloned into
  the Architect's own config directory**, carrying `serena`, `playwright`, `github`,
  `firebase` and others, each with its own `.mcp.json`. None enabled today; one
  `/plugin install` away.
- **The evidence cited for `mcp__ide` is weaker than the file states.** It rests on
  `mcpServers` being `{}` — true — but the Architect's session surfaces
  `mcp__claude_ai_Google_Drive__*` tools that did **not** arrive through `mcpServers`. They
  come from an account-level connector. So `mcpServers: {}` does not mean "no MCP tools
  reach this session," and the file treats it as if it does.

Whether the harness accepts a wildcard deny (`mcp__*`) is stated as an **open question**,
not a recommendation, because the Architect could not verify it.

*Builder verification: the marketplace clone is confirmed present. F-1 is factually correct.*

### F-2 · Delegation isn't addressed, and it's the same failure class as `Bash`

The list denies tools that write directly. It says nothing about tools that **cause a write
somewhere else**. The Architect can see `Agent` in its active surface, plus `TaskCreate`,
`CronCreate`, `RemoteTrigger`, `EnterWorktree`, `SendMessage` available on demand.

- **Subagents.** The `claude` and `general-purpose` types are listed with `Tools: *`. Whether
  a subagent's calls inherit the parent's deny list **is the entire question**. If not,
  `Bash` is denied to the Architect and available to something it can spawn in one call —
  cosmetic in exactly the way DL-1 described.
- **Remote and scheduled agents.** `CronCreate` and `RemoteTrigger` run in a different
  environment with its own settings. A local deny list plausibly never reaches them.

DL-2 rules subagents out as a substitute for the review *role*, on independence grounds.
**Nothing says the Architect must not spawn one, and nothing in the harness stops it.**

**This is the one that could make the whole boundary cosmetic.** It cannot be closed by
reading — only by attempting a write.

### F-3 · "The entire security boundary" is not accurate

`launch-architect.cmd` does `cd /d` into the repo, so the Architect **also loads the repo's
`.claude/settings.json`**, which registers a `PreToolUse` hook executing `node`. Hooks run
as configured; they are **not** gated by the permissions deny list.

Inert today — the matcher is `Edit|Write|NotebookEdit`, which the Architect never calls. But
that is circumstantial protection again, and the matcher is one edit from `Read|Grep|Glob`.

> **The read-only seat's execution surface is partly controlled by the file the Builder
> writes — the seat it exists to police.**

Stated as a question to close, not a proven hole: the Architect could not confirm how Claude
Code gates hook changes, and *"I believe" is not verification.*

*Builder verification: the hook config is confirmed exactly as described. F-3 is factually
correct.*

### F-4 · The model pin is recorded as state, when this project already learned it is a request

`"model": "opus[1m]"` sits in the JSON block unannotated. **DL-6 records `opus[1m]`
requested and `claude-opus-4-8` actually running for 35 turns** — caught in the Architect's
own transcript. P2: *"the pin is a request; the transcript is the proof."* DL-3: there is no
hard-fail mode.

*"So the file presents a request as an intended state, in the one project that has already
been bitten by that distinction."*

Live datapoint: that session reported `claude-opus-5[1m]`, so the pin resolved correctly.
One observation, not a guarantee.

Smaller, related: `workflow-redesign-research.md:769` carries an open question — *"Is
`opus[1m]` right for the architect?"* — which the reference file quietly closes by recording
the value as intended.

### F-5 · The four non-deny keys have no rationale, and one of them is a control

The table explains the six denials and nothing else. A reader cannot tell whether editing
`model` or `effortLevel` is a governance change or a preference. Given the research treats
model choice as an enforcement lever, `model` **is** a governance change, and
`effortLevel: high` arguably is too, since it bears on review quality. Extend the table or
mark the four explicitly as operational-not-boundary. **The silence is the defect, not the
choice.**

### F-6 · "A malformed settings file may fail open" — ✅ TESTED AND CLOSED 27 July 2026

**Result: it fails closed by default, but fails open on one keypress.** The seat detects the
malformed JSON and halts with a `Settings Error`, offering *"Continue without these
settings"* — and *"files with errors are skipped entirely, not just the invalid settings"*, so
that one choice discards the whole boundary. The original claim was half right; the half that
was wrong is the more useful half. **Full record, method, and the two design defects caught in
the test itself:** `ai-system/architect-settings.reference.json.md`, "F-6, tested".

*Original finding preserved below.*



Step 2 of the change procedure rests on it; it justifies the entire backup convention. P-A:
a documented control is an intention until its execution is inspected. The chunk-scope guard
*was* found to fail open on a malformed scope file — but **an analogy is not evidence**.
Cheap to close: corrupt a copy, launch, attempt a Write.

### F-7 · The procedure exempts the riskiest edit from verification

Step 5 says re-attack *"any relaxation."* But a **tightening** edit can also break the file —
malformed JSON, which per F-6 may fail open — and every change needs a restart. So the edit
that looks safe is the one edit the procedure says not to re-test. **Make it: re-attack after
every change.**

### F-8 · Nothing says when the comparison happens

*"Drift is detected by comparison, not by alarm"* is honest, but no trigger is named — so the
answer is "whenever Carl thinks to ask," which is exactly how a reconciliation date goes
stale unnoticed. Attach it to something that already happens.

*The Architect's own note on its limits: "if the live file were ever edited to remove `Read`,
I would not be in a position to report anything."*

---

## Obligations the file creates on the Architect that it does not state

Asked for specifically, and the part the Architect most wanted on record.

**1. An implicit duty to self-check, with no trigger and no threshold.** The file says the
copy exists so the boundary is "readable by the Architect itself" — a *capability* statement
that will be read as a *duty* the first time a drift is missed. Either make it a rule, or
state plainly that triggering the comparison is Carl's. **The ambiguity is the problem.**

**2. It makes the Architect a reviewer of its own boundary, which Lesson 2 says it is not
qualified to be.** The guardrail it proposed:

> **What I can do is compare two files and report a difference. What I cannot do is conclude
> that the boundary holds.**

Confirming the deny list is intact is not confirming it is *sufficient*. F-1 and F-2 are
precisely the kind of thing that reads as intact and is not.

*Builder note: this is a clarification rather than a contradiction, and the guardrail above
is the right resolution. It belongs in the file.*

**3. No obligation to declare what it could not test — the strongest finding here.** F-2 can
only be closed by attempting a write, which is the thing the Architect is structurally
forbidden to do. **The most serious item in the review is one it can raise and cannot
resolve** — the same shape as F-1 on 24 July, handed back unresolved.

The `!` route does not close it: `!` runs a command in Carl's shell, not a subagent inside
the Architect's session.

> **There is currently no named route for "the Architect found a gap that only an attack can
> close."** The file's entire posture — verified by attack, not by reading — assumes attacks
> are available to whoever finds the gap. For the Architect they are not.

**4. Unstated obligation on the Builder.** Step 4 — *"update this reference file"* — is the
one step the Architect cannot perform. The procedure reads as though one person does all
five: 1–3 are Carl's, 4 is the Builder's, 5 is either. **Put an owner on each step, or the
reconciliation date will drift for the ordinary reason that nobody's name is on it.**

---

## The Architect's recommended sequencing

> F-2 first — the only one that could make the whole boundary cosmetic, and it needs Carl to
> run or authorise the test. Then F-1 and F-3, the same categorical-vs-circumstantial
> argument the file already makes and wins. F-4 through F-8 are corrections to the document
> rather than to the boundary, and can travel together in one edit.

---

## Part 2 — Builder self-noted errors, same day

Recorded because a system whose participants are stateless can only accumulate improvement
in its files. **A logged mistake does not make the next Builder better in the way it would a
person — it makes the next Builder informed.** That is a different mechanism, and it is the
reason writing it down is not optional housekeeping.

Two of these three were caught by the Architect, not by the Builder. That is the read-only
seat doing exactly what it exists for.

### E-1 · An incomplete search reported as a complete finding

Grepped `project-intelligence/` for `brand-assets`, found one file, and told Carl it was the
only reference. **There were two** — and the missed one was the more important, holding the
salvage record that changed the recommendation. A backgrounded command caught it; the
Builder did not.

**Lesson: a confident summary drawn from one narrow search is a guess wearing a suit.** State
the search's scope alongside its result, or run a second one with a different shape.

### E-2 · An unverified claim written into a governance file

Wrote *"a malformed settings file may fail open"* into the reference document without testing
it. Caught as **F-6**. It is load-bearing: the entire backup convention rests on it.

**Lesson: P-A applies to authoring, not only to reviewing controls.** A claim written into
`project-intelligence/` becomes something others rely on. If it has not been tested, the file
must say so.

### E-3 · Recorded a request as a state, with the counter-example already in the repo

Put `"model": "opus[1m]"` in the reference with no annotation. Caught as **F-4**. DL-6 —
in this repository — records that exact pin running as `claude-opus-4-8` for 35 turns.

**Lesson: the repo held the counter-example and it was not applied.** Reading the relevant
files is not the same as checking the current claim against them.

### E-4 · Summarised my own prose when the source was still in context

**Added later the same day**, after the next session audited the handoff this one wrote.

`session-handoff.md` stated **"8 hook registrations"** and described the injection scanner and
context monitor as `PreToolUse`. Measured against the backup: **9 registrations**, and both of
those hooks are **`PostToolUse`**. The file counts in the same paragraph — 246, 12, 6, 267 —
were all correct.

**The diagnosis is not "memory decay," and the distinction matters.** The `Read` output of
`~/.claude/settings.json` was still in this session's context when the handoff was written. I
did not count the registrations from it. I had described them in prose hours earlier, and when
writing the handoff I summarised **my own prose** rather than the source that was still
available. The original sentence ran *"three PreToolUse guards on every Write/Edit, an
injection scanner on every Read, a context monitor"* — fluent phrasing that carried the wrong
attribute across a clause boundary and read as accurate.

**Lesson: a summary of a summary is not evidence, even when it is yours.** If the source is
reachable, re-read it. The tell is prose that flows well across items that were never
verified as belonging to the same category.

**The structural lesson, which is larger than the error.** The write-ups for the GSD removal
and `disableAllHooks` were deferred to the *next* session via the handoff. Those counts were
correct when the work was done; the deferral is what introduced the error, because the record
then had to be reconstructed by a session working from a summary. **The handoff is a pointer
to where the record lives, not the record itself.**

This also inverts what `handoff-protocol.md` §2 observes about the five-hop chain: there,
technical detail survives translation and the *why* degrades first. A handoff does the
opposite — the **why survives**, because it was argued aloud and can be repeated; the
**measured detail degrades**, because nothing forces a re-read of the disk before summarising
it. Worth knowing, because it tells a reader which half of a handoff to spot-check.

**Caught by:** the next Builder session, which measured the backup instead of transcribing the
handoff. It initially framed this as a finding about a different agent, then withdrew that
framing unprompted — same seat, same rules, an error it was equally capable of making. Correct
call, and worth recording alongside the error itself.

### Not logged

The `git commit` here-string failure was a tool quirk, diagnosed and worked around in one
turn. **Logging it would dilute the log** — a lessons record that includes everything is read
as carefully as a terms-of-service page.

---

## Status

**Nothing decided. Nothing acted on.** Building remains paused; this is not a chunk.

The one item worth raising ahead of the rest is **F-2**, not because it is likely broken but
because if it is, everything else in the deny list is decoration. It needs Carl's
authorisation, since the only way to test it is to attempt a write.

The lessons in Part 2 are deliberately **not** routed into `decisions.md` or the protocol
files yet: a lesson drawn from a finding Carl later rejects is a lesson that should not have
been written. One standing rule was extracted to `CLAUDE.md` — verify before asserting in a
governance file — because it is the root of E-2 and E-3 and applies regardless of how the
findings are routed.
