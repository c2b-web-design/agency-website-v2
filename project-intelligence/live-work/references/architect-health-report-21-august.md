# Claude Code Health Report — 21 August 2026

**Author: the CLI Architect seat** (`CLAUDE_CONFIG_DIR=~/.claude-architect`), running in VS Code.
**Committed by the Builder on the Architect's behalf**, because that seat is read-only and
`live-work-protocol.md` requires the report to reach disk.

> ## ⚠ WHY THIS FILE IS IN THE REPO AT ALL
>
> **Carl is currently using the Claude desktop app as a TEMPORARY ARCHITECT.** That instance has
> full repository read access and no other channel into this project — it reads what is committed
> and pushed, nothing else. This report existed only in a CLI chat window, where the desktop app
> could not see it.
>
> ⚠ **`live-work/` is gitignored scratch, so this file was FORCE-ADDED (`git add -f`).** A plain
> write would have been invisible to the desktop app.
>
> ⛔ **TEMPORARY. Delete or promote once the desktop-app Architect has read it and Carl has ruled
> on the decisions below.** Same single-use discipline as the session handoff.

---

## The headline

**The seat that produced this report is not the one it might appear to be.** It ran as the
**Architect**, whose permissions were reverted to **fully read-only on 13 August**. No `Bash`,
`Edit`, `Write` or `NotebookEdit` — confirmed by direct lookup, not inferred.

**Two real findings.** The install is **21 patch versions behind**, and a new outward-write tool
(**`Artifact`**) is present in this restricted seat and **has never been reviewed**. Everything else
is healthy — unusually so.

---

## The configuration change

`~/.claude-architect/settings.json`, reconstructed from the two dated backups beside it:

| | 12 Aug (`bak-2026-08-12`) | 13 Aug (`bak-2026-08-13`) | Live now |
|---|---|---|---|
| `Bash` | denied | allowed + 12-command allow list | **denied** |
| `Monitor`, `TaskOutput`, `TaskStop` | denied | removed from deny | **denied** |
| `permissions.allow` | absent | 12 entries | **absent** |

**The round trip is complete and matches `architect-settings.reference.json.md` exactly** — deny
list identical, 15 entries, same order. **The reference file is accurate and the boundary is in
force.** Its own account of why (`allow` pre-approves, it does not restrict; no tool allowlist
exists at this tier) is correct as written.

### One drift — the second this convention has caught

The live file carries **`"agentPushNotifEnabled": true`**, which is **not** in the reference's
*Intended state* block. Not a boundary key — it enables push notifications — but **it arrived
without step 4 of the file's own change procedure being run.** The same key is now also in
`~/.claude/settings.json`, so it likely came from a product default or a `/config` change rather
than a deliberate edit. ⚠ **Worth recording rather than quietly fixing**, for the reason the file
already gives about its first drift.

**Model pin verified from the live session**, as the reference instructs: requested `opus[1m]`,
actually running `claude-opus-5[1m]`. **The pin is holding.** (DL-6 records a session where it did
not — this is the check the file asks for, and it passes today.)

---

## Detail table

| Component | Type | Scope | Uses (total since install) | Used in window? | Est. resident tokens | Verdict |
|---|---|---|---|---|---|---|
| `CLAUDE.md` (+`@AGENTS.md`) | Memory file | Project, checked in | n/a | always loaded | ~3.2k est. | Keep — see check 3 |
| Skill listing (17 bundled) | Listing | Built-in | n/a | n/a | ~1.6k est. | Not touching — all bundled |
| `gsd-new-project` / `-discuss-` / `-plan-` / `-execute-phase` | Skill | — | 1 / 3 / 3 / 1 | No (~3 May) | 0 | Already gone — no files on disk |
| `run` | Skill | Bundled | 9 | No (~21 Jul) | in listing | Not touching — bundled |
| `update-config` | Skill | Bundled | 1 | No (~23 Jul) | in listing | Not touching — bundled |
| MCP servers | — | all scopes | n/a (no counter) | none exist | 0 | Nothing to disable |
| Plugins (Builder seat) | — | user | no `enabledPlugins` key | No | 0 | None enabled |
| Plugins (Architect seat) | — | user | undetermined | — | — | See note |

**Scan window:** 44 session transcripts plus subagent logs, all in the single project directory that
exists (`c--Users-Carl-Buckley-agency-website-v2`). No other project has ever been opened.
⚠ **File timestamps were unreadable without a shell, so this is a SESSION COUNT, not a day window.**

**Plugin note:** Carl declined the read of `~/.claude-architect/.claude.json`, so **whether any
plugins are enabled in this seat is undetermined.** The official marketplace is cloned there (500+
files under `plugins/marketplaces/`). ⚠ The reference file already records this as an **accepted,
unclosable limit** — `blockedMarketplaces` and friends are managed-settings only, so
`/plugin install` remains possible in the Architect seat and **nothing at this tier closes it.**

