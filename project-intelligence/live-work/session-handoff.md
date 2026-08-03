# Session Handoff — 3 August 2026 (second session of the day)

**Written at the end of the card-in-grid session. For the session that picks up next.**

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical
(D-006). **Delete this file at the end of the session that reads it, once its replacement is
written** — `live-work-protocol.md` §3a.

**This file points at records; it does not restate them.**

---

## ⛔ THE STANDING DIRECTIVE — unchanged, and it was not broken today

**NEVER comment on how long Carl has been working.** Do not mention the time of day, suggest
stopping, wrapping up, resuming tomorrow, or ask whether to carry on. **Carl decides when a
session ends and will say so.**

---

## Where things stand

**Repo: `main`, head `3038a34`, pushed. ⚠ THIS SESSION'S WORK IS UNCOMMITTED —** six modified
files in `components/enquiry/`, plus untracked harnesses in `verify/`. **Carl has not asked for
a commit.** Lint at the recorded baseline (1 accepted error in `enquiry-opening.tsx`);
`npx tsc --noEmit` clean.

⚠ **`chunk-scope.json` HAS BEEN DELETED — the repo is FAIL-OPEN and every edit is allowed.**
It named `q5-logo-backdrop`, which closed, and §8 is explicit that a stale scope file is worse
than none: it enforces the previous chunk's boundaries and denies with the name of a chunk that
finished. **Deletion shows as a staged change (`D`) because the file was tracked.**

⚠ **THE FILAMENT CHUNK MUST BE GIVEN A NEW ONE, AND THAT IS PART OF AUTHORISING IT, NOT AN
EXTRA** (§8). **PM/A drafts, Carl approves; `unlocked` is Carl's alone.** Declare
`verify/_tmp-*.mjs` up front — the guard has already blocked a throwaway probe twice for want of
it.

⚠ **THE PAGE STILL DOES NOT ADVANCE PAST Q5.** The five CSS answer cards remain deleted, on
Carl's instruction, cost accepted. No selection, no Next step, no Q4–Q1, no contact field.

### What this session did

**The card moved from the left margin into grid slot 1, over the lockup, and now reads as
glass.** Full record: **`live-work/run-log-card-in-grid.md`** — the two mechanism faults, the
wrong instrument, and the file-by-file changes.

**Carl's verdict:** *"Yes, now we are on the same page."* ⚠ **That is agreement that the
mechanism is right. It is NOT approval of the frost level, the transmission value, or the rim.**

---

## ⚠ THE NEXT CHUNK — the filament

**Its design was settled in discussion at the end of this session and is written up in full:**

### → `live-work/references/filament-design-reference.md`

**Read that before planning the chunk.** It carries Carl's three reference photographs' findings,
his decision on the physics question, and the constraints that come with it. The headline:

> **"obey the physics, but the physics of heat rather than the physics of drawing"** — Carl

⚠ **AND ONE THING IN IT CHANGES AN EXISTING ASSUMPTION: the rim is the UNLIT FILAMENT.** Not
diagnostic grey waiting to be covered — a metal element that is present at rest and heats up.
The rim wants a metal material in this chunk.

---

## ⚠ Five observations Carl recorded for the NEXT session — NOT for implementation now

**He was explicit: *"I have a few observations I want you to make a note of and we will fix them
in the next session. Not for implementation now."*** They are listed in the order he gave them.

### 1. Lettering opacity outside the cards

**The lockup's lettering is too bright where it is not covered by a card.** The colour effect is
wanted **inside** the cards; outside it competes.

⚠ **AND HE RESOLVED THE MECHANISM WHEN ASKED:** *"outside the cards, in between them will look
like strong shapes."* **So it is NOT a global opacity reduction** — brightness is tied to card
position. Bright under the cards, quiet between them.

⚠ **A CONSTRAINT FOR WHOEVER BUILDS IT:** the gaps are 8px between columns and 8px between rows.
Whatever masks the lockup has to soften over a very short distance, or **the mask edge itself
becomes a visible shape** — trading one problem for another.

