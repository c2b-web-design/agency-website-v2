# Session Handoff — 11 September 2026. THE CAMERA IS SOLVED AND THE CARD HAS A SHAPE

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## ⛔ WHERE TO START

| # | go to | why |
|---|---|---|
| **1** | ⛔ **"WHAT IS IN FRONT OF THE NEXT SESSION"** | The shape is close; two dials are unsettled and one is Carl's eye |
| **2** | ⛔ **"THE §5a NOTE IS STILL OWED"** | ⚠ **It now gates real work, not a hypothetical** |
| **3** | ⚠ **"WHAT THE ARCHITECT CAUGHT"** | Five claims of the Builder's did not survive a file check |
| **4** | ⚠ **"WHAT I GOT WRONG"** | Six shape attempts, and the pattern in them is worth the two minutes |

---

## ⛔⛔ WHAT HAPPENED, IN ONE LINE

**The camera was solved and independently falsified at 0.6°, the room was measured, the Architect
reviewed the plan and found five false claims, and the floor card's geometry was built on a bench
through six shape iterations — ending close to right, with the crown converted to a RATIO so the
family holds at any size.**

---

# ⛔ NOTHING IS COMMITTED. HEAD IS STILL `27067d7`

    M  app/about/page.tsx                 scaffolding reverted; floor copy withdrawn
    M  app/proto/wall/page.tsx            rails, smaller handles, brightness, comment fixes
    M  public/about-studio-wall-guides.jpg  floor guides repositioned
    ?? app/proto/card/                    NEW — the geometry bench
    ?? components/about/about-card-geometry.ts   NEW
    ?? components/about/about-card-mesh.tsx      NEW
    ?? components/about/card-bench.tsx           NEW

⚠ **`npx tsc --noEmit` CLEAN. `npm run lint` = `1 problem (1 error, 0 warnings)`** — the documented
`enquiry-opening.tsx` baseline. ⛔ **Zero warnings held all session.**
⚠ **The dev server is RUNNING on :3000.** Stop it before any checkpoint measurement.

---

# ⛔⛔ THE CAMERA IS SOLVED — `live-work/camera-solve-11-september.md`

| | |
|---|---|
| focal length | **1282.0 px** on the 2560x1707 plate |
| **vFOV for Three.js** | ⛔ **67.31°** — `PerspectiveCamera.fov` is VERTICAL |
| hFOV / 35mm equiv | 89.91° / 18mm |
| pitch | 12.68° below horizontal |

⛔ **FALSIFIED INDEPENDENTLY: the left desk's cabinet base — fitted at rms 0.33px and never fed into
the solve — back-projects to 0.6° from its wall.** It should be 0°. **That test could have failed
and did not.**

⚠⚠ **THE SCALE TRAP THAT COST THE FIRST SOLVE:** the VPs (2523, 397) and (374, 397) are in the
**1800x1200** frame, not the plate. Read as plate pixels they gave a plausible-looking f = 958px /
106° / 13.5mm, **exposed only because the cabinet base then read 20.6° off its own wall.**
⛔ **A pixel coordinate without its frame size is not a measurement.**

## ⚠ THE ROOM, AND THE TWO SIDES ARE NOT EQUALLY EVIDENCED

- **LEFT desk — measured AND independently confirmed.** Carl's rail 0.3° off its wall; cabinet base
  0.6°. ⚠⚠ **His hand-placed rail landed 0.13° from the camera's own construction.**
- ⛔ **RIGHT desk — CARL'S RAIL ALONE, ~5.4° off its wall.** The skirting "confirmation" at 4.9° came
  from a fit that never converged and is **not** independent evidence. **CS's yaw rests on one
  hand-placed line.**
- **The two desks are 84.3° apart in the room** — 90° less the right desk's turn.

⚠ **`INITIAL_RAIL` labels are INVERTED and the names are kept only so Carl's handles reappear:**
RL/RR say "ANGLE" but sit on the **chair castors**; PL/PR say "POSITION" but are **the
measurement**. Documented in the file.

---

# ⛔⛔ WHAT IS IN FRONT OF THE NEXT SESSION

