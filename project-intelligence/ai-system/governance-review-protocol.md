# Governance Review Protocol

## Why this exists

**Carl's ruling, 21 August 2026.** ⛔ **The Builder was allowed to build its own governance
system, and that was a mistake.** The scope guard, the verdict gate, the protected-files list
and the read lists were all written by the seat they constrain.

**A system audited by the tool that wrote it is not audited.** The author's blind spots are
the audit's blind spots, and they are invisible from inside by construction. **Governance is
reviewed periodically, from outside.**

⚠ **This does not say the machinery is wrong.** Most of it works, and the denial record shows
it working. It says the machinery has never been checked by anything that did not write it.

## The three seats — none audits itself alone

**1. The CLI Architect runs `/doctor`.** Read-only. Sees the working tree *and* gitignored
files — including `live-work/chunk-scope.json`, which is where unlocks live and which `git
status` can never show.
⚠ **It cannot run a shell.** So it must **mark what it could not determine rather than infer
it** — PATH resolution, `installMethod`, the live version, npm leftovers. A marked gap is a
finding; a guess dressed as a reading is a defect.

**2. The Builder runs `/doctor`.** Has `Bash`, so it reaches what the Architect could not:
`claude --version` measured directly, `installMethod`, PATH, and the denied command strings —
which need `tool_use_id` linkage across JSONL lines and are unreachable without a shell.

**3. The Desktop Architect evaluates both.**
⚠ **IT READS THE PUSHED REMOTE ONLY.** Any report it must see has to be **committed and
pushed**, or it does not exist. A report in a chat window is not available to it.
⛔ **It is RELATIVELY independent, not independent.** It proposed much of the machinery it is
reviewing. Treat its agreement as a weaker signal than its disagreement.

## ⛔ The output that matters is the COMPARISON, not either report

- **Agreement on independent evidence is corroboration.** Two seats reaching the same figure by
  different routes is worth more than one seat asserting it twice.
- ⚠⚠ **DISAGREEMENT IS THE FINDING**, and it is worth more than either report alone. Do not
  reconcile it silently. Record which seat saw what, and why they differ.
- ⚠ **DIFFERENT DENOMINATORS ARE NOT DISAGREEMENT.** On 21 August the Architect counted **44
  transcripts** and said plainly it could not read timestamps, so it had a *session count and
  not a window*; the Builder dated **38 sessions over 30 days**. **The 140 and 128 denial
  figures are not comparable, and the gap is not a change.** Check the denominators before
  calling anything a discrepancy.

## ⚠ What `/doctor` does and does not do — the load-bearing limit

**It checks the INSTALLATION**: version, install method, auto-updates, permission mode, and
**which config is actually loading**.

⛔ **IT KNOWS NOTHING ABOUT THIS REPO.** Not `protected-files.json`, not what the hooks are
for, not `proven.json`, not the mandatory read lists. ⚠ **A CLEAN `/doctor` IS NOT A CLEAN
GOVERNANCE REVIEW** — the Builder said so itself in its own report.

✅ **But run it FIRST.** *"Which config is actually loading"* is a **control on the controls**.
**Both hooks failed OPEN until 19 August**, and a settings file that is not being read makes an
inert hook look fine from every other angle.

## The repo questions — ⛔ `/doctor` answers NONE of these

**This is the review proper.**

- **The unlock rate since the last review.** ⚠ **Any path unlocked repeatedly is not settled,
  and belongs OFF the list rather than on it.** A lock that is routinely lifted is friction, not
  protection.
- **How many harnesses are admissible, and whether that number moved.**
- **Which records make claims about the PRESENT that have since decayed** — counts, "RESOLVED",
  version numbers, line numbers. This project's recurring defect class.
- **Whether the mandatory read lists have grown back.** They were cut deliberately; lists
  regrow.
- ⚠ **The toolset sweep after every Claude Code update.** See below.

## ⛔ The sweep is the control that has already failed

**It is the reason this protocol exists.**

**The deny list enumerates NAMES against a surface that GROWS.** Three instances of the same
pattern are on record:

| Denied | Left open | 
|---|---|
| `CronCreate` | `CronDelete` |
| `TaskCreate`, `TaskStop` | `TaskUpdate` |
| `DesignSync` | `Artifact` |

⚠ **Adding the missing names closes today's gap and does nothing about the next update.**
**Nothing announces a new tool.** Nothing at this permission tier can close it —
`architect-settings.reference.json.md` records this as an accepted, unclosable limit.

⛔ **THE SWEEP IS THE ONLY CONTROL, AND IT DEPENDS ON SOMEONE REMEMBERING** — which is precisely
the failure mode the scope guard and the verdict gate exist to remove. **Recording that honestly
is the point; a remembered control described as a mechanism would be the same error one level
up.**

⛔ **IT IS A PERMISSIONS DECISION AND ONLY CARL MAKES IT. No agent sweeps its own seat.**

## Cadence

**After every Claude Code update, and otherwise periodically.**

⚠ **No fixed interval is written here on purpose.** Nothing enforces one, and **a stated
interval that lapses is a claim about the present that decays** — the exact defect class the
review exists to catch. **The trigger is stated instead of the schedule.**

## Worked example — 21 August 2026, the day this ran

**The method is not a proposal. It ran and demonstrated itself.**

- **All three seats independently confirmed** the `22` vs `25` protected-path count at
  `CLAUDE.md` line 85. Corroboration by three routes.
- **The version finding RESOLVED between the two runs.** The Architect reported `2.1.217`,
  *inferred from a version stamp in a transcript* because it had no shell. Carl updated. The
  Builder measured `2.1.238` directly. ⚠ **Same check, two seats, two methods — and the
  difference was real movement, not a discrepancy.**
- **The Builder REFINED rather than rubber-stamped.** The Architect reported `Artifact` as
  absent from `project-intelligence/`; the Builder found the *tool* absent but two Artifact
  *skills* listed in a references file, and said so. ⚠ **A second seat that only agrees is not a
  second seat.**

⛔ **The findings themselves are NOT restated here.** They live in
`live-work/references/architect-health-report-21-august.md`, which is **temporary and due for
deletion or promotion** once Carl has ruled.

## ⛔ What is unruled

**`Artifact`, `CronDelete` and `TaskUpdate` are Carl's to rule on and are UNRULED.** They are
recorded above as evidence of the sweep's failure pattern — **not as decisions, and not as
recommendations this file endorses.** Nothing in this protocol authorises any change to any
seat's permission surface.

## What this is not

**Not a substitute for the checkpoint review** (`checkpoint-review-protocol.md`), which reviews
*work*. This reviews the *machinery that governs the work*.

**Not a mandate to change anything.** The review produces findings and a comparison. **Carl
decides**, as everywhere else.
