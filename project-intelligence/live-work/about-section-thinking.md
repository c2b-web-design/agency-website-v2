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

**Sources, both preserved deliberately:**

1. **Carl's brainstorm, 27 August 2026** — recovered from commit `7b313e1`. ⚠ **It lived only in
   the 27 August `session-handoff.md`, which was replaced on 28 August** under the single-use rule
   (`live-work-protocol.md` §3a). ⛔ **This file exists partly so that never happens again:** a
   handoff is single-use by design and is the wrong home for durable thinking.
2. **Carl's research pass, 28 August 2026** — the principles in Parts one to three.
3. **Carl's framing of 28 August 2026** — the section immediately below, which says **what the
   principles are FOR and when they apply.**

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

⛔ **STANDING TEST, applied whenever something spectacular turns up:**

> **Does this feature express the ethos, or compete with it?**

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

1. **The licence positions** should be re-checked **if they ever become load-bearing.**
2. **Any of this needs revising if the visual direction moves** — at which point the copy changes
   anyway.

---

# ⛔ NEEDS WRITING DOWN — four items, before any of this reaches the Architect

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

⚠ **Item 4 is the one with a mechanism available.** The other three are judgement rules that live
in prose; **this one is a fact about the design system that code could assert.** See
`context-rules.md` → *an invariant that lives only in prose is not asserted.*

---

# ⚠ THREE QUESTIONS STILL OPEN

**Asked and overtaken rather than answered. Carl's to settle.**

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

---

# ⚠ NOTED TENSION, UNRESOLVED

**One page carries TWO REGISTERS** — three largely prose parts, and one that wants live interactive
demos. ⛔ **Recorded from 27 August and still not settled.** ⚠ **Part three §9 sharpens it rather
than resolving it:** the demo register is the one that fights compression, page weight and the
viewer's attention, while the prose register costs nothing to deliver.

---

*Opened 28 August 2026. ⛔ **Idea stage — nothing decided, nothing authorised.** Carl's brainstorm
of 27 August (recovered from `7b313e1`) plus his research pass of 28 August. **This file is where
the About thinking lives until it becomes a chunk; it is not itself a plan.***
