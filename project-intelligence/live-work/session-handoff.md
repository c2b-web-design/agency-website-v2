# Session Handoff — 30 August 2026. The About section was discussed, not built. Seven commits, all record.

⛔⛔ **NO CODE CHANGED THIS SESSION. `app/` and `components/` WERE NOT TOUCHED.** Seven commits,
every one of them `project-intelligence/`. ⚠ **This was a DISCUSSION session by Carl's design, and
the next one starts building.**

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

# ⛔⛔ WHAT THE NEXT SESSION DOES — CARL'S INSTRUCTION, VERBATIM

> *"the next session. i will ask you for a prompt for the CA and to write a Plan. The prompt should
> cover what we are trying to achieve, basically a synopsis of this discussion. The Plan is self
> evident. CA is to review and evaluate the plan with any suggestions it may have. I will review the
> findings along with CB and we will proceed with construction."*

**FOUR STEPS, IN ORDER:**

1. ⛔ **WRITE A PROMPT FOR CA** — a synopsis of this discussion: what we are trying to achieve.
   ⚠ **Carl asks for it; do not pre-empt it.**
2. ⛔ **WRITE THE PLAN** — Plan Mode, per `handoff-protocol.md` §2.5.
3. ⛔ **CA REVIEWS AND EVALUATES**, with any suggestions. ⚠ **Invocation is FILE-BASED — Codex is
   retired and the `codex` MCP server DOES NOT EXIST. Do not attempt to call it.**
4. ⛔ **CARL REVIEWS THE FINDINGS WITH CB, THEN CONSTRUCTION PROCEEDS.**

⚠⚠ **THE SCOPE OF THE BUILD IS THE SCAFFOLDING, NOT THE SECTION.** ⛔ **Everything below in
*THE THINKING* is DEVELOPMENT-PASS material — what the section eventually argues. The build is:
the header link made hot, the page created, bare bones that convey position.**

## ⛔ WHAT THE PLAN MUST NAME

| item | path | standing |
|---|---|---|
| the page | **`app/about/page.tsx`** | **FREE** — the route does not exist |
| the hot link | ⛔ **`components/layout/site-header.tsx`** | **PROTECTED** — needs Carl to name this exact path under `"unlocked"` in `live-work/chunk-scope.json` |

⛔ **NO UNLOCK IS LIVE. `chunk-scope.json` is ABSENT** — verified at session end.

### ⚠⚠ AND ONE THING THE SCAFFOLDING MUST **NOT** DO

⛔⛔ **DO NOT SETTLE THE HEADER QUESTION BY RENDERING `SiteHeader` ON `/about` AS A CONVENIENCE.**

⚠ **Carl has DEFERRED whether the header goes on all routes** — he is weighing it against **a font
decision and context not yet shared with the Builder.** ⛔ **Site headers are the NEXT body of work
after this scaffolding.**

⚠⚠ **Making the link hot and giving `/about` a header are TWO DIFFERENT JOBS. Only the first is in
scope.** ⛔ **Deciding the second while implementing the first is exactly CLAUDE.md §5a.**

⚠ **AND THE STRUCTURAL QUESTION IS REAL, with evidence the last handoff did not carry:**
`app/start/page.tsx:134` holds a standing instruction — ⛔ **"DO NOT REINTRODUCE `SiteHeader` ON
THIS PAGE"** — with a measured cost: nav links, a "Web Design" span, and **an 81px band that pushed
the questions and answers down (document to 981px). See D-062.** **The header's absence from
`/start` is a recorded design ruling, not an accident of routing.**

---

# ⛔ D-065 — DRAFTED, REDRAFTED, AND APPROVED AS A STANDARD

**The rule, and it is site-wide:** ⛔⛔ **NO MOVEMENT, ONLY CHANGE.** The mark occupies the same
point on every route; colour may change, position may not.

- ⛔ **The STANDARD is APPROVED.**
- ⛔ **The `/about` insertion is APPROVED ON DELIVERY** — Carl: *"If, and excuse the pun, you are
  given instructions to nail the about logo and you do, then approved. By what method? Thats your
  domain, i care about outcome."*
- ⚠⚠ **HOW THE APPROVAL IS DISCHARGED: the Builder MEASURES `/about` against the approved routes
  and reports the figures ALONGSIDE the visual evidence, as part of the scaffolding chunk's
  delivery — not as a later step.** ⛔ **That is what makes it checkable rather than the Builder's
  word (Rule 9).**
- ⛔ **On `/about` the mark is GOLD and PROVISIONAL** — Carl: *"it may not stay that way."*
  ⚠ **PROVISIONAL is a defined status: in place, deliberately untuned, awaiting the mastering pass
  (D-035). Not a gap; do not raise a missing approval for it.**

