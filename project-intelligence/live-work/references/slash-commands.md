# Slash commands — captured 27 July 2026

**Source: the Architect seat's own completion menu**, listed by the Architect and pasted
across by Carl. Not from documentation — the interactive command registry is not exposed to
the CLI's `--help`, and a web search for `/focus` found nothing while the completion menu had
it immediately.

**The terminal UI is the authoritative source. This file is a snapshot.**

## Two caveats that matter

**1. This is the Architect's list, not a universal one.** The seats have separate
`CLAUDE_CONFIG_DIR` values, so skills, plugins and project commands can differ between them.
A command here is not guaranteed present in the Builder seat, or vice versa.

**Known gaps in this capture — four commands confirmed to exist and absent from the list
below:**

| Command | What it is | How it was confirmed |
|---|---|---|
| `/focus` | *toggle focus view: just your prompt, summary, and response* | Builder seat completion menu, screenshot, same day |
| `/goal` | *set a goal Claude checks before stopping* | Builder seat completion menu, screenshot, same day |
| `/btw` | *ask a quick side question without adding to the conversation* | Official docs |
| `/branch`, `/fork`, `/subtask`, `/insights` | conversation branching, background copy, subagent hand-off, session analysis | Official docs |

**Four separate gaps found within hours of capturing this file.** Whether they are missing
because the Architect seat lacks them or because the listing was condensed is **not
established** — but the pattern is now clear enough to state as a rule:

> **This file is a useful record of decisions about commands. It is not a reliable inventory
> of which commands exist.** Type `/` in the seat you are actually using, or check the
> documentation. Never read an absence here as proof a command does not exist.

The **decisions** recorded below — what is billed, what is destructive, what is deliberately
unused — remain the value of this file, and those do not go stale the way a listing does.

**2. It goes stale.** Commands arrive and change with Claude Code versions. Re-capture rather
than trust this file if something matters. `/help` lists what is actually in your build.

---

## Session & context

| Command | Description |
|---|---|
| `/clear` | Wipe conversation history and start fresh |
| `/compact` | Summarise the conversation to free context |
| `/context` | Show what's consuming the context window |
| `/resume` | Reopen a previous conversation |
| `/rewind` | Roll back conversation and/or code to a checkpoint |
| `/export` | Export the conversation to a file or clipboard |
| `/todos` | List the session's todo items |
| `/usage` | Show plan limits and current consumption |
| `/cost` | Token cost and duration for the session |

### Added from the documentation, 27 July 2026 — absent from the captured menu

| Command | Description | Note for this project |
|---|---|---|
| `/btw <question>` | Ask a quick side question **without adding to the conversation**. Answer appears in an overlay; usable while a session is mid-task. `/btw` with no argument (v2.1.212+) reopens the last one. | **Genuinely useful here.** The Architect holds one long design conversation across a whole page (§7a) — a side question would otherwise sit in that context permanently. ⚠ **Nothing said in a `/btw` is remembered.** If it produces something load-bearing, say it in the main conversation or write it to a file. Use it for *"what does this do"*, never for *"change the approach"*. |
| `/branch [name]` | Branch the conversation here and **switch into the branch**. Original preserved, reachable via `/resume`. | **Thinking, not execution.** See below. |
| `/fork [prompt]` | Copy the conversation into a separate **background** session and stay where you are. | **Thinking, not execution.** See below. |
| `/subtask` | Hand a side task to a subagent that reports back into this conversation. | DL-2 independence objection applies — not a review substitute. |
| `/insights` | Analyse sessions for project areas, interaction patterns and friction points. | ⏸ **PARKED** — see the section at the foot of this file. |

**On `/branch` and `/fork` — the limit that matters.** Both fork the **conversation**. Neither
forks the **filesystem**. Three branches exploring three approaches are three conversations
editing **one working tree**, and whichever writes last wins silently — the collision two
Builder sessions hit on 27 July. Good for planning, investigation and comparing options with
no code written; **not for building three approaches.**

**And they do not give you a second opinion.** A branch duplicates the current context,
including its blind spots — three branches from one point are the same assumptions explored
three ways, not three independent views. Independence comes from the **Architect seat**, which
reasons from files without having built the thing. That distinction is why the 24 July defect
was caught by a fresh reviewer and not by two days of Builder self-review. **Do not mistake
branching for review.**

## Configuration

| Command | Description |
|---|---|
| `/config` | Settings panel (theme, model, notifications) |
| `/model` | Choose the model for this session |
| `/fast` | Toggle fast mode (Opus, faster output) |
| `/output-style` | Switch or create an output style |
| `/permissions` | View and edit tool permission rules |
| `/hooks` | Configure hooks that fire on tool events |
| `/agents` | Create and manage custom subagents |
| `/mcp` | Manage MCP server connections and auth |
| `/memory` | Edit CLAUDE.md memory files |
| `/statusline` | Set up a custom status line |
| `/terminal-setup` | Install Shift+Enter for newlines |
| `/vim` | Toggle vim editing mode |
| `/add-dir` | Add another working directory |

