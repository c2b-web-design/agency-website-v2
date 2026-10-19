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

## R-082 — The Ornate Corner, Pass 2: §2's Gold, Satin Gilt (D-100): "Approved"

**Date:** 2026-10-19
**Reviewer:** Human Founder
**Subject:** `/proto/corner` `gold` — physical gold F0, metalness 1, roughness 0.45 (satin), reflecting the family buttons' studio (room 0.1, strength 1, turned 150°) as a judging light. Captures: `live-work/screenshots/corner-bench-19-october/gold1-*.png`.

**Carl's verdict, verbatim:** *"The Satin gilt look is very good. There is a difference in the look of the metal we have used for the logo. Approved."*

**Findings:**

- ✔ **Approved** — §2's material. The difference from the logo's polish is noted and kept.
- ⚠ Judged in the studio only; the real light and its small motion are pass 3. §3's platinum blue is still to come.

---

## R-081 — The Ornate Corner, Pass 1: The Shape In Clay (D-100): "Approved"

**Date:** 2026-10-19
**Reviewer:** Human Founder
**Subject:** `/proto/corner` — take 3: Carl's carved acanthus bracket (`brand-assets/c4bf3a09-…jpg`) traced as a relief (mass by distance from the outline, carving by the photo's light, the moulding drawn clean and mitred), at a 24-px reach, the long arm along the top. Takes 1 (bent tubes) and 2 (banded tubes) rejected on the way. Captures: `live-work/screenshots/corner-bench-19-october/take3b-*.png`.

**Carl's verdict, verbatim:** *"I think the numbers are right as youve called them I originally thought same length for vertical and horizontal bot because of the shape of the recrangle it works better as tou have set it up. Approved."* Earlier, on first sight: *"Ha Ha, now we are talking!"*

**Findings:**

- ✔ **Approved** — the shape pass only. Material and light are passes 2 and 3.
- ⛔ Takes 1–2 rejected: *"screams old, almost Victorian… like a railing"*; *"if it was more solid… engraving and topology"*.
- ⚠ Not watched: §2's wider boxes; other widths; the page (the 28-piece structure is a §5a note still to write).

---

## R-080 — Home §2 (`#services`): The Copy Rewritten As Us, The Section Centred (D-099): "Looks Better"

**Date:** 2026-10-19
**Reviewer:** Human Founder
**Subject:** `app/page.tsx` `#services` — the day-1 placeholder copy replaced: heading *"A front door worth knocking on."*, a two-sentence intro, cards *Bespoke Website Design* / *Website Transformation* / *Guided Enquiries* / *Ongoing Long Term Care*; the heading, intro and card text centred and `text-balance`d. Captures: `live-work/screenshots/home-services-work-19-october/services-take{1,2}.png`.

**Carl's verdicts, verbatim:** *"The door idea is great,. A recognition of that from one selling front doors."* — *"I think the wording is good, avoids jargon. Smart where it helps and human where is matters is a brilliant phrase."* — on the centring: *"I think it looks better, more like a hierarchy or family tree that leads from the opening statement."*

**Findings:**

- ✔ **"Looks better"** for the layout, the words used; the copy praised, not stamped "approved". Not a master (D-035).
- ⛔ "Fewer clients" cut: the business plan is not client-facing (ethos §4a).
- ⚠ Not watched: phones and tablets (mastering, D-094); the boxes' visual design (still day-1 CSS).

---

## R-079 — `/start`'s Three Open Takes: Field Labels, Hover Text, Card Exit (D-023): "Meet Approval"

**Date:** 2026-10-19
**Reviewer:** Human Founder
**Subject:** `/start` — the client-info field labels at full ice `#cfe6ff` (R-078's take, option b); the cards' hover/selected label shade `#5F88C8` replacing the teal (R-076); the card exit with `CARD_EXIT_HEADROOM_MS` at 1149 ms (was 249 ms on 18 August) and the settled beat before the reveal at 250 ms.

**Carl's verdict, verbatim:** *"The labels are good and meet approval, the teal hocer text has been changed. again approved. The card exit is good, the start section needs only mastering and optimising for phone and tablet etc. That will be done at site completion."*

**Findings:**

- ✔ **Field labels: "meet approval"**. ✔ **Hover text: "again approved"**. ✔ **Card exit: "good"**, the word he used, recorded at that level.
- ⛔ **`/start` waits only for mastering and phone/tablet, at site completion** (D-035, D-094). Not a master.
- `verify/hover-teal.mjs`, `verify/teal-core.mjs` (tested the retired teal) deleted on Carl's word; in git history at `9455be9`.

---

## R-078 — `/start`'s Last White Texts To Ice Blue, And The Nav's Fade Made Smooth (D-023): "That's Fixed It"

**Date:** 2026-10-17
**Reviewer:** Human Founder
**Subject:** `/start` — the nav links fade neutral-400 → ice blue from Begin over the heading's 2.6 s (as an animation on the links; the first take's inherited fade chased the links' own 200 ms hover transition and pulsed at the end — measured 37% behind, then a 34% catch-up; now within 2.6% of linear); "Understood." and its subtext, the client-info field labels (full ice, option b — were white at 0.75) and the Send pill's text all `#cfe6ff`. Measured: `live-work/scripts/start-ice-blue-texts-17-october.mjs`, `nav-ice-smoothness-17-october.mjs`.

**Carl's verdict, verbatim:** *"Thats fixed it. commit and push then lock all protected files and test."* (on the nav's pulse). Earlier: *"The grey subtext under 'understood' is the only thing looking out of place. It should also be ice blue."*

**Findings:**

- ✔ **"That's fixed it"** — the words used, about the nav; recorded at that level, not promoted to "approved". Not a master (D-035). Committed and pushed on his word.
- ⚠ The field labels at FULL ice are a take ("try b, we will see how it looks") — no separate verdict.
- ⚠ Not watched: phones; Carl's GPU/Chrome.

---

## R-077 — The Corridor's Recession At Half Speed, With The Heading Travelling (D-023): "It's A Lot Better"

**Date:** 2026-10-17
**Reviewer:** Human Founder
**Subject:** `/start` — the recession (the lines and the heading travelling back) 900 → 1800 ms, the step 1150 → 2050 ms so the next question waits for the lines to settle; the question's reveal untouched. Includes the heading as ONE travelling element, ice blue from Begin, on the corridor's opacity ladder (committed `07dfb01` without a verdict). Measured: `live-work/scripts/recession-half-speed-17-october.mjs`.

**Carl's verdict, verbatim:** *"Its a lot better. Whats the phrase in the files, in the ethos 'more Gilmour, less Malmsteen' it feels smoother, more relaxed. The top level view of this section is to gently guide and lead the user through what is essentially admin. i think that has been achieved."* Earlier, on the heading's colour: *"the heading colour transition looks really good. the contrast against the planet makes the text pop and owerall the text balance on the page at this point is great."*

**Findings:**

- ✔ **"A lot better"** — the words used; NOT promoted to "approved". Not a master (D-035).
- ⛔ The section's purpose, in Carl's words: **to gently guide and lead the user through what is essentially admin.**
- ⚠ Open for Carl's eye: the Q1 → complete hold (900 ms) now starts completion while the last recession moves (a 0.6 px heading jump at 3% opacity; one 2.5 px line step at ~1 s).

---

## R-076 — The Cards' Labels On Hover And While Selected, The Answer Shade (D-023): "Approved"

**Date:** 2026-10-17
**Reviewer:** Human Founder
**Subject:** `/start` — the answer cards' labels on hover AND while selected wear the corridor's answer shade `#5F88C8` (first take platinum `#3F6DB8`, judged too dark by Carl). The hover moved after lighting beside the ice blue, so it settles on its colour and the traveller lifts it; the teal and its 1.7 strength retired; selection holds it (`hovered || lit`). Measured selected 106/140/196 (target 95/136/200), cancel back to ice (`live-work/scripts/card-label-selected-17-october.mjs`, `card-label-hover-17-october.mjs`). The corridor colour change's chunk 4.

**Carl's verdict, verbatim:** *"The lighter answer text on hovver does make a marginal improvement. It was the right call for more than one reson. Approved. Commit and push."*

**Findings:**

- ✔ **APPROVED** — the word used. Not a master (D-035). Committed and pushed on his word.
- Carl's reasoning for a hover quieter than rest: the answer is read at rest; hover confirms; the press and the rim make the choice, cancellable.
- ~~⚠ **Open, not fixed:** under a still pointer the hover can switch itself off with no pointer event — an existing fault, present on the teal too (D-023, 17 October).~~ ⛔ **Corrected the same day — not a product fault.** Carl, with his own mouse: *"it can stay still or move around inside the card, hovver colour doesnt change. Move the pointer out of the cards and it reverts to resting state colour. Exactly as described and built."* The drop is seen only under Playwright's driven pointer (D-023).
- ⚠ Not watched: Q4–Q1; the chosen card's exit; Carl's GPU/Chrome.

---

## R-075 — The Answered Lines, Platinum Blue (D-023): "Approved"

**Date:** 2026-10-17
**Reviewer:** Human Founder
**Subject:** `/start` — the corridor's answered lines (depths 1–5): question and Q number `#3f6db8` (the brand's platinum blue), the answer `#5f88c8` (a shade lighter, to sit just in front); teal and gold retired; opacities unchanged. The corridor colour change's chunk 3. Verified at Q1 (`live-work/scripts/answered-lines-platinum-17-october.mjs`).

**Carl's verdict, verbatim:** *"I think it looks better. The overall aethetic of blue button, cards and receeding text looks and feels more connected. Appoved, commit and push and we will move on to the hovver text."*

**Findings:**

- ✔ **APPROVED** — the word used. Not a master (D-035). Committed and pushed on his word.
- Carl's reading: the blue button, the cards and the receding text now feel like one world (§14a, *"a recurring theme with variations"*).
- ⚠ Not watched: mid-transition; Carl's GPU/Chrome. Next: the cards' hover text.

---

## R-074 — The Question In Focus And Its Q Number, Ice Blue (D-023): "Looks A Lot Better"

**Date:** 2026-10-17
**Reviewer:** Human Founder
**Subject:** `/start` — `.enquiry-pdepth-0`'s question (was white) and Q number (was white at 0.75, one step under) both `#cfe6ff`, the same as the cards' resting labels (R-073); the corridor colour change's chunk 2. Measured at Q5 and Q4: both rendered rgb(207, 230, 255) (`live-work/scripts/focus-line-ice-17-october.mjs`).

**Carl's verdict, verbatim:** *"I think that looks alot better. Its a good contrast betwwen the text and the space enviroment..commit and push."*

**Findings:**

- ✔ **"A lot better"** — the words used; recorded at that level, not promoted to "approved". Not a master (D-035). Committed and pushed on his word.
- ⚠ Not watched: mid-transition frames; Carl's GPU/Chrome. The answered lines are still teal and gold — the next chunks.

---

## R-073 — The Q&A Cards' Labels At Rest, Ice Blue (D-023, D-051): "They Look Good"

**Date:** 2026-10-17
**Reviewer:** Human Founder
**Subject:** `/start` — the answer cards' resting labels pulled to ICE BLUE #CFE6FF after lighting (was neutral white), the corridor colour change's chunk 1. One uniform in `answer-card-mesh.tsx`; the texture's ink and the hover untouched. Measured at 1920 × 952, DPR 1, Q5: settled core rgb(207, 230, 253) on all five cards (was 235, 235, 235), the traveller lifting it to 215 / 239 / 255; hover teal and its return intact (`live-work/scripts/card-label-*-17-october.mjs`).

**Carl's verdict, verbatim:** *"They look good. Brightening the text is not a probplem, as long as it is legible and not blowing out we are good. You can commit and push."*

**Findings:**

- ✔ **"Look good"** — the words used; recorded at that level, not promoted to "approved". Not a master (D-035). Committed and pushed on his word.
- ⛔ **Carl's bound for the traveller on the labels:** brightening is fine **as long as the text stays legible and does not blow out.**
- ⚠ Not watched: selection (a later chunk); Q4–Q1; Carl's GPU/Chrome. Until chunk 2 the focus question is still white.