⚠ **AND IT GETS WORSE BEFORE IT GETS BETTER:** with one card, four of the five regions have
nothing over them at all. This is currently the worst case, and it improves at the clone.

### 2. Changes happen only inside the card

**The colour transition is confined to the card's own region.** Same argument as observation 1.

⚠ **WITH ONE EXCEPTION HE VOLUNTEERED:** *"if a region outside the cards contains a gradient
area and you think for consistency to invert the colours here too, that would be better."*
**Consistency wins over strict per-card confinement where the two conflict.**

### 3. A sixth beat — the text fades in after all five cards

**The cards arrive on the existing choreographed ladder — 1, 2, 3, 4, then 5 — and a SIXTH beat
is added: the answer text fades in once all five are in place.** The text arrives into a settled
grid rather than riding in with the card that carries it.

⚠ **THE LADDER IS ALREADY IN CODE** — `answer-card-geometry.ts` carries the rise duration, delay
and translate. The five-card stagger and the resulting end-of-ladder time are what the sixth
beat anchors to. **Read them from the file; do not retype them into a plan.**

⚠ **THE TEXT MECHANISM IS A SEPARATE PROBLEM.** Text on a transmissive face is parked, shared
with the contact field's own unsolved version. This observation gives it an **arrival moment**,
not a rendering method.

### 4. Next step becomes the SEVENTH beat

**Carl: *"so if the next step was the 6th beat, that must be pushed back."*** It moves with the
text fade — a consequence of observation 3, not an independent item.

⚠ **DERIVE IT, DO NOT TYPE IT.** `enquiry-opening.tsx` already carries a computed
end-of-choreography constant, and its own comment records that a hand-written value **went stale
twice**. Push Next step back by deriving from the text fade's end.

### 5. The mastering method — two faders, both from zero

**Carl's instruction, and it governs the final pass:**

> *"we build the new button. we add static light. then like pushing two faders up at once, we add
> light and frosted glass to get the effect we want. Rather than start with frosted glass at a
> half way point, we bring the 'volume' down same for the lights, and push the faders up."*

⚠ **THIS IS METHOD, NOT PREFERENCE, AND THE REASON IS ON THE RECORD.** Every frost value so far
has been a guess dressed as a starting point — and 0.28 was chosen while the transmission target
was clearing to white, so it was tuned against a broken subject.

⚠ **AND THE TWO ARE NOT INDEPENDENT.** Roughness drives both the transmission blur **and** the
specular response — the same number that softens what is behind the glass spreads the highlight
across it. Moving one alone gives a reading that changes when the other moves.

⚠ **THE RIG IS NOT READY FOR THIS.** `?cardrig=1` has roughness `[7]` and transmission `[8]`.
**Light has no fader** — env-map intensity and the two directional lights are constants. **Add a
light fader before the pass**, or Carl tunes one by ear and one by file edit.

---

## The remaining sequence, as Carl set it

1. **Filament on card 1** — the reference file above
2. **Clone** — roll the approved card out to all five
3. **Timings back in place** — the ladder, plus beats six and seven
4. **New button design** — Next step, in WebGL

⚠ **THE TIMINGS COME BACK AFTER THE CLONE, AND THAT IS DELIBERATE.** The ladder is a five-card
stagger; it cannot be judged with one card and no neighbours. Same argument that moved the card
before the filament.

⚠ **THE CANVAS WARM-UP LIVES INSIDE STEP 3.** Carl: *"we will put the timing back in place and
judge, possibly fine tune."* The card currently arrives ~1300ms late by design, because the
canvas defers past the phrase wipe. Fixing that properly means warming the canvas during the
opening choreography so its setup lands in dead time — **not** shortening the wait. The Builder
asked whether it needed its own slot; Carl folded it into step 3.

---

## Open questions — Carl's to answer, asked and not yet resolved

- **Does the amber sing or stay restrained?** Near-complementary against the backdrop's blue and
  cyan, so it will be the most saturated thing on the page. Changes the value the chunk starts
  from.