## Code & repo

| Command | Description |
|---|---|
| `/init` | Generate a CLAUDE.md documenting the codebase |
| `/code-review` | Review your current working diff |
| `/code-review ultra` | Multi-agent cloud review of the branch, or `<PR#>` |
| `/review` | Review a GitHub pull request |
| `/security-review` | Security review of pending branch changes |
| `/simplify` | Simplify and tidy changed code, then apply fixes |
| `/pr-comments` | Fetch and show comments on a pull request |
| `/run` | Launch the app to confirm a change works |
| `/install-github-app` | Set up the Claude GitHub app for PR reviews |

## Automation

| Command | Description |
|---|---|
| `/loop` | Run a prompt or command on a repeat, e.g. `/loop 5m /foo` |
| `/schedule` | Create and manage scheduled cloud agents (cron) |

## GSD toolkit — REMOVED 27 July 2026

**The six `/gsd-*` commands no longer exist.** The third-party GSD toolkit was removed from
the system in full on 27 July 2026 — 246 files, 12 hook scripts, 6 skills and 9 hook
registrations. See **D-037** for the removal record and the reasoning.

This section is kept rather than deleted for two reasons: an earlier version of this file
listed the commands as available, and **the removal is the more useful thing to know than the
listing ever was.** GSD's hooks were firing in the Builder seat months after Carl stopped
using it, including a self-updater that ran during the session that found it. Hooks execute
outside the permissions system, so nothing in the deny list governed them.

**If a `/gsd-*` command ever appears in the menu again, that is a finding, not a convenience** —
it means the toolkit has been reinstalled, and with it a competing governance model whose
phase/plan/execute cycle bypasses the chunk → plan-review gate → checkpoint chain in
`handoff-protocol.md`.

## Skills loaded this session

| Command | Description |
|---|---|
| `/dataviz` | Design guidance for charts, plots, dashboards |
| `/artifact-design` | Design fundamentals for published Artifacts |
| `/artifact-capabilities` | Runtime capabilities for Artifact pages |
| `/claude-api` | Claude API reference: models, pricing, tool use |
| `/update-config` | Configure settings.json: hooks, permissions, env |
| `/keybindings-help` | Customise keyboard shortcuts |
| `/fewer-permission-prompts` | Build an allowlist to cut permission prompts |

## Account & support

| Command | Description |
|---|---|
| `/login` · `/logout` | Switch or sign out of your Anthropic account |
| `/status` | Version, account, model, connectivity |
| `/doctor` | Diagnose installation health |
| `/bug` | Report a bug to Anthropic |
| `/privacy-settings` | View and update privacy settings |
| `/release-notes` | What changed in recent versions |
| `/help` | **List all commands in your build** — the authoritative check |
| `/exit` | End the session |

---

## The ones that matter for this project

**Used routinely:**

- `/clear` — between chunks in the Builder seat, per `live-work-protocol.md` §7a. Accepts a
  descriptive name: `/clear contact-prewarm-hardening`.
- `/compact` — only when forced mid-chunk. Lossy. §7 makes `/clear` the default at a clean
  milestone.

**Worth knowing:**

- `/context` — shows what is consuming the window. Useful before deciding compact vs clear.
- `/permissions` — reads and edits the live permission rules. **In the Architect seat, treat
  as read-only**: its deny list is a governance boundary, and changes go through the
  procedure in `ai-system/architect-settings.reference.json.md`, not through a UI panel.
- `/rewind` — rolls back conversation *and/or code* to a checkpoint. Powerful and
  destructive. Nothing in this project's governance covers it; it would undo committed
  reasoning as easily as a bad edit. **Ask Carl before using it.**
- `/goal` — *(Builder seat; absent from the capture above)* sets a goal checked before
  stopping. Maps onto the chunk's definition-of-done field. Worth evaluating when chunk
  mechanics are settled.
- `/focus` — *(Builder seat; absent above)* hides intermediate steps, showing prompt,
  summary and response only. **Suits the Architect seat**, where the findings are the
  product. **Not recommended during Builder chunk execution** — the intermediate steps are
  where scope drift is visible, and hiding them removes a control without reducing what runs.

**⚠ Billed or destructive — do not run to see what they do:**

Carl's rule, 27 July 2026, after `/code-review ultra` was triggered during exploration and
the terminal was closed to stop it: *"I don't want to be billed for a mistake I made, even on
exploration."*

**Exploring a menu is not the same as exploring a command.** Reading an entry costs nothing;
invoking it can cost money or lose work. Anything in this group is **ask Carl first**, every
time, including when the aim is only to find out what it does.

