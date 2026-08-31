# The `/about` section — working record

> ## ⛔⛔ STATUS: IDEA STAGE. NOTHING HERE IS DECIDED, AND THIS FILE IS NOT FINISHED.
>
> **Carl, 28 August 2026:** *"The status of this file is that it is at the idea stage. We will
> discuss and refine and end up with a file we can act upon. So this file is not the finished
> thing."*
>
> ⚠ **THIS IS AN EXPLORATION FILE — thinking, not a decision and not a plan.** Same standing as
> `contact-form-fields-brainstorm.md` in the `live-work/README.md` index.
>
> ⛔ **IT GRANTS NO AUTHORITY AND AUTHORISES NO WORK.** "No chunk is authorised" is the permanent
> arrangement and is untouched by anything written here. **Nothing in this file may be built
> from.** When it becomes actionable, that happens because **Carl says so** and it goes through
> **Plan Mode** and the **plan-review gate** (`handoff-protocol.md` §2.5) like any other chunk.
>
> ⚠ **Principles below are stated to be ATTACKED.** Carl's framing: *"a set of principles
> attached so you or the Architect can attack them."* Do not treat a heading here as settled
> because it is written in the present tense.
>
> ⚠⚠ **THIS FILE IS DEVELOPED, NOT CORRECTED — Carl, 28 August 2026:** *"i would not say that you
> corrected a file as you may have done. i would cite it as you have developed a file."* ⛔ **Use
> that word.** A later pass that sharpens an earlier one **is the file working as intended**, not
> the earlier pass having been wrong. ⚠ **"Corrected" imports a fault that did not occur, and in a
> file explicitly at idea stage it would make every entry read as provisionally mistaken rather
> than provisionally EARLY.** *(Related: `working-with-carl.md` — a decision taken during tracking
> is a take, not a master, and being overtaken is not being wrong.)*
>
> ⛔⛔ **AND WHEN CARL SAYS SOMETHING THAT CHANGES, CONTRADICTS OR ADDS TO WHAT THIS FILE HOLDS:
> ASK. DO NOT RECONCILE IT QUIETLY — Carl, 30 August 2026.**
>
> *"In these development files you may come across things i propose that change, contradict or add
> to that file. This too should not be a problem but an opportunity for you to ask for
> clarification. By their very nature an idea is being developed. Change is to be expected, but we
> should also do this with a degree of accuracy."*
>
> ⚠⚠ **THE FAILURE MODE IS NOT SILENCE — IT IS RESOLVING THE CONTRADICTION IN THE WRITE-UP WHILE
> MARKING IT AS TENTATIVE.** ⛔ **It still lands in the file as a settled-looking sentence, and the
> next reader inherits the Builder's inference instead of Carl's ruling.** ⚠ **Worked case, the same
> day: section 3 versus the sorting rule was asked about AND THEN half-answered in the file as
> *"a refinement rather than a conflict."* That was the Builder's reading, not Carl's.**
>
> ⛔ **THE PROCEDURE: name what the file says, name what Carl has just said, ask.** ⚠ **Record the
> resolution as CARL'S, with his reasoning.** ⛔ **Where something genuinely cannot wait, write it
> as an OPEN CONTRADICTION — both positions stated, neither resolved — rather than picking one and
> flagging the pick.**
>
> ⚠⚠ **AND ACCURACY HERE HAS A MECHANISM: a contradiction is only visible if the EARLIER position
> is still legible.** ⛔ **Quote what the file actually said; do not paraphrase it into agreement
> with the new position.** **§2 is the worked example — its blunt original survives, with the
> development recorded AROUND it rather than over it.**
>
> ⛔⛔ **ONE THING IN THIS FILE *IS* SETTLED, AND IT IS THE METHOD, NOT THE CONTENT.** Carl,
> 28 August: the `/about` page is to be **"set up" the way the landing page was set up — bare
> bones now, developed later.** ⚠ **That is a DAW-model instruction and it governs the next
> session.** ⛔ **See *CARL'S FRAMING* immediately below, and read it BEFORE Parts one to three —
> it tells you what those parts are for and, more importantly, WHEN THEY APPLY. They are the
> development pass, not the setup.**

> ### ⛔ WHERE THIS GOES NEXT — Carl, 28 August 2026
>
> *"Next session. Further discussion on the About section and create the space to implement it. By
> that i mean making the about link in the landing page Header hot and creating the page and
> possibly fill it with placeholders or some dedicated content."*
>
> **Two halves, in order: DISCUSSION first — this file is refined until it is actionable — THEN
> the scaffolding.** ⚠⚠ **"Create the space" is SCAFFOLDING, NOT THE SECTION.** ⛔ **It does not
> authorise building the About content itself** — the argument, the examples, the clips, the
> variant. **That is what the discussion is for.**
>
> ⛔ **The scaffolding half needs ONE unlock:** `components/layout/site-header.tsx`, for the
> one-line `href="#"` → `/about`. **`app/about/page.tsx` is free.** ⚠ **And the structural
> question is LIVE** — `/start` never used `SiteHeader`, so a new route that renders it is a
> structural decision under CLAUDE.md §5a. **Write it up; do not decide it while implementing.**

**Sources, all preserved deliberately — this file is built by successive passes, and each is kept:**

1. **Carl's brainstorm, 27 August 2026** — recovered from commit `7b313e1`. ⚠ **It lived only in
   the 27 August `session-handoff.md`, which was replaced on 28 August** under the single-use rule
   (`live-work-protocol.md` §3a). ⛔ **This file exists partly so that never happens again:** a
   handoff is single-use by design and is the wrong home for durable thinking.
2. **Carl's research pass, 28 August 2026** — the principles in Parts one to three.
3. **Carl's framing of 28 August 2026** — the section immediately below, which says **what the
   principles are FOR and when they apply.**
4. **Carl's ruling on examples, 28 August 2026** — **§10a**. ⛔ **Every example is our own work.**
   The one content question that is **settled**, not open.
5. ⛔⛔ **Carl's statement of THE CENTRAL TENSION, 28 August 2026** — the section before Part one.
   ⚠ **It is the PROBLEM the rest of the file is attempting.** **Read it first;** it develops §2.
6. ⛔⛔ **Carl's RESOLUTION of it, 28 August 2026** — **the ethos is the sorting rule: in the ethos
   → the site; not in the ethos → a video example for clients.** ⚠ **Two channels, not a ratio.**
   **Plus: the section is education, a sales pitch AND a philosophy at once — do not collapse it
   into one stated purpose.**
7. ⛔⛔ **Carl's AI POSITION, 30 August 2026** — *CARL'S POSITION* and the **five rulings** after
   Part three. ⚠⚠ **IT SETS THE REGISTER FOR THE WHOLE SECTION: modern and cutting edge, and the
   AI collaboration is CHAMPIONED, not defended.** ⛔ **Read it before writing anything about AI**
   — it changes what the arguments are FOR. **It also settles §10a's open question** (AI *is*
   raised on the page) and adds a constraint that governs every line: **no condescension toward
   other agencies, in any form.** ⚠ **Its market-read section is REASONING, NOT COPY, and says so.**
8. ⛔⛔ **Carl's FOUNDER RULINGS, 30 August 2026** — *THE HUMAN FOUNDER ON THE PAGE*, placed
   immediately after the four-seats problem **because it answers it.** ⚠ **Three rulings: the work
   speaks first and personability belongs to CONTACT; the founder is written in the FIRST PERSON;
   and the human is represented AS PART OF THE TEAM, in a small way.** ⛔ **Ruling 2 is the one
   that erodes** — polished copy drifts into third person on its own.
9. ⛔⛔ **Carl's SEATS RULING, 30 August 2026** — *THE SEATS, AND WHAT THE PAGE SAYS ABOUT THEM*.
   ⚠⚠ **THE PAGE DESCRIBES THE SET-UP IN PRINCIPLE, NOT BY ROSTER: "a team with defined roles, and
   each member knows what they need to know."** ⛔ **Recognition is the mechanism** — a business
   owner already runs this shape. ⚠ **It also CORRECTS a false claim made in discussion (the seats
   are NOT separated) and carries the roster as reference, explicitly not as page content.**
10. ⛔⛔ **Carl's PAGE STRUCTURE, 30 August 2026** — *THE PAGE STRUCTURE*, *SECTION 3*, *THE LOGO ON
    `/about`* and *THE HEADER IS DEFERRED*. ⚠⚠ **THE FIRST STRUCTURAL MATERIAL IN THIS FILE: four
    sections mirroring the landing page.** ⛔ **It resolves the item-12 conflict** — principle in
    §1, structure in §2 — **settles that video examples ARE on the page (max four), and rules that
    on-site examples are RECOLOURED before recording rather than filmed as they stand.** ⚠ **The
    header is DEFERRED with its reason recorded, and the logo rule is promoted to its own decision:
    **D-065** — the STANDARD is APPROVED, the `/about` insertion approved ON DELIVERY.**
11. ⛔⛔ **C2B TV, 30 August 2026** — *C2B TV*, after the logo section. ⚠⚠ **What plays before an
    example is selected: an ABSTRACT FIELD, c2b's own, and it is a FIFTH EXAMPLE IN PLAIN SIGHT
    that never announces itself.** ⛔ **Royalty-free is ruled out, which BROADENS §10a — the rule
    covers what is ON THE SITE, not only what is labelled an example.** ⚠ **No Three.js: *"all you
    have to do is organise the pixels."*** ⛔ **IDEA STAGE — a dedicated session is scheduled.**

---

# ⛔⛔ CARL'S FRAMING, 28 August 2026 — "SET UP" THE PAGE THE WAY THE LANDING PAGE WAS SET UP

**This is the section that tells you what the next session is actually for. Read it before the
principles above, because it changes what they are for.**

**Carl, in his own words:**

> *"The landing page can be seen as scaffolding and placeholders. Although the text, subtext and
> boring white button can be seen to convey positions and ideas, the text wording will be edited,
> refined and focused. All the moreso seeing as we are months into building and the idea of c2b has
> been developed and refined. better language is required. For now, it is serving its purpose. We
> will come to it soon. In the meantime, we must 'set up' the about page in the same manner. Once
> done, we will return to it in good time to develop it. Its the same principles i use when
> producing music in a DAW. Lets get the bare bones in there and then zero in and focus at the
> right time."*

## ⚠⚠ WHAT THIS SETTLES — and it resolves a tension recorded above

**The two-registers tension** (three prose parts vs one wanting live interactive demos) **does not
have to be resolved to start.** ⛔ **It is a MASTERING problem, and the next session is TRACKING.**

⚠ **Everything in Parts one to three of this file — the process rule, the ethos test, the scene
finding, the variant principle, the compression warning — is about what the section EVENTUALLY
ARGUES.** ⛔ **None of it has to be settled to put the bare bones in.** That is the point of Carl's
framing: **the two are separate passes and they happen at different times.**

## THE LANDING PAGE IS THE WORKED EXAMPLE, AND IT IS ALREADY LIVE

⛔ **THE LANDING PAGE IS ITSELF SCAFFOLDING AND PLACEHOLDERS.** Its text, subtext and *"boring
white button"* **convey positions and ideas** — they are doing real work — **but the wording is not
final and was never meant to be.**

⚠⚠ **AND IT IS ALREADY STALE BY CARL'S OWN ACCOUNT:** *"we are months into building and the idea
of c2b has been developed and refined. better language is required."* ⛔ **The copy has been
overtaken by the understanding of the business it describes.**

**Carl: *"For now, it is serving its purpose. We will come to it soon."*** ⛔ **THIS IS A KNOWN,
ACCEPTED, DEFERRED ITEM — not a defect, not an oversight, and NOT something to fix while passing.**

## ⛔ THE INSTRUCTION FOR THE `/about` PAGE

**"Set up the about page in the same manner."** ⛔ **The standard to hit is the landing page's
CURRENT state — bare bones that convey position — NOT its finished state, which does not exist
either.**

| phase | `/about` | when |
|---|---|---|
| **Tracking** | ⛔ **THIS IS THE NEXT SESSION.** Bare bones in. The link goes hot, the page exists, content conveys position without being final. | now |
| **Re-tracking / development** | *"we will return to it in good time to develop it"* — the argument, the examples, the variant, the clips. | Carl's call, later |
| **Mastering** | The whole site balanced as one thing, landing page copy included (D-035). | end of build |

⚠⚠ **SO "PLACEHOLDERS OR SOME DEDICATED CONTENT" IS NOT A HEDGE — IT IS THE METHOD.** Carl's DAW
model: *"Lets get the bare bones in there and then zero in and focus at the right time."*

## ⛔⛔ WHAT THIS FORBIDS — the failure mode, stated plainly

⚠ **THE RISK IS NOT UNDER-BUILDING. IT IS OVER-BUILDING BECAUSE THIS FILE EXISTS.**

**Parts one to three above are rich, specific and persuasive.** ⛔ **A Builder who reads them and
then "sets up" the page will be strongly tempted to implement the argument** — the scene example,
the two-variant specimen, the copy that points before the viewer looks.

⛔ **DO NOT. That is the development pass, and Carl has explicitly deferred it.** ⚠ **This file is
what the section will EVENTUALLY say. The next session is about making sure there is somewhere for
it to be said.**

⚠ **The test: would this survive being thrown away when the section is developed?** Scaffolding
should. **A carefully argued About section built now would not — and the effort would be spent
twice.**

## ⚠ WHAT THIS DOES NOT LICENSE EITHER

⛔ **"Bare bones" does not mean lorem ipsum or a blank route.** The landing page's placeholders
**convey positions and ideas** — that is Carl's own description of them, and it is the standard.
**A page that says nothing fails the comparison as surely as a finished one over-reaches it.**

⚠ **AND IT DOES NOT LICENSE TOUCHING THE LANDING PAGE COPY.** ⛔ *"We will come to it soon"* is
Carl's, on Carl's timing. **`app/page.tsx` is a PROTECTED PATH.** ⚠ **Noticing the copy is stale is
not authorisation to improve it** — the staleness is recorded here precisely so it does not need
re-reporting.

---

# THE CONCRETE DEFECT THAT STARTED IT

⛔ **`About` is `href="#"` in `components/layout/site-header.tsx`.** `Services`, `Work` and
`Contact` all point at real sections (`#services`, `#work`, `#contact`).

⚠ **`#` jumps to the top of the page, so it reads as BROKEN, not inert.**

---

# CARL'S INTENT — 27 August

**One page, four related parts: About / me / the company / modern websites / the process.**

⛔ **NOT "what we can do for you" — that is documented elsewhere. This is HOW we are going to do
it.** ⚠ **Read in sequence it is ONE ARGUMENT, not four topics.**

**The "modern websites" part is where the live examples live.** Carl's insight: clients
*"don't know what to ask for, or are they a decade behind"* — their reference points are
competitors' templates, **so they cannot name the current ceiling.**

⚠ **PLAIN LANGUAGE IS THE RULE.** Not Three.js geometry but *"a wireframe like is used in video
games with a material put on it and lit with an invisible orbital light."*

- **"Show don't tell"** — a basis and starting point for conversation and discovery.
- **Bespoke should mean exactly that.** *"You want average — go to WordPress or something
  similar."*
- ⚠ **Placeholders are acceptable.** Carl: *"we may create the page and put placeholders there
  while the idea is developed. That would mean all the landing page header subjects have
  functionality and meaning."*

---

---

# ⛔⛔ THE CENTRAL TENSION — Carl, 28 August 2026. THE PROBLEM THE SECTION HAS TO SOLVE

**This is the design problem. Everything in Parts one to three is an attempt on it, and any
proposal that does not hold BOTH ENDS has not solved it.**

**Carl, in his own words:**

> *"Here is the problem i faced. I can see the benefit of a client seeing features explained in
> plain language. That starts as a basis for discussion. They may lack the skills to know what they
> want or to articulate it. But, filling my site with a lexicon of modern website design elements
> runs the risk of c2b losing what is essentially our style, our ethos. A balance betwwen the two
> must be found."*

## ⚠⚠ THE TWO ENDS, AND BOTH ARE REAL

| end | what it is | what it costs if it wins alone |
|---|---|---|
| **The client's need** | Plain-language explanation of what is possible. **A basis for discussion.** They *"may lack the skills to know what they want or to articulate it."* | ⛔ A **lexicon** — the site becomes a catalogue and **c2b's style disappears into it.** |
| **c2b's identity** | Style and ethos, which **signal bespoke** without being stated. | ⛔ A visitor who cannot name what they want **still cannot name it** — admired and unequipped, so the discussion never starts. |

