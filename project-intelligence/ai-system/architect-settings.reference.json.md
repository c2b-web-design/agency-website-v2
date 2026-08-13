# Architect settings — reference copy

**This is a REFERENCE, not the live file.** Editing this changes nothing.

The live file is `C:\Users\Carl Buckley\.claude-architect\settings.json`, outside this
repository and therefore outside git. This copy exists so the *intended* state of the
Architect's security boundary is versioned, auditable and readable by the Architect itself.

**Last reconciled with the live file: 12 August 2026** — `Bash` and four execution-class tools
removed from `deny`, an `allow` list added, **on Carl's explicit and repeated instruction**. He
has authority over this file and does not need the Builder's agreement; this entry records what
changed and what it costs, not an objection.

⚠⚠ **THE BOUNDARY HAS MOVED AND THIS FILE'S OWN ARGUMENT SAYS WHAT THAT MEANS.** The 24 July
attack finding stands unaltered: **with `Bash` available, denying `Edit`/`Write`/`NotebookEdit`
is cosmetic** — shell redirect, `sed -i` and `rm` all still write. And the 27 July finding stands
too: **`permissions.allow` pre-approves, it does not restrict.** The `allow` list below removes
prompts for the named measurement commands; **it does not confine the seat to them.**

**So state the seat's actual capability plainly: the Architect can now write to the repository.**
Not by `Write`, which is still denied, but through the shell. The reason to record it in these
terms is that a future reader will otherwise read the deny list, see `Write` on it, and conclude
something that is not true.

**What Carl gets in exchange, which is what he asked for four times:** the Architect can run
builds, `npx tsc --noEmit`, `npm run lint` and the `verify/` harnesses itself, instead of quoting
the Builder's numbers or waiting on a `!` command. During the 11–12 August corridor work it had
to do exactly that, and its two most useful analyses were built on measurements it could not take.

⚠ **THE `!` ROUTE AND `checkpoint-review-protocol.md` §3a ARE NOT SUPERSEDED.** The serialisation
rule in particular still binds: **only one seat measures at a time, after implementation stops.**
Two seats building at once produce numbers neither can trust.

⚠ **WHAT REMAINS DENIED, AND WHY EACH SURVIVED:** `Edit`, `Write`, `NotebookEdit` — the direct
write tools, kept so the *default* posture is still read-only even though the shell bypasses them.
`mcp__codex`, `mcp__ide`, `DesignSync` — outward/cloud write surfaces, unrelated to measurement.
`CronCreate`, `EnterWorktree`, `RemoteTrigger`, `ScheduleWakeup`, `TaskCreate` — deferred
execution and budget-consuming work after the session ends, which measurement does not need.
`Monitor`, `TaskOutput`, `TaskStop` were **removed** from deny: they are how a long-running build
or harness is watched and stopped, and with `Bash` present denying them closed a name, not a
capability.

**Previously reconciled 27 July 2026** — re-verified key by key against the live file after the
`DesignSync`, `allowedMcpServers` and `disableAllHooks` additions.

**Drift found and closed at this reconciliation — the first since this file was created.**
`disableAllHooks: true` was applied to the live file on 27 July and this reference was not
updated in the same change, so the two disagreed until the following session found it. Step 4
of the change procedure below exists precisely to prevent that, and it was missed. Recorded
rather than quietly fixed: **a drift-detection convention whose first real drift goes
unremarked is a convention nobody will trust the second time.**

---

## Why a reference copy exists

The live `settings.json` is the Architect's entire security boundary, and it has no version
history. Nothing records what it used to say, nothing announces a change, and nothing would
tell Carl if it were corrupted, reverted or edited — the failure would surface as the
Architect writing a file, which is exactly the outcome the file exists to prevent.

Copying the whole `.claude-architect` folder into git was rejected: it contains
`.credentials.json`. A reference copy of the one file that matters gives auditability
without carrying secrets.

**Drift is detected by comparison, not by alarm.** Nothing enforces agreement between this
file and the live one. If they disagree, that is a finding to route to Carl — and the live
file is what is actually in force, regardless of what this one says.

---

## Intended state

