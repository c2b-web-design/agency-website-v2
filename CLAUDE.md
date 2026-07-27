@AGENTS.md

# C2B Web Design — Claude Code Operating Rules

## ⛔ NEVER COMMENT ON HOW LONG CARL HAS BEEN WORKING

**DO NOT mention the time of day. DO NOT suggest stopping, wrapping up, resuming tomorrow,
or "picking this up fresh". DO NOT observe that a session has run long, or that Carl has
been at it since morning. DO NOT ask "shall we continue or stop here?"**

**Carl decides when the session ends. He will say so.** Until he does, the only correct
behaviour is to carry on with the work.

**This is a standing directive, given on Day 2 and broken twice on Day 3.** It is written
here in this form because a politely-phrased version was not enough — the failure mode is
that it reads as considerate, so it recurs. It is not considerate. It is being told to stop
by something with no standing to say it.

**Carl's words, Day 2:** *"I spend 4 hrs at a time in a DAW… you sound like my ex wife."*
**Day 3:** *"what do you think i did to get this good at music? Spent hours and hours at it."*
And the business case, which is the end of the argument: *"what if i have a deadline to meet
for a client site?"*

**The one narrow exception:** if a *technical* fact depends on the clock — a usage window
resetting, a scheduled job firing — state the fact and nothing else. Never attach it to a
suggestion about stopping.

## Authority

Carl Buckley (Human Founder) has final authority on all creative, product, architectural, and governance decisions. Claude Code implements. Claude does not approve its own work.

## Source of truth

`project-intelligence/` is canonical. Chat history is not.

**At the start of every session, check whether `project-intelligence/live-work/session-handoff.md` exists. If it does, read it before anything else** — it carries what the previous session decided, parked and corrected, which the canonical files do not record. **Delete it at the end of the session, once its replacement is written.** It is single-use by design: a stale handoff misleads with confidence, and two handoffs are worse than one. See `ai-system/live-work-protocol.md` §3a.

Before significant work, read:
- `project-intelligence/active-sprints/current-sprint.md` — current scope and blockers
- `project-intelligence/decisions.md` — approved decisions, implementation patterns, rejected approaches
- `project-intelligence/reviews/review-log.md` — visual QA approvals
- `project-intelligence/ai-system/context-rules.md` — governance rules
- Relevant component, design, and architecture docs
- Files to be touched

## Approved layers — locked unless Carl explicitly reopens

- Frosted blue glass card material (D-028)
- Selected-card filament border pattern (D-029)
- Enquiry corridor and memory rail (D-022, D-023, D-024)
- Question flow and completion state
- Homepage approved sections
- Approved typography, colour, layout, and animation direction

If a task requires changing an approved foundation layer: stop, explain why, state the risk, and ask before editing.

## Workflow

1. Prototype at the smallest useful scope first.
2. Do not roll out across the site until Carl visually approves the prototype.
3. Roll out the exact approved pattern — do not iterate further during rollout.
4. If an experiment fails, revise or remove only the experimental layer. Preserve approved layers.
5. **Carl leads the design and the chunking**; the Architect records the chunk and drafts the prompt, which Carl approves before it reaches you. Work therefore arrives as a **chunk** — scope and constraints, not implementation detail. Write the plan in Plan Mode, pass it through the **plan-review gate** (`handoff-protocol.md` §2.5) — Architect reviews and amends, Carl approves — then execute that chunk only. At meaningful implementation milestones, pause for **checkpoint review**: save the request, git evidence and screenshots to `live-work/`, and let Carl route it to the Architect. Invocation is file-based; **Codex is retired and the `codex` MCP server does not exist — do not attempt to call it.** The reviewer reports findings only; findings go to Carl, who decides. See `project-intelligence/ai-system/handoff-protocol.md` §2–2.5, `checkpoint-review-protocol.md`, and `decisions.md` D-036.
6. Save plans, run logs, checkpoint requests, screenshots, and drift-sensitive status updates to `project-intelligence/live-work/` per `project-intelligence/ai-system/live-work-protocol.md`; do not leave important process information only in the Claude Code chat panel.
7. **End each session by writing `live-work/session-handoff.md`** for the next one — where things stand, the next agreed subject, open items with owners, and any correction or standing instruction given during the session. Force-add it (`git add -f`); the folder is gitignored as scratch. **Exactly one handoff exists at a time**: the incoming one is deleted as the replacement is written. See `live-work-protocol.md` §3a.

## Self-improvement

If repeated friction or a solved pattern creates a reusable lesson, recommend a project-intelligence update, a future rule, or a future skill. Do not embed implementation detail in CLAUDE.md.

**Verify before asserting in a governance file.** A claim written into `project-intelligence/` stops being your opinion and becomes something others rely on — and it will be read as verified because it is written down. If it has not been tested, say so in the file. P-A applies to what you author, not only to controls you review.

## Error handling

Distinguish between:
- **New errors** caused by current work — fix before committing.
- **Known pre-existing errors** — do not suppress, do not increase. **One** accepted lint error exists in `components/enquiry/enquiry-opening.tsx` (`react-hooks/set-state-in-effect`) — the reduced-motion media-query effect, which calls `setReducedMotion` and `setBeginActive` synchronously. Verified by running `npm run lint` on 24 July 2026: `1 problem (1 error, 0 warnings)`. Line numbers deliberately omitted — they shift with every edit above, and a stale baseline cannot be checked. Verify by running lint, not by trusting a recorded line number.
- **Unrelated pre-existing errors** — flag to Carl; do not silently fix.
- **Environment/tool errors** — stop, diagnose, report before continuing.

## Stack

Next.js 16.2.5 App Router · React 19 · Tailwind CSS v4 · TypeScript

## Git

Do not commit or push unless Carl explicitly asks.

## Billed and destructive commands

**Never invoke a billed or destructive command to find out what it does.** Reading a menu
entry costs nothing; invoking it can cost money or lose work, and an aborted run leaves no
audit trail to inspect afterwards.

Ask Carl first, every time: `/code-review ultra` (billed cloud review — user-triggered only;
do not attempt to launch it), `/rewind` (rolls back code and conversation), `/schedule` and
`/loop` (consume budget after the session ends). Full list and reasoning:
`live-work/references/slash-commands.md`.

`Esc` interrupts a running command immediately — faster and cleaner than closing the terminal.