⛔ **CARL'S INSTRUCTION IS NOT "PICK ONE." IT IS *"A balance between the two must be found."***

## ⚠⚠ THIS CORRECTS §2 — READ THAT SECTION THROUGH THIS ONE

**§2 records the client-education case as the competitor's pitch:** *"Look how many things I can
do" is the template-marketplace pitch.* ⛔ **That is now too blunt and must not be read as the
whole position.**

⚠ **Carl grants the educational case OUTRIGHT: *"I can see the benefit."*** **So the failure mode
is NOT explaining things to clients.** ⛔ **The failure mode is VOLUME AND FORM — a *lexicon*, an
inventory of elements — which is a different thing from explaining one decision clearly.**

⚠⚠ **THE DISTINCTION THAT DOES THE WORK, AND IT IS NOT THE ONE §2 DRAWS:**

- ⛔ **NOT** *explaining* **vs** *not explaining*.
- ⛔ **BUT** **a CATALOGUE of what exists** **vs** **a WORKED EXAMPLE of how a decision was made.**

**A catalogue teaches vocabulary and costs identity. A worked example teaches the same vocabulary
AND demonstrates judgement, because the plain-language explanation is attached to a decision c2b
made** — which is §1 arriving at the same place from a third direction.

## ⚠ WHY THIS IS THE HARD VERSION OF THE PROBLEM

⛔ **The two ends do not trade off cleanly, and that is why Carl calls it a problem rather than a
preference.**

**The obvious resolutions all fail:**

- **"Explain fewer things."** ⚠ Reduces the lexicon risk **and the client's grip in the same
  motion.** A visitor with two examples may be no better equipped than one with none.
- **"Explain everything but in c2b's voice."** ⛔ **Already rejected** — *"consistent presentation
  of an inconsistent set still says many things."* **Voice does not fix volume.**
- **"Separate the two — a styled section and a plain reference elsewhere."** ⚠ **NOT rejected, and
  not proposed either.** It is the obvious structural move and **nobody has thought it through.**
  ⛔ **Flagged for the discussion pass; it may be the answer or it may just relocate the lexicon.**

## ⚠ WHAT THIS MEANS FOR THE STANDING TEST

**§2's test — *does this express the ethos, or compete with it?* — still stands, but it is now
INCOMPLETE.** ⛔ **A section that passes it perfectly can still fail Carl's problem** by leaving
the client unable to articulate what they want.

⚠⚠ **THE TEST NEEDS A SECOND HALF, and this is a candidate rather than a decision:**

> **1. Does this express the ethos, or compete with it?**
> **2. Does it leave the visitor better able to say what they want?**

⛔ **A candidate. Carl has not ruled on it.** The first half is his; **the second is drafted from
his problem statement and needs his word.**

## ⛔⛔ THE RESOLUTION — Carl, 28 August 2026. THE ETHOS IS THE SORTING RULE

**Carl, in his own words:**

> *"The balance sits that something i deem to be in the c2b ethos will be open to putting on the
> site. Something that isnt is open to put as a video example for clients."*

⚠⚠ **THIS IS THE MECHANISM, AND IT IS A SORTING RULE RATHER THAN A RATIO.** ⛔ **The question was
never "how much of each" — it is "which channel does this belong in."**

| | **ON THE SITE** | **AS A VIDEO EXAMPLE** |
|---|---|---|
| **admits** | anything Carl deems **in the c2b ethos** | anything that **is not** |
| **serves** | ⛔ **identity** — style and ethos, which signal bespoke | ⛔ **the client's need** — plain-language explanation, a basis for discussion |
| **built from** | our own work (§10a) — **and it lives in the real page** | our own work (§10a) — **built separately and recorded if need be** |

### ⚠⚠ WHY THIS DISSOLVES THE TENSION RATHER THAN SPLITTING THE DIFFERENCE

⛔ **THE LEXICON RISK WAS ALWAYS ABOUT THE SITE, NOT ABOUT THE EXPLAINING.** Carl's problem was
*"filling my site with a lexicon"* — **the danger is what the SITE becomes**, not whether clients
are educated.

⚠ **So the client's need is met in full, and the identity risk goes to zero, because they are met
in DIFFERENT PLACES.** ⛔ **Neither end is sacrificed. That is why this qualifies as the balance
Carl said must be found rather than a compromise between the two.**

⚠⚠ **AND IT ANSWERS THE STRUCTURAL MOVE FLAGGED ABOVE AS UNEXAMINED** — *"separating the two: a
styled section and a plain reference elsewhere."* ⛔ **The concern recorded against it was that it
might merely RELOCATE the lexicon.** ⚠ **It does not, because the second channel is not part of the
site at all** — it is material shown to a client in conversation. **The site never carries the
catalogue.**

### ⛔ THE ADMISSION TEST, AND WHO HOLDS IT

> **Is this in the c2b ethos?** → **the site.**
> **Is it not?** → **a video example for clients.**

⚠⚠ **NOTE THE VERB: *"something i DEEM to be in the c2b ethos."*** ⛔ **The judgement is CARL'S and
is not delegated.** ⚠ **There is no checklist here and one must not be invented** — the ethos is
demonstrated by the site, not defined by a rule a Builder can apply alone. **When it is unclear
which channel something belongs in, that is a question for Carl, not a decision to make while
building.**

### ⚠ WHAT THIS DOES NOT SETTLE

- ⛔ **It does not authorise building either channel.** Still the development pass; **still not a
  chunk.**
- ⚠ **The video channel's FORM is untouched** — where the videos live, how a client receives them,
  whether they are ever on the site behind something. **§9's compression warning and §7's
  build-and-maintain rule both still apply to whatever is made.**
- ⚠ **The candidate second half of the standing test is now LESS pressing but not withdrawn.** With
  two channels, *"does it leave the visitor better able to say what they want?"* **is a question
  about the video channel, and the SITE is judged on the ethos test alone.** ⛔ **Still Carl's to
  rule on.**

---

## ⛔⛔ AND THE SECTION IS NOT ONE THING — Carl, 28 August 2026

> *"It can be seen as education. Also as a sales pitch. Now developing into a philosophy and ethos.
> things can have multiple meanings and uses."*

⚠⚠ **THIS IS A CORRECTION TO HOW THIS FILE HAS BEEN REASONING, AND IT MATTERS MORE THAN IT LOOKS.**

**Several sections above are written as though the section must be ONE thing and the others are
failure modes** — *"a feature showcase"* vs *"process"*, education vs identity. ⛔ **Carl's position
is that these are not competing definitions. They are SIMULTANEOUS ONES.**

| reading | and it is also |
|---|---|
| **education** | teaching a client vocabulary they lack |
| **a sales pitch** | the argument for choosing c2b |
| **a philosophy and ethos** | ⚠ **what it is "now developing into"** — Carl's own word: *developing* |

⛔ **DO NOT COLLAPSE THESE INTO A SINGLE STATED PURPOSE.** ⚠ **A page that announces itself as one
of them argues less well as the others**, and Carl's framing is that it does all three at once
**without declaring which it is doing.**

⚠⚠ **THIS ALSO EXPLAINS WHY THE FILE KEEPS ARRIVING AT THE SAME RULE FROM DIFFERENT DIRECTIONS.**
§1 (process not features), §10a (our own work) and the sorting rule above **converge because they
are three views of one thing, not three separate constraints.**

---

## ⛔ WHAT IS SETTLED HERE AND WHAT IS NOT

- ⛔ **SETTLED: both ends are real, and a proposal that sacrifices either has not solved it.**
  ⚠ **This is the bar every later proposal is measured against.**
- ⛔⛔ **SETTLED, 28 August: WHERE THE BALANCE SITS AND THE MECHANISM THAT HOLDS IT.** ⚠ **See
  *THE RESOLUTION* above — the ethos is the sorting rule, and it is two CHANNELS, not a ratio.**
  *(This line previously read "NOT SETTLED"; Carl settled it the same day.)*
- ⚠ **NOT SETTLED: the video channel's FORM** — where it lives, how a client receives it, and
  whether any of it is ever surfaced on the site.

⚠⚠ **AND IT DOES NOT BLOCK THE NEXT SESSION.** ⛔ **This is a DEVELOPMENT-PASS problem.** The
setup pass — link hot, page exists, bare bones that convey position — **does not require it to be
solved**, and Carl's DAW framing says so explicitly. ⚠ **Do not let this tension delay the
scaffolding, and do not try to resolve it IN the scaffolding.**


# PART ONE — WHAT THE SECTION IS FOR

## 1. Process, not features

**The section is about how decisions get made and why, not about what a website can do.**

**Why.** Feature breadth has been commoditised. Effects that were agency-grade two years ago now
come out of a prompt library for $149 a year — the pitch Carl saw was literally *"websites most
agencies charge $5,000 for."* ⚠ **What has NOT been commoditised is coherent judgement across a
whole site** — and the ability to explain a decision is itself the evidence that one was made.

⛔ **THE RULE THIS CREATES: every example must have a decision attached.** *"Here's the button"* is
a feature showcase. *"Assembled sites all look alike, so this was built rather than picked, and
here's what that produced"* is process.

⚠⚠ **THIS RULE MATTERS BECAUSE IT WILL ERODE** — one more example always feels harmless — **so it
must exist explicitly rather than as an instinct.**

## 2. Carl's style is the thing being sold

**Carl's own point, and the one that redirected everything:** *a site with multiple features can
seem useful, but your own style gets lost amongst a myriad of different features.*

⚠ **The sharper version: a showcase of many features does not merely dilute the position, it
ARGUES THE COMPETITOR'S.** *"Look how many things I can do"* is the template-marketplace pitch.
This site argues the opposite — **everything here was decided, nothing is accidental.**

⚠⚠ **DEVELOPED FURTHER — READ *THE CENTRAL TENSION* AND *THE RESOLUTION* ABOVE BEFORE ACTING ON
THIS SECTION.** ⛔ **The line above is sharper than the finished position.** Carl, 28 August: *"I
can see the benefit of a client seeing features explained in plain language."* **The failure mode
is NOT explaining things to clients — it is VOLUME AND FORM ON THE SITE, a *lexicon*.**

⚠ **And the resolution puts the explaining in a SECOND CHANNEL**, so §2's instinct was right about
what the SITE must not become — **it simply had nowhere else to put the client's need yet.**
*(Wording kept, not rewritten — `context-rules.md`, no retroactive rewriting.)*

⛔ **STANDING TEST, applied whenever something spectacular turns up:**

> **Does this feature express the ethos, or compete with it?**

⚠ **AND IT IS NOW KNOWN TO BE INCOMPLETE.** A section can pass this perfectly and still fail
Carl's problem, by leaving the client unable to say what they want. **A candidate second half is
drafted in *THE CENTRAL TENSION* — it needs Carl's word.**

## 3. Restraint has to be shown as a choice

Without explanation, **a spare site risks reading as a site that could not afford more.** Show a
visitor *why* text arrives at reading speed and the same page reads as disciplined.

⛔ **THE SECTION'S REAL JOB: turning *"there isn't much here"* into *"everything here was
chosen."***

---

# PART TWO — WHAT QUALIFIES AS AN EXAMPLE

## 4. Motion that reads as MATERIAL, not as SIGNAL

**This is the specific reason the button survives the rule in §1.**

Nothing about the element's presence changes. The highlight travels across the surface and the
specular edge shifts round the rim, but **the button does not brighten or dim as a whole, does not
pulse, does not change size.** The eye registers a surface catching light, which is what surfaces
do.

⚠ **A glow that fades up and down is a SIGNAL — it says *look here*. A highlight sliding across
chrome is PHYSICS.** Same quantity of movement, **completely different demand on the viewer.**

⛔ **Worth keeping as a design test in its own right.**

## 5. Show the SCENE, not the part

⚠⚠ **THE STRONGEST THING IN THE SCREENSHOTS IS NOT THE BUTTON.**

Across images 4 and 5, the cards and the button are lit by **the same light** — the sweep passes
across the top-right card while the button sits in shadow, then the button carries a bright rim
while the cards go quiet. **One light source moving through one scene, not five elements each
running their own animation.**

**In terms a client cares about: these elements are AWARE OF EACH OTHER.** Assembled sites are
parts that happen to sit near one another. This is a single space with a single light, and
everything in it responds together.

⚠ **It is also hard to fake with a generator, because a prompt produces a COMPONENT, not a SCENE.**

**Carl's analogy:** five instruments each recorded in a different room versus five in one room with
one set of mics. **Anyone can hear the second one even if they cannot say why.**

⛔ **IF ONE EXAMPLE GOES IN, MAKE IT THIS RATHER THAN THE BUTTON ALONE.**

## 6. A variant proves TUNABILITY, not variety

**Carl's recolour idea, with its justification.**

An identical copy of the live button is **worse** than the live button — video of a thing always
loses to the thing. But a recoloured variant is not a copy, **it is a SPECIMEN.** One blue button
says *"he made a nice button."* **Blue and red together say *"this is a material with parameters,
and it can be tuned."***

**To a prospect that reads as: *this could be mine, in my colours.*** ⚠ **It converts a
demonstration of CRAFT into a demonstration of APPLICABILITY** — a much harder thing to claim in
words.

**Carl's analogy:** the difference between playing someone the record and **showing them the
patch.** The record proves you made a good sound once; **sweeping the filter proves it is an
instrument.**

⛔ **CONSEQUENCES: two variants, not three or more** — three is a feature showcase again. **And the
variant must be recognisably the same material:** too far and it is a different effect, too close
and it is the repetition being avoided.

## 7. Only show what you would build and maintain

**Carried over and still standing.** Every clip is **a promise Carl is volunteering to keep.** If a
prospect points at one and says *I want that*, he is building it on a deadline and supporting it
for years.

⛔ **The filter is not *"may I legally show this"* but *"do I understand this well enough to OWN
it."***

---

# PART THREE — CONSTRAINTS FOUND IN CARL'S OWN MATERIAL

## 8. ⛔ WARM IS ALREADY SPOKEN FOR — a system fact, and load-bearing

In images 4 and 5, **"Less manual admin" carries a salmon outline while everything else is
white-blue. That is the SELECTED state.**

⚠⚠ **So warm is not a free colour — it already has a job, and the job is *this one is chosen*.** A
red demo button on the About page would **use the selection colour to mean something else, three
clicks from where it means selection.** ⛔ **Exactly the kind of inconsistency that never announces
itself but quietly costs the impression of deliberateness everything else is buying.**

⛔ **CONSTRAINT: the variant colour must be one the system has not already assigned a job to.**
*Which* colour is Carl's call; **that it must be unassigned is the principle.**

## 9. Subtlety is correct, and it COSTS demonstrability

**The honest cost of getting this right.**

The reason the effect works on the page is that **it does not demand attention.** In a five-second
clip in a small frame, **there is a real chance the viewer sees nothing** and wonders what they
were meant to notice.

⛔ **SO THE COPY MUST POINT BEFORE THE VIEWER LOOKS** — and it can make the subtlety the point
rather than apologise for it. Register: *"you probably wouldn't notice this, and that's
deliberate."* ⚠ **Stronger than any description of the effect, and it only works because the effect
really is that quiet.**

### ⚠⚠ A PRACTICAL WARNING — video compression

**Slow gradients on near-black are the WORST CASE for video compression.** Expect **banding** — the
smooth chrome falloff breaking into visible steps, dark areas going blotchy and crawling.

⛔ **On a page arguing that details were attended to, a clip that visibly degrades the thing it
demonstrates is WORSE THAN NO CLIP.** Solvable with a higher bitrate, **but that trades directly
against page weight.**

⛔ **TEST-ENCODE ONE CLIP BEFORE COMMITTING TO FIVE.**

⚠ **This strengthens the recolour route relative to video: two STILLS side by side make the
parametric point without needing motion to survive compression at all.**

## 10a. ⛔⛔ EVERY EXAMPLE IS OUR OWN WORK — Carl's ruling, 28 August 2026

**This is the strongest thing settled about examples so far, and it supersedes the assumption
underneath §10.**

**Carl, in his own words:**

> *"I discounted using content online. 1. Its not our work. 2. There could be a minefield when it
> comes to copyright. It is more personal if we use our own examples whether they be on the site or
> are built separately so we can record them on video. Someone who just lists content on video
> maybe showing what can be done. It has validity. But, it is also equally important to show 'why'.
> Style and ethos are important and that signals bespoke. Templates and slop is not what c2b does.
> That is a point we have to get accross."*