---

## Findings by check

**Check 0 — setup health.** No agent definition files at either scope (`.claude/agents/`,
`~/.claude/agents/`) — no broken frontmatter, no name collisions. All five settings files read as
well-formed JSON. **The two config roots are by design** (`launch-architect.cmd` sets
`CLAUDE_CONFIG_DIR`), not a duplicate install. ⚠ **Not determinable without a shell:** PATH
resolution, npm global leftovers, `~/.claude/local`, and `installMethod` (the key is absent from
`~/.claude.json` entirely).

**Check 1 — unused extensions.** Nothing to disable. **Zero MCP servers at any scope.** No plugins
enabled in the Builder seat. The four `gsd-*` skills last ran ~3 May and **have no files on disk at
either scope** — already removed; only harmless usage counters remain.

**Check 2 — local CLAUDE.md dedup.** No findings. Neither `~/.claude/CLAUDE.md` nor any
`CLAUDE.local.md` exists.

**Check 3 — derivable content.** `CLAUDE.md` is ~13k chars (~3.2k est. tokens), **comfortably under
the ~40k-char warning threshold.** Content is almost entirely non-derivable: authority, governance,
worked failure cases, safety prohibitions. **Nothing worth cutting.** The one candidate — the
`## Stack` line — is verbatim derivable from `package.json`, **but keep it**: `AGENTS.md`'s whole
warning is *"this is NOT the Next.js you know"*, and the pinned version is what makes that warning
actionable. Check 3's own rule applies: **when unsure, keep.**

> ### ⚠ ONE FACTUAL DEFECT — VERIFIED BY THE BUILDER, 21 August 2026
> **`CLAUDE.md` line 85 states "22 paths are blocked outright by the scope guard". The actual
> `protected` array in `.claude/protected-files.json` holds 25.**
>
> ✅ **Independently confirmed** by the Builder before committing this report: array length **25**,
> claim on line 85 reads **22**.
>
> A stale number in a governance file, **of exactly the kind the project's own "verify before
> asserting" rule exists to catch.** ⛔ `CLAUDE.md` is itself protected, so correcting it needs Carl
> to name that exact path under `"unlocked"` in `chunk-scope.json`.

**Check 4 — lazy loading.** No migration proposed. The root file already holds only universal
constraints and safety prohibitions, with task detail behind pointers into `project-intelligence/`.
**That is the pattern this check asks for, already done.**

**Check 7 — version.** Installed **2.1.217**; latest on the `latest` channel is **2.1.238** —
**21 patch versions behind.** Fix: `claude update`, run by Carl. ⚠ **Two caveats:** the installed
number came from the `version` field the CLI stamps into the Builder's most recent transcript (the
Architect cannot run `claude --version`), and `autoUpdatesChannel` is unset so `latest` is the right
channel to compare against. Whether background auto-updates are disabled could not be checked —
`autoUpdates` is absent from `~/.claude.json`, and env vars are unreadable from this seat.

**Check 8 — auto mode.** ✅ **Healthy.** `~/.claude/settings.json` already sets
`permissions.defaultMode: "auto"`, and no project or local file shadows it. No proposal — **but see
the warning below.**

**Check 9 — pre-approved commands.** ~140 denials across 44 sessions, split roughly evenly between
permission-rule and user-rejected. ⛔ **No allow rules are proposed, and that is the CORRECT
OUTCOME, not a limitation.** The permission-rule denials are dominated by the project's own two
hooks firing — **SCOPE GUARD** and **VERIFY FRONT DOOR** — which is the control working exactly as
the handoff describes it (*"a denial is not a bug"*). **An allow rule would erode a deliberate
governance mechanism.** The remainder are user-rejected — Carl declining at the prompt — which
check 9 says to treat with caution. ⚠ The specific denied command strings could not be recovered:
that needs `tool_use_id` linkage across JSONL lines, which is a shell job.

---

## Warnings

### ⚠⚠ `Artifact` is an outward-write surface in a seat defined by not having one

It **reads a local file from disk, uploads it to claude.ai as a hosted page with a shareable URL**,
and its `action: "list"` **enumerates the user's artifact gallery.** That is the same shape as
**`DesignSync`, which was denied on 27 July** for precisely this reason — *"a route from this
machine to the cloud, available to the seat whose entire purpose is being unable to change
anything."*

**Stated at its true size, and no larger:**

- ✅ **It is NOT a repository write path.** It cannot modify `agency-website-v2`.
- ✅ **Narrower than `DesignSync`** — one file per call, which must have been read, versus 256 files
  per call from a `localPath`. Artifacts also default to **private**.
- ⛔ **But it is LESS GATED than `DesignSync` was.** `DesignSync` had `finalize_plan` — a permission
  prompt showing Carl the path list **independently of the agent's narration**. **`Artifact` has no
  equivalent**, and its own guidance says publishing proactively is fine for work-product.
