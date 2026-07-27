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

**Known gaps in this capture — both verified present in the Builder seat by screenshot the
same day, and both absent below:**

- `/focus` — *toggle focus view: just your prompt, summary, and response*
- `/goal` — *set a goal Claude checks before stopping*

Whether they are missing because the Architect seat lacks them or because the listing was
condensed is **not established**. Do not read an absence here as proof a command does not
exist.

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

## GSD toolkit — installed at user level

| Command | Description |
|---|---|
| `/gsd-new-project` | Initialise a project with deep context gathering |
| `/gsd-discuss-phase` | Gather phase context through adaptive questioning |
| `/gsd-plan-phase` | Create a detailed phase plan with verification loop |
| `/gsd-execute-phase` | Execute all plans in a phase, wave-parallelised |
| `/gsd-help` | Show GSD commands and usage guide |
| `/gsd-update` | Update GSD to the latest version |

⚠ **Not part of this project's governance.** GSD is a third-party toolkit installed at user
level, with its own planning and execution model. Its phase/plan/execute cycle is a
**parallel workflow** to the chunk → plan-review gate → checkpoint chain in
`handoff-protocol.md`. Using it would bypass that chain. Noted here because it appears in the
menu and could be invoked by mistake.

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

**What the incident showed.** The animated multi-coloured styling on `ultra` reads as a
flourish; it is in fact the interface signalling a heavyweight operation. Usage after the
event showed no sharp jump, so the run probably did not complete — but *probably* is the
strongest available statement, because closing a terminal leaves nothing the Builder can
inspect afterwards. **There is no post-hoc audit trail for an aborted command.** That is the
reason for asking first rather than checking after.

To halt a command already running: **`Esc`** interrupts immediately. Faster and cleaner than
closing the terminal.

**Deliberately not used:**

- `/agents` — subagents are ruled out as a review substitute by DL-2 on independence grounds,
  and F-2 (27 July) leaves it unresolved whether a subagent inherits the parent's deny list.
  Until that is tested, do not spawn one in the Architect seat.
- The `/gsd-*` family — see the warning above.
