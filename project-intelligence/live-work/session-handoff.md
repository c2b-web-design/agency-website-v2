# Session Handoff — 2 September 2026. The homepage copy is DONE and APPROVED, bar the hero. Nine commits, all deployed.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

⚠⚠ **THIS SESSION BUILT AND APPROVED.** ⛔ **Three of the homepage's four sections had their copy
rewritten, reviewed by Carl on a running production build, and approved. Four decisions and two
review entries were written.**

---

# ⛔⛔ WHAT THE NEXT SESSION DOES — CARL'S INSTRUCTION

> ⛔ ***"Next sessions work is the copy in the about section"***

**`/about` SECTIONS 1, 2 AND 4.** ⛔ **Section 3 is EXCLUDED — video work, delegated to the Builder
as its "piece de resistance".**

| section | id | subject |
|---|---|---|
| **1** | *(page top)* | the founder and the process — ⚠ **the counter-argument lives here** |
| **2** | `#roles` | the four roles — ⛔ **NAMED and described expansively** |
| **3** | `#examples` | ⛔⛔ **EXCLUDED — video work, the Builder's** |
| **4** | `#start` | the conclusion, carrying **"Start a conversation" → `/start`** |

⛔⛔ **THIS IS A COMPRESSION, NOT A REWRITE.** ⚠ **`live-work/about-section-thinking.md` holds 3,336
lines of settled thinking. The job is to compress it onto a page, not to re-derive it.** ⛔ **THE
RISK IS SAYING MORE THAN THE ARGUMENT NEEDS.**

⚠ **`app/about/page.tsx` IS NOT PROTECTED — verified against the JSON array, not assumed.** ⛔ **No
unlock is needed for the copy work.** ⚠ **But it now holds APPROVED work — section 4's button and
the anchor ids (D-066) — so the copy edit must not disturb them.**

## ⚠⚠ READ THESE BEFORE DRAFTING A WORD

⛔ **`about-section-thinking.md` is the brief. Do not start from the page.** The passages that bear
directly on 1, 2 and 4:

| lines | what |
|---|---|
| **311–410** | ⛔ **THE ETHOS IS THE SORTING RULE** — in the ethos → the site; not → a video example. **Carl's judgement, explicitly NOT delegated** |
| **1145–1283** | ⛔ **FIRST PERSON. "I", never the third person** — Carl's ruling |
| **1513–1560** | **the four-section structure**, and how it resolves item 12 |
| **2024–2286** | **section 1 — the layout and the image** |
| **2287–2448** | ⛔ **SECTION 2 — the roles NAMED**, the two pairs, the order as the argument |

---

# ⛔ WHAT WAS BUILT TODAY — nine commits, all pushed and deployed

| commit | what |
|---|---|
| `fb732d9` | ⛔ **section 2 copy — the four service cards** |
| `0ac56dd` | record — D-067, R-021 |
| `0eb3bba` | ⚠ **CLAUDE.md lint baseline corrected** — six weeks stale |
| `93ad412` | ⛔ **section 3 copy — the three cards REMOVED, the argument merged into one paragraph** |
| `8be15fb` | record — D-068, R-022 |
| `0f606b8` | section 4 — "premium" → "bespoke" |
| `2b20b33` | record — D-069 |
| `1541a12` | ⛔ **hero CTA label → `TBD`** |
| `9538598` | record — D-070 |

**`main` = `9538598`, fully pushed, working tree clean.**

## ⛔ THE HOMEPAGE COPY IS COMPLETE BAR THE HERO

| section | copy | record |
|---|---|---|
| **1 — hero** | ⛔ **DEFERRED — Carl's** | **D-070** |
| **2 — `#services`** | ✔ **APPROVED** | D-067 · R-021 |
| **3 — `#work`** | ✔ **APPROVED — ⚠ LAYOUT PROVISIONAL** | D-068 · R-022 |
| **4 — `#contact`** | ✔ **APPROVED** | D-069 |

---

# ⚠⚠ FIVE THINGS THE NEXT SESSION MUST NOT GET WRONG

## 1. ⛔⛔ THE TWO-REGISTER RULE — THE MOST FRAGILE THING WRITTEN TODAY

**Carl:** *"On 2+4, that is enough. 1+3 should be statements like the sections main headline and
subtext."* And: *"We shouldnt overuse the word 'we'."*

    section 2, cards 1 + 3   →  STATEMENTS, no "we" at all
    section 2, cards 2 + 4   →  WE SPEAK
    section 3, heading + sub →  STATE.   section 3, paragraph  →  SPEAKS

