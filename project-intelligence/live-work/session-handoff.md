# Session Handoff — 22/23 September 2026. THE LIGHTING CONCEPT IS RECORDED. NEXT: THE WALL NEON.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔ THE NEXT SESSION — CARL'S PLAN, IN HIS ORDER

> *"So the next session we can implement the wall neon first. We'll go to plan mode, bring in the
> Architect to evaluate and take it from there with the floor cards neon after that. Then we will
> point some individual wall lights at the cards and see how it looks."*

1. ⛔ **WALL PAIR NEON (CA, CB) — PLAN MODE FIRST, ARCHITECT EVALUATES THE PLAN** (plan-review gate,
   `handoff-protocol.md` §2.5). Carl approves before anything is built.
2. **FLOOR PAIR NEON (CD, CS)** — after the wall pair is matched by eye.
3. **INDIVIDUAL LIGHTS pointed at the cards** (D-090's four lights) — *"and see how it looks."*
4. *(Not in Carl's list for next session: the SPILL onto the backplate. D-091 rules track before
   spill; the unmodelled CEILING only bites there.)*

⚠⚠ **READ BEFORE PLANNING:** `decisions.md` **D-090 (amended 22 Sept)** — the whole lighting concept
lives there — plus **D-087** (the loop), **D-091** (one brightness track; backplate route chosen),
and ethos **§14a**. ⛔ **Also the stand-in rig's notes in `about-card-canvas.tsx`** (key 0.5, mirror
2.6, ambient 0.20) — **four earlier rigs measured clean and were rejected on sight** (R-025).

### ⚠ WHAT IS SET vs WHAT IS DELIBERATELY OPEN

⛔ **CARL LEAVES WRIGGLE ROOM ON PURPOSE:** *"Creativity is best when performed within certain
parameters but not rigid enough to stifle and contain creativity and inspiration."* **Set the bounds;
do not press him to pick values the scene has not judged. Record candidates as CANDIDATES.**

| SET | OPEN (on purpose) |
|---|---|
| Neon is **BLUE**; four colours withdrawn | **The glow colour** — *"ive not made my mind up yet"* |
| **Pair by pair**, wall cards first, a **DARKER** blue | Candidate: the **"c" navy** of the navy-teal logos, glow ~`#1a468a`, core ~`#b0d0f3` |
| **Bloom target MEASURED** — tight bloom (8% of core by 4px) + faint ~8-10% wash | Exact intensities — **tune by eye in the room** |
| Core near-white, **colour lives in the glow** | Ignition style — candidate: the filament's fade-up, in blue |

⚠ **§5a WILL BITE IN PLANNING:** a light source per card, and anything that makes the rim EMIT, may be
a new mechanism. **Write the structural decision and stop — do not build it inside the chunk.**

---

## ✔ WHAT THIS SESSION DID — ALL COMMITTED AND PUSHED. HEAD `1d4064f`, tree clean.

    eea55a1  chore(guard): lock about-card-glass.ts — D-089's approved material
    f9a162e  feat(about): skirting runs out of the frame; left band is wall to the bottom
    1d4064f  docs: the lighting concept — blue neon pair by pair, the mark on the wall, the backplate route

⚠ `tsc` clean; lint at baseline `1 problem (1 error, 0 warnings)`. **Dev server STOPPED, port 3000
free.**

1. **The glass file is LOCKED** in `.claude/protected-files.json`, **verified by a probe edit the
   guard denied.** ⛔ **The lighting chunk may need to touch `about-card-glass.ts` (D-090's tint
   question lives in `GLASS_COLOR`) — that needs Carl to NAME the file for an unlock.**
2. **Pillarbox, bottom-left — Carl: *"Yes, thats it. Looks aligned... its hard to see the join."*** The
   skirting piece is now 100 columns, scaled 1.14 for perspective, lowered to 90.67%; aligned within
   1.8px at four window sizes. The left band is wall to the bottom.
3. ⛔⛔ **THE RIGHT BAND IS DELIBERATELY UNREPAIRED.** Carl: *"a happy accident, serendipity. The
   stretched floor reads as a shadow."* **A repair was built and reverted. Recorded at the band in
   code. DO NOT "FIX" IT.**
4. **Lighting concept recorded** — D-088, D-090, D-091 amended (see commit `1d4064f`).

---

## ⛔ CORRECTIONS CARL MADE THIS SESSION — so they are not repeated

1. ⛔ **"The backplate method" was read three ways before Carl supplied his own questions to CS.**
   **An answer read without its question misleads.** Carl's questions are now verbatim in D-091.
2. ⛔ **The Builder argued the surroundings split 3+1 (CD sits in shadow), so pairs don't fit.**
   Carl: *"the figures say that but visually they are part of the same family."* **Grouping is what
   the EYE reads — background luma was the wrong measure.**
3. ⛔ **The Builder called the chosen bloom reference "broad, overlay-like" — the opposite of true.**
   It compared raw luma **without subtracting the image's own background.** **Subtract the
   background before comparing glow.**
4. ⛔ **The Builder objected blue "belongs to the Q+A" (D-063).** Carl pointed at the answer cards
   and client info — **both blue-bodied. D-063 governs the MARK, not materials.**
5. ⚠ **Skirting: a brightness correction derived from the SOURCE (0.73) over-darkened on SCREEN.**
   **Measure on screen, not in the source.**

---

## ⚠ STILL OPEN AND CARL'S — unchanged unless noted

1. ⛔ **D-088 (amended):** the mark starts GOLD on the right wall, scroll pulls it off, 2D fall into §3,
   gold -> platinum-blue. **Open: D-065 (no movement), D-063 (blue), the band's width (0px on 3:2 and
   narrower — where does the mark hang?), reduced motion, §5a scroll mechanism with D-092.**
2. **D-092** — activation trigger; **no IntersectionObserver exists**; replay-on-scroll-back is Carl's.
3. **RIM-DARK** (parked by Carl) and **ENVMAP-STALE** — the rim's env map is built once from the
   plain photo, so **spill will not appear IN the rim's reflection.**
4. **The card text becomes Three.js text** (D-091 direction) — **moves D-086; new entry when the text
   chunk opens.**
5. ⛔ **FOUR accessibility items, scoped as ONE piece of work:** D-086 `sr-only`, D-088 reduced motion,
   D-091 three-flashes limit (**four cards in sequence is where it breaks**), D-092 reduced-motion fade.
6. **`wall-card-corners-4-september.md` supersession notice** — still owed.
7. ⚠ **Parked, do not press:** AI-roles-vs-premium positioning; the travelling-room question.

---

*Written 23 September 2026. ⛔ **Everything is pushed. The next session opens in PLAN MODE on the wall
pair's neon, and the Architect evaluates before anything is built.***
