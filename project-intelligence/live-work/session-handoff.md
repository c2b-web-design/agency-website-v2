# Session Handoff — 18 September 2026 (THIRD SESSION OF THE DAY). THE PROXY NEVER RENDERED. NOW IT DOES.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔⛔ WHAT HAPPENED, IN ONE LINE

**The depth proxy built yesterday had never drawn a single pixel — its triangles were wound
backwards and the GPU culled all 4,608 of them — and it hid because the DOM `<img>` behind the
transparent canvas was still painting the same room.**

## ⛔ COMMITTED AND PUSHED. HEAD is `2978766`.

    8041c20  the depth proxy was never visible — its triangles were wound backwards
    2978766  D-088 the mark travels desk-to-player; the poster is ruled out

⚠⚠ **COMMITTED IS NOT APPROVED. Carl has NOT passed the room, the glass or the rails by eye.**

✔ **WORKING TREE CLEAN — nothing uncommitted.** ⚠ One pre-existing untracked file,
`brand-assets/c2b-logo-blue-mark.png`, predates this session and was left alone.

⚠ `npx tsc --noEmit` CLEAN. `npm run lint` = `1 problem (1 error, 0 warnings)` — the documented
baseline. ✔ **Ports 3000 and 3100 CONFIRMED FREE at session end — no server left running.**

---

# ⛔⛔ THE FAULT AND THE FIX — D-085

**The index order `a, a+DIV+1, a+1` winds clockwise from this camera.** Every triangle was
back-facing; the GPU discarded them under the default `FrontSide`.

⛔ **IT WAS NEVER FRUSTUM-CULLED AND NEVER HIDDEN.** `onBeforeRender` **fired every frame** — the
mesh reached `renderObject()` and was handed to the GPU, which dropped it at face culling.
`visible: true`, texture bound, `frustumCulled={false}` changed nothing.

⚠⚠ **AND IT EXPLAINS WHAT LOOKED IMPOSSIBLE: CS refracted a room that was not on screen.** Three's
transmission pass flips `material.side` to `BackSide`, so the proxy was **visible to the GLASS and
culled in the MAIN pass.** The unexplained `side: 1` in a scene dump was that flip caught mid-pass.

**Fixed by reversing the index order only. Positions and UVs untouched.**

⛔ **SECOND, SEPARATE DEFECT — the horizon sign.** `nyHorizon` returned **-0.33794** where the
horizon is **+0.33794** (verified by substitution: 2.8e-17 vs **-0.43901**). ⚠⚠ **NOT the cause of
the invisibility** — both grids built finite vertices either way, so **fixing it alone would have
changed nothing on screen, a real bug that would have looked like a failed fix.** `WALL_Z` -2.04 →
-78.68. **The comment above the line said *"ny ~= 0.400"* — positive — while the code computed
negative, and nothing checked they agreed.**

## ⛔ D-084's ACCEPTANCE TEST IS WITHDRAWN AS EVIDENCE

**It compared the DOM photograph with ITSELF.** The proxy contributed nothing to either side.
⚠ **A control comparing an image with itself returns 0.000 and proves nothing.** The NDC round-trip
at 2.22e-16 verified the maths of a mesh that never drew. ⛔ **D-084's ARCHITECTURE STANDS — only the
claim that it was verified working is gone.**

---

# ⛔ THE RECORD GAP IS THE SESSION'S REAL THEME — THREE INSTANCES

**D-074 named this failure. It recurred three times in this one chunk.**

| entry | what lived only in a gitignored `live-work/` file |
|---|---|
| **D-086** | **The card copy is BAKED INTO THE FACE** — Carl's ruling of 14 September, four days unrecorded |
| **D-087** | **The neon LOOP**, and that mouse proximity + randomness were **raised and not chosen** |
| **D-088** | The poster ruling, now superseded |

⚠⚠ **AND THE D-086 GAP PRODUCED A WRONG ANSWER TO CARL THIS SESSION.** Asked whether the card text
reads without the neon, the Builder read `wall-card-text.tsx`, found DOM `text-white`, and said
*"Yes — legibility does not depend on the neon at all."* ⛔ **That file is the SUPERSEDED approach
and nothing canonical said so.** Carl: *"This is out of date, i decided to use three js text that
is affected by the scene."*

⛔ **THE CORRECT ANSWER IS UNKNOWN. The text and the neon are ONE problem.**

## ⛔⛔ A STANDING RULE WAS ADDED TO `context-rules.md`

> ⛔ ***"When im brainstorming at the start of a section things i mention, albeit provisionally
> should be recorded. Its clear that some ideas were not."***

⚠⚠ **AND THE HARDER HALF: AN IDEA CAN BE CHOSEN BY BEING EXPANDED ON.** Carl raises three options
and develops one; **the development IS the decision.** ⛔ **Record the others as raised-and-not-
chosen.** **The test: if a future reader cannot tell which option is live, the record has failed —
even though every word in it is true.**

---

# ⚠⚠ WHAT I GOT WRONG — and the controls that caught it

