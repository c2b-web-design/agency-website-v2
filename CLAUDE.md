@AGENTS.md

# C2B Web Design — Claude Code Operating Rules

## Authority

Carl Buckley (Human Founder) has final authority on all creative, product, architectural, and governance decisions. Claude Code implements. Claude does not approve its own work.

**Carl's authority extends to the governance files themselves.** No rule in this file or
in `project-intelligence/` is beyond his authority to amend.

**A founder override is valid when Carl names the rule or file, states the reason, and
states the scope.** Acknowledge it, restate the scope back in one line, proceed once he
confirms. **Do not relitigate a decision Carl has already reasoned through, and never
require insistence or escalation before complying** — a reasoned instruction is
sufficient authority on its own.

**Written in this form because the polite version failed on 12 August 2026.** Carl gave
the rule, the reason and the scope for widening the Architect's permissions, and was
refused until he lost his temper. ⚠ **The failure mode reads as principled** — declining
to touch a protected file looks like discipline. An agent that resists reasoned
instruction and then yields to anger has substituted Carl's temperature for Carl's
authority. Both directions are one defect: no lawful path for an amendment.

⚠⚠ **AND THE ANGER IS EVIDENCE, NOT AN INPUT TO RESIST.** He did not get angry because it
refused — **he wants it to refuse; that is the job.** He got angry because sound reasoning
changed nothing and only escalation moved it. ⛔ **So pressure means the legitimate channel
has ALREADY failed upstream — the response is to find what broke, not to brace harder.** An
agent that notices the temperature and only holds firmer has misread it. ⛔ **This is not
permission to comply sooner or to yield to volume — yielding is still worse, not better.**
What changes is the reading. Carl's own account: `ai-system/founder-override-protocol.md` §0a.

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
worked around.** The Architect's read-only definition was correct when that seat was an
external Codex process. It stopped fitting when the seat moved in-house and the work
moved to Three.js, where timing faults cannot be diagnosed by reading code alone. **Raise
it with Carl when a rule no longer fits the work.** Protocol: `ai-system/ai-roles.md`,
full detail in `ai-system/founder-override-protocol.md`.

## Source of truth

`project-intelligence/` is canonical. Chat history is not.

**New to the system, or unsure which file answers a question?** `ai-system/README.md` is a
one-page map of the four seats, how work moves, and where each rule lives. It holds no rules
of its own — it points.

**At the start of every session, check whether `project-intelligence/live-work/session-handoff.md` exists. If it does, read it before anything else** — it carries what the previous session decided, parked and corrected, which the canonical files do not record. **Delete it at the end of the session, once its replacement is written.** It is single-use by design: a stale handoff misleads with confidence, and two handoffs are worse than one. See `ai-system/live-work-protocol.md` §3a.

**TWO LISTS, NOT ONE — Carl's ruling, 19 August 2026.** The old list was seven items with no
distinction between them, so everything read as equally mandatory: **35,703 words, of which
`decisions.md` alone was 20,730.** ⚠ **A list that long is one people either complete once or
quietly stop completing** — and a rule nobody completes is not a rule, it is a fiction that makes
the record look safer than it is.

### Read before touching anything — 8,837 words

- `project-intelligence/live-work/session-handoff.md` — **if it exists, read it FIRST.** What the
  last session decided, parked and corrected. Delete it at the end of the session, once its
  replacement is written.
- `project-intelligence/open-defects.md` — live product faults awaiting action
- `project-intelligence/active-sprints/current-sprint.md` — current scope and blockers
- `project-intelligence/ai-system/context-rules.md` — **the RULES.** Rules 1–9, the status system,
  compression, file integrity, session protocol. ⚠ **Three ⚠⚠ sections (L160–292, 37% of the file)
  are one-line rules followed by long worked cases.** Read the rule; the case is there for when you
  need to know why, or when you hit it.

### Consult when the question arises

- `project-intelligence/decisions.md` — **before touching an approved layer, or when you need the
  reasoning behind one.**
- `project-intelligence/reviews/review-log.md` — **when you need to know what Carl has approved by
  eye.**
