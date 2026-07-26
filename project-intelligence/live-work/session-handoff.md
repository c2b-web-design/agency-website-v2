# Session Handoff — end of Day 2

**Written 26 July 2026, 19:14 BST. For the Builder session that picks up on Day 3.**

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical
(D-006); this file and the repo are.

---

## Where the project is

**BUILDING IS PAUSED.** Carl's instruction, 25 July: *"that's a design brief. building is
paused."* No chunk is authorised. Do not start implementation work.

**Day 2 of a seven-day governance rebuild.** Carl's framing: *"This is a new way of working
for me… it is important that I have understanding before we dive back in to building."*
Faster than seven days is fine; the point is comprehension, not the calendar.

**Repo:** `main` at `0a644d8`, working tree clean, pushed. Lint at the recorded baseline —
**1 problem**, the accepted `react-hooks/set-state-in-effect` error in
`components/enquiry/enquiry-opening.tsx`.

---

## Day 3 is the CLI — Carl has questions

**This is the one committed item for next session.** Parked from Day 2: *"we will park the
CLI till Day 3."*

Context so it does not have to be re-derived:

- The read-only Architect runs from `~/.claude-architect/` via `launch-architect.cmd`.
  Deny list verified 26 July: `Edit`, `Write`, `NotebookEdit`, `Bash`, `mcp__codex`.
- Carl launched and used it for the first time on 25 July. It oriented correctly from one
  sentence pointing it at `architect-role.md`.
- His mental model, and it is a good one: **"like working in Pro Tools for years and all of
  a sudden you have to change to Cubase."** Same outcomes, different furniture. Not a new
  concept to learn — a new layout.
- Practical friction already met: two input surfaces in one VS Code window (mouse-click to
  switch — `Ctrl+Esc` is captured by Windows for the Start menu); text pastes into a file,
  never into a folder.

---

## What was completed on Day 2

### 1. Both Day 1 loose ends closed — commits `2446389`, `e7f1665`

**The Architect's git gap (was ⏸ OPEN in `live-work-protocol.md` §5a) — RESOLVED.**

The CLI **`!` prefix** runs a command in Carl's own shell and renders the output into the
Architect's session. `Bash` stays denied, so the Architect proposes and Carl executes:
capability never enters the Architect's surface, only output crosses. **Surfaced by the
Architect itself, unprompted, in its first live session.**

Recorded in five files: `live-work-protocol.md` §5a, `architect-role.md` §2, `ai-roles.md`,
`checkpoint-review-protocol.md` item 7, and DL-7 in `workflow-redesign-research.md`.

Method note folded into DL-7 and worth keeping: three routes were evaluated by research; the
answer came from **running the thing**. P-A generalises further than it was written.

**The stale anchor in `live-work/current-status.md` — CORRECTED.** Two claims verified
against git before being changed: work was *not* uncommitted (F-2 fix is in `cb42350`), and
the q5proto decision entry was *not* outstanding (closed 25 July by D-035). Original text
preserved.

**A lint baseline break of mine, found en route.** `chunk-scope-guard.js` used `require()`,
which the project's ESLint config forbids — lint had been at **3 errors since 25 July** and I
had not noticed, because I did not re-run lint after adding the hook. Fixed by excluding
`.claude/hooks/**` in `eslint.config.mjs` rather than rewriting an attack-tested control. The
guard was re-attacked afterwards (out-of-scope DENIED, protected DENIED, in-scope allowed).

*Lesson recorded in `live-work-protocol.md` §8: adding a file to the repo is a code change
even when it is tooling. Run lint.*

### 2. The Strategist layer — commits `1185aa2`, `0a644d8`

**A fourth surface, pointed at problem space rather than solution space.** Carl, the
Architect and the Builder are all pointed at the artefact; none was looking at the business
the site serves.

**Governing file: `project-intelligence/ai-system/strategist-role.md`.** Status **DRAFT** —
Carl's verdict was *"Role is good for now, it may develop but not exceed its mandate."* Read
it before advising on anything Strategist-related; the summary below is not a substitute.

Key points a fresh session needs:

- **Information only. No authority over the Architect or Builder, and no channel to either.**
  Its output is input, not instruction. Carl carries everything both ways.