⚠⚠ **CLAUSE 4 WAS REDRAFTED, AND THE REASON MATTERS.** ⛔ **It originally required a new route to
*"hang from the nail"* — a MECHANISM.** ⚠ **That was wrong twice: it is not what Carl rules on, and
it mis-describes the landing page, which reaches the same point through `SiteHeader`'s flow layout.**
⛔⛔ **As drafted it would have obliged the header work to make the nail SHARED — a structural
decision smuggled in through a decision entry.**

## ⛔ THE INVARIANT IS UNASSERTED, AND THE STAKES WENT UP

⚠ **Two routes reach the same point by two different mechanisms** — the landing page in flow inside
`SiteHeader`, `/start` absolutely positioned out of flow — **and they agree because both resolve
through `Container`, NOT because they share code.**

⛔⛔ **AN INVARIANT HELD BY THE COINCIDENCE OF TWO IMPLEMENTATIONS** — the failure mode
`context-rules.md` names. **Nothing detects the day a third route misses by 2px.**

⚠⚠ **AND CARL WIDENED IT TO A CLIENT-FACING CAPABILITY:** *"Think beyond our site to a clients who
will possibly have a logo… What if a client wants the same immobility?"* ⛔ **As a c2b rule,
unasserted means we would notice eventually. As something a client BUYS, the assertion is what makes
the claim safe to make (§7).** ⚠ **The harness is owed when the header work lands.**

---

# ⛔⛔ THE THINKING — ALL OF IT IS IN `live-work/about-section-thinking.md`

⚠⚠ **THAT FILE GREW FROM 759 TO 2,020 LINES TODAY, ACROSS FIVE PASSES.** ⛔ **Read it before the
next session. It is IDEA STAGE and authorises nothing.**

⚠ **The `NEEDS WRITING DOWN` list went from SEVEN items to TWELVE.** ⛔ **Five added today, and all
five are the kind that erode quietly rather than break loudly.**

## The rulings, compressed — full reasoning in the file

| | ruling |
|---|---|
| **AI** | ⛔ **Raised on the page and CHAMPIONED, not defended.** ⚠ **The register is the ruling.** |
| | **Frame is COLLABORATION**, not tool use |
| | **The objection is granted and RELOCATED** — the slop is the vendor default working as sold |
| | **The site is the proof** |
| | ⛔⛔ **NO CONDESCENSION toward other agencies, in any form** |
| **Founder** | **The work speaks first; personability belongs to CONTACT** |
| | ⛔⛔ **FIRST PERSON. "I", never the third** — *"as if someone else or AI wrote it"* |
| | **The human is a seat in the team, in a small way** |
| **Seats** | ⛔⛔ **Described IN PRINCIPLE, never by roster** — *"a team with defined roles, and each member knows what they need to know"* |
| **Structure** | **Four sections mirroring the landing page** — founder+process, roles, video examples, TBD |
| | ⛔ **The four examples BUILD ON sections 1 and 2** |
| **C2B TV** | ⛔⛔ **The idle screen is a FIFTH EXAMPLE in plain sight.** Abstract field, c2b's own, no Three.js |

## ⚠⚠ THREE CORRECTIONS CARL MADE TO THE BUILDER — recorded because they generalise

1. ⛔ **"The seats are separated" was FALSE.** CA and CB share the repo; CS can be given access at
   Carl's discretion. ⚠ **The Builder inferred an INFORMATION boundary from a PRODUCT boundary** —
   the same shape as the harness failures on record. **The real principle is *each knows what it
   needs to know*, and it is stronger: a property of the DESIGN, not the architecture.**
2. ⛔ **The first C2B TV proposal was PASTICHE** — the site's own vocabulary reassembled. Carl:
   *"like listening to the entire catalogue of Beethoven and then writing a new piece in his
   style."* ⚠ **Re-using the vocabulary is quotation, not style.**
3. ⛔ **A false choice between restraint and invitation.** Carl: *"I have many VSTs in my DAW… Do
   you know what this gives me? Choice!"* ⚠⚠ **RESTRAINT IS NOT HAVING FEWER OPTIONS — IT IS
   CHOOSING WELL FROM MANY.** ⛔ **Treating a large palette as a risk misreads both the site and how
   Carl works.**

---

# ⛔⛔ A STANDING INSTRUCTION FOR ALL DEVELOPMENT FILES — Carl, 30 August

> *"In these development files you may come across things i propose that change, contradict or add
> to that file. This too should not be a problem but an opportunity for you to ask for
> clarification. By their very nature an idea is being developed. Change is to be expected, but we
> should also do this with a degree of accuracy."*

⚠⚠ **THE FAILURE MODE IS NOT SILENCE — IT IS RESOLVING A CONTRADICTION IN THE WRITE-UP WHILE
MARKING IT TENTATIVE.** ⛔ **It still lands as a settled-looking sentence, and the next reader
inherits the Builder's inference instead of Carl's ruling.**

