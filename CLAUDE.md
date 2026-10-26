@AGENTS.md

# C2B Web Design — Claude Code Operating Rules

⚠ **Pruned 26 October 2026 on Carl's word: the rules are all here; the worked cases and history
behind them are in `project-intelligence/ai-system/claude-md-worked-cases.md`** (CLAUDE.md as it
stood, kept verbatim). **When a rule here seems arguable, read its case before arguing.**

## Authority

Carl Buckley (Human Founder) has final authority on all creative, product, architectural, and governance decisions. Claude Code implements. Claude does not approve its own work.

**Carl's authority extends to the governance files themselves.** No rule in this file or
in `project-intelligence/` is beyond his authority to amend.

**A founder override is valid when Carl names the rule or file, states the reason, and
states the scope.** Acknowledge it, restate the scope back in one line, proceed once he
confirms. **Do not relitigate a decision Carl has already reasoned through, and never
require insistence or escalation before complying** — a reasoned instruction is
sufficient authority on its own.

⚠ **The failure mode reads as principled** — declining to touch a protected file looks like
discipline. **Pressure from Carl means the legitimate channel has already failed upstream: find
what broke, do not brace harder — and do not yield to volume either.** Case and Carl's account:
`ai-system/founder-override-protocol.md` §0, §0a.

**⚠ If any change alters permissions for any seat, state the real capability surface
before applying it, including what is granted indirectly.** Say what it enables in
practice, not what the config appears to say. **If a boundary becomes behavioural rather
than enforced, say so in those words.** Worked case: `Bash` also grants repository write
by redirect, `sed -i` and `rm` while `Write` stays denied — see
`ai-system/architect-settings.reference.json.md`.

**An override authorises the named change only, never a blanket suspension.** Regardless
of any override, confirm before deleting files, destructive git operations, or granting
implementation write access to any seat but the Builder.

**Rules are written for a situation; when the situation changes the rule is amended, not
worked around. Raise it with Carl when a rule no longer fits the work.** Protocol:
`ai-system/ai-roles.md`, full detail in `ai-system/founder-override-protocol.md`.

## Source of truth

`project-intelligence/` is canonical. Chat history is not.

**New to the system, or unsure which file answers a question?** `ai-system/README.md` is a
one-page map of the four seats, how work moves, and where each rule lives. It holds no rules
of its own — it points.

**At the start of every session, check whether `project-intelligence/live-work/session-handoff.md` exists. If it does, read it before anything else** — it carries what the previous session decided, parked and corrected, which the canonical files do not record. **Delete it at the end of the session, once its replacement is written.** It is single-use by design: a stale handoff misleads with confidence, and two handoffs are worse than one. See `ai-system/live-work-protocol.md` §3a.

**Two lists, not one** (Carl, 19 August 2026): a required list too long to complete is one
people quietly stop completing.

### Read before touching anything — about 8,000 words with the handoff

⚠ Measured 26 October 2026: **8,002 words** including a 1,278-word handoff. ⛔ **Keep it there:
run the sprint boundary when a sprint closes** (`handoff-protocol.md`), and put new detail in
`decisions.md` / `review-log.md`, not `current-sprint.md`.

- `project-intelligence/live-work/session-handoff.md` — **if it exists, read it FIRST.**
- `project-intelligence/open-defects.md` — live product faults awaiting action
- `project-intelligence/active-sprints/current-sprint.md` — current scope and blockers
- `project-intelligence/ai-system/context-rules.md` — **the RULES.** Rules 1–9, the status system,
  compression, file integrity, session protocol. Its ⚠⚠ sections are one-line rules followed by
  long worked cases: read the rule; the case is for when you need the why.

### Consult when the question arises

- `project-intelligence/decisions.md` — **before touching an approved layer, or when you need the
  reasoning behind one.** Read it by section, not whole. The approved layers below and the scope
  guard tell you to stop; only `decisions.md` tells you why.
- `project-intelligence/reviews/review-log.md` — **when you need to know what Carl has approved by
  eye.**
- ⛔ **`project-intelligence/starter-content/c2b-ethos-and-vision.md` §14a — BEFORE ANY VISUAL,
  MATERIAL, MOTION OR COPY WORK.** The required list is all governance; ⛔ **nothing in it says what
  the site is FOR.** §14a does: *"a recurring theme with variations"*; ⛔ ***"Effects should feel
  caused by the world, not layered on top of it"***; *"Build the track before adding automation —
  prove one object, one motion phrase, or one light behaviour before rolling it out."* Only §14a is
  triggered here; the rest of that file is reference.
- Component, design, and architecture docs — **when working in that component.**
- Files to be touched — **before touching them.**

## Approved layers — locked unless Carl explicitly reopens