⚠⚠ **THE FORESEEABLE EDIT IS SOMEONE "TIDYING" THE STATEMENTS TO MATCH THE REST.** ⛔ **It would
read as consistency work and would destroy the pattern.** **It is recorded in D-067, D-068, the
sprint and four code comments — because that many places is what it takes.**

## 2. ⛔⛔ CARL WRITES THE COPY. THE BUILDER DRAFTS AND CARL SELECTS

⚠ **Every approved line today is CARL'S WORDS or his direct amendment of a draft.** ⛔ **The Builder
offered options with reasoning; Carl chose, corrected and rewrote.** ⚠ **The copy in the files is
not a paraphrase of his intent — it is what he wrote.**

⛔ **THE TONE, IN HIS WORDS:** *"businesslike but not corporate. Personal, confident that says in
every way 'we got your back'."*

## 3. ⛔⛔ DO NOT PLANT A PROBLEM SO THE SERVICE CAN SOLVE IT

⚠ **Four drafts of card 4 were rejected for exactly this** — *"websites drift"*, *"a website does
not change on its own"*, *"as the business changes..."*, *"Business decisions come first"*.

⛔ **Carl:** *"Dont tell people how to run a business."* And: *"Were not gonna tell them about a
world where 'shit happens'."*

⚠⚠ **AND ONE OF THEM FAILED ON ACCURACY, NOT TONE.** *"Websites drift"* attributes motion to the
wrong object — Carl: *"thats not a drift, its static... a website is immobile until a Dev comes onto
the scene."* ⛔ **The Builder chose the word for its tone without checking the mechanism was true.**

⚠ **AND: DO NOT PARROT CARL'S REASONING BACK AS COPY.** He explained a position as FOOTING for the
writing; the Builder turned it into the line *"Business decisions come first."* ⛔ Carl: *"Your
taking what i said literally to describe a position and parroting it back."*

## 4. ⚠⚠ COPY THAT EXPIRES ON THE FIRST SALE IS A DEFECT

⛔ **Section 3's old intro said "Before we bring this level of thinking to client projects..." and
"This site is the FIRST EXPRESSION of the C2B approach."** ⚠ **Both conceded the absent portfolio —
*before* means not yet, *first expression* is a count of one.** Carl: *"This is a problem. A line
like this shouldnt be used."*

⚠⚠ **THE BUILDER HAD TWICE DEFENDED THAT LINE as the section's load-bearing sentence.** ⛔ **The
idea was right and the TENSE was wrong** — Carl: *"We will/can do for you what we do for ourselves
is a good philosophy."* **A permanent commitment, not a stage being passed through.**

⛔⛔ **THIS APPLIES DIRECTLY TO `/about`, WHICH ARGUES FOR A SOLO PROPRIETOR WITH NO CLIENTS YET.**

## 5. ⛔⛔ THE HERO'S BRIEF IS NOT IN THIS REPOSITORY, AND THE SILENCE IS AN INSTRUCTION

**Carl developed the hero concept across earlier sessions and "had it stricken from the record."**

⛔ **WHAT IS ON THE RECORD IS ONLY THIS:**
- **The hero will be a VIDEO BACKGROUND.**
- **`/about` section 1's image is STATIC.**
- ⛔⛔ **TWO SEPARATE PIECES OF WORK, DIFFERENT IMAGES.** ⚠ **They may share LAYOUT and nothing else.**

⚠⚠ **THIS CORRECTS A COUPLING THE BUILDER ASSUMED TWICE TODAY.** ⛔ **The travelling-image
dependency in the 1 September handoff — "the image must work as a right-hand slot in section 1 AND
as a full-width ground behind section 2" — BELONGS TO `/about` ALONE.** **The homepage hero is not
in that problem.**

⚠ **AND THE VIDEO / NOT-A-VIDEO SPLIT IS DELIBERATE:** the hero is video; `/about` section 3's
showroom screen is briefed as **explicitly NOT a video.** ⛔ **Do not harmonise them.**

⛔ **A SESSION READING THESE FILES CANNOT PLAN THE HERO. Ask Carl. Do not infer.**

---

# ⛔ THE HERO BUTTON — RULED, AND THE RULING IS A NEGATIVE ONE

**D-070.** Carl: *"I can definately say the button wont be navigational."*

| outcome | |
|---|---|
| **KEPT** | performs *"some function in the hero section"* — ⚠ **undetermined** |
| **DELETED** | goes entirely |

⛔⛔ **THERE IS NO THIRD OUTCOME WHERE IT NAVIGATES.** ⚠ **Proposing "point it at `/about`" or
restoring a descriptive label RE-OPENS A CLOSED QUESTION.**