**The procedure: name what the file says, name what Carl said, ASK. Record the resolution as HIS.**
⚠ **Where it cannot wait, write an OPEN CONTRADICTION — both positions, neither picked.**

⛔ **Worked case, the same day: section 3 versus the sorting rule was asked about AND THEN
half-answered as *"a refinement rather than a conflict."* That was the Builder's reading. It is
withdrawn as a resolution and now stands as an open question.**

## ⚠ THE OPEN QUESTION IT PRODUCED — Carl's to settle

⛔ **Does section 3's existence REFINE the sorting rule, or does the rule stand and the four
examples all pass the ethos test on their own?** ⚠ **They lead to different pages.** ⛔ **Not
blocking the scaffolding.**

---

# ⚠ OTHER RECORDS TOUCHED

- ⛔ **`decisions.md`** — **D-065** added and redrafted. **3,257 lines.**
- ⛔ **`references/workshop-template-and-client-delivery.md`** — **THE STOREROOM**, a third artefact
  the record did not have: elements stripped to their MESH STATE in a separate repo, called upon by
  a workshop. ⚠⚠ **THAT FILE IS LF, NOT CRLF — check each file individually.**
  ⛔ **Recorded as DEVELOPMENT, not correction, on Carl's instruction: the 30 July record was not
  incomplete, it was EARLY.**
- ⚠ **`ai-roles.md` STILL DOES NOT MENTION CS OR CD.** ⛔ **Known gap, deliberately not fixed** —
  Carl has flagged a dedicated CD conversation which will change what gets written.

---

# ⚠ ENVIRONMENT NOTES FROM THIS SESSION

- ⚠⚠ **HEREDOCS WITH APOSTROPHES IN QUOTED PROSE BREAK `bash -c`.** ⛔ **Use the `Write` tool for
  large prose blocks, then splice with `head`/`tail`/`cat`.**
- ⚠ **`sed 's/$/\r/'` DID NOT CONVERT LF→CRLF reliably here.** ⛔ **`perl -pe 's/(?<!\r)\n$/\r\n/'`
  works.** ⚠ **Always re-check with `tr -cd '\r' | wc -c` against the line count.**
- ⚠ **`grep -P` IS UNAVAILABLE** (*"-P supports only unibyte and UTF-8 locales"*) — ⛔ **a NUL check
  written with it silently falls through to the `||` branch and reports CLEAN.** **Use
  `tr -cd '\000' | wc -c`.**
- ⚠ **`awk` strips `\r` before pattern tests here**, so `!/\r$/` reports every line as LF-only.
  **Do not use it to detect line endings.**
- ⚠ **`core.autocrlf` normalises CRLF→LF on staging** — staged blobs show 0 CR. **Expected, not a
  fault. Verify with `git cat-file blob :path`.**

---

# STATE AT SESSION END

- **Working tree clean. `main` = `25c6ca2`. Fully pushed.**
- ⛔ **NO CODE CHANGED. `app/` and `components/` untouched — no lint or `tsc` run needed, and none
  was run.** ⚠ **The known baseline is unchanged because nothing could have changed it.**
- ⛔ **NO UNLOCK IS LIVE** — `chunk-scope.json` absent, verified.
- **Nothing running on :3100** — verified by `netstat`.
- ⚠ **Every push to `main` deploys to Vercel. All seven commits touched `project-intelligence/`
  only, so all seven were no-op deploys.** ⛔⛔ **THAT WILL NOT BE TRUE OF THE NEXT CHUNK.**

## The seven commits

| commit | what |
|---|---|
| `b4397ce` | the AI pass — championed, not defended |
| `e32d0d7` | the human founder — first person, a seat in the team |
| `fb63a0e` | the seats — one sentence, not the roster |
| `1b7f791` | the structure — four sections, and the mark does not move |
| `fb403eb` | D-065 approved as a standard; the storeroom |
| `d4c8c7b` | ask, do not reconcile; the logo is not an example |
| `25c6ca2` | C2B TV — the fifth example, in plain sight |

---

*30 August 2026. **A full session of discussion and no code — by design.** The About section
acquired its position, its register, its voice and its structure: AI championed rather than
defended, the founder in the first person, the set-up described in principle rather than by roster,
four sections mirroring the landing page, and an idle screen that is a fifth example nobody
counts.*

*⚠ **D-065 was drafted, redrafted on Carl's outcome ruling, and approved as a standard** — the mark
does not move, site-wide, and it is now a capability a client can buy rather than only a c2b rule.
**Its assertion is owed.***

*⛔ **NEXT SESSION: a prompt for CA, then the Plan, then CA's review, then Carl and CB proceed to
construction.** ⚠ **The build is the SCAFFOLDING — link hot, page created, bare bones. It is not
the section, and `about-section-thinking.md` is the most persuasive material in the repo for
talking a Builder into building more than was asked.***
