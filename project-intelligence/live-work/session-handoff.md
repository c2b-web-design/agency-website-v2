# Session Handoff — 17 September 2026. CHUNK 2a IS APPROVED. BUILD IT.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔⛔ WHERE TO START

| # | go to | why |
|---|---|---|
| **1** | ⛔⛔ **`live-work/chunk2-plan-amended-17-september.md`** | **APPROVED. It is the next session's work.** 457 lines, Architect-reviewed twice |
| **2** | ⛔ **"THE THREE RULINGS"** below | Thickness, Option A, and what the figures actually are |
| **3** | ⚠ **"WHAT I GOT WRONG"** | Four errors, two caught by the Architect. The pattern matters more than any one |
| **4** | ⚠ **`live-work/structural-note-backplate-17-september.md`** | Option A is now confirmed; F7 must be added to its §5b table |

---

## ⛔⛔ WHAT HAPPENED, IN ONE LINE

**The wall cards got geometry (and a 42%-wrong aspect was found and corrected), the lighting
became two directional lights after a day of rejected alternatives, the backplate superseded the
sampled proxy, and chunk 2a — CS's frosted glass on the bench — was planned, reviewed twice by the
Architect, corrected, and APPROVED.**

# ⛔ COMMITTED AND PUSHED. HEAD IS `30442e2` (+ this handoff and the plan)

    83a6e46  the backplate supersedes the proxy; the lighting system, designed and unbuilt
    c0c9913  ignore three undecided brand-asset candidates by exact path
    ac4a4c8  the wall pair has geometry; two directional lights, all four readable
    30442e2  the clean plate — wall guides retired, floor rails kept

⚠ **`npx tsc --noEmit` CLEAN. `npm run lint` = `1 problem (1 error, 0 warnings)`** — the documented
`enquiry-opening.tsx` baseline. ⛔ **Zero warnings held all session.**
⚠ **A dev server was running on :3000 (PID 3036). Kill it before any checkpoint or `verify/` run.**

---

# ⛔⛔ THE NEXT SESSION'S WORK — CHUNK 2a, APPROVED

⛔ **THE PLAN IS THE SPEC. `live-work/chunk2-plan-amended-17-september.md`. Do not re-derive it.**

**2a is BENCH ONLY.** CS's face gets `meshPhysicalMaterial` with transmission; the bench gets
roughness and thickness faders and a photographic proxy. ⛔ **`/about` IS NOT TOUCHED.**

## ⛔⛔ THE THREE RULINGS — Carl's, 17 September

**1. THICKNESS = 9.80mm, AS A TYPED CONSTANT.** ⚠⚠ **NOT `heightMm * TENT_POLE_RATIO` — that
expression gives 28.6mm and is NOT what he approved.** ⛔ **The coupling to the crown is DECLINED**,
so the crown can be re-tuned without dragging the glass with it. ⚠ **Whether the other three cards
share 9.80mm or scale to their heights is OPEN — a rollout question. Do not assume.**

**2. BACKPLATE = OPTION A (REPLACE), CONFIRMED BY NAME.** ⛔ The backplate replaces the
`next/image` element. **The room stops surviving JS failure, stops surviving WebGL context loss,
and no longer paints before JS runs. Given up deliberately.**

**3. THE FIGURES ARE A STARTING POINT, NOT CARL'S.** *"The figures were presented as a starting
point."* ⛔ **`roughness 0.18` is where the fader OPENS, not what it aims at.** ⚠ **The crown is the
precedent: it opened at a recommended 0.015-0.03 and Carl's eye settled 0.073 — nearly 3x.**
**The UI must mark these "starting point, not a proposal".**

## ⛔ CARL HAS AN EXTERNAL GLASS TOOL — the iteration route for 2a

**A live `MeshPhysicalMaterial` sandbox built for him in Gemini's chat interface** — roughness,
transmission, thickness, IOR on sliders, plus tint swatches. **Full detail in the plan.**

⛔ **IT RUNS BOTH WAYS, and that is why it is worth knowing about before 2a is built:** Carl moves
sliders and pastes a picture, **and takes numbers OUT of the implementation to replicate them
there.** ⚠⚠ **Today's lighting took four measured-clean-and-rejected iterations, and what located
the fault was four words — *"its acting like a street light."* A rendered frame beats an adjective.**

⛔⛔ **READ THE CHARACTER, NEVER THE NUMBER.** `lod = log2(samplerSize.x) * roughness`, so frost
scale depends on the render target's width — **the tool's canvas is not the bench's and neither is
the room's.** ⚠ **And its scene is a thick torus knot at demo scale against CS's 9.8mm near-flat
face at millimetres x 750: `thickness 0.35` there is a solid chunk of glass and meaningless here.**