## 1. ⛔ THE SHAPE — CLOSE, WITH TWO DIALS UNSETTLED

**`/proto/card`.** Rim, bevel, convex face under a three-tone diagnostic. Views: oblique, face-on,
**side elevation**, top elevation. Sliders: height, aspect, crown, **oval**, light angle.

⚠ **Carl on the last render: *"subtle dome from the side and the top"*, and the oblique read well.**
⛔ **Not approved — he was still looking when the session ended.**

**The two open dials:**

- ⛔ **`OVAL_EXPAND` (currently 1.35) — THE UNRESOLVED TRADE.** Carl's solution to flat corners:
  *"expand the oval in all directions so it goes outside the rectangle, but only show what is inside
  the rectangle."* **Below E≈1.26 the corners fall off the curve and go flat; above it the whole card
  is on the curve BUT the mid-edges stand proud of the bevel — 24mm at E=1.35, nearly half the
  crown.** ⚠ **Judgement, not arithmetic.** ⚠ If the step reads wrong at every setting, the likely
  answer is that **the bevel should follow the face's edge height** rather than being flat — the
  mount shaped to the lens, not the lens forced to the mount. **Untested.**
- ⚠ **`OVAL_EXPAND` IS ALSO NOT YET DERIVED FROM ASPECT.** The threshold where corners stop going
  flat depends on how elongated the rectangle is, so **a 1.615:1 wall card needs a different value.**
  Currently a constant tuned against 2.026:1.

## 2. ⛔ THE CROWN IS NOW A RATIO — the last thing done

**`CROWN_RATIO = 0.0901`** (9.01% of card height), back-derived from the 100mm crown on the 1110mm
card Carl was judging. Carl: *"this formula should be used for all cards. Not the exact same figures
because the cards are different sizes."*

⚠⚠ **WHAT IS PRESERVED IS THE ANGLE, NOT THE DEPTH** — max surface tilt is **27.9° at every size**:

    600mm -> 54.1mm    1110mm -> 100.0mm    1400mm -> 126.1mm     all 27.9°

⛔ **A fixed millimetre crown would read as a dome on a small card and flat on a large one.**

## 3. ⛔⛔ THE §5a NOTE IS STILL OWED — AND IT NOW GATES REAL WORK

⚠ **Owed since 5 September. The bench does NOT trip it** (`/proto/card`, same precedent as
`/proto/nextstep`) — **but a canvas on `/about` does, and that is the next structural step.**

⛔ **The Architect named four questions missing from its scope, and TWO MUST BE ANSWERED BEFORE
CHUNK 1 IS FINISHED:**

- ⛔⛔ **THERE IS NOTHING IN THE SCENE FOR THE GLASS TO TRANSMIT.** `answer-card-geometry.ts` records
  it: *"the frost was never the problem; the absence of anything worth seeing through was."*
  ⚠ **Carl's answer — sample the wall/floor colour and put a proxy rectangle behind each card** —
  avoids putting the 459KB plate in the scene and reinstating the regression D-075 removed.
  **Sampled and in the code: CA `#182733` · CB `#192a35` · CD `#15191f` · CS `#2d353c`.**
  ⚠⚠ **MEASURED SURPRISE: after a heavy blur both floor regions go FLAT.** So a faithful proxy gives
  the glass nothing to distort — **it may need MORE contrast than the room has.** `PROXY_CONTRAST`
  is the dial, currently 0.
- ⛔ **WHERE THE COPY LIVES.** Builder's advice, given on request: **DOM overlay, not baked** —
  baking reproduces D-051-A11Y four times over on the page whose job is explaining the four roles,
  and it is an indexing problem as well as an accessibility one. ⚠ **Cost: DOM text is not refracted
  by the glass it sits on.** **Carl has not ruled.**

**Also missing:** the unit system (millimetres adopted, anchored on an **assumed** 750mm desk); and
**§2's final aspect and fit mode**, which placement depends on — ⚠ if it reverts to `object-cover`,
**CB's top-right corner lands off the top of the frame at Carl's ~2.1 aspect.**

## 4. ⚠ SIX DECISIONS THE ARCHITECT PUT TO CARL — ALL STILL OPEN