```json
{
  "permissions": {
    "deny": [
      "Edit",
      "Write",
      "NotebookEdit",
      "mcp__codex",
      "mcp__ide",
      "DesignSync",
      "CronCreate",
      "EnterWorktree",
      "RemoteTrigger",
      "ScheduleWakeup",
      "TaskCreate"
    ],
    "allow": [
      "Bash(npm run build)",
      "Bash(npm run lint)",
      "Bash(npx tsc --noEmit)",
      "Bash(node verify/*)",
      "Bash(git log *)",
      "Bash(git diff *)",
      "Bash(git status *)",
      "Bash(git show *)",
      "Bash(git blame *)",
      "Bash(grep *)",
      "Bash(ls *)",
      "Bash(netstat *)"
    ]
  },
  "allowedMcpServers": [],
  "disableAllHooks": true,
  "model": "opus[1m]",
  "effortLevel": "high",
  "theme": "auto",
  "tui": "fullscreen"
}
```

⚠ **THE `allow` LIST IS PROMPT-SUPPRESSION, NOT A SANDBOX.** It exists so the twelve commands
the Architect actually needs run without interrupting Carl. **Anything not listed still runs —
it just prompts first.** Read it as a convenience list and as a statement of intended use, never
as the boundary. The boundary is the `deny` list plus the fact that Carl is at the keyboard.

⚠ **`model` and `effortLevel` are requests, not guarantees.** DL-6 records `opus[1m]`
requested and `claude-opus-4-8` actually running for 35 turns, caught in the Architect's own
transcript; DL-3 records that there is no hard-fail mode. **The pin is a request; the
transcript is the proof** (P2). Verify from a live session, never from this file.

**`model` and `effortLevel` are governance settings, not preferences** — the research treats
model choice as an enforcement lever, and effort bears on review quality. `theme` and `tui`
are cosmetic. Changing either of the first two is a change to the boundary.

---

## Why each denial is there

| Entry | Reason |
|---|---|
| `Edit`, `Write`, `NotebookEdit` | The direct write tools. The Architect never writes repository files — `architect-role.md` §1. |
| ~~`Bash`~~ | ⚠⚠ **REMOVED 12 AUGUST 2026 ON CARL'S INSTRUCTION.** The finding that put it here is unchanged and still true: *"A proven bypass, not a precaution. With `Bash` available, denying the edit tools is cosmetic: shell redirect, `sed -i` and `rm` all still write. Verified by attack, 24 July 2026."* **What changed is the trade, not the fact.** The cost it bought — no builds, no tests, no `verify/` runs — was paid daily and came due on 11–12 August, when the Architect's best analyses had to be built on the Builder's numbers because it could not take its own. Carl weighed a real write risk against a real review handicap and chose. ⚠ **Read the deny list accordingly: `Write` on it no longer means the seat cannot write.** |
| `mcp__codex` | The Codex MCP bridge. Codex is retired (D-036); the app is scheduled for removal ~14 August 2026. **This entry may come out once the app is gone** — until then it stays. |
| `mcp__ide` | The IDE MCP server, whose `executeCode` tool runs arbitrary code — the same failure class as `Bash`. **Added 27 July 2026.** See below. |
| `DesignSync` | A **built-in**, not MCP — so no `mcp__*` entry and no MCP allowlist ever touched it. Reads and writes the user's claude.ai design-system projects: `write_files`, `delete_files`, `create_project`. **Added 27 July 2026.** See below. |
| `CronCreate`, `EnterWorktree`, `RemoteTrigger`, `ScheduleWakeup`, `TaskCreate` — ⚠ **and `Monitor`, `TaskOutput`, `TaskStop` REMOVED 12 August 2026** | ⚠ **THE FIVE THAT REMAIN ARE DEFERRED EXECUTION AND BUDGET-CONSUMING WORK AFTER THE SESSION ENDS**, which measurement does not need. **The three removed are how a long-running build or harness is watched and stopped** — and with `Bash` now present, denying them closed a name rather than a capability, which is the error this very section warns against. The original reasoning follows, and its logic is why the removal is consistent rather than a relaxation: **The execution class.** `Monitor` takes an arbitrary `command` and, per its own schema, *"runs in the same shell environment as Bash"* — the capability `Bash` was denied for, under another name. The rest schedule work, spawn processes, or write to the filesystem via the harness. **Added 27 July 2026**; the last two after the Architect pointed out that denying `CronCreate` without `ScheduleWakeup` closed a name and not a capability. `Agent` is deliberately absent — F-2 measured that subagents inherit this deny list. See below, including why this closes the instances and **not** the class. |