⚠ **IT ALSO EXPLAINS THE THIRD OUTSIDE FIGURE SET** (0.28 / 0.95 / 0.3 / 1.5) — **that was the
tool's DEFAULT SLIDER POSITION, not a recommendation reasoned for this room. Not a third
independent opinion.**

## ⛔ THE THREE-WAY SPLIT — and it is forced, not tidy

    2a  bench only          <- APPROVED. This is the next session's work.
    backplate chunk         <- separate. Option A. Returns through the gate.
    2b  the room            <- separate. Warm-up, target measurement, FINAL roughness.

⛔⛔ **WHY CS's GLASS MUST NOT GO IN THE ROOM YET.** `three.module.js:18019`:
`if (_currentClearAlpha < 1) _this.setClearColor(0xffffff, 0.5)`. **The `/about` canvas is
`alpha: true`**, so the transmission target clears to **50% WHITE** and CS would render a **milky
slab**. ⚠⚠ **It would look exactly like "the frost is too heavy" when it is a PIPELINE ARTEFACT —
worse than an empty result, because it is a confident wrong answer.**

## ⛔ THE GATE — A2, and it is the one that bites

**`about-card-mesh.tsx` is shared by ALL FOUR room cards.** ⛔ **The glass MUST be behind a prop
that is OFF by default**, or every card turns into that milky slab on the next build.
⚠ **2a's verification includes: load `/about`, confirm all four cards are STILL GREY.**

## ⚠ Two corrections owed at execution

- ⛔ **`card-bench.tsx:109` says `TENT_POLE_RATIO = 0.025`. The code says 0.073.** **This stale
  comment produced a wrong figure in a plan put to Carl. Correct it in place.**
- ⛔ **The face must be WHITE, not `DIAG_FACE_COLOR` `#c8c8c8`** — transmission is multiplied by
  `color`, so the grey would tint the "colourless" glass to **78%**.

---

# ⛔ WHAT WAS BUILT TODAY

## The wall pair has geometry — and a 42% error was found

**CA and CB hang at the solved camera on the same blueprint as the floor pair.** Carl: *"The cards
can be seen as one 'family'. They all share similar chracteristics, only the dimensions change."*

⛔ **`WALL_CARD_ASPECT = 1.615` WAS WRONG BY 42%.** It came from `wall-card-text.tsx`'s 420x260 CSS
box and had **never been measured against the plate.** Solved: **CA 2.327, CB 2.248.**

⚠ **Carl chose the slower route** — *"getting it right is more important than how fast"* — **and it
is what found the fault.** The quads are PROJECTED trapezoids; a bounding box returned CA and CB
**overlapping**, which is impossible for two cards.

**Five independent checks:** three focal lengths agree within 6.4% · the aspect is stable across
that range · orthogonality within 0.012 · the overlay lands on the painted quads
(`live-work/wall-corner-check-17-september.png`) · **and Carl's own test** — the desks relate to
the walls, so two flat cards should be ~89.4° apart; **measured 96.10°.** ⚠ **The 6.7° residual is
stated, not dressed up; the record already lists the right desk's direction under "What is NOT
established".**

## Lighting — two directional lights, after a day of rejects

⛔⛔ **FOUR SPOTLIGHT RIGS WERE BUILT AND REJECTED ON SIGHT.** Carl: *"its acting like a street
light."* ⚠⚠ **THE FAULT WAS THE LIGHT TYPE, NOT ITS PLACEMENT.** A `spotLight` has a position, so
it pools and falls off; a `directionalLight` has neither, so **the only thing varying across a face
is the face.**

⚠ **Four measured iterations — raking spots, cones, rim axis, a 25° swing — EVERY ONE MEASURED
CLEAN AND LOOKED WORSE.** ⛔ **Rule 9. The screen is the truth and Carl's eye is the instrument.**

**The second light:** ⚠ the obvious mirror `[-1,2,2]` is WRONG — it lights the RIGHT pair more
(0.632) than the left (0.380), because the cards are yawed to their desks, not mirrored about the
room. **`[5,2,-2]` grazes CD/CA at 0.179/0.104 and gives exactly 0.000 to CS/CB.**

⚠ **And the key had to come down, which was not part of the request:** at key 1.2 it still supplied
**88% of CD's light AT NEAR HEAD-ON**, so 88% of what the left pair received carried no gradient.
**Key 0.5 / fill 2.6 inverts that to 56% fill at a grazing angle.**

⛔ **CARL ACCEPTS THE TRADE:** the right pair drops ~0.03 from the values he approved. *"It is a
trade off, but all 4 are now visible. Its something to work with."*

## The clean plate

⛔ **Wall guides gone, floor rails kept.** One `src` swap — the wall quads are PAINTED INTO the
plate; the floor rails are SVG in the component. ⚠ **Both plates are 1.500 framing, so no card
moved.** **The guides were CONSUMED, not discarded** — they are now the solved aspects.