⚠ **The label is `TBD`, and `href="#work"` IS LEFT IN PLACE AND KNOWN-STALE.** ⛔ **DO NOT TIDY IT**
— the destination is undecided by ruling, and the header nav already reaches `#work`, so nothing is
lost while it waits.

---

# ⚠ SECTION 3'S LAYOUT IS PROVISIONAL — AND THE CARD REMOVAL IS A PRECEDENT

⛔ **Carl approved the COPY and explicitly not the layout:** *"Sec 3 is approved. Layout work to be
done at a later date."* ⚠ **The paragraph sits under the subtext in the same column, on the left.
That arrangement is NOT approved design.**

⚠⚠ **WHY THE THREE CARDS WENT, AND IT BEARS ON EVERY FUTURE SECTION:** section 2 is a 2×2 grid of
bordered boxes and section 3 was a 1×3 grid of bordered boxes **on the very next screen.** ⛔ **By
the second grid the eye recognises the pattern and skims, so the harder argument landed on the least
attention.** ⚠ **Section 2's evenness only reads as restraint if it happens ONCE.**

⛔ **AND THE FORM WAS FALSE THERE:** section 2's four cards are four DIFFERENT services; section 3's
three were three LENSES ON ONE THING — this site. **A single piece of evidence presented as three
parallel items.**

⚠ **`/about` HAS FOUR FULL-VIEWPORT SECTIONS TOO. The same fatigue is available there.**

---

# ⛔ SECTION 4'S BUTTON — DECIDED, NOT AUTHORISED TO BUILD

**D-069.** Carl: *"Redesigned using three js with existing geometry used elsewhere on the site.
However, the material and lighting will be different. This has yet to be determined."* And:
*"We are not redesigning now but in later sessions."*

⚠⚠ **IT DOES NOT GET BUILT WITHOUT STRUCTURAL REVIEW — RULE 5a.** ⛔ **A Three.js button on
`app/page.tsx` is a NEW WebGL SURFACE on a page that currently has none.** **The record holds two
worked cases of that exact shape: the warm-up canvas (four sessions to diagnose, a week to unwind,
an hour to build) and `NextStepMeshButton` — itself a button — which created a fresh context on
every question step for weeks while a harness watching a different canvas reported green.**

⚠ **`nextstep-geometry.ts` and `contact-field-geometry.ts` are both PROTECTED. Reading them is free;
changing either is an unlock AND an approved-layer question.**

---

# ⚠ STATE AT SESSION END

- **Working tree clean. `main` = `9538598`. Fully pushed.**
- ⛔ **NO UNLOCK IS LIVE.** `chunk-scope.json` deleted. ⚠ **Every lock closed this session was
  verified by OBSERVING A REAL DENIAL** — `app/page.tsx` (×2) and `CLAUDE.md`.
- ⛔ **NO SERVER IS RUNNING.** Ports 3000 and 3100 confirmed free, 0 node processes.
- ⚠ **`npx tsc --noEmit` clean. `npm run build` compiles, 8/8 static, `/about` still prerendered.**
- ⛔ **CLAUDE.md'S LINT BASELINE IS NOW CORRECT** — `6 problems (1 error, 5 warnings)`, verified by
  running lint on 2 September. ⚠ **It had read `1 error, 0 warnings` since 24 July and was six weeks
  stale.** **The ERROR count is what the baseline pins and it is intact and unchanged.**
- ⚠⚠ **THE FIVE WARNINGS ARE NOW ENUMERATED IN CLAUDE.md BY RULE AND FILE.** ⛔ **Carl: "we will
  deal with the warnings later."** **One is NOT cosmetic: `showBlue` is assigned but never used in
  `app/start/page.tsx` — D-062/D-063 approved work, the mark's colour journey. An unused state
  variable there may mean a transition is computed and never applied.**
- ⚠ **`open-defects.md` was NOT touched. Nothing this session produced a live product fault.**
- ⚠ **`verify/` was not used and its proven list is still 0.** ⛔ **No harness pass is admissible;
  reds still pass through. Restore route: D-064.**

---

*2 September 2026. **The homepage stopped being Day-1 scaffolding and started making an argument.**
Three sections of copy written and approved, a set of cards deleted because two grids in a row is
one grid too many, and a six-week-stale baseline in CLAUDE.md corrected.*

*⚠ **Carl wrote the copy. The Builder drafted, and was corrected four times** — going to the hero
when section 2 was asked for, proposing to elevate a card the hero must not compete with, choosing a
word for its tone without checking the mechanism it described was true, and parroting Carl's own
reasoning back to him as a line of copy.*

*⛔ **NEXT: `/about` sections 1, 2 and 4. A COMPRESSION of 3,336 recorded lines, not a rewrite.**
⚠ **Section 3 is the Builder's video work and is not in that chunk.***