- **"Implementation" means touching the codebase, nothing else.** In scope: copy drafts,
  research, options, costings, reports. Out: code, config, layout, placement, construction.
  **The line is words and intent, yes; placement and construction, no.**
- **Memory holds context, never conclusions.** Memory cannot be audited, so nothing
  load-bearing may live in it. D-006 extended to a new surface.
- **Its output lives OUTSIDE this repo**, at `C:\Users\Carl Buckley\C2B-Strategist\`. D-035
  makes this repo a client template; business material that never enters never needs
  stripping.
- **§11 records a standing constraint:** anything the Builder builds gets **its own
  repository**. Probably wants a `decisions.md` entry eventually — Carl's call, not taken.

**Currently filled by a Claude Project ("CP") in the browser**, configured on Day 2 with no
files attached. Deliberate: it gets top-level build context only, and uploads go stale
silently.

---

## The Strategist folder — first real output

`C:\Users\Carl Buckley\C2B-Strategist\outreach\` — **outside the repo. Read it by path if
Carl points you at it; it is not in git.**

Five sessions of research on customer acquisition, compressed into one report.

**Start with `2026-07-26-REPORT-prospecting-and-site-assessment.md`.** It stands alone and
supersedes the individual tooling notes. Everything else in the folder is the evidence
behind it.

**`pm-actions.md` holds 19 items, all `pending`. Nothing is approved.** Items 5 and 6 are
superseded — Firecrawl was withdrawn by its own author within hours after Carl asked about
Playwright.

**Carl has said explicitly he wants to discuss this folder with me wearing the PM/Architect
hat**: *"I will point you at the files and we will take it to the next level."* Not yet
done. When it happens, read the files cold rather than relying on any summary.

**My PM assessment, given at the end of Day 2 and worth carrying forward:**

- The method works and the results are good — but **the day produced zero decisions**, and
  the next move is routing what exists, not more research.
- **Open question 3 gates more than it appears to.** "Does the showcase piece happen before
  outreach or alongside it" is not scheduling: the entire give-it-away email posture exists
  *because* there is no portfolio. Build the showcase first and that argument weakens.
- Three Builder notes are already in the folder flagging things the Strategist could not
  see: **Playwright is already in this repo** (used 24 July to verify the F-2 fix), the
  Builder and Architect **already read images** so the vision step may need no paid service,
  and **Playwright's licence is unverified by both of us.**

---

## Open items

| Item | Owner | Note |
|---|---|---|
| **CLI questions** | Carl | **Day 3's committed subject** |
| Approve `strategist-role.md` (DRAFT) | Carl | Approvals are Carl's alone |
| Route the outreach folder to the PM/Architect | Carl | He has asked for this discussion explicitly |
| Verify prices + Playwright licence | Carl → Strategist in Research mode | Narrow closed questions. Agreed approach: Web search for exploration, **Research mode for verification** |
| `decisions.md` entry for the own-repo rule | Carl | `strategist-role.md` §11 |
| Codex-era `.md` sweep in `live-work/` | Carl + Builder | Planned for ~Day 7. **Judgement, not deletion** — some hold reasoning worth keeping |
| Codex app removal | Carl | ~14 August 2026. Uninstall via Settings, survey registry, **report before deleting anything** |
| Cold outreach email drafts | Carl | ⏸ **PARKED.** Version A only; version B and the reasoning were lost in collation |

---

## How to work with Carl — carried forward, still current

- **He leads.** Design, chunking and all decisions are his. The Architect records and drafts;
  the Builder implements. D-036.
- **Answer execution questions yourself.** Ask only about intent and authority. His words:
  *"to say I am out of my depth would be an understatement."*
- **Do not tell him when to stop working.** Corrected on Day 2 after three prompts in twenty
  minutes: *"I spend 4 hrs at a time in a DAW… you sound like my ex wife."* He knows when he
  is done.
- **Two examples plus the principle.** Agreed on Day 2 after I over-fitted an illustration
  into a governance rule. **When something arrives as an example, write the principle and
  mark the example as an example** — in a file it becomes binding.
- **Music, DAW and production analogies land.** 45 years a musician.
- **No ASCII diagrams or box-drawing characters** — they render as garbled text.
- **Do not commit or push unless he explicitly asks.**

---

*Day 2 ended 19:14 BST, 26 July 2026. Repo clean at `0a644d8`. Beer o'clock.*