### ⚠ THE FIRST REASON IS THE LOAD-BEARING ONE, AND THE ORDER MATTERS

⛔ **"It's not our work" comes FIRST. Copyright comes second.** ⚠ **Do not reduce this to a legal
precaution** — that would make it a problem solvable by finding a permissive licence, and **it is
not.**

**An MIT-licensed effect is legally safe and still fails**, because the section's whole argument
(§1, §2) is *this was decided by us*. ⛔ **A borrowed example — however cleanly licensed — is
evidence of taste in SELECTION, and the thing being sold is judgement in CONSTRUCTION.**

⚠⚠ **THE SELF-DEFEAT IS EXACT: a page arguing "we don't assemble from parts" that is itself
assembled from parts.** The visitor need never learn the provenance for the argument to be hollow;
**Carl would know, and the copy would have to be written around it.**

### ⚠ WHAT "OUR OWN" ADMITS — two routes, both allowed

**Carl names both explicitly:**

1. **Examples already on the site** — the corridor, the cards, the button, the light rig.
2. ⛔ **Examples BUILT SEPARATELY for the purpose, "so we can record them on video."**

⚠⚠ **ROUTE 2 IS A REAL EXPANSION AND SHOULD NOT BE READ PAST.** It means the About section is
**not limited to demonstrating work that already exists.** ⛔ **But it collides directly with §7 —
*only show what you'd build and maintain*** — and §7 survives: a purpose-built demo is still a
promise, and a prospect pointing at it still says *I want that*.

⚠ **The tension is not resolved here and is Carl's to settle when it arises.** Recorded so it is
not discovered mid-build.

### ⛔⛔ §10a's SCOPE WAS BROADENED ON 30 August — it is not a rule about EXAMPLES

⚠⚠ **THE BUILDER READ THIS SECTION AS GOVERNING THE THINGS PRESENTED AS EXAMPLES. CARL APPLIED IT
TO SOMETHING PRESENTED AS NOTHING AT ALL.**

**On the C2B TV idle state — a screen playing before any example is chosen:** *"Could we put a
royalty free video in there? Yes. Are we? No. Why. Because C2B didnt create it."*

⛔ **THE RULE COVERS WHAT IS ON THE SITE, NOT ONLY WHAT IS LABELLED AN EXAMPLE.** ⚠ **A borrowed
background, texture or loop fails for the same reason a borrowed example does — and the reason is
still the first one, not the copyright one.**

⚠ **AND THE CONVERSE WAS ALSO CORRECTED, IN THE OTHER DIRECTION:** ⛔ **§10a says nothing about what
may be STUDIED.** **Carl: *"There is a difference between copying and inspiration. Influence is a
mark of respect."*** ⚠⚠ **The Builder had over-applied the rule to reference material Carl supplied
for direction. A rule that forbade influence would make craft impossible.** ⛔ **Full record: *C2B
TV*.**

### ⚠ "SHOWING WHAT CAN BE DONE" HAS VALIDITY — Carl grants it, and then outranks it

⛔ **Carl does NOT dismiss the showcase approach:** *"Someone who just lists content on video maybe
showing what can be done. It has validity."*

⚠⚠ **THIS MATTERS, because it means the position is a CHOICE BETWEEN TWO WORKING APPROACHES, not a
dismissal of a bad one.** *"But, it is also equally important to show **why**."*

**And that is §1 — process, not features — arriving independently from a different direction.**
⛔ **Two separate lines of Carl's reasoning converge on the same rule, which is why it is the rule
least safe to erode.**

### ⛔ THE POINT THAT MUST GET ACROSS

> **"Style and ethos are important and that signals bespoke. Templates and slop is not what c2b
> does. That is a point we have to get accross."**

⚠ **Note the mechanism Carl names: style and ethos SIGNAL bespoke.** ⛔ **They are not decoration
on top of the argument — they ARE the argument, and they carry it without being stated.**

⚠⚠ **AND THIS BEARS ON THE UNSETTLED "BUILT WITH AI = SLOP" QUESTION ABOVE.** Carl uses the word
*slop* himself, here, about **templates** — not about AI. ⛔ **That is consistent with naming the
category the visitor already distrusts without raising the AI objection**, which the earlier note
flagged as a risk. **Still Carl's to settle; the vocabulary now points one way.**

### ⚠⚠ WHAT THIS DOES TO §10 — mostly moot, deliberately kept

⛔ **§10's licensing rules were written for third-party assets. This ruling means there should not
BE any**, so the rules become a **fallback that should never fire.**

⛔ **DO NOT DELETE §10.** Three reasons:

1. ⚠ **The rules still apply to anything that slips in** — a font, an icon set, a shader snippet, a
   code sample lifted while building. **The ruling covers EXAMPLES; the site has other assets.**
2. **Carl's staleness note already flags the licence positions as needing re-checking if they ever
   become load-bearing.** ⚠ **This ruling makes that less likely, not impossible.**
3. ⛔ **A deleted rule reads as a rule that never existed.** The reasoning for why borrowing is
   dangerous is exactly what stops someone re-opening the question in six months.

⚠ **§10's asset log is now MORE useful, not less** — a log with nothing third-party in it is
**evidence the ruling was kept.**

---

## 10. Downloadable is not licensed

**Standing rules from the licensing session, unchanged:**

- **The download button is not the licence.** Same as sample libraries — identical files, different
  permissions.
- ⛔ **No stated licence means ALL RIGHTS RESERVED. Silence is a no, not a yes.**
- **MIT, Apache, BSD: fine. GPL and AGPL: avoid without advice. Non-commercial or "personal use
  only": rules you out.**
- **Public CodePen Pens are MIT by default** and genuinely usable, keeping the author's notice in
  source.
- **Log every asset — source, URL, licence, date.** ⚠ **Matters more for code than footage, because
  code enters a template cloned across every client.**

---

# WHAT WAS CONSIDERED AND REJECTED

⚠ **Recorded so it is not re-derived.** `context-rules.md` normally excludes explored-and-discarded
approaches; **these are kept because each names the reasoning that makes a tempting option wrong.**

- ⛔⛔ **USING CONTENT FOUND ONLINE AS EXAMPLES — RULED OUT BY CARL, 28 August 2026.** ⚠ **This one
  is a RULING, not a leaning.** Two reasons, **in Carl's order**: *"1. Its not our work. 2. There
  could be a minefield when it comes to copyright."* ⛔ **The first is load-bearing — a permissive
  licence does NOT rescue it**, because a borrowed example is evidence of taste in *selection*
  while the thing being sold is judgement in *construction*. **Full reasoning and what it admits:
  §10a.**

- **Feature showcase with Carl's styling applied.** ⛔ **The multiplicity IS the message** —
  consistent presentation of an inconsistent set still says *"many things."*
- **A few of Carl's features plus a few generic ones.** The generic ones **dilute the argument the
  others make.**
- **Three or more colour variants.** Back to demonstrating **range instead of a decision.**
- **Filming the live button as originally planned.** **The recolour is better.**
- **An interactive colour picker.** ⚠ It would prove the parametric point beyond argument, **but it
  is Architect and Builder territory** — and **a fiddly control on a page about restraint risks
  becoming a toy.** *Noted only so it is known to have been thought of.*
- **Dropping video entirely and writing it as text.** ⛔ **NOT rejected outright.** It is the
  cheapest fallback and **stays live if the clips prove awkward** — the only thing it cannot convey
  is **text arriving at reading speed, which has to be seen.**

---

# STALENESS

⚠ **Almost none of this expires.** Positioning, principles and craft judgements do not go stale —
**that is the difference between this and the hosting and tooling research from the same day, which
does.**

**Two exceptions:**

1. **The licence positions** should be re-checked **if they ever become load-bearing.** ⚠ **Carl's
   §10a ruling makes that much LESS LIKELY — there should be no third-party examples at all — but
   not impossible.** ⛔ **The rules still cover fonts, icons, shader snippets and code samples,
   which are not examples.**
2. **Any of this needs revising if the visual direction moves** — at which point the copy changes
   anyway.

---

# ⛔ NEEDS WRITING DOWN — twelve items, before any of this reaches the Architect

*⚠ **Seven at 28 August. Items 8 and 9 added 30 August from the AI pass, 10 and 11 the same day from
the founder rulings, and 12 from the seats ruling.***

**Carl's list. These are the items most likely to be violated later precisely because they are
currently only understood.**

1. ⛔ **The section is about PROCESS, and every example must have a decision attached.** ⚠ **The
   rule most likely to erode.**
2. ⛔ **The standing test** — *does this express the ethos or compete with it.*
3. ⛔ **The variant principle** — recolour demonstrates **tunability, not variety.** ⚠ **The stated
   REASON determines what a good variant looks like, so record the reason, not just the
   conclusion.**
4. ⛔ **Warm/salmon is the SELECTION STATE and is unavailable for other uses.** ⚠⚠ **A system fact
   that is now load-bearing and will otherwise get violated in six months.**
5. ⛔ **EVERY EXAMPLE IS OUR OWN WORK — and "it's not our work" outranks the copyright reason.**
   ⚠ **Added 28 August after Carl's ruling (§10a).** ⚠⚠ **The reason must travel with it:** recorded
   as a legal precaution alone, it looks solvable by finding a permissive licence — **and it is
   not.**
6. ⛔⛔ **THE SORTING RULE — in the c2b ethos → the site; not in it → a video example for clients.**
   ⚠ **Carl's, 28 August (*THE RESOLUTION*).** ⚠⚠ **Record that the judgement is CARL'S —
   *"something i DEEM to be in the c2b ethos"* — and that no checklist substitutes for it.** ⛔ **A
   Builder who invents one has replaced the ethos with a rule.**
7. ⛔ **THE SECTION IS EDUCATION, A SALES PITCH AND A PHILOSOPHY SIMULTANEOUSLY.** ⚠ **Carl:
   *"things can have multiple meanings and uses."*** ⛔ **Do not collapse it into one stated
   purpose** — several sections in this file were written as though one reading must win.

⚠ **Item 4 is the one with a mechanism available.** The other three are judgement rules that live
in prose; **this one is a fact about the design system that code could assert.** See
`context-rules.md` → *an invariant that lives only in prose is not asserted.*

### ⛔ FIVE MORE, ADDED 30 August 2026 — the list is TWELVE

⚠ **All five are from 30 August and all five are the kind that erode.** Full reasoning: *WHAT CARL
SETTLED ON 30 AUGUST* for items 8 and 9, *THE HUMAN FOUNDER ON THE PAGE* for items 10 and 11, and
*THE SEATS, AND WHAT THE PAGE SAYS ABOUT THEM* for item 12.

8. ⛔⛔ **THE AI COLLABORATION IS CHAMPIONED, NOT DEFENDED.** ⚠⚠ **The register is the ruling.** Carl:
   *"Im not gonna hide it, im gonna celebrate and champion it."* ⛔ **A page written to COUNTER an
   objection is shaped by that objection** — it adopts the sceptic's framing and spends its best
   material on rebuttal. ⚠ **This is the item most likely to erode silently, because defending
   feels responsible and reads as weakness.**
9. ⛔⛔ **NO CONDESCENSION TOWARD OTHER AGENCIES, IN ANY FORM.** ⚠ **Carl: *"Condescension is the
   last thing i would articulate on the site."*** ⚠⚠ **It is a constraint on HOW the AI material is
   written, not a separate topic** — the two camps, the vendors' missed timelines and the
   adapt-or-lose-ground prediction can each be stated as observation or as a sneer, and **the
   difference is register, not content.** ⛔ **The test: does this need the other agency to be
   WRONG in order to land?**
10. ⛔⛔ **THE FOUNDER IS WRITTEN IN THE FIRST PERSON. "I", NEVER THE THIRD PERSON.** ⚠ **Carl:
    *"the simple use of the word 'I' will suffice. Not talked about in the third person as if
    someone else or AI wrote it."*** ⛔ **NOT a style preference** — a site arguing that a human
    holds the authority, while writing about that human in the third person, **has undercut itself
    in its own grammar.** ⚠⚠ **THE ERODING MECHANISM IS KNOWN: a later pass writing polished copy
    drifts into third person NATURALLY, because that is how marketing prose is written — and the
    drift looks like the copy getting more PROFESSIONAL, not like a mistake.**
11. ⛔ **THE HUMAN IS REPRESENTED AS PART OF THE TEAM, IN A SMALL WAY.** ⚠ **Carl's word is
    *"right"*, and it is a COHERENCE requirement, not modesty:** naming four AI seats and omitting
    the human describes **an operation where nobody is answerable** — the visitor's actual fear.
    ⚠⚠ **"Small" is the argument, not a hedge: one seat among five argues the structure better
    than a founder section sitting above it.**
12. ⛔⛔ **THE SET-UP IS DESCRIBED IN PRINCIPLE, NEVER BY ROSTER.** ⚠ **"A team with defined roles,
    and each member knows what they need to know."** ⛔ **No product names, no seat count, no
    diagram, and NEVER the "separated contexts" argument — it is false.** ⚠⚠ **The eroding
    mechanism: this file holds a large body of reasoning, and a later pass will be tempted to put
    the interesting parts of it on the page.** ⛔ **Carl: *"dont over complicate things"* — the page
    gets the conclusion, not the working.**

---

# ⚠ QUESTIONS STILL OPEN

✔ **THE BIGGEST ONE IS NOW ANSWERED.** *THE CENTRAL TENSION* — plain-language explanation vs the
lexicon that would dissolve c2b's style — **was settled by Carl on 28 August with a sorting rule:
in the ethos → the site; not in the ethos → a video example for clients.** ⛔ **See *THE
RESOLUTION*.**

⚠ **It also answered the structural move that was flagged as unexamined** — separating the two.
**The worry was that it might merely relocate the lexicon; it does not, because the second channel
is not part of the site at all.**

**The three below were asked and overtaken rather than answered. Carl's to settle.**

1. **Does explanation live IN the video or in TEXT beside it?** Asked in the first session. ⚠ **The
   process framing has effectively answered it — text carries the reasoning, clips illustrate — but
   BY DRIFT RATHER THAN DECISION.** ⛔ **Worth confirming, because it is the difference between
   minutes and hours per example.**
2. **Do clients ever receive the CODE, or is everything hosted?** ⚠ Determines whether the **GPL
   question is a footnote or a real constraint**, and has implications for **pricing and contracts**
   well beyond licensing.
3. **The qualifying flow.** Images 4 and 5 show the multi-step question sequence — Q5, *"What
   brought you here today?"* ⚠ **If that is a lead-qualification mechanism it is probably a larger
   commercial lever than the About section.** ⛔ **Parked until Carl says otherwise.**

---

# ⛔ THE GATE — unchanged, and it is a two-part job

| path | standing |
|---|---|
| **`app/about/page.tsx`** | **EDITABLE.** The route does not exist; creating it touches nothing protected. |
| **`components/layout/site-header.tsx`** | ⛔ **PROTECTED.** Changing `href="#"` → `/about` needs Carl to name that exact path under `"unlocked"` in `live-work/chunk-scope.json`. |

⚠ **A two-part job with a gate in the middle** — and the second part is one line.

⚠⚠ **DEVELOPED 30 August: THE GATE IS UNCHANGED, BUT THE SCOPE AROUND IT NARROWED.** ⛔ **The
`href="#"` → `/about` change still needs the unlock. What is NEW is that the scaffolding must NOT
also decide whether `/about` RENDERS `SiteHeader`** — Carl has deferred that pending a font
decision and context not yet shared, and **site headers are the next body of work.** ⚠ **See *THE
HEADER IS DEFERRED* below.** ⛔ **Making the link hot and giving `/about` a header are two different
jobs, and only the first is in scope.**

---

# ⚠ A SECOND, LESSER TENSION — the two registers

⚠ **Not the central one.** *THE CENTRAL TENSION* before Part one is the problem the section has to
solve; **this is a delivery question underneath it.**

**One page carries TWO REGISTERS** — three largely prose parts, and one that wants live interactive
demos. ⛔ **Recorded from 27 August and still not settled.** ⚠ **Part three §9 sharpens it rather
than resolving it:** the demo register is the one that fights compression, page weight and the
viewer's attention, while the prose register costs nothing to deliver.