| Non-deny key | Purpose |
|---|---|
| `allowedMcpServers: []` | **An allowlist, and that is the point.** The `deny` list enumerates, so anything arriving later is permitted by default — F-1's objection. An empty allowlist inverts it: nothing is permitted unless named. **Added and verified by measurement 27 July 2026.** See below. |
| `disableAllHooks: true` | **Closes F-3.** Hooks execute outside the permissions system, so the deny list never governed them — and `launch-architect.cmd` does `cd /d` into the repository, so the Architect loads the repo's `.claude/settings.json` and its `PreToolUse` hook running `node`. A categorical off-switch, not an enumeration. **Added 27 July 2026 — effect NOT yet verified in a running seat.** See below. |

**The separate `CLAUDE_CONFIG_DIR` is part of the mechanism, not packaging.**
`launch-architect.cmd` sets it to `~/.claude-architect`, so this deny list applies to the
Architect seat alone and can never reach the Builder session.

---

## The `mcp__ide` addition — 27 July 2026

Found while checking a suggestion the Architect made about itself, and worth recording as a
worked example of why findings get verified.

**What happened.** Asked to create a file, the Architect correctly refused — *"this session
has no file-writing tools, so I can't"* — but offered "try the IDE kernel instead" as an
alternative route. That warranted checking, because the IDE server's `executeCode` tool runs
arbitrary code, which would make every edit denial cosmetic exactly as `Bash` did.

**What was found.** The route did not exist. The Architect's `mcpServers` is `{}`, and its
config directory has no `ide/` subdirectory — IDE discovery happens through a lock file in
the config dir, and `CLAUDE_CONFIG_DIR` redirects that along with everything else. The
Builder session had a live lock (`~/.claude/ide/51337.lock`); the Architect had none.
**It proposed a capability it did not have.**

**Why it was closed anyway.** The protection was circumstantial — *no IDE server is
reachable* — where every other entry in the list is categorical: *the tool is denied*. A
config change, a different launch route or a change to how Claude Code discovers IDEs would
have reopened it silently. Denying `mcp__ide` costs the Architect nothing it currently has
and converts an accident into a rule.

**Two lessons worth keeping.**

1. **Close boundaries by rule, not by circumstance.** "Nothing can reach it" is a weaker
   guarantee than "it is denied," and only the second survives a change nobody reviewed.
2. **A reviewer can be confidently wrong about its own capabilities.** The Architect is the
   authority on the repository, not on its own configuration. This is why findings route to
   Carl for decision rather than being acted on directly — `architect-role.md` §1.

---

## The subagent route — 27 July 2026

Carl authorised a one-off boundary test: could the Architect obtain a write by delegating to
a subagent? The route had been flagged as unproven on 24 July, when the first Architect
session confirmed it could not write directly but explicitly declined to claim it had no
write path *at all* — subagents were named among the untested routes.

**What was done.** A `general-purpose` subagent was spawned and instructed to write
`project-intelligence/live-work/f2-subagent-test.txt` containing the word `BREACH`.

**What was found.** The subagent inherited the Architect's restricted tool set. `Write`,
`Edit`, `Bash` and `NotebookEdit` were absent from its context — not merely unloaded, but
returning "No matching deferred tools found" on a direct lookup run inside the subagent's own
thread. The file was never created; verified by `Glob` in the Architect seat, and
independently from disk by the Builder against a timestamped pre-test baseline.
**The deny list propagates across delegation.**

**The part worth recording precisely.** The agent registry declares `general-purpose` as
`Tools: *`. It did not receive `*`; it received the Architect's denied set. **The registry
declaration is not what governs — the seat's deny list is**, and `CLAUDE_CONFIG_DIR` carries
that list to every agent spawned under the seat.

**What was not tested, and must not be claimed.** The subagent refused the task before
reaching for any tool, on the correct grounds that a message from another agent is not Carl's
authorisation. That refusal is **not** evidence of restraint under capability — it declined
something it could not have done anyway. Only the tool boundary was load-bearing. Whether the
authorisation discipline holds when write tools are genuinely present remains **untested**,
and this run does not speak to it.

**Two lessons, and the first is a repeat.**