- ⚠ **Whether it existed at the 27 July sweep is undetermined.** Its absence from that sweep is
  consistent with either answer. **Recorded at that strength.**

⚠ **BUILDER'S REFINEMENT, 21 August 2026.** The report states `Artifact` appears nowhere in
`project-intelligence/`. **The TOOL does not — but two Artifact SKILLS are listed** in
`live-work/references/slash-commands.md` lines 140–141 (`/artifact-design`,
`/artifact-capabilities`). **The finding stands** — a skill listing is not a permissions review —
**but the grep is not a clean zero, and a future reader running it will see hits.**

⛔ **This is the class the reference file PREDICTS and says nothing will announce:** *"a tool added
by a future Claude Code update is permitted by default in this seat."* **The sweep it mandates after
every Claude Code update has not been run against the current toolset — and the install being 21
versions behind means SEVERAL UPDATES' WORTH OF TOOLS HAVE ARRIVED UNSWEPT.**

### ⚠ Three more names denied, capability partly open

Same pattern the reference file already records for `CronCreate`/`ScheduleWakeup`:

| Present, not denied | Sibling that IS denied | What it still reaches |
|---|---|---|
| `CronDelete` | `CronCreate` | **Deletes Carl's scheduled agents** |
| `TaskUpdate` | `TaskCreate`, `TaskStop` | **`status: "deleted"` permanently removes a task** |
| `ExitWorktree` | `EnterWorktree` | Low — cannot enter one |
| `WebFetch` / `WebSearch` | — | **Outward network egress; a URL query string carries data** |

**None is a repository write.** ⚠ **`CronDelete` and `TaskUpdate` are the two worth a decision** —
both are **destructive to state Carl owns**, which the deny list otherwise closes categorically.

### ⚠ Auto mode must not reach this seat

It is correctly set in the **Builder's** `~/.claude/settings.json` only, and `CLAUDE_CONFIG_DIR`
keeps it away from the Architect. **Restated because the reference records that *"auto mode is
harmless here, it cannot write anyway"* was reasoned once and found to be WRONG.** ⛔ **The
`Artifact` finding above makes that reasoning more wrong than when it was retired, not less.**

### Hooks — healthy

Both Builder `PreToolUse` hooks measured **well inside tolerance**: `PreToolUse:Edit` **160ms**,
`PreToolUse:Bash` **144ms** (threshold 2s). ⚠ **Only 8 hook attachment entries exist** because
silent successful runs are not persisted, **so this is thin evidence** — but both measurements
agree. In the Architect seat both are inert twice over: `disableAllHooks: true`, and no
`Edit`/`Write`/`Bash` for the matchers to match. **Config inspection only, no timing data:** the
statusline spawns `node c2b-context-statusline.js` on every render in the Builder seat — **cold
interpreter startup per render** is the pattern to know about; nothing suggests it is a problem.

### Context

`CLAUDE.md` ~3.2k est. tokens is the largest resident item; the 17-skill listing ~1.6k est. **Zero
MCP schema cost.** Total resident overhead is modest. **`/context` gives exact live figures — a
Builder-seat action.**

---

## Recommendations, in priority order

1. **Run `claude update`** (Carl, via `!`) — 21 versions behind. **Then sweep the toolset**, which
   the reference file says is the only mechanism available at this tier and **is now overdue.**
2. **Decide on `Artifact`** — the Architect's recommendation is **add it to the deny list**, on the
   reference file's own precedent: it costs this seat nothing it needs (the Architect reports
   findings; it has no publishing work), and **it converts an accident into a rule.** Same reasoning
   that closed `mcp__ide` and `DesignSync`.
3. **Decide on `CronDelete` and `TaskUpdate`** — recommend **denying both**; same *"name, not
   capability"* argument the file already makes twice.
4. **Correct `22 paths` → `25 paths`** in `CLAUDE.md` line 85 — **needs an unlock naming that exact
   path.** ✅ Figure independently verified.
5. **Add `agentPushNotifEnabled` to the reference's *Intended state*** — step 4 of the change
   procedure, owed by the Builder.

⛔ **Items 2–3 alter the Architect's permission surface**, so per `CLAUDE.md` the real capability
surface is stated above before any change, **and the decision is Carl's, not any agent's.**

---

## What the Architect could not do

- **Could not write this report to `live-work/`** as `live-work-protocol.md` requires — **that
  needed the Builder, and is why this file exists.**
- **Could not check `~/.claude-architect/.claude.json` plugin state** — Carl declined the read.

---

*Report authored by the CLI Architect, 21 August 2026. Committed by the Builder at Carl's
instruction so the desktop-app Architect can read it. **The two checkable defects — the 22/25 path
count and the `Artifact` grep — were verified by the Builder before committing; one confirmed the
report, one refined it.***
