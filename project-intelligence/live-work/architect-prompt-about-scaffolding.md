# Prompt for the Architect — the `/about` scaffolding chunk

**Written by the Builder (CB), 31 August 2026, on Carl's instruction.** Carl approves this before
it reaches the Architect.

**What this file is:** the synopsis half of Carl's four-step instruction — *"a prompt for the CA…
The prompt should cover what we are trying to achieve, basically a synopsis of this discussion."*
The Plan is a separate artefact and follows this.

---

## 1. What you are being asked to do

Review and evaluate the Builder's Plan for the `/about` **scaffolding** chunk, with any suggestions
you have. Findings only — you do not approve, and you do not rewrite the plan (`handoff-protocol.md`
§2.5, D-036). Carl reads your findings alongside the Builder and decides.

⚠ **Present your findings in your own window, in full and ready to copy.** Carl carries them across
to `live-work/architect-plan-response.md`. Do not write that file yourself — the seat may lack write
access, and custody through Carl is what keeps the review's independence visible in the record.

---

## 2. The one-line summary

**The `About` link in the site header is dead (`href="#"`), and `/about` does not exist.** This
chunk makes the link hot and creates the page as **bare-bones scaffolding that conveys position** —
the same standard the landing page is currently held to. It does **not** build the About section.

---

## 3. The background — a five-session discussion, compressed

`/about` has been under discussion since 27 August. The thinking lives in
`live-work/about-section-thinking.md`, which grew to **2,020 lines across five passes**.

⛔⛔ **READ THAT FILE'S STATUS BANNER BEFORE ANYTHING ELSE IN IT. It is IDEA STAGE and it
AUTHORISES NOTHING.** Carl: *"this file is not the finished thing."* Principles in it are stated
**to be attacked**, not to be implemented.

⚠⚠ **AND IT CARRIES A KNOWN HAZARD, NAMED BY THE FILE ITSELF: it is the most persuasive material in
the repo for talking a Builder into building more than was asked.** The file says so in its own
words — *"This pass is the most persuasive material in the file and therefore the most dangerous in
that respect."* ⛔ **Treat any pull toward implementing the argument as the failure mode this chunk
is most likely to exhibit, and check the Plan for it specifically.**

### What the discussion settled about the *content* — all of it deferred

None of this is in scope. It is listed so you can recognise it if it leaks into the Plan.

| subject | ruling |
|---|---|
| **Register** | AI is **raised on the page and CHAMPIONED, not defended**. The register is the ruling. |
| **Frame** | **Collaboration**, not tool use. The objection to AI slop is **granted and relocated** — the slop is the vendor default working as sold. The site is the proof. |
| **Tone** | ⛔⛔ **No condescension toward other agencies, in any form.** |
| **Founder** | The work speaks first; personability belongs to CONTACT. ⛔ **First person — "I", never the third.** The human is a seat in the team, in a small way. |
| **The seats** | ⛔⛔ Described **in principle, never by roster** — *"a team with defined roles, and each member knows what they need to know."* |
| **Structure** | **Four sections mirroring the landing page**: (1) founder + process, (2) the roles, (3) video examples, (4) TBD — Carl's, undecided. |
| **Examples** | Every example is **our own work** (§10a). The four examples build on sections 1 and 2. The logo is **not** one of them. |
| **C2B TV** | The idle screen is a **fifth example in plain sight** — abstract field, c2b's own, no Three.js. Idea stage; a dedicated session is scheduled. |

⛔ **All of the above is DEVELOPMENT-PASS material.** It is what the section eventually argues.

---

## 4. ⛔⛔ The scope, stated as narrowly as it can be

**Carl's method, in his own words** — the framing that governs this chunk:

> *"The landing page can be seen as scaffolding and placeholders. Although the text, subtext and
> boring white button can be seen to convey positions and ideas, the text wording will be edited,
> refined and focused… For now, it is serving its purpose. We will come to it soon. In the
> meantime, we must 'set up' the about page in the same manner. Once done, we will return to it in
> good time to develop it. Its the same principles i use when producing music in a DAW. Lets get
> the bare bones in there and then zero in and focus at the right time."*

