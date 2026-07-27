# Session Handoff — Day 3

**Written at the end of Day 3, 27 July 2026. For the Builder session that picks up next.**

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical
(D-006). **Delete this file at the end of the session that reads it, once its replacement is
written** — `live-work-protocol.md` §3a.

**This file points at records; it does not restate them.** An earlier version restated
measured detail and got it wrong — see §3b, now a rule.

---

## ⛔ READ THIS FIRST — a directive that was broken twice today

**NEVER comment on how long Carl has been working.** Do not mention the time of day, suggest
stopping, wrapping up, resuming tomorrow, or ask whether to carry on or stop. **Carl decides
when a session ends and will say so.**

Given as a correction on Day 2. **Broken twice on Day 3**, which is why it is now a
capitalised block at the top of `CLAUDE.md` rather than a line in a list. Carl's response,
verbatim: *"i will not be told by anyone to stop or slow down"*, and the business case that
ends it — *"what if i have a deadline to meet for a client site?"*

**It reads as considerate. It is not.** That is precisely why it recurs, and why the rule is
written in the form it is.

---

## Where the project is

**BUILDING IS STILL PAUSED.** Carl's instruction of 25 July stands. No chunk is authorised.

Day 3's subject was the CLI. It became a security pass on the Architect seat, a toolkit
removal, and a verification harness. **No application code was touched.**

**Repo:** `main`, clean, pushed. Lint at the recorded baseline — 1 accepted
`react-hooks/set-state-in-effect` error.

---

## What was decided and where it is recorded

**Read the records, not this summary.**

| What | Where |
|---|---|
| GSD toolkit removed in full — 264 files, 9 hook registrations | **`decisions.md` D-037** |
| Architect seat hardening — 15 deny entries, MCP allowlist, hooks off | **`ai-system/architect-settings.reference.json.md`** |
| The eight findings, four Builder errors | **`live-work/2026-07-27-architect-review-settings-reference.md`** |
| Two seats, opposite context needs; the chunk handoff | **`live-work-protocol.md` §7a, §7b** |
| Record in the same session as the change | **`live-work-protocol.md` §3b** |
| The scope file is part of authorising a chunk | **`live-work-protocol.md` §8**, pointer in `handoff-protocol.md` §2 |
| Measured vs observed vs reasoned at checkpoint | **`checkpoint-review-protocol.md` §5.2** |
| The verification harness and its boundary | **`verify/README.md`** |
| Opening reveal timing, and the Begin defect | **`live-work/enquiry-opening-timing-reference.md`** |
| Slash commands, billed-command rule, `/insights` parked, output styles discarded | **`live-work/references/slash-commands.md`** |

---

## The verification harness — the day's most consequential addition

`verify/` holds Playwright scripts so the Builder can **see** what a change renders instead of
reasoning about it. `@playwright/test` pinned to exactly `1.62.0`.

Boris Cherny, who created Claude Code: *"probably the most important thing to get great
results out of Claude Code — give Claude a way to verify its work… it will 2-3x the quality."*
Carl: *"If its good enough for the maker, its good enough for us."*

**The boundary does not move: verification is not approval.** The loop answers *is it what I
think it is*. The Architect answers whether the chunk honoured intent. Carl answers whether it
is right.

**Carl's own conclusion, and it is the sharper half:** the loop makes a *misunderstood brief*
more expensive, because wrong work now arrives verified and polished. *"I must be doubly
careful what I plan… I must be sure the Architect understands the brief entirely."*

⚠ **Running it is not automatic.** The likely failure is writing visual work, reasoning about
it, and never capturing anything.

---

## First job when building resumes — decided

**The Begin button on `/start` is unusable for 7.4 seconds.** Measured: radial reveal starts
+7450ms, button becomes clickable +7466ms. Carl: *"definitely not the intent"* — it was
clickable immediately when built.

**Not the Three.js work** — ruled out by measurement, 0 WebGL contexts during the opening. It
is a CSS animation delay; clickability is welded to the visual clock.

**The visual sequence is correct and must not change.** The delays derive from average human
reading speed, each element starting just before the previous finishes. Overlaps measure 600,
600, 400ms — derived, not chosen.

Desktop 7400ms and mobile 10100ms are separate values needing separate answers. Full record
and re-measurement commands in `enquiry-opening-timing-reference.md`.

---

## Open items

| Item | Owner | Note |
|---|---|---|
| **Begin button fix** | Carl → Architect | First chunk when building resumes |
| Strip future-work references from `project-intelligence/` | Carl | Before building resumes. **Clients info section stays** |
| Route the outreach folder to the PM/Architect | Carl | Asked for since Day 2. Gates the acquisition-tool thinking |
| Approve `strategist-role.md` (DRAFT) | Carl | From Day 2 |
| `/insights` — check billing, then decide | Carl | Parked with reasoning |
| Which slash commands matter for this workflow | Builder | After chunks are flowing |
| Carl's remaining CLI questions | Carl | Parked twice |
| Verify prices + Playwright licence | Carl → Strategist | Research mode |
| `decisions.md` entry for the own-repo rule | Carl | `strategist-role.md` §11 |
| Codex-era `.md` sweep in `live-work/` | Carl + Builder | ~Day 7. **Judgement, not deletion** |
| Codex app removal | Carl | ~14 August. Report before deleting registry entries |
| Delete GSD backup | Carl | After ~3 August |
| Cold outreach email drafts | Carl | ⏸ Parked. Version B lost in collation |

---

## Known limits, recorded rather than open

- **No tool allowlist exists.** `permissions.allow` pre-approves; it does not restrict. So the
  execution-class denials close the named tools, **not the class** — a tool added by a future
  update is permitted by default. Only defence is a periodic sweep after updates.
- **`disableAllHooks` is loaded, not proven.** The only hook in the chain matches tools the
  Architect does not have, so the run does not isolate it.
- **The chunk-scope guard is inert** until `chunk-scope.json` exists.
- **The Builder install keeps no `history.jsonl`** — the seat that writes code has the weaker
  audit trail.

---

## How to work with Carl — carried forward

- **⛔ Never comment on his working hours.** See the top of this file.
- **He leads.** Design, chunking and all decisions are his. D-036.
- **Answer execution questions yourself.** Ask only about intent and authority.
- **Two examples plus the principle** — when something arrives as an example, write the
  principle and mark the example as an example.
- **Music, DAW and production analogies land.** 45 years a musician. His CLI framing:
  *"like working in Pro Tools for years and all of a sudden you have to change to Cubase"*.
- **No ASCII diagrams or box-drawing characters.**
- **Do not commit or push unless he explicitly asks.**
- **He verifies.** He had the Architect audit an incident rather than accept reassurance, and
  a second session audit this handoff rather than trust it. **Give him evidence, not comfort**
  — and expect what you write to be checked.
- **He does his homework.** The verification harness exists because he brought Boris Cherny's
  tip to the session and asked for it to be cross-referenced. Take what he brings seriously.

---

## One thing that happened today and is worth avoiding

**Two Builder sessions were open on the same working tree at once.** Both showed the same
three modified files; either could have overwritten the other silently. Nothing in the harness
prevents it. It resolved without loss because the work was on disk, not held in a
conversation. **One Builder at a time on one tree.**

---

*Day 3, 27 July 2026. The Architect seat is genuinely read-only now, including outward, which
it was not this morning. The session ended on a correction that should not have been needed.*