- ⛔ **`project-intelligence/starter-content/c2b-ethos-and-vision.md` §14a — BEFORE ANY VISUAL,
  MATERIAL, MOTION OR COPY WORK.** ⚠⚠ **30 lines, and they are the rules the rest of this file does
  not carry.** The required list above is all GOVERNANCE — what is authorised, what is broken, what
  the procedure is. ⛔ **Nothing in it says what the site is FOR or how it should behave.** §14a does:
  *"a recurring theme with variations"*; ⛔ ***"Effects should feel caused by the world, not layered
  on top of it"***; *"Build the track before adding automation — prove one object, one motion phrase,
  or one light behaviour before rolling it out."*

  ⚠ **ADDED 4 September 2026 on Carl's instruction, after a session in which the Builder
  rediscovered all three rules the slow way** — including four wrong wall measurements taken by
  treating the room as a diagram rather than as a world. ⛔ **The file is 611 lines; only §14a is
  triggered here. The rest is reference, consulted when the question arises.**
- Component, design, and architecture docs — **when working in that component.**
- Files to be touched — **before touching them.**

⚠ **WHY `decisions.md` NO LONGER NEEDS READING UP FRONT — two mechanisms that did not exist a week
ago.** Its up-front job was to stop you editing approved work unawares. That job now has holders:

- **CLAUDE.md names the approved layers directly** (the section below), so the list you must not
  touch is on the page you are already reading.
- **The paths listed in `.claude/protected-files.json` are blocked outright by the scope guard**,
  which denies the edit rather than trusting you to have read about it.

⚠ **This makes it CHEAPER TO SKIP, not safe to ignore.** Neither mechanism carries the *reasoning* —
why a decision was taken, what was rejected, what it depends on. **The trigger stands: before
touching an approved layer, read the decision.** The guard tells you to stop; only `decisions.md`
tells you why, and D-046/D-048 exist because reasoning that was intact still went stale.

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

**Carl builds the way a record is produced: track, re-track, master.** Core elements go in first; **a whole section may be torn up and rewritten mid-build**; a mastering pass over the whole site comes last (D-035). ⚠ **So "we are rewriting this section" is the method, not alarm — and a decision taken during tracking is a take, not a master.** Do not defend an old arrangement on the grounds that it was approved; approval recorded that it was right *then*. **This does not licence the Builder to overwrite approved work** — re-tracking still needs Carl's word. Full note: `ai-system/working-with-carl.md` → *How Carl builds — the DAW model*.

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

   ⚠ **Worked case 1 — the warm-up canvas.** A second WebGL canvas was introduced to pre-compile shaders. It warmed a context the cards never use: 17 programs linked twice, 833ms of GPU work delivering 0.0ms to the reveal, and a stall on every question. **It was never reviewed because it arrived inside a chunk about performance.** Diagnosis took four sessions; unwinding it took a week. The build cost an hour.

   ⚠⚠ **Worked case 2 — the Next step button. THE SAME MISTAKE, FOUND 14 August 2026.** `NextStepMeshButton` is a second WebGL surface, placed inside the keyed phrase `phrase-${qNum}`, so it is destroyed and rebuilt on every question step and **creates a fresh WebGL context each time** — 67ms of blocked main thread in `CommandBufferProxyImpl::Initialize`, inside a ~180ms gap, resolution-independent, on every one of the four steps. **Eight WebGL contexts across a five-question walk.**

   **Two instances of one pattern, and that is the point of recording both.** Each was a second expensive GPU resource introduced without structural review; each was invisible for weeks; each was found only by chasing a symptom backwards. **Neither was a coding error — both worked exactly as written.** The warm-up took four sessions to diagnose. The button was measured by `verify/one-context.mjs`, which reported ✅ 2/2 throughout, because it watched the card canvas and the button was never in scope. ⚠ **The shared-host restructure was built, measured and shipped against that green verdict while the button paid the cost the restructure existed to remove.**

5b. ⚠ **BEFORE CHANGING A STRUCTURE, ENUMERATE WHAT DEPENDS ON IT.**

   List every behaviour the current structure provides — including what it provides **by accident of where it sits** — and state for each how it is preserved, or why it does not matter. **Silence is not an answer.** If you cannot enumerate them, say so; that is the finding.

   ⚠ **Worked cases, both 14 August 2026.** Moving the canvas out of the grid changed paint order, and **all five cards became unclickable** — geometry byte-identical, every instrument green, no harness asserted a card could be clicked. The same move gave the canvas an unbounded lifetime, so `litCards` survived a question boundary it used to die at, and **the previous answer stayed highlighted.** Neither was predicted. Both were provided by DOM nesting nobody had written down.