---

## R-072 — The Planet Leaves The Opening And Fades In On Begin (D-023): "Fade Is Good… Approved"

**Date:** 2026-10-16
**Reviewer:** Human Founder
**Subject:** `/start` — the opening (heading, subtext, Begin) stands on the root's gradient with no planet and no credit; on Begin (`stage === "active"`, the beat the logo starts its gold → blue crossing on) the planet fades in over the crawl's 2.6 s, while Q5 is revealed and the cards enter. One condition in `enquiry-opening.tsx`; loading unchanged. Measured: opacity 0 through the opening, 0 → 1 linear over 2.6 s from the click; reduced motion at once (`live-work/scripts/planet-at-begin-16-october.mjs`). Amends R-071's "behind the opening".

**Carl's verdict, verbatim:** *"fade is good, timed with the logo transition- good choice. approved."*

**Findings:**

- ✔ **APPROVED** — the word used. Not a master (D-035). Not committed.
- ⚠ Not watched: production's network; whether the planet still needs `preload` (open, to be measured before it changes).

---

## R-071 — The Space Behind `/start`: The Planet For The Corridor, The Galactic Centre For The Client Info (D-023): "Looks Great. Approved"

**Date:** 2026-10-15 (session 3)
**Reviewer:** Human Founder
**Subject:** `/start` — the exoplanet GJ 9827d (heic2403a, an artist's concept) behind the opening and the corridor; at `stage === "complete"` it fades out and the galactic centre (opo0928f) fades in, over the crawl's own fade (`--enquiry-crawl-fade`, 2600 ms — no new timing). Both ESA/Hubble, CC BY 4.0, each credit visible at the foot, changes noted. 3840 wide, darkened by a curve (white kept), lightly sharpened, served at quality 90. The cards' opaque ground plane removed first (nothing on that canvas transmits — measured). Cross-fade measured riding the crawl sample for sample; both images loaded before first paint on three cold loads (dev).

**Carl's verdict, verbatim:** *"File size is worth it, theres more definition in the sun. Looks great. Approved. Commit and push."*

**Findings:**

- ✔ **APPROVED** — the word used. The pairing and the reasons are Carl's (D-023's session 3 entries). Not a master (D-035).
- ⚠ Not watched: production's network, reduced motion, phones (mastering). The corridor text becoming 3D in three.js is Carl's stated intention — future work, not this.

---

## R-070 — The Selected Cards' Warmth On `Next step` (D-088, D-051): "This Is The Subtlety I Was After… Approved"

**Date:** 2026-10-15 (session 3)
**Reviewer:** Human Founder
**Subject:** `/start`, Q5 — the button in the FOREGROUND, the five cards `CARD_GLOW_DEPTH` 250 layout px behind it at their real page offsets; five point lights in the button's scene (`CardGlowLights`) in the filament's own colour, × each card's filament (`publishCardGlow`), `CARD_GLOW_GAIN` 1.75. Judged LIVE by Carl, pass by pass (one card; 4 + 5; 1 + 2 + 3; 1 + 3; all five), then on his own browser. The rule (Carl): *"as the card sits in front no effect on the face is expected. But as the rim rolls and as the face comes up from behind."*

**Carl's verdict, verbatim:** *"It is as before but the effect is a tiny bit more noticable. This is the subtlety i was after. It looks great. approved"*

**Findings:**

- ✔ **APPROVED** — the word used — at gain 1.75, depth 250. Not a master (D-035). Not committed.
- ⚠ Stills could not judge it (the light lands only as the pill rolls); the burst harness reads the roll's phase from the pill's shape to compare on and off.

---

## R-069 — The Platinum Blue `Next step` With The Studio's Reflection, On `/start` (D-088): "Looks Good… No White Banding"

**Date:** 2026-10-15 (session 3)
**Reviewer:** Human Founder
**Subject:** `NEXT_LOOK.env` = the teal's studio, copied (HDRI strength 1, room 0.1, turned 150°), on the approved platinum blue (#3F6DB8, ice blue words). Bench face-on: median L 0.028 → 0.035, words worst 5.52 → 5.34:1, blown 316 → 459. `nextstep-rollout-verify.mjs` 11/11. Before it, Carl: *"next step is good. as is the shade"* — the 15 October *"a little jarring"* hold closed.

**Carl's verdict, verbatim:** *"It looks good and crucially there is no white banding behind the text."*

**Findings:**

- ✔ **A positive verdict at the level given — "looks good"; "approved" not used.** The teal's failure (a white band behind the words) checked by his eye and absent. All three family members now carry the studio. Not a master (D-035). Not committed.

---

## R-068 — The Cards' Travelling Light Back On, Dipping At The Two Bends (D-051, D-088): "A Lot Better. Approved"

**Date:** 2026-10-15 (session 3)
**Reviewer:** Human Founder
**Subject:** `/start` Q5 — the traveller back on at its judged brightness on its approved path and pace (the 14 October dark default reversed), with `restTravelLevel` dipping it at the ring's two bends: 0.35 over card 1's left end (held to 18% of the pass, full by 40%), 0.2 over card 3's right end (from 55% → by 80%, held through the bend). Measured on the faces' end quarters: card 1's left end 85, card 3's right end 92, against 86–90 at the middle cards' ends (floor ~66–69). Helpers at `?lighthelpers=1`.

**Carl's verdict, verbatim:** *"That looks a lot better. approved"*

**Findings:**

- ✔ **APPROVED** — the word used. The dip's depths and windows as built (third take). The trajectory kept (Carl: *"i think the trajectory is good"*). Not a master (D-035).
- ⚠ The glass tube takes no direct light, so the traveller lights the faces only. Not committed.

---

## R-067 — The Answer Cards' Tube Take Made The Default On `/start` (D-051): "Yes Put It On Start"

**Date:** 2026-10-15 (session 3)
**Reviewer:** Human Founder
**Subject:** R-066's take (`?tube=1.5&rimuniform=1&tubebloom=1`) as plain `/start`'s default. Measured pixel-identical to the door URL at rest and selected (`live-work/scripts/tube-default-parity-15-october.mjs`).

**Carl's verdict, verbatim:** *"Yes put it on start"*

**Findings:**