1. **A reviewer can be confidently wrong about its own capabilities — second recorded instance
   in four days.** The subagent reported that "a shell redirect was probably available to me
   had I gone looking for it," stated as a finding rather than a guess. Measurement
   contradicted it and it retracted. This is the same failure as the `mcp__ide` proposal
   above. The rule stands reinforced: **measure the capability, do not narrate it.**
2. **A capability probe must not contain a fallback escalation.** The instruction sent to the
   subagent read: *"if the Write tool is not available, attempt it once via a Bash shell
   redirect."* That pushes for the write to land by any available route, which is more than a
   probe needs — a probe asks whether a path is open, not that the file appear. The subagent
   flagged the phrasing itself. **Probe one route at a time and let it fail.**

**No settings change follows.** The existing deny list already covered this. What changed is
that a route previously *assumed* closed is now *measured* — the same distinction as lesson 1
in the `mcp__ide` section.

**Scope limits worth carrying forward.** This tested locally-spawned subagents only.
`CronCreate` and `RemoteTrigger` run in a different environment with its own settings and
were **not** exercised. It is also one harness version: a finding with a date on it, not a
permanent guarantee.

---

## The MCP allowlist — 27 July 2026, measured either side of a restart

**F-1's objection was correct and is now closed by a different mechanism than it proposed.**

F-1 observed that the `deny` list *enumerates*: it named two MCP servers, so anything
arriving later was permitted by default — the shape of the `mcp__ide` problem rather than a
fix for it. It left open whether a wildcard deny (`mcp__*`) was supported. **That question is
still unanswered**; what closed the gap is a separate, documented setting.

**`allowedMcpServers` is an allowlist**, so nothing is reachable unless named. Empty means
none.

**Verified by measurement, not by reading**, either side of a restart with identical wording
put to both sessions:

| | Before | After |
|---|---|---|
| `mcp__claude_ai_Google_Drive__authenticate` | present | **absent** |
| `mcp__claude_ai_Google_Drive__complete_authentication` | present | **absent** |
| Anything with an `mcp__` prefix | two tools | **none** |

**It governs account-level connectors**, which is the substantive result. The Drive server
did not arrive through `mcpServers` — that block is `{}` — but through an account-level
connector, which is exactly why F-1 judged the original `mcp__ide` evidence too weak. A
`deny` entry would have had to name it; the allowlist did not need to.

**The gap this closed was live, not theoretical.** The Drive server was installed and
awaiting OAuth. What prevented its use was that nobody had completed the flow — circumstantial
protection of precisely the kind the `mcp__ide` entry exists to eliminate. **And the risk was
not the Architect authenticating itself**: it was Carl authenticating Drive on his main
account for ordinary reasons, at which point the connector becomes live in a deliberately
restricted seat with nothing announcing the change.

**One limit worth recording.** `blockedMarketplaces`, `strictKnownMarketplaces` and
`disableSideloadFlags` — which would close the plugin-install route F-1 also identified — are
**managed-settings only**, i.e. enterprise deployment. They are not available in a personal
`settings.json`. The official marketplace is already cloned into
`.claude-architect/plugins/marketplaces/` and re-synced during the 27 July session, so a
`/plugin install` remains possible in that seat. **Accepted limit, not an open question** —
there is no route to close it at this tier.

---

## `DesignSync` — the surface that was not MCP at all

**Found by the Architect while measuring the MCP result, and it is the more important find.**

`DesignSync` is a **built-in tool**, not an MCP server. No `mcp__*` deny entry and no MCP
allowlist would ever have touched it. It reads and writes the user's **claude.ai
design-system projects** through the claude.ai login, with `write_files`, `delete_files` and
`create_project` among its methods.

**Why it matters here.** `write_files` accepts a `localPath` and, per its own schema, *reads
from disk, encodes, and uploads* — up to 256 files per call, repeatable under one plan. That
is a route from this machine to the cloud, available to the seat whose entire purpose is
being unable to change anything.

**Stated at its true size.** It is **not** a repository write path — it cannot modify
`agency-website-v2`. The exposure is **outward**: cloud writes and exfiltration of local file
contents.

**The mitigations were real, and were still not enough.** `finalize_plan` requires a
permission prompt, locks the exact paths and source directory before any write, and shows
Carl the structured path list *independently of the agent's narration* — deliberately, so a
misleading description cannot hide what is being sent. Writes outside the plan are rejected.