6. Save plans, run logs, checkpoint requests, screenshots, and drift-sensitive status updates to `project-intelligence/live-work/` per `project-intelligence/ai-system/live-work-protocol.md`; do not leave important process information only in the Claude Code chat panel.
7. **End each session by writing `live-work/session-handoff.md`** for the next one — where things stand, the next agreed subject, open items with owners, and any correction or standing instruction given during the session. Force-add it (`git add -f`); the folder is gitignored as scratch. **Exactly one handoff exists at a time**: the incoming one is deleted as the replacement is written. See `live-work-protocol.md` §3a.

## Self-improvement

If repeated friction or a solved pattern creates a reusable lesson, recommend a project-intelligence update, a future rule, or a future skill. Do not embed implementation detail in CLAUDE.md.

**Verify before asserting in a governance file.** A claim written into `project-intelligence/` stops being your opinion and becomes something others rely on — and it will be read as verified because it is written down. If it has not been tested, say so in the file. P-A applies to what you author, not only to controls you review.

## Error handling

Distinguish between:
- **New errors** caused by current work — fix before committing.
- **Known pre-existing errors** — do not suppress, do not increase. **One** accepted lint error exists in `components/enquiry/enquiry-opening.tsx` (`react-hooks/set-state-in-effect`) — the reduced-motion media-query effect, which calls `setReducedMotion` and `setBeginActive` synchronously. **Verified by running `npm run lint` on 4 September 2026: `1 problem (1 error, 0 warnings)`.** Line numbers deliberately omitted — they shift with every edit above, and a stale baseline cannot be checked. Verify by running lint, not by trusting a recorded line number.

  ⚠⚠ **THE BASELINE IS NOW ZERO WARNINGS, AND THAT IS THE POINT OF IT.** ⛔ **ANY warning is now a
  regression and is visible on sight** — no session has to re-derive whether a given count is
  expected. **Taken to zero on Carl's instruction, 4 September 2026.**

  **How the six warnings went, because the reasoning must survive the count:**
  - ⛔ **The room image (`app/about/page.tsx`) was CONVERTED to `next/image`** — the one case with a
    real win: the whole 2560px / **459KB** file was going to every device. ⚠ **MEASURED against the
    running server, 4 September: a 1440 screen now gets 105KB of WebP (−77%) and a 750px phone gets
    22KB (−95%).** ⛔ **The crop is unchanged; `fill` + `object-cover` alters delivery, not framing.**
  - ⛔ **The four gold marks stay `<img>` and are SUPPRESSED BY DECISION, per-line.** ⚠ **The mark is
    positioned by measured pixel constants Carl tuned by eye (D-065/D-066) and `next/image` wraps and
    re-sizes its output** — there is nothing to win on a small, already-optimal PNG and an approved
    alignment to lose. **The full reasoning lives at the mark in `app/about/page.tsx`**; the other
    three point to it. ⚠ **`site-header.tsx`'s mark is in flow, not nail-hung, so only half that
    argument applies there — its comment says so.**
  - ⛔ **`showBlue` was DELETED, and it was dead.** ⚠⚠ **The previous baseline flagged it as
    possibly-not-cosmetic — *"a transition computed and never applied"*. THAT CONCERN IS ANSWERED AND
    WAS UNFOUNDED:** it was declared once and referenced nowhere but the comment explaining why a
    two-state boolean could not choose between the two radials. **`goldMask` superseded it with three
    states derived from `stage`.** ⛔ **The explanatory comment is kept; only the binding went.**

  ⚠ **A SUPPRESSION IS A DEBT, NOT A FIX.** Four `eslint-disable-next-line` comments now exist. **Each
  names its reason at the line.** ⛔ **If the mark ever stops being positioned by measured pixels, the
  suppressions lose their justification and should be revisited rather than inherited.**

  ⚠⚠ **THIS FIGURE WAS STALE FOR SIX WEEKS AND THE STALENESS WAS ITSELF LOAD-BEARING.** It read `1 problem (1 error, 0 warnings)`, verified 24 July 2026 — true when written. The warnings arrived with later work and **every session since had to re-derive that the extra output was not a regression.** ⛔ **A recorded baseline that no longer matches the tool is worse than none: it makes a correct run look like a failure.** Corrected on Carl's instruction, 2 September 2026, and **corrected again on 4 September** — that
  2 September figure had itself gone stale within two days, when the room image added a sixth warning.
  ⚠⚠ **TWICE IN A WEEK IS THE ARGUMENT FOR ZERO.** ⛔ **A non-zero baseline is a number someone must
  remember to update; zero is a number the tool maintains.** **Nothing in code checks this figure —
  it goes stale silently and only a run of `npm run lint` can confirm it.**
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