1. **Frosted or satin?** ⛔ D-051 is **satin** and supersedes the frosted decision; the file named
   *glass* holds satin. **"Frosted glass" names a superseded decision.**
2. Plate in the scene, or transmission shows nothing?
3. Copy baked or DOM?
4. §2's aspect and fit mode.
5. Equal trim in the room, or equal trim on screen?
6. **Duty cycle before periods** — how often may the room go fully dark, and for how long?

---

# ⛔⛔ THE DESIGN CARL SPECIFIED TODAY — recorded because it exists nowhere else

**Full detail: `live-work/about-cards-plan-11-september.md` — ⛔ AND ITS REVIEW,
`live-work/architect-plan-response-about-cards.md`. NEVER THE PLAN ALONE: it contains five claims
that do not survive a file check, and the review names them.**

⚠ **The plan was originally written to a machine-local path outside version control.** Copied into
the repo on 11 September so the design specification survives the machine.

- ⛔ **NEON.** *"What works well with frosted glass and would have an impact? Neon."* ⚠⚠ **The
  half-tube rim IS a neon tube** — built in August so it *"will emit light onto the bevel and face,
  and if it's making a journey down the right hand side it will affect the 2 card."*
- ⛔ **SUBTLE.** *"Just enough to confirm the 'same world' idea."* ⛔ **The room is already lit — do
  NOT add a global light.** Carl corrected this directly: *"You're assuming that a white global
  light is going to be used."* The white ceiling and pale floor are in the photograph and **receive**
  the spill.
- ⛔⛔ **THE FUSION GLOW MASK.** A WebGL object cannot light a photograph. Carl: ***"no, it can't be
  baked in Fusion — but you can MASK it!"*** **Per-card glow layers authored in Fusion, composited
  over the plate, opacity driven by each card's live state.** Matching hex, subtle.
- ⛔ **THE SCENE MUST BE ALIVE.** *"It's like writing a song in 5/4. Every 4 bars complete the
  cycle."* ⚠ **No randomness needed — incommensurate periods.** {5,6,7,8} repeats only after 840s.
  ⛔ **4-and-8 lock** (8 is a multiple of 4). ⚠ **Architect's correction: duty cycle matters more
  than cycle length** — at 50% duty each, all four are dark 6.25% of the time, probably too often.
- ⚠ **Pop / fade / flicker DEFERRED** — Carl: *"we can sort this out when it's time."*
- ⚠ **`prefers-reduced-motion` is unhandled** and belongs with the mechanism.

---

# ⚠⚠ WHAT THE ARCHITECT CAUGHT — five claims that did not survive a file check

⛔ **All six checkable claims were re-verified by the Builder against the repo. All confirmed.**

1. ⛔ **`answer-card-geometry.ts` IS NOT PROTECTED.** The plan said it was. ⚠⚠ **The file's own
   comments record an authorisation Carl granted once on exactly this false premise. The same
   mistake, repeated.** ⛔ **Check `.claude/protected-files.json`; do not recall it.**
2. The right desk was over-claimed as measured. **Corrected in code.**
3. `INITIAL_RAIL` contradicted itself. **Corrected in code.**
4. **"Frosted glass" ≠ D-051, which is satin.**
5. **The acceptance test was wrong in both directions:** CA/CB are a valid projection test;
   **CD/CS are a size statement and NOT a test.** ⚠ And **decide the attribution rule before
   measuring** — a consistent offset shared by all four cards is a **camera** error, not a placement
   error.

⚠ **And a bug caught before it was written: `PerspectiveCamera.fov` is VERTICAL.** The plan carried
the 89.9° hFOV.

---

# ⚠⚠ WHAT I GOT WRONG — six shape attempts, and they rhyme

⛔ **Recorded because the pattern is the useful part: each fix created the next fault, and three of
the six were caused by reasoning from a formula instead of looking at a render.**