- ✔ **An instruction on R-066's look**; the default proven to draw what he judged.
- ✔ **Then, on plain `/start` at his own setting (Windows Text size 100%, DPR 1 — the site's zoom 1.36 on his 1920 screen, D-097):** *"The page looks good"*. Recorded at the level given — not "approved". Not a master (D-035).
- ⚠ Open: Next step beside the new tube. Phones are NOT this chunk's — the whole site's, in the mastering pass (D-094; Carl: *"we will do the whole site after completion"*). (The unused doors were removed the same session on Carl's word — D-051's session 3 entry.) ⛔ **The corner radius is NOT open** — tried at 0–30 last session, the defect found to be the reflection; 14 stands (corrected the same session, on Carl's word).

---

## R-066 — The Answer Cards' Tube: Thinner, Uniform, With A Bloom In The Filament's Colour (D-051, D-029): "Looking A Lot Better"

**Date:** 2026-10-15
**Reviewer:** Human Founder
**Subject:** `/start?tube=1.5&rimuniform=1&tubebloom=1` at the restored scale (D-097) — the glass tube 1.5 (was 2), its reflection the same at every point of the path (`?rimuniform=1`), a soft bloom reading at the old tube's width (`?tubebloom=1`) whose lit part takes the filament's colour and whose over-the-tube part fades as the filament lights. Measured: selected 249/193/131 against the approved 247/195/144; rest 220/221/224. Corner radius 14 (`?cardradius=` door, untouched).

**Carl's verdict, verbatim:** *"Thats looking a lot better."*

**Findings:**

- ✔ **A positive read, at the level given — "a lot better"; not "approved".** All three behind doors; the page's DEFAULT is unchanged (the tube 2, direction-dependent reflection, no bloom). Not a master (D-035).
- ⚠ Open: making it the default (Carl's word); the corner radius (the door exists, no value chosen); the thick tube (`?tube=4`) RAISED AND NOT CHOSEN; the Next step button and phones unchecked with the new tube; a cold load.

---

## R-065 — The Site's Scale, Step 3: `/start` At 1.36 On A 1920 Screen (D-097): "Looks Good"

**Date:** 2026-10-15
**Reviewer:** Human Founder
**Subject:** `/start` scaled — the opening, Q5 → Q1, the cards, Next step, the contact field and Send. Measured: `live-work/scripts/site-scale-verify-15-october.mjs start` (every 3D layer on its page box, 0/0/0/0; Next step's guard green; the canvases identical in both arms; first paint 1.36).

**Carl's verdict, verbatim:** *"looks good. Implement 1 and the card corners still dont look right"*

**Findings:**

- ✔ **A positive read for the scale on `/start`, at the level given — "looks good"; not "approved".** With an instruction: **remove the rollout gate** (the scale site-wide). Not a master (D-035).
- ⚠ **The answer cards' corners: *"still dont look right"*** — at the restored size (the cards drawn 1.36× on his 1920 screen, as he composed them). The corner work of 15 October (the symmetric path, the pixel grid, the symmetric rim light) stays BUILT, NOT APPROVED. Next subject.

---

## R-064 — The Site's Scale, Step 2: `/about` At 1.36 On A 1920 Screen (D-097): "All Good"

**Date:** 2026-10-15
**Reviewer:** Human Founder
**Subject:** `/about` scaled — the room, the wipe, the four cards and their neon, the desk mark's journey into §3, the §4 gold button, the return rules and card 1's restart. Measured: `live-work/scripts/site-scale-verify-15-october.mjs about` (5 stops; the room canvas 1476 × 1654 screen px in both arms; the stage and every section one window ✅; first paint 1.36; scale 1 below 1412).

**Carl's verdict, verbatim:** *"All good"*

**Findings:**

- ✔ **A positive read, at the level given — "all good"; the word "approved" was not used.** The go for step 3 (`/start`). Not a master (D-035).
- ⚠ Open: the motion between stops was judged by Carl's eye only (no harness watches it); the TV; a production cold load; not committed.

---

## R-063 — The Site's Scale, Step 1: The Mechanism And The Home Page At 1.36 On A 1920 Screen (D-097): "Looking Good Now"

**Date:** 2026-10-15
**Reviewer:** Human Founder
**Subject:** `/` at Carl's TRUE density for the first time (Windows Text size back to 100%, `devicePixelRatio` 1) — the whole page zoomed by `--site-scale` (1.36 on his 1920 × 1080), so it reads as it did while he built it at 136% text. After the `--vh` fix (his first look: *"viewports are messed up"* — every section collapsed). Measured: `live-work/scripts/site-scale-verify-15-october.mjs` (first paint at 1.36; the hero ends at the window's bottom, `#contact` + footer = one window, ✅ both arms; the button canvas 390 × 150 screen px in both arms; scale 1 below 1412).

**Carl's verdict, verbatim:** *"Looking good now."*

**Findings:**

- ✔ **A positive read, at the level given — "looking good"; the word "approved" was not used.** It is the go for step 2 (`/about`) under the approved plan (`live-work/plan-site-scale-15-october.md`). Not a master (D-035).
- ⚠ **Every verdict from R-001 to R-062 was given at 1.36** (D-097). On a 1920 screen the scale now reproduces that; below 1412 px wide the site is as it always was.
- ⚠ Open: the TV; a production cold load; `/about` and `/start` unscaled until their steps (the rollout gate); not committed.

---

## R-062 — The Answer Cards: Glass Tube, Filled Studio, The Filament Holding At Its Flare (D-051, D-029): "Approved"

**Date:** 2026-10-15
**Reviewer:** Human Founder
**Subject:** `/start?cardrim=glass&cardenv=shell&cardroom=1&cardgain=4` at Q5 — R-061's glass tube and filled studio, with the filament's settle removed (Carl: *"the slight decrease after it has warmed up is not needed now"*): it rises to its flare (× 1.7, temperature 0.70) and holds. Frame: `live-work/screenshots/cards-material-15-october/rim-glass-hold/3-card1-selected.png`.

**Carl's verdict, verbatim:** *"yes a lot better. approved"*

**Findings:**

- ✔ **APPROVED** — the cards' new edge and light as a set, behind doors. Not a master (D-035).
- ⚠ Open: the doors to the page's defaults; the opening, Q5 reveal and cold load with the HDRI fetched on `/start`; Carl's fresh refresh; not committed.

---

## R-061 — The Answer Cards: The Rim As A Clear Glass Tube, The Face's Gaps Filled, Behind Doors On `/start` (D-051, D-029): "A Helluva Lot Better"

**Date:** 2026-10-15
**Reviewer:** Human Founder
**Subject:** `/start?cardrim=glass&cardenv=shell&cardroom=1&cardgain=4` at Q5 — the rim (a 4 px half-tube, tungsten) as ONE clear glass tube, reflect-only (`RIM_GLASS_COLOR` #0c0e12, roughness 0.1, metalness 0), after Carl's *"the glass tube going around the cards should be the same as the about cards tube. just one element"*; the face's environment with the two-panel studio's black shell replaced by the studio HDRI (room 1, × 4) — the face's ends 21.4 → 44.3 against its middle. Frames: `live-work/screenshots/cards-material-15-october/`.

**Carl's verdict, verbatim:** *"That looks a helluva lot better."* (on the face's fix alone, earlier: *"The card faces look a lot better."*)

**Findings:**

- ✔ **A positive verdict, at the level given; the word "approved" was not used.** Behind doors; the page unchanged.
- Measured: the rim peak 241 → 162; the selected filament reads saturated amber across the tube.
- ⚠ Open: pass 3 (the filament as a bulb filling the tube); a transmitting tube as `/about`'s (a new pass on `/start`, measured); the doors to defaults; the opening, Q5 reveal and cold load with the HDRI on `/start`; the platinum blue `Next step`'s shade (*"a little jarring"*).

---

## R-060 — The Gold `Start a conversation` With The Studio's Reflection, Bench And `/about` §4 (D-088): "Approved"

**Date:** 2026-10-15
**Reviewer:** Human Founder
**Subject:** `/proto/button?member=start…&env=hdri&envroom=0.1&envyaw=150` — the gold's approved look (R-049/R-051) with the teal's studio settings applied unchanged; then on `/about` §4 (`START_LOOK.env`) with its stills re-rendered.

**Carl's verdict, verbatim:** *"i agree. A brighter gold does bring the text out more. So even though i mentioned a standard, which is generally true, settings may or may not have to be tweaked depending on the colour and text. Approved. Put it on the page then commit and push."*

**Findings:**

- ✔ **APPROVED** — the gold member under the logo standard. Not a master (D-035).
- ⛔ **The standard refined:** the logo sets the method; the settings are tuned per member, by colour and words' colour.
- Measured on the bench (face-on, scale 2): median L 0.203 → 0.242; the dark words' worst 2.62 → 3.28:1 (the reflection's lift raises dark-ink contrast). On `/about`: swap match 0.00; `start-button-about-verify.mjs` 9/9; roll 0 frames over 34 ms.
- ⚠ Open: production's arrival not measured; the blue `Next step` still held at no reflection.

---

## R-059 — The Teal `Who we are` With The Studio's Reflection, On The Home Page (D-088): "Approved"

**Date:** 2026-10-15
**Reviewer:** Human Founder
**Subject:** The home page `#contact` on the dev server: the approved teal (R-046) with the studio HDRI's reflection as detail — R-058's bench take (`WHOWEARE_LOOK.env`: strength 1, room 0.1, turned 150°), roughness kept at 0.4 (Carl: *"keep 0.4 and put it on the page. i will judge it in its proper environment."*); its stills re-rendered; the gold and the blue pinned to no reflection.

**Carl's verdict, verbatim:** *"Button looks great. Approved. Move onto the gold button."*

**Findings:**

- ✔ **APPROVED** — the teal member under the logo standard (D-088, 15 October). Not a master (D-035).
- Behind it: the swap pixel-identical to the new still (0.00); `whoweare-home-verify-roll.mjs` 9/9; roll smoothness 0 frames over 20 ms; the gold's stills byte-identical; `nextstep-rollout-verify.mjs` 11/11; the `.hdr` fetched on `/` only.
- ⚠ Open: the take-over from the still ~2.2 s (dev) vs ~1.1 s on 13 October — production to be measured before the push; not committed.

---

## R-058 — The Teal `Who we are` With The Studio's Reflection, Turned And Darkened, On The Bench (D-088): "That Looks A Lot Better"

**Date:** 2026-10-15
**Reviewer:** Human Founder
**Subject:** `/proto/button?mode=teal&paint=1fb2c4&metalness=1&paintrough=0.4&roll=1&mlkind=lamp&mli=1&mllift=120&mldip=0.9&mldipat=0.5&mldipw=0.4&scale=2&env=hdri&envroom=0.1&envyaw=150` — the home page's approved teal (R-046: painted metal, the clay's lamps, the moving lamp, rolling) with the reflection of a studio HDRI added as detail (Poly Haven "Monochrome Studio 02", CC0), its room darkened to 0.1 and the studio turned 150° so its dark side sits behind the words. The re-track under Carl's ruling that the logo is the standard for metal (D-088, 15 October). Frames: `live-work/screenshots/metal-standard-15-october/`.

**Carl's verdict, verbatim:** *"That looks a lot better. theres no white band behind the text and its legible and the extrusion is visible as it rotates."*

**Findings:**

- ✔ **A positive verdict, at the level given — "a lot better"; the word "approved" was not used.** Bench only; the home page is unchanged.
- Measured face-on (home size, DPR 2): median L 0.116 (the page 0.096), blown 507 px (365), words worst 2.32:1 (2.41:1).
- Superseded the same day by Carl's eye: the studio at strength 1 (*"too bright. The text is on the way to being blown out"*) and at 0.4 (*"it does not improve it"*).
- ⚠ Open: roughness (0.4) vs the logo's 0.25; the gold with the same studio; the live pages (the stills, the cold load, the roll's smoothness, the blue unchanged).

---

## R-057 — R-050 – R-052 And R-054 – R-056 Raised From "Looks Good" To Approved (D-088): "Yes, Approved"