⛔ **AND IT IS A MASTERING PROBLEM, NOT A SETUP ONE** — see *CARL'S FRAMING*. **It does not block
the next session.**


---

# ⛔⛔ CARL'S POSITION, 30 August 2026 — MODERN, CUTTING EDGE, AND THE COLLABORATION IS CHAMPIONED

**⚠ READ THIS BEFORE THE AI MATERIAL BELOW. It sets the REGISTER for all of it, and the register
changes what the arguments are FOR.**

**Carl, in his own words:**

> *"C2B is modern, its cutting edge. Its looking at web design in a whole new way. As for 'Ask not
> what AI can do for you but what you can do with AI' — Im not gonna hide it, im gonna celebrate
> and champion it."*

## ⚠⚠ THIS IS A POSITION, NOT A DEFENCE — AND THE DIFFERENCE IS STRUCTURAL

⛔ **The section does not argue its way out of an objection. It states a position, and the objection
is answered in passing.**

⚠ **A page written to COUNTER something is SHAPED BY the thing it counters** — it concedes the
opening move, adopts the sceptic's framing, and spends its best material on rebuttal. **A page
written to CHAMPION something answers the objection incidentally, because a confident position
makes the objection look like the smaller idea.**

⛔ **THIS RE-POINTS THE TWO ARGUMENTS BELOW WITHOUT REMOVING THEM.** *Answer the objection honestly*
and *the ground is unoccupied* both still stand — ⚠ **but as CONSEQUENCES of the position, not as
its purpose.** **Do not write the section as a rebuttal.**

## ⛔ THE ORGANISING IDEA

> **"Ask not what AI can do for you but what you can do with AI."**

⚠⚠ **IT INVERTS THE VENDOR PITCH EXACTLY.** The vendor pitch is entirely *what it can do for you* —
faster, cheaper, type here. **The inversion asks what you have to BUILD AROUND IT**, which is where
the Architect/Builder system, the protected files, the review gate and the demoted credential all
live. ⛔ **Same insight as the Industrial Revolution point, one turn further in: the tractor was the
easy part; the QUALITY SYSTEM was the work.**

⚠ **WHETHER THE LINE ITSELF APPEARS ON THE PAGE IS OPEN** — it can read as slogan rather than
argument, and §9's instinct is that the quiet version is stronger. ⛔ **But as the ORGANISING IDEA
underneath the section it is settled**, and it is the clearest statement of the position reached in
any session so far.

---

# ⛔ WHAT CARL SETTLED ON 30 AUGUST — five rulings

⚠ **These are decisions, not leanings. Do not reopen them.**

### 1. ⛔⛔ AI IS RAISED ON THE PAGE, AND CHAMPIONED

**Carl:** *"Yes, i want to be honest and counter the argument."* **Then, developed the same
session:** *"Im not gonna hide it, im gonna celebrate and champion it."*

⚠⚠ **THIS SETTLES THE §10a OPEN QUESTION**, which flagged a real risk: that raising AI at all
invites an objection the visitor was not going to make, and noted that Carl uses *slop* about
**templates**, not about AI. ⛔ **The question is now decided the other way, by Carl, and the note
in §10a stands as the reasoning that was weighed rather than a live alternative.**

⚠ **The competitors' silence is part of why.** Of the local agencies surveyed, some minimise AI and
say so disparagingly and some never mention it. ⛔ **Neither is an argument, so the ground is
unoccupied** — and a position nobody else holds cannot be taken by them later without looking like
a reversal.

### 2. ⛔ THE FRAME IS COLLABORATION, NOT TOOL USE

**Carl:** *"To indicate that this is a collaboration. Built by humans and AI. Each bringing their
own expertise and experience. C2B has a human founder but also an Architect, Builder, Strategist
and Designer."*

⚠ **AND IT ANSWERS THE SIZE PROBLEM AS A SIDE EFFECT.** One person, **not working alone** — which
is a literal description of the setup rather than a spin on it.

### 3. ⛔ THE OBJECTION IS GRANTED AND RELOCATED — the vendor default is the culprit

**Carl:** *"The problem isnt AI, the problem is how AI is utilised. All vendors encourage just get
in there and prompt away. Thats fine for a casual user and vendors want to sell product/tokens.
People/companies who want to work with AI on a more serious basis have to go a lot further than
'vibe coding'."*

⚠⚠ **THIS IS THE STRONGEST MOVE IN THE SESSION AND IT IS NOT THE OBVIOUS ONE.** ⛔ **It says the
slop people have seen is not AI FAILING — it is the product WORKING AS SOLD.** Vendors monetise
usage, so they optimise for *start immediately*, not *build something that holds up*.

⛔ **SO THE VISITOR'S BAD IMPRESSION IS EVIDENCE, NOT PREJUDICE.** They have seen the default path's
output, and the default path is optimised for something other than quality. ⚠ **They are not asked
to discount what they saw — they are told what they were looking at.**

⚠⚠ **WHY THIS BEATS "WE USE IT WELL": every vibe coder alive would say they use it well.** ⛔ **Almost
nobody can NAME WHY THE DEFAULT PRODUCES SLOP — and naming the mechanism cannot be faked, because
it only comes from having gone past it.**

### 4. ⛔ THE SITE IS THE PROOF — *"the proof is in the pudding"*

⚠ **§1 (process not features), §10a (our own work) and the sorting rule already converge here.**
⛔ **This is a fifth line of Carl's reasoning arriving at the same place, which is why it is the
rule least safe to erode.**

### 5. ⛔⛔ NO CONDESCENSION TOWARD OTHER AGENCIES — IN ANY FORM

**Carl, 30 August, unprompted and emphatic:** *"Condescension is the last thing i would articulate
on the site."*

⚠⚠ **THIS IS A CONSTRAINT ON HOW EVERYTHING ABOVE IS WRITTEN, NOT A SEPARATE TOPIC.** ⛔ **The
material in this pass is unusually easy to write condescendingly** — the two camps, the missed
vendor timelines, the agencies that will have to adapt. **Every one of those can be stated as
observation or as a sneer, and the difference is register, not content.**

⚠ **AND IT IS THE MIRROR OF WHAT CARL FOUND ON THEIR SITES.** Some local agencies were *"somewhat
disparaging and condescending"* about AI. ⛔ **Doing the same in the other direction would adopt
the posture the section exists to be an alternative to.**

⚠ **The test: does this need the other agency to be WRONG in order to land?** If yes, rewrite it.
**§9's instinct — the quiet version is stronger — applies to argument as much as to motion.**

---

# ⚠⚠ CARL'S MARKET READ — REASONING, EXPLICITLY NOT COPY

⛔⛔ **THIS SECTION IS WHY THE POSITION IS WHAT IT IS. NONE OF IT IS PAGE COPY, AND CARL SAID SO
DIRECTLY.**

**Carl, 30 August:** *"Condescension is the last thing i would articulate on the site. I mention it
to you because that is where business will be going."*

⚠⚠ **A DISTINCTION THIS FILE MUST KEEP: some of what Carl says is POSITIONING THAT GOES ON THE
PAGE, and some is HIS READ OF THE MARKET that explains why the positioning is what it is.** ⛔ **The
second is load-bearing reasoning and must not be lost — but recording it as though it were copy
would put words on the page Carl has explicitly ruled out.**

⚠ **A prior session's error, recorded so it is not repeated: this material was read as draft copy
and answered with a correction about register. Carl was describing the market, not writing a line.**

**The read, in Carl's words:**

> *"that is where business will be going. Some cant see it, others dont want to see it. Change for
> humans can be difficult. Is AI gonna take all our jobs? No, of course not. But, some will go as
> they have always done. The change isnt happening fast enough for the vendors, they predicted
> things to be quicker. The bottleneck is humans but that is slowly changing."*

## ⚠ THE BOTTLENECK IS ABSORPTION, NOT CAPABILITY

⛔ **The vendors' timelines assumed the constraint was capability. It is not — it is ABSORPTION.**
Organisations have to change how work is structured, who checks what, where authority sits, and
what *done* means. ⚠ **That is slow because it is human and organisational, not technical** — and
it is a fair description of most industrial transitions: **the machine arrives years before the
working practices that make it pay.**

⚠⚠ **AND IT EXPLAINS WHAT WAS ACTUALLY FOUND ON THE LOCAL SITES.** Two camps, minimise-and-disparage
or say-nothing, and ⛔ **neither has a PRACTICE.** **That is not stubbornness so much as not having
done the work of restructuring** — which is genuinely hard and does not come out of a prompt.

## ⛔ WHAT STAYS OFF THE PAGE

- ⛔ *"Some will go as they have always done."* ⚠ **Honest, and the sentence most likely to read as
  callous.** **The page is talking to someone deciding who builds their website, not to someone
  worried about their job.** ⛔ **It belongs in the reasoning; it is not copy.**
- ⛔ **The prediction that other agencies must adapt or lose ground.** ⚠ **Confident as a read of the
  market; as a line addressed AT other agencies it becomes ruling 5's failure mode** — and it
  invites the reader to check back in two years and score it.

---

# ⚠ THE THREE CREDIBILITY ANSWERS, RE-FRAMED — Carl, 30 August

**⛔ Context: the conventional agency About page answers *why should you trust us* with SIZE,
LONGEVITY and VOLUME. C2B has none of the conventional forms of the three** — which is a large part
of why the conventional page is structurally unavailable here. ⚠ **Carl re-framed all three rather
than conceding them.**

| | **the conventional answer** | **Carl's re-frame** |
|---|---|---|
| **Size** | *look how many of us* | **One person — and one JUDGEMENT applied throughout.** |
| **Longevity** | *look how long in web* | **Decades in music technology.** |
| **Volume** | *look how many projects* | **The site IS the portfolio, plus the examples in the section.** |

### ⚠ SIZE — the argument is ONE JUDGEMENT, and cost is a side effect

**Carl notes one person *"could also imply costs could be more reasonable."*** ⛔ **Recorded, but
price is the WEAKEST version of the argument** — it invites comparison on price, the one axis where
someone will always undercut. ⚠ **Mention once, do not build on it.**

⚠⚠ **THE STRONG VERSION IS ALREADY IN THIS FILE.** §5 — *show the scene, not the part* — **five
instruments in one room with one set of mics.** ⛔ **A ten-person agency CANNOT sell that, because
the work is genuinely divided across people.** **Being one person is not being compensated for; it
is what makes the coherence possible.**

### ⚠ LONGEVITY — "IT adjacent" understates it and should not be the phrasing

**Carl: *"Decades in Music Technology. IT adjacent."*** ⛔ **"Adjacent" is a hedge that concedes the
point it is trying to win.** ⚠⚠ **Music technology is not adjacent to this work — it is UPSTREAM of
it.** **The DAW model is not a metaphor reached for; it is the actual method used to build this
site**, recorded in `working-with-carl.md` and governing how chunks are scoped. ⛔ **That is the
source of the method, not adjacent experience.**

### ⚠ VOLUME — the site is the portfolio, and the known risk has an answer already

⛔ **The risk: a sample of ONE.** A prospect may reasonably ask whether it can be done for *their*
business rather than for C2B's own. ⚠ **§6's variant principle already anticipates exactly this** —
the recolour that proves **tunability, not variety.** **Same problem, answer already in the file.**

---

# ⚠⚠ THE TRACTOR — Carl's argument, and the objection it must survive

**Carl, 30 August:**

> *"I live in the city that started the Industrial Revolution. Do you think that a local town market
> would care that they got their product because the local farmer used a tractor instead of a
> plough? Or did they see the advantages of these new fangled methods and machines?"*

⛔ **WHAT IT DOES: it relocates the question from *was a machine involved* to *is the product
good*.** The market did not care about the plough. **They cared about the grain.**

## ⚠⚠ AND THE GAP IN IT, WHICH IS WHERE THE OBJECTION LIVES

⛔ **The tractor's output was IDENTICAL IN KIND to the plough's** — same wheat, more of it, cheaper.
**Nobody feared a tractor would produce WORSE grain.**

⚠⚠ **THE AI OBJECTION IS NOT A MACHINE OBJECTION — IT IS A SLOP OBJECTION.** What people have
actually seen is output that is faster, cheaper **and visibly worse**: generic, interchangeable,
subtly wrong. ⛔ **They are not wrong to have noticed, and the analogy as stated does not answer
them.**

## ⛔ THE COMPLETION — and it is the history of the same city

⚠ **The mills that survived were not the ones that refused machines, nor the ones that merely bought
them. They were the ones that BUILT A SYSTEM AROUND THE MACHINE so the output stayed good at
volume.** ⛔⛔ **QUALITY CONTROL IS AN INDUSTRIAL INVENTION. It exists BECAUSE machines can produce
bad output fast.**

⚠⚠ **THAT IS WHAT THE ARCHITECT/BUILDER SYSTEM IS**, and it is the same shape as ruling 3: the
default path produces slop, so the work is the system that stops it.

> ⛔ **THE ARGUMENT IS NOT *"machines are fine, look at the tractor."***
> ⛔ **IT IS: *AI without a system produces slop. That is true, and everyone has seen it. So we
> built the system."***

⚠ **It concedes the objection completely and then makes it the setup** — which is why it works
without condescension (ruling 5). **It does not require anyone to be wrong.**

---

# ⛔⛔ THE FOUR-SEATS PROBLEM — every seat is Claude, and a sceptic will say so

⚠⚠ **THIS IS THE MOST LIKELY POINT OF FAILURE ON THE WHOLE PAGE, and it is recorded now so it is
not discovered after publication.**

⛔ **"Architect, Builder, Strategist and Designer" READS AS FOUR COLLABORATORS.** A knowledgeable
visitor knows it is one model under four sets of instructions. ⚠⚠ **If they suspect it is being
dressed up as a team, the honesty the section is spending its length to establish is gone in a
sentence — ON THE PAGE WHERE IT WAS CLAIMED.**

## ⚠ THE PROPOSED ANSWER — lead with it. ⛔ RECOMMENDATION ONLY; CARL HAS NOT RULED

⛔ **Do not hide it. State it before anyone can allege it was obscured** — because the real thing is
more impressive than the impression.

⚠ **The seats are not four employees. They are SEPARATED AUTHORITY:**

- **The Builder cannot approve its own work.**
- **The Architect reviews and recommends but approves nothing.**
- **Only Carl grants approval.**
- ⚠ **Files are protected so a seat CANNOT edit what it has not been authorised to touch — enforced
  by a hook, not by good intentions.**

⛔⛔ **THAT IS SEPARATION OF DUTIES, which any serious engineering organisation runs on — and the
reason it exists is EXACTLY the failure mode the visitor is worried about: an AI that marks its own
homework produces slop.** ⚠ **The ability to do that was removed.**

⚠⚠ **STATED THAT WAY, "IT IS ALL ONE MODEL" STOPS BEING THE GOTCHA AND BECOMES THE POINT.** One
model, constrained four ways, with a human holding the only approval authority.

⛔ **OPEN AND CARL'S: whether the seats are named on the page at all, and whether "one model,
separated authority" is stated outright.**

---

# ⛔⛔ THE HUMAN FOUNDER ON THE PAGE — Carl's rulings, 30 August 2026

**⚠ THIS ANSWERS THE FOUR-SEATS PROBLEM DIRECTLY ABOVE, and it is placed here for that reason.**
⛔ **A page that names four AI seats and leaves the human blank has described an operation with
nobody in it** — which is precisely the thing the sceptical visitor is afraid of.

## ⚠ THE QUESTION AS CARL PUT IT

> *"i have to decide whether to put anything about myself on in the about section. Not to name
> myself, but who the human founder is. Why this agency was set up. Philosophy, principles and
> ethos."*

⚠⚠ **IT IS TWO QUESTIONS, NOT ONE, AND THEY CARRY DIFFERENT RISK:**

| | standing |
|---|---|
| **Why the agency was set up; philosophy, principles, ethos** | ⛔ **NOT OPTIONAL.** The section already *is* *"education, a sales pitch and a philosophy at once"*, and *"style and ethos signal bespoke"* (§10a). **A page arguing everything was decided, which never says by whom or why, has a hole where its foundation should be.** |
| **Who the human founder is** | ⚠ **The genuinely open one — and Carl settled it below.** |

---

## ⛔ RULING 1 — THE WORK SPEAKS FIRST; PERSONABILITY BELONGS TO CONTACT

**Carl, in his own words:**

> *"I believe the work should speak for itself, first and foremost. But when a client makes contact
> thats the time to become more personable."*

