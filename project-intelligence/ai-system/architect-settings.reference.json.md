# Architect settings — reference copy

**This is a REFERENCE, not the live file.** Editing this changes nothing.

The live file is `C:\Users\Carl Buckley\.claude-architect\settings.json`, outside this
repository and therefore outside git. This copy exists so the *intended* state of the
Architect's security boundary is versioned, auditable and readable by the Architect itself.

**Last reconciled with the live file: 27 July 2026.**

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
      "Bash",
      "mcp__codex",
      "mcp__ide"
    ]
  },
  "model": "opus[1m]",
  "effortLevel": "high",
  "theme": "auto",
  "tui": "fullscreen"
}
```

---

## Why each denial is there

| Entry | Reason |
|---|---|
| `Edit`, `Write`, `NotebookEdit` | The direct write tools. The Architect never writes repository files — `architect-role.md` §1. |
| `Bash` | **A proven bypass, not a precaution.** With `Bash` available, denying the edit tools is cosmetic: shell redirect, `sed -i` and `rm` all still write. Verified by attack, 24 July 2026. The cost — no `git`, builds or tests — is accepted and mitigated by the evidence file and the `!` prefix (`architect-role.md` §2, `live-work-protocol.md` §5a). |
| `mcp__codex` | The Codex MCP bridge. Codex is retired (D-036); the app is scheduled for removal ~14 August 2026. **This entry may come out once the app is gone** — until then it stays. |
| `mcp__ide` | The IDE MCP server, whose `executeCode` tool runs arbitrary code — the same failure class as `Bash`. **Added 27 July 2026.** See below. |

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

## Changing the live file

1. **Back it up first** — no git history means the backup is the only undo. Convention:
   `settings.json.bak-YYYY-MM-DD`, same folder.
2. **Validate the JSON after editing.** A malformed settings file may fail open.
3. **Restart the Architect.** Settings load at startup; a running session keeps the old list.
4. **Update this reference file and the reconciliation date above**, in the same change.
5. **Re-attack any relaxation.** Removing an entry reopens whatever it closed. `Bash` and the
   chunk-scope guard were both proven by attack, not by reading.

---

## Related

- `architect-role.md` §1 (boundary), §2 (what the denials cost, and the `!` route)
- `live-work-protocol.md` §5a — the `!` prefix, and how git reaches the Architect
- `ai-roles.md` — the seats and what passes between them
- `decisions.md` D-036 — Codex retired, governance rebuilt
- `workflow-redesign/workflow-redesign-research.md` DL-1, DL-7