- **The filament and the region shift on one clock** — Carl confirmed they share timings and
  that changes happen inside the card. **Whether two simultaneous events read as too much is
  still an eye judgement**, not settled.

---

## ⚠ The session's lesson — the instrument, again

⚠ **`ai-system/working-with-the-builder.md` HAS THE SHARED CORRECTIONS RECORD.** New entries go
there. **It is shared, not a Builder fault list** — Carl: *"mistakes are not exclusive to AI."*

**This session's entry: a metric that could not distinguish the defect from the fix.** Edge
energy reported **"85% retained"** on a card containing **zero** dark pixels, and that false
claim was reported to Carl as a result. Gradient magnitude cannot tell a transmitted edge from a
smeared one.

⚠ **THIRD INSTANCE OF THE SAME CLASS IN THIS PROJECT** — after `q5-stutter.mjs` sharing a
constant with its fix, and chunk 2's stand-in being a fixture that could not express the effect
under test. **A measurement that cannot fail is not evidence.**

**Carl's eye caught it in one glance.** The honest instrument — a luminance histogram of the
*ground* rather than the ink — was unambiguous on its first run. Detail in
`run-log-card-in-grid.md`.

---

## How to look at it

```
http://localhost:3000/start                  walk to Q5 — card in slot 1, over the lockup
http://localhost:3000/start?cardrig=1        [1-6] geometry, [7-8] glass, [↑/↓] adjust, [0] print
http://localhost:3000/start?roughness=0.45   jump to a frost level
http://localhost:3000/start?lightrig=1       the contact field's orbiting light (localhost default ON)
```

⚠ **`?standin=1` AND `[s]` NO LONGER EXIST.** The calibration stand-in was deleted with the
merge. The earlier handoff listed them; they are gone.

---

## How to work with Carl — carried forward

- **⛔ Never comment on his working hours.**
- **He leads.** Design, chunking and decisions are his. D-036.
- **He asks for the principle before the decision.** Explain, then let him choose.
- ⚠ **HE ANSWERS THE QUESTION BEHIND THE QUESTION.** Asked whether the filament should fade or
  travel, he supplied a third reference photograph and let the physics settle it. Asked whether
  the lettering wanted global or per-region opacity, he described what it looks like between the
  cards. **Give him the trade-off; he will reframe it better than the options offered.**
- ⚠ **HIS EYE BEATS THE INSTRUMENTS. AGAIN.** Every report this session was real; the
  measurement that disagreed was wrong.
- ⚠ **HE PARKS THINGS DELIBERATELY AND EXPECTS THEM TO STAY PARKED.** The frost level is
  *"when the time is right"*, not forgotten.
- **No ASCII diagrams or box-drawing characters.**
- **Do not commit or push unless he explicitly asks.**

---

## ⚠ Environment notes — additions from this session

**The earlier handoff's environment notes all still hold.** New:

- ⚠ **`renderTransmissionPass` CLEARS ITS TARGET TO WHITE** when the canvas has `alpha: true`
  (`three.module.js:18019`, `setClearColor(0xffffff, 0.5)` whenever clear alpha < 1). **The
  page's CSS background is invisible to it.** Any transmissive material over a cut-out needs a
  real dark object in the scene or it samples white. This cost three rounds.
- ⚠ **A WEBGL CANVAS ONLY REFRACTS ITS OWN SCENE.** Two canvases cannot see each other however
  they are stacked in CSS. **Relevant to chunk 5:** the Next-step button reacting to selected
  cards means the button and the cards share a scene, or it cannot work.
- ⚠ **EDGE ENERGY IS THE WRONG METRIC FOR "IS THIS TRANSMITTED".** Use a luminance histogram of
  the ground. See above.

---

*3 August 2026, second session. The card sits in grid slot 1 and the c2b mark reads through the
glass — coloured letterform on the page's own black, with a specular sweep across the face.
Uncommitted, awaiting Carl.*

*Next: the filament — heat, not drawing.*