**This is the DAW model (D-035, `working-with-carl.md`): tracking now, development later, mastering
at the end.** This chunk is **tracking**.

### In scope

1. **The header link made hot** — `href="#"` → `/about` in `components/layout/site-header.tsx`.
2. **The page created** — `app/about/page.tsx`, which does not exist.
3. **The mark placed** — top left, gold, per D-065, **with measurement reported on delivery**.

### ⛔ Out of scope — and the two boundaries that matter

**A. The section itself.** Not the argument, the examples, the clips, the variant, C2B TV. Carl has
explicitly deferred all of it.

**B. ⛔⛔ THE HEADER QUESTION — and this is the one to watch hardest.**

**`SiteHeader` MUST NOT be rendered on `/about` as a convenience.** Carl has **deferred** whether
the header appears on all routes — he is weighing it against **a font decision and context not yet
shared with the Builder**. Site headers are the **next** body of work after this scaffolding.

⚠⚠ **Making the link hot and giving `/about` a header are TWO DIFFERENT JOBS. Only the first is in
scope.** Deciding the second while implementing the first is exactly **CLAUDE.md §5a** — a
structural decision taken inside a chunk that did not authorise it.

⚠ **The deferral is not to be worked around.** Carl is weighing it against information the Builder
does not have; that is need-to-know operating as designed, and a Builder decision made in that gap
would be made blind.

⚠ **The structural question is real, with evidence:** `app/start/page.tsx:134` carries a standing
instruction — ⛔ *"DO NOT REINTRODUCE `SiteHeader` ON THIS PAGE"* — with a measured cost: nav links,
a "Web Design" span, and **an 81px band that pushed the questions and answers down (document to
981px). See D-062.** The header's absence from `/start` is a **recorded design ruling, not an
accident of routing.**

⛔ **So `/about` is the THIRD route, and the two existing routes disagree about headers for
recorded reasons.** Whatever the Plan proposes for how `/about` gets its mark, that is the question
to scrutinise.

### ⚠ And what "bare bones" does *not* license

⛔ **Not lorem ipsum, and not a blank route.** The landing page's placeholders **convey positions
and ideas** — Carl's own description, and it is the standard. **A page that says nothing fails the
comparison as surely as a finished one over-reaches it.**

⛔ **And it does not license touching the landing page copy.** Carl has recorded it as stale and
deferred — *"We will come to it soon"*, on his timing. **`app/page.tsx` is a protected path.**
Noticing the copy is stale is not authorisation to improve it.

**The test the file offers, and it is a good one:** *would this survive being thrown away when the
section is developed?* Scaffolding should. A carefully argued About section built now would not,
and the effort would be spent twice.

---

## 5. ⛔ D-065 — the standard the mark must meet, and how approval is discharged

**The rule, site-wide:** ⛔⛔ **NO MOVEMENT, ONLY CHANGE.** The mark occupies the same point on
every route; colour may change, position may not.

- ⛔ **The STANDARD is APPROVED.**
- ⛔ **The `/about` insertion is APPROVED ON DELIVERY.** Carl: *"If, and excuse the pun, you are
  given instructions to nail the about logo and you do, then approved. By what method? Thats your
  domain, i care about outcome."*
- ⚠⚠ **How that approval is discharged: the Builder MEASURES `/about` against the approved routes
  and reports the figures ALONGSIDE the visual evidence, as part of this chunk's delivery — not as
  a later step.** ⛔ **That is what makes it checkable rather than the Builder's word (Rule 9).**
- ⛔ **On `/about` the mark is GOLD and PROVISIONAL** — Carl: *"it may not stay that way."*
  ⚠ **PROVISIONAL is a defined status** (`context-rules.md`): in place, deliberately untuned,
  awaiting the mastering pass. **Not a gap — do not raise a missing approval for it.**

### ⛔⛔ The invariant is UNASSERTED, and this is the sharpest technical point in the chunk