⚠⚠ **THIS IS A SEQUENCING RULE AND IT RESOLVES WHAT THE PAGE IS FOR.** ⛔ **The About section is not
where the relationship starts — it is where someone decides whether to start one.** **The warmth
arrives when there is a person to be warm at.**

⚠ **It is also the answer to the conventional About page's biggest temptation.** The origin story,
the headshot, the fun fact — all of it is relationship-building performed at someone who has not
yet decided to have a relationship.

---

## ⛔⛔ RULING 2 — FIRST PERSON. "I", NEVER THE THIRD PERSON

**Carl, in his own words:**

> *"If i do make a small section in about which is me, the simple use of the word 'I' will suffice.
> Not talked about in the third person as if someone else or AI wrote it."*

⚠⚠ **THIS IS NOT A STYLE PREFERENCE AND MUST NOT BE RECORDED AS ONE.** ⛔ **A site arguing that a
human holds the authority here, while writing about that human in the third person, has undercut
itself IN ITS OWN GRAMMAR.**

⚠⚠ **CARL NAMES THE EXACT FAILURE: *"as if someone else or AI wrote it."*** ⛔ **Third person is the
voice of a company describing an employee — and it is also, precisely, what a generated founder bio
sounds like.**

> **"Carl brings two decades of experience" is what an AI would write about a founder.**
> **"I" cannot be delegated in the same way.**

⚠ **The word does the work the sentence would otherwise have to CLAIM** — which is §1's rule
(a decision with its reasoning attached) arriving in the grammar rather than the content.

### ⚠ AND IT SERVES THE NO-CONDESCENSION RULING

⛔ **First person is harder to be grandiose in.** *"I got tired of watching this done badly"* is a
person talking. *"Carl founded C2B after recognising a gap in the market"* is a brochure. ⚠ **Ruling
5 of the AI pass is easier to keep in first person than in third.**

### ⚠⚠ THIS IS THE ITEM MOST LIKELY TO ERODE, AND THE MECHANISM IS KNOWN

⛔ **A later pass writing polished copy will drift into third person NATURALLY, because that is how
marketing prose is written.** ⚠ **The drift will not look like a mistake — it will look like the
copy getting more professional.** **On the needs-writing-down list for exactly this reason.**

---

## ⛔⛔ RULING 3 — THE HUMAN IS REPRESENTED AS PART OF THE TEAM

**Carl, in his own words:**

> *"If we are to mention our system its only right i think that the human collaborator should be
> represented in a small way, as part of the team."*

⚠⚠ **THIS IS THE LOAD-BEARING ONE, AND IT IS A COHERENCE REQUIREMENT RATHER THAN MODESTY.**

⛔ **The whole argument of the AI pass is that separated authority works BECAUSE A HUMAN HOLDS
APPROVAL.** ⚠ **Name the four AI seats and omit the human, and the page has described exactly the
configuration the visitor fears: an operation where nobody is answerable.**

### ⚠ "IN A SMALL WAY" IS THE ARGUMENT, NOT A HEDGE

⛔ **Proportionality is itself a claim about how the system works.** **One seat among five, listed
like the others, argues the structure more convincingly than a founder section sitting above it.**
⚠ **The restraint is the point** — which is §3 (*restraint has to be shown as a choice*) reaching
the team block.

---

## ⚠⚠ A CONSEQUENCE WORTH NAMING — the founder section and the collaboration passage may be ONE THING

⛔ **RECOMMENDATION, NOT A RULING. Carl has not decided this and it is a structural call about the
section.**

⚠ **If the human is a SEAT IN THE TEAM (ruling 3), then "a small section which is me" and the
collaboration passage are plausibly the SAME PASSAGE** — not a founder bio plus a system diagram,
but **one place where the five seats are set out and one of them says "I"**, and that one is the one
holding approval.

**Why it may be better:**

- **More economical** — one block, not two.
- ⚠ **It puts the human exactly where the argument needs them**, rather than above it.
- ⛔ **It avoids the conventional About-page founder block** that Carl was right to be wary of.
- ⚠⚠ **"Small" stops reading as thin.** **A short entry among four others is PROPORTIONATE; a short
  standalone founder section can read as RETICENCE.**

---

## ⚠ WHAT REMAINS OPEN ON THIS SUBJECT

⛔ **CARL'S "not to name myself" WAS ABOUT SUBJECT MATTER, NOT ANONYMITY** — the section is about
who the human founder *is* in the operation, not a personal profile. ⚠ **Ruling 2 settles the
VOICE; it does not settle whether the NAME appears anywhere on the page.**

⚠ **The trust consideration, recorded rather than pressed:** someone spending real money usually
wants to know who is accountable. ⛔ **It may well resolve OUTSIDE this section** — the contact
flow, a footer — **rather than in it.** ⚠ **Not urgent, and NOT a setup-pass question.**

**Also unresolved and belonging to the development pass:**

- ⚠ **Whether the philosophy is STATED or only DEMONSTRATED.** ⛔ **§9 warns that explaining a
  quiet thing can weaken it** — but the file also records that the visitor may lack the vocabulary
  to see what they are looking at, which is the whole reason the plain-language channel exists.
  ⚠ **Leaning, not decided: state it briefly and let the site prove it — the statement is what
  lets someone RECOGNISE what they are seeing.** ⛔ **Carl's to rule.**
- **What the origin story actually says.** ⚠ **The raw material is in this conversation and in the
  credibility re-frames** — decades in music technology, the method that turned out to apply, the
  local survey that found two camps and no practice. ⛔ **Not drafted, and drafting it is the
  development pass.**

---

# ⚠ THE CLAIM NEEDS EVIDENCE — §1 applied to the AI argument itself

⛔ **"The problem is how AI is utilised" is an ASSERTION until something demonstrates it.** ⚠ **It
is true, and it sounds exactly like what someone who would say it either way would say.**

⚠⚠ **§1 ALREADY GOVERNS THIS: every example must have a decision attached.** ⛔ **The rule applies to
the AI argument itself, not only to the visual examples** — which is §1 reaching a fourth
destination.

**Candidates, all from this project's real record, none invented for the page:**

- ⛔ **A verify credential DEMOTED because it described the wrong script** (D-064). **The instrument
  was wrong, it was caught, and the pass was WITHDRAWN rather than kept.**
- **Four defects found in the harness that checks the other harnesses** — and ⚠ **the fix for one
  tripped the defect it was fixing, twice, before it was written correctly.**
- **A rule written and then broken twice the same day, by its own author, and recorded as such**
  (`context-rules.md`).

⚠⚠ **NOBODY PROMPTING AWAY HAS ANY OF THAT, because none of it is produced by accident.** ⛔ **One
of them, in plain language, proves what a thousand words of "we use AI responsibly" cannot.**

⚠ **WHICH ONE, AND HOW MUCH, IS THE DEVELOPMENT PASS — NOT THE SETUP.**

## ⛔ AND THE PROCESS MUST NOT BECOME THE PITCH

**Carl:** *"What will matter in the end to a client is the quality of the product."*

⚠⚠ **AN ABOUT PAGE THAT EXPLAINS ITS GOVERNANCE SYSTEM IN DETAIL HAS MADE THE MACHINERY THE
SUBJECT.** ⛔ **The tractor is interesting to Carl. The market wants the grain.**

⚠ **The system is EVIDENCE OFFERED IN SUPPORT OF QUALITY, not the thing being sold** — probably
brief, probably concrete, probably followed immediately by the work it produced.

> ⚠⚠ **THE TEST IS INSIDE CARL'S OWN ANALOGY: the farmer did not explain the tractor. He brought
> better grain to market and let people draw the conclusion.**

⛔ **HOW MUCH PROCESS IS TOO MUCH IS OPEN AND IS CARL'S.**

---

# ⛔⛔ THE SEATS, AND WHAT THE PAGE SAYS ABOUT THEM — 30 August 2026

⚠⚠ **THE CONCLUSION IS ONE SENTENCE AND IT IS AT THE TOP FOR A REASON.** Everything after it is the
reasoning that produced it. ⛔ **The page gets the conclusion, not the working.**

> ## ⛔⛔ **A TEAM WITH DEFINED ROLES, AND EACH MEMBER KNOWS WHAT THEY NEED TO KNOW.**

⚠ **Carl's instruction, and he said it against a file that had just grown by 600 lines:** *"describe
the set up in principle and i will say this ironically — dont over complicate things, lol. We will
be dealing with businesses and you have already alluded to mirroring what happens in the real
world. Business owners will recognise this, seeing it as an efficient use of AI."*

## ⚠⚠ WHY THE PRINCIPLE BEATS THE ROSTER — recognition is the mechanism

⛔ **A business owner does not need the roster, the product names, or where each seat runs. THEY
ALREADY KNOW THIS SHAPE — they run it themselves.** Everyone has a job, nobody is copied in on
everything, and someone decides who needs what.

⚠⚠ **THE RECOGNITION IS THE WHOLE ARGUMENT.** ⛔ **It is not *"here is our clever AI setup"* — it is
*"they run it like a business."*** **And the implicit comparison finishes the job without being
stated:** what the visitor is worried about is **one person typing into one box**, and this is
visibly not that.

⚠ **"EFFICIENT USE OF AI" IS CARL'S FRAME AND IT IS BETTER THAN AN ARGUMENT ABOUT QUALITY** —
efficiency is a language business owners already think in, and it does not require them to take
anything on trust.

## ⛔ WHAT THE PRINCIPLE RULES OUT — stated so it is not re-litigated

- ⛔ **The four product names** (CA, CB, CS, CD as branded seats)
- ⛔ **Where each seat runs** — which products, which application
- ⛔ **The AI-to-human seat count** as a talking point
- ⛔ **Anything requiring a diagram**
- ⛔⛔ **The "separated / disconnected contexts" argument IN ANY FORM** — see the correction below.
  ⚠ **It was factually wrong AND it was the weaker argument.**

⚠⚠ **MOST OF WHAT THIS FILE HOLDS IS REASONING THAT PRODUCED THE LINE, NOT THE LINE.** ⛔ **That is
the correct division of labour and Carl has ruled on it explicitly:** *"I would rather have you with
600 lines of information that you could choose to edit and interpret and present in a logical and
coherent way than 100 lines of copy. What you will have is a body of information."*

⚠ **This is §9 again — the quiet version is stronger — applied to the argument rather than the
motion.**

## ⚠ THE ONE THING KEPT FROM THE LONGER VERSION

⛔ **"I am the bridge that connects you all"** — Carl's own words, and it survives because it is
short, true, and **puts the human in the structure without a founder block.**

⚠⚠ **AND IT ANSWERS THE ACCOUNTABILITY QUESTION WITHOUT RAISING IT.** A cautious buyer wants to know
someone is answerable; **this says so in passing rather than as a claim.** ⛔ **That is ruling 3 of
the founder pass arriving at the same place — the human as a seat among the others, described in a
small way.**

---

## ⛔⛔ THE CORRECTION — "the seats are separated" WAS FALSE, and the error is recorded

⚠⚠ **RECORDED BECAUSE THE MISTAKE IS INSTRUCTIVE, NOT TO FLAG A FAULT.** *(`context-rules.md` —
approved work is amendable; and this file is DEVELOPED, not corrected.)*

**The claim made in discussion, and it was wrong:** *"none of the four seats can talk to each other
— CS doesn't know what CA ruled, CD doesn't know what CB built, every transfer happens because Carl
carries it."*

**Carl's correction, in his own words:**

> *"You are not separated. Both you and CA has access to the repo. CS if i decide can have access to
> all or just a single file of the repo. It depends on the context... So i wouldnt want a setup
> where each team member has no idea or connection to the others. The best practice is that each
> team member 'knows what it needs to know'. Knows their role and that includes me."*

### ⚠⚠ WHERE THE ERROR CAME FROM — the useful part

⛔ **The boundary was inferred from WHERE THE SEATS RUN** — different products, different contexts —
**and the PRODUCT boundary was treated as an INFORMATION boundary.** ⚠ **It is not. The products
differ; the access is a decision Carl makes per context.**

⚠⚠ **THIS IS THE SAME SHAPE AS THE HARNESS FAILURES ALREADY ON THE RECORD** — a true observation
(the seats run in different places) carried to a conclusion it does not support (therefore they
cannot see each other). ⛔ **`context-rules.md` → *an instrument that names a global property while
checking a local one lies by implication.***

### ⛔ THE ACTUAL PRINCIPLE, AND WHY IT IS STRONGER

| | **"separated"** — the wrong version | **"knows what it needs to know"** — Carl's |
|---|---|---|
| **what it is** | a property of the ARCHITECTURE | ⛔ **a property of the DESIGN** |
| **who set it** | nobody — an accident of tooling | ⚠ **Carl, per context, and changeable** |
| **against a sceptic** | invites *prove it* | ⛔ **a description of PRACTICE** |

⚠ **Carl's own example of the right amount:** for CD, ⛔ *"you will need a top level view of what
'the guy in the preceeding office does'. Do you need to know every nuance? No, that would be work
duplication but you would need to know the best way to deal with stuff that is imported to you."*

⛔⛔ **THE TEST IS NOT "HOW LITTLE CAN THIS SEAT KNOW" BUT "WHAT DOES THIS SEAT NEED IN ORDER TO DO
ITS JOB WITH WHAT IT RECEIVES."**

### ⚠ "AND THAT INCLUDES ME"

⛔ **Carl is not the seat that knows everything — he is the seat whose ROLE is deciding what
moves.** ⚠ **A role with a scope, not an exemption from having one.** **This is consistent with the
founder rulings and is why the bridge line works: a bridge is a route, not a summit.**

### ⚠⚠ THE COST OF NEED-TO-KNOW, RECORDED HONESTLY

⛔ **A seat can be CONFIDENTLY WRONG about something outside its scope** — and this project has
already paid for it. ⚠ **`one-context.mjs` answered a narrower question than its name implied, and
everything built on that verdict inherited the error.**

⛔ **The rule that catches it already exists: `context-rules.md` → *declare what you do not watch*.
⚠ It applies to SEATS as much as to instruments.** **If CD hands the Builder a mockup and the
Builder does not know what was decided upstream, the move is to SAY SO, not to infer it** — which
is exactly the failure made in this session's discussion, at the level of the team rather than a
harness.

---

## ⚠ THE ROSTER AS IT ACTUALLY STANDS — reference, and NOT page content

⛔⛔ **RECORDED BECAUSE IT IS TRUE ABOUT THE OPERATION, NOT BECAUSE THE PAGE SAYS IT.** ⚠ **The page
gets the PRINCIPLE (above). This table is for whoever needs to know how the work really moves.**

| seat | where it runs | role | repo access |
|---|---|---|---|
| **CA** — Architect | in-house, this repo | reviews, plans, findings; **approves nothing** | yes |
| **CB** — Builder | this repo | implements the chunk | yes |
| **CS** — Strategist | **Claude Projects, Desktop app** | brainstorming and subject research — **upstream of a chunk** | ⚠ **Carl's call per context** — all, one file, or none |
| **CD** — Claude Design | **Claude Design** | brand, colour and typography analysis from a client's existing site plus their brief → initial mock-up | ⚠ **output can be IMPORTED here** |
| **Carl** | the bridge | ⛔ **decides what moves between seats.** Sole approval authority | — |

⚠⚠ **TWO FACTS IN THIS TABLE ARE NEW TO THE RECORD AND ARE NOT IN `ai-roles.md`:**

1. ⛔ **CS runs upstream of a chunk**, in a different product, and **may be given repo access at
   Carl's discretion.**
2. ⛔ **CD's output CROSSES INTO THIS REPO.** ⚠ **It is the only seat other than CA/CB whose work
   lands in the codebase** — which is why the Builder needs *the top-level view of the preceding
   office*.

⛔ **`ai-roles.md` DESCRIBES A DIFFERENT ARRANGEMENT AND DOES NOT MENTION CS OR CD AT ALL.** ⚠ **Not
fixed here — that is a governance change, and Carl has flagged a dedicated CD conversation for
later which will change what gets written.** **Recorded so the gap is known rather than discovered.**

---

## ⚠ THE TEAM ANALOGY — Carl's, and where it belongs

**Carl, 30 August:** *"that famous team in red are about to play. Every member of that team are
equally important. Each has a role to play. As someone who has worked in various teams, worked with
various band members i understand the value of good structure and the importance of every team
member."*