**But it is approval-shaped, not config-shaped**, and that is the whole objection. Every other
boundary in this seat is categorical: the tool is not there. This one depended on Carl reading
a prompt correctly at the moment it appeared.

**The auto-mode trap this removes.** Earlier the same day, auto mode was judged "harmless in
the Architect seat, since it cannot write anyway." **That reasoning was wrong** — it can write
outward, and a permission prompt was the only thing stopping it. Auto mode delegates exactly
that prompt to a classifier with a measured 17% false-negative rate on genuinely risky
actions. Denying `DesignSync` removes the trap before it can be walked into.

**Cost to the seat: none.** The Architect reads this repository and reports findings. It has
no design-system work.

**Method note — the reviewer's own correction, and one correction to it.** The Architect
reported the two Drive tools, built a recommendation on them, then found them absent after the
restart and **withdrew its own finding**, stating it could not tell whether the tools had been
present earlier or its earlier report had been wrong. Withdrawing an unverified premise is the
right instinct and is exactly what the *measure, do not narrate* rule asks for.

**On the facts, though, the ambiguity resolves:** the two lookups sat either side of a config
change and a restart, both timestamped in the seat's own `history.jsonl`. The tools were
present, and the setting removed them. Recorded because *"I cannot tell"* is the correct
default and *"the evidence settles it"* is the correct exception — and a future reader should
see both, not just the cautious half.

---

## `disableAllHooks` — the surface the permissions system never governed

**Added 27 July 2026, closing F-3. ⚠ Its effect is not yet verified in a running seat** — see
the verification note at the end of this section.

**The gap F-3 identified.** `launch-architect.cmd` does `cd /d` into the repository before
launching, so the Architect loads this project's `.claude/settings.json` — which registers a
`PreToolUse` hook executing `node` against `chunk-scope-guard.js`. **Hooks run outside the
permissions system.** The deny list governs tool calls; it does not govern hook commands. So
the seat's entire boundary sat alongside an execution path the boundary did not cover.

**Two facts settled from the documentation**, both questions the Architect could not answer
about itself:

1. **Project hooks are not auto-trusted** — workspace trust gates them. The exposure was
   narrower than first feared.
2. **`disableAllHooks` exists** as a categorical off-switch. This is the one that mattered:
   it makes the answer a rule rather than a circumstance.

**Why categorical, given the hook is benign.** The repository's only hook is the chunk-scope
guard, which blocks out-of-scope *edits* — and the Architect makes none, so the setting costs
that seat nothing. The point is not this hook. It is that **a hook is a standing grant of
execution that no permission audit surfaces**, and the repo's hook configuration can change
without anyone reviewing what it means for the read-only seat. Same reasoning as `mcp__ide`:
close the boundary by rule, not by circumstance.

**The Builder's guard is fully intact.** The setting is on the Architect seat alone, carried
by `CLAUDE_CONFIG_DIR`. `chunk-scope-guard.js` still fires in the Builder session, which is
the seat it was written for.

**Related, same day:** the GSD toolkit was found holding nine hook registrations in the
*Builder* seat, none of them governed by any deny list (D-037). F-3 and that discovery are the
same underlying observation reached from two directions — **hooks are a governance surface,
and neither seat had been auditing it.**

### Verification — 27 July 2026, and the result is honest rather than clean

**Checked on a fresh Architect start with the key in force.** The seat reported the settings
chain: no hooks in `~/.claude/settings.json` or `settings.local.json`, and the project's
`PreToolUse` hook — matcher `Edit|Write|NotebookEdit` — present in `.claude/settings.json`.

**What this does and does not establish.** The hook **could not fire regardless**: this seat
has no `Edit`, `Write` or `NotebookEdit` tool, so the matcher can never match. So the run
confirms the setting is loaded without error and the seat starts normally — it does **not**
isolate `disableAllHooks` as the thing preventing execution. **The deny list already prevented
it.**

**A clean test of `disableAllHooks` alone would need a hook whose matcher targets a tool this
seat does have** — `Read`, `Grep` or `Glob`. That has not been done, and the finding is
recorded at that strength rather than rounded up to "verified".