| # | attempt | Carl's verdict |
|---|---|---|
| 1 | plateau — flat centre, curve confined to a band | *"You cannot put text on the slope"* — the shoulder |
| 2 | paraboloid, radial | *"More like an old TV screen"* |
| 3 | raised cosine on true distance | *"Flat in the corners"* |
| 4 | superellipse n=6 | *"Not a shallow dome but 4 sloping triangles"* |
| 5 | superellipse n=3 | close, corners still flat |
| 6 | **true SDF** | **regressed — REVERTED on Carl's instruction** |

⛔ **THE PLATEAU WAS BACKWARDS AND THE FIRST RENDER SHOWED IT.** The reasoning was that a flat centre
*protects* the text. **It does the opposite:** confining curvature to a narrow band makes it steep
and shrinks the flat centre to pay for it.

⚠⚠ **THE SDF REGRESSION IS DIAGNOSED AND THE CAUSE IS WORTH KEEPING: on a long rectangle a true
distance field SATURATES.** From the centre out to x=404 of 807 — **more than half the card's
length** — it reads 1.0, so the surface was a flat ridge with turned-down ends.
⛔ **`insetDistance` is RETAINED in the file, unused and suppressed, with the reason at the line.**
It is the measured fix for the corners and **the corner fault and the ridge are not yet
reconciled.**

⚠ **A CORRECT COMPONENT WAS DELETED FOR ITS CALLER'S DEFECT.** `insetDistance` was written, then
removed when the *radial profile* built on it looked like a CRT. The distance field was never the
fault. **Restored, with that noted so it is not discarded a third time.**

⚠⚠ **AND A REFERENCE PHOTOGRAPH CAN SHOW A LIGHTING CONDITION AND BE READ AS A GEOMETRY.** Carl:
*"the top view is the same as the side view, it only looks flat because light isn't shone on it."*
⛔ **A cylindrical lens was one step from being built off that misreading** — while a bench with a
sweepable light sat open in the next tab.

⚠ **`maxFaceTiltDegrees()` CHANGED FOUR TIMES TODAY, each time edited to match the mesh.**
⛔ **A formula kept in step with the thing it measures is not an instrument.**
**`measuredMaxTiltDegrees()` reads built normals and is the one with authority.** They currently
agree within ~1°.

⚠ **The lint caught a real bug, not tidiness:** an edit dropped `positions.push`, so the face would
have had **zero vertices**. An unused-variable warning was the only thing that noticed.

---

# ⚠ SMALLER THINGS, RECORDED SO THEY ARE NOT REDISCOVERED

- ⛔ **The Gemini floor-grid image was TESTED AND REJECTED.** Floor lines bow up to **25px** off
  their own best fit; 3 of 5 untraceable; **aspect 1.5821 vs 1.500 — not even the same frame.**
  ⚠ **The walls were broadly sound; only the floor was decorative.** An image model reproduces the
  *appearance* of a grid.
- ⛔ **Four automatic fitting attempts on the desks FAILED** — fixed-band edge fit (25px rms),
  floorboard seams (grain indistinguishable from seams), right-desk blob segmentation (feet, column
  and shadow merge into one 125k-px mass). ⚠ **Carl's hand placement beat all of them.**
- ⚠ **The floor copy overlay is WITHDRAWN, not deleted** — preserved in full at
  `live-work/floor-copy-overlay-withdrawn-11-september.md` with the 2.026:1 dimensions. ⛔ It could
  not be commented out in place: **the block contains its own block comments and the first inner
  `*/` breaks the parse.**
- ⚠ **`/about` is back to the wall-guides plate** with the floor guides repositioned on Carl's
  instruction (green in from the wall, purple back, 92px gap, side by side).