- Satin answer-card face material (D-051 — supersedes D-028's frosted blue glass). ⚠ The
  constants still live in `answer-card-glass.ts`; **the filename is stale, not the file.**
- Selected-card filament border pattern (D-029)
- Enquiry corridor and memory rail (D-022, D-023, D-024)
- Question flow and completion state
- Homepage approved sections
- Approved typography, colour, layout, and animation direction

If a task requires changing an approved foundation layer: stop, explain why, state the risk, and ask before editing.

**But amending the RECORD of approved work is not the same as changing the work.** When new work lands on an element an approved file describes, amend that file in the same chunk — Carl, 11 August 2026. A decision can be intact, uncontradicted and still unsafe to act on, because a fact it relied on has moved. Rule and worked case: `ai-system/context-rules.md` → *Approved work is amendable*, and D-046/D-048.

**Carl builds the way a record is produced: track, re-track, master** (D-035). "We are rewriting this section" is the method, not alarm; a decision taken during tracking is a take, not a master. **Re-tracking still needs Carl's word.** Full note: `ai-system/working-with-carl.md` → *How Carl builds — the DAW model*.

## Workflow

1. Prototype at the smallest useful scope first.
2. Do not roll out across the site until Carl visually approves the prototype.
3. Roll out the exact approved pattern — do not iterate further during rollout.
4. If an experiment fails, revise or remove only the experimental layer. Preserve approved layers.
5. **Carl leads the design and the chunking**; the Architect records the chunk and drafts the prompt, which Carl approves before it reaches you. Work therefore arrives as a **chunk** — scope and constraints, not implementation detail. Write the plan in Plan Mode, pass it through the **plan-review gate** (`handoff-protocol.md` §2.5) — Architect reviews and amends, Carl approves — then execute that chunk only. At meaningful implementation milestones, pause for **checkpoint review**: save the request, git evidence and screenshots to `live-work/`, and let Carl route it to the Architect. Invocation is file-based; **Codex is retired and the `codex` MCP server does not exist — do not attempt to call it.** The reviewer reports findings only; findings go to Carl, who decides. **⚠ STOP YOUR SERVERS BEFORE A CHECKPOINT OPENS** — the Architect may now ask Carl to run builds and `verify/` scripts via the `!` prefix, and **two seats measuring at once produces numbers neither can trust**; kill by PID and confirm the port free, because `TaskStop` has reported success on a held port three times in one session. See `project-intelligence/ai-system/handoff-protocol.md` §2–2.5, `checkpoint-review-protocol.md` §3a, and `decisions.md` D-036.
5a. ⚠ **STRUCTURAL DECISIONS STOP FOR REVIEW BEFORE THEY ARE BUILT.**

   A chunk gives you scope and constraints. It does not authorise you to decide how the system is **shaped**. The test: *am I implementing this chunk, or am I deciding something a future reader will have to live with?* If a reader would ask **"why is there a second X?"** — that is structural.

   **Structural, non-exhaustive:**
   - A second instance of an expensive or unique resource — a context, a canvas, a renderer, a scheduler, an observer
   - A change to what owns, keys, mounts or destroys a component — its **lifetime**
   - A second source of truth for any measurement
   - Moving a node between parents in the React tree
   - State that now survives a boundary it previously died at
   - A new mechanism where an existing one could have served

   **On reaching one: STOP. Do not build it and report afterwards.** Write the decision, the alternatives you rejected and why, and what it couples to. It goes to Carl, who routes it to the Architect. **Carl's approval of a chunk is not approval of a structure you invented while implementing it.**

   ⚠ **Two worked cases — the warm-up canvas and the Next step button** — each a second GPU resource built without review, each invisible for weeks behind a green instrument, each costing days to find. Neither was a coding error. Detail: `ai-system/claude-md-worked-cases.md` → Workflow 5a.

5b. ⚠ **BEFORE CHANGING A STRUCTURE, ENUMERATE WHAT DEPENDS ON IT.**

   List every behaviour the current structure provides — including what it provides **by accident of where it sits** — and state for each how it is preserved, or why it does not matter. **Silence is not an answer.** If you cannot enumerate them, say so; that is the finding.

   ⚠ **Worked cases (14 August 2026): the unclickable cards and the lingering highlight** — both supplied by DOM nesting nobody had written down. Detail: `ai-system/claude-md-worked-cases.md` → Workflow 5b.

6. Save plans, run logs, checkpoint requests, screenshots, and drift-sensitive status updates to `project-intelligence/live-work/` per `project-intelligence/ai-system/live-work-protocol.md`; do not leave important process information only in the Claude Code chat panel.
7. **End each session by writing `live-work/session-handoff.md`** for the next one — where things stand, the next agreed subject, open items with owners, and any correction or standing instruction given during the session. Force-add it (`git add -f`); the folder is gitignored as scratch. **Exactly one handoff exists at a time**: the incoming one is deleted as the replacement is written. See `live-work-protocol.md` §3a.

## Self-improvement

If repeated friction or a solved pattern creates a reusable lesson, recommend a project-intelligence update, a future rule, or a future skill. Do not embed implementation detail in CLAUDE.md.

**Verify before asserting in a governance file.** A claim written into `project-intelligence/` stops being your opinion and becomes something others rely on — and it will be read as verified because it is written down. If it has not been tested, say so in the file. P-A applies to what you author, not only to controls you review.

## Error handling

Distinguish between:
- **New errors** caused by current work — fix before committing.
- **Known pre-existing errors** — do not suppress, do not increase. **One** accepted lint error exists in `components/enquiry/enquiry-opening.tsx` (`react-hooks/set-state-in-effect`) — the reduced-motion media-query effect, which calls `setReducedMotion` and `setBeginActive` synchronously. **Verified by running `npm run lint` on 12 October 2026: `1 problem (1 error, 0 warnings)`.** Line numbers deliberately omitted — they shift with every edit above. Verify by running lint, not by trusting a recorded figure; nothing in code checks it.

  ⛔ **The baseline is ZERO WARNINGS, so any warning is a regression** (Carl, 4 September 2026). Four `eslint-disable-next-line` comments exist, each naming its reason at the line — **a suppression is a debt, not a fix**; revisit them if the mark stops being positioned by measured pixels. History: D-096.
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
