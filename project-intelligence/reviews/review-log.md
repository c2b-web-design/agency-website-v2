# Review Log

All visual QA, component, and sprint reviews are logged here in reverse-chronological order.

Reviews are observational. They surface findings and recommendations. They do not override architecture or design-system decisions. See `context-rules.md` Rule 6.

---

## ⚠ Why there was a five-week gap after R-018 (22 June – 29 July 2026) — read before calling it stale

⛔ **HEADING CORRECTED 4 September 2026. It previously read *"Why there are no entries after
R-018"*, which was true when written and is now false** — R-019 through R-024 sit above this
note. ⚠ **The correction is made in place per `context-rules.md` (*"a code comment asserts
something no longer true → correct it in place, keep the original claim as history"*), because a
reader meets this heading before any entry and would conclude the log stops at R-018.**
⚠⚠ **The note below is still worth reading: the REASONING about what does and does not generate an
entry is unchanged, and the gap it explains is a real historical gap.**


**Added 29 July 2026, after an audit raised the five-week gap as a finding and then withdrew
it.** The gap is **expected and correct**, and the record needs to say so, because the third
reader in a row was about to misdiagnose it.

**This log records what Carl has APPROVED.** Since 22 June, every decision entered has been
**governance or tooling** — D-035 through D-041: methodology, authority, toolkit removal,
future-work policy, the sentinel, revert procedure, `/doctor`. **Not one is a visual or
component approval**, so not one produces an entry here.

**The visual work done in that period is `PROVISIONAL` under D-035** — in place, deliberately
untuned, awaiting the mastering pass Carl runs with the Builder. **Provisional work is not
reviewed here and generates no entry.** Its absence is not a missing approval.

⚠ **This is the third time this same non-problem has been raised.** The 24 July architect
review raised it as F-1, a 25 July repo pass raised it again, and a 29 July staleness audit
raised it a third time before checking the decision statuses and withdrawing. **D-035 exists
because of the first two.** If you are about to flag this gap: check whether anything
visual has actually been approved since the last entry. If not, there is nothing to log.

**An empty stretch in this file means no visual work has been approved. It does not mean
reviews stopped happening.**

---

## Schema

```
ID:               R-###
Date:             YYYY-MM-DD
Reviewer:         Agent name or Human
Subject:          What was reviewed
Findings:         Observations — factual, not editorial
Flags:            Issues requiring attention (severity: Low / Medium / High / Critical)
Recommendations:  Optional — route to Carl, who decides (D-036)
Status:           Open | Actioned | Dismissed
```

⚠ **Corrected 29 July 2026.** The Recommendations line previously read *"must route through
ChatGPT before actioning"*. **That seat is retired** (D-036) and the instruction contradicted
both `handoff-protocol.md` §7 and `context-rules.md` Rule 6, which consolidate routing to
Carl at **every** severity — Low, Medium, High and Critical alike. No agent other than Carl
moves a finding to actionable.

**Entries written under the old schema keep their original wording.** They record what the
process was at the time; `context-rules.md` forbids retroactive rewriting.

---

## R-024 — `/about` Section 2: The Room Photograph, And Four Generated Rooms Rejected

**Date:** 2026-09-04 (approved 2026-09-03/04; logged late — see **D-074**)
**Reviewer:** Human Founder
**Subject:** `public/about-studio-source.jpg` as the ground for `/about` §2, read on a running build. Records **D-073**, and **D-071** for the §10a ruling. Commit `ed0fb5b`.

**Carl's verdict, verbatim:** *"If anything says 'made with AI', its this picture. Exactly the thing we are arguing against in this section."* — said of the GENERATED candidates, which is why they are gone.

**Findings:**

- ⛔⛔ **FOUR AI-GENERATED ROOMS WERE BUILT AND ALL FOUR REJECTED.** ⚠ **The rejection was not on quality — it was on ARGUMENT.** A page whose thesis is *ungoverned AI yields generic output* cannot illustrate itself with generic output. ⛔ **This is the same defect as the homepage line struck on 2 September (D-068), arriving in a picture rather than a sentence.**
- ⚠ **The tells were real and specific**, not fastidiousness: picture frames at disagreeing angles, rack gear dissolving into noise, cabling going nowhere, repeated speakers at wrong scales. ⛔ **§2 is where a sceptical reader checks the claim.**
- ⚠⚠ **THE COLOUR NEEDED NO GRADING AND IT IS MEASURED, NOT ASSERTED:** the wall sits at **H 200–206, S 32–43%, L 12–17%** against the `/start` interaction teal's **H 186, S 66%, L 35%** (D-053). ⛔ **Half the saturation, a third the lightness — exactly what the record asks of a large teal area, straight out of camera.**
- ⛔ **A TEAL REGRADE WAS BUILT AND ABANDONED:** it moved the hue ~5° and cost **94% of the resolution**. ⚠ **The general lesson is on the record now — every generative round-trip is destructive. EDIT THE MASTER.**
- ⚠ **THE 2° WALL ANGLE IS MEASURED AND IS NOT THE TARGET.** `skewY(2deg)` was built and looked flat, *because it is flat*. ⛔ **Recorded so a later session does not "correct" wall cards back towards the photograph's true angle. That has been tried.**
- ⚠ **`public/about-studio-figure.jpg` IS NOT USED BY ANY ROUTE AND MUST NOT BE DELETED AS A STRAY** — kept on Carl's instruction as a lighting reference.

**Flags:**

- ⚠ **Medium — the crop was re-verified only by reasoning, not by eye.** The image moved to `next/image` on 4 September; `fill` + `object-cover` should reproduce the framing exactly, **but no before/after comparison was made.** ⛔ **Card positions in §2 will be tuned against this crop, so it should be confirmed visually before that work starts.**

**Recommendations:** Confirm the framing by eye before §2 card positions are tuned. Routed to Carl.

**Status:** Actioned — §10a settled by D-071; section 2 proceeds on this photograph.

---

## R-023 — `/about` Section 1: The Copy Approved, Two Registers Side By Side

**Date:** 2026-09-04 (approved 2026-09-03; logged late — see **D-074**)
**Reviewer:** Human Founder
**Subject:** `/about` §1 in `app/about/page.tsx` — both texts and the two-column layout, read on a running build. Records **D-072**. Commit `63b55cb`.

**Carl's verdict:** Approved by eye, on the rendered build, after he rewrote both texts himself.

**Findings:**

- ⛔⛔ **APPROVED: THE COPY *AND* THE LAYOUT.** ⚠⚠ **Both, and this differs from R-022** — where Carl explicitly approved copy and held layout provisional. ⛔ **Here the layout is load-bearing: he balanced the two paragraphs BY EYE against two equal columns with both headings at `text-3xl`, and added a sentence to text 1 to even them up.** **Change the widths, the gap or either heading size and the approved balance is gone.**
- ⛔ **THE H1 CAME DOWN** from `text-4xl md:text-5xl` to `text-3xl` to match the h2, and now heads the left column instead of spanning the section.
- ⛔⛔ **THE TWO-REGISTER SPLIT IS A RULING, NOT A DRAFTING ACCIDENT.** Text 1 is a STATEMENT with no first person — Carl: *"Statement. No i or we."* Text 2 is the PERSON, first person throughout. ⚠⚠ **The foreseeable edit is someone harmonising the two, or "correcting" text 1's impersonality as third-person drift. It is impersonal BY INSTRUCTION.**
- ⛔ **CARL WROTE BOTH TEXTS.** The Builder drafted options; Carl selected, cut, pasted back and rewrote. ⚠ **Text 2 retains choices the Builder queried and he kept — the "we"/"I" mix, "pristine, production-ready code", "my exact standards". THOSE ARE HIS.**
- ⚠⚠ **A PROCESS FAULT, AND IT IS CARL'S CORRECTION VERBATIM:** the Builder deleted a clause Carl had not named — *"Through our rigorous project governance and deep file architecture,"* — and reported it afterwards. ⛔ **Carl: *"i did not authorise you to remove this. im trying to get both paragraphs to be the same size. i cannot do it if you are taking out things i did not say."*** ⚠ **The harm is specific: he was balancing two columns by eye and the length changed by an amount he did not choose.** ⛔ **The clause is present in the file — correctly restored.**
- ⚠ **TWO CLAIMS WERE KEPT OUT ON PURPOSE:** *"every pixel and line of code"* (a client-work claim on a site with no client work) and *"cutting-edge execution with uncompromised artistry"* (asserts what the page should demonstrate). ⛔ **Do not reintroduce either when polishing.**

**Flags:**

- ⚠ **Low, and forward-looking — §1 already names all four seats.** Text 2 reads *"specialized roles of Strategist, Designer, Architect, and Builder"*. ⛔ **Section 2's copy therefore cannot earn its screen by naming them again: §1 NAMES, §2 must SHOW.** Recorded in D-072 because it constrains copy not yet written.

**Recommendations:** None. The section is approved as it stands.

**Status:** Actioned.

---

## R-022 — Homepage Section 3: The Cards Removed, The Copy Merged

**Date:** 2026-09-02
**Reviewer:** Human Founder
**Subject:** The `#work` section in `app/page.tsx`, read on a running production build at :3100. Records **D-068**. Commit `93ad412`.

**Carl's verdict, verbatim:** *"Sec 3 is approved. Layout work to be done at a later date."*

**Findings:**

- ⛔ **APPROVED: THE COPY. NOT THE LAYOUT** — and Carl separated the two himself in the same sentence. ⚠⚠ **Recorded as two standings on one element, per `context-rules.md`: *"Statuses are written — never implied."*** **The interim arrangement — paragraph under the subtext, left, same column — is PROVISIONAL and awaits the redesign.**
- ⛔⛔ **A DECISION, NOT A REVIEW FINDING: the three cards are gone.** Carl: *"cards will be gone, that is a decision."* ⚠ **He ruled it before any draft existed, which is why the copy was written as a merge rather than as three replacements.**
- ⚠⚠ **THE REASON IS STRUCTURAL AND IT SETS A PRECEDENT FOR SECTION 4.** Two grids of bordered boxes on consecutive full-viewport screens: the eye learns the pattern and skims the second. ⛔ **Section 2's evenness only reads as restraint if it happens once.** **`#contact` is the next screen and must differ in shape.**
- ⛔ **CARL CAUGHT THE LINE THE BUILDER HAD BEEN DEFENDING.** The Builder twice argued *"This site is the first expression of the C2B approach"* was the section's load-bearing sentence and worth keeping. ⚠⚠ **Carl: *"This is a problem. A line like this shouldnt be used."*** **Both halves of the old intro conceded the absent portfolio — *before* means not yet, *first expression* is a count of one — and the Builder had read that as honesty rather than as a liability that expires on the first sale.**
- ⚠ **AND CARL KEPT THE IDEA WHILE REJECTING THE SENTENCE:** *"We will/can do for you what we do for ourselves is a good philosophy."* ⛔ **The fault was the TENSE, not the thought. A permanent commitment had been written as a stage being passed through.**
- ⚠ **THE HEADING WAS CARL'S SHORTLIST, NOT THE BUILDER'S.** He proposed three — *Built Without Compromise*, *Quality Without Exception*, *Guided by Principle* — and chose the second. ⛔ **The Builder ruled out *Guided by Principle* on the ground that METHOD is `/about`'s subject; Carl's choice is consistent with that boundary.**
- ⚠ **TWO AMENDMENTS CARL MADE TO THE APPROVED DRAFT**, both changing meaning rather than tone: **"an asset, AS WELL AS a brochure"** (the draft denied the brochure role; Carl concedes it deliberately) and **"build your website"** for *"build yours"* (no clear antecedent).
- ⚠⚠ **THE BUILDER STOPPED AND ASKED RATHER THAN GUESSING.** Carl's pasted paragraph contained the capabilities sentence **twice**, in two different wordings — a merge artefact from combining two drafts. ⛔ **It was raised as a question, with the two variants set side by side, instead of one being silently chosen.** **Carl's amendment to the brochure line came back in the same exchange.**
- ⚠ **VERIFIED IN THE SERVED HTML** — the copy present and **0 occurrences of each removed card title**, confirming absence rather than assuming it. `tsc` clean; build 8/8 static; lint **1 error, 5 warnings — baseline, unchanged.**

---

## R-021 — Homepage Section 2: The Four Service Cards

**Date:** 2026-09-02
**Reviewer:** Human Founder
**Subject:** The four `#services` cards in `app/page.tsx`, read on a running production build at :3100. Records **D-067**. Commit `fb732d9`.

**Carl's verdict, verbatim:** *"Section 2 approved. Commit and push"*

**Findings:**

- ⛔ **APPROVED: all four service cards.** Carl wrote or dictated the final wording of cards 1, 2 and 4 himself; the Builder drafted and Carl selected, corrected and rewrote. ⚠ **The copy in the file is Carl's words, not a paraphrase of them.**
- ⛔ **THE SECTION HEADING AND INTRO WERE SETTLED BEFORE THE CARDS AND NEVER REOPENED** — Carl, at the outset: *"I agree with the headline and subtext, iy doesnt need editing."* **They are untouched by this work.**
- ⛔⛔ **APPROVED AS A PATTERN, NOT FOUR SEPARATE APPROVALS: the two-register rule.** Cards **1 and 3 are statements with no "we"**; cards **2 and 4 speak.** Carl: *"On 2+4, that is enough. 1+3 should be statements like the sections main headline and subtext."* ⚠⚠ **This is the finding most at risk of being undone by a well-meaning consistency edit.**
- ⛔ **CARD 3 WAS REVIEWED AND LEFT UNCHANGED — that is a verdict, not an omission.** Its outcome-only restraint already met the standing ruling that no tool or technology is named.
- ⚠⚠ **A BUILDER PROPOSAL WAS REJECTED, AND THE REASON IS LOAD-BEARING FOR THE WHOLE PAGE.** The Builder argued card 3 should be visually elevated because the enquiry system is the real differentiator sitting in a grid that weights all four equally. ⛔ **Carl ruled against it:** *"This is the next thing a user will see after the Hero. The hero will be the showpiece of the site, its gonna be a killer feature. What this next section must do is follow it and not compete."* ⚠ **The 2×2 grid's evenness is therefore an asset. Elevating any card would place a second climax immediately after the hero.** Carl's frame: *"If this was lord of the rings, this section would be the shire after the opening exposition."*
- ⚠ **AN ORDERING PRINCIPLE WAS STATED AND IS GENERAL:** *"Whats important at the outset is the information. How that information is presented then comes into focus."* ⛔ **The Builder had gone to layout before the words were settled.**
- ⚠ **THE BUILDER WAS OVERRULED ONCE ON THE COPY ITSELF AND CARL WAS RIGHT.** The Builder flagged *"ready for whatever comes next"* for cutting, on the grounds that it gestured at unnamed future events after Carl had just banned prediction. ⛔ **Carl kept it:** *"For what ever comes next is good copy. Its honest."* **It promises presence; it does not predict trouble. The rule was aimed at something else.**
- ⚠ **A FACTUAL CORRECTION FROM CARL, NOT A TONE NOTE.** The Builder's *"websites drift"* was rejected because it **attributes motion to the wrong object** — Carl: *"thats not a drift, its static... a website is immobile until a Dev comes onto the scene."* **The Builder had chosen the word for its tone without checking the mechanism it described was true.**
- ⚠ **THE BUILDER PARROTED CARL'S REASONING BACK AS COPY AND WAS CORRECTED FOR IT.** Carl explained the position — the business decides, the website follows — as *footing* for the writing; the Builder converted it directly into the line *"Business decisions come first."* ⛔ **Carl:** *"NO. Dont tell people how to run a business. Your taking what i said literally to describe a position and parroting it back."* **The position was right; stating it on the page lectured the reader.**
- ⚠ **The Builder also opened on the hero (section 1) when Carl had asked for section 2** — the hero is explicitly deferred and excluded. Corrected in the same message.
- ⚠ **VERIFIED IN THE SERVED HTML, not only in source.** `npx tsc --noEmit` clean; `npm run build` 8/8 static; `npm run lint` **1 error, 5 warnings — the recorded baseline, unchanged.**

---

## R-020 — `/about` Scaffolding: The Mark Does Not Move Between Pages

**Date:** 2026-08-31
**Reviewer:** Human Founder
**Subject:** The gold mark on `app/about/page.tsx`, judged by eye on a running production build against `/` and `/start` — the on-delivery condition of **D-065**, discharged. Records **D-066**.

**Carl's verdict, verbatim:** *"the first thing i did was to check if there is any movement between pages of the Logo. Excuse the pun - nailed it. Great"*

**Findings:**
- ⛔ **APPROVED: the mark's PLACEMENT on `/about`.** Carl navigated between routes and confirmed by eye that the mark does not move. **That is the D-065 test as Carl defined it** — *"a visitor can navigate and watch it not move"* — performed by the founder rather than reported by the Builder.
- ⚠⚠ **THE EYE CAME FIRST, AND IT MATTERS THAT IT DID.** The measurement was already recorded (`live-work/about-scaffold-measurement-31-august.md`: `left`/`top` identical across all three routes at 1440 **and** 375). ⛔ **Rule 9 makes rendered output the truth for visual work, and the figures are supporting evidence, not the verdict.**
- ⛔ **NOT APPROVED, AND DELIBERATELY SO: the mark's COLOUR.** It remains **PROVISIONAL** gold — Carl, 30 August: *"it may not stay that way."* ⚠ **In place, deliberately untuned, awaiting the mastering pass (D-035). Not a gap; no missing approval is to be raised for it.**
- ⚠ **Confirmed across a FULL DOCUMENT NAVIGATION** — no client-side routing exists on this site (`next/link` is used nowhere; `app/page.tsx:245` already uses a plain `<a>`). **The immobility survived a blank-and-repaint on the founder's own machine.** ⛔ **This does not close the F8 question** — whether a slower repaint elsewhere breaks the *perception* of immobility is untested, and the demonstration is what D-065 sells. **Open, and carried to the header chunk.**

**Findings on the page content — Carl, same session, after looking at the sections:**

- ⛔ **SECTIONS RESIZED TO FULL VIEWPORT** on Carl's instruction: *"make them larger like on the home page. Sections 2,3 and 4 should be the same as 1. If i can see all the real estate that gives a better size canvas to design in. Rather than thinner 'strips'."* ⚠⚠ **The reason is the DEVELOPMENT pass, not this one:** the canvas each section will be designed into must be visible at its real size while it is being designed. **A section sized to placeholder copy would be judged against the wrong dimensions throughout.**
- ⛔ **THE RULE THROUGH SECTION 1 REMOVED** on Carl's instruction: *"Lose the dividing line that runs through the middle of section 1."* The page title and section 1 were two full-height sections with a border between them, which **cut the opening statement in half.** They are now one section. **Three dividers remain, between the four sections.**
- ⚠ **The divider treatment is `border-neutral-800`** — the site's existing hairline-rule vocabulary, the same as the landing page's section rules. **Not a new value.**

**⚠⚠ A DEFECT INTRODUCED AND FIXED WITHIN THE SAME PASS — recorded because the diagnosis was wrong three times:**

- ⛔ **Making the sections full-height broke the page's left edge.** The heading rendered at **left 442.5** against the landing page's **104.5** — the text visibly detached from the mark it aligns under. **Caught by looking at the screenshot, not by any number.**
- ⚠ **The cause is `Container`'s `mx-auto`.** An auto inline margin makes the box size to its CONTENT and centre the shrunken result, **regardless of the parent's alignment** — `align-items` and `justify-items` do not override it. `Container` computed **603.9px instead of 1280px**.
- ⛔ **THREE FIXES WERE TRIED AND MEASURED FAILING before the cause was found:** `flex items-center`, `flex flex-col items-stretch`, and `grid content-center justify-items-stretch`. ⚠ **The grid track was the full 1425px with `justify-items: stretch` applied and the container still computed 603.9px.** **The layout mode was never the cause.**
- **Resolved** by giving the child an explicit `w-full`, so the auto margins distribute around a full-width box instead of a shrink-to-fit one. ⚠ **`components/layout/container.tsx` is a PROTECTED path — the fix belongs on the consuming page, not in the shared component.**
- ⛔ **The reasoning is recorded in a load-bearing comment in `app/about/page.tsx`, including the three failed attempts**, so the class is not "simplified" away by a future reader who sees it as redundant.

**Verified after the fix:** `/` and `/about` both report container left **72.5**, width **1280.0**, heading left **104.5000**.

**Status:** ⛔ **Mark placement APPROVED** (D-066). ⚠ **Mark colour PROVISIONAL.** ⚠ **Page content PROVISIONAL** — scaffolding that conveys position, not the About section. ⛔ **The section itself remains Carl's to develop, and the header question is the next body of work.**

---
## R-019 — Answer Card Exit: The Compressed Reversal

**Date:** 2026-08-23 — ⚠ **the review date, not the build date.** The work landed **2026-08-18** (`d008b4d`, `c831bf9`, `387653a`) and ran live for five days before it was reviewed. **This entry is filed on 23 August and does not claim a review at the time of the build.**  
**Reviewer:** Human Founder  
**Subject:** The answer cards' departure choreography — a compressed reversal of the entrance ladder. Reasoning, mechanism and figures are recorded in **D-056**; not repeated here.

**What the review was:**
- **Carl by eye, on the running product, over the days it has been live.** Not a measurement, not a harness run, not a single sitting.
- The measured figures in D-056 come from the build commit; **they are not what was reviewed.** What was reviewed is how the departure reads.

**Findings:**
- Carl's verdict, verbatim: *"I am more than happy with how it turned out."* ⚠ **On Carl's scale this is the top level — beyond approval, not at it.**
- The reversal was **Carl's own idea**, put to the Builder after the original fade was implemented; he was told it would not be an exact mirror and accepted that, **provided the choreography was there.**
- The departure's asymmetry against the entrance is **approved as the design**, on the principle recorded in D-056: the answers have done their job, so the exit moves faster.

**Flags:** None on the work.

⚠ **One flag on the RECORD, not the product.** The spec (`live-work/card-exit-spec-16-august.md`) carried a header reading *"NO CODE. NOT AUTHORISED TO BUILD"*; the work went in two days later; and no decision entry or review entry existed for five days. **The work is fine — the record was the fault.** This is the second instance of the write-back gap recorded at **D-048**. ⛔ **Neither this entry nor D-056 closes that gap.**

**Status:** APPROVED — the answer card exit. See **D-056**. On branch `fix/q5-stall-and-label-colour`; not yet merged.

---

## R-018 — Send Button: Deep Blue-Opal Cabochon Internal Character

**Date:** 2026-06-22  
**Reviewer:** Human Founder  
**Subject:** Approved internal opal-character material pass on `.enquiry-send-btn` (and `:hover`), the Send-specific class separated from `.enquiry-nextstep-btn`

**Findings:**
- Smooth deep sapphire/ultramarine cabochon body with dark navy edge/base preserved.
- Contained lower-left/lower-middle cyan internal formation; restrained upper-right cobalt/violet-blue depth; one dark shaping mottle creating a subtle internal interruption (carved notch, not a surface spot).
- Small controlled specular catch preserved; text remains crisp.
- Hover remains the same stone with modestly clearer internal definition — central glow not increased; overall brightness controlled. Visibility achieved through local contrast and falloff, not broad opacity increases.
- Intentionally a stylised blue-opal interpretation suited to an ~84×41px text-bearing button — not a photographic gemstone reproduction. Reference images were optical inspiration only and were not copied.
- Change confined to `.enquiry-send-btn`, `.enquiry-send-btn:hover`, and their adjacent comment in `app/globals.css`. No React/JSX, CSS variables, assets, or dependency changes. Geometry, text styling, bevel/elevation shadows, specular catch, dark edge/base, timing, and disabled state unchanged.
- Send remains unwired to a backend. Rim/glint refinement and contact-field design remain out of scope.
- `npm run lint` reports only the two accepted pre-existing `react-hooks/set-state-in-effect` errors in `components/enquiry/enquiry-opening.tsx`; no new lint errors introduced. Turbopack compiled the CSS successfully and `/start` served successfully.

**Flags:** None.

**Status:** APPROVED — Send opal cabochon internal-character pass. See D-033. Pushed on branch `feat/q5-reflected-amber-lighting`; not yet merged.

---

## R-017 — Reflected Amber CTA Lighting: Rollout to Q1–Q5

**Date:** 2026-06-16  
**Reviewer:** Human Founder  
**Subject:** Generalisation of the approved Q5 reflected-amber lighting (R-016 / D-031) to all five enquiry questions on `.enquiry-nextstep-btn`

**Findings:**
- The Next step / Send CTA now reflects selected-card amber filament light across Q1–Q5, not Q5 only.
- Works because all five questions share the same 3+2 answer grid; the contribution model is purely positional, keyed on card index, not answer text.
- Approved lighting rule holds across all questions: reflection geometry stays stable; selected-card state changes colour/intensity, not architecture; hover introduces no new clean white light source; amber increasingly filters/tints the platinum white as more cards activate; strength scales by card position and count; strongest amber when all visible cards are selected; CTA stays blue-platinum at its core.
- No selected cards → normal blue-platinum hover. Reflection recomputes each render, so direction updates live and no stale variables persist between questions.
- Q5 confirmed byte-identical to the approved baseline.
- No `rgba(calc(...))` colour-channel arithmetic reintroduced; colours remain React-computed complete `rgba(...)` strings via named vars. Card styling, layout, base material, and Begin button untouched. Send inherits the shared class.
- `tsc --noEmit` clean; ESLint shows only the two documented pre-existing `react-hooks/set-state-in-effect` errors, no new ones.

**Flags:** None.

**Status:** APPROVED — rollout across Q1–Q5. See D-032. Pushed on branch `feat/q5-reflected-amber-lighting` (`ac3a112` → `7fbb005`); not yet merged.

---

## R-016 — Next Step Button: Q5 Position-Aware Warm Environmental Reflection

**Date:** 2026-06-16  
**Reviewer:** Human Founder  
**Subject:** Q5-only selected-card amber reflection on `.enquiry-nextstep-btn`, idle and hover

**Findings:**
- Selected Q5 answer cards act as warm environmental light sources; the blue-platinum button catches a faint, directional amber reflection from them.
- Reflection is position-aware: card position drives which curved zone warms (left cap, right cap, upper/lower quadrants, faint upper-centre for the distant card 2). Strength scales with card position and count.
- Geometry is stable between idle and hover — only the colour and intensity of reflected light change.
- Hover lighting rule enforced: hover must not introduce a new clean white light source. White remains a small platinum component; selected-card amber increasingly filters/tints it as more cards activate. Amber is the only channel that intensifies on hover (×1.35).
- Central lower belly stays shadowed — no broad amber wash under the text.
- Root cause of the persistent hover white streak identified and resolved: `rgba(calc(...))` per-channel arithmetic inside legacy comma-form `rgba()` was unreliable, silently falling back to white. Replaced with React-computed complete `rgba(...)` colour strings consumed via CSS variables.
- No-selected-card hover and non-Q5 questions retain normal blue-platinum behaviour (variables unset → white fallbacks).
- Scope: Q5 only. Not rolled out to Q4–Q1. No card styling, layout, timing, or JSX-structure changes beyond the wrapper `style` variables.

**Flags:** None.

**Status:** APPROVED — Q5 reflection prototype baseline. See D-031. Rollout to Q4–Q1 pending future brief.

---

## R-015 — Next Step Button: Face/Body Separation Sub-pass QA

**Date:** 2026-06-16  
**Reviewer:** Human Founder  
**Subject:** Face/body tonal separation sub-pass for `.enquiry-nextstep-btn` (blue-platinum direction)

**Findings:**
- Core diagnosis confirmed: the prior gradient had ~15 lightness-point delta between face and base — insufficient for a metallic read.
- Face gradient top stop lifted from `#2e4f78` (L≈32) to `#365d86` (L≈37). Gradient delta now ~20 points. Saturation held controlled (~38%) to avoid vivid polished-blue read.
- Key specular peak raised from 0.32 to 0.38 idle / 0.38 to 0.44 hover. Reinforces the lifted face plane.
- Hover top stop `#2a4870` → `#2f5378`. Proportionally consistent.
- Result: upper face clearly separated from lower body. Cooler and more polished without becoming loud or vivid. Blue-platinum direction established.
- Both "Next step" and "Send" inherit through the shared class. No JSX changed.

**Flags:** None.

**Status:** APPROVED — face/body separation sub-pass complete. See D-030 (updated). Sub-pass B rim recalibration and extrusion pending future briefs.

---

## R-014 — Next Step Button: Rim/Specular Polish Pass QA

**Date:** 2026-06-16  
**Reviewer:** Human Founder  
**Subject:** Rim and specular polish pass for `.enquiry-nextstep-btn`

**Findings:**
- First attempt (rim 0.42/0.52) was imperceptible in the rendered UI — too close to the prior 0.30 baseline to register on screen.
- Correction raised rim to 0.68 idle / 0.78 hover and face radial from 0.12 to 0.22 idle / 0.16 to 0.28 hover. Effect now clearly visible.
- Top rim reads as a perceptibly precise lit edge — not a drawn border, not a bright line. Confirmed cooler and quieter than Begin (1.00 white).
- Face curvature now visibly contributes to the 3D surface read. Upper face clearly lighter than base.
- Two-stop radial dissolve (via 0.06/0.07 mid-stop at 55%) embeds the catch in the surface; no blob or overlay read.
- Button remains quieter than Begin and does not overpower the answer cards or amber filament.
- Both "Next step" and "Send" buttons inherit through the shared class. No JSX changed.

**Flags:** None.

**Status:** APPROVED — rim/specular polish complete. See D-030 (updated). Next: extrusion/deeper 3D pass, pending a future brief.

---

## R-013 — Next Step Button: Material/Depth Pass QA

**Date:** 2026-06-16  
**Reviewer:** Human Founder  
**Subject:** Material/surface pass for `.enquiry-nextstep-btn` — face curvature and depth definition

**Findings:**
- Sub-pass A (face curvature): broad soft radial catch accepted. Upper face reads as gently lit surface, not a gloss blob. Atmosphere is embedded in the surface, not overlaid.
- Sub-pass B (depth/shadow): four-layer box-shadow stack accepted. Top rim reads as caught light, not a drawn border. Lower bevel and drop shadow give the button physical presence. Button reads as a small 3D object.
- Approval note: the lighter top read is a recognised consequence of the light direction beginning to read as 3D. Not a defect. Not a correction request.
- Both "Next step" and "Send" buttons inherit through the shared class. No JSX changed.
- Button remains quieter than Begin and does not overpower the selected cards or amber filament.

**Flags:** None.

**Status:** APPROVED — material/depth pass complete. See D-030 (updated). Extrusion/polish pass is next, pending a future brief.

---

## R-012 — Next Step Button: Colour Pass QA

**Date:** 2026-06-16  
**Reviewer:** Human Founder  
**Subject:** First-pass colour update for `.enquiry-nextstep-btn` (shared "Next step" and "Send" buttons)

**Findings:**
- Flat white pill replaced with three-stop smoked blue-steel gradient.
- Two interim iterations rejected: (1) desaturated slate — read as pale neutral/ivory on screen; (2) saturated cobalt — read as product-UI primary accent, visually separate from glass cards.
- Approved direction: smoked blue-steel, desaturated enough to feel native to the glass-card environment.
- Button now sits naturally alongside frosted blue cards, white active question, teal memory rail, and amber filament.
- Both "Next step" and "Send" buttons inherit the update through the shared class — no JSX changed.

**Flags:** None.

**Status:** APPROVED — colour pass complete. See D-030. Material/depth pass is next.

---

## R-011 — Enquiry Selected-Card Filament Border: QA Pass

**Date:** 2026-06-15  
**Reviewer:** Human Founder + Agent QA  
**Subject:** Animated filament border rollout across Q5–Q1 answer cards

**Findings:**
- Single-rect SVG filament border approved after iterative prototyping. Draw animation works across all cards Q5–Q1.
- Q5 multi-select: multiple simultaneous active filaments render independently with no interference. Visually controlled.
- Q4–Q1: selected card draws filament in; deselecting or advancing to next question fades completed border out smoothly.
- Memory rail and answered-question states: unaffected. `handleNextStep` clears `selected` Set before pushing to memory; filament fades with the card grid during corridor morph.
- Glass material: frosted blue glass unchanged. Filament SVG is `pointer-events: none`, `z-index: 3`; card text remains above at `z-index: 4`.
- Colour: aligned to Q-label gold family (`rgba(190,145,58,0.80)`). Glow layers use same bronze-gold family. Not yellow, not near-white.
- Reduced motion: animation skipped; full border appears immediately on select; opacity fade on deselect retained.
- Lint: only the two known pre-existing `react-hooks/set-state-in-effect` errors at lines 64 and 71 of `enquiry-opening.tsx`.

**Flags:**

*None.*

**Status:** Approved — 2026-06-15. See D-029.

---

## R-010 — Enquiry Answer Card Material: Frosted Blue Glass

**Date:** 2026-06-15  
**Reviewer:** Human Founder  
**Subject:** Answer card material pass — commit 3621997

**Findings:**
- Idle, hover, and selected card states updated to frosted blue glass material. Approved.
- Five deterministic glass variants (A–E) rotate across Q5–Q1. No repeated gradient directions. Approved.
- Selected state retains amber top-edge hairline and warm halo from D-016 — material activation model unchanged.
- Amber perimeter circuit experiment was prototyped, became unstable, and removed before commit. Not approved for production.

**Flags:**

*None.*

**Status:** Approved — commit 3621997. See D-028. Amber circuit work paused; restart requires a new brief.

---

## R-009 — Milestone QA: Homepage Scaffold + Full Enquiry Flow

**Date:** 2026-06-14  
**Reviewer:** Human Founder  
**Subject:** Full site review — homepage scaffold, `/start` full Q5→Q1 corridor, completion state, mobile nav, mobile opening reveal

**Findings:**
- Homepage scaffold (Hero, Services, Work, Contact/CTA, Footer) is clean and restrained. Approved.
- Nav order approved: Services → Work → About → Contact. About is planned but not built.
- Hero right-side space is intentionally empty. Future cinematic direction planned (D-026). Do not fill without a brief.
- Services section approved after spacing/anchor refinement.
- Work section approved. Possible future centred heading or visual asset only if later design direction requires it.
- Contact/CTA section approved. Nav landing is clean and full-screen in style.
- Footer is acceptable for now. Subtle C2B signature refinement planned.
- Full Q5→Q1 corridor approved. Corridor architecture (D-023) proved stable across all five questions.
- Q labels match question text size at all corridor depths. Approved.
- Completion state ("Understood" handoff) approved.
- Send button position approved.
- Begin / Next step / Send button visibility consistent and approved.
- Mobile nav approved. Mobile opening reveal and corridor refinements approved.

**Flags:**

*None.*

**Status:** Approved — milestone commit 2152e6e. Sprint 2 closed.

---

## R-008 — Persistent Q5 Element + Compact Memory Rail

**Date:** 2026-06-01  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx`, `app/globals.css` — D-022 persistent element, chip memory rail, Q4 framing

**Findings:**
- `q5Settling: boolean` replaced by `q5Phase: "active" | "settling" | "memory"` — single source of truth for Q5 visual state
- Q5 DOM node persists from `stage = "question1"` through `stage = "question2"` via `{stage !== "opening" && ...}` conditional; no unmount/remount at the 1200ms transition point — eliminates the repaint event that caused the perceived snap
- At 1200ms: class changes from `enquiry-q5-settling-block` to `enquiry-q5-memory-block-settled` — both specify `transform: translateY(-24px) scale(0.95)` with `transform-origin: top center`; computed transform is identical before and after the class change; block does not visually move
- Q5 cue, question, and cards change class based on `q5Phase`; `aria-labelledby` / `role="group"` in active/settling, `role="note"` / `aria-label` in memory — semantics update atomically with visual state
- Memory field now renders selected answers as `.enquiry-memory-chip` pills in `.enquiry-memory-chips` flex-wrap row — chip height ~26px vs ~53px for full cards; memory block is significantly shorter
- Generic memory rail classes added to `globals.css` (no `q5` prefix): `.enquiry-memory-cue`, `.enquiry-memory-question`, `.enquiry-memory-chips`, `.enquiry-memory-chip` — reusable for Q4, Q3, Q2, Q1 memory states
- `.enquiry-q5-settling-question` now transitions `font-size` (0.8125rem over 900ms) in addition to `color` — ensures no font-size jump at the 1200ms class switch; memory question (`enquiry-memory-question`) matches this size
- Opening context chain reaction: stage switch to "question2" triggers `.enquiry-context-faintest` (opacity 0.10 from 0.38 over 1200ms, scale 0.91 from 0.93 over 1000ms) — chain reaction is perceptible
- Q4 layout-first: with chip memory, Q4 cards end at ~745px from viewport top on a 768px viewport — fits without scroll on standard desktop heights
- Q4 fallback scroll: `scrollIntoView({ block: 'nearest' })` fires on Q4 mount — no-ops if already in view; does not push memory rail off-screen
- Q4 Next step scroll: `scrollIntoView({ block: 'nearest' })` fires when `q4Selected` becomes non-null — mirrors Q5 Next step behavior
- All three `scrollIntoView` calls respect `prefers-reduced-motion`: `behavior: 'auto'` when reduced-motion, `behavior: 'smooth'` otherwise
- `npm run lint` — 0 errors, 0 warnings

**Flags:**

*None.*

**Recommendations:**
- No changes required at this stage

**Status:** Approved — D-022 complete.

---

## R-007 — Q5 → Q4 Four-Point Choreography Correction

**Date:** 2026-06-01  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx`, `app/globals.css` — D-021 four-point choreography correction

**Findings:**
- `transform-origin: top center` added to `.enquiry-q5-settling-block` and `.enquiry-q5-memory-block-settled` — scale now anchors to top edge; visual top positions match at DOM swap regardless of block height; eliminates ~5px jump caused by height-dependent transform-origin mismatch
- Q5 memory field now renders only selected answers via `q5Selections.map()` — no invisible placeholder slots; field is compact and proportional to actual selections
- `nextStepRef` added to Q5 Next step wrapper; `useEffect` calls `scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' })` when `selected.size > 0` and not settling — reduced-motion path uses instant scroll; normal path uses smooth scroll; no-ops if Next step already in view
- `useRef` added to React import
- Stage 2 settling block unchanged — still has 5 cards with per-element transitions; height collapse at 1200ms is invisible because unselected cards were already `opacity: 0` and Q4 hasn't appeared yet
- Q4 natural layout position is higher after compact memory removes invisible placeholder height — Q4 question and cards comfortably visible at standard desktop viewport heights
- `npm run lint` — 0 errors, 0 warnings

**Flags:**

*None.*

**Recommendations:**
- No changes required at this stage

**Status:** Approved — D-021 complete.

---

## R-006 — Q5 → Q4 Handoff Motion Correction

**Date:** 2026-06-01  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx`, `app/globals.css` — Q5 → Q4 handoff motion corrected to per-element settle + spatial recede (D-020)

**Findings:**
- Q5 block now spatially recedes (`translateY(-24px) scale(0.95)` over 1100ms) while individual elements morph toward memory values in parallel — cue dims (800ms), question dims (900ms), selected cards morph (1000ms), unselected cards fade to invisible (600ms)
- Next step button removed from DOM immediately when settling begins — no ghost button during transition
- Stage switches at 1200ms (after settling is fully complete); memory field mounts at same static transform with no animation — swap is invisible
- All five `Q1_OPTIONS` rendered in memory field: selected as card echoes, unselected as `invisible` layout placeholders — no layout reflow on stage switch
- Visual continuity confirmed: outgoing settling end state and incoming memory field start state are identical on opacity, colour, and transform values
- Q4 cards begin entering at 2000ms from click — memory is fully static before Q4 appears
- Reduced-motion: stage switches immediately, no transforms, no transitions — settled memory + Q4 appear at once
- `npm run lint` — 0 errors, 0 warnings
- Settling Q5 cards have `tabIndex=-1` — not in tab order during transition

**Flags:**

*None.*

**Recommendations:**
- No changes required at this stage

**Status:** Approved — Q5 → Q4 handoff motion correction complete (D-020).

---

## R-005 — Q5 Memory Field Correction and Q4 Option Count

**Date:** 2026-06-01  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx`, `app/globals.css` — Q5 memory field corrected to bounded quiet model; Q4 reduced to 5 options; three-layer visual hierarchy enforced

**Findings:**
- Q5 memory field renders Q5 cue label, Q5 question text (muted), and selected answer card echoes — only selected cards, not all Q5 options
- Memory cards are non-interactive `div`s with transparent background, faint border (`rgba(255,255,255,0.06)`), and muted text (`rgba(255,255,255,0.22)`)
- Visual hierarchy in Stage 3 confirmed: opening context at opacity 0.10 / scale 0.91 (`.enquiry-context-faintest`) is visibly fainter than Q5 memory (question at 0.14, cards at 0.22), which is visibly fainter than Q4 (full material surface)
- Memory field does not animate after its 1400ms fade-in — fully static once settled
- ARIA: `role="note"` on memory wrapper with `aria-label` summarising Q5 question and selections; visual children are `aria-hidden="true"` — no duplication for screen readers
- Memory cards are not in tab order (div, not button)
- Q4 reduced to 5 options (removed "Speed of response") — symmetric with Q5
- Reduced-motion: memory field and Q4 appear immediately; no staged reveals
- `npm run lint` — 0 errors, 0 warnings

**Flags:**

*None. No overflow observed with 1 or multiple Q5 selections in manual review.*

**Recommendations:**
- No changes required at this stage

**Status:** Approved — Q5 memory field and Q4 correction complete (D-019).

---

## R-004 — `/start` Stage 3: Q4 Single-Select and Q5 → Q4 Transition

**Date:** 2026-06-01  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx`, `app/globals.css` — Q5 → Q4 transition, Q5 memory surface, Q4 single-select stage

**Findings:**
- Pressing "Next step" in Q5 saves selections to `q5Selections`, applies `.enquiry-q5-settling-wrapper` (opacity 0.2, scale 0.97 over 1100ms), then switches stage to `"question2"` at 500ms — producing the approved calm overlap
- Q5 memory block renders with compact label summary: "You mentioned: [comma-separated short labels]" — labels mapped via `Q5_MEMORY_LABELS` constant
- Q5 memory cue ("Q5") renders at `rgba(255,255,255,0.10)` — more muted than the active Q5 cue (`rgba(255,255,255,0.20)`)
- Q5 memory block fades in via `enquiry-q5-memory-appear` (1400ms linear) — calm, non-urgent
- Q4 cue ("Q4") uses the same `enquiry-q5-presence` animation as Q5 cue — consistent atmospheric orientation
- Q4 question reveals left-to-right via `enquiry-mask-reveal-horizontal` — consistent with Q5 and Stage 1 motion language
- Q4 cards enter top-to-bottom with staggered delays (800ms base + 150ms per card) — matching Q5 card pattern
- Q4 is single-select: `role="radiogroup"` on the group, `role="radio"` + `aria-checked` on each card
- Selecting a Q4 card deselects the previously selected card; clicking the active card deselects it
- Card visual states (amber/gold selected, hover) reuse existing `.enquiry-card` and `.enquiry-card-selected` CSS — no new selectors needed
- "Next step" appears after Q4 selection via `enquiry-nextstep-reveal` — same as Q5 Next step
- `prefers-reduced-motion: reduce`: settling skipped, stage switches immediately, no animation classes applied, all content appears at once
- Keyboard focus navigates Q4 cards; `focus-visible` ring present
- Opening context remains at Stage 2 dimmed state — no further change on Q4 entry

**Flags:**

| Severity | ID | Finding | Status |
|---|---|---|---|
| Low | F-007 | Q4 "Next step" is a placeholder — `console.log` only; Q4 → Q3 transition not implemented | Open — Q3 model not yet designed |

**Recommendations:**
- Design Q4 → Q3 transition before implementing — new brief required
- No other changes needed at this stage

**Status:** Partially open — Q4 stage interaction approved. F-005 actioned. F-007 open (Q4 Next step placeholder pending Q3 brief).

---

## R-003 — `/start` Stage 2: Q5 Guided Question

**Date:** 2026-05-31  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx` — Stage 2 Q5 multi-select question, card surface, Q5 cue, Next step trigger

**Findings:**
- Q5 orientation cue ("Q5") renders above question text; `aria-hidden="true"` confirmed; scale+fade animation triggers on stage mount
- Question text ("What brought you here today?") reveals left-to-right, linear, consistent with Stage 1 motion language
- Five answer cards reveal sequentially top-to-bottom with staggered delays (800ms base + 150ms per card)
- Cards use frosted/smoked glass gradient surface with inset top-edge hairline; visible gradient depth from top to bottom
- Card selection activates amber/gold warmth: border shifts, top hairline shifts from white to amber, faint outer halo; no ticks, circles, or form-control indicators
- Multi-select works correctly: multiple cards can be activated simultaneously
- "Next step" ghost-pill button appears after first selection; unmounts if all cards deselected
- `role="checkbox"` + `aria-checked` on cards; `role="group"` + `aria-labelledby` on wrapper — correct multi-select ARIA semantics
- `prefers-reduced-motion: reduce`: Q5 cue, card reveals, and Next step all appear immediately; selection transitions instant
- Card `focus-visible` ring is visible at keyboard; "Next step" button is keyboard accessible

**Flags:**

| Severity | ID | Finding | Status |
|---|---|---|---|
| Medium | F-005 | "Next step" button currently only `console.log`s selections — no navigation or Q4 reveal | Actioned — Q4 implemented 2026-06-01 |
| Low | F-006 | Q4 transition behaviour is undefined — how answered questions become contextual memory is not yet designed or documented | Actioned — D-017 approved 2026-05-31 |

**Recommendations:**
- Design Q4 transition before implementing — see D-016 Future Work section
- No other changes required at this stage

**Status:** Closed — Stage 2 interaction approved. F-005 actioned (Q4 implemented 2026-06-01). F-006 actioned via D-017.

---

## R-002 — `/start` Stage 1: Opening Reveal

**Date:** 2026-05-26  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx` — Stage 1 mask-based reveal sequence and Begin button

**Findings:**
- Dark radial gradient background renders immediately on route arrival — no flash of white
- Heading line 1 reveals left-to-right, linear, from ~0.6s
- Heading line 2 reveals left-to-right, linear, beginning just before line 1 finishes (~2.9s)
- Supporting text reveals left-to-right, linear, beginning just before line 2 finishes (~5.1s)
- Begin button reveals top-to-bottom, linear, during the final words of supporting text (~9.0s)
- Full phrase settles at ~11.5s — consistent with D-015 approved timing
- Begin button has `tabIndex=-1` and `pointer-events: none` until animation completes; becomes keyboard-accessible on completion
- `prefers-reduced-motion: reduce`: all staged reveals disabled, all content immediately visible, button immediately keyboard-accessible
- All text is real DOM text — no canvas, SVG, or image rendering
- Content wrapper uses `translateY(calc(38vh - 5rem))` in Stage 1 to approximate vertical centring without `justify-center` — prevents layout reflow jump on stage transition

**Flags:**

*None. Stage 1 behaviour matches D-015 approved spec.*

**Recommendations:**
- Minor microtiming adjustments remain possible during a future mastering phase — no action required now

**Status:** Approved. Stage 1 creative milestone complete.

---

## R-001 — Homepage Skeleton

**Date:** 2026-05-23  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `app/page.tsx` — initial homepage structure

**Findings:**
- Navbar, Hero, Services, Work, and Footer sections render in correct order
- Forced dark background (`bg-neutral-950`) applied consistently across all sections
- `Container` component used in every section — layout is consistent
- Typography hierarchy is clear: H1 (6xl bold) → H2 (3xl semibold) → body (lg, neutral-400) → muted (sm, neutral-500)
- CTA button (white pill, `rounded-full`) is visually distinct against the dark background
- Section dividers (`border-t border-neutral-800`) create rhythm without visual noise

**Flags:**

| Severity | ID | Finding | Status |
|---|---|---|---|
| High | F-001 | Geist font variables declared in `layout.tsx` but not applied to `<html>` className — Geist not rendering | Actioned — Sprint 2. Variables applied to `<html>`. See D-011. |
| High | F-002 | `--font-sans` in `globals.css` references `var(--font-sans)` — circular, no effect | Actioned — Sprint 2. Corrected to `var(--font-geist-sans)`. `--font-heading` also fixed. See D-011. |
| Medium | F-003 | Navbar has no mobile responsive state — links will overflow or collapse on small screens | Open — Sprint 2 Up Next |
| Low | F-004 | Nav and CTA use plain `<a>` tags — should use Next.js `<Link>` for client-side routing | Open — Sprint 2 Up Next |

**Recommendations:**
- Apply `${geistSans.variable} ${geistMono.variable}` to `<html>` className in `layout.tsx` (not `<body>` — see D-011 for rationale)
- Correct `--font-sans` and `--font-heading` tokens in `globals.css` to `var(--font-geist-sans)`
- Add mobile nav before launch — pattern TBD (hamburger menu, collapsed links, or slide drawer)
- Replace `<a>` with `<Link>` from `next/link`

**Status:** Partially actioned — F-001 and F-002 resolved in Sprint 2. F-003 and F-004 remain open.

---

*Last updated: 2026-08-31 — **R-020 added**: the `/about` scaffolding, Carl confirming by eye that the mark does not move between pages — *"nailed it"*. Placement APPROVED (D-066); colour PROVISIONAL. Also records the sections resized to full viewport, the rule removed from section 1, and a left-edge defect introduced and fixed in the same pass.*

*⚠ **The previous footer read "2026-06-22 — R-018 added" while R-019 was already in the file.** Corrected here rather than only appended to: a footer naming the wrong latest entry is the kind of stale instrument `context-rules.md` warns about, and R-020 was very nearly filed as a duplicate R-019 because of it.*