⚠⚠ **WHAT IT ADDS THAT THE DAW MODEL DOES NOT.** ⛔ **The DAW is SEQUENTIAL — track, re-track,
master, one pass after another. A TEAM IS SIMULTANEOUS** — different jobs at the same moment, and
**the structure is what makes them one thing rather than eleven.** ⚠ **That is closer to how the
seats actually run.**

⛔ **AND IT ANSWERS A QUESTION THE SECTION WOULD OTHERWISE TRIP OVER:** *is the human the important
one and the AI seats the tools?* ⚠ **Carl's answer is no — everyone has a role, and the structure is
what makes it work.** **Consistent with founder ruling 3: a seat among five, in a small way, rather
than above the list.** ⚠ **The band point does the same work from the other side — a rhythm section
is not a support act.**

### ⛔ BUT THE FOOTBALL REFERENCE IS A LOCAL SIGNAL — reasoning, not copy

⚠ **It reads to people who share it and is invisible or alienating to those who do not.** ⛔ **It
belongs in the REASONING for why the structure is described as a team — not as an image on the
page.** ⚠ **Flagged now rather than left to arrive as copy later. Carl's call, as always.**

---

## ⛔ WHAT THIS SETTLES, AND THE ONE QUESTION IT LEAVES

**Settled:**

- ⛔⛔ **The page describes the set-up IN PRINCIPLE, not by roster.** ⚠ **One sentence, aimed at
  recognition.**
- ⛔ **The frame is EFFICIENT USE OF AI**, in language a business owner already thinks in.
- ⛔ **The bridge line survives**; the separation argument does not.

**Open, and Carl's:**

- ⚠ **Whether the principle is SCAFFOLDING-READY or development-pass material.** ⛔ **It may be
  scaffolding-ready** — Carl's DAW framing asks for *bare bones that convey position*, and **"a team
  with defined roles, each knowing what they need to know" IS a position, statable in a sentence.**
  ⚠ **Raised, not decided.**

---

# ⛔⛔ THE PAGE STRUCTURE — Carl, 30 August 2026. FOUR SECTIONS, MIRRORING THE LANDING PAGE

⚠ **This is the first structural material in this file. Everything before it is about what the
section ARGUES; this is about where the argument sits.**

| # | section | standing |
|---|---|---|
| **1** | **The founder and the process** — ⛔ **a top-level view of the file system**, and ⚠ **the counter-argument lives HERE** | named |
| **2** | **The roles** — *"an explanation of the roles that builds on the process… to show structure and roles"* | named; ⚠ **the TITLE is open** — Carl: *"Does it have to be called 'meet the team?' No."* |
| **3** | **Video examples and non-technical explanation** | named; **see the recolour method below** |
| **4** | ⛔ **TBD** | **Carl's, undecided** |

⚠⚠ **"MIRRORING THE LANDING PAGE" IS A STRUCTURAL INSTRUCTION, NOT A VISUAL ONE** — four sections,
as the landing page has four. ⛔ **It does not authorise copying the landing page's layout, and
`app/page.tsx` remains protected.**

## ⛔⛔ HOW THIS RESOLVES ITEM 12 — it is a refinement, NOT a reversal

⚠⚠ **A CONFLICT WAS RAISED AND CARL SETTLED IT.** Item 12 says **the set-up is described in
PRINCIPLE, never by roster** — and section 2 was first stated as *"Meet the Team. CA CB CD and CS"*,
which reads as the roster item 12 forbids.

**Carl's resolution:** ⛔ **section 1 carries the PRINCIPLE and the counter-argument; section 2
EXPANDS it into structure and roles.**

> ⚠⚠ **THAT IS NOT A ROSTER REPLACING A PRINCIPLE. It is the principle, then enough structure to
> make it real.**

⛔ **ITEM 12 STANDS UNCHANGED.** ⚠ **Its target was a page that says nothing but product names.**
**Section 2 earns its place by ADDING STRUCTURE — Carl's own test: *"its important to expand a
little on the process. To show structure and roles."*** ⛔ **A section that only listed CA, CB, CD
and CS would still violate item 12.**

## ⚠ "A TOP LEVEL VIEW OF THE FILE SYSTEM" — the calibration is already on record

⛔ **It is the SAME calibration Carl gave for CD earlier the same day:** *"a top level view of what
the guy in the preceeding office does. Do you need to know every nuance? No, that would be work
duplication."*

⚠⚠ **APPLIED TO THE PAGE: the governance system as a TOP-LEVEL VIEW, not a tour.** ⛔ **This is the
same instruction as *the process must not become the pitch*** — arriving from Carl's side
independently, which is why it is the safer of the two formulations to trust.

⚠ **AND THE COUNTER-ARGUMENT IS LOCATED, WHICH IT WAS NOT BEFORE.** ⛔ **It sits in section 1, with
the process** — not spread across the page. **Tidier than anything this file had proposed.**

---

# ⛔ SECTION 3 — THE VIDEO EXAMPLES, AND THE REPETITION PROBLEM

## ⛔⛔ AN OPEN CONTRADICTION WITH THE SORTING RULE — NOT RESOLVED, AND IT IS CARL'S

⚠⚠ **BOTH POSITIONS ARE STATED HERE AND NEITHER IS PICKED.** ⛔ **An earlier pass recorded this as
*"a REFINEMENT of the rule rather than a conflict"* — that was the BUILDER'S reading, not a ruling,
and it is withdrawn as a resolution.** *(Wording kept above, per the file's own convention; see the
standing instruction at the top — ask, do not reconcile quietly.)*

| | |
|---|---|
| **The sorting rule, 28 August** | ⛔ *"In the c2b ethos → the site. Not in the ethos → a video example for clients."* **Non-ethos material goes OFF the site.** |
| **Section 3, 30 August** | ⛔ **Video examples are ON the page**, max four, building on sections 1 and 2. |

⚠ **The candidate reconciliation, offered as a QUESTION and not an answer:** the sorting rule's
target was **the SITE BECOMING A LEXICON**, and one bounded section of four may not be a lexicon.

⛔⛔ **BUT THE SORTING RULE IS CARL'S, ITS ADMISSION TEST IS EXPLICITLY NOT DELEGATED — *"something
i DEEM to be in the c2b ethos"* — AND NO CHECKLIST SUBSTITUTES FOR IT.** ⚠⚠ **A Builder deciding
that four examples do not constitute a lexicon has done exactly what that rule forbids: invented a
threshold and applied it.**

⛔ **QUESTION FOR CARL: does section 3's existence REFINE the sorting rule, or does the rule still
hold and section 3's examples all pass the ethos test on their own?** ⚠ **They lead to different
pages — the first admits non-ethos material to the site in a bounded quantity; the second admits
none, and the four examples are simply four things that ARE in the ethos.**

## ⛔ THE CONSTRAINTS

- ⛔ **MAXIMUM FOUR EXAMPLES.** ⚠ **The same instinct already recorded against three-or-more colour
  variants — *"back to demonstrating range instead of a decision"* — applied to the section.**
- **TWO SOURCES, both admitted by §10a:** things **already on the site**, and things **built
  specifically** for the purpose.
- ⚠ **Whether the four are split between the two sources is OPEN.**

## ⛔⛔ ON-SITE EXAMPLES ARE NOT RECORDED AS THEY STAND — Carl's ruling

**Carl, in his own words:**

> *"if from the site and i will use the blue chrome button, we shouldnt just video record it and
> drop it in. The user has seen that and its repetition. What we could do is temporarily change the
> colour, record it and then the button goes back to its default blue."*

⚠⚠ **THE PROBLEM IS REPETITION, AND THE FILE ALREADY HALF-KNEW IT.** §6 records that *"an identical
copy of the live button is WORSE than the live button — video of a thing always loses to the
thing."* ⛔ **Carl's ruling completes it: the recording must show something the visitor CANNOT see on
the site.**

### ⚠⚠ THE METHOD — and it is §6's variant principle arriving as PRODUCTION rather than argument

⛔ **Temporarily recolour → record → revert to default blue.**

⚠⚠ **THE VISITOR SUPPLIES THE COMPARISON THEMSELVES, because they have already seen the blue one
live.** ⛔ **THE SITE IS THE CONTROL; THE CLIP IS THE VARIABLE.** ⚠ **That is a stronger
demonstration than two clips side by side, because half of it is something the visitor already
trusts** — and it costs no page weight, because half of it is the page.

**§6's reasoning, unchanged and now load-bearing:** one blue button says *"he made a nice button."*
**Blue on the page plus another colour in the clip says *"this is a material with parameters, and
it can be tuned."***

### ⛔⛔ AND THE SECOND ARGUMENT — A CLIENT'S BRAND COLOURS. Carl, 30 August

> *"Another argument for a temp logo recolour for an example is that a clients company may have
> brand colours."*

⚠⚠ **THIS IS §6 REACHING ITS ACTUAL DESTINATION.** §6 already says a recolour converts a
demonstration of **craft** into a demonstration of **applicability** — *"this could be mine, in my
colours."* ⛔ **Carl's addition is that THE MARK ITSELF can carry it.**

⚠⚠ **AND IT CONNECTS SECTION 3 TO SECTION 2, WHICH NOTHING IN THIS FILE PREVIOUSLY DID.** ⛔ **CD's
role is analysing a client's existing brand — colours and typography — from their site plus their
brief.** ⚠ **So *"we can put this in your colours"* is not a CLAIM on the About page; it is a
DESCRIPTION OF A STEP THAT ALREADY EXISTS IN THE PROCESS.** **Section 2 explains the roles;
section 3 shows the output of one of them.**

⛔ **It is also the one demonstration a template marketplace cannot make — a template ships in the
colours it ships in.**

### ⚠ THREE FLAGS ON THE METHOD — raised, not resolved

1. ⛔ **THE RECOLOUR COLOUR MUST BE ONE THE SYSTEM HAS NOT ASSIGNED A JOB TO.** ⚠⚠ **§8 is
   load-bearing here: warm/salmon is the SELECTION STATE**, and a recoloured demo using it would
   mean *chosen* three clicks from where it means chosen. ⛔ **Which colour is Carl's; that it must
   be unassigned is settled.**
2. ⚠⚠ **"TEMPORARILY CHANGE AND REVERT" IS A REPO OPERATION AND NEEDS A SHAPE.** ⛔ **A colour
   changed for a recording session is a change to APPROVED WORK (D-051, D-029) that must not
   survive the recording.** ⚠ **The obvious failure: the revert is forgotten, or reverts to a value
   typed from memory rather than the original.** ⛔ **Handle it as a deliberate procedure with the
   original constant recorded BEFORE it is touched — not an edit-record-undo done by hand.**
3. ⚠ **THIS IS ROUTE 2 OF §10a** — examples built for the purpose — **which collides with §7,
   *only show what you would build and maintain*.** ⛔ **A recoloured button is a much smaller
   promise than a purpose-built demo, so this may be the version that survives §7 comfortably.**
   ⚠ **Recorded as NARROWED, not settled — §10a left the tension to Carl.**

## ⛔⛔ THE FOUR EXAMPLES BUILD ON SECTIONS 1 AND 2 — Carl, 30 August 2026

⚠⚠ **A STRUCTURAL RULE, AND IT CONSTRAINS WHAT QUALIFIES AS AN EXAMPLE.** **Carl:** *"The examples
will build upon sections 1 and 2."*

⛔ **AN EXAMPLE IS NOT CHOSEN FOR BEING IMPRESSIVE. It has to build on the process (§1 of the page)
and the roles (§2 of the page) already established.** ⚠⚠ **This is the file's §1 rule — *every
example must have a decision attached* — WITH A LOCATION: the decision is explained in section 1,
and section 3 shows it.**

⛔ **SO THE FOUR SECTIONS ARE SEQUENTIAL, NOT PARALLEL, AND SECTION 3 CANNOT BE READ IN ISOLATION.**
⚠ **It rules out the tempting mistake: picking the four best-looking things and putting them in
section 3.**

## ⛔⛔ THE LOGO IS NOT ONE OF THE EXAMPLES — Carl's correction, 30 August 2026

**Carl:** *"The logo has nothing to do with the 4 examples, its totally separate."*

⚠⚠ **RECORDED BECAUSE THE BUILDER GOT THIS WRONG AND THE ERROR IS INSTRUCTIVE.** ⛔ **This section
previously read *"one example needs no video at all — the immobile mark"*, and asked whether it
counted against the four-example cap.** ⚠ **It does not, because it is not an example.**

⛔ **THE CONFLATION: *it demonstrates something to a visitor* was treated as *it is one of the four
examples*.** ⚠⚠ **The mark is a PROPERTY OF THE SITE, present on every route — not a specimen
placed in a section.** **Its reasoning lives in D-065, not here.**

⛔ **The four-example cap is untouched by the logo, in either direction.**

---

# ⛔⛔ C2B TV — WHAT IS PLAYING BEFORE AN EXAMPLE IS SELECTED. Carl, 30 August 2026

> ## ⛔⛔ **IDEA STAGE. Carl: *"This is an idea in the development stage."*** ⚠ **A dedicated session
> is scheduled — Carl: *"We will spend a session on this in a few days."*** ⛔ **NOTHING HERE IS
> BUILT FROM.**

⚠ **"C2B TV" is Carl's own name for it, offered in jest and adopted as the working label** — it
describes the problem better than "video viewer" does.

⛔ **SECTION 3'S LAYOUT AND DESIGN ARE CARL'S — *"i will take care of the design of section 3."***
⚠ **The Builder was asked to decide ONE thing: what is on the screen before a clip is chosen.**

## ⛔ THE RULING — IT IS A FIFTH EXAMPLE, IN PLAIN SIGHT

**Carl, in his own words:**

> *"So heres the thing. The TV has got to be on, doing something. Could we put a royalty free video
> in there? Yes. Are we? No. Why. Because C2B didnt create it. Further examples of our capability.
> Did i say 4 examples? Yes, and another one in plain sight."*

⚠⚠ **THE IDLE STATE IS NOT A BACKGROUND, NOT AMBIENCE, AND NOT A PLACEHOLDER.** ⛔ **It is a
demonstration of capability in its own right — and it never announces itself as one.**

⛔ **THE FOUR-EXAMPLE CAP IS UNTOUCHED: four in the stack, selectable, each with its explanation.**
⚠ **The field is a FIFTH piece of capability that is never listed, never subtitled, and never
counted.** **A visitor watching it is already being shown what c2b can do before choosing
anything.**

⚠⚠ **SAME INSTINCT AS THE IMMOBILE MARK — the thing that demonstrates without being PRESENTED as a
demonstration.** ⛔ **§9 says the copy must point before the viewer looks; this one needs no
pointing, because it is the first thing on the screen.**

## ⛔ THE SHOWROOM FRAME — Carl's, and it is the whole argument

> *"We should treat the TV as if its in a showroom… A few years ago TVs in showrooms would show
> jungle scenes with parrots or aerial shots of Scandinavia."*

⚠⚠ **THE SHIFT IS FROM CONTENT TO MATERIAL.** ⛔ **Parrots and aerials were CONTENT — the screen
showed you a nice thing.** ⚠ **What is on a showroom wall now is chroma, gradient, and the panel's
own capability made visible: THE SUBJECT IS WHAT THE DISPLAY CAN DO.**

⛔ **SO THE IDLE STATE IS NOT DECORATION AND NOT A TEASER — IT IS A DEMONSTRATION OF THE SURFACE.**
⚠ **A showroom TV does not ask to be watched. It proves what it is, and the proof happens to be
beautiful.**

## ⛔⛔ WHAT IT IS: ABSTRACT ART. NO SUBJECT

**Carl: *"What im looking for is abstract art."***

⚠⚠ **NO OBJECT, NO HERO FORM, NO NARRATIVE.** ⛔ **A FIELD** — flow, granularity, light moving
through a medium. ⚠ **It can be looked at for two seconds or forty and it neither starts nor
finishes.**

⛔⛔ **AND THAT IS THE FUNCTIONAL REASON, NOT ONLY AN AESTHETIC ONE: a clip with a SUBJECT implies
it should be watched to the end, and would COMPETE with the four items for attention.** ⚠ **A field
has nothing in it to follow, so it holds the screen without taking the visitor's decision away.**

## ⚠ THE PALETTE IS AN OPEN QUESTION — Carl asked it, and did not answer it

> *"Do you wanna use the logo? The brand colours?"*