| Command | Why |
|---|---|
| `/code-review ultra` | **Billed.** Bundles the branch and sends it to a multi-agent *cloud* review. User-triggered only — the Builder cannot launch it and must not try. Its plain sibling `/code-review` reviews the working diff locally and is the one that fits this workflow. Note also that this project already has a review layer: the Architect at the plan-review gate and at checkpoint. A third reviewer invites the repeated-non-issue problem recorded in `current-status.md`. |
| `/rewind` | **Destructive.** Rolls back conversation *and/or code* to a checkpoint. Would undo committed reasoning as readily as a bad edit. No governance covers it. |
| `/schedule`, `/loop` | Create recurring or scheduled runs that consume budget **after** the session ends, when nobody is watching. |
| `/agents` | See below — subagents are separately ruled out. |

**What the incident showed.** The animated multi-coloured styling reads as a flourish; it is
in fact the interface signalling a heavyweight operation. The deprecated alias
`/ultrareview` is the only entry in the menu rendered as animated rainbow text, and is last
alphabetically — which is what drew the eye to it.

**Typing or reading a command name is inert.** A slash command fires only when it is the
first thing in the input box and Enter is pressed. Discussing one by name, in either seat,
costs nothing.

### Two things learned that were not obvious

**1. Closing the terminal does not cancel a cloud review — it runs server-side.**

Found by the Architect, and it corrects the Builder's initial reading. Killing the window
stops you *watching* the run; it does not stop the run. **`Esc` is the abort.** It interrupts
immediately and is both faster and cleaner than closing the terminal.

**2. The two seats have unequal forensics, and the read-only seat has the better ones.**

| Install | Typed-input log | Consequence |
|---|---|---|
| `~/.claude-architect` (Architect) | **`history.jsonl` present** — every prompt, every session | Anything typed is recoverable, including from an aborted session |
| `~/.claude` (Builder) | **absent** — verified 27 July 2026 | Something typed and aborted before the first transcript write leaves **no trace** |

So the seat that can change the repository is the seat with the weaker audit trail. Worth
knowing before relying on "we can check the logs afterwards" — in the Builder seat, sometimes
you cannot.

**Neither install records billing.** That is account-side only:
`claude.ai/code` lists cloud sessions; `claude.ai/settings/usage` is the authoritative
record. `/usage` in-session reports a weekly aggregate, which is too coarse to confirm or
rule out a single run.

### What the 27 July check actually found

Both seats searched — the Architect's complete `history.jsonl` (16 entries) and every Builder
transcript for actual slash-command invocations. **No review command in either.** The only
invocations present in the Builder install are `/clear`, `/model` and `/compact`. No
cloud-bundle record anywhere.

One near-miss worth recording as method: a Builder transcript with a **modification time**
matching the incident minute looked incriminating until opened — it was a `/clear` from
22 July on a different branch. *A file's mtime is not its creation time, and matching a
timestamp is not evidence until the contents are read.*

**Conclusion: strong evidence it did not run; not proof.** The two gaps above are why. The
absence of a post-hoc audit trail in the Builder seat is the actual argument for asking
first rather than checking after.

**Deliberately not used:**

- `/agents` — subagents are ruled out as a review substitute by DL-2 on independence grounds.
  **F-2 is now closed:** measured on 27 July, a subagent spawned in the Architect seat
  inherits that seat's deny list — `Write`, `Edit`, `Bash` and `NotebookEdit` were absent from
  its context and the test file was never created. So the earlier caution about spawning one
  no longer applies on *capability* grounds; the DL-2 independence objection stands unchanged
  and is the reason this stays on the do-not-use list. See
  `ai-system/architect-settings.reference.json.md`.
- The `/gsd-*` family — **removed from the system 27 July 2026 (D-037).** These commands no
  longer exist; see the section above.

---

## ⏸ PARKED for a decision — `/insights`

**Carl, 27 July 2026:** *"I will do more research before we build. We will revisit it and
discuss and decide whether it can be useful to us."*

**Documented description**, quoted exactly rather than paraphrased:

> *"Generate a report analyzing your Claude Code sessions, including project areas,
> interaction patterns, and friction points"*

**It is about how you work, not what you spent.** `/usage` and `/cost` are the money commands;
this analyses session behaviour. **"Friction points"** is the phrase worth weighing — where
sessions stall, repeat themselves, or backtrack.

**Why it might earn a place here.** The two seats have unequal forensics: the Architect keeps a
complete `history.jsonl`, **the Builder keeps none**. An insights report is one of the few
things that could show where the Builder seat wastes effort — friction that would otherwise
only be noticed by feel. The 27 July session alone would have supplied plenty: three failed
launcher attempts, two paste failures, a here-string that broke twice.

**Three things the documentation does not state**, and this is why it is parked rather than
adopted:

1. **What period it covers.**
2. **Whether analysis runs locally or server-side.** It reads session history — which here
   contains governance reasoning, business context and every prompt typed.
3. **Whether it is billed.** Absence of a cost note is not a statement that it is free, and
   the standing rule in this file is never to invoke a command to find out what it does.

**Do not run it to answer those questions.** Research first — documentation, or a `/btw` in a
session whose context does not matter.

**When to revisit.** After a few chunks have run, when there is real building history to
analyse and the friction is about the work rather than about learning the tool. Optimising a
workflow that has barely started measures the learning curve, not the workflow.