**Date:** 2026-10-15
**Reviewer:** Human Founder
**Subject:** The six verdicts recorded at the level given (*"looking good"*, *"looks great"*, *"good"*, *"looks good"*) and listed as open in the 14 October handoff: R-050 and R-051 (the gold `Start a conversation` button on `/about` §4, the room's off-screen rules, option A), R-052 (§2's return rules, step 2, card 1's prompt), R-054 – R-056 (the platinum blue `Next step`: material, light, on `/start`).

**Carl's verdict, verbatim:** *"Yes, approved."*

**Findings:**

- ✔ **APPROVED — all six, as built on 13–14 October.** The original entries keep their wording (no retroactive rewriting); this entry raises them. Not a master (D-035).
- ⚠ Not covered by this approval: the 60% share for "in §4" (R-052's open item — explained to Carl the same day); the player's idle content, **PARKED by Carl** (*"parked, we will come back to this"*).

---

## R-056 — The Platinum Blue `Next step` On `/start`, Rolling At Every Question (D-088): "Looks Good"

**Date:** 2026-10-14
**Reviewer:** Human Founder
**Subject:** `/start` on the dev server: `NextStepSurfaceHost` unchanged, drawing the family's platinum blue member (`NEXT_LOOK`, R-053 – R-055) in place of the August chrome pill; the letters from a hidden copy of the box rule; rolling at every question (after the stale-focus hold was found and fixed), holding near the pointer or on focus; no frames while hidden; the traveller dark (`?traveller=1` restores it). Structural note `live-work/structural-note-nextstep-rollout-14-october.md`.

**Carl's verdict, verbatim:** *"yes looks good. Commit and push"*

**Findings:**

- ✔ **A positive verdict, at the level given — "looks good"; "approved" was not used.** With an instruction to commit and push. Not a master (D-035).
- Behind it: `nextstep-rollout-verify.mjs` 11/11 twice; the Q5 reveal 17 ms longest frame (the old pill 50–51 ms, A/B interleaved).
- ⚠ Open: the button's light on the cards and the cards' warm glow on the button — Carl's next subject; the traveller to be repositioned; the button's roughness vs the desk mark's (the same base blue, lit differently — Carl not yet asked to choose); `NextStepCanvas` (the old pill) still in the file for `/proto/nextstep`; reduced motion, phones, production not looked at.

---

## R-055 — The `Next step` Button Redone, Pass 3: The Light (D-088): "It Looks Good"

**Date:** 2026-10-14
**Reviewer:** Human Founder
**Subject:** `/proto/button?member=next…&mlkind=lamp&mli=1&mllift=120&mldip=0.9&mldipat=0.5&mldipw=0.4` — R-054's platinum blue with ice blue words under the clay's lamps plus the teal's moving lamp exactly as approved (R-045/R-046). Measured frozen at 9 points: the words' worst pixel 4.79:1; at most 21 px with a channel ≥ 250 (the left end's blue glint). Frames: `live-work/screenshots/nextstep-family-14-october/pass3/`.

**Carl's verdict, verbatim:** *"It looks good. Put it on the page. We also need to see what the light for the button has on the cards, if any."*

**Findings:**

- ✔ **A positive verdict, at the level given — "looks good"; "approved" was not used.** With the instruction to put it on the page: a structural step, written up first (`live-work/structural-note-nextstep-rollout-14-october.md`).
- Carl's question on the button's light reaching the cards: none today, by construction (separate scene and canvas) — answered in the note, §5.

---

## R-054 — The `Next step` Button Redone, Pass 2: Platinum Blue, The Words Ice Blue (D-088): "It Looks Good"

**Date:** 2026-10-14
**Reviewer:** Human Founder
**Subject:** `/proto/button?member=next&mode=teal&paint=3f6db8&metalness=1&paintrough=0.4&ml=0&roll=1` — the desk mark's platinum blue (#3F6DB8) as paint, metalness 1, roughness 0.4 (the teal's and gold's recipe) under the clay's lamps; the moving lamp off (pass 3). Three inks measured worst-pixel against the bare metal: white 7.77:1, #F2F4F7 7.05:1, ice blue #CFE6FF 6.07:1. Frames: `live-work/screenshots/nextstep-family-14-october/pass2/`.

**Carl's verdict, verbatim:** *"It looks good. Lets go with ice blue for the text."*

**Findings:**

- ✔ **A positive verdict on the material, at the level given — "looks good"; "approved" was not used.** The words: ICE BLUE #CFE6FF (the teal's ink; worst pixel 6.07:1). White and #F2F4F7 RAISED AND NOT CHOSEN.
- ⚠ Reported with it: a 3 × 3 px glint on the left end at blue 250–251 (R ~120, G ~165 — not white). Next: pass 3, the light (the contrast owed along the moving lamp's whole path).

---

## R-053 — The `Next step` Button Redone, Pass 1: The Mesh In Clay (D-088): "Approved"

**Date:** 2026-10-14
**Reviewer:** Human Founder
**Subject:** `/proto/button?member=next&mode=clay&roll=1&label=1` — `Next step` as the button family's fourth member (platinum blue to come): the family pill built to its measured label (116.3 × 41 in Geist, the size it has in the Q&A), the family's narrower rim (the old wide skirt gone), solid and rolling forward, the words extruded. Frames: `live-work/screenshots/nextstep-family-14-october/pass1/`.

**Carl's verdict, verbatim:** *"Looks good. In propotion and one of the family. Approved"*

**Findings:**

- ✔ **Approved, at the level given: THIS button's shape pass** (as R-042, R-047). Next: pass 2, the material — the platinum blue as paint (#3F6DB8, metalness 1, roughness 0.4) and the words' colour.
- ⚠ The live Next step on `/start` is unchanged (the rollout is a separate structural step). The traveller is dark by default on `/start` the same day (not yet judged).

---

## R-052 — §2's Return Rules, Step 2, And Card 1's Prompt On `/about` (D-088): "Functions And Mechanisms Are Good"

**Date:** 2026-10-14
**Reviewer:** Human Founder
**Subject:** `/about` on the dev server: §2's three states (fresh / playing / static — reaching §4 sends a playing §2 static; a 3 s linger in §3 re-arms it); the trigger reading both directions (the wipe past CA AND the wall cards in full view — the unseen deep-link strike gone); card 1's face as the restart (an invisible button cut to CA's approved outline); "click to restart" large on the face in the cards' Geist, at the face's angle; on a click the rim flickers on with CA's ignition while the words flicker off with its reverse; the desk mark holding its first strike. Structural note `live-work/structural-note-s2-return-step2-14-october.md`.

**Carl's verdict, verbatim:** *"Functions and mechanisms are good. So is text size and the timing of its exit. Connit and push."*

**Findings:**

- ✔ **A positive verdict, at the level given — "good" for the functions and mechanisms, the text size and the exit timing; the word "approved" was not used.** With an instruction to commit and push. Not a master (D-035).
- Superseded the same day by Carl's eye: the first restart control, a bordered HTML button at CA's centre (*"the look of the button looks out of place"*).
- Behind it: `about-s2-return-verify.mjs` 20/20 (test browser); the words' first appearance 34 ms longest frame.
- ⚠ Open: the words' keyboard focus ring clipped by the face's outline (mastering, D-094); the 60% share for "in §4" is the Builder's reuse of §3's figure; the player's idle content undecided (Carl); the mock conversation for the film's `01 Discussion/`.

---

## R-051 — The Gold Button At 2× On `/about` §4, The Room Off-Screen Rules And Option A (D-088): "Looks Great"

**Date:** 2026-10-13
**Reviewer:** Human Founder
**Subject:** `/about` on the dev server: the gold button at 2× (381.1 × 82) with §4's text scaled as the home `#contact` (R-045); the room drawing nothing while off screen (step 1 of Carl's return rules), compiling its shaders off screen (`compileAsync`, shadows "percentage"), and — Carl's option A — one hidden warm render before the gold button goes live on a direct `#start` load; the button's lamp mounted dark from the start.

**Carl's verdict, verbatim:** *"Looks great. Commit and push"*

**Findings:**

- ✔ **A positive verdict, at the level given — "looks great"; the word "approved" was not used.** With an instruction to commit and push. Not a master (D-035).
- Behind it: the roll's steady window 0 late frames at §4 (was 16–21); no freeze scrolling up from a direct `#start` load (was 1.57 s); both pages' verify 9/9.
- ⚠ Open: one unexplained 133 ms frame in 1 of 3 direct-load runs (GPU-side); step 2 of the return rules (3 s linger re-arms; passing through → static + a restart) and the restart control — not built; the mock conversation for the film's `01 Discussion/`.

---

## R-050 — The Gold `Start a conversation` Button On `/about` §4, After The Cold-Load And Smoothness Fixes (D-088): "Looking Good"

**Date:** 2026-10-13
**Reviewer:** Human Founder
**Subject:** `/about` §4 on the dev server: the gold family button (R-047 – R-049) on the page at 1×; its STILL from the first paint, handing over pixel-identically to the live canvas (`family-button-swap-match.mjs`); the desk mark's geometry built in a Web Worker; the room drawing nothing while off screen (step 1 of Carl's return rules). Earlier the same day Carl had rejected the cold load (*"It looks like a glitch and a mistake"*) and then the roll (*"the rotation is not smooth"*).

**Carl's verdict, verbatim:** *"the gold button is looking good"*

**Findings:**

- ✔ **A positive verdict, at the level given — "looking good"; the word "approved" was not used.** Not a master (D-035).
- Measured behind it: production swap 1.17–1.57 s on a refresh (was 2.4–5.5 s); the roll's steady window 0 late frames (was 16–21). ⚠ Left: one ~240 ms freeze ~0.75 s after the swap on a DIRECT `#start` load only.
- ⚠ Not committed. The home page's teal carries the same still fix (Carl: *"the who we are button is good"*).

---

## R-049 — The `Start a conversation` Button, Pass 3: The Light (D-088): "Looks Fantastic. Approved"

**Date:** 2026-10-13
**Reviewer:** Human Founder
**Subject:** `/proto/button?member=start&mode=teal&paint=ffe39e&metalness=1&paintrough=0.4&ink=1e1e24&side=1e1e24&roll=1&mlkind=lamp&mli=1&mllift=120&mldip=0.9&mldipat=0.5&mldipw=0.4` (plain and `&lighthelpers=1`), live in Carl's browser: R-048's gold under the clay's lamps and the teal's moving lamp exactly as approved (R-045/R-046), its path scaled to the width; the letters' sides #1E1E24 (the new optional `side`, the teal unchanged). Frames: `live-work/screenshots/gold-button-13-october/pass3/`.

**Carl's verdict, verbatim:** *"Looks fantastic. approved"*

**Findings:**

- ✔ **APPROVED — pass 3, the light, with the sides #1E1E24.** All three passes of the gold member are approved on the bench (R-047, R-048, R-049). A take, not a master (D-035).
- Not yet on `/about`: the rollout is a second WebGL canvas on that page (CLAUDE.md §5a) — its structure goes to Carl before it is built.

---

## R-048 — The `Start a conversation` Button, Pass 2: Gold, The Words #1E1E24 (D-088): "#1E1E24 Gets The Approval"

**Date:** 2026-10-13
**Reviewer:** Human Founder
**Subject:** `/proto/button?member=start&mode=teal&paint=ffe39e&metalness=1&paintrough=0.4&ml=0&roll=1&ink=…`: the desk mark's gold (#FFE39E as paint = F0 1.0/0.77/0.34) on the clay's material and lamps, metalness 1, roughness 0.4 (the teal's method, R-045); four inks shown. Frames: `live-work/screenshots/gold-button-13-october/pass2/`.

**Carl's verdicts, verbatim:**
- On #121212 and #1E1E24: *"the 1e1e24 looks great. before its approved i want to try something. Try #0B132B and #1C2541"*
- After seeing both navies live: *"#1E1E24 gets the approval. the others were similar and good but lets go with #1E1E24"*

**Findings:**

- ✔ **APPROVED — the words #1E1E24 on the gold as built.** A take, not a master (D-035).
- **Raised and not chosen:** #121212; the navies #0B132B and #1C2541 (*"similar and good"*).
- ⚠ **Open:** the letters' SIDES are still the teal's fixed `SIDE_INK` #58779a (blue-grey, seen only off-face in the roll) — a change to `whoweare-button-scene.tsx`, put to Carl.

---

## R-047 — The `Start a conversation` Button, Pass 1: The Mesh In Clay (D-088): "It Looks Good… Approved"

**Date:** 2026-10-13
**Reviewer:** Human Founder
**Subject:** `/proto/button?member=start&mode=clay&roll=1&label=1` (and `&zoom=4`): `/about` §4's button, the family's third member, built to its measured label at 1× (190.5 × 41, Geist) on the family module, solid and rolling like `Who we are`; no new geometry. Frames: `live-work/screenshots/gold-button-13-october/pass1/`.

**Carl's verdict, verbatim:** *"It looks good. the text isnt a problem, its more noticable at 4x. it wont be that big on the page. approved."*

**Findings:**

- ✔ **APPROVED — pass 1, the mesh.** A take, not a master (D-035).
- ✔ **The words standing off the pill edge-on (~80°) are not a problem** — noticeable at 4×, not at page size; inherited from the approved teal clay.
- Next: pass 2, the material — gold, the words #121212 or #1E1E24.

---

## R-046 — The `Who we are` Button Rolling On The Home Page (D-088): "That Look Excellent… It Works Extremely Well As It Is"

**Date:** 2026-10-12 (session 2)
**Reviewer:** Human Founder
**Subject:** the home page `#contact` (not pushed): the button solid and rolling forward (slow at the faces, fast edge-on), held by pointer proximity or focus, in R-045's look (painted teal metal, roughness 0.4, the clay's lamps, the moving lamp with its lift and dip), 2×, the section's text scaled with it. Film: `06 On the page/2026-10-12_1721_page_roll2_{section,button-2x}.mp4`.

**Carl's verdicts, verbatim:**
- On the roll on the bench: *"the roll looks great."*
- On the page: *"That look excellent. The flat back underneath the text is now only fleeting and i dont think it needs any adjustment with the light. It works extremely well as it is. Just put the light helpers on the page for explanation purposes."*

**Findings:**

- ✔ **A strong positive verdict, at the level given — "excellent", "works extremely well as it is"; the word "approved" was not used.** Not a master (D-035).
- ✔✔ **APPROVED — then given explicitly, the same session, on the page with the helpers** (Carl asked *"is yellow global and blue moving?"* — yes): *"Yes, thats great. Most definately approved. Excellent work."* **The `Who we are` button's pass 3 (the light) and the reopened pass 1 (the roll) are APPROVED as on the home page, with the section's text sizes and the light helpers.** Still a take, not a master (D-035).
- ✔ **The light needs no adjustment** — the lamp's lift and dip (tuned at 1× on a still pill) stand on the rolling 2× button. The flat strip under the words, raised earlier, now shows only in passing.
- ✔ **Light helpers on the page** (`?lighthelpers=1`, explanation only — never on a plain visit): the clay's two lamps as gold suns (`ClayLightHelper`), the moving lamp as a cyan sun on its path with its aim line, both as bright as the lamp is. Film: `06 On the page/2026-10-12_1729_page_helpers1_section.mp4`.
- ~~⚠ **Not pushed.**~~ → **Pushed `e905baa`; all three Vercel projects READY.** ⚠ **Open, Carl's:** the family's one height (41) — this member now leaves it; phones not looked at (D-094); whether `lib/canvas-on-screen.ts` joins the protected list; HOVER beyond the hold (none designed).

---

## R-045 — The `Who we are` Button, Pass 3: The Painted Metal, The Moving Lamp With Its Dip, 2× In A Rescaled Section (D-088): "A Lot Better"

**Date:** 2026-10-12 (session 2)
**Reviewer:** Human Founder
**Subject:** `/proto/button?context=home&scale=2&h2=48&p=20&w=900&pw=680&pgap=28&gap=72&mode=teal&metalness=1&paintrough=0.4&mlkind=lamp&mli=1&mllift=120&mldip=0.9&mldipw=0.4` — the clay coloured teal, metalness 1, roughness 0.4, under the clay's lamps; one moving lamp on Carl's path, its arc lifted, dipped as it crosses the words; the button at 2× (259 × 82) under the home `#contact` section's heading (48 px) and paragraph (20 px), 72 px above it. Films and frames: `05 Pass 3 - Light/` (`metalness-ramp/`, `roughness-ramp/`, `…moving3-dip…`, `size/`).

**Carl's verdicts, verbatim:**
- On the roughness ramp's 0.4 frame: *"This is closer without becoming too dark and it still showing metalness. So the words are secondary to how i want it to look."*
- On the flat strip: *"a flat strip under the text is ok, especially if the the text is flat."*
- On moving3 (the dip): *"Thats a lot better."*
- On 2× with gap 72: *"looks good but the text and subtext look too small now"*; on the rescaled section: *"yes, that looks a lot better."*

**Findings:**

- ✔ **A positive verdict on the take, at the level given — "a lot better", not "approved".** Pass 3 is not closed; nothing here is a master (D-035).
- ⚠ **Words secondary (Carl's ruling):** worst 2.08–2.71:1 along the path — measured, reported, not gating.
- ⚠ **Not yet on the home page.** `app/page.tsx` is locked; the scene's approved values (`WhoWeAreScene`) are still step 1. Rolling out the look, the 2× size and the section's text sizes needs Carl's word and a named unlock.
- ⚠ **Open, Carl's:** the family's one height (41) — this member now leaves it; phone widths not looked at (D-094); the reduced-motion rest and the frame gating for the moving lamp (structural note, point 6) are owed at rollout.

---

## R-044 — The `Who we are` Button, Pass 3: The Logo's Studio In Teal And The Moving Softbox (D-088): "Its Not Looking Like A Pill"

**Date:** 2026-10-12 (verdict given at 14:43, session 1; recorded in session 2, the first session's limit having run out before it was written)
**Reviewer:** Human Founder
**Subject:** `/proto/button?studio=teal&light=0&floor=0.6&fill=0.5` — light take 8 (the about logo's studio, cooled, end-cap catches × 0.5) with the moving softbox (moving1) on Carl's path. Measured: 0 blown pixels, label worst 4.68:1 along the path.

**Carl's verdicts, verbatim:**
- Session 1, 14:43: *"Heres the problem ive got. its not looking like a pill. There are 2 ugly black bands surroumding the text and 2 dark bands on the crown."*
- Session 2, on the version he can see (his screenshot: the committed look, step 1 — the pill studio + the static key from the right): *"there is the 2 blown out shines on the crown. also there is the 2 dark bands on the face."*

**Findings:**

- ⛔ **Not approved — take 8 + moving1.** It does not read as a pill: the dome mirrors the studio's near-black gaps between its panels as dark bands either side of the words and on the ends.
- ⛔ **The committed step 1 shows both faults too** — two blown-out shines on the end caps, two dark bands on the face. ⚠ The Builder's session-2 report called step 1 the best pill so far; Carl's eye corrected it.
- ⚠ **The moving softbox, seen by the Builder at 4× (session 2):** nearly invisible along the path at strength 0.5 (the 4.5:1 cap); face-on, the flat top mirrors it as a thin hard rectangle round the words. Not yet put to Carl as a verdict.
- ⚠ **Open:** the global light — see D-088's 12 October session-2 entry for the three options raised and the teal background Carl asked about.

---

## R-043 — The `Who we are` Button, Pass 2: Teal Metal, The Ice-Blue Label, Extruded (D-088): "Looks Good So Far, Approved"

**Date:** 2026-10-12
**Reviewer:** Human Founder
**Subject:** `/proto/button` take 8 — teal #1FB2C4 as the metal's F0 (metalness 1, roughness 0.25) in the pill's own studio (`PILL_STUDIO`, the face kept deep behind the label); the label in ice blue #cfe6ff, extruded 0.6 px in Geist SemiBold, placed where the browser draws it, its back on the dome. Worst pixel behind the label 5.20:1 (median 6.93:1).

**Carl's verdicts, verbatim:**
- On take 4 (near-black ink): *"The text will not be black. We need a complementary colour, possibly light blue."*
- *"Lets extrude the text slightly. Make it Three js"*; *"Dont make is as big as that. It must be proportionate to the pills size but take into account where i said the lights motion will be."*
- On take 8: *"We will get a better idea of the extrusion height needed once we have a static light, at first, from the right shining accross its face. It looks good so far, approved."*

**Findings:**

- ✔ **Approved — pass 2 of this button**, at the level given (*"so far"*): the material and the label. Not a master (D-035).
- ⚠ **The extrusion depth (0.6 px) is explicitly NOT settled** — Carl will judge it under a static light from the right, the first step of pass 3.
- ⚠ **Not yet measured:** the label's contrast under any direct light (pass 3, along the whole path).
- ⚠ Three takes rejected by the Builder before showing (green under the gold's studio; flat; 4.19:1), one ink overruled by Carl (near-black), one capture fault (take 7's tilt) — all kept in the film folder.

---

## R-042 — The `Who we are` Button, Pass 1: The Mesh In Clay, The Rim Made Smaller (D-088): "This Pass Is Approved"

**Date:** 2026-10-12
**Reviewer:** Human Founder
**Subject:** `/proto/button` — the home page's `Who we are` pill as the second member of the button family, in clay: built to its measured label (129.5 × 41, Geist), on the family module (`components/ui/button-family-geometry.ts`) with the family's own cross-section (`FAMILY_PROFILE`: the rim made smaller, take 3). Plan v2 through the plan-review gate (the Architect: approve with amendments).

**Carl's verdicts, verbatim:**
- On take 2 (Next step's cross-section): *"The rim shouldnt be that big… Go by the mesh only… A better way would be to do by the numbers of the mesh."* Then: *"make the rim smaller. Also refer to the ivory button."*
- On take 3, stating the family rule: *"so the l+r sides are the same. The height is the same. The width of the pill is determined by what text is on there"*; *"If the height is made taller we can alter the crowns accordingly. it must change proportionately to the height"*; and the verdict: *"For the "who we are " button- yes this pass is approved."*

**Findings:**

- ✔ **Approved — for the `Who we are` button, pass 1 (the shape).** Recorded at the level given: a pass of this button, not the family's master (D-035), and not Next step, which keeps its own cross-section until its redo.
- ✔ **Parity, by browser readback against the live Next step:** zero difference at 116.3 × 41 under `NEXTSTEP_PROFILE`; the check proven able to fail (`PARITY_CONTROL=1`). ⚠ Proves the BUILDER; the family's shape now differs from today's Next step by design.
- ✔ **The rim, measured off both meshes the same way:** 4.6 px → 2.2 px (the groove's slope dip). Reference: the ivory Begin button's ~3 px (1 px rim over a 3 px sub-rim).
- ✔ **The family rule, built in:** ends and height the same for every member, width from the label, and the crown scaling with the height (8.5 per 41 px — exactly 8.5 at 41, nothing approved moved).
- ⚠ **Known and kept:** ~2.3 px edge steps at 4× from the grid (Architect, point 4); invisible at real size.
- ⚠ **Not judged here:** the material, the label colour (≥ 4.5:1 along the light's whole path — ruled), the light.

---

## R-041 — The Desk Mark's Journey Tied To The Scroll, Its Light Directed (D-088): "Excellent… Extremely Good"

**Date:** 2026-10-10
**Reviewer:** Human Founder
**Subject:** plain `/about` — the journey tied to the scroll (a one-screen runway, the drop on the page's move into §3, latched in the viewer, the Examples jump dropping in from the top right); the light DIRECTED by the Builder on Carl's delegation (the studio held per part of each movement, eased between, tracking the drop); `?lighthelpers=1`. `app/about/page.tsx`, `components/about/about-card-canvas.tsx` (`DESK_MARK_TIE`, `DESK_MARK_DIRECTOR`).

**Carl's verdicts, verbatim:**
- The directed light, watched with and without the helpers: *"it looks excellent. screenshots are my favourite bit. Apart from the light and shadows accross the fave look at that shine/glint on the rim. It moves quickly, like the glint on the gold rim in the client info section when the light passses round the back. At slow speed, edging forward almost frame by frame its niticable. At normal speed the glint is striking, almost a momentary flash with movement.. Excellent. The logos journey looks extremely good."*

**Findings:**

- ✔ Recorded at the level given — "excellent", not "approved", not a master (D-035). The scroll tie had no separate verdict; Carl moved straight to the light, then judged the journey as a whole: *"extremely good"*.
- ⚠ **Takes inside it, not judged one by one:** the runway's one screen, the 150 ms lag, the 0.9 s holds, the 220 ms blend, the drop's 12° offset.
- ⚠ **Raised, open:** a jump drops in dark; a scroll straight from §1 starts the journey as the light rises; a scroll mid-wobble jumps up to 3.75°.
- ⚠ **Measured by the Builder on 41 held points, not filmed at speed** — Carl judged the motion.

---

## R-040 — The Desk Mark's Wobble, The Clue That It Moves (D-088): "A Lot Better"

**Date:** 2026-10-10
**Reviewer:** Human Founder
**Subject:** plain `/about` — once, 5 s after CA's strike, the mark rocks on its edges: four eased rocks, 3.75° → 2.25° → 1.125° → 0.5625° each way, over 2 s. `components/about/about-card-canvas.tsx` (`DESK_MARK_WOBBLE`).

**Carl's verdicts, verbatim:**
- 500 ms, 10/6/3°: *"That is way to fast. make a 1 second and use easing"*
- Take B (1 s, the angles × 0.375): *"The movement look right but its too fast"*
- 2 s: *"Thats a lot better."*
- Repeated every 20 s (start to start), added after the verdict above: committed on Carl's word (*"Commit and push"*) — ⚠ **no verdict stated**; filmed: movement only in 5.1–6.9 s and 25.1–27.0 s of 30 s.
- The repeat, given after it was pushed: *"The looped wobble is good."*
- The growth (from the bin's blow, R-038 — unjudged until now): *"Growth of the logo is good."*

**Findings:**

- ✔ Recorded at the level given — *"a lot better"*, not "approved", not a master (D-035).
- ⚠ **Not filmed at its real speed** — the shape and the pivots were filmed stretched to 6 s; the 2 s take differs from the filmed one only in its length.
- ⚠ Equal swing times are the Builder's reading; a real rocking block quickens as it settles.
- ⛔ **OPEN:** the scroll mechanism (D-088).

---

## R-039 — The Desk Mark Lit On Card One's Strike, Both Ways Into §2 (D-088): "Look Good"

**Date:** 2026-10-10
**Reviewer:** Human Founder
**Subject:** plain `/about` — the journey's loop stopped (the mark still and upright; `?markloop=1` runs it); the mark always on the desk, UNLIT (10% of its studio light) until CA strikes, then its light and its two cast shadows brought up over 1.015 s (`/start`'s pace), smootherstep; the contact shadow throughout. One clock — the §2 sequence's — for Roles and the scroll. `components/about/about-card-canvas.tsx` (`DESK_MARK_LIGHT_MS`, `DESK_MARK_UNLIT`).

**Carl's verdicts, verbatim:**
- The fade on Roles (a superseded take): *"Timing is good, as is mirroring the /start time."*
- The light brought up on the strike, both arrivals: *"Look good."*

**Findings:**

- ✔ Recorded at the level given — *"Look good"*, not "approved", not a master (D-035). The 1.015 s timing carries his *"Timing is good"* from the fade take.
- ⚠ **Takes, not judged one by one:** the unlit level (10%); the cast shadows coming with the light while the contact shadow stays.
- ⚠ **Not filmed:** frame-by-frame order at the strike (samples ~300 ms apart); trackpad flings; Carl's Chrome.
- ⛔ **OPEN:** the scroll mechanism and the wobble (D-088, session 2's last entries).

---

## R-038 — The Desk Mark's Journey On Plain `/about`: The Rebound, The Two Flips, The Crossing, Into §3 (D-088): "A Lot Better"

**Date:** 2026-10-08 (session 2)
**Reviewer:** Human Founder
**Subject:** plain `/about` — the mark 85 mm left on the desk; the simulated fall onto the bin; the rebound from the slap (licence) to an oblique top of rise; a second forward flip losing momentum, drifting left, ending halfway to face-on; the bounce and flips LEGATO on one progress; the gold → blue crossing with the light rising with the blue; the growth from the bin's blow; the drop into §3's player placeholder, wiped at its border. Time-driven loop, master speed 0.9. Commits `07ad729`, `d9060bf`, `bad959b`.

**Carl's verdicts, verbatim:**
- §3's placeholder: *"ok, good."*
- The rebound at half speed: *"Much better. It looks to me as if its slightly leaning forward. Perfect."*
- The drift through the second flip: *"yes, much better. its just to the right of the blue logo with less momentum carrying it left Perfect."*
- The crossing in the room: *"the transition look great, even in slo mo."*
- The light rising with the blue: *"thats a better contrast against the orange background"*
- Legato: *"Thats a lot better."*
- ⛔ **Closing the session, on the whole:** *"Good work today. The logo surpassed my original vision -exceptional work!"*

**Findings:**

- ✔ Recorded at the level given — strong positives on each layer as it was added; none stated as "approved", none a master (D-035). The fall to the rim (stage 2) keeps its *"Outstanding"* (D-088, 8 October).
- ⚠ **Not judged by Carl:** the growth (built, shown in frames; he moved straight to the speed); the drop and the wipe at the border; the ~140 ms the growing mark passes into the rim; the blue reading dark over §3's black.
- ⚠ **Not measured:** the cost of the canvas now ~2× the pixels, rendered every frame.
- ⛔ **OPEN:** the scroll mechanism (D-088, session 2's last entry) — Carl's answer next session.

---

## R-037 — The Desk Mark In The Room: Placed, Lit By The Bench Studio, Shadowed On The Desk (D-088): "Excellent… In The World"

**Date:** 2026-10-08
**Reviewer:** Human Founder
**Subject:** `/about?mark=1` (plain `/about` unchanged) — the desk mark as a STILL take on the right desk. Placement (take 3): facing the camera, centred across the desk's depth, its face 65 mm from the desk's end so a tip onto its face carries it off (gravity); 227.9 mm tall (`DESK_MARK`, `about-room.ts`; desk, clamp and LED strip measured from the plate). Light: the bench's judging studio on the mark's material only, following its position; the room's take light kept off it ("Studio only"). Shadows on an invisible catcher cut to the desk top: the studio top softbox's, the LED strip's (softer, 0.6), and a contact shadow baked from the mark's geometry (0.5). Code: `about-card-canvas.tsx` (`DeskMark`, `MarkShadowLight`, `buildContactShadow`), `logo-mark-material.ts` (`LOGO_JUDGING_STUDIO`, `buildLogoStudioEnv`, `environmentOnly`). Frames: `live-work/screenshots/desk-mark-room-8-october/`, `…/desk-mark-light-8-october/`.

**Carl's verdicts, verbatim:**
- Placement, take 2: *"Yrs, thats right."* Take 3 (65 mm, for the fall): *"That looks in the right position."*
- The first shadow, against none in the same light: *"yes, i can see it, very subtle."*
- With the strip's and the contact shadows: *"Yes, excellent. Now the logo really looks that its in the world."*

**Findings:**

- ✔ **"Excellent… in the world"** — the level given: a strong positive verdict on the lit, shadowed take on the desk. Not stated as "approved"; not a master (D-035); no fader value individually approved.
- ⚠ **OPEN:** the gold reads pale (near ivory on the face) — not raised by Carl; the room's reflection map contributes nothing measurable to the mark although applied (cause not established; may bear on RIM-DARK); the contact shadow is the mark AT REST and must fade as it tips; the fall, the bin, the crossing's place in the fall and route 1's structure are the next chunks.

---

## R-036 — The Desk Mark's Gold → Platinum-Blue Crossing On The Bench (D-088): APPROVED

**Date:** 2026-10-08
**Reviewer:** Human Founder
**Subject:** `/proto/logo?mode=crossing` — the gold → platinum-blue crossing, built on the bench and tied to the object without a plan or the Architect (Carl: *"Nothing new is being built here"*). An OUTSIDE-IN SPHERE about `logoMarkCentre()` in the mark's own space (height, width and depth); one mesh, one material, the colour chosen per pixel with a hard edge; one number 0 → 1 over the measured window (furthest surface 547.4 px → nearest 19.5 px); looping by default. Pace: `/start`'s logo wipe in mark units (0.9292 heights/s, 1.015 s), then HALVED on Carl's word — **0.4646 heights/s, ~2.03 s**. Code: `logo-mark-material.ts` (`createLogoCrossing`, `LOGO_CROSSING_PACE_OF_START`), `logo-mark-geometry.ts` (`logoMarkReach`), `logo-bench.tsx`. Frames: `live-work/screenshots/logo-crossing-8-october/`. Models filmed: `live-work/start-logo-transition-observed-8-october.md`, `…/start-begin-transition-observed-8-october.md`.

**Carl's verdicts, verbatim:**
- At `/start`'s pace: *"That look great. can you halve the speed of the wipe?"*
- At half pace: *"That looks great. Approved."*

**Findings:**

- ✔ **APPROVED** — the crossing's mechanism, form and half-`/start` pace, on the bench. Not a master (D-035); no dial is individually approved.
- ⚠ **OPEN:** the bench drives the number by TIME; in the scene the reader's SCROLL drives it, and how the ~2 s maps onto the scroll is not settled. The crossing has not been judged against the room's orange (R-035's reason for the blue). The last gold sits against the 2's diagonal's upper-left chamfer, not mid-stroke (the measured centre is 22 px from that edge), and was approved as built. The two metals must keep the same roughness, or the per-pixel swap stops being exact (`createLogoCrossing`).

---

## R-035 — The Desk Mark's Two Metals On The Clay Shape (D-088 Pass 2): The Blue "Great", The Gold A Positive Read

**Date:** 2026-10-07
**Reviewer:** Human Founder
**Subject:** `/proto/logo` `?mode=gold` and `?mode=blue` — pass 2, the material, on pass 1's approved shape, in chunk 1's Lightformer studio restored as a fixed judging fixture (the real light is pass 3). Gold: chunk 1's physical gold F0 (linear 1.00, 0.77, 0.34), roughness 0.25. Blue, take 3: the blue metal swatch's base colour #3F6DB8 as F0 (linear 0.049, 0.153, 0.479), roughness 0.25. Frames: `live-work/screenshots/logo-pass1-7-october/gold/`.

**Carl's verdicts, verbatim:**
- Gold: *"Face on the gold looks the same shade with the applied light. At an oblique angle thats when you can really see the different shades. With a well place light and movement from the object this would work very well."*
- Blue take 1 (platinum tinted halfway to the blue target's hue): *"Its coming off as grey."* Take 2 (the site's blue mark sampled, #8DA7CB): *"Its more silver grey… See the contrast between the two."* Take 3 (the swatch): *"Yes, thats great. When the transition is made that will really contrast against the orange in our scene."*

**Findings:**

- ✔ **THE BLUE: "great"** — the level given. **THE GOLD: a positive read, not an approval.** Neither is a master (D-035); no dial is individually approved.
- ✔ **The contrast is the point:** the blue against the scene's orange. Brief for the crossing and for pass 3.
- ⚠ **OPEN:** straight on, both faces are a single shade in the judging studio (a flat mirror) — Carl: a well-placed light and the motion will carry it (pass 3); the blue is a DARK metal (luminance ≈ 0.13) and leans harder on the light than the gold; the gold went near-black under the room's reflection in chunk 1 (RIM-DARK's cause) — pass 3's problem; the crossing (outside-in circular wipe, ending at `logoMarkCentre()`) is not built.

---

## R-034 — The Desk Mark's Shape In Clay (D-088 Pass 1, Take 2): PASSES

**Date:** 2026-10-07
**Reviewer:** Human Founder
**Subject:** `/proto/logo` in clay — pass 1 of three (mesh → material → lights; Carl, 7 October). ONE cross-section all round, from Carl's flat-face shape target (`live-work/references/desk-mark-refs-7-october/flat-face-shape-target.png`): wall → straight chamfer (~15 source px, 45°) → 4 px round → flat face, 41 source px deep; same trace as chunk 1. Judged from the take-2 frames (`live-work/screenshots/logo-pass1-7-october/take2/`) against the baseline (`…/baseline/`, the 3 October mesh). Plan: `live-work/desk-mark-pass1-mesh-plan-7-october.md`, § Version 3.

**Carl's verdict, verbatim:** asked *"Does it pass?"* — *"Yes. I mentioned the comparison with gold bars, the shape is similar with traditional gold bars. Whereas the 2d image is a moment caught in time with the light reflected of it, the gold material plus webgl light abd the thing is gonna fall off the desk, i think it could work very well."*

**Findings:**

- ✔ **PASSES — the level given.** The shape gate for pass 1; material (pass 2) may build on it. Not a master (D-035): no dial value (bevel 15 px, 45°, round 4 px, depth 41 px) is individually approved.
- ✔ **The step 1 gate, Carl's eye (A6):** the bench showed the 3 October tear — *"clearly a problem… on a gold bar that will show as a defect"* — and ruled out the pyramid ends (*"a departure from the original logo"*).
- ✔ **Measured, not judged:** junction window 46.7° → 6.3° (computed normals), 45.4° → 5.6° (triangles); IoU 0.9961 vs control 0.9803; edges ≤ 1 px; open edges 0; interior grid flat (z-step 0); 1 canvas, no console errors.
- ⚠ **OPEN:** the stem's corners — the trace rounds them 22–26 px, so the chamfer wraps them as a cone where the target shows crisp mitres (raised, not ruled on); the face's 1.27° at the round's last ring; A13 (flat foot or as built); the base double line (its own take, Carl); the removed stem crown (*"showing the flat back"*, 3 October) — **a question for pass 2's material and light**; the Architect's checkpoint review of v3 (built on Carl's *"have a go"*, reviewed after).

---

## R-033 — The Desk Mark On Its Bench (D-088 Chunk 1): "Close And A Good Base To Start From"

**Date:** 2026-10-03 (session 2)
**Reviewer:** Human Founder
**Subject:** `/proto/logo` — the C2B mark as a three.js object, alone: traced from the gold target's cut-out (`c2b-logo-gold-relit-alpha-1671.png`), curved front on a flat back, the b's crowned and bevelled stem, distance-field mitred terminals, physical gold (F0 linear 1.00, 0.77, 0.34) under a Lightformer studio. Judged from the checkpoint frames (`live-work/screenshots/logo-bench-3-october/`), not live. Request: `live-work/checkpoint-desk-mark-chunk1-3-october.md`.

**Carl's verdict, verbatim:** *"Its close and a good base to start from."* Earlier, on the first render: *"part of thr b is the wrong way round. showing the flat back"* — fixed by crowning the stem's face.

**Findings:**

- ✔ **A GOOD BASE, CLOSE** — the level given. Not approved; not a master (D-035). No value (dome height 0.85, crown 0.25, roughness 0.25, the studio) is individually approved.
- ✔ **Measured, not judged:** outline IoU 0.9969 vs a 1-px control of 0.9803, edges ≤ 1.00 px; watertight; no spine seam (crest 4.6°).
- ⚠ **OPEN:** the Architect's checkpoint review; A13 — flat foot or as built (Carl's); the known teeth at the stem junction and ticks on the 2's diagonal; the terminals' shape; **the gold renders near-black under the room's reflection** (chunk 2).

---

## R-032 — The Image Scroll On `/about` (D-092): APPROVED

**Date:** 2026-10-03 (session 2)
**Reviewer:** Human Founder
**Subject:** Plain `/about` §1 → §2: ONE `RoomStage` (`about-card-canvas.tsx`), sticky behind both sections; the room faded at 0.2 under §1; §2's room through a top-down SMOOTHERSTEP wipe, 0.3 of the window (`ROOM_WIPE_GRADIENT`); one wipe number (`roomWipe`, `about-neon.ts`) read by the mask and the §2 sequence's trigger (`roomWipeClearsCA`); §2's `border-t` removed; the stage's negative margin moved to §1 so the stage leaves with §2 (the §3 overlap fix). Records D-092's 3 October entries at the end of the D-095 tail.

**Carl's verdicts, verbatim:** first build — *"It looks good apart from the thin black line."* Session 2, after the line was removed, the edge smoothed and the §3 overlap fixed — *"i am happy with the scroll image - approved."*

**Findings:**

- ✔ **APPROVED BY CARL'S EYE** — the faded room in §1, the wipe into §2, the S-curve edge and the §3 fix, as one whole. A take, not a master (D-035); `S1_ROOM_OPACITY` 0.2 and the 0.3 gradient are not individually approved.
- ⚠ **CARRIED, NOT CHANGED BY THE VERDICT:** §1's last lines pass over the opaque room as they leave (no comment from Carl); scrolling back up fades the room again; reduced motion untouched; phones not looked at (accessibility and mobile are deferred to mastering, D-094); `RoomPlate` has no `priority` though it is on screen at first paint (`room-plate.tsx`, outside the chunk's scope).
- ⚠ **WHAT IT NOW BEARS ON:** the stage leaving with §2 is why a desk mark inside the cards' canvas cannot reach §3 — the structural question D-088's build must answer.

---

## R-031 — The Drawing Board's First Light On `/about`: "Both Goals Have Been Surpassed. It Looks Great" — Committed And Pushed

**Date:** 2026-10-03
**Reviewer:** Human Founder
**Subject:** Plain `/about` §2 with every earlier light OFF (ambient, the static key/fill, the moving light) and ONE new light — the TAKE LIGHT (`TakeLight`, `about-card-canvas.tsx`): directional, not moving, shadows on, 50° off the faces' normal from upper-left, the lit wall's hue `#ff6528` at 0.25 into white, intensity 2. The BEVEL takes the face's highlight limiter at its own ceiling 0.03 (`about-card-mesh.tsx`); the rim stays uncapped. The text runs and the §2 sequence plays as on 27 September. `?baseline=0` is the page before. Records the 3 October entries at the end of the D-095 tail.

**Carl's brief, verbatim:** *"1. The glass face should clearly read as frosted glass and its geometry visible. 2. The text should be legible and be noticeably 3d, extruded."* Colour: *"a subtle colour could be used to light the face of the cards… Caused by the world."* Glints: *"Highlights or glints on the rim are good. Its when they are on the face that it looks bad."*

**Carl's verdict, verbatim:** *"I think weve improved that and both goals have been surpassed. It looks great! Commit and push."*

**Findings:**

- ✔ **BOTH GOALS MET, BY CARL'S EYE** — frosted faces with visible geometry; legible, visibly extruded text — under the running sequence.
- ⚠ **THE VERDICT IS ON THE LOOK AS A WHOLE, a take, not a master (D-035).** The individual values (angle, intensity, tint mix, bevel ceiling 0.03, shadow map) are not individually approved.
- ⚠ **WHAT IT REPLACES:** the 25 September static-lights-off experiment (closed), the Q+A-style grazing rig (built the same day, its rim-corner glint the reason it went), and the moving light's orbit (*"not in the orbit or way it was moving"*). The moving light's code is OFF, not deleted (`?lightmove=1`).
- ⚠ **CARRIED, NOT CHANGED:** the flash cap at 3 (at the cap) ~87–88 s; continuous rendering while the text loops.
- ✔ **CARL, LATER THE SAME DAY, on the scene:** *"The top card looks really good against the wood when unlit and the bottom card you can clearly see the orange hue especially highlighted with the skirting that runs through the back of the card. Well done."* — CS UNLIT against the wood; CD's orange read through the glass, the skirting visible behind it. Recorded at the level given.

---

## R-030 — The Extruded Take As Plain `/about`, Rims Off: GREAT — Committed And Pushed

**Date:** 2026-09-24 (session 2)
**Reviewer:** Human Founder
**Subject:** Plain `/about` promoted to the take R-029 reviewed behind `?extrude=1`: CA's extruded text in "pages", **every rim off** (the neon not mounted), one white static spot at 0.5. **`?extrude=0` is the previous page.** Commit `83810e9`. Records **D-094** (its session-2 amendments).

**Carl's verdicts, verbatim:**
- On the result of the day's pivot: *"What we arrived at was far better than i had envisaged."*
- On the rims: *"The rim lights should be turned off so we can see the card in isolation. CA light intensity was modified, it stays static for now."*
- On plain `/about` as built: *"Thats great. we can commit and push this."*

**Findings:**

- ✔ **THE PROMOTION PASSES.** Plain `/about` IS the take. It was measured identical to `?extrude=1` outside CA's wipe, and `?extrude=0` measured **0 px** against the pre-neon baseline on all four arms.
- ⚠ **Rims off is for ISOLATION, not a ruling against the neon.** Turning the rim back on and choosing the light's colour is step 2 of Carl's order.
- ⚠ **The light stays static "for now".** Its movement comes in steps 3 and 4.
- ⛔ **NOT COVERED — still takes:** every look value R-029 lists (the hotspot, depth, colour, roughness, size, breaks, the clear).
- ⚠ **Since superseded as the working state, the same session:** plain `/about` now shows ONE card at a time, **CB** (D-094). CA is `?extrude=ca`. **CB's text has no verdict yet.**

---

## R-029 — CA's Card Text, "Pages" At The Start Page's Pace: GREAT — On The Timing Model Only

**Date:** 2026-09-24
**Reviewer:** Human Founder
**Subject:** CA's copy as **extruded Geist** behind `?extrude=1` — the "dry" take: every rim off, one white spot centred, static, downward. The copy writes and erases left to right in **"pages"**: each pass clears to an empty card and restarts top left, at **`/start`'s pace, 171.4 wpm**. Records **D-094** (its 24 September amendments).

**Carl's verdict, verbatim:** *"This is a lot better because it also solves the problem if someone reads slower. The text is on the page for longer giving them time to read it. The whole sequence is not long enough for someone to lose focus and it is clearly 'pages' with a start and end. This i great."*

**Findings:**

- ✔ **THE PACE AND THE PAGE MODEL PASS.** ⚠ **The slower pace IS the slow reader's grace** (7.7 s minimum per line), so one number answers both waiting and falling behind. **The page boundary gives the copy a beginning and an end.** The earlier continuous wrap was "chaotic".
- ⛔ **NOT COVERED — still takes:**
  - the light: intensity 0.5 (from 3), angle 45°, and ⚠ a specular hotspot that washes words at CA's top-centre. The ANGLE is the lever: 60° measured 2.59 vs 2.80.
  - the 3 mm depth
  - the letters' colour and roughness
  - the 52 mm size
  - greedy breaks and the left-set last line
  - the 10.2 s clear
- ⛔ **The route changed twice in the day and the record says so:** etched glass (built, tuned, superseded) → extrusion. The etched take remains gated behind `?etch=1`.
- ⚠ **Not yet seen by Carl:** CB/CD/CS with extruded text (CA first, one card), the light's drift, colour, neon.

---

## R-028 — All Four Cards In Glass, And The PLACEMENT Is APPROVED. The Rails Come Out

**Date:** 2026-09-22
**Reviewer:** Human Founder
**Subject:** The four `/about` §2 role cards in glass, judged together on a running build. ⛔ **TWO separate verdicts: the card PLACEMENT, and the wall pair's material.** Records **D-089** (the values), **D-092** (what Carl raised next).

**Carl's verdict, verbatim:** *"Looking at the position and spacing. The cards are essentially 2+2. I think they dont need moving. The original calculations were done accurately. Form and balance look good. So you can remove the guide floor lines."*

**Findings:**

- ✔✔ **PLACEMENT APPROVED — NO CARD MOVED.** ⚠⚠ **This is the judgement the floor rails existed for**, and it could not be made until all four cards were glass: Carl, 22 September — *"When all 4 cards are glass i will be able to see them in the scene... The floor cards could be moved and if they are it will be along those lines."* ⛔ **The answer was that they did not need to move.**
- ⛔ **THE RAILS ARE REMOVED, THEIR JOB DONE — not as tidying.** ⚠ The angles survive in `app/proto/wall/page.tsx` (`INITIAL_RAIL`); **restoring them is a revert, not a re-measurement.** ⛔ **This also CLOSES the GUIDES-WITHOUT-FLAG defect by removal** — the rails were unconditional by design and had no flag to be missing from.
- ✔ **THE FOUR-CARD MATERIAL PASSES ON FAMILY RESEMBLANCE, NOT MATCHED NUMBERS.** ⛔⛔ **CARL'S ACCEPTANCE TEST, AND IT IS THE FINDING OF THE DAY:** *"they feel all part of the same family except CA."* ⚠⚠ **Four cards against four different backgrounds need FOUR VALUES to read as ONE material** — CA 0.95, CB 0.86, CD 0.95, CS 0.86. **§14a: a recurring theme WITH VARIATIONS.**
- ⚠ **A FIXED MATERIAL OVER A VARYING BACKGROUND READS AS A VARYING MATERIAL** — dark, featureless backgrounds go milky at 0.86; bright detailed ones do not. ⛔ **CS is the exception, not the standard.**
- ⚠⚠ **NOT APPROVED, AND CARL SAID SO HIMSELF:** *"it is possible that these values might need tweaking once neon and light are added. We wont know until then."* ⛔ **Only D-089's CS values carry an approval; CA, CB and CD are PROVISIONAL.**
- ⛔ **THE RIM IS PARKED, NOT FIXED.** RIM-DARK stays open — Carl: *"its a minor issue and we will return to it."*

---

## R-028 — The Four-Card Neon IN THE ROOM: APPROVED AS A STARTING POINT. The Palette Works; The Values Still Need Working On

**Date:** 2026-09-23
**Reviewer:** Human Founder
**Subject:** All four `/about` §2 cards with their neon lit, read on a running dev build (Carl's own screenshot of `?neon=full`). Wall pair (CA, CB): glow `#1b4789`, tube `#1b2f8a`, peak 6. Floor pair (CD, CS): the logo's teal "b", `#18a6bd`, peak 1.8. Bloom 0.25 / radius 0.7 / 5 levels. Records **D-093** (with D-090, D-091, D-092).

**Carl's verdict, verbatim:** *"i think these look good. Its a great colour combination and the neon palette works very well in the room. its a good starting point, We can commit and push these though they still need working on. We will get to that"* — and earlier, on the wall pair alone: *"i think the colour is good."*

**Findings:**

- ✔ **THE PALETTE IS APPROVED: navy "c" on the wall, teal "b" on the floor — the two halves of one mark.** ⛔ **This settles D-090's open glow-colour question for BOTH pairs**, which D-093 had recorded as candidates.
- ⚠⚠ **"A GOOD STARTING POINT" AND "STILL NEED WORKING ON" ARE PART OF THE VERDICT.** ⛔ **Approved as a take, not a master (D-035).** Peaks, bloom, the ignition patterns and the sequence order are **NOT individually approved** — Carl judged the lit scene, not each dial.
- ⚠ **THE IGNITION WAS NOT THE SUBJECT.** The screenshot is the held, lit state. **Checkpoint 2 (the stutter, the order, the timing) has not been given a verdict.**
- ⚠ **Also carried, not judged:** the in-view trigger (built and verified by instrument; Carl ruled *once per visit*), the approximation in the bloom composite over bright floorboards, and the intermittent 1920 frame drops recorded in D-093.
- ⛔ **The glass is untouched** — D-089's values held throughout, and the identity gate measured it (0 px with the neon off).

---

## R-027 — CS's Glass IN THE ROOM: APPROVED. The Face Gets A Body And The Shape Returns

**Date:** 2026-09-22
**Reviewer:** Human Founder
**Subject:** CS's face material on `/about`, read on a running dev build at roughness **0.35** and face transmission **0.86**. Records **D-089**. ⛔ **CS ONLY — CD, CA and CB are still diagnostic grey.**

**Carl's verdict, verbatim:** *"Thats a lot better. Card shape is clearly defined."* and, after sweeping the fader to both ends, *"0.86 was a good estimation. Material is approved. Its a good basis to start from."*

**Findings:**

- ✔ **APPROVED IN THE ROOM.** ⚠⚠ **This is the judgement R-026 deferred** — Carl's own qualification there was *"Not until i see the card in the scene can it be truly judged."* ⛔ **That condition is now met.**
- ⛔⛔ **THE FAULT WAS NO BODY, NOT TOO LITTLE FROST.** At `transmission: 1.0` the face had **no diffuse contribution at all**, so the card took its brightness entirely from the background and **its left edge vanished against the dark desk.** ⚠ **Carl's opening instinct was to increase the frost; it would not have worked** — a blurred dark background is still dark. **Full reasoning: D-089.**
- ⛔ **CARL SWEPT BOTH ENDS BEFORE RULING** — *"all the way left, 0.5 gives a milky effect. All the way right, 1.0 and its practically clear."* ⚠ **The verdict is bounded, not a single sample.**
- ⛔ **THE RIM IS UNTOUCHED AND STAYS CLEAR AT 1.0.** Carl: *"The rim is clear glass, as per the neon light it will become. The bevel and face are frosted."* ⚠ **It is not on the fader — it IS the neon, and a body tone on a light source is wrong.**
- ⚠ **ROUGHNESS 0.35 RODE ALONG AND WAS NOT THE SUBJECT.** It was approved on the bench (R-026) and has never been swept in the room. ⛔ **The prediction that the room's transmission target might frost it differently did NOT materialise — judged by eye, not measured.**
- ⚠⚠ **"A GOOD BASIS TO START FROM" IS PART OF THE VERDICT, NOT A PLEASANTRY.** ⛔ **The neon, the lighting and the baked text build ON this; the card is not finished.** **Approved as a basis is not approved as a master (D-035).**

---

## R-026 — Chunk 2a's Frosted Glass On The Bench: APPROVED. And The Background Is What Makes Two Glasses Legible

**Date:** 2026-09-18
**Reviewer:** Human Founder
**Subject:** CS's face material on `/proto/card`, read on a running build at roughness **0.35**. Records **D-083**; the room build that followed is **D-084** and is NOT covered by this entry.

**Carl's verdict, verbatim:** *"The floorboards look good behind and there is noticable blurring on the chairs castors... it looks good, we sre in the ballpark with the roughness figure and any modifications of this figure would be slight."*

**Findings:**

- ⛔ **APPROVED ON THE BENCH AT ~0.35**, with the qualification stated in the same breath: *"Not until i see the card in the scene can it be truly judged."* ⚠ **The bench settles the frost's CHARACTER; its final value is set in the room.**
- ⛔⛔ **CARL NAMED THE MECHANISM THE BUILDER HAD NOT SEEN:** *"You can tell the different types of glass not just by the way light interacts with it but how the background does too."* ⚠⚠ **The frosted face BLURS what is behind it; the clear rim keeps it SHARP. Same room, two treatments of it — and that contrast is what reads as two materials.** ⛔ **So the backplate is not scenery. It is the instrument that makes material difference legible**, and against a flat or empty background roughness 0.10 and 0.35 are nearly the same picture.
- ⛔ **THE RIM IS CLEAR GLASS AT ~0.10, CARL'S FIGURE BY EYE:** *"The rim, which will be a neon light should be clear glass."* ⚠ **The reason is its JOB, not its look** — a frosted rim would scatter its own emission.
- ⚠ **THE BEVEL IS FROSTED *FOR NOW*, NOT SETTLED.** Carl: *"It could be frosted glass or it could be metallic - it cannot stay as a grey placeholder... For the moment, lets go with frosted glass."* ⛔ **Metallic is live and is to be tested in chunk 3** — his distinction: *"the light would behave differently and look differently WHEN THE NEON LIGHT IS OFF."* ⚠⚠ **A Builder comment recorded frosted as a decision and OVERSTATED it; corrected in place.**
- ⚠ **Carl supplied neon references** showing a rim that spills visibly onto floor and wall with bloom. ⛔ **That is emission + a real light + a bloom pass — chunk 3.** An env map makes the rim **legible**, not **correct**.

**Flags:**

- ⚠ **Medium — the roughness fader looked dead under the wrong instrument.** A sweep measured by MEAN read 99.6 → 100.5. ⛔ **Blurring PRESERVES the mean;** the effect lives in variance (sd 12.21 → 2.95 across 0 → 0.8). **Recorded so the fader is not "fixed".**
- ⚠ **Medium — `ENV_PLATE_INTENSITY = 6.0` is a compensation, not a physical value.** It multiplies a dim room by six to manufacture highlights it does not contain. ⛔ **Revisit downward once the neon exists.**
- ⚠ **Carl's own caveat stands as the gating flag:** the room is where this is truly judged, and **the dark region under the desk will show less material character than the bench does.**

**Recommendations:** Set the final roughness in the room, not here. Test the metallic bevel in chunk 3 with the neon both on and off. Routed to Carl.

**Status:** ⛔ **APPROVED on the bench** — the value is ~0.35 and *"any modifications would be slight"*. ⚠ **The room build (D-084) is NOT approved and is not covered here.**

---

## R-025 — `/about` §2 Lighting: Four Rigs Rejected On Sight, And The Fault Was The Light TYPE

**Date:** 2026-09-17 (logged 2026-09-18 — see **D-074** for why late logging is itself a recorded fault)
**Reviewer:** Human Founder
**Subject:** The §2 card lighting in `components/about/about-card-canvas.tsx`, read on a running build. Records **D-082**. Commit `ac4a4c8`.

**Carl's verdict, verbatim:** *"its acting like a street light."* — of the spotlight rigs. And on the accepted result: *"It is a trade off, but all 4 are now visible. Its something to work with."*

**Findings:**

- ⛔⛔ **FOUR SPOTLIGHT RIGS WERE BUILT AND REJECTED ON SIGHT.** ⚠⚠ **EVERY ONE MEASURED CLEAN AND EVERY ONE LOOKED WORSE** — raking spots, cones, a rim axis, a 25° swing. ⛔ **Rule 9 in its purest form: the instruments agreed with the Builder four times running and the screen did not.**
- ⚠⚠ **THE FAULT WAS THE LIGHT TYPE, NOT ITS PLACEMENT — and that is why four placement iterations could not find it.** A `spotLight` has a position, so it pools and falls off; a `directionalLight` has neither, **so the only thing varying across a face is the face.** ⛔ **Carl's four words located in one move what four measured rounds had not.**
- ⚠ **THE OBVIOUS MIRROR IS WRONG.** `[-1,2,2]` lights the RIGHT pair more (0.632) than the left (0.380), **because the cards are yawed to their desks, not mirrored about the room.** `[5,2,-2]` grazes CD/CA at 0.179/0.104 and gives exactly **0.000** to CS/CB.
- ⚠⚠ **THE KEY HAD TO COME DOWN, AND THAT WAS NOT PART OF THE REQUEST.** At 1.2 it supplied **88% of CD's light AT NEAR HEAD-ON** — so 88% of what the left pair received carried no gradient at all. **Key 0.5 / fill 2.6 inverts that to 56% fill at a grazing angle.**
- ⛔ **CARL ACCEPTED A MEASURED REGRESSION KNOWINGLY:** the right pair drops **~0.03 from values he had already approved**, in exchange for all four cards being readable.

**Flags:**

- ⚠ **Medium — the accepted imbalance will read as a defect to a later session.** ⛔ **It is the outcome of four rejected rigs and Carl's explicit trade, not an oversight. Do not "fix" it.** Recorded here and in D-082 because the code alone does not say so.

**Recommendations:** None outstanding. ⚠ **The lighting the cards will FINALLY live under still does not exist** — the rim is not a light source until chunk 3.

**Status:** ⛔ **APPROVED** — accepted by eye, with the trade stated.

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

*Last updated: 2026-10-15 — **R-062 added**: the answer cards' glass tube, filled studio and held filament — "approved".*

*Previously: 2026-10-15 — **R-061 added**: the answer cards' glass rim and filled studio, behind doors — "a helluva lot better".*

*Previously: 2026-10-15 — **R-060 added**: the gold with the studio's reflection, bench and `/about` §4 — "Approved".*

*Previously: 2026-10-15 — **R-059 added**: the teal with the studio's reflection on the home page — "Approved".*

*Previously: 2026-10-15 — **R-058 added**: the teal with the studio's reflection, turned and darkened, on the bench — "a lot better".*

*Previously: 2026-10-15 — **R-057 added**: R-050 – R-052 and R-054 – R-056 raised to approved — "Yes, approved".*

*Previously: 2026-10-14 — **R-056 added**: the platinum blue `Next step` on `/start`, rolling at every question — "looks good".*

*Previously: 2026-10-14 — **R-055 added**: the `Next step` button redone, pass 3 (the light) — "It looks good. Put it on the page."*

*Previously: 2026-10-14 — **R-054 added**: the `Next step` button redone, pass 2 (platinum blue, the words ice blue) — "It looks good".*

*Previously: 2026-10-14 — **R-053 added**: the `Next step` button redone, pass 1 (the mesh in clay) — "Approved".*

*Previously: 2026-10-14 — **R-052 added**: §2's return rules (step 2) and card 1's prompt on `/about` — "Functions and mechanisms are good". ⚠ This footer had stood at R-037 while R-038 – R-051 were filed; corrected here.*

*Previously: 2026-10-08 — **R-037 added**: the desk mark in the room, lit by the bench studio and shadowed on the desk — "excellent… in the world".*

*Previously: 2026-10-08 — **R-036 added**: the desk mark's gold → platinum-blue crossing on the bench, at half `/start`'s pace — APPROVED.*

*Previously: 2026-10-07 — **R-035 added**: the desk mark's two metals (pass 2) — the blue "great", the gold a positive read.*

*Previously: 2026-10-07 — **R-034 added**: the desk mark's shape in clay (pass 1, take 2), PASSES.*

*Previously: 2026-10-03 (session 2, end) — **R-033 added**: the desk mark on its bench, "close and a good base to start from".*

*Previously: 2026-10-03 (session 2) — **R-032 added**: the image scroll (D-092) approved. ⚠ **This footer had stopped at R-028 while R-029–R-031 were filed** — the stale-footer fault the note at the end of this file records, again.*

*Previously: 2026-09-22 — **R-028 added**: all four cards in glass; ✔✔ **the PLACEMENT is
APPROVED and NO CARD MOVED** — *"the cards are essentially 2+2... the original calculations were
done accurately."* ⛔ **The floor rails are REMOVED, their job done**, which also closes
GUIDES-WITHOUT-FLAG by removal. ⛔⛔ **Carl's acceptance test for the material is FAMILY
RESEMBLANCE, NOT MATCHED NUMBERS** — *"they feel all part of the same family except CA"* — so the
four cards carry FOUR values (CA 0.95, CB 0.86, CD 0.95, CS 0.86). ⚠ **Only CS's are approved;
the rest are PROVISIONAL and Carl expects lighting to move them.***

*Previously: 2026-09-22 — **R-027 added**: CS's glass **APPROVED IN THE ROOM** at roughness 0.35
and face transmission **0.86**. ⛔⛔ **THE FAULT WAS NO BODY, NOT TOO LITTLE FROST** — at
`transmission: 1.0` the face had no diffuse contribution and the card's left edge vanished against
the dark desk. ⚠⚠ **Carl's opening instinct was MORE FROST and it would not have worked**; he had
already ruled out the heavy-diffusion reference himself — *"Too much for us."* ⚠ **This is the
judgement R-026 deferred** (*"Not until i see the card in the scene"*). ⛔ **The rim is untouched at
1.0 — it IS the neon.** ⚠ **CS only; CD, CA and CB remain grey.** **D-089.***

*Previously: 2026-09-18 — **R-026 added**: chunk 2a's frosted glass **APPROVED on the bench** at
roughness ~0.35, with Carl's own qualification recorded alongside it — *"Not until i see the card in
the scene can it be truly judged."* ⛔⛔ **HIS FINDING IS THE ENTRY'S REAL CONTENT:** *"You can tell
the different types of glass not just by the way light interacts with it but how the background does
too."* ⚠ **That makes the backplate an instrument, not scenery.** ⚠⚠ **NO ENTRY EXISTS FOR THE ROOM
BUILD (D-084) AND THAT IS CORRECT — Carl has not seen it; it is verified for FRAMING only.**
⛔ `REVIEW REQUIRED → APPROVED` is Carl's alone (D-036).*

*Previously: 2026-09-18 — **R-025 added**: the `/about` §2 lighting, approved by eye after **four
rigs that each measured clean and were each rejected on sight.** ⚠ **The fault was the light TYPE,
not its placement**, which is why four placement iterations could not find it. ⛔ **Carl accepted a
measured ~0.03 regression on the right pair knowingly — do not "fix" it.**
⚠⚠ **NO ENTRY EXISTS FOR CHUNK 2a AND THAT IS CORRECT: Carl has not seen it.** ⛔ **It is blocked
before its own checkpoint** — the transmissive face is not judgeable without an environment map
(**D-083**, blocker CHUNK-2a-ENVMAP). **`REVIEW REQUIRED → APPROVED` is Carl's alone (D-036); a
Builder cannot file an entry for work no one has looked at.***

*Previously: 2026-08-31 — **R-020 added**: the `/about` scaffolding, Carl confirming by eye that the mark does not move between pages — *"nailed it"*. Placement APPROVED (D-066); colour PROVISIONAL. Also records the sections resized to full viewport, the rule removed from section 1, and a left-edge defect introduced and fixed in the same pass.*

*⚠ **The previous footer read "2026-06-22 — R-018 added" while R-019 was already in the file.** Corrected here rather than only appended to: a footer naming the wrong latest entry is the kind of stale instrument `context-rules.md` warns about, and R-020 was very nearly filed as a duplicate R-019 because of it.*