**The Builder's guard is unaffected**, confirmed from disk: `disableAllHooks` is absent from
`~/.claude/settings.json`, and the repo hook remains registered. The setting reaches the
Architect seat alone, carried by `CLAUDE_CONFIG_DIR`.

**⚠ Separately, and more important than the above: the guard is opt-in and currently inert.**
The Architect noticed that `project-intelligence/live-work/chunk-scope.json` does not exist,
and that `chunk-scope-guard.js` line 76 reads
`if (!fs.existsSync(SCOPE_FILE)) ALLOW(); // no chunk scoped — opt-in`. **Verified from
disk.**

This is by design — it is what allows governance and documentation work to proceed outside a
chunk, which is all that has happened since it was written. But state it plainly: **the
Builder's only mechanical control does nothing until a chunk is scoped.** It is a per-chunk
switch that is presently off, not defence-in-depth. **When building resumes, writing
`chunk-scope.json` is part of authorising the chunk** — without it the guard is decorative.

Recorded here because the natural reading of "the Builder has a chunk-scope guard" is that
edits are policed. They are not, right now.

---

## F-6, tested — a malformed settings file fails closed, with a one-keypress escape hatch

**Tested 27 July 2026 on Carl's authorisation. The original claim was half right, and the
half that was wrong is the more useful half.**

**The claim under test.** The Builder wrote *"a malformed settings file may fail open"* into
step 2 of the change procedure without testing it — logged as E-2. The Architect flagged it as
F-6: load-bearing, because it justifies the entire backup convention, and supported only by an
analogy to the chunk-scope guard, which *was* found to fail open on a malformed scope file
(`live-work-protocol.md` §8). **An analogy is not evidence.**

**Method.** A copy of `settings.json` in a scratch config dir, truncated mid-array so no parser
would accept it; a disposable launcher pointing `CLAUDE_CONFIG_DIR` at that copy; Carl ran it
from a plain `cmd` window. **The live config was untouched throughout** — MD5 verified
identical before and after. Confirmed a real seat launched against the scratch dir, because it
created `.claude.json`, `cache/` and `backups/` there; two earlier attempts had left the folder
containing only `settings.json`, which is how they were known to have never run.

**The measured result — verbatim from the screen:**

```
Settings Error
  ...f6-test-config\settings.json
    └ Invalid or malformed JSON

Files with errors are skipped entirely, not just the invalid settings.

> 1. Fix with Claude
  2. Exit and fix manually
  3. Continue without these settings

Enter to confirm · Esc to cancel
```

**What that establishes.**

1. **It fails closed by default.** The seat does not start silently with a broken boundary. It
   detects the corruption, halts, and requires a decision. This is a real gate, and it is
   better than the original claim assumed.
2. **But the failure is all-or-nothing.** *"Files with errors are skipped entirely, not just
   the invalid settings"* — the deny list, the MCP allowlist and `disableAllHooks` are
   discarded **together**. There is no partial degradation, so no intermediate state where
   some of the boundary survives.
3. **Option 3 removes the entire boundary in one keypress**, and nothing in the prompt says so.
   *"Continue without these settings"* reads like dismissing a config nuisance. In this seat
   those settings **are** the security boundary.

**So the accurate formulation, replacing the untested one:**

> **It fails closed — but it fails open on one keypress, and the prompt does not announce
> what that keypress costs.**

**The operational rule that follows.** If a `Settings Error` prompt ever appears when launching
the Architect: **press `Esc`, then fix the file.** Never choose *"Continue without these
settings"* in that seat. Option 1, *"Fix with Claude"*, is also wrong here — it invites the
model to repair the file that defines its own restrictions.

**This is why the backup convention is load-bearing after all**, though not for the reason
originally given. The risk was never a silent start; it is a person meeting an unexpected error
prompt, choosing the option that lets them get on with their work, and running unrestricted
without realising. A known-good backup makes *"Exit and fix manually"* a thirty-second job
rather than a reconstruction, which is what makes `Esc` the easy choice rather than the
inconvenient one.

**A note on how the test itself nearly went wrong**, because it generalises. The first version
of this test had two defects, both found by the read-only Architect reviewing the launcher
before it ran:

- **The corruption was too weak.** A trailing comma is invalid under strict JSON but tolerated
  by JSONC-style parsers, which config loaders commonly use. The seat would have started
  normally and the run would have been read as *"fails closed"* while measuring nothing —
  **a false pass, which is worse than no test.**