| | |
|---|---|
| **A probe that could not fail** | An r3f harness reported 0.0 for hiding the backplate — **and 0.0 for its control too.** `frameloop="demand"`, nothing repainted. **Every number was fiction.** ⛔ Without the control it would have been a finding. |
| **The wrong instrument, twice** | `elementFromPoint` returned `canvas` **before AND after** the z-index fix — the SVG is `pointer-events-none`, so hit-testing reports what is BENEATH it. ⛔ **HIT ORDER IS NOT PAINT ORDER.** Trusting it would have called a working fix a failure. |
| **A hypothesis I built on** | *"The backplate does not cover the ceiling"* — **falsified by my own arithmetic.** The wall grid spans the full frame to ny=1. |
| **Turned on the wrong guides** | Asked for floor rails, flipped `showGuides` — **the GREEN CARD QUADS.** Two different things in two different files; the distinction is now written at both sites. |
| **Broke a file with a comment** | My `wall-card-text.tsx` header closed the block early and orphaned the original body into code. `tsc` caught it. |

> ⛔⛔ **THE PATTERN: MEASURE THE PIXELS. Three separate instruments agreed with a wrong answer this
> session, and only rendered output settled it.**

---

# ⛔ THE RAILS — ON UNTIL CARL SAYS OTHERWISE

**Carl:** *"They should be on until i instruct to remove them."*

⛔ **They were never removed — they were COVERED.** `AboutCardCanvas` is later in the DOM with an
**exactly overlapping box** (both 38,0 1349x899), so at `z-index: auto` it won on document order.
**Fixed with `z-20`** plus an `aspect-[3/2]` wrapper so they track the plate, not the letterboxed
section.

⚠ **MEASURED ANGLES UNCHANGED: PL −15.8809°, PR 34.9716°.** ⛔ **No rail coordinate was touched** —
Carl: *"they were meticulously measured… if the floor cards are moved later on a wrong axis it will
ruin the perspective."*

⛔ **BLUE AND PINK ONLY.** The green card quads are a **consumed placement check** and stay OFF —
Carl: *"NOT green card rectangles."* The green/orange lines in `/proto/wall` are starter references
and stay there.

---

# ⛔ WHAT THE NEXT SESSION SHOULD DO, IN ORDER

1. ⛔ **Verify ports 3000/3100 are free before starting anything** — they were free at session end.
2. ✔ **All governance is committed and pushed — nothing is owed.**
3. ⚠ **Nothing is authorised to build.** Chunk 3 is not open.

---

# ⚠ PARKED BY CARL — NO DECISION, DO NOT PRESS

1. **The travelling-room question** — room in §1 with cards fading in at §2, or §2 as the reveal.
2. **Whether CA strikes first** — ⚠ in tension with Carl's own *"NO CARD IS A STEP."*
3. **Four neon colours** — ⛔ **now doubted by Carl himself:** *"I did rule 4 colours but i think
   that would be too much."* D-087 not withdrawn; no new number chosen.
4. **`wall-card-corners-4-september.md` supersession notice** — still owed. ⛔ It still says
   **"DO NOT EDIT THESE NUMBERS"** and carries **no notice that Carl discarded that set on
   10 September.** ⚠⚠ **This is what produced two false blockers last session.**

---

# ⛔⛔ THE LIVE DIRECTION — D-088, PROPOSED, "we will probably run with this"

**The poster is RULED OUT: the cards grew and took its space.** ⚠ The reasoning did not fail; its
premise moved.

**The mark instead STANDS ON THE RIGHT DESK in §2** — right of the mouse, measured and clear
(CB's lowest point y 0.3785 against a desk surface at y 0.50-0.62) — **and TRAVELS into §3's player
on scroll**, jumping into the screen as the player comes into view.

⛔⛔ **IT ANSWERS CARL'S OWN CLUE** — *"It stops at 2. How would it get in the TV?"* **It carries
itself there: ONE OBJECT the whole way down.** ⚠ **And it solves §3's idle-player problem in the
same move, so §2's mark and §3's placeholder are ONE piece of work.**

⛔ **§5a APPLIES AND IT IS NOT AUTHORISED. Five things unsolved:** a scroll-linked animation is a
**new mechanism with no precedent on this site**; **the 3D→DOM hand-off** is two coordinate spaces
and is the hard part; `prefers-reduced-motion`; what the neon spill does to the mark's colour; and
**whether a second travelling instance enriches D-065's immobile mark or contradicts it.**

---

# ⚠ STILL OPEN AND CARL'S

1. ⛔ **The room, the glass in the room, and the rails are ALL unapproved by eye.**
2. **`ENV_PLATE_INTENSITY = 6.0` is a COMPENSATION**, not a physical value. Revisit downward.
3. **Roughness 0.35 was approved on the BENCH, not in the room.** Rim 0.10 clear, bevel+face 0.35
   frosted — **verified live on the GPU this session.**
4. **The texture budget for baked text is UNMEASURED and is the real constraint** — the answer card
   bakes ONE LINE into 4 MiB at +108ms; these cards carry **49-84 words.** ⛔ **Size it BEFORE
   building, not in a stall.**
5. **PMREM cost in the room still unmeasured.**
6. ⚠ **`?guides=1` guide lines render WITHOUT the flag** — 1,025 guide-coloured pixels on a plain
   load. **Reported, not fixed.**
7. **§2 copy PROVISIONAL**; **accessibility** owed (`sr-only` copy, D-086).

---

*Written 18 September 2026, third session. ⛔ **The proxy renders for the first time and the glass is
judgeable.** ⚠ **Committed is not approved.** ⛔ **Three decisions were recovered from gitignored
files; the rule that should prevent a fourth is now in `context-rules.md`.***