⛔ **BOTH ARE QUESTIONS, NOT INSTRUCTIONS. Carl's to settle in the dedicated session.**

⚠ **What is on record and bears on it:**

- ⛔ **Blue and gold are the site's two marks (D-063), and the reference material Carl supplied is
  deep blue and metallic gold** — the palette appearing in another medium, physically.
- ⚠⚠ **§8 IS LOAD-BEARING: warm/salmon is the SELECTION STATE** and is unavailable for other jobs.
  ⛔ **Gold is the LOGO's colour, not salmon — but the proximity is worth checking rather than
  assuming.**
- ⚠ **The logo question is separate again:** D-065 makes the mark constant and immobile site-wide.
  ⛔ **A moving, abstract treatment of the mark inside the TV is a DIFFERENT object from the mark in
  the corner — but a visitor may not read it that way.** **Flagged for the session.**

## ⛔⛔ WHY NOT ROYALTY-FREE — and it broadens §10a rather than restating it

⚠⚠ **CARL'S REASONING BROADENS THE RULE, AND THE BUILDER HAD IT TOO NARROW.** ⛔ **§10a was being
read as a rule about THE FOUR EXAMPLES — what is presented as evidence.** ⚠ **Carl applies it to
the idle state, which is presented as nothing at all: *"Could we put a royalty free video in there?
Yes. Are we? No. Why. Because C2B didnt create it."***

⛔⛔ **THE RULE IS ABOUT WHAT IS ON THE SITE, NOT ABOUT WHAT IS LABELLED AS AN EXAMPLE.**

⚠ **Royalty-free would be legal, cheap and immediately available. It fails on the reason that
OUTRANKS copyright: it is not our work** — §10a's order, and the reason a permissive licence does
not rescue it.

⚠⚠ **AND IT WOULD FAIL WORSE HERE THAN ALMOST ANYWHERE.** ⛔ **The four clips show CONSTRUCTION —
mesh, material, lights. A borrowed field would be the one thing on the page NOBODY COULD TAKE
APART.** **A section whose method is *here is how this was made* would contain a piece nobody could
account for.**

⛔ **The silent argument: anyone can license a beautiful loop. The page that made its own is the
page that did not need to.**

## ⚠⚠ INFLUENCE IS NOT COPYING — Carl's correction, and the Builder had over-applied §10a

**Carl:** *"There is a difference between copying and inspiration. Influence is a mark of respect."*

⛔ **THE BUILDER TREATED REFERENCE MATERIAL AS IF LOOKING AT IT WERE THE HAZARD.** ⚠⚠ **§10a governs
what goes ON THE SITE. It says nothing about what may be studied, and a rule that forbade influence
would make craft impossible.**

⚠ **What Carl supplied as reference:** chrome and glass forms moving through neon environments, and
**an experimental 8K macro film of ink and metallic pigment — deep blue and gold, flowing,
granular, no subject.** ⛔ **The second is the closer relative: it is the site's own two colours,
found in a physical medium.**

⚠ **And its gold behaves the way the filament reference already describes** — hot cores, granular
bloom, falling off into the dark rather than stopping at an edge. **The kinship is real rather than
a stretch.**

## ⛔⛔ NO THREE.JS. "ORGANISE THE PIXELS" — Carl, and it resizes the problem

> *"No need for three js. All you have to do is organise the pixels."*

⚠⚠ **THIS IS A SIGNIFICANT NARROWING AND IT ARRIVED LAST.** ⛔ **The Builder had been assuming a
3D scene — geometry, a camera, a light rig.** ⚠ **Carl's framing removes all of it: there is no
object, so there is nothing to model, light or move a camera around.**

⛔ **A FIELD IS A 2D PROBLEM.** ⚠ **The reference macro film is physical ink shot close-up; its
digital equivalent is not a render of a scene — it is pixels organised over time.**

⚠⚠ **CONSEQUENCES WORTH KNOWING BEFORE THE SESSION, NONE OF THEM DECIDED:**

- ⛔ **It avoids the whole class of defect this project has spent months on** — WebGL contexts,
  shader compilation stalls, canvas lifetime, the structural §5a questions. **A second WebGL
  surface is exactly what CLAUDE.md §5a's two worked cases are about.**
- ⚠ **Whether it is FOOTAGE (made once, encoded, played) or GENERATED IN THE BROWSER is open**, and
  they have completely different costs. ⛔ **Footage inherits §9's compression warning — slow
  gradients on dark are the worst case for banding, and this material is exactly that.** ⚠ **The
  §9 note already says: TEST-ENCODE ONE CLIP BEFORE COMMITTING.**
- ⚠ **"Organise the pixels" does not by itself say which.** ⛔ **Carl's, in the session.**

## ⛔ WHAT IS SETTLED HERE, AND WHAT IS NOT

**Settled:**

- ⛔ **The TV is ON before anything is selected.** ⚠ **An empty or static screen is ruled out —
  Carl: *"an empty screen is no good to anyone."***
- ⛔⛔ **It is a FIFTH EXAMPLE in plain sight, and the four-cap is untouched.**
- ⛔ **It is ABSTRACT — a field, no subject.**
- ⛔⛔ **It is C2B'S OWN WORK. Royalty-free is ruled out, and §10a is broadened: the rule covers
  what is on the site, not only what is labelled an example.**
- ⛔ **No Three.js is required.**

**Open, and Carl's:**

1. ⚠ **The palette — the logo, the brand colours, or neither.** **Carl's own question.**
2. ⚠ **Footage or generated in the browser.**
3. ⚠ **Whether it loops, and whether a loop point is perceptible** — a field with no beginning or
   end argues for imperceptible.
4. ⚠ **What it does when a clip is playing, and when one ends.** ⛔ **The Builder proposed NO
   AUTO-ADVANCE — four clips a visitor chose beats four that played at them — but section 3's
   design is Carl's and this was not ruled on.**

---

## ⚠⚠ A NOTE ON HOW THIS PROPOSAL WAS REACHED — recorded because the correction is the useful part

⛔ **The Builder's first proposal was PASTICHE and Carl named it:** *"Youve looked at the site and
youve essentially copied whats there already. Have you come up with something new that follows the
philosophy, ethos and the spirit? In musical terms like listening to the entire catalogue of
Beethoven and then writing a new piece in his style."*

⚠⚠ **THE FAILURE WAS RE-USING THE VOCABULARY INSTEAD OF COMPOSING IN IT** — the satin face, the
filament border and the orbiting light reassembled into a new arrangement, which is quotation
rather than style.

⛔ **A SECOND ERROR, ALSO NAMED: the Builder framed the idle state as a choice between *scene* and
*invitation*, and recommended restraint.** ⚠ **Carl: *"I have many VSTs in my DAW… Do you know what
this gives me? Choice! Are TVs in showrooms static?"*** ⚠⚠ **RESTRAINT IS NOT HAVING FEWER OPTIONS —
IT IS CHOOSING WELL FROM MANY.** ⛔ **Treating a large palette as a risk to guard against misreads
both the site and how Carl works.**

# ⛔ THE LOGO ON `/about`

- ⛔ **Top left, occupying EXACTLY the same space as on every other route.** ⚠ **The rule is now
  site-wide and is recorded as its own decision: **D-065** — the STANDARD is APPROVED, and the
  `/about` insertion is APPROVED ON DELIVERY against measurement.**
- ⛔ **GOLD, and PROVISIONAL.** ⚠ **Carl: *"In the about section it is provisionary gold. It may not
  stay that way."*** **PROVISIONAL is a defined status — in place, deliberately untuned, awaiting
  the mastering pass (D-035). ⛔ Not "unapproved" and not a gap.**

⚠⚠ **THE FULL REASONING IS IN D-065 AND IS NOT REPEATED HERE** — *no duplication*,
`context-rules.md`. **The short form: no movement, only change; pin point precision is the signal;
and the invariant is currently UNASSERTED across two routes that reach the same point by two
different mechanisms.**

---

# ⛔⛔ THE HEADER IS DEFERRED, AND THE REASON IS RECORDED

**Carl, 30 August:**

> *"The site header will probably be in all sections. Why no decision has been made yet is im
> thinking about the font. Im thinking about it in context to other things that as of this moment i
> havent shared with you. I will in time though. After the about section scaffolding, site headers
> is next."*

| item | standing |
|---|---|
| **Header on all routes** | ⚠ **LIKELY, not decided** |
| **The header's DESIGN** | ⛔ **TBD — Carl's word** |
| **Why deferred** | ⛔ **A font decision, weighed against context not yet shared with the Builder** |
| **When** | ⛔ **The NEXT body of work, after the `/about` scaffolding** |

## ⚠⚠ WHAT THIS MEANS FOR THE SCAFFOLDING — and it is a real constraint

⛔⛔ **THE `/about` SCAFFOLDING MUST NOT SETTLE THE HEADER QUESTION BY RENDERING `SiteHeader` AS A
CONVENIENCE.** ⚠ **That would decide a structure while implementing something else — CLAUDE.md
§5a.** ⛔ **The link still has to be made hot, and that is `site-header.tsx` either way; what waits
is HOW `/about` gets a header.**

⚠ **AND THE DEFERRAL IS NOT TO BE WORKED AROUND.** ⛔ **Carl is weighing it against information the
Builder does not have.** ⚠⚠ **That is need-to-know operating as designed — see *THE SEATS* above —
and a Builder decision made in that gap would be made blind.**

# ⚠ WHAT THIS PASS ADDS TO THE OPEN QUESTIONS

**Closed by this pass:**

- ✔ **Whether AI is raised on the page at all** — ⛔ **YES, and championed.** Ruling 1. *(This was
  the §10a open note; it is now decided.)*

**Newly open, and Carl's:**

1. ⛔ **Are the four seats NAMED on the page, and is "one model, separated authority" stated
   outright?** ⚠ **Recommendation is yes and early; not ruled on.**
2. ⛔ **Which piece of evidence carries the AI claim** — and how much process appears at all.
3. ⚠ **Does the organising line itself appear on the page**, or does it only shape the section?

⚠ **The three questions carried from 28 August are untouched by this pass** — explanation in video
or text, whether clients receive code, and the qualifying flow.

### ⛔ AND WHAT THE FOUNDER PASS DID TO THEM, the same day

**Closed:**

- ✔ ⛔ **Whether anything about the human founder appears at all — YES.** *THE HUMAN FOUNDER ON THE
  PAGE*, rulings 1–3. ⚠ **It also part-answers newly-open question 1 above: the human is a seat in
  the team, so the seats being named is now the more likely shape.**

**Still open, and narrowed rather than answered:**

- ⚠ **Whether Carl's NAME appears anywhere on the page.** ⛔ **Ruling 2 settles the VOICE, not the
  name.** **May resolve outside this section — contact flow, footer.** ⚠ **Not a setup-pass
  question.**
- ⚠ **Whether the philosophy is STATED or only DEMONSTRATED.** ⛔ **§9 pulls one way, the
  vocabulary problem the other.** **Leaning recorded, not decided.**
- ⚠ **Whether the founder passage and the collaboration passage are ONE block or two.**
  ⛔ **Recommendation only — one block, with the human as a seat that says "I".**

---

# ⛔ WHAT THIS PASS DOES NOT CHANGE

⚠⚠ **NOTHING HERE IS AUTHORISED, AND THE SETUP/DEVELOPMENT SPLIT IS UNTOUCHED.**

- ⛔ **This is all DEVELOPMENT-PASS material** — what the section eventually argues. **The next
  build step is still SETUP: link hot, page exists, bare bones that convey position.**
- ⚠⚠ **THE OVER-BUILDING RISK IS NOW HIGHER, NOT LOWER.** *CARL'S FRAMING* warns that a Builder who
  reads this file will be tempted to implement the argument. ⛔ **This pass is the most persuasive
  material in the file and therefore the most dangerous in that respect.**
- ⛔ **The gate is unchanged.** `app/about/page.tsx` free; `components/layout/site-header.tsx`
  protected and needs Carl to name it.
- ⛔ **The landing page copy is still not to be touched** — known, accepted, deferred.

---

*Opened 28 August 2026. ⛔ **Idea stage — the CONTENT is undecided and nothing is authorised.**
Carl's brainstorm of 27 August (recovered from `7b313e1`) plus four passes on 28 August: the DAW
framing, the own-work ruling (§10a), **the central tension**, and **its resolution** — the ethos as
a sorting rule across two channels.*

*⛔ **30 August 2026 — the AI pass, and it changed the REGISTER of the whole section.** Carl's survey
of local agencies; the three credibility answers re-framed; **five rulings** — AI is raised and
**championed**, the frame is collaboration, the objection is granted and relocated to the vendor
default, the site is the proof, and **no condescension in any form**. Plus the tractor argument and
the slop objection it must survive, the four-seats problem, and ⚠ **Carl's market read, recorded
explicitly as REASONING AND NOT COPY.***

*⛔ **30 August 2026, second pass — THE HUMAN FOUNDER, which answers the four-seats problem.** The
work speaks first and personability belongs to contact; **the founder is written in the FIRST
PERSON — "I", never the third**, because a page claiming a human holds the authority cannot write
about that human as though someone else did; and **the human is a seat in the team, in a small
way**, because naming four AI seats and omitting the human describes an operation where nobody is
answerable. ⚠ **The needs-writing-down list is now ELEVEN.***

*⛔⛔ **30 August 2026, third pass — THE SEATS, and the answer is ONE SENTENCE.** Carl: *"describe
the set up in principle… dont over complicate things."* **The page says "a team with defined roles,
and each member knows what they need to know" — no roster, no product names, no diagram.**
⚠ **Recognition is the mechanism: a business owner already runs this shape, and reads it as an
efficient use of AI.** ⛔ **A claim made in discussion — that the seats are SEPARATED — was FALSE
and is corrected in place: they are not isolated, access is Carl's decision per context.** ⚠ **The
roster (CA, CB, CS, CD and Carl as the bridge) is recorded as REFERENCE, not as page content, and
`ai-roles.md` does not yet know about CS or CD. The list is now TWELVE.***

*⛔⛔ **30 August 2026, fourth pass — THE STRUCTURE, and the file finally has one.** Four sections
mirroring the landing page: **the founder and process** (carrying the counter-argument and a
top-level view of the file system), **the roles**, **video examples**, and **one TBD.** ⚠ **The
item-12 conflict is resolved rather than reversed — principle in §1, structure in §2.** ⛔ **Video
examples ARE on the page, max four, and on-site examples are RECOLOURED before recording, because
filming the live button shows the visitor something they have already seen.** ⚠⚠ **The recolour
carries a second argument Carl added: a client's brand colours — which connects section 3 to CD's
role and is the one demonstration a template marketplace cannot make.** ⛔ **The logo rule is
promoted out of this file into **D-065**: no movement, only change, site-wide — and Carl then
widened it to a CAPABILITY a client can buy.** ⚠ **The
header is DEFERRED with its reason recorded, and is the next body of work.***

*⚠ **Same day, later — the immobile mark reaches past this site.** Carl: *"Think beyond our site to
a clients who will possibly have a logo… What if a client wants the same immobility?"* ⛔ **It is a
TECHNIQUE, not a style choice — declare a point, hang the asset from it, restrict variance to
scale — and it transfers to any mark.** ⚠⚠ **Which makes it the strongest answer this file has to
the SAMPLE-OF-ONE problem.** ⛔ **It is NOT one of the four examples — Carl: *"The logo has nothing
to do with the 4 examples, its totally separate."* A property of the site, not a specimen.**
⚠ **And the four examples BUILD ON sections 1 and 2, which is what qualifies them.** ⛔ **Carl also
named a THIRD artefact for the client template — the
STOREROOM, elements stripped to their mesh state in a separate repo — recorded in
`references/workshop-template-and-client-delivery.md`, which previously held only the workshop and
the shipped site.***

*⛔⛔ **30 August 2026, fifth pass — C2B TV.** Carl asked the Builder to decide one thing: what is on
the screen before an example is selected. ⚠⚠ **The answer is an ABSTRACT FIELD — c2b's own, blue
and gold, no subject — and Carl ruled it a FIFTH EXAMPLE IN PLAIN SIGHT that never announces
itself.** ⛔ **Royalty-free is refused, which BROADENS §10a: the rule covers what is on the site,
not only what is labelled an example.** ⚠ **The showroom frame is the argument — modern showroom
TVs show MATERIAL rather than content, and the subject is what the display can do.** ⛔ **No
Three.js — *"all you have to do is organise the pixels."*** ⚠ **Two Builder failures are recorded
with it: a first proposal that was PASTICHE (re-using the site's vocabulary rather than composing
in it), and a false choice between restraint and invitation — *"restraint is not having fewer
options, it is choosing well from many."*** ⛔ **IDEA STAGE; a dedicated session is scheduled.***