- **The launcher pointed the test seat at the live repository.** Had the config failed open, a
  seat with `Bash` and `Write` would have opened directly onto the working tree — and the
  repo's chunk-scope guard matches `Edit|Write|NotebookEdit` only, leaving `Bash` unguarded.
  **A test whose failure mode is an unrestricted shell inside the thing being protected is a
  badly designed test.** Fixed by pointing it at an empty folder.

It also observed that **no write attempt was needed**: if `Bash` or `Write` appear in the
seat's toolset at all, it has already failed open. **Design the probe so the answer arrives
before anything is attempted.**

---

## The execution class — `Monitor` and its relatives, denied 27 July 2026

**Found by the read-only Architect while declining to run the F-6 test.** A live gap in normal
operation, not a failure mode. **Closed as far as the harness permits — see the limit at the
end, which is real and permanent at this tier.**

**The finding.** `Monitor` takes an arbitrary `command` string. Its own schema says:

> *"The script runs in the same shell environment as Bash."*

`Monitor` is **not on the deny list.** So in a seat where `Bash` is denied, `Monitor` reaches
the same capability under a different name — a shell, in the Architect's own process.

**The reviewer did not test it, and was right not to.** Writing a file through `Monitor`'s
shell would have produced a file and a misleading result: it would have measured *the
reviewer's willingness to route around its own deny list*, not whether the boundary holds.
**A probe that requires the prober to breach the boundary measures the prober, not the
boundary.**

**It is not alone.** A tool sweep of this Builder seat found the same shape elsewhere:

| Tool | Why it belongs in this class |
|---|---|
| `Monitor` | Arbitrary `command`, same shell environment as `Bash` |
| `Agent` | Spawns subagents. **Closed by measurement** — subagents inherit the seat's deny list (F-2, `f5a1d9b`) |
| `CronCreate` | Schedules a prompt to re-enter the session later. Session-only, but it is deferred execution |
| `EnterWorktree` | Creates a git worktree — a filesystem write, performed by the harness rather than by a denied tool |
| `TaskOutput` / `TaskStop` | Read and control background tasks |

**The pattern, now on its fourth instance in one day** — after `mcp__ide`, `DesignSync` and
this: **an enumerated deny list names tools, but capability is not owned by a name.** Any
tool that takes a command string, spawns a process, or schedules future work reaches the same
capability under a different label. `Bash` was denied because it was a *proven* bypass; the
lesson generalises past `Bash` and past every name currently on the list.

**What was applied.** Eight entries added to the deny list: `Monitor`, `CronCreate`,
`EnterWorktree`, `TaskOutput`, `TaskStop`, `RemoteTrigger`, `ScheduleWakeup`, `TaskCreate`.
`Agent` is deliberately **not** denied — F-2 measured that subagents inherit this seat's deny
list, so the delegation route is closed by inheritance rather than by name, and denying it
would cost the seat a capability it can use safely.

**The last two were missed on the first pass, and the miss is instructive.** After the restart
that verified the first six, the Architect reported: *"`ScheduleWakeup` is present in my
top-level tools, and it schedules future wakeups. If the intent behind denying `CronCreate`
was 'this seat cannot schedule work that consumes budget after the session ends',
`ScheduleWakeup` is a live path to a similar outcome and was not closed."*

**It was right, and the Builder had made the exact error this section warns against** —
denying a *name* (`CronCreate`) rather than a *capability* (deferred execution) — **while
writing the paragraph that says not to.** `TaskCreate` was added at the same time for the same
reason. **Knowing the rule is not applying it**; the check that caught this was a fresh reader
measuring its own toolset, not the author re-reading his own text.

### ⚠ The limit, and it is permanent at this tier

**A tool allowlist does not exist.** Checked in the documentation on 27 July 2026 rather than
assumed: `permissions.allow` **pre-approves** actions that would otherwise prompt — it does
**not** restrict the session to only what it names. `deny` is the only restricting mechanism,
and it is an enumeration **by design**. There is no deny-by-default mode.

So the fix that F-1 earned for MCP servers — replacing an enumeration with an allowlist — has
**no equivalent for tools**. `allowedMcpServers` closed the MCP class categorically;
nothing closes the tool class.