**Two routes reach the same point by two different mechanisms** — the landing page in flow inside
`SiteHeader`, `/start` absolutely positioned out of flow — **and they agree because both resolve
through `Container`, NOT because they share code.**

⛔⛔ **This is an invariant held by the coincidence of two implementations** — precisely the failure
mode `context-rules.md` names in *AN INVARIANT THAT LIVES ONLY IN PROSE IS NOT ASSERTED*.
**Nothing detects the day a third route misses by 2px.** `/about` is that third route.

⚠⚠ **And Carl widened it from a c2b rule to a client-facing capability:** *"Think beyond our site
to a clients who will possibly have a logo… What if a client wants the same immobility?"*
⛔ **As a c2b rule, unasserted means we would notice eventually. As something a client BUYS, the
assertion is what makes the claim safe to make (§7).**

⚠ **The harness is owed when the header work lands** — that is recorded, and it is the *next* body
of work, not this one. **The question for you: does the Plan's approach to measurement discharge
D-065 honestly for this chunk, given the assertion does not yet exist?**

---

## 6. The gate — what is free and what is locked

| item | path | standing |
|---|---|---|
| the page | `app/about/page.tsx` | **FREE** — the route does not exist |
| the hot link | ⛔ `components/layout/site-header.tsx` | **PROTECTED** — needs Carl to name this exact path under `"unlocked"` in `live-work/chunk-scope.json` |

⛔ **NO UNLOCK IS LIVE. `chunk-scope.json` is ABSENT** — verified by the Builder at the start of this
session, 31 August. The scope guard will deny the header edit until Carl names the path.

---

## 7. What would be most useful from you

Findings and amendments on the Builder's Plan. The areas where this chunk is most likely to go
wrong, in the Builder's own assessment:

1. ⛔⛔ **Scope creep from `about-section-thinking.md`.** The file is persuasive and the Plan is
   written by someone who has just read 2,020 lines of it. **Does the Plan build any part of the
   argument?**
2. ⛔⛔ **The header question being settled by convenience.** Does the Plan decide, implicitly or
   explicitly, how `/about` gets a header — rather than only making the link hot? **A structural
   decision arriving inside a chunk that did not authorise it is the single most repeated failure
   on this project's record** (CLAUDE.md §5a, both worked cases).
3. ⚠ **CLAUDE.md §5b — what depends on the current structure.** `/about` is a new route with no
   existing dependents, which makes this lighter than usual, **but the mark's position depends on
   `Container` resolution that nothing asserts.** Has the Plan enumerated what it relies on?
4. ⚠ **Whether the measurement proposed actually discharges D-065.** Rule 9 makes rendered output
   the truth for visual work. Numbers alongside visual evidence, both, on delivery.
5. ⚠ **Whether "bare bones that convey position" is hit** — neither empty nor over-built, judged
   against the landing page's current state as the standard.

---

## 8. Reference — where the authority actually lives

⚠ **This prompt is a synopsis. It is not canonical, and where it differs from the files below,
they win.**

| subject | file |
|---|---|
| the thinking, all five passes | `live-work/about-section-thinking.md` ⛔ **idea stage, authorises nothing** |
| the mark does not move | `decisions.md` **D-065** |
| the mark on `/start`, the 81px cost | `decisions.md` **D-062**, **D-063** |
| the logo's 40px standard | `decisions.md` **D-060**, and the comment in `site-header.tsx` |
| structural decisions stop for review | `CLAUDE.md` **§5a**, **§5b** |
| the DAW model | `working-with-carl.md`, `decisions.md` **D-035** |
| the plan-review gate | `ai-system/handoff-protocol.md` **§2.5** |
| unasserted invariants | `ai-system/context-rules.md` |
| what the previous session did | `live-work/session-handoff.md` (30 August) |

---

*⛔ **Invocation is FILE-BASED. Codex is retired and the `codex` MCP server does not exist.***

*31 August 2026 — Builder, on Carl's instruction. **The Plan follows as a separate artefact.***