- ⚠ **A frosted-glass reference is filed at `live-work/references/frosted-glass-reference.md`** —
  Carl's supply, 11 September. ⛔ **Its most useful line corroborates this project's own record:**
  *"Ensure your scene has background geometry or an environment map, otherwise the glass will appear
  invisible or dark grey."* ⚠ **Parameter ranges are there for chunk 2, with three project facts
  that override them: `thickness` scales with the model (so D-051's 6 is wrong on a mm-scale card),
  the approved material is SATIN not frosted, and no HDRI or drei preset may be used.**
- ⛔⛔ **AND CARL'S COROLLARY, WHICH CHANGES HOW CHUNK 2 MUST BE BENCHED:** *"It's not just the
  parameters that are important but also where the light is placed. Also what colour glass."*
  ⚠ **The material bench needs a MOVEABLE light before any value is tuned** — the same lesson as the
  geometry bench, where a correct crown reads flat under a head-on beam.
  ⚠⚠ **AND TINT COMES FROM `attenuationColor`, NOT `color`:** once transmission is high, colour is
  absorbed through the VOLUME, so **thick parts tint more than thin.** ⛔ **This card's thickness
  varies by design** — crown thickest at the centre, nothing at the rim — **so attenuation gives a
  tint gradient that tracks the geometry for free.** Using `color` would give a flat wash and throw
  away the one optical property the crown was shaped to produce. ⚠ **`attenuationDistance` scales
  with the model, same trap as `thickness`.** ⛔ **The colour is undecided and is Carl's — it
  interacts with the neon, since the rim's hue passes through the glass and is attenuated by it.**
- ⚠ **Trim rejected the Architect's 8–12 screen-px target.** Computed against CD at a 390px window
  it demanded a bead of **15–22% of card height — a picture frame.** ⛔ **The shipped Q5 card's rim
  subtends 4px and reads.** Current: bead 2.2%, bevel 3.0% of height. **At 390px that is 2.8px —
  possibly too fine; the fix would be a floor on rendered size, not a bigger percentage.**

---

# ⚠ HOW TO USE THE BENCH — it is not obvious from the code

**`/proto/card`.** ⛔ **Start the server first; it was stopped at the end of this session and the
port verified free two ways.**

| control | what it does |
|---|---|
| **view** | oblique · face-on · **side elevation** · top elevation. ⚠ Opens on OBLIQUE deliberately — face-on flatters a crown |
| **height** | 400–1400mm. Every other dimension follows it |
| **aspect** | floor 2.026:1 · wall 1.615:1 |
| **crown** | ⚠ **a RATIO**, shown as % and mm. Moves the whole family at once |
| **oval** | ⛔ **the unresolved dial.** Below ~1.26 flat corners; above it the edges stand proud |
| **light** | 0–180°. ⛔ **SWEEP IT BEFORE JUDGING** — a correct crown reads FLAT head-on |
| **proxy behind** | the sampled room colour. ⚠ Auto-hides in the edge-on views |

⚠ **The readout prints MEASURED tilt (built normals) beside PREDICTED tilt (the formula) and flags
a disagreement over 2°.** ⛔ **Trust the measured one.** They currently agree within ~1°.

---

# ⚠ THREE UNTRACKED FILES, LEFT UNCOMMITTED ON PURPOSE

    brand-assets/Gemini_Generated_Image_v709qev709qev709.jpg   the REJECTED floor grid
    brand-assets/logo/c2b-logo-gold-relit-alpha-1671.png       predates this session
    brand-assets/logo/c2b-logo-gold-relit-source-1671.png      predates this session

⛔ **The Gemini image is a DISCREDITED test artefact** — floor lines bowing 25px, wrong aspect.
Committing it would put a failed reference in the repo looking like a resource. ⚠ **The two logo
PNGs are Carl's and predate this session; they are not mine to commit.**

---

# ⛔ WHAT THE NEXT SESSION SHOULD NOT DO

- ⛔ **Do not swap `insetDistance` back in** without Carl's word. It fixes the corners and caused the
  ridge; the trade is unresolved and he chose the current side of it.
- ⛔ **Do not "fix" the flat corners as if they were unknown.** They are a known, accepted fault.
- ⛔ **Do not trust `maxFaceTiltDegrees()`.** It changed four times in one day, each time edited to
  match the mesh.
- ⛔ **Do not re-derive the camera.** It is solved and falsified; the failure modes are recorded.
- ⛔ **Do not put a WebGL canvas on `/about`** until the §5a note is written and Carl has ruled.
- ⚠ **Do not read the plan without its review.**

---

*Written 11 September 2026. **The camera passes one independent test at 0.6°, and the card has a
shape Carl called "subtle" from three angles.*** ⚠⚠ **The next real step is Carl's eye on the oval
dial — and the §5a note, which now stands between the bench and the room.**