---

# ⚠⚠ WHAT I GOT WRONG — the pattern, not the list

⛔ **FOUR ERRORS. THE ARCHITECT CAUGHT TWO THAT WOULD HAVE REACHED THE BUILD.**

| | |
|---|---|
| **A1 — thickness 2.92x out** | Every figure computed at **0.025** when `TENT_POLE_RATIO` is **0.073**. ⚠ **Cause: a STALE COMMENT at `card-bench.tsx:109`.** It produced a wrong number in a plan put to Carl |
| **A2 — the missing gate** | The first plan said "optional prop"; the amended plan **dropped the words**. Without them, 2a turns all four room cards milky |
| **C1 — a FALSE argument** | I wrote that Option B would draw the DOM image "ACES-shifted". ⛔ **It would not — `next/image` is a DOM node; three never renders it.** I invented a mechanism to support a conclusion that was right for other reasons |
| **A3 — over-claimed authority** | I recorded Option A as Carl's decision under *"take the best course of action."* ⛔ **`CLAUDE.md`: an override authorises the NAMED change only** |

⚠⚠ **AND THREE OF MY OWN CHECKS PRODUCED FALSE RESULTS TODAY** — a 33/57px "error" comparing a 3D
centroid against a 2D corner average; a "0.00 contribution" from a double-negated light vector; a
delivery figure that claimed a cap the 2560px plate does not have. ⛔ **Each was caught by the
result being incoherent, not by the check failing.**

> ⛔ **THE LESSON: I VERIFIED THE ARCHITECT'S FINDINGS IN `node_modules` RATHER THAN INHERITING
> THEM — all six were verbatim. Do the same with anything in this handoff.** `context-rules.md`: a
> claim in a governance file *"will be read as verified because it is written down."*

---

# ⛔ WHAT THE NEXT SESSION SHOULD NOT DO

- ⛔⛔ **Do not put glass in the room.** 2a is bench only. The milky-slab artefact is waiting.
- ⛔⛔ **Do not write thickness as `heightMm * TENT_POLE_RATIO`.** It gives 28.6mm. Carl approved
  **9.80mm** as a constant.
- ⛔ **Do not treat `roughness 0.18` as a target.** It is where the fader opens.
- ⛔ **Do not swap the face material without the off-by-default prop.**
- ⛔ **Do not reopen D-051.** Satin stays on `/start` — the orthographic camera and dead backdrop
  still hold there. **Two cards, two materials, one consistent reason.**
- ⛔ **Do not copy `/start`'s baked-albedo text route.** Correct for satin, **wrong for frost** —
  the frost would soften its own copy.
- ⛔ **Do not add `anisotropy`.** It needs a `tangent` attribute; **this geometry has none**, which
  is what made the normal-map route inert on 14 September.
- ⛔ **Do not add `clearcoat`.** Forbidden by name, and `answer-card-mesh.tsx:226`: *"SWEEP IT WITH
  `roughness`, NEVER ALONE."*
- ⛔ **Do not reopen the crown (0.073) or the solved aspects.**
- ⚠ **Do not "fix" the left/right lighting imbalance.** Carl accepted it after four rejected rigs.
- ⚠ **Do not uncomment `WallCardText`.** Its 420x260 box is the 1.615 aspect the solve disproved.

---

# ⚠ STILL OPEN AND CARL'S

1. **Four neon colours** — ⛔ **ruled that there will be four, all different. NONE chosen. Red was
   an example, not a decision.**
2. **Option C** — if he wants the failure-mode cover back, its fetch behaviour must be **MEASURED**.
3. **`transmissionResolutionScale`** — after 2b measures the target's real memory. ⚠ The Architect's
   arithmetic (not measured) puts it at **~300MB at dpr 2**, against 8MB for the backplate texture.
4. **Final roughness** — set in the room, in 2b. **The bench cannot settle it** (F3: frost scale
   depends on render-target width).
5. **Thickness for CD, CA, CB** at rollout.
6. **§2's copy is PROVISIONAL** — CA 64 / CB 84 / CD 49 / CS 55 words, four lines uncuttable.
7. **Accessibility** — Carl ruled it gets done. A visually-hidden DOM layer. ⚠ **Needs final copy
   or it is written twice.** It would also close **D-051-A11Y** on `/start`, which is his call.
8. **The record is behind the code.** ⛔ **Today's work is in NO `decisions.md` entry and NOT in
   `current-sprint.md`.** ⚠⚠ **D-051's own lesson: the material changed on 9 August and the record
   did not for TEN DAYS, and the stale line was about to be built into a protected-file list.**

---

*Written 17 September 2026. ⛔ **Chunk 2a is approved and is the next session's work.** ⚠ The plan
is the spec — 457 lines, reviewed twice, corrected four times. Read it before touching anything.*