*⚠ **The file is DEVELOPED by each pass, not corrected.** ⛔ **It is where the About thinking lives
until Carl makes it a chunk; it is not itself a plan.***

---

# ⛔⛔ SECTION 1 — THE LAYOUT AND THE IMAGE. Carl, 31 August 2026

> ⚠ **THE FIRST TIME THIS FILE HOLDS PLACEMENT RATHER THAN ARGUMENT.** Everything before it is
> about what the section SAYS. This is about where things GO. ⛔ **Still idea stage; nothing here is
> authorised.**

## ⛔ THE ARRANGEMENT

| | |
|---|---|
| **Left** | **The text.** Ballpark now, written and finalised later. |
| **Right** | **A static image**, occupying the real estate the text does not use. |
| **The join** | ⚠ **The image FADES as it reaches the text.** Not a hard edge, not a column boundary. |
| **Width** | ⛔ **The image need NOT span the section.** *"The bulk of it would be on the right."* |

⚠ **Carl: *"This will echo the hero section."*** ⛔ **AND THE HERO DOES NOT HAVE THIS ARRANGEMENT
TODAY** — `app/page.tsx` is a single left column at `max-w-2xl` with the right side **empty and
protected by D-026** (*"the hero's right-side space is intentionally empty and must not be filled
without a brief from Carl"*).

⛔⛔ **SO "ECHO" IS FORWARD-LOOKING, NOT DESCRIPTIVE.** ⚠ **Carl's own framing settles which way it
runs: *"Only the hero section will use video for the 'killer' feature, this section will have an
image."*** **The hero is expected to gain a video in that space; section 1 is the quieter member of
the same family.**

### ⛔⛔ CORRECTED WITHIN THE HOUR — THE HERO ARRANGEMENT EXISTS IN PRINCIPLE

**Carl, immediately after the above was written:** *"The Hero does in principal. I have a file on my
PC that is under development. I have the idea worked out."*

⚠⚠ **THE PARAGRAPH ABOVE IS WRONG WHERE IT SAYS "ECHO" IS FORWARD-LOOKING.** ⛔ **It is
DESCRIPTIVE. Section 1 echoes an arrangement Carl has already worked out — it is simply not in this
repository yet.**

⚠ **WHAT THE BUILDER ACTUALLY OBSERVED WAS TRUE AND THE INFERENCE FROM IT WAS NOT.** ⛔ **True:
`app/page.tsx` has no right-side element today, and D-026 protects that space. FALSE: that therefore
the arrangement does not exist.** ⚠⚠ **A file on Carl's PC is not visible to `grep`, and absence
from the repo was read as absence from the design.**

⛔⛔ **THIS IS THE D-036 INFORMATION ASYMMETRY OPERATING AS DESIGNED, NOT A GAP.** ⚠ **Carl gives
the Builder what it needs to know, when it needs to know it. The correct move on hitting a hole like
this is to ASK, not to reason across it — the standing instruction at the top of this file.**
**Recorded because the Builder wrote a settled-looking sentence instead.**

### ⛔⛔ AND THE ABSENCE WAS DELIBERATE — Carl, 31 August 2026

> *"i have discussed the hero with you several times. I had to find out if it was technically
> feasible. I then had it stricken from the record. i need to keep you focused."*

⚠⚠ **THE CORRECTION ABOVE IS ITSELF INCOMPLETE.** ⛔ **It says the design "is simply not in this
repository yet", as though the record were merely behind. IT IS NOT. The hero was discussed across
several sessions, tested for technical feasibility, and then STRICKEN FROM THE RECORD ON CARL'S
INSTRUCTION.**

⛔⛔ **THE SILENCE IN THE REPO IS A CONTROL, NOT A GAP — AND IT IS THE SECOND TIME IN ONE PASS THE
BUILDER READ IT AS ONE.** ⚠ **First: "the hero has no right-side element, therefore the arrangement
does not exist." Then: "the design exists, the repo is just behind." ⛔ BOTH TREATED THE ABSENCE AS
SOMETHING TO EXPLAIN. It was something to respect.**

⚠⚠ **WHY CARL STRUCK IT: *"i need to keep you focused."*** ⛔ **Future work is deliberately not
recorded in this repository — the standing policy in `current-sprint.md`, 28 July 2026: *"Do not
reconstruct it here, do not treat its absence as a gap, and do not plan against it."*** ⚠ **That
rule was written for exactly this, and the Builder walked past it twice in one sitting.**

⛔ **THE OPERATIONAL RULE, STATED PLAINLY FOR THE NEXT SESSION: when something referenced by Carl is
missing from the record, the default assumption is that it was REMOVED ON PURPOSE.** ⚠ **Do not
reconstruct it, do not infer its contents, and do not write a sentence explaining its absence. ASK,
or leave it alone.**

⚠ **NOTHING ABOUT THE HERO'S DESIGN IS RECORDED HERE, AND NOTHING SHOULD BE.** ⛔ **Section 1's
arrangement stands on Carl's instruction for SECTION 1 — text left, static image right, video is the
hero's alone. That is sufficient to develop section 1 and requires knowing nothing further about the
hero.**

### ⚠ WHAT THIS CHANGES, AND WHAT IT DOES NOT

- ⛔ **The hero's right-side treatment is DESIGNED, under development, and Carl's.** ⚠ **The Builder
  has not seen it and must not design against a guess at it.**
- ⛔ **Section 1's arrangement is therefore DERIVED FROM AN EXISTING DESIGN, not a proposal that a
  future hero might match.** ⚠ **The hierarchy Carl stated stands unchanged: *the hero uses video for
  the killer feature, section 1 has an image.***
- ⚠⚠ **D-026 IS STILL LIVE AND STILL UNRESOLVED HERE.** ⛔ **Its right-side space remains protected
  until Carl briefs the change. Knowing the hero has a design does NOT authorise touching
  `app/page.tsx`, which is also a permanently protected path.**
- ⛔ **NOTHING IN THIS FILE IS BUILT FROM.** Unchanged.

⚠⚠ **THIS BEARS ON D-026 AND IS NOT RESOLVED HERE.** ⛔ **A video in the hero's right-side space is
exactly what D-026 reserves.** **Recorded as a consequence to be handled when the hero is developed
— NOT decided by this pass, and NOT to be actioned from this file.**

### ⚠ THE HIERARCHY IS DELIBERATE — ONE VIDEO ON THE SITE

⛔ **Video is reserved for the hero's "killer" feature. Section 1 gets a STILL.** ⚠ **That is a
restraint decision, not a budget one: if every section moves, nothing is the killer feature.**
**It is §2's argument — *a showcase of many features argues the competitor's position* — applied to
motion rather than to features.**

---

## ⛔ THE SUBJECT — SETTLED. Carl: *"the details are undecided, subject matter isnt."*

**A representation of Carl at work, BACK TO THE CAMERA. Not a photograph of Carl.** *"Will it be me?
No, it will be a representation of me at a desk."*

| element | detail |
|---|---|
| **desk 1** | two screens — the website work |
| **desk 2** | ⛔ **at 90°** — two screens, two monitor speakers, MIDI keyboard, audio interface, 19" racks |
| **the figure** | back to camera |
| **made in** | **DaVinci Resolve** |
| **motion** | ⛔ **STATIC** |

### ⚠⚠ WHY THE MUSIC RIG IS IN THE PICTURE, AND IT IS DOING ARGUMENTATIVE WORK

**Carl:** *"Although music is not primarily used in website design its what i do. It also shows
another technical expertise."*

⛔ **AND IT SAYS SOMETHING THE COPY IS FORBIDDEN FROM SAYING.** ⚠⚠ **Item 12 rules that the set-up
is described IN PRINCIPLE, NEVER BY ROSTER.** **Two workstations at 90° show a system with more
than one discipline in it WITHOUT NAMING ANYTHING.** ⛔ **It is the DAW model — already the site's
governing method (D-035) — made visible rather than explained.**

⚠ **BACK TO CAMERA SERVES RULING 1** — *the work speaks first; personability belongs to CONTACT.*
**The founder is present without the page becoming a portrait.**

---

## ⛔ THE TREATMENT — TRANSLUCENT, LAYERED COLOUR. NOT A PHOTOGRAPH.

⚠ **Carl considered a standard HQ image and DECLINED IT:** *"Am i favouring an HQ normal image? No i
like the idea of a translucent single colour image."*

⛔⛔ **AND THIS IS DEVELOPMENT, NOT A REGISTER BREAK — CARL'S CORRECTION TO THE BUILDER.** ⚠ **The
Builder framed a photographic element as a break from the site's rendered-material vocabulary. Carl:
*"Not a register break - development, design."*** ⛔ **The vocabulary GROWS because a section needs
it. Same principle as the DAW model: a new instrument on a track is not a genre change.**

### ⛔ WHY NOT AMBER OR GOLD AS THE FIELD COLOUR — two reasons, and the second is the binding one

**Carl:** *"Using a brand colour like amber or gold would give off an old sepia look."*

⚠⚠ **AND THE SEMANTIC COLLISION IS LARGER THAN THE AESTHETIC ONE.** ⛔ **§8 of this file: WARM IS
ALREADY SPOKEN FOR.** Gold is **the mark**; warm/salmon is **the selection state**. **A large amber
image on `/about` would put the brand's most specific colour on something decorative.**

⚠ **Carl on dark blue as the field:** *"at this scale might seem a little cold."*

### ⛔ TEAL IS THE FIELD, AND D-025 ALREADY BACKS IT

⛔ **D-025's approved direction: near-black base, gold/amber as premium accent light, TEAL /
DUCK-EGG / DEEP BLUE as MODERN INTELLIGENCE ACCENT.** ⚠ **Teal is not an unused colour being
borrowed — it is the one D-025 assigns to exactly this register.**

⚠⚠ **BUT TEAL CARRIES A JOB ELSEWHERE, AND THE VALUE MATTERS:**

| where | meaning | measured |
|---|---|---|
| the memory rail | the answers you have given | 46.2% saturation |
| card hover | Carl's by-eye tuning at 1.7 | `rgb(31,138,149)`, 79.4% |
| **an image on `/about`** | ⛔ **new — no collision** | — |

⛔ **BOTH EXISTING TEALS ARE INTERACTIVE STATES ON `/start`** — teal there means *this responded to
you*. **`/about` has no interaction, so an image in teal does not compete for that meaning the way
amber would with the mark.**

⚠⚠ **THOSE ARE SATURATED TEALS AT SMALL SCALE — a rim, a line of text.** ⛔ **Filling several hundred
px with anything near 79% would read as related to the enquiry states.** **The image should sit WELL
BELOW them in saturation — nearer a duck-egg tint over near-black than the hover colour.** ⚠ **It
also serves the fade: something already low-contrast fades gracefully; a saturated block would need
the fade to do all the work.**

### ⛔⛔ THREE COOL TONES, AND THEY ARE A LIGHTING HIERARCHY — NOT A PALETTE

**Carl:** *"If i really wanted to push the boat out, 3 colours that ive mentioned could be used for
the very reasons youve mentioned."* **And on why layering at all:** *"The image then would not seem
so one dimensional, and i mean in spirit, not geometry."*

| colour | role | reads as |
|---|---|---|
| **teal** | the field — room, desks, figure | the space itself |
| **lighter blue** | emitting surfaces — screens | *these are on* |
| **deep blue** | what the emitters CATCH — edges, speaker cones, rack faces | *that light is falling on this* |

⚠⚠ **THE THIRD IS WHAT MAKES IT A SCENE RATHER THAN TINTED OBJECTS.** ⛔ **Without it, screens glow
and nothing responds. With it, the room acknowledges the light.**

⛔⛔ **AND THAT IS §5 — *SHOW THE SCENE, NOT THE PART* — RENDERED AS A STILL.** ⚠ **§5's argument is
that c2b's work reads as *one space with one light where everything responds together*, against
assembled sites that are *parts that happen to sit near one another*.** **The image would be MAKING
section 1's case, not decorating it.**

⚠ **THREE IS NOT A CONTRADICTION OF THE TWO-VARIANT RULE.** ⛔ **§6 caps VARIANTS at two because
three demonstrates range instead of a decision. These are not variants — they are three different
JOBS in one lighting model.**

⚠⚠ **THE RISK, STATED: PROPORTION.** ⛔ **If all three appear in roughly equal measure it stops
reading as one lit space and becomes a colour scheme.** **The field must dominate heavily; the other
two are accents on it, not thirds.** ⚠ **A Resolve judgement, deliberately not pre-specified.**

⚠ **DEEP BLUE IS ALSO THE MARK'S JOURNEY COLOUR ON `/start`** (gold → blue → gold, D-063). **Same
family, different job, different route.** ⛔ **At low saturation the Builder does not expect a
collision — but the image should be seen against `/start` before any value is fixed.**

---

## ⛔ THE GOLD — THE MARK, IN THE ROOM

**Carl:** *"Maybe as a representation of the Logo somewhere. Maybe on the desk as an object or a
poster on the wall. Although it would be faded it would still stand out."*

⚠⚠ **THIS IS WHAT MAKES IT *THIS* WORKSPACE.** ⛔ **An anonymous studio in three cool tones says
*someone works here*. The same room with the mark on the wall says *this is where c2b is made*.**
**That is section 1's actual subject.**

⚠ **IT ALSO SERVES D-065's ARGUMENT:** the mark's constancy is a claim a visitor verifies for
themselves. **The mark as a REAL OBJECT IN THE SPACE — faded, at an angle — rather than composited
on top, reinforces that it is a thing in a room rather than a logo placed on a picture.**

⛔ **RECOMMENDATION: THE POSTER, NOT THE DESK OBJECT.** ⚠ **An object on the desk competes with the
screens and the rig for attention on a surface already full of things. A poster sits in the negative
space BEHIND the setup, where nothing else is happening — environment rather than a placed prop.**
**Carl's choice; both were his suggestions.**

⚠⚠ **AND IT CAN GO QUIETER THAN INSTINCT SUGGESTS.** ⛔ **Warm at low saturation against a cool
field reads as WARM long before it reads as GOLD — it draws the eye whatever value it is given.**
**Faded far enough to be DISCOVERED rather than ANNOUNCED is the target.**

⛔ **§8's *warm is already spoken for* IS NOT BREACHED.** ⚠ **That rule protects warm as THE
SELECTION STATE on an interactive surface. This is the mark, in an image, on a route with no
selection at all — gold meaning *the mark* is exactly what gold already means.**

---

## ⚠ WHAT IS SETTLED HERE, AND WHAT IS NOT

**Settled by Carl:**

- ⛔ **Text left, static image right, image fading as it meets the text.**
- ⛔ **The subject matter** — the two desks, the 90°, the music rig, back to camera.
- ⛔ **Static, made in DaVinci Resolve.**
- ⛔ **Translucent layered colour, NOT a photograph. Teal-led.**
- ⛔ **Video is the hero's alone.**

**Open, and Carl's:**

- ⚠ **Two colours or three.** *"If i really wanted to push the boat out"* — a leaning, not a ruling.
- ⚠ **Whether the gold mark appears at all, and as poster or object.**
- ⚠ **Exact values, saturations and proportions** — ⛔ **PROVISIONAL by nature; D-035 governs.
  Not to be fixed before the image is seen at real size on the page.**
- ⚠ **The image's aspect ratio.** ⛔ **The Builder raised it as worth knowing BEFORE Resolve: a wide
  L-shaped setup rendered into a tall slot will crop hard or read small.** **Not answered.**

**Raised and explicitly NOT resolved:**

- ⛔⛔ **THE SCROLL-AND-MORPH IDEA.** Carl: *"It could also move down the page with us and morph
  into something else."* ⚠⚠ **THAT IS NOT A TREATMENT OF AN IMAGE — it is a scroll-driven behaviour
  spanning sections.** ⛔ **Structural under CLAUDE.md §5a; would need client-side scroll observation
  on `/about`, which is currently a static prerendered server component; and *"something else"* must
  exist before it can be morphed into.** **Its own conversation, not part of section 1's layout.**
- ⚠ **D-026** — the hero's protected right-side space, and what a hero video does to it.