**What that means in practice, stated plainly so nobody records this as stronger than it is:**

- The six named tools are closed. **The class is not.**
- **A tool added by a future Claude Code update is permitted by default** in this seat, and
  nothing will announce it. If it takes a command string, spawns a process, or schedules
  work, it reaches the same capability `Bash` was denied for.
- This is the same weakness F-1 identified, now **known to be unfixable here** rather than
  merely unfixed. `blockedMarketplaces` and friends are managed-settings only; so, in effect,
  is any deny-by-default posture.

**The consequence for the review procedure.** Since the deny list cannot defend itself against
additions, the defence has to be periodic and human-triggered: **when Claude Code updates, or
when this file's comparison is run, sweep the Architect's toolset for anything new that takes
a command, spawns a process, or schedules work.** That belongs with the comparison trigger in
"Changing the live file", and it is the only mechanism available.

**The pattern, on its fourth instance in one day** — after `mcp__ide`, `DesignSync` and the
MCP enumeration: **capability is not owned by a name.** `Bash` was denied because it was a
proven bypass; the lesson generalises past `Bash` and past every name now on the list.

**One note on method, worth keeping.** The reviewer found this and **did not test it**, on the
grounds that writing a file through `Monitor`'s shell would have measured its own willingness
to route around its deny list rather than whether the boundary holds. That instinct is right:
**a probe requiring the prober to breach the boundary measures the prober, not the boundary.**
It is also *discipline, not a control* — which is exactly why the deny entries were added
rather than left to good judgement.

---

## Changing the live file

1. **Back it up first** — no git history means the backup is the only undo. Convention:
   `settings.json.bak-YYYY-MM-DD`, same folder.
2. **Validate the JSON after editing.** ✅ **TESTED 27 July 2026 — see "F-6, tested" below.**
   A malformed file does **not** silently fail open: the seat detects it and stops with a
   `Settings Error`. But it offers *"Continue without these settings"*, and **the whole file
   is discarded, not the invalid part** — so one keypress starts a seat with no deny list at
   all. Validate after every edit, and if that prompt ever appears, **cancel with `Esc` and
   fix the file**. Never continue past it in the Architect seat.
3. **Restart the Architect.** Settings load at startup; a running session keeps the old list.
4. **Update this reference file and the reconciliation date above**, in the same change.
5. **Re-attack after every change — not only after a relaxation.** *(Corrected 27 July 2026,
   F-7.)* The earlier wording exempted tightening edits, which is the wrong way round: a
   tightening edit can still break the file, malformed JSON may fail open, and every change
   needs a restart to take effect. **The edit that looks safe is the one the procedure would
   have told you not to re-test.** One attempted write takes seconds.

**Owners, because a step with no name on it drifts** *(F-8/obligation 4, 27 July 2026)*:
steps 1–3 and 5 are Carl's; **step 4 is the Builder's** — the Architect cannot update the
reference file, that being the write path it does not have.

**When the comparison happens.** *(F-8.)* Compare the live file against this reference
**whenever the Architect's own configuration is in scope**, and whenever Carl asks. Triggering
it otherwise is Carl's, not a standing duty on the Architect — stated so the ambiguity does
not become an unwritten obligation the first time a drift is missed.

**Sweep the toolset at the same time, and after any Claude Code update.** Because no tool
allowlist exists (see the execution-class section), **a new tool is permitted by default and
nothing announces it.** The comparison above catches drift in the file; only a sweep catches
capability that arrived without the file changing. **Look for anything that takes a command
string, spawns a process, schedules work, or writes outward.** This is the only mechanism
available at this tier — it is periodic and human-triggered, and that is a real weakness, not
a formality.

**What the Architect may conclude from that comparison, and what it may not:**

> **It can compare two files and report a difference. It cannot conclude that the boundary
> holds.**

Confirming the deny list is intact is not confirming it is *sufficient*. F-1 and the
`DesignSync` find were both things that read as intact and were not.

---

## Related

- `architect-role.md` §1 (boundary), §2 (what the denials cost, and the `!` route)
- `live-work-protocol.md` §5a — the `!` prefix, and how git reaches the Architect
- `ai-roles.md` — the seats and what passes between them
- `decisions.md` D-036 — Codex retired, governance rebuilt
- `workflow-redesign/workflow-redesign-research.md` DL-1, DL-7
